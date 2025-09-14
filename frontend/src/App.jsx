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
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    // Only set the flag after we've confirmed onboarding status
    if (user && !loading) {
      setHasCheckedOnboarding(true);
    }
  }, [user, loading]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Prevent redirect if we're still in the process of loading user data
  // This prevents the tab switch issue where user data temporarily becomes incomplete
  const isOnboardingComplete = user.onboardingBasicCompleted || user.onboardingCompleted;

  // Only redirect to onboarding if:
  // 1. We have confirmed the user data is fully loaded
  // 2. AND onboarding is genuinely not complete
  if (hasCheckedOnboarding && !isOnboardingComplete) {
    console.log("OnboardingRoute: Redirecting to onboarding", { user, hasCheckedOnboarding, isOnboardingComplete });
    return <Navigate to="/onboarding" />;
  }

  // If onboarding check hasn't completed yet, render children to prevent flashing
  return children;
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
          <Route index element={<ResumePage />} />
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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
