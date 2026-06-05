import React, { useState, useMemo } from 'react';
import {
  Copy, Check, MessageSquare, Search,
  DollarSign, Clock, Palette, Award, Truck, Scale,
  Ruler, CreditCard, ShieldCheck, HelpCircle, ThumbsDown, Zap, Car,
} from 'lucide-react';

type Category = 'todas' | 'precio' | 'producto' | 'envio' | 'marca' | 'pago' | 'indrive';

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
    respuesta: `¡Te entiendo! 😊 Pero mira, en esta promo cada polo te sale a menos de S/20 🔥\n\nEn tiendas, esta misma calidad premium te cuesta S/50-70 por uno solo. Acá te llevas 5 y te durarán muchísimo 💎\n\n¡Además te regalo una cadenita! Más a cuenta imposible 🎁`,
  },
  {
    titulo: 'Lo voy a pensar',
    subtitulo: 'Sin decisión',
    icon: <Clock size={14} />,
    category: 'precio',
    color: '250,204,21',
    respuesta: `¡Tómate tu tiempo, sin apuro! 😊 Solo te aviso chiquito que esta promo es por tiempo limitado ⏳\n\nMi stock se está moviendo rápido. Si se acaban, el precio vuelve a S/45 cada uno 📈\n\n¿Te separo tu pack sin compromiso para que no pierdas la promo? 😉`,
  },
  {
    titulo: 'En otro lado es más barato',
    subtitulo: 'Comparación',
    icon: <Scale size={14} />,
    category: 'precio',
    color: '168,85,247',
    respuesta: `¡Tienes razón en comparar! 💎\n\nLo que te garantizo es que nuestros polos son tela premium, costura reforzada y no destiñen. A veces lo "barato" se deforma rápido 🫠\n\nAquí te llevas 5 polos de altísima calidad por S/99. ¡Te van a encantar! 🔥`,
  },
  {
    titulo: 'No me convence el color',
    subtitulo: 'Variedad de colores',
    icon: <Palette size={14} />,
    category: 'producto',
    color: '56,200,245',
    respuesta: `¡No te preocupes! Tenemos más de 15 colores 🌈\n\nDesde los clásicos hasta colores en tendencia (cemento, vino, topo). ¡Seguro hay uno para ti!\n\n¿Qué colores usas más? Te ayudo a armar la combinación perfecta 👕✨`,
  },
  {
    titulo: '¿Qué tallas hay?',
    subtitulo: 'Consulta de tallas',
    icon: <Ruler size={14} />,
    category: 'producto',
    color: '34,197,94',
    respuesta: `¡Manejamos todas las tallas! Desde XS hasta XXL 📏\n\nNuestra tela tiene buen rebote. Si te gusta pegadito, pide tu talla exacta; si prefieres holgado, pide una más 😊\n\n¿Qué talla usas normalmente?`,
  },
  {
    titulo: '¿Son de buena calidad?',
    subtitulo: 'Duda de calidad',
    icon: <ThumbsDown size={14} />,
    category: 'producto',
    color: '251,146,60',
    respuesta: `¡Te doy mi palabra de que sí! Tela premium que cede rico, no deforma ni destiñe 💎\n\nMiles de clientes nos vuelven a comprar por lo bien que dura 🔥\n\nY si algo no estuviera perfecto, te lo cambiamos sin costo ✅`,
  },
  {
    titulo: 'No conozco la marca',
    subtitulo: 'Desconocimiento',
    icon: <Award size={14} />,
    category: 'marca',
    color: '0,230,150',
    respuesta: `Overshark es una marca 100% peruana con miles de clientes felices 🇵🇪\n\nEnviamos +500 pedidos por semana. Nuestra prioridad es dar calidad premium a precio justo 💯\n\n¡Pruébalos y verás que te vuelves cliente frecuente! 🔥`,
  },
  {
    titulo: '¿Son originales?',
    subtitulo: 'Autenticidad',
    icon: <ShieldCheck size={14} />,
    category: 'marca',
    color: '99,102,241',
    respuesta: `¡Totalmente! Somos la tienda oficial directa de Overshark 🏷️\n\nFabricamos en Perú cuidando cada detalle. Cero revendedores, por eso el súper precio y calidad 💯\n\n¡Garantía absoluta! ✅`,
  },
  {
    titulo: 'El envío es muy caro',
    subtitulo: 'Costo de envío',
    icon: <Truck size={14} />,
    category: 'envio',
    color: '255,107,0',
    respuesta: `El envío es de S/12 a S/14, pero incluye entrega 100% segura hasta tus manos 📦\n\nTe ahorras el pasaje y el tráfico. ¡Nosotros te lo llevamos! 🏠\n\nCon esta promo, el envío te sale por centavos cada polo 😎`,
  },
  {
    titulo: '¿Cuándo llega?',
    subtitulo: 'Tiempo de entrega',
    icon: <Clock size={14} />,
    category: 'envio',
    color: '20,184,166',
    respuesta: `¡Llega rapidísimo! 📍\n\n📦 Lima: 1 a 2 días hábiles.\n🚚 Provincias: 3 a 5 días hábiles a nuestro courier Zazu.\n\nApenas despachemos te paso tu código de rastreo ✅`,
  },
  {
    titulo: '¿El pago es seguro?',
    subtitulo: 'Seguridad de pago',
    icon: <CreditCard size={14} />,
    category: 'pago',
    color: '59,130,246',
    respuesta: `¡100% seguro! Aceptamos Yape, Plin y transferencia 💳\n\nEn Lima, tienes "Contra Entrega" para pagar el saldo al recibir. ¡Riesgo cero! 🔒\n\nMiles de clientes nos respaldan 😊`,
  },
  {
    titulo: '¿Se puede devolver?',
    subtitulo: 'Política de cambios',
    icon: <HelpCircle size={14} />,
    category: 'pago',
    color: '236,72,153',
    respuesta: `¡Por supuesto! Si hubiera algún defectito de fábrica, te hacemos el cambio rápido dentro de 7 días 🔄\n\nSolo envías foto y número de pedido, sin trabas ni problemas 📸\n\n¡Siempre tendrás nuestro soporte! 💬`,
  },
  {
    titulo: 'No tengo plata ahora',
    subtitulo: 'Sin presupuesto',
    icon: <Zap size={14} />,
    category: 'pago',
    color: '234,179,8',
    respuesta: `¡Entiendo perfecto! Puedes separarlo con un adelanto chiquito y pagar el resto con calma 😊\n\nO podemos armar un pack desde S/49 🛍️\n\n¿Con cuánto te sentirías cómodo/a hoy? Yo te ayudo 💪`,
  },
  {
    titulo: 'Envío por Indrive (separación)',
    subtitulo: 'Entrega express Lima',
    icon: <Car size={14} />,
    category: 'indrive',
    color: '251,191,36',
    respuesta: `¡Claro que sí! Si quieres tus polos para hoy mismo, podemos coordinarlo por Indrive 🚗✨\n\nSolo te pido que canceles el total del pedido antes de despachar, ya que el envío lo cotizas y lo pagas tú directo en la app 📱\n\nEn cuanto confirmes el pago, te lo mandamos al toque 🔥 ¿Te parece bien?`,
  },
  {
    titulo: 'Indrive — cliente pide precio de envío',
    subtitulo: 'Consulta costo Indrive',
    icon: <Car size={14} />,
    category: 'indrive',
    color: '251,191,36',
    respuesta: `El envío por Indrive lo cotizas tú mismo desde la app, ya que el precio varía según tu dirección 📍\n\nGeneralmente sale entre S/8 y S/20 dentro de Lima, muy accesible para recibir hoy mismo 🙌\n\nNosotros preparamos tu pedido al instante en cuanto confirmes el pago 💛 ¿Seguimos?`,
  },
  {
    titulo: 'Indrive — cliente duda del pago adelantado',
    subtitulo: 'Objeción pago previo',
    icon: <Car size={14} />,
    category: 'indrive',
    color: '251,191,36',
    respuesta: `¡Te entiendo totalmente! 😊 La razón es sencilla: el delivery por Indrive sale de inmediato y necesitamos confirmar el pedido antes de enviarlo 📦\n\nPuedes pagarnos por Yape, Plin o transferencia — es rápido y seguro 🔒\n\nYa tenemos miles de clientes que confían en nosotros y siempre reciben su pedido perfecto ✅ ¡No te vas a arrepentir!`,
  },
];

const CATEGORIAS: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'todas',    label: 'Todas',    icon: <MessageSquare size={12} /> },
  { id: 'precio',   label: 'Precio',   icon: <DollarSign size={12} /> },
  { id: 'producto', label: 'Producto', icon: <Palette size={12} /> },
  { id: 'envio',    label: 'Envío',    icon: <Truck size={12} /> },
  { id: 'marca',    label: 'Marca',    icon: <Award size={12} /> },
  { id: 'pago',     label: 'Pago',     icon: <CreditCard size={12} /> },
  { id: 'indrive',  label: 'Indrive',  icon: <Car size={12} /> },
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
