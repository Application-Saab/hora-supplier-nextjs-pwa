import React from "react";
import { EventwallGalleryItemWonderland,} from "./EventwallGalleryItem";

const ImageGrid = ({
    data,
    loading,
    isEventWall,
    handleSelectImage,
    handleImageClick,
    isEditing,
    isSearchMode,
    activeSubFolderId,
    isActualMyPhotos,
    selectedImages,
    setSelectedImages = () => { },
}) => {
    function getBlockType(index) {
        const pos = index % 6;

        if (pos === 0 || pos === 1 || pos === 2) return "small";
        if (pos === 3) return "big";
        if (pos === 4) return "small-right-top";
        if (pos === 5) return "small-right-bottom";
    }

    return (
        <>
            {!loading && data.length > 0 && (
                <div className="event-image-grid">
                    {data?.map((thumbnail, indexOnPage) => {
                        const type = getBlockType(indexOnPage);
                        const hasAnyLike = isEventWall
                            ? parseInt(thumbnail?.likeCounts) > 0
                            : thumbnail?.likedBy?.length > 0;
                        return (
                            <div
                                key={thumbnail.stableKey || indexOnPage}
                                className={`grid-item ${type}`}
                                style={{
                                    cursor: "pointer",
                                    position: "relative",
                                    backgroundColor: "transparent",
                                    display: "grid",
                                }}
                                onClick={() => {
                                    if (isEditing) {
                                        handleSelectImage(thumbnail._id);
                                    } else {
                                        handleImageClick(indexOnPage);
                                    }
                                }}
                            >
                                <div className="image-wrapper" style={{ position: "relative" }}>
                                    {!isEditing && hasAnyLike && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "5px",
                                                left: "8px",
                                                zIndex: 10,
                                            }}
                                        >
                                        </div>
                                    )}

                                    {isEditing &&
                                        !isSearchMode &&
                                        activeSubFolderId &&
                                        !isActualMyPhotos && (
                                            <input
                                                type="checkbox"
                                                className="image-checkbox"
                                                checked={selectedImages.includes(thumbnail._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedImages((prev) => [
                                                            ...prev,
                                                            thumbnail._id,
                                                        ]);
                                                    } else {
                                                        setSelectedImages((prev) =>
                                                            prev.filter((id) => id !== thumbnail._id),
                                                        );
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}

                                    <EventwallGalleryItemWonderland
                                        isVideo={thumbnail.type === "video"}
                                        thumbnail={thumbnail}
                                        indexOnPage={indexOnPage}
                                        isEventWall={isEventWall}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ImageGrid;
