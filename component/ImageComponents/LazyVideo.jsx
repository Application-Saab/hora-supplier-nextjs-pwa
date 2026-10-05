"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";

const LazyVideo = ({
  previewSrc,
  fullVideoSrc,
  className,
  duration: initialDuration,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(null);
  
  useEffect(() => {
    if (initialDuration) {
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  const videoRef = useRef(null);

  // Format video duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // only play video when it’s visible
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(currentVideo);

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
        currentVideo.removeAttribute("src");
        currentVideo.src = "";
        currentVideo.load();
      }
    };
  }, []);

  // Load video metadata (duration)
  useEffect(() => {
    if (initialDuration) return;
    if (!fullVideoSrc) return;
    const video = document.createElement("video");
    video.src = fullVideoSrc;
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const dur = video.duration;
      if (!isNaN(dur)) setDuration(formatDuration(dur));
    };
    
    return () => {
      video.removeAttribute("src");
      video.src = "";
      video.load();
    };
  }, [fullVideoSrc, initialDuration]);

  return (
    <div
      className='event-masonry-item'
      style={{
        backgroundColor: isLoaded ? "#FFFFFF" : "#e9ecef",
      }}
    >
      <video
        ref={videoRef}
        src={previewSrc}
        loop
        muted
        playsInline
        preload="metadata"
        className={`lazy-video-element ${className || ""} ${
          isLoaded ? "loaded" : "loading"
        }`}
        onLoadedData={() => setIsLoaded(true)}
      />

      {/* Spinner while loading */}
      {!isLoaded && (
        <div className="lazy-video-spinner-container placeholder-glow p-1">
          <div className="placeholder w-100 h-100"></div>
        </div>
      )}

      {/* Overlay with duration + play icon */}
      {isLoaded && duration && (
        <div className="lazy-video-overlay">
          <span className="lazy-video-duration">{duration}</span>
          <FaPlayCircle className="lazy-video-play-icon" />
        </div>  
      )}
    </div>
  );
};

export default React.memo(LazyVideo);
