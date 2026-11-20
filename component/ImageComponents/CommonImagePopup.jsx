"use client";
import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import ArrowImg from "../../assets/photographerprofile/arrow.svg";
import nextIcon from "../../assets/photographerprofile/nextIcon.svg";
import Image from "next/image";
import Crossicon from "../../assets/photographerprofile/Crossicon.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import "./commonPopup.css";

const PrevArrow = ({ className, onClick }) => (
    <div className={`${className} custom-arrow prev-arrow`} onClick={onClick}>
        <Image src={ArrowImg} alt="Back" width={30} height={30} />
    </div>
);

const NextArrow = ({ className, onClick }) => (
    <div className={`${className} custom-arrow next-arrow`} onClick={onClick}>
        <Image src={nextIcon} alt="Next" width={30} height={30} />
    </div>
);

const pauseAllVideos = () => {
    const videos = document.querySelectorAll(".popupContent video");
    videos.forEach((video) => {
        video.pause();
        video.currentTime = 0;
    });
};

const CommonImagePopup = ({
    images = [],
    selectedIndex,
    setSelectedIndex,
    renderActions,
    onClose,
    renderFooter,
    isEventWall = false,
}) => {
    const sliderSettings = {
        dots: false,
        infinite: images.length > 1,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        beforeChange: (current, next) => {
            pauseAllVideos();
            setImageNumber(next + 1);
            setSelectedIndex(next);
        },

        afterChange: () => {
            playActiveVideo();
        },
    };
    useEffect(() => {
        if (selectedIndex === null) {
            pauseAllVideos();
        }
    }, [selectedIndex]);

    const playActiveVideo = () => {
        const activeVideo = document.querySelector(".slick-current video");
        if (!activeVideo) return;

        activeVideo.currentTime = 0;

        const playWhenReady = () => {
            activeVideo.play().catch(console.error);
        };

        if (activeVideo.readyState >= 2) {
            playWhenReady();
        } else {
            activeVideo.addEventListener("loadeddata", playWhenReady, { once: true });
        }
    };

    const sliderRef = useRef(null);
    const [imageNumber, setImageNumber] = useState(0);
    const isVideoFile = (url = "") => /\.(mp4|mov|avi|mkv|webm|ogg)$/i.test(url);

    useEffect(() => {
        if (selectedIndex !== null) {
            setImageNumber(selectedIndex + 1);
            // Slight delay to ensure slider is mounted and classes are applied
            setTimeout(() => {
                playActiveVideo();
            }, 0);
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex === null) {
            pauseAllVideos();
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (!sliderRef.current) return;

        const videos = sliderRef.current.querySelectorAll("video");

        videos.forEach((video) => {
            const isActive = video
                .closest(".slick-slide")
                ?.classList.contains("slick-current");

            if (isActive) {
                video.muted = false;
                video.play().catch(() => { });
            } else {
                video.pause();
                video.currentTime = 0;
                video.muted = true;
            }
        });
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => (document.body.style.overflow = "");
    }, [selectedIndex]);

    if (selectedIndex === null || !images[selectedIndex]) return null;

    return (
        <div
            className="popupOverlay"
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 999 }}
        >
            <div className="popupContent" onClick={(e) => e.stopPropagation()}>
                <div className="popupHeader">
                    <div className="popupHeader-left">
                        <button className="closeButton" onClick={onClose}>
                            <Image src={Crossicon} alt="Close" width={18} height={18} />
                        </button>
                        <div className="image-index">
                            {`${imageNumber} / ${images.length}`}
                        </div>
                    </div>

                    {renderActions && renderActions(images[selectedIndex], selectedIndex)}
                </div>

                {/* Slider */}
                <div className="popupSliderWrapper">
                    <Slider
                        {...sliderSettings}
                        initialSlide={selectedIndex}
                        key="eventwall-slider"
                    >
                        {images.map((item, idx) => {
                            const isVisible = Math.abs(idx - selectedIndex) <= 1;

                            if (!isVisible) {
                                return <div key={idx} />;
                            }

                            const isVideo = item.type === "video";

                            return (
                                <div key={item._id || idx} className="slick-slide-item">
                                    {isVideo ? (
                                        <video
                                            src={isEventWall ? item?.postUrl : item.originalUrl}
                                            controls
                                            playsInline
                                            muted={false}
                                            preload="metadata"
                                            style={{
                                                maxHeight: "80vh",
                                                width: "100%",
                                                objectFit: "contain",
                                                background: "#000",
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={
                                                isEventWall
                                                    ? item?.postWebpUrl || item?.postUrl
                                                    : item.thumbnailImageUrl || item.originalUrl
                                            }
                                            loading="lazy"
                                            alt={`Media ${idx + 1}`}
                                            style={{
                                                maxHeight: "80vh",
                                                width: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </Slider>
                </div>
                <div className="popupFooter">
                    {renderFooter && renderFooter(images[selectedIndex], selectedIndex)}
                </div>
            </div>
        </div>
    );
};

export default CommonImagePopup;
