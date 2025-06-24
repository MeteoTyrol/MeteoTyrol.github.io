// Karte initialisieren
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};
let map = L.map("map").setView([ibk.lat, ibk.lng], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Druck-Layer anlegen
let pressureLayer = L.featureGroup().addTo(map);

async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    // Alle Druckmarker hinzufügen
    pressureLayer.clearLayers();
    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            // Druckwert holen (z.B. ersten Wert aus dem Array)
            let pressure = feature.properties.parameters.p.data[0];
            if (pressure === null || pressure === undefined) return null; // Station ignorieren
            return L.marker(latlng, {
                icon: L.divIcon({
                    html: `<span style="background:#eef;padding:2px 6px;border-radius:4px;border:1px solid #336;font-size:12px;">${pressure} hPa</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    }).addTo(pressureLayer);
}

loadGeoJSON("Jahressatz.geojson");
