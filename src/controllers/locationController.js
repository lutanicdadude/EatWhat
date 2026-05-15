const { autocompleteLocation } = require('../services/geoapifyService');

async function autocomplete(req, res) {
    const query = req.query.q;

    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        console.log(`📍 Searching locations for: ${query}`);
        const results = await autocompleteLocation(query);
        res.status(200).json(results);

    } catch (error) {
        console.error('Location search error:', error.message);
        res.status(500).json([]);
    }
}

module.exports = { autocomplete };