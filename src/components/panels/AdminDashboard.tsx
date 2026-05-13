import { useRef, useState, Fragment } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LogOut, RefreshCw, Filter, Search, Download, X, BarChart3, ShoppingBag, DollarSign, Package, AlertTriangle, Pencil, FileDown, Trash2, RotateCcw, ChevronDown, ChevronUp, Archive, History, ArrowRightLeft } from 'lucide-react';
import PlanillasPanel from './PlanillasPanel';
import MetasPanel from './MetasPanel';
import type { Profile, AdminSale, EditForm } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCodigoProducto } from '../../lib/data';

interface AdminDashboardProps {
  adminName: string;
  profiles: Profile[];
  onSignOut: () => void;
  onSwitchToVendedor: () => void;
  onSwitchToATC?: () => void;
}


function saleToForm(s: AdminSale): EditForm {
  return {
    nom: s.nom ?? '', cel: s.cel ?? '', dni: s.dni ?? '', hora: s.hora ?? '',
    fecha: s.fecha ?? '', codigo_publicidad: s.codigoPublicidad ?? '',
    metodo_pago: s.metodoPago ?? '', separo: s.separo ?? '',
    resta: s.resta ?? '', total_total: String(s.totalTotal ?? ''),
    combo: s.combo ?? '', marca_label: s.marcaLabel ?? '',
    user_id: s._userId ?? '',
  };
}

export default function AdminDashboard({ adminName, onSignOut, onSwitchToVendedor, onSwitchToATC }: AdminDashboardProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Modal de confirmación ──
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'danger' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // ── Toggle de columnas ──
  const ALL_COLS = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PROD', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'] as const;
  type ColName = typeof ALL_COLS[number];
  const [hiddenCols, setHiddenCols] = useState<Set<ColName>>(new Set(['HORA', 'DNI', 'SEPARO', 'COD. PROD', 'COD. PUBLICIDAD']));
  const [showColPicker, setShowColPicker] = useState(false);
  const toggleCol = (col: ColName) => setHiddenCols(prev => { const n = new Set(prev); n.has(col) ? n.delete(col) : n.add(col); return n; });
  const [pubCollapsed, setPubCollapsed] = useState(true);
  const [cpCollapsed, setCpCollapsed] = useState(true);
  const visible = (col: ColName) => !hiddenCols.has(col);

  const {
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
    page, setPage, totalPages,
    globalStats, vendorStats, brandStats, salesByDay, pubStats, cpStats,
    liveCount,
    refresh, clearFilters,
    getRegion, getEstado, anularVenta, eliminarVenta, restaurarVenta, editSale,
    eliminatedSales,
    showArchived, setShowArchived,
    archivedSales, archiveLoading,
    loadArchivedSales, archivarTodo, desarchivarTodo,
    transferDates,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'ventas' | 'planillas' | 'metas'>('ventas');

  // ── Traspaso de fechas ──
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferVendor, setTransferVendor] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferMsg, setTransferMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [historyClient, setHistoryClient] = useState<{ nom: string; cel: string } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const clientHistory = historyClient
    ? allSales.filter(s => s.cel === historyClient.cel).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
    : [];

  const exportClientPDF = () => {
    if (!historyClient || clientHistory.length === 0) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mg = 14;

    // ── Top accent stripe ──────────────────────────────────────────────
    doc.setFillColor(18, 50, 30);
    doc.rect(0, 0, W, 4, 'F');

    // ── Header band ───────────────────────────────────────────────────
    doc.setFillColor(22, 52, 33);
    doc.rect(0, 4, W, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 190, 145);
    doc.text('Historial de Cliente', mg, 23);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(historyClient.nom.toUpperCase(), mg, 31.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 175, 135);
    doc.text(historyClient.cel, mg, 38);

    doc.setFontSize(6.5);
    doc.setTextColor(75, 130, 100);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, W - mg, 38, { align: 'right' });

    // ── KPI boxes ─────────────────────────────────────────────────────
    const totalRevenue = clientHistory.reduce((a, s) => a + (Number(s.totalTotal) || 0), 0);
    const totalDeuda   = clientHistory.reduce((a, s) => { const v = parseFloat(s.resta || '0'); return a + (isNaN(v) ? 0 : v); }, 0);
    const kpis = [
      { label: 'COMPRAS',   value: String(clientHistory.length),       rgb: [55, 120, 65]  as [number, number, number] },
      { label: 'TOTAL S/',  value: `S/${totalRevenue.toLocaleString()}`, rgb: [25, 120, 170] as [number, number, number] },
      { label: 'DEUDA S/',  value: `S/${totalDeuda.toFixed(0)}`,         rgb: totalDeuda > 0 ? [185, 55, 55] as [number, number, number] : [85, 140, 100] as [number, number, number] },
    ];
    const boxW = (W - mg * 2 - 8) / 3;
    kpis.forEach((k, i) => {
      const x = mg + i * (boxW + 4);
      doc.setFillColor(232, 246, 237);
      doc.roundedRect(x, 50, boxW, 24, 2.5, 2.5, 'F');
      doc.setDrawColor(...k.rgb);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, 50, boxW, 24, 2.5, 2.5, 'S');
      doc.setFillColor(...k.rgb);
      doc.roundedRect(x, 50, boxW, 3, 1.5, 1.5, 'F');
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...k.rgb);
      doc.text(k.label, x + boxW / 2, 59, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 52, 33);
      doc.text(k.value, x + boxW / 2, 70, { align: 'center' });
    });

    // ── Table ─────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: 82,
      head: [['FECHA', 'COMBO', 'MARCA', 'VENDEDOR', 'TOTAL S/', 'ESTADO', 'DEBE']],
      body: clientHistory.map(s => {
        const estado = getEstado(s);
        return [
          s.fecha ?? '—',
          (s.combo ?? 'Sin detalle').substring(0, 40),
          s.marcaLabel || 'OVER',
          s.vendorName ?? '—',
          `S/${s.totalTotal ?? 0}`,
          estado,
          s.resta && parseFloat(s.resta) > 0 ? `S/${s.resta}` : '—',
        ];
      }),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        textColor: [38, 62, 48],
        lineColor: [185, 215, 195],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [22, 52, 33],
        textColor: [140, 210, 160],
        fontStyle: 'bold',
        fontSize: 7.5,
        lineColor: [38, 85, 52],
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: [240, 248, 243] },
      bodyStyles: { fillColor: [248, 253, 250] },
      columnStyles: {
        4: { textColor: [35, 115, 55], fontStyle: 'bold' },
        5: { fontStyle: 'bold' },
        6: { textColor: [175, 50, 50] },
      },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 5) return;
        const v = String(data.cell.raw);
        if (v === 'PAGO COMPLETO')    data.cell.styles.textColor = [32, 115, 50];
        else if (v === 'CONTRA ENTREGA') data.cell.styles.textColor = [160, 95, 10];
        else if (v === 'ANULADO')     data.cell.styles.textColor = [180, 48, 48];
      },
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        doc.setFillColor(18, 50, 30);
        doc.rect(0, H - 7, W, 7, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 170, 130);
        doc.text(`Livex Agency · ${historyClient.nom} · ${historyClient.cel}`, mg, H - 2.5);
        doc.text(`Página ${data.pageNumber} de ${totalPages}`, W - mg, H - 2.5, { align: 'right' });
      },
      margin: { top: 82, left: mg, right: mg, bottom: 10 },
    });

    doc.save(`cliente_${historyClient.cel}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportSalePDF = (s: AdminSale) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mg = 18;
    const estado = getEstado(s);
    const region = getRegion(s);
    const estadoRgb: [number, number, number] =
      estado === 'PAGO COMPLETO'  ? [35, 115, 55]  :
      estado === 'CONTRA ENTREGA' ? [155, 95, 10]  :
      estado === 'ANULADO'        ? [175, 48, 48]  : [90, 115, 100];

    // ── Top stripe ──────────────────────────────────────────────────
    doc.setFillColor(18, 50, 30);
    doc.rect(0, 0, W, 4, 'F');

    // ── Header band ─────────────────────────────────────────────────
    doc.setFillColor(22, 52, 33);
    doc.rect(0, 4, W, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg, 17);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 190, 145);
    doc.text('COMPROBANTE DE COMPRA', mg, 24);

    // Ref y fecha (derecha)
    doc.setFontSize(7);
    doc.setTextColor(80, 140, 105);
    doc.text(`Ref: ${s._dbId?.slice(-8).toUpperCase() ?? 'N/A'}`, W - mg, 17, { align: 'right' });
    doc.text(`${s.fecha ?? '—'}${s.hora ? `  ·  ${s.hora}` : ''}`, W - mg, 24, { align: 'right' });

    // ── Thin divider below header ────────────────────────────────────
    doc.setDrawColor(55, 120, 70);
    doc.setLineWidth(0.3);
    doc.line(mg, 38, W - mg, 38);

    // ── Content sections ─────────────────────────────────────────────
    let y = 46;

    const section = (title: string) => {
      doc.setFillColor(232, 246, 237);
      doc.roundedRect(mg, y - 4, W - mg * 2, 7, 1.5, 1.5, 'F');
      doc.setFillColor(55, 120, 65);
      doc.roundedRect(mg, y - 4, 3, 7, 1, 1, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(28, 65, 38);
      doc.text(title, mg + 6, y + 0.5);
      y += 9;
    };

    const row = (label: string, value: string, valueColor?: [number, number, number]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(85, 120, 98);
      doc.text(label, mg, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(valueColor ?? [30, 55, 40] as [number, number, number]));
      doc.text(value, mg + 42, y);
      y += 7;
    };

    const rowHalf = (pairs: [string, string, ([number, number, number] | undefined)?][]) => {
      const colW = (W - mg * 2) / pairs.length;
      pairs.forEach(([label, value, color], i) => {
        const x = mg + i * colW;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(85, 120, 98);
        doc.text(label, x, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(color ?? [30, 55, 40] as [number, number, number]));
        doc.text(value, x + 22, y);
      });
      y += 7;
    };

    section('DATOS DEL CLIENTE');
    row('Nombre', s.nom || '—');
    rowHalf([['Celular', s.cel || '—', [22, 100, 155]], ['DNI', s.dni || '—']]);
    rowHalf([['Región', region], ['Marca', s.marcaLabel || 'OVER', [42, 110, 55]]]);

    if (region === 'Provincia' && (s.sede || s.provincia || s.depto)) {
      y += 1;
      if (s.sede) {
        const sedeLines = doc.splitTextToSize(s.sede, W - mg * 2 - 44);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 120, 98);
        doc.text('Courier / Sede', mg, y);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(150, 90, 10);
        doc.text(sedeLines, mg + 44, y);
        y += sedeLines.length * 6 + 1;
      }
      if (s.provincia || s.depto) rowHalf([['Departamento', s.provincia || '—'], ['Provincia', s.depto || '—']]);
    } else if (region === 'Lima' && (s.distrito || s.ubicacion)) {
      y += 1;
      if (s.distrito) row('Distrito', s.distrito, [22, 100, 155]);
      if (s.ubicacion) {
        const ubLines = doc.splitTextToSize(s.ubicacion, W - mg * 2 - 44);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 120, 98);
        doc.text('Ubicación', mg, y);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 55, 40);
        doc.text(ubLines, mg + 42, y);
        y += ubLines.length * 6 + 1;
      }
    }

    y += 3;
    section('DETALLE DEL PEDIDO');

    if (s.detalle && s.detalle.trim()) {
      const detalleLines = doc.splitTextToSize(s.detalle.trim(), W - mg * 2);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 80, 60);
      doc.text(detalleLines, mg, y);
      y += detalleLines.length * 5.5 + 3;
    } else {
      const comboLines = doc.splitTextToSize(s.combo || 'Sin detalle', W - mg * 2 - 44);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(85, 120, 98);
      doc.text('Combo', mg, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 55, 40);
      doc.text(comboLines, mg + 42, y);
      y += comboLines.length * 6 + 1;
    }

    rowHalf([['Cantidad', `${s.qtyN ?? '—'} prendas`], ['Vendedor', s.vendorName || '—', [42, 110, 55]]]);
    if (s.codigoPublicidad) row('Cod. Publicidad', s.codigoPublicidad, [80, 80, 148]);

    y += 3;
    section('RESUMEN DE PAGO');
    row('Método de pago', s.metodoPago || '—');
    row('Total', `S/ ${s.totalTotal ?? 0}`, [32, 115, 50]);
    if (s.separo) row('Separo / Adelanto', `S/ ${s.separo}`, [22, 100, 155]);
    if (s.resta && parseFloat(s.resta) > 0) row('Saldo pendiente', `S/ ${s.resta}`, [175, 48, 48]);

    // ── Estado badge ─────────────────────────────────────────────────
    y += 5;
    const badgeW = 64;
    const badgeX = (W - badgeW) / 2;
    doc.setFillColor(232, 246, 237);
    doc.roundedRect(badgeX, y, badgeW, 11, 2.5, 2.5, 'F');
    doc.setDrawColor(...estadoRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(badgeX, y, badgeW, 11, 2.5, 2.5, 'S');
    doc.setFillColor(...estadoRgb);
    doc.roundedRect(badgeX, y, badgeW, 3, 1.5, 1.5, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...estadoRgb);
    doc.text(estado, W / 2, y + 8, { align: 'center' });

    // ── Footer strip ─────────────────────────────────────────────────
    doc.setFillColor(18, 50, 30);
    doc.rect(0, H - 8, W, 8, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 170, 130);
    doc.text('Livex Agency · Comprobante interno de venta', W / 2, H - 3, { align: 'center' });

    doc.save(`comprobante_${s.cel ?? 'cliente'}_${s.fecha ?? 'sin-fecha'}.pdf`);
  };

  const openEdit = (s: AdminSale) => {
    setEditingId(s._dbId ?? null);
    setEditForm(saleToForm(s));
    setEditError('');
  };

  const closeEdit = () => { setEditingId(null); setEditForm(null); setEditError(''); };

  const handleEditSave = async () => {
    if (!editingId || !editForm) return;
    setEditSaving(true);
    setEditError('');
    const ok = await editSale(editingId, {
      nom: editForm.nom, cel: editForm.cel, dni: editForm.dni,
      hora: editForm.hora, fecha: editForm.fecha,
      codigo_publicidad: editForm.codigo_publicidad,
      metodo_pago: editForm.metodo_pago, separo: editForm.separo,
      resta: editForm.resta, total_total: Number(editForm.total_total) || 0,
      combo: editForm.combo, marca_label: editForm.marca_label,
      ...(editForm.user_id ? { user_id: editForm.user_id } : {}),
    });
    setEditSaving(false);
    if (ok) closeEdit();
    else setEditError('Error al guardar. Intenta de nuevo.');
  };

  const startIdx = (page - 1) * 50;
  const endIdx = Math.min(startIdx + paginatedSales.length, filteredSales.length);

  const toggleEstado = (estado: string) =>
    setEstadoFilter(prev => prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]);

  const exportCSV = () => {
    const headers = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGION', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PROD', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'];
    const rows = filteredSales.map(s => [
      s.fecha ?? '', s.marcaLabel ?? 'OVER', s.vendorName ?? '',
      s.hora ?? '', getRegion(s), s.nom ?? '', s.cel ?? '', s.dni ?? '',
      s.totalTotal ?? 0, s.resta ?? '', s.separo ?? '',
      getEstado(s), getCodigoProducto(s.detalle || '', s.combo || ''), s.codigoPublicidad ?? '', s.metodoPago ?? '', s.combo ?? '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();  // 210
    const mg = 12;
    const headerH = 38;

    // ── Top accent stripe ─────────────────────────────────────────────
    doc.setFillColor(18, 50, 30);
    doc.rect(0, 0, W, 4, 'F');

    // ── Header band ───────────────────────────────────────────────────
    doc.setFillColor(22, 52, 33);
    doc.rect(0, 4, W, headerH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 190, 145);
    doc.text('Reporte de Ventas', mg, 23);

    doc.setFontSize(7);
    doc.setTextColor(80, 140, 105);
    doc.text(`Período: ${dateFrom}  →  ${dateTo}`, mg, 30);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, mg, 36.5);

    // ── KPI boxes (derecha, dentro del header) ────────────────────────
    const kpis = [
      { label: 'VENTAS',   value: String(globalStats.salesCount),                    rgb: [69, 131, 77]  as [number, number, number] },
      { label: 'INGRESOS', value: `S/${globalStats.totalRevenue.toLocaleString()}`,   rgb: [25, 120, 170] as [number, number, number] },
      { label: 'PRENDAS',  value: String(globalStats.totalItems),                     rgb: [95, 95, 150]  as [number, number, number] },
      { label: 'DEUDA',    value: `S/${globalStats.deudaTotal.toFixed(0)}`,           rgb: [185, 55, 55]  as [number, number, number] },
    ];
    const boxW = 46, boxGap = 3.5, boxH = 30, boxTop = 5;
    const startX = W - mg - kpis.length * boxW - (kpis.length - 1) * boxGap;

    kpis.forEach((kpi, i) => {
      const x = startX + i * (boxW + boxGap);
      doc.setFillColor(30, 68, 42);
      doc.roundedRect(x, boxTop, boxW, boxH, 2, 2, 'F');
      doc.setFillColor(...kpi.rgb);
      doc.roundedRect(x, boxTop, boxW, 3, 1, 1, 'F');
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...kpi.rgb);
      doc.text(kpi.label, x + boxW / 2, boxTop + 9.5, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(kpi.value, x + boxW / 2, boxTop + 23, { align: 'center' });
    });

    // ── Tabla ─────────────────────────────────────────────────────────
    const headers = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUB.', 'MET. PAGO', 'COMBO'];

    const rows = filteredSales.map(s => [
      s.fecha ?? '',
      s.marcaLabel ?? 'OVER',
      s.vendorName ?? '',
      s.hora ?? '',
      getRegion(s),
      s.nom ?? '',
      s.cel ?? '',
      s.dni ?? '',
      `S/${s.totalTotal ?? 0}`,
      s.resta || '—',
      s.separo || '—',
      getEstado(s),
      s.codigoPublicidad ?? '',
      s.metodoPago ?? '',
      (s.combo ?? '').substring(0, 35),
    ]);

    autoTable(doc, {
      startY: headerH + 6,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 6.2,
        cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
        lineColor: [185, 215, 195],
        lineWidth: 0.2,
        textColor: [38, 62, 48],
        font: 'helvetica',
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: [22, 52, 33],
        textColor: [140, 210, 160],
        fontStyle: 'bold',
        fontSize: 6.2,
        lineColor: [38, 85, 52],
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: [240, 248, 243] },
      bodyStyles: { fillColor: [248, 253, 250] },
      columnStyles: {
        8:  { textColor: [35, 115, 55], fontStyle: 'bold' },
        11: { fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 11) {
          const v = String(data.cell.raw);
          if (v === 'PAGO COMPLETO')    data.cell.styles.textColor = [32, 115, 50];
          else if (v === 'CONTRA ENTREGA') data.cell.styles.textColor = [155, 90, 10];
          else if (v === 'ANULADO')     data.cell.styles.textColor = [175, 48, 48];
          else data.cell.styles.textColor = [80, 110, 90];
        }
        if (data.column.index === 1) {
          const v = String(data.cell.raw).toUpperCase();
          if (v.includes('BRV') || v.includes('BRAVOS')) data.cell.styles.textColor = [75, 75, 148];
          else data.cell.styles.textColor = [42, 100, 55];
        }
        if (data.column.index === 2) {
          data.cell.styles.textColor = [22, 100, 155];
        }
      },
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        const pg = data.pageNumber;
        doc.setFillColor(18, 50, 30);
        doc.rect(0, H - 7, W, 7, 'F');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 170, 130);
        doc.text(`LIVEX AGENCY · Reporte de Ventas · ${new Date().toLocaleDateString('es-PE')}`, mg, H - 2.5);
        doc.text(`Página ${pg} de ${totalPages}`, W - mg, H - 2.5, { align: 'right' });
      },
      margin: { top: headerH + 6, left: mg, right: mg, bottom: 10 },
    });

    doc.save(`livex_ventas_${dateFrom}_${dateTo}.pdf`);
  };

  const S = {
    surface: 'rgba(255,255,255,0.97)',
    surface2: 'rgba(242,251,245,0.97)',
    border: '1px solid rgba(104,168,119,.35)',
    accent: '#45834D',
    muted: '#517861',
    text: '#2a4433',
    text2: '#162e20',
  };

  const btn = (variant: 'accent' | 'ghost' | 'danger' | 'info' | 'active'): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.9rem', borderRadius: '8px',
    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    border: variant === 'ghost' ? '1px solid rgba(104,168,119,.35)' : variant === 'active' ? '1px solid rgba(69,131,77,0.5)' : 'none',
    background: variant === 'accent' ? 'linear-gradient(135deg,#45834D,#3a6d42)'
      : variant === 'danger' ? 'rgba(239,68,68,0.1)'
      : variant === 'info' ? 'rgba(30,111,160,0.1)'
      : variant === 'active' ? 'rgba(69,131,77,0.12)'
      : 'rgba(255,255,255,0.9)',
    color: variant === 'accent' ? '#fff'
      : variant === 'danger' ? '#ef4444'
      : variant === 'info' ? '#1e6fa0'
      : variant === 'active' ? '#45834D'
      : S.muted,
  });

  const getBrandColor = (label: string) => {
    const l = (label || '').toUpperCase();
    if (l.includes('BRV') || l.includes('BRAVOS')) return { bg: 'rgba(235,115,71,0.12)', color: '#EB7347', border: 'rgba(235,115,71,0.3)' };
    return { bg: 'rgba(69,131,77,0.1)', color: '#45834D', border: 'rgba(69,131,77,0.3)' };
  };

  const maxVendorRevenue = vendorStats.length > 0 ? vendorStats[0].totalRevenue : 1;
  const [vendorChartMode, setVendorChartMode] = useState<'ranking' | 'chart'>('ranking');

  const VENDOR_COLORS = ['#45834D','#EB7347','#38c8f5','#a78bfa','#f59e0b','#ec4899','#06b6d4','#84cc16'];


  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#EAF5EE 0%,#DDEEE3 100%)', color: S.text, fontFamily: 'League Spartan,Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.98),rgba(242,251,245,0.95))', borderBottom: '1px solid rgba(104,168,119,.3)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(69,131,77,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#45834D,#3a6d42)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(69,131,77,.3)' }}>
            <BarChart3 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: S.text2, letterSpacing: '-0.02em' }}>
              LIVEX <span style={{ color: S.accent }}>Admin</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: S.muted }}>{adminName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', borderRadius: '20px', background: liveCount > 0 ? 'rgba(69,131,77,0.12)' : 'rgba(104,168,119,0.08)', border: `1px solid ${liveCount > 0 ? 'rgba(69,131,77,0.4)' : 'rgba(104,168,119,0.25)'}`, transition: 'all 0.4s' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: liveCount > 0 ? '#45834D' : 'rgba(81,120,97,.5)', boxShadow: liveCount > 0 ? '0 0 6px rgba(69,131,77,.5)' : 'none', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: liveCount > 0 ? '#45834D' : '#517861', letterSpacing: '0.06em' }}>
              {liveCount > 0 ? `+${liveCount} nueva${liveCount > 1 ? 's' : ''}` : 'EN VIVO'}
            </span>
          </div>
          <button
            onClick={async () => {
              if (showArchived) {
                setShowArchived(false);
              } else {
                await loadArchivedSales();
                setShowArchived(true);
              }
            }}
            style={{ ...btn('ghost'), border: `1px solid ${showArchived ? 'rgba(245,158,11,0.35)' : 'rgba(150,150,150,0.2)'}`, color: showArchived ? '#d97706' : S.muted, background: showArchived ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.9)' }}
          >
            <History size={13} /> {showArchived ? 'Ver activos' : 'Historial'}
          </button>
          {onSwitchToATC && (
            <button onClick={onSwitchToATC} style={{ ...btn('ghost'), border: '1px solid rgba(26,127,189,0.25)', color: '#1a7fbd', background: 'rgba(26,127,189,0.08)' }}>
              🎧 ATC
            </button>
          )}
          <button onClick={onSwitchToVendedor} style={{ ...btn('info'), border: '1px solid rgba(56,200,245,0.25)' }}>
            📋 Vista Vendedor
          </button>
          <button onClick={onSignOut} style={{ ...btn('danger'), border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.5rem 2rem' }}>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.25rem', borderBottom: '2px solid rgba(104,168,119,.2)', paddingBottom: '0' }}>
          {([
            { id: 'ventas', label: '📊 Ventas', count: null },
            { id: 'planillas', label: '📋 Planillas', count: null },
            { id: 'metas', label: '🎯 Metas', count: null },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.55rem 1.25rem', fontSize: '0.82rem', fontWeight: 800,
                border: 'none', borderBottom: activeTab === tab.id ? '2px solid #45834D' : '2px solid transparent',
                background: activeTab === tab.id ? 'rgba(69,131,77,.08)' : 'transparent',
                color: activeTab === tab.id ? '#45834D' : '#517861',
                cursor: 'pointer', borderRadius: '8px 8px 0 0', marginBottom: '-2px',
                transition: 'all 0.15s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Contenido por tab ── */}
        {activeTab === 'metas' ? (
          <MetasPanel
            profiles={profiles}
            vendorStats={vendorStats}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        ) : activeTab === 'planillas' ? (
          <PlanillasPanel
            filteredSales={filteredSales}
            dateFrom={dateFrom}
            dateTo={dateTo}
            brandFilter={brandFilter}
            getRegion={getRegion}
            getEstado={getEstado}
          />
        ) : (<>

        {/* ── Modo historial archivado ── */}
        {showArchived ? (
          <div>
            {/* Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '0.85rem 1.2rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Archive size={16} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>Historial archivado</div>
                  <div style={{ fontSize: '0.7rem', color: S.muted }}>
                    {archiveLoading ? 'Cargando...' : `${archivedSales.length} registros archivados`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    if (!window.confirm(`¿Desarchivar todos los registros (${archivedSales.length}) y devolverlos al historial activo?`)) return;
                    await desarchivarTodo();
                  }}
                  style={{ ...btn('ghost'), fontSize: '0.75rem', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}
                >
                  <RotateCcw size={12} /> Desarchivar todo
                </button>
                <button onClick={() => setShowArchived(false)} style={{ ...btn('ghost'), fontSize: '0.75rem' }}>
                  <X size={12} /> Cerrar historial
                </button>
              </div>
            </div>

            {/* Tabla archivados */}
            {archiveLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: S.muted, fontSize: '0.85rem' }}>Cargando historial...</div>
            ) : archivedSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: S.muted, fontSize: '0.85rem' }}>No hay ventas archivadas</div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: S.border }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
                      {['FECHA', 'VENDEDOR', 'CLIENTE', 'CEL', 'COMBO', 'TOTAL S/', 'ESTADO', 'REGIÓN'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archivedSales.map((s, i) => (
                      <tr key={s._dbId ?? i} style={{ borderBottom: '1px solid rgba(104,168,119,.18)', background: i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.02)' }}>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.muted, whiteSpace: 'nowrap' }}>{s.fecha}</td>
                        <td style={{ padding: '0.5rem 0.85rem', fontWeight: 600, color: S.text }}>{s.vendorName}</td>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.text }}>{s.nom}</td>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{s.cel}</td>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.text, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.combo}</td>
                        <td style={{ padding: '0.5rem 0.85rem', fontWeight: 800, color: S.accent }}>S/{Number(s.totalTotal).toLocaleString()}</td>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{getEstado(s)}</td>
                        <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{getRegion(s)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (<>

        {/* ── Banner archivar período ── */}
        {allSales.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(69,131,77,0.04)', border: '1px solid rgba(69,131,77,0.15)', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Archive size={14} color={S.accent} />
              <span style={{ fontSize: '0.75rem', color: S.muted }}>
                <strong style={{ color: S.text }}>{allSales.filter(s => !s._anulado).length} ventas</strong> en el período activo
              </span>
            </div>
            <button
              onClick={async () => {
                const count = allSales.filter(s => !s._anulado).length;
                if (!window.confirm(`¿Archivar las ${count} ventas del período actual?\n\nPodrás consultarlas en "Historial" cuando quieras. Esta acción es reversible.`)) return;
                const ok = await archivarTodo();
                if (!ok) alert('Error al archivar. Intenta de nuevo.');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#d97706', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
            >
              <Archive size={12} /> Archivar período
            </button>
          </div>
        )}

        {/* ── KPI cards (5) ── */}
        <div className="kpi-grid">
          {[
            { label: 'Ventas', value: globalStats.salesCount, color: S.accent, icon: <ShoppingBag size={18} /> },
            { label: 'Total S/', value: `S/${globalStats.totalRevenue.toLocaleString()}`, color: '#1e6fa0', icon: <DollarSign size={18} /> },
            { label: 'Prendas', value: globalStats.totalItems, color: '#EB7347', icon: <Package size={18} /> },
            { label: 'Promedio/venta', value: `S/${globalStats.avgPerSale}`, color: '#45834D', icon: <BarChart3 size={18} /> },
            { label: 'Deuda total S/', value: globalStats.deudaTotal > 0 ? `S/${globalStats.deudaTotal.toFixed(0)}` : 'S/0', color: globalStats.deudaTotal > 0 ? '#ef4444' : '#517861', icon: <AlertTriangle size={18} /> },
          ].map(k => (
            <div key={k.label} style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem', borderLeft: `3px solid ${k.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: k.color, marginBottom: '0.4rem' }}>
                {k.icon}
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Desglose por marca ── */}
        {brandStats.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {brandStats.map(b => {
              const bc = getBrandColor(b.label);
              const pct = globalStats.totalRevenue > 0 ? Math.round((b.revenue / globalStats.totalRevenue) * 100) : 0;
              return (
                <div key={b.label} style={{ background: bc.bg, border: `1px solid ${bc.border}`, borderRadius: '10px', padding: '0.65rem 1.1rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: '0.8rem', color: bc.color, letterSpacing: '0.06em' }}>{b.label}</span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: S.muted, textTransform: 'uppercase', fontWeight: 700 }}>Ventas</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: bc.color }}>{b.count}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: S.muted, textTransform: 'uppercase', fontWeight: 700 }}>Ingresos</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: bc.color }}>S/{b.revenue.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: S.muted, textTransform: 'uppercase', fontWeight: 700 }}>Prendas</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: bc.color }}>{b.items}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: S.muted, textTransform: 'uppercase', fontWeight: 700 }}>Part.</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: bc.color }}>{pct}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── KPIs: Publicidad + Producto en grid lado a lado ── */}
        {(pubStats.length > 0 || cpStats.stats.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: pubStats.length > 0 && cpStats.stats.length > 0 ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.25rem' }}>

            {/* Códigos de Publicidad */}
            {pubStats.length > 0 && (() => {
              const totalRev = pubStats.reduce((a, x) => a + x.revenue, 0);
              const maxRev = pubStats[0]?.revenue ?? 1;
              const PUB_COLORS = ['#6366f1','#ec4899','#f59e0b','#14b8a6','#8b5cf6','#ef4444'];
              return (
                <div style={{ background: S.surface, border: S.border, borderRadius: '14px', overflow: 'hidden' }}>
                  {/* header */}
                  <div
                    onClick={() => setPubCollapsed(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.1rem', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BarChart3 size={13} color="#6366f1" />
                    </div>
                    <span style={{ fontSize: '0.67rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Códigos de Publicidad
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.67rem', fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.1)', borderRadius: '5px', padding: '0.1rem 0.45rem' }}>
                      {pubStats.length} códigos
                    </span>
                    {pubCollapsed ? <ChevronDown size={14} style={{ color: '#6366f1', flexShrink: 0 }} /> : <ChevronUp size={14} style={{ color: '#6366f1', flexShrink: 0 }} />}
                  </div>
                  {!pubCollapsed && <div style={{ padding: '0 1.1rem 1rem' }}>
                  {/* summary pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <div style={{ flex: 1, minWidth: '80px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#6366f1', lineHeight: 1.1 }}>{pubStats.reduce((a, x) => a + x.count, 0)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '80px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#6366f1', lineHeight: 1.1 }}>S/{totalRev.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '80px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#6366f1', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pubStats[0]?.code ?? '—'}</div>
                    </div>
                  </div>
                  {/* bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
                    {pubStats.map((p, i) => {
                      const barPct = maxRev > 0 ? Math.round((p.revenue / maxRev) * 100) : 0;
                      const share = totalRev > 0 ? Math.round((p.revenue / totalRev) * 100) : 0;
                      const hue = PUB_COLORS[i % PUB_COLORS.length];
                      return (
                        <div key={p.code} style={{ borderRadius: '8px', padding: '0.4rem 0.7rem', background: `rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.05)`, border: `1px solid rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.15)` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: hue, flexShrink: 0 }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: S.text }}>{p.code}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.63rem', color: S.muted }}>{p.count}v · {p.items}p</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: hue }}>S/{p.revenue.toLocaleString()}</span>
                              <span style={{ fontSize: '0.6rem', fontWeight: 800, background: `rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.12)`, borderRadius: '4px', padding: '0.08rem 0.38rem', color: hue }}>{share}%</span>
                            </div>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(150,150,150,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${barPct}%`, background: `linear-gradient(90deg,${hue},${hue}88)`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>}
                </div>
              );
            })()}

            {/* Códigos de Producto (CP) */}
            {cpStats.stats.length > 0 && (() => {
              const filtered = cpStats.stats.filter(c => c.code !== 'Sin código');
              const maxCount = filtered[0]?.count ?? 1;
              const totalRev = filtered.reduce((a, x) => a + x.revenue, 0);
              const totalItems = filtered.reduce((a, x) => a + x.items, 0);
              const { uniqueWithCode, uniqueWithoutCode } = cpStats;
              const totalUnique = uniqueWithCode + uniqueWithoutCode;
              const coveragePct = totalUnique > 0 ? Math.round((uniqueWithCode / totalUnique) * 100) : 0;
              const CP_COLORS = ['#45834D','#1e6fa0','#EB7347','#8b5cf6','#f59e0b','#14b8a6','#ec4899','#6366f1','#10b981','#ef4444','#78716c'];
              return (
                <div style={{ background: S.surface, border: S.border, borderRadius: '14px', overflow: 'hidden' }}>
                  {/* header */}
                  <div
                    onClick={() => setCpCollapsed(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.1rem', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(69,131,77,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={13} color={S.accent} />
                    </div>
                    <span style={{ fontSize: '0.67rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Códigos de Producto
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.67rem', fontWeight: 800, color: S.accent, background: 'rgba(69,131,77,0.1)', borderRadius: '5px', padding: '0.1rem 0.45rem' }}>
                      {filtered.length} tipos
                    </span>
                    {cpCollapsed ? <ChevronDown size={14} style={{ color: S.accent, flexShrink: 0 }} /> : <ChevronUp size={14} style={{ color: S.accent, flexShrink: 0 }} />}
                  </div>
                  {!cpCollapsed && <div style={{ padding: '0 1.1rem 1rem' }}>
                  {/* summary pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <div style={{ flex: 1, minWidth: '72px', background: 'rgba(69,131,77,0.07)', border: '1px solid rgba(69,131,77,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: S.accent, lineHeight: 1.1 }}>{totalUnique}</div>
                      {uniqueWithoutCode > 0 && (
                        <div style={{ fontSize: '0.55rem', color: S.muted, marginTop: '0.1rem' }}>{uniqueWithCode} identificadas</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '72px', background: 'rgba(69,131,77,0.07)', border: '1px solid rgba(69,131,77,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: S.accent, lineHeight: 1.1 }}>S/{totalRev.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '72px', background: 'rgba(69,131,77,0.07)', border: '1px solid rgba(69,131,77,0.18)', borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prendas</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: S.accent, lineHeight: 1.1 }}>{totalItems}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '72px', background: coveragePct >= 80 ? 'rgba(69,131,77,0.07)' : coveragePct >= 50 ? 'rgba(245,158,11,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${coveragePct >= 80 ? 'rgba(69,131,77,0.18)' : coveragePct >= 50 ? 'rgba(245,158,11,0.18)' : 'rgba(239,68,68,0.18)'}`, borderRadius: '8px', padding: '0.45rem 0.7rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cobertura</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: coveragePct >= 80 ? S.accent : coveragePct >= 50 ? '#f59e0b' : '#ef4444', lineHeight: 1.1 }}>{coveragePct}%</div>
                    </div>
                  </div>
                  {/* bars — ordered by count, bar = relative to top */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
                    {filtered.map((p, i) => {
                      const barPct = maxCount > 0 ? Math.round((p.count / maxCount) * 100) : 0;
                      const share = uniqueWithCode > 0 ? Math.round((p.count / uniqueWithCode) * 100) : 0;
                      const hue = CP_COLORS[i % CP_COLORS.length];
                      return (
                        <div key={p.code} style={{ borderRadius: '8px', padding: '0.4rem 0.7rem', background: 'rgba(69,131,77,0.04)', border: '1px solid rgba(69,131,77,0.14)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '0.08rem 0.38rem', borderRadius: '4px', background: `rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.12)`, border: `1px solid rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.25)`, color: hue, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{p.code}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.63rem', color: S.muted }}>{p.items}p</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: hue }}>S/{p.revenue.toLocaleString()}</span>
                              <span style={{ fontSize: '0.6rem', fontWeight: 800, background: `rgba(${hue.slice(1).match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.1)`, borderRadius: '4px', padding: '0.08rem 0.38rem', color: hue }}>{share}%</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: S.text }}>{p.count}v</span>
                            </div>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(150,150,150,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${barPct}%`, background: `linear-gradient(90deg,${hue},${hue}88)`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>}
                </div>
              );
            })()}

          </div>
        )}

        {/* ── Ranking + Gráfico por día ── */}
        <div style={{ display: 'grid', gridTemplateColumns: vendorStats.length > 0 ? '1fr 320px' : '1fr', gap: '1rem', marginBottom: '1.25rem' }}>

          {/* Ranking + Gráfico de Vendedores */}
          {vendorStats.length > 0 && (
            <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem' }}>
              {/* Header con toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Vendedores</div>
                <div style={{ display: 'flex', background: 'rgba(242,251,245,.9)', border: '1px solid rgba(104,168,119,.3)', borderRadius: '8px', overflow: 'hidden' }}>
                  {(['ranking', 'chart'] as const).map(mode => (
                    <button key={mode} onClick={() => setVendorChartMode(mode)}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: vendorChartMode === mode ? 'linear-gradient(135deg,#45834D,#3a6d42)' : 'transparent', color: vendorChartMode === mode ? '#fff' : S.muted, transition: 'all 0.2s' }}>
                      {mode === 'ranking' ? '≡ Lista' : '▦ Gráfico'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vista Lista/Ranking */}
              {vendorChartMode === 'ranking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {vendorStats.map((v, i) => {
                    const pct = globalStats.totalRevenue > 0 ? Math.round((v.totalRevenue / globalStats.totalRevenue) * 100) : 0;
                    const barPct = maxVendorRevenue > 0 ? Math.round((v.totalRevenue / maxVendorRevenue) * 100) : 0;
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                    const color = VENDOR_COLORS[i % VENDOR_COLORS.length];
                    return (
                      <div key={v.id} style={{ background: i === 0 ? 'rgba(69,131,77,0.06)' : 'rgba(242,251,245,.5)', border: `1px solid ${i === 0 ? 'rgba(69,131,77,0.2)' : 'rgba(104,168,119,.2)'}`, borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: S.text }}>{medal} {v.name}</span>
                          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', color: S.muted }}>{v.salesCount} v · {v.totalItems} p · prom S/{v.avgPerSale.toLocaleString()}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: S.accent }}>S/{v.totalRevenue.toLocaleString()}</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: color, background: `${color}18`, borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(104,168,119,.15)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${barPct}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vista Gráfico de barras */}
              {vendorChartMode === 'chart' && (
                <div>
                  {/* Barras verticales */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', padding: '0 0.25rem' }}>
                    {vendorStats.map((v, i) => {
                      const barPct = maxVendorRevenue > 0 ? (v.totalRevenue / maxVendorRevenue) : 0;
                      const color = VENDOR_COLORS[i % VENDOR_COLORS.length];
                      return (
                        <div key={v.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: 0 }}>
                          {/* Valor encima */}
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: S.text, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            S/{v.totalRevenue >= 1000 ? `${(v.totalRevenue/1000).toFixed(1)}k` : v.totalRevenue}
                          </span>
                          {/* Barra */}
                          <div style={{ width: '100%', background: 'rgba(104,168,119,.12)', borderRadius: '6px 6px 0 0', height: '120px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: `${Math.max(barPct * 100, 4)}%`, background: `linear-gradient(180deg,${color},${color}bb)`, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease', position: 'relative' }}>
                              {/* Ventas count en la barra */}
                              {barPct > 0.2 && (
                                <span style={{ position: 'absolute', top: '6px', left: 0, right: 0, textAlign: 'center', fontSize: '0.58rem', fontWeight: 800, color: '#fff' }}>
                                  {v.salesCount}v
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Nombres debajo */}
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.25rem', marginTop: '0.4rem' }}>
                    {vendorStats.map((v, i) => {
                      const color = VENDOR_COLORS[i % VENDOR_COLORS.length];
                      const firstName = v.name.split(' ')[0];
                      return (
                        <div key={v.id} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, margin: '0 auto 0.2rem' }} />
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: S.muted, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Leyenda % */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(104,168,119,.15)' }}>
                    {vendorStats.map((v, i) => {
                      const pct = globalStats.totalRevenue > 0 ? Math.round((v.totalRevenue / globalStats.totalRevenue) * 100) : 0;
                      const color = VENDOR_COLORS[i % VENDOR_COLORS.length];
                      return (
                        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: '6px', padding: '0.2rem 0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: S.text }}>{v.name.split(' ')[0]}</span>
                          <span style={{ fontSize: '0.65rem', color: S.muted }}>{pct}% · {v.salesCount}v</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gráfico de ventas por día */}
          {salesByDay.length > 0 && (
            <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Ventas por día</div>
              <SalesByDayChart data={salesByDay} accent={S.accent} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.62rem', color: S.muted }}>{salesByDay[0]?.[0]?.slice(5)}</span>
                <span style={{ fontSize: '0.62rem', color: S.muted }}>{salesByDay[salesByDay.length - 1]?.[0]?.slice(5)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: S.muted }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por cliente, vendedor, celular o DNI..."
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid rgba(104,168,119,.35)', borderRadius: '8px', fontSize: '0.82rem', background: 'rgba(255,255,255,.95)', color: S.text2, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Filtro rápido por marca */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['todas', 'OVER', 'BRV'] as const).map(b => (
              <button key={b} onClick={() => { setBrandFilter(b); setPage(1); }}
                style={{ ...btn(brandFilter === b ? 'active' : 'ghost'), padding: '0.45rem 0.7rem', fontSize: '0.75rem', minWidth: '48px', justifyContent: 'center' }}>
                {b === 'todas' ? 'Todas' : b}
              </button>
            ))}
          </div>

          <button onClick={() => setShowFilters(p => !p)} style={{ ...btn('ghost') }}>
            <Filter size={13} /> Filtros {showFilters ? '∧' : '∨'}
          </button>
          <button onClick={exportPDF} style={btn('accent')}>
            <Download size={13} /> PDF
          </button>
          <button onClick={exportCSV} style={{ ...btn('ghost'), color: '#38c8f5', border: '1px solid rgba(56,200,245,0.2)' }}>
            <Download size={13} /> Excel
          </button>
          <button onClick={refresh} disabled={loading} style={btn('ghost')}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          {/* Toggle columnas */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColPicker(p => !p)}
              style={{ ...btn('ghost'), color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)', background: showColPicker ? 'rgba(20,184,166,0.08)' : undefined }}>
              ⊞ Columnas {hiddenCols.size > 0 ? `(${ALL_COLS.length - hiddenCols.size}/${ALL_COLS.length})` : ''}
            </button>
            {showColPicker && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200, background: '#fff', border: '1px solid rgba(104,168,119,.35)', borderRadius: '12px', padding: '0.75rem', minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#517861', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Mostrar columnas</div>
                {ALL_COLS.map(col => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#2a4433', cursor: 'pointer', padding: '0.2rem 0.3rem', borderRadius: '6px', background: hiddenCols.has(col) ? 'transparent' : 'rgba(69,131,77,0.05)' }}>
                    <input type="checkbox" checked={!hiddenCols.has(col)} onChange={() => toggleCol(col)} style={{ accentColor: '#45834D', width: '14px', height: '14px' }} />
                    {col}
                  </label>
                ))}
                <button onClick={() => setHiddenCols(new Set())} style={{ marginTop: '0.25rem', padding: '0.3rem', border: '1px solid rgba(104,168,119,.25)', borderRadius: '6px', background: 'transparent', color: '#517861', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Mostrar todas</button>
              </div>
            )}
          </div>

          <button onClick={() => { setShowTransfer(p => !p); setTransferMsg(null); }}
            style={{ ...btn('ghost'), color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', background: showTransfer ? 'rgba(167,139,250,0.1)' : undefined }}>
            <ArrowRightLeft size={13} /> Traspasar fechas
          </button>
        </div>

        {/* ── Panel traspaso de fechas ── */}
        {showTransfer && (
          <div style={{ background: 'rgba(167,139,250,0.06)', border: '1.5px solid rgba(167,139,250,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Traspasar registros de una fecha a otra
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Fecha origen</div>
                <input type="date" value={transferFrom} onChange={e => { setTransferFrom(e.target.value); setTransferMsg(null); }}
                  style={{ ...iStyle, borderColor: 'rgba(167,139,250,0.4)' }} />
              </div>
              <ArrowRightLeft size={14} style={{ color: '#a78bfa', marginBottom: '0.5rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Fecha destino</div>
                <input type="date" value={transferTo} onChange={e => { setTransferTo(e.target.value); setTransferMsg(null); }}
                  style={{ ...iStyle, borderColor: 'rgba(167,139,250,0.4)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Vendedor (opcional)</div>
                <select value={transferVendor} onChange={e => setTransferVendor(e.target.value)}
                  style={{ ...iStyle, borderColor: 'rgba(167,139,250,0.4)', minWidth: '160px' }}>
                  <option value="">Todos los vendedores</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <button
                disabled={!transferFrom || !transferTo || transferFrom === transferTo || transferring}
                onClick={async () => {
                  if (!window.confirm(`¿Mover TODAS las ventas del ${transferFrom} al ${transferTo}${transferVendor ? ` (solo vendedor seleccionado)` : ''}?`)) return;
                  setTransferring(true);
                  setTransferMsg(null);
                  const res = await transferDates(transferFrom, transferTo, transferVendor);
                  setTransferring(false);
                  setTransferMsg(res.ok
                    ? { ok: true,  text: `${res.count} registro${res.count !== 1 ? 's' : ''} traspasado${res.count !== 1 ? 's' : ''} correctamente` }
                    : { ok: false, text: res.error ?? 'Error al traspasar' });
                }}
                style={{ ...btn('accent'), background: 'rgba(167,139,250,0.18)', color: '#a78bfa', border: '1.5px solid rgba(167,139,250,0.4)', opacity: (!transferFrom || !transferTo || transferFrom === transferTo) ? 0.45 : 1 }}>
                {transferring ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRightLeft size={13} />}
                {transferring ? 'Traspasando...' : 'Traspasar'}
              </button>
            </div>
            {transferMsg && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', fontWeight: 700, color: transferMsg.ok ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {transferMsg.ok ? '✓' : '✗'} {transferMsg.text}
              </div>
            )}
          </div>
        )}

        {/* ── Filtros ── */}
        {showFilters && (
          <div style={{ background: 'rgba(242,251,245,.97)', border: S.border, borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem 1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Ubicación', el: <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1); }} style={iStyle}><option value="todas">Todas</option><option value="Lima">Lima</option><option value="Provincia">Provincia</option><option value="Almacén">Almacén</option></select> },
                { label: 'Cod. Publicidad', el: <input value={codPublicidad} onChange={e => { setCodPublicidad(e.target.value); setPage(1); }} placeholder="Ej: Live" style={iStyle} /> },
                { label: 'Vendedor', el: <input value={vendorSearch} onChange={e => { setVendorSearch(e.target.value); setPage(1); }} placeholder="Nombre del vendedor" style={iStyle} /> },
                { label: 'Celular cliente', el: <input value={celFilter} onChange={e => { setCelFilter(e.target.value); setPage(1); }} placeholder="Ej: 999888777" style={iStyle} /> },
                { label: 'Fecha exacta', el: <input type="date" value={exactDate} onChange={e => { setExactDate(e.target.value); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
                { label: 'Mes', el: <input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setExactDate(''); setPage(1); }} style={iStyle} /> },
                { label: 'Rango: inicio', el: <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
                { label: 'Rango: fin', el: <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={iStyle} /> },
              ].map(({ label, el }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
                  {el}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Estado de Pedido</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
                  {['PAGO COMPLETO', 'CONTRA ENTREGA', 'ANULADO', 'DEVOLUCIÓN'].map(e => (
                    <label key={e} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: S.text, cursor: 'pointer', margin: 0, textTransform: 'none', letterSpacing: 'normal' }}>
                      <input type="checkbox" checked={estadoFilter.includes(e)} onChange={() => { toggleEstado(e); setPage(1); }} style={{ accentColor: S.accent, width: '14px', height: '14px' }} />
                      {e}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Método de Pago</div>
                <select value={metodoPagoFilter} onChange={e => { setMetodoPagoFilter(e.target.value); setPage(1); }} style={{ ...iStyle, minWidth: '180px' }}>
                  <option value="todos">Todos los métodos</option>
                  <option value="Contra entrega">Contra entrega</option>
                  <option value="Yape Import Textil">Yape Import Textil</option>
                  <option value="Pago completo">Pago completo</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{ ...btn('ghost'), color: S.muted }}>
                  <X size={13} /> Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Contador + paginación ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: S.muted }}>
            Mostrando {filteredSales.length === 0 ? '0–0' : `${startIdx + 1}–${endIdx}`} de {filteredSales.length} registros
          </span>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>

        {/* ── Tabla ── */}
        <div ref={tableRef} style={{ background: 'rgba(255,255,255,.97)', border: S.border, borderRadius: '12px', overflow: 'hidden' }}>
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,rgba(69,131,77,.12),rgba(58,109,66,.08))', borderBottom: '2px solid rgba(69,131,77,.25)' }}>
                  {([...ALL_COLS, ''] as (ColName | '')[]).map(h => {
                    if (h !== '' && hiddenCols.has(h as ColName)) return null;
                    return <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.65rem', letterSpacing: '0.05em', color: '#45834D', textTransform: 'uppercase' }}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sorted = [...paginatedSales].sort((a, b) => {
                    const la = (a.marcaLabel || 'OVER').toUpperCase();
                    const lb = (b.marcaLabel || 'OVER').toUpperCase();
                    return la.localeCompare(lb);
                  });
                  let lastBrand = '';
                  let rowIdx = 0;
                  return sorted.map((s) => {
                  const brand = (s.marcaLabel || 'OVER').toUpperCase();
                  const isNewBrand = brand !== lastBrand;
                  if (isNewBrand) lastBrand = brand;
                  const i = rowIdx++;
                  const region = getRegion(s);
                  const estado = getEstado(s);
                  const regionColor = region === 'Lima' ? { bg: 'rgba(30,111,160,.1)', color: '#1e6fa0' } : region === 'Provincia' ? { bg: 'rgba(160,120,10,.1)', color: '#a0780a' } : { bg: 'rgba(81,120,97,.1)', color: '#517861' };
                  const estadoColor = estado === 'PAGO COMPLETO' ? { bg: 'rgba(69,131,77,.1)', color: '#45834D' } : estado === 'CONTRA ENTREGA' ? { bg: 'rgba(160,120,10,.1)', color: '#a0780a' } : estado === 'ANULADO' ? { bg: 'rgba(239,68,68,.08)', color: '#ef4444' } : { bg: 'rgba(239,68,68,.1)', color: '#ef4444' };
                  const bc = getBrandColor(s.marcaLabel || 'OVER');
                  const isAnulado = estado === 'ANULADO';
                  return (
                    <Fragment key={s._dbId ?? `frag-${i}`}>
                    {isNewBrand && (
                      <tr>
                        <td colSpan={ALL_COLS.length - hiddenCols.size + 1} style={{ padding: '0.4rem 0.75rem', background: bc.bg, borderBottom: `2px solid ${bc.border}`, borderTop: i > 0 ? `2px solid ${bc.border}` : undefined }}>
                          <span style={{ fontWeight: 900, fontSize: '0.72rem', color: bc.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {brand === 'OVER' ? '▸ OVERSHARK' : brand === 'BRV' ? '▸ BRAVOS' : `▸ ${brand}`}
                          </span>
                          <span style={{ marginLeft: '0.6rem', fontSize: '0.65rem', color: bc.color, opacity: 0.7 }}>
                            {sorted.filter(x => (x.marcaLabel || 'OVER').toUpperCase() === brand).length} registros
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr
                      style={{ borderBottom: '1px solid rgba(104,168,119,.2)', background: isAnulado ? 'rgba(239,68,68,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(242,251,245,.6)', transition: 'background 0.15s', opacity: isAnulado ? 0.6 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(69,131,77,.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isAnulado ? 'rgba(239,68,68,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(242,251,245,.6)')}>
                      {visible('FECHA') && <td style={td}>{s.fecha ?? '—'}</td>}
                      {visible('EMPRESA') && <td style={td}>
                        <span style={{ background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`, borderRadius: '5px', padding: '0.15rem 0.55rem', fontWeight: 800, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                          {s.marcaLabel || 'OVER'}
                        </span>
                      </td>}
                      {visible('VENDEDOR') && <td style={{ ...td, color: S.accent, fontWeight: 700 }}>{s.vendorName}</td>}
                      {visible('HORA') && <td style={{ ...td, color: S.muted }}>{s.hora ?? '—'}</td>}
                      {visible('REGIÓN') && <td style={td}>
                        <span style={{ background: regionColor.bg, color: regionColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.68rem' }}>{region}</span>
                        {region === 'Provincia' && (s.provincia || s.depto) && (
                          <div style={{ fontSize: '0.6rem', color: '#a0780a', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }} title={[s.provincia, s.depto].filter(Boolean).join(' · ')}>
                            {[s.provincia, s.depto].filter(Boolean).join(' · ')}
                          </div>
                        )}
                        {region === 'Lima' && s.distrito && (
                          <div style={{ fontSize: '0.6rem', color: '#1e6fa0', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }} title={s.distrito}>
                            {s.distrito}
                          </div>
                        )}
                      </td>}
                      {visible('CLIENTE') && <td style={{ ...td, fontWeight: 600, color: '#111111' }}>
                        <span
                          onClick={() => s.cel && setHistoryClient({ nom: s.nom || '—', cel: s.cel })}
                          style={{ cursor: s.cel ? 'pointer' : 'default', borderBottom: s.cel ? '1px dashed rgba(69,131,77,0.5)' : 'none' }}
                          title={s.cel ? 'Ver historial del cliente' : undefined}>
                          {s.nom || '—'}
                        </span>
                      </td>}
                      {visible('CELULAR') && <td style={td}>{s.cel || '—'}</td>}
                      {visible('DNI') && <td style={td}>{s.dni || '—'}</td>}
                      {visible('TOTAL S/') && <td style={{ ...td, fontWeight: 900, color: S.accent }}>S/{s.totalTotal ?? 0}</td>}
                      {visible('DEBE') && <td style={{ ...td, color: s.resta ? '#ef4444' : S.muted }}>{s.resta || '—'}</td>}
                      {visible('SEPARO') && <td style={td}>{s.separo || '—'}</td>}
                      {visible('ESTADO') && <td style={td}>
                        <span style={{ background: estadoColor.bg, color: estadoColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{estado}</span>
                      </td>}
                      {visible('COD. PROD') && <td style={td}>
                        {(() => {
                          const cp = getCodigoProducto(s.detalle || '', s.combo || '');
                          if (cp === '—') return <span style={{ color: S.muted }}>—</span>;
                          return (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                              {cp.split(', ').map(c => (
                                <span key={c} style={{ fontSize: '0.6rem', fontWeight: 900, padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'rgba(69,131,77,0.1)', border: '1px solid rgba(69,131,77,0.25)', color: '#45834D', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>}
                      {visible('COD. PUBLICIDAD') && <td style={td}>{s.codigoPublicidad || '—'}</td>}
                      {visible('MET. PAGO') && <td style={td}>{s.metodoPago || '—'}</td>}
                      {visible('COMBO') && <td style={{ ...td, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: S.muted }}>{s.combo || '—'}</td>}
                      <td style={{ ...td, padding: '0.3rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          {s._dbId && (
                            <button
                              onClick={() => openEdit(s)}
                              title="Editar venta"
                              style={{ background: 'rgba(56,200,245,0.08)', border: '1px solid rgba(56,200,245,0.2)', borderRadius: '5px', color: '#38c8f5', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Pencil size={10} /> Editar
                            </button>
                          )}
                          {!isAnulado && s._dbId && (
                            <button
                              onClick={() => setConfirmModal({
                                title: 'Anular venta',
                                description: `¿Anular la venta de ${s.nom || 'este cliente'} (${s.cel || '—'})? La venta quedará marcada como anulada.`,
                                confirmLabel: 'Anular',
                                variant: 'warning',
                                onConfirm: () => anularVenta(s._dbId!),
                              })}
                              title="Anular venta"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '5px', color: '#ef4444', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              ✕ Anular
                            </button>
                          )}
                          {s._dbId && (
                            <button
                              onClick={() => eliminarVenta(s._dbId!)}
                              title="Eliminar registro"
                              style={{ background: 'rgba(120,53,15,0.08)', border: '1px solid rgba(120,53,15,0.2)', borderRadius: '5px', color: '#92400e', cursor: 'pointer', padding: '0.2rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                              <Trash2 size={10} /> Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    </Fragment>
                  );
                  });
                })()}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={ALL_COLS.length - hiddenCols.size + 1} style={{ padding: '3rem', textAlign: 'center', color: S.muted, fontSize: '0.85rem' }}>
                      {loading ? 'Cargando ventas...' : 'Sin registros para los filtros seleccionados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>

        {/* ── Tabla de registros eliminados ── */}
        {eliminatedSales.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,.97)', border: '1px solid rgba(146,64,14,.25)', borderRadius: '12px', overflow: 'hidden' }}>
          <button
            onClick={() => setShowDeleted(v => !v)}
            style={{ width: '100%', padding: '0.85rem 1.25rem', background: 'linear-gradient(135deg,rgba(120,53,15,.06),rgba(146,64,14,.04))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: showDeleted ? '1px solid rgba(146,64,14,.2)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Trash2 size={16} style={{ color: '#92400e' }} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e' }}>Registros Eliminados</span>
              <span style={{ background: 'rgba(146,64,14,.12)', color: '#92400e', borderRadius: '10px', padding: '0.1rem 0.55rem', fontSize: '0.7rem', fontWeight: 800 }}>{eliminatedSales.length}</span>
            </div>
            {showDeleted ? <ChevronUp size={16} style={{ color: '#92400e' }} /> : <ChevronDown size={16} style={{ color: '#92400e' }} />}
          </button>
          {showDeleted && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,rgba(120,53,15,.08),rgba(146,64,14,.05))', borderBottom: '2px solid rgba(146,64,14,.2)' }}>
                    {['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'TOTAL S/', 'COMBO', ''].map(h => (
                      <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.65rem', letterSpacing: '0.05em', color: '#92400e', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eliminatedSales.map((s, i) => {
                    const region = getRegion(s);
                    const bc = getBrandColor(s.marcaLabel || 'OVER');
                    return (
                      <tr key={s._dbId ?? i} style={{ borderBottom: '1px solid rgba(146,64,14,.12)', background: i % 2 === 0 ? 'transparent' : 'rgba(254,243,199,.3)', opacity: 0.8 }}>
                        <td style={{ ...td, color: S.muted }}>{s.fecha ?? '—'}</td>
                        <td style={td}>
                          <span style={{ background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`, borderRadius: '5px', padding: '0.15rem 0.55rem', fontWeight: 800, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                            {s.marcaLabel || 'OVER'}
                          </span>
                        </td>
                        <td style={{ ...td, color: S.muted }}>{s.vendorName}</td>
                        <td style={{ ...td, color: S.muted }}>{s.hora ?? '—'}</td>
                        <td style={td}>
                          <span style={{ background: 'rgba(81,120,97,.08)', color: '#517861', borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.68rem' }}>{region}</span>
                        </td>
                        <td style={{ ...td, fontWeight: 700, color: '#111111' }}>{s.nom || '—'}</td>
                        <td style={{ ...td, color: S.muted }}>{s.cel || '—'}</td>
                        <td style={{ ...td, fontWeight: 800, color: S.muted }}>S/{s.totalTotal ?? 0}</td>
                        <td style={{ ...td, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: S.muted }}>{s.combo || '—'}</td>
                        <td style={{ ...td, padding: '0.3rem 0.5rem' }}>
                          {s._dbId && (
                            <button
                              onClick={() => restaurarVenta(s._dbId!)}
                              title="Restaurar registro"
                              style={{ background: 'rgba(69,131,77,.1)', border: '1px solid rgba(69,131,77,.25)', borderRadius: '5px', color: '#45834D', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                              <RotateCcw size={10} /> Restaurar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

        </>)}
        </>)}

      </div>{/* fin contenedor 1500px */}

      {/* ── Drawer historial de cliente ── */}
      {historyClient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setHistoryClient(null); }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setHistoryClient(null)} />
          <div style={{ width: '420px', height: '100%', background: '#ffffff', borderLeft: '1px solid rgba(104,168,119,.3)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Header del drawer */}
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(104,168,119,.18)', background: 'linear-gradient(180deg,rgba(69,131,77,.06),transparent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: S.text2, marginBottom: '0.2rem' }}>{historyClient.nom}</div>
                  <div style={{ fontSize: '0.78rem', color: S.accent, fontWeight: 700 }}>{historyClient.cel}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={exportClientPDF}
                    title="Descargar resumen en PDF"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '7px', border: '1px solid rgba(69,131,77,.35)', background: 'rgba(69,131,77,.08)', color: S.accent, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800 }}>
                    <FileDown size={13} /> PDF
                  </button>
                  <button onClick={() => setHistoryClient(null)} style={{ background: 'transparent', border: 'none', color: S.muted, cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Resumen del cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.85rem' }}>
                {[
                  { label: 'Compras', value: clientHistory.length, color: '#1e6fa0' },
                  { label: 'Total S/', value: `S/${clientHistory.reduce((a, s) => a + (Number(s.totalTotal) || 0), 0).toLocaleString()}`, color: S.accent },
                  { label: 'Deuda S/', value: `S/${clientHistory.reduce((a, s) => { const v = parseFloat(s.resta || '0'); return a + (isNaN(v) ? 0 : v); }, 0).toFixed(0)}`, color: clientHistory.some(s => parseFloat(s.resta || '0') > 0) ? '#ef4444' : S.muted },
                ].map(k => (
                  <div key={k.label} style={{ background: 'rgba(242,251,245,.7)', borderRadius: '8px', padding: '0.5rem 0.6rem', textAlign: 'center', border: '1px solid rgba(104,168,119,.2)' }}>
                    <div style={{ fontSize: '0.6rem', color: S.muted, textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>{k.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Lista de compras */}
            <div style={{ flex: 1, padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Historial de Compras
              </div>
              {clientHistory.length === 0 ? (
                <div style={{ color: S.muted, fontSize: '0.82rem', textAlign: 'center', marginTop: '2rem' }}>Sin compras en el período cargado</div>
              ) : clientHistory.map((s, i) => {
                const estado = getEstado(s);
                const estadoColor = estado === 'PAGO COMPLETO' ? '#45834D' : estado === 'CONTRA ENTREGA' ? '#a0780a' : estado === 'ANULADO' ? '#ef4444' : S.muted;
                const region = getRegion(s);
                return (
                  <div key={s._dbId ?? i} style={{ background: 'rgba(255,255,255,.95)', border: '1px solid rgba(104,168,119,.25)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', color: S.muted }}>{s.fecha ?? '—'} {s.hora ? `· ${s.hora}` : ''}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: estadoColor, background: `${estadoColor}18`, borderRadius: '4px', padding: '0.1rem 0.45rem' }}>{estado}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: S.text, fontWeight: 600, marginBottom: '0.15rem' }}>{s.combo || 'Sin detalle'}</div>
                        <div style={{ fontSize: '0.68rem', color: S.muted }}>{s.marcaLabel || 'OVER'} · {s.vendorName} · {region}</div>
                        {s.codigoPublicidad && <div style={{ fontSize: '0.65rem', color: '#EB7347', marginTop: '0.1rem' }}>Pub: {s.codigoPublicidad}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: S.accent }}>S/{s.totalTotal ?? 0}</div>
                        {s.separo && <div style={{ fontSize: '0.65rem', color: S.muted }}>Separo: S/{s.separo}</div>}
                        {s.resta && parseFloat(s.resta) > 0 && (
                          <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>Debe S/{s.resta}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(104,168,119,.15)', paddingTop: '0.45rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => exportSalePDF(s)}
                        title="Descargar comprobante de esta compra"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: '5px', border: '1px solid rgba(69,131,77,.3)', background: 'rgba(69,131,77,.07)', color: S.accent, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>
                        <FileDown size={11} /> Comprobante
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmación ── */}
      {confirmModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmModal(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.75rem', border: `2px solid ${confirmModal.variant === 'danger' ? 'rgba(239,68,68,.3)' : 'rgba(239,150,0,.3)'}`, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: confirmModal.variant === 'danger' ? 'rgba(239,68,68,.1)' : 'rgba(239,150,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {confirmModal.variant === 'danger' ? '🗑' : '⚠️'}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#162e20', marginBottom: '0.3rem' }}>{confirmModal.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#517861', lineHeight: 1.5 }}>{confirmModal.description}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(104,168,119,.35)', background: 'transparent', color: '#517861', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                Cancelar
              </button>
              <button
                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: confirmModal.variant === 'danger' ? '#ef4444' : '#e97700', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de edición ── */}
      {editingId && editForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div style={{ background: '#ffffff', border: '1px solid rgba(104,168,119,.35)', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: S.text2 }}>Editar Registro</div>
                <div style={{ fontSize: '0.72rem', color: S.muted, marginTop: '0.15rem' }}>ID: {editingId}</div>
              </div>
              <button onClick={closeEdit} style={{ background: 'transparent', border: 'none', color: S.muted, cursor: 'pointer', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem 1rem' }}>
              {([{ key: 'nom', label: 'Cliente' },
                { key: 'cel', label: 'Celular' },
                { key: 'dni', label: 'DNI' },
                { key: 'hora', label: 'Hora' },
                { key: 'fecha', label: 'Fecha', type: 'date' },
                { key: 'total_total', label: 'Total S/', type: 'number' },
                { key: 'resta', label: 'Debe' },
                { key: 'separo', label: 'Separo' },
                { key: 'codigo_publicidad', label: 'Cod. Publicidad' },
                { key: 'combo', label: 'Combo' },
              ] as { key: keyof EditForm; label: string; type?: string }[]).map(({ key, label, type }) => (
                <div key={key}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
                  <input
                    type={type ?? 'text'}
                    value={editForm[key]}
                    onChange={e => setEditForm(f => f ? { ...f, [key]: e.target.value } : f)}
                    style={{ ...iStyle, width: '100%' }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Método de Pago</div>
                <select value={editForm.metodo_pago} onChange={e => setEditForm(f => f ? { ...f, metodo_pago: e.target.value } : f)} style={{ ...iStyle, width: '100%' }}>
                  <option value="Contra entrega">Contra entrega</option>
                  <option value="Pago completo">Pago completo</option>
                  <option value="Yape Import Textil">Yape Import Textil</option>
                  <option value="Anulado">Anulado</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Marca</div>
                <select value={editForm.marca_label} onChange={e => setEditForm(f => f ? { ...f, marca_label: e.target.value } : f)} style={{ ...iStyle, width: '100%' }}>
                  <option value="OVER">OVER</option>
                  <option value="BRV">BRV</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Vendedor</div>
                <select value={editForm.user_id} onChange={e => setEditForm(f => f ? { ...f, user_id: e.target.value } : f)} style={{ ...iStyle, width: '100%' }}>
                  <option value="">— sin cambiar —</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {editError && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                {editError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={closeEdit} style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(104,168,119,.35)', background: 'transparent', color: S.muted, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                Cancelar
              </button>
              <button onClick={handleEditSave} disabled={editSaving} style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', border: 'none', background: editSaving ? 'rgba(69,131,77,.3)' : 'linear-gradient(135deg,#45834D,#3a6d42)', color: '#fff', cursor: editSaving ? 'default' : 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesByDayChart({ data, accent }: { data: [string, number][]; accent: string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {data.map(([fecha, count]) => (
        <div key={fecha} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '2px' }}>
          <span style={{ fontSize: '0.55rem', color: '#a08060', fontWeight: 700 }}>{count}</span>
          <div
            title={`${fecha.slice(5)}: ${count} ventas`}
            style={{
              width: '100%', minWidth: '4px',
              height: `${Math.max(8, (count / max) * 68)}px`,
              background: count === max ? `linear-gradient(180deg,${accent},rgba(69,131,77,.5))` : 'rgba(69,131,77,.3)',
              borderRadius: '2px 2px 0 0',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const b = (disabled: boolean): React.CSSProperties => ({
    padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
    border: '1px solid rgba(104,168,119,.35)', background: 'rgba(255,255,255,.9)',
    color: disabled ? 'rgba(81,120,97,.3)' : '#517861', borderRadius: '6px',
    cursor: disabled ? 'default' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  });
  return (
    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
      <button style={b(page === 1)} onClick={() => onPage(1)}>Primero</button>
      <button style={b(page === 1)} onClick={() => onPage(page - 1)}>Anterior</button>
      <span style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', color: '#517861', fontWeight: 600 }}>
        Página {page} de {totalPages}
      </span>
      <button style={b(page === totalPages)} onClick={() => onPage(page + 1)}>Siguiente</button>
      <button style={b(page === totalPages)} onClick={() => onPage(totalPages)}>Último</button>
    </div>
  );
}

const iStyle: React.CSSProperties = {
  padding: '0.45rem 0.65rem', border: '1px solid rgba(104,168,119,.35)',
  borderRadius: '8px', fontSize: '0.82rem',
  background: 'rgba(255,255,255,.97)', color: '#162e20',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem', color: '#517861', whiteSpace: 'nowrap',
};
