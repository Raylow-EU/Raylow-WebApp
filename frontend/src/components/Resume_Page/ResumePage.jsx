import { useNavigate } from "react-router-dom";
import "./ResumePage.css";

const ResumePage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard/csrd/flashcards");
  };

  return (
    <div className="resume-wrap">
      <div className="resume-hero">
        <div className="resume-copy">
          <h1>Welcome back to Raylow</h1>
          <p>
            Let us guide you to the regulations that matter most for your
            organisation.
          </p>
          <button className="resume-cta" onClick={handleClick}>
            Let's find out what regulations concern you!
          </button>
        </div>
        <div className="resume-visual" aria-hidden>
          <div className="pulse" />
          <div className="pulse pulse-2" />
          <div className="pulse pulse-3" />
        </div>
      </div>
    </div>
  );
};

export default ResumePage;


