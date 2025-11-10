import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { useTranslation } from 'react-i18next';

export default function Navbar({ theme, toggleTheme }) {
  const { t, i18n } = useTranslation();
  const [dateTime, setDateTime] = useState(new Date());
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState(localStorage.getItem('lang') || i18n.language || 'fr');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
    try { localStorage.setItem('lang', lng); } catch (e) {}
  };

  const toggleProfile = () => setProfileOpen(p => !p);
  const closeProfile = () => setProfileOpen(false);

  useEffect(() => {
    function onDocClick(e) {
      const clickedInsideProfile = profileRef.current && profileRef.current.contains(e.target);
      const clickedInsideLang = langRef.current && langRef.current.contains(e.target);
      if (!clickedInsideProfile) setProfileOpen(false);
      if (!clickedInsideLang) setLangOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
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
              <div className="ph-sub">{t('brandSub')}</div>
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
              placeholder={t('searchPlaceholder')}
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


          <div className="ph-actions">
            <button className={`ph-theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`} onClick={toggleTheme} aria-label="Basculer thème">
              <span className="ph-toggle-knob" aria-hidden></span>
            </button>

            <div className="ph-lang-wrap" ref={langRef}>
              <button className="ph-lang-btn" onClick={() => setLangOpen(s => !s)} aria-haspopup="menu" aria-expanded={langOpen} aria-label="Choisir la langue">
                {lang.toUpperCase()}
              </button>
              {langOpen && (
                <div className="ph-lang-menu" role="menu" aria-label="Langues">
                  <button className="ph-lang-item" role="menuitem" onClick={() => { changeLanguage('fr'); setLangOpen(false); }}>FR</button>
                  <button className="ph-lang-item" role="menuitem" onClick={() => { changeLanguage('en'); setLangOpen(false); }}>EN</button>
                  <button className="ph-lang-item" role="menuitem" onClick={() => { changeLanguage('ar'); setLangOpen(false); }}>AR</button>
                </div>
              )}
            </div>

            <button className="ph-avatar" title={t('profile')} aria-label={t('profile')} onClick={toggleProfile} aria-haspopup="menu" aria-expanded={profileOpen}>
              AB
            </button>

            {profileOpen && (
              <div className="ph-profile-menu" ref={profileRef} role="menu" aria-label={t('profile')}>
                <button className="ph-profile-item" role="menuitem" onClick={() => { closeProfile(); console.log('Mon profil'); }}>{t('profileMenuProfile')}</button>
                <button className="ph-profile-item" role="menuitem" onClick={() => { closeProfile(); console.log('Paramètres'); }}>{t('profileMenuSettings')}</button>
                <div className="ph-profile-sep" />
                <button className="ph-profile-item ph-logout" role="menuitem" onClick={() => { closeProfile(); console.log('Logout'); }}>{t('profileMenuLogout')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
