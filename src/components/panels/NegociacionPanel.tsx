import React, { useMemo } from 'react';
import { Calculator, TrendingDown, ArrowRight } from 'lucide-react';
import { POL_PRECIOS_OVERSHARK, POL_VARIANTES_OVERSHARK } from '../../lib/data';

const ESCALAS = [
  { qty: 3, price: 50, label: "3 × S/50", perUnit: +(50/3).toFixed(1) },
  { qty: 5, price: 99, label: "5 × S/99", perUnit: +(99/5).toFixed(1) },
  { qty: 6, price: 99, label: "6 × S/99", perUnit: +(99/6).toFixed(1) },
  { qty: 7, price: 99, label: "7 × S/99", perUnit: +(99/7).toFixed(1) },
  { qty: 10, price: 99, label: "10 × S/99", perUnit: +(99/10).toFixed(1) },
];

export default function NegociacionPanel({ products }: { products: any[] }) {
  const stats = useMemo(() => {
    let totalQty = 0;
    let totalPrice = 0;
    products.forEach(p => {
      const qty = p.colorLines?.length > 0
        ? p.colorLines.reduce((s: number, cl: any) => s + cl.qty, 0)
        : p.qty;
      totalQty += qty;
      if (p.promoPricePerUnit != null) {
        totalPrice += p.promoPricePerUnit * qty;
      } else {
        const tl = p.name.trim().toLowerCase();
        const canon = Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl);
        const unit = canon ? (POL_PRECIOS_OVERSHARK[canon] || 0) : 0;
        totalPrice += unit * qty;
      }
    });
    const perUnit = totalQty > 0 ? Math.round(totalPrice / totalQty * 10) / 10 : 0;
    return { totalQty, totalPrice: Math.round(totalPrice * 100) / 100, perUnit };
  }, [products]);

  const mejoresOpciones = useMemo(() => {
    if (stats.totalQty === 0) return [];
    return ESCALAS
      .filter(e => e.qty > stats.totalQty)
      .map(e => ({
        ...e,
        add: e.qty - stats.totalQty,
        savings: (stats.perUnit - e.perUnit) > 0 ? Math.round((stats.perUnit - e.perUnit) * e.qty) : 0,
      }))
      .filter(e => e.perUnit < stats.perUnit)
      .slice(0, 3);
  }, [stats]);

  if (products.length === 0) return null;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Calculator size={20} /> Calculadora de Negociación
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(69,131,77,0.08)', border: '1px solid rgba(104,168,119,0.3)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prendas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{stats.totalQty}</div>
        </div>
        <div style={{ background: 'rgba(56,200,245,0.08)', border: '1px solid rgba(56,200,245,0.2)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--info)' }}>S/{stats.totalPrice}</div>
        </div>
        <div style={{ background: 'rgba(69,131,77,0.08)', border: '1px solid rgba(104,168,119,0.25)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>C/U</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>S/{stats.perUnit}</div>
        </div>
      </div>

      {mejoresOpciones.length > 0 && (
        <>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={13} /> Si agrega más prendas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mejoresOpciones.map((op, i) => (
              <div key={i} className="frase-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, rgba(69,131,77,0.06), rgba(104,168,119,0.02))', border: '1px solid rgba(104,168,119,0.2)', borderRadius: '10px' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', flexShrink: 0, background: 'rgba(69,131,77,0.15)', border: '1px solid rgba(104,168,119,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 900, color: '#45834D' }}>+{op.add}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text2)' }}>
                    {op.label} <span style={{ color: '#45834D', fontSize: '0.82rem' }}>→ S/{op.perUnit} c/u</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Agrega {op.add} prenda{op.add > 1 ? 's' : ''} más y ahorra S/{op.savings} en total
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'rgba(69,131,77,0.5)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(242,251,245,0.8)', border: '1px solid rgba(104,168,119,0.3)', borderRadius: '10px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Escala de precios</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {ESCALAS.map((e, i) => (
            <span key={i} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '50px', background: stats.totalQty >= e.qty ? 'rgba(69,131,77,0.15)' : 'rgba(104,168,119,0.08)', border: `1px solid ${stats.totalQty >= e.qty ? 'rgba(104,168,119,0.4)' : 'rgba(104,168,119,0.2)'}`, color: stats.totalQty >= e.qty ? '#45834D' : 'var(--muted)' }}>
              {e.label} = S/{e.perUnit}/u
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
