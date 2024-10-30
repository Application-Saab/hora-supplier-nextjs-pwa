import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from "next/image";
import Layout from '../../component/Layout';
import {
  BASE_URL,
  SUPPLIER_WORK_UPDATE,
  SUPPLIER_UPDATE_PERSONAL_DETAILS,
  UPDATE_RESUME_PROFILE 
} from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";

const ProfileUpdate = () => {
  const [jobType, setJobType] = useState('');
  const router = useRouter();
  const [jobProfile, setJobProfile] = useState('');
  const [jobExperince , setJobExperince] = useState('');
  const [error, setError] = useState(null);
  const [errorProfessional , setErrorProfessional] = useState(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    city: '',
    age: '',
    experience: ''
  });

  const UpdateResumeDetails = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = BASE_URL + UPDATE_RESUME_PROFILE;

      const requestData =  {
        "resume":"",
        "experience":jobExperince,
        "job_profile":jobProfile
    }

      console.log(requestData, "requestData");

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      console.log(response.data, "response data");

      if (response.status === 200) {
         setShowAdditionalFields(true);
        alert('Details updated successfully. Please fill the below details');
       // setShowAdditionalFields(true); // Show additional fields
      } else {
        console.error('Submission failed:', response.status);
      }
    } catch (error) {
      console.error('Error submitting data:', error.message);
      setError(error.message);
    }
  };


  // const userRestaurant = [{ name: "Planet of the Crepes", profile: "Bartender" }];

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   try {
  //     const token = localStorage.getItem('token');
  //     const url = BASE_URL + SUPPLIER_WORK_UPDATE;

  //     const requestData = {
  //       job_type: jobType,
  //       userRestaurant: userRestaurant
  //     };

  //     console.log(requestData, "requestData");

  //     const response = await axios.post(url, requestData, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         'Authorization': token
  //       },
  //     });

  //     console.log(response.data, "response data");

  //     if (response.status === 200) {
  //       console.log('Data submitted successfully:', response.data);
  //       setShowAdditionalFields(true); // Show additional fields
  //     } else {
  //       console.error('Submission failed:', response.status);
  //     }
  //   } catch (error) {
  //     console.error('Error submitting data:', error.message);
  //     setError(error.message);
  //   }
  // };

  useEffect(() => {
    console.log(userDetails.name); // Logs the updated name value to the console each time it changes
  }, [userDetails.name]);

  const handleAdditionalSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = BASE_URL + SUPPLIER_UPDATE_PERSONAL_DETAILS; // Define your endpoint

      console.log(url, "urlofcode");

      // const requestData = {
      //   age: userDetails.age,
      //   city: userDetails.city,
      //   experience: userDetails.experience,
      //   name: userDetails.name,
      //   vechicle_type: "", // Add other fields as necessary
      //   aadhar_no: "", // Placeholder, you can modify as needed
      //   aadhar_front_img: "",
      //   aadhar_back_img: "",
      //   avatar: "",
      //   userServedLocalities: [] // Modify this as necessary
      // };


      const requestData = {
        "age": userDetails.age,
        "vechicle_type": "Two wheeler",
        "city": userDetails.city,
        "aadhar_no": "26353476353",
        "aadhar_front_img": "attachment-1678985056105.jpg",
        "aadhar_back_img": "attachment-1678985062522.jpg",
        "experience": "20",
        "avatar": "attachment-1678985070996.jpg",
        "name": userDetails.name,
        "userServedLocalities": [
            "646c7995b8ca968c0921d1e0",
            "646c7b08f35e6a415d41bbc9"
        ]
    }
      console.log(requestData, "additionalRequestData");

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      console.log(response, "responsedatas");

      console.log(response.data, "additional response data");

      if (response.status === 200) {
        router.push("/home");
      } else {
        router.push("/home");
        //console.error('Additional submission failed:', response.status);
      }
    } catch (error) {
      router.push("/home");
      console.error('Error submitting additional data:', error.message);
      setErrorProfessional(error.message);
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
      <div className="profile-container" style={{ backgroundColor:"rgba(237, 237, 237, 0.79)"}}>
        <div className="profile-form">
        {!showAdditionalFields && (
          <div style={{ width:"100%" , marginBottom:20 , backgroundColor:"rgb(255, 255, 255)" , boxShadow:"rgba(0, 0, 0, 0.18) 0px 1px 8px" , padding:"20px" , borderRadius:"20px"}}>
          <h4 style={{ color:"#97538c" , fontSize:"16px" , marginBottom:"10px"}}>Enter Professional Details </h4>
          <form onSubmit={UpdateResumeDetails} style={{ width: "100%" }}>
            <div className='input-type'>
          <label htmlFor="name">Experience:</label>
                <input 
                  type="text" 
                  id="name" 
                  value={jobExperince} 
                  onChange={(e) => setJobExperince(e.target.value)} 
                  required
                />
              </div>
            <div>
              <label htmlFor="jobProfile">Select Job Profile:</label>
              <select 
                id="jobProfile" 
                value={jobProfile} 
                onChange={(e) => setJobProfile(e.target.value)} 
                required
              >
                <option value="">Select Job Profile</option>
                <option value="Chef">Chef</option>
                <option value="Decorator">Decorator</option>
              </select>
            </div>
            <button type="submit" className='button-primary'>Continue</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
          </div>
        )}

          {showAdditionalFields && (
            <div style={{ width:"100%" , marginBottom:20 , backgroundColor:"rgb(255, 255, 255)" , boxShadow:"rgba(0, 0, 0, 0.18) 0px 1px 8px" , padding:"20px" , borderRadius:"20px"}}>
              <h3 style={{ color:"#97538c" , fontSize:"16px" , marginBottom:"10px" }}>Enter Professional Details</h3>
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
              <button type="submit" className='button-primary'>Submit</button>
              {errorProfessional && <p style={{ color: 'red' }}>{errorProfessional}</p>}
            </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ProfileUpdate;