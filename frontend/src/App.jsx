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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
// Revert to previous routing without shared layout shell
// (Legacy dashboard components still render their own sidebars)
const TOP_REGULATION = { routes: { welcome: "/dashboard/csrd" } };

// Route wrapper that protects routes requiring authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("Auth state is loading...");
    return <div className="loading-spinner">Loading...</div>;
  }

  // Log the authentication state for debugging
  console.log(
    "Auth state in PrivateRoute:",
    user ? "Authenticated" : "Not authenticated"
  );

  // If user is authenticated, render the protected content
  if (user) {
    return children;
  }

  // If not authenticated, redirect to login page
  console.log("No user found, redirecting to login");
  return <Navigate to="/login" />;
};

// Component to handle onboarding check
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if we have complete user data (companyId indicates we've fetched from database)
  const hasCompleteUserData = user.companyId !== undefined;

  console.log("🔍 OnboardingRoute - User state:", {
    uid: user.uid,
    email: user.email,
    hasCompleteUserData,
    onboardingBasicCompleted: user.onboardingBasicCompleted,
    onboardingCompleted: user.onboardingCompleted,
    companyId: user.companyId,
    fullUser: user,
  });

  // If we don't have complete user data yet, show loading
  if (!hasCompleteUserData) {
    console.log("⏳ OnboardingRoute - Waiting for complete user data...");
    return <div className="loading-spinner">Loading user data...</div>;
  }

  // Now check if onboarding is completed (support both flags)
  if (!(user.onboardingBasicCompleted || user.onboardingCompleted)) {
    console.log(
      "❌ OnboardingRoute - Redirecting to onboarding because onboarding not completed"
    );
    return <Navigate to="/onboarding" />;
  }

  console.log(
    "✅ OnboardingRoute - Onboarding completed, allowing access to dashboard"
  );

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
    navigate(TOP_REGULATION.routes.welcome);
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
