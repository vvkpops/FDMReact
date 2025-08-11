/**
 * Utilities for NOTAM map functionality
 * Migrated from NotamOriginal project
 */

// Map instance reference
let mapInstance = null;
let markers = [];

/**
 * Initialize the map in the specified container
 * @param {HTMLElement} container - The DOM element to initialize the map in
 * @returns {Object} The map instance
 */
export const initializeMap = (container) => {
  // This implementation will depend on what mapping library you're using
  // For example, if using Leaflet:
  if (typeof L !== 'undefined') {
    // Clear existing map if any
    if (mapInstance) {
      mapInstance.remove();
    }
    
    // Create a new map instance
    mapInstance = L.map(container).setView([20, 0], 2);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    return mapInstance;
  } 
  // For Google Maps:
  else if (typeof google !== 'undefined' && google.maps) {
    mapInstance = new google.maps.Map(container, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    });
    
    return mapInstance;
  }
  // Fallback for demo purposes
  else {
    console.warn('No mapping library detected. Using fallback implementation.');
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#e8e8e8;"><p>Map Placeholder - Include mapping library</p></div>';
    
    // Return a minimal mock implementation
    mapInstance = {
      setView: () => {},
      addLayer: () => {},
      remove: () => { container.innerHTML = ''; }
    };
    
    return mapInstance;
  }
};

/**
 * Plot NOTAM data on the map
 * @param {HTMLElement} container - The map container element
 * @param {Array} notams - Array of NOTAM objects to display
 */
export const plotNotamsOnMap = (container, notams) => {
  clearMarkers();
  
  if (!mapInstance) {
    mapInstance = initializeMap(container);
  }
  
  // Implementation depends on the mapping library
  // Example for Leaflet:
  if (typeof L !== 'undefined') {
    notams.forEach(notam => {
      if (notam.coordinates) {
        const { lat, lng } = notam.coordinates;
        
        const marker = L.marker([lat, lng]).addTo(mapInstance);
        
        // Create popup with NOTAM information
        marker.bindPopup(`
          <div class="notam-popup">
            <h4>${notam.id}</h4>
            <p><strong>Location:</strong> ${notam.location}</p>
            <p><strong>Type:</strong> ${notam.type}</p>
            <p><strong>Effective:</strong> ${notam.effectiveDate}</p>
            <p>${notam.description}</p>
          </div>
        `);
        
        markers.push(marker);
      }
    });
  }
  // Example for Google Maps:
  else if (typeof google !== 'undefined' && google.maps) {
    notams.forEach(notam => {
      if (notam.coordinates) {
        const { lat, lng } = notam.coordinates;
        
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title: notam.id
        });
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="notam-popup">
              <h4>${notam.id}</h4>
              <p><strong>Location:</strong> ${notam.location}</p>
              <p><strong>Type:</strong> ${notam.type}</p>
              <p><strong>Effective:</strong> ${notam.effectiveDate}</p>
              <p>${notam.description}</p>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });
        
        markers.push({ marker, infoWindow });
      }
    });
  }
};

/**
 * Clear all markers from the map
 */
export const clearMarkers = () => {
  // Implementation depends on the mapping library
  if (typeof L !== 'undefined') {
    markers.forEach(marker => {
      if (mapInstance) {
        mapInstance.removeLayer(marker);
      }
    });
  } else if (typeof google !== 'undefined' && google.maps) {
    markers.forEach(item => {
      item.marker.setMap(null);
      if (item.infoWindow) {
        item.infoWindow.close();
      }
    });
  }
  
  markers = [];
};

/**
 * Clear the map and remove it from the container
 * @param {Object} map - The map instance to clear
 */
export const clearMap = (map) => {
  clearMarkers();
  
  if (map && typeof map.remove === 'function') {
    map.remove();
  }
  
  mapInstance = null;
};

/**
 * Highlight a specific NOTAM on the map
 * @param {string} notamId - The ID of the NOTAM to highlight
 */
export const highlightNotamOnMap = (notamId) => {
  // Implementation would depend on the mapping library used
  console.log(`Highlighting NOTAM ${notamId} on map`);
};
