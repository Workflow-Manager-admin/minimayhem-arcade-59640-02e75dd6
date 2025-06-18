import React, { useState, useEffect, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * SlidingTilePuzzleGame
 * Classic sliding tile puzzle with arcade pixel/retro style.
 * - Modes: Easy (3x3), Medium (4x4), Hard (5x5)
 * - Allow mode selection, click-to-slide tiles, timer and moves counter,
 * - Show best stats stored in localStorage
 * - Vibrant pixel/arcade styling with bright gradients and arcade/pixel fonts
 */
const MODES = {
  easy: { size: 3, label: "Easy (3×3)" },
  medium: { size: 4, label: "Medium (4×4)" },
  hard: { size: 5, label: "Hard (5×5)" },
};
// Font-face import for arcade/pixel style:
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
`;

function getBestKey(mode) {
  return `sliding-puzzle-best-${mode}`;
}

function shuffleArray(arr, size) {
  // Fisher-Yates shuffle until solvable (avoid unsolvable states)
  let tiles;
  do {
    tiles = arr.slice();
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(tiles, size) || isSolved(tiles));
  return tiles;
}
function isSolved(tiles) {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}
function isSolvable(tiles, size) {
  // https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
  const len = tiles.length;
  let invCount = 0;
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) invCount++;
    }
  }
  if (size % 2 === 1) return invCount % 2 === 0; // Odd grid
  // Even grid: blank row from bottom (start at 0): row 0,1,2,3,...
  const blankRow = size - Math.floor(tiles.indexOf(0) / size);
  if (blankRow % 2 === 0) return invCount % 2 === 1;
  else return invCount % 2 === 0;
}

function useInterval(callback, delay) {
  // Runs callback every delay ms, or stops if delay === null. Used for timer.
  const savedCb = useRef();
  useEffect(() => { savedCb.current = callback }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCb.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Returns humanized time in mm:ss
function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function getBest(mode) {
  try {
    const str = localStorage.getItem(getBestKey(mode));
    if (str) {
      return JSON.parse(str);
    }
  } catch { /* ignore */ }
  return null;
}

function setBest(mode, moves, time) {
  localStorage.setItem(getBestKey(mode), JSON.stringify({ moves, time }));
}

const VIBRANT_BG_GRAD = "linear-gradient(135deg, #00ffff 0%, #ffb347 92%, #ff69b4 100%)";
const TILE_COLORS = [
  "#fff", "#ffe76c", "#60eeff", "#4bdfa7", "#f794ff", "#ffa071", "#7ad1ff", "#ffe095", "#e1ff6c", "#ff8f90",
  "#bf92ff", "#8dff87", "#ffcfdc", "#ffcec7", "#cdf3fe", "#fed3f2", "#ffffb7",
];

// PUBLIC_INTERFACE
function SlidingTilePuzzleGame() {
  const [mode, setMode] = useState("easy");
  const size = MODES[mode].size;
  const total = size * size;
  const [tiles, setTiles] = useState(() =>
    shuffleArray([...Array(total - 1).keys()].map(i => i + 1).concat([0]), size)
  );
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [victory, setVictory] = useState(false);
  const [best, setBestStats] = useState(getBest(mode));
  const firstMoveMade = useRef(false);

  // Timer logic
  useInterval(() => {
    if (started && !victory) setTimer(t => t + 1);
  }, started && !victory ? 1000 : null);

  // When mode changes: reset game state
  useEffect(() => {
    setTiles(shuffleArray([...Array(MODES[mode].size ** 2 - 1).keys()].map(i => i + 1).concat([0]), MODES[mode].size));
    setMoves(0);
    setTimer(0);
    setVictory(false);
    setBestStats(getBest(mode));
    setStarted(false);
    firstMoveMade.current = false;
  }, [mode]);

  // Check for win
  useEffect(() => {
    if (isSolved(tiles)) {
      if (!victory && started) {
        setVictory(true);
        // Update best stats in localStorage if broken
        if (
          !best ||
          moves < best.moves ||
          (moves === best.moves && timer < best.time)
        ) {
          setBest(mode, moves, timer);
          setBestStats({ moves, time: timer });
        }
      }
    }
  }, [tiles, victory, started, moves, timer, best, mode]);

  function handleTileClick(idx) {
    if (victory) return;
    const blankIdx = tiles.indexOf(0);
    // Adjacent if above/below/left/right and not out of bounds
    const valid =
      (idx === blankIdx - 1 && idx % size !== size - 1) ||
      (idx === blankIdx + 1 && idx % size !== 0) ||
      idx === blankIdx - size || idx === blankIdx + size;
    if (!valid) return;
    // Start timer on first move
    if (!firstMoveMade.current) {
      setStarted(true);
      firstMoveMade.current = true;
    }
    // Swap clicked tile with blank
    const next = tiles.slice();
    [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]];
    setTiles(next);
    setMoves(m => m + 1);
  }

  function handleRestart() {
    setTiles(shuffleArray([...Array(size * size - 1).keys()].map(i => i + 1).concat([0]), size));
    setMoves(0);
    setTimer(0);
    setVictory(false);
    setStarted(false);
    firstMoveMade.current = false;
  }

  // Style - arcade pixel/bright
  const arcadeFont =
    "'Press Start 2P', 'Orbitron', 'Arial', 'sans-serif'";
  const borderGlow = "0 0 8px #fff8, 0 3px 14px #55fff9a0";
  const colorWin = "#53ffb4";

  return (
    <div
      style={{
        fontFamily: arcadeFont,
        background: VIBRANT_BG_GRAD,
        borderRadius: 20,
        boxShadow: "0 6px 34px 0 #22aaff5e, 0 1px 32px #ff7ec5b3",
        margin: "2.5rem auto",
        padding: "2.0rem 1.4rem 2.6rem 1.4rem",
        maxWidth: 520,
        minWidth: 260,
        position: "relative",
        color: "#111",
        textShadow: "0 2px 7px #fff7, 0 0 3px #def"
      }}
    >
      <style>{fontCss}</style>
      <h2
        style={{
          textAlign: "center",
          letterSpacing: 2,
          color: "#2826da",
          fontFamily: arcadeFont,
          fontSize: "2rem",
          marginTop: 0,
          marginBottom: "0.75rem",
          textShadow: "0 3px 12px #fff, 0 1.5px 0 #12fcff73,0 2px 8px #fd76fe59"
        }}
      >
        🕹️ Sliding Tile Puzzle
      </h2>
      <div
        style={{
          textAlign: "center",
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: 13,
          justifyContent: "center"
        }}
      >
        {Object.entries(MODES).map(([k, v]) => (
          <button
            key={k}
            className="mode-btn"
            aria-label={v.label}
            style={{
              fontFamily: arcadeFont,
              fontSize: 15,
              padding: "8px 9px",
              background: mode === k ? "#ffd600" : "#4ecdfc",
              border: "none",
              color: "#190099",
              fontWeight: 900,
              borderRadius: 7,
              boxShadow: mode === k ? "0 0 9px #fdf670" : "0 2px 10px #90e3ff90",
              outline: mode === k ? "2.5px solid #fff000" : undefined,
              cursor: "pointer",
              marginRight: 0,
              letterSpacing: 1.2,
              textShadow: mode === k
                ? "0 2px 4px #ffc800b0,0 0px 8px #fff"
                : "0 3px 6px #f4f6ff90",
              transition: "background 0.2s"
            }}
            onClick={() => setMode(k)}
            disabled={mode === k}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 38,
          fontSize: 14.5,
          fontWeight: 700,
          margin: "0 0 0.7rem 0",
          fontFamily: arcadeFont,
          textShadow: "0 2px 3px #aefff7bb"
        }}
      >
        <span>
          <span style={{ color: "#0793b7" }}>Moves: </span>
          <span style={{ minWidth: 28, display: "inline-block" }}>{moves}</span>
        </span>
        <span>
          <span style={{ color: "#ff6c6c" }}>Time: </span>
          <span style={{ minWidth: 35, display: "inline-block" }}>{formatTime(timer)}</span>
        </span>
      </div>
      <div
        id="arcade-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 58px)`,
          gridTemplateRows: `repeat(${size}, 58px)`,
          gap: 8,
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 1.6rem auto",
          background: "#161929c1",
          borderRadius: 15,
          boxShadow: "0 0 13px 0 #5be4ff77",
          border: "2.5px solid #00ffff",
          padding: "8px",
          userSelect: "none"
        }}
      >
        {tiles.map((num, i) => {
          const isBlank = (num === 0);
          const blankIdx = tiles.indexOf(0);
          // Highlight if adjacent (legal move)
          const adj =
            !victory &&
            ((i === blankIdx - 1 && i % size !== size - 1) ||
              (i === blankIdx + 1 && i % size !== 0) ||
              i === blankIdx - size || i === blankIdx + size);

          return (
            <button
              key={i}
              className="tile"
              tabIndex={isBlank ? -1 : 0}
              aria-label={isBlank ? "Blank" : `Tile ${num}`}
              onClick={() => handleTileClick(i)}
              disabled={isBlank || victory}
              style={{
                width: 56,
                height: 56,
                borderRadius: "8px",
                fontFamily: arcadeFont,
                fontSize: num > 999 ? 18 : 22,
                fontWeight: 900,
                background: isBlank
                  ? "rgba(250,250,250,0.08)"
                  : `linear-gradient(110deg, ${TILE_COLORS[i % TILE_COLORS.length]},#fff8)`,
                boxShadow: isBlank
                  ? "inset 0 0 9px #00d0ff55"
                  : adj
                  ? "0 0 16px 0 #ffefb6, 0 0 20px #98e6ffbb"
                  : "0 2.5px 18px #fff5, 0 0 3px #fdba46cc",
                color: isBlank
                  ? "#40fff8"
                  : "#23247d",
                border: isBlank
                  ? "2px dotted #17eeff90"
                  : adj
                  ? "2.8px solid #fff093"
                  : "2.2px solid #2d97ff66",
                opacity: isBlank ? 0.24 : 1,
                cursor: isBlank || victory ? "default" : adj ? "pointer" : "not-allowed",
                outline: "none",
                transition:
                  "background 0.20s, box-shadow 0.19s, border 0.18s, filter 0.2s",
                filter: adj ? "brightness(1.11)" : undefined,
                zIndex: isBlank ? 1 : 10,
                position: "relative"
              }}
            >
              {!isBlank && num}
            </button>
          );
        })}
      </div>
      {/* WIN Banner */}
      {victory && (
        <div
          aria-live="assertive"
          style={{
            position: "absolute",
            left: 0, right: 0,
            top: 0,
            zIndex: 25,
            padding: "1.33rem 0 0 0",
            minHeight: 52,
            textAlign: "center",
            fontSize: "1.5rem",
            color: colorWin,
            fontWeight: 900,
            fontFamily: arcadeFont,
            background: "linear-gradient(90deg, #53e7ff11 0%, #d6aedf45 100%)",
            textShadow:
              "0 0 9px #ffffffcc, 0 2.5px 16px #c5ffd7, 0 1.5px 0 #140bbc99"
          }}
        >
          <span role="img" aria-label="party">🎉</span>
          <b> YOU SOLVED IT!</b>
        </div>
      )}
      {/* Best stats panel */}
      <div
        style={{
          margin: "11px auto 0 auto",
          padding: "9px 6px 7px 10px",
          background: "#241b498f",
          borderRadius: 12,
          fontSize: "14px",
          color: "#ffe662",
          fontFamily: arcadeFont,
          maxWidth: 320,
          boxShadow: "0 1.5px 11px #ffd60044",
          border: "1.5px solid #ffd60044",
        }}
      >
        <span style={{ fontWeight: 700 }}>Best (for {MODES[mode].label}): </span>
        {best ? (
          <>
            <span role="img" aria-label="trophy">🏆</span>
            &nbsp;<b>Moves:</b> {best.moves}, <b>Time:</b> {formatTime(best.time)}
          </>
        ) : (
          <span style={{ color: "#ffdaba" }}>No record yet</span>
        )}
      </div>
      {/* Controls */}
      <div style={{
        marginTop: "1.30rem",
        display: "flex",
        justifyContent: "center",
        gap: 19
      }}>
        <button
          onClick={handleRestart}
          style={{
            fontFamily: arcadeFont,
            fontSize: 15,
            color: "#fff",
            fontWeight: 900,
            background: "linear-gradient(92deg,#00ffe8 0%,#2c72ff 100%)",
            border: "none",
            borderRadius: 7,
            boxShadow: "0 5px 15px 0 #c1f8fff0",
            outline: "2.5px solid #fff",
            cursor: "pointer",
            letterSpacing: 1,
            padding: "7px 24px",
            transition: "background 0.2s"
          }}
        >
          Restart
        </button>
      </div>
      {/* Touch tip */}
      <div style={{
        margin: "1.1em auto 0.3em auto",
        textAlign: "center",
        color: "#44fdff",
        fontSize: 13,
        fontFamily: arcadeFont,
        textShadow: "0 1px 4px #fff9",
        opacity: 0.98
      }}>
        Tap/click tiles <b>next to the blank</b> to slide!
      </div>
    </div>
  );
}

export default SlidingTilePuzzleGame;
