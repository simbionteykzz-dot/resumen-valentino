import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { POLOS_CATALOGO_OVERSHARK, POL_VARIANTES_OVERSHARK, PROMOS_DATA, TALLAS_SMLXL } from '../lib/data';

export default function ProductosPanel({ products, setProducts, customComboName, setCustomComboName, promoPrice, setPromoPrice }: any) {

  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoPrice, setNewPromoPrice] = useState("");
  const [newPromoQty, setNewPromoQty] = useState("1");
  const [colorInputs, setColorInputs] = useState<Record<number, string>>({});

  const addProduct = () =>
    setProducts([...products, { id: Date.now(), name: "", size: "", qty: 1, colorLines: [], promoName: "" }]);

  const removeProduct = (id: number) => {
    setProducts(products.filter((p: any) => p.id !== id));
    setColorInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateProduct = (id: number, field: string, value: any) =>
    setProducts(products.map((p: any) => p.id === id ? { ...p, [field]: value } : p));

  const handlePromoLoad = (key: string) => {
    const pData = PROMOS_DATA[key];
    if (!pData) return;
    const ts = Date.now();
    const baseQty = pData.list.reduce((acc, item) => acc + item.q, 0);
    const pricePerUnit = baseQty > 0 ? pData.price / baseQty : 0;
    const newProducts = pData.list.map((item, i) => ({
      id: ts + i, name: item.n, size: "", qty: item.q,
      colorLines: [], promoName: pData.comboData, promoPricePerUnit: pricePerUnit,
    }));
    setProducts((prev: any[]) => [...prev, ...newProducts]);
    setCustomComboName((prev: string) => prev ? prev + " + " + pData.comboData : pData.comboData);
    if (pData.price) {
      setPromoPrice((prev: any) => {
        const n = parseFloat(prev);
        return (isNaN(n) ? 0 : n) + pData.price;
      });
    }
  };

  const handleAddManualPromo = () => {
    const pName = newPromoName.trim();
    const pVal = parseFloat(newPromoPrice);
    const pQty = parseInt(newPromoQty, 10) || 1;
    const validPrice = !isNaN(pVal) && pVal > 0;
    if (!pName && !validPrice) return;
    const baseName = pName || "Promo Especial";
    const comboDesc = validPrice ? `${baseName} ${pQty} X ${pVal}` : pQty > 1 ? `${baseName} ${pQty}X` : baseName;
    setCustomComboName((prev: string) => prev ? prev + " + " + comboDesc : comboDesc);
    if (validPrice) setPromoPrice((prev: any) => { const n = parseFloat(prev); return (isNaN(n) ? 0 : n) + pVal; });
    const pricePerUnit = validPrice && pQty > 0 ? pVal / pQty : 0;
    setProducts((prev: any[]) => [...prev, {
      id: Date.now(), name: baseName, size: "", qty: pQty,
      colorLines: [], promoName: comboDesc, promoPricePerUnit: pricePerUnit,
    }]);
    setNewPromoName(""); setNewPromoPrice(""); setNewPromoQty("1");
  };

  const normalizePolName = (name: string) => {
    const tl = name.trim().toLowerCase();
    return Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl) || null;
  };

  const addColorLine = (id: number, color: string) =>
    setProducts(products.map((p: any) => {
      if (p.id !== id) return p;
      if (p.colorLines.find((c: any) => c.color === color)) return p;
      return { ...p, colorLines: [...p.colorLines, { color, qty: 1 }] };
    }));

  const removeColorLine = (id: number, color: string) =>
    setProducts(products.map((p: any) =>
      p.id === id ? { ...p, colorLines: p.colorLines.filter((c: any) => c.color !== color) } : p));

  const updateColorQty = (id: number, color: string, delta: number) =>
    setProducts(products.map((p: any) =>
      p.id === id ? {
        ...p,
        colorLines: p.colorLines.map((c: any) => c.color === color ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
      } : p));

  const getColorInput = (id: number) => colorInputs[id] ?? '';
  const setColorInput = (id: number, val: string) => setColorInputs(prev => ({ ...prev, [id]: val }));
  const handleAddColorManual = (id: number) => {
    const val = getColorInput(id).trim();
    if (val) { addColorLine(id, val); setColorInput(id, ''); }
  };

  const totalPrendas = products.reduce((acc: number, p: any) => {
    const qty = p.colorLines?.length > 0 ? p.colorLines.reduce((s: number, cl: any) => s + cl.qty, 0) : p.qty;
    return acc + qty;
  }, 0);

  const promoItemsLabel = (list: { n: string; q: number }[]) => {
    if (list.length === 1) return `${list[0].q}× ${list[0].n}`;
    const total = list.reduce((a, i) => a + i.q, 0);
    return `${total} prendas mix`;
  };

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <datalist id="lista-polos-overshark">
        {POLOS_CATALOGO_OVERSHARK.map(p => <option key={p} value={p} />)}
      </datalist>

      {/* ── Header ── */}
      <div className="prod-panel-head">
        <div>
          <h2 className="prod-panel-title">Productos Overshark</h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            <span className="prod-chip">{products.length} {products.length === 1 ? 'ítem' : 'ítems'}</span>
            {totalPrendas > 0 && <span className="prod-chip prod-chip--accent">{totalPrendas} prendas</span>}
            {parseFloat(promoPrice) > 0 && (
              <span className="prod-chip prod-chip--price">S/ {parseFloat(promoPrice).toFixed(2)}</span>
            )}
          </div>
        </div>
        <button className="btn btn-secondary prod-btn-add" onClick={addProduct}>
          <Plus size={15} /> Añadir producto
        </button>
      </div>

      {/* ── Promo cards ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="prod-section-lbl">Cargar Promoción</div>
        <div className="promo-cards-scroll">
          {Object.entries(PROMOS_DATA).map(([k, v]) => (
            <button key={k} className="promo-card" onClick={() => handlePromoLoad(k)}>
              <span className="promo-card-name">{v.name}</span>
              <span className="promo-card-items">{promoItemsLabel(v.list)}</span>
              <span className="promo-card-price">S/ {v.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Manual promo + combo ── */}
      <div className="manual-promo-box">
        <div className="prod-section-lbl">Promo Manual / Combo personalizado</div>
        <div className="manual-promo-row">
          <input
            placeholder="Nombre promo..."
            className="form-input"
            style={{ flex: '1', minWidth: '110px' }}
            value={newPromoName}
            onChange={e => setNewPromoName(e.target.value)}
          />
          <input
            placeholder="Cant"
            type="number"
            min="1"
            className="form-input"
            style={{ width: '62px' }}
            value={newPromoQty}
            onChange={e => setNewPromoQty(e.target.value)}
          />
          <input
            placeholder="S/ Total"
            className="form-input"
            style={{ width: '80px' }}
            value={newPromoPrice}
            onChange={e => setNewPromoPrice(e.target.value)}
          />
          <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={handleAddManualPromo}>
            + Añadir
          </button>
          <div className="manual-promo-divider" />
          <input
            placeholder="Nombre combo final..."
            className="form-input"
            style={{ flex: '1.5', minWidth: '140px' }}
            value={customComboName}
            onChange={e => setCustomComboName(e.target.value)}
          />
          <input
            placeholder="Total S/"
            className="form-input"
            style={{ width: '80px' }}
            value={promoPrice}
            onChange={e => setPromoPrice(e.target.value)}
          />
        </div>
      </div>

      {/* ── Product list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {products.length === 0 && (
          <div className="prod-empty">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
            <div>Carga una promoción o añade un producto</div>
          </div>
        )}
        {products.map((p: any) => {
          const cfgKey = normalizePolName(p.name);
          const cfg = cfgKey ? POL_VARIANTES_OVERSHARK[cfgKey] : null;
          const tallas = cfg?.tallas || TALLAS_SMLXL;
          const colorList = cfg?.colores ? cfg.colores.split(",").map((c: string) => c.trim()) : [];
          const hasColorLines = p.colorLines.length > 0;

          return (
            <div key={p.id} className="product-card-v2">

              {/* Row 1: nombre + badge + quitar */}
              <div className="pc-row pc-head-row">
                <input
                  list="lista-polos-overshark"
                  value={p.name}
                  onChange={e => updateProduct(p.id, 'name', e.target.value)}
                  placeholder="Escribe o elige producto..."
                  style={{ flex: 1 }}
                />
                {p.promoName && <span className="pc-promo-badge">{p.promoName}</span>}
                <button className="pc-btn-rm" onClick={() => removeProduct(p.id)} title="Quitar">
                  <X size={13} />
                </button>
              </div>

              {/* Row 2: talla + qty */}
              <div className="pc-row pc-controls-row">
                <div>
                  <div className="pc-lbl">Talla</div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <button className="prod-size-btn" aria-pressed={p.size === ""} onClick={() => updateProduct(p.id, 'size', "")}>—</button>
                    {tallas.map((t: string) => (
                      <button key={t} className="prod-size-btn" aria-pressed={p.size === t} onClick={() => updateProduct(p.id, 'size', t)}>{t}</button>
                    ))}
                  </div>
                </div>
                {!hasColorLines && (
                  <div>
                    <div className="pc-lbl">Cant.</div>
                    <div className="qty-stepper">
                      <button className="qty-btn" onClick={() => updateProduct(p.id, 'qty', Math.max(1, p.qty - 1))}>−</button>
                      <input value={p.qty} readOnly />
                      <button className="qty-btn" onClick={() => updateProduct(p.id, 'qty', p.qty + 1)}>+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: colores */}
              <div className="pc-colors-section">
                {colorList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {colorList.map((c: string) => (
                      <button key={c} className="prod-color-chip" onClick={() => addColorLine(p.id, c)}>{c}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Añadir color..."
                    className="form-input"
                    style={{ flex: 1, maxWidth: '160px', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                    value={getColorInput(p.id)}
                    onChange={e => setColorInput(p.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColorManual(p.id); } }}
                  />
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAddColorManual(p.id)}>
                    + Color
                  </button>
                </div>
              </div>

              {/* Color lines */}
              {hasColorLines && (
                <div className="pc-color-lines">
                  {p.colorLines.map((cL: any) => (
                    <div key={cL.color} className="pc-color-line">
                      <span className="pc-color-name">{cL.color}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="pc-lbl" style={{ margin: 0 }}>Cant.</span>
                        <div className="qty-stepper" style={{ height: '2rem' }}>
                          <button className="qty-btn" onClick={() => updateColorQty(p.id, cL.color, -1)}>−</button>
                          <input value={cL.qty} readOnly style={{ height: '2rem' }} />
                          <button className="qty-btn" onClick={() => updateColorQty(p.id, cL.color, 1)}>+</button>
                        </div>
                      </div>
                      <button className="pc-color-rm" onClick={() => removeColorLine(p.id, cL.color)} title="Quitar color">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
