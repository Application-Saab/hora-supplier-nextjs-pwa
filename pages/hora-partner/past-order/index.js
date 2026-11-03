import React, { useState, useEffect } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../../apiconstant/apiconstant";
import Layout from "../../../component/Layout";
import { useRouter } from "next/router";


const GoogleDriveForm = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");


  let supplierID, supplierJobType;
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    supplierID = localStorage.getItem("supplierID");
    supplierJobType = parseInt(localStorage.getItem("supplierJobType"), 10);
  }

  const styles = {
    container: {
      maxWidth: "100%",
      margin: "0 auto",
      padding: "16px 12px",
      background: "#fff",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    headerWrapper: {
      marginBottom: "16px",
      textAlign: "center",
    },
    heading: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#2c3e50",
      margin: "0 0 4px 0",
    },
    subHeading: {
      fontSize: "13px",
      color: "#7f8c8d",
      margin: 0,
    },
    searchContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
    },
    searchInput: {
      flex: 1,
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #dcdde1",
      fontSize: "14px",
      outline: "none",
      background: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    filterTabs: {
      display: "flex",
      gap: "6px",
      marginBottom: "16px",
      overflowX: "scroll",
      overflowY: "hidden",
      paddingBottom: "8px",
      scrollbarWidth: "thin",
      scrollbarColor: "#bdbdbd transparent",
    },
    filterTab: (active) => ({
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      background: active ? "#9c4d97" : "#e4e7eb",
      color: active ? "#fff" : "#4b6584",
      whiteSpace: "nowrap",
      transition: "all 0.2s ease",
    }),
    orderItem: {
      padding: "16px",
      marginBottom: "12px",
      borderRadius: "12px",
      border: "1px solid #e1e4e8",
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      transition: "transform 0.1s ease",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    },
    orderIdBadge: {
      background: "#fdf2fb",
      color: "#9c4d97",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: "600",
    },
    reviewText: {
      fontSize: "12px",
      color: "#7f8c8d",
      fontWeight: "500",
    },
    buttonBase: {
      padding: "10px 18px",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItem: "center",
      justifyContent: "center",
      textAlign: "center",
      textDecoration: "none",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      whiteSpace: "nowrap",
    },
    buttonContainer: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    viewDetailsBtn: {
      background: "#f3e5f5",
      color: "#9c4d97",
      border: "1px solid #e1bee7",
    },
    uploadDriveBtn: {
      background: "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)",
      color: "#fff",
    },
    allSubmitted: {
      background: "#5cb85c",
      color: "#ffffff"
    },
    notAllSubmitted: {
      background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
      color: "#ffffff"
    },
    showFinalSetupBtn: {
      background: "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)",
      color: "#fff",
    },
    submittedBtn: {
      background: "#5cb85c",
      color: "#7f8c8d",
      cursor: "default",
      boxShadow: "none",
    },
    bottomRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "12px",
      paddingTop: "10px",
      borderTop: "1px solid #f1f2f6",
    },
    emptyState: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#95a5a6",
      fontSize: "14px",
    },
    // Skeleton Styles
    skeletonItem: {
      padding: "16px",
      marginBottom: "12px",
      borderRadius: "12px",
      border: "1px solid #e1e4e8",
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    },
    skeletonPulse: {
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: "6px",
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(BASE_URL + ORDERLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: 1,
            per_page: 1000,
            type: supplierJobType,
            toId: supplierID,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          let orderList = data?.data?.order || [];
          orderList = orderList.filter(
            (o) => o.order_status === 3 || o.order_status === 6
          );
          setOrders(orderList);
        } else {
          alert("Failed to load orders.");
          console.log("Error response:", response);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [supplierID, supplierJobType]);


  const handleViewDetails = (order) => {
    router.push({
      pathname: "/hora-partner/past-order-view-details",
      query: {
        apiOrderId: order._id,
        orderType: order.type,
        orderId: order.order_id,
      },
    });
  };

  const inclusionToApiKey = (name) => {
    const aliases = {
      "Edited Video": "editedVideo",
      "Raw Video": "rawVideos",
    };

    if (aliases[name]) return aliases[name];

    return name
      .trim()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toLowerCase() + word.slice(1)
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  };


  const lateSubmissionDeadlines = {
    colorCorrectedPhotos: 48 * 60 * 60 * 1000,       // 48 hours
    editedPhotos: 24 * 60 * 60 * 1000,    // 24 hours
    editedVideos: 3 * 24 * 60 * 60 * 1000, // 3 days
    album: 6 * 24 * 60 * 60 * 1000,      // 6 days
  };

  const isLateSubmission = (order) => {
    const fulfillmentDate = new Date(order?.order_date).getTime();

    if (!fulfillmentDate || isNaN(fulfillmentDate)) return false;

    const inclusions = order?.call_checklist?.inclusions || {};
    const existingLinks = order?.allDriveLinks || [];

    const now = Date.now();

    const lateInclusions = [
      { name: "Raw Photos", apiKey: "colorCorrectedPhotos" },
      { name: "Edited Photos", apiKey: "editedPhotos" },
      { name: "Edited Video", apiKey: "editedVideos" },
      { name: "Album", apiKey: "album" },
    ];

    return lateInclusions.some(({ name, apiKey }) => {
      // Only check selected inclusions
      if (inclusions[name] !== true) return false;

      const deadline = fulfillmentDate + lateSubmissionDeadlines[apiKey];

      // Check if link is already submitted
      const isSubmitted = existingLinks.some(
        (item) => item.linkType === apiKey && item.link?.trim()
      );

      // Raw Photos fallback
      const rawPhotosSubmitted =
        apiKey === "colorCorrectedPhotos" && !!order?.orderDriveLink?.trim();


      return now > deadline && !isSubmitted && !rawPhotosSubmitted;
    });
  };

  const OrderItem = ({ order }) => {
    let totalInclusionsCount = 0;
    let submittedLinksCount = 0;
    let areAllLinksSubmitted = false;

    if (supplierJobType === 8) {
      const inclusions = order?.call_checklist?.inclusions || {};
      const existingLinks = order?.allDriveLinks || [];

      const trueInclusionsList = Object.keys(inclusions).filter(
        (key) => inclusions[key] === true
      );

      const finalApiKeysToShow = [
        ...new Set(trueInclusionsList.map(inclusionToApiKey).filter(Boolean)),
      ];

      totalInclusionsCount = finalApiKeysToShow.length;

      finalApiKeysToShow.forEach((backendApiKey) => {
        const matchedSavedLink = existingLinks.find(
          (item) => item.linkType === backendApiKey
        );

        const rawPhotosSubmitted =
          backendApiKey === "colorCorrectedPhotos" &&
          (
            order?.imageUploadByApp === true ||
            !!order?.orderDriveLink?.trim() ||
            existingLinks.some(
              (item) =>
                item.linkType === "colorCorrectedPhotos" &&
                !!item.link?.trim()
            )
          );

        const albumSubmitted =
          backendApiKey === "album" &&
          order?.isAlbumVerified === true;

        if (
          !!matchedSavedLink?.link?.trim() ||
          rawPhotosSubmitted ||
          albumSubmitted
        ) {
          submittedLinksCount++;
        }
      });

      areAllLinksSubmitted = totalInclusionsCount > 0 && submittedLinksCount === totalInclusionsCount;
    }

    return (
      <li style={styles.orderItem}>
        <div style={styles.topRow}>
          <span style={styles.orderIdBadge}>
            Order #{order.order_id + 10800}
          </span>

          <span style={styles.reviewText}>
            {order.reviewStatus && (
              <span>
                {order.reviewStatus === "positive" ? "🤩 Positive Review" : "😞 Negative Review"}
              </span>
            )}

            {order.userReviewRatingArray?.[0] && (
              <span>
                {" | "}⭐ {order.userReviewRatingArray[0]} Rating
              </span>
            )}

            {!order.reviewStatus && !order.userReviewRatingArray?.[0] && "No Feedback"}
          </span>
        </div>

        {order?.call_checklist?.inclusions?.Album === true && (
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "6px",
            marginBottom: "8px",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: "600",
              padding: "4px 8px",
              borderRadius: "6px",
              color: order.isAlbumVerified ? "#15803d" : "#d97706",
              background: order.isAlbumVerified ? "#ecfdf3" : "#fffbeb",
              whiteSpace: "nowrap",
            }}>
              {order.isAlbumVerified ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Album Verified
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  Album Not Verified
                </>
              )}
            </span>
          </div>


        )}

        <div style={styles.bottomRow}>

          <div style={styles.buttonContainer}>
            <button
              style={{ ...styles.buttonBase, ...styles.viewDetailsBtn }}
              onClick={() => handleViewDetails(order)}
            >
              View Details
            </button>

            {supplierJobType === 8 ? (
              areAllLinksSubmitted ? (
                <button
                  style={{ ...styles.buttonBase, ...styles.allSubmitted }}
                  disabled
                >
                  ✓ Submitted ({submittedLinksCount}/{totalInclusionsCount})
                </button>
              ) : (
                <button
                  style={{ ...styles.buttonBase, ...styles.notAllSubmitted }}
                  onClick={() => handleViewDetails(order)}
                >
                  Upload Links ({submittedLinksCount}/{totalInclusionsCount})
                </button>
              )
            ) : (
              order.userOrderDishImageArray?.length === 0 ? (
                <button
                  style={{ ...styles.buttonBase, ...styles.showFinalSetupBtn }}
                  onClick={() => handleViewDetails(order)}
                >
                  Show Final Setup
                </button>
              ) : (
                <button
                  style={{ ...styles.buttonBase, ...styles.allSubmitted }}
                  disabled
                >
                  ✓ Submitted
                </button>
              )
            )}
          </div>
        </div>
      </li>
    );
  };

  const SkeletonLoader = () => (
    <>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} style={styles.skeletonItem}>
          <div style={styles.topRow}>
            <div style={{ ...styles.skeletonPulse, width: "100px", height: "24px" }} />
            <div style={{ ...styles.skeletonPulse, width: "70px", height: "16px" }} />
          </div>
          <div style={{ ...styles.bottomRow, borderTop: "1px solid #f1f2f6" }}>
            <div style={{ ...styles.skeletonPulse, width: "90px", height: "16px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ ...styles.skeletonPulse, width: "85px", height: "30px", borderRadius: "8px" }} />
              <div style={{ ...styles.skeletonPulse, width: "100px", height: "30px", borderRadius: "8px" }} />
            </div>
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );

  const filteredOrders = orders.filter((order) => {
    let totalInclusionsCount = 0;
    let submittedLinksCount = 0;
    let areAllLinksSubmitted = false;

    // Photography supplier links submission check
    if (supplierJobType === 8) {
      const inclusions = order?.call_checklist?.inclusions || {};
      const existingLinks = order?.allDriveLinks || [];

      const trueInclusionsList = Object.keys(inclusions).filter(
        (key) => inclusions[key] === true
      );

      const finalApiKeysToShow = [
        ...new Set(trueInclusionsList.map(inclusionToApiKey).filter(Boolean)),
      ];

      totalInclusionsCount = finalApiKeysToShow.length;

      finalApiKeysToShow.forEach((backendApiKey) => {
        const matchedSavedLink = existingLinks.find(
          (item) => item.linkType === backendApiKey
        );

        const rawPhotosSubmitted =
          backendApiKey === "colorCorrectedPhotos" &&
          (
            order?.imageUploadByApp === true ||
            !!order?.orderDriveLink?.trim() ||
            existingLinks.some(
              (item) =>
                item.linkType === "colorCorrectedPhotos" &&
                !!item.link?.trim()
            )
          );

        const albumSubmitted =
          backendApiKey === "album" &&
          order?.isAlbumVerified === true;

        const isSubmitted =
          !!matchedSavedLink?.link?.trim() ||
          rawPhotosSubmitted ||
          albumSubmitted;

        if (isSubmitted) {
          submittedLinksCount++;
        }
      });

      areAllLinksSubmitted =
        totalInclusionsCount > 0 &&
        submittedLinksCount === totalInclusionsCount;
    }

    // Submission status
    const isSubmitted =
      supplierJobType === 8
        ? areAllLinksSubmitted
        : (order?.userOrderDishImageArray?.length > 0);

    const rating = String(order?.userReviewRatingArray?.[0] || "").trim();

    const hasRating = ["0-6", "1-6", "6-8", "7-8", "9-10"].includes(rating);

    // All orders
    if (statusFilter === "all") return true;

    // Pending / Completed
    if (statusFilter === "submitted") return isSubmitted;

    if (statusFilter === "pending") {
      const inclusions = order?.call_checklist?.inclusions || {};

      // Album selected but not verified
      if (
        inclusions.Album === true &&
        order?.isAlbumVerified !== true
      ) {
        return true;
      }

      return !isSubmitted;
    }

    // Late Submission
    if (statusFilter === "lateSubmission") {
      return supplierJobType === 8 && isLateSubmission(order);
    }

    // Rating filters
    // 0-6: Include both 0-6 and 1-6

    // Review has higher priority than rating
    if (order?.reviewStatus === "negative") {
      return statusFilter === "0-6";
    }

    if (order?.reviewStatus === "positive") {
      return statusFilter === "9-10";
    }

    if (statusFilter === "0-6") {
      return ["0-6", "1-6"].includes(rating);
    }

    // 6-8: Include both 6-8 and 7-8
    if (statusFilter === "6-8") {
      return ["6-8", "7-8"].includes(rating);
    }

    // 9-10
    if (statusFilter === "9-10") {
      return rating === "9-10";
    }


    // No Rating
    if (statusFilter === "noRating") {
      return !hasRating;
    }

    return true;
  });

  return (
    <Layout backLink="/hora-partner/home">
      <div style={styles.container}>
        <div style={styles.headerWrapper}>
          <h2 style={styles.heading}>Past Orders</h2>
          <p style={styles.subHeading}>Manage and track your previous orders easily</p>
        </div>


        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <button style={styles.filterTab(statusFilter === "all")} onClick={() => setStatusFilter("all")}>
            All ({orders.length})
          </button>
          <button style={styles.filterTab(statusFilter === "pending")} onClick={() => setStatusFilter("pending")}>
            Pending
          </button>
          <button style={styles.filterTab(statusFilter === "submitted")} onClick={() => setStatusFilter("submitted")}>
            Completed
          </button>
          <button style={styles.filterTab(statusFilter === "0-6")} onClick={() => setStatusFilter("0-6")}>
            0-6
          </button>
          <button style={styles.filterTab(statusFilter === "6-8")} onClick={() => setStatusFilter("6-8")}>
            6-8
          </button>
          <button style={styles.filterTab(statusFilter === "9-10")} onClick={() => setStatusFilter("9-10")}>
            9-10
          </button>
          <button style={styles.filterTab(statusFilter === "noRating")} onClick={() => setStatusFilter("noRating")}>
            No Rating
          </button>
          <button style={styles.filterTab(statusFilter === "lateSubmission")} onClick={() => setStatusFilter("lateSubmission")}>
            Late Submission
          </button>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>No orders found matching your search.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredOrders.map((order) => (
              <OrderItem key={order._id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default GoogleDriveForm;