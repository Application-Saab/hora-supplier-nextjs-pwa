import React, { useState } from "react";
import axios from "axios";
import Layout from "../../component/Layout";
import { BASE_URL, PAYMENT_API } from "../../apiconstant/apiconstant";

const Wallet = () => {
  const [balance, setBalance] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const apiUrl = BASE_URL + PAYMENT_API;

  const makeApiCall = async (amount) => {
    const requestData = {
      user_id: "63edb239d680d47d95870fa0",
      price: amount,
      phone: "9340785987",
      name: "sohan",
      merchantTransactionId: "63edb239d680d47d95870fa0",
    };

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setBalance((prev) => prev + amount);
        window.location.href = response.data;
      }
    } catch (error) {
      console.error("Error during payment request:", error);
      alert("Payment request failed. Please try again.");
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
      <div>
        <div className="app">
          <div className="balance-section">
            <p className="current-balance-text">Current Balance</p>
            <h1 className="balance">
              <span className="currency">INR</span> {balance}
            </h1>
            <p className="currency-name">Indian Rupees</p>

            {balance > 0 ? (
              <button onClick={openPopup} className="amount-button">
                Add Amount
              </button>
            ) : (
              <button
                onClick={handleAddRegistrationAmount}
                className="amount-button"
              >
                Add Registration Amount
              </button>
            )}
          </div>
        </div>

        {/* custom price popup */}
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
              />
              <div className="popup-actions">
                <button
                  onClick={handleAddCustomAmount}
                  className="popup-button"
                >
                  Add
                </button>
                <button onClick={closePopup} className="popup-button">
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
