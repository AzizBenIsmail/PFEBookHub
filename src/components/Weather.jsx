import React, { useState, useEffect } from 'react';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Position par défaut pour Tunis si la géolocalisation échoue
    const defaultPosition = { lat: 36.8065, lon: 10.1815 };

    async function fetchWeather(position) {
      try {
        const { lat, lon } = position;
        // Remplacez API_KEY par votre clé OpenWeatherMap
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
        );
        if (!response.ok) throw new Error('Erreur météo');
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon
        });
      } catch (error) {
        console.error('Erreur météo:', error);
      } finally {
        setLoading(false);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }),
        () => fetchWeather(defaultPosition)
      );
    } else {
      fetchWeather(defaultPosition);
    }

    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(
        (position) => fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }),
        () => fetchWeather(defaultPosition)
      );
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="ph-weather">Chargement...</div>;
  if (!weather) return null;

  return (
    <div className="ph-weather">
      <img 
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.description}
        width="30"
        height="30"
      />
      <span>{weather.temp}°C</span>
    </div>
  );
}