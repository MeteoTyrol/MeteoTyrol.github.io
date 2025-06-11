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
    raso: L.featureGroup(),
    lidar: L.featureGroup().addTo(map),
    geosphere: L.featureGroup(),
    aws: L.featureGroup(),
    uibk: L.featureGroup(),
    ceilo: L.featureGroup(),
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
        "Ceilometer": overlays.ceilo

    }


).addTo(map);



// DATE handling

function getYYYYMMDD(date) {
    // This function returns the date in YYYYMMDD format
    // date should be a Date() object
    /* KI_BEGIN */
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
}
/* KI_END */

// get the Date Object for today
let today = Date()


L.control.calendar({
    id: 1,
    minDate: "2024-01-01",
    onSelectDate: (value) => loadAll(value),
    triggerFunctionOnLoad: true,

}).addTo(map);

function loadAll(date_raw) {
    // calendar returns the format YYYY-MM-DD
    let dateObj = new Date(date_raw) //convert to Date object
    loadRadiosonde(dateObj);
    loadCeilo(dateObj);
    loadLidar(dateObj)
}



// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();

}