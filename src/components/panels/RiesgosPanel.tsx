import React, { useState, useMemo } from 'react';
import {
  Copy, Check, Search,
  ShoppingCart, RefreshCw, MessageSquareWarning, Truck,
  AlertTriangle,
} from 'lucide-react';

type Category = 'todas' | 'abandono' | 'devolucion' | 'queja' | 'retraso';

interface Plantilla {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  category: Category;
  color: string;
  texto: string;
}

const PLANTILLAS: Plantilla[] = [
  // ── ABANDONO ─────────────────────────────────────────────────────────
  {
    titulo: 'Carrito abandonado',
    descripcion: 'Recuperar al cliente que no completó su pedido',
    icon: <ShoppingCart size={14} />,
    category: 'abandono',
    color: '234,179,8',
    texto: `Paso por aquí rapidito porque vi que dejaste tu pedido pendiente 🛒✨\n¿Necesitas ayuda para completarlo? Avísame 💪\n\n¡Anímate que ya quedan poquitos! 🔥`,
  },
  {
    titulo: 'Seguimiento tras abandono',
    descripcion: 'Segundo intento con urgencia suave',
    icon: <ShoppingCart size={14} />,
    category: 'abandono',
    color: '234,179,8',
    texto: `Te escribo súper rápido porque noté que no llegaste a terminar tu pedido 😊\nEl modelo que elegiste sigue disponible, ¡pero el stock está volando! ⚠️🔥\n\n¿Deseas que lo separe con un pequeño abono de [MONTO]? 💵✅`,
  },
  {
    titulo: 'Abandono con descuento',
    descripcion: 'Incentivo adicional para cerrar la venta',
    icon: <ShoppingCart size={14} />,
    category: 'abandono',
    color: '234,179,8',
    texto: `¡Qué tal! 😊 Noté que te interesó nuestro producto pero quedó pendiente 🛒\n\nMe encantaría ayudarte a cerrarlo hoy mismo con una promo especial 🎁. Escríbeme y te cuento 💪✨`,
  },

  // ── DEVOLUCIÓN ────────────────────────────────────────────────────────
  {
    titulo: 'Devoluciones y cambios',
    descripcion: 'Atención de reclamos con solución rápida',
    icon: <RefreshCw size={14} />,
    category: 'devolucion',
    color: '14,165,233',
    texto: `¡Uy, qué pena! 🥺 Te pido mil disculpas por el inconveniente.\nPor favor, pásame tu número de pedido 📋 y una fotito del producto 📸 para darte solución ahora mismo ✅\n\n¡Estoy aquí para resolverlo rápido contigo! 🙌`,
  },
  {
    titulo: 'Cambio de talla o color',
    descripcion: 'Cuando el cliente recibió algo que no era lo esperado',
    icon: <RefreshCw size={14} />,
    category: 'devolucion',
    color: '14,165,233',
    texto: `Me apena mucho saber que no era lo que esperabas 😔\nCuéntame qué talla o color te quedaría mejor 👕 y reviso al toque el stock para el cambio sin costo extra ✅`,
  },
  {
    titulo: 'Producto con defecto',
    descripcion: 'Gestión de defectos de fabricación',
    icon: <RefreshCw size={14} />,
    category: 'devolucion',
    color: '14,165,233',
    texto: `Lamento muchísimo esto que me cuentas 😔\nMándame una fotito del defecto 📸 y tu número de pedido 📋\n\nGestionaré el cambio inmediato por uno perfecto 🔄✅ ¡Lo solucionamos ya mismo!`,
  },

  // ── QUEJA ─────────────────────────────────────────────────────────────
  {
    titulo: 'Queja → Venta activa',
    descripcion: 'Convertir una queja en una compra activa',
    icon: <MessageSquareWarning size={14} />,
    category: 'queja',
    color: '168,85,247',
    texto: `Entiendo totalmente tu molestia y quiero solucionarlo ahora mismo 🙏\nTe propongo un cambio directo por talla, color o el modelo que gustes para que no pierdas tu compra 🔄✨\n\nDime qué opción prefieres y lo coordino al instante 💪`,
  },
  {
    titulo: 'Cliente insatisfecho',
    descripcion: 'Respuesta empática ante mala experiencia',
    icon: <MessageSquareWarning size={14} />,
    category: 'queja',
    color: '168,85,247',
    texto: `De verdad lamento muchísimo que tu experiencia no haya sido excelente 😔\nTu opinión es valiosísima 🙏\n\nCuéntame un poco más qué pasó para buscar juntos una solución justa para ti ✅💙`,
  },
  {
    titulo: 'Queja en redes sociales',
    descripcion: 'Respuesta rápida ante comentarios negativos públicos',
    icon: <MessageSquareWarning size={14} />,
    category: 'queja',
    color: '168,85,247',
    texto: `Vimos tu comentario y estoy aquí para ayudarte 🙏\nEnvíame tu número de pedido por aquí 📋 para revisar tu caso a fondo y darte una solución rápida ⚡✅\n\n¡Te agradezco por avisarnos! 💙`,
  },

  // ── RETRASO ───────────────────────────────────────────────────────────
  {
    titulo: 'Retraso en entrega',
    descripcion: 'Gestión de demoras con actualización prometida',
    icon: <Truck size={14} />,
    category: 'retraso',
    color: '239,68,68',
    texto: `Te pido muchísimas disculpas por la demora con tu pedido 😔\nYa mismo me comunico con la agencia para presionar la entrega 🔍 y te aviso de inmediato ⏰\n\n¡Agradezco de corazón tu paciencia! 🙏`,
  },
  {
    titulo: 'Retraso por alta demanda',
    descripcion: 'Cuando hay demoras por temporada alta',
    icon: <Truck size={14} />,
    category: 'retraso',
    color: '239,68,68',
    texto: `Te escribo para contarte que por alta demanda 📦🔥, las agencias tienen ligeros retrasos ⏳\n\nTu pedido está asegurado y en camino ✅ Te paso el código de seguimiento en cuanto me lo envíen 📲`,
  },
  {
    titulo: 'Pedido en revisión',
    descripcion: 'Cuando hay un problema con el envío y se está investigando',
    icon: <Truck size={14} />,
    category: 'retraso',
    color: '239,68,68',
    texto: `Te comento que abrimos un ticket de revisión con la agencia por tu pedido 🔍📋\nEstaré súper pendiente y te avisaré por aquí 📲\n\nLamento mucho el retraso y gracias mil por la paciencia 🙏💙`,
  },
];

const CATEGORIAS: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'todas',     label: 'Todas',      icon: <AlertTriangle size={12} /> },
  { id: 'abandono',  label: 'Abandono',   icon: <ShoppingCart size={12} /> },
  { id: 'devolucion',label: 'Devolución', icon: <RefreshCw size={12} /> },
  { id: 'queja',     label: 'Queja',      icon: <MessageSquareWarning size={12} /> },
  { id: 'retraso',   label: 'Retraso',    icon: <Truck size={12} /> },
];

export default function RiesgosPanel() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>('todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let r = PLANTILLAS;
    if (category !== 'todas') r = r.filter(x => x.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.titulo.toLowerCase().includes(q) ||
        x.descripcion.toLowerCase().includes(q) ||
        x.texto.toLowerCase().includes(q),
      );
    }
    return r;
  }, [category, search]);

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = { todas: PLANTILLAS.length };
    PLANTILLAS.forEach(p => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
  }, []);

  const handleCopy = (texto: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(texto).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar plantilla..."
          style={{
            width: '100%', padding: '0.42rem 0.75rem 0.42rem 2rem',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {CATEGORIAS.map(cat => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.28rem 0.65rem', fontSize: '0.75rem', fontWeight: 700,
                borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
                background: active ? '#DC2626' : 'var(--surface2)',
                color: active ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s',
              }}
            >
              {cat.icon} {cat.label}
              <span style={{
                fontSize: '0.67rem', fontWeight: 900,
                background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface3)',
                borderRadius: '10px', padding: '0 5px', lineHeight: '1.5',
              }}>
                {categoryCounts[cat.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin resultados para "{search}"
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {filtered.map((p, i) => {
            const isExpanded = expandedIdx === i;
            const isCopied = copiedIdx === i;
            const firstLine = p.texto.split('\n')[0];

            return (
              <div
                key={i}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                style={{
                  padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer',
                  background: `linear-gradient(135deg, rgba(${p.color},0.08), rgba(${p.color},0.02))`,
                  border: `1.5px solid rgba(${p.color},${isExpanded ? '0.45' : '0.2'})`,
                  transition: 'all 0.2s',
                  boxShadow: isExpanded ? `0 4px 16px rgba(${p.color},0.12)` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                        background: `rgba(${p.color},0.15)`, color: `rgb(${p.color})`,
                      }}>
                        {p.icon}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: `rgb(${p.color})`, lineHeight: 1.2 }}>
                        {p.titulo}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.71rem', color: 'var(--muted)', fontWeight: 500, paddingLeft: '26px', display: 'block' }}>
                      {p.descripcion}
                    </span>
                  </div>
                  <button
                    onClick={e => handleCopy(p.texto, i, e)}
                    title="Copiar mensaje"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.65rem', borderRadius: '8px', flexShrink: 0,
                      background: isCopied ? `rgba(${p.color},0.2)` : 'var(--surface2)',
                      border: `1px solid rgba(${p.color},0.25)`,
                      color: isCopied ? `rgb(${p.color})` : 'var(--muted)',
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCopied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>

                <div style={{ marginTop: '0.55rem', paddingLeft: '26px' }}>
                  {isExpanded ? (
                    <div style={{
                      fontSize: '0.79rem', color: 'var(--text)', lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      background: `rgba(${p.color},0.06)`,
                      border: `1px solid rgba(${p.color},0.15)`,
                      borderRadius: '8px', padding: '0.65rem 0.75rem',
                    }}>
                      {p.texto}
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '0.77rem', color: 'var(--muted)', lineHeight: 1.4,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {firstLine}
                    </p>
                  )}
                  <span style={{
                    fontSize: '0.7rem', color: `rgb(${p.color})`, fontWeight: 700,
                    marginTop: '0.3rem', display: 'block', opacity: 0.8,
                  }}>
                    {isExpanded ? '▲ Ocultar' : '▼ Ver mensaje completo'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
