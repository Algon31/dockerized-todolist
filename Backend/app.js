const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL || "http://localhost:3000"]
    : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:80"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/fallback
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
    credentials: true,
  })
);

app.use(express.json());

// Import limiters & routes
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./Todooperations/todoOperations");

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// Authentication routes protected by auth rate limiter
app.use("/api/auth", authLimiter, authRoutes);

// Todo routes protected by API rate limiter
app.use("/todo", apiLimiter, todoRoutes);
app.use("/api/todo", apiLimiter, todoRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
