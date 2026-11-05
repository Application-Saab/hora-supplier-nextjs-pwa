import logo from '../assets/new_logo_light.png.png'
import checkIcon from '../assets/checkIcon.png'
import Image from "next/image";
import { getInclusions } from '../utils/getInclusions'
import { BASE_URL } from "../apiconstant/apiconstant";
import { useState } from "react";
import CommonImagePopup from './ImageComponents/CommonImagePopup';
import axios from "axios";
import { jsPDF } from "jspdf";

const DecorationOrderDetailsTab = ({
    orderDetail,
    decorationComments,
    decorationAddon,
    balanceAmount,
    decorationArray,
}) => {

    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [verifiedImages, setVerifiedImages] = useState([]);

    const allVerifiedImages = Object.entries(
        orderDetail?.call_checklist?.itemsVerifiedImages || {}
    ).flatMap(([itemName, images]) =>
        Array.isArray(images)
            ? images.map((image) => ({
                originalUrl: `${BASE_URL}/api/uploads/${image}`,
                thumbnailImageUrl: `${BASE_URL}/api/uploads/${image}`,
                type: "image",
                itemName,
            }))
            : []
    );

    const handleDownloadImage = async (image) => {
        try {
            const imageUrl =
                typeof image === "string"
                    ? image
                    : image?.originalUrl;

            if (!imageUrl) {
                console.error("Image URL missing:", image);
                return;
            }

            const response = await axios.get(imageUrl, {
                responseType: "blob",
            });

            const blobUrl = window.URL.createObjectURL(response.data);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = imageUrl.split("/").pop();

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error("Image download failed:", error);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const pdf = new jsPDF("p", "mm", "a4");

            for (let i = 0; i < allVerifiedImages.length; i++) {
                const image = allVerifiedImages[i];

                console.log("PDF IMAGE URL:", image.originalUrl);

                // Original URL use hoga, filename/extension change nahi hoga
                const response = await axios.get(image.originalUrl, {
                    responseType: "blob",
                });

                const reader = new FileReader();

                const imageData = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(response.data);
                });

                const img = new window.Image();

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageData;
                });

                if (i > 0) pdf.addPage();

                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 10;

                const ratio = Math.min(
                    (pageWidth - margin * 2) / img.width,
                    (pageHeight - margin * 2) / img.height
                );

                const width = img.width * ratio;
                const height = img.height * ratio;

                const x = (pageWidth - width) / 2;
                const y = (pageHeight - height) / 2;

                // Actual image format detect karo
                const format = response.data.type.includes("png")
                    ? "PNG"
                    : "JPEG";

                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const rgbImageData = canvas.toDataURL("image/jpeg", 0.95);

                pdf.addImage(rgbImageData, "JPEG", x, y, width, height);
            }

            pdf.save("Item-Verified-Images.pdf");

        } catch (error) {
            console.error("PDF download failed:", error);
        }
    };

    return (
        <div className="decoration-container">
            {decorationArray?.map((product, index) => {
                return (
                    <div key={index} className="orderlist-decDetails">
                        <div className="myOrder-decDetailsLeft">
                            <>
                                <Image
                                    src={`https://horaservices.com/api/uploads/compressed_webp/${product?.featured_images?.length > 0 && product?.featured_images[0]?.fileName?.split(".")[0]
                                        }.webp`}
                                    alt={product?.name}
                                    height={300}
                                    width={300}
                                    style={{ height: "auto", width: "100%" }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 9,
                                        right: 4,
                                    }}
                                >
                                    <span>
                                        <Image src={logo} style={{ width: "50px", height: "55px" }} className="hora-watermark-image" />
                                    </span>
                                </div>
                            </>
                        </div>

                        <div className="myOrder-decDetailsRight">
                            <h1>
                                {product?.name}
                            </h1>
                            {product?.inclusion && product?.inclusion.length > 0 && (
                            <div style={{ marginBottom: "12px" }}>
                                {getInclusions(product?.inclusion, true)}
                            </div>
                    )}

                            {orderDetail.customInclusion?.length > 0 && (
                                <div style={{ marginBottom: "12px" }}>
                                    <div>
                                        {orderDetail.customInclusion.map((item, index) => (
                                            <div key={index} className="info-row">
                                                <div className="info-icon">
                                                    <Image
                                                        src={checkIcon}
                                                        alt="Info"
                                                        className="info-icon-img"
                                                    />
                                                </div>

                                                <div>{item}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {decorationAddon?.length > 0 &&
                                <div className="product-add-ons prod_sec" style={{ marginBottom: "12px" }}>
                                    <div className="fw-semiBold myOrderDetails-heading">
                                        Add-Ons
                                    </div>
                                    <ul>
                                        {decorationAddon.map((item, index) => (
                                            <div key={index} className="info-row">
                                                <div className="info-icon">
                                                    <Image
                                                        src={checkIcon}
                                                        alt="Info"
                                                        style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                                                    />
                                                </div>
                                                <div>
                                                    {(() => {
                                                        const rawTitle =
                                                            item?.name || item?.title;

                                                        const quantityMatch = rawTitle?.match(/Quantity\s*(\d+)/i);
                                                        const extractedQuantity = quantityMatch
                                                            ? Number(quantityMatch[1])
                                                            : null;

                                                        const cleanedTitle = rawTitle?.replace(
                                                            /\s*-\s*Quantity\s*\d+/i,
                                                            ""
                                                        ).trim();

                                                        const quantity =
                                                            extractedQuantity || Number(item?.quantity) || 1;

                                                        return (
                                                            <>
                                                                <div>{cleanedTitle || "N/A"}</div>
                                                                <div>{cleanedTitle && `Quantity : ${quantity}`}</div>
                                                            </>
                                                        );
                                                    })()}

                                                </div>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            }
                            {/* Additional Comments */}
                            <div>
                                <div className="fw-semiBold myOrderDetails-heading">
                                    Additional Comments
                                </div>
                                {decorationComments && (
                                    <div>
                                        {decorationComments.split('\n').map((comment, index) => (
                                            <div key={index} className="info-row">
                                                <div className="info-icon">
                                                    <Image
                                                        src={checkIcon}
                                                        alt="Info"
                                                        className="info-icon-img"
                                                        style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                                                    />
                                                </div>

                                                <div className='info-text'>{comment}</div> 
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="fw-semiBold myOrderDetails-heading">
                                Item Verified
                            </div>
                            {orderDetail?.call_checklist?.itemsVerifiedImages &&
                                Object.keys(orderDetail.call_checklist.itemsVerifiedImages).length > 0 && (
                                    <div style={{ marginBottom: "12px" }}>
                                        {Object.entries(orderDetail.call_checklist.itemsVerifiedImages).map(
                                            ([itemName, images]) => (
                                                <div key={itemName} style={{ marginBottom: "10px" }}>

                                                    <div className="info-row">
                                                        <div className="info-icon">
                                                            <Image
                                                                src={checkIcon}
                                                                alt="Info"
                                                                className="info-icon-img"
                                                            />
                                                        </div>

                                                        <div>{itemName}</div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "6px",
                                                            marginLeft: "25px",
                                                            marginTop: "5px",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        {Array.isArray(images) &&
                                                            images.map((image, index) => {
                                                                const imageUrl = `${BASE_URL}/api/uploads/${image}`;
                                                        return (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: "4px",
                                                            }}
                                                        >
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={itemName}
                                                                    width={55}
                                                                    height={45}
                                                                    onClick={() => {
                                                                        setVerifiedImages(allVerifiedImages);
                                                                        setSelectedImageIndex(
                                                                            allVerifiedImages.findIndex(
                                                                                (img) => img.originalUrl === imageUrl
                                                                            )
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        width: "55px",
                                                                        height: "45px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                />
                                                        </div>
                                                        );
                                                            })}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            <div className="fw-semiBold myOrderDetails-heading">
                                Price Details
                            </div>

                            <span className="priceDetails-container" style={{ fontSize: "14px", color: "#97538C" }}>

                                <span className="myOrder-amountList">
                                    <span className="myOrder-labelStyle"> Amount :</span>
                                    <span>₹ {balanceAmount || 0}</span>
                                </span>
                            </span>
                            <div className="fw-semiBold myOrderDetails-heading">
                                Venue Details
                            </div>

                            <div style={{ fontSize: "13.17px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <span className="fw-semiBold">Address :</span>
                                    <span> {' '}
                                        {orderDetail?.addressId?.address1 || "NA"}
                                    </span>
                                </div>
                                <div style={{ marginBottom: "8px" }}>
                                    <span className="fw-semiBold">City :</span>
                                    <span>{' '}{orderDetail?.addressId?.city || "NA"}</span>
                                </div>
                                <div style={{ marginBottom: "8px" }}>
                                    <span className="fw-semiBold">Pin Code :</span>
                                    <span>{' '}{orderDetail?.order_pincode || "NA"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <CommonImagePopup
                images={verifiedImages}
                selectedIndex={selectedImageIndex}
                setSelectedIndex={setSelectedImageIndex}
                onClose={() => setSelectedImageIndex(null)}
                renderFooter={(image) => (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "15px",
                            padding: "12px",
                            marginBottom:"60px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => handleDownloadImage(image)}
                            style={{
                                background: "#97538C",
                                color: "#fff",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontWeight: "500",
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Image
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            style={{
                                background: "#97538C",
                                color: "#fff",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontWeight:"500",
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download All as PDF
                        </button>
                    </div>
                )}
            />

        </div>
    )
};

export default DecorationOrderDetailsTab;