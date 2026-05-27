import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, Download, Images, ZoomIn } from 'lucide-react';
import { CATALOGO_IMAGENES } from '../../lib/catalogoImagenes';

const PRODUCT_LABELS: Record<string, string> = {
  'CAMISA WAFFLE':      'Camisa Waffle',
  'CAMISERO JERSEY':    'Camisero Jersey',
  'CAMISERO PIKE':      'Camisero Pike',
  'CAMISERO WAFFLE':    'Camisero Waffle',
  'CLASICOS-Ok':        'Clásico',
  'MANGA LARGA JERSEY': 'Manga Larga Jersey',
  'MANGA LARGA WAFFLE': 'Manga Larga Waffle',
  'NOTCH PIQUE':        'Notch Piqué',
  'NOTCH WAFFLE':       'Notch Waffle',
  'WAFFLE CLASICO-Ok':  'Waffle Clásico',
};

const ALL_PRODUCTS = Object.keys(CATALOGO_IMAGENES);

type LightboxState = { product: string; color: string; idx: number } | null;

// ── Lazy image: solo carga cuando entra en el area visible ──
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
        transition: 'opacity 0.18s',
        background: loaded ? undefined : 'rgba(255,255,255,0.06)',
      }}
    />
  );
}

export default function CatalogoGaleria() {
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<string>(ALL_PRODUCTS[0] ?? '');
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleColor = (key: string) =>
    setExpandedColors(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Al cambiar producto: scroll arriba y colapsar todo
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setExpandedColors(new Set());
  }, [activeProduct]);

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else setOpen(false);
      }
      if (lightbox) {
        const imgs = CATALOGO_IMAGENES[lightbox.product]?.[lightbox.color] ?? [];
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

  const colors  = activeProduct ? Object.keys(CATALOGO_IMAGENES[activeProduct] ?? {}) : [];
  const lbImgs  = lightbox ? (CATALOGO_IMAGENES[lightbox.product]?.[lightbox.color] ?? []) : [];
  const lbUrl   = lightbox ? lbImgs[lightbox.idx] : null;

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={() => setOpen(true)}
        title="Ver catálogo de prendas"
        style={{
          position: 'fixed', bottom: '5.5rem', right: '1.25rem', zIndex: 1200,
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
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              width: '100%', maxWidth: '520px', height: '88dvh',
              background: 'var(--bg, #111)', borderRadius: '1.25rem 1.25rem 0 0',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--fg, #fff)' }}>Catálogo Prendas</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted, #888)', marginTop: '0.1rem' }}>Toca una imagen para ampliar · descarga para compartir</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted, #888)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs productos */}
            <div style={{ display: 'flex', gap: '0.4rem', padding: '0.65rem 1rem', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
              {ALL_PRODUCTS.map(p => (
                <button
                  key={p}
                  onClick={() => setActiveProduct(p)}
                  style={{
                    whiteSpace: 'nowrap', padding: '0.35rem 0.8rem',
                    borderRadius: '2rem', border: 'none', cursor: 'pointer',
                    fontSize: '0.76rem', fontWeight: 600,
                    background: activeProduct === p ? '#45834D' : 'rgba(255,255,255,0.07)',
                    color: activeProduct === p ? '#fff' : 'var(--muted, #aaa)',
                    transition: 'background 0.15s',
                  }}
                >
                  {PRODUCT_LABELS[p] ?? p}
                </button>
              ))}
            </div>

            {/* Colores + imágenes */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem 1rem' }}>
              {colors.map(color => {
                const key = `${activeProduct}__${color}`;
                const isOpen = expandedColors.has(key);
                const imgs = CATALOGO_IMAGENES[activeProduct][color];
                return (
                  <div key={color} style={{ marginBottom: '0.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* Cabecera desplegable */}
                    <button
                      onClick={() => toggleColor(key)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.04)',
                        border: 'none', cursor: 'pointer', gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted, #aaa)' }}>
                          {color}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                          {imgs.length} {imgs.length === 1 ? 'foto' : 'fotos'}
                        </span>
                      </div>
                      <ChevronDown
                        size={15}
                        color="var(--muted, #aaa)"
                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                      />
                    </button>

                    {/* Imágenes — solo se montan si está abierto */}
                    {isOpen && (
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', padding: '0.6rem 0.85rem 0.75rem' }}>
                        {imgs.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'relative', flexShrink: 0,
                              width: '110px', height: '138px',
                              borderRadius: '0.65rem', overflow: 'hidden',
                              cursor: 'zoom-in',
                              border: '1px solid rgba(255,255,255,0.09)',
                              background: 'rgba(255,255,255,0.04)',
                            }}
                          >
                            <LazyImg
                              src={src}
                              alt={`${activeProduct} ${color} ${i + 1}`}
                              onClick={() => setLightbox({ product: activeProduct, color, idx: i })}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <div
                              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', pointerEvents: 'none' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.35)'; (e.currentTarget as HTMLDivElement).style.opacity = '1'; (e.currentTarget as HTMLDivElement).style.pointerEvents = 'auto'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'; (e.currentTarget as HTMLDivElement).style.opacity = '0'; (e.currentTarget as HTMLDivElement).style.pointerEvents = 'none'; }}
                            >
                              <ZoomIn size={22} color="#fff" />
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
      {lightbox && lbUrl && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1400,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Info + acciones */}
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: 600 }}>
              {PRODUCT_LABELS[lightbox.product] ?? lightbox.product} — {lightbox.color}
            </span>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>{lightbox.idx + 1}/{lbImgs.length}</span>
            <button
              onClick={() => handleDownload(lbUrl)}
              title="Descargar imagen"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', padding: '0.35rem 0.6rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
            >
              <Download size={14} /> Descargar
            </button>
            <button onClick={() => setLightbox(null)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Imagen principal */}
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '75vh', display: 'flex', alignItems: 'center' }}>
            {lbImgs.length > 1 && (
              <button
                onClick={() => setLightbox(l => l ? { ...l, idx: (l.idx - 1 + lbImgs.length) % lbImgs.length } : l)}
                style={{ position: 'absolute', left: '-2.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <img
              src={lbUrl}
              alt=""
              decoding="async"
              style={{ maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: '0.75rem', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
            />
            {lbImgs.length > 1 && (
              <button
                onClick={() => setLightbox(l => l ? { ...l, idx: (l.idx + 1) % lbImgs.length } : l)}
                style={{ position: 'absolute', right: '-2.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* Miniaturas */}
          {lbImgs.length > 1 && (
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.9rem', overflowX: 'auto', maxWidth: '90vw' }}>
              {lbImgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  decoding="async"
                  onClick={() => setLightbox(l => l ? { ...l, idx: i } : l)}
                  alt=""
                  style={{
                    width: '52px', height: '65px', objectFit: 'cover', borderRadius: '0.4rem',
                    cursor: 'pointer', flexShrink: 0,
                    opacity: i === lightbox.idx ? 1 : 0.45,
                    border: i === lightbox.idx ? '2px solid #45834D' : '2px solid transparent',
                    transition: 'opacity 0.15s',
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
