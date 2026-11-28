"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { BASE_URL, BASE_URL2, GET_PHOTOGRAPHY_ORDER_DETAILS } from "../apiconstant/apiconstant";
import backIcon from "../assets/photographerprofile/back.svg";
import addIcon from "../assets/photographerprofile/addIcon.svg";
import ImageGrid from "../component/ImageComponents/ImageGrid";
import CommonImagePopup from "../component/ImageComponents/CommonImagePopup";
import { getSocket } from "../folderSocket";
import Layout from "./Layout";
import InclusionTabs from "./InclusionTab";


const IMAGE_CONCURRENCY = 3; 
const VIDEO_CONCURRENCY = 1; 
const CHUNK_SIZE = 25 * 1024 * 1024;
const VIDEO_CHUNK_CONCURRENCY = 3;
const MAX_RETRIES = 3;
const UPLOAD_WINDOW_DAYS = 4;
const PROCESSING_STALE_MS = 5 * 60 * 1000; 
const DAY_MS = 86400000;

const HIDDEN_TABS = ["Raw Photos", "Raw Video", "Album"];
const DEFAULT_TAB = "Color Corrected Photos";

const EMPTY_ARRAY = [];
const NOOP = () => { };

const MIME_BY_EXT = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
};


const toInclusionKey = (name) => {
    const value = String(name || "").replace(/\s+/g, "");

    if (value === "EditedVideo") {
        return "editedVideos";
    }

    return value.charAt(0).toLowerCase() + value.slice(1);
};
const isRawVideoClips = (inclusionType) => toInclusionKey(inclusionType) === "RawVideoClips";
const DEFAULT_TAB_KEY = toInclusionKey(DEFAULT_TAB);

const baseName = (k) => String(k || "").split("/").pop();

const getExtension = (fileName, fallback = "") => {
    const name = String(fileName || "");
    const idx = name.lastIndexOf(".");
    return idx !== -1 ? name.slice(idx).toLowerCase() : fallback;
};

const getContentType = (file) =>
    file.type || MIME_BY_EXT[getExtension(file.name)] || "application/octet-stream";

const isVideoFile = (file) => getContentType(file).startsWith("video/");

const generateUniqueId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const getSupplierID = () =>
    typeof window === "undefined" ? "" : localStorage.getItem("supplierID") || "";

const getAuthHeaders = () => ({
    Authorization:
        typeof window === "undefined" ? "" : localStorage.getItem("supplierToken") || "",
});

const runPool = async (items, limit, fn) => {
    if (!items.length) return;
    let cursor = 0;
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (cursor < items.length) {
                await fn(items[cursor++]);
            }
        })
    );
};

const putChunk = (url, blob, contentType, onProgress) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(e.loaded);
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.getResponseHeader("ETag"));
            } else {
                reject(new Error(`HTTP ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(blob);
    });

const putWithRetry = async (chunk, contentType, onProgress) => {
    for (let attempt = 0; ; attempt++) {
        try {
            return await putChunk(chunk.url, chunk.blob, contentType, onProgress);
        } catch (err) {
            if (attempt >= MAX_RETRIES) {
                throw new Error(`Part ${chunk.partNumber} failed: ${err.message}`);
            }
            onProgress(0);
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
    }
};

const UploadProgressCard = React.memo(function UploadProgressCard({
    total,
    completed,
    failed,
    finished,
    videoPercent,
    showVideoPercent,
}) {
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const successCount = completed - failed;

    return (
        <div
            style={{
                position: "fixed",
                left: "50%",
                bottom: "40px",
                transform: "translateX(-50%)",
                width: "280px",
                maxWidth: "92vw",
                boxSizing: "border-box",
                padding: "13px 16px",
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                }}
            >
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
                    {finished ? "✓ Upload done" : "Uploading files..."}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#97538C" }}>
                    {completed} / {total}
                </div>
            </div>

            <div
                style={{
                    width: "100%",
                    height: "5px",
                    background: "#eee",
                    borderRadius: "10px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: "#97538C",
                        borderRadius: "10px",
                        transition: "width 0.3s ease",
                    }}
                />
            </div>

            {showVideoPercent && videoPercent > 0 && videoPercent < 100 && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#97538C" }}>
                    Current video: {videoPercent}%
                </div>
            )}

            <div
                style={{
                    marginTop: "7px",
                    fontSize: "11px",
                    color: finished ? (failed > 0 ? "#dc3545" : "#2e9b61") : "#777",
                    fontWeight: finished ? 600 : 400,
                }}
            >
                {failed > 0
                    ? `${successCount} files uploaded, ${failed} failed`
                    : `${successCount} files uploaded`}
            </div>
        </div>
    );
});

const RawClipsGrid = React.memo(function RawClipsGrid({ clips, onSelect }) {
    if (!clips.length) return <p>No Raw Video Clips uploaded yet.</p>;

    return (
        <div className="raw-video-clips-grid">
            {clips.map((file) => {
                const src = file.fileUrl || file.previewUrl;
                const isVideo = file.fileType?.startsWith("video/");

                return (
                    <div
                        className="raw-video-card"
                        key={file._id || file.s3Key || file.id}
                        onClick={() => onSelect(file)}
                    >
                        <div className="raw-video-thumbnail" style={{ position: "relative" }}>
                            {isVideo ? (
                                <>
                                    <video src={src} preload="metadata" muted />
                                    <div className="raw-video-play">▶</div>
                                </>
                            ) : (
                                <img src={src} alt={file.fileName} />
                            )}

                            {file.uploading && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: "4px",
                                        background: "rgba(0,0,0,0.2)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${file.progress || 0}%`,
                                            height: "100%",
                                            background: "#97538C",
                                            transition: "width 0.3s ease",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

function RawClipModal({ file, onClose }) {
    if (!file) return null;
    const src = file.fileUrl || file.previewUrl;

    return (
        <div className="raw-video-modal-overlay" onClick={onClose}>
            <div className="raw-video-modal" onClick={(e) => e.stopPropagation()}>
                <button className="raw-video-close" onClick={onClose}>
                    ×
                </button>

                {file.fileType?.startsWith("video/") ? (
                    <video src={src} controls autoPlay playsInline className="raw-video-player" />
                ) : (
                    <img src={src} alt={file.fileName} className="raw-image-player" />
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ImageUpload({ orderId, customerId }) {
    const viewOnlyOrderId = Number(orderId) + 10800;

    const router = useRouter();
    const folderId = router.query.id;

    const fileInputRef = useRef(null);
    const blobUrlsRef = useRef(new Set());
    const lastSocketEventRef = useRef(Date.now());
    const refetchRef = useRef(null);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [orderDate, setOrderDate] = useState("");
    const [orderDateLoading, setOrderDateLoading] = useState(true);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [submittingDone, setSubmittingDone] = useState(false);
    const [customerPhone, setCustomerPhone] = useState("");
    const [apiId, setApiId] = useState("");
    const [inclusions, setInclusions] = useState({});
    const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
    const [processing, setProcessing] = useState({ active: false, total: 0, done: 0 });
    const [videoPercent, setVideoPercent] = useState(0);
    const [mainFolderId, setMainFolderId] = useState("");
    const [rawVideoClips, setRawVideoClips] = useState([]);
    const [selectedRawVideo, setSelectedRawVideo] = useState(null);
    const [uploadingRawClips, setUploadingRawClips] = useState([]);
    const [upload, setUpload] = useState({ visible: false, total: 0, completed: 0, failed: 0 });

    const s3FolderName = `${orderId}_${customerId}_${customerPhone}`;
    const orderDetailsBackLink = `/hora-partner/past-order-view-details?apiOrderId=${apiId}&orderType=8&orderId=${orderId}`;

    const busy = uploading || submittingDone || processing.active;
    const isRawClipsTab = isRawVideoClips(activeTab);


    const createTempUrl = useCallback((file) => {
        const url = URL.createObjectURL(file);
        blobUrlsRef.current.add(url);
        return url;
    }, []);

    const revokeTempUrl = useCallback((url) => {
        if (url && blobUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            blobUrlsRef.current.delete(url);
        }
    }, []);

    useEffect(() => {
        const urls = blobUrlsRef.current;
        return () => {
            urls.forEach((u) => URL.revokeObjectURL(u));
            urls.clear();
        };
    }, []);

    const updateClip = useCallback((id, patch) => {
        setUploadingRawClips((prev) =>
            prev.some((c) => c.id === id)
                ? prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
                : prev
        );
    }, []);

    // Temp items live in `thumbnails` (normal tabs) or `uploadingRawClips` (raw clips tab)
    const removeTemp = useCallback(
        (tempId) => {
            setThumbnails((prev) => {
                const target = prev.find((t) => t._id === tempId);
                if (!target) return prev;
                revokeTempUrl(target.thumbnailImageUrl);
                return prev.filter((t) => t._id !== tempId);
            });
            setUploadingRawClips((prev) => {
                const target = prev.find((c) => c.id === tempId);
                if (!target) return prev;
                revokeTempUrl(target.previewUrl);
                return prev.filter((c) => c.id !== tempId);
            });
        },
        [revokeTempUrl]
    );

    const markTempUploaded = useCallback(
        (tempId, key) => {
            setThumbnails((prev) =>
                prev.some((t) => t._id === tempId)
                    ? prev.map((t) => (t._id === tempId ? { ...t, uploading: false, key } : t))
                    : prev
            );
            updateClip(tempId, { uploading: false, progress: 100 });
        },
        [updateClip]
    );

    /* ---------------- popup handlers ---------------- */

    const closePopup = useCallback(() => setSelectedIndex(null), []);
    const handleImageClick = useCallback((index) => setSelectedIndex(index), []);
    const closeRawModal = useCallback(() => setSelectedRawVideo(null), []);

    /* ---------------- order details ---------------- */

    useEffect(() => {
        if (!orderId) return;

        const controller = new AbortController();

        (async () => {
            try {
                setOrderDateLoading(true);

                const response = await fetch(
                    BASE_URL + GET_PHOTOGRAPHY_ORDER_DETAILS + "/" + orderId,
                    { signal: controller.signal }
                );
                const responseData = await response.json();

                if (response.status === 200) {
                    const data = responseData?.data;
                    setOrderDate(data?.order_date || "");
                    setCustomerPhone(data?.phone_no || "");
                    setApiId(data?._id || "");
                    setInclusions(data?.call_checklist?.inclusions || {});
                } else {
                    setOrderDate("");
                    alert("Failed to fetch photography order details.");
                }
            } catch (error) {
                if (error.name === "AbortError") return;
                console.error("fetchPhotographyDetails error", error);
                setOrderDate("");
            } finally {
                if (!controller.signal.aborted) setOrderDateLoading(false);
            }
        })();

        return () => controller.abort();
    }, [orderId]);

    // Same list InclusionTabs renders; activeTab must always be one of them
    const availableTabs = useMemo(
        () =>
            Object.entries(inclusions)
                .filter(
                    ([name, value]) =>
                        value === true && !HIDDEN_TABS.includes(name)
                )
                .map(([name]) => name),
        [inclusions]
    );

    useEffect(() => {
        if (availableTabs.length && !availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0]);
        } else if (!availableTabs.length) {
            setActiveTab("");
        }
    }, [availableTabs, activeTab]);

    /* ---------------- upload window ---------------- */

    const daysPassed = useMemo(() => {
        if (!orderDate) return -1;
        const date = new Date(orderDate);
        if (Number.isNaN(date.getTime())) return -1;
        return Math.floor((new Date().setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / DAY_MS);
    }, [orderDate]);

    // Window is considered closed until the date has loaded (avoids UI flash)
    const isWithinUploadWindow = !orderDateLoading && daysPassed <= UPLOAD_WINDOW_DAYS;

    /* ---------------- fetch thumbnails ---------------- */

    const getSubFolderData = useCallback(
        async (silent = false) => {
            if (!folderId || !orderId || !customerId || !customerPhone) return;

            try {
                if (!silent) setLoading(true);

                const response = await fetch(
                    `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=${encodeURIComponent(
                        s3FolderName
                    )}`
                );
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.message || "Something went wrong");
                }

                const mainFolder = result?.folders?.[0];
                setMainFolderId(mainFolder?._id || "");
                setRawVideoClips(mainFolder?.rawVideoClips || []);

                const serverItems = result?.thumbnails || [];
                const serverIds = new Set(serverItems.map((t) => t.fileId));

                // Temp items still uploading/processing are not on the server yet, so keep them
                setThumbnails((prev) => [
                    ...prev.filter((t) => t.isTemp && !serverIds.has(baseName(t.key))),
                    ...serverItems,
                ]);
            } catch (error) {
                console.error("Error fetching subfolder:", error);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [folderId, orderId, customerId, customerPhone, s3FolderName]
    );

    refetchRef.current = getSubFolderData;

    useEffect(() => {
        if (!router.isReady || !isWithinUploadWindow) return;
        getSubFolderData();
    }, [router.isReady, isWithinUploadWindow, getSubFolderData]);

    /* ---------------- socket ---------------- */

    useEffect(() => {
        if (!folderId) return;
        const socket = getSocket();
        if (!socket) return;

        const sameFolder = (payload) =>
            !payload?.folderId || String(payload.folderId) === String(folderId);

        const touch = () => {
            lastSocketEventRef.current = Date.now();
        };

        const onStart = (payload) => {
            if (!sameFolder(payload)) return;
            touch();
            setProcessing({ active: true, total: payload?.total || 0, done: 0 });
        };

        const onDone = ({ folderId: eventFolderId, file } = {}) => {
            if (!file) return;

            const belongs =
                String(eventFolderId || "") === String(folderId) ||
                String(file.mainFolderId || "") === String(folderId);
            if (!belongs) return;

            touch();

            const real = {
                ...file,
                stableKey: file._id,
                thumbnailImageUrl: file.thumbnailImageUrl || file.originalUrl,
            };

            setThumbnails((prev) => {
                const idx = prev.findIndex(
                    (t) =>
                        t.fileId === file.fileId ||
                        (t.isTemp && t.key && baseName(t.key) === file.fileId)
                );

                if (idx !== -1) {
                    if (prev[idx].isTemp) revokeTempUrl(prev[idx].thumbnailImageUrl);
                    const next = [...prev];
                    next[idx] = { ...real, stableKey: prev[idx].stableKey || real.stableKey };
                    return next;
                }
                return [real, ...prev];
            });

            setProcessing((p) => (p.active ? { ...p, done: p.done + 1 } : p));
        };

        const onFailed = ({ folderId: eventFolderId, fileId } = {}) => {
            if (eventFolderId && String(eventFolderId) !== String(folderId)) return;
            touch();
            setThumbnails((prev) => {
                const removed = prev.filter((t) => t.isTemp && t.key && baseName(t.key) === fileId);
                if (!removed.length) return prev;
                removed.forEach((t) => revokeTempUrl(t.thumbnailImageUrl));
                return prev.filter((t) => !removed.includes(t));
            });
            setProcessing((p) => (p.active ? { ...p, done: p.done + 1 } : p));
        };

        const onFolderDone = (payload) => {
            if (!sameFolder(payload)) return;
            touch();
            setProcessing({ active: false, total: 0, done: 0 });
            refetchRef.current?.(true); // final sync with server
        };

        // Catch events missed while the socket was disconnected
        const onReconnect = () => refetchRef.current?.(true);

        socket.on("media:processing:start", onStart);
        socket.on("media:done", onDone);
        socket.on("media:failed", onFailed);
        socket.on("media:folder:done", onFolderDone);
        socket.on("connect", onReconnect);

        return () => {
            socket.off("media:processing:start", onStart);
            socket.off("media:done", onDone);
            socket.off("media:failed", onFailed);
            socket.off("media:folder:done", onFolderDone);
            socket.off("connect", onReconnect);
        };
    }, [folderId, revokeTempUrl]);

    // If the backend crashes, folder:done never arrives; don't leave the button disabled forever
    useEffect(() => {
        if (!processing.active) return;

        const id = setInterval(() => {
            if (Date.now() - lastSocketEventRef.current > PROCESSING_STALE_MS) {
                setProcessing({ active: false, total: 0, done: 0 });
                refetchRef.current?.(true);
            }
        }, 30000);

        return () => clearInterval(id);
    }, [processing.active]);

    /* ---------------- uploads ---------------- */

    const uploadSingleFile = useCallback(
        async (file, tempId, inclusionType) => {
            try {
                const contentType = getContentType(file);
                const uniqueFileName = `${folderId}_${generateUniqueId()}${getExtension(
                    file.name,
                    ".jpg"
                )}`;

                const { data } = await axios.post(
                    `${BASE_URL2}/get-event-capsule-presigned-url`,
                    {
                        fileName: uniqueFileName,
                        fileType: contentType,
                        folderName: isRawVideoClips(inclusionType) ? "rawVideoClips" : s3FolderName,
                        inclusionType,
                    },
                    { headers: getAuthHeaders() }
                );

                const { uploadURL, key } = data || {};
                if (!uploadURL || !key) throw new Error("Presigned URL not received");

                // These headers must match the signed headers of the presigned URL
                await axios.put(uploadURL, file, {
                    headers: {
                        "Content-Type": contentType,
                        "x-amz-meta-inclusiontype": inclusionType,
                    },
                });

                markTempUploaded(tempId, key);
                return { success: true, key };
            } catch (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                removeTemp(tempId);
                return { success: false };
            }
        },
        [folderId, s3FolderName, markTempUploaded, removeTemp]
    );

    const uploadSingleVideo = useCallback(
        async (file, tempId, inclusionType) => {
            try {
                const contentType = getContentType(file);
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                const uniqueFileName = `${folderId}_${generateUniqueId()}${getExtension(
                    file.name,
                    ".mp4"
                )}`;

                setVideoPercent(0);

                const { data: initData } = await axios.post(
                    `${BASE_URL2}/initiate`,
                    {
                        fileName: uniqueFileName,
                        fileType: contentType,
                        totalChunks,
                        folderName: isRawVideoClips(inclusionType) ? "rawVideoClips" : s3FolderName,
                        inclusionType,
                    },
                    { headers: getAuthHeaders() }
                );

                const { uploadId, key, presignedUrls } = initData || {};
                if (!uploadId || !key || !presignedUrls?.length) {
                    throw new Error("Failed to initiate upload");
                }

                const chunks = Array.from({ length: totalChunks }, (_, i) => {
                    const start = i * CHUNK_SIZE;
                    return {
                        partNumber: i + 1,
                        blob: file.slice(start, Math.min(start + CHUNK_SIZE, file.size)),
                        url: presignedUrls[i],
                    };
                });

                const loadedPerPart = {};
                const completedParts = [];
                let nextChunk = 0;
                let aborted = false;
                let lastPercent = -1;

                // xhr progress fires very often; only touch React state when the % changes
                const updateProgress = () => {
                    const totalLoaded = Object.values(loadedPerPart).reduce((a, b) => a + b, 0);
                    const pct = Math.min(Math.round((totalLoaded / file.size) * 100), 99);
                    if (pct === lastPercent) return;
                    lastPercent = pct;
                    setVideoPercent(pct);
                    updateClip(tempId, { progress: pct });
                };

                const chunkWorker = async () => {
                    while (!aborted && nextChunk < chunks.length) {
                        const chunk = chunks[nextChunk++];

                        try {
                            const eTag = await putWithRetry(chunk, contentType, (loaded) => {
                                loadedPerPart[chunk.partNumber] = loaded;
                                updateProgress();
                            });

                            if (!eTag) {
                                throw new Error("ETag missing (add ExposeHeaders: ETag in S3 CORS)");
                            }

                            loadedPerPart[chunk.partNumber] = chunk.blob.size;
                            updateProgress();

                            completedParts.push({
                                PartNumber: chunk.partNumber,
                                ETag: eTag.replace(/"/g, ""),
                            });
                        } catch (err) {
                            aborted = true; // stop the other workers too
                            throw err;
                        }
                    }
                };

                await Promise.all(
                    Array.from({ length: Math.min(VIDEO_CHUNK_CONCURRENCY, chunks.length) }, chunkWorker)
                );

                completedParts.sort((a, b) => a.PartNumber - b.PartNumber);

                await axios.post(
                    `${BASE_URL2}/complete`,
                    { uploadId, key, parts: completedParts },
                    { headers: getAuthHeaders() }
                );

                setVideoPercent(100);
                markTempUploaded(tempId, key);
                return { success: true, key };
            } catch (error) {
                console.error(`Video upload failed for ${file.name}:`, error);
                removeTemp(tempId);
                return { success: false };
            }
        },
        [folderId, s3FolderName, markTempUploaded, removeTemp, updateClip]
    );

    const handleDone = useCallback(
        async (uploadInclusionType) => {
            if (!getSupplierID() || !folderId) {
                alert("Supplier ID or folder missing.");
                return;
            }

            try {
                setSubmittingDone(true);

                const response = await axios.post(
                    `${BASE_URL2}/supplier-order-upload-done`,
                    {
                        folderName: s3FolderName,
                        userId: customerId,
                        orderId,
                        inclusionType: uploadInclusionType,
                    },
                    { headers: getAuthHeaders() }
                );

                if (!response.data?.success) {
                    alert(response.data?.message || "Failed to mark as done");
                }
                // No alert on success: the progress card shows "Upload done"
            } catch (error) {
                console.error("Done API error:", error);
                alert(error?.response?.data?.message || error?.message || "Something went wrong");
            } finally {
                setSubmittingDone(false);
            }
        },
        [folderId, s3FolderName, customerId, orderId]
    );

    const saveRawVideoClips = useCallback(
        async (uploadedRawFiles) => {
            try {
                setSubmittingDone(true);

                const response = await axios.post(
                    `${BASE_URL2}/save-raw-video-clips`,
                    { folderId: mainFolderId, files: uploadedRawFiles },
                    { headers: getAuthHeaders() }
                );

                if (!response.data?.success) {
                    alert(response.data?.message || "Failed to save Raw Video Clips");
                }
            } catch (error) {
                console.error("Save Raw Video Clips error:", error);
                alert(error?.response?.data?.message || "Failed to save Raw Video Clips");
            } finally {
                setSubmittingDone(false);
            }
        },
        [mainFolderId]
    );

    const handleFileSelect = useCallback(
        async (e) => {
            const input = e.target;
            const files = Array.from(input.files || []);
            if (!files.length) return;

            if (!isWithinUploadWindow) {
                alert("Upload access has expired.");
                input.value = "";
                return;
            }

            if (!getSupplierID()) {
                alert("Supplier ID not found. Please login again.");
                input.value = "";
                return;
            }

            const uploadInclusionType = toInclusionKey(activeTab);
            const rawTab = isRawVideoClips(uploadInclusionType);
            const stamp = Date.now();

            const tempItems = files.map((file, i) => {
                const url = createTempUrl(file);
                const isVideo = isVideoFile(file);
                const tempId = `temp_${stamp}_${i}_${generateUniqueId().slice(0, 8)}`;

                return {
                    _id: tempId,
                    stableKey: tempId,
                    file,
                    type: isVideo ? "video" : "image",
                    isTemp: true,
                    uploading: true,
                    thumbnailImageUrl: url,
                    originalUrl: url,
                    inclusionType: uploadInclusionType,
                    ...(isVideo ? { videoClipUrl: url } : {}),
                };
            });

            if (rawTab) {
                // Raw clips are shown in their own grid, not in the thumbnails list
                setUploadingRawClips((prev) => [
                    ...tempItems.map((t) => ({
                        id: t._id,
                        previewUrl: t.thumbnailImageUrl,
                        fileType: getContentType(t.file),
                        fileName: t.file.name,
                        progress: 0,
                        uploading: true,
                    })),
                    ...prev,
                ]);
            } else {
                setThumbnails((prev) => [...tempItems, ...prev]);
            }

            setUploading(true);
            setUpload({ visible: true, total: files.length, completed: 0, failed: 0 });

            let successCount = 0;
            const uploadedRawFiles = [];

            const processItem = async (item) => {
                const result =
                    item.type === "video"
                        ? await uploadSingleVideo(item.file, item._id, uploadInclusionType)
                        : await uploadSingleFile(item.file, item._id, uploadInclusionType);

                if (result.success) {
                    successCount++;
                    if (rawTab) {
                        uploadedRawFiles.push({
                            key: result.key,
                            fileName: item.file.name,
                            fileType: getContentType(item.file),
                        });
                    }
                }

                setUpload((prev) => ({
                    ...prev,
                    completed: prev.completed + 1,
                    failed: prev.failed + (result.success ? 0 : 1),
                }));
            };

            try {
                await runPool(
                    tempItems.filter((t) => t.type === "image"),
                    IMAGE_CONCURRENCY,
                    processItem
                );
                await runPool(
                    tempItems.filter((t) => t.type === "video"),
                    VIDEO_CONCURRENCY,
                    processItem
                );

                // If anything uploaded, trigger processing (one failure shouldn't strand the rest in S3)
                if (successCount > 0) {
                    if (rawTab) {
                        await saveRawVideoClips(uploadedRawFiles);
                        await refetchRef.current?.(true);
                    } else {
                        await handleDone(uploadInclusionType);
                    }
                }
            } finally {
                if (rawTab) {
                    // Server list now has these clips; drop the local previews
                    const ids = new Set(tempItems.map((t) => t._id));
                    setUploadingRawClips((prev) => {
                        prev.forEach((c) => ids.has(c.id) && revokeTempUrl(c.previewUrl));
                        return prev.filter((c) => !ids.has(c.id));
                    });
                }
                setUploading(false);
                setVideoPercent(0);
                input.value = "";
            }
        },
        [
            activeTab,
            isWithinUploadWindow,
            createTempUrl,
            revokeTempUrl,
            uploadSingleFile,
            uploadSingleVideo,
            handleDone,
            saveRawVideoClips,
        ]
    );

    /* ---------------- progress card ---------------- */

    const isFinished = upload.total > 0 && upload.completed === upload.total && !submittingDone;

    useEffect(() => {
        if (!isFinished) return;

        const timer = setTimeout(() => {
            setUpload({ visible: false, total: 0, completed: 0, failed: 0 });
        }, 3000);

        return () => clearTimeout(timer);
    }, [isFinished]);

    /* ---------------- visible lists ---------------- */

    const visibleThumbnails = useMemo(() => {
        if (!activeTab || !availableTabs.includes(activeTab)) {
            return [];
        }

        const activeKey = toInclusionKey(activeTab);

        return thumbnails.filter((item) => {
            if (!item.inclusionType) {
                return activeKey === DEFAULT_TAB_KEY;
            }

            return toInclusionKey(item.inclusionType) === activeKey;
        });
    }, [thumbnails, activeTab, availableTabs]);

    const allRawClips = useMemo(
        () => [...uploadingRawClips, ...rawVideoClips],
        [uploadingRawClips, rawVideoClips]
    );

    const itemCount = isRawClipsTab ? allRawClips.length : visibleThumbnails.length;

    /* ---------------- render ---------------- */

    return (
        <Layout backLink={orderDetailsBackLink}>
            <div className="subfolder-page">
                {/* <div className="subfolder-banner">
                    <img
                        src={backIcon.src}
                        alt="Back"
                        className="subfolder-back-icon"
                        onClick={() => router.push(orderDetailsBackLink)}
                    />
                    <h1 className="subfolder-title">{viewOnlyOrderId}</h1>
                </div> */}

                <div className="subfolder-banner">
                    <img
                        src={backIcon.src}
                        alt="Back"
                        className="subfolder-back-icon"
                        onClick={() => router.push(`/hora-partner/myProfile`)}
                    />

                    <img
                        src="/subFolderBanner.svg"
                        alt="Banner"
                        className="subfolder-banner-image"
                    />

                    <h1 className="subfolder-title">
                        {loading ? "" : subFolder?.folderName || ""}
                    </h1>
                </div>

                <div className="subfolder-content">
                    <div className="subfolder-photo-section">
                        {orderDateLoading ? (
                            <div className="subfolder-loader">
                                <div className="loader-circle"></div>
                            </div>
                        ) : !isWithinUploadWindow ? (
                            <div className="expiry-text">
                                <div>
                                    <h3>Upload Access Expired</h3>
                                    <p className="about-text">
                                        This order upload page is no longer available.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <InclusionTabs
                                    inclusions={inclusions}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    disabled={busy}
                                />

                                {availableTabs.length > 0 && activeTab && (

                                    <div className="subfolder-header-container">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                            style={{ display: "none" }}
                                        />

                                        <button
                                            type="button"
                                            className="subfolder-add-photos-btn"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={busy}
                                            style={{
                                                opacity: busy ? 0.6 : 1,
                                                cursor: busy ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            <img
                                                src={addIcon.src}
                                                alt="Add Photos"
                                                className="add-photos-icon"
                                                height={15}
                                                width={15}
                                            />
                                            <span>
                                                {uploading
                                                    ? "Uploading..."
                                                    : processing.active
                                                        ? `Processing ${processing.done}/${processing.total}`
                                                        : "Upload Photos"}
                                            </span>
                                        </button>

                                        <div className="total-photos">
                                            Total {itemCount} {isRawClipsTab ? "Files" : "Photos"}
                                        </div>
                                    </div>
                                )}

                                <div className="image-div" style={{ minHeight: "500px" }}>
                                    {isRawClipsTab ? (
                                        <div className="raw-video-clips-section">
                                            <RawClipsGrid
                                                clips={allRawClips}
                                                onSelect={setSelectedRawVideo}
                                            />
                                        </div>
                                    ) : visibleThumbnails.length > 0 ? (
                                        <ImageGrid
                                            data={visibleThumbnails}
                                            loading={loading}
                                            isEventWall={false}
                                            handleSelectImage={NOOP}
                                            handleImageClick={handleImageClick}
                                            isEditing={false}
                                            isSearchMode={false}
                                            activeSubFolderId={false}
                                            isActualMyPhotos={false}
                                            selectedImages={EMPTY_ARRAY}
                                            setSelectedImages={NOOP}
                                        />
                                    ) : (
                                        <div className="empty-iamges-text total-photos">
                                            No photos uploaded yet.
                                        </div>
                                    )}

                                    <RawClipModal file={selectedRawVideo} onClose={closeRawModal} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {upload.visible && (
                    <UploadProgressCard
                        total={upload.total}
                        completed={upload.completed}
                        failed={upload.failed}
                        finished={isFinished}
                        videoPercent={videoPercent}
                        showVideoPercent={uploading}
                    />
                )}

                <CommonImagePopup
                    images={visibleThumbnails}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    onClose={closePopup}
                    renderActions={() => null}
                    renderFooter={() => null}
                />
            </div>
        </Layout>
    );
}