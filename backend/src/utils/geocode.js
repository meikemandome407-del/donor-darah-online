const axios = require('axios');

const DEFAULT_COORDS = { lat: 1.4931, lng: 124.8413 }; // Manado

async function geocodeAddress(address) {
  if (!address || address.trim() === '') return DEFAULT_COORDS;
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'DonorDarahApp/1.0' }
    });
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return DEFAULT_COORDS;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return DEFAULT_COORDS;
  }
}

module.exports = { geocodeAddress, DEFAULT_COORDS };