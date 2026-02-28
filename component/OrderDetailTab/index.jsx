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
import {
  BASE_URL,
  ACCEPT_ORDER,
} from "../../apiconstant/apiconstant";
import checkImage from "../../assets/tick.jpeg";
import axios from "axios";

const OrderDetailTab = ({
  orderDetail,
  orderType,
  decorationItems,
  decorationComments,
  decorationAddon,
  balanceAmount,
}) => {
  const decorationArray = Array.isArray(decorationItems)
  ? decorationItems
  : [decorationItems];

  const router = useRouter();
  console.log(orderDetail,"orderdtails");
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

  // console.log(orderDetail, "orderDetailsss");

  // const [name, setname] = useState();

function parseInclusionToBullets(inclusionData) {
  if (!inclusionData) return [];

  // If array, take first element
  const inclusionString = Array.isArray(inclusionData)
    ? inclusionData[0]
    : inclusionData;

  if (typeof inclusionString !== "string") return [];

  return inclusionString
    .split("</div>")
    .map(str => str.replace(/<div[^>]*>/g, "").trim())
    .filter(str => str.length > 0)
    .map(str => str.replace(/^-\s*/, ""));
}

// In your component
const bulletItems = parseInclusionToBullets(orderDetail?.items?.[0]?.photography?.inclusion); 


  const getItemInclusion = (inclusion) => {
    if (!Array.isArray(inclusion) || inclusion.length === 0) {
      return null;
    }
    const htmlString = inclusion[0];
    const withoutTags = htmlString.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const withoutSpecialChars = withoutTags.replace(/&#[^;]*;/g, " "); // Replace &# sequences with space
    const statements = withoutSpecialChars.split("<div>");
    const inclusionItems = statements.flatMap((statement) =>
      statement.split("-").filter((item) => item.trim() !== "")
    );
    const inclusionList = inclusionItems.map((item, index) => (
      <li key={index} className="inclusionstyle">
        {item.trim()}
      </li>
    ));
    return (
      <div>
        <ul>{inclusionList}</ul>
      </div>
    );
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
          {decorationArray?.map((product, index) => {
            return (
              <div key={product?.id} className="product-container">
                <div className="product-image-container">
                  <Image
                    // src={`https://horaservices.com/api/uploads/${product?.featured_image}`}
                    src={`https://horaservices.com/api/uploads/compressed_webp/${
                      product.featured_image.split(".")[0]
                    }.webp`}
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
                      {decorationAddon.map((item, index) => (
                        <li key={index}>
                          <div>
                            {item?.addOnId?.title || item?.name ||item?.title || "N/A" }
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="prod_sec balanc_amount">
                    <div className="product-page-heading">
                      {/* Balance Amount: */}
                      Amount:
                    </div>
                    <div>₹{balanceAmount}</div>
                  </div>

                  {decorationComments && (
                    <div className="comment-container prod_sec">
                      <p className="product-page-heading">
                        Additional Comments:
                      </p>
                      <ul className="comments-text aarti">
                        {decorationComments
                          .split(/[,\n;\-]+/)
                          .map((comment, index) => (
                            <li key={index}>{comment.trim()}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : orderType == 8 ? (
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
                  {orderDetail?.items?.[0]?.photography?.name}
                </h1>
              </div>


              <div
  style={{
    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
    padding: "10px",
    marginBottom: "12px",
    backgroundColor: "#fff",
  }}
>
  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
    Inclusion:
  </label>
  <ul
    style={{
      listStyleType: "disc",      // Show dot bullets
      paddingLeft: "20px",        // Indent to show bullets
      margin: 0
    }}
  >
    {bulletItems.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
</div>

              <div
                style={{
                  boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                  padding: "10px",
                  marginBottom: "12px",
                  backgroundColor: "#fff",
                }}
              >
                {orderDetail?.add_on?.length > 0 && (
                  <>
                    <div
                      style={{
                        fontSize: "21px",
                        borderBottom: "1px solid #e7eff9",
                        marginBottom: "10px",
                      }}
                    >
  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>                      Add-On
</label>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {orderDetail.add_on.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "10px",
                            padding: "8px",
                            border: "1px solid #f0f0f0",
                            borderRadius: "6px",
                            backgroundColor: "#fafafa",
                            alignItems: "center",
                          }}
                          className="inclusionstyle"
                        >
                          <img
                            src={
                          item?.image
                       ? item.image
                       : item?.addOnId?.image
                       ? `https://horaservices.com/api/uploads/compressed_webp/${item.addOnId.image}`
                       : "/placeholder.png"
                        }
     
                            alt={item?.addOnId?.title || item?.title || item?.name}
                            style={{
                              height: 50,
                              width: 50,
                              objectFit: "cover",
                              borderRadius: 4,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "bold" }}>
                              {item?.addOnId?.title || item?.title || "NA"}
                            </div>
                            <div style={{ fontSize: "14px", color: "#555" }}>
                              {item?.addOnId?.description || item?.description || "No description"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#888" }}>
                              ₹{item?.priceAtPurchase || item?.price || 0} × {item.quantity ?? 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div
                className="prod_sec balanc_amount"
                style={{
                  boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                  padding: "10px",
                  marginBottom: "12px",
                  backgroundColor: "#fff",
                }}
              >
                <div className="product-page-heading">
                  {/* Balance Amount: */}
                  Amount:
                </div>
                <div>₹{balanceAmount}</div>
              </div>

              {decorationComments && (
                <div
                  className="comment-container prod_sec"
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "10px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                  }}
                >
                  <p className="product-page-heading">Additional Comments:</p>
                  <ul className="comments-text aarti">
                    <ul className="comments-text aarti">
                      {decorationComments
                        .split(/[,\n;\-]+/)
                        .map((comment, index) => (
                          <li key={index}>{comment.trim()}</li>
                        ))}
                    </ul>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div onClick={acceptOrder}>
        <button className="acceptOrder acceptbutton">Accept Order</button>
      </div>
    </>
  );
};

export default OrderDetailTab;
