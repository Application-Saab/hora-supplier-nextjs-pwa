// import { useState } from "react";

// export default function InstaFilterApp() {
//   const [image, setImage] = useState(null);
//   const [filter, setFilter] = useState("normal");

//   const filters = {
//     normal: "none",
//     clarendon: "contrast(1.2) saturate(1.35)",
//     gingham: "sepia(0.04) contrast(0.9) brightness(1.1)",
//     moon: "grayscale(1) contrast(1.1) brightness(1.1)",
//     lark: "contrast(0.9) brightness(1.05) saturate(1.2)",
//     reyes: "brightness(1.1) contrast(0.9) saturate(0.75)",
//     juno: "contrast(1.1) saturate(1.3) brightness(1.05)",
//     slumber: "brightness(1.1) saturate(0.66)",
//     crema: "contrast(1.05) brightness(1.05) saturate(0.9)"
//   };

//   const handleUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(URL.createObjectURL(file));
//     }
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
//       {/* Upload Input */}
//       <input type="file" accept="image/*" onChange={handleUpload} />

//       {/* Image Preview */}
//       {image && (
//         <div style={{ display: "flex", gap: "20px" }}>
//           <img
//             src={image}
//             alt="preview"
//             style={{
//               width: "300px",
//               height: "auto",
//               filter: filters[filter],
//               transition: "filter 0.3s ease"
//             }}
//           />

//           {/* Filter Thumbnails */}
//           <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//             {Object.keys(filters).map((f) => (
//               <button
//                 key={f}
//                 onClick={() => setFilter(f)}
//                 style={{
//                   padding: "5px 10px",
//                   cursor: "pointer",
//                   background: filter === f ? "#ddd" : "#fff",
//                   border: "1px solid #ccc"
//                 }}
//               >
//                 {f}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// two

import { useEffect, useRef, useState } from "react";

export default function CamanEditor() {
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);

  // Reload image into canvas when user uploads
  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [image]);

  // Apply filter using CamanJS
  const applyFilter = (filter) => {
    if (!canvasRef.current) return;

    // @ts-ignore (Caman is loaded globally from CDN)
    window.Caman(canvasRef.current, function () {
      this.revert(false); // reset before applying new filter

      if (filter === "vintage") this.vintage();
      if (filter === "lomo") this.lomo();
      if (filter === "clarity") this.clarity();
      if (filter === "sunrise") this.sunrise();
      if (filter === "grungy") this.grungy();
      if (filter === "love") this.love();
      if (filter === "orangePeel") this.orangePeel();
      if (filter === "jarques") this.jarques();
      if (filter === "sinCity") this.sinCity();
      if (filter === "sepia") this.sepia(60);
      if (filter === "greyscale") this.greyscale();

      this.render();
    });
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Upload Input */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImage(URL.createObjectURL(file));
            }
          }}
        />
        <canvas
          ref={canvasRef}
          style={{ marginTop: "10px", maxWidth: "400px", border: "1px solid #ccc" }}
        ></canvas>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          "vintage",
          "lomo",
          "clarity",
          "sunrise",
          "grungy",
          "love",
          "orangePeel",
          "jarques",
          "sinCity",
          "sepia",
          "greyscale",
        ].map((f) => (
          <button key={f} onClick={() => applyFilter(f)}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
