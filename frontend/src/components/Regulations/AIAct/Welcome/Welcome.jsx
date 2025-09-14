import { BsCalendar } from "react-icons/bs";
import "./Welcome.css";

const WelcomeAI = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="ai-welcome-container">
      {/* Header Section */}
      <div className="ai-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="ai-title">EU AI Act</h1>
            <p className="ai-subtitle">A risk-based framework for trustworthy AI in the EU</p>
            <p className="ai-oneliner">
              The AI Act classifies AI systems by risk and sets obligations to protect safety, 
              fundamental rights, and transparency.
            </p>
          </div>
          <div className="header-stats">
            <div className="date-display">
              <BsCalendar className="calendar-icon" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="ai-overview-section">
        <div className="overview-content">
          <h2 className="section-title">Overview</h2>
          <p className="section-text">
            The EU's Artificial Intelligence Act introduces a horizontal, risk-based framework for AI systems 
            placed on, put into service in, or used in the EU.
          </p>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="ai-info-grid">
        <div className="info-card">
          <h3>Scope and risk categories</h3>
          <ul>
            <li><strong>Unacceptable risk:</strong> prohibited uses (e.g., certain manipulative or social scoring practices)</li>
            <li><strong>High risk:</strong> stringent requirements (risk management, data quality, documentation, human oversight, robustness, CE marking)</li>
            <li><strong>Limited risk:</strong> transparency duties (e.g., AI that interacts with humans or generates content)</li>
            <li><strong>Minimal risk:</strong> voluntary codes of conduct encouraged</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Key obligations (high-risk focus)</h3>
          <ul>
            <li>Risk management and data governance</li>
            <li>Technical documentation and record-keeping</li>
            <li>Human oversight and accuracy/robustness/cybersecurity</li>
            <li>Post-market monitoring and incident reporting; conformity assessment and CE marking</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Timelines</h3>
          <p>The Act enters into force with staggered application deadlines, with core high-risk obligations phasing in after publication (organizations should begin readiness now).</p>
        </div>
        <div className="info-card raylow-help">
          <h3>How Raylow helps</h3>
          <p>We help catalog your AI systems, determine risk categories, generate the required documentation, and operationalize governance and monitoring workflows.</p>
        </div>
      </div>

    </div>
  );
};

export default WelcomeAI;


