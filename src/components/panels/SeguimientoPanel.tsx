import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Phone, Trash2, CheckCircle, XCircle, MessageCircle, Circle, Smartphone, FileText, Timer } from 'lucide-react';

interface ClienteSeg {
  id: string; nombre: string; celular: string; producto: string; monto: number;
  estado: 'pendiente' | 'confirmado' | 'perdido'; timestamp: number; nota: string;
}

const LS_KEY = 'overshark_seguimiento';
const load = (): ClienteSeg[] => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const save = (d: ClienteSeg[]) => localStorage.setItem(LS_KEY, JSON.stringify(d));

export default function SeguimientoPanel() {
  const [clientes, setClientes] = useState<ClienteSeg[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', celular: '', producto: '', monto: '', nota: '' });
  const [now, setNow] = useState(Date.now());

  useEffect(() => { save(clientes); }, [clientes]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);

  const addCliente = () => {
    if (!form.nombre && !form.celular) return;
    setClientes(prev => [...prev, { id: Date.now().toString(), nombre: form.nombre, celular: form.celular, producto: form.producto, monto: Number(form.monto) || 0, estado: 'pendiente', timestamp: Date.now(), nota: form.nota }]);
    setForm({ nombre: '', celular: '', producto: '', monto: '', nota: '' });
    setShowForm(false);
  };

  const updateEstado = (id: string, estado: ClienteSeg['estado']) => setClientes(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  const removeCliente = (id: string) => setClientes(prev => prev.filter(c => c.id !== id));

  const tiempoStr = (ts: number) => {
    const mins = Math.floor((now - ts) / 60000);
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ${mins % 60}m`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

  const pendientes = clientes.filter(c => c.estado === 'pendiente');
  const otros = clientes.filter(c => c.estado !== 'pendiente');
  const estadoColors: Record<string, string> = { pendiente: '250,204,21', confirmado: '0,230,150', perdido: '239,68,68' };
  const estadoIcon: Record<string, React.ReactNode> = {
    pendiente: <Circle size={12} fill="#facc15" color="#facc15" />,
    confirmado: <Circle size={12} fill="#10b981" color="#10b981" />,
    perdido: <Circle size={12} fill="#ef4444" color="#ef4444" />,
  };

  return (
    <div className="panel always" style={{ marginTop: '2rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <UserCheck size={20} /> Seguimiento de Clientes
          {pendientes.length > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(250,204,21,0.2)', color: '#facc15', padding: '0.15rem 0.55rem', borderRadius: '50px', border: '1px solid rgba(250,204,21,0.3)' }}>{pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}</span>}
        </h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ borderRadius: '50px', padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
          + Agregar cliente
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(242,251,245,0.9)', border: '1px solid rgba(104,168,119,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 140px' }}>
            <div className="pc-lbl">Nombre</div>
            <input className="form-input" placeholder="Cliente..." value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} style={{ padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <div className="pc-lbl">Celular</div>
            <input className="form-input" placeholder="9XXXXXXXX" value={form.celular} onChange={e => setForm(p => ({ ...p, celular: e.target.value }))} style={{ padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <div className="pc-lbl">Producto</div>
            <input className="form-input" placeholder="Ej: 5 Clásicos" value={form.producto} onChange={e => setForm(p => ({ ...p, producto: e.target.value }))} style={{ padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
          </div>
          <div style={{ flex: '0 1 80px' }}>
            <div className="pc-lbl">Monto</div>
            <input className="form-input" placeholder="S/" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} style={{ padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
          </div>
          <div style={{ flex: '2 1 180px' }}>
            <div className="pc-lbl">Nota</div>
            <input className="form-input" placeholder="Ej: Quiere azul y negro..." value={form.nota} onChange={e => setForm(p => ({ ...p, nota: e.target.value }))} style={{ padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
          </div>
          <button className="btn btn-primary" onClick={addCliente} style={{ borderRadius: '8px', padding: '0.5rem 1.2rem', fontSize: '0.85rem', height: 'fit-content' }}>Guardar</button>
        </div>
      )}

      {clientes.length === 0 && (
        <div className="prod-empty" style={{ marginTop: '0.5rem' }}>
          <Clock size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} /><br />
          Sin clientes en seguimiento
        </div>
      )}

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: otros.length > 0 ? '1rem' : 0 }}>
          {pendientes.map(c => {
            const mins = Math.floor((now - c.timestamp) / 60000);
            const urgente = mins > 60;
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
                background: urgente ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.03))' : 'linear-gradient(135deg,rgba(250,204,21,0.06),rgba(250,204,21,0.02))',
                border: `1.5px solid ${urgente ? 'rgba(239,68,68,0.25)' : 'rgba(250,204,21,0.2)'}`,
                borderRadius: '12px', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                  {urgente
                    ? <Circle size={12} fill="#ef4444" color="#ef4444" />
                    : <Circle size={12} fill="#facc15" color="#facc15" />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text2)' }}>{c.nombre || 'Sin nombre'}</span>
                    {c.celular && <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Smartphone size={11} /> {c.celular}</span>}
                    {c.producto && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '50px', background: 'rgba(69,131,77,0.1)', border: '1px solid rgba(104,168,119,0.3)', color: 'var(--accent)' }}>{c.producto}</span>}
                    {c.monto > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#45834D' }}>S/{c.monto}</span>}
                  </div>
                  {c.nota && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={11} /> {c.nota}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: urgente ? '#ef4444' : '#facc15', marginRight: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Timer size={11} /> {tiempoStr(c.timestamp)}</span>
                  {c.celular && (
                    <a href={`https://wa.me/51${c.celular}`} target="_blank" rel="noopener noreferrer" style={{ width: '1.8rem', height: '1.8rem', borderRadius: '6px', background: 'rgba(69,131,77,0.12)', border: '1px solid rgba(104,168,119,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45834D', textDecoration: 'none' }} title="WhatsApp">
                      <MessageCircle size={12} />
                    </a>
                  )}
                  <button onClick={() => updateEstado(c.id, 'confirmado')} style={{ width: '1.8rem', height: '1.8rem', borderRadius: '6px', background: 'rgba(69,131,77,0.1)', border: '1px solid rgba(104,168,119,0.3)', color: '#45834D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Confirmar"><CheckCircle size={12} /></button>
                  <button onClick={() => updateEstado(c.id, 'perdido')} style={{ width: '1.8rem', height: '1.8rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Perdido"><XCircle size={12} /></button>
                  <button onClick={() => removeCliente(c.id)} style={{ width: '1.8rem', height: '1.8rem', borderRadius: '6px', background: 'rgba(104,168,119,0.1)', border: '1px solid rgba(104,168,119,0.25)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar"><Trash2 size={11} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial */}
      {otros.length > 0 && (
        <>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Historial</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {otros.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(242,251,245,0.6)', border: '1px solid rgba(104,168,119,0.2)', borderRadius: '8px', opacity: 0.7 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{estadoIcon[c.estado]}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text2)', flex: 1 }}>{c.nombre || 'Sin nombre'}</span>
                {c.producto && <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{c.producto}</span>}
                {c.monto > 0 && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: `rgb(${estadoColors[c.estado]})` }}>S/{c.monto}</span>}
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: `rgb(${estadoColors[c.estado]})`, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  {c.estado === 'confirmado'
                    ? <><CheckCircle size={12} /> Confirmado</>
                    : <><XCircle size={12} /> Perdido</>}
                </span>
                <button onClick={() => removeCliente(c.id)} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '5px', background: 'transparent', border: '1px solid rgba(104,168,119,0.3)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
