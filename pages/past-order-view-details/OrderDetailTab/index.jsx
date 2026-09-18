
import React, { useState, useEffect } from "react";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
import { BASE_URL } from "../../../apiconstant/apiconstant";
import axios from "axios";
import DecorationOrderDetailsTab from "../../../component/decorationOrderDetailsTab";
import PhotographyOrderDetailsTab from "../../../component/photographyOrderDetailsTab";
import CapsuleUpload from "./Capsuleupload";

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
  balanceAmount,
  galleryDetails = {},
}) => {
  const decorationArray = Array.isArray(decorationItems) ? decorationItems : [decorationItems];
  const [tab, setTab] = useState("Menu");
  const [driveLinksInput, setDriveLinksInput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadTab, setUploadTab] = useState("EventCapsuleUpload");


  const saveOrderDriveLinks = async (currentOrder, driveLinksInput) => {
    const linksToSend = driveLinksInput.filter(
      (item) => item.link && item.link.trim() !== ""
    );

    if (linksToSend.length === 0) {
      throw new Error("Please provide at least one valid Google Drive link.");
    }

    const rawPhotosRow = linksToSend.find((item) => item.linkType === "rawPhotos");
    const rawFolderUrl = rawPhotosRow ? rawPhotosRow.link : "";

    const response = await axios.post(`${BASE_URL}/api/photo/drive/add-order-drive-link`, {
      order_id: currentOrder.order_id,
      allDriveLinks: linksToSend,
      folderUrl: rawFolderUrl
    });

    window.location.href = "/past-order";
    return response.data;
  };

  const inclusionToApiKeyMap = {
    "Raw Photos": "rawPhotos",
    "Edited Photos": "editedPhotos",
    "Teaser": "teaser",
    "Edited Video": "editedVideos",
    "Raw Video": "rawVideos",
    "Drone Shoot": "droneShoot",
    "Edited Reel": "editedReel"
  };

  const apiKeyToInclusionMap = {
    rawPhotos: "Raw Photos",
    editedPhotos: "Edited Photos",
    teaser: "Teaser",
    editedVideos: "Edited Video",
    rawVideos: "Raw Video",
    droneShoot: "Drone Shoot",
    editedReel: "Edited Reel"
  };


  useEffect(() => {
    if (orderDetail) {
      const inclusions = orderDetail?.call_checklist?.inclusions || {};
      const existingLinks = orderDetail?.allDriveLinks || [];

      const trueInclusionsList = Object.keys(inclusions).filter(
        (key) => inclusions[key] === true
      );

      const dynamicApiKeys = trueInclusionsList.map(
        (key) => inclusionToApiKeyMap[key]
      );


      const finalApiKeysToShow = [
        ...new Set(dynamicApiKeys.filter(Boolean)),
      ];

      let initialInputState = finalApiKeysToShow.map((backendApiKey) => {
        const matchedSavedLink = existingLinks.find(
          (item) => item.linkType === backendApiKey
        );

        const rawPhotosLink =
          backendApiKey === "rawPhotos"
            ? orderDetail?.orderDriveLink
            : "";

        return {
          linkType: backendApiKey,
          link: matchedSavedLink?.link || rawPhotosLink || "",
          isExisting: !!matchedSavedLink?.link || !!rawPhotosLink,
        };

      });

      setDriveLinksInput(initialInputState);
    }
  }, [orderDetail]);

  const totalInclusionsCount = driveLinksInput.length;

  const submittedLinksCount = driveLinksInput.filter(
    (item) => item.isExisting === true
  ).length;

  const areAllLinksSubmitted = totalInclusionsCount > 0 && submittedLinksCount === totalInclusionsCount;
  const [submittingIndex, setSubmittingIndex] = useState(null);

  const handleSaveSingleLink = async (index, currentOrder) => {
    try {
      setLoading(true);
      setSubmittingIndex(index);
      const payloadForBackend = driveLinksInput.map((item, i) => {
        if (i === index) {
          return item;
        }
        return {
          ...item,
          link: item.isExisting ? item.link : ""
        };
      });

      const data = await saveOrderDriveLinks(currentOrder, payloadForBackend);
      alert(data.message || "Link processed successfully!");

      setDriveLinksInput((prev) =>
        prev.map((item, i) => (i === index ? { ...item, isExisting: true } : item))
      );

    }
    catch (error) {
      console.error("Error while saving link:", error);
    }
    finally {
      setLoading(false);
      setSubmittingIndex(null);
    }
  }
  const handleDynamicLinkChange = (index, value) => {
    const updatedLinks = [...driveLinksInput];
    updatedLinks[index].link = value;
    setDriveLinksInput(updatedLinks);
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

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    [...files].forEach((f) => formData.append("files", f));

    const uploadRes = await fetch(
      "https://horaservices.com/api/multiple_image_upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const uploadData = await uploadRes.json();

    await fetch("https://horaservices.com/api/order/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: orderDetail._id,
        userOrderDishImageArray: uploadData.data,
      }),
    });

    window.location.href = "/past-order";
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
        <div>
          <DecorationOrderDetailsTab
            orderDetail={orderDetail}
            decorationComments={decorationComments}
            decorationAddon={decorationAddon}
            balanceAmount={balanceAmount}
            decorationArray={decorationArray}
          />
          {/* ============ Dish Images Status & Grid ============ */}
          <div className="actual-image-container">
            <div className="fw-semiBold">
              Current Status
            </div>
            {orderDetail.userOrderDishImageArray?.length > 0 ? (
              <div
                style={{
                  color: "#28a745",
                  fontWeight: "500",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                ✓ Actually Photos Are Updated
              </div>
            ) : (
              <div
                style={{
                  color: "#dc3545",
                  fontWeight: "500",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                ✗ Actually Photos Not Submitted
              </div>
            )}
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

            <input
              type="file"
              id="fileUpload"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* ============ Submit / Re-Submit Button ============ */}
            <div className="send-whatApp-Container">
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
                  onClick={() => document.getElementById("fileUpload").click()}
                >
                  Submit Image
                </button>
              )}
            </div>
          </div>
        </div>

      ) : orderType == 8 ? (
        <div>
          <PhotographyOrderDetailsTab
            orderDetail={orderDetail}
            decorationComments={decorationComments}
            balanceAmount={balanceAmount}
            bulletItems={bulletItems}
          />

          <div className="capsule-tabs-container" style={{ marginTop: "20px" }}>
            <button
              className={`${uploadTab === "EventCapsuleUpload" ? "capsule-tab-active" : "capsule-tab"}`}
              onClick={() => setUploadTab("EventCapsuleUpload")}
            >
              Upload Photos / Videos
            </button>

            <button
              className={`${uploadTab === "DriveLinks" ? "capsule-tab-active" : "capsule-tab"}`}
              onClick={() => setUploadTab("DriveLinks")}
            >
              Upload Drive Links
            </button>
          </div>
          {uploadTab === "EventCapsuleUpload" && (
            <CapsuleUpload galleryDetails={galleryDetails} />
          )}
          {uploadTab === "DriveLinks" && (
            <>
              {driveLinksInput.length > 0 && (
                <div className="actual-image-container">
                  <div className="fw-semiBold">Current Status</div>
                  {areAllLinksSubmitted ? (
                    <span
                      style={{
                        color: "#28a745",
                        fontWeight: "500",
                        fontSize: "13px",
                      }}
                    >
                      ✓ All Drive Link Submitted ( {submittedLinksCount} / {totalInclusionsCount} )
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#dc3545",
                        fontWeight: "500",
                        fontSize: "12px",
                      }}
                    >
                      ✗ All Drive Link Not Submitted Yet ( {submittedLinksCount} / {totalInclusionsCount} )
                    </span>
                  )}

                  <div className="submit-link-container">
                    <div className="link-header">Submit Links</div>

                    {driveLinksInput.map((item, index) => {
                      const isInputEmpty = !item.link || item.link.trim() === "";
                      const isBtnDisabled = loading || isInputEmpty || item.isExisting;

                      return (
                        <div key={index} className="drive-link-group" style={{ marginBottom: '8px' }}>
                          <label className="drive-link-label">
                            {apiKeyToInclusionMap[item.linkType] || item.linkType}
                          </label>

                          <input
                            type="text"
                            disabled={item.isExisting}
                            placeholder={`Paste Google Drive link for ${apiKeyToInclusionMap[item.linkType] || item.linkType
                              }`}
                            value={item.link}
                            onChange={(e) => handleDynamicLinkChange(index, e.target.value)}
                            className="drive-link-input"
                          />

                          {!item.isExisting && (
                            <div className="drivelinkBtnContainer" style={{ marginTop: '8px' }}>
                              <button
                                onClick={() => handleSaveSingleLink(index, orderDetail)}
                                disabled={isBtnDisabled}
                                className={`save-btn-link ${isBtnDisabled ? "save-btn-disabled" : ""}`}
                              >
                                {loading && submittingIndex === index ? "Submitting..." : "Save Link"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
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
