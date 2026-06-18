import { MapPin, CheckCircle2, XCircle, RotateCcw, RefreshCw, Package, Bike, Store, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { DISTRITOS } from '../../lib/data';
import { searchSedes, parseCoords, updateSedes, getSedesCount, detectarDistritoLima, checkCoberturaZazuAsync, findNearestShalom, CoberturaResult } from '../../lib/geo';
import DropdownPortal from '../ui/DropdownPortal';
import CoberturaMapPanel from './CoberturaMapPanel';
import ShalomMapPanel, { ShalomPin } from './ShalomMapPanel';


function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em',
      color: 'var(--muted)', marginBottom: '0.3rem', textTransform: 'uppercase' as const, ...style,
    }}>
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.78rem', marginTop: '0.35rem' }}>
      <AlertCircle size={13} /> {msg}
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
          {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ClientePanel({ tab, data, onChange }: any) {
  const [sedeQuery, setSedeQuery] = useState(data.sede || "Shalom");
  const [sedeResults, setSedeResults] = useState<any[]>([]);
  const [showSedeDrop, setShowSedeDrop] = useState(false);
  const sedeInputRef = useRef<HTMLInputElement>(null);
  const [updatingSedes, setUpdatingSedes] = useState(false);
  const [sedesCount, setSedesCount] = useState(getSedesCount());

  const [distQuery, setDistQuery] = useState(data.distrito || "");
  const [distResults, setDistResults] = useState<string[]>([]);
  const [showDistDrop, setShowDistDrop] = useState(false);
  const distInputRef = useRef<HTMLInputElement>(null);

  const [cobResult, setCobResult] = useState<CoberturaResult | null>(null);
  const [nearestShalom, setNearestShalom] = useState<{ sede: any; distKm: number }[]>([]);
  const [distritoDetectado, setDistritoDetectado] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ lon: number; lat: number } | null>(null);
  const [shalomPins, setShalomPins] = useState<ShalomPin[]>([]);

  const [celularError, setCelularError] = useState("");
  const [dniError, setDniError] = useState("");

  const handleUpdateSedes = async () => {
    setUpdatingSedes(true);
    try {
      const res = await fetch('/api/shalom-agencias', { method: 'POST' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((a: any) => ({
          n: a.nombre, dist: a.zona, prov: a.provincia, dep: a.departamento,
          addr: a.direccion, lat: parseFloat(a.latitud) || 0, lon: parseFloat(a.longitud) || 0,
        }));
        updateSedes(mapped);
        setSedesCount(getSedesCount());
        setSedeResults(searchSedes(sedeQuery, 14));
      } else {
        console.warn("Shalom API:", json.message || "Sin datos");
      }
    } catch (err: any) {
      console.warn("Shalom fetch error:", err.message);
    } finally {
      setUpdatingSedes(false);
    }
  };

  useEffect(() => {
    handleUpdateSedes();
    const id = setInterval(handleUpdateSedes, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleSedeSearch = (val: string) => {
    setSedeQuery(val); onChange('sede', val);
    if (!val || val.toLowerCase() === "shalom") { setShowSedeDrop(false); return; }
    setSedeResults(searchSedes(val, 14));
    setShowSedeDrop(true);
  };

  const selectSede = (s: any) => {
    let loc = [];
    if (s.dist && s.dist !== s.prov) loc.push(s.dist);
    if (s.prov) loc.push(s.prov);
    const label = "Shalom " + s.n + (loc.length ? " - " + loc.join(", ") : "");
    setSedeQuery(label); onChange('sede', label);
    onChange('provincia', s.prov || ""); onChange('depto', s.dep || "");
    setShowSedeDrop(false);
    // Pin en mapa
    if (s.lat && s.lon) {
      setShalomPins([{ lat: s.lat, lon: s.lon, label: `Shalom ${s.n} — ${s.prov}`, isSelected: true }]);
    }
  };

  const handleDistSearch = (val: string) => {
    setDistQuery(val); onChange('distrito', val);
    if (!val) { setShowDistDrop(false); return; }
    const nq = val.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    setDistResults(DISTRITOS.filter(d => d.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(nq)));
    setShowDistDrop(true);
  };

  const handleUbicacion = (val: string) => {
    onChange('ubicacion', val);
    const coords = parseCoords(val);
    if (coords) {
      setPinCoords({ lon: coords.lon, lat: coords.lat });
      checkCoberturaZazuAsync(coords.lon, coords.lat).then(result => {
        setCobResult(result);
        if (!result.dentro) setNearestShalom(findNearestShalom(coords.lat, coords.lon, 3));
        else setNearestShalom([]);
        if (result.mensaje.includes('(')) {
          // El distrito ya viene en el mensaje, extraerlo
          const m = result.mensaje.match(/\(([^)]+)\)/);
          const distrito = m ? m[1] : null;
          if (distrito) {
            setDistQuery(distrito); onChange('distrito', distrito);
            setDistritoDetectado(true);
            setTimeout(() => setDistritoDetectado(false), 3000);
          }
        }
      });
      // Detección de distrito en paralelo (puede llegar antes del resultado de cobertura)
      const distSync = detectarDistritoLima(coords.lat, coords.lon);
      if (distSync) {
        setDistQuery(distSync); onChange('distrito', distSync);
        setDistritoDetectado(true);
        setTimeout(() => setDistritoDetectado(false), 3000);
      } else setDistritoDetectado(false);
    } else {
      setPinCoords(null);
      setCobResult(null); setNearestShalom([]); setDistritoDetectado(false);
    }
  };

  const handleCelularChange = (val: string) => {
    onChange('celular', val);
    const n = val.replace(/\D/g, '');
    setCelularError(n.length > 0 && n.length < 9 ? "El número debe tener 9 dígitos" : "");
  };

  const handleDniChange = (val: string) => {
    onChange('dni', val);
    const n = val.replace(/\D/g, '');
    setDniError(n.length > 0 && n.length < 8 ? "El DNI debe tener 8 dígitos" : "");
  };

  const detectIp = () => {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(r => r.json())
      .then(d => { const city = d.city || d.region; if (city) handleDistSearch(city); })
      .catch(() => {});
  };

  // ── Shared fields ──────────────────────────────────────────────────────

  const nombreField = (
    <div style={{ gridColumn: '1 / -1' }}>
      <FieldLabel>NOMBRE COMPLETO</FieldLabel>
      <input value={data.nombre} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre y apellido" className="form-input" />
    </div>
  );

  const celularField = (
    <div>
      <FieldLabel>CELULAR</FieldLabel>
      <input value={data.celular} onChange={e => handleCelularChange(e.target.value)} placeholder="9xxxxxxxx" className={`form-input ${celularError ? 'error' : ''}`} />
      {celularError && <FieldError msg={celularError} />}
    </div>
  );

  const dniField = (labelText = 'DNI') => (
    <div>
      <FieldLabel>{labelText}</FieldLabel>
      <input value={data.dni} onChange={e => handleDniChange(e.target.value)} placeholder="12345678" maxLength={8} className={`form-input ${dniError ? 'error' : ''}`} />
      {dniError && <FieldError msg={dniError} />}
    </div>
  );

  const codPubField = (
    <div style={{ gridColumn: '1 / -1' }}>
      <FieldLabel>CÓDIGO DE PUBLICIDAD</FieldLabel>
      <input value={data.codigoPublicidad} onChange={e => onChange('codigoPublicidad', e.target.value)} placeholder="Live" className="form-input" />
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────

  return (
    <>
      {tab === 'prov' && (
        <SectionCard icon={<Package size={16} />} title="Datos provincia — Shalom">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {nombreField}
            {celularField}
            {dniField('NÚMERO DNI')}
            <div>
              <FieldLabel>DEPARTAMENTO</FieldLabel>
              <input value={data.provincia} onChange={e => onChange('provincia', e.target.value)} placeholder="Ej. La Libertad" className="form-input" />
            </div>
            <div>
              <FieldLabel>PROVINCIA</FieldLabel>
              <input value={data.depto} onChange={e => onChange('depto', e.target.value)} placeholder="Ej. Trujillo" className="form-input" />
            </div>
            {codPubField}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <FieldLabel style={{ marginBottom: 0 }}>SEDE SHALOM</FieldLabel>
                <button onClick={handleUpdateSedes} disabled={updatingSedes} className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RefreshCw size={12} className={updatingSedes ? "fa-spin" : ""} />
                  {updatingSedes ? "Sincronizando..." : "Actualizar Sedes"}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input ref={sedeInputRef} value={sedeQuery} onChange={e => handleSedeSearch(e.target.value)} onFocus={() => setSedeQuery("")} placeholder="Busca por distrito, provincia o dirección…" className="form-input" style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => handleSedeSearch("Shalom")} style={{ height: '42px', padding: '0 1rem' }}><RotateCcw size={16} /></button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>Al elegir una sede se completan Departamento y Provincia automáticamente. También puedes pegar tus coordenadas abajo para ver las 3 más cercanas.</div>
              <DropdownPortal isOpen={showSedeDrop} anchorRef={sedeInputRef} onClose={() => setShowSedeDrop(false)} className="sede-dropdown-portal">
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> <strong style={{ color: '#fff' }}>{sedesCount}</strong> sedes cargadas</span>
                  {sedeResults.length > 0 && <span>{sedeResults.length} resultados</span>}
                </div>
                {sedeResults.length === 0 ? <div className="sede-empty">Sin resultados</div> :
                  sedeResults.map((s, i) => (
                    <div key={i} className="sede-item" onClick={() => selectSede(s)}>
                      <div className="sede-item-name">{s.n}</div>
                      <div className="sede-item-loc" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={12} opacity={0.7} /> {s.prov}, {s.dep}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{s.addr}</div>
                    </div>
                  ))
                }
              </DropdownPortal>
            </div>
          </div>
          {/* Campo coordenadas para buscar sedes cercanas */}
          <div style={{ marginTop: '0.75rem' }}>
            <FieldLabel>TU UBICACIÓN (para sedes cercanas)</FieldLabel>
            <input
              placeholder="Pega link de Google Maps o coordenadas lat,lon"
              className="form-input"
              onChange={e => {
                const coords = parseCoords(e.target.value);
                if (coords) {
                  const nearest = findNearestShalom(coords.lat, coords.lon, 3);
                  setShalomPins(nearest.map((ns, i) => ({
                    lat: ns.sede.lat,
                    lon: ns.sede.lon,
                    label: `#${i + 1} Shalom ${ns.sede.n} — ${ns.distKm.toFixed(1)}km`,
                    isSelected: i === 0,
                  })));
                }
              }}
            />
          </div>
          <ShalomMapPanel pins={shalomPins} />
        </SectionCard>
      )}

      {tab === 'lima' && (
        <SectionCard icon={<Bike size={16} />} title="Delivery Lima">
          <CoberturaMapPanel
            pinLon={pinCoords?.lon}
            pinLat={pinCoords?.lat}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
            {nombreField}
            {celularField}
            {dniField('DNI')}
            {codPubField}
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel>UBICACIÓN EN TIEMPO REAL (MANDAR)</FieldLabel>
              <input value={data.ubicacion} onChange={e => handleUbicacion(e.target.value)} placeholder="Link o referencia de ubicación" className="form-input" />
              {cobResult && (
                <div className={`cob-badge visible ${cobResult.dentro ? 'dentro' : 'fuera'}`} style={{ marginTop: '0.5rem' }}>
                  <div className="cob-badge-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cobResult.dentro ? <CheckCircle2 size={24} color="#45834D" /> : <XCircle size={24} color="#ef4444" />}
                  </div>
                  <div className="cob-badge-text"><div className="cob-badge-msg">{cobResult.mensaje}</div></div>
                </div>
              )}
              {!cobResult?.dentro && nearestShalom.length > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, rgba(69,131,77,0.06), rgba(104,168,119,0.03))', border: '1.5px solid rgba(104,168,119,0.3)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} /> Agencias Shalom más cercanas
                  </div>
                  {nearestShalom.map((ns, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderTop: i > 0 ? '1px solid rgba(104,168,119,0.2)' : 'none' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: i === 0 ? 'var(--accent)' : 'var(--muted)', width: '1.5rem', textAlign: 'center' as const }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text2)' }}>{ns.sede.n}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ns.sede.prov}, {ns.sede.dep} — {ns.sede.addr}</div>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#facc15', flexShrink: 0 }}>{ns.distKm.toFixed(1)} km</span>
                      <button onClick={() => { const label = 'Shalom ' + ns.sede.n; setSedeQuery(label); onChange('sede', label); onChange('provincia', ns.sede.prov || ''); onChange('depto', ns.sede.dep || ''); }}
                        style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '50px', background: 'rgba(69,131,77,0.12)', border: '1px solid rgba(104,168,119,0.35)', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}>
                        Usar esta
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel>DISTRITO</FieldLabel>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input ref={distInputRef} value={distQuery} onChange={e => handleDistSearch(e.target.value)} onFocus={() => distQuery && setShowDistDrop(true)} placeholder="Escribe para buscar distrito..." className="form-input" style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={detectIp} title="Detectar" style={{ height: '42px', padding: '0 1rem' }}><MapPin size={16} /></button>
              </div>
              {distritoDetectado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2ee8a0', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Distrito detectado automáticamente
                </div>
              )}
              <DropdownPortal isOpen={showDistDrop} anchorRef={distInputRef} onClose={() => setShowDistDrop(false)} className="dist-dropdown-portal">
                {distResults.map((d, i) => (
                  <div key={i} className="dist-opt" onClick={() => { setDistQuery(d); onChange('distrito', d); setShowDistDrop(false); }}>{d}</div>
                ))}
              </DropdownPortal>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === 'almacen' && (
        <SectionCard icon={<Store size={16} />} title="Recojo almacén">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {nombreField}
            {celularField}
            {dniField('NÚMERO DNI')}
            {codPubField}
          </div>
        </SectionCard>
      )}
    </>
  );
}
