import React, { useState } from 'react';
import axios from 'axios';
import Image from "next/image";
import Layout from '../../component/Layout';
import {
  BASE_URL,
  SUPPLIER_WORK_UPDATE,
  SUPPLIER_UPDATE_PERSONAL_DETAILS// Define this constant for your second API
} from "../../apiconstant/apiconstant";


const ProfileUpdate = () => {
  const [jobType, setJobType] = useState('');
  const [error, setError] = useState(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    city: '',
    age: '',
    experience: ''
  });

  const userRestaurant = [{ name: "Planet of the Crepes", profile: "Bartender" }];

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = BASE_URL + SUPPLIER_WORK_UPDATE;

      const requestData = {
        job_type: jobType,
        userRestaurant: userRestaurant
      };

      console.log(requestData, "requestData");

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      console.log(response.data, "response data");

      if (response.status === 200) {
        console.log('Data submitted successfully:', response.data);
        setShowAdditionalFields(true); // Show additional fields
      } else {
        console.error('Submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting data:', error.message);
      setError(error.message);
    }
  };

  const handleAdditionalSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url =  SUPPLIER_UPDATE_PERSONAL_DETAILS; // Define your endpoint

      const requestData = {
        age: userDetails.age,
        city: userDetails.city,
        experience: userDetails.experience,
        name: userDetails.name,
        vechicle_type: "Two wheeler", // Add other fields as necessary
        aadhar_no: "26353476353", // Placeholder, you can modify as needed
        aadhar_front_img: "attachment-1678985056105.jpg",
        aadhar_back_img: "attachment-1678985062522.jpg",
        avatar: "attachment-1678985070996.jpg",
        userServedLocalities: [] // Modify this as necessary
      };

      console.log(requestData, "additionalRequestData");

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      console.log(response.data, "additional response data");

      if (response.status === 200) {
        console.log('Additional data submitted successfully:', response.data);
      } else {
        console.error('Additional submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting additional data:', error.message);
      setError(error.message);
    }
  };


  // const handleSubmit = async () => {
  //   const requestData = {
  //     profile: profile
  //   };

  //   try {
  //     const token = await localStorage.getItem('token');
  
  //     const response = await axios.post(`${BASE_URL}/api/users/update_work_details`,
  //       JSON.stringify(requestData),
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'authorization': token
  //         },
  //       }
  //     );
  
  //     if (response.status === 200) {
  //       console.log('Data submitted successfully:', response.data);
  //       // Redirect to home page
  //       window.location.href = '/MyAcount'; // Or use window.location.replace('/home') for replacing the current history entry
  //     } else {
  //       console.error('Submission failed:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error submitting data:', error.message);
  //   }
  // };
  

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
    <Layout>
      <div className="profile-container">
        <div className="profile-form">
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div>
              <label htmlFor="jobType">Job Type:</label>
              <select 
                id="jobType" 
                value={jobType} 
                onChange={(e) => setJobType(e.target.value)} 
                required
              >
                <option value="">Select Job Type</option>
                <option value="2">Chef</option>
                <option value="1">Decorator</option>
              </select>
            </div>
            <button type="submit">Submit</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>

          {showAdditionalFields && (
            <form onSubmit={handleAdditionalSubmit} style={{ marginTop: "20px" }}>
              <div>
                <label htmlFor="name">Name:</label>
                <input 
                  type="text" 
                  id="name" 
                  value={userDetails.name} 
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label htmlFor="city">City:</label>
                <input 
                  type="text" 
                  id="city" 
                  value={userDetails.city} 
                  onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label htmlFor="age">Age:</label>
                <input 
                  type="number" 
                  id="age" 
                  value={userDetails.age} 
                  onChange={(e) => setUserDetails({ ...userDetails, age: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label htmlFor="experience">Experience:</label>
                <input 
                  type="text" 
                  id="experience" 
                  value={userDetails.experience} 
                  onChange={(e) => setUserDetails({ ...userDetails, experience: e.target.value })} 
                  required
                />
              </div>
              <button type="submit">Submit Additional Info</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ProfileUpdate;