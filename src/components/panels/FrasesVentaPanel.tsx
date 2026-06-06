import { useMemo, useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ShoppingBag, ArrowRight, Zap, MessageCircle } from 'lucide-react';
import { POL_VARIANTES_OVERSHARK } from '../../lib/data';

/* ── Saludos temporales de Sandro ── */
const SALUDOS_TEMPORALES = [
  { key: 'dia', label: 'Día', emoji: '☀️', saludo: 'Buenos días' },
  { key: 'tarde', label: 'Tarde', emoji: '🌤️', saludo: 'Buenas tardes' },
  { key: 'noche', label: 'Noche', emoji: '🌙', saludo: 'Buenas noches' },
] as const;

/* ── Mensajes rápidos exclusivos de Sandro ── */
const MENSAJES_RAPIDOS_SANDRO: { categoria: string; mensajes: string[] }[] = [
  {
    categoria: '👋 Saludo / Catálogo',
    mensajes: [
      'Buenas noches, coméntame cómo puedo ayudarte.',
      'Hola, qué tal? 😊 Hoy estamos cerrando pedidos y aún estás a tiempo. Si quieres asegurar tu promoción, pásame tus datos y lo dejamos listo.',
    ],
  },
  {
    categoria: '📦 Stock / Producto',
    mensajes: [
      'si contamos con el stock de su pedido✨',
      'Si llegamos a la dirección ✨🚀',
      'algodón 90%, gramaje 30/1, tipo de corte regular fit',
      'algodón 85%, gramaje 24/1, tipo de corte slim fit',
      'Claro que sí, estimado(a). Las tallas y colores están sujetos a disponibilidad del cliente.',
      'No trabajamos con oversize por el momento.',
      'No encoge y no decolora.',
      'Solo trabajamos hasta la XL.',
      'Trabajamos con tallas completas.',
      'El dia de hoy no laboramos por feriado, esperamos su comprension. 😊',
      'Claro que sí, envíos al nivel nacional.✈️🚢🚌',
      'Recordemos que el rango de entrega es de 10:30am a 8pm.🕐',
    ],
  },
  {
    categoria: '💰 Precios / Pago',
    mensajes: [
      'La suma total sería S/113 (S/99 del producto + S/14 de delivery).',
      'Para generar el pedido, debe abonar S/14 del delivery y al momento de la entrega pagar los S/99 restantes.',
      'La suma seria 99+12 del envió por nuestro courier Zazu = s/111',
      'Puede separar como mínimo su pedido con 30 soles y al momento de llegar a la agencia a nuestro courier Zazu cancelaria la diferencia para que se le brinde su clave de 4 dígitos.',
      'Muy bien, quedo atento a la captura del yape 😊',
    ],
  },
  {
    categoria: '🚚 Entrega / Delivery',
    mensajes: [
      'El pedido se genera hoy y estaría saliendo a ruta mañana.',
      'El Courier se comunicará con usted para coordinar el horario de entrega.',
      'En este caso llegaría LUNES por que DOMINGOS Y FERIADOS no realizamos delivery.',
      'El pedido llegara entre 24 a 72 horas como máximo.',
    ],
  },
  {
    categoria: '🏪 Recojo en Almacén',
    mensajes: [
      'No contamos con tienda física por el momento, solo con almacén en SJL Mangomarca, donde puede realizar el recojo de su pedido si lo desea.',
    ],
  },
  {
    categoria: '🎧 Soporte al Cliente',
    mensajes: [
      'Buenas tardes, por favor comunicarse al número 901 127 839 para recibir soporte en su compra.',
      'Su caso ha sido elevado; se comunicarán con usted en unos minutos.',
    ],
  },
];

/* ── Frases por modelo ── */
const FRASES_POR_PRODUCTO: Record<string, string[]> = {
  "BABY TY": [
    "👕 El Baby Ty es la prenda que toda chica necesita: suave, ceñida y con un corte que estiliza al instante.",
    "💅 Perfecto para salir, para el gym o para el día a día — el Baby Ty se adapta a todo tu estilo.",
    "🔥 Es tendencia en TikTok y se agota rápido. ¡No te quedes sin el tuyo!",
    "✨ Tela premium que no se deforma con las lavadas. ¡Calidad Overshark garantizada!",
    "🌟 Combínalo con jeans, faldas o shorts — siempre vas a lucir increíble.",
  ],
  "BABY TY MANGA": [
    "👕 El Baby Ty Manga Larga es el complemento ideal para días frescos sin perder el estilo.",
    "💅 Manga larga ceñida con ese fit perfecto que estiliza tu silueta.",
    "🔥 La versión manga larga del polo más vendido — ¡ahora para todas las estaciones!",
    "✨ Tela suave y elástica que se ajusta perfecto al cuerpo.",
    "🌟 Ideal para combinar con chaquetas o usarlo solo — siempre se ve genial.",
  ],
  "CAMISA WAFFLE": [
    "👔 La Camisa Waffle le da ese toque elegante pero relajado que todos quieren.",
    "🔥 Textura waffle premium — se siente diferente, se ve diferente, ¡ES diferente!",
    "✨ Perfecta para una reunión, una salida o para el trabajo. Versatilidad total.",
    "💎 La textura waffle le da un look premium que no encontrarás en otra marca.",
    "🌟 Cierre de botones con caída impecable. ¡Tu outfit va a subir de nivel!",
  ],
  "CAMISERO PIKE": [
    "👔 El Camisero Piqué tiene esa textura clásica que grita calidad.",
    "🔥 Tela piqué duradera y con cuerpo — se mantiene como nuevo lavada tras lavada.",
    "✨ El polo tipo polo por excelencia, pero con el sello Overshark.",
    "💎 Ideal para el trabajo o para salir. Siempre te va a sacar de apuros.",
    "🌟 Combínalo con chinos o jeans — nunca falla.",
  ],
  "CLASICO": [
    "👕 El Clásico de Overshark es nuestro bestseller por algo — simple, limpio, PERFECTO.",
    "🔥 Es el polo que no puede faltar en tu closet. ¡Se ve bien con TODO!",
    "✨ Corte recto, tela premium y colores que no se destiñen. Calidad real.",
    "💎 10 Clásicos por S/99 es la mejor inversión que puedes hacer en ropa.",
    "🌟 Simple pero poderoso. El polo que siempre vas a querer ponerte.",
  ],
  "CUELLO CHINO": [
    "👔 El Cuello Chino le da un aire sofisticado a cualquier outfit.",
    "🔥 Es el polo que te hace ver arreglado sin haberte esforzado.",
    "✨ Cuello mao moderno con tela de primera. ¡Se siente premium!",
    "💎 Perfecto para cenas, reuniones o cuando quieres impresionar.",
    "🌟 Un diseño que pocos tienen y que todos van a querer copiar.",
  ],
  "CUELLO CHINO WAFFLE": [
    "👔 Cuello Chino + textura Waffle = la combinación más elegante de nuestra colección.",
    "🔥 Dos tendencias en una sola prenda. ¡Esto es otro nivel!",
    "✨ La textura waffle le da ese toque único que lo diferencia de todo.",
    "💎 Para los que buscan algo diferente y con personalidad.",
    "🌟 Se ve increíble tanto formal como casual. ¡Versatilidad pura!",
  ],
  "JERSEY MANGA LARGA": [
    "👕 El Jersey Manga Larga es tu mejor amigo para los días frescos.",
    "🔥 Tela jersey premium que te mantiene abrigado sin sentirte pesado.",
    "✨ Perfecto para la oficina, para salir o para un viaje. ¡Imprescindible!",
    "💎 El corte manga larga que se ve elegante y se siente cómodo.",
    "🌟 7 por S/99 — stockéate para todo el invierno. ¡No vas a encontrar mejor precio!",
  ],
  "OVERSIZE": [
    "👕 El Oversize es tendencia TOTAL. Comodidad y estilo en una sola prenda.",
    "🔥 Corte holgado que se ve increíble. ¡El polo que todos quieren!",
    "✨ Perfecto con joggers, jeans o shorts. Siempre te vas a ver bien.",
    "💎 La tela es gruesa y de calidad — nada que ver con los oversize baratos.",
    "🌟 Si te gusta el streetwear, NECESITAS este polo en tu vida.",
  ],
  "WAFFLE": [
    "👕 La textura Waffle es adictiva — una vez que la tocas, no quieres otra cosa.",
    "🔥 6 Waffles por S/99. ¡La promoción más loca para el polo más suave!",
    "✨ Se siente premium, se ve premium. ¡Porque ES premium!",
    "💎 La textura le da un look diferente a todos los demás polos del mercado.",
    "🌟 Combínalo con lo que sea — el waffle siempre destaca.",
  ],
  "WAFFLE CAMISERO": [
    "👔 Waffle + cuello camisero = la prenda más elegante de la temporada.",
    "🔥 4 por S/99 — textura premium con look de camisa. ¡Ofertón!",
    "✨ Se ve como camisa pero se siente como polo. Lo mejor de ambos mundos.",
    "💎 Perfecto para reuniones de trabajo o una cita. ¡Vas a impresionar!",
    "🌟 La textura waffle le da ese toque que nadie más tiene.",
  ],
  "WAFFLE MANGA LARGA": [
    "👕 Waffle Manga Larga — la textura que amas, ahora para todo el año.",
    "🔥 4 por S/99. ¡Stockéate de manga larga con textura waffle!",
    "✨ Ideal para los días frescos sin sacrificar estilo.",
    "💎 La combinación perfecta de comodidad y elegancia.",
    "🌟 Se ve increíble arremangado o con las mangas completas.",
  ],
  "CUELLO NOTCH PIQUE": [
    "👔 El Cuello Notch Piqué tiene ese detalle en V que lo hace único.",
    "🔥 5 por S/99 — el polo más elegante al mejor precio.",
    "✨ El cuello notch le da un aire moderno y sofisticado.",
    "💎 Tela piqué de calidad con un diseño que marca la diferencia.",
    "🌟 Para los que quieren verse diferentes sin ser extravagantes.",
  ],
  "CUELLO NOTCH WAFLE": [
    "👔 Cuello Notch + Waffle = diseño único que no vas a encontrar en otro lado.",
    "🔥 4 por S/99. ¡La textura waffle con el cuello más moderno!",
    "✨ Dos tendencias fusionadas en una prenda espectacular.",
    "💎 Se ve increíble tanto casual como semi-formal.",
    "🌟 El polo que va a hacer que todos te pregunten dónde lo compraste.",
  ],
};

const RECOMENDACIONES: Record<string, { modelo: string; motivo: string }[]> = {
  "BABY TY":              [{ modelo: "BABY TY MANGA", motivo: "La versión manga larga para días frescos" }, { modelo: "OVERSIZE", motivo: "Contraste perfecto: ceñido + holgado" }, { modelo: "WAFFLE", motivo: "Textura premium para variar tu look" }],
  "BABY TY MANGA":        [{ modelo: "BABY TY", motivo: "Completa tu colección con la manga corta" }, { modelo: "JERSEY MANGA LARGA", motivo: "Otra opción manga larga con fit diferente" }, { modelo: "CAMISA WAFFLE", motivo: "Sube de nivel con textura waffle" }],
  "CAMISA WAFFLE":        [{ modelo: "WAFFLE CAMISERO", motivo: "Mismo estilo pero con cuello camisero" }, { modelo: "CUELLO CHINO WAFFLE", motivo: "Textura waffle con cuello chino elegante" }, { modelo: "CAMISERO PIKE", motivo: "Más opciones de camisero en otra tela" }],
  "CAMISERO PIKE":        [{ modelo: "CUELLO NOTCH PIQUE", motivo: "Misma tela piqué, cuello moderno" }, { modelo: "WAFFLE CAMISERO", motivo: "Camisero en textura waffle" }, { modelo: "CAMISA WAFFLE", motivo: "Camisa con textura premium" }],
  "CLASICO":              [{ modelo: "OVERSIZE", motivo: "Misma sencillez pero con corte holgado" }, { modelo: "WAFFLE", motivo: "Dale textura a tu colección" }, { modelo: "CUELLO CHINO", motivo: "Sube de nivel con cuello chino" }],
  "CUELLO CHINO":         [{ modelo: "CUELLO CHINO WAFFLE", motivo: "Mismo cuello pero con textura waffle" }, { modelo: "CUELLO NOTCH PIQUE", motivo: "Cuello moderno en tela piqué" }],
  "CUELLO CHINO WAFFLE":  [{ modelo: "CUELLO CHINO", motivo: "Versión clásica sin textura" }, { modelo: "WAFFLE CAMISERO", motivo: "Textura waffle con estilo camisero" }, { modelo: "CAMISA WAFFLE", motivo: "Completa tu colección waffle" }],
  "JERSEY MANGA LARGA":   [{ modelo: "WAFFLE MANGA LARGA", motivo: "Manga larga con textura waffle" }, { modelo: "CLASICO", motivo: "El básico perfecto para días cálidos" }],
  "OVERSIZE":             [{ modelo: "CLASICO", motivo: "El básico que complementa tu oversize" }, { modelo: "WAFFLE", motivo: "Textura única con corte regular" }, { modelo: "BABY TY", motivo: "Contraste: holgado + ceñido" }],
  "WAFFLE":               [{ modelo: "WAFFLE CAMISERO", motivo: "Misma textura con cuello camisero" }, { modelo: "WAFFLE MANGA LARGA", motivo: "Versión manga larga para el frío" }, { modelo: "CUELLO CHINO WAFFLE", motivo: "Textura waffle + elegancia" }],
  "WAFFLE CAMISERO":      [{ modelo: "WAFFLE", motivo: "La versión casual de manga corta" }, { modelo: "CAMISA WAFFLE", motivo: "Completa tu look waffle con camisa" }, { modelo: "CAMISERO PIKE", motivo: "Camisero en otra textura" }],
  "WAFFLE MANGA LARGA":   [{ modelo: "WAFFLE", motivo: "La versión manga corta para verano" }, { modelo: "JERSEY MANGA LARGA", motivo: "Otra manga larga en tela jersey" }, { modelo: "WAFFLE CAMISERO", motivo: "Waffle con look más formal" }],
  "CUELLO NOTCH PIQUE":   [{ modelo: "CUELLO NOTCH WAFLE", motivo: "Mismo cuello notch en textura waffle" }, { modelo: "CAMISERO PIKE", motivo: "Misma tela piqué, cuello clásico" }, { modelo: "CUELLO CHINO", motivo: "Otro cuello elegante para tu colección" }],
  "CUELLO NOTCH WAFLE":   [{ modelo: "CUELLO NOTCH PIQUE", motivo: "Mismo cuello notch en tela piqué" }, { modelo: "WAFFLE", motivo: "Textura waffle con cuello clásico" }, { modelo: "CUELLO CHINO WAFFLE", motivo: "Waffle con cuello chino" }],
};

const FRASES_GENERICAS = [
  "🔥 ¡Aprovecha las promociones exclusivas de Overshark! No duran para siempre.",
  "✨ Calidad premium a precio de fábrica. Solo con Overshark.",
  "💎 Cada polo está hecho con la mejor tela para que dure y se sienta increíble.",
  "🌟 Miles de clientes satisfechos nos respaldan. ¡Únete a la familia Overshark!",
  "👕 Ropa que se siente tan bien como se ve. ¡Eso es Overshark!",
  "🚀 Envíos a todo el Perú. ¡Tu pedido llega donde estés!",
  "💯 Cadenita de regalo con cada compra. ¡Un detalle extra para ti!",
];

function normalizeProductName(name: string): string | null {
  const tl = name.trim().toLowerCase();
  return Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl) || null;
}

export default function FrasesVentaPanel({ products, vendedorName }: { products: any[]; vendedorName?: string }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedMsgKey, setCopiedMsgKey] = useState<string | null>(null);
  const [copiedSaludo, setCopiedSaludo] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isSandro = vendedorName?.toUpperCase() === 'SANDRO';

  const handleCopyMsg = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgKey(key);
      setTimeout(() => setCopiedMsgKey(null), 1500);
    }).catch(() => {});
  };

  const handleCopySaludo = (s: typeof SALUDOS_TEMPORALES[number]) => {
    const templates: Record<string, string> = {
      dia:   `¡${s.saludo}! 😊 Soy Sandro de Overshark. Te acabo de compartir nuestro catálogo — dime qué modelos te llamaron la atención, tus tallas y colores, y si nos escribes desde Lima o provincia para ayudarte con tu pedido.`,
      tarde: `¡${s.saludo}! 😊 Soy Sandro de Overshark. Te acabo de enviar el catálogo. Cuéntame qué modelos te gustaron, tus tallas y colores, y si estás en Lima o provincia para coordinar tu entrega.`,
      noche: `¡${s.saludo}! 😊 Soy Sandro de Overshark. Te acabo de compartir nuestro catálogo — todavía estamos recibiendo pedidos. Indícame tus tallas y colores, y si estás en Lima o provincia, para dejarlo separado esta noche.`,
    };
    const text = templates[s.key];
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSaludo(s.key);
      setTimeout(() => setCopiedSaludo(null), 1500);
    }).catch(() => {});
  };

  const modelosEnPedido = useMemo(() => {
    const seen = new Set<string>();
    products.forEach(p => {
      const norm = normalizeProductName(p.name);
      if (norm) seen.add(norm);
    });
    return Array.from(seen);
  }, [products]);

  const frasesActuales = useMemo(() => {
    if (modelosEnPedido.length === 0) return [];
    const pool: string[] = [];
    modelosEnPedido.forEach(m => {
      const frases = FRASES_POR_PRODUCTO[m];
      if (frases) {
        const shuffled = [...frases].sort(() => Math.random() - 0.5);
        pool.push(...shuffled.slice(0, 2));
      }
    });
    const genericShuffled = [...FRASES_GENERICAS].sort(() => Math.random() - 0.5);
    pool.push(genericShuffled[0]);
    return pool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelosEnPedido, refreshKey]);

  const recomendaciones = useMemo(() => {
    if (modelosEnPedido.length === 0) return [];
    const recs: { modelo: string; motivo: string; desde: string }[] = [];
    const yaEnPedido = new Set(modelosEnPedido);
    const yaRecomendado = new Set<string>();
    modelosEnPedido.forEach(m => {
      const opciones = RECOMENDACIONES[m];
      if (opciones) {
        opciones.forEach(op => {
          if (!yaEnPedido.has(op.modelo) && !yaRecomendado.has(op.modelo)) {
            recs.push({ ...op, desde: m });
            yaRecomendado.add(op.modelo);
          }
        });
      }
    });
    return recs.slice(0, 5);
  }, [modelosEnPedido]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  if (products.length === 0 && !isSandro) return null;

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Sparkles size={20} /> Frases de Venta & Recomendaciones
        </h2>
        {products.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={14} /> Nuevas frases
          </button>
        )}
      </div>

      {products.length > 0 && (<>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={13} /> Frases para convencer al cliente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {frasesActuales.map((frase, i) => (
              <div key={`${refreshKey}-${i}`} className="frase-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(224, 85, 0, 0.03))', border: '1px solid rgba(255, 107, 0, 0.12)', borderRadius: '10px', transition: 'all 0.2s ease', animation: 'fadeUp 0.3s ease', animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>{frase}</span>
                <button onClick={() => handleCopy(frase, i)} style={{ flexShrink: 0, width: '2rem', height: '2rem', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '8px', background: 'transparent', color: copiedIdx === i ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} title="Copiar frase">
                  {copiedIdx === i ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>
        </div>

      {recomendaciones.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingBag size={13} /> Recomiéndale también
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.6rem' }}>
            {recomendaciones.map((rec, i) => (
              <div key={rec.modelo} className="rec-card" style={{ padding: '1rem 1.15rem', background: 'linear-gradient(135deg, rgba(56, 200, 245, 0.06), rgba(56, 200, 245, 0.02))', border: '1.5px solid rgba(56, 200, 245, 0.15)', borderRadius: '12px', transition: 'all 0.25s ease', cursor: 'default', animation: 'fadeUp 0.3s ease', animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--info)' }}>{rec.modelo}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '6px', padding: '0.1rem 0.4rem' }}>
                    S/ {POL_VARIANTES_OVERSHARK[rec.modelo] ? '45' : '—'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <ArrowRight size={12} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'rgba(56, 200, 245, 0.5)' }} />
                  {rec.motivo}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.35rem', fontStyle: 'italic' }}>Porque lleva {rec.desde}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>)}

      {isSandro && (
        <div style={{ marginTop: products.length > 0 ? '1.75rem' : 0, borderTop: products.length > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingTop: products.length > 0 ? '1.5rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <MessageCircle size={16} style={{ color: 'var(--info)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>Frases Sandro</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {MENSAJES_RAPIDOS_SANDRO.map((grupo) => {
              const esSaludo = grupo.categoria === '👋 Saludo / Catálogo';
              return (
                <div key={grupo.categoria}>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: 800, color: 'var(--info)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: '0.6rem', opacity: 0.8,
                  }}>
                    {grupo.categoria}
                  </div>

                  {esSaludo && (
                    <div style={{ marginBottom: '0.6rem', padding: '0.9rem 1rem', background: 'rgba(56,200,245,0.05)', border: '1px solid rgba(56,200,245,0.15)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {SALUDOS_TEMPORALES.map(s => {
                          const copied = copiedSaludo === s.key;
                          return (
                            <button
                              key={s.key}
                              onClick={() => handleCopySaludo(s)}
                              style={{
                                flex: 1, padding: '0.55rem 0.4rem',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                                background: copied ? 'rgba(56,200,245,0.15)' : 'rgba(56,200,245,0.06)',
                                border: `1px solid ${copied ? 'rgba(56,200,245,0.45)' : 'rgba(56,200,245,0.15)'}`,
                                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease',
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>{s.emoji}</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: copied ? 'var(--info)' : 'var(--text2)' }}>
                                {copied ? '¡Copiado!' : s.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: grupo.mensajes.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '0.5rem',
                  }}>
                    {grupo.mensajes.map((msg, mi) => {
                      const key = `${grupo.categoria}-${mi}`;
                      const copied = copiedMsgKey === key;
                      return (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: 'rgba(56, 200, 245, 0.04)',
                          border: `1px solid ${copied ? 'rgba(56,200,245,0.4)' : 'rgba(56, 200, 245, 0.1)'}`,
                          borderRadius: '10px', transition: 'border-color 0.2s ease',
                        }}>
                          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{msg}</span>
                          <button
                            onClick={() => handleCopyMsg(msg, key)}
                            style={{
                              flexShrink: 0, width: '2rem', height: '2rem',
                              border: '1px solid rgba(56, 200, 245, 0.2)', borderRadius: '8px',
                              background: copied ? 'rgba(56,200,245,0.12)' : 'transparent',
                              color: copied ? 'var(--info)' : 'var(--muted)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="Copiar mensaje"
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
