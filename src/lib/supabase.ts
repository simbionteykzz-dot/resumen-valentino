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
  sede?: string;
  provincia?: string;
  depto?: string;
  distrito?: string;
  ubicacion?: string;
  detalle?: string;
  archived?: boolean;
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
    sede: sale.sede ?? '',
    provincia: sale.provincia ?? '',
    depto: sale.depto ?? '',
    distrito: sale.distrito ?? '',
    ubicacion: sale.ubicacion ?? '',
    detalle: sale.detalle ?? '',
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

export async function getAllSalesAdmin(dateFrom: string, dateTo: string, profilesMap?: Record<string, string>): Promise<AdminSale[]> {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .gte('fecha', dateFrom)
    .lte('fecha', dateTo)
    .neq('archived', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    ...ventaFromDBRaw(row),
    vendorName: profilesMap?.[row.user_id] ?? row.user_id ?? 'Desconocido',
    fecha: row.fecha ?? '',
    _anulado: row.anulado ?? false,
    _userId: row.user_id ?? '',
  })) as AdminSale[];
}

export async function getArchivedSalesAdmin(profilesMap?: Record<string, string>): Promise<AdminSale[]> {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('archived', true)
    .order('fecha', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    ...ventaFromDBRaw(row),
    vendorName: profilesMap?.[row.user_id] ?? row.user_id ?? 'Desconocido',
    fecha: row.fecha ?? '',
    _anulado: row.anulado ?? false,
    _userId: row.user_id ?? '',
    _archived: true,
  })) as AdminSale[];
}

export async function archivarTodasVentas(): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ archived: true })
    .neq('archived', true);
  if (error) console.error('[archivarTodasVentas]', error.message);
  return !error;
}

export async function archivarPorRango(desde: string, hasta: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ archived: true })
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .neq('archived', true);
  if (error) console.error('[archivarPorRango]', error.message);
  return !error;
}

export async function desarchivarTodasVentas(): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ archived: false })
    .eq('archived', true);
  if (error) console.error('[desarchivarTodasVentas]', error.message);
  return !error;
}

export async function transferSalesByDate(
  fromDate: string,
  toDate: string,
  userId?: string,
): Promise<{ ok: boolean; count: number; error?: string }> {
  let query = supabase.from('ventas').update({ fecha: toDate }).eq('fecha', fromDate);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.select('id');
  if (error) return { ok: false, count: 0, error: error.message };
  return { ok: true, count: (data ?? []).length };
}

export function ventaFromDBRaw(row: VentaDB): Sale {
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
    sede: row.sede ?? '',
    provincia: row.provincia ?? '',
    depto: row.depto ?? '',
    distrito: row.distrito ?? '',
    ubicacion: row.ubicacion ?? '',
    detalle: row.detalle ?? '',
    _dbId: row.id,
  };
}

export function ventaFromDB(row: VentaDB & { anulado?: boolean }): Sale & { _anulado?: boolean } {
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
    sede: row.sede ?? '',
    provincia: row.provincia ?? '',
    depto: row.depto ?? '',
    distrito: row.distrito ?? '',
    ubicacion: row.ubicacion ?? '',
    detalle: row.detalle ?? '',
    _dbId: row.id,
    _anulado: row.anulado ?? false,
  };
}

export async function anularVentaDB(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ metodo_pago: 'Anulado' })
    .eq('id', id);
  return !error;
}

export async function updateVentaDB(id: string, fields: Partial<Omit<VentaDB, 'id' | 'created_at'>>): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update(fields)
    .eq('id', id);
  return !error;
}

export async function softDeleteVenta(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ anulado: true })
    .eq('id', id);
  if (error) console.error('[softDeleteVenta]', error.code, error.message);
  return !error;
}

export async function restoreVentaDB(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ anulado: false })
    .eq('id', id);
  return !error;
}

// ── Planillas ──────────────────────────────────────────────────────

export interface LibroPlanilla {
  id: string;
  nombre: string;
  created_at: string;
}

export interface HojaPlanilla {
  id: string;
  libro_id: string;
  nombre: string;
  marca: string;
  fecha_desde: string;
  fecha_hasta: string;
  datos: Record<string, unknown>[];
  created_at: string;
}

export async function getLibros(): Promise<LibroPlanilla[]> {
  const { data, error } = await supabase
    .from('libros_planilla')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as LibroPlanilla[];
}

export async function createLibro(nombre: string): Promise<LibroPlanilla | null> {
  const { data, error } = await supabase
    .from('libros_planilla')
    .insert({ nombre })
    .select()
    .single();
  if (error || !data) return null;
  return data as LibroPlanilla;
}

export async function deleteLibro(id: string): Promise<boolean> {
  const { error } = await supabase.from('libros_planilla').delete().eq('id', id);
  return !error;
}

export async function getHojas(libro_id: string): Promise<HojaPlanilla[]> {
  const { data, error } = await supabase
    .from('hojas_planilla')
    .select('*')
    .eq('libro_id', libro_id)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as HojaPlanilla[];
}

export async function createHoja(
  libro_id: string,
  nombre: string,
  marca: string,
  fecha_desde: string,
  fecha_hasta: string,
  datos: Record<string, unknown>[]
): Promise<HojaPlanilla | null> {
  const { data, error } = await supabase
    .from('hojas_planilla')
    .insert({ libro_id, nombre, marca, fecha_desde, fecha_hasta, datos })
    .select()
    .single();
  if (error || !data) return null;
  return data as HojaPlanilla;
}

export async function deleteHoja(id: string): Promise<boolean> {
  const { error } = await supabase.from('hojas_planilla').delete().eq('id', id);
  return !error;
}

export async function restoreVenta(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ anulado: false })
    .eq('id', id);
  return !error;
}

export async function updateVentaUser(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ventas')
    .update({ user_id: userId })
    .eq('id', id);
  return !error;
}

// ── ATC ────────────────────────────────────────────────────────────

export interface ATCTicket {
  id?: string;
  created_at?: string;
  updated_at?: string;
  atc_user_id?: string;
  cliente_cel: string;
  cliente_nom: string;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  venta_id?: string;
  notas?: string;
  ntv?: string;
  fecha_emision?: string;
  fecha_venta?: string;
  fecha_atencion?: string;
  region?: string;
  responsable?: string;
  solicitud?: string;
  solucion?: string;
  estado_pedido?: string;
  empresa?: string;
  tipo?: string;
  monto?: number;
  fecha_cierre?: string;
}

export interface CustomerBasic {
  cel: string;
  nom: string;
  dni: string;
}

export async function searchCustomers(query: string): Promise<CustomerBasic[]> {
  const q = query.trim();
  if (!q) return [];
  const { data } = await supabase
    .from('ventas')
    .select('cel, nom, dni')
    .or(`cel.ilike.%${q}%,nom.ilike.%${q}%,dni.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(120);
  const seen = new Set<string>();
  return (data ?? []).filter((r: any) => {
    if (seen.has(r.cel)) return false;
    seen.add(r.cel);
    return true;
  }) as CustomerBasic[];
}

export async function getCustomerVentas(cel: string): Promise<(VentaDB & { anulado?: boolean })[]> {
  const { data } = await supabase
    .from('ventas')
    .select('*')
    .eq('cel', cel)
    .order('fecha', { ascending: false });
  return (data ?? []) as (VentaDB & { anulado?: boolean })[];
}

export async function getATCTickets(): Promise<ATCTicket[]> {
  const { data, error } = await supabase
    .from('atc_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as ATCTicket[];
}

export async function createATCTicket(
  ticket: Omit<ATCTicket, 'id' | 'created_at' | 'updated_at'>,
  userId?: string,
): Promise<ATCTicket | null> {
  const { data, error } = await supabase
    .from('atc_tickets')
    .insert({ ...ticket, atc_user_id: userId })
    .select()
    .single();
  if (error) { console.error('[createATCTicket]', error.message); return null; }
  return data as ATCTicket;
}

export async function updateATCTicket(id: string, fields: Partial<ATCTicket>): Promise<boolean> {
  const { error } = await supabase
    .from('atc_tickets')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('[updateATCTicket]', error.message);
  return !error;
}

export async function deleteATCTicket(id: string): Promise<boolean> {
  const { error } = await supabase.from('atc_tickets').delete().eq('id', id);
  return !error;
}

// ── Metas de Vendedores ────────────────────────────────────────────

export interface VendorGoal {
  id?: string;
  vendor_id: string;
  meta_ingresos: number;
  meta_ventas: number;
  updated_at?: string;
}

export async function getVendorGoals(): Promise<VendorGoal[]> {
  const { data, error } = await supabase.from('vendor_goals').select('*');
  if (error || !data) return [];
  return data as VendorGoal[];
}

export async function upsertVendorGoal(goal: Pick<VendorGoal, 'vendor_id' | 'meta_ingresos' | 'meta_ventas'>): Promise<boolean> {
  const { error } = await supabase
    .from('vendor_goals')
    .upsert({ ...goal, updated_at: new Date().toISOString() }, { onConflict: 'vendor_id' });
  if (error) console.error('[upsertVendorGoal]', error.message);
  return !error;
}

// ── Sheets Ventas ──────────────────────────────────────────────────

export interface SheetsVentaDB {
  id: string;
  fecha?: string;
  empresa?: string;
  vendedor?: string;
  cel?: string;
  nombre_cliente?: string;
  celular?: string;
  dni?: string;
  lima_provincia?: string;
  monto_total?: string;
  debe?: string;
  sep?: string;
  estado_pedido?: string;
}

export async function searchSheetsCustomers(query: string): Promise<CustomerBasic[]> {
  const q = query.trim();
  if (!q) return [];
  const { data } = await supabase
    .from('sheets_ventas')
    .select('nombre_cliente, celular, dni')
    .or(`celular.ilike.%${q}%,nombre_cliente.ilike.%${q}%,dni.ilike.%${q}%`)
    .order('fecha', { ascending: false })
    .limit(60);
  const seen = new Set<string>();
  return (data ?? []).filter((r: any) => {
    if (seen.has(r.celular)) return false;
    seen.add(r.celular);
    return true;
  }).map((r: any) => ({ cel: r.celular ?? '', nom: r.nombre_cliente ?? '', dni: r.dni ?? '' }));
}

export async function getCustomerSheetsVentas(celular: string): Promise<SheetsVentaDB[]> {
  const { data } = await supabase
    .from('sheets_ventas')
    .select('*')
    .eq('celular', celular)
    .order('fecha', { ascending: false });
  return (data ?? []) as SheetsVentaDB[];
}

export async function getSheetsVentasAdmin(dateFrom: string, dateTo: string): Promise<SheetsVentaDB[]> {
  const { data, error } = await supabase
    .from('sheets_ventas')
    .select('*')
    .gte('fecha', dateFrom)
    .lte('fecha', dateTo)
    .order('fecha', { ascending: false });
  if (error) console.error('[getSheetsVentasAdmin]', error.message);
  return (data ?? []) as SheetsVentaDB[];
}

// ── Descuentos ATC ─────────────────────────────────────────────────

export interface ATCDescuento {
  id?: string;
  created_at?: string;
  fecha: string;
  nota_venta?: string;
  dni?: string;
  telefono?: string;
  nombre_cliente: string;
  descripcion: string;
  descuento: number;
  responsable?: string;
  atc_user_id?: string;
}

export async function getATCDescuentos(): Promise<ATCDescuento[]> {
  const { data, error } = await supabase
    .from('atc_descuentos')
    .select('*')
    .order('fecha', { ascending: false });
  if (error || !data) return [];
  return data as ATCDescuento[];
}

export async function createATCDescuento(
  descuento: Omit<ATCDescuento, 'id' | 'created_at'>,
): Promise<ATCDescuento | null> {
  const { data, error } = await supabase
    .from('atc_descuentos')
    .insert(descuento)
    .select()
    .single();
  if (error) { console.error('[createATCDescuento]', error.message); return null; }
  return data as ATCDescuento;
}

export async function deleteATCDescuento(id: string): Promise<boolean> {
  const { error } = await supabase.from('atc_descuentos').delete().eq('id', id);
  return !error;
}

export async function updateATCDescuento(id: string, fields: Partial<ATCDescuento>): Promise<boolean> {
  const { error } = await supabase.from('atc_descuentos').update(fields).eq('id', id);
  return !error;
}
