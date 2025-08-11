import React, { useEffect, useRef, useState } from 'react';
import { fetchNotamData } from '../../services/notamService';
import { initializeMap, plotNotamsOnMap, clearMap } from '../../utils/notamUtils';
import './NotamDashboard.css';

const NotamDashboard = () => {
  const mapContainerRef = useRef(null);
  const [notamData, setNotamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: 'all',
    type: 'all',
    dateRange: 'current'
  });
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current) {
      const map = initializeMap(mapContainerRef.current);
      
      // Store map reference for cleanup
      return () => {
        clearMap(map);
      };
    }
  }, []);
  
  // Fetch NOTAM data and update when filters change
  useEffect(() => {
    const loadNotamData = async () => {
      setLoading(true);
      try {
        const data = await fetchNotamData(filters);
        setNotamData(data);
        setError(null);
        
        // Plot NOTAMs on the map
        if (mapContainerRef.current) {
          plotNotamsOnMap(mapContainerRef.current, data);
        }
      } catch (err) {
        console.error('Error fetching NOTAM data:', err);
        setError('Failed to load NOTAM data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNotamData();
  }, [filters]);
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  return (
    <div className="notam-dashboard">
      <div className="notam-controls">
        <h2>NOTAM Dashboard</h2>
        
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="region-filter">Region:</label>
            <select 
              id="region-filter" 
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="north-america">North America</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="africa">Africa</option>
              <option value="oceania">Oceania</option>
              <option value="south-america">South America</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="type-filter">NOTAM Type:</label>
            <select 
              id="type-filter" 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="obstacle">Obstacle</option>
              <option value="airspace">Airspace</option>
              <option value="procedure">Procedure</option>
              <option value="navaid">Navaid</option>
              <option value="airport">Airport</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="date-filter">Date Range:</label>
            <select 
              id="date-filter" 
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="current">Current</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="map-container" ref={mapContainerRef}></div>
      
      <div className="notam-list">
        <h3>NOTAM List {loading && <span className="loading-indicator">Loading...</span>}</h3>
        {notamData.length === 0 && !loading ? (
          <p>No NOTAMs found matching your criteria.</p>
        ) : (
          <table className="notam-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Type</th>
                <th>Effective Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {notamData.map(notam => (
                <tr key={notam.id} onClick={() => highlightNotam(notam.id)}>
                  <td>{notam.id}</td>
                  <td>{notam.location}</td>
                  <td>{notam.type}</td>
                  <td>{notam.effectiveDate}</td>
                  <td className="notam-description">{notam.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Function to highlight a selected NOTAM on the map
const highlightNotam = (notamId) => {
  // Implementation would interact with the map to highlight the selected NOTAM
  console.log(`Highlighting NOTAM: ${notamId}`);
};

export default NotamDashboard;
