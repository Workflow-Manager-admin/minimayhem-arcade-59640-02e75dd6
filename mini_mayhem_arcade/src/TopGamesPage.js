import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
/**
 * TopGamesPage Component
 *
 * - Fetches top 10 highest-rated games from the RAWG public API
 * - Renders arcade-style neon/pixel grid of game cards
 * - Includes loading, error, and refresh button
 * - Responsive; uses pixel/arcade fonts and dark neon theme
 */
const RAWG_URL =
  "https://api.rawg.io/api/games?ordering=-rating&page_size=10";

// Arcade-inspired, glow+pixel font imports and styling
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap');
.top-games-arcade-font {
  font-family: 'Press Start 2P', 'Orbitron', Arial, sans-serif;
}
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(115deg, #110033 0%, #050c16 88%)",
    padding: "0",
    margin: 0,
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginTop: 110,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    fontSize: "2.25rem",
    color: "#32fff0",
    textShadow: "0 0 6px #0ff, 0 0 30px #290062, 0 0 18px #52eaff",
    letterSpacing: "2px",
  },
  subtitle: {
    color: "#ff7afd",
    fontSize: "1rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 35,
    textShadow: "0 0 7px #cc28ff80",
    letterSpacing: "1px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(265px, 1fr))",
    gap: "32px 22px",
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    marginBottom: 60,
    padding: "0 16px",
  },
  card: {
    position: "relative",
    background:
      "linear-gradient(126deg, #2c00a9c9 0%, #201b5b 58%, #20434a 100%)",
    borderRadius: "23px",
    overflow: "hidden",
    boxShadow:
      "0 0 25px #16e3fd36, 0 0 12px #7e19cd57, 0 0 2px 2px #4ecbff11",
    border: "3.4px solid #22ffffa9",
    userSelect: "none",
    transition:
      "transform 0.17s cubic-bezier(0.75,1.8,0.85,.6), box-shadow 0.24s",
    cursor: "pointer",
  },
  cardHover: {
    transform: "scale(1.048) rotate(-2deg)",
    boxShadow:
      "0 0 55px #00fff8b8, 0 0 28px #19ffd6a9, 0 0 2px 3px #ff2eed99",
    borderColor: "#ff2eed",
    zIndex: 2,
  },
  cover: {
    width: "100%",
    display: "block",
    objectFit: "cover",
    height: 210,
    background: "#00000388",
    borderRadius: "19px 19px 7px 7px",
    boxShadow: "0 5px 35px #0ff7, 0 0 30px #2e0dfb57",
    borderBottom: "4px solid #32d3ff",
    marginBottom: 0,
    transition: "filter 0.2s",
  },
  info: {
    padding: "22px 13px 17px 16px",
    color: "#fff",
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  gameName: {
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#40fff8",
    textShadow:
      "0 0 7px #46ffd7, 0 0 26px #00fff7c0, 0 2px 10px #1353ff68",
    margin: "7px 0 4px 0",
    lineHeight: 1.25,
    whiteSpace: "pre-line",
    wordBreak: "break-word",
    minHeight: 42,
  },
  rating: {
    fontSize: "1rem",
    color: "#efea0a",
    textShadow: "0 0 8px #fff900c8",
    marginRight: 14,
  },
  release: {
    fontSize: "0.92rem",
    color: "#fd79ea",
    textShadow: "0 0 7px #fd79ea88",
  },
  cardMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginTop: 7,
  },
  refreshBtn: {
    marginTop: 3,
    marginBottom: 28,
    padding: "10px 25px",
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    color: "#fff",
    background: "linear-gradient(91deg, #00ffb0 0%, #3e69ff 100%)",
    border: "2.1px solid #32fff0a5",
    borderRadius: "12px",
    boxShadow:
      "0 0 10px #40fff7b9, 0 2px 17px #00e6fff2, 0 10px 25px #855aff35",
    letterSpacing: 1,
    cursor: "pointer",
    transition: "background 0.18s, box-shadow 0.23s, color 0.13s, border 0.15s",
  },
  refreshBtnHover: {
    background: "linear-gradient(98deg, #22f5c0 0%, #8866fa 100%)",
    color: "#FFFAFA",
    borderColor: "#ffd700",
    boxShadow:
      "0 0 25px #eeff8080, 0 2px 20px #aefffec5, 0 10px 27px #e418ca93",
    transform: "scale(1.045)",
  },
  loading: {
    color: "#42ffd6",
    fontSize: "1.18rem",
    padding: "48px 0",
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    letterSpacing: 1,
    textAlign: "center",
    textShadow: "0 1px 6px #00fff9,0 2px 14px #859de7cb",
  },
  error: {
    color: "#ff255c",
    fontSize: "1.11rem",
    fontFamily: "'Press Start 2P', 'Orbitron', Arial, sans-serif",
    padding: "36px 0 26px 0",
    textShadow: "0 2px 17px #ff256cc1,0 4px 20px #ff18a5b5",
    textAlign: "center",
  },
};

function className(base, extra, cond) {
  // Utility for conditional class name
  return base + (cond ? " " + extra : "");
}

const TopGamesPage = () => {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");
  const [refreshHover, setRefreshHover] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  // PUBLIC_INTERFACE
  /**
   * Fetches top 10 games from RAWG API & handles UI state
   */
  const fetchGames = async () => {
    setStatus("loading");
    setError("");
    try {
      // Using proxy for CORS is unnecessary if directly using RAWG public endpoint.
      const res = await fetch(RAWG_URL);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results))
        throw new Error("Malformed API response");
      setGames(data.results);
      setStatus("ready");
    } catch (e) {
      setError(e.message || "Failed to fetch games");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {/* Load arcade font styles + custom styles inline for self-containment */}
      <style>{fontCss}</style>
      <div style={styles.page}>
        <div style={styles.title} className="top-games-arcade-font">
          🔝 Top-Rated Games
        </div>
        <div style={styles.subtitle} className="top-games-arcade-font">
          The world’s top 10 highest rated games (RAWG.io)
        </div>

        <button
          style={{
            ...styles.refreshBtn,
            ...(refreshHover ? styles.refreshBtnHover : {}),
          }}
          aria-label="Reload Top Games"
          onClick={() => fetchGames()}
          onMouseEnter={() => setRefreshHover(true)}
          onMouseLeave={() => setRefreshHover(false)}
        >
          <span role="img" aria-label="refresh" style={{ marginRight: 11 }}>
            🔄
          </span>
          Refresh
        </button>

        {status === "loading" && (
          <div style={styles.loading} className="top-games-arcade-font">
            <span role="img" aria-label="arcade" style={{ fontSize: 34, marginRight: 8 }}>
              👾
            </span>
            Loading top games...
          </div>
        )}

        {status === "error" && (
          <div style={styles.error} className="top-games-arcade-font">
            <span role="img" aria-label="error" style={{ fontSize: 25, marginRight: 9 }}>
              ❌
            </span>
            {error || "Could not load games. Please try again."}
          </div>
        )}

        {status === "ready" && (
          <div style={styles.grid}>
            {games.map((game, idx) => (
              <div
                key={game.id}
                style={{
                  ...styles.card,
                  ...(hoverIndex === idx ? styles.cardHover : {}),
                  transition:
                    "transform 0.17s cubic-bezier(0.75,1.8,0.85,.6), box-shadow 0.20s",
                }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                tabIndex={0}
                aria-label={`Game: ${game.name}`}
              >
                <img
                  src={
                    game.background_image ||
                    "https://static.rawg.io/assets/default_512x512-b6214c40.png"
                  }
                  alt={`Cover for ${game.name}`}
                  style={styles.cover}
                  loading="lazy"
                  draggable={false}
                />
                <div style={styles.info}>
                  <div style={styles.gameName}>{game.name}</div>
                  <div style={styles.cardMetaRow}>
                    <span style={styles.rating}>
                      ⭐ {game.rating?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || "N/A"}
                    </span>
                    {game.released && (
                      <span style={styles.release}>
                        {game.released}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Responsive: shrink grid, adjust card styles on small screens */}
      <style>{`
        @media (max-width: 870px) {
          .top-games-arcade-font { font-size: 1.02rem !important; }
        }
        @media (max-width: 720px) {
          .top-games-arcade-font { font-size: 0.91rem !important; }
          div[style*='max-width: 1080px'] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          div[style*='max-width: 1080px'] {
            grid-template-columns: 1fr !important;
          }
          .top-games-arcade-font { font-size: 0.83rem !important; }
        }
      `}</style>
    </>
  );
};

export default TopGamesPage;
