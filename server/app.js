// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const taskRoutes = require("./routes/tasks");
// const authRoutes = require("./routes/auth");
// const userRoutes = require("./routes/users");
// const connectDB = require("./config/database");
// const cors = require("cors");
// require("dotenv").config();

// // ✅ Connect to MongoDB
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // ✅ Configure CORS (Frontend runs on 5173 or 3000)
// const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// app.use(cors({
//   origin: allowedOrigin,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// app.use(express.json());

// // ✅ Setup Socket.IO with same CORS
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigin,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }
// });

// app.set("io", io);

// // ✅ Routes
// app.use("/api/tasks", taskRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// // ✅ Test Route
// app.get("/", (req, res) => {
//   res.send("Server is running with Socket.IO 🚀");
// });

// // ✅ Socket.IO Events
// io.on("connection", (socket) => {
//   console.log("⚡ A user connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("❌ User disconnected:", socket.id);
//   });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const connectDB = require("./config/database");
const cors = require("cors");
require("dotenv").config();

// ✅ Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Configure CORS (Frontend deployed on Vercel)
const allowedOrigin = "https://team-productivity-project.vercel.app"; // Hardcoded for deployment

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ Setup Socket.IO with same CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set("io", io);

// ✅ Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Server is running with Socket.IO 🚀");
});

// ✅ Socket.IO Events
io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

