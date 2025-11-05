import React, { useState, useEffect } from 'react';
import Weather from './Weather';
import './Navbar.css';

export default function Navbar({ theme, toggleTheme }) {
  const [dateTime, setDateTime] = useState(new Date());
  const [query, setQuery] = useState('');

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
      minute: '2-digit'
    });
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    // For now just log; parent can wire search via props later
    console.log('Recherche:', query);
  };

  return (
    <header className="ph-navbar">
      <div className="ph-nav-inner">
        <div className="ph-left">
          <div className="ph-brand">
            <span className="ph-logo" aria-hidden></span>
            <div className="ph-brand-text">
              <div className="ph-title">PFE Book Hub</div>
              <div className="ph-sub">Bibliothèque des PFE</div>
            </div>
          </div>
        </div>

        <div className="ph-center">
          <form className="ph-search" onSubmit={onSearchSubmit} role="search" aria-label="Recherche de PFE">
            <button type="submit" className="ph-search-btn" aria-label="Rechercher">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <input
              className="ph-search-input"
              type="search"
              placeholder="Rechercher un sujet, auteur ou mot-clé..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="ph-right">
          <div className="ph-datetime">
            <div className="ph-date">{formatDate(dateTime)}</div>
            <div className="ph-time">{formatTime(dateTime)}</div>
          </div>

          <div className="ph-weather-wrap">
            <Weather />
          </div>

          <div className="ph-actions">
            <button className={`ph-theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`} onClick={toggleTheme} aria-label="Basculer thème">
              <span className="ph-toggle-knob" aria-hidden></span>
            </button>

            <div className="ph-avatar" title="Profil utilisateur" aria-hidden>
              AB
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
