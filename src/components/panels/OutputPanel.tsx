import React, { useState, useEffect } from 'react';
import { ClipboardList, Copy, Check, PackagePlus, Lock, Eye, EyeOff } from 'lucide-react';

function renderWAText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*[^*]+\*)/g);
    const isSection = /^-\s.+\s-$/.test(line.trim());
    return (
      <React.Fragment key={i}>
        {isSection ? (
          <span className="output-section-label">
            {line.trim().replace(/^-\s/, '').replace(/\s-$/, '')}
          </span>
        ) : (
          parts.map((part, j) =>
            /^\*[^*]+\*$/.test(part)
              ? <strong key={j}>{part.slice(1, -1)}</strong>
              : <span key={j}>{part}</span>
          )
        )}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function OutputPanel({
  outputText,
  onAddSale,
  clientCelular,
  clientNombre,
}: {
  outputText: string;
  onAddSale: () => void;
  clientCelular?: string;
  clientNombre?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setRegistered(false);
  }, [outputText]);

  const canRegister = !!(clientCelular?.trim() || clientNombre?.trim());

  const handleCopy = () => {
    if (!registered) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = outputText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddSale = () => {
    if (!canRegister) return;
    onAddSale();
    setAdded(true);
    setRegistered(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!registered) return;
    const cel = (clientCelular || '').replace(/\D/g, '');
    const num = cel.length >= 9 ? `51${cel}` : '';
    const text = encodeURIComponent(outputText);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  const lockedStyle = (active: boolean): React.CSSProperties => ({
    opacity: active ? 1 : 0.4,
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
  });

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={18} /> Resumen del pedido
        </h2>
        {outputText.trim() && (
          <button
            onClick={() => setShowRaw(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.35rem 0.75rem',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            {showRaw ? <><EyeOff size={13} /> Preview</> : <><Eye size={13} /> Raw</>}
          </button>
        )}
      </div>

      {showRaw ? (
        <textarea
          value={outputText}
          readOnly
          spellCheck={false}
          style={{ width: '100%', minHeight: '220px' }}
        />
      ) : (
        <div className="output-preview">
          {outputText.trim()
            ? renderWAText(outputText)
            : (
              <div className="output-empty">
                <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}><ClipboardList size={26} /></div>
                <div>El resumen aparecerá aquí una vez que completes los datos del pedido</div>
              </div>
            )
          }
        </div>
      )}

      <div className="actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>

        <button
          className="btn btn-primary"
          onClick={handleCopy}
          disabled={!registered}
          title={!registered ? 'Registra la venta primero' : undefined}
          style={{ flex: 1, minWidth: '130px', ...lockedStyle(registered) }}
        >
          {copied
            ? <><Check size={16} /> ¡Copiado!</>
            : !registered
              ? <><Lock size={15} /> Copiar</>
              : <><Copy size={16} /> Copiar</>}
        </button>

        <button
          onClick={handleWhatsApp}
          disabled={!registered}
          title={!registered ? 'Registra la venta primero' : undefined}
          style={{
            flex: 1, minWidth: '130px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontFamily: 'inherit',
            fontSize: '0.9rem', fontWeight: 700,
            background: registered
              ? 'linear-gradient(135deg, #25d366, #128c3e)'
              : 'linear-gradient(135deg, #1c2e21, #121e17)',
            color: registered ? '#fff' : '#3a6645',
            boxShadow: registered ? '0 4px 12px rgba(37,211,102,0.3)' : 'none',
            ...lockedStyle(registered),
          }}
        >
          {!registered
            ? <><Lock size={15} /> WhatsApp</>
            : <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </>}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleAddSale}
          disabled={!canRegister}
          title={!canRegister ? 'Ingresa nombre o celular primero' : undefined}
          style={{
            flex: 1, minWidth: '130px',
            background: added ? 'linear-gradient(135deg, #16a34a, #15803d)' : undefined,
            ...lockedStyle(canRegister),
          }}
        >
          {added ? <><Check size={16} /> ¡Guardado!</> : <><PackagePlus size={16} /> Registrar venta</>}
        </button>
      </div>

      {!registered && canRegister && outputText.trim() && (
        <p style={{
          marginTop: '0.5rem', fontSize: '0.73rem', color: 'var(--muted)',
          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
        }}>
          <Lock size={11} /> Registra la venta para habilitar Copiar y WhatsApp
        </p>
      )}
    </div>
  );
}
