// Importador Excel → Supabase (sheets_ventas)
// Uso: node scripts/importar-excel.js 1-9.xlsx
// Requiere: npm install xlsx @supabase/supabase-js

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Falta SUPABASE_URL o SUPABASE_KEY. Usa: SUPABASE_URL=... SUPABASE_KEY=... node scripts/importar-excel.cjs archivo.xlsx');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Parsear fecha "27/5/2026" → "2026-05-27" ────────────────────────
function parseFecha(val) {
  if (!val) return null;
  // Si xlsx ya lo convirtió a número de serie de Excel
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
  }
  // Formato dd/mm/yyyy
  const parts = String(val).split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return String(val);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2] || 'excelsubir.xlsx';
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  console.log(`Leyendo: ${absPath}`);
  const wb = XLSX.readFile(absPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  console.log(`Total filas encontradas: ${rows.length}`);

  // Mapear columnas Excel → columnas Supabase
  const registros = rows.map(r => ({
    id:             randomUUID(),
    fecha:          parseFecha(r['FECHA']),
    empresa:        String(r['EMPRESA'] || '').trim(),
    vendedor:       String(r['USER'] || '').trim(),
    cel:            String(r['CEL'] || '').trim(),
    lima_provincia: String(r['REGION'] || '').trim(),
    nombre_cliente: String(r['CLIENTE'] || '').trim(),
    celular:        String(r['CELULAR'] || '').trim(),
    dni:            String(r['DNI'] || '').trim(),
    monto_total:    r['FINAL'] !== '' ? String(r['FINAL']) : null,
    debe:           r['DEBE'] !== '' ? String(r['DEBE']) : null,
    sep:            r['SEP.'] !== '' ? String(r['SEP.']) : null,
    estado_pedido:  String(r['ESTADO DE PEDIDO'] || '').trim(),
  }));

  // Insertar en lotes de 100
  const BATCH = 100;
  let insertados = 0;
  let errores = 0;

  for (let i = 0; i < registros.length; i += BATCH) {
    const lote = registros.slice(i, i + BATCH);
    const { error } = await supabase.from('sheets_ventas').insert(lote);
    if (error) {
      console.error(`Error en lote ${i}–${i + BATCH}:`, error.message);
      errores += lote.length;
    } else {
      insertados += lote.length;
      console.log(`✓ ${insertados}/${registros.length} insertados`);
    }
  }

  console.log(`\nFinalizado: ${insertados} insertados, ${errores} con error.`);
}

main().catch(err => { console.error(err); process.exit(1); });
