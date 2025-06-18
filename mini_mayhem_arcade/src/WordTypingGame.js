import React, { useState, useEffect, useRef } from "react";

/**
 * Word Typing Game - classic arcade or speed typing.
 * User sees a word or phrase, types it, and scores points for speed & accuracy!
 * 
 * Refactored to:
 * - Show a random new sentence for each round.
 * - Display a large visible timer for each round.
 * - Track input and time in real time.
 * - When Enter is pressed or time expires, compute and display accuracy (%), error count, and round duration.
 * - Show animated/arcade feedback for round result.
 * - Automatically begin the next round after a result pause.
 * - Maintain and display overall score/progress.
 * - Arcade UI design: vibrant, readable, with dynamic feedback.
 */

const SENTENCES = [
  "Arcade games rule the world!",
  "Welcome to the typing challenge!",
  "React makes UI fun and fast.",
  "Can you type this sentence perfectly?",
  "Prove your skills in MiniMayhem.",
  "Type quick, type right, win big!",
  "Lightning fingers win arcade glory!",
  "Programming is fun at MiniMayhem.",
  "Type with speed and accuracy!"
];

const ROUND_TIME = 18; // seconds per round
const RESULT_DISPLAY_MS = 1580; // ms to display round result before next round

function randomSentence() {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

const getArcadeFeedback = (accuracy, errorCount, timeTaken) => {
  if (accuracy === 100 && timeTaken < ROUND_TIME / 2)
    return "🌟 PERFECT & LIGHTNING FAST! 🚀";
  if (accuracy === 100)
    return "🌟 PERFECT ROUND! 🎯";
  if (accuracy >= 97 && errorCount < 2)
    return "🔥 Nearly Flawless!";
  if (accuracy >= 92)
    return "🎉 Great job!";
  if (accuracy >= 82)
    return "👍 Good effort!";
  if (accuracy >= 70)
    return "💪 Keep practicing!";
  return "💡 Focus for more accuracy!";
};

function countErrors(target, typed) {
  let error = 0;
  for (let i = 0; i < Math.max(target.length, typed.length); i++) {
    if ((typed[i] || "") !== (target[i] || "")) error++;
  }
  return error;
}

// Simple function for calculating accuracy (as percent, 2 decimals)
function calcAccuracy(target, typed) {
  if (!target.length) return 0;
  const error = countErrors(target, typed);
  const score = Math.max(target.length - error, 0);
  return +(100 * (score / target.length)).toFixed(2);
}

// Small helper for rounding duration display
function displayTime(sec) {
  return `${sec.toFixed(2)}s`;
}

// PUBLIC_INTERFACE
/**
 * WordTypingGame - arcade typing challenge: random per-round sentence, timer, vibrant stats, arcade feedback.
 */
function WordTypingGame() {
  // Game/Round management state
  const [currentSentence, setCurrentSentence] = useState(randomSentence());
  const [userInput, setUserInput] = useState("");
  const [timer, setTimer] = useState(ROUND_TIME);
  const [roundActive, setRoundActive] = useState(true);

  // Results and Arcade Feedback
  const [resultStats, setResultStats] = useState(null); // { accuracy, errorCount, duration, feedback }

  // Score/progress
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  // Timing helpers
  const roundStartTimeRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Start new round
  function startNewRound() {
    setCurrentSentence(randomSentence());
    setUserInput("");
    setTimer(ROUND_TIME);
    setRoundActive(true);
    setResultStats(null);
    roundStartTimeRef.current = Date.now();
    setRounds(r => r + 1);
    if (inputRef.current) inputRef.current.focus();
  }

  // First round on mount
  useEffect(() => {
    roundStartTimeRef.current = Date.now();
    if (inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line
  }, []);

  // Timer effect
  useEffect(() => {
    if (!roundActive) return;
    if (timer <= 0) {
      finishRound();
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line
  }, [timer, roundActive]);

  // When resultStats is set (end of round), trigger next round after short delay
  useEffect(() => {
    if (!resultStats) return;
    const to = setTimeout(() => startNewRound(), RESULT_DISPLAY_MS);
    return () => clearTimeout(to);
    // eslint-disable-next-line
  }, [resultStats]);

  // Core: end/finish round and compute all stats
  function finishRound(forcedInput) {
    if (!roundActive) return;
    setRoundActive(false);
    const timeFinished = Date.now();
    const durationSec = (timeFinished - (roundStartTimeRef.current ?? timeFinished)) / 1000;
    const typed = typeof forcedInput === "string" ? forcedInput : userInput;
    const errorCount = countErrors(currentSentence, typed);
    const accuracy = calcAccuracy(currentSentence, typed);
    const feedback = getArcadeFeedback(accuracy, errorCount, durationSec);

    // Score = base points for good accuracy, and bonus for quick perfect
    let roundScore = 0;
    if (accuracy === 100 && durationSec < ROUND_TIME / 2) roundScore = 18;
    else if (accuracy === 100) roundScore = 15;
    else if (accuracy > 97) roundScore = 12;
    else if (accuracy > 91) roundScore = 9;
    else if (accuracy > 82) roundScore = 5;
    else if (accuracy > 60) roundScore = 2;
    setScore(s => s + roundScore);

    setTotalTyped(t => t + currentSentence.length);
    setTotalErrors(e => e + errorCount);

    setResultStats({
      accuracy,
      errorCount,
      duration: displayTime(durationSec),
      feedback,
      roundScore
    });
  }

  // Handle typing as user changes value
  function handleInput(e) {
    if (!roundActive) return; // Lock when not in round
    setUserInput(e.target.value);
  }

  // Handle possible ENTER key (complete round)
  function handleKeyDown(e) {
    if (!roundActive) return;
    if (e.key === "Enter") {
      finishRound(e.target.value);
      e.preventDefault();
    }
  }

  // UI styles (arcade-style + highlights)
  const boxBg = "linear-gradient(90deg,#172156 10%,#2740A0 100%)";
  const titleStyle = {
    fontSize: 29,
    fontWeight: 900,
    marginBottom: 8,
    color: "#FFD600",
    textShadow: "0 2px 20px #ffc10466"
  };
  const subtitleStyle = {
    fontSize: 19,
    marginBottom: 18,
    marginTop: -8,
    letterSpacing: 0.3,
    lineHeight: 1.35,
    color: "#68e4fb",
    fontWeight: 800,
    textShadow: "0 2px 8px #19e6e9"
  };
  const arcadeSentenceStyle = {
    fontSize: 23,
    background: "linear-gradient(86deg,#fff6bd 0%, #51daff 100%)",
    borderRadius: 9,
    padding: "17px 24px",
    color: "#090f3d",
    fontWeight: 900,
    letterSpacing: 0.65,
    marginBottom: 18,
    marginTop: 3,
    border: "2.5px solid #ffd60055",
    boxShadow: "0 3px 12px #ff0c"
  };

  // Typing input feedback color (arcade style)
  let inputBorder = "#52dbff";
  if (!roundActive && resultStats) {
    inputBorder = resultStats.accuracy === 100 ? "#26fd96" : resultStats.accuracy > 90 ? "#FFD600" : "#f6354d";
  }

  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: 580,
        minHeight: 438,
        background: boxBg,
        borderRadius: 17,
        boxShadow: "0 7px 32px #133fcc77",
        padding: "48px 33px 36px 33px",
        marginTop: 62,
        position: "relative",
        fontFamily: "'Orbitron', 'Press Start 2P', 'Roboto', monospace"
      }}
    >
      <div style={titleStyle}>
        <span role="img" aria-label="keyboard">⌨️</span> Arcade Typing Challenge
      </div>
      <div style={subtitleStyle}>
        Type the sentence exactly—FAST and ACCURATE—before time runs out!
      </div>
      <div style={arcadeSentenceStyle}>
        {currentSentence}
      </div>
      <input
        ref={inputRef}
        type="text"
        disabled={!roundActive}
        value={userInput}
        autoFocus
        maxLength={86}
        placeholder="Type here then press Enter!"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 8,
          padding: 14,
          marginBottom: 13,
          border: `3.1px solid ${inputBorder}`,
          boxShadow: "0 4px 14px #ffa75033,0 1.7px #51eaff33",
          outline: "none",
          fontFamily: "'Roboto Mono', 'Orbitron', 'monospace'",
          background: "#1a228d",
          color: "#FFF",
          letterSpacing: "0.7px",
          transition: "border-color 0.16s"
        }}
        spellCheck={false}
      />

      <div style={{
        fontSize: 19,
        fontWeight: 800,
        marginBottom: 13,
        color: "#FFD600",
        textShadow: "0 1.5px 9px #FFD60066",
        marginTop: 1.5
      }}>
        Timer: <span style={{
          fontWeight: 920,
          fontSize: 32,
          color: timer <= 3.5 ? "#ff5555" : "#FFD600",
          textShadow: timer <= 4 ? "0 0 13px #ff1b1b90" : "0 2px 5px #ffd600bb"
        }}>
          {roundActive ? timer : 0}
        </span> s
      </div>

      {/* Show results after round */}
      {resultStats && (
        <div style={{
          margin: "21px 0 10px 0",
          borderRadius: 14,
          background: "linear-gradient(87deg,#fff755 0%,#51daff 100%)",
          color: "#1C1361",
          boxShadow: "0 6px 28px #f2f78599",
          padding: "19px 16px 11px 16px",
          fontWeight: 900,
          fontSize: 24,
          animation: "pop-bounce .69s cubic-bezier(.7, -0.1, .6, 1.24)"
        }}>
          <div>
            ACCURACY: <b style={{
              color: resultStats.accuracy === 100 ? "#19bf53" : resultStats.accuracy > 95 ? "#229eda" : "#f6354d",
              fontSize: 28
            }}>{resultStats.accuracy}%</b>
          </div>
          <div>
            Errors: <b style={{
              color: resultStats.errorCount > 0 ? "#e24b3c" : "#19bf53",
              fontSize: 26
            }}>{resultStats.errorCount}</b>
          </div>
          <div>
            Time: <b style={{
              color: "#26bcf2",
              fontSize: 23
            }}>{resultStats.duration}</b>
          </div>
          <div style={{
            marginTop: 13,
            fontSize: 24,
            color: "#b302e0",
            textShadow: "0 2px 13px #fff9, 0 1.5px #ff6d0027"
          }}>{resultStats.feedback}</div>
          <div style={{
            fontSize: 17,
            color: "#ef4631",
            fontWeight: 700,
            marginTop: 7,
            letterSpacing: 0.2
          }}>
            +{resultStats.roundScore} pts!
          </div>
        </div>
      )}

      <div style={{
        fontSize: 19,
        color: "#ffeb3b",
        marginBottom: 8,
        marginTop: 14,
        fontWeight: 900
      }}>
        Score: <span style={{
          color: "#fff",
          textShadow: "0 1.5px 12px #ffe505cc"
        }}>{score}</span>
        <span style={{
          color: "#83fbff", marginLeft: 16, fontWeight: 800
        }}>Round: {rounds > 0 ? rounds : 1}</span>
        <span style={{
          color: "#eaffab", marginLeft: 16, fontWeight: 900
        }}>
          Accuracy: {(totalTyped === 0) ? "0%" : `${(100 * (totalTyped - totalErrors)/totalTyped).toFixed(2)}%`}
        </span>
      </div>
      <div style={{
        marginTop: 10,
        fontSize: 15,
        color: "#aad4ff",
        opacity: 0.64,
        textAlign: "center",
        fontWeight: 700,
        textShadow: "0 1.5px 6px #31eaff11"
      }}>
        The more accurate & faster you type, the more points per round!
      </div>
      {/* Arcade bouncing feedback animation keyframes */}
      <style>{`
      @keyframes pop-bounce {
        0% { transform: scale(0.6);}
        60% {transform: scale(1.08);}
        90% {transform: scale(0.97);}
        100% {transform: scale(1);}
      }
      `}</style>
    </div>
  );
}

export default WordTypingGame;
