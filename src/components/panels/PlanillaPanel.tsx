import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Printer, FileSpreadsheet, Lightbulb, BarChart3, FileText, Trash2, RotateCcw, ChevronDown, ChevronUp, FileDown, AlertTriangle, Copy } from 'lucide-react';
import type { Profile } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawCierreCajaPage(pdf: any, sales: any[], pageW: number, pageH: number) {
  /* ── DATA ─────────────────────────────────────────────────────────────────── */
  const totalVentas    = sales.length;
  const totalPrendas   = sales.reduce((a, v) => a + (Number(v.qtyN) || 0), 0);
  const totalSeparos   = sales.reduce((a, v) => a + (parseFloat(v.separo) || 0), 0);
  const totalPagoComp  = sales.reduce((a, v) => a + (parseFloat(v.pagoCompletoTxt) || 0), 0);
  const totalRecaudado = totalSeparos + totalPagoComp;
  const totalDeudas    = sales.reduce((a, v) => a + (parseFloat(v.resta) || 0), 0);
  const totalBruto     = sales.reduce((a, v) => a + (Number(v.totalTotal) || 0), 0);
  const enviosLima     = sales.filter(v => v.limaMark).length;
  const enviosProv     = sales.filter(v => v.provMark).length;
  const pagosCompletos = sales.filter(v => v.pagoCompletoTxt).length;
  const contraEntrega  = sales.filter(v => v.separo || v.resta).length;
  const promedioVenta  = totalVentas > 0 ? totalBruto / totalVentas : 0;
  const promedioPrendas = totalVentas > 0 ? totalPrendas / totalVentas : 0;
  const S = (n: number) => n % 1 === 0 ? `S/ ${n}` : `S/ ${n.toFixed(2)}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* ── CANVAS ───────────────────────────────────────────────────────────────── */
  // Full white
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageW, pageH, 'F');

  const M = 14; // margin

  /* ── HEADER ──────────────────────────────────────────────────────────────── */
  // Green accent line (2mm only — almost zero ink)
  pdf.setFillColor(42, 115, 65);
  pdf.rect(0, 0, pageW, 2, 'F');

  // Title — large, black
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(20, 25, 22);
  pdf.text('CIERRE DE CAJA', M, 13);

  // Brand + date — small, muted
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(140, 150, 144);
  pdf.text('OVERSHARK · LIVEX AGENCY   ·   ' + dateStr.toUpperCase(), M, 18.5);

  // Hero metric — right side
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(42, 115, 65);
  pdf.text('YA COBRADO', pageW - M, 10, { align: 'right' });
  pdf.setFontSize(20);
  pdf.setTextColor(20, 25, 22);
  pdf.text(S(totalRecaudado), pageW - M, 19, { align: 'right' });

  // Separator line
  pdf.setDrawColor(220, 225, 222);
  pdf.setLineWidth(0.4);
  pdf.line(M, 23, pageW - M, 23);

  /* ── LAYOUT: 3 columns ───────────────────────────────────────────────────── */
  const GAP = 8;
  const COL = (pageW - 2 * M - 2 * GAP) / 3;
  const C = [M, M + COL + GAP, M + 2 * (COL + GAP)];

  /* row helper: label left, value right, dotted fill between */
  let Y = 29;
  const ROW_H = 7; // 7mm per row — very compact

  const row = (x: number, w: number, label: string, value: string, valColor: [number,number,number] = [20,25,22]) => {
    // label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(130, 138, 133);
    pdf.text(label, x, Y);
    // value — right-aligned within column
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...valColor);
    pdf.text(value, x + w, Y, { align: 'right' });
    // hairline separator below row
    pdf.setDrawColor(238, 241, 239);
    pdf.setLineWidth(0.2);
    pdf.line(x, Y + 1.5, x + w, Y + 1.5);
    Y += ROW_H;
  };

  /* section title helper */
  const colTitle = (x: number, label: string, accent: [number,number,number] = [42, 115, 65]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(...accent);
    pdf.text(label.toUpperCase(), x, Y);
    Y += 4;
  };

  /* ── COL 1: OPERACIONES ─────────────────────────────────────────────────── */
  let savedY = Y;

  colTitle(C[0], 'Operaciones del día');
  row(C[0], COL, 'Ventas registradas',  String(totalVentas),             [22, 100, 55]);
  row(C[0], COL, 'Prendas totales',     String(totalPrendas),            [22, 100, 55]);
  row(C[0], COL, 'Promedio por venta',  S(promedioVenta),                [22, 100, 55]);
  row(C[0], COL, 'Prendas por venta',   promedioPrendas.toFixed(1),      [22, 100, 55]);
  row(C[0], COL, 'Total bruto pedidos', S(totalBruto),                   [22, 100, 55]);

  /* ── COL 2: FINANZAS ────────────────────────────────────────────────────── */
  const col2StartY = savedY;
  Y = col2StartY;

  colTitle(C[1], 'Finanzas · cobros', [20, 95, 160]);
  row(C[1], COL, 'Ya cobrado (real)',   S(totalRecaudado),  [22, 100, 55]);
  row(C[1], COL, 'Por cobrar — saldo', S(totalDeudas),     [180, 90, 15]);
  row(C[1], COL, 'Separos recibidos',  S(totalSeparos),    [20, 95, 160]);
  row(C[1], COL, 'Pagos completos',    S(totalPagoComp),   [20, 95, 160]);

  /* ── COL 3: ENVÍOS Y MÉTODOS ────────────────────────────────────────────── */
  const col3StartY = savedY;
  Y = col3StartY;

  colTitle(C[2], 'Envíos · métodos', [130, 80, 15]);
  row(C[2], COL, 'Envíos Lima',      String(enviosLima),    [20, 95, 160]);
  row(C[2], COL, 'Envíos Provincia', String(enviosProv),    [130, 80, 15]);
  row(C[2], COL, 'Pago completo',    String(pagosCompletos), [22, 100, 55]);
  row(C[2], COL, 'Contra entrega',   String(contraEntrega), [130, 80, 15]);

  /* ── THIN COLUMN DIVIDERS ───────────────────────────────────────────────── */
  const maxY = Math.max(savedY + 5 * ROW_H + 10, 65);
  pdf.setDrawColor(230, 234, 231);
  pdf.setLineWidth(0.3);
  pdf.line(C[1] - GAP / 2, 24, C[1] - GAP / 2, maxY);
  pdf.line(C[2] - GAP / 2, 24, C[2] - GAP / 2, maxY);

  /* ── BOTTOM CLOSE LINE ──────────────────────────────────────────────────── */
  pdf.setDrawColor(220, 225, 222);
  pdf.setLineWidth(0.4);
  pdf.line(M, maxY + 2, pageW - M, maxY + 2);

  /* ── FOOTER ─────────────────────────────────────────────────────────────── */
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.setTextColor(190, 196, 193);
  pdf.text('OVERSHARK · LIVEX AGENCY — Sistema de Gestion de Ventas', M, pageH - 4);
  pdf.text(now.toLocaleString('es-PE'), pageW - M, pageH - 4, { align: 'right' });
}








const PRODUCT_NAME_MAP: Record<string, string> = {
  'BABY TY':                  'Baby tee',
  'BABY TY ESCOTADO':         'Baby tee escote',
  'BABY TY MANGA':            'Baby tee manga larga cuello redondo',
  'BABY TY MANGA ESCOTADO':   'Baby tee manga larga con escote',
  'CAMISA WAFFLE':            'Camisa Waffle',
  'CAMISERO PIKE':            'Camiseros',
  'CLASICO':                  'Clásicos',
  'JERSEY MANGA LARGA':       'Manga larga jersey',
  'WAFFLE':                   'Waffle',
  'WAFFLE CAMISERO':          'Waffle Camisero',
  'WAFFLE MANGA LARGA':       'Waffle manga larga',
  'CUELLO NOTCH PIQUE':       'Polo Cuello Notch Piqué',
  'CUELLO NOTCH WAFLE':       'Polo Cuello Notch Waffle',
  'MEDIAS':                   'Medias cortas',
  // BRAVOS
  'POLERA BOXYFIT':           'Polera Boxy fit',
  'POLERA NERU':              'Neru french terry',
  'PANTALON BRATZ':           'Bratz french terry',
  'PANTALON OPRA':            'Pantalon Ophra',
};

function normProductName(name: string): string {
  return PRODUCT_NAME_MAP[name.toUpperCase().trim()] ?? name;
}

// Parsea productos desde el campo detalle (texto WhatsApp) o combo
function parseProductos(detalle: string, combo: string, totalTotal: number, qtyN: number): { name: string; qty: number; price: number }[] {
  const products: { name: string; qty: number; price: number }[] = [];

  if (detalle) {
    const lines = detalle.split('\n');
    let inPromo = false; // true cuando estamos dentro de un bloque de promo (*NOMBRE PROMO*)

    for (const line of lines) {
      const t = line.trim();
      const mBold = t.match(/^\*(.+?)\*$/);

      if (mBold) {
        const inner = mBold[1];
        const mQtyPrice = inner.match(/^(.+?)\s+(\d+)\s+[xX×]\s+([\d.]+)/);
        if (mQtyPrice) {
          const name = mQtyPrice[1].replace(/\s*\(talla.*?\)/i, '').trim();
          // Si es una promo, leer sus hijos como productos individuales
          if (/PROMO/i.test(name)) {
            inPromo = true;
          } else {
            inPromo = false;
            if (products.length < 3) products.push({ name, qty: parseInt(mQtyPrice[2]), price: parseFloat(mQtyPrice[3]) });
          }
        } else {
          inPromo = true;
        }
        continue;
      }

      if (inPromo) {
        // Línea de subproducto dentro de promo: "- NOMBRE" o "- NOMBRE (talla X)"
        const mDash = t.match(/^-\s+(.+)/);
        if (mDash) {
          const rawName = mDash[1].replace(/\s*\(talla.*?\)/i, '').trim();
          // Ignorar líneas de color (contienen "×" o son muy cortas tipo "NEGRO × 2")
          const isColorLine = /^[A-ZÁÉÍÓÚÑ\s]+\s*[×x]\s*\d+$/i.test(rawName) || /^\s{2,}/.test(line);
          if (!isColorLine && rawName && rawName.length < 60 && products.length < 3) {
            // Extraer qty del nombre si tiene formato "Nx nombre"
            const mQtyName = rawName.match(/^(\d+)[xX×]\s*(.+)/);
            if (mQtyName) {
              products.push({ name: mQtyName[2].trim(), qty: parseInt(mQtyName[1]), price: 0 });
            } else {
              products.push({ name: rawName, qty: 1, price: 0 });
            }
          }
        }
        // Líneas de color (con indentación "  - COLOR × N") → ignorar
        continue;
      }
    }
  }

  // Fallback: leer desde combo
  if (products.length === 0) {
    if (combo) {
      const mCombo = combo.match(/^(\d+)(?:\s+[xX×]\s+([\d.]+))?\s+(.+)/);
      if (mCombo) {
        const qty = parseInt(mCombo[1]);
        const price = mCombo[2] ? parseFloat(mCombo[2]) * qty : totalTotal;
        products.push({ name: mCombo[3].trim(), qty, price });
      } else {
        products.push({ name: combo, qty: qtyN || 1, price: totalTotal || 0 });
      }
    } else {
      return [];
    }
  }

  // Distribuir precio restante en productos con price=0
  const priceAssigned = products.reduce((a, p) => a + p.price, 0);
  const remaining = totalTotal - priceAssigned;
  const zeroPriced = products.filter(p => p.price === 0);
  if (zeroPriced.length > 0 && remaining > 0) {
    const totalZeroQty = zeroPriced.reduce((a, p) => a + p.qty, 0) || 1;
    const unitPrice = remaining / totalZeroQty;
    zeroPriced.forEach(p => { p.price = Math.round(unitPrice * p.qty * 100) / 100; });
  }

  return products.map(p => ({ ...p, name: normProductName(p.name) }));
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
  onHardDeleteSale?: (dbId: string) => void;
  onDuplicateSale?: (sale: any) => void;
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
  loadingSync, syncError, onDeleteSale, onRestoreSale, onHardDeleteSale, onDuplicateSale, profiles = [],
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

  const exportXlsx = () => {
    const datos = visibleSales.map((s: any) => {
      const detalle: string = s.detalle ?? '';
      const combo: string = s.combo ?? '';
      const totalTotal = Number(s.totalTotal) || 0;
      const qtyN = s.qtyN || 0;

      const products = parseProductos(detalle, combo, totalTotal, qtyN);

      const p1 = products[0], p2 = products[1], p3 = products[2];
      const limaOProv = s.limaMark ? 'LIMA' : s.provMark ? 'PROVINCIA' : '';

      return {
        'Marca temporal':       s.fecha ? `${s.fecha} ${s.hora ?? ''}`.trim() : selectedDate,
        'EMPRESA':              (s.marcaLabel === 'BRV') ? 'BRAVOS' : 'OVERSHARK',
        'VENDEDOR':             vendorLabel,
        'CELULAR':              '',
        'LIMA O PROVINCIA':     limaOProv,
        'NOMBRE DE CLIENTE':    s.nom ?? '',
        'NUMERO DE CELULAR':    s.cel ?? '',
        'DNI':                  s.dni ?? '',
        'PRODUCTO (1)':         p1?.name ?? '',
        'CANTIDAD (1)':         p1?.qty ?? '',
        'PRECIO (1)':           p1 && p1.price > 0 ? Number(p1.price.toFixed(2)) : '',
        'PRODUCTO (2)':         p2?.name ?? '',
        'CANTIDAD (2)':         p2?.qty ?? '',
        'PRECIO (2)':           p2 && p2.price > 0 ? Number(p2.price.toFixed(2)) : '',
        'PRODUCTO (3)':         p3?.name ?? '',
        'CANTIDAD (3)':         p3?.qty ?? '',
        'PRECIO (3)':           p3 && p3.price > 0 ? Number(p3.price.toFixed(2)) : '',
        'MONTO TOTAL':          totalTotal || '',
        'A CUENTA (DEBE)':      s.resta || '',
        'SEPARO':               s.separo || '',
        'METODO DE PAGO':       s.metodoPago ?? '',
        'CUENTA DE ABONO':      s.codigoYape ?? '',
        'CODIGO DE PUBLICIDAD': s.codigoPublicidad ?? '',
        'ESTADO DE PEDIDO':     s.separo ? 'SEPARO' : s.pagoCompletoTxt ? 'PAGO COMPLETO' : 'CONTRA ENTREGA',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = Object.keys(datos[0] ?? {}).map(k => ({ wch: Math.max(k.length, 14) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    const fileName = `Planilla_${selectedDate}_${vendorLabel.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const m = 5;
      const ROWS_PER_PAGE = 40;

      const targetPlanilla = document.getElementById(exportId);
      if (targetPlanilla) {
        const sourceTable = targetPlanilla.querySelector('table.sales-sheet');
        const thead = sourceTable?.querySelector('thead');
        const allRows = Array.from(sourceTable?.querySelectorAll('tbody tr') ?? []);
        const chunks: Element[][] = [];
        for (let i = 0; i < Math.max(allRows.length, 1); i += ROWS_PER_PAGE)
          chunks.push(allRows.slice(i, i + ROWS_PER_PAGE));

        for (let ci = 0; ci < chunks.length; ci++) {
          if (ci > 0) pdf.addPage();
          const wrapper = document.createElement('div');
          wrapper.classList.add('print-mode');
          Object.assign(wrapper.style, {
            position: 'fixed', left: '-9999px', top: '0',
            width: '1200px', background: '#fff', padding: '0', margin: '0 auto',
          });
          const table = document.createElement('table');
          table.className = 'sales-sheet';
          if (thead) table.appendChild(thead.cloneNode(true));
          const tbody = document.createElement('tbody');
          chunks[ci].forEach(tr => tbody.appendChild(tr.cloneNode(true)));
          // Rellenar con filas vacías para que todos los chunks tengan 40 filas
          const filledCount = chunks[ci].length;
          const startN = ci * ROWS_PER_PAGE + filledCount + 1;
          for (let r = filledCount; r < ROWS_PER_PAGE; r++) {
            const emptyTr = document.createElement('tr');
            const numTd = document.createElement('td');
            numTd.className = 'col-n';
            numTd.textContent = String(startN + (r - filledCount));
            emptyTr.appendChild(numTd);
            for (let c = 1; c < 18; c++) {
              const td = document.createElement('td');
              if (c === 17) td.className = 'col-del';
              emptyTr.appendChild(td);
            }
            tbody.appendChild(emptyTr);
          }
          table.appendChild(tbody);
          const sheetWrap = document.createElement('div');
          sheetWrap.className = 'sheet-wrap';
          sheetWrap.appendChild(table);
          wrapper.appendChild(sheetWrap);
          document.body.appendChild(wrapper);
          await new Promise(resolve => setTimeout(resolve, 50));
          const canvas = await html2canvas(wrapper, {
            backgroundColor: '#ffffff', scale: 3, useCORS: true,
            logging: false, width: 1200, windowWidth: 1200,
          });
          wrapper.remove();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', m, m, pageW - m * 2, pageH - m * 2);
        }
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
          <button
            onClick={exportXlsx}
            disabled={exporting || loadingSync || visibleSales.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #1a7a4a', background: '#1a7a4a', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: visibleSales.length === 0 ? 'not-allowed' : 'pointer', opacity: visibleSales.length === 0 ? 0.5 : 1 }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
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
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'sis', e)}>{cv(rk, 'sis', (sale as any).codigoYape ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'codPub', e)}>{cv(rk, 'codPub', sale.codigoPublicidad ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'marca', e)}>{cv(rk, 'marca', sale.marcaLabel ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'lima', e)}>{cv(rk, 'lima', sale.limaMark ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'prov', e)}>{cv(rk, 'prov', sale.provMark ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'separo', e)}>{cv(rk, 'separo', sale.separo ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'resta', e)}>{cv(rk, 'resta', sale.resta ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'pago', e)}>{cv(rk, 'pago', sale.pagoCompletoTxt ?? '')}</td>
                  <td contentEditable suppressContentEditableWarning onBlur={e => handleBlur(rk, 'combo', e)}>{cv(rk, 'combo', sale.combo ?? '')}</td>
                  <td className="col-del">
                    {!blankMode && (
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        {onDuplicateSale && (
                          <button className="btn-dup-row" onClick={() => onDuplicateSale(sale)} title="Duplicar venta">
                            <Copy size={12} />
                          </button>
                        )}
                        {onDeleteSale && (
                          <button className="btn-del-row" onClick={() => onDeleteSale(sales.indexOf(sale))} title="Eliminar venta">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
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
                  {onHardDeleteSale && sale._dbId && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar PERMANENTEMENTE la venta de ${sale.nom || sale.cel || 'este cliente'}? Esta acción NO se puede deshacer.`)) {
                          onHardDeleteSale(sale._dbId);
                        }
                      }}
                      title="Eliminar permanentemente de la base de datos"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '6px', color: '#dc2626', cursor: 'pointer',
                        padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 700,
                      }}
                    >
                      <Trash2 size={12} /> Eliminar definitivo
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
