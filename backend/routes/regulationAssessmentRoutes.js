import express from "express";
import { supabase } from "../config/supabase.js";
import { analyzeRegulationAssessment, canAnalyzeAssessment } from "../services/regulation_assessment_ai.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Regulation code mapping
const REGULATION_CODES = {
  'ai-act': 'AI_ACT',
  'csrd': 'CSRD',
  'gdpr': 'GDPR'
};

// Reverse mapping for response
const REGULATION_CODES_REVERSE = {
  'AI_ACT': 'ai-act',
  'CSRD': 'csrd',
  'GDPR': 'gdpr'
};

// Load flashcard questions for a specific regulation
function loadRegulationQuestions(regulationCode) {
  try {
    let questionsPath;
    switch (regulationCode) {
      case 'ai-act':
        questionsPath = path.join(__dirname, "../../frontend/src/components/Regulations/AIAct/Flashcards/data/ai_act_flashcards.json");
        break;
      case 'csrd':
        questionsPath = path.join(__dirname, "../../frontend/src/components/Regulations/CSRD/Flashcards/data_CSRD_flashcards/esrs_flashcards.json");
        break;
      case 'gdpr':
        questionsPath = path.join(__dirname, "../../frontend/src/components/Regulations/GDPR/Flashcards/data/gdpr_flashcards.json");
        break;
      default:
        console.error(`Unknown regulation code: ${regulationCode}`);
        return [];
    }
    
    const questionsData = fs.readFileSync(questionsPath, "utf8");
    return JSON.parse(questionsData);
  } catch (error) {
    console.error(`Failed to load questions for ${regulationCode}:`, error);
    return [];
  }
}

/**
 * GET /api/regulation-assessments/user/:userId/:regulationCode
 * Get or create a regulation assessment for a user and specific regulation
 */
router.get("/user/:userId/:regulationCode", async (req, res) => {
  try {
    const { userId, regulationCode } = req.params;
    
    // Validate regulation code
    if (!REGULATION_CODES[regulationCode]) {
      return res.status(400).json({ 
        error: "Invalid regulation code. Must be one of: ai-act, csrd, gdpr" 
      });
    }

    const dbRegulationCode = REGULATION_CODES[regulationCode];

    // First check if user exists and get their company
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get regulation ID from regulations table
    const { data: regulationData, error: regError } = await supabase
      .from("regulations")
      .select("id")
      .eq("code", dbRegulationCode)
      .single();

    if (regError) {
      console.error("Error fetching regulation:", regError);
      return res.status(500).json({ error: "Failed to fetch regulation" });
    }

    // If regulation doesn't exist, create it
    let regulationId = regulationData?.id;
    if (!regulationId) {
      const regulationNames = {
        'AI_ACT': 'Artificial Intelligence Act',
        'CSRD': 'Corporate Sustainability Reporting Directive',
        'GDPR': 'General Data Protection Regulation'
      };
      
      const { data: newRegulation, error: createRegError } = await supabase
        .from("regulations")
        .insert([{
          code: dbRegulationCode,
          title: regulationNames[dbRegulationCode],
          jurisdiction: 'EU',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createRegError) {
        console.error("Error creating regulation:", createRegError);
        return res.status(500).json({ error: "Failed to create regulation" });
      }
      
      regulationId = newRegulation.id;
    }

    // Look for existing assessment
    const { data: existingAssessment, error: fetchError } = await supabase
      .from("regulation_assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("regulation_id", regulationId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching regulation assessment:", fetchError);
      return res.status(500).json({ error: "Failed to fetch assessment" });
    }

    // If no existing assessment, create one
    if (!existingAssessment) {
      // Load questions to get total count
      const questions = loadRegulationQuestions(regulationCode);
      
      const { data: newAssessment, error: createError } = await supabase
        .from("regulation_assessments")
        .insert([
          {
            user_id: userId,
            company_id: userData.company_id,
            regulation_id: regulationId,
            regulation_code: dbRegulationCode,
            status: "in_progress",
            responses: {},
            total_questions: questions.length,
            answered_questions: 0,
            progress_percentage: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating regulation assessment:", createError);
        return res.status(500).json({ error: "Failed to create assessment" });
      }

      return res.json(newAssessment);
    }

    res.json(existingAssessment);
  } catch (error) {
    console.error("Regulation assessment fetch/create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/regulation-assessments/:assessmentId/responses
 * Save a single response to a regulation assessment
 */
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
      .from("regulation_assessments")
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

    // Save updated responses (trigger will auto-update progress)
    const { data: updatedAssessment, error: updateError } = await supabase
      .from("regulation_assessments")
      .update({
        responses: updatedResponses,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating regulation assessment:", updateError);
      return res.status(500).json({ error: "Failed to update assessment" });
    }

    res.json(updatedAssessment);
  } catch (error) {
    console.error("Regulation assessment update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/regulation-assessments/:assessmentId/submit
 * Submit regulation assessment for completion and trigger AI analysis
 */
router.post("/:assessmentId/submit", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Get current assessment data with company info
    const { data: currentAssessment, error: fetchError } = await supabase
      .from("regulation_assessments")
      .select(`
        *,
        companies (
          name,
          sector,
          employees_estimate,
          emissions_tons_yearly
        )
      `)
      .eq("id", assessmentId)
      .single();

    if (fetchError || !currentAssessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Check if assessment can be analyzed
    const { canAnalyze, reason } = canAnalyzeAssessment(currentAssessment);
    
    if (!canAnalyze) {
      console.log(`⚠️ Assessment ${assessmentId} cannot be analyzed: ${reason}`);
    }

    // Load questions for AI context
    const regulationCode = REGULATION_CODES_REVERSE[currentAssessment.regulation_code] || 
                           currentAssessment.regulation_code.toLowerCase().replace('_', '-');
    const questions = loadRegulationQuestions(regulationCode);

    // Prepare update data
    const updateData = {
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to run AI analysis if enough data
    let aiResults = null;
    if (canAnalyze) {
      try {
        console.log(`🤖 Starting AI analysis for assessment ${assessmentId}...`);
        
        const companyInfo = {
          name: currentAssessment.companies?.name || 'Your Company',
          sector: currentAssessment.companies?.sector,
          employees_estimate: currentAssessment.companies?.employees_estimate,
          emissions_tons_yearly: currentAssessment.companies?.emissions_tons_yearly,
        };

        aiResults = await analyzeRegulationAssessment(
          currentAssessment,
          companyInfo,
          questions
        );

        // Add AI results to update
        updateData.llm_analysis = aiResults.llm_analysis;
        updateData.llm_processed_at = aiResults.processed_at;
        updateData.recommendations = aiResults.recommendations;
        updateData.action_items = aiResults.action_items;
        updateData.risk_level = aiResults.risk_level;
        updateData.compliance_summary = aiResults.compliance_summary;

        console.log(`✅ AI analysis completed for assessment ${assessmentId}`);
      } catch (aiError) {
        console.error('❌ AI analysis failed, continuing without it:', aiError);
        // Continue without AI analysis - assessment will still be marked complete
      }
    }

    // Update assessment with completion and AI results
    const { data: completedAssessment, error: updateError } = await supabase
      .from("regulation_assessments")
      .update(updateData)
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error completing regulation assessment:", updateError);
      return res.status(500).json({ error: "Failed to complete assessment" });
    }

    res.json({
      message: "Regulation assessment completed successfully",
      assessment: completedAssessment,
      ai_analysis: aiResults,
      has_recommendations: !!aiResults,
    });
  } catch (error) {
    console.error("Regulation assessment completion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/regulation-assessments/:assessmentId/results
 * Get results for a completed regulation assessment with AI recommendations
 */
router.get("/:assessmentId/results", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const { data: assessment, error: fetchError} = await supabase
      .from("regulation_assessments")
      .select(`
        *,
        companies (
          name,
          sector,
          employees_estimate
        )
      `)
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

    res.json({
      assessment,
      progress: assessment.progress_percentage,
      totalQuestions: assessment.total_questions,
      answeredQuestions: assessment.answered_questions,
      completedAt: assessment.completed_at,
      // AI-generated insights
      recommendations: assessment.recommendations || [],
      action_items: assessment.action_items || [],
      llm_analysis: assessment.llm_analysis,
      risk_level: assessment.risk_level,
      compliance_summary: assessment.compliance_summary,
      has_ai_analysis: !!assessment.llm_processed_at,
      company_info: assessment.companies,
    });
  } catch (error) {
    console.error("Regulation assessment results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/regulation-assessments/by-company/:companyId
 * Get all regulation assessments for a company
 */
router.get("/by-company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data: assessments, error: fetchError } = await supabase
      .from("regulation_assessments")
      .select("*")
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching company regulation assessments:", fetchError);
      return res.status(500).json({ error: "Failed to fetch assessments" });
    }

    res.json({
      assessments: assessments || [],
      total: assessments?.length || 0,
    });
  } catch (error) {
    console.error("Company regulation assessments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
