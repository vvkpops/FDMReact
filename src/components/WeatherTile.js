import React, { useState, useEffect } from 'react';
import { parseVisibility, checkMinima } from '../utils/weatherUtils';

const WeatherTile = ({ 
  icao, 
  weatherMinima, 
  globalWeatherMinima, 
  setWeatherMinima, 
  resetWeatherMinima, 
  removeWeatherICAO 
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current minima (flight-specific or global)
  const currentMinima = weatherMinima[icao] || globalWeatherMinima;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Replace with your actual weather API call
        const response = await fetch(`/api/weather/${icao}`);
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch weather for ${icao}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [icao]);

  if (loading) {
    return (
      <div className="flight-tile">
        <div className="text-center">Loading {icao}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flight-tile border-red-500">
        <button 
          className="weather-remove-btn"
          onClick={() => removeWeatherICAO(icao)}
        >
          ✕
        </button>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  // Check minima compliance
  const minimaCheck = checkMinima(
    {
      ceiling: weatherData?.ceiling,
      visibility: weatherData?.visibility
    },
    currentMinima
  );

  const tileClass = `flight-tile ${
    !minimaCheck.overallMet ? 'border-red-500 bg-red-900/20' : 'border-green-500'
  }`;

  return (
    <div className={tileClass}>
      <button 
        className="weather-remove-btn"
        onClick={() => removeWeatherICAO(icao)}
      >
        ✕
      </button>
      
      <div className="flight-title text-center mb-2">{icao}</div>
      
      {/* Current Conditions */}
      <div className="mb-3">
        <div className="text-sm font-semibold mb-1">Current Conditions:</div>
        <div className="text-xs space-y-1">
          <div className={`flex justify-between ${!minimaCheck.ceilingMet ? 'text-red-400' : 'text-green-400'}`}>
            <span>Ceiling:</span>
            <span>{weatherData?.ceiling || 'N/A'}</span>
          </div>
          <div className={`flex justify-between ${!minimaCheck.visibilityMet ? 'text-red-400' : 'text-green-400'}`}>
            <span>Visibility:</span>
            <span>{weatherData?.visibility || 'N/A'} SM</span>
          </div>
          <div className="flex justify-between">
            <span>Wind:</span>
            <span>{weatherData?.wind || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Temp:</span>
            <span>{weatherData?.temperature || 'N/A'}°C</span>
          </div>
        </div>
      </div>

      {/* Minima Section */}
      <div className="mb-2">
        <div className="text-sm font-semibold mb-1">Minima:</div>
        <div className="flex gap-2 text-xs">
          <div className="flex-1">
            <label className="block text-xs">Ceiling:</label>
            <input
              type="number"
              value={currentMinima.ceiling}
              onChange={(e) => setWeatherMinima(icao, 'ceiling', e.target.value)}
              className="w-full bg-gray-700 p-1 rounded text-center text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs">Visibility:</label>
            <input
              type="number"
              step="0.1"
              value={currentMinima.vis}
              onChange={(e) => setWeatherMinima(icao, 'vis', e.target.value)}
              className="w-full bg-gray-700 p-1 rounded text-center text-xs"
            />
          </div>
        </div>
        
        {weatherMinima[icao] && (
          <button 
            onClick={() => resetWeatherMinima(icao)}
            className="minima-reset-btn"
          >
            Reset to Global
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className={`text-center text-sm font-bold ${
        minimaCheck.overallMet ? 'text-green-400' : 'text-red-400'
      }`}>
        {minimaCheck.overallMet ? '✅ Above Minima' : '❌ Below Minima'}
      </div>

      {/* Debug info (optional) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1">
          Parsed: C:{minimaCheck.parsedCeiling} V:{minimaCheck.parsedVisibility}
        </div>
      )}
    </div>
  );
};

export default WeatherTile;
