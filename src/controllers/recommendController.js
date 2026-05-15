require('dotenv').config();

const { getFoodRecommendation } = process.env.USE_MOCK === 'true'
    ? require('../services/mockGroqService')
    : require('../services/groqService');

async function recommend(req, res) {
    const { hunger, laziness, budget, restrictions, location, lat, lon, extraDescription, previousRecommendations } = req.body;

    if (!hunger || !laziness || !budget) {
        return res.status(400).json({
            success: false,
            error: 'hunger, laziness and budget are required'
        });
    }

    try {
        console.log(`🍜 Getting recommendation for: ${hunger}, ${laziness}, ${budget}`);
        console.log(`🔧 Mode: ${process.env.USE_MOCK === 'true' ? 'MOCK' : 'LIVE'}`);
        console.log(`📋 Previous recommendations: ${previousRecommendations?.length || 0}`);

        const recommendation = await getFoodRecommendation({
            hunger,
            laziness,
            budget,
            restrictions,
            location,
            lat,
            lon,
            extraDescription,
            previousRecommendations: previousRecommendations || []
        });

        console.log('✅ Recommendation:', JSON.stringify(recommendation, null, 2));

        return res.status(200).json({
            success: true,
            recommendation
        });

    } catch (error) {
        console.error('Recommendation error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to get recommendation'
        });
    }
}

module.exports = { recommend };