import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

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

// API endpoint for completing basic user onboarding
router.post("/basic", async (req, res) => {
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
router.get("/status/:userId", async (req, res) => {
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

export default router;
