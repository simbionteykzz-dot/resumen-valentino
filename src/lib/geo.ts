import shalomSedesData from './shalomSedes.json';

const _normSede = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();

export let SEDES = (shalomSedesData as any[]).map(s => ({
  ...s,
  _s: _normSede(`${s.n} ${s.dist} ${s.prov} ${s.dep} ${s.addr}`),
}));
export function updateSedes(newSedes: any[]) {
  const norm = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  SEDES = newSedes.map(s => ({ ...s, _s: norm(`${s.n} ${s.dist} ${s.prov} ${s.dep} ${s.addr}`) }));
}

export function getSedesCount() {
  return SEDES.length;
}

export function searchSedes(q: string, lim = 14) {
  const norm = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  const nq = norm(q);
  if (!nq) return [];
  const terms = nq.split(" ").filter(t => t.length >= 2);
  if (!terms.length) terms.push(nq);

  const res = [];
  for (const s of SEDES) {
    let score = 0, ok = true;
    for (const t of terms) {
      if (s._s.indexOf(t) < 0) { ok = false; break; }
      if (norm(s.n).indexOf(t) >= 0) score += 10;
      if (norm(s.dist).indexOf(t) >= 0) score += 7;
      if (norm(s.prov).indexOf(t) >= 0) score += 5;
      if (norm(s.dep).indexOf(t) >= 0) score += 3;
      if (norm(s.addr).indexOf(t) >= 0) score += 2;
    }
    if (ok) res.push({ s, sc: score });
  }
  return res.sort((a, b) => b.sc - a.sc).slice(0, lim).map(r => r.s);
}

/* ── ZAZU Coverage — Real polygon from KML ── */
import zazuData from './zazuCoverage.json';

// Ray-casting point-in-polygon algorithm
function pointInPolygon(lon: number, lat: number, polygon: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export interface CoberturaResult {
  dentro: boolean;
  tipo: 'cobertura' | 'hueco' | 'no_cobertura' | 'fuera';
  mensaje: string;
}

function _buildCoberturaResult(lon: number, lat: number, distrito: string | null): CoberturaResult {
  const tag = distrito ? ` (${distrito})` : '';
  if (pointInPolygon(lon, lat, zazuData.noCobertura)) {
    return { dentro: false, tipo: 'no_cobertura', mensaje: `⚠️ Zona sin cobertura ZAZU${tag}. Coordinar envío por Shalom u otro operador.` };
  }
  for (const hole of zazuData.holes) {
    if (pointInPolygon(lon, lat, hole)) {
      return { dentro: false, tipo: 'hueco', mensaje: `⚠️ Zona excluida de cobertura ZAZU${tag}. Se recomienda envío por Shalom.` };
    }
  }
  if (pointInPolygon(lon, lat, zazuData.outer)) {
    return { dentro: true, tipo: 'cobertura', mensaje: `✅ Dentro de cobertura ZAZU Express${tag}` };
  }
  return { dentro: false, tipo: 'fuera', mensaje: `❌ Fuera de cobertura ZAZU${tag}. Envío por Shalom a provincia.` };
}

export function checkCoberturaZazu(lon: number, lat: number): CoberturaResult {
  const distrito = detectarDistritoLima(lat, lon);
  return _buildCoberturaResult(lon, lat, distrito);
}

export async function checkCoberturaZazuAsync(lon: number, lat: number): Promise<CoberturaResult> {
  const distrito = await detectarDistritoLimaAsync(lat, lon);
  return _buildCoberturaResult(lon, lat, distrito);
}

// Keep legacy function for backward compatibility
export function checkCob(lon: number, lat: number) {
  const result = checkCoberturaZazu(lon, lat);
  return result.dentro ? 0 : 1;
}

// Find nearest Shalom agency to given coordinates
export function findNearestShalom(lat: number, lon: number, limit = 3): { sede: typeof SEDES[0]; distKm: number }[] {
  return SEDES
    .map(s => ({ sede: s, distKm: calcularDistancia(lat, lon, s.lat, s.lon) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, limit);
}

/* ── Detección de distritos con límites oficiales IGN ── */

const NOMBRE_DISPLAY: Record<string, string> = {
  'JESUS MARIA': 'Jesús María',
  'LURIN': 'Lurín',
  'ANCON': 'Ancón',
  'PACHACAMAC': 'Pachacámac',
  'LIMA': 'Cercado de Lima',
  'RIMAC': 'Rímac',
  'MI PERU': 'Mi Perú',
  'VILLA MARIA DEL TRIUNFO': 'Villa María del Triunfo',
  'SANTA MARIA DEL MAR': 'Santa María del Mar',
  'SAN MARTIN DE PORRES': 'San Martín de Porres',
  'CARMEN DE LA LEGUA REYNOSO': 'Carmen de la Legua',
};

function normalizarNombreDistrito(raw: string): string {
  if (!raw) return '';
  const fixed = raw
    .replace(/MI\s+PERÃºz/gi, 'MI PERU')
    .replace(/MI\s+PERÃz/gi, 'MI PERU')
    .replace(/PERÃºz/gi, 'PERU')
    .replace(/PERÃz/gi, 'PERU')
    .toUpperCase()
    .trim();
  if (NOMBRE_DISPLAY[fixed]) return NOMBRE_DISPLAY[fixed];
  return fixed.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

interface DistritoPoligono {
  nombre: string;
  ring: number[][];
  minLon: number; maxLon: number; minLat: number; maxLat: number;
}

let _distritosCache: DistritoPoligono[] | null = null;
let _loadingPromise: Promise<DistritoPoligono[]> | null = null;

function buildDistritos(features: any[]): DistritoPoligono[] {
  return features.map((f: any) => {
    const ring: number[][] = f.geometry.coordinates[0];
    const lons = ring.map((c: number[]) => c[0]);
    const lats = ring.map((c: number[]) => c[1]);
    return {
      nombre: normalizarNombreDistrito(f.properties.distrito2 || f.properties.distrito),
      ring,
      minLon: Math.min(...lons), maxLon: Math.max(...lons),
      minLat: Math.min(...lats), maxLat: Math.max(...lats),
    };
  });
}

async function getDistritos(): Promise<DistritoPoligono[]> {
  if (_distritosCache) return _distritosCache;
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = fetch('/limaDistritos.json')
    .then(r => r.json())
    .then(data => {
      _distritosCache = buildDistritos(data.features);
      return _distritosCache;
    });
  return _loadingPromise;
}

// Pre-carga en background al importar el módulo
getDistritos().catch(() => {});

function puntoDentroDePoligono(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function detectarEnDistritos(lat: number, lon: number, distritos: DistritoPoligono[]): string | null {
  for (const d of distritos) {
    if (lon < d.minLon || lon > d.maxLon || lat < d.minLat || lat > d.maxLat) continue;
    if (puntoDentroDePoligono(lon, lat, d.ring)) return d.nombre;
  }
  // Fallback: más cercano por centroide
  let closest: DistritoPoligono | null = null;
  let closestDist = Infinity;
  for (const d of distritos) {
    const cLon = d.ring.reduce((s, c) => s + c[0], 0) / d.ring.length;
    const cLat = d.ring.reduce((s, c) => s + c[1], 0) / d.ring.length;
    const dist = calcularDistancia(lat, lon, cLat, cLon);
    if (dist < closestDist) { closestDist = dist; closest = d; }
  }
  return closest && closestDist < 8 ? closest.nombre : null;
}

// Versión síncrona: usa cache si ya cargó, sino null (checkCoberturaZazu la llama)
export function detectarDistritoLima(lat: number, lon: number): string | null {
  if (lon < -77.40 || lon > -76.60 || lat < -12.55 || lat > -11.65) return null;
  if (!_distritosCache) return null; // datos aún cargando
  return detectarEnDistritos(lat, lon, _distritosCache);
}

// Versión async: espera la carga si hace falta
export async function detectarDistritoLimaAsync(lat: number, lon: number): Promise<string | null> {
  if (lon < -77.40 || lon > -76.60 || lat < -12.55 || lat > -11.65) return null;
  const distritos = await getDistritos();
  return detectarEnDistritos(lat, lon, distritos);
}

export function parseCoords(text: string) {
  const t = (text || '').trim();
  if (!t) return null;
  let m = t.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/[?&]q=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/(-?\d{1,3}\.\d{4,})\s*[, ]\s*(-?\d{1,3}\.\d{4,})/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    if (a >= -82 && a <= -68) return { lon: a, lat: b };
    if (b >= -82 && b <= -68) return { lon: b, lat: a };
    return { lat: a, lon: b };
  }
  return null;
}

