"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../component/Layout";
import { BASE_URL } from "../../../../apiconstant/apiconstant";
import backIcon from "../../../../assets/photographerprofile/back.svg";
import addIcon from "../../../../assets/photographerprofile/addIcon.svg";
import ImageGrid from "../../../../component/ImageComponents/ImageGrid";

export default function SubFolder() {
    const router = useRouter();

    const folderId = router.query.id;

    const [subFolder, setSubFolder] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!router.isReady || !folderId) return;

        const getLocalStorageData = () => {
            if (typeof window === "undefined") {
                return {
                    supplierID: "",
                };
            }

            const supplierID = localStorage.getItem("supplierID") || "";

            return {
                supplierID,
            };
        };

        const { supplierID } = getLocalStorageData();


        const getSubFolderData = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=recentWork_${supplierID}&subFolderId=${folderId}`

                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message || "Something went wrong"
                    );
                }

                const fetchedThumbnails = (result?.thumbnails || []).map(
                    (thumb, index) => ({
                        ...thumb,
                        stableKey: thumb._id || index,
                    })
                );

                setThumbnails(fetchedThumbnails);


                // Find selected subfolder by URL id
                const selectedSubFolder =
                    result?.folders?.[0]?.subFolders?.find(
                        (item) =>
                            String(item._id) === String(folderId)
                    );

                setSubFolder(selectedSubFolder || null);

                // API thumbnails
                setThumbnails(result?.thumbnails || []);
            } catch (error) {
                console.error(
                    "Error fetching subfolder:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        getSubFolderData();
    }, [router.isReady, folderId]);

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
                        {loading
                            ? ""
                            : subFolder?.folderName || ""}
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
                                    <button
                                        type="button"
                                        className="subfolder-add-photos-btn"
                                    >
                                        <img
                                            src={addIcon.src}
                                            alt="Add Photos"
                                            className="add-photos-icon"
                                            height={15}
                                            width={15}
                                        />

                                        <span>Add Photos</span>
                                    </button>

                                    <div className="total-photos">
                                        Total {thumbnails.length || 0} Photos
                                    </div>
                                </div>
                                <div className="image-div" style={{ minHeight: "500px" }}>
                                    {thumbnails.length > 0 ?
                                        <ImageGrid
                                            data={thumbnails}
                                            loading={loading}
                                            isEventWall={false}
                                            handleSelectImage={() => { }}
                                            handleImageClick={(indexOnPage) =>
                                                console.log("hello", indexOnPage)
                                            }
                                            isEditing={false}
                                            isSearchMode={false}
                                            activeSubFolderId={false}
                                            isActualMyPhotos={false}
                                            selectedImages={[]}
                                            setSelectedImages={() => { }}
                                        />
                                        :
                                        <div className="empty-iamges-text total-photos">No any photos uploaded yet..</div>
                                    }
                                </div>
                            </>
                        )}
                    </div>

                </div>


            </div>
        </Layout>
    );
}