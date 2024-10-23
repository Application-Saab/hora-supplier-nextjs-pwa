// // components/Sidebar.js
// import React from 'react';

// const Sidebar = ({ isOpen }) => {
//   return (
//     <div className={`sidebar ${isOpen ? 'open' : ''}`}>
//       <ul>
//         <li>Dashboard</li>
//         <li>Profile</li>
//         <li>Settings</li>
//         <li>Logout</li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

// components/Sidebar.js


import React from 'react';
import Link from 'next/link';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'visible' : 'hidden'}`}>
      <ul>
        <li>
          <Link href="/Dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/Profile">Profile</Link>
        </li>
        <li>
          <Link href="/settings">Settings</Link>
        </li>
        <li>
          <Link href="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
