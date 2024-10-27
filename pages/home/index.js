import React, { useState } from "react";
import logo from "../../assets/new_logo_light.png.png";
import bellLogo from "../../assets/bell.png";

import myAccountLogo from "../../assets/myaccount_icon.png";
import ratingLogo from "../../assets/rating_icon.png";
import acceptedOrderLogo from "../../assets/tracking_icon.png";
import walletLogo from "../../assets/wallet_icon.png";
import trackingLogo from "../../assets/tracking_icon.png";

import Image from "next/image";
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
