import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * MemoryMatchGame: Arcade-style memory match game for MiniMayhem Arcade.
 * - Difficulty: Selectable easy (4x4), medium (8x8), hard (15x15)
 * - Flip and match cards; track score (matches, tries), and high scores.
 * - Animated arcade styling, sound, instructions, and full keyboard access.
 */
const DIFFICULTIES = {
  easy: { size: 4, label: "Easy (4×4)", pairs: 8 },
  medium: { size: 8, label: "Medium (8×8)", pairs: 32 },
  hard: { size: 15, label: "Hard (15×15)", pairs: 112 } // Actually 225 slots — 112 pairs, 1 solo
};
const EMOJI_POOL =
  "🥨👾🎮🐳💎🎲🦄🎯🚀🍕🦕🍀🧩🐙🌮🧠⚽🦘💡🚦🧃🍩🍉🐢🍔🥕🍦🚓🦋🧸🥇⚡🐸🎵🍭🍿🎃🦁🎈🥁🍟🐼🍋🚲🐤🖖🦂🌻📀🍄🦅🍓🐺🧚‍♂️".split(
    ""
  );

/**
 * Get N shuffled emoji, repeated if necessary.
 */
function getShuffledEmojiPairs(numPairs) {
  let emojiSet = [];
  for (let i = 0; emojiSet.length < numPairs; ++i) {
    emojiSet.push(EMOJI_POOL[i % EMOJI_POOL.length]);
  }
  let cards = [];
  for (let i = 0; i < numPairs; ++i) {
    cards.push({ emoji: emojiSet[i], id: `a-${i}` });
    cards.push({ emoji: emojiSet[i], id: `b-${i}` });
  }
  // Special: If odd grid (hard), add a solo card.
  if (numPairs * 2 < DIFFICULTIES["hard"].size ** 2) {
    cards.push({ emoji: "🎰", id: "solo" });
  }
  // Shuffle Fisher-Yates
  for (let i = cards.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// LocalStorage keys
const HIGHSCORE_KEY = diff => `mma_mm_highscore_${diff}`;
/**
 * Load high score from localStorage (best fewest tries or fastest).
 */
function getHighScore(diffKey) {
  const str = window.localStorage.getItem(HIGHSCORE_KEY(diffKey));
  // {tries: N, time: X}
  if (str) {
    try {
      const obj = JSON.parse(str);
      return obj && typeof obj === "object" ? obj : null;
    } catch {
      return null;
    }
  }
  return null;
}
function setHighScore(diffKey, val) {
  window.localStorage.setItem(HIGHSCORE_KEY(diffKey), JSON.stringify(val));
}

/**
 * Main Memory Match Game component.
 */
const MemoryMatchGame = () => {
  const [difficulty, setDifficulty] = useState(null); // "easy", "medium", "hard"
  const [cards, setCards] = useState([]); // arr of {emoji, id}
  const [flipped, setFlipped] = useState([]); // idx of cards currently up
  const [matched, setMatched] = useState([]); // idx of completed pairs
  const [tries, setTries] = useState(0);
  const [startTS, setStartTS] = useState(null); // ms timestamp
  const [endTS, setEndTS] = useState(null); // ms timestamp (game over)
  const [timer, setTimer] = useState(0); // seconds since start
  const [disabled, setDisabled] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  // Arcade-only CSS and pixel font
  const arcadeCss = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    .mm-arcade-bg {
      background: radial-gradient(circle at 18% 32%,#15002e 0%,#320082 30%,#1bc9ff1b 80%,#181221 100%);
      min-height: 100vh; min-width:100vw; box-shadow:0 0 70px #FFD60009 inset;
      padding-bottom:18vh;
      display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
    }
    .mm-header {
      font-size:2.2rem; color:#FFD600;font-family:'Press Start 2P','Orbitron',monospace;
      margin-top:88px;margin-bottom:12px;text-shadow:0 1.5px 18px #FFD60076,0 3.5px 21px #43E9FF77;
      text-align:center;letter-spacing:.10em;
    }
    .mm-diff-row {
      display:flex;gap:18px;justify-content:center;align-items:center;margin-bottom:24px;
    }
    .mm-diff-btn {
      font-family:'Press Start 2P',monospace;font-size:1.06rem;background:linear-gradient(89deg,#FFD600 60%,#ff17e3 100%);
      color:#2a0050;padding:11px 24px;border:none;border-radius:8px;box-shadow:0 2px 14px #ffd60060;
      font-weight:900;letter-spacing:.05em;cursor:pointer;
      outline:none;transition:background 0.12s,box-shadow 0.16s,transform 0.12s;
      border:2.3px solid #e7e1ff43;
    }
    .mm-diff-btn.selected, .mm-diff-btn:focus, .mm-diff-btn:hover {
      background:linear-gradient(89deg,#ff17e3,#FFD600 89%); color:#fff;
      box-shadow:0 0 21px #FFD600a9;transform:scale(1.06) rotate(-2deg);
    }
    .mm-board-wrap {
      display:flex;align-items:center;justify-content:center;margin-top:13px;
      padding:18px 0 7px 0;
      background:rgba(39,35,88,0.22);
      border-radius:23px;box-shadow:0 6px 40px #FFD60025, 0 2px 0 #ff43ef64;
    }
    .mm-board {
      display:grid;
      gap:0.8vw;
      background:rgba(16,15,56,0.21);border-radius:14px;
      box-shadow:0 4px 18px #FFD60025;
      justify-content:center;
      align-items:center;
      margin:0 auto;
    }
    .mm-card {
      aspect-ratio:1/1;
      background:linear-gradient(129deg,#330b6a 50%,#ffd60022 100%);
      border-radius:11px;
      box-shadow:0 3px 20px #FFD60040,0 1.2px 10px #ff24e566;
      font-family:'Press Start 2P',monospace;
      font-size:clamp(1.1rem,2vw,2.4rem);
      color:#FFD600;
      cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      user-select:none;position:relative;outline:none;
      border:2.2px solid #FFD60009;
      transition:box-shadow 0.14s,background .12s,transform .11s;
      will-change:transform;
      min-width:32px;min-height:32px;
    }
    .mm-card.flipped,.mm-card.matched {
      background:linear-gradient(118deg,#FFD600 63%,#43E9FF 100%);
      color:#0e0050;box-shadow:0 5px 22px #FFD60099,0 3px 12px #43E9FF55;
      font-weight:700;font-size:clamp(1.5rem,2.6vw,2.7rem);
      border-color:#FFD60055;
      z-index:4;
    }
    .mm-card.flipped { animation: mmflip .19s cubic-bezier(.26,1.51,.63,1.09);}
    @keyframes mmflip {0%{transform:scaleY(0.25);}60%{transform:scaleY(1.12);}100%{transform:scaleY(1);}}
    .mm-card.matched, .mm-card.solo-matched {
      pointer-events:none;
      background:linear-gradient(102deg,#43E9FF 54%,#FFD600 98%);
      color:#fff;text-shadow:0 2px 10px #FFD600a3,0 0 15px #43E9FF77;
      opacity:0.92;
      font-size:clamp(1.5rem,3vw,2.8rem);
    }
    .mm-card.disabled {
      pointer-events:none;opacity:.44;filter:brightness(0.8) grayscale(0.6);
    }
    .mm-score-row {
      margin-top:13px;margin-bottom:1px;color:#FFD600;font-size:1.22rem;font-family:'VT323',monospace;
      background:rgba(17,10,60,0.52);
      border-radius:8px;padding:9px 15px;box-shadow:0 2px 18px #FFD60033;
      display:flex;gap:14px;align-items:center;justify-content:center;
    }
    .mm-hiscore-row {
      margin-bottom:6px;
      color:#FFD600;background:#3d276f99;padding:5px 16px 5px 12px;border-radius:9px;
      font-size:.99rem;font-family:'VT323',monospace;display:flex;gap:14px;align-items:center;
    }
    .mm-btn-row {margin-top:14px;display:flex;gap:14px;justify-content:center;}
    .mm-btn {
      font-family:'VT323','Orbitron',monospace;font-size:1.15rem;
      background:linear-gradient(94deg,#ff24e5,#FFD600 88%);
      color:#2a0050;font-weight:700;padding:10px 22px;
      border:none;border-radius:9px;box-shadow:0 0 17px #FFD60030;
      cursor:pointer;transition:box-shadow .13s,background .13s,transform .13s;letter-spacing:.03em;
      outline:none;
    }
    .mm-btn:focus,.mm-btn:hover {
      background:linear-gradient(87deg,#FFD600,#43E9FF 90%);
      color:#190151;box-shadow:0 0 17px #FFD60099;transform:scale(1.06);
    }
    .mm-inst-btn {
      font-size:.98rem;
      padding:7px 18px;background:linear-gradient(99deg,#ab2bff,#FFD600 80%);
      color:#FFD600;
      border-radius:18px;border:none;font-family:'Orbitron';margin-bottom:7px;letter-spacing:.04em;cursor:pointer;
      transition:background .19s,transform .15s;
    }
    .mm-inst-btn:focus,.mm-inst-btn:hover {
      background:linear-gradient(91deg,#FFD600 70%,#43E9FF 100%);
      color:#26009d;
      transform:scale(1.07);
    }
    .mm-inst-box {
      color:#FFD600;font-size:1.11rem;padding:8px 14px;margin:11px 0 11px 0;border-radius:9px;
      background:rgba(38,49,99,0.34);text-align:center;max-width:520px;box-shadow:0 1px 10px #FFD60033;
      font-family:'Orbitron',monospace;
    }
    .mm-footer {
      background:linear-gradient(92deg,#5118ea 0,#FFD600 98%);
      color:#fff;margin-top:40px;padding:19px 0 11px 0;border-top:3.1px solid #ffd600;
      text-align:center;font-size:1.08rem;font-family:'VT323',monospace;letter-spacing:.04em;
      box-shadow:0 -3px 22px #ab00fd12;border-radius:7px 7px 0 0;
    }
    @media(max-width:700px){
      .mm-header{font-size:1.24rem;}
      .mm-board{gap:5px;}
      .mm-board-wrap{padding:10px;}
    }
    @media (max-width:520px){
      .mm-board{gap:3vw;}
      .mm-board-wrap{padding:3vw;}
    }
  `;

  // Set up the board according to mode
  const resetGame = useCallback(
    diff => {
      const diffKey = diff || difficulty;
      if (!diffKey) return;
      const { size, pairs } = DIFFICULTIES[diffKey];
      setCards(getShuffledEmojiPairs(pairs).slice(0, size * size));
      setFlipped([]);
      setMatched([]);
      setTries(0);
      setGameOver(false);
      setDisabled(false);
      setStartTS(Date.now());
      setEndTS(null);
      setTimer(0);
    },
    [difficulty]
  );

  // Flip logic: Only allow flipping 2 at a time & not if disabled/matched
  function handleCardClick(idx) {
    if (disabled || flipped.length === 2 || matched.includes(idx)) return;
    if (flipped.includes(idx)) return; // Already up
    const nFlipped = [...flipped, idx];
    setFlipped(nFlipped);
  }

  // Core matching logic: check after 2 flipped
  useEffect(() => {
    if (flipped.length === 2) {
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
        const [a, b] = flipped;
        if (
          cards[a] &&
          cards[b] &&
          cards[a].emoji === cards[b].emoji &&
          cards[a].id !== cards[b].id
        ) {
          setMatched(m => [...m, a, b]);
        }
        setFlipped([]);
        setTries(t => t + 1);
      }, 750);
    }
  }, [flipped, cards]);

  // Timer (update every second, only while playing)
  useEffect(() => {
    if (!startTS || gameOver) return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTS) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [startTS, gameOver]);

  // Game over detection
  useEffect(() => {
    if (!difficulty) return;
    const { pairs, size } = DIFFICULTIES[difficulty];
    let winCount = pairs * 2;
    if (difficulty === "hard") winCount = size * size - 1; // One solo card
    if (matched.length === winCount) {
      setGameOver(true);
      setEndTS(Date.now());
      // Hi-score logic: best tries (primary), fastest (secondary)
      const hiscore = getHighScore(difficulty);
      const thisScore = { tries: tries, time: (Date.now() - startTS) / 1000 };
      if (
        !hiscore ||
        tries < hiscore.tries ||
        (tries === hiscore.tries && thisScore.time < hiscore.time)
      ) {
        setHighScore(difficulty, thisScore);
      }
    }
  }, [matched, difficulty, tries, startTS]);

  // Difficulty select handler
  function handleModeSelection(diff) {
    setDifficulty(diff);
    resetGame(diff);
  }

  // Restart game in this mode
  function handleRestart() {
    resetGame(difficulty);
  }

  // Return to All Games
  function goToGames() {
    navigate("/games");
  }

  // Keyboard support: flip by Enter/Space
  function handleCardKey(e, idx) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(idx);
    }
  }

  // Hi-Score fetch
  const highScore = useMemo(() => (difficulty ? getHighScore(difficulty) : null), [difficulty, gameOver]);

  // Board layout (dynamic grid)
  const boardSize = difficulty ? DIFFICULTIES[difficulty].size : 0;

  // Memoized rendering of board grid and cards
  const renderBoard = useMemo(() => {
    if (!difficulty) return null;
    // gridTemplate = N x N or fill available
    const gridTemplate = {
      gridTemplateColumns: `repeat(${boardSize}, minmax(34px, 1fr))`,
      gridTemplateRows: `repeat(${boardSize}, minmax(34px, 1fr))`,
      maxWidth: boardSize > 7 ? 630 : boardSize * 82 + 14,
      minWidth: 220,
    };
    return (
      <div className="mm-board" style={gridTemplate} role="grid" aria-label="Memory cards grid">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          const isMatched = matched.includes(idx);
          const isSolo = card.id === "solo";
          return (
            <button
              key={idx}
              className={
                "mm-card" +
                (isFlipped ? " flipped" : "") +
                (isMatched ? (isSolo ? " solo-matched" : " matched") : "") +
                (disabled || isMatched ? " disabled" : "")
              }
              tabIndex={0}
              onClick={() => handleCardClick(idx)}
              onKeyDown={e => handleCardKey(e, idx)}
              aria-label={
                isMatched
                  ? "Matched"
                  : isFlipped
                  ? `Card: ${card.emoji}`
                  : "Face down card"
              }
              style={{
                fontSize:
                  boardSize < 5
                    ? "2.15rem"
                    : boardSize > 10
                    ? "1.02rem"
                    : boardSize > 7
                    ? "1.25rem"
                    : "1.7rem",
                width: `min(66px,8vw)`,
                aspectRatio: "1/1",
                pointerEvents: isMatched ? "none" : "auto",
                animationDelay: gameOver ? "0s" : `${((idx % boardSize) + Math.floor(idx / boardSize)) * 0.0118}s`
              }}
              disabled={disabled || isMatched}
            >
              {isMatched || isFlipped ? card.emoji : "🀫"}
            </button>
          );
        })}
      </div>
    );
  }, [cards, flipped, matched, disabled, boardSize, difficulty, gameOver]);

  // Instructions content
  const instructions = (
    <div className="mm-inst-box">
      Flip over two cards at a time. Find all matching pairs in as few tries and as quickly as possible.<br />
      <b>How to play:</b>
      <ul style={{ textAlign: "left", maxWidth: 460, margin: "10px auto", paddingLeft: 22 }}>
        <li>Click or tap any card to flip it.</li>
        <li>If two cards match, they stay face up as a pair.</li>
        <li>If not, they flip back down.</li>
        <li>For the hardest level, find a solo card for a bonus!</li>
        <li>Your best score (tries &amp; time) is saved locally per mode!</li>
      </ul>
      Keyboard: Use Tab to focus cards, Enter/Space to flip.
    </div>
  );

  return (
    <div className="mm-arcade-bg" tabIndex={-1}>
      <style>{arcadeCss}</style>
      <div className="mm-header" aria-label="Memory Match Game">
        <span role="img" aria-label="cards">🃏</span> Memory Match Arcade
      </div>

      {/* Instructions Button & Modal */}
      <div style={{ textAlign: "center" }}>
        <button className="mm-inst-btn" onClick={() => setShowInstructions(s => !s)}>
          {showInstructions ? "Hide Instructions" : "How to Play?"}
        </button>
        {showInstructions && instructions}
      </div>

      {/* Mode Selection */}
      {!difficulty && (
        <div className="mm-diff-row" role="radiogroup" aria-label="Select difficulty">
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <button
              key={key}
              className="mm-diff-btn"
              onClick={() => handleModeSelection(key)}
              aria-label={d.label}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Game UI */}
      {difficulty && (
        <>
          <div className="mm-hiscore-row" aria-live="polite">
            🏆 High Score:
            <span>Tries: <b>{highScore?.tries ?? "—"}</b></span>
            <span>Time: <b>{highScore?.time ? `${highScore.time.toFixed(1)}s` : "—"}</b></span>
          </div>
          <div className="mm-score-row" aria-live="polite">
            <span>🔢 Tries: <b>{tries}</b></span>
            <span>✨ Pairs Matched: <b>{Math.floor(matched.length / 2)}</b></span>
            <span>⏱️ Time: <b>{timer.toFixed(1)}s</b></span>
          </div>
          <section className="mm-board-wrap">
            {renderBoard}
          </section>

          {/* Status message */}
          <div className="mm-score-row" style={{ marginBottom: 5 }}>
            {gameOver ? (
              <span>
                🎉 <b>Game Over!</b>{" "}
                {matched.length === (DIFFICULTIES[difficulty].pairs * 2) ||
                (difficulty === "hard" && matched.length === boardSize * boardSize - 1)
                  ? "You matched all pairs!" : ""}
                <br />
                <b>Your Score:</b> {tries} tries, {((endTS - startTS) / 1000).toFixed(1)} seconds.<br />
                {highScore &&
                tries <= highScore.tries &&
                ((endTS - startTS) / 1000) <= highScore.time
                  ? "🥇 New Highscore!"
                  : "Try to beat your best!"}
              </span>
            ) : (
              <span>
                {flipped.length === 2
                  ? "Checking..."
                  : matched.length === 0
                  ? "Flip two cards to begin!"
                  : "Keep matching to win!"}
              </span>
            )}
          </div>

          <div className="mm-btn-row">
            <button className="mm-btn" onClick={handleRestart}>
              {gameOver ? "Play Again" : "Restart"}
            </button>
            <button
              className="mm-btn"
              style={{
                background:
                  "linear-gradient(93deg,#FFD600,#43E9FF)",
                color: "#190151"
              }}
              onClick={goToGames}
            >
              🏠 Back to Arcade
            </button>
          </div>
        </>
      )}

      <footer className="mm-footer">
        <span>
          &copy; {new Date().getFullYear()} MiniMayhem Memory Match |{" "}
          <span style={{ fontWeight: "bold" }}>
            Match Fast. Remember Longer. Play Again!
          </span>
        </span>
      </footer>
    </div>
  );
};

export default MemoryMatchGame;
