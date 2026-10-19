import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import analyzeRoutes from "./routes/analyzeRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
// Limit body size: scanned text should never be huge
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

// Must come AFTER express.json(), or req.body will be undefined
app.use("/api/analyze", analyzeRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
