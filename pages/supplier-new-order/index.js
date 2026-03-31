import React, { useEffect, useState } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import { FaRegCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { IoCalendarClear } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import clock from "../../assets/bell.png";
import people from "../../assets/people.png";
import date_time_icon from "../../assets/date-time-icon.png";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "../../component/Layout";
import socket, { connectSocket } from "../../socket";

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

        const responseData = await response.json();

        if (responseData && responseData.data && responseData.data.order) {
          const sortedOrders = responseData.data.order.sort(
            (a, b) => new Date(a.order_date) - new Date(b.order_date)
          );

          setOrders(sortedOrders);
        } else {
          console.log("No orders found");
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

  console.log("👉 socket instance:", socket);

  if (!socket) {
    console.log("❌ No socket");
    return;
  }

  socket.on("order:new", (data) => {
    console.log("🔥 NEW ORDER:", data);
    setOrders((prev) => [data, ...prev]);
  });

  return () => {
    console.log("🧹 cleanup");
    socket.off("order:new");
  };
}, []);
  

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "status-booked" };
      case 1:
        return { status: "Accepted", className: "status-accepted" };
      case 2:
        return { status: "In-progress", className: "status-in-progress" };
      case 3:
        return { status: "Completed", className: "status-completed" };
      case 4:
        return { status: "Cancelled", className: "status-cancelled" };
      case 5:
        return { status: "", className: "status-empty" };
      case 6:
        return { status: "Expired", className: "status-expired" };
      default:
        return { status: "Unknown", className: "status-unknown" };
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
    const options = { day: "numeric", month: "short", year: "numeric" };
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
        <div className="order-container">
          {bookedOrders.length === 0 ? (
            <p className="no-orders-message">No orders available</p>
          ) : (
            bookedOrders.map((order) => {
              const orderStatus = getOrderStatus(order?.order_status);
              return (
                <div key={order.order_id} className="order-card">
                  <div className="order-div">
                    <div className="order-id">
                      <div style={{ color: "#9252AA" }}>
                        Order Id: #{10800 + order.order_id}
                      </div>
                    </div>
                    <div className="order-status">
                      <span className={orderStatus.className}>
                        {orderStatus.status}
                      </span>
                      <h6 className="mt-2" style={{ color: "#9252AA" }}>
                        {getOrderType(order?.type)}
                      </h6>
                    </div>
                  </div>
                  <div className="order-details">
                    <div className="left-details">
                      <div>
                        <Image
                          className="contact-us-img"
                          src={date_time_icon}
                          height={20}
                          width={20}
                        />{" "}
                        <span>{formatDate(order.order_date)}</span>
                      </div>
                      {order.order_time && (
                        <div>
                          <Image
                            className="contact-us-img"
                            src={clock}
                            height={20}
                            width={20}
                          />{" "}
                          <span>
                            {order.order_time.split(" - ")[0].split(" ")[0]}{" "}
                            {order.order_time.split(" - ")[0].split(" ")[1]}
                          </span>
                          {/* <span>{order.order_time.split(" - ")[0]}</span> */}
                        </div>
                      )}
                      {order.no_of_people > 0 && (
                        <div>
                          <Image
                            className="contact-us-img"
                            src={people}
                            height={20}
                            width={20}
                          />{" "}
                          <span>{order.no_of_people}</span>
                        </div>
                      )}
                    </div>

                    <div className="right-details">
                      {order.order_locality && (
                        <div>
                          <strong
                            style={{ color: "#9252AA", fontSize: "15px" }}
                          >
                            {order.order_locality}
                          </strong>
                        </div>
                      )}
                      <div>
                        <strong style={{ color: "#9252AA", fontSize: "14px" }}>
                          {/* Balance Amount */}
                          Amount
                          <p className="mb-0 price-para">
                            {"₹" + order.balance_amount}
                          </p>
                        </strong>
                      </div>
                    </div>
                  </div>
                  <hr className="m-0" />
                  <div className="d-flex button-div">
                    <button
                      className="view-details"
                      onClick={() => handleViewDetail(order)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Orderlist;
