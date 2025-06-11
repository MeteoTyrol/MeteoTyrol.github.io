// Karte initialisieren
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};
let map = L.map("map").setView([ibk.lat, ibk.lng], 7);
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

// Hilfsfunktion: GeoJSON laden und Koordinaten extrahieren
async function getLatLngFromGeoJSON(path) {
    let response = await fetch(path);
    let geojson = await response.json();
    // Extrahiere alle Features mit Punkt-Geometrie
    let coords = geojson.features.map(f => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            name: f.properties?.Stationsname || ""
        }));
    return coords;
}

// Farbskala für Temperatur (°C)
function getColorForTemperature(temp) {
    // Wertebereich anpassen: z.B. -15°C (blau) bis +35°C (rot)
    const minTemp = -15;
    const maxTemp = 35;
    // Interpolation: 0 = blau, 0.5 = gelb, 1 = rot
    let t = (temp - minTemp) / (maxTemp - minTemp);
    t = Math.max(0, Math.min(1, t));
    // Farbverlauf: blau → cyan → grün → gelb → orange → rot
    const colors = [
        [0, 0, 255],    // blau
        [0, 255, 255],  // cyan
        [0, 255, 0],    // grün
        [255, 255, 0],  // gelb
        [255, 128, 0],  // orange
        [255, 0, 0]     // rot
    ];
    const n = colors.length - 1;
    const idx = Math.floor(t * n);
    const frac = (t * n) - idx;
    const c1 = colors[idx];
    const c2 = colors[Math.min(idx + 1, n)];
    // Interpolieren
    const r = Math.round(c1[0] + frac * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + frac * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + frac * (c2[2] - c1[2]));
    return `rgb(${r},${g},${b})`;
}

async function showForecast(latlngArray) {
    let heatData = [];
    for (let i = 0; i < latlngArray.length; i++) {
        let coord = latlngArray[i];
        let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${coord.lat}&lon=${coord.lng}`;
        let response = await fetch(url, {
            headers: {
                'User-Agent': 'MeteorologyIBK/1.0 (your@email.com)'
            }
        });
        let data = await response.json();
        // Temperatur der nächsten Stunde holen
        let temp = data.properties?.timeseries?.[0]?.data?.instant?.details?.air_temperature;
        if (typeof temp === "number") {
            // Leaflet.heat erwartet [lat, lng, intensity]
            // Optional: Skaliere Temperatur auf 0...1 für die Heatmap
            const minTemp = -15, maxTemp = 35;
            let intensity = (temp - minTemp) / (maxTemp - minTemp);
            intensity = Math.max(0, Math.min(1, intensity));
            heatData.push([coord.lat, coord.lng, intensity]);
        }
    }
    // Heatmap-Layer erzeugen und zur Karte hinzufügen
    if (heatData.length > 0) {
        L.heatLayer(heatData, {
            radius: 25,
            blur: 18,
            maxZoom: 10,
            gradient: {
                0.0: 'blue',
                0.25: 'cyan',
                0.5: 'lime',
                0.75: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);
    }
}

// Farbskala als Legende anzeigen
function addLegend(map) {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const temps = [-15, 0, 10, 20, 30, 35];
        const labels = temps.map(t => {
            const color = getColorForTemperature(t);
            return `<i style="background:${color};width:18px;height:18px;display:inline-block;border-radius:50%;margin-right:4px;"></i> ${t}°C`;
        });
        div.innerHTML = `<b>Temperatur</b><br>${labels.join('<br>')}`;
        return div;
    };
    legend.addTo(map);
}

// Hauptfunktion
(async () => {
    let latlng = await getLatLngFromGeoJSON("../stations.geojson");
    await showForecast(latlng);
    addLegend(map);
})();
