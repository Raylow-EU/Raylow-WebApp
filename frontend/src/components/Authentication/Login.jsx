import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../store/thunks/authThunks";
import { Mail, Lock, AlertCircle } from "lucide-react";
import "./Login.css";
import logo from "../../assets/logo.png";

// Login form component that handles user authentication
const Login = () => {
  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // React Router navigation
  const { error } = useSelector((state) => state.auth); // Get auth error from Redux
  const [isLoading, setIsLoading] = useState(false); // Local loading state

  // Form data state for email and password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handles input field changes and updates form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handles form submission and triggers login process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting login with:", {
        email: formData.email,
        passwordLength: formData.password.length,
      });
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log("Login successful, result:", result);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      // Log more details about the error
      if (error.message) {
        console.error("Error message:", error.message);
      }
      if (error.details) {
        console.error("Error details:", error.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-dots"></div>
        <div className="auth-gradient"></div>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img
              src={logo || "/placeholder.svg?height=32&width=32"}
              alt="Raylow Logo"
            />
            <span>RAYLOW</span>
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <h1>Welcome Back</h1>
            <p className="subtitle">Login to your account</p>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="auth-link">
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </p>
            </form>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            &copy; {new Date().getFullYear()} Raylow. All rights reserved.{" "}
            <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
