import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { logout } from "../../store/slices/authSlice.js";
import "./Dashboard.css";
import {
  FaHome,
  FaCubes,
  FaChartBar,
  FaChartLine,
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
      flashcards: "/dashboard/csrd/flashcards",
      dashboard: "/dashboard/csrd/dashboard",
    },
    subTabs: [
      { key: "welcome", label: "Welcome", route: "/dashboard/csrd", icon: FaHome },
      { key: "dashboard", label: "Dashboard", route: "/dashboard/csrd/dashboard", icon: FaChartLine },
      { key: "flashcards", label: "Flashcards", route: "/dashboard/csrd/flashcards", icon: FaCubes }
    ]
  },
  {
    key: "gdpr",
    label: "GDPR",
    icon: FaShieldAlt,
    routes: {
      welcome: "/dashboard/gdpr",
      flashcards: "/dashboard/gdpr/flashcards",
      dashboard: "/dashboard/gdpr/dashboard",
    },
    subTabs: [
      { key: "welcome", label: "Welcome", route: "/dashboard/gdpr", icon: FaHome },
      { key: "dashboard", label: "Dashboard", route: "/dashboard/gdpr/dashboard", icon: FaChartLine },
      { key: "flashcards", label: "Flashcards", route: "/dashboard/gdpr/flashcards", icon: FaCubes }
    ]
  },
  {
    key: "ai-act",
    label: "AI Act",
    icon: FaBrain,
    routes: {
      welcome: "/dashboard/ai-act",
      flashcards: "/dashboard/ai-act/flashcards",
      dashboard: "/dashboard/ai-act/dashboard",
    },
    subTabs: [
      { key: "welcome", label: "Welcome", route: "/dashboard/ai-act", icon: FaHome },
      { key: "dashboard", label: "Dashboard", route: "/dashboard/ai-act/dashboard", icon: FaChartLine },
      { key: "flashcards", label: "Flashcards", route: "/dashboard/ai-act/flashcards", icon: FaCubes }
    ]
  },
];

const Dashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Keep sidebar expanded on dashboard and regulation pages
  useEffect(() => {
    // Keep expanded for dashboard home and all regulation pages
    const shouldKeepExpanded = location.pathname === "/dashboard" ||
                              location.pathname.match(/\/dashboard\/(csrd|gdpr|ai-act)/);
    setCollapsed(!shouldKeepExpanded);
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
    console.log('DEBUG: activeRegKey calculation:', {
      pathname: location.pathname,
      match: m,
      result: m ? m[1] : undefined
    });
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
            <div key={reg.key} className="regulation-nav-group">
              <div
                className="regulation-main-nav"
                title={reg.label}
                onClick={() => {
                  console.log(`DEBUG: Main regulation nav clicked:`, {
                    regKey: reg.key,
                    activeRegKey,
                    navigatingTo: reg.routes.welcome
                  });
                  navigate(reg.routes.welcome);
                }}
                style={{ cursor: 'pointer' }}
              >
                <reg.icon /> {!collapsed && reg.label}
                {!collapsed && activeRegKey === reg.key && (
                  <span className="expand-indicator">▼</span>
                )}
                {!collapsed && activeRegKey !== reg.key && (
                  <span className="expand-indicator">▶</span>
                )}
              </div>
              {activeRegKey === reg.key && reg.subTabs && !collapsed && (
                <div className="reg-subtabs">
                  {reg.subTabs.map((subTab) => {
                    const SubTabIcon = subTab.icon;
                    return (
                      <NavLink
                        key={subTab.key}
                        to={subTab.route}
                        end
                        className={({ isActive }) => {
                          console.log(`DEBUG: ${reg.key} ${subTab.key} subtab NavLink:`, {
                            to: subTab.route,
                            currentPath: location.pathname,
                            isActive,
                            exactMatch: location.pathname === subTab.route,
                            activeRegKey,
                            regKey: reg.key
                          });
                          return `subtab-link ${isActive ? "active" : ""}`;
                        }}
                        title={subTab.label}
                      >
                        <SubTabIcon className="subtab-icon" />
                        {subTab.label}
                      </NavLink>
                    );
                  })}
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