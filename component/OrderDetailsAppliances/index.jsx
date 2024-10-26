import React, { useEffect, useState } from "react";
import daal_image from "../../assets/daal-image.png";
import Image from "next/image";
import BurnerIcon from '../../assets/burner.png'

const OrderDetailsAppliances = ({ orderDetail, orderType }) => {
  const [orderAppliances, setOrderAppliances] = useState([]);

  useEffect(() => {
    if (orderDetail?.orderApplianceIds) {
      setOrderAppliances(orderDetail?.orderApplianceIds);
    }
  }, [orderDetail]);


  return (
    <>
      <div className="appliances-section">
        <h4 className="application-section-heading">Required Burners</h4>
        <p className="application-section-para">
          (Burners would be used at your location)
        </p>
        <div className="burner-count">
          <Image src={BurnerIcon} alt="Burner Icon" />
          <span>04</span>
        </div>
        <h4 className="application-section-heading">
          Requires Special Appliances
        </h4>
        <p className="application-section-para">
          (Keep these appliances ready at your location)
        </p>
        <div className="appliance-items">
          {orderAppliances.length > 0 ? (
            orderAppliances.map((item, index) => (
              <div key={index} className="appliance-item">
                <img
                  src={`https://horaservices.com/api/uploads/${item?.image}`}
                  alt={item.name}
                />
                <p>{item.name}</p>
              </div>
            ))
          ) : (
            <>
              <p className="application-section-para">
                No special appliances required.
              </p>
              <p className="application-section-para">
                Normally available utensils would be sufficient to complete your
                order.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetailsAppliances;
