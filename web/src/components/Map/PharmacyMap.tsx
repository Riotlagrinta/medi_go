'use client';

import { useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  NavigationControl,
  AttributionControl,
  addProtocol,
  removeProtocol,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { buildMapStyle } from '@/lib/mapStyle';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_on_duty: boolean;
  is_verified: boolean;
  lat: number;
  lng: number;
  distance?: number;
}

function toGeoJSON(pharmacies: Pharmacy[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: pharmacies.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { ...p },
    })),
  };
}

function popupHtml(p: Pharmacy): string {
  const distance =
    typeof p.distance === 'number'
      ? `<p style="font-size:10px;font-weight:900;color:#047857;margin:0 0 8px">📍 À ${
          p.distance < 1000 ? `${p.distance} m` : `${(p.distance / 1000).toFixed(1)} km`
        }</p>`
      : '';
  const call = p.phone
    ? `<a href="tel:${p.phone}" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#059669;color:#fff;font-size:10px;font-weight:700;padding:6px 12px;border-radius:8px;text-decoration:none;margin-bottom:4px">📞 Appeler</a>`
    : '';
  const duty = p.is_on_duty
    ? `<span style="display:flex;align-items:center;justify-content:center;gap:4px;background:#fee2e2;color:#dc2626;font-size:9px;font-weight:900;padding:4px 8px;border-radius:8px">⏰ DE GARDE</span>`
    : '';
  const verified = p.is_verified ? ' ✔️' : '';

  return `
    <div style="padding:8px;min-width:170px;font-family:system-ui,sans-serif">
      <h3 style="font-weight:900;color:#1e293b;font-size:13px;margin:0 0 4px">${p.name}${verified}</h3>
      <p style="font-size:10px;color:#64748b;margin:0 0 4px">📍 ${p.address}</p>
      ${distance}
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">${call}${duty}</div>
    </div>
  `;
}

export default function PharmacyMap({
  pharmacies,
  userLocation,
}: {
  pharmacies: Pharmacy[];
  userLocation?: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : [1.2255, 6.1372]; // Lomé centre

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const protocol = new Protocol();
    addProtocol('pmtiles', protocol.tile);

    // MapLibre calcule l'URL de son web worker via `import.meta.url`, ce qui ne
    // fonctionne plus une fois la lib regroupée par le bundler de Next.js (le
    // chemin calculé ne correspond à aucun fichier réel). On sert donc nous-mêmes
    // une copie du worker (voir scripts/copy-maplibre-worker.js) et on l'indique
    // explicitement, comme recommandé par MapLibre pour les setups avec bundler.
    setWorkerUrl(`${window.location.origin}/maps/maplibre-gl-worker.mjs`);

    const map = new MapLibreMap({
      container: containerRef.current,
      style: buildMapStyle(`${window.location.origin}/maps/togo.pmtiles`),
      center: defaultCenter,
      zoom: 13,
      attributionControl: false,
    });
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('pharmacies-regular', {
        type: 'geojson',
        data: toGeoJSON([]),
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });
      map.addSource('pharmacies-duty', { type: 'geojson', data: toGeoJSON([]) });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'pharmacies-regular',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#059669',
          'circle-opacity': 0.85,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 30, 26],
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'pharmacies-regular',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'pharmacies-regular',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#059669',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      map.addLayer({
        id: 'duty-point',
        type: 'circle',
        source: 'pharmacies-duty',
        paint: {
          'circle-color': '#dc2626',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Clic sur un cluster : zoome pour l'éclater
      map.on('click', 'clusters', (e: MapLayerMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('pharmacies-regular') as GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom });
        });
      });

      // Clic sur une pharmacie individuelle : popup
      const showPopup = (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        popupRef.current?.remove();
        popupRef.current = new Popup({ closeButton: true })
          .setLngLat(coords)
          .setHTML(popupHtml(feature.properties as unknown as Pharmacy))
          .addTo(map);
      };
      for (const layerId of ['unclustered-point', 'duty-point']) {
        map.on('click', layerId, showPopup);
        map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      removeProtocol('pmtiles');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Met à jour les données pharmacies quand la liste change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const regular = pharmacies.filter((p) => !p.is_on_duty);
      const duty = pharmacies.filter((p) => p.is_on_duty);
      (map.getSource('pharmacies-regular') as GeoJSONSource | undefined)?.setData(toGeoJSON(regular));
      (map.getSource('pharmacies-duty') as GeoJSONSource | undefined)?.setData(toGeoJSON(duty));
    };
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [pharmacies]);

  // Marqueur + recentrage sur la position de l'utilisateur
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const recenter = () => map.easeTo({ center: defaultCenter, zoom: map.getZoom() < 12 ? 13 : map.getZoom() });
    if (map.isStyleLoaded()) recenter();
    else map.once('load', recenter);

    if (userLocation) {
      let marker = userMarkerRef.current;
      if (!marker) {
        const el = document.createElement('div');
        el.style.cssText =
          'background:#2563eb;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.35)';
        marker = new Marker({ element: el }).setLngLat([userLocation.lng, userLocation.lat]);
        userMarkerRef.current = marker;
      } else {
        marker.setLngLat([userLocation.lng, userLocation.lat]);
      }
      if (map.isStyleLoaded()) marker.addTo(map);
      else map.once('load', () => marker?.addTo(map));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.lat, userLocation?.lng]);

  return (
    <div className="h-full w-full relative group">
      {/* Overlay style Google Maps */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 pointer-events-none">
        <div className="bg-emerald-600 p-1.5 rounded-lg"><MapPin className="text-white w-3 h-3" /></div>
        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
          {userLocation ? 'Autour de votre position' : 'Exploration Togo'}
        </span>
      </div>

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
