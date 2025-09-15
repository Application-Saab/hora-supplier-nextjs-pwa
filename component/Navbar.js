
import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/hora-logo-light.png';
import backArr from '../assets/back_arrow1.png';

const Navbar = ({ backLink = "/home", navTitle, showBackButton = true }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Left Side: Back Button */}
      {showBackButton && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href={backLink}>
            <Image
              src={backArr}
              width={30}
              height={30}
              alt="Back"
              style={{ margin: "0 auto" }}
            />
          </Link>
        </div>
      )}

      {/* Center: Logo */}
      <Image
        src={logo}
        alt="logo"
        width={52}
        height={52}
        style={{ margin: "0 auto" }}
      />

      {/* Right Side: Logout Icon */}
      <IconButton onClick={handleLogout} color="inherit">
        <LogoutIcon />
      </IconButton>
    </nav>
  );
};

export default Navbar;
