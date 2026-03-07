import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";

import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
const url = process.env.MONGO_URL;

if (!url) {
  console.error("❌ MONGO_URL is not defined in .env");
  process.exit(1);
}

// Better CORS configuration
app.use(
  cors({
    origin: "*", // in production replace with frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Zoom Clone Backend Running");
});

// Routes
app.use("/api/v1/users", userRoutes);

// Start server
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(url); // ✅ No options

    console.log(`MongoDB Connected host: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`🚀 Listening on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

start();