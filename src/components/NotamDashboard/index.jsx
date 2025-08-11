import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fetchNotamData, searchNotams, fetchDetailedNotam } from '../../services/notamService';
import { 
  initializeMap, 
  plotNotamsOnMap, 
  clearMap, 
  highlightNotamOnMap,
  drawNotamGeometry
} from '../../utils/notamUtils';
import NotamDetail from './NotamDetail';
import NotamFilters from './NotamFilters';
import NotamList from './NotamList';
import NotamSearch from './NotamSearch';
import NotamStats from './NotamStats';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import './NotamDashboard.css';

const NotamDashboard = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { token, refreshToken } = useAuth();
  
  const [notamData, setNotamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNotam, setSelectedNotam] = useState(null);
  const [detailedNotam, setDetailedNotam] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byRegion: {},
    activeToday: 0
  });
  
  const [filters, setFilters] = useState({
    region: 'all',
    type: 'all',
    dateRange: 'current',
    minAltitude: 0,
    maxAltitude: 60000,
    searchTerm: ''
  });
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current) {
      const map = initializeMap(mapContainerRef.current);
      mapInstanceRef.current = map;
      
      return () => {
        clearMap(map);
      };
    }
  }, []);
  
  // Fetch NOTAM data when filters change or when token refreshes
  const loadNotams = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNotamData(filters, token);
      setNotamData(data);
      
      // Calculate statistics
      const statData = {
        total: data.length,
        byType: {},
        byRegion: {},
        activeToday: 0
      };
      
      const today = new Date();
      
      data.forEach(notam => {
        // Count by type
        statData.byType[notam.type] = (statData.byType[notam.type] || 0) + 1;
        
        // Count by region
        const region = notam.location.substring(0, 1);
        statData.byRegion[region] = (statData.byRegion[region] || 0) + 1;
        
        // Count active today
        const effectiveDate = new Date(notam.effectiveDate);
        if (effectiveDate <= today && (!notam.expiryDate || new Date(notam.expiryDate) >= today)) {
          statData.activeToday++;
        }
      });
      
      setStats(statData);
      
      // Plot NOTAMs on the map
      if (mapInstanceRef.current) {
        plotNotamsOnMap(mapInstanceRef.current, data);
      }
    } catch (err) {
      console.error('Error fetching NOTAM data:', err);
      setError('Failed to load NOTAM data. Please try again later.');
      
      // Handle authentication errors
      if (err.status === 401 || err.status === 403) {
        // This will trigger a token refresh in your auth context
        refreshToken();
      }
    } finally {
      setLoading(false);
    }
  }, [filters, token, refreshToken]);
  
  useEffect(() => {
    loadNotams();
  }, [loadNotams]);
  
  // Load detailed NOTAM when one is selected
  useEffect(() => {
    if (!selectedNotam || !token) return;
    
    const loadDetailedNotam = async () => {
      setDetailLoading(true);
      
      try {
        const detail = await fetchDetailedNotam(selectedNotam.id, token);
        setDetailedNotam(detail);
        
        // Highlight the selected NOTAM on the map
        if (mapInstanceRef.current) {
          highlightNotamOnMap(mapInstanceRef.current, selectedNotam.id);
          
          // Draw NOTAM geometry if available
          if (detail.geometry) {
            drawNotamGeometry(mapInstanceRef.current, detail.geometry);
          }
        }
      } catch (err) {
        console.error('Error fetching NOTAM details:', err);
        setError('Failed to load NOTAM details. Please try again later.');
      } finally {
        setDetailLoading(false);
      }
    };
    
    loadDetailedNotam();
  }, [selectedNotam, token]);
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Clear selected NOTAM when filters change
    setSelectedNotam(null);
    setDetailedNotam(null);
  };
  
  // Handle search
  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim() === filters.searchTerm) return;
    
    handleFilterChange('searchTerm', searchTerm);
    
    if (searchTerm.trim().length > 2) {
      setLoading(true);
      try {
        const results = await searchNotams(searchTerm, token);
        setNotamData(results);
        
        // Update map with search results
        if (mapInstanceRef.current) {
          plotNotamsOnMap(mapInstanceRef.current, results);
        }
      } catch (err) {
        console.error('Error searching NOTAMs:', err);
        setError('Search failed. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else if (searchTerm.trim().length === 0) {
      // Reset to normal filtered view if search is cleared
      loadNotams();
    }
  };
  
  // Select a NOTAM for detailed view
  const selectNotam = (notam) => {
    setSelectedNotam(notam);
  };
  
  // Close detailed view
  const closeDetail = () => {
    setSelectedNotam(null);
    setDetailedNotam(null);
    
    // Reset map highlights
    if (mapInstanceRef.current) {
      // Remove geometry overlays
      mapInstanceRef.current.eachLayer(layer => {
        if (layer.options && layer.options.isNotamGeometry) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      
      // Replot all NOTAMs without highlights
      plotNotamsOnMap(mapInstanceRef.current, notamData);
    }
  };
  
  // Refresh data
  const handleRefresh = () => {
    loadNotams();
  };
  
  return (
    <div className="notam-dashboard">
      <div className="notam-dashboard-header">
        <h2>NOTAM Dashboard</h2>
        <div className="notam-actions">
          <NotamSearch onSearch={handleSearch} />
          <button className="refresh-button" onClick={handleRefresh}>
            Refresh Data
          </button>
        </div>
      </div>
      
      <div className="notam-dashboard-content">
        <div className="notam-sidebar">
          <NotamFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
          <NotamStats stats={stats} />
        </div>
        
        <div className="notam-main-content">
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          
          <div className="map-container" ref={mapContainerRef}>
            {loading && <LoadingIndicator />}
          </div>
          
          <NotamList 
            notams={notamData} 
            loading={loading} 
            selectedId={selectedNotam?.id} 
            onSelectNotam={selectNotam} 
          />
        </div>
        
        {selectedNotam && (
          <NotamDetail 
            notam={detailedNotam || selectedNotam} 
            loading={detailLoading} 
            onClose={closeDetail} 
          />
        )}
      </div>
    </div>
  );
};

export default NotamDashboard;
