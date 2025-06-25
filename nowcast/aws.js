// AWS Wetterstationen
// vom AWS Beispiel übernommen und angepasst


const COLORS = {
    temperature: [ //Temperature in °C
        { min: -100, max: -25, color: "#9f80ff" },
        { min: -25, max: -20, color: "#784cff" },
        { min: -20, max: -15, color: "#0f5abe" },
        { min: -15, max: -10, color: "#1380ff" },
        { min: -10, max: -5, color: "#19cdff" },
        { min: -5, max: 0, color: "#8fffff" },
        { min: 0, max: 5, color: "#b0ffbc" },
        { min: 5, max: 10, color: "#ffff73" },
        { min: 10, max: 15, color: "#ffbe7d" },
        { min: 15, max: 20, color: "#ff9b41" },
        { min: 20, max: 25, color: "#ff5a41" },
        { min: 25, max: 30, color: "#ff1e23" },
        { min: 30, max: 100, color: "#fa3c96" },

    ],
    relativeHumidity: [ //colormap similar to matplotlib YlGn that is often used for RH
        //RH in %
        /*BEGIN_KI*/
        { min: 0, max: 5, color: "#ffffe5" },
        { min: 5, max: 10, color: "#f7fcb9" },
        { min: 10, max: 15, color: "#d9f0a3" },
        { min: 15, max: 20, color: "#addd8e" },
        { min: 20, max: 25, color: "#78c679" },
        { min: 25, max: 30, color: "#41ab5d" },
        { min: 30, max: 35, color: "#238443" },
        { min: 35, max: 40, color: "#005a32" },
        { min: 40, max: 45, color: "#f7fcb9" },
        { min: 45, max: 50, color: "#d9f0a3" },
        { min: 50, max: 55, color: "#addd8e" },
        { min: 55, max: 60, color: "#78c679" },
        { min: 60, max: 65, color: "#41ab5d" },
        { min: 65, max: 70, color: "#238443" },
        { min: 70, max: 75, color: "#006837" },
        { min: 75, max: 80, color: "#004529" },
        { min: 80, max: 85, color: "#e5f5e0" },
        { min: 85, max: 90, color: "#c7e9c0" },
        { min: 90, max: 95, color: "#a1d99b" },
        { min: 95, max: 100, color: "#74c476" },
        { min: 100, max: 100, color: "#00441b" }
        /*END_KI*/
    ],


    windSpeed: [ // this color map is a custom color map from ACINN used for windspeed in lidar visualizations
        // Windspeed in m/s
        { min: 0, max: 1, color: "#fefeff" },
        { min: 1, max: 2, color: "#fffdca" },
        { min: 2, max: 3, color: "#e1f38a" },
        { min: 3, max: 4, color: "#aae683" },
        { min: 4, max: 5, color: "#6ddc88" },
        { min: 5, max: 6, color: "#00d095" },
        { min: 6, max: 7, color: "#01c5a4" },
        { min: 7, max: 8, color: "#01b9b5" },
        { min: 8, max: 9, color: "#01acc1" },
        { min: 9, max: 10, color: "#009ecd" },
        { min: 10, max: 11, color: "#0191d4" },
        { min: 11, max: 12, color: "#377ed9" },
        { min: 12, max: 13, color: "#706cd8" },
        { min: 13, max: 14, color: "#9058d3" },
        { min: 14, max: 15, color: "#a845c9" },
        { min: 15, max: 16, color: "#b633bc" },
        { min: 16, max: 17, color: "#c123ac" },
        { min: 17, max: 18, color: "#c2315d" },
        { min: 18, max: 19, color: "#d36649" },
        { min: 19, max: 20, color: "#f68b45" },
        { min: 20, max: 100, color: "#ffcc4f" } // 20+ case
    ]
}

function getColor(value, ramp) {
    for (let rule of ramp) {
        //console.log("rule", rule);
        if (value >= rule.min && value < rule.max) {
            return rule.color; // return is an automatic break
        }
    }
}



async function loadAWS(date, sliderValues) {
    YYYYMMDD = getYYYYMMDD(date)
    YYYYMMDDtoday = getYYYYMMDD(today)

    if (YYYYMMDD == YYYYMMDDtoday) {

        let url = "https://static.avalanche.report/weather_stations/stations.geojson"
        let response = await fetch(url); // await -> warte erst bis die Daten da sind
        let jsondata = await response.json(); //dann die Daten in json umwandeln

        overlays.aws.clearLayers(); //clear overlay before adding markers
        min_height = sliderValues[0]
        max_height = sliderValues[1]


        // Wetterstationen mit Icons und Popups
        L.geoJSON(jsondata, {
            filter: function (feature) {
                if (feature.geometry.coordinates[2] < max_height && feature.geometry.coordinates[2] > min_height) { return true }
            },
            pointToLayer: function (feature, latlng) {
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

                let pointInTime = new Date(feature.properties.date); //new date macht aus dem String ein Date-Objekt
                ;
                layer.bindPopup(`
                <div class="aws-popup">
                <h4>${feature.properties.name} (${feature.geometry.coordinates[2]}m)</h4>
                    <span>Updated: ${pointInTime.toLocaleString()}</span>
                    <ul>
                        <li>Temperatur: ${feature.properties.LT !== undefined ? feature.properties.LT.toFixed(1) : "-"} °C</li> <!--- this is a comment--->
                        <li>Relative Luftfeuchte : ${feature.properties.RH || "-"} %</li>
                        <li>Windgeschwindigkeit: ${feature.properties.WG || "-"} m/s</li>
                        <li>Windrichtung: ${feature.properties.WR || "-"}°</li>
                    <ul>
                </div>
                

        `); // || "-" wird verwendet wenn 0, undifined oder false.
                //Betreiber: <a href="${feature.properties.operatorLink
                //}" target= "betreiber">${feature.properties.operator}</a>`);
            }


        }).addTo(overlays.aws);
    }

    else { overlays.aws.clearLayers(); } // if the date is not today, dont show AWS popups and markers!

}


async function loadTemp(date, sliderValues) {
    YYYYMMDD = getYYYYMMDD(date)
    YYYYMMDDtoday = getYYYYMMDD(today)

    if (YYYYMMDD == YYYYMMDDtoday) {

        let url = "https://static.avalanche.report/weather_stations/stations.geojson"
        let response = await fetch(url); // await -> warte erst bis die Daten da sind
        let jsondata = await response.json(); //dann die Daten in json umwandeln


        min_height = sliderValues[0]
        max_height = sliderValues[1]


        // Wetterstationen mit Icons und Popups
        overlays.temp.clearLayers(); //clear overlay before adding markers

        L.geoJSON(jsondata, {
            filter: function (feature) {
                if (feature.geometry.coordinates[2] < max_height && feature.geometry.coordinates[2] > min_height) {
                    if (feature.properties.LT !== undefined) { return true }
                }
            },
            pointToLayer: function (feature, latlng) {
                let color = getColor(feature.properties.LT, COLORS.temperature);
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style ="background-color:${color}">${feature.properties.LT || "-"}°C </span>`,
                        className: "aws-div-icon",

                    }),
                });


            },
        }).addTo(overlays.temp);
    }

    else { overlays.temp.clearLayers(); } // if the date is not today, dont show popups or markers!

}

async function loadRH(date, sliderValues) {
    YYYYMMDD = getYYYYMMDD(date)
    YYYYMMDDtoday = getYYYYMMDD(today)

    if (YYYYMMDD == YYYYMMDDtoday) {

        let url = "https://static.avalanche.report/weather_stations/stations.geojson"
        let response = await fetch(url); // await -> warte erst bis die Daten da sind
        let jsondata = await response.json(); //dann die Daten in json umwandeln


        min_height = sliderValues[0]
        max_height = sliderValues[1]


        // Wetterstationen mit Icons und Popups
        overlays.rh.clearLayers(); //clear overlay before adding markers

        L.geoJSON(jsondata, {
            filter: function (feature) {
                if (feature.geometry.coordinates[2] < max_height && feature.geometry.coordinates[2] > min_height) {
                    if (feature.properties.RH !== undefined) { return true }
                }
            },

            pointToLayer: function (feature, latlng) {
                let color = getColor(feature.properties.RH, COLORS.relativeHumidity);
                // dont show anything if RH undefined

                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style ="background-color:${color}">${feature.properties.RH}% </span>`,
                        className: "aws-div-icon",

                    }),
                });

            },


        }).addTo(overlays.rh);
    }

    else { overlays.rh.clearLayers(); } // if the date is not today, dont show popups or markers!

}


async function loadWind(date, sliderValues) {
    YYYYMMDD = getYYYYMMDD(date)
    YYYYMMDDtoday = getYYYYMMDD(today)

    if (YYYYMMDD == YYYYMMDDtoday) {

        let url = "https://static.avalanche.report/weather_stations/stations.geojson"
        let response = await fetch(url); // await -> warte erst bis die Daten da sind
        let jsondata = await response.json(); //dann die Daten in json umwandeln


        min_height = sliderValues[0]
        max_height = sliderValues[1]


        // Wetterstationen mit Icons und Popups
        overlays.wind.clearLayers(); //clear overlay before adding markers

        L.geoJSON(jsondata, {
            filter: function (feature) {
                //console.log(feature)
                if (feature.geometry.coordinates[2] < max_height && feature.geometry.coordinates[2] > min_height) {
                    if (feature.properties.WG !== undefined) { return true }
                }
            },

            pointToLayer: function (feature, latlng) {
                let wind_ms = feature.properties.WG / 3.6
                let color = getColor(wind_ms, COLORS.windSpeed);

                // round direction values to degrees because wind direction measurements are quite uncertain
                //let dir = feature.properties.WR !== undefined ? feature.properties.WR.toFixed(0) : "-";
                let dir = feature.properties.WR !== undefined ? feature.properties.WR.toFixed(0) : "-";
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<span style="background-color: ${color}; display: flex; align-items: center; gap: 0px;">
                                <i style="transform: rotate(${feature.properties.WR}deg); color:black" class="fa-solid fa-circle-arrow-down"></i>
                                <span style="background-color:${color};">${feature.properties.WG.toFixed(0)}m/s</span>
                            </span>`,
                        className: "aws-div-icon-winddir",
                    }),
                });
            },


        }).addTo(overlays.wind);
    }

    else { overlays.wind.clearLayers(); } // if the date is not today, dont show popups or markers!

}


//Everything underneath this line was form my try to acces the Geosphere stations
//But because their API does not allow so many requests (in the way i tried) 
//This mission was aborted and all code below is left for someone else to try again

function strIDs(jsondata) {
    str = "";
    for (let i = 0; i < 492; i++) {
        let id = jsondata.features[i].properties.id;
        str += "station_ids="
        str += id
        str += "&"
    }
    return str;
}

async function getCurrentParam(param, jsondata) {
    stationid_str = strIDs(jsondata)
    const url_temp = "https://dataset.api.hub.geosphere.at/v1/station/current/tawes-v1-10min?parameters={param}&{id}&output_format=geojson"
    let url_value = url_temp.replace("{param}", param).replace("{id}", stationid_str)
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
        //filter: funciton (feature) {
        //if feature.properties
        //},

        pointToLayer: function (feature, latlng) {
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
            console.log(feat_station);
            let id = feat_station.properties.id
            layer.bindPopup(`
                <h4>${feat_station.properties.Stationsname} (${feat_station["properties"]["Höhe [m]"]} m)</h4>
                <ul>
                    <li> Temperature: ${getCurrentParam("TL", jsondata)}
                </ul>
                

        `); // || "-" wird verwendet wenn 0, undifined oder false.
            //Betreiber: <a href="${feature.properties.operatorLink
            //}" target= "betreiber">${feature.properties.operator}</a>`);
        }


    }).addTo(overlays.aws);

}

