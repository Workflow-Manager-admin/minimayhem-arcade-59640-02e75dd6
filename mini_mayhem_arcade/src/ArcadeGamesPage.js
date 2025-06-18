import React from "react";

// PUBLIC_INTERFACE
/**
 * MiniMayhem Arcade - Games Page
 *
 * Displays arcade header, game grid (mini games), and Surprise Me button.
 * Stripped of all Fun Zone API fetch logic, fun content, jokes, quotes, and numbers.
 * Only pure UI for games and Surprise Me functionality remains.
 */

const GAMES = [
  {
    name: "Block Puzzle",
    route: "/games/block-puzzle",
    emoji: "🟦",
    description: "Test your spatial IQ in this classic block game.",
  },
  {
    name: "Memory Match",
    route: "/games/memory-match",
    emoji: "🧠",
    description: "How sharp is your memory? Find matching pairs.",
  },
  {
    name: "Memory Puzzle",
    route: "/games/memory-puzzle",
    emoji: "🧩",
    description: "Visual memory challenge. Remember, then solve!",
  },
  {
    name: "Reaction Speed",
    route: "/games/reaction-speed",
    emoji: "⚡",
    description: "How fast can you react? Beat your best time.",
  },
  {
    name: "Word Typing",
    route: "/games/word-typing",
    emoji: "⌨️",
    description: "Type the given words as fast and accurately as possible.",
  },
  {
    name: "Sudoku",
    route: "/games/sudoku",
    emoji: "🔢",
    description: "Logic and numbers! Solve Sudoku puzzles.",
  },
  {
    name: "Sliding Puzzle",
    route: "/games/sliding-puzzle",
    emoji: "🧊",
    description: "Slide the tiles to solve the picture puzzle.",
  },
];

const gameCardStyle = {
  background: "linear-gradient(111deg, #232b67 0%, #28398b 100%)",
  border: "2px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 24,
  textAlign: "center",
  boxShadow: "0 3px 24px 0 #00000025",
  color: "#FFF",
  minWidth: 160,
  position: "relative",
  transition: "transform 0.21s, box-shadow 0.23s",
  cursor: "pointer",
  margin: 0,
  outline: "none",
};

const gameGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 28,
  marginTop: 36,
  marginBottom: 12,
};

const headerStyle = {
  textAlign: "center",
  marginTop: 78,
  marginBottom: 22,
  color: "#fff",
  fontFamily: "'Orbitron', 'Arial', sans-serif",
  textShadow: "0 2px 20px #425dff55",
};

const btnSurprise = {
  background: "linear-gradient(93deg,#ff6347 0%,#FFC107 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 7,
  fontWeight: "700",
  fontFamily: "'Orbitron',sans-serif",
  fontSize: "1.05rem",
  padding: "13px 32px",
  cursor: "pointer",
  boxShadow: "0 4px 20px 0 #ffae0072",
  margin: "34px auto 10px auto",
  display: "block",
  transition: "transform 0.17s, box-shadow 0.15s",
};

const subheaderStyle = {
  color: "#FFD600",
  fontSize: "1.42rem",
  fontWeight: "bolder",
  letterSpacing: 0.6,
  marginBottom: 6,
  marginTop: 8,
};

function ArcadeGamesPage() {
  // Surprise Me handler: pick a random game and navigate.
  const handleSurprise = () => {
    const games = GAMES;
    const rand = Math.floor(Math.random() * games.length);
    window.location.href = games[rand].route;
  };

  return (
    <div className="games-page" style={{ maxWidth: 950, margin: "0 auto", paddingBottom: 44 }}>
      <header style={headerStyle}>
        <div
          style={{
            fontSize: 41,
            fontWeight: 800,
            fontFamily: "'Press Start 2P', 'Orbitron', sans-serif",
            color: "#FFD600",
            letterSpacing: 1.2,
            textShadow: "0 0 18px #fff74596"
          }}
        >
          🕹️ MiniMayhem Arcade
        </div>
        <div style={subheaderStyle}>
          Choose Your Game
        </div>
      </header>

      <div style={gameGridStyle} data-testid="games-grid">
        {GAMES.map((g, i) => (
          <a
            key={g.route}
            href={g.route}
            style={{
              ...gameCardStyle,
            }}
            tabIndex={0}
            aria-label={g.name + " - " + g.description}
            className="game-card"
          >
            <div style={{ fontSize: 44, marginBottom: 9 }}>{g.emoji}</div>
            <strong style={{ fontSize: 20 }}>{g.name}</strong>
            <div style={{ fontSize: 13, color: "#fffbeecc", marginTop: 10 }}>{g.description}</div>
          </a>
        ))}
      </div>

      {/* "Surprise Me" Button */}
      <button
        style={btnSurprise}
        type="button"
        onClick={handleSurprise}
        data-testid="surprise-btn"
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={e => (e.currentTarget.style.transform = "")}
        onMouseLeave={e => (e.currentTarget.style.transform = "")}
      >
        🎲 Surprise Me
      </button>
    </div>
  );
}

export default ArcadeGamesPage;
