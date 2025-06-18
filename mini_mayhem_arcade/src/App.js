import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import GamesPage from './ArcadeGamesPage';
import ArcadeNavBar from './ArcadeNavBar';
import BlockPuzzleGame from './BlockPuzzleGame';
import MemoryMatchGame from './MemoryMatchGame';
import MemoryPuzzleGame from './MemoryPuzzleGame';
import ReactionSpeedGame from './ReactionSpeedGame';
import WordTypingGame from './WordTypingGame';
import SudokuGame from './SudokuGame';
import SlidingTilePuzzleGame from './SlidingTilePuzzleGame';
import TopGamesPage from './TopGamesPage'; // Import TopGamesPage

// PUBLIC_INTERFACE
/**
 * Main application container for MiniMayhem Arcade.
 * Handles SPA routing with LandingPage (at "/") and GamesPage (at "/games").
 * Renders Navbar above all page components to provide a consistent navigation experience.
 */
function App() {
  return (
    <BrowserRouter>
      <div
        className="app"
        style={{
          color: '#ffffff'
        }}>
        <ArcadeNavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/block-puzzle" element={<BlockPuzzleGame />} />
          <Route path="/games/memory-match" element={<MemoryMatchGame />} />
          <Route path="/games/memory-puzzle" element={<MemoryPuzzleGame />} />
          <Route path="/games/reaction-speed" element={<ReactionSpeedGame />} />
          <Route path="/games/word-typing" element={<WordTypingGame />} />
          <Route path="/games/sudoku" element={<SudokuGame />} />
          <Route path="/games/sliding-puzzle" element={<SlidingTilePuzzleGame />} />
          <Route path="/top-games" element={<TopGamesPage />} /> {/* Route for TopGamesPage */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;