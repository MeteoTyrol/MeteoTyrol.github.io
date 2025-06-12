// AWS Wetterstationen
// vom AWS Beispiel übernommen und angepasst
async function loadAWS() {
    let url = "https://static.avalanche.report/weather_stations/stations.geojson"
    let response = await fetch(url); // await -> warte erst bis die Daten da sind
    let jsondata = await response.json(); //dann die Daten in json umwandeln
    

    // Wetterstationen mit Icons und Popups
    L.geoJSON(jsondata, {
        attribution: 'AWS Data: <a href= "https://avalanche.report/weather/stations"> AWS </a>',
        pointToLayer: function (feature, latlng) {
            //console.log(feature.properties);
            let iconName = 'wifi.png';

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/${iconName}`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });


        },
        onEachFeature: function (feature, layer) {
            //console.log(feature);
            let pointInTime = new Date(feature.properties.date); //new date macht aus dem String ein Date-Objekt
            console.log(feature.properties.date)
            console.log(pointInTime);
            layer.bindPopup(`
                <h4>${feature.properties.name} (${feature.geometry.coordinates[2]}m)</h4>
                    <ul>
                        <li>Temperatur: ${feature.properties.LT !== undefined ? feature.properties.LT.toFixed(1) : "-"} °C</li> <!--- this is a comment--->
                        <li>Relative Luftfeuchte : ${feature.properties.RH || "-"} %</li>
                        <li>Windgeschwindigkeit: ${feature.properties.WG || "-"} m/s</li>
                        <li>Windrichtung: ${feature.properties.WR || "-"}°</li>
                        <li>Schneehöhe: ${feature.properties.HS !== undefined ? feature.properties.HS.toFixed(1) : "-"} cm</li>
                    <ul>
                <span>${pointInTime.toLocaleString()}</span>

        `); // || "-" wird verwendet wenn 0, undifined oder false.
            //Betreiber: <a href="${feature.properties.operatorLink
            //}" target= "betreiber">${feature.properties.operator}</a>`);
        }


    }).addTo(overlays.aws);
    


}