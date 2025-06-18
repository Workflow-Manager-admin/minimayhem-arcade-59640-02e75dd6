import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Arcade fonts and dynamic CSS for full-page vivid experience
const ARCADE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Press+Start+2P&family=VT323&display=swap');
.arcade-font { font-family: 'Press Start 2P','Orbitron','VT323','Bangers',monospace!important; }
.arcade-gradient-txt {
  background: linear-gradient(95deg, #FFD600 0%, #ff24e5 50%, #43E9FF 99%);
  color: transparent;
  -webkit-background-clip: text; background-clip: text;
  text-shadow: 0 2px 13px #5118ea6a,0 0 25px #fff05533;
}
`;
// Neon, glassmorphism, arcade hover/active state CSS styles
const ARCADE_CSS = `
.gamespage-global-bg {
  background: radial-gradient(circle at 18% 32%, #15002e 0%, #350066 20%, #1bc9ff1b 45%, #121218 92%);
  min-height: 100vh; overflow-x:hidden;
  box-shadow:0 0 88px 0 #2bf4ee22 inset;
  transition: background 0.5s;
}
.gamespage-header-hero {
  font-size: 2.4rem;
  font-family: 'Press Start 2P','Orbitron',monospace;
  text-align: center;
  padding-top: 104px;
  padding-bottom: 13px;
  user-select: none;
  color: #fff;
  text-shadow: 
    0 1.5px 18px #09ffe740, 
    0 0 19px #d200cfa9,
    0 2.5px 31px #ffd60060;
  letter-spacing:.09em;
  background: linear-gradient(94deg, #0c0034b3 0%, #310082ad 51%, #00fff5c9 100%);
  border-bottom: 2.5px solid #2bf4ee60;
  box-shadow: 0 7px 35px #1ecfff0b;
  animation: hero-float 2s cubic-bezier(.48,.3,.59,1.41) infinite alternate;
}
@keyframes hero-float { 0%{transform:translateY(0)} 100%{transform:translateY(7px) scale(1.02);} }
.gamespage-hero-desc {
  font-size:1.17rem;
  color:#fff9;
  text-shadow:0 2.1px 13px #FFD60054;
  font-family: 'Orbitron','VT323',monospace;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:12px;
  letter-spacing:.06em;
  background:rgba(16,15,56,0.21);
  border-radius:12px;
  padding:7.5px 12px 10px 12px;
  box-shadow:0 1px 15px #21d2ff1c;
  max-width: 540px;
  margin-left:auto;margin-right:auto;
}
.surprise-btn-row {
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin:24px auto 13px auto;
  position:relative;
  min-height:53px;
}
.surprise-btn-arcade {
  font-family:'Orbitron','Press Start 2P',monospace;
  font-size:1.19rem;
  border:none;
  border-radius:11px;
  background: linear-gradient(93deg, #FFD600 7%, #38ef7d 60%, #ef47cb 96%);
  color: #21205e;
  font-weight:900;
  box-shadow:0 2px 23px #cf08e333,0 0.5px 35px #00f7ffc1;
  letter-spacing:0.09em;
  padding:15px 40px;
  margin-top:0.3rem;margin-bottom:0.3rem;
  transition:transform 0.16s,box-shadow 0.16s,background 0.21s,filter .21s;
  outline:none;
  cursor:pointer;
  position:relative;
  z-index:2;
}
.surprise-btn-arcade:hover,.surprise-btn-arcade:focus {
  background: linear-gradient(98deg,#ff24e5,#FFD600 89%, #38ef7d 100%);
  color:#fff;
  text-shadow:0 0 7px #ffd600a0,0 2px 15px #ef47cb6a;
  box-shadow:0 0 30px #ffd600b5,0 12px 22px #43e9ff44;
  transform:scale(1.065) rotate(-2deg);
  filter: brightness(1.12);
}
.surprise-btn-tooltip {
  background:rgba(163,18,172,0.78);
  color:#F7EDFF;
  font-size:1rem;
  border-radius:8px;
  padding:6px 12px;
  font-family:'Orbitron','VT323',monospace;
  position:absolute;
  left:110%;top:55%;
  transform:translateY(-50%);
  white-space:nowrap;
  box-shadow:0 3px 13px #ebdffb44;
  border:1.7px solid #FFD600a5;
  opacity:0.94;
  pointer-events:none;
  z-index:10;
  animation: popInTooltip .7s cubic-bezier(.55,.10,.6,1.17);
}
@keyframes popInTooltip {0%{scale:0.92;opacity:0}100%{scale:1;opacity:.94}}
.arcade-games-grid-2x3 {
  display: grid;
  grid-template-columns: repeat(3,minmax(210px,1fr)); 
  grid-template-rows: repeat(2, 1fr);
  gap: 30px 18px;
  width:100%;
  max-width:980px;
  margin:38px auto 0 auto;
  padding-bottom: 12px;
  justify-items:center;
}
@media (max-width: 820px) {
  .arcade-games-grid-2x3 {
    grid-template-columns: repeat(2,minmax(190px,1fr));
    grid-template-rows: repeat(3,1fr);
    gap: 17px 11px;
    max-width:99vw;
  }
}
@media (max-width:570px) {
  .arcade-games-grid-2x3 {
    grid-template-columns:repeat(1, minmax(0, 1fr));
    gap:15px 2px;
    max-width:99vw;
    padding-left:2vw; padding-right:2vw;
  }
}
.arcade-game-card-outer {
  display:flex;align-items:stretch;justify-content:center;
  background:rgba(38,35,88,0.22);
  border-radius:19px;
  min-height:290px;min-width:220px;
  outline:none;
  transition:border-color .21s, box-shadow .17s;
}
.arcade-game-card-outer:focus-within,.arcade-game-card-outer:focus {
  border-color:#0fffb4;
  box-shadow:0 0 12px #ffd6007c,0 4px 29px #5118ea33;
}
.arcade-game-card {
  background: linear-gradient(141deg,#272473 38%,#a820c5 100%);
  border-radius:16px;
  color: #fff;
  text-align: center;
  padding:37px 21px 21px 21px;
  min-height:235px;
  min-width:188px;
  flex:1 1 0%;
  display:flex;
  flex-direction:column;
  align-items:center;
  position:relative;
  box-shadow:0 7px 22px #1a09ab39,0 2px 0 #ff43ef50;
  font-size:1.10rem;
  transition:transform .15s,box-shadow .19s,border-color .21s;
  cursor:pointer;
}
.arcade-game-card:hover,
.arcade-game-card:focus-within,
.arcade-game-card:focus {
  transform: translateY(-7px) scale(1.05) rotate(-0.8deg);
  box-shadow:0 12px 52px 8px #ffe18562,0 5px 30px 2px #43e9ff58;
  border:2.8px solid #ff24e5;
  z-index:4;
  outline:2px solid #FFD60099;
}
.arcade-game-icon {
  font-size:2.6rem;
  filter:drop-shadow(0 2px 18px #ffd60050);
  margin-bottom:13px;
  text-shadow:0 4px 13px #43e9ff36;
  padding-bottom:2px;
}
.arcade-game-title {
  font-family:'Orbitron','VT323',monospace;
  font-size:1.19rem;font-weight:bold;
  margin:8px 0 0px 0;letter-spacing:1.2px;
  text-shadow:0 2px 13px #FFD60055;
}
.arcade-game-desc {
  font-size:1.03rem;
  color:#cdf6ffce;
  margin-bottom:17px;min-height:42px;
  padding-top:9px;
  font-family:'VT323','Orbitron',monospace;
}
.arcade-last-score-row {
  font-size:0.95rem;
  color:#FFD600;
  background:#321fb9b0;
  border-radius: 8px;
  margin-bottom: 5px;
  margin-top: -7px;
  padding:5px 9px;
  display:flex;
  align-items:center;justify-content:center;gap:9px;
  font-family: 'VT323',monospace;
  box-shadow: 0 1px 5px #ffd60032;
}
.arcade-play-btn {
  background: linear-gradient(87deg, #FFD600 0%, #43E9FF 90%);
  border:none;
  border-radius:9px;
  font-family:'Bangers','VT323','Orbitron',monospace;
  color:#431600;font-size:1.08rem;font-weight:900;
  padding:11px 21px;margin:0 auto;
  margin-top:8px; letter-spacing:1.20px;
  cursor:pointer;outline:none;
  box-shadow:0 0 17px #ffd60060, 0 0.8px 20px #43E9FF55;
  transition:box-shadow 0.13s,transform .11s, background .17s;
}
.arcade-play-btn:hover,.arcade-play-btn:focus {
  background:linear-gradient(93deg,#ff24e5,#FFD600 90%);
  color:#fff;box-shadow:0 0 17px #FFD600a9;
  transform:scale(1.08) rotate(1.2deg);
}
.api-funzone-section {
  display:flex;flex-direction:row;gap:25px;justify-content:center;align-items:stretch;
  margin:64px auto 52px auto; padding-bottom:20px;
}
@media (max-width:820px) {.api-funzone-section{flex-direction:column;gap:19px;align-items:center;}}
.api-funzone-card {
  background:rgba(17,8,60,0.52);
  border:2.5px solid #16fff4;
  box-shadow:0 7px 38px #51aadb22,0 1px 18px #d200cf44;
  border-radius:18px;
  min-width:225px;max-width:310px;
  color:#F7EDFF;font-size:1.17rem;
  font-family:'Orbitron','VT323',monospace;
  font-weight:800;
  position:relative;
  min-height:85px;
  display:flex;flex-direction:column;align-items:center;
  justify-content:flex-start;
  padding:26px 20px 23px 20px;
  animation: apiZonePop .44s cubic-bezier(.69,.12,.36,1.1);
  transition:border-color .17s,box-shadow .13s;
}
.api-funzone-card:focus-within,.api-funzone-card:focus {
  border-color: #FFD600;
  box-shadow:0 4px 23px #FFD60088;
}
@keyframes apiZonePop {0%{scale:0.95;opacity:0}100%{scale:1;opacity:1}}
.api-funzone-header {
  font-size:1.02rem;
  color: #FFD600;
  font-family:'Orbitron','VT323',monospace;
  letter-spacing:.08em;
  margin-bottom:10px;
  display:flex;align-items:center;gap:7px;
  text-shadow:0 1.2px 8px #FFD60066;
}
.api-fun-refresh-btn {
  margin-top:16px;padding:7.5px 21px;border-radius:8px;border:none;
  font-size:1.07rem;background:linear-gradient(90deg,#FFD600,#43E9FF 90%);
  color:#180069;font-family:'Press Start 2P','VT323','Orbitron',monospace;
  font-weight:700;cursor:pointer;letter-spacing:0.09em;
  transition:background 0.11s,transform 0.13s;
  outline:none;
  box-shadow:0 0 8px #43E9FF44;
}
.api-fun-refresh-btn:hover,.api-fun-refresh-btn:focus {
  background:linear-gradient(94deg,#ff24e5,#FFD600 80%);
  color:#fff;transform:scale(1.10) rotate(-1.5deg);
}
.back-to-top-btn-games {
  background:linear-gradient(89deg,#FFD600,#43E9FF 100%);
  color:#2f0857;
  border: none;
  border-radius: 7.5px;
  font-family:'Orbitron','Press Start 2P',monospace;
  font-weight:900;
  font-size:1.01rem;
  margin: 28px auto 0 auto;
  padding: 10px 29px;
  display:block;
  box-shadow:0 2px 14px #ffd60060, 0 1px 8px #43E9FF44;
  cursor:pointer;
  letter-spacing:.06em;
  transition:background 0.18s,box-shadow 0.15s,transform 0.12s;
  outline:none;
}
.back-to-top-btn-games:hover, .back-to-top-btn-games:focus {
  background:linear-gradient(94deg,#ff24e5,#FFD600 80%);
  color:#fff;transform:scale(1.07);
}
.gamespage-footer-vibrant {
  background:linear-gradient(90deg,#5118ea 0,#a724eb 52%,#FFD600 100%);
  color:#fff;margin-top:60px;padding:32px 0 18px 0;border-top:4px solid #ffd600;
  text-align:center;display:flex;flex-direction:column;align-items:center;
  font-size:1.15rem;font-family:'VT323','Orbitron',monospace;position:relative;
  box-shadow:0 -3px 28px #ab00fd22;
}
.footer-gradient-txt {
  background:linear-gradient(95deg,#ffd600,#43E9FF 86%);
  background-clip:text;color:transparent;-webkit-background-clip:text;
  font-size:1.082em;font-weight:900;text-shadow:0 1.2px 8px #FFD60090;
}
::-webkit-scrollbar-thumb {background:linear-gradient(90deg,#ffd60077,#5118ea77);}
`;

// All games and their display properties. Extendable for routing and highscore tracking.
const ARCADE_GAMES = [
  {
    key: "block-puzzle",
    title: "Block Puzzle",
    desc: "Arrange falling blocks to clear lines and rake up points in classic style.",
    icon: "🧱",
    route: "/games/block-puzzle",
    color: "#43e9ff",
    bg: "linear-gradient(120deg,#114fb4 40%,#43e9ff 85%)",
  },
  {
    key: "memory-puzzle",
    title: "Memory Puzzle",
    desc: "Match pairs in a challenging arcade-style memory puzzle. Select your difficulty!",
    icon: "🟥",
    route: "/games/memory-puzzle",
    color: "#FFD600",
    bg: "linear-gradient(120deg,#ffd600 40%,#43e9ff 90%)",
  },
  // Removed Memory Match Card
  {
    key: "reaction-speed",
    title: "Reaction Speed",
    desc: "Test your reflexes! Tap quickly and outpace yourself.",
    icon: "⚡",
    route: "/games/reaction-speed",
    color: "#fcb045",
    bg: "linear-gradient(120deg,#a03100 40%,#fcb045 85%)",
  },
  {
    key: "word-typing",
    title: "Word Typing",
    desc: "Type the most words you can before time runs out. Speed up your typing game!",
    icon: "⌨️",
    route: "/games/word-typing",
    color: "#38ef7d",
    bg: "linear-gradient(120deg,#12bc45 40%,#38ef7d 90%)",
  },
  {
    key: "sudoku",
    title: "Sudoku",
    desc: "Fill in the Sudoku grid. No repeats—can you beat your fastest solve?",
    icon: "🔢",
    route: "/games/sudoku",
    color: "#ff184c",
    bg: "linear-gradient(120deg,#a6254f 40%,#ff184c 80%)",
  },
  {
    key: "sliding-tile",
    title: "Sliding Tile Puzzle",
    desc: "Slide the tiles to complete the puzzle as fast as you can!",
    icon: "🧩",
    route: "/games/sliding-tile",
    color: "#FFD600",
    bg: "linear-gradient(120deg,#FFF3B0 40%,#FFD600 80%)",
  }
];

// Get highscore and play count from localStorage
function getGameStats(gameKey) {
  const high = localStorage.getItem(`mma_${gameKey}_highscore`);
  const playCount = localStorage.getItem(`mma_${gameKey}_plays`);
  return {
    highscore: high !== null && !isNaN(high) ? parseInt(high) : null,
    playCount: playCount !== null && !isNaN(playCount) ? parseInt(playCount) : null,
  };
}

// Tooltip for the Surprise Me button
function SurpriseTooltip() {
  return (
    <span className="surprise-btn-tooltip" role="tooltip">
      Pick a random game for you to play!
    </span>
  );
}

// Utility random int
function rand(max) { return Math.floor(Math.random() * max); }

// Fetch jokes, quotes, facts from APIs
async function fetchJoke() {
  try {
    const r = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
    const data = await r.json();
    if (data && data.joke) return data.joke;
    if (data && data.setup && data.delivery)
      return `${data.setup} — ${data.delivery}`;
    throw new Error("No joke content");
  } catch {
    return "No joke could be loaded!";
  }
}
async function fetchQuote() {
  try {
    const r = await fetch("https://api.quotable.io/random?maxLength=110");
    const data = await r.json();
    if (data && data.content) return `${data.content} — ${data.author}`;
    throw new Error("No quote data");
  } catch {
    return "Couldn't fetch a quote right now.";
  }
}
async function fetchFact() {
  try {
    const num = rand(200) + 1; // 1-200
    const r = await fetch(`http://numbersapi.com/${num}/trivia`);
    return await r.text();
  } catch {
    return "Feeling fun, but no number fact loaded!";
  }
}

// Fun Zone Card – glassmorphic glowing API bubble
function FunZoneCard({ type, emoji, text, onRefresh, loading }) {
  return (
    <div className="api-funzone-card" tabIndex={0} aria-live="polite">
      <div className="api-funzone-header">
        <span aria-label={type}>{emoji}</span>
        {type}
      </div>
      <div>
        {!loading ? text : <span style={{ opacity: 0.7 }}>Loading...</span>}
      </div>
      <button
        className="api-fun-refresh-btn"
        onClick={onRefresh}
        disabled={loading}
        tabIndex={0}
        aria-label={`Refresh ${type}`}
      >
        🔄 {loading ? "Loading" : "Refresh"}
      </button>
    </div>
  );
}

// API Fun Zone Section for Jokes, Quotes, and Facts
function APIFunZone() {
  const [joke, setJoke] = useState({ val: "", loading: true });
  const [quote, setQuote] = useState({ val: "", loading: true });
  const [fact, setFact] = useState({ val: "", loading: true });

  const updateJoke = useCallback(async () => {
    setJoke({ val: "", loading: true });
    setJoke({ val: await fetchJoke(), loading: false });
  }, []);
  const updateQuote = useCallback(async () => {
    setQuote({ val: "", loading: true });
    setQuote({ val: await fetchQuote(), loading: false });
  }, []);
  const updateFact = useCallback(async () => {
    setFact({ val: "", loading: true });
    setFact({ val: await fetchFact(), loading: false });
  }, []);

  useEffect(() => { updateJoke(); updateQuote(); updateFact(); }, [updateJoke, updateQuote, updateFact]);

  // Auto-refresh motion (every 50 seconds)
  useEffect(() => {
    const tids = [
      setInterval(updateJoke, 50000),
      setInterval(updateQuote, 49000),
      setInterval(updateFact, 56000)
    ];
    return () => tids.forEach(clearInterval);
  }, [updateJoke, updateQuote, updateFact]);

  return (
    <section className="api-funzone-section" aria-label="API Fun Zone: Fun extras from the web">
      <FunZoneCard type="Joke" emoji="🎲" text={joke.val} onRefresh={updateJoke} loading={joke.loading} />
      <FunZoneCard type="Quote" emoji="💬" text={quote.val} onRefresh={updateQuote} loading={quote.loading} />
      <FunZoneCard type="Number Fact" emoji="🔢" text={fact.val} onRefresh={updateFact} loading={fact.loading} />
    </section>
  );
}

// PUBLIC_INTERFACE
/**
 * Main Games Page for MiniMayhem Arcade
 * - Sticky glassmorphic neon navbar (handled globally)
 * - Animated, responsive, accessible neon hero/header
 * - "Surprise Me!" button with arcade effects and keyboard/tap access
 * - Responsive, animated neon grid of 6 arcade game cards
 * - High score, play badge if played (per localStorage)
 * - Animated API Fun Zone at bottom (joke, quote, fact)
 * - Neon-glowing footer
 * - Full keyboard navigation and adaptive arcade style for mobile
 */
export default function ArcadeGamesPage() {
  const navigate = useNavigate();
  const topRef = useRef(null);

  // Animate/sound Surprise Me! (plays a system beep for effect)
  const handleSurpriseMe = useCallback(() => {
    try {window.navigator.vibrate?.(60);} catch {}
    try {new AudioContext().resume().then(()=>{const ctx=new AudioContext();const o=ctx.createOscillator();o.frequency.value=950;o.type="square";const g=ctx.createGain();g.gain.value=0.06;o.connect(g).connect(ctx.destination);o.start();setTimeout(()=>{o.stop();ctx.close()},110);});}catch{}
    const idx = rand(ARCADE_GAMES.length);
    navigate(ARCADE_GAMES[idx].route, { replace: false });
  }, [navigate]);

  // Play Now navigation (card or button)
  const handlePlayGame = useCallback(route => {
    navigate(route, { replace: false });
  }, [navigate]);

  // 2x3 grid of arcade cards
  const cards = useMemo(
    () => ARCADE_GAMES.map((game, idx) => {
      const stats = getGameStats(game.key);
      return (
        <div
          className="arcade-game-card-outer"
          key={game.key}
          tabIndex={0}
          aria-label={game.title + " arcade mini-game"}
          style={{
            border: `2.4px solid ${game.color}88`,
            boxShadow: `0 8px 26px 0 ${game.color}2b, 0 2px 0 #ff24e566`
          }}
        >
          <div
            className="arcade-game-card arcade-font"
            style={{
              background: game.bg,
              color: "#fff"
            }}
          >
            <div
              className="arcade-game-icon"
              aria-hidden="true"
              style={{
                color: game.color,
                filter: "drop-shadow(0 2px 19px #ffd6005a)",
                marginBottom: 17 + Math.round(Math.sin(idx) * 2.5) + "px"
              }}
            >
              {game.icon}
            </div>
            <div className="arcade-game-title" style={{
              textShadow: `0 2px 11px ${game.color}90, 0 0 7px #FFD60077`,
              color: "#fff"
            }}>
              {game.title}
            </div>
            <div className="arcade-game-desc">{game.desc}</div>
            {(stats.highscore !== null || stats.playCount !== null) && (
              <div className="arcade-last-score-row">
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
              className="arcade-play-btn"
              aria-label={`Play ${game.title} now`}
              tabIndex={0}
              style={{
                boxShadow: `0 0 10px ${game.color}66`
              }}
              onClick={e => {
                e.preventDefault();
                handlePlayGame(game.route);
              }}
              onKeyDown={e => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handlePlayGame(game.route);
                }
              }}
            >
              <span role="img" aria-hidden="true" style={{ fontSize: 19 }}>{game.icon}</span>
              Play Now
            </button>
          </div>
        </div>
      );
    }),
    [handlePlayGame]
  );

  // Responsive back to top navigation
  const handleBackToTop = useCallback(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      topRef.current.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <style>{ARCADE_FONTS + ARCADE_CSS}</style>
      <div ref={topRef} tabIndex={-1} />
      <main className="gamespage-global-bg" style={{ minHeight: "100vh", width: "100vw" }}>
        <header
          className="gamespage-header-hero arcade-font"
          tabIndex={0}
          aria-label="Games Page Hero Header"
        >
          <span role="img" aria-label="Arcade">🕹️</span>{" "}
          MiniMayhem Arcade: All the Mayhem, One Page!
        </header>
        <div className="gamespage-hero-desc arcade-font">
          <span>
            <span role="img" aria-label="sparkles">✨</span>
            Play 6 unique arcade games. Rack up highscores,<b> let the fun begin!</b>
            <span role="img" aria-label="joystick"> 🎮</span>
          </span>
        </div>
        <div className="surprise-btn-row">
          <button
            className="surprise-btn-arcade arcade-font"
            tabIndex={0}
            aria-label="Surprise Me! Play a random game"
            onClick={handleSurpriseMe}
            onKeyDown={e => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault(); handleSurpriseMe();
              }
            }}
          >🤩 Surprise Me!</button>
          <SurpriseTooltip />
        </div>
        <section className="arcade-games-grid-2x3" aria-label="Minigames grid">
          {cards}
        </section>
        <APIFunZone />
        <button
          className="back-to-top-btn-games"
          aria-label="Back to top"
          onClick={handleBackToTop}
          tabIndex={0}
        >
          <span role="img" aria-label="up">🔝</span> Back to Top
        </button>
        <footer className="gamespage-footer-vibrant arcade-font">
          <span>
            <span className="footer-gradient-txt">
              May the Highscore be with you! <span role="img" aria-label="trophy">🏆</span>
            </span>
            <br />
            MiniMayhem Arcade &copy; {new Date().getFullYear()}
          </span>
        </footer>
      </main>
    </>
  );
}
