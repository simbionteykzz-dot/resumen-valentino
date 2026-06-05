import React, { useState } from 'react';
import { FileBarChart2, DollarSign, Banknote, Smartphone, ArrowLeftRight, TrendingUp, ShoppingBag, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { Sale } from '../../types';

function Row({ label, value, sub, color = '69,131,77' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.6rem 0.8rem', borderRadius: '10px',
      background: `rgba(${color},0.05)`, border: `1px solid rgba(${color},0.15)`,
    }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: `rgb(${color})` }}>{value}</span>
        {sub && <div style={{ fontSize: '0.67rem', color: 'var(--muted)', marginTop: '1px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '1.1rem 0 0.65rem' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
        background: 'rgba(69,131,77,0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

export default function ReporteDiarioPanel({ sales }: { sales: Sale[] }) {
  const [open, setOpen] = useState(false);

  if (sales.length === 0) return null;

  // ── Métodos de pago ───────────────────────────────────────────────────────
  const metodos: Record<string, { count: number; total: number }> = {};
  for (const s of sales) {
    const mp = (s.metodoPago || 'Sin especificar').trim();
    if (!metodos[mp]) metodos[mp] = { count: 0, total: 0 };
    metodos[mp].count++;
    metodos[mp].total += Number(s.totalTotal) || 0;
  }

  // Categorías conocidas para colores
  const colorMap: Record<string, string> = {
    'Efectivo': '22,163,74',
    'Yape': '124,58,237',
    'Transferencia': '30,111,160',
    'Tarjeta': '234,88,12',
  };

  const metodoEntries = Object.entries(metodos).sort((a, b) => b[1].total - a[1].total);

  // ── Productos más vendidos ────────────────────────────────────────────────
  const prodCount: Record<string, number> = {};
  for (const s of sales) {
    const combo = (s.combo || '').trim();
    if (!combo) continue;
    const parts = combo.split('+').map(p => p.trim()).filter(Boolean);
    for (const p of parts) {
      prodCount[p] = (prodCount[p] || 0) + 1;
    }
  }
  const topProductos = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // ── Totales ───────────────────────────────────────────────────────────────
  const totalRecaudado = sales.reduce((acc, s) => {
    return acc + (parseFloat(s.separo) || 0) + (parseFloat(s.pagoCompletoTxt) || 0);
  }, 0);
  const totalBruto = sales.reduce((acc, s) => acc + (Number(s.totalTotal) || 0), 0);
  const totalPrendas = sales.reduce((acc, s) => acc + (Number(s.qtyN) || 0), 0);
  const ticketPromedio = sales.length > 0 ? totalBruto / sales.length : 0;

  const S = (n: number) => n % 1 === 0 ? `S/ ${Math.round(n)}` : `S/ ${n.toFixed(2)}`;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      {/* Header colapsable */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem' }}>
          <FileBarChart2 size={18} />
          Reporte Diario
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            background: 'rgba(69,131,77,0.15)', color: 'var(--accent)',
            border: '1px solid rgba(69,131,77,0.3)',
            borderRadius: '20px', padding: '0.15rem 0.55rem',
          }}>
            {sales.length} ventas · {S(totalRecaudado)} recaudado
          </span>
        </h2>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {open && (
        <div style={{ marginTop: '1rem' }}>

          {/* ── Resumen rápido ─────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            {[
              { label: 'Total Bruto', value: S(totalBruto), icon: <DollarSign size={13} />, c: '69,131,77' },
              { label: 'Recaudado', value: S(totalRecaudado), icon: <Banknote size={13} />, c: '22,163,74' },
              { label: 'Prendas', value: String(totalPrendas), icon: <ShoppingBag size={13} />, c: '30,111,160' },
              { label: 'Ticket prom.', value: S(ticketPromedio), icon: <TrendingUp size={13} />, c: '124,58,237' },
            ].map(({ label, value, icon, c }) => (
              <div key={label} style={{
                background: `rgba(${c},0.06)`, border: `1px solid rgba(${c},0.2)`,
                borderRadius: '12px', padding: '0.85rem 0.9rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, rgb(${c}), rgba(${c},0.3))`,
                  borderRadius: '12px 12px 0 0',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: `rgb(${c})` }}>
                  {icon}
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: `rgb(${c})`, letterSpacing: '-0.03em' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* ── Métodos de pago ────────────────────────────────────────── */}
          <SectionTitle icon={<Smartphone size={13} />} title="Por método de pago" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {metodoEntries.map(([mp, { count, total }]) => {
              const c = colorMap[mp] || '100,110,140';
              const pct = totalBruto > 0 ? Math.round((total / totalBruto) * 100) : 0;
              return (
                <div key={mp} style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.55rem 0.8rem', borderRadius: '10px',
                  background: `rgba(${c},0.05)`, border: `1px solid rgba(${c},0.18)`,
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: `rgb(${c})`,
                  }} />
                  <span style={{ flex: 1, fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)' }}>{mp}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{count} venta{count !== 1 ? 's' : ''}</span>
                  <div style={{
                    width: '80px', height: '5px', borderRadius: '3px',
                    background: 'var(--surface2)', overflow: 'hidden',
                  }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `rgb(${c})`, borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: `rgb(${c})`, minWidth: '60px', textAlign: 'right' }}>
                    {S(total)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Productos más vendidos ─────────────────────────────────── */}
          {topProductos.length > 0 && (
            <>
              <SectionTitle icon={<ShoppingBag size={13} />} title="Combos / productos más vendidos" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {topProductos.map(([prod, cnt], i) => {
                  const pct = Math.round((cnt / sales.length) * 100);
                  const colors = ['69,131,77', '30,111,160', '124,58,237', '234,88,12', '22,163,74', '100,110,140'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={prod} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.5rem 0.75rem', borderRadius: '9px',
                      background: `rgba(${c},0.05)`, border: `1px solid rgba(${c},0.15)`,
                    }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                        background: `rgba(${c},0.15)`, color: `rgb(${c})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 900,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{prod}</span>
                      <div style={{
                        width: '60px', height: '4px', borderRadius: '2px',
                        background: 'var(--surface2)', overflow: 'hidden',
                      }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: `rgb(${c})`, borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: `rgb(${c})`, minWidth: '28px', textAlign: 'right' }}>
                        ×{cnt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Desglose Efectivo / Yape / Transferencia ───────────────── */}
          <SectionTitle icon={<ArrowLeftRight size={13} />} title="Resumen de cobros" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {[
              { key: 'Efectivo', label: 'Efectivo', icon: <Banknote size={12} />, c: '22,163,74' },
              { key: 'Yape', label: 'Yape', icon: <Smartphone size={12} />, c: '124,58,237' },
              { key: 'Transferencia', label: 'Transferencia', icon: <ArrowLeftRight size={12} />, c: '30,111,160' },
            ].map(({ key, label, icon, c }) => {
              const d = metodos[key];
              return (
                <div key={key} style={{
                  padding: '0.75rem 0.9rem', borderRadius: '10px',
                  background: `rgba(${c},0.06)`, border: `1px solid rgba(${c},0.2)`,
                  display: 'flex', flexDirection: 'column', gap: '0.3rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: `rgb(${c})` }}>
                    {icon}
                    <span style={{ fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: `rgb(${c})` }}>
                    {d ? S(d.total) : 'S/ 0'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                    {d ? `${d.count} venta${d.count !== 1 ? 's' : ''}` : '0 ventas'}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
