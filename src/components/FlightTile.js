import React from 'react';
import { parseVisibility, checkMinima } from '../utils/weatherUtils';

const FlightTile = ({ 
  flight, 
  dashboardMinima, 
  globalDashboardMinima, 
  setDashboardMinima, 
  resetDashboardMinima, 
  toggleAlt, 
  setAlternate, 
  addWeatherICAOFromTile 
}) => {
  // Get current minima for this flight
  const currentMinima = dashboardMinima[flight.callsign] || globalDashboardMinima;
  
  // Determine which airport to check based on toggle
  const targetIcao = toggleAlt[flight.callsign] ? flight.alticao : flight.arricao;
  
  // Get weather data for the target airport
  // This should come from your weather data source
  const weatherData = flight.weather?.[targetIcao] || {};
  
  // Check minima compliance
  const minimaCheck = checkMinima(
    {
      ceiling: weatherData.ceiling,
      visibility: weatherData.visibility
    },
    currentMinima
  );

  // Calculate flight progress
  const now = new Date();
  const start = new Date(flight.std);
  const end = new Date(flight.eta);
  const totalDuration = end - start;
  const elapsed = Math.max(0, now - start);
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Determine flight status
  const isActive = start <= now && now <= end;
  const isCompleted = now > end;
  const isScheduled = start > now;

  const tileClass = `flight-tile ${
    !minimaCheck.overallMet ? 'border-red-500 bg-red-900/20' : ''
  }`;

  return (
    <div className={tileClass}>
      <div className="flight-title text-center mb-2">{flight.callsign}</div>
      
      {/* Flight Times */}
      <div className="flex justify-around text-sm mb-2">
        <div>STD: {flight.std.slice(11, 16)}Z</div>
        <div>STA: {flight.sta.slice(11, 16)}Z</div>
        <div>ETA: {flight.eta.slice(11, 16)}Z</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded h-2 mb-2">
        <div 
          className={`h-2 rounded transition-all duration-1000 ${
            isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-500'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Route Information */}
      <div className="flex justify-between text-xs mb-2 font-bold">
        <div>{flight.depicao} (DEP)</div>
        <div>{flight.arricao} (ARR)</div>
      </div>
      <div className="text-xs mb-3 font-bold">Alternate: {flight.alticao}</div>

      {/* Airport Toggle */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex bg-gray-700 rounded-full p-1">
          <span 
            onClick={() => setAlternate(flight.callsign, false)} 
            className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${
              !toggleAlt[flight.callsign] ? 'bg-purple-600 text-white' : 'text-gray-300'
            }`}
          >
            {flight.arricao}
          </span>
          <span 
            onClick={() => setAlternate(flight.callsign, true)} 
            className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${
              toggleAlt[flight.callsign] ? 'bg-purple-600 text-white' : 'text-gray-300'
            }`}
          >
            {flight.alticao}
          </span>
        </div>
      </div>

      {/* Weather Information */}
      <div className="mb-3">
        <div className="text-sm font-semibold mb-1">
          Weather ({targetIcao}):
          <button 
            onClick={() => addWeatherICAOFromTile(targetIcao)}
            className="ml-2 text-blue-400 hover:text-blue-300"
            title="Add to Weather Monitor"
          >
            📊
          </button>
        </div>
        
        {weatherData && Object.keys(weatherData).length > 0 ? (
          <div className="text-xs space-y-1">
            <div className={`flex justify-between ${!minimaCheck.ceilingMet ? 'text-red-400' : 'text-green-400'}`}>
              <span>Ceiling:</span>
              <span>{weatherData.ceiling || 'N/A'}</span>
            </div>
            <div className={`flex justify-between ${!minimaCheck.visibilityMet ? 'text-red-400' : 'text-green-400'}`}>
              <span>Visibility:</span>
              <span>{weatherData.visibility || 'N/A'} SM</span>
            </div>
            <div className="flex justify-between">
              <span>Wind:</span>
              <span>{weatherData.wind || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400">No weather data available</div>
        )}
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
              onChange={(e) => setDashboardMinima(flight.callsign, 'ceiling', e.target.value)}
              className="w-full bg-gray-700 p-1 rounded text-center text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs">Visibility:</label>
            <input
              type="number"
              step="0.1"
              value={currentMinima.vis}
              onChange={(e) => setDashboardMinima(flight.callsign, 'vis', e.target.value)}
              className="w-full bg-gray-700 p-1 rounded text-center text-xs"
            />
          </div>
        </div>
        
        {dashboardMinima[flight.callsign] && (
          <button 
            onClick={() => resetDashboardMinima(flight.callsign)}
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
    </div>
  );
};

export default FlightTile;
