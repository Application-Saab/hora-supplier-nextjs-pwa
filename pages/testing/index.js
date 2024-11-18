import React, { useState } from "react";
import axios from "axios";

const FetchAllOrders = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://horaservices.com:3000/api/order/update_order_status", {
        headers: {
          "Content-Type": "application/json",
          // Include authorization header if required
        },
      });
      console.log(res, "res");
      setData(res.data); // Save the API response in state
      setError(null); // Clear any previous error
    } catch (err) {
      setError(err.message); // Capture and display any errors
      setData(null); // Clear previous data
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch All Orders</button>
      <div>
        {data && (
          <pre style={{ textAlign: "left" }}>
            <strong>Data:</strong> {JSON.stringify(data, null, 2)}
          </pre>
        )}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
    </div>
  );
};

export default FetchAllOrders;
