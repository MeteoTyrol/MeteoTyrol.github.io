// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    center: [ibk.lat, ibk.lng],
    zoom: 7,
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        timeInterval: "PT0H/PT24H", // Beispiel: 24 Stunden ab jetzt
        period: "PT1H"              // 1-Stunden-Schritte
    }
});
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);



// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);


async function getData(geojson) {
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[1];
        let lng = geojson.features[i].geometry.coordinates[0];
        let name = geojson.features[i].properties?.Stationsname || "";
        let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
        let response = await fetch(url);
        let jsondata = await response.json();
        //console.log(jsondata.properties.timeseries)

        //KI
        // Erzeuge für jede Zeitstufe einen Punkt als Feature
        let features = jsondata.properties.timeseries.map(ts => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            properties: {
                time: ts.time,
                temp: ts.data.instant.details.air_temperature,
                name: name
            }
        }));

        let timeGeoJson = {
            type: "FeatureCollection",
            features: features
        };

        //KI
        
        // TimeDimension-Layer für diese Station
        let geoJsonLayer = L.geoJson(timeGeoJson, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'temp-label',
                        html: `<span style="background:rgba(255,255,255,0.8);padding:2px 4px;border-radius:4px;border:1px solid #888;font-size:12px;">${feature.properties.temp}°C</span>`,
                        iconAnchor: [15, 15]
                    })
                });
            }
        });

        let timedLayer = L.timeDimension.layer.geoJson(geoJsonLayer, {
            updateTimeDimension: true,
            updateTimeDimensionMode: 'replace',
            addlastPoint: false,
            duration: 'PT1H'
        });

        timedLayer.addTo(map);
    }
}


async function loadGeoJSON(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // Schleife über alle Features
    for (let i = 0; i < geojson.features.length; i++) {
        //console.log(`Index: ${i}`, geojson.features[i].geometry.coordinates[0]);
    }
    return geojson;
}

(async () => {
    let geojson = await loadGeoJSON("../stations.geojson");
    await getData(geojson);
})();
