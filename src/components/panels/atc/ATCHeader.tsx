import { BarChart2, CheckCircle2, LogOut, MessageSquare, Percent, RefreshCw, Table2, Tag, XCircle } from 'lucide-react';

type ActiveSection = 'tickets' | 'descuentos' | 'reporte';

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
  onShowMetrics: () => void;
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
  onShowMetrics,
  onSyncSheets,
  syncingSheets,
  syncMsg,
  isAdmin,
  onBack,
  onSignOut,
  theme,
}: ATCHeaderProps) {
  return (
    <div style={{ background: '#ffffff', borderBottom: theme.borderSoft, padding: '0.9rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.9rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: '0.93rem', color: theme.text2, letterSpacing: '-0.01em' }}>
            LIVEX <span style={{ color: theme.accent }}>ATC</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: theme.muted }}>{userName}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '10px', padding: '0.2rem', border: '1px solid rgba(15,23,42,.08)' }}>
        <button
          onClick={() => onSectionChange('tickets')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.05rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all .16s ease', background: activeSection === 'tickets' ? theme.accent : 'transparent', color: activeSection === 'tickets' ? '#fff' : theme.muted }}
        >
          <Tag size={14} /> ATC Tickets
          <span style={{ fontSize: '0.62rem', fontWeight: 900, background: activeSection === 'tickets' ? 'rgba(255,255,255,.22)' : 'rgba(29,78,216,.12)', color: activeSection === 'tickets' ? '#fff' : theme.accent, borderRadius: '4px', padding: '0.05rem 0.38rem' }}>{ticketsCount}</span>
        </button>
        <button
          onClick={() => onSectionChange('descuentos')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.05rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all .16s ease', background: activeSection === 'descuentos' ? '#7c3aed' : 'transparent', color: activeSection === 'descuentos' ? '#fff' : theme.muted }}
        >
          <Percent size={14} /> Descuentos
        </button>
        <button
          onClick={() => onSectionChange('reporte')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.05rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all .16s ease', background: activeSection === 'reporte' ? '#d97706' : 'transparent', color: activeSection === 'reporte' ? '#fff' : theme.muted }}
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
            <div key={k.label} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: '8px', padding: '0.3rem 0.65rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: k.color, opacity: 0.8 }}>{k.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onShowMetrics} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: theme.borderAccent, background: 'rgba(29,78,216,.08)', color: theme.accent }}>
          <BarChart2 size={13} /> Métricas
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={onSyncSheets} disabled={syncingSheets} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: syncingSheets ? 'default' : 'pointer', border: '1px solid rgba(21,128,61,.22)', background: 'rgba(21,128,61,.08)', color: theme.success, opacity: syncingSheets ? 0.7 : 1 }}>
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
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: theme.borderAccent, background: theme.accentLight, color: theme.accent }}>
            ← Admin
          </button>
        )}
        <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.48rem 0.95rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', border: '1px solid rgba(220,38,38,.22)', background: 'rgba(220,38,38,.08)', color: theme.danger }}>
          <LogOut size={13} /> Salir
        </button>
      </div>
    </div>
  );
}
