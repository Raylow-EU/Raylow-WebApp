import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../store/thunks/authThunks";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import "./Signup.css";
import logo from "../../assets/logo.png";

// Signup form component that handles new user registration
const Signup = () => {
  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // React Router navigation
  const { error } = useSelector((state) => state.auth); // Get auth error from Redux
  const [isLoading, setIsLoading] = useState(false); // Local loading state

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting signup with:", {
        email: formData.email,
        fullName: formData.fullName,
        passwordLength: formData.password.length,
      });
      await dispatch(registerUser(formData)).unwrap();
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
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
            <h1>Create an Account</h1>
            <p className="subtitle">Join us to simplify your CSRD compliance</p>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

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
                <label htmlFor="password">Password</label>
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
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              <p className="auth-link">
                Already have an account? <Link to="/login">Log in</Link>
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

export default Signup;
