import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, getAllSalesAdmin, getAllProfiles, anularVentaDB, updateVentaDB, ventaFromDBRaw, softDeleteVenta, restoreVentaDB } from '../lib/supabase';
import type { AdminSale, Profile, VendorStats } from '../types';
import type { VentaDB } from '../lib/supabase';

const today = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

const PAGE_SIZE = 50;

export function useAdmin() {
  const [allSales, setAllSales] = useState<AdminSale[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const profilesMapRef = useRef<Record<string, string>>({});

  const [exactDate, setExactDate] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('todas');
  const [brandFilter, setBrandFilter] = useState('todas');
  const [codPublicidad, setCodPublicidad] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [celFilter, setCelFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string[]>([]);
  const [metodoPagoFilter, setMetodoPagoFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);

  const effectiveDateFrom = exactDate || (monthFilter ? `${monthFilter}-01` : dateFrom);
  const effectiveDateTo = exactDate || (monthFilter ? `${monthFilter}-31` : dateTo);

  const loadData = async () => {
    setLoading(true);
    const profs = await getAllProfiles();
    const profilesMap: Record<string, string> = {};
    profs.forEach(p => { if (p.id) profilesMap[p.id] = p.full_name ?? p.id; });
    profilesMapRef.current = profilesMap;
    const sales = await getAllSalesAdmin(effectiveDateFrom, effectiveDateTo, profilesMap);
    setAllSales(sales);
    setProfiles(profs);
    setLoading(false);
    setPage(1);
  };

  useEffect(() => { loadData(); }, [effectiveDateFrom, effectiveDateTo]);

  // Suscripción Realtime — nuevas ventas llegan sin recargar
  useEffect(() => {
    const channel = supabase
      .channel('admin-ventas-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ventas' }, (payload) => {
        const row = payload.new as VentaDB;
        const vendorName = profilesMapRef.current[row.user_id ?? ''] ?? 'Desconocido';
        const newSale: AdminSale = { ...ventaFromDBRaw(row), vendorName, fecha: row.fecha ?? '' };
        setAllSales(prev => [newSale, ...prev]);
        setLiveCount(n => n + 1);
        setTimeout(() => setLiveCount(n => Math.max(0, n - 1)), 4000);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ventas' }, (payload) => {
        const row = payload.new as VentaDB & { anulado?: boolean };
        setAllSales(prev => prev.map(s =>
          s._dbId === row.id
            ? { ...s, ...ventaFromDBRaw(row), fecha: row.fecha ?? s.fecha, _anulado: row.anulado ?? false }
            : s
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getRegion = (s: AdminSale) => {
    if (s.limaMark === 'X') return 'Lima';
    if (s.provMark === 'X') return 'Provincia';
    return 'Almacén';
  };

  const getEstado = (s: AdminSale) => {
    if (s.metodoPago === 'Contra entrega') return 'CONTRA ENTREGA';
    if (s.metodoPago === 'Pago completo' || s.metodoPago === 'Yape Import Textil') return 'PAGO COMPLETO';
    return s.metodoPago?.toUpperCase() || '—';
  };

  const eliminatedSales = useMemo(() => allSales.filter(s => s._anulado), [allSales]);

  const filteredSales = useMemo(() => {
    let r = allSales.filter(s => !s._anulado);

    if (brandFilter !== 'todas') {
      const lbl = brandFilter.toUpperCase();
      r = r.filter(s => (s.marcaLabel || 'OVER').toUpperCase().includes(lbl));
    }
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.nom?.toLowerCase().includes(q) ||
        s.cel?.toLowerCase().includes(q) ||
        s.dni?.toLowerCase().includes(q) ||
        s.vendorName?.toLowerCase().includes(q) ||
        s.combo?.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== 'todas') r = r.filter(s => getRegion(s) === regionFilter);
    if (codPublicidad) r = r.filter(s => s.codigoPublicidad?.toLowerCase().includes(codPublicidad.toLowerCase()));
    if (vendorSearch) r = r.filter(s => s.vendorName?.toLowerCase().includes(vendorSearch.toLowerCase()));
    if (celFilter) r = r.filter(s => s.cel?.toLowerCase().includes(celFilter.toLowerCase()));
    if (estadoFilter.length > 0) r = r.filter(s => estadoFilter.includes(getEstado(s)));
    if (metodoPagoFilter !== 'todos') r = r.filter(s => s.metodoPago === metodoPagoFilter);

    return r;
  }, [allSales, brandFilter, search, regionFilter, codPublicidad, vendorSearch, celFilter, estadoFilter, metodoPagoFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedSales = filteredSales.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setSearch(''); setRegionFilter('todas'); setBrandFilter('todas'); setCodPublicidad('');
    setVendorSearch(''); setCelFilter(''); setEstadoFilter([]);
    setMetodoPagoFilter('todos'); setExactDate(''); setMonthFilter('');
    setDateFrom(firstOfMonth); setDateTo(today); setPage(1);
  };

  const globalStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((a, s) => a + (Number(s.totalTotal) || 0), 0);
    const totalItems = filteredSales.reduce((a, s) => a + (Number(s.qtyN) || 0), 0);
    const avgPerSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const deudaTotal = filteredSales.reduce((a, s) => {
      const v = parseFloat(s.resta || '0');
      return a + (isNaN(v) ? 0 : v);
    }, 0);
    return {
      salesCount: filteredSales.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalItems,
      avgPerSale: Math.round(avgPerSale * 100) / 100,
      deudaTotal: Math.round(deudaTotal * 100) / 100,
    };
  }, [filteredSales]);

  const vendorStats = useMemo((): VendorStats[] => {
    const map: Record<string, VendorStats> = {};
    filteredSales.forEach(s => {
      const name = s.vendorName;
      if (!map[name]) map[name] = { id: name, name, salesCount: 0, totalRevenue: 0, totalItems: 0, avgPerSale: 0 };
      map[name].salesCount += 1;
      map[name].totalRevenue += Number(s.totalTotal) || 0;
      map[name].totalItems += Number(s.qtyN) || 0;
    });
    return Object.values(map).map(v => ({
      ...v,
      totalRevenue: Math.round(v.totalRevenue * 100) / 100,
      avgPerSale: v.salesCount > 0 ? Math.round((v.totalRevenue / v.salesCount) * 100) / 100 : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  const brandStats = useMemo(() => {
    const map: Record<string, { label: string; count: number; revenue: number; items: number }> = {};
    filteredSales.forEach(s => {
      const label = (s.marcaLabel || 'OVER').toUpperCase();
      if (!map[label]) map[label] = { label, count: 0, revenue: 0, items: 0 };
      map[label].count++;
      map[label].revenue += Number(s.totalTotal) || 0;
      map[label].items += Number(s.qtyN) || 0;
    });
    return Object.values(map)
      .map(b => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const pubStats = useMemo(() => {
    const map: Record<string, { code: string; count: number; revenue: number; items: number }> = {};
    filteredSales.forEach(s => {
      const code = s.codigoPublicidad?.trim() || 'Sin código';
      if (!map[code]) map[code] = { code, count: 0, revenue: 0, items: 0 };
      map[code].count++;
      map[code].revenue += Number(s.totalTotal) || 0;
      map[code].items += Number(s.qtyN) || 0;
    });
    return Object.values(map)
      .map(b => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const salesByDay = useMemo((): [string, number][] => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => { if (s.fecha) map[s.fecha] = (map[s.fecha] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-30);
  }, [filteredSales]);

  const anularVenta = async (id: string) => {
    if (!id || !window.confirm('¿Anular esta venta?')) return;
    const ok = await anularVentaDB(id);
    if (ok) {
      setAllSales(prev => prev.map(s => s._dbId === id ? { ...s, metodoPago: 'Anulado' } : s));
    }
  };

  const eliminarVenta = async (id: string) => {
    if (!id || !window.confirm('¿Eliminar este registro? Quedará en la tabla de eliminados y podrás restaurarlo.')) return;
    const ok = await softDeleteVenta(id);
    if (ok) {
      setAllSales(prev => prev.map(s => s._dbId === id ? { ...s, _anulado: true } : s));
    }
  };

  const restaurarVenta = async (id: string) => {
    if (!id) return;
    const ok = await restoreVentaDB(id);
    if (ok) {
      setAllSales(prev => prev.map(s => s._dbId === id ? { ...s, _anulado: false } : s));
    }
  };

  const editSale = async (id: string, fields: Partial<Omit<VentaDB, 'id' | 'created_at' | 'user_id'>>): Promise<boolean> => {
    const ok = await updateVentaDB(id, fields);
    if (ok) {
      setAllSales(prev => prev.map(s => {
        if (s._dbId !== id) return s;
        return {
          ...s,
          nom: fields.nom ?? s.nom,
          cel: fields.cel ?? s.cel,
          dni: fields.dni ?? s.dni,
          hora: fields.hora ?? s.hora,
          fecha: fields.fecha ?? s.fecha,
          codigoPublicidad: fields.codigo_publicidad ?? s.codigoPublicidad,
          metodoPago: fields.metodo_pago ?? s.metodoPago,
          separo: fields.separo ?? s.separo,
          resta: fields.resta ?? s.resta,
          totalTotal: fields.total_total ?? s.totalTotal,
          combo: fields.combo ?? s.combo,
          marcaLabel: fields.marca_label ?? s.marcaLabel,
        };
      }));
    }
    return ok;
  };

  return {
    allSales, filteredSales, paginatedSales, profiles, loading,
    dateFrom, setDateFrom, dateTo, setDateTo,
    exactDate, setExactDate, monthFilter, setMonthFilter,
    search, setSearch,
    regionFilter, setRegionFilter,
    brandFilter, setBrandFilter,
    codPublicidad, setCodPublicidad,
    vendorSearch, setVendorSearch,
    celFilter, setCelFilter,
    estadoFilter, setEstadoFilter,
    metodoPagoFilter, setMetodoPagoFilter,
    showFilters, setShowFilters,
    page: safePage, setPage, totalPages,
    globalStats, vendorStats, brandStats, salesByDay, pubStats,
    liveCount,
    refresh: loadData, clearFilters,
    getRegion, getEstado, anularVenta, eliminarVenta, restaurarVenta, editSale,
    eliminatedSales,
  };
}
