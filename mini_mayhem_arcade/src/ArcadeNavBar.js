import React from "react";
import "./ArcadeNavBar.css";
import { NavLink } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * ArcadeNavBar displays colorful navigation links with arcade-inspired UI.
 * Links: Home, Mini Games, Scoreboard, Trending Games, Fun Extras.
 * The component uses the provided color scheme (primary: #ff6347, secondary: #4CAF50, accent: #FFC107) and
 * fits a light, vibrant, arcade-themed layout.
 */
const ArcadeNavBar = () => {
  return (
    <nav className="arcade-navbar">
      <div className="arcade-navbar-logo">
        <span className="arcade-logo-text">MiniMayhem Arcade</span>
      </div>
      <ul className="arcade-navbar-links">
        <li>
          <NavLink
            exact="true"
            to="/"
            className="arcade-link"
            activeclassname="active"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/games"
            className="arcade-link"
            activeclassname="active"
          >
            Mini Games
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/scoreboard"
            className="arcade-link"
            activeclassname="active"
          >
            Scoreboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/trending"
            className="arcade-link"
            activeclassname="active"
          >
            Trending Games
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/fun-extras"
            className="arcade-link"
            activeclassname="active"
          >
            Fun Extras
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default ArcadeNavBar;
