let today = new Date()

const lidarData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 11130,
      "properties": {
        "name": "Kufstein",
        "provider": "Geosphere Austria",
        "provider_url": "https://geosphere.at/de",
        "url_template": "https://portale.zamg.ac.at/umweltprofile/data/windlidar/WR19/WR19_{YYYYMMDD}_Vel.png",
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
      "id": 0,
      "properties": {
        "name": "Nafingalm, WR21",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_template_current": "https://ertel2.uibk.ac.at/ertel/wr21_lidar_current.png",
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
      "id": 0,
      "properties": {
        "name": "Nafingalm, SL88",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_current": "https://ertel2.uibk.ac.at/ertel/data/pngs/lidar_current.png",
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
      "id": 0,
      "properties": {
        "name": "Innsbruck",
        "provider": "ACINN UIBK",
        "provider_url": "https://www.uibk.ac.at/en/acinn/",
        "url_current": "https://ertel2.uibk.ac.at/ertel/data/pngs/lidar142_current.png",
        "url_template": "https://acinn-ertel.uibk.ac.at/ertel/data/pngs/lidar_142/{YYYYMMDD}.png",
        "height_asl_m": 613,
        "type": "SLXR142",
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
            iconUrl: './icons/photo.png',
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

      if (YYYYMMDD == YYYYMMDDtoday) {
        url += feature.properties.url_current;
        layer.bindPopup(`
                <a href=${url} target="lidar"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a>
                <h4>${feature.properties.name}, <a href = "${feature.properties.provider_url}">${feature.properties.provider}</a></h4>
                <ul>
                    <li> Date: ${date.toLocaleDateString()}
                    <li> <a href="${url}" target="lidar"> Open Current Plot </a>
                <ul> 
            `);
      }



      else {
        url = feature.properties.url_template.replace('{YYYYMMDD}', YYYYMMDD);
        /* Begin KI, Kommentare selbst hinzugefügt und Popups selbst geschrieben*/
        const img = new window.Image(); //initilaize Image
        // wenn das laden Funktioniert, lade den Popup mit Bild und Links
        img.onload = function () {
          layer.bindPopup(`
            <a href="${url}" target="lidar"><img src="${url}" alt="*" style="max-width: 250px; height: auto;"></a>
            <h4>${feature.properties.name}, <a href = "${feature.properties.provider_url}">${feature.properties.provider}</a></h4>
            <ul>
              <li>Date: ${date.toLocaleDateString()}</li>
              <li><a href="${url}" target="lidar">Open Plot</a></li>
            </ul>
          `);
        };
        img.onerror = function () {
          // wenn das laden nicht funktioniert, mache einen Popup mit Info zum VPN
          layer.bindPopup(`
            <h4>${feature.properties.name}, <a href = "${feature.properties.provider_url}">${feature.properties.provider}</a></h4>
            <p><b>Image not available</b> <br>
            Plots for past lidar measuremnts require a VPN connection to <a href = "https://www.uibk.ac.at/zid/anleitungen/vpn/vpn.html.de">University of Innsbruck</a>
            </p>
          `);
        };
        img.src = url; //image source location
        /*Ende KI*/
      }
    }
  }).addTo(overlays.lidar);
}
