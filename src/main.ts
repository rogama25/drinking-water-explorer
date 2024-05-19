import 'leaflet.locatecontrol' // Import plugin
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css' // Import styles
import 'leaflet/dist/leaflet.css';
import "./style.css"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import L, {LocationEvent} from 'leaflet' // Import L from leaflet to start using the plugin

var map = L.map("app").setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.locate().addTo(map);

L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;

function queryWater(e: LocationEvent) {
    const query = `
    [out:json][timeout:25];
node["amenity"="drinking_water"](around:2000,${e.latlng.lat},${e.latlng.lng});
out geom;`
    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query)
    }).then(response => response.json()).then(data => {
        for (let e of data.elements) {
            L.marker([e.lat, e.lon]).addTo(map)
        }
    })
}

map.once("locationfound", queryWater)