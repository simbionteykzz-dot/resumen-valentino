import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Package, DollarSign, ShoppingBag, Bike, MapPin, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

interface DayKPI {
  fecha: string;
  label: string;
  diaSemana: string;
  ventas: number;
  prendas: number;
  recaudado: number;   // separos + pagos completos (ya cobrado)
  porCobrar: number;   // saldo pendiente
  totalBruto: number;  // valor total de pedidos
  lima: number;
  provincia: number;
  isToday: boolean;
  isWeekend: boolean;
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getLast7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

function getWeekDays(offsetWeeks: number) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Dom
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1 + offsetWeeks * 7);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(formatDate(d));
  }
  return days;
}

function solesStr(n: number) {
  if (n === 0) return 'S/ 0';
  return n % 1 === 0 ? `S/ ${Math.round(n)}` : `S/ ${n.toFixed(0)}`;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div style={{ height: '4px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.5s' }} />
    </div>
  );
}

function KPIBadge({ icon, label, value, sub, color, barPct }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string; barPct?: number;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '2px',
      padding: '0.55rem 0.7rem', borderRadius: '10px',
      background: `rgba(${color},0.07)`, border: `1px solid rgba(${color},0.18)`,
      flex: 1, minWidth: '80px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: `rgb(${color})` }}>
        <span style={{ opacity: 0.85 }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: `rgb(${color})`, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 500 }}>{sub}</div>}
      {barPct !== undefined && (
        <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)', marginTop: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${barPct}%`, background: `rgb(${color})`, borderRadius: '3px', transition: 'width 0.5s' }} />
        </div>
      )}
    </div>
  );
}

export default function KPIHistorialPanel({ userId }: { userId?: string }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<DayKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'semana' | 'ultimos7'>('semana');

  const todayStr = formatDate(new Date());

  const fetchWeekData = async (dates: string[]) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('ventas')
        .select('fecha,separo,resta,pago_completo_txt,qty_n,total_total,lima_mark,prov_mark,anulado')
        .eq('user_id', userId)
        .in('fecha', dates)
        .neq('anulado', true);

      if (error) throw error;

      const kpis: DayKPI[] = dates.map(fecha => {
        const ventas = (rows ?? []).filter(r => r.fecha === fecha);
        const d = new Date(fecha + 'T12:00:00');
        const diaIdx = d.getDay();

        const totalSeparos = ventas.reduce((a, r) => a + (parseFloat(r.separo) || 0), 0);
        const totalPagoCompleto = ventas.reduce((a, r) => a + (parseFloat(r.pago_completo_txt) || 0), 0);
        const porCobrar = ventas.reduce((a, r) => a + (parseFloat(r.resta) || 0), 0);
        const totalBruto = ventas.reduce((a, r) => a + (Number(r.total_total) || 0), 0);
        const prendas = ventas.reduce((a, r) => a + (Number(r.qty_n) || 0), 0);
        const lima = ventas.filter(r => r.lima_mark).length;
        const provincia = ventas.filter(r => r.prov_mark).length;

        return {
          fecha,
          label: `${d.getDate()} ${MESES[d.getMonth()]}`,
          diaSemana: DIAS[diaIdx],
          ventas: ventas.length,
          prendas,
          recaudado: totalSeparos + totalPagoCompleto,
          porCobrar,
          totalBruto,
          lima,
          provincia,
          isToday: fecha === todayStr,
          isWeekend: diaIdx === 0 || diaIdx === 6,
        };
      });

      setData(kpis);
    } catch (err) {
      console.error('KPIHistorial error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dates = viewMode === 'ultimos7' ? getLast7Days() : getWeekDays(weekOffset);
    fetchWeekData(dates);
  }, [userId, weekOffset, viewMode]);

  const maxVentas = Math.max(...data.map(d => d.ventas), 1);
  const maxRecaudado = Math.max(...data.map(d => d.recaudado), 1);
  const maxPrendas = Math.max(...data.map(d => d.prendas), 1);

  const totalSemana = data.reduce((a, d) => ({
    ventas: a.ventas + d.ventas,
    recaudado: a.recaudado + d.recaudado,
    porCobrar: a.porCobrar + d.porCobrar,
    totalBruto: a.totalBruto + d.totalBruto,
    prendas: a.prendas + d.prendas,
  }), { ventas: 0, recaudado: 0, porCobrar: 0, totalBruto: 0, prendas: 0 });

  const weekLabel = weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : `Hace ${Math.abs(weekOffset)} semanas`;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgb(18,40,28), rgb(28,58,40))',
        borderRadius: '14px', padding: '1.1rem 1.3rem',
        marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(69,131,77,0.12)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(69,131,77,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(140,220,160)' }}>
            <BarChart3 size={17} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#fff' }}>KPI por Día</h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Indicadores diarios de ventas</p>
          </div>
        </div>

        {/* Resumen semana */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Ventas', value: String(totalSemana.ventas), color: '69,131,77' },
            { label: 'Ya Cobrado', value: solesStr(totalSemana.recaudado), color: '40,160,80' },
            { label: 'Por Cobrar', value: solesStr(totalSemana.porCobrar), color: '180,120,10' },
            { label: 'Prendas', value: String(totalSemana.prendas), color: '30,111,160' },
          ].map(m => (
            <div key={m.label} style={{
              background: `rgba(${m.color},0.18)`, border: `1px solid rgba(${m.color},0.3)`,
              borderRadius: '10px', padding: '0.4rem 0.75rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: `rgba(${m.color},0.85)` }}>{m.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--surface2)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
          {(['semana', 'ultimos7'] as const).map(m => (
            <button key={m} onClick={() => { setViewMode(m); setWeekOffset(0); }} style={{
              padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 800, border: 'none', borderRadius: '6px', cursor: 'pointer',
              background: viewMode === m ? 'var(--accent)' : 'transparent',
              color: viewMode === m ? '#fff' : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
              {m === 'semana' ? 'Por semana' : 'Últimos 7 días'}
            </button>
          ))}
        </div>

        {/* Week navigator (only in semana mode) */}
        {viewMode === 'semana' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{
              width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ChevronLeft size={15} /></button>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', padding: '0 0.4rem' }}>{weekLabel}</span>
            <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))} disabled={weekOffset === 0} style={{
              width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)',
              background: weekOffset === 0 ? 'transparent' : 'var(--surface2)', color: weekOffset === 0 ? 'var(--border)' : 'var(--muted)',
              cursor: weekOffset === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ChevronRight size={15} /></button>
          </div>
        )}
      </div>

      {/* ── Cards por día ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.85rem' }}>⏳ Cargando KPIs...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {data.map(day => (
            <div key={day.fecha} style={{
              borderRadius: '14px',
              border: day.isToday
                ? '2px solid rgba(69,131,77,0.6)'
                : day.isWeekend
                ? '1px solid rgba(139,92,246,0.2)'
                : '1px solid var(--border)',
              background: day.isToday
                ? 'linear-gradient(135deg, rgba(69,131,77,0.07), rgba(69,131,77,0.02))'
                : day.isWeekend
                ? 'rgba(139,92,246,0.03)'
                : 'var(--surface2)',
              padding: '0.9rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* top accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0',
                background: day.isToday
                  ? 'linear-gradient(90deg, rgb(69,131,77), rgba(69,131,77,0.3))'
                  : day.ventas === 0
                  ? 'rgba(100,100,100,0.2)'
                  : 'linear-gradient(90deg, rgba(69,131,77,0.5), rgba(30,111,160,0.3))',
              }} />

              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', marginTop: '0.1rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{day.diaSemana}</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{day.label}</div>
                </div>
                {day.isToday && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '20px',
                    background: 'rgba(69,131,77,0.15)', border: '1px solid rgba(69,131,77,0.35)', color: 'rgb(69,131,77)',
                  }}>HOY</span>
                )}
                {day.ventas === 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>Sin ventas</span>
                )}
              </div>

              {/* KPIs grid */}
              {day.ventas > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <KPIBadge icon={<ShoppingBag size={11} />} label="Ventas" value={String(day.ventas)}
                      color="69,131,77" barPct={Math.round((day.ventas / maxVentas) * 100)} />
                    <KPIBadge icon={<Package size={11} />} label="Prendas" value={String(day.prendas)}
                      color="30,111,160" barPct={Math.round((day.prendas / maxPrendas) * 100)} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <KPIBadge icon={<DollarSign size={11} />} label="Ya Cobrado" value={solesStr(day.recaudado)}
                      color="40,160,80" barPct={Math.round((day.recaudado / maxRecaudado) * 100)} />
                    <KPIBadge icon={<TrendingUp size={11} />} label="Por Cobrar" value={solesStr(day.porCobrar)}
                      color="180,120,10" />
                  </div>
                  {(day.lima > 0 || day.provincia > 0) && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {day.lima > 0 && (
                        <KPIBadge icon={<Bike size={11} />} label="Lima" value={String(day.lima)} color="30,111,160" />
                      )}
                      {day.provincia > 0 && (
                        <KPIBadge icon={<MapPin size={11} />} label="Prov" value={String(day.provincia)} color="160,120,10" />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '1rem 0', color: 'var(--border)',
                  fontSize: '1.5rem',
                }}>—</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
