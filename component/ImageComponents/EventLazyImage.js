"use client";
import React, { useState, useEffect, useRef } from "react";

const EventLazyImage = ({
  src,
  alt,
  className,
  onClick,
  progress,
  postType
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imgRef.current) {
        imgRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    const currentRef = wrapperRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (currentRef) {
            observer.unobserve(currentRef);
          }
        }
      },
      {
        rootMargin: "0px 0px 300px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className='event-masonry-item'
      onClick={onClick}
      style={{
        backgroundColor: isLoaded ? "#FFFFFF" : "#e9ecef",
      }}
    >
      {/* Render img tag only when in view to start loading */}
      {isInView && src && (
                <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            decoding="async"
            loading="lazy"
            className={`event-lazy-image-actual-img ${className || ""} ${
              isLoaded ? "loaded" : "loading"
            }`}
            style={{
              objectFit: postType === 'thankYouNote' ? 'fill' : 'cover'
            }}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setIsLoaded(true);
              console.warn(`Failed to load image: ${src}`);
            }}
          />
          {progress && (
            <div className="lazy-image-progress-overlay">{progress}</div>
          )}
        </>
      )}

      {/* Spinner overlay: shown when in view but image not yet loaded (or failed) */}
      {isInView && !isLoaded && (
        <div className="event-lazy-image-spinner-container placeholder-glow p-1">
          <div className="placeholder w-100 h-100"></div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EventLazyImage);
