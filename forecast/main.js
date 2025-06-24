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
let map = L.map("map", {
    center: [center.lat, center.lng],
    zoom: 9,
    keyboard: false
});
// thematische Layer
let overlays = {
    NO2: L.featureGroup().addTo(map),
    O3: L.featureGroup(),
    PM10: L.featureGroup()
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

let jsondatano2, jsondatao3, jsondatapm10;

async function getDataNO2() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=no2surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    jsondatano2 = await response.json();
    //console.log(jsondatano2)
    showNO2(jsondatano2);
}

async function getDataO3() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=o3surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    jsondatao3 = await response.json();
    //console.log(jsondatao3);
    showO3(jsondatao3);

}

async function getDataPM10() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=pm10surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    jsondatapm10 = await response.json();
    //console.log(jsondatapm10);
    showPM10(jsondatapm10);
}

function formatTimestamp(ts) {
    // Beispiel: "2024-06-25T13:00:00Z" → "25.06.2024 13:00"
    const d = new Date(ts);
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let currentNO2Index = 0;
let currentO3Index = 0;
let currentPM10Index = 0;

function showNO2(jsondatano2) {
    let times = jsondatano2.timestamps;

    function getNO2Color(value) {
        if (value < 40) return "#00CD00";
        if (value < 100) return "#ffff00";
        if (value < 150) return "#ff7e00";
        if (value < 200) return "#ff0000";
        if (value < 400) return "#8f3f97";
        return "#7e0023";
    }

    function updateNO2Layer() {
        overlays.NO2.clearLayers();
        L.geoJson(jsondatano2, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.no2surf.data[currentNO2Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:${getNO2Color(value)}55;padding:2px 6px;border-radius:4px;border:1px solid #888;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.NO2);
    }



    // Initial anzeigen
    updateNO2Layer();

    // Zeitstempel im HTML anzeigen
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && times && times.length > 0) {
        tsDiv.textContent = "Zeit: " + formatTimestamp(times[currentNO2Index]);
    }
}

function showO3(jsondatao3) {
    let times = jsondatao3.timestamps;
    function getO3Color(value) {
        if (value < 60) return "#00CD00";
        if (value < 120) return "#ffff00";
        if (value < 180) return "#ff7e00";
        if (value < 240) return "#ff0000";
        if (value < 300) return "#8f3f97";
        return "#7e0023";
    }

    function updateO3Layer() {
        overlays.O3.clearLayers();
        L.geoJson(jsondatao3, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.o3surf.data[currentO3Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:${getO3Color(value)}55;padding:2px 6px;border-radius:4px;border:1px solid #88c;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.O3);
    }

    updateO3Layer();
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && times && times.length > 0) {
        tsDiv.textContent = "Zeit: " + formatTimestamp(times[currentO3Index]);
    }
}

function showPM10(jsondatapm10) {
    let times = jsondatapm10.timestamps;

    function getPMColor(value) {
        if (value < 20) return "#00CD00";
        if (value < 40) return "#ffff00";
        if (value < 50) return "#ff7e00";
        if (value < 100) return "#ff0000";
        if (value < 150) return "#8f3f97";
        return "#7e0023";
    }

    function updatePM10Layer() {
        overlays.PM10.clearLayers();
        L.geoJson(jsondatapm10, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.pm10surf.data[currentPM10Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:${getPMColor(value)}55;padding:2px 6px;border-radius:4px;border:1px solid #cc8;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.PM10);
    }

    updatePM10Layer();
    const tsDiv = document.getElementById('layer-timestamp');
    if (tsDiv && times && times.length > 0) {
        tsDiv.textContent = "Zeit: " + formatTimestamp(times[currentPM10Index]);
    }
}


// minimap plugin mit Grundkarte Tirol Sommer als Layer
var osm2 = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png");
var miniMap = new L.Control.MiniMap(osm2, {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);

//fullScreen 
map.addControl(new L.Control.Fullscreen());


// Hauptfunktion
(async () => {
    await getDataNO2();
    await getDataO3();
    await getDataPM10();
})();

document.addEventListener('keydown', function (e) {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    // NO2
    if (jsondatano2 && jsondatano2.timestamps) {
        if (e.key === "ArrowLeft") {
            currentNO2Index = (currentNO2Index - 1 + jsondatano2.timestamps.length) % jsondatano2.timestamps.length;
            showNO2(jsondatano2);
        }
        if (e.key === "ArrowRight") {
            currentNO2Index = (currentNO2Index + 1) % jsondatano2.timestamps.length;
            showNO2(jsondatano2);
        }
    }
    // O3
    if (jsondatao3 && jsondatao3.timestamps) {
        if (e.key === "ArrowLeft") {
            currentO3Index = (currentO3Index - 1 + jsondatao3.timestamps.length) % jsondatao3.timestamps.length;
            showO3(jsondatao3);
        }
        if (e.key === "ArrowRight") {
            currentO3Index = (currentO3Index + 1) % jsondatao3.timestamps.length;
            showO3(jsondatao3);
        }
    }
    // PM10
    if (jsondatapm10 && jsondatapm10.timestamps) {
        if (e.key === "ArrowLeft") {
            currentPM10Index = (currentPM10Index - 1 + jsondatapm10.timestamps.length) % jsondatapm10.timestamps.length;
            showPM10(jsondatapm10);
        }
        if (e.key === "ArrowRight") {
            currentPM10Index = (currentPM10Index + 1) % jsondatapm10.timestamps.length;
            showPM10(jsondatapm10);
        }
    }
});