import React from 'react';
import Navbar from './Navbar'; 
import Sidebar from './Sidebar'; 

const Layout = ({ children, navTitle }) => {
  return (
    <div>
      {/* Navbar */}
      {/* <Navbar /> */}
      
      <Navbar navTitle={navTitle} />

      {/* Sidebar and Main content */}
      <div style={{ display: 'flex' }}>
        {/* <Sidebar isOpen={isSidebarOpen} /> */}
        
        <main >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
