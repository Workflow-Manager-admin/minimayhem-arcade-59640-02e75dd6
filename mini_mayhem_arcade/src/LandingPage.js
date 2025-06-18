import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

// PUBLIC_INTERFACE
/**
 * Landing page for MiniMayhem Arcade.
 * - Welcome hero section with branding, brief description, CTA button.
 * - (Minigame selection grid removed as per subtask)
 * - Fun extras, maybe trending games snippet.
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <section className="hero">
        <div className="subtitle">Welcome to</div>
        <h1 className="title">MiniMayhem Arcade</h1>
        <div className="description">
          Your browser-based home for mini madness! Jump into quick, colorful mini games –
          challenge yourself and friends or relax and boost your mental skills. Compete for high
          scores, try trending new games, and explore fun extras!
        </div>
        <button
          className="btn btn-large"
          onClick={() => navigate("/games")}
          style={{ marginTop: 18 }}
        >
          🎮 Play Games Now!
        </button>
      </section>

      {/* More fun extras and soon: Trending games, scoreboard, etc. */}
    </div>
  );
}
