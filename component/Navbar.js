// components/Navbar.js
import React from 'react';
import Image from "next/image";
import Link from 'next/link'; // Import Link for navigation
import logo from '../assets/hora-logo-light.png';

const Navbar = ({ showSupplierLink, navTitle }) => {
  return (
    <nav className="navbar">
        <Image
          src={logo}
          alt="logo"
          width={52}
          height={52}
          style={{ margin: "0 auto"}}
        />
    </nav>
  );
};

export default Navbar;
