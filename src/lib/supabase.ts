import { createClient } from '@supabase/supabase-js';
import type { Sale, Profile, AdminSale } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export interface VentaDB {
  id?: string;
  created_at?: string;
  fecha?: string;
  user_id?: string;
  cel: string;
  nom: string;
  dni: string;
  hora: string;
  codigo_publicidad: string;
  marca_label: string;
  lima_mark: string;
  prov_mark: string;
  separo: string;
  resta: string;
  pago_completo_txt: string;
  metodo_pago: string;
  combo: string;
  qty_n: number;
  total_total: number;
}

export function ventaToDB(
  sale: Sale,
  fecha: string,
  userId?: string,
): Omit<VentaDB, 'id' | 'created_at'> {
  return {
    fecha,
    user_id: userId,
    cel: sale.cel ?? '',
    nom: sale.nom ?? '',
    dni: sale.dni ?? '',
    hora: sale.hora ?? '',
    codigo_publicidad: sale.codigoPublicidad ?? '',
    marca_label: sale.marcaLabel ?? '',
    lima_mark: sale.limaMark ?? '',
    prov_mark: sale.provMark ?? '',
    separo: sale.separo ?? '',
    resta: sale.resta ?? '',
    pago_completo_txt: sale.pagoCompletoTxt ?? '',
    metodo_pago: sale.metodoPago ?? '',
    combo: sale.combo ?? '',
    qty_n: sale.qtyN ?? 0,
    total_total: sale.totalTotal ?? 0,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single();
  return data as Profile | null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name');
  return (data ?? []) as Profile[];
}

export async function getAllSalesAdmin(dateFrom: string, dateTo: string): Promise<AdminSale[]> {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, profiles(full_name)')
    .gte('fecha', dateFrom)
    .lte('fecha', dateTo)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    ...ventaFromDBRaw(row),
    vendorName: row.profiles?.full_name ?? 'Desconocido',
    fecha: row.fecha ?? '',
  })) as AdminSale[];
}

function ventaFromDBRaw(row: VentaDB): Sale {
  return {
    cel: row.cel,
    nom: row.nom,
    dni: row.dni,
    hora: row.hora,
    codigoPublicidad: row.codigo_publicidad,
    marcaLabel: row.marca_label,
    limaMark: row.lima_mark,
    provMark: row.prov_mark,
    separo: row.separo,
    resta: row.resta,
    pagoCompletoTxt: row.pago_completo_txt,
    metodoPago: row.metodo_pago,
    combo: row.combo,
    qtyN: row.qty_n,
    totalTotal: row.total_total,
    _dbId: row.id,
  };
}

export function ventaFromDB(row: VentaDB): Sale {
  return {
    cel: row.cel,
    nom: row.nom,
    dni: row.dni,
    hora: row.hora,
    codigoPublicidad: row.codigo_publicidad,
    marcaLabel: row.marca_label,
    limaMark: row.lima_mark,
    provMark: row.prov_mark,
    separo: row.separo,
    resta: row.resta,
    pagoCompletoTxt: row.pago_completo_txt,
    metodoPago: row.metodo_pago,
    combo: row.combo,
    qtyN: row.qty_n,
    totalTotal: row.total_total,
    _dbId: row.id,
  };
}
