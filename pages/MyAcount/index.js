// import React, { useState } from 'react';
// import axios from 'axios';
// import Image from "next/image";
// import Layout from '../../component/Layout';
// import logo from '../../assets/new_logo_light.png.png';
// // import BASE_URL from "../../apiconstant/apiconstant";
// // import { useNavigate } from 'react-router-dom';

// const BASE_URL="https://horaservices.com:3000";

// function ProfileUpdate() {
//   const [imageSrc, setImageSrc] = useState(logo);
//   const [imageFile, setImageFile] = useState(null);
//   const [experience, setExperience] = useState("");
//   const [profile, setProfile] = useState("Decoration");

// //   const navigate = useNavigate();

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImageFile(file);
//       const imageUrl = URL.createObjectURL(file);
//       setImageSrc(imageUrl);
//     }
//   };

//   const handleSubmit = async () => {
//     const requestData = {
//       image: imageFile,
//       experience: experience,
//       profile: profile
//     };

//     try {
//       const token = await localStorage.getItem('token');

//       const response = await axios.post(`${BASE_URL}/api/users/update_work_details`,
//         JSON.stringify(requestData),
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'authorization': token
//           },
//         }
//       );

//       if (response.status === 200) {
//         console.log('Data submitted successfully:', response.data);
//         // Redirect to home page
//         window.location.href = '/home'; // Or use window.location.replace('/home') for replacing the current history entry
//       } else {
//         console.error('Submission failed:', response.statusText);
//       }
//     } catch (error) {
//       console.error('Error submitting data:', error.message);
//     }
//   };

//   return (
//     <Layout navTitle="My Account">
//        <h1 style={{marginLeft: "50px"}}>Add Your Details</h1>
//       <div className="profile-container">

//         <div className="profile-form">
//           <div className="dropdown-section">
//             <label htmlFor="profile">City</label>
//             <select
//               id="profile"
//               className="dropdown"
//               value={profile}
//               onChange={(e) => setProfile(e.target.value)}
//             >
//               <option value="Delhii">Delhi</option>
//               <option value="Bangalore">Bangalore</option>
//               <option value="Pune">Pune</option>
//             </select>
//           </div>
//           <div className="dropdown-section">
//             <label htmlFor="profile">Profile</label>
//             <select
//               id="profile"
//               className="dropdown"
//               value={profile}
//               onChange={(e) => setProfile(e.target.value)}
//             >
//               <option value="Decoration">Decoration</option>
//               <option value="Chef">Chef</option>
//             </select>
//           </div>
//           <button className="update-profile-button" onClick={handleSubmit}>
//             UPDATE
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ProfileUpdate;

import React, { useState } from "react";
import axios from "axios";

import Image from "next/image";

import trackingLogo from "../../assets/tracking_icon.png";
import Layout from "../../component/Layout";
import { BASE_URL, SUPPLIER_DETAILS} from '../../apiconstant/apiconstant';
// const BASE_URL="https://horaservices.com:3000";

const PersonalDetails = () => {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        city: "",
      });
      const [imageFile, setImageFile] = useState(null); // Store the image file
    
    //   const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     setImageFile(file);
    //   };
    
      const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
  

  // Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.name);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("city", formData.city);

    if (imageFile) {
      formDataToSend.append("profileImage", imageFile);
    }

    formDataToSend.forEach((value, key) => {
        console.log(key, value);
      });

    try {

      
      const url = BASE_URL + SUPPLIER_DETAILS;

      console.log(url, "url");

      const token = await localStorage.getItem('token');
      console.log(token, "token12");
      const response = await axios.post(url, JSON.stringify(formDataToSend), {
        headers: {
            'Content-Type': 'multipart/form-data', 
            'authorization': token,
        },
      });

      console.log(response, "responset");

      if (response.status === 200) {
        console.log('Data submitted successfully:', response.data);
        // Redirect to home page
        window.location.href = '/home'; // Or use window.location.replace('/home') for replacing the current history entry
      }

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);
//   const [imageFile, setImageFile] = useState(null); 

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); 
      setImageFile(file);
    }
  };

  return (
    <Layout navTitle="Personal Details">
        
      <h1 style={{marginLeft: "60px"}}>Personal Details</h1>
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <Image
            src={trackingLogo}
            alt="User"
            style={{ borderRadius: "50%", marginBottom: "10px" }}
            width={100}
            height={100}
          />
          <button
            type="button"
            style={{
              display: "block",
              margin: "0 auto",
              backgroundColor: "#FF5722",
              color: "white",
              borderRadius: "5px",
              padding: "5px 15px",
              border: "none",
            }}
          >
            Take Selfie
          </button>
        </div>
        
        */}



<div style={{ textAlign: "center", marginBottom: "15px" }}>
      {/* Image Preview */}
      <Image
        src={selectedImage ? selectedImage : trackingLogo} // Use selected image if available
        alt="User"
        style={{ borderRadius: "50%", marginBottom: "10px" }}
        width={100}
        height={100}
      />

      {/* Hidden File Input for Upload */}
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        style={{ display: "none" }} // Hide the input field
        onChange={handleImageChange}
      />

      {/* Button to trigger the hidden file input */}
      <button
        type="button"
        onClick={() => document.getElementById("imageUpload").click()}
        style={{
          display: "block",
          margin: "0 auto",
          backgroundColor: "#FF5722",
          color: "white",
          borderRadius: "5px",
          padding: "5px 15px",
          border: "none",
        }}
      >
        Add Photo
      </button>
    </div>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div>
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Age"
              style={{
                padding: "10px",
                width: "320px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* <div>
            <label>Vehicle</label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Cycle">Cycle</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
            </select>
          </div> */}
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>

        {/* <div>
          <label>Aadhar Card</label>
          <input
            type="text"
            name="aadharCard"
            value={formData.aadharCard}
            onChange={handleInputChange}
            placeholder="Aadhar Card"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div> */}

        {/* <div>
          <label>Aadhar Image</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <div>
              <label>Upload Front Image</label>
              <input
                type="file"
                name="frontImage"
                onChange={handleImageChange}
                style={{ display: "block", marginBottom: "10px" }}
              />
            </div>
            <div>
              <label>Upload Back Image</label>
              <input
                type="file"
                name="backImage"
                onChange={handleImageChange}
                style={{ display: "block", marginBottom: "10px" }}
              />
            </div>
          </div>
        </div> */}

        <button
          type="submit"
          style={{
            backgroundColor: "#FF5722",
            color: "white",
            borderRadius: "5px",
            padding: "10px 20px",
            border: "none",
            width: "100%",
          }}
        >
          Submit
        </button>
      </form>
    </div>
    </Layout>
  );
};

export default PersonalDetails;
