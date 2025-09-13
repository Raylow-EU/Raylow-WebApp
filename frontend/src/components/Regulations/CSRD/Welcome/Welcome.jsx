import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical, BsCalendar } from "react-icons/bs";
import { FaShoppingCart, FaChartLine, FaFileAlt, FaUsers } from "react-icons/fa";
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
import "./Welcome.css";

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

const WelcomeCSRD = () => {
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
    // Demo data
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

  const getFirstName = () => {
    const displayName = user?.displayName || user?.fullName;
    if (!displayName) return "User";
    return displayName.split(" ")[0];
  };

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

  if (loading) {
    return (
      <div className="csrd-loading">
        <div className="loading-spinner"></div>
        <p>Loading CSRD overview...</p>
      </div>
    );
  }

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

      {/* Dashboard Integration */}
      <div className="csrd-dashboard-section">
        <div className="dashboard-header">
          <h2 className="section-title">Your CSRD Dashboard</h2>
          <p className="section-subtitle">Track your sustainability metrics and compliance progress</p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card emissions-card">
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

          <div className="stat-card compliance-card">
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

          <div className="stat-card reporting-card">
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
                    <span className="scope-dot scope3"></span>
                    <span>Scope 3</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot scope2"></span>
                    <span>Scope 2</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot scope1"></span>
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
      </div>
    </div>
  );
};

export default WelcomeCSRD;


