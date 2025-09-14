import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BsCalendar, BsShield } from "react-icons/bs";
import { FaUsers, FaFileContract } from "react-icons/fa";
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
        <p className="welcome-message">Welcome to your GDPR dashboard overview.</p>
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

        <div className="stat-card gdpr-compliance-card">
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

      <section className="news-section">
        <h2 className="section-title"><span className="trend-icon">📈</span> Trending Sustainability News</h2>
        <div className="news-grid">
          <div className="news-card"><h3>EU strengthens GDPR regulation</h3><p>Impacts 100k+ companies across the union.</p><button className="gdpr-view-article-btn">View Article</button></div>
          <div className="news-card"><h3>New guidance for SMEs</h3><p>Clarifies requirements and timelines.</p><button className="gdpr-view-article-btn">View Article</button></div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;

