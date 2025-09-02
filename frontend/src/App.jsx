import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
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

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Simple protected dashboard placeholder
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Raylow!</h1>
      <p>Hello, {user?.displayName || user?.email}!</p>
      <p>This is a placeholder dashboard. The full app features will be available in the main application.</p>
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
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;