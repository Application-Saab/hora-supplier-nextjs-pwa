// pages/success.js
import React, { useState } from 'react';
import Layout from '../../component/Layout';
import defaultImage from '../../assets/bell.png';
import Image from "next/image";
import { useRouter } from "next/router";

const SuccessPage = () => {
    const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleJobComplete = () => {
    // Logic for job completion (e.g., save data or navigate elsewhere)
    alert("Job completed!");
    router.push("/home");
  };

  return (
    <Layout>
    <div style={styles.container}>
      <h2 style={styles.title}>Take & Upload Pictures</h2>
      {/* Image upload section */}
      <div style={styles.imageUploadContainer}>
        <label htmlFor="imageUpload">
          <Image
            src={selectedImage || defaultImage} // Replace with placeholder image path
            alt="Upload"
            style={styles.imagePreview}
            width={100}
            height={100}
          />
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Job Completed Button */}
      <button onClick={handleJobComplete} style={{backgroundColor: "#9498BF"}} className="startbutton" >Job Completed</button>
    </div>
    </Layout>
  );
};

export default SuccessPage;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
    textAlign: 'center',
  },
  imageUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  imagePreview: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid #ddd',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
