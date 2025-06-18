import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

// PUBLIC_INTERFACE
/**
 * Main application container for MiniMayhem Arcade.
 * Renders the LandingPage (all-in-one): enhanced Navbar, hero, features, fun API, and footer.
 * Wrapped inside BrowserRouter for proper routing context.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <LandingPage />
      </div>
    </BrowserRouter>
  );
}

export default App;