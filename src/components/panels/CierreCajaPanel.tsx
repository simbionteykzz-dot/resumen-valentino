import React from 'react';
import { BarChart3, DollarSign, Package, Truck, MapPin, Bike, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';

// ── Helper: modern metric card with top accent bar + icon badge ───────────────
function MetricCard({
  c, label, value, sub, icon,
}: {
  c: string;
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: `rgba(${c}, 0.06)`,
      border: `1px solid rgba(${c}, 0.22)`,
      borderRadius: '14px',
      padding: '1.2rem 1.1rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, rgb(${c}), rgba(${c},0.4))`,
        borderRadius: '14px 14px 0 0',
      }} />
      {/* decorative bg circle */}
      <div style={{
        position: 'absolute', top: '-22px', right: '-18px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `rgba(${c}, 0.07)`, pointerEvents: 'none',
      }} />
      {/* icon badge + label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        marginBottom: '0.65rem', marginTop: '0.1rem',
      }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
          background: `rgba(${c}, 0.15)`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: `rgb(${c})`,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '0.66rem', fontWeight: 800,
          color: 'var(--muted)', textTransform: 'uppercase',
          letterSpacing: '0.07em', lineHeight: '1.2',
        }}>
          {label}
        </span>
      </div>
      {/* value */}
      <div style={{
        fontSize: '2.15rem', fontWeight: 900,
        color: `rgb(${c})`, lineHeight: '1',
        letterSpacing: '-0.03em',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: '0.7rem', color: 'var(--muted)',
          marginTop: '0.35rem', fontWeight: 500,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Helper: section title with icon badge + horizontal rule ───────────────────
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
        background: 'rgba(69,131,77,0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)',
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: '0.73rem', fontWeight: 800,
        color: 'var(--muted)', textTransform: 'uppercase',
        letterSpacing: '0.07em', whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

export default function CierreCajaPanel({ sales }: { sales: any[] }) {
  const totalVentas = sales.length;
  const totalPrendas = sales.reduce((acc, s) => acc + (Number(s.qtyN) || 0), 0);

  // ── Dinero real ya cobrado ──────────────────────────────────────────────────
  // Para contra entrega: lo que separó (adelanto)
  // Para pago completo: el monto total pagado
  const totalSeparos = sales.reduce((acc, s) => acc + (parseFloat(s.separo) || 0), 0);
  const totalPagoCompleto = sales.reduce((acc, s) => acc + (parseFloat(s.pagoCompletoTxt) || 0), 0);
  const totalRecaudado = totalSeparos + totalPagoCompleto; // plata que ya entró en caja

  // ── Por cobrar: saldo pendiente en agencia / contra entrega ────────────────
  const totalDeudas = sales.reduce((acc, s) => acc + (parseFloat(s.resta) || 0), 0);

  // ── Total de ventas (valor bruto de todos los pedidos) ─────────────────────
  const totalVentasBruto = sales.reduce((acc, s) => acc + (Number(s.totalTotal) || 0), 0);

  const enviosLima = sales.filter(s => s.limaMark).length;
  const enviosProv = sales.filter(s => s.provMark).length;

  const pagosCompletos = sales.filter(s => s.pagoCompletoTxt).length;
  const contraEntrega = sales.filter(s => s.separo || s.resta).length;

  const promedioVenta = totalVentas > 0 ? totalVentasBruto / totalVentas : 0;
  const promedioPrendas = totalVentas > 0 ? totalPrendas / totalVentas : 0;

  const solesStr = (n: number) =>
    n % 1 === 0 ? `S/ ${Math.round(n)}` : `S/ ${n.toFixed(2)}`;

  return (
    <div className="panel always" id="cierre-caja-export" style={{ marginTop: '1.25rem' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgb(22,46,32), rgb(34,65,44))',
        borderRadius: '14px',
        padding: '1.25rem 1.4rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '160px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(69,131,77,0.15)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'rgba(69,131,77,0.35)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'rgb(140,220,160)',
            }}>
              <BarChart3 size={17} />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
              Cierre de Caja Dinámico
            </h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(69,131,77,0.35)', border: '1px solid rgba(69,131,77,0.5)',
              borderRadius: '20px', padding: '0.18rem 0.6rem',
              fontSize: '0.73rem', fontWeight: 800, color: 'rgb(140,220,160)',
            }}>
              <ArrowUpRight size={12} />
              {totalVentas} ventas
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(20,140,190,0.2)', border: '1px solid rgba(20,140,190,0.35)',
              borderRadius: '20px', padding: '0.18rem 0.6rem',
              fontSize: '0.7rem', fontWeight: 700, color: 'rgb(100,200,240)',
            }}>
              en tiempo real
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Resumen automático de todas las ventas registradas del día
          </p>
        </div>

        {/* Featured total recaudado */}
        <div style={{
          background: 'rgba(69,131,77,0.25)',
          border: '1px solid rgba(69,131,77,0.4)',
          borderRadius: '12px',
          padding: '0.75rem 1.1rem',
          textAlign: 'right',
          position: 'relative',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            Total Recaudado
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: '1' }}>
            {solesStr(totalRecaudado)}
          </div>
        </div>
      </div>

      {/* ── Sección 1: Métricas principales ──────────────────────────────── */}
      <SectionTitle
        icon={<BarChart3 size={15} color="var(--accent)" />}
        title="Métricas Principales"
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <MetricCard
          c="69,131,77"
          label="Ventas Registradas"
          value={String(totalVentas)}
          icon={<BarChart3 size={13} />}
        />
        <MetricCard
          c="45,100,55"
          label="Ya Cobrado"
          value={solesStr(totalRecaudado)}
          sub="separos + pagos completos"
          icon={<DollarSign size={13} />}
        />
        <MetricCard
          c="30,130,100"
          label="Total Pedidos (Bruto)"
          value={solesStr(totalVentasBruto)}
          sub="valor total de todos los pedidos"
          icon={<Package size={13} />}
        />
        <MetricCard
          c="30,111,160"
          label="Prendas Totales"
          value={String(totalPrendas)}
          icon={<Package size={13} />}
        />

        {/* Envíos por Zonas — tarjeta especial con sub-filas */}
        <div style={{
          background: 'rgba(160,120,10,0.06)',
          border: '1px solid rgba(160,120,10,0.22)',
          borderRadius: '14px',
          padding: '1.2rem 1.1rem 1rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}>
          {/* top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, rgb(160,120,10), rgba(160,120,10,0.4))',
            borderRadius: '14px 14px 0 0',
          }} />
          {/* decorative bg circle */}
          <div style={{
            position: 'absolute', top: '-22px', right: '-18px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(160,120,10,0.07)', pointerEvents: 'none',
          }} />
          {/* icon badge + label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            marginBottom: '0.2rem', marginTop: '0.1rem',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
              background: 'rgba(160,120,10,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgb(160,120,10)',
            }}>
              <Truck size={13} />
            </div>
            <span style={{
              fontSize: '0.66rem', fontWeight: 800,
              color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}>
              Envíos por Zonas
            </span>
          </div>

          {/* Lima sub-fila */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(30,111,160,0.1)',
            border: '1px solid rgba(30,111,160,0.18)',
            borderRadius: '9px', padding: '0.45rem 0.7rem',
          }}>
            <span style={{
              fontSize: '0.82rem', fontWeight: 700, color: 'rgb(30,111,160)',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              <Bike size={13} /> Lima
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'rgb(30,111,160)', letterSpacing: '-0.03em' }}>
              {enviosLima}
            </span>
          </div>

          {/* Provincia sub-fila */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(160,120,10,0.1)',
            border: '1px solid rgba(160,120,10,0.18)',
            borderRadius: '9px', padding: '0.45rem 0.7rem',
          }}>
            <span style={{
              fontSize: '0.82rem', fontWeight: 700, color: 'rgb(160,120,10)',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              <MapPin size={13} /> Provincia
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'rgb(160,120,10)', letterSpacing: '-0.03em' }}>
              {enviosProv}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sección 2: Detalle de pagos ───────────────────────────────────── */}
      <SectionTitle
        icon={<CreditCard size={15} color="var(--accent)" />}
        title="Detalle de Pagos"
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <MetricCard
          c="20,140,190"
          label="Total Separos (Adelantos)"
          value={solesStr(totalSeparos)}
          sub="dinero recibido de CE"
          icon={<DollarSign size={13} />}
        />
        <MetricCard
          c="40,160,80"
          label="Pagos Completos"
          value={solesStr(totalPagoCompleto)}
          sub={`${pagosCompletos} ventas`}
          icon={<ArrowUpRight size={13} />}
        />
        <MetricCard
          c="180,120,10"
          label="Por Cobrar (Saldo)"
          value={solesStr(totalDeudas)}
          sub="pendiente en agencia / CE"
          icon={<DollarSign size={13} />}
        />
        <MetricCard
          c="100,110,145"
          label="Contra Entrega"
          value={String(contraEntrega)}
          sub="ventas con saldo"
          icon={<Package size={13} />}
        />
      </div>

      {/* ── Sección 3: Promedios ──────────────────────────────────────────── */}
      <SectionTitle
        icon={<TrendingUp size={15} color="var(--accent)" />}
        title="Promedios"
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <MetricCard
          c="69,131,77"
          label="Promedio por Venta"
          value={solesStr(promedioVenta)}
          icon={<TrendingUp size={13} />}
        />
        <MetricCard
          c="30,111,160"
          label="Prendas por Venta"
          value={promedioPrendas.toFixed(1)}
          icon={<Package size={13} />}
        />
      </div>

    </div>
  );
}
