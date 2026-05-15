import { BarChart2, CheckCircle2, LogOut, MessageSquare, Percent, RefreshCw, Table2, Tag, XCircle } from 'lucide-react';
import { ATC_GRADIENTS, ATC_PALETTE } from './theme';

type ActiveSection = 'tickets' | 'descuentos' | 'reporte' | 'metricas';

interface Theme {
  borderSoft: string;
  borderAccent: string;
  accent: string;
  accentLight: string;
  muted: string;
  text2: string;
  success: string;
  warning: string;
  danger: string;
}

interface ATCHeaderProps {
  userName: string;
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  ticketsCount: number;
  openCount: number;
  inProcessCount: number;
  resolvedToday: number;
  onSyncSheets: () => void;
  syncingSheets: boolean;
  syncMsg: string | null;
  isAdmin?: boolean;
  onBack?: () => void;
  onSignOut: () => void;
  theme: Theme;
}

export default function ATCHeader({
  userName,
  activeSection,
  onSectionChange,
  ticketsCount,
  openCount,
  inProcessCount,
  resolvedToday,
  onSyncSheets,
  syncingSheets,
  syncMsg,
  isAdmin,
  onBack,
  onSignOut,
  theme,
}: ATCHeaderProps) {
  const navBtn = (active: boolean, activeBg: string, activeColor = '#fff'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.5rem 1.05rem',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
    transition: 'all .16s ease',
    background: active ? activeBg : 'rgba(255,255,255,.6)',
    color: active ? activeColor : theme.muted,
  });

  return (
    <div style={{ background: ATC_GRADIENTS.headerBg, borderBottom: '1px solid rgba(104,168,119,.2)', padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.9rem', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 4px 18px rgba(69,131,77,.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: ATC_GRADIENTS.accentBtn, boxShadow: '0 4px 14px rgba(69,131,77,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: '0.93rem', color: theme.text2, letterSpacing: '0.02em' }}>
            LIVEX <span style={{ color: theme.accent }}>ATC</span> Command Hub
          </div>
          <div style={{ fontSize: '0.68rem', color: theme.muted }}>{userName}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.28rem', borderRadius: '12px', padding: '0.22rem', border: 'none', background: 'rgba(242,251,245,.9)' }}>
        <button
          onClick={() => onSectionChange('tickets')}
          style={navBtn(activeSection === 'tickets', ATC_GRADIENTS.accentBtn)}
        >
          <Tag size={14} /> ATC Tickets
          <span style={{ fontSize: '0.62rem', fontWeight: 900, background: activeSection === 'tickets' ? 'rgba(255,255,255,.22)' : 'rgba(69,131,77,.12)', color: activeSection === 'tickets' ? '#fff' : '#45834D', borderRadius: '4px', padding: '0.05rem 0.38rem' }}>{ticketsCount}</span>
        </button>
        <button
          onClick={() => onSectionChange('descuentos')}
          style={navBtn(activeSection === 'descuentos', ATC_GRADIENTS.violetBtn)}
        >
          <Percent size={14} /> Descuentos
        </button>
        <button
          onClick={() => onSectionChange('metricas')}
          style={navBtn(activeSection === 'metricas', ATC_GRADIENTS.accentBtn)}
        >
          <BarChart2 size={14} /> Métricas
        </button>
        <button
          onClick={() => onSectionChange('reporte')}
          style={navBtn(activeSection === 'reporte', ATC_GRADIENTS.accentBtn)}
        >
          <Table2 size={14} /> Tablas
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { label: 'Abiertos', val: openCount, color: theme.danger },
            { label: 'En proceso', val: inProcessCount, color: theme.warning },
            { label: 'Resueltos hoy', val: resolvedToday, color: theme.success },
          ].map(k => (
            <div key={k.label} style={{ background: 'rgba(255,255,255,.72)', border: 'none', borderRadius: 8, padding: '0.25rem 0.55rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: theme.muted }}>{k.label}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={onSyncSheets} disabled={syncingSheets} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: syncingSheets ? 'default' : 'pointer', border: 'none', background: 'rgba(69,131,77,.1)', color: theme.accent, opacity: syncingSheets ? 0.7 : 1 }}>
            <RefreshCw size={13} style={{ animation: syncingSheets ? 'spin 1s linear infinite' : 'none' }} />
            {syncingSheets ? 'Sincronizando...' : 'Sync Sheets'}
          </button>
          {syncMsg && (
            <div style={{ position: 'absolute', top: '110%', right: 0, background: syncMsg.startsWith('OK') ? theme.success : theme.danger, color: '#fff', borderRadius: '7px', padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {syncMsg.startsWith('OK') ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {syncMsg}
            </div>
          )}
        </div>
        {isAdmin && onBack && (
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'rgba(30,111,160,0.1)', color: '#1e6fa0' }}>
            ← Admin
          </button>
        )}
        <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'rgba(184,48,48,0.1)', color: '#b83030' }}>
          <LogOut size={13} /> Salir
        </button>
      </div>
    </div>
  );
}
