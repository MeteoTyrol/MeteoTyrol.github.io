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

async function showForecast(latlngArray) {
    for (let i = 0; i < latlngArray.length; i++) {
        let coord = latlngArray[i];
        let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${coord.lat}&lon=${coord.lng}`;
        let response = await fetch(url);
        let data = await response.json();
        console.log(data)
        // Temperatur der nächsten Stunde holen
        let temp = data.properties.timeseries[0].data.instant.details.air_temperature;
        // Temperatur als Marker mit Text anzeigen
        L.marker([coord.lat, coord.lng], {
            icon: L.divIcon({
                className: 'temp-label',
                html: `<span>${temp}°C</span>`,
                iconAnchor: [15, 15]
            })
        }).addTo(map);
    }
}

// Hauptfunktion
(async () => {
    let latlng = await getLatLngFromGeoJSON("../stations.geojson");
    await showForecast(latlng);
})();
