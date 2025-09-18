import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supported regulations that our platform can help with
const SUPPORTED_REGULATIONS = ['GDPR', 'CSRD', 'AI_ACT'];

// Comprehensive EU regulation mapping with detailed categories
const COMPREHENSIVE_EU_REGULATIONS = {
  // Data Protection & Privacy
  'GDPR': {
    name: 'General Data Protection Regulation',
    category: 'data_protection',
    keywords: ['personal data', 'data processing', 'privacy', 'consent', 'data transfer'],
    thresholds: ['processes personal data', 'EU data subjects']
  },
  'EPRIVACY': {
    name: 'ePrivacy Directive',
    category: 'data_protection', 
    keywords: ['cookies', 'electronic communications', 'marketing', 'tracking'],
    thresholds: ['electronic communications', 'cookies/tracking']
  },

  // Sustainability & Environment
  'CSRD': {
    name: 'Corporate Sustainability Reporting Directive',
    category: 'sustainability',
    keywords: ['sustainability reporting', 'ESG', 'environmental impact'],
    thresholds: ['250+ employees OR €40M+ turnover OR €20M+ assets', 'listed company']
  },
  'EU_TAXONOMY': {
    name: 'EU Taxonomy for Sustainable Activities',
    category: 'sustainability',
    keywords: ['sustainable finance', 'green investments', 'environmental objectives'],
    thresholds: ['financial market participants', 'large companies']
  },
  'EU_ETS': {
    name: 'EU Emissions Trading System',
    category: 'environment',
    keywords: ['carbon emissions', 'greenhouse gas', 'industrial installations'],
    thresholds: ['20+ MW thermal capacity', 'aviation operations']
  },
  'CBAM': {
    name: 'Carbon Border Adjustment Mechanism',
    category: 'environment',
    keywords: ['carbon imports', 'steel', 'cement', 'fertilizers', 'aluminum'],
    thresholds: ['imports covered goods', 'carbon-intensive imports']
  },

  // Artificial Intelligence
  'AI_ACT': {
    name: 'AI Act',
    category: 'digital_technology',
    keywords: ['artificial intelligence', 'machine learning', 'automated decision'],
    thresholds: ['AI systems in EU market', 'high-risk AI applications']
  },

  // Digital Services & Platforms
  'DSA': {
    name: 'Digital Services Act',
    category: 'digital_platforms',
    keywords: ['online platform', 'content moderation', 'illegal content'],
    thresholds: ['digital services', '45M+ EU users (VLOP)']
  },
  'DMA': {
    name: 'Digital Markets Act',
    category: 'digital_platforms',
    keywords: ['gatekeeper', 'core platform services', 'market dominance'],
    thresholds: ['€7.5B+ turnover OR €75B+ market cap', '45M+ monthly users']
  },

  // Financial Services
  'MIFID_II': {
    name: 'Markets in Financial Instruments Directive II',
    category: 'financial_services',
    keywords: ['investment services', 'financial instruments', 'trading'],
    thresholds: ['investment firm', 'financial services provider']
  },
  'PSD2': {
    name: 'Payment Services Directive 2',
    category: 'financial_services',
    keywords: ['payment services', 'electronic payments', 'banking'],
    thresholds: ['payment service provider', 'payment institution']
  },
  'MICA': {
    name: 'Markets in Crypto-Assets Regulation',
    category: 'financial_services',
    keywords: ['cryptocurrency', 'digital assets', 'crypto exchange'],
    thresholds: ['crypto-asset services', 'stablecoin issuance']
  },
  'SOLVENCY_II': {
    name: 'Solvency II Directive',
    category: 'financial_services',
    keywords: ['insurance', 'reinsurance', 'solvency requirements'],
    thresholds: ['insurance undertaking', 'reinsurance undertaking']
  },

  // Cybersecurity & Infrastructure
  'NIS2': {
    name: 'Network and Information Security Directive 2',
    category: 'cybersecurity',
    keywords: ['cybersecurity', 'essential services', 'digital infrastructure'],
    thresholds: ['essential/important entities', 'medium+ enterprises in covered sectors']
  },
  'CRA': {
    name: 'Cyber Resilience Act',
    category: 'cybersecurity',
    keywords: ['connected products', 'IoT security', 'cybersecurity requirements'],
    thresholds: ['products with digital elements', 'connected devices']
  },

  // Product Safety & Compliance
  'MACHINERY_DIRECTIVE': {
    name: 'Machinery Directive',
    category: 'product_safety',
    keywords: ['machinery', 'equipment safety', 'CE marking'],
    thresholds: ['machinery placing on market']
  },
  'MEDICAL_DEVICE_REGULATION': {
    name: 'Medical Device Regulation',
    category: 'product_safety',
    keywords: ['medical devices', 'healthcare products', 'clinical evaluation'],
    thresholds: ['medical device manufacturer/importer']
  },
  'ROHS': {
    name: 'Restriction of Hazardous Substances Directive',
    category: 'product_safety',
    keywords: ['electrical equipment', 'hazardous substances', 'electronics'],
    thresholds: ['electrical and electronic equipment']
  },
  'WEEE': {
    name: 'Waste Electrical and Electronic Equipment Directive',
    category: 'environment',
    keywords: ['electronic waste', 'electrical equipment', 'recycling'],
    thresholds: ['electrical equipment producer']
  },
  'BATTERY_REGULATION': {
    name: 'Battery Regulation',
    category: 'environment',
    keywords: ['batteries', 'battery waste', 'circular economy'],
    thresholds: ['battery manufacturer/importer', 'battery-containing products']
  },

  // Chemicals & Substances
  'REACH': {
    name: 'Registration, Evaluation, Authorisation and Restriction of Chemicals',
    category: 'chemicals',
    keywords: ['chemical substances', 'chemical safety', 'registration'],
    thresholds: ['manufacture/import ≥1 tonne/year chemicals']
  },
  'CLP': {
    name: 'Classification, Labelling and Packaging Regulation',
    category: 'chemicals',
    keywords: ['chemical classification', 'hazard labeling', 'chemical mixtures'],
    thresholds: ['chemical substance/mixture supplier']
  },

  // Employment & Workers
  'POSTED_WORKERS': {
    name: 'Posted Workers Directive',
    category: 'employment',
    keywords: ['cross-border workers', 'posting workers', 'labor mobility'],
    thresholds: ['posting workers to other EU countries']
  },
  'WHISTLEBLOWER_PROTECTION': {
    name: 'Whistleblower Protection Directive',
    category: 'employment',
    keywords: ['whistleblowing', 'reporting violations', 'worker protection'],
    thresholds: ['50+ employees in EU member state']
  },
  'WORK_LIFE_BALANCE': {
    name: 'Work-Life Balance Directive',
    category: 'employment',
    keywords: ['parental leave', 'work-life balance', 'family rights'],
    thresholds: ['employers with workers']
  },

  // Consumer Protection
  'CONSUMER_RIGHTS': {
    name: 'Consumer Rights Directive',
    category: 'consumer_protection',
    keywords: ['consumer sales', 'distance selling', 'consumer contracts'],
    thresholds: ['B2C sales', 'consumer contracts']
  },
  'UNFAIR_COMMERCIAL_PRACTICES': {
    name: 'Unfair Commercial Practices Directive',
    category: 'consumer_protection',
    keywords: ['misleading advertising', 'unfair practices', 'consumer protection'],
    thresholds: ['B2C commercial practices']
  },
  'GEOBLOCKING': {
    name: 'Geo-blocking Regulation',
    category: 'consumer_protection',
    keywords: ['geo-blocking', 'cross-border access', 'discrimination'],
    thresholds: ['online services to consumers']
  },

  // Packaging & Waste
  'PACKAGING_WASTE': {
    name: 'Packaging and Packaging Waste Directive',
    category: 'environment',
    keywords: ['packaging', 'packaging waste', 'producer responsibility'],
    thresholds: ['packaging on EU market']
  },
  'SINGLE_USE_PLASTICS': {
    name: 'Single-Use Plastics Directive',
    category: 'environment',
    keywords: ['single-use plastics', 'plastic pollution', 'circular economy'],
    thresholds: ['single-use plastic products']
  },

  // Transport & Mobility
  'TRANSPORT_PASSENGER_RIGHTS': {
    name: 'Transport Passenger Rights Regulations',
    category: 'transport',
    keywords: ['passenger rights', 'transport services', 'compensation'],
    thresholds: ['transport service provider']
  },

  // Energy
  'ENERGY_EFFICIENCY': {
    name: 'Energy Efficiency Directive',
    category: 'energy',
    keywords: ['energy efficiency', 'energy consumption', 'energy audits'],
    thresholds: ['large enterprises', 'energy-intensive companies']
  },
  'RENEWABLE_ENERGY': {
    name: 'Renewable Energy Directive',
    category: 'energy',
    keywords: ['renewable energy', 'green energy', 'sustainability'],
    thresholds: ['energy suppliers', 'large energy consumers']
  },

  // Trade & Customs
  'CUSTOMS_CODE': {
    name: 'Union Customs Code',
    category: 'trade',
    keywords: ['customs', 'import', 'export', 'international trade'],
    thresholds: ['import/export activities']
  },
  'DUAL_USE_REGULATION': {
    name: 'Dual-Use Export Regulation',
    category: 'trade',
    keywords: ['dual-use items', 'export controls', 'strategic goods'],
    thresholds: ['dual-use items export']
  }
};

/**
 * Analyzes assessment responses using LLM to determine applicable regulations
 * @param {Object} responses - User's assessment responses
 * @param {Object} questions - The assessment questions for context
 * @returns {Object} LLM analysis results
 */
export async function analyzeAssessmentWithLLM(responses, questions) {
  try {
    console.log('🤖 Starting LLM analysis of assessment responses...');
    
    // Prepare the context for the LLM
    const context = prepareAssessmentContext(responses, questions);
    
    const prompt = `
You are a senior EU regulatory compliance expert with deep knowledge of all European Union regulations, directives, and legal frameworks. 

Analyze this company's comprehensive assessment responses to determine ALL applicable EU regulations. Be thorough and confident in your analysis.

ASSESSMENT CONTEXT:
${context}

COMPREHENSIVE EU REGULATION KNOWLEDGE BASE:
${JSON.stringify(COMPREHENSIVE_EU_REGULATIONS, null, 2)}

ANALYSIS INSTRUCTIONS:

1. **THOROUGHNESS**: Review ALL assessment responses systematically. Consider both direct and indirect regulatory triggers.

2. **CONFIDENCE BUILDING**: Use multiple data points to build confidence:
   - Company size and financial thresholds
   - Business activities and sector specifics  
   - Geographic presence and operations
   - Technology usage and data processing
   - Product/service characteristics
   - Supply chain and business relationships

3. **REGULATION CATEGORIES TO ANALYZE**:
   - Data Protection & Privacy (GDPR, ePrivacy)
   - Sustainability & Environment (CSRD, EU Taxonomy, EU ETS, CBAM, WEEE, etc.)
   - Digital Technology & AI (AI Act, DSA, DMA, CRA)
   - Financial Services (MiFID II, PSD2, MiCA, Solvency II)
   - Cybersecurity & Infrastructure (NIS2, CRA)
   - Product Safety & Compliance (CE marking, Medical Device Regulation, etc.)
   - Chemicals & Substances (REACH, CLP)
   - Employment & Workers (Posted Workers, Whistleblower Protection)
   - Consumer Protection (Consumer Rights, Unfair Commercial Practices)
   - Energy & Environment (Energy Efficiency, Renewable Energy)
   - Trade & Customs (Union Customs Code, Dual-Use)
   - Transport & Mobility
   - And ALL other applicable EU regulations

4. **CONFIDENCE SCORING**:
   - 0.95-1.0: Clear regulatory trigger, meets all thresholds
   - 0.85-0.94: Strong indicators, likely applicable
   - 0.70-0.84: Moderate confidence, some uncertainty
   - 0.50-0.69: Possible applicability, needs further investigation
   - Below 0.50: Unlikely to apply

5. **PRIORITY ASSESSMENT**:
   - HIGH: Immediate compliance obligations, significant penalties
   - MEDIUM: Important compliance requirements, moderate timeline
   - LOW: Future or minor compliance obligations

REQUIRED JSON RESPONSE FORMAT:
{
  "applicable_regulations": [
    {
      "code": "REGULATION_CODE",
      "name": "Full Regulation Name",
      "confidence": 0.95,
      "triggers": ["Specific trigger from assessment", "Another trigger"],
      "reasoning": "Detailed explanation of why this regulation applies, referencing specific assessment responses",
      "priority": "high|medium|low",
      "category": "regulation_category",
      "key_obligations": ["Main compliance requirement 1", "Main compliance requirement 2"],
      "thresholds_met": ["Specific threshold analysis"],
      "next_steps": ["Immediate action required", "Assessment needed"]
    }
  ],
  "regulatory_summary": {
    "total_regulations": 0,
    "high_priority": 0,
    "medium_priority": 0,
    "low_priority": 0,
    "categories_affected": ["category1", "category2"]
  },
  "risk_assessment": {
    "overall_risk_level": "low|medium|high|critical",
    "compliance_complexity": "low|medium|high",
    "regulatory_burden": "light|moderate|heavy",
    "key_risk_areas": ["area1", "area2"]
  },
  "executive_summary": "2-3 sentence overview of the company's regulatory landscape and key compliance priorities",
  "immediate_actions": ["Most urgent compliance actions needed"],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "Specific recommendation",
      "regulation": "REGULATION_CODE",
      "timeline": "immediate|3-6 months|6-12 months"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Include ALL applicable regulations, not just major ones
- Each regulation should appear ONLY ONCE in the applicable_regulations array
- If a regulation applies for multiple reasons, combine all triggers and reasoning into a single entry
- Provide detailed reasoning for each regulation
- Be specific about which assessment responses triggered each regulation
- Ensure confidence scores are realistic and well-justified
- Focus on actionable insights and next steps

Analyze this company comprehensively now:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert EU regulatory compliance analyst. Provide accurate, detailed analysis in valid JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0, // Low temperature for consistent analysis
      max_tokens: 4000,
    });

    const analysisText = completion.choices[0].message.content;
    console.log('🤖 Raw LLM response:', analysisText);

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse LLM response as JSON:', parseError);
      throw new Error('Invalid JSON response from LLM');
    }

    // Process and categorize regulations
    const result = processLLMAnalysis(analysis);
    
    console.log('✅ LLM analysis completed successfully');
    return result;

  } catch (error) {
    console.error('❌ LLM analysis failed:', error);
    
    // Fallback to rule-based analysis if LLM fails
    console.log('🔄 Falling back to rule-based analysis...');
    return getFallbackAnalysis(responses);
  }
}

/**
 * Prepares assessment context for LLM analysis
 */
function prepareAssessmentContext(responses, questions) {
  let context = "COMPANY ASSESSMENT RESPONSES:\n\n";
  
  // Group responses by section for better organization
  const questionMap = {};
  questions.forEach(section => {
    section.questions.forEach(q => {
      questionMap[q.id] = { ...q, section: section.section };
    });
  });

  Object.entries(responses).forEach(([questionId, responseData]) => {
    const question = questionMap[questionId];
    if (question) {
      context += `Section: ${question.section}\n`;
      context += `Question: ${question.text}\n`;
      context += `Answer: ${responseData.value}\n`;
      context += `Type: ${question.type}\n\n`;
    }
  });

  return context;
}

/**
 * Deduplicates regulations by code, merging information from duplicates
 * @param {Array} regulations - Array of regulation objects
 * @returns {Array} Deduplicated regulations with merged information
 */
function deduplicateRegulations(regulations) {
  const regulationMap = new Map();
  
  regulations.forEach(reg => {
    const code = reg.code;
    
    if (regulationMap.has(code)) {
      // Merge with existing regulation
      const existing = regulationMap.get(code);
      
      // Merge triggers (remove duplicates)
      const allTriggers = [...(existing.triggers || []), ...(reg.triggers || [])];
      const uniqueTriggers = [...new Set(allTriggers)];
      
      // Merge reasoning
      const combinedReasoning = existing.reasoning && reg.reasoning 
        ? `${existing.reasoning} ${reg.reasoning}`.trim()
        : existing.reasoning || reg.reasoning;
      
      // Merge key obligations
      const allObligations = [...(existing.key_obligations || []), ...(reg.key_obligations || [])];
      const uniqueObligations = [...new Set(allObligations)];
      
      // Merge next steps
      const allNextSteps = [...(existing.next_steps || []), ...(reg.next_steps || [])];
      const uniqueNextSteps = [...new Set(allNextSteps)];
      
      // Use highest confidence
      const maxConfidence = Math.max(existing.confidence || 0, reg.confidence || 0);
      
      // Use highest priority (high > medium > low)
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const existingPriority = priorityOrder[existing.priority] || 1;
      const newPriority = priorityOrder[reg.priority] || 1;
      const finalPriority = existingPriority >= newPriority ? existing.priority : reg.priority;
      
      // Update the existing regulation with merged data
      regulationMap.set(code, {
        ...existing,
        confidence: maxConfidence,
        triggers: uniqueTriggers,
        reasoning: combinedReasoning,
        priority: finalPriority,
        key_obligations: uniqueObligations,
        next_steps: uniqueNextSteps,
        // Keep other fields from the existing regulation
        thresholds_met: existing.thresholds_met || reg.thresholds_met,
        category: existing.category || reg.category
      });
      
      console.log(`🔄 Merged duplicate regulation: ${code}`);
    } else {
      // First occurrence of this regulation
      regulationMap.set(code, { ...reg });
    }
  });
  
  return Array.from(regulationMap.values());
}

/**
 * Processes LLM analysis results and categorizes regulations
 */
function processLLMAnalysis(analysis) {
  const applicableRegulations = analysis.applicable_regulations || [];
  
  // Deduplicate regulations by code, merging information from duplicates
  const deduplicatedRegulations = deduplicateRegulations(applicableRegulations);
  
  // Extract regulation codes
  const allApplicable = deduplicatedRegulations.map(reg => reg.code);
  
  // Categorize into supported vs unsupported
  const supported = allApplicable.filter(code => SUPPORTED_REGULATIONS.includes(code));
  const unsupported = allApplicable.filter(code => !SUPPORTED_REGULATIONS.includes(code));

  // Update the analysis object with deduplicated regulations
  const updatedAnalysis = {
    ...analysis,
    applicable_regulations: deduplicatedRegulations
  };

  return {
    llm_analysis: updatedAnalysis,
    applicable_regulations: allApplicable,
    supported_regulations: supported,
    unsupported_regulations: unsupported,
    summary: analysis.summary,
    risk_level: analysis.risk_level,
    recommendations: analysis.recommendations || [],
    processed_at: new Date().toISOString()
  };
}

/**
 * Fallback rule-based analysis if LLM fails
 */
function getFallbackAnalysis(responses) {
  console.log('📋 Using fallback rule-based analysis');
  
  const applicable = [];

  // GDPR Analysis
  if (
    responses["gdpr-scope"]?.value ||
    responses["gdpr-special"]?.value ||
    responses["gdpr-transfers"]?.value ||
    responses["eprivacy-marketing"]?.value
  ) {
    applicable.push({
      code: "GDPR",
      name: "General Data Protection Regulation",
      confidence: 0.9,
      triggers: ["Processes personal data of EU individuals"],
      reasoning: "Rule-based analysis: Company processes personal data",
      priority: "high",
      category: "data_protection"
    });
  }

  // CSRD Analysis
  if (
    responses["csrd-thresholds"]?.value ||
    responses["csrd-non-eu"]?.value ||
    responses["csrd-consolidated"]?.value
  ) {
    applicable.push({
      code: "CSRD",
      name: "Corporate Sustainability Reporting Directive",
      confidence: 0.85,
      triggers: ["Meets CSRD reporting thresholds"],
      reasoning: "Rule-based analysis: Company meets CSRD criteria",
      priority: "medium",
      category: "sustainability"
    });
  }

  // AI Act Analysis
  if (
    responses["aia-deploy"]?.value ||
    responses["aia-highrisk"]?.value ||
    responses["aia-transparency"]?.value
  ) {
    applicable.push({
      code: "AI_ACT",
      name: "AI Act",
      confidence: 0.8,
      triggers: ["Uses AI systems in EU market"],
      reasoning: "Rule-based analysis: Company uses AI systems",
      priority: "medium",
      category: "artificial_intelligence"
    });
  }

  const allApplicable = applicable.map(reg => reg.code);
  const supported = allApplicable.filter(code => SUPPORTED_REGULATIONS.includes(code));
  const unsupported = allApplicable.filter(code => !SUPPORTED_REGULATIONS.includes(code));

  return {
    llm_analysis: {
      applicable_regulations: applicable,
      summary: "Analysis based on rule-based fallback system",
      risk_level: applicable.length > 2 ? "high" : applicable.length > 0 ? "medium" : "low",
      recommendations: ["Complete detailed regulatory assessment", "Consult with compliance experts"],
      fallback_used: true
    },
    applicable_regulations: allApplicable,
    supported_regulations: supported,
    unsupported_regulations: unsupported,
    processed_at: new Date().toISOString()
  };
}
