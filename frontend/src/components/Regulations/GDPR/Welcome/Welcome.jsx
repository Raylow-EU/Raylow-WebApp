import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsCalendar, BsShield } from "react-icons/bs";
import { FaUserShield, FaFileContract, FaDatabase, FaUsers } from "react-icons/fa";
import { HiArrowNarrowRight, HiCheckCircle } from "react-icons/hi";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./Welcome.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const WelcomeGDPR = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    // Demo data for GDPR
    const demo = {
      stats: {
        dataSubjects: 15420,
        complianceScore: 88,
        requestsHandled: 94,
      },
      chartData: {
        dataByCategory: { personal: 45, sensitive: 30, marketing: 25 },
        breachIncidents: 2,
      },
    };
    setDashboardData(demo);
    setLoading(false);
  }, []);

  const getFirstName = () => {
    const displayName = user?.displayName || user?.fullName;
    if (!displayName) return "User";
    return displayName.split(" ")[0];
  };

  const donutData = {
    labels: ["Personal Data", "Sensitive Data", "Marketing Data"],
    datasets: [
      {
        data: dashboardData
          ? [
              dashboardData.chartData.dataByCategory.personal,
              dashboardData.chartData.dataByCategory.sensitive,
              dashboardData.chartData.dataByCategory.marketing,
            ]
          : [45, 30, 25],
        backgroundColor: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  if (loading) {
    return (
      <div className="gdpr-loading">
        <div className="loading-spinner"></div>
        <p>Loading GDPR overview...</p>
      </div>
    );
  }

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

      {/* Dashboard Integration */}
      <div className="gdpr-dashboard-section">
        <div className="dashboard-header">
          <h2 className="section-title">Your GDPR Dashboard</h2>
          <p className="section-subtitle">Monitor your data protection compliance and privacy metrics</p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card data-subjects-card">
            <div className="stat-icon-container">
              <FaUsers className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.dataSubjects.toLocaleString() || "15,420"}</h3>
              <p>Data Subjects</p>
            </div>
            <div className="stat-change positive">
              <span>3.2% ↑</span>
            </div>
          </div>

          <div className="stat-card compliance-card">
            <div className="stat-icon-container">
              <BsShield className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.complianceScore || 88}%</h3>
              <p>GDPR Compliance</p>
            </div>
            <div className="stat-change positive">
              <span>5.1% ↑</span>
            </div>
          </div>

          <div className="stat-card requests-card">
            <div className="stat-icon-container">
              <FaFileContract className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.requestsHandled || 94}%</h3>
              <p>Requests Handled On-Time</p>
            </div>
            <div className="stat-change positive">
              <span>On track</span>
            </div>
          </div>
        </div>

        <div className="dashboard-charts-grid">
          <div className="chart-card data-by-category">
            <div className="chart-header">
              <h3>Data Processing by Category</h3>
              <span className="chart-period">Current Quarter</span>
            </div>
            <div className="chart-container">
              <div className="donut-chart-wrapper">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="donut-center">{dashboardData?.chartData.dataByCategory.personal || 45}%</div>
              </div>
              <div className="scope-legend">
                <div className="scope-items">
                  <div className="scope-item">
                    <span className="scope-dot personal-data"></span>
                    <span>Personal Data</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot sensitive-data"></span>
                    <span>Sensitive Data</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot marketing-data"></span>
                    <span>Marketing Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-items">
              <Link to="/dashboard/gdpr/flashcards" className="action-item">
                <div className="action-icon">🔐</div>
                <div className="action-content">
                  <h4>Start Assessment</h4>
                  <p>Begin your GDPR compliance assessment</p>
                </div>
                <HiArrowNarrowRight className="action-arrow" />
              </Link>
              <div className="action-item">
                <div className="action-icon">🗺️</div>
                <div className="action-content">
                  <h4>Data Mapping</h4>
                  <p>Map your data flows and processing activities</p>
                </div>
                <HiArrowNarrowRight className="action-arrow" />
              </div>
              <div className="action-item">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Rights Requests</h4>
                  <p>Manage data subject rights requests</p>
                </div>
                <HiArrowNarrowRight className="action-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGDPR;


