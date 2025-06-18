import React from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Renders the central Arcade Games page: displays a grid of available mini games.
 * - "Surprise Me" button selects a random game for the user to play.
 * - No Fun Zone content/APIs or related fetch/state logic.
 */
const GAME_LIST = [
  {
    key: "block-puzzle",
    title: "Block Puzzle",
    emoji: "🟪",
    description: "Arrange falling blocks and clear lines in this classic grid challenge.",
  },
  {
    key: "memory-match",
    title: "Memory Match",
    emoji: "🧠",
    description: "Flip over cards to find pairs. How good is your memory?",
  },
  {
    key: "memory-puzzle",
    title: "Memory Puzzle",
    emoji: "🧩",
    description: "Remember and repeat the sequence. Train your brain speed!",
  },
  {
    key: "reaction-speed",
    title: "Reaction Speed",
    emoji: "⚡",
    description: "Test your reflexes against the clock — are you quick enough?",
  },
  {
    key: "word-typing",
    title: "Word Typing",
    emoji: "⌨️",
    description: "Type words accurately and fast before the timer runs out.",
  },
  {
    key: "sudoku",
    title: "Sudoku",
    emoji: "🔢",
    description: "Fill in the grid — classic logic puzzle for puzzle enthusiasts.",
  },
  {
    key: "sliding-puzzle",
    title: "Sliding Puzzle",
    emoji: "🧊",
    description: "Slide tiles into place to recreate the picture or sequence.",
  },
];

function getRandomGameRoute() {
  const randomIndex = Math.floor(Math.random() * GAME_LIST.length);
  return `/games/${GAME_LIST[randomIndex].key}`;
}

// PUBLIC_INTERFACE
function ArcadeGamesPage() {
  const navigate = useNavigate();

  // Handler for the "Surprise Me" button.
  // Navigates user to a random game.
  function handleSurpriseMe() {
    navigate(getRandomGameRoute());
  }

  return (
    <div className="container" style={{ paddingTop: 72, paddingBottom: 64 }}>
      <section style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 className="title" style={{ fontSize: "2.6rem", marginBottom: 8 }}>
          🎲 Arcade Games
        </h1>
        <p className="description" style={{ maxWidth: 620, margin: "0 auto", color: "var(--text-secondary)" }}>
          Welcome to MiniMayhem Arcade! Dive into a world of quick and addictive browser games. Select a game below,
          or let fate pick for you.
        </p>
        <button
          className="btn btn-large"
          style={{
            marginTop: 18,
            fontWeight: 600,
            background: "linear-gradient(92deg,#ff6347 0%,#FFD600 100%)",
            color: "#23201e",
            letterSpacing: 0.5,
            border: "none",
            borderRadius: 6,
            boxShadow: "0 2px 14px #ffd60060",
            cursor: "pointer",
            fontSize: 18,
            padding: "13px 34px",
            transition: "background 0.18s, box-shadow 0.21s"
          }}
          onClick={handleSurpriseMe}
        >
          🎰 Surprise Me!
        </button>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 28,
          maxWidth: 950,
          margin: "0 auto",
        }}
      >
        {GAME_LIST.map((game) => (
          <div
            key={game.key}
            style={{
              padding: "27px 18px 21px 18px",
              background: "linear-gradient(113deg, #232949 0%, #173d83 100%)",
              borderRadius: 11,
              boxShadow: "0 3px 14px #0004, 0 1.5px 12px #2196f329",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              minHeight: 200,
              transition: "box-shadow 0.18s, transform 0.15s",
            }}
          >
            <span style={{ fontSize: 38, marginBottom: 16 }}>{game.emoji}</span>
            <h3 style={{ fontWeight: 700, fontSize: 23, margin: "0 0 7px 0", color: "#ffda73" }}>{game.title}</h3>
            <p style={{ color: "#fffbe7", fontSize: 15, lineHeight: 1.5, margin: 0, textAlign: "center" }}>
              {game.description}
            </p>
            <button
              className="btn"
              style={{
                marginTop: 16,
                padding: "9px 21px",
                fontWeight: 600,
                fontSize: 15,
                background: "linear-gradient(93deg,#00ffc2 10%,#46c5ff 95%)",
                color: "#233",
                border: "none",
                borderRadius: 5,
              }}
              onClick={() => navigate(`/games/${game.key}`)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArcadeGamesPage;
