/*This is the js file for the radiosond visualisation*/


const rasoData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 11120,
      "properties": {
        "name": "INNSBRUCK-FLUGHAFEN, AUSTRIA",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.355, 47.260]
      }
    }
  ]
};





// Radiosondes
async function loadRadiosond() {
    let geojson = rasoData;
    
    L.geoJSON(geojson, {
        attribution: 'Datenquelle: <a href= "https://data.wien.gv.at"> Stadt Wien </a>',
        
        pointToLayer: function (feature, latlng) {
            console.log(feature.properties)
            
            return L.marker(latlng,
                {
                    icon: L.icon({
                        iconUrl: './photo.png',
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37],
                    })
                }
            );
        },
        onEachFeature: function (feature, layer) {
            //console.log(feature.properties);
            let date = "20250608";
            let time = feature.properties.launch_time;
            let id = feature.id;
            let url = `https://weather.uwyo.edu/upperair/imgs/${date}${time}.${id}.skewt.png`;
            console.log(url);
            layer.bindPopup(`
                <a href=${url} target="raso"><img src="${url}" alt="*" style="max-width: 500px; height: auto;"></a>
                <h4>${feature.properties.name}</h4>
                <a href="${url}" target="raso">Skew T Diagramm</a>
            `);
        }
    }).addTo(overlays.raso);
}

loadRadiosond()