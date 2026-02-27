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
import {
  BASE_URL,
  ACCEPT_ORDER,
  START_ORDER,
} from "../../../apiconstant/apiconstant";

import checkImage from "../../../assets/tick.jpeg";
import axios from "axios";

// const BASE_URL = "";
// const ORDER_CANCEL = "";
// order.type is 2 for chef
// order.type is 1 for decoration
// order.type is 3 for waiter
// order type 4 bar tender
// order type 5 cleaner
// order type 6 Food Delivery
// order type 7 Live Catering

const cleanHTML = (htmlString) => {
  // Remove all <div> and </div> tags, keep inner content
  return htmlString.replace(/<\/?div>/g, "").trim();
};

const SUBMIT_LINK_ENDPOINT = "/api/photo/drive/add-order-drive-link";

const OrderDetailTab = ({
  orderDetail,
  orderType,
  decorationItems,
  decorationComments,
  decorationAddon,
  balanceAmount,
}) => {
  const router = useRouter();
  const decorationArray = Array.isArray(decorationItems) ? decorationItems : [decorationItems];
  const { apiOrderId } = router.query;
  const [tab, setTab] = useState("Menu");
  const [orderStatus, setOrderStatus] = useState(orderDetail?.order_status);

  const [supplierID, setSupplierID] = useState(null);
  const [otp, setOtp] = useState(null);

  const [otp1, setOtp1] = useState(["", "", "", ""]);
  const [isOtpMatched, setIsOtpMatched] = useState(false);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");

  console.log(decorationItems, "decorationItemsd2");

  const [driveLink, setDriveLink] = useState("");
  console.log(orderDetail, "orderdetails");

  const formatOrderMessage = (orderDetail, decorationItems) => {
    const orderId = orderDetail?.order_id || "";
    const orderDate = orderDetail?.order_date
      ? new Date(orderDetail.order_date).toLocaleDateString()
      : "";
    const orderTime = orderDetail?.order_time || "";
    const city = orderDetail?.addressId?.city || "";
    const address1 = orderDetail?.addressId?.address1 || "";
    const address2 = orderDetail?.addressId?.address2 || "";
    const locality = orderDetail?.order_locality || "";
    const pincode = orderDetail?.order_pincode || "";
    const totalAmount = orderDetail?.total_amount || "";

    // Decoration items with inclusions
    const decorations = decorationArray?.length
      ? decorationArray
        .map((item, i) => {
          const inclusions = item.inclusion?.length
            ? item.inclusion
              .map((inc) =>
                inc
                  .replace(/<div>/g, "• ")
                  .replace(/<\/div>/g, "\n")
                  .trim()
              )
              .join("")
            : "No inclusions";

          return `${i + 1}. ${item.name}\n${inclusions}`;
        })
        .join("\n\n")
      : "No decoration items";

    return `
📝 *Order Details*
------------------------
Order Id: ${orderId}
Order Date: ${orderDate}
City: ${city}
Time: ${orderTime}
Address1: ${address1}
Address2: ${address2}
Locality: ${locality}
Pincode: ${pincode}
Total Amount: ₹${totalAmount}

🎉 *Decoration Items*
------------------------
${decorations}
  `.trim();
  };

  let orderOtp;

  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    orderOtp = localStorage.getItem("orderOtp");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupplierID(localStorage.getItem("supplierID"));
      setOtp(localStorage.getItem("otp"));
    }
  }, []);

  // console.log(orderDet/ail, "orderDetailsss");

  // const [name, setname] = useState();
  const [name, setName] = useState();
  const [inclusion, setInclusion] = useState();

  console.log(name, "name");


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

  // console.log(getItemInclusion(inclusion),"fdsfsdfds");

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

  const handleSubmit = () => {
    const currDate = new Date().toLocaleDateString();
    const currTime = new Date().toLocaleTimeString();

    const currDateTime = currDate + currTime;
    try {
      const token = localStorage.getItem("token");

      const response = fetch(BASE_URL + START_ORDER, {
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
          job_start_time: currDateTime,
        }),
      });

      router.push({
        pathname: `/job-complete`,
        query: { apiOrderId },
      });
    } catch (error) {
      console.log("acceptOrder error", error);
    }
  };

  const handleSubmitDriveLink = async () => {
    if (!driveLink.startsWith("https://drive.google.com/")) {
      alert("Invalid Google Drive link");
      return;
    }
    try {
      await axios.post(BASE_URL + SUBMIT_LINK_ENDPOINT, {
        order_id: orderDetail.order_id,
        folderUrl: driveLink,
      });

      await fetch(`${BASE_URL}/api/photo/drive/update-google-sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIdDb: orderDetail.order_id,
          orderIdCustomer: orderDetail.order_id + 10800,
          phone: orderDetail.phone_no,
          fulfillmentDate: orderDetail.order_date
            ? new Date(orderDetail.order_date).toLocaleDateString("en-GB")
            : "N/A",
          services: "Photography",
          driveLink: driveLink,
          horaWebLink: "N/A",
        }),
      });

      alert("Drive link submitted!");
      // setPopupOpen(false);
      setDriveLink("");
      window.location.href = "/past-order";
    } catch (err) {
      console.error(err.response?.data?.error, "testing");
      alert(err.response?.data?.error);
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = e.target.files;
      if (!files?.length) return;
      const formData = new FormData();
      [...files].forEach((f) => formData.append("files", f));

      const uploadRes = await fetch(
        "https://horaservices.com:3000/api/multiple_image_upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();

      await fetch("https://horaservices.com:3000/api/order/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: orderDetail._id,
          userOrderDishImageArray: uploadData.data,
        }),
      });

      window.location.href = "/past-order";
    };
    input.click();
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
          {decorationArray?.map((product, index) => {
            return (
              <div key={product?.id} className="product-container">
                <div className="product-image-container">
                  <Image
                    // src={`https://horaservices.com/api/uploads/${product?.featured_image}`}
                    src={`https://horaservices.com/api/uploads/compressed_webp/${product.featured_image.split(".")[0]
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

                  <h6 className="product-inclusion">
                    <div class="product-page-heading">Inclusion</div>
                    {getItemInclusion(product?.inclusion)}
                  </h6>

                  <div className="product-add-ons prod_sec">
                    <p className="product-page-heading">AddOns:</p>
                    <ul>
                      {decorationAddon.map((item, index) => {
                        let rawTitle =
                          item?.addOnId?.title ||
                          item?.name ||
                          item?.title ||
                          "Addon";

                        // Quantity extract
                        const quantityMatch = rawTitle.match(/Quantity\s*(\d+)/i);
                        const extractedQuantity = quantityMatch
                          ? Number(quantityMatch[1])
                          : null;

                        // Clean name
                        const cleanedTitle = rawTitle
                          .replace(/\s*-\s*Quantity\s*\d+/i, "")
                          .trim();

                        const quantity =
                          extractedQuantity ||
                          Number(item?.quantity) ||
                          1;

                        const price = Number(
                          item?.priceAtPurchase ||
                          item?.price ||
                          0
                        );

                        const total =
                          item?.totalPrice
                            ? Number(item.totalPrice)
                            : price * quantity;

                        return (
                          <li key={index}>
                            <div>
                              {cleanedTitle} : ₹{price} × {quantity} = ₹{total}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="prod_sec balanc_amount">
                    <div className="product-page-heading">
                      {/* Balance Amount: */}
                      Amount
                    </div>
                    <div>₹{balanceAmount}</div>
                  </div>

                  {decorationComments && (
                    <div className="comment-container prod_sec">
                      <p className="product-page-heading">
                        Additional Comments:
                      </p>
                      <ul className="comments-text aarti">
                        {decorationComments.split("-").map((comment, index) => (
                          <li key={index}>{comment.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ============ Dish Images Status & Grid ============ */}
                <div
                  style={{
                    boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                    padding: "10px 16px",
                    marginBottom: "12px",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* Header Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      Current Status
                    </span>

                    {orderDetail.userOrderDishImageArray?.length > 0 ? (
                      <span
                        style={{
                          color: "#28a745",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        ✓ Actually Photos Are Updated
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#dc3545",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        ✗ Actually Photos Not Submitted
                      </span>
                    )}
                  </div>

                  {/* Images Grid */}
                  {orderDetail.userOrderDishImageArray?.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {orderDetail.userOrderDishImageArray.map((img, index) => (
                        <img
                          key={index}
                          // src={img}
                          src={`https://horaservices.com/api/uploads/${img}`}
                          alt={`Dish ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ============ Submit / Re-Submit Button ============ */}
                {!orderDetail.userOrderDishImageArray?.length && (
                  <button
                    style={{
                      backgroundColor: "#25D366", // WhatsApp green
                      color: "white",
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                    onClick={handleFileUpload}
                  >
                    Submit Image
                  </button>
                )}
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Inclusion:
                </label>
                <ul
                  style={{
                    listStyleType: "disc", // Show dot bullets
                    paddingLeft: "20px", // Indent to show bullets
                    margin: 0,
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
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        {" "}
                        Add-On
                      </label>{" "}
                    </div>
                    <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                      {orderDetail.add_on.map((item, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "15px",
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
                            alt={item?.addOnId?.title || item?.title}
                            style={{
                              height: 40,
                              width: 40,
                              marginRight: 10,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <div>
                            <div
                              style={{ fontWeight: "bold", fontSize: "16px" }}
                            >
                              {item?.addOnId?.title || item?.title || "NA"}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#555",
                                marginTop: "2px",
                              }}
                            >
                              {item?.addOnId?.description || item?.description || "No description"}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#888",
                                marginTop: "2px",
                              }}
                            >
                              ₹{item?.priceAtPurchase || item?.price || 0}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
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

              <div
                style={{
                  boxShadow: "0 1px 8px rgba(0,0,0,.18)",
                  padding: "10px 16px",
                  marginBottom: "12px",
                  backgroundColor: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontWeight: "500", fontSize: "13px", color: "#333" }}
                >
                  Current Status
                </span>

                {orderDetail.orderDriveLink ? (
                  <span
                    style={{
                      color: "#28a745",
                      fontWeight: "500",
                      fontSize: "13px",
                    }}
                  >
                    ✓ Drive Link Submitted
                  </span>
                ) : (
                  <span
                    style={{
                      color: "#dc3545",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                  >
                    ✗ Drive Link Not Submitted Yet
                  </span>
                )}
              </div>

              {!orderDetail.orderDriveLink && (
                <textarea
                  value={driveLink}
                  style={styles.inputText}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="Paste Google Drive folder link here..."
                />
              )}

              {/* <textarea
                value={driveLink}
                style={styles.inputText}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder={
                  orderDetail.orderDriveLink
                    ? "Paste new Google Drive folder link to resubmit..."
                    : "Paste Google Drive folder link here..."
                }
              /> */}
              {!orderDetail.orderDriveLink && (
                <button
                  style={styles.submitBtn}
                  onClick={handleSubmitDriveLink}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#8a3f85";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#9c4d97";
                  }}
                >
                  {orderDetail.orderDriveLink
                    ? "Re-Submit Link"
                    : "Submit Link"}
                </button>
              )}

              {/* <button
                style={styles.submitBtn}
                onClick={handleSubmitDriveLink}
                onMouseEnter={(e) => {
                  e.target.style.background = "#8a3f85";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#9c4d97";
                }}
              >
                {orderDetail.orderDriveLink ? "Re-Submit Link" : "Submit Link"}
              </button> */}
            </div>
          </div>
        </div>
      ) : null}
      <div>
        {/* <h1>sohan</h1>
        <h2>{orderDetail.orderDriveLink}</h2> */}

        {/* <div className="otp-container">
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
        </div> */}
      </div>

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

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2px auto",
    padding: "20px",
    background: "#f8f9fa",
    minHeight: "100vh",
  },
  heading: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#97538C",
    fontWeight: "bold",
  },
  orderItem: {
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  orderIdText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  reviewText: {
    fontSize: "13px",
    color: "#666",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  button: {
    padding: "6px 14px",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    transition: "all 0.2s ease",
  },
  viewDetailsBtn: {
    background: "#fff",
    color: "#9c4d97",
    borderColor: "#9c4d97",
  },
  uploadDriveBtn: {
    background: "#9c4d97",
    color: "#fff",
    border: "none",
  },
  submittedBtn: {
    background: "#fff",
    color: "#666",
    borderColor: "#d0d0d0",
    cursor: "default",
  },
  statusText: {
    fontSize: "13px",
    color: "#28a745",
    fontWeight: "500",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    padding: "0",
    width: "500px",
    maxWidth: "90%",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
    background: "#9c4d97",
    color: "#fff",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  modalBody: {
    padding: "24px",
    maxHeight: "calc(85vh - 200px)",
    overflowY: "auto",
  },
  detailRow: {
    display: "flex",
    marginBottom: "16px",
    fontSize: "14px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
    minWidth: "140px",
    marginRight: "12px",
  },
  detailValue: {
    color: "#333",
    flex: 1,
  },
  inputText: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    marginTop: "16px",
    fontSize: "14px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    resize: "vertical",
    minHeight: "80px",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#f8f9fa",
  },
  cancelBtn: {
    padding: "8px 20px",
    background: "#fff",
    color: "#666",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  submitBtn: {
    padding: "8px 20px",
    background: "#9c4d97",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    marginLeft: "83px",
  },
};
