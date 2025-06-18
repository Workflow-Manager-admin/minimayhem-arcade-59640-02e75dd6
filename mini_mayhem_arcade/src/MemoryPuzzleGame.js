import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * MemoryPuzzleGame: Full arcade memory puzzle game for MiniMayhem Arcade.
 * Features:
 * - Mode picker (Easy 4x4, Medium 8x8, Hard 14x14)
 * - Animated arcade UI: dark neon, pixel font, responsive board scaling
 * - Status bar: moves (tries), timer, matches/misses, persistent highscores
 * - Highscore by mode (moves/time), stored in localStorage [+ mock-load for testing]
 * - Card grid with large emoji/icons, flip animation, match/mismatch highlight/pulse
 * - SFX: sound FX for flip/match/miss, on/off, restart and "mock load" audio
 * - Restart/back controls
 * - Arcade neon buttons, tactile feedback/pulse/shake for errors
 * - Accessibility: full keyboard/aria
 * - SPA ready (no routing is hardcoded, uses hooks)
 */

// --- CONFIG ---
const MODES = [
  {
    key: "easy",
    size: 4,
    label: "Easy (4 × 4)",
    pairs: 8, // 16 cards
    grid: [4, 4],
    neon: "#43e9ff"
  },
  {
    key: "medium",
    size: 8,
    label: "Medium (8 × 8)",
    pairs: 32, // 64 cards
    grid: [8, 8],
    neon: "#FFD600"
  },
  {
    key: "hard",
    size: 14,
    label: "Hard (14 × 14)",
    pairs: 98, // 196 cards
    grid: [14, 14],
    neon: "#ef47cb"
  }
];

// Kid-friendly, wide emoji set (repeat as needed for large boards)
const EMOJIS = [
  "😸","🍕","🚀","💎","👾","🍩","🦄","🐙","🎈","🍿","🐲","🧃","🎵","🍉","💡","🔥",
  "🐢","⚡","🌮","🍔","🌻","🤑","💻","🚦","🍟","🦋","🍕","🍀","🐸","🛹","🥇","🦕",
  "🧩","🐳","🥨","🍄","🐼","💜","🌈","🥁","🐧","🍓","🦄","🦅","🌮","🧸","🍦","🥕",
  "🎮","🧠","🎲","🐤","🎃","🍋","🐺","🍓","🦘","🐺","🍫","🍔","🐙","🐘","👻","🖖"
];

function shuffleDeck(pairs) {
  let available = [...EMOJIS];
  // Cycle-reuse if not enough emoji for pairs
  const set = [];
  while(set.length < pairs)
    set.push(available[set.length % available.length]);
  // Each pair appears twice
  let cards = set.flatMap((emoji, i) => [
    { id: "a"+i, emoji },
    { id: "b"+i, emoji }
  ]);
  // Fisher-Yates
  for (let i = cards.length-1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i+1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function getHiScore(modeKey) {
  // Format: {tries, secs}
  if (!window.localStorage) return null;
  try {
    let dat = window.localStorage.getItem(`mma_memgame_pb_${modeKey}`);
    if (!dat) return null;
    let obj = JSON.parse(dat);
    if (!obj || typeof obj !== "object") return null;
    return ("tries" in obj && "secs" in obj) ? obj : null;
  } catch { return null; }
}

function setHiScore(modeKey, scoreObj) {
  if (!window.localStorage) return;
  window.localStorage.setItem(`mma_memgame_pb_${modeKey}`, JSON.stringify(scoreObj));
}

function maybePlaySfx(sfxObj, which = "flip", soundOn = true) {
  if (!soundOn) return;
  if (!sfxObj[which]) return;
  try { sfxObj[which].currentTime = 0; sfxObj[which].play(); }catch{}
}

// --- SFX SETUP (uses HTML audio, no external assets required) ---
function useArcadeSfx(enabled) {
  // One instance per SFX for clean overlapping play
  const refFlip = useRef(null), refMatch = useRef(null), refMiss = useRef(null), refStart = useRef(null), refWin = useRef(null), refLoad = useRef(null);
  useEffect(() => {
    // Web Audio, synthesized simple beep/arcade tones
    refFlip.current = new window.Audio();
    refFlip.current.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYQAAACAgICA"; // low blip
    refMatch.current = new window.Audio();
    refMatch.current.src =
      "data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YVcAAACAwEBgQGCDg8MA"; // high blip
    refMiss.current = new window.Audio();
    refMiss.current.src =
      "data:audio/wav;base64,UklGRkoAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YUYAAACAgEBAQIAA"; // no/short
    refStart.current = new window.Audio();
    refStart.current.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYQAAACAgICAAACAgA=="; // soft
    refWin.current = new window.Audio();
    refWin.current.src =
      "data:audio/wav;base64,UklGRvwAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YY4AAADw8PDw8PDw"; // "win"
    refLoad.current = new window.Audio();
    refLoad.current.src =
      "data:audio/wav;base64,UklGRuAAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYAAAABQAAEAgIDw=="; // load beep/fanfare
  }, []);
  return {
    flip: refFlip.current,
    match: refMatch.current,
    miss: refMiss.current,
    start: refStart.current,
    win: refWin.current,
    load: refLoad.current
  };
}

// --- MAIN COMPONENT ---
const MemoryPuzzleGame = () => {
  // Screen state: null/mode/game
  const [gameScreen, setGameScreen] = useState("mode"); // "mode" | "playing" | "loading"
  const [gameMode, setGameMode] = useState(null); // mode key
  const [cards, setCards] = useState([]);
  const [size, setSize] = useState(4);
  const [flipped, setFlipped] = useState([]); // idx[]
  const [matched, setMatched] = useState([]); // idx[]
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0); // seconds
  const [matches, setMatches] = useState(0);
  const [busy, setBusy] = useState(false); // board lock
  const [soundOn, setSoundOn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [loadingAnim, setLoadingAnim] = useState(false);
  const timerRef = useRef();
  const tStart = useRef();
  const tEnd = useRef();
  const navigate = useNavigate();

  // SFX control
  const sfx = useArcadeSfx(soundOn);

  // Reset game to mode select
  const resetToModeSelect = useCallback(() => {
    setGameScreen("mode");
    setGameMode(null);
    setCards([]);
    setSize(4);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setMatches(0);
    setGameOver(false);
    setBusy(false);
    setLoadingAnim(false);
    clearInterval(timerRef.current);
  }, []);

  // Start game when mode confirmed
  const beginGame = useCallback(modeObj => {
    setGameScreen("loading");
    setLoadingAnim(true);
    // Play loading/mock SFX if on
    setTimeout(() => { maybePlaySfx(sfx, "load", soundOn); }, 100);
    // Animate fake load for big boards; longer wait for harder
    let t = 900 + (modeObj.size - 4) * 29 + (modeObj.size > 8 ? 700 : 0);
    setTimeout(() => {
      let deck = shuffleDeck(modeObj.pairs);
      setCards(deck);
      setSize(modeObj.size);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setTimer(0);
      setMatches(0);
      setGameScreen("playing");
      tStart.current = Date.now();
      tEnd.current = undefined;
      setGameOver(false);
      setBusy(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(
        () => setTimer(Math.max(0, Math.floor((Date.now() - tStart.current) / 1000))),
        450
      );
      maybePlaySfx(sfx, "start", soundOn);
      setLoadingAnim(false);
      // Vibe for tactile: light mobile device vibration if available
      try { window.navigator.vibrate?.(55); } catch {}
    }, t);
    setGameMode(modeObj.key);
  }, [soundOn, sfx]);

  // Move flip: only if 0/1 card is up; cannot flip matched/flipped; lock if 2 already up
  function handleFlip(idx) {
    if (gameOver || busy || flipped.length === 2) return;
    // Disallow clicking a matched card or own flipped card
    if (matched.includes(idx) || flipped.includes(idx)) {
      maybePlaySfx(sfx, "miss", soundOn); // error (pulse)
      return;
    }
    maybePlaySfx(sfx, "flip", soundOn);
    let nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      setBusy(true);
      setMoves(m => m + 1);
      let [i, j] = nextFlipped;
      setTimeout(() => {
        if (cards[i]?.emoji && cards[i].emoji === cards[j]?.emoji && cards[i].id !== cards[j].id) {
          setMatched(arr => ([...arr, i, j]));
          setMatches(m => m + 1);
          maybePlaySfx(sfx, "match", soundOn);
          try { window.navigator.vibrate?.(70); } catch {}
        }
        else {
          maybePlaySfx(sfx, "miss", soundOn);
        }
        setFlipped([]);
        setBusy(false);
      }, 670); // Flip-back/match anim
    }
  }

  // Game end detection
  useEffect(() => {
    // Harder board: all pairs, total pairs, win is all
    if (gameScreen !== "playing" || !cards.length) return;
    let END = false;
    if (matched.length === cards.length) END = true;
    else if (cards.length - matched.length === 1 && gameMode === "hard")
      END = true; // One unmatchable due to 14x14 (odd)
    if (!END || gameOver) return;
    setGameOver(true);
    tEnd.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(
      () => { maybePlaySfx(sfx, "win", soundOn); },
      500
    );
    // Hi-score: persist if better (moves, then timer)
    let prev = getHiScore(gameMode);
    let my = { tries: moves, secs: Math.floor((tEnd.current - tStart.current) / 1000) };
    if (
      !prev ||
      my.tries < prev.tries ||
      (my.tries === prev.tries && my.secs < prev.secs)
    ) setHiScore(gameMode, my);
    // Mock play-count for fun stats/UX
    let k = `mma_memgame_play_${gameMode}`;
    try {
      let n = +(localStorage.getItem(k)||0);
      localStorage.setItem(k, (n+1));
    }catch{}
    // Light pulse feedback
    try { window.navigator.vibrate?.([80,40,110]); } catch {}
  }, [matched, cards, moves, gameMode, gameOver, gameScreen, soundOn, sfx]);

  // Unmount: clear timer
  useEffect(() => () => { clearInterval(timerRef.current); }, []);

  // Timer live on playing only
  useEffect(() => {
    if (gameScreen !== "playing" || gameOver) clearInterval(timerRef.current);
    else if (!timerRef.current && (gameScreen === "playing"))
      timerRef.current = setInterval(() => {
        setTimer(Math.max(0, Math.floor((Date.now() - tStart.current) / 1000)));
      }, 450);
    return () => {};
  }, [gameScreen, gameOver]);

  // RESTART = re-shuffle, reset board, but stick with current mode key
  function restartGame() {
    const active = MODES.find(m => m.key === gameMode);
    if (!active) return resetToModeSelect();
    beginGame(active);
  }

  // Adaptive sizing (harder grid)
  const gridStyle = useMemo(() => {
    let N = size;
    // Board PX by grid: scale for tiny/large playfields
    let maxDim = N <= 4 ? 352 : N < 8 ? 520 : N < 14 ? 620 : 730;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${N}, minmax(28px,1fr))`,
      gridTemplateRows: `repeat(${N}, minmax(28px,1fr))`,
      maxWidth: maxDim,
      gap: N > 8 ? 4 : 7,
      margin: "0 auto",
    };
  }, [size]);

  // Neon feedback/shake: used on SFX/off error or mismatch click
  const [shakeClass, setShakeClass] = useState("");
  function neonShake() {
    setShakeClass("mg-shake");
    setTimeout(() => setShakeClass(""), 600);
  }

  // SOUND TOGGLE
  function handleToggleSound() {
    setSoundOn(s => !s);
    neonShake();
  }

  // HI-SCORE row
  const hiscore = useMemo(() =>
    gameMode ? getHiScore(gameMode) : null
  , [gameMode, gameOver, moves]);

  // --------- UI ---------
  return (
    <div className="mpg-main-bg-arcade" tabIndex={-1}>
      <style>{ARCADE_CSS}</style>
      <div className="mpg-header arcade-pixelfont" aria-label="Memory Puzzle Game">
        <span role="img" aria-label="arcade-cards">🟥</span> Memory Puzzle Arcade
      </div>
      {/* --- MODE SELECT --- */}
      {gameScreen === "mode" && (
        <div className="mpg-modepicker-wrap">
          <div className="mpg-modes-header">Pick a Game Mode</div>
          <div className="mpg-mode-btnrow">
            {MODES.map(m => (
              <button
                key={m.key}
                className="mpg-mode-btn arcade-pixelfont"
                style={{ color: m.neon, borderColor: m.neon }}
                onClick={() => beginGame(m)}
                tabIndex={0}
                aria-label={m.label}
              >
                <span className="mpg-btn-glow">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* --- "LOADING" / ARCADE TRANSITION --- */}
      {gameScreen === "loading" && (
        <div className="mpg-loader-wrap" aria-live="polite">
          <div className="mpg-loader-anim">
            <div className="mpg-mock-progress" style={{ animationDuration: "1.35s" }} />
            <div className="mpg-arcade-loader arcade-pixelfont">Arcarde Grid Loading…</div>
          </div>
        </div>
      )}
      {/* --- MAIN GAME --- */}
      {gameScreen === "playing" && (
        <>
          {/* Status/hi-score bar */}
          <section className={"mpg-statbar arcade-pixelfont " + shakeClass}>
            <span>🏆 PB: <b>{hiscore?.tries ?? "--"}</b> moves, <b>{hiscore?.secs ?? "--"}s</b></span>
            <span>🎯 Moves: <b>{moves}</b></span>
            <span>⚡ Matched: <b>{Math.floor(matched.length/2)}</b></span>
            <span>⏱️ Time: <b>{timer}s</b></span>
            <button className={"mpg-btn-sound " + (soundOn ? "on" : "off")}
              onClick={handleToggleSound} aria-label={soundOn ? "Mute sound" : "Unmute sound"}>
                {soundOn ? "🔊" : "🔈"}
            </button>
          </section>
          {/* Game grid */}
          <div className={"mpg-gameboard-outer " + (gameOver ? "finished" : "")}>
            <div className="mpg-gridwrap" style={{background:"#2d187448",padding:12, borderRadius:15,}}>
              <div className="mpg-gameboard" style={gridStyle}>
                {cards.map((c, idx) => {
                  let isFlipped = flipped.includes(idx) || matched.includes(idx);
                  let isNewMatch = matched.includes(idx) && matched.length && matched.slice(-2).includes(idx);
                  // Animate highlight, glow, flip, arcade font for icon
                  return (
                    <button
                      aria-label={isFlipped ? ("Card "+c.emoji) : "Hidden"}
                      key={c.id+"-"+idx}
                      className={
                        "mpg-card arcade-emoji"
                        +(isFlipped ? " flipped" : "")
                        +(matched.includes(idx) ? (isNewMatch ? " matched-glow" : " matched") : "")
                        +(flipped.length === 2 && !isFlipped ? " temp-locked" : "")
                        +(busy ? " disabled" : "")
                        +(gameOver ? " finished" : "")
                      }
                      style={{
                        fontSize: size < 6 ? "2.28rem" : size < 10 ? "1.65rem" : "1.09rem",
                        filter: isFlipped ? "drop-shadow(0 0 15px #ffd60083)" : "none"
                      }}
                      onClick={() => !busy && handleFlip(idx)}
                      onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !busy) handleFlip(idx); }}
                      tabIndex={0}
                      disabled={busy || isFlipped || gameOver}
                    >
                      <span>{isFlipped ? c.emoji : (<span>🀮</span>)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <section className="mpg-controls-row arcade-pixelfont">
            <button className="mpg-ctrl-btn arcade-pixelfont" onClick={restartGame}>Restart</button>
            <button className="mpg-ctrl-btn arcade-pixelfont" style={{color:"#FFD600"}}
              onClick={() => navigate("/games")}>Back</button>
          </section>
          {/* End state overlay and PB/highscore */}
          {gameOver && (
            <div className="mpg-endstat-pop">
              <b>🎉 All Pairs Found!</b><br />
              <span>Moves: <b>{moves}</b></span>{" | "}
              <span>Time: <b>{Math.floor((tEnd.current-tStart.current)/1000)}s</b></span>
              <div style={{margin:"12px 0"}}>
                {hiscore && moves <= hiscore.tries && Math.floor((tEnd.current-tStart.current)/1000) <= hiscore.secs
                  ? <span style={{color:"#FFD600"}}>🥇 New Personal Best!</span>
                  : <span>Try again to break your record!</span>
                }
              </div>
              <button className="mpg-ctrl-btn" onClick={restartGame}>Play Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- NEON ARCADE CSS+PIXEL FONT STYLES ---
const ARCADE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@900&display=swap');
.arcade-pixelfont { font-family: 'Press Start 2P', 'Orbitron', monospace; font-weight: 900 !important; }
.arcade-emoji { font-family: Apple Color Emoji, Segoe UI Emoji, 'VT323', 'Orbitron', monospace !important;}

.mpg-main-bg-arcade {
  background: radial-gradient(circle at 14% 22%, #16156a 0%, #320082 42%, #1bc9ff1b 90%, #111131 100%);
  min-height: 100vh; width:100vw;
  display:flex; flex-direction:column; align-items:center;
  padding-bottom: 32px;
  user-select: none;
}
.mpg-header {
  margin-top: 97px; font-size: 2.5rem; color: #FFD600;
  text-shadow: 0 2px 23px #FFD60088, 0 3.5px 38px #43E9FFbb;
  margin-bottom:9px;text-align:center;letter-spacing:.13em;
}
.mpg-modes-header {
  font-size: 1.61rem; font-family: 'Press Start 2P', monospace;
  color: #FFF; text-shadow: 0 1.5px 13px #43e9ff82, 0 3px 21px #ffd60081;
  margin-bottom:22px; letter-spacing:.07em;
}
.mpg-modepicker-wrap {
  margin:62px auto 0 auto; display:flex; flex-direction:column; align-items:center;
}
.mpg-mode-btnrow { display:flex; gap:27px; margin:25px 0;}
.mpg-mode-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.21rem;
  background: #222044;
  color: #FFD600;
  border: 2.7px solid #FFD600;
  border-radius: 13px;
  padding: 19px 29px;
  box-shadow: 0 2px 37px #FFD60023, 0 0.5px 27px #43E9FF55;
  margin-bottom:.7rem;
  cursor:pointer;
  outline:none;
  transition: background 0.17s,box-shadow .17s, color 0.16s, transform .125s;
  position:relative;z-index:5;
}
.mpg-mode-btn:focus,.mpg-mode-btn:hover {
  background: linear-gradient(95deg,#FFD600 50%,#43E9FF 100%);
  color: #190151;
  box-shadow:0 0 37px #FFD60080,0 0.5px 37px #43E9FF90;
  transform: scale(1.065) rotate(-3deg);
}
.mpg-btn-glow {
  filter:drop-shadow(0 1.5px 14px #FFD60092);
}

.mpg-loader-wrap {
  display:flex;height:48vh;flex-direction:column;align-items:center;justify-content:center;
}
.mpg-loader-anim {
  display:flex;flex-direction:column;align-items:center;
  background:rgba(39,35,88,0.44);border-radius:23px;
  box-shadow:0 6px 37px #FFD60022,0 2px 0 #ff43ef64;
  padding:41px 40px;
}
.mpg-mock-progress {
  width:320px;height:13px;background:linear-gradient(91deg,#320082 47%,#43e9ff 100%);
  border-radius:7px;box-shadow:0 2px 24px #FFD60041;
  margin-bottom:31px;
  position:relative;
  overflow:hidden;
}
.mpg-mock-progress::after{
  content:""; position:absolute;left:-40px;top:0;height:100%;width:70px;
  background:linear-gradient(95deg,#FFD600b0 10%,#ef47cb 99%);
  border-radius:7px;animation:mpgFakeBarMove 1.23s cubic-bezier(.44,.13,.65,1.13) infinite;
}
@keyframes mpgFakeBarMove{
  0%{left:-40px;}100%{left:298px;}
}
.mpg-arcade-loader {
  color:#FFD600;
  text-shadow:0 1.7px 18px #FFD60036,0 3.5px 39px #43E9FF66;
  font-size:1.23rem; letter-spacing:.08em;margin-top:11px;
}
.mpg-statbar {
  margin:23px auto 0 auto; display:flex;align-items:center;justify-content:center;
  gap:41px; font-size:1.18rem;
  background:rgba(16,17,78,0.41);border-radius:16px;padding:13px 18px;
  color:#FFD600; box-shadow:0 2px 13px #FFD60035;
  text-shadow:0 2px 13px #FFD60081;
  max-width:750px;
}
.mpg-btn-sound {
  background: linear-gradient(89deg,#FFD600,#43E9FF 100%);
  font-size: 1.1em; border:none;border-radius:8px;cursor:pointer;
  color: #230051; box-shadow:0 1.2px 9px #ffd60088;
  margin-left:23px;padding:8px 15px;transition:background .17s,transform .13s;
  outline: none;
}
.mpg-btn-sound:hover, .mpg-btn-sound:focus {background:linear-gradient(87deg,#ef47cb,#FFD600 80%); color:#fff;transform:scale(1.14);}
.mpg-btn-sound.off { filter:grayscale(0.85);opacity:.74;}
.mpg-btn-sound.on { filter:none;opacity:1;}

.mpg-gameboard-outer {margin:21px auto;display:flex; align-items:center;justify-content:center;}
.mpg-gridwrap {display:block;}
.mpg-gameboard {
  margin:0 auto; transition:box-shadow .14s;
  background:linear-gradient(101deg,#181854 65%, #FFD60010 100%);
  box-shadow:0 3px 28px #FFD60022,0 2px 0 #43E9FF24;
  padding:16px 11px;border-radius:21px;
}
.mpg-card {
  aspect-ratio: 1/1;
  background: linear-gradient(129deg, #330b6a 56%, #ffd60022 100%);
  border-radius:11px;
  box-shadow:0 2px 19px #FFD60022,0 1.2px 12px #ff24e562;
  font-size:2rem;
  color:#FFD600;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  user-select:none;position:relative;
  border:2.1px solid #FFD60049;
  transition:box-shadow .11s,background .12s,transform .10s, border .13s;
  min-width:25px;min-height:24px;outline:none;
  z-index:1;
}
.mpg-card span {
  display: block; width: 100%; height: 100%;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}
.mpg-card.flipped,.mpg-card.matched {
  background:linear-gradient(122deg,#FFD600 68%,#43E9FF 100%);
  color:#130e26;
  box-shadow:0 5px 22px #FFD60099,0 3px 12px #43E9FF81;
  font-weight: normal;
  z-index:3;
}
.mpg-card.flipped span,
.mpg-card.matched span {
  text-shadow: 0 2px 10px #FFD60079, 0 0 13px #43E9FF55, 0 2px 8px #0002;
}
.mpg-card.matched-glow {
  animation: mgPulse 0.49s linear;
  filter: drop-shadow(0 0 24px #FFD60099);
}
@keyframes mgPulse {0%{filter:drop-shadow(0 0 3px #FFD60040);}70%{filter:drop-shadow(0 0 18px #FFD600FF);}100%{filter:drop-shadow(0 0 0 #FFD60000);}}
.mpg-card.temp-locked { pointer-events: none; opacity: .6;}
.mpg-card.disabled {pointer-events:none;opacity:.45;filter:grayscale(.61);}
.mpg-card.finished {pointer-events:none;filter:grayscale(.91); opacity:.74;}

.mg-shake { animation: mgshake .23s cubic-bezier(.75,.02,.68,1.31) 2;}
@keyframes mgshake {
  0% {transform: translateX(0px);}
  22% {transform: translateX(-9px);}
  44% {transform: translateX(12px);}
  66% {transform: translateX(-8px);}
  100% {transform: translateX(0);}
}

.mpg-controls-row {
  margin-top:32px;display:flex;gap:17px;justify-content:center;
}
.mpg-ctrl-btn {
  padding:11px 31px; border-radius:11px; border:none;
  background:linear-gradient(91deg,#FFD600 0%,#43E9FF 100%);
  color:#1b0a31;
  font-family:'Press Start 2P',monospace;text-shadow:0 2px 8px #ffd60047;
  font-weight:800;font-size:1.05rem;letter-spacing:.04em;cursor:pointer;
  box-shadow:0 0 13px #43E9FF44,0 2px 9px #FFD60041;
  transition:background .15s,box-shadow .13s,transform .09s,color .12s;
  margin: 0 6px;
}
.mpg-ctrl-btn:focus,.mpg-ctrl-btn:hover {
  background:linear-gradient(93deg,#ef47cb,#FFD600 70%);
  color:#fff;
  box-shadow:0 0 27px #FFD600c8;
  transform:scale(1.07) rotate(-2deg);
}
.mpg-endstat-pop {
  position:fixed;left:50%;top:52%;transform:translate(-50%,-50%);
  background:rgba(24,7,70,0.91);border-radius:21px;color:#FFD600;
  padding:41px 27px;z-index:99;min-width:245px;min-height:144px;
  text-align:center;font-size:1.25rem;
  box-shadow:0 4px 44px #43E9FF81,0 0.5px 32px #FFD60055;
  animation: mgPopEnd .5s cubic-bezier(.37,1.37,.51,1.14);
  font-family:'Press Start 2P',monospace;
}
@keyframes mgPopEnd {0%{transform:translate(-50%,-50%) scale(.7) rotate(-4deg);opacity:.27;}100%{transform:translate(-50%,-50%);opacity:1;}}
@media (max-width:700px){.mpg-header{font-size:1.19rem;}}
@media (max-width:550px){
  .mpg-modepicker-wrap, .mpg-modes-header {font-size:1rem;}
  .mpg-mode-btn {
    padding:11px 12px;font-size:.88rem;margin-bottom:.3em;text-align:center;
  }
  .mpg-statbar {flex-direction:column;gap:13px;font-size:.99rem;padding:11px 7vw;}
  .mpg-gameboard {padding:7px 2.9vw;}
  .mpg-gridwrap {padding:2vw;}
}

::-webkit-scrollbar-thumb {background:linear-gradient(90deg,#ffd60077,#5118ea77);}
`;

export default MemoryPuzzleGame;
