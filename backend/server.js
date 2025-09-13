import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

dotenv.config();

// Create Express app and set port
const app = express();
const PORT = process.env.PORT || 3001;

// Utility function to parse and validate employee count from various formats
const validateEmployeeCount = (employeesEstimate) => {
  if (!employeesEstimate || typeof employeesEstimate !== "string") return null;

  // Handle common formats: "1-10", "50+", "100", etc.
  const cleaned = employeesEstimate.trim().toLowerCase();

  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    const firstNum = parseInt(parts[0]);
    return isNaN(firstNum) ? null : firstNum;
  }

  if (cleaned.includes("+")) {
    const num = parseInt(cleaned.replace("+", ""));
    return isNaN(num) ? null : num;
  }

  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
};

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

// API endpoint for completing basic user onboarding
app.post("/api/onboarding/basic", async (req, res) => {
  try {
    const { userId, fullName, role, companyName, sector, employeesEstimate } =
      req.body;

    // Basic validation
    if (!userId || !fullName || !companyName) {
      return res.status(400).json({
        error: "User ID, full name, and company name are required",
      });
    }

    // First, check if the company already exists
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("name", companyName)
      .single();

    let companyId;

    if (companyCheckError && companyCheckError.code !== "PGRST116") {
      console.error("Error checking company:", companyCheckError);
      return res
        .status(500)
        .json({ error: "Failed to check company existence" });
    }

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // Create new company
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: companyName,
            sector: sector || null,
            employees_estimate: validateEmployeeCount(employeesEstimate),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
        return res.status(500).json({ error: "Failed to create company" });
      }

      companyId = newCompany.id;
    }

    // Get user email from Supabase Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser?.user?.email) {
      console.error("Error getting user from auth:", authError);
      return res.status(500).json({ error: "Failed to get user information" });
    }

    // Upsert user profile with company info and mark basic onboarding as complete
    const { data: upsertedUser, error: userUpsertError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email: authUser.user.email,
        full_name: fullName,
        company_id: companyId,
        company_role: role || "owner",
        onboarding_basic_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userUpsertError) {
      console.error("Error upserting user:", userUpsertError);
      return res.status(500).json({ error: "Failed to update user profile" });
    }

    // Return success response
    const response = {
      message: "Basic onboarding completed successfully",
      user: {
        id: upsertedUser.id,
        fullName: upsertedUser.full_name,
        companyId: upsertedUser.company_id,
        companyRole: upsertedUser.company_role,
        onboardingBasicCompleted: !!upsertedUser.onboarding_basic_completed_at,
      },
      company: {
        id: companyId,
        name: companyName,
        sector: sector,
        employeesEstimate: employeesEstimate,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get onboarding status
app.get("/api/onboarding/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        company_id,
        company_role,
        onboarding_basic_completed_at,
        companies (
          id,
          name,
          sector,
          employees_estimate
        )
      `
      )
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: userData.id,
        fullName: userData.full_name,
        companyId: userData.company_id,
        companyRole: userData.company_role,
        onboardingBasicCompleted: !!userData.onboarding_basic_completed_at,
      },
      company: userData.companies
        ? {
            id: userData.companies.id,
            name: userData.companies.name,
            sector: userData.companies.sector,
            employeesEstimate: userData.companies.employees_estimate,
          }
        : null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
