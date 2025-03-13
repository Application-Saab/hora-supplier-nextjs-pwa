// import React, { useState } from "react";
// import axios from "axios";
// import Layout from "../../component/Layout";
// import { BASE_URL, PAYMENT_API } from "../../apiconstant/apiconstant";

// const Wallet = () => {
//   const [balance, setBalance] = useState(1);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [customAmount, setCustomAmount] = useState("");

//   const apiUrl = BASE_URL + PAYMENT_API;

//   const makeApiCall = async (amount) => {
//     const requestData = {
//       user_id: "6715ddf4f8e9fdb62dddf15e",
//       price: amount,
//       phone: "9340785987",
//       name: "sohan",
//       merchantTransactionId: "6715ddf4f8e9fdb62dddf15e",
//     };

//     console.log(requestData, "requestdata");

//     try {
//       const response = await axios.post(apiUrl, requestData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data) {
//         setBalance((prev) => prev + amount);
//         window.location.href = response.data;
//       }
//     } catch (error) {
//       console.error("Error during payment request:", error);
//       alert("Payment request failed. Please try again.");
//     }
//   };

//   const handleAddRegistrationAmount = () => {
//     makeApiCall(500);
//   };

//   const handleAddCustomAmount = () => {
//     const amount = parseFloat(customAmount);
//     if (!amount || amount <= 0) {
//       alert("Please enter a valid amount.");
//       return;
//     }
//     makeApiCall(amount);
//     closePopup();
//   };

//   const openPopup = () => setIsPopupOpen(true);
//   const closePopup = () => setIsPopupOpen(false);

//   return (
//     <Layout>
//       <div>
//         <div className="app">
//           <div className="balance-section">
//             <p className="current-balance-text">Current Balance</p>
//             <h1 className="balance">
//               <span className="currency">INR</span> {balance}
//             </h1>
//             <p className="currency-name">Indian Rupees</p>

//             {balance > 0 ? (
//               <button onClick={openPopup} className="amount-button">
//                 Add Amount
//               </button>
//             ) : (
//               <button
//                 onClick={handleAddRegistrationAmount}
//                 className="amount-button"
//               >
//                 Add Registration Amount
//               </button>
//             )}
//           </div>
//         </div>

//         {/* custom price popup */}
//         {isPopupOpen && (
//           <div className="popup-overlay">
//             <div className="popup">
//               <h2>Enter Amount</h2>
//               <input
//                 type="number"
//                 value={customAmount}
//                 onChange={(e) => setCustomAmount(e.target.value)}
//                 placeholder="Enter amount"
//                 className="custom-amount-input"
//               />
//               <div className="popup-actions">
//                 <button
//                   onClick={handleAddCustomAmount}
//                   className="popup-button"
//                 >
//                   Add
//                 </button>
//                 <button onClick={closePopup} className="popup-button">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Wallet;

import React, { useState } from "react";
import axios from "axios";
import Layout from "../../component/Layout";
import { BASE_URL, PAYMENT_API } from "../../apiconstant/apiconstant";

const Wallet = () => {
  const [balance, setBalance] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const apiUrl = BASE_URL + PAYMENT_API;

  const generateTransactionId = () => 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const makeApiCall = async (amount) => {
    if (isProcessing) return;
    setIsProcessing(true);
  
    const requestData = {
      user_id: "6715ddf4f8e9fdb62dddf15e",
      price: amount,
      phone: "9407872115",
      name: "sohan",
      merchantTransactionId: generateTransactionId(),
    };
  
    console.log(requestData,"requestData");

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("RAW API RESPONSE:", JSON.stringify(response.data, null, 2));
  
      // If response is directly the URL string
      if (typeof response.data === 'string' && response.data.startsWith('http')) {
        window.open(response.data, "_blank"); // Open the payment link in a new tab
        return;
      }
  
      // Universal URL finder inside an object
      const findPaymentUrl = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && obj[key].startsWith('http')) {
            return obj[key];
          }
          if (typeof obj[key] === 'object') {
            const result = findPaymentUrl(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };
  
      const paymentUrl = findPaymentUrl(response.data);
  
      if (paymentUrl) {
        window.open(paymentUrl, "_blank"); // Open in a new tab
      } else {
        console.error("Payment URL not found in response.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  

  const handleAddRegistrationAmount = () => {
    makeApiCall(500);
  };

  const handleAddCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    makeApiCall(amount);
    closePopup();
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <Layout>
      <div className="app">
        <div className="balance-section">
          <p className="current-balance-text">Current Balance</p>
          <h1 className="balance">
            <span className="currency">₹</span> {balance}
          </h1>
          {/* <p className="currency-name">Indian Rupees</p> */}

          {balance > 0 ? (
            <button 
              onClick={openPopup} 
              className="amount-button"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Add Amount"}
            </button>
          ) : (
            <button
              onClick={handleAddRegistrationAmount}
              className="amount-button"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Add Registration Amount"}
            </button>
          )}
        </div>

        {/* Custom Amount Popup */}
        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Enter Amount</h2>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="custom-amount-input"
                min="1"
                step="1"
              />
              <div className="popup-actions">
                <button
                  onClick={handleAddCustomAmount}
                  className="popup-button"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Add"}
                </button>
                <button 
                  onClick={closePopup} 
                  className="popup-button"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wallet;