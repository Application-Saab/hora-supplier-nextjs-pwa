import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL, ORDERLIST_ENDPOINT } from "../../apiconstant/apiconstant";
import Layout from "../../component/Layout";

const SUBMIT_LINK_ENDPOINT = '/api/photo/drive/add-order-drive-link'; 

const GoogleDriveForm = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [driveLink, setDriveLink] = useState('');

  // Fetch supplier info from localStorage
  let supplierID;
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    supplierID = localStorage.getItem("supplierID");
  }

  // Styles
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    },
    heading: {
      marginBottom: '20px',
      textAlign: 'center',
      color: '#333',
    },
    orderList: {
      listStyle: 'none',
      padding: 0,
    },
    orderItem: {
      padding: '10px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    button: {
      padding: '8px 14px',
      backgroundColor: '#1a73e8',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    popup: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    popupInner: {
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '10px',
      width: '400px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      marginBottom: '20px',
      fontSize: '14px',
    },
  };

  // Fetch order list on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(BASE_URL + ORDERLIST_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            per_page: 1000,
            type: 8,
            toId: supplierID,
          }),
        });

        const data = await response.json();

        console.log("Full API response:", data);

        //  Fixed: Access the correct data structure
        // According to your API response, orders are in data.data.order
        const orderList = data?.data?.order || [];
        
        console.log("Extracted orders:", orderList);

        //  Filter: show only orders without orderDriveLink
        const filtered = orderList.filter(order =>
          !('orderDriveLink' in order) || order.orderDriveLink === null || order.orderDriveLink === ''
        );

        console.log("Filtered orders (without drive links):", filtered);

        setOrders(filtered);
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [supplierID]);

  // Validate Google Drive link
  const isValidDriveLink = (link) => {
    const pattern = /^https:\/\/drive\.google\.com\/[a-zA-Z0-9\/\-_?=.&]+$/;
    return pattern.test(link);
  };

  //  Submit Google Drive link
  const handleSubmitDriveLink = async () => {
    if (!isValidDriveLink(driveLink)) {
      alert('Invalid Google Drive link.');
      return;
    }

    try {
      // Find the current order details for both API calls
      const currentOrder = orders.find(order => order._id === selectedOrderId);
      
      if (!currentOrder) {
        alert('Order not found.');
        return;
      }

      // First API call - Submit drive link
      const payload = {
        // orderId: selectedOrderId,
        order_id: currentOrder.order_id,
        folderUrl: driveLink,
      };

      const response = await axios.post(BASE_URL + SUBMIT_LINK_ENDPOINT, payload);
      console.log('Drive link submitted successfully:', response.data);

      // Second API call - Update Google Sheet
      const googleSheetPayload = {
        orderIdDb: currentOrder.order_id,
        orderIdCustomer: currentOrder.order_id + 10800,
        phone: currentOrder.phone_no,
        fulfillmentDate: currentOrder.order_date
          ? new Date(currentOrder.order_date).toLocaleDateString("en-GB")
          : "N/A",
        services: "Photography",
        driveLink: driveLink,
        horaWebLink: "N/A",
      };

      console.log('Updating Google Sheet with payload:', googleSheetPayload);

      const googleSheetResponse = await fetch(
        `${BASE_URL}/api/photo/drive/update-google-sheet`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(googleSheetPayload),
        }
      );

      const googleSheetResult = await googleSheetResponse.json();
      console.log('Google Sheet update response:', googleSheetResult);

      if (!googleSheetResponse.ok) {
        console.warn('Google Sheet update failed but continuing...');
      }

      alert('Drive link submitted successfully!');

      // Remove the submitted order from the list
      setOrders(prev => prev.filter(order => order._id !== selectedOrderId));

      // Reset and close popup
      setPopupOpen(false);
      setDriveLink('');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Submission failed.');
    }
  };

  //  Popup open/close handlers
  const openPopup = (orderId) => {
    setSelectedOrderId(orderId);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setDriveLink('');
  };

  //  Render
  return (
    <Layout>
    <div style={styles.container}>
      <h3 style={styles.heading}>Orders Missing Google Drive Link</h3>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <ul style={styles.orderList}>
          {orders.map((order) => (
            <li key={order._id} style={styles.orderItem}>
              <span>Order ID: {order.order_id + 10800 || order._id}</span>
              <button style={styles.button} onClick={() => openPopup(order._id)}>
                Submit Drive Link
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Popup Modal */}
      {popupOpen && (
        <div style={styles.popup}>
          <div style={styles.popupInner}>
            <h4>Submit Google Drive Link</h4>
            <input
              type="text"
              style={styles.input}
              placeholder="Paste Google Drive link"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
            />
            <button style={styles.button} onClick={handleSubmitDriveLink}>
              Submit
            </button>
            <button
              style={{ ...styles.button, backgroundColor: '#888', marginTop: '10px' }}
              onClick={closePopup}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default GoogleDriveForm;