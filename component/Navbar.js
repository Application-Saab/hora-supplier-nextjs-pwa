// // components/Navbar.js
// import React from 'react';
// import Image from "next/image";
// import Link from 'next/link'; // Import Link for navigation
// import logo from '../assets/hora-logo-light.png';

// const Navbar = ({ showSupplierLink, navTitle }) => {
//   return (
//     <nav className="navbar">
//         <Image
//           src={logo}
//           alt="logo"
//           width={52}
//           height={52}
//           style={{ margin: "0 auto"}}
//         />
//     </nav>
//   );
// };

// export default Navbar;


// components/Navbar.js
import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import logo from '../assets/hora-logo-light.png';

const Navbar = ({ backLink = "/home", navTitle, showBackButton = true }) => {
  return (
    <nav className="navbar">
      {/* Conditionally Render Back Button */}
      {showBackButton && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href={backLink}>
              <span style={{ fontSize: '20px', marginRight: '5px' }}>←</span>
              <span>Back</span>
            
          </Link>
        </div>
      )}
      
      {/* Logo */}
      <Image
        src={logo}
        alt="logo"
        width={52}
        height={52}
        style={{ margin: "0 auto" }}
      />

      {/* Optional title */}
      {navTitle && <h1 style={{ marginLeft: '10px' }}>{navTitle}</h1>}
    </nav>
  );
};

export default Navbar;
