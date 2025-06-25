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
    raso: L.featureGroup().addTo(map),
    lidar: L.featureGroup().addTo(map),
    ceilo: L.featureGroup().addTo(map),
    aws: L.featureGroup().addTo(map),
    temp: L.featureGroup(),
    rh: L.featureGroup(),
    wind: L.featureGroup()
};







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


// Global variable to store the selected date
let dateObj = today;

L.control.calendar({
    id: 1,
    position: "topright",
    minDate: "2020-01-01",
    maxDate: getYYYY_MM_DD(today), //max day is today
    onSelectDate: (value) => {
        dateObj = new Date(value); // update global dateObj
        loadAll(value, [450, 1500]); // initial values for height filtering of station data
        addRainViewer();
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


//Action when upper bound is changed
slider.noUiSlider.on('end', function (values) {
    let sliderValues = values.map(Number);
    loadAll(dateObj, sliderValues);
});

//Action when lower bound is changed
slider.noUiSlider.on('start', function (values) {
    let sliderValues = values.map(Number);
    loadAll(dateObj, sliderValues);

});

// Scale
L.control.scale({
    imperial: false,
}).addTo(map);

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
        "Ceilometer": overlays.ceilo,
        "AWS Stations": overlays.aws,
        "Temperature": overlays.temp,
        "Relative Humidity": overlays.rh,
        "Wind": overlays.wind,

    }


).addTo(map);

// GeoJSON asynchron laden
async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();
}

// Rainviewer
function addRainViewer() {
    if (getYYYYMMDD(dateObj) == getYYYYMMDD(today)) {
        map.rainviewerControl = L.control.rainviewer({
            position: 'bottomleft',
            nextButtonText: '   >   ',
            playStopButtonText: '   \u23EF   ',
            prevButtonText: '   <   ',
            positionSliderLabelText: "Time:",
            animationInterval: 500,
            opacity: 0.9
        }).addTo(map);
        /*BEGIN_KI*/
    } else {
        // Remove existing Rainviewer control if present
        if (map.rainviewerControl) {
            map.removeControl(map.rainviewerControl);
            map.rainviewerControl = null;
        }
    }
    /*END_KI*/
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