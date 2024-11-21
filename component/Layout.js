import React, { useEffect } from 'react';
import Navbar from './Navbar';

const Layout = ({ children, navTitle, backLink, showBackButton = true }) => {

  useEffect(() => {
    // Prevent back navigation
    const handleBackButton = (event) => {
      // Push the current state to history to "trap" the user in the app
      window.history.pushState(null, '', window.location.href);
    };

    // Add event listener for popstate (when back button is pressed)
    window.addEventListener('popstate', handleBackButton);

    // Optionally, push the current state to history when the component mounts
    window.history.pushState(null, '', window.location.href);

    // Clean up listener on unmount
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []); // Empty dependency array to run only once on component mount

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
