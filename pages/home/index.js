import React, { useState , useEffect } from "react";
import logo from "../../assets/new_logo_light.png.png";
import bellLogo from "../../assets/bell.png";
import { BASE_URL , GET_USER_DETAIL_ENDPOINT } from "../../apiconstant/apiconstant"
import myAccountLogo from "../../assets/myaccount_icon.png";
import ratingLogo from "../../assets/rating_icon.png";
import acceptedOrderLogo from "../../assets/tracking_icon.png";
import walletLogo from "../../assets/wallet_icon.png";
import trackingLogo from "../../assets/tracking_icon.png";
import axios from 'axios';
;import Image from "next/image";
import Navbar from "../../component/Navbar";
import Link from "next/link";

const Home = () => {

  const menuItems = [
    { id: 1, name: "New Orders", icon: bellLogo, path: "/supplier-new-order" },
    { id: 2, name: "My Wallet", icon: walletLogo, path: "/my-wallet" },
    { id: 3, name: "My Account", icon: myAccountLogo, path: "/MyAcount" },
    {
      id: 4,
      name: "Accepted Orders",
      icon: trackingLogo,
      path: "/accepted-orders",
    },
    { id: 5, name: "My Ratings", icon: ratingLogo, path: "/my-ratings" },
  ];
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const mobileNumber = localStorage.getItem('mobileNumber');
    const fetchData = async () => {
      const url = `${BASE_URL}${GET_USER_DETAIL_ENDPOINT}`;
      const requestData = {
        phone: mobileNumber
      };

      const headers = {
        "Content-Type": "application/json",
        'Authorization': token
      };

      try {
        const response = await axios.get(url, {
          params: requestData, // Use params for GET request
          headers: headers
        });

        if (response.status === 200) {
          localStorage.setItem("supplierCity", response.data.data.city);
          localStorage.setItem("supplierJobProfile", response.data.data.job_profile);
          localStorage.setItem("supplierExperince", response.data.data.experience);
          localStorage.setItem("supplierName", response.data.data.name);
          localStorage.setItem("supplierJobType", response.data.data.order_type);

        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchData();
  }, []); 

  return (
    <>
      <div className="container">
        <Navbar />
        <div style={{ marginTop: "10px" }}>
          <div className="main-menu-container">
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div key={item.id} className="menu-item">
                  <Link href={item.path}>
                    <Image
                      src={item.icon.src}
                      alt={item.name}
                      width={100}
                      height={100}
                    />
                    <p style={{ font: "Roboto" }}>{item.name}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
