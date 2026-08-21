import { Link, useLocation } from "react-router-dom";
import { useUser, UserButton } from "@clerk/react";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const { isSignedIn } = useUser();

  return (
    <nav className={`navbar ${location.pathname !== "/" ? "navbar-dark" : ""}`}>
      <div className="navbar-container">

        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">TradeTrust</span>
          </Link>
        </div>

        <div className="navbar-center">
          <ul className="navbar-menu">
            <li><Link to="/">Home</Link></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>

            {location.pathname !== "/" && (
              <li><Link to="/check">Start Check</Link></li>
            )}
            {isSignedIn && (
  <li>
    <Link to="/saved-results">Saved Results</Link>
  </li>
)}
          </ul>
        </div>

        <div className="navbar-right">

          {!isSignedIn ? (
            <>
              <Link to="/login">
                <button className="navbar-login-btn">Login</button>
              </Link>

              <Link to="/signup">
                <button className="navbar-signup-btn">Sign Up</button>
              </Link>
            </>
          ) : (
            <div className="navbar-user">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;