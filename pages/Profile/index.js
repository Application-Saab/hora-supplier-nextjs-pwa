import React, { useState } from 'react';
import axios from 'axios';
import Image from "next/image";
import Layout from '../../component/Layout';
import logo from '../../assets/new_logo_light.png.png'; 
// import BASE_URL from "../../apiconstant/apiconstant";
// import { useNavigate } from 'react-router-dom';


const BASE_URL="https://horaservices.com:3000";

function ProfileUpdate() {
  const [imageSrc, setImageSrc] = useState(logo); 
  const [imageFile, setImageFile] = useState(null); 
  const [experience, setExperience] = useState(""); 
  const [profile, setProfile] = useState("Decoration"); 

//   const navigate = useNavigate();
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file); 
      const imageUrl = URL.createObjectURL(file); 
      setImageSrc(imageUrl); 
    }
  };


  const handleSubmit = async () => {
    const requestData = {
      profile: profile
    };

    try {
      const token = await localStorage.getItem('token');
  
      const response = await axios.post(`${BASE_URL}/api/users/update_work_details`,
        JSON.stringify(requestData),
        {
          headers: {
            'Content-Type': 'application/json',
            'authorization': token
          },
        }
      );
  
      if (response.status === 200) {
        console.log('Data submitted successfully:', response.data);
        // Redirect to home page
        window.location.href = '/MyAcount'; // Or use window.location.replace('/home') for replacing the current history entry
      } else {
        console.error('Submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting data:', error.message);
    }
  };
  

// const handleSubmit = async () => {
    
//     const requestData = {
//       image: imageFile, 
//       experience: experience,
//       profile: profile
//     };
  
//     console.log(requestData, "requestData");
  
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

//       console.log(`${BASE_URL}/api/users/update_work_details` , "ffksdhfkjdshf");

//       console.log(response, "resdlkfds");
  
//       console.log(token, "second token bro");
//       console.log(response.data, "response data");
  
//       if (response.status === 200) {
//         console.log('Data submitted successfully:', response.data);
        
//       } else {
//         console.error('Submission failed:', response.statusText);
        
//       }
//     } catch (error) {
//       console.error('Error submitting data:', error.message);
      
//     }
//   };
  

  return (
    <Layout navTitle="My Account">
       <h1 style={{marginLeft: "50px"}}>Add Your Personal Details</h1>
      <div className="profile-container">
       
        <div className="profile-form">
          {/* <div className="profile-headerr">
            <div className="profile-image-section">
              <Image className="profile-image" src={imageSrc} alt="Profile" width={100} height={100} />
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <button className="update-button" onClick={() => document.getElementById('imageUpload').click()}>
                ADD
              </button>
            </div>
            <div className="completion-section">
              <span className="completion-status">0% InComplete</span>
            </div>
          </div> */}
          {/* <div className="input-section">
            <label htmlFor="experience">Experience (yrs)</label>
            <input
              type="number"
              id="experience"
              className="input-field"
              value={experience}
              onChange={(e) => setExperience(e.target.value)} 
            />
          </div> */}
          {/* <div className="dropdown-section">
            <label htmlFor="profile">City</label>
            <select
              id="profile"
              className="dropdown"
              value={profile}
              onChange={(e) => setProfile(e.target.value)} 
            >
              <option value="Delhii">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
            </select>
          </div> */}
          <div className="dropdown-section">
            <label htmlFor="profile">Select Your Profile</label>
            <select
              id="profile"
              className="dropdown"
              value={profile}
              onChange={(e) => setProfile(e.target.value)} 
            >
              <option value="Decoration">Decoration</option>
              <option value="Chef">Chef</option>
            </select>
          </div>
          <button className="update-profile-button" onClick={handleSubmit}>
            UPDATE
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default ProfileUpdate;