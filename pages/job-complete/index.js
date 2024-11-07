import Image from "next/image";
import React, { useState } from 'react';
import Layout from "../../component/Layout";
import CameraFrame from "../../assets/camera_frame.png";
import {BASE_URL, COMPLETE_ORDER} from '../../apiconstant/apiconstant';
import { useRouter } from "next/router";

const PictureUpload = () => {
  

  const [images, setImages] = useState({
    slab: null,
    sink: null,
    gasBurner: null,
    kitchen: null,
    floor: null,
    family: null,
  });

  const router = useRouter();
  const { apiOrderId } = router.query;
  let supplierID;

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    supplierID = localStorage.getItem("supplierID");
  }	

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleImageChange = (event, type) => {
    const files = event.target.files;
    if (files.length > 0) {
      setImages(prev => ({ ...prev, [type]: files[0] })); 
    }
  };

  // const uploadAllImages = async () => {
  //   const allImagesUploaded = Object.keys(images).every(type => images[type] !== null);

  //   if (!allImagesUploaded) {
  //     alert("Please upload all images before submitting."); 
  //     return; 
  //   }

  //   const formData = new FormData();
  //   Object.keys(images).forEach(type => {
  //     if (images[type]) {
  //       formData.append(type, images[type]);
  //     }
  //   });

  //   try {
  //     const response = await fetch("https://horaservices.com:3000/api/image_upload", {
  //       method: "POST",
  //       file: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to upload images");
  //     }

  //     const data = await response.json();
  //     console.log("Successfully uploaded all pictures", data);
  //     alert("Successfully uploaded all images!");
  //     setUploadSuccess(true); 
  //   } catch (error) {
  //     console.error("Error uploading images:", error);
  //     alert("Error uploading images: " + error.message);
  //     setUploadSuccess(false); 
  //   }
  // };


  // const uploadAllImages = async () => {
  //   const firstImageType = Object.keys(images).find(type => images[type] !== null);
    
  //   if (!firstImageType) {
  //     alert("Please upload at least one image before submitting."); 
  //     return; 
  //   }
  
  //   const formData = new FormData();
  
  //   const imageToUpload = images[firstImageType];
  //   if (imageToUpload) {
  //     formData.append("file", imageToUpload); 
  //   }
  
  //   console.log("FormData being sent:", formData);
  //   console.log("Image to upload:", imageToUpload);
  //   console.log("Image type being uploaded:", firstImageType);
  
  //   try {
  //     const response = await fetch("https://horaservices.com:3000/api/image_upload", {
  //       method: "POST",
  //       body: formData, 
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to upload image");
  //     }
  
  //     const data = await response.json();
  //     console.log("Successfully uploaded the image:", data);
  //     alert("Successfully uploaded the image!");
  //     setUploadSuccess(true); 
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     alert("Error uploading image: " + error.message);
  //     setUploadSuccess(false); 
  //   }
  // };


  const uploadAllImages = async () => {
    const allImagesUploaded = Object.keys(images).every(type => images[type] !== null);
  
    if (!allImagesUploaded) {
      alert("Please upload all images before submitting."); 
      return; 
    }
  
    const imageNamesArray = [];
  
    Object.keys(images).forEach(type => {
      const imageToUpload = images[type];
      if (imageToUpload) {
        imageNamesArray.push(imageToUpload.name); 
        console.log(`Preparing to upload ${type}:`, imageToUpload.name);
      } else {
        console.log(`No image uploaded for ${type}`);
      }
    });
  
    console.log("Image names array to be uploaded:", imageNamesArray);
  
    const dataToSend = {
      file: imageNamesArray, 
    };
  
    try {
      const response = await fetch("https://horaservices.com:3000/api/image_upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), 
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
  
      const data = await response.json();
      console.log("Successfully uploaded all image names:", data);
      alert("Successfully uploaded all image names!");
      setUploadSuccess(true); 
    } catch (error) {
      console.error("Error uploading image names:", error);
      alert("Error uploading image names: " + error.message);
      setUploadSuccess(false); 
    }
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
    } catch (error) {
      console.log("acceptOrder error", error);
    }
  }

  return (
    <Layout>
    <div style={{ padding: "20px" }}>
    <h2 style={styles.title}>Take & Upload Pictures</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {[
          { label: "Picture", type: "slab" },
          { label: "Picture", type: "sink" },
          { label: "Picture", type: "gasBurner" },
          { label: "Picture", type: "kitchen" },
          { label: "Picture", type: "floor" },
          { label: "Picture", type: "family" }
        ].map((item) => (
          <div
            key={item.type}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <label style={styles.title}>{item.label}</label>
            <div style={{
              border: "1px dashed gray",
              width: "150px",
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
            }}>
              <input
                type="file"
                id={item.type}
                accept="image/*"
                onChange={(event) => handleImageChange(event, item.type)}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
              {images[item.type] ? (
                <Image
                  src={URL.createObjectURL(images[item.type])}
                  alt={`${item.label}`}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  width={100}
                  height={100}
                />
              ) : (
                // <span style={{ color: "gray" }}>📷</span>
                <Image
                  src={CameraFrame}
                  style={{ maxWidth: "30%", maxHeight: "30%" }}
                  width={100}
                  height={100}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={uploadAllImages} className="startbutton" style={{marginLeft: "40px", marginTop: "20px"}}>
        Upload All Images
      </button>

      <div>
      {uploadSuccess && (
        <button onClick={handleJobComplete} className="startbutton" style={{marginLeft: "40px"}}>
          Job Completed
                  </button>
      )}
      </div>
    </div>
    </Layout>
  );
};

export default PictureUpload;




// working second
// import { useState } from "react";
// import {BASE_URL, COMPLETE_ORDER} from '../../apiconstant/apiconstant';
// import { useRouter } from "next/router";
 
// export default function UploadForm() {
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState("");
//   const router = useRouter();
//   const { apiOrderId } = router.query;


//   const supplierID = localStorage.getItem("supplierID");

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const handleJobComplete = () => {
//     const currDate = new Date().toLocaleDateString();
//     const currTime = new Date().toLocaleTimeString();

//     const currDateTime = currDate +"  " +currTime;
// console.log(currDate,currTime, "currTimecurrDate");
//     try {
//       const token =  localStorage.getItem("token");

//       const response =  fetch(BASE_URL + COMPLETE_ORDER, {
//         method: "POST",
//         headers: {
//           Accept: "application/json, text/plain, /",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           // Authorisation: token,
//           _id: apiOrderId,
//           userId: supplierID,
//           job_end_time: currDateTime
//         }),
//       }); 

//       console.log(response, "responsedata");
//     //   router.push({
//     //     pathname:`/job-complete`, 
//     //   query: { apiOrderId },
//     // });
//     } catch (error) {
//       console.log("acceptOrder error", error);
//     }
//   }

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!file) {
//       setMessage("Please select a file to upload.");
//       return;
//     }

//     // FormData to store file data
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       // Make the POST request to the Express API
//       const response = await fetch("https://horaservices.com:3000/api/image_upload", {
//         method: "POST",
//         body: formData,
//       });

//       // Parse the JSON response
//       const result = await response.json();
//       console.log(result, "resultjson");

//       if (response.ok) {
//         setMessage(result.message);
//       } else {
//         setMessage(result.message || "File upload failed.");
//       }
//     } catch (error) {
//       setMessage("An error occurred while uploading the file.");
//       console.error(error);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input type="file" onChange={handleFileChange} />
//         <button type="submit">Upload</button>
//       </form>
//       {message && <p>{message}</p>}
    
//       <button onClick={handleJobComplete} 
//       className="startbutton">Job Completed</button>
//     </div>
//   );
// }
const styles = {
  title: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
        alignSelf: 'flex-start',
      }};