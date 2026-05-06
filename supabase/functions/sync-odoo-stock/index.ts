import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ODOO_URL = Deno.env.get('ODOO_URL')!;
const ODOO_DB = Deno.env.get('ODOO_DB')!;
const ODOO_UID = parseInt(Deno.env.get('ODOO_UID') ?? '2');
const ODOO_API_KEY = Deno.env.get('ODOO_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

async function odooCall(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
  const body = {
    jsonrpc: '2.0', method: 'call', id: 1,
    params: {
      service: 'object', method: 'execute_kw',
      args: [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs],
    },
  };
  const resp = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

function parseDisplayName(displayName: string): { productName: string; color: string; size: string } | null {
  // "[OVER_REF0001] CAMISERO PIKE (Azul, S)" → productName:"CAMISERO PIKE", color:"Azul", size:"S"
  const cleaned = displayName.replace(/^\[.*?\]\s*/, '');
  const match = cleaned.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (!match) return null;
  const productName = match[1].trim().toUpperCase();
  const attrs = match[2].split(',').map((s: string) => s.trim());
  if (attrs.length < 2) return null;
  const color = attrs[0];
  const size = attrs[attrs.length - 1];
  return { productName, color, size };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Paginar hasta obtener todos los productos
    let offset = 0;
    const PAGE = 500;
    const allProducts: Array<{ default_code: string; display_name: string; qty_available: number }> = [];

    while (true) {
      const batch = await odooCall('product.product', 'search_read', [[]], {
        fields: ['default_code', 'display_name', 'qty_available'],
        limit: PAGE,
        offset,
      });
      allProducts.push(...batch);
      if (batch.length < PAGE) break;
      offset += PAGE;
    }

    // Solo OVER_REF y BRV_REF
    const rows = [];
    for (const p of allProducts) {
      const sku = p.default_code ?? '';
      if (!sku.includes('OVER_REF') && !sku.includes('BRV_REF')) continue;
      const parsed = parseDisplayName(p.display_name ?? '');
      if (!parsed) continue;
      rows.push({
        sku,
        product_name: parsed.productName,
        color: parsed.color,
        size: parsed.size,
        qty_available: p.qty_available ?? 0,
        synced_at: new Date().toISOString(),
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('odoo_stock').upsert(rows, { onConflict: 'sku' });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, synced: rows.length }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
