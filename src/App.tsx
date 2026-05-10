import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import AdminDashboard from './components/panels/AdminDashboard';
import VendorApp from './pages/VendorApp';
import { useToast } from './hooks/useToast';
import { getProfile, getAllProfiles } from './lib/supabase';
import type { Profile } from './types';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminMode, setAdminMode] = useState<'admin' | 'vendedor'>('admin');

  useEffect(() => {
    if (user?.id) getProfile(user.id).then(setProfile);
  }, [user?.id]);

  useEffect(() => {
    if (user) getAllProfiles().then(setProfiles);
  }, [user?.id]);

  const emailPrefix = user?.email?.split('@')[0] || 'VENDEDOR';
  const vendedorName = ((user?.user_metadata?.full_name || user?.user_metadata?.name || emailPrefix) as string).toUpperCase();

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

  if (profile?.role === 'admin' && adminMode === 'admin') {
    return (
      <>
        <AdminDashboard
          adminName={vendedorName}
          profiles={[]}
          onSignOut={signOut}
          onSwitchToVendedor={() => setAdminMode('vendedor')}
        />
        {toast && (
          <div className={`toast ${toast.type}${toast.leaving ? ' leaving' : ''}`}>
            {toast.type === 'ok' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}
      </>
    );
  }

  return (
    <VendorApp
      profile={profile}
      profiles={profiles}
      onSwitchToAdmin={() => setAdminMode('admin')}
    />
  );
}
