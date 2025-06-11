/* Wind & Wetter Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], 5);

// thematische Layer
let overlays = {
    forecast: L.featureGroup().addTo(map),
    wind: L.featureGroup().addTo(map),
}

// Layer Control
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery").addTo(map)
}, {
    "Wettervorhersage MET Norway": overlays.forecast,
    "ECMWF Windvorhersage": overlays.wind,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

async function getData() {
    // BBOX für Österreich: süd, west, nord, ost
    // Süd: 46.372276, West: 9.530952, Nord: 49.020608, Ost: 17.160776
    let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v1-1h-4km?parameters=no2surf&bbox=46.372276%2C9.530952%2C49.020608%2C17.160776&forecast_offset=0&output_format=geojson`;
    let response = await fetch(url);
    let jsondata = await response.json();
    console.log(jsondata.features[0].properties.parameters)

    // Features durchgehen und NO2-Wert als Marker anzeigen
    jsondata.features.forEach(f => {
        if (
            f.geometry &&
            f.geometry.type === "Point" &&
            f.geometry.coordinates.length === 2 &&
            f.properties &&
            typeof f.properties.no2surf === "number"
        ) {
            const lat = f.geometry.coordinates[1];
            const lng = f.geometry.coordinates[0];
            const no2 = f.properties.no2surf;
            L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'no2-label',
                    html: `<span style="background:rgba(255,255,255,0.8);padding:2px 4px;border-radius:4px;border:1px solid #888;font-size:12px;">${no2}</span>`,
                    iconAnchor: [15, 15]
                })
            }).addTo(overlays.forecast);
        }
    });
}

getData();
