import React, { useState, useMemo } from 'react';
import {
  Copy, Check, MessageSquare, Search,
  DollarSign, Clock, Palette, Award, Truck, Scale,
  Ruler, CreditCard, ShieldCheck, HelpCircle, ThumbsDown, Zap,
} from 'lucide-react';

type Category = 'todas' | 'precio' | 'producto' | 'envio' | 'marca' | 'pago';

interface Respuesta {
  titulo: string;
  subtitulo: string;
  icon: React.ReactNode;
  category: Category;
  color: string;
  respuesta: string;
}

const RESPUESTAS: Respuesta[] = [
  {
    titulo: 'Es muy caro',
    subtitulo: 'Precio alto',
    icon: <DollarSign size={14} />,
    category: 'precio',
    color: '239,68,68',
    respuesta: `¡Entiendo! Pero mirá — cada polo cuesta menos de S/20 en promo 🔥\n\nComparalo con cualquier tienda: misma calidad te sale S/50-70 por UNO. Acá te llevas 5 o más al mismo precio 💎\n\n¡Y te regalamos cadenita! Más barato imposible 🎁`,
  },
  {
    titulo: 'Lo voy a pensar',
    subtitulo: 'Sin decisión',
    icon: <Clock size={14} />,
    category: 'precio',
    color: '250,204,21',
    respuesta: `¡Claro, tómate tu tiempo! Pero te cuento que esta promo es por tiempo limitado ⏳\n\nHoy ya vendimos varios de estos modelos y el stock se está acabando. Si se agotan, el precio vuelve a S/45 cada uno 📈\n\n¿Te separo uno mientras decides? Sin compromiso 😉`,
  },
  {
    titulo: 'En otro lado es más barato',
    subtitulo: 'Comparación',
    icon: <Scale size={14} />,
    category: 'precio',
    color: '168,85,247',
    respuesta: `¡Compará calidad por calidad! 💎\n\nNuestros polos son tela premium, costura reforzada y colores que duran. Los "baratos" se deforman a la segunda lavada 🫠\n\nAdemás con nuestras promos te llevas 5–10 polos por S/99. ¡Eso no lo encuentras en ningún lado! 🔥`,
  },
  {
    titulo: 'No me convence el color',
    subtitulo: 'Variedad de colores',
    icon: <Palette size={14} />,
    category: 'producto',
    color: '56,200,245',
    respuesta: `¡Tenemos más de 15 colores disponibles! 🌈\n\nAzul, negro, beige, cemento, vino, plomo, topo... ¡Seguro hay uno que te encanta!\n\n¿Qué colores usas más? Te ayudo a elegir la combinación perfecta 👕✨`,
  },
  {
    titulo: '¿Qué tallas hay?',
    subtitulo: 'Consulta de tallas',
    icon: <Ruler size={14} />,
    category: 'producto',
    color: '34,197,94',
    respuesta: `¡Tenemos todas las tallas! XS, S, M, L, XL y XXL 📏\n\nLa tela es elástica y se adapta muy bien al cuerpo, así que si estás entre dos tallas te recomiendo la más chica para un fit ceñido o la más grande para un look holgado 😊\n\n¿Cuál es tu talla habitual?`,
  },
  {
    titulo: '¿Son de buena calidad?',
    subtitulo: 'Duda de calidad',
    icon: <ThumbsDown size={14} />,
    category: 'producto',
    color: '251,146,60',
    respuesta: `¡100% garantizado! La tela es premium — suave, elástica y no se deforma ni destiñe con las lavadas 💎\n\nTenemos miles de clientes que vuelven a comprar justamente por eso. ¡La calidad habla sola! 🔥\n\nAdemás si en 7 días hay algún defecto de fábrica, lo cambiamos sin problema ✅`,
  },
  {
    titulo: 'No conozco la marca',
    subtitulo: 'Desconocimiento',
    icon: <Award size={14} />,
    category: 'marca',
    color: '0,230,150',
    respuesta: `¡Overshark es una marca peruana con miles de clientes satisfechos! 🇵🇪\n\nTenemos +500 ventas solo esta semana. Calidad premium, tela que no se deforma y colores que no se destiñen 💯\n\nPregúntale a cualquiera que ya compró — ¡siempre vuelven! 🔥`,
  },
  {
    titulo: '¿Son originales?',
    subtitulo: 'Autenticidad',
    icon: <ShieldCheck size={14} />,
    category: 'marca',
    color: '99,102,241',
    respuesta: `¡Claro que sí! Somos tienda oficial de Overshark 🏷️\n\nProducción propia, fabricados en Perú con estándares de calidad controlados. No somos revendedores ni imitaciones 💯\n\nCada prenda sale directamente de nuestra planta. ¡Garantía total! ✅`,
  },
  {
    titulo: 'El envío es muy caro',
    subtitulo: 'Costo de envío',
    icon: <Truck size={14} />,
    category: 'envio',
    color: '255,107,0',
    respuesta: `El envío es S/12–14, ¡pero incluye seguro y tracking en tiempo real! 📦\n\nAdemás piensa: te ahorras el pasaje, el tiempo y la molestia de ir a buscar. ¡Te llega a la puerta de tu casa! 🏠\n\nCon la cantidad que llevas, el envío sale prácticamente gratis por prenda 😎`,
  },
  {
    titulo: '¿Cuándo llega?',
    subtitulo: 'Tiempo de entrega',
    icon: <Clock size={14} />,
    category: 'envio',
    color: '20,184,166',
    respuesta: `¡Depende de tu ubicación! 📍\n\n📦 Lima: 1–2 días hábiles\n🚚 Provincias (Shalom): 3–5 días hábiles\n\nTe mandamos el código de rastreo apenas despachamos, así puedes seguir tu pedido en todo momento ✅`,
  },
  {
    titulo: '¿El pago es seguro?',
    subtitulo: 'Seguridad de pago',
    icon: <CreditCard size={14} />,
    category: 'pago',
    color: '59,130,246',
    respuesta: `¡Totalmente seguro! Aceptamos Yape, Plin, transferencia bancaria y pago contra entrega 💳\n\nCon contra entrega pagas cuando recibes el paquete — ¡así tienes cero riesgo! 🔒\n\nMiles de clientes ya compraron con nosotros sin ningún problema 😊`,
  },
  {
    titulo: '¿Se puede devolver?',
    subtitulo: 'Política de cambios',
    icon: <HelpCircle size={14} />,
    category: 'pago',
    color: '236,72,153',
    respuesta: `¡Sí! Si hay un defecto de fábrica hacemos el cambio en 7 días 🔄\n\nSolo necesitas el número de pedido y una foto del problema. ¡Súper fácil y sin complicaciones! 📸\n\nNuestro equipo de soporte responde el mismo día 💬`,
  },
  {
    titulo: 'No tengo plata ahora',
    subtitulo: 'Sin presupuesto',
    icon: <Zap size={14} />,
    category: 'pago',
    color: '234,179,8',
    respuesta: `¡No hay problema! Te dejo separado con un pequeño adelanto y pagas el resto cuando llegue 😊\n\nO si prefieres, elige el paquete más pequeño para empezar — desde S/49 ya te llevas una buena cantidad 🛍️\n\n¿Cuánto podrías destinar hoy? Te armo una opción a tu medida 💪`,
  },
];

const CATEGORIAS: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'todas',    label: 'Todas',    icon: <MessageSquare size={12} /> },
  { id: 'precio',   label: 'Precio',   icon: <DollarSign size={12} /> },
  { id: 'producto', label: 'Producto', icon: <Palette size={12} /> },
  { id: 'envio',    label: 'Envío',    icon: <Truck size={12} /> },
  { id: 'marca',    label: 'Marca',    icon: <Award size={12} /> },
  { id: 'pago',     label: 'Pago',     icon: <CreditCard size={12} /> },
];

export default function RespuestasPanel() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>('todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let r = RESPUESTAS;
    if (category !== 'todas') r = r.filter(x => x.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.titulo.toLowerCase().includes(q) ||
        x.subtitulo.toLowerCase().includes(q) ||
        x.respuesta.toLowerCase().includes(q),
      );
    }
    return r;
  }, [category, search]);

  const handleCopy = (text: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  };

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = { todas: RESPUESTAS.length };
    RESPUESTAS.forEach(r => { m[r.category] = (m[r.category] || 0) + 1; });
    return m;
  }, []);

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      {/* Cabecera */}
      <div className="cliente-panel-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <MessageSquare size={20} /> Respuestas Rápidas
        </h2>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '160px' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar respuesta..."
            style={{
              width: '100%', padding: '0.38rem 0.75rem 0.38rem 2rem',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Filtros de categoría */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '1rem' }}>
        {CATEGORIAS.map(cat => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.3rem 0.7rem', fontSize: '0.76rem', fontWeight: 700,
                borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
                background: active ? 'var(--accent)' : 'var(--surface2)',
                color: active ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s',
              }}
            >
              {cat.icon} {cat.label}
              <span style={{
                fontSize: '0.68rem', fontWeight: 900,
                background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface3)',
                borderRadius: '10px', padding: '0 5px', lineHeight: '1.5',
              }}>
                {categoryCounts[cat.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de respuestas */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin resultados para "{search}"
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.6rem' }}>
          {filtered.map((obj, i) => {
            const isExpanded = expandedIdx === i;
            const isCopied = copiedIdx === i;
            const lines = obj.respuesta.split('\n').filter(Boolean);
            const preview = lines[0];

            return (
              <div
                key={i}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                style={{
                  padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                  background: `linear-gradient(135deg, rgba(${obj.color},0.08), rgba(${obj.color},0.03))`,
                  border: `1.5px solid rgba(${obj.color},${isExpanded ? '0.45' : '0.2'})`,
                  transition: 'all 0.2s',
                  boxShadow: isExpanded ? `0 4px 18px rgba(${obj.color},0.12)` : 'none',
                }}
              >
                {/* Cabecera de la card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                        background: `rgba(${obj.color},0.15)`, color: `rgb(${obj.color})`,
                      }}>
                        {obj.icon}
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: `rgb(${obj.color})`, lineHeight: 1.2 }}>
                        "{obj.titulo}"
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500, paddingLeft: '26px' }}>
                      {obj.subtitulo}
                    </span>
                  </div>

                  {/* Botón copiar */}
                  <button
                    onClick={e => handleCopy(obj.respuesta, i, e)}
                    title="Copiar respuesta"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.6rem', borderRadius: '8px', flexShrink: 0,
                      background: isCopied ? `rgba(${obj.color},0.2)` : 'var(--surface2)',
                      border: `1px solid rgba(${obj.color},0.25)`,
                      color: isCopied ? `rgb(${obj.color})` : 'var(--muted)',
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCopied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>

                {/* Preview / texto completo */}
                <div style={{ marginTop: '0.6rem', paddingLeft: '26px' }}>
                  {isExpanded ? (
                    <div style={{
                      fontSize: '0.79rem', color: 'var(--text)', lineHeight: 1.55,
                      whiteSpace: 'pre-line',
                      background: `rgba(${obj.color},0.06)`,
                      border: `1px solid rgba(${obj.color},0.15)`,
                      borderRadius: '8px', padding: '0.65rem 0.75rem',
                    }}>
                      {obj.respuesta}
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '0.77rem', color: 'var(--muted)', lineHeight: 1.45,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {preview}
                    </p>
                  )}
                  <span style={{
                    fontSize: '0.7rem', color: `rgb(${obj.color})`, fontWeight: 700,
                    marginTop: '0.35rem', display: 'block', opacity: 0.8,
                  }}>
                    {isExpanded ? '▲ Ocultar' : '▼ Ver respuesta completa'}
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
