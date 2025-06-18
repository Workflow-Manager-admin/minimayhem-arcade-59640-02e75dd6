import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// GOOGLE FONTS IMPORT (Orbitron & Press Start 2P)
const ArcadeFonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap');
    .arcade-font-orbitron {
      font-family: 'Orbitron', 'Arial', sans-serif !important;
      letter-spacing: 2px;
    }
    .arcade-font-pressstart {
      font-family: 'Press Start 2P', 'Orbitron', 'monospace' !important;
      letter-spacing: 1.6px;
    }
  `}</style>
);

const GAMES = [
  {
    title: "Block Puzzle",
    route: "/games/block-puzzle",
    emoji: "🧱",
    color: "#39A0ED",
    storageKey: "BlockPuzzle-lastScore",
  },
  {
    title: "Memory Match",
    route: "/games/memory-match",
    emoji: "🧠",
    color: "#FF8C00",
    storageKey: "MemoryMatch-lastScore",
  },
  {
    title: "Reaction Speed",
    route: "/games/reaction-speed",
    emoji: "⚡",
    color: "#F50057",
    storageKey: "ReactionSpeed-lastScore",
  },
  {
    title: "Sliding Puzzle",
    route: "/games/sliding-puzzle",
    emoji: "🧩",
    color: "#00E396",
    storageKey: "SlidingPuzzle-lastScore",
  },
  {
    title: "Sudoku",
    route: "/games/sudoku",
    emoji: "🧮",
    color: "#FFEB3B",
    storageKey: "Sudoku-lastScore",
  },
  {
    title: "Word Typing",
    route: "/games/word-typing",
    emoji: "⌨️",
    color: "#AA00FF",
    storageKey: "WordTyping-lastScore",
  },
];

// Custom neon/glassmorphic style palette
const COLORS = {
  glassBg: "rgba(18, 34, 49, 0.84)",
  glassBorder: "2.5px solid rgba(255,255,255,0.23)",
  cardShadow: "0 8px 26px 4px #00f2fe44, 0 1.5px 10px #3900fd66",
  neonGlow: "0 0 20px #fff, 0 2px 40px #49ffff88, 0 0 4px #fff9",
  focusOutline: "0 0 0 3px #21ffff, 0 0 16px 2px #1ce8fb44",
  btnArcade: `
    0 0 12px 1px #2fffdfbb,
    0 2px 16px #007cfb88,
    0 0 18px #fff8,
    0 1.8px 20px #2bfffa44
  `,
  badge: `
    linear-gradient(96deg,#17FFE2 0%,#28C2FF 100%),
    rgba(255,255,255,0.9)
  `,
};

// PUBLIC_INTERFACE
/**
 * Neon glassmorphic arcade game selection page with animated FunZone API zone.
 * Responsive 2x3 grid, badges for last score, playful Surprise Me, animated Fun Zone, accessible visuals/fonts.
 */
function ArcadeGamesPage() {
  const navigate = useNavigate();
  const [shuffling, setShuffling] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [lastScores, setLastScores] = useState({});
  const [funZoneData, setFunZoneData] = useState([]);
  const [funLoading, setFunLoading] = useState(true);
  const [funAnimIdx, setFunAnimIdx] = useState(0);
  const funAnimTimeout = useRef(null);

  // Get scores from localStorage for all games
  useEffect(() => {
    const scores = {};
    GAMES.forEach(g => {
      const val = localStorage.getItem(g.storageKey);
      if (val !== null) scores[g.storageKey] = val;
    });
    setLastScores(scores);
  }, []);

  // Fun Zone: fetch from all 3 APIs on mount or when refreshed
  const fetchFunZone = async () => {
    setFunLoading(true);
    try {
      // Parallel fetch: JokeAPI, QuotableAPI, NumbersAPI
      const [jokeRes, quoteRes, triviaRes] = await Promise.all([
        fetch("https://v2.jokeapi.dev/joke/Any?safe-mode&type=single,twopart"),
        fetch("https://api.quotable.io/random"),
        fetch(
          `https://numbersapi.com/${Math.floor(Math.random() * 100)}/trivia?json`
        ),
      ]);
      // JokeAPI parse:
      let jokeData;
      try {
        jokeData = await jokeRes.json();
      } catch {
        jokeData = { type: "single", joke: "Why did the arcade player win? Skill! 🎮" };
      }
      const joke =
        jokeData.type === "twopart"
          ? `${jokeData.setup}\n${jokeData.delivery}`
          : jokeData.joke;
      // QuotableAPI parse:
      let quoteData;
      try {
        quoteData = await quoteRes.json();
      } catch {
        quoteData = { content: "Be the high score in someone's life!", author: "MiniMayhem Arcade" };
      }
      // NumbersAPI:
      let triviaData;
      try {
        triviaData = await triviaRes.json();
      } catch {
        triviaData = { text: "42 is the answer to life, the universe, and everything." };
      }
      setFunZoneData([
        {
          label: "🎭 Joke",
          text: joke,
          color: "#09FFE0",
          bg: "linear-gradient(90deg,#060085,#09FFE0 80%)",
        },
        {
          label: "💬 Quote",
          text: `"${quoteData.content}" \n— ${quoteData.author}`,
          color: "#FF67E7",
          bg: "linear-gradient(90deg,#26004d,#FF67E7 90%)",
        },
        {
          label: "🎲 Trivia",
          text: triviaData.text,
          color: "#FFD600",
          bg: "linear-gradient(90deg,#232323 0,#FFD600 100%)",
        },
      ]);
      setFunAnimIdx(Math.floor(Math.random() * 3));
    } catch {
      setFunZoneData([
        {
          label: "Fun Unavailable",
          text: "Oops! The Fun Zone is recharging. Try refreshing below.",
          color: "#ffffff",
          bg: "linear-gradient(90deg,#3F51B5,#FF8C00)",
        },
      ]);
      setFunAnimIdx(0);
    } finally {
      setTimeout(() => setFunLoading(false), 350);
    }
  };
  useEffect(() => {
    fetchFunZone();
    return () => clearTimeout(funAnimTimeout.current);
  }, []);

  // Animate FunZone card every ~6s
  useEffect(() => {
    if (funLoading || funZoneData.length < 2) return;
    funAnimTimeout.current = setTimeout(
      () => setFunAnimIdx((ix) => (ix + 1) % funZoneData.length),
      6000
    );
    return () => clearTimeout(funAnimTimeout.current);
  }, [funLoading, funZoneData, funAnimIdx]);

  // SURPRISE ME — shuffle animation + random navigate
  const handleSurpriseMe = () => {
    setShuffling(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * GAMES.length);
      setSelectedIdx(idx);
      setTimeout(() => {
        setShuffling(false);
        // Navigate to random game
        navigate(GAMES[idx].route);
      }, 400);
    }, 800);
  };

  // Keyboard navigation for Surprise Me button
  const surpriseButtonRef = useRef(null);
  useEffect(() => {
    if (!shuffling && selectedIdx !== null) setSelectedIdx(null);
  }, [shuffling, selectedIdx]);

  // CARD hover/focus animation key
  const [focusedCard, setFocusedCard] = useState(null);

  // STYLES
  const styles = {
    root: {
      minHeight: "100vh",
      paddingTop: 112,
      paddingBottom: 38,
      background: "radial-gradient(ellipse at 48% 15%, #101731 82%, #0c002a 100%)",
      color: "#fff",
      fontFamily: "'Orbitron', 'Press Start 2P', Arial, sans-serif",
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    container: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "0 20px",
      width: "100%",
    },
    heroTitle: {
      fontFamily: "'Orbitron', Arial, sans-serif",
      fontWeight: 800,
      fontSize: "2.2rem",
      textShadow: COLORS.neonGlow,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 3,
      background: "linear-gradient(92deg,#0ff4ff,#fff,#fe2dff 80%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    heroDesc: {
      fontFamily: "'Press Start 2P', 'Orbitron', monospace",
      fontSize: "1.08rem",
      maxWidth: 600,
      margin: "0 auto 30px auto",
      textAlign: "center",
      color: "#c9ffff",
      textShadow: "0 1.5px 7px #00faf98a",
      letterSpacing: "0.04em",
      lineHeight: 1.5,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 32,
      marginBottom: 32,
    },
    card: (color, isHovered, isShuffling) => ({
      position: "relative",
      background: COLORS.glassBg,
      border: COLORS.glassBorder,
      borderRadius: 24,
      overflow: "visible",
      minHeight: 220,
      padding: "30px 18px 28px 18px",
      boxShadow: COLORS.cardShadow +
        (isHovered || isShuffling
          ? `,0 0 36px 7px ${color}80,0 2.5px 50px 2px ${color}80`
          : ""),
      transition: "transform 0.22s cubic-bezier(.67,.05,.31,.91), box-shadow 0.19s cubic-bezier(.67, .07, .31, .91)",
      transform: (isShuffling
        ? "scale(1.045) rotate(-1.5deg) skewY(2deg)"
        : isHovered ? "translateY(-8px) scale(1.03)" : "none"),
      outline: isHovered ? COLORS.focusOutline : "none",
      cursor: isShuffling ? "not-allowed" : "pointer",
      pointerEvents: isShuffling ? "none" : "auto",
      zIndex: isShuffling ? 1 : 0,
      opacity: isShuffling ? 0.78 : 1,
      userSelect: "none",
      willChange: "transform, box-shadow",
    }),
    cardTitle: (color) => ({
      fontFamily: "'Orbitron', 'Arial', sans-serif",
      fontWeight: 900,
      fontSize: "1.16rem",
      textShadow: `0 3px 12px #fff8, 0 2px 8px ${color}`,
      color,
      letterSpacing: 2,
      marginBottom: 14,
    }),
    emoji: (color) => ({
      fontSize: 54,
      marginBottom: "15px",
      filter: `drop-shadow(0 0 15px ${color}88)`,
      lineHeight: 1,
      transition: "transform 0.19s",
    }),
    playBtn: (color, isFocused) => ({
      fontFamily: "'Press Start 2P', 'Orbitron', monospace",
      padding: "13px 26px",
      fontSize: "1.02rem",
      background: `radial-gradient(ellipse at 50% 90%, #fff 60%,${color} 100%)`,
      border: "none",
      borderRadius: 14,
      color: "#000021",
      marginTop: 18,
      fontWeight: 900,
      textShadow: "0 2px 8px #fff, 0 2.5px 11px #fffc",
      boxShadow: COLORS.btnArcade,
      cursor: "pointer",
      letterSpacing: 2,
      outline: isFocused ? "3px solid #fff155" : "none",
      transition: "background 0.18s, box-shadow 0.18s, transform 0.16s",
      willChange: "transform, box-shadow",
    }),
    badge: (color) => ({
      position: "absolute",
      top: 14,
      right: 14,
      fontFamily: "'Press Start 2P', 'Orbitron', monospace",
      background: COLORS.badge,
      color: color,
      borderRadius: 12,
      fontSize: "0.75rem",
      padding: "7px 13px",
      fontWeight: 900,
      letterSpacing: 1,
      textShadow: `0 1.5px 4px #fff, 0 2px 7px ${color}`,
      boxShadow: `0 2px 17px 3px ${color}44`,
      border: "2px solid #fff4",
      zIndex: 8,
      filter: "drop-shadow(0 1.5px 8px #fff8)",
    }),
    surpriseZone: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "36px 0 6px 0",
    },
    surpriseBtn: (pressed) => ({
      fontFamily: "'Press Start 2P', 'Orbitron', monospace",
      fontSize: "1.18rem",
      background: `linear-gradient(87deg, #14ffe9 0%, #ffeb3b 82%, #fe2dff 100%)`,
      color: "#211366",
      border: "none",
      borderRadius: 20,
      padding: "18px 48px",
      boxShadow: COLORS.neonGlow + ",0 0 50px 1px #00fae0b1",
      cursor: "pointer",
      outline: pressed
        ? "3px solid #fff05f"
        : "none",
      transition: "transform 0.16s, box-shadow 0.23s, outline 0.12s",
      fontWeight: 900,
      letterSpacing: 2,
      marginBottom: 8,
      filter: pressed
        ? "brightness(95%) drop-shadow(0 0 18px #fff7)"
        : "drop-shadow(0 0 33px #00fff888)",
      willChange: "transform, box-shadow",
      animation: "arcadeSurpriseGlow .56s infinite alternate cubic-bezier(.75,.14,.77,.91)",
      "--shadow": "#ffd600",
    }),
    surpriseHint: {
      fontFamily: "'Orbitron', 'Arial', sans-serif",
      color: "#42ffe9",
      fontSize: "1rem",
      marginTop: 0,
      letterSpacing: 1.1,
      textShadow: "0 2px 10px #00e5ff80",
      textAlign: "center",
    },
    funZone: {
      margin: "46px auto 0 auto",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Orbitron', 'Press Start 2P', Arial, sans-serif",
      position: "relative",
    },
    funZoneTitle: {
      fontFamily: "'Orbitron', Arial",
      color: "#03fff7",
      fontSize: "1.22rem",
      marginBottom: 16,
      textShadow: COLORS.neonGlow,
      letterSpacing: 2.6,
      textAlign: "center",
    },
    funCard: (bg, color, active) => ({
      background: bg,
      color: color,
      borderRadius: 18,
      boxShadow: COLORS.neonGlow + ", 0 2.5px 16px 1px #1c807644" + (active ? ",0 0 48px 14px #fff2" : ""),
      minHeight: 92,
      minWidth: 320,
      maxWidth: 440,
      margin: "auto",
      padding: "28px 20px 22px 20px",
      display: active ? "block" : "none",
      fontWeight: 900,
      fontSize: "1.04rem",
      textAlign: "center",
      letterSpacing: 1.1,
      position: "relative",
      zIndex: 7,
      lineHeight: 1.55,
      opacity: active ? 1 : 0,
      border: "3px solid #1cefff77",
      filter: active ? "drop-shadow(0 1.5px 22px #13effabb)" : "",
      transition: "opacity 0.61s cubic-bezier(.6,.17,.62,1.04)",
      animation: active
        ? "funZoneFadeIn 0.68s cubic-bezier(.29,.86,.45,1) both"
        : "none",
    }),
    funZoneRefreshBtn: {
      fontFamily: "'Press Start 2P', 'Orbitron', monospace",
      padding: "8px 18px",
      fontSize: "0.95rem",
      background: "linear-gradient(91deg,#FF67E7 0%,#00fae0 100%)",
      color: "#151233",
      border: "none",
      borderRadius: 13,
      fontWeight: 900,
      letterSpacing: 1,
      marginTop: 16,
      boxShadow: "0 0 24px 2px #09ffd088",
      cursor: "pointer",
      outline: "none",
      transition: "background 0.16s, box-shadow 0.15s",
    },
  };

  // MEDIA QUERIES (Responsive) — add style block in JSX for brevity
  const responsiveCss = `
@media (max-width: 950px) {
  .mma-arcade-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 28px !important;
  }
}
@media (max-width: 650px) {
  .mma-arcade-grid {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
  }
  .mma-fun-card-inner {
    min-width: 0 !important;
    max-width: 97vw !important;
    padding-left: 10vw !important;
    padding-right: 10vw !important;
    font-size: 0.97rem !important;
  }
}
@keyframes arcadeSurpriseGlow {
  0% { box-shadow: 0 0 24px 1px #0fffa988,0 0 44px #FFEB3B88,0 2px 15px #fff4; }
  55% { box-shadow: 0 0 38px 4px #00faffd4,0 0 57px #ffeb3b77,0 3px 11px #fe2dff66; }
  90% { box-shadow: 0 0 30px 10px #fe2dffbb,0 2px 22px #ff6f0099,0 9px 18px #fff8; }
  100% { box-shadow: 0 0 33px 4px #ffeb3bcc,0 6px 21px #13fff988,0 4px 15px #fff5; }
}
@keyframes funZoneFadeIn {
  from { opacity: 0; transform: translateY(42px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;

  // Accessible ARIA/role for 'fun zone' and keyboard nav
  return (
    <>
      <ArcadeFonts />
      <style>{responsiveCss}</style>
      <div style={styles.root}>
        <div style={styles.container}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <h2 style={styles.heroTitle} className="arcade-font-orbitron">
              🎮 Arcade Hub & Fun Zone
            </h2>
            <div style={styles.heroDesc}>
              Six dazzling mini games await.<br />
              Aim high, claim the glowing badge, and unleash surprise fun!<br />
              <span style={{color:"#09FFE0",fontWeight:900,textShadow:"0 2px 12px #0ffb",fontSize:"1.01em"}}>Fully neon. Always arcade.</span>
            </div>
          </div>
          {/* Arcade Games Grid */}
          <section>
            <div
              className="mma-arcade-grid"
              style={styles.grid}
              aria-label="Arcade Games selection"
            >
              {GAMES.map((game, idx) => (
                <div
                  tabIndex={0}
                  key={game.title}
                  aria-label={`${game.title} game card`}
                  style={styles.card(game.color, focusedCard === idx, shuffling && selectedIdx !== idx)}
                  onMouseEnter={() => setFocusedCard(idx)}
                  onMouseLeave={() => setFocusedCard(null)}
                  onFocus={() => setFocusedCard(idx)}
                  onBlur={() => setFocusedCard(null)}
                  onClick={() => !shuffling && navigate(game.route)}
                  role="button"
                  onKeyDown={e => {
                    if ((e.key === "Enter" || e.key === " ") && !shuffling) {
                      navigate(game.route);
                    }
                  }}
                  aria-pressed="false"
                >
                  {lastScores[game.storageKey] && (
                    <div
                      style={styles.badge(game.color)}
                      aria-label={`Last Score: ${lastScores[game.storageKey]}`}
                    >
                      🔥 Last Score<br />{lastScores[game.storageKey]}
                    </div>
                  )}
                  <div style={styles.emoji(game.color)}>{game.emoji}</div>
                  <div style={styles.cardTitle(game.color)}>{game.title}</div>
                  <button
                    style={styles.playBtn(game.color, focusedCard === idx)}
                    className="arcade-font-pressstart"
                    onClick={e => {
                      e.stopPropagation();
                      if (!shuffling) navigate(game.route);
                    }}
                    tabIndex={-1}
                    aria-label={`Play ${game.title} now`}
                  >
                    Play Now
                  </button>
                </div>
              ))}
            </div>
          </section>
          {/* Surprise Me Button Zone */}
          <div style={styles.surpriseZone}>
            <button
              type="button"
              style={styles.surpriseBtn(shuffling)}
              ref={surpriseButtonRef}
              disabled={shuffling}
              aria-busy={shuffling}
              aria-label="Surprise Me - Play a Random Game"
              onClick={handleSurpriseMe}
              onKeyDown={e => {
                if ((e.key === "Enter" || e.key === " ") && !shuffling) {
                  handleSurpriseMe();
                }
              }}
            >
              🕹️ Surprise Me!
            </button>
            <div
              style={styles.surpriseHint}
              aria-live="polite"
            >
              {shuffling
                ? <span style={{ color: "#fff453" }}>
                    Shuffling the arcade...<span style={{animation:"arcadeSurpriseGlow 0.4s infinite alternate"}}> ✨</span>
                  </span>
                : <span>
                    Feeling lucky? Hit <strong>Surprise Me!</strong> for instant arcade adventure!
                  </span>
              }
            </div>
          </div>
          {/* Fun Zone Animated Carousel */}
          <section
            style={styles.funZone}
            id="fun-zone"
            tabIndex={-1}
            aria-label="Fun Zone: jokes, quotes, and trivia"
            aria-live="polite"
          >
            <h3 style={styles.funZoneTitle} className="arcade-font-orbitron">
              🌟 Fun Zone API — Fresh Jokes, Quotes, and Trivia!
            </h3>
            {funLoading ? (
              <div
                className="mma-fun-card-inner"
                style={styles.funCard("#002a60", "#06ffe9", true)}
                aria-busy="true"
              >
                <span style={{
                  fontSize:32,display:'inline-block',animation:'arcadeSurpriseGlow 0.84s infinite alternate'}}>⏳</span>
                Loading arcade fun...
              </div>
            ) : (
              funZoneData.map((fun, ix) => (
                <div
                  key={fun.label}
                  className="mma-fun-card-inner"
                  aria-label={fun.label}
                  style={styles.funCard(fun.bg, fun.color, funAnimIdx === ix)}
                >
                  <div
                    style={{
                      fontFamily: "'Press Start 2P','Orbitron', monospace",
                      fontSize: "1rem",
                      color: "#fff",
                      marginBottom: 10,
                      letterSpacing: 1.1,
                      textShadow: "0 1.5px 6px #fff8",
                      lineHeight: 1.1,
                    }}
                  >
                    {fun.label}
                  </div>
                  <div style={{whiteSpace:'pre-line',fontSize:'1.05em'}}>{fun.text}</div>
                </div>
              ))
            )}
            <button
              type="button"
              aria-label="Refresh Fun Zone"
              style={styles.funZoneRefreshBtn}
              onClick={() => {
                setFunLoading(true);
                fetchFunZone();
              }}
              tabIndex={0}
              disabled={funLoading}
            >
              🔁 Refresh Fun
            </button>
            <div
              aria-hidden="true"
              style={{
                marginTop:18,
                fontSize:"0.89em",
                color:"#72e8f8",
                textShadow: "0 1px 5px #20fff944",
                fontFamily: "'Orbitron', 'Arial', sans-serif",
                opacity: 0.84,
              }}>
              Powered by JokeAPI, Quotable, NumbersAPI
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default ArcadeGamesPage;
