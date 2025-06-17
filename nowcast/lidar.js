let today = new Date()



const lidarData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 11130,
      "properties": {
        "name": "Kufstein",
        "location": "Kufstein",
        "provider": "Geosphere Austria",
        "provider_url": "https://geosphere.at/de",
        "url_template": "https://portale.zamg.ac.at/umweltprofile/data/windlidar/WR19/WR19_{YYYYMMDD}_Vel.png",
        "height_asl_m": 490,
        "type": "WindRanger 200",
        "type_url": "https://metek.de/product/wind-ranger-100-200/"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [12.16278, 47.57528],
      }
    },
    {
      "type": "Feature",
      "id": 0,
      "properties": {
        "name": "Nafingalm, WR21",
        "location": "Nafingalm",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_current": "https://ertel2.uibk.ac.at/ertel/wr21_lidar_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/wr21_visu/{YYYYMMDD}.png",
        "height_asl_m": 1928,
        "type": "WindRanger 200",
        "type_url": "https://metek.de/product/wind-ranger-100-200/"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.71417, 47.21435],
      }
    },
    {
      "type": "Feature",
      "id": 0,
      "properties": {
        "name": "Nafingalm, SL88",
        "location": "Nafingalm",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_current": "https://ertel2.uibk.ac.at/ertel/data/pngs/lidar_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar/{YYYYMMDD}.png",
        "height_asl_m": 1928,
        "type": "SL88",
        "type_url": "https://halo-photonics.com/lidar-systems/streamline-vs/",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.71425, 47.21437],
      }
    },
    {
      "type": "Feature",
      "id": 0,
      "properties": {
        "name": "Innsbruck",
        "location": "Innsbruck, University, Innrain",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_current": "https://ertel2.uibk.ac.at/ertel/data/pngs/lidar142_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar_142/{YYYYMMDD}.png",
        "height_asl_m": 613,
        "type": "SLXR142",
        "type_url": "https://halo-photonics.com/lidar-systems/streamline-allsky-series/",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.38548, 47.26414],
      }
    },

  ]
};

// Lidar
async function loadLidar(date) {

  let geojson = lidarData;

  L.geoJSON(geojson, {
    attribution: 'Lidar Data: <a href= "https://ertel2.uibk.ac.at/lidar-uebersicht/"> UIBK</a>, <a href= "https://portale.zamg.ac.at/umweltprofile/index.php"> Geosphere </a>',

    pointToLayer: function (feature, latlng) {
      return L.marker(latlng,
        {
          icon: L.icon({
            iconUrl: './icons/lidar.png',
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
      let YYYYMMDDtoday = getYYYYMMDD(today) // need to convert too to cut the time for comparison
      let url = "";
      let Popuptext = `<h4>Lidar ${feature.properties.name} </h4>
            <ul>
              <li> Location: ${feature.properties.location}
              <li> Provider: <a href = "${feature.properties.provider_url}">${feature.properties.provider}</a>
              <li> Type: <a href=${feature.properties.type_url}>${feature.properties.type}</a>
              <li> Date: ${date.toLocaleDateString()}</li>
            </ul>
            
          `


      //For today, need other URL for UIKB stations
      if (YYYYMMDD == YYYYMMDDtoday) {
        if (feature.properties.provider == "Geosphere Austria") {
          url += feature.properties.url_template.replace("{YYYYMMDD}", YYYYMMDD);
        }
        else { url += feature.properties.url_current; }

        //create Popup
        layer.bindPopup(`
                <a href=${url} target="lidar"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a> 
            ` + Popuptext
        );
      }


      // Times in the past
      else {
        url = feature.properties.url_template.replace('{YYYYMMDD}', YYYYMMDD);
        /*KI_BEGIN, Kommentare selbst hinzugefügt und Popups selbst geschrieben*/
        const img = new window.Image(); //initilaize Image
        // wenn das laden Funktioniert, lade den Popup mit Bild und Links
        img.onload = function () {
          /*KI_END*/
          layer.bindPopup(`
            <div class="lidar-popup">
            <a href="${url}" target="lidar"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a>
            ` + Popuptext +
            `</div>`);
        };
        /*KI_BEGIN*/
        img.onerror = function () {
        /*KI_END*/
          // wenn das laden nicht funktioniert
          //Geosphere: nichts älteres als 3 Tage
          if (feature.properties.provider == "Geosphere Austria") {
            layer.bindPopup(`
            <p><b>Image not available</b> <br>
            Geosphere Austria only provides Lidar data for the past three days. See <a href="https://portale.zamg.ac.at/umweltprofile/index.php">Umweltprofile</a></p>
          ` + Popuptext +
            `</div>`);
          }
          // UIBK: Brauche VPN für vergangene plots, mache einen Popup mit Info zum VPN für UIBK
          else {
            layer.bindPopup(`
            <p><b>Image not available</b> <br>
            Plots for past lidar measuremnts from UIBK require a VPN connection to <a href = "https://www.uibk.ac.at/zid/anleitungen/vpn/vpn.html.de">University of Innsbruck</a>
            </p><br>
          ` + Popuptext +
            `</div>`);
          }
        };
        /*KI_BEGIN*/
        img.src = url; //image source location
        /*KI_END*/
      }
    }
  }).addTo(overlays.lidar);
}
