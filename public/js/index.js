const selections = { hunger: null, laziness: null, budget: null, extraDescription: null };
const recommendationHistory = []; // track previous recommendations

// Handle option selection
document.querySelectorAll('.options').forEach(group => {
    group.querySelectorAll('.option').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selections[group.id] = btn.dataset.value;
        });
    });
});

async function getRecommendation() {
    const userLocation = document.getElementById('location').value;
    const restrictions = document.getElementById('restrictions').value;
    const extraDescription = document.getElementById('extraDescription').value;

    if (!selections.hunger || !selections.laziness || !selections.budget || !userLocation) {
        alert('Please answer all questions first!');
        return;
    }

    // Read coordinates stored by autocomplete
    const coords = window.selectedCoordinates || { lat: null, lon: null };
    console.log('📍 Sending coordinates:', coords);

    document.getElementById('form-section').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('error').style.display = 'none';

    try {
        const res = await fetch('/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hunger: selections.hunger,
                laziness: selections.laziness,
                restrictions: restrictions || 'none',
                budget: selections.budget,
                location: userLocation,
                lat: coords.lat,        // coordinates from autocomplete
                lon: coords.lon,        // coordinates from autocomplete
                extraDescription: extraDescription,
                // Send history so AI knows what to avoid
                previousRecommendations: recommendationHistory
            })
        });

        const data = await res.json();

        if (data.success) {
            const r = data.recommendation;

            // Add to history
            recommendationHistory.push({
                dish: r.dish,
                where: r.where
            });

            document.getElementById('result-dish').textContent = r.dish;
            document.getElementById('result-reason').textContent = r.reason;
            document.getElementById('result-where').textContent = r.where;
            document.getElementById('result-how').textContent = r.how;
            document.getElementById('result-price').textContent = r.price;
            document.getElementById('result-time').textContent = r.time;
            document.getElementById('result-address').textContent = r.address;
            document.getElementById('result-maps-link').href = r.mapsLink;

            document.getElementById('loading').style.display = 'none';
            document.getElementById('result').style.display = 'block';
        } else {
            throw new Error(data.error);
        }

    } catch (err) {
        console.error(err);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

function tryAgain() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    getRecommendation();
}