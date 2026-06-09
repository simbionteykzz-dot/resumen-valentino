import { ENVIO_PROVINCIA_SOLES, ENVIO_LIMA_SOLES, POL_PRECIOS_OVERSHARK, POL_VARIANTES_OVERSHARK } from './data';
import { isSelvaAereo, ENVIO_AEREO_EXTRA } from './pricing';
import { FRASES_RESUMEN, RECOMENDACIONES_RESUMEN } from './boosters';
import { sumCatalogPolosSoles } from './pricing';
import type { ClientData, CuentaData, BoosterState, Product } from '../types';
import type { DeliveryTab } from './pricing';

export function getModelosEnPedido(products: Product[]): string[] {
  const seen = new Set<string>();
  products.forEach(p => {
    const tl = p.name.trim().toLowerCase();
    const canon = Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl);
    if (canon) seen.add(canon);
  });
  return Array.from(seen);
}

export function buildBoostersText(
  boosters: BoosterState,
  modelosEnPedido: string[],
): string {
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
  if (boosters.garantia) parts.push(`\n✅ *Calidad garantizada.* Si no quedas satisfecho con tu pedido, te buscamos solución`);
  if (boosters.referido) parts.push(`\n💬 *¿Tienes amigos que les guste la moda?* Recomiéndanos — tú y tu amigo ganan precio especial`);
  return parts.length > 0 ? `\n${parts.join('')}` : '';
}

export function buildCuentaBlock(cuentaData: CuentaData, tab: DeliveryTab, depto?: string): string {
  const texto = cuentaData.tipo === 'contra' ? 'Contra entrega' : 'Pago completo';
  const aereo = tab === 'prov' && isSelvaAereo(depto);
  const shippingValue =
    tab === 'prov' ? ENVIO_PROVINCIA_SOLES + (aereo ? ENVIO_AEREO_EXTRA : 0) :
    tab === 'lima' ? ENVIO_LIMA_SOLES : 0;
  const shippingLabel = aereo ? 'Envio Aéreo' : 'Envio';
  const shippingStr = shippingValue > 0 ? `\n${shippingLabel}: ${shippingValue}` : '';
  let block = `\n\n- PAGO -\nForma de pago: ${texto}`;
  block += shippingStr;
  if (cuentaData.pago) block += `\nPago: ${cuentaData.pago}`;
  if (cuentaData.debe) block += `\n\n- DEBE -\nDebe: ${cuentaData.debe}`;
  return block;
}

export function getProductString(
  products: Product[],
  customComboName: string,
  VARIANTES_ACTIVOS: Record<string, unknown>,
): string {
  if (products.length === 0 && customComboName.trim() === '') return '';
  const groups: Record<string, Product[]> = {};
  const groupOrder: string[] = [];
  const groupLabels: Record<string, string> = {};
  products.forEach(p => {
    const label = p.promoName || '';
    const key = p.promoInstance ? `${label}__${p.promoInstance}` : label;
    if (!groups[key]) { groups[key] = []; groupOrder.push(key); groupLabels[key] = label; }
    groups[key].push(p);
  });
  const finalBlocks: string[] = [];
  groupOrder.forEach(key => {
    const gName = groupLabels[key];
    const isCustom = gName !== '';
    const productLines: string[] = [];
    groups[key].forEach(p => {
      const sizePart = p.size ? ` (talla ${p.size})` : '';
      if (p.colorLines && p.colorLines.length > 0) {
        const subs: string[] = [];
        if (!isCustom) {
          let label = `*${p.name}`;
          if (p.qty > 1) { const itemTotal = POL_PRECIOS_OVERSHARK[p.name] || 0; label += ` ${p.qty} X ${itemTotal * p.qty}`; }
          productLines.push(`${label}*`);
          productLines.push(`- ${p.name}${sizePart}`);
        } else {
          productLines.push(`- ${p.name}${sizePart}`);
        }
        p.colorLines.forEach(cl => {
          let sub = '  - ' + cl.color.toUpperCase();
          if (cl.size) sub += ` talla ${cl.size}`;
          if (cl.qty !== 1) sub += ` × ${cl.qty}`;
          subs.push(sub);
        });
        productLines.push(subs.join('\n'));
      } else {
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
}

export function formatTipoComboSheet(
  products: Product[],
  customComboName: string,
  tab: DeliveryTab,
  VARIANTES_ACTIVOS: Record<string, unknown>,
  PRECIOS_ACTIVOS: Record<string, number>,
): string {
  const orderedNames: string[] = [];
  const seen: Record<string, boolean> = {};
  let totalQty = 0;
  products.forEach(p => {
    const tl = p.name.trim().toLowerCase();
    const canon = Object.keys(VARIANTES_ACTIVOS).find(k => k.toLowerCase() === tl) ?? null;
    const label = String(canon || p.name).toUpperCase().replace(/\s+/g, ' ').trim();
    if (label && !seen[label]) { seen[label] = true; orderedNames.push(label); }
    if (p.colorLines && p.colorLines.length > 0) p.colorLines.forEach(cl => (totalQty += cl.qty));
    else totalQty += p.qty;
  });
  if (totalQty < 1) return '';
  if (customComboName.trim() !== '') return `${totalQty} ${customComboName.trim()}`;
  const toInitials = (name: string) => name.split(' ').map(w => w[0]).join('');
  const initialsStr = orderedNames.map(toInitials).join(' ');
  if (tab === 'lima') {
    const out = `${totalQty} ${initialsStr}`.trim();
    return out.length > 320 ? out.slice(0, 317) + '...' : out;
  }
  const catSum = sumCatalogPolosSoles(products, PRECIOS_ACTIVOS, VARIANTES_ACTIVOS);
  const base = catSum > 0 ? catSum : 0;
  let priceStr = '';
  if (base > 0) priceStr = base % 1 === 0 ? String(Math.round(base)) : base.toFixed(2);
  let out = `${totalQty}${priceStr !== '' ? ' X ' + priceStr : ''} ${initialsStr}`.trim();
  return out.length > 320 ? out.slice(0, 317) + '...' : out;
}

export function buildOutputText(params: {
  tab: DeliveryTab;
  clientData: ClientData;
  cuentaData: CuentaData;
  products: Product[];
  customComboName: string;
  boosters: BoosterState;
  modelosEnPedido: string[];
  vendedorName: string;
  brand: 'overshark' | 'bravos';
  VARIANTES_ACTIVOS: Record<string, unknown>;
}): string {
  const { tab, clientData, cuentaData, products, customComboName, boosters, modelosEnPedido, vendedorName, brand, VARIANTES_ACTIVOS } = params;

  const brandTag = brand === 'bravos' ? 'BRAVOS' : 'OVERSHARK';
  const cadenitaStr = boosters.cadenitas <= 0 ? '' :
    boosters.cadenitas === 1 ? '\n\nCADENITA DE REGALO 🎁' :
    `\n\n${boosters.cadenitas} CADENITAS DE REGALO 🎁🎁`;

  const cuentaBlock = buildCuentaBlock(cuentaData, tab, clientData.depto);
  const productStr = getProductString(products, customComboName, VARIANTES_ACTIVOS);
  const boostersText = buildBoostersText(boosters, modelosEnPedido);
  const operacionStr = cuentaData.yape ? `\n\n🧾 CÓDIGO DE OPERACIÓN: ${cuentaData.yape}` : '';

  const pubStr = clientData.codigoPublicidad?.trim()
    ? `\n📣 Código: ${clientData.codigoPublicidad.trim()}`
    : '';

  let t = '';
  if (tab === 'prov') {
    t = `➖${brandTag} — DATOS PROVINCIA 🚌🚌\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n💳Numero DNI : ${clientData.dni}\n🗣️Provincia: ${clientData.provincia}\n😎 Departamento: ${clientData.depto}\n📌SEDE de agencia: *(${clientData.sede || 'Shalom'})*${pubStr}` +
      cuentaBlock + productStr + cadenitaStr + operacionStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}\n\n⏰ Te enviarán tu voucher entre 48 a 72 horas máximo` + boostersText;
  } else if (tab === 'lima') {
    t = `➖${brandTag} — DATOS DELIVERY 🏍️🏍️\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n💳Numero DNI : ${clientData.dni}\n😎 Distrito: ${clientData.distrito}\n📌Ubicacion: ${clientData.ubicacion}${pubStr}` +
      cuentaBlock + productStr + cadenitaStr + operacionStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}\n\n⏰ Los pedidos salen al día siguiente entre las 11 AM y a lo largo de la tarde/noche del día` + boostersText;
  } else {
    t = `➖${brandTag} — RECOJO EN ALMACÉN 🏭🏭\n🫵🏻Nombre: ${clientData.nombre}\n📲 Celular: ${clientData.celular}\n💳Numero DNI : ${clientData.dni}${pubStr}` +
      cuentaBlock + productStr + cadenitaStr + operacionStr + `\n\nVENDEDOR ${vendedorName.toUpperCase()}` + boostersText;
  }
  return t.replace(/\s+$/, '');
}
