import React, { useState, useEffect, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * SlidingTilePuzzleGame: Arcade-style sliding tile puzzle (3x3, 4x4, 5x5) with mode select, timer, moves, reset, win detection.
 * Pixel/arcade styled, no dependencies, ready for route: /games/sliding-puzzle.
 */
const MODES = [
  { key: "easy", size: 3, label: "Easy (3×3)" },
  { key: "medium", size: 4, label: "Medium (4×4)" },
  { key: "hard", size: 5, label: "Hard (5×5)" },
];

const ARCADE_FONT =
  "'Press Start 2P', 'Orbitron', 'VT323', 'Pixel Operator', 'Consolas', monospace";

const ARCADE_COLORS = {
  bg: "linear-gradient(135deg, #120037 0%, #0f2057 60%, #3626b5 100%)",
  panel: "#130c2cdd",
  border: "#46e2fa",
  win: "#5bff5e",
  btnDefault: "#e8793c",
  btnHover: "#ffc300",
  gridBorder: "#44fbff",
  timer: "#ffead7",
  tile: {
    base: "#1f5fff",
    light: "#74e0fe",
    text: "#fff",
    blank: "#0f2057",
  },
};

function getShuffledGrid(size) {
  // Returns a shuffled, *solvable* grid for the given size (NxN), with one blank null.
  const arr = [];
  for (let i = 1; i < size * size; i++) arr.push(i);
  arr.push(null);

  // Shuffle until solvable and not already solved
  let result;
  do {
    result = shuffleArray(arr.slice());
  } while (!isSolvable(result, size) || isSolved(result, size));
  return result;
}

function shuffleArray(arr) {
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getTilePosition(idx, size) {
  return { row: Math.floor(idx / size), col: idx % size };
}

function canMove(tileIdx, blankIdx, size) {
  // Returns true if tile at tileIdx can move into blankIdx
  const { row: r1, col: c1 } = getTilePosition(tileIdx, size);
  const { row: r2, col: c2 } = getTilePosition(blankIdx, size);
  return (
    (r1 === r2 && Math.abs(c1 - c2) === 1) ||
    (c1 === c2 && Math.abs(r1 - r2) === 1)
  );
}

function isSolved(grid, size) {
  // Returns true if the grid is in solved order
  for (let i = 0; i < grid.length - 1; i++) {
    if (grid[i] !== i + 1) return false;
  }
  return grid[grid.length - 1] === null;
}

function isSolvable(grid, size) {
  // Standard solvability check for sliding tile puzzle
  let invCount = 0;
  let blankRow = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) {
      blankRow = Math.floor(i / size);
      continue;
    }
    for (let j = i + 1; j < grid.length; j++) {
      if (grid[j] && grid[j] < grid[i]) invCount++;
    }
  }
  if (size % 2 === 1) {
    // odd grid: number of inversions even
    return invCount % 2 === 0;
  } else {
    // even grid: blankRow from bottom even with invCount odd, etc.
    const rowFromBottom = size - blankRow;
    return (invCount + rowFromBottom) % 2 === 0;
  }
}

function useInterval(callback, delay, running) {
  // Custom hook: setInterval only when running
  const savedCallback = useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (!running) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, running]);
}

const arcadeShadow = (color="#000", y=3, s=6) =>
  `0 ${y}px ${s}px ${color},0 ${y*2}px ${s*2}px #090e41cc`;

// PUBLIC_INTERFACE
function SlidingTilePuzzleGame() {
  // State
  const [mode, setMode] = useState(MODES[0]);
  const [grid, setGrid] = useState(() => getShuffledGrid(mode.size));
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isSolvedState, setIsSolvedState] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  // Timer
  useInterval(
    () => setTimer(t => t + 1),
    1000,
    !isSolvedState && gameActive
  );

  // When mode changes or reset: new grid, reset stats
  useEffect(() => {
    setGrid(getShuffledGrid(mode.size));
    setMoves(0);
    setTimer(0);
    setIsSolvedState(false);
    setGameActive(true);
  }, [mode]);

  // Check win
  useEffect(() => {
    if (isSolved(grid, mode.size)) {
      setIsSolvedState(true);
      setGameActive(false);
    }
  }, [grid, mode.size]);

  // Handlers
  function handleTileClick(i) {
    if (isSolvedState || !gameActive) return;
    const blank = grid.indexOf(null);
    if (!canMove(i, blank, mode.size)) return;
    const newGrid = grid.slice();
    [newGrid[i], newGrid[blank]] = [newGrid[blank], newGrid[i]];
    setGrid(newGrid);
    setMoves(m => m + 1);
  }

  function handleModeChange(e) {
    setMode(MODES.find(m => m.key === e.target.value));
  }

  function handleReset() {
    setGrid(getShuffledGrid(mode.size));
    setMoves(0);
    setTimer(0);
    setIsSolvedState(false);
    setGameActive(true);
  }

  // Render helpers
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${mode.size}, 1fr)`,
    gridTemplateRows: `repeat(${mode.size}, 1fr)`,
    gap: `${mode.size >= 5 ? 7 : 10}px`,
    background: ARCADE_COLORS.bg,
    border: `4px solid ${ARCADE_COLORS.gridBorder}`,
    borderRadius: 18,
    margin: "0 auto",
    marginBottom: 8,
    boxShadow: arcadeShadow("#45e0fe", 5, 21),
    width: mode.size * 76 + (mode.size - 1) * (mode.size >= 5 ? 7 : 10),
    height: mode.size * 76 + (mode.size - 1) * (mode.size >= 5 ? 7 : 10),
    maxWidth: "92vw",
    userSelect: "none",
    transition: "width 0.18s, height 0.18s"
  };

  function tileStyle(num, isBlank) {
    return {
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: ARCADE_FONT,
      fontSize: isBlank ? "0em" : `${mode.size >= 5 ? 1.1 : 1.33}em`,
      background: isBlank ? ARCADE_COLORS.tile.blank : ARCADE_COLORS.tile.base,
      border: isBlank ? "none" : `2.5px solid ${ARCADE_COLORS.tile.light}`,
      color: isBlank ? "transparent" : ARCADE_COLORS.tile.text,
      boxShadow: isBlank ? "none" : arcadeShadow("#44fbff", 1, 8),
      borderRadius: isBlank ? 11 : 13,
      cursor: isBlank || isSolvedState ? "default" : "pointer",
      transition: "background 0.19s, box-shadow 0.22s",
      outline: isSolvedState
        ? `2.8px solid ${ARCADE_COLORS.win}`
        : isBlank
        ? "none"
        : "",
      position: "relative",
      minHeight: 0,
      minWidth: 0,
      height: 75,
      width: 75,
      maxWidth: "19vw",
      maxHeight: "19vw",
      willChange: "background,box-shadow"
    };
  }

  // UI

  return (
    <div
      style={{
        fontFamily: ARCADE_FONT,
        padding: 0,
        background: ARCADE_COLORS.bg,
        minHeight: "99vh",
        paddingBottom: 52,
      }}
    >
      {/* Arcade/Pixelfont imports (in-page, for this game) */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap');
        .sliding-arcade__btn:active { filter: brightness(1.11) !important; }
        `}
      </style>
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          marginTop: 64,
          background: ARCADE_COLORS.panel,
          borderRadius: 18,
          boxShadow: arcadeShadow("#3700C9", 6, 37),
          border: `2.2px solid ${ARCADE_COLORS.gridBorder}`,
          padding: "24px 18px 22px 18px",
          minWidth: 254,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: "2.1rem",
            marginBottom: "0.28em",
            fontWeight: 900,
            letterSpacing: 2,
            textShadow:
              arcadeShadow("#ffc871", 2, 7) +
              ",0 0 34px #45faff44",
            fontFamily: ARCADE_FONT,
          }}
        >
          <span role="img" aria-label="puzzle" style={{fontSize:32}}>
            🧩
          </span>{" "}
          Sliding Puzzle
        </h1>
        <div
          style={{
            margin: "0.6em 0 1.3em 0",
            fontSize: "1rem",
            color: ARCADE_COLORS.tile.light,
            fontFamily: ARCADE_FONT,
            textShadow: arcadeShadow("#fff", 1.3, 7),
            letterSpacing: "1.5px",
            fontWeight: 800,
          }}
        >
          Slide numbered tiles to arrange them in order!
        </div>
        <div role="group" aria-label="Mode selector" style={{marginBottom:12}}>
          {MODES.map(m => (
            <button
              key={m.key}
              value={m.key}
              disabled={mode.key === m.key}
              tabIndex={mode.key === m.key ? -1 : 0}
              className="sliding-arcade__btn"
              style={{
                background:
                  mode.key === m.key
                    ? ARCADE_COLORS.btnHover
                    : ARCADE_COLORS.btnDefault,
                color: "#140c0d",
                borderRadius: 8,
                border: "none",
                boxShadow:
                  mode.key === m.key
                    ? arcadeShadow("#ffd601", 0, 5)
                    : arcadeShadow("#000", 0, 4),
                fontFamily: ARCADE_FONT,
                fontWeight: 900,
                fontSize: "1.08em",
                minWidth: 84,
                margin: "0 6px 7px 0",
                padding: "6px 15px 7px 14px",
                cursor: mode.key === m.key ? "default" : "pointer",
                outline: mode.key === m.key
                  ? `2.3px solid ${ARCADE_COLORS.btnHover}`
                  : "",
                opacity: mode.key === m.key ? 0.8 : 1,
                transition: "background 0.12s, box-shadow 0.22s"
              }}
              onClick={mode.key === m.key ? undefined : handleModeChange}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div style={gridStyle}>
          {grid.map((num, i) => (
            <button
              tabIndex={num !== null && !isSolvedState ? 0 : -1}
              aria-label={
                num === null
                  ? "Blank tile"
                  : `Tile ${num}${canMove(i, grid.indexOf(null), mode.size) ? ", movable" : ""}`
              }
              style={tileStyle(num, num === null)}
              className={
                "sliding-arcade__tile" +
                (canMove(i, grid.indexOf(null), mode.size)
                  && num !== null && !isSolvedState
                  ? " sliding-arcade__movable"
                  : "") +
                (num === null ? " sliding-arcade__blank-tile" : "")
              }
              key={i}
              onClick={() => handleTileClick(i)}
              disabled={num === null || isSolvedState}
            >
              {num === null ? "" : num}
            </button>
          ))}
        </div>
        <div
          style={{
            margin: "13px 0 8px 0",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 10,
            fontSize: "1.08rem",
            fontFamily: ARCADE_FONT,
            fontWeight: 600,
            color: ARCADE_COLORS.tile.light,
            textShadow: arcadeShadow("#fff", 1, 6)
          }}
        >
          <span>
            <span role="img" aria-label="Swap">🔄</span> Moves&nbsp;
            <b>{moves}</b>
          </span>
          <span style={{color: ARCADE_COLORS.timer}}>
            <span role="img" aria-label="Clock">⏱️</span>
            &nbsp; Time&nbsp;
            <b>
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </b>
          </span>
        </div>
        <button
          className="sliding-arcade__btn"
          style={{
            background: ARCADE_COLORS.btnDefault,
            color: "#fff",
            border: "none",
            borderRadius: 17,
            boxShadow: arcadeShadow("#f1fff9", 1, 10),
            fontFamily: ARCADE_FONT,
            fontWeight: 900,
            fontSize: "1.05em",
            margin: "7px 0 0 0",
            padding: "9px 28px 9px 29px",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: 1.7,
            transition: "background 0.19s",
            outline: "none"
          }}
          onClick={handleReset}
        >
          Reset
        </button>
        {/* Win overlay */}
        {isSolvedState && (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "99vh",
              background: "rgba(0,0,0,0.81)",
              zIndex: 2222,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              pointerEvents: "all",
              transition: "opacity 0.2s"
            }}
            onClick={handleReset}
            tabIndex={0}
          >
            <div
              style={{
                padding: "44px 44px 30px 44px",
                background: "#291382ee",
                border: `3.6px solid ${ARCADE_COLORS.win}`,
                borderRadius: 23,
                minWidth: 244,
                boxShadow: arcadeShadow("#00fc80", 7, 36),
                textAlign: "center",
                color: ARCADE_COLORS.win,
                fontFamily: ARCADE_FONT,
                outline: "none"
              }}
            >
              <div
                style={{
                  fontSize: "2.25rem",
                  textShadow: arcadeShadow("#fff", 4, 17),
                  fontWeight: 900,
                  letterSpacing: 2
                }}
              >
                🎉 Puzzle Solved! 🎉
              </div>
              <div
                style={{
                  margin: "20px 0 7px 0",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.15em"
                }}
              >
                {moves} moves &middot; {String(Math.floor(timer / 60)).padStart(2, "0")}:
                {String(timer % 60).padStart(2, "0")}
              </div>
              <button
                className="sliding-arcade__btn"
                style={{
                  background: ARCADE_COLORS.btnHover,
                  color: "#120017",
                  padding: "10px 38px",
                  borderRadius: 10,
                  border: "none",
                  marginTop: 16,
                  fontSize: "1.06em",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: arcadeShadow("#ffef4c", 0, 7),
                  letterSpacing: 1.2,
                  fontFamily: ARCADE_FONT
                }}
                onClick={handleReset}
                autoFocus
              >
                Play Again!
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Extra arcade-style keytip */}
      <div
        style={{
          marginTop: 27,
          fontSize: ".99rem",
          color: "#fff7",
          fontFamily: ARCADE_FONT,
          textAlign: "center",
          textShadow: arcadeShadow("#050a14", 2, 7),
          letterSpacing: 1.1,
        }}
      >
        <span role="img" aria-label="Joystick">
          🕹️
        </span>{" "}
        Tip: Click a tile next to the blank to slide!
      </div>
    </div>
  );
}

export default SlidingTilePuzzleGame;
