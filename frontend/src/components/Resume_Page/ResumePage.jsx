import { useNavigate } from "react-router-dom";
import "./ResumePage.css";

const ResumePage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/assessment");
  };

  return (
    <div className="resume-wrap">
      <div className="resume-hero">
        <div className="resume-content">
          <h1>Welcome back to Raylow</h1>
          
          <div className="assessment-section">
            <h2>Let's find out what regulations apply to you</h2>
            <p>
              Answer a few quick questions and we'll route you to the exact
              EU regulations that apply to your organisation.
            </p>
            <button className="resume-cta" onClick={handleClick}>
              Start assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;


