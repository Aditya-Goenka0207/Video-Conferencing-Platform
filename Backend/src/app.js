import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";

const app = express();

import userRoutes from "./routes/users.routes.js";

const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
const url = process.env.MONGO_URL;

//better CORS configuration (important for frontend meeting connection)
app.use(
  cors({
    origin: "*", // in production replace with frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// body parser
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/", (req, res) => {
  res.send("Zoom Clone Backend Running");
});

// routes
app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    const connectionDb = await mongoose.connect(url);
    console.log(`MongoDB Connected host : ${connectionDb.connection.host}`);
    server.listen(app.get("port"), () => {
      console.log(`Listening on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

start();
