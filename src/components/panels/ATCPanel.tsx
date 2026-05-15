import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Search, Plus, X, RotateCcw, ChevronRight, Printer, Phone, CreditCard, ShoppingBag, Tag, Table2, Truck, User, Calendar, Wrench, MapPin, BarChart2, Clock, Percent, Trash2, Pencil, Check, Download, AlertTriangle } from 'lucide-react';
import oversharkLogo from '../../icon-marca/OverShark.jpeg';
import bravosLogo from '../../icon-marca/Bravos.png';
import overgirlLogo from '../../icon-marca/OverGirl.png';
import atcLogo from '../../icon-marca/atc/atc.png';
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
import ATCHeader from './atc/ATCHeader';
import ATCTicketsPage from './atc/pages/ATCTicketsPage';
import ATCDiscountsPage from './atc/pages/ATCDiscountsPage';
import ATCMetricsPage from './atc/pages/ATCMetricsPage';
import { ATC_GRADIENTS, ATC_PALETTE } from './atc/theme';

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
    'Angela', 'Genesis', 'Rosa', 'Daniel', 'Gustavo', 'Sandro', 'Eder',
    'Valentino', 'Gonzalo',
  ] },
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
  bg: ATC_PALETTE.shell,
  surface: ATC_PALETTE.surface,
  border: `1px solid ${ATC_PALETTE.border}`,
  borderSoft: `1px solid ${ATC_PALETTE.border}`,
  borderAccent: '1px solid rgba(69,131,77,.28)',
  accent: ATC_PALETTE.accent,
  accentLight: 'rgba(69,131,77,0.1)',
  success: '#45834D',
  warning: '#f59e0b',
  danger: '#b83030',
  muted: ATC_PALETTE.muted,
  text: ATC_PALETTE.text,
  text2: ATC_PALETTE.text2,
  shadow: '0 8px 26px rgba(69,131,77,.1)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.42rem 0.65rem', border: S.borderSoft,
  borderRadius: '10px', fontSize: '0.82rem', color: S.text2, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 800, color: S.muted,
  textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem',
};

const panelCard: React.CSSProperties = {
  background: 'rgba(255,255,255,.96)',
  border: 'none',
  borderRadius: '14px',
  backdropFilter: 'none',
  boxShadow: '0 2px 12px rgba(69,131,77,.08)',
};

export type TicketFormState = {
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
  const [activeSection, setActiveSection] = useState<'tickets' | 'descuentos' | 'reporte' | 'metricas'>('tickets');

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
    setSyncMsg(result.ok ? `OK ${result.count} registros sincronizados` : `ERROR ${result.error}`);
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
    const current = allTickets.find(t => t.id === id);
    if (!current) return;

    const isReopening = (current.estado === 'cerrado' || current.estado === 'resuelto')
      && (estado === 'abierto' || estado === 'en_proceso');

    let patch: Partial<ATCTicket> = { estado };
    if (isReopening) {
      const reason = window.prompt('Motivo de reapertura (obligatorio):');
      if (!reason || !reason.trim()) return;
      const stamp = new Date().toLocaleString('es-PE');
      const previousNotes = current.notas?.trim() ? `${current.notas.trim()}\n\n` : '';
      patch = {
        ...patch,
        notas: `${previousNotes}[REAPERTURA ${stamp}] ${reason.trim()}`,
      };
    }

    const ok = await updateATCTicket(id, patch);
    if (ok) {
      setAllTickets(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
    }
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

  const bulkUpdateTickets = async (ticketIds: string[], fields: Partial<ATCTicket>) => {
    const ids = ticketIds.filter(Boolean);
    if (ids.length === 0) return;

    const currentById = new Map(
      allTickets
        .filter(t => t.id)
        .map(t => [String(t.id), t] as const),
    );

    const updates = await Promise.all(ids.map(async (id) => {
      const ticket = currentById.get(id);
      if (!ticket) return null;
      const ok = await updateATCTicket(id, fields);
      return ok ? { ...ticket, ...fields } : null;
    }));

    const updatedById = new Map(
      updates
        .filter((u): u is ATCTicket => Boolean(u?.id))
        .map(u => [String(u.id), u] as const),
    );

    if (updatedById.size === 0) return;
    setAllTickets(prev => prev.map(t => (t.id && updatedById.has(String(t.id)) ? updatedById.get(String(t.id))! : t)));
  };

  const bulkChangeEstado = async (ticketIds: string[], estado: ATCTicket['estado']) => {
    await bulkUpdateTickets(ticketIds, { estado });
  };

  const applyTemplateToTicket = async (id: string, template: string) => {
    const current = allTickets.find(t => t.id === id);
    if (!current) return;
    const next = current.solucion?.trim()
      ? `${current.solucion.trim()}\n\n${template}`
      : template;
    const ok = await updateATCTicket(id, { solucion: next });
    if (ok) setAllTickets(prev => prev.map(t => (t.id === id ? { ...t, solucion: next } : t)));
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
    <div style={{
      minHeight: '100vh',
      background: ATC_GRADIENTS.pageBg,
      color: S.text,
      fontFamily: 'League Spartan,Inter,system-ui,sans-serif',
    }}>

      {/* Header */}
      <ATCHeader
        userName={userName}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        ticketsCount={allTickets.length}
        openCount={openCount}
        inProcessCount={inProcessCount}
        resolvedToday={resolvedToday}
        onSyncSheets={handleSyncSheets}
        syncingSheets={syncingSheets}
        syncMsg={syncMsg}
        isAdmin={isAdmin}
        onBack={onBack}
        onSignOut={onSignOut}
        theme={{
          borderSoft: S.borderSoft,
          borderAccent: S.borderAccent,
          accent: S.accent,
          accentLight: S.accentLight,
          muted: S.muted,
          text2: S.text2,
          success: S.success,
          warning: S.warning,
          danger: S.danger,
        }}
      />

      {activeSection === 'metricas' ? (
        <div style={{ maxWidth: '1460px', margin: '0 auto', padding: '1rem 1.2rem 1.4rem' }}>
          <ATCMetricsPage tickets={allTickets} estados={ESTADOS} estadoColor={ESTADO_COLOR} motivos={MOTIVOS} responsables={RESPONSABLES} diasAbierto={diasAbierto} />
        </div>
      ) : activeSection === 'reporte' ? (
        <div style={{ maxWidth: '1460px', margin: '0 auto', padding: '1rem 1.2rem 1.4rem' }}>
          <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 12px rgba(69,131,77,.08)' }}>
            <ReporteSection tickets={allTickets} />
          </div>
        </div>
      ) : activeSection === 'descuentos' ? (
        <div style={{ maxWidth: '1460px', margin: '0 auto', padding: '1rem 1.2rem 1.4rem' }}>
          <ATCDiscountsPage userId={userId} responsables={RESPONSABLES} responsablesGrouped={RESPONSABLES_DESCUENTOS} />
        </div>
      ) : (
        <ATCTicketsPage
          panelCard={panelCard}
          S={S}
          ESTADOS={ESTADOS}
          ESTADO_COLOR={ESTADO_COLOR}
          ESTADO_LABEL={ESTADO_LABEL}
          ESTADO_PEDIDO_COLOR={ESTADO_PEDIDO_COLOR}
          ticketEstadoFilter={ticketEstadoFilter}
          setTicketEstadoFilter={setTicketEstadoFilter}
          allTickets={allTickets}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          searching={searching}
          selectedCustomer={selectedCustomer}
          selectCustomer={selectCustomer}
          setSelectedCustomer={setSelectedCustomer}
          loadingVentas={loadingVentas}
          customerVentas={customerVentas}
          totalSpent={totalSpent}
          onNewTicket={(preset) => { setTicketForm({ ...emptyForm(), ...(preset ?? {}) }); setShowTicketForm(true); }}
          currentUserName={userName}
          responsables={RESPONSABLES}
          customerTab={customerTab}
          setCustomerTab={setCustomerTab}
          customerTickets={customerTickets}
          sheetsVentas={sheetsVentas}
          loadingZazu={loadingZazu}
          zazuEnvios={zazuEnvios}
          fmtDate={fmtDate}
          expandedTicket={expandedTicket}
          editingNote={editingNote}
          editingSolucion={editingSolucion}
          onToggleTicket={id => setExpandedTicket(prev => prev === id ? null : id)}
          changeEstado={changeEstado}
          changeEstadoPedido={changeEstadoPedido}
          onStartEditCustomerNote={id => setEditingNote({ id, value: customerTickets.find(t => t.id === id)?.notas ?? '' })}
          onStartEditCustomerSolucion={id => setEditingSolucion({ id, value: customerTickets.find(t => t.id === id)?.solucion ?? '' })}
          onStartEditFilteredNote={id => setEditingNote({ id, value: filteredTickets.find(t => t.id === id)?.notas ?? '' })}
          onStartEditFilteredSolucion={id => setEditingSolucion({ id, value: filteredTickets.find(t => t.id === id)?.solucion ?? '' })}
          saveNote={saveNote}
          saveSolucion={saveSolucion}
          onCancelNote={() => setEditingNote(null)}
          onNoteChange={val => setEditingNote(prev => prev ? { ...prev, value: val } : null)}
          onCancelSolucion={() => setEditingSolucion(null)}
          onSolucionChange={val => setEditingSolucion(prev => prev ? { ...prev, value: val } : null)}
          removeTicket={removeTicket}
          onBulkEstado={bulkChangeEstado}
          onBulkUpdate={bulkUpdateTickets}
          filteredTickets={filteredTickets}
          loadTickets={loadTickets}
          loadingTickets={loadingTickets}
          setTicketForm={setTicketForm}
          setShowTicketForm={setShowTicketForm}
          ZazuTabComponent={ZazuTab}
          TicketListComponent={TicketList}
          onApplyTemplate={applyTemplateToTicket}
        />
      )}

      {/* ── Modal: Nuevo ticket ── */}
      {showTicketForm && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,68,51,0.2)', backdropFilter: 'blur(2px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: '16px', width: 'min(860px, calc(100vw - 2rem))', padding: '1.25rem', boxShadow: '0 16px 48px rgba(69,131,77,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
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
                        style={{ flex: 1, padding: '0.45rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${active ? c : 'rgba(104,168,119,.24)'}`, background: active ? `${c}14` : 'rgba(242,251,245,.8)', color: active ? c : S.muted, transition: 'all 0.15s', letterSpacing: '0.02em' }}>
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
                        style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${ticketForm.region_scope === scope ? S.accent : 'rgba(104,168,119,.24)'}`, background: ticketForm.region_scope === scope ? S.accentLight : 'rgba(242,251,245,.8)', color: ticketForm.region_scope === scope ? S.accent : S.muted }}>
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
                    <div style={{ ...inputStyle, color: S.muted, lineHeight: '1.6' }}>Selecciona Lima o Provincia</div>
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
                      style={{ flex: 1, padding: '0.4rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', border: `1px solid ${ticketForm.prioridad === p ? PRIORIDAD_COLOR[p] : 'rgba(104,168,119,.24)'}`, background: ticketForm.prioridad === p ? `${PRIORIDAD_COLOR[p]}18` : 'rgba(242,251,245,.8)', color: ticketForm.prioridad === p ? PRIORIDAD_COLOR[p] : S.muted, textTransform: 'capitalize' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {ticketError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => { setShowTicketForm(false); setTicketError(null); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(104,168,119,.28)', background: 'rgba(242,251,245,.9)', color: S.muted }}>Cancelar</button>
              <button onClick={submitTicket} disabled={savingTicket}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: savingTicket ? 'default' : 'pointer', border: 'none', background: ATC_GRADIENTS.accentBtn, color: '#fff', opacity: savingTicket ? 0.7 : 1 }}>
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
  const isInline = Boolean(inline);
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
  const [tipoResp, setTipoResp] = useState('');
  const [editTipoResp, setEditTipoResp] = useState('');

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
      setTipoResp('');
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
    const respName = r.responsable ?? '';
    const respGroup = responsablesGrouped?.find(g => g.items.includes(respName))?.group ?? '';
    setEditTipoResp(respGroup);
    setEditForm({ fecha: r.fecha, nota_venta: r.nota_venta ?? '', dni: r.dni ?? '', telefono: r.telefono ?? '', nombre_cliente: r.nombre_cliente, descripcion: r.descripcion, descuento: String(r.descuento), responsable: respName });
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
      setEditTipoResp('');
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
    <div style={{
      background: isInline ? 'transparent' : '#fff',
      borderRadius: isInline ? '0' : '16px',
      width: '100%',
      maxWidth: isInline ? '100%' : '1050px',
      maxHeight: isInline ? 'none' : '92vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isInline ? 'none' : '0 24px 80px rgba(0,0,0,0.2)',
      border: isInline ? 'none' : 'none',
    }}>

        {/* Sticky header */}
        <div style={{
          padding: isInline ? '0.35rem 0 0.95rem' : '1rem 1.5rem',
          borderBottom: isInline ? '1px solid rgba(148,163,184,.16)' : '1px solid rgba(139,92,246,.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Percent size={16} color="#8b5cf6" />
            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1a2e38' }}>Descuentos ATC</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(139,92,246,.1)', color: '#8b5cf6', borderRadius: '5px', padding: '0.1rem 0.5rem' }}>{filtered.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input value={filterNom} onChange={e => setFilterNom(e.target.value)} placeholder="Buscar cliente / cel / DNI..." style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(139,92,246,.25)', borderRadius: '7px', fontSize: '0.78rem', color: isInline ? '#e2e8f0' : '#1a2e38', background: isInline ? 'rgba(15,23,42,.55)' : '#f8f5ff', outline: 'none', width: '210px' }} />
            <select value={filterResp} onChange={e => setFilterResp(e.target.value)} style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(139,92,246,.25)', borderRadius: '7px', fontSize: '0.78rem', color: isInline ? '#e2e8f0' : '#1a2e38', background: isInline ? 'rgba(15,23,42,.55)' : '#fff', cursor: 'pointer' }}>
              <option value="">Todos los responsables</option>
              {renderRespOptions(false)}
            </select>
            <button onClick={() => { setShowForm(f => !f); setForm(emptyDesc()); clearCust(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff' }}>
              <Plus size={13} /> Nuevo
            </button>
            {!isInline && (
              <button onClick={onClose} style={{ padding: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
            )}
          </div>
        </div>

        {/* Formulario nuevo */}
        {showForm && (
          <div style={{
            padding: isInline ? '1rem 0' : '1rem 1.5rem',
            borderBottom: '1px solid rgba(139,92,246,.12)',
            background: isInline ? 'rgba(15,23,42,.45)' : 'rgba(139,92,246,.03)',
            borderRadius: isInline ? '12px' : '0',
            border: isInline ? '1px solid rgba(148,163,184,.18)' : 'none',
            flexShrink: 0,
          }}>

            {/* Fila 1: Fecha + Buscador de cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} style={inp} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Buscar Cliente (cel / nombre / DNI) *
                  {selectedCust && <button onClick={clearCust} style={{ marginLeft: '0.5rem', fontSize: '0.6rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><X size={10} /> Cambiar</button>}
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
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Tipo Responsable</label>
                <select value={tipoResp} onChange={e => { setTipoResp(e.target.value); setForm(p => ({ ...p, responsable: '' })); }} style={inp}>
                  <option value="">— Seleccionar —</option>
                  {responsablesGrouped?.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                </select>
              </div>
              {tipoResp && (
                <div>
                  <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3d6070', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Responsable</label>
                  <select value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} style={inp}>
                    <option value="">— Seleccionar —</option>
                    {responsablesGrouped?.find(g => g.group === tipoResp)?.items.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
            </div>

            {saveError && (
              <div style={{ padding: '0.45rem 0.7rem', borderRadius: '7px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {saveError}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => { setShowForm(false); clearCust(); setSaveError(null); setTipoResp(''); }} style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(0,0,0,.12)', background: 'transparent', color: '#888' }}>Cancelar</button>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <select value={editTipoResp} onChange={e => { setEditTipoResp(e.target.value); setEditForm(p => ({ ...p, responsable: '' })); }} style={{ ...inp, fontSize: '0.68rem' }}>
                          <option value="">— Tipo —</option>
                          {responsablesGrouped?.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                        </select>
                        {editTipoResp && (
                          <select value={editForm.responsable} onChange={e => setEditForm(p => ({ ...p, responsable: e.target.value }))} style={{ ...inp, fontSize: '0.68rem' }}>
                            <option value="">— Quién —</option>
                            {responsablesGrouped?.find(g => g.group === editTipoResp)?.items.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => saveEdit(r.id!)} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}><Check size={11} /></button>
                        <button onClick={() => { setEditingId(null); setEditTipoResp(''); }} style={{ padding: '0.3rem 0.55rem', borderRadius: '5px', border: '1px solid #ccc', background: 'transparent', color: '#888', cursor: 'pointer' }}><X size={11} /></button>
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
                        <span style={{ color: isExpanded ? '#8b5cf6' : '#94a3b8', transition: 'transform 0.2s', display: 'inline-flex', transform: isExpanded ? 'rotate(90deg)' : 'none' }}><ChevronRight size={12} /></span>
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
          <div style={{ padding: isInline ? '0.85rem 0.25rem 0' : '0.75rem 1.5rem', borderTop: '1px solid rgba(139,92,246,.12)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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

function MetricsModal({ tickets, onClose, inline = false }: { tickets: ATCTicket[]; onClose: () => void; inline?: boolean }) {
  const isInline = inline;
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

  const panelContent = (
    <div style={{
      background: isInline ? 'transparent' : '#fff',
      borderRadius: isInline ? '0' : '16px',
      width: '100%',
      maxWidth: isInline ? '100%' : '980px',
      overflow: 'hidden',
      boxShadow: isInline ? 'none' : '0 24px 80px rgba(0,0,0,0.2)',
      border: isInline ? 'none' : '1px solid rgba(26,127,189,.12)',
    }}>

        {/* Header */}
        <div style={{
          padding: isInline ? '0.35rem 0 0.95rem' : '1.1rem 1.5rem',
          borderBottom: '1px solid rgba(26,127,189,.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: isInline ? 'static' : 'sticky',
          top: 0,
          background: isInline ? 'transparent' : '#fff',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BarChart2 size={16} color="#1a7fbd" />
            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1a2e38' }}>Métricas ATC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <select value={month} onChange={e => setMonth(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1px solid rgba(26,127,189,.25)', fontSize: '0.78rem', color: '#1a2e38', background: '#fff', cursor: 'pointer' }}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {!isInline && (
              <button onClick={onClose} style={{ padding: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
            )}
          </div>
        </div>

        <div style={{ padding: isInline ? '1.1rem 0' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
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
                    <div style={{ flex: 1, minWidth: '120px', height: '11px', background: 'rgba(26,127,189,.1)', borderRadius: '4px', overflow: 'hidden' }}>
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
  );

  if (inline) return panelContent;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      {panelContent}
    </div>
  );
}

// ── Reporte Section ───────────────────────────────────────────────────────────

const TICKET_COLS: { label: string; key: keyof ATCTicket | '_fecha' }[] = [
  { label: 'FECHA',           key: 'fecha_atencion' },
  { label: 'NTV',             key: 'ntv' },
  { label: 'F.EMISION',       key: 'fecha_emision' },
  { label: 'F.VENTA',         key: 'fecha_venta' },
  { label: 'CEL.',            key: 'cliente_cel' },
  { label: 'CLIENTE',         key: 'cliente_nom' },
  { label: 'REGION',          key: 'region' },
  { label: 'RESPONSABLE',     key: 'responsable' },
  { label: 'MOTIVO',          key: 'asunto' },
  { label: 'SOLICITUD',       key: 'solicitud' },
  { label: 'DESCRIPCION',     key: 'descripcion' },
  { label: 'SOLUCION',        key: 'solucion' },
  { label: 'ESTADO',          key: 'estado' },
  { label: 'ESTADO DEL PEDIDO', key: 'estado_pedido' },
];

const DESC_COLS: { label: string; key: keyof ATCDescuento }[] = [
  { label: 'FECHA',             key: 'fecha' },
  { label: 'NOTA DE VENTA',     key: 'nota_venta' },
  { label: 'DNI',               key: 'dni' },
  { label: 'TELEFONO',          key: 'telefono' },
  { label: 'NOMBRE DEL CLIENTE',key: 'nombre_cliente' },
  { label: 'DESCRIPCION',       key: 'descripcion' },
  { label: 'DESCUENTO',         key: 'descuento' },
  { label: 'RESPONSABLE',       key: 'responsable' },
];

function ticketToXLSXRow(t: ATCTicket) {
  return {
    'FECHA': t.fecha_atencion ?? '', 'NTV': t.ntv ?? '',
    'F.EMISION': t.fecha_emision ?? '', 'F.VENTA': t.fecha_venta ?? '',
    'CEL.': t.cliente_cel, 'CLIENTE': t.cliente_nom,
    'REGION': t.region ?? '', 'RESPONSABLE': t.responsable ?? '',
    'MOTIVO': t.asunto, 'SOLICITUD': t.solicitud ?? '',
    'DESCRIPCION': t.descripcion, 'SOLUCION': t.solucion ?? '',
    'ESTADO': t.estado, 'ESTADO DEL PEDIDO': t.estado_pedido ?? '',
  };
}

function descToXLSXRow(d: ATCDescuento) {
  return {
    'FECHA': d.fecha, 'NOTA DE VENTA': d.nota_venta ?? '',
    'DNI': d.dni ?? '', 'TELEFONO': d.telefono ?? '',
    'NOMBRE DEL CLIENTE': d.nombre_cliente,
    'DESCRIPCION': d.descripcion,
    'DESCUENTO': d.descuento, 'RESPONSABLE': d.responsable ?? '',
  };
}

function buildPrintTable(title: string, headers: string[], rows: string[][], accent: string) {
  const ths = headers.map(h => `<th>${h}</th>`).join('');
  const trs = rows.map(r =>
    `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
  ).join('');
  return `
    <h2 style="font-size:13px;font-weight:900;color:${accent};margin:18px 0 8px;letter-spacing:.03em">${title}</h2>
    <div style="overflow-x:auto">
    <table>
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
    </div>`;
}

function ReporteSection({ tickets }: { tickets: ATCTicket[] }) {
  const [descuentos, setDescuentos] = useState<ATCDescuento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getATCDescuentos().then(d => { setDescuentos(d); setLoading(false); });
  }, []);

  const exportXLSX = (which: 'tickets' | 'descuentos' | 'ambos') => {
    const wb = XLSX.utils.book_new();
    if (which !== 'descuentos')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tickets.map(ticketToXLSXRow)), 'ATC Tickets');
    if (which !== 'tickets')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(descuentos.map(descToXLSXRow)), 'Descuentos');
    const name = which === 'tickets' ? 'ATC_Tickets' : which === 'descuentos' ? 'ATC_Descuentos' : 'ATC_Reporte';
    XLSX.writeFile(wb, `${name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = (which: 'tickets' | 'descuentos' | 'ambos') => {
    const now = new Date().toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
    let body = '';
    if (which !== 'descuentos') {
      const rows = tickets.map(t => TICKET_COLS.map(c => String((t as unknown as Record<string, unknown>)[c.key as string] ?? '')));
      body += buildPrintTable('ATC Tickets', TICKET_COLS.map(c => c.label), rows, '#1a7fbd');
    }
    if (which !== 'tickets') {
      const rows = descuentos.map(d => DESC_COLS.map(c => String((d as unknown as Record<string, unknown>)[c.key] ?? '')));
      body += buildPrintTable('Descuentos ATC', DESC_COLS.map(c => c.label), rows, '#8b5cf6');
    }
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>ATC Reporte</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2e38;padding:24px 28px;font-size:11px}
  .hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a7fbd;padding-bottom:10px;margin-bottom:4px}
  .hdr-brand{display:flex;align-items:center;gap:10px}
  .hdr-logo{width:40px;height:40px;object-fit:contain;border-radius:8px}
  .hdr-title{font-size:16px;font-weight:900;color:#1a2e38}.hdr-title span{color:#1a7fbd}
  .hdr-date{font-size:10px;color:#6b8fa3;text-align:right}
  table{width:100%;border-collapse:collapse;font-size:9px;margin-bottom:8px}
  thead tr{background:#1a7fbd;color:#fff}
  thead th{padding:5px 6px;text-align:left;font-weight:800;font-size:8.5px;white-space:nowrap}
  tbody tr:nth-child(even){background:#f8fafc}
  tbody td{padding:4px 6px;border-bottom:1px solid #e8f0f4;white-space:nowrap}
  @media print{body{padding:14px 18px}@page{size:A4 landscape;margin:12mm}}
</style></head><body>
<div class="hdr">
  <div class="hdr-brand">
    <img src="${atcLogo}" class="hdr-logo" alt="ATC"/>
    <div><div class="hdr-title">LIVEX <span>ATC</span></div><div style="font-size:9px;color:#6b8fa3">Atención al Cliente</div></div>
  </div>
  <div class="hdr-date">Generado el ${now}</div>
</div>
${body}
<script>window.onload=()=>window.print()</script>
</body></html>`;
    const win = window.open('', '_blank', 'width=1100,height=800');
    if (win) { win.document.open(); win.document.write(html); win.document.close(); }
  };

  const thS: React.CSSProperties = { padding: '0.45rem 0.7rem', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', background: '#1a7fbd', color: '#fff', textAlign: 'left', position: 'sticky', top: 0 };
  const tdS: React.CSSProperties = { padding: '0.38rem 0.7rem', fontSize: '0.75rem', color: '#1a2e38', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(26,127,189,.08)' };
  const thSp: React.CSSProperties = { ...thS, background: '#8b5cf6' };
  const tdSp: React.CSSProperties = { ...tdS };

  const btnXlsx = (label: string, which: 'tickets' | 'descuentos' | 'ambos') => (
    <button onClick={() => exportXLSX(which)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)', color: '#16a34a' }}>
      <Download size={13} /> {label}
    </button>
  );
  const btnPdf = (label: string, which: 'tickets' | 'descuentos' | 'ambos') => (
    <button onClick={() => exportPDF(which)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.07)', color: '#ef4444' }}>
      <Printer size={13} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ATC Tickets */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(26,127,189,.18)', boxShadow: '0 2px 12px rgba(26,127,189,.07)', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.2rem', borderBottom: '1px solid rgba(26,127,189,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Tag size={15} color="#1a7fbd" />
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1a2e38' }}>ATC Tickets</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(26,127,189,.1)', color: '#1a7fbd', borderRadius: '5px', padding: '0.1rem 0.5rem' }}>{tickets.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {btnXlsx('Excel', 'tickets')}
            {btnPdf('PDF', 'tickets')}
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{TICKET_COLS.map(c => <th key={c.label} style={thS}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr key={t.id ?? i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(26,127,189,.03)' }}>
                  {TICKET_COLS.map(c => <td key={c.label} style={tdS}>{String((t as unknown as Record<string, unknown>)[c.key as string] ?? '')}</td>)}
                </tr>
              ))}
              {tickets.length === 0 && <tr><td colSpan={TICKET_COLS.length} style={{ ...tdS, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Descuentos */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(139,92,246,.18)', boxShadow: '0 2px 12px rgba(139,92,246,.07)', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.2rem', borderBottom: '1px solid rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Percent size={15} color="#8b5cf6" />
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1a2e38' }}>Descuentos</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(139,92,246,.1)', color: '#8b5cf6', borderRadius: '5px', padding: '0.1rem 0.5rem' }}>{loading ? '…' : descuentos.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {btnXlsx('Excel', 'descuentos')}
            {btnPdf('PDF', 'descuentos')}
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>Cargando...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{DESC_COLS.map(c => <th key={c.label} style={thSp}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {descuentos.map((d, i) => (
                  <tr key={d.id ?? i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(139,92,246,.03)' }}>
                    {DESC_COLS.map(c => <td key={c.label} style={tdSp}>{String((d as unknown as Record<string, unknown>)[c.key] ?? '')}</td>)}
                  </tr>
                ))}
                {descuentos.length === 0 && <tr><td colSpan={DESC_COLS.length} style={{ ...tdSp, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Sin registros</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Exportar ambos */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
        {btnXlsx('Exportar todo (Excel)', 'ambos')}
        {btnPdf('Exportar todo (PDF)', 'ambos')}
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
  .brand-block { display: flex; align-items: center; gap: 12px; }
  .brand-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 10px; }
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
  <div class="brand-block">
    <img src="${atcLogo}" class="brand-logo" alt="ATC" />
    <div>
      <div class="brand">LIVEX <span>ATC</span></div>
      <div style="font-size:10px;color:#6b8fa3;margin-top:2px">Atención al Cliente</div>
    </div>
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
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
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
  onApplyTemplate: (id: string, template: string) => void;
  emptyMsg: string;
  S: Record<string, string>;
}

function TicketList({ tickets, selectedIds, onToggleSelect, expandedTicket, editingNote, editingSolucion, onToggle, onChangeEstado, onChangeEstadoPedido, onEditNote, onSaveNote, onCancelNote, onNoteChange, onEditSolucion, onSaveSolucion, onCancelSolucion, onSolucionChange, onDelete, onApplyTemplate, emptyMsg, S }: TicketListProps) {
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

  const SOLUCION_TEMPLATES: { key: string; label: string; text: string }[] = [
    {
      key: 'seguimiento',
      label: 'Seguimiento',
      text: 'Se contactó al cliente para seguimiento del caso. Se explicó estado actual y próximos pasos.',
    },
    {
      key: 'envio',
      label: 'Incidencia envío',
      text: 'Se validó estado de envío con courier. Se coordinó regularización y nueva actualización al cliente.',
    },
    {
      key: 'postventa',
      label: 'Postventa',
      text: 'Se realizó contacto postventa para confirmar conformidad y cierre de atención.',
    },
  ];

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
              <input
                type="checkbox"
                checked={Boolean(t.id && selectedIds?.has(t.id))}
                onChange={() => t.id && onToggleSelect?.(t.id)}
                onClick={e => e.stopPropagation()}
                style={{ width: '14px', height: '14px', accentColor: '#45834D', cursor: 'pointer' }}
              />
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
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {SOLUCION_TEMPLATES.map(tmp => (
                      <button
                        key={tmp.key}
                        onClick={() => onApplyTemplate(t.id!, tmp.text)}
                        style={{ padding: '0.22rem 0.55rem', borderRadius: '999px', fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'rgba(69,131,77,.12)', color: '#45834D' }}
                      >
                        + {tmp.label}
                      </button>
                    ))}
                  </div>
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
