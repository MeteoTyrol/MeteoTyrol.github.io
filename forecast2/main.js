// center
let center = {
    lat: 47.267222,
    lng: 13.392778
};

// Karte initialisieren
let map = L.map("map", {
    center: [center.lat, center.lng],
    zoom: 8,
    keyboard: false
});

// thematische Layer
let overlays = {
    temperature: L.featureGroup().addTo(map),
    pressure: L.featureGroup(),
    cloud: L.featureGroup(),
    wind: L.featureGroup(),
};

// Layer control
L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Temperature": overlays.temperature,
    "Pressure": overlays.pressure,
    "Cloud Fraction": overlays.cloud,
    "Wind speed": overlays.wind,
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

/* KI_BEGIN */
// Zentral: Daten für alle Layer laden und als dataGeoJson speichern
async function createDataGeoJson(geojson) {
    let allFeatures = [];
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[1];
        let lng = geojson.features[i].geometry.coordinates[0];
        let name = geojson.features[i].properties.Stationsname || "";
        let apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
        let apiResponse = await fetch(apiUrl);
        let jsondata = await apiResponse.json();
        if (!jsondata.properties?.timeseries) continue;
        //console.log(jsondata);
        // Für jeden Zeitpunkt ein Feature erzeugen
        for (let ts of jsondata.properties.timeseries) {
            allFeatures.push({
                type: "Feature",
                geometry: { type: "Point", coordinates: [lng, lat] },
                properties: {
                    time: ts.time,
                    temp: ts.data.instant.details.air_temperature,
                    pressure: ts.data.instant.details.air_pressure_at_sea_level,
                    cloud: ts.data.instant.details.cloud_area_fraction,
                    wind: ts.data.instant.details.wind_speed,
                    name: name
                }
            });
        }
    }
    return { type: "FeatureCollection", features: allFeatures };
}
/* KI_END */

let currentIndex = 0;
// Temperatur-Overlay
async function addTemperatureLayer(dataGeoJson) {
    overlays.temperature.clearLayers();
    function getColor(value) {
        if (value < -10) return "rgba(152,245,255,0.8)";
        if (value < 0) return "rgba(0,144,255,0.8)";
        if (value < 10) return "rgba(0,255,127,0.8)";
        if (value < 20) return "rgba(255,236,139,0.8)";
        if (value < 25) return "rgba(255,165,0,0.8)";
        return "rgba(255,69,0,0.8)";
    }
    let tempLayer = L.geoJson(dataGeoJson, {
        filter: function (feature) {
            // Zeige nur Features mit aktuellem Zeitpunkt
            return feature.properties && feature.properties.time && feature.properties.time === allTimes[currentIndex];
        },
        pointToLayer: function (feature, latlng) {
            let value = feature.properties.temp;
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'temp-label',
                    html: `<span class="map-value-icon-J" style="background:${getColor(value)}">${value}°C</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });
    overlays.temperature.addLayer(tempLayer);
}

// Pressure-Overlay
async function addPressureLayer(dataGeoJson) {
    overlays.pressure.clearLayers();
    let pressureLayer = L.geoJson(dataGeoJson, {
        filter: function (feature) {
            return feature.properties && feature.properties.time && feature.properties.time === allTimes[currentIndex];
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'pressure-label',
                    html: `<span class="map-value-icon-J2">${feature.properties.pressure} hPa</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });
    overlays.pressure.addLayer(pressureLayer);
}

// Cloud-Overlay
async function addCloudLayer(dataGeoJson) {
    overlays.cloud.clearLayers();
    function getColor(value) {
        if (value < 30) return "rgba(191,239,255,0.8)";
        if (value < 60) return "rgba(135,206,250,0.8)";
        return "rgba(0,144,255,0.8)";
    }
    let cloudLayer = L.geoJson(dataGeoJson, {
        filter: function (feature) {
            return feature.properties && feature.properties.time && feature.properties.time === allTimes[currentIndex];
        },
        pointToLayer: function (feature, latlng) {
            let value = feature.properties.cloud
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'cloud-label',
                    html: `<span class="map-value-icon-J" style="background:${getColor(value)}">${value} %</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });
    overlays.cloud.addLayer(cloudLayer);
}

// Wind-Overlay
async function addWindLayer(dataGeoJson) {
    overlays.wind.clearLayers();
    let windLayer = L.geoJson(dataGeoJson, {
        filter: function (feature) {
            return feature.properties && feature.properties.time && feature.properties.time === allTimes[currentIndex];
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'wind-label',
                    html: `<span class="map-value-icon-J2">${feature.properties.wind} m/s</span>`,
                    iconAnchor: [15, 15]
                })
            });
        }
    });
    overlays.wind.addLayer(windLayer);
}

/* KI_BEGIN */
// Alle Zeitpunkte extrahieren (einmalig nach dem Laden)
let allTimes = [];
function extractAllTimes(dataGeoJson) {
    let timesSet = new Set();
    dataGeoJson.features.forEach(f => {
        if (f.properties && f.properties.time) timesSet.add(f.properties.time);
    });
    allTimes = Array.from(timesSet).sort();
}
/* KI_END */

// minimap plugin mit Grundkarte Tirol Sommer als Layer
var osm2 = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png");
var miniMap = new L.Control.MiniMap(osm2, {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);

//fullScreen 
map.addControl(new L.Control.Fullscreen());

// Geo Search
        const searchControl = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.OpenStreetMapProvider(),
            style: "bar",
            searchLabel: "adress search"
        });
        map.addControl(searchControl);

//Leaflet Locate Control
        L.control.locate({
            strings: {
                title: "your location"
            },
            drawCircle: false
        }).addTo(map);

// Reset View
        L.control.resetView({
        position: "topleft",
        title: "show startview",
        latlng: map.getCenter(),
        zoom: map.getZoom(),
        }).addTo(map);

// Hauptfunktion
(async () => {
    let geojson = await loadGeoJSON("station.geojson");
    let dataGeoJson = await createDataGeoJson(geojson);
    extractAllTimes(dataGeoJson);
    await addTemperatureLayer(dataGeoJson);
    await addPressureLayer(dataGeoJson);
    await addCloudLayer(dataGeoJson);
    await addWindLayer(dataGeoJson);

    /* KI_BEGIN */
    // Pfeiltasten-Steuerung
    document.addEventListener('keydown', async function (e) {
        if (!allTimes.length) return;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        if (e.key === "ArrowRight") {
            currentIndex = (currentIndex + 1) % allTimes.length;
        } else if (e.key === "ArrowLeft") {
            currentIndex = (currentIndex - 1 + allTimes.length) % allTimes.length;
        } else {
            return;
        }
        await addTemperatureLayer(dataGeoJson);
        await addPressureLayer(dataGeoJson);
        await addCloudLayer(dataGeoJson);
        await addWindLayer(dataGeoJson);
        // Optional: Zeitstempel im HTML anzeigen
        const tsDiv = document.getElementById('layer-timestamp');
        if (tsDiv) tsDiv.textContent = "Zeit: " + allTimes[currentIndex];
    });

    // Optional: Zeitstempel initial anzeigen
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && allTimes.length) tsDiv.textContent = "Zeit: " + allTimes[currentIndex];
    /* KI_END */
})();

