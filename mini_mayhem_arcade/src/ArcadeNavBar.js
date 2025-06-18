import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ArcadeNavBar.css';

// PUBLIC_INTERFACE
/**
 * ArcadeNavBar: Navigation bar for MiniMayhem Arcade.
 * - Only the 'MiniMayhem Arcade' logo/title on the left links to the landing page ('/').
 * - Other navigation links: 'Games', 'Top Games'
 * - No 'Home' item anywhere in the nav.
 * - Neon arcade styling, consistent with app branding.
 */
function ArcadeNavBar() {
  const location = useLocation();

  // Helper to determine "active" nav link styling
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar-left">
        {/* Logo/title is the only link to landing page */}
        <Link to="/" className="arcade-navbar-logo">
          <span role="img" aria-label="arcade joystick" style={{ marginRight: '0.3em' }}>🕹️</span>
          <span className="arcade-navbar-site-title">MiniMayhem Arcade</span>
        </Link>
      </div>
      <div className="arcade-navbar-links">
        <Link
          to="/games"
          className={`arcade-navbar-link${isActive('/games') ? ' active' : ''}`}
        >
          Games
        </Link>
        <Link
          to="/top-games"
          className={`arcade-navbar-link${isActive('/top-games') ? ' active' : ''}`}
        >
          Top Games
        </Link>
      </div>
    </nav>
  );
}

export default ArcadeNavBar;
