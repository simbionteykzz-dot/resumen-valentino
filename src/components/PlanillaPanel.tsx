import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Printer, FileSpreadsheet, Lightbulb, BarChart3, FileText } from 'lucide-react';

const abrevMetodo = (m: string) => {
  if (!m) return 'I.T';
  const l = m.toLowerCase();
  if (l.includes('yape') || l.includes('import')) return 'I.T';
  if (l.includes('completo')) return 'P.C';
  if (l.includes('contra')) return 'C.E';
  return m.slice(0, 4).toUpperCase();
};

export default function PlanillaPanel({ sales }: { sales: any[] }) {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const m = 5; // margins

      // PÁGINA 1: Planilla de ventas
      const targetPlanilla = document.getElementById("sales-sheet-export");
      if (targetPlanilla) {
        const clonePlanilla = targetPlanilla.cloneNode(true) as HTMLElement;
        clonePlanilla.classList.add('print-mode');

        Object.assign(clonePlanilla.style, {
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1200px',
          background: '#fff',
          padding: '0',
          margin: '0 auto'
        });

        document.body.appendChild(clonePlanilla);
        await new Promise(resolve => setTimeout(resolve, 50));

        const canvasPlanilla = await html2canvas(clonePlanilla, {
          backgroundColor: "#ffffff",
          scale: 3,
          useCORS: true,
          logging: false,
          width: 1200,
          windowWidth: 1200
        });

        clonePlanilla.remove();

        const imgPlanilla = canvasPlanilla.toDataURL("image/png");
        pdf.addImage(imgPlanilla, "PNG", m, m, pageW - (m * 2), pageH - (m * 2));
      }

      // PÁGINA 2: Cierre de caja
      const targetCierre = document.getElementById("cierre-caja-export");
      if (targetCierre) {
        pdf.addPage();

        const cloneCierre = targetCierre.cloneNode(true) as HTMLElement;
        cloneCierre.classList.add('print-mode-cierre');

        Object.assign(cloneCierre.style, {
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1150px',
          background: '#fff',
          padding: '20px',
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif'
        });

        document.body.appendChild(cloneCierre);
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvasCierre = await html2canvas(cloneCierre, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: 1150,
          windowWidth: 1150
        });

        cloneCierre.remove();

        const imgCierre = canvasCierre.toDataURL("image/png");
        pdf.addImage(imgCierre, "PNG", m, m, pageW - (m * 2), pageH - (m * 2));
      }

      pdf.save(`planilla-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  const emptyRowsCount = Math.max(0, 40 - sales.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileSpreadsheet size={20} /> Planilla de ventas
          </h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BarChart3 size={14} /> <strong>{sales.length}</strong> ventas registradas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileText size={14} /> <strong>{emptyRowsCount}</strong> filas disponibles
            </span>
          </div>
        </div>
        <div className="cliente-panel-actions">
          <button className="btn btn-primary" onClick={exportPdf} disabled={exporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {exporting ? "⏳ Generando PDF..." : <><Printer size={16} /> Exportar PDF (2 hojas)</>}
          </button>
        </div>
      </div>
      <p className="hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lightbulb size={16} style={{ flexShrink: 0 }} />
        <span>Usa <strong>Añadir venta a fila</strong> en el panel "Texto para copiar" para registrar cada venta en la planilla.</span>
      </p>

      <div id="sales-sheet-export" style={{ width: '100%' }}>
        <div className="sheet-wrap">
          <table className="sales-sheet">
            <colgroup>
              <col style={{ width: '2.5%' }} />
              <col style={{ width: '6.5%' }} />
              <col style={{ width: '11.5%' }} />
              <col style={{ width: '6.5%' }} />
              <col style={{ width: '7.5%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '3.5%' }} />
              <col style={{ width: '8.5%' }} />
              <col style={{ width: '5.5%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '4.5%' }} />
              <col style={{ width: '4.5%' }} />
              <col style={{ width: '8.5%' }} />
              <col style={{ width: '13.5%' }} />
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
              </tr>
              <tr>
                <th className="col-separo">SEPARÓ</th>
                <th className="col-resta">RESTA</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, i) => (
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
                <td colSpan={2} className="f-vend" contentEditable suppressContentEditableWarning>VALENTINO</td>
                <td colSpan={4} className="f-firma" contentEditable suppressContentEditableWarning></td>
                <td colSpan={4} className="f-fecha" contentEditable suppressContentEditableWarning>{new Date().toLocaleDateString('es-PE')}</td>
                <td colSpan={3} className="f-obs" contentEditable suppressContentEditableWarning></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
