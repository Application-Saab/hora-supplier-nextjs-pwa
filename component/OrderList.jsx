import Image from "next/image";
// import clock from "../assets/bell.png";
import people from "../assets/people.png";
// import date_time_icon from "../assets/date-time-icon.png";
import date_time_icon from '../assets/date-time-icon-copy.png'
import clock from '../assets/clock.png'

const OrderList = ({orderId, statusClassName, status, orderType, orderDate, orderTime, noOfPeople, orderLocality, balanceAmount,totalAmount, viewDetailsHandler, customerDetailsHandler, customerDetailsBtnShow }) => {
    return (
         <div className="orderlist-order-card">
                  <div className="orderlist-order-div header">
                     <div className="order-left-container">
                      <div style={{ color: "#fafafa", fontWeight: "600" }}>
                        Order Id: #{10800 + orderId}
                      </div>
                      <div className="order-type" style={{ color: "#fafafa", fontWeight: "300" }}>
                        {orderType}
                      </div>
                    </div>
                    <div className="orderlist-status">
                      <span className={statusClassName}>
                        {status} 
                      </span>
                    </div>
                  </div>
                  <div className="orderlist-order-details">
                    <div className="orderlist-left-details">
                      <div className="date-time">
                        <Image
                          className="contact-us-img"
                          src={date_time_icon}
                          height={18}
                          width={18}
                        />{" "}
                        <span className="date-time-text">{orderDate}</span>
                      </div>
                      <div className="date-time">
                        <Image
                          className="contact-us-img"
                          src={clock}
                          height={18}
                          width={18}
                        />{" "}
                        <span className="date-time-text">{orderTime}</span>
                      </div>
                    </div>
                    <div className="orderlist-right-details">
                      <div className="totalAmount">
                        <strong>
                          Total Amount
                          <p className="amount" style={{ textAlign: "start", margin: 0 }}>
                            {" "}
                            ₹{totalAmount || 0}
                          </p>
                        </strong>
                      </div>
                      <div className="BalanceAmount">
                        <strong>
                          Balance Amount
                          <p className="amount" style={{ textAlign: "start", margin: 0 }}>
                            {" "}
                            ₹{balanceAmount || 0}
                          </p>
                        </strong>
                      </div>
                    </div>
                  </div>
                 
                    <div className="orderlist-button-div">
                      <button
                        className="orderlist-view-details view-text-bg"
                        onClick={viewDetailsHandler}
                      >
                        View Details
                      </button>
                      {customerDetailsBtnShow &&
                        <button
                        className="orderlist-customer-details view-text-bg"
                        onClick={customerDetailsHandler}
                        >
                        Customer Details
                      </button>
                      }
                      
                    </div>
        </div>
    
    );
};

export default OrderList;