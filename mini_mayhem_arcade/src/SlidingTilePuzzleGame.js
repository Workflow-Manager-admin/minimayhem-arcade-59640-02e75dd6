import React, { useState, useEffect, useRef } from "react";

/**
 * SlidingTilePuzzleGame - an arcade-style sliding puzzle game for MiniMayhem Arcade.
 * Modes: Easy (3x3), Medium (4x4), Hard (5x5).
 * Features: Click-to-slide, timer and moves count, best scores tracked in localStorage, and vibrant arcade visuals.
 * Integrates into SPA routing at '/games/sliding-puzzle'.
 */

// Tile board sizes by mode
const BOARD_SIZES = {
  easy: 3,
  medium: 4,
  hard: 5,
};

const MODE_LABELS = {
  easy: "Easy (3x3)",
  medium: "Medium (4x4)",
  hard: "Hard (5x5)",
};

const BESTS_LS_KEY = "sliding-tile-puzzle-bests";

function genSolvedBoard(size) {
  // returns [ [1,2,3],[4,5,6],[7,8,0] ] etc (0 = blank)
  const arr = [];
  let n = 1;
  for (let i = 0; i < size; ++i) {
    arr.push([]);
    for (let j = 0; j < size; ++j) {
      arr[i].push(n < size * size ? n++ : 0);
    }
  }
  return arr;
}

// Fisher-Yates on flat array while keeping puzzle solvable
function shuffleBoard(board, size) {
  let flat = board.flat();
  let shuffled = [...flat];
  // Try shuffling until solvable and not already solved
  do {
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (!isSolvable(shuffled, size) || isSolvedArray(shuffled));
  // convert back to 2D
  let res = [];
  for (let i = 0; i < size; ++i)
    res.push(shuffled.slice(i * size, (i + 1) * size));
  return res;
}

function isSolvedArray(arr) {
  // Flat solved?
  return arr.every((v, i) =>
    i === arr.length - 1 ? v === 0 : v === i + 1
  );
}

function isSolved(board) {
  return isSolvedArray(board.flat());
}

// PUBLIC_INTERFACE
function isSolvable(arr, size) {
  // Checks solvability for N-puzzle
  // See: https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
  let invCount = 0;
  let N = size;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] && arr[j] && arr[i] > arr[j]) invCount++;
    }
  }
  if (N % 2 === 1) {
    // odd grid, true if inversion even
    return invCount % 2 === 0;
  } else {
    // even grid, blank row from bottom odd => invCount even
    let blankRowFromBottom =
      N - Math.floor(arr.indexOf(0) / N); // 1-based
    if (blankRowFromBottom % 2 === 1)
      return invCount % 2 === 0;
    return invCount % 2 === 1;
  }
}

// PUBLIC_INTERFACE
function SlidingTilePuzzleGame() {
  // Main state
  const [mode, setMode] = useState("easy");
  const size = BOARD_SIZES[mode];
  const [board, setBoard] = useState(() => shuffleBoard(genSolvedBoard(size), size));
  const [started, setStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [bests, setBests] = useState(() => getBestStats());
  const timerRef = useRef();

  // Reset when mode changes
  useEffect(() => {
    setBoard(shuffleBoard(genSolvedBoard(size), size));
    setMoves(0);
    setElapsed(0);
    setWon(false);
    setStarted(false);
    // clear timer
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode, size]);

  // Timer effect
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => {};
  }, [started, won]);

  // Win effect: check after every board update
  useEffect(() => {
    if (isSolved(board)) {
      if (!won && started) {
        setWon(true);
        if (timerRef.current) clearInterval(timerRef.current);
        // Save bests if beaten
        let best = bests[mode];
        let isBest =
          !best ||
          elapsed < best.time ||
          (elapsed === best.time && moves < best.moves);
        if (isBest) {
          const newBests = {
            ...bests,
            [mode]: { time: elapsed, moves, date: Date.now() },
          };
          setBests(newBests);
          setBestStats(newBests);
        }
      }
    }
  }, [board, won, started, elapsed, moves, bests, mode]);

  // Bests localStorage helpers
  function getBestStats() {
    try {
      const val = window.localStorage.getItem(BESTS_LS_KEY);
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  }
  function setBestStats(newBests) {
    window.localStorage.setItem(BESTS_LS_KEY, JSON.stringify(newBests));
  }

  // PUBLIC_INTERFACE
  function handleTileClick(i, j) {
    if (won) return;
    // Find blank
    let [bi, bj] = findBlank(board);
    // Tile adjacent to blank? (orthogonal)
    const isAdj =
      (i === bi && Math.abs(j - bj) === 1) ||
      (j === bj && Math.abs(i - bi) === 1);
    if (isAdj) {
      // Slide!
      let newBoard = board.map(row => row.slice());
      newBoard[bi][bj] = board[i][j];
      newBoard[i][j] = 0;
      setBoard(newBoard);
      if (!started) setStarted(true);
      setMoves(m => m + 1);
    }
  }

  function findBlank(board) {
    for (let i = 0; i < board.length; ++i)
      for (let j = 0; j < board[i].length; ++j)
        if (board[i][j] === 0) return [i, j];
    return [-1, -1];
  }

  function handleRestart() {
    setBoard(shuffleBoard(genSolvedBoard(size), size));
    setStarted(false);
    setWon(false);
    setMoves(0);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function formatTime(t) {
    let min = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    let sec = (t % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  // Arcade UI styles
  const styles = arcadeStyles(size);

  return (
    <div style={styles.gameOuter}>
      <div style={styles.titleRow}>
        <span style={styles.emoji}>🧩</span>
        <span style={styles.title}>Sliding Tile Puzzle</span>
      </div>
      <div style={styles.modeRow}>
        {Object.keys(BOARD_SIZES).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              ...styles.modeBtn,
              ...(mode === m ? styles.modeBtnActive : {}),
            }}
            disabled={mode === m}
            tabIndex={mode === m ? -1 : 0}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div style={styles.statsRow}>
        <div>
          <span style={styles.statsLabel}>Moves: </span>
          {moves}
        </div>
        <div>
          <span style={styles.statsLabel}>Time: </span>
          {formatTime(elapsed)}
        </div>
        <div>
          <span style={styles.statsLabel}>Best: </span>
          {bests[mode]
            ? `${formatTime(bests[mode].time)} / ${bests[mode].moves} moves`
            : "--"}
        </div>
      </div>

      <div
        style={styles.boardWrap}
        tabIndex={0}
        aria-label={`Sliding puzzle board, mode ${MODE_LABELS[mode]}`}
      >
        <table style={styles.boardTable}>
          <tbody>
            {board.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      ...styles.tile,
                      ...(!cell ? styles.blankTile : {}),
                      // Animate solved
                      ...(won ? styles.wonTile : {}),
                    }}
                    tabIndex={cell ? 0 : -1}
                    aria-label={cell ? `Tile ${cell}` : "Blank"}
                    onClick={() => cell && handleTileClick(i, j)}
                  >
                    {cell ? cell : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.buttonWrap}>
        <button style={styles.actionBtn} onClick={handleRestart}>
          {won ? "Play Again" : "Restart"}
        </button>
      </div>
      {won && (
        <div style={styles.winBanner} role="status">
          <span style={styles.emoji}>🎉</span>
          <div>
            <strong>You solved it!</strong>
          </div>
          <div>
            Time: {formatTime(elapsed)} | Moves: {moves}
          </div>
          {bests[mode] &&
            elapsed === bests[mode].time &&
            moves === bests[mode].moves && (
              <div style={styles.newBest}>✨ New Best! ✨</div>
            )}
        </div>
      )}
      <div style={styles.instructions}>
        <strong>How to Play:</strong> Click a tile adjacent to the blank space to slide it. Solve the puzzle in as few moves and time as you can!
      </div>
    </div>
  );
}

// Arcade styling functions
function arcadeStyles(size) {
  let baseGap = 7;
  let tileSize = size === 3 ? 76 : size === 4 ? 62 : 50;
  let fontSize = size === 3 ? 30 : size === 4 ? 22 : 17;
  return {
    gameOuter: {
      margin: "60px auto 0 auto",
      background:
        "linear-gradient(100deg,#7ef3ff 0,#529bff 70%,#eecbff 100%)",
      maxWidth: 426,
      minWidth: 265,
      borderRadius: 18,
      boxShadow:
        "0 0 24px 0 #19b1ff2f,0 4px 48px 0 #2b196577",
      padding: "22px 18px 26px 18px",
      fontFamily:
        "Orbitron,'Press Start 2P','Arial',sans-serif",
      position: "relative",
    },
    titleRow: {
      display: "flex",
      alignItems: "center",
      fontSize: 33,
      fontWeight: 800,
      textShadow:
        "0 3px 10px #6d8bffa9, 0 1.8px 0 #fff8",
      gap: 15,
      justifyContent: "center",
      color: "#332770",
      marginBottom: 18,
    },
    emoji: {
      fontSize: 32,
      marginRight: 4,
    },
    modeRow: {
      display: "flex",
      gap: 9,
      marginBottom: 12,
      justifyContent: "center",
      fontSize: 15,
    },
    modeBtn: {
      background:
        "linear-gradient(90deg,#abd4f9,#F5E3E6 80%)",
      color: "#284877",
      border: "2.5px solid #4288ed65",
      borderRadius: 30,
      fontWeight: 700,
      boxShadow: "0 2px 7px 0 #57b2ff31",
      padding: "7.5px 20px",
      cursor: "pointer",
      fontFamily: "inherit",
      outline: "none",
      transition: "all 0.14s",
      fontSize: 14.5,
    },
    modeBtnActive: {
      color: "#fff",
      background:
        "linear-gradient(90deg,#3ac8fc,#5471ff 90%)",
      border: "2.5px solid #FFF",
      boxShadow: "0 1.7px 21px 0 #78c9ff2a",
      cursor: "default",
    },
    statsRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 14.3,
      fontWeight: 600,
      margin: "0 0 11px 0",
      letterSpacing: 0.2,
      color: "#2f2349",
      background: "#f2edff69",
      borderRadius: 9,
      padding: "8px 13px 7px 13px",
      boxShadow: "0 2px 7px #deb1fd1a",
      gap: 8,
      minHeight: 37,
    },
    statsLabel: {
      color: "#004b5785",
      fontWeight: 800,
      marginRight: 3,
    },
    boardWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      outline: "none",
      margin: "0 auto 0 auto",
      userSelect: "none",
      background: "#fff9",
      borderRadius: 16,
      padding: `${baseGap + 3}px`,
      boxShadow:
        "0 3.5px 12px #aae3ff42,0 1.7px 8px #c3b2ff18",
      maxWidth: tileSize * size + baseGap * 2.5,
      minWidth: tileSize * size + baseGap * 2.5,
      minHeight: tileSize * size + baseGap * 2.5,
    },
    boardTable: {
      borderCollapse: "separate",
      borderSpacing: baseGap,
      background: "none",
      margin: 0,
      padding: 0,
      outline: "2.8px solid #5179d139",
      borderRadius: 10.9,
      width: "auto",
      minWidth: tileSize * size,
      minHeight: tileSize * size,
    },
    tile: {
      width: tileSize,
      height: tileSize,
      minWidth: tileSize,
      minHeight: tileSize,
      background:
        "linear-gradient(99deg,#fcf3ff 60%,#bdc0ff 100%)",
      border: "2.9px solid #8ad0ff7a",
      borderRadius: 9,
      boxShadow:
        "0 1.5px 6px #649bfa31,0 1.5px 16px #c3b2ff13",
      color: "#23487b",
      fontWeight: 900,
      fontSize,
      cursor: "pointer",
      textAlign: "center",
      verticalAlign: "middle",
      transition: "box-shadow 0.18s, background 0.18s",
      outline: "none",
      userSelect: "none",
      position: "relative",
    },
    blankTile: {
      background: "linear-gradient(99deg,#d9e9ff,#eec6ff 99%)",
      border: "2.9px solid #e3e1fa90",
      color: "transparent",
      cursor: "default",
      boxShadow: "none",
    },
    wonTile: {
      animation: "puzzleWinPulse 1.18s infinite alternate",
    },
    buttonWrap: {
      textAlign: "center",
      margin: "12px 0 2px 0",
    },
    actionBtn: {
      background:
        "linear-gradient(98deg, #FFD600 0%, #FF506D 100%)",
      color: "#50244b",
      fontWeight: 900,
      border: "none",
      borderRadius: 8,
      fontSize: 15.7,
      padding: "9px 29px",
      margin: "0 6px",
      cursor: "pointer",
      boxShadow:
        "0 3px 16px #ff5b7f47,0 2px 5px #ffd60070",
      letterSpacing: "1.1px",
      transition: "box-shadow 0.19s,background 0.18s",
    },
    winBanner: {
      background:
        "linear-gradient(96deg, #adffef 0%, #e4cfff 100%)",
      color: "#1c203f",
      textAlign: "center",
      borderRadius: 13,
      margin: "20px auto 8px auto",
      padding: "21px 8px 12px 8px",
      fontSize: 20,
      fontWeight: 800,
      textShadow:
        "0 2.5px 7px #fad4ff38, 0 1.3px 0 #ffffff70",
      boxShadow:
        "0 7px 44px #9fecff77, 0 2px 10px #fbc4ff40",
      maxWidth: 315,
      animation: "puzzleWinBanner 2.1s 1",
    },
    newBest: {
      color: "#d554ff",
      fontWeight: 900,
      fontSize: 18.5,
      paddingTop: 9,
      textShadow: "0 1.2px 8px #ffc9ff91",
    },
    instructions: {
      fontSize: 14.8,
      margin: "16px 0 0 0",
      color: "#4e2d85ac",
      background: "#f2edff73",
      borderRadius: 8,
      padding: "8px 15px",
      fontFamily: "inherit",
      boxShadow: "0 3px 12px #aae3ff14",
      lineHeight: 1.35,
      textAlign: "center",
      fontWeight: 500,
    },
  };
}

// PUBLIC_INTERFACE
export default SlidingTilePuzzleGame;

/* Arcade win animation keyframes (inject)
   Would normally go in CSS, but included here for self-containment. */
const winKeyframes = `
@keyframes puzzleWinPulse {
  from { box-shadow: 0 0 0 #fff; }
  to   { box-shadow: 0 0 44px 12px #ffbcf488; }
}
@keyframes puzzleWinBanner {
  0% { transform: scale(0.76) translateY(-20px); opacity: 0; }
  90% { transform: scale(1.12) translateY(5px); opacity: 1;}
  100% { transform: scale(1) translateY(0); opacity: 1;}
}
`;
if (typeof document !== "undefined" && !document.getElementById("slidingpuzzle-winkeyframes")) {
  const style = document.createElement("style");
  style.id = "slidingpuzzle-winkeyframes";
  style.innerHTML = winKeyframes;
  document.head.appendChild(style);
}
