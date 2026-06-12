import React, { useState } from 'react';
import { Plus, X, Tag, Shuffle, ChevronDown, Package, ClipboardList, Check, Copy } from 'lucide-react';
import {
  POLOS_CATALOGO_OVERSHARK, POL_VARIANTES_OVERSHARK, PROMOS_DATA, MIX_PROMOS_DATA, PROMOS_GROUPS, TALLAS_SMLXL,
  POLOS_CATALOGO_BRAVOS, BRV_VARIANTES, BRV_PROMOS_DATA, BRV_PROMOS_GROUPS, PRODUCT_NAME_TO_CP,
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
  const [activeBrvGroup, setActiveBrvGroup] = useState<string | null>(null);
  const [promoView, setPromoView] = useState<'chips' | 'lista'>('chips');
  const [mixOpen, setMixOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [catalogCopied, setCatalogCopied] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);
  // Combo builder: lista de { name, qty }
  const [comboItems, setComboItems] = useState<{ name: string; qty: number; size: string; mixedSizes: boolean; colorLines: { color: string; qty: number; size?: string }[]; colorInput: string }[]>([]);
  const [comboName, setComboName] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [pendingExtraPromo, setPendingExtraPromo] = useState<null | { ts: number }>(null);

  const copyPromoText = (e: React.MouseEvent, pData: any) => {
    e.stopPropagation();
    const items = pData.list.map((i: any) => `• ${i.q}x ${i.n}`).join('\n');
    const text = `🔥 *${pData.comboData}*\n${items}\n💵 *Por solo: S/ ${pData.price}*`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromo(pData.name);
      setTimeout(() => setCopiedPromo(null), 1500);
    });
  };

  const copyCatalog = () => {
    const lines: string[] = [`📦 CATÁLOGO ${brandLabel.toUpperCase()}\n`];
    Object.entries(VARIANTES).forEach(([name, cfg]) => {
      const tallas = cfg.tallas.length > 0 ? cfg.tallas.join(' / ') : '—';
      const colores = cfg.colores || '—';
      lines.push(`🔹 ${name} (${tallas})\n   ${colores}`);
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCatalogCopied(true);
      setTimeout(() => setCatalogCopied(false), 2000);
    });
  };

  const addProduct = () =>
    setProducts([...products, { id: Date.now(), name: "", size: "", qty: 1, colorLines: [], promoName: "" }]);

  const removeProduct = (id: number) => {
    setProducts(products.filter((p: any) => p.id !== id));
    setColorInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateProduct = (id: number, field: string, value: any) =>
    setProducts(products.map((p: any) => p.id === id ? { ...p, [field]: value } : p));

  const handlePromoLoad = (key: string) => {
    if (key === 'imperdible_4_119') {
      setPendingExtraPromo({ ts: Date.now() });
      return;
    }
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

  const handleConfirmExtra = (prendaNombre: string) => {
    const pData = BRV_PROMOS_DATA['imperdible_4_119'];
    if (!pData || !pendingExtraPromo) return;
    const ts = pendingExtraPromo.ts;
    const comboData = `PROMO BRAVOS — BOXYFIT + NERU + PANTALON BRATZ + ${prendaNombre.toUpperCase()} EXTRA X 119 SOLES`;
    const list = [
      { n: "POLERA BOXYFIT", q: 1 },
      { n: "POLERA NERU", q: 1 },
      { n: "PANTALON BRATZ", q: 1 },
      { n: prendaNombre, q: 1 },
    ];
    const pricePerUnit = pData.price / list.length;
    const newProducts = list.map((item, i) => ({
      id: ts + i, name: item.n, size: "", qty: item.q,
      colorLines: [], promoName: comboData, promoPricePerUnit: pricePerUnit,
      promoInstance: String(ts),
    }));
    setProducts((prev: any[]) => [...prev, ...newProducts]);
    setCustomComboName((prev: string) => prev ? prev + " + " + comboData : comboData);
    setPromoPrice((prev: any) => (isNaN(parseFloat(prev)) ? 0 : parseFloat(prev)) + pData.price);
    setPendingExtraPromo(null);
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

  // Fuzzy autocorrect: al salir del input, corrige el nombre al producto más cercano del catálogo
  const fuzzyCorrectName = (id: number, rawName: string) => {
    const val = rawName.trim();
    if (!val) return;
    // Si ya coincide exacto (case-insensitive) no hacer nada
    if (CATALOGO.some(c => c.toLowerCase() === val.toLowerCase())) {
      // Normalizar capitalización al valor oficial
      const official = CATALOGO.find(c => c.toLowerCase() === val.toLowerCase())!;
      if (official !== val) updateProduct(id, 'name', official);
      return;
    }
    // Distancia de Levenshtein simplificada
    const lev = (a: string, b: string): number => {
      const m = a.length, n = b.length;
      const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
      );
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
          dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      return dp[m][n];
    };
    const norm = (s: string) => s.toUpperCase().replace(/[ÁÀÂÄ]/g,'A').replace(/[ÉÈÊË]/g,'E').replace(/[ÍÌÎÏ]/g,'I').replace(/[ÓÒÔÖ]/g,'O').replace(/[ÚÙÛÜ]/g,'U').replace(/WAFLE/g,'WAFFLE').replace(/PIQUE/g,'PIKE');
    const normVal = norm(val);
    let best = '', bestDist = Infinity;
    for (const c of CATALOGO) {
      const d = lev(normVal, norm(c));
      if (d < bestDist) { bestDist = d; best = c; }
    }
    // Aplicar corrección si la distancia es menor al 40% del largo del nombre escrito
    const threshold = Math.max(3, Math.floor(val.length * 0.4));
    if (bestDist <= threshold) updateProduct(id, 'name', best);
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

  const updateColorSize = (id: number, color: string, size: string) =>
    setProducts(products.map((p: any) =>
      p.id === id ? {
        ...p, colorLines: p.colorLines.map((c: any) => c.color === color ? { ...c, size } : c),
      } : p));

  const toggleMixedSizes = (id: number) =>
    setProducts(products.map((p: any) => {
      if (p.id !== id) return p;
      const turningOff = p.mixedSizes;
      return {
        ...p,
        mixedSizes: !p.mixedSizes,
        // Al desactivar, limpia las tallas individuales de cada color
        colorLines: turningOff
          ? p.colorLines.map((cl: any) => ({ ...cl, size: undefined }))
          : p.colorLines,
      };
    }));

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
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            className="btn btn-secondary"
            onClick={copyCatalog}
            title="Copiar catálogo completo para el cliente"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.45rem 0.8rem', transition: 'background 0.15s' }}
          >
            {catalogCopied ? <Check size={14} style={{ color: '#45834D' }} /> : <ClipboardList size={14} />}
            {catalogCopied ? 'Copiado' : 'Todas las prendas'}
          </button>
          <button className="btn btn-secondary prod-btn-add" onClick={addProduct}>
            <Plus size={15} /> Añadir producto
          </button>
        </div>
      </div>

      {/* ── Promo section ── */}
      <div style={{ marginBottom: '1.25rem' }}>

        {/* Cargar Promoción — individual */}
        <div className="promo-block">
          <div className="promo-block-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={13} />
              <span>Cargar Promoción</span>
            </div>
            {!isBravos && (
              <div className="promo-view-toggle">
                <button
                  className={`promo-view-btn${promoView === 'chips' ? ' promo-view-btn--active' : ''}`}
                  onClick={() => setPromoView('chips')}
                  title="Vista burbujas"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <rect x="0" y="0" width="6" height="6" rx="3" fill="currentColor"/>
                    <rect x="8" y="0" width="6" height="6" rx="3" fill="currentColor"/>
                    <rect x="0" y="8" width="6" height="6" rx="3" fill="currentColor"/>
                    <rect x="8" y="8" width="6" height="6" rx="3" fill="currentColor"/>
                  </svg>
                  Burbujas
                </button>
                <button
                  className={`promo-view-btn${promoView === 'lista' ? ' promo-view-btn--active' : ''}`}
                  onClick={() => setPromoView('lista')}
                  title="Vista lista"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/>
                  </svg>
                  Lista
                </button>
              </div>
            )}
          </div>

          {!isBravos ? (
            <>
              {promoView === 'chips' ? (
                <>
                  {/* Vista Burbujas */}
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
                /* Vista Lista */
                <div className="promo-lista">
                  {PROMOS_GROUPS.map(g => (
                    <div key={g.label} className="promo-lista-group">
                      <div className="promo-lista-group-label">{g.label}</div>
                      <div className="promo-lista-variants">
                        {g.keys.map(k => {
                          const v = PROMOS_DATA[k];
                          if (!v) return null;
                          const label = variantLabel(v);
                          const isLive = v.comboData.includes('REGALO');
                          return (
                            <button
                              key={k}
                              onClick={() => handlePromoLoad(k)}
                              className={`promo-lista-btn${isLive ? ' promo-lista-btn--live' : ''}`}
                            >
                              <span className="promo-lista-qty">{label}</span>
                              <span className="promo-lista-price">S/ {v.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Vista Burbujas Bravos */}
              <div className="promo-chips-row">
                {BRV_PROMOS_GROUPS.map(g => {
                  const isActive = activeBrvGroup === g.label;
                  return (
                    <button
                      key={g.label}
                      onClick={() => setActiveBrvGroup(isActive ? null : g.label)}
                      className={`promo-chip ${isActive ? 'promo-chip--active' : ''}`}
                    >
                      <span className="promo-chip-label">{g.label}</span>
                      <span className="promo-chip-count">{g.keys.length}</span>
                    </button>
                  );
                })}
              </div>
              {activeBrvGroup && (() => {
                const grp = BRV_PROMOS_GROUPS.find(g => g.label === activeBrvGroup);
                if (!grp) return null;

                // Selector de prenda extra inline
                if (pendingExtraPromo) {
                  return (
                    <div className="promo-variants-panel" style={{ background: 'linear-gradient(135deg, #FFF5EC, #FFF0E6)', border: '1.5px solid rgba(235,115,71,0.35)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div className="promo-variants-title" style={{ margin: 0, color: '#EB7347' }}>
                          ¿Cuál es la prenda extra?
                        </div>
                        <button onClick={() => setPendingExtraPromo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b07040' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#b07040', marginBottom: '0.6rem' }}>
                        Boxyfit + Neru + Bratz ya incluidos · S/119
                      </div>
                      <div className="promo-variants-grid">
                        {["POLERA BOXYFIT", "POLERA NERU", "PANTALON BRATZ", "PANTALON OPRA"].map(prenda => (
                          <button
                            key={prenda}
                            onClick={() => handleConfirmExtra(prenda)}
                            className="promo-variant-btn"
                            style={{ borderColor: 'rgba(235,115,71,0.4)', color: '#EB7347' }}
                          >
                            <span className="promo-variant-qty">{prenda.replace('POLERA ', '').replace('PANTALON ', '')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="promo-variants-panel">
                    <div className="promo-variants-title">
                      {grp.label} — elige variante
                    </div>
                    <div className="promo-variants-grid">
                      {grp.keys.map(k => {
                        const v = BRV_PROMOS_DATA[k];
                        if (!v) return null;
                        const label = v.list.map(i => `${i.q}× ${i.n.replace('POLERA ', '').replace('PANTALON ', '')}`).join(' · ');
                        return (
                          <button
                            key={k}
                            onClick={() => handlePromoLoad(k)}
                            className="promo-variant-btn"
                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}
                          >
                            <span className="promo-variant-qty" style={{ fontSize: '0.72rem', whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.3 }}>{label}</span>
                            <span className="promo-variant-price">{v.price > 0 ? `S/ ${v.price}` : '—'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
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
                    <div key={k} className="promo-mix-card">
                      <div className="promo-mix-card-head">
                        <span className="promo-mix-name">{v.name}</span>
                        <span className="promo-mix-qty">{totalQty}×</span>
                      </div>
                      <span className="promo-mix-items">{promoItemsLabel(v.list)}</span>
                      <span className="promo-mix-price">{v.price > 0 ? `S/ ${v.price}` : '—'}</span>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem' }}>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }} onClick={() => handlePromoLoad(k)}>
                          <Plus size={13} /> Añadir
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }} onClick={(e) => copyPromoText(e, v)}>
                          {copiedPromo === v.name ? <Check size={13} style={{ color: '#45834D' }} /> : <Copy size={13} />} 
                          {copiedPromo === v.name ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Crear Combo ── */}
      <div className="promo-block" style={{ marginTop: '0.6rem' }}>
        <button
          className="promo-block-header promo-block-header--toggle"
          onClick={() => setComboOpen(v => !v)}
          style={{ width: '100%' }}
        >
          <Plus size={13} />
          <span>Crear Combo personalizado</span>
          <ChevronDown size={13} className={`promo-mix-chevron${comboOpen ? ' promo-mix-chevron--open' : ''}`} />
        </button>

        {comboOpen && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

            {/* Botones rápidos del catálogo */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {CATALOGO.map(name => (
                <button
                  key={name}
                  className="prod-color-chip"
                  style={{ fontSize: '0.72rem', padding: '0.28rem 0.6rem', borderRadius: '20px' }}
                  onClick={() => setComboItems(prev => [...prev, { name, qty: 1, size: '', mixedSizes: false, colorLines: [], colorInput: '' }])}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Selector de productos del catálogo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {comboItems.map((item, i) => {
                const cfgKey = normalizePolName(item.name);
                const cfg = cfgKey ? VARIANTES[cfgKey] : null;
                const tallas = cfg?.tallas || (isBravos ? ['S', 'M', 'L'] : TALLAS_SMLXL);
                const colorList = cfg?.colores ? cfg.colores.split(',').map((c: string) => c.trim()) : [];
                const updateItem = (patch: any) => setComboItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
                const addColorToItem = (color: string) => {
                  if (item.colorLines.find(cl => cl.color === color)) return;
                  updateItem({ colorLines: [...item.colorLines, { color, qty: 1 }] });
                };
                const removeColorFromItem = (color: string) => updateItem({ colorLines: item.colorLines.filter(cl => cl.color !== color) });
                const updateColorQtyInItem = (color: string, delta: number) => updateItem({
                  colorLines: item.colorLines.map(cl => cl.color === color ? { ...cl, qty: Math.max(1, cl.qty + delta) } : cl),
                });
                const updateColorSizeInItem = (color: string, size: string) => updateItem({
                  colorLines: item.colorLines.map(cl => cl.color === color ? { ...cl, size: cl.size === size ? undefined : size } : cl),
                });
                const toggleMixedSizesInItem = () => {
                  const turningOff = item.mixedSizes;
                  updateItem({
                    mixedSizes: !item.mixedSizes,
                    colorLines: turningOff
                      ? item.colorLines.map(cl => ({ ...cl, size: undefined }))
                      : item.colorLines,
                  });
                };
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'var(--surface2)', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                    {/* Fila nombre + qty + quitar */}
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        list={listId}
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Producto del catálogo..."
                        value={item.name}
                        onChange={e => updateItem({ name: e.target.value, size: '', colorLines: [], colorInput: '' })}
                      />
                      <button className="pc-btn-rm" onClick={() => setComboItems(prev => prev.filter((_, idx) => idx !== i))}><X size={12} /></button>
                    </div>
                    {/* Talla global + switch tallas mixtas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.63rem', color: 'var(--muted)', fontWeight: 600, minWidth: '34px' }}>Talla</span>
                      {!item.mixedSizes && (<>
                        <button className="prod-size-btn" aria-pressed={item.size === ''} onClick={() => updateItem({ size: '' })} style={{ minWidth: '26px', padding: '0.18rem 0.4rem', fontSize: '0.68rem' }}>—</button>
                        {tallas.map((t: string) => (
                          <button key={t} className="prod-size-btn" aria-pressed={item.size === t}
                            onClick={() => updateItem({ size: item.size === t ? '' : t })}
                            style={{ minWidth: '26px', padding: '0.18rem 0.4rem', fontSize: '0.68rem' }}
                          >{t}</button>
                        ))}
                      </>)}
                      {item.mixedSizes && (
                        <span style={{ fontSize: '0.63rem', color: 'var(--muted)', fontStyle: 'italic' }}>Elige la talla en cada color ↓</span>
                      )}
                      {item.colorLines.length > 0 && (
                        <button
                          onClick={toggleMixedSizesInItem}
                          title={item.mixedSizes ? 'Una talla para todos' : 'Talla individual por color'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.63rem', fontWeight: 700,
                            background: item.mixedSizes ? 'rgba(99,102,241,0.12)' : 'var(--surface3)',
                            color: item.mixedSizes ? '#6366f1' : 'var(--muted)',
                            border: `1px solid ${item.mixedSizes ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                            borderRadius: '20px', padding: '0.18rem 0.55rem', cursor: 'pointer',
                            marginLeft: 'auto',
                          }}
                        >
                          <span style={{
                            display: 'inline-block', width: '22px', height: '12px', borderRadius: '6px',
                            background: item.mixedSizes ? '#6366f1' : 'var(--border)',
                            position: 'relative', transition: 'background 0.15s', flexShrink: 0,
                          }}>
                            <span style={{
                              position: 'absolute', top: '2px',
                              left: item.mixedSizes ? '12px' : '2px',
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: '#fff', transition: 'left 0.15s',
                            }} />
                          </span>
                          Tallas mixtas
                        </button>
                      )}
                    </div>
                    {/* Chips de colores disponibles */}
                    {colorList.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.63rem', color: 'var(--muted)', fontWeight: 600, minWidth: '34px' }}>Color</span>
                        {colorList.map((c: string) => (
                          <button key={c} className="prod-color-chip"
                            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => addColorToItem(c)}
                          >{c}</button>
                        ))}
                      </div>
                    )}
                    {/* Input color libre */}
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, maxWidth: '150px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        placeholder="Color libre..."
                        value={item.colorInput}
                        onChange={e => updateItem({ colorInput: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter' && item.colorInput.trim()) { addColorToItem(item.colorInput.trim()); updateItem({ colorInput: '' }); } }}
                      />
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => { if (item.colorInput.trim()) { addColorToItem(item.colorInput.trim()); updateItem({ colorInput: '' }); } }}
                      >+ Color</button>
                    </div>
                    {/* Colores seleccionados con qty */}
                    {item.colorLines.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem' }}>
                        {item.colorLines.map(cl => (
                          <div key={cl.color} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div className="pc-color-line" style={{ gap: '0.4rem' }}>
                              <span className="pc-color-name" style={{ flex: 1 }}>{cl.color}</span>
                              <div className="qty-stepper" style={{ height: '1.8rem' }}>
                                <button className="qty-btn" onClick={() => updateColorQtyInItem(cl.color, -1)}>−</button>
                                <input value={cl.qty} readOnly style={{ height: '1.8rem', width: '1.8rem' }} />
                                <button className="qty-btn" onClick={() => updateColorQtyInItem(cl.color, 1)}>+</button>
                              </div>
                              <button className="pc-color-rm" onClick={() => removeColorFromItem(cl.color)}><X size={11} /></button>
                            </div>
                            {item.mixedSizes && (
                              <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', paddingLeft: '0.5rem' }}>
                                {tallas.map((t: string) => (
                                  <button key={t} className="prod-size-btn"
                                    aria-pressed={cl.size === t}
                                    onClick={() => updateColorSizeInItem(cl.color, t)}
                                    style={{ minWidth: '26px', padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                                  >{t}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => setComboItems(prev => [...prev, { name: '', qty: 1, size: '', mixedSizes: false, colorLines: [], colorInput: '' }])}
              >
                <Plus size={12} /> Añadir producto
              </button>
            </div>

            {/* Nombre y precio del combo */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: '140px' }}
                placeholder="Nombre del combo..."
                value={comboName}
                onChange={e => setComboName(e.target.value)}
              />
              <input
                className="form-input"
                style={{ width: '90px' }}
                placeholder="S/ precio"
                value={comboPrice}
                onChange={e => setComboPrice(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ flexShrink: 0, padding: '0.4rem 1rem', fontSize: '0.82rem' }}
                onClick={() => {
                  const validItems = comboItems.filter(it => it.name.trim());
                  if (validItems.length === 0) return;
                  const pVal = parseFloat(comboPrice);
                  const totalQty = validItems.reduce((a, it) =>
                    a + (it.colorLines.length > 0 ? it.colorLines.reduce((s, cl) => s + cl.qty, 0) : it.qty), 0);
                  const pricePerUnit = (!isNaN(pVal) && pVal > 0 && totalQty > 0) ? pVal / totalQty : 0;
                  const nameLabel = comboName.trim() || validItems.map(it => `${it.qty}× ${it.name}`).join(' + ');
                  const ts = Date.now();
                  setProducts((prev: any[]) => [
                    ...prev,
                    ...validItems.map((it, i) => {
                      const totalQtyItem = it.colorLines.length > 0
                        ? it.colorLines.reduce((a, cl) => a + cl.qty, 0)
                        : it.qty;
                      return {
                        id: ts + i, name: it.name, size: it.size || '', qty: totalQtyItem,
                        colorLines: it.colorLines.length > 0
                          ? it.colorLines.map(cl => ({ color: cl.color, qty: cl.qty, size: it.mixedSizes ? (cl.size || undefined) : (it.size || undefined) }))
                          : [],
                        promoName: nameLabel, promoPricePerUnit: pricePerUnit,
                        promoInstance: String(ts),
                      };
                    }),
                  ]);
                  setCustomComboName((prev: string) => prev ? prev + ' + ' + nameLabel : nameLabel);
                  if (!isNaN(pVal) && pVal > 0) setPromoPrice((prev: any) => (isNaN(parseFloat(prev)) ? 0 : parseFloat(prev)) + pVal);
                  setComboItems([]);
                  setComboName('');
                  setComboPrice('');
                  setComboOpen(false);

                }}
              >
                Cargar combo
              </button>
            </div>

            {/* Nombre combo final editable */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
              <input placeholder="Nombre combo final (editable)..." className="form-input" style={{ flex: 1 }} value={customComboName} onChange={e => setCustomComboName(e.target.value)} />
              <input placeholder="Total S/" className="form-input" style={{ width: '80px' }} value={promoPrice} onChange={e => setPromoPrice(e.target.value)} />
            </div>
          </div>
        )}

        {/* Siempre visible: editar combo final si ya hay algo */}
        {!comboOpen && (customComboName || promoPrice) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
            <input placeholder="Nombre combo final..." className="form-input" style={{ flex: 1 }} value={customComboName} onChange={e => setCustomComboName(e.target.value)} />
            <input placeholder="Total S/" className="form-input" style={{ width: '80px' }} value={promoPrice} onChange={e => setPromoPrice(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Product list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.6rem' }}>
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
                <input list={listId} value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} onBlur={e => fuzzyCorrectName(p.id, e.target.value)} placeholder="Escribe o elige producto..." style={{ flex: 1 }} />
                {cpCode && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '0.12rem 0.5rem', borderRadius: '5px', background: 'rgba(69,131,77,0.12)', border: '1px solid rgba(69,131,77,0.3)', color: '#45834D', whiteSpace: 'nowrap', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {cpCode}
                  </span>
                )}
                {p.promoName && <span className="pc-promo-badge">{p.promoName}</span>}
                <button className="pc-btn-rm" onClick={() => removeProduct(p.id)} title="Quitar"><X size={13} /></button>
              </div>
              <div className="pc-row pc-controls-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.3rem' }}>
                    <span className="pc-lbl" style={{ margin: 0 }}>Talla</span>
                    {hasColorLines && (
                      <button
                        onClick={() => toggleMixedSizes(p.id)}
                        title={p.mixedSizes ? 'Una talla para todos' : 'Talla individual por color'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.63rem', fontWeight: 700,
                          padding: '0.15rem 0.5rem', borderRadius: '20px', cursor: 'pointer', border: 'none',
                          background: p.mixedSizes ? 'rgba(124,58,237,0.15)' : 'var(--surface2)',
                          color: p.mixedSizes ? 'rgb(124,58,237)' : 'var(--muted)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: '22px', height: '12px', borderRadius: '6px',
                          background: p.mixedSizes ? 'rgb(124,58,237)' : 'var(--border)',
                          position: 'relative', display: 'inline-block', flexShrink: 0, transition: 'background 0.15s',
                        }}>
                          <span style={{
                            position: 'absolute', top: '2px',
                            left: p.mixedSizes ? '12px' : '2px',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: '#fff', transition: 'left 0.15s',
                          }} />
                        </span>
                        Tallas mixtas
                      </button>
                    )}
                  </div>
                  {!p.mixedSizes && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <button className="prod-size-btn" aria-pressed={p.size === ""} onClick={() => updateProduct(p.id, 'size', "")}>—</button>
                      {tallas.map((t: string) => (
                        <button key={t} className="prod-size-btn" aria-pressed={p.size === t} onClick={() => updateProduct(p.id, 'size', t)}>{t}</button>
                      ))}
                    </div>
                  )}
                  {p.mixedSizes && (
                    <div style={{ fontSize: '0.67rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      Elige la talla en cada color ↓
                    </div>
                  )}
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
                    <div key={cL.color} className="pc-color-line" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span className="pc-color-name" style={{ flex: 1, minWidth: '70px' }}>{cL.color}</span>
                      {p.mixedSizes && (
                        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                          {tallas.map((t: string) => (
                            <button
                              key={t}
                              className="prod-size-btn"
                              aria-pressed={cL.size === t}
                              onClick={() => updateColorSize(p.id, cL.color, t)}
                              style={{ minWidth: '28px', padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                            >{t}</button>
                          ))}
                        </div>
                      )}
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
