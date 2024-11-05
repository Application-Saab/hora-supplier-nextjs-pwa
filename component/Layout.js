// import React from 'react';
// import Navbar from './Navbar'; 
// import Sidebar from './Sidebar'; 

// const Layout = ({ children, navTitle }) => {
//   return (
//     <div>
//       <Navbar navTitle={navTitle} />

//       <div>
//         {/* <Sidebar isOpen={isSidebarOpen} /> */}
        
//         <main >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// components/Layout.js
import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, navTitle, backLink, showBackButton = true }) => {
  return (
    <div>
      <Navbar backLink={backLink} navTitle={navTitle} showBackButton={showBackButton} />

      <div>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
