import type { Sale, ClientData, CuentaData, Product } from '../types';
import type { DeliveryTab } from './pricing';
import type { BrandKey } from './brands';
import { formatTipoComboSheet, getProductString } from './outputFormatter';

export function buildSale(params: {
  clientData: ClientData;
  cuentaData: CuentaData;
  products: Product[];
  customComboName: string;
  tab: DeliveryTab;
  brand: BrandKey;
  totalPagar: number;
  VARIANTES_ACTIVOS: Record<string, unknown>;
  PRECIOS_ACTIVOS: Record<string, number>;
}): Sale {
  const { clientData, cuentaData, products, customComboName, tab, brand, totalPagar, VARIANTES_ACTIVOS, PRECIOS_ACTIVOS } = params;

  const now = new Date();
  const hora = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  let totalQty = 0;
  products.forEach(p => {
    if (p.colorLines && p.colorLines.length > 0) p.colorLines.forEach(cl => (totalQty += cl.qty));
    else totalQty += p.qty;
  });

  const isCompleto = cuentaData.tipo === 'completo';

  return {
    cel: clientData.celular,
    nom: clientData.nombre,
    dni: clientData.dni,
    hora,
    codigoPublicidad: clientData.codigoPublicidad || 'Live',
    marcaLabel: brand === 'bravos' ? 'BRV' : 'OVER',
    limaMark: tab === 'lima' ? 'X' : '',
    provMark: tab === 'prov' ? 'X' : '',
    separo: isCompleto ? '' : cuentaData.pago,
    resta: isCompleto ? '' : cuentaData.debe,
    pagoCompletoTxt: isCompleto ? totalPagar.toString() : '',
    metodoPago: cuentaData.tipo === 'contra' ? 'Contra entrega' : 'Pago completo',
    codigoYape: cuentaData.yape ?? '',
    combo: formatTipoComboSheet(products, customComboName, tab, VARIANTES_ACTIVOS, PRECIOS_ACTIVOS),
    qtyN: totalQty,
    totalTotal: totalPagar,
    sede:      tab === 'prov'  ? (clientData.sede     || '') : '',
    provincia: tab === 'prov'  ? (clientData.provincia || '') : '',
    depto:     tab === 'prov'  ? (clientData.depto     || '') : '',
    distrito:  tab === 'lima'  ? (clientData.distrito  || '') : '',
    ubicacion: tab === 'lima'  ? (clientData.ubicacion || '') : '',
    detalle: getProductString(products, customComboName, VARIANTES_ACTIVOS)
      .replace(/^\n\n- PRODUCTO -\n/, '').trim(),
  };
}
