import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { BookOpen, Plus, Trash2, Download, FileSpreadsheet, X, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import type { AdminSale } from '../../types';
import {
  getLibros, createLibro, deleteLibro,
  getHojas, createHoja, deleteHoja,
  type LibroPlanilla, type HojaPlanilla,
} from '../../lib/supabase';

interface Props {
  filteredSales: AdminSale[];
  allSales: AdminSale[];
  dateFrom: string;
  dateTo: string;
  brandFilter: string;
  getRegion: (s: AdminSale) => string;
  getEstado: (s: AdminSale) => string;
}

const S = {
  accent: '#45834D',
  muted: '#517861',
  text: '#2a4433',
  text2: '#162e20',
  border: '1px solid rgba(104,168,119,.35)',
  surface: 'rgba(255,255,255,0.97)',
};

function salesToDatos(sales: AdminSale[], getRegion: Props['getRegion'], getEstado: Props['getEstado']) {
  return sales.map(s => ({
    'Fecha': s.fecha ?? '',
    'Empresa': s.marcaLabel || 'OVER',
    'Vendedor': s.vendorName ?? '',
    'Hora': s.hora ?? '',
    'Región': getRegion(s),
    'Cliente': s.nom ?? '',
    'Celular': s.cel ?? '',
    'DNI': s.dni ?? '',
    'Total S/': Number(s.totalTotal) || 0,
    'Debe': s.resta || '',
    'Separo': s.separo || '',
    'Estado': getEstado(s),
    'Cod. Publicidad': s.codigoPublicidad ?? '',
    'Met. Pago': s.metodoPago ?? '',
    'Combo': s.combo ?? '',
  }));
}

export default function PlanillasPanel({ filteredSales, allSales, dateFrom, dateTo, brandFilter, getRegion, getEstado }: Props) {
  const [libros, setLibros] = useState<LibroPlanilla[]>([]);
  const [hojasPorLibro, setHojasPorLibro] = useState<Record<string, HojaPlanilla[]>>({});
  const [openLibros, setOpenLibros] = useState<Record<string, boolean>>({});
  const [loadingLibros, setLoadingLibros] = useState(true);
  const [loadingHojas, setLoadingHojas] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null); // libro_id being added to

  // Modal crear libro
  const [showNuevoLibro, setShowNuevoLibro] = useState(false);
  const [nuevoLibroNombre, setNuevoLibroNombre] = useState('');
  const [creatingLibro, setCreatingLibro] = useState(false);

  // Modal nueva hoja
  const [addHojaLibroId, setAddHojaLibroId] = useState<string | null>(null);
  const [nuevaHojaNombre, setNuevaHojaNombre] = useState('');
  const [addingHoja, setAddingHoja] = useState(false);
  const [hojaDesde, setHojaDesde] = useState('');
  const [hojaHasta, setHojaHasta] = useState('');

  useEffect(() => {
    loadLibros();
  }, []);

  const loadLibros = async () => {
    setLoadingLibros(true);
    const data = await getLibros();
    setLibros(data);
    setLoadingLibros(false);
  };

  const loadHojas = async (libro_id: string) => {
    setLoadingHojas(prev => ({ ...prev, [libro_id]: true }));
    const data = await getHojas(libro_id);
    setHojasPorLibro(prev => ({ ...prev, [libro_id]: data }));
    setLoadingHojas(prev => ({ ...prev, [libro_id]: false }));
  };

  const toggleLibro = (id: string) => {
    const nextOpen = !openLibros[id];
    setOpenLibros(prev => ({ ...prev, [id]: nextOpen }));
    if (nextOpen && !hojasPorLibro[id]) loadHojas(id);
  };

  const handleCrearLibro = async () => {
    if (!nuevoLibroNombre.trim()) return;
    setCreatingLibro(true);
    const libro = await createLibro(nuevoLibroNombre.trim());
    if (libro) {
      setLibros(prev => [libro, ...prev]);
      setOpenLibros(prev => ({ ...prev, [libro.id]: true }));
      setHojasPorLibro(prev => ({ ...prev, [libro.id]: [] }));
    }
    setNuevoLibroNombre('');
    setShowNuevoLibro(false);
    setCreatingLibro(false);
  };

  const handleEliminarLibro = async (id: string) => {
    if (!window.confirm('¿Eliminar este libro y todas sus hojas?')) return;
    const ok = await deleteLibro(id);
    if (ok) {
      setLibros(prev => prev.filter(l => l.id !== id));
      setHojasPorLibro(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleAgregarHoja = async () => {
    if (!addHojaLibroId || !nuevaHojaNombre.trim()) return;
    setAddingHoja(true);
    const desde = hojaDesde || dateFrom;
    const hasta = hojaHasta || dateTo;
    const salesEnRango = allSales.filter(s => {
      if (!s.fecha) return false;
      if (brandFilter !== 'todas' && (s.marcaLabel || 'OVER').toLowerCase() !== brandFilter.toLowerCase()) return false;
      return s.fecha >= desde && s.fecha <= hasta;
    });
    const datos = salesToDatos(salesEnRango, getRegion, getEstado) as Record<string, unknown>[];
    const hoja = await createHoja(
      addHojaLibroId,
      nuevaHojaNombre.trim(),
      brandFilter === 'todas' ? 'Todas' : brandFilter.toUpperCase(),
      desde,
      hasta,
      datos
    );
    if (hoja) {
      setHojasPorLibro(prev => ({
        ...prev,
        [addHojaLibroId]: [...(prev[addHojaLibroId] || []), hoja],
      }));
    }
    setNuevaHojaNombre('');
    setAddHojaLibroId(null);
    setAddingHoja(false);
  };

  const handleEliminarHoja = async (libro_id: string, hoja_id: string) => {
    if (!window.confirm('¿Eliminar esta hoja?')) return;
    const ok = await deleteHoja(hoja_id);
    if (ok) {
      setHojasPorLibro(prev => ({
        ...prev,
        [libro_id]: (prev[libro_id] || []).filter(h => h.id !== hoja_id),
      }));
    }
  };

  const handleExportarLibro = async (libro: LibroPlanilla) => {
    setSaving(libro.id);
    let hojas = hojasPorLibro[libro.id];
    if (!hojas) {
      hojas = await getHojas(libro.id);
      setHojasPorLibro(prev => ({ ...prev, [libro.id]: hojas }));
    }
    if (hojas.length === 0) { setSaving(null); return; }

    const wb = XLSX.utils.book_new();
    hojas.forEach(hoja => {
      const ws = XLSX.utils.json_to_sheet(hoja.datos as Record<string, unknown>[]);
      // Auto column widths
      const cols = Object.keys(hoja.datos[0] || {}).map(k => ({ wch: Math.max(k.length, 12) }));
      ws['!cols'] = cols;
      XLSX.utils.book_append_sheet(wb, ws, hoja.nombre.substring(0, 31));
    });
    XLSX.writeFile(wb, `${libro.nombre}.xlsx`);
    setSaving(null);
  };

  const defaultHojaNombre = () => {
    const marca = brandFilter === 'todas' ? 'Todas' : brandFilter.toUpperCase();
    return `${marca} ${dateFrom}${dateTo !== dateFrom ? ` al ${dateTo}` : ''}`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Cabecera sección */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#45834D,#3a6d42)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.92rem', color: S.text2 }}>Planillas</div>
            <div style={{ fontSize: '0.7rem', color: S.muted }}>Libros guardados en Supabase · exportar como .xlsx</div>
          </div>
        </div>
        <button
          onClick={() => setShowNuevoLibro(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'linear-gradient(135deg,#45834D,#3a6d42)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(69,131,77,.3)' }}>
          <Plus size={14} /> Nuevo Libro
        </button>
      </div>

      {/* Lista de libros */}
      {loadingLibros ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem', justifyContent: 'center', color: S.muted }}>
          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Cargando planillas...
        </div>
      ) : libros.length === 0 ? (
        <div style={{ background: S.surface, border: '1px solid rgba(104,168,119,.25)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', color: S.muted }}>
          <FileSpreadsheet size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No hay libros creados</div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Crea un libro y agrega hojas con los datos filtrados actuales</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {libros.map(libro => {
            const isOpen = !!openLibros[libro.id];
            const hojas = hojasPorLibro[libro.id] || [];
            const isLoadingHojas = !!loadingHojas[libro.id];
            const isSaving = saving === libro.id;
            return (
              <div key={libro.id} style={{ background: S.surface, border: '1px solid rgba(104,168,119,.3)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Cabecera libro */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.1rem', background: 'linear-gradient(135deg,rgba(69,131,77,.06),rgba(104,168,119,.03))', borderBottom: isOpen ? '1px solid rgba(104,168,119,.2)' : 'none', gap: '0.75rem' }}>
                  <button
                    onClick={() => toggleLibro(libro.id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                    <BookOpen size={16} style={{ color: S.accent, flexShrink: 0 }} />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: S.text2 }}>{libro.nombre}</span>
                    <span style={{ fontSize: '0.68rem', color: S.muted }}>{new Date(libro.created_at).toLocaleDateString('es-PE')}</span>
                    {isOpen
                      ? <ChevronUp size={14} style={{ color: S.muted, marginLeft: 'auto' }} />
                      : <ChevronDown size={14} style={{ color: S.muted, marginLeft: 'auto' }} />}
                  </button>
                  <button
                    onClick={() => { setAddHojaLibroId(libro.id); setHojaDesde(dateFrom); setHojaHasta(dateTo); setNuevaHojaNombre(defaultHojaNombre()); }}
                    title={`Agregar hoja con los ${filteredSales.length} registros filtrados`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(69,131,77,.1)', border: '1px solid rgba(69,131,77,.25)', color: S.accent, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Plus size={11} /> Hoja ({filteredSales.length})
                  </button>
                  <button
                    onClick={() => handleExportarLibro(libro)}
                    disabled={isSaving}
                    title="Exportar como .xlsx"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(30,111,160,.08)', border: '1px solid rgba(30,111,160,.2)', color: '#1e6fa0', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', opacity: isSaving ? 0.6 : 1 }}>
                    {isSaving ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={11} />} .xlsx
                  </button>
                  <button
                    onClick={() => handleEliminarLibro(libro.id)}
                    title="Eliminar libro"
                    style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.4rem', borderRadius: '6px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Hojas del libro */}
                {isOpen && (
                  <div style={{ padding: '0.75rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {isLoadingHojas ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem', color: S.muted, fontSize: '0.8rem' }}>
                        <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Cargando hojas...
                      </div>
                    ) : hojas.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: S.muted, fontSize: '0.78rem' }}>
                        Sin hojas — usa "Hoja" para guardar los registros filtrados actuales
                      </div>
                    ) : hojas.map(hoja => (
                      <div key={hoja.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.8rem', background: 'rgba(242,251,245,.7)', border: '1px solid rgba(104,168,119,.2)', borderRadius: '8px' }}>
                        <FileSpreadsheet size={13} style={{ color: S.accent, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: S.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hoja.nombre}</div>
                          <div style={{ fontSize: '0.65rem', color: S.muted }}>
                            {hoja.marca} · {hoja.fecha_desde}{hoja.fecha_hasta !== hoja.fecha_desde ? ` → ${hoja.fecha_hasta}` : ''} · {(hoja.datos as unknown[]).length} registros
                          </div>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: S.muted, whiteSpace: 'nowrap' }}>{new Date(hoja.created_at).toLocaleDateString('es-PE')}</span>
                        <button
                          onClick={() => handleEliminarHoja(libro.id, hoja.id)}
                          title="Eliminar hoja"
                          style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 0.35rem', borderRadius: '5px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', cursor: 'pointer' }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nuevo libro */}
      {showNuevoLibro && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNuevoLibro(false); }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '400px', border: '1px solid rgba(104,168,119,.3)' }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: S.text2, marginBottom: '0.25rem' }}>Nuevo Libro</div>
            <div style={{ fontSize: '0.75rem', color: S.muted, marginBottom: '1.25rem' }}>Dale un nombre al libro, p.ej. "Mayo 2026" o "Semana 19"</div>
            <input
              autoFocus
              value={nuevoLibroNombre}
              onChange={e => setNuevoLibroNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCrearLibro()}
              placeholder="Nombre del libro..."
              style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid rgba(104,168,119,.4)', borderRadius: '8px', fontSize: '0.88rem', color: S.text2, outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNuevoLibro(false)} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1px solid rgba(104,168,119,.3)', background: 'transparent', color: S.muted, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>Cancelar</button>
              <button onClick={handleCrearLibro} disabled={creatingLibro || !nuevoLibroNombre.trim()}
                style={{ padding: '0.5rem 1.1rem', borderRadius: '7px', border: 'none', background: nuevoLibroNombre.trim() ? 'linear-gradient(135deg,#45834D,#3a6d42)' : 'rgba(104,168,119,.3)', color: '#fff', cursor: nuevoLibroNombre.trim() ? 'pointer' : 'default', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {creatingLibro ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />} Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva hoja */}
      {addHojaLibroId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setAddHojaLibroId(null); }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '440px', border: '1px solid rgba(104,168,119,.3)' }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: S.text2, marginBottom: '0.25rem' }}>Agregar Hoja</div>
            <div style={{ fontSize: '0.75rem', color: S.muted, marginBottom: '1rem' }}>
              Elige el rango de fechas a archivar
            </div>

            {/* Rango de fechas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Desde</label>
                <input type="date" value={hojaDesde} onChange={e => setHojaDesde(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid rgba(104,168,119,.4)', borderRadius: '8px', fontSize: '0.85rem', color: S.text2, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Hasta</label>
                <input type="date" value={hojaHasta} onChange={e => setHojaHasta(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid rgba(104,168,119,.4)', borderRadius: '8px', fontSize: '0.85rem', color: S.text2, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Resumen */}
            {(() => {
              const desde = hojaDesde || dateFrom;
              const hasta = hojaHasta || dateTo;
              const count = allSales.filter(s => {
                if (!s.fecha) return false;
                if (brandFilter !== 'todas' && (s.marcaLabel || 'OVER').toLowerCase() !== brandFilter.toLowerCase()) return false;
                return s.fecha >= desde && s.fecha <= hasta;
              }).length;
              return (
                <div style={{ background: 'rgba(242,251,245,.8)', border: '1px solid rgba(104,168,119,.2)', borderRadius: '8px', padding: '0.55rem 0.85rem', marginBottom: '1rem', fontSize: '0.75rem', color: S.muted, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Empresa: <strong style={{ color: S.text }}>{brandFilter === 'todas' ? 'Todas' : brandFilter.toUpperCase()}</strong></span>
                  <span style={{ fontWeight: 800, color: S.accent }}>{count} registros</span>
                </div>
              );
            })()}

            <input
              autoFocus
              value={nuevaHojaNombre}
              onChange={e => setNuevaHojaNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAgregarHoja()}
              placeholder="Nombre de la hoja..."
              style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid rgba(104,168,119,.4)', borderRadius: '8px', fontSize: '0.88rem', color: S.text2, outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setAddHojaLibroId(null)} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1px solid rgba(104,168,119,.3)', background: 'transparent', color: S.muted, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>Cancelar</button>
              <button onClick={handleAgregarHoja} disabled={addingHoja || !nuevaHojaNombre.trim()}
                style={{ padding: '0.5rem 1.1rem', borderRadius: '7px', border: 'none', background: nuevaHojaNombre.trim() ? 'linear-gradient(135deg,#45834D,#3a6d42)' : 'rgba(104,168,119,.3)', color: '#fff', cursor: nuevaHojaNombre.trim() ? 'pointer' : 'default', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {addingHoja ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />} Guardar Hoja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
