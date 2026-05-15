const mockRecommendations = {
    woodlands: {
        dish: "Nasi Lemak",
        where: "Woodlands Centre Road Food Centre",
        address: "Woodlands Centre Road, Singapore 738907",
        mapsLink: "https://www.google.com/maps/search/?api=1&query=Woodlands+Centre+Road+Food+Centre+Singapore",
        how: "Walk there",
        price: "$4-6 SGD",
        time: "10 minutes",
        reason: "Best nasi lemak in the north — crispy ikan bilis and all!"
    },
    orchard: {
        dish: "Chicken Rice",
        where: "Food Republic, Wisma Atria",
        address: "435 Orchard Road, #04-01 Wisma Atria, Singapore 238877",
        mapsLink: "https://www.google.com/maps/search/?api=1&query=Food+Republic+Wisma+Atria+435+Orchard+Road+Singapore",
        how: "Walk there",
        price: "$6-8 SGD",
        time: "10 minutes",
        reason: "Classic Singapore comfort food right in the heart of Orchard!"
    },
    tampines: {
        dish: "Char Kway Teow",
        where: "Tampines Round Market & Food Centre",
        address: "137 Tampines Street 11, Singapore 521137",
        mapsLink: "https://www.google.com/maps/search/?api=1&query=Tampines+Round+Market+Food+Centre+137+Tampines+Street+11+Singapore",
        how: "Walk there",
        price: "$4-5 SGD",
        time: "15 minutes",
        reason: "Wok hei perfection at one of the east's best hawker centres!"
    },
    default: {
        dish: "McSpicy Meal",
        where: "McDonald's via GrabFood",
        address: "Delivered to your location",
        mapsLink: "https://www.google.com/maps/search/?api=1&query=McDonald's+Singapore",
        how: "Deliver it",
        price: "$12-14 SGD",
        time: "25-30 minutes",
        reason: "When in doubt, McSpicy never disappoints — delivered right to you!"
    }
};

async function getFoodRecommendation({ hunger, laziness, budget, restrictions, location }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Match location to mock data
    const locationKey = location
        ? Object.keys(mockRecommendations).find(key =>
            location.toLowerCase().includes(key)
        ) || 'default'
        : 'default';

    const recommendation = mockRecommendations[locationKey];

    // Override delivery method based on laziness
    if (laziness === 'deliver to me') {
        recommendation.how = 'Deliver it';
        recommendation.where = 'GrabFood or Foodpanda';
    }

    return recommendation;
}

module.exports = { getFoodRecommendation };