import React from 'react';
import { CreditCard, Truck, Zap, DollarSign } from 'lucide-react';

const METODOS = [
  { value: 'contra',   label: 'Contra entrega', icon: <Truck size={13} />, color: '56,200,245' },
  { value: 'completo', label: 'Pago completo',  icon: <Zap size={13} />,   color: '34,197,94'  },
];

export default function CuentaPanel({ data, onChange, totalPagar }: {
  data: any;
  onChange: (field: string, value: string) => void;
  totalPagar?: number;
}) {
  const total = typeof totalPagar === 'number' ? totalPagar : 0;

  return (
    <div className="panel always" id="panel-cuenta" style={{ marginTop: '1.25rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#60a5fa',
          }}>
            <CreditCard size={15} />
          </div>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>
            Cuenta
          </h2>
        </div>

        {/* Total pagar badge */}
        {total > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.75rem', borderRadius: '20px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          }}>
            <DollarSign size={12} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#22c55e' }}>
              S/ {total % 1 === 0 ? total : total.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 500 }}>total</span>
          </div>
        )}
      </div>

      {/* Selector método de pago */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.55rem' }}>
          Método de pago
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {METODOS.map(m => {
            const active = data.tipo === m.value;
            return (
              <label
                key={m.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.65rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                  background: active
                    ? `linear-gradient(135deg, rgba(${m.color},0.12), rgba(${m.color},0.05))`
                    : 'var(--surface2)',
                  border: `1.5px solid rgba(${m.color},${active ? '0.45' : '0.12'})`,
                  transition: 'all 0.18s', margin: 0,
                }}
              >
                <input
                  type="radio"
                  name="cuenta-tipo"
                  value={m.value}
                  checked={active}
                  onChange={e => onChange('tipo', e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `rgba(${m.color},0.2)` : 'var(--surface3)',
                  border: `1px solid rgba(${m.color},${active ? '0.4' : '0.15'})`,
                  color: active ? `rgb(${m.color})` : 'var(--muted)',
                  transition: 'all 0.18s',
                }}>
                  {m.icon}
                </div>
                <span style={{
                  fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                  color: active ? `rgb(${m.color})` : 'var(--text)',
                  transition: 'all 0.18s', flex: 1,
                }}>
                  {m.label}
                </span>
                {active && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: `rgb(${m.color})`,
                    boxShadow: `0 0 6px rgba(${m.color},0.5)`,
                  }} />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Campos numéricos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

        {/* Cuánto pagó */}
        <div style={{
          padding: '0.8rem 0.9rem', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(56,200,245,0.07), rgba(56,200,245,0.02))',
          border: '1.5px solid rgba(56,200,245,0.2)',
        }}>
          <div style={{ fontSize: '0.67rem', fontWeight: 800, color: '#38c8f5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem' }}>
            Cuánto pagó
          </div>
          <input
            value={data.pago}
            onChange={e => onChange('pago', e.target.value)}
            placeholder="Ej. 30"
            className="form-input"
            style={{ marginBottom: 0, fontSize: '0.88rem' }}
          />
        </div>

        {/* Cuánto debe */}
        <div style={{
          padding: '0.8rem 0.9rem', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(245,166,35,0.07), rgba(245,166,35,0.02))',
          border: '1.5px solid rgba(245,166,35,0.2)',
        }}>
          <div style={{ fontSize: '0.67rem', fontWeight: 800, color: '#f5a623', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem' }}>
            Cuánto debe
          </div>
          <input
            value={data.debe}
            onChange={e => onChange('debe', e.target.value)}
            placeholder="Ej. 120"
            className="form-input"
            style={{ marginBottom: 0, fontSize: '0.88rem' }}
          />
        </div>

      </div>
    </div>
  );
}
