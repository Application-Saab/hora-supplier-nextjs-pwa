import React from "react";
import { CiCalendar } from "react-icons/ci";
import { GoClock } from "react-icons/go";
import { MdPeopleAlt } from "react-icons/md";


const OrderDetailHeader = ({ orderDetail }) => {
  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    localStorage.setItem("orderId", updateOrderId);
    console.log(updateOrderId, "header");
    return updateOrderId;
  };
  const getOrderStatus = (orderStatusValue) => {
    if (orderStatusValue === 0) {
      return { status: "Booked", className: "status-booked-detail" };
    }
    if (orderStatusValue == 1) {
      return { status: "Accepted", className: "status-accepted-detail" };
    }
    if (orderStatusValue === 2) {
      return { status: "In-progress", className: "status-in-progress--detail" };
    }
    if (orderStatusValue === 3) {
      return { status: "Completed", className: "status-completed-detail" };
    }
    if (orderStatusValue === 4) {
      return { status: "Cancelled", className: "status-cancelled-detail" };
    }
    if (orderStatusValue === 5) {
      return { status: "", className: "status-empty-detail" };
    }
    if (orderStatusValue === 6) {
      return { status: "Expired", className: "status-expired-detail" };
    }
  };

  const orderStatus = getOrderStatus(orderDetail?.order_status);
  console.log(orderStatus, "orderstatus");

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };


  console.log(orderDetail.order_id, "id");
  console.log(orderDetail.order_date, "orderdate");
  console.log(orderDetail.no_of_people, "no_of_people");
  console.log(orderDetail.order_locality, "order locality");
  console.log(orderDetail.chef, "orderdetail chef");
  // console.log(orderDetail.addressId.address1, "aaddressId");
  
  // console.log(orderDetail.addressId[0].address1, "2aaddressId");

  return (
    <div>
      {/* <div className="order-header">
        <div className="order-header-left">
          <h5 className="order-id-h">
            Order Id: {getOrderId(orderDetail?.order_id)}
          </h5>
          <p className="order-status-button">{orderStatus?.status}</p>
        </div>
        <div className="order-header-right">
          <div className="order-info-div">
            <CiCalendar className="header-icons" size={20} style={{ marginLeft: "25px" }} />
            <p>{formatDate(orderDetail?.order_date)}</p>
          </div>
          <div className="order-info-div">
            <GoClock className="header-icons" size={20} style={{ marginLeft: "15px" }} />
            <p>{orderDetail?.order_time}</p>
          </div>
          <div className="order-info-div">
            <MdPeopleAlt className="header-icons" size={20} style={{ marginLeft: "15px" }} />
            <p>{orderDetail?.no_of_people} People</p>
          </div>
        </div>
      </div> */}

      {/* Booking Details Section */}
      <div style={styles.bookingContainer}>
        <div style={styles.bookingHeader}>
          <p style={styles.headerText}>Booking Details</p>
          <button style={styles.callButton}>📞</button>
        </div>
        
        {/* Left and Right Column for Details */}
        <div style={styles.detailsRow}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            <p><strong>Id:</strong> {getOrderId(orderDetail?.order_id)}</p>
            <p><strong>Name:</strong> Smith Jacobs</p>
            <p><strong>Date:</strong> {formatDate(orderDetail?.order_date)}</p>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            <p><strong>People:</strong> {orderDetail?.no_of_people} Ppl</p>
            <p><strong>Location:</strong> {orderDetail?.order_locality}</p>
            <p><strong>Chef:</strong> {orderDetail?.chef} Chef</p>
          </div>
        </div>

        {/* Centered Address */}
        <div style={styles.centeredAddress}>
          <p><strong>Address:</strong> {orderDetail.addressId?.address1}</p>
        </div>

        <button style={styles.directionsButton}>Get Directions</button>
      </div>
    </div>
  );
}

const styles = {
  bookingContainer: {
    backgroundColor: '#3744A0', // Blue color
    color: 'white',
    padding: '20px',
    borderRadius: '15px',
    margin: '10px',
    width: '340px',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  headerText: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  callButton: {
    backgroundColor: '#ff726f', // Red color for call button
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    width: '30px',
    height: '30px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  detailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  leftColumn: {
    textAlign: 'left',
    flex: '1',
  },
  rightColumn: {
    textAlign: 'right',
    flex: '1',
  },
  centeredAddress: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '14px',
  },
  directionsButton: {
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: 'transparent',
    color: '#ff726f',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '100px',
    textDecoration: 'underline',
  },
};

export default OrderDetailHeader;