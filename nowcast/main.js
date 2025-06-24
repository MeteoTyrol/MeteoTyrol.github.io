//This is the main script for the Data Map. Its based on the europe template from 

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 8,
};

//heutingen tag global initialisieren
let today = new Date()

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// Overlays definieren
let overlays = {
    raso: L.featureGroup(),
    lidar: L.featureGroup(),
    geosphere: L.featureGroup(),
    aws: L.featureGroup(),
    uibk: L.featureGroup(),
    ceilo: L.featureGroup(),
    temp: L.featureGroup(),
    rh: L.featureGroup(),
    wind: L.featureGroup().addTo(map),
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
        "Temperature": overlays.temp,
        "Ceilometer": overlays.ceilo,
        "Relative Humidity": overlays.rh,
        "Wind": overlays.wind,

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
    // Remove time part for accurate day comparison
    today.setHours(0, 0, 0, 0);

    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);

    const diffTime = today - givenDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 2;
}
/* KI_END */


// Global variable to store the selected date
let dateObj = today;

L.control.calendar({
    id: 1,
    minDate: "2020-01-01",
    maxDate: getYYYY_MM_DD(today), //max day is today
    onSelectDate: (value) => {
        dateObj = new Date(value); // update global dateObj
        loadAll(value, [450, 1500]); // initial values for height filtering of station data
    },
    triggerFunctionOnLoad: true,
}).addTo(map);



var slider = document.getElementById('slider');



noUiSlider.create(slider, {
    start: [500, 1500],
    step: 100,
    connect: true,
    range: {
        'min': 450,
        'max': 3500
    },

    pips: {
        mode: 'steps',
        density: 4,
        format: wNumb({
            decimals: 0,
            suffix: 'm'
        })
    },
    tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
    //format: wNumb({decimals:1}),
});



slider.noUiSlider.on('end', function (values) {
    let sliderValues = values.map(Number);
    loadAll(dateObj, sliderValues);
});

slider.noUiSlider.on('start', function (values) {
    let sliderValues = values.map(Number);
    loadAll(dateObj, sliderValues);

});

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();

}

function loadAll(date_raw, sliderValues) {
    // calendar returns the format YYYY-MM-DD
    let dateObj = new Date(date_raw) //convert to Date object
    loadRadiosonde(dateObj);
    loadCeilo(dateObj);
    loadLidar(dateObj);
    loadAWS(dateObj, sliderValues); 
    loadTemp(dateObj, sliderValues);
    loadRH(dateObj, sliderValues);
    loadWind(dateObj, sliderValues);
    
}