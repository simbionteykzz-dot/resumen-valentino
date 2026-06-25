import { useState, useEffect, useMemo } from 'react';
import { Trash2, Store, Bike, Package, BarChart3, Wrench, X, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useSales } from '../hooks/useSales';
import { useToast } from '../hooks/useToast';
import { getVendorGoals } from '../lib/supabase';
import AppHeader from '../components/layout/AppHeader';
import ClientePanel from '../components/panels/ClientePanel';
import CuentaPanel from '../components/panels/CuentaPanel';
import ProductosPanel from '../components/panels/ProductosPanel';
import OutputPanel from '../components/panels/OutputPanel';
import PlanillaPanel from '../components/panels/PlanillaPanel';
import CierreCajaPanel from '../components/panels/CierreCajaPanel';
import FrasesVentaPanel from '../components/panels/FrasesVentaPanel';
import BoostersPanel from '../components/panels/BoostersPanel';
import RespuestasPanel from '../components/panels/RespuestasPanel';
import NegociacionPanel from '../components/panels/NegociacionPanel';
import RankingPanel from '../components/panels/RankingPanel';
import SeguimientoPanel from '../components/panels/SeguimientoPanel';
import DudasCompraPanel from '../components/panels/DudasCompraPanel';
import RiesgosPanel from '../components/panels/RiesgosPanel';
import KPIHistorialPanel from '../components/panels/KPIHistorialPanel';
import ReporteDiarioPanel from '../components/panels/ReporteDiarioPanel';
import TabBar from '../components/ui/TabBar';
import CatalogoGaleria from '../components/ui/CatalogoGaleria';
import { BRANDS, applyBrandTheme } from '../lib/brands';
import type { BrandKey } from '../lib/brands';
import { calcularTotalPagar, calcularDebe } from '../lib/pricing';
import { buildOutputText, getModelosEnPedido } from '../lib/outputFormatter';
import { buildSale } from '../lib/saleBuilder';
import { POLOS_CATALOGO_OVERSHARK, POLOS_CATALOGO_BRAVOS } from '../lib/data';
import type { ClientData, CuentaData, BoosterState, Profile } from '../types';
import type { DeliveryTab } from '../lib/pricing';

const DELIVERY_TABS = [
  { id: 'prov'    as const, label: 'Provincia (Shalom)', icon: <Package size={16} /> },
  { id: 'lima'    as const, label: 'Delivery Lima',      icon: <Bike    size={16} /> },
  { id: 'almacen' as const, label: 'Recojo almacén',     icon: <Store   size={16} /> },
];


const EMPTY_CLIENT: ClientData = {
  nombre: '', celular: '', dni: '', provincia: '', depto: '',
  sede: 'Shalom', ubicacion: '', distrito: '', codigoPublicidad: 'Live',
};
const EMPTY_CUENTA: CuentaData = { tipo: 'contra', pago: '', debe: '' };

function getInitialSource(): 'live' | 'publicidad' {
  return (localStorage.getItem('overshark_sale_source') as 'live' | 'publicidad') || 'live';
}
function getInitialPubCode(): string {
  return localStorage.getItem('overshark_pub_code') || '';
}

interface VendorAppProps {
  profile: Profile | null;
  profiles: Profile[];
  onSwitchToAdmin?: () => void;
}

export default function VendorApp({ profile, profiles, onSwitchToAdmin }: VendorAppProps) {
  const { user, signOut } = useAuth();
  const { toast, showToast } = useToast();

  const [brand, setBrand] = useState<BrandKey>('overshark');
  const [tab, setTab] = useState<DeliveryTab>('prov');
  const [showHerramientas, setShowHerramientas] = useState(false);
  const [showDudas, setShowDudas] = useState(false);
  const [showRiesgos, setShowRiesgos] = useState(false);
  const [planillaMode, setPlanillaMode] = useState<'todas' | 'live' | 'publicidad'>(() =>
    getInitialSource() === 'publicidad' ? 'publicidad' : 'live',
  );
  const [saleSource, setSaleSource] = useState<'live' | 'publicidad'>(getInitialSource);
  const [pubCode, setPubCode] = useState<string>(getInitialPubCode);

  const [clientData, setClientData] = useState<ClientData>({
    ...EMPTY_CLIENT,
    codigoPublicidad: getInitialSource() === 'live' ? 'Live' : (getInitialPubCode() || 'PUBLICIDAD'),
  });
  const [cuentaData, setCuentaData] = useState<CuentaData>(EMPTY_CUENTA);
  const [products, setProducts] = useState<any[]>([]);
  const [customComboName, setCustomComboName] = useState('');
  const [promoPrice, setPromoPrice] = useState<string | number>('');
  const [boosters, setBoosters] = useState<BoosterState>(() => {
    try {
      const saved = localStorage.getItem('overshark_boosters');
      if (saved) return { ...JSON.parse(saved), cadenitas: 1 };
    } catch {}
    return { cadenitas: 1, urgencia: false, socialProof: false, recomendacion: false, descuento: false, fraseVenta: true, garantia: false, referido: false };
  });
  const [metaVentas, setMetaVentas] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    getVendorGoals().then(goals => {
      const mine = goals.find(g => g.vendor_id === user.id);
      setMetaVentas(mine?.meta_ventas ?? 0);
    });
  }, [user?.id]);

  const { sales, deletedSales, selectedDate, setSelectedDate, loadingSync, syncError, addSale, deleteSale, restoreSale, hardDeleteSale, duplicateSale } =
    useSales(user?.id, showToast);

  const activeBrand = BRANDS[brand];
  const PRECIOS_ACTIVOS = activeBrand.precios;
  const VARIANTES_ACTIVOS = activeBrand.variantes;

  useEffect(() => { applyBrandTheme(brand); }, [brand]);

  const totalPagar = calcularTotalPagar(products, tab, PRECIOS_ACTIVOS, VARIANTES_ACTIVOS, clientData.depto);

  useEffect(() => {
    setCuentaData(prev => ({
      ...prev,
      debe: calcularDebe(prev.tipo, prev.pago, totalPagar, products.length),
    }));
  }, [products, promoPrice, tab, cuentaData.pago, cuentaData.tipo]);

  const modelosEnPedido = useMemo(() => getModelosEnPedido(products), [products]);

  const emailPrefix = user?.email?.split('@')[0] || 'VENDEDOR';
  const vendedorName = ((user?.user_metadata?.full_name || user?.user_metadata?.name || emailPrefix) as string).toUpperCase();

  const outputStr = useMemo(() => buildOutputText({
    tab, clientData, cuentaData, products, customComboName,
    boosters, modelosEnPedido, vendedorName, brand,
    VARIANTES_ACTIVOS,
  }), [tab, clientData, cuentaData, products, customComboName, boosters, modelosEnPedido, vendedorName, brand]);

  const handleBoosterChange = (field: string, value: any) =>
    setBoosters(prev => {
      const next = { ...prev, [field]: value };
      try { localStorage.setItem('overshark_boosters', JSON.stringify(next)); } catch {}
      return next;
    });

  const handleClientChange = (field: keyof ClientData, value: string) =>
    setClientData(prev => ({ ...prev, [field]: value }));

  const handleCuentaChange = (field: string, value: string) =>
    setCuentaData(prev => ({ ...prev, [field]: value }));

  const handleSaleSourceChange = (src: 'live' | 'publicidad') => {
    setSaleSource(src);
    localStorage.setItem('overshark_sale_source', src);
    setPlanillaMode(src);
    setClientData(prev => ({
      ...prev,
      codigoPublicidad: src === 'live' ? 'Live' : (pubCode || 'PUBLICIDAD'),
    }));
  };

  const handlePubCodeChange = (code: string) => {
    setPubCode(code);
    localStorage.setItem('overshark_pub_code', code);
    setClientData(prev => ({ ...prev, codigoPublicidad: code || 'PUBLICIDAD' }));
  };

  const clearAll = () => {
    setClientData({
      ...EMPTY_CLIENT,
      codigoPublicidad: saleSource === 'live' ? 'Live' : (pubCode || 'PUBLICIDAD'),
    });
    setCuentaData(EMPTY_CUENTA);
    setProducts([]);
    setCustomComboName('');
    setPromoPrice('');
    setBoosters(prev => ({ ...prev, cadenitas: 1 }));
  };

  const handleChangeBrand = (newBrand: BrandKey) => {
    setBrand(newBrand);
    setProducts([]);
    setCustomComboName('');
    setPromoPrice('');
  };

  const handlePushSale = () => {
    if (!clientData.celular && !clientData.nombre) return;
    if (clientData.celular) {
      const dup = sales.find(s => s.cel === clientData.celular);
      if (dup) {
        const ok = window.confirm(
          `Advertencia: ya hay una venta registrada hoy para el celular ${clientData.celular}${dup.nom ? ` (${dup.nom})` : ''}.\n\n¿Registrar de todas formas?`,
        );
        if (!ok) return;
      }
    }
    const newSale = buildSale({ clientData, cuentaData, products, customComboName, tab, brand, totalPagar, VARIANTES_ACTIVOS, PRECIOS_ACTIVOS });
    addSale(newSale);
  };

  const totalSoles = sales.reduce((a: number, s: any) => a + (Number(s.totalTotal) || 0), 0);
  const salesOver = sales.filter((s: any) => (s.marcaLabel || 'OVER') === 'OVER');
  const salesBrv  = sales.filter((s: any) => s.marcaLabel === 'BRV');
  const salesCountOver = salesOver.length;
  const totalSolesOver = salesOver.reduce((a: number, s: any) => a + (Number(s.totalTotal) || 0), 0);
  const salesCountBrv  = salesBrv.length;
  const totalSolesBrv  = salesBrv.reduce((a: number, s: any) => a + (Number(s.totalTotal) || 0), 0);

  return (
    <>
      <CatalogoGaleria />
      <div className="wrap" style={{ maxWidth: '1140px', margin: '0 auto' }}>
        {profile?.role === 'admin' && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onSwitchToAdmin}
              style={{
                background: 'rgba(69,131,77,0.1)', border: '1px solid rgba(104,168,119,0.35)',
                borderRadius: '8px', color: '#45834D', cursor: 'pointer',
                padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              ← Volver al Panel Admin
            </button>
          </div>
        )}

        <AppHeader
          salesCount={sales.length}
          totalSoles={totalSoles}
          salesCountOver={salesCountOver}
          totalSolesOver={totalSolesOver}
          salesCountBrv={salesCountBrv}
          totalSolesBrv={totalSolesBrv}
          metaDiaria={metaVentas}
          userName={vendedorName}
          onSignOut={signOut}
          brand={brand}
          onChangeBrand={handleChangeBrand}
          saleSource={saleSource}
          onChangeSaleSource={handleSaleSourceChange}
        />


        {/* Input código publicidad (solo visible cuando aplica) */}
        {saleSource === 'publicidad' && (
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9333ea', whiteSpace: 'nowrap' }}>Código publicidad:</span>
            <input
              placeholder="Ej: META-001"
              value={pubCode}
              onChange={e => handlePubCodeChange(e.target.value)}
              style={{
                background: 'var(--surface2)', border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: '8px', color: 'var(--text)', padding: '0.3rem 0.65rem',
                fontSize: '0.82rem', minWidth: '180px', outline: 'none',
              }}
            />
          </div>
        )}

        {/* Tabs de entrega */}
        <div className="tabs-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border2)', paddingBottom: '1rem' }}>
          <TabBar tabs={DELIVERY_TABS} active={tab} onChange={id => setTab(id)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn-borrar-todo"
              onClick={clearAll}
              title="Borra todos los datos de golpe"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '40px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 700, cursor: 'pointer' }}
            >
              <Trash2 size={16} /> Borrar todo
            </button>
          </div>
        </div>

        {/* Grid principal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)', gap: '1.75rem', alignItems: 'start' }}>
          <div>
            <ClientePanel tab={tab} data={clientData} onChange={handleClientChange} />
            <CuentaPanel data={cuentaData} onChange={handleCuentaChange} totalPagar={totalPagar} />
            <BoostersPanel boosters={boosters} onChange={handleBoosterChange} productCount={products.length} />
          </div>
          <div>
            <ProductosPanel
              products={products} setProducts={setProducts}
              customComboName={customComboName} setCustomComboName={setCustomComboName}
              promoPrice={promoPrice} setPromoPrice={setPromoPrice}
              brand={brand}
            />
            <OutputPanel
              outputText={outputStr}
              onAddSale={handlePushSale}
              clientCelular={clientData.celular}
              clientNombre={clientData.nombre}
              vendedorName={vendedorName}
              codigoYape={cuentaData.yape}
            />
          </div>
        </div>

        {/* Sección de registro — siempre visible */}
        <div style={{ marginTop: '2rem' }}>
          <CierreCajaPanel sales={sales} />
          <ReporteDiarioPanel sales={sales} />
          <KPIHistorialPanel userId={user?.id} />
          <RankingPanel sales={sales} />

          {planillaMode === 'live' && (
            <>
              <PlanillaPanel
                sales={sales} deletedSales={deletedSales}
                selectedDate={selectedDate} onDateChange={setSelectedDate}
                loadingSync={loadingSync} syncError={syncError}
                onDeleteSale={deleteSale} onRestoreSale={restoreSale} onHardDeleteSale={hardDeleteSale} onDuplicateSale={duplicateSale}
                profiles={profiles}
                currentUserName={vendedorName}
                title="Live"
                sourceFilter="live"
                exportId="sales-sheet-live-over"
                forcedBrand="OVER"
              />
              <PlanillaPanel
                sales={sales} deletedSales={deletedSales}
                selectedDate={selectedDate} onDateChange={setSelectedDate}
                loadingSync={loadingSync} syncError={syncError}
                onDeleteSale={deleteSale} onRestoreSale={restoreSale} onHardDeleteSale={hardDeleteSale} onDuplicateSale={duplicateSale}
                profiles={profiles}
                currentUserName={vendedorName}
                title="Live"
                sourceFilter="live"
                exportId="sales-sheet-live-brv"
                forcedBrand="BRV"
              />
            </>
          )}

          {planillaMode === 'publicidad' && (
            <>
              <PlanillaPanel
                sales={sales} deletedSales={deletedSales}
                selectedDate={selectedDate} onDateChange={setSelectedDate}
                loadingSync={loadingSync} syncError={syncError}
                onDeleteSale={deleteSale} onRestoreSale={restoreSale} onHardDeleteSale={hardDeleteSale} onDuplicateSale={duplicateSale}
                profiles={profiles}
                currentUserName={vendedorName}
                title="Publicidad"
                sourceFilter="publicidad"
                exportId="sales-sheet-publicidad-over"
                forcedBrand="OVER"
              />
              <PlanillaPanel
                sales={sales} deletedSales={deletedSales}
                selectedDate={selectedDate} onDateChange={setSelectedDate}
                loadingSync={loadingSync} syncError={syncError}
                onDeleteSale={deleteSale} onRestoreSale={restoreSale} onHardDeleteSale={hardDeleteSale} onDuplicateSale={duplicateSale}
                profiles={profiles}
                currentUserName={vendedorName}
                title="Publicidad"
                sourceFilter="publicidad"
                exportId="sales-sheet-publicidad-brv"
                forcedBrand="BRV"
              />
            </>
          )}
        </div>
      </div>

      {/* Botones flotantes agrupados */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.25rem', zIndex: 900,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem',
      }}>
      <button
        onClick={() => setShowRiesgos(true)}
        title="Riesgos"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1rem', borderRadius: '50px',
          background: '#DC2626', color: '#fff',
          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
          boxShadow: '0 4px 16px rgba(220,38,38,0.45)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <AlertTriangle size={15} /> Riesgos
      </button>

      {/* Drawer Riesgos */}
      {showRiesgos && (
        <>
          <div
            onClick={() => setShowRiesgos(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
            width: 'min(620px, 95vw)',
            background: 'var(--surface)', borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
            overflowY: 'auto', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
                <AlertTriangle size={18} /> Riesgos
              </h2>
              <button
                onClick={() => setShowRiesgos(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--muted)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <RiesgosPanel />
          </div>
        </>
      )}

      <button
        onClick={() => setShowDudas(true)}
        title="Dudas de compra"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1rem', borderRadius: '50px',
          background: '#7C3AED', color: '#fff',
          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
          boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <HelpCircle size={15} /> Dudas de compra
      </button>

      {/* Drawer Dudas de compra */}
      {showDudas && (
        <>
          <div
            onClick={() => setShowDudas(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
            width: 'min(620px, 95vw)',
            background: 'var(--surface)', borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
            overflowY: 'auto', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
                <HelpCircle size={18} /> Dudas de compra
              </h2>
              <button
                onClick={() => setShowDudas(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--muted)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <DudasCompraPanel />
          </div>
        </>
      )}

      <button
        onClick={() => setShowHerramientas(true)}
        title="Herramientas"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1rem', borderRadius: '50px',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <Wrench size={15} /> Herramientas
      </button>
      </div>

      {/* Drawer Herramientas */}
      {showHerramientas && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowHerramientas(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
            width: 'min(680px, 95vw)',
            background: 'var(--surface)', borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
            overflowY: 'auto', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
                <Wrench size={18} /> Herramientas
              </h2>
              <button
                onClick={() => setShowHerramientas(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--muted)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <FrasesVentaPanel products={products} vendedorName={vendedorName} />
            <RespuestasPanel />
            <SeguimientoPanel />
          </div>
        </>
      )}

      {toast && (
        <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {toast.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {toast.msg}
          </span>
        </div>
      )}
    </>
  );
}
