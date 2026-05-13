import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, MessageSquare, LogOut, RotateCcw, ChevronRight, RefreshCw, Printer, Phone, CreditCard, ShoppingBag, Tag, Table2, Truck, User, Calendar, Wrench, MapPin, BarChart2, Clock, Percent, Trash2, Pencil, Check } from 'lucide-react';
import oversharkLogo from '../../icon-marca/OverShark.jpeg';
import bravosLogo from '../../icon-marca/Bravos.png';
import overgirlLogo from '../../icon-marca/OverGirl.png';
import {
  searchCustomers, getCustomerVentas, getATCTickets,
  createATCTicket, updateATCTicket, deleteATCTicket,
  searchSheetsCustomers, getCustomerSheetsVentas,
  getATCDescuentos, createATCDescuento, deleteATCDescuento, updateATCDescuento,
} from '../../lib/supabase';
import type { ATCTicket, CustomerBasic, VentaDB, SheetsVentaDB, ATCDescuento } from '../../lib/supabase';
import { syncSheetsData } from '../../lib/sheetsSync';
import { searchZazuEnvios } from '../../lib/zazuSupabase';
import type { ZazuEnvio } from '../../lib/zazuSupabase';

interface ATCPanelProps {
  userId?: string;
  userName: string;
  isAdmin?: boolean;
  onBack?: () => void;
  onSignOut: () => void;
}

const MOTIVOS = [
  'Clave', 'Despacho', 'Fallo de prendas', 'Cambios voluntarios', 'Devolucion',
  'Fidelizacion', 'NTV mal registrada', 'Sin etiqueta', 'Transito',
  'Informacion provincia', 'Mal resumen', 'Informacion agencia externa',
  'Sin NV', 'Shalom', 'Envio erroneo', 'Respuesta', 'Sin stock',
  'Sede', 'Informacion lima', 'Error de vendedor',
];

const EMPRESAS = ['OVERSHARK', 'BRAVOS', 'OVERGIRLS'];

const RESPONSABLES = ['VENDEDOR', 'SUBIDOR', 'ZAZU', 'TALLER', 'CLIENTE', 'SHALOM', 'SITEMA', 'DESPACHO'];

type RespGroup = { group: string; items: string[] };
const RESPONSABLES_DESCUENTOS: RespGroup[] = [
  { group: 'Subidores', items: ['GRACE', 'ALEXEI', 'SEBASTIAN', 'STEVEN'] },
  { group: 'Vendedores', items: [
    'Alid', 'Aldair', 'Cristina', 'Gregorio', 'Jean Pool', 'Josema', 'Michael', 'Reyna',
    'Tatiana', 'Angie', 'Valery', 'Giovanny', 'Kenyu', 'Tracy', 'Franco',
    'Paul', 'Diego', 'Miguel', 'Alessandra', 'Eros', 'Nicolle', 'Leonardo', 'Dana',
    'Elida', 'Estrella', 'Gabriel', 'Kiara', 'Alex', 'Abigail', 'Angel', 'Orlando',
    'Andrea', 'Yanira', 'Anahí', 'Xiomara', 'Valentina', 'Camila', 'Alejandra',
  ] },
  { group: 'POST - FREDY', items: ['Angela', 'Genesis', 'Rosa', 'Daniel', 'Gustavo', 'Sandro', 'Eder'] },
  { group: 'POST - STEVEN', items: ['Valentino', 'Gonzalo'] },
  { group: 'Otros', items: ['ZAZU', 'TALLER', 'CLIENTE', 'SHALOM', 'SITEMA', 'DESPACHO'] },
];

const ESTADOS_PEDIDO = ['ENTREGADO', 'PENDIENTE', 'NO ENTREGADO', 'DEVOLUCIÓN', 'RETORNADO', 'EN RETORNO'];

const TIPOS_TICKET = ['Información', 'Problema', 'Reclamo', 'Consulta', 'Devolución', 'Cambio', 'Seguimiento', 'Cobranza', 'Error de envío', 'Otro'];

const LIMA_DISTRITOS = [
  'Ate', 'Barranco', 'Breña', 'Callao', 'Carabayllo', 'Chorrillos', 'Comas',
  'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria',
  'Lince', 'Los Olivos', 'Lurigancho-Chosica', 'Lurín', 'Magdalena del Mar',
  'Miraflores', 'Pachacámac', 'Puente Piedra', 'Pueblo Libre', 'Rímac',
  'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
  'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santiago de Surco',
  'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
];

const PROVINCIAS_DEPTO = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima Región', 'Loreto', 'Madre de Dios', 'Moquegua',
  'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];
const PRIORIDADES: ATCTicket['prioridad'][] = ['baja', 'normal', 'alta', 'urgente'];
const ESTADOS: ATCTicket['estado'][] = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];

const PRIORIDAD_COLOR: Record<string, string> = {
  baja: '#38c8f5', normal: '#45834D', alta: '#f59e0b', urgente: '#ef4444',
};
const ESTADO_COLOR: Record<string, string> = {
  abierto: '#ef4444', en_proceso: '#f59e0b', resuelto: '#45834D', cerrado: '#94a3b8',
};
const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto', en_proceso: 'En proceso', resuelto: 'Resuelto', cerrado: 'Cerrado',
};
const ESTADO_PEDIDO_COLOR: Record<string, string> = {
  'ENTREGADO': '#45834D', 'PENDIENTE': '#f59e0b', 'NO ENTREGADO': '#ef4444',
  'DEVOLUCIÓN': '#8b5cf6', 'RETORNADO': '#64748b', 'EN RETORNO': '#38c8f5',
};

const S = {
  bg: 'linear-gradient(135deg,#EAF5EE 0%,#DDEEE3 100%)',
  surface: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(104,168,119,.35)',
  accent: '#1a7fbd',
  accentLight: 'rgba(26,127,189,0.1)',
  muted: '#3d6070',
  text: '#1a2e38',
  text2: '#0d1f28',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.42rem 0.65rem', border: '1px solid rgba(26,127,189,.25)',
  borderRadius: '7px', fontSize: '0.82rem', color: S.text2, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 800, color: S.muted,
  textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem',
};

type TicketFormState = {
  asunto: string;
  descripcion: string;
  prioridad: ATCTicket['prioridad'];
  venta_id: string;
  notas: string;
  ntv: string;
  fecha_atencion: string;
  region: string;
  region_scope: 'LIMA' | 'PROVINCIA' | '';
  responsable: string;
  solicitud: string;
  solucion: string;
  estado_pedido: string;
  empresa: string;
  tipo: string;
};

const emptyForm = (): TicketFormState => ({
  asunto: MOTIVOS[0], descripcion: '', prioridad: 'normal', venta_id: '', notas: '',
  ntv: '', fecha_atencion: new Date().toISOString().slice(0, 10), region: '', region_scope: '', responsable: '',
  solicitud: '', solucion: '', estado_pedido: '', empresa: '', tipo: '',
});

export default function ATCPanel({ userId, userName, isAdmin, onBack, onSignOut }: ATCPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerBasic[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBasic | null>(null);
  const [customerVentas, setCustomerVentas] = useState<(VentaDB & { anulado?: boolean })[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [customerTab, setCustomerTab] = useState<'historial' | 'tickets' | 'sheets' | 'zazu'>('historial');

  const [allTickets, setAllTickets] = useState<ATCTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketEstadoFilter, setTicketEstadoFilter] = useState<ATCTicket['estado'] | 'todos'>('todos');

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketFormState>(emptyForm());
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showDescuentos, setShowDescuentos] = useState(false);
  const [activeSection, setActiveSection] = useState<'tickets' | 'descuentos'>('tickets');

  const [sheetsVentas, setSheetsVentas] = useState<SheetsVentaDB[]>([]);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const [zazuEnvios, setZazuEnvios] = useState<ZazuEnvio[]>([]);
  const [loadingZazu, setLoadingZazu] = useState(false);

  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ id: string; value: string } | null>(null);
  const [editingSolucion, setEditingSolucion] = useState<{ id: string; value: string } | null>(null);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    const data = await getATCTickets();
    setAllTickets(data);
    setLoadingTickets(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const [ventasRes, sheetsRes] = await Promise.all([
        searchCustomers(searchQuery),
        searchSheetsCustomers(searchQuery),
      ]);
      const seen = new Set(ventasRes.map(c => c.cel));
      const merged = [...ventasRes, ...sheetsRes.filter(c => !seen.has(c.cel))];
      setSearchResults(merged);
      setSearching(false);
    }, 320);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const selectCustomer = async (c: CustomerBasic) => {
    setSelectedCustomer(c);
    setCustomerTab('historial');
    setZazuEnvios([]);
    setLoadingVentas(true);
    setLoadingZazu(true);
    const [ventas, sheets] = await Promise.all([
      getCustomerVentas(c.cel),
      getCustomerSheetsVentas(c.cel),
    ]);
    setCustomerVentas(ventas);
    setSheetsVentas(sheets);
    setLoadingVentas(false);
    // ZAZU: busca por DNI si existe, si no por nombre
    const zazuQuery = c.dni || c.nom;
    searchZazuEnvios(zazuQuery).then(res => {
      setZazuEnvios(res);
      setLoadingZazu(false);
    });
  };

  const handleSyncSheets = async () => {
    setSyncingSheets(true);
    setSyncMsg(null);
    const result = await syncSheetsData();
    setSyncingSheets(false);
    setSyncMsg(result.ok ? `✓ ${result.count} registros sincronizados` : `Error: ${result.error}`);
    setTimeout(() => setSyncMsg(null), 4000);
  };

  const submitTicket = async () => {
    if (!selectedCustomer) return;
    setSavingTicket(true);
    setTicketError(null);
    try {
      const str = (v: string) => v.trim() || undefined;
      const ticket = await createATCTicket({
        cliente_cel: selectedCustomer.cel,
        cliente_nom: selectedCustomer.nom,
        asunto: ticketForm.asunto,
        descripcion: ticketForm.descripcion,
        prioridad: ticketForm.prioridad,
        estado: 'abierto',
        venta_id: str(ticketForm.venta_id),
        notas: str(ticketForm.notas),
        ntv: str(ticketForm.ntv),
        fecha_atencion: str(ticketForm.fecha_atencion),
        region: str(ticketForm.region),
        responsable: str(ticketForm.responsable),
        solicitud: str(ticketForm.solicitud),
        solucion: str(ticketForm.solucion),
        estado_pedido: str(ticketForm.estado_pedido),
        empresa: str(ticketForm.empresa),
        tipo: str(ticketForm.tipo),
      }, userId);
      if (ticket) {
        setAllTickets(prev => [ticket, ...prev]);
        setShowTicketForm(false);
        setTicketForm(emptyForm());
        setCustomerTab('tickets');
      } else {
        setTicketError('No se pudo crear el ticket. Verifica la consola o contacta al administrador.');
      }
    } catch (e: any) {
      setTicketError(e?.message ?? 'Error inesperado al crear el ticket.');
    } finally {
      setSavingTicket(false);
    }
  };

  const changeEstado = async (id: string, estado: ATCTicket['estado']) => {
    const ok = await updateATCTicket(id, { estado });
    if (ok) setAllTickets(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
  };

  const changeEstadoPedido = async (id: string, estado_pedido: string) => {
    const ok = await updateATCTicket(id, { estado_pedido });
    if (ok) setAllTickets(prev => prev.map(t => t.id === id ? { ...t, estado_pedido } : t));
  };

  const saveNote = async (id: string, notas: string) => {
    const ok = await updateATCTicket(id, { notas });
    if (ok) { setAllTickets(prev => prev.map(t => t.id === id ? { ...t, notas } : t)); setEditingNote(null); }
  };

  const saveSolucion = async (id: string, solucion: string) => {
    const ok = await updateATCTicket(id, { solucion });
    if (ok) { setAllTickets(prev => prev.map(t => t.id === id ? { ...t, solucion } : t)); setEditingSolucion(null); }
  };

  const removeTicket = async (id: string) => {
    const ok = await deleteATCTicket(id);
    if (ok) setAllTickets(prev => prev.filter(t => t.id !== id));
  };

  const customerTickets = allTickets.filter(t => t.cliente_cel === selectedCustomer?.cel);
  const filteredTickets = ticketEstadoFilter === 'todos' ? allTickets : allTickets.filter(t => t.estado === ticketEstadoFilter);

  const openCount = allTickets.filter(t => t.estado === 'abierto').length;
  const inProcessCount = allTickets.filter(t => t.estado === 'en_proceso').length;
  const resolvedToday = allTickets.filter(t => {
    if (t.estado !== 'resuelto') return false;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return (t.updated_at ?? '').startsWith(today);
  }).length;

  const fmtDate = (s?: string) => s ? s.slice(0, 10) : '—';
  const totalSpent = customerVentas.filter(v => !v.anulado).reduce((a, v) => a + (Number(v.total_total) || 0), 0);

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'League Spartan,Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.98),rgba(235,245,255,0.95))', borderBottom: '1px solid rgba(26,127,189,.25)', padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(26,127,189,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a7fbd,#155f8f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,127,189,.3)' }}>
            <MessageSquare size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: S.text2, letterSpacing: '-0.02em' }}>
              LIVEX <span style={{ color: S.accent }}>ATC</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: S.muted }}>{userName}</div>
          </div>
        </div>
        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(26,127,189,.07)', borderRadius: '11px', padding: '0.22rem' }}>
          <button onClick={() => setActiveSection('tickets')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all .15s', background: activeSection === 'tickets' ? 'linear-gradient(135deg,#1a7fbd,#155f8f)' : 'transparent', color: activeSection === 'tickets' ? '#fff' : S.muted, boxShadow: activeSection === 'tickets' ? '0 2px 8px rgba(26,127,189,.3)' : 'none' }}>
            <Tag size={14} /> ATC Tickets
            <span style={{ fontSize: '0.62rem', fontWeight: 900, background: activeSection === 'tickets' ? 'rgba(255,255,255,.25)' : 'rgba(26,127,189,.15)', color: activeSection === 'tickets' ? '#fff' : '#1a7fbd', borderRadius: '4px', padding: '0.05rem 0.38rem' }}>{allTickets.length}</span>
          </button>
          <button onClick={() => setActiveSection('descuentos')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all .15s', background: activeSection === 'descuentos' ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'transparent', color: activeSection === 'descuentos' ? '#fff' : S.muted, boxShadow: activeSection === 'descuentos' ? '0 2px 8px rgba(139,92,246,.3)' : 'none' }}>
            <Percent size={14} /> Descuentos
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { label: 'Abiertos', val: openCount, color: '#ef4444' },
              { label: 'En proceso', val: inProcessCount, color: '#f59e0b' },
              { label: 'Resueltos hoy', val: resolvedToday, color: '#45834D' },
            ].map(k => (
              <div key={k.label} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: '8px', padding: '0.3rem 0.65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: k.color, opacity: 0.8 }}>{k.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowMetrics(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(26,127,189,.25)', background: 'rgba(26,127,189,.08)', color: '#1a7fbd' }}>
            <BarChart2 size={13} /> Métricas
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={handleSyncSheets} disabled={syncingSheets}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: syncingSheets ? 'default' : 'pointer', border: '1px solid rgba(69,131,77,.25)', background: 'rgba(69,131,77,.08)', color: '#45834D', opacity: syncingSheets ? 0.7 : 1 }}>
              <RefreshCw size={13} style={{ animation: syncingSheets ? 'spin 1s linear infinite' : 'none' }} />
              {syncingSheets ? 'Sincronizando...' : 'Sync Sheets'}
            </button>
            {syncMsg && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: syncMsg.startsWith('✓') ? '#45834D' : '#ef4444', color: '#fff', borderRadius: '7px', padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 100 }}>
                {syncMsg}
              </div>
            )}
          </div>
          {isAdmin && onBack && (
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(26,127,189,.25)', background: S.accentLight, color: S.accent }}>
              ← Admin
            </button>
          )}
          <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.08)', color: '#ef4444' }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      {activeSection === 'descuentos' ? (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 1.5rem' }}>
          <DescuentosModal inline userId={userId} onClose={() => setActiveSection('tickets')} responsables={RESPONSABLES} responsablesGrouped={RESPONSABLES_DESCUENTOS} />
        </div>
      ) : (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* ── Columna izquierda ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Buscar cliente</div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: S.muted }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Celular, nombre o DNI..."
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', border: '1px solid rgba(26,127,189,.25)', borderRadius: '7px', fontSize: '0.8rem', color: S.text2, background: 'rgba(235,245,255,.5)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {(searchResults.length > 0 || searching) && (
            <div style={{ background: S.surface, border: S.border, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(26,127,189,.12)' }}>
                {searching ? 'Buscando...' : `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''}`}
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {searchResults.map(c => (
                  <button key={c.cel} onClick={() => selectCustomer(c)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: selectedCustomer?.cel === c.cel ? S.accentLight : 'transparent', border: 'none', borderBottom: '1px solid rgba(26,127,189,.08)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: selectedCustomer?.cel === c.cel ? 'linear-gradient(135deg,#1a7fbd,#155f8f)' : 'rgba(26,127,189,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: selectedCustomer?.cel === c.cel ? '#fff' : S.accent, flexShrink: 0 }}>
                      {c.nom.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: S.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom || '—'}</div>
                      <div style={{ fontSize: '0.65rem', color: S.muted }}>{c.cel}</div>
                    </div>
                    {selectedCustomer?.cel === c.cel && <ChevronRight size={12} color={S.accent} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: S.surface, border: S.border, borderRadius: '12px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Filtrar tickets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {(['todos', ...ESTADOS] as const).map(e => {
                const count = e === 'todos' ? allTickets.length : allTickets.filter(t => t.estado === e).length;
                const color = e === 'todos' ? S.accent : ESTADO_COLOR[e];
                const isActive = ticketEstadoFilter === e;
                return (
                  <button key={e} onClick={() => { setTicketEstadoFilter(e as any); setSelectedCustomer(null); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: '7px', border: `1px solid ${isActive ? color + '40' : 'transparent'}`, background: isActive ? `${color}12` : 'transparent', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? color : S.muted }}>{e === 'todos' ? 'Todos' : ESTADO_LABEL[e]}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: `${color}20`, color, borderRadius: '4px', padding: '0.05rem 0.4rem' }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedCustomer ? (
            <>
              <div style={{ background: S.surface, border: '1px solid rgba(26,127,189,.25)', borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#1a7fbd,#155f8f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {selectedCustomer.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: S.text2 }}>{selectedCustomer.nom || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: S.muted, display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} /> {selectedCustomer.cel}</span>
                        {selectedCustomer.dni && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CreditCard size={11} /> {selectedCustomer.dni}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!loadingVentas && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#45834D' }}>S/{totalSpent.toLocaleString()}</div>
                        <div style={{ fontSize: '0.62rem', color: S.muted }}>{customerVentas.filter(v => !v.anulado).length} compras</div>
                      </div>
                    )}
                    <button onClick={() => { setTicketForm(emptyForm()); setShowTicketForm(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#1a7fbd,#155f8f)', color: '#fff' }}>
                      <Plus size={13} /> Nuevo ticket
                    </button>
                    <button onClick={() => setSelectedCustomer(null)}
                      style={{ display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '7px', border: '1px solid rgba(104,168,119,.25)', background: 'transparent', cursor: 'pointer', color: S.muted }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid rgba(26,127,189,.12)' }}>
                  {([
                    { id: 'historial' as const, Icon: ShoppingBag, text: `Historial (${customerVentas.filter(v => !v.anulado).length})` },
                    { id: 'tickets' as const, Icon: Tag, text: `Tickets (${customerTickets.length})` },
                    { id: 'sheets' as const, Icon: Table2, text: `Sheets (${sheetsVentas.length})` },
                    { id: 'zazu' as const, Icon: Truck, text: loadingZazu ? 'ZAZU...' : `ZAZU (${zazuEnvios.length})` },
                  ]).map(tab => (
                    <button key={tab.id} onClick={() => setCustomerTab(tab.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 800, border: 'none', borderBottom: customerTab === tab.id ? '2px solid #1a7fbd' : '2px solid transparent', background: customerTab === tab.id ? 'rgba(26,127,189,.07)' : 'transparent', color: customerTab === tab.id ? '#1a7fbd' : S.muted, cursor: 'pointer', borderRadius: '6px 6px 0 0', marginBottom: '-2px' }}>
                      <tab.Icon size={12} />
                      {tab.text}
                    </button>
                  ))}
                </div>
              </div>

              {customerTab === 'historial' && (
                <div style={{ background: S.surface, border: S.border, borderRadius: '14px', overflow: 'hidden' }}>
                  {loadingVentas ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Cargando historial...</div>
                  ) : customerVentas.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Sin compras registradas.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(26,127,189,.05)', borderBottom: '1px solid rgba(26,127,189,.15)' }}>
                          {['Fecha', 'Marca', 'Combo', 'Total S/', 'Debe', 'Método', 'Estado'].map(h => (
                            <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {customerVentas.map((v, i) => {
                          const anulado = v.anulado || v.metodo_pago === 'Anulado';
                          return (
                            <tr key={v.id ?? i} style={{ borderBottom: '1px solid rgba(26,127,189,.08)', opacity: anulado ? 0.5 : 1, background: i % 2 === 0 ? 'transparent' : 'rgba(26,127,189,.02)' }}>
                              <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: S.text2 }}>{fmtDate(v.fecha)}</td>
                              <td style={{ padding: '0.5rem 0.85rem' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: (v.marca_label || '').toUpperCase().includes('BRV') ? 'rgba(235,115,71,.1)' : 'rgba(69,131,77,.1)', color: (v.marca_label || '').toUpperCase().includes('BRV') ? '#EB7347' : '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                                  {v.marca_label || 'OVER'}
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem 0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.combo || '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem', fontWeight: 900, color: '#45834D' }}>S/{Number(v.total_total || 0).toLocaleString()}</td>
                              <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: Number(v.resta) > 0 ? '#ef4444' : S.muted }}>{Number(v.resta) > 0 ? `S/${v.resta}` : '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.metodo_pago || '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem' }}>
                                {anulado
                                  ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(239,68,68,.1)', color: '#ef4444', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Anulado</span>
                                  : v.separo === 'Sí'
                                    ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(245,158,11,.1)', color: '#f59e0b', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Separado</span>
                                    : <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(69,131,77,.1)', color: '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Pagado</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {customerTab === 'sheets' && (
                <div style={{ background: S.surface, border: S.border, borderRadius: '14px', overflow: 'hidden' }}>
                  {sheetsVentas.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>
                      Sin datos en Sheets para este cliente. Usa "Sync Sheets" para cargar.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(26,127,189,.05)', borderBottom: '1px solid rgba(26,127,189,.15)' }}>
                          {['Fecha', 'Empresa', 'Vendedor', 'Región', 'Total S/', 'Estado pedido'].map(h => (
                            <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetsVentas.map((v, i) => {
                          const epColor = v.estado_pedido ? (ESTADO_PEDIDO_COLOR[v.estado_pedido] ?? '#888') : null;
                          return (
                            <tr key={v.id} style={{ borderBottom: '1px solid rgba(26,127,189,.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(26,127,189,.02)' }}>
                              <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: S.text2 }}>{v.fecha?.slice(0, 10) ?? '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(69,131,77,.1)', color: '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                                  {v.empresa || '—'}
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.vendedor || '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.lima_provincia || '—'}</td>
                              <td style={{ padding: '0.5rem 0.85rem', fontWeight: 900, color: '#45834D' }}>
                                {v.monto_total ? `S/${v.monto_total}` : '—'}
                              </td>
                              <td style={{ padding: '0.5rem 0.85rem' }}>
                                {epColor
                                  ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: `${epColor}18`, color: epColor, borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{v.estado_pedido}</span>
                                  : <span style={{ color: S.muted }}>—</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {customerTab === 'zazu' && (
                <ZazuTab envios={zazuEnvios} loading={loadingZazu} S={S}
                  onUseNtv={envio => {
                    const region = [envio.fuente, envio.ubicacion].filter(Boolean).join(' · ');
                    setTicketForm(p => ({ ...p, ntv: envio.ntv, region }));
                    setShowTicketForm(true);
                  }}
                />
              )}

              {customerTab === 'tickets' && (
                <TicketList
                  tickets={customerTickets}
                  expandedTicket={expandedTicket}
                  editingNote={editingNote}
                  editingSolucion={editingSolucion}
                  onToggle={id => setExpandedTicket(prev => prev === id ? null : id)}
                  onChangeEstado={changeEstado}
                  onChangeEstadoPedido={changeEstadoPedido}
                  onEditNote={id => setEditingNote({ id, value: customerTickets.find(t => t.id === id)?.notas ?? '' })}
                  onSaveNote={saveNote}
                  onCancelNote={() => setEditingNote(null)}
                  onNoteChange={val => setEditingNote(prev => prev ? { ...prev, value: val } : null)}
                  onEditSolucion={id => setEditingSolucion({ id, value: customerTickets.find(t => t.id === id)?.solucion ?? '' })}
                  onSaveSolucion={saveSolucion}
                  onCancelSolucion={() => setEditingSolucion(null)}
                  onSolucionChange={val => setEditingSolucion(prev => prev ? { ...prev, value: val } : null)}
                  onDelete={removeTicket}
                  emptyMsg="Sin tickets para este cliente."
                  S={S}
                />
              )}
            </>
          ) : (
            <div style={{ background: S.surface, border: S.border, borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(26,127,189,.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {ticketEstadoFilter === 'todos' ? 'Todos los tickets' : ESTADO_LABEL[ticketEstadoFilter]} — {filteredTickets.length}
                </div>
                <button onClick={loadTickets} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(26,127,189,.25)', background: S.accentLight, color: S.accent }}>
                  <RotateCcw size={11} /> Actualizar
                </button>
              </div>
              {loadingTickets ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Cargando...</div>
              ) : (
                <TicketList
                  tickets={filteredTickets}
                  expandedTicket={expandedTicket}
                  editingNote={editingNote}
                  editingSolucion={editingSolucion}
                  onToggle={id => setExpandedTicket(prev => prev === id ? null : id)}
                  onChangeEstado={changeEstado}
                  onChangeEstadoPedido={changeEstadoPedido}
                  onEditNote={id => setEditingNote({ id, value: filteredTickets.find(t => t.id === id)?.notas ?? '' })}
                  onSaveNote={saveNote}
                  onCancelNote={() => setEditingNote(null)}
                  onNoteChange={val => setEditingNote(prev => prev ? { ...prev, value: val } : null)}
                  onEditSolucion={id => setEditingSolucion({ id, value: filteredTickets.find(t => t.id === id)?.solucion ?? '' })}
                  onSaveSolucion={saveSolucion}
                  onCancelSolucion={() => setEditingSolucion(null)}
                  onSolucionChange={val => setEditingSolucion(prev => prev ? { ...prev, value: val } : null)}
                  onDelete={removeTicket}
                  emptyMsg="No hay tickets con este estado."
                  S={S}
                />
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {showMetrics && <MetricsModal tickets={allTickets} onClose={() => setShowMetrics(false)} />}
      {showDescuentos && <DescuentosModal userId={userId} onClose={() => setShowDescuentos(false)} responsables={RESPONSABLES} responsablesGrouped={RESPONSABLES_DESCUENTOS} />}

      {/* ── Modal: Nuevo ticket ── */}
      {showTicketForm && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '1.5rem', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: S.text2 }}>Nuevo ticket — {selectedCustomer.nom}</div>
              <button onClick={() => setShowTicketForm(false)} style={{ padding: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: S.muted }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Empresa */}
              <div>
                <label style={labelStyle}>Empresa</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {EMPRESAS.map(emp => {
                    const colors: Record<string, string> = { OVERSHARK: '#1a7fbd', BRAVOS: '#EB7347', OVERGIRLS: '#d946ef' };
                    const c = colors[emp] ?? '#888';
                    const active = ticketForm.empresa === emp;
                    return (
                      <button key={emp} type="button" onClick={() => setTicketForm(p => ({ ...p, empresa: active ? '' : emp }))}
                        style={{ flex: 1, padding: '0.45rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${active ? c : 'rgba(0,0,0,.1)'}`, background: active ? `${c}18` : 'transparent', color: active ? c : '#94a3b8', transition: 'all 0.15s', letterSpacing: '0.02em' }}>
                        {emp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipo de caso */}
              {field('Tipo de caso',
                <select value={ticketForm.tipo} onChange={e => setTicketForm(p => ({ ...p, tipo: e.target.value }))} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  {TIPOS_TICKET.map(t => <option key={t}>{t}</option>)}
                </select>
              )}

              {/* Fila: NTV + Motivo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {field('NTV',
                  <input value={ticketForm.ntv} onChange={e => setTicketForm(p => ({ ...p, ntv: e.target.value }))}
                    placeholder="Número de tracking" style={inputStyle} />
                )}
                {field('Motivo',
                  <select value={ticketForm.asunto} onChange={e => setTicketForm(p => ({ ...p, asunto: e.target.value }))} style={inputStyle}>
                    {MOTIVOS.map(m => <option key={m}>{m}</option>)}
                  </select>
                )}
              </div>

              {/* Fecha de atención */}
              {field('Fecha de atención',
                <input type="date" value={ticketForm.fecha_atencion}
                  onChange={e => setTicketForm(p => ({ ...p, fecha_atencion: e.target.value }))}
                  style={inputStyle} />
              )}

              {/* Fila: Region + Responsable */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={labelStyle}>Región</label>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    {(['LIMA', 'PROVINCIA'] as const).map(scope => (
                      <button key={scope} type="button"
                        onClick={() => setTicketForm(p => ({ ...p, region_scope: p.region_scope === scope ? '' : scope, region: '' }))}
                        style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${ticketForm.region_scope === scope ? S.accent : 'rgba(0,0,0,.1)'}`, background: ticketForm.region_scope === scope ? S.accentLight : 'transparent', color: ticketForm.region_scope === scope ? S.accent : '#94a3b8' }}>
                        {scope}
                      </button>
                    ))}
                  </div>
                  {ticketForm.region_scope === 'LIMA' && (
                    <select value={ticketForm.region}
                      onChange={e => setTicketForm(p => ({ ...p, region: e.target.value }))}
                      style={inputStyle}>
                      <option value="">— Distrito —</option>
                      {LIMA_DISTRITOS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  )}
                  {ticketForm.region_scope === 'PROVINCIA' && (
                    <select value={ticketForm.region}
                      onChange={e => setTicketForm(p => ({ ...p, region: e.target.value }))}
                      style={inputStyle}>
                      <option value="">— Departamento —</option>
                      {PROVINCIAS_DEPTO.map(d => <option key={d}>{d}</option>)}
                    </select>
                  )}
                  {!ticketForm.region_scope && (
                    <div style={{ ...inputStyle, color: '#94a3b8', lineHeight: '1.6' }}>Selecciona Lima o Provincia</div>
                  )}
                </div>
                {field('Responsable',
                  <select value={ticketForm.responsable} onChange={e => setTicketForm(p => ({ ...p, responsable: e.target.value }))} style={inputStyle}>
                    <option value="">— Seleccionar —</option>
                    {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                )}
              </div>

              {/* Estado del pedido */}
              {field('Estado del pedido',
                <select value={ticketForm.estado_pedido} onChange={e => setTicketForm(p => ({ ...p, estado_pedido: e.target.value }))} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  {ESTADOS_PEDIDO.map(e => <option key={e}>{e}</option>)}
                </select>
              )}

              {/* Solicitud */}
              {field('Solicitud',
                <input value={ticketForm.solicitud} onChange={e => setTicketForm(p => ({ ...p, solicitud: e.target.value }))}
                  placeholder="Detalla la solicitud..." style={inputStyle} />
              )}

              {/* Descripción */}
              {field('Descripción',
                <textarea value={ticketForm.descripcion} onChange={e => setTicketForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Detalla el problema o consulta..." rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              )}

              {/* Solución */}
              {field('Solución',
                <textarea value={ticketForm.solucion} onChange={e => setTicketForm(p => ({ ...p, solucion: e.target.value }))}
                  placeholder="Solución aplicada (si la hay)..." rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              )}

              {/* Prioridad */}
              <div>
                <label style={labelStyle}>Prioridad</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {PRIORIDADES.map(p => (
                    <button key={p} onClick={() => setTicketForm(prev => ({ ...prev, prioridad: p }))}
                      style={{ flex: 1, padding: '0.4rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: `1px solid ${ticketForm.prioridad === p ? PRIORIDAD_COLOR[p] : 'rgba(0,0,0,0.1)'}`, background: ticketForm.prioridad === p ? `${PRIORIDAD_COLOR[p]}18` : 'transparent', color: ticketForm.prioridad === p ? PRIORIDAD_COLOR[p] : '#888', textTransform: 'capitalize' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venta relacionada */}
              {customerVentas.length > 0 && field('Venta relacionada (opcional)',
                <select value={ticketForm.venta_id} onChange={e => setTicketForm(p => ({ ...p, venta_id: e.target.value }))} style={inputStyle}>
                  <option value="">— Ninguna —</option>
                  {customerVentas.slice(0, 20).map(v => (
                    <option key={v.id} value={v.id}>{fmtDate(v.fecha)} · {v.combo?.slice(0, 30)} · S/{v.total_total}</option>
                  ))}
                </select>
              )}

              {/* Notas internas */}
              {field('Notas internas',
                <textarea value={ticketForm.notas} onChange={e => setTicketForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Notas solo visibles para ATC..." rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              )}
            </div>

            {ticketError && (
              <div style={{ marginTop: '0.75rem', padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
                ⚠️ {ticketError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => { setShowTicketForm(false); setTicketError(null); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#888' }}>Cancelar</button>
              <button onClick={submitTicket} disabled={savingTicket}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: savingTicket ? 'default' : 'pointer', border: 'none', background: 'linear-gradient(135deg,#1a7fbd,#155f8f)', color: '#fff', opacity: savingTicket ? 0.7 : 1 }}>
                {savingTicket ? 'Creando...' : 'Crear ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers tiempo abierto ────────────────────────────────────────────────────
function diasAbierto(createdAt?: string): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}
function colorTiempo(dias: number): string {
  if (dias === 0) return '#45834D';
  if (dias <= 2) return '#f59e0b';
  if (dias <= 5) return '#f97316';
  return '#ef4444';
}

// ── ZazuTab ────────────────────────────────────────────────────────────────────

const ZAZU_FUENTE_COLOR: Record<string, string> = {
  Lima: '#1a7fbd',
  Shalom: '#8b5cf6',
  Olva: '#f59e0b',
  Marvisur: '#45834D',
};

const ZAZU_ESTADO_COLOR: Record<string, string> = {
  'Entregado': '#45834D',
  'EN CURSO': '#1a7fbd',
  'Pendiente': '#f59e0b',
  'Reprogramado': '#f59e0b',
  'No entregado': '#ef4444',
  'Devuelto': '#8b5cf6',
};

function ZazuTab({ envios, loading, S, onUseNtv }: { envios: ZazuEnvio[]; loading: boolean; S: Record<string, string>; onUseNtv?: (envio: ZazuEnvio) => void }) {
  if (loading) return (
    <div style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(104,168,119,.35)', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>
      Buscando en ZAZU Express...
    </div>
  );
  if (envios.length === 0) return (
    <div style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(104,168,119,.35)', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>
      Sin envíos encontrados en ZAZU Express para este cliente.
    </div>
  );

  return (
    <div style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(104,168,119,.35)', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', background: 'rgba(26,127,189,.04)', borderBottom: '1px solid rgba(26,127,189,.12)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          <Truck size={13} /> ZAZU Express — {envios.length} envío{envios.length !== 1 ? 's' : ''}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr style={{ background: 'rgba(26,127,189,.05)', borderBottom: '1px solid rgba(26,127,189,.15)' }}>
            {['NTV', 'Courier', 'Fecha', 'Empresa', 'Ubicación', 'Guía', 'S/ Cobrar', 'Estado'].map(h => (
              <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {envios.map((e, i) => {
            const fColor = ZAZU_FUENTE_COLOR[e.fuente] ?? '#888';
            const eColor = ZAZU_ESTADO_COLOR[e.estado] ?? '#888';
            return (
              <tr key={`${e.ntv}-${i}`} style={{ borderBottom: '1px solid rgba(26,127,189,.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(26,127,189,.02)' }}>
                <td style={{ padding: '0.5rem 0.85rem' }}>
                  <span
                    title={onUseNtv ? 'Clic para usar en ticket' : undefined}
                    onClick={() => onUseNtv && e.ntv && onUseNtv(e)}
                    style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'monospace', background: 'rgba(26,127,189,.1)', color: '#1a7fbd', borderRadius: '4px', padding: '0.1rem 0.45rem', cursor: onUseNtv ? 'pointer' : 'default', textDecoration: onUseNtv ? 'underline dotted' : 'none' }}>
                    {e.ntv}
                  </span>
                </td>
                <td style={{ padding: '0.5rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: `${fColor}15`, color: fColor, borderRadius: '4px', padding: '0.1rem 0.45rem', border: `1px solid ${fColor}30` }}>{e.fuente}</span>
                </td>
                <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: S.text2, whiteSpace: 'nowrap' }}>{e.fecha?.slice(0, 10) ?? '—'}</td>
                <td style={{ padding: '0.5rem 0.85rem', color: S.muted, fontSize: '0.72rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.empresa || '—'}</td>
                <td style={{ padding: '0.5rem 0.85rem', color: S.muted, fontSize: '0.72rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.ubicacion || '—'}</td>
                <td style={{ padding: '0.5rem 0.85rem', color: S.muted, fontSize: '0.72rem', fontFamily: 'monospace' }}>{e.guia || '—'}</td>
                <td style={{ padding: '0.5rem 0.85rem', fontWeight: 900, color: '#45834D' }}>{e.monto_cobrar ? `S/${e.monto_cobrar}` : '—'}</td>
                <td style={{ padding: '0.5rem 0.85rem' }}>
                  {e.estado && e.estado !== '—'
                    ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: `${eColor}15`, color: eColor, borderRadius: '4px', padding: '0.1rem 0.45rem', border: `1px solid ${eColor}30` }}>{e.estado}</span>
                    : <span style={{ color: S.muted }}>—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── DescuentosModal ───────────────────────────────────────────────────────────

type DescForm = {
  fecha: string; nota_venta: string; dni: string; telefono: string;
  nombre_cliente: string; descripcion: string; descuento: string; responsable: string;
};
const emptyDesc = (): DescForm => ({
  fecha: new Date().toISOString().slice(0, 10),
  nota_venta: '', dni: '', telefono: '', nombre_cliente: '',
  descripcion: '', descuento: '', responsable: '',
});

function DescuentosModal({ userId, onClose, responsables, responsablesGrouped, inline }: {
  userId?: string; onClose: () => void; responsables: string[]; responsablesGrouped?: RespGroup[]; inline?: boolean;
}) {
  const renderRespOptions = (withBlank = true) => responsablesGrouped ? (
    <>
      {withBlank && <option value="">— Seleccionar —</option>}
      {responsablesGrouped.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.items.map(r => <option key={r} value={r}>{r}</option>)}
        </optgroup>
      ))}
    </>
  ) : (
    <>
      {withBlank && <option value="">— Seleccionar —</option>}
      {responsables.map(r => <option key={r} value={r}>{r}</option>)}
    </>
  );
  const [rows, setRows] = useState<ATCDescuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DescForm>(emptyDesc());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DescForm>(emptyDesc());
  const [filterResp, setFilterResp] = useState('');
  const [filterNom, setFilterNom] = useState('');

  // Customer autocomplete for the form
  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<CustomerBasic[]>([]);
  const [custSearching, setCustSearching] = useState(false);
  const [selectedCust, setSelectedCust] = useState<CustomerBasic | null>(null);
  const [custVentas, setCustVentas] = useState<VentaDB[]>([]);
  const [custSheetsVentas, setCustSheetsVentas] = useState<SheetsVentaDB[]>([]);
  const [custZazuEnvios, setCustZazuEnvios] = useState<ZazuEnvio[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [ntvManual, setNtvManual] = useState(false);

  useEffect(() => {
    getATCDescuentos().then(d => { setRows(d); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!custQuery.trim()) { setCustResults([]); return; }
    const t = setTimeout(async () => {
      setCustSearching(true);
      const [dbRes, sheetsRes] = await Promise.all([
        searchCustomers(custQuery),
        searchSheetsCustomers(custQuery),
      ]);
      const seen = new Set(dbRes.map(c => c.cel));
      setCustResults([...dbRes, ...sheetsRes.filter(c => !seen.has(c.cel))]);
      setCustSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [custQuery]);

  const selectCust = async (c: CustomerBasic) => {
    setSelectedCust(c);
    setCustQuery(c.nom);
    setCustResults([]);
    setNtvManual(false);
    setForm(p => ({ ...p, nombre_cliente: c.nom, dni: c.dni ?? '', telefono: c.cel, nota_venta: '' }));
    setLoadingVentas(true);
    const zazuQ = c.dni || c.nom;
    const [ventas, sheets, zazu] = await Promise.all([
      getCustomerVentas(c.cel),
      getCustomerSheetsVentas(c.cel),
      searchZazuEnvios(zazuQ),
    ]);
    setCustVentas(ventas.filter(v => !v.anulado && v.metodo_pago !== 'Anulado'));
    setCustSheetsVentas(sheets);
    setCustZazuEnvios(zazu);
    setLoadingVentas(false);
  };

  const clearCust = () => {
    setSelectedCust(null);
    setCustQuery('');
    setCustResults([]);
    setCustVentas([]);
    setCustSheetsVentas([]);
    setCustZazuEnvios([]);
    setNtvManual(false);
    setForm(p => ({ ...p, nombre_cliente: '', dni: '', telefono: '', nota_venta: '' }));
  };

  const save = async () => {
    if (!form.nombre_cliente.trim() || !form.descripcion.trim() || !form.descuento.trim()) {
      setSaveError('Completa: Nombre cliente, Descripción y Descuento.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const created = await createATCDescuento({
      fecha: form.fecha,
      nota_venta: form.nota_venta.trim() || undefined,
      dni: form.dni.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      nombre_cliente: form.nombre_cliente.trim(),
      descripcion: form.descripcion.trim(),
      descuento: Number(form.descuento),
      responsable: form.responsable.trim() || undefined,
      atc_user_id: userId,
    });
    if (created) {
      setRows(prev => [created, ...prev]);
      setForm(emptyDesc());
      clearCust();
      setShowForm(false);
      setSaveError(null);
    } else {
      setSaveError('No se pudo guardar. Verifica que la tabla atc_descuentos exista en Supabase.');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const ok = await deleteATCDescuento(id);
    if (ok) setRows(prev => prev.filter(r => r.id !== id));
  };

  const startEdit = (r: ATCDescuento) => {
    setEditingId(r.id!);
    setEditForm({ fecha: r.fecha, nota_venta: r.nota_venta ?? '', dni: r.dni ?? '', telefono: r.telefono ?? '', nombre_cliente: r.nombre_cliente, descripcion: r.descripcion, descuento: String(r.descuento), responsable: r.responsable ?? '' });
  };

  const saveEdit = async (id: string) => {
    const ok = await updateATCDescuento(id, {
      fecha: editForm.fecha, nota_venta: editForm.nota_venta || undefined,
      dni: editForm.dni || undefined, telefono: editForm.telefono || undefined,
      nombre_cliente: editForm.nombre_cliente, descripcion: editForm.descripcion,
      descuento: Number(editForm.descuento), responsable: editForm.responsable || undefined,
    });
    if (ok) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, fecha: editForm.fecha, nota_venta: editForm.nota_venta || undefined, dni: editForm.dni || undefined, telefono: editForm.telefono || undefined, nombre_cliente: editForm.nombre_cliente, descripcion: editForm.descripcion, descuento: Number(editForm.descuento), responsable: editForm.responsable || undefined } : r));
      setEditingId(null);
    }
  };

  const filtered = rows.filter(r =>
    (!filterResp || r.responsable === filterResp) &&
    (!filterNom || (r.nombre_cliente + r.telefono + r.dni).toLowerCase().includes(filterNom.toLowerCase()))
  );

  const totalDesc = filtered.reduce((s, r) => s + (Number(r.descuento) || 0), 0);

  const tdStyle: React.CSSProperties = { padding: '0.45rem 0.7rem', fontSize: '0.77rem', color: '#1a2e38', verticalAlign: 'middle' };
  const thStyle: React.CSSProperties = { padding: '0.5rem 0.7rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const, background: 'rgba(139,92,246,.05)' };
  const inp: React.CSSProperties = { width: '100%', padding: '0.38rem 0.55rem', border: '1px solid rgba(139,92,246,.3)', borderRadius: '6px', fontSize: '0.78rem', color: '#1a2e38', background: '#fff', outline: 'none', boxSizing: 'border-box' };

  const panelContent = (
    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: inline ? '100%' : '1050px', maxHeight: inline ? 'none' : '92vh', display: 'flex', flexDirection: 'column', boxShadow: inline ? '0 2px 16px rgba(139,92,246,.1)' : '0 24px 80px rgba(0,0,0,0.2)', border: inline ? '1px solid rgba(139,92,246,.2)' : 'none' }}>

        {/* Sticky header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(139,92,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Percent size={16} color="#8b5cf6" />
            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1a2e38' }}>Descuentos ATC</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(139,92,246,.1)', color: '#8b5cf6', borderRadius: '5px', padding: '0.1rem 0.5rem' }}>{filtered.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input value={filterNom} onChange={e => setFilterNom(e.target.value)} placeholder="Buscar cliente / cel / DNI..." style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(139,92,246,.25)', borderRadius: '7px', fontSize: '0.78rem', color: '#1a2e38', background: '#f8f5ff', outline: 'none', width: '210px' }} />
            <select value={filterResp} onChange={e => setFilterResp(e.target.value)} style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(139,92,246,.25)', borderRadius: '7px', fontSize: '0.78rem', color: '#1a2e38', background: '#fff', cursor: 'pointer' }}>
              <option value="">Todos los responsables</option>
              {renderRespOptions(false)}
            </select>
            <button onClick={() => { setShowForm(f => !f); setForm(emptyDesc()); clearCust(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff' }}>
              <Plus size={13} /> Nuevo
            </button>
            <button onClick={onClose} style={{ padding: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
          </div>
        </div>

        {/* Formulario nuevo */}
        {showForm && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(139,92,246,.12)', background: 'rgba(139,92,246,.03)', flexShrink: 0 }}>

            {/* Fila 1: Fecha + Buscador de cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Buscar Cliente (cel / nombre / DNI) *
                  {selectedCust && <button onClick={clearCust} style={{ marginLeft: '0.5rem', fontSize: '0.6rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>✕ Cambiar</button>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    value={custQuery}
                    onChange={e => { setCustQuery(e.target.value); if (selectedCust) clearCust(); }}
                    placeholder="Buscar por celular, nombre o DNI..."
                    style={{ ...inp, paddingLeft: '1.75rem', background: selectedCust ? 'rgba(139,92,246,.06)' : '#fff', borderColor: selectedCust ? '#8b5cf6' : 'rgba(139,92,246,.3)' }}
                    readOnly={!!selectedCust}
                  />
                </div>
                {/* Dropdown resultados */}
                {custResults.length > 0 && !selectedCust && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid rgba(139,92,246,.25)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 20, maxHeight: '200px', overflowY: 'auto', marginTop: '2px' }}>
                    {custSearching && <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.75rem', color: '#94a3b8' }}>Buscando...</div>}
                    {custResults.map(c => (
                      <button key={c.cel} onClick={() => selectCust(c)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(139,92,246,.07)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: '#8b5cf6', flexShrink: 0 }}>
                          {c.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e38' }}>{c.nom || '—'}</div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{c.cel}{c.dni ? ` · DNI ${c.dni}` : ''}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ficha cliente seleccionado */}
            {selectedCust && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Nombre</label>
                  <input readOnly value={form.nombre_cliente} style={{ ...inp, background: 'rgba(139,92,246,.05)', color: '#6d28d9', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>DNI</label>
                  <input readOnly value={form.dni} style={{ ...inp, background: 'rgba(139,92,246,.05)', color: '#6d28d9' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Teléfono</label>
                  <input readOnly value={form.telefono} style={{ ...inp, background: 'rgba(139,92,246,.05)', color: '#6d28d9' }} />
                </div>
              </div>
            )}

            {/* Fila 2: NTV + Descripción + Descuento + Responsable */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 120px 160px', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Nota de Venta{loadingVentas ? ' (cargando...)' : selectedCust && (custVentas.length + custSheetsVentas.length + custZazuEnvios.length) > 0 ? ` (${custVentas.length + custSheetsVentas.length + custZazuEnvios.length})` : ''}</span>
                  {selectedCust && !loadingVentas && (custVentas.length > 0 || custSheetsVentas.length > 0 || custZazuEnvios.length > 0) && (
                    <button type="button" onClick={() => { setNtvManual(m => !m); setForm(p => ({ ...p, nota_venta: '' })); }}
                      style={{ fontSize: '0.58rem', background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                      {ntvManual ? '← Lista' : '✏ Manual'}
                    </button>
                  )}
                </label>
                {selectedCust && !ntvManual && (custVentas.length > 0 || custSheetsVentas.length > 0 || custZazuEnvios.length > 0) ? (
                  <select value={form.nota_venta} onChange={e => setForm(p => ({ ...p, nota_venta: e.target.value }))} style={inp}>
                    <option value="">— Seleccionar NTV —</option>
                    {custVentas.length > 0 && <optgroup label="Ventas DB">
                      {custVentas.slice(0, 30).map(v => (
                        <option key={v.id} value={v.id ?? ''}>
                          {v.fecha?.slice(0, 10)} · {v.combo?.slice(0, 25) ?? '—'} · S/{v.total_total}
                        </option>
                      ))}
                    </optgroup>}
                    {custSheetsVentas.length > 0 && <optgroup label="Ventas Sheets">
                      {custSheetsVentas.slice(0, 30).map(v => (
                        <option key={v.id} value={v.id ?? ''}>
                          {v.fecha?.slice(0, 10)} · {v.empresa ?? '—'} · S/{v.monto_total}
                        </option>
                      ))}
                    </optgroup>}
                    {custZazuEnvios.length > 0 && <optgroup label="Zazu Express">
                      {custZazuEnvios.slice(0, 30).map(v => (
                        <option key={`z-${v.ntv}-${v.fuente}`} value={v.ntv}>
                          {v.fecha?.slice(0, 10)} · {v.fuente} · {v.empresa?.slice(0, 18) ?? '—'} · S/{v.monto_cobrar}
                        </option>
                      ))}
                    </optgroup>}
                  </select>
                ) : (
                  <input value={form.nota_venta} onChange={e => setForm(p => ({ ...p, nota_venta: e.target.value }))} placeholder={selectedCust && !loadingVentas && !ntvManual ? 'Sin ventas registradas' : 'NTV-...'} style={inp} />
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Motivo del descuento..." style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Descuento S/ *</label>
                <input type="number" min="0" step="0.01" value={form.descuento} onChange={e => setForm(p => ({ ...p, descuento: e.target.value }))} placeholder="0.00" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Responsable</label>
                <select value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} style={inp}>
                  {renderRespOptions()}
                </select>
              </div>
            </div>

            {saveError && (
              <div style={{ padding: '0.45rem 0.7rem', borderRadius: '7px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                ⚠️ {saveError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => { setShowForm(false); clearCust(); setSaveError(null); }} style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,0,0,.12)', background: 'transparent', color: '#888' }}>Cancelar</button>
              <button onClick={save} disabled={saving}
                style={{ padding: '0.4rem 1.1rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>Sin registros de descuentos.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((r, i) => {
                const isExpanded = expandedId === r.id;
                return editingId === r.id ? (
                  <div key={r.id} style={{ borderBottom: '1px solid rgba(139,92,246,.12)', background: 'rgba(139,92,246,.04)', padding: '0.65rem 1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 110px 90px 105px 1fr 1fr 90px 110px auto', gap: '0.4rem', alignItems: 'center' }}>
                      <input type="date" value={editForm.fecha} onChange={e => setEditForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
                      <input value={editForm.nota_venta} onChange={e => setEditForm(p => ({ ...p, nota_venta: e.target.value }))} placeholder="NTV" style={inp} />
                      <input value={editForm.dni} onChange={e => setEditForm(p => ({ ...p, dni: e.target.value }))} placeholder="DNI" style={inp} />
                      <input value={editForm.telefono} onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))} placeholder="Teléfono" style={inp} />
                      <input value={editForm.nombre_cliente} onChange={e => setEditForm(p => ({ ...p, nombre_cliente: e.target.value }))} placeholder="Nombre cliente" style={inp} />
                      <input value={editForm.descripcion} onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción" style={inp} />
                      <input type="number" value={editForm.descuento} onChange={e => setEditForm(p => ({ ...p, descuento: e.target.value }))} placeholder="0.00" style={inp} />
                      <select value={editForm.responsable} onChange={e => setEditForm(p => ({ ...p, responsable: e.target.value }))} style={inp}>
                        {renderRespOptions()}
                      </select>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => saveEdit(r.id!)} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}><Check size={11} /></button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: '1px solid #ccc', background: 'transparent', color: '#888', cursor: 'pointer' }}><X size={11} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={r.id} style={{ borderBottom: '1px solid rgba(139,92,246,.08)', background: isExpanded ? 'rgba(139,92,246,.035)' : i % 2 === 0 ? 'transparent' : 'rgba(139,92,246,.015)' }}>
                    {/* Fila principal */}
                    <div
                      onClick={() => setExpandedId(prev => prev === r.id ? null : r.id!)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: '#8b5cf6', flexShrink: 0 }}>
                        {r.nombre_cliente.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1a2e38', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre_cliente}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descripcion}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {r.nota_venta && <span style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'monospace', background: 'rgba(139,92,246,.1)', color: '#8b5cf6', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>{r.nota_venta}</span>}
                        {r.responsable && <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(100,116,139,.1)', color: '#475569', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>{r.responsable}</span>}
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{r.fecha}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#8b5cf6', minWidth: '70px', textAlign: 'right' }}>S/ {Number(r.descuento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                        <span style={{ color: isExpanded ? '#8b5cf6' : '#94a3b8', fontSize: '0.7rem', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                      </div>
                    </div>

                    {/* Panel expandido */}
                    {isExpanded && (
                      <div style={{ padding: '0 1rem 0.85rem 1rem', borderTop: '1px solid rgba(139,92,246,.1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '0.65rem', paddingTop: '0.65rem' }}>
                          {[
                            { label: 'Fecha', val: r.fecha },
                            { label: 'Nota de Venta', val: r.nota_venta || '—' },
                            { label: 'DNI', val: r.dni || '—' },
                            { label: 'Teléfono', val: r.telefono || '—' },
                          ].map(f => (
                            <div key={f.label}>
                              <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{f.label}</div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e38' }}>{f.val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginBottom: '0.65rem' }}>
                          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Descripción</div>
                          <div style={{ fontSize: '0.8rem', color: '#1a2e38', background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.15)', borderRadius: '7px', padding: '0.5rem 0.75rem', lineHeight: 1.5 }}>{r.descripcion}</div>
                        </div>
                        {r.responsable && (
                          <div style={{ marginBottom: '0.65rem' }}>
                            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#6b8fa3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Responsable</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(139,92,246,.1)', color: '#8b5cf6', borderRadius: '5px', padding: '0.15rem 0.6rem' }}>{r.responsable}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <button onClick={() => printDescuentoPDF(r)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(139,92,246,.3)', background: 'rgba(139,92,246,.07)', color: '#8b5cf6' }}>
                            <Printer size={12} /> Exportar PDF
                          </button>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={e => { e.stopPropagation(); startEdit(r); setExpandedId(null); }}
                              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(139,92,246,.3)', background: 'transparent', color: '#8b5cf6' }}>
                              <Pencil size={11} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); if (window.confirm('¿Eliminar este descuento?')) remove(r.id!); }}
                              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.07)', color: '#ef4444' }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer total */}
        {filtered.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(139,92,246,.12)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total descuentos:</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#8b5cf6' }}>S/ {totalDesc.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
    </div>
  );

  if (inline) return panelContent;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {panelContent}
    </div>
  );
}

// ── MetricsModal ──────────────────────────────────────────────────────────────
function getLast6Months(): { value: string; label: string }[] {
  const out = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

function MetricsModal({ tickets, onClose }: { tickets: ATCTicket[]; onClose: () => void }) {
  const months = getLast6Months();
  const [month, setMonth] = useState(months[0].value);
  const filtered = tickets.filter(t => (t.created_at ?? '').startsWith(month));

  const byEstado = ESTADOS.reduce((acc, e) => ({ ...acc, [e]: filtered.filter(t => t.estado === e).length }), {} as Record<string, number>);

  const byEmpresa = [
    { label: 'OVERSHARK', color: '#1a7fbd', count: filtered.filter(t => t.empresa === 'OVERSHARK').length },
    { label: 'BRAVOS', color: '#EB7347', count: filtered.filter(t => t.empresa === 'BRAVOS').length },
    { label: 'OVERGIRLS', color: '#d946ef', count: filtered.filter(t => t.empresa === 'OVERGIRLS').length },
    { label: 'Sin marca', color: '#94a3b8', count: filtered.filter(t => !t.empresa).length },
  ].filter(x => x.count > 0);

  const byResponsable = RESPONSABLES.map(r => ({ label: r, count: filtered.filter(t => t.responsable === r).length }))
    .filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const topMotivos = MOTIVOS.map(m => ({ label: m, count: filtered.filter(t => t.asunto === m).length }))
    .filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxMotivo = topMotivos[0]?.count ?? 1;

  const montoTotal = filtered.reduce((sum, t) => sum + (Number(t.monto) || 0), 0);

  const activos = filtered.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso');
  const tiempoGrupos = [
    { label: 'Hoy', color: '#45834D', count: activos.filter(t => diasAbierto(t.created_at) === 0).length },
    { label: '1-3 días', color: '#f59e0b', count: activos.filter(t => { const d = diasAbierto(t.created_at); return d >= 1 && d <= 3; }).length },
    { label: '4-7 días', color: '#f97316', count: activos.filter(t => { const d = diasAbierto(t.created_at); return d >= 4 && d <= 7; }).length },
    { label: '+7 días', color: '#ef4444', count: activos.filter(t => diasAbierto(t.created_at) > 7).length },
  ];

  const secStyle: React.CSSProperties = { background: 'rgba(26,127,189,.03)', border: '1px solid rgba(26,127,189,.12)', borderRadius: '10px', padding: '0.9rem 1rem' };
  const secTitle: React.CSSProperties = { fontSize: '0.62rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(26,127,189,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BarChart2 size={16} color="#1a7fbd" />
            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1a2e38' }}>Métricas ATC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <select value={month} onChange={e => setMonth(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1px solid rgba(26,127,189,.25)', fontSize: '0.78rem', color: '#1a2e38', background: '#fff', cursor: 'pointer' }}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <button onClick={onClose} style={{ padding: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.55rem' }}>
            {[
              { label: 'Total', val: filtered.length, color: '#1a7fbd' },
              { label: 'Abiertos', val: byEstado.abierto ?? 0, color: ESTADO_COLOR.abierto },
              { label: 'En proceso', val: byEstado.en_proceso ?? 0, color: ESTADO_COLOR.en_proceso },
              { label: 'Resueltos', val: byEstado.resuelto ?? 0, color: ESTADO_COLOR.resuelto },
              { label: 'Cerrados', val: byEstado.cerrado ?? 0, color: ESTADO_COLOR.cerrado },
            ].map(k => (
              <div key={k.label} style={{ background: `${k.color}08`, border: `1px solid ${k.color}25`, borderRadius: '10px', padding: '0.75rem 0.4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: '0.57rem', fontWeight: 700, color: k.color, opacity: 0.8, marginTop: '0.15rem' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Por empresa + por responsable */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={secStyle}>
              <div style={secTitle}>Por Empresa</div>
              {byEmpresa.length === 0
                ? <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin datos</div>
                : byEmpresa.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#1a2e38' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: item.color }}>{item.count}</span>
                  </div>
                ))}
            </div>

            <div style={secStyle}>
              <div style={secTitle}>Por Responsable</div>
              {byResponsable.length === 0
                ? <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin datos</div>
                : byResponsable.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a2e38' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1a7fbd' }}>{item.count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top motivos */}
          {topMotivos.length > 0 && (
            <div style={secStyle}>
              <div style={secTitle}>Top Motivos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {topMotivos.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a2e38', width: '170px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                    <div style={{ flex: 1, height: '11px', background: 'rgba(26,127,189,.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(item.count / maxMotivo) * 100}%`, background: 'linear-gradient(90deg,#1a7fbd,#38c8f5)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#1a7fbd', width: '22px', textAlign: 'right', flexShrink: 0 }}>{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets activos por antigüedad */}
          <div style={secStyle}>
            <div style={secTitle}>Tickets activos por antigüedad</div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {tiempoGrupos.map(g => (
                <div key={g.label} style={{ background: `${g.color}10`, border: `1px solid ${g.color}30`, borderRadius: '8px', padding: '0.55rem 1rem', textAlign: 'center', minWidth: '72px' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: g.color }}>{g.count}</div>
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, color: g.color, opacity: 0.8, marginTop: '0.1rem' }}>{g.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monto total */}
          {montoTotal > 0 && (
            <div style={{ background: 'rgba(69,131,77,.05)', border: '1px solid rgba(69,131,77,.2)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Monto total involucrado</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#45834D' }}>S/ {montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── PDF Export ────────────────────────────────────────────────────────────────

const EMPRESA_LOGO: Record<string, string> = {
  OVERSHARK: oversharkLogo,
  BRAVOS: bravosLogo,
  OVERGIRLS: overgirlLogo,
};

const EMPRESA_ACCENT: Record<string, string> = {
  OVERSHARK: '#1a7fbd',
  BRAVOS: '#EB7347',
  OVERGIRLS: '#d946ef',
};

function printDescuentoPDF(r: ATCDescuento) {
  const now = new Date();
  const generatedAt = now.toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
  const row = (label: string, value?: string) =>
    value ? `<tr><td class="lbl">${label}</td><td class="val">${value}</td></tr>` : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Constancia Descuento – ${(r.id ?? '').slice(-8).toUpperCase()}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2e38; background: #fff; padding: 32px 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #8b5cf6; padding-bottom: 14px; margin-bottom: 20px; }
  .brand { font-size: 18px; font-weight: 900; color: #1a2e38; letter-spacing: -0.03em; }
  .brand span { color: #8b5cf6; }
  .doc-title { text-align: right; }
  .doc-title h2 { font-size: 15px; font-weight: 800; color: #8b5cf6; }
  .doc-title p { font-size: 11px; color: #6b8fa3; margin-top: 2px; }
  .ref-id { display: inline-block; margin-bottom: 16px; font-size: 11px; font-weight: 700; background: #8b5cf622; color: #8b5cf6; border: 1px solid #8b5cf644; border-radius: 6px; padding: 4px 12px; letter-spacing: 0.06em; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6b8fa3; border-bottom: 1px solid #ede9fe; padding-bottom: 5px; margin-bottom: 10px; }
  table.fields { width: 100%; border-collapse: collapse; }
  table.fields .lbl { width: 130px; font-size: 11px; font-weight: 700; color: #6b8fa3; padding: 5px 0; vertical-align: top; }
  table.fields .val { font-size: 12px; color: #1a2e38; padding: 5px 0 5px 8px; vertical-align: top; }
  .text-block { font-size: 12px; color: #1a2e38; line-height: 1.6; background: #faf5ff; border: 1px solid #ddd6fe; border-radius: 7px; padding: 10px 12px; min-height: 36px; }
  .amount { font-size: 22px; font-weight: 900; color: #8b5cf6; }
  .footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid #ede9fe; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer p { font-size: 10px; color: #94a3b8; }
  .seal { text-align: right; font-size: 10px; color: #94a3b8; }
  .seal strong { display: block; font-size: 11px; color: #6b8fa3; }
  @media print {
    body { padding: 20px 28px; }
    @page { size: A4; margin: 18mm; }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">LIVEX <span>ATC</span></div>
    <div style="font-size:10px;color:#6b8fa3;margin-top:2px">Atención al Cliente</div>
  </div>
  <div class="doc-title">
    <h2>Constancia de Descuento</h2>
    <p>Documento generado el ${generatedAt}</p>
  </div>
</div>

<div class="ref-id">DESC # ${(r.id ?? '').slice(-8).toUpperCase()}</div>

<div class="section">
  <div class="section-title">Datos del cliente</div>
  <table class="fields">
    ${row('Nombre', r.nombre_cliente)}
    ${row('Teléfono', r.telefono)}
    ${row('DNI', r.dni)}
  </table>
</div>

<div class="section">
  <div class="section-title">Detalle del descuento</div>
  <table class="fields">
    ${row('Fecha', r.fecha)}
    ${row('Nota de Venta', r.nota_venta)}
    ${row('Responsable', r.responsable)}
  </table>
</div>

<div class="section">
  <div class="section-title">Descripción</div>
  <div class="text-block">${r.descripcion}</div>
</div>

<div class="section">
  <div class="section-title">Monto descontado</div>
  <div class="amount">S/ ${Number(r.descuento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
</div>

<div class="footer">
  <div>
    <p>Este documento es una constancia oficial del descuento aplicado por el equipo Livex ATC.</p>
    <p style="margin-top:3px">Para consultas adicionales comunícate con nuestro equipo de atención.</p>
  </div>
  <div class="seal">
    <strong>LIVEX Agency</strong>
    Atención al Cliente
  </div>
</div>

<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) { win.document.write(html); win.document.close(); }
}

function printTicketPDF(ticket: ATCTicket) {
  const now = new Date();
  const generatedAt = now.toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });

  const row = (label: string, value?: string) =>
    value ? `<tr><td class="lbl">${label}</td><td class="val">${value}</td></tr>` : '';

  const badge = (text: string, color: string) =>
    `<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:800;background:${color}22;color:${color};border:1px solid ${color}44">${text}</span>`;

  const estadoColor = ESTADO_COLOR[ticket.estado] ?? '#888';
  const pedidoColor = ticket.estado_pedido ? (ESTADO_PEDIDO_COLOR[ticket.estado_pedido] ?? '#888') : null;

  const empresa = ticket.empresa ?? '';
  const accent = EMPRESA_ACCENT[empresa] ?? '#1a7fbd';
  const logoUrl = EMPRESA_LOGO[empresa];
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="height:52px;width:auto;object-fit:contain;display:block;" />`
    : `<div style="width:52px;height:52px;border-radius:10px;background:linear-gradient(135deg,${accent},${accent}cc);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;">L</div>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Constancia ATC – ${ticket.id?.slice(-8).toUpperCase()}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2e38; background: #fff; padding: 32px 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid ${accent}; padding-bottom: 14px; margin-bottom: 20px; }
  .logo-block { display: flex; align-items: center; gap: 14px; }
  .doc-title { text-align: right; }
  .doc-title h2 { font-size: 15px; font-weight: 800; color: ${accent}; }
  .doc-title p { font-size: 11px; color: #6b8fa3; margin-top: 2px; }
  .ticket-id { display: inline-block; margin-bottom: 16px; font-size: 11px; font-weight: 700; background: ${accent}12; color: ${accent}; border: 1px solid ${accent}44; border-radius: 6px; padding: 4px 12px; letter-spacing: 0.06em; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6b8fa3; border-bottom: 1px solid #e2edf5; padding-bottom: 5px; margin-bottom: 10px; }
  table.fields { width: 100%; border-collapse: collapse; }
  table.fields .lbl { width: 130px; font-size: 11px; font-weight: 700; color: #6b8fa3; padding: 5px 0; vertical-align: top; }
  table.fields .val { font-size: 12px; color: #1a2e38; padding: 5px 0 5px 8px; vertical-align: top; }
  .text-block { font-size: 12px; color: #1a2e38; line-height: 1.6; background: #f7fbff; border: 1px solid #d8eaf5; border-radius: 7px; padding: 10px 12px; min-height: 36px; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2edf5; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer p { font-size: 10px; color: #94a3b8; }
  .seal { text-align: right; font-size: 10px; color: #94a3b8; }
  .seal strong { display: block; font-size: 11px; color: #6b8fa3; }
  @media print {
    body { padding: 20px 28px; }
    @page { size: A4; margin: 18mm; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo-block">
    ${logoHtml}
    <div>
      <div style="font-size:18px;font-weight:900;color:#1a2e38;letter-spacing:-0.03em">${empresa || 'LIVEX'} <span style="color:${accent}">ATC</span></div>
      <div style="font-size:10px;color:#6b8fa3;margin-top:2px">Atención al Cliente</div>
    </div>
  </div>
  <div class="doc-title">
    <h2>Constancia de Atención</h2>
    <p>Documento generado el ${generatedAt}</p>
  </div>
</div>

<div class="ticket-id">TICKET # ${(ticket.id ?? '').slice(-8).toUpperCase()}</div>

<div class="section">
  <div class="section-title">Datos del cliente</div>
  <table class="fields">
    ${row('Nombre', ticket.cliente_nom)}
    ${row('Celular', ticket.cliente_cel)}
  </table>
</div>

<div class="section">
  <div class="section-title">Detalle del caso</div>
  <table class="fields">
    ${row('Empresa', ticket.empresa)}
    ${row('Motivo', ticket.asunto)}
    ${ticket.ntv ? row('NTV', ticket.ntv) : ''}
    ${row('Fecha de emisión', ticket.fecha_emision)}
    ${row('Fecha de venta', ticket.fecha_venta)}
    ${row('Región', ticket.region)}
    ${row('Responsable', ticket.responsable)}
    ${row('Solicitud', ticket.solicitud)}
    ${row('Fecha registro', (ticket.created_at ?? '').slice(0, 10))}
  </table>
</div>

${ticket.descripcion ? `
<div class="section">
  <div class="section-title">Descripción</div>
  <div class="text-block">${ticket.descripcion}</div>
</div>` : ''}

<div class="section">
  <div class="section-title">Solución aplicada</div>
  <div class="text-block">${ticket.solucion || '<span style="color:#94a3b8;font-style:italic">Pendiente de resolución</span>'}</div>
</div>

<div class="section">
  <div class="section-title">Estado</div>
  <div class="badges">
    ${badge('Ticket: ' + ESTADO_LABEL[ticket.estado], estadoColor)}
    ${pedidoColor && ticket.estado_pedido ? badge('Pedido: ' + ticket.estado_pedido, pedidoColor) : ''}
    ${badge('Prioridad: ' + ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1), PRIORIDAD_COLOR[ticket.prioridad] ?? '#888')}
  </div>
</div>

<div class="footer">
  <div>
    <p>Este documento es una constancia oficial de que el caso ha sido registrado y atendido por el equipo Livex ATC.</p>
    <p style="margin-top:3px">Para consultas adicionales comunícate con nuestro equipo de atención.</p>
  </div>
  <div class="seal">
    <strong>LIVEX Agency</strong>
    Atención al Cliente
  </div>
</div>

<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── TicketList ─────────────────────────────────────────────────────────────────

interface TicketListProps {
  tickets: ATCTicket[];
  expandedTicket: string | null;
  editingNote: { id: string; value: string } | null;
  editingSolucion: { id: string; value: string } | null;
  onToggle: (id: string) => void;
  onChangeEstado: (id: string, estado: ATCTicket['estado']) => void;
  onChangeEstadoPedido: (id: string, estado_pedido: string) => void;
  onEditNote: (id: string) => void;
  onSaveNote: (id: string, value: string) => void;
  onCancelNote: () => void;
  onNoteChange: (val: string) => void;
  onEditSolucion: (id: string) => void;
  onSaveSolucion: (id: string, value: string) => void;
  onCancelSolucion: () => void;
  onSolucionChange: (val: string) => void;
  onDelete: (id: string) => void;
  emptyMsg: string;
  S: Record<string, string>;
}

function TicketList({ tickets, expandedTicket, editingNote, editingSolucion, onToggle, onChangeEstado, onChangeEstadoPedido, onEditNote, onSaveNote, onCancelNote, onNoteChange, onEditSolucion, onSaveSolucion, onCancelSolucion, onSolucionChange, onDelete, emptyMsg, S }: TicketListProps) {
  if (tickets.length === 0) return (
    <div style={{ padding: '2.5rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>{emptyMsg}</div>
  );

  const inlineTextarea = (value: string, onChange: (v: string) => void, onSave: () => void, onCancel: () => void) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid rgba(26,127,189,.25)', borderRadius: '7px', fontSize: '0.78rem', color: S.text2, background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={onSave} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#1a7fbd,#155f8f)', color: '#fff' }}>Guardar</button>
        <button onClick={onCancel} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,0,0,.12)', background: 'transparent', color: '#888' }}>Cancelar</button>
      </div>
    </div>
  );

  const clickableField = (text: string | undefined, onClick: () => void) => (
    <div onClick={onClick}
      style={{ fontSize: '0.78rem', color: text ? S.text : S.muted, padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,.7)', border: '1px dashed rgba(26,127,189,.2)', borderRadius: '7px', cursor: 'pointer', minHeight: '32px', fontStyle: text ? 'normal' : 'italic' }}>
      {text || 'Haz clic para editar...'}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {tickets.map((t, i) => {
        const isExpanded = expandedTicket === t.id;
        const prioColor = PRIORIDAD_COLOR[t.prioridad] ?? '#888';
        const estadoColor = ESTADO_COLOR[t.estado] ?? '#888';
        const pedidoColor = t.estado_pedido ? (ESTADO_PEDIDO_COLOR[t.estado_pedido] ?? '#888') : null;

        return (
          <div key={t.id ?? i} style={{ borderBottom: '1px solid rgba(26,127,189,.08)' }}>
            {/* Fila compacta */}
            <div onClick={() => onToggle(t.id!)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.1rem', cursor: 'pointer', background: isExpanded ? 'rgba(26,127,189,.04)' : 'transparent', transition: 'background 0.15s' }}>
              <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: prioColor, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  {t.ntv && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, background: 'rgba(26,127,189,.12)', color: '#1a7fbd', borderRadius: '4px', padding: '0.05rem 0.45rem', fontFamily: 'monospace' }}>
                      NTV {t.ntv}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: S.text2 }}>{t.asunto}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, background: `${estadoColor}18`, color: estadoColor, borderRadius: '4px', padding: '0.05rem 0.4rem' }}>{ESTADO_LABEL[t.estado]}</span>
                  {pedidoColor && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, background: `${pedidoColor}18`, color: pedidoColor, borderRadius: '4px', padding: '0.05rem 0.4rem' }}>{t.estado_pedido}</span>
                  )}
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, background: `${prioColor}15`, color: prioColor, borderRadius: '4px', padding: '0.05rem 0.4rem', textTransform: 'capitalize' }}>{t.prioridad}</span>
                  {(t.estado === 'abierto' || t.estado === 'en_proceso') && (() => {
                    const dias = diasAbierto(t.created_at);
                    const c = colorTiempo(dias);
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.18rem', fontSize: '0.58rem', fontWeight: 900, background: `${c}18`, color: c, borderRadius: '4px', padding: '0.05rem 0.4rem', border: `1px solid ${c}35` }}>
                        <Clock size={8} /> {dias === 0 ? 'Hoy' : `${dias}d`}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ fontSize: '0.68rem', color: S.muted, display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={10} /> {t.cliente_nom || t.cliente_cel}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={10} /> {(t.created_at ?? '').slice(0, 10)}</span>
                  {t.responsable && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wrench size={10} /> {t.responsable}</span>}
                  {t.region && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} /> {t.region}</span>}
                </div>
              </div>
              <ChevronRight size={14} color={S.muted} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>

            {/* Detalle expandido */}
            {isExpanded && (
              <div style={{ padding: '0.75rem 1.1rem 1rem 1.75rem', background: 'rgba(26,127,189,.025)', borderTop: '1px solid rgba(26,127,189,.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {/* Info adicional */}
                {(t.empresa || t.tipo || t.monto || t.fecha_emision || t.fecha_venta || t.solicitud) && (
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: S.muted, alignItems: 'center' }}>
                    {t.tipo && <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(26,127,189,.12)', color: '#1a7fbd', borderRadius: '5px', padding: '0.1rem 0.5rem', border: '1px solid rgba(26,127,189,.25)' }}>{t.tipo}</span>}
                    {t.monto ? <span><strong style={{ color: '#45834D' }}>S/ {Number(t.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></span> : null}
                    {t.empresa && (() => {
                      const empColors: Record<string, string> = { OVERSHARK: '#1a7fbd', BRAVOS: '#EB7347', OVERGIRLS: '#d946ef' };
                      const c = empColors[t.empresa] ?? '#888';
                      return <span style={{ fontSize: '0.65rem', fontWeight: 800, background: `${c}15`, color: c, borderRadius: '5px', padding: '0.1rem 0.5rem', border: `1px solid ${c}30` }}>{t.empresa}</span>;
                    })()}
                    {t.fecha_emision && <span><strong style={{ color: S.text2 }}>F.Emisión:</strong> {t.fecha_emision}</span>}
                    {t.fecha_venta && <span><strong style={{ color: S.text2 }}>F.Venta:</strong> {t.fecha_venta}</span>}
                    {t.solicitud && <span><strong style={{ color: S.text2 }}>Solicitud:</strong> {t.solicitud}</span>}
                  </div>
                )}

                {/* Descripción */}
                {t.descripcion && (
                  <div style={{ fontSize: '0.78rem', color: S.text, lineHeight: 1.5 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Descripción</div>
                    {t.descripcion}
                  </div>
                )}

                {/* Solución */}
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Solución</div>
                  {editingSolucion?.id === t.id
                    ? inlineTextarea(editingSolucion.value, onSolucionChange, () => onSaveSolucion(t.id!, editingSolucion.value), onCancelSolucion)
                    : clickableField(t.solucion, () => onEditSolucion(t.id!))
                  }
                </div>

                {/* Notas internas */}
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Notas internas</div>
                  {editingNote?.id === t.id
                    ? inlineTextarea(editingNote.value, onNoteChange, () => onSaveNote(t.id!, editingNote.value), onCancelNote)
                    : clickableField(t.notas, () => onEditNote(t.id!))
                  }
                </div>

                {/* Estado del ticket */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.15rem' }}>Ticket:</span>
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => onChangeEstado(t.id!, e)}
                      style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${t.estado === e ? ESTADO_COLOR[e] : 'rgba(0,0,0,.1)'}`, background: t.estado === e ? `${ESTADO_COLOR[e]}18` : 'transparent', color: t.estado === e ? ESTADO_COLOR[e] : '#888' }}>
                      {ESTADO_LABEL[e]}
                    </button>
                  ))}
                </div>

                {/* Estado del pedido */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.15rem' }}>Pedido:</span>
                  {ESTADOS_PEDIDO.map(ep => {
                    const c = ESTADO_PEDIDO_COLOR[ep] ?? '#888';
                    const isActive = t.estado_pedido === ep;
                    return (
                      <button key={ep} onClick={() => onChangeEstadoPedido(t.id!, ep)}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${isActive ? c : 'rgba(0,0,0,.1)'}`, background: isActive ? `${c}18` : 'transparent', color: isActive ? c : '#888' }}>
                        {ep}
                      </button>
                    );
                  })}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => printTicketPDF(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(26,127,189,.25)', background: 'rgba(26,127,189,.07)', color: '#1a7fbd' }}>
                    <Printer size={12} /> Exportar PDF
                  </button>
                  <button onClick={() => { if (window.confirm('¿Eliminar este ticket?')) onDelete(t.id!); }}
                    style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.07)', color: '#ef4444' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
