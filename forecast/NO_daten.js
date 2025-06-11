// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    center: [ibk.lat, ibk.lng],
    zoom: 7,
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        timeInterval: "PT0H/PT24H", // Beispiel: 24 Stunden ab jetzt
        period: "PT1H"              // 1-Stunden-Schritte
    }
});
// thematische Layer
let overlays = {
    temperature: L.featureGroup(),
    pressure: L.featureGroup().addTo(map),
    //cloud: L.featureGroup().addTo(map),
}

// Layer control
L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Temperature": overlays.temperature,
    "Pressure": overlays.pressure,
    //"Cloud fraction": overlays.cloud,
}).addTo(map);


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);


// GeoJSON laden und Temperatur/Pressure-Features erzeugen
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    // Für jede Station Temperatur- und Pressure-Features erzeugen
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[1];
        let lng = geojson.features[i].geometry.coordinates[0];
        let name = geojson.features[i].properties?.Stationsname || "";
        let apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
        let apiResponse = await fetch(apiUrl);
        let jsondata = await apiResponse.json();

        // KI
        // Features für diese Station erzeugen
        let features = jsondata.properties.timeseries.map(ts => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            properties: {
                time: ts.time,
                temp: ts.data.instant.details.air_temperature,
                pressure: ts.data.instant.details.air_pressure_at_sea_level,
                name: name
            }
        }));

        // Die Features als neues Feld an die Station hängen
        geojson.features[i].properties.timeseriesFeatures = features;
        // KI
    }
    return geojson;
}

// Temperatur-Overlay erstellen
async function addTemperatureOverlay(geojson) {
    for (let i = 0; i < geojson.features.length; i++) {
        let features = geojson.features[i].properties.timeseriesFeatures;
        let timeGeoJson = { type: "FeatureCollection", features: features };

        let geoJsonLayer = L.geoJson(timeGeoJson, {
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

        let timedLayer = L.timeDimension.layer.geoJson(geoJsonLayer, {
            updateTimeDimension: true,
            updateTimeDimensionMode: 'replace',
            addlastPoint: false,
            duration: 'PT1H'
        });

        timedLayer.addTo(overlays.temperature);
    }
}

// Pressure-Overlay erstellen
async function addPressureOverlay(geojson) {
    for (let i = 0; i < geojson.features.length; i++) {
        let features = geojson.features[i].properties.timeseriesFeatures;
        let timeGeoJson = { type: "FeatureCollection", features: features };

        let geoJsonLayer = L.geoJson(timeGeoJson, {
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

        let timedLayer = L.timeDimension.layer.geoJson(geoJsonLayer, {
            updateTimeDimension: true,
            updateTimeDimensionMode: 'replace',
            addlastPoint: false,
            duration: 'PT1H'
        });

        timedLayer.addTo(overlays.pressure);
    }
}

// Hauptfunktion
(async () => {
    let geojson = await loadGeoJSON("stations.geojson");
    await addTemperatureOverlay(geojson);
    await addPressureOverlay(geojson);
})();
