import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsCalendar } from "react-icons/bs";
import { FaChartLine, FaFileAlt } from "react-icons/fa";
import { HiArrowNarrowRight, HiCheckCircle } from "react-icons/hi";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import "./DashboardHome.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

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
    // Stub demo data until backend source is connected
    const demo = {
      stats: {
        totalSales: 2403,
        totalEmissions: 2403,
        complianceScore: 82,
      },
      chartData: {
        emissionsByScope: { scope3: 77, scope2: 15, scope1: 8 },
        monthlyEmissions: [
          1200, 1000, 1400, 1100, 1300, 900, 1200, 800, 1100, 1000, 1200, 900,
        ],
        yearlyReduction: 7.25,
      },
    };
    setDashboardData(demo);
    setLoading(false);
  }, []);

  const donutData = {
    labels: ["Scope 3", "Scope 2", "Scope 1"],
    datasets: [
      {
        data: dashboardData
          ? [
              dashboardData.chartData.emissionsByScope.scope3,
              dashboardData.chartData.emissionsByScope.scope2,
              dashboardData.chartData.emissionsByScope.scope1,
            ]
          : [77, 15, 8],
        backgroundColor: ["#10b981", "#34d399", "#6ee7b7"],
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

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Emissions",
        data: dashboardData
          ? dashboardData.chartData.monthlyEmissions
          : [1200, 1000, 1400, 1100, 1300, 900, 1200, 800, 1100, 1000, 1200, 900],
        borderColor: "#e94c2b",
        backgroundColor: "rgba(233, 76, 43, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
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
        <p className="welcome-message">Welcome to your CSRD dashboard overview.</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card csrd-emissions-card">
          <div className="stat-icon-container">
            <FaChartLine className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.stats.totalEmissions.toLocaleString() || "2,403"}</h3>
            <p>Total Emissions (tCO₂e)</p>
          </div>
          <div className="stat-change negative">
            <span>{dashboardData?.chartData.yearlyReduction || 7.25}% ↓</span>
          </div>
        </div>
        <div className="stat-card csrd-compliance-card">
          <div className="stat-icon-container">
            <HiCheckCircle className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>{dashboardData?.stats.complianceScore || 82}%</h3>
            <p>ESRS Compliance</p>
          </div>
          <div className="stat-change positive">
            <span>2.15% ↑</span>
          </div>
        </div>
        <div className="stat-card csrd-reporting-card">
          <div className="stat-icon-container">
            <FaFileAlt className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>7/12</h3>
            <p>ESRS Standards Covered</p>
          </div>
          <div className="stat-change positive">
            <span>58% Complete</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="chart-card emissions-by-scope">
          <div className="chart-header">
            <h3>Emissions by Scope</h3>
            <span className="chart-period">Current Year</span>
          </div>
          <div className="chart-container">
            <div className="donut-chart-wrapper">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="donut-center">{dashboardData?.chartData.emissionsByScope.scope3 || 77}%</div>
            </div>
            <div className="scope-legend">
              <div className="scope-items">
                <div className="scope-item">
                  <span className="scope-dot csrd-scope3"></span>
                  <span>Scope 3</span>
                </div>
                <div className="scope-item">
                  <span className="scope-dot csrd-scope2"></span>
                  <span>Scope 2</span>
                </div>
                <div className="scope-item">
                  <span className="scope-dot csrd-scope1"></span>
                  <span>Scope 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chart-card quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-items">
            <Link to="/dashboard/csrd/flashcards" className="action-item">
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h4>Start Assessment</h4>
                <p>Begin your CSRD compliance assessment</p>
              </div>
              <HiArrowNarrowRight className="action-arrow" />
            </Link>
            <div className="action-item">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h4>Materiality Assessment</h4>
                <p>Conduct double materiality analysis</p>
              </div>
              <HiArrowNarrowRight className="action-arrow" />
            </div>
            <div className="action-item">
              <div className="action-icon">📈</div>
              <div className="action-content">
                <h4>Generate Report</h4>
                <p>Create ESRS-aligned sustainability report</p>
              </div>
              <HiArrowNarrowRight className="action-arrow" />
            </div>
          </div>
        </div>
      </div>

      <section className="news-section">
        <h2 className="section-title"><span className="trend-icon">📈</span> Trending Sustainability News</h2>
        <div className="news-grid">
          <div className="news-card"><h3>EU strengthens CSRD regulation</h3><p>Impacts 100k+ companies across the union.</p><button className="csrd-view-article-btn">View Article</button></div>
          <div className="news-card"><h3>New guidance for SMEs</h3><p>Clarifies requirements and timelines.</p><button className="csrd-view-article-btn">View Article</button></div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;


