import './App.css';
import PFEList from './components/PFEList';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import { useEffect, useState, useCallback } from 'react';

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      // Si l'utilisateur a déjà choisi, respecter sa préférence
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;

      // Sinon, forcer le mode dark par défaut
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    // Appliquer le thème
    applyTheme(theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}

    // Écouter les changements de préférence système seulement si l'utilisateur
    // n'a pas défini de préférence explicite dans localStorage.
    try {
      const saved = localStorage.getItem('theme');
      if (!saved && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');

        // Compatibilité addEventListener / addListener
        if (typeof mediaQuery.addEventListener === 'function') {
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        } else if (typeof mediaQuery.addListener === 'function') {
          mediaQuery.addListener(handleChange);
          return () => mediaQuery.removeListener(handleChange);
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((s) => (s === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Profile />
      <main>
        <PFEList />
      </main>
    </div>
  );
}

export default App;
