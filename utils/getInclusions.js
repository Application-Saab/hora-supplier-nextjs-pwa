import Image from "next/image";
import checkIcon from '../assets/checkIcon.png'

export const getInclusions = (data, isHtml = false) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  let items = [];

  if (isHtml) {
    const htmlString = data[0] || "";

    const withoutTags = htmlString.replace(/<[^>]*>/g, "");
    const withoutSpecialChars = withoutTags.replace(/&#[^;]*;/g, " ");

    items = withoutSpecialChars
      .split("-")
      .filter((item) => item.trim() !== "");
  } else {
    items = data;
  }

  const inclusionList = items.map((item, index) => (
    <div className="info-row" key={index}>
      <div className="info-icon">
        <Image
          src={checkIcon}
          alt="Info"
          style={{
            height: 13,
            width: 13,
            marginRight: "5px",
            marginTop: "5px",
          }}
        />
      </div>
      <div>{item.trim()}</div>
    </div>
  ));

  return (
    <div>
      <div className="fw-semiBold myOrderDetails-heading">
        Inclusions
      </div>
      <div>{inclusionList}</div>
    </div>
  );
};