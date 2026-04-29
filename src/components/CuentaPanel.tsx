import React from 'react';

export default function CuentaPanel({ data, onChange }: any) {
  return (
    <div className="panel always" id="panel-cuenta" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2>Cuenta</h2>
      </div>

      <div className="cuenta-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem', marginTop: '1rem' }}>
        <div className="cuenta-caja" style={{ background: '#0d151c', border: '1px solid #1a2733', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="cuenta-caja-titulo" style={{ background: 'var(--accent)', color: '#fff', fontWeight: '800', textAlign: 'center', padding: '0.65rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>PAGO</div>
          <div className="cuenta-caja-cuerpo" style={{ padding: '1rem' }}>
            <div className="cuenta-options" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <label className="choice" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="cuenta-tipo" value="contra" checked={data.tipo === 'contra'} onChange={(e) => onChange('tipo', e.target.value)} />
                <span>Contra entrega</span>
              </label>
              <label className="choice" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="cuenta-tipo" value="completo" checked={data.tipo === 'completo'} onChange={(e) => onChange('tipo', e.target.value)} />
                <span>Pago completo</span>
              </label>
              <label className="choice" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="cuenta-tipo" value="yape" checked={data.tipo === 'yape'} onChange={(e) => onChange('tipo', e.target.value)} />
                <span>Yape Import Textil</span>
              </label>
            </div>
            <label className="form-label uppercase font-bold text-[#638d99] text-[0.75rem] tracking-widest block mb-2 mt-4">CUÁNTO PAGÓ</label>
            <input value={data.pago} onChange={e => onChange('pago', e.target.value)} placeholder="Ej. 30 o S/ 30" className="form-input" />
          </div>
        </div>

        <div className="cuenta-caja" style={{ background: '#0d151c', border: '1px solid #1a2733', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="cuenta-caja-titulo" style={{ background: 'var(--accent)', color: '#fff', fontWeight: '800', textAlign: 'center', padding: '0.65rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>DEBE</div>
          <div className="cuenta-caja-cuerpo" style={{ padding: '1rem' }}>
            <label className="form-label uppercase font-bold text-[#638d99] text-[0.75rem] tracking-widest block mb-2" style={{ marginTop: '0' }}>CUÁNTO DEBE</label>
            <input value={data.debe} onChange={e => onChange('debe', e.target.value)} placeholder="Ej. 120, 89.90 o S/ 150" className="form-input" />
          </div>
        </div>
      </div>
    </div>
  );
}
