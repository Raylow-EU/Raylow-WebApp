/**
 * CSRD Results Page
 * 
 * Thin wrapper component that provides CSRD-specific configuration
 * to the shared AssessmentResults component.
 * 
 * @imports ../../RegulationResults/AssessmentResults
 * The shared component handles all UI logic and displays AI-generated
 * recommendations. This file only provides CSRD branding (colors, emoji, names).
 */

import AssessmentResults from '../../RegulationResults/AssessmentResults';

const CSRD_CONFIG = {
  id: 'csrd',
  name: 'CSRD',
  shortName: 'CSRD',
  fullName: 'Corporate Sustainability Reporting Directive',
  color: '#10b981',
  lightBg: '#f8fffe',
  emoji: '🌱',
};

const CSRDResults = () => {
  return <AssessmentResults regulationConfig={CSRD_CONFIG} />;
};

export default CSRDResults;
