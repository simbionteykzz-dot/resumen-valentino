export const POLOS_CATALOGO_OVERSHARK = [
  "BABY TY", "BABY TY ESCOTADO", "BABY TY MANGA", "BABY TY MANGA ESCOTADO",
  "CAMISA WAFFLE", "CAMISERO PIKE",
  "CLASICO", "CUELLO CHINO", "CUELLO CHINO WAFFLE", "JERSEY MANGA LARGA",
  "WAFFLE", "WAFFLE CAMISERO", "WAFFLE MANGA LARGA", "CUELLO NOTCH PIQUE", "CUELLO NOTCH WAFLE",
  "MEDIAS",
];

export const TALLAS_SML = ["S", "M", "L"];
export const TALLAS_SMLXL = ["S", "M", "L", "XL"];

export const COLORES_BABY_TY = "Azul, Beige, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino, Menta";
export const COLORES_CAMISA_WAFFLE = "Beige, Botella, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino";
export const COLORES_15_POLO = "Azul, Beige, Botella, Camote, Cemento, Denim, Marron, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";
export const COLORES_CUELLO_CHINO = "Azul, Beige, Botella, Cemento, Negro, Topo, P. Rosa, Perla, Vino";
export const COLORES_CUELLO_CHINO_WAFFLE = "Azul, Botella, Cemento, Negro, Pacay, P. Rosa, Perla, Plomo, Vino";
export const COLORES_JERSEY_ML = "Azul, Beige, Cemento, Denim, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";
export const COLORES_MEDIAS = "Melange, Plomo, Perla";

export const POL_VARIANTES_OVERSHARK: Record<string, { tallas: string[], colores: string }> = {
  "BABY TY": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "BABY TY ESCOTADO": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "BABY TY MANGA": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "BABY TY MANGA ESCOTADO": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "CAMISA WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_CAMISA_WAFFLE },
  "CAMISERO PIKE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CLASICO": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO CHINO": { tallas: TALLAS_SMLXL, colores: COLORES_CUELLO_CHINO },
  "CUELLO CHINO WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_CUELLO_CHINO_WAFFLE },
  "JERSEY MANGA LARGA": { tallas: TALLAS_SMLXL, colores: COLORES_JERSEY_ML },
  "WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "WAFFLE CAMISERO": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "WAFFLE MANGA LARGA": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO NOTCH PIQUE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO NOTCH WAFLE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "MEDIAS": { tallas: [], colores: COLORES_MEDIAS },
};

export const POL_PRECIOS_OVERSHARK: Record<string, number> = {
  "BABY TY": 45, "BABY TY ESCOTADO": 45, "BABY TY MANGA": 45, "BABY TY MANGA ESCOTADO": 45, "CAMISA WAFFLE": 45,
  "CAMISERO PIKE": 45, "CLASICO": 45, "CUELLO CHINO": 45, "CUELLO CHINO WAFFLE": 45,
  "JERSEY MANGA LARGA": 45, "WAFFLE": 45, "WAFFLE CAMISERO": 45,
  "WAFFLE MANGA LARGA": 45, "CUELLO NOTCH PIQUE": 45, "CUELLO NOTCH WAFLE": 45,
  "MEDIAS": 17.50,
};

export const ENVIO_PROVINCIA_SOLES = 12;
export const ENVIO_LIMA_SOLES = 14;

export const PROMOS_DATA: Record<string, {name: string, comboData: string, price: number, list: {n: string, q: number}[]}> = {
  // ── Camisero Pike ────────────────────────────────────────────────────────
  "pique_3_65":        { name: "Camisero Pique 3×65",   comboData: "CAMISERO PIQUE 3 X 65",   price: 65,  list: [{n:"CAMISERO PIKE", q:3}] },
  "pique_5_99":        { name: "Camisero Pique 5×99",   comboData: "CAMISERO PIQUE 5 X 99",   price: 99,  list: [{n:"CAMISERO PIKE", q:5}] },
  "pique_10_198":      { name: "Camisero Pique 10×198", comboData: "CAMISERO PIQUE 10 X 198", price: 198, list: [{n:"CAMISERO PIKE", q:10}] },
  "pique_12_230":      { name: "Camisero Pique 12×230", comboData: "CAMISERO PIQUE 12 X 230", price: 230, list: [{n:"CAMISERO PIKE", q:12}] },
  // ── Camisero Wafle ───────────────────────────────────────────────────────
  "wafle_cam_2_55":    { name: "Camisero Wafle 2×55",   comboData: "CAMISERO WAFLE 2 X 55",   price: 55,  list: [{n:"WAFFLE CAMISERO", q:2}] },
  "wafle_cam_4_99":    { name: "Camisero Wafle 4×99",   comboData: "CAMISERO WAFLE 4 X 99",   price: 99,  list: [{n:"WAFFLE CAMISERO", q:4}] },
  "wafle_cam_8_198":   { name: "Camisero Wafle 8×198",  comboData: "CAMISERO WAFLE 8 X 198",  price: 198, list: [{n:"WAFFLE CAMISERO", q:8}] },
  "wafle_cam_10_248":  { name: "Camisero Wafle 10×248", comboData: "CAMISERO WAFLE 10 X 248", price: 248, list: [{n:"WAFFLE CAMISERO", q:10}] },
  // ── Clásico ──────────────────────────────────────────────────────────────
  "clasico_4_50":      { name: "Clásico 4×50",          comboData: "CLASICO 4 X 50",          price: 50,  list: [{n:"CLASICO", q:4}] },
  "clasico_9_99":      { name: "Clásico 9×99",          comboData: "CLASICO 9 X 99",          price: 99,  list: [{n:"CLASICO", q:9}] },
  "clasico_10_99":     { name: "Clásico 10×99",         comboData: "CLASICO 10 X 99",         price: 99,  list: [{n:"CLASICO", q:10}] },
  "clasico_12_130":    { name: "Clásico 12×130",        comboData: "CLASICO 12 X 130",        price: 130, list: [{n:"CLASICO", q:12}] },
  // ── Waffle MC ────────────────────────────────────────────────────────────
  "wafle_3_55":        { name: "Manga corta Wafle 3×55",  comboData: "MANGA CORTA WAFLE 3 X 55",  price: 55,  list: [{n:"WAFFLE", q:3}] },
  "wafle_5_99":        { name: "Manga corta Wafle 5×99",  comboData: "MANGA CORTA WAFLE 5 X 99",  price: 99,  list: [{n:"WAFFLE", q:5}] },
  "wafle_6_99":        { name: "Manga corta Wafle 6×99",  comboData: "MANGA CORTA WAFLE 6 X 99",  price: 99,  list: [{n:"WAFFLE", q:6}] },
  "wafle_12_198":      { name: "Manga corta Wafle 12×198",comboData: "MANGA CORTA WAFLE 12 X 198", price: 198, list: [{n:"WAFFLE", q:12}] },
  // ── Waffle Manga Larga ───────────────────────────────────────────────────
  "ml_wafle_2_55":     { name: "Mangalarga Wafle 2×55",   comboData: "MANGALARGA WAFLE 2 X 55",   price: 55,  list: [{n:"WAFFLE MANGA LARGA", q:2}] },
  "ml_wafle_4_99":     { name: "Mangalarga Wafle 4×99",   comboData: "MANGALARGA WAFLE 4 X 99",   price: 99,  list: [{n:"WAFFLE MANGA LARGA", q:4}] },
  "ml_wafle_8_198":    { name: "Mangalarga Wafle 8×198",  comboData: "MANGALARGA WAFLE 8 X 198",  price: 198, list: [{n:"WAFFLE MANGA LARGA", q:8}] },
  "ml_wafle_12_297":   { name: "Mangalarga Wafle 12×297", comboData: "MANGALARGA WAFLE 12 X 297", price: 297, list: [{n:"WAFFLE MANGA LARGA", q:12}] },
  // ── Jersey Manga Larga ───────────────────────────────────────────────────
  "ml_jersey_3_50":    { name: "Mangalarga Jersey 3×50",  comboData: "MANGALARGA JERSEY 3 X 50",  price: 50,  list: [{n:"JERSEY MANGA LARGA", q:3}] },
  "ml_jersey_7_99":    { name: "Mangalarga Jersey 7×99",  comboData: "MANGALARGA JERSEY 7 X 99",  price: 99,  list: [{n:"JERSEY MANGA LARGA", q:7}] },
  "ml_jersey_10_148":  { name: "Mangalarga Jersey 10×148",comboData: "MANGALARGA JERSEY 10 X 148", price: 148, list: [{n:"JERSEY MANGA LARGA", q:10}] },
  // ── Camisa Waffle ────────────────────────────────────────────────────────
  "camisa_wafle_3_99": { name: "Camisa Wafle 3×99",       comboData: "CAMISA WAFLE 3 X 99",       price: 99,  list: [{n:"CAMISA WAFFLE", q:3}] },
  // ── Baby Ty ──────────────────────────────────────────────────────────────
  "baby_ty_3_50":           { name: "Baby Ty 3×50",              comboData: "BABY TY 3 X 50",                        price: 50, list: [{n:"BABY TY", q:3}] },
  "baby_ty_7_99":           { name: "Baby Ty 7×99",              comboData: "BABY TY 7 X 99",                        price: 99, list: [{n:"BABY TY", q:7}] },
  "baby_ty_live":           { name: "Baby Ty 7+1 Live",          comboData: "BABY TY 7 X 99 + 1 DE REGALO POR LIVE", price: 99, list: [{n:"BABY TY", q:8}] },
  // ── Baby Ty Escotado ─────────────────────────────────────────────────────
  "baby_ty_esc_3_50":       { name: "Baby Ty Esc. 3×50",         comboData: "BABY TY ESCOTADO 3 X 50",                        price: 50, list: [{n:"BABY TY ESCOTADO", q:3}] },
  "baby_ty_esc_7_99":       { name: "Baby Ty Esc. 7×99",         comboData: "BABY TY ESCOTADO 7 X 99",                        price: 99, list: [{n:"BABY TY ESCOTADO", q:7}] },
  "baby_ty_esc_live":       { name: "Baby Ty Esc. 7+1 Live",     comboData: "BABY TY ESCOTADO 7 X 99 + 1 DE REGALO POR LIVE", price: 99, list: [{n:"BABY TY ESCOTADO", q:8}] },
  // ── Baby Ty Manga ────────────────────────────────────────────────────────
  "baby_ty_manga_3_50":     { name: "Baby Ty Manga 3×50",        comboData: "BABY TY MANGA 3 X 50",                        price: 50, list: [{n:"BABY TY MANGA", q:3}] },
  "baby_ty_manga_7_99":     { name: "Baby Ty Manga 7×99",        comboData: "BABY TY MANGA 7 X 99",                        price: 99, list: [{n:"BABY TY MANGA", q:7}] },
  "baby_ty_manga_live":     { name: "Baby Ty Manga 7+1 Live",    comboData: "BABY TY MANGA 7 X 99 + 1 DE REGALO POR LIVE", price: 99, list: [{n:"BABY TY MANGA", q:8}] },
  // ── Baby Ty Manga Escotado ───────────────────────────────────────────────
  "baby_ty_mesc_3_50":      { name: "Baby Ty Manga Esc. 3×50",   comboData: "BABY TY MANGA ESCOTADO 3 X 50",                        price: 50, list: [{n:"BABY TY MANGA ESCOTADO", q:3}] },
  "baby_ty_mesc_7_99":      { name: "Baby Ty Manga Esc. 7×99",   comboData: "BABY TY MANGA ESCOTADO 7 X 99",                        price: 99, list: [{n:"BABY TY MANGA ESCOTADO", q:7}] },
  "baby_ty_mesc_live":      { name: "Baby Ty Manga Esc. 7+1 Live",comboData: "BABY TY MANGA ESCOTADO 7 X 99 + 1 DE REGALO POR LIVE",price: 99, list: [{n:"BABY TY MANGA ESCOTADO", q:8}] },
  // ── Cuello Notch Pique ───────────────────────────────────────────────────
  "notch_pique_3_75":   { name: "Cuello Notch Pique 3×75",   comboData: "CUELLO NOTCH PIQUE 3 X 75",   price: 75,  list: [{n:"CUELLO NOTCH PIQUE", q:3}] },
  "notch_pique_5_99":   { name: "Cuello Notch Pique 5×99",   comboData: "CUELLO NOTCH PIQUE 5 X 99",   price: 99,  list: [{n:"CUELLO NOTCH PIQUE", q:5}] },
  "notch_pique_10_198": { name: "Cuello Notch Pique 10×198", comboData: "CUELLO NOTCH PIQUE 10 X 198", price: 198, list: [{n:"CUELLO NOTCH PIQUE", q:10}] },
  "notch_pique_12_230": { name: "Cuello Notch Pique 12×230", comboData: "CUELLO NOTCH PIQUE 12 X 230", price: 230, list: [{n:"CUELLO NOTCH PIQUE", q:12}] },
  // ── Cuello Notch Wafle ───────────────────────────────────────────────────
  "notch_wafle_2_55":   { name: "Cuello Notch Wafle 2×55",   comboData: "CUELLO NOTCH WAFLE 2 X 55",   price: 55,  list: [{n:"CUELLO NOTCH WAFLE", q:2}] },
  "notch_wafle_4_99":   { name: "Cuello Notch Wafle 4×99",   comboData: "CUELLO NOTCH WAFLE 4 X 99",   price: 99,  list: [{n:"CUELLO NOTCH WAFLE", q:4}] },
  "notch_wafle_8_198":  { name: "Cuello Notch Wafle 8×198",  comboData: "CUELLO NOTCH WAFLE 8 X 198",  price: 198, list: [{n:"CUELLO NOTCH WAFLE", q:8}] },
  "notch_wafle_10_248": { name: "Cuello Notch Wafle 10×248", comboData: "CUELLO NOTCH WAFLE 10 X 248", price: 248, list: [{n:"CUELLO NOTCH WAFLE", q:10}] },
  // ── Medias ───────────────────────────────────────────────────────────────
  "medias_3": { name: "Medias 3×17.50", comboData: "MEDIAS 3 X 17.50", price: 17.50, list: [{n:"MEDIAS", q:3}] },
};

export const MIX_PROMOS_DATA: Record<string, {name: string, comboData: string, price: number, list: {n: string, q: number}[]}> = {
  // ── S/ 95 ────────────────────────────────────────────────────────────────
  "flash":    { name: "Promo Flash 5×95",      comboData: "PROMOCIÓN FLASH 5 X 95",      price: 95, list: [{n:"WAFFLE MANGA LARGA", q:1}, {n:"WAFFLE CAMISERO", q:2}, {n:"WAFFLE", q:2}] },
  // ── S/ 99 — 5 prendas ────────────────────────────────────────────────────
  "mix_5":    { name: "Promo Mix 5×99",        comboData: "PROMOCIÓN MIX 5 X 99",        price: 99, list: [{n:"WAFFLE", q:1}, {n:"CLASICO", q:1}, {n:"WAFFLE CAMISERO", q:1}, {n:"WAFFLE MANGA LARGA", q:1}, {n:"CAMISERO PIKE", q:1}] },
  "wafflera": { name: "Promo Wafflera 6×99",   comboData: "PROMOCIÓN WAFFLERA 6 X 99",   price: 99, list: [{n:"WAFFLE CAMISERO", q:1}, {n:"WAFFLE MANGA LARGA", q:2}, {n:"WAFFLE", q:3}] },
  // ── S/ 99 — 6 prendas ────────────────────────────────────────────────────
  "mixtura":  { name: "Promoción Mixtura 6×99",  comboData: "PROMOCIÓN MIXTURA 6 X 99",  price: 99, list: [{n:"WAFFLE", q:3}, {n:"CAMISERO PIKE", q:3}] },
  "bellaca":  { name: "Promoción Bellaca 6×99",  comboData: "PROMOCIÓN BELLACA 6 X 99",  price: 99, list: [{n:"CLASICO", q:3}, {n:"WAFFLE", q:1}, {n:"CAMISERO PIKE", q:1}, {n:"WAFFLE MANGA LARGA", q:1}] },
  "salvaje":  { name: "Promoción Salvaje 6×99",  comboData: "PROMOCIÓN SALVAJE 6 X 99",  price: 99, list: [{n:"WAFFLE CAMISERO", q:2}, {n:"CLASICO", q:4}] },
  // ── S/ 99 — 7 prendas ────────────────────────────────────────────────────
  "combo2":   { name: "Promo Combo 2 7×99",     comboData: "PROMO COMBO 2 7 X 99",        price: 99, list: [{n:"CLASICO", q:4}, {n:"WAFFLE", q:3}] },
  "flow":     { name: "Promoción Flow 7×99",    comboData: "PROMOCIÓN FLOW 7 X 99",      price: 99, list: [{n:"CLASICO", q:5}, {n:"CAMISERO PIKE", q:2}] },
  // ── S/ 99 — 9 prendas ────────────────────────────────────────────────────
  "tiburon":  { name: "Promoción Tiburón 9×99", comboData: "PROMOCIÓN TIBURÓN 9 X 99",  price: 99, list: [{n:"CLASICO", q:4}, {n:"WAFFLE", q:3}, {n:"MEDIAS", q:2}] },
};

export const PROMOS_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Camisero Pike",      keys: ["pique_3_65","pique_5_99","pique_10_198","pique_12_230"] },
  { label: "Camisero Wafle",     keys: ["wafle_cam_2_55","wafle_cam_4_99","wafle_cam_8_198","wafle_cam_10_248"] },
  { label: "Clásico",            keys: ["clasico_4_50","clasico_9_99","clasico_10_99","clasico_12_130"] },
  { label: "Waffle MC",          keys: ["wafle_3_55","wafle_5_99","wafle_6_99","wafle_12_198"] },
  { label: "Waffle ML",          keys: ["ml_wafle_2_55","ml_wafle_4_99","ml_wafle_8_198","ml_wafle_12_297"] },
  { label: "Jersey ML",          keys: ["ml_jersey_3_50","ml_jersey_7_99","ml_jersey_10_148"] },
  { label: "Camisa Wafle",       keys: ["camisa_wafle_3_99"] },
  { label: "Baby Ty",            keys: ["baby_ty_3_50","baby_ty_7_99","baby_ty_live"] },
  { label: "Baby Ty Escotado",   keys: ["baby_ty_esc_3_50","baby_ty_esc_7_99","baby_ty_esc_live"] },
  { label: "Baby Ty Manga",      keys: ["baby_ty_manga_3_50","baby_ty_manga_7_99","baby_ty_manga_live"] },
  { label: "Baby Ty Manga Esc.", keys: ["baby_ty_mesc_3_50","baby_ty_mesc_7_99","baby_ty_mesc_live"] },
  { label: "Notch Pique",        keys: ["notch_pique_3_75","notch_pique_5_99","notch_pique_10_198","notch_pique_12_230"] },
  { label: "Notch Wafle",        keys: ["notch_wafle_2_55","notch_wafle_4_99","notch_wafle_8_198","notch_wafle_10_248"] },
  { label: "Medias",             keys: ["medias_3"] },
];

// ── BRAVOS ──────────────────────────────────────────────────────────────────

export const POLOS_CATALOGO_BRAVOS = [
  "POLERA BOXYFIT", "POLERA NERU", "PANTALON BRATZ", "PANTALON OPRA", "CLASICOS DE REGALO",
];

export const BRV_VARIANTES: Record<string, { tallas: string[], colores: string }> = {
  "POLERA BOXYFIT":     { tallas: TALLAS_SML,   colores: "Azul, Beige, Cemento, Denim, Negro, Pacay, P. Rosa, Perla, Vino" },
  "POLERA NERU":        { tallas: TALLAS_SMLXL, colores: "Azul, Beige, Botella, Cemento, Denim, Melange, Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino" },
  "PANTALON BRATZ":     { tallas: TALLAS_SML,   colores: "Beige, Cemento, Denim, P. Rosa, Perla" },
  "PANTALON OPRA":      { tallas: TALLAS_SML,   colores: "Azul, Beige, Botella, Cemento, Denim, Negro, Pacay, P. Rosa, Perla, Plomo" },
  "CLASICOS DE REGALO": { tallas: TALLAS_SMLXL, colores: "Cemento, Negro" },
};

export const BRV_PRECIOS: Record<string, number> = {
  "POLERA BOXYFIT":   35,
  "POLERA NERU":      35,
  "PANTALON BRATZ":   35,
  "PANTALON OPRA":    35,
  "CLASICOS DE REGALO": 0,
};

export const BRV_PROMOS_DATA: Record<string, { name: string; comboData: string; price: number; list: { n: string; q: number }[] }> = {
  "boxyfit_3_99": { name: "Boxyfit 3×99",       comboData: "POLERA BOXYFIT 3 X 99",   price: 99, list: [{ n: "POLERA BOXYFIT",   q: 3 }] },
  "neru_3_99":    { name: "Neru 3×99",           comboData: "POLERA NERU 3 X 99",      price: 99, list: [{ n: "POLERA NERU",      q: 3 }] },
  "bratz_3_99":   { name: "Bratz 3×99",          comboData: "PANTALON BRATZ 3 X 99",   price: 99, list: [{ n: "PANTALON BRATZ",   q: 3 }] },
  "opra_3_99":    { name: "Opra 3×99",           comboData: "PANTALON OPRA 3 X 99",    price: 99, list: [{ n: "PANTALON OPRA",    q: 3 }] },
  "clasicos_regalo": { name: "Clásicos de Regalo", comboData: "CLASICOS DE REGALO",   price: 0,  list: [{ n: "CLASICOS DE REGALO", q: 1 }] },
  // ── Promo 50 Mil Seguidores ──────────────────────────────────────────────
  "50mil_neru":   { name: "50Mil — Conjunto Neru",  comboData: "PROMO 50MIL SEGUIDORES — CONJUNTO NERU (POLERA NERU + PANTALON BRATZ)",   price: 0, list: [{ n: "POLERA NERU", q: 1 }, { n: "PANTALON BRATZ", q: 1 }] },
  "50mil_boxy":   { name: "50Mil — Conjunto Boxy",  comboData: "PROMO 50MIL SEGUIDORES — CONJUNTO BOXY (POLERA BOXYFIT + PANTALON BRATZ)", price: 0, list: [{ n: "POLERA BOXYFIT", q: 1 }, { n: "PANTALON BRATZ", q: 1 }] },
  // ── Promo Boxyfit ────────────────────────────────────────────────────────
  "boxyfit_2_99": { name: "Promo Boxyfit 2 Conjuntos×99", comboData: "PROMO BOXYFIT — 2 CONJUNTOS BOXYFIT X 99 SOLES", price: 99, list: [{ n: "POLERA BOXYFIT", q: 2 }, { n: "PANTALON BRATZ", q: 2 }] },
  // ── Promo Neru ───────────────────────────────────────────────────────────
  "neru_2_119":   { name: "Promo Neru 2 Conjuntos×119",   comboData: "PROMO NERU — 2 CONJUNTOS NERU X 119 SOLES",   price: 119, list: [{ n: "POLERA NERU", q: 2 }, { n: "PANTALON BRATZ", q: 2 }] },
};

// ────────────────────────────────────────────────────────────────────────────

export const DISTRITOS = [
  "Ancón","Ate","Barranco","Breña","Carabayllo","Chaclacayo","Chorrillos",
  "Cieneguilla","Comas","El Agustino","Independencia","Jesús María",
  "La Molina","La Victoria","Lima","Cercado de Lima","Lince","Los Olivos","Lurigancho-Chosica",
  "Lurín","Magdalena del Mar","Miraflores","Pachacámac","Pucusana",
  "Pueblo Libre","Puente Piedra","Punta Hermosa","Punta Negra",
  "Rímac","San Bartolo","San Borja","San Isidro","San Juan de Lurigancho",
  "San Juan de Miraflores","San Luis","San Martín de Porres",
  "San Miguel","Santa Anita","Santa María del Mar","Santa Rosa",
  "Santiago de Surco","Surquillo","Villa El Salvador",
  "Villa María del Triunfo","Callao","Bellavista","La Perla",
  "La Punta","Mi Perú","Ventanilla"
].sort((a, b) => a.localeCompare(b, "es"));

// ── Códigos de producto (CP1–CP11) ───────────────────────────────────────────

export const PRODUCTO_CP_LABELS: Record<string, string> = {
  CP1: 'CLÁSICOS', CP2: 'WAFFLE MANGA', CP3: 'NOTCH WAFFLE',
  CP4: 'WAFFLE CLÁSICO', CP5: 'CAMISERO PIQUÉ', CP6: 'WAFFLE CAMISERO',
  CP7: 'CAMISA WAFFLE', CP8: 'NOTCH PIQUÉ', CP9: 'BABY TEE',
  CP10: 'MANGA LARGA JERSEY', CP11: 'PROMOS',
};

export const PRODUCT_NAME_TO_CP: Record<string, string> = {
  'CLASICO': 'CP1',
  'WAFFLE MANGA LARGA': 'CP2',
  'CUELLO NOTCH WAFLE': 'CP3',
  'WAFFLE': 'CP4',
  'CAMISERO PIKE': 'CP5',
  'WAFFLE CAMISERO': 'CP6',
  'CAMISA WAFFLE': 'CP7',
  'CUELLO NOTCH PIQUE': 'CP8',
  'BABY TY': 'CP9', 'BABY TY ESCOTADO': 'CP9',
  'BABY TY MANGA': 'CP9', 'BABY TY MANGA ESCOTADO': 'CP9',
  'JERSEY MANGA LARGA': 'CP10',
};

export function getCodigoProducto(detalle: string, combo?: string): string {
  const codes = new Set<string>();
  const src = ((detalle || '') + ' ' + (combo || '')).toUpperCase();

  if (/JERSEY MANGA LARGA|MANGALARGA JERSEY/.test(src)) codes.add('CP10');
  if (/WAFFLE MANGA LARGA|MANGALARGA WAFLE/.test(src)) codes.add('CP2');
  if (/CUELLO NOTCH WAFLE|NOTCH WAFLE/.test(src)) codes.add('CP3');
  if (/CUELLO NOTCH PIQUE|NOTCH PIQUE/.test(src)) codes.add('CP8');
  if (/WAFFLE CAMISERO|CAMISERO WAFLE/.test(src)) codes.add('CP6');
  if (/CAMISERO PIKE|CAMISERO PIQUE/.test(src)) codes.add('CP5');
  if (/CAMISA WAFLE|CAMISA WAFFLE/.test(src)) codes.add('CP7');
  if (/BABY TY|BABY TEE/.test(src)) codes.add('CP9');
  if (/\bCLASICO\b/.test(src)) codes.add('CP1');
  if (/PROMO|MIXTURA|BELLACA|SALVAJE|\bFLOW\b/.test(src)) codes.add('CP11');

  // Plain WAFFLE only if not already covered by a compound pattern
  const stripped = src
    .replace(/WAFFLE MANGA LARGA|MANGALARGA WAFLE/g, '')
    .replace(/WAFFLE CAMISERO|CAMISERO WAFLE/g, '')
    .replace(/CAMISA WAFLE|CAMISA WAFFLE/g, '')
    .replace(/CUELLO NOTCH WAFLE|NOTCH WAFLE/g, '')
    .replace(/CUELLO CHINO WAFFLE/g, '');
  if (/MANGA CORTA WAFLE|\bWAFFLE\b|\bWAFLE\b/.test(stripped)) codes.add('CP4');

  return codes.size > 0 ? Array.from(codes).join(', ') : '—';
}
