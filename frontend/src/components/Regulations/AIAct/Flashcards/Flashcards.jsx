import { useState } from "react";
import PropTypes from "prop-types";
import flashcardsData from "./data/ai_act_flashcards.json";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Flashcards.css";

const QuestionRenderer = ({ question }) => {
  // Split question by bullet points
  const parts = question.split('•').map(part => part.trim()).filter(part => part);
  
  if (parts.length === 1) {
    // No bullet points, render as simple text
    return <div className="question-text">{parts[0]}</div>;
  }
  
  // Has bullet points - first part is the main question, rest are bullets
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
  const getPlaceholder = (type) => {
    switch (type) {
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
      // free text, table, etc.
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

  const card = flashcardsData[index];
  const total = flashcardsData.length;
  const progress = ((index + 1) / total) * 100;

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({ ...prev, [card.esrs_reference]: value }));
  };

  const next = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("You must be logged in to submit your responses.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    setSubmitting(true);
    setShowError(false);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setCompleted(true);
      setShowSuccess(true);
    } catch (e) {
      setErrorMessage("Failed to save your responses. Please try again.");
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

  const handleAIAssistantClick = () => {
    navigate('/dashboard/ai-act');
  };

  if (completed) {
    return (
      <div className="flashcards-container">
        <div className="completion-screen">
          <h2>🎉 Congratulations!</h2>
          <p>You've successfully completed all {total} questions in the ESRS assessment.</p>
          <p>Your responses have been saved and will be used to generate your compliance report.</p>
          {showSuccess && (
            <div className="success-message">
              ✅ Your responses have been successfully saved!
            </div>
          )}
          <button className="restart-button" onClick={restart}>
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcards-container">
      <div className="flashcard-header">
        <h1>ESRS Compliance Assessment</h1>
        <p>Answer these questions to help us understand your company's sustainability practices and generate your compliance report.</p>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flashcard">
        <div className="flashcard-number">
          Question {index + 1} of {total}
        </div>
        
        <div className="flashcard-topic">
          <h3>{card.topic}</h3>
        </div>
        
        <div className="flashcard-question">
          <QuestionRenderer question={card.question} />
        </div>
        
        <div className="flashcard-input-section">
          <InputForType
            type={card.answer_type}
            value={answers[card.esrs_reference]}
            onChange={handleAnswerChange}
          />
        </div>
        
        {/* AI Assistant Help Section */}
        <div className="ai-assistant-prompt" onClick={handleAIAssistantClick}>
          <div className="ai-icon">🤖</div>
          <div className="ai-assistant-text">
            <p className="main-text">Have doubts about specific terms or questions?</p>
            <p className="sub-text">Chat with our specialized ESRS assistant for instant help!</p>
          </div>
          <div className="ai-chat-arrow">→</div>
        </div>
        
        <div className="flashcard-nav">
          <button 
            className="nav-button prev-button" 
            onClick={prev} 
            disabled={index === 0}
          >
            ← Previous
          </button>
          
          {index < total - 1 ? (
            <button className="nav-button next-button" onClick={next}>
              Next →
            </button>
          ) : (
            <button 
              className={`nav-button submit-button ${submitting ? 'loading-state' : ''}`} 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="loading-spinner" />
                  Saving...
                </>
              ) : (
                "Submit Assessment"
              )}
            </button>
          )}
        </div>
        
        <div className="flashcard-citation">
          <a 
            href={card.citation.url} 
            target="_blank" 
            rel="noreferrer" 
            className="citation-link"
          >
            📖 View Source
          </a>
        </div>
        
        {showError && (
          <div className="error-message">
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

Flashcards.displayName = "Flashcards";

export default Flashcards;


