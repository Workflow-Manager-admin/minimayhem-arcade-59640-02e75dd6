import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * ReactionSpeedGame: MiniMayhem Reaction Speed Arcade
 * - Press "Start" to begin. Wait for "GO!" prompt, tap/click as fast as possible.
 * - Tracks your reaction time this round & your best ever.
 * - 5 rounds, get your fastest average.
 * - Neon arcade style, animated, highly tactile.
 * - Scores are persistently saved (localStorage best).
 */

const NUM_ROUNDS = 5;
const ARCADE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Press+Start+2P&family=VT323&display=swap');
.rs-bg-arcade {
  min-height: 100vh; min-width:100vw;
  background: radial-gradient(circle at 46% 23%,#2c005d 0%,#80002e 30%,#43e9ff19 100%,#180021 100%);
  display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
  padding-bottom:17vh; user-select:none;
}
.rs-header {
  margin-top:100px;font-size:2.23rem;
  color:#FFD600;font-family:'Orbitron','Press Start 2P',monospace;
  text-shadow:0 2px 16px #FFD60098,0 3.5px 23px #43E9FFbb;
  letter-spacing:.10em;text-align:center;
  margin-bottom:11px;
}
.rs-instr {
  color:#fffad9;font-size:1.07rem;padding:9px 17px;background:rgba(50,2,100,0.23);
  border-radius:10px;box-shadow:0 1px 10px #FFD60030;
  font-family:'Orbitron',monospace;
  max-width:530px;margin:0 auto 21px auto;text-align:center;
}
.rs-core-area {
  margin:32px 0 0 0;
  min-width:260px;
  display:flex; flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(138deg,#170052 47%,#eda24046 100%);
  border-radius:22px;box-shadow:0 5px 25px #ffd6003d;
  padding:38px 18px 17px 18px;
}
.rs-pulse-anim {
  animation: rsPulse .18s cubic-bezier(.56,1.35,.43,1.05);
}
@keyframes rsPulse {0%{transform:scale(0.7);}85%{transform:scale(1.16);}100%{transform:scale(1);}}
.rs-status {
  color:#FFD600;font-size:1.3rem;font-family:'Press Start 2P',monospace;
  margin-bottom:16px;text-align:center;
  text-shadow:0 2px 10px #FFD60088,0 2px 12px #43E9FFbb;
  min-height:36px;
}
.rs-react-btn {
  background:linear-gradient(94deg,#FFD600 45%,#ff24e5 99%);
  box-shadow:0 1px 15px #43e9ff60,0 1.5px 15px #FFD60042;
  color:#1a095c;font-family:'Press Start 2P',monospace;
  font-size:1.17rem;font-weight:700;letter-spacing:.07em;
  border:none;border-radius:13px;padding:24px 44px;
  outline:none; cursor:pointer; margin:18px 0;font-weight:900;
  transition: background .1s, box-shadow .12s, transform .09s;
}
.rs-react-btn:active,.rs-react-btn:hover {
  background:linear-gradient(92deg,#ff24e5 23%,#FFD600 76%);
  color:#fff;box-shadow:0 0 36px #FFD600a0;transform:scale(1.07);
}
.rs-rounds-row {
  margin:0 auto 14px auto;color:#FFD600;
  background:#2c005d99;font-family:'VT323',monospace;
  font-size:1.11rem;display:flex;gap:15px;align-items:center;justify-content:center;
  border-radius:10px;
  padding:7px 14px 7px 13px;box-shadow:0 2px 12px #FFD60022;
}
.rs-score-sm {
  color:#F9FFAA;font-family:'VT323',monospace;font-size:1.19rem;
  text-shadow:0 2px 7px #ffd600d3;
}
.rs-best-row {
  color:#FFD600; margin-bottom:7px;font-family:'VT323',monospace;
  background:#170052b0;border-radius:9px;padding:4px 13px;
  font-size:1.05rem;text-align:center;
  box-shadow:0 0 7px #ffd60067;
}
.rs-btn-row { margin-top:21px;display:flex;gap:13px;justify-content:center; }
.rs-btn-arcade {
  font-family:'Orbitron',monospace;font-size:1.09rem;background:linear-gradient(94deg,#FFD600,#43E9FF 89%);
  color:#2d005d;font-weight:700;padding:9px 21px;border:none;
  border-radius:10px;box-shadow:0 0 14px #43E9FF66;margin:0 4px;
  cursor:pointer;transition:box-shadow .12s,background .12s,transform .12s;
  letter-spacing:.06em;
}
.rs-btn-arcade:hover,.rs-btn-arcade:focus { background:linear-gradient(86deg,#ff24e5,#FFD600 79%);color:#fff;box-shadow:0 0 17px #FFD600a9; transform:scale(1.06);}
.rs-flash-wait { color:#f87de7;background:rgba(255,255,255,0.1);padding:7px 14px;border-radius:8px;}
.rs-flash-go { color:#05f388;background:rgba(0,255,77,0.08);font-size:1.7em;text-shadow:0 2px 22px #56fff2a1,0 1.5px 15px #FFD600a6;}
.rs-flash-fail { color:#ff184c;background:rgba(255,0,80,0.11); }
.rs-final-row { color:#FFD600;font-size:1.23rem;margin-top:12px;}
.rs-pb-note { color:#fffad9;font-size:.96rem;margin-top:7px;line-height:1.4;}
.rs-footer { background:linear-gradient(89deg,#FFD600 0,#43E9FF 100%);color:#1b0a31;
  margin-top:35px;padding:19px 0 8px 0;border-top:2.2px solid #ffd600;
  text-align:center;font-size:1.08rem;font-family:'VT323',monospace;letter-spacing:.04em;
  box-shadow:0 -3px 17px #ab00fd21;border-radius:9px 9px 0 0;
}
`;

function getPB() {
  let s = window.localStorage.getItem("mma_reactionspeed_pb");
  return typeof s === "string" ? Number(s) : null;
}
function setPB(score) {
  let currentPB = getPB();
  if (currentPB == null || score < currentPB) {
    window.localStorage.setItem("mma_reactionspeed_pb", score.toFixed(2));
  }
}
function savePlayCount() {
  let k = "mma_reactionspeed_plays";
  let n = +(localStorage.getItem(k) || 0);
  localStorage.setItem(k, n + 1);
}

const getRandomDelay = () => 900 + Math.random() * 1700; // ms (0.9s-2.6s)
const pad = n => n < 10 ? "0" + n : n;

const ReactionSpeedGame = () => {
  const [gameState, setGameState] = useState("init"); // init | waiting | ready | tooSoon | result | final
  const [currRound, setCurrRound] = useState(1);
  const [currResult, setCurrResult] = useState(null); // ms
  const [allResults, setAllResults] = useState([]);
  const [bestScore, setBestScore] = useState(getPB());
  const [avgScore, setAvgScore] = useState(null);
  const [waitMsg, setWaitMsg] = useState("Get Ready...");
  const startTime = useRef(null);
  const timerTimeout = useRef(null);
  const waitingDelay = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Arcade start: pulse/vibe
  const pulseArcade = () => {
    try { window.navigator.vibrate?.(46); } catch {}
  };

  // Start or next round
  const startWaiting = useCallback(() => {
    setGameState("waiting");
    setWaitMsg("Wait for it...");
    waitingDelay.current = setTimeout(() => {
      setGameState("ready");
      setWaitMsg("GO!");
      startTime.current = performance.now();
      pulseArcade();
    }, getRandomDelay());
  }, []);

  // On react button
  const handleReact = () => {
    if (gameState === "waiting") {
      setGameState("tooSoon");
      setWaitMsg("Too soon! Try again...");
      clearTimeout(waitingDelay.current);
      pulseArcade();
      setTimeout(() => {
        startWaiting();
      }, 950);
    } else if (gameState === "ready") {
      const now = performance.now();
      const reaction = now - startTime.current;
      setCurrResult(reaction);
      pulseArcade();
      setGameState("result");
      let nextResults = [...allResults, reaction];
      setAllResults(nextResults);

      // Is game complete?
      if (currRound >= NUM_ROUNDS) {
        savePlayCount();
        let avg = (nextResults.reduce((a, b) => a + b, 0)) / NUM_ROUNDS;
        setAvgScore(avg);
        setGameState("final");
        if (bestScore == null || avg < bestScore) {
          setPB(avg);
          setBestScore(avg);
        }
      } else {
        setTimeout(() => {
          setCurrRound(r => r + 1);
          setCurrResult(null);
          startWaiting();
        }, 950);
      }
    }
  };

  // Start / reset button
  const handleStart = () => {
    setGameState("waiting");
    setAllResults([]);
    setCurrRound(1);
    setCurrResult(null);
    setAvgScore(null);
    setWaitMsg("Wait for it...");
    startWaiting();
  };

  // Arcade Best
  const formatScore = t =>
    t == null
      ? "—"
      : `${t < 1000 ? t.toFixed(0) : (t / 1000).toFixed(2)} ms`;

  const formatAvg = t =>
    t == null
      ? "—"
      : t < 1000
        ? `${Math.round(t)} ms`
        : `${(t / 1000).toFixed(3)} sec`;

  // Clean up timers
  React.useEffect(() => {
    return () => {
      clearTimeout(waitingDelay.current);
      clearTimeout(timerTimeout.current);
    };
  }, []);

  // Keyboard support: Space/Enter triggers react/tap
  React.useEffect(() => {
    function handleKey(e) {
      if (
        e.key === " " ||
        e.key === "Enter" ||
        e.code === "Space"
      ) {
        if (
          (gameState === "waiting") ||
          (gameState === "ready")
        ) {
          handleReact();
        } else if (
          (gameState === "init") ||
          (gameState === "final")
        ) {
          handleStart();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [gameState, currRound, allResults]);

  // UI status string
  let statusMsg = "";
  let flashClass = "";
  if (gameState === "init") {
    statusMsg = (
      <span>
        Tap <span className="rs-flash-go">Start</span> when ready.<br />
        Try for your best reaction average over <b>{NUM_ROUNDS}</b>!
      </span>
    );
  } else if (gameState === "waiting") {
    statusMsg = <span className="rs-flash-wait">{waitMsg}</span>;
    flashClass = "rs-pulse-anim";
  } else if (gameState === "ready") {
    statusMsg = <span className="rs-flash-go">{waitMsg}</span>;
    flashClass = "rs-pulse-anim";
  } else if (gameState === "tooSoon") {
    statusMsg = <span className="rs-flash-fail">{waitMsg}</span>;
    flashClass = "rs-pulse-anim";
  } else if (gameState === "result" && currResult != null) {
    statusMsg = (
      <span>
        <span className="rs-flash-go" style={{fontSize:21}}>Your Reaction:</span>
        <br />
        <span className="rs-score-sm">{formatScore(currResult)}</span>
        <br /><span style={{color:"#fff8",fontSize:13}}>Faster next round?</span>
      </span>
    );
    flashClass = "rs-pulse-anim";
  } else if (gameState === "final") {
    statusMsg = (
      <span>
        <span className="rs-flash-go"><b>All done!</b></span>
        <br />Average Reaction: <b className="rs-score-sm">{formatAvg(avgScore)}</b>
        <br /><span style={{fontSize:13,color:"#fffbbd"}}>(Lower = better!)</span>
      </span>
    );
    flashClass = "rs-pulse-anim";
  }

  // Display scores/rounds
  return (
    <div className="rs-bg-arcade" ref={containerRef} tabIndex={-1}>
      <style>{ARCADE_CSS}</style>
      <div className="rs-header" aria-label="Reaction Speed Game">
        <span role="img" aria-label="lightning" style={{fontSize:33}}>⚡</span> Reaction Speed Arcade
      </div>
      <div className="rs-instr">
        Tap or press Space/Enter <b>after</b> "GO!" appears! As soon as you react, your time is recorded.
        <br />Go for your <span style={{color:"#FFD600"}}>quickest</span> and lowest average. Play <b>{NUM_ROUNDS}</b> to get your best!
        <br /><span style={{fontSize:"0.99em",color:"#FFD600cc"}}>Note: Jump-starting before "GO!" resets the round.</span>
      </div>
      <div className="rs-core-area arcade-font" style={{marginTop:8,minWidth:260,maxWidth:370}}>
        <div className="rs-best-row" aria-live="polite">
          🏆 <b>Best Average:</b> <span style={{color:"#FFF600",fontWeight:700}}>{bestScore!=null?formatAvg(bestScore):"—"}</span>
        </div>
        <div className="rs-rounds-row" aria-live="polite">
          <span>Round <b>{pad(currRound)}</b>/{NUM_ROUNDS}</span>
          {allResults.length > 0 && (
            <span>
              Results:{" "}
              {allResults
                .map((r, i) => (
                  <span key={i} style={{ marginLeft: 2 }}>
                    {formatScore(r)}
                  </span>
                ))}
            </span>
          )}
        </div>
        <div className={"rs-status " + (flashClass || "")} tabIndex={0} aria-live="polite">
          {statusMsg}
        </div>
        {gameState === "init" || gameState === "final" ? (
          <button
            className="rs-react-btn"
            aria-label={gameState==="init"?"Start Reaction Speed Game":"Play Again"}
            tabIndex={0}
            onClick={handleStart}
          >
            {gameState === "init" ? "Start" : "Play Again"}
          </button>
        ) : (
          <button
            className="rs-react-btn"
            aria-label={
              gameState==="waiting"
              ? "Click or tap when GO! appears"
              : gameState==="ready"
                ? "Tap now!"
                : "Start"
            }
            tabIndex={0}
            style={{
              background:
                gameState==="waiting"
                  ? "linear-gradient(97deg,#ffd700 50%,#f06edc 100%)"
                  : gameState==="ready"
                  ? "linear-gradient(90deg,#05f388 40%,#ffe757 99%)"
                  : "linear-gradient(94deg,#FFD600,#ff24e5 91%)",
              color: gameState==="ready" ? "#180a31" : undefined,
              fontSize: gameState==="ready" ? "1.22rem":"1.17rem",
              boxShadow: gameState==="ready"? "0 0 23px #6affc287,0 1.5px 15px #FFD60064":""
            }}
            onClick={handleReact}
            disabled={gameState==="result"||gameState==="tooSoon"}
          >
            {gameState==="waiting"
              ? "..."
              : gameState==="ready"
                ? "Tap NOW!"
                : gameState==="tooSoon"
                  ? "Wait for GO!"
                  : gameState==="result"
                    ? "Next"
                    : "Start"}
          </button>
        )}
        {gameState === "final" && (
          <div className="rs-final-row" aria-live="polite">
            {avgScore != null && bestScore != null && avgScore < bestScore && (
              <span>
                <span role="img" aria-label="party popper">🎉</span>
                <span style={{ color: "#FFD600" }}> <b>NEW PERSONAL BEST!</b></span>
                <br />
              </span>
            )}
            <span>
              <b>Your Results:</b> {allResults.map((r, i) => formatScore(r)).join(", ")}
              <br />
              <b>Average:</b> {formatAvg(avgScore)}
            </span>
            <div className="rs-pb-note">
              Highscores are saved per browser. Try again to go even quicker, or challenge a friend!
            </div>
          </div>
        )}
        <div className="rs-btn-row" style={{marginTop:19}}>
          <button
            className="rs-btn-arcade"
            onClick={handleStart}
            aria-label={gameState==="final"?"Restart":"Reset"}
            style={{marginRight:7}}
          >
            {gameState==="final"||gameState==="result" ? "Reset" : "Restart"}
          </button>
          <button
            className="rs-btn-arcade"
            onClick={() => navigate("/games")}
            style={{background:"linear-gradient(93deg,#FFD600,#43E9FF)",color:"#1B0a31"}}
            aria-label="Back to Arcade"
          >
            🏠 Back to Arcade
          </button>
        </div>
      </div>
      <footer className="rs-footer" style={{marginTop:26}}>
        <span>
          &copy; {new Date().getFullYear()} MiniMayhem Reaction Speed |{" "}
          <span style={{ fontWeight: "bold",color:"#FFD600" }}>
            Blink Fast. Crush Your Record. Play Again!
          </span>
        </span>
      </footer>
    </div>
  );
};

export default ReactionSpeedGame;
