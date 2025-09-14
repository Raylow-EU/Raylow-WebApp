import { BsCalendar } from "react-icons/bs";
import "./Welcome.css";

const WelcomeCSRD = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="csrd-welcome-container">
      {/* Header Section */}
      <div className="csrd-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="csrd-title">CSRD</h1>
            <p className="csrd-subtitle">Elevating sustainability reporting with ESRS</p>
            <p className="csrd-oneliner">
              The CSRD expands who must report ESG information, mandates European Sustainability 
              Reporting Standards (ESRS), and brings assurance and digital tagging.
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
      <div className="csrd-overview-section">
        <div className="overview-content">
          <h2 className="section-title">Overview</h2>
          <p className="section-text">
            The Corporate Sustainability Reporting Directive updates and broadens EU sustainability 
            reporting, ensuring comparable, decision-useful information for stakeholders.
          </p>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="csrd-info-grid">
        <div className="info-card">
          <h3>Who must report (phased)</h3>
          <p>Large public-interest entities first, followed by other large companies and listed SMEs (with certain opt-outs and timelines). Non-EU companies with significant EU activity may also be in scope.</p>
        </div>
        <div className="info-card">
          <h3>Key requirements</h3>
          <ul>
            <li>Double materiality assessment (impacts and financial materiality)</li>
            <li>ESRS-aligned disclosures (environment, social, governance)</li>
            <li>Limited (and later reasonable) assurance over reported information</li>
            <li>Digital, machine-readable tagging and filing</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Timelines (high level)</h3>
          <p>Reporting phases in over several years based on company type and size; early cohorts started with FY2024 reporting.</p>
        </div>
        <div className="info-card raylow-help">
          <h3>How Raylow helps</h3>
          <p>We streamline double materiality assessments, map ESRS requirements to your data, set up collection/controls, and prepare assured, digitally tagged reports.</p>
        </div>
      </div>

    </div>
  );
};

export default WelcomeCSRD;


