import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import flashcardsData from "./data_CSRD_flashcards/esrs_flashcards.json";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatModal from "../../../../features/chat/ChatModal";
import "./Flashcards.css";

const QuestionRenderer = ({ question }) => {
  const parts = question
    .split("•")
    .map((part) => part.trim())
    .filter((part) => part);

  if (parts.length === 1) {
    return <div className="question-text">{parts[0]}</div>;
  }

  const [mainQuestion, ...bullets] = parts;
  return (
    <div className="structured-question">
      <div className="main-question">{mainQuestion}</div>
      <ul className="question-bullets">
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
};

QuestionRenderer.propTypes = {
  question: PropTypes.string.isRequired,
};

const InputForType = ({ type, value, onChange }) => {
  const getPlaceholder = (typeName) => {
    switch (typeName) {
      case "numeric":
        return "Enter a number...";
      case "multiple choice":
        return "Enter your choice...";
      case "date":
        return "";
      case "hyperlink":
        return "https://example.com";
      case "table":
        return "You can structure your response as a table or list...";
      default:
        return "Type your answer here...";
    }
  };

  switch (type) {
    case "numeric":
      return (
        <input
          type="number"
          className="flashcard-input"
          placeholder={getPlaceholder(type)}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "multiple choice":
      return (
        <input
          type="text"
          className="flashcard-input"
          placeholder={getPlaceholder(type)}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return (
        <input
          type="date"
          className="flashcard-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "hyperlink":
      return (
        <input
          type="url"
          className="flashcard-input"
          placeholder={getPlaceholder(type)}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <textarea
          className="flashcard-textarea"
          placeholder={getPlaceholder(type)}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

InputForType.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const Flashcards = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  const card = flashcardsData[index];
  const total = flashcardsData.length;
  const progress = ((index + 1) / total) * 100;

  // Load existing assessment when component mounts
  useEffect(() => {
    const loadAssessment = async () => {
      if (!user?.uid) {
        console.log('❌ No user ID found, stopping assessment load');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/regulation-assessments/user/${user.uid}/csrd`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to load assessment: ${response.status}`);
        }
        
        const assessment = await response.json();
        console.log('✅ CSRD assessment loaded:', assessment);
        setAssessmentId(assessment.id);
        
        // Convert backend responses format to frontend format
        const frontendAnswers = {};
        Object.entries(assessment.responses || {}).forEach(([questionId, responseData]) => {
          frontendAnswers[questionId] = responseData.value;
        });
        
        setAnswers(frontendAnswers);
      } catch (err) {
        console.error('Error loading CSRD assessment:', err);
        setErrorMessage('Failed to load assessment. Please try refreshing the page.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [user]);

  // Debounce timer for saving
  const [saveTimeouts, setSaveTimeouts] = useState({});

  const handleAnswerChange = async (value) => {
    const questionId = card.esrs_reference;
    
    // Update local state immediately
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Clear existing timeout for this question
    if (saveTimeouts[questionId]) {
      clearTimeout(saveTimeouts[questionId]);
    }
    
    // Set new timeout to save after 1 second of no typing
    const timeoutId = setTimeout(async () => {
      if (!assessmentId) {
        console.log('⚠️ No assessment ID yet, skipping save');
        return;
      }
      
      try {
        setSaving(true);
        const response = await fetch(
          `http://localhost:3001/api/regulation-assessments/${assessmentId}/responses`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, value }),
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to save response');
        }
        
        console.log(`✅ Saved answer for ${questionId}`);
      } catch (err) {
        console.error('Error saving response:', err);
        setErrorMessage('Failed to save your answer. Please try again.');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } finally {
        setSaving(false);
      }
    }, 1000);
    
    setSaveTimeouts((prev) => ({ ...prev, [questionId]: timeoutId }));
  };

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts).forEach(clearTimeout);
    };
  }, [saveTimeouts]);

  const next = () => {
    if (index < total - 1) setIndex(index + 1);
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("You must be logged in to submit your responses.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    if (!assessmentId) {
      setErrorMessage("Unable to submit assessment. Please try refreshing the page.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    setSubmitting(true);
    setShowError(false);
    setProcessing(true);
    setProcessingStep(1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingStep(2);
      
      const response = await fetch(
        `http://localhost:3001/api/regulation-assessments/${assessmentId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      
      const data = await response.json();
      console.log('✅ CSRD assessment submitted successfully:', data);
      
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      navigate(`/dashboard/csrd/results/${assessmentId}`);
    } catch (e) {
      console.error('Error submitting assessment:', e);
      setErrorMessage("Failed to submit your responses. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setAnswers({});
    setCompleted(false);
    setShowSuccess(false);
    setShowError(false);
  };

  const handleAIAssistantClick = () => setIsChatModalOpen(true);

  if (loading) {
    return (
      <div className="flashcards-container">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading your CSRD assessment...</p>
        </div>
      </div>
    );
  }

  if (processing) {
    const steps = [
      { title: 'Analyzing your sustainability responses...', icon: '🔍' },
      { title: 'Generating personalized recommendations...', icon: '✨' },
      { title: "Let's dive right in!", icon: '🚀' }
    ];
    const currentStep = steps[processingStep - 1];
    return (
      <div className="processing-overlay">
        <div className="processing-modal">
          <div className="processing-icon">{currentStep.icon}</div>
          <h2 className="processing-title">{currentStep.title}</h2>
          <div className="processing-progress">
            {steps.map((step, index) => (
              <div key={index} className={`progress-dot ${index + 1 <= processingStep ? 'active' : ''}`}
                style={{ backgroundColor: index + 1 <= processingStep ? '#f85a2b' : '#e2e8f0' }} />
            ))}
          </div>
          <div className="processing-spinner" style={{ borderTopColor: '#f85a2b' }} />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flashcards-container">
        <div className="completion-screen">
          <h2>🎉 Congratulations!</h2>
          <p>You've successfully completed all {total} questions in the ESRS assessment.</p>
          <p>Your responses have been saved and will be used to generate your compliance report.</p>
          {showSuccess && <div className="success-message">✅ Your responses have been successfully saved!</div>}
          <button className="restart-button" onClick={restart}>Review Answers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcards-container">
      <div className="flashcard-header">
        <h1>CSRD Compliance Assessment</h1>
        <p>Answer these questions to help us understand your company's sustainability practices and generate your compliance report.</p>
        {saving && <div className="auto-save-indicator">💾 Saving...</div>}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="flashcard">
        <div className="flashcard-number">Question {index + 1} of {total}</div>
        <div className="flashcard-topic">
          <h3>{card.topic}</h3>
        </div>
        <div className="flashcard-question">
          <QuestionRenderer question={card.question} />
        </div>
        <div className="flashcard-input-section">
          <InputForType type={card.answer_type} value={answers[card.esrs_reference]} onChange={handleAnswerChange} />
        </div>

        <div className="ai-assistant-prompt" onClick={handleAIAssistantClick}>
          <div className="ai-icon">🤖</div>
          <div className="ai-assistant-text">
            <p className="main-text">Have doubts about specific terms or questions?</p>
            <p className="sub-text">Chat with our specialized ESRS assistant for instant help!</p>
          </div>
          <div className="ai-chat-arrow">→</div>
        </div>

        <div className="flashcard-nav">
          <button className="nav-button prev-button" onClick={prev} disabled={index === 0}>← Previous</button>
          {index < total - 1 ? (
            <button className="nav-button next-button" onClick={next}>Next →</button>
          ) : (
            <button className={`nav-button submit-button ${submitting ? "loading-state" : ""}`} onClick={handleSubmit} disabled={submitting}>
              {submitting ? (<><div className="loading-spinner" />Saving...</>) : ("Submit Assessment")}
            </button>
          )}
        </div>

        <div className="flashcard-citation">
          <a href={card.citation.url} target="_blank" rel="noreferrer" className="citation-link">📖 View Source</a>
        </div>

        {showError && <div className="error-message">❌ {errorMessage}</div>}
      </div>

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        regulationType="CSRD"
      />
    </div>
  );
};

Flashcards.displayName = "Flashcards";

export default Flashcards;


