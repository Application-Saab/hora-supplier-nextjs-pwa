import React, { useEffect, useState } from "react";
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import { FaRegCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { IoCalendarClear } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import clock from "../../assets/bell.png";
import people from "../../assets/people.png";
import star from '../../assets/ratingStar.jpg'
import date_time_icon from "../../assets/date-time-icon.png";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "../../component/Layout";

const SupplierRating = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  //order_status: { type: Number, default: 0 /* 0-Booking ,1-Accepted ,2-pending/in-progress, 3-delivery/completed, 4-failed, 5- handle -> {1,2,3}, 6- expire  */ }

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
    supplierCity = "Bangalore"; // Adjusting for city name
  }


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
            page: 1,
            per_page: 4000,
            status: 1,
            order_status: 3,
            type: Number(supplierJobType),
            order_locality: supplierCity.charAt(0).toUpperCase() + supplierCity.slice(1).toLowerCase(),
            toId:supplierID,
          }),
        });

        const responseData = await response.json();
        console.log(responseData, "responsedata");

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
        <div className="order-container">
          <h5>Cmpleted Orders with Customer Rating<span> <Image
            src={star}
            alt="Star"
            height={20} // Adjust height to fit design
            width={20}  // Adjust width to fit design
            className="star-icon"
          /></span></h5>
          {orders.length === 0 ? (
            <p className="no-orders-message">No orders available</p>
          ) : (
            orders.map((order) => {
              const orderStatus = getOrderStatus(order?.order_status);
              return (
                <div key={order.order_id} className="order-card1">
                  <div className="order-div1">
                    <div className="order-id1">
                      <div style={{ color: "#9252AA" }}>
                        Order Id: #{10800 + order.order_id}
                      </div>

                    </div>
                    <div className="order-status1">
                      
                      <h6 className="mt-2" style={{ color: "#9252AA" }}>
                        {getOrderType(order?.type)}
                      </h6>
                    </div>
                  </div>

                 
                    <div className="user-review" style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        <b>Customer rating:</b></span>
                      {/* <Image
                        src={star}
                        alt="Star"
                        height={20} // Adjust height to fit design
                        width={20}  // Adjust width to fit design
                        className="star-icon"
                      /> */}
            {order.userReviewRatingArray.length > 0 ? (
  <span style={{ fontSize: '13px', paddingLeft: '10px' }}>
    <b>{order.userReviewRatingArray}</b>
  </span>
) : (
  <span style={{ fontSize: '13px', fontWeight: '500' , paddingLeft:"10px" }}>
    <b>No rated</b>
  </span>
)}
                    </div>
                 


                  {/* <hr className="m-0" /> */}
                  {/* <div className="d-flex button-div" style={{ textAlign: 'center' }}>
                    <button
                      className="view-details"
                      onClick={() => handleViewDetail(order)}
                    >
                      View Order Details
                    </button>
                  </div> */}
                </div>
              );
            })
          )}
        </div>
      </main>
    </Layout>
  );
};

export default SupplierRating;