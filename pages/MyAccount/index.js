import React from "react";
import Layout from "../../component/Layout";
import { useRouter } from "next/router";
import {
  FaUser,
  FaBriefcase,
  FaCity,
  FaCalendarAlt,
  FaPen,
} from "react-icons/fa";
import bell from "../../assets/userprofile2.jpg";

import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
// import logo from '../assets/hora-logo-light.png';
// import backArr from '../assets/back_arrow1.png';
import Image from "next/image";

const PersonalDetails = () => {
  const router = useRouter();

  let supplierName;
  let supplierAge;
  let supplierCity;
  let supplierExperince;
  let supplierJobProfile;

  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    supplierName = localStorage.getItem("supplierName");
    supplierAge = localStorage.getItem("supplierAge");
    supplierCity = localStorage.getItem("supplierCity");
    supplierExperince = localStorage.getItem("supplierExperince");
    supplierJobProfile = localStorage.getItem("supplierJobProfile");
  }

  const UpdateDetailFunction = () => {
    router.push("./Profile");
  };


    const handleLogout = () => {
      localStorage.removeItem("token");
      router.push("/");
    };

  return (
    <Layout navTitle="Personal Details">
      {/* <h2 style={styles.title} style={{ textAlign: "center" }}>Manage Your Profile</h2> */}
      <div
        style={{
          padding: "20px",
          maxWidth: "400px",
          margin: "0 auto",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Avatar section */}
        <div style={{ marginBottom: "20px" }}>
          <Image
            src={bell}
            alt="User Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #FF5722",
            }}
          />
        </div>

        {/* Details section */}
        <div style={{ textAlign: "left" }}>
          <DetailItem
            icon={<FaBriefcase />}
            label="Job Experience"
            value={supplierExperince}
          />
          <DetailItem
            icon={<FaPen />}
            label="Job Profile"
            value={supplierJobProfile}
          />
          <DetailItem icon={<FaUser />} label="Name" value={supplierName} />
          <DetailItem
            icon={<FaCalendarAlt />}
            label="Age"
            value={supplierAge}
          />
          <DetailItem icon={<FaCity />} label="City" value={supplierCity} />
        </div>

       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
  {/* Update Details Button */}
  <button
    onClick={UpdateDetailFunction}
    style={{
      padding: "10px 20px",
      backgroundColor: "#FF5722",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Edit Details
  </button>

  {/* Right Side: Logout Icon */}
  <button
    style={{
      padding: "10px 20px",
      backgroundColor: "#FF5722",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
    onClick={handleLogout}
  >
    Logout
  </button>
</div>

      </div>
    </Layout>
  );
};

// Reusable component for each detail item
const DetailItem = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "15px",
      padding: "10px",
      backgroundColor: "white",
      borderRadius: "5px",
      border: "1px solid #ccc",
    }}
  >
    <div style={{ fontSize: "20px", color: "#FF5722", marginRight: "10px" }}>
      {icon}
    </div>
    <div>
      <label style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>
        {label}
      </label>
      <p style={{ margin: "5px 0", fontSize: "16px", color: "#555" }}>
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export default PersonalDetails;
const styles = {
  title: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
    alignSelf: "flex-start",
  },
};
