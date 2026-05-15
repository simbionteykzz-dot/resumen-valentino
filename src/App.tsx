import { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import AdminDashboard from './components/panels/AdminDashboard';
import VendorApp from './pages/VendorApp';
import ATCPanel from './components/panels/ATCPanel';
import { useToast } from './hooks/useToast';
import { getProfile, getAllProfiles } from './lib/supabase';
import type { Profile } from './types';

type AppMode = 'admin' | 'vendedor' | 'atc';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appMode, setAppMode] = useState<AppMode>('admin');

  useEffect(() => {
    if (user?.id) getProfile(user.id).then(setProfile);
    else setProfile(null);
  }, [user?.id]);

  useEffect(() => {
    if (user) getAllProfiles().then(setProfiles);
    else setProfiles([]);
  }, [user?.id]);

  useEffect(() => {
    if (profile?.role === 'atc' && appMode !== 'atc') {
      setAppMode('atc');
    }
  }, [profile?.role, appMode]);

  const emailPrefix = user?.email?.split('@')[0] || 'USUARIO';
  const userName = ((user?.user_metadata?.full_name || user?.user_metadata?.name || emailPrefix) as string).toUpperCase();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={18} style={{ color: '#45834D' }} /> Cargando...
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Admin en modo ATC / usuario ATC
  if (appMode === 'atc' || profile?.role === 'atc') {
    return (
      <>
        <ATCPanel
          userId={user.id}
          userName={userName}
          isAdmin={profile?.role === 'admin'}
          onBack={profile?.role === 'admin' ? () => setAppMode('admin') : undefined}
          onSignOut={signOut}
        />
        {toast && (
          <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {toast.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {toast.msg}
            </span>
          </div>
        )}
      </>
    );
  }

  // Admin en modo admin
  if (profile?.role === 'admin' && appMode === 'admin') {
    return (
      <>
        <AdminDashboard
          adminName={userName}
          onSignOut={signOut}
          onSwitchToVendedor={() => setAppMode('vendedor')}
          onSwitchToATC={() => setAppMode('atc')}
        />
        {toast && (
          <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {toast.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {toast.msg}
            </span>
          </div>
        )}
      </>
    );
  }

  // Vendedor (incluye admin en modo vendedor)
  return (
    <VendorApp
      profile={profile}
      profiles={profiles}
      onSwitchToAdmin={profile?.role === 'admin' ? () => setAppMode('admin') : undefined}
    />
  );
}
