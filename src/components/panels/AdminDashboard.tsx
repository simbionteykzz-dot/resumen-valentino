import { useRef, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LogOut, RefreshCw, Filter, Search, Download, X, BarChart3, ShoppingBag, DollarSign, Package, AlertTriangle, Pencil, FileDown } from 'lucide-react';
import type { Profile } from '../../types';
import type { AdminSale } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  adminName: string;
  profiles: Profile[];
  onSignOut: () => void;
  onSwitchToVendedor: () => void;
}

type EditForm = {
  nom: string; cel: string; dni: string; hora: string; fecha: string;
  codigo_publicidad: string; metodo_pago: string; separo: string;
  resta: string; total_total: string; combo: string; marca_label: string;
};

function saleToForm(s: AdminSale): EditForm {
  return {
    nom: s.nom ?? '', cel: s.cel ?? '', dni: s.dni ?? '', hora: s.hora ?? '',
    fecha: s.fecha ?? '', codigo_publicidad: s.codigoPublicidad ?? '',
    metodo_pago: s.metodoPago ?? '', separo: s.separo ?? '',
    resta: s.resta ?? '', total_total: String(s.totalTotal ?? ''),
    combo: s.combo ?? '', marca_label: s.marcaLabel ?? '',
  };
}

export default function AdminDashboard({ adminName, onSignOut, onSwitchToVendedor }: AdminDashboardProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const {
    allSales, filteredSales, paginatedSales, loading,
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
    globalStats, vendorStats, brandStats, salesByDay, pubStats,
    liveCount,
    refresh, clearFilters,
    getRegion, getEstado, anularVenta, editSale,
  } = useAdmin();

  const [historyClient, setHistoryClient] = useState<{ nom: string; cel: string } | null>(null);
  const clientHistory = historyClient
    ? allSales.filter(s => s.cel === historyClient.cel).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
    : [];

  const exportClientPDF = () => {
    if (!historyClient || clientHistory.length === 0) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mg = 14;

    // Header
    doc.setFillColor(10, 14, 20);
    doc.rect(0, 0, W, 44, 'F');
    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, 4, 44, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg + 4, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 200, 245);
    doc.text('Historial de Cliente', mg + 4, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(historyClient.nom.toUpperCase(), mg + 4, 29);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 107, 0);
    doc.text(historyClient.cel, mg + 4, 36);

    doc.setFontSize(7);
    doc.setTextColor(100, 80, 55);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, W - mg, 39, { align: 'right' });

    // KPI boxes
    const totalRevenue = clientHistory.reduce((a, s) => a + (Number(s.totalTotal) || 0), 0);
    const totalDeuda = clientHistory.reduce((a, s) => { const v = parseFloat(s.resta || '0'); return a + (isNaN(v) ? 0 : v); }, 0);
    const kpis = [
      { label: 'COMPRAS', value: String(clientHistory.length), rgb: [56, 200, 245] as [number, number, number] },
      { label: 'TOTAL S/', value: `S/${totalRevenue.toLocaleString()}`, rgb: [0, 230, 150] as [number, number, number] },
      { label: 'DEUDA S/', value: `S/${totalDeuda.toFixed(0)}`, rgb: totalDeuda > 0 ? [239, 68, 68] as [number, number, number] : [100, 100, 100] as [number, number, number] },
    ];
    const boxW = (W - mg * 2 - 8) / 3;
    kpis.forEach((k, i) => {
      const x = mg + i * (boxW + 4);
      doc.setFillColor(18, 24, 32);
      doc.roundedRect(x, 50, boxW, 24, 2, 2, 'F');
      doc.setFillColor(...k.rgb);
      doc.rect(x, 50, boxW, 2, 'F');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...k.rgb);
      doc.text(k.label, x + boxW / 2, 58, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(k.value, x + boxW / 2, 69, { align: 'center' });
    });

    // Table
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
      styles: { fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }, textColor: [190, 165, 140], lineColor: [35, 28, 20], lineWidth: 0.25 },
      headStyles: { fillColor: [20, 28, 38], textColor: [255, 107, 0], fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [16, 20, 28] },
      bodyStyles: { fillColor: [12, 16, 22] },
      columnStyles: {
        4: { textColor: [0, 230, 150], fontStyle: 'bold' },
        5: { fontStyle: 'bold' },
        6: { textColor: [239, 68, 68] },
      },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 5) return;
        const v = String(data.cell.raw);
        if (v === 'PAGO COMPLETO') data.cell.styles.textColor = [0, 230, 150];
        else if (v === 'CONTRA ENTREGA') data.cell.styles.textColor = [255, 160, 50];
        else if (v === 'ANULADO') data.cell.styles.textColor = [239, 68, 68];
      },
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        doc.setDrawColor(255, 107, 0);
        doc.setLineWidth(0.4);
        doc.line(mg, H - 8, W - mg, H - 8);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 75, 50);
        doc.text(`Livex Agency · ${historyClient.nom} · ${historyClient.cel}`, mg, H - 4.5);
        doc.text(`Página ${data.pageNumber} de ${totalPages}`, W - mg, H - 4.5, { align: 'right' });
      },
      margin: { top: 82, left: mg, right: mg, bottom: 12 },
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
    const estadoRgb: [number, number, number] = estado === 'PAGO COMPLETO' ? [0, 230, 150] : estado === 'CONTRA ENTREGA' ? [255, 160, 50] : estado === 'ANULADO' ? [239, 68, 68] : [160, 128, 96];

    // Fondo total
    doc.setFillColor(8, 11, 16);
    doc.rect(0, 0, W, H, 'F');

    // Barra superior naranja
    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, W, 6, 'F');

    // Encabezado empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg, 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 200, 245);
    doc.text('COMPROBANTE DE COMPRA', mg, 29);

    // Número de comprobante y fecha
    doc.setFontSize(7.5);
    doc.setTextColor(100, 80, 55);
    doc.text(`Ref: ${s._dbId?.slice(-8).toUpperCase() ?? 'N/A'}`, W - mg, 22, { align: 'right' });
    doc.text(`${s.fecha ?? '—'}  ${s.hora ? `· ${s.hora}` : ''}`, W - mg, 29, { align: 'right' });

    // Línea separadora
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.3);
    doc.line(mg, 34, W - mg, 34);

    // ── Bloque CLIENTE ──
    let y = 42;
    const section = (title: string) => {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 107, 0);
      doc.text(title, mg, y);
      y += 1;
      doc.setDrawColor(255, 107, 0, );
      doc.setLineWidth(0.2);
      doc.line(mg, y + 1, W - mg, y + 1);
      y += 5;
    };
    const row = (label: string, value: string, valueColor?: [number, number, number]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 95, 70);
      doc.text(label, mg, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(valueColor ?? [220, 200, 180] as [number, number, number]));
      doc.text(value, mg + 42, y);
      y += 7;
    };
    const rowHalf = (pairs: [string, string, ([number,number,number] | undefined)?][]) => {
      const colW = (W - mg * 2) / pairs.length;
      pairs.forEach(([label, value, color], i) => {
        const x = mg + i * colW;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 95, 70);
        doc.text(label, x, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(color ?? [220, 200, 180] as [number, number, number]));
        doc.text(value, x + 22, y);
      });
      y += 7;
    };

    section('DATOS DEL CLIENTE');
    row('Nombre', s.nom || '—');
    rowHalf([['Celular', s.cel || '—', [56, 200, 245]], ['DNI', s.dni || '—']]);
    rowHalf([['Región', region], ['Marca', s.marcaLabel || 'OVER', [255, 107, 0]]]);

    // Destino según región
    if (region === 'Provincia' && (s.sede || s.provincia || s.depto)) {
      y += 1;
      if (s.sede) row('Sede Shalom', s.sede, [255, 160, 50]);
      if (s.provincia || s.depto) rowHalf([['Departamento', s.provincia || '—'], ['Provincia', s.depto || '—']]);
    } else if (region === 'Lima' && (s.distrito || s.ubicacion)) {
      y += 1;
      if (s.distrito) row('Distrito', s.distrito, [56, 200, 245]);
      if (s.ubicacion) {
        const ubLines = doc.splitTextToSize(s.ubicacion, W - mg * 2 - 44);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 95, 70);
        doc.text('Ubicación', mg, y);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 200, 180);
        doc.text(ubLines, mg + 42, y);
        y += ubLines.length * 6 + 1;
      }
    }

    y += 2;
    section('DETALLE DEL PEDIDO');

    // Detalle completo con colores/tallas si está disponible
    if (s.detalle && s.detalle.trim()) {
      const detalleLines = doc.splitTextToSize(s.detalle.trim(), W - mg * 2);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(190, 165, 130);
      doc.text(detalleLines, mg, y);
      y += detalleLines.length * 5.5 + 3;
    } else {
      // Fallback: mostrar combo resumido
      const comboLines = doc.splitTextToSize(s.combo || 'Sin detalle', W - mg * 2 - 44);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 95, 70);
      doc.text('Combo', mg, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 200, 180);
      doc.text(comboLines, mg + 42, y);
      y += comboLines.length * 6 + 1;
    }

    rowHalf([['Cantidad', `${s.qtyN ?? '—'} prendas`], ['Vendedor', s.vendorName || '—', [255, 107, 0]]]);
    if (s.codigoPublicidad) row('Cod. Publicidad', s.codigoPublicidad, [167, 139, 250]);

    y += 2;
    section('RESUMEN DE PAGO');
    row('Método de pago', s.metodoPago || '—');
    row('Total', `S/ ${s.totalTotal ?? 0}`, [0, 230, 150]);
    if (s.separo) row('Separo / Adelanto', `S/ ${s.separo}`, [56, 200, 245]);
    if (s.resta && parseFloat(s.resta) > 0) row('Saldo pendiente', `S/ ${s.resta}`, [239, 68, 68]);

    // Badge de estado centrado
    y += 4;
    const badgeW = 60;
    const badgeX = (W - badgeW) / 2;
    doc.setFillColor(estadoRgb[0], estadoRgb[1], estadoRgb[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
    doc.roundedRect(badgeX, y, badgeW, 10, 2, 2, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    doc.setDrawColor(...estadoRgb);
    doc.setLineWidth(0.4);
    doc.roundedRect(badgeX, y, badgeW, 10, 2, 2, 'S');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...estadoRgb);
    doc.text(estado, W / 2, y + 6.8, { align: 'center' });

    // Footer
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.3);
    doc.line(mg, H - 16, W - mg, H - 16);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 60, 40);
    doc.text('Livex Agency · Comprobante interno de venta', W / 2, H - 11, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, W / 2, H - 6, { align: 'center' });

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
    const headers = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGION', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'];
    const rows = filteredSales.map(s => [
      s.fecha ?? '', s.marcaLabel ?? 'OVER', s.vendorName ?? '',
      s.hora ?? '', getRegion(s), s.nom ?? '', s.cel ?? '', s.dni ?? '',
      s.totalTotal ?? 0, s.resta ?? '', s.separo ?? '',
      getEstado(s), s.codigoPublicidad ?? '', s.metodoPago ?? '', s.combo ?? '',
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
    const mg = 14;
    const headerH = 40;

    // ── Fondo del encabezado ──
    doc.setFillColor(10, 14, 20);
    doc.rect(0, 0, W, headerH, 'F');

    // Barra lateral naranja
    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, 5, headerH, 'F');

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('LIVEX AGENCY', mg + 4, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 200, 245);
    doc.text('Reporte de Ventas', mg + 4, 22);

    doc.setFontSize(7.5);
    doc.setTextColor(130, 100, 70);
    doc.text(`Período: ${dateFrom}  →  ${dateTo}`, mg + 4, 29);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, mg + 4, 35);

    // ── KPI boxes ──
    const kpis = [
      { label: 'VENTAS', value: String(globalStats.salesCount), rgb: [255, 107, 0] as [number, number, number] },
      { label: 'INGRESOS', value: `S/${globalStats.totalRevenue.toLocaleString()}`, rgb: [56, 200, 245] as [number, number, number] },
      { label: 'PRENDAS', value: String(globalStats.totalItems), rgb: [167, 139, 250] as [number, number, number] },
      { label: 'DEUDA', value: `S/${globalStats.deudaTotal.toFixed(0)}`, rgb: [239, 68, 68] as [number, number, number] },
    ];
    const boxW = 46;
    const boxGap = 4;
    const boxH = 28;
    const boxTop = 6;
    const startX = W - mg - kpis.length * boxW - (kpis.length - 1) * boxGap;

    kpis.forEach((kpi, i) => {
      const x = startX + i * (boxW + boxGap);
      // Box fill
      doc.setFillColor(18, 24, 32);
      doc.roundedRect(x, boxTop, boxW, boxH, 2, 2, 'F');
      // Top accent
      doc.setFillColor(...kpi.rgb);
      doc.rect(x, boxTop, boxW, 2.5, 'F');
      // Label
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...kpi.rgb);
      doc.text(kpi.label, x + boxW / 2, boxTop + 9, { align: 'center' });
      // Value
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(kpi.value, x + boxW / 2, boxTop + 22, { align: 'center' });
    });

    // ── Tabla ──
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
      startY: headerH + 4,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 6.2,
        cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
        lineColor: [35, 28, 20],
        lineWidth: 0.25,
        textColor: [190, 165, 140],
        font: 'helvetica',
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: [20, 28, 38],
        textColor: [255, 107, 0],
        fontStyle: 'bold',
        fontSize: 6.2,
        lineColor: [50, 38, 25],
        lineWidth: 0.4,
      },
      alternateRowStyles: {
        fillColor: [16, 20, 28],
      },
      bodyStyles: {
        fillColor: [12, 16, 22],
      },
      columnStyles: {
        8:  { textColor: [0, 230, 150], fontStyle: 'bold' },
        11: { fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 11) {
          const v = String(data.cell.raw);
          if (v === 'PAGO COMPLETO') data.cell.styles.textColor = [0, 230, 150];
          else if (v === 'CONTRA ENTREGA') data.cell.styles.textColor = [255, 160, 50];
          else if (v === 'ANULADO') data.cell.styles.textColor = [239, 68, 68];
          else data.cell.styles.textColor = [190, 165, 140];
        }
        if (data.column.index === 1) {
          const v = String(data.cell.raw).toUpperCase();
          if (v.includes('BRV') || v.includes('BRAVOS')) data.cell.styles.textColor = [167, 139, 250];
          else data.cell.styles.textColor = [255, 107, 0];
        }
        if (data.column.index === 2) {
          data.cell.styles.textColor = [56, 200, 245];
        }
      },
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        const pg = data.pageNumber;
        // Footer line
        doc.setDrawColor(255, 107, 0);
        doc.setLineWidth(0.4);
        doc.line(mg, H - 8, W - mg, H - 8);
        // Footer text
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 75, 50);
        doc.text(
          `Livex Agency · Panel de Ventas · ${new Date().toLocaleDateString('es-PE')}`,
          mg, H - 4.5,
        );
        doc.text(
          `Página ${pg} de ${totalPages}`,
          W - mg, H - 4.5,
          { align: 'right' },
        );
      },
      margin: { top: headerH + 4, left: mg, right: mg, bottom: 12 },
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
          <button onClick={onSwitchToVendedor} style={{ ...btn('info'), border: '1px solid rgba(56,200,245,0.25)' }}>
            📋 Vista Vendedor
          </button>
          <button onClick={onSignOut} style={{ ...btn('danger'), border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.5rem 2rem' }}>

        {/* ── KPI cards (5) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem', marginBottom: '1rem' }}>
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

        {/* ── Rendimiento por Código de Publicidad ── */}
        {pubStats.length > 0 && (
          <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.85rem' }}>
              Rendimiento por Código de Publicidad
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {pubStats.map((p, i) => {
                const maxRev = pubStats[0].revenue;
                const barPct = maxRev > 0 ? Math.round((p.revenue / maxRev) * 100) : 0;
                const totalRev = pubStats.reduce((a, x) => a + x.revenue, 0);
                const pct = totalRev > 0 ? Math.round((p.revenue / totalRev) * 100) : 0;
                const hue = [S.accent, '#1e6fa0', '#EB7347', '#68A877', '#f59e0b', '#ec4899'][i % 6];
                return (
                  <div key={p.code} style={{ background: 'rgba(242,251,245,.5)', border: '1px solid rgba(104,168,119,.25)', borderRadius: '8px', padding: '0.5rem 0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: S.text }}>{p.code}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: S.muted }}>{p.count} ventas · {p.items} prendas</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: hue }}>S/{p.revenue.toLocaleString()}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(69,131,77,.06)', borderRadius: '4px', padding: '0.1rem 0.45rem', color: hue }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(104,168,119,.2)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barPct}%`, background: `linear-gradient(90deg,${hue},${hue}88)`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ranking + Gráfico por día ── */}
        <div style={{ display: 'grid', gridTemplateColumns: vendorStats.length > 0 ? '1fr 320px' : '1fr', gap: '1rem', marginBottom: '1.25rem' }}>

          {/* Ranking mejorado */}
          {vendorStats.length > 0 && (
            <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Ranking de Vendedores</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {vendorStats.map((v, i) => {
                  const pct = globalStats.totalRevenue > 0 ? Math.round((v.totalRevenue / globalStats.totalRevenue) * 100) : 0;
                  const barPct = maxVendorRevenue > 0 ? Math.round((v.totalRevenue / maxVendorRevenue) * 100) : 0;
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                  return (
                    <div key={v.id} style={{ background: i === 0 ? 'rgba(69,131,77,0.08)' : 'rgba(242,251,245,.6)', border: `1px solid ${i === 0 ? 'rgba(69,131,77,0.25)' : 'rgba(104,168,119,.25)'}`, borderRadius: '8px', padding: '0.55rem 0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: S.text }}>
                          {medal} {v.name}
                        </span>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: S.muted }}>{v.salesCount}v · {v.totalItems}p</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: S.accent }}>S/{v.totalRevenue.toLocaleString()}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#EB7347', background: 'rgba(235,115,71,0.1)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(104,168,119,.2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barPct}%`, background: i === 0 ? 'linear-gradient(90deg,#45834D,#8FCA97)' : 'linear-gradient(90deg,rgba(174,219,184,.7),rgba(143,202,151,.5))', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
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
        </div>

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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,rgba(69,131,77,.12),rgba(58,109,66,.08))', borderBottom: '2px solid rgba(69,131,77,.25)' }}>
                  {['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO', ''].map(h => (
                    <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.65rem', letterSpacing: '0.05em', color: '#45834D', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((s, i) => {
                  const region = getRegion(s);
                  const estado = getEstado(s);
                  const regionColor = region === 'Lima' ? { bg: 'rgba(30,111,160,.1)', color: '#1e6fa0' } : region === 'Provincia' ? { bg: 'rgba(160,120,10,.1)', color: '#a0780a' } : { bg: 'rgba(81,120,97,.1)', color: '#517861' };
                  const estadoColor = estado === 'PAGO COMPLETO' ? { bg: 'rgba(69,131,77,.1)', color: '#45834D' } : estado === 'CONTRA ENTREGA' ? { bg: 'rgba(160,120,10,.1)', color: '#a0780a' } : estado === 'ANULADO' ? { bg: 'rgba(239,68,68,.08)', color: '#ef4444' } : { bg: 'rgba(239,68,68,.1)', color: '#ef4444' };
                  const bc = getBrandColor(s.marcaLabel || 'OVER');
                  const isAnulado = estado === 'ANULADO';
                  return (
                    <tr key={s._dbId ?? i}
                      style={{ borderBottom: '1px solid rgba(104,168,119,.2)', background: isAnulado ? 'rgba(239,68,68,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(242,251,245,.6)', transition: 'background 0.15s', opacity: isAnulado ? 0.6 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(69,131,77,.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isAnulado ? 'rgba(239,68,68,.03)' : i % 2 === 0 ? 'transparent' : 'rgba(242,251,245,.6)')}>
                      <td style={td}>{s.fecha ?? '—'}</td>
                      <td style={td}>
                        <span style={{ background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`, borderRadius: '5px', padding: '0.15rem 0.55rem', fontWeight: 800, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                          {s.marcaLabel || 'OVER'}
                        </span>
                      </td>
                      <td style={{ ...td, color: S.accent, fontWeight: 700 }}>{s.vendorName}</td>
                      <td style={{ ...td, color: S.muted }}>{s.hora ?? '—'}</td>
                      <td style={td}>
                        <span style={{ background: regionColor.bg, color: regionColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.68rem' }}>{region}</span>
                      </td>
                      <td style={{ ...td, fontWeight: 600, color: '#f0e6d8' }}>
                        <span
                          onClick={() => s.cel && setHistoryClient({ nom: s.nom || '—', cel: s.cel })}
                          style={{ cursor: s.cel ? 'pointer' : 'default', borderBottom: s.cel ? '1px dashed rgba(56,200,245,0.4)' : 'none' }}
                          title={s.cel ? 'Ver historial del cliente' : undefined}>
                          {s.nom || '—'}
                        </span>
                      </td>
                      <td style={td}>{s.cel || '—'}</td>
                      <td style={td}>{s.dni || '—'}</td>
                      <td style={{ ...td, fontWeight: 900, color: S.accent }}>S/{s.totalTotal ?? 0}</td>
                      <td style={{ ...td, color: s.resta ? '#ef4444' : S.muted }}>{s.resta || '—'}</td>
                      <td style={td}>{s.separo || '—'}</td>
                      <td style={td}>
                        <span style={{ background: estadoColor.bg, color: estadoColor.color, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{estado}</span>
                      </td>
                      <td style={td}>{s.codigoPublicidad || '—'}</td>
                      <td style={td}>{s.metodoPago || '—'}</td>
                      <td style={{ ...td, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: S.muted }}>{s.combo || '—'}</td>
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
                              onClick={() => anularVenta(s._dbId!)}
                              title="Anular venta"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '5px', color: '#ef4444', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              ✕ Anular
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={16} style={{ padding: '3rem', textAlign: 'center', color: S.muted, fontSize: '0.85rem' }}>
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
      </div>

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
