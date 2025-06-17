// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    center: [ibk.lat, ibk.lng],
    zoom: 7
});

// thematische Layer
let overlays = {
    temperature: L.featureGroup().addTo(map),
    pressure: L.featureGroup().addTo(map),
};

// Layer control
L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Temperature": overlays.temperature,
    "Pressure": overlays.pressure,
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

// Temperatur-Overlay ohne Slider
async function addTemperatureLayer(geojson) {
    let allFeatures = [];
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[1];
        let lng = geojson.features[i].geometry.coordinates[0];
        let name = geojson.features[i].properties.Stationsname || "";
        let apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
        let apiResponse = await fetch(apiUrl);
        let jsondata = await apiResponse.json();
        console.log(jsondata);
        if (!jsondata.properties?.timeseries) continue;
        // Nur den ersten Zeitpunkt anzeigen
        let currentIndex = 0;
        let ts = jsondata.properties.timeseries[currentIndex];
        allFeatures.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: {
                time: ts.time,
                temp: ts.data.instant.details.air_temperature,
                name: name
            }
        });
        document.getElementById('prev').onclick = () => {
  currentIndex = (currentIndex - 1 + locations.length) % locations.length;
  updateMarker();
};

document.getElementById('next').onclick = () => {
  currentIndex = (currentIndex + 1) % locations.length;
  updateMarker();
};
    }
    let tempGeoJson = { type: "FeatureCollection", features: allFeatures };

    let tempLayer = L.geoJson(tempGeoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'temp-label',
                    html: `<span style="background:rgba(255,255,255,0.8);padding:2px 4px;border-radius:4px;border:1px solid #888;font-size:12px;">${feature.properties.temp}°C</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });

    overlays.temperature.addLayer(tempLayer);
}

// Pressure-Overlay ohne Slider
async function addPressureLayer(geojson) {
    let allFeatures = [];
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[1];
        let lng = geojson.features[i].geometry.coordinates[0];
        let name = geojson.features[i].properties?.Stationsname || "";
        let apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
        let apiResponse = await fetch(apiUrl);
        let jsondata = await apiResponse.json();
        if (!jsondata.properties?.timeseries) continue;
        // Nur den ersten Zeitpunkt anzeigen
        let ts = jsondata.properties.timeseries[0];
        allFeatures.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: {
                time: ts.time,
                pressure: ts.data.instant.details.air_pressure_at_sea_level,
                name: name
            }
        });
    }
    let pressureGeoJson = { type: "FeatureCollection", features: allFeatures };

    let pressureLayer = L.geoJson(pressureGeoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'pressure-label',
                    html: `<span style="background:rgba(230,230,255,0.8);padding:2px 4px;border-radius:4px;border:1px solid #336;font-size:12px;">${feature.properties.pressure} hPa</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });

    overlays.pressure.addLayer(pressureLayer);
}

// Hauptfunktion
(async () => {
    let geojson = await loadGeoJSON("station.geojson");
    await addTemperatureLayer(geojson);
    await addPressureLayer(geojson);
})();

