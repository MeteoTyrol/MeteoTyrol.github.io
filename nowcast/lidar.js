

const lidarData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 11130,
      "properties": {
        "name": "Kufstein",
        "url_template":  "https://portale.zamg.ac.at/umweltprofile/data/windlidar/WR19/WR19_{YYYYMMDD}_Vel.png",
        "height_asl_m": 490,
        "type": "WindRanger 19",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [12.16278, 47.57528],
      }
    },
    {
      "type": "Feature",
      "id": ,
      "properties": {
        "name": "Nafingalm, WR21",
        "url_template_current":  "https://acinn-ertel.uibk.ac.at/ertel/data/wr21_lidar_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/wr21_visu/{YYYYMMDD}.png",
        "height_asl_m": 1928,
        "type": "WindRanger 21",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.71417, 47.21435],
      }
    },
    {
      "type": "Feature",
      "id": ,
      "properties": {
        "name": "Nafingalm, SL88",
        "url_template_current":  "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar/lidar_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar/{YYYYMMDD}.png",
        "height_asl_m": 1928,
        "type": "SL88",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.71417, 47.21435],
      }
    },
    {
        "type": "Feature",
        "id": ,
        "properties": {
        "name": "Innsbruck",
        "url_template_current":  "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar_142/lidar_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar_142/{YYYYMMDD}.png",
        "height_asl_m": 613,
        "type": "SLXR142",
        },
        "geometry": {
        "type": "Point",
        "coordinates": [11.38548, 47.26414 ],
    }
},

  ]
};










// Lidar
async function loadLidar(date) {

  let geojson = lidarData;

  L.geoJSON(geojson, {
    attribution: 'Lidar Data: <a href= "https://ertel2.uibk.ac.at/lidar-uebersicht/"> UIBK </a>' <a href= "https://ertel2.uibk.ac.at/lidar-uebersicht/"> UIBK </a>',

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

