import React, { useState, useEffect, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * SudokuGame -- Fully-featured, arcade-style Sudoku mini-game.
 * Supports easy/medium/hard, puzzle generator, pixel font, scoring/statistics, and routing-ready.
 */

const ARCADE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.sudoku-arcade-root {
  font-family: 'Press Start 2P', 'Orbitron', Arial, sans-serif;
  background: linear-gradient(110deg, #130a3c 20%, #00184b 100%);
  color: #FFF;
  border-radius: 18px;
  box-shadow: 0 0 12px #00e6ff90, 0 8px 32px #0009;
  padding: 30px 15px 28px 15px;
  margin: 35px auto 15px auto;
  width: 370px;
  max-width: 98vw;
  user-select: none;
  position: relative;
}
.sudoku-title {
  font-size: 1.3rem;
  text-align: center;
  text-shadow: 0 2px 7px #34ffd691, 0 0 4px #74eaff;
  margin-bottom: 7px;
  letter-spacing: 1.5px;
}
.sudoku-mode-row { display: flex; justify-content: center; gap: 14px; margin-bottom: 18px; }
.sudoku-mode-btn {
  background: linear-gradient(95deg, #ffb430 0%, #ff6b82 100%);
  color: #151515;
  border: none;
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: inherit;
  font-weight: 700;
  padding: 7px 13px 7px 13px;
  margin: 0 2px;
  box-shadow: 0 2px 10px #ffca4f22;
  text-shadow: none;
  filter: brightness(0.98);
  outline: none;
  cursor: pointer;
  letter-spacing: 1.1px;
  transition: background 0.18s, box-shadow 0.16s, color 0.2s, filter 0.15s;
}
.sudoku-mode-btn.selected, .sudoku-mode-btn:active {
  filter: brightness(1.11);
  outline: 2.6px solid #4cfff0e4;
  color: #1d003a;
  box-shadow: 0 0 22px #2bffeab4;
}
.sudoku-board-bg {
  box-shadow: 0 0 6px #fff5, 0 2px 20px #24caf35f;
  margin-bottom: 16px;
  border-radius: 9px;
  background: #141f48;
  border: 3.7px solid #37f7e9c4;
  padding: 10px;
}
.sudoku-board {
  display: grid;
  grid-template-columns: repeat(9, 34px);
  grid-template-rows: repeat(9, 34px);
  gap: 0;
  border-radius: 5px;
  border: 1.7px solid #00ffc53b;
  background: #191c2a;
}
.sudoku-cell {
  width: 34px; height: 34px;
  border: 1.4px solid #3ff7b6bb;
  border-right: none; border-bottom: none;
  box-shadow: 0 0 6px #fff2, 0 1px 4px #27f5ee12;
  display: flex; align-items: center; justify-content: center;
  background: #0e112c;
  font-size: 1.14rem;
  letter-spacing: 0.9px;
  cursor: pointer;
  transition: background 0.16s, color 0.13s;
  position: relative;
}
.sudoku-cell:last-child { border-right: 1.4px solid #3ff7b6bb; }
.sudoku-board .sudoku-cell:nth-child(9n) { border-right: 1.4px solid #3ff7b6bb; }
.sudoku-board .sudoku-cell:nth-child(n+73) { border-bottom: 1.4px solid #3ff7b6bb; }
.sudoku-cell.fixed {
  background: linear-gradient(98deg, #3523b7 60%, #23237b 100%);
  color: #fffc;
  font-weight: 900;
}
.sudoku-cell.selected, .sudoku-cell:focus {
  background: #22ffe988 !important;
  color: #1c0027 !important;
  z-index: 2;
  outline: 2.7px solid #ff36daa8;
}
.sudoku-cell[data-error="true"] {
  background: linear-gradient(110deg, #eb2068 42%, #eaa83b 92%);
  color: #fff !important;
  animation: sudokuErrorPulse 0.55s 1;
}
@keyframes sudokuErrorPulse {
  0% { filter: brightness(1.11); }
  20% { background: #ff5972; }
  70% { box-shadow: 0 0 13px #ff98c620; }
  100% { }
}
.sudoku-board .sudoku-cell[data-related="true"] {
  background: #37ffe963;
  color: #1c003a;
}
.sudoku-controls-bar {
  display: flex; justify-content: center; gap: 11px;
  margin: 0 0 9px 0;
}
.sudoku-action-btn {
  background: linear-gradient(97deg, #2ff3fc 0%, #37e7b3 100%);
  color: #160034;
  border: none;
  border-radius: 7px;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 700;
  padding: 7px 16px;
  margin: 0 1.5px;
  box-shadow: 0 2px 10px #75f7dd51;
  letter-spacing: 1.1px;
  cursor: pointer;
  transition: background 0.18s, color 0.15s;
}
.sudoku-action-btn:active {
  background: #00ffc5cc;
  color: #081127;
}
.sudoku-stats {
  display: flex;
  justify-content: space-between;
  margin: 7px 0 8px 0;
  font-size: 0.86rem;
  font-family: inherit;
  letter-spacing: 0.2px;
  color: #86f6ff;
  text-shadow: 0 0 6px #2effde77;
}
.sudoku-best {
  font-size: 0.8rem;
  color: #ffe062;
  text-shadow: 0 2px 10px #ffeb32a0;
  letter-spacing: 0.11px;
}
.sudoku-complete {
  text-align: center;
  color: #46f7be;
  background: #0b3d24f5;
  border-radius: 9px;
  margin: 11px 0 0 0;
  padding: 8px 11px;
  font-size: 1.06rem;
  box-shadow: 0 2px 12px #38ffd227;
}
.sudoku-numpad {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin-top: 12px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}
.sudoku-numpad-btn {
  width: 29px; height: 29px;
  background: linear-gradient(92deg, #faf88b 0%, #ffe179 100%);
  font-family: inherit;
  font-size: 1.05rem;
  border: none;
  color: #26005a;
  border-radius: 7px;
  box-shadow: 0 2px 9px #fff34f41;
  font-weight: 800;
  margin: 0 1.5px;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: background 0.14s, box-shadow 0.14s;
}
.sudoku-numpad-btn:active, .sudoku-numpad-btn.selected {
  background: #52f5ffbb;
  color: #112131;
}
.sudoku-numpad-btn:disabled { background: #b1b1b1; color: #999; }
@media (max-width: 500px) {
  .sudoku-arcade-root { width: 99vw !important; min-width: 0 !important; padding: 6vw 2vw 8vw 2vw; }
  .sudoku-board { grid-template-columns: repeat(9, 11vw); grid-template-rows: repeat(9, 11vw); }
  .sudoku-numpad-btn { width: 8vw; height: 8vw; font-size: 5.2vw; }
}
::-webkit-input-placeholder { color: #ffe !important; }
:-moz-placeholder { color: #ecc !important; }
::-moz-placeholder { color: #ffe !important; }
:-ms-input-placeholder { color: #ffe !important; }
`;

// ---- Utility Functions for Sudoku ----
// Generate a solved Sudoku
function fillSudoku(board) {
  // Try to fill the board recursively with backtracking
  const findEmpty = () => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!board[r][c]) return [r, c];
    return null;
  };
  const possible = (r, c, val) => {
    for (let i = 0; i < 9; i++)
      if (board[r][i] === val || board[i][c] === val)
        return false;
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++)
        if (board[br + dr][bc + dc] === val)
          return false;
    return true;
  };
  const tryFill = () => {
    const empty = findEmpty();
    if (!empty) return true;
    let [r, c] = empty;
    let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random()-0.5);
    for (let k of nums) {
      if (possible(r,c,k)) {
        board[r][c] = k;
        if (tryFill()) return true;
        board[r][c] = 0;
      }
    }
    return false;
  };
  tryFill();
}

// Remove cells to create puzzle per difficulty (easy: 38-43 clues, med: 31-36, hard: 23-29)
function makePuzzle(difficulty) {
  // Start with a filled solution
  let board = Array.from({length:9},()=>Array(9).fill(0));
  fillSudoku(board);
  // Remove numbers
  let clues;
  if (difficulty === "easy") clues = Math.floor(Math.random()*6)+38;
  if (difficulty === "medium") clues = Math.floor(Math.random()*6)+31;
  if (difficulty === "hard") clues = Math.floor(Math.random()*7)+23;
  let positions = Array.from({length:81}, (_,i)=>i).sort(()=>Math.random()-0.5);
  let puzzle = board.map(row=>row.slice());
  for(let i=0; i<81-clues; i++) {
    let idx = positions[i];
    let r = Math.floor(idx/9), c = idx%9;
    puzzle[r][c] = 0;
  }
  // Return both puzzle and solution
  return {puzzle, solution: board};
}

// Returns true if value at board[row][col] is valid given current nonzero board
function isCellValid(board, row, col, val) {
  if (!val) return true;
  for (let i=0; i<9; i++) {
    if (i!==col && board[row][i] === val) return false;
    if (i!==row && board[i][col] === val) return false;
  }
  let br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
  for (let dr=0; dr<3; dr++)
    for (let dc=0; dc<3; dc++) {
      let nr=br+dr, nc=bc+dc;
      if ((nr!==row||nc!==col) && board[nr][nc] === val) return false;
    }
  return true;
}

// Is the whole board correct? (solved and all valid)
function isBoardComplete(current, solution) {
  for (let r=0; r<9; r++)
    for (let c=0; c<9; c++)
      if (current[r][c] !== solution[r][c] || !isCellValid(current, r, c, current[r][c]))
        return false;
  return true;
}

// Save/load best time/moves to localStorage
function saveBest(mode, time, moves) {
  let bestKey = "sudoku-best-" + mode;
  let prev = JSON.parse(window.localStorage.getItem(bestKey) || "null");
  if(!prev || time < prev.time || (time===prev.time && moves < prev.moves)) {
    window.localStorage.setItem(bestKey, JSON.stringify({ time, moves }));
  }
}
function getBest(mode) {
  let bestKey = "sudoku-best-" + mode;
  let prev = JSON.parse(window.localStorage.getItem(bestKey) || "null");
  return prev;
}

// ---- Main React Component ----
function SudokuGame() {
  // Gameplay state
  const [mode, setMode] = useState("easy");
  const [puzzle, setPuzzle] = useState(null);        // array[9][9]
  const [solution, setSolution] = useState(null);    // array[9][9]
  const [user, setUser] = useState(null);            // array[9][9] (user state)
  const [fixed, setFixed] = useState(null);          // array[9][9]: true for given cells
  const [selected, setSelected] = useState([null, null]);
  const [errors, setErrors] = useState([]);          // [{r, c}]
  const [startTime, setStartTime] = useState(null);
  const [timer, setTimer] = useState(0);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);

  const timerRef = useRef();

  // On mount, and if mode changes, generate new puzzle
  useEffect(() => {
    const startNewPuzzle = () => {
      let { puzzle, solution } = makePuzzle(mode);
      setPuzzle(puzzle);
      setSolution(solution);
      setUser(puzzle.map(row=>row.slice()));
      setFixed(puzzle.map(row=>row.map(val=>!!val)));
      setSelected([null, null]);
      setErrors([]);
      setComplete(false);
      setMoves(0);
      setStartTime(Date.now());
      setTimer(0);
    };
    startNewPuzzle();
  }, [mode]);

  // Timer effect
  useEffect(() => {
    if (complete || !startTime) return;
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 800);
    return () => clearInterval(timerRef.current);
  }, [startTime, complete]);

  // Handle user input to board
  function handleSelectCell(r, c) {
    setSelected([r, c]);
  }
  function handleInput(val) {
    let [r, c] = selected;
    if (r == null || c == null || fixed[r][c] || complete) return;
    let newUser = user.map(row=>row.slice());
    newUser[r][c] = val;
    setUser(newUser);
    setMoves(moves+1);

    // Validate as user types
    let newErrors = [];
    for (let rr=0; rr<9; rr++)
      for (let cc=0; cc<9; cc++)
        if (!isCellValid(newUser, rr, cc, newUser[rr][cc]) && newUser[rr][cc] !== 0)
          newErrors.push(`${rr},${cc}`);
    setErrors(newErrors);

    // Completion check
    if (isBoardComplete(newUser, solution)) {
      setComplete(true);
      saveBest(mode, Math.floor((Date.now() - startTime) / 1000), moves+1);
      setTimeout(() => setSelected([null,null]), 380);
    }
  }
  function handleErase() {
    let [r, c] = selected;
    if (r == null || c == null || fixed[r][c] || complete) return;
    let newUser = user.map(row=>row.slice());
    newUser[r][c] = 0;
    setUser(newUser);

    // auto-validation
    let newErrors = [];
    for (let rr=0; rr<9; rr++)
      for (let cc=0; cc<9; cc++)
        if (!isCellValid(newUser, rr, cc, newUser[rr][cc]) && newUser[rr][cc] !== 0)
          newErrors.push(`${rr},${cc}`);
    setErrors(newErrors);
  }
  function handleNumpad(val) {
    handleInput(val);
  }
  function handleRestart() {
    setUser(puzzle.map(row=>row.slice()));
    setErrors([]);
    setMoves(0);
    setStartTime(Date.now());
    setTimer(0);
    setComplete(false);
    setSelected([null,null]);
  }
  function handleNewPuzzle() {
    let { puzzle, solution } = makePuzzle(mode);
    setPuzzle(puzzle);
    setSolution(solution);
    setUser(puzzle.map(row=>row.slice()));
    setFixed(puzzle.map(row=>row.map(val=>!!val)));
    setSelected([null,null]);
    setErrors([]);
    setMoves(0);
    setStartTime(Date.now());
    setTimer(0);
    setComplete(false);
  }
  // Keyboard input handler
  useEffect(() => {
    const onKeydown = (e) => {
      if (document.activeElement && document.activeElement.tagName === "INPUT")
        return; // Ignore typing in text fields etc
      let [r, c] = selected;
      if (e.key >= "1" && e.key <= "9") {
        if (r!=null && c!=null && !fixed[r][c] && !complete)
          handleInput(Number(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0" || e.key === " ") {
        if (r!=null && c!=null && !fixed[r][c] && !complete)
          handleErase();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        if (r!=null && c!=null) setSelected([r, (c+1)%9]);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        if (r!=null && c!=null) setSelected([r, (c+8)%9]);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        if (r!=null && c!=null) setSelected([(r+1)%9, c]);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        if (r!=null && c!=null) setSelected([(r+8)%9, c]);
      } else if (e.key === "Enter") {
        // Jump to next empty
        for (let ri=0; ri<9; ri++) for (let ci=0; ci<9; ci++) {
          if (user[ri][ci] === 0 && !fixed[ri][ci]) {
            setSelected([ri,ci]);
            return;
          }
        }
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
    // eslint-disable-next-line
  }, [selected, user, fixed, complete]);

  // Prepare best stats
  const best = getBest(mode);
  
  return (
    <div className="sudoku-arcade-root">
      <style>{ARCADE_CSS}</style>
      <div className="sudoku-title">
        <span role="img" aria-label="Sudoku">🟦</span> Sudoku Arcade
      </div>
      <div className="sudoku-mode-row">
        {["easy", "medium", "hard"].map((m) => (
          <button key={m}
            className={"sudoku-mode-btn" + (mode===m ? " selected" : "")}
            onClick={() => setMode(m)}
            tabIndex={0}
            aria-pressed={mode===m}
          >
            {m.charAt(0).toUpperCase()+m.slice(1)}
          </button>
        ))}
      </div>
      <div className="sudoku-controls-bar" aria-label="Sudoku controls">
        <button className="sudoku-action-btn" onClick={handleNewPuzzle} aria-label="New Puzzle">New Puzzle</button>
        <button className="sudoku-action-btn" onClick={handleRestart} aria-label="Restart">Restart</button>
        <button className="sudoku-action-btn" onClick={() => window.history.back()} aria-label="Back">Back</button>
      </div>
      <div className="sudoku-stats">
        <span>Time: {formatTimer(timer)}</span>
        <span>Moves: {moves}</span>
      </div>
      {best && (
        <div className="sudoku-best">
          Best ({mode}): {formatTimer(best.time)} / {best.moves} moves
        </div>
      )}
      <div className="sudoku-board-bg">
        <div className="sudoku-board" role="grid" aria-label="Sudoku board">
          {[...Array(9)].map((_, r) =>
            [...Array(9)].map((_, c) => {
              let val = user ? user[r][c] : 0;
              let isFixed = fixed ? fixed[r][c] : false;
              let isSelected = selected[0]===r && selected[1]===c;
              let isRelated = (selected[0]!==null && (selected[0]===r||selected[1]===c||inSameBlock(selected, [r,c])));
              let isError = errors.includes(`${r},${c}`);
              return (
                <div
                  key={`cell-${r}-${c}`}
                  tabIndex={isFixed ? -1 : 0}
                  aria-selected={isSelected}
                  aria-label={`Cell ${r+1},${c+1}`+(isFixed ? " Fixed" : "")}
                  data-error={isError}
                  data-related={isRelated && !isSelected}
                  className={
                    "sudoku-cell" +
                    (isFixed?" fixed":"") +
                    (isSelected ? " selected" : "")
                  }
                  onClick={() => handleSelectCell(r,c)}
                  onFocus={() => handleSelectCell(r,c)}
                  onKeyDown={undefined}
                >
                  {val!==0 ? val : ""}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="sudoku-numpad" aria-label="Sudoku number entry">
        {[1,2,3,4,5,6,7,8,9].map(n =>
          <button
            key={`npad-${n}`}
            className="sudoku-numpad-btn"
            onClick={() => handleNumpad(n)}
            disabled={complete || !selected || selected[0]==null || fixed && fixed[selected[0]][selected[1]]}
            tabIndex={0}
          >{n}</button>
        )}
        <button
          key="erase"
          className="sudoku-numpad-btn"
          onClick={handleErase}
          disabled={complete || !selected || selected[0]==null || fixed && fixed[selected[0]][selected[1]]}
          tabIndex={0}
        >␡</button>
      </div>
      {complete && (
        <div className="sudoku-complete">
          🎉 Completed!<br />
          Time: {formatTimer(timer)} &nbsp; | &nbsp; Moves: {moves}<br />
          {best && timer <= best.time && moves <= best.moves && <span>🏆 New Best!</span>}
        </div>
      )}
      <div style={{fontSize:'.77rem',textAlign:"center",color:"#1ffdcc66",marginTop:"13px"}} aria-label="Instructions">
        <strong>How to Play:</strong>&nbsp;
        Fill rows, columns, and blocks with 1-9, no repeats!<br />
        Use number keys or numpad for fast entry.<br/>
        <span style={{color:"#ffdb6c"}}>Highlight: </span>
        Errors = red, Selected = cyan, Related = green.<br/>
        Your stats save automatically.
      </div>
    </div>
  );
}

// Format timer as MM:SS
function formatTimer(sec) {
  let min = Math.floor(sec/60);
  let s = sec%60;
  return `${min < 10 ? "0":""}${min}:${s<10?"0":""}${s}`;
}
function inSameBlock([r1,c1], [r2,c2]) {
  return Math.floor(r1/3)===Math.floor(r2/3) && Math.floor(c1/3)===Math.floor(c2/3);
}

export default SudokuGame;
