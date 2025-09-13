import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, LogOut } from "lucide-react";
import { logoutUserThunk } from "../../store/thunks/authThunks";
import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className={`landing-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="landing-navbar-container">
        <div className="landing-navbar-logo">
          <Link to="/" aria-label="Home">
            <img
              src={logo || "/placeholder.svg"}
              alt=""
              className="landing-logo-img"
            />
            <span className="landing-logo">RAYLOW</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="landing-navbar-desktop">
          <div className="landing-navbar-links">
            {[
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/docs", label: "Docs" },
              { to: "/blog", label: "Blog" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={isActive(link.to) ? "active-link" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="landing-navbar-auth">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#333', fontSize: '14px' }}>
                  Welcome, {user.displayName || user.email}
                </span>
                <button 
                  className="landing-login-btn" 
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="landing-login-btn">Log in</button>
                </Link>
                <Link to="/signup">
                  <button className="landing-signup-btn">Sign up</button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="landing-mobile-menu-btn"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`landing-mobile-menu ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="landing-mobile-links">
          {[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/docs", label: "Docs" },
            { to: "/blog", label: "Blog" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={isActive(link.to) ? "active-link" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="landing-mobile-auth">
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#333', fontSize: '14px', textAlign: 'center' }}>
                  Welcome, {user.displayName || user.email}
                </span>
                <button 
                  className="landing-login-btn" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="landing-login-btn">Log in</button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="landing-signup-btn">Sign up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;