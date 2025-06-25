// Karte initialisieren
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};
// Karte initialisieren
let map = L.map("map", {
    center: [ibk.lat, ibk.lng],
    zoom: 8,
    keyboard: false
});

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

let currentYearIndex = 0;
let lastGeojson = null;

// Temperatur-Layer
async function showTemp(jsondata) {
    overlays.temperature.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let temp = feature.properties.parameters.tl_mittel.data[currentYearIndex];
            if (temp !== null && temp !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #888;font-size:12px;">${temp}°C</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.temperature);
    updateYearInfo();
}

// Pressure-Layer

function showPres(jsondata) {
    overlays.pressure.clearLayers(); // Vorherige Marker entfernen
    
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            //console.log(latlng)
            let pressure = feature.properties.parameters.p.data[currentYearIndex];
            if (pressure === null || pressure === undefined) return null;
            return L.marker(latlng, { 
                icon: L.divIcon({
                    html: `<span>${pressure} hPa</span>`,
                    iconAnchor: [15, 15]
                })
            });
        },
    }).addTo(overlays.pressure);
    updateYearInfo();
}

// Rain-Layer
function showRain(jsondata) {
    overlays.rain.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let rain = feature.properties.parameters.rr.data[currentYearIndex];
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
    updateYearInfo();
}

// Sun-Layer
function showSun(jsondata) {
    overlays.sunshine.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let sun = feature.properties.parameters.so_h.data[currentYearIndex];
            if (sun !== null && sun !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${sun} h</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.sunshine);
    updateYearInfo();
}

// thunderstorms-Layer
function showThunder(jsondata) {
    overlays.thunderstorm.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let thunder = feature.properties.parameters.tage_gew.data[currentYearIndex];
            if (thunder !== null && thunder !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${thunder} days</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.thunderstorm);
    updateYearInfo();
}

// Hail-Layer
function showHail(jsondata) {
    overlays.hail.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let hail = feature.properties.parameters.tage_hagel.data[currentYearIndex];
            if (hail !== null && hail !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${hail} days</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.hail);
    updateYearInfo();
}

// snow-Layer
function showSnow(jsondata) {
    overlays.snow.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let snow = feature.properties.parameters.tage_schfall.data[currentYearIndex];
            if (snow !== null && snow !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${snow} days</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.snow);
    updateYearInfo();
}

// Wind-Layer
function showWind(jsondata) {
    overlays.wind.clearLayers();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            let wind = feature.properties.parameters.vv_mittel.data[currentYearIndex];
            if (wind !== null && wind !== undefined) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:#e0f7fa;padding:2px 6px;border-radius:4px;border:1px solid #00796b;font-size:12px;">${wind} m/s</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        },
    }).addTo(overlays.wind);
    updateYearInfo();
}



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

// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    lastGeojson = geojson;
    console.log(geojson.features[0]);
    showTemp(geojson);
    showRain(geojson);
    showPres(geojson);
    showSun(geojson);
    showThunder(geojson);
    showHail(geojson);
    showSnow(geojson);
    showWind(geojson);
    updateYearInfo();
    //showPressureAtEachPoint(geojson);
};

loadGeoJSON("Jahressatz_lonlat.geojson");

/* KI_BEGINN*/
document.addEventListener('keydown', function(e) {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowLeft") {
        currentYearIndex = Math.max(0, currentYearIndex - 1);
        showTemp(lastGeojson);
        showRain(lastGeojson);
        showPres(lastGeojson);
        showSun(lastGeojson);
        showThunder(lastGeojson);
        showHail(lastGeojson);
        showSnow(lastGeojson);
        showWind(lastGeojson);
    }
    if (e.key === "ArrowRight") {
        currentYearIndex = Math.min(30, currentYearIndex + 1); // Passe 30 ggf. an die Länge deines Arrays an!
        showTemp(lastGeojson);
        showRain(lastGeojson);
        showPres(lastGeojson);
        showSun(lastGeojson);
        showThunder(lastGeojson);
        showHail(lastGeojson);
        showSnow(lastGeojson);
        showWind(lastGeojson);
    }
});
function updateYearInfo() {
    if (!lastGeojson || !lastGeojson.timestamps) return;
    let timestamps = lastGeojson.timestamps;
    if (Array.isArray(timestamps) && timestamps[currentYearIndex]) {
        let year = timestamps[currentYearIndex].slice(0, 4);
        document.getElementById('year-info').textContent = `Year: ${year}`;
    } else {
        document.getElementById('year-info').textContent = '';
    }
}
/*KI_END*/

