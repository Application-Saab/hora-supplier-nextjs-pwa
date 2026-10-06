"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../../../component/Layout";
import { BASE_URL, BASE_URL2 } from "../../../../apiconstant/apiconstant";
import backIcon from "../../../../assets/photographerprofile/back.svg";
import addIcon from "../../../../assets/photographerprofile/addIcon.svg";
import ImageGrid from "../../../../component/ImageComponents/ImageGrid";
import CommonImagePopup from "../../../../component/ImageComponents/CommonImagePopup"
import multiGroup from "../../../../assets/photographerprofile/multiGroup.svg";
import Image from "next/image";

// Ek saath kitni files upload hongi
const CONCURRENCY = 1;

export default function SubFolder() {
    const router = useRouter();
    const folderId = router.query.id;
    const [selectedIndex, setSelectedIndex] = useState(null);
    const fileInputRef = useRef(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [subFolder, setSubFolder] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [upload, setUpload] = useState({
        visible: false,
        total: 0,
        completed: 0, // success + failed dono (progress bar ke liye)
        failed: 0,
    });

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

       const downloadFile = async (url) => {
    const fileWithExt = url.split("/").pop();

    const parts = fileWithExt.split("-");
    const ext = parts.pop();
    const filename = parts.join("-") + "." + ext;
    try {
      const response = await fetchWithError(url, { mode: "cors" });
      const blob = await response.blob();

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename || "downloaded-image.jpg";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

    const handleDownloadImage = async (currentImage) => {
        try {
            setShowActionMenu(false);
            await downloadFile(currentImage?.originalUrl);
            showSnackbar("Image downloaded successfully");
        } catch (err) {
            showSnackbar("Download failed");
        }
    };
    // Done button states
    const [pendingDone, setPendingDone] = useState(false); // kuch upload hua hai, Done dabana baaki hai
    const [submittingDone, setSubmittingDone] = useState(false);

    const getSupplierID = () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("supplierID") || "";
    };

    // =========================
    // GET SUBFOLDER DATA
    // silent = true -> full page loader nahi dikhana
    // =========================
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

    // =========================
    // SINGLE FILE UPLOAD (presigned URL -> S3)
    // =========================
    const uploadSingleFile = async (file, tempId) => {
        try {
            const token = localStorage.getItem("token");
            const supplierID = getSupplierID();

            const fileExtension = file.name.substring(file.name.lastIndexOf("."));

            const uniqueId = crypto.randomUUID
                ? crypto.randomUUID()
                : Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

            // const uniqueFileName = `${uniqueId}${fileExtension}`;
            const uniqueFileName = `${folderId}_${uniqueId}${fileExtension}`;

            // 1) Presigned URL lo
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

            // 2) Direct S3 upload
            await axios.put(uploadURL, file, {
                headers: { "Content-Type": file.type },
            });

            // 3) Upload ho gaya -> grid item ka loader hatao
            setThumbnails((prev) =>
                prev.map((t) =>
                    t._id === tempId ? { ...t, uploading: false, key } : t
                )
            );

            return { success: true, key };
        } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error);

            // Fail hua -> grid se hata do
            setThumbnails((prev) => prev.filter((t) => t._id !== tempId));

            return { success: false };
        }
    };

    // =========================
    // ADD PHOTOS -> file select -> upload
    // =========================
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const supplierID = getSupplierID();
        if (!supplierID) {
            alert("Supplier ID not found. Please login again.");
            e.target.value = "";
            return;
        }

        // Har file ka temp item (ImageGrid ke format me)
        const tempItems = files.map((file, i) => {
            const tempId = `temp_${Date.now()}_${i}`;
            const localUrl = URL.createObjectURL(file);

            return {
                _id: tempId,
                stableKey: tempId,
                file,
                type: "image",
                isTemp: true,
                uploading: true,
                thumbnailImageUrl: localUrl,
                originalUrl: localUrl,
            };
        });

        // Grid me sabse upar turant dikhao
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

                const result = await uploadSingleFile(item.file, item._id);

                if (result.success) setPendingDone(true);

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
            e.target.value = "";
        }
    };

    // =========================
    // DONE BUTTON -> supplier-upload-done API
    // =========================
    const handleDone = async () => {
        const supplierID = getSupplierID();

        if (!supplierID || !folderId) {
            alert("Supplier ID or folder missing.");
            return;
        }

        try {
            setSubmittingDone(true);

            const token = localStorage.getItem("token");

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
                // Done ho gaya, button hata do
                setPendingDone(false);
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

    // =========================
    // LOADER VALUES
    // =========================
    const { total, completed, failed } = upload;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const isFinished = total > 0 && completed === total;
    const successCount = completed - failed;

    // Upload done hone ke 3 second baad popup apne aap band
    useEffect(() => {
        if (!isFinished) return;

        const timer = setTimeout(() => {
            setUpload({ visible: false, total: 0, completed: 0, failed: 0 });
        }, 3000);

        return () => clearTimeout(timer);
    }, [isFinished]);


    const visibleThumbnails = useMemo(() => {
        if (folderId) {
            return thumbnails.filter(
                (img) =>
                    img.folderIds?.includes(folderId) 
            );
        }

        return thumbnails;
    }, [
        thumbnails,
        folderId,
    ]);

    const popupImages = useMemo(() => {
        return visibleThumbnails;
    }, [visibleThumbnails]); 

    return (
        <Layout backLink="/myProfile">
            <div className="subfolder-page">
                <div className="subfolder-banner">
                    {/* Back Icon */}
                    <img
                        src={backIcon.src}
                        alt="Back"
                        className="subfolder-back-icon"
                        onClick={() => router.push(`/myProfile`)}
                    />

                    {/* Subfolder Name */}
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
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
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
                                                uploading || submittingDone ? "not-allowed" : "pointer",
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

                                    {/* Done button */}
                                    {pendingDone && (
                                        <button
                                            type="button"
                                            onClick={handleDone}
                                            disabled={uploading || submittingDone}
                                            style={{
                                                marginLeft: "10px",
                                                padding: "8px 18px",
                                                borderRadius: "6px",
                                                border: "none",
                                                backgroundColor: "#8B5A8C",
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
                                    )}

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

                {/* =========================
                    UPLOAD PROGRESS POPUP
                    page ke bottom se 40px upar
                ========================= */}
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
                        {/* Top row: title + count */}
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
                                {isFinished ? "✓ Upload done" : "Uploading images..."}
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

                        {/* Progress bar */}
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

                        {/* Status text */}
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
                                ? `${successCount} images uploaded, ${failed} failed`
                                : `${successCount} images uploaded`}
                        </div>
                    </div>
                )}


                <CommonImagePopup
                    images={popupImages}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    onClose={closePopup}
                    // renderActions={(currentImage, index) => (
                    //     <div>
                    //         <div style={{ position: "relative" }}>
                    //             <Image
                    //                 src={multiGroup}
                    //                 alt="More"
                    //                 width={25}
                    //                 height={25}
                    //                 onClick={() => setShowActionMenu((prev) => !prev)}
                    //             />

                    //             {showActionMenu && (
                    //                 <div className="action-menu" ref={actionMenuRef}>
                    //                     <div className="action-item">
                    //                         <strong>Shared by:</strong>
                    //                         <p>{number}</p>
                    //                     </div>

                    //                     <div className="action-inner-container">
                    //                         <div
                    //                             className="action-item flex"
                    //                             onClick={() => {
                    //                                 if (!currentImage) return;
                    //                                 setFolderSelection(currentImage.folderIds || []);
                    //                                 setInitialPopupFolders(currentImage.folderIds || []);
                    //                                 setShowAddToFolderPopup(true);
                    //                                 setShowActionMenu(false);
                    //                             }}
                    //                         >
                    //                             <Image src={plusVector} width={19} height={15} />
                    //                             <span>Add to Folder</span>
                    //                         </div>
                    //                         {currentImage?.type !== "video" && (
                    //                             <div
                    //                                 className="action-item flex"
                    //                                 onClick={() => {
                    //                                     const current = popupImages[selectedIndex];
                    //                                     handleDownloadImage(current);
                    //                                 }}
                    //                             >
                    //                                 <Image src={downloadVector} width={19} height={15} />
                    //                                 <span>Download</span>
                    //                             </div>
                    //                         )}

                    //                         <div
                    //                             onClick={() => {
                    //                                 const current = popupImages[selectedIndex];
                    //                                 if (!current) return;
                    //                                 handleImageShare(current?.originalUrl, current?._id);
                    //                                 setShowActionMenu(false);
                    //                             }}
                    //                             className="action-item flex gallery-share-icon"
                    //                         >
                    //                             <Image src={shareVector} width={19} height={15} />
                    //                             <span>Share</span>
                    //                         </div>
                    //                         {String(rawPhoneNumber) === String(localPhoneNumber) && (
                    //                             <div
                    //                                 className="action-item flex"
                    //                                 onClick={async () => {
                    //                                     const currentImage = popupImages[selectedIndex];
                    //                                     if (!currentImage?._id) return;

                    //                                     if (
                    //                                         !window.confirm(
                    //                                             "Are you sure you want to delete this image?",
                    //                                         )
                    //                                     )
                    //                                         return;

                    //                                     try {
                    //                                         const res = await fetchWithError(
                    //                                             `${MEDIA_WORKER_URL}/delete-image/${currentImage._id}`,
                    //                                             {
                    //                                                 method: "DELETE",
                    //                                             },
                    //                                         );

                    //                                         if (!res.ok) {
                    //                                             const err = await res.text();
                    //                                             throw new Error(err);
                    //                                         }

                    //                                         setAllThumbnails((prev) => {
                    //                                             const newList = prev.filter(
                    //                                                 (img) => img._id !== currentImage._id,
                    //                                             );
                    //                                             if (newList.length === 0) {
                    //                                                 setSelectedIndex(null);
                    //                                             } else if (selectedIndex >= newList.length) {
                    //                                                 setSelectedIndex(newList.length - 1);
                    //                                             } else {
                    //                                                 setSelectedIndex(selectedIndex);
                    //                                             }
                    //                                             return newList;
                    //                                         });

                    //                                         setShowActionMenu(false);
                    //                                     } catch (err) {
                    //                                         console.error("Delete failed:", err);
                    //                                         alert("Failed to delete image");
                    //                                     }
                    //                                 }}
                    //                             >
                    //                                 <Image src={deleteVector} width={19} height={15} />
                    //                                 <span>Delete</span>
                    //                             </div>
                    //                         )}
                    //                     </div>
                    //                 </div>
                    //             )}
                    //         </div>
                    //     </div>
                    // )}
                    renderActions={() => null}
                    renderFooter={() => null}
                />
            </div>
        </Layout>
    );
}