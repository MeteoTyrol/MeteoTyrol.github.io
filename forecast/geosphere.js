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
    NO2: L.featureGroup().addTo(map),
    O3: L.featureGroup(),
    PM10: L.featureGroup()
}

// Layer Control
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map)
}, {
    "NO2": overlays.NO2,
    "Ozone": overlays.O3,
    "PM 10": overlays.PM10
}).addTo(map);




// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

async function getDataNO2() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=no2surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    let jsondatano2 = await response.json();
    //console.log(jsondatano2.features.properties)
    showNO2(jsondatano2);
}

async function getDataO3() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=o3surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    let jsondatao3 = await response.json();
    //console.log(jsondatao3);
    showO3(jsondatao3);

}

async function getDataPM10() {
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v2-1h-9km?parameters=pm10surf&bbox=46.51%2C10.14%2C47.64%2C13.17&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    let jsondatapm10 = await response.json();
    //console.log(jsondatapm10);
    showPM10(jsondatapm10);
}

let currentNO2Index = 0;
let currentO3Index = 0;
let currentPM10Index = 0;

function showNO2(jsondatano2) {
    let times = jsondatano2.timestamps;
    if (!times) {
        console.error("Keine Zeitachse gefunden!");
        return;
    }

    function updateNO2Layer() {
        overlays.NO2.clearLayers();
        L.geoJson(jsondatano2, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.no2surf.data[currentNO2Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:rgba(255,255,255,0.9);padding:2px 6px;border-radius:4px;border:1px solid #888;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.NO2);
    }

    // Buttons für die Steuerung
    const leftBtn = document.getElementById('no2-left');
    const rightBtn = document.getElementById('no2-right');
    if (leftBtn && rightBtn) {
        leftBtn.onclick = function () {
            currentNO2Index = (currentNO2Index - 1 + times.length) % times.length;
            updateNO2Layer();
        };
        rightBtn.onclick = function () {
            currentNO2Index = (currentNO2Index + 1) % times.length;
            updateNO2Layer();
        };
    }

    // Initial anzeigen
    updateNO2Layer();
}

function showO3(jsondatao3) {
    let times = jsondatao3.timestamps;
    if (!times) {
        console.error("Keine Zeitachse gefunden!");
        return;
    }

    function updateO3Layer() {
        overlays.O3.clearLayers();
        L.geoJson(jsondatao3, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.o3surf.data[currentO3Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:rgba(230,255,255,0.9);padding:2px 6px;border-radius:4px;border:1px solid #88c;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.O3);
    }

    // Buttons für O3
    const leftBtn = document.getElementById('o3-left');
    const rightBtn = document.getElementById('o3-right');
    if (leftBtn && rightBtn) {
        leftBtn.onclick = function () {
            currentO3Index = (currentO3Index - 1 + times.length) % times.length;
            updateO3Layer();
        };
        rightBtn.onclick = function () {
            currentO3Index = (currentO3Index + 1) % times.length;
            updateO3Layer();
        };
    }

    updateO3Layer();
}

function showPM10(jsondatapm10) {
    let times = jsondatapm10.timestamps;

    function updatePM10Layer() {
        overlays.PM10.clearLayers();
        L.geoJson(jsondatapm10, {
            pointToLayer: function (feature, latlng) {
                let value = feature.properties.parameters.pm10surf.data[currentPM10Index];
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background:rgba(255,240,200,0.9);padding:2px 6px;border-radius:4px;border:1px solid #cc8;font-size:12px;">${value}</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        }).addTo(overlays.PM10);
    }

    // Buttons für PM10
    const leftBtn = document.getElementById('pm10-left');
    const rightBtn = document.getElementById('pm10-right');
    if (leftBtn && rightBtn) {
        leftBtn.onclick = function () {
            currentPM10Index = (currentPM10Index - 1 + times.length) % times.length;
            updatePM10Layer();
        };
        rightBtn.onclick = function () {
            currentPM10Index = (currentPM10Index + 1) % times.length;
            updatePM10Layer();
        };
    }

    updatePM10Layer();
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