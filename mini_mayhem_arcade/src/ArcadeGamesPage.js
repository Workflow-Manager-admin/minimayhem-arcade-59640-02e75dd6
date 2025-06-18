import React from "react";
import { Link } from "react-router-dom";

/**
 * ArcadeGamesPage displays all available mini games as cards.
 * Cards link to their respective game pages.
 */
const games = [
  {
    emoji: "🧱",
    title: "Block Puzzle",
    to: "/games/block-puzzle",
    description: "Drag blocks to fill the board. Simple but addicting!",
  },
  {
    emoji: "🧩",
    title: "Sliding Tile Puzzle",
    to: "/games/sliding-puzzle",
    description: "Rearrange tiles to solve the puzzle!",
  },
  {
    emoji: "🅰️",
    title: "Word Typing",
    to: "/games/word-typing",
    description: "Test your typing speed with fun words and races.",
  },
  {
    emoji: "⏱️",
    title: "Reaction Speed",
    to: "/games/reaction-speed",
    description: "How fast can you react? Find out in this reflex game.",
  },
  {
    emoji: "🧠",
    title: "Memory Puzzle",
    to: "/games/memory-puzzle",
    description: "Remember and match cards to train your brain.",
  },
  {
    emoji: "🔢",
    title: "Sudoku",
    to: "/games/sudoku",
    description: "Classic number puzzle. Fill every row, column, and box.",
  },
];

function ArcadeGamesPage() {
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <h1 style={{ fontSize: "2.8rem", fontWeight: 700, marginBottom: 10 }}>
        🎲 Games Library
      </h1>
      <p className="description" style={{ marginBottom: 40 }}>
        Explore and play our hand-crafted mini games 🥳.<br />
        Have fun and try to beat your high scores!
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 38,
          marginBottom: 60,
        }}
      >
        {games.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "linear-gradient(135deg, #222348 0%, #2b86c5 100%)",
              borderRadius: 16,
              padding: "32px 8px 24px 8px",
              textDecoration: "none",
              color: "inherit",
              boxShadow: "0 4px 24px 0 #0007",
              minHeight: 210,
              transition: "transform 0.14s",
              outline: "none",
              border: "2.5px solid rgba(255,255,255,0.09)",
              position: "relative",
            }}
            className="game-card"
            tabIndex={0}
          >
            <span
              style={{
                fontSize: 42,
                marginBottom: 8,
                filter: "drop-shadow(0 2px 8px #22f5)"
              }}
              aria-label={game.title}
              role="img"
            >
              {game.emoji}
            </span>
            <div
              style={{
                fontWeight: 700,
                color: "#FFCB05",
                fontSize: 22,
                marginBottom: 9,
                letterSpacing: 0.25,
                textShadow: "0 0 6px #fff5, 0 2px 8px #b8f8ff33",
                textAlign: "center"
              }}
            >
              {game.title}
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#fff",
                opacity: 0.87,
                marginBottom: 4,
                minHeight: 35,
                textAlign: "center"
              }}
            >
              {game.description}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: 18,
                right: 22,
                color: "#85fff7",
                fontSize: 16,
                opacity: 0.6
              }}
              aria-hidden="true"
            >
              Play →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ArcadeGamesPage;
