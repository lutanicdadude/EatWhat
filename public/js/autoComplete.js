document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location');
    const dropdown = document.getElementById('location-dropdown');
    let highlightedIndex = -1;
    let debounceTimer = null;

    // Store selected location coordinates
    window.selectedCoordinates = { lat: null, lon: null };

    if (!locationInput || !dropdown) {
        console.error('Autocomplete: Could not find location input or dropdown element');
        return;
    }

    locationInput.addEventListener('input', () => {
        const query = locationInput.value.trim();
        highlightedIndex = -1;
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            closeDropdown();
            // Clear coordinates when user clears input
            window.selectedCoordinates = { lat: null, lon: null };
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    async function fetchSuggestions(query) {
        try {
            showLoadingDropdown();
            const res = await fetch(`/location/autocomplete?q=${encodeURIComponent(query)}`);
            const results = await res.json();

            if (results.length === 0) {
                closeDropdown();
                return;
            }

            renderDropdown(results);

        } catch (err) {
            console.error('Autocomplete error:', err);
            closeDropdown();
        }
    }

    function showLoadingDropdown() {
        dropdown.innerHTML = `
      <div class="dropdown-item" style="color:#8899aa">
        🔍 Searching...
      </div>`;
        dropdown.classList.add('active');
    }

    function renderDropdown(results) {
        dropdown.innerHTML = results.map((place, i) =>
            `<div class="dropdown-item" 
            data-index="${i}" 
            data-value="${place.name}"
            data-lat="${place.lat || ''}"
            data-lon="${place.lon || ''}">
        📍 ${place.name}
      </div>`
        ).join('');

        dropdown.classList.add('active');

        // mousedown fires before blur
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                locationInput.value = item.dataset.value;

                // Store coordinates when user selects a location
                window.selectedCoordinates = {
                    lat: parseFloat(item.dataset.lat) || null,
                    lon: parseFloat(item.dataset.lon) || null
                };

                console.log('📍 Coordinates stored:', window.selectedCoordinates);
                closeDropdown();
            });
        });
    }

    function updateHighlight(items) {
        items.forEach((item, i) => {
            item.classList.toggle('highlighted', i === highlightedIndex);
        });
    }

    function closeDropdown() {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
        highlightedIndex = -1;
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            closeDropdown();
        }
    });
});