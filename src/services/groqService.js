const Groq = require('groq-sdk');
const { getNearbyFoodPlaces } = require('./geoapifyService');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt({ hunger, laziness, budget, restrictions, location, extraDescription, nearbyPlaces, previousRecommendations = [] }) {
  const historyText = previousRecommendations.length > 0
    ? `- Do NOT recommend these already suggested dishes and places:
        ${previousRecommendations.map(r => `${r.dish} at ${r.where}`).join(', ')}`
    : '';

  const placesText = laziness === 'deliver to me'
    ? `The user wants food delivered. Recommend a popular dish available 
       on GrabFood or Foodpanda near ${location}. Pick something that 
       travels well and arrives hot.`
    : nearbyPlaces.length > 0
      ? `Here are the ONLY places you can recommend from — all verified real and nearby:
         ${nearbyPlaces.map((p, i) =>
        `${i + 1}. ${p.name} — ${p.address} (${p.distance}m away) — ${p.category}`
      ).join('\n')}`
      : 'No verified nearby places found — use your best knowledge of the area.';

  return `
    You are EatWhat, a food recommendation assistant for people in Singapore.

    MOST IMPORTANT RULE:
    ${extraDescription
      ? `The user specifically requested: "${extraDescription}". This overrides everything else.`
      : 'Recommend the best food option based on the user preferences below.'
    }

    ${placesText}

    User preferences:
    - Hunger level: ${hunger}
    - Lazy level: ${laziness}
    - Budget: ${budget}
    - Dietary restrictions: ${restrictions || 'none'}

    YOUR JOB:
    - Pick ONE place from the list above
    - If laziness is "deliver to me" recommend a delivery option via GrabFood or Foodpanda
    - If laziness is "nearby only" pick the closest place from the list
    - If laziness is "I can travel" you can pick any place from the list
    - Recommend a specific dish available at that place
    - Think like a local Singapore foodie who knows every hidden gem
      and always picks something surprising and satisfying
    - Avoid the obvious safe choices — challenge yourself to recommend
      something the user might not have thought of but will love
    - Match the dish to the mood — if starving pick something hearty and 
      filling, if just a snack pick something light and quick
    - Your recommendation should feel personal and confident — like a 
      friend who says "trust me, get this"
    - Randomize your choice: ${Math.random()}
    ${historyText}

    Respond in this exact JSON format and nothing else:
    {
      "dish": "Name of the dish",
      "where": "Place name from the list above",
      "address": "Address from the list above",
      "mapsLink": "https://www.google.com/maps/search/?api=1&query=PLACE+NAME+Singapore",
      "how": "Deliver / Walk there / Short drive",
      "price": "Estimated price in SGD",
      "time": "How long it takes",
      "reason": "One fun sentence on why this is perfect for them right now"
    }
  `;
}

async function getFoodRecommendation({ hunger, laziness, budget, restrictions, location, lat, lon, extraDescription, previousRecommendations = [] }) {
  console.log(`📍 Getting nearby places for: ${location}`);

  // Use coordinates if available, otherwise skip
  let nearbyPlaces = [];
  if (lat && lon) {
    nearbyPlaces = await getNearbyFoodPlaces(lat, lon, laziness, extraDescription || '');
  } else {
    console.log('⚠️ No coordinates provided — Groq will use its own knowledge');
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts}`);

    const prompt = buildPrompt({
      hunger, laziness, budget,
      restrictions, location,      // location now passed in
      extraDescription,
      nearbyPlaces,
      previousRecommendations
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      max_tokens: 300
    });

    const raw = completion.choices[0].message.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log('⚠️ Invalid JSON — retrying');
      continue;
    }

    const recommendation = JSON.parse(jsonMatch[0]);
    console.log(`✅ Recommendation: ${recommendation.dish} at ${recommendation.where}`);
    return recommendation;
  }

  console.log('⚠️ All attempts failed — using fallback');
  throw new Error('Could not generate a valid recommendation');
}

module.exports = { getFoodRecommendation };