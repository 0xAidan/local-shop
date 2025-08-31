const axios = require('axios');

/**
 * Geocode an address to get coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
const geocodeAddress = async (address) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using fallback coordinates');
      // Return fallback coordinates for Canada (Toronto)
      return {
        latitude: 43.6532,
        longitude: -79.3832
      };
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY,
          region: 'ca', // Bias results to Canada
          components: 'country:CA' // Restrict to Canada
        }
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log(`✅ Geocoded address "${address}" to coordinates: ${location.lat}, ${location.lng}`);
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    } else {
      console.error('Geocoding failed:', response.data.status, response.data.error_message);
      
      // Try to extract province from address and provide fallback coordinates
      const provinceMatch = address.match(/\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/i);
      if (provinceMatch) {
        const province = provinceMatch[0].toUpperCase();
        const fallbackCoords = getProvinceFallbackCoordinates(province);
        console.log(`⚠️ Using fallback coordinates for ${province}: ${fallbackCoords.latitude}, ${fallbackCoords.longitude}`);
        return fallbackCoords;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    
    // Try to extract province from address and provide fallback coordinates
    const provinceMatch = address.match(/\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/i);
    if (provinceMatch) {
      const province = provinceMatch[0].toUpperCase();
      const fallbackCoords = getProvinceFallbackCoordinates(province);
      console.log(`⚠️ Using fallback coordinates for ${province}: ${fallbackCoords.latitude}, ${fallbackCoords.longitude}`);
      return fallbackCoords;
    }
    
    return null;
  }
};

/**
 * Get fallback coordinates for Canadian provinces
 * @param {string} province - Province code
 * @returns {Object} Coordinates object
 */
const getProvinceFallbackCoordinates = (province) => {
  const provinceCoords = {
    'AB': { latitude: 53.9333, longitude: -116.5765 }, // Edmonton
    'BC': { latitude: 49.2827, longitude: -123.1207 }, // Vancouver
    'MB': { latitude: 49.8951, longitude: -97.1384 }, // Winnipeg
    'NB': { latitude: 45.9636, longitude: -66.6431 }, // Fredericton
    'NL': { latitude: 47.5615, longitude: -52.7126 }, // St. John's
    'NS': { latitude: 44.6488, longitude: -63.5752 }, // Halifax
    'NT': { latitude: 62.4540, longitude: -114.3718 }, // Yellowknife
    'NU': { latitude: 63.7467, longitude: -68.5170 }, // Iqaluit
    'ON': { latitude: 43.6532, longitude: -79.3832 }, // Toronto
    'PE': { latitude: 46.2382, longitude: -63.1311 }, // Charlottetown
    'QC': { latitude: 45.5017, longitude: -73.5673 }, // Montreal
    'SK': { latitude: 50.4452, longitude: -104.6189 }, // Regina
    'YT': { latitude: 60.7212, longitude: -135.0568 }, // Whitehorse
  };
  
  return provinceCoords[province] || { latitude: 43.6532, longitude: -79.3832 }; // Default to Toronto
};

/**
 * Reverse geocode coordinates to get address
 * @param {number} latitude - The latitude
 * @param {number} longitude - The longitude
 * @returns {Promise<string | null>}
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    } else {
      console.error('Reverse geocoding failed:', response.data.status);
      return null;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    return null;
  }
};

/**
 * Calculate distance between two coordinates in miles
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in miles
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Validate coordinates
 * @param {number} latitude - The latitude
 * @param {number} longitude - The longitude
 * @returns {boolean} True if coordinates are valid
 */
const validateCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  validateCoordinates
}; 