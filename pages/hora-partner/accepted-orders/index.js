import React, { useEffect, useState } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../../apiconstant/apiconstant.js";
import { useRouter } from "next/router";
import Layout from "../../../component/Layout.js";
import Popup from "../../../apiconstant/popup.js";
import informationImage from "../../../assets/information.webp";
import { connectSocket } from "../../../socket.js";
import dangerImage from "../../../assets/danger.png";
import OrderList from "../../../component/OrderList/index.jsx";

const Orderlist = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
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
    setExpandedDate(dates[0]);
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
      if (response.ok) {
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
      } else {
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

    const socketInstance = connectSocket(userId);

    if (!socketInstance) return;

    socketInstance.on("order:updated", (data) => {
      setOrders((prev) => [data, ...prev]);
    });

    return () => {
      socketInstance.off("order:updated");
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

  const filteredOrdersByDate = (date) => {
    return orders.filter((order) => {
      const isAccepted = order.order_status === 1;
      let dateMatches = "";
      if (order.order_date) {
        dateMatches = order.order_date.split("T")[0] === date;
      }
      return isAccepted && dateMatches;
    });
  };

  const handleViewDetail = (order) => {
    const { _id, order_id, type } = order;
    const apiOrderId = _id;
    const orderType = type;
    const orderId = order_id;
    router.push({
      pathname: `/hora-partner/accept-order-view-details`,
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
    const orderId = fromId;

    try {
      const response = await fetch(
        `https://horaservices.com/api/admin/getUserDetails/${orderId}`
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
    setIsPopupVisible(false);
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.headerWrapper}>
            <h2 style={styles.heading}>Accepted Orders</h2>
            <p style={styles.subHeading}>Loading upcoming schedule...</p>
          </div>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={styles.skeletonCard}>
              <div style={{ ...styles.skeletonPulse, width: "40%", height: "20px", marginBottom: "12px" }} />
              <div style={{ ...styles.skeletonPulse, width: "100%", height: "60px" }} />
            </div>
          ))}
        </div>
        <style jsx global>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.headerWrapper}>
          <h2 style={styles.heading}>Accepted Orders</h2>
          <p style={styles.subHeading}>Manage and view your upcoming assignments</p>
        </div>

        <main className="order-list" style={styles.orderListContainer}>
          <div className="orders-by-date">
            {availableDates.map((date) => {
              const ordersForDate = filteredOrdersByDate(date);
              const isExpanded = expandedDate === date;
              const hasOrders = ordersForDate.length > 0;

              return (
                <div key={date} style={styles.dateCard}>
                  {/* Accordion Header */}
                  <div
                    style={styles.dateHeaderContainer(isExpanded, hasOrders)}
                    onClick={() => setExpandedDate(isExpanded ? null : date)}
                  >
                    <div style={styles.dateTitleGroup}>
                      <span style={styles.calendarIcon}>📅</span>
                      <h3 style={styles.dateHeader}>{formatDate(date)}</h3>
                    </div>

                    <div style={styles.badgeGroup}>
                      <span style={styles.orderCountBadge(hasOrders)}>
                        {ordersForDate.length} {ordersForDate.length === 1 ? "Order" : "Orders"}
                      </span>
                      {/* Premium SVG Dropdown Arrow Icon */}
                      <span style={styles.dropdownIconWrapper(isExpanded)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div style={styles.orderContainer}>
                      {ordersForDate.length === 0 ? (
                        <div style={styles.emptyState}>
                          <p style={{ margin: 0 }}>No accepted orders scheduled for this date.</p>
                        </div>
                      ) : (
                        ordersForDate.map((order) => {
                          const orderStatus = getOrderStatus(order?.order_status);
                          return (
                            <div key={order.order_id} style={styles.orderItemWrapper}>
                              <OrderList
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
                                order_status={order?.order_status}
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
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {isPopupVisible && (
          <Popup
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClose={closePopup}
            popupMessage={popupMessage}
          />
        )}
      </div>
    </Layout>
  );
};

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
    marginBottom: "18px",
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
  dateCard: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    marginBottom: "12px",
    overflow: "hidden",
    border: "1px solid #eef0f3",
  },
  dateHeaderContainer: (isExpanded, hasOrders) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: isExpanded ? "#fbf7fc" : "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    borderBottom: isExpanded ? "1px solid #f0e6f2" : "none",
  }),
  dateTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  calendarIcon: {
    fontSize: "15px",
  },
  dateHeader: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  },
  badgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  orderCountBadge: (hasOrders) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: hasOrders ? "#9c4d97" : "#e4e7eb",
    color: hasOrders ? "#ffffff" : "#7f8c8d",
  }),
  dropdownIconWrapper: (isExpanded) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7f8c8d",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "#f1f2f6",
    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  }),
  orderContainer: {
    padding: "12px 0px",
    background: "#fafafa",
  },
  orderItemWrapper: {
    marginBottom: "10px",
  },
  emptyState: {
    padding: "20px",
    textAlign: "center",
    color: "#95a5a6",
    fontSize: "13px",
    background: "#fff",
    borderRadius: "8px",
    border: "1px dashed #dcdde1",
  },
  skeletonCard: {
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #e1e4e8",
  },
  skeletonPulse: {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "6px",
  },
};

export default Orderlist;