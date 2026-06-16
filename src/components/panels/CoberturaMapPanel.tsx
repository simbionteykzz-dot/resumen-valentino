import React, { useEffect, useRef, useState } from 'react';
import { Map, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import zazuData from '../../lib/zazuCoverage.json';
import { parseCoords, checkCoberturaZazu } from '../../lib/geo';

// Leaflet cargado dinámicamente para evitar SSR issues
let L: typeof import('leaflet') | null = null;

async function getLeaflet() {
  if (L) return L;
  L = (await import('leaflet')).default as unknown as typeof import('leaflet');
  return L;
}

// Convierte [lon, lat] → LatLng de Leaflet [lat, lon]
function toLatLngs(coords: number[][]): [number, number][] {
  return coords.map(([lon, lat]) => [lat, lon]);
}

interface Props {
  pinLon?: number;
  pinLat?: number;
}

export default function CoberturaMapPanel({ pinLon, pinLat }: Props) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinMarkerRef = useRef<any>(null);
  const searchPinRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Inicializar el mapa cuando se abre por primera vez
  useEffect(() => {
    if (!open || initializedRef.current) return;

    let mounted = true;

    getLeaflet().then((Lf) => {
      if (!mounted || !containerRef.current) return;

      // Importar CSS de Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const map = Lf.map(containerRef.current, {
        center: [-12.05, -77.03],
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      // Tiles de CartoDB Positron (limpio, similar al de la imagen)
      Lf.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Polígono outer con hueco (hole) usando GeoJSON
      const outerRing = toLatLngs(zazuData.outer);
      const holeRings = zazuData.holes.map(toLatLngs);

      // Dibujar zona de cobertura principal (con huecos)
      Lf.polygon([outerRing, ...holeRings], {
        color: '#7c3aed',
        fillColor: '#8b5cf6',
        fillOpacity: 0.25,
        weight: 2.5,
        opacity: 0.85,
      }).addTo(map);

      // Dibujar huecos con color diferente para resaltarlos
      holeRings.forEach(hole => {
        Lf.polygon(hole, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.18,
          weight: 1.5,
          dashArray: '6 4',
          opacity: 0.8,
        }).addTo(map);
      });

      // Zona sin cobertura explícita
      Lf.polygon(toLatLngs(zazuData.noCobertura), {
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.3,
        weight: 2,
        opacity: 0.9,
      }).addTo(map);

      mapRef.current = map;
      initializedRef.current = true;

      // Forzar redibujado tras render
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => { mounted = false; };
  }, [open]);

  // Actualizar pin cuando cambian coords
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return;

    getLeaflet().then((Lf) => {
      // Quitar pin anterior
      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove();
        pinMarkerRef.current = null;
      }

      if (pinLon === undefined || pinLat === undefined) return;

      // Ícono personalizado amarillo
      const icon = Lf.divIcon({
        html: `
          <div style="
            width:18px;height:18px;border-radius:50%;
            background:#fbbf24;border:3px solid #fff;
            box-shadow:0 0 0 3px rgba(251,191,36,0.4),0 2px 8px rgba(0,0,0,0.4);
          "></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = Lf.marker([pinLat, pinLon], { icon }).addTo(mapRef.current);
      pinMarkerRef.current = marker;
      mapRef.current.setView([pinLat, pinLon], 14, { animate: true });
    });
  }, [pinLon, pinLat]);

  // Redimensionar al abrir/cerrar
  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 150);
    }
  }, [open]);

  function handleSearch() {
    const parsed = parseCoords(searchText.trim());
    if (!parsed) {
      setSearchError('No se reconocieron coordenadas. Pega un link de Google Maps o coordenadas lat,lon.');
      setSearchResult(null);
      return;
    }
    setSearchError('');
    const cob = checkCoberturaZazu(parsed.lon, parsed.lat);
    setSearchResult({ lat: parsed.lat, lon: parsed.lon, label: cob.mensaje });
  }

  function clearSearch() {
    setSearchText('');
    setSearchResult(null);
    setSearchError('');
    if (searchPinRef.current) {
      searchPinRef.current.remove();
      searchPinRef.current = null;
    }
  }

  // Pin de búsqueda en el mapa
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current || !searchResult) return;

    getLeaflet().then((Lf) => {
      if (searchPinRef.current) {
        searchPinRef.current.remove();
        searchPinRef.current = null;
      }

      const isInside = searchResult.label.startsWith('✅');
      const color = isInside ? '#22c55e' : searchResult.label.startsWith('⚠️') ? '#f97316' : '#ef4444';

      const icon = Lf.divIcon({
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:${color};border:3px solid #fff;
          box-shadow:0 0 0 3px ${color}55,0 2px 8px rgba(0,0,0,0.5);
        "></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = Lf.marker([searchResult.lat, searchResult.lon], { icon })
        .addTo(mapRef.current);
      searchPinRef.current = marker;
      mapRef.current.setView([searchResult.lat, searchResult.lon], 14, { animate: true });
    });
  }, [searchResult]);

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Header colapsable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: open ? '10px 10px 0 0' : '10px',
          padding: '0.6rem 1rem', cursor: 'pointer',
          transition: 'border-radius 0.15s',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa',
        }}>
          <Map size={15} />
          Vista de cobertura ZAZU
          {pinLon !== undefined && (
            <span style={{
              fontSize: '0.7rem', background: 'rgba(251,191,36,0.15)',
              color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '20px', padding: '0.1rem 0.5rem',
            }}>
              📍 Pin activo
            </span>
          )}
        </span>
        {open
          ? <ChevronUp size={15} color="#a78bfa" />
          : <ChevronDown size={15} color="#a78bfa" />}
      </button>

      {open && (
        <div style={{
          border: '1px solid rgba(139,92,246,0.3)', borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }}>
          {/* Leyenda */}
          <div style={{
            display: 'flex', gap: '1rem', padding: '0.5rem 1rem',
            background: 'rgba(15,23,42,0.95)', flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { color: '#8b5cf6', label: 'Cobertura ZAZU' },
              { color: '#ef4444', label: 'Zona excluida', dash: true },
              { color: '#f97316', label: 'Sin cobertura' },
              { color: '#fbbf24', label: 'Tu ubicación', dot: true },
            ].map(({ color, label, dash, dot }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                {dot
                  ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid #fff', flexShrink: 0 }} />
                  : <div style={{
                      width: 14, height: 10, borderRadius: 3, flexShrink: 0,
                      background: color + '40', border: `2px ${dash ? 'dashed' : 'solid'} ${color}`,
                    }} />
                }
                {label}
              </div>
            ))}
          </div>

          {/* Buscador de coordenadas */}
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(15,23,42,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={13} style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  color: '#64748b', pointerEvents: 'none',
                }} />
                <input
                  value={searchText}
                  onChange={e => { setSearchText(e.target.value); setSearchError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Pega coordenadas o link de Google Maps..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 26, paddingRight: searchText ? 26 : 8,
                    paddingTop: 5, paddingBottom: 5,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6, color: '#e2e8f0',
                    fontSize: '0.75rem', outline: 'none',
                  }}
                />
                {searchText && (
                  <button onClick={clearSearch} style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#64748b', display: 'flex', alignItems: 'center',
                  }}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none',
                  background: '#7c3aed', color: '#fff', fontSize: '0.75rem',
                  cursor: 'pointer', fontWeight: 600, flexShrink: 0,
                }}
              >
                Ir
              </button>
            </div>
            {searchError && (
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#f87171' }}>{searchError}</p>
            )}
            {searchResult && (
              <p style={{
                margin: '0.3rem 0 0', fontSize: '0.7rem',
                color: searchResult.label.startsWith('✅') ? '#4ade80'
                  : searchResult.label.startsWith('⚠️') ? '#fb923c' : '#f87171',
              }}>
                {searchResult.label}
              </p>
            )}
          </div>

          {/* Contenedor del mapa */}
          <div
            ref={containerRef}
            style={{ width: '100%', height: '420px' }}
          />
        </div>
      )}
    </div>
  );
}
