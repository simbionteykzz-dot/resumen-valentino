import React from 'react';
import { Gift, Flame, Users, Tag, MessageCircle, Sparkles, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface BoosterState {
  cadenitas: number;
  urgencia: boolean;
  socialProof: boolean;
  recomendacion: boolean;
  descuento: boolean;
  fraseVenta: boolean;
}

interface BoostersPanelProps {
  boosters: BoosterState;
  onChange: (field: keyof BoosterState, value: any) => void;
  productCount: number;
}

type BoosterDef = {
  key: keyof BoosterState;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
};

const BOOSTERS: BoosterDef[] = [
  { key: 'urgencia',     label: 'Urgencia',         sub: '"⚡ Últimas unidades en este precio"',          icon: <Flame size={14} />,          color: '239,68,68'    },
  { key: 'socialProof',  label: 'Prueba social',     sub: '"🔥 +500 clientes satisfechos"',                icon: <Users size={14} />,          color: '56,200,245'   },
  { key: 'recomendacion',label: 'Cross-sell',        sub: 'Recomienda otro producto relacionado',           icon: <Tag size={14} />,            color: '104,168,119'  },
  { key: 'descuento',    label: 'Próxima compra',    sub: '"🎯 Descuento especial en tu siguiente pedido"', icon: <Tag size={14} style={{ transform: 'rotate(-15deg)' }} />, color: '104,168,119' },
  { key: 'fraseVenta',   label: 'Frase del producto',sub: 'Agrega frase según lo que compra',              icon: <MessageCircle size={14} />,  color: '250,204,21'   },
];

export default function BoostersPanel({ boosters, onChange, productCount: _productCount }: BoostersPanelProps) {
  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(250,204,21,0.12)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#facc15',
          }}>
            <Sparkles size={15} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              Extras del Resumen
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 500 }}>
              Se agregan al texto de WhatsApp
            </span>
          </div>
        </div>
        <span style={{
          fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem',
          borderRadius: '20px', background: 'rgba(250,204,21,0.1)',
          border: '1px solid rgba(250,204,21,0.25)', color: '#facc15',
          letterSpacing: '0.04em',
        }}>
          {[boosters.urgencia, boosters.socialProof, boosters.recomendacion, boosters.descuento, boosters.fraseVenta].filter(Boolean).length + (boosters.cadenitas > 0 ? 1 : 0)} activos
        </span>
      </div>

      {/* Cadenitas counter — row especial */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '0.65rem',
        background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(250,204,21,0.03))',
        border: `1.5px solid rgba(250,204,21,${boosters.cadenitas > 0 ? '0.4' : '0.18'})`,
        transition: 'all 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
            background: boosters.cadenitas > 0 ? 'rgba(250,204,21,0.18)' : 'var(--surface2)',
            border: `1.5px solid rgba(250,204,21,${boosters.cadenitas > 0 ? '0.4' : '0.2'})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <Gift size={14} style={{ color: boosters.cadenitas > 0 ? '#facc15' : 'var(--muted)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              Cadenitas de regalo
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              {boosters.cadenitas === 0 ? 'Sin cadenita' : boosters.cadenitas === 1 ? '1 cadenita incluida' : `${boosters.cadenitas} cadenitas incluidas`}
            </div>
          </div>
        </div>
        <div className="qty-stepper" style={{ height: '2rem' }}>
          <button className="qty-btn" onClick={() => onChange('cadenitas', Math.max(0, boosters.cadenitas - 1))} style={{ width: '2rem', height: '2rem' }}>
            <ChevronDown size={14} />
          </button>
          <input value={boosters.cadenitas} readOnly style={{ height: '2rem', width: '2.2rem', fontSize: '0.9rem' }} />
          <button className="qty-btn" onClick={() => onChange('cadenitas', boosters.cadenitas + 1)} style={{ width: '2rem', height: '2rem' }}>
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {/* Toggle boosters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
        {BOOSTERS.map(b => {
          const active = boosters[b.key] as boolean;
          return (
            <label
              key={b.key}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.7rem 0.9rem', borderRadius: '12px', cursor: 'pointer',
                background: active
                  ? `linear-gradient(135deg, rgba(${b.color},0.1), rgba(${b.color},0.04))`
                  : 'var(--surface2)',
                border: `1.5px solid rgba(${b.color},${active ? '0.38' : '0.12'})`,
                transition: 'all 0.2s',
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={e => onChange(b.key, e.target.checked)}
                style={{ display: 'none' }}
              />

              {/* Icon box with check overlay */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: active ? `rgba(${b.color},0.18)` : 'var(--surface3)',
                  border: `1.5px solid rgba(${b.color},${active ? '0.4' : '0.15'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: active ? `rgb(${b.color})` : 'var(--muted)',
                }}>
                  {active ? <Check size={13} /> : b.icon}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.83rem', fontWeight: 700, lineHeight: 1.1,
                  color: active ? `rgb(${b.color})` : 'var(--text)',
                  transition: 'color 0.2s',
                }}>
                  {b.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.15rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.sub}
                </div>
              </div>

              {/* On/Off pill */}
              <div style={{
                flexShrink: 0, fontSize: '0.62rem', fontWeight: 800,
                padding: '0.15rem 0.45rem', borderRadius: '20px',
                background: active ? `rgba(${b.color},0.15)` : 'var(--surface3)',
                color: active ? `rgb(${b.color})` : 'var(--muted)',
                border: `1px solid rgba(${b.color},${active ? '0.3' : '0.1'})`,
                transition: 'all 0.2s', letterSpacing: '0.03em',
              }}>
                {active ? 'ON' : 'OFF'}
              </div>
            </label>
          );
        })}
      </div>

    </div>
  );
}
