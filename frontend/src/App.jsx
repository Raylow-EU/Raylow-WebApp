import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
import BasicOnboardingForm from "./features/onboarding/BasicOnboardingForm";
import { logoutUserThunk } from "./store/thunks/authThunks";
import ResumePage from "./components/Resume_Page/ResumePage.jsx";
import RegulationSelector from "./components/Dashboard/RegulationSelector.jsx";
import WelcomeGDPR from "./components/Regulations/GDPR/Welcome/Welcome.jsx";
import WelcomeAI from "./components/Regulations/AIAct/Welcome/Welcome.jsx";
import WelcomeCSRD from "./components/Regulations/CSRD/Welcome/Welcome.jsx";
import GDPRFlashcards from "./components/Regulations/GDPR/Flashcards/Flashcards.jsx";
import AIFlashcards from "./components/Regulations/AIAct/Flashcards/Flashcards.jsx";
import CSRDFlashcards from "./components/Regulations/CSRD/Flashcards/Flashcards.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import CSRDDashboardHome from "./components/Regulations/CSRD/Personalized_dashboard/DashboardHome.jsx";
import GDPRDashboardHome from "./components/Regulations/GDPR/Personalized_dashboard/DashboardHome.jsx";
import AIActDashboardHome from "./components/Regulations/AIAct/Personalized_dashboard/DashboardHome.jsx";
import RegulatoryAssessment from "./components/Assessment/RegulatoryAssessment.jsx";
import ChatInterface from "./features/chat/ChatInterface.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
// Revert to previous routing without shared layout shell
// (Legacy dashboard components still render their own sidebars)

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Check if we're still loading OR if user exists
  if (loading) {
    console.log("Auth state is loading...");
    return <div className="loading-spinner">Loading...</div>;
  }

  // Log the authentication state for debugging
  console.log(
    "Auth state in PrivateRoute:",
    user ? "Authenticated" : "Not authenticated"
  );

  // If we have a user, render the protected route
  if (user) {
    return children;
  }

  // Otherwise redirect to login
  console.log("No user found, redirecting to login");
  return <Navigate to="/login" />;
};

// Component to handle onboarding check
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const [onboardingStatus, setOnboardingStatus] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('onboarding_completed');
    return saved === 'true' ? 'completed' : null;
  });

  // Remember onboarding status once determined to prevent re-evaluation during navigation
  useEffect(() => {
    if (user && (user.onboardingBasicCompleted === true || user.onboardingCompleted === true)) {
      setOnboardingStatus('completed');
      localStorage.setItem('onboarding_completed', 'true');
    } else if (user && user.onboardingBasicCompleted === false && !user.onboardingCompleted) {
      // Only set to needed if we don't already have it marked as completed
      if (onboardingStatus !== 'completed') {
        setOnboardingStatus('needed');
      }
    }
  }, [user, onboardingStatus]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If we've already determined the user completed onboarding, always allow access
  if (onboardingStatus === 'completed') {
    return children;
  }

  // If we've determined the user needs onboarding, redirect
  if (onboardingStatus === 'needed') {
    return <Navigate to="/onboarding" />;
  }

  // Still determining onboarding status - show loading to prevent flash
  return (
    <div className="onboarding-loading">
      <div className="loading-spinner"></div>
      <p>Preparing your workspace...</p>
    </div>
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

OnboardingRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Onboarding wrapper component
const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate("/dashboard");
  };

  return <BasicOnboardingForm onComplete={handleOnboardingComplete} />;
};

// Dashboard shell now provides sidebar + nested routes

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <OnboardingPage />
            </PrivateRoute>
          }
        />
        {/* Assessment route */}
        <Route 
          path="/assessment" 
          element={
            <PrivateRoute>
              <RegulatoryAssessment />
            </PrivateRoute>
          } 
        />
        {/* Dashboard shell with nested routes */}
        <Route path="/resume" element={<ResumePage />} />
        <Route
          path="/dashboard"
          element={
            <OnboardingRoute>
              <Dashboard />
            </OnboardingRoute>
          }
        >
          <Route index element={<RegulationSelector />} />
          {/* CSRD */}
          <Route path="csrd" element={<WelcomeCSRD />} />
          <Route path="csrd/flashcards" element={<CSRDFlashcards />} />
          {/* GDPR */}
          <Route path="gdpr" element={<WelcomeGDPR />} />
          <Route path="gdpr/flashcards" element={<GDPRFlashcards />} />
          {/* AI Act */}
          <Route path="ai-act" element={<WelcomeAI />} />
          <Route path="ai-act/flashcards" element={<AIFlashcards />} />
          {/* Personalized Dashboards per regulation */}
          <Route path="csrd/dashboard" element={<CSRDDashboardHome />} />
          <Route path="gdpr/dashboard" element={<GDPRDashboardHome />} />
          <Route path="ai-act/dashboard" element={<AIActDashboardHome />} />
          {/* Dashboard local pages */}
          <Route path="reports" element={<ResumePage />} />
          <Route path="team" element={<ResumePage />} />
          <Route path="settings" element={<ResumePage />} />
          <Route path="chat" element={<ChatInterface />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
