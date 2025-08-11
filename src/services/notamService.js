/**
 * Service for fetching and processing NOTAM data
 * Migrated from NotamOriginal project
 */

// Sample NOTAM data for demonstration
// Replace with actual API calls from your original project
const SAMPLE_NOTAMS = [
  {
    id: 'A1234/23',
    location: 'KJFK',
    coordinates: { lat: 40.6413, lng: -73.7781 },
    type: 'airport',
    effectiveDate: '2025-08-10',
    description: 'Runway 13L/31R closed for maintenance'
  },
  {
    id: 'B5678/23',
    location: 'EGLL',
    coordinates: { lat: 51.4700, lng: -0.4543 },
    type: 'obstacle',
    effectiveDate: '2025-08-09',
    description: 'Temporary crane erected 2NM east of airport, height 300ft AGL'
  },
  {
    id: 'C9012/23',
    location: 'EHAM',
    coordinates: { lat: 52.3105, lng: 4.7683 },
    type: 'navaid',
    effectiveDate: '2025-08-11',
    description: 'AMS VOR/DME unserviceable due to maintenance'
  },
  {
    id: 'D3456/23',
    location: 'RJTT',
    coordinates: { lat: 35.5494, lng: 139.7798 },
    type: 'airspace',
    effectiveDate: '2025-08-12',
    description: 'Temporary restricted area established for military exercises'
  },
  {
    id: 'E7890/23',
    location: 'YSSY',
    coordinates: { lat: -33.9500, lng: 151.1819 },
    type: 'procedure',
    effectiveDate: '2025-08-10',
    description: 'ILS approach procedure runway 16R temporarily unavailable'
  }
];

/**
 * Fetch NOTAM data based on filter criteria
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - Array of NOTAM objects
 */
export const fetchNotamData = async (filters) => {
  // In a real implementation, this would make an API call
  // For now, we'll simulate an API call with a delay and filter the sample data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Apply filters to the sample data
    let filteredData = [...SAMPLE_NOTAMS];
    
    if (filters.region !== 'all') {
      // Filter by region logic
      // This is a simplification - you would implement proper region filtering
      const regionMapping = {
        'north-america': ['K'],  // ICAO codes starting with K for USA
        'europe': ['E', 'L'],    // ICAO codes starting with E or L for Europe
        'asia': ['R', 'V', 'Z'], // Various Asian ICAO prefixes
        'oceania': ['Y'],        // Australia ICAO prefix
        'africa': ['F', 'D'],    // Various African ICAO prefixes
        'south-america': ['S']   // Various South American ICAO prefixes
      };
      
      const prefixes = regionMapping[filters.region] || [];
      if (prefixes.length > 0) {
        filteredData = filteredData.filter(notam => 
          prefixes.some(prefix => notam.location.startsWith(prefix))
        );
      }
    }
    
    if (filters.type !== 'all') {
      filteredData = filteredData.filter(notam => notam.type === filters.type);
    }
    
    if (filters.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const getDateLimit = () => {
        switch (filters.dateRange) {
          case 'today':
            return today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return monthAgo;
          }
          default:
            return null;
        }
      };
      
      const dateLimit = getDateLimit();
      if (dateLimit) {
        filteredData = filteredData.filter(notam => {
          const notamDate = new Date(notam.effectiveDate);
          return notamDate >= dateLimit;
        });
      }
    }
    
    return filteredData;
  } catch (error) {
    console.error('Error fetching NOTAM data:', error);
    throw new Error('Failed to fetch NOTAM data');
  }
};

/**
 * Fetch NOTAM details by ID
 * @param {string} notamId - The ID of the NOTAM to fetch
 * @returns {Promise<Object>} - NOTAM details
 */
export const fetchNotamDetails = async (notamId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const notam = SAMPLE_NOTAMS.find(n => n.id === notamId);
  
  if (!notam) {
    throw new Error(`NOTAM with ID ${notamId} not found`);
  }
  
  return {
    ...notam,
    // Add additional details that might be fetched only when viewing a specific NOTAM
    issuedBy: 'FAA',
    validUntil: '2025-09-10',
    altitude: 'Surface to 5000ft',
    radius: '5NM'
  };
};
