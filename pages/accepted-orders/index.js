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

const Orderlist = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);

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
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(today.getDate() + index);
      return date.toISOString().split("T")[0];
    });
    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

  useEffect(() => {
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
            page: "1",
            _id: supplierID,
          }),
        });

        const responseData = await response.json();
        console.log(responseData, "responsedaa");

        console.log(responseData.data.order[0].toId, "toId accept");

        if (responseData && responseData.data && responseData.data.order) {
          const sortedOrders = responseData.data.order.sort(
            (a, b) => new Date(b.order_date) - new Date(a.order_date)
          );

          setOrders(sortedOrders);
        } else {
          console.log("No orders found");
        }
      } catch (error) {
        console.log("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderList();
  }, [supplierID]);

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
      const cityMatches =
        order.addressId[0].city.toLowerCase() === supplierCity.toLowerCase() ||
        (order.addressId[0].city.toLowerCase() === "bengaluru" &&
          supplierCity.toLowerCase() === "bangalore");
      const supplierIdMatches = order.toId == supplierID;
      const typeMatches = order.type.toString() === supplierJobType;
      const isBooked =
        order.order_status === 1 ||
        order.order_status === 2 ||
        order.order_status === 3;
      const dateMatches = order.order_date.split("T")[0] === date; 
      return (
        cityMatches &&
        typeMatches &&
        supplierIdMatches &&
        isBooked &&
        dateMatches
      );
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

  if (orders.length === 0) {
    return (
      <center>
        <div className="no-orders">
          <h4>No Orders. Please continue shopping with Hora.</h4>
          <button className="button-style" onClick={openContinueShopping}>
            Continue Shopping
          </button>
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
                          <div key={order.order_id} className="order-card">
                            <div className="order-div">
                              <div className="order-id">
                                <div style={{ color: "#9252AA" }}>
                                  Order Id: {order.order_id}
                                </div>
                                <h6
                                  className="order-otp mt-2"
                                  style={{ color: "#9252AA" }}
                                >
                                  OTP: {order?.otp}
                                </h6>
                              </div>

                              {/* Order Status Section */}
                              <div className="order-status">
                                <span className={orderStatus.className}>
                                  {orderStatus.status}
                                </span>
                                <h6
                                  className="mt-2"
                                  style={{
                                    color: "#9252AA",
                                    marginTop: "10px",
                                    marginLeft: "10px",
                                  }}
                                >
                                  {getOrderType(order?.type)}
                                </h6>
                              </div>
                            </div>

                            {/* Order Details Section */}
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
                                    <span>{order.order_time}</span>
                                  </div>
                                )}
                                {supplierJobType !== "1" &&
                                  order.no_of_people && (
                                    <div>
                                      <Image
                                        className="contact-us-img"
                                        src={people}
                                        height={20}
                                        width={20}
                                      />{" "}
                                      <span>{order?.no_of_people}</span>
                                    </div>
                                  )}
                              </div>
                              <div className="right-details">
                                {order.addressId?.[0]?.city && (
                                  <div>
                                    <strong
                                      style={{
                                        color: "#9252AA",
                                        fontSize: "13px",
                                      }}
                                    >
                                      City
                                      <p
                                        style={{ textAlign: "end", margin: 0 }}
                                      >
                                        {order.addressId[0].city}
                                      </p>
                                    </strong>
                                  </div>
                                )}
                                <div>
                                  {order.phone_no ? (
                                    order.total_amount - order.advance_amount
                                  ) : (
                                    <strong
                                      style={{
                                        color: "#9252AA",
                                        fontSize: "13px",
                                      }}
                                    >
                                      Balance Amount
                                      {order?.type === 2 ||
                                      order?.type === 3 ||
                                      order?.type === 4 ||
                                      order?.type === 5 ? (
                                        <p className="mb-0 price-para">
                                          {"₹" +
                                            Math.round(
                                              (order?.payable_amount * 4) / 5
                                            )}
                                        </p>
                                      ) : order?.type === 6 ||
                                        order?.type === 7 ? (
                                        <p className="mb-0 price-para">
                                          {"₹" +
                                            Math.round(
                                              order?.payable_amount * 0.35
                                            )}
                                        </p>
                                      ) : (
                                        <p className="mb-0 price-para">
                                          {"₹" +
                                            Math.round(
                                              order?.payable_amount * 0.65
                                            )}
                                        </p>
                                      )}
                                    </strong>
                                  )}
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
