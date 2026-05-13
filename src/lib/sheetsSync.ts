import Papa from 'papaparse';
import { supabase } from './supabase';

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vToeKlxJPZG70MX_79oY8lbbI5VLTGUQBY2qROPoPgbva_SmS6jLw4a9bl88AsHTE9KZMap_5JWRgc3/pub?output=csv';

export interface SheetsVenta {
  id: string;
  fecha: string;
  empresa: string;
  vendedor: string;
  nombre_cliente: string;
  celular: string;
  dni: string;
  lima_provincia: string;
  monto_total: string;
  estado_pedido: string;
}

// Column indices (0-based) based on the header structure
// 0: Marca temporal, 1: EMPRESA, 2: VENDEDOR, 4: LIMA O PROVINCIA
// 5: NOMBRE DE CLIENTE, 6: NUMERO DE CELULAR, 7: DNI
// 17: MONTO TOTAL (brand1), 31: MONTO TOTAL (brand2), 47: MONTO TOTAL (brand3)
// 37: ESTADO DE PEDIDO, 57: ID
function rowToRecord(row: string[], index: number): SheetsVenta | null {
  const fecha = (row[0] ?? '').trim();
  if (!fecha.includes('2026')) return null;

  const celular = (row[6] ?? '').trim().replace(/\s+/g, '');
  if (!celular) return null;

  const idCol = (row[57] ?? '').trim();
  const id = idCol || `${celular}_${index}`;

  const monto = [row[17], row[31], row[47]].map(v => (v ?? '').trim()).find(v => v) ?? '';

  return {
    id,
    fecha,
    empresa: (row[1] ?? '').trim(),
    vendedor: (row[2] ?? '').trim(),
    nombre_cliente: (row[5] ?? '').trim(),
    celular,
    dni: (row[7] ?? '').trim(),
    lima_provincia: (row[4] ?? '').trim(),
    monto_total: monto,
    estado_pedido: (row[37] ?? '').trim(),
  };
}

export async function syncSheetsData(): Promise<{ ok: boolean; count: number; error?: string }> {
  return new Promise((resolve) => {
    Papa.parse(SHEETS_CSV_URL, {
      download: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as string[][];
          const records = rows
            .slice(1)
            .map((row, i) => rowToRecord(row, i + 1))
            .filter(Boolean) as SheetsVenta[];

          if (records.length === 0) {
            resolve({ ok: true, count: 0 });
            return;
          }

          const BATCH = 500;
          for (let i = 0; i < records.length; i += BATCH) {
            const { error } = await supabase
              .from('sheets_ventas')
              .upsert(records.slice(i, i + BATCH), { onConflict: 'id' });
            if (error) {
              resolve({ ok: false, count: i, error: error.message });
              return;
            }
          }
          resolve({ ok: true, count: records.length });
        } catch (e: any) {
          resolve({ ok: false, count: 0, error: e.message });
        }
      },
      error: (err: any) => resolve({ ok: false, count: 0, error: err.message }),
    });
  });
}
