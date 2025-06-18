import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Arcade-style Word Typing Game.
 * - Type the given sentence as fast & as accurately as possible.
 * - Tracks WPM, errors, accuracy, personal bests (localStorage), and allows multi-round play.
 * - Responsive, vibrant arcade UI with error feedback and a fun end screen.
 * - Play multiple rounds, restart option, and Back to Arcade button.
 */
const SENTENCES = [
  "Arcade champions break their own records.",
  "Quick brown fox jumps over the lazy dog.",
  "Typing fast is fun and useful everywhere.",
  "React makes building UI components simple.",
  "Coding games can boost your programming skill.",
  "The best score always comes with focus.",
  "Type as quickly and as accurately as possible.",
  "Words fly by when you are in the zone.",
  "Unlock your highest WPM in the arcade now!",
  "Beat your best score and become the champion.",
  "Learning to type fast is a superpower.",
  "Every key press brings you closer to victory.",
  "Practice makes perfect in speed typing games.",
  "MiniMayhem Arcade is full of excitement.",
  "Type the displayed sentence as fast as you can.",
  "May the fastest fingers win the game!",
  "Speed and accuracy together make you a winner.",
  "Never let typos slow you down.",
  "Fun increases when you challenge yourself.",
  "Compete with your past self for top marks."
];

function getRandomSentence(prevIdx) {
  let idx = Math.floor(Math.random() * SENTENCES.length);
  // avoid immediate repeat
  if (prevIdx !== undefined && SENTENCES.length > 1 && idx === prevIdx) {
    idx = (idx + 1) % SENTENCES.length;
  }
  return { value: SENTENCES[idx], idx };
}

// LOCALSTORAGE helpers for PBs
function loadPB() {
  try {
    const s = JSON.parse(localStorage.getItem("mma_wordtype_pb_v1") || "{}");
    return {
      bestWpm: s.bestWpm ?? null,
      bestAcc: s.bestAcc ?? null,
      bestErr: s.bestErr ?? null,
      bestScore: s.bestScore ?? null,
      bestTime: s.bestTime ?? null,
      mostRounds: s.mostRounds ?? null,
    };
  } catch {
    return {};
  }
}
function savePB(stats) {
  const pb = loadPB();
  // Higher WPM, higher accuracy, lower errors, fastest, longest streaks
  const bestWpm = !pb.bestWpm || stats.wpm > pb.bestWpm ? stats.wpm : pb.bestWpm;
  const bestAcc = !pb.bestAcc || stats.accuracy > pb.bestAcc ? stats.accuracy : pb.bestAcc;
  const bestErr = pb.bestErr==null || stats.errors < pb.bestErr ? stats.errors : pb.bestErr;
  const bestTime = !pb.bestTime || stats.time < pb.bestTime ? stats.time : pb.bestTime;
  const bestScore = !pb.bestScore || stats.score > pb.bestScore ? stats.score : pb.bestScore;
  const mostRounds = !pb.mostRounds || stats.round > pb.mostRounds ? stats.round : pb.mostRounds;
  localStorage.setItem("mma_wordtype_pb_v1", JSON.stringify({
    bestWpm, bestAcc, bestErr, bestTime, bestScore, mostRounds
  }));
}

// Calculate words-per-minute (WPM), accuracy %, and score
function calcStats(input, target, elapsedMillis) {
  // Remove trailing space for error calculations
  let trimmedInput = input.trimEnd();
  let totalChars = target.length;
  let errors = 0;
  for (let i = 0; i < Math.max(trimmedInput.length, totalChars); ++i) {
    if (trimmedInput[i] !== target[i]) errors++;
  }
  const correctChars = Math.max(0, totalChars - errors);
  const words = target.trim().split(/\s+/).length;
  // WPM = (words / minutes)
  const elapsedMins = elapsedMillis / 60000;
  let wpm = elapsedMins > 0 ? words / elapsedMins : 0;
  let accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
  let score = Math.max(0, Math.round(wpm * (accuracy / 100)));
  return {
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy),
    errors,
    score
  };
}

const ROUNDS_PER_GAME = 5;

// Arcade-style CSS (neon gradients, vibrant feedback)
const ARCADE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@900&family=VT323&display=swap');

.wtg-main-bg {
  background: radial-gradient(circle at 19% 33%, #15002e 0%, #410082 23%, #38ef7d22 42%, #43E9FF 92%, #121218 100%);
  min-height: 100vh;
  width: 100vw;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  user-select: none;
}
.wtg-header {
  color: #38ef7d;
  font-family: 'Orbitron','Press Start 2P', monospace;
  font-size: 2.2rem;
  font-weight: bold;
  margin-top: 92px; margin-bottom: 11px; text-align: center;
  text-shadow: 0 2px 14px #38ef7d99,0 2.5px 20px #ff24e5a1;
  letter-spacing:.10em;
}
.wtg-hiscore-row {
  background: #16134a7c;
  color: #FFD600;
  border-radius: 9px;
  margin-bottom: 7px;
  font-size: 1.04rem;
  font-family: 'VT323',monospace;
  box-shadow: 0 2px 17px #43e9ff3b;
  padding: 6px 14px 6px 13px;
  display: flex; gap: 12px; align-items: center; justify-content: center;
}
.wtg-status-row {
  color: #FFD600;
  font-size: 1.14rem;
  font-family: 'Orbitron',monospace;
  margin-top: 19px; margin-bottom: 7px;
  text-shadow: 0 1px 9px #43E9FF82,0 3px 13px #38ef7ddd;
}
.wtg-round-row {
  background: #2d006975;
  color: #FFD600;
  border-radius: 10px;
  font-family: 'VT323',monospace;
  padding: 7px 17px;
  font-size: 1.06rem;
  margin-bottom: 15px; margin-top: 5px;
  display: flex; gap: 17px; align-items:center; justify-content: center;
}
.wtg-card-box {
  margin: 0 auto 0 auto;
  margin-bottom: 18px;
  max-width: 700px;
  width: 98vw;
  background: linear-gradient(125deg,#2e2462 24%,#38ef7d44 100%);
  border-radius:19px; box-shadow:0 8px 33px #38ef7d44,0 2px 0 #FFD60066;
  border:2.6px solid #43e9ff53;
  padding:35px 18px 28px 18px;
  font-family:'Press Start 2P','VT323',monospace;
  font-size:1.16rem;
  color: #fffed7;
  text-align:center;
  min-height:112px;
  letter-spacing:0.03em;
}
.wtg-sentence {
  font-size:1.32rem;
  color:#38ef7de9;
  background:linear-gradient(93deg,#38ef7dc2 30%,#43e9ff96 100%);
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  text-shadow:0 4px 18px #FFD60071,0 2px 11px #43e9ff54;
  margin-bottom: 23px;
  font-weight:bold;
  font-family:'Orbitron','VT323',monospace;
  letter-spacing:.03em;
  user-select: none;
}
.wtg-inputarea {
  display: flex; flex-direction:column; align-items: center; justify-content: center; width: 100%;
}
.wtg-text-input {
  font-size:1.18rem;
  padding: 11px 12px;
  border-radius: 7px;
  background: linear-gradient(92deg,#00ffd699 0%,#2e2462 82%);
  color:#fff;
  width:80vw;max-width:515px;min-width:164px;
  border:2.2px solid #38ef7dcc;
  outline:none;
  font-family:'VT323','Orbitron',monospace;
  margin-bottom:12px;
  letter-spacing:.03em;
  box-shadow:0 2px 11px #FFD60077;
  transition: border 0.16s, box-shadow .14s;
  line-height:1.45;
}
.wtg-text-input:focus {
  border-color:#FFD600;
  box-shadow:0 2px 22px #FFD60044;
}
.wtg-text-input.error {
  border-color:#ff184c;
  box-shadow:0 1.5px 10px #ff184c77;
  animation: wtgErrShake .12s linear 2;
}
@keyframes wtgErrShake {
  0%{transform:translateX(0);}
  20%{transform:translateX(-8px);}
  60%{transform:translateX(7px);}
  100%{transform:translateX(0);}
}
.wtg-metrics-row {
  margin: 19px auto 7px auto;
  display: flex; flex-wrap: wrap; gap: 32px;
  align-items: center; justify-content: center;
  color: #FFD600;
  background:rgba(31,19,44,0.26);
  padding:10px 17px 7px 17px;
  border-radius:14px;
  font-family:'VT323',monospace;
  font-size: 1.07rem;
  font-weight: bolder;
  box-shadow:0 1px 9px #FFD60044;
}
.wtg-err-count {
  color:#ff184c;font-weight:bold;font-size:1em;
}
.wtg-btn-row {
  display:flex;gap:13px;justify-content:center;align-items:center;
  margin-top: 19px;
}
.wtg-btn {
  font-family:'Orbitron',monospace;font-size:1.09rem;background:linear-gradient(94deg,#38ef7d,#FFD600 89%);
  color:#1c0e23;font-weight:700;padding:10px 22px;border:none;border-radius:10px;box-shadow:0 0 11px #43E9FF44;
  cursor:pointer;transition:box-shadow .12s,background .11s,transform .12s;
  margin:0 4px;letter-spacing:.05em;
  outline:none;
}
.wtg-btn:focus,.wtg-btn:hover {
  background:linear-gradient(93deg,#FFD600,#43E9FF 90%);
  color:#21007c;box-shadow:0 0 23px #FFD600a9;transform:scale(1.06);
}
.wtg-result-card {
  margin-top:29px;
  max-width:740px;
  background:linear-gradient(129deg,#27b57c99 33%,#00ffd655 100%);
  border-radius:21px;box-shadow:0 6px 33px #38ef7d42;
  border:2.8px solid #FFD60059;
  color: #fff;
  font-size:1.18rem;
  padding: 32px 22px 21px 22px;
  text-align:center;letter-spacing:.02em;
  animation: wtgPopIn .42s cubic-bezier(.49,1.26,.61,1.08);
}
@keyframes wtgPopIn {0%{opacity:.4;scale:0.86;}100%{opacity:1;scale:1;}}
.wtg-footer {
  background:linear-gradient(90deg,#43E9FF 0,#FFD600 100%);
  color:#231a32;margin-top:42px;padding:22px 0 12px 0;border-top:2.5px solid #FFD600;
  text-align:center;font-size:1.11rem;font-family:'VT323',monospace;letter-spacing:.04em;
  box-shadow:0 -3px 14px #38ef7d22;border-radius:10px 10px 0 0;
}
`;

const initialState = () => ({
  round: 1,
  input: "",
  startTS: null,
  endTS: null,
  sentence: SENTENCES[0],
  sentenceIdx: 0,
  metrics: {
    wpm: 0,
    accuracy: 100,
    errors: 0,
    score: 0,
    time: 0,
  },
  error: false,
  complete: false
});

function WordTypingGame() {
  const [state, setState] = useState(() => {
    // On first render, set a random sentence
    const { value, idx } = getRandomSentence();
    return { ...initialState(), sentence: value, sentenceIdx: idx };
  });
  const [finished, setFinished] = useState(false); // True after all rounds/game over
  const [results, setResults] = useState([]); // Results per round
  const [PB, setPB] = useState(loadPB());
  const [inputDisabled, setInputDisabled] = useState(false);
  const [focusInput, setFocusInput] = useState(true);
  const navigate = useNavigate();
  const inputRef = useRef();

  // On mount, update PB on storage change
  useEffect(() => {
    const onStorage = () => setPB(loadPB());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Focus input after sentence change or error
  useEffect(() => {
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusInput, state.sentence, finished]);

  // Handle input changes and timing
  function handleInput(e) {
    const input = e.target.value;
    // If starting, set startTS
    let startTS = state.startTS;
    if (!startTS && input.length === 1) {
      startTS = Date.now();
    }
    // live error feedback
    let error = false;
    for (let i = 0; i < input.length; ++i) {
      if (input[i] !== state.sentence[i]) {
        error = true;
        break;
      }
    }
    // If completed
    let complete = false, metrics = state.metrics, endTS = state.endTS;
    if (
      input.length === state.sentence.length &&
      input === state.sentence
    ) {
      endTS = Date.now();
      complete = true;
      metrics = { ...calcStats(input, state.sentence, endTS - startTS) };
    }

    setState(s => ({
      ...s,
      input,
      startTS,
      error: error && !complete,
      metrics,
      endTS,
      complete
    }));
    setFocusInput(true);
  }

  // When finish detected, proceed after short delay
  useEffect(() => {
    if (state.complete && !inputDisabled && !finished) {
      setInputDisabled(true);
      setTimeout(() => {
        setInputDisabled(false);
        setFocusInput(false);
        handleNextRound();
      }, 670); // pause for feedback before new round
    }
    // eslint-disable-next-line
  }, [state.complete]);

  function handleNextRound() {
    setResults((arr) => [
      ...arr,
      {
        ...state.metrics,
        round: state.round,
        seconds: (state.endTS - state.startTS) / 1000,
        sentence: state.sentence
      }
    ]);
    // Advance or complete the game
    if (state.round < ROUNDS_PER_GAME) {
      // New round
      const { value, idx } = getRandomSentence(state.sentenceIdx);
      setState({
        ...initialState(),
        round: state.round + 1,
        sentence: value,
        sentenceIdx: idx,
      });
      setFocusInput(true);
    } else {
      // Game complete
      setFinished(true);
      // Calculate final PB and update
      const summary = summarizeResults([
        ...results,
        {
          ...state.metrics,
          round: state.round,
          seconds: (state.endTS - state.startTS) / 1000,
          sentence: state.sentence,
        }
      ]);
      savePB({
        wpm: summary.avgWpm,
        accuracy: summary.avgAccuracy,
        errors: summary.totalErrors,
        score: summary.totalScore,
        time: summary.totalSecs,
        round: ROUNDS_PER_GAME
      });
      setPB(loadPB());
    }
  }

  // Allow manual restart
  function handleRestart() {
    const { value, idx } = getRandomSentence();
    setState({
      ...initialState(),
      sentence: value,
      sentenceIdx: idx,
    });
    setResults([]);
    setFinished(false);
    setInputDisabled(false);
    setFocusInput(true);
  }

  // Back to arcade
  function goToGames() {
    navigate("/games");
  }

  function summarizeResults(resultsArr) {
    let totalWpm = 0,
      totalAcc = 0,
      totalErrors = 0,
      totalScore = 0,
      totalSecs = 0;
    for (let res of resultsArr) {
      totalWpm += res.wpm ?? 0;
      totalAcc += res.accuracy ?? 0;
      totalErrors += res.errors ?? 0;
      totalScore += res.score ?? 0;
      totalSecs += res.seconds ?? 0;
    }
    const n = resultsArr.length || 1;
    return {
      avgWpm: Math.round(totalWpm / n),
      avgAccuracy: Math.round(totalAcc / n),
      totalErrors,
      totalScore,
      totalSecs: Math.round(totalSecs),
    };
  }

  // Summary stats at game end
  const gameSummary = useMemo(() => {
    if (!finished) return null;
    return summarizeResults(results.concat());
  }, [finished, results]);

  // Hi-score row
  const PBRow = (
    <div className="wtg-hiscore-row" aria-live="polite">
      🏆 PB:
      <span>
        WPM: <b>{PB?.bestWpm ?? "—"}</b>
      </span>
      <span>
        Acc: <b>{PB?.bestAcc ?? "—"}%</b>
      </span>
      <span>
        Errors: <b>{PB?.bestErr ?? "—"}</b>
      </span>
      <span>
        Score: <b>{PB?.bestScore ?? "—"}</b>
      </span>
      <span>
        Time: <b>{PB?.bestTime ?? "—"}s</b>
      </span>
      <span>
        Rounds: <b>{PB?.mostRounds ?? "—"}</b>
      </span>
    </div>
  );

  return (
    <div className="wtg-main-bg" tabIndex={-1}>
      <style>{ARCADE_CSS}</style>
      <div className="wtg-header" aria-label="Word Typing Game">
        <span role="img" aria-label="keyboard" style={{ fontSize: 30 }}>
          ⌨️
        </span>{" "}
        Word Typing Arcade
      </div>
      {PBRow}
      <div className="wtg-round-row" aria-live="polite">
        <span>
          <b>
            Round {finished ? ROUNDS_PER_GAME : state.round}/{ROUNDS_PER_GAME}
          </b>
        </span>
        {finished ? (
          <span>Game over! Final results below.</span>
        ) : (
          <span>
            Type the sentence below as fast and accurately as you can!
          </span>
        )}
      </div>
      {!finished && (
        <main className="wtg-card-box" aria-label="Word Typing Round">
          <div className="wtg-sentence">{state.sentence}</div>
          <div className="wtg-inputarea">
            <input
              aria-label={`Type the sentence: ${state.sentence}`}
              ref={inputRef}
              className={
                "wtg-text-input" +
                (state.error ? " error" : "") +
                (inputDisabled ? " disabled" : "")
              }
              type="text"
              disabled={inputDisabled}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={state.input}
              onChange={handleInput}
              maxLength={state.sentence.length}
              onPaste={e => e.preventDefault()}
              onKeyDown={e => {
                if (e.key === "Enter" && state.complete) {
                  handleNextRound();
                }
              }}
              style={{
                pointerEvents: inputDisabled ? "none" : "auto",
                background: state.complete
                  ? "linear-gradient(94deg,#43e9ff33,#FFD60033)"
                  : undefined,
                fontWeight: state.complete ? "bold" : undefined
              }}
              tabIndex={0}
              autoFocus
            />
            <div className="wtg-metrics-row">
              <span>
                <span role="img" aria-label="speed">
                  🚀
                </span>{" "}
                WPM: <b>{state.metrics.wpm}</b>
              </span>
              <span>
                <span role="img" aria-label="accuracy">
                  🎯
                </span>{" "}
                Acc: <b>{state.metrics.accuracy}%</b>
              </span>
              <span>
                <span role="img" aria-label="typo">
                  ❌
                </span>{" "}
                Errors:{" "}
                <b className="wtg-err-count">{state.metrics.errors}</b>
              </span>
              <span>
                <span role="img" aria-label="score">
                  🏅
                </span>{" "}
                Score: <b>{state.metrics.score}</b>
              </span>
            </div>
            {state.error && !state.complete && (
              <div className="wtg-status-row" style={{ color: "#ff184c" }}>
                Typo detected! Correct highlighted letter(s) before proceeding.
              </div>
            )}
            {state.complete && (
              <div className="wtg-status-row" style={{ color: "#38ef7d" }}>
                ✅ Well done! Press Enter or wait for the next round.
              </div>
            )}
          </div>
        </main>
      )}
      {/* Final Results Summary */}
      {finished && (
        <section className="wtg-result-card" aria-label="Results Summary">
          <div style={{ fontSize: 22, color: "#38ef7d" }}>
            <span role="img" aria-label="trophy">
              🏆
            </span>{" "}
            Game Complete!
          </div>
          <div style={{ marginTop: 13 }}>
            <b>Total Rounds:</b> {ROUNDS_PER_GAME}
            <br />
            <b>Avg WPM:</b>{" "}
            <span style={{ color: "#FFD600" }}>{gameSummary?.avgWpm}</span>
            <br />
            <b>Avg Accuracy:</b>{" "}
            <span style={{ color: "#FFD600" }}>{gameSummary?.avgAccuracy}%</span>
            <br />
            <b>Total Errors:</b>{" "}
            <span style={{ color: "#ff184c" }}>{gameSummary?.totalErrors}</span>
            <br />
            <b>Total Score:</b>{" "}
            <span style={{ color: "#FFD600" }}>{gameSummary?.totalScore}</span>
            <br />
            <b>Total Time:</b>{" "}
            <span style={{ color: "#FFD600" }}>{gameSummary?.totalSecs}s</span>
            <br />
            <br />
            {(PB && (
              <span>
                {gameSummary
                  ? gameSummary.totalScore >= (PB.bestScore || 0)
                    ? "🎉 New High Score! Well done! "
                    : "Try to beat your best! "
                  : ""}
              </span>
            )) || ""}
          </div>
          {results.length ? (
            <div style={{ marginTop: 18, fontSize: "1.05em" }}>
              <details style={{ color: "#fff", cursor: "pointer" }}>
                <summary>View round details</summary>
                <ol>
                  {results.map((r, i) => (
                    <li key={i} style={{ textAlign: "left", marginBottom: 7 }}>
                      <b>Round {r.round}:</b> <span style={{ color: "#38ef7d" }}>{r.sentence}</span>
                      <br />WPM: {r.wpm} | Acc: {r.accuracy}% | Err: {r.errors} | Score: {r.score} | Time: {r.seconds?.toFixed(2)}s
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          ) : null}
        </section>
      )}
      <div className="wtg-btn-row">
        <button className="wtg-btn" onClick={handleRestart}>
          {finished ? "Play Again" : "Restart"}
        </button>
        <button
          className="wtg-btn"
          style={{
            background: "linear-gradient(93deg,#FFD600,#43E9FF)",
            color: "#1B0a31"
          }}
          onClick={goToGames}
        >
          🏠 Back to Arcade
        </button>
      </div>
      <footer className="wtg-footer">
        &copy; {new Date().getFullYear()} MiniMayhem Word Typing |{" "}
        <span style={{ fontWeight: "bold", color: "#FFD600" }}>
          Type On, Level Up, and Have Fun!
        </span>
      </footer>
    </div>
  );
}

export default WordTypingGame;

