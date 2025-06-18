import React, { useMemo, useRef, useCallback } from "react";

// PUBLIC_INTERFACE
/**
 * GamesPage: The arcade showcase for MiniMayhem!
 *  - 2x3 vibrant, responsive grid layout for six mini-games
 *  - Each card: arcade-themed icon, name, description, "Play Now" button with pixel/arcade animation, last highscore/play count (if present)
 *  - Arcade color palette: unique color for each game, pixel font, neon accents, animated/accessible buttons, hover/focus effects
 *  - Accessible: full keyboard support, tab order, back-to-top button
 *  - Optimized for lag-free UX (useMemo, refs, fast CSS), no external dependencies
 */

const ARCADE_FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Bangers&family=Orbitron:wght@900&display=swap');
`;

const GAMES = [
  {
    key: "block-puzzle",
    name: "Block Puzzle",
    desc: "Arrange falling blocks to clear lines and score big in classic arcade style.",
    icon: "🧱",
    route: "/games/block-puzzle",
    color: "#43e9ff",
    bg: "linear-gradient(120deg,#114fb4 40%,#43e9ff 85%)",
    alt: "Block Puzzle"
  },
  {
    key: "memory-match",
    name: "Memory Match",
    desc: "Flip and match cards. How good is your memory? Find out fast!",
    icon: "🃏",
    route: "/games/memory-match",
    color: "#ef47cb",
    bg: "linear-gradient(120deg,#a820c5 40%,#ef47cb 90%)",
    alt: "Memory Match"
  },
  {
    key: "reaction-speed",
    name: "Reaction Speed",
    desc: "Test your reflexes! Tap fast and beat your previous best.",
    icon: "⚡",
    route: "/games/reaction-speed",
    color: "#fcb045",
    bg: "linear-gradient(120deg,#a03100 40%,#fcb045 85%)",
    alt: "Reaction Speed"
  },
  {
    key: "word-typing",
    name: "Word Typing",
    desc: "Type as many words as you can before time runs out.",
    icon: "⌨️",
    route: "/games/word-typing",
    color: "#38ef7d",
    bg: "linear-gradient(120deg,#12bc45 40%,#38ef7d 90%)",
    alt: "Word Typing"
  },
  {
    key: "sudoku",
    name: "Sudoku",
    desc: "Fill in the grid—no repeats! Can you solve it faster than last time?",
    icon: "🔢",
    route: "/games/sudoku",
    color: "#ff184c",
    bg: "linear-gradient(120deg,#a6254f 40%,#ff184c 80%)",
    alt: "Sudoku"
  },
  {
    key: "sliding-tile",
    name: "Sliding Tile Puzzle",
    desc: "Slide pieces into place. Complete the picture in record time.",
    icon: "🧩",
    route: "/games/sliding-tile",
    color: "#FFD600",
    bg: "linear-gradient(120deg,#FFF3B0 40%,#FFD600 80%)",
    alt: "Sliding Tile Puzzle"
  }
];

const ARCADE_CSS = `
.gamespage-arcade-bg {
  min-height: 100vh;
  background: linear-gradient(110deg, #22007a 0%, #5118ea 34%, #FFD600 90%);
  font-family: 'VT323','Bangers','Orbitron',monospace;
}
.gamespage-header {
  padding: 90px 0 28px 0;
  text-align: center;
  background: linear-gradient(90deg, #22007a 15%, #FFD600 93%);
  color: #FFD600;
  font-family: 'Bangers','Orbitron',cursive;
  letter-spacing: 0.07em;
  font-size: 2.6rem;
  filter: drop-shadow(0 5px 32px #43e9ff70);
  text-shadow:0 2px 13px #5118ea6a,0 0 22px #fff05533;
  user-select: none;
}
.gamespage-intro {
  font-size: 1.2rem;
  margin: 0 auto 4px auto;
  color: #fffcee;
  text-shadow: 0 1.2px 13px #1a003a70,0 0 17px #ffd60060;
  max-width: 650px;
  padding-bottom: 13px;
}
.games-grid {
  margin: 0 auto 35px auto;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 38px 20px;
  padding: 20px 14px;
}
@media (max-width:950px){
  .games-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width:700px){
  .games-grid { grid-template-columns: 1fr; gap: 18px 0;}
  .gamespage-header { font-size: 1.6rem; }
}
.game-card-outer {
  border-radius: 20px;
  overflow: hidden;
  transition: box-shadow 0.17s,transform 0.13s;
  box-shadow: 0 8px 26px #0029b244, 0 2px 0 #ff24e566;
  position: relative;
  outline: none;
}
.game-card-outer:focus-within {
  box-shadow: 0 0 0 5px #FFD600cc,0 7px 30px #43E9FF80;
  z-index:2;
  transform: scale(1.04);
}
.game-card {
  border-radius: 20px;
  padding: 33px 18px 23px 18px;
  min-height: 265px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  transition: background 0.22s,box-shadow 0.13s,transform 0.11s;
  cursor: pointer;
}
.game-card:hover, .game-card:focus-within {
  transform: scale(1.025) rotate(-1deg) translateY(-8px);
  box-shadow: 0 15px 60px 3px #FFD60090, 0 9px 33px #43e9ff4c;
  z-index:3;
}
.game-icon {
  font-size: 2.88rem;
  filter:drop-shadow(0 3px 10px #ffd60050);
  margin-bottom: 13px;
  user-select: none;
}
.game-title {
  margin: 1px 0 4px 0;
  font-size: 1.23rem;
  font-family: 'Orbitron','VT323',monospace;
  font-weight: 800;
  letter-spacing: 1.4px;
  color:#fff;
  text-shadow: 0 1.2px 8px #ffd60080;
}
.game-desc {
  font-family:inherit;
  font-size:1.08rem;
  color: #cdf6ffeb;
  min-height:60px;
  text-align:center;
  margin-bottom:9px;
  margin-top: 3px;
}
.last-score-row {
  font-size:1.09rem; 
  margin: 7px 0 6px 0;
  color:#FFD600;
  text-shadow: 0 0 8px #FFD60099;
}
.arbtn {
  margin-top: 12px;
  padding: 13px 15px 13px 30px;
  background: linear-gradient(97deg,#FFD600 10%,#43E9FF 90%);
  font-family: 'Bangers','VT323',monospace;
  font-size:1.13rem;
  letter-spacing:1.7px;
  font-weight:900;
  color:#100062;
  border:none;
  border-radius:12px;
  box-shadow: 0 0 18px #FFD60066,0 1px 22px #43e9ff40;
  position:relative;
  cursor:pointer;
  transition: box-shadow 0.13s,background 0.16s,transform 0.13s;
  outline: none;
  text-transform:uppercase;
  min-width:105px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}
.arbtn:after {
  content: '';
  display:block;
  position:absolute;
  left:14px; top:51%;
  width:15px;height:15px;border-radius:50%;
  background: radial-gradient(circle,#fff700 60%,#43e9ff 100%);
  box-shadow: 0 0 6px 3px #fae90a88,0 0 23px #43e9ff60;
  transform:translateY(-50%);
  transition:filter 0.14s,background 0.12s;
  filter: blur(0.2px);
}
.arbtn:hover, .arbtn:focus {
  background: linear-gradient(99deg,#ff24e5 15%,#FFD600 100%);
  color:#fff;
  box-shadow: 0 0 32px #FFD60090;
  transform:scale(1.0708) rotate(-2deg);
}
.arbtn:active {
  background:linear-gradient(98deg,#FFD600 25%,#43E9FF 80%);
  filter:brightness(0.98);
  transform:scale(0.97);
}
.gamespage-footer {
  width:100%;margin:36px 0 0 0;
  padding:31px 0 21px 0;
  background: linear-gradient(90deg,#5118ea 0%,#FFD600 99%);
  color: #fff;font-family:'VT323','Orbitron',monospace;
  text-align:center;
  font-size:1.18rem;
  position:relative;
  border-top: 4px solid #ffd600;
  box-shadow: 0 -4px 21px #a820c522;
}
.back-to-top-btn {
  position:fixed;
  bottom:36px; right:24px;
  z-index:55;
  background: linear-gradient(90deg, #FFD600,#43E9FF 100%);
  color:#160097;
  padding:13px 19px 13px 17px;
  border:none; border-radius:11px;
  font-family:'Bangers','Orbitron',cursive;
  font-size:1.13rem;font-weight:800;
  box-shadow: 0 2px 12px #43e9ff90,0 0 26px #ffd60060;
  letter-spacing:1.2px;
  cursor:pointer;
  opacity:0.96;
  transition:background 0.13s,transform .12s;
  outline:none;
  display:flex;align-items:center;gap:10px;
}
.back-to-top-btn:hover,.back-to-top-btn:focus {
  background: linear-gradient(90deg,#ff24e5,#FFD600 92%);
  color:#fff;
  box-shadow:0 0 17px #FFD60090,0 4px 21px #43E9FF77;
  transform:scale(1.07) rotate(-3deg);
}
`;

// Utility: Get the localStorage value for a specific game's stats/prefs
function getGameStats(gameKey) {
  // By convention, use: "mma_{gameKey}_highscore" or "mma_{gameKey}_plays"
  let high = localStorage.getItem(`mma_${gameKey}_highscore`);
  let playCount = localStorage.getItem(`mma_${gameKey}_plays`);
  // Use parseInt if playCount exists, both as numbers for display
  high = high !== null && !isNaN(high) ? parseInt(high) : null;
  playCount = playCount !== null && !isNaN(playCount) ? parseInt(playCount) : null;
  return { highscore: high, playCount };
}

export default function GamesPage() {
  // Ref for top of content, for back-to-top
  const topRef = useRef(null);

  // Go to game route (use <a> to avoid dependency on router for now)
  const getGameRoute = useCallback(route => {
    if (route && route.startsWith("/")) {
      window.location.href = route;
    }
  }, []);

  // For lag-free: Memoize all cards so re-renders are minimized
  const cards = useMemo(() => GAMES.map((game, idx) => {
    // Arcade font+arcade-color theme per card
    // For accessibility, set tabIndex=0 for the outer (focus border), button for navigation
    const stats = getGameStats(game.key);

    return (
      <div
        className="game-card-outer"
        key={game.key}
        tabIndex={0}
        aria-label={game.name + " arcade minigame"}
        style={{
          border: `2.6px solid ${game.color}88`,
          boxShadow: `0 8px 30px 0 ${game.color}33, 0 2px 0 #ff24e566`
        }}
      >
        <div
          className="game-card arcade-font"
          style={{
            background: game.bg,
            color: "#fff",
          }}
        >
          <div
            className="game-icon"
            aria-hidden="true"
            style={{
              color: game.color,
              filter: "drop-shadow(0 2px 19px #fff4)",
              marginBottom: 16 + Math.round(Math.sin(idx) * 3) + "px" // makes icons "stagger"
            }}
          >
            {game.icon}
          </div>
          <div
            className="game-title"
            style={{
              textShadow: `0 2px 12px ${game.color}80, 0 0 7px #FFD60088`,
              color: "#fff",
            }}
          >
            {game.name}
          </div>
          <div className="game-desc">{game.desc}</div>
          {(stats.highscore !== null || stats.playCount !== null) && (
            <div className="last-score-row">
              {stats.highscore !== null && (
                <span>
                  <span role="img" aria-label="Trophy">🏆</span>
                  High: <b>{stats.highscore}</b>
                </span>
              )}
              {"  "}
              {stats.playCount !== null && (
                <span style={{ marginLeft: 7 }}>
                  <span role="img" aria-label="Plays">🎮</span>
                  Played: <b>{stats.playCount}</b>
                </span>
              )}
            </div>
          )}
          <button
            className="arbtn"
            aria-label={`Play ${game.name} now`}
            tabIndex={0}
            style={{
              boxShadow: `0 0 11px ${game.color}66`,
              background: `linear-gradient(97deg,${game.color} 40%,#FFD600 90%)`,
            }}
            onClick={e => {
              e.preventDefault();
              getGameRoute(game.route);
            }}
            onKeyDown={e => {
              // Space or Enter triggers play
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                getGameRoute(game.route);
              }
            }}
          >
            <span role="img" aria-hidden="true" style={{ fontSize: 19 }}>{game.icon}</span>
            Play Now
          </button>
        </div>
      </div>
    );
  }), [getGameRoute]);

  // Keyboard shortcut for "Back to Top" (PageUp, Home): focus top element
  const handleBackToTop = useCallback(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus header for accessibility
      topRef.current.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <style>
        {ARCADE_FONT_IMPORT}
        {ARCADE_CSS}
      </style>
      {/* Top anchor for back-to-top */}
      <div ref={topRef} tabIndex={-1} />
      <div className="gamespage-arcade-bg">
        <header
          className="gamespage-header arcade-font"
          tabIndex={0}
          aria-label="Games Page Header"
        >
          <span role="img" aria-label="Arcade">🕹️</span>{" "}
          Welcome to the MiniMayhem Arcade!
        </header>
        <div className="gamespage-intro arcade-font">
          <span>
            <span role="img" aria-label="sparkles">✨</span>
            Dive into 6 unique arcade mini-games!
            Race for highscores, challenge your friends, and <b>let the mayhem begin</b>.
            <span role="img" aria-label="joystick"> 🎮</span>
          </span>
        </div>
        <main className="games-grid" aria-label="Minigames grid">
          {cards}
        </main>
        {/* Back to Top floating button */}
        <button
          className="back-to-top-btn"
          aria-label="Back to top"
          onClick={handleBackToTop}
          tabIndex={0}
        >
          <span role="img" aria-label="up">🔝</span> Back to Top
        </button>
        <footer className="gamespage-footer arcade-font">
          <span>
            <span style={{
              background: "linear-gradient(93deg,#FFD600,#43E9FF 70%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontWeight: 900,
              fontSize: "1.18em",
              textShadow: "0 2px 10px #FFD60080"
            }}>
              Play on. Score High. <span role="img" aria-label="Arcade">🕹️</span>
            </span> <br />
            MiniMayhem Arcade &copy; {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </>
  );
}
