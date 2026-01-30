'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Clock } from 'lucide-react';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const OnDutyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_on_duty: boolean;
  lat: number;
  lng: number;
}

export default function PharmacyMap({ pharmacies }: { pharmacies: Pharmacy[] }) {
  const center: [number, number] = [6.1372, 1.2255]; // Lomé center

  return (
    <div className="h-[400px] w-full rounded-[32px] overflow-hidden shadow-inner border-4 border-white">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pharmacies.map((p) => (
          <Marker 
            key={p.id} 
            position={[p.lat, p.lng]} 
            icon={p.is_on_duty ? OnDutyIcon : DefaultIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h3 className="font-black text-slate-800 text-sm mb-1">{p.name}</h3>
                <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {p.address}
                </p>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${p.phone}`} className="bg-emerald-600 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3" /> Appeler
                  </a>
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
