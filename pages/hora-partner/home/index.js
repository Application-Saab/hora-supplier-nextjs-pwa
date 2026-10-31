import React, { useState, useEffect } from "react";
import { BASE_URL, GET_USER_DETAIL_ENDPOINT } from "../../../apiconstant/apiconstant";
import axios from 'axios';
import Link from "next/link";
import Layout from "../../../component/Layout";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  let supplierJobType;
  let supplierID;
  let supplierJobProfile;

  if (typeof window !== "undefined") {
    supplierJobType = localStorage.getItem("supplierJobType");
    supplierID = localStorage.getItem('supplierID');
    supplierJobProfile = localStorage.getItem("supplierJobProfile");
  }

  const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );

  const UserIcon = ({ color = "#2563eb" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const CalendarCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );

  const HistoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20v-5h-5" />
      <path d="M4 20h5v-5" />
      <path d="M20 4h-5v5" />
      <path d="M4 4v5h5" />
      <path d="M12 8v4l3 3" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );

  const menuItems = [
    {
      id: 1,
      name: "New Orders",
      icon: <BellIcon />,
      path: "/hora-partner/supplier-new-order",
      badge: "5"
    },
    {
      id: 3,
      name: "My Account",
      icon: <UserIcon color="#2563eb" />,
      path: "/hora-partner/MyAccount"
    },
    {
      id: 4,
      name: "Accepted Orders",
      icon: <CalendarCheckIcon />,
      path: "/hora-partner/accepted-orders",
    },
    {
      id: 6,
      name: "Past Orders",
      icon: <HistoryIcon />,
      path: "/hora-partner/past-order"
    },
    ...(supplierJobProfile === "Photography"
      ? [{ id: 7, name: "Profile", icon: <UserIcon color="#4f46e5" />, path: "/hora-partner/myProfile" }]
      : []),
  ];

  useEffect(() => {
    let token;
    let mobileNumber;

    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      token = localStorage.getItem('supplierToken');
      mobileNumber = localStorage.getItem('mobileNumber');
    }

    const fetchData = async () => {
      setLoading(true);
      const url = `${BASE_URL}${GET_USER_DETAIL_ENDPOINT}/${supplierID}`;
      const requestData = {
        phone: mobileNumber
      };

      const headers = {
        "Content-Type": "application/json",
        'Authorization': token
      };

      try {
        const response = await axios.get(url, {
          params: requestData,
          headers: headers
        });

        if (response.status === 200) {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem("supplierCity", response.data.data.city);
            localStorage.setItem("supplierJobProfile", response.data.data.job_profile);
            localStorage.setItem("supplierExperince", response.data.data.experience);
            localStorage.setItem("supplierName", response.data.data.name);
            localStorage.setItem("supplierJobType", response.data.data.order_type);
            localStorage.setItem("supplierAge", response.data.data.age);
            localStorage.setItem("status", response?.data?.data?.status);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Layout showBackButton={false}>
        <div className="hora-vendor-home-container">

          {loading ? (
            /* Skeleton Loader UI */
            <div className="hora-vendor-skeleton-wrapper">
              <div className="hora-vendor-skeleton-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="hora-vendor-skeleton-card">
                    <div className="hora-vendor-skeleton-icon hora-skeleton-shimmer"></div>
                    <div className="hora-vendor-skeleton-text hora-skeleton-shimmer"></div>
                  </div>
                ))}
              </div>
              <div className="hora-vendor-skeleton-notice hora-skeleton-shimmer"></div>
            </div>
          ) : (
            <>
              <div className="hora-vendor-menu-wrapper">
                <div className="hora-vendor-menu-grid">
                  {menuItems.map((item) => (
                    <Link href={item.path} key={item.id} className="hora-vendor-card-link">
                      <div className="hora-vendor-card-item">
                        <div className="hora-vendor-icon-container">
                          {item.icon}
                        </div>
                        <span className="hora-vendor-card-title">{item.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {supplierJobType === "8" ? (
                <div className="hora-vendor-notice-box">
                  <p className="hora-vendor-notice-heading"><strong>Note:</strong></p>
                  <ol className="hora-vendor-notice-list">
                    <li>Please read the <b>inclusions and comments</b> very carefully.</li>
                    <li><b>Please be on time.</b> Customers don&apos;t like late arrivals 🥺</li>
                    <li>Must carry a camera and flashlight (DSLRs and mirrorless cameras like Canon 80D, Sony A7M3, Canon R6).</li>
                    <li>
                      <b>Delivery timeline:</b>
                      <ul className="hora-vendor-sublist">
                        <li>• Color corrected drive link within <b>15 hrs</b></li>
                        <li>• Edited photos in <b>24 hrs</b></li>
                        <li>• Edited video in <b>3 days</b></li>
                        <li>• Album delivery in <b>6 days</b></li>
                      </ul>
                    </li>
                    <li>Only you must attend the shoot – no replacements allowed.</li>
                    <li>Dont eat or drink in the customer party (This may impact your next orders).</li>
                    <li>Always wear professional dress.</li>
                    <li>You should not use phone and take calls during the event.</li>
                    <li>Photographers have to bring a 10-feet extension wire (Only for umbrella light orders).</li>
                  </ol>
                  <p className="hora-vendor-notice-footer"><b>It&apos;s an important day for customers, we need to make it perfect ☺</b></p>
                </div>
              ) : (
                <div className="hora-vendor-notice-box">
                  <p className="hora-vendor-notice-heading"><strong>Note:</strong></p>
                  <ol className="hora-vendor-notice-list">
                    <li>Please read the <b>inclusions and comments</b> very carefully.</li>
                    <li>Do not miss any material mentioned in inclusions and comments.</li>
                    <li><b>Please be on time.</b> Customers don&apos;t like late arrivals 🥺</li>
                    <li>If you want to change anything from design please let us know in advance.</li>
                    <li>Always carry gluedots and avoid using tapes.</li>
                    <li>Please collect the payment before leaving the spot. In case of any payment-related issues, please reach out to us at the same time. <b>Do not leave the spot without taking payment from the spot</b></li>
                  </ol>
                  <p className="hora-vendor-notice-footer"><b>It&apos;s an important day for customers, we need to make it perfect ☺</b></p>
                </div>
              )}

              <div
                onClick={() => router.push("/hora-partner/partner-privacy-policy")}
                className="hora-vendor-privacy-link"
              >
                <ShieldIcon />
                <span style={{ marginLeft: "6px" }}>Privacy Policy</span>
              </div>
            </>
          )}

        </div>

        <style jsx>{`
          .hora-vendor-home-container {
            padding: 12px 16px 24px 16px;
            background-color: #fff;
            min-height: 100vh;
          }
          .hora-vendor-menu-wrapper {
            margin-top: 8px;
          }
          .hora-vendor-menu-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .hora-vendor-card-link {
            text-decoration: none;
          }
          .hora-vendor-card-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease-in-out;
          }
          .hora-vendor-card-item:active {
            transform: scale(0.98);
            background-color: #f1f5f9;
          }
          .hora-vendor-icon-container {
            position: relative;
            background: #f8fafc;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .hora-vendor-card-title {
            font-family: 'Roboto', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            line-height: 1.2;
          }
          .hora-vendor-notice-box {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 16px;
            color: #1e293b;
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            font-size: 13px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid #97538c;
            width: 100%;
            margin: 16px auto 0 auto;
            box-sizing: border-box;
          }
          .hora-vendor-notice-heading {
            font-size: 16px;
            margin-bottom: 8px;
            color: #7b346d;
          }
          .hora-vendor-notice-list {
            padding-left: 18px;
            margin: 0;
          }
          .hora-vendor-notice-list li {
            margin-bottom: 6px;
          }
          .hora-vendor-sublist {
            list-style-type: none;
            padding-left: 10px;
            margin-top: 4px;
          }
          .hora-vendor-notice-footer {
            margin-top: 12px;
            text-align: center;
            color: #7b346d;
          }
          .hora-vendor-privacy-link {
            display: flex;
            align-items: center;
            margin: 20px 0 10px 0;
            justify-content: center;
            color: #64748b;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          }
          .hora-vendor-privacy-link:hover {
            color: #0f172a;
          }

          /* --- SKELETON LOADER STYLES --- */
          .hora-vendor-skeleton-wrapper {
            margin-top: 8px;
          }
          .hora-vendor-skeleton-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .hora-vendor-skeleton-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .hora-vendor-skeleton-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background-color: #e2e8f0;
            flex-shrink: 0;
          }
          .hora-vendor-skeleton-text {
            height: 16px;
            width: 70%;
            border-radius: 6px;
            background-color: #e2e8f0;
          }
          .hora-vendor-skeleton-notice {
            height: 520px;
            width: 100%;
            border-radius: 12px;
            background-color: #e2e8f0;
            margin-top: 16px;
          }

          /* Shimmer Animation Effect */
          .hora-skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #f1f5f9 0%,
              #e2e8f0 50%,
              #f1f5f9 100%
            );
            background-size: 200% 100%;
            animation: horaShimmer 1.5s infinite ease-in-out;
          }

          @keyframes horaShimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </Layout>
    </>
  );
};

export default Home;