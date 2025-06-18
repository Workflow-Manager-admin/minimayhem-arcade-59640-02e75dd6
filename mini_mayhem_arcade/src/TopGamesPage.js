import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
/**
 * TopGamesPage fetches and displays the top 10 games from FreeToGame API.
 * Displays each as an arcade-style card (thumbnail, title, genre, platform, release date).
 * Loading and error UI, plus a refresh button, are preserved.
 */
function TopGamesPage() {
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  // Fetch top games from the FreeToGame API
  const fetchTopGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("https://www.freetogame.com/api/games");
      if (!resp.ok) {
        throw new Error(`Error fetching games: ${resp.statusText}`);
      }
      const data = await resp.json();
      // Only take top 10, mapping required fields
      const top10 = data.slice(0, 10).map(game => ({
        id: game.id,
        title: game.title,
        genre: game.genre,
        platform: game.platform,
        release: game.release_date,
        img: game.thumbnail
      }));
      setTopGames(top10);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopGames();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = fetchTopGames;

  return (
    <div className="container" style={{ paddingTop: 88, paddingBottom: 40 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30, flexWrap: "wrap"
      }}>
        <div>
          <h2 className="title" style={{ marginBottom: 0, fontSize: 34 }}>
            🔝 Top Arcade Games
          </h2>
          <div className="subtitle" style={{ color: "var(--base-light)" }}>
            The most played trending browser games!
          </div>
        </div>
        <button className="btn" style={{height: 46}} onClick={handleRefresh}>
          ⟳ Refresh
        </button>
      </div>
      {loading && (
        <div style={{ color: "var(--base-light)", fontSize: 22, textAlign: "center", margin: "66px 0" }}>
          Loading top games...
        </div>
      )}
      {error && (
        <div style={{ color: "#F66", fontWeight: 500, fontSize: 20 }}>
          Failed to load games: {error}
        </div>
      )}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
            gap: "37px",
            paddingTop: 8
          }}
        >
          {topGames.map((game) => (
            <div
              key={game.id}
              style={{
                background: "linear-gradient(120deg,#1900ff 0%,#00e0fa 100%)",
                borderRadius: 19,
                padding: 18,
                boxShadow: "0 8px 32px 0 #1E236319, 0 1.5px 0 #f9faff03",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <img
                src={game.img}
                alt={game.title}
                style={{
                  width: 130,
                  height: 130,
                  objectFit: "cover",
                  borderRadius: 12,
                  boxShadow: "0 3.5px 14px #0af4",
                  border: "4px solid #fff1"
                }}
                loading="lazy"
              />
              <div style={{ fontWeight: 800, fontSize: 20, marginTop: 14, color: "#fff" }}>
                {game.title}
              </div>
              <div style={{ color: "#fff9", fontSize: 15, marginTop: 6 }}>
                {game.genre}
              </div>
              <div style={{ color: "#fff9", fontSize: 14, marginTop: 6 }}>
                <span style={{fontWeight:600}}>Platform:</span>&nbsp;{game.platform}
              </div>
              <div style={{ color: "#fff", fontSize: 13, marginTop: 6 }}>
                <span style={{fontWeight:500}}>Release:</span> {game.release}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopGamesPage;
