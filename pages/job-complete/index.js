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

  const whenPicturePicked = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setImages((prev) => {
        const currentImages = Array.isArray(prev) ? prev : [];
        return [...currentImages, ...files];
      });
    }
    if (!files || files.length === 0) return;

    const formThing = new FormData();
    for (let i = 0; i < files.length; i++) {
      formThing.append("files", files[i]);
    }

    try {
      setUploading(true);
      const response = await fetch(
        "https://horaservices.com/api/multiple_image_upload",
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

  const removeImage = (key) => {
    setImages((prev) => ({
      ...prev,
      [key]: null
    }));
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
        "https://horaservices.com/api/order/edit",
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
        alert("Images uploaded successfully!");
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
  //     const response = await fetch("https://horaservices.com/api/image_upload1", {
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
              <h2 style={{ fontWeight: "700", fontSize: "1.5rem", marginBottom: "20px", color: "#333" }}>
                Take & Upload Pictures
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "500px", margin: "0 auto" }}>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "30px 20px",
                  backgroundColor: "#f8fafc",
                  textAlign: "center",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}>
                  <input
                    type="file"
                    id={"image-upload"}
                    multiple
                    accept="image/*"
                    onChange={whenPicturePicked}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                      zIndex: 2
                    }}
                  />
                  {/* Upload Icon & Text Indicator */}
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>📸</div>
                  <span style={{ fontWeight: "600", color: "#475569", fontSize: "1rem" }}>
                    Tap to Take or Select Pictures
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
                    Supports multiple images
                  </span>
                </div>

                {images && (Array.isArray(images) ? images.length > 0 : Object.keys(images).length > 0) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontWeight: "600", color: "#475569", fontSize: "0.9rem" }}>
                      Selected Pictures:
                    </span>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "10px",
                      backgroundColor: "#f1f5f9",
                      padding: "12px",
                      borderRadius: "8px"
                    }}>
                      {Object.keys(images).map((key, index) => {
                        const file = images[key];

                        if (!file) return null;

                        let imgSrc = "";
                        try {
                          if (typeof file === "string") {
                            imgSrc = file;
                          } else {
                            imgSrc = URL.createObjectURL(file);
                          }
                        } catch (e) {
                          console.error(e);
                        }

                        if (!imgSrc) return null;

                        return (
                          <div
                            key={index}
                            style={{
                              position: "relative",
                              width: "100%",
                              paddingTop: "100%",
                              borderRadius: "6px",
                              overflow: "visible",
                              border: "1px solid #cbd5e1"
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={`preview-${index}`}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "6px"
                              }}
                            />

                            <button
                              onClick={() => removeImage(key)}
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                zIndex: 10,
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "#a3a2a2",
                                color: "#fff",
                                fontSize: "15px",
                                display: "flex",
                                border: "none",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                padding: 0,
                                lineHeight: 1
                              }}
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BUTTONS ACTION AREA */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>

                  {/* Upload Button */}
                  <button
                    disabled={uploading}
                    onClick={uploadAllImages}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: uploading ? "#cbd5e1" : "#97538c",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "1rem",
                      cursor: uploading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 6px -1px rgba(0, 112, 243, 0.2)",
                      transition: "background-color 0.2s"
                    }}
                  >
                    {uploading ? "Uploading..." : "Upload All Images"}
                  </button>

                  {uploadSuccess && (
                    <button
                      onClick={handleJobComplete}
                      className="startbutton"
                      style={{ marginLeft: "40px" }}
                    >
                      Job Completed
                    </button>
                  )}
                      </div>
              </div>
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
