import React, { useState, useEffect } from 'react';
import Weather from './Weather';
import './Navbar.css';

export default function Navbar({ theme, toggleTheme }) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    // Mettre à jour chaque seconde
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="ph-navbar">
      <div className="ph-nav-inner">
        <div className="ph-brand">PFE Book Hub</div>
        <div className="ph-info">
          <div className="ph-datetime">
            <div className="ph-date">{formatDate(dateTime)}</div>
            <div className="ph-time">{formatTime(dateTime)}</div>
          </div>
          <Weather />
        </div>
        <div className="ph-actions">
          <button className="ph-theme-toggle" onClick={toggleTheme} aria-label="Basculer thème">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
