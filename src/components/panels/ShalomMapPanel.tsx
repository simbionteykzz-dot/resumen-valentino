import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

let L: typeof import('leaflet') | null = null;
async function getLeaflet() {
  if (L) return L;
  L = (await import('leaflet')).default as unknown as typeof import('leaflet');
  return L;
}

export interface ShalomPin {
  lat: number;
  lon: number;
  label: string;
  isSelected?: boolean;
}

interface Props {
  pins?: ShalomPin[];
}

export default function ShalomMapPanel({ pins }: Props) {
  const [open, setOpen] = useState(false);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const initializedRef = useRef(false);
  const pendingPinsRef = useRef<ShalomPin[] | null>(null);

  // Auto-abrir cuando llegan pins
  useEffect(() => {
    if (pins && pins.length > 0) {
      setOpen(true);
    }
  }, [pins]);

  function placePins(Lf: typeof import('leaflet'), currentPins: ShalomPin[]) {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    currentPins.forEach((pin) => {
      const color = pin.isSelected ? '#22c55e' : '#3b82f6';
      const size = pin.isSelected ? 22 : 16;

      const icon = Lf.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};border:3px solid #fff;
          box-shadow:0 0 0 3px ${color}55,0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = Lf.marker([pin.lat, pin.lon], { icon })
        .bindTooltip(pin.label, { permanent: false, direction: 'top', offset: [0, -size / 2] })
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    const selected = currentPins.find(p => p.isSelected);
    if (selected) {
      mapRef.current.setView([selected.lat, selected.lon], 13, { animate: true });
    } else if (currentPins.length > 1) {
      const bounds = Lf.latLngBounds(currentPins.map(p => [p.lat, p.lon] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    } else if (currentPins.length === 1) {
      mapRef.current.setView([currentPins[0].lat, currentPins[0].lon], 13, { animate: true });
    }
  }

  // Inicializar mapa cuando se abre
  useEffect(() => {
    if (!open || initializedRef.current) return;
    let mounted = true;

    getLeaflet().then((Lf) => {
      if (!mounted || !containerRef.current) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = Lf.map(containerRef.current, {
        center: [-9.19, -75.01],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      Lf.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      initializedRef.current = true;
      setTimeout(() => {
        map.invalidateSize();
        // Colocar pins que llegaron antes de que el mapa estuviese listo
        const toPlace = pendingPinsRef.current;
        if (toPlace && toPlace.length > 0) {
          pendingPinsRef.current = null;
          placePins(Lf, toPlace);
        }
      }, 150);
    });

    return () => { mounted = false; };
  }, [open]);

  // Actualizar marcadores cuando cambian los pins
  useEffect(() => {
    if (!pins || pins.length === 0) return;

    if (!mapRef.current || !initializedRef.current) {
      // Mapa aún no listo, guardar para cuando se inicialice
      pendingPinsRef.current = pins;
      return;
    }

    getLeaflet().then((Lf) => {
      placePins(Lf, pins);
    });
  }, [pins]);

  // Redimensionar al abrir
  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 150);
    }
  }, [open]);

  const hasPins = pins && pins.length > 0;

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: open ? '10px 10px 0 0' : '10px',
          padding: '0.6rem 1rem', cursor: 'pointer',
          transition: 'border-radius 0.15s',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa',
        }}>
          <MapPin size={15} />
          Mapa de sedes Shalom
          {hasPins && (
            <span style={{
              fontSize: '0.7rem', background: 'rgba(34,197,94,0.15)',
              color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '20px', padding: '0.1rem 0.5rem',
            }}>
              📍 {pins!.length} sede{pins!.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={15} color="#60a5fa" /> : <ChevronDown size={15} color="#60a5fa" />}
      </button>

      {open && (
        <div style={{
          border: '1px solid rgba(59,130,246,0.3)', borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }}>
          {/* Leyenda */}
          <div style={{
            display: 'flex', gap: '1rem', padding: '0.5rem 1rem',
            background: 'rgba(15,23,42,0.95)', flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { color: '#22c55e', label: 'Sede seleccionada' },
              { color: '#3b82f6', label: 'Sedes cercanas' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid #fff', flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          {!hasPins && (
            <div style={{
              padding: '2rem', textAlign: 'center', color: '#64748b',
              fontSize: '0.8rem', background: 'rgba(15,23,42,0.95)',
            }}>
              Selecciona una sede o ingresa coordenadas para ver el mapa
            </div>
          )}

          <div
            ref={containerRef}
            style={{ width: '100%', height: hasPins ? '380px' : '0px', transition: 'height 0.2s' }}
          />
        </div>
      )}
    </div>
  );
}
