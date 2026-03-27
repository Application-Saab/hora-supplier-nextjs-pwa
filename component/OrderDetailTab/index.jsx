import React, { useState, useEffect } from "react";
// import daal_image from "../../assets/daal_image.png";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
// import { BASE_URL, ORDER_CANCEL } from "../../utils/apiconstants";
// import { useNavigate } from "react-router-dom";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
import logo from '../../assets/new_logo_light.png.png'
import checkIcon from '../../assets/checkIcon.png'
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
      <div className="info-row" key={index}>
        <div className="info-icon">
          <Image
            src={checkIcon}
            alt="Info"
            style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
          />
        </div>
        <div>
          {item.trim()}
        </div>
      </div>
    ));
    return (
      <div>
        <div className="fw-semiBold myOrderDetails-heading">
          Inclusions
        </div>
        <ul>{inclusionList}</ul>
      </div>
    );
  };
const getPhtographyInclusion = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const inclusionList = items.map((item, index) => (
    <div className="info-row" key={index}>
      <div className="info-icon">
        <Image
          src={checkIcon}
          alt="Info"
          style={{
            height: 13,
            width: 13,
            marginRight: "5px",
            marginTop: "5px",
          }}
        />
      </div>
      <div>{item.trim()}</div>
    </div>
  ));

  return (
    <div>
      <div className="fw-semiBold myOrderDetails-heading">
        Inclusions
      </div>

      <div>{inclusionList}</div>
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
              <div key={product?.id} className="orderlist-decDetails">
                <div className="myOrder-decDetailsLeft">
                  <>
                    <Image
                      src={`https://horaservices.com/api/uploads/compressed_webp/${product.featured_image.split(".")[0]
                        }.webp`}
                      alt={product?.name}
                      height={300}
                      width={300}
                      style={{ height: "auto", width: "100%" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 9,
                        right: 4,
                      }}
                    >
                      <span>
                        <Image src={logo} style={{ width: "50px", height: "55px" }} className="hora-watermark-image" />
                      </span>
                    </div>
                  </>
                </div>

                <div className="myOrder-decDetailsRight">
                  <h1>
                    {product.name}
                  </h1>

                  <div style={{ marginBottom: "12px" }}>
                    {getItemInclusion(product.inclusion)}
                  </div>

                  {decorationAddon.length > 0 &&
                    <div className="product-add-ons prod_sec" style={{ marginBottom: "12px" }}>
                      <div className="fw-semiBold myOrderDetails-heading">
                        Add-Ons
                      </div>
                      <ul>
                        {decorationAddon.map((item, index) => (
                          <div key={index} className="info-row">
                            <div className="info-icon">
                              <Image
                                src={checkIcon}
                                alt="Info"
                                style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                              />
                            </div>
                            <div>
                              {(() => {
                                const rawTitle =
                                  item?.name || item?.title;

                                const quantityMatch = rawTitle?.match(/Quantity\s*(\d+)/i);
                                const extractedQuantity = quantityMatch
                                  ? Number(quantityMatch[1])
                                  : null;

                                const cleanedTitle = rawTitle?.replace(
                                  /\s*-\s*Quantity\s*\d+/i,
                                  ""
                                ).trim();

                                const quantity =
                                  extractedQuantity || Number(item?.quantity) || 1;

                                return (
                                  <>
                                    <div>{cleanedTitle || "N/A"}</div>
                                    <div>{cleanedTitle && `Quantity : ${quantity}`}</div>
                                  </>
                                );
                              })()}

                            </div>
                          </div>
                        ))}
                      </ul>
                    </div>
                  }
                  {/* Additional Comments */}
                  <div>
                    <div className="fw-semiBold myOrderDetails-heading">
                      Additional Comments
                    </div>
                    {decorationComments && (
                    <div>
                    {decorationComments.split('\n').map((comment, index) => (
                       <div key={index} className="info-row">
                          <div className="info-icon">
                          <Image
                           src={checkIcon}
                           alt="Info"
                           className="info-icon-img"
                           style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                           />
                          </div>

                       <div>{comment}</div>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                  <div className="fw-semiBold myOrderDetails-heading">
                    Price Details
                  </div>

                  <span className="priceDetails-container" style={{ fontSize: "14px", color: "#97538C" }}>

                    <span className="myOrder-amountList">
                      <span className="myOrder-labelStyle"> Amount :</span>
                      <span>₹ {balanceAmount || 0}</span>
                    </span>
                  </span>
                  <div className="fw-semiBold myOrderDetails-heading">
                    Venue Details
                  </div>

                  <div style={{ fontSize: "13.17px" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span className="fw-semiBold">Address :</span>
                      <span> {' '}
                        {orderDetail?.addressId?.address1 || "NA"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span className="fw-semiBold">City :</span>
                      <span>{' '}{orderDetail?.addressId?.city || "NA"}</span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span className="fw-semiBold">Pin Code :</span>
                      <span>{' '}{orderDetail?.order_pincode || "NA"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : orderType == 8 ? (
        <div className="photography-decDetailsRight">
                  <h1 className="mb-2">
                    {orderDetail?.items?.[0]?.photography?.name || "Photography Service"}
                  </h1>
                  <div style={{ marginBottom: "12px" }}>
                    {getPhtographyInclusion(bulletItems)}
                  </div>
                  <div className="fw-semiBold myOrderDetails-heading">
                    Add-ons
                  </div>

                  {orderDetail?.add_on?.length > 0 ? (
                    orderDetail.add_on.map((item, index) => (
                      <div key={index} className="info-row">
                        <Image
                          src={checkIcon}
                          alt=""
                          width={13}
                          height={13}
                          style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                              {item?.title || "NA"}
                            </div>
                            <div style={{ fontSize: "14px", color: "#555" }}>
                              {item?.description || "No description"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#888" }}>
                              quantity :  {item?.quantity || 1}
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13 }}>NA</div>
                  )}
                   <div className="fw-semiBold myOrderDetails-heading">
                    Additional Comments
                  </div> 
                  
                  {decorationComments && (
                    <div>
                    {decorationComments.split('\n').map((comment, index) => (
                       <div key={index} className="info-row">
                          <div className="info-icon">
                          <Image
                           src={checkIcon}
                           alt="Info"
                           width={13}
                           height={13}
                           style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                           />
                          </div>

                       <div>{comment}</div>
                      </div>
                    ))}
                  </div>
                )}

                  <div className="fw-semiBold myOrderDetails-heading">
                    Price Details
                  </div>
                  <span className="priceDetails-container" style={{ fontSize: "14px", color: "#97538C" }}>
                    <span className="myOrder-amountList">
                      <span className="myOrder-labelStyle"> Amount :</span>
                      <span>₹ {balanceAmount || 0}</span>
                    </span>
                  </span>
        </div>
      ) : null}

      <div className="accept-btn-container" onClick={acceptOrder}>
        <button className="acceptOrder acceptbutton">Accept Order</button>
      </div>
    </>
  );
};

export default OrderDetailTab;
