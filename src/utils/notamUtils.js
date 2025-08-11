/**
 * Utilities for NOTAM map functionality
 * Migrated from NotamOriginal project
 */

// Map instance reference
let markers = [];
let activeHighlight = null;
let geometryLayers = [];

/**
 * Initialize the map in the specified container
 * @param {HTMLElement} container - The DOM element to initialize the map in
 * @returns {Object} The map instance
 */
export const initializeMap = (container) => {
  // Using Leaflet for mapping
  if (typeof L !== 'undefined') {
    // Create a new map instance
    const map = L.map(container, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true
    });
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add scale control
    L.control.scale({
      imperial: true,
      metric: true,
      position: 'bottomleft'
    }).addTo(map);
    
    return map;
  } else {
    // Fallback if Leaflet is not available
    console.error('Leaflet library not loaded. Map functionality will not work.');
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#e8e8e8;"><p>Map unavailable - Leaflet library not loaded</p></div>';
    
    // Return a minimal mock implementation
    return {
      setView: () => {},
      addLayer: () => {},
      removeLayer: () => {},
      eachLayer: () => {},
      remove: () => { container.innerHTML = ''; }
    };
  }
};

/**
 * Plot NOTAM data on the map
 * @param {Object} map - The map instance
 * @param {Array} notams - Array of NOTAM objects to display
 */
export const plotNotamsOnMap = (map, notams) => {
  clearMarkers(map);
  
  // Implementation for Leaflet
  if (typeof L !== 'undefined') {
    // Create marker clusters if available
    const markerCluster = L.markerClusterGroup ? 
      L.markerClusterGroup({
        disableClusteringAtZoom: 10,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
      }) : 
      { addLayer: (layer) => layer.addTo(map), addTo: () => {} };
    
    notams.forEach(notam => {
      if (notam.coordinates) {
        const { lat, lng } = notam.coordinates;
        
        // Create icon based on NOTAM type
        const icon = createNotamIcon(notam.type);
        
        const marker = L.marker([lat, lng], { icon }).bindPopup(
          createNotamPopupContent(notam)
        );
        
        // Store reference to the notam in the marker
        marker.notamId = notam.id;
        
        // Add to cluster or directly to map
        markerCluster.addLayer(marker);
        markers.push(marker);
      }
    });
    
    // Add the cluster group to the map if using clustering
    markerCluster.addTo(map);
    
    // If we have markers, fit the map to show all of them
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }
};

/**
 * Create a custom icon based on NOTAM type
 * @param {string} type - The NOTAM type
 * @returns {Object} - A Leaflet icon
 */
const createNotamIcon = (type) => {
  if (typeof L === 'undefined') return null;
  
  // Define colors for different NOTAM types
  const colors = {
    obstacle: '#c62828',
    airspace: '#2e7d32',
    procedure: '#1565c0',
    navaid: '#f57f17',
    airport: '#7b1fa2',
    default: '#333333'
  };
  
  const color = colors[type] || colors.default;
  
  // Create a custom divIcon
  return L.divIcon({
    className: `notam-marker notam-marker-${type}`,
    html: `<div style="background-color:${color}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

/**
 * Create HTML content for a NOTAM popup
 * @param {Object} notam - The NOTAM object
 * @returns {string} - HTML content for the popup
 */
const createNotamPopupContent = (notam) => {
  const effectiveDate = new Date(notam.effectiveDate).toLocaleString();
  const expiryDate = notam.expiryDate 
    ? new Date(notam.expiryDate).toLocaleString()
    : 'Permanent';
  
  return `
    <div class="notam-popup">
      <h4>${notam.id}</h4>
      <p><strong>Location:</strong> ${notam.location}</p>
      <p><strong>Type:</strong> <span class="notam-type type-${notam.type}">${notam.type}</span></p>
      <p><strong>Effective:</strong> ${effectiveDate}</p>
      <p><strong>Expires:</strong> ${expiryDate}</p>
      <p>${notam.description}</p>
      <button class="view-details-btn" onclick="window.viewNotamDetails('${notam.id}')">
        View Details
      </button>
    </div>
  `;
};

/**
 * Highlight a specific NOTAM on the map
 * @param {Object} map - The map instance
 * @param {string} notamId - The ID of the NOTAM to highlight
 */
export const highlightNotamOnMap = (map, notamId) => {
  // Clear any existing highlight
  if (activeHighlight) {
    map.removeLayer(activeHighlight);
    activeHighlight = null;
  }
  
  // Find the marker for the selected NOTAM
  const marker = markers.find(m => m.notamId === notamId);
  
  if (marker && marker.getLatLng) {
    // Center the map on the marker
    map.setView(marker.getLatLng(), 10);
    
    // Create a highlight circle
    activeHighlight = L.circle(marker.getLatLng(), {
      color: '#f03',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: 5000 // 5km radius
    }).addTo(map);
    
    // Open the popup
    marker.openPopup();
  }
};

/**
 * Draw NOTAM geometry on the map
 * @param {Object} map - The map instance
 * @param {Object} geometry - The geometry object (GeoJSON-like)
 */
export const drawNotamGeometry = (map, geometry) => {
  // Clear any existing geometry layers
  clearGeometryLayers(map);
  
  if (typeof L === 'undefined') return;
  
  let layer;
  
  switch (geometry.type) {
    case 'circle':
      layer = L.circle([geometry.center.lat, geometry.center.lng], {
        radius: geometry.radius * 1852, // Convert nautical miles to meters
        color: '#f03',
        weight: 2,
        fillColor: '#f03',
        fillOpacity: 0.2,
        isNotamGeometry: true
      });
      break;
      
    case 'polygon':
      layer = L.polygon(geometry.coordinates, {
        color: '#f03',
        weight: 2,
        fillColor: '#f03',
        fillOpacity: 0.2,
        isNotamGeometry: true
      });
      break;
      
    case 'line':
      layer = L.polyline(geometry.coordinates, {
        color: '#f03',
        weight: 3,
        isNotamGeometry: true
      });
      break;
      
    default:
      console.warn(`Unsupported geometry type: ${geometry.type}`);
      return;
  }
  
  if (layer) {
    layer.addTo(map);
    geometryLayers.push(layer);
    
    // Fit the map to show the geometry
    map.fitBounds(layer.getBounds(), { padding: [50, 50] });
  }
};

/**
 * Clear all geometry layers from the map
 * @param {Object} map - The map instance
 */
const clearGeometryLayers = (map) => {
  geometryLayers.forEach(layer => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  
  geometryLayers = [];
};

/**
 * Clear all markers from the map
 * @param {Object} map - The map instance
 */
const clearMarkers = (map) => {
  markers.forEach(marker => {
    if (map.hasLayer(marker)) {
      map.removeLayer(marker);
    }
  });
  
  if (activeHighlight && map.hasLayer(activeHighlight)) {
    map.removeLayer(activeHighlight);
    activeHighlight = null;
  }
  
  clearGeometryLayers(map);
  markers = [];
};

/**
 * Clear the map and remove it from the container
 * @param {Object} map - The map instance to clear
 */
export const clearMap = (map) => {
  clearMarkers(map);
  
  if (map && typeof map.remove === 'function') {
    map.remove();
  }
};

// Set up global function for popup buttons to access
window.viewNotamDetails = function(notamId) {
  // This will be connected to your application's event system
  const event = new CustomEvent('viewNotamDetails', { detail: { notamId } });
  document.dispatchEvent(event);
};
