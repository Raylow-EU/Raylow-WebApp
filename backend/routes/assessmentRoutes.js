import express from "express";
import { supabase } from "../config/supabase.js";
import { analyzeAssessmentWithLLM } from "../services/Initial_assessment_processing.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load assessment questions for LLM context
function loadAssessmentQuestions() {
  try {
    const questionsPath = path.join(__dirname, "../../frontend/src/components/Resume_Page/data/comprehensive_screening_questions.json");
    const questionsData = fs.readFileSync(questionsPath, "utf8");
    return JSON.parse(questionsData);
  } catch (error) {
    console.error("Failed to load assessment questions:", error);
    return [];
  }
}

// Get or create assessment for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // First check if user exists and get their company
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Look for existing assessment
    const { data: existingAssessment, error: fetchError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching assessment:", fetchError);
      return res.status(500).json({ error: "Failed to fetch assessment" });
    }

    // If no existing assessment, create one
    if (!existingAssessment) {
      const { data: newAssessment, error: createError } = await supabase
        .from("initial_assessments")
        .insert([
          {
            user_id: userId,
            company_id: userData.company_id,
            status: "in_progress",
            responses: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating assessment:", createError);
        return res.status(500).json({ error: "Failed to create assessment" });
      }

      return res.json(newAssessment);
    }

    res.json(existingAssessment);
  } catch (error) {
    console.error("Assessment fetch/create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save a response to an assessment
router.put("/:assessmentId/responses", async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questionId, value } = req.body;

    if (!questionId || value === undefined) {
      return res.status(400).json({
        error: "Question ID and value are required",
      });
    }

    // Get current assessment
    const { data: assessment, error: fetchError } = await supabase
      .from("initial_assessments")
      .select("responses")
      .eq("id", assessmentId)
      .single();

    if (fetchError || !assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Update the responses object
    const updatedResponses = {
      ...assessment.responses,
      [questionId]: {
        value: value,
        answered_at: new Date().toISOString(),
      },
    };

    // Save updated responses
    const { data: updatedAssessment, error: updateError } = await supabase
      .from("initial_assessments")
      .update({
        responses: updatedResponses,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating assessment:", updateError);
      return res.status(500).json({ error: "Failed to update assessment" });
    }

    res.json(updatedAssessment);
  } catch (error) {
    console.error("Assessment update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit assessment for completion
router.post("/:assessmentId/submit", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Get current assessment data
    const { data: currentAssessment, error: fetchError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (fetchError || !currentAssessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Load assessment questions for LLM context
    const questions = loadAssessmentQuestions();

    let llmResults = null;

    // Trigger LLM analysis
    try {
      console.log("🤖 Starting LLM analysis for assessment:", assessmentId);
      llmResults = await analyzeAssessmentWithLLM(currentAssessment.responses, questions);
      console.log("✅ LLM analysis completed successfully");
    } catch (llmError) {
      console.error("❌ LLM analysis failed, proceeding without it:", llmError);
      // Continue without LLM analysis - the service has its own fallback
    }

    // Mark assessment as completed and store LLM results
    const updateData = {
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (llmResults) {
      updateData.llm_analysis = llmResults.llm_analysis;
      updateData.llm_processed_at = llmResults.processed_at;
      updateData.applicable_regulations = llmResults.applicable_regulations;
      updateData.supported_regulations = llmResults.supported_regulations;
      updateData.unsupported_regulations = llmResults.unsupported_regulations;
    }

    const { data: completedAssessment, error: updateError } = await supabase
      .from("initial_assessments")
      .update(updateData)
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error completing assessment:", updateError);
      return res.status(500).json({ error: "Failed to complete assessment" });
    }

    res.json({
      message: "Assessment completed successfully",
      assessment: completedAssessment,
      llm_analysis: llmResults,
    });
  } catch (error) {
    console.error("Assessment completion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get assessment results with applicable regulations
router.get("/:assessmentId/results", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const { data: assessment, error: fetchError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (fetchError || !assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    if (assessment.status !== "completed") {
      return res.status(400).json({
        error: "Assessment must be completed to view results",
      });
    }

    // Return LLM analysis if available, otherwise fallback to rule-based
    const applicableRegulations = assessment.llm_analysis?.applicable_regulations || 
                                analyzeAssessmentResponses(assessment.responses);

    res.json({
      assessment,
      applicableRegulations,
      supportedRegulations: assessment.supported_regulations || [],
      unsupportedRegulations: assessment.unsupported_regulations || [],
      summary: assessment.llm_analysis?.summary,
      riskLevel: assessment.llm_analysis?.risk_level,
      recommendations: assessment.llm_analysis?.recommendations || [],
      llmProcessed: !!assessment.llm_processed_at,
      message: assessment.llm_processed_at ? 
        "Results based on AI analysis" : 
        "Results based on rule-based analysis",
    });
  } catch (error) {
    console.error("Assessment results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's personalized regulation recommendations for homepage
router.get("/user/:userId/recommendations", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the user's latest completed assessment
    const { data: assessment, error: fetchError } = await supabase
      .from("initial_assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user assessment:", fetchError);
      return res.status(500).json({ error: "Failed to fetch assessment" });
    }

    if (!assessment) {
      return res.json({
        hasCompletedAssessment: false,
        supportedRegulations: [],
        unsupportedRegulations: [],
        message: "No completed assessment found"
      });
    }

    // Return personalized recommendations
    res.json({
      hasCompletedAssessment: true,
      supportedRegulations: assessment.supported_regulations || [],
      unsupportedRegulations: assessment.unsupported_regulations || [],
      applicableRegulations: assessment.applicable_regulations || [],
      summary: assessment.llm_analysis?.summary,
      riskLevel: assessment.llm_analysis?.risk_level,
      recommendations: assessment.llm_analysis?.recommendations || [],
      llmProcessed: !!assessment.llm_processed_at,
      assessmentId: assessment.id,
      completedAt: assessment.completed_at
    });
  } catch (error) {
    console.error("User recommendations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Basic rule-based analysis (placeholder for LLM)
function analyzeAssessmentResponses(responses) {
  const applicable = [];

  // GDPR Analysis
  if (
    responses["gdpr-scope"]?.value ||
    responses["gdpr-special"]?.value ||
    responses["gdpr-transfers"]?.value ||
    responses["eprivacy-marketing"]?.value
  ) {
    applicable.push({
      regulation: "GDPR",
      confidence: 0.9,
      reasons: ["Processes personal data of EU individuals"],
      priority: "high",
    });
  }

  // CSRD Analysis
  if (
    responses["csrd-thresholds"]?.value ||
    responses["csrd-non-eu"]?.value ||
    responses["csrd-consolidated"]?.value
  ) {
    applicable.push({
      regulation: "CSRD",
      confidence: 0.85,
      reasons: ["Meets CSRD reporting thresholds"],
      priority: "medium",
    });
  }

  // AI Act Analysis
  if (
    responses["aia-deploy"]?.value ||
    responses["aia-highrisk"]?.value ||
    responses["aia-transparency"]?.value
  ) {
    applicable.push({
      regulation: "AI Act",
      confidence: 0.8,
      reasons: ["Uses AI systems in EU market"],
      priority: "medium",
    });
  }

  return applicable;
}

export default router;
