/**
 * AssessmentResults - Shared Results Component for All Regulations
 * 
 * @purpose
 * This component displays AI-generated personalized recommendations after a user
 * completes a regulation assessment (AI Act, CSRD, or GDPR flashcards).
 * 
 * @architecture Why This Component is Shared:
 * ────────────────────────────────────────
 * 1. **DRY Principle**: All three regulations have identical results structure:
 *    - Executive Summary
 *    - Strengths (what user is doing well)
 *    - Quick Wins (easy actions)
 *    - Priority Actions (detailed roadmap)
 *    - Compliance Roadmap (3-phase plan)
 *    - Raylow Support (how we help)
 *    - Resources
 * 
 * 2. **Single Source of Truth**: 
 *    - One place to update styling, add features, fix bugs
 *    - Consistent UX across all regulations
 *    - Reduces maintenance burden (3 files → 1 file)
 * 
 * 3. **Regulation-Specific Customization**:
 *    - Each regulation passes its own `regulationConfig` prop
 *    - Config includes: colors, emoji, names, routes
 *    - Component dynamically applies regulation branding
 * 
 * 4. **Classic React Pattern**:
 *    - Component composition with props for customization
 *    - Better than duplicating 800+ lines of code 3 times
 * 
 * @usage
 * Each regulation has a thin wrapper component that imports this:
 * - AIAct/Results/Results.jsx → imports this with AI_ACT_CONFIG
 * - CSRD/Results/Results.jsx → imports this with CSRD_CONFIG
 * - GDPR/Results/Results.jsx → imports this with GDPR_CONFIG
 * 
 * @dataFlow
 * 1. User completes regulation flashcards
 * 2. Submits assessment → Backend triggers AI analysis
 * 3. Navigates to /dashboard/{regulation}/results/{assessmentId}
 * 4. This component fetches results from API
 * 5. Displays personalized recommendations with regulation colors
 * 
 * @fileLocation /frontend/src/components/Regulations/RegulationResults/
 * This folder contains shared components used by AI Act, CSRD, and GDPR
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import './AssessmentResults.css';

const AssessmentResults = ({ regulationConfig }) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!assessmentId) {
        console.log('❌ No assessment ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/regulation-assessments/${assessmentId}/results`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || `Failed to load results: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Results loaded:', data);
        setResults(data);
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [assessmentId]);

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'risk-badge-low';
      case 'medium': return 'risk-badge-medium';
      case 'high': return 'risk-badge-high';
      default: return 'risk-badge-unknown';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return '🔴 High Priority';
      case 'medium': return '🟡 Medium Priority';
      case 'low': return '🟢 Low Priority';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="results-container" style={{ '--regulation-color': regulationConfig.color }}>
        <div className="results-loading-inline">
          <div className="loading-content">
            <div className="loading-icon">{regulationConfig.emoji}</div>
            <h2>Analyzing your {regulationConfig.name} assessment...</h2>
            <p>Our AI is generating personalized recommendations for your company</p>
            <div className="loading-spinner-small" style={{ borderTopColor: regulationConfig.color }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="results-container" style={{ '--regulation-color': regulationConfig.color }}>
        <div className="results-error">
          <h2>❌ Error Loading Results</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const { llm_analysis, company_info, compliance_summary, risk_level } = results;

  return (
    <div className="results-container" style={{ '--regulation-color': regulationConfig.color }}>
      {/* Header */}
      <div className="results-header" style={{ borderColor: regulationConfig.color }}>
        <div className="header-icon" style={{ color: regulationConfig.color }}>
          {regulationConfig.emoji}
        </div>
        <div className="header-content">
          <h1>{regulationConfig.fullName} Assessment Complete!</h1>
          <p className="company-name">Results for <strong>{company_info?.name || 'Your Company'}</strong></p>
        </div>
        {risk_level && (
          <div className={`risk-badge ${getRiskBadgeClass(risk_level)}`}>
            Risk Level: {risk_level.charAt(0).toUpperCase() + risk_level.slice(1)}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {compliance_summary && (
        <div className="results-section summary-section">
          <h2>📋 Executive Summary</h2>
          <p className="summary-text">{compliance_summary}</p>
        </div>
      )}

      {/* Strengths */}
      {llm_analysis?.strengths && llm_analysis.strengths.length > 0 && (
        <div className="results-section strengths-section">
          <h2>✅ What You're Doing Well</h2>
          <ul className="strengths-list">
            {llm_analysis.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Wins */}
      {llm_analysis?.quick_wins && llm_analysis.quick_wins.length > 0 && (
        <div className="results-section quick-wins-section">
          <h2>⚡ Quick Wins</h2>
          <p className="section-subtitle">Easy actions you can take this week:</p>
          <div className="quick-wins-grid">
            {llm_analysis.quick_wins.map((win, index) => (
              <div key={index} className="quick-win-card">
                <h3>{win.action}</h3>
                <p className="win-impact"><strong>Impact:</strong> {win.impact}</p>
                <p className="win-time">⏱️ {win.time_required}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {llm_analysis?.priority_actions && llm_analysis.priority_actions.length > 0 && (
        <div className="results-section actions-section">
          <h2>🎯 Priority Actions</h2>
          <div className="actions-list">
            {llm_analysis.priority_actions.map((action, index) => (
              <div key={index} className="action-card" style={{ borderLeftColor: regulationConfig.color }}>
                <div className="action-header">
                  <h3>{action.title}</h3>
                  <span className="priority-badge">{getPriorityBadge(action.priority)}</span>
                </div>
                <p className="action-description">{action.description}</p>
                
                <div className="action-meta">
                  <div className="meta-item">
                    <strong>Why it matters:</strong> {action.why_it_matters}
                  </div>
                  <div className="meta-grid">
                    <div className="meta-item">
                      <strong>⏱️ Effort:</strong> {action.estimated_effort}
                    </div>
                    <div className="meta-item">
                      <strong>📅 Timeline:</strong> {action.suggested_timeline}
                    </div>
                  </div>
                  {action.resources_needed && action.resources_needed.length > 0 && (
                    <div className="meta-item">
                      <strong>📦 Resources needed:</strong>
                      <ul className="resources-list">
                        {action.resources_needed.map((resource, idx) => (
                          <li key={idx}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {llm_analysis?.roadmap && (
        <div className="results-section roadmap-section">
          <h2>🗺️ Your Compliance Roadmap</h2>
          <div className="roadmap-phases">
            {['phase_1', 'phase_2', 'phase_3'].map((phase, index) => {
              const phaseData = llm_analysis.roadmap[phase];
              if (!phaseData) return null;
              
              return (
                <div key={phase} className="roadmap-phase">
                  <div className="phase-number" style={{ backgroundColor: regulationConfig.color }}>
                    {index + 1}
                  </div>
                  <div className="phase-content">
                    <h3>{phaseData.name}</h3>
                    <p className="phase-goal"><strong>Goal:</strong> {phaseData.goal}</p>
                    <ul className="phase-actions">
                      {phaseData.actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raylow Support */}
      {llm_analysis?.raylow_support && (
        <div className="results-section support-section" style={{ backgroundColor: regulationConfig.lightBg }}>
          <h2>🤝 How Raylow Will Support You</h2>
          <p className="support-message">{llm_analysis.raylow_support.message}</p>
          {llm_analysis.raylow_support.next_steps_with_raylow && (
            <ul className="support-steps">
              {llm_analysis.raylow_support.next_steps_with_raylow.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Resources */}
      {llm_analysis?.resources && llm_analysis.resources.length > 0 && (
        <div className="results-section resources-section">
          <h2>📚 Helpful Resources</h2>
          <div className="resources-grid">
            {llm_analysis.resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <div className="resource-type">{resource.type}</div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="results-actions">
        <button 
          onClick={() => navigate(`/dashboard/${regulationConfig.id}/dashboard`)}
          className="primary-action-button"
          style={{ backgroundColor: regulationConfig.color }}
        >
          Go to {regulationConfig.shortName} Dashboard
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="secondary-action-button"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

AssessmentResults.propTypes = {
  regulationConfig: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    lightBg: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
  }).isRequired,
};

export default AssessmentResults;
