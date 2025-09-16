import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

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

    // Mark assessment as completed
    const { data: completedAssessment, error: updateError } = await supabase
      .from("initial_assessments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error completing assessment:", updateError);
      return res.status(500).json({ error: "Failed to complete assessment" });
    }

    // TODO: Trigger LLM analysis here in the future
    // For now, we'll just return the completed assessment

    res.json({
      message: "Assessment completed successfully",
      assessment: completedAssessment,
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

    // For now, return basic analysis based on responses
    // TODO: Replace with actual LLM analysis
    const basicAnalysis = analyzeAssessmentResponses(assessment.responses);

    res.json({
      assessment,
      applicableRegulations: basicAnalysis,
      message: "Results based on basic rule analysis. AI analysis coming soon.",
    });
  } catch (error) {
    console.error("Assessment results error:", error);
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
