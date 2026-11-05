import React, { useState, useEffect } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../../apiconstant/apiconstant";
import Layout from "../../../component/Layout";
import { useRouter } from "next/router";


const GoogleDriveForm = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);


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
      maxWidth: "600px",
      margin: "2px auto",
      padding: "20px",
      background: "#f8f9fa",
      minHeight: "100vh",
    },
    heading: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "600",
      color: "#97538C",
      fontWeight: "bold",
    },
    orderItem: {
      padding: "15px",
      marginBottom: "12px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
      flexWrap: "wrap",
      gap: "8px",
    },
    orderIdText: { 
      fontSize: "16px", 
      fontWeight: "500", 
      color: "#333",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    reviewText: { 
      fontSize: "13px", 
      color: "#666",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    // Improved button base styles
    buttonBase: {
      padding: "6px 12px",
      border: "1px solid",
      borderRadius: "5px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      transition: "all 0.2s ease",
      display: "inline-block",
      textAlign: "center",
      minWidth: "80px",
      textDecoration: "none",
      outline: "none",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      whiteSpace: "nowrap",
    },
    // Button container for multiple buttons
    buttonContainer: {
      display: "flex",
      gap: "6px",
      alignItems: "center",
      flexWrap: "nowrap",
      justifyContent: "flex-end",
    },
    viewDetailsBtn: { 
      background: "#fff", 
      color: "#9c4d97",
      borderColor: "#9c4d97",
      fontWeight: "500",
    },
    uploadDriveBtn: { 
      background: "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)", 
      color: "#fff",
      border: "none",
      borderColor: "transparent",
      fontWeight: "500",
    },

    allSubmitted: {
      background: "#4CAF50",
      color: "#ffffff"
    },
    notAllSubmitted: {
      background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
      color: "#ffffff"
    },

    showFinalSetupBtn: {
      background: "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)",
      color: "#fff",
      border: "none",
      borderColor: "transparent",
      fontWeight: "500",
    },
    submittedBtn: { 
      background: "#e9ecef", 
      color: "#6c757d",
      borderColor: "#dee2e6",
      cursor: "default",
      fontWeight: "500",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
    },
    statusText: {
      fontSize: "13px",
      color: "#28a745",
      fontWeight: "500",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    bottomRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      background: "#fff",
      borderRadius: "12px",
      padding: "0",
      width: "500px",
      maxWidth: "90%",
      maxHeight: "85vh",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    },
    modalHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e0e0e0",
      background: "#9c4d97",
      color: "#fff",
    },
    modalTitle: { 
      fontSize: "18px", 
      fontWeight: "600", 
      margin: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    modalBody: {
      padding: "24px",
      maxHeight: "calc(85vh - 200px)",
      overflowY: "auto",
    },
    detailRow: {
      display: "flex",
      marginBottom: "16px",
      fontSize: "14px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    detailLabel: {
      fontWeight: "600",
      color: "#555",
      minWidth: "140px",
      marginRight: "12px",
    },
    detailValue: {
      color: "#333",
      flex: 1,
    },
    inputText: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #d0d0d0",
      borderRadius: "6px",
      marginTop: "16px",
      fontSize: "14px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      resize: "vertical",
      minHeight: "80px",
    },
    modalFooter: {
      padding: "16px 24px",
      borderTop: "1px solid #e0e0e0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      background: "#f8f9fa",
    },
    cancelBtn: {
      padding: "8px 20px",
      background: "#fff",
      color: "#666",
      border: "1px solid #d0d0d0",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    submitBtn: {
      padding: "8px 20px",
      background: "#9c4d97",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
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
        if(response.ok){
          const data = await response.json();
        let orderList = data?.data?.order || [];
        orderList = orderList.filter(
          (o) => o.order_status === 3 || o.order_status === 6
        );
        setOrders(orderList);
        }
        else{
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

    return (
      <li style={styles.orderItem}>
        <div style={styles.topRow}>
          <span style={styles.orderIdText}>
            Order Id: {order.order_id + 10800}
          </span>
          
          {/* Common View Details button shown in all cases */}
          <button
            style={{ ...styles.buttonBase, ...styles.viewDetailsBtn }}
            onClick={() => handleViewDetails(order)}
            onMouseEnter={(e) => {
              e.target.style.background = "#f8f0f7";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 2px 6px rgba(156,77,151,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            View Details
          </button>
        </div>

        <div style={styles.bottomRow}>
          <span style={styles.reviewText}>
            {order.userReviewRatingArray?.[0]
              ? `Rating=${order.userReviewRatingArray[0]}`
              : "No Feedback"}
          </span>

          {/* Show buttons based on supplierJobType */}
          {supplierJobType === 8 ? (
            // Photography orders
            areAllLinksSubmitted ? (
              <button
                style={{
                  ...styles.buttonBase, ...styles.allSubmitted, display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
                disabled
              >
                ✓ Submitted <span style={{ fontSize: "1.1rem" }}>
                  (
                  <span style={{ color: "#fff" }}>
                    {submittedLinksCount}
                  </span>
                  <span style={{ color: "#fff" }}>
                    /{totalInclusionsCount}
                  </span>
                  )
                </span>

              </button>
            ) : (
              <button
                  style={{
                    ...styles.buttonBase, ...styles.notAllSubmitted, display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                onClick={() => handleViewDetails(order)}
              >
                  Upload Links <span style={{ fontSize: "1.1rem" }}>
                    (
                    <span style={{ color: "#fff" }}>
                      {submittedLinksCount}
                    </span>
                    <span style={{ color: "#fff" }}>
                      /{totalInclusionsCount}
                    </span>
                    )
                  </span>
              </button>
            )
          ) : (
            // Decoration orders
            order.userOrderDishImageArray?.length === 0 ? (
              <button
                style={{ ...styles.buttonBase, ...styles.showFinalSetupBtn }}
                onClick={() => handleViewDetails(order)}
                onMouseEnter={(e) => {
e.target.style.background = "linear-gradient(135deg, #8a3f85 0%, #a14d9a 100%)";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 3px 8px rgba(40,167,69,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                Show Final Setup
              </button>
            ) : (
              <button
                style={{ ...styles.buttonBase, ...styles.submittedBtn }}
                disabled
              >
                ✓ Submitted
              </button>
            )
          )}
        </div>
      </li>
    );
  };

  return (
    <Layout backLink = "/hora-partner/home">
      <div style={styles.container}>
        <h2 style={styles.heading}>
          Past Orders
        </h2>
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading orders...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {orders.map((order) => (
              <OrderItem key={order._id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default GoogleDriveForm;