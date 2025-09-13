import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsCalendar, BsRobot } from "react-icons/bs";
import { FaBrain, FaShield, FaEye, FaCogs } from "react-icons/fa";
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

const WelcomeAI = () => {
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
    // Demo data for AI Act
    const demo = {
      stats: {
        aiSystems: 12,
        complianceScore: 76,
        highRiskSystems: 3,
      },
      chartData: {
        riskCategories: { high: 25, limited: 40, minimal: 35 },
        systemTypes: ["Computer Vision", "NLP", "Recommendation", "Automation"],
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
    labels: ["High Risk", "Limited Risk", "Minimal Risk"],
    datasets: [
      {
        data: dashboardData
          ? [
              dashboardData.chartData.riskCategories.high,
              dashboardData.chartData.riskCategories.limited,
              dashboardData.chartData.riskCategories.minimal,
            ]
          : [25, 40, 35],
        backgroundColor: ["#7c3aed", "#a855f7", "#c084fc"],
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
      <div className="ai-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Act overview...</p>
      </div>
    );
  }

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

      {/* Dashboard Integration */}
      <div className="ai-dashboard-section">
        <div className="dashboard-header">
          <h2 className="section-title">Your AI Act Dashboard</h2>
          <p className="section-subtitle">Monitor your AI systems compliance and risk management</p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card systems-card">
            <div className="stat-icon-container">
              <BsRobot className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.aiSystems || 12}</h3>
              <p>AI Systems Catalogued</p>
            </div>
            <div className="stat-change positive">
              <span>2 new</span>
            </div>
          </div>

          <div className="stat-card compliance-card">
            <div className="stat-icon-container">
              <FaShield className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.complianceScore || 76}%</h3>
              <p>AI Act Compliance</p>
            </div>
            <div className="stat-change positive">
              <span>4.2% ↑</span>
            </div>
          </div>

          <div className="stat-card high-risk-card">
            <div className="stat-icon-container">
              <FaEye className="stat-icon" />
            </div>
            <div className="stat-info">
              <h3>{dashboardData?.stats.highRiskSystems || 3}</h3>
              <p>High-Risk Systems</p>
            </div>
            <div className="stat-change attention">
              <span>Needs attention</span>
            </div>
          </div>
        </div>

        <div className="dashboard-charts-grid">
          <div className="chart-card risk-by-category">
            <div className="chart-header">
              <h3>AI Systems by Risk Category</h3>
              <span className="chart-period">Current Portfolio</span>
            </div>
            <div className="chart-container">
              <div className="donut-chart-wrapper">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="donut-center">{dashboardData?.chartData.riskCategories.limited || 40}%</div>
              </div>
              <div className="scope-legend">
                <div className="scope-items">
                  <div className="scope-item">
                    <span className="scope-dot high-risk"></span>
                    <span>High Risk</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot limited-risk"></span>
                    <span>Limited Risk</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot minimal-risk"></span>
                    <span>Minimal Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-items">
              <Link to="/dashboard/ai-act/flashcards" className="action-item">
                <div className="action-icon">🤖</div>
                <div className="action-content">
                  <h4>Start Assessment</h4>
                  <p>Begin your AI Act compliance assessment</p>
                </div>
                <HiArrowNarrowRight className="action-arrow" />
              </Link>
              <div className="action-item">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h4>Risk Classification</h4>
                  <p>Classify your AI systems by risk category</p>
                </div>
                <HiArrowNarrowRight className="action-arrow" />
              </div>
              <div className="action-item">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Technical Documentation</h4>
                  <p>Generate required AI system documentation</p>
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

export default WelcomeAI;


