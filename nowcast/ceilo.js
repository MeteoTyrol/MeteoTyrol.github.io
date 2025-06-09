/*This is the js file for the radiosond visualisation*/


const ceiloData = {
  "type": "FeatureCollection",
  "features": [
   {
      "type": "Feature",
      "id": 11130,
      "properties": {
        "name": "Kufstein",
        "height_asl_m": 490,
        "type": "CL51"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [12.16278, 47.57528],
      }
    },
    {
      "type": "Feature",
      "id": 111314,
      "properties": {
        "name": "Reutte",
        "height_asl_m": 842,
        "type": "CL31"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [10.71528, 47.49445],
      }
    },
    {
      "type": "Feature",
      "id": 11325,
      "properties": {
        "name": "Jenbach",
        "height_asl_m": 529,
        "type": "CL31"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.75639, 47.38824],
      }
    },
    {
      "type": "Feature",
      "id": "INNCC",
      "properties": {
        "name": "Innsbruck/City",
        "height_asl_m": 585,
        "type": "CL31" 
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.3960, 47.2630],
      }
    },
    {
      "type": "Feature",
      "id": "LOWIC",
      "properties": {
        "name": "Innsbruck/Flughafen",
        "height_asl_m": 576,
        "type": "CL31"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.3439, 47.2603],
      }
    },
    {
      "type": "Feature",
      "id": "KEMAC",
      "properties": {
        "name": "Kematen",
        "height_asl_m": 587,
        "type": "CL31"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.2772, 47.2572],
      }
    },
    {
      "type": "Feature",
      "id": "TELFC",
      "properties": {
        "name": "Telfs",
        "height_asl_m": 623,
        "type": "CL31"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.0731, 47.3031],
      }
    },
    {
      "type": "Feature",
      "id": "RFKAC",
      "properties": {
        "name": "Radfeld/KA",
        "height_asl_m": 510,
        "type": "CL51"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.932307, 47.458925],
      }
    },
    {
      "type": "Feature",
      "id": "W3310584",
      "properties": {
        "name": "CL61 Kom Saigurn",
        "height_asl_m": 1626,
        "type": "CL61"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [12.98545, 47.06925],
      }
    },
    {
      "type": "Feature",
      "id": "11035",
      "properties": {
        "name": "Wien/Hohe Warte",
        "height_asl_m": 198,
        "type": "CL51"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [16.35639, 48.24833],
      }
    },
    {
      "type": "Feature",
      "id": "WKENC",
      "properties": {
        "name": "Wien/Kendlerstrasse",
        "height_asl_m": 236,
        "type": "CL51"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [16.3098, 48.2050],
      }
    },

  ]
};


// Radiosondes
async function loadCeilo(date) {
    
    let geojson = ceiloData;
    
    L.geoJSON(geojson, {
        attribution: 'Datenquelle: <a href= "https://portale.zamg.ac.at/umweltprofile/index.php"> GeoSphere Austria </a>',
        
        pointToLayer: function (feature, latlng) {
            //console.log(feature.properties)
            
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
            let time = feature.properties.launch_time;
            let YYYYMMDD = getYYYYMMDD(date)
            let id = feature.id;
            let url= `https://portale.zamg.ac.at/umweltprofile/data/ceilometer/${id}/${id}_${YYYYMMDD}_MLH.png`;
            let url_full= `https://portale.zamg.ac.at/umweltprofile/data/ceilometer/${id}/${id}_${YYYYMMDD}_CBH.png`;
            //console.log(url);
            layer.bindPopup(`
                <a href=${url} target="ceilo"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a>
                <h4>${feature.properties.name}</h4>
                <a href="${url_full}" target="ceilo">Full Range Plot</a>
            `);
        }
    }).addTo(overlays.ceilo);
}

