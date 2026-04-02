
import React, { useEffect, useState, useRef } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";
import Layout from "../../component/Layout";
import Popup from "../../apiconstant/popup";
import informationImage from "../../assets/information.webp";
import socket, { connectSocket } from "../../socket"
import dangerImage from "../../assets/danger.png";
import OrderList from "../../component/OrderList/index.jsx";

const Orderlist = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [executor, setExecutor] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  let supplierJobType;
  let supplierID;

  let supplierCity;

  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    supplierJobType = localStorage.getItem("supplierJobType");
    supplierID = localStorage.getItem("supplierID");
    supplierCity = localStorage.getItem("supplierCity");
  }

  if (supplierCity === "Bengaluru") {
    supplierCity = "Bangalore";
  }

  useEffect(() => {
    const today = new Date();
    const dates = Array.from({ length: 13 }, (_, index) => {
      const date = new Date();
      date.setDate(today.getDate() + index);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    });

    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

    const fetchOrderList = async () => {
      try {
        setLoading(true);
        const response = await fetch(BASE_URL + ORDERLIST_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: 1,
            per_page: 1000,
            status: 1,
            order_status: 1,
            type: Number(supplierJobType),
            order_locality:
              supplierCity.charAt(0).toUpperCase() +
              supplierCity.slice(1).toLowerCase(),
            toId: supplierID,
          }),
        });
if(response.ok){
const responseData = await response.json();

        if (responseData && responseData.data && responseData.data.order) {
          const sortedOrders = responseData.data.order.sort((a, b) => {
            const dateA = a.order_date.split("T")[0];
            const dateB = b.order_date.split("T")[0];
            return dateB.localeCompare(dateA);
          });

          setOrders(sortedOrders);
        } else {
          console.log("No orders found");
        }
}
else{
  alert("Failed to fetch orders. Please try again later.");
} 
      } catch (error) {
        console.log("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

useEffect(() => {
  if (!supplierID) return;

  fetchOrderList(); 
}, [supplierID]);

useEffect(() => {
  const userId = localStorage.getItem("supplierID");
  if (!userId) return; 

  const socket = connectSocket(userId);

  if (!socket) return;

  socket.on("order:updated", (data) => {
    setOrders((prev) => [data, ...prev]);
  });

  return () => {
    socket.off("order:updated");
  };
}, []); // ok, but only if userId always exists
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
    if (!dateString) return "";

    const cleanDate = dateString.split("T")[0];
    const [year, month, day] = cleanDate.split("-");

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openContinueShopping = () => {
    router.push("/");
  };

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    localStorage.setItem("orderId", updateOrderId);
    return updateOrderId;
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const filteredOrdersByDate = (date) => {
    return orders.filter((order) => {
      const isAcccepted = order.order_status === 1;
      let dateMatches = "";
      if (order.order_date) {
        dateMatches = order.order_date.split("T")[0] === date;
      }
      return isAcccepted && dateMatches;
    });
  };

  const handleViewDetail = (order) => {
    const { _id, order_id, type } = order;
    const apiOrderId = _id;
    const orderType = type;
    const orderId = order_id;
    router.push({
      pathname: `/accept-order-view-details`,
      query: { apiOrderId, orderType, orderId },
    });
  };

  const parseTime = (timeString, date) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "AM" && hours === "12") {
      hours = "0";
    }

    const parsedDate = date ? new Date(date) : new Date();
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const day = parsedDate.getDate();

    return new Date(
      year,
      month,
      day,
      parseInt(hours, 10),
      parseInt(minutes, 10),
      0
    );
  };

  const isWithinFourHourWindow = (orderTimeRange, orderDate) => {
    const [startTimeString] = orderTimeRange.split(" - ");
    const startTime = parseTime(startTimeString, orderDate);
    const twoHoursBeforeStartTime = startTime.getTime() - 5 * 60 * 60 * 1000;
    const twoHoursAfterStartTime = startTime.getTime() + 5 * 60 * 60 * 1000;

    const currentTime = new Date();
    return (
      currentTime.getTime() >= twoHoursBeforeStartTime &&
      currentTime.getTime() < twoHoursAfterStartTime
    );
  };

  const openSupplierPopup = async (order) => {
    const { _id, order_id, type, fromId } = order;

    const apiOrderId = _id;
    const orderType = type;
    const orderId = fromId;

    try {
      // Fetch executor details from the API
      const response = await fetch(
        `https://horaservices.com:3000/api/admin/getUserDetails/${orderId}`
      );



      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();

      const executorName = data.data.name;
      const executorPhone = data.data.phone;

      setPopupMessage({
        img: informationImage,
        title: `Customer Name: ${executorName}`,
        body: `Customer Phone: ${executorPhone}`,
        button: "Call Customer",
        executorPhone: executorPhone,
        onButtonClick: (phone) => {
          if (phone) {
            window.location.href = `tel:${phone}`;
          } else {
            alert("Phone number not available.");
          }
        },
      });

      setIsPopupVisible(true);
    } catch (error) {
      console.error(error.message);
      setIsPopupVisible(true);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setIsPopupVisible(false);
  };

  if (loading) {
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

  return (
    <Layout>
      <main className="order-list">
        <div className="orders-by-date">
          {availableDates.map((date) => {
            const ordersForDate = filteredOrdersByDate(date);
            const isExpanded = expandedDate === date;
            return (
              <div key={date} className="date-section">
                <div
                  className="date-header-container"
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                >
                  <h3 className="date-header">{formatDate(date)}</h3>
                  <span className="order-count">
                    {ordersForDate.length}{" "}
                    {ordersForDate.length === 1 ? "order" : "orders"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="order-container">
                    {ordersForDate.length === 0 ? (
                      <p>No orders for this date</p>
                    ) : (
                      ordersForDate.map((order) => {
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
                            balanceAmount={order.balance_amount}
                            noOfPeople={order.no_of_people}
                            viewDetailsHandler={() => handleViewDetail(order)}
                            customerDetailsBtnShow={true}
                            customerDetailsHandler={() => {
                              if (
                                isWithinFourHourWindow(
                                  order.order_time,
                                  order.order_date
                                )
                              ) {
                                openSupplierPopup(order);
                                setIsPopupVisible(true);
                              } else {
                                setPopupMessage({
                                  img: dangerImage,
                                  title:
                                    "Customer details will be shown 5 hours before your scheduled time to avoid distractions. 🙂",
                                  body: "",
                                  button: "OK",
                                });
                                setIsPopupVisible(true);
                              }
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                )}
                {isPopupVisible && (
                  <Popup
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                    onClose={closePopup}
                    popupMessage={popupMessage}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>
    </Layout>
  );
};

export default Orderlist;
