import React, { useState, useEffect, useRef } from "react";
// import daal_image from "../../assets/daal_image.png";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
// import { BASE_URL, ORDER_CANCEL } from "../../utils/apiconstants";
// import { useNavigate } from "react-router-dom";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import { Form } from "react-bootstrap";
import { useRouter } from "next/router";
import { BASE_URL, ACCEPT_ORDER, START_ORDER } from "../../../apiconstant/apiconstant";

// const BASE_URL = "";
// const ORDER_CANCEL = "";
// order.type is 2 for chef
// order.type is 1 for decoration
// order.type is 3 for waiter
// order type 4 bar tender
// order type 5 cleaner
// order type 6 Food Delivery
// order type 7 Live Catering

const OrderDetailTab = ({
  orderDetail,
  orderType,
  decorationItems,
  decorationComments,
  decorationAddon,
  balanceAmount
}) => {
  const router = useRouter();
  const { apiOrderId } = router.query;
  const [tab, setTab] = useState("Menu");
  const [orderStatus, setOrderStatus] = useState(orderDetail?.order_status);

  const [supplierID, setSupplierID] = useState(null);
  const [otp, setOtp] = useState(null);

  const [otp1, setOtp1] = useState(["", "", "", ""]);
  const [isOtpMatched, setIsOtpMatched] = useState(false);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");


  let orderOtp;

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    
  orderOtp = localStorage.getItem("orderOtp");
  }	

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupplierID(localStorage.getItem("supplierID"));
      setOtp(localStorage.getItem("otp"));
    }
  }, []);



  const getItemInclusion = (inclusion) => {
    if (!Array.isArray(inclusion) || inclusion.length === 0) {
      return null;
    }
    const htmlString = inclusion[0];
    const withoutTags = htmlString.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const withoutSpecialChars = withoutTags.replace(/&#[^;]*;/g, ' '); // Replace &# sequences with space
    const statements = withoutSpecialChars.split('<div>');
    const inclusionItems = statements.flatMap(statement => statement.split("-").filter(item => item.trim() !== ''));
    const inclusionList = inclusionItems.map((item, index) => (
      <li key={index} className="inclusionstyle">
        {item.trim()}
      </li>
    ));
    return (
      <div>
        <ul>
          {inclusionList}
        </ul>
      </div>

    );
  };

  const cancelOrder = async () => {
    try {
      const token = await localStorage.getItem("token");

      const response = await fetch(BASE_URL + ACCEPT_ORDER, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Authorisation: token,
          otp: otp,
          _id: apiOrderId,
          userId: supplierID,
        }),
      }); 

      alert("Order accepted successfully");
      // router.push("/orderlist");
    } catch (error) {
      console.log("cancelOrder error", error);
    }
  };

  const contactUsRedirection = async () => {
    try {
      window.open(
        `whatsapp://send?phone=+918982321487&text=I've canceled my order, kindly assist with the refund process. Thanks!`
      );
    } catch (error) {
      console.log("contactUsRedirection error", error);
    }
  };

  const cancelcontactUsRedirection = async () => {
    try {
      window.open(
        "whatsapp://send?phone=+918982321487&text=I%20have%20canceled%20my%20order%20kindly%20assist%20with%20the%20refund%20process%20Thanks!"
      );
    } catch (error) {
      console.log("cancelcontactUsRedirection error", error);
    }
  };

  const handleDivClick = () => {
    setShowOtpInputs(true);
  };

  const handleChange = (value, index) => {
    const newOtp = [...otp1];
    newOtp[index] = value;
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
    const currDate = new Date().toLocaleDateString();
    const currTime = new Date().toLocaleTimeString();

    const currDateTime = currDate + currTime;
    try {
      const token =  localStorage.getItem("token");

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
      {/* <div className="chef-details">
        <img src="chef-image.jpg" alt="Chef" className="chef-image" />
        <div className="chef-info">
          <h3>Rahul Kumar Gupta</h3>
          <p>⭐⭐⭐⭐</p>
          <button className="rate-us-button">Rate Us</button>
        </div>
      </div> */}

      {parseInt(orderType) === 2 ? (
        <div>
          <div className="tabs">
            <button
              className={`${tab === "Menu" ? "tab active" : "tab"}`}
              onClick={() => setTab("Menu")}
            >
              Menu
            </button>
            <button
              className={`${tab === "Appliances" ? "tab active" : "tab"}`}
              onClick={() => setTab("Appliances")}
            >
              Appliances
            </button>
            <button
              className={`${tab === "Ingredients" ? "tab active" : "tab"}`}
              onClick={() => setTab("Ingredients")}
            >
              Ingredients
            </button>
          </div>
          {tab === "Menu" && (
            <OrderDetailsMenu orderDetail={orderDetail} orderType={orderType} />
          )}
          {tab === "Appliances" && (
            <OrderDetailsAppliances
              orderDetail={orderDetail}
              orderType={orderType}
            />
          )}
          {tab === "Ingredients" && (
            <OrderDetailsIngre
              orderDetail={orderDetail}
              orderType={orderType}
            />
          )}
        </div>
      ) : orderType === 6 ? (
        <>
          <OrderDetailsMenu orderDetail={orderDetail} orderType={orderType} />
          <div className="food-delivert-inclusions-container">
            <h5>Inclusions:</h5>
            <ul className="list-unstyled-inclusion">
              <li>
                <span>✔️</span> Food Delivery at Door-Step
              </li>
              <li>
                <span>✔️</span> Free Delivery
              </li>
              <li>
                <span>✔️</span> Hygienically Packed boxes
              </li>
              <li>
                <span>✔️</span> Freshly Cooked Food
              </li>
              <li>
                <span>✔️</span> Quality Disposable set of Plates & Spoons &
                forks
              </li>
              <li>
                <span>✔️</span> Water bottles (small bottles equal to number of
                people)
              </li>
            </ul>
          </div>
        </>
      ) : orderType === 7 ? (
        <>
          <OrderDetailsMenu orderDetail={orderDetail} orderType={orderType} />
          <div class="live-catering-container">
            <div class="live-catering-title">Inclusion:</div>
            <ul class="live-catering-inclusions">
              <li>✔️ Well Groomed Waiters (2 Nos)</li>
              <li>
                ✔️ Bone-china Crockery & Quality disposal for loose items.
              </li>
              <li>✔️ Transport (to & fro)</li>
              <li>✔️ Dustbin with Garbage bag</li>
              <li>✔️ Head Mask for waiters & chefs</li>
              <li>✔️ Tandoor/Other cooking Utensiles</li>
              <li>✔️ Chafing Dish</li>
              <li>✔️ Cocktail Napkins</li>
              <li>✔️ 2 Chef</li>
              <li>✔️ Water Can (Bisleri)(20 litres)</li>
              <li>✔️ Hand gloves</li>
            </ul>
            <div class="live-catering-title">Exclusion:</div>
            <ul class="live-catering-exclusions">
              <li>
                ❌ Buffet table/kitchen table is in client scope (can be
                provided at additional cost)
              </li>
            </ul>
          </div>
        </>
      ) : orderType === 1 ? (
        <div className="decoration-container">
          {decorationItems?.map((product, index) => {
            return (
              <div key={product?.id} className="product-container">
                <div className="product-image-container">
                  <Image
                    src={`https://horaservices.com/api/uploads/${product?.featured_image}`}
                    alt={product?.name}
                    className="product-image"
                    height={300}
                    width={300}
                    style={{ height: "auto", width: "auto" }}
                  />
                </div>
                <div className="product-info">
                  <p className="product-name">{product?.name}</p>
                  {/* <p className="product-price">₹{product?.price}</p> */}
               

                  <h6 className="product-inclusion">
                  <div class="product-page-heading">Inclusion</div>
                      {getItemInclusion(product?.inclusion)}
                  
                  </h6>

                  <div className="product-add-ons prod_sec">
                  <p className="product-page-heading">AddOns:</p>
                  <ul>
                  {
                    decorationAddon.map((item, index) => (
                      <li key={index}>
                        <div>{item.name} {item.title}</div>
                      </li>
                          )
                          )}
                    </ul>
                </div>

<div className="prod_sec balanc_amount">
                    <div className="product-page-heading">
                      Balance Amount:
                    </div>
                    <div>
                      ₹{balanceAmount}
                    </div>
                  </div>

                  {decorationComments && (
            <div className="comment-container prod_sec">
              <p className="product-page-heading">Additional Comments:</p>
              <p className="comments-text">{decorationComments}</p>
            </div>
          )}
                </div>
              </div>
            );
          })}
          
          
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
      ) : null}

      {/* <div className="rate-us-footer">
        <button className="rate-us-button">Rate Us</button>
      </div> */}
      {/* 
<div onClick={cancelOrder}>
          <button className="acceptOrder">Job Started</button>
        </div> */}
    </>
  );
};

export default OrderDetailTab;
