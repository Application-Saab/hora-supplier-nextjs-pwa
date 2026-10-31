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
      overflowX: "auto",
      paddingBottom: "4px",
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
      padding: "8px 14px",
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

  const inclusionToApiKeyMap = {
    "Raw Photos": "rawPhotos",
    "Edited Photos": "editedPhotos",
    "Teaser": "teaser",
    "Edited Video": "editedVideos",
    "Raw Video": "rawVideos",
    "Drone Shoot": "droneShoot",
    "Edited Reel": "editedReel"
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

      const dynamicApiKeys = trueInclusionsList.map((key) => inclusionToApiKeyMap[key]);
      const finalApiKeysToShow = [...new Set(dynamicApiKeys.filter(Boolean))];

      totalInclusionsCount = finalApiKeysToShow.length;

      finalApiKeysToShow.forEach((backendApiKey) => {
        const matchedSavedLink = existingLinks.find(
          (item) => item.linkType === backendApiKey
        );

        const rawPhotosLink = backendApiKey === "rawPhotos" ? order?.orderDriveLink : "";

        if (!!matchedSavedLink?.link || !!rawPhotosLink) {
          submittedLinksCount++;
        }
      });

      areAllLinksSubmitted = totalInclusionsCount > 0 && submittedLinksCount === totalInclusionsCount;
    }

    const isSubmitted = supplierJobType === 8 ? areAllLinksSubmitted : (order.userOrderDishImageArray?.length > 0);

    return (
      <li style={styles.orderItem}>
        <div style={styles.topRow}>
          <span style={styles.orderIdBadge}>
            Order #{order.order_id + 10800}
          </span>
          <span style={styles.reviewText}>
            {order.userReviewRatingArray?.[0]
              ? `⭐ ${order.userReviewRatingArray[0]} Rating`
              : "No Feedback"}
          </span>
        </div>

        <div style={styles.bottomRow}>
          <span style={{ fontSize: "12px", color: isSubmitted ? "#27ae60" : "#e67e22", fontWeight: "600" }}>
            {isSubmitted ? "● Completed" : "● Action Required"}
          </span>

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

    if (supplierJobType === 8) {
      const inclusions = order?.call_checklist?.inclusions || {};
      const existingLinks = order?.allDriveLinks || [];
      const trueInclusionsList = Object.keys(inclusions).filter((key) => inclusions[key] === true);
      const dynamicApiKeys = trueInclusionsList.map((key) => inclusionToApiKeyMap[key]);
      const finalApiKeysToShow = [...new Set(dynamicApiKeys.filter(Boolean))];
      totalInclusionsCount = finalApiKeysToShow.length;
      finalApiKeysToShow.forEach((backendApiKey) => {
        const matchedSavedLink = existingLinks.find((item) => item.linkType === backendApiKey);
        const rawPhotosLink = backendApiKey === "rawPhotos" ? order?.orderDriveLink : "";
        if (!!matchedSavedLink?.link || !!rawPhotosLink) submittedLinksCount++;
      });
      areAllLinksSubmitted = totalInclusionsCount > 0 && submittedLinksCount === totalInclusionsCount;
    }

    const isSubmitted = supplierJobType === 8 ? areAllLinksSubmitted : (order.userOrderDishImageArray?.length > 0);

    if (statusFilter === "submitted") return isSubmitted;
    if (statusFilter === "pending") return !isSubmitted;
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