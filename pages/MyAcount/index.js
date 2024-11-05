// import React from "react";
// import Layout from "../../component/Layout";
// import { useRouter } from "next/router";

// const PersonalDetails = () => {
//   const router = useRouter();

//   const userName = localStorage.getItem("UserName");
//   const userAge = localStorage.getItem("UserAge");
//   const userCity = localStorage.getItem("UserCity");
//   const UserJobExperience = localStorage.getItem("UserJobExperience");
//   const UserJobProfile = localStorage.getItem("UserJobProfile");


//   const UpdateDetailFunction = () => {
//     router.push('./Profile');
//   }

//   return (
//     <Layout navTitle="Personal Details">
//       <h1 style={{ textAlign: "center", margin: "20px 0" }}>Personal Details</h1>
//       <div
//         style={{
//           padding: "20px",
//           maxWidth: "400px",
//           margin: "0 auto",
//           backgroundColor: "#f5f5f5",
//           borderRadius: "8px",
//           boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//         }}
//       >

// <div style={{ marginBottom: "20px" }}>
//           <label style={{ fontWeight: "bold", color: "#333" }}>UserJobExperience</label>
//           <div
//             style={{
//               padding: "10px",
//               backgroundColor: "white",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               marginTop: "5px",
//             }}
//           >
//             {UserJobExperience || "N/A"}
//           </div>
//         </div>


//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ fontWeight: "bold", color: "#333" }}>UserJobProfile</label>
//           <div
//             style={{
//               padding: "10px",
//               backgroundColor: "white",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               marginTop: "5px",
//             }}
//           >
//             {UserJobProfile || "N/A"}
//           </div>
//         </div>

//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ fontWeight: "bold", color: "#333" }}>Name</label>
//           <div
//             style={{
//               padding: "10px",
//               backgroundColor: "white",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               marginTop: "5px",
//             }}
//           >
//             {userName || "N/A"}
//           </div>
//         </div>
        
//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ fontWeight: "bold", color: "#333" }}>Age</label>
//           <div
//             style={{
//               padding: "10px",
//               backgroundColor: "white",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               marginTop: "5px",
//             }}
//           >
//             {userAge || "N/A"}
//           </div>
//         </div>

//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ fontWeight: "bold", color: "#333" }}>City</label>
//           <div
//             style={{
//               padding: "10px",
//               backgroundColor: "white",
//               border: "1px solid #ccc",
//               borderRadius: "5px",
//               marginTop: "5px",
//             }}
//           >
//             {userCity || "N/A"}
//           </div>
//         </div>

//         <button onClick={UpdateDetailFunction}  className="startbutton" style={{marginLeft: "40px"}}>Update Details</button>
//       </div>
//     </Layout>
//   );
// };

// export default PersonalDetails;

import React from "react";
import Layout from "../../component/Layout";
import { useRouter } from "next/router";
import { FaUser, FaBriefcase, FaCity, FaCalendarAlt, FaPen } from "react-icons/fa";
import bell from '../../assets/userprofile2.jpg';

import Image from "next/image";

const PersonalDetails = () => {
  const router = useRouter();

  const userName = localStorage.getItem("UserName");
  const userAge = localStorage.getItem("UserAge");
  const userCity = localStorage.getItem("UserCity");
  const userJobExperience = localStorage.getItem("UserJobExperience");
  const userJobProfile = localStorage.getItem("UserJobProfile");

  const UpdateDetailFunction = () => {
    router.push('./Profile');
  }

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
          <DetailItem icon={<FaBriefcase />} label="Job Experience" value={userJobExperience} />
          <DetailItem icon={<FaPen />} label="Job Profile" value={userJobProfile} />
          <DetailItem icon={<FaUser />} label="Name" value={userName} />
          <DetailItem icon={<FaCalendarAlt />} label="Age" value={userAge} />
          <DetailItem icon={<FaCity />} label="City" value={userCity} />
        </div>

        {/* Update Details Button */}
        <button
          onClick={UpdateDetailFunction}
          style={{
            marginTop: "20px",
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
    <div style={{ fontSize: "20px", color: "#FF5722", marginRight: "10px" }}>{icon}</div>
    <div>
      <label style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>{label}</label>
      <p style={{ margin: "5px 0", fontSize: "16px", color: "#555" }}>{value || "N/A"}</p>
    </div>
  </div>
);

export default PersonalDetails;
const styles = {
  title: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
        alignSelf: 'flex-start',
      }};