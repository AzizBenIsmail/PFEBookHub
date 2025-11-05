import React from 'react';
import './Navbar.css';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <header className="ph-navbar">
      <div className="ph-nav-inner">
        <div className="ph-brand">PFE Book Hub</div>
        <div className="ph-actions">
          <button className="ph-theme-toggle" onClick={toggleTheme} aria-label="Basculer thème">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
