import { useRef } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LogOut, RefreshCw, Filter, Search, Download, X, BarChart3, ShoppingBag, DollarSign, Package } from 'lucide-react';
import type { Profile } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
  adminName: string;
  profiles: Profile[];
  onSignOut: () => void;
  onSwitchToVendedor: () => void;
}

export default function AdminDashboard({ adminName, onSignOut, onSwitchToVendedor }: AdminDashboardProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const {
    filteredSales, paginatedSales, loading,
    dateFrom, setDateFrom, dateTo, setDateTo,
    exactDate, setExactDate, monthFilter, setMonthFilter,
    search, setSearch,
    regionFilter, setRegionFilter,
    codPublicidad, setCodPublicidad,
    vendorSearch, setVendorSearch,
    celFilter, setCelFilter,
    estadoFilter, setEstadoFilter,
    metodoPagoFilter, setMetodoPagoFilter,
    showFilters, setShowFilters,
    page, setPage, totalPages,
    globalStats, vendorStats,
    refresh, clearFilters,
    getRegion, getEstado,
  } = useAdmin();

  const startIdx = (page - 1) * 50;
  const endIdx = Math.min(startIdx + paginatedSales.length, filteredSales.length);

  const toggleEstado = (estado: string) =>
    setEstadoFilter(prev => prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]);

  const exportCSV = () => {
    const headers = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGION', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'];
    const rows = filteredSales.map(s => [
      s.fecha ?? '', s.marcaLabel ?? 'OVER', s.vendorName ?? '',
      s.hora ?? '', getRegion(s), s.nom ?? '', s.cel ?? '', s.dni ?? '',
      s.totalTotal ?? 0, s.resta ?? '', s.separo ?? '',
      getEstado(s), s.codigoPublicidad ?? '', s.metodoPago ?? '', s.combo ?? '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`ventas_${dateFrom}_${dateTo}.pdf`);
  };

  const S = {
    surface: 'rgba(15,12,9,0.8)',
    surface2: 'rgba(22,17,13,0.9)',
    border: '1px solid #2a1f14',
    accent: '#ff6b00',
    muted: '#a08060',
    text: '#f0e6d8',
    text2: '#ffffff',
  };

  const btn = (variant: 'accent' | 'ghost' | 'danger' | 'info'): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.9rem', borderRadius: '8px',
    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    border: variant === 'ghost' ? '1px solid #2a1f14' : 'none',
    background: variant === 'accent' ? 'linear-gradient(135deg,#ff6b00,#e05500)'
      : variant === 'danger' ? 'rgba(239,68,68,0.12)'
      : variant === 'info' ? 'rgba(56,200,245,0.1)'
      : 'rgba(22,17,13,0.9)',
    color: variant === 'accent' ? '#000'
      : variant === 'danger' ? '#ef4444'
      : variant === 'info' ? '#38c8f5'
      : S.muted,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#080604 0%,#130d08 100%)', color: S.text, fontFamily: 'League Spartan,Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(10,16,23,0.95),rgba(17,25,33,0.95))', borderBottom: '1px solid rgba(255,107,0,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#ff6b00,#e05500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
            <BarChart3 size={18} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: S.text2, letterSpacing: '-0.02em' }}>
              OVERSHARK <span style={{ color: S.accent }}>Admin</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: S.muted }}>{adminName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={onSwitchToVendedor} style={{ ...btn('info'), border: '1px solid rgba(56,200,245,0.25)' }}>
            📋 Vista Vendedor
          </button>
          <button onClick={onSignOut} style={{ ...btn('danger'), border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.5rem 2rem' }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Ventas', value: globalStats.salesCount, color: S.accent, icon: <ShoppingBag size={18} /> },
            { label: 'Total S/', value: `S/${globalStats.totalRevenue.toLocaleString()}`, color: '#38c8f5', icon: <DollarSign size={18} /> },
            { label: 'Prendas', value: globalStats.totalItems, color: '#a78bfa', icon: <Package size={18} /> },
            { label: 'Promedio/venta', value: `S/${globalStats.avgPerSale}`, color: '#00e696', icon: <BarChart3 size={18} /> },
          ].map(k => (
            <div key={k.label} style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem', borderLeft: `3px solid ${k.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: k.color, marginBottom: '0.4rem' }}>
                {k.icon}
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Ranking */}
        {vendorStats.length > 0 && (
          <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Ranking de Vendedores</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {vendorStats.map((v, i) => (
                <div key={v.id} style={{ background: i === 0 ? 'rgba(255,107,0,0.08)' : 'rgba(22,17,13,0.8)', border: `1px solid ${i === 0 ? 'rgba(255,107,0,0.3)' : '#2a1f14'}`, borderRadius: '10px', padding: '0.6rem 1rem', minWidth: '150px' }}>
                  <div style={{ fontSize: '0.7rem', color: S.muted, marginBottom: '0.2rem' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`} {v.name}
                  </div>
                  <div style={{ fontWeight: 900, color: S.accent, fontSize: '1rem' }}>S/{v.totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', color: S.muted }}>{v.salesCount} ventas · {v.totalItems} prendas</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: S.muted }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por cliente, vendedor, celular o DNI..."
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid #2a1f14', borderRadius: '8px', fontSize: '0.82rem', background: 'rgba(10,16,23,0.6)', color: S.text2, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => setShowFilters(p => !p)} style={{ ...btn('ghost') }}>
            <Filter size={13} /> Filtros {showFilters ? '∧' : '∨'}
          </button>
          <button onClick={exportPDF} style={btn('accent')}>
            <Download size={13} /> PDF
          </button>
          <button onClick={exportCSV} style={{ ...btn('ghost'), color: '#38c8f5', border: '1px solid rgba(56,200,245,0.2)' }}>
            <Download size={13} /> Excel
          </button>
          <button onClick={refresh} disabled={loading} style={btn('ghost')}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div style={{ background: S.surface2, border: S.border, borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem 1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Ubicación', el: <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1); }} style={iStyle}><option value="todas">Todas</option><option value="Lima">Lima</option><option value="Provincia">Provincia</option><option value="Almacén">Almacén</option></select> },
                { label: 'Cod. Publicidad', el: <input value={codPublicidad} onChange={e => { setCodPublicidad(e.target.value); setPage(1); }} placeholder="Ej: Live" style={iStyle} /> },
                { label: 'Vendedor', el: <input value={vendorSearch} onChange={e => { setVendorSearch(e.target.value); setPage(1); }} placeholder="Nombre del vendedor" style={iStyle} /> },
                { label: 'Celular cliente', el: <input value={celFilter} onChange={e => { setCelFilter(e.target.value); setPage(1); }} placeholder="Ej: 999888777" style={iStyle} /> },
                { label: 'Fecha exacta', el: <input type="date" value={exactDate} onChange={e => { setExactDate(e.target.value); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
                { label: 'Mes', el: <input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setExactDate(''); setPage(1); }} style={iStyle} /> },
                { label: 'Rango: inicio', el: <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
                { label: 'Rango: fin', el: <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
              ].map(({ label, el }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
                  {el}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Estado de Pedido</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                  {['PAGO COMPLETO', 'CONTRA ENTREGA', 'ANULADO', 'DEVOLUCIÓN'].map(e => (
                    <label key={e} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: S.text, cursor: 'pointer', margin: 0, textTransform: 'none', letterSpacing: 'normal' }}>
                      <input type="checkbox" checked={estadoFilter.includes(e)} onChange={() => { toggleEstado(e); setPage(1); }} style={{ accentColor: S.accent, width: '14px', height: '14px' }} />
                      {e}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Método de Pago</div>
                <select value={metodoPagoFilter} onChange={e => { setMetodoPagoFilter(e.target.value); setPage(1); }} style={{ ...iStyle, minWidth: '180px' }}>
                  <option value="todos">Todos los métodos</option>
                  <option value="Contra entrega">Contra entrega</option>
                  <option value="Yape Import Textil">Yape Import Textil</option>
                  <option value="Pago completo">Pago completo</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{ ...btn('ghost'), color: S.muted }}>
                  <X size={13} /> Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contador + paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: S.muted }}>
            Mostrando {filteredSales.length === 0 ? '0–0' : `${startIdx + 1}–${endIdx}`} de {filteredSales.length} registros
          </span>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>

        {/* Tabla */}
        <div ref={tableRef} style={{ background: 'rgba(10,16,23,0.7)', border: '1px solid #2a1f14', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(224,85,0,0.1))', borderBottom: '2px solid rgba(255,107,0,0.3)' }}>
                  {['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.65rem', letterSpacing: '0.05em', color: '#ff6b00', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((s, i) => {
                  const region = getRegion(s);
                  const estado = getEstado(s);
                  const regionColor = region === 'Lima' ? { bg: 'rgba(56,200,245,0.1)', color: '#38c8f5' } : region === 'Provincia' ? { bg: 'rgba(255,107,0,0.1)', color: '#ff6b00' } : { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa' };
                  const estadoColor = estado === 'PAGO COMPLETO' ? { bg: 'rgba(0,230,150,0.1)', color: '#00e696' } : estado === 'CONTRA ENTREGA' ? { bg: 'rgba(255,107,0,0.1)', color: '#ff6b00' } : { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
                  return (
                    <tr key={s._dbId ?? i}
                      style={{ borderBottom: '1px solid rgba(42,31,20,0.5)', background: i % 2 === 0 ? 'transparent' : 'rgba(22,17,13,0.3)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,0,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(22,17,13,0.3)')}>
                      <td style={td}>{s.fecha ?? '—'}</td>
                      <td style={{ ...td, fontWeight: 700, color: '#f0e6d8' }}>{s.marcaLabel || 'OVER'}</td>
                      <td style={{ ...td, color: '#ff6b00', fontWeight: 700 }}>{s.vendorName}</td>
                      <td style={{ ...td, color: '#a08060' }}>{s.hora ?? '—'}</td>
                      <td style={td}>
                        <span style={{ background: regionColor.bg, color: regionColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.68rem' }}>{region}</span>
                      </td>
                      <td style={{ ...td, fontWeight: 600, color: '#f0e6d8' }}>{s.nom || '—'}</td>
                      <td style={td}>{s.cel || '—'}</td>
                      <td style={td}>{s.dni || '—'}</td>
                      <td style={{ ...td, fontWeight: 900, color: '#00e696' }}>S/{s.totalTotal ?? 0}</td>
                      <td style={{ ...td, color: s.resta ? '#ef4444' : '#a08060' }}>{s.resta || '—'}</td>
                      <td style={td}>{s.separo || '—'}</td>
                      <td style={td}>
                        <span style={{ background: estadoColor.bg, color: estadoColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{estado}</span>
                      </td>
                      <td style={td}>{s.codigoPublicidad || '—'}</td>
                      <td style={td}>{s.metodoPago || '—'}</td>
                      <td style={{ ...td, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#a08060' }}>{s.combo || '—'}</td>
                    </tr>
                  );
                })}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={15} style={{ padding: '3rem', textAlign: 'center', color: '#a08060', fontSize: '0.85rem' }}>
                      {loading ? 'Cargando ventas...' : 'Sin registros para los filtros seleccionados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const b = (disabled: boolean): React.CSSProperties => ({
    padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
    border: '1px solid #2a1f14', background: 'rgba(22,17,13,0.8)',
    color: disabled ? '#3a2a18' : '#a08060', borderRadius: '6px',
    cursor: disabled ? 'default' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  });
  return (
    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
      <button style={b(page === 1)} onClick={() => onPage(1)}>Primero</button>
      <button style={b(page === 1)} onClick={() => onPage(page - 1)}>Anterior</button>
      <span style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', color: '#a08060', fontWeight: 600 }}>
        Página {page} de {totalPages}
      </span>
      <button style={b(page === totalPages)} onClick={() => onPage(page + 1)}>Siguiente</button>
      <button style={b(page === totalPages)} onClick={() => onPage(totalPages)}>Último</button>
    </div>
  );
}

const iStyle: React.CSSProperties = {
  padding: '0.45rem 0.65rem', border: '1px solid #2a1f14',
  borderRadius: '8px', fontSize: '0.82rem',
  background: 'rgba(10,16,23,0.6)', color: '#f0e6d8',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem', color: '#a08060', whiteSpace: 'nowrap',
};
