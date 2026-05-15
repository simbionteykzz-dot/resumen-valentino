import React, { useMemo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export default function RankingPanel({ sales }: { sales: any[] }) {
  const ranking = useMemo(() => {
    const m: Record<string, { ventas: number; prendas: number; ingresos: number }> = {};
    sales.forEach(s => {
      const k = (s.combo || '—').substring(0, 35);
      if (!m[k]) m[k] = { ventas: 0, prendas: 0, ingresos: 0 };
      m[k].ventas++; m[k].prendas += (s.qtyN || 0); m[k].ingresos += (Number(s.totalTotal) || 0);
    });
    return Object.entries(m).sort((a, b) => b[1].prendas - a[1].prendas).slice(0, 6);
  }, [sales]);

  if (sales.length === 0) return null;
  const max = ranking[0]?.[1].prendas || 1;
  const rankIcon = (index: number) => {
    if (index === 0) return <Medal size={16} color="#f59e0b" />;
    if (index === 1) return <Medal size={16} color="#94a3b8" />;
    if (index === 2) return <Award size={16} color="#b45309" />;
    return <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)' }}>#{index + 1}</span>;
  };

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Trophy size={20} /> Ranking de Productos</h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sales.length} venta{sales.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ranking.map(([name, d], i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: i === 0 ? 'linear-gradient(135deg,rgba(250,204,21,.08),rgba(250,204,21,.02))' : 'rgba(242,251,245,.7)', border: `1px solid ${i === 0 ? 'rgba(250,204,21,.25)' : 'rgba(104,168,119,.3)'}`, borderRadius: '10px' }}>
            <span style={{ width: '1.5rem', textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{rankIcon(i)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{d.ventas}v</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>{d.prendas}p</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#45834D' }}>S/{d.ingresos}</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(104,168,119,.2)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(8, d.prendas / max * 100)}%`, height: '100%', borderRadius: '2px', background: i === 0 ? 'linear-gradient(90deg,#facc15,#45834D)' : 'linear-gradient(90deg,rgba(104,168,119,.5),rgba(143,202,151,.4))', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
