import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, ORDERLIST_ENDPOINT, GET_PHOTOGRAPHY_BY_NAME } from "../../apiconstant/apiconstant";
import Layout from "../../component/Layout";
import { useRouter } from "next/router";

const SUBMIT_LINK_ENDPOINT = "/api/photo/drive/add-order-drive-link";

const GoogleDriveForm = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [itemNames, setItemNames] = useState([]);

  console.log(selectedOrder,"selectedOrder");

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

  const handleSubmitDriveLink = async () => {
    if (!driveLink.startsWith("https://drive.google.com/")) {
      alert("Invalid Google Drive link");
      return;
    }
    try {
      await axios.post(BASE_URL + SUBMIT_LINK_ENDPOINT, {
        order_id: selectedOrder.order_id,
        folderUrl: driveLink,
      });

      await fetch(`${BASE_URL}/api/photo/drive/update-google-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIdDb: selectedOrder.order_id,
          orderIdCustomer: selectedOrder.order_id + 10800,
          phone: selectedOrder.phone_no,
          fulfillmentDate: selectedOrder.order_date
            ? new Date(selectedOrder.order_date).toLocaleDateString("en-GB")
            : "N/A",
          services: "Photography",
          driveLink: driveLink,
          horaWebLink: "N/A",
        }),
      });

      alert("Drive link submitted!");
      setPopupOpen(false);
      setDriveLink("");
      window.location.reload();
    } catch (err) {
      console.error(err.response?.data?.error, "testing");
      alert(err.response?.data?.error || "Invalid Google Drive folder URL");
    }
  };

  
const handleViewDetails = (order) => {
  router.push({
    pathname: "/past-order-view-details",
    query: {
      apiOrderId: order._id,
      orderType: order.type,
      orderId: order.order_id,
    },
  });
};
  const handleViewDetails1 = async (order) => {
    setSelectedOrder(order);
    setPopupOpen(true);
    setDriveLink("");
    setItemNames([]);

    try {
      if (!order.items || order.items.length === 0) return;

      const url = `${BASE_URL}${GET_PHOTOGRAPHY_BY_NAME}`;
      const response = await axios.get(url);
      const apiData = response.data;

      if (apiData?.data?.length > 0) {
        const matchedItems = order.items
          .map(itemId => apiData.data.find(item => item._id === itemId))
          .filter(Boolean);

        setItemNames(matchedItems.map(m => m.name));
      }
    } catch (err) {
      console.error("Error fetching item names", err);
    }
  };

  const OrderItem = ({ order }) => {
    const handleFileUpload = async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.onchange = async (e) => {
        const files = e.target.files;
        if (!files?.length) return;
        const formData = new FormData();
        [...files].forEach((f) => formData.append("files", f));

        const uploadRes = await fetch(
          "https://horaservices.com/api/multiple_image_upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const uploadData = await uploadRes.json();

        await fetch("https://horaservices.com/api/order/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: order._id,
            userOrderDishImageArray: uploadData.data,
          }),
        });
        window.location.reload();
      };
      input.click();
    };

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
            order.orderDriveLink ? (
              <button
                style={{ ...styles.buttonBase, ...styles.submittedBtn }}
                disabled
              >
                ✓ Submitted
              </button>
            ) : (
              <button
                style={{ ...styles.buttonBase, ...styles.uploadDriveBtn }}
                onClick={() => handleViewDetails(order)}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #8a3f85 0%, #a14d9a 100%)";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 3px 6px rgba(156,77,151,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #9c4d97 0%, #b55ba3 100%)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                 Upload Drive Link
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
    <Layout backLink = "/home">
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