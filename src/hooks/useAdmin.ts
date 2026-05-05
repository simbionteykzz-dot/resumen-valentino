import { useState, useEffect, useMemo } from 'react';
import { getAllSalesAdmin, getAllProfiles } from '../lib/supabase';
import type { AdminSale, Profile, VendorStats } from '../types';

const today = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

export function useAdmin() {
  const [allSales, setAllSales] = useState<AdminSale[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [vendorFilter, setVendorFilter] = useState<string>('todos');

  const loadData = async () => {
    setLoading(true);
    const [sales, profs] = await Promise.all([
      getAllSalesAdmin(dateFrom, dateTo),
      getAllProfiles(),
    ]);
    setAllSales(sales);
    setProfiles(profs);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [dateFrom, dateTo]);

  const filteredSales = useMemo(() =>
    vendorFilter === 'todos'
      ? allSales
      : allSales.filter(s => s.vendorName === vendorFilter),
    [allSales, vendorFilter],
  );

  const globalStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((a, s) => a + (Number(s.totalTotal) || 0), 0);
    const totalItems = filteredSales.reduce((a, s) => a + (Number(s.qtyN) || 0), 0);
    const avgPerSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    return {
      salesCount: filteredSales.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalItems,
      avgPerSale: Math.round(avgPerSale * 100) / 100,
    };
  }, [filteredSales]);

  const vendorStats = useMemo((): VendorStats[] => {
    const map: Record<string, VendorStats> = {};
    allSales.forEach(s => {
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
  }, [allSales]);

  return {
    allSales,
    filteredSales,
    profiles,
    loading,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    vendorFilter, setVendorFilter,
    globalStats,
    vendorStats,
    refresh: loadData,
  };
}
