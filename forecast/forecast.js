/* Wind & Wetter Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], 7);
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);



// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

async function getData (geojson){
    for (let i = 0; i < geojson.features.length; i++) {
        let lat = geojson.features[i].geometry.coordinates[0]
        let lng = geojson.features[i].geometry.coordinates[1]
        let url = `https://dataset.api.hub.geosphere.at/v1/grid/forecast/chem-v1-1h-4km?parameters=no2_surf&bbox=45.45%2C9.05%2C49.50%2C17.10&forecast_offset=0&output_format=geojson`;
        let response = await fetch(url);
        let jsondata = await response.json();

    }
    console.log(jsondata);
}

//async function getData(latlngArray) {
  //  for (let i = 0; i < latlngArray.length; i++) {
    //    let coord = latlngArray[i];
      //  let url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/chem-v2-1h-3km?parameters=no2surf&lat_lon=${coord.lat}%2C${coord.lng}&forecast_offset=0&output_format=geojson`;
       // let response = await fetch(url);
       // let jsondata = await response.json();
        //console.log(jsondata);
   // }
//}

// KI
// Hilfsfunktion: GeoJSON laden und Koordinaten extrahieren
//async function getLatLngFromGeoJSON(path) {
  //  let response = await fetch(path);
   // let geojson = await response.json();
    // Extrahiere alle Features mit Punkt-Geometrie
   // let coords = geojson.features
   //     .filter(f => f.geometry && f.geometry.type === "Point")
    //    .map(f => ({
      //      lat: f.geometry.coordinates[1],
        //    lng: f.geometry.coordinates[0],
          //  name: f.properties?.Stationsname || ""
  //      }));
  //  return coords;
    
//}
// KI

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



