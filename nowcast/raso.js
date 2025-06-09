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
        "coordinates": [11.355, 47.260],
      }
    },
    {
      "type": "Feature",
      "id": 10868,
      "properties": {
        "name": "MUENCHEN-OBERSCHLEISSHEIM, GERMANY",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.553, 48.245],
      }
    },
    {
      "type": "Feature",
      "id": 11010,
      "properties": {
        "name": "LINZ/HOERSCHING-FLUGHAFEN, AUSTRIA",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [14.201, 48.232],
      }
    },
    {
      "type": "Feature",
      "id": 11035,
      "properties": {
        "name": "WIEN/HOHE WARTE, AUSTRIA",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [16.358, 48.249],
      }
    },
    {
      "type": "Feature",
      "id": 11240,
      "properties": {
        "name": "GRAZ-THALERHOF-FLUGHAFEN, AUSTRIA",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [15.447, 46.994],
      }
    },
    {
      "type": "Feature",
      "id": 16064,
      "properties": {
        "name": "NOVARA CAMERI, ITALY",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [8.670, 45.530],
      }
    },
    {
      "type": "Feature",
      "id": 06610,
      "properties": {
        "name": "PAYERN, Switzerland",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.943, 46.812],
      }
    },
    {
      "type": "Feature",
      "id": 16045,
      "properties": {
        "name": "RIVOLTO, ITALY",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [13.047, 45.982],
      }
    },
    {
      "type": "Feature",
      "id": 14240,
      "properties": {
        "name": "ZAGREB/MAKSIMIR, CROATIA",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [16.034, 45.821],
      }
    },
    {
      "type": "Feature",
      "id": 10739,
      "properties": {
        "name": "STUTTGART/SCHNARRENBERG, GERMANY",
        "launch_time": "00"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [9.201, 48.828],
      }
    }
  ]
};


// Radiosondes
async function loadRadiosonde(date) {

  let geojson = rasoData;

  L.geoJSON(geojson, {
    attribution: 'Datenquelle: <a href= "https://weather.uwyo.edu/upperair/sounding.shtml"> University of Wyoming </a>',

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
      let time = feature.properties.launch_time;
      let id = feature.id;
      let YYYYMMDD = getYYYYMMDD(date) // convert to YYYYMMDD format because need it in url
      let url = `https://weather.uwyo.edu/upperair/imgs/${YYYYMMDD}${time}.${id}.skewt.png`;
  
      //console.log(dateObject)
      layer.bindPopup(`
                <a href=${url} target="raso"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a>
                <h4>${feature.properties.name}</h4>
                <ul>
                    <li> Station ID: ${id}
                    <li> Date: ${date.toLocaleDateString()}
                    <li> Time: ${time} UTC <!--Uhrzeiten werden in der Meteorologie Standardmäßig in UTC angegeben, desswegen machen wir es auch hier-->
                    <li> <a href="${url}" target="raso">Skew T Diagramm</a>
                <ul> 
            `);
    }
  }).addTo(overlays.raso);
}

