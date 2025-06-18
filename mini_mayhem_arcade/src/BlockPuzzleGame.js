import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * BlockPuzzleGame: Arcade-style, MiniMayhem-themed block puzzle game.
 * - Drag blocks onto a 9x9 grid to fill lines and clear for points.
 * - Blocks are randomly generated Tetris-like shapes.
 * - Score increases for lines cleared; game over if no fit possible.
 * - Arcade styling and tactile feel.
 */
const BOARD_SIZE = 9; // 9x9 grid
const CELL_SIZE_PX = 35; // Arcade tile size
const BOARD_PAD = 18;

const COLORS = [
  "#43E9FF", // cyan
  "#FFD600", // yellow
  "#EF47CB", // magenta
  "#38EF7D", // green
  "#FFD600", // yellow (repeat intentionally for vibrance)
  "#FF184C", // red
  "#FF934F", // orange
  "#43EFDD"  // light blue
];

// Shape definitions: each shape is an array of [row, col] offsets from the origin (0,0)
const SHAPES = [
  // 1 block
  [[0,0]],
  // Line of 2
  [[0,0],[1,0]],
  // Line of 3
  [[0,0],[1,0],[2,0]],
  // Line of 4
  [[0,0],[1,0],[2,0],[3,0]],
  // Line of 5
  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  // Square 2x2
  [[0,0],[0,1],[1,0],[1,1]],
  // L-shape
  [[0,0],[1,0],[2,0],[2,1]],
  // T-shape
  [[0,1],[1,0],[1,1],[1,2]],
  // S-shape
  [[0,1],[1,0],[1,1],[2,0]],
  // Reverse L
  [[0,1],[1,1],[2,1],[2,0]],
  // Plus
  [[1,0],[1,1],[1,2],[0,1],[2,1]],
  // Big square 3x3
  [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
];

// Generate a random shape, with color
function randomShape() {
  const i = Math.floor(Math.random() * SHAPES.length);
  return {
    cells: SHAPES[i],
    color: COLORS[i % COLORS.length],
    key: `shape-${i}-${Math.random().toString(36).slice(2, 7)}`
  };
}

function getEmptyBoard() {
  return Array(BOARD_SIZE).fill(0).map(() =>
    Array(BOARD_SIZE).fill(null)
  );
}

// Checks if a shape can fit on the board at any position
function canPlaceAnywhere(board, shape) {
  for (let r = 0; r < BOARD_SIZE; ++r) {
    for (let c = 0; c < BOARD_SIZE; ++c) {
      if (canPlaceShape(board, shape, r, c)) return true;
    }
  }
  return false;
}

// Checks if a specific shape can be placed at (row,col) on the board
function canPlaceShape(board, shape, baseR, baseC) {
  for (const [dr, dc] of shape.cells) {
    const r = baseR + dr, c = baseC + dc;
    if (
      r < 0 || c < 0 || r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c]
    ) return false;
  }
  return true;
}

// Place a shape onto the board, returning a new board state
function placeShape(board, shape, row, col) {
  const newBoard = board.map(row => row.slice());
  shape.cells.forEach(([dr, dc]) => {
    newBoard[row + dr][col + dc] = shape.color;
  });
  return newBoard;
}

// Check and clear all full rows and columns, return { newBoard, cleared }
function clearLines(board) {
  let clearedRows = [];
  let clearedCols = [];

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(cell => cell)) clearedRows.push(r);
  }
  // Check cols
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!board[r][c]) { full = false; break; }
    }
    if (full) clearedCols.push(c);
  }
  // Do clear
  let newBoard = board.map(row => row.slice());
  clearedRows.forEach(r =>
    newBoard[r] = Array(BOARD_SIZE).fill(null)
  );
  clearedCols.forEach(c => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = null;
    }
  });

  const numCleared = clearedRows.length + clearedCols.length;
  return { newBoard, linesCleared: numCleared };
}

// Persist highscore/playcount
function persistScore(score) {
  let hi = Number(window.localStorage.getItem("mma_block-puzzle_highscore")) || 0;
  if (score > hi) window.localStorage.setItem("mma_block-puzzle_highscore", score);
  const plays = Number(window.localStorage.getItem("mma_block-puzzle_plays") || 0) + 1;
  window.localStorage.setItem("mma_block-puzzle_plays", plays);
}

// BlockPiece component - render a draggable shape
function BlockPiece({ shape, onDragStart, dragging, dragId, origin, disabled, onTouchSelect }) {
  // Render as a mini grid
  // Determine grid bounds for shape preview
  const minRow = Math.min(...shape.cells.map(([r]) => r));
  const maxRow = Math.max(...shape.cells.map(([r]) => r));
  const minCol = Math.min(...shape.cells.map(([,c]) => c));
  const maxCol = Math.max(...shape.cells.map(([,c]) => c));
  const gridRows = maxRow - minRow + 1;
  const gridCols = maxCol - minCol + 1;

  return (
    <div
      className={`bp-shape-wrap${disabled?" bp-piece-disabled":""}${dragging?" dragging":""}`}
      draggable={!disabled}
      onDragStart={e => !disabled && onDragStart && onDragStart(e, shape, origin)}
      onTouchEnd={e => !disabled && onTouchSelect && onTouchSelect(shape, origin)}
      aria-label="Block shape"
      style={{
        opacity: dragging ? 0.43 : (disabled ? 0.46 : 1),
        touchAction: "none",
        cursor: (!disabled ? "grab" : "not-allowed"),
        display: "inline-block",
        margin: 7,
        borderRadius: 9,
        background: dragging? "rgba(0,0,0,0.15)":undefined
      }}
      data-dragid={dragId}
      tabIndex={0}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE_PX*0.9}px)`,
          gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE_PX*0.9}px)`,
          background: "rgba(42,10,106,0.35)",
          borderRadius: 8,
          boxShadow: "0 4px 22px #07d7f170,0 1.5px 18px #ffd60050",
          padding: 1,
        }}>
        {Array.from({length: gridRows*gridCols}).map((_, i) => {
          const r = Math.floor(i / gridCols) + minRow;
          const c = i % gridCols + minCol;
          const filled = shape.cells.some(([dr,dc]) => dr===r && dc===c);
          return (
            <div
              key={i}
              style={{
                width: CELL_SIZE_PX*0.85,
                height: CELL_SIZE_PX*0.85,
                margin: 0.8,
                background: filled ? `linear-gradient(130deg,${shape.color},#fff ${dragging?"80%":"40%"})` : "transparent",
                borderRadius: 5,
                boxShadow: filled ? "0 1px 8px #FFD60088":undefined,
                border: filled ? "2px solid #fff9":"2px dashed #14fff854",
                transition: "background .13s,box-shadow .15s,border .15s"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// MAIN GAME COMPONENT
const BlockPuzzleGame = () => {
  const [board, setBoard] = useState(getEmptyBoard());
  const [shapes, setShapes] = useState([randomShape(), randomShape(), randomShape()]);
  const [activeShapeIdx, setActiveShapeIdx] = useState(null); // For drag or tap place
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | over | won
  const [placingShape, setPlacingShape] = useState(null); // shape, during drag/tap
  const [boardHover, setBoardHover] = useState(null); // {row,col} for placement hover
  const boardRef = useRef();
  const navigate = useNavigate();

  // On mount, reset highscore in state
  useEffect(()=>setScore(0),[]);

  // Handle dropping a shape
  const handleDropShape = useCallback((e, row, col) => {
    e.preventDefault();
    if (status !== "playing" || activeShapeIdx == null) return;
    const shape = shapes[activeShapeIdx];
    if (!canPlaceShape(board, shape, row, col)) return;
    let newBoard = placeShape(board, shape, row, col);
    let {newBoard: clearedBoard, linesCleared} = clearLines(newBoard);
    setScore(s=>s + (shape.cells.length * 5) + linesCleared * 30);
    setLines(l=>l+linesCleared);
    setBoard(clearedBoard);
    // Remove used shape
    let nextShapes = shapes.slice();
    nextShapes[activeShapeIdx] = randomShape();
    setShapes(nextShapes);
    setActiveShapeIdx(null);
    setPlacingShape(null);
    setBoardHover(null);
  }, [board, shapes, activeShapeIdx, status]);

  // Keyboard accessibility: Enter on ghost-cell places
  const handleCellKeyDown = (e, row, col) => {
    if (e.key === "Enter" && activeShapeIdx !== null) {
      e.preventDefault();
      handleDropShape(e, row, col);
    }
  };

  // Drag events
  const handleDragStart = (e, shape, index) => {
    setActiveShapeIdx(index);
    setPlacingShape(shape);
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/shape", JSON.stringify(shape));
  };
  // Drag over board
  const handleDragOver = (e, row, col) => {
    if (activeShapeIdx == null) return;
    const shape = shapes[activeShapeIdx];
    setBoardHover({row, col, canPlace: canPlaceShape(board, shape, row, col)});
    e.preventDefault();
  };
  const handleDragLeave = () => setBoardHover(null);

  // Drop
  const handleDrop = (e, row, col) => {
    handleDropShape(e, row, col);
  };

  // Touch/click to select, tap to place for mobile
  const handleTouchSelect = (shape, idx) => {
    if (status !== "playing") return;
    setActiveShapeIdx(idx);
    setPlacingShape(shape);
  };

  const handleCellClick = (row, col) => {
    if (activeShapeIdx == null || status !== "playing") return;
    const shape = shapes[activeShapeIdx];
    if (!canPlaceShape(board, shape, row, col)) return;
    let fakeEvt = { preventDefault() {} };
    handleDropShape(fakeEvt, row, col);
  };

  // After move: Check if any move left, else game over
  useEffect(() => {
    if (status !== "playing") return;
    let movePossible = shapes.some(shape =>
      canPlaceAnywhere(board, shape)
    );
    if (!movePossible) {
      setStatus("over");
      persistScore(score);
    }
  }, [board, shapes, status, score]);

  // New game
  const handleRestart = () => {
    setBoard(getEmptyBoard());
    setShapes([randomShape(), randomShape(), randomShape()]);
    setScore(0);
    setLines(0);
    setStatus("playing");
    setActiveShapeIdx(null);
    setPlacingShape(null);
    setBoardHover(null);
  };

  // Home navigation
  const goToGames = () => navigate("/games");

  // High score fetch
  const hiscore = Number(window.localStorage.getItem("mma_block-puzzle_highscore") || "0");

  // Instructions
  const instructions =
    "Drag a block to the grid or (on mobile) tap a block then tap a board spot. Fill rows or columns to clear them for points! Game ends if no move is possible. Try to beat your high score!";

  // Arcade style for this game only
  const arcadeCss = `
  .bp-main-bg {
    background: radial-gradient(circle at 10% 35%,#3B00A4 0%, #1BC9FF11 40%, #15002e 95%);
    min-height: 100vh;
    overflow-x:hidden;
    display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
  }
  .bp-header {
    color: #ffd600;
    font-family: 'Orbitron','Press Start 2P','Arial',monospace;
    font-size:2.10rem;
    text-shadow:0 2px 14px #ffd60088,0 3.5px 22px #00f7ffbb;
    margin-top:37px;margin-bottom:7px;text-align:center;letter-spacing:.10em;
  }
  .bp-score-row {
    background:rgba(255,255,229,0.12);
    color:#ffd600;
    font-family:'VT323',monospace;
    font-size:1.25rem;
    display:flex;gap:19px;align-items:center;justify-content:center;
    border-radius:10px;
    margin-bottom:9px;
    box-shadow:0 2px 18px #43E9FF33;
    padding:7px 14px 7px 13px;
  }
  .bp-board-area {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    margin:24px 2vw 0 2vw;
    background: linear-gradient(109deg, #2b1573 33%, #02FFED16 99%);
    border-radius: 23px;
    box-shadow: 0 6px 40px #ffd60025, 0 2px 0 #ff43ef64;
    padding:${BOARD_PAD}px;
    position:relative;
    overflow-x:auto;
    border:2.2px solid #FFD60099;
  }
  .bp-board {
    display: grid;
    grid-template-rows: repeat(${BOARD_SIZE}, ${CELL_SIZE_PX}px);
    grid-template-columns: repeat(${BOARD_SIZE}, ${CELL_SIZE_PX}px);
    border-radius:14px;
    background:linear-gradient(130deg,#22206a 78%,#00ffd651 100%);
    box-shadow:0 5px 33px #43E9FF22, 0 1px 9px #FFD60048;
    position:relative;
    margin-bottom:10px;
  }
  .bp-cell {
    width: ${CELL_SIZE_PX}px;
    height: ${CELL_SIZE_PX}px;
    box-sizing: border-box;
    border: 1.75px solid #412066;
    border-radius:7px;
    background: rgba(16,14,66,0.32);
    transition: background .12s,border .13s;
    position:relative;
    overflow:hidden;
  }
  .bp-cell-filled {
    background:repeating-linear-gradient(77deg,var(--blockcol),#fff8997a 83%);
    border:2.1px solid #FFD600EE;
    box-shadow:0 2px 14px #ffd60057,0 0.5px 9px #43e9ff82;
    z-index:2;
  }
  .bp-cell-hover {
    border: 2.2px dashed #43E9FF !important;
    background: rgba(67,233,255,0.25)!important;
    z-index:3;
  }
  .bp-cell-cannot {
    filter:blur(1.7px) brightness(0.84);
    opacity:.67;
  }
  .bp-pieces-area {
    display:flex;gap:18px;align-items:center;justify-content:center;
    margin:29px 0 0 0;
    padding-bottom:5px;
  }
  .bp-shape-wrap {
    min-width:${CELL_SIZE_PX*2.5}px; min-height:${CELL_SIZE_PX*2.5}px;
    display:inline-block;
    border:2px solid #FFD60055;
    background:linear-gradient(143deg,#03fffb24 60%,#3d276f 70%);
    box-shadow:0 1px 12px #ffd60037;
    margin:0 8px;padding:5px 2px;
    border-radius:13px;
    cursor:grab;
    transition:box-shadow .13s,background .13s,border .13s;
  }
  .bp-piece-disabled {
    filter:blur(1.25px) grayscale(0.92);
    background:#25155738;
    opacity:0.43;
    pointer-events:none;
    cursor:not-allowed;
    user-select:none;
  }
  .dragging {
    opacity:0.3 !important;
    background:#FFD60033 !important;
  }
  .bp-status-row {
    margin-top:18px;margin-bottom:4px;color:#fff;font-size:1.14rem;font-family:'Orbitron',monospace;
    text-shadow:0 1px 9px #43E9FF88,0 3px 13px #ffd60099;
  }
  .bp-btn-row {margin-top:18px;display:flex;gap:16px;justify-content:center;}
  .bp-btn-game {
    font-family:'Orbitron',monospace;font-size:1.11rem;background:linear-gradient(94deg,#ff24e5,#FFD600 80%);
    color:#2d005d;font-weight:700;padding:9px 24px;border:none;border-radius:8px;box-shadow:0 0 17px #43E9FF66;
    margin:0 6px;cursor:pointer;transition:box-shadow .12s,background .15s,transform .11s;
    letter-spacing:0.10em;
  }
  .bp-btn-game:hover, .bp-btn-game:focus {
    background:linear-gradient(88deg,#FFD600 50%,#43E9FF 99%);
    color:#240641;
    box-shadow:0 0 28px #FFD600a9;
    transform:scale(1.06);
  }
  .bp-inst-box {
    font-size:1.01rem;color:#ffd600cf;padding:9px 12px;margin:11px 0 15px 0;border-radius:9px;
    background:rgba(38,49,99,0.29);text-align:center;max-width:550px;box-shadow:0 1px 10px #ffd60030;
    font-family:'Orbitron',monospace;
  }
  .bp-hiscore-row {
    margin-bottom:6px;color:#FFD600;background:#3d276f99;padding:5px 13px;border-radius:9px;font-size:.98rem;
    font-family:'VT323',monospace;
  }
  .bp-footer-back {
    background:linear-gradient(90deg,#5118ea 0,#FFD600 100%);
    color:#fff;padding:19px 0 9px 0;border-top:2.3px solid #ffd600;
    margin-top:25px;text-align:center;font-size:1.09rem;font-family:'VT323',monospace;letter-spacing:.04em;
    box-shadow:0 -3px 25px #ab00fd22;
    border-radius:7px 7px 0 0;
  }
  `;

  return (
    <div className="bp-main-bg" tabIndex={-1}>
      <style>{arcadeCss}</style>
      <div className="bp-header">🧩 Block Puzzle Arcade</div>
      <div className="bp-hiscore-row" aria-live="polite">🥇 High Score: <b>{hiscore}</b></div>
      <div className="bp-score-row" aria-live="polite">
        <span>🧱 Blocks Placed: <b>{score}</b></span>
        <span>🔥 Lines Cleared: <b>{lines}</b></span>
      </div>
      <div className="bp-inst-box">{instructions}</div>
      <div className="bp-board-area">
        <div
          className="bp-board"
          ref={boardRef}
          tabIndex={0}
          style={{
            userSelect:"none",
            // Allow board area to scroll horizontally on mobile if needed
            overflowX:'auto'
          }}
        >
          {Array.from({length:BOARD_SIZE*BOARD_SIZE}).map((_, idx) => {
            const row = Math.floor(idx/BOARD_SIZE);
            const col = idx%BOARD_SIZE;
            const filled = board[row][col];
            let cellClass="bp-cell";
            let cellStyle={};
            // Highlight hover preview for valid drop location
            if (placingShape && activeShapeIdx !== null && status === "playing") {
              if (
                boardHover &&
                boardHover.row===row &&
                boardHover.col===col &&
                boardHover.canPlace
              ) {
                for (const [dr,dc] of placingShape.cells) {
                  if (row-dr >=0 && col-dc >=0 && canPlaceShape(board, placingShape, row-dr, col-dc)) {
                    for (const [ddr, ddc] of placingShape.cells) {
                      if (row-dr+ddr===row && col-dc+ddc===col) {
                        cellClass += " bp-cell-hover";
                        cellStyle.borderColor = "#43E9FF";
                        break;
                      }
                    }
                  }
                }
              }
            }
            if (filled) {
              cellClass += " bp-cell-filled";
              cellStyle = {...cellStyle, "--blockcol": filled};
            }
            // Disabled fill state if game over
            if (status==="over" && filled) cellClass += " bp-cell-cannot";

            return (
              <div
                key={idx}
                className={cellClass}
                tabIndex={0}
                style={cellStyle}
                onDragOver={e => {
                  e.preventDefault();
                  if (
                    status === "playing" &&
                    activeShapeIdx !== null
                  ) handleDragOver(e, row, col);
                }}
                onDragLeave={handleDragLeave}
                onDrop={e => status==="playing"&&activeShapeIdx!==null&&handleDrop(e, row, col)}
                onClick={() => handleCellClick(row, col)}
                onKeyDown={e => handleCellKeyDown(e, row, col)}
                aria-label={filled ? "Filled" : "Empty"}
              ></div>
            );
          })}
        </div>
      </div>
      <div className="bp-pieces-area" aria-label="Block shapes to place">
        {shapes.map((shape, idx) => (
          <BlockPiece key={shape.key}
            shape={shape}
            onDragStart={(e,s,o) => handleDragStart(e,s,idx)}
            onTouchSelect={(s,o) => handleTouchSelect(s,idx)}
            dragging={activeShapeIdx===idx}
            origin={idx}
            dragId={"bppiece-"+idx}
            disabled={status !== "playing" || !canPlaceAnywhere(board, shape)}
          />
        ))}
      </div>
      <div className="bp-status-row" aria-live="polite">
        {status==="over" && (
          <span>
            <b>Game Over!</b> 🛑 No more moves. <b>Your Score:</b> {score}<br/>
            {score >= hiscore ? "🎉 New high score!" : "Try again to beat your best!"}
          </span>
        )}
        {status==="playing" && (
          <span>
            <span role="img" aria-label="joystick">🕹️</span>
            &nbsp;Keep placing blocks! Clear lines for more points.
          </span>
        )}
      </div>
      <div className="bp-btn-row">
        <button className="bp-btn-game" onClick={handleRestart}>
          {status==="playing" ? "Restart" : "Play Again"}
        </button>
        <button className="bp-btn-game" style={{background:"linear-gradient(93deg,#FFD600,#43E9FF)",color:"#1B0a31"}} onClick={goToGames}>
          🏠 Back to Arcade
        </button>
      </div>
      <footer className="bp-footer-back">
        <span>
          &copy; {new Date().getFullYear()} MiniMayhem Block Puzzle |
          <span style={{fontWeight:'bold',marginLeft:8}}>May the Blocks Fall in Your Favor!</span>
        </span>
      </footer>
    </div>
  );
};

export default BlockPuzzleGame;
