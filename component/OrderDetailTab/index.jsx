import React, { useState, useEffect } from "react";
// import daal_image from "../../assets/daal_image.png";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
// import { BASE_URL, ORDER_CANCEL } from "../../utils/apiconstants";
// import { useNavigate } from "react-router-dom";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import checkImage from "../../assets/tick.jpeg";
import { useRouter } from "next/router";
import { BASE_URL, ACCEPT_ORDER, GET_PHOTOGRAPHY_BY_NAME } from "../../apiconstant/apiconstant";
const axios = require("axios");

const OrderDetailTab = ({
  orderDetail,
  orderType,
  decorationItems,
  decorationComments,
  decorationAddon,
  balanceAmount,
}) => {
  const router = useRouter();
  const { apiOrderId } = router.query;
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    var otp = localStorage.getItem("orderOtp");

    var supplierID = localStorage.getItem("supplierID");
    
  }
  const [tab, setTab] = useState("Menu");
  const [orderStatus, setOrderStatus] = useState(orderDetail?.order_status);

  console.log(orderDetail.orderType,"ordertype");
  console.log(orderDetail.add_on, "orderdetails");
  console.log(orderDetail.balance_amount, "orderdetailsew");

  const [name, setname] = useState();
  const fetchAndMatchItems = async (orderDetail) => {
    try {
      const { items } = orderDetail;

      if (!items || items.length === 0) {
        return;
      }

      for (const itemId of items) {
        const url = `${BASE_URL}${GET_PHOTOGRAPHY_BY_NAME}`;

        try {
          const response = await axios.get(url);
          const apiData = response.data;

          if (apiData && apiData.data && apiData.data.length > 0) {
            const responseData = apiData.data[0];

            if (responseData._id === itemId) {
              console.log(`Match found for ID ${itemId}:`, responseData.name);
              setname(responseData.name);
            }
          }
        } catch (axiosError) {
          console.error(
            `Error fetching data for ID ${itemId}:`,
            axiosError.message
          );
        }
      }
    } catch (error) {
      console.error("Error in fetchAndMatchItems:", error);
    }
  };

  fetchAndMatchItems(orderDetail);

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

  const acceptOrder = async () => {
    try {
      const token = await localStorage.getItem("token");
      console.log(token,"accept token");

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
      console.log(otp, 'otp', apiOrderId, "_id", supplierID,"userid");
      console.log(response, "responseaccept");

      alert("Order accepted successfully");
      router.push("/accepted-orders");
    } catch (error) {
      console.log("acceptOrder error", error);
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

  
  const getDecorationComments = (comments) => {
    console.log(comments, "comments");
    if (!comments) return "N/A";
  
    const commentList = Array.isArray(comments) ? comments : comments.split("\n");
  
    return (
      <ul>
        {commentList.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {parseInt(orderType) == 2 ? (
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
      ) : orderType == 6 ? (
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
      ) : orderType == 7 ? (
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
        ) : orderType === 8 ? (
          <>
          <div className="decoration-container">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "10px",
                position: "relative",
              }}
              className="decDetails"
            >
              <div
                style={{ width: "50%", textAlign: "center" }}
                className="decDetailsLeft"
              ></div>
              <div
                style={{
                  width: "50%",
                  paddingLeft: "20px",
                  paddingRight: "50px",
                }}
                className="decDetailsRight"
              >
                <div
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "10px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      fontSize: "21px",
                      fontWeight: "#222",
                    }}
                  >
                    {name}
                  </h1>
                </div>

                <div
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "5px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                  }}
                >
                  {orderDetail?.add_on?.length > 0 && (
                    <>
                      <div className="product-page-heading">Inclusion</div>
                 
                      {/* <div className="product-add-ons"> */}
                      <ul>
                        {orderDetail.add_on.map((item, index) => (
                          <li key={index} className="inclusionstyle">
                            <Image
                              src={checkImage}
                              alt="Info"
                              style={{ height: 13, width: 13, marginRight: 10 }}
                            />
                            <span>{item || "NA"}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "10px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                  }}
                >
                <div className="prod_sec balanc_amount">
                    <div className="product-page-heading">
                      {/* Balance Amount: */}
                      Amount:
                    </div>
                    <div>
                      ₹{orderDetail.balance_amount}
                    </div>
                  </div>
                  </div>

                  <div
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "10px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                    marginBottom: "20px",
                  }}
                >
            <div className="comment-container prod_sec">
              <p className="product-page-heading">Additional Comments:</p>
              <p className="comments-text"> {orderDetail.decoration_comments}</p>
            </div>
            </div>


                {/* Cancellation and Order Change Policy */}
                {/* <div
                  className="px-1 py-3 border rounded my-2 cancellatiop-policy"
                  style={{
                    background: "rgb(157, 74,147, 28%)",
                  }}
                >
                  <p
                    style={{ fontSize: "13px", color: "rgb(157, 74, 147)" }}
                    className=" text-center m-1"
                  >
                    Cancellation and order change policy
                  </p>
                  <p
                    style={{ fontSize: "13px", color: "rgb(157, 74, 147)" }}
                    className="m-1"
                  >
                    1. If the order is beyong 48 Hours: You are eligible for a
                    100% refund of the advance payment
                  </p>
                  <p
                    style={{ fontSize: "13px", color: "rgb(157, 74, 147)" }}
                    className="m-1"
                  >
                    2. If the order is cancelled more than 24 hours before the
                    scheduled delivery: You will not receive refund of the
                    advance payment.
                  </p>
                  <p
                    style={{ fontSize: "13px", color: "rgb(157, 74, 147)" }}
                    className="m-1"
                  >
                    3. If the order is cancelled within 24 hours: The full
                    advance amount will be non-refundable, and 100% of the
                    payment for photography has to be paid by customer.
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </>
      ) : orderType == 1 ? (
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
                

                  <div className="product-inclusion prod_sec">
                  <div className="product-page-heading">Inclusion</div>
                  <div>{getItemInclusion(product?.inclusion)}</div>
                  </div>
                 
                <div className="product-add-ons prod_sec">
                  <p className="product-page-heading">AddOns:</p>
                  <ul>
                  {
                    decorationAddon.map((item, index) => (
                      <li key={index}>
                        <div>{item.name}{item.title}</div>
                      </li>
                          )
                          )}
                    </ul>
                </div>


                
                  <div className="prod_sec balanc_amount">
                    <div className="product-page-heading">
                      {/* Balance Amount: */}
                      Amount:
                    </div>
                    <div>
                      ₹{balanceAmount}
                    </div>
                  </div>



                  {decorationComments && (
            <div className="comment-container prod_sec">
              <p className="product-page-heading">Additional Comments:</p>
              <p className="comments-text"> {getDecorationComments(decorationComments)}</p>
            </div>
          )}
                </div>
              </div>
            );
          })}
          
        </div>
      ) : null}

      <div onClick={acceptOrder}>
        <button className="acceptOrder acceptbutton">Accept Order</button>
      </div>
    </>
  );
};

export default OrderDetailTab;
