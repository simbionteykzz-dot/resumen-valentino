import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import { useSales } from './hooks/useSales';
import AppHeader from './components/layout/AppHeader';
import ClientePanel from './components/panels/ClientePanel';
import CuentaPanel from './components/panels/CuentaPanel';
import ProductosPanel from './components/panels/ProductosPanel';
import OutputPanel from './components/panels/OutputPanel';
import PlanillaPanel from './components/panels/PlanillaPanel';
import CierreCajaPanel from './components/panels/CierreCajaPanel';
import FrasesVentaPanel from './components/panels/FrasesVentaPanel';
import BoostersPanel from './components/panels/BoostersPanel';
import RespuestasPanel from './components/panels/RespuestasPanel';
import NegociacionPanel from './components/panels/NegociacionPanel';
import RankingPanel from './components/panels/RankingPanel';
import SeguimientoPanel from './components/panels/SeguimientoPanel';
import AdminDashboard from './components/panels/AdminDashboard';
import { Trash2, Store, Bike, Package, Truck, BarChart3, Wrench } from 'lucide-react';
import { POL_PRECIOS_OVERSHARK, ENVIO_PROVINCIA_SOLES, ENVIO_LIMA_SOLES, POL_VARIANTES_OVERSHARK, BRV_PRECIOS, BRV_VARIANTES } from './lib/data';
import { FRASES_RESUMEN, RECOMENDACIONES_RESUMEN } from './lib/boosters';
import { getProfile, getAllProfiles } from './lib/supabase';
import type { ClientData, CuentaData, BoosterState, ToastState, Sale, Profile } from './types';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminMode, setAdminMode] = useState<'admin' | 'vendedor'>('admin');
  const [brand, setBrand] = useState<'overshark' | 'bravos'>('overshark');
  const isBravos = brand === 'bravos';
  const PRECIOS_ACTIVOS = isBravos ? BRV_PRECIOS : POL_PRECIOS_OVERSHARK;
  const VARIANTES_ACTIVOS = isBravos ? BRV_VARIANTES : POL_VARIANTES_OVERSHARK;

  useEffect(() => {
    const r = document.documentElement.style;
    if (isBravos) {
      /* Warm Orange / Peach palette — Bravos */
      r.setProperty('--accent',       '#EB7347');
      r.setProperty('--accent2',      '#c85a30');
      r.setProperty('--accent-glow',  'rgba(235,115,71,.18)');
      r.setProperty('--accent-soft',  'rgba(235,115,71,.09)');
      r.setProperty('--ok',           '#EB7347');
      r.setProperty('--ok-soft',      'rgba(235,115,71,.12)');
      r.setProperty('--bg',           '#FFF8F0');
      r.setProperty('--bg2',          '#FAE9D5');
      r.setProperty('--surface',      '#FFFFFF');
      r.setProperty('--surface2',     '#FFF5EC');
      r.setProperty('--surface3',     '#FFEDD5');
      r.setProperty('--border',       'rgba(235,115,71,.3)');
      r.setProperty('--border2',      'rgba(200,90,48,.25)');
      r.setProperty('--text',         '#5c2a14');
      r.setProperty('--text2',        '#3d1a0a');
      r.setProperty('--muted',        '#b07040');
      r.setProperty('--muted2',       '#FDAC68');
    } else {
      /* Sage Green palette — Overshark (Sea Glass + Desired Collection) */
      r.setProperty('--accent',       '#45834D');
      r.setProperty('--accent2',      '#3a6d42');
      r.setProperty('--accent-glow',  'rgba(69,131,77,.18)');
      r.setProperty('--accent-soft',  'rgba(69,131,77,.09)');
      r.setProperty('--ok',           '#45834D');
      r.setProperty('--ok-soft',      'rgba(69,131,77,.12)');
      r.setProperty('--bg',           '#EAF5EE');
      r.setProperty('--bg2',          '#DDEEE3');
      r.setProperty('--surface',      '#FFFFFF');
      r.setProperty('--surface2',     '#F2FBF5');
      r.setProperty('--surface3',     '#E5F4EA');
      r.setProperty('--border',       'rgba(104,168,119,.4)');
      r.setProperty('--border2',      'rgba(81,120,97,.35)');
      r.setProperty('--text',         '#2a4433');
      r.setProperty('--text2',        '#162e20');
      r.setProperty('--muted',        '#517861');
      r.setProperty('--muted2',       '#68A877');
    }
  }, [isBravos]);

  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (user?.id) getProfile(user.id).then(setProfile);
  }, [user?.id]);

  useEffect(() => {
    if (user) getAllProfiles().then(setProfiles);
  }, [user?.id]);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type, leaving: false });
    setTimeout(() => setToast(prev => prev ? { ...prev, leaving: true } : null), 2700);
    setTimeout(() => setToast(null), 3000);
  };

  const { sales, deletedSales, selectedDate, setSelectedDate, loadingSync, syncError, addSale, deleteSale, restoreSale } =
    useSales(user?.id, showToast);

  const [tab, setTab] = useState<'prov' | 'lima' | 'almacen'>('prov');
  const [clientData, setClientData] = useState<ClientData>({
    nombre: '', celular: '', dni: '', provincia: '', depto: '',
    sede: 'Shalom', ubicacion: '', distrito: '', codigoPublicidad: 'Live',
  });
  const [cuentaData, setCuentaData] = useState<CuentaData>({ tipo: 'contra', pago: '', debe: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [customComboName, setCustomComboName] = useState('');
  const [promoPrice, setPromoPrice] = useState<string | number>('');
  const [boosters, setBoosters] = useState<BoosterState>({
    cadenitas: 1, urgencia: false, socialProof: false,
    recomendacion: false, descuento: false, fraseVenta: true,
  });
  const [bottomTab, setBottomTab] = useState<'registro' | 'herramientas'>('registro');
  const [metaDiaria, setMetaDiaria] = useState<number>(
    () => parseInt(localStorage.getItem('overshark_meta') || '20'),
  );

  const handleBoosterChange = (field: string, value: any) =>
    setBoosters(prev => ({ ...prev, [field]: value }));

  const handleClientChange = (field: keyof ClientData, value: string) =>
    setClientData(prev => ({ ...prev, [field]: value }));

  const handleCuentaChange = (field: string, value: string) =>
    setCuentaData(prev => ({ ...prev, [field]: value }));

  const clearAll = () => {
    setClientData({ nombre: '', celular: '', dni: '', provincia: '', depto: '', sede: 'Shalom', ubicacion: '', distrito: '', codigoPublicidad: 'Live' });
    setCuentaData({ tipo: 'contra', pago: '', debe: '' });
    setProducts([]);
    setCustomComboName('');
    setPromoPrice('');
    setBoosters(prev => ({ ...prev, cadenitas: 1 }));
  };

  const modelosEnPedido = useMemo(() => {
    const seen = new Set<string>();
    products.forEach(p => {
      const tl = p.name.trim().toLowerCase();
      const canon = Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl);
      if (canon) seen.add(canon);
    });
    return Array.from(seen);
  }, [products]);

  const buildBoostersText = () => {
    const parts: string[] = [];
    if (boosters.fraseVenta && modelosEnPedido.length > 0) {
      const modelo = modelosEnPedido[0];
      const frases = FRASES_RESUMEN[modelo];
      if (frases) {
        const idx = Math.floor(Date.now() / 60000) % frases.length;
        parts.push(`\n💬 ${frases[idx]}`);
      }
    }
    if (boosters.urgencia) parts.push(`\n⚡ *¡Últimas unidades a este precio!* No dejes pasar esta oportunidad`);
    if (boosters.socialProof) parts.push(`\n🔥 +500 clientes satisfechos esta semana — ¡Únete a la familia Overshark!`);
    if (boosters.recomendacion && modelosEnPedido.length > 0) {
      const recs = RECOMENDACIONES_RESUMEN[modelosEnPedido[0]];
      if (recs?.length) parts.push(`\n🛍️ *¿Ya conoces nuestro ${recs[0]}?* Combina perfecto con tu pedido — ¡pregúntame!`);
    }
    if (boosters.descuento) parts.push(`\n🎯 *En tu próxima compra tienes precio especial.* ¡Guarda este chat!`);
    return parts.length > 0 ? `\n${parts.join('')}` : '';
  };

  const getShippingCost = () => {
    if (tab === 'prov') return ENVIO_PROVINCIA_SOLES;
    if (tab === 'lima') return ENVIO_LIMA_SOLES;
    return 0;
  };

  const sumCatalogPolosSoles = () => {
    let sum = 0;
    products.forEach(p => {
      const qty = p.colorLines?.length > 0 ? p.colorLines.reduce((s: number, cl: any) => s + cl.qty, 0) : p.qty;
      if (p.promoName && p.promoPricePerUnit != null) {
        sum += p.promoPricePerUnit * qty;
      } else {
        const tl = p.name.trim().toLowerCase();
        const canon = Object.keys(VARIANTES_ACTIVOS).find(k => k.toLowerCase() === tl) || null;
        let unit = canon && PRECIOS_ACTIVOS[canon] != null ? Number(PRECIOS_ACTIVOS[canon]) : 0;
        if (isNaN(unit) || unit < 0) unit = 0;
        sum += unit * qty;
      }
    });
    return Math.round(sum * 100) / 100;
  };

  const parseMoneyPE = (raw: string) => {
    if (!raw) return NaN;
    let s = raw.trim().replace(/^S\//i, '').replace(/\s/g, '');
    if (/^[-+]?\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  };

  const calcularTotalPagar = () => {
    const total = sumCatalogPolosSoles() + getShippingCost();
    if (total === 0 && products.length === 0 && (!promoPrice || Number(promoPrice) <= 0)) return 0;
    return Math.max(0, Math.round(total * 100) / 100);
  };

  const totalPagar = calcularTotalPagar();

  useEffect(() => {
    if (cuentaData.tipo === 'completo' || cuentaData.tipo === 'yape') {
      setCuentaData(prev => ({ ...prev, debe: '0' }));
    } else if (cuentaData.pago && totalPagar > 0) {
      const pagoN = parseMoneyPE(cuentaData.pago);
      if (!isNaN(pagoN)) {
        const d = totalPagar - pagoN;
        setCuentaData(prev => ({ ...prev, debe: (d < 0 ? 0 : d).toString() }));
      }
    } else if (!cuentaData.pago && products.length > 0) {
      setCuentaData(prev => ({ ...prev, debe: totalPagar.toString() }));
    } else if (products.length === 0) {
      setCuentaData(prev => ({ ...prev, debe: '' }));
    }
  }, [products, promoPrice, tab, cuentaData.pago, cuentaData.tipo]);

  const buildCuentaBlock = () => {
    const texto = cuentaData.tipo === 'contra' ? 'Contra entrega' : cuentaData.tipo === 'yape' ? 'Yape Import Textil' : 'Pago completo';
    const shippingValue = tab === 'prov' ? ENVIO_PROVINCIA_SOLES : (tab === 'lima' ? ENVIO_LIMA_SOLES : 0);
    const shippingStr = shippingValue > 0 ? `\nEnvio: ${shippingValue}` : '';
    let block = `\n\n- PAGO -\nForma de pago: ${texto}`;
    block += shippingStr;
    if (cuentaData.pago) block += `\nPago: ${cuentaData.pago}`;
    if (cuentaData.debe) block += `\n\n- DEBE -\nDebe: ${cuentaData.debe}`;
    return block;
  };

  const getProductString = () => {
    if (products.length === 0 && customComboName.trim() === '') return '';
    const groups: Record<string, any[]> = {};
    const groupOrder: string[] = [];
    products.forEach(p => {
      const pName = p.promoName || '';
      if (!groups[pName]) { groups[pName] = []; groupOrder.push(pName); }
      groups[pName].push(p);
    });
    const finalBlocks: string[] = [];
    groupOrder.forEach(gName => {
      const isCustom = gName !== '';
      let groupTotalQty = 0;
      const productLines: string[] = [];
      groups[gName].forEach((p: any) => {
        const sizePart = p.size ? ` (talla ${p.size})` : '';
        if (p.colorLines?.length > 0) {
          const subs: string[] = [];
          if (!isCustom) {
            let label = `*${p.name}`;
            if (p.qty > 1) { const itemTotal = POL_PRECIOS_OVERSHARK[p.name] || 0; label += ` ${p.qty} X ${itemTotal * p.qty}`; }
            productLines.push(`${label}*`);
            productLines.push(`- ${p.name}${sizePart}`);
          } else {
            productLines.push(`- ${p.name}${sizePart}`);
          }
          p.colorLines.forEach((cl: any) => {
            groupTotalQty += cl.qty;
            let sub = '  - ' + cl.color.toUpperCase();
            if (cl.qty !== 1) sub += ` × ${cl.qty}`;
            subs.push(sub);
          });
          productLines.push(subs.join('\n'));
        } else {
          groupTotalQty += p.qty;
          if (isCustom) {
            if (p.name && p.name !== gName) productLines.push(`- ${p.qty}x ${p.name}${sizePart} (sin color)`);
            else productLines.push(`- ${p.qty} prendas${sizePart} (sin color)`);
          } else {
            let label = `*${p.name}`;
            if (p.qty > 1) { const itemTotal = POL_PRECIOS_OVERSHARK[p.name] || 0; label += ` ${p.qty} X ${itemTotal * p.qty}`; }
            productLines.push(`${label}${sizePart}*`);
          }
        }
      });
      const groupBlocks = [];
      if (isCustom) groupBlocks.push(`*${gName}*`);
      groupBlocks.push(...productLines);
      finalBlocks.push(groupBlocks.join('\n'));
    });
    if (finalBlocks.length === 0 && customComboName.trim() !== '') finalBlocks.push(`*${customComboName.trim()}*`);
    return '\n\n- PRODUCTO -\n' + finalBlocks.join('\n\n') + '\n';
  };

  const emailPrefix = user?.email?.split('@')[0] || 'VENDEDOR';
  const vendedorName = ((user?.user_metadata?.full_name || user?.user_metadata?.name || emailPrefix) as string).toUpperCase();

  const cadenitaStr = boosters.cadenitas <= 0 ? '' : boosters.cadenitas === 1
    ? '\n\nCADENITA DE REGALO 🎁'
    : `\n\n${boosters.cadenitas} CADENITAS DE REGALO 🎁🎁`;

  const boostersText = buildBoostersText();

  const brandTag = isBravos ? 'BRAVOS' : 'OVERSHARK';
  const outputStr = (() => {
    let t = '';
    if (tab === 'prov') {
      t = `➖${brandTag} — DATOS PROVINCIA 🚌🚌\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n💳Numero DNI : ${clientData.dni}\n🗣️Provincia: ${clientData.provincia}\n😎 Departamento: ${clientData.depto}\n📌SEDE de agencia: *(${clientData.sede || 'Shalom'})*` +
        buildCuentaBlock() + getProductString() + cadenitaStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}\n\n⏰ Te enviarán tu voucher entre 48 a 72 horas máximo` + boostersText;
    } else if (tab === 'lima') {
      t = `➖${brandTag} — DATOS DELIVERY 🏍️🏍️\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n😎 Distrito: ${clientData.distrito}\n📌Ubicacion: ${clientData.ubicacion}` +
        buildCuentaBlock() + getProductString() + cadenitaStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}\n\n⏰ Los pedidos salen al día siguiente entre las 11 AM y a lo largo de la tarde/noche del día` + boostersText;
    } else {
      t = `➖${brandTag} — RECOJO EN ALMACÉN 🏭🏭\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n💳Numero DNI : ${clientData.dni}` +
        buildCuentaBlock() + getProductString() + cadenitaStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}` + boostersText;
    }
    return t.replace(/\s+$/, '');
  })();

  const formatTipoComboSheet = () => {
    const orderedNames: string[] = [];
    const seen: Record<string, boolean> = {};
    let totalQty = 0;
    products.forEach(p => {
      const tl = p.name.trim().toLowerCase();
      const canon = Object.keys(VARIANTES_ACTIVOS).find(k => k.toLowerCase() === tl) || null;
      const label = String(canon || p.name).toUpperCase().replace(/\s+/g, ' ').trim();
      if (label && !seen[label]) { seen[label] = true; orderedNames.push(label); }
      if (p.colorLines?.length > 0) p.colorLines.forEach((cl: any) => totalQty += cl.qty);
      else totalQty += p.qty;
    });
    if (totalQty < 1) return '';
    if (customComboName.trim() !== '') return `${totalQty} ${customComboName.trim()}`;
    const toInitials = (name: string) => name.split(' ').map((w: string) => w[0]).join('');
    const initialsStr = orderedNames.map(toInitials).join(' ');
    if (tab === 'lima') {
      const out = `${totalQty} ${initialsStr}`.trim();
      return out.length > 320 ? out.slice(0, 317) + '...' : out;
    }
    const catSum = sumCatalogPolosSoles();
    const base = catSum > 0 ? catSum : 0;
    let priceStr = '';
    if (base > 0) priceStr = base % 1 === 0 ? String(Math.round(base)) : base.toFixed(2);
    let out = `${totalQty}${priceStr !== '' ? ' X ' + priceStr : ''} ${initialsStr}`.trim();
    return out.length > 320 ? out.slice(0, 317) + '...' : out;
  };

  const handlePushSale = () => {
    if (!clientData.celular && !clientData.nombre) return;
    if (clientData.celular) {
      const dup = sales.find(s => s.cel === clientData.celular);
      if (dup) {
        const ok = window.confirm(
          `⚠️ Ya hay una venta registrada hoy para el celular ${clientData.celular}${dup.nom ? ` (${dup.nom})` : ''}.\n\n¿Registrar de todas formas?`
        );
        if (!ok) return;
      }
    }

    const now = new Date();
    const hora = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let totalQty = 0;
    products.forEach(p => {
      if (p.colorLines?.length > 0) p.colorLines.forEach((cl: any) => totalQty += cl.qty);
      else totalQty += p.qty;
    });
    const isCompleto = cuentaData.tipo === 'completo' || cuentaData.tipo === 'yape';
    const newSale: Sale = {
      cel: clientData.celular,
      nom: clientData.nombre,
      dni: clientData.dni,
      hora,
      codigoPublicidad: clientData.codigoPublicidad || 'Live',
      marcaLabel: isBravos ? 'BRV' : 'OVER',
      limaMark: tab === 'lima' ? 'X' : '',
      provMark: tab === 'prov' ? 'X' : '',
      separo: isCompleto ? '' : cuentaData.pago,
      resta: isCompleto ? '' : cuentaData.debe,
      pagoCompletoTxt: isCompleto ? totalPagar.toString() : '',
      metodoPago: cuentaData.tipo === 'contra' ? 'Contra entrega' : cuentaData.tipo === 'yape' ? 'Yape Import Textil' : 'Pago completo',
      combo: formatTipoComboSheet(),
      qtyN: totalQty,
      totalTotal: totalPagar,
      sede: tab === 'prov' ? (clientData.sede || '') : '',
      provincia: tab === 'prov' ? (clientData.provincia || '') : '',
      depto: tab === 'prov' ? (clientData.depto || '') : '',
      distrito: tab === 'lima' ? (clientData.distrito || '') : '',
      ubicacion: tab === 'lima' ? (clientData.ubicacion || '') : '',
      detalle: getProductString().replace(/^\n\n- PRODUCTO -\n/, '').trim(),
    };
    addSale(newSale);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={18} style={{ color: '#45834D' }} /> Cargando...
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (profile?.role === 'admin' && adminMode === 'admin') {
    return (
      <>
        <AdminDashboard
          adminName={vendedorName}
          profiles={[]}
          onSignOut={signOut}
          onSwitchToVendedor={() => setAdminMode('vendedor')}
        />
        {toast && (
          <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
            {toast.type === 'ok' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}
      </>
    );
  }

  const totalSoles = sales.reduce((a: number, s: any) => a + (Number(s.totalTotal) || 0), 0);

  return (
    <>
      <div className="wrap" style={{ maxWidth: '1140px', margin: '0 auto' }}>
        {profile?.role === 'admin' && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setAdminMode('admin')} style={{ background: 'rgba(69,131,77,0.1)', border: '1px solid rgba(104,168,119,0.35)', borderRadius: '8px', color: '#45834D', cursor: 'pointer', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ← Volver al Panel Admin
            </button>
          </div>
        )}
        <AppHeader
          salesCount={sales.length}
          totalSoles={totalSoles}
          metaDiaria={metaDiaria}
          onMetaChange={v => { setMetaDiaria(v); localStorage.setItem('overshark_meta', String(v)); }}
          userName={vendedorName}
          onSignOut={signOut}
          brand={brand}
        />

        {/* ── Selector de marca ── */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
          {([
            {
              id: 'overshark', label: 'OVERSHARK', sub: 'Polos & Camiseros', tag: 'Colección activa',
              icon: '/over-icon.png', color: '#45834D', colorDim: '#3a6d42',
              grad: 'linear-gradient(135deg, #f2fbf5, #e5f4ea)',
              gradActive: 'linear-gradient(135deg, #ddeee3, #cfe8d6)',
              glow: 'rgba(69,131,77,0.18)', border: 'rgba(104,168,119,.55)',
            },
            {
              id: 'bravos', label: 'BRAVOS', sub: 'Poleras & Pantalones', tag: 'Colección activa',
              icon: '/brav-icon.png', color: '#EB7347', colorDim: '#c85a30',
              grad: 'linear-gradient(135deg, #fff8f0, #faebd7)',
              gradActive: 'linear-gradient(135deg, #faebd7, #fdd9b5)',
              glow: 'rgba(235,115,71,0.18)', border: 'rgba(235,115,71,.3)',
            },
          ] as const).map(b => {
            const active = brand === b.id;
            return (
              <button
                key={b.id}
                onClick={() => { setBrand(b.id); setProducts([]); setCustomComboName(''); setPromoPrice(''); }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  border: `2px solid ${active ? b.color : b.border}`,
                  background: active ? b.gradActive : b.grad,
                  outline: 'none',
                  minWidth: '230px',
                  boxShadow: active ? `0 6px 28px ${b.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
                  flex: 1,
                  maxWidth: '300px',
                }}
              >
                {/* Glow blob activo */}
                {active && (
                  <div style={{
                    position: 'absolute', top: '-30px', right: '-20px',
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: b.color, opacity: 0.12, filter: 'blur(30px)',
                    pointerEvents: 'none',
                  }} />
                )}
                {/* Icono */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: active ? `linear-gradient(135deg, ${b.color}33, ${b.color}11)` : `${b.color}11`,
                  border: `1.5px solid ${active ? b.color + '55' : b.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? `0 4px 16px ${b.glow}` : 'none',
                }}>
                  <img src={b.icon} alt={b.label} style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
                </div>
                {/* Texto */}
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: active ? b.color : '#6b7280', letterSpacing: '0.06em', lineHeight: 1 }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: active ? (b.id === 'bravos' ? '#FFA85D' : '#68A877') : '#6a7a68', marginTop: '3px', fontWeight: 500 }}>
                    {b.sub}
                  </div>
                  {active && (
                    <div style={{ marginTop: '5px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${b.color}22`, border: `1px solid ${b.color}44`, borderRadius: '20px', padding: '2px 8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: b.color }} />
                      <span style={{ fontSize: '0.65rem', color: b.color, fontWeight: 700, letterSpacing: '0.04em' }}>ACTIVO</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="tabs-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border2)', paddingBottom: '1rem' }}>
          <div className="tabs" style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', borderRadius: '40px', padding: '6px', border: '1px solid var(--surface3)' }}>
            {([
              { id: 'prov', label: 'Provincia (Shalom)', icon: <Package size={16} /> },
              { id: 'lima', label: 'Delivery Lima', icon: <Bike size={16} /> },
              { id: 'almacen', label: 'Recojo almacén', icon: <Store size={16} /> },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ borderRadius: '30px', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', outline: 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button className="btn-borrar-todo" onClick={clearAll} title="Borra todos los datos de golpe" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '40px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 700, cursor: 'pointer' }}>
            <Trash2 size={16} /> Borrar todo
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)', gap: '1.75rem', alignItems: 'start' }}>
          <div>
            <ClientePanel tab={tab} data={clientData} onChange={handleClientChange} />
            <CuentaPanel data={cuentaData} onChange={handleCuentaChange} totalPagar={totalPagar} />
            <BoostersPanel boosters={boosters} onChange={handleBoosterChange} productCount={products.length} />
          </div>
          <div>
            <ProductosPanel products={products} setProducts={setProducts} customComboName={customComboName} setCustomComboName={setCustomComboName} promoPrice={promoPrice} setPromoPrice={setPromoPrice} brand={brand} />
            <OutputPanel outputText={outputStr} onAddSale={handlePushSale} clientCelular={clientData.celular} clientNombre={clientData.nombre} />
          </div>
        </div>

        {/* ── Sección inferior con tabs ── */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--surface2)', borderRadius: '40px', padding: '6px', border: '1px solid var(--surface3)', width: 'fit-content', marginBottom: '1.5rem' }}>
            {([
              { id: 'registro', label: 'Registro de Ventas', icon: <BarChart3 size={16} /> },
              { id: 'herramientas', label: 'Herramientas', icon: <Wrench size={16} /> },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setBottomTab(t.id)} style={{ borderRadius: '30px', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, background: bottomTab === t.id ? 'var(--accent)' : 'transparent', color: bottomTab === t.id ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', outline: 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {bottomTab === 'registro' && (
            <>
              <CierreCajaPanel sales={sales} />
              <RankingPanel sales={sales} />
              <PlanillaPanel sales={sales} deletedSales={deletedSales} selectedDate={selectedDate} onDateChange={setSelectedDate} loadingSync={loadingSync} syncError={syncError} onDeleteSale={deleteSale} onRestoreSale={restoreSale} profiles={profiles} />
            </>
          )}

          {bottomTab === 'herramientas' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '1.5rem' }}>
                <FrasesVentaPanel products={products} />
                <NegociacionPanel products={products} />
              </div>
              <RespuestasPanel />
              <SeguimientoPanel />
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
          {toast.type === 'ok' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </>
  );
}
