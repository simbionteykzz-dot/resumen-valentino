import { ENVIO_PROVINCIA_SOLES, ENVIO_LIMA_SOLES } from './data';
import type { Product } from '../types';

export type DeliveryTab = 'prov' | 'lima' | 'almacen';

export const ENVIO_AEREO_EXTRA = 6;

const _normDep = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const SELVA_AEREO_DEPTOS = ['loreto', 'madre de dios', 'ucayali'];

export function isSelvaAereo(depto?: string): boolean {
  if (!depto) return false;
  return SELVA_AEREO_DEPTOS.includes(_normDep(depto));
}

export function parseMoneyPE(raw: string): number {
  if (!raw) return NaN;
  let s = raw.trim().replace(/^S\//i, '').replace(/\s/g, '');
  if (/^[-+]?\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

export function getShippingCost(tab: DeliveryTab, depto?: string): number {
  if (tab === 'prov') return ENVIO_PROVINCIA_SOLES + (isSelvaAereo(depto) ? ENVIO_AEREO_EXTRA : 0);
  if (tab === 'lima') return ENVIO_LIMA_SOLES;
  return 0;
}

export function sumCatalogPolosSoles(
  products: Product[],
  PRECIOS_ACTIVOS: Record<string, number>,
  VARIANTES_ACTIVOS: Record<string, unknown>,
): number {
  let sum = 0;
  products.forEach(p => {
    const qty = p.colorLines && p.colorLines.length > 0
      ? p.colorLines.reduce((s, cl) => s + cl.qty, 0)
      : p.qty;
    if (p.promoName && p.promoPricePerUnit != null) {
      sum += p.promoPricePerUnit * qty;
    } else {
      const tl = p.name.trim().toLowerCase();
      const canon = Object.keys(VARIANTES_ACTIVOS).find(k => k.toLowerCase() === tl) ?? null;
      let unit = canon && PRECIOS_ACTIVOS[canon] != null ? Number(PRECIOS_ACTIVOS[canon]) : 0;
      if (isNaN(unit) || unit < 0) unit = 0;
      sum += unit * qty;
    }
  });
  return Math.round(sum * 100) / 100;
}

export function calcularTotalPagar(
  products: Product[],
  tab: DeliveryTab,
  PRECIOS_ACTIVOS: Record<string, number>,
  VARIANTES_ACTIVOS: Record<string, unknown>,
  depto?: string,
): number {
  const total = sumCatalogPolosSoles(products, PRECIOS_ACTIVOS, VARIANTES_ACTIVOS) + getShippingCost(tab, depto);
  if (total === 0 && products.length === 0) return 0;
  return Math.max(0, Math.round(total * 100) / 100);
}

export function calcularDebe(
  tipo: string,
  pago: string,
  totalPagar: number,
  productCount: number,
): string {
  if (tipo === 'completo') return '0';
  if (pago) {
    const pagoN = parseMoneyPE(pago);
    if (!isNaN(pagoN)) {
      const d = totalPagar - pagoN;
      return (d < 0 ? 0 : d).toString();
    }
  }
  if (!pago && productCount > 0) return totalPagar.toString();
  return '';
}
