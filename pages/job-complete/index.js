"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Layout from "../../component/Layout";
import CameraFrame from "../../assets/camera_frame.png";
import { BASE_URL, COMPLETE_ORDER } from "../../apiconstant/apiconstant";
import { useRouter } from "next/router";

const PictureUpload = () => {
  const [images, setImages] = useState({
    slab: null,
  });

  const router = useRouter();
  const { apiOrderId } = router.query;
  let supplierID;

  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    supplierID = localStorage.getItem("supplierID");
  }

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedNames, setUploadedNames] = useState([]);

  const whenPicturePicked = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formThing = new FormData();
    for (let i = 0; i < files.length; i++) {
      formThing.append("files", files[i]);
    }

    try {
      setUploading(true);
      const response = await fetch(
        "https://horaservices.com:3000/api/multiple_image_upload",
        {
          method: "POST",
          body: formThing,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Upload successful:", result);

        // Save uploaded file names from response.data
        setUploadedNames(result?.data || []);

        alert("Images uploaded successfully!");
      } else {
        console.error("❌ Upload failed");
        alert("Upload failed. Try again!");
      }
    } catch (error) {
      console.error("⚠️ Error uploading:", error);
    } finally {
      setUploading(false);
    }
  };

  // Step 2: Send uploaded names with order edit API
  const uploadAllImages = async () => {
    if (uploadedNames.length === 0) {
      alert("Please upload images first!");
      return;
    }

    try {
      setUploading(true);
      const response = await fetch(
        "https://horaservices.com:3000/api/order/edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: apiOrderId,
            userOrderDishImageArray: uploadedNames,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Order updated with images!");
        setUploadSuccess(true);
      } else {
        console.error("❌ Failed to update order");
        alert("Order update failed!");
      }
    } catch (error) {
      console.error("⚠️ Error updating order:", error);
    } finally {
      setUploading(false);
    }
  };

  // const handleImageChange = (event, type) => {
  //   const files = event.target.files;
  //   if (files.length > 0) {
  //     setImages(prev => ({ ...prev, [type]: files[0] }));
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

  //   try {
  //     const response = await fetch("https://horaservices.com:3000/api/image_upload1", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to upload image");
  //     }

  //     const data = await response.json();
  //     console.log(data, "data");
  //     alert("Successfully uploaded the image!");
  //     setUploadSuccess(true);
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     alert("Error uploading image: " + error.message);
  //     setUploadSuccess(false);
  //   }
  // };

  const [supplierJobType, setSupplierJobType] = useState(null);

  useEffect(() => {
    const jobType = localStorage.getItem("supplierJobType");
    setSupplierJobType(Number(jobType)); // Convert to number for comparison
  }, []);

  const handleJobComplete = () => {
    const currDate = new Date().toLocaleDateString();
    const currTime = new Date().toLocaleTimeString();

    const currDateTime = currDate + "  " + currTime;
    try {
      const token = localStorage.getItem("token");

      const response = fetch(BASE_URL + COMPLETE_ORDER, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Authorisation: token,
          _id: apiOrderId,
          userId: supplierID,
          job_end_time: currDateTime,
        }),
      });

      alert("Job Completed");
      router.push("/home");
    } catch (error) {
      console.log("acceptOrder error", error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        {supplierJobType === 8 ? (
          <button
            onClick={handleJobComplete}
            className="startbutton"
            style={{ marginLeft: "40px" }}
          >
            Job Completed
          </button>
        ) : (
          <>
            <h2 style={{ fontWeight: "bold" }}>Take & Upload Pictures</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {[{ label: "Picture", type: "slab" }].map((item) => (
                <div
                  key={item.type}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>{item.label}</label>
                  {/* <div style={{
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
                    <Image
                      src={CameraFrame}
                      alt="Camera Frame"
                      style={{ maxWidth: "30%", maxHeight: "30%" }}
                      width={100}
                  height={100}
                    />
                  )}
                </div> */}
                </div>
              ))}
            </div>
            {/* <button onClick={uploadAllImages} className="startbutton" style={{ marginLeft: "40px", marginTop: "20px" }}>
            Upload All Images
          </button> */}

            <div>
              {/* Image Picker (auto uploads when selected) */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={whenPicturePicked}
              />

              {/* Optional Button (if you still want manual upload later) */}
              <button
                disabled={uploading}
                onClick={uploadAllImages}
                style={{ marginLeft: "40px", marginTop: "20px" }}
              >
                {uploading ? "Uploading..." : "Upload All Images"}
              </button>
            </div>

            {uploadSuccess && (
              <button
                onClick={handleJobComplete}
                className="startbutton"
                style={{ marginLeft: "40px" }}
              >
                Job Completed
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PictureUpload;
const styles = {
  title: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
    alignSelf: "flex-start",
  },
};
