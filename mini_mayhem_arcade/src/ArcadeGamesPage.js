import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Font import (Orbitron & Press Start 2P), one-time style injection for arcade look
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Press+Start+2P&display=swap";
if (!document.getElementById("arcade-font-import")) {
  const link = document.createElement("link");
  link.id = "arcade-font-import";
  link.rel = "stylesheet";
  link.href = fontUrl;
  document.head.appendChild(link);
}

// --- Game list definition ---
const GAMES = [
  {
    title: "Block Puzzle",
    emoji: "🔲",
    route: "/games/block-puzzle",
    color: "linear-gradient(120deg, #00ffe7 0%, #7f78eb 100%)",
    storageKey: "score-block-puzzle",
    desc: "Fit them all!"
  },
  {
    title: "Memory Match",
    emoji: "🧠",
    route: "/games/memory-match",
    color: "linear-gradient(120deg, #ffdf6e 0%, #ff47ff 87%)",
    storageKey: "score-memory-match",
    desc: "Remember them all!"
  },
  {
    title: "Reaction Speed",
    emoji: "⚡",
    route: "/games/reaction-speed",
    color: "linear-gradient(120deg, #ff2f2f 0%, #ffc93c 100%)",
    storageKey: "score-reaction-speed",
    desc: "Tap in time!"
  },
  {
    title: "Word Typing",
    emoji: "⌨️",
    route: "/games/word-typing",
    color: "linear-gradient(120deg, #48ff74 0%, #18b4ff 100%)",
    storageKey: "score-word-typing",
    desc: "Type fast!"
  },
  {
    title: "Sudoku",
    emoji: "🧩",
    route: "/games/sudoku",
    color: "linear-gradient(120deg, #fdc741 0%, #ff6486 100%)",
    storageKey: "score-sudoku",
    desc: "Solve the grid!"
  },
  {
    title: "Sliding Puzzle",
    emoji: "🔀",
    route: "/games/sliding-puzzle",
    color: "linear-gradient(140deg, #38f9d7 6%, #f1e215 75%, #ff2a68 100%)",
    storageKey: "score-sliding-puzzle",
    desc: "Slide to win!"
  }
];

// Arcade glassmorphism and neon shadow helpers
const glassCard =
  "backdrop-filter: blur(12px); background:rgba(28,36,54,0.62); box-shadow:0 0 20px #13e7ff88,0 4px 30px #5500ff38; border:2.4px solid rgba(255,255,255,0.19); border-radius: 18px;";
const arcadeText =
  "'Press Start 2P', 'Orbitron', 'Arial Black', 'Arial', sans-serif";

// Arcade arcade 3D/pulse button style (dynamically modifiable)
const arcadeBtnStyle = {
  fontFamily: arcadeText,
  padding: "14px 28px",
  background: "linear-gradient(90deg,#00e1ffc7,#ff3aceb7)",
  color: "#fff",
  border: "3px solid #73fff2cc",
  borderRadius: "9px",
  boxShadow:
    "0 2px 30px 0 #0ffad770, 0 4px 22px #ff2ef080, 0 0 16px #73fff277",
  fontSize: "1.22rem",
  fontWeight: 900,
  outline: "none",
  cursor: "pointer",
  position: "relative",
  transition:
    "transform 0.19s cubic-bezier(.25,2,.6,.97), box-shadow 0.21s, background 0.14s",
  textShadow: "0 2px 9px #f3c8ff70, 0 5px 24px #1de7e9cc, 0 1.5px 0 #000",
  margin: "0.5rem 0",
  letterSpacing: "1.3px",
  zIndex: 1
};

const extraArcadeBtnPress = {
  transform: "scale(0.92) translateY(1.5px)",
  boxShadow: "0 0 22px #fcffc660,0 1.5px 8px #1cffd680"
};

// Keyboard focus ring for accessibility
const focusRing = {
  boxShadow: "0 0 0 3px #fffd856b,0 0 18px 8px #00ffe588"
};

// --- Fun Zone APIs ---
const FUN_ZONE_APIS = [
  {
    id: "joke",
    title: "JokeAPI",
    endpoint: "https://v2.jokeapi.dev/joke/Any?blacklistFlags=sexist,explicit",
    color: "linear-gradient(110deg,#fff77e 0%,#ff2ea9 97%)",
    emoji: "🤣"
  },
  {
    id: "quote",
    title: "QuotableAPI",
    endpoint: "https://api.quotable.io/random",
    color: "linear-gradient(110deg,#84ffda 0%,#3d7aff 97%)",
    emoji: "📢"
  },
  {
    id: "number",
    title: "NumbersAPI",
    endpoint: "https://api.mathjs.org/v4/?expr=randomInt(1,10000)",
    color: "linear-gradient(110deg,#ffe47c 0%,#ff3b3b 97%)",
    emoji: "🔢"
  }
];

// --- Glass effect and neon/particle animated helpers ---
const glassify = {
  backdropFilter: "blur(14px)",
  background: "rgba(40,60,97,0.50)",
  border: "2.4px solid rgba(255,255,255,0.22)",
  borderRadius: "18px",
  boxShadow:
    "0 0 20px #0ffaf877,0 10px 28px #6f36eb51,0 0 8px #f7c23e38",
  overflow: "hidden"
};

const neonGlow = {
  textShadow:
    "0 2px 12px #08fff9d7,0 0 18px #00fff5cc, 0 4px 34px #f713ff55"
};

// Utility to get last score
function getLastScore(key) {
  // Only allow string/numeric values for badges.
  try {
    let value = window.localStorage.getItem(key);
    if (value && value.length > 12) value = value.slice(0, 9) + "…";
    return value;
  } catch {
    return undefined;
  }
}

// Accessible random int
function getRandomInt(n) {
  return Math.floor(Math.random() * n);
}

// --- Fun Zone: fetchers ---
const fetchFunZone = {
  joke: async () => {
    const resp = await fetch(FUN_ZONE_APIS[0].endpoint);
    if (!resp.ok) return "Could not fetch joke.";
    const data = await resp.json();
    if (data.type === "single") return data.joke;
    if (data.type === "twopart") return data.setup + " " + data.delivery;
    return "No joke found.";
  },
  quote: async () => {
    const resp = await fetch(FUN_ZONE_APIS[1].endpoint);
    if (!resp.ok) return "Could not fetch quote.";
    const data = await resp.json();
    return `"${data.content}" — ${data.author}`;
  },
  number: async () => {
    const num = await fetch(FUN_ZONE_APIS[2].endpoint).then((r) => r.text());
    // use NumbersAPI text fact
    const resp = await fetch(
      `https://numbersapi.com/${parseInt(num, 10)}/trivia`
    );
    if (!resp.ok) return "Could not fetch trivia.";
    return await resp.text();
  }
};

// --- Arcade Game Card Component ---
function ArcadeGameCard({
  game,
  tabIndex,
  onPlayClick,
  isFocused,
  onMouseOver,
  onMouseOut
}) {
  const lastScore = getLastScore(game.storageKey);

  return (
    <div
      role="group"
      tabIndex={tabIndex}
      aria-label={game.title + (lastScore ? ", last score " + lastScore : "")}
      onKeyDown={(e) => {
        // Allow Enter or Space to trigger the Play Now button when card is focused
        if (
          (e.key === "Enter" || e.key === " ") &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.shiftKey
        ) {
          onPlayClick();
        }
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{
        ...glassify,
        background: game.color,
        minHeight: 166,
        boxShadow:
          "0 4px 24px " +
          (isFocused ? "#fffad5" : "#13e7ff70") +
          ",0 0 16px #" +
          (isFocused ? "ff349cbb" : "13e7ffdd"),
        outline: isFocused ? "none" : undefined,
        border:
          "2.5px solid " +
          (isFocused
            ? "rgba(255,255,140,0.52)"
            : "rgba(255,255,255,0.18)"),
        transition: "box-shadow 0.21s, border 0.19s, background 0.22s"
      }}
      className="arcade-grid-card"
    >
      <div
        style={{
          fontSize: 42,
          textAlign: "center",
          marginTop: 12,
          filter: "drop-shadow(0 0 3px #fff)",
          lineHeight: 1
        }}
        aria-hidden="true"
      >
        {game.emoji}
      </div>
      <div
        style={{
          fontFamily: arcadeText,
          fontSize: 23,
          lineHeight: 1.2,
          margin: "14px 0 5px 0",
          ...neonGlow,
          textAlign: "center",
          letterSpacing: "1.2px"
        }}
      >
        {game.title}
      </div>
      <div
        style={{
          fontFamily: arcadeText,
          fontSize: 13,
          color: "#ffe",
          opacity: 0.62,
          textAlign: "center",
          marginBottom: lastScore ? 2 : 8
        }}
      >
        {game.desc}
      </div>
      {lastScore && (
        <span
          tabIndex={-1}
          style={{
            display: "inline-block",
            background:
              "repeating-linear-gradient(90deg,#fffdaf 0px, #ffe35a 17px,#ff5aaf 35px,#ffd98a 50px)",
            color: "#320055",
            padding: "2.8px 10px 2.2px 10px",
            margin: "0 0 8px 0",
            borderRadius: 7,
            fontFamily: arcadeText,
            fontWeight: 900,
            fontSize: 13,
            border: "2px solid #fdffea",
            outline: "1.2px solid #ff379c60",
            boxShadow: "0 1.7px 7px #fffdea,0 0 0 #0000",
            textShadow: "0 1px 5px #fff7",
            letterSpacing: ".7px"
          }}
          aria-label={`Last score: ${lastScore}`}
        >
          Last Score: {lastScore}
        </span>
      )}
      <button
        tabIndex={-1}
        onClick={onPlayClick}
        style={{
          ...arcadeBtnStyle,
          fontSize: "1.07rem",
          marginTop: "12px",
          marginBottom: "11px",
          background: "linear-gradient(110deg,#320055d9,#83faff,#f91dff)",
          border: "2.2px solid #fff8",
        }}
        className="arcade-play-btn"
        aria-label={"Play " + game.title + " now"}
        onMouseDown={e =>
          (e.currentTarget.style.transform =
            "scale(0.93) translateY(2px)")
        }
        onMouseUp={e => (e.currentTarget.style.transform = "")}
        onMouseLeave={e => (e.currentTarget.style.transform = "")}
      >
        <span
          style={{
            fontFamily: arcadeText,
            fontWeight: 900,
            letterSpacing: "1.1px"
          }}
        >
          ▶ Play Now
        </span>
      </button>
    </div>
  );
}

// ---- Surprise Me Button (animated) ----
function SurpriseMeButton({ gameRoutes, onSurprise }) {
  // Accessible focus/active/tooltip pulse ring animation
  const [isDown, setIsDown] = useState(false);
  const [showTip, setShowTip] = useState(false);
  // Simple animation: neon border & pulsing
  const pulseRef = useRef();
  // Playful emoji animation for button
  const [wiggle, setWiggle] = useState(false);

  // Tooltip (auto appears on keyboard focus or hover)
  const tip =
    "Jump to a random mini game! Try your luck with Surprise Me… 🎲";

  return (
    <div style={{ margin: "37px 0 41px 0", width: "100%", textAlign: "center" }}>
      <button
        type="button"
        aria-label="Surprise Me: jump to a random mini game"
        ref={pulseRef}
        style={{
          ...arcadeBtnStyle,
          minWidth: 166,
          minHeight: 56,
          boxShadow:
            "0 0 0 6px #fff9a499,0 5px 30px #f8ff3fd0,0 7px 33px #25cfd866",
          background: "linear-gradient(85deg, #ffdf5f 28%, #13fdc6 100%)",
          color: "#370147",
          fontWeight: 900,
          fontFamily: arcadeText,
          fontSize: "1.22rem",
          letterSpacing: "1.5px",
          transition:
            "background 0.22s, box-shadow 0.25s, color 0.21s, transform 0.22s",
          outline: isDown ? "2.5px solid #48ffe9b7" : "none",
          position: "relative",
          animation:
            "arcade-surprise-wiggle 0.7s " + (wiggle ? "cubic-bezier(.7,.01,.7,2) infinite alternate" : "paused"),
        }}
        className="surprise-arcade-btn"
        tabIndex={0}
        onClick={() => {
          setWiggle(true);
          setTimeout(() => setWiggle(false), 650);
          setTimeout(() => {
            onSurprise(getRandomInt(gameRoutes.length));
          }, 390);
        }}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        onMouseDown={() => setIsDown(true)}
        onMouseUp={() => setIsDown(false)}
        onMouseLeave={() => {
          setIsDown(false);
          setShowTip(false);
        }}
        onMouseOver={() => setShowTip(true)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ")
            setIsDown(true);
        }}
        onKeyUp={e => {
          if (e.key === "Enter" || e.key === " ")
            setIsDown(false);
        }}
      >
        <span role="img" aria-label="dice" style={{
          fontSize: 28,
          verticalAlign: "middle",
          lineHeight: 1,
          filter: "drop-shadow(0 0 3px #82fdff)",
          marginRight: 17,
          animation: wiggle
            ? "arcade-wiggle-emoji 0.55s cubic-bezier(.44,.01,.97,.93) infinite alternate"
            : undefined
        }}>
          🎲
        </span>
        <span
          style={{
            fontFamily: arcadeText,
            fontWeight: 900
          }}
        >Surprise Me!</span>
        {/* Fun tooltip */}
        <span
          aria-live="polite"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%,60%)",
            fontSize: "1rem",
            padding: "6px 14px",
            borderRadius: "9px",
            background:
              "linear-gradient(87deg,#fffa, #ffe36a 80%,#fd3aee99)",
            color: "#2f1248",
            fontFamily: arcadeText,
            fontWeight: 700,
            opacity: showTip ? 1 : 0,
            pointerEvents: "none",
            zIndex: 50,
            marginTop: 11,
            marginBottom: 0,
            border: "2px solid #fff7",
            boxShadow: "0 0 0 4px #fff4,0 2px 7px #ffd760",
            transition: "opacity 0.21s, margin-top 0.19s",
            transitionDelay: showTip ? "0.10s" : "0s"
          }}
        >
          {tip}
        </span>
      </button>
      {/* Animated arcade keyframes injected */}
      <style>
        {`
        @keyframes arcade-surprise-wiggle {
          0% { filter: drop-shadow(0 0 0 #0ff7); }
          32%{ filter: drop-shadow(0 2px 8px #fefe9d); }
          50% { filter: drop-shadow(0 0 15px #ff7800d8); }
          100% { filter: drop-shadow(0 0 10px #26eefa); }
        }
        @keyframes arcade-wiggle-emoji {
          38% { transform: translateY(-4px) rotate(-16deg);}
          77% { transform: translateY(7px) rotate(12deg);}
        }
      `}
      </style>
    </div>
  );
}

// --- Fun Zone: Card / Animation ---
function FunZoneCard({ api, content, loading, onNext }) {
  return (
    <div
      style={{
        ...glassify,
        background: api.color,
        minHeight: 88,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        boxShadow:
          "0 0 16px #fffacd,0 2px 24px " +
          (api.id === "joke"
            ? "#fd00abaa"
            : api.id === "quote"
            ? "#05fffccc"
            : "#ffcc50cc"),
        border:
          api.id === "quote"
            ? "2.7px dashed #3deec5cc"
            : "2.7px solid #fffcc5cc",
        transition: "box-shadow 0.20s, border 0.2s"
      }}
      aria-live="polite"
      className="funzone-card"
      tabIndex={0}
    >
      <div
        aria-hidden="true"
        style={{
          fontSize: api.id === "number" ? 37 : 40,
          marginTop: 9,
          marginBottom: ".7rem",
          filter: "drop-shadow(0 0 7px #fff7)",
          textShadow: "0 1px 3px #fff5"
        }}
      >
        {api.emoji}
      </div>
      <div
        style={{
          fontFamily: arcadeText,
          letterSpacing: "1.1px",
          fontSize: 16,
          color: "#16447a",
          fontWeight: 900,
          textShadow:
            "0 0 5px #fff6,0 1px 7px #fffd,0 3px 19px #46faf85b"
        }}
      >
        {api.title}
      </div>
      <div
        style={{
          fontFamily: arcadeText,
          fontWeight: 500,
          fontSize: 13,
          marginTop: 3,
          color: "#2f2047",
          opacity: 0.74,
          textAlign: "center",
          minHeight: 32
        }}
      >
        {loading ? (
          <span>
            <span
              style={{
                fontSize: 21,
                animation:
                  "funzone-spin 1.1s cubic-bezier(.87,-0.57,.34,2.8) infinite",
                display: "inline-block"
              }}
              aria-label="loading"
            >💫</span>{" "}
            Loading…
          </span>
        ) : (
          <span style={{
            display: 'block',
            maxWidth: 180,
            wordBreak: 'break-word'
          }}>{content}</span>
        )}
      </div>
      <button
        style={{
          ...arcadeBtnStyle,
          background:
            api.id === "joke"
              ? "linear-gradient(98deg,#ffe37f,#ff403f)"
              : api.id === "quote"
              ? "linear-gradient(98deg,#91fffa,#2b9eff)"
              : "linear-gradient(90deg,#fffc7f,#ff40ad)",
          color: "#361606",
          minWidth: 70,
          fontSize: 13,
          fontFamily: arcadeText,
          marginTop: 12,
          border:
            api.id === "quote"
              ? "2.2px dashed #6fecff"
              : "2.2px solid #fff6",
          padding: "9px 17px",
          boxShadow:
            "0 0 9px #fff8,0 2px 7px #ffd70070, 0 4px 14px #" +
            (api.id === "number" ? "f8cc76" : api.id === "quote" ? "3af3fc" : "fb4a99"),
        }}
        aria-label={"Next " + api.title.replace("API", "")}
        onClick={onNext}
        onMouseDown={e =>
          (e.currentTarget.style.transform =
            "scale(0.93) translateY(1px)")
        }
        onMouseUp={e => (e.currentTarget.style.transform = "")}
        onMouseLeave={e => (e.currentTarget.style.transform = "")}
        tabIndex={0}
      >
        Next
      </button>
      <style>
        {`
        @keyframes funzone-spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
}

// --- Main Arcade Games Page ---
/**
 * PUBLIC_INTERFACE
 * Main Arcade Games Page for MiniMayhem Arcade.
 * - Shows a neon, glassmorphic grid of 6 games (2x3, responsive)
 * - Each card: vibrant color, game emoji, Play Now with 3D effect, Last Score badge (if any)
 * - Animated "Surprise Me" button for random game jump
 * - Fun Zone API cards: JokeAPI, QuotableAPI, NumbersAPI
 * - Accessible keyboard navigation, screen reader friendly
 * - Arcade font & visual style, mobile + desktop responsive
 */
function ArcadeGamesPage() {
  const navigate = useNavigate();
  // For game card focus/keyboard navigation
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Fun Zone states
  const [funZone, setFunZone] = useState({
    joke: { loading: true, content: "" },
    quote: { loading: true, content: "" },
    number: { loading: true, content: "" }
  });

  // Prefetch fun zone content on mount
  useEffect(() => {
    FUN_ZONE_APIS.forEach((api) => {
      fetchFunZone[api.id]().then((val) => {
        setFunZone((fz) => ({
          ...fz,
          [api.id]: { loading: false, content: val }
        }));
      });
    });
    // eslint-disable-next-line
  }, []);

  // Keyboard card grid navigation
  const gridRef = useRef();
  function handleCardKey(e, idx) {
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      let next = idx;
      switch (e.key) {
        case "ArrowRight":
          next = (idx + 1) % GAMES.length;
          break;
        case "ArrowLeft":
          next = (idx + GAMES.length - 1) % GAMES.length;
          break;
        case "ArrowDown":
          next = (idx + 3) % GAMES.length;
          break;
        case "ArrowUp":
          next = (idx + GAMES.length - 3) % GAMES.length;
          break;
        default:
          break;
      }
      setFocusedIdx(next);
      gridRef.current &&
        gridRef.current
          .querySelectorAll(".arcade-grid-card")
          [next]?.focus();
    }
  }

  // Handle Surprise Me navigation
  function handleSurpriseMe(idx) {
    const route = GAMES[idx]?.route;
    if (route) {
      navigate(route);
    }
  }

  // Fun Zone 'next' callback (per API)
  function fetchFunZoneCard(api) {
    setFunZone((fz) => ({
      ...fz,
      [api]: { loading: true, content: fz[api].content }
    }));
    fetchFunZone[api]().then((val) => {
      setFunZone((fz) => ({
        ...fz,
        [api]: { loading: false, content: val }
      }));
    });
  }

  // --- Main render ---
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "110px 15px 30px 15px",
        minHeight: "100vh",
        boxSizing: "border-box",
        fontFamily: arcadeText,
        background:
          "radial-gradient(ellipse 160% 90% at 60% 90%, #1e003c 30%, #0cf6e2 90%, #16034d 100%)"
      }}
      aria-labelledby="arcade-games-heading"
    >
      {/* Header */}
      <h1
        id="arcade-games-heading"
        style={{
          fontFamily: arcadeText,
          fontSize: 36,
          color: "#fff2e1",
          lineHeight: 1.05,
          textShadow:
            "0 0 16px #0ffb, 0 6px 48px #1ae2f933, 0 2px 21px #f711e0aa",
          letterSpacing: "2.5px",
          margin: "0 0 13px 0",
          textAlign: "center"
        }}
      >
        <span role="img" aria-label="Joysticks" style={{ fontSize: 38 }}>
          🕹️
        </span>{" "}
        Arcade Games
      </h1>
      <p
        style={{
          maxWidth: 600,
          color: "#effcff",
          fontFamily: arcadeText,
          fontSize: 17,
          textAlign: "center",
          opacity: 0.89,
          margin: "0 auto 34px auto",
          textShadow: "0 1px 8px #9ffdff77,0 1px 3px #fff5"
        }}
      >
        A vibrant neon playground! <span style={{ color: "#65ffe0" }}>Play, compete, and beat your scores on every mini game — or try your luck with 'Surprise Me'!</span>
      </p>

      {/* 2x3 Game Card Grid */}
      <section
        aria-label="Arcade Games Grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2.3vw",
          maxWidth: 960,
          margin: "0 auto",
          marginBottom: 15,
          padding: "8px 1vw",
          position: "relative"
        }}
        ref={gridRef}
        className="arcade-games-grid"
      >
        {GAMES.map((game, idx) => (
          <ArcadeGameCard
            key={game.title}
            game={game}
            tabIndex={0}
            isFocused={focusedIdx === idx}
            onMouseOver={() => setFocusedIdx(idx)}
            onMouseOut={() => setFocusedIdx(-1)}
            onPlayClick={() => navigate(game.route)}
            onKeyDown={(e) => handleCardKey(e, idx)}
          />
        ))}
      </section>

      {/* Surprise Me button (centered) */}
      <SurpriseMeButton
        gameRoutes={GAMES}
        onSurprise={handleSurpriseMe}
      />

      {/* Fun Zone Section */}
      <section
        aria-label="Fun Zone: Jokes, Quotes, Trivia"
        style={{
          marginTop: 49,
          padding: "23px 0 12px 0",
          borderTop: "2.1px solid #fff3",
          borderRadius: "22px 22px 0 0",
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
          boxShadow: "0 0 38px #13e7ff77"
        }}
      >
        <h2
          id="fun-zone-heading"
          style={{
            fontFamily: arcadeText,
            fontSize: 25,
            margin: "0 0 17px 0",
            color: "#fffeea",
            textAlign: "center",
            letterSpacing: "1.8px",
            textShadow:
              "0 0 12px #0ffb, 0 6px 23px #1ae2f944, 0 2px 16px #f711e0aa"
          }}
        >
          <span role="img" aria-label="confetti" style={{ fontSize: 26 }}>
            🎉
          </span>{" "}
          Fun Zone
        </h2>
        <nav
          aria-label="Fun Zone Content"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "3vw",
            marginTop: 7,
            flexWrap: "wrap",
            marginBottom: 7
          }}
        >
          {FUN_ZONE_APIS.map((api) => (
            <FunZoneCard
              key={api.id}
              api={api}
              content={funZone[api.id].content}
              loading={funZone[api.id].loading}
              onNext={() => fetchFunZoneCard(api.id)}
            />
          ))}
        </nav>
        <p
          style={{
            textAlign: "center",
            fontFamily: arcadeText,
            fontSize: 13,
            color: "#aeefffcc",
            marginTop: 18,
            marginBottom: 2,
            opacity: 0.9,
            letterSpacing: ".7px",
            textShadow: "0 1px 6px #fffc"
          }}
        >
          <span role="img" aria-label="sparkle">
            ✨
          </span>{" "}
          Powered by <strong>JokeAPI</strong>, <strong>QuotableAPI</strong>, <strong>NumbersAPI</strong>
        </p>
      </section>

      {/* Responsive, font, and custom hover/focus styles */}
      <style>
        {`
        @import url('${fontUrl}');
        .arcade-grid-card:focus, .arcade-grid-card:hover {
          outline: 3px solid #ffe267cc !important;
          box-shadow: 0 0 0 8px #ffedbf64, 0 4px 24px #f8e228bb, 0 0 0 3px #17ffd775;
          border:2.5px solid #ffd900;
          z-index: 2;
        }
        .arcade-grid-card {
          cursor: pointer;
          user-select: none;
          min-width: 0;
        }
        .arcade-play-btn:focus-visible, .arcade-play-btn:hover {
          outline: 3px solid #12fcffa8 !important;
          transform: scale(0.97);
          box-shadow: 0 3px 26px #11fdfdb9, 0 7px 18px #fa4fd7aa, 0 0 0 3px #fffc;
          background: linear-gradient(90deg,#41eaff,#fcf285,#ff54d4);
        }
        .arcade-play-btn:active {
          background: linear-gradient(100deg,#fffaea,#14e1fd 120%);
          color: #411254;
        }
        .arcade-play-btn:focus-visible {
          border: 2.9px solid #fff;
        }
        .funzone-card:focus, .funzone-card:hover {
          outline: 2.7px solid #fffc;
          box-shadow: 0 0 16px 8px #fafeffcc, 0 2px 22px #51dad0bb;
          z-index: 1;
        }
        /* Responsive arcade games grid */
        @media (max-width: 1024px) {
          .arcade-games-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 3vw !important;
          }
        }
        @media (max-width: 650px) {
          .arcade-games-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 0.4vw;
          }
        }
        /* Make Fun Zone cards stack on mobile */
        @media (max-width: 700px) {
          [aria-label="Fun Zone Content"] {
            flex-direction: column !important;
            gap: 17px !important;
            align-items: center;
          }
        }
        /* Arcade fonts */
        body, .arcade-grid-card, .surprise-arcade-btn, .arcade-play-btn, .funzone-card {
          font-family: ${arcadeText} !important;
        }
      `}
      </style>
    </div>
  );
}

export default ArcadeGamesPage;
