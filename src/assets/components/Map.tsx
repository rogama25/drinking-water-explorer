import L, {type LocationEvent} from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import {toast} from "react-toastify";

export function Map() {
    const mapRef = useRef<L.Map>(null)
    const containerRef = useRef(null)
    const circleRef = useRef<L.Circle>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const map = L.map(containerRef.current).setView([41.3851, 2.1734], 13)
        let layer = []
        let layerGroup: L.Layer

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)

        mapRef.current = map

        new LocateControl({
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
                if(promiseResolve) {
                    promiseResolve(data)
                    promiseResolve = null
                    promiseReject = null
                }
                layer = []
                for (let e of data.elements) {
                    const eLat = e.center ? e.center.lat: e.lat
                    const eLon = e.center ? e.center.lon: e.lon
                    layer.push(L.marker([eLat, eLon]))
                }
                layerGroup = L.layerGroup(layer).addTo(map)
            }).catch(error => {
                if(promiseReject) {
                    promiseReject()
                    promiseResolve = null
                    promiseReject = null
                }
                console.error(error)
                //toast.error("Error fetching data from Overpass API")
            })
        }

        // Create circle (2 km = 2000 meters)
        const circle = L.circle(map.getCenter(), {
            radius: 2000,
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0,
            weight: 2,
            opacity: 0
        }).addTo(map)

        circleRef.current = circle

        // Update circle center when map moves
        const updateCircle = () => {
            circle.setLatLng(map.getCenter())
            circle.setStyle({opacity: 1, fillOpacity: 0.1})
        }

        //map.on('move', updateCircle)
        let promiseResolve: ((_: unknown) => void) | null
        let promiseReject: (() => void) | null

        L.easyButton('<img src="fa7-solid--magnifying-glass.svg" />', function () {
            toast.promise(new Promise(function (resolve, reject) {
                promiseResolve = resolve
                promiseReject = reject
            }),{pending: "Loading...", error: "Error fetching data", success: "Data loaded successfully"})
            queryWaterManually()
        }).addTo(map)

        function queryWaterLocEvent(e: LocationEvent) {
            queryWater({lat: e.latlng.lat, lng: e.latlng.lng});
        }

        function queryWaterManually() {
            updateCircle()
            const center = map.getCenter()
            queryWater({lat: center.lat, lng: center.lng})
        }

        map.once("locationfound", queryWaterLocEvent)

        return () => {
            //map.off('move', updateCircle)
            map.remove()
        }
    }, [])

    return <div ref={containerRef} className="h-full" />
}