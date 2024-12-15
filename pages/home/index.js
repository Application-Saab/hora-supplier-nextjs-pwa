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
import Layout from "../../component/Layout";

const Home = () => {

  const menuItems = [
    { id: 1, name: "New Orders", icon: bellLogo, path: "/supplier-new-order" },
    { id: 2, name: "My Wallet", icon: walletLogo, path: "/home" },
    { id: 3, name: "My Account", icon: myAccountLogo, path: "/MyAcount" },
    {
      id: 4,
      name: "Accepted Orders",
      icon: trackingLogo,
      path: "/accepted-orders",
    },
    { id: 5, name: "My Ratings", icon: ratingLogo, path: "/home" },
  ];
  const [error, setError] = useState(null);

  useEffect(() => {
    let token;
    let mobileNumber;

    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      token = localStorage.getItem('token');
      mobileNumber = localStorage.getItem('mobileNumber');
    }	
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
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem("supplierCity", response.data.data.city);
            localStorage.setItem("supplierJobProfile", response.data.data.job_profile);
            localStorage.setItem("supplierExperince", response.data.data.experience);
            localStorage.setItem("supplierName", response.data.data.name);
            localStorage.setItem("supplierJobType", response.data.data.order_type);
            localStorage.setItem("supplierAge", response.data.data.age);
          }	


        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchData();
  }, []); 

  return (
    <>
    <Layout showBackButton={false}>
      <div className="container">
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
        <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '15px', 
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.5',
      fontSize: '14px', 
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #97538c',
       width: '94%',
    margin: '10px auto 0',
    }}>
      <p><strong style={{fontSize:'18px'}}>Note:</strong></p>
      <p>1. Please read the <b>inclusions and comments</b> very carefully.</p>
      <p>2. Do not miss any material mentioned in inclusions and comments.</p>
      <p>3. <b>Please be on time.</b> Customers don't like late arrivals 🥺</p>
      <p>4. If you want to change anything from design please let us know in advance.</p>
      <p>5. Always carry gluedots and avoid using tapes.</p>
      <p>6. Please collect the payment before leaving the spot. In case of any payment-related issues, please reach out to us at the same time. <b>Do not leave the spot without taking payment from the spot</b></p>
      <p><b>It's important day for customers, we need to make it perfect ☺</b></p>
    </div>
      </div>
      </Layout>
    </>
  );
};

export default Home;
