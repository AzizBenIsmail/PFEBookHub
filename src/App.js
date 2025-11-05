import './App.css';
import PFEList from './components/PFEList';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import { useEffect, useState, useCallback } from 'react';

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      // Vérifier d'abord le localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      
      // Sinon, vérifier les préférences système
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      // Par défaut : dark
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

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) { // Ne change que si pas de préférence explicite
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
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
