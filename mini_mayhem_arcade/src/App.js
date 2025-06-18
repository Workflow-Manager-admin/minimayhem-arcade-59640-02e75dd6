import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import GamesPage from './ArcadeGamesPage';
import Navbar from './Navbar';
import BlockPuzzleGame from './BlockPuzzleGame';
import MemoryMatchGame from './MemoryMatchGame';

// PUBLIC_INTERFACE
/**
 * Main application container for MiniMayhem Arcade.
 * Handles SPA routing with LandingPage (at "/") and GamesPage (at "/games").
 * Renders Navbar above all page components to provide a consistent navigation experience.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/block-puzzle" element={<BlockPuzzleGame />} />
          <Route path="/games/memory-match" element={<MemoryMatchGame />} />
          {/* Future: more routes, e.g., <Route path="/top-games" element={<TopGamesPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;