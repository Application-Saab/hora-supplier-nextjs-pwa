import React, { useState, useEffect } from "react";
// import daal_image from "../../assets/daal_image.png";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
// import { BASE_URL, ORDER_CANCEL } from "../../utils/apiconstants";
// import { useNavigate } from "react-router-dom";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
// import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRouter } from "next/router";
import { BASE_URL, ACCEPT_ORDER } from "../../apiconstant/apiconstant";

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

  const getItemInclusion = (inclusion) => {
    if (!inclusion || !inclusion.length) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(inclusion[0], "text/html");
    const items = doc.body.childNodes;

    const result = [];
    items.forEach((item) => {
      if (item.nodeName === "DIV" || item.nodeName === "BR") {
        result.push(item.textContent.trim());
      }
    });

    return result;
  };

  const acceptOrder = async () => {
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: "7px 0 15px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "#333",
                      }}
                    >
                      Balance Amount:
                    </span>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#555",
                        margin: "0",
                      }}
                    >
                      ₹{balanceAmount}
                    </p>
                  </div>

                  <h6 className="product-inclusion">
                    <ul>
                      {getItemInclusion(product?.inclusion).map(
                        (item, index) => (
                          <li key={index}>{item}</li>
                        )
                      )}
                    </ul>
                  </h6>

                  <p className="product-inclusion">
                    <p className="comments-header">AddOn:</p>
                    {decorationAddon.map((item, index) => (
                      <li key={index}>
                        <strong>{item.name}</strong>
                        {/* : ₹{item.price} */}
                      </li>
                    ))}
                  </p>
                  {decorationComments && (
            <div className="comment-container">
              <p className="comments-header">Additional Comments:</p>
              <p className="comments-text">{decorationComments}</p>
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
