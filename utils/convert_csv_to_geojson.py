import csv
import json

input_csv = "stations_metadaten.csv"      # Change to your CSV file path
output_geojson = "stations.geojson"

features = []

with open(input_csv, encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        try:
            lon = float(row['Länge [°E]'])
            lat = float(row['Breite [°N]'])
            id = int(row['id'])
        except (ValueError, KeyError):
            continue  # Skip rows with invalid coordinates

        properties = {k: v for k, v in row.items() if k not in [
            'Länge [°E]', 'Breite [°N]', 'id']}
        feature = {
            "id": id,
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": properties
        }
        features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open(output_geojson, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"GeoJSON saved to {output_geojson}")
