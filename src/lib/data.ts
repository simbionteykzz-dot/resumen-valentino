export const POLOS_CATALOGO_OVERSHARK = [
  "BABY TY", "BABY TY MANGA", "CAMISA WAFFLE", "CAMISERO JERSEY", "CAMISERO PIKE",
  "CLASICO", "CUELLO CHINO", "CUELLO CHINO WAFFLE", "JERSEY MANGA LARGA", "OVERSIZE",
  "WAFFLE", "WAFFLE CAMISERO", "WAFFLE MANGA LARGA", "CUELLO NOTCH PIQUE", "CUELLO NOTCH WAFLE"
];

export const TALLAS_SML = ["S", "M", "L"];
export const TALLAS_SMLXL = ["S", "M", "L", "XL"];

export const COLORES_BABY_TY = "Azul, Beige, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino, Menta";
export const COLORES_CAMISA_WAFFLE = "Beige, Botella, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino";
export const COLORES_15_POLO = "Azul, Beige, Botella, Camote, Cemento, Denim, Marron, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";
export const COLORES_CUELLO_CHINO = "Azul, Beige, Botella, Cemento, Negro, Topo, P. Rosa, Perla, Vino";
export const COLORES_CUELLO_CHINO_WAFFLE = "Azul, Botella, Cemento, Negro, Pacay, P. Rosa, Perla, Plomo, Vino";
export const COLORES_JERSEY_ML = "Azul, Beige, Cemento, Denim, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";

export const POL_VARIANTES_OVERSHARK: Record<string, { tallas: string[], colores: string }> = {
  "BABY TY": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "BABY TY MANGA": { tallas: TALLAS_SML, colores: COLORES_BABY_TY },
  "CAMISA WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_CAMISA_WAFFLE },
  "CAMISERO JERSEY": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CAMISERO PIKE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CLASICO": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO CHINO": { tallas: TALLAS_SMLXL, colores: COLORES_CUELLO_CHINO },
  "CUELLO CHINO WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_CUELLO_CHINO_WAFFLE },
  "JERSEY MANGA LARGA": { tallas: TALLAS_SMLXL, colores: COLORES_JERSEY_ML },
  "OVERSIZE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "WAFFLE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "WAFFLE CAMISERO": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "WAFFLE MANGA LARGA": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO NOTCH PIQUE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO },
  "CUELLO NOTCH WAFLE": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO }
};

export const POL_PRECIOS_OVERSHARK: Record<string, number> = {
  "BABY TY": 45, "BABY TY MANGA": 45, "CAMISA WAFFLE": 45, "CAMISERO JERSEY": 45,
  "CAMISERO PIKE": 45, "CLASICO": 45, "CUELLO CHINO": 45, "CUELLO CHINO WAFFLE": 45,
  "JERSEY MANGA LARGA": 45, "OVERSIZE": 45, "WAFFLE": 45, "WAFFLE CAMISERO": 45,
  "WAFFLE MANGA LARGA": 45, "CUELLO NOTCH PIQUE": 45, "CUELLO NOTCH WAFLE": 45
};

export const ENVIO_PROVINCIA_SOLES = 12;
export const ENVIO_LIMA_SOLES = 14;

export const PROMOS_DATA: Record<string, {name: string, comboData: string, price: number, list: {n: string, q: number}[]}> = {
  // Promos individuales por modelo
  "pique_5_99":        { name: "Camisero Pique 5×99",      comboData: "CAMISERO PIQUE 5 X 99",      price: 99, list: [{n:"CAMISERO PIKE",      q:5}] },
  "wafle_cam_4_99":    { name: "Camisero Wafle 4×99",      comboData: "CAMISERO WAFLE 4 X 99",      price: 99, list: [{n:"WAFFLE CAMISERO",    q:4}] },
  "clasico_10_99":     { name: "Clásico 10×99",            comboData: "CLASICO 10 X 99",            price: 99, list: [{n:"CLASICO",            q:10}] },
  "wafle_6_99":        { name: "Manga corta Wafle 6×99",   comboData: "MANGA CORTA WAFLE 6 X 99",   price: 99, list: [{n:"WAFFLE",            q:6}] },
  "ml_wafle_4_99":     { name: "Mangalarga Wafle 4×99",    comboData: "MANGALARGA WAFLE 4 X 99",    price: 99, list: [{n:"WAFFLE MANGA LARGA", q:4}] },
  "ml_jersey_7_99":    { name: "Mangalarga Jersey 7×99",   comboData: "MANGALARGA JERSEY 7 X 99",   price: 99, list: [{n:"JERSEY MANGA LARGA", q:7}] },
  "camisa_wafle_3_99": { name: "Camisa Wafle 3×99",        comboData: "CAMISA WAFLE 3 X 99",        price: 99, list: [{n:"CAMISA WAFFLE",      q:3}] },
  // Baby Ty (ambos modelos)
  "baby_ty_7_99":        { name: "Baby Ty 7×99",           comboData: "BABY TY 7 X 99",            price: 99, list: [{n:"BABY TY",           q:7}] },
  "baby_ty_manga_7_99":  { name: "Baby Ty Manga 7×99",     comboData: "BABY TY MANGA 7 X 99",      price: 99, list: [{n:"BABY TY MANGA",     q:7}] },
  "baby_ty_3_50":        { name: "Baby Ty 3×50",           comboData: "BABY TY 3 X 50",            price: 50, list: [{n:"BABY TY",           q:3}] },
  "baby_ty_manga_3_50":  { name: "Baby Ty Manga 3×50",     comboData: "BABY TY MANGA 3 X 50",      price: 50, list: [{n:"BABY TY MANGA",     q:3}] },
  // Promociones mixtas
  "mixtura": { name: "Promoción Mixtura 6×99",  comboData: "PROMOCIÓN MIXTURA 6 X 99",  price: 99, list: [{n:"CAMISERO JERSEY", q:2}, {n:"WAFFLE", q:2}, {n:"CAMISERO PIKE", q:2}] },
  "bellaca":  { name: "Promoción Bellaca 6×99", comboData: "PROMOCIÓN BELLACA 6 X 99",  price: 99, list: [{n:"CLASICO", q:3}, {n:"WAFFLE", q:1}, {n:"CAMISERO PIKE", q:1}, {n:"WAFFLE MANGA LARGA", q:1}] },
  "flow":     { name: "Promoción Flow 7×99",    comboData: "PROMOCIÓN FLOW 7 X 99",     price: 99, list: [{n:"CLASICO", q:5}, {n:"CAMISERO PIKE", q:2}] },
  "salvaje":  { name: "Promoción Salvaje 6×99", comboData: "PROMOCIÓN SALVAJE 6 X 99",  price: 99, list: [{n:"WAFFLE CAMISERO", q:2}, {n:"CLASICO", q:4}] },
  // Cuello Notch
  "notch_pique_5_99": { name: "Cuello Notch Pique 5×99", comboData: "CUELLO NOTCH PIQUE 5 X 99", price: 99, list: [{n:"CUELLO NOTCH PIQUE", q:5}] },
  "notch_wafle_4_99": { name: "Cuello Notch Wafle 4×99", comboData: "CUELLO NOTCH WAFLE 4 X 99", price: 99, list: [{n:"CUELLO NOTCH WAFLE", q:4}] },
};

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
