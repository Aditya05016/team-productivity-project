// socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // makes connection faster & reliable
  reconnectionAttempts: 5,   // retry up to 5 times
  reconnectionDelay: 1000,   // wait 1s before retry
});

// Optional: log when connected/disconnected
socket.on("connect", () => {
  console.log("✅ Connected to socket server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});

export default socket;
