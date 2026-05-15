import React, { useState } from 'react';
import { Plus, X, Tag, Shuffle, ChevronDown, Package } from 'lucide-react';
import {
  POLOS_CATALOGO_OVERSHARK, POL_VARIANTES_OVERSHARK, PROMOS_DATA, MIX_PROMOS_DATA, PROMOS_GROUPS, TALLAS_SMLXL,
  POLOS_CATALOGO_BRAVOS, BRV_VARIANTES, BRV_PROMOS_DATA, PRODUCT_NAME_TO_CP,
} from '../../lib/data';

export default function ProductosPanel({ products, setProducts, customComboName, setCustomComboName, promoPrice, setPromoPrice, brand = 'overshark' }: any) {
  const isBravos = brand === 'bravos';
  const CATALOGO = isBravos ? POLOS_CATALOGO_BRAVOS : POLOS_CATALOGO_OVERSHARK;
  const VARIANTES = isBravos ? BRV_VARIANTES : POL_VARIANTES_OVERSHARK;
  const PROMOS = isBravos ? BRV_PROMOS_DATA : PROMOS_DATA;
  const listId = isBravos ? 'lista-polos-bravos' : 'lista-polos-overshark';
  const brandLabel = isBravos ? 'Bravos' : 'Overshark';

  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoPrice, setNewPromoPrice] = useState("");
  const [newPromoQty, setNewPromoQty] = useState("1");
  const [colorInputs, setColorInputs] = useState<Record<number, string>>({});
  const [activePromoGroup, setActivePromoGroup] = useState<string | null>(null);
  const [mixOpen, setMixOpen] = useState(true);

  const addProduct = () =>
    setProducts([...products, { id: Date.now(), name: "", size: "", qty: 1, colorLines: [], promoName: "" }]);

  const removeProduct = (id: number) => {
    setProducts(products.filter((p: any) => p.id !== id));
    setColorInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateProduct = (id: number, field: string, value: any) =>
    setProducts(products.map((p: any) => p.id === id ? { ...p, [field]: value } : p));

  const handlePromoLoad = (key: string) => {
    const pData = PROMOS[key] ?? MIX_PROMOS_DATA[key];
    if (!pData) return;
    const ts = Date.now();
    const baseQty = pData.list.reduce((acc, item) => acc + item.q, 0);
    const pricePerUnit = baseQty > 0 ? pData.price / baseQty : 0;
    const newProducts = pData.list.map((item, i) => ({
      id: ts + i, name: item.n, size: "", qty: item.q,
      colorLines: [], promoName: pData.comboData, promoPricePerUnit: pricePerUnit,
      promoInstance: String(ts),
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
    return Object.keys(VARIANTES).find(k => k.toLowerCase() === tl) || null;
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
        ...p, colorLines: p.colorLines.map((c: any) => c.color === color ? { ...c, qty: Math.max(1, c.qty + delta) } : c),
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

  const promoItemsLabel = (list: { n: string; q: number }[]) =>
    list.map(i => `${i.q}× ${i.n}`).join(' · ');

  const variantLabel = (v: { list: { n: string; q: number }[]; comboData: string }) => {
    const qty = v.list.reduce((a, i) => a + i.q, 0);
    if (v.comboData.includes('REGALO')) return `${qty - 1}+1`;
    return `${qty}×`;
  };

  const activeGroup = PROMOS_GROUPS.find(g => g.label === activePromoGroup) ?? null;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <datalist id={listId}>
        {CATALOGO.map(p => <option key={p} value={p} />)}
      </datalist>

      {/* ── Header ── */}
      <div className="prod-panel-head">
        <div>
          <h2 className="prod-panel-title">Productos {brandLabel}</h2>
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

      {/* ── Promo section ── */}
      <div style={{ marginBottom: '1.25rem' }}>

        {/* Cargar Promoción — individual */}
        <div className="promo-block">
          <div className="promo-block-header">
            <Tag size={13} />
            <span>Cargar Promoción</span>
          </div>

          {!isBravos ? (
            <>
              {/* Chips de producto */}
              <div className="promo-chips-row">
                {PROMOS_GROUPS.map(g => {
                  const isActive = activePromoGroup === g.label;
                  const variantCount = g.keys.length;
                  return (
                    <button
                      key={g.label}
                      onClick={() => setActivePromoGroup(isActive ? null : g.label)}
                      className={`promo-chip ${isActive ? 'promo-chip--active' : ''}`}
                    >
                      <span className="promo-chip-label">{g.label}</span>
                      <span className="promo-chip-count">{variantCount}</span>
                    </button>
                  );
                })}
              </div>

              {/* Panel de variantes */}
              {activeGroup && (
                <div className="promo-variants-panel">
                  <div className="promo-variants-title">
                    {activeGroup.label} — elige cantidad
                  </div>
                  <div className="promo-variants-grid">
                    {activeGroup.keys.map(k => {
                      const v = PROMOS_DATA[k];
                      if (!v) return null;
                      const label = variantLabel(v);
                      const isLive = v.comboData.includes('REGALO');
                      return (
                        <button
                          key={k}
                          onClick={() => handlePromoLoad(k)}
                          className={`promo-variant-btn ${isLive ? 'promo-variant-btn--live' : ''}`}
                        >
                          <span className="promo-variant-qty">{label}</span>
                          <span className="promo-variant-price">S/ {v.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="promo-cards-scroll">
              {Object.entries(PROMOS).map(([k, v]) => (
                <button key={k} className="promo-card" onClick={() => handlePromoLoad(k)}>
                  <span className="promo-card-name">{v.name}</span>
                  <span className="promo-card-items">{promoItemsLabel(v.list)}</span>
                  <span className="promo-card-price">S/ {v.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Promociones Mix (solo Overshark) */}
        {!isBravos && (
          <div className="promo-block promo-block--mix">
            <button className="promo-block-header promo-block-header--toggle" onClick={() => setMixOpen(v => !v)}>
              <Shuffle size={13} />
              <span>Promociones Mix</span>
              <ChevronDown size={13} className={`promo-mix-chevron${mixOpen ? ' promo-mix-chevron--open' : ''}`} />
            </button>
            {mixOpen && (
              <div className="promo-mix-grid">
                {Object.entries(MIX_PROMOS_DATA).map(([k, v]) => {
                  const totalQty = v.list.reduce((a, i) => a + i.q, 0);
                  return (
                    <button key={k} className="promo-mix-card" onClick={() => handlePromoLoad(k)}>
                      <div className="promo-mix-card-head">
                        <span className="promo-mix-name">{v.name}</span>
                        <span className="promo-mix-qty">{totalQty}×</span>
                      </div>
                      <span className="promo-mix-items">{promoItemsLabel(v.list)}</span>
                      <span className="promo-mix-price">{v.price > 0 ? `S/ ${v.price}` : '—'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Manual promo + combo ── */}
      <div className="manual-promo-box">
        <div className="prod-section-lbl">Promo Manual / Combo personalizado</div>
        <div className="manual-promo-row">
          <input placeholder="Nombre promo..." className="form-input" style={{ flex: '1', minWidth: '110px' }} value={newPromoName} onChange={e => setNewPromoName(e.target.value)} />
          <input placeholder="Cant" type="number" min="1" className="form-input" style={{ width: '62px' }} value={newPromoQty} onChange={e => setNewPromoQty(e.target.value)} />
          <input placeholder="S/ Total" className="form-input" style={{ width: '80px' }} value={newPromoPrice} onChange={e => setNewPromoPrice(e.target.value)} />
          <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={handleAddManualPromo}>+ Añadir</button>
          <div className="manual-promo-divider" />
          <input placeholder="Nombre combo final..." className="form-input" style={{ flex: '1.5', minWidth: '140px' }} value={customComboName} onChange={e => setCustomComboName(e.target.value)} />
          <input placeholder="Total S/" className="form-input" style={{ width: '80px' }} value={promoPrice} onChange={e => setPromoPrice(e.target.value)} />
        </div>
      </div>

      {/* ── Product list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {products.length === 0 && (
          <div className="prod-empty">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><Package size={32} /></div>
            <div>Carga una promoción o añade un producto</div>
          </div>
        )}
        {products.map((p: any) => {
          const cfgKey = normalizePolName(p.name);
          const cfg = cfgKey ? VARIANTES[cfgKey] : null;
          const tallas = cfg?.tallas || (isBravos ? ['S', 'M', 'L'] : TALLAS_SMLXL);
          const colorList = cfg?.colores ? cfg.colores.split(",").map((c: string) => c.trim()) : [];
          const hasColorLines = p.colorLines.length > 0;
          const cpCode = PRODUCT_NAME_TO_CP[p.name?.trim().toUpperCase() ?? ''];

          return (
            <div key={p.id} className="product-card-v2">
              <div className="pc-row pc-head-row">
                <input list={listId} value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} placeholder="Escribe o elige producto..." style={{ flex: 1 }} />
                {cpCode && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '0.12rem 0.5rem', borderRadius: '5px', background: 'rgba(69,131,77,0.12)', border: '1px solid rgba(69,131,77,0.3)', color: '#45834D', whiteSpace: 'nowrap', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {cpCode}
                  </span>
                )}
                {p.promoName && <span className="pc-promo-badge">{p.promoName}</span>}
                <button className="pc-btn-rm" onClick={() => removeProduct(p.id)} title="Quitar"><X size={13} /></button>
              </div>
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
              <div className="pc-colors-section">
                {colorList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {colorList.map((c: string) => (
                      <button key={c} className="prod-color-chip" onClick={() => addColorLine(p.id, c)}>{c}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input type="text" placeholder="Añadir color..." className="form-input" style={{ flex: 1, maxWidth: '160px', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                    value={getColorInput(p.id)} onChange={e => setColorInput(p.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColorManual(p.id); } }} />
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAddColorManual(p.id)}>+ Color</button>
                </div>
              </div>
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
                      <button className="pc-color-rm" onClick={() => removeColorLine(p.id, cL.color)} title="Quitar color"><X size={11} /></button>
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
