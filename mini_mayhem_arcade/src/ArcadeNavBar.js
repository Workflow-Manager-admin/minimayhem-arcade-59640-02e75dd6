import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./ArcadeNavBar.css";

// PUBLIC_INTERFACE
/**
 * The arcade-styled navigation bar for MiniMayhem Arcade.
 * Applies a retro design with gradient background, Google Fonts import,
 * neon-glow and scaling effects, proper spacing, and a fun emoji in the title.
 */
const ArcadeNavBar = () => {
  const location = useLocation();
  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar-brand">
        <span role="img" aria-label="game controller" className="arcade-navbar-emoji">
          🎮
        </span>
        <span className="arcade-navbar-title">MiniMayhem Arcade</span>
      </div>
      <ul className="arcade-navbar-links">
        <li>
          <NavLink to="/" end
            className={({ isActive }) => isActive ? "arcade-link active" : "arcade-link"}
          >Home</NavLink>
        </li>
        <li>
          <NavLink to="/games"
            className={({ isActive }) =>
              location.pathname.startsWith("/games") && location.pathname.length <= 7
                ? "arcade-link active"
                : "arcade-link"
            }
          >
            All Games
          </NavLink>
        </li>
        <li>
          <NavLink to="/top-games"
            className={({ isActive }) => isActive ? "arcade-link active" : "arcade-link"}
          >Top Games</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default ArcadeNavBar;
