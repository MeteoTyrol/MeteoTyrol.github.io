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
    geosphere: L.featureGroup(),
    aws: L.featureGroup(),
    uibk: L.featureGroup(),
    ceilo: L.featureGroup().addTo(map),
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
        //"Geosphere Stations": overlays.geosphere,
        "AWS Stations": overlays.aws,
        //"UIBK Stations": overlays.uibk,
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
/*KI_END*/

/*KI_BEGIN*/
function getYYYY_MM_DD(date) {
    // This function returns the date in YYYY-MM-DD format
    // date should be a Date() object
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
/*KI_END*/

/*KI_BEGIN*/
function isWithinPast3Days(date) {
    const today = new Date();
    // Remove time part for accurate day comparison
    today.setHours(0, 0, 0, 0);

    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);

    const diffTime = today - givenDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 2;
}
/* KI_END */


L.control.calendar({
    id: 1,
    minDate: "2020-01-01",
    maxDate: getYYYY_MM_DD(new Date()), //max day is today
    onSelectDate: (value) => loadAll(value),
    triggerFunctionOnLoad: true,

}).addTo(map);

function loadAll(date_raw) {
    // calendar returns the format YYYY-MM-DD
    let dateObj = new Date(date_raw) //convert to Date object
    loadRadiosonde(dateObj);
    loadCeilo(dateObj);
    loadLidar(dateObj);
    loadAWS();
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