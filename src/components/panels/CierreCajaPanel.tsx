import React from 'react';
import { BarChart3, DollarSign, Package, Truck, MapPin, Bike } from 'lucide-react';

export default function CierreCajaPanel({ sales }: { sales: any[] }) {
  const totalVentas = sales.length;
  const totalPrendas = sales.reduce((acc, s) => acc + s.qtyN, 0);
  const totalSoles = sales.reduce((acc, s) => acc + s.totalTotal, 0);
  const enviosLima = sales.filter(s => s.limaMark).length;
  const enviosProv = sales.filter(s => s.provMark).length;

  // Calcular separos y deudas
  const totalSeparos = sales.reduce((acc, s) => {
    const separo = parseFloat(s.separo) || 0;
    return acc + separo;
  }, 0);

  const totalDeudas = sales.reduce((acc, s) => {
    const resta = parseFloat(s.resta) || 0;
    return acc + resta;
  }, 0);

  const pagosCompletos = sales.filter(s => s.pagoCompletoTxt).length;
  const contraEntrega = sales.filter(s => s.separo || s.resta).length;

  const promedioVenta = totalVentas > 0 ? totalSoles / totalVentas : 0;
  const promedioPrendas = totalVentas > 0 ? totalPrendas / totalVentas : 0;

  return (
    <div className="panel always" id="cierre-caja-export" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <BarChart3 size={20} /> Cierre de Caja Dinámico
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.5rem 0 0 0' }}>
          Resumen automático de todas las ventas registradas
        </p>
      </div>

      {/* Métricas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

        <div style={{
          background: 'linear-gradient(135deg, rgba(69,131,77,.08), rgba(104,168,119,.05))',
          border: '1.5px solid rgba(104,168,119,.4)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(69,131,77,.08)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(69,131,77,.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(104,168,119,.4)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={14} /> Ventas Registradas
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: '1' }}>
            {totalVentas}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(69,131,77,.12), rgba(58,109,66,.08))',
          border: '1.5px solid rgba(69,131,77,.35)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(69,131,77,.15)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(69,131,77,.55)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(69,131,77,.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(69,131,77,.35)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(69,131,77,.15)';
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={14} /> Total Recaudado
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: '1' }}>
            S/ {totalSoles.toFixed(2)}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 200, 245, 0.12), rgba(56, 200, 245, 0.08))',
          border: '1.5px solid rgba(56, 200, 245, 0.3)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(56, 200, 245, 0.15)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(56, 200, 245, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(56, 200, 245, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(56, 200, 245, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(56, 200, 245, 0.15)';
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={14} /> Prendas Totales
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--info)', lineHeight: '1', textShadow: '0 2px 8px rgba(56, 200, 245, 0.2)' }}>
            {totalPrendas}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(104,168,119,.08), rgba(81,120,97,.05))',
          border: '1.5px solid rgba(104,168,119,.35)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(69,131,77,.08)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(104,168,119,.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(104,168,119,.35)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={14} /> Envíos por Zonas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(30, 111, 160, 0.08)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(30, 111, 160, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 111, 160, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 111, 160, 0.08)'}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bike size={16} /> Lima
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--info)' }}>{enviosLima}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(245, 166, 35, 0.08)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(245, 166, 35, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 166, 35, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245, 166, 35, 0.08)'}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> Provincia
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--warn)' }}>{enviosProv}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sección de Pagos */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <DollarSign size={18} /> Detalles de Pagos
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

          {/* Total Separos */}
          <div style={{ background: 'linear-gradient(135deg, rgba(56, 200, 245, 0.12), rgba(56, 200, 245, 0.08))', border: '1.5px solid rgba(56, 200, 245, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Total Separos
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--info)', lineHeight: '1' }}>
              S/ {totalSeparos.toFixed(2)}
            </div>
          </div>

          {/* Total Deudas */}
          <div style={{ background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.12), rgba(245, 166, 35, 0.08))', border: '1.5px solid rgba(245, 166, 35, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Total por Cobrar
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--warn)', lineHeight: '1' }}>
              S/ {totalDeudas.toFixed(2)}
            </div>
          </div>

          {/* Pago Completo */}
          <div style={{ background: 'linear-gradient(135deg, rgba(0, 230, 150, 0.12), rgba(0, 163, 107, 0.08))', border: '1.5px solid rgba(0, 230, 150, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Pagos Completos
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)', lineHeight: '1' }}>
              {pagosCompletos}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              de {totalVentas} ventas
            </div>
          </div>

          {/* Contra Entrega */}
          <div style={{ background: 'linear-gradient(135deg, rgba(242,251,245,.8), rgba(255,255,255,.9))', border: '1.5px solid rgba(104,168,119,.35)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Contra Entrega
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text2)', lineHeight: '1' }}>
              {contraEntrega}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              ventas con saldo
            </div>
          </div>

        </div>
      </div>

      {/* Promedios */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BarChart3 size={18} /> Promedios
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

          <div style={{ background: 'rgba(242,251,245,.7)', border: '1px solid rgba(104,168,119,.35)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Promedio por Venta
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)', lineHeight: '1' }}>
              S/ {promedioVenta.toFixed(2)}
            </div>
          </div>

          <div style={{ background: 'rgba(242,251,245,.7)', border: '1px solid rgba(104,168,119,.35)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Prendas por Venta
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--info)', lineHeight: '1' }}>
              {promedioPrendas.toFixed(1)}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
