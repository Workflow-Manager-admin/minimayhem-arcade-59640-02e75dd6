import React, { useEffect, useState } from "react";
import "./GamesPage.css";

// Arcade emoji/icons for each game
const GAME_DATA = [
  {
    id: "block-puzzle",
    emoji: "🟦",
    title: "Block Puzzle",
    description: "Fit falling blocks—Tetris-style! Stack for a high score.",
    route: "/games/block-puzzle",
  },
  {
    id: "memory-match",
    emoji: "🃏",
    title: "Memory Match",
    description: "Flip the cards! Find all pairs as fast as you can.",
    route: "/games/memory-match",
  },
  {
    id: "reaction-speed",
    emoji: "⚡",
    title: "Reaction Speed",
    description: "How quick are you? Tap when the screen flashes!",
    route: "/games/reaction-speed",
  },
  {
    id: "word-typing",
    emoji: "⌨️",
    title: "Word Typing",
    description: "How fast can you type? Beat the word rush.",
    route: "/games/word-typing",
  },
  {
    id: "sudoku",
    emoji: "🔢",
    title: "Sudoku",
    description: "Classic Sudoku fun—easy to diabolical. Can you solve it?",
    route: "/games/sudoku",
  },
  {
    id: "sliding-puzzle",
    emoji: "🧩",
    title: "Sliding Puzzle",
    description: "Slide the tiles to remake the picture. Tricky & fun!",
    route: "/games/sliding-puzzle",
  },
];

// Mock high scores - in real app, fetch from API or localStorage
function getHighScores() {
  // Example: use localStorage for per-game high scores
  let scores = {};
  try {
    const raw = localStorage.getItem("arcade-highscores");
    if (raw) scores = JSON.parse(raw);
  } catch {
    scores = {};
  }
  return scores;
}

// Set a fun retro arcade font – fallback to monospace
const arcadeFontStyle = {
  fontFamily: "'Press Start 2P', 'Orbitron', 'VT323', 'Audiowide', 'Monaco', 'Consolas', monospace",
};

function ArcadeWidget({ type }) {
  // Pick API depending on type
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  /** Fetch widget content (Joke, Quote, or Fact) from public APIs */
  const fetchData = async () => {
    setLoading(true);
    try {
      let text = "";
      if (type === "Joke") {
        // Free joke API
        const res = await fetch("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        const dat = await res.json();
        text = dat.joke;
      } else if (type === "Quote") {
        const res = await fetch("https://api.quotable.io/random");
        const dat = await res.json();
        text = "“" + dat.content + "” —" + dat.author;
      } else if (type === "Fact") {
        const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        const dat = await res.json();
        text = dat.text;
      }
      setData(text);
    } catch (err) {
      setData("Oops! Could not fetch.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={`arcade-widget arcade-widget-${type.toLowerCase()}`} style={arcadeFontStyle}>
      <div className="widget-header">{type}</div>
      <div className={`widget-content${loading ? " widget-loading" : ""}`}>
        {loading ? (
          <span className="widget-spinner" aria-label="Loading" />
        ) : (
          data
        )}
      </div>
      <button className="widget-refresh-btn neon-btn-glow" onClick={fetchData} aria-label={`Refresh ${type}`}>
        🔄
      </button>
    </div>
  );
}

function NeonBadge({ text }) {
  return (
    <span className="neon-badge" style={arcadeFontStyle}>
      {text}
    </span>
  );
}

// PUBLIC_INTERFACE
/** Main GamesPage component */
const GamesPage = () => {
  const [highScores, setHighScores] = useState({});

  useEffect(() => {
    setHighScores(getHighScores());
  }, []);

  // For animation on Surprise Me button
  const [surpriseIndex, setSurpriseIndex] = useState(null);
  const [surpriseJump, setSurpriseJump] = useState(false);

  // PUBLIC_INTERFACE
  /** Handles Surprise Me: go to a random game, and animate */
  const handleSurprise = () => {
    let idx;
    do {
      idx = Math.floor(Math.random() * GAME_DATA.length);
    } while (idx === surpriseIndex);
    setSurpriseIndex(idx);
    setSurpriseJump(true);

    // Animate before redirect (simulate arcade flash)
    setTimeout(() => {
      window.location.href = GAME_DATA[idx].route;
    }, 480);
    setTimeout(() => setSurpriseJump(false), 450);
  };

  return (
    <div className="games-page arcade-bg" style={arcadeFontStyle}>
      {/* Sticky navbar is in App.js via ArcadeNavBar */}

      <header className="arcade-header">
        <h1 className="arcade-title neon-text">🎮 CHOOSE YOUR GAME</h1>
        <p className="arcade-subtitle">
          Ready to play? Select any mini-game below—or press <span className="neon-badge neon-flash">Surprise Me!</span>
        </p>
      </header>

      <div className="games-grid-container">
        <div className="games-grid">
          {GAME_DATA.map((game, idx) => (
            <div
              key={game.id}
              className={`arcade-card neon-glass-card${surpriseIndex === idx && surpriseJump ? " shakey-pop" : ""}`}
              tabIndex={0}
              aria-label={game.title}
              style={arcadeFontStyle}
            >
              <div className="arcade-card-emoji">{game.emoji}</div>
              <div className="arcade-card-title">{game.title}</div>
              <div className="arcade-card-desc">{game.description}</div>
              <a
                href={game.route}
                className="arcade-play-btn neon-btn-glow"
                tabIndex={0}
                aria-label={`Play ${game.title}`}
              >
                Play Now
              </a>
              {highScores[game.id] != null && (
                <NeonBadge text={`🏅 High Score: ${highScores[game.id]}`} />
              )}
              {/* Placeholder for played badge */}
              {/* {Math.random() > 0.7 && <NeonBadge text="✨ Played" />} */}
            </div>
          ))}
        </div>
        <div className="side-widgets-arcade">
          <ArcadeWidget type="Joke" />
          <ArcadeWidget type="Quote" />
          <ArcadeWidget type="Fact" />
        </div>
      </div>
      <div className="arcade-footer-row">
        <button
          className={`arcade-surprise-btn neon-btn-arcade ${surpriseJump ? "surprise-jump" : ""}`}
          tabIndex={0}
          aria-label="Surprise Me!"
          onClick={handleSurprise}
        >
          <span className="surprise-sparkle">✨</span> Surprise Me!
        </button>
      </div>
      <footer className="arcade-footer-fun">
        <span>
          <span className="footer-flash">👾</span> MiniMayhem Arcade
        </span>
        <span className="footer-brand">Insert Fun. Play Bold.</span>
      </footer>
    </div>
  );
};

export default GamesPage;
