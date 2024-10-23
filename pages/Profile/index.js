// // pages/dashboard.js
// import React from 'react';
// import Layout from '../../component/Layout';

// const Dashboard = () => {
//   return (
//     <Layout>
//     <div>
//       <h1>Dashboard</h1>
//       <p>Welcome to your profile!</p>
//     </div>
//     </Layout>
//   );
// };

// export default Dashboard;




import React, { useState } from 'react';
import Layout from '../../component/Layout';

const ProfileUpdate = () => {
  const [experience, setExperience] = useState('');
  const [profile, setProfile] = useState('Chef');

  const handleUpdate = () => {
    // Add update logic here
    console.log('Profile updated');
  };

  return (
    <Layout>
    <div className="profile-container">
      {/* Profile Picture and Status */}
      <div className="profile-picture-section">
        <div className="profile-picture"></div>
        <button className="update-button">Update</button>
        <span className="status-badge">0% InComplete</span>
      </div>

      {/* Experience Input */}
      <div className="input-section">
        <label>Experience (yrs)</label>
        <input 
          type="number" 
          value={experience} 
          onChange={(e) => setExperience(e.target.value)} 
          placeholder="Enter years of experience" 
        />
      </div>

      {/* Profile Dropdown */}
      <div className="input-section">
        <label>Profile</label>
        <select 
          value={profile} 
          onChange={(e) => setProfile(e.target.value)}>
          <option value="Chef">Chef</option>
          <option value="Manager">Manager</option>
          <option value="Waiter">Waiter</option>
        </select>
      </div>

      {/* Update Button */}
      <button className="update-action-button" onClick={handleUpdate}>UPDATE</button>
    </div>
    </Layout>
  );
};

export default ProfileUpdate;
