import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
/**
 * TopGamesPage displays top 10 game deals from CheapShark API in neon/arcade styled cards.
 * Users can refresh deals, see loading/error states, and browse games in a responsive grid.
 */
function TopGamesPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Neon/arcade style for card grid & elements
  const PAGE_STYLES = {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #060037 0%, #1f0043 100%)",
    padding: "112px 0 48px 0",
    fontFamily: "'Orbitron', 'Press Start 2P', 'Arial', sans-serif"
  };

  const headerStyle = {
    color: "#fffdc0",
    fontSize: "2.28rem",
    letterSpacing: 1,
    textAlign: "center",
    textShadow:
      "0 2px 20px #00fff0b0, 0 6px 42px #2522d5, 0 1px 0 #fff, 0 0 13px #78fff9"
  };

  const gridStyle = {
    margin: "0 auto",
    maxWidth: 1200,
    padding: "0 18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "34px",
    width: "100%"
  };

  const refreshBtnStyle = {
    display: "block",
    margin: "18px auto 26px auto",
    background: "linear-gradient(95deg, #1afffa 0%, #57fa65 100%)",
    color: "#031626",
    padding: "12px 34px",
    fontSize: "1.13rem",
    fontWeight: 900,
    border: "none",
    borderRadius: "7px",
    boxShadow: "0 0 6px #0ffed4a0, 0 3px 18px #48ffde55",
    cursor: "pointer",
    fontFamily: "'Orbitron', 'Press Start 2P', 'Arial', sans-serif",
    transition: "filter 0.18s, transform 0.16s",
    textShadow: "0 1px 3px #fff7"
  };

  // Small arcade badge for Hot Deal
  function HotDealBadge() {
    return (
      <span
        style={{
          background:
            "linear-gradient(87deg,#ffd600 0%,#ff506d 100%)",
          color: "#1f0043",
          fontWeight: 900,
          padding: "2px 13px",
          fontSize: "0.94rem",
          borderRadius: "16px",
          marginLeft: "12px",
          boxShadow: "0 0 6px #ff6cb2cc,0 2px 9px #fff9",
          letterSpacing: 0.8,
          textShadow: "none",
          border: "2.5px solid #f7f441aa",
          fontFamily: "'Orbitron', 'Arial', sans-serif"
        }}
      >
        🔥 Hot Deal
      </span>
    );
  }

  // Arcade card style
  function GameDealCard({ deal }) {
    const isHot = Number(deal.dealRating) >= 9;

    return (
      <div
        style={{
          background: "linear-gradient(117deg, #090055 0%, #133df5 100%)",
          borderRadius: "17px",
          boxShadow:
            "0 0 16px #18ffff89, 0 5px 36px #1ee2ff48, 0 1.5px 0 #7a58fa77",
          padding: "21px 16px 13px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "3.5px solid #20ffd433",
          position: "relative",
          transition: "transform 0.16s",
          minHeight: 320,
          maxWidth: 420
        }}
      >
        {/* Game Thumbnail */}
        <img
          src={deal.thumb}
          alt={deal.title}
          style={{
            width: 148,
            height: 80,
            objectFit: "cover",
            borderRadius: "9px",
            border: "2.5px solid #4df7e9a9",
            marginBottom: 16,
            boxShadow: "0 0 9px #23ffe7a7, 0 2px 8px #7370fc80"
          }}
        />
        {/* Game Title */}
        <div
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: "1.22rem",
            textAlign: "center",
            textShadow:
              "0 1px 10px #00fadc93,0 2.5px 7px #6b7cf37a,0 1.7px 0 #fff",
            marginBottom: 8,
            letterSpacing: 0.8,
            whiteSpace: "pre-line"
          }}
        >
          {deal.title}
        </div>
        {/* Price Section */}
        <div
          style={{ marginBottom: 8, display: "flex", alignItems: "end", gap: 10 }}
        >
          {/* Normal Price (crossed out) */}
          <span
            style={{
              color: "#f473b6",
              fontWeight: 700,
              textDecoration: "line-through",
              fontSize: "1.06rem",
              opacity: 0.7,
              textShadow: "0 0 6px #ffa9e7b7"
            }}
          >
            ${deal.normalPrice}
          </span>
          {/* Sale Price (bold) */}
          <span
            style={{
              color: "#21ffd6",
              fontWeight: 900,
              fontSize: "1.31rem",
              marginLeft: 2,
              textShadow: "0 0 12px #59fffdb1,0 1.5px 0 #fff6"
            }}
          >
            ${deal.salePrice}
          </span>
        </div>
        {/* Deal Rating */}
        <div
          style={{
            color: isHot ? "#ffd600" : "#d8fffe",
            fontWeight: 700,
            fontSize: "1.04rem",
            marginTop: 2,
            marginBottom: 2,
            letterSpacing: 0.7,
            textShadow: isHot
              ? "0 0 6px #ffd600, 0 2px 7px #fd3263"
              : "0 0 8px #0ff7, 0 2px 10px #52fffdaa"
          }}
        >
          Deal Rating: {deal.dealRating}
          {isHot && <HotDealBadge />}
        </div>
        {/* Store link */}
        <a
          href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            color: "#15f0ff",
            border: "2px solid #41ffc9",
            background: "rgba(26,255,206,0.03)",
            fontWeight: 900,
            fontSize: "1.01rem",
            padding: "6px 18px",
            marginTop: 15,
            borderRadius: "8px",
            boxShadow: "0 1.5px 6px #34fff918",
            textDecoration: "none",
            textShadow: "0 0 7px #00fff7c0, 0 1px 0 #fff9",
            letterSpacing: 0.6,
            transition: "filter 0.18s, background 0.19s"
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#081a26")}
          onMouseOut={e => (e.currentTarget.style.background = "rgba(26,255,206,0.03)")}
        >
          View Deal &rarr;
        </a>
      </div>
    );
  }

  // Fetch top deals from CheapShark API
  useEffect(() => {
    let ignore = false;
    async function fetchDeals() {
      setLoading(true);
      setError("");
      try {
        const apiUrl =
          "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=20&pageSize=10&sortBy=dealRating";
        const resp = await fetch(apiUrl);
        if (!resp.ok) throw new Error("Failed to fetch deals");
        const data = await resp.json();
        if (!ignore) setDeals(data.slice(0, 10));
      } catch (err) {
        setError("Something went wrong fetching deals. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchDeals();
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  // MAIN
  return (
    <div style={PAGE_STYLES}>
      <h2 style={headerStyle}>🎲 Top Game Deals</h2>
      <button
        type="button"
        style={refreshBtnStyle}
        onClick={() => setRefreshKey(prev => prev + 1)}
        aria-label="Refresh Deals"
      >
        🔄 Refresh Deals
      </button>
      {loading && (
        <div
          style={{
            color: "#15faff",
            fontWeight: 700,
            fontSize: "1.15rem",
            textAlign: "center",
            marginTop: 45,
            textShadow: "0 0 22px #00ffee99, 0 0 5px #fff8"
          }}
        >
          Loading deals...
        </div>
      )}
      {error && (
        <div
          style={{
            color: "#ff3c6c",
            fontWeight: 800,
            fontSize: "1.15rem",
            background: "rgba(255,80,151,0.08)",
            border: "2.5px solid #ff509733",
            borderRadius: "7px",
            padding: "16px 14px",
            textAlign: "center",
            margin: "30px auto 20px auto",
            maxWidth: 420,
            textShadow: "0 0 15px #ff824199"
          }}
        >
          {error}
        </div>
      )}
      {!loading && !error && (
        <div style={gridStyle}>
          {deals.length === 0 ? (
            <div style={{
              color: "#fff",
              fontSize: "1.19rem",
              padding: "28px 0",
              fontWeight: 700,
              textShadow: "0 0 10px #29fff479"
            }}>
              No deals found right now.
            </div>
          ) : (
            deals.map(deal => (
              <GameDealCard deal={deal} key={deal.dealID} />
            ))
          )}
        </div>
      )}
      {/* Inline font import for arcade style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Press+Start+2P&display=swap');
        @media (max-width: 900px) {
          h2 { font-size: 1.85rem !important; }
        }
        @media (max-width: 670px) {
          h2 { font-size: 1.2rem !important; }
        }
        /* Prevent card overflow on small screens */
        @media (max-width: 480px) {
          div[style*="min-height: 320px"] {
            min-height: 240px !important;
            padding: 10px 4px 12px 4px !important;
          }
        }
        /* Responsive font for deal price */
        @media (max-width: 430px) {
          span[style*="font-size: 1.31rem"] {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TopGamesPage;
