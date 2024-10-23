// // new-orders.js (as an example)
// import React from 'react';
// import Navbar from '../../component/Navbar';
// import Layout from '../../component/Layout';

// const NewOrders = () => {
//   return (
//     <Layout navTitle="Supplier New Order">
//     <div>
//         {/* <Navbar showSupplierLink={true} navTitle="New Orders" /> */}
//             <h1>New Orders Page 11</h1>
//       {/* Add content for this page */}
//     </div>
//     </Layout>
//   );
// };

// export default NewOrders;


import React, { useEffect, useState } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import { FaRegCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { IoCalendarClear } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import clock from "../../assets/bell.png";
import people from "../../assets/bell.png";
import date_time_icon from "../../assets/bell.png";
// import { WhatsappShareButton, WhatsappIcon } from "react-share";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "../../component/Layout";
// order.type is 2 for chef
// order.type is 1 for decoration
// order.type is 3 for waiter
// order type 4 bar tender
// order type 5 cleaner
// order type 6 Food Delivery
// order type 7 Live Catering

const Orderlist = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchOrderList = async () => {
      try {
        const userId = await localStorage.getItem("userID");
        setLoading(true);
        const response = await fetch(BASE_URL + ORDERLIST_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: "1",
            _id: userId,
          }),
        });
        const responseData = await response.json();

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
  }, []);

  const getOrderStatus = (orderStatusValue) => {
    if (orderStatusValue === 0) {
      return { status: "Booked", className: "status-booked" };
    }
    if (orderStatusValue == 1) {
      return { status: "Accepted", className: "status-accepted" };
    }
    if (orderStatusValue === 2) {
      return { status: "In-progress", className: "status-in-progress" };
    }
    if (orderStatusValue === 3) {
      return { status: "Completed", className: "status-completed" };
    }
    if (orderStatusValue === 4) {
      return { status: "Cancelled", className: "status-cancelled" };
    }
    if (orderStatusValue === 5) {
      return { status: "", className: "status-empty" };
    }
    if (orderStatusValue === 6) {
      return { status: "Expired", className: "status-expired" };
    }
  };

  const openContinueShopping = () => {
    router.push("/")
  }

  const getOrderType = (orderTypeValue) => {
    if (orderTypeValue == 1) {
      return "Decoration";
    }
    if (orderTypeValue === 2) {
      return "Chef";
    }
    if (orderTypeValue === 3) {
      return "Waiter";
    }
    if (orderTypeValue === 4) {
      return "Bar Tender";
    }
    if (orderTypeValue === 5) {
      return "Cleaner";
    }
    if (orderTypeValue === 6) {
      return "Food Delivery";
    }
    if (orderTypeValue === 7) {
      return "Live Catering";
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleRateUs = (order) => {
    const { } = order;
    window.open(
      "https://wa.me/917338584828?text=Hello%20I%20have%20some%20queries%20for%20decoration%20services",
      "_blank"
    );
  };

  const handleSendInvite = (order) => {
    let message = `You are Invited!!!\n* * * * * *\nEnjoy the gathering with specially cooked by professional chef from hora `;

    message += `${order.order_date.slice(0, 10)} ${order.order_time}\n`;

    order.selecteditems.forEach((dish, index) => {
      message += `${index + 1}. ${dish.name}\n`;
    });

    if (order.addressId) {
      message += `\nAt ${order.addressId.address1} ${order.addressId.address2}\nhttps://play.google.com/store/apps/details?id=com.hora`;
    }

    return message;
  };

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    localStorage.setItem("orderId", updateOrderId);
    return updateOrderId;
  };

  const handleViewDetail = (order) => {
    const { _id, order_id, type } = order;
    const apiOrderId = _id
    const orderType = type
    const orderId = order_id
    router.push({
        pathname:`/order-details`, 
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
          <h4>No Orders.. Please continue shopping with Hora</h4>
          <button className="button-style" onClick={openContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </center>
    );
  }

  return (
    <Layout>
      <div>
    <main className="order-list">
      <div className="order-container">
        {orders && orders.length > 0 ? (
          orders?.map((order) => {
            const orderStatus = getOrderStatus(order?.order_status);
            return (
              <div key={order.order_id} className="order-card">
                <div className="order-div">
                  <div className="order-id">
                    <div style={{ color: "#9252AA" }}>
                      Order Id: {getOrderId(order?.order_id)}
                    </div>
                    <h6 className="order-otp mt-2" style={{ color: "#9252AA" }}>
                      OTP: {order?.otp}
                    </h6>
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
                      {/* <IoCalendarClear color="#9252AA" size={20}/>{" "} */}
                      <Image
                        className="contact-us-img"
                        src={date_time_icon}
                        height={20}
                        width={20}
                      />{" "}
                      <span>{formatDate(order.order_date)}</span>
                    </div>
                    <div>
                      {/* <FiClock color="#9252AA" size={20}/>{" "} */}
                      <Image
                        className="contact-us-img"
                        src={clock}
                        height={20}
                        width={20}
                      />{" "}
                      <span>{order.order_time}</span>
                    </div>
                    <div>
                      {/* <FaUsers color="#9252AA" size={20}/>{" "} */}
                      <Image
                        className="contact-us-img"
                        src={people}
                        height={20}
                        width={20}
                      />{" "}
                      <span>{order?.no_of_people} People</span>
                    </div>
                  </div>
                  <div className="right-details">
                    <div>
                      <strong style={{ color: "#9252AA" }}>
                        Total Amount
                        <p style={{textAlign: "end" , margin: 0}}>
                          {" "}
                          ₹{order?.payable_amount}
                        </p>
                      </strong>
                    </div>
                    <div>
                      <strong style={{ color: "#9252AA" }}>
                        Balance Amount
                        {order?.type === 2 || order?.type === 3 || order?.type === 4 || order?.type === 5 ? (
                          <p className="mb-0 price-para">

                            {'₹' +
                              '' +
                              Math.round(
                                (order?.payable_amount * 4) / 5,
                              )}
                          </p>
                        ) : (
                          <p className="mb-0 price-para">

                            {'₹' +
                              '' +
                              Math.round(order?.payable_amount * 0.7)}
                          </p>
                        )}

                      </strong>
                    </div>
                  </div>
                </div>
                <hr className="m-0" />
                <div className="d-flex button-div">
                  <div>
                    <button
                      className="view-details"
                      onClick={() => handleViewDetail(order)}
                    >
                      View Details
                    </button>
                  </div>
                  {order?.type == 2 &&
                    (orderStatus?.status == "Booked" ||
                      orderStatus?.status == "Accepted" ||
                      orderStatus?.status == "In-progress" ? (
                      <div>
                        {/* <WhatsappShareButton
                          url="https://play.google.com/store/apps/details?id=com.hora"
                          title={handleSendInvite(order)}
                          separator="\n\n"
                        > */}
                          {/* <WhatsappIcon size={32} round /> */}
                          {/* <button
                            className="send-invite"
                            onClick={() => handleSendInvite(order)}
                          >
                            Send Invite
                          </button>
                        </WhatsappShareButton> */}
                      </div>
                    ) : null)}
                  {order?.type === 2 && orderStatus?.status == "Completed" ? (
                    <div>
                      <button
                        className="send-invite"
                        onClick={() => handleRateUs(order)}
                      >
                        Rate us
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-record-div m-5">
            <h2 className="no-record-heading">No record found</h2>
          </div>
        )}
      </div>
    </main>
    </div>
    </Layout>
  );
}

export default Orderlist;
