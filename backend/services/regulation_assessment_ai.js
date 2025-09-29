import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Regulation-specific metadata for personalization
const REGULATION_METADATA = {
  'AI_ACT': {
    name: 'AI Act',
    fullName: 'Artificial Intelligence Act',
    color: '#7c3aed',
    emoji: '🤖',
    focus: 'AI systems safety, transparency, and fundamental rights',
  },
  'CSRD': {
    name: 'CSRD',
    fullName: 'Corporate Sustainability Reporting Directive',
    color: '#10b981',
    emoji: '🌱',
    focus: 'sustainability reporting and ESG compliance',
  },
  'GDPR': {
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    color: '#0ea5e9',
    emoji: '🔒',
    focus: 'data protection and privacy',
  },
};

/**
 * Analyzes regulation-specific assessment responses using AI
 * Generates personalized recommendations and action items
 * 
 * @param {Object} assessment - The complete assessment object from database
 * @param {Object} companyInfo - Company information (name, sector, etc.)
 * @param {Array} questions - The regulation-specific questions
 * @returns {Object} AI analysis with recommendations and action items
 */
export async function analyzeRegulationAssessment(assessment, companyInfo, questions) {
  try {
    const regulationCode = assessment.regulation_code;
    const regMetadata = REGULATION_METADATA[regulationCode];
    
    if (!regMetadata) {
      throw new Error(`Unknown regulation code: ${regulationCode}`);
    }

    console.log(`🤖 Starting ${regMetadata.name} AI analysis for ${companyInfo.name}...`);
    
    // Prepare context from responses
    const context = prepareRegulationContext(assessment.responses, questions, companyInfo);
    
    const prompt = `
You are a friendly, supportive EU compliance expert at Raylow, a platform helping SMEs navigate EU regulations.

You're analyzing ${companyInfo.name}'s responses to the ${regMetadata.fullName} assessment.

${regMetadata.emoji} **YOUR ROLE**: 
- Act as a collaborative partner, not just an advisor
- Use warm, encouraging language ("we'll help you...", "let's work on...", "together we can...")
- Make complex compliance feel achievable and less overwhelming
- Personalize everything to ${companyInfo.name}'s specific situation

📋 **COMPANY CONTEXT**:
- Company Name: ${companyInfo.name}
- Sector: ${companyInfo.sector || 'Not specified'}
- Size: ${companyInfo.employees_estimate || 'Not specified'} employees

💬 **ASSESSMENT RESPONSES**:
${context}

🎯 **YOUR TASK**: 
Generate a personalized, actionable compliance roadmap for ${companyInfo.name} that:

1. **Acknowledges their current state** - Recognize what they're already doing well
2. **Identifies gaps** - Clearly explain what needs attention (without overwhelming them)
3. **Provides clear next steps** - Specific, prioritized actions they can take
4. **Offers context** - Explain *why* each action matters for their business
5. **Maintains positivity** - Frame compliance as achievable, not scary

🎨 **TONE GUIDELINES**:
- ✅ "We noticed you're processing customer data - let's ensure you have proper consent mechanisms"
- ✅ "${companyInfo.name} is off to a great start with your current practices"
- ✅ "Together, we'll help you build a robust data protection framework"
- ❌ Avoid: "You are non-compliant", "You must", "Failure to comply will result in..."
- ✅ Use: "Let's work on", "We recommend", "A good next step would be"

📊 **REQUIRED JSON RESPONSE FORMAT**:
{
  "executive_summary": "2-3 sentences summarizing ${companyInfo.name}'s current compliance position and key priorities. Mention the company name and be encouraging.",
  
  "strengths": [
    "Specific things ${companyInfo.name} is already doing well based on their responses"
  ],
  
  "priority_actions": [
    {
      "priority": "high|medium|low",
      "title": "Clear, concise action title",
      "description": "Friendly explanation of what needs to be done and why it matters for ${companyInfo.name}",
      "why_it_matters": "Business impact explanation (risk mitigation, customer trust, competitive advantage)",
      "estimated_effort": "hours|days|weeks",
      "suggested_timeline": "immediate|1-3 months|3-6 months",
      "resources_needed": ["What they'll need to complete this"]
    }
  ],
  
  "quick_wins": [
    {
      "action": "Easy action ${companyInfo.name} can take this week",
      "impact": "Immediate benefit they'll see",
      "time_required": "Realistic time estimate"
    }
  ],
  
  "risk_assessment": {
    "overall_risk": "low|medium|high",
    "explanation": "Friendly explanation of ${companyInfo.name}'s risk level without being alarmist",
    "key_risk_areas": [
      {
        "area": "Risk area name",
        "level": "low|medium|high",
        "description": "What this means for ${companyInfo.name}",
        "mitigation": "How we'll help them address it"
      }
    ]
  },
  
  "roadmap": {
    "phase_1": {
      "name": "Immediate Actions (Next 30 days)",
      "actions": ["Specific action 1", "Specific action 2"],
      "goal": "What ${companyInfo.name} will achieve"
    },
    "phase_2": {
      "name": "Short-term (1-3 months)",
      "actions": ["Action 1", "Action 2"],
      "goal": "Next milestone"
    },
    "phase_3": {
      "name": "Medium-term (3-6 months)",
      "actions": ["Action 1", "Action 2"],
      "goal": "Mature compliance state"
    }
  },
  
  "raylow_support": {
    "message": "Personalized message about how Raylow will support ${companyInfo.name} through this journey",
    "next_steps_with_raylow": [
      "How we'll help with action 1",
      "How we'll help with action 2"
    ]
  },
  
  "resources": [
    {
      "type": "template|guide|tool|training",
      "title": "Resource name",
      "description": "How this will help ${companyInfo.name}",
      "priority": "high|medium|low"
    }
  ]
}

⚠️ **CRITICAL REQUIREMENTS**:
- Mention ${companyInfo.name} by name at least 3-5 times throughout
- Use "we" and "together" language to show partnership
- Every recommendation must reference specific details from their responses
- Be specific - no generic advice that could apply to any company
- Keep language simple - avoid legalese
- Frame everything positively and achievably
- Provide realistic timelines and effort estimates

Generate the JSON response now based on ${companyInfo.name}'s specific ${regMetadata.fullName} assessment responses.
`;

    // Call OpenAI API
    console.log(`📤 Sending request to OpenAI for ${companyInfo.name}...`);
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly EU compliance expert at Raylow, helping SMEs with regulatory compliance in a supportive, collaborative way. Always personalize your responses and use warm, encouraging language.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0].message.content;
    const analysis = JSON.parse(responseText);

    console.log(`✅ AI analysis completed for ${companyInfo.name}`);

    // Structure the response
    return {
      llm_analysis: analysis,
      recommendations: analysis.priority_actions || [],
      action_items: analysis.quick_wins || [],
      risk_level: analysis.risk_assessment?.overall_risk || 'medium',
      compliance_summary: analysis.executive_summary,
      processed_at: new Date().toISOString(),
      regulation_metadata: regMetadata,
    };

  } catch (error) {
    console.error('❌ Error in regulation assessment AI analysis:', error);
    
    // Return fallback structure if AI fails
    return {
      llm_analysis: {
        error: 'AI analysis temporarily unavailable',
        message: `We're processing your ${REGULATION_METADATA[assessment.regulation_code]?.fullName || 'assessment'} responses and will have personalized recommendations ready soon.`,
      },
      recommendations: [],
      action_items: [],
      risk_level: 'unknown',
      compliance_summary: 'Analysis pending',
      processed_at: new Date().toISOString(),
      error: error.message,
    };
  }
}

/**
 * Prepares context from assessment responses for LLM
 */
function prepareRegulationContext(responses, questions, companyInfo) {
  let context = '';
  
  // Create a map of questions by their reference ID
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q.esrs_reference] = q;
  });
  
  // Format each response with its question
  Object.entries(responses || {}).forEach(([questionId, responseData]) => {
    const question = questionMap[questionId];
    if (question) {
      context += `\nQ: [${questionId}] ${question.topic}\n`;
      context += `   ${question.question}\n`;
      context += `A: ${responseData.value}\n`;
      context += `   (Answered: ${new Date(responseData.answered_at).toLocaleDateString()})\n`;
    }
  });
  
  if (!context) {
    context = 'No responses recorded yet.';
  }
  
  return context;
}

/**
 * Validates that the assessment has sufficient responses for analysis
 */
export function canAnalyzeAssessment(assessment) {
  const responseCount = Object.keys(assessment.responses || {}).length;
  const completionThreshold = 0.5; // At least 50% answered
  
  if (assessment.total_questions === 0) {
    return { canAnalyze: false, reason: 'No questions in assessment' };
  }
  
  const completionRate = responseCount / assessment.total_questions;
  
  if (completionRate < completionThreshold) {
    return {
      canAnalyze: false,
      reason: `Only ${Math.round(completionRate * 100)}% complete. Need at least 50% to generate meaningful recommendations.`,
    };
  }
  
  return { canAnalyze: true };
}

export default {
  analyzeRegulationAssessment,
  canAnalyzeAssessment,
  REGULATION_METADATA,
};
