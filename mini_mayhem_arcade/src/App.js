import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import GamesPage from './GamesPage';

// PUBLIC_INTERFACE
/**
 * Main application container for MiniMayhem Arcade.
 * Handles SPA routing with LandingPage (at "/") and GamesPage (at "/games").
 * The Navbar links and SPA navigation are enabled for seamless client-side transitions.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/games" element={<GamesPage />} />
          {/* Future: more routes, e.g., <Route path="/top-games" element={<TopGamesPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;