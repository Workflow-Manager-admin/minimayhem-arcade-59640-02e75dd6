import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

/**
 * MiniMayhem ArcadeGamesPage
 * Renders a grid of available arcade mini-games.
 * The Sliding Tile Puzzle has been removed per request.
 */

// List of active games (without Sliding Tile Puzzle)
const ARCADE_GAMES = [
  {
    key: "block-puzzle",
    name: "Block Puzzle",
    description: "Fit the blocks, clear the board!",
    emoji: "🧩",
    to: "/games/block-puzzle",
    accent: "#47caff"
  },
  {
    key: "memory-match",
    name: "Memory Match",
    description: "Match all pairs to win. Test your memory!",
    emoji: "🃏",
    to: "/games/memory-match",
    accent: "#ffc847"
  },
  {
    key: "memory-puzzle",
    name: "Memory Puzzle",
    description: "Sequence challenge – how long can you remember?",
    emoji: "🧠",
    to: "/games/memory-puzzle",
    accent: "#abeb34"
  },
  {
    key: "reaction-speed",
    name: "Reaction Speed",
    description: "Tap FAST! Sharpen your reflexes.",
    emoji: "⚡",
    to: "/games/reaction-speed",
    accent: "#ff6347"
  },
  {
    key: "word-typing",
    name: "Word Typing",
    description: "Type words quickly, boost your accuracy!",
    emoji: "⌨️",
    to: "/games/word-typing",
    accent: "#8656f8"
  },
  {
    key: "sudoku",
    name: "Sudoku",
    description: "Classic Sudoku challenge - logic your way to victory!",
    emoji: "🔢",
    to: "/games/sudoku",
    accent: "#4CAF50"
  }
];

const cardStyle = accent => ({
  background: `linear-gradient(120deg, ${accent}22 0%, #fff0 100%)`,
  border: `2px solid ${accent}44`,
  borderRadius: 18,
  padding: "20px 16px 18px",
  color: "#fff",
  boxShadow: "0 6px 22px 0 rgba(0,0,0,0.13)",
  minHeight: 172,
  transition: "transform 0.16s, box-shadow 0.23s",
  willChange: "transform",
  textDecoration: "none",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  fontFamily: "'Orbitron', 'Arial', sans-serif",
  outline: "none"
});

// PUBLIC_INTERFACE
function ArcadeGamesPage() {
  return (
    <main className="container" style={{ paddingTop: 96, paddingBottom: 48, minHeight: 680 }}>
      <section style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 className="title" style={{ fontSize: "2.6rem", fontWeight: 700 }}>
          🎮 Play MiniMayhem Games!
        </h1>
        <p className="subtitle" style={{ marginTop: 5 }}>
          Arcade mini-games to test your skill, memory, reflexes, and brain power.
        </p>
      </section>
      <section aria-label="Arcade game grid" style={{ width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 30,
            width: "100%",
            margin: "0 auto",
            maxWidth: 950
          }}
        >
          {ARCADE_GAMES.map(game => (
            <Link
              key={game.key}
              to={game.to}
              style={cardStyle(game.accent)}
              tabIndex={0}
              className="arcade-game-card"
              aria-label={`Play ${game.name}`}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={e => (e.currentTarget.style.transform = "")}
              onMouseLeave={e => (e.currentTarget.style.transform = "")}
            >
              <span
                style={{
                  fontSize: 36,
                  marginBottom: 2,
                  textShadow: "0 2px 6px #0004"
                }}
                aria-hidden="true"
              >
                {game.emoji}
              </span>
              <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 3 }}>
                {game.name}
              </div>
              <div style={{ color: "#fff", opacity: 0.85, fontSize: "0.99rem" }}>
                {game.description}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ArcadeGamesPage;
