/**
 * GDPR Results Page
 * 
 * Thin wrapper component that provides GDPR-specific configuration
 * to the shared AssessmentResults component.
 * 
 * @imports ../../RegulationResults/AssessmentResults
 * The shared component handles all UI logic and displays AI-generated
 * recommendations. This file only provides GDPR branding (colors, emoji, names).
 */

import AssessmentResults from '../../RegulationResults/AssessmentResults';

const GDPR_CONFIG = {
  id: 'gdpr',
  name: 'GDPR',
  shortName: 'GDPR',
  fullName: 'General Data Protection Regulation',
  color: '#0ea5e9',
  lightBg: '#f0f9ff',
  emoji: '🔒',
};

const GDPRResults = () => {
  return <AssessmentResults regulationConfig={GDPR_CONFIG} />;
};

export default GDPRResults;
