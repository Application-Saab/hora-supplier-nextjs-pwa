import React, { useEffect, useState,useRef } from "react";
import { Form } from "react-bootstrap";
import OrderDetailHeader from "./OrderDetailHeader/index";
import OrderDetailTab from "./OrderDetailTab/index";
import {
  BASE_URL,
  GET_DECORATION_DETAILS,
  ORDER_DETAILS_ENDPOINT,
  GET_BOOKING_ORDER_DETAILS,
  START_ORDER
} from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";
import Layout from "../../component/Layout";

// order.type is 2 for chef
// order.type is 1 for decoration
// order.type is 3 for waiter
// order type 4 bar tender
// order type 5 cleaner
// order type 6 Food Delivery
// order type 7 Live Catering

const OrderDetail = () => {

  const router = useRouter();
  let { apiOrderId, orderType, orderId } = router.query;
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState([]);
  const [decorationItems, setDecorationItems] = useState([]);
  const [decorationComments, setDecorationComments] = useState("");
  const [decorationAddon, setDecorationAddon] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");

  orderType = parseInt(orderType);
const [otp, setOtp] = useState(null);

  const [supplierID, setSupplierID] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(localStorage.getItem("otp"),"faltu");
      setSupplierID(localStorage.getItem("supplierID"));
      setOtp(localStorage.getItem("otp"));
    }
  }, []);

  const [otp1, setOtp1] = useState(["", "", "", ""]);
    const [isOtpMatched, setIsOtpMatched] = useState(false);
    
      const [errorMessage, setErrorMessage] = useState("");
      const inputRefs = useRef([]);
      
      
  let orderOtp;

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    
  orderOtp = localStorage.getItem("orderOtp");
  }	

  

  useEffect(() => {
    if (
      orderType == 2 ||
      orderType === 6 ||
      orderType === 7 ||
      orderType === 8
    ) {
      fetchOrderDetailsMenu();
    } else if (orderType === 1) {
      // alert("if orderType = 1");
      fetchDecorationOrderDetails();
    }
  }, [orderType, orderId, apiOrderId]);

  useEffect(() => {
    if (orderType === 3 || orderType === 4 || orderType === 5) {
      fetchOrderDetails();
    }
  }, [orderType, orderId, apiOrderId]);

  const fetchOrderDetailsMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + ORDER_DETAILS_ENDPOINT + "/v1/" + apiOrderId
      );
      const responseData = await response.json();
      setOrderDetail(responseData.data);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchDecorationOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + GET_BOOKING_ORDER_DETAILS + "/" + orderId
      );
      const responseData = await response.json();
      console.log(responseData, "responsedata");

      setOrderDetail(responseData.data._doc);
      // setOrderDetail(responseData?.data?._doc);
      // setDecorationItems(responseData?.data?.items[0]?.decoration);
      setDecorationItems(responseData.data.items[0].decoration);
      setDecorationComments(responseData?.data?._doc.decoration_comments);
      setDecorationAddon(responseData.data._doc.add_on);
      setBalanceAmount(responseData.data._doc.balance_amount);
            setLoading(false);
    } catch (error) {
      console.log("fetchDecorationOrderDetails error", error);
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + ORDER_DETAILS_ENDPOINT + "/v1/" + apiOrderId
      );
      const responseData = await response.json();

      setOrderDetail(responseData.data);
      setHospitalityServiceCount(responseData.data.no_of_people);
      setHospitalityServiceTotalAmount(responseData.data.total_amount);
      setLoading(false);
    } catch (error) {
      console.log("fetchOrderDetails error", error);
      setLoading(false);
    }
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

  
    
  const handleChange = (value, index) => {
    const newOtp = [...otp1];
    newOtp[index] = value;
    console.log(newOtp, "newot");
    setOtp1(newOtp);

    if (value && index < otp1.length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.join("") === orderOtp) {
      setIsOtpMatched(true);
      setErrorMessage("");
    } else {
      setIsOtpMatched(false);
      if (newOtp.join("").length === otp1.length) {
        setErrorMessage("Wrong OTP, please try again.");
      } else {
        setErrorMessage("");
      }
    }
  };

  
    const handleSubmit = () => {
      console.log("clicked");
      const currDate = new Date().toLocaleDateString();
      const currTime = new Date().toLocaleTimeString();
  
      const currDateTime = currDate + currTime;
      try {
        const token =  localStorage.getItem("token");
        console.log(otp, "otp");
  
        const response =  fetch(BASE_URL + START_ORDER, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Authorisation: token,
            otp: otp,
            _id: apiOrderId,
            userId: supplierID,
            job_start_time: currDateTime
          }),
        }); 
  
        router.push({
          pathname:`/job-complete`, 
        query: { apiOrderId },
      });
      } catch (error) {
        console.log("acceptOrder error", error);
      }
    };
  


  return (
    <>
    <Layout backLink = "/accepted-orders">
      <div className="orderheader-orderdetail">
        <OrderDetailHeader orderDetail={orderDetail} />
        <div className="order-detail-page-decoration">
          <OrderDetailTab
            orderDetail={orderDetail}
            orderType={orderType}
            decorationItems={decorationItems}
            decorationComments={decorationComments}
            decorationAddon={decorationAddon}
            balanceAmount={balanceAmount}
          />
        </div>
        <div>
            <div className="otp-container">
              <h2 className="otp-title">Enter OTP</h2>
              <p className="otp-instructions">
                Please enter the OTP sent to your number
              </p>
              <div className="otp-inputs">
                {otp1.map((_, index) => (
                  <Form.Control
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp1[index]}
                    onChange={(e) => handleChange(e.target.value, index)}
                    className="otp-input"
                    ref={(el) => (inputRefs.current[index] = el)}
                  />
                ))}
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {isOtpMatched && (
                <button onClick={handleSubmit} className="startbutton">
                  Start Order
                </button>
              )}
            </div>
          </div>
      </div>
      </Layout>
    </>
  );
};

export default OrderDetail;
