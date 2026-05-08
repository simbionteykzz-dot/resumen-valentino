import { useState, useEffect } from 'react';
import { supabase, ventaToDB, ventaFromDB, softDeleteVenta, restoreVenta } from '../lib/supabase';
import type { Sale } from '../types';

export function useSales(
  userId: string | undefined,
  onToast: (msg: string, type: 'ok' | 'err') => void,
) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [deletedSales, setDeletedSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0],
  );
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadSales = async (date: string) => {
    setLoadingSync(true);
    setSyncError(null);
    try {
      if (!userId) { setSales([]); setDeletedSales([]); setLoadingSync(false); return; }
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('fecha', date)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const all = (data ?? []).map(ventaFromDB) as Sale[];
      const active = all.filter((s: any) => !s._anulado);
      const deleted = all.filter((s: any) => s._anulado);
      setSales(active);
      setDeletedSales(deleted);
      localStorage.setItem('overshark_sales', JSON.stringify(active));
    } catch (err: any) {
      const msg = err.message ?? 'Error al cargar ventas';
      setSyncError(msg);
      onToast('Sin conexión — usando datos locales', 'err');
      try {
        setSales(JSON.parse(localStorage.getItem('overshark_sales') || '[]'));
        setDeletedSales([]);
      } catch {
        setSales([]);
        setDeletedSales([]);
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
      const ok = await softDeleteVenta(sale._dbId);
      if (ok) {
        setDeletedSales(prev => [...prev, { ...sale, _anulado: true } as any]);
        onToast('Venta eliminada', 'ok');
      } else {
        // Restore local state since Supabase failed
        setSales(prev => {
          const restored = [...prev];
          restored.splice(index, 0, sale);
          return restored;
        });
        localStorage.setItem('overshark_sales', JSON.stringify(sales));
        onToast('Error al eliminar — revisa consola del navegador', 'err');
      }
    } else {
      onToast('Venta eliminada', 'ok');
    }
  };

  const restoreSale = async (dbId: string) => {
    const sale = deletedSales.find((s: any) => s._dbId === dbId);
    if (!sale) return;
    const ok = await restoreVenta(dbId);
    if (ok) {
      setDeletedSales(prev => prev.filter((s: any) => s._dbId !== dbId));
      const restored = { ...sale } as any;
      delete restored._anulado;
      setSales(prev => [...prev, restored]);
      localStorage.setItem('overshark_sales', JSON.stringify([...sales, restored]));
      onToast('Venta restaurada', 'ok');
    } else {
      onToast('Error al restaurar', 'err');
    }
  };

  return {
    sales,
    deletedSales,
    selectedDate,
    setSelectedDate,
    loadingSync,
    syncError,
    addSale,
    deleteSale,
    restoreSale,
  };
}
