import React, { useEffect, useState } from "react";
import OrderDetailHeader from "./OrderDetailHeader/index";
import OrderDetailTab from "./OrderDetailTab/index";
import {
  BASE_URL,
  GET_DECORATION_DETAILS,
  ORDER_DETAILS_ENDPOINT,
  GET_BOOKING_ORDER_DETAILS
} from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";

// order.type is 2 for chef
// order.type is 1 for decoration
// order.type is 3 for waiter
// order type 4 bar tender
// order type 5 cleaner
// order type 6 Food Delivery
// order type 7 Live Catering

const OrderDetail = () => {

  const router = useRouter();
  let { apiOrderId, orderType, orderId } = router.query;
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState([]);
  const [decorationItems, setDecorationItems] = useState([]);
  const [decorationComments, setDecorationComments] = useState("");

  console.log(orderType, "ordertype");

  orderType = parseInt(orderType);

  console.log(orderType, "ordert2");



  useEffect(() => {
    if (
      orderType == 2 ||
      orderType === 6 ||
      orderType === 7 ||
      orderType === 8
    ) {
      fetchOrderDetailsMenu();
    } else if (orderType === 1) {
      // alert("if orderType = 1");
      console.log(orderType, "orderType");
      fetchDecorationOrderDetails();
    }
  }, [orderType, orderId, apiOrderId]);

  useEffect(() => {
    if (orderType === 3 || orderType === 4 || orderType === 5) {
      fetchOrderDetails();
    }
  }, [orderType, orderId, apiOrderId]);

  const fetchOrderDetailsMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + ORDER_DETAILS_ENDPOINT + "/v1/" + apiOrderId
      );
      const responseData = await response.json();
      console.log(responseData, "order11");
      console.log(apiOrderId, "apiordersdf");
      setOrderDetail(responseData.data);
      console.log(responseData)
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchDecorationOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + GET_BOOKING_ORDER_DETAILS + "/" + orderId
      );
      const responseData = await response.json();


      console.log(responseData, "Response data");
      
      console.log(responseData.data.order_id);

      
      console.log(responseData.data, "new jadu");

      setOrderDetail(responseData.data._doc);
      // setOrderDetail(responseData?.data?._doc);
      // setDecorationItems(responseData?.data?.items[0]?.decoration);
      setDecorationItems(responseData.data.items[0].decoration);
      setDecorationComments(responseData?.data?._doc.decoration_comments);
      setLoading(false);
    } catch (error) {
      console.log("fetchDecorationOrderDetails error", error);
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        BASE_URL + ORDER_DETAILS_ENDPOINT + "/v1/" + apiOrderId
      );
      const responseData = await response.json();

      setOrderDetail(responseData.data);
      setHospitalityServiceCount(responseData.data.no_of_people);
      setHospitalityServiceTotalAmount(responseData.data.total_amount);
      setLoading(false);
    } catch (error) {
      console.log("fetchOrderDetails error", error);
      setLoading(false);
    }
  };

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
    <>
      <div className="orderheader-orderdetail">
        <OrderDetailHeader orderDetail={orderDetail} />
        <div className="order-detail-page-decoration">
          <OrderDetailTab
            orderDetail={orderDetail}
            orderType={orderType}
            decorationItems={decorationItems}
            decorationComments={decorationComments}
          />
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
