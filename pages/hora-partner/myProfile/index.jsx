"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import profileBanner from "../../../assets/photographerprofile/profileBanner.jpg";
import profileImage from "../../../assets/photographerprofile/profileImage.svg";
import location from "../../../assets/photographerprofile/location.svg";
import experience from "../../../assets/photographerprofile/experience.svg";
import userProfile from "../../../assets/photographerprofile/userProfile.svg";
import editIcon from "../../../assets/photographerprofile/editIcon.svg";
import aboutUser from "../../../assets/photographerprofile/aboutUser.svg";
import star from "../../../assets/photographerprofile/star.svg";
import recent from "../../../assets/photographerprofile/recent.svg";
import user from "../../../assets/photographerprofile/user.svg";
import camera from "../../../assets/photographerprofile/camera.svg";
import checkIcon from "../../../assets/photographerprofile/checkIcon.svg";
import multiGroup from "../../../assets/photographerprofile/multiGroup.svg";
import downloadVector from "../../../assets/photographerprofile/downloadVector.svg";
import shareVector from "../../../assets/photographerprofile/shareVector.svg";
import deleteVector from "../../../assets/photographerprofile/deleteVector.svg";
import { IoIosCloudDone } from "react-icons/io";
import Modal from "./Modal";
import CreateFolderModal from "./CreateFolderModal";
import SelectFolderModal from "./SelectFolderModal";
import "@fontsource/inter/400";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import Image from "next/image";
import Layout from "../../../component/Layout";
import { BASE_URL, BASE_URL2 } from "../../../apiconstant/apiconstant";
import ImageGrid from "../../../component/ImageComponents/ImageGrid";
import CommonImagePopup from "../../../component/ImageComponents/CommonImagePopup";
import { getSocket } from "../../../folderSocket";

const ChevronDownIcon = () => (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Profile = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [aboutText, setAboutText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [userDetails, setUserDetails] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
    const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [experienceValue, setExperienceValue] = useState("");
    const [city, setCity] = useState("");
    const [phoneNumber, setphoneNumber] = useState("");
    const [scrollPosition, setScrollPosition] = useState(0);
    const [allSpecializations, setAllSpecializations] = useState([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const actionMenuRef = useRef(null);
    const [recentWorkPhotos, setRecentWorkPhotos] = useState([]);
    const [recentWorkSubFolders, setRecentWorkSubFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const closePopup = useCallback(() => setSelectedIndex(null), []);
    const handleImageClick = useCallback((index) => setSelectedIndex(index), []);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                actionMenuRef.current &&
                !actionMenuRef.current.contains(event.target)
            ) {
                setShowActionMenu(false);
            }
        };

        if (showActionMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showActionMenu]);

    const formatPhoneNumber = (num) => {
        if (!num) return "N/A";

        const str = num.toString();
        if (str.length < 4) return "N/A";

        const last4 = str.slice(-4);
        return `91+ XXXXXX${last4}`;
    };

    useEffect(() => {
        if (activeTab === "all" && recentWorkSubFolders.length > 0) {
            const firstFolderWithPhoto = recentWorkSubFolders.find((subFolder) => {
                return recentWorkPhotos.some((photo) => {
                    const folderId = String(subFolder._id);

                    return (
                        (Array.isArray(photo.folderIds) &&
                            photo.folderIds.map(String).includes(folderId)) ||
                        String(photo.fileId || "").startsWith(`${folderId}_`)
                    );
                });
            });

            setActiveTab(
                firstFolderWithPhoto?._id ||
                recentWorkSubFolders[0]._id
            );
        }
    }, [recentWorkSubFolders, recentWorkPhotos]);

    const filteredPhotos = useMemo(() => {
        if (!Array.isArray(recentWorkPhotos)) return [];

        if (activeTab === "all") {
            return recentWorkPhotos;
        }

        return recentWorkPhotos.filter((img) => {
            const folderId = String(activeTab);

            const folderIdsMatch = Array.isArray(img.folderIds)
                ? img.folderIds.map(String).includes(folderId)
                : false;

            const fileIdMatch = String(img.fileId || "").startsWith(
                `${folderId}_`
            );

            return folderIdsMatch || fileIdMatch;
        });
    }, [recentWorkPhotos, activeTab]);

    const getLocalStorageData = () => {
        if (typeof window === "undefined") {
            return {
                supplierID: "",
                mobileNumber: "",
            };
        }

        const supplierID = localStorage.getItem("supplierID") || "";
        const mobileNumber = localStorage.getItem("mobileNumber") || "";

        return {
            supplierID,
            mobileNumber,
        };
    };

    const checkOrCreateRecentWorkFolder = async (ownerId) => {
        try {
            if (!ownerId) return;

            const folderName = `recentWork_${ownerId}`;

            const createResponse = await fetch(
                `${BASE_URL}/api/photo/CreateFolder`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        folderName: folderName,
                        customerId: ownerId,
                        vendorId: ownerId,
                    }),
                }
            );

            const createResult = await createResponse.json();

            if (
                createResponse.status === 400 &&
                createResult.message?.includes("already exists")
            ) {
                return;
            }

            throw new Error(
                createResult.message || "Folder creation failed"
            );
        } catch (error) {
            console.error("Recent Work Folder Error:", error);
        }
    };


    const [snackbar, setSnackbar] = useState({
        show: false,
        message: "Image downloaded successfully",
    });


    const snackbarTimeout = useRef(null);

    const showSnackbar = (message) => {
        setSnackbar({
            show: true,
            message,
        });

        if (snackbarTimeout.current) {
            clearTimeout(snackbarTimeout.current);
        }

        snackbarTimeout.current = setTimeout(() => {
            setSnackbar({
                show: false,
                message: "",
            });
        }, 5000);
    };



    const handleImageShare = async (imageUrl, id) => {
        if (!imageUrl) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Photo",
                    text: "Check out this photo!",
                    url: imageUrl,
                });
            } catch (error) {
                console.error("Error sharing image:", error);
            }
        } else {
            await navigator.clipboard.writeText(imageUrl);
            alert("Image link copied!");
        }
    };

    const handleDeleteImage = async () => {
        const currentImage = filteredPhotos[selectedIndex];

        if (!currentImage?._id) return;

        if (
            !window.confirm(
                "Are you sure you want to delete this image?"
            )
        ) {
            return;
        }

        try {
            const res = await fetch(
                `${BASE_URL2}/delete-image/${currentImage._id}`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }

            setRecentWorkPhotos((prev) => {
                const newList = prev.filter(
                    (img) => img._id !== currentImage._id
                );

                if (newList.length === 0) {
                    setSelectedIndex(null);
                } else if (selectedIndex >= newList.length) {
                    setSelectedIndex(newList.length - 1);
                }

                return newList;
            });

            setShowActionMenu(false);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete image");
        }
    };

    const getRecentWorkThumbnails = async (ownerId) => {
        try {
            if (!ownerId) return;

            const folderName = `recentWork_${ownerId}`;

            const response = await fetch(
                `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=${encodeURIComponent(folderName)}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch thumbnails");
            }

            const mainFolder = (result.folders || []).find(
                (folder) => folder.folderName === folderName
            );

            setRecentWorkSubFolders(mainFolder?.subFolders || []);
            setRecentWorkPhotos(result.thumbnails || []);
        } catch (error) {
            console.error("Get Recent Work Thumbnails Error:", error);
        }
    };


    const createSubFolder = async () => {
        try {
            const subFolderName = newFolderName.trim();
            if (!subFolderName) return;

            const { supplierID, mobileNumber } = getLocalStorageData();

            if (!supplierID) {
                throw new Error("Supplier ID not found");
            }

            setCreatingFolder(true);

            const formData = new FormData();
            formData.append("folderName", `recentWork_${supplierID}`);
            formData.append("type", "others");
            formData.append("userId", supplierID);
            formData.append("phoneNo", mobileNumber);
            formData.append("subFolderName", subFolderName);

            const response = await fetch(
                `${BASE_URL2}/create-subfolder`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Subfolder creation failed");
            }

            setNewFolderName("");

            await getRecentWorkThumbnails(supplierID);

            setActiveModal("selectFolder");
        } catch (error) {
            console.error("Create Subfolder Error:", error);
            alert(error.message || "Something went wrong");
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleDownloadImage = async (currentImage) => {
        try {
            setShowActionMenu(false);

            const url = currentImage?.originalUrl;

            if (!url) {
                throw new Error("Image URL not found");
            }

            const fileWithExt = url.split("/").pop();

            const parts = fileWithExt.split("-");
            const ext = parts.pop();
            const filename = parts.join("-") + "." + ext;

            const response = await fetch(url, {
                mode: "cors",
            });

            if (!response.ok) {
                throw new Error("Failed to download image");
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "downloaded-image.jpg";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // thoda delay do
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 1000);

            showSnackbar("Image downloaded successfully");
        } catch (err) {
            console.error("Error downloading the file:", err);
            showSnackbar("Download failed");
        }
    };
    const getProfileData = async () => {
        try {
            setLoading(true);

            const { supplierID, mobileNumber } = getLocalStorageData();

            if (!supplierID || !mobileNumber) {
                console.error(
                    "supplierID or mobileNumber not found in localStorage"
                );
                return;
            }

            const userResponse = await fetch(
                `${BASE_URL}/api/users/user_details/${supplierID}?phone=${mobileNumber}`
            );

            const userResult = await userResponse.json();

            const specializationResponse = await fetch(
                `${BASE_URL}/api/specializations/get`
            );

            const specializationResult = await specializationResponse.json();

            if (userResult.status === 200) {
                const userData = userResult.data;

                setUserDetails(userData);

                setAboutText(userData.about || "");

                setName(userData.name || "");
                setAge(userData.age || "");
                setExperienceValue(userData.experience || "");
                setCity(userData.city || "");
                setphoneNumber(userData?.phone)
                setSelectedSpecializations(
                    userData.userSpecializations || []
                );

                const FOLDER_OWNER_ID = supplierID;

                await checkOrCreateRecentWorkFolder(FOLDER_OWNER_ID);
                await getRecentWorkThumbnails(FOLDER_OWNER_ID);
            }

            if (specializationResult.status === 200) {
                setAllSpecializations(specializationResult.data || []);
            }
        } catch (error) {
            console.error("Get Profile Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfileData();
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onDone = ({ file }) => {
            if (!file) return;

            const real = {
                ...file,
                thumbnailImageUrl: file.thumbnailImageUrl || file.originalUrl,
            };

            setRecentWorkPhotos((prev) => {
                const exists = prev.some(
                    (p) => String(p._id) === String(file._id) || p.fileId === file.fileId
                );
                if (exists) {
                    return prev.map((p) =>
                        String(p._id) === String(file._id) || p.fileId === file.fileId ? real : p
                    );
                }
                return [real, ...prev];
            });
        };

        socket.on("media:done", onDone);
        return () => socket.off("media:done", onDone);
    }, []);

    const initialValues = {
        name: name || "",
        age: age || "",
        experience: experienceValue || "",
        city: city || "",
        imagePreview: profileImagePreview || null,
    };

    const [isFormDirty, setIsFormDirty] = useState(false);

    useEffect(() => {
        const isChanged =
            name !== initialValues.name ||
            age !== initialValues.age ||
            experienceValue !== initialValues.experience ||
            city !== initialValues.city ||
            profileImagePreview !== initialValues.imagePreview;

        setIsFormDirty(isChanged);
    }, [name, age, experienceValue, city, profileImagePreview]);

    const updatePersonalDetails = async () => {
        try {
            setLoading(true);

            const { supplierID } = getLocalStorageData();

            if (!supplierID) {
                throw new Error("Supplier ID not found");
            }

            const payload = {
                name: name,
                age: age,
                experience: experienceValue,
                city: city,
            };

            if (profileAvatarUrl) {
                payload.avatar = profileAvatarUrl;
            }

            const response = await fetch(
                `${BASE_URL}/api/users/supplier_personal_details_update/${supplierID}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(
                    result.message || "Personal details update failed"
                );
            }

            setActiveModal(null);

            setProfileImagePreview("");

            await getProfileData();
        } catch (error) {
            console.error("Update Personal Details Error:", error);

            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                `${BASE_URL}/api/user/user-avatar/${userDetails._id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || "Image upload failed");
            }

            const avatarUrl = result?.data?.avatar;

            if (!avatarUrl) {
                throw new Error("Avatar URL not received");
            }

            setProfileAvatarUrl(avatarUrl);
            setProfileImagePreview(avatarUrl);

            setUserDetails((prev) => ({
                ...prev,
                avatar: avatarUrl,
            }));
        } catch (error) {
            console.error("Avatar Upload Error:", error);
            alert(error.message || "Image upload failed");
        } finally {
            setLoading(false);
        }
    };

    const updateAbout = async () => {
        try {
            setLoading(true);

            const { supplierID } = getLocalStorageData();

            if (!supplierID) {
                throw new Error("Supplier ID not found");
            }

            const response = await fetch(
                `${BASE_URL}/api/users/supplier_personal_details_update/${supplierID}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        about: aboutText,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || "About update failed");
            }

            setActiveModal(null);

            await getProfileData();
        } catch (error) {
            console.error("Update About Error:", error);

            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleSpecialization = (id) => {
        setSelectedSpecializations((prev) => {
            if (prev.includes(id)) {
                return prev.filter(
                    (specializationId) => specializationId !== id
                );
            }

            return [...prev, id];
        });
    };

    const updateSpecializations = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/specializations/user/specializations`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userDetails?._id,
                        userSpecializations: selectedSpecializations,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(
                    result.message || "Specializations update failed"
                );
            }

            setActiveModal(null);

            await getProfileData();
        } catch (error) {
            console.error("Update Specializations Error:", error);

            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const selectedSpecializationList = allSpecializations.filter((item) =>
        selectedSpecializations.includes(item._id)
    );


    useEffect(() => {
        const el = document.querySelector(".cards-scroll-container");

        if (el) {
            setHasHorizontalScroll(el.scrollWidth > el.clientWidth);
        }
    }, [selectedSpecializationList]);


    console.log("recentWorkSubFolders", recentWorkSubFolders)

    return (
        <Layout backLink="/hora-partner/home">
            {loading ? (
                <div className="profile-loader">
                    <div className="loader-circle"></div>
                </div>
            ) : (
                    <div className="new-profile-container">

                    <Image
                        src={profileBanner}
                        alt="profile-banner"
                        className="profile-banner"
                    />

                    <div className="profile-white-section">
                        <div className={userDetails?.avatar ? "profile-circle" : "default-profile-circle"}>
                            {userDetails?.avatar ? (
                                <Image
                                    src={userDetails.avatar}
                                    alt="photographer"
                                    fill
                                    className="profile-circle-image"
                                />
                            ) : (
                                <Image
                                    src={profileImage}
                                    alt="photographer"
                                    width={110}
                                    height={110}
                                    className="default-profile-image"
                                />
                            )}
                        </div>

                        <div className="profile-info">

                            <div className="profileName-section">
                                <span className="profile-name">
                                    {userDetails?.name || "N/A"}
                                </span>

                                <span onClick={() => setActiveModal("details")}>
                                    <Image src={editIcon} alt="editIcon" />
                                </span>
                            </div>

                            <div className="profile-info-row">
                                <span className="profile-info-icon">
                                    <Image
                                        src={userProfile}
                                        alt="profile-banner"
                                        width={12}
                                        height={13}
                                    />
                                </span>

                                <span className="profile-info-text">
                                    Age - {userDetails?.age || "N/A"} Year
                                </span>
                            </div>

                            <div className="profile-info-row">
                                <span className="profile-info-icon">
                                    <Image
                                        src={experience}
                                        alt="profile-banner"
                                        width={13}
                                        height={15}
                                    />
                                </span>

                                <span className="profile-info-text">
                                    Experience - {userDetails?.experience || "N/A"}
                                </span>
                            </div>

                            <div className="profile-info-row">
                                <span className="profile-info-icon">
                                    <Image
                                        src={location}
                                        alt="profile-banner"
                                        width={10}
                                        height={14}
                                    />
                                </span>

                                <span className="profile-info-text">
                                    Location - {userDetails?.city || "N/A"}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="lower-container">
                        <div className="about-container">

                            <div className="flex align-start gap-12">

                                <span className="about-icon" style={{ height: "24px" }}>
                                    <Image src={aboutUser} alt="aboutUser" />
                                </span>

                                <div className="flex-1">

                                    <div className="flex align-center gap-8">

                                        <div className="all-heading">About</div>

                                        <div
                                            onClick={() => setActiveModal("about")}
                                            style={{ height: "20px" }}
                                        >
                                            <Image src={editIcon} alt="editIcon" />
                                        </div>

                                    </div>

                                    <div className="about-text">
                                        {userDetails?.about || "No about added yet."}
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="lower-container">

                        <div className="about-container margin-top-5">

                            <div className="flex-1 right-content">

                                <div className="flex align-center gap-8 header-wrapper">

                                    <Image src={star} alt="aboutUser" />

                                    <div className="all-heading">Specialization</div>

                                    <div
                                        onClick={() => setActiveModal("specialization")}
                                        style={{
                                            height: "17px",
                                            width: "17px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Image src={editIcon} alt="editIcon" />
                                    </div>

                                </div>

                                <div onScroll={(e) => {
                                    const el = e.currentTarget;

                                    const maxScroll = el.scrollWidth - el.clientWidth;

                                    setScrollPosition(
                                        maxScroll > 0 ? el.scrollLeft / maxScroll : 0
                                    );
                                }}
                                    className={`${selectedSpecializationList.length > 0 ? 'cards-scroll-container' : 'no-content'}`}>

                                    {selectedSpecializationList.length > 0 ? (
                                        selectedSpecializationList.map((item) => (
                                            <div key={item._id} className="spec-card">

                                                <div>
                                                    <div>
                                                        <Image
                                                            src={`${BASE_URL}/api/uploads/specialization/${item.image}`}
                                                            alt={item.name}
                                                            height={34}
                                                            width={42}
                                                        />
                                                    </div>
                                                </div>

                                                <p className="card-title">{item.name}</p>

                                            </div>
                                        ))
                                    ) : (
                                        <div className="about-text">
                                            Not selected yet
                                        </div>
                                    )}

                                </div>
                                {hasHorizontalScroll && (
                                    <div className="custom-scroll-bar">
                                        <span className="arrow left">◀</span>

                                        <div className="track">
                                            <div
                                                className="thumb"
                                                style={{
                                                    transform: `translateX(${scrollPosition * 90}px)`
                                                }}
                                            ></div>
                                        </div>

                                        <span className="arrow right">▶</span>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="lower-container">

                        <div className="about-container margin-top-5">

                            <div className="flex gap-8 justify-between margin-top-5">
                                <div className="flex-1 right-content">

                                    <div className="flex align-center gap-8 header-wrapper">

                                        <Image src={recent} alt="aboutUser" />

                                        <div className="all-heading">Recent Work</div>

                                    </div>

                                </div>

                                <div>
                                    <button
                                        className="add-photos-btn"
                                        onClick={() => setActiveModal("selectFolder")}
                                    >
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M7 1V13M1 7H13"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        <span>Add Photos</span>

                                    </button>

                                </div>
                            </div>

                            <div className="gallery-headerCard">
                                {recentWorkSubFolders.map((subFolder) => {

                                    const subFolderPhotos = recentWorkPhotos.filter((photo) => {
                                        const folderId = String(subFolder._id);

                                        const folderIdsMatch =
                                            Array.isArray(photo.folderIds) &&
                                            photo.folderIds.map(String).includes(folderId);

                                        const fileIdMatch = String(photo.fileId || "").startsWith(
                                            `${folderId}_`
                                        );

                                        return folderIdsMatch || fileIdMatch;
                                    });

                                    const firstImage = subFolderPhotos.find(
                                        (photo) => photo.thumbnailImageUrl || photo.originalUrl
                                    );

                                    return (
                                        <div
                                            key={subFolder._id}
                                            className={`card-item ${activeTab === subFolder._id ? "active" : ""
                                                }`}
                                            onClick={() => setActiveTab(subFolder._id)}
                                        >
                                            <div className="circle-img-folder circle-img-both">

                                                {firstImage ? (
                                                    <div className="circle-img-inner">
                                                        <img
                                                            src={firstImage.thumbnailImageUrl || firstImage.originalUrl}
                                                            alt={subFolder?.folderName || "Album"}
                                                            onError={(e) => {
                                                                const img = e.currentTarget;
                                                                if (firstImage.originalUrl && img.src !== firstImage.originalUrl) {
                                                                    img.src = firstImage.originalUrl;
                                                                } else {
                                                                    img.style.display = "none";
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="folder-dp-alt-outer">
                                                        <span className="folder-dp-alt">
                                                            {subFolder.folderName?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                            </div>

                                            <span>
                                                {subFolder?.folderName || "Album"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="image-box" style={{ minHeight: "250px" }}>
                                {filteredPhotos.length > 0 ? (
                                    <ImageGrid
                                        data={filteredPhotos}
                                        loading={false}
                                        isEventWall={false}
                                        handleSelectImage={() => { }}
                                        handleImageClick={(indexOnPage) => handleImageClick(indexOnPage)}
                                        isEditing={false}
                                        isSearchMode={false}
                                        activeSubFolderId={false}
                                        isActualMyPhotos={false}
                                        selectedImages={[]}
                                        setSelectedImages={() => { }}
                                    />
                                ) : (
                                    <div className="empty-iamges-text total-photos">
                                        No photos in this folder yet..
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <CommonImagePopup
                        images={filteredPhotos}
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                        onClose={closePopup}
                        renderActions={(currentImage, index) => (
                            <div>
                                <div style={{ position: "relative" }}>
                                    <Image
                                        src={multiGroup}
                                        alt="More"
                                        width={25}
                                        height={25}
                                        onClick={() => setShowActionMenu((prev) => !prev)}
                                    />

                                    {showActionMenu && (
                                        <div className="action-menu" ref={actionMenuRef}>
                                            <div className="action-item">
                                                <strong>Shared by:</strong>
                                                <p>{formatPhoneNumber(phoneNumber)}</p>
                                            </div>

                                            <div className="action-inner-container">
                                                {currentImage?.type !== "video" && (
                                                    <div
                                                        className="action-item flex"
                                                        onClick={() => {
                                                            const current = filteredPhotos[selectedIndex];
                                                            handleDownloadImage(current);
                                                        }}
                                                    >
                                                        <Image src={downloadVector} width={19} height={15} />
                                                        <span>Download</span>
                                                    </div>
                                                )}

                                                <div
                                                    onClick={() => {
                                                        const current = filteredPhotos[selectedIndex];
                                                        if (!current) return;
                                                        handleImageShare(current?.originalUrl, current?._id);
                                                        setShowActionMenu(false);
                                                    }}
                                                    className="action-item flex gallery-share-icon"
                                                >
                                                    <Image src={shareVector} width={19} height={15} />
                                                    <span>Share</span>
                                                </div>
                                                <div
                                                    className="action-item flex"
                                                    onClick={handleDeleteImage}
                                                >
                                                    <Image
                                                        src={deleteVector}
                                                        width={19}
                                                        height={15}
                                                        alt="Delete"
                                                    />
                                                    <span>Delete</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        renderFooter={() => null}
                    />

                    {snackbar.show && (
                        <div className="custom-snackbar">
                            <span>
                                <IoIosCloudDone color="green" size={30} />
                            </span>
                            {snackbar.message}
                        </div>
                    )}


                    <Modal
                        isOpen={activeModal === "details"}
                        onClose={() => setActiveModal(null)}
                        title="Edit Details"
                    >
                        <form
                            className="modal-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                updatePersonalDetails();
                            }}
                        >
                            <div>
                                <div className="form-label">Profile Image</div>
                                <div className="profile-upload-section">
                                    <div className="profile-img-preview">
                                        {profileImagePreview || userDetails?.avatar ? (
                                            <Image
                                                src={profileImagePreview || userDetails.avatar}
                                                alt="Profile"
                                                width={80}
                                                height={80}
                                                className="profile-preview-avatar"
                                            />
                                        ) : (
                                            <Image
                                                src={profileImage}
                                                alt="Profile"
                                                width={80}
                                                height={80}
                                                className="profile-preview-default"
                                            />
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="profile-image-input"
                                        style={{ display: "none" }}
                                        onChange={handleProfileImageChange}
                                    />

                                    <button
                                        type="button"
                                        className="change-photo-btn"
                                        onClick={() =>
                                            document
                                                .getElementById("profile-image-input")
                                                .click()
                                        }
                                    >
                                        <Image src={camera} alt="Camera" />
                                        Change Photo
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>
                                    Your Name <span>*</span>
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Image src={user} alt="editIcon" />
                                    </span>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter name"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>
                                    Your Age (in years) <span>*</span>
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Image src={user} alt="editIcon" />
                                    </span>

                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Age"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>
                                    Experience (in years) <span>*</span>
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Image src={user} alt="editIcon" />
                                    </span>

                                    <input
                                        type="number"
                                        value={experienceValue}
                                        onChange={(e) =>
                                            setExperienceValue(e.target.value)
                                        }
                                        placeholder="Experience"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>
                                    Location <span>*</span>
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <Image src={user} alt="editIcon" />
                                    </span>

                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    >
                                        <option value="">Select Location</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Bangalore">Bangalore</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Hyderabad">Hyderabad</option>
                                    </select>

                                    <span className="select-arrow">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="modal-save-btn"
                                disabled={loading || !isFormDirty}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </Modal>

                    <Modal
                        isOpen={activeModal === "about"}
                        onClose={() => setActiveModal(null)}
                        title="About us"
                    >
                        <form
                            className="modal-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateAbout();
                            }}
                        >
                            <div>
                                <div className="textarea-wrapper">
                                    <textarea
                                        maxLength={300}
                                        rows={5}
                                        value={aboutText}
                                        onChange={(e) => setAboutText(e.target.value)}
                                        placeholder="I'm Jhon Deo, a passionate photographer..."
                                    />
                                </div>
                                <div className="char-count">
                                    {aboutText.length}/300
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="modal-save-btn"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </Modal>

                    <Modal
                        isOpen={activeModal === "specialization"}
                        onClose={() => setActiveModal(null)}
                        title="Edit Specialization"
                    >
                        <div className="spec-selection-list">

                            {allSpecializations.map((item) => {
                                const isSelected = selectedSpecializations.includes(
                                    item._id
                                );

                                return (
                                    <div
                                        key={item._id}
                                        className={`spec-select-card ${isSelected ? "active" : ""}`}
                                        onClick={() => toggleSpecialization(item._id)}
                                    >
                                        <div className="spec-left">

                                            <div className="spec-icon-box">
                                                <Image
                                                    src={`${BASE_URL}/api/uploads/specialization/${item.image}`}
                                                    alt={item.name}
                                                    width={42}
                                                    height={34}
                                                />
                                            </div>

                                            <span className="spec-name">{item.name}</span>

                                        </div>

                                        <div
                                            className={`checkbox-circle ${isSelected ? "checked" : ""}`}
                                        >
                                            {isSelected && (
                                                <Image
                                                    src={checkIcon}
                                                    alt="checkIcon"
                                                    width={12}
                                                    height={9}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>

                        <button
                            type="button"
                            className="modal-save-btn"
                            onClick={updateSpecializations}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </Modal>

                    <SelectFolderModal
                        isOpen={activeModal === "selectFolder"}
                        onClose={() => setActiveModal(null)}
                        onAddFolder={() => setActiveModal("createFolder")}
                        onNext={() => { }}
                        subFolders={recentWorkSubFolders}
                        recentWorkPhotos={recentWorkPhotos}

                    />

                    <CreateFolderModal
                        isOpen={activeModal === "createFolder"}
                        onClose={() => {
                            setActiveModal(null);
                            setNewFolderName("");
                        }}
                        folderName={newFolderName}
                        setFolderName={setNewFolderName}
                        onCreate={createSubFolder}
                        loading={creatingFolder}
                    />

                </div>
            )}
        </Layout>
    );
};

export default Profile;