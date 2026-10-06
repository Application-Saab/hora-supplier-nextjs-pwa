import LazyVideo from "./LazyVideo";
import EventLazyImage from "./EventLazyImage";
import CircularLoader from "./CircularLoader";

export const EventwallGalleryItemWonderland = ({
  isVideo,
  thumbnail,
  indexOnPage,
  isEventWall = true,
}) => {

  let isLoading = false;
  if (isEventWall) {
    isLoading = !thumbnail?.postWebpUrl && thumbnail.status !== "done";
  } else {
    isLoading = thumbnail.isTemp && thumbnail.uploading;
  }

  let imageUrl = null;
  let previewSrc = null;
  let fullVideoSrc = null;
  
  if (isEventWall) {
    imageUrl = isLoading ? thumbnail.localPreview : thumbnail.postWebpUrl;
    previewSrc = isLoading ? thumbnail.localPreview : thumbnail.postWebpUrl;
    fullVideoSrc = thumbnail?.postUrl;
  } else if (!isEventWall) {
  imageUrl = thumbnail.thumbnailImageUrl || thumbnail.originalUrl || null;

  previewSrc =
    thumbnail.type === "video"
      ? thumbnail.videoClipUrl || thumbnail.originalUrl
      : null;

  fullVideoSrc =
    thumbnail.type === "video"
      ? thumbnail.videoClipUrl || thumbnail.originalUrl
      : null;
}
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <CircularLoader />
        </div>
      )}
      {isVideo ? (
        <LazyVideo
          previewSrc={previewSrc}
          fullVideoSrc={fullVideoSrc}
          isEventWall={isEventWall}
          progress={thumbnail.progress || null}
          duration={thumbnail.duration}
        />
      ) : (
        <EventLazyImage
          key={thumbnail?._id}
          src={imageUrl}
          alt={`Event Image ${indexOnPage + 1}`}
          progress={thumbnail.progress || null}
          wrapperClassName={`event-masonry-item`}
          postType={thumbnail.postType || null}
        />
      )}
    </div>
  );
};
