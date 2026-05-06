import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type StockMap = Record<string, number>; // "PRODUCT|COLOR|SIZE" → qty_available

export interface StockInfo {
  stockMap: StockMap;
  getStock: (product: string, color: string, size: string) => number | null;
  loading: boolean;
  lastSync: Date | null;
  syncFromOdoo: () => Promise<{ ok: boolean; synced?: number; error?: string }>;
}

export function useStock(): StockInfo {
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadFromSupabase = useCallback(async () => {
    const { data } = await supabase
      .from('odoo_stock')
      .select('product_name, color, size, qty_available, synced_at')
      .order('synced_at', { ascending: false })
      .limit(1);

    if (data && data[0]?.synced_at) {
      setLastSync(new Date(data[0].synced_at));
    }

    const { data: rows } = await supabase
      .from('odoo_stock')
      .select('product_name, color, size, qty_available');

    if (!rows) return;
    const map: StockMap = {};
    for (const r of rows) {
      const key = `${(r.product_name || '').toUpperCase()}|${(r.color || '').toUpperCase()}|${(r.size || '').toUpperCase()}`;
      map[key] = r.qty_available ?? 0;
    }
    setStockMap(map);
  }, []);

  const syncFromOdoo = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-odoo-stock`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      const result = await resp.json();
      if (result.ok) {
        await loadFromSupabase();
        setLastSync(new Date());
      }
      return result as { ok: boolean; synced?: number; error?: string };
    } catch (e) {
      return { ok: false, error: String(e) };
    } finally {
      setLoading(false);
    }
  }, [loadFromSupabase]);

  const getStock = useCallback(
    (product: string, color: string, size: string): number | null => {
      if (!product || !color || !size) return null;
      const key = `${product.toUpperCase()}|${color.toUpperCase()}|${size.toUpperCase()}`;
      return key in stockMap ? stockMap[key] : null;
    },
    [stockMap],
  );

  // Al montar, leer stock ya cacheado en Supabase
  useEffect(() => {
    loadFromSupabase();
  }, []);

  return { stockMap, getStock, loading, lastSync, syncFromOdoo };
}
