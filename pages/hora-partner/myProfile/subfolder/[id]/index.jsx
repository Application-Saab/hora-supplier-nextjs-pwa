"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../../../../component/Layout";
import {BASE_URL,BASE_URL2} from "../../../../../apiconstant/apiconstant";
import backIcon from "../../../../../assets/photographerprofile/back.svg";
import addIcon from "../../../../../assets/photographerprofile/addIcon.svg";
import ImageGrid from "../../../../../component/ImageComponents/ImageGrid";
import CommonImagePopup from "../../../../../component/ImageComponents/CommonImagePopup";
import { getSocket } from "../../../../../folderSocket";

const CONCURRENCY = 1;

const CHUNK_SIZE = 25 * 1024 * 1024;
const VIDEO_CHUNK_CONCURRENCY = 3;
const MAX_RETRIES = 3;

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

const generateUniqueId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const getExtension = (fileName) => {
    const idx = fileName.lastIndexOf(".");
    return idx !== -1 ? fileName.slice(idx).toLowerCase() : ".mp4";
};

const baseName = (k) => String(k || "").split("/").pop();

export default function SubFolder() {
    const router = useRouter();
    const folderId = router.query.id;
    const [selectedIndex, setSelectedIndex] = useState(null);
    const fileInputRef = useRef(null);
    const [subFolder, setSubFolder] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState({ active: false, total: 0, done: 0 });
    const [upload, setUpload] = useState({
        visible: false,
        total: 0,
        completed: 0,
        failed: 0,
    });

    const [videoPercent, setVideoPercent] = useState(0);
    const closePopup = useCallback(() => {
        setSelectedIndex(null);
    }, []);

    const handleImageClick = useCallback((indexInDisplayedList) => {
        setSelectedIndex(indexInDisplayedList);
    }, []);

    const handleSelectImage = (id) => {
        if (selectedImages.includes(id)) {
            setSelectedImages((prev) => prev.filter((item) => item !== id));
        } else {
            setSelectedImages((prev) => [...prev, id]);
        }
    };

    const [submittingDone, setSubmittingDone] = useState(false);

    const getSupplierID = () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("supplierID") || "";
    };

    const getSubFolderData = useCallback(
        async (silent = false) => {
            if (!folderId) return;

            const supplierID = getSupplierID();

            try {
                if (!silent) setLoading(true);

                const response = await fetch(
                    `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=recentWork_${supplierID}&subFolderId=${folderId}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.message || "Something went wrong");
                }

                const selectedSubFolder = result?.folders?.[0]?.subFolders?.find(
                    (item) => String(item._id) === String(folderId)
                );

                setSubFolder(selectedSubFolder || null);
                setThumbnails(result?.thumbnails || []);
            } catch (error) {
                console.error("Error fetching subfolder:", error);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [folderId]
    );

    useEffect(() => {
        if (!router.isReady || !folderId) return;
        getSubFolderData();
    }, [router.isReady, folderId, getSubFolderData]);


    useEffect(() => {
        if (!folderId) return;
        const socket = getSocket();
        if (!socket) return;

        const onStart = ({ total }) => {
            setProcessing({ active: true, total, done: 0 });
        };

        const onDone = ({ subFolderId, file }) => {
            if (!file) return;

            const belongs =
                String(subFolderId || "") === String(folderId) ||
                (Array.isArray(file.folderIds) && file.folderIds.map(String).includes(String(folderId)));
            if (!belongs) return;

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
                    const next = [...prev];
                    next[idx] = { ...real, stableKey: prev[idx].stableKey || real.stableKey };
                    return next;
                }
                return [real, ...prev];
            });

        };

        const onFailed = ({ fileId }) => {
            setThumbnails((prev) =>
                prev.filter((t) => !(t.isTemp && t.key && baseName(t.key) === fileId))
            );
        };

        const onFolderDone = () => {
            setProcessing({ active: false, total: 0, done: 0 });
        };

        socket.on("media:processing:start", onStart);
        socket.on("media:done", onDone);
        socket.on("media:failed", onFailed);
        socket.on("media:folder:done", onFolderDone);

        return () => {
            socket.off("media:processing:start", onStart);
            socket.off("media:done", onDone);
            socket.off("media:failed", onFailed);
            socket.off("media:folder:done", onFolderDone);
        };
    }, [folderId]);

    const uploadSingleFile = async (file, tempId) => {
        try {
            const token = localStorage.getItem("supplierToken");
            const supplierID = getSupplierID();

            const fileExtension = file.name.substring(file.name.lastIndexOf("."));

            const uniqueId = generateUniqueId();

            const uniqueFileName = `${folderId}_${uniqueId}${fileExtension}`;

            const response = await axios.post(
                `${BASE_URL2}/get-event-capsule-presigned-url`,
                {
                    fileName: uniqueFileName,
                    fileType: file.type,
                    folderName: `recentWork_${supplierID}`,
                },
                { headers: { Authorization: `${token}` } }
            );

            const { uploadURL, key } = response.data;

            if (!uploadURL || !key) {
                throw new Error("Presigned URL not received");
            }

            await axios.put(uploadURL, file, {
                headers: { "Content-Type": file.type },
            });

            setThumbnails((prev) =>
                prev.map((t) =>
                    t._id === tempId ? { ...t, uploading: false, key } : t
                )
            );

            return { success: true, key };
        } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error);
            setThumbnails((prev) => prev.filter((t) => t._id !== tempId));

            return { success: false };
        }
    };
    const uploadSingleVideo = async (file, tempId) => {
        try {
            const supplierID = getSupplierID();
            const contentType = file.type || "video/mp4";
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            const uniqueFileName = `${folderId}_${generateUniqueId()}${getExtension(
                file.name
            )}`;

            setVideoPercent(0);

            const initiateRes = await fetch(`${BASE_URL2}/initiate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: uniqueFileName,
                    fileType: contentType,
                    totalChunks,
                    folderName: `recentWork_${supplierID}`,
                }),
            });

            if (!initiateRes.ok) throw new Error("Failed to initiate upload");

            const { uploadId, key, presignedUrls } = await initiateRes.json();

            const chunks = [];
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                chunks.push({
                    partNumber: i + 1,
                    blob: file.slice(start, end),
                    url: presignedUrls[i],
                });
            }

            const loadedPerPart = {};
            const completedParts = [];
            let nextChunk = 0;

            const updateProgress = () => {
                const totalLoaded = Object.values(loadedPerPart).reduce(
                    (a, b) => a + b,
                    0
                );
                setVideoPercent(
                    Math.min(Math.round((totalLoaded / file.size) * 100), 99)
                );
            };

            const chunkWorker = async () => {
                while (nextChunk < chunks.length) {
                    const chunk = chunks[nextChunk++];

                    const eTag = await putWithRetry(chunk, contentType, (loaded) => {
                        loadedPerPart[chunk.partNumber] = loaded;
                        updateProgress();
                    });

                    loadedPerPart[chunk.partNumber] = chunk.blob.size;
                    updateProgress();

                    completedParts.push({
                        PartNumber: chunk.partNumber,
                        ETag: eTag ? eTag.replace(/"/g, "") : "",
                    });
                }
            };

            await Promise.all(
                Array.from(
                    { length: Math.min(VIDEO_CHUNK_CONCURRENCY, chunks.length) },
                    chunkWorker
                )
            );

            completedParts.sort((a, b) => a.PartNumber - b.PartNumber);

            const completeRes = await fetch(`${BASE_URL2}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uploadId, key, parts: completedParts }),
            });

            if (!completeRes.ok) throw new Error("Failed to complete upload");

            setVideoPercent(100);

            setThumbnails((prev) =>
                prev.map((t) =>
                    t._id === tempId ? { ...t, uploading: false, key } : t
                )
            );

            return { success: true, key };
        } catch (error) {
            console.error(`Video upload failed for ${file.name}:`, error);

            setThumbnails((prev) => prev.filter((t) => t._id !== tempId));

            return { success: false };
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const supplierID = getSupplierID();
        if (!supplierID) {
            alert("Supplier ID not found. Please login again.");
            e.target.value = "";
            return;
        }

        const tempItems = files.map((file, i) => {
            const tempId = `temp_${Date.now()}_${i}`;
            const localUrl = URL.createObjectURL(file);
            const isVideo = file.type.startsWith("video/");

            return {
                _id: tempId,
                stableKey: tempId,
                file,
                type: isVideo ? "video" : "image",
                isTemp: true,
                uploading: true,
                thumbnailImageUrl: localUrl,
                originalUrl: localUrl,
                ...(isVideo ? { videoClipUrl: localUrl } : {}),
            };
        });

        setThumbnails((prev) => [...tempItems, ...prev]);

        setUploading(true);
        setUpload({
            visible: true,
            total: files.length,
            completed: 0,
            failed: 0,
        });

        let nextIndex = 0;

        const worker = async () => {
            while (nextIndex < tempItems.length) {
                const index = nextIndex++;
                const item = tempItems[index];

                const result =
                    item.type === "video"
                        ? await uploadSingleVideo(item.file, item._id)
                        : await uploadSingleFile(item.file, item._id);

                

                setUpload((prev) => ({
                    ...prev,
                    completed: prev.completed + 1,
                    failed: prev.failed + (result.success ? 0 : 1),
                }));
            }
        };

        try {
            await Promise.all(
                Array.from({ length: Math.min(CONCURRENCY, tempItems.length) }, () =>
                    worker()
                )
            );
        } finally {
            setUploading(false);
            setVideoPercent(0);
            e.target.value = "";
        }
    };

    const handleDone = async () => {
        const supplierID = getSupplierID();

        if (!supplierID || !folderId) {
            alert("Supplier ID or folder missing.");
            return;
        }

        try {
            setSubmittingDone(true);

            const token = localStorage.getItem("supplierToken");

            const response = await axios.post(
                `${BASE_URL2}/supplier-upload-done`,
                {
                    folderName: `recentWork_${supplierID}`,
                    userId: supplierID,
                    subFolderId: folderId,
                },
                { headers: { Authorization: `${token}` } }
            );

            if (response.data?.success) {
                alert(response.data?.message || "Upload completed successfully.");
                setUpload({ visible: false, total: 0, completed: 0, failed: 0 });
            } else {
                alert(response.data?.message || "Failed to mark as done");
            }
        } catch (error) {
            console.error("Done API error:", error);
            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        } finally {
            setSubmittingDone(false);
        }
    };

    const { total, completed, failed } = upload;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const isFinished = total > 0 && completed === total;
    const successCount = completed - failed;

    useEffect(() => {
        if (!isFinished) return;

        const timer = setTimeout(() => {
            setUpload({ visible: false, total: 0, completed: 0, failed: 0 });
        }, 3000);

        return () => clearTimeout(timer);
    }, [isFinished]);

    const visibleThumbnails = useMemo(() => {
        if (folderId) {
            return thumbnails.filter((img) => img.folderIds?.includes(folderId));
        }

        return thumbnails;
    }, [thumbnails, folderId]);

    const popupImages = useMemo(() => {
        return visibleThumbnails;
    }, [visibleThumbnails]);

    return (
        <Layout backLink="/hora-partner/myProfile">
            <div className="subfolder-page">
                <div className="subfolder-banner">
                    <img
                        src={backIcon.src}
                        alt="Back"
                        className="subfolder-back-icon"
                        onClick={() => router.push(`/hora-partner/myProfile`)}
                    />

                    <h1 className="subfolder-title">
                        {loading ? "" : subFolder?.folderName || ""}
                    </h1>
                </div>

                <div className="subfolder-content">
                    <div className="subfolder-photo-section">
                        {loading ? (
                            <div className="subfolder-loader">
                                <div className="loader-circle"></div>
                            </div>
                        ) : (
                            <>
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
                                        disabled={uploading || submittingDone}
                                        style={{
                                            opacity: uploading || submittingDone ? 0.6 : 1,
                                            cursor:
                                                uploading || submittingDone
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        <img
                                            src={addIcon.src}
                                            alt="Add Photos"
                                            className="add-photos-icon"
                                            height={15}
                                            width={15}
                                        />
                                        <span>{uploading ? "Uploading..." : "Add Photos"}</span>
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleDone}
                                        disabled={uploading || submittingDone}
                                        style={{
                                            marginLeft: "10px",
                                            padding: "8px 18px",
                                            borderRadius: "6px",
                                            border: "none",
                                            backgroundColor: "#97538C",
                                            color: "#fff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            opacity: uploading || submittingDone ? 0.6 : 1,
                                            cursor:
                                                uploading || submittingDone
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        {submittingDone ? "Processing..." : "Done"}
                                    </button>


                                    <div className="total-photos">
                                        Total {thumbnails.length || 0} Photos
                                    </div>
                                </div>

                                <div className="image-div" style={{ minHeight: "500px" }}>
                                    {thumbnails.length > 0 ? (
                                        <ImageGrid
                                            data={thumbnails}
                                            loading={loading}
                                            isEventWall={false}
                                            handleSelectImage={handleSelectImage}
                                            handleImageClick={(indexOnPage) =>
                                                handleImageClick(indexOnPage)
                                            }
                                            isEditing={false}
                                            isSearchMode={false}
                                            activeSubFolderId={false}
                                            isActualMyPhotos={false}
                                            selectedImages={[]}
                                            setSelectedImages={() => { }}
                                        />
                                    ) : (
                                        <div className="empty-iamges-text total-photos">
                                            No any photos uploaded yet..
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {upload.visible && (
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
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#333",
                                }}
                            >
                                {isFinished ? "✓ Upload done" : "Uploading files..."}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#97538C",
                                }}
                            >
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

                        {uploading && videoPercent > 0 && videoPercent < 100 && (
                            <div
                                style={{
                                    marginTop: "6px",
                                    fontSize: "11px",
                                    color: "#97538C",
                                }}
                            >
                                Current video: {videoPercent}%
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: "7px",
                                fontSize: "11px",
                                color: isFinished
                                    ? failed > 0
                                        ? "#dc3545"
                                        : "#2e9b61"
                                    : "#777",
                                fontWeight: isFinished ? 600 : 400,
                            }}
                        >
                            {failed > 0
                                ? `${successCount} files uploaded, ${failed} failed`
                                : `${successCount} files uploaded`}
                        </div>
                    </div>
                )}

                <CommonImagePopup
                    images={popupImages}
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