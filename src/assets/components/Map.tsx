import L, {type LocationEvent} from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import {LocateControl, type LocateLocationFoundEvent} from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import {toast} from "react-toastify";

const INITIAL_LAT = 0;
const INITIAL_LNG = 0;
const INITIAL_ZOOM = 2;
const SEARCH_RADIUS = 2000;
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

function buildOverpassQuery(lat: number, lng: number): string {
    return `
    [out:json][timeout:25];
(
node["amenity"="drinking_water"](around:${SEARCH_RADIUS},${lat},${lng});
node["drinking_water"=yes](around:${SEARCH_RADIUS},${lat},${lng});
way["amenity"="drinking_water"](around:${SEARCH_RADIUS},${lat},${lng});
way["drinking_water"=yes](around:${SEARCH_RADIUS},${lat},${lng});
);
out center;
    `;
}

function createMarkersFromData(data: any): L.Marker[] {
    return data.elements.map((element: any) => {
        const lat = element.center?.lat ?? element.lat;
        const lng = element.center?.lon ?? element.lon;
        return L.marker([lat, lng]);
    });
}

function setIconsPath(): void {
    L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
    L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
    L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
    L.Icon.Default.imagePath = "";
}

function setupTileLayer(map: L.Map): void {
    L.tileLayer(OSM_TILE_URL, {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

function setupLocateControl(map: L.Map): void {
    new LocateControl({
        showPopup: false,
        drawCircle: false,
        initialZoomLevel: INITIAL_ZOOM,
        cacheLocation: false,
        setView: false,
    }).addTo(map);
}

function createSearchCircle(map: L.Map): L.Circle {
    return L.circle(map.getCenter(), {
        radius: SEARCH_RADIUS,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0,
        weight: 2,
        opacity: 0
    }).addTo(map);
}

export function Map() {
    const mapRef = useRef<L.Map>(null);
    const containerRef = useRef(null);
    const circleRef = useRef<L.Circle>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const map = L.map(containerRef.current).setView([INITIAL_LAT, INITIAL_LNG], INITIAL_ZOOM);
        mapRef.current = map;

        setIconsPath();
        setupTileLayer(map);
        setupLocateControl(map);

        const circle = createSearchCircle(map);
        circleRef.current = circle;

        let layerGroup: L.Layer | null = null;

        const updateCircle = () => {
            circle.setLatLng(map.getCenter());
            circle.setStyle({opacity: 1, fillOpacity: 0.1});
        };

        const clearMarkers = () => {
            if (layerGroup) {
                map.removeLayer(layerGroup);
                layerGroup = null;
            }
        };

        const displayMarkers = (markers: L.Marker[]) => {
            clearMarkers();
            layerGroup = L.layerGroup(markers).addTo(map);
        };

        const queryWater = async (lat: number, lng: number) => {
            const query = buildOverpassQuery(lat, lng);
            const fetchPromise = (async () => {
                const response = await fetch(OVERPASS_API, {
                    method: "POST",
                    body: "data=" + encodeURIComponent(query)
                });
                const data = await response.json();

                const markers = createMarkersFromData(data);
                displayMarkers(markers);

                return data;
            })();

            return toast.promise(
                fetchPromise,
                {
                    pending: "Loading...",
                    error: "Error fetching data",
                    success: "Data loaded successfully"
                }
            );
        };

        const queryWaterManually = () => {
            updateCircle();
            const center = map.getCenter();
            return queryWater(center.lat, center.lng);
        };

        const queryWaterFromLocation = (e: LocationEvent) => {
            return queryWater(e.latlng.lat, e.latlng.lng);
        };

        // Setup search button
        L.easyButton('<img src="fa7-solid--magnifying-glass.svg" />', () => {
            queryWaterManually();
        }).addTo(map);

        //map.once("locationfound", queryWaterFromLocation);
        // @ts-ignore
        map.on("locatelocationfound", (e: LocateLocationFoundEvent) => {
            console.log(e)
            map.setView(e.latlng, 14);
            queryWaterFromLocation(e);
            e.control.stop()
        })

        return () => {
            map.remove();
        };
    }, []);

    return <div ref={containerRef} className="h-full" />;
}