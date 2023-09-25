// Initialize map
var map = L.map('map').setView([33.022, -116.3428333], 6); // Set the initial map center and zoom level

// Add a tile layer 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load GeoJSON data from what I picked
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // Size of earthquake markers based on magnitude
        function calculateMarkerSize(magnitude) {
            return Math.sqrt(magnitude) * 10;
        }

        // Color of earthquake markers based on depth
        function calculateMarkerColor(depth) {
            if (depth < 10) return 'green';
            else if (depth < 30) return 'yellow';
            else if (depth < 50) return 'orange';
            else return 'red';
        }

        // Layer w/ custom marker styles and popups
        var geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var markerSize = calculateMarkerSize(feature.properties.mag);
                var markerColor = calculateMarkerColor(feature.geometry.coordinates[2]);
                var markerOptions = {
                    radius: markerSize,
                    fillColor: markerColor,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
                return L.circleMarker(latlng, markerOptions);
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `<strong>Location:</strong> ${feature.properties.place}<br>` +
                    `<strong>Magnitude:</strong> ${feature.properties.mag}<br>` +
                    `<strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
                );
            }
        }).addTo(map);

        // Fit the map to the bounds of the GeoJSON data
        map.fitBounds(geojsonLayer.getBounds());

        // Legend
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var depthColors = ['green', 'yellow', 'orange', 'red'];
            var labels = ['<strong>Depth</strong>'];
            
            for (var i = 0; i < depthColors.length; i++) {
                labels.push(
                    `<i style="background:${depthColors[i]}"></i> ${i * 20} - ${(i + 1) * 20} km`
                );
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    })
    .catch(function (error) {
        console.error('Error loading GeoJSON data:', error);
    });