import React from "react";
import { NavLink, Link } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Navbar for MiniMayhem Arcade.
 *
 * - Left: Brand logo/title (🎮 MiniMayhem Arcade) as link to landing page (/)
 * - Right: '🕹️ Games', 'Play Now!' CTA, '🔝 Top Games', all as navigable NavLinks
 * - Bright gradient background, pixel/arcade font (Orbitron/Press Start 2P/fallback)
 * - Glowing/underline on hover, active link highlight
 */
const NAV_STYLES = {
  navbar: {
    width: "100%",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(90deg,#2196f3 0%,#9b1de7 100%)",
    padding: "0 0",
    display: "flex",
    alignItems: "center",
    minHeight: 64,
    fontFamily:
      "'Press Start 2P', 'Orbitron', 'Arial', sans-serif",
    letterSpacing: 1,
    boxShadow: "0 4px 16px 0 rgba(30,23,63,0.11)",
    borderBottom: "3px solid rgba(255,255,255,0.07)"
  },
  navInner: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1100,
    margin: "0 auto"
  },
  left: {
    display: "flex",
    alignItems: "center",
    fontSize: 20,
    fontWeight: 900,
    gap: 14,
    textShadow: "0 0 6px #fff7, 0 2px 8px #628fff55"
  },
  brandLink: {
    color: "#fff",
    textDecoration: "none",
    transition: "text-shadow 0.25s",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 28
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    fontSize: 15,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    padding: "12px 1px 10px 1px",
    letterSpacing: "0.5px",
    border: "none",
    background: "none",
    borderRadius: "4px",
    margin: "0 0.1rem",
    position: "relative",
    transition: "color 0.18s, text-shadow 0.25s"
  },
  navLinkActive: {
    color: "#FFD600",
    textShadow:
      "0 0 8px #ffd600, 0 2px 10px #ff2121b8",
    borderBottom: "3px solid #FFD600"
  },
  navLinkGlow: {
    textShadow:
      "0 0 6px #fff7,0 0 12px #66c3ffb0,0 3px 12px #9b1de766"
  },
  divider: {
    borderLeft: "2.5px dashed #ffffff22",
    height: 28,
    margin: "0 18px"
  },
  cta: {
    marginLeft: 10,
    fontFamily:
      "'Press Start 2P', 'Orbitron', 'Arial', sans-serif",
    fontWeight: 900,
    padding: "8px 15px",
    fontSize: 13,
    color: "#fff",
    background:
      "linear-gradient(98deg, #FFD600 0%, #FF506D 100%)",
    border: "none",
    borderRadius: "6px",
    boxShadow: "0 2px 14px 0 #ff5b7f70",
    cursor: "pointer",
    textShadow: "0 2px 8px #fff, 0 1.5px 0 #0008",
    letterSpacing: "1.2px",
    transition: "transform 0.18s, box-shadow 0.23s"
  }
};

// Inline CSS <style> for font imports and extra effects (hover, focus, active)
// Normally, font would be loaded via HTML <link> or assets, but for single-file use we include CSS below
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap');
.nav-mma__navlink {
  position: relative;
}
.nav-mma__navlink::after {
  content: "";
  height: 3px;
  left: 20%;
  right: 20%;
  bottom: 3px;
  position: absolute;
  background: linear-gradient(87deg,#fff755 0%,#51daff 100%);
  opacity: 0;
  transform: scaleX(0.2);
  border-radius: 2px;
  transition: opacity 0.19s, transform 0.18s;
}
.nav-mma__navlink:hover::after,
.nav-mma__navlink:focus::after {
  opacity: 1;
  transform: scaleX(1);
}
.nav-mma__navlink:hover,
.nav-mma__navlink:focus {
  text-shadow: 0 0 10px #fff7,0 2px 10px #75aaff;
  color: #E0F7FA;
}
.nav-mma__navlink-active {
  color: #FFD600 !important;
  text-shadow:0 0 8px #ffd600, 0 2px 10px #ff2121b8 !important;
}
@media (max-width: 650px) {
  .nav-mma__right {
    gap: 12px !important;
  }
  .nav-mma__navlink {
    font-size: 0.92rem !important;
    padding: 11px 0 9px 0;
  }
  .nav-mma__left {
    font-size: 1.1rem !important;
  }
  .nav-mma__cta {
    font-size: 0.89rem !important;
    padding: 7px 10px !important;
  }
}
`;

const Navbar = () => (
  <>
    {/* Font and navbar-specific CSS for demo purposes */}
    <style>{fontCss}</style>
    <nav style={NAV_STYLES.navbar} aria-label="MiniMayhem main navigation">
      <div style={NAV_STYLES.navInner}>
        {/* Brand Link (left) */}
        <Link
          to="/"
          style={{ ...NAV_STYLES.left, ...NAV_STYLES.brandLink }}
          className="nav-mma__left"
        >
          <span role="img" aria-label="joystick" style={{ fontSize: 28 }}>
            🎮
          </span>
          MiniMayhem Arcade
        </Link>
        {/* Nav Links (right) */}
        <div style={NAV_STYLES.right} className="nav-mma__right">
          {/* Games NavLink */}
          <NavLink
            to="/games"
            className={({ isActive }) =>
              "nav-mma__navlink" +
              (isActive ? " nav-mma__navlink-active" : "")
            }
            style={({ isActive }) => ({
              ...NAV_STYLES.navLink,
              ...(isActive ? NAV_STYLES.navLinkActive : {})
            })}
          >
            <span role="img" aria-label="Games" style={{ marginRight: 7 }}>
              🕹️
            </span>
            Games
          </NavLink>
          {/* CTA */}
          <Link
            to="/games"
            tabIndex={-1}
            style={{
              ...NAV_STYLES.cta,
              boxShadow:
                "0 0 10px #ffd60080, 0 2px 10px #ff506d70",
            }}
            className="nav-mma__cta"
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = ""}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >
            Play Now!
          </Link>
          {/* Divider */}
          <span style={NAV_STYLES.divider} aria-hidden="true"></span>
          {/* Top Games NavLink */}
          <NavLink
            to="/top-games"
            className={({ isActive }) =>
              "nav-mma__navlink" +
              (isActive ? " nav-mma__navlink-active" : "")
            }
            style={({ isActive }) => ({
              ...NAV_STYLES.navLink,
              ...(isActive ? NAV_STYLES.navLinkActive : {}),
              fontSize: 15
            })}
          >
            <span role="img" aria-label="Top" style={{ marginRight: 7 }}>
              🔝
            </span>
            Top Games
          </NavLink>
        </div>
      </div>
    </nav>
  </>
);

export default Navbar;
