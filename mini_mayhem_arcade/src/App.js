import React from 'react';
import './App.css';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';

// PUBLIC_INTERFACE
/**
 * Main application container for MiniMayhem Arcade.
 * Renders the Navbar at the top and displays the main content below.
 * Wrapped inside BrowserRouter for proper routing context.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main style={{ paddingTop: 76 }}>
          <div className="container">
            <div className="hero">
              <div className="subtitle">AI Workflow Manager Template</div>
              <h1 className="title">mini_mayhem_arcade</h1>
              <div className="description">
                Start building your application.
              </div>
              <button className="btn btn-large">Button</button>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;