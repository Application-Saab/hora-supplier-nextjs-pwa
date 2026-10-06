import { io } from "socket.io-client";
import { BASE_URL2 } from "./apiconstant/apiconstant";
// ⚠️ Socket usi server se connect hona chahiye jo processSupplierS3Folder chala raha hai.
// Agar wo BASE_URL2 par hai to BASE_URL2 import karke neeche use karo.

let socket = null;

export const connectSocket = (userId) => {
    if (!userId) return null;
    if (socket) return socket;

    socket = io(BASE_URL2, {
        transports: ["websocket", "polling"],
        query: { userId },
        autoConnect: true,
    });

    socket.on("connect", () => console.log("✅ CONNECTED:", socket.id));
    socket.on("disconnect", (reason) => console.log("❌ DISCONNECTED:", reason));
    socket.on("connect_error", (err) => console.log("❌ CONNECT ERROR:", err.message));

    return socket;
};

// Jab bhi socket chahiye ye call karo (login ke baad bhi chalega)
export const getSocket = () => {
    if (typeof window === "undefined") return null;
    if (socket) return socket;
    const userId = localStorage.getItem("supplierID");
    return userId ? connectSocket(userId) : null;
};

// Purane imports ke liye
if (typeof window !== "undefined") getSocket();

export default socket;