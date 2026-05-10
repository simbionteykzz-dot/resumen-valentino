import React, { useState, useMemo } from 'react';
import {
  Copy, Check, HelpCircle, Search,
  MessageCircle, Banknote, PackageSearch, ShoppingBag, MapPin, Clock,
  UserCheck, AlertCircle, Sparkles,
} from 'lucide-react';

type Category = 'todas' | 'inicio' | 'separacion' | 'seguimiento' | 'cierre';

interface Plantilla {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  category: Category;
  color: string;
  texto: string;
}

const PLANTILLAS: Plantilla[] = [
  // ── INICIO ──────────────────────────────────────────────────────────
  {
    titulo: 'Saludo y separación',
    descripcion: 'Bienvenida + color/talla + tipo de envío',
    icon: <MessageCircle size={14} />,
    category: 'inicio',
    color: '59,130,246',
    texto: `Hola 👋😊\n¿Qué colores 🎨 y tallas 📏 deseas? 👕✨\n¿Tu envío es para Lima 📍 o provincia 🚚?\n\nSi es Lima 🏠, separas con 14 soles 💵 y pagas el resto en casa 🚪✅\n\nSi es provincia 📦, separas con 30 o 40 soles 💰 y el saldo lo pagas en la agencia 🏢📍`,
  },
  {
    titulo: 'Saludo rápido',
    descripcion: 'Respuesta inicial breve',
    icon: <MessageCircle size={14} />,
    category: 'inicio',
    color: '59,130,246',
    texto: `¡Hola! Bienvenido/a 😊👋\nEstamos para ayudarte. ¿Qué modelo y color te interesa? 👕✨\nCuéntame y te armo tu pedido al toque 🔥`,
  },
  {
    titulo: 'Solicitar datos de envío',
    descripcion: 'Pide nombre, dirección y DNI',
    icon: <UserCheck size={14} />,
    category: 'inicio',
    color: '99,102,241',
    texto: `¡Perfecto! Para procesar tu pedido necesito estos datos 📋:\n\n👤 Nombre completo\n📱 Celular de contacto\n🏠 Dirección exacta (si es Lima) / Agencia Shalom más cercana (si es provincia)\n🪪 DNI\n📦 Confirma tu pedido: colores y tallas\n\n¡Con eso ya te lo preparo! 💪✅`,
  },
  {
    titulo: 'Pregunta disponibilidad',
    descripcion: 'Consulta de stock antes de confirmar',
    icon: <HelpCircle size={14} />,
    category: 'inicio',
    color: '20,184,166',
    texto: `¡Claro! Déjame verificar el stock disponible para ese color y talla 🔍\nDame un momento... ✨\n\n¿Tienes alguna segunda opción de color por si acaso? Así te confirmo más rápido 😊`,
  },

  // ── SEPARACIÓN ───────────────────────────────────────────────────────
  {
    titulo: 'Separación Lima',
    descripcion: '14 soles de adelanto, resto en casa',
    icon: <Banknote size={14} />,
    category: 'separacion',
    color: '34,197,94',
    texto: `🚚 Si eres de Lima: abonas 14 soles para separar tu pedido 🔒 y lo demás lo pagas cuando llegue a tu casa 🏡`,
  },
  {
    titulo: 'Separación Provincia',
    descripcion: '30-40 soles de adelanto, resto en agencia',
    icon: <Banknote size={14} />,
    category: 'separacion',
    color: '251,146,60',
    texto: `🏢 Si tu envío es a provincia: separas con 30 o 40 soles 🔒 y el resto lo pagas cuando tu pedido esté en la agencia 📦💰`,
  },
  {
    titulo: 'Instrucciones de pago Yape/Plin',
    descripcion: 'Cómo enviar el adelanto',
    icon: <Banknote size={14} />,
    category: 'separacion',
    color: '168,85,247',
    texto: `¡Genial! Para separar tu pedido yapéame o plíneme al número que te acabo de dar 💚\n\nUna vez realizado, mándame el comprobante por aquí 📸 y confirmo tu reserva al instante ✅\n\n¡Ya casi es tuyo! 🛍️🔥`,
  },
  {
    titulo: 'Pago completo',
    descripcion: 'Cuando el cliente paga todo por adelantado',
    icon: <Banknote size={14} />,
    category: 'separacion',
    color: '14,165,233',
    texto: `¡Muchas gracias por tu pago completo! 🙌💚\nTu pedido queda confirmado y lo preparamos de inmediato 📦✨\n\nMándame tu comprobante de pago por aquí para registrarlo 📸✅`,
  },

  // ── SEGUIMIENTO ──────────────────────────────────────────────────────
  {
    titulo: 'Pedido enviado',
    descripcion: 'Confirmación de despacho con código',
    icon: <PackageSearch size={14} />,
    category: 'seguimiento',
    color: '234,179,8',
    texto: `¡Tu pedido ya fue enviado! 🚀📦\nTu código de seguimiento es: [CÓDIGO]\n\nPuedes rastrearlo en la web o app de Shalom 🔍\nCualquier consulta, aquí estamos 😊✅`,
  },
  {
    titulo: 'Tiempo de entrega Lima',
    descripcion: '1-2 días hábiles',
    icon: <Clock size={14} />,
    category: 'seguimiento',
    color: '34,197,94',
    texto: `Tu pedido llegará en 1 a 2 días hábiles 🏠⏰\nTe avisamos cuando el repartidor esté en camino 📲\n\n¡Cualquier duda, aquí estamos! 😊`,
  },
  {
    titulo: 'Tiempo de entrega Provincia',
    descripcion: '3-5 días hábiles en agencia Shalom',
    icon: <MapPin size={14} />,
    category: 'seguimiento',
    color: '251,146,60',
    texto: `Tu pedido llegará en 3 a 5 días hábiles a tu agencia Shalom más cercana 📦🚚\n\nRecuerda llevar tu DNI cuando vayas a recogerlo 🪪✅\nTe mandamos el código de seguimiento en cuanto se despache 📲`,
  },
  {
    titulo: 'Consulta de seguimiento',
    descripcion: 'Respuesta cuando preguntan por su pedido',
    icon: <PackageSearch size={14} />,
    category: 'seguimiento',
    color: '99,102,241',
    texto: `¡Hola! Te comento el estado de tu pedido 📦🔍\n\nTu código de seguimiento es: [CÓDIGO]\nPuedes rastrearlo aquí: www.shalom.com.pe 🌐\n\nSi necesitas ayuda extra, escríbenos y lo verificamos juntos 😊✅`,
  },

  // ── CIERRE ───────────────────────────────────────────────────────────
  {
    titulo: 'Final de compra',
    descripcion: 'Confirmación de que el pedido está en proceso',
    icon: <ShoppingBag size={14} />,
    category: 'cierre',
    color: '239,68,68',
    texto: `Tu pedido ya está en proceso 📦✨. Cualquier duda, escríbenos por este medio y te ayudamos al momento.`,
  },
  {
    titulo: 'Urgencia / Stock limitado',
    descripcion: 'Impulsa la decisión de compra',
    icon: <AlertCircle size={14} />,
    category: 'cierre',
    color: '239,68,68',
    texto: `⚡ Esta promo es por tiempo muy limitado y el stock se está agotando rápido 🔥\n\n¡Muchos clientes están viendo los mismos modelos que tú ahora mismo!\n\n¿Te lo separo ya? Solo necesitas [MONTO] de adelanto y aseguras el tuyo 💪✅`,
  },
  {
    titulo: 'Color o talla agotada',
    descripcion: 'Cuando no hay stock del pedido exacto',
    icon: <AlertCircle size={14} />,
    category: 'cierre',
    color: '168,85,247',
    texto: `¡Hola! 😅 El color/talla exacto que pediste está agotado por el momento.\n\nPero tenemos estas alternativas disponibles: [OPCIONES] 👕\n\n¿Te animas con alguna de estas? ¡Igual queda genial! ✨`,
  },
  {
    titulo: 'Post-venta / Satisfacción',
    descripcion: 'Mensaje de seguimiento después de entrega',
    icon: <Sparkles size={14} />,
    category: 'cierre',
    color: '20,184,166',
    texto: `¡Hola! 😊 Solo queríamos saber cómo llegó tu pedido y si todo estuvo perfecto 📦✨\n\nSi tienes alguna consulta o necesitas algo más, aquí estamos para ayudarte 🙌\n\n¡Gracias por tu confianza! 💚`,
  },
];

const CATEGORIAS: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'todas',       label: 'Todas',       icon: <HelpCircle size={12} /> },
  { id: 'inicio',      label: 'Inicio',      icon: <MessageCircle size={12} /> },
  { id: 'separacion',  label: 'Separación',  icon: <Banknote size={12} /> },
  { id: 'seguimiento', label: 'Seguimiento', icon: <PackageSearch size={12} /> },
  { id: 'cierre',      label: 'Cierre',      icon: <ShoppingBag size={12} /> },
];

export default function DudasCompraPanel() {
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
                background: active ? 'var(--accent)' : 'var(--surface2)',
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
                {/* Cabecera */}
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

                {/* Texto */}
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
