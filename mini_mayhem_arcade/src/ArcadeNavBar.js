import React from "react";
import { NavLink } from "react-router-dom";
import "./ArcadeNavBar.css";

// PUBLIC_INTERFACE
/**
 * ArcadeNavBar is a visually striking, always-visible navigation bar inspired by retro arcade aesthetics.
 * Features include: vibrant gradient background, retro pixelated font, neon glowing active link, 
 * glowing and scaling hover/click feedback, emoji branding, and consistent arcade-style spacing.
 */
function ArcadeNavBar() {
  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar-title">
        <span role="img" aria-label="arcade controller" className="emoji-glow">
          🎮
        </span>
        <span className="arcade-title-text">MiniMayhem Arcade</span>
      </div>
      <div className="arcade-navbar-links">
        <NavLink
          exact="true"
          to="/"
          className="arcade-link"
          activeclassname="arcade-link-active"
        >
          Home
        </NavLink>
        <NavLink
          to="/games"
          className="arcade-link"
          activeclassname="arcade-link-active"
        >
          Games
        </NavLink>
        <NavLink
          to="/top-games"
          className="arcade-link"
          activeclassname="arcade-link-active"
        >
          Trending
        </NavLink>
      </div>
    </nav>
  );
}

export default ArcadeNavBar;
