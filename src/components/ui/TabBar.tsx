import type { ReactNode } from 'react';

interface Tab<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
}

export default function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
  return (
    <div style={{
      display: 'flex', gap: '4px',
      background: 'var(--surface2)', borderRadius: '40px',
      padding: '6px', border: '1px solid var(--surface3)',
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            borderRadius: '30px', padding: '0.6rem 1.5rem',
            fontSize: '0.85rem', fontWeight: 700,
            background: active === t.id ? 'var(--accent)' : 'transparent',
            color: active === t.id ? '#fff' : 'var(--muted)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            transition: 'all 0.2s', outline: 'none',
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
