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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

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

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if onboarding is completed (support both flags)
  if (!(user.onboardingBasicCompleted || user.onboardingCompleted)) {
    return <Navigate to="/onboarding" />;
  }

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
    // After successful onboarding, redirect to dashboard
    navigate("/dashboard");
  };

  return <BasicOnboardingForm onComplete={handleOnboardingComplete} />;
};

// Simple protected dashboard placeholder
const Dashboard = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", position: "relative" }}>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#f85a2b",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
        }}
      >
        {loading ? "Logging out..." : "Logout"}
      </button>

      <h1>Welcome to Raylow!</h1>
      <p>Hello, {user?.displayName || user?.fullName || user?.email}!</p>
      <p>
        This is a placeholder dashboard. The full app features will be available
        in the main application.
      </p>
    </div>
  );
};

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
        <Route
          path="/dashboard"
          element={
            <OnboardingRoute>
              <Dashboard />
            </OnboardingRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
