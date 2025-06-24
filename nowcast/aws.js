// AWS Wetterstationen
// vom AWS Beispiel übernommen und angepasst






async function loadAWS(date) {
    YYYYMMDD = getYYYYMMDD(date)
    YYYYMMDDtoday = getYYYYMMDD(today)
    console.log(YYYYMMDD)
    console.log(YYYYMMDDtoday)
    if (YYYYMMDD == YYYYMMDDtoday) {

        let url = "https://static.avalanche.report/weather_stations/stations.geojson"
        let response = await fetch(url); // await -> warte erst bis die Daten da sind
        let jsondata = await response.json(); //dann die Daten in json umwandeln


        // Wetterstationen mit Icons und Popups
        L.geoJSON(jsondata, {
            attribution: 'AWS Data: <a href= "https://avalanche.report/weather/stations"> AWS </a>',
            pointToLayer: function (feature, latlng) {
                //console.log(feature.properties);
                let iconName = 'anemometer_AWS.png';

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
                //console.log(feature.properties.date)
                //console.log(pointInTime);
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

    else { } // if the date is not today, dont show AWS popups!

}

async function getCurrentParam(param, id) {
    const url_data_temp = "https://dataset.api.hub.geosphere.at/v2/station/current/tawes-v2-10min?parameters={param}&station_ids={id}"
    let url_value = url_data_temp.replace("{param}", param).replace("{id}", id)
    //let value = await fetch(url_value)
    console.log(url_value)
    return url_value
}


// Geosphere Wetterstationen
// vom AWS Beispiel übernommen und angepasst
async function loadGeosphere() {
    const url_stations = "../forecast/station.geojson"
    let response = await fetch(url_stations); // await -> warte erst bis die Daten da sind
    let jsondata = await response.json(); //dann die Daten in json umwandeln


    // Wetterstationen mit Icons und Popups
    L.geoJSON(jsondata, {
        attribution: 'AWS Data: <a href= "https://data.hub.geosphere.at/dataset/klima-v2-10min"> Geosphere Austria</a>',
        pointToLayer: function (feature, latlng) {
            //console.log(feature.properties);
            let iconName = 'anemometer_geosphere.png';
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/${iconName}`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });


        },
        onEachFeature: function (feat_station, layer) {
            console.log(feat_station.properties);
            let id = feat_station.properties.id
            layer.bindPopup(`
                <h4>${feat_station.properties.Stationsname} (${feat_station["properties"]["Höhe [m]"]} m)</h4>
                <ul>
                    <li> Temperature: ${getCurrentParam("TL", id)}
                </ul>
                

        `); // || "-" wird verwendet wenn 0, undifined oder false.
            //Betreiber: <a href="${feature.properties.operatorLink
            //}" target= "betreiber">${feature.properties.operator}</a>`);
        }


    }).addTo(overlays.aws);

}

/* <ul>
                        <li>Temperatur: ${featu.properties.LT !== undefined ? feature.properties.LT.toFixed(1) : "-"} °C</li> <!--- this is a comment--->
                        <li>Relative Luftfeuchte : ${feature.properties.RH || "-"} %</li>
                        <li>Windgeschwindigkeit: ${feature.properties.WG || "-"} m/s</li>
                        <li>Windrichtung: ${feature.properties.WR || "-"}°</li>
                        <li>Schneehöhe: ${feature.properties.HS !== undefined ? feature.properties.HS.toFixed(1) : "-"} cm</li>
                    <ul>*/