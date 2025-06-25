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
    overlays.temperature.clearLayers(); // Vorherige Marker entfernen
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            // Temperaturwert aus den Daten holen (z.B. Mittelwert)
            let data = feature.properties.parameters.tl_mittel.data;
            let validTemp = data.find(d => d !== null && d !== undefined);
            if (validTemp !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #888;font-size:12px;">${validTemp}°C</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.temperature);
}

// Pressure-Layer
currentIndex = 0;
function showPres(jsondata) {
    overlays.pressure.clearLayers(); // Vorherige Marker entfernen
    
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            console.log(latlng)
            let pressure = feature.properties.parameters.p.data[currentIndex];
            if (pressure === null || pressure === undefined) return null;
            return L.marker(latlng, { // <-- latlng verwenden!
                icon: L.divIcon({
                    html: `<span>${pressure} hPa</span>`,
                    iconAnchor: [15, 15]
                })
            });
        },
    }).addTo(overlays.pressure);
}

let currentYearIndex = 29; // z.B. für 2023

function showRain(jsondata) {
    overlays.rain.clearLayers(); // Vorherige Marker entfernen
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let data = feature.properties.parameters.rr.data;
            let rain = data[currentYearIndex];

            if (rain !== null && rain !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${rain} mm</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.rain);
}



// minimap plugin mit Grundkarte Tirol Sommer als Layer
var osm2 = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png");
var miniMap = new L.Control.MiniMap(osm2, {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);

//fullScreen 
map.addControl(new L.Control.Fullscreen());


// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson.features[0]);
    showTemp(geojson);
    showRain(geojson);
    showPres(geojson);
    //showPressureAtEachPoint(geojson);
};

loadGeoJSON("Jahressatz_lonlat.geojson");



