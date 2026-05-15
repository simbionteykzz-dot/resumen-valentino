import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import type { ATCTicket } from '../../../../lib/supabase';
import { ATC_PALETTE } from '../theme';

interface ATCMetricsPageProps {
  tickets: ATCTicket[];
  estados: readonly ATCTicket['estado'][];
  estadoColor: Record<string, string>;
  motivos: string[];
  responsables: string[];
  diasAbierto: (createdAt?: string) => number;
}

function getLast6Months(): { value: string; label: string }[] {
  const out = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

export default function ATCMetricsPage({ tickets, estados, estadoColor, motivos, responsables, diasAbierto }: ATCMetricsPageProps) {
  const months = getLast6Months();
  const [month, setMonth] = useState(months[0].value);
  const filtered = tickets.filter(t => (t.created_at ?? '').startsWith(month));

  const byEstado = estados.reduce((acc, e) => ({ ...acc, [e]: filtered.filter(t => t.estado === e).length }), {} as Record<string, number>);

  const byEmpresa = [
    { label: 'OVERSHARK', color: '#1a7fbd', count: filtered.filter(t => t.empresa === 'OVERSHARK').length },
    { label: 'BRAVOS', color: '#EB7347', count: filtered.filter(t => t.empresa === 'BRAVOS').length },
    { label: 'OVERGIRLS', color: '#d946ef', count: filtered.filter(t => t.empresa === 'OVERGIRLS').length },
    { label: 'Sin marca', color: '#94a3b8', count: filtered.filter(t => !t.empresa).length },
  ].filter(x => x.count > 0);

  const byResponsable = responsables.map(r => ({ label: r, count: filtered.filter(t => t.responsable === r).length }))
    .filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const topMotivos = motivos.map(m => ({ label: m, count: filtered.filter(t => t.asunto === m).length }))
    .filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxMotivo = topMotivos[0]?.count ?? 1;

  const montoTotal = filtered.reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
  const activos = filtered.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso');
  const tiempoGrupos = [
    { label: 'Hoy', color: '#45834D', count: activos.filter(t => diasAbierto(t.created_at) === 0).length },
    { label: '1-3 días', color: '#f59e0b', count: activos.filter(t => { const d = diasAbierto(t.created_at); return d >= 1 && d <= 3; }).length },
    { label: '4-7 días', color: '#f97316', count: activos.filter(t => { const d = diasAbierto(t.created_at); return d >= 4 && d <= 7; }).length },
    { label: '+7 días', color: '#ef4444', count: activos.filter(t => diasAbierto(t.created_at) > 7).length },
  ];

  const secStyle: React.CSSProperties = { background: 'rgba(242,251,245,.9)', borderRadius: '12px', padding: '0.9rem 1rem', border: 'none' };
  const secTitle: React.CSSProperties = { fontSize: '0.62rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' };

  return (
    <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '14px', padding: '0.8rem 1rem', boxShadow: '0 2px 12px rgba(69,131,77,.08)' }}>
      <div style={{ padding: '0.35rem 0 0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <BarChart2 size={16} color="#45834D" />
          <span style={{ fontSize: '0.92rem', fontWeight: 900, color: ATC_PALETTE.text2 }}>Métricas ATC</span>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(104,168,119,.28)', fontSize: '0.78rem', color: ATC_PALETTE.text2, background: '#fff', cursor: 'pointer' }}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div style={{ padding: '1.1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem' }}>
          {[
            { label: 'Total', val: filtered.length, color: '#1a7fbd' },
            { label: 'Abiertos', val: byEstado.abierto ?? 0, color: estadoColor.abierto },
            { label: 'En proceso', val: byEstado.en_proceso ?? 0, color: estadoColor.en_proceso },
            { label: 'Resueltos', val: byEstado.resuelto ?? 0, color: estadoColor.resuelto },
            { label: 'Cerrados', val: byEstado.cerrado ?? 0, color: estadoColor.cerrado },
          ].map(k => (
            <div key={k.label} style={{ background: `${k.color}12`, border: `1px solid ${k.color}35`, borderRadius: '10px', padding: '0.75rem 0.4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: '0.57rem', fontWeight: 700, color: '#517861', marginTop: '0.15rem' }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
          <div style={secStyle}>
            <div style={secTitle}>Por Empresa</div>
            {byEmpresa.length === 0
              ? <div style={{ fontSize: '0.75rem', color: '#517861' }}>Sin datos</div>
              : byEmpresa.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: ATC_PALETTE.text2 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: item.color }}>{item.count}</span>
                </div>
              ))}
          </div>

          <div style={secStyle}>
            <div style={secTitle}>Por Responsable</div>
            {byResponsable.length === 0
              ? <div style={{ fontSize: '0.75rem', color: '#517861' }}>Sin datos</div>
              : byResponsable.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ATC_PALETTE.text2 }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: ATC_PALETTE.accent }}>{item.count}</span>
                </div>
              ))}
          </div>
        </div>

        {topMotivos.length > 0 && (
          <div style={secStyle}>
            <div style={secTitle}>Top Motivos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {topMotivos.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: ATC_PALETTE.text2, width: '170px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                  <div style={{ flex: 1, minWidth: '120px', height: '11px', background: 'rgba(69,131,77,.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(item.count / maxMotivo) * 100}%`, background: 'linear-gradient(90deg,#1a7fbd,#38c8f5)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: ATC_PALETTE.accent, width: '22px', textAlign: 'right', flexShrink: 0 }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={secStyle}>
          <div style={secTitle}>Tickets activos por antigüedad</div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {tiempoGrupos.map(g => (
              <div key={g.label} style={{ background: `${g.color}10`, border: `1px solid ${g.color}30`, borderRadius: '8px', padding: '0.55rem 1rem', textAlign: 'center', minWidth: '72px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: g.color }}>{g.count}</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: ATC_PALETTE.muted, marginTop: '0.1rem' }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>

        {montoTotal > 0 && (
          <div style={{ background: 'transparent', borderRadius: 0, padding: '0.85rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Monto total involucrado</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#45834D' }}>S/ {montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
