import './App.css';
import PFEList from './components/PFEList';
import Navbar from './components/Navbar';
import { useEffect, useState, useCallback } from 'react';

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((s) => (s === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main style={{ padding: '1rem' }}>
        <PFEList />
      </main>
    </div>
  );
}

export default App;
