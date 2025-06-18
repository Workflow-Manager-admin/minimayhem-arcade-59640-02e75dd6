import React from "react";
import { NavLink } from "react-router-dom";
import "./ArcadeNavBar.css";

// PUBLIC_INTERFACE
/**
 * Main top navigation bar for MiniMayhem Arcade.
 * Arcade style: gradient, neon glow, retro font from Google Fonts, always-visible links.
 * Left: Logo/title (🎮 emoji) + brand
 * Right: Navigation links
 */
function ArcadeNavBar() {
  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar__logo-title">
        <span className="arcade-navbar__emoji" role="img" aria-label="game controller">
          🎮
        </span>
        <span className="arcade-navbar__brand-title">
          MiniMayhem Arcade
        </span>
      </div>
      <div className="arcade-navbar__links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            "arcade-navbar__link" +
            (isActive ? " arcade-navbar__link--active" : "")
          }
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/games"
          className={({ isActive }) =>
            "arcade-navbar__link" +
            (isActive ? " arcade-navbar__link--active" : "")
          }
        >
          Games
        </NavLink>
        <NavLink
          to="/top-games"
          className={({ isActive }) =>
            "arcade-navbar__link" +
            (isActive ? " arcade-navbar__link--active" : "")
          }
        >
          Top Games
        </NavLink>
      </div>
    </nav>
  );
}

export default ArcadeNavBar;
