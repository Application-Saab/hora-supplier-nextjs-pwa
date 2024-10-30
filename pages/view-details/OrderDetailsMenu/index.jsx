import Image from "next/image";
import React, { useState } from "react";

const OrderDetailsMenu = ({ orderDetail, orderType }) => {
  const [orderMenu, setOrderMenu] = useState(orderDetail?.selecteditems);
  const [orderStatus, setOrderStatus] = useState(orderDetail?.order_status);


  const categorizeItems = (category) => {
    return orderMenu
      ?.filter((item) => item.mealId[0].name === category)
      .map((item, index) => (
        <div className="menu-item" key={index}>
          <div className="menu-item-image">
            <Image
              src={`https://horaservices.com/api/uploads/${item?.image}`}
              alt={item.name}
              height={56}
              width={80}
            />
          </div>
          <div className="menu-item-details">
            <div className="menu-item-name">{item.name}</div>
            <div className="menu-item-price">₹ {item.price}</div>
          </div>
        </div>
      ));
  };

  const categories = [
    "Appetizer",
    "Breads, Rice and Raita",
    "Breakfast",
    "Dessert",
    "Main course",
    "Mocktails",
    "Salad & Papad",
    "Soups & Beverages",
  ];

  return (
    <>
      <div className="menu-section">
        {orderType !== 6 &&
          orderType !== 7 &&
          orderType !== 8 &&
          orderType !== 1 && (
            <div className="advance-preparations">
              <div className="advance-preparations-title">
                *Advance Preparations required
              </div>
              <div className="advance-preparations-text">
                {orderMenu?.map((item) => item.preperationtext).join(", ") ||
                  "NA"}
              </div>
            </div>
          )}

        {categories.map((category) => {
          const items = categorizeItems(category);
          return (
            items?.length > 0 && (
              <div className="meal-category" key={category}>
                <span className="category-title">
                  {category} ({items.length})
                </span>
                <div className="menu-items">{items}</div>
              </div>
            )
          );
        })}
      </div>

      {/* {orderStatus === 0 || orderStatus === 1 || orderStatus === 2 ? (
        <div className="rate-us-footer">
          <button className="rate-us-button">Rate Us</button>
        </div>
      ) : null} */}
    </>
  );
};

export default OrderDetailsMenu;
