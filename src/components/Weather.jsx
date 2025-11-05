import React, { useState, useEffect, useCallback } from 'react';

// Valeur par défaut hors du composant pour être stable entre rendus
const DEFAULT_POSITION = { lat: 36.8065, lon: 10.1815 };

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || null;

  // Position par défaut pour Tunis si la géolocalisation échoue

  const fetchWeather = useCallback(async (position) => {
    try {
      setError(null);
      setLoading(true);
      const { lat, lon } = position;
      if (!API_KEY) throw new Error('No API key provided for weather');

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error('Erreur météo');
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon
      });
    } catch (err) {
      console.error('Erreur météo:', err);
      setError(String(err?.message || err));
      setWeather((w) => w || { temp: null, description: 'Indisponible', icon: '01d' });
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  useEffect(() => {
    // If no API key is provided, show a development fallback or surface an error
    if (!API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        setWeather({ temp: 22, description: 'Dev - clé manquante', icon: '01d' });
        setLoading(false);
        return;
      } else {
        setError('No API key provided for weather');
        setLoading(false);
        return;
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
        () => fetchWeather(DEFAULT_POSITION)
      );
    } else {
  fetchWeather(DEFAULT_POSITION);
    }

    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
          () => fetchWeather(DEFAULT_POSITION)
        );
      } else {
        fetchWeather(DEFAULT_POSITION);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather, API_KEY]);

  // Always render a small widget so navbar layout stays stable
  if (loading) return <div className="ph-weather">Chargement...</div>;

  const tempText = weather && typeof weather.temp === 'number' ? `${weather.temp}°C` : '—°C';
  const desc = weather?.description || (error ? 'Erreur' : 'Indisponible');

  return (
    <div className="ph-weather" title={desc} aria-live="polite">
      {weather?.icon ? (
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
          alt={desc}
          width="30"
          height="30"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <span style={{display:'inline-block', width:30, height:30}} aria-hidden />
      )}
      <span style={{marginLeft:8}}>{tempText}</span>
      {error && (
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            // retry using default position
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${DEFAULT_POSITION.lat}&lon=${DEFAULT_POSITION.lon}&units=metric&lang=fr&appid=${API_KEY}`)
              .then((r) => r.json())
              .then((data) => setWeather({ temp: Math.round(data.main.temp), description: data.weather[0].description, icon: data.weather[0].icon }))
              .catch((e) => setError(String(e?.message || e)))
              .finally(() => setLoading(false));
          }}
          title="Réessayer la météo"
          style={{marginLeft:8, background:'transparent', border:0, color:'var(--muted)', cursor:'pointer'}}
          aria-label="Réessayer la météo"
        >↻</button>
      )}
    </div>
  );
}