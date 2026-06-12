import { Target, LogOut, Radio, Megaphone } from 'lucide-react';

interface AppHeaderProps {
  salesCount: number;
  totalSoles: number;
  salesCountOver: number;
  totalSolesOver: number;
  salesCountBrv: number;
  totalSolesBrv: number;
  metaDiaria: number;
  userName?: string;
  onSignOut: () => void;
  brand?: 'overshark' | 'bravos';
  onChangeBrand: (b: 'overshark' | 'bravos') => void;
  saleSource: 'live' | 'publicidad';
  onChangeSaleSource: (s: 'live' | 'publicidad') => void;
}

export default function AppHeader({
  salesCount,
  totalSoles,
  salesCountOver,
  totalSolesOver,
  salesCountBrv,
  totalSolesBrv,
  metaDiaria,
  userName,
  onSignOut,
  brand = 'overshark',
  onChangeBrand,
  saleSource,
  onChangeSaleSource,
}: AppHeaderProps) {
  const pct = metaDiaria > 0 ? Math.min(100, (salesCount / metaDiaria) * 100) : 0;
  const reached = salesCount >= metaDiaria;

  const isBravos = brand === 'bravos';
  const accent = isBravos ? '#EB7347' : '#45834D';
  const accentLight = isBravos ? '#FFA85D' : '#8FCA97';
  const headerBg = isBravos ? 'linear-gradient(135deg, #ffffff, #FFF5EC)' : 'linear-gradient(135deg, #ffffff, #F2FBF5)';
  const headerBorder = isBravos ? 'rgba(235,115,71,.3)' : 'rgba(104,168,119,.38)';
  const headerShadow = isBravos ? '0 4px 24px rgba(235,115,71,.12)' : '0 4px 24px rgba(69,131,77,.1)';
  const mutedColor = isBravos ? '#b07040' : '#517861';
  const titleColor = isBravos ? '#3d1a0a' : '#162e20';

  const overColor = '#45834D';
  const bravColor = '#EB7347';

  return (
    <header style={{
      marginBottom: '1.5rem',
      padding: '1.1rem 1.5rem',
      background: headerBg,
      borderRadius: '14px',
      border: `1px solid ${headerBorder}`,
      boxShadow: headerShadow,
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

        {/* Toggle de marca unificado */}
        <div style={{
          display: 'inline-flex', alignItems: 'stretch',
          background: 'rgba(0,0,0,0.04)',
          border: `1.5px solid ${accent}33`,
          borderRadius: '16px',
          padding: '4px',
          gap: '3px',
        }}>
          {/* OVERSHARK */}
          <button
            onClick={() => onChangeBrand('overshark')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s',
              background: !isBravos ? `linear-gradient(135deg, ${overColor}22, ${overColor}0e)` : 'transparent',
              boxShadow: !isBravos ? `0 2px 8px ${overColor}25` : 'none',
            }}
          >
            <img src="/over-icon.png" alt="Overshark" style={{ width: '26px', height: '26px', objectFit: 'contain', opacity: !isBravos ? 1 : 0.3, transition: 'opacity 0.25s', borderRadius: '6px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: !isBravos ? overColor : '#9ca3af', letterSpacing: '0.05em', lineHeight: 1, transition: 'color 0.25s' }}>OVERSHARK</div>
              <div style={{ fontSize: '0.68rem', color: !isBravos ? overColor : '#9ca3af', fontWeight: 700, marginTop: '2px', opacity: !isBravos ? 0.8 : 0.5 }}>
                {salesCountOver} ventas · S/{totalSolesOver.toFixed(0)}
              </div>
            </div>
          </button>

          {/* Divisor */}
          <div style={{ width: '1px', background: `${accent}22`, margin: '4px 0' }} />

          {/* BRAVOS */}
          <button
            onClick={() => onChangeBrand('bravos')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s',
              background: isBravos ? `linear-gradient(135deg, ${bravColor}22, ${bravColor}0e)` : 'transparent',
              boxShadow: isBravos ? `0 2px 8px ${bravColor}25` : 'none',
            }}
          >
            <img src="/brav-icon.png" alt="Bravos" style={{ width: '26px', height: '26px', objectFit: 'contain', opacity: isBravos ? 1 : 0.3, transition: 'opacity 0.25s', borderRadius: '6px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: isBravos ? bravColor : '#9ca3af', letterSpacing: '0.05em', lineHeight: 1, transition: 'color 0.25s' }}>BRAVOS</div>
              <div style={{ fontSize: '0.68rem', color: isBravos ? bravColor : '#9ca3af', fontWeight: 700, marginTop: '2px', opacity: isBravos ? 0.8 : 0.5 }}>
                {salesCountBrv} ventas · S/{totalSolesBrv.toFixed(0)}
              </div>
            </div>
          </button>
        </div>

        {/* Stats + user */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ventas hoy</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: accent, lineHeight: 1 }}>{salesCount}</div>
          </div>
          <div style={{ width: '1px', height: '2.5rem', background: headerBorder }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total S/</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: titleColor, lineHeight: 1 }}>{totalSoles.toFixed(0)}</div>
          </div>
          {userName && (
            <>
              <div style={{ width: '1px', height: '2.5rem', background: headerBorder }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {userName}
                </span>
                <button
                  onClick={onSignOut}
                  title="Cerrar sesión"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <LogOut size={12} /> Salir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fila inferior: meta + live/publicidad */}
      <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Target size={14} style={{ color: mutedColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: '80px' }}>
          <div className="meta-bar-track">
            <div
              className="meta-bar-fill"
              style={{
                width: `${pct}%`,
                background: reached ? '#45834D' : `linear-gradient(90deg, ${accent}, ${accentLight})`,
              }}
            />
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: reached ? '#45834D' : mutedColor, whiteSpace: 'nowrap' }}>
          {salesCount} / {metaDiaria > 0 ? metaDiaria : '—'}
        </span>
        {metaDiaria > 0 && (
          <span style={{
            minWidth: '40px', textAlign: 'center',
            background: isBravos ? 'rgba(255,255,255,0.05)' : 'rgba(69,131,77,.06)',
            border: `1px solid ${headerBorder}`,
            borderRadius: '6px',
            color: reached ? accent : mutedColor,
            fontSize: '0.78rem', fontWeight: 800,
            padding: '0.2rem 0.4rem',
          }}>
            {metaDiaria}
          </span>
        )}

        {/* Divisor */}
        <div style={{ width: '1px', height: '1.4rem', background: headerBorder, flexShrink: 0 }} />

        {/* Switch Live / Publicidad */}
        <div style={{
          display: 'flex', background: 'rgba(0,0,0,0.04)',
          borderRadius: '8px', padding: '2px', gap: '2px',
          border: `1px solid ${saleSource === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.3)'}`,
        }}>
          <button
            onClick={() => onChangeSaleSource('live')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 800,
              borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: saleSource === 'live' ? '#16a34a' : 'transparent',
              color: saleSource === 'live' ? '#fff' : mutedColor,
            }}
          >
            <Radio size={12} /> LIVE
          </button>
          <button
            onClick={() => onChangeSaleSource('publicidad')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 800,
              borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: saleSource === 'publicidad' ? '#7C3AED' : 'transparent',
              color: saleSource === 'publicidad' ? '#fff' : mutedColor,
            }}
          >
            <Megaphone size={12} /> PUBLICIDAD
          </button>
        </div>
      </div>
    </header>
  );
}
