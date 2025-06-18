import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ArcadeNavBar.css";

// PUBLIC_INTERFACE
/**
 * ArcadeNavBar - Fixed arcade-style navigation bar for MiniMayhem Arcade.
 * Structure: logo/title on left (links to "/"), Games and Top Games on right,
 * arcade pixel font, and bright royal blue background.
 * Responsive: On narrow screens, menu collapses to hamburger.
 */
function ArcadeNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close nav on link click (for mobile)
  const handleNavLinkClick = () => setMenuOpen(false);

  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar-content">
        {/* Left: Logo/Title */}
        <div className="arcade-logo-title">
          <Link to="/" className="arcade-logo-link" tabIndex={0} aria-label="Home">
            <span role="img" aria-label="Arcade Joystick" className="arcade-emoji">🎮</span>
            <span className="arcade-title-text">MiniMayhem Arcade</span>
          </Link>
        </div>
        {/* Hamburger for small screens */}
        <button
          className={`arcade-navbar-hamburger${menuOpen ? " open" : ""}`}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="arcade-navbar-links"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="arcade-navbar-hamburger-bar"></span>
          <span className="arcade-navbar-hamburger-bar"></span>
          <span className="arcade-navbar-hamburger-bar"></span>
        </button>
        {/* Right: Nav Links */}
        <div
          id="arcade-navbar-links"
          className={`arcade-navbar-links${menuOpen ? " show" : ""}`}
          onClick={handleNavLinkClick}
        >
          <Link
            to="/games"
            className={`arcade-nav-link${location.pathname.startsWith("/games") ? " active" : ""}`}
            tabIndex={0}
          >
            Games
          </Link>
          <Link
            to="/top-games"
            className={`arcade-nav-link${location.pathname === "/top-games" ? " active" : ""}`}
            tabIndex={0}
          >
            Top Games
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default ArcadeNavBar;
