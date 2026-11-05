
import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import logo from '../assets/new_logo_light.png.png';
import backArr from '../assets/arrow-black.svg';

const Navbar = ({ backLink = "/hora-partner/home", navTitle, showBackButton = true }) => {

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}
    >
      {/* Left Side: Back Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <Link href={backLink}>
            <Image
              src={backArr.src}
              width={20}
              height={20}
              alt="Back"
            />
          </Link>
        )}
      </div>

      {/* Right Side: Logo */}
      <Image
        src={logo}
        alt="logo"
        width={52}
        height={52}
      />
    </nav>
  );
};

export default Navbar;
