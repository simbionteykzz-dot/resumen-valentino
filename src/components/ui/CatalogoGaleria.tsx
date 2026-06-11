import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, Download, Images, ZoomIn } from 'lucide-react';
import { CATALOGO_OVERSHARK, CATALOGO_BRAVOS } from '../../lib/catalogoImagenes';

type Brand = 'overshark' | 'bravos';
type LightboxState = { product: string; color: string; idx: number; brand: Brand } | null;

const BRANDS: { id: Brand; label: string; accent: string; bg: string; catalog: Record<string, Record<string, string[]>> }[] = [
  {
    id: 'overshark',
    label: 'Overshark',
    accent: '#45834D',
    bg: 'rgba(69,131,77,0.12)',
    catalog: CATALOGO_OVERSHARK,
  },
  {
    id: 'bravos',
    label: 'Bravos',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.12)',
    catalog: CATALOGO_BRAVOS,
  },
];

function LazyImg({
  src, alt, style, onClick,
}: {
  src: string; alt: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={visible ? src : undefined}
      alt={alt}
      decoding="async"
      onClick={onClick}
      onLoad={() => setLoaded(true)}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.2s',
        background: loaded ? undefined : 'rgba(255,255,255,0.04)',
      }}
    />
  );
}

export default function CatalogoGaleria() {
  const [open, setOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<Brand>('overshark');
  const [activeProduct, setActiveProduct] = useState<string>('');
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const brand = BRANDS.find(b => b.id === activeBrand)!;
  const products = Object.keys(brand.catalog);

  // Inicializar producto activo al abrir o cambiar marca
  useEffect(() => {
    if (products.length > 0) setActiveProduct(products[0]);
  }, [activeBrand]);

  useEffect(() => {
    if (open && activeProduct === '' && products.length > 0) {
      setActiveProduct(products[0]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setExpandedColors(new Set());
  }, [activeProduct]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else setOpen(false);
      }
      if (lightbox) {
        const b = BRANDS.find(x => x.id === lightbox.brand)!;
        const imgs = b.catalog[lightbox.product]?.[lightbox.color] ?? [];
        if (e.key === 'ArrowRight') setLightbox(l => l ? { ...l, idx: (l.idx + 1) % imgs.length } : l);
        if (e.key === 'ArrowLeft')  setLightbox(l => l ? { ...l, idx: (l.idx - 1 + imgs.length) % imgs.length } : l);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const handleDownload = useCallback((url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop() ?? 'imagen';
    a.click();
  }, []);

  const toggleColor = (key: string) =>
    setExpandedColors(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const colors = activeProduct ? Object.keys(brand.catalog[activeProduct] ?? {}) : [];
  const lbBrand = lightbox ? BRANDS.find(b => b.id === lightbox.brand)! : null;
  const lbImgs  = lightbox && lbBrand ? (lbBrand.catalog[lightbox.product]?.[lightbox.color] ?? []) : [];
  const lbUrl   = lightbox ? lbImgs[lightbox.idx] : null;

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={() => setOpen(true)}
        title="Ver catálogo de prendas"
        style={{
          position: 'fixed', bottom: '10.5rem', right: '1.25rem', zIndex: 1200,
          width: '3.25rem', height: '3.25rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, #45834D 0%, #2d5c33 100%)',
          border: 'none', boxShadow: '0 4px 16px rgba(69,131,77,0.45)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        <Images size={20} />
      </button>

      {/* ── Modal galería ── */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1300,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              width: '100%', maxWidth: '540px', height: '90dvh',
              background: 'var(--bg, #0f0f0f)',
              borderRadius: '1.4rem 1.4rem 0 0',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.1rem 0.85rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--fg, #fff)', letterSpacing: '-0.01em' }}>
                  Catálogo de Prendas
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted, #666)', marginTop: '0.15rem' }}>
                  Toca una imagen para ampliar · descarga para compartir
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--muted, #888)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* ── Tabs de marca ── */}
            <div style={{
              display: 'flex', gap: '0', padding: '0.7rem 1rem 0',
              flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {BRANDS.map(b => {
                const isActive = activeBrand === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => { setActiveBrand(b.id); setActiveProduct(''); }}
                    style={{
                      flex: 1, padding: '0.55rem 0.5rem', border: 'none', cursor: 'pointer',
                      background: 'transparent',
                      color: isActive ? b.accent : 'var(--muted, #666)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      letterSpacing: '0.02em',
                      borderBottom: isActive ? `2.5px solid ${b.accent}` : '2.5px solid transparent',
                      transition: 'all 0.15s',
                      marginBottom: '-1px',
                    }}
                  >
                    {b.label}
                    <span style={{
                      marginLeft: '0.4rem',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      background: isActive ? b.bg : 'rgba(255,255,255,0.06)',
                      color: isActive ? b.accent : 'var(--muted, #888)',
                      padding: '0.1rem 0.42rem',
                      borderRadius: '2rem',
                    }}>
                      {Object.keys(b.catalog).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Tabs de producto ── */}
            <div style={{
              display: 'flex', gap: '0.35rem', padding: '0.6rem 1rem',
              overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none',
            }}>
              {products.map(p => {
                const isActive = activeProduct === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActiveProduct(p)}
                    style={{
                      whiteSpace: 'nowrap', padding: '0.3rem 0.75rem',
                      borderRadius: '2rem',
                      border: isActive ? `1.5px solid ${brand.accent}` : '1.5px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                      fontFamily: 'inherit',
                      background: isActive ? brand.bg : 'transparent',
                      color: isActive ? brand.accent : 'var(--muted, #888)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* ── Colores + imágenes ── */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem 1rem' }}>
              {colors.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted, #666)', fontSize: '0.8rem', padding: '2rem 0' }}>
                  Selecciona un producto
                </div>
              )}
              {colors.map(color => {
                const key = `${activeProduct}__${color}`;
                const isOpen = expandedColors.has(key);
                const imgs = brand.catalog[activeProduct][color];
                return (
                  <div key={color} style={{
                    marginBottom: '0.45rem',
                    borderRadius: '0.85rem',
                    overflow: 'hidden',
                    border: isOpen
                      ? `1px solid ${brand.accent}40`
                      : '1px solid rgba(255,255,255,0.07)',
                    transition: 'border-color 0.2s',
                  }}>
                    <button
                      onClick={() => toggleColor(key)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.9rem',
                        background: isOpen ? `${brand.accent}10` : 'rgba(255,255,255,0.03)',
                        border: 'none', cursor: 'pointer', gap: '0.5rem',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                          background: isOpen ? brand.accent : 'rgba(255,255,255,0.2)',
                          transition: 'background 0.15s',
                        }} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isOpen ? brand.accent : 'var(--muted, #aaa)', textTransform: 'capitalize' }}>
                          {color}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                          {imgs.length} {imgs.length === 1 ? 'foto' : 'fotos'}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        color={isOpen ? brand.accent : 'rgba(255,255,255,0.3)'}
                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(imgs.length, 4)}, 1fr)`,
                        gap: '0.4rem',
                        padding: '0.6rem 0.9rem 0.75rem',
                      }}>
                        {imgs.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              aspectRatio: '4/5',
                              borderRadius: '0.6rem', overflow: 'hidden',
                              cursor: 'zoom-in',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.03)',
                            }}
                            onClick={() => setLightbox({ product: activeProduct, color, idx: i, brand: activeBrand })}
                          >
                            <LazyImg
                              src={src}
                              alt={`${activeProduct} ${color} ${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                              padding: '0.3rem',
                              opacity: 0,
                              transition: 'opacity 0.15s',
                            }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
                            >
                              <ZoomIn size={16} color="#fff" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && lbUrl && lbBrand && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1400,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem',
            background: 'rgba(255,255,255,0.06)', borderRadius: '2rem',
            padding: '0.4rem 0.85rem',
          }}>
            <span style={{ color: lbBrand.accent, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {lbBrand.label}
            </span>
            <span style={{ color: '#555', fontSize: '0.7rem' }}>·</span>
            <span style={{ color: '#ccc', fontSize: '0.78rem', fontWeight: 600 }}>
              {lightbox.product}
            </span>
            <span style={{ color: '#555', fontSize: '0.7rem' }}>·</span>
            <span style={{ color: '#888', fontSize: '0.72rem', textTransform: 'capitalize' }}>{lightbox.color}</span>
            <span style={{ color: '#555', fontSize: '0.7rem' }}>{lightbox.idx + 1}/{lbImgs.length}</span>
            <button
              onClick={() => handleDownload(lbUrl)}
              title="Descargar"
              style={{ background: lbBrand.bg, border: 'none', borderRadius: '1rem', padding: '0.28rem 0.6rem', color: lbBrand.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'inherit' }}
            >
              <Download size={12} /> Descargar
            </button>
            <button onClick={() => setLightbox(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={18} />
            </button>
          </div>

          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '72vh', display: 'flex', alignItems: 'center' }}>
            {lbImgs.length > 1 && (
              <button
                onClick={() => setLightbox(l => l ? { ...l, idx: (l.idx - 1 + lbImgs.length) % lbImgs.length } : l)}
                style={{ position: 'absolute', left: '-2.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '2.2rem', height: '2.2rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <img
              src={lbUrl}
              alt=""
              decoding="async"
              style={{ maxWidth: '90vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: '0.9rem', boxShadow: '0 12px 60px rgba(0,0,0,0.7)' }}
            />
            {lbImgs.length > 1 && (
              <button
                onClick={() => setLightbox(l => l ? { ...l, idx: (l.idx + 1) % lbImgs.length } : l)}
                style={{ position: 'absolute', right: '-2.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '2.2rem', height: '2.2rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {lbImgs.length > 1 && (
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem', overflowX: 'auto', maxWidth: '90vw', padding: '0.1rem' }}>
              {lbImgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  decoding="async"
                  onClick={() => setLightbox(l => l ? { ...l, idx: i } : l)}
                  alt=""
                  style={{
                    width: '50px', height: '62px', objectFit: 'cover', borderRadius: '0.45rem',
                    cursor: 'pointer', flexShrink: 0,
                    opacity: i === lightbox.idx ? 1 : 0.35,
                    border: i === lightbox.idx ? `2px solid ${lbBrand.accent}` : '2px solid transparent',
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
