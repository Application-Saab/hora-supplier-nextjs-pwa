import React, { useEffect, useState } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";
import Layout from "../../component/Layout";
import socket, { connectSocket } from "../../socket";
import OrderList from "../../component/OrderList/index.jsx";

const Orderlist = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  // Popup state (must be inside the component)
  const [showPopup, setShowPopup] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  //order_status: { type: Number, default: 0 /* 0-Booking ,1-Accepted ,2-pending/in-progress, 3-delivery/completed, 4-failed, 5- handle -> {1,2,3}, 6- expire  */ }

  let supplierJobType;
  let supplierID;
  let supplierCity;
  let status;

  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    supplierJobType = localStorage.getItem("supplierJobType");
    supplierID = localStorage.getItem("supplierID");
    supplierCity = localStorage.getItem("supplierCity");
    status = localStorage.getItem("status");
  }

  if (supplierCity === "Bengaluru") {
    supplierCity = "Bangalore"; // Adjusting for city name
  }

  // let phoneNumber = localStorage.getItem("mobileNumber");
  let phoneNumber = null;
  if (typeof window !== "undefined") {
    phoneNumber = localStorage.getItem("mobileNumber");
  }

  useEffect(() => {
    if (Number(status) === 0) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, []);





  useEffect(() => {
    const fetchOrderList = async () => {
      if (Number(status) !== 1) {
        setOrdersLoaded(true);
        return;
      }// sohan verma 06/06/2025
      try {
        const response = await fetch(BASE_URL + ORDERLIST_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: 1,
            per_page: 100,
            status: 1,
            type: Number(supplierJobType),
            order_locality:
              supplierCity.charAt(0).toUpperCase() +
              supplierCity.slice(1).toLowerCase(),
          }),
        });
    if(response.ok){
      const responseData = await response.json();

        if (responseData && responseData.data && responseData.data.order) {
          const sortedOrders = responseData.data.order.sort(
            (a, b) => new Date(a.order_date) - new Date(b.order_date)
          );

          setOrders(sortedOrders);
        } else {
          console.log("No orders found");
        }
    } else {
      alert("Failed to fetch orders. Please try again later.");
    }
        
      } catch (error) {
        console.log("Error fetching orders:", error);
      } finally {
        setOrdersLoaded(true);
      }
    };

    fetchOrderList();
  }, [supplierID, Number(status)]);

useEffect(() => {
  const userId = localStorage.getItem("supplierID");
  const socket = connectSocket(userId);

  if (!socket) {
    return;
  }

  socket.on("order:new", (data) => {
    setOrders((prev) => [data, ...prev]);
  });

  return () => {
    socket.off("order:new");
  };
}, []);
  

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "orderlist-status-booked orderlist-status-badge" };
      case 1:
        return { status: "Accepted", className: "orderlist-status-accepted orderlist-status-badge" };
      case 2:
        return { status: "In-progress", className: "orderlist-status-in-progress orderlist-status-badge" };
      case 3:
        return { status: "Completed", className: "orderlist-status-completed orderlist-status-badge" };
      case 4:
        return { status: "Cancelled", className: "orderlist-status-cancelled orderlist-status-badge" };
      case 5:
        return { status: "", className: "status-empty orderlist-status-badge" };
      case 6:
        return { status: "Expired", className: "orderlist-status-expired orderlist-status-badge" };
      default:
        return { status: "Unknown", className: "status-unknown orderlist-status-badge" };
    }
  };

  const getOrderType = (orderTypeValue) => {
    switch (orderTypeValue) {
      case 1:
        return "Decoration";
      case 2:
        return "Chef";
      case 3:
        return "Waiter";
      case 4:
        return "Bar Tender";
      case 5:
        return "Cleaner";
      case 6:
        return "Food Delivery";
      case 7:
        return "Live Catering";
      case 8:
        return "Photography";
      default:
        return "Unknown Type";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const openContinueShopping = () => {
    router.push("/");
  };

  const handleViewDetail = (order) => {
    const { _id, order_id, type, otp } = order;
    // localStorage.setItem("orderOtp" , otp )

    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      localStorage.setItem("orderOtp", otp);
    }
    const apiOrderId = _id;
    const orderType = type;
    const orderId = order_id;

    router.push({
      pathname: `/new-order-details`,
      query: { apiOrderId, orderType, orderId },
    });
  };


  if (!ordersLoaded ) {
    return (
      <center>
        <div className="custom-spinner">
          <div>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div style={{ color: "#9252AA", textAlign: "center" }}>
              <h4>Data is loading...</h4>
            </div>
          </div>
        </div>
      </center>
    );
  }

  // Show popup if userStatus === 0
  if (showPopup) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}>
        <div style={{
          background: "#fff",
          padding: "40px 30px",
          borderRadius: "12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
          textAlign: "center",
          minWidth: "300px"
        }}>
          <h2 style={{ color: "#D32F2F", marginBottom: "16px" }}>Access Blocked</h2>
          <p style={{ fontSize: "18px", color: "#333" }}>
            You have been blocked from accessing the system.<br />
            Please contact <strong>+91-8982321487</strong> for assistance.
          </p>
          <button
            onClick={() => router.push('/home')}
            style={{
              padding: "10px 20px",
              backgroundColor: "#D32F2F",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Close
          </button>
        </div>
      </div>
    );

  }

  const bookedOrders = orders.filter((order) => order.order_status === 0);

  return (
    <Layout>
      <main className="order-list">
        <div className="orderlist-container">
          {bookedOrders.length === 0 ? (
            <p className="no-orders-message">No orders available</p>
          ) : (
            bookedOrders.map((order) => {
              const orderStatus = getOrderStatus(order?.order_status);
              return (
                <OrderList
                  key={order.order_id}
                  orderId={order.order_id}
                  statusClassName={orderStatus.className}
                  status={orderStatus.status}
                  orderType={getOrderType(order?.type)}
                  orderDate={formatDate(order.order_date)}
                  orderTime={order.order_time}
                  noOfPeople={order.no_of_people}
                  balanceAmount={order.balance_amount}
                  viewDetailsHandler={() => handleViewDetail(order)}
                />
              );
            })
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Orderlist;
