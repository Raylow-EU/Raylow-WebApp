import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

// Import route modules
import onboardingRoutes from "./routes/onboardingRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

// Create Express app and set port
const app = express();
const PORT = process.env.PORT || 3001;

// Utility functions moved to individual route files

// Security and logging middleware
app.use(helmet());
app.use(morgan("combined"));

// Configure CORS to allow frontend connections
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8000",
      "http://localhost:5173",
      "http://localhost:8001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Parse JSON request bodies

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Mount route modules
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/chat", chatRoutes);

// Endpoints now organized in route modules above

// Assessment endpoints moved to routes/assessmentRoutes.js

// Chat endpoints moved to routes/chatRoutes.js

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Raylow backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Onboarding: http://localhost:${PORT}/api/onboarding/basic`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close();
});
