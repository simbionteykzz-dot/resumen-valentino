import { POL_PRECIOS_OVERSHARK, POL_VARIANTES_OVERSHARK, BRV_PRECIOS, BRV_VARIANTES, PROMOS_DATA, BRV_PROMOS_DATA } from './data';

export type BrandKey = 'overshark' | 'bravos';

export interface BrandTheme {
  accent: string;
  accent2: string;
  accentGlow: string;
  accentSoft: string;
  ok: string;
  okSoft: string;
  bg: string;
  bg2: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  border2: string;
  text: string;
  text2: string;
  muted: string;
  muted2: string;
}

export interface BrandSelectorConfig {
  id: BrandKey;
  label: string;
  sub: string;
  tag: string;
  icon: string;
  color: string;
  colorDim: string;
  grad: string;
  gradActive: string;
  glow: string;
  border: string;
}

export interface BrandConfig {
  key: BrandKey;
  label: string;
  tag: string;
  precios: Record<string, number>;
  variantes: Record<string, { tallas: string[]; colores: string }>;
  promos: typeof PROMOS_DATA;
  theme: BrandTheme;
  selector: BrandSelectorConfig;
}

const OVERSHARK_THEME: BrandTheme = {
  accent:      '#45834D',
  accent2:     '#3a6d42',
  accentGlow:  'rgba(69,131,77,.18)',
  accentSoft:  'rgba(69,131,77,.09)',
  ok:          '#45834D',
  okSoft:      'rgba(69,131,77,.12)',
  bg:          '#EAF5EE',
  bg2:         '#DDEEE3',
  surface:     '#FFFFFF',
  surface2:    '#F2FBF5',
  surface3:    '#E5F4EA',
  border:      'rgba(104,168,119,.4)',
  border2:     'rgba(81,120,97,.35)',
  text:        '#2a4433',
  text2:       '#162e20',
  muted:       '#517861',
  muted2:      '#68A877',
};

const BRAVOS_THEME: BrandTheme = {
  accent:      '#EB7347',
  accent2:     '#c85a30',
  accentGlow:  'rgba(235,115,71,.18)',
  accentSoft:  'rgba(235,115,71,.09)',
  ok:          '#EB7347',
  okSoft:      'rgba(235,115,71,.12)',
  bg:          '#FFF8F0',
  bg2:         '#FAE9D5',
  surface:     '#FFFFFF',
  surface2:    '#FFF5EC',
  surface3:    '#FFEDD5',
  border:      'rgba(235,115,71,.3)',
  border2:     'rgba(200,90,48,.25)',
  text:        '#5c2a14',
  text2:       '#3d1a0a',
  muted:       '#b07040',
  muted2:      '#FDAC68',
};

export const BRANDS: Record<BrandKey, BrandConfig> = {
  overshark: {
    key: 'overshark',
    label: 'OVERSHARK',
    tag: 'OVER',
    precios: POL_PRECIOS_OVERSHARK,
    variantes: POL_VARIANTES_OVERSHARK,
    promos: PROMOS_DATA,
    theme: OVERSHARK_THEME,
    selector: {
      id: 'overshark',
      label: 'OVERSHARK',
      sub: 'Polos & Camiseros',
      tag: 'Colección activa',
      icon: '/over-icon.png',
      color: '#45834D',
      colorDim: '#3a6d42',
      grad: 'linear-gradient(135deg, #f2fbf5, #e5f4ea)',
      gradActive: 'linear-gradient(135deg, #ddeee3, #cfe8d6)',
      glow: 'rgba(69,131,77,0.18)',
      border: 'rgba(104,168,119,.55)',
    },
  },
  bravos: {
    key: 'bravos',
    label: 'BRAVOS',
    tag: 'BRV',
    precios: BRV_PRECIOS,
    variantes: BRV_VARIANTES,
    promos: BRV_PROMOS_DATA as typeof PROMOS_DATA,
    theme: BRAVOS_THEME,
    selector: {
      id: 'bravos',
      label: 'BRAVOS',
      sub: 'Poleras & Pantalones',
      tag: 'Colección activa',
      icon: '/brav-icon.png',
      color: '#EB7347',
      colorDim: '#c85a30',
      grad: 'linear-gradient(135deg, #fff8f0, #faebd7)',
      gradActive: 'linear-gradient(135deg, #faebd7, #fdd9b5)',
      glow: 'rgba(235,115,71,0.18)',
      border: 'rgba(235,115,71,.3)',
    },
  },
};

export function applyBrandTheme(brand: BrandKey): void {
  const r = document.documentElement.style;
  const t = BRANDS[brand].theme;
  r.setProperty('--accent',      t.accent);
  r.setProperty('--accent2',     t.accent2);
  r.setProperty('--accent-glow', t.accentGlow);
  r.setProperty('--accent-soft', t.accentSoft);
  r.setProperty('--ok',          t.ok);
  r.setProperty('--ok-soft',     t.okSoft);
  r.setProperty('--bg',          t.bg);
  r.setProperty('--bg2',         t.bg2);
  r.setProperty('--surface',     t.surface);
  r.setProperty('--surface2',    t.surface2);
  r.setProperty('--surface3',    t.surface3);
  r.setProperty('--border',      t.border);
  r.setProperty('--border2',     t.border2);
  r.setProperty('--text',        t.text);
  r.setProperty('--text2',       t.text2);
  r.setProperty('--muted',       t.muted);
  r.setProperty('--muted2',      t.muted2);
}
