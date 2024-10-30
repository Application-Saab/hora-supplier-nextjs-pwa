import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../component/Layout';
import {
  BASE_URL,
  SUPPLIER_UPDATE_PERSONAL_DETAILS,
  UPDATE_RESUME_PROFILE 
} from "../../apiconstant/apiconstant";

const ProfileUpdate = () => {
  const [jobType, setJobType] = useState('');
  const router = useRouter();
  const [jobProfile, setJobProfile] = useState('');
  const [jobExperince, setJobExperince] = useState('');
  const [error, setError] = useState(null);
  const [errorProfessional, setErrorProfessional] = useState(null);
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

      const requestData = {
        "resume": "",
        "experience": jobExperince,
        "job_profile": jobProfile
      };

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      if (response.status === 200) {
        alert('Details updated successfully. Please fill the below details');
        setShowAdditionalFields(true); // Show additional fields and hide main form
      } else {
        console.error('Submission failed:', response.status);
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
      const url = SUPPLIER_UPDATE_PERSONAL_DETAILS;

      const requestData = {
        "age": "29",
        "vechicle_type": "Two wheeler",
        "city": "Jaipur",
        "aadhar_no": "26353476353",
        "aadhar_front_img": "attachment-1678985056105.jpg",
        "aadhar_back_img": "attachment-1678985062522.jpg",
        "experience": "20",
        "avatar": "attachment-1678985070996.jpg",
        "name": "Rahul",
        "userServedLocalities": [
          "646c7995b8ca968c0921d1e0",
          "646c7b08f35e6a415d41bbc9"
        ]
      };

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
      });

      if (response.status === 200) {
        router.push("/home");
      } else {
        router.push("/home");
      }
    } catch (error) {
      router.push("/home");
      console.error('Error submitting additional data:', error.message);
      setErrorProfessional(error.message);
    }
  };

  return (
    <Layout>
      <div className="profile-container" style={{ backgroundColor: "rgba(237, 237, 237, 0.79)" }}>
        <div className="profile-form">

          {/* Additional Fields Section */}
          {showAdditionalFields && (
            <div style={{ width: "100%", marginBottom: 20, backgroundColor: "rgb(255, 255, 255)", boxShadow: "rgba(0, 0, 0, 0.18) 0px 1px 8px", padding: "20px", borderRadius: "20px" }}>
              <h3 style={{ color: "#97538c", fontSize: "16px", marginBottom: "10px" }}>Enter Professional Details</h3>
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

          {/* Main Form Section */}
          {!showAdditionalFields && (
            <div style={{ width: "100%", marginBottom: 20, backgroundColor: "rgb(255, 255, 255)", boxShadow: "rgba(0, 0, 0, 0.18) 0px 1px 8px", padding: "20px", borderRadius: "20px" }}>
              <h4 style={{ color: "#97538c", fontSize: "16px", marginBottom: "10px" }}>Enter Professional Details</h4>
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

        </div>
      </div>
    </Layout>
  );
}

export default ProfileUpdate;
