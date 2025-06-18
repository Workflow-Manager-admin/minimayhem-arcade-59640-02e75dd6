import React from 'react';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Landing Page for MiniMayhem Arcade.
 * Features: Vibrant title, introductory description, "Play Now" button, and quick sections highlighting trending games, scoreboard, and fun extras.
 * Acts as the welcoming entry point to the arcade experience.
 */
function LandingPage() {
  return (
    <div className="container landing-page">
      <h1 className="title arcade-title">MiniMayhem Arcade</h1>
      <h2 className="subtitle">Play, Compete, and Enjoy Mini Games!</h2>
      <p className="description">
        Welcome to your retro gaming playground. Jump into a world of bite-sized arcade action—challenge yourself, score big, and make your way to the leaderboard!
      </p>
      <a href="/games" className="btn btn-large" style={{ display: 'inline-block', textDecoration: 'none' }}>
        🎮 Play Now
      </a>

      {/* Trending Games Section */}
      <section className="trending-section" style={{ marginTop: '2.5rem' }}>
        <h3 className="trending-title">🔥 Trending Games</h3>
        <ul className="trending-list">
          <li className="trending-item">Block Puzzle</li>
          <li className="trending-item">Word Typing</li>
          <li className="trending-item">Memory Match</li>
        </ul>
      </section>

      {/* Scoreboard Preview */}
      <section className="scoreboard" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h3 className="score-title">🏆 Top Scores</h3>
        <ul className="score-list">
          <li className="score-item">
            <span>Alex</span>
            <span>1200</span>
          </li>
          <li className="score-item">
            <span>Jordan</span>
            <span>1090</span>
          </li>
          <li className="score-item">
            <span>Sam</span>
            <span>970</span>
          </li>
        </ul>
      </section>

      {/* Fun Extras */}
      <section className="fun-extras">
        <h3 className="fun-title">✨ Fun Arcade Fact</h3>
        <div className="fun-content">
          The longest pinball game on record lasted over 27 hours. How long can you play MiniMayhem?
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
