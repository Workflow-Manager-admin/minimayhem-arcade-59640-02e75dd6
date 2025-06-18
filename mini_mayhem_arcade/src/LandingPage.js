import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import Navbar from "./Navbar";

// PUBLIC_INTERFACE
/**
 * MiniMayhem Arcade Landing Page (Optimized)
 * - Enhanced Navbar (with Settings dropdown)
 * - Hero Section: animated pixel/arcade background, intro text, CTA buttons
 * - Feature Grid: six games/cards, icons, descriptions, play buttons, effects
 * - Fun API Section: joke/quote/fun fact (lazy-loaded for perf)
 * - Vibrant Footer with arcade styling
 * Uses pixel/arcade fonts and responsive layout. Performance improvements: memo, lazy, split render, CSS animation, reduced unnecessary effect triggers.
 */
const arcadeFonts = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Orbitron:wght@700&display=swap');
.arcade-font      { font-family: 'Press Start 2P', 'Orbitron', 'VT323', Montserrat, monospace !important; }
.arcade-hero      { font-family: 'Press Start 2P', 'Orbitron', 'VT323', Courier, monospace !important; }
.arcade-subtitle  { font-family: 'Orbitron', 'VT323', sans-serif; letter-spacing:2px; }
.arcade-footer    { font-family: 'VT323', 'Press Start 2P', Geo, monospace; }
`;

const arcadeCss = `
.arcade-bg-css-fadein {
  animation: arcadeBgFade 1.35s cubic-bezier(.79,-0.15,.39,1.41) both;
}
@keyframes arcadeBgFade {
  0% { opacity: 0; filter: brightness(0.75) blur(2px);}
  75% { opacity: 0.8; filter: blur(0.3px);}
  100% { opacity: 1; filter: none;}
}
.arcade-bg-animated {
  position: absolute;
  top:0; left:0; right:0; bottom:0;
  z-index:0; pointer-events:none;
  overflow:hidden;
}
.arcade-bg-pixels {
  position: absolute;
  top:0; left:0; right:0; bottom:0;
  z-index:0; pointer-events: none;
  opacity: 0.13;
}
@media (max-width: 600px) {
  .arcade-hero-title { font-size: 1.5rem !important; }
}
.hero-alt-glow {
  text-shadow:
    0 2px 4px #00fff7,
    2px 3px 0 #0c188b96,
    0 0 10px #fff09d, 
    0 6px 40px #e708fb90;
}
.arcade-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(215px,1fr));
  gap: 36px 28px;
  margin: 38px 0 40px 0;
  z-index:2;
}
.arcade-feature-card {
  background: linear-gradient(141deg,#272473 40%,#a820c5 100%);
  border: 2.7px solid #FFDE68c8;
  border-radius: 15px;
  box-shadow: 0 10px 32px 0 #1a09ab49, 0 2.5px 0 #ff5ee480;
  color: #fff;
  text-align: center;
  padding: 32px 20px 22px 20px;
  position: relative;
  transition: transform 0.15s, box-shadow 0.2s;
  cursor: pointer;
  font-family: 'Orbitron', 'Press Start 2P', monospace;
}
.arcade-feature-card:hover, .arcade-feature-card:focus {
  transform: translateY(-7px) scale(1.032) rotate(-1deg);
  box-shadow: 0 18px 44px 3px #ffe18560,0 1.5px 35px #00e5ff33;
  border-color: #f806c4;
}
.arcade-feature-icon {
  font-size: 2.7rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 7px #ffb7fa80);
}
.arcade-feature-title {
  font-size: 1.15rem;
  margin: 9px 0 7px 0;
  letter-spacing: 1.2px;
  font-weight:900;
}
.arcade-feature-desc {
  font-size: 1rem;
  color: #cdf6ff;
  margin-bottom: 16px;
  min-height: 56px;
}
.arcade-card-btn {
  background: linear-gradient(98deg, #FFD600 0%, #40c6ff 100%);
  border: none;
  box-shadow: 0 2px 8px #57d7ff60;
  font-family: 'Press Start 2P', 'VT323', monospace;
  text-transform: uppercase;
  color: #0b0157;
  font-size: 0.89rem;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 8px;
  margin-top: 8px;
  cursor: pointer;
  letter-spacing: 1.7px;
  transition: box-shadow 0.19s, transform 0.12s;
}
.arcade-card-btn:hover, .arcade-card-btn:focus {
  box-shadow: 0 0 25px #00ffd0a9, 0 7px 22px #ffd60080;
  transform: scale(1.07) rotate(1deg);
  background: linear-gradient(87deg, #ff43ef 10%, #ffd600 100%);
  color: #64008b;
}
.arcade-funapi-section {
  margin: 52px 0 58px 0;
  text-align: center;
  z-index:2;
}
.arcade-funapi-bubble {
  background: linear-gradient(98deg,#3a51ea8f, #e900d655 90%);
  border-radius: 17px;
  display: inline-block;
  margin: 0 auto;
  padding: 27px 38px 22px 38px;
  box-shadow: 0 8px 32px #00fff52c, 0 3px 17px #bd00ff47;
  color: #fff;
  font-size: 1.25rem;
  max-width: 460px;
  font-family: 'Orbitron','Press Start 2P',monospace;
  font-weight:600;
  position:relative;
  border: 2px solid #16fff4;
}
.arcade-funapi-btn {
  margin-top:14px;
  padding:7px 22px;
  border-radius:6px;
  border:none;
  font-size:1rem;
  background:linear-gradient(80deg,#FFD600,#8e4fff 90%);
  color:#070045;
  font-family:'Press Start 2P','VT323',monospace;
  font-weight:800;
  cursor:pointer;
  transition:background 0.18s,transform 0.14s;
}
.arcade-funapi-btn:hover {
  background:linear-gradient(94deg,#43E9FF,#ffd600 90%);
  color:#3200ae;
  transform:scale(1.1);
}
.arcade-footer-main {
  background: linear-gradient(90deg,#2d267b 0,#a724eb 41%,#ffb700 100%);
  color: #fff;
  margin-top: 60px;
  padding:44px 0 30px 0;
  border-top: 4px solid #ffd600;
  text-align:center;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;
  font-size:1.18rem;
  box-shadow: 0 -5px 48px #ab00fd34;
  font-family: 'VT323', 'Orbitron', monospace;
  position:relative;
}
.arcade-footer-social {
  margin: 17px 0 4px 0;
  display: flex;
  gap: 24px;
  justify-content: center;
  font-size: 2.1rem;
}
.arcade-footer-social a {
  color: #fffa;
  transition: color 0.18s, text-shadow 0.15s;
  text-decoration: none;
  filter: drop-shadow(0 0 7px #ffd60070);
}
.arcade-footer-social a:hover {
  color: #ffd600;
  text-shadow: 0 0 22px #fff355, 0 2px 20px #b700ff80;
}
.arcade-footer-links {
  margin-top: 12px;
  font-size: 0.97rem;
  opacity:0.81;
  gap: 18px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.arcade-footer-links a {
  color: #FFE185; 
  margin: 0 8px;
  text-underline-offset: 2.8px;
  text-decoration: underline dotted #FFF955;
  transition: color 0.16s;
}
.arcade-footer-links a:hover {
  color: #52FFD6;
}
@media (max-width:600px){
  .arcade-feature-grid { gap: 23px 7px; }
  .arcade-feature-card { font-size:0.93rem;padding:19px 7px 15px 7px;}
  .arcade-footer-main { font-size:1rem;padding:27px 0 21px 0; }
}
`;

const featureGames = [
  {
    icon: "👾", title: "Alien Blitz", desc: "Blast pixel invaders in a retro shoot-em-up!", route: "/games/alien-blitz"
  },
  {
    icon: "🏎️", title: "Pixel Kart", desc: "Race in 8-bit style & power up your arcade car.", route: "/games/pixel-kart"
  },
  {
    icon: "🧩", title: "Match Mania", desc: "Solve snapping tile puzzles against the clock.", route: "/games/match-mania"
  },
  {
    icon: "🦘", title: "Lava Hopper", desc: "Time your jumps! Arcade platform action on hot lava.", route: "/games/lava-hopper"
  },
  {
    icon: "🥚", title: "Egg Drop", desc: "Catch eggs in baskets. The more you catch, the faster it gets!", route: "/games/egg-drop"
  },
  {
    icon: "🧨", title: "Bomb Squad", desc: "Defuse pixel bombs before time is up. Fast reflexes needed!", route: "/games/bomb-squad"
  }
];

const SOCIALS = [
  { icon: <span role="img" aria-label="GitHub">🐙</span>, url: "https://github.com/", title: "GitHub" },
  { icon: <span role="img" aria-label="Twitter">🐦</span>, url: "https://twitter.com/", title: "Twitter" },
  { icon: <span role="img" aria-label="Discord">💬</span>, url: "https://discord.com/", title: "Discord" }
];

// Small Animated Pixel Dot Field for Background
const AnimatedArcadeBg = React.memo(function AnimatedArcadeBg() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext && canvas.getContext("2d");
    if (!canvas || !ctx) return;
    let running = true;
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(340, window.innerHeight * 0.58);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Colored pixel objects
    const colors = ["#FFD600","#00FFF0","#FF43EF","#92FF51","#e900d6","#ffd0f5"];
    let pxs = Array.from({length:85},()=>({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      s:2+Math.random()*2,
      c:colors[Math.floor(Math.random()*colors.length)],
      dx: (Math.random()<0.5?-0.2:0.2)*(0.8+Math.random()*1),
      dy: (Math.random()<0.5?-0.2:0.2)*(0.3+Math.random()*0.6)
    }));
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pxs.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.s,0,2*Math.PI);
        ctx.fillStyle=p.c;
        ctx.filter="brightness(1.23) blur(0.2px)";
        ctx.shadowColor=p.c;
        ctx.shadowBlur=11;
        ctx.globalAlpha=0.93;
        ctx.fill();
        // Move
        p.x+=p.dx; p.y+=p.dy;
        // Edge bounce
        if (p.x<0||p.x>canvas.width) p.dx*=-1;
        if (p.y<0||p.y>canvas.height) p.dy*=-1;
      });
      ctx.globalAlpha=1; ctx.filter="none";
      if (running) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    return () => { running=false; window.removeEventListener("resize", resizeCanvas); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="arcade-bg-animated arcade-bg-css-fadein"
      style={{
        width: "100vw",
        height: 340,
        minHeight: 200,
        background: "radial-gradient(circle, #5118ea 37%, #ffa90064 100%)",
        opacity: 0.32,
      }}
      tabIndex={-1}
      aria-hidden="true"
      loading="lazy"
    />
  );
});

// Enhanced Navbar with Settings Dropdown
const NavbarWithSettings = React.memo(function NavbarWithSettings() {
  const [open, setOpen] = useState(false);
  const settingsRef = useRef();
  // Basic click-outside closing
  useEffect(() => {
    function onDoc(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setOpen(false);
    }
    if (open) window.addEventListener("mousedown", onDoc);
    return()=>window.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div style={{position:"relative",zIndex:11}}>
      <Navbar />
      {/* Settings button and dropdown, positioned absolute in top-right corner */}
      <div style={{
        position:"absolute",right:23,top:13,zIndex:1003,minWidth:90,fontFamily:"'Orbitron','Press Start 2P',sans-serif"
      }} ref={settingsRef}>
        <button
          aria-label="Open settings"
          aria-haspopup="menu"
          onClick={()=>setOpen(o=>!o)}
          style={{
            background:"linear-gradient(94deg,#FFD600,#8e4fff 90%)",color:"#3200ae",
            fontWeight:900,fontSize:"1rem",padding:"8px 15px 9px 15px",borderRadius:6,border:"none",cursor:"pointer",
            boxShadow:"0 0 10px #ffd60080", marginLeft:7,outline:open?"3px solid #ff43ef":"none"
          }}
          tabIndex={0}
        >⚙️ Settings</button>
        {open &&
          <div style={{
            background: "linear-gradient(104deg,#3724ab 0,#a120b6 90%)",
            position: "absolute", right: 0, top: 44,
            borderRadius: 14, boxShadow: "0 13px 38px #6b16ab60,0 1px 15px #ffd60055",
            border: "2.5px solid #FFD600", minWidth: 183, padding: "13px 17px", display: "flex", flexDirection: "column", gap: "8px"
          }}>
            <button style={{
              background: "none", border: "none", color: "#fffa", fontWeight: 600, textAlign: "left", cursor: "pointer", fontSize: "1.05rem", borderRadius: "8px", padding: "6px 2px 6px 7px",
              fontFamily: "'Orbitron','VT323',monospace", transition: "background .18s", outline: "none"
            }}
              onClick={() => { alert("Settings coming soon!"); setOpen(false); }}>🎨 Theme</button>
            <button style={{
              background: "none", border: "none", color: "#fffa", fontWeight: 600, textAlign: "left", cursor: "pointer", fontSize: "1.05rem", borderRadius: "8px", padding: "6px 2px 6px 7px",
              fontFamily: "'Orbitron','VT323',monospace", transition: "background .18s", outline: "none"
            }}
              onClick={() => { alert("Sound coming soon!"); setOpen(false); }}>🔊 Sound</button>
            <button style={{
              background: "none", border: "none", color: "#fffa", fontWeight: 600, textAlign: "left", cursor: "pointer", fontSize: "1.05rem", borderRadius: "8px", padding: "6px 2px 6px 7px",
              fontFamily: "'Orbitron','VT323',monospace", transition: "background .18s", outline: "none"
            }}
              onClick={() => { alert("Profile coming soon!"); setOpen(false); }}>👤 Profile</button>
          </div>
        }
      </div>
    </div>
  );
});

// Thin suspense fallback for API
const FunAPILoader = () => (
  <section className="arcade-funapi-section" style={{ color: "#c1e9fc", fontFamily: "'Orbitron','VT323',monospace" }}>
    <div className="arcade-funapi-bubble arcade-font" style={{ opacity: 0.65 }}>
      Loading fun fact...
    </div>
  </section>
);

// Fun API: Random Joke or "fun fact" (lazy-loaded to avoid heavy-initial render)
const FunAPI = React.memo(function FunAPI() {
  const [result, setResult] = useState({ text: "Loading a fun fact for you..." });
  const [loading, setLoading] = useState(false);
  // Memoize fetch callback to avoid re-creation
  const fetchFact = useCallback(async () => {
    setLoading(true);
    let url = Math.random() > 0.4
      ? "https://uselessfacts.jsph.pl/api/v2/facts/random"
      : "https://official-joke-api.appspot.com/random_joke";
    try {
      const r = await fetch(url);
      if (url.includes("uselessfacts")) {
        const data = await r.json();
        setResult({ text: data.text });
      } else {
        const data = await r.json();
        setResult({ text: `${data.setup} ${data.punchline}` });
      }
    } catch (e) {
      // Fallback: Random fun fact or joke
      const fallback = [
        "Did you know? The very first video game was created in 1958!",
        "Fun fact: The highest scoring Pac-Man game is 3,333,360 points.",
        "Joke: Why did the pixel cross the screen? To get to 'the other byte'!",
        "In 1980, more arcade machines than pizza places existed in the US.",
        "The world’s largest arcade is in Brookfield, IL — over 900 games!"
      ];
      setResult({ text: fallback[Math.floor(Math.random() * fallback.length)] });
    }
    setLoading(false);
  }, []);
  // useEffect, deps []
  useEffect(() => { fetchFact(); }, [fetchFact]);
  return (
    <section className="arcade-funapi-section">
      <div className="arcade-funapi-bubble arcade-font" tabIndex="0" aria-live="polite">
        {result.text}
        <br />
        <button onClick={fetchFact} className="arcade-funapi-btn" disabled={loading}>
          {loading ? "Loading..." : "😃 New Fun Fact"}
        </button>
      </div>
    </section>
  );
});

// Prepare lazy-loading for FunAPI section, avoid render until in view
const LazyFunAPI = lazy(() =>
  // intentional late import - simple stub since FunAPI is in same file
  Promise.resolve({ default: FunAPI })
);

/**
 * Hook to check if an element is in the viewport.
 * Returns: [isVisible, ref]
 */
function useVisibility(threshold = 0.33) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new window.IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting || entry.intersectionRatio > 0),
        { threshold }
      );
      observer.observe(current);
    } else {
      // Always visible fallback
      setVisible(true);
    }
    return () => { if (observer && current) observer.unobserve(current); };
  }, [threshold]);
  return [visible, ref];
}

// Hero Section
const HeroSection = React.memo(function HeroSection() {
  return (
    <header style={{
      minHeight: 390,
      padding: "118px 0 46px 0", position: "relative", textAlign: "center", zIndex: 1,
      background: "linear-gradient(90deg,#5118ea 10% ,#ffd600 100%)"
    }}>
      <AnimatedArcadeBg />
      <h1
        className="arcade-hero arcade-hero-title hero-alt-glow"
        style={{
          fontSize: "2.25rem",
          fontWeight: 900,
          color: "#ffeb3b",
          letterSpacing: "1.7px",
          margin: 0,
          zIndex: 2,
        }}
      >MINIMAYHEM <span style={{ color: "#00fff0", textShadow: "0 2px 10px #e900d633" }}>ARCADE</span></h1>
      <div className="arcade-subtitle" style={{
        fontSize: "1.12rem", color: "#fff", margin: "13px 0 7px 0", fontWeight: 700, textShadow: "0 2px 11px #601eaf70"
      }}>
        <span style={{ background: "linear-gradient(95deg,#ffd600, #ff43ef 65%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Play 6 crazy minigames</span> in your browser!
      </div>
      <div
        aria-label="MiniMayhem Arcade tagline"
        style={{
          fontSize: "1.03rem",
          color: "#f6dad8",
          maxWidth: 440,
          margin: "11px auto 18px auto",
          textShadow: "0 2px 9px #0aaaec29,0 0.5px 0 #fff",
          fontFamily: "'VT323','Press Start 2P',monospace"
        }}
      >
        Beat the highscore, challenge your friends, and experience a burst of color & fun. <br />
        Fast loads, no install. All free!
      </div>
      <div style={{ margin: "19px 0 0 0", display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", zIndex: 2 }}>
        <a href="#feature-grid" className="arcade-card-btn" style={{ fontSize: "1.06rem", background: "linear-gradient(98deg, #FFD600 0%, #FF506D 100%)", color: "#3200ae", boxShadow: "0 2px 20px #ffd60080" }}>
          🎮 Play Now
        </a>
        <a href="#fun-api" className="arcade-card-btn" style={{ background: "linear-gradient(98deg,#43E9FF,#ffd600 99%)", color: "#0b0157" }}>
          😄 Random Fun
        </a>
      </div>
    </header>
  );
});

// Individual feature card (memo)
const FeatureCard = React.memo(function FeatureCard({ icon, title, desc, route }) {
  return (
    <div className="arcade-feature-card" tabIndex={0} aria-label={`Play ${title}`}>
      <div className="arcade-feature-icon">{icon}</div>
      <div className="arcade-feature-title">{title}</div>
      <div className="arcade-feature-desc">{desc}</div>
      <a href={route} className="arcade-card-btn" tabIndex={0} aria-label={`Play ${title} now!`}>
        Play&nbsp;▶
      </a>
    </div>
  );
});

// Feature Grid (memoized)
const FeatureGrid = React.memo(function FeatureGrid() {
  // Memoize to avoid rerender
  const cards = useMemo(
    () =>
      featureGames.map((g) => (
        <FeatureCard key={g.title} icon={g.icon} title={g.title} desc={g.desc} route={g.route} />
      )),
    []
  );
  return (
    <section id="feature-grid">
      <div className="arcade-feature-grid">
        {cards}
      </div>
    </section>
  );
});

// Arcade Footer (memoized with memoized socials/links)
const ArcadeFooter = React.memo(function ArcadeFooter() {
  const socials = useMemo(
    () =>
      SOCIALS.map((s) => (
        <a key={s.title} href={s.url} title={s.title} target="_blank" rel="noopener noreferrer">{s.icon}</a>
      )),
    []
  );
  const links = useMemo(
    () => [
      <a href="#" key="terms">Terms</a>,
      <span key="dot1">•</span>,
      <a href="#" key="privacy">Privacy</a>,
      <span key="dot2">•</span>,
      <a href="#" key="contact">Contact</a>
    ],
    []
  );
  return (
    <footer className="arcade-footer-main arcade-footer">
      <div>
        <span style={{ fontWeight: 900, fontSize: "1.24rem", letterSpacing: "1.6px", color: "#FFD600", filter: "drop-shadow(0 2px #e900d6da)" }}>
          Made with <span role="img" aria-label="love" style={{ color: "#ff59b9", fontWeight: 700 }}>❤️</span>
        </span> by MiniMayhem Team
      </div>
      <div className="arcade-footer-social">{socials}</div>
      <div className="arcade-footer-links">{links}</div>
    </footer>
  );
});

// The main page (memoize top-level for static props)
const LandingPage = React.memo(() => {
  // FunAPI section visibility
  const [funVisible, funApiRef] = useVisibility(0.09); // trigger slightly before in view

  return (
    <>
      <style>{arcadeFonts + arcadeCss}</style>
      <NavbarWithSettings />
      <div style={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(120deg, #1a0034 0%, #5118ea 30%, #ffd600 98%)",
        overflow: "hidden", zIndex: 0
      }}>
        <HeroSection />
        <div className="container" style={{ paddingTop: 36, zIndex: 2, position: "relative" }}>
          <FeatureGrid />
          <div id="fun-api" ref={funApiRef} style={{ minHeight: 120 }}>
            {/* Use Suspense fallback and lazy load FunAPI */}
            {funVisible ? (
              <Suspense fallback={<FunAPILoader />}>
                <LazyFunAPI />
              </Suspense>
            ) : (
              <FunAPILoader />
            )}
          </div>
        </div>
        <ArcadeFooter />
      </div>
    </>
  );
});

export default LandingPage;
