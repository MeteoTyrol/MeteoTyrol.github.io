// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// zentral ist zirka Mayerhofen
let center = {
    lat: 47.097778,
    lng: 11.703722
};

// Karte initialisieren
let map = L.map("map").setView([center.lat, center.lng], 9);

// thematische Layer
let overlays = {
    NO2: L.featureGroup(),
    O3: L.featureGroup(),
    PM10: L.featureGroup().addTo(map)
}

// Layer Control
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map),
    "BasemapAT Grau": L.tileLayer.provider('BasemapAT.grau'),
}, {
    "NO2": overlays.NO2,
    "Ozone": overlays.O3,
    "PM 10": overlays.PM10
}).addTo(map);



// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);


// GeoJSON laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    return await response.json();
}

let currentPM10Index = 0;
let pm10Times = [];
let pm10Markers = [];

async function getDataPM10(geojson) {
    pm10Markers = [];
    pm10Times = [];
    // Für jeden Punkt API-Daten holen
    for (let i = 0; i < geojson.features.length; i++) {
        let feature = geojson.features[i];
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm10&domains=cams_europe`;
        let response = await fetch(apiUrl);
        let jsondatapm10 = await response.json();

        // Alle Werte für diesen Punkt merken
        let values = (jsondatapm10.hourly && jsondatapm10.hourly.pm10) ? jsondatapm10.hourly.pm10 : [];
        pm10Markers.push({
            lat,
            lng,
            values
        });
    }
    updatePM10Layer();
}

// Layer aktualisieren
function updatePM10Layer() {
    overlays.PM10.clearLayers();
    function getPMColor(value) {
        if (value < 20) return "#00CD00";
        if (value < 40) return "#ffff00";
        if (value < 50) return "#ff7e00";
        if (value < 100) return "#ff0000";
        if (value < 150) return "#8f3f97";
        return "#7e0023";
    }
    for (let i = 0; i < pm10Markers.length; i++) {
        let markerData = pm10Markers[i];
        let value = markerData.values[currentPM10Index];
        if (value === null || value === undefined) continue;
        let marker = L.marker([markerData.lat, markerData.lng], {
            icon: L.divIcon({
               html: `<span style="background:${getPMColor(value)}55;padding:2px 6px;border-radius:4px;border:1px solid #cc8;font-size:12px;">${value}</span>`,
                iconAnchor: [15, 15]
            })
        });
        overlays.PM10.addLayer(marker);
    }
    // Optional: Zeitstempel anzeigen
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && pm10Times.length > 0) {
        tsDiv.textContent = "Zeit: " + pm10Times[currentPM10Index];
    }
}

async function getDataNO2(geojson) {
    no2Markers = [];
    no2Times = [];
    // Für jeden Punkt API-Daten holen
    for (let i = 0; i < geojson.features.length; i++) {
        let feature = geojson.features[i];
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=nitrogen_dioxide&domains=cams_europe`;
        let response = await fetch(apiUrl);
        let jsondatano2 = await response.json();

        // Alle Werte für diesen Punkt merken
        let values = (jsondatano2.hourly && jsondatano2.hourly.no2) ? jsondatano2.hourly.no2 : [];
        no2Markers.push({
            lat,
            lng,
            values
        });
    }
    updateNO2Layer();
}

// Layer aktualisieren
function updateNO2Layer() {
    overlays.NO2.clearLayers();
    function getNOColor(value) {
        if (value < 20) return "#00CD00";
        if (value < 40) return "#ffff00";
        if (value < 50) return "#ff7e00";
        if (value < 100) return "#ff0000";
        if (value < 150) return "#8f3f97";
        return "#7e0023";
    }
    for (let i = 0; i < no2Markers.length; i++) {
        let markerData = no2Markers[i];
        let value = markerData.values[currentNO2Index];
        if (value === null || value === undefined) continue;
        let marker = L.marker([markerData.lat, markerData.lng], {
            icon: L.divIcon({
               html: `<span style="background:${getNOColor(value)}55;padding:2px 6px;border-radius:4px;border:1px solid #cc8;font-size:12px;">${value}</span>`,
                iconAnchor: [15, 15]
            })
        });
        overlays.NO2.addLayer(marker);
    }
    // Optional: Zeitstempel anzeigen
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && no2Times.length > 0) {
        tsDiv.textContent = "Zeit: " + no2Times[currentNO2Index];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('time-next').onclick = function() {
        if (!pm10Times.length) return;
        currentPM10Index = (currentPM10Index + 1) % pm10Times.length;
        updatePM10Layer();
    };
    document.getElementById('time-prev').onclick = function() {
        if (!pm10Times.length) return;
        currentPM10Index = (currentPM10Index - 1 + pm10Times.length) % pm10Times.length;
        updatePM10Layer();
    };
});



// Hauptfunktion
(async () => {
    let geojson = await loadGeoJSON("station.geojson");
   //await getDataPM10(geojson);
   await getDataNO2(geojson);
})();