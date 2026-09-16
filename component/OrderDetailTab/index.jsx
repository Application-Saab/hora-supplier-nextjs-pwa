import React, { useState, useEffect } from "react";
import OrderDetailsMenu from "../OrderDetailsMenu";
import OrderDetailsIngre from "../OrderDetailsIngre";
import OrderDetailsAppliances from "../OrderDetailsAppliances";
import { useRouter } from "next/router";
import {
  BASE_URL,
  ACCEPT_ORDER,
} from "../../apiconstant/apiconstant";
import DecorationOrderDetailsTab from "../decorationOrderDetailsTab";
import PhotographyOrderDetailsTab from "../photographyOrderDetailsTab";
import axios from "axios";

const OrderDetailTab = ({
  orderDetail,
  orderType,
  decorationItems,
  decorationComments,
  decorationAddon,
  balanceAmount,
  refetchOrderDetails = () => { },
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
  const [limitData, setLimitData] = useState(false);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [limitDetails, setLimitDetails] = useState({ count: 0, limit: 0 });

  const emergencyResponse = orderDetail?.processedBy?.find(
    (item) => item?.id?.toString() === supplierID?.toString()
  );

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

  const handleEmergencyAction = async (action) => {
    try {
      const response = await fetch(`${BASE_URL}/api/order/process-emergency-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderDetail?._id,
          supplierId: supplierID,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      console.log(data.message);

      await refetchOrderDetails();

      // yaha agar popup close / order remove karna ho toh kar sakte ho
    } catch (error) {
      console.error("Emergency order action error:", error);
    }
  };

  useEffect(() => {
    const targetDate = orderDetail?.order_date;

    if (supplierID && targetDate) {
      const fetchSupplierLimit = async () => {
        try {
          setLoadingLimit(true);
          const response = await axios.get(`${BASE_URL}/api/users/supplier-order-count-by-date`, {
            params: {
              supplierId: supplierID,
              fulfillmentDate: targetDate
            }
          });

          if (response?.data?.success) {
            setLimitData(response?.data?.isFull);
            setLimitDetails({
              count: response?.data?.count || 0,
              limit: response?.data?.limit || 0
            });
          }
        } catch (error) {
          console.error("Error fetching supplier daily limit:", error);
        }
        finally {
          setLoadingLimit(false);
        }
      };

      fetchSupplierLimit();
    }
    else {
      setLoadingLimit(false);
    }
  }, [supplierID, orderDetail]);

  return ( 
       <>
      {loadingLimit ?
        <div>
          loading data...
        </div>
        :
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
        <DecorationOrderDetailsTab 
        orderDetail={orderDetail}
        decorationComments={decorationComments}
        decorationAddon={decorationAddon}
        balanceAmount={balanceAmount}
        decorationArray={decorationArray}
        />
      ) : orderType == 8 ? (
        <PhotographyOrderDetailsTab
        orderDetail={orderDetail}
        decorationComments={decorationComments}
        balanceAmount={balanceAmount}
        bulletItems={bulletItems}
        />
          ) : null}        

          {orderDetail?.isEmergencyOrder === true &&
            orderDetail?.isPaymentDone === false ? (
            emergencyResponse ? (
              <div
                className={`emergency-order-message ${emergencyResponse.action === "yes"
                    ? "emergency-accepted"
                    : "emergency-rejected"
                  }`}
              >
                <p>
                  You have already{" "}
                  <strong>
                    {emergencyResponse.action === "yes"
                      ? "accepted"
                      : "rejected"}
                  </strong>{" "}
                  this emergency order.
                </p>
              </div>
            ) : (
              <div className="emergency-order-message">
                <p>
                  This is an emergency order. Please confirm whether you want to
                  proceed with this order or reject it.
                </p>

                <div className="emergency-order-actions">
                  <button
                    className="emergency-reject-btn"
                    onClick={() => handleEmergencyAction("no")}
                  >
                    Reject
                  </button>

                  <button
                    className="emergency-proceed-btn"
                    onClick={() => handleEmergencyAction("yes")}
                  >
                    Yes, Proceed
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              <div className="bg-white p-10">
                {limitData && (
                  <div className="limit-warning-label">
                    ⚠️ You have already reached your daily limit of{" "}
                    <strong>
                      {limitDetails.count}/{limitDetails.limit}
                    </strong>{" "}
                    orders for today.
                  </div>
                )}
              </div>

              <div className="accept-btn-container">
                <button
                  onClick={acceptOrder}
                  disabled={limitData}
                  className="acceptOrder acceptbutton"
                >
                  Accept Order
                </button>
              </div>
            </>
          )}
    </> 
    }
    </>
  );
};

export default OrderDetailTab;
