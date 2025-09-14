import { BsCalendar } from "react-icons/bs";
import "./Welcome.css";

const WelcomeGDPR = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="gdpr-welcome-container">
      {/* Header Section */}
      <div className="gdpr-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="gdpr-title">GDPR</h1>
            <p className="gdpr-subtitle">Protecting personal data and privacy across the EU and beyond</p>
            <p className="gdpr-oneliner">
              The GDPR sets a unified rulebook for how organizations collect, use, share, 
              and safeguard personal data, with strong rights for individuals and accountability duties for companies.
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
      <div className="gdpr-overview-section">
        <div className="overview-content">
          <h2 className="section-title">Overview</h2>
          <p className="section-text">
            The General Data Protection Regulation is the EU's comprehensive data protection law. 
            It applies to any organization processing EU residents' personal data, regardless of where the organization is established.
          </p>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="gdpr-info-grid">
        <div className="info-card">
          <h3>Who it applies to</h3>
          <p>Any controller or processor handling EU residents' personal data, including non-EU organizations offering goods/services to people in the EU or monitoring their behavior.</p>
        </div>
        <div className="info-card">
          <h3>Key principles</h3>
          <ul>
            <li>Lawfulness, fairness, transparency</li>
            <li>Purpose limitation and data minimization</li>
            <li>Accuracy and storage limitation</li>
            <li>Integrity, confidentiality, and accountability</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Key obligations</h3>
          <ul>
            <li>Identify a lawful basis for processing; provide clear notices</li>
            <li>Enable and respond to data subject rights requests (access, erasure, portability, objection, restriction)</li>
            <li>Implement security measures and DPIAs where needed; notify breaches</li>
            <li>Appoint a DPO where required; manage processor contracts and cross-border transfers</li>
          </ul>
        </div>
        <div className="info-card raylow-help">
          <h3>How Raylow helps</h3>
          <p>We guide you through mapping data, selecting lawful bases, managing rights requests, and documenting compliance—so your teams can operationalize GDPR seamlessly.</p>
        </div>
      </div>

    </div>
  );
};

export default WelcomeGDPR;


