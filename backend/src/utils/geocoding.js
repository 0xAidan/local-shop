const axios = require('axios');

/**
 * Geocode an address to get coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
const geocodeAddress = async (address) => {
  try {
    // Try Google Maps API first if key is available
    if (process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key') {
      console.log('🗺️ Using Google Maps API for geocoding');
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
        console.log(`✅ Google Maps geocoded address "${address}" to coordinates: ${location.lat}, ${location.lng}`);
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      } else {
        console.error('Google Maps geocoding failed:', response.data.status, response.data.error_message);
      }
    }

    // Fallback to Nominatim (OpenStreetMap) - free and accurate
    console.log('🗺️ Using Nominatim (OpenStreetMap) for geocoding');
    const nominatimResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'ca', // Restrict to Canada
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'LocalShop/1.0' // Required by Nominatim
        }
      }
    );

    if (nominatimResponse.data && nominatimResponse.data.length > 0) {
      const result = nominatimResponse.data[0];
      console.log(`✅ Nominatim geocoded address "${address}" to coordinates: ${result.lat}, ${result.lon}`);
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }

    // If both services fail, try to extract province and provide fallback coordinates
    console.log('⚠️ Both geocoding services failed, using fallback coordinates');
    const provinceMatch = address.match(/\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/i);
    if (provinceMatch) {
      const province = provinceMatch[0].toUpperCase();
      const fallbackCoords = getProvinceFallbackCoordinates(province, address);
      console.log(`⚠️ Using fallback coordinates for ${province}: ${fallbackCoords.latitude}, ${fallbackCoords.longitude}`);
      return fallbackCoords;
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    
    // Try to extract province from address and provide fallback coordinates
    const provinceMatch = address.match(/\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/i);
    if (provinceMatch) {
      const province = provinceMatch[0].toUpperCase();
      const fallbackCoords = getProvinceFallbackCoordinates(province, address);
      console.log(`⚠️ Using fallback coordinates for ${province}: ${fallbackCoords.latitude}, ${fallbackCoords.longitude}`);
      return fallbackCoords;
    }
    
    return null;
  }
};

/**
 * Get fallback coordinates for Canadian provinces
 * @param {string} province - Province code
 * @param {string} address - Full address to extract city information
 * @returns {Object} Coordinates object
 */
const getProvinceFallbackCoordinates = (province, address = '') => {
  // Extract city from address (look for common city patterns)
  const cityMatch = address.match(/([A-Za-z\s]+),?\s*(?:ON|BC|AB|MB|NB|NL|NS|NT|NU|PE|QC|SK|YT)/i);
  const city = cityMatch ? cityMatch[1].trim().toLowerCase() : '';
  
  console.log(`📍 Extracted city from address: "${city}"`);
  
  // Ontario cities with specific coordinates
  if (province === 'ON') {
    const ontarioCities = {
      'toronto': { latitude: 43.6532, longitude: -79.3832 },
      'ottawa': { latitude: 45.4215, longitude: -75.6972 },
      'mississauga': { latitude: 43.5890, longitude: -79.6441 },
      'brampton': { latitude: 43.6831, longitude: -79.7663 },
      'hamilton': { latitude: 43.2557, longitude: -79.8711 },
      'london': { latitude: 42.9849, longitude: -81.2453 },
      'windsor': { latitude: 42.3149, longitude: -83.0364 },
      'kitchener': { latitude: 43.4516, longitude: -80.4925 },
      'waterloo': { latitude: 43.4643, longitude: -80.5204 },
      'cambridge': { latitude: 43.3616, longitude: -80.3144 },
      'guelph': { latitude: 43.5448, longitude: -80.2482 },
      'kingston': { latitude: 44.2312, longitude: -76.4860 },
      'thunder bay': { latitude: 48.3809, longitude: -89.2477 },
      'sudbury': { latitude: 46.4917, longitude: -80.9930 },
      'sault ste marie': { latitude: 46.5218, longitude: -84.3195 },
      'north bay': { latitude: 46.3091, longitude: -79.4608 },
      'timmins': { latitude: 48.4758, longitude: -81.3305 },
      'barrie': { latitude: 44.3894, longitude: -79.6903 },
      'oshawa': { latitude: 43.8971, longitude: -78.8658 },
      'st catharines': { latitude: 43.1594, longitude: -79.2469 },
      'niagara falls': { latitude: 43.0962, longitude: -79.0377 },
      'peterborough': { latitude: 44.3091, longitude: -78.3197 },
      'belleville': { latitude: 44.1628, longitude: -77.3832 },
      'cornwall': { latitude: 45.0189, longitude: -74.7281 },
      'sarnia': { latitude: 42.9749, longitude: -82.4066 },
      'chatham': { latitude: 42.4053, longitude: -82.1900 },
      'sarnia': { latitude: 42.9749, longitude: -82.4066 },
      'sault ste. marie': { latitude: 46.5218, longitude: -84.3195 },
    };
    
    // Check if we have specific coordinates for the extracted city
    for (const [cityName, coords] of Object.entries(ontarioCities)) {
      if (city.includes(cityName) || cityName.includes(city)) {
        console.log(`📍 Found specific coordinates for ${cityName}: ${coords.latitude}, ${coords.longitude}`);
        return coords;
      }
    }
    
    // If no specific city match, use a more central Ontario location
    console.log(`📍 No specific city match, using central Ontario coordinates`);
    return { latitude: 44.0000, longitude: -79.0000 }; // More central Ontario
  }
  
  // Other provinces with their capital cities
  const provinceCoords = {
    'AB': { latitude: 53.9333, longitude: -116.5765 }, // Edmonton
    'BC': { latitude: 49.2827, longitude: -123.1207 }, // Vancouver
    'MB': { latitude: 49.8951, longitude: -97.1384 }, // Winnipeg
    'NB': { latitude: 45.9636, longitude: -66.6431 }, // Fredericton
    'NL': { latitude: 47.5615, longitude: -52.7126 }, // St. John's
    'NS': { latitude: 44.6488, longitude: -63.5752 }, // Halifax
    'NT': { latitude: 62.4540, longitude: -114.3718 }, // Yellowknife
    'NU': { latitude: 63.7467, longitude: -68.5170 }, // Iqaluit
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