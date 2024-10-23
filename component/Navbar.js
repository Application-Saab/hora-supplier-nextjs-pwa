// // components/Navbar.js
// import React, { useState } from 'react';
// import Image from "next/image";
// import logo from '../assets/new_logo_light.png.png';

// import Link from 'next/link'; // Import Link for navigation

// const Navbar = ({ navTitle }) => {

//   return (
//     <nav className="navbar">
//       <div className="navbar-content">
//         {/* <button onClick={toggleSidebar} className="toggle-button">
//           Toggle Sidebar
//         </button> */}
//          <h1>{navTitle}</h1> {/* Dynamic title based on the page */}
//          <Image
//                     src={logo}
//                     alt="logo"
//                     width={50}
//                     height={50}
//                   />

//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// components/Navbar.js
import React from 'react';
import Image from "next/image";
import Link from 'next/link'; // Import Link for navigation
import logo from '../assets/new_logo_light.png.png';

const Navbar = ({ showSupplierLink, navTitle }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>My App</h1> {/* Static title */}
         {/* Dynamic title based on the page */}
       
        <Image
          src={logo}
          alt="logo"
          width={50}
          height={50}
        />
        <h2>{navTitle}</h2>
      </div>
    </nav>
  );
};

export default Navbar;
