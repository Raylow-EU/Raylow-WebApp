import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BsCalendar, BsRobot } from "react-icons/bs";
import { FaShieldAlt, FaEye } from "react-icons/fa";
import { HiArrowNarrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardHome.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardHome = () => {
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


  const getFirstName = () => {
    const displayName = user?.displayName || user?.fullName;
    if (!displayName) return "User";
    return displayName.split(" ")[0];
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home-container">
      <div className="dashboard-header">
        <div className="header-top-row">
          <h1 className="greeting">Hello, {getFirstName()}</h1>
          <div className="date-display">
            <BsCalendar className="calendar-icon" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <p className="welcome-message">Welcome to your AI Act dashboard overview.</p>
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

        <div className="stat-card ai-act-compliance-card">
          <div className="stat-icon-container">
            <FaShieldAlt className="stat-icon" />
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

      <section className="news-section">
        <h2 className="section-title"><span className="trend-icon">🤖</span> Trending AI Regulation News</h2>
        <div className="news-grid">
          <div className="news-card"><h3>EU AI Act enforcement begins</h3><p>New compliance requirements for AI systems.</p><button className="ai-act-view-article-btn">View Article</button></div>
          <div className="news-card"><h3>High-risk AI system guidelines</h3><p>Updated classification and compliance framework.</p><button className="ai-act-view-article-btn">View Article</button></div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;

