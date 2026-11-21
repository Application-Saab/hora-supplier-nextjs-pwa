import { io } from "socket.io-client";
import { BASE_URL2 } from "./apiconstant/apiconstant";


let socket = null;

export const connectSocket = (userId) => {
    if (!userId) return null;
    if (socket) return socket;

    console.log(BASE_URL2)

    socket = io("https://horaservices.com", {
        path: "/media-api/socket.io",
        transports: ["polling", "websocket"],
        query: { userId },
    });

    socket.on("connect", () => console.log("✅ CONNECTED:", socket.id));
    socket.on("disconnect", (reason) => console.log("❌ DISCONNECTED:", reason));
    socket.on("connect_error", (err) => {
        console.log("❌ CONNECT ERROR:", err.message);
        console.log("Description:", err.description);
        console.log("Context:", err.context);
    });

    return socket;
};

export const getSocket = () => {
    if (typeof window === "undefined") return null;
    if (socket) return socket;
    const userId = localStorage.getItem("supplierID");
    return userId ? connectSocket(userId) : null;
};

if (typeof window !== "undefined") getSocket();

export default socket;