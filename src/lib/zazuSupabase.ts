import { createClient } from '@supabase/supabase-js';

const zazuUrl = import.meta.env.VITE_ZAZU_SUPABASE_URL as string;
const zazuKey = import.meta.env.VITE_ZAZU_SUPABASE_ANON_KEY as string;

export const zazuSupabase = createClient(zazuUrl, zazuKey);

export type ZazuFuente = 'Lima' | 'Shalom' | 'Olva' | 'Marvisur';

export interface ZazuEnvio {
  ntv: string;
  fuente: ZazuFuente;
  fecha: string;
  empresa: string;
  nombre: string;
  dni: string;
  numero: string;
  ubicacion: string;
  estado: string;
  guia?: string;
  monto_cobrar: string;
  agencia?: string;
}

function buildFilter(q: string) {
  const isNumeric = /^\d+$/.test(q.trim());
  return isNumeric
    ? `dni.eq.${q.trim()},numero.ilike.%${q.trim()}%`
    : `nombre.ilike.%${q.trim()}%,dni.eq.${q.trim()}`;
}

async function searchLima(q: string): Promise<ZazuEnvio[]> {
  const { data } = await zazuSupabase
    .from('tb_envios_lima')
    .select('id,fecha,empresa,nombre,numero,dni,distrito,estado_despacho,monto_cobrar')
    .or(buildFilter(q))
    .order('fecha', { ascending: false })
    .limit(30);
  return (data ?? []).map((r: any) => ({
    ntv: r.id ?? '',
    fuente: 'Lima' as ZazuFuente,
    fecha: r.fecha ?? '',
    empresa: r.empresa ?? '',
    nombre: r.nombre ?? '',
    dni: r.dni ?? '',
    numero: r.numero ?? '',
    ubicacion: r.distrito ?? '',
    estado: r.estado_despacho ?? '—',
    monto_cobrar: r.monto_cobrar ?? '',
  }));
}

async function searchShalom(q: string): Promise<ZazuEnvio[]> {
  const { data } = await zazuSupabase
    .from('tb_envios_shalom')
    .select('id_venta,fecha,empresa,nombre,numero,dni,departamento,provincia,distrito,estado,guia,monto_cobrar,agencia')
    .or(buildFilter(q))
    .order('fecha', { ascending: false })
    .limit(30);
  return (data ?? []).map((r: any) => ({
    ntv: r.id_venta ?? '',
    fuente: 'Shalom' as ZazuFuente,
    fecha: r.fecha ?? '',
    empresa: r.empresa ?? '',
    nombre: r.nombre ?? '',
    dni: r.dni ?? '',
    numero: r.numero ?? '',
    ubicacion: [r.distrito, r.provincia, r.departamento].filter(Boolean).join(', '),
    estado: r.estado ?? '—',
    guia: r.guia ?? undefined,
    monto_cobrar: r.monto_cobrar ?? '',
    agencia: r.agencia ?? undefined,
  }));
}

async function searchOlva(q: string): Promise<ZazuEnvio[]> {
  const { data } = await zazuSupabase
    .from('tb_envios_olva')
    .select('id_venta,fecha,empresa,nombre,numero,dni,departamento,provincia,distrito,estado,guia,monto_cobrar,agencia')
    .or(buildFilter(q))
    .order('fecha', { ascending: false })
    .limit(30);
  return (data ?? []).map((r: any) => ({
    ntv: r.id_venta ?? '',
    fuente: 'Olva' as ZazuFuente,
    fecha: r.fecha ?? '',
    empresa: r.empresa ?? '',
    nombre: r.nombre ?? '',
    dni: r.dni ?? '',
    numero: r.numero ?? '',
    ubicacion: [r.distrito, r.provincia, r.departamento].filter(Boolean).join(', '),
    estado: r.estado ?? '—',
    guia: r.guia ?? undefined,
    monto_cobrar: r.monto_cobrar ?? '',
    agencia: r.agencia ?? undefined,
  }));
}

async function searchMarvisur(q: string): Promise<ZazuEnvio[]> {
  const { data } = await zazuSupabase
    .from('tb_envios_marvisur')
    .select('id_venta,fecha,empresa,nombre,numero,dni,departamento,provincia,distrito,estado,guia,monto_cobrar,agencia')
    .or(buildFilter(q))
    .order('fecha', { ascending: false })
    .limit(30);
  return (data ?? []).map((r: any) => ({
    ntv: r.id_venta ?? '',
    fuente: 'Marvisur' as ZazuFuente,
    fecha: r.fecha ?? '',
    empresa: r.empresa ?? '',
    nombre: r.nombre ?? '',
    dni: r.dni ?? '',
    numero: r.numero ?? '',
    ubicacion: [r.distrito, r.provincia, r.departamento].filter(Boolean).join(', '),
    estado: r.estado ?? '—',
    guia: r.guia ?? undefined,
    monto_cobrar: r.monto_cobrar ?? '',
    agencia: r.agencia ?? undefined,
  }));
}

export async function searchZazuEnvios(query: string): Promise<ZazuEnvio[]> {
  const q = query.trim();
  if (!q) return [];
  const [lima, shalom, olva, marvisur] = await Promise.all([
    searchLima(q),
    searchShalom(q),
    searchOlva(q),
    searchMarvisur(q),
  ]);
  return [...lima, ...shalom, ...olva, ...marvisur].sort(
    (a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''),
  );
}
