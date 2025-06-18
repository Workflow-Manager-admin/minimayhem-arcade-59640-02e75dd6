import React, { useState, useEffect } from "react";

/**
 * Utilities for board generation, shuffling, win check.
 */

const MODES = {
  easy: { size: 3 },
  medium: { size: 4 },
  hard: { size: 5 }
};

function shuffleBoard(size) {
  // Create solved board, then shuffle
  let arr = Array.from({ length: size * size }, (_, i) => i);
  let shuffled = arr.slice();
  // Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return chunk(shuffled, size);
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function isSolved(board) {
  const flat = board.flat();
  for (let i = 0; i < flat.length - 1; i++) {
    if (flat[i] !== i + 1) return flat[i] === 0 && i === flat.length - 2;
  }
  return flat[flat.length - 1] === 0;
}

function findZero(board) {
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board.length; c++)
      if (board[r][c] === 0) return { row: r, col: c };
  return { row: -1, col: -1 };
}

function canMove(board, r, c) {
  const { row: zr, col: zc } = findZero(board);
  return (
    (Math.abs(zr - r) === 1 && zc === c) ||
    (Math.abs(zc - c) === 1 && zr === r)
  );
}

/** PUBLIC_INTERFACE
 * Sliding Tile Puzzle Game (3/4/5x5), always exports a visible React component with mode select, reset, and game UI.
 */
function SlidingTilePuzzleGame() {
  // Mode selection (easy/medium/hard)
  const [mode, setMode] = useState("easy");
  const size = MODES[mode].size;

  // Game state
  const [board, setBoard] = useState(() => shuffleBoard(size));
  const [moveCount, setMoveCount] = useState(0);
  const [won, setWon] = useState(false);

  // When mode changes, reset board
  useEffect(() => {
    setBoard(shuffleBoard(size));
    setMoveCount(0);
    setWon(false);
  }, [mode, size]);

  // When board changes, check for win
  useEffect(() => {
    if (isSolved(board)) setWon(true);
  }, [board]);

  // Try to move tile
  function handleTileClick(r, c) {
    if (won) return;
    if (!canMove(board, r, c)) return;
    const { row: zr, col: zc } = findZero(board);
    const newBoard = board.map(row => row.slice());
    // Swap clicked tile and zero
    newBoard[zr][zc] = board[r][c];
    newBoard[r][c] = 0;
    setBoard(newBoard);
    setMoveCount(mc => mc + 1);
  }

  function handleReset() {
    setBoard(shuffleBoard(size));
    setMoveCount(0);
    setWon(false);
  }

  return (
    <div className="container" style={{ marginTop: 100, maxWidth: 420, textAlign: "center" }}>
      <h2 style={{
        fontFamily: "'Press Start 2P', 'Orbitron', 'Arial', sans-serif",
        color: "var(--base-light)",
        marginBottom: 10,
        letterSpacing: 2
      }}>
        🧩 Sliding Tile Puzzle
      </h2>
      <div style={{ marginBottom: "1em" }}>
        <label htmlFor="slide-mode" style={{ fontSize: 16, fontFamily: "inherit" }}>Difficulty: </label>
        {Object.keys(MODES).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              marginLeft: 8,
              marginRight: 8,
              padding: "5px 15px",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 6,
              border: "2px solid #77e",
              background: mode === m ? "var(--base-light)" : "#181870",
              color: mode === m ? "#fff" : "#FFF9",
              cursor: "pointer",
              transition: "background 0.18s"
            }}
            aria-pressed={mode === m}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <div style={{
        display: "inline-block",
        background: "#181870e0",
        borderRadius: 16,
        boxShadow: "0 6px 28px #33ddff13",
        padding: 18,
        border: "2px solid var(--base-light)"
      }}>
        <BoardUI
          board={board}
          onTileClick={handleTileClick}
          won={won}
        />
      </div>
      <div style={{ marginTop: 20, fontSize: 17 }}>
        Moves: <strong>{moveCount}</strong>
        <button
          onClick={handleReset}
          style={{
            marginLeft: 25,
            border: "none",
            padding: "8px 17px",
            borderRadius: 6,
            background: "linear-gradient(93deg,#2196f3,#9b1de7)",
            color: "#fff",
            fontWeight: 800,
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 2px 8px #22f7",
            letterSpacing: 0.5,
            transition: "background 0.19s"
          }}
        >
          Reset
        </button>
      </div>
      {won && (
        <div style={{
          marginTop: 16,
          color: "#FFD600",
          fontFamily: "'Orbitron', cursive",
          fontWeight: 900,
          fontSize: 21,
          textShadow: "0 0 10px #faf5, 0 2px 18px #FFD70099"
        }}>
          🎉 You solved it! <br /> <span style={{ fontSize: 15, color: "#fff", textShadow: "none" }}>Try a harder mode or play again!</span>
        </div>
      )}
      <div style={{
        marginTop: 40,
        color: "#aaa",
        fontSize: 13,
        fontFamily: "monospace",
        background: "rgba(45,60,120,0.11)",
        padding: "7px 0",
        borderRadius: 8
      }}>
        {`Tip: Only tiles adjacent to the empty space (0) can be moved. Complete the board in fewest moves!`}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Pure-dumb tile rendering
 */
function BoardUI({ board, onTileClick, won }) {
  const size = board.length;
  return (
    <div style={{
      display: "inline-grid",
      gridTemplateColumns: `repeat(${size}, 56px)`,
      gridTemplateRows: `repeat(${size}, 56px)`,
      gap: 2,
      position: "relative",
      background: "#101040"
    }}>
      {board.map((row, r) =>
        row.map((val, c) => (
          <Tile
            key={`${r},${c}`}
            value={val}
            onClick={() => onTileClick(r, c)}
            canClick={!won && val !== 0 && canMove(board, r, c)}
            won={!!won}
          />
        ))
      )}
    </div>
  );
}

function Tile({ value, onClick, canClick, won }) {
  if (value === 0)
    return (
      <div
        style={{
          width: 56, height: 56,
          background: "#1e2560bb",
          borderRadius: 7,
          border: "2.5px dashed #fcf4",
          boxSizing: "border-box"
        }}
      />
    );
  return (
    <button
      onClick={canClick ? onClick : undefined}
      tabIndex={canClick ? 0 : -1}
      aria-label={canClick ? `Move tile ${value}` : `Tile ${value}`}
      style={{
        width: 56,
        height: 56,
        fontWeight: 900,
        fontSize: 22,
        borderRadius: 7,
        background: canClick
          ? "linear-gradient(98deg,#FFD600 0%, #69a0ff 100%)"
          : won
          ? "linear-gradient(86deg,#c6ffb5 0%, #e6e6e6 92%)"
          : "linear-gradient(101deg,#282761 0%, #3948ad 100%)",
        color: canClick ? "#23263b" : "#fff",
        border: canClick
          ? "2px solid #FFD600"
          : won
          ? "2px solid #39DB00"
          : "1.8px solid #4baaff",
        cursor: canClick ? "pointer" : "default",
        transition: "background 0.15s"
      }}
      disabled={!canClick}
    >
      {value}
    </button>
  );
}

export default SlidingTilePuzzleGame;
