import React, { useState, useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
/**
 * Word Sprint Challenge Game — Arcade Typing Game
 * - 5 random sentences, 15s per round
 * - Real-time typo highlighting (green: correct, red: error/extra)
 * - Score based on speed, accuracy, streak, and perfect rounds
 * - Animated end screen: score, WPM, accuracy, streak, personal best
 * - Persistent highscores and streak in localStorage
 * - Designed for full arcade experience with consistent UI
 */

// Sample fallback sentences if API fails or no internet.
const LOCAL_SENTENCES = [
  "JavaScript empowers creative arcade games.",
  "The quick brown fox jumps over the lazy dog.",
  "MiniMayhem brings retro fun to your browser.",
  "Type fast, aim for a perfect streak, beat your score!",
  "Arcade high scores persist between your battles.",
  "Accuracy matters as much as lightning speed.",
  "Can you finish a round with zero typos?",
  "Speed, focus, and fun define this challenge.",
  "Welcome to the ultimate Word Sprint Challenge!",
  "Prepare your fingers and conquer the leaderboard.",
];

// Arcade branding colors consistent with main app/style.
const ARCADE_STYLES = {
  background: "linear-gradient(110deg,#120340 2%,#22007a 80%,#4d0b5b 100%)",
  card: {
    background: "rgba(24,32,60,0.89)",
    border: "3.5px solid #FFD600",
    borderRadius: 16,
    boxShadow: "0 2px 36px 0 #590b9545",
    color: "#fff",
    padding: "32px 22px 28px 22px",
    margin: "28px auto 12px auto",
    maxWidth: "500px",
    fontFamily: "'Orbitron', 'Press Start 2P', 'Arial', sans-serif"
  },
  input: {
    fontSize: 19,
    border: "none",
    outline: "none",
    width: "100%",
    background: "rgba(255,255,255,0.09)",
    color: "#ffd600",
    fontFamily: "inherit",
    fontWeight: 600,
    letterSpacing: 0.5,
    borderBottom: "3px solid #FFC107",
    borderRadius: 0,
    padding: "9px 3px",
    margin: "16px 0 3px 0",
    transition: "border 0.17s"
  },
  timer: {
    color: "#e87a41",
    fontWeight: 700,
    fontSize: "1.25rem",
    letterSpacing: 2,
    marginBottom: 8
  },
  btn: {
    outline: "none",
    background: "linear-gradient(98deg, #FFD600 0%, #FF506D 100%)",
    color: "white",
    fontWeight: 900,
    border: "none",
    borderRadius: 8,
    padding: "11px 24px",
    margin: "18px 0 6px 0",
    fontSize: "1.15rem",
    fontFamily: "'Press Start 2P','Orbitron','Arial',sans-serif",
    boxShadow: "0 2px 14px 0 #ff5b7f80",
    cursor: "pointer",
    letterSpacing: "1.1px",
    transition: "transform 0.13s"
  },
  wordBox: {
    fontFamily: "'Fira Mono', 'Consolas', 'monospace'",
    fontSize: "1.32rem",
    minHeight: 36,
    lineHeight: "1.65",
    textShadow: "0 1px 8px #0008"
  },
  correct: { color: '#81ff7c', background: "none" },
  extra: { color: "#ff5050", background: "none" },
  missed: { color: "#f569d7", textDecoration: "underline wavy 2.5px #f569d7" }
};

const HIGHSCORE_KEY = 'WordSprintHighScore';
const HIGHSTREAK_KEY = 'WordSprintBestStreak';

const ROUND_TIME = 15; // seconds
const TOTAL_ROUNDS = 5;

function shufflePool(arr) {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function formatWPM(charsTyped, seconds) {
  // 1 word ~ 5 chars
  const words = charsTyped / 5;
  const minutes = seconds / 60;
  return minutes === 0 ? 0 : Math.round(words / minutes);
}

function calculateAccuracy(typed, target) {
  let correct = 0;
  const minLen = Math.min(typed.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (typed[i] === target[i]) correct++;
  }
  return target.length === 0 ? 0 : Math.max(0, Math.round((correct / target.length) * 100));
}

function loadLocal(key, fallback = 0) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : fallback;
  } catch (e) { return fallback; }
}

function saveLocal(key, value) {
  try { window.localStorage.setItem(key, String(value)); } catch(e) {}
}

function useAnimation(animStyle, trigger) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    const timeout = setTimeout(() => setActive(false), 700);
    return () => clearTimeout(timeout);
  }, [trigger]);
  return active ? animStyle : {};
}

function getApiSentences(count = 5) {
  // Fetch random "quotes" — using Quotable.
  const URL = `https://api.quotable.io/quotes?limit=${count}&minLength=32&maxLength=85`;
  return fetch(URL)
    .then(r => r.json())
    .then(d => (d.results && d.results.length >= count) ?
      d.results.map(q => q.content) : [])
    .catch(() => []);
}

export default function WordTypingGame() {
  // Core game state
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Round state
  const [current, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(ROUND_TIME);
  const [inProgress, setInProgress] = useState(false);

  // Results/score state
  const [roundResults, setRoundResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Score persistence
  const [highScore, setHighScore] = useState(loadLocal(HIGHSCORE_KEY));
  const [bestStreak, setBestStreak] = useState(loadLocal(HIGHSTREAK_KEY));

  const [animateScore, setAnimateScore] = useState(false);
  const [animatePerfect, setAnimatePerfect] = useState(false);

  const inputRef = useRef();
  // Always call custom hook BEFORE ALL RETURNS (per React rules)
  const animStyle = useAnimation(
    { boxShadow: "0 0 20px 6px #81ff7c90, 0 0 8px 3px #FFD600" },
    animatePerfect
  );

  // Initialize sentences when starting
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      let pool = [];
      try {
        pool = await getApiSentences(TOTAL_ROUNDS);
      } catch {}
      if (!pool || pool.length < TOTAL_ROUNDS) {
        // Use local fallback if API fails or insufficient
        pool = shufflePool(LOCAL_SENTENCES).slice(0, TOTAL_ROUNDS);
      }
      if (mounted) {
        setSentences(pool);
        setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Timer/round effect
  useEffect(() => {
    if (!inProgress) return;
    if (timer <= 0) {
      finishRound("timeout");
      return;
    }
    const tid = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(tid);
    // eslint-disable-next-line
  }, [timer, inProgress]);

  // Focus input after round loads
  useEffect(() => {
    if (inProgress && inputRef.current) inputRef.current.focus();
  }, [current, inProgress]);

  const startGame = () => {
    setCurrent(0);
    setUserInput('');
    setRoundResults([]);
    setShowSummary(false);
    setTimer(ROUND_TIME);
    setStreak(0);
    setInProgress(true);
    setAnimateScore(false);
    setAnimatePerfect(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const finishRound = (reason = "manual") => {
    if (!inProgress) return;
    const target = sentences[current] || '';
    // Compute stats
    const numTyped = userInput.length;
    const numCorrect = target.split('').filter((ch, i) => userInput[i] === ch).length;
    const wpm = formatWPM(numTyped, ROUND_TIME - timer);
    const accuracy = calculateAccuracy(userInput, target);
    const perfect = userInput === target;

    let roundScore = 0;
    // Speed scaling factor, base + tiny per-char + accuracy
    roundScore += Math.round(wpm * 1.5);
    roundScore += Math.round(accuracy * 2.1);
    if (perfect && numTyped > 0) {
      roundScore += 50;
      setAnimatePerfect(true);
    }
    // Minor bonus for finishing with time left
    if (reason !== "timeout" && timer) roundScore += timer;

    // Save round result
    const res = {
      typed: userInput,
      target,
      wpm,
      accuracy,
      roundScore,
      perfect,
      secondsUsed: ROUND_TIME - timer,
      timeout: reason === "timeout"
    };
    setRoundResults(prev => ([
      ...prev, res
    ]));

    // Manage streaks
    setStreak(prev => (perfect ? prev + 1 : 0));

    setInProgress(false);

    // Animate end-of-round or score if perfect
    setAnimateScore(true);

    // Play arcade sound: future enhancement (polish only)
    // new Audio('...').play();
  };

  const nextRound = () => {
    // Start next round or finish game
    setUserInput('');
    setTimer(ROUND_TIME);
    setInProgress(true);
    setAnimateScore(false);
    setAnimatePerfect(false);
    setCurrent(prev => prev + 1);
    if (inputRef.current) inputRef.current.value = '';
  };

  const finishGame = () => {
    setShowSummary(true);

    // Save highscores
    const allScores = roundResults.map(r => r.roundScore).reduce((a, b) => a + b, 0);
    if (allScores > highScore) {
      setHighScore(allScores);
      saveLocal(HIGHSCORE_KEY, allScores);
    }
    if (streak > bestStreak) {
      setBestStreak(streak);
      saveLocal(HIGHSTREAK_KEY, streak);
    }
  };

  // Handle input
  const onInput = (e) => {
    let val = e.target.value;
    // Prevent leading/trailing breaks
    val = val.replace(/\r?\n/g, '');
    setUserInput(val);
  };

  // Input submit
  const onEnter = (e) => {
    if (e.key === "Enter") {
      finishRound('manual');
    }
  };

  // Highlight input
  function renderSentence(target, typed) {
    const out = [];
    let lastErrorIdx = -1;
    // Go char by char
    for (let i = 0; i < target.length; i++) {
      let style = ARCADE_STYLES.correct;
      if (!typed) style = {};
      else if (typed[i] == null) {
        // Not typed yet
        style = {};
      } else if (typed[i] === target[i]) {
        style = ARCADE_STYLES.correct;
      } else {
        lastErrorIdx = i;
        style = ARCADE_STYLES.extra;
      }
      out.push(
        <span key={i} style={style}>
          {target[i]}
        </span>
      );
    }
    // Extra "typed" chars after sentence
    if (typed && typed.length > target.length) {
      for (let i = target.length; i < typed.length; i++) {
        out.push(
          <span key={`x${i}`} style={ARCADE_STYLES.extra}>
            {typed[i]}
          </span>
        );
      }
    }
    // Highlight missed chars if time out (in summary only)
    return out;
  }

  // Animated numbers utility
  function AnimatedNumber({ value, duration = 700 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (display === value) return;
      let st = performance.now();
      function animate(now) {
        let progress = Math.min((now - st) / duration, 1);
        setDisplay(Math.round(progress * (value - 0) + 0));
        if (progress < 1) requestAnimationFrame(animate);
      }
      animate(st);
      // eslint-disable-next-line
    }, [value]);
    return <span>{display}</span>;
  }

  // Summary calculations
  const sumScore = roundResults.length
    ? roundResults.map(r => r.roundScore).reduce((a, b) => a + b, 0)
    : 0;
  const totalTyped = roundResults.length
    ? roundResults.map(r => r.typed.length).reduce((a, b) => a + b, 0)
    : 0;
  const totalTarget = roundResults.length
    ? roundResults.map(r => r.target.length).reduce((a, b) => a + b, 0)
    : 0;
  const avgAcc = totalTarget ? Math.round((100 * totalTyped) / totalTarget) : 0;
  const bestStreakThisGame = roundResults.reduce(
    (best, curr, idx, arr) => {
      if (curr.perfect) {
        let s = 1, j = idx - 1;
        // Count sequence
        while (j >= 0 && arr[j].perfect) { s++; j--; }
        return Math.max(best, s);
      }
      return best;
    }, 0
  );
  // UI rendering logic

  // Step 1: Loading
  if (loading) {
    return (
      <div style={{...ARCADE_STYLES.card, background: 'none', textAlign: 'center', boxShadow: 'none'}}>
        <div style={{ fontSize: 26, margin: "64px 0"}}>🕹️ Loading Word Sprint...<br />Please Wait</div>
      </div>
    );
  }

  // Step 2: Game not started — Show intro/arcade branding
  if (!inProgress && roundResults.length === 0 && !showSummary) {
    return (
      <div style={ARCADE_STYLES.card}>
        <div style={{ fontSize: 25, fontWeight: 900, color: "#FFD600", textAlign: "center", letterSpacing: 1.2, textShadow: "0 2px 10px #fff85099" }}>
          🏁 Word Sprint Challenge
        </div>
        <div style={{ marginTop: 7, fontSize: 16, color: "#C8DEFF", textShadow: "0 1px 11px #170538" }}>
          5 rapid-fire typing rounds. Each round: <b>Random sentence</b>, <b>15s</b> on the clock,<br />
          <span style={{ color: "#FF506D" }}>Type with speed <b>and</b> accuracy!</span>
        </div>
        <ul style={{ fontSize: 14, color: "#A2A2FD", padding: 0, margin: "25px 0 27px 0", lineHeight: "2.1" }}>
          <li>Correct letters = <span style={ARCADE_STYLES.correct}>green</span></li>
          <li>Typos or extra = <span style={ARCADE_STYLES.extra}>red</span></li>
          <li>Finish perfect = <b style={{color:"#FFD600"}}>+50 bonus</b></li>
          <li>Break streak on mistakes (perfect run ➡️ bonus!)</li>
        </ul>
        <button
          style={ARCADE_STYLES.btn}
          onClick={startGame}
          aria-label="Start Word Sprint Challenge"
        >Start Game</button>
        <div style={{ marginTop: 14, textAlign: "center", color: "#bfbfff", fontSize: 13 }}>
          Your Best Score: <b style={{ color:"#FFD600", fontSize:15 }}>{highScore}</b> &nbsp;|&nbsp;
          Best Streak: <b style={{ color:"#FF506D", fontSize: 15 }}>{bestStreak}</b>
        </div>
      </div>
    );
  }

  // Step 3: In Progress (show round)
  if (inProgress && current < TOTAL_ROUNDS) {
    const sentence = sentences[current];
    return (
      <div style={ARCADE_STYLES.card}>
        <div style={{
          fontWeight: 900, fontSize: "1.5rem", marginBottom: 8,
          fontFamily: 'inherit', color: "#FFD600", textAlign: "center", letterSpacing: "1.6px"
        }}>
          Round {current + 1} / {TOTAL_ROUNDS}
        </div>
        <div style={ARCADE_STYLES.timer}>
          ⏳ {timer}s left
        </div>
        <div
          style={{
            ...ARCADE_STYLES.wordBox,
            border: "2.5px solid #ffe455",
            borderRadius: "8px",
            padding: "10px 13px",
            marginBottom: 7,
            background: "rgba(0,0,0,0.065)"
          }}
          aria-label="Target sentence to type"
        >{renderSentence(sentence, userInput)}</div>
        <form onSubmit={e => { e.preventDefault(); finishRound('manual'); }}>
          <input
            ref={inputRef}
            style={ARCADE_STYLES.input}
            value={userInput}
            maxLength={sentence.length + 16}
            spellCheck={false}
            autoCorrect="off"
            autoComplete="off"
            onChange={onInput}
            onKeyDown={onEnter}
            aria-label="Type the sentence here"
            placeholder="Type the sentence above here..."
          />
        </form>
        <div style={{ marginBottom: 12, fontSize: 13.2, color: "#FFA726", minHeight: 22 }}>
          {userInput && userInput !== sentences[current] && "Fix typos & press Enter to submit early!"}
          {userInput === sentences[current] && <b style={{ color: "#81ff7c" }}>Perfect! Press Enter to finish early</b>}
        </div>
        <button
          style={ARCADE_STYLES.btn}
          onClick={finishRound}
        >Finish Round</button>
        <div style={{ color: "#9996FF", fontSize: 13, textAlign:"center", marginTop:18 }}>
          <span>Current Streak:&nbsp;<b style={{color:streak >= 1 ? "#FFD600" : "#F569D7"}}>{streak}</b></span>
        </div>
      </div>
    );
  }

  // Step 4: End of round result
  if (!inProgress && roundResults.length > 0 && current < TOTAL_ROUNDS && !showSummary) {
    const last = roundResults[roundResults.length - 1];
    return (
      <div style={ARCADE_STYLES.card}>
        <div style={{
          ...(last.perfect ? animStyle : {}),
          fontWeight: 900,
          fontSize: last.perfect ? "1.5rem" : "1.13rem",
          color: last.perfect ? "#81ff7c" : "#FFD600",
          textAlign: "center",
          marginBottom: 7,
          letterSpacing: 1
        }}>
          {last.perfect ? <>✨ <b>PERFECT ROUND!</b> ✨</> : "Round Complete"}
        </div>
        <div style={{
          margin: "0 0 14px 0",
          textAlign: "center",
          fontFamily: 'inherit',
          color:"#FFE455",
          fontSize: 17
        }}>
          <span style={{marginRight: 16}}>Score: <b><AnimatedNumber value={last.roundScore} /></b></span>
          <span>Accuracy: <b>{last.accuracy}%</b></span><br/>
          <span>WPM: <b>{last.wpm}</b></span>
        </div>
        <div
          style={{
            ...ARCADE_STYLES.wordBox,
            border: "2.5px solid #ffe455",
            borderRadius: "7px",
            padding: "8px 11px",
            background: "rgba(0,0,0,0.09)",
            marginBottom: 8,
            minHeight: 36
          }}
        >{renderSentence(last.target, last.typed)}</div>
        <div style={{marginTop:16, color: "#888cff", fontSize: 15, textAlign: "center"}}>
          Current Streak: <b style={{ color:streak ? "#FFD600":"#F569D7" }}>{streak}</b>
        </div>
        {current < TOTAL_ROUNDS-1 ? (
          <button
            style={ARCADE_STYLES.btn}
            onClick={nextRound}
          >Next Round</button>
        ) : (
          <button
            style={{ ...ARCADE_STYLES.btn, padding: "12px 32px", fontSize: "1.2rem" }}
            onClick={finishGame}
          >Finish Game</button>
        )}
      </div>
    );
  }

  // Step 5: End screen — show summary animation+save
  if (showSummary) {
    return (
      <div style={{...ARCADE_STYLES.card, maxWidth: 540, padding: "36px 26px 34px 26px", textAlign: "center"}}>
        <h2 style={{
          color: "#FFD600", textShadow: "0 1px 14px #FFD60070",
          fontWeight: 900, fontSize: "2.1rem", marginTop: 3
        }}>
          🏆 Sprint Complete!
        </h2>
        <div style={{
          fontSize: "1.3rem", color: "#E87A41", fontWeight: 800,
          letterSpacing: "0.7px", marginBottom: 8
        }}>
          Final Score:&nbsp;<span style={{
            color: "#81ff7c",
            fontSize:"2.03rem",
            textShadow: "0 2px 11px #81ff7c44"
          }}>
            <AnimatedNumber value={sumScore} /></span>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: "#FFC107",
          margin: "20px auto 6px auto"
        }}>
          WPM Avg: <span style={{color:"#B2FF59"}}>{roundResults.reduce((a,c) => a+c.wpm,0)/TOTAL_ROUNDS|0}</span>
          &nbsp; | &nbsp;
          Typed Accuracy: <span style={{ color: "#FFE455" }}>
            {calculateAccuracy(
              roundResults.map(r=>r.typed).join(''),
              roundResults.map(r=>r.target).join('')
            )}%
          </span>
        </div>
        <div style={{
          marginBottom: 15, color: "#A2A2FD", fontSize: 16
        }}>
          Best Streak This Game: <b style={{color:"#FFD600"}}>{bestStreakThisGame}</b>
        </div>
        <div style={{
          border: "2px solid #294bbc",
          borderRadius: 11,
          margin: "16px auto 23px auto",
          maxWidth: 350,
          background: "rgba(56,70,135,0.18)",
          color: "#b8f1fa",
          fontWeight: 700,
          fontSize: 13.6,
          boxShadow: "0 2px 14px 0 #0b2d7940"
        }}>
          <span>🕹️ High&nbsp;Score: <b style={{color:"#FFD600"}}>{highScore}</b></span>
          <span style={{marginLeft:18}}>Best Streak: <b style={{color:"#FF506D"}}>{bestStreak}</b></span>
        </div>
        <div style={{
          maxWidth: 390,
          margin: "22px auto",
          padding: "12px 0 0 0",
          fontSize: 14.5,
          color: "#C8DEFF",
          borderTop: "1.7px dashed #413bb7",
          fontFamily: "inherit"
        }}>
          <ul style={{paddingLeft:21, marginBottom:0,marginTop:0,lineHeight: "2.15"}}>
            <li>Perfect rounds give +50 points and keep streak!</li>
            <li>Streak resets if not perfect. New bests saved for you.</li>
            <li>Play again to beat your <span style={{color:"#FFD600"}}>High Score</span> or <span style={{color:"#FF506D"}}>Streak</span>!</li>
          </ul>
        </div>
        <button
          style={{
            ...ARCADE_STYLES.btn,
            marginTop: 7,
            padding: "13px 33px",
            fontSize:"1.20rem"
          }}
          onClick={startGame}
        >Play Again!</button>
        <div style={{
          fontFamily: "'Orbitron','Press Start 2P','Arial',sans-serif",
          marginTop: 31,
          textAlign:"center",
          color: "#c6e2e9",
          fontSize: 13
        }}>
          <span>— Powered by MiniMayhem Arcade —</span>
        </div>
      </div>
    );
  }

  // Shouldn't reach here, but a fallback.
  return (
    <div style={ARCADE_STYLES.card}>
      <div style={{ fontWeight: 700, fontSize: 18, margin: "50px 0" }}>Something went wrong. Please reload the game!</div>
      <button style={ARCADE_STYLES.btn} onClick={startGame}>Restart</button>
    </div>
  );
}
