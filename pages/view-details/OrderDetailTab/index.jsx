
import React, { useState } from "react";
// import daal_image from "../../assets/daal_image.png";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
// import { BASE_URL, ORDER_CANCEL } from "../../utils/apiconstants";
// import { useNavigate } from "react-router-dom";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import { Form } from 'react-bootstrap';
import { useRouter } from "next/router";
import { BASE_URL, ACCEPT_ORDER } from "../../../apiconstant/apiconstant";

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
}) => {
  const router = useRouter();
  const { apiOrderId } = router.query;
  const [tab, setTab] = useState("Menu");
  const [orderStatus, setOrderStatus] = useState(orderDetail?.order_status);

  console.log(apiOrderId, "apiOrderid");

  var supplierID = localStorage.getItem('supplierID');
  console.log(supplierID, "supplierID");

  var otp = localStorage.getItem('otp');
  console.log(otp, "otpotpotp");
  

  const getItemInclusion = (inclusion) => {
    if (!inclusion || !inclusion.length) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(inclusion[0], "text/html");
    const items = doc.body.childNodes;

    let result = "";

    items.forEach((item, index) => {
      if (item.nodeName === "DIV" || item.nodeName === "BR") {
        result += `${index + 1}: ${item.textContent.trim()}\n`;
      }
    });

    return result.trim();
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
          userId: supplierID
        }),
      }); // Replace with your API endpoint for updating user profile

      // Handle success response

      console.log(response, "responsedata");
      
            // "otp":2980, 
            // "_id":"643ba8ee71e3056f1a50dc8c", 
            // "userId":"6413340f549b58e3dc39a035"

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

  const [showOtpInputs, setShowOtpInputs] = useState(false);
  const [otp1, setOtp1] = useState(["", "", "", ""]); // State to store each OTP digit

  const handleDivClick = () => {
    setShowOtpInputs(true);
  };

  const handleChange = (value, index) => {
    const newOtp = [...otp1];
    newOtp[index] = value;
    setOtp1(newOtp);
  };

  const handleSubmit = () => {
    const otpValue = otp1.join(""); // Concatenate OTP values
    alert(`Entered OTP: ${otpValue}`);
    router.push('/images-upload');  
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
           <OrderDetailsAppliances orderDetail={orderDetail} orderType={orderType}/>
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
        <div  className="decoration-container">
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
                    style={{height:"auto", width:"auto"}}
                  />
                </div>
                <div className="product-info">
                  <p className="product-name">{product?.name}</p>
                  <p className="product-price">₹{product?.price}</p>
                  <h6 className="product-inclusion">
                    {getItemInclusion(product?.inclusion)}
                  </h6>
                </div>
              </div>
            );
          })}
            {decorationComments && (
            <div className="comment-container">
              <p className="comments-header">Additional Comments:</p>
              <p className="comments-text">{decorationComments}</p>
            </div>
          )}

          
<div>
{!showOtpInputs && (
        <div onClick={handleDivClick}>
          <button className="acceptOrder">Start Your Task</button>
        </div>
      )}

      {showOtpInputs && (
       <div className="otp-container">
       <h2 className="otp-title">Enter OTP</h2>
       <p className="otp-instructions">Please enter the OTP sent to your number</p>
       <div className="otp-inputs">
         {otp1.map((_, index) => (
           <Form.Control
             key={index}
             type="text"
             maxLength="1"
             value={otp1[index]}
             onChange={(e) => handleChange(e.target.value, index)}
             className="otp-input"
           />
         ))}
       </div>
       <button onClick={handleSubmit} className="startbutton" >Start Order</button>
     </div>
      )}
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
