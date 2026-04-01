import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Venue, VenueMapProps } from './VenueMap.types';
import { LOGO_TDLN_B64 } from '../constants/logo-tdln-b64';

export type { Venue, VenueMapProps };

const LOGO_URI = LOGO_TDLN_B64;

function createMarkerIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? 58 : 48;
  const tipW = Math.round(size * 0.5);
  const tipH = Math.round(size * 0.35);
  const borderColor = isSelected ? '#00D3FF' : '#ffffff';
  const glow = isSelected
    ? 'drop-shadow(0 0 10px rgba(0,211,255,0.9)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))'
    : 'drop-shadow(0 4px 10px rgba(0,0,0,0.55))';

  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:${glow};cursor:pointer;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(145deg,#1B1C72 0%,#0B022E 100%);border:3px solid ${borderColor};display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img src="${LOGO_URI}" style="width:85%;height:85%;object-fit:contain;" />
      </div>
      <div style="width:0;height:0;border-left:${tipW / 2}px solid transparent;border-right:${tipW / 2}px solid transparent;border-top:${tipH}px solid ${borderColor};margin-top:-2px;"></div>
    </div>`,
    iconSize: [size, size + tipH + 2],
    iconAnchor: [size / 2, size + tipH + 2],
    className: '',
  });
}

function MapController({ selectedVenueId, venues }: { selectedVenueId: string | null; venues: Venue[] }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedVenueId) return;
    const venue = venues.find((v) => v.id === selectedVenueId);
    if (!venue) return;
    map.flyTo([venue.latitude - 0.005, venue.longitude], 13, { duration: 0.5, animate: true });
  }, [selectedVenueId, venues, map]);
  return null;
}

function MapClickHandler({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect });
  return null;
}

export default function VenueMap({ venues, selectedVenueId, onSelectVenue, onDeselect }: VenueMapProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('tdln-map-style')) {
      const style = document.createElement('style');
      style.id = 'tdln-map-style';
      style.textContent = `
        .leaflet-container { background: #e5e0d8 !important; }
        .leaflet-control-attribution { background: rgba(255,255,255,0.75) !important; color: rgba(0,0,0,0.5) !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: rgba(0,60,180,0.7) !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <MapContainer
      center={[46.6, 2.5]}
      zoom={6}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#e5e0d8',
        zIndex: 0,
      }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <MapController selectedVenueId={selectedVenueId} venues={venues} />
      <MapClickHandler onDeselect={onDeselect} />
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.latitude, venue.longitude]}
          icon={createMarkerIcon(venue.id === selectedVenueId)}
          eventHandlers={{
            click: () => onSelectVenue(venue),
          }}
        />
      ))}
    </MapContainer>
  );
}
