import React, { useEffect, useState } from "react";
import axios from "axios";

const CapsuleUpload = ({ galleryDetails = {} }) => {
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [eventCapsuleFiles, setEventCapsuleFiles] = useState([]);
    const [loadingS3Files, setLoadingS3Files] = useState(false);
    const [deletingFile, setDeletingFile] = useState(null);

    // =========================
    // GET S3 FOLDER FILES
    // =========================
    const getS3FolderFiles = async () => {
        if (!galleryDetails?.folderName) {
            setEventCapsuleFiles([]);
            return;
        }

        try {
            setLoadingS3Files(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:4000/get-s3-folder-images`,
{
    params: {
        folderName: galleryDetails.folderName,
                    },
    headers: {
        Authorization: `${token}`,
                    },
}
            );

const files = response?.data?.data || [];

const formattedFiles = files.map((item) => ({
    fileName: item.fileName,
    fileType: item.fileName?.match(/\.(mp4|mov|avi|webm|mkv)$/i)
        ? `video/${item.fileName.split(".").pop()}`
        : `image/${item.fileName.split(".").pop()}`,

    preview: item.url,
    originalUrl: item.url,
    key: item.key,

    progress: 100,
    status: "uploaded",

    // Important: this tells us this file already existed in S3
    isExisting: true,
}));

setEventCapsuleFiles(formattedFiles);
        } catch (error) {
    console.error("Failed to get S3 folder files:", error);
} finally {
    setLoadingS3Files(false);
}
    };

// =========================
// GET EXISTING FILES
// =========================
useEffect(() => {
    getS3FolderFiles();
}, [galleryDetails?.folderName]);

// =========================
// UPLOAD FILE
// =========================
const uploadEventCapsuleFile = async (file, index) => {
    try {
        const token = localStorage.getItem("token");

        // Get presigned URL
        const response = await axios.post(
            `http://localhost:4000/get-event-capsule-presigned-url`,
            {
                fileName: file.name,
                fileType: file.type,
                folderName: galleryDetails?.folderName,
            },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );

        const { uploadURL, key } = response.data;

        if (!uploadURL || !key) {
            throw new Error("Presigned URL not received");
        }

        setEventCapsuleFiles((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        status: "uploading",
                        progress: 0,
                    }
                    : item
            )
        );

        // Direct S3 upload
        await axios.put(uploadURL, file, {
            headers: {
                "Content-Type": file.type,
            },
            onUploadProgress: (progressEvent) => {
                if (!progressEvent.total) return;

                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );

                setEventCapsuleFiles((prev) =>
                    prev.map((item, i) =>
                        i === index
                            ? {
                                ...item,
                                progress: percent,
                            }
                            : item
                    )
                );
            },
        });

        const originalUrl =
            `https://photography-hora.s3.eu-north-1.amazonaws.com/${key}`;

        setEventCapsuleFiles((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        status: "uploaded",
                        progress: 100,
                        key,
                        originalUrl,
                        preview: originalUrl,
                        isExisting: true,
                    }
                    : item
            )
        );

        return {
            success: true,
            key,
            originalUrl,
        };
    } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);

        setEventCapsuleFiles((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        status: "failed",
                        progress: 0,
                        error:
                            error?.response?.data?.message ||
                            error?.message ||
                            "Upload failed",
                    }
                    : item
            )
        );

        return {
            success: false,
            error:
                error?.response?.data?.message ||
                error?.message ||
                "Upload failed",
        };
    }
};

// =========================
// SELECT + UPLOAD FILES
// =========================
const handleEventCapsuleUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (!galleryDetails?.folderName) {
        alert("Event Capsule folder not found.");
        return;
    }

    const selectedFiles = files.map((file) => ({
        file,
        fileName: file.name,
        fileType: file.type,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
        isExisting: false,
    }));

    // Keep existing S3 files and add new files
    setEventCapsuleFiles((prev) => [
        ...selectedFiles,
        ...prev,
    ]);

    setUploadingFiles(true);

    try {
        // New files start after existing files
        for (let i = 0; i < selectedFiles.length; i++) {
            await uploadEventCapsuleFile(
                selectedFiles[i].file,
                i
            );
        }
    } catch (error) {
        console.error("Event Capsule upload error:", error);
    } finally {
        setUploadingFiles(false);
        e.target.value = "";
    }
};

// =========================
// DELETE S3 FILE
// =========================
const handleDeleteS3File = async (item, index) => {
    if (!item?.key) {
        console.error("S3 key not found");
        return;
    }

    try {
        setDeletingFile(index);

        const token = localStorage.getItem("token");

        await axios.delete(
            `http://localhost:4000/delete-s3-image`,
            {
                headers: {
                    Authorization: `${token}`,
                },
                data: {
                    key: item.key,
                },
            }
        );

        // Remove from UI after successful S3 deletion
        setEventCapsuleFiles((prev) =>
            prev.filter((_, i) => i !== index)
        );

    } catch (error) {
        console.error("S3 delete failed:", error);

        alert(
            error?.response?.data?.message ||
            error?.message ||
            "Failed to delete image"
        );
    } finally {
        setDeletingFile(null);
    }
};

return (
    <div className="actual-image-container">

        {!galleryDetails?.folderName ? (
            <div
                style={{
                    color: "#dc3545",
                    fontSize: "13px",
                    marginTop: "8px",
                }}
            >
                ✗ Event Capsule folder not found
            </div>
        ) : (
            <>
                {/* Upload Area */}
                    <div style={{marginTop:"20px"}}>
                        <input
                            type="file"
                            id="eventCapsuleUpload"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleEventCapsuleUpload}
                            disabled={uploadingFiles}
                            style={{ display: "none" }}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                document.getElementById("eventCapsuleUpload")?.click()
                            }
                            disabled={uploadingFiles}
                            style={{
                                padding: "10px 18px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#007BFF",
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: uploadingFiles ? "not-allowed" : "pointer",
                                opacity: uploadingFiles ? 0.7 : 1,
                            }}
                        >
                            {uploadingFiles ? "Uploading..." : "Upload Images / Videos"}
                        </button>
                    </div>

                {/* Loading S3 */}
                {loadingS3Files && (
                    <div
                        style={{
                            marginTop: "15px",
                            fontSize: "13px",
                            color: "#64748b",
                        }}
                    >
                        Loading existing files...
                    </div>
                )}

                {/* Files */}
                {eventCapsuleFiles?.length > 0 && (
                    <div
                        style={{
                            marginTop: "20px",
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {eventCapsuleFiles.map((item, index) => (
                            <div
                                key={`${item.key || item.fileName}-${index}`}
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    borderRadius: "8px",
                                    border:
                                        "1px solid #cbd5e1",
                                    backgroundColor:
                                        "#f1f5f9",
                                    overflow: "hidden",
                                }}
                            >
                                {/* IMAGE / VIDEO */}
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "hidden",
                                        borderRadius: "8px",
                                    }}
                                >
                                    {item.fileType?.startsWith(
                                        "video/"
                                    ) ? (
                                        <video
                                            src={item.preview}
                                            muted
                                            playsInline
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={item.preview}
                                            alt={item.fileName}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}
                                </div>

                                {/* DELETE CROSS */}
                                {/* DELETE CROSS - TOP RIGHT */}
                                {item.status === "uploaded" && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteS3File(item, index)}
                                        disabled={deletingFile === index}
                                        style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            border: "none",
                                            backgroundColor: "rgba(0,0,0,0.65)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: deletingFile === index
                                                ? "not-allowed"
                                                : "pointer",
                                            fontSize: "16px",
                                            lineHeight: "1",
                                            zIndex: 10,
                                            padding: 0,
                                        }}
                                    >
                                        {deletingFile === index ? "..." : "×"}
                                    </button>
                                )}

                                {/* STATUS - BOTTOM */}
                                {/* STATUS - BOTTOM */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "6px",
                                        left: "6px",
                                        right: "6px",
                                        zIndex: 5,
                                        padding: "4px 5px",
                                        borderRadius: "5px",
                                        fontSize: "9px",
                                        fontWeight: "600",
                                        color: "#fff",
                                        backgroundColor:
                                            item.status === "uploaded"
                                                ? "#28a745"
                                                : item.status === "failed"
                                                    ? "#dc3545"
                                                    : item.status === "uploading"
                                                        ? "#007BFF"
                                                        : "#64748b",
                                        textAlign: "center",

                                        // IMPORTANT
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {item.status === "pending" &&
                                        `${item.fileType?.startsWith("video/")
                                            ? "Video"
                                            : "Image"
                                        } - Pending`}

                                    {item.status === "uploading" &&
                                        `${item.fileType?.startsWith("video/")
                                            ? "Video"
                                            : "Image"
                                        } - Uploading ${item.progress || 0}%`}

                                    {item.status === "uploaded" &&
                                        `${item.fileType?.startsWith("video/")
                                            ? "Video"
                                            : "Image"
                                        } - Uploaded`}

                                    {item.status === "failed" &&
                                        `${item.fileType?.startsWith("video/")
                                            ? "Video"
                                            : "Image"
                                        } - Failed`}
                                </div>

                                {/* PROGRESS */}
                                {item.status === "uploading" && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "38px",
                                            left: "7px",
                                            right: "7px",
                                            height: "4px",
                                            backgroundColor: "rgba(255,255,255,0.6)",
                                            borderRadius: "5px",
                                            overflow: "hidden",
                                            zIndex: 5,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${item.progress || 0}%`,
                                                height: "100%",
                                                backgroundColor: "#007BFF",
                                                transition: "width 0.2s ease",
                                            }}
                                        />
                                    </div>
                                )}

                                {/* FAILED */}
                                {item.status === "failed" && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "35px",
                                            left: "7px",
                                            right: "7px",
                                            padding: "4px",
                                            backgroundColor:
                                                "rgba(220,53,69,0.9)",
                                            color: "#fff",
                                            borderRadius: "4px",
                                            fontSize: "10px",
                                            textAlign: "center",
                                            zIndex: 5,
                                        }}
                                    >
                                        Upload Failed
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
    </div>
);
};

export default CapsuleUpload;