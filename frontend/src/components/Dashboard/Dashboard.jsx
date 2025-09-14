import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { logout } from "../../store/slices/authSlice.js";
import "./Dashboard.css";
import {
  FaHome,
  FaCubes,
  FaChartBar,
  FaUsers,
  FaCog,
  FaShoppingCart,
  FaLeaf,
  FaShieldAlt,
  FaBrain,
} from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import logo from "../../assets/logo.png";
import PropTypes from "prop-types";

const regs = [
  {
    key: "csrd",
    label: "CSRD",
    icon: FaLeaf,
    routes: {
      welcome: "/dashboard/csrd",
      assessment: "/dashboard/csrd/flashcards",
      dashboard: "/dashboard/csrd/dashboard",
    },
    subTabs: [
      { key: "dashboard", label: "Dashboard", route: "/dashboard/csrd/dashboard" },
      { key: "assessment", label: "Assessment", route: "/dashboard/csrd/flashcards" }
    ]
  },
  {
    key: "gdpr",
    label: "GDPR",
    icon: FaShieldAlt,
    routes: {
      welcome: "/dashboard/gdpr",
      assessment: "/dashboard/gdpr/flashcards",
      dashboard: "/dashboard/gdpr/dashboard",
    },
    subTabs: [
      { key: "dashboard", label: "Dashboard", route: "/dashboard/gdpr/dashboard" },
      { key: "assessment", label: "Assessment", route: "/dashboard/gdpr/flashcards" }
    ]
  },
  {
    key: "ai-act",
    label: "AI Act",
    icon: FaBrain,
    routes: {
      welcome: "/dashboard/ai-act",
      assessment: "/dashboard/ai-act/flashcards",
      dashboard: "/dashboard/ai-act/dashboard",
    },
    subTabs: [
      { key: "dashboard", label: "Dashboard", route: "/dashboard/ai-act/dashboard" },
      { key: "assessment", label: "Assessment", route: "/dashboard/ai-act/flashcards" }
    ]
  },
];

const Dashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Collapse sidebar except on the dashboard home
  useEffect(() => {
    setCollapsed(location.pathname !== "/dashboard");
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleSidebar = () => {
    setCollapsed((c) => !c);
  };

  const activeRegKey = (() => {
    const m = location.pathname.match(/\/dashboard\/(csrd|gdpr|ai-act)/);
    return m ? m[1] : undefined;
  })();

  const StatCard = ({ value, label, change }) => (
    <div className="stat-card">
      <FaShoppingCart className="stat-icon" />
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
        <span className="stat-change">{change}% ↑</span>
      </div>
    </div>
  );

  StatCard.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="logo">
          <img src={logo} alt="Raylow" />
          {!collapsed && <span>RAYLOW</span>}
        </div>

        <button
          className="toggle-sidebar"
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>

        <nav className="nav-menu">
          <NavLink
            end
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            title="Home"
          >
            <FaHome /> {!collapsed && "Regulations"}
          </NavLink>

          {regs.map((reg) => (
            <div key={reg.key}>
              <NavLink
                to={reg.routes.welcome}
                className={({ isActive }) =>
                  isActive || activeRegKey === reg.key ? "active" : ""
                }
                title={reg.label}
              >
                <reg.icon /> {!collapsed && reg.label}
              </NavLink>
              {activeRegKey === reg.key && reg.subTabs && !collapsed && (
                <div className="reg-subtabs">
                  {reg.subTabs.map((subTab) => (
                    <Link
                      key={subTab.key}
                      to={subTab.route}
                      className="subtab-link"
                      title={subTab.label}
                    >
                      {subTab.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
            title="Reports"
          >
            <FaChartBar /> {!collapsed && "Reports"}
          </NavLink>
          <NavLink
            to="/dashboard/team"
            className={({ isActive }) => (isActive ? "active" : "")}
            title="Team"
          >
            <FaUsers /> {!collapsed && "Team"}
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
            title="Settings"
          >
            <FaCog /> {!collapsed && "Settings"}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <a href="#" title="Help & Information" onClick={(e) => e.preventDefault()}>
            <AiOutlineQuestionCircle /> {!collapsed && "Help & Information"}
          </a>
          <a href="#" onClick={handleLogout} title="Log Out">
            <BiLogOut /> {!collapsed && "Log Out"}
          </a>
        </div>
      </aside>

      <main className={`main-content ${collapsed ? "expanded" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;