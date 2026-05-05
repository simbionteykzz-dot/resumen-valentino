import { useAdmin } from '../../hooks/useAdmin';
import { BarChart3, Users, DollarSign, Package, TrendingUp, RefreshCw, LogOut, ShoppingBag, Filter } from 'lucide-react';
import type { Profile } from '../../types';

interface AdminDashboardProps {
  adminName: string;
  profiles: Profile[];
  onSignOut: () => void;
}

const card = (bg: string, border: string) => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '14px',
  padding: '1.25rem 1.5rem',
});

export default function AdminDashboard({ adminName, onSignOut }: AdminDashboardProps) {
  const {
    filteredSales,
    loading,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    vendorFilter, setVendorFilter,
    globalStats,
    vendorStats,
    allSales,
    refresh,
  } = useAdmin();

  const vendorNames = Array.from(new Set(allSales.map(s => s.vendorName))).sort();

  return (
    <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{
        marginBottom: '1.75rem', padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #0a1020, #0f1a30)',
        borderRadius: '14px', border: '1px solid #1a2a44',
        boxShadow: '0 4px 24px rgba(56,200,245,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #38c8f5, #1a8ab5)',
            borderRadius: '12px', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(56,200,245,0.35)',
          }}>
            <BarChart3 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              OVERSHARK <span style={{ color: '#38c8f5' }}>Admin</span>
            </h1>
            <p style={{ color: '#6080a0', fontSize: '0.82rem', margin: 0 }}>
              Panel de control — {adminName}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={refresh} disabled={loading} style={{
            background: 'rgba(56,200,245,0.1)', border: '1px solid rgba(56,200,245,0.25)',
            borderRadius: '8px', color: '#38c8f5', cursor: 'pointer',
            padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button onClick={onSignOut} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', color: '#ef4444', cursor: 'pointer',
            padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      {/* ── Filtros ── */}
      <div style={{
        ...card('rgba(26,39,51,0.5)', 'rgba(56,200,245,0.15)'),
        marginBottom: '1.5rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38c8f5' }}>
          <Filter size={15} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filtros</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6080a0' }}>Desde</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6080a0' }}>Hasta</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6080a0' }}>Vendedor</label>
          <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={inputStyle}>
            <option value="todos">Todos</option>
            {vendorNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats globales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard icon={<ShoppingBag size={20} />} label="Ventas" value={globalStats.salesCount.toString()} color="#ff6b00" bg="rgba(255,107,0,0.08)" border="rgba(255,107,0,0.2)" />
        <StatCard icon={<DollarSign size={20} />} label="Total S/" value={`S/${globalStats.totalRevenue.toLocaleString()}`} color="#38c8f5" bg="rgba(56,200,245,0.08)" border="rgba(56,200,245,0.2)" />
        <StatCard icon={<Package size={20} />} label="Prendas" value={globalStats.totalItems.toString()} color="#a78bfa" bg="rgba(167,139,250,0.08)" border="rgba(167,139,250,0.2)" />
        <StatCard icon={<TrendingUp size={20} />} label="Promedio/venta" value={`S/${globalStats.avgPerSale}`} color="#00e696" bg="rgba(0,230,150,0.08)" border="rgba(0,230,150,0.2)" />
      </div>

      {/* ── Ranking vendedores ── */}
      <div style={{ ...card('rgba(10,16,23,0.7)', '#1a2a3a'), marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={16} style={{ color: '#38c8f5' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6080a0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Ranking de Vendedores
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a2a3a' }}>
                {['#', 'Vendedor', 'Ventas', 'Total S/', 'Prendas', 'Promedio/venta'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: h === '#' || h === 'Ventas' || h === 'Prendas' ? 'center' : 'left', fontSize: '0.7rem', fontWeight: 800, color: '#6080a0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorStats.map((v, i) => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(26,42,58,0.5)', background: i === 0 ? 'rgba(56,200,245,0.04)' : 'transparent' }}>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', fontWeight: 900, color: i === 0 ? '#38c8f5' : i === 1 ? '#a78bfa' : i === 2 ? '#ff6b00' : '#6080a0' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 800, color: '#fff' }}>{v.name}</td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#ff6b00' }}>{v.salesCount}</td>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: '#38c8f5' }}>S/{v.totalRevenue.toLocaleString()}</td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#a78bfa' }}>{v.totalItems}</td>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 700, color: '#00e696' }}>S/{v.avgPerSale}</td>
                </tr>
              ))}
              {vendorStats.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6080a0' }}>Sin datos en el rango seleccionado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Tabla de ventas ── */}
      <div style={{ ...card('rgba(10,16,23,0.7)', '#1a2a3a') }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart3 size={16} style={{ color: '#38c8f5' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6080a0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Detalle de Ventas ({filteredSales.length})
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a2a3a' }}>
                {['Fecha', 'Hora', 'Vendedor', 'Cliente', 'Celular', 'Combo', 'Prendas', 'Total S/', 'Pago'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 800, color: '#6080a0', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s, i) => (
                <tr key={s._dbId ?? i} style={{ borderBottom: '1px solid rgba(26,42,58,0.4)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,200,245,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#6080a0', whiteSpace: 'nowrap' }}>{s.fecha}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#6080a0', whiteSpace: 'nowrap' }}>{s.hora}</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#38c8f5', whiteSpace: 'nowrap' }}>{s.vendorName}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#fff', whiteSpace: 'nowrap' }}>{s.nom || '—'}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#6080a0', whiteSpace: 'nowrap' }}>{s.cel || '—'}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#a0b0c0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.combo || '—'}</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#a78bfa', textAlign: 'center' }}>{s.qtyN}</td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#00e696', whiteSpace: 'nowrap' }}>S/{s.totalTotal}</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#6080a0', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{s.metodoPago}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr><td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: '#6080a0' }}>Sin ventas en el rango seleccionado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, border }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color }}>{icon}
        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(10,16,23,0.8)',
  border: '1px solid #1a2a3a',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.35rem 0.7rem',
  fontSize: '0.82rem',
  outline: 'none',
};
