import React from 'react';
import Navbar from './Navbar'; 
import Sidebar from './Sidebar'; 

const Layout = ({ children, navTitle }) => {
  return (
    <div>
      <Navbar navTitle={navTitle} />

      <div>
        {/* <Sidebar isOpen={isSidebarOpen} /> */}
        
        <main >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
