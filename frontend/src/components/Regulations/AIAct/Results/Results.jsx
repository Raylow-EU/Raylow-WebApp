/**
 * AI Act Results Page
 * 
 * Thin wrapper component that provides AI Act-specific configuration
 * to the shared AssessmentResults component.
 * 
 * @imports ../../RegulationResults/AssessmentResults
 * The shared component handles all UI logic and displays AI-generated
 * recommendations. This file only provides AI Act branding (colors, emoji, names).
 */

import AssessmentResults from '../../RegulationResults/AssessmentResults';

const AI_ACT_CONFIG = {
  id: 'ai-act',
  name: 'AI Act',
  shortName: 'AI Act',
  fullName: 'Artificial Intelligence Act',
  color: '#7c3aed',
  lightBg: '#faf5ff',
  emoji: '🤖',
};

const AIActResults = () => {
  return <AssessmentResults regulationConfig={AI_ACT_CONFIG} />;
};

export default AIActResults;
