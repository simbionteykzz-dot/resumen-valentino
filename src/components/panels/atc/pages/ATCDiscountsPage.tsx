import { useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronRight, Pencil, Percent, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import atcLogo from '../../../../icon-marca/atc/atc.png';
import {
  createATCDescuento,
  deleteATCDescuento,
  getATCDescuentos,
  getCustomerSheetsVentas,
  getCustomerVentas,
  searchCustomers,
  searchSheetsCustomers,
  updateATCDescuento,
} from '../../../../lib/supabase';
import type { ATCDescuento, CustomerBasic, SheetsVentaDB, VentaDB } from '../../../../lib/supabase';
import { searchZazuEnvios } from '../../../../lib/zazuSupabase';
import type { ZazuEnvio } from '../../../../lib/zazuSupabase';
import { ATC_GRADIENTS, ATC_PALETTE } from '../theme';

type RespGroup = { group: string; items: string[] };

type DescForm = {
  fecha: string;
  nota_venta: string;
  dni: string;
  telefono: string;
  nombre_cliente: string;
  descripcion: string;
  descuento: string;
  responsable: string;
};

const RESPONSABLE_GROUPS = ['SUBIDORES', 'VENDEDORES', 'OTROS'] as const;

const emptyDesc = (): DescForm => ({
  fecha: new Date().toISOString().slice(0, 10),
  nota_venta: '',
  dni: '',
  telefono: '',
  nombre_cliente: '',
  descripcion: '',
  descuento: '',
  responsable: '',
});

interface ATCDiscountsPageProps {
  userId?: string;
  responsables: string[];
  responsablesGrouped?: RespGroup[];
}

export default function ATCDiscountsPage({ userId, responsables, responsablesGrouped }: ATCDiscountsPageProps) {
  const renderRespOptions = (withBlank = true) => responsablesGrouped ? (
    <>
      {withBlank && <option value="">— Seleccionar —</option>}
      {responsablesGrouped.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.items.map(r => <option key={r} value={r}>{r}</option>)}
        </optgroup>
      ))}
    </>
  ) : (
    <>
      {withBlank && <option value="">— Seleccionar —</option>}
      {responsables.map(r => <option key={r} value={r}>{r}</option>)}
    </>
  );

  const [rows, setRows] = useState<ATCDescuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DescForm>(emptyDesc());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DescForm>(emptyDesc());
  const [filterResp, setFilterResp] = useState('');
  const [filterNom, setFilterNom] = useState('');
  const [tipoResp, setTipoResp] = useState('');
  const [editTipoResp, setEditTipoResp] = useState('');

  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<CustomerBasic[]>([]);
  const [custSearching, setCustSearching] = useState(false);
  const [selectedCust, setSelectedCust] = useState<CustomerBasic | null>(null);
  const [custVentas, setCustVentas] = useState<VentaDB[]>([]);
  const [custSheetsVentas, setCustSheetsVentas] = useState<SheetsVentaDB[]>([]);
  const [custZazuEnvios, setCustZazuEnvios] = useState<ZazuEnvio[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [ntvManual, setNtvManual] = useState(false);
  const groupedResp = (responsablesGrouped && responsablesGrouped.length > 0
    ? responsablesGrouped
    : RESPONSABLE_GROUPS.map(group => ({
        group,
        items: responsables.filter(r => {
          const upper = r.toUpperCase();
          if (group === 'SUBIDORES') return upper.includes('SUBID');
          if (group === 'VENDEDORES') return upper.includes('VENDED') || upper.includes('ASESOR');
          return !upper.includes('SUBID') && !upper.includes('VENDED') && !upper.includes('ASESOR');
        }),
      }))
  ).filter(g => g.items.length > 0);

  useEffect(() => {
    getATCDescuentos().then(d => { setRows(d); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!custQuery.trim()) { setCustResults([]); return; }
    const t = setTimeout(async () => {
      setCustSearching(true);
      const [dbRes, sheetsRes] = await Promise.all([
        searchCustomers(custQuery),
        searchSheetsCustomers(custQuery),
      ]);
      const seen = new Set(dbRes.map(c => c.cel));
      setCustResults([...dbRes, ...sheetsRes.filter(c => !seen.has(c.cel))]);
      setCustSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [custQuery]);

  const selectCust = async (c: CustomerBasic) => {
    setSelectedCust(c);
    setCustQuery(c.nom);
    setCustResults([]);
    setNtvManual(false);
    setForm(p => ({ ...p, nombre_cliente: c.nom, dni: c.dni ?? '', telefono: c.cel, nota_venta: '', responsable: '' }));
    setLoadingVentas(true);
    const zazuQ = c.dni || c.nom;
    const [ventas, sheets, zazu] = await Promise.all([
      getCustomerVentas(c.cel),
      getCustomerSheetsVentas(c.cel),
      searchZazuEnvios(zazuQ),
    ]);
    setCustVentas(ventas.filter(v => !v.anulado && v.metodo_pago !== 'Anulado'));
    setCustSheetsVentas(sheets);
    setCustZazuEnvios(zazu);
    setLoadingVentas(false);
  };

  const clearCust = () => {
    setSelectedCust(null);
    setCustQuery('');
    setCustResults([]);
    setCustVentas([]);
    setCustSheetsVentas([]);
    setCustZazuEnvios([]);
    setNtvManual(false);
    setForm(p => ({ ...p, nombre_cliente: '', dni: '', telefono: '', nota_venta: '', responsable: '' }));
  };

  const save = async () => {
    if (!form.nombre_cliente.trim() || !form.descripcion.trim() || !form.descuento.trim()) {
      setSaveError('Completa: Nombre cliente, Descripción y Descuento.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const created = await createATCDescuento({
      fecha: form.fecha,
      nota_venta: form.nota_venta.trim() || undefined,
      dni: form.dni.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      nombre_cliente: form.nombre_cliente.trim(),
      descripcion: form.descripcion.trim(),
      descuento: Number(form.descuento),
      responsable: form.responsable.trim() || undefined,
      atc_user_id: userId,
    });
    if (created) {
      setRows(prev => [created, ...prev]);
      setForm(emptyDesc());
      setTipoResp('');
      clearCust();
      setShowForm(false);
      setSaveError(null);
    } else {
      setSaveError('No se pudo guardar. Verifica que la tabla atc_descuentos exista en Supabase.');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const ok = await deleteATCDescuento(id);
    if (ok) setRows(prev => prev.filter(r => r.id !== id));
  };

  const startEdit = (r: ATCDescuento) => {
    setEditingId(r.id!);
    const respName = r.responsable ?? '';
    const respGroup = responsablesGrouped?.find(g => g.items.includes(respName))?.group ?? '';
    setEditTipoResp(respGroup);
    setEditForm({
      fecha: r.fecha, nota_venta: r.nota_venta ?? '', dni: r.dni ?? '', telefono: r.telefono ?? '',
      nombre_cliente: r.nombre_cliente, descripcion: r.descripcion, descuento: String(r.descuento), responsable: respName,
    });
  };

  const saveEdit = async (id: string) => {
    const ok = await updateATCDescuento(id, {
      fecha: editForm.fecha,
      nota_venta: editForm.nota_venta || undefined,
      dni: editForm.dni || undefined,
      telefono: editForm.telefono || undefined,
      nombre_cliente: editForm.nombre_cliente,
      descripcion: editForm.descripcion,
      descuento: Number(editForm.descuento),
      responsable: editForm.responsable || undefined,
    });
    if (ok) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...editForm, descuento: Number(editForm.descuento) } : r));
      setEditingId(null);
      setEditTipoResp('');
    }
  };

  const filtered = rows.filter(r =>
    (!filterResp || r.responsable === filterResp) &&
    (!filterNom || (r.nombre_cliente + r.telefono + r.dni).toLowerCase().includes(filterNom.toLowerCase())),
  );

  const totalDesc = filtered.reduce((s, r) => s + (Number(r.descuento) || 0), 0);
  const avgDesc = filtered.length ? totalDesc / filtered.length : 0;
  const withNtv = filtered.filter(r => Boolean(r.nota_venta)).length;
  const withResp = filtered.filter(r => Boolean(r.responsable)).length;
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.38rem 0.55rem', border: '1px solid rgba(104,168,119,.28)',
    borderRadius: '8px', fontSize: '0.78rem', color: ATC_PALETTE.text2, background: '#fff', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '14px', padding: '0.8rem 1rem', minHeight: '72vh', boxShadow: '0 2px 12px rgba(69,131,77,.08)' }}>
      <div style={{ padding: '0.35rem 0 0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Percent size={16} color={ATC_PALETTE.accent} />
          <span style={{ fontSize: '0.92rem', fontWeight: 900, color: ATC_PALETTE.text2 }}>Descuentos ATC</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(69,131,77,.14)', color: ATC_PALETTE.accent, borderRadius: '5px', padding: '0.1rem 0.5rem' }}>{filtered.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input value={filterNom} onChange={e => setFilterNom(e.target.value)} placeholder="Buscar cliente / cel / DNI..." style={{ ...inp, width: '210px' }} />
          <select value={filterResp} onChange={e => setFilterResp(e.target.value)} style={inp}>
            <option value="">Todos los responsables</option>
            {renderRespOptions(false)}
          </select>
          <button
            onClick={() => { setShowForm(f => !f); setForm(emptyDesc()); clearCust(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: ATC_GRADIENTS.violetBtn, color: '#fff' }}
          >
            <Plus size={13} /> Nuevo
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: '0.55rem', marginBottom: '0.9rem' }}>
        {[
          { label: 'Registros', value: String(filtered.length), color: '#45834D', bg: 'rgba(69,131,77,.10)' },
          { label: 'Total descuentos', value: `S/ ${totalDesc.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, color: '#1e6fa0', bg: 'rgba(30,111,160,.10)' },
          { label: 'Promedio', value: `S/ ${avgDesc.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, color: '#a0780a', bg: 'rgba(160,120,10,.10)' },
          { label: 'Con NTV', value: `${withNtv}/${filtered.length || 0}`, color: '#4b5563', bg: 'rgba(75,85,99,.08)' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: '10px', padding: '0.55rem 0.7rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: k.color, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ padding: '1rem', marginTop: '0.9rem', background: 'rgba(242,251,245,.86)', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0.9rem' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                    Buscar Cliente (cel / nombre / DNI) *
                    {selectedCust && <button onClick={clearCust} style={{ marginLeft: '0.5rem', fontSize: '0.6rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><X size={10} /> Cambiar</button>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#517861', pointerEvents: 'none' }} />
                    <input value={custQuery} onChange={e => { setCustQuery(e.target.value); if (selectedCust) clearCust(); }} placeholder="Buscar por celular, nombre o DNI..." style={{ ...inp, paddingLeft: '1.75rem' }} readOnly={!!selectedCust} />
                  </div>
                  {custResults.length > 0 && !selectedCust && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid rgba(104,168,119,.25)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(69,131,77,.12)', zIndex: 20, maxHeight: '200px', overflowY: 'auto', marginTop: '2px' }}>
                      {custSearching && <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.75rem', color: '#517861' }}>Buscando...</div>}
                      {custResults.map(c => (
                        <button key={c.cel} onClick={() => selectCust(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(69,131,77,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: '#45834D', flexShrink: 0 }}>{c.nom.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: ATC_PALETTE.text2 }}>{c.nom || '—'}</div>
                            <div style={{ fontSize: '0.65rem', color: '#517861' }}>{c.cel}{c.dni ? ` · DNI ${c.dni}` : ''}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 120px 160px', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Nota de Venta</label>
                  {selectedCust && !ntvManual && (custVentas.length > 0 || custSheetsVentas.length > 0 || custZazuEnvios.length > 0) ? (
                    <select value={form.nota_venta} onChange={e => setForm(p => ({ ...p, nota_venta: e.target.value }))} style={inp}>
                      <option value="">— Seleccionar NTV —</option>
                      {custVentas.slice(0, 30).map(v => <option key={v.id} value={v.id ?? ''}>{v.fecha?.slice(0, 10)} · {v.combo?.slice(0, 25) ?? '—'} · S/{v.total_total}</option>)}
                      {custSheetsVentas.slice(0, 30).map(v => <option key={v.id} value={v.id ?? ''}>{v.fecha?.slice(0, 10)} · {v.empresa ?? '—'} · S/{v.monto_total}</option>)}
                      {custZazuEnvios.slice(0, 30).map(v => <option key={`z-${v.ntv}-${v.fuente}`} value={v.ntv}>{v.fecha?.slice(0, 10)} · {v.fuente} · {v.empresa?.slice(0, 18) ?? '—'} · S/{v.monto_cobrar}</option>)}
                    </select>
                  ) : (
                    <input value={form.nota_venta} onChange={e => setForm(p => ({ ...p, nota_venta: e.target.value }))} placeholder="NTV-..." style={inp} />
                  )}
                  {selectedCust && (
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                      <button type="button" onClick={() => setNtvManual(false)} style={{ padding: '0.2rem 0.45rem', borderRadius: '999px', border: 'none', background: !ntvManual ? 'rgba(69,131,77,.14)' : 'rgba(69,131,77,.08)', color: !ntvManual ? '#45834D' : '#64748b', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer' }}>Automático</button>
                      <button type="button" onClick={() => setNtvManual(true)} style={{ padding: '0.2rem 0.45rem', borderRadius: '999px', border: 'none', background: ntvManual ? 'rgba(30,111,160,.14)' : 'rgba(30,111,160,.08)', color: ntvManual ? '#1e6fa0' : '#64748b', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer' }}>Manual</button>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Descripción *</label>
                  <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Motivo del descuento..." style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Descuento S/ *</label>
                  <input type="number" min="0" step="0.01" value={form.descuento} onChange={e => setForm(p => ({ ...p, descuento: e.target.value }))} placeholder="0.00" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Tipo Responsable</label>
                  <select value={tipoResp} onChange={e => { setTipoResp(e.target.value); setForm(p => ({ ...p, responsable: '' })); }} style={inp}>
                    <option value="">— Seleccionar —</option>
                    {groupedResp.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '-0.15rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Responsable ({tipoResp || 'sin grupo'})</label>
                <select
                  value={form.responsable}
                  onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))}
                  style={inp}
                  disabled={!tipoResp}
                >
                  <option value="">{tipoResp ? '— Seleccionar responsable —' : 'Primero selecciona Tipo Responsable'}</option>
                  {groupedResp.find(g => g.group === tipoResp)?.items.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '10px', padding: '0.7rem 0.75rem', border: '1px solid rgba(104,168,119,.2)', height: 'fit-content' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Contexto cliente</div>
              {!selectedCust ? (
                <div style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.45 }}>
                  Busca y selecciona un cliente para ver su contexto de ventas y facilitar una justificación sólida del descuento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: ATC_PALETTE.text2 }}>{selectedCust.nom}</div>
                  <div style={{ fontSize: '0.7rem', color: '#517861' }}>{selectedCust.cel}{selectedCust.dni ? ` · DNI ${selectedCust.dni}` : ''}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <div style={{ background: 'rgba(69,131,77,.08)', borderRadius: '8px', padding: '0.42rem 0.5rem' }}>
                      <div style={{ fontSize: '0.58rem', color: '#517861', textTransform: 'uppercase', fontWeight: 800 }}>DB ventas</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#45834D' }}>{custVentas.length}</div>
                    </div>
                    <div style={{ background: 'rgba(30,111,160,.08)', borderRadius: '8px', padding: '0.42rem 0.5rem' }}>
                      <div style={{ fontSize: '0.58rem', color: '#517861', textTransform: 'uppercase', fontWeight: 800 }}>Sheets</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#1e6fa0' }}>{custSheetsVentas.length}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#6b7280', lineHeight: 1.35 }}>
                    {loadingVentas ? 'Cargando contexto de compras...' : `ZAZU encontrados: ${custZazuEnvios.length}`}
                  </div>
                  <div style={{ background: 'rgba(246,249,252,.9)', borderRadius: '8px', padding: '0.5rem 0.55rem' }}>
                    <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>Datos para formulario</div>
                    <div style={{ fontSize: '0.68rem', color: '#334155', lineHeight: 1.45 }}>
                      <div><strong>Nombre:</strong> {form.nombre_cliente || '—'}</div>
                      <div><strong>Celular:</strong> {form.telefono || '—'}</div>
                      <div><strong>DNI:</strong> {form.dni || '—'}</div>
                      <div><strong>NTV:</strong> {form.nota_venta || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
                    Registros con responsable: <strong style={{ color: '#334155' }}>{withResp}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {saveError && <div style={{ padding: '0.45rem 0.7rem', borderRadius: '7px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#fda4af', fontSize: '0.75rem', fontWeight: 600 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {saveError}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.6rem' }}>
            <button onClick={() => { setShowForm(false); clearCust(); setSaveError(null); setTipoResp(''); }} style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,0,0,.12)', background: 'transparent', color: '#888' }}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ padding: '0.4rem 1.1rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: ATC_GRADIENTS.accentBtn, color: '#fff', opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      )}

      <div style={{ overflowY: 'auto', marginTop: '0.8rem' }}>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#517861', fontSize: '0.82rem' }}>Cargando...</div> : filtered.length === 0 ? <div style={{ padding: '2.5rem', textAlign: 'center', color: '#517861', fontSize: '0.82rem' }}>Sin registros de descuentos.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((r, i) => {
              const isExpanded = expandedId === r.id;
              return editingId === r.id ? (
                <div key={r.id} style={{ background: 'rgba(69,131,77,.06)', padding: '0.65rem 1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 110px 90px 105px 1fr 1fr 90px auto', gap: '0.4rem', alignItems: 'center' }}>
                    <input type="date" value={editForm.fecha} onChange={e => setEditForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
                    <input value={editForm.nota_venta} onChange={e => setEditForm(p => ({ ...p, nota_venta: e.target.value }))} placeholder="NTV" style={inp} />
                    <input value={editForm.dni} onChange={e => setEditForm(p => ({ ...p, dni: e.target.value }))} placeholder="DNI" style={inp} />
                    <input value={editForm.telefono} onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))} placeholder="Teléfono" style={inp} />
                    <input value={editForm.nombre_cliente} onChange={e => setEditForm(p => ({ ...p, nombre_cliente: e.target.value }))} placeholder="Nombre cliente" style={inp} />
                    <input value={editForm.descripcion} onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción" style={inp} />
                    <input type="number" value={editForm.descuento} onChange={e => setEditForm(p => ({ ...p, descuento: e.target.value }))} placeholder="0.00" style={inp} />
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => saveEdit(r.id!)} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: 'none', background: '#45834D', color: '#fff', cursor: 'pointer' }}><Check size={11} /></button>
                      <button onClick={() => { setEditingId(null); setEditTipoResp(''); }} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: '1px solid #64748b', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}><X size={11} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={r.id} style={{ background: isExpanded ? 'rgba(69,131,77,.07)' : i % 2 === 0 ? 'transparent' : 'rgba(69,131,77,.04)' }}>
                  <div onClick={() => setExpandedId(prev => prev === r.id ? null : r.id!)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(69,131,77,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: '#45834D', flexShrink: 0 }}>{r.nombre_cliente.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: ATC_PALETTE.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre_cliente}</div>
                      <div style={{ fontSize: '0.68rem', color: '#517861', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descripcion}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {r.nota_venta && <span style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'monospace', background: 'rgba(69,131,77,.14)', color: '#45834D', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>{r.nota_venta}</span>}
                      <span style={{ fontSize: '0.65rem', color: '#517861' }}>{r.fecha}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#45834D', minWidth: '70px', textAlign: 'right' }}>S/ {Number(r.descuento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                      <span style={{ color: isExpanded ? '#45834D' : '#517861', transition: 'transform 0.2s', display: 'inline-flex', transform: isExpanded ? 'rotate(90deg)' : 'none' }}><ChevronRight size={12} /></span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 1rem 0.85rem 1rem' }}>
                      <div style={{ marginBottom: '0.65rem', paddingTop: '0.65rem' }}>
                        <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#9bb0d3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Descripción</div>
                        <div style={{ fontSize: '0.8rem', color: ATC_PALETTE.text, background: 'rgba(242,251,245,.9)', border: 'none', borderRadius: '7px', padding: '0.5rem 0.75rem', lineHeight: 1.5 }}>{r.descripcion}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <button onClick={() => printDescuentoPDF(r)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(69,131,77,.12)', color: '#45834D' }}><Printer size={12} /> Exportar PDF</button>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button onClick={e => { e.stopPropagation(); startEdit(r); setExpandedId(null); }} style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(69,131,77,.12)', color: '#45834D' }}><Pencil size={11} /></button>
                          <button onClick={e => { e.stopPropagation(); if (window.confirm('¿Eliminar este descuento?')) remove(r.id!); }} style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.07)', color: '#f87171' }}><Trash2 size={11} /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ padding: '0.85rem 0.25rem 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9bb0d3', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total descuentos:</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#45834D' }}>S/ {totalDesc.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
        </div>
      )}
    </div>
  );
}

function printDescuentoPDF(r: ATCDescuento) {
  type PedidoVinculado = {
    fuente: 'Ventas DB' | 'Sheets' | 'ZAZU';
    fecha: string;
    detalle: string;
    estado?: string;
    ubicacion?: string;
  };
  const safeText = (v?: string) => (v && v.trim() ? v.trim() : '—');
  const cleanDate = (v?: string) => (v || '').slice(0, 10) || '—';
  const pickPedido = async (): Promise<PedidoVinculado | null> => {
    const tel = (r.telefono || '').trim();
    const nota = (r.nota_venta || '').trim();
    const zazuQ = (r.dni || r.nombre_cliente || tel || '').trim();
    if (!tel && !zazuQ) return null;
    try {
      const [ventas, sheets, zazu] = await Promise.all([
        tel ? getCustomerVentas(tel) : Promise.resolve([]),
        tel ? getCustomerSheetsVentas(tel) : Promise.resolve([]),
        zazuQ ? searchZazuEnvios(zazuQ) : Promise.resolve([]),
      ]);
      const ventaMatch = nota ? ventas.find(v => String(v.id ?? '').trim() === nota) : ventas[0];
      if (ventaMatch) {
        return {
          fuente: 'Ventas DB',
          fecha: cleanDate(ventaMatch.fecha),
          detalle: safeText(ventaMatch.combo || ventaMatch.detalle || 'Pedido registrado en ventas'),
          estado: safeText(ventaMatch.metodo_pago || 'Registrado'),
          ubicacion: safeText([ventaMatch.distrito, ventaMatch.provincia, ventaMatch.depto].filter(Boolean).join(', ') || ventaMatch.ubicacion),
        };
      }
      const sheetMatch = nota ? sheets.find(v => String(v.id ?? '').trim() === nota) : sheets[0];
      if (sheetMatch) {
        return {
          fuente: 'Sheets',
          fecha: cleanDate(sheetMatch.fecha),
          detalle: safeText(sheetMatch.empresa || sheetMatch.nom_producto || 'Pedido registrado en sheets'),
          estado: safeText(sheetMatch.estado_envio || 'Registrado'),
          ubicacion: safeText(sheetMatch.sede || sheetMatch.ubicacion),
        };
      }
      const zazuMatch = nota ? zazu.find(v => String(v.ntv ?? '').trim() === nota) : zazu[0];
      if (zazuMatch) {
        return {
          fuente: 'ZAZU',
          fecha: cleanDate(zazuMatch.fecha),
          detalle: safeText(zazuMatch.empresa || zazuMatch.nombre || 'Pedido registrado en envíos'),
          estado: safeText(zazuMatch.estado),
          ubicacion: safeText(zazuMatch.ubicacion),
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  (async () => {
  const now = new Date();
  const generatedAt = now.toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
  const certId = `ATC-DSC-${(r.id ?? 'LOCAL').toString().slice(0, 8).toUpperCase()}`;
  const toMoney = (v?: string | number) => {
    const n = typeof v === 'number' ? v : Number(v || 0);
    return `S/ ${Number.isFinite(n) ? n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`;
  };
  const pedido = await pickPedido();

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Constancia Descuento</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2e38; background: #f8fafc; padding: 30px; }
  .sheet { background: #fff; border: 1px solid #e6ecf3; border-radius: 16px; overflow: hidden; }
  .top-line { height: 6px; background: linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 22px 14px; border-bottom: 1px solid #eef2f7; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand h1 { font-size: 18px; font-weight: 900; letter-spacing: .02em; color: #111827; }
  .brand h1 span { color: #7c3aed; }
  .brand p { font-size: 11px; color: #64748b; margin-top: 2px; }
  .meta { text-align: right; }
  .meta .title { font-size: 16px; font-weight: 900; color: #4f46e5; }
  .meta .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
  .badges { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  .badge { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 999px; border: 1px solid #e2e8f0; color: #475569; background: #f8fafc; }
  .content { display: grid; grid-template-columns: 1.4fr .9fr; gap: 14px; padding: 16px 22px 18px; }
  .panel { border: 1px solid #e8edf4; border-radius: 12px; padding: 12px; }
  .panel-title { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 900; color: #64748b; margin-bottom: 10px; }
  .kv { display: grid; grid-template-columns: 110px 1fr; gap: 8px; row-gap: 7px; }
  .k { font-size: 11px; font-weight: 700; color: #64748b; }
  .v { font-size: 12px; font-weight: 800; color: #111827; }
  .desc { margin-top: 10px; font-size: 12px; line-height: 1.55; color: #1f2937; background: #f8fafc; border-radius: 8px; padding: 9px 10px; border: 1px solid #e8edf4; min-height: 74px; }
  .money-box { background: linear-gradient(180deg,#faf5ff,#f3e8ff); border: 1px solid #ddd6fe; border-radius: 12px; padding: 12px; }
  .money-label { font-size: 10px; font-weight: 800; color: #6b21a8; text-transform: uppercase; letter-spacing: .06em; }
  .money-main { font-size: 28px; font-weight: 900; color: #7c3aed; margin-top: 4px; }
  .summary { margin-top: 10px; border-top: 1px dashed #dbe3ee; padding-top: 10px; display: grid; gap: 6px; }
  .sum-row { display: flex; justify-content: space-between; font-size: 11px; }
  .sum-row .l { color: #64748b; font-weight: 700; }
  .sum-row .r { color: #111827; font-weight: 900; }
  .sum-row.total .r { color: #15803d; }
  .pedido { margin-top: 10px; border-top: 1px dashed #dbe3ee; padding-top: 9px; }
  .pedido .h { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; color: #5b6472; margin-bottom: 6px; }
  .pedido .t { display: grid; grid-template-columns: 74px 1fr; gap: 6px; row-gap: 5px; font-size: 11px; }
  .pedido .k { color: #64748b; font-weight: 700; }
  .pedido .v { color: #0f172a; font-weight: 800; }
  .footer { border-top: 1px solid #eef2f7; padding: 10px 22px 14px; display: flex; justify-content: space-between; align-items: center; }
  .footer .left { font-size: 10px; color: #64748b; }
  .footer .right { text-align: right; font-size: 10px; color: #64748b; }
  .sign { margin-top: 4px; font-size: 11px; font-weight: 800; color: #0f172a; }
</style></head><body>
<div class="sheet">
  <div class="top-line"></div>
  <div class="header">
    <div class="brand">
      <img src="${atcLogo}" style="width:52px;height:52px;object-fit:contain"/>
      <div>
        <h1>LIVEX <span>ATC</span></h1>
        <p>Documento interno de autorización de descuento</p>
      </div>
    </div>
    <div class="meta">
      <div class="title">Constancia de Descuento</div>
      <div class="sub">Generado el ${generatedAt}</div>
      <div class="badges">
        <span class="badge">${certId}</span>
        <span class="badge">Válido</span>
      </div>
    </div>
  </div>

  <div class="content">
    <div class="panel">
      <div class="panel-title">Datos del cliente y operación</div>
      <div class="kv">
        <div class="k">Nombre</div><div class="v">${r.nombre_cliente || '—'}</div>
        <div class="k">Teléfono</div><div class="v">${r.telefono || '—'}</div>
        <div class="k">DNI</div><div class="v">${r.dni || '—'}</div>
        <div class="k">Fecha</div><div class="v">${r.fecha || '—'}</div>
        <div class="k">Responsable</div><div class="v">${r.responsable || '—'}</div>
      </div>
      <div class="desc">${r.descripcion || 'Sin descripción registrada.'}</div>
    </div>

    <div class="panel">
      <div class="panel-title">Resumen financiero</div>
      <div class="money-box">
        <div class="money-label">Descuento aprobado</div>
        <div class="money-main">${toMoney(r.descuento)}</div>
      </div>
      <div class="summary">
        <div class="sum-row total"><span class="l">Descuento aplicado</span><span class="r">${toMoney(r.descuento)}</span></div>
      </div>
      ${pedido ? `
      <div class="pedido">
        <div class="h">Pedido vinculado</div>
        <div class="t">
          <div class="k">Fuente</div><div class="v">${pedido.fuente}</div>
          <div class="k">Fecha</div><div class="v">${pedido.fecha}</div>
          <div class="k">Detalle</div><div class="v">${pedido.detalle}</div>
          <div class="k">Estado</div><div class="v">${pedido.estado || '—'}</div>
          <div class="k">Ubicación</div><div class="v">${pedido.ubicacion || '—'}</div>
        </div>
      </div>` : ''}
    </div>
  </div>

  <div class="footer">
    <div class="left">Certificado para control interno de descuentos ATC.</div>
    <div class="right">
      <div>Emitido por ${r.responsable || 'ATC'}</div>
      <div class="sign">LIVEX AGENCY · ATC</div>
    </div>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) { win.document.write(html); win.document.close(); }
  })();
}
