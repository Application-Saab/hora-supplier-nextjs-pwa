import logo from '../assets/new_logo_light.png.png'
import checkIcon from '../assets/checkIcon.png'
import Image from "next/image";
import { getInclusions } from '../utils/getInclusions'


const DecorationOrderDetailsTab = ({
    orderDetail,
    decorationComments,
    decorationAddon,
    balanceAmount,
    decorationArray,
}) => {

    return (
        <div className="decoration-container">
            {decorationArray?.map((product, index) => {
                return (
                    <div key={index} className="orderlist-decDetails">
                        <div className="myOrder-decDetailsLeft">
                            <>
                                <Image
                                    src={`https://horaservices.com/api/uploads/compressed_webp/${product.featured_image.split(".")[0]
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

                            <div style={{ marginBottom: "12px" }}>
                                {getInclusions(product?.inclusion, true)}
                            </div>

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
        </div>
    )
};

export default DecorationOrderDetailsTab;