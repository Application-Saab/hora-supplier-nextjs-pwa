// import React, { useState } from 'react';
// import Layout from '../../component/Layout';
// import defaultImage from '../../assets/bell.png';
// import Image from "next/image";
// import { useRouter } from "next/router";
// import { BASE_URL, IMAGE_UPLOAD } from "../../apiconstant/apiconstant";

// const SuccessPage = () => {
//   const router = useRouter();
//   const [images, setImages] = useState({
//     FirstImage: null,
//     SecondImage: null,
//   });

//   const handleImageChange = (event, imageType) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageURL = URL.createObjectURL(file);
//       setImages((prevImages) => ({
//         ...prevImages,
//         [imageType]: { file, preview: imageURL },
//       }));
//     }
//   };

//   const handleImageUpload = async () => {
//     try {
//       const formData = new FormData();
//       console.log(formData, "formdata");
//       const token = localStorage.getItem("token");

//       Object.keys(images).forEach((key) => {
//         if (images[key] && images[key].file) {
//           formData.append(key, images[key].file);
//         }
//       });

//       for (let [key, value] of formData.entries()) {
//         if (value instanceof File) {
//           console.log(`${key}: ${value.name}`);
//         }
//       }

//       const response = await fetch(BASE_URL + IMAGE_UPLOAD, {
//         method: "POST",
//         body: formData,
//       });

//       console.log(formData,"ff");

//       console.log(response, "response");

//       if (response.ok) {
//         console.log("Images uploaded successfully!");
//         router.push("/images-upload");
//       } else {
//         console.log("Failed to upload images");
//       }
//     } catch (error) {
//       console.log("Image upload error", error);
//     }
//   };

//   const handleJobComplete = () => {
//     alert("Job completed!");
//     router.push("/home");
//   };

//   return (
//     <Layout>
//       <div style={styles.container}>
//         <h2 style={styles.title}>Take & Upload Pictures</h2>

//         <div style={styles.imageGrid}>
//           {Object.keys(images).map((key) => (
//             <div key={key} style={styles.imageContainer}>
//               <label htmlFor={key}>
//                 <Image
//                   src={images[key]?.preview || defaultImage}
//                   alt={`${key}`}
//                   width={100}
//                   height={100}
//                   style={styles.imagePreview}
//                 />
//                 <p style={styles.imageLabel}>{key.charAt(0).toUpperCase() + key.slice(1)} </p>
//               </label>
//               <input
//                 type="file"
//                 id={key}
//                 accept="image/*"
//                 onChange={(event) => handleImageChange(event, key)}
//                 style={{ display: 'none' }}
//               />
//             </div>
//           ))}
//         </div>

//         <button onClick={handleImageUpload} style={styles.button} className="startbutton">Image Upload</button>
//         <button onClick={handleJobComplete} style={styles.button} className="startbutton">Job Completed</button>
//       </div>
//     </Layout>
//   );
// };

// export default SuccessPage;

// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f7f7f7',
//     padding: '20px',
//   },
//   title: {
//     fontSize: '14px',
//     fontWeight: 'bold',
//     marginBottom: '10px',
//     color: '#333',
//     alignSelf: 'flex-start',
//   },
//   imageGrid: {
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gap: '20px',
//     width: '100%',
//     maxWidth: '400px',
//   },
//   imageContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     border: '1px dashed #ddd',
//     padding: '10px',
//     borderRadius: '8px',
//   },
//   imagePreview: {
//     borderRadius: '8px',
//     border: '2px solid #ddd',
//   },
//   imageLabel: {
//     marginTop: '10px',
//     fontSize: '14px',
//     color: '#555',
//   },
//   button: {
//     padding: '10px 20px',
//     fontSize: '18px',
//     fontWeight: 'bold',
//     backgroundColor: '#9498BF',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     transition: 'background-color 0.3s ease',
//     marginTop: '20px',
//   },
// };

import { useState } from "react";
import {BASE_URL, COMPLETE_ORDER} from '../../apiconstant/apiconstant';
import { useRouter } from "next/router";
 
export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { apiOrderId } = router.query;


  const supplierID = localStorage.getItem("supplierID");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleJobComplete = () => {
    const currDate = new Date().toLocaleDateString();
    const currTime = new Date().toLocaleTimeString();

    const currDateTime = currDate +"  " +currTime;
console.log(currDate,currTime, "currTimecurrDate");
    try {
      const token =  localStorage.getItem("token");

      const response =  fetch(BASE_URL + COMPLETE_ORDER, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Authorisation: token,
          _id: apiOrderId,
          userId: supplierID,
          job_end_time: currDateTime
        }),
      }); 

      console.log(response, "responsedata");
    //   router.push({
    //     pathname:`/job-complete`, 
    //   query: { apiOrderId },
    // });
    } catch (error) {
      console.log("acceptOrder error", error);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    // FormData to store file data
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Make the POST request to the Express API
      const response = await fetch("https://horaservices.com:3000/api/image_upload", {
        method: "POST",
        body: formData,
      });

      // Parse the JSON response
      const result = await response.json();
      console.log(result, "resultjson");

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.message || "File upload failed.");
      }
    } catch (error) {
      setMessage("An error occurred while uploading the file.");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    
      <button onClick={handleJobComplete} 
      className="startbutton">Job Completed</button>
    </div>
  );
}
