"use client";
import React, { useState, useEffect } from 'react';
import Layout from '../../component/Layout';

const OrderDashboard = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load phone number from localStorage and set default dates
  useEffect(() => {
    // Get phone number from localStorage
    const savedPhoneNumber = localStorage.getItem('mobileNumber') || localStorage.getItem('phoneNumber');
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    }

    // Set default dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Save phone number to localStorage when it changes
  useEffect(() => {
    if (phoneNumber) {
      localStorage.setItem('mobileNumber', phoneNumber);
    }
  }, [phoneNumber]);

  // Auto-fetch data when dates change (if phone number exists)
  useEffect(() => {
    if (phoneNumber && startDate && endDate && !loading) {
      // Add a small delay to prevent too many API calls
      const timeoutId = setTimeout(() => {
        fetchOrders();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate]); // Only trigger on date changes

  // First API call to get _id from phone number
  const getUserIdFromPhone = async (phone) => {
    try {
      const response = await fetch('https://horaservices.com/api/admin/admin_user_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
          phone: phone,
          per_page: 1,
          role: "supplier"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle array format response
      if (result && result.data && result.data.users && result.data.users.length > 0) {
        return result.data.users[0]._id;
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      throw new Error(`Failed to get user ID: ${err.message}`);
    }
  };

  const fetchOrders = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // Step 1: Get user ID from phone number
      const userId = await getUserIdFromPhone(phoneNumber.trim());
      
      // Step 2: Get orders using the retrieved user ID
      const response = await fetch('https://horaservices.com/api/admin/adminOrderList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          per_page: 5000,
          toId: userId,
          start_date: startDate,
          end_date: endDate,
          status: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.data && result.data.order && Array.isArray(result.data.order)) {
        setAllOrders(result.data.order);
        // Generate report with API filtered data (no additional filtering needed)
        generateReport(result.data.order);
      } else {
        setError('No orders found in response or invalid data structure');
        setAllOrders([]);
      }
    } catch (err) {
      setError(`${err.message}`);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (orderData) => {
    const filteredOrders = orderData.filter(order => {
      return order.order_date;
    });

    const monthlyData = {};

    filteredOrders.forEach(order => {
      // Use order_date for grouping (this is the field that matters for business logic)
      const orderDate = new Date(order.order_date);
      const monthKey = `${orderDate.getUTCFullYear()}-${String(orderDate.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total_amount: 0,
          balance_amount: 0,
          vendor_amount: 0,
          advance_amount: 0,
          total_count: 0
        };
      }

      // Safely parse numeric values
      monthlyData[monthKey].total_amount += parseFloat(order.total_amount) || 0;
      monthlyData[monthKey].balance_amount += parseFloat(order.balance_amount) || 0;
      monthlyData[monthKey].vendor_amount += parseFloat(order.vendor_amount) || 0;
      monthlyData[monthKey].advance_amount += parseFloat(order.advance_amount) || 0;
      monthlyData[monthKey].total_count += 1;
    });

    setReport({
      summary: {
        total_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        balance_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.balance_amount) || 0), 0),
        vendor_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.vendor_amount) || 0), 0),
        advance_amount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.advance_amount) || 0), 0),
        total_count: filteredOrders.length
      },
      monthly: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
      filteredOrders: filteredOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "status-booked" };
      case 1:
        return { status: "Accepted", className: "status-accepted" };
      case 2:
        return { status: "In-progress", className: "status-in-progress" };
      case 3:
        return { status: "Completed", className: "status-completed" };
      case 4:
        return { status: "Cancelled", className: "status-cancelled" };
      case 5:
        return { status: "", className: "status-empty" };
      case 6:
        return { status: "Expired", className: "status-expired" };
      default:
        return { status: "Unknown", className: "status-unknown" };
    }
  };

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

  return (
    <Layout>
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Order Analytics</h1>
        <p className="dashboard-subtitle">Reports & Analytics</p>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="form-input"
          />
        </div>
        
        <div className="date-group">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                Loading...
              </span>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner-large"></div>
            <p>Loading order data...</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {allOrders.length > 0 && !loading && (
        <div className="status-message success">
          ✅ Found {allOrders.length} orders
        </div>
      )}
      
      {error && !loading && (
        <div className="status-message error">
          ❌ {error}
        </div>
      )}

      {/* Summary Cards - Mobile First */}
      {report && !loading && (
        <>
          <div className="section">
            <h2 className="section-title">Summary Report</h2>
            <div className="summary-cards">
              <div className="summary-card total">
                <div className="card-header">
                  <span className="card-title">Total Amount</span>
                  <span className="card-percentage">100%</span>
                </div>
                <div className="card-amount">{formatCurrency(report.summary.total_amount)}</div>
              </div>
              
              <div className="summary-card balance">
                <div className="card-header">
                  <span className="card-title">Balance Amount</span>
                  <span className="card-percentage">
                    {report.summary.total_amount ? ((report.summary.balance_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="card-amount">{formatCurrency(report.summary.balance_amount)}</div>
              </div>
              
              <div className="summary-card vendor">
                <div className="card-header">
                  <span className="card-title">Extra Pay</span>
                  <span className="card-percentage">
                    {report.summary.total_amount ? ((report.summary.vendor_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="card-amount">{formatCurrency(report.summary.vendor_amount)}</div>
              </div>
              
              <div className="summary-card advance">
                <div className="card-header">
                  <span className="card-title">Advance Amount</span>
                  <span className="card-percentage">
                    {report.summary.total_amount ? ((report.summary.advance_amount / report.summary.total_amount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="card-amount">{formatCurrency(report.summary.advance_amount)}</div>
              </div>
              
              <div className="summary-card count">
                <div className="card-header">
                  <span className="card-title">Total Orders</span>
                  <span className="card-percentage">-</span>
                </div>
                <div className="card-amount">{report.summary.total_count.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Monthly Analysis - Mobile Optimized */}
          {report.monthly.length > 0 && (
            <div className="section">
              <h2 className="section-title">Monthly Analysis</h2>
              <div className="monthly-cards">
                {report.monthly.map((monthData, index) => (
                  <div key={monthData.month} className="monthly-card">
                    <div className="monthly-header">
                      <h3>{new Date(monthData.month + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                      <span className="order-count">{monthData.total_count} orders</span>
                    </div>
                    <div className="monthly-stats">
                      <div className="stat-row">
                        <span className="stat-label">Total:</span>
                        <span className="stat-value total">{formatCurrency(monthData.total_amount)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Balance:</span>
                        <span className="stat-value balance">{formatCurrency(monthData.balance_amount)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Extra Pay:</span>
                        <span className="stat-value vendor">{formatCurrency(monthData.vendor_amount)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Advance:</span>
                        <span className="stat-value advance">{formatCurrency(monthData.advance_amount)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Avg Order:</span>
                        <span className="stat-value avg">
                          {formatCurrency(monthData.total_count ? monthData.total_amount / monthData.total_count : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Detail - Mobile Optimized */}
          {report.filteredOrders.length > 0 && (
            <div className="section">
              <h2 className="section-title">Order Details ({report.filteredOrders.length})</h2>
              <div className="orders-list">
                {report.filteredOrders.slice(0, 50).map((order, index) => {
                  const orderStatus = getOrderStatus(order.order_status);
                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">{getOrderId(order.order_id)}</span>
                        <span className={`status-badge ${orderStatus.className}`}>
                          {orderStatus.status}
                        </span>
                      </div>
                      
                      <div className="order-details-ll">
                        <div className="detail-row">
                          <span className="detail-label">Order Date:</span>
                          <span className="detail-value">{formatDate(order.order_date)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{order.phone_no || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Locality:</span>
                          <span className="detail-value">{order.order_locality || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="order-amounts">
                        <div className="amount-row">
                          <span className="amount-label">Total:</span>
                          <span className="amount-value total">{formatCurrency(order.total_amount || 0)}</span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Balance:</span>
                          <span className="amount-value balance">{formatCurrency(order.balance_amount || 0)}</span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Advance:</span>
                          <span className="amount-value advance">{formatCurrency(order.advance_amount || 0)}</span>
                        </div>
                        <div className="amount-row">
                          <span className="amount-label">Extra Pay:</span>
                          <span className="amount-value vendor">{formatCurrency(order.vendor_amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {report.filteredOrders.length > 50 && (
                <div className="pagination-info">
                  Showing first 50 orders out of {report.filteredOrders.length} total orders
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </Layout>
  );
};

export default OrderDashboard;