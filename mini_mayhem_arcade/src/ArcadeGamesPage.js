import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * ArcadeGamesPage displays the collection of mini games as clickable cards.
 * Each card should link to its corresponding game route.
 */
function GamesPage() {
  // Updated routes for each game as per provided mapping.
  const games = [
    {
      name: "Memory Match",
      to: "/games/memory-match",
      desc: "Challenge your memory by matching pairs!",
      emoji: "🃏",
      color: "linear-gradient(91deg, #0093E9 0%, #80D0C7 100%)",
    },
    {
      name: "Memory Puzzle",
      to: "/games/memory-puzzle",
      desc: "Flip and remember tile positions!",
      emoji: "🧩",
      color: "linear-gradient(87deg, #ee9ca7 0%, #ffdde1 100%)",
    },
    {
      name: "Reaction Speed",
      to: "/games/reaction-speed",
      desc: "Test your reflexes and reaction time.",
      emoji: "⚡",
      color: "linear-gradient(98deg,#F7971E 0%,#FFD200 100%)",
    },
    {
      name: "Word Typing",
      to: "/games/word-typing",
      desc: "Type words quickly and accurately!",
      emoji: "⌨️",
      color: "linear-gradient(91deg, #834d9b 0%, #d04ed6 100%)",
    },
    {
      name: "Sudoku",
      to: "/games/sudoku",
      desc: "Solve the grid using logic and numbers.",
      emoji: "🔢",
      color: "linear-gradient(120deg,#00c6fb 0%,#005bea 100%)",
    },
    {
      name: "Sliding Puzzle",
      to: "/games/sliding-puzzle",
      desc: "Arrange tiles to complete the picture.",
      emoji: "🧊",
      color: "linear-gradient(87deg,#43cea2 0%,#185a9d 100%)",
    },
  ];

  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 40 }}>
      <h1 className="title" style={{ marginBottom: 20 }}>MiniMayhem Arcade</h1>
      <p className="subtitle" style={{ marginBottom: 38 }}>
        Choose your challenge—classic puzzles, speed tests, word games and more!
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
        {games.map((game) => (
          <Link
            key={game.name}
            to={game.to}
            style={{
              textDecoration: "none",
              minWidth: 210,
              maxWidth: 260,
              width: "100%",
              background: game.color,
              borderRadius: 16,
              padding: "28px 18px 23px",
              boxShadow: "0 4px 28px 1px #0a254133, 0 1.5px 0px #fff8 inset",
              transition: "transform 0.14s, box-shadow 0.17s",
              color: "#fff",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 22,
              transform: "scale(1)",
            }}
            className="game-card"
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 48, marginBottom: 9 }}>{game.emoji}</div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{game.name}</div>
            <div style={{ fontSize: 14, marginTop: 7, color: "#fff9", fontWeight: 400 }}>
              {game.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default GamesPage;
