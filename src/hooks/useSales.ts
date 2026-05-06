import { useState, useEffect } from 'react';
import { supabase, ventaToDB, ventaFromDB } from '../lib/supabase';
import type { Sale } from '../types';

export function useSales(
  userId: string | undefined,
  onToast: (msg: string, type: 'ok' | 'err') => void,
) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0],
  );
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadSales = async (date: string) => {
    setLoadingSync(true);
    setSyncError(null);
    try {
      if (!userId) { setSales([]); setLoadingSync(false); return; }
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('fecha', date)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const mapped = (data ?? []).map(ventaFromDB) as Sale[];
      setSales(mapped);
      localStorage.setItem('overshark_sales', JSON.stringify(mapped));
    } catch (err: any) {
      const msg = err.message ?? 'Error al cargar ventas';
      setSyncError(msg);
      onToast('Sin conexión — usando datos locales', 'err');
      try {
        setSales(JSON.parse(localStorage.getItem('overshark_sales') || '[]'));
      } catch {
        setSales([]);
      }
    } finally {
      setLoadingSync(false);
    }
  };

  useEffect(() => {
    loadSales(selectedDate);
  }, [selectedDate, userId]);

  const addSale = async (newSale: Sale) => {
    const newSales = [...sales, newSale];
    setSales(newSales);
    localStorage.setItem('overshark_sales', JSON.stringify(newSales));

    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('ventas')
      .insert(ventaToDB(newSale, today, userId));
    if (error) {
      setSyncError('Guardado localmente, fallo Supabase: ' + error.message);
      onToast('Guardado solo local — sin conexión', 'err');
    } else {
      onToast(`Venta #${newSales.length} registrada`, 'ok');
    }
  };

  const deleteSale = async (index: number) => {
    const sale = sales[index];
    const newSales = sales.filter((_, i) => i !== index);
    setSales(newSales);
    localStorage.setItem('overshark_sales', JSON.stringify(newSales));
    if (sale?._dbId) {
      const { error } = await supabase.from('ventas').delete().eq('id', sale._dbId);
      if (error) onToast('Eliminado localmente, fallo en servidor', 'err');
      else onToast('Venta eliminada', 'ok');
    } else {
      onToast('Venta eliminada', 'ok');
    }
  };

  return {
    sales,
    selectedDate,
    setSelectedDate,
    loadingSync,
    syncError,
    addSale,
    deleteSale,
  };
}
