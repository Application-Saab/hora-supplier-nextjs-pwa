import React, { useEffect, useState } from "react";
import { BASE_URL, ORDER_INGREDIENTS } from "../../../apiconstant/apiconstant";
import Image from "next/image";

const OrderDetailsIngre = ({ orderDetail, orderType }) => {
  const [orderIngredients, setOrderIngredients] = useState({});
  const [loading, setLoading] = useState(false);
  async function fetchOrderIngredients() {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + ORDER_INGREDIENTS + "/" + orderDetail.order_id
      );
      const responseData = await response.json();
      setOrderIngredients(responseData.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderIngredients();
  }, []);

  if (loading) {
    return (
      <center>
        <div className="custom-spinner">
          <div>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div style={{ color: "#9252AA", textAlign: "center" }}>
              <h4>Data is loading...</h4>
            </div>
          </div>
        </div>
      </center>
    );
  }

  return (
    <div className="ingredients-section">
      <div className="ingredients-header">
        <h3>Required Ingredient</h3>
        <p>(Keep these ingredients ready at your location)</p>
      </div>
      <div className="ingredients-list">
        {Object.keys(orderIngredients).map((item, index) => (
          <div className="ingredient-item" key={index}>
            <div className="ingredient-image">
              <Image
                src={`https://horaservices.com/api/uploads/${orderIngredients[item].image}`}
                alt={item}
                width={80} height={80}
              />
            </div>
            <div className="ingredient-details">
              <p className="ingredient-name">{item}</p>
              <p className="ingredient-quantity">
                {orderIngredients[item].qty.toFixed(2)}{" "}
                {orderIngredients[item].unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailsIngre;
