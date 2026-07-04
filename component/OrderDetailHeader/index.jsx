import React, { useEffect } from "react";

const OrderDetailHeader = ({ orderDetail }) => {

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };


  useEffect(() => {
    // Save OTP to localStorage
    localStorage.setItem("otp", orderDetail?.otp);
  }, [orderDetail?.otp]);

  return (
    <div>
      {/* Booking Details Section */}
      <div style={styles.bookingContainer}>

        {/* Left and Right Column for Details */}
        <div>
          <div className="headerDateContainer">
            {orderDetail?.order_date && (
              <p className="mt-2">
                <span className="fw-semiBold myOrderDetails-heading">Date:</span> {formatDate(orderDetail.order_date)}
              </p>
            )}

            <p className="mt-2">
              <span className="fw-semiBold myOrderDetails-heading">Arrival Time:</span>

              {orderDetail?.order_time && (() => {
                const firstTime = orderDetail.order_time.split(" - ")[0];
                const [hour, period] = firstTime.split(" ");
                return `${hour} ${period}`;
              })()}

            </p>
          </div>
          <div style={styles.leftColumn}>
            {orderDetail?.order_locality && (
              <p className="mt-2">
                <span className="fw-semiBold myOrderDetails-heading">Location:</span> {orderDetail.order_locality}
              </p>
            )}
          </div>
        </div>

        {orderDetail.addressId?.address1 && (
          <div style={styles.centeredAddress}>
            <p className="mt-2">
              <span className="fw-semiBold myOrderDetails-heading">Address:</span> {orderDetail.addressId.address1}
            </p>
            <p className="mt-2">
              <span className="fw-semiBold myOrderDetails-heading">Google Map Location:</span>{" "}
              <a href={orderDetail.addressId.address2} style={{ fontWeight: "bold", cursor: "pointer", wordWrap: "break-word", color: 'blue', borderBottom: '1px solid blue' }} target="_blank" rel="noopener">{orderDetail.addressId.address2}</a>
            </p>

          </div>
        )}
      </div>
    </div>
    // </Layout>
  );
};

const styles = {
  bookingContainer: {
    backgroundColor: "#fff", // Blue color
    color: "white",
    padding: "8px",
    borderRadius: "15px",
    width: "100%",
  },
  leftColumn: {
    textAlign: "left",
    flex: "1",
  },
  centeredAddress: {
    textAlign: "left",
    marginTop: "2px",
    fontSize: "14px",
  },

};

export default OrderDetailHeader;
