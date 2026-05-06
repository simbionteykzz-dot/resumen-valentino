import { Target, LogOut } from 'lucide-react';

interface AppHeaderProps {
  salesCount: number;
  totalSoles: number;
  metaDiaria: number;
  onMetaChange: (v: number) => void;
  userName?: string;
  onSignOut: () => void;
  brand?: 'overshark' | 'bravos';
}

export default function AppHeader({
  salesCount,
  totalSoles,
  metaDiaria,
  onMetaChange,
  userName,
  onSignOut,
  brand = 'overshark',
}: AppHeaderProps) {
  const pct = metaDiaria > 0 ? Math.min(100, (salesCount / metaDiaria) * 100) : 0;
  const reached = salesCount >= metaDiaria;

  const isBravos = brand === 'bravos';
  const accent = isBravos ? '#7c3aed' : '#45834D';
  const accentLight = isBravos ? '#9f6ef5' : '#8FCA97';
  const headerBg = isBravos ? 'linear-gradient(135deg, #0d0a14, #130d1e)' : 'linear-gradient(135deg, #ffffff, #F2FBF5)';
  const headerBorder = isBravos ? '#1e1430' : 'rgba(104,168,119,.38)';
  const headerShadow = isBravos ? '0 4px 24px rgba(124,58,237,0.1)' : '0 4px 24px rgba(69,131,77,.1)';
  const mutedColor = isBravos ? '#8070a0' : '#517861';
  const titleColor = isBravos ? '#fff' : '#162e20';
  const brandName = isBravos ? 'BRAVOS' : 'OVERSHARK';
  const brandIcon = isBravos ? '/brav-icon.png' : '/over-icon.png';

  return (
    <header style={{
      marginBottom: '1.5rem',
      padding: '1.1rem 1.5rem',
      background: headerBg,
      borderRadius: '14px',
      border: `1px solid ${headerBorder}`,
      boxShadow: headerShadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={brandIcon} alt={brandName} style={{
            width: '48px', height: '48px', borderRadius: '12px',
            objectFit: 'contain', flexShrink: 0,
            boxShadow: `0 4px 16px ${accent}55`,
            background: `${accent}22`,
            padding: '4px',
          }} />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: titleColor, margin: 0, letterSpacing: '-0.02em' }}>
              {brandName} <span style={{ color: accent }}>Ventas</span>
            </h1>
            <p style={{ color: mutedColor, fontSize: '0.82rem', margin: 0 }}>
              Genera el resumen y registra la venta al instante
            </p>
          </div>
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

      {/* Meta diaria */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Target size={14} style={{ color: mutedColor, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
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
          {salesCount} / {metaDiaria}
        </span>
        <input
          type="number"
          min={1}
          max={999}
          value={metaDiaria}
          onChange={e => onMetaChange(Math.max(1, parseInt(e.target.value) || 1))}
          title="Meta diaria de ventas"
          style={{
            width: '52px',
            background: isBravos ? 'rgba(255,255,255,0.05)' : 'rgba(69,131,77,.06)',
            border: `1px solid ${headerBorder}`,
            borderRadius: '6px',
            color: mutedColor,
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '0.2rem 0.4rem',
            textAlign: 'center',
          }}
        />
      </div>
    </header>
  );
}
