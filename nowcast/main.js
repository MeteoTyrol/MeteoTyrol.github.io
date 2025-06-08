//This is the main script for the Data Map. Its based on the europe template from 

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 8,
};



// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// Overlays definieren
let overlays = {
    raso: L.featureGroup().addTo(map),
    lidar: L.featureGroup().addTo(map),
    geosphere: L.featureGroup().addTo(map),
    aws: L.featureGroup().addTo(map),
    uibk: L.featureGroup().addTo(map),
};

// Hintergrund-Layer
L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
    "BasemapAT Relief": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT Oberfläche": L.tileLayer.provider('BasemapAT.surface'),
},
    {
        "Radiosondes": overlays.raso,
        "Lidar": overlays.lidar,
        "Geosphere Stations": overlays.geosphere,
        "AWS Stations": overlays.aws,
        "UIBK Stations": overlays.uibk,

    }


).addTo(map);




// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();

}
//loadGeoJSON(<URL>);
