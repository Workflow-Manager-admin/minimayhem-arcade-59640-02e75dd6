import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";

/**
 * Arcade font, pixel/neon CSS, injected for arcade style.
 */
const ARCADE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Bangers&family=VT323&display=swap');
.arcade-font { font-family: 'VT323','Bangers','Orbitron',monospace!important; }
.arcade-gradient-txt {
  background: linear-gradient(95deg, #FFD600 0%, #ff24e5 50%, #43E9FF 99%);
  color: transparent;
  -webkit-background-clip: text; background-clip: text;
  text-shadow: 0 2px 13px #5118ea6a,0 0 25px #fff05533;
}
`;

// Enhanced main CSS for gradients, pixel shadows, animations.
const ARCADE_CSS = `
.arcade-landing-bg {
  background: linear-gradient(120deg, #12003A 0%, #5118ea 35%, #FFD600 99%);
  min-height: 100vh;
  overflow-x: hidden;
  transition: background 0.7s;
}
.arcade-navbar-pad { height:64px;}
.animated-welcome-section {
  padding:124px 0 38px 0;
  text-align: center;
  background: linear-gradient(90deg,#5118ea 10%,#FFD600 100%);
  position: relative;
  overflow: hidden;
}
.arcade-logo-pop {
  font-family:'Bangers','Orbitron',cursive;
  font-size:3.2rem;
  color:#FFD600;
  filter:drop-shadow(0 3px 20px #43e9ff80);
  letter-spacing:0.1em;
  user-select:none;
  margin-bottom:0.5rem;
  text-shadow:0 2px 11px #1a003a80,0 0 17px #ffd60080;
}
@media (max-width: 600px) {
  .arcade-logo-pop {font-size:2.1rem;}
  .welcome-main-title {font-size:1.2rem;}
}
.welcome-main-title {
  font-family:'Orbitron','VT323',sans-serif;
  font-size:2rem;
  font-weight:900;
  color:#fff;letter-spacing:0.095em;
  margin:0.4rem 0 0.21rem 0;
  text-shadow:0 2px 8px #ffd60055;
  background: linear-gradient(93deg,#ffd600,#1ecfff 70%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.daily-challenge-box {
  background:linear-gradient(95deg,#3624ab 0,#e900d622 90%);
  border:2px solid #FFD600;
  color:#ffd600;
  margin: 1.45rem auto 1.2rem auto;
  padding:1.2rem 1.5rem;
  border-radius:18px;
  box-shadow:0 3px 23px #5918eaff, 0 2.2px 21px #ffd60044;
  max-width:380px;
  font-family:'VT323','Bangers',monospace;
  font-size:1.2rem;
  display:flex;flex-direction:column;align-items:center;
  position:relative;min-height:60px;
  animation: popIn .7s cubic-bezier(.73,.08,.61,1.19);
}
@keyframes popIn {0%{scale:0.9;opacity:0}100%{scale:1;opacity:1}}
.daily-challenge-label {
  color:#fff9;
  font-size:1.1rem;font-weight:700;
  margin-bottom:0.12rem;
  letter-spacing:0.09em;
}
.arcade-surprise-btn {
  background:linear-gradient(90deg,#FFD600,#43E9FF 100%);
  color:#22007a;
  border: none;
  border-radius: 8px;
  font-family:'Orbitron','Bangers',monospace;
  font-size:1.1rem;
  font-weight:900;
  padding:0.7em 2em;
  margin-top:1rem;
  cursor:pointer;
  box-shadow:0 2px 14px #40ff8250,0 0.5px 18px #ffd60055;
  transition:background 0.2s,box-shadow 0.21s,transform 0.14s;
  letter-spacing:0.17em;
  outline: none;
}
.arcade-surprise-btn:hover,.arcade-surprise-btn:focus{
  background: linear-gradient(98deg,#ff24e5,#FFD600 100%);
  color:#fff;
  box-shadow:0 0 33px #FFD60080,0 6px 21px #43E9FF66;
  transform:scale(1.06) rotate(-1deg);
}
/** Games Grid **/
.games-preview-section {margin:0 auto 31px auto;text-align:center;}
.arcade-games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
  gap: 30px 18px;
  max-width: 900px;
  margin:35px auto 10px auto;
}
@media (max-width:650px){.arcade-games-grid{ gap:16px 6px;}}
.game-card {
  background:linear-gradient(141deg,#272473 40%,#a820c5 100%);
  border:2.7px solid #FFD600c8;
  border-radius:16px;
  box-shadow:0 7px 22px #1a09ab39,0 2px 0 #ff43ef50;
  color: #fff;
  text-align: center;
  padding:27px 13px 16px 13px;
  position:relative;
  transition:transform .14s,box-shadow .21s;
  cursor:pointer;
  font-family:'Orbitron','VT323',monospace;
  overflow:hidden;
}
.game-card:hover,.game-card:focus {
  transform: translateY(-5px) scale(1.035) rotate(-1deg);
  box-shadow:0 12px 40px 2px #ffe18561,0 5px 23px #43e9ff3a;
  border-color:#ff24e5;
  z-index:4;
}
.game-icon {font-size:2.65rem;margin-bottom:10px;text-shadow:0 2px 12px #ffd60040;}
.game-title {font-size:1.1rem;font-weight:700;margin:7px 0 3px 0;letter-spacing:1.1px;}
.game-desc {font-size:1rem;color:#cdf6ffcc;margin-bottom:15px;min-height:48px;}
.game-play-btn {
  background: linear-gradient(87deg, #FFD600 0%, #43E9FF 100%);
  border:none;border-radius:7px;
  font-family:'Bangers','VT323',monospace;text-transform:uppercase;
  color: #22007a;font-size:.93rem;font-weight:900;
  padding:10px 14px;cursor:pointer;letter-spacing:1.5px;
  margin-top:0.6rem;transition:box-shadow 0.13s,transform .11s;
  box-shadow:0 0 14px #ffd60080, 0 1px 13px #43E9FF44;
  outline: none;
}
.game-play-btn:hover,.game-play-btn:focus {
  background:linear-gradient(89deg,#ff24e5,#FFD600 100%);
  color:#fff;box-shadow:0 0 17px #FFD60090;
  transform:scale(1.09) rotate(1.8deg);
}
.live-fun-api-wrap {
  margin:55px 0 40px 0;
  text-align:center;
  z-index:3;
  position:relative;
}
.fun-fact-bubble {
  background:linear-gradient(95deg,#3624ab55 0%,#e900d650 90%);
  border-radius:17px;
  padding:27px 37px 18px 37px;
  border:2.4px solid #16fff4;
  color:#f6fffd;
  font-size:1.24rem;font-family:'Orbitron','Bangers',monospace;
  font-weight:700;
  min-height:49px;
  display:inline-block;
  box-shadow:0 5px 23px #00ffd52e,0 2px 14px #b700ff33;
}
.fun-api-btn {
  margin-top:14px;padding:8px 25px;border-radius:6px;border:none;
  font-size:1.06rem;
  background:linear-gradient(90deg,#FFD600,#43E9FF 90%);
  color:#22007a;
  font-family:'VT323','Bangers',monospace;
  font-weight:800;cursor:pointer;letter-spacing:0.05em;
  transition:background 0.14s,transform 0.13s;
  outline:none;
}
.fun-api-btn:hover,.fun-api-btn:focus{
  background:linear-gradient(94deg,#ff24e5,#FFD600 80%);
  color:#fff;transform:scale(1.07);
}
.arcade-footer-vibrant {
  background:linear-gradient(90deg,#5118ea 0,#a724eb 52%,#FFD600 100%);
  color:#fff;margin-top:50px;padding:35px 0 24px 0;border-top:4px solid #ffd600;
  text-align:center;display:flex;flex-direction:column;align-items:center;
  font-size:1.18rem;
  font-family:'VT323','Orbitron',monospace;position:relative;
  box-shadow:0 -3px 28px #ab00fd22;
}
.footer-gradient-txt {
  background:linear-gradient(95deg,#ffd600,#43E9FF 86%);
  background-clip:text;color:transparent;-webkit-background-clip:text;
  font-size:1.08em;font-weight:900;text-shadow:0 1.2px 8px #FFD60080;
}
.footer-socials {margin:17px 0 4px 0;display:flex;gap:22px;justify-content:center;font-size:2.1rem;}
.footer-socials a {color:#fffa;transition:color .18s,text-shadow .17s;text-decoration:none;filter:drop-shadow(0 0 5px #ffd6007b);}
.footer-socials a:hover {color:#FFD600;text-shadow:0 0 10px #FFD600aa;}
.footer-links {margin-top:10px;font-size:0.97rem;opacity:0.85;gap:14px;display:flex;justify-content:center;flex-wrap:wrap;}
.footer-links a {color:#FFE185;margin:0 7px;text-decoration:underline dotted #FFD600;text-underline-offset:2px;transition:color .13s;}
.footer-links a:hover{color:#52FFD6;}
`;

const ARCADE_GAMES = [
  {
    icon: "🧩",
    title: "Block Puzzle",
    desc: "Arrange falling blocks to clear lines and score high!",
    route: "/games/block-puzzle",
  },
  {
    icon: "🧠",
    title: "Memory Match",
    desc: "Flip and match cards as fast as possible!",
    route: "/games/memory-match",
  },
  {
    icon: "⚡",
    title: "Reaction Speed",
    desc: "Test your reflexes in this fast-tap challenge.",
    route: "/games/reaction-speed",
  },
  {
    icon: "🦘",
    title: "Lava Hopper",
    desc: "Jump between platforms over boiling lava.",
    route: "/games/lava-hopper",
  },
  {
    icon: "🎯",
    title: "Aim Trainer",
    desc: "Sharpen your aim with ever-faster targets.",
    route: "/games/aim-trainer",
  },
  {
    icon: "🎲",
    title: "Quick Dice",
    desc: "Predict, roll, and beat the odds against the clock.",
    route: "/games/quick-dice",
  },
];

// All games for random challenge/surprise me pool.
const MINI_CHALLENGES = [
  {
    game: "Block Puzzle",
    description: "Clear 8+ lines before you lose!",
    route: "/games/block-puzzle",
  },
  {
    game: "Memory Match",
    description: "Finish a set in under 40 seconds.",
    route: "/games/memory-match",
  },
  {
    game: "Reaction Speed",
    description: "Score 10+ taps in 18 seconds!",
    route: "/games/reaction-speed",
  },
  {
    game: "Lava Hopper",
    description: "Survive 30 jumps in a run.",
    route: "/games/lava-hopper",
  },
  {
    game: "Aim Trainer",
    description: "Hit 15 targets without missing.",
    route: "/games/aim-trainer",
  },
  {
    game: "Quick Dice",
    description: "Roll double sixes within 6 turns.",
    route: "/games/quick-dice",
  },
];

const SOCIALS = [
  {
    icon: (
      <span role="img" aria-label="GitHub">
        🐙
      </span>
    ),
    url: "https://github.com/",
    title: "GitHub",
  },
  {
    icon: (
      <span role="img" aria-label="Twitter">
        🐦
      </span>
    ),
    url: "https://twitter.com/",
    title: "Twitter",
  },
  {
    icon: (
      <span role="img" aria-label="Discord">
        💬
      </span>
    ),
    url: "https://discord.gg/",
    title: "Discord",
  },
];

/*******************************
 * COMPONENTS
 ******************************/

/**
 * PUBLIC_INTERFACE
 * Animated Welcome Section with persistent daily challenge and Surprise Me button.
 */
const WelcomeSection = React.memo(function WelcomeSection({ onSurprise }) {
  // Daily challenge logic with localStorage rotation at UTC day
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    const key = "arcade_daily_challenge";
    // Day in UTC
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem(key + "_date");
    let idx = +localStorage.getItem(key + "_idx");
    if (!last || last !== today || idx >= MINI_CHALLENGES.length || idx < 0) {
      idx = Math.floor(Math.random() * MINI_CHALLENGES.length);
      localStorage.setItem(key + "_date", today);
      localStorage.setItem(key + "_idx", idx.toString());
    }
    setChallenge(MINI_CHALLENGES[idx]);
  }, []);

  return (
    <section className="animated-welcome-section arcade-font">
      <div className="arcade-logo-pop" tabIndex={0}>
        <span role="img" aria-label="controller" style={{ fontSize: "2.2rem" }}>🕹️</span>
        MiniMayhem Arcade
      </div>
      <h2 className="welcome-main-title arcade-gradient-txt">Welcome, Arcade Explorer!</h2>

      <div className="daily-challenge-box">
        <span className="daily-challenge-label">🎯 Daily Mini Challenge</span>
        {challenge ? (
          <>
            <div>
              <b>{challenge.game}</b>: {challenge.description}
            </div>
          </>
        ) : (
          <div>Loading today's challenge...</div>
        )}
      </div>
      <button className="arcade-surprise-btn" onClick={onSurprise} tabIndex={0}>
        🤩 Surprise Me!
      </button>
    </section>
  );
});

/**
 * PUBLIC_INTERFACE
 * Animated, responsive Game Cards Grid for 6 games, with play buttons
 */
const GamesCardsGrid = React.memo(function GamesCardsGrid({ onPlayGame }) {
  // Memoize grid content for performance
  const cards = useMemo(
    () =>
      ARCADE_GAMES.map((g) => (
        <div className="game-card arcade-font" key={g.title} tabIndex={0}>
          <div className="game-icon" aria-hidden="true">
            {g.icon}
          </div>
          <div className="game-title">{g.title}</div>
          <div className="game-desc">{g.desc}</div>
          <button
            className="game-play-btn"
            onClick={() => onPlayGame(g.route)}
            tabIndex={0}
            aria-label={`Play ${g.title}`}
          >
            PLAY ▶
          </button>
        </div>
      )),
    [onPlayGame]
  );
  return (
    <section className="games-preview-section">
      <div
        style={{
          fontFamily: "'Bangers','Orbitron',sans-serif",
          fontSize: "1.3rem",
          color: "#ffd600",
          letterSpacing: ".08em",
        }}
      >
        Choose a Minigame
      </div>
      <div className="arcade-games-grid" style={{ marginTop: 16 }}>
        {cards}
      </div>
    </section>
  );
});

/**
 * PUBLIC_INTERFACE
 * Fun API Section - rotating between Joke, Quote, or Number Fact
 */
const apiTypes = [
  {
    name: "Joke",
    fetch: async () => {
      // JokeAPI
      const r = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
      const data = await r.json();
      if (data && data.joke) return { type: "Joke", text: data.joke };
      throw new Error("No Joke");
    },
  },
  {
    name: "Quote",
    fetch: async () => {
      // Quotable API
      const r = await fetch("https://api.quotable.io/random?maxLength=80");
      const data = await r.json();
      if (data && data.content) return { type: "Quote", text: `"${data.content}" — ${data.author}` };
      throw new Error("No Quote");
    },
  },
  {
    name: "Fact",
    fetch: async () => {
      // NumbersAPI
      const n = Math.floor(Math.random() * 300);
      const r = await fetch(`http://numbersapi.com/${n}/trivia`);
      const txt = await r.text();
      if (txt) return { type: "Fact", text: txt };
      throw new Error("No Fact");
    },
  },
];

const fallbackPool = [
  { type: "Joke", text: "Why did the pixel cross the screen? To get to 'the other byte'!" },
  { type: "Fact", text: "The very first video game was created in 1958!" },
  { type: "Quote", text: '"The best way to get started is to quit talking and begin playing." — Walt Disney' },
  { type: "Fact", text: "A highscore is worth bragging about — aim for #1 today!" },
  { type: "Joke", text: "Why don't programmers play hide and seek? Because good luck hiding from the compiler." },
  { type: "Fact", text: "There are more possible Tetris games than atoms in the universe." },
];

/**
 * PUBLIC_INTERFACE
 * LiveFunElement: retrieves and displays random fun content. User can rotate.
 * API usage is controlled and component is memoized for responsiveness.
 */
const LiveFunElement = React.memo(function LiveFunElement() {
  const [item, setItem] = useState({ type: "Fun", text: "Loading a fun fact..." });
  const [loading, setLoading] = useState(false);

  const getRandomAPI = useCallback(() => {
    // Randomly pick which API to fetch from
    return apiTypes[Math.floor(Math.random() * apiTypes.length)];
  }, []);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    let api = getRandomAPI();
    try {
      const res = await api.fetch();
      setItem(res);
    } catch {
      // fallback random fun item
      setItem(fallbackPool[Math.floor(Math.random() * fallbackPool.length)]);
    }
    setLoading(false);
  }, [getRandomAPI]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  // Playful type-based emoji
  const emoji =
    item.type === "Joke" ? "😆"
      : item.type === "Quote" ? "💬"
        : item.type === "Fact" ? "🔢"
          : "🎲";

  return (
    <section className="live-fun-api-wrap arcade-font" aria-live="polite">
      <div className="fun-fact-bubble" tabIndex={0}>
        <span aria-label={item.type}>{emoji}</span> &nbsp;{item.text}
        <br />
        <button className="fun-api-btn" onClick={fetchContent} disabled={loading}>
          {loading ? "Loading..." : "🔀 New Fun!"}
        </button>
      </div>
    </section>
  );
});

/**
 * PUBLIC_INTERFACE
 * Vibrant Arcade Footer with styling
 */
const ArcadeFooter = React.memo(function ArcadeFooter() {
  const socials = useMemo(
    () =>
      SOCIALS.map((s) => (
        <a key={s.title} href={s.url} title={s.title} target="_blank" rel="noopener noreferrer">
          {s.icon}
        </a>
      )),
    []
  );
  // Example links
  const links = useMemo(
    () => [
      <a href="#" key="terms">Terms</a>,
      <span key="dot1">•</span>,
      <a href="#" key="privacy">Privacy</a>,
      <span key="dot2">•</span>,
      <a href="#" key="contact">Contact</a>,
    ],
    []
  );
  return (
    <footer className="arcade-footer-vibrant arcade-font">
      <div>
        <span className="footer-gradient-txt" style={{ fontWeight: 900, fontSize: "1.24rem", letterSpacing: "1.3px" }}>
          Made with <span role="img" aria-label="love" style={{ color: "#ff59b9", fontWeight: 700 }}>❤️</span>
        </span>{" "}
        by MiniMayhem Team
      </div>
      <div className="footer-socials">{socials}</div>
      <div className="footer-links">{links}</div>
    </footer>
  );
});

/**
 * PUBLIC_INTERFACE
 * Top-level Landing Page: composed of all
 */
const LandingPage = React.memo(function LandingPage() {
  const navigate = useNavigate();

  // surprise selection handler
  const handleSurprise = useCallback(() => {
    // Pick a random game route and navigate/focus
    const all = ARCADE_GAMES;
    const random = all[Math.floor(Math.random() * all.length)];
    if (random && random.route) {
      navigate(random.route, { replace: false });
    }
  }, [navigate]);

  // game play button clicked
  const handlePlayGame = useCallback(
    (route) => {
      if (route) navigate(route, { replace: false });
    },
    [navigate]
  );

  // Lazy-load Fun API
  const LazyLiveFunElement = useMemo(
    () => lazy(() => Promise.resolve({ default: LiveFunElement })),
    []
  );

  return (
    <>
      <style>{ARCADE_FONTS + ARCADE_CSS}</style>
      <main className="arcade-landing-bg" style={{ minHeight: "100vh", width: "100vw" }}>
        <WelcomeSection onSurprise={handleSurprise} />
        <div className="container" style={{ maxWidth: 1050, margin: "0 auto", padding: "0 12px", zIndex: 2, position: "relative" }}>
          <GamesCardsGrid onPlayGame={handlePlayGame} />
        </div>
        <Suspense fallback={
          <section className="live-fun-api-wrap arcade-font">
            <div className="fun-fact-bubble" style={{ opacity: 0.65 }}>Loading fun...</div>
          </section>
        }>
          <LazyLiveFunElement />
        </Suspense>
        <ArcadeFooter />
      </main>
    </>
  );
});

export default LandingPage;
