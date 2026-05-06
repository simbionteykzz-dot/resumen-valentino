import React from 'react';
import { Gift, Flame, Users, Tag, MessageCircle, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

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

export default function BoostersPanel({ boosters, onChange, productCount }: BoostersPanelProps) {
  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Sparkles size={20} /> Extras del Resumen
        </h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Se agregan al texto de WhatsApp
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>

        {/* Cadenitas counter */}
        <div className="booster-card booster-active" style={{
          padding: '1rem 1.15rem',
          background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.08), rgba(250, 204, 21, 0.03))',
          border: '1.5px solid rgba(250, 204, 21, 0.25)',
          borderRadius: '12px',
          transition: 'all 0.25s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift size={16} style={{ color: '#facc15' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text2)' }}>Cadenitas de regalo</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="qty-stepper" style={{ height: '2.2rem' }}>
              <button className="qty-btn" onClick={() => onChange('cadenitas', Math.max(0, boosters.cadenitas - 1))} style={{ width: '2.2rem', height: '2.2rem' }}>
                <ChevronDown size={16} />
              </button>
              <input value={boosters.cadenitas} readOnly style={{ height: '2.2rem', width: '2.5rem', fontSize: '0.95rem' }} />
              <button className="qty-btn" onClick={() => onChange('cadenitas', boosters.cadenitas + 1)} style={{ width: '2.2rem', height: '2.2rem' }}>
                <ChevronUp size={16} />
              </button>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {boosters.cadenitas === 0 ? 'Sin cadenita' : boosters.cadenitas === 1 ? '1 cadenita' : `${boosters.cadenitas} cadenitas`}
            </span>
          </div>
        </div>

        {/* Urgencia */}
        <label className="booster-card" style={{
          padding: '1rem 1.15rem',
          background: boosters.urgencia
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.04))'
            : 'linear-gradient(135deg, rgba(242, 251, 245, 0.8), rgba(229, 244, 234, 0.6))',
          border: `1.5px solid ${boosters.urgencia ? 'rgba(239, 68, 68, 0.3)' : 'rgba(104, 168, 119, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
          textTransform: 'none' as any,
          letterSpacing: 'normal',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <input
            type="checkbox"
            checked={boosters.urgencia}
            onChange={e => onChange('urgencia', e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '8px', flexShrink: 0,
            background: boosters.urgencia ? 'rgba(239, 68, 68, 0.2)' : 'rgba(104, 168, 119, 0.06)',
            border: `1.5px solid ${boosters.urgencia ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <Flame size={14} style={{ color: boosters.urgencia ? '#ef4444' : 'var(--muted)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>Urgencia</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              "⚡ Últimas unidades en este precio"
            </div>
          </div>
        </label>

        {/* Social Proof */}
        <label className="booster-card" style={{
          padding: '1rem 1.15rem',
          background: boosters.socialProof
            ? 'linear-gradient(135deg, rgba(56, 200, 245, 0.1), rgba(56, 200, 245, 0.04))'
            : 'linear-gradient(135deg, rgba(242, 251, 245, 0.8), rgba(229, 244, 234, 0.6))',
          border: `1.5px solid ${boosters.socialProof ? 'rgba(56, 200, 245, 0.3)' : 'rgba(104, 168, 119, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
          textTransform: 'none' as any,
          letterSpacing: 'normal',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <input
            type="checkbox"
            checked={boosters.socialProof}
            onChange={e => onChange('socialProof', e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '8px', flexShrink: 0,
            background: boosters.socialProof ? 'rgba(56, 200, 245, 0.2)' : 'rgba(104, 168, 119, 0.06)',
            border: `1.5px solid ${boosters.socialProof ? 'rgba(56, 200, 245, 0.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <Users size={14} style={{ color: boosters.socialProof ? '#38c8f5' : 'var(--muted)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>Prueba social</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              "🔥 +500 clientes satisfechos"
            </div>
          </div>
        </label>

        {/* Recomendación */}
        <label className="booster-card" style={{
          padding: '1rem 1.15rem',
          background: boosters.recomendacion
            ? 'linear-gradient(135deg, rgba(69, 131, 77, 0.1), rgba(104, 168, 119, 0.04))'
            : 'linear-gradient(135deg, rgba(242, 251, 245, 0.8), rgba(229, 244, 234, 0.6))',
          border: `1.5px solid ${boosters.recomendacion ? 'rgba(104, 168, 119, 0.4)' : 'rgba(104, 168, 119, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
          textTransform: 'none' as any,
          letterSpacing: 'normal',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <input
            type="checkbox"
            checked={boosters.recomendacion}
            onChange={e => onChange('recomendacion', e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '8px', flexShrink: 0,
            background: boosters.recomendacion ? 'rgba(69, 131, 77, 0.15)' : 'rgba(104, 168, 119, 0.06)',
            border: `1.5px solid ${boosters.recomendacion ? 'rgba(104, 168, 119, 0.45)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <Tag size={14} style={{ color: boosters.recomendacion ? '#45834D' : 'var(--muted)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>Cross-sell</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              Recomienda otro producto relacionado
            </div>
          </div>
        </label>

        {/* Descuento próxima compra */}
        <label className="booster-card" style={{
          padding: '1rem 1.15rem',
          background: boosters.descuento
            ? 'linear-gradient(135deg, rgba(69, 131, 77, 0.1), rgba(104, 168, 119, 0.04))'
            : 'linear-gradient(135deg, rgba(242, 251, 245, 0.8), rgba(229, 244, 234, 0.6))',
          border: `1.5px solid ${boosters.descuento ? 'rgba(104, 168, 119, 0.4)' : 'rgba(104, 168, 119, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
          textTransform: 'none' as any,
          letterSpacing: 'normal',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <input
            type="checkbox"
            checked={boosters.descuento}
            onChange={e => onChange('descuento', e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '8px', flexShrink: 0,
            background: boosters.descuento ? 'rgba(69, 131, 77, 0.15)' : 'rgba(104, 168, 119, 0.06)',
            border: `1.5px solid ${boosters.descuento ? 'rgba(104, 168, 119, 0.45)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <Tag size={14} style={{ color: boosters.descuento ? '#45834D' : 'var(--muted)', transform: 'rotate(-15deg)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>Próxima compra</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              "🎯 Descuento especial en tu siguiente pedido"
            </div>
          </div>
        </label>

        {/* Frase de venta */}
        <label className="booster-card" style={{
          padding: '1rem 1.15rem',
          background: boosters.fraseVenta
            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.04))'
            : 'linear-gradient(135deg, rgba(242, 251, 245, 0.8), rgba(229, 244, 234, 0.6))',
          border: `1.5px solid ${boosters.fraseVenta ? 'rgba(250, 204, 21, 0.3)' : 'rgba(104, 168, 119, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
          textTransform: 'none' as any,
          letterSpacing: 'normal',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <input
            type="checkbox"
            checked={boosters.fraseVenta}
            onChange={e => onChange('fraseVenta', e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '8px', flexShrink: 0,
            background: boosters.fraseVenta ? 'rgba(250, 204, 21, 0.2)' : 'rgba(104, 168, 119, 0.06)',
            border: `1.5px solid ${boosters.fraseVenta ? 'rgba(250, 204, 21, 0.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <MessageCircle size={14} style={{ color: boosters.fraseVenta ? '#facc15' : 'var(--muted)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text2)' }}>Frase del producto</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, marginTop: '0.1rem' }}>
              Agrega frase según lo que compra
            </div>
          </div>
        </label>

      </div>
    </div>
  );
}
