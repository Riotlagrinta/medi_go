'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Clock, ShieldCheck, Navigation } from 'lucide-react';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OnDutyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

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

function RecenterAutomatically({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function PharmacyMap({ 
  pharmacies, 
  userLocation 
}: { 
  pharmacies: Pharmacy[]; 
  userLocation?: { lat: number; lng: number } | null;
}) {
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [6.1372, 1.2255]; // Lomé centre

  return (
    <div className="h-full w-full relative group">
      {/* Overlay style Google Maps */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 pointer-events-none">
        <div className="bg-emerald-600 p-1.5 rounded-lg"><MapPin className="text-white w-3 h-3" /></div>
        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
          {userLocation ? 'Autour de votre position' : 'Exploration Lomé'}
        </span>
      </div>

      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <ZoomControl position="bottomright" />
        <RecenterAutomatically center={defaultCenter} />
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; Google Maps'
        />

        {/* Marqueur de position de l'utilisateur */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
            <Popup>
              <div className="p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-black text-xs mb-1">
                  <Navigation className="w-3.5 h-3.5" /> Votre position
                </div>
                <p className="text-[10px] text-slate-500">Précision GPS en temps réel</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des pharmacies */}
        {pharmacies.map((p) => (
          <Marker 
            key={p.id} 
            position={[p.lat, p.lng]} 
            icon={p.is_on_duty ? OnDutyIcon : DefaultIcon}
          >
            <Popup>
              <div className="p-2 min-w-[170px]">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-800 text-sm">{p.name}</h3>
                  {p.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />}
                </div>
                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> {p.address}
                </p>
                {typeof p.distance === 'number' && (
                  <p className="text-[10px] font-black text-emerald-700 mb-2">
                    📍 À {(p.distance < 1000 ? `${p.distance} m` : `${(p.distance / 1000).toFixed(1)} km`)}
                  </p>
                )}
                <div className="flex flex-col gap-1 mt-1">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="bg-emerald-600 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                      <Phone className="w-3 h-3" /> Appeler
                    </a>
                  )}
                  {p.is_on_duty && (
                    <span className="bg-red-100 text-red-600 text-[9px] font-black py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> DE GARDE
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}