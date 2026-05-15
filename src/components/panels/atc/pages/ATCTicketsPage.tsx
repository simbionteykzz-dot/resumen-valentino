import { useState } from 'react';
import { Search, ChevronRight, Phone, CreditCard, Plus, X, ShoppingBag, Tag, Table2, Truck, RotateCcw } from 'lucide-react';
import type { ATCTicket, CustomerBasic, VentaDB, SheetsVentaDB } from '../../../../lib/supabase';
import type { ZazuEnvio } from '../../../../lib/zazuSupabase';
import type { TicketFormState } from '../../ATCPanel';
import { ATC_GRADIENTS } from '../theme';

type CustomerTab = 'historial' | 'tickets' | 'sheets' | 'zazu';

type TicketListProps = {
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
};

type ZazuTabProps = {
  envios: ZazuEnvio[];
  loading: boolean;
  S: Record<string, string>;
  onUseNtv?: (envio: ZazuEnvio) => void;
};

interface ATCTicketsPageProps {
  panelCard: React.CSSProperties;
  S: Record<string, string>;
  ESTADOS: readonly ATCTicket['estado'][];
  ESTADO_COLOR: Record<string, string>;
  ESTADO_LABEL: Record<string, string>;
  ESTADO_PEDIDO_COLOR: Record<string, string>;
  ticketEstadoFilter: ATCTicket['estado'] | 'todos';
  setTicketEstadoFilter: (value: ATCTicket['estado'] | 'todos') => void;
  allTickets: ATCTicket[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchResults: CustomerBasic[];
  searching: boolean;
  selectedCustomer: CustomerBasic | null;
  selectCustomer: (c: CustomerBasic) => void;
  setSelectedCustomer: (c: CustomerBasic | null) => void;
  loadingVentas: boolean;
  customerVentas: (VentaDB & { anulado?: boolean })[];
  totalSpent: number;
  onNewTicket: (preset?: Partial<TicketFormState>) => void;
  currentUserName: string;
  responsables: string[];
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  customerTickets: ATCTicket[];
  sheetsVentas: SheetsVentaDB[];
  loadingZazu: boolean;
  zazuEnvios: ZazuEnvio[];
  fmtDate: (s?: string) => string;
  expandedTicket: string | null;
  editingNote: { id: string; value: string } | null;
  editingSolucion: { id: string; value: string } | null;
  onToggleTicket: (id: string) => void;
  changeEstado: (id: string, estado: ATCTicket['estado']) => void;
  changeEstadoPedido: (id: string, estadoPedido: string) => void;
  onStartEditCustomerNote: (id: string) => void;
  onStartEditCustomerSolucion: (id: string) => void;
  onStartEditFilteredNote: (id: string) => void;
  onStartEditFilteredSolucion: (id: string) => void;
  saveNote: (id: string, notas: string) => Promise<void>;
  saveSolucion: (id: string, solucion: string) => Promise<void>;
  onCancelNote: () => void;
  onNoteChange: (val: string) => void;
  onCancelSolucion: () => void;
  onSolucionChange: (val: string) => void;
  removeTicket: (id: string) => void;
  onBulkEstado: (ids: string[], estado: ATCTicket['estado']) => Promise<void>;
  onBulkUpdate: (ids: string[], fields: Partial<ATCTicket>) => Promise<void>;
  filteredTickets: ATCTicket[];
  loadTickets: () => Promise<void>;
  loadingTickets: boolean;
  setTicketForm: React.Dispatch<React.SetStateAction<TicketFormState>>;
  setShowTicketForm: React.Dispatch<React.SetStateAction<boolean>>;
  ZazuTabComponent: React.ComponentType<ZazuTabProps>;
  TicketListComponent: React.ComponentType<TicketListProps>;
  onApplyTemplate: (id: string, template: string) => void;
}

export default function ATCTicketsPage(props: ATCTicketsPageProps) {
  const {
    panelCard, S, ESTADOS, ESTADO_COLOR, ESTADO_LABEL, ESTADO_PEDIDO_COLOR,
    ticketEstadoFilter, setTicketEstadoFilter, allTickets,
    searchQuery, setSearchQuery, searchResults, searching,
    selectedCustomer, selectCustomer, setSelectedCustomer,
    loadingVentas, customerVentas, totalSpent, onNewTicket, currentUserName, responsables,
    customerTab, setCustomerTab, customerTickets, sheetsVentas,
    loadingZazu, zazuEnvios, fmtDate, expandedTicket,
    editingNote, editingSolucion, onToggleTicket, changeEstado, changeEstadoPedido,
    onStartEditCustomerNote, onStartEditCustomerSolucion, onStartEditFilteredNote, onStartEditFilteredSolucion,
    saveNote, saveSolucion, onCancelNote, onNoteChange, onCancelSolucion, onSolucionChange,
    removeTicket, filteredTickets, loadTickets, loadingTickets,
    setTicketForm, setShowTicketForm, ZazuTabComponent, TicketListComponent, onApplyTemplate,
  } = props;

  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [bulkResponsable, setBulkResponsable] = useState('');
  const [bulkPrioridad, setBulkPrioridad] = useState<TicketFormState['prioridad'] | ''>('');
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const estadoBulkTargets: ATCTicket['estado'][] = ['en_proceso', 'resuelto', 'cerrado'];
  const mineFilteredTickets = mineOnly
    ? filteredTickets.filter(t => (t.responsable ?? '').trim().toLowerCase() === currentUserName.trim().toLowerCase())
    : filteredTickets;

  const toggleSelectTicket = (id: string) => {
    if (!id) return;
    setSelectedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectVisibleTickets = () => {
    const ids = mineFilteredTickets.map(t => t.id).filter((id): id is string => Boolean(id));
    setSelectedTicketIds(new Set(ids));
  };

  const clearSelectedTickets = () => setSelectedTicketIds(new Set());

  const handleBulkEstado = async (estado: ATCTicket['estado']) => {
    if (selectedCustomer) return;
    const ids = Array.from(selectedTicketIds).filter(id => mineFilteredTickets.some(t => t.id === id));
    if (ids.length === 0) return;
    setBulkUpdating(true);
    await props.onBulkEstado(ids, estado);
    setBulkUpdating(false);
    clearSelectedTickets();
  };

  const applyAdvancedBulk = async () => {
    const ids = Array.from(selectedTicketIds).filter(id => mineFilteredTickets.some(t => t.id === id));
    if (ids.length === 0) return;
    const patch: Partial<ATCTicket> = {};
    if (bulkResponsable.trim()) patch.responsable = bulkResponsable.trim();
    if (bulkPrioridad) patch.prioridad = bulkPrioridad;
    if (Object.keys(patch).length === 0) return;
    setBulkUpdating(true);
    await props.onBulkUpdate(ids, patch);
    setBulkUpdating(false);
    clearSelectedTickets();
  };

  const openMacroTicket = (macro: 'seguimiento' | 'envio' | 'postventa') => {
    const presets: Record<typeof macro, Partial<TicketFormState>> = {
      seguimiento: {
        asunto: 'RECLAMO',
        prioridad: 'normal',
        solicitud: 'Seguimiento de caso con cliente',
      },
      envio: {
        asunto: 'CAMBIO',
        prioridad: 'alta',
        solicitud: 'Validar estado de envio y coordinar solucion',
      },
      postventa: {
        asunto: 'OTRO',
        prioridad: 'normal',
        solicitud: 'Contacto postventa para confirmar satisfaccion',
      },
    };
    onNewTicket(presets[macro]);
  };

  return (
    <div style={{ maxWidth: '1460px', margin: '0 auto', padding: '1rem 1.2rem 1.4rem', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '0.9rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.85rem' }}>
        {selectedCustomer && (
          <div style={{ ...panelCard, padding: '0.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Acciones rápidas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem' }}>
              <button onClick={() => openMacroTicket('seguimiento')} style={{ padding: '0.42rem 0.55rem', borderRadius: '8px', border: 'none', background: 'rgba(69,131,77,.12)', color: S.accent, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textAlign: 'left' }}>
                Macro: Seguimiento cliente
              </button>
              <button onClick={() => openMacroTicket('envio')} style={{ padding: '0.42rem 0.55rem', borderRadius: '8px', border: 'none', background: 'rgba(160,120,10,.12)', color: '#a0780a', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textAlign: 'left' }}>
                Macro: Incidencia de envío
              </button>
              <button onClick={() => openMacroTicket('postventa')} style={{ padding: '0.42rem 0.55rem', borderRadius: '8px', border: 'none', background: 'rgba(30,111,160,.12)', color: '#1e6fa0', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textAlign: 'left' }}>
                Macro: Contacto postventa
              </button>
            </div>
          </div>
        )}

        <div style={{ ...panelCard, padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Buscar cliente</div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: S.muted }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Celular, nombre o DNI..."
              style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', border: '1px solid rgba(104,168,119,.28)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: S.text2, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {(searchResults.length > 0 || searching) && (
          <div style={{ ...panelCard, overflow: 'hidden' }}>
            <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {searching ? 'Buscando...' : `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''}`}
            </div>
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {searchResults.map(c => (
                <button key={c.cel} onClick={() => selectCustomer(c)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: selectedCustomer?.cel === c.cel ? S.accentLight : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: selectedCustomer?.cel === c.cel ? S.accent : 'rgba(69,131,77,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: selectedCustomer?.cel === c.cel ? '#fff' : S.accent, flexShrink: 0 }}>
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

        <div style={{ ...panelCard, padding: '0.75rem' }}>
          <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bandeja</span>
            <button
              onClick={() => setMineOnly(v => !v)}
              style={{ padding: '0.28rem 0.55rem', borderRadius: '999px', border: 'none', background: mineOnly ? 'rgba(69,131,77,.16)' : 'rgba(69,131,77,.09)', color: mineOnly ? '#45834D' : S.muted, fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {mineOnly ? 'Mis tickets' : 'Todos'}
            </button>
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Filtrar tickets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {(['todos', ...ESTADOS] as const).map(e => {
              const baseList = mineOnly
                ? allTickets.filter(t => (t.responsable ?? '').trim().toLowerCase() === currentUserName.trim().toLowerCase())
                : allTickets;
              const count = e === 'todos' ? baseList.length : baseList.filter(t => t.estado === e).length;
              const color = e === 'todos' ? S.accent : ESTADO_COLOR[e];
              const isActive = ticketEstadoFilter === e;
              return (
                <button key={e} onClick={() => { setTicketEstadoFilter(e as ATCTicket['estado'] | 'todos'); setSelectedCustomer(null); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: '7px', border: `1px solid ${isActive ? color + '44' : 'transparent'}`, background: isActive ? `${color}1A` : 'transparent', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? color : S.muted }}>{e === 'todos' ? 'Todos' : ESTADO_LABEL[e]}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: `${color}20`, color, borderRadius: '4px', padding: '0.05rem 0.4rem' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        {selectedCustomer ? (
          <>
            <div style={{ ...panelCard, padding: '0.95rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ATC_GRADIENTS.accentBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
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
                      <div style={{ fontSize: '0.78rem', fontWeight: 900, color: S.success }}>S/{totalSpent.toLocaleString()}</div>
                      <div style={{ fontSize: '0.62rem', color: S.muted }}>{customerVentas.filter(v => !v.anulado).length} compras</div>
                    </div>
                  )}
                  <button onClick={() => onNewTicket()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.86rem', borderRadius: '9px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', border: 'none', background: ATC_GRADIENTS.accentBtn, color: '#fff' }}>
                    <Plus size={13} /> Nuevo ticket
                  </button>
                  <button onClick={() => setSelectedCustomer(null)}
                    style={{ display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '7px', border: 'none', background: 'rgba(69,131,77,.1)', cursor: 'pointer', color: S.muted }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {([
                  { id: 'historial' as const, Icon: ShoppingBag, text: `Historial (${customerVentas.filter(v => !v.anulado).length})` },
                  { id: 'tickets' as const, Icon: Tag, text: `Tickets (${customerTickets.length})` },
                  { id: 'sheets' as const, Icon: Table2, text: `Sheets (${sheetsVentas.length})` },
                  { id: 'zazu' as const, Icon: Truck, text: loadingZazu ? 'ZAZU...' : `ZAZU (${zazuEnvios.length})` },
                ]).map(tab => (
                  <button key={tab.id} onClick={() => setCustomerTab(tab.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.42rem 0.82rem', fontSize: '0.75rem', fontWeight: 800, border: 'none', borderBottom: customerTab === tab.id ? `2px solid ${S.accent}` : '2px solid transparent', background: customerTab === tab.id ? 'rgba(69,131,77,.12)' : 'transparent', color: customerTab === tab.id ? S.accent : S.muted, cursor: 'pointer', borderRadius: '8px 8px 0 0', marginBottom: '-1px' }}>
                    <tab.Icon size={12} />
                    {tab.text}
                  </button>
                ))}
              </div>
            </div>

            {customerTab === 'historial' && (
              <div style={{ ...panelCard, overflow: 'hidden' }}>
                {loadingVentas ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Cargando historial...</div>
                ) : customerVentas.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Sin compras registradas.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(69,131,77,.06)' }}>
                        {['Fecha', 'Marca', 'Combo', 'Total S/', 'Debe', 'Método', 'Estado'].map(h => (
                          <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customerVentas.map((v, i) => {
                        const anulado = v.anulado || v.metodo_pago === 'Anulado';
                        return (
                          <tr key={v.id ?? i} style={{ opacity: anulado ? 0.5 : 1, background: i % 2 === 0 ? 'transparent' : 'rgba(69,131,77,.04)' }}>
                            <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: S.text2 }}>{fmtDate(v.fecha)}</td>
                            <td style={{ padding: '0.5rem 0.85rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: (v.marca_label || '').toUpperCase().includes('BRV') ? 'rgba(235,115,71,.12)' : 'rgba(69,131,77,.14)', color: (v.marca_label || '').toUpperCase().includes('BRV') ? '#EB7347' : '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                                {v.marca_label || 'OVER'}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem 0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.combo || '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem', fontWeight: 900, color: S.success }}>S/{Number(v.total_total || 0).toLocaleString()}</td>
                            <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: Number(v.resta) > 0 ? '#ef4444' : S.muted }}>{Number(v.resta) > 0 ? `S/${v.resta}` : '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.metodo_pago || '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem' }}>
                              {anulado
                                ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(239,68,68,.1)', color: '#ef4444', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Anulado</span>
                                : v.separo === 'Sí'
                                  ? <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(245,158,11,.1)', color: '#f59e0b', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Separado</span>
                                  : <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(69,131,77,.14)', color: '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Pagado</span>
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
              <div style={{ ...panelCard, overflow: 'hidden' }}>
                {sheetsVentas.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>
                    Sin datos en Sheets para este cliente. Usa "Sync Sheets" para cargar.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(69,131,77,.06)' }}>
                        {['Fecha', 'Empresa', 'Vendedor', 'Región', 'Total S/', 'Estado pedido'].map(h => (
                          <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetsVentas.map((v, i) => {
                        const epColor = v.estado_pedido ? (ESTADO_PEDIDO_COLOR[v.estado_pedido] ?? '#888') : null;
                        return (
                          <tr key={v.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(69,131,77,.04)' }}>
                            <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: S.text2 }}>{v.fecha?.slice(0, 10) ?? '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(69,131,77,.14)', color: '#45834D', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                                {v.empresa || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.vendedor || '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem', color: S.muted }}>{v.lima_provincia || '—'}</td>
                            <td style={{ padding: '0.5rem 0.85rem', fontWeight: 900, color: S.success }}>
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
              <ZazuTabComponent
                envios={zazuEnvios}
                loading={loadingZazu}
                S={S}
                onUseNtv={(envio: ZazuEnvio) => {
                  const region = [envio.fuente, envio.ubicacion].filter(Boolean).join(' · ');
                  setTicketForm(p => ({ ...p, ntv: envio.ntv, region }));
                  setShowTicketForm(true);
                }}
              />
            )}

            {customerTab === 'tickets' && (
              <TicketListComponent
                tickets={customerTickets}
                expandedTicket={expandedTicket}
                editingNote={editingNote}
                editingSolucion={editingSolucion}
                onToggle={onToggleTicket}
                onChangeEstado={changeEstado}
                onChangeEstadoPedido={changeEstadoPedido}
                onEditNote={onStartEditCustomerNote}
                onSaveNote={saveNote}
                onCancelNote={onCancelNote}
                onNoteChange={onNoteChange}
                onEditSolucion={onStartEditCustomerSolucion}
                onSaveSolucion={saveSolucion}
                onCancelSolucion={onCancelSolucion}
                onSolucionChange={onSolucionChange}
                onDelete={removeTicket}
                onApplyTemplate={onApplyTemplate}
                selectedIds={selectedTicketIds}
                onToggleSelect={toggleSelectTicket}
                emptyMsg="Sin tickets para este cliente."
                S={S}
              />
            )}
          </>
        ) : (
          <div style={{ ...panelCard, overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {(ticketEstadoFilter === 'todos' ? 'Todos los tickets' : ESTADO_LABEL[ticketEstadoFilter])}{mineOnly ? ' · Mis tickets' : ''} — {mineFilteredTickets.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button onClick={selectVisibleTickets} style={{ padding: '0.32rem 0.55rem', borderRadius: '7px', border: 'none', background: 'rgba(69,131,77,.12)', color: '#45834D', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>
                  Seleccionar visibles
                </button>
                <button onClick={clearSelectedTickets} style={{ padding: '0.32rem 0.55rem', borderRadius: '7px', border: 'none', background: 'rgba(160,120,10,.12)', color: '#a0780a', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>
                  Limpiar selección
                </button>
                <button onClick={loadTickets} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: S.borderAccent, background: S.accentLight, color: S.accent }}>
                  <RotateCcw size={11} /> Actualizar
                </button>
                <select value={bulkResponsable} onChange={e => setBulkResponsable(e.target.value)} style={{ padding: '0.32rem 0.55rem', borderRadius: '7px', border: '1px solid rgba(104,168,119,.24)', background: '#fff', color: S.text2, fontSize: '0.68rem', fontWeight: 700 }}>
                  <option value="">Resp. masivo</option>
                  {responsables.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={bulkPrioridad} onChange={e => setBulkPrioridad(e.target.value as TicketFormState['prioridad'] | '')} style={{ padding: '0.32rem 0.55rem', borderRadius: '7px', border: '1px solid rgba(104,168,119,.24)', background: '#fff', color: S.text2, fontSize: '0.68rem', fontWeight: 700 }}>
                  <option value="">Prio. masiva</option>
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
                <button
                  disabled={bulkUpdating || selectedTicketIds.size === 0 || (!bulkResponsable && !bulkPrioridad)}
                  onClick={() => { void applyAdvancedBulk(); }}
                  style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', fontSize: '0.68rem', fontWeight: 800, cursor: bulkUpdating ? 'default' : 'pointer', border: 'none', background: 'rgba(30,111,160,.12)', color: '#1e6fa0', opacity: bulkUpdating || selectedTicketIds.size === 0 || (!bulkResponsable && !bulkPrioridad) ? 0.5 : 1 }}
                >
                  Aplicar a seleccionados ({selectedTicketIds.size})
                </button>
                {estadoBulkTargets.map(estado => (
                  <button
                    key={estado}
                    disabled={bulkUpdating || selectedTicketIds.size === 0}
                    onClick={() => { void handleBulkEstado(estado); }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '7px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: bulkUpdating || selectedTicketIds.size === 0 ? 'default' : 'pointer',
                      border: 'none',
                      background: `${ESTADO_COLOR[estado]}20`,
                      color: ESTADO_COLOR[estado],
                      opacity: bulkUpdating || selectedTicketIds.size === 0 ? 0.5 : 1,
                      textTransform: 'capitalize',
                    }}
                  >
                    {bulkUpdating ? 'Aplicando…' : `Masivo: ${ESTADO_LABEL[estado]}`}
                  </button>
                ))}
              </div>
            </div>
            {loadingTickets ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: S.muted, fontSize: '0.82rem' }}>Cargando...</div>
            ) : (
              <TicketListComponent
                tickets={mineFilteredTickets}
                expandedTicket={expandedTicket}
                editingNote={editingNote}
                editingSolucion={editingSolucion}
                onToggle={onToggleTicket}
                onChangeEstado={changeEstado}
                onChangeEstadoPedido={changeEstadoPedido}
                onEditNote={onStartEditFilteredNote}
                onSaveNote={saveNote}
                onCancelNote={onCancelNote}
                onNoteChange={onNoteChange}
                onEditSolucion={onStartEditFilteredSolucion}
                onSaveSolucion={saveSolucion}
                onCancelSolucion={onCancelSolucion}
                onSolucionChange={onSolucionChange}
                onDelete={removeTicket}
                onApplyTemplate={onApplyTemplate}
                selectedIds={selectedTicketIds}
                onToggleSelect={toggleSelectTicket}
                emptyMsg="No hay tickets con este estado."
                S={S}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
