const fetch = require('node-fetch');
require('dotenv').config();

const GEOAPIFY_API_KEY_AUTOCOMPLETE = process.env.GEOAPIFY_API_KEY_AUTOCOMPLETE;
const GEOAPIFY_API_KEY_FOOD = process.env.GEOAPIFY_API_KEY_FOOD;
const BASE_URL_AUTOCOMPLETE = 'https://api.geoapify.com/v1';
const BASE_URL_FOOD = 'https://api.geoapify.com/v2';

console.log('Geoapify Key autocomplete loaded:', GEOAPIFY_API_KEY_AUTOCOMPLETE ? `${GEOAPIFY_API_KEY_AUTOCOMPLETE.substring(0, 8)}...` : 'NOT FOUND');
console.log('Geoapify Key food loaded:', GEOAPIFY_API_KEY_FOOD ? `${GEOAPIFY_API_KEY_FOOD.substring(0, 8)}...` : 'NOT FOUND');

// Autocomplete — replaces Foursquare autocomplete
async function autocompleteLocation(query) {
    try {
        const url = `${BASE_URL_AUTOCOMPLETE}/geocode/autocomplete?` +
            `text=${encodeURIComponent(query)}` +
            `&filter=countrycode:sg` +  // Singapore only
            `&bias=countrycode:sg` +    // Bias towards Singapore
            `&limit=6` +
            `&apiKey=${GEOAPIFY_API_KEY_AUTOCOMPLETE}`;

        console.log('Autocomplete URL:', url);
        const response = await fetch(url);
        const data = await response.json();

        console.log('Geoapify raw response:', JSON.stringify(data, null, 2));

        if (!data.features) return [];

        return data.features.map(feature => ({
            name: feature.properties.formatted ||
                feature.properties.name ||
                feature.properties.address_line1,
            full: feature.properties.formatted,
            lat: feature.properties.lat,
            lon: feature.properties.lon
        }));

    } catch (error) {
        console.error('Geoapify autocomplete error:', error.message);
        return [];
    }
}

// Get nearby food places — replaces Foursquare nearby places
async function getNearbyFoodPlaces(lat, lon, laziness = 'nearby only', extraDescription = '') {
    try {
        if (laziness === 'deliver to me') {
            console.log('🛵 Delivery mode — skipping nearby search');
            return [];
        }

        // Set radius based on laziness and extraDescription
        let radius;
        if (extraDescription.toLowerCase().includes('mall') ||
            extraDescription.toLowerCase().includes('within')) {
            radius = 200;
        } else if (laziness === 'nearby only') {
            radius = 500;
        } else if (laziness === 'I can travel') {
            radius = 2000;
        } else {
            radius = 1000;
        }

        console.log(`📍 Search radius: ${radius}m (laziness: ${laziness})`);

        // Search for nearby food places
        const placesUrl = `${BASE_URL_FOOD}/places?` +
            `categories=catering` +     // Geoapify category for food/restaurants
            `&filter=circle:${lon},${lat},${radius}` +
            `&bias=proximity:${lon},${lat}` +
            `&limit=10` +
            `&apiKey=${GEOAPIFY_API_KEY_FOOD}`;

        console.log('Places URL:', placesUrl);
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();

        if (!placesData.features || placesData.features.length === 0) {
            console.log('⚠️ No nearby places found');
            return [];
        }

        const places = placesData.features.map(place => ({
            name: place.properties.name || 'Unknown',
            address: place.properties.formatted || place.properties.address_line1 || '',
            distance: Math.round(place.properties.distance) || 0,
            category: place.properties.categories?.[0] || 'restaurant'
        }));

        console.log(`✅ Found ${places.length} nearby food places`);
        return places;

    } catch (error) {
        console.error('Geoapify nearby places error:', error.message);
        return [];
    }
}

module.exports = { autocompleteLocation, getNearbyFoodPlaces };