import { useState, useEffect } from 'react';
import { LogIn, Loader, Mail, Lock, Eye, EyeOff, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface PlatformStats {
  totalSales: number;
  totalVendors: number;
  totalRevenue: number;
  todaySales: number;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1000    ? `${(n / 1000).toFixed(1)}k`
  : String(n);

// Decorative bar heights (visual rhythm, no data dependency)
const BAR_HEIGHTS = [35, 55, 42, 70, 60, 88, 75, 50, 65, 95, 80, 72, 58, 90];
const DAYS = ['L','M','M','J','V','S','D','L','M','M','J','V','S','D'];

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [stats, setStats]       = useState<PlatformStats | null>(null);

  useEffect(() => {
    supabase.rpc('get_platform_stats').then(({ data, error }) => {
      if (!error && data) setStats({
        totalSales:   Number(data.total_sales)   || 0,
        totalVendors: Number(data.total_vendors) || 0,
        totalRevenue: Math.round(Number(data.total_revenue) || 0),
        todaySales:   Number(data.today_sales)   || 0,
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError(null);
    const { error } = await signIn(email, password);
    if (error) setError('Correo o contraseña incorrectos');
    setLoading(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; background: #020908; }

        .lp { position: fixed; inset: 0; display: flex; font-family: inherit; }

        /* LEFT */
        .lp-left {
          flex: 0 0 58%;
          background: #020908;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }

        /* RIGHT */
        .lp-right {
          flex: 1;
          background: #040d0a;
          border-left: 1px solid rgba(111,203,184,0.12);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 2rem;
        }

        @media (max-width: 760px) { .lp-left { display: none; } }

        /* Inputs */
        .lp-field {
          width: 100%;
          background: rgba(111,203,184,0.04);
          border: 1.5px solid rgba(111,203,184,0.14);
          border-radius: 10px;
          color: #d8f0ea;
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-field::placeholder { color: rgba(106,158,144,0.4); }
        .lp-field:focus {
          border-color: rgba(111,203,184,0.5);
          box-shadow: 0 0 0 3px rgba(111,203,184,0.07);
        }

        /* Button */
        .lp-btn {
          width: 100%; padding: .85rem 1rem;
          background: linear-gradient(135deg, #6fcbb8 0%, #4a9485 55%, #2e4a3e 100%);
          color: #fff; border: none; border-radius: 10px;
          font-size: .95rem; font-weight: 800; letter-spacing: .04em;
          font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          transition: box-shadow .2s, transform .15s;
          box-shadow: 0 4px 28px rgba(111,203,184,0.28);
          position: relative; overflow: hidden;
        }
        .lp-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
        }
        .lp-btn:hover:not(:disabled) {
          box-shadow: 0 6px 36px rgba(111,203,184,0.42);
          transform: translateY(-1px);
        }
        .lp-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

        /* Animations */
        @keyframes spin    { 100% { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.8); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes slideR  { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:none; } }
        @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

        .lp-fadein  { animation: fadeUp  .55s ease both; }
        .lp-slider  { animation: slideR  .55s ease both; }

        /* Metric chip */
        .lp-chip {
          background: rgba(111,203,184,0.05);
          border: 1px solid rgba(111,203,184,0.12);
          border-radius: 12px;
          padding: .75rem 1rem;
        }

        /* Bar */
        .lp-bar {
          transform-origin: bottom;
          animation: barGrow .7s cubic-bezier(.34,1.56,.64,1) both;
        }
      `}</style>

      <div className="lp">

        {/* ══════════════════════════════
            LEFT — Dashboard preview
        ══════════════════════════════ */}
        <div className="lp-left">

          {/* Top accent stripe */}
          <div style={{
            height: '3px', flexShrink: 0,
            background: 'linear-gradient(90deg, #3a5248 0%, #6fcbb8 40%, #c0e5d8 70%, #3a5248 100%)',
          }} />

          {/* Noise/texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }} />

          {/* Big glow top-right */}
          <div style={{
            position:'absolute', top:'-200px', right:'-150px', zIndex:0,
            width:'700px', height:'700px', pointerEvents:'none',
            background:'radial-gradient(ellipse, rgba(111,203,184,0.07) 0%, transparent 60%)',
          }} />
          {/* Glow bottom-left */}
          <div style={{
            position:'absolute', bottom:'-180px', left:'-100px', zIndex:0,
            width:'500px', height:'500px', pointerEvents:'none',
            background:'radial-gradient(ellipse, rgba(58,82,72,0.12) 0%, transparent 65%)',
          }} />

          {/* Content */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'2rem 2.5rem 1.75rem', position:'relative', zIndex:1, overflow:'hidden' }}>

            {/* Top row: brand + live badge */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
                <img src="/icono.png" alt="Livex Agency" style={{
                  width:'36px', height:'36px', borderRadius:'9px',
                  objectFit:'contain', padding:'4px',
                  background:'rgba(111,203,184,0.08)',
                  border:'1px solid rgba(111,203,184,0.15)',
                }} />
                <span style={{ fontSize:'.88rem', fontWeight:900, color:'#fff', letterSpacing:'-.01em' }}>
                  LIVEX <span style={{ color:'#6fcbb8' }}>Agency</span>
                </span>
              </div>
              <div style={{
                display:'flex', alignItems:'center', gap:'.4rem',
                background:'rgba(111,203,184,0.07)',
                border:'1px solid rgba(111,203,184,0.18)',
                borderRadius:'20px', padding:'.3rem .75rem',
              }}>
                <div style={{
                  width:'6px', height:'6px', borderRadius:'50%', background:'#6fcbb8',
                  animation:'pulse 1.8s ease-in-out infinite',
                  boxShadow:'0 0 6px #6fcbb8',
                }} />
                <span style={{ fontSize:'.62rem', fontWeight:800, color:'#6fcbb8', textTransform:'uppercase', letterSpacing:'.1em' }}>En vivo</span>
              </div>
            </div>

            {/* Hero KPI */}
            <div className="lp-slider" style={{ animationDelay:'.1s', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'.62rem', fontWeight:800, color:'#4a9485', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:'.4rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
                <TrendingUp size={11} color="#4a9485" /> Ingresos totales registrados
              </div>
              <div style={{
                fontSize:'clamp(3rem,6vw,5rem)', fontWeight:900,
                letterSpacing:'-.04em', lineHeight:.95,
                background:'linear-gradient(135deg, #fff 20%, #6fcbb8 60%, #4a9485 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text',
              }}>
                S/ {stats ? fmt(stats.totalRevenue) : '···'}
              </div>
              <div style={{ fontSize:'.72rem', color:'rgba(106,158,144,0.7)', marginTop:'.4rem' }}>
                {new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
              </div>
            </div>

            {/* Bar chart */}
            <div className="lp-slider" style={{ animationDelay:'.2s', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'.6rem', fontWeight:700, color:'rgba(106,158,144,0.55)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.6rem' }}>
                Actividad últimas 2 semanas
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:'5px', height:'80px' }}>
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
                    <div
                      className="lp-bar"
                      style={{
                        animationDelay: `${.3 + i * .04}s`,
                        width:'100%',
                        height:`${h}%`,
                        borderRadius:'3px 3px 0 0',
                        background: h >= 90
                          ? 'linear-gradient(180deg, #6fcbb8, #4a9485)'
                          : h >= 65
                          ? 'rgba(111,203,184,0.4)'
                          : 'rgba(74,148,133,0.22)',
                        boxShadow: h >= 90 ? '0 0 12px rgba(111,203,184,0.35)' : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'5px', marginTop:'4px' }}>
                {DAYS.map((d, i) => (
                  <div key={i} style={{ flex:1, textAlign:'center', fontSize:'.5rem', color:'rgba(106,158,144,0.4)', fontWeight:700 }}>{d}</div>
                ))}
              </div>
            </div>

            {/* Metric chips grid */}
            <div className="lp-slider" style={{ animationDelay:'.3s', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'.5rem' }}>
              {[
                { label:'Ventas hoy',          value: stats ? String(stats.todaySales)   : '—', color:'#6fcbb8' },
                { label:'Total ventas',         value: stats ? fmt(stats.totalSales)      : '—', color:'#c0e5d8' },
                { label:'Vendedores activos',   value: stats ? String(stats.totalVendors) : '—', color:'#4a9485' },
              ].map(({ label, value, color }) => (
                <div key={label} className="lp-chip">
                  <div style={{ fontSize:'.55rem', fontWeight:800, color:'rgba(106,158,144,0.65)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.25rem' }}>
                    {label}
                  </div>
                  <div style={{ fontSize:'1.3rem', fontWeight:900, color, letterSpacing:'-.03em', lineHeight:1 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom brand strip */}
            <div style={{ marginTop:'auto', paddingTop:'1.25rem' }}>
              <div style={{ display:'flex', gap:'5px', marginBottom:'.5rem' }}>
                {['#3a5248','#4a9485','#6fcbb8','#c0e5d8','#e2f5ec'].map(c => (
                  <div key={c} style={{ flex:1, height:'3px', borderRadius:'2px', background:c, opacity:.55 }} />
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                <Zap size={11} color="rgba(106,158,144,0.4)" />
                <span style={{ fontSize:'.6rem', color:'rgba(106,158,144,0.4)' }}>
                  Livex Agency · Gestión de ventas Overshark & Bravos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT — Login form
        ══════════════════════════════ */}
        <div className="lp-right">

          {/* Right bg glow */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-55%)',
            width:'420px', height:'420px', pointerEvents:'none', zIndex:0,
            background:'radial-gradient(ellipse, rgba(111,203,184,0.055) 0%, transparent 65%)',
          }} />

          {/* Form area */}
          <div className="lp-fadein" style={{ width:'100%', maxWidth:'340px', position:'relative', zIndex:1 }}>

            {/* Brand mark */}
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
                <div style={{
                  position:'absolute', inset:'-18px', borderRadius:'50%',
                  background:'radial-gradient(circle, rgba(111,203,184,0.12) 0%, transparent 70%)',
                }} />
                <img src="/icono.png" alt="Livex Agency" style={{
                  width:'72px', height:'72px', borderRadius:'18px',
                  objectFit:'contain', display:'block', position:'relative',
                  background:'rgba(111,203,184,0.06)',
                  border:'1px solid rgba(111,203,184,0.18)',
                  padding:'8px',
                  boxShadow:'0 8px 32px rgba(111,203,184,0.15)',
                }} />
              </div>
              <h1 style={{ fontSize:'1.45rem', fontWeight:900, color:'#fff', letterSpacing:'-.03em', marginBottom:'.25rem' }}>
                Bienvenido de vuelta
              </h1>
              <p style={{ fontSize:'.72rem', color:'#4a9485' }}>
                Panel de ventas · Livex Agency
              </p>
            </div>

            {/* Divider */}
            <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(111,203,184,0.15),transparent)', marginBottom:'1.75rem' }} />

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              <div style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
                <label style={{ fontSize:'.62rem', fontWeight:800, color:'rgba(106,158,144,0.8)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  Correo electrónico
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={13} style={{ position:'absolute', left:'.85rem', top:'50%', transform:'translateY(-50%)', color:'rgba(106,158,144,0.4)', pointerEvents:'none' }} />
                  <input
                    className="lp-field" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vendedor@overshark.pe"
                    autoComplete="email" required
                    style={{ padding:'.7rem 1rem .7rem 2.3rem' }}
                  />
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
                <label style={{ fontSize:'.62rem', fontWeight:800, color:'rgba(106,158,144,0.8)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  Contraseña
                </label>
                <div style={{ position:'relative' }}>
                  <Lock size={13} style={{ position:'absolute', left:'.85rem', top:'50%', transform:'translateY(-50%)', color:'rgba(106,158,144,0.4)', pointerEvents:'none' }} />
                  <input
                    className="lp-field" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password" required
                    style={{ padding:'.7rem 2.6rem .7rem 2.3rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{
                    position:'absolute', right:'.85rem', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    color:'rgba(106,158,144,0.5)', padding:0, display:'flex',
                  }}>
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding:'.6rem .9rem',
                  background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)',
                  borderRadius:'8px', color:'#f87171', fontSize:'.8rem', fontWeight:600,
                  display:'flex', alignItems:'center', gap:'.5rem',
                }}>
                  ⚠ {error}
                </div>
              )}

              <button className="lp-btn" type="submit" disabled={loading} style={{ marginTop:'.25rem' }}>
                {loading
                  ? <><Loader size={15} style={{ animation:'spin 1s linear infinite' }} /> Verificando...</>
                  : <><LogIn size={15} /> Ingresar al panel</>}
              </button>
            </form>

            <p style={{ textAlign:'center', fontSize:'.6rem', color:'rgba(106,158,144,0.35)', marginTop:'1.5rem' }}>
              Acceso restringido · Solo personal autorizado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
