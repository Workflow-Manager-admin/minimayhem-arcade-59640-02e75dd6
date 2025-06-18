import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * The neon-glassmorphic Arcade Games Page for MiniMayhem Arcade.
 * - Sticky nav (handled in Navbar)
 * - Surprise Me button with animated effect
 * - 2x3 grid: glassy vibrant arcade cards (title, emoji/icon, Play Now CTA, badge if hi score)
 * - Fun Zone at bottom (joke, quote, fact from APIs)
 * - Arcade fonts: Orbitron/Press Start 2P
 * - Animations, glass+neon, mobile responsive, accessibility
 */

const gameList = [
  {
    key: "block-puzzle",
    title: "Block Puzzle",
    emoji: "🧱",
    color: "#42c7f5",
    badge: "🏆", // Demo: show badge if high score
  },
  {
    key: "memory-match",
    title: "Memory Match",
    emoji: "🧠",
    color: "#f37fff",
    badge: null,
  },
  {
    key: "reaction-speed",
    title: "Reaction Speed",
    emoji: "⚡️",
    color: "#ffd642",
    badge: "New!",
  },
  {
    key: "sudoku",
    title: "Sudoku",
    emoji: "🔢",
    color: "#ff6c90",
    badge: null,
  },
  {
    key: "sliding-puzzle",
    title: "Slider",
    emoji: "🟩",
    color: "#46efb4",
    badge: "🔥",
  },
  {
    key: "word-typing",
    title: "Word Typer",
    emoji: "⌨️",
    color: "#fa9d3a",
    badge: null,
  },
];

const gamePaths = {
  "block-puzzle": "/games/block-puzzle",
  "memory-match": "/games/memory-match",
  "reaction-speed": "/games/reaction-speed",
  "sudoku": "/games/sudoku",
  "sliding-puzzle": "/games/sliding-puzzle",
  "word-typing": "/games/word-typing",
};

/* Neon/arcade font + extras style block */
const fontAndArcadeCss = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap');

.arcade-font {
  font-family: 'Orbitron', 'Press Start 2P', Arial, sans-serif;
  letter-spacing: 1.2px;
}
.arcade-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 36px 28px;
  margin: 40px auto 0 auto;
  max-width: 980px;
  width: 100%;
  padding: 0 10px;
}
@media (max-width: 900px) {
  .arcade-grid {
    grid-template-columns: repeat(2,1fr);
    gap: 28px 20px;
  }
}
@media (max-width: 650px) {
  .arcade-grid {
    grid-template-columns: 1fr;
    gap: 18px 0;
    padding: 0 3vw;
  }
}

.arcade-glasscard {
  position: relative;
  background: linear-gradient(120deg,rgba(63,151,255,0.16),rgba(255,255,255,0.18) 75%);
  border: 2.4px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  box-shadow:
    0 6px 32px 0 #3f81e744,
    0 0 0 2px var(--arcade-neon, #00efe4),
    0 0 32px 9px var(--arcade-neon, #00efe444);
  overflow: hidden;
  padding: 32px 18px 28px 18px;
  text-align: center;
  transition: transform 0.19s cubic-bezier(.66,-0.41,.57,1.3),
    box-shadow 0.22s cubic-bezier(.66,-0.41,.57,1.3),
    border-color 0.17s;
  backdrop-filter: blur(14px) brightness(1.13);
  cursor: pointer;
  min-height: 256px;
  z-index: 1;
  isolation: isolate;
}
.arcade-glasscard:hover,
.arcade-glasscard:focus {
  transform: scale(1.034) translateY(-7px) rotate(-0.7deg);
  box-shadow:
    0 4px 44px 4px var(--arcade-neon,#fff84425),
    0 0 14px 4px var(--arcade-neon,#fff844b8),
    0 2px 24px 6px #7b78ff66;
  border-color: var(--arcade-neon,#fff57c);
  outline: none;
}
.arcade-game-emoji {
  font-size: 3.2rem;
  text-shadow: 0 1px 7px #fff7, 0 1.5px 14px var(--arcade-neon,#44fff7cc);
  margin-bottom: 2px;
  display: block;
  filter: drop-shadow(0 1.5px 2px #fff5);
  animation: arcade-emoji-pop 0.65s cubic-bezier(.4,2.1,.74,.97) both;
}
@keyframes arcade-emoji-pop {
  0% { transform: scale(0.93);}
  40%{ transform: scale(1.21) rotate(-12deg);}
  65%{ transform: scale(0.93) rotate(2deg);}
  100%{ transform: scale(1);}
}

.arcade-title {
  font-size: 1.32rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 1px 9px var(--arcade-neon,#80bfff),0 3px 8px #fff3;
  margin: 8px 0 12px;
}
.arcade-badge {
  display: inline-block;
  background: linear-gradient(91deg,#fff942 5%,#fd4cff 100%);
  color: #2d005c;
  font-size: 0.95rem;
  font-family: 'Press Start 2P',Orbitron,sans-serif;
  font-weight: 700;
  border-radius: 17px 22px 18px 20px/15px 26px 13px 16px;
  padding: 7px 15px 7px 14px;
  position: absolute;
  left: 17px;
  top: 18px;
  min-width: 48px;
  box-shadow: 0 2px 16px #edff4f55;
  z-index: 2;
  border: 2.5px solid #fff5;
  animation: badge-pop 0.76s cubic-bezier(.5,1.5,0.8,1.02);
}
@keyframes badge-pop {
  0% { transform: scale(0.4); opacity: 0;}
  65%{ transform: scale(1.19) rotate(-3deg); opacity: 1;}
  100%{ transform: scale(1); opacity: 1;}
}

.arcade-play-btn {
  display: inline-block;
  font-family: 'Press Start 2P','Orbitron',Arial,sans-serif;
  color: #222;
  background: linear-gradient(94deg,#ffe44e,#ff5cff 87%) !important;
  border: none;
  border-radius: 50px;
  font-size: 1.02rem;
  padding: 13px 31px 11px 31px;
  box-shadow: 0 2px 24px #ffeb3c44, 0 0 0 3px #fff7, 0 5px 30px #ff5cff50;
  outline: none;
  font-weight: 800;
  margin: 18px auto 0;
  transition: 
    transform 0.16s cubic-bezier(.66,-0.41,.57,1.3),
    box-shadow 0.175s cubic-bezier(.59,.22,.54,1.34),
    filter 0.14s;
  text-shadow: 0 1px 2px #fff9;
  letter-spacing: 0.8px;
}
.arcade-play-btn:hover, .arcade-play-btn:focus {
  background: linear-gradient(98deg,#fae76e 8%,#e07cff 100%) !important;
  box-shadow: 0 0 40px #fff77c99, 0 2px 16px #e885ff52;
  filter: brightness(1.07) saturate(1.21);
  transform: scale(1.06) translateY(-2px);
}
.arcade-card-footer {
  margin-top: 26px;
  font-size: 13.5px;
  color: #bbffff;
  opacity: 0.82;
}


/* Surprise Me button */
.surprise-arcade-btn {
  display: flex;
  align-items: center;
  gap: 19px;
  font-size: 1.15rem;
  background: 
    linear-gradient(99deg, #00ffe0 4%, #ff60d7 99%);
  color: #fff;
  border: 0;
  border-radius: 39px;
  font-family: 'Orbitron', 'Press Start 2P', Arial, sans-serif;
  font-weight: 700;
  letter-spacing: 2.2px;
  padding: 1.15em 2.2em 1.08em 1.7em;
  margin: 56px auto 16px auto;
  text-shadow: 0 1.5px 12px #ffffff, 0 2.5px 16px #b51bff44;
  box-shadow: 0 4px 34px 0 #00eafc68, 0 0 0 3px #ff60d733;
  position: relative;
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.20s, filter 0.17s;
  outline: none;
  z-index: 3;
}
.surprise-arcade-btn:active {
  transform: scale(0.97) translateY(2px);
  box-shadow: 0 0 14px #ff60df;
  filter: brightness(0.98);
}
.surprise-arcade-btn .arcade-btn-glow {
  display: inline-block;
  height: 13px;
  width: 13px;
  border-radius: 50%;
  margin-right: 8px;
  background: radial-gradient(circle at 30% 45%, #fff6cc 50%, #f9f664 87%, #ff003f 100%);
  box-shadow: 0 0 15px 2px #fffa88, 0 0 28px 2px #ff5ccb77;
  animation: blink-neon 1.09s infinite alternate;
}
@keyframes blink-neon {
  from { box-shadow: 0 0 15px #f9ff6d, 0 0 14px #ff5ccb33;}
  to { box-shadow: 0 0 23px 5px #fff866, 0 0 32px #fe4cbe88;}
}

@media (max-width: 520px) {
  .surprise-arcade-btn {
    font-size: 0.98rem;
    padding: 0.85em 1.25em;
    margin-top: 38px;
  }
  .arcade-glasscard {
    padding: 24px 8px 17px 8px;
    min-height: 200px;
  }
}

/* Fun Zone styles */
.funzone-section {
  width: 100%;
  background: linear-gradient(98deg,#5b00f5 0%,#26ffd7 100%);
  color: #fff;
  border-radius: 37px 37px 0 0 / 63px 63px 0 0;
  margin: 58px auto 0 auto;
  padding: 40px 14px 41px 14px;
  box-shadow: 0 -2px 24px #67ffe333, 0 -6px 28px #fff05566 inset;
  font-family: 'Press Start 2P', Orbitron, Arial, sans-serif;
  z-index: 12;
  max-width: 910px;
  min-height: 146px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.funzone-title {
  font-size: 1.2rem;
  color: #ffff02;
  text-shadow: 0 0 12px #fff,0 6px 18px #07ffd5bb;
  margin-bottom: 8px;
  letter-spacing: 1.6px;
}
.funzone-grid {
  display: flex;
  gap: 29px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  margin: 11px 0 0 0;
}
@media (max-width: 650px) { 
  .funzone-section {  border-radius: 23px 23px 0 0 / 33px 33px 0 0;  padding: 26px 7px 27px 7px;}
  .funzone-grid { gap: 11px; flex-direction: column; align-items: center;}
}
.funzone-box {
  background: linear-gradient(111deg,rgba(255,255,255,0.19),rgba(255,236,253,0.21) 79%);
  border: 2.3px solid #fff8;
  box-shadow: 0 3px 9px #fff94325, 0 2px 13px #85fffa33;
  border-radius: 23px;
  padding: 18px 21px;
  min-width: 180px;
  text-align: center;
  margin: 0 7px;
  font-size: 1.03rem;
  color: #21013c;
  font-weight: 700;
  text-shadow: 0 0 3px #fff,0 2px 8px #57fdf3;
  backdrop-filter: blur(7px);
  position: relative;
}
.funzone-label {
  font-family: 'Orbitron', 'Press Start 2P', Arial, sans-serif;
  font-size: 0.73em;
  font-weight: 900;
  color: #21ffc8;
  letter-spacing: 1.7px;
  margin-bottom: 8px;
  opacity: 0.93;
  text-shadow: 0 0 7px #fff68f;
}
`;

// APIs for Fun Zone (open APIs, CORS-friendly)
const JOKE_API = "https://v2.jokeapi.dev/joke/Any?type=single";
const QUOTE_API = "https://api.quotable.io/random";
const FACT_API = "https://uselessfacts.jsph.pl/random.json?language=en";

// Returns { joke, quote, fact }
async function fetchFunZoneContent() {
  // Run APIs in parallel for low latency (and handle errors gracefully)
  const [joke, quote, fact] = await Promise.all([
    fetch(JOKE_API)
      .then((r) => r.json())
      .then((j) => j.joke || null)
      .catch(() => null),
    fetch(QUOTE_API)
      .then((r) => r.json())
      .then((q) =>
        q && q.content && q.author
          ? `"${q.content}" — ${q.author}`
          : null
      )
      .catch(() => null),
    fetch(FACT_API)
      .then((r) => r.json())
      .then((f) => f.text || null)
      .catch(() => null),
  ]);
  return { joke, quote, fact };
}

export default function ArcadeGamesPage() {
  const [hiScores] = useState({ "block-puzzle": 9988, "sliding-puzzle": 178 }); // demo: pretend we have scores
  const [funZone, setFunZone] = useState({
    joke: null,
    quote: null,
    fact: null,
    loading: true
  });
  const [surpriseAnim, setSurpriseAnim] = useState(false);
  const navigate = useNavigate();

  // Fetch Fun Zone stuff on mount
  useEffect(() => {
    let ignore = false;
    setFunZone((f) => ({ ...f, loading: true }));
    fetchFunZoneContent().then((res) => {
      if (!ignore)
        setFunZone((f) => ({ ...res, loading: false }));
    });
    return () => { ignore = true; };
  }, []);

  // SURPRISE ME button: pick random game and flash animation
  function handleSurprise() {
    setSurpriseAnim(true);
    setTimeout(() => setSurpriseAnim(false), 530);
    // Exclude games with no path
    const choices = gameList.filter((g) => g.key in gamePaths);
    const g = choices[Math.floor(Math.random() * choices.length)];
    setTimeout(() => navigate(gamePaths[g.key]), 320);
  }

  return (
    <>
      <style>{fontAndArcadeCss}</style>
      <main style={{
        marginTop: 92, marginBottom: 0,
        minHeight: "80vh",
        fontFamily: "'Orbitron','Press Start 2P',Arial,sans-serif",
        background: "radial-gradient(circle at top 14vw,#0ff5,#110047 120%)",
        boxSizing: "border-box",
        width: "100%",
      }}>
        {/* Neon Arcade Header */}
        <div className="arcade-font" style={{
          width: "100%",
          textAlign: "center",
          margin: "0 auto 10px auto",
        }}>
          <h1 style={{
            fontSize: "2.68rem",
            marginBottom: 17,
            fontWeight: 900,
            letterSpacing: "2.8px",
            color: "#01e9fb",
            textShadow: "0 2px 22px #fff,0 5px 90px #00d2c9,0 8px 80px #b21eff99",
            marginTop: 0,
          }}>🕹️ MiniMayhem Arcade</h1>
          <div style={{
            fontFamily: "'Press Start 2P','Orbitron',Arial,sans-serif",
            fontSize: "1.14rem",
            color: "#fff657",
            letterSpacing: "2.1px",
            textShadow: "0 0 14px #fff47c,0 2px 17px #5f96ff95",
            marginBottom: 8,
          }}>Bright, fast, mini games — play & conquer the arcade!</div>
        </div>

        {/* Surprise Me button */}
        <button
          className="surprise-arcade-btn"
          aria-label="Surprise me with a random game"
          title="Get a randomized arcade challenge!"
          onClick={handleSurprise}
          tabIndex={0}
          style={surpriseAnim ? {
            filter: "brightness(1.2) saturate(1.3)",
            transform: "scale(1.06) rotate(-3deg)",
            boxShadow: "0 0 80px 0 #f4ff5e,0 2px 26px 0 #93ffefcc"
          } : {}}
        >
          <span className="arcade-btn-glow"></span>
          <span style={{ fontWeight: "900", fontFamily: "'Orbitron','Press Start 2P'", fontSize: "1.09em" }}>🎲 Surprise Me</span>
        </button>

        {/* Games grid */}
        <section className="arcade-font arcade-grid" aria-label="Arcade Games">
          {gameList.map((game, idx) => (
            <div
              className="arcade-glasscard"
              key={game.key}
              tabIndex={0}
              aria-label={`${game.title} arcade game card`}
              role="button"
              style={{
                "--arcade-neon": game.color,
                outline: "none",
                borderColor: "rgba(255,255,255,0.13)",
              }}
              onClick={() =>
                navigate(gamePaths[game.key])
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(gamePaths[game.key]);
                }
              }}
            >
              {/* Badge if hi-score or marked */}
              {(game.badge || hiScores[game.key]) && (
                <span className="arcade-badge" title={game.badge ? `${game.badge}` : ""}>
                  {game.badge ? game.badge : "Hi: " + hiScores[game.key]}
                </span>
              )}

              <span className="arcade-game-emoji" aria-hidden="true">{game.emoji}</span>
              <div className="arcade-title">{game.title}</div>
              <button
                className="arcade-play-btn"
                style={{
                  marginTop: 9,
                  display: "inline-block",
                }}
                aria-label={`Play ${game.title} now`}
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(gamePaths[game.key]);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(gamePaths[game.key]);
                  }
                }}
              >
                ▶ Play Now
              </button>
              <div className="arcade-card-footer">
                {hiScores[game.key]
                  ? <>High score: <b>{hiScores[game.key]}</b></>
                  : <>Ready to play?</>
                }
              </div>
            </div>
          ))}
        </section>

        {/* Fun Zone APIs block */}
        <section className="funzone-section" aria-label="MiniMayhem API Fun Zone">
          <div className="funzone-title">
            <span role="img" aria-label="sparkles">✨</span> API Fun Zone <span role="img" aria-label="party">🥳</span>
          </div>
          <div className="funzone-grid">
            <div className="funzone-box" aria-live="polite">
              <div className="funzone-label">Joke</div>
              {
                funZone.loading
                  ? <span>Loading…</span>
                  : (funZone.joke || <span>No joke found 🤖</span>)
              }
            </div>
            <div className="funzone-box" aria-live="polite">
              <div className="funzone-label">Quote</div>
              {
                funZone.loading
                  ? <span>Loading…</span>
                  : (funZone.quote || <span>No quote found 🚀</span>)
              }
            </div>
            <div className="funzone-box" aria-live="polite">
              <div className="funzone-label">Fun Fact</div>
              {
                funZone.loading
                  ? <span>Loading…</span>
                  : (funZone.fact || <span>No fact found 🦄</span>)
              }
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
