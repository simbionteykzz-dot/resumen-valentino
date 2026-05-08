import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Printer, FileSpreadsheet, Lightbulb, BarChart3, FileText, Trash2, RotateCcw, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import type { Profile } from '../../types';

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
}

export default function PlanillaPanel({
  sales, deletedSales = [], selectedDate, onDateChange,
  loadingSync, syncError, onDeleteSale, onRestoreSale, profiles = [],
}: PlanillaPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [brandView, setBrandView] = useState<'todas' | 'OVER' | 'BRV'>('todas');
  const [blankMode, setBlankMode] = useState(false);

  const vendorLabel = selectedVendor
    ? (profiles.find(p => p.id === selectedVendor)?.full_name ?? 'VENDEDOR').toUpperCase()
    : 'VENDEDOR';

  const exportPdf = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const m = 5;

      const targetPlanilla = document.getElementById("sales-sheet-export");
      if (targetPlanilla) {
        const clonePlanilla = targetPlanilla.cloneNode(true) as HTMLElement;
        clonePlanilla.classList.add('print-mode');
        Object.assign(clonePlanilla.style, {
          position: 'fixed', left: '-9999px', top: '0',
          width: '1200px', background: '#fff', padding: '0', margin: '0 auto',
        });
        document.body.appendChild(clonePlanilla);
        await new Promise(resolve => setTimeout(resolve, 50));
        const canvasPlanilla = await html2canvas(clonePlanilla, {
          backgroundColor: "#ffffff", scale: 3, useCORS: true,
          logging: false, width: 1200, windowWidth: 1200,
        });
        clonePlanilla.remove();
        pdf.addImage(canvasPlanilla.toDataURL("image/png"), "PNG", m, m, pageW - m * 2, pageH - m * 2);
      }

      const targetCierre = document.getElementById("cierre-caja-export");
      if (targetCierre) {
        pdf.addPage();
        const cloneCierre = targetCierre.cloneNode(true) as HTMLElement;
        cloneCierre.classList.add('print-mode-cierre');
        Object.assign(cloneCierre.style, {
          position: 'fixed', left: '-9999px', top: '0',
          width: '1150px', background: '#fff', padding: '20px',
          margin: '0 auto', fontFamily: 'Arial, sans-serif',
        });
        document.body.appendChild(cloneCierre);
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvasCierre = await html2canvas(cloneCierre, {
          backgroundColor: "#ffffff", scale: 2, useCORS: true,
          logging: false, width: 1150, windowWidth: 1150,
        });
        cloneCierre.remove();
        pdf.addImage(canvasCierre.toDataURL("image/png"), "PNG", m, m, pageW - m * 2, pageH - m * 2);
      }

      pdf.save(`planilla-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  const visibleSales = blankMode
    ? []
    : brandView === 'todas'
      ? sales
      : sales.filter(s => (s.marcaLabel || 'OVER').toUpperCase().includes(brandView));

  const emptyRowsCount = Math.max(0, 40 - visibleSales.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileSpreadsheet size={20} /> Planilla de ventas
          </h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--muted)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BarChart3 size={14} /> <strong>{blankMode ? 0 : visibleSales.length}</strong> ventas{brandView !== 'todas' && !blankMode ? ` (${brandView})` : ''}
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
            {syncError && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>⚠ {syncError}</span>}
          </div>
        </div>
        <div className="cliente-panel-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro por marca */}
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

          {/* Selector de vendedor */}
          {profiles.length > 0 && (
            <select
              value={selectedVendor}
              onChange={e => setSelectedVendor(e.target.value)}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)', padding: '0.45rem 0.75rem',
                fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <option value="">Vendedor en planilla...</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          )}
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
            {exporting ? "⏳ Generando PDF..." : <><Printer size={16} /> Exportar PDF</>}
          </button>
        </div>
      </div>

      <p className="hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lightbulb size={16} style={{ flexShrink: 0 }} />
        <span>Usa <strong>Registrar venta</strong> en el panel "Texto para copiar" para registrar cada venta en la planilla.</span>
      </p>

      {/* ── Tabla principal ── */}
      <div id="sales-sheet-export" style={{ width: '100%' }}>
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
              {visibleSales.map((sale, i) => (
                <tr key={`sale-${i}`}>
                  <td className="col-n">{i + 1}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.cel}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.nom}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.dni}</td>
                  <td contentEditable suppressContentEditableWarning>{abrevMetodo(sale.metodoPago)}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.hora}</td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning>{sale.codigoPublicidad}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.marcaLabel}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.limaMark}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.provMark}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.separo}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.resta}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.pagoCompletoTxt}</td>
                  <td contentEditable suppressContentEditableWarning>{sale.combo}</td>
                  <td className="col-del">
                    {onDeleteSale && !blankMode && (
                      <button className="btn-del-row" onClick={() => onDeleteSale(sales.indexOf(sale))} title="Eliminar venta">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {emptyRows.map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="col-n">{sales.length + i + 1}</td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning>I.T</td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning>Live</td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td contentEditable suppressContentEditableWarning></td>
                  <td className="col-del"></td>
                </tr>
              ))}
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
                <td colSpan={2} className="f-vend" contentEditable suppressContentEditableWarning>{vendorLabel}</td>
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
    </div>
  );
}
