import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import screeningQuestions from "../Resume_Page/data/comprehensive_screening_questions.json";
import "./RegulatoryAssessment.css";


const RegulatoryAssessment = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  console.log('🚀 Component rendered, user from Redux:', user);
  console.log('🚀 User type:', typeof user, 'User keys:', user ? Object.keys(user) : 'null');
  
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false); // New state for LLM processing
  const [processingStep, setProcessingStep] = useState(1); // Track processing steps
  const [error, setError] = useState(null);
  const [applicableRegulations, setApplicableRegulations] = useState([]);

  const sections = screeningQuestions;
  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  // Load existing assessment when component mounts
  useEffect(() => {
    console.log('🔥 useEffect triggered! User dependency changed:', user);
    
    const loadAssessment = async () => {
      console.log('🔍 Debug - User object:', user);
      console.log('🔍 Debug - User ID:', user?.id);
      console.log('🔍 Debug - Full user object keys:', user ? Object.keys(user) : 'no user');
      
      if (!user?.uid) {
        console.log('❌ No user ID found, stopping assessment load');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Debug - Making API call to:', `http://localhost:3001/api/assessments/${user.uid}`);
        const response = await fetch(`http://localhost:3001/api/assessments/${user.uid}`);
        
        console.log('🔍 Debug - Response status:', response.status);
        console.log('🔍 Debug - Response OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ API Error Response:', errorText);
          throw new Error(`Failed to load assessment: ${response.status} - ${errorText}`);
        }
        
        const assessment = await response.json();
        console.log('✅ Assessment loaded:', assessment);
        setAssessmentId(assessment.id);
        
        // Convert backend responses format to frontend format
        const frontendAnswers = {};
        Object.entries(assessment.responses || {}).forEach(([questionId, responseData]) => {
          frontendAnswers[questionId] = responseData.value;
        });
        
        setAnswers(frontendAnswers);
        setError(null);
      } catch (err) {
        console.error('Error loading assessment:', err);
        setError('Failed to load assessment. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [user]);

  // Debounce timer for saving
  const [saveTimeouts, setSaveTimeouts] = useState({});

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []); // Only run on unmount

  const handleAnswer = async (questionId, value) => {
    console.log('🔍 Debug - Answer changed:', questionId, '=', value);
    console.log('🔍 Debug - Current assessment ID:', assessmentId);
    
    // Update local state immediately for responsive UI
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear existing timeout for this question
    if (saveTimeouts[questionId]) {
      clearTimeout(saveTimeouts[questionId]);
    }

    // Save to backend with debouncing to reduce server calls and UI jumps
    if (assessmentId) {
      const timeoutId = setTimeout(async () => {
        try {
          setSaving(true);
          console.log('🔍 Debug - Saving answer to backend');
          const response = await fetch(`http://localhost:3001/api/assessments/${assessmentId}/responses`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ questionId, value }),
          });

          if (!response.ok) {
            throw new Error('Failed to save answer');
          }

          setError(null);
        } catch (err) {
          console.error('Error saving answer:', err);
          setError('Failed to save answer. Your progress may not be saved.');
        } finally {
          setSaving(false);
        }
      }, 800); // Wait 800ms after user stops typing

      setSaveTimeouts(prev => ({
        ...prev,
        [questionId]: timeoutId
      }));
    }
  };

  const handleNext = async () => {
    if (isLastSection) {
      // Submit assessment and show results
      await submitAssessment();
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    console.log('🔍 Debug - Attempting to submit assessment');
    console.log('🔍 Debug - Assessment ID:', assessmentId);
    
    if (!assessmentId) {
      console.log('❌ No assessment ID found');
      setError('Unable to submit assessment. Please try refreshing the page.');
      return;
    }

    try {
      setProcessing(true); // Show processing screen
      setProcessingStep(1);
      
      // Step 2: AI analysis progress simulation
      setTimeout(() => setProcessingStep(2), 500);
      
      // Submit assessment to backend
      console.log('🔍 Debug - Submitting to:', `http://localhost:3001/api/assessments/${assessmentId}/submit`);
      const submitResponse = await fetch(`http://localhost:3001/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Debug - Submit response status:', submitResponse.status);

      if (!submitResponse.ok) {
        throw new Error('Failed to submit assessment');
      }

      const submitData = await submitResponse.json();
      console.log('✅ Assessment submitted successfully:', submitData);
      
      // Step 3: Generate recommendations (backend has completed LLM analysis)
      setProcessingStep(3);
      setTimeout(() => {
        // Step 4: Redirect preparation
        setProcessingStep(4);
        setTimeout(() => {
          console.log('🏠 Redirecting to homepage with personalized recommendations...');
          navigate('/dashboard');
        }, 1500);
      }, 800);
      
      setError(null);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
      setProcessing(false);
      setProcessingStep(1);
    }
  };

  // Results are now stored in state from backend API

  const renderInput = (question) => {
    const { id, type, options, help } = question;
    const value = answers[id] || "";

    switch (type) {
      case "boolean":
        return (
          <div className="input-wrapper">
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={id}
                  value="yes"
                  checked={value === "yes"}
                  onChange={(e) => handleAnswer(id, e.target.value)}
                />
                <span>Yes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={id}
                  value="no"
                  checked={value === "no"}
                  onChange={(e) => handleAnswer(id, e.target.value)}
                />
                <span>No</span>
              </label>
            </div>
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "select":
        return (
          <div className="input-wrapper">
            <select
              className="select-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
            >
              <option value="">Please select...</option>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "multi-select":
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div className="input-wrapper">
            <div className="multi-select-group">
              {options?.map((option) => (
                <label key={option} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      handleAnswer(id, newValues);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "country-select":
        const countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Iceland", "Liechtenstein", "Norway", "United Kingdom", "United States", "Canada", "China", "India", "Other"];
        return (
          <div className="input-wrapper">
            <select
              className="select-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
            >
              <option value="">Please select a country...</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "number":
        return (
          <div className="input-wrapper">
            <input
              type="number"
              className="number-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
              placeholder="Enter number"
            />
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "currency":
        return (
          <div className="input-wrapper">
            <input
              type="text"
              className="currency-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
              placeholder="e.g., €40,000,000"
            />
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      case "multi":
        return (
          <div className="input-wrapper">
            <textarea
              className="multi-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
              placeholder="Please provide details..."
              rows={3}
            />
            {help && <div className="input-help">{help}</div>}
          </div>
        );

      default:
        return (
          <div className="input-wrapper">
            <input
              type="text"
              className="text-input"
              value={value}
              onChange={(e) => handleAnswer(id, e.target.value)}
              placeholder="Enter your answer"
            />
            {help && <div className="input-help">{help}</div>}
          </div>
        );
    }
  };

  // Processing state - LLM analysis in progress
  if (processing) {
    return (
      <div className="assessment-wrap">
        <div className="assessment-container">
          <div className="processing-section">
            <div className="processing-animation">
              <div className="processing-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <div className="processing-icon">🤖</div>
            </div>
            
            <h1>Analyzing Your Regulatory Profile</h1>
            <p className="processing-description">
              Our AI is analyzing your responses against all EU regulations to provide you with a comprehensive compliance assessment.
            </p>
            
            <div className="processing-steps">
              <div className={`step ${processingStep >= 1 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep > 1 ? '✓' : <div className="mini-spinner"></div>}
                </div>
                <span>Assessment submitted</span>
              </div>
              <div className={`step ${processingStep >= 2 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep > 2 ? '✓' : processingStep === 2 ? <div className="mini-spinner"></div> : '🤖'}
                </div>
                <span>AI analysis in progress</span>
              </div>
              <div className={`step ${processingStep >= 3 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep > 3 ? '✓' : processingStep === 3 ? <div className="mini-spinner"></div> : '⏳'}
                </div>
                <span>Generating recommendations</span>
              </div>
              <div className={`step ${processingStep >= 4 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep === 4 ? <div className="mini-spinner"></div> : '🏠'}
                </div>
                <span>Redirect to homepage</span>
              </div>
            </div>
            
            <div className="processing-info">
              <p>{processingStep === 1 ? 'Submitting your assessment...' : 
                 processingStep === 2 ? 'Analyzing against 50+ EU regulations...' :
                 processingStep === 3 ? 'Generating personalized recommendations...' :
                 'Preparing your dashboard...'}</p>
              <div className="confidence-indicator">
                <span>Confidence Level: High</span>
                <div className="confidence-bar">
                  <div className="confidence-fill"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !user) {
    return (
      <div className="assessment-wrap">
        <div className="assessment-container">
          <div className="results-section">
            <h1>Please log in to access the assessment</h1>
            <button className="back-btn" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="assessment-wrap">
        <div className="assessment-container">
          <div className="results-section">
            <h1>Loading Assessment...</h1>
            <p>Please wait while we load your assessment data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="assessment-wrap">
        <div className="assessment-container">
          <div className="results-section">
            <h1>Assessment Complete</h1>
            <p>Based on your answers, here are the EU regulations that likely apply to your organisation:</p>
            
            {applicableRegulations.length > 0 ? (
              <div className="regulations-list">
                {applicableRegulations.map((regulation, index) => (
                  <div key={index} className="regulation-card">
                    <h3>{regulation.regulation}</h3>
                    <p>Confidence: {Math.round(regulation.confidence * 100)}%</p>
                    <p>Priority: {regulation.priority}</p>
                    {regulation.reasons && (
                      <ul>
                        {regulation.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    )}
                    <button 
                      className="regulation-btn"
                      onClick={() => navigate(`/dashboard/${regulation.regulation.toLowerCase().replace(' ', '-')}`)}
                    >
                      Explore {regulation.regulation}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-regulations">
                <p>Based on your answers, you may have limited EU regulatory exposure. However, we recommend reviewing our guidance to ensure comprehensive compliance.</p>
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-wrap">
      <div className="assessment-container">
        {error && (
          <div className="error-message" style={{ 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            color: '#c33'
          }}>
            {error}
          </div>
        )}
        
        <div className="saving-indicator-container" style={{ 
          height: '3rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {saving && (
            <div className="saving-indicator" style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #e0f2fe', 
              borderRadius: '8px',
              color: '#0369a1',
              textAlign: 'center',
              fontSize: '0.9rem',
              opacity: saving ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              💾 Saving your answer...
            </div>
          )}
        </div>

        {currentSection === 0 && (
          <div className="welcome-header">
            <h1>Welcome to Raylow</h1>
            <p>Let's find out what regulations apply to you</p>
            <p className="welcome-subtitle">
              Answer a few quick questions and we'll route you to the exact EU regulations that apply to your organisation.
            </p>
          </div>
        )}
        
        <div className="assessment-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Section {currentSection + 1} of {sections.length}
          </span>
        </div>

        <div className="section-content">
          <h1>{currentSectionData.section}</h1>
          {currentSectionData.description && (
            <p className="section-description">{currentSectionData.description}</p>
          )}
          
          <div className="questions-list">
            {currentSectionData.questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <label className="question-label">
                  {question.text}
                  {question.required && <span className="required-indicator"> *</span>}
                </label>
                {renderInput(question)}
              </div>
            ))}
          </div>
        </div>

        <div className="assessment-actions">
          {currentSection > 0 && (
            <button className="prev-btn" onClick={handlePrevious}>
              Previous
            </button>
          )}
          <button className="next-btn" onClick={handleNext}>
            {isLastSection ? "Complete Assessment" : "Next Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryAssessment;
