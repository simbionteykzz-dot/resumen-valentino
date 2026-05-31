export interface ClientData {
  nombre: string;
  celular: string;
  dni: string;
  provincia: string;
  depto: string;
  sede: string;
  ubicacion: string;
  distrito: string;
  codigoPublicidad: string;
}

export interface CuentaData {
  tipo: string;
  pago: string;
  debe: string;
}

export interface ColorLine {
  color: string;
  qty: number;
}

export interface Product {
  name: string;
  qty: number;
  size?: string;
  colorLines?: ColorLine[];
  promoName?: string;
  promoInstance?: string;
  promoPricePerUnit?: number;
}

export interface Sale {
  cel: string;
  nom: string;
  dni: string;
  hora: string;
  codigoPublicidad: string;
  marcaLabel: string;
  limaMark: string;
  provMark: string;
  separo: string;
  resta: string;
  pagoCompletoTxt: string;
  metodoPago: string;
  combo: string;
  qtyN: number;
  totalTotal: number;
  // Destino
  sede?: string;
  provincia?: string;
  depto?: string;
  distrito?: string;
  ubicacion?: string;
  // Detalle completo con colores y tallas
  detalle?: string;
  _dbId?: string;
}

export interface BoosterState {
  cadenitas: number;
  urgencia: boolean;
  socialProof: boolean;
  recomendacion: boolean;
  descuento: boolean;
  fraseVenta: boolean;
  garantia: boolean;
  referido: boolean;
}

export interface ToastState {
  msg: string;
  type: 'ok' | 'err';
  leaving: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'vendedor' | 'atc';
}

export interface AdminSale extends Sale {
  vendorName: string;
  fecha: string;
  _anulado?: boolean;
  _userId?: string;
  _fromSheets?: boolean;
}

export interface VendorStats {
  id: string;
  name: string;
  salesCount: number;
  totalRevenue: number;
  totalItems: number;
  avgPerSale: number;
}

export interface EditForm {
  nom: string;
  cel: string;
  dni: string;
  hora: string;
  fecha: string;
  codigo_publicidad: string;
  metodo_pago: string;
  separo: string;
  resta: string;
  total_total: string;
  combo: string;
  marca_label: string;
  user_id: string;
}
