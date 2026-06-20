import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import 'leaflet/dist/leaflet.css';
import "./style.css"
import "leaflet-easybutton"
import "@fortawesome/fontawesome-free/js/all.js"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import L, {LocationEvent} from 'leaflet'

document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([0, 0], 0);
    let layer = []
    let layerGroup: L.Layer

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.control.locate({
        showPopup: false,
        drawCircle: false
    }).addTo(map);

    L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
    L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
    L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
    L.Icon.Default.imagePath = "";

    function queryWater({lat, lng}: {lat: number, lng: number}) {
        if (layerGroup) {
            map.removeLayer(layerGroup)
        }
        const query = `
    [out:json][timeout:25];
(
node["amenity"="drinking_water"](around:2000,${lat},${lng});
node["drinking_water"=yes](around:2000,${lat},${lng});
way["amenity"="drinking_water"](around:2000,${lat},${lng});
way["drinking_water"=yes](around:2000,${lat},${lng});
);
out center;
    `
        fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: "data=" + encodeURIComponent(query)
        }).then(response => response.json()).then(data => {
            layer = []
            for (let e of data.elements) {
                const eLat = e.center ? e.center.lat: e.lat
                const eLon = e.center ? e.center.lon: e.lon
                layer.push(L.marker([eLat, eLon]))
            }
            layerGroup = L.layerGroup(layer).addTo(map)
        })
    }

    L.easyButton('fa-solid fa-magnifying-glass', function (btn, map) {
        queryWaterManually()
    }).addTo(map)

    function queryWaterLocEvent(e: LocationEvent) {
        queryWater({lat: e.latlng.lat, lng: e.latlng.lng});
    }

    function queryWaterManually() {
        const center = map.getCenter()
        queryWater({lat: center.lat, lng: center.lng})
    }

    map.once("locationfound", queryWaterLocEvent)
})

