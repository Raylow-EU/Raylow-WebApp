import { useState } from "react";
import { useNavigate } from "react-router-dom";
import screeningQuestions from "../Resume_Page/data/screening_questions.json";
import "./RegulatoryAssessment.css";

const RegulatoryAssessment = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const sections = screeningQuestions;
  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastSection) {
      // Process results and show applicable regulations
      setShowResults(true);
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const getApplicableRegulations = () => {
    const applicable = [];
    
    // CSRD Logic
    if (answers['csrd-thresholds'] || answers['csrd-non-eu'] || answers['csrd-consolidated']) {
      applicable.push({
        name: "CSRD",
        fullName: "Corporate Sustainability Reporting Directive",
        route: "/dashboard/csrd"
      });
    }

    // GDPR Logic  
    if (answers['gdpr-scope'] || answers['gdpr-special'] || answers['gdpr-transfers'] || answers['eprivacy-marketing']) {
      applicable.push({
        name: "GDPR",
        fullName: "General Data Protection Regulation",
        route: "/dashboard/gdpr"
      });
    }

    // AI Act Logic
    if (answers['aia-deploy'] || answers['aia-highrisk'] || answers['aia-transparency']) {
      applicable.push({
        name: "AI Act",
        fullName: "European AI Act",
        route: "/dashboard/ai-act"
      });
    }

    return applicable;
  };

  const renderInput = (question) => {
    const { id, type } = question;
    const value = answers[id] || "";

    switch (type) {
      case "boolean":
        return (
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
        );

      case "number":
        return (
          <input
            type="number"
            className="number-input"
            value={value}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="Enter number of employees"
          />
        );

      case "currency":
        return (
          <input
            type="text"
            className="currency-input"
            value={value}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="e.g., €40 million"
          />
        );

      case "multi":
        return (
          <textarea
            className="multi-input"
            value={value}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="List applicable sectors..."
            rows={3}
          />
        );

      default:
        return (
          <input
            type="text"
            className="text-input"
            value={value}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="Enter your answer"
          />
        );
    }
  };

  if (showResults) {
    const applicableRegulations = getApplicableRegulations();
    
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
                    <h3>{regulation.name}</h3>
                    <p>{regulation.fullName}</p>
                    <button 
                      className="regulation-btn"
                      onClick={() => navigate(regulation.route)}
                    >
                      Explore {regulation.name}
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
          
          <div className="questions-list">
            {currentSectionData.questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <label className="question-label">
                  {question.text}
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
