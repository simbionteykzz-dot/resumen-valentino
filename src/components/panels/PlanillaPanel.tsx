import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Printer, FileSpreadsheet, Lightbulb, BarChart3, FileText, Trash2, RotateCcw, ChevronDown, ChevronUp, FileDown, AlertTriangle } from 'lucide-react';
import type { Profile } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawCierreCajaPage(pdf: any, sales: any[], pageW: number, pageH: number) {
  const M = 10;
  const GAP = 3.5;

  const totalVentas    = sales.length;
  const totalPrendas   = sales.reduce((a, v) => a + (Number(v.qtyN) || 0), 0);
  const totalSoles     = sales.reduce((a, v) => a + (Number(v.totalTotal) || 0), 0);
  const enviosLima     = sales.filter(v => v.limaMark).length;
  const enviosProv     = sales.filter(v => v.provMark).length;
  const totalSeparos   = sales.reduce((a, v) => a + (parseFloat(v.separo) || 0), 0);
  const totalDeudas    = sales.reduce((a, v) => a + (parseFloat(v.resta)  || 0), 0);
  const pagosCompletos = sales.filter(v => v.pagoCompletoTxt).length;
  const contraEntrega  = sales.filter(v => v.separo || v.resta).length;
  const promedioVenta   = totalVentas > 0 ? totalSoles   / totalVentas : 0;
  const promedioPrendas = totalVentas > 0 ? totalPrendas / totalVentas : 0;

  const solesStr = (n: number) => n % 1 === 0 ? `S/ ${Math.round(n)}` : `S/ ${n.toFixed(2)}`;

  const CW4 = (pageW - 2 * M - 3 * GAP) / 4;
  const CW2 = (pageW - 2 * M - GAP) / 2;
  const xs4 = [M, M + CW4 + GAP, M + 2 * (CW4 + GAP), M + 3 * (CW4 + GAP)];
  const xs2 = [M, M + CW2 + GAP];

  type RGB = [number, number, number];

  // ── Card: filled bg + subtle border + full-width TOP accent bar ────────────
  const card = (
    x: number, y: number, w: number, h: number,
    bg: RGB, accent: RGB,
    label: string, value: string, sub?: string,
  ) => {
    // fill
    pdf.setFillColor(...bg);
    pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    // border
    pdf.setDrawColor(accent[0], accent[1], accent[2]);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'S');
    // top accent bar (full width, 3mm)
    pdf.setFillColor(...accent);
    pdf.roundedRect(x, y, w, 3, 1.5, 1.5, 'F');
    // label (below accent bar)
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 100, 90);
    pdf.text(label.toUpperCase(), x + 5, y + 9.5);
    // value
    const longVal = value.length > 9;
    const valueSize = h <= 32 ? (longVal ? 14 : 17) : sub ? (longVal ? 15 : 18) : (longVal ? 16 : 21);
    pdf.setFontSize(valueSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...accent);
    pdf.text(value, x + 5, y + h - (sub ? 9 : 5.5));
    // sub
    if (sub) {
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(110, 130, 120);
      pdf.text(sub, x + 5, y + h - 3.5);
    }
  };

  // ── Section label: colored dot + text + line ───────────────────────────────
  const sectionLabel = (label: string, y: number, color: RGB = [69, 131, 77]) => {
    pdf.setFillColor(...color);
    pdf.circle(M + 1.8, y - 1.8, 1.8, 'F');
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...color);
    pdf.text(label, M + 5.5, y);
    const tw = pdf.getTextWidth(label);
    pdf.setDrawColor(180, 210, 195);
    pdf.setLineWidth(0.25);
    pdf.line(M + 5.5 + tw + 3, y - 1.5, pageW - M, y - 1.5);
  };

  // ── TOP STRIPE (full page, 4mm dark green) ─────────────────────────────────
  pdf.setFillColor(18, 50, 30);
  pdf.rect(0, 0, pageW, 4, 'F');

  // ── HEADER BAND (dark green panel) ─────────────────────────────────────────
  const HY = 6, HH = 28;
  pdf.setFillColor(22, 52, 33);
  pdf.roundedRect(M, HY, pageW - 2 * M, HH, 3, 3, 'F');
  pdf.setDrawColor(50, 100, 65);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(M, HY, pageW - 2 * M, HH, 3, 3, 'S');

  // title + subtitle (left side)
  pdf.setFontSize(15);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('CIERRE DE CAJA', M + 7, HY + 11);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 185, 145);
  const dateStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  pdf.text(`${totalVentas} ventas registradas  ·  ${dateStr}`, M + 7, HY + 20);

  // right side: LIVEX + total recaudado highlight box
  const rhW = 72, rhX = pageW - M - rhW, rhY = HY + 3;
  pdf.setFillColor(55, 110, 70);
  pdf.roundedRect(rhX, rhY, rhW, HH - 6, 2.5, 2.5, 'F');
  pdf.setFontSize(5.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(140, 215, 165);
  pdf.text('TOTAL RECAUDADO', rhX + rhW / 2, rhY + 6, { align: 'center' });
  pdf.setFontSize(15);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(solesStr(totalSoles), rhX + rhW / 2, rhY + 15.5, { align: 'center' });
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(140, 215, 165);
  pdf.text('LIVEX AGENCY', rhX + rhW / 2, rhY + HH - 9, { align: 'center' });

  // ── SECTION 1: Métricas principales ────────────────────────────────────────
  const Y1 = HY + HH + 8;
  sectionLabel('METRICAS PRINCIPALES', Y1 - 2);
  const H1 = 46;

  card(xs4[0], Y1, CW4, H1, [228, 246, 233], [55, 120, 65],  'Ventas Registradas', String(totalVentas));
  card(xs4[1], Y1, CW4, H1, [220, 240, 228], [35, 90, 48],   'Prendas Totales',    String(totalPrendas));
  card(xs4[2], Y1, CW4, H1, [220, 237, 250], [25, 100, 155], 'Promedio por Venta', solesStr(promedioVenta));

  // Envíos card (two sub-rows inside)
  {
    const x = xs4[3], y = Y1, w = CW4, h = H1;
    pdf.setFillColor(252, 246, 225);
    pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    pdf.setDrawColor(155, 115, 8);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'S');
    // top accent
    pdf.setFillColor(155, 115, 8);
    pdf.roundedRect(x, y, w, 3, 1.5, 1.5, 'F');
    // label
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 100, 90);
    pdf.text('ENVIOS POR ZONAS', x + 5, y + 9.5);
    // Lima row
    const ry1 = y + 13;
    pdf.setFillColor(210, 232, 248);
    pdf.roundedRect(x + 3.5, ry1, w - 7, 12, 1.5, 1.5, 'F');
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 100, 150);
    pdf.text('Lima', x + 7, ry1 + 8);
    pdf.setFontSize(13);
    pdf.text(String(enviosLima), x + w - 6.5, ry1 + 8, { align: 'right' });
    // Prov row
    const ry2 = ry1 + 15;
    pdf.setFillColor(255, 242, 212);
    pdf.roundedRect(x + 3.5, ry2, w - 7, 12, 1.5, 1.5, 'F');
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(150, 110, 8);
    pdf.text('Provincia', x + 7, ry2 + 8);
    pdf.setFontSize(13);
    pdf.text(String(enviosProv), x + w - 6.5, ry2 + 8, { align: 'right' });
  }

  // ── SECTION 2: Detalle de pagos ─────────────────────────────────────────────
  const Y2 = Y1 + H1 + 9;
  sectionLabel('DETALLE DE PAGOS', Y2 - 2, [20, 120, 170]);
  const H2 = 38;

  card(xs4[0], Y2, CW4, H2, [220, 244, 252], [15, 128, 180],  'Total Separos',    solesStr(totalSeparos));
  card(xs4[1], Y2, CW4, H2, [252, 243, 220], [170, 110, 8],   'Por Cobrar',       solesStr(totalDeudas));
  card(xs4[2], Y2, CW4, H2, [224, 248, 230], [35, 150, 72],   'Pago Completo',    String(pagosCompletos), `de ${totalVentas} ventas`);
  card(xs4[3], Y2, CW4, H2, [236, 238, 246], [90, 100, 138],  'Contra Entrega',   String(contraEntrega),  'ventas con saldo');

  // ── SECTION 3: Promedios ────────────────────────────────────────────────────
  const Y3 = Y2 + H2 + 9;
  sectionLabel('PROMEDIOS', Y3 - 2, [45, 100, 55]);
  const H3 = 32;

  card(xs2[0], Y3, CW2, H3, [228, 246, 233], [55, 120, 65],  'Promedio de Venta (S/)', solesStr(promedioVenta));
  card(xs2[1], Y3, CW2, H3, [220, 237, 250], [25, 100, 155], 'Prendas por Venta',      promedioPrendas.toFixed(1));

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const yF = Y3 + H3 + 6;
  if (yF < pageH - 6) {
    pdf.setFillColor(18, 50, 30);
    pdf.rect(0, pageH - 7, pageW, 7, 'F');
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 170, 130);
    pdf.text('LIVEX AGENCY — Sistema de Gestion de Ventas', M, pageH - 2.5);
    pdf.text(new Date().toLocaleString('es-PE'), pageW - M, pageH - 2.5, { align: 'right' });
  }
}

const abrevMetodo = (m: string) => {
  if (!m) return 'I.T';
  const l = m.toLowerCase();
  if (l.includes('yape') || l.includes('import')) return 'I.T';
  if (l.includes('completo')) return 'P.C';
  if (l.includes('contra')) return 'C.E';
  return m.slice(0, 4).toUpperCase();
};

interface PlanillaPanelProps {
  sales: any[];
  deletedSales?: any[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  loadingSync: boolean;
  syncError: string | null;
  onDeleteSale?: (index: number) => void;
  onRestoreSale?: (dbId: string) => void;
  profiles?: Profile[];
  /** Nombre del usuario autenticado — se fija en la celda VENDEDOR sin permitir edición */
  currentUserName?: string;
  /** Etiqueta que aparece en el encabezado: "Planilla de ventas · {title}" */
  title?: string;
  /**
   * 'live'        → muestra solo ventas con codigoPublicidad === 'Live' o vacío
   * 'publicidad'  → muestra ventas con codigoPublicidad distinto de 'Live' y no vacío
   * undefined     → muestra todas (comportamiento original)
   */
  sourceFilter?: 'live' | 'publicidad';
  /** ID del div exportable (único por instancia). Por defecto "sales-sheet-export". */
  exportId?: string;
  /** Fija el filtro de marca y oculta los botones de selección de marca */
  forcedBrand?: 'OVER' | 'BRV';
}

export default function PlanillaPanel({
  sales, deletedSales = [], selectedDate, onDateChange,
  loadingSync, syncError, onDeleteSale, onRestoreSale, profiles = [],
  currentUserName, title, sourceFilter, exportId = 'sales-sheet-export', forcedBrand,
}: PlanillaPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [brandView, setBrandView] = useState<'todas' | 'OVER' | 'BRV'>(forcedBrand ?? 'todas');
  const [sourceView, setSourceView] = useState('todas');
  const [blankMode, setBlankMode] = useState(false);
  const [localEdits, setLocalEdits] = useState<Record<string, Record<string, string>>>({});

  const handleBlur = (rowKey: string, field: string, e: React.FocusEvent<HTMLTableCellElement>) => {
    const value = e.currentTarget.textContent ?? '';
    setLocalEdits(prev => ({ ...prev, [rowKey]: { ...(prev[rowKey] ?? {}), [field]: value } }));
  };
  const cv = (rowKey: string, field: string, fallback: string) => localEdits[rowKey]?.[field] ?? fallback;

  const vendorLabel = currentUserName ?? 'VENDEDOR';

  // Pre-filtrado por sourceFilter (cuando el panel está dedicado a una fuente)
  const preFiltered = sourceFilter
    ? sales.filter(s => {
        const src = s.codigoPublicidad?.trim() || 'Live';
        return sourceFilter === 'live' ? src === 'Live' : src !== 'Live';
      })
    : sales;

  const uniqueSources = ['todas', ...Array.from(new Set(preFiltered.map(s => s.codigoPublicidad?.trim() || 'Live').filter(Boolean)))];

  const effectiveBrand = forcedBrand ?? brandView;

  const visibleSales = blankMode
    ? []
    : preFiltered.filter(s => {
        const matchBrand = effectiveBrand === 'todas' || (s.marcaLabel || 'OVER').toUpperCase().includes(effectiveBrand);
        const matchSource = sourceView === 'todas' || (s.codigoPublicidad?.trim() || 'Live') === sourceView;
        return matchBrand && matchSource;
      });

  const emptyRowsCount = Math.max(0, 40 - visibleSales.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  const exportPdf = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const m = 5;

      const targetPlanilla = document.getElementById(exportId);
      if (targetPlanilla) {
        const clone = targetPlanilla.cloneNode(true) as HTMLElement;
        clone.classList.add('print-mode');
        Object.assign(clone.style, {
          position: 'fixed', left: '-9999px', top: '0',
          width: '1200px', background: '#fff', padding: '0', margin: '0 auto',
        });
        document.body.appendChild(clone);
        await new Promise(resolve => setTimeout(resolve, 50));
        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff', scale: 3, useCORS: true,
          logging: false, width: 1200, windowWidth: 1200,
        });
        clone.remove();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', m, m, pageW - m * 2, pageH - m * 2);
      }

      // Siempre incluir cierre de caja como página 2
      pdf.addPage();
      let cierreSales = sourceFilter
        ? sales.filter((s: any) => {
            const src = (s.codigoPublicidad?.trim() || 'Live');
            return sourceFilter === 'live' ? src === 'Live' : src !== 'Live';
          })
        : sales;
      if (forcedBrand) {
        cierreSales = cierreSales.filter((s: any) => (s.marcaLabel || 'OVER').toUpperCase().includes(forcedBrand));
      }
      drawCierreCajaPage(pdf, cierreSales, pageW, pageH);

      const suffix = [
        sourceFilter === 'live' ? '-live' : sourceFilter === 'publicidad' ? '-publicidad' : '',
        forcedBrand ? `-${forcedBrand.toLowerCase()}` : '',
      ].join('');
      pdf.save(`planilla-ventas${suffix}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  const brandSuffix = forcedBrand === 'OVER' ? ' · Overshark' : forcedBrand === 'BRV' ? ' · Bravos' : '';
  const headingLabel = title ? `Planilla de ventas · ${title}${brandSuffix}` : `Planilla de ventas${brandSuffix}`;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      {/* ── Header / toggle ── */}
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #3a6d42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(69,131,77,.25)',
        }}>
          <FileSpreadsheet size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.1 }}>
            {headingLabel}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span><strong>{blankMode ? 0 : visibleSales.length}</strong> ventas</span>
            {deletedSales.length > 0 && <span style={{ color: '#ef4444' }}>{deletedSales.length} eliminadas</span>}
            {loadingSync && <span style={{ color: 'var(--accent)' }}>Cargando…</span>}
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
        }}>
          <ChevronDown size={15} style={{ color: 'var(--muted)' }} />
        </div>
      </button>

      {/* ── Contenido colapsable ── */}
      {!collapsed && (<>
      <div className="cliente-panel-head" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--muted)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BarChart3 size={14} /> <strong>{blankMode ? 0 : visibleSales.length}</strong> ventas
              {!blankMode && effectiveBrand !== 'todas' && <span style={{ color: 'var(--accent)' }}>({effectiveBrand})</span>}
              {!blankMode && sourceView !== 'todas' && <span style={{ color: '#7C3AED' }}>({sourceView})</span>}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileText size={14} /> <strong>{emptyRowsCount}</strong> filas disponibles
            </span>
            {deletedSales.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
                <Trash2 size={14} /> <strong>{deletedSales.length}</strong> eliminadas
              </span>
            )}
            {loadingSync && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>⏳ Cargando...</span>}
            {syncError && <span style={{ color: 'var(--danger)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {syncError}</span>}
          </div>
        </div>
        <div className="cliente-panel-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro por sub-fuente (solo cuando no hay sourceFilter fijo, o cuando hay múltiples valores) */}
          {!sourceFilter && uniqueSources.length > 2 && (
            <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--surface2)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border)' }}>
              {uniqueSources.map(src => (
                <button
                  key={src}
                  onClick={() => { setSourceView(src); setBlankMode(false); }}
                  style={{
                    padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 800,
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    background: !blankMode && sourceView === src ? '#7C3AED' : 'transparent',
                    color: !blankMode && sourceView === src ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}>
                  {src === 'todas' ? 'Todas fuentes' : src}
                </button>
              ))}
            </div>
          )}

          {/* Filtro por marca (oculto cuando la marca está forzada) */}
          {!forcedBrand && (
            <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--surface2)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border)' }}>
              {(['todas', 'OVER', 'BRV'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => { setBrandView(b); setBlankMode(false); }}
                  style={{
                    padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 800,
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    background: !blankMode && brandView === b ? 'var(--accent)' : 'transparent',
                    color: !blankMode && brandView === b ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s',
                  }}>
                  {b === 'todas' ? 'Todas' : b}
                </button>
              ))}
            </div>
          )}

          {/* Planilla en blanco */}
          <button
            onClick={() => setBlankMode(v => !v)}
            title="Planilla vacía para imprimir"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 800,
              border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer',
              background: blankMode ? 'var(--accent)' : 'var(--surface2)',
              color: blankMode ? '#fff' : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
            <FileDown size={14} /> {blankMode ? 'Ver con ventas' : 'Planilla vacía'}
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--surface3)',
              borderRadius: '8px', color: 'var(--text)', padding: '0.45rem 0.75rem',
              fontSize: '0.85rem', cursor: 'pointer',
            }}
          />
          <button className="btn btn-primary" onClick={exportPdf} disabled={exporting || loadingSync} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {exporting ? '⏳ Generando PDF...' : <><Printer size={16} /> Exportar PDF</>}
          </button>
        </div>
      </div>

      <p className="hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lightbulb size={16} style={{ flexShrink: 0 }} />
        <span>Usa <strong>Registrar venta</strong> en el panel "Texto para copiar" para registrar cada venta en la planilla.</span>
      </p>

      {/* ── Tabla principal ── */}
      <div id={exportId} style={{ width: '100%' }}>
        <div className="sheet-wrap">
          <table className="sales-sheet">
            <colgroup>
              <col style={{ width: '2.5%' }} />
              <col style={{ width: '6.5%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col className="col-del" style={{ width: '2.5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="col-n" rowSpan={2}>N°</th>
                <th className="col-cel" rowSpan={2}>CELULAR</th>
                <th className="col-nom" rowSpan={2}>NOMBRES</th>
                <th className="col-dni" rowSpan={2}>DNI</th>
                <th className="col-metodo" rowSpan={2}>MÉTODO<br />DE PAGO</th>
                <th className="col-hora" rowSpan={2}>HORA</th>
                <th className="col-ftiq" rowSpan={2}>ETIQ.</th>
                <th className="col-for" rowSpan={2}>FOR.</th>
                <th className="col-sis" rowSpan={2}>SIS.</th>
                <th className="col-cod" rowSpan={2}>CÓDIGO<br />PUBLICIDAD</th>
                <th className="col-marca" rowSpan={2}>MARCA</th>
                <th className="col-lima" rowSpan={2}>LIMA</th>
                <th className="col-prov" rowSpan={2}>PROV</th>
                <th className="col-contra-entrega" colSpan={2}>CONTRA ENTREGA</th>
                <th className="col-pago-completo" rowSpan={2}>PAGO COMPLETO</th>
                <th className="col-combo" rowSpan={2}>TIPO DE COMBO</th>
                <th className="col-del" rowSpan={2}></th>
              </tr>
              <tr>
                <th className="col-separo">SEPARÓ</th>
                <th className="col-resta">RESTA</th>
              </tr>
            </thead>
            <tbody>
              {visibleSales.map((sale, i) => {
                const rk = sale._dbId ?? `s${i}`;
                return (
                <tr key={rk}>
                  <td className="col-n">{i + 1}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'cel', e)}>{cv(rk, 'cel', sale.cel ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'nom', e)}>{cv(rk, 'nom', sale.nom ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'dni', e)}>{cv(rk, 'dni', sale.dni ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'metodo', e)}>{cv(rk, 'metodo', abrevMetodo(sale.metodoPago))}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'hora', e)}>{cv(rk, 'hora', sale.hora ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'etiq', e)}>{cv(rk, 'etiq', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'for', e)}>{cv(rk, 'for', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'sis', e)}>{cv(rk, 'sis', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'codPub', e)}>{cv(rk, 'codPub', sale.codigoPublicidad ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'marca', e)}>{cv(rk, 'marca', sale.marcaLabel ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'lima', e)}>{cv(rk, 'lima', sale.limaMark ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'prov', e)}>{cv(rk, 'prov', sale.provMark ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'separo', e)}>{cv(rk, 'separo', sale.separo ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'resta', e)}>{cv(rk, 'resta', sale.resta ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'pago', e)}>{cv(rk, 'pago', sale.pagoCompletoTxt ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'combo', e)}>{cv(rk, 'combo', sale.combo ?? '')}</td>
                  <td className="col-del">
                    {onDeleteSale && !blankMode && (
                      <button className="btn-del-row" onClick={() => onDeleteSale(sales.indexOf(sale))} title="Eliminar venta">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
              {emptyRows.map((_, i) => {
                const rk = `empty-${i}`;
                return (
                <tr key={rk}>
                  <td className="col-n">{visibleSales.length + i + 1}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'cel', e)}>{cv(rk, 'cel', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'nom', e)}>{cv(rk, 'nom', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'dni', e)}>{cv(rk, 'dni', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'metodo', e)}>{cv(rk, 'metodo', 'I.T')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'hora', e)}>{cv(rk, 'hora', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'etiq', e)}>{cv(rk, 'etiq', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'for', e)}>{cv(rk, 'for', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'sis', e)}>{cv(rk, 'sis', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'codPub', e)}>{cv(rk, 'codPub', sourceFilter === 'publicidad' ? '' : 'Live')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'marca', e)}>{cv(rk, 'marca', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'lima', e)}>{cv(rk, 'lima', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'prov', e)}>{cv(rk, 'prov', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'separo', e)}>{cv(rk, 'separo', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'resta', e)}>{cv(rk, 'resta', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'pago', e)}>{cv(rk, 'pago', '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'combo', e)}>{cv(rk, 'combo', '')}</td>
                  <td className="col-del"></td>
                </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={4} className="f-cel">CELULAR DE VENTA</th>
                <th colSpan={2} className="f-vend">VENDEDOR</th>
                <th colSpan={4} className="f-firma">FIRMA</th>
                <th colSpan={4} className="f-fecha">FECHA</th>
                <th colSpan={3} className="f-obs">OBSERVACIÓN / SUGERENCIAS</th>
              </tr>
              <tr>
                <td colSpan={4} className="f-cel" contentEditable suppressContentEditableWarning></td>
                <td colSpan={2} className="f-vend">{vendorLabel}</td>
                <td colSpan={4} className="f-firma" contentEditable suppressContentEditableWarning></td>
                <td colSpan={4} className="f-fecha" contentEditable suppressContentEditableWarning>{new Date().toLocaleDateString('es-PE')}</td>
                <td colSpan={3} className="f-obs" contentEditable suppressContentEditableWarning></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Sección eliminados ── */}
      {deletedSales.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={() => setShowDeleted(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', color: '#ef4444', cursor: 'pointer',
              padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, width: '100%',
            }}
          >
            <Trash2 size={15} />
            Ventas eliminadas ({deletedSales.length})
            {showDeleted ? <ChevronUp size={15} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={15} style={{ marginLeft: 'auto' }} />}
          </button>

          {showDeleted && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deletedSales.map((sale: any, i) => (
                <div
                  key={sale._dbId ?? i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                    background: 'var(--surface2)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '8px', padding: '0.6rem 0.9rem', opacity: 0.8,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', minWidth: '44px' }}>{sale.hora}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>{sale.nom || '—'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{sale.cel}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{sale.combo}</span>
                  {onRestoreSale && sale._dbId && (
                    <button
                      onClick={() => onRestoreSale(sale._dbId)}
                      title="Restaurar venta"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: '6px', color: '#22c55e', cursor: 'pointer',
                        padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 700,
                      }}
                    >
                      <RotateCcw size={12} /> Restaurar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </>)}
    </div>
  );
}
