import checkIcon from '../assets/checkIcon.png'
import Image from "next/image";
import { getInclusions } from '../utils/getInclusions'


const PhotographyOrderDetailsTab = ({
    orderDetail,
    decorationComments,
    balanceAmount,
    bulletItems,
}) => {
    return (
        <div className="photography-decDetailsRight">
            <h1 className="mb-2">
                {orderDetail?.items?.[0]?.photography?.name || "Photography Service"}
            </h1>
            <div style={{ marginBottom: "12px" }}>
                {getInclusions(bulletItems)}
            </div>
            <div className="fw-semiBold myOrderDetails-heading">
                Add-ons
            </div>

            {orderDetail?.add_on?.length > 0 ? (
                orderDetail.add_on.map((item, index) => (
                    <div key={index} className="info-row">
                        <Image
                            src={checkIcon}
                            alt=""
                            width={13}
                            height={13}
                            style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                        />
                        <div>
                            <div style={{ fontWeight: "bold" }}>
                                {item?.title || "NA"}
                            </div>
                            <div style={{ fontSize: "14px", color: "#555" }}>
                                {item?.description || "No description"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#888" }}>
                                quantity :  {item?.quantity || 1}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div style={{ fontSize: 13 }}>NA</div>
            )}
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
                                    width={13}
                                    height={13}
                                    style={{ height: 13, width: 13, marginRight: '5px', marginTop: "5px" }}
                                />
                            </div>

                            <div>{comment}</div>
                        </div>
                    ))}
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
        </div>
    )
};

export default PhotographyOrderDetailsTab;