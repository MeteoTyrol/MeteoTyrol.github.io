// Karte initialisieren
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};
let map = L.map("map").setView([ibk.lat, ibk.lng], 9);

// thematische Layer
let overlays = {
    temperature: L.featureGroup().addTo(map),
    pressure: L.featureGroup(),
    rain: L.featureGroup(),
    sunshine: L.featureGroup(),
    thunderstorm: L.featureGroup(),
    hail: L.featureGroup(),
    snow: L.featureGroup(),
    wind: L.featureGroup(),
};

// Layer control
L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Temperature": overlays.temperature,
    "Pressure": overlays.pressure,
    "Rain": overlays.rain,
    "Windspeed": overlays.wind,
    "Sunshine": overlays.sunshine,
    "Days with thunderstorms": overlays.thunderstorm,
    "Days with snow": overlays.snow,
    "Days with hail": overlays.hail,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Temperatur-Layer
async function showTemp(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let temp = feature.properties.parameters.tl_mittel.data;
            return L.marker(latlng, {
                icon: L.divIcon({
                    html: `<span>${temp}°C</span>`,
                    iconAnchor: [15, 15]
                })
            });
        },
    }).addTo(overlays.temperature);
}

// Pressure-Layer
function showPres(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let pressure = feature.properties.parameters.p.data;
            return L.marker(latlng, {
                icon: L.divIcon({
                    html: `<span>${pressure}°C</span>`,
                    iconAnchor: [15, 15]
                })
            });
        },
    }).addTo(overlays.pressure);
}


// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);
    showTemp(geojson);
    showPres(geojson);
    showPressureAtEachPoint(geojson);
}
loadGeoJSON("Jahressatz.json");



