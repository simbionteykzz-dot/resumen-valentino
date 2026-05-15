import { useState, useEffect } from 'react';
import { Target, Save, CheckCircle, AlertCircle, TrendingUp, Award, BarChart3, DollarSign } from 'lucide-react';
import { getVendorGoals, upsertVendorGoal } from '../../lib/supabase';
import type { VendorGoal } from '../../lib/supabase';
import type { Profile, VendorStats } from '../../types';

interface MetasPanelProps {
  profiles: Profile[];
  vendorStats: VendorStats[];
  dateFrom: string;
  dateTo: string;
}

interface GoalRow {
  vendor_id: string;
  vendor_name: string;
  meta_ingresos: string;
  meta_ventas: string;
  saving: boolean;
  saved: boolean;
  error: string;
}

function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

export default function MetasPanel({ profiles, vendorStats, dateFrom, dateTo }: MetasPanelProps) {
  const [rows, setRows] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const goals = await getVendorGoals();
      const goalsMap: Record<string, VendorGoal> = {};
      goals.forEach(g => { goalsMap[g.vendor_id] = g; });

      const EXCLUDED_NAMES = ['LIVEX'];
      const EXTRA_ADMINS = ['VALENTINO'];
      const vendors = profiles.filter(p =>
        (p.role === 'vendedor' && !EXCLUDED_NAMES.includes(p.full_name.toUpperCase())) ||
        EXTRA_ADMINS.some(n => p.full_name.toUpperCase().includes(n))
      );
      setRows(vendors.map(p => ({
        vendor_id: p.id,
        vendor_name: p.full_name,
        meta_ingresos: String(goalsMap[p.id]?.meta_ingresos ?? 0),
        meta_ventas: String(goalsMap[p.id]?.meta_ventas ?? 0),
        saving: false,
        saved: false,
        error: '',
      })));
      setLoading(false);
    })();
  }, [profiles]);

  const updateField = (vendor_id: string, field: 'meta_ingresos' | 'meta_ventas', value: string) => {
    setRows(prev => prev.map(r => r.vendor_id === vendor_id ? { ...r, [field]: value, saved: false, error: '' } : r));
  };

  const saveGoal = async (vendor_id: string) => {
    const row = rows.find(r => r.vendor_id === vendor_id);
    if (!row) return;
    setRows(prev => prev.map(r => r.vendor_id === vendor_id ? { ...r, saving: true, error: '' } : r));
    const ok = await upsertVendorGoal({
      vendor_id,
      meta_ingresos: Number(row.meta_ingresos) || 0,
      meta_ventas: Number(row.meta_ventas) || 0,
    });
    setRows(prev => prev.map(r => r.vendor_id === vendor_id
      ? { ...r, saving: false, saved: ok, error: ok ? '' : 'Error al guardar' }
      : r
    ));
    if (ok) setTimeout(() => setRows(prev => prev.map(r => r.vendor_id === vendor_id ? { ...r, saved: false } : r)), 2500);
  };

  const saveAll = async () => {
    await Promise.all(rows.map(r => saveGoal(r.vendor_id)));
  };

  const statsMap: Record<string, VendorStats> = {};
  vendorStats.forEach(v => { statsMap[v.id] = v; });

  const periodLabel = dateFrom === dateTo ? dateFrom : `${dateFrom} → ${dateTo}`;

  const totalVentas = rows.reduce((acc, r) => acc + (statsMap[r.vendor_id]?.salesCount ?? 0), 0);
  const totalIngresos = rows.reduce((acc, r) => acc + (statsMap[r.vendor_id]?.totalRevenue ?? 0), 0);
  const vendedoresOnMeta = rows.filter(r => {
    const s = statsMap[r.vendor_id];
    const mv = Number(r.meta_ventas) || 0;
    return mv > 0 && (s?.salesCount ?? 0) >= mv;
  }).length;

  const avatarColors = [
    'linear-gradient(135deg,#45834D,#3a6d42)',
    'linear-gradient(135deg,#3b82f6,#2563eb)',
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#dc2626)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(69,131,77,.15)', borderTop: '3px solid #45834D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#517861', fontSize: '0.82rem', fontWeight: 600 }}>Cargando metas...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#162e20', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="#45834D" /> Panel de Metas
          </div>
          <div style={{ fontSize: '0.72rem', color: '#517861', marginTop: '0.2rem' }}>
            Período activo: <strong style={{ color: '#2a4433' }}>{periodLabel}</strong>
          </div>
        </div>
        <button
          onClick={saveAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.6rem 1.4rem', borderRadius: '10px',
            fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
            border: 'none',
            background: 'linear-gradient(135deg,#45834D,#3a6d42)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(69,131,77,0.35)',
            letterSpacing: '0.02em',
          }}>
          <Save size={14} /> Guardar todo
        </button>
      </div>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { icon: <BarChart3 size={16} />, label: 'Ventas totales', value: totalVentas.toString(), color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)' },
          { icon: <DollarSign size={16} />, label: 'Ingresos período', value: `S/ ${totalIngresos.toLocaleString()}`, color: '#45834D', bg: 'rgba(69,131,77,0.08)', border: 'rgba(69,131,77,0.2)' },
          { icon: <Award size={16} />, label: 'En meta ventas', value: `${vendedoresOnMeta} / ${rows.length}`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: kpi.bg, border: `1px solid ${kpi.border}`, borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ color: kpi.color, flexShrink: 0 }}>{kpi.icon}</div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: kpi.color, lineHeight: 1.2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(69,131,77,0.05)', border: '1px solid rgba(69,131,77,0.15)', borderRadius: '10px', padding: '0.65rem 1rem', fontSize: '0.73rem', color: '#517861' }}>
        <TrendingUp size={13} color="#45834D" style={{ flexShrink: 0 }} />
        Las metas son globales por vendedor. Cambia el rango de fechas en el tab <strong style={{ marginLeft: '0.2em', color: '#2a4433' }}>Ventas</strong> para ver progreso diario, semanal o mensual.
      </div>

      {/* Cards */}
      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#517861', fontSize: '0.85rem' }}>
          No hay vendedores registrados.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {rows.map((row, idx) => {
            const stats = statsMap[row.vendor_id];
            const actualIngresos = stats?.totalRevenue ?? 0;
            const actualVentas = stats?.salesCount ?? 0;
            const metaIngresos = Number(row.meta_ingresos) || 0;
            const metaVentas = Number(row.meta_ventas) || 0;
            const pctIngresos = metaIngresos > 0 ? Math.min(Math.round((actualIngresos / metaIngresos) * 100), 100) : 0;
            const pctVentas = metaVentas > 0 ? Math.min(Math.round((actualVentas / metaVentas) * 100), 100) : 0;
            const ingresosOk = metaIngresos > 0 && actualIngresos >= metaIngresos;
            const ventasOk = metaVentas > 0 && actualVentas >= metaVentas;
            const initials = row.vendor_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
            const avatarBg = avatarColors[idx % avatarColors.length];

            const ringColorIngresos = ingresosOk ? '#45834D' : pctIngresos > 70 ? '#f59e0b' : '#3b82f6';
            const ringColorVentas = ventasOk ? '#45834D' : pctVentas > 70 ? '#f59e0b' : '#8b5cf6';

            return (
              <div key={row.vendor_id} style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Card header */}
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, #f8fdf9, #f0f9f2)',
                  borderBottom: '1px solid rgba(104,168,119,.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: avatarBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.88rem', fontWeight: 900, color: '#fff', flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#162e20', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {row.vendor_name}
                    </div>
                    {stats ? (
                      <div style={{ fontSize: '0.68rem', color: '#517861', marginTop: '0.1rem' }}>
                        {stats.salesCount} ventas · S/{stats.totalRevenue.toLocaleString()} · prom S/{stats.avgPerSale.toLocaleString()}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.68rem', color: 'rgba(81,120,97,.5)', marginTop: '0.1rem' }}>Sin ventas en el periodo</div>
                    )}
                  </div>
                  {(ingresosOk || ventasOk) && (
                    <div style={{
                      background: 'linear-gradient(135deg,#45834D,#3a6d42)',
                      borderRadius: '8px', padding: '0.25rem 0.5rem',
                      fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    }}>
                      <CheckCircle size={11} /> META
                    </div>
                  )}
                </div>

                {/* Progress rings row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {[
                    { label: 'Ingresos', actual: `S/${actualIngresos.toLocaleString()}`, meta: metaIngresos > 0 ? `S/${metaIngresos.toLocaleString()}` : '—', pct: pctIngresos, color: ringColorIngresos, ok: ingresosOk },
                    { label: 'Ventas', actual: actualVentas.toString(), meta: metaVentas > 0 ? metaVentas.toString() : '—', pct: pctVentas, color: ringColorVentas, ok: ventasOk },
                  ].map((kpi, ki) => (
                    <div key={ki} style={{
                      padding: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      borderRight: ki === 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      background: ki === 0 ? 'transparent' : 'rgba(248,250,252,0.5)',
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Ring pct={kpi.pct} color={kpi.color} size={52} />
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%,-50%)',
                          fontSize: '0.58rem', fontWeight: 900, color: kpi.color,
                          lineHeight: 1,
                        }}>
                          {kpi.pct}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#162e20', lineHeight: 1.1 }}>{kpi.actual}</div>
                        <div style={{ fontSize: '0.65rem', color: '#517861' }}>meta: {kpi.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inputs */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { field: 'meta_ingresos' as const, label: 'Meta Ingresos S/', value: row.meta_ingresos, prefix: 'S/' },
                    { field: 'meta_ventas' as const, label: 'Meta N° Ventas', value: row.meta_ventas, prefix: '#' },
                  ].map(inp => (
                    <div key={inp.field}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.3rem' }}>
                        {inp.label}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                          fontSize: '0.75rem', fontWeight: 800, color: '#517861', pointerEvents: 'none',
                        }}>
                          {inp.prefix}
                        </span>
                        <input
                          type="number" min="0" value={inp.value}
                          onChange={e => updateField(row.vendor_id, inp.field, e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%', padding: '0.5rem 0.65rem 0.5rem 1.6rem',
                            border: '1.5px solid rgba(104,168,119,.25)',
                            borderRadius: '8px', fontSize: '0.88rem',
                            color: '#162e20', background: '#f8fdf9',
                            outline: 'none', boxSizing: 'border-box', fontWeight: 800,
                            transition: 'border-color 0.15s',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#45834D'; e.currentTarget.style.background = '#fff'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(104,168,119,.25)'; e.currentTarget.style.background = '#f8fdf9'; }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(248,250,252,0.7)',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#517861' }}>
                    {row.error && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
                        <AlertCircle size={11} /> {row.error}
                      </span>
                    )}
                    {row.saved && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#45834D', fontWeight: 700 }}>
                        <CheckCircle size={11} /> Guardado correctamente
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => saveGoal(row.vendor_id)}
                    disabled={row.saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.45rem 1rem', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: 800,
                      cursor: row.saving ? 'default' : 'pointer',
                      border: 'none',
                      background: row.saving ? 'rgba(104,168,119,.15)' : 'linear-gradient(135deg,#45834D,#3a6d42)',
                      color: row.saving ? '#517861' : '#fff',
                      boxShadow: row.saving ? 'none' : '0 3px 10px rgba(69,131,77,0.3)',
                      opacity: row.saving ? 0.7 : 1,
                      transition: 'all 0.15s',
                    }}>
                    <Save size={12} /> {row.saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
