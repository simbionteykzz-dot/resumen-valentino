(function(){
    var btn = document.getElementById("btn-export-sheet-pdf");
    var target = document.getElementById("sales-sheet-export");
    var toast = document.getElementById("toast");
    if (!btn || !target) return;

    function notify(msg){
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(notify._t);
      notify._t = setTimeout(function(){ toast.classList.remove("show"); }, 2200);
    }

    btn.addEventListener("click", async function(){
      if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
        notify("No se pudo cargar el motor PDF");
        return;
      }
      var oldText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Generando PDF...";
      try {
        var mainTable = target.querySelector(".sales-sheet");
        var footerTable = target.querySelector(".sheet-footer");
        var exportWidth = 1600;
        var rightGutter = 120; // evita corte del borde/última columna al rasterizar
        if (mainTable) exportWidth = Math.max(exportWidth, mainTable.scrollWidth || 0);
        if (footerTable) exportWidth = Math.max(exportWidth, footerTable.scrollWidth || 0);
        exportWidth += rightGutter;

        var clone = target.cloneNode(true);
        clone.removeAttribute("id");
        clone.style.position = "fixed";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.transform = "translateX(-220vw)";
        clone.style.pointerEvents = "none";
        clone.style.background = "#fff";
        clone.style.padding = "0";
        clone.style.margin = "0";
        clone.style.zIndex = "9999";
        clone.style.display = "inline-block";
        clone.style.width = exportWidth + "px";
        clone.style.paddingRight = rightGutter + "px";

        var cloneMainWrap = clone.querySelector(".sheet-wrap");
        var cloneFooterWrap = clone.querySelector(".sheet-footer-wrap");
        var cloneMainTable = clone.querySelector(".sales-sheet");
        var cloneFooterTable = clone.querySelector(".sheet-footer");
        if (cloneMainWrap) {
          cloneMainWrap.style.overflow = "visible";
          cloneMainWrap.style.width = exportWidth + "px";
        }
        if (cloneFooterWrap) {
          cloneFooterWrap.style.overflow = "visible";
          cloneFooterWrap.style.width = exportWidth + "px";
        }
        if (cloneMainTable) {
          cloneMainTable.style.width = exportWidth + "px";
          cloneMainTable.style.minWidth = exportWidth + "px";
        }
        if (cloneFooterTable) {
          cloneFooterTable.style.width = exportWidth + "px";
          cloneFooterTable.style.minWidth = exportWidth + "px";
        }

        document.body.appendChild(clone);
        var canvas = await window.html2canvas(clone, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          width: clone.scrollWidth + rightGutter,
          height: clone.scrollHeight,
          windowWidth: Math.max(document.documentElement.clientWidth, clone.scrollWidth + rightGutter),
          windowHeight: Math.max(document.documentElement.clientHeight, clone.scrollHeight)
        });
        clone.remove();

        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
        var pageW = pdf.internal.pageSize.getWidth();
        var pageH = pdf.internal.pageSize.getHeight();
        var margin = 5;
        var maxW = pageW - margin * 2;
        var maxH = pageH - margin * 2;
        var ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
        var outW = canvas.width * ratio;
        var outH = canvas.height * ratio;
        var x = (pageW - outW) / 2;
        var y = (pageH - outH) / 2;
        var img = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(img, "PNG", x, y, outW, outH, undefined, "FAST");
        pdf.save("planilla-ventas.pdf");
        notify("PDF exportado en una sola hoja");
      } catch (err) {
        console.error(err);
        notify("Error al exportar PDF");
      } finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });
  })();

(function(){
    var body = document.getElementById("sales-sheet-body");
    if (!body) return;
    var rows = 40;
    var cols = 16; // sin incluir la columna N°
    var html = "";
    for (var i = 1; i <= rows; i++) {
      html += "<tr>";
      html += "<td class=\"col-n\">" + i + "</td>";
      for (var c = 0; c < cols; c++) {
        var preset = "";
        if (c === 3) preset = "I.T";   // Método de pago
        if (c === 8) preset = "R-D";   // Código de publicidad
        html += "<td contenteditable=\"true\">" + preset + "</td>";
      }
      html += "</tr>";
    }
    body.innerHTML = html;
  })();

/* ================================================================
   * BUSCADOR SHALOM v4 — 547 sedes oficiales (API Shalom)
   * Fuente: serviceswebapi.shalomcontrol.com (exportado 2025)
   * Con coordenadas GPS → enlace directo a Google Maps
   * ================================================================ */
  (function(){
    /* [nombre, zona/distrito, provincia, departamento, dirección, lat, lon] */
    var DATA = [
      ["Chachapoyas Co Dos de Mayo","Chachapoyas","Chachapoyas","Amazonas","Jr. Dos de Mayo Cdra. 15 s/n Chachapoyas, Referencia: Junto a Terminal de Combis Etsa",-6.238673290149498,-77.86800826533634],
      ["Chachapoyas Jr Grau","Chachapoyas","Chachapoyas","Amazonas","Jr. Grau 270, Ref. Junto a la Agencia de Viajes Monteverde",-6.226990739068646,-77.87195979113727],
      ["Bagua Capital","Bagua","Bagua","Amazonas","Jr. Amazonas C-9 Mz. 126 Lt. 25, Bagua - Bagua - Amazonas, Ref. Frente al Parque Jerusalen Y/o Costado de Avicola Yaceg",-5.634700302844137,-78.52837892250335],
      ["Pedro Ruiz","Jazan","Bongara","Amazonas","Av. Sacsahuaman n° 513 - Pedro Ruiz, Ref. a Media Cuadra de la Ugel",-5.9481590587064455,-77.97919108649704],
      ["Luya","Luya","Luya","Amazonas","Jr. Ramón Castilla S/n, Luya - Amazonas, Ref. Entre el Colegio Secundario Ramón Castilla y el Jr. José Gálvez, a Media Cdra. del Agente de Venta de Pasajes de Civa, Móvil y Transporte Chiclayo",-6.159612028355043,-77.94471980156138],
      ["Bagua Grande","Bagua Grande","Utcubamba","Amazonas","Av. Chachapoyas 1094 Sector Gonchillo, Ref. a 2 Cuadras de la Clínica Señor de los Milagros",-5.750277132825345,-78.4491910472481],
      ["Huaraz","Huaraz","Huaraz","Ancash","Av. 27 de Noviembre Cdra. 20 s/n - Villon Bajo, Referencia: al Costado del Grifo Primax",-9.541547,-77.531075],
      ["Carhuaz","Carhuaz","Carhuaz","Ancash","Carretera Central 00s/n Cent Carhuaz - Carhuaz - Áncash, Ref. Media Cuadra Antes de Llegar al Estadio Municipal Capitan Carlos Mejia",-9.2841105,-77.6468648],
      ["Casma","Casma","Casma","Ancash","Av. Miguel Grau Mz. D 4 Lt. 1 Casma - Ancash, Ref. Frente al Jardín de Infancia",-9.471861322819583,-78.30313634110433],
      ["Huarmey","Huarmey","Huarmey","Ancash","Carr. Panamericana Norte n° Km 293 Sect. Panamericana Huarmey – Ancash, Ref. a 4 Cdras. del Terminal Terrestre de Sur a Norte",-10.064877234998725,-78.15681888878282],
      ["Caraz","Caraz","Huaylas","Ancash","Av. 9 de Octubre n° 259 - Huaylas, Referencia: al Costado de la Empresa Móvil Tours",-9.04787902880895,-77.80347053395421],
      ["Av Enrique Meiggs","Chimbote","Santa","Ancash","Av. Enrique Meiggs n° 2457.",-9.093950271606445,-78.56846618652344],
      ["Av Jose Galvez","Chimbote","Santa","Ancash","Av. José Gálvez 791, Chimbote - Santa - Ancash, Ref. a 1 Cdra. Antes de Llegar al Puente Gálvez",-9.071184513562265,-78.5888226943701],
      ["Av. los Pescadores Co","Chimbote","Santa","Ancash","Par. Parcela n° 16757 - E Sector la Perla Tres Cabezas - Ancash, Ref. Frente al Estadio Centenario",-9.098217167822215,-78.55854656211379],
      ["Santa","Santa","Santa","Ancash","Panamericana Norte Km 442 - B, Santa, Ref. al Lado de la Ferreteria la Llave",-8.989422576204648,-78.61743026041556],
      ["Ovalo de la Familia","Nuevo Chimbote","Santa","Ancash","Urbanización José Carlos Mariategui (ex Unicreto) Mz R 3 Lt 3 Ref. a Una Cuadra del Óvalo la Familia",-9.127764,-78.517709],
      ["Tres de Octubre","Nuevo Chimbote","Santa","Ancash","Av. José Pardo Mz. K, Lt. 17 - Tres de Octubre, Referencia: Frente al Óvalo las Américas",-9.117818910245735,-78.5378990512906],
      ["Garatea","Nuevo Chimbote","Santa","Ancash","Urb. Nicolas Garatea Mz. 100 Lt. 24 - Nuevo Chimbote - Santa - Ancash, Ref. Frente al Paradero Autos N.- Garatea",-9.11849828064508,-78.50611072320724],
      ["Av. Pacífico Belen","Nuevo Chimbote","Santa","Ancash","Aa.hh. Belen Mz O Lt 28 - Nuevo Chimbote - Santa - Ancash, Ref. Frente al Grifo Doxa",-9.132971824536801,-78.5090826138449],
      ["Yungay","Yungay","Yungay","Ancash","Jr. Industrial, Lte. 14 - Yungay, Ref. al Costado del Terminal Terrestre y la Tapiceria Fredy",-9.139738290927944,-77.74721144557195],
      ["Abancay","Abancay","Abancay","Apurimac","Av. Panamericana s/n - Abancay - Apurímac, Ref. a 100 Metros de la Comisaría de Bellavista, al Costado de Maderera Vega",-13.638156277624846,-72.89899346011285],
      ["Andahuaylas","Andahuaylas","Andahuaylas","Apurimac","Av. los Cedros 274, Referencia: a 70 Metros del Puente del Hospital de Andahuaylas",-13.658870668059825,-73.38357434212068],
      ["Almacén Andahuaylas","Andahuaylas","Andahuaylas","Apurimac","Jr. Picaflor 139 , Andahuaylas - Andahaylas - Apurimac",-13.659454540618006,-73.38368065841449],
      ["Challhuahuacho","Challhuahuacho","Cotabambas","Apurimac","Barrio Wichaypampa Lt. 13 - 15 - 16, Challhuahuacho - Cotabambas - Apurímac, Ref. a Dos Cdras del Terminal Terrestre de Challhuahuacho / a Espaldas del Taller E&l",-14.123588600655347,-72.25614026073009],
      ["Av Parra 379 Co","Arequipa","Arequipa","Arequipa","Av. Parra 379 - Arequipa",-16.414719927538005,-71.5477839100329],
      ["Aeropuerto Arequipa","Arequipa","Arequipa","Arequipa","Aeropuerto Internacional Alfredo Rodríguez",0.0,0.0],
      ["Mall Lambramani","Arequipa","Arequipa","Arequipa","Av. Lambramani 325, Arequipa - Arequipa - Arequipa, Ref. Dentro del Mall Parque Arauco Piso - 4 (sótano)",-16.4115,-71.5212],
      ["Av Lima","Alto Selva Alegre","Arequipa","Arequipa","Av. Lima n° 406 – Alto Selva Alegre - Arequipa, Ref. Esquina con Av. Obrera Cuadra 20",-16.373025713808378,-71.51211177051657],
      ["Av Augusto Salazar Bondy","Alto Selva Alegre","Arequipa","Arequipa","Augusto Salazar Bondy Mz J Lt 4 Alto Selva Alegre - Arequipa, Ref. a Media Cdra. de la Iglesia Guadalupe",-16.380360193926304,-71.5257784038041],
      ["Plaza la Tomilla","Cayma","Arequipa","Arequipa","Av. Ramón Castilla n° 1000 - B la Tomilla Cayma - Referencia: en la Misma Plaza Tomilla",-16.3575544,-71.5437086],
      ["Av Charcani","Cayma","Arequipa","Arequipa","Av. Charcani 401 Asoc. Jose Olaya, Ref. Frente al Colegio Mendel",-16.33991795210297,-71.54047452339236],
      ["Ciudad Municipal","Cerro Colorado","Arequipa","Arequipa","Mz. A, Sub Lt. 2 A, Asentamiento Poblacional Asociación Centro Industrial las Canteras, Cerro Colorado - Arequipa, Ref. al Costado del Grifo Primax",-16.327887664430715,-71.59452847055816],
      ["Asoc las Flores - Av 54","Cerro Colorado","Arequipa","Arequipa","Asoc. las Flores Zn.2 Mz.j Lt.8 - Cerro Colorado - Referencia: Av 54 - a Media Cuadra de Ferretería Gino",-16.327233470873743,-71.56931089223701],
      ["Av Pumacahua","Cerro Colorado","Arequipa","Arequipa","Urb. San Felipe Av Pumacahua Lt 14, Cerro Colorado Arequipa, Ref. a Dos Cdras. Antes de Llegar al Metro Cencosud / Ex Notaria Concha Revilla.",-16.377530805257493,-71.55688960685174],
      ["Zamacola","Cerro Colorado","Arequipa","Arequipa","Calle Yavarí 507 B - Zamacola - Cerro Colorado – Arequipa, Ref. a Una Cuadra de la Posta de Zamacola (marcisa Campos)",-16.351667075040012,-71.56080517997205],
      ["Av los Incas","Cerro Colorado","Arequipa","Arequipa","Av. los Incas n° 604 Semirural Pachacutec – Cerro Colorado - Arequipa, Ref. Esquina con Calle San Martin Semirural Pachacutec",-16.39202489921236,-71.57013806449568],
      ["Autopista la Joya","Cerro Colorado","Arequipa","Arequipa","Asoc. Urbanizadora Peruarbo Sector Peru Zona I Mz. B4 Lt. 4 - Autopista la Joya - Arequipa, Ref. Autopista Arequipa - la Joya, a Dos Cdras. del Sauna Candamo",-16.346111743448198,-71.60602780000015],
      ["Asoc. Nuevo Horizonte - Av. 54","Cerro Colorado","Arequipa","Arequipa","Nuevo Horizonte Mz.h Lote 12 - Cerro Colorado - Arequipa, Ref. con Av.54 a Cuatro Cdras. de Inkafarma",-16.327308817549067,-71.55416669999998],
      ["Jacobo Hunter","Jacobo Hunter","Arequipa","Arequipa","Calle Argentina # 405 - A, Jacobo Hunter - Arequipa, Ref. Frente al Cajero de Caja Arequipa y Esquina con el Banco Caja Arequipa",-16.439139255429723,-71.5595001106355],
      ["El Cruce la Joya","La Joya","Arequipa","Arequipa","Lateral 12 C Lt. 32, el Cruce la Joya - Arequipa, Ref. al Costado del Grifo Primax de la Joya",-16.492806242963454,-71.84780560002692],
      ["Mariano Melgar","Mariano Melgar","Arequipa","Arequipa","Calle Ancash n° 202 - Mariano Melgar, Ref. a la Altura del Coliseo del Niño",-16.40347178489046,-71.5114991875102],
      ["Miraflores Arequipa","Miraflores","Arequipa","Arequipa","Av. Goyoneche n° 1422, Ref. Esquina Francisco Bolognesi",-16.3926865,-71.5180864],
      ["Urb Manuel Prado","Paucarpata","Arequipa","Arequipa","Calle Belén N°100 - a Urb. Manuel Prado - Paucarpata Referencia: a Espaldas del Cc. Mall Aventura Porongoche.",-16.4169283,-71.5124596],
      ["Av Jesus","Paucarpata","Arequipa","Arequipa","Av. Jesús n° 1100 Paucarpata – Arequipa, Ref. con Esquina Arturo Villegas n° 101.",-16.41480367033679,-71.50894507055084],
      ["Av Socabaya - los Toritos","Socabaya","Arequipa","Arequipa","Av. Socabaya 301 - Urb. San Martín de Socabaya, Ref. al Frente del Parque Victor Barriga",-16.437847543940467,-71.52998970361512],
      ["Av. Horacio Zevallos","Socabaya","Arequipa","Arequipa","Asentamiento Urbano Municipal Horacio Zeballos Gamez Sector E Mz. 1 Lt. 18 Socabaya - Arequipa, Ref. al Costado del Colegio Joule Y/o 2 Cdras. del Penal de Socabaya",-16.485388899999982,-71.50141737055226],
      ["Uchumayo","Uchumayo","Arequipa","Arequipa","Urb. el Carmen M. E. Lt. 1 Congata del Distrito Uchumayo - Arequipa, Ref. a Dos Cdras. de la Comisaria Congata",-16.445521,-71.61994],
      ["Yanahuara","Yanahuara","Arequipa","Arequipa","Urbanización el Jardín A8 - a Yanahuara - Arequipa, Ref. a Espaldas de la Av. Ejército, Tiendas Yumi",-16.3922209134051,-71.54236109999015],
      ["Yura","Yura","Arequipa","Arequipa","Mz. O Lt. 4 Zna 2 Ciudad de Dios - Yura - Arequipa, Ref. Carretera Yura",-16.30674960449692,-71.61527645889547],
      ["Camana","Camana","Camana","Arequipa","Calle Agustín Gamarra n° 451, Cercado Camaná, Referencia: al Frente del Delivey Caseritos",-16.618666,-72.710622],
      ["Chala","Chala","Caraveli","Arequipa","Av. Emancipacion Nro. s/n Mz. 78 Lt. 10. Ref. a Media Cdra. del Parque del Niño Chalino",-15.849445506231104,-74.2553071755598],
      ["Aplao","Aplao","Castilla","Arequipa","Ubica en la Manzana X1, Lote 07, de la Calle 8 de Setiembre, Aplao - Castilla - Arequipa, Ref. a Una Cdra. de Ministerial Público Fiscalía",-16.078428090429057,-72.49185348329645],
      ["Calle Yarabamba","Majes","Caylloma","Arequipa","Calle Yarabamba, Mz. y Lt 7. Villa el Pedregal, Majes - Caylloma - Arequipa, Ref. a Media Cdra. de la Notaria Terán Bejar",-16.35822261624101,-72.19047223838463],
      ["Av Colonizadores Co","Majes","Caylloma","Arequipa","Av. Lote Colonizadores. 4 Parcela 180, Majes - Caylloma - Arequipa, Ref. a Media Cdra. del Grifo el Eje",-16.352289700015334,-72.18092614106098],
      ["Mollendo Co","Mollendo","Islay","Arequipa","Mariscal Castilla 472 –a, Arequipa - Islay - Mollendo, Ref. al Costado de Cei “mi Carrusel”",-17.021804037741244,-72.01391689223719],
      ["Cercado Mollendo","Mollendo","Islay","Arequipa","Calle Dean Valdivia 388 Cercado, Referencia: Esquina con Blondel",-17.0279153,-72.014653],
      ["Cocachacra","Cocachacra","Islay","Arequipa","Centro Poblado Cocachacra Mz. N5 Sub-lote 5b Calle Dean Valdivia, Cocachacra - Islay - Arequipa, Ref. del Parque San Francisco Una Cdra. Hacia Abajo",-17.096111691038246,-71.77300012669258],
      ["Matarani","Islay","Islay","Arequipa","Asentamiento Humano. Puerto Nuevo Mz. I Lt. 18 Av. Bello Horizonte, Islay - Islay - Arequipa, Ref. Frente al Parque Ecológico",-16.99849950876988,-72.09677705815257],
      ["Ayacucho Co","Ayacucho","Huamanga","Ayacucho","Aa.hh Complejo Artesanal T1 Lt1 - Ayacucho - Referencia : a Una Cuadra de la Puerta 2 del Terminal Terrestre Libertadores de América",-13.1349252,-74.2326602],
      ["Carmen Alto","Carmen Alto","Huamanga","Ayacucho","Asentamiento Humano Carmen Alto Mz B1 Lote 9 Zona Ii Acuchimay Carmen Alto – Huamanga- Ayacucho, Ref. a 1 Cuadra de la Municipalidad de Carmen Alto",-13.178399652890626,-74.22049567055375],
      ["San Juan Bautista","San Juan Bautista","Huamanga","Ayacucho","Av. Venezuela n° 431 – Urb. Aprovisa, San Juan Bautista - Huamanga - Ayacucho, Ref. Altura del Hostal la Oriental, Cerca al Seguro de Essalud",-13.175943594200712,-74.1993244999912],
      ["Jesus Nazareno","Jesus Nazareno","Huamanga","Ayacucho","Jr. José María Eguren 451 - Jesus Nazareno - Huamanga - Ayacucho, Ref. Cruce con Jr. Mariano Melgar",-13.1547603059122,-74.21407332944754],
      ["Huanta","Huanta","Huanta","Ayacucho","Jr. Gervasio Santillana N°976 - Huanta - Ayacucho. Ref, Cruce con Jr. Revolución",-12.937385673234676,-74.25549100579818],
      ["Cajamarca Co","Cajamarca","Cajamarca","Cajamarca","Av. Independencia n° 787 Barrio Santa Elena",-7.1712133,-78.5120151],
      ["Cajamarca Horacio Zevallos","Cajamarca","Cajamarca","Cajamarca","Jr. Emilio Barrantes Mz X Lote 3 Urb. Horacio Zevallos - Cajamarca. Referencia a Una Cuadra de la Universidad Privada del Norte (upn) y Vía de Evitamiento Norte Cuadra 13.",-7.1494038,-78.5064654],
      ["Barrio San Jose","Cajamarca","Cajamarca","Cajamarca","Jr. Chanchamayo n° 1162 - Barrio San José Cajamarca, Referencia: Paralela con Jr. Huancavelica y Jr. Sara Macdougall.",-7.149782995828176,-78.5206235201001],
      ["Aeropuerto Cajamarca","Cajamarca","Cajamarca","Cajamarca","Aeropuerto Mayor General Fap Armando Revoredo Iglesias",0.0,0.0],
      ["Huambocancha Baja","Cajamarca","Cajamarca","Cajamarca","Mz. a Lote s/n – Barrio Huambocancha Baja – Cajamarca, Ref. a Una Cdra. del Paradero de la P13/al Costado del Campo Deportivo el Patriarca",-7.1184173250979565,-78.52841806481125],
      ["Barrio San Martín","Cajamarca","Cajamarca","Cajamarca","Jirón los Gladiolos n° 336 Barrio San Martín, Cajamarca – Cajamarca – Cajamarca, Ref. a la Altura de la Cdra. 13 de la Vía de Evitamiento Sur /a Una Cdra. de la Universidad Nacional de Cajamarca",-7.169900305097149,-78.4990036643373],
      ["Huaraclla","Jesus","Cajamarca","Cajamarca","Mz. a Lote s/n Cp Huaraclla - Jesus - Cajamarca, Ref. a Una Cdra. de la I.e. José Olaya Balandra.",-7.232860467550807,-78.41091767189938],
      ["Baños del Inca","Los Banos del Inca","Cajamarca","Cajamarca","Jr. Cahuide n° 242 – Lotiz. Hurtado Miller – Baños del Inca – Cajamarca, Ref. a Espaldas de Senati y a Una Cdra. de la Base de Serenazgo de Baños del Inca",-7.1635582612720174,-78.46844372944771],
      ["Cajabamba","Cajabamba","Cajabamba","Cajamarca","Jr. Caceres n° 211 Cajabamba – Cajamarca, Ref. Esquina con Jose Leal",-7.627328845676696,-78.04748635184613],
      ["Celendin","Celendin","Celendin","Cajamarca","Jr. Pedro Ortiz Montoya 148, Referencia: Esquina con Av. Amazonas",-6.87147955435866,-78.14372690136021],
      ["Chota","Chota","Chota","Cajamarca","Av. Fray José Arana N 805 - Referencia : Frente al Terminal Angel Divino",-6.562775,-78.653349],
      ["Chilete","Chilete","Contumaza","Cajamarca","Jr. Santa Rosa n° 130 - Chilete, Ref. a 100 del Puente de Ingreso a Chilete",-7.222293227560651,-78.837805204499],
      ["Tembladera Cajamarca","Yonan","Contumaza","Cajamarca","Jr. Bolognesi s/n – Tembladera - Yonan - Contumazá - Cajamarca, Ref. al Frente del Parque Víctor Raúl Haya de la Torre",-7.252584600691804,-79.13286097909129],
      ["Cutervo","Cutervo","Cutervo","Cajamarca","Av. Salomón Vilchez Murga S/n. Cdra 9 Referencia : Frente a la Clínica Cutervo",-6.37884,-78.812233],
      ["Bambamarca","Bambamarca","Hualgayoc","Cajamarca","Av. Tupac Amaru 1105, Referencia: al Costado del Paradero al Cumbe",-6.677954,-78.525601],
      ["Jaen","Jaen","Jaen","Cajamarca","Av. Pakammuros Cuadra 6 s/n - Referencia: Esquina con Calle Libertad n° 490",-5.7098471730857545,-78.80305781962986],
      ["San Ignacio","San Ignacio","San Ignacio","Cajamarca","Pasaje Tres n° 113 Urb Santa Rosa, Cajamarca - San Ignacio, Ref. Frente al Estado Municipal",-5.142808136460294,-78.99832073809802],
      ["San Marcos","Pedro Galvez","San Marcos","Cajamarca","Jr. Adolfo Amorin Bueno n° 140 San Marcos – Cajamarca, Ref. al Frente de la Plaza Agropecuaria",-7.334355550504191,-78.17426193581196],
      ["San Miguel Cajamarca","San Miguel","San Miguel","Cajamarca","Jr. Bolognesi n° 717 – San Miguel – Cajamarca - Cajamarca, Ref. al Costado del Coliseo y el Paradero de Llapa y Cochán.",-7.000779131105248,-78.84975134110684],
      ["San Pablo Cajamarca","San Pablo","San Pablo","Cajamarca","Jr. Tnt. Lorenzo Iglesia n° 910 - San Pablo – Cajamarca - Cajamarca, Ref. a Media Cdra. del Hospital San Pablo",-7.115107999999666,-78.82337200000073],
      ["Callao Faucett","Callao","Callao","Callao","Av. Elmer Faucett n° 492",-12.049958017539462,-77.09809500001097],
      ["Av Quilca","Callao","Callao","Callao","Unidad Inmobiliaria n° 1, Av. Quilca Mz. G Sub Lt. 11c, Urb. Aeropuerto – Segundo Sector - Callao, Ref. Cruce con Calle 1, Frente a la Iglesia de Testigos de Jehová",-12.033462418573276,-77.0964266665613],
      ["Aeropuerto Callao","Callao","Callao","Callao","Aeropuerto Internacional Jorge Chavez",0.0,0.0],
      ["Outlet Arauco Faucett","Callao","Callao","Callao","Av. Elmer Faucett 3443 - Callao, Ref. al Costado del Aeropuerto Jorge Chávez",-12.018873043479367,-77.10865123042156],
      ["Av Bertello Callao","Callao","Callao","Callao","Av. Alejandro Bertello Bollati Mz. B Lt. 20 y 21 – Urb. Progresiva Bahía Blanca – Callao - Callao - Callao, Ref. Frente al Mercado Costa Azul",-11.985684611868939,-77.11583789999891],
      ["Av Saenz Peña","Callao","Callao","Callao","Av. Saenz Peña n° 414 - 416 - Callao - Callao, Ref. Cruce con Av. Marco Polo",-12.061012700004229,-77.14257909998511],
      ["Bellavista Callao","Bellavista","Callao","Callao","Av. Elmer Faucett 1641 - Urb. Jardines Virú Mz. B Lt 46, Bellavista - Callao, Ref. a 2 Cuadras del Cruce de Av. Faucett con Av. Venezuela",-12.060813729761168,-77.0975644930893],
      ["Ovalo la Perla","La Perla","Callao","Callao","Av. la Marina 530, Urb. Benjamin Doigg Lossio, la Perla, Callao, Ref. a 3 Cuadras del Óvalo de la Perla",-12.068000755732927,-77.11576445275213],
      ["Parad. los Licenciados","Ventanilla","Callao","Callao","Calle 19, Mz. J Lt. 26 Zn - Urb. Coop. de la Marina, Referencia: al Costado de Lubricentro Pablito Romero",-11.87987048810658,-77.12691298460291],
      ["Av 225 Pdro 2 Chinitas","Ventanilla","Callao","Callao","Urb. Popular de Interés Social (upis) – Proyecto Especial Ciudad Pachacutec, Mz. A, Lt. 23, Sect. G Pachacutec - Ventanilla, Ref. Grifo Repsol Cruce de Av. 225 con Av. los Arquitectos",-11.838057699998409,-77.139294570531],
      ["Pachacutec Av. 225","Ventanilla","Callao","Callao","Av. 225 Mz F Lote 2 Sector a Grupo Residencial A2 - Proyecto Piloto Nuevo Pachacutec, Ventanilla - Callao - Callao, Ref. Frente al Centro de Salud 3 de Febrero",-11.829064116197854,-77.15828967759875],
      ["Pachacutec Av 150","Ventanilla","Callao","Callao","Av. 150 Izquierda Mz. W2 Lt. 01 Proyecto Piloto Nuevo Pachacutec, Ventanilla - Callao - Callao, Ref. a 1 Cdra. del Cruce Av. Camino del Inca",-11.838273352411672,-77.15642144840947],
      ["Pachacutec Pard. Vc","Ventanilla","Callao","Callao","Av. 225 Mz. H Sublt. 11-a Proy. Esp. Ciudad Pachacutec - Ventanilla - Callao - Lima, Ref. a 1 Cdra. del Cruce con Av. los Proyectistas",-11.841692272352576,-77.13711549065079],
      ["Mi Peru","Mi Peru","Callao","Callao","V. Victor Raul Haya de la Torre Mz. a Lt. 02 Asentamiento Humano Confraternidad - Iii Sector - Mi Peru – Callao - Callao, Ref. Cruce con Av. Arequipa",-11.857445566174341,-77.12850028736655],
      ["Aeropuerto Cusco","Cusco","Cusco","Cusco","Aeropuerto Internacional Alejandro Velasco Astete",0.0,0.0],
      ["Tica Tica","Cusco","Cusco","Cusco","Arco Ticatica Pustipata, Lt. n° a - 11 - 2, Cusco, Ref. en la Av. Principal a 3 Cdras. del Mercado Tica Tica",-13.507250998862006,-71.99875209383625],
      ["San Jeronimo","San Jeronimo","Cusco","Cusco","Calle Ciro Alegría 226 - 224, Ref. Una Cuadra Antes del Paradero Penal en el Carril de Bajada",-13.545038230775114,-71.89580639587709],
      ["Cachimayo - San Sebastian","San Sebastian","Cusco","Cusco","Urb. Cachimayo A-37 Av. la Cultura – San Sebastian – Cusco, Ref. Entre Paradero Enaco y Parque Cachimayo, a 2 Cuadra de la Universidad Andina.",-13.534609281871573,-71.91066838454503],
      ["Via Expresa Sur","San Sebastian","Cusco","Cusco","Urb. Tupac Amaru B-1-2 San Sebastian – Cusco, Ref. Terminando la Via Expresa Zona Sur",-13.539137908489373,-71.90644367860767],
      ["Cusco Co Via Evitamiento","San Sebastian","Cusco","Cusco","Av. Evitamiento s/n Ups Chacahuayco, San Sebastian - Cusco - Cusco, Ref. Vía Evitamiento en el Paradero Horacio",-13.54227910382104,-71.91819439999605],
      ["Av Antonio Lorena","Santiago","Cusco","Cusco","Prolongación Av. Antonio Lorena # 140 - Santiago, Cusco, Referencia: al Frente del Cementerio Almudena",-13.5257396,-71.9879012],
      ["Urb. Bancopata Av. Industrial","Santiago","Cusco","Cusco","Av. Industrial Urb. Bancopata J-20, Santiago - Cusco, Ref. a 2 Cdras. del Ovalo Pachacutec, Frente a la Empresa Coca Cola",-13.533029936209823,-71.97014048092241],
      ["Huancaro","Santiago","Cusco","Cusco","Urb. Villa Union F-1-b Huancaro, Santiago - Cusco - Cusco, Ref. Frente a la Iglesia de los Mormones/ a Una Cdra. del Mercado Huancaro",-13.538445249518222,-71.981750657335],
      ["Cusco Parque Industrial","Wanchaq","Cusco","Cusco","Av. las Americas Mz. E Lt. 20, 2da Etapa, Urb. Parque Industrial, Wanchaq - Cusco, Ref. al Frente de Talleres Pfuro, al Frente de Mederera Urpi, Paralela a la Av Via Expresa.",-13.532971798458433,-71.94402756063253],
      ["Av Pachacutec","Wanchaq","Cusco","Cusco","Av. Pachacutec 429 - Wanchaq, Ref. a 100 Mtrs. de la Piscina Wanchaq",-13.52439575113539,-71.97013657902927],
      ["Velasco Astete","Wanchaq","Cusco","Cusco","Velasco Astete D3 - Wanchaq, Referencia: a 2 Cdras. del Aereopuerto",-13.53848438482397,-71.94663732182276],
      ["Anta Izcuchaca","Anta","Anta","Cusco","Parque del Carmen Lt. 1 Mz. B 2, Anta - Anta - Cusco, Ref. Paradero Carmen, Pista Principal Izcuchaca",-13.469611752104674,-72.13583397058508],
      ["Cusco Calca","Calca","Calca","Cusco","Av. Vilcanota Mz. a Lt 4 Calca - Cusco, Ref. Frente al Grifo Petro Perú O el Óvalo Puma - Entrada de Calca",-13.325449054919789,-71.95339242274841],
      ["Pisac","Pisac","Calca","Cusco","Av Vilcanota S/n, Pisac - Calca - Cusco, Ref. a Media Cdra. del Puente de Pisac / Carretera a Taray",-13.42350781713356,-71.85281378755049],
      ["Sicuani Co Ovalo San Andres","Sicuani","Canchis","Cusco","Prolong. Av. Arequipa 1010 S/n, Ref: al Costado del Grifo Guadalupe en el Óvalo San Andrés",-14.285420707912603,-71.22513697008289],
      ["Sicuani Av Manuel Callo","Sicuani","Canchis","Cusco","Jr. Inambari Nro. 208, Sicuani - Canchis - Cusco, Ref. al Frente del Bcp y de Caja Piura",-14.268306864712855,-71.22783410262176],
      ["Combapata","Combapata","Canchis","Cusco","Av. Señor de Huanca s/n - Combapata - Canchis - Cusco, Ref. al Costado del Grifo Señor de Qoylluriti - a Orillas de la Misma Carretera a Sicuani",-14.102278291533713,-71.42716975118488],
      ["Santo Tomas","Santo Tomas","Chumbivilcas","Cusco","Calle Bolognesi Mz. 02 Lt. 25, Santo Tomas - Chumbivilcas - Cusco, Ref. a Espaldas de la Polleria Pico Dorado y a Media Cdra. de la Av Santa Barbara",-14.450639460425453,-72.08486002496505],
      ["Espinar","Yauri ( Espinar )","Espinar","Cusco","Av. Tintaya n° 215 Espinar, Ref. a Dos Cuadra S de los Bomberos",-14.7926032,-71.4068692],
      ["Quillabamba","Santa Ana","La Convencion","Cusco","Jr. Puno Lt. 10 y 11 Mz. G Urb. Santa Ana, Cusco - la Convencion - Santa Ana, Ref. a Media Cdra.l del Estadio Municipal de Quillabamba / Cruce con Prolongacion Jr. Martin Pio Concha",-12.867000552802994,-72.69136121254724],
      ["Urcos","Urcos","Quispicanchi","Cusco","Mayupata s/n Paucarbamba, Urcos - Quispicanchi - Cusco Referencia: al Frende del Estadio Municipal de Urcos / al Frente del Terminal Terrestre de Urcos",-13.683279585147588,-71.62347340885519],
      ["Ocongate","Ocongate","Quispicanchi","Cusco","Sect. Mayo Ucjo S/n, Ocongate - Quispicanchi - Cusco, Ref. a la Espalda del Terminal de Buses de Ocongate / a Orillas de la Carreta a Mazuko",-13.62739013969223,-71.38875065729783],
      ["Oropesa","Oropesa","Quispicanchi","Cusco","Sec. Chimpapampa Apv. Jose Ccarlos Mareategui S/n, Oropesa - Quispicanchi - Cusco, Ref. a Una Cdra. de la Carreta a Urcos / a Una Cdra. de la Panificadora Cachito Amarillo",-13.60005625174351,-71.76866737056005],
      ["Cusco Urubamba","Urubamba","Urubamba","Cusco","Lt. E-3 Fracción -1, Sector Patahuasi, Urubamba – Urubamba - Cusco, Ref. a Una Cdra. de la Carretera a Ollantaytambo / a Media Cdra. del Parque Teresita",-13.300611752565251,-72.12522152944827],
      ["Chinchero","Chinchero","Urubamba","Cusco","Av. Mateo Pumacahua S/n, Chinchero - Urubamba - Cusco, Ref al Costado de la Caja Cusco / en la Misma Carretera a Urubamba",-13.391655799999956,-72.05083612636093],
      ["Huancavelica","Huancavelica","Huancavelica","Huancavelica","Av. Universitaria 1003 - Huancavelica, Ref. a 1 Cdra. de la Escuela Santa Ana y a 3 Cdras. del Puente del Ejército (barrio Santa Ana)",-12.783667969688736,-74.96452808704055],
      ["Jr Aguilar","Huanuco","Huanuco","Huanuco","Jr. Aguilar n° 872 - Huánuco",-9.933953,-76.240018],
      ["Amarilis Co","Amarilis","Huanuco","Huanuco","Jr. los Pinos Lote 3 -d2 Urb los Pinos - Amarilis - Huánuco, Ref. a la Espalda de Toyota Huánuco",-9.913907358366924,-76.23321364415669],
      ["Ambo","Ambo","Ambo","Huanuco","Av. las Americas 501, Ref. al Frente del Colegio Juan José Crespo y Castillo",-10.120588660118518,-76.20669167638694],
      ["Tingo Maria Co Buenos Aires","Rupa Rupa","Leoncio Prado","Huanuco","Calle Rosario Central, Referencia: Segunda Entrada de Buenos Aires, en la Misma Esquina",-9.3212843,-75.9933975],
      ["Tingo María - Leoncio Prado","Rupa Rupa","Leoncio Prado","Huanuco","",0.0,0.0],
      ["Aucayacu","Jose Crespo y Castil","Leoncio Prado","Huanuco","Jr. Chiclayo 247 0c-02 Cent Aucayu, Leoncio Prado, Huánuco, Ref. Atrás del Estadio Municipal",-8.93225965564812,-76.11253014681623],
      ["Ica San Joaquin","Ica","Ica","Ica","Pasaje Grau n° 101 San Joaquin - Ica Referencia : a 1 Cdra de Petro Peru",-14.0643326,-75.7409599],
      ["Ica Av. Jj Elias","Ica","Ica","Ica","Manzana B, Sub-lote 02 del Fundo la Palma Ica, Ref. Cruce de Av. Cutervo con Av. J.j Elias",-14.073585700850165,-75.73173672944775],
      ["Ica Urb. Manzanilla","Ica","Ica","Ica","Av. Manuel Santana Chiri N°359 A1 – Ica, Ref. Cruce con Calle Baltazar Caravedo",-14.075173411544755,-75.72322619012381],
      ["La Tinguiña","La Tinguina","Ica","Ica","Av. Victorio Gotuzzo n° 506 - Tinguiña - Ica, Ref. Cruce con Fray Ramón Rosas, al Costado de la Comisaria P.n.p. la Tinguiña",-14.035500161468082,-75.7103604294476],
      ["Parcona","Parcona","Ica","Ica","Cp. de Parcona -cercado (primera Etapa) Mz. B Lote 16 Parcona - Ica, Ref. Av. 18 de Febrero y Cruce de Av. Natividad Paco",-14.047400149199518,-75.70839896038552],
      ["Salas Ica","Salas","Ica","Ica","Sub Lote 01 Zona Panamericana Sur Km. 293.350, Salas Guadalupe - Ica - Ica, Ref. Frente al Estadio de Salas Guadalupe",-13.988307260088988,-75.77183299698221],
      ["Ica Santiago","Santiago","Ica","Ica","Centro Poblado Santiago Mz. E, Lt. 01 Sector Ii Santiago - Ica - Ica, Ref. Frente a la Comisaria de Santiago",-14.184709950322528,-75.714393999999],
      ["Ica Subtanjalla Co","Subtanjalla","Ica","Ica","C.p - Sector Macacona /predio Parcela 214 Lote 2, Subtanjalla - Ica - Ica, Ref. Panamericana Sur Frente a la Entrada del Arrabal",-14.03522165051946,-75.75583767054998],
      ["Prolong Luis Massaro","Chincha Alta","Chincha","Ica","Prolongacion Luis Massaro N°247 - Chincha Alta",-13.417292,-76.139622],
      ["Calle los Angeles","Chincha Alta","Chincha","Ica","Calle los Ángeles n° Casa 217 01 - a Sin Barriio Cercado, Chincha Alta - Chincha - Ica, Ref. a 2 Cdras. de la Plaza de Armas de Chncha Pasando Electrodunas",-13.416193893865698,-76.13155453450914],
      ["Chincha Pueblo Nuevo","Pueblo Nuevo","Chincha","Ica","Aa. Hh. los Alamos, Calle los Laureles Mz. 17 Lt. 11- A, Ref. a 2 Cdras. de la Posta los Álamos",-13.39970320977948,-76.14017253627246],
      ["Sunampe Co","Sunampe","Chincha","Ica","Carr. Panamericana Sur Nro. 198 -b , Sin Barrio Cercado Sunampe, Sunampe - Chincha - Ica, Ref. Antigua Panamericana Sur Frente a la Entrada de Grocio Prado.",-13.411199184426259,-76.16100100532903],
      ["Av Circunvalacion Nazca","Nazca","Nazca","Ica","En la Esquina de la Av. Circunvalación con Calle S/n, Hoy Calle las Mercedes s/n Nasca - Referencia: al Lado de la Iep Jean Piaget",-14.8252316,-74.9463744],
      ["El Ingenio","El Ingenio","Nazca","Ica","Av. Principal Tulin 204, el Ingenio - Nazca - Ica, Ref. Fremte a a la Plaza de Tulin",-14.647201061740144,-75.07065165981997],
      ["San Juan de Marcona","Marcona","Nazca","Ica","Aa.hh. San Martín de Porres E-4 San Juan de Marcona - Nazca - Ica, Ref. Cruce de Av. las Orquídeas con Av. San Martin de Porras a Dos Puertas del Hotel San Martin",-15.372099353436036,-75.15679999999986],
      ["Vista Alegre Co","Vista Alegre","Nazca","Ica","Carretera Panamericana Sur n° 906, Vista Alegre - Nazca - Ica, Ref. Frente al Aeropuerto de Vista Alegre",-14.850980032038338,-74.95730998650656],
      ["Av Abraham Valdelomar Co","Pisco","Pisco","Ica","Av. Abraham Valdelomar Nro. Puerta 965 Pisco - Pisco - Ica, Ref. a Una Cdra. por la Posta San Martin",-13.717889589276338,-76.20741571922439],
      ["La Villa Cruce Pisco","Pisco","Pisco","Ica","C. P. Oblacion Villa los Angeles Mz.a Lt 13 B la Villa Pisco-pisco-ica, Ref. a 100 Metros con Dirección al Sur Dedl Cruce Panamericana Antigua C/n Av. Fermín Tangüis",-13.714378000000186,-76.15378799999968],
      ["San Clemente","San Clemente","Pisco","Ica","Av. los Libertadores Grupo Número 1 Mz,91 Lote 7ª San Clemente - Pisco - Ica, Ref. Libertadores Sexta Cuadra,frente del Grifo Santa Rosa",-13.68050236680486,-76.15188744562124],
      ["Huancayo Jr. Ica","Huancayo","Huancayo","Junin","Jr. Ica Nº 1143 - Huancayo, Referencia: Entre el Jr. Ica y el Jr. Tacna",-12.0739582,-75.2141862],
      ["Terminal de Bus","Huancayo","Huancayo","Junin","Av. Evitamiento s/n - Counter N°13",-12.048505844253611,-75.23572860354552],
      ["Terminal los Andes","Huancayo","Huancayo","Junin","Av. Ferrocarril s/n - Huancayo - Counter n° 14, Ref. Terminal Terrestre los Andes, Frente al Open Plaza",-12.061289165518884,-75.20892492022985],
      ["San Carlos Huancayo","Huancayo","Huancayo","Junin","Pj. San Fernando 209 Huancayo - Huancayo - Junin, Ref. Esquina del Jr. San Fernando y Mártires del Periodismo",-12.054983032704635,-75.20146167055482],
      ["Chilca Huancayo","Chilca","Huancayo","Junin","Jr. 28 de Julio n° 935, Ref. Esquina 28 de Julio y Santos Chocano",-12.084192324029463,-75.20269199566754],
      ["Chilca Leoncio Prado Co","Chilca","Huancayo","Junin","Jr. Leonico Prado 656, Chilca – Huancayo - Junín Referencia: Esquina con Jiron Jose Olaya",-12.075860337838815,-75.19696216346182],
      ["Av Mariscal Castilla Co Parque Industrial","El Tambo","Huancayo","Junin","Av Mariscal Castilla 2769 Referencia : Frente al Colegio Andres Bello",-12.0428748,-75.2267209],
      ["Pio Pata","El Tambo","Huancayo","Junin","Av. Huancavelica 1201, el Tambo - Huancayo - Junín, Ref. Esquina con el Jr. la Victoria",-12.059666604966807,-75.22124426600406],
      ["Av Circunvalación Cruce con Mariategui","El Tambo","Huancayo","Junin","Av. Circunvalación 480 T-1, el Tambo - Huancayo - Junin, Ref. Esquina con Prolongación Mariategui",-12.049266655778926,-75.21046465889546],
      ["Ciudad Universitaria","El Tambo","Huancayo","Junin","Jr Tarma Nro. 37 - 24, el Tambo - Huancayo - Junín Ref. al Costado de la Facultad de Ingeniería Metalúrgica Uncp",-12.0305326628074,-75.23513525146198],
      ["Pilcomayo","Pilcomayo","Huancayo","Junin","Plaza Independencia 131, Pilcomayo - Huancayo - Junín, Ref. Plaza Principal de Pilcomayo",-12.054989295683633,-75.25416184467667],
      ["San Agustin de Cajas","San Agustin","Huancayo","Junin","Carretera Central Km 7.5 s/n San Agustin – Huancayo – Junín, Ref. Frente a la Envasadora Solgas",-12.010163420624794,-75.24669507058304],
      ["Concepcion","Concepcion","Concepcion","Junin","Carretera Central Lt. 7 - Mz. E5, Concepción - Concepción - Junín, Ref. Esquina con Tupac Amaru",-11.918185909991992,-75.3220572523639],
      ["La Merced","La Merced","Chanchamayo","Junin","Av. Peru 931 Sector Pampa del Carmen, la Merced -chanchamayo - Junín, Ref. Frente a la Cooperativa Chanchamayo",-11.070138136553895,-75.33640673631687],
      ["Perene","Perene","Chanchamayo","Junin","Av. Marginal s/n Aa.vv San Jacinto - Perene - Chanchamayo - Junin, Ref. Antes del Ultimo Rompemuelle de San Jacinto",-10.949521894978771,-75.22323917109577],
      ["Pichanaki","Bajo Pichanaqui","Chanchamayo","Junin","Av. Venus Lt. 20 Ciudad Satélite - Ref. ( a 1 Cuadra y Media del Parque de Satélite)",-10.919270732704568,-74.878801],
      ["San Ramón","San Ramon","Chanchamayo","Junin","Jr. Ucayali 102 - San Ramón, Referencia: Frente a la Caja Huancayo y el Parque el Avión",-11.124126,-75.355581],
      ["Jauja","Jauja","Jauja","Junin","Jr. Estanislao Marquez 286, Yauyos - Jauja - Junín, Ref. Esquina con Jr. 4 de Enero",-11.78562943389464,-75.49385623613146],
      ["Satipo","Satipo","Satipo","Junin","Jr. Francisco Irazola 1077 - Junín , Ref. Fábrica la Satipeña",-11.259616493651546,-74.6424816515803],
      ["Mazamari","Mazamari","Satipo","Junin","Jr. Jorge Chavez Nro 144 Lt. 8a Junín - Satipo– Mazamari, Ref. Cerca a la Vía Principal, al Costado del Hospedaje Luján 1er Piso",-11.3281942325421,-74.53286140640363],
      ["Pangoa","Pangoa","Satipo","Junin","Av. Marginal s/n Número Villa Chavini Pangoa - Satipo - Junín, Ref. al Costado de la Tienda Honda Inversiones Arauco San Martín de Pangoa",-11.419797368222014,-74.48978791111712],
      ["Tarma","Tarma","Tarma","Junin","Jr. Amazonas Nro. 1164 Tarma - Junín, Ref. Entre Jr. Amazonas con Av. Vienrich",-11.41777977183818,-75.69302779999909],
      ["La Oroya","La Oroya","Yauli","Junin","Av. Arévalo s/n (carretera Central) - Anexo el Tambo - Santa Rosa de Sacco",-11.5707657,-75.9586329],
      ["Chupaca","Chupaca","Chupaca","Junin","Jr. Ramon Castilla 201, Chupaca - Chupaca - Junin, Ref. a Una Cdra. de la Plaza Principal de Chupaca",-12.061264754772418,-75.28627290200478],
      ["Calle Liverpool","Trujillo","Trujillo","La Libertad","Calle Liverpool n° 329 / Urb. Santa Isabel - Trujillo. Referencia : a Una Cuadra Antes de la Iglesia de Mansiche",-8.103728,-79.042822],
      ["America Sur","Trujillo","Trujillo","La Libertad","Av. América Sur 1736 - Trujillo, Referencia: Frente al Estadio Chan Chan",-8.117752,-79.017615],
      ["Trujillo la Perla","Trujillo","Trujillo","La Libertad","Av. la Perla Mz. E Lote 05 Urb. Ingenieria – Trujillo – la Libertad, Ref. a 1 Cdra. del Colegio Bruning",-8.127945964925923,-79.02766309244446],
      ["Atahualpa","Trujillo","Trujillo","La Libertad","Calle Atahualpa 481 – Trujillo – la Libertad, Ref. a 1/2 Cdra de la Av los Incas",-8.115095074347321,-79.02300620442355],
      ["Aperopuerto Trujillo","Trujillo","Trujillo","La Libertad","Aeropuerto Internacional Capitán Fap Carlos Martinez de Pinillos",0.0,0.0],
      ["Calle Santa Cruz - America Sur","Trujillo","Trujillo","La Libertad","Calle Santa Cruz n° 389 Chicago - Trujillo - la Libertad, Ref. a Media Cdra. de la Av. America Sur/a Media Cuadra del Estadio Chan Chan.",-8.116971996657062,-79.01716811875633],
      ["Av Hnos Uceda - America Norte","Trujillo","Trujillo","La Libertad","Av. Hermanos Uceda Meza n° 269 Urb Miraflores Ii Etapa - Trujillo - Trujillo - la Libertad, Ref. a Una Cdra. de Av. America Norte. / Entre Av. Miraflores y Av. Salvador Lara",-8.09882349159178,-79.02339297054998],
      ["Ovalo Papal","Trujillo","Trujillo","La Libertad","Urb. Vista Hermosa Mz. F Lt. 11 Piso °1 Trujillo - Trujillo - la Libertad, Ref. a Espaldas del Metro del Ovalo Papal",-8.119674663832715,-79.04206139999884],
      ["Av Hermanos Angulo","El Porvenir","Trujillo","La Libertad","",0.0,0.0],
      ["Alto Trujillo","El Porvenir","Trujillo","La Libertad","Av. Prolongación 12 de Noviembre, Mz. Q, Lt. 25, Referencia: a Media Cdra. de la Comisaría Alto Trujillo",-8.068886311572447,-79.02161148687857],
      ["Av. las Magnolias","El Porvenir","Trujillo","La Libertad","Av. las Magnolias Mz. 25 Lt. 2a Nuevo Porvenir, el Porvenir - Trujillo - la Libertad, Ref. a Una Cdra. del Poder Judicial Cisaj Sede el Porvenir",-8.070161326285861,-79.01161204989681],
      ["Jr. Cahuide","El Porvenir","Trujillo","La Libertad","Jr. Cahuide n° 342 Aa.hh la Merced - el Porvenir - Trujillo - la Libertad, Ref. a Una Cdra. del Arco del Porvenir / a Una Cdra. de la Parroquia el Buen Pastor",-8.086117063381097,-79.00431020033358],
      ["Ovalo Huanchaco Co","Huanchaco","Trujillo","La Libertad","Carretera Via de Evitamiento 576.2 Huanchaquito Alto - Trujillo - la Libertad, Ref. a 1 Cdra. de Ovalo Huanchaco / al Costado de Condominio las Brisas",-8.09400066387337,-79.09794574110467],
      ["El Milagro","Huanchaco","Trujillo","La Libertad","Av. Industrial Mz 23 Lt. 13 Sector Ii – el Milagro, Huanchaco - Trujillo - la Libertad, Ref. a 2 Cdras. de la Plaza de Armas de el Milagro",-8.022627728445087,-79.06854404113406],
      ["Av Tahuantinsuyo","La Esperanza","Trujillo","La Libertad","Av. Tahuantinsuyo n° 739, la Esperanza – Trujillo – la Libertad, Ref. Diagonal a Grifo el Amigo. / Entre Pasaje Santa Ana y Av. los Laureles",-8.086053927537462,-79.04143355927748],
      ["Wichanzao","La Esperanza","Trujillo","La Libertad","Mz. 1 Lt. 23 Aa.hh Wichanzao – la Esperanza – Trujillo – la Libertad, Ref. al Costado del Almacén Sunat. / Diagonal al Hospital de Alta Complejidad Virgen de la Puerta",-8.05212092801542,-79.05562705114032],
      ["Moche","Moche","Trujillo","La Libertad","Av. la Marina Lote 25 - B – Moche – Trujillo - la Libertad, Ref. a Media Cdra de la Comisaría de Moche",-8.171888334554925,-79.01133459060559],
      ["Av Larco","Victor Larco Herrera","Trujillo","La Libertad","Av. Larco 865, Trujillo - Trujillo - la Libertad, Ref. Mz X Lt 28 Cui San Andres V Etapa Tercer Sector y Frente al Colegio Jesus Maria",-8.137749685409007,-79.05033495086825],
      ["Paijan","Paijan","Ascope","La Libertad","Av. Panamericana Norte n° 1320 - Paijan",-7.7338355,-79.3006298],
      ["Casa Grande","Casa Grande","Ascope","La Libertad","Calle Luis Sánchez n° 152 Sector Parte Alta. Casa Grande - Ascope - la Libertad, Ref. Cruce con Av. Estadio",-7.739275816710513,-79.1878603281161],
      ["Chepen","Chepen","Chepen","La Libertad","Prolongacion Ezequiel Gonzales Caceda 193 - Sec. Chepen, Frente al Coliseo",-7.2211028,-79.436371],
      ["Pacanguilla","Pacanga","Chepen","La Libertad","Carretera Panamericana # 835 - Urb. Pacanguilla - Distrito Pacanga, Referencia: en la Misma Panamericana",-7.154513,-79.446302],
      ["Otuzco","Otuzco","Otuzco","La Libertad","Av. Alfredo Gutiérrez n° 120 - Otuzco - Otuzco - la Libertad.",-7.9063204,-78.5644849],
      ["San Pedro de Lloc","San Pedro de Lloc","Pacasmayo","La Libertad","Av. Vía de Evitamiento n° 407, San Pedro de Lloc - Pacasmayo - la Libertad, Ref. a Media Cdra. de la Calle Libertad/ a Media Cdra. del Paradero de la Via de Evitamiento",-7.432359975375957,-79.5006674257791],
      ["Ciudad de Dios","Guadalupe","Pacasmayo","La Libertad","Mz. a Lt. 01 Cpm Ciudad de Dios - Sec. los Ángeles – Guadalupe – la Libertad, Ref. al Costado del Molino Samán y a Dos Cuadras del Cruce a Cajamarca",-7.307807771909066,-79.48049869580079],
      ["Guadalupe la Libertad","Guadalupe","Pacasmayo","La Libertad","Av. Nilla Cerruty n° 299 - Guadalupe – Pacasmayo – la Libertad, Ref. al Costado del Grifo Repsol - Neotech",-7.246943907157736,-79.46819496901985],
      ["Pacasmayo las Palmeras","Pacasmayo","Pacasmayo","La Libertad","Ctra. Panamericana Norte n° Mz. P Lt. 4a - A.h. las Palmeras, Referencia: Entre Av. Sucre y Av. Leoncio Prado",-7.3942461776643915,-79.56425083577706],
      ["Pacasmayo Centro","Pacasmayo","Pacasmayo","La Libertad","Av. Gonzalo Ugaz Salcedo s/n - Pacasmayo - la Libertad, Ref. al Costado del Estadio Municipal de Pacasmayo / a Media Cdra. del Supermercado Tottus",-7.399861949013418,-79.56658362417085],
      ["Huamachuco","Huamachuco","Sanchez Carrion","La Libertad","",0.0,0.0],
      ["Puente Viru","Viru","Viru","La Libertad","Panamericana Norte n° 933 Puente Virú - Virú - la Libertad, Ref. a Media Cdra. del Grifo Zona Etna/media Cdra. del Semaforo Zona Etna",-8.42833528993143,-78.77838890000288],
      ["Viru Centro","Viru","Viru","La Libertad","Calle Puno n° 125 - Mz. 32 Lt. 7a - Virú - la Libertad, Ref. a Media Cdra. del Cruce de la Av. Viru con la Calle Jorge Chavez / a Media Cdra. de la Plazuela Maria Parado de Bellido",-8.415333885358443,-78.75430648375976],
      ["Chao","Chao","Viru","La Libertad","Av. Victor Raul Haya de la Torre 575 Chao - Viru, Ref. a Media Cdra. de la Comisaría de Chao",-8.537973927100092,-78.67841296014623],
      ["Miraflores Chiclayo","Chiclayo","Chiclayo","Lambayeque","Av. Panamericana 975 Pp Jj Luis Alberto Sanchez, Chiclayo - Chiclayo - Lambayeque, Ref. a Media Cdra. del Ovalo Señor de Sipan / al Frente de Derco Center",-6.758723531786173,-79.86286109999591],
      ["Mariscal Nieto","Chiclayo","Chiclayo","Lambayeque","Calle Mariscal Nieto n° 390, Referencia: Entre Mariscal Nieto y Miguel Grau",-6.7748775,-79.8324065],
      ["Aeropuertochiclayo","Chiclayo","Chiclayo","Lambayeque","Aeropuerto Internacional Capitán Fap José Abelardo Quiñones Gonzáles",0.0,0.0],
      ["Av las Americas","Chiclayo","Chiclayo","Lambayeque","Av. las Américas Lt. 42 Mz. D, Urb. Monterrico - I Etapa, Chiclayo - Chiclayo - Lambayeque, Ref. a Media Cdra. Entre la Av. Colectora y Av. las Americas y a Media Cdra. del Grifo Sr. de Sipán",-6.780501163911101,-79.8521664417571],
      ["Chongoyape","Chongoyape","Chiclayo","Lambayeque","Av. Atahualpa n° 1200 - Chongoyape - Chiclayo - Lambayeque, Ref. Interseccion con Calle Iquitos / a 2 Cdras. de la Interseccion con la Av. Chiclayo",-6.637889588333527,-79.39186227257673],
      ["Calle Tahuantinsuyo","Jose Leonardo Ortiz","Chiclayo","Lambayeque","Calle Tahuantinsuyo 995 - Urb. San Lorenzo - Jose Leonardo Ortiz - Chiclayo - Lambayeque, Ref. Entre la Cdra. 2 de Av. América y la Calle Tahuantinsuyo/a Media Cdra. de la Iglesia los Mormones",-6.7606203740115225,-79.84166442267903],
      ["Av Balta Cdra. 36","Jose Leonardo Ortiz","Chiclayo","Lambayeque","Av. Jose Balta n° 3653 C.p.m. Primero de Mayo Jose Leonardo Ortiz -chiclayo -lambayeque, Ref. Entre la Av. Balta y Néstor Barsallo / a 2 Cuadras de la Av. Chiclayo",-6.7475994398993855,-79.83610946945137],
      ["Av Victor R. Haya Co","La Victoria","Chiclayo","Lambayeque","Av. Víctor Raul Haya de la Torre 2470 la Victoria - Chiclayo Referencia : Entre la Via Evitamiento y Panamericana",-6.8003757,-79.830527],
      ["Monsefu","Monsefu","Chiclayo","Lambayeque","Av. Venezuela n° 221, Monsefú - Chiclayo - Lambayeque, Ref. Ref 01: a Media Cdra. de la Calle Diego Ferre y a Cdra. y Media del Parque Artesanal de Monsefú",-6.880029797162056,-79.86824932945154],
      ["Pimentel","Pimentel","Chiclayo","Lambayeque","Calle Miguel Grau Mz B Lote 3 - Pimentel - Chiclayo - Lambayeque, Ref. al Costado de la Comisaria de Pimentel",-6.834750090523521,-79.93590746318701],
      ["Reque","Reque","Chiclayo","Lambayeque","Av. Mariscal Ramon Castilla Mz. 4 Lote 14, Reque - Chiclayo - Lambayeque, Ref. a Media Cdra. de la Interseccion con Calle San Martin / a Unos Mtrs de Alborada Eventos y Recepciones",-6.867055984825744,-79.81686157408289],
      ["Patapo","Patapo","Chiclayo","Lambayeque","Av. Chongoyape n° s/n Sector Cerro Mirador, Patapo - Chiclayo - Lambayeque, Ref. a Una Cdra. y Media de la Intersección con Av Trapiche / al Frente del Polideportivo del Cerro Mirador",-6.739416876027053,-79.63763896561294],
      ["Pomalca","Pomalca","Chiclayo","Lambayeque","Calle 25 Mz. I Lt. 6 Sect. 6 San Juan, Pomalca - Chiclayo - Lambayeque, Ref. a Una Cdra. y Media de la Intersección con Av. San Martin/ al Frente de la Iglesia Mormon",-6.768084484541531,-79.7807497467334],
      ["Tuman","Tuman","Chiclayo","Lambayeque","Av. el Progreso n° 52 - Sector Santa Rosa, Referencia: Entre la Av. el Progreso y 1° de Mayo, Frente a la Canchita de Grass Sintético",-6.741657022112361,-79.70322343374362],
      ["Ferreñafe","Ferrenafe","Ferrenafe","Lambayeque","Av. Andrés A. Cáceres N°550a, Referencia: al Costado del Grifo Primax",-6.646179,-79.790525],
      ["Lambayeque Panamericana","Lambayeque","Lambayeque","Lambayeque","Calle Paraguay Mz. D Lt 2a Unidad Vecinal Indoamérica - Lambayeque, Ref. al Costado de la Fábrica de Kinkones Bruning / a 01 Cuadra del Puente Lambayeque",-6.695064030951365,-79.90373303282823],
      ["Lambayeque Centro","Lambayeque","Lambayeque","Lambayeque","Av. Federico Villarreal n° 491, Lambayeque - Lambayeque - Lambayeque, Ref. a Media Cdra. de la Interseccion de la Av. Federico Villarreal con Calle Emiliano Niño",-6.705138427693248,-79.90941687306336],
      ["Jayanca","Jayanca","Lambayeque","Lambayeque","Calle Diego Ferre N°1321 - Jayanca - Lambayeque, Ref. al Frente del Centro de Salud de Jayanca / a Media Cdra. del Grifo Asia",-6.384834348558046,-79.8187767726106],
      ["Morrope","Morrope","Lambayeque","Lambayeque","Calle Tahuantinsuyo n° 821, Morrope - Lambayeque, Ref. Frente al Parque Infantil de Morrope",-6.543444405424585,-80.01232827124002],
      ["Motupe","Motupe","Lambayeque","Lambayeque","Calle los Pinos N°116 - Lotizacion la Primavera Referencia : a Media Cuadra de la Panamericana Carretera Fernando Belaunde Terry",-6.150471750929664,-79.71138857527656],
      ["Olmos","Olmos","Lambayeque","Lambayeque","Av. Augusto B. Leguía Mz. 87 Lt. 32 - Olmos - Lambayeque, Ref. al Frente de la Comisaria de Olmos.",-5.987192435064271,-79.74301712265942],
      ["Tucume","Tucume","Lambayeque","Lambayeque","Av. Federico Villarreal n° 982 (ctra. Fernando Belaunde Terry), Referencia: a Media Cdra. del Cementerio Jardines de la Paz",-6.504110001290575,-79.8592176705526],
      ["Caja Distribucion Lima","Cercado Lima","Lima","Lima","",0.0,0.0],
      ["Malvinas - Jr. Ricardo Treneman","Cercado Lima","Lima","Lima","Jr. Ricardo Treneman n° 920, Referencia: Dentro del Local Farenet",-12.046751,-77.054634],
      ["Malvinas - Jr. Garcia Villón","Cercado Lima","Lima","Lima","Jr. Presbítero García Villon Nro. 560 Cercado Lima - Lima, Ref. a la Altura de la Cdra. 5 de Av. Oscar R. Benavides (ex Av. Colonial), en Medio de las Av. Guillermo Dansey y Av. Oscar R. Benavides (ex Colonial)",-12.04638719584987,-77.049473000003],
      ["Lima Av Tingo María","Cercado Lima","Lima","Lima","Av. Tingo María N°1252-a - Cercado de Lima - Lima, Ref. a Media Cdra. del Cruce con Jr. Gral. Orbegoso",-12.0606406907256,-77.0589838666984],
      ["Av Nicolas Dueñas Cdra. 5","Cercado Lima","Lima","Lima","Av. Nicolas Dueñas 584 Mz. C Lt. 4 – Aahh Primero de Setiembre, Cercado de Lima – Lima - Lima, Ref. a Media Cdra. del Cruce con Jr. Pedro Garezon",-12.041685469771842,-77.06569704398638],
      ["Ancon","Ancon","Lima","Lima","Carretera Serpentín de Pasamayo Mz. G Lt. 3 Sublt. B - Asoc. de Prop. Casa Huerta Ind. Pecuarias San Pedro Zona 4, Ancón - Lima-lima, Ref. a 1 Cdra. del Ovalo de Ancón",-11.774039837812818,-77.16181025497632],
      ["Huaycan Entrada","Ate-vitarte","Lima","Lima","Carretera Central Km 17 Mz. E Lt. 1, Ref. Entrada de Huaycan al Costado del Grifo Primax. Ex Grifo el Negro.",-11.9988136,-76.8368031],
      ["Av Marco Puente","Ate-vitarte","Lima","Lima","Av. Marco Puente Llanos 309, Mz. A, Lt. 03",-12.032176320938673,-76.92178990219485],
      ["Puente Santa Anita","Ate-vitarte","Lima","Lima","Av. Nicolás Ayllón n° 3080 - Ate Vitarte",-12.057126998901367,-76.96934509277344],
      ["Huaycan Av Jose C Mariategui","Ate-vitarte","Lima","Lima","Av. José Carlos Mariátegui Z. E Lt. 23 Ucv 5 (zona Comercio) - Pueblo Joven \\proyecto Especial Huaycán\\\" Ate Vitarte - Lima",0.0,-12.014821320970137],
      ["Los Sauces","Ate-vitarte","Lima","Lima","Av. Santa Rosa N°773 Manzana “a” Lote 6 Urb los Sauces - Ate - Referencia: Cruce con la Av Separadora Industrial",-12.0709298,-76.9809503],
      ["Santa Clara","Ate-vitarte","Lima","Lima","Av. Pedro Ruíz Gallo Mz. H Lt. 3. Asoc. Viv. Villa San Luis, Santa Clara - Ate Vitarte - Limaref: Entre el Real Plaza y la Utp Santa Clara",-12.013911972067262,-76.88419892952268],
      ["Av Esperanza","Ate-vitarte","Lima","Lima","Av. Esperanza Mz. K Lt. 06 las Americas - Ate Vitarte - Lima, Ref. Pasando Mercado Raucana",-12.03197489814294,-76.90489476767831],
      ["Av el Sol","Ate-vitarte","Lima","Lima","Av. el Sol Mz. S Lt. 2 Zona 03 - Asoc. Parque Industrial el Asesor, Sector 010 Zona 03 - Ate, Ref. a Una Cuadra y Media de la Carretera Central",-12.038365169091593,-76.93396781379997],
      ["Huaycan el Descanso","Ate-vitarte","Lima","Lima","Av. Jose Carlos Mariategui Mza. B Lte 06, Residencial Pariachi Sec. 031 Zon. 05, Ate - Lima - Lima, Ref. Cruce con la Av. los Incas",-12.004388120507466,-76.83611140249312],
      ["Urb Santa Elvira","Ate-vitarte","Lima","Lima","Av. Ferrocarril Mz. C Lt. 19 Parcela 3, Urb. Santa Elvira Sec. 018 Zona 3, Ref. a Media Cdra. del Cruce con Av. de la Cultura",-12.028531299993436,-76.950749770605],
      ["Huaycan Av Horacio Zevallos","Ate-vitarte","Lima","Lima","Av. Horacio Zeballos Mz. V Lt. 12 Prog. Viv. Residencial Pariachi (sec. 031) Zona 5, Ate - Lima - Lima, Ref. Frente al Circuito de Manejo Garcilaso de la Vega",-12.007693484031522,-76.8424867018833],
      ["Av Venezuela","Brena","Lima","Lima","Av. Venezuela 1670 - Breña, Referencia: al Costado del Policlínico de Breña",-12.055384807465686,-77.05571332375156],
      ["Jr. Huaraz - Breña","Brena","Lima","Lima","Jr. Huaraz 1633, Breña -lima, Ref. en Medio del Cruce de Jr. Gral Orbegoso y Jr. Centenario con Jr. Huaraz",-12.065815746489534,-77.04986305455087],
      ["Carabayllo Establo","Carabayllo","Lima","Lima","Av. Tupac Amaru N? 441 - 443, Mz. O2 Lt. 35, Referencia: Paradero Establo, a Una Cuadra de la Urb. Santa Isabel",-11.9035821,-77.0309854],
      ["Tungasuca","Carabayllo","Lima","Lima","Av. Trapiche Mz. P Lt. 48, Urb. Tungasuca Referencia: Aux. Av. Chimpu Ocllo con Aux. Chillón Trapiche, a 1 Cuadra del Mercado Qatuna",-11.891425542921597,-77.04442551681062],
      ["Av Tupac Amaru Km. 19","Carabayllo","Lima","Lima","Mz. 1a - Lt. 8 Av. Tupac Amaru n° 10472, Carabayllo - Lima, Ref. al Costado del Colegio Ciro Alegría",-11.881139994572488,-77.02180581911568],
      ["Av. Tupac Amaru Km. 23.5","Carabayllo","Lima","Lima","Av. Túpac Amaru Km. 23.5 - Carabayllo, Ref. Frente a la Iglesia de Mormones - a Una Cdra. del Último Paradero del Rápido",-11.844310757655741,-77.00039932685678],
      ["Av Jose Saco Rojas","Carabayllo","Lima","Lima","Av. José Saco Rojas Mz. a Lt. 15 Programa de Vivienda el Pino, San Antonio - Carabayllo, Ref. Frente al Chifa Hong Fu y a 3 Cuadras del Gran Mercado el Pino",-11.858131810981817,-77.04414250346564],
      ["Santo Domingo","Carabayllo","Lima","Lima","Av. a Mz. L2 Lt. 20 Urb. Santo Domingo – Vi Etapa Carabayllo - Lima, Ref. en el Cruce de las Av. Chillon Trapiche y Av. Camino Real",-11.873004724827046,-77.0290837822141],
      ["El Progreso Km 22","Carabayllo","Lima","Lima","Av. Tupac Amaru 3493 – P.j. el Progreso (parte Baja) Mz. K Lt. 11b Zona Ii, Carabayllo - Lima, Ref. a Una Cdra. del Cruce con la Av. Manuel Prado",-11.872316361141715,-77.01521214760115],
      ["Chorrillos Co","Chorrillos","Lima","Lima","Av. Santa Anita N.° 580, Chorrillos - Lima, Ref. al Costado del Mercado Santa Anita, Cruce con San Genaro",-12.19049228146922,-77.01532743242808],
      ["Chorrillos los Faisanes","Chorrillos","Lima","Lima","Av. los Faisanes 420, Referencia: al Costado de la Tienda John Holden",-12.176072,-76.998107],
      ["Las Delicias de Villa","Chorrillos","Lima","Lima","Av. 12 de Octubre Mz. a - 03, Lt. 02, Urb. Aria - las Delicias de Villa, Ref. a Dos Cuadras de la Av. Defensores del Morro (ex Av. Huaylas)",-12.19588881091088,-76.99802766343377],
      ["Megaplaza Chorrillos","Chorrillos","Lima","Lima","Av. Alameda Sur 5, Chorrillos 15067, Ref. Cruce de Av. Alameda Sur Conav. Alameda San Marcos",-12.19672190971743,-77.01160198642162],
      ["Cieneguilla Km. 14.5","Cieneguilla","Lima","Lima","Av. Arterial Huarochiri D Mz. B Lt. 19, Asoc. de Viviendas las Cumbres de Cieneguilla, Lima, Ref. al Costado de la Tienda Mass",-12.089303982280754,-76.85365371221069],
      ["Reparto San Luis","Cieneguilla","Lima","Lima","San Luis",-12.089303982280754,-76.85365371221069],
      ["Av Univ. Retablo","Comas","Lima","Lima","Av. Universitaria n° 7241, Referencia: Ex Boulevard de Retablo / a 2 Cdras del Metro de Belaunde",-11.937314524134514,-77.05809407916101],
      ["Av. Trapiche","Comas","Lima","Lima","Av. Trapiche 886 a 16 2p 2 - Urb. Pinar, Referencia: Frente al Complejo Deportivo Walon",-11.91918929266535,-77.06050258466907],
      ["Año Nuevo","Comas","Lima","Lima","Av. Tupac Amaru n° 7837- 7839 Mz. C Lt. 010 Urb. Popular San Juan Bautista I Etapa, Comas - Lima, Ref. a Una Cdra. de la Entrada de Collique",-11.915107566733127,-77.04066226893435],
      ["Av Tupac Amaru Cdra. 57","Comas","Lima","Lima","Av. Tupac Amaru 5725-5727 - Urb. Huaquillay I Etapa, Comas - Lima - Lima, Ref. a Media Cdra. del Banco de la Nación",-11.945312645664846,-77.05054907824643],
      ["Av. Univ. Parque Sinchi Roca","Comas","Lima","Lima","Av. Universitaria Norte Mzn. Q1 Lte. 030 Urb. Primavera,comas-lima - Lima, Ref. a Media Cdra. del Ingreso al Parque Zona Sinchi Roca",-11.919995063846647,-77.05093521974257],
      ["Urb. Repartición","Comas","Lima","Lima","Av. Tupac Amaru 3184 Urb. Reparticion, Comas - Lima - Lima, Ref. a Media Cdra. de Av. Victor Andres Belaunde Y/o Frente a Dollarcity",-11.939410443954904,-77.0500540999998],
      ["Puente Nuevo","El Agustino","Lima","Lima","Av 1° de Mayo 3071 - Urb Huancayo Referencia : Frente al Grifo Repsol",-12.0300919,-76.9991156],
      ["Jiron Ancash","El Agustino","Lima","Lima","Jr. Ancash Mz. B Lt. 11 Aahh Ancieta Alta, el Agustino - Lima - Lima, Ref. Frente al Ingreso de Agustino Plaza",-12.041365477648608,-77.00264283281007],
      ["La Cincuenta","Independencia","Lima","Lima","Av. Tupac Amaru n° 4708 - 4710, Ref. a Una Cdra. del Paradero Estación Naranjal",-11.978882502306485,-77.0591044310316],
      ["Plaza Norte S. Express","Independencia","Lima","Lima","Av. Gerardo Unger Nro. 6917 Int. Lb 19",-12.004946,-77.055867],
      ["Plaza Norte Entregas","Independencia","Lima","Lima","Av. Gerardo Unger Nro. 6917 Int. Lb 19",-12.004946,-77.055867],
      ["Megaplaza Independencia","Independencia","Lima","Lima","Centro Comercial Mega Plaza Av. Alfredo Mendiola 3698 Lima - Independencia. Ref. Primer Piso de Mega Plaza / al Costado del Estacionamiento de Bicicleta",-11.993286670554024,-77.06326926907906],
      ["Calle a con Av Industrial","Independencia","Lima","Lima","Calle A, Mz. D Lt. 26 Urbanización Panamericana (primer Piso) Independencia - Lima - Lima, Ref. a 1 Cdra. del Cruce con Av. Industrial (lateral de Megaplaza)",-11.992650999981887,-77.06030747047947],
      ["Av. San Felipe","Jesus Maria","Lima","Lima","Av. San Felipe 1195 - Jesús María",-12.0822274,-77.0459498],
      ["Av. Arenales","Jesus Maria","Lima","Lima","Av. Arenales 391, Referencia: a 2 Cdras. de Av. 28 de Julio a la Espalda de la Utp",-12.068228,-77.037967],
      ["Jesus Maria","Jesus Maria","Lima","Lima","Av. Mariscal Luzuriaga 584-586 Jesús María - Lima, Ref. a Cuadra y Media del Parque San José, Paralelo a la Av. Mello Franco",-12.076277049292106,-77.0481659884218],
      ["Real Plaza Salaverry","Jesus Maria","Lima","Lima","Centro Comercial Real Plaza Salaverry, Av. Gral. Salaverry 2370, Jesús María 15076, Ref. Frente a la Escuela de Postgrado Utp",-12.089813084346348,-77.05264319872401],
      ["Av la Fontana","La Molina","Lima","Lima","Av la Fontana 440 - la Molina (cc la Rotonda Ii Local 1018)",-12.072691,-76.9548488],
      ["Los Fresnos","La Molina","Lima","Lima","Av. los Fresnos 1305 Tienda 2 - Urb. Portada del Sol I Etapa - la Molina - Lima, Ref. a 3 Cdras. del Óvalo de los Cóndores",-12.10408461128942,-76.9414167],
      ["Av. la Molina Cdra. 35","La Molina","Lima","Lima","",0.0,0.0],
      ["Av Flora Tristan","La Molina","Lima","Lima","Av. Flora Tristán n° 885, Urb. Santa Patricia Iii Etapa, la Molina - Lima, Ref. a Media Cdra. de Molisalud",-12.064156609712583,-76.9455208508212],
      ["Parque la Molina","La Molina","Lima","Lima","Av. la Molina 2448, la Molina 15026, la Molina - Lima - Lima, Ref. Estacionamiento Nivel -3",-12.07532253461305,-76.93612151388963],
      ["Av Alameda del Corregidor","La Molina","Lima","Lima","Av. Alameda del Corregidor Mz. U Lt. 19 Ui 1 - Urb la Capilla, la Molina - Lima - Lima, Ref. a 2 Cdras. del Cruce con Alameda de los Cóndores",-12.105549936759234,-76.94696420728879],
      ["Av Mexico Co","La Victoria","Lima","Lima","Av. Mexico 1125, la Victoria - Lima",-12.07343078586655,-77.01758370585979],
      ["Jr. Luna Pizarro","La Victoria","Lima","Lima","Jr. Luna Pizarro n° 701 - la Victoria, Referencia: Esquina Hipólito Unanue",-12.0670586,-77.0273264],
      ["Jr. Raymondi","La Victoria","Lima","Lima","Jr. Antonio Raymondi Nro. 113",-12.061097830007334,-77.0344310742025],
      ["Av. Canada","La Victoria","Lima","Lima","Av. Canadá 1603, Referencia: Entre Av. Canadá con Av. Aviación",-12.0840074,-77.0058111],
      ["Area Shalom Empresas","La Victoria","Lima","Lima","Direccion",0.0,0.0],
      ["Caja Transporte Mexico","La Victoria","Lima","Lima","Cargando",0.0,0.0],
      ["Servicio Local Express","La Victoria","Lima","Lima","",0.0,0.0],
      ["Av Ignacio Merino","Lince","Lima","Lima","Av. Ignacio Merino 2108 - 2112 Lima - Referencia : Cruce con la Av. Risso",-12.0857063,-77.0325207],
      ["Jr Casanova con Petit Thouars","Lince","Lima","Lima","Jr. Domingo Casanova N°318 Lince - Lima, Ref. Cruce con Petit Thouars",-12.089639700017475,-77.0324062705979],
      ["Av Jose Leal Cdra 6","Lince","Lima","Lima","Av. Coronel José Leal 648, Urb. Fundo Lobatón, Lince - Lince, Ref. Paralela a la Cdra. 6 de la Av. Canevaro",-12.085366655704497,-77.04022637039473],
      ["Av. las Palmeras","Los Olivos","Lima","Lima","Av. las Palmeras n° 5236 Urb. Villa Norte - los Olivos",-11.975852939682618,-77.07207437848116],
      ["Calle M. Asencio","Los Olivos","Lima","Lima","Calle Manuel Asencio Segura 309 - Urb. Villa los Angeles, Referencia: Frente al Mega Plaza",-11.996529203761455,-77.0649135734754],
      ["Pro","Los Olivos","Lima","Lima","Av. los Próceres Mz. Pp2 Lt.21, Urb. Puertas de Pro - los Olivos",-11.9450493,-77.0775764],
      ["Av. Carlos Izaguirre Cdra. 5","Los Olivos","Lima","Lima","Av. Carlos Izaguirre 513, Ref. al Costado de Tiendas Mass",-11.990731930870528,-77.06668104251013],
      ["Av. Angelica Gamarra","Los Olivos","Lima","Lima","Av. Angelica Gamarra de Leon Valverde n° 621 Urb el Trebol, los Olivos - Lima, Ref. a la Altura del Kfc / Cruce con Av. Alfa",-12.00564059430335,-77.06833392202753],
      ["Av Huandoy con Marañon","Los Olivos","Lima","Lima","Av. Próceres, Mz. 3, Lt. 23 A.h. Laura Caller - los Olivos, Referencia: Cruce Entre Av. Huandoy y Marañón",-11.970678,-77.080356],
      ["Tres Postes","Los Olivos","Lima","Lima","Av. Alfredo Mendiola Lt. 22 Mz. C3 - Urb. Industrial Infantas, Referencia: a Cdra. y Media del Tottus de 3 Postes",-11.9681314,-77.0669408],
      ["Av. Dos de Octubre","Los Olivos","Lima","Lima","Av. 2 de Octubre Mz. H Lt. 2 - los Olivos - Pro, Ref. Av. 2 de Octubre con Av. Canta Callao, al Costado del Centro de Salud Pro",-11.95057177592816,-77.08493089999897],
      ["Av. Carlos Izaguirre Cdra. 14","Los Olivos","Lima","Lima","Calle David Alva Manzana H Lote 4 Urb. Cajabamba los Olivos - Lima, Ref. Entre la Av. Carlos Izaguirre con la Av. Universitaria (frente al Colegio Pamer)",-11.991719564562725,-77.08044440622403],
      ["Av. los Platinos","Los Olivos","Lima","Lima","Av. los Platinos N°. 259, Mz. a - Lt. 17, Urb. Lotización Industrial Infantas los Olivos - Lima, Ref. a Dos Cdras. y Media de la Av. Alfredo Mendiola Y/o Panamericana Norte (altura del Paradero Caseta)",-11.970038188057043,-77.06456792944489],
      ["Av Huandoy con Av Central","Los Olivos","Lima","Lima","Av. Huandoy Mza. 72 Lte. 54 P.j. P.m.v. “confraternidad” - Aahh. Enrique Milla Ochoa los Olivos - Lima, Ref. a Una Cdra. del Cruce con Av. Central",-11.957822256000819,-77.07594487055076],
      ["Cd. Talleres-huachipa","Lurigancho","Lima","Lima","V",-12.0164326,-76.912636],
      ["Chosica","Lurigancho","Lima","Lima","El Sol 124 (parque Echenique) Lurigancho - Chosica",-11.93352928120618,-76.69333509527566],
      ["Huachipa Co","Lurigancho","Lima","Lima","Huachipa Este - Manzana A18 Lote 1, 2, 3 Calle B, Calle 08, Calle A, Ref. al Costado de Industrias Eléctricas Kba",-11.935550288297467,-76.86833430093904],
      ["Santa María de Huachipa","Lurigancho","Lima","Lima","Av. Circunvalación Mz. a Lt. 1 - D C - P Santa María de Huachipa - Lurigancho - Chosica, Ref. Entre la Av. Circunvalación y la Av. Huachipa",-12.016439072071643,-76.91240974118337],
      ["Nuevo Lurin","Lurin","Lima","Lima","Av. Antigua Panamericana Sur Km 37 Mz C Lt 17 - Fundo las Salinas - Referencia a Cuadra y Media del Mercado Virgen de las Mercedes.",-12.2819873,-76.8658386],
      ["Puente Lurin","Lurin","Lima","Lima","Antigua Panamericana Sur, Lote 2, Mz. B, Primer Piso Lurín - Lima, Ref. a Cdra. y Media del Cruce con Av. Santa Cruz",-12.25508377880026,-76.89009010408147],
      ["Magdalena del Mar","Magdalena del Mar","Lima","Lima","Jr. Ayacucho n° 756, Referencia: a Una Cdra. del Mercado Modelo de Magdalesy a 3 Cdras. de la Iglesia Cúpula de Sucre",-12.086209998877823,-77.07142297178575],
      ["Av. la Marina","Pueblo Libre","Lima","Lima","Av. la Marina 1640 - Referencia : a Una Cuadra del Centro Comercial Plaza San Miguel",-12.0775694,-77.0799465],
      ["Av Bolivar","Pueblo Libre","Lima","Lima","Av. Bolivar 1097, Pueblo Libre - Lima, Ref. a Media Cdra. del Cruce Av. Gral. José María Egusquiza",-12.072414855721524,-77.06500307055026],
      ["Av. Jose Pardo","Miraflores","Lima","Lima","Av. Jose Pardo N?533",-12.119319117644974,-77.03435394423252],
      ["Calle Berlin","Miraflores","Lima","Lima","Calle Berlín 219 - Miraflores",-12.121881114037542,-77.03219965402278],
      ["Av. Roosevelt","Miraflores","Lima","Lima","Av. Roosevelt 6297 (antes Rep. Panamá) - Miraflores",-12.12746185891619,-77.01786268247683],
      ["Av. Alfredo Benavides","Miraflores","Lima","Lima","Av. Alfredo Benavides 1851 - Miraflores, Ref. al Costado del Bembos Aurora Benavides",-12.126749176455435,-77.0132233288232],
      ["Av. Comandante Espinar","Miraflores","Lima","Lima","Av. Comandante Espinar 330-miraflores, Ref. Entre el Cruce de Calle Enrique Palacios y la Av. Comandante Espinar",-12.116361361085469,-77.03680649389766],
      ["Larcomar","Miraflores","Lima","Lima","Malecón de la Reserva 610, Miraflores 15074, Miraflores - Lima - Lima, Ref. Sótano Nivel a",-12.13176251520779,-77.03007421242233],
      ["La Curva de Manchay","Pachacamac","Lima","Lima","Av. Prolongación de la Av. la Molina Mz. E Lote 21. Ah Paul Poblet Lind, Pachacamac - Lima, Ref. a Media Cdra. de Mi Banco",-12.084751211026502,-76.8761664787276],
      ["Manchay Tres Marias","Pachacamac","Lima","Lima","Av. Victor Malasquez Mz. B11 Sub-lote 06-a - Aahh Centro Poblado Rural los Huertos de Manchay Sector B Pachacamac - Lima, Ref. a Media Cdra. del Paradero",-12.114362937395487,-76.87350734288519],
      ["Av Manuel Valle","Pachacamac","Lima","Lima","Av. Manuel Valle Sub - Lote 2 - 1, Número de Parcela J, Proyecto Huertos de Pachacamac, Valle Lurín - Pachacamac - Lima, Ref. Frente al Estudio de Canal 4 (america Televisión)",-12.232514555328416,-76.86432399999713],
      ["Puente Arica","Puente Piedra","Lima","Lima","Panamericana Norte Km 32.5 , a 1/2 Cuadra del Puente Arica - al Costado del Grifo Repsol",-11.8531295,-77.088719],
      ["Puente Piedra Naranjitos","Puente Piedra","Lima","Lima","Fundo Tambo Inga Mz. a Lt. 8, Puente Piedra, Referencia: Paradero Naranjito, Antes del Cementerio Buen Retiro",-11.876632816754778,-77.06893209715099],
      ["Zapallal","Puente Piedra","Lima","Lima","Av. Ancón 678, Ref. a la Espalda del Precio Uno de Fundicion",-11.830750370122983,-77.11410941944563],
      ["Av. San Lorenzo","Puente Piedra","Lima","Lima","Av. San Lorenzo Mz C Lt 20 - Adp Virgen de Copacabana, Puente Piedra - Lima. Ref, a Media Cuadra del Parque Virgen de Copacabana",-11.856723599999995,-77.06764117055229],
      ["Ovalo Puente Piedra","Puente Piedra","Lima","Lima","Av. Miguel Grau Mz. a Lt. 07 y 08 Urb. San Martin de Porres, Cercado Puente Piedra - Lima, Ref. Espaldas de Tottus de Puente Piedra",-11.869091198636827,-77.07367561802734],
      ["Av Buenos Aires","Puente Piedra","Lima","Lima","Av. Buenos Aires Mz. D, Sub-lote 188e1 Asociación de Pobladores Micaela Bastidas, Puente Piedra - Lima - Lima, Ref. a 2 Cdras. de la Demuna de Puente Piedra",-11.84660895790045,-77.09801023288541],
      ["Almacenes Bsf","Punta Hermosa","Lima","Lima","Car. Autopista Panamericana Sur n° 2001 (km. 38) Interior H02a - Punta Hermosa",-12.301470000005098,-76.78319325684035],
      ["Punta Hermosa","Punta Hermosa","Lima","Lima","Av. Garcia Rada Mz.b Lt.04, Aahh Asociacion de Vivienda y Desarrollo Integral Nueva Generacion, Punta Hermosa - Lima, Ref. a Una Cdra. del Paradero Peatonal de Punta Hermosa",-12.328301119458041,-76.82488673250228],
      ["Rimac Av. Amancaes","Rimac","Lima","Lima","Av. Amancaes Nro. 644 Urb. Ciudad y Campo - Rimac",-12.0220967,-77.0306918],
      ["Rimac Guardia Republicana Cdra. 9","Rimac","Lima","Lima","Sección Inmobiliaria N°2 – Primer Piso Lt. 11 de la Mz. 2, Urb. Villacampa Rimac, Ref. a Una Cdra. del Cruce con Av. Felipe Arancibia",-12.029694115562732,-77.03647277723022],
      ["Av. Javier Prado","San Borja","Lima","Lima","Av. Javier Prado Este N? 1810 - Est. 05 Mz. a - 1 Lt. 04",-12.088864569703691,-77.00711528847536],
      ["Aviacion 2819","San Borja","Lima","Lima","Av. Aviación 2819, Urb. San Borja Sur, Referencia: al Frente de Bembos",-12.0966861,-77.0021534],
      ["Aviacion 2999","San Borja","Lima","Lima","Av. Aviación 2999, Referencia: a 1 Cdra. de la Estación del Tren San Borja Sur",-12.099414,-77.001675],
      ["Av. Angamos","San Borja","Lima","Lima","Av. Angamos Este 2521 (ex Av. Primavera) - Conjunto Habitacional Limatambo - San Borja. Ref. Cerca al Cruce de Av. Angamos Este con Av. Principal",-12.111695444371293,-77.00461517056591],
      ["Riv. Navarrete","San Isidro","Lima","Lima","Av. Rivera Navarrete 465, Referencia: Cruce de Javier Prado con Rivera Navarrete",-12.092087,-77.026871],
      ["Corpac","San Isidro","Lima","Lima","Calle 21 785, Referencia: al Costado del Ministerio del Interior",-12.097055,-77.014892],
      ["Calle las Begonias","San Isidro","Lima","Lima","Calle las Begonias 774 - San Isidro",-12.09576161570898,-77.02598394628174],
      ["Calle Miguel Dasso","San Isidro","Lima","Lima","Calle Miguel Dasso 126 - San Isidro, Ref. en el Cruce de Calle Leonidas Yerovi y Calle Miguel Dasso",-12.10599889858564,-77.04049877946747],
      ["Av Santa Rosa Urb los Alamos","San Juan de Lurigancho","Lima","Lima","Av. Santa Rosa Mz. D1 Lote 1 Urb. los Alamos 2da Etapa - Referencia Altura de la Cuadra 13 del Paradero Canto Grande",-11.965189930600813,-76.9976939189624],
      ["Av. 13 de Enero","San Juan de Lurigancho","Lima","Lima","Av. 13 de Enero Nº2057, Urb. San Hilarión, Referencia: Cerca a la Estación los Postes",-11.997585,-77.005279],
      ["Cruz de Motupe","San Juan de Lurigancho","Lima","Lima","Av. Fernando Wiesse Mz. Q Lote 1 Aa.hh. Cruz de Motupe",-11.938267731665027,-76.97569645009727],
      ["Sjl- las Flores","San Juan de Lurigancho","Lima","Lima","Av. Canto Grande N°. 2570 - Urb. Ganimedes, Referencia: a 3 Cdras. de Plaza Vea",-11.986444455930926,-77.01549062944763],
      ["Sjl-av.proceres","San Juan de Lurigancho","Lima","Lima","Av. Próceres de la Independencia Nro. 1295 - 1299 Referencia: al Costado del Banco de la Nación de Av. los Tusilagos Oeste",-12.012724544095489,-77.0023639335885],
      ["Canto Grande","San Juan de Lurigancho","Lima","Lima","Calle San Martin con Av. Comercial Norte 189 - San Juan de Lurigancho, Ref. a 1/2 Cuadra de la Av 6 de Canto Grande - al Costado del Play Park (parque Bolognesi)",-11.973898198595233,-77.00615208127309],
      ["Los Pinos","San Juan de Lurigancho","Lima","Lima","Mz. B1 Lt. 25 Urbanización los Pinos San Juan de Lurigancho, Ref. Av. Fernando Wiesse - Cerca a la Estación San Martín",-11.973859486207944,-76.99913970487502],
      ["Bayovar","San Juan de Lurigancho","Lima","Lima","Av. Fernando Wiesse Mz. E8. Lote 38b, Mariscal Cáceres Bayovar - San Juan de Lurigancho - Lima, Ref. Auxiliar Próceres de la Independencia, al Frente de la Universidad San Marcos – Agroindustrial",-11.952649328006302,-76.9868396646944],
      ["Campoy","San Juan de Lurigancho","Lima","Lima","Av. Malecón Checa Mz. B Lt. 7, Urb. Campoy, San Juan de Lurigancho, Ref. a 1 Cdra. del Cruce de Av. Malecón Checa con Av. San Martín",-12.024684940555957,-76.96870763756485],
      ["Av. del Mercado","San Juan de Lurigancho","Lima","Lima","Programa Ciudad Mrcal. Caceres, Sector Iii Mz. Q8 Lt. 11 San Juan de Lurigancho - Lima, Ref. a Media Cdra. del Cruce de Av. del Mercado con Av. Ampliacion Oeste",-11.93887049947234,-76.9899343671839],
      ["Jr Chinchaysuyo Cdra 4","San Juan de Lurigancho","Lima","Lima","Jr. Chinchaysuyo 468 Zarate, San Juan de Lurigancho - Lima, Ref. a 1 Cdra. de Tiendas 3 a",-12.023579,-77.000722],
      ["Av. Central","San Juan de Lurigancho","Lima","Lima","Av. Central Mz R9 Lote 3 Programa Ciudad Mrcal. Caceres, Sector Ii, Barrio 3, Grupo Residencial R - San Juan de Lurigancho, Ref. en Medio del Cruce con las Av. el Muro y Ampliacion Este",-11.948238651609154,-76.97919847595998],
      ["Av. Santa Rosa Cruce Av. el Sol","San Juan de Lurigancho","Lima","Lima","Av. Santa Rosa de Lima Mz. D Lt. 4 - Aahh 2 de Setiembre - San Juan de Lurigancho, Ref. a Tres Cdras. del Cruce con Av. el Sol",-11.98966604407686,-76.99894440000024],
      ["Av Malecon Checa Cdra. 1","San Juan de Lurigancho","Lima","Lima","Av. Malecón Miguel Checa Eguiguren n° 167 y 169 de la Urb. Zárate, Sjl - Lima, Ref. Esquina con Av. Gran Chimú",-12.03068626503971,-77.01069288124661],
      ["Av Circunvalacion Sjl","San Juan de Lurigancho","Lima","Lima","Av. Circunvalación Mz. B-5 Lt. 20 Aa. Hh. Sargento Fernando Lores Tenazoa Comuna 20, San Juan de Lurigancho - Lima, Ref. a Dos Cdras. del Colegio Ramiro Priale",-11.97117157272077,-76.9893916747466],
      ["Atocongo","San Juan de Miraflores","Lima","Lima","Av. de los Héroes n° 228 - San Juan de Miraflores - (estación Atocongo)",-12.1518357,-76.9781867],
      ["Maria Auxiliadora","San Juan de Miraflores","Lima","Lima","Av. los Héroes 1140 - Sjm, Referencia: Una Cdra. Antes del Hospital María Auxiliadora",-12.158926,-76.960685],
      ["Av. Canevaro","San Juan de Miraflores","Lima","Lima","Av. Canevaro 336 - A, Ref. a 2 Cuadras de la Av. Vargas Machuga y a Una Cuadra de la Fiscalía Provincial Penal de S.j.m.",-12.166336290865159,-76.9690565560943],
      ["Av Miguel Grau Pamplona Alta","San Juan de Miraflores","Lima","Lima","",0.0,0.0],
      ["Av San Juan Pamplona Alta","San Juan de Miraflores","Lima","Lima","Av. San Juan Mz. 24 Lt. 1, Sect. Nuevo Horizonte, Pp. Jj Pamplona Alta - San Juan de Miraflores, Ref. a 3 Cdras. del Cruce con Av. Salvador Allende",-12.146222055542832,-76.96696460000005],
      ["Fiori","San Martin de Porres","Lima","Lima","Av. Miguel Angel n° 235 - Urb. Fiori 4ta Etapa Mz. N-1 Lt. 04 U.i N°6, San Martín de Porres - Lima, Ref. a 1 Cdra. del Cruce con Av. Marco Polo",-12.009873681812502,-77.05573138335198],
      ["Av. Canta Callao con Alisos","San Martin de Porres","Lima","Lima","Av. Canta Callao, Mz. a Lt. 3 Urb. Arizona - 2da Etapa",-11.97783423,-77.09336287],
      ["Av Bertello Smp","San Martin de Porres","Lima","Lima","Av. Alejandro Bertello Bollati Mz. H Lt. 2-a - Asoc. de Viv. San Remo Ii Etapa, San Martín de Porres - Lima - Lima, Ref. a Media Cdra. del Cruce con Av. Canta Callao",-11.995717209190593,-77.11355059839134],
      ["Smp-av. Proceres","San Martin de Porres","Lima","Lima","Av. Próceres n° 588 Urb. Covicem, Ref. a 2 Cdras. de Tomás Valle",-12.014500655852052,-77.08699865886146],
      ["Av. Peru 15","San Martin de Porres","Lima","Lima","Av. Perú 1589, San Martin de Porres - Lima. Referencia: a Dos Cuadras del Cruce con la Av. Canadá.",-12.0327011,-77.0626605],
      ["Av. Lima Cdra 38","San Martin de Porres","Lima","Lima","Av. Lima 3899 - Smp, Ref. a 3 Cdras. del Tottus de Quilca con Av. Lima",-12.028420907156587,-77.0905094113077],
      ["Av. Carlos Izaguirre Cuadra 23","San Martin de Porres","Lima","Lima","Av. Carlos Izaguirre Sub Lt. 8, Mz. C - Asoc. de Viv. los Nisperos, Referencia: Entre Av. 12 de Octubre y Av. Santa Rosa",-11.99001,-77.09459],
      ["Av. Gerardo Unger Cdra 64","San Martin de Porres","Lima","Lima","Av. Gerardo Unger 6475, Urb. Santa Luisa, 1ra Etapa, S.m.p., Ref. Esquina con Av. 22 de Agosto, Límite con Comas / a Una Cdra. y Media de la Comisaria Santa Luzmila",-11.94597458951921,-77.0665273461935],
      ["Germán Aguirre","San Martin de Porres","Lima","Lima","Av. German Aguirre Ugarte 649 Urb. San German - San Martin de Porres, Ref. a la Altura de la Cuadra 6 de la Av. German Aguirre y a 3 Cuadras de Av. Tomas Valle",-12.015200628370224,-77.07138320411397],
      ["Av Jose Granda Cdra 38","San Martin de Porres","Lima","Lima","Av. José Granda 3826 de la Urb. Condevilla Señor y Valdivieso Mz. M7 Lt 20, 2 Etapa, 2 Sector - S.m.p. , Ref. Entre Av. Condevilla y Av. los Próceres",-12.020561244152566,-77.08705644110377],
      ["Av. Dominicos Cdra 14","San Martin de Porres","Lima","Lima","Av. los Dominicos 1460 - Urb. los Cipreses Mz. Z Lt. 4 - San Martín de Porres, Ref. a Una Cdra. del Cruce con Av. Santa Rosa al Lado del Mercado los Cipreses",-12.000236699984344,-77.10181607059472],
      ["Av Jose Granda Cdra. 25","San Martin de Porres","Lima","Lima","Av. Jose Granda 2546 - San Martin de Porres -lima - Lima, Ref. a Una Cdra. del Óvalo Jose Granda y Av. Universitaria",-12.026653935000597,-77.07307865890112],
      ["Av. Canta Callao con Izaguirre","San Martin de Porres","Lima","Lima","Av. Canta Callao Mz. a Lt. 3 Asoc. Brisas Santa Rosa 1ra Etapa, Ref. a Media Cdra. del Colegio Amistad Y/o a Cuatro Cdras. de la Av. Carlos Izaguirre",-11.98568424406709,-77.10206857055218],
      ["Av. Universitaria Cdra. 16","San Martin de Porres","Lima","Lima","Av. Universitaria 1619 - Urb. Maria Gracia de Antares Mz. B Lt. 25 – San Martin de Porres - Lima, Ref. Frente al Plaza Vea de Universitaria con Tomas Valle",-12.010046601589128,-77.08158949152235],
      ["Av Metropolitana","Santa Anita","Lima","Lima","Av. Huancaray Mz. a Lote 14 - Santa Anita - Referencia : a 2 Cuadras de la Av. Recolectora.",-12.039756332088881,-76.95905183888888],
      ["Av. Huarochirí","Santa Anita","Lima","Lima","",0.0,0.0],
      ["Av Santa Rosa - Sta Anita","Santa Anita","Lima","Lima","Av. Santa Rosa #147 – Urb. Santa Anita Mz. B1 Lt. 08 Unidad Inmobiliaria n° 1 - Santa Anita - Lima, Ref. a Una Cdra. de la Carretera Central",-12.05226684612813,-76.96148503819886],
      ["Av Huarochiri Envios","Santa Anita","Lima","Lima","Av. Huarochiri Mz. D8 Lt. 13, Urb. los Cedros, Santa Anita - Lima, Ref. a Media Cdra. del Cruce con Av. Santa Rosa",-12.041806655130582,-76.95260172004053],
      ["Jr Cesar Vallejo","Santa Anita","Lima","Lima","Jr. Cesar Vallejo 302 Mz. B1 Lt. 02 Urb Universal, Santa Anita- Lima-lima, Ref. a 1 Cdra. del Cruce con Av. Tupac Amaru",-12.043267502694624,-76.97980031394222],
      ["Santa Rosa","Santa Rosa","Lima","Lima","Mz. L 23 Urb. Coovitiomar, Ancon - Santa Rosa - Lima, Ref. Cruce de Ingreso a Santa Rosa Y/o al Costado de Imagen de Santa Rosa",-11.78583266325506,-77.15477687110342],
      ["Higuereta","Santiago de Surco","Lima","Lima","Calle Barlovento n° 134 Referencia: a 3 Cdras de Polvos Rosados, Cerca al Óvalo Higuereta, Surco",-12.128290656591485,-76.99944007964447],
      ["Av. Primavera 120","Santiago de Surco","Lima","Lima","Av. Primavera Nº 120 Tda. A-21 – Urb. Tambo de Monterrico",-12.111550551080423,-76.99288637421152],
      ["Av. Primavera 1314","Santiago de Surco","Lima","Lima","Av. Primavera n° 1314, Urb. C.c. Monterrico - Surco, Referencia: Cruce Jr. el Polo",-12.11012859255803,-76.97482357045575],
      ["Av. Primavera 264","Santiago de Surco","Lima","Lima","Av. Primavera 264 Tda 187 C.c. Chacarilla – Santiago de Surco - Lima - Lima, Ref. C.c. Chacarilla Primer Piso (puerta Principal del Centro Comercial)",-12.111363118043785,-76.9913844045743],
      ["Surco Mateo Pumacahua","Santiago de Surco","Lima","Lima","Av. San Juan Mz a Lote 01 Mateo Pumacahua - Surco, Ref. a 2 Cuadras de la Av. Tupac Amaru Entre el Límite de Chorrillos y Surco",-12.191080022844782,-76.98405895275964],
      ["Av. Tomás Marsano","Santiago de Surco","Lima","Lima","Av. Tomás Marsano 3767 - Santiago de Surco, Ref. a Media Cuadra de la Estación de Tren Ayacucho",-12.135804736326572,-76.99589010595446],
      ["Av Tomas Marsano - la Bolichera","Santiago de Surco","Lima","Lima","Av. Santiago de Surco Nº 4348, Urbanización la Virreyna, Santiago de Surco - Lima, Ref. al Lado de Inteci Sede Surco",-12.14075536666277,-76.99291252944776],
      ["Rep. de Panama","Surquillo","Lima","Lima","Av República de Panamá n° 5115, Referencia: Costado del Grifo Repsol.",-12.1155255,-77.01815066],
      ["Av. Aramburu","Surquillo","Lima","Lima","Av. Aramburú 808, Referencia: a 2 Cdras. de la Av. Panamá",-12.102527,-77.022326],
      ["Av. Principal","Surquillo","Lima","Lima","Lt. 12 Mz. G, Av. Principal 995 (ex Av. Uno) Urb. los Sauces 2da Etapa, Surquillo, Ref. Cruce con A. Manuel Villarán",-12.120399751437718,-77.00350324777227],
      ["Av. Cesar Vallejo","Villa el Salvador","Lima","Lima","Av. Cesar Vallejo, Mz. F Lt. 1 - Sect. 2, Referencia: Frente a Essalud, al Costado del Mercado Villa Sur",-12.210718983393406,-76.9327330431671],
      ["Av. Pastor Sevilla","Villa el Salvador","Lima","Lima","Mz. B Lt. 3 Barrio 3 Sector 2 - 4ta Etapa - Ves, Referencia: por el Óvalo Cerro Lomas, Frente al Colegio Virgen del Rosario",-12.242278748260654,-76.92582672867127],
      ["Óvalo Mariátegui","Villa el Salvador","Lima","Lima","Av. Pastor Sevilla Sect. 6 - Gp 7 - Mz. a - Lote 05 - V.e.s., Ref. a 2 Cuadras del Óvalo Mariátegui con 3 de Octubre",-12.222771994775695,-76.94317697476002],
      ["01 de Mayo","Villa el Salvador","Lima","Lima","Av. 01de Mayo 1 Sect Gp 23 - a Mz N Lote 13 - V.e.s., Ref. Av. Pastor Sevilla con Av. 1 de Mayo a 2 Cuadras del Hospital de la Solidaridad por la Ruta C",-12.197813452067589,-76.95645150975598],
      ["Las Conchitas","Villa Maria del Triunfo","Lima","Lima","Av. Pachacutec 6779, Mz. N, Lt. 20, Villa Maria del Triunfo - Referencia: a Una Cdra. del Grifo Repsol las Conchitas",-12.208631,-76.9259818],
      ["Pesquero","Villa Maria del Triunfo","Lima","Lima","Av. Pachacutec n° 3548, Referencia: Frente a Real Plaza, a 1 Cdra. de Mayorsa",-12.179083535105955,-76.94455568962945],
      ["Av. Lima - Vmt","Villa Maria del Triunfo","Lima","Lima","Av. Lima 2208 José Gálvez- Villa María del Triunfo, Referencia: a Dos Cdras. de la Curva José Gálvez",-12.226053,-76.908879],
      ["Av. Villa Maria","Villa Maria del Triunfo","Lima","Lima","Av Villa Maria Mz. G12 Lt. 9 - B Ps 1 Sect. Villa Maria del Triunfo, Ref. Av. Villa Maria a 2 Cuadras de la Municipalidad de Vmt y al Costado de Essalud",-12.160054167398743,-76.94150305828285],
      ["Nueva Esperanza Vmt","Villa Maria del Triunfo","Lima","Lima","Av. 26 de Noviembre, 1728b - 1728c Mz. 90 Sub Lote. 19b Pueblo Joven Nueva Esperanza, Villa Maria del Triunfo - Lima, Ref. a 3 Cdras. del Mercado Virgen de Lourdes",-12.167552525986567,-76.92398425823932],
      ["Barranca","Barranca","Barranca","Lima","Jr. Andres Reyes Buitron 416. Barranca - Barranca – Lima, Ref. a 2 Cdrs. del Parque el Olvivar / a Mtrs. de la Casa del Maestro",-10.752972858777678,-77.75544507054775],
      ["Paramonga","Paramonga","Barranca","Lima","Av. Central n° 305 Mz. N1 Lt. 17, Ref. Urb. Miguel Grau",-10.673598,-77.815645],
      ["Supe","Supe","Barranca","Lima","Av. Francisco Vidal 1120, Supe - Barranca - Lima, Ref. al Costado de Lubricentro Ciriaco y Media Cdra. de la Cruz Misionera",-10.797690682632263,-77.7110626706071],
      ["Cañete San Vicente","San Vicente de Canet","Cañete","Lima","Aa.hh. Víctor Andrés Belaunde Mz. B Lt. 12, San Vicente de Cañete - Cañete - Lima",-13.076518251018443,-76.39128869885437],
      ["Jr. Santa Rita - Cañete (por Definir)","San Vicente de Canet","Cañete","Lima","Jr. Santa Rita 399, Ref. Cruce con Av. Libertadores",-13.076170653164965,-76.39023934110445],
      ["Av Nicolas de Pierola Cdra 4","Chilca","Cañete","Lima","Av Nicolás de Pierola 462, Una Cuadra Antes de la Municipalidad",-12.5174196,-76.737877],
      ["Ant Panam Sur Cdra 11","Chilca","Cañete","Lima","Antigua Panamericana Sur Cdra. 11 Mz. 46, Lt. 08. Chilca - Cañete - Lima, Ref. a Media Cdra. del Hotel el Pacífico",-12.519499635745452,-76.73222309911321],
      ["Cañete Imperial","Imperial","Cañete","Lima","Jr. Augusto B. Leguía N.º 457, Mz E, Centro Poblado Imperial, Imperial - Cañete - Lima, Ref. Cevichería Brisas del Mar",-13.059358624396962,-76.35372113923681],
      ["Mala","Mala","Cañete","Lima","Av. Marchand # 250, Distrito de Mala . Referencia: a Unas Casas Frente a la Distribuidora Primax Gas",-12.6571028,-76.6366831],
      ["Nuevo Imperial Co","Nuevo Imperial","Cañete","Lima","Fundo Santa Adela, Mz. A, Lotes 8 y 9 – Carretera Cañete a Yauyos Nuevo Imperial - Cañete - Lima, Ref. al Costado del Restaurant la Ruta Brava",-13.071831653175837,-76.33534999999453],
      ["Huaral","Huaral","Huaral","Lima","",0.0,0.0],
      ["Chancay","Chancay","Huaral","Lima","Prolongación San Martín N°403 Chancay - Referencia: a Una Cdra. de la Av. Panamericana Norte",-11.5643122,-77.2673802],
      ["Jicamarca","San Antonio","Huarochiri","Lima","Av. Sinchi Roca Mz. P Lt. 16a P Lote 16a, Aahh las Praderas de Jicamarca – Sector el Cercado – Anexo 22 Jicamarca – Huarochiri, Ref. Cerca al Arco Porton de Jicamarca",-11.931112343934627,-76.96588399999963],
      ["Salaverry Huacho Co","Huacho","Huaura","Lima","Prolongación Salaverry n° 764 Huacho - Referencia : Cruce con la Av la Paz",-11.1094203,-77.5991073],
      ["Huacho Av Indacochea","Huacho","Huaura","Lima","Av. Mercedes Indacochea 1276 Huacho - Huaura - Lima, Ref. Intersección con Pedro Ruiz Gallo, a 2 Cdras. de la Universidad Nacional José Faustino Sánchez Carrión",-11.118526813051153,-77.61038923524518],
      ["Huaura","Huaura","Huaura","Lima","Av. las Malvinas Mz. C Lote 16 Urb. el Rosario Sur Huaura, Ref. a Espaldas de la Plaza de Armas, a 1 Cdra. de la Calle los Alamos",-11.071359272395785,-77.59997468596578],
      ["Sayan","Sayan","Huaura","Lima","Calle Naranjo n° 211.sayan - Huaura - Lima, Ref. a Media Cdra. de la Plaza de Armas y de la Municipalidad",-11.135195879940518,-77.19272381237359],
      ["Prueba Sistemas Af","Caujul","Oyon","Lima","",0.0,0.0],
      ["Churín - Oyón (por Definir)","Churin","Oyon","Lima","Av. Vía de Avitamiento n° N/s Churín - Oyón - Lima, Ref. a Media Cdra. de la Plaza de Armas y de la Municipalidad",-10.806834617317831,-76.87611109999513],
      ["Iquitos Jr Francisco Bolognesi","Iquitos","Maynas","Loreto","Jr. Francisco Bolognesi Nro 203 - 215 Iquitos. Referencia : Esquina con Putumayo",-3.7468824,-73.2484034],
      ["Puerto Iquitos","Iquitos","Maynas","Loreto","",0.0,0.0],
      ["Iquitos Co Jr. Pablo Rossell","Iquitos","Maynas","Loreto","Jr. Pablo Rossell 590 con Nanay, Ref. Cruce con Av. Nanay Frente al Instituto Cepro América Computer",-3.7421506375217146,-73.24346254641992],
      ["Aeropuerto Iquitos","Iquitos","Maynas","Loreto","Aeropuerto Coronel Francisco Secada Vignetta",0.0,0.0],
      ["Iquitos Av Tupac Amaru","Iquitos","Maynas","Loreto","Av. Tupac Amaru con - Calle Lourdes de León #479 Iquitos Maynas - Loreto, Ref. Frente a la Botica Thiagofama",-3.755084262574874,-73.26994460488734],
      ["Punchana","Punchana","Maynas","Loreto","Calle Borja N°648 Punchana - Maynas - Loreto, Ref. al Costado de la Farmacia San Carlos Centro Médico",-3.7299283680047357,-73.24747588152304],
      ["Av Participacion Parcela","Iquitos San Juan Bautista","Maynas","Loreto","Av. Participación Parcela 9-a San Juan Bautista - Maynas - Loreto, Ref. Frente al Lavadero Osito y a Media Cdra. del Parque 1 de Enero",-3.779312527786838,-73.27991317085994],
      ["Av Jose A. Quiñones","Iquitos San Juan Bautista","Maynas","Loreto","Av. José Abelardo Quiñones # 2475 San Juan Bautista - Maynas - Loreto, Ref. Frente a la Universidad Científica del Perú (ucp)",-3.7704160308984127,-73.28197085889545],
      ["Ctra Iquitos Nauta","Iquitos San Juan Bautista","Maynas","Loreto","Carretera Iquitos Nauta, s/n Mz. K - Lt. 20, San Juan Bautista - Maynas - Loreto, Ref. al Costado de la Distribuidora Amazon Gas.",-3.7960541680006514,-73.30155548285867],
      ["Yurimaguas","Yurimaguas","Alto Amazonas","Loreto","Calle Jorge Chávez n° 300, Referencia: Esquina con Progreso, al Costado de Enapu",-5.8863186,-76.1105129],
      ["Puerto Yurimaguas","Yurimaguas","Alto Amazonas","Loreto","",0.0,0.0],
      ["Tambopata Av la Joya Co","Tambopata","Tambopata","Madre de Dios","Av. la Joya n° 122 - Pto. Maldonado, Referencia: Frente al Óvalo de los Otorongos",-12.599565,-69.1949842],
      ["Aeropuerto Puerto Maldonado","Tambopata","Tambopata","Madre de Dios","Aeropuerto Internacional Padre Aldamiz",0.0,0.0],
      ["Av 15 de Agosto","Tambopata","Tambopata","Madre de Dios","Av. 15 de Agosto n° 529, Tambopata - Tambopata - Madre de Dios, Ref. a Espaldas del Colegio Carlos Fermin Fitzcarrald / Cruce con Jr. Ica",-12.59086131016212,-69.18988960543331],
      ["Tambopata Av Circunvalacion","Tambopata","Tambopata","Madre de Dios","Av. Circunvalacion Mz. C Lt. 01, Tambopata - Tambopata - Madre de Dios, Ref. a Dos Cdras. de la Carretera Interoceanica Sur / Cruce con Jr. las Mercedes Cabello",-12.581888331367503,-69.20289122151831],
      ["Mazuko","Inambari","Tambopata","Madre de Dios","Av. los Pioneros, Lt. 2 y 3, Inambari – Tambopata - Madre de Dios, Ref. al Costado del Terminal Terrestre de Mazuko / al Pie de la Carretera al Rio Inambari",-13.098946521771756,-70.36991732806855],
      ["El Triunfo","Las Piedras","Tambopata","Madre de Dios","Av. Interoceanica Km. 1 , las Piedras - Tambopata - Madre de Dios, Ref. al Costado del Grifo Virgen Natividad",-12.580878999999957,-69.172572],
      ["Iberia","Iberia","Tahuamanu","Madre de Dios","Av. Jorge Chavez Mz. H1 Sub Lote 11-b, Iberia - Tahuamanu - Madre de Dios, Ref. a Una Cdra. de la Empresa Real Dorado / a Una Cdra. y Media de la Av Jose Aldamiz",-11.40655428078264,-69.48797004964358],
      ["San Antonio","Moquegua","Mariscal Nieto","Moquegua","Av. Santa Fortunata Mz. N5 Lt. 10 Asoc. Villa Moquegua San Antonio. Referencia : a Una Cuadra de la Casa de la Mujer",-17.2102839,-70.9480949],
      ["Calle Lima","Moquegua","Mariscal Nieto","Moquegua","Calle Lima 190 - Mariscal Nieto - Moquegua, Ref. a Dos Cuadras del Parque los Héroes/alameda",-17.194764722675988,-70.9383486726684],
      ["Quebrada las Lechuzas Co","Moquegua","Mariscal Nieto","Moquegua","Sector Quebrada las Lechuzas Moquegua Calle N°1 Mz H Lt. 04, Moquegua - Mariscal Nieto - Moquegua, Ref. Quebrada de Lechuzas",-17.196494104692476,-70.94804437674955],
      ["Chen Chen","Moquegua","Mariscal Nieto","Moquegua","Mz. C Lt. 24 – Asociación César Vizcarra – Centro Poblado Chen Chen , Moquegua –mariscal Nieto – Moquegua, Ref. al Costado del Ovalo Chen Chen",-17.19916777059667,-70.92247339798664],
      ["Ilo Co Pampa Inalambrica","Ilo","Ilo","Moquegua","Urb. Ciudad del Pescador, Mz. J Lt. 18-19, Referencia: a Dos Cuadras del Poder Judicial",-17.646726685783417,-71.33250863766686],
      ["Ilo Puerto","Ilo","Ilo","Moquegua","Jr. Callao Prolongación Mz. N, Lt. 19 - A, Referencia: a Media Cdra. de la Cooperativa Cuajone",-17.644710705275386,-71.34212390418006],
      ["Ilo Pacocha","Pacocha","Ilo","Moquegua","Agrupación de Familias Pueblo Nuevo M.z E2 Lt. Com2a Sect. Ii – Ilo - Moquegua, Ref. al Costado del Banco Bcp",-17.614692860029443,-71.33830554805624],
      ["Cerro de Pasco","Chaupimarca","Pasco","Pasco","Jr. Huaricapcha s/n A.h. Tupac Amaru Chaupimarca, Referencia: Frente al Nuevo Terminal",-10.686749,-76.246862],
      ["Huayllay","Huayllay","Pasco","Pasco","Calle Lima s/n Barrio Arenales Huayllay Pasco - Referencia: al Costado del Colegio Cesar Vallejo",-11.0007095,-76.3672417],
      ["Oxapampa","Oxapampa","Oxapampa","Pasco","Mz. 239 Sub Lote H – 1 Oxapampa - Oxapampa - Pasco, Ref. Entre Av. Angélica Frey y Jr. Lima",-10.582583283003277,-75.39897163744664],
      ["Villa Rica","Villa Rica","Oxapampa","Pasco","Av. Leopoldo Krausse n° 442 Villa Rica - Oxapampa - Pasco, Ref. Entre el Jr. Pozuzo y Jr. Cooperativa, al Costado de la Notaría Guerra y a 20 Metros de la Plaza Principal",-10.735805270592811,-75.26836110007693],
      ["Av. Luis Eguiguren","Piura","Piura","Piura","Av. Málaga Mz. a Lt.20 Int. 105 Piura, Ref. a Media Cuadra de Honda del Peru S.a. en el Cruce de Av. Luis Eguiguren con Sullana Norte",-5.1854726017121475,-80.63332306469526],
      ["Av. Grau","Piura","Piura","Piura","Av. Grau Manzana N, Lote 33 - Urbanización la Alborada. Ref. Grau con Marcavelica",-5.1867475,-80.6547354],
      ["Aeropuerto Piura","Piura","Piura","Piura","Aeropuerto Internacional Guillermo Concha Ibérico",0.0,0.0],
      ["Av Raul Mata la Cruz- Dos Grifos","Piura","Piura","Piura","Av. Raúl Mata la Cruz Lt. 11 Mz. C Urb. los Jardines - Corpiura, - Piura - Piura - Piura, Ref. a Una Cdra. de los 2 Grifos en Toda la Av. Raúl Mata la Cruz",-5.166389,-80.653667],
      ["Av Tacna","Castilla","Piura","Piura","",0.0,0.0],
      ["Tacala","Castilla","Piura","Piura","",0.0,0.0],
      ["Catacaos","Catacaos","Piura","Piura","Av. Francisco Bolognesi Mz. 60 Lt. 37 Catacaos - Piura - Piura, Ref. al Lado del Ex Pronei",-5.2679722000010125,-80.67238822945784],
      ["La Union","La Union","Piura","Piura","Av. Lima n° 590 Referencia : Frente a Tiendas Chancafe Q",-5.3993284,-80.742189],
      ["Las Lomas","Las Lomas","Piura","Piura","Jr. Miguel Grau Mz. H Lt. 7, las Lomas - Piura, Ref. al Costado de Caja Huancayo y al Costado de Comisaria las Lomas",-4.656583386167418,-80.24388825265311],
      ["Tambo Grande","Tambo Grande","Piura","Piura","Av. Arámbulo Santín n° 100, Mz. D Lt. E Aa. Hh. Andrés Rázuri Referencia: a Dos Cuadras del Estadio Deportivo",-4.9269396952541085,-80.3433987012977],
      ["Calle Emaús","26 de Octubre","Piura","Piura","Calle Tres n° 102, Sublote n° 1d Mz. y - Zona Industrial Ii, Distrito 26 de Octubre - Referencia: al Costado de Senati",-5.179971707400483,-80.6522508432666],
      ["Parque Industrial Co Piura Futura","26 de Octubre","Piura","Piura","Urb. Parque Industrial Piura Futura Mz. G, Lt. 1a. 26 de Octubre - Piura, Referencia: al Frente del Grifo Petro Perú",-5.160555116974226,-80.69064923610875],
      ["Av. Gullman","26 de Octubre","Piura","Piura","A.a.h.h. Consuelo de Velasco 1 Etapa Sector B Mz Lt.18 26 de Octubre – Piura, Ref. Cruce Av. Circunvalación con Av. Gullman al Costado de la Ferreteria los Reyes",-5.1979627644128215,-80.64265559999707],
      ["Aahh Santa Rosa Piura","26 de Octubre","Piura","Piura","Urb. Santa Rosa Mz. D Lt. 7, Sect. 7, 26 de Octubre - Piura. Ref. Av. Raul Mata la Cruz con Circunvalación al Frente de Repuestos Frank|",-5.189141664343215,-80.66536028618765],
      ["Ayabaca","Ayabaca","Ayabaca","Piura","Calle Bolognesi n° 136, Ref. a 2 Cuadras de la Plaza de Armas de Ayabaca",-4.640038745614637,-79.71467813609598],
      ["Paimas","Paimas","Ayabaca","Piura","Av. Sullana S/n, Ref. Frente al Complejo Educativo Juan Velasco Alvarado",-4.623827984669996,-79.94850300000063],
      ["Huancabamba","Huancabamba","Huancabamba","Piura","Av. Ramon Castilla 0351 Huancabamba - Piura, Ref. a 1 Cuadra de la Capilla Ramon Castilla",-5.243903335489964,-79.45335334110476],
      ["Chulucanas","Chulucanas","Morropon","Piura","Jr. Huancavelica n° 548 Referencia : al Lado del Terminal de Ronco",-5.0955589,-80.1629195],
      ["Morropon","Morropon","Morropon","Piura","Jr. Adrianzén n° 099, Morropon - Morropon - Piura, Ref, a Espaldas de del Terminal Terrestre de Trampsa",-5.189195067803936,-79.97230492944777],
      ["Paita","Paita","Paita","Piura","Mz. H Lt. 14 Urb. Sol y Mar - Paita, Referencia: al Costado de la Empresa San Miguel",-5.086794773070312,-81.09300948870097],
      ["Sullana Santa Rosa","Sullana","Sullana","Piura","Carretera Panamericana Norte Nº 790 Sullana Referencia : Frente al Colegio Chiquititos",-4.908899,-80.697109],
      ["Sullana Co Zona Industrial","Sullana","Sullana","Piura","Ctra. Sullana Nº s/n Mz. K, Lt. 06 - Zona Industrial Municipal, Referencia: al Costado del Hotel Coco Suite",-4.924883,-80.696031],
      ["Bellavista Sullana","Bellavista","Sullana","Piura","Calle Moquegua 381, Bellavista, Ref. Rest. Parrilladas Chavelos",-4.891177336220263,-80.67892770977264],
      ["Ignacio Escudero","Ignacio Escudero","Sullana","Piura","Av. Panamericana Calle 26 Lote 3, Ignacio Escudero - Sullana - Piura, Ref. Frente a la Institución Educativa Ignacio Escudero",-4.846443152160278,-80.87337630979688],
      ["Talara Co Asoc California","Parinas","Talara","Piura","Asociación California C - 03 Frente a Carretera Negritos, Talara - Pariñas, Referencia: al Costado del Restaurante Mi Torete",-4.589515632189196,-81.27349917492963],
      ["Talara Alta 9 de Octubre","Parinas","Talara","Piura","Mz. N-10 Aa.hh 9 de Octubre Talara Alta, Pariñas - Talara - Piura, Ref. a 1 Cdra. Antes de Amecfa",-4.591314005198959,-81.25249567054887],
      ["Talara Baja Parque 22","Parinas","Talara","Piura","Parque 22 – 03 Lateral. Talara Baja, Pariñas - Talara - Piura. Ref. Frente a Minsa",-4.575510000000982,-81.26861532943082],
      ["El Alto","El Alto","Talara","Piura","Av. Bolognesi O-37 Centro el Alto, Referencia: a Espaldas de la Municipalidad de el Alto",-4.268178,-81.221744],
      ["Los Organos","Los Organos","Talara","Piura","Av. Panamericana Norte P-29 - Urb. Cercado Zona Urbana, Referencia al Frente de Grifo de Troncos O Grifo San Pedro",-4.174775309542279,-81.12341168487191],
      ["Máncora","Mancora","Talara","Piura","Av. Grau Nro. 432 Máncora - Talara - Piura, Ref. Frente al Paradero de Autos de los Órganos en Toda la Panamericana Norte.",-4.106719854952655,-81.0488326331666],
      ["Sechura","Sechura","Sechura","Piura","Av. Bayovar n° 311 Referencia : al Costado de Antena 10 Radio",-5.5556999,-80.81829],
      ["Av Costanera","Puno","Puno","Puno","Av. Costanera n° 211 con Jr. los Incas - Puno",-15.834283484814137,-70.01839696894581],
      ["Salcedo","Puno","Puno","Puno","Urb. Aziruni Tepro I Etapa Mz. 18 Lt. 52 Jr los Rosales – Salcedo Puno, Ref. a Una Cdra. de la Av. Estudiante / a Dos Cdras. de Senati Puno",-15.871121071440841,-69.99658993067256],
      ["Alto Puno","Puno","Puno","Puno","Urb. San Pedro-alto Puno, Av la Cultura n° 160, Puno - Puno - Puno, Ref. a Tres Cdras. de la Av. Que Va a Juliaca / a Dos Cdras. del Grifo Bronco",-15.817227035488742,-70.03092219999974],
      ["Av 4 de Noviembre Co","Puno","Puno","Puno","Av. 4 de Noviembre n° 474-b y 486-b Barrio Santa Rosa, Puno - Puno – Puno, Ref. a Una Cdra. de Sunafil",-15.855167345042021,-70.01577847055121],
      ["Azangaro","Azangaro","Azangaro","Puno","Av. Próceres S/n, Azángaro - Puno, Ref. a Dos Cdras. del Parque de la Madre / a Orillas de la Misma Av. Proceres",-14.91711240867566,-70.19847195677302],
      ["Desaguadero","Desaguadero","Chucuito","Puno","Av. 28 de Julio n° 564 - 566, Chucuito Ref. a 50 Mtrs. del Banco de la Nacion",-16.561694166327943,-69.04113822943981],
      ["Ilave","Ilave","El Collao","Puno","Jr. Bolognesi Nro. 866 Barrio Cruzani, el Collao - Puno, Ref. a Una Cuadra del Coliseo y del Cementerio de Ilave",-16.082861100000834,-69.6447221999635],
      ["Ayaviri","Ayaviri","Melgar","Puno","Jr. Santa Rosa Prolongación s/n Magisterial - Puno - Melgar - Ayaviri, Ref. a 50 Metros del Óvalo, Salida a Juliaca",-14.886554,-70.598362],
      ["Jr. Mama Ocllo","Juliaca","San Roman","Puno","Jr. Mama Ocllo 915 - B ( Cruce con Jr Azángaro )",-15.490571,-70.119498],
      ["Av. Huancane Cdra. 9","Juliaca","San Roman","Puno","Jr. Sillustani n° 202, San Roman - Juliaca, Ref. a 3 Cdras. del Hospital Carlos Monge Medrano",-15.480556232291255,-70.11783330441247],
      ["Las Mercedes","Juliaca","San Roman","Puno","Jr. Porvenir n° 228 Urb. las Mercedes, San Roman - Puno, Ref. a Una Cdra. de la Av. Circunvalacion Oeste - a Una Cdra. del Terminal las Mercedes",-15.48392080081471,-70.14139085999258],
      ["Aeropuerto Juliaca","Juliaca","San Roman","Puno","Aeropuerto Internacional Inca Manco Capac",0.0,0.0],
      ["Av. Lampa","Juliaca","San Roman","Puno","Av. Lampa Mz. B2 Lt. 3 Urb. Santa Adriana, Juliaca - San Román - Puno, Ref. a Media Cdra. de la Posta de Salud de la Urb. Santa Adriana",-15.483557842073871,-70.1554429175297],
      ["Av. Modesto Borda","Juliaca","San Roman","Puno","Av. Modesto Borda Mz. a Lt. 04 Urb. Arrabal Don Julio, Juliaca - San Roman - Puno, Ref. Dos Cdras. Antes del Grifo Blanco / a Dos Cdras. del Salon de Eventos Paraiso Azul",-15.507584214102287,-70.10875104217104],
      ["Av Independencia","Juliaca","San Roman","Puno","Av. Independencia Nro. 1538 Mz. A1 Lt. 04 Urb. Horacio Zeballos Gamez, Juliaca - San Román - Puno, al Frente del Grifo San Carlos / Cruce con Jr 21 de Eneroref.",-15.467833299998848,-70.13758397054843],
      ["Jr Agustin Gamarra","Juliaca","San Roman","Puno","Jr. Agustin Gamarra Mz. R1 Lt. 09 Urb. Huancane, Juliaca - San Román - Puno, Ref. a Una Cdra. de la Av. Huancane / Cruce con Jr. Alberto Cuentas Zabala",-15.473583959348124,-70.11241723327487],
      ["Av Heroes del Pacifico Co","Juliaca","San Roman","Puno","Av. Héroes de la Guerra del Pacifico Km 3.5, Juliaca - San Román - Puno, Ref. al Frente del Grifo Leon Service",-15.507667505495098,-70.16500034221524],
      ["Ovalo Orquideas Co","Moyobamba","Moyobamba","San Martin","Jr. 20 de Abril 2138 - Referencia : Altura de la Pampa del Hambre",-6.0465912,-76.9725996],
      ["Moyobamba Centro","Moyobamba","Moyobamba","San Martin","Jr. Serafín Filomeno N°279, Moyobamba - Moyobamba - San Martín, Ref. a Una Cuadra Imedia del Cumo (centro Cultural de Moyobamba)",-6.033515130082472,-76.97105492944783],
      ["Soritor","Soritor","Moyobamba","San Martin","Jr. Miguel Grau Cdra 7 N°741 Mz.05 Lte.16b, Soritor - Moyobamba - San Martín, Ref. a Media Cdra. de la Iglesia Asambleas de Dios",-6.139861766706353,-77.10383330000002],
      ["San Martin Bellavista","Bellavista","Bellavista","San Martin","Av. Lima s/n C-4 Mz 71 – Lote a – Tercer Piso, Bellavista- Bellavista- San Martin, Ref. Espaldas de Ferretería el Iman",-7.057498003584878,-76.59052847055227],
      ["San Jose de Sisa","San Jose de Sisa","El Dorado","San Martin","Jr. Bolognesi Cdra 6, San Jose de Sisa - el Dorado - San Martin, Ref. Altura de Jr Lamas y Jr Eladio Tapullima",-6.612972199999503,-76.69116602944409],
      ["Saposoa","Saposoa","Huallaga","San Martin","Av. Loreto s/n - Saposoa - el Huallaga - San Martin, Ref. en el Hostal el Gato, a Una Cdra. y Media de la Plaza de Armas",-6.934250592175415,-76.77241636767862],
      ["Lamas","Lamas","Lamas","San Martin","Jr. 16 de Octubre N°1137, Referencia: a la Espalda del Grifo Vargas Tello",-6.418742633896947,-76.5174897454863],
      ["Juanjuí Fernando Belaunde Terry Co","Juanjui","Mariscal Caceres","San Martin","Carretera Fernando Terry Km. 1 s/n Referencia: al Costado de Paradero de Autos Huallaga Express",-7.1779108,-76.737078],
      ["Juanjui Centro","Juanjui","Mariscal Caceres","San Martin","Jr. Sargento Lorez n° 568, Juanjui - Mariscal Cáceres - San Martin, Ref. a Una Cdra. de del Jr. Huallaga Cdra. 11 y a Una Cdra. de Importaciones Patricia",-7.179917313987387,-76.73122245211385],
      ["Picota","Picota","Picota","San Martin","Av. Fernando Belaunde Terry Lote 2b Picota - Picota - San Martin. Ref, a Una Cdra. de la Comisaria de Picota Salida a Bellavista",-6.92005479100676,-76.33327738221027],
      ["Rioja","Rioja","Rioja","San Martin","Ctra. Fernando Belaúnde Terry n° 415, Referencia: al Costado de la Clínica Chilcon Hope",-6.053861100001365,-77.16166602945009],
      ["Segunda Jerusalen","Elias Soplin Vargas","Rioja","San Martin","Jr. Lima Mz. 43 Lt. 08 , Elias Soplin Vargas - Rioja - San Martin, Ref. al Costado de Tienda Chingay",-5.9887225879190895,-77.27986055260727],
      ["Nueva Cajamarca","Nueva Cajamarca","Rioja","San Martin","Av. Cajamarca Norte Mz. 51 Lt. 15, Referencia: al Costado de Essalud",-5.9292775948100385,-77.31329812259968],
      ["Pardo Miguel Naranjos","Pardo Miguel","Rioja","San Martin","Jr. Miguel Grau 101 Mz. 34 Lt. 6, Pardo Miguel - Rioja - San Martin, Ref. Av. Marginal Cdra 5",-5.739746366208036,-77.50177931643448],
      ["Tarapoto Co Jr Alfonso Ugarte","Tarapoto","San Martin","San Martin","Jr. Alfonso Ugarte N°2283 - Tarapoto - San Martin - San Martin, Ref. Frente a la Cancha Sintético el Golazo",-6.495224256805541,-76.38349995870936],
      ["Jr Leoncio Prado","Tarapoto","San Martin","San Martin","Jr. Leoncio Prado n° 1175, Referencia: a Una Cuadra del Instituto María Parado de Bellido",-6.47868780392675,-76.36582219925785],
      ["Aeropuerto Tarapoto","Tarapoto","San Martin","San Martin","Aeropuerto Guillermo del Castillo Paredes",0.0,0.0],
      ["Jr. Tahuantinsuyo","Tarapoto","San Martin","San Martin","Jr. Tahuantinsuyo n° 158 - Tarapoto - San Martín, Ref. al Costado del Grifo San Martín",-6.489609616265022,-76.3635562705658],
      ["Jr. Ramón Castilla","Tarapoto","San Martin","San Martin","Jr. Ramon Castilla N°1362 Tarapoto - San Martin, Ref. a Media Cdra. de Mannucci Motor S.a.",-6.495944789790742,-76.37208531998057],
      ["Tarapoto la Banda de Shilcayo","La Banda de Shilcayo","San Martin","San Martin","Jr. Perú N°186, Referencia: a 2 Cdrs. de la Plaza de la Banda de Shilcayo",-6.491469534987081,-76.35514024111046],
      ["Tarapoto Jr. Sargento Lorez","Morales","San Martin","San Martin","Jr. Sargento Lorez n° 264, Morales - San Martin, Ref. a Una Cdra. y Media de la Plaza de Morales, Frente a Vulcano Gas",-6.477416002732138,-76.38522223805326],
      ["Av Fernando Belaunde","Tocache","Tocache","San Martin","Av. Fernando Belaunde C-09 Mz H6 (21), Lt. 04, Cercado de Tocache, Ref. Frente al Mercadillo de Tocache",-8.186307,-76.517989],
      ["Jr Fredy Aliaga Co","Tocache","Tocache","San Martin","Jr. Fredy Aliaga N°3046 -tocache - Tocache - San Martin, Ref. al Costado del Recreo Campestre Estragos",-8.190082547884403,-76.53547238844254],
      ["Uchiza","Uchiza","Tocache","San Martin","Av. Leoncio Prado N°524 - Uchiza - Tocache - San Martin, Ref. a Media Cdra. de la Plaza Central / Frente a Coopact",-8.459945272574574,-76.46208195944595],
      ["Tacna Co Av. Jorge Basadre","Tacna","Tacna","Tacna","Av. Jorge Basadre Grohmann Oeste n° 366 - Tacna",-18.014034875511868,-70.25991521819422],
      ["Av Vigil","Tacna","Tacna","Tacna","Av. Vigil 1636, Referencia: a Una Cdra. de la Plaza Grau",-17.999550724530586,-70.23910165889546],
      ["Aeropuerto Tacna","Tacna","Tacna","Tacna","Aeropuerto Internacional Coronel Carlos Ciriani Santa Rosa",0.0,0.0],
      ["Av. Arias Araguez","Tacna","Tacna","Tacna","Calle Arias Araguez n° 836 Tacna, Ref. a Una Cdra. Antes de Llegar al Coliseo Perú",-18.006778378004235,-70.25297396523166],
      ["Av Ejercito","Tacna","Tacna","Tacna","Av. Litoral Nro. 306 – Para Chico (anterior Av. Ejército Prolongación 306 Tacna), Tacna - Tacna - Tacna, Ref. Dentro del Establecimiento del Grifo Primax",-18.029249633967783,-70.27433327282664],
      ["Pocollay","Tacna","Tacna","Tacna","Pueblo Tradicional Pocollay Mz. T Lote 01 , Pocollay - Tacna - Tacna, Ref. a Una Cdra. del Centro de Salud Pocollay",-17.99327768071331,-70.2184437309437],
      ["Tacna Ciudad Nueva","Ciudad Nueva","Tacna","Tacna","Ciudad Nueva Mz 46 Lt 12 Comité 10 Ciudad Nueva - Tacna, Ref. a Una Cdra. de la Plaza José Olaya de Ciudad Nueva",-17.984471588056913,-70.23605509590311],
      ["Villa San Francisco","Coronel Gregorio Albarracin Lanchipa","Tacna","Tacna","Asoc. Villa San Francisco Mz. 94 Lt. 22, Referencia: Cerca a Caja Cusco",-18.04710323743616,-70.25588923201391],
      ["Av. Municipal","Coronel Gregorio Albarracin Lanchipa","Tacna","Tacna","Asociación las Vilcas Mz. E Lt. 16, Gregorio Albarracín Lanchipa - Tacna Ref. Frente al Mercado Héroes del Cenepa",-18.033417923277582,-70.2509181081136],
      ["Viñanis","Coronel Gregorio Albarracin Lanchipa","Tacna","Tacna","Promuvi Viñani, Amp. I Etapa, Mz. 574, Lt. 09 – Coronel Gregorio Albarracín Lanchipa – Tacna - Tacna, Ref. a Media Cdra. del Óvalo los Molles",-18.062945787541306,-70.2518600149207],
      ["Tumbes - Av Arica","Tumbes","Tumbes","Tumbes","Av. Arica n° 227 - Tumbes.",-3.5654275,-80.4590402],
      ["Tumbes Puyango","Tumbes","Tumbes","Tumbes","Urb. Andrés Araujo Morán Mz. 28-a Lote 03 Calle Jacinto Seminario, Ref. al Costado del Mercado Puyango",-3.5630010344404113,-80.42650021013371],
      ["Tumbes Co - Panamericana Norte Km 2360","Tumbes","Tumbes","Tumbes","Av. Panamericana Norte s/n Villa Primavera - Tumbes. Ref. Pasando Senati Frente a Agripac",-3.5524449279814987,-80.41980528487542],
      ["Aeropuerto Tumbes","Tumbes","Tumbes","Tumbes","Aeropuerto Internacional Pedro Canga Rodríguez",0.0,0.0],
      ["Pampa Grande Tumbes","Tumbes","Tumbes","Tumbes","Mz. 0u Lt. 00a Aa.hh. Pampa Grande, Tumbes, Ref. Frente a la Av. Universitaria, y al Frente a la Iglesia Mormones y al Lado de Un Lavadero de Autos.",-3.5777440688748268,-80.4515750703021],
      ["Corrales","Corrales","Tumbes","Tumbes","Av. Huáscar Nº 311 Int. 01 Centro, Corrales - Tumbes, Ref. a Espaldas de la Plaza de Armas",-3.6020260860710267,-80.48008352158246],
      ["La Cruz Tumbes","La Cruz","Tumbes","Tumbes","Jr. Piura 105 Caleta la Cruz, la Cruz - Tumbes, Ref. Frente a Ctr. Panamericana Norte y al Frente de Motorepuestos y Multiservicios Lujan",-3.6376008662907866,-80.58692158387932],
      ["Zorritos","Zorritos","Contralmirante Villa","Tumbes","Av. 28 de Julio n° 205 Mz. 14 Lt. 04 los Pinos Tumbes, Contralmiraante Villar - Zorritos - Tumbes",-3.682642989342705,-80.68648517011738],
      ["Zarumilla","Zarumilla","Zarumilla","Tumbes","Jiron Independencia 309 Zarumilla, Ref. Atrás de la Plaza de Armas y Frente al Dorado Pasando 5 Casas",-3.502634095913844,-80.27477916857237],
      ["Aguas Verdes","Aguas Verdes","Zarumilla","Tumbes","Av Tumbes s/n Lote 09 Mz 17 , A.h Tomas Arizola Olaya , Sector Ii - Referencia : a Una Cuadra del Parque Tomas Arizola.",-3.4805719,-80.2469869],
      ["Calleria Jr Jose Galvez","Pucallpa Calleria","Coronel Portillo","Ucayali","Jr. Jose Galvez 147 Calleria - Coronel Portillo - Ucayali. Referencia : a Media Cuadra de la Av. Centenario",-8.382759,-74.545825],
      ["Aeropuerto Pucallpa","Pucallpa Calleria","Coronel Portillo","Ucayali","Aeropuerto David Abensur Rengifo",0.0,0.0],
      ["Calleria Av Saenz Peña","Pucallpa Calleria","Coronel Portillo","Ucayali","Av. Saenz Peña 229, Calleria - Coronel Portillo - Ucayali, Ref. a Dos Cuadras del Ovalo de Federico Basadre y Saenz Peña",-8.379899526786184,-74.53802747055227],
      ["Pucallpa Co Federico Basadre","Pucallpa Yarinacocha","Coronel Portillo","Ucayali","Carretera Federico Basadre Km 6.800 Yarinacocha - Coronel Portillo - Ucayali, Ref. Entrada del Asentamiento Humano Alan Sisley/al Costado de la Empresa Jvj Service Oriente Sac",-8.393748000000405,-74.58812099999896],
      ["Yarinacocha Centro","Pucallpa Yarinacocha","Coronel Portillo","Ucayali","Jr. Tupac Amaru, Mz. 50, Lt. 07, Referencia: a Espalda de Maestranza de Yarinacocha",-8.357748663430492,-74.57631034110798],
      ["Yarinacocha Av Universitaria","Pucallpa Yarinacocha","Coronel Portillo","Ucayali","Av. Universitaria Mza a Lote 6, Yarinacocha - Coronel Portillo - Ucayali, Ref. a Media Cdra. del Local Rokalpa",-8.380017136607092,-74.56846715889546],
      ["Manantay Av Aguaytia","Pucallpa Manantay","Coronel Portillo","Ucayali","Av. Aguaytia Mz., 26 Lt. 20 Manantay - Coronel Portillo - Ucayali, Ref. a Media Cdra. del Nuevo Mercado de San Fernando",-8.397853663359813,-74.54065801165858],
      ["Manantay Av Tupac Amaru","Pucallpa Manantay","Coronel Portillo","Ucayali","Av. Tupac Amaru 2315 Manantay - Coronel Portillo - Ucayali, Ref. a Media Cdra. de la Polleria Emanuel",-8.398473936652824,-74.55535379997603],
      ["Aguaytía","Aguaytia","Padre Abad","Ucayali","U. Vecinal Barrio Unido Mz. 1 Lt. 2, Padre Abad - Ucayali, Ref. al Costado del Terminal Terrestre de Aguaytia",-9.035628453257184,-75.49601150433176]
    ];

    function _n(s){
      return String(s||"").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
    }
    function _esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function _hi(txt,terms){
      var o=_esc(txt);
      terms.forEach(function(t){
        if(t.length<2) return;
        o=o.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>");
      });
      return o;
    }

    var SEDES=DATA.map(function(r){
      return {n:r[0],dist:r[1],prov:r[2],dep:r[3],addr:r[4],lat:r[5],lon:r[6],
        _s:_n(r[0]+" "+r[1]+" "+r[2]+" "+r[3]+" "+r[4])};
    });

    function search(q,lim){
      lim=lim||14;
      var nq=_n(q); if(!nq) return [];
      var terms=nq.split(" ").filter(function(t){return t.length>=2;});
      if(!terms.length) terms=[nq];
      var res=[];
      SEDES.forEach(function(s){
        var score=0,ok=true;
        terms.forEach(function(t){
          if(s._s.indexOf(t)<0){ok=false;return;}
          if(_n(s.n).indexOf(t)>=0) score+=10;
          if(_n(s.dist).indexOf(t)>=0) score+=7;
          if(_n(s.prov).indexOf(t)>=0) score+=5;
          if(_n(s.dep).indexOf(t)>=0) score+=3;
          if(_n(s.addr).indexOf(t)>=0) score+=2;
        });
        if(ok) res.push({s:s,sc:score});
      });
      return res.sort(function(a,b){return b.sc-a.sc;}).slice(0,lim).map(function(r){return r.s;});
    }

    function labelSede(s){
      var loc=[];
      if(s.dist&&_n(s.dist)!==_n(s.prov)) loc.push(s.dist);
      if(s.prov) loc.push(s.prov);
      return "Shalom "+s.n+(loc.length?" - "+loc.join(", "):"");
    }

    function renderDrop(drop,results,input){
      var terms=_n(input.value).split(" ").filter(function(t){return t.length>=2;});
      var html='<div class="sede-status"><span>📍 <strong>'+SEDES.length+'</strong> sedes oficiales Shalom</span>'+
        (results.length?'<span class="sede-count">'+results.length+' resultado'+(results.length!==1?'s':'')+'</span>':'')+
        '</div>';
      if(!results.length){
        html+='<div class="sede-empty"><b>Sin resultados</b>Prueba con el nombre del distrito, ciudad, provincia o agencia.</div>';
      }else{
        results.forEach(function(s,i){
          var loc=[];
          if(s.dist&&_n(s.dist)!==_n(s.prov)) loc.push(s.dist);
          if(s.prov) loc.push(s.prov);
          if(s.dep) loc.push(s.dep);
          var mapLink=(s.lat&&s.lon&&s.lat!==0)?
            ' <a class="sede-map-link" href="https://maps.google.com/maps?q='+s.lat+','+s.lon+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Ver en Google Maps">🗺️</a>':"";
          html+='<div class="sede-item" role="option" data-i="'+i+'">'+
            '<div class="sede-item-name">'+_hi(s.n,terms)+mapLink+'</div>'+
            '<div class="sede-item-loc">📍 '+_hi(loc.join(" · "),terms)+'</div>'+
            (s.addr?'<div class="sede-item-addr">'+_hi(s.addr,terms)+'</div>':"")+
            '</div>';
        });
      }
      drop.innerHTML=html;
      drop.classList.add("open");
    }

    function install(scope){
      var wrap=document.querySelector('.sede-wrap[data-scope="'+scope+'"]');
      if(!wrap) return;
      var input=wrap.querySelector(".sede-input");
      var drop=wrap.querySelector(".sede-drop");
      var clrBtn=wrap.querySelector(".sede-clear");
      if(!input||!drop) return;
      var cur=[],kbIdx=-1;

      function open(r){ cur=r; kbIdx=-1; renderDrop(drop,r,input); }
      function close(){ drop.classList.remove("open"); kbIdx=-1; }

      function pick(idx){
        if(idx<0||idx>=cur.length) return;
        var s=cur[idx];
        input.value=labelSede(s);
        var pEl=document.getElementById(scope+"-provincia");
        var dEl=document.getElementById(scope+"-depto");
        if(pEl){ pEl.value=s.dep||""; pEl.dispatchEvent(new Event("input",{bubbles:true})); }
        if(dEl){ dEl.value=s.prov||""; dEl.dispatchEvent(new Event("input",{bubbles:true})); }
        input.dispatchEvent(new Event("input",{bubbles:true}));
        close();
      }

      function updateKb(){
        drop.querySelectorAll(".sede-item").forEach(function(el,i){
          el.classList.toggle("kbfocus",i===kbIdx);
          if(i===kbIdx) el.scrollIntoView({block:"nearest"});
        });
      }

      var timer;
      input.addEventListener("input",function(){
        clearTimeout(timer);
        var q=input.value.trim();
        if(!q||_n(q)==="shalom"){ close(); return; }
        timer=setTimeout(function(){ open(search(q,14)); },180);
      });
      input.addEventListener("focus",function(){
        var q=input.value.trim();
        if(q&&_n(q)!=="shalom") open(search(q,14));
      });
      input.addEventListener("keydown",function(e){
        if(!drop.classList.contains("open")) return;
        if(e.key==="ArrowDown"){e.preventDefault();kbIdx=Math.min(cur.length-1,kbIdx+1);updateKb();}
        else if(e.key==="ArrowUp"){e.preventDefault();kbIdx=Math.max(-1,kbIdx-1);updateKb();}
        else if(e.key==="Enter"&&kbIdx>=0){e.preventDefault();pick(kbIdx);}
        else if(e.key==="Escape") close();
      });
      drop.addEventListener("click",function(e){
        var item=e.target.closest(".sede-item");
        if(item) pick(parseInt(item.getAttribute("data-i"),10));
      });
      document.addEventListener("click",function(e){ if(!wrap.contains(e.target)) close(); });
      if(clrBtn){
        clrBtn.addEventListener("click",function(){
          input.value="Shalom"; input.dispatchEvent(new Event("input",{bubbles:true}));
          close(); input.focus();
        });
      }
    }

    if(document.readyState==="loading")
      document.addEventListener("DOMContentLoaded",function(){ install("p"); });
    else { install("p"); }
  })();

(function () {
      var POLOS_CATALOGO_OVERSHARK = [
        "BABY TY",
        "BABY TY MANGA",
        "CAMISA WAFFLE",
        "CAMISERO JERSEY",
        "CAMISERO PIKE",
        "CLASICO",
        "CUELLO CHINO",
        "CUELLO CHINO WAFFLE",
        "JERSEY MANGA LARGA",
        "OVERSIZE",
        "WAFFLE",
        "WAFFLE CAMISERO",
        "WAFFLE MANGA LARGA"
      ];

      var TALLAS_SML = ["S", "M", "L"];
      var TALLAS_SMLXL = ["S", "M", "L", "XL"];

      var COLORES_BABY_TY =
        "Azul, Beige, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino, Menta";
      var COLORES_CAMISA_WAFFLE =
        "Beige, Botella, Cemento, Denim, Melange O., Negro, Pacay, P. Rosa, Perla, Vino";
      var COLORES_15_POLO =
        "Azul, Beige, Botella, Camote, Cemento, Denim, Marron, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";
      var COLORES_CUELLO_CHINO =
        "Azul, Beige, Botella, Cemento, Negro, Topo, P. Rosa, Perla, Vino";
      var COLORES_CUELLO_CHINO_WAFFLE =
        "Azul, Botella, Cemento, Negro, Pacay, P. Rosa, Perla, Plomo, Vino";
      var COLORES_JERSEY_ML =
        "Azul, Beige, Cemento, Denim, Melange O., Negro, Topo, Pacay, P. Rosa, Perla, Plomo, Vino";

      var POL_VARIANTES_OVERSHARK = {
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
        "WAFFLE MANGA LARGA": { tallas: TALLAS_SMLXL, colores: COLORES_15_POLO }
      };

      /** Precios unitarios (S/) para el texto de TIPO DE COMBO — ajustá a tu catálogo. */
      var POL_PRECIOS_OVERSHARK = {
        "BABY TY": 45,
        "BABY TY MANGA": 45,
        "CAMISA WAFFLE": 45,
        "CAMISERO JERSEY": 45,
        "CAMISERO PIKE": 45,
        "CLASICO": 45,
        "CUELLO CHINO": 45,
        "CUELLO CHINO WAFFLE": 45,
        "JERSEY MANGA LARGA": 45,
        "OVERSIZE": 45,
        "WAFFLE": 45,
        "WAFFLE CAMISERO": 45,
        "WAFFLE MANGA LARGA": 45
      };
      var ENVIO_PROVINCIA_SOLES = 12;
      var ENVIO_LIMA_SOLES = 14;

      function getMarca() { return "overshark"; }

      function getVariantesMap() { return POL_VARIANTES_OVERSHARK; }

      function fillDatalist(dlId, catalog) {
        var dl = $(dlId);
        if (!dl) return;
        dl.innerHTML = "";
        var sorted = catalog.slice().sort(function (a, b) {
          return a.localeCompare(b, "es");
        });
        for (var i = 0; i < sorted.length; i++) {
          var optD = document.createElement("option");
          optD.value = sorted[i];
          dl.appendChild(optD);
        }
      }

      function initPoloCatalogs() {
        fillDatalist("lista-polos-overshark", POLOS_CATALOGO_OVERSHARK);
      }

      var u = {
        minus: "\u2796",
        bus: "\uD83D\uDE8C",
        point: "\uD83E\uDEF5\uD83C\uDFFB",
        phone: "\uD83D\uDCF2",
        card: "\uD83D\uDCB3",
        speak: "\uD83D\uDDE3\uFE0F",
        cool: "\uD83D\uDE0E",
        pin: "\uD83D\uDCCC",
        gift: "\uD83C\uDF81",
        moto: "\uD83C\uDFCD\uFE0F",
        lock: "\uD83D\uDD12",
        ok: "\uD83C\uDD97"
      };

      function $(id) { return document.getElementById(id); }
      var productsList = $("products-list");
      var output = $("output");
      var toast = $("toast");

      function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () { toast.classList.remove("show"); }, 2000);
      }

      function val(id) {
        var el = $(id);
        return el ? String(el.value || "").trim() : "";
      }

      /** Negrita en WhatsApp/Telegram al pegar el resumen (*texto*). */
      function boldIf(s) {
        var v = String(s || "").trim();
        return v ? "*" + v + "*" : "";
      }

      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;");
      }

      function parseQtyInt(raw) {
        var n = parseInt(String(raw || "").trim(), 10);
        if (isNaN(n) || n < 1) return 1;
        return n;
      }

      function adjustQtyInput(inp, delta) {
        if (!inp) return;
        var n = parseQtyInt(inp.value) + delta;
        if (n < 1) n = 1;
        inp.value = String(n);
      }

      function normalizePolName(name) {
        var M = getVariantesMap();
        var t = String(name || "").trim();
        if (M[t]) return t;
        var keys = Object.keys(M);
        var tl = t.toLowerCase();
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].toLowerCase() === tl) return keys[i];
        }
        return null;
      }

      function getPolConfig(name) {
        var M = getVariantesMap();
        var k = normalizePolName(name);
        return k ? M[k] : null;
      }

      function parseColoresList(s) {
        if (!s) return [];
        return String(s)
          .split(",")
          .map(function (x) {
            return x.trim();
          })
          .filter(Boolean);
      }

      function getProdTalla(row) {
        var pressed = row.querySelector(".prod-size-boxes .prod-size-btn[aria-pressed=\"true\"]");
        if (!pressed) return "";
        return String(pressed.getAttribute("data-talla") || "").trim();
      }

      function renderProdSizeBoxes(boxHost, allowed, current) {
        if (!boxHost) return;
        var tallas = allowed && allowed.length ? allowed : TALLAS_SMLXL;
        var cur = String(current || "").trim();
        if (cur && tallas.indexOf(cur) < 0) cur = "";
        boxHost.innerHTML = "";
        function mk(label, val) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "prod-size-btn";
          b.setAttribute("data-talla", val);
          var on = val === "" ? !cur : cur === val;
          b.setAttribute("aria-pressed", on ? "true" : "false");
          b.textContent = label;
          var tip = val === "" ? "Sin talla (\u2014)" : "Talla " + val;
          b.setAttribute("title", tip);
          b.setAttribute("aria-label", tip);
          boxHost.appendChild(b);
        }
        mk("-", "");
        for (var i = 0; i < tallas.length; i++) mk(tallas[i], tallas[i]);
      }

      function renderProdColorGrid(gridHost, colorsArr) {
        if (!gridHost) return;
        gridHost.innerHTML = "";
        for (var i = 0; i < colorsArr.length; i++) {
          var c = colorsArr[i];
          var b = document.createElement("button");
          b.type = "button";
          b.className = "prod-color-chip";
          b.setAttribute("data-color", c);
          b.textContent = c;
          b.setAttribute("aria-label", "A\u00F1adir color " + c);
          gridHost.appendChild(b);
        }
      }

      function syncProdRowVariants(row) {
        var nameEl = row.querySelector(".prod-name");
        var boxHost = row.querySelector(".prod-size-boxes");
        var extras = row.querySelector(".product-row-extras");
        var colorGrid = row.querySelector(".prod-color-grid");
        var colorList = row.querySelector(".product-color-lines");
        if (!boxHost) return;
        var name = nameEl ? String(nameEl.value || "").trim() : "";
        var key = normalizePolName(name) || "";
        var prevKey = row.getAttribute("data-pol-key") || "";
        if (key !== prevKey) {
          row.setAttribute("data-pol-key", key);
          if (colorList) colorList.innerHTML = "";
        }
        var cfg = getPolConfig(name);
        var allowed = cfg && cfg.tallas ? cfg.tallas : TALLAS_SMLXL;
        var cur = getProdTalla(row);
        renderProdSizeBoxes(boxHost, allowed, cur);
        if (extras && colorGrid) {
          if (cfg && cfg.colores) {
            extras.classList.add("visible");
            var cols = parseColoresList(cfg.colores);
            renderProdColorGrid(colorGrid, cols);
          } else {
            extras.classList.remove("visible");
            colorGrid.innerHTML = "";
            if (colorList) colorList.innerHTML = "";
          }
        }
        updateProdRowMainQtyVisibility(row);
      }

      function updateProdRowMainQtyVisibility(row) {
        var qtyCell = row.querySelector(".prod-qty-cell");
        var list = row.querySelector(".product-color-lines");
        if (!qtyCell) return;
        var n = list ? list.querySelectorAll(".prod-color-line").length : 0;
        qtyCell.style.display = n > 0 ? "none" : "";
      }

      function addProdColorLine(row, colorName) {
        var list = row.querySelector(".product-color-lines");
        if (!list || !colorName) return;
        var c = String(colorName).trim();
        if (!c) return;
        var existing = list.querySelectorAll(".prod-color-line");
        for (var i = 0; i < existing.length; i++) {
          var dc = existing[i].getAttribute("data-color") || "";
          if (dc.toLowerCase() === c.toLowerCase()) {
            showToast("Ese color ya est\u00E1 en la l\u00EDnea");
            return;
          }
        }
        var line = document.createElement("div");
        line.className = "prod-color-line";
        line.setAttribute("data-color", c);
        line.innerHTML =
          "<span class=\"prod-color-name\"></span>" +
          "<div class=\"prod-color-qty-wrap\"><label>Cant.</label>" +
          "<div class=\"qty-stepper\" role=\"group\" aria-label=\"Cantidad por color\">" +
          "<button type=\"button\" class=\"qty-btn qty-minus\" aria-label=\"Restar uno\">\u2212</button>" +
          "<input type=\"text\" class=\"prod-color-qty\" inputmode=\"numeric\" placeholder=\"1\" value=\"1\" />" +
          "<button type=\"button\" class=\"qty-btn qty-plus\" aria-label=\"Sumar uno\">+</button>" +
          "</div></div>" +
          "<button type=\"button\" class=\"btn btn-secondary prod-color-rm\" aria-label=\"Quitar color\">Quitar</button>";
        line.querySelector(".prod-color-name").textContent = c;
        line.querySelector(".prod-color-rm").addEventListener("click", function () {
          line.remove();
          updateProdRowMainQtyVisibility(row);
          refreshOutput();
        });
        var qIn = line.querySelector(".prod-color-qty");
        if (qIn) qIn.addEventListener("input", refreshOutput);
        list.appendChild(line);
        updateProdRowMainQtyVisibility(row);
      }

      function formatProductsBlock() {
        var rows = productsList.querySelectorAll(".product-row");
        var groups = {};
        var groupOrder = [];

        // Agrupar filas por data-promo-group
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var nameEl = row.querySelector(".prod-name");
          var name = nameEl ? String(nameEl.value || "").trim() : "";
          if (!name) continue;
          
          var promoGroup = row.getAttribute("data-promo-group") || "";
          if (!groups[promoGroup]) {
             groups[promoGroup] = [];
             groupOrder.push(promoGroup);
          }
          groups[promoGroup].push(row);
        }

        var finalBlocks = [];
        
        for (var g = 0; g < groupOrder.length; g++) {
          var promoGroup = groupOrder[g];
          var groupRows = groups[promoGroup];
          var isCustom = (promoGroup !== "");
          
          var groupTotalQty = 0;
          var groupBlocks = [];
          
          // Primero calcular el total de este grupo y preparar las líneas de productos
          var productLines = [];
          for (var i = 0; i < groupRows.length; i++) {
            var row = groupRows[i];
            var nameEl = row.querySelector(".prod-name");
            var qtyEl = row.querySelector(".prod-qty");
            var name = nameEl ? String(nameEl.value || "").trim() : "";
            var size = getProdTalla(row);
            var sizePart = size ? " (talla " + size + ")" : "";
            var colorLines = row.querySelectorAll(".prod-color-line");
            
            if (colorLines.length > 0) {
              var subs = [];
              for (var j = 0; j < colorLines.length; j++) {
                var cl = colorLines[j];
                var col = cl.getAttribute("data-color") || "";
                if (!col) continue;
                var qEl = cl.querySelector(".prod-color-qty");
                var cq = qEl ? String(qEl.value || "").trim() : "";
                var n = parseInt(cq, 10);
                if (isNaN(n) || n < 1) n = 1;
                groupTotalQty += n;
                
                var colU = col.toUpperCase();
                var sub = (isCustom ? "- " : "  - ") + colU;
                if (n !== 1) sub += " \u00D7 " + n;
                if (isCustom) sub += sizePart;
                subs.push(sub);
              }
              if (subs.length > 0) {
                if (isCustom) {
                  productLines.push(subs.join("\n"));
                } else {
                  var head = "- " + name + sizePart;
                  productLines.push(head + "\n" + subs.join("\n"));
                }
              }
            } else {
              var qty = qtyEl ? String(qtyEl.value || "").trim() : "";
              var nq = parseInt(qty, 10);
              if (isNaN(nq) || nq < 1) nq = 1;
              groupTotalQty += nq;
              
              if (isCustom) {
                productLines.push("- " + nq + " prendas" + sizePart + " (sin color)");
              } else {
                productLines.push("- " + name + " \u00D7 " + nq + sizePart);
              }
            }
          }
          
          if (isCustom) {
             groupBlocks.push("*" + groupTotalQty + " " + promoGroup + "*");
          }
          groupBlocks.push.apply(groupBlocks, productLines);
          
          finalBlocks.push(groupBlocks.join("\n"));
        }
        
        if (!finalBlocks.length) return "";
        return "\n\n- PRODUCTO -\n\n" + finalBlocks.join("\n\n") + "\n";
      }

      function formatAllProductSections() {
        return formatProductsBlock();
      }

      function parseMoneyPE(raw) {
        if (raw == null) return NaN;
        var s = String(raw).trim();
        if (!s) return NaN;
        s = s.replace(/^S\//i, "").replace(/\s/g, "");
        if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(",", ".");
        else s = s.replace(/,/g, "");
        var n = parseFloat(s);
        return isNaN(n) ? NaN : n;
      }

      function getCuentaTotalParsed() {
        var a = parseMoneyPE(val("cuenta-pago"));
        var b = parseMoneyPE(val("cuenta-debe"));
        if (!isNaN(a) && a > 0 && !isNaN(b) && b > 0) return a + b;
        if (!isNaN(b) && b > 0) return b;
        if (!isNaN(a) && a > 0) return a;
        return NaN;
      }

      function getEnvioSolesForTipo(tipo) {
        if (tipo === "prov") return ENVIO_PROVINCIA_SOLES;
        if (tipo === "lima") return ENVIO_LIMA_SOLES;
        return 0;
      }

      function sumCatalogPolosSoles() {
        var rows = productsList.querySelectorAll(".product-row");
        var map = POL_PRECIOS_OVERSHARK;
        var sum = 0;
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var nameEl = row.querySelector(".prod-name");
          var qtyEl = row.querySelector(".prod-qty");
          var name = nameEl ? String(nameEl.value || "").trim() : "";
          if (!name) continue;
          var key = normalizePolName(name);
          var unit = key && map[key] != null ? Number(map[key]) : 0;
          if (isNaN(unit) || unit < 0) unit = 0;
          var colorLines = row.querySelectorAll(".prod-color-line");
          if (colorLines.length > 0) {
            for (var j = 0; j < colorLines.length; j++) {
              var cl = colorLines[j];
              var col = cl.getAttribute("data-color") || "";
              if (!col) continue;
              var qEl = cl.querySelector(".prod-color-qty");
              var cq = qEl ? String(qEl.value || "").trim() : "";
              var n = parseInt(cq, 10);
              if (isNaN(n) || n < 1) n = 1;
              sum += unit * n;
            }
          } else {
            var qty = qtyEl ? String(qtyEl.value || "").trim() : "";
            var nq = parseInt(qty, 10);
            if (isNaN(nq) || nq < 1) nq = 1;
            sum += unit * nq;
          }
        }
        return Math.round(sum * 100) / 100;
      }

      /**
       * TIPO DE COMBO: en Lima solo "6 WAFFLE CLASICO" (cantidad + tipos de prenda).
       * En provincia / recojo: promo "WAFFLE CLASICO 6 X 99" (monto neto tras envío 12/14 en prov).
       */
      function formatTipoComboSheet(ctx) {
        var rows = productsList.querySelectorAll(".product-row");
        var orderedNames = [];
        var seen = Object.create(null);
        var totalQty = 0;

        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var nameEl = row.querySelector(".prod-name");
          var qtyEl = row.querySelector(".prod-qty");
          var name = nameEl ? String(nameEl.value || "").trim() : "";
          if (!name) continue;

          var canon = normalizePolName(name);
          var label = String(canon || name)
            .toUpperCase()
            .replace(/\s+/g, " ")
            .trim();
          if (!seen[label]) {
            seen[label] = true;
            orderedNames.push(label);
          }

          var colorLines = row.querySelectorAll(".prod-color-line");
          if (colorLines.length > 0) {
            for (var j = 0; j < colorLines.length; j++) {
              var cl = colorLines[j];
              if (!(cl.getAttribute("data-color") || "").trim()) continue;
              var qEl = cl.querySelector(".prod-color-qty");
              var cq = qEl ? String(qEl.value || "").trim() : "";
              var n = parseInt(cq, 10);
              if (isNaN(n) || n < 1) n = 1;
              totalQty += n;
            }
          } else {
            var qty = qtyEl ? String(qtyEl.value || "").trim() : "";
            var nq = parseInt(qty, 10);
            if (isNaN(nq) || nq < 1) nq = 1;
            totalQty += nq;
          }
        }

        if (totalQty < 1) return "";

        var customInp = $("custom-combo-name");
        if (customInp && customInp.value.trim() !== "") {
          return totalQty + " " + customInp.value.trim();
        }

        var namesStr = orderedNames.join(" ");

        if (ctx.tipo === "lima") {
          var outLima = String(totalQty) + " " + namesStr;
          outLima = outLima.trim();
          if (outLima.length > 320) outLima = outLima.slice(0, 317) + "...";
          return outLima;
        }

        var env = getEnvioSolesForTipo(ctx.tipo);
        var catSum = sumCatalogPolosSoles();
        var formTot = getCuentaTotalParsed();
        var base = catSum > 0 ? catSum : (isNaN(formTot) ? 0 : formTot);
        var net = base > 0 ? Math.round((base - env) * 100) / 100 : 0;
        if (net < 0) net = 0;

        var priceStr = "";
        if (base > 0) {
          priceStr = net % 1 === 0 ? String(Math.round(net)) : net.toFixed(2);
        }

        var out =
          namesStr +
          " " +
          totalQty +
          (priceStr !== "" ? " X " + priceStr : "");

        if (out.length > 320) out = out.slice(0, 317) + "...";
        return out;
      }

      function getActiveClienteCtx() {
        if ($("tab-prov").getAttribute("aria-selected") === "true") {
          return {
            cel: val("p-celular"),
            nom: val("p-nombre"),
            dni: val("p-dni"),
            tipo: "prov",
            marcaLabel: "OVER"
          };
        }
        if ($("tab-lima").getAttribute("aria-selected") === "true") {
          return {
            cel: val("l-celular"),
            nom: val("l-nombre"),
            dni: val("l-dni"),
            tipo: "lima",
            marcaLabel: "OVER"
          };
        }
        return {
          cel: val("a-celular"),
          nom: val("a-nombre"),
          dni: val("a-dni"),
          tipo: "almacen",
          marcaLabel: "OVER"
        };
      }

      function getPaymentSheetValues() {
        var completo = $("cuenta-completo") && $("cuenta-completo").checked;
        var pago = val("cuenta-pago");
        var debe = val("cuenta-debe");
        return {
          completo: completo,
          separo: completo ? "" : pago,
          resta: completo ? "" : debe,
          pagoCompletoTxt: completo ? (pago || debe) : ""
        };
      }

      function nowTimeHM() {
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
      }

      function findFirstEmptySheetRow() {
        var body = $("sales-sheet-body");
        if (!body) return null;
        var trs = body.querySelectorAll("tr");
        for (var i = 0; i < trs.length; i++) {
          var tds = trs[i].querySelectorAll("td");
          if (tds.length < 4) continue;
          var cel = (tds[1].textContent || "").trim();
          var nom = (tds[2].textContent || "").trim();
          var dni = (tds[3].textContent || "").trim();
          if (!cel && !nom && !dni) return trs[i];
        }
        return null;
      }

      function pushCurrentSaleToSheet() {
        var ctx = getActiveClienteCtx();
        if (!ctx.cel && !ctx.nom) {
          showToast("Completa al menos celular o nombre");
          return;
        }
        var tr = findFirstEmptySheetRow();
        if (!tr) {
          showToast("No hay fila vac\u00EDa (sin datos de cliente)");
          return;
        }
        var tds = tr.querySelectorAll("td");
        if (tds.length < 17) {
          showToast("Error de tabla");
          return;
        }
        var pay = getPaymentSheetValues();
        var limaMark = ctx.tipo === "lima" ? "X" : "";
        var provMark = ctx.tipo === "prov" ? "X" : "";
        var combo = formatTipoComboSheet(ctx);

        tds[1].textContent = ctx.cel;
        tds[2].textContent = ctx.nom;
        tds[3].textContent = ctx.dni;
        tds[5].textContent = nowTimeHM();
        tds[10].textContent = ctx.marcaLabel;
        tds[11].textContent = limaMark;
        tds[12].textContent = provMark;
        tds[13].textContent = pay.separo;
        tds[14].textContent = pay.resta;
        tds[15].textContent = pay.pagoCompletoTxt;
        tds[16].textContent = combo;

        var exportBox = $("sales-sheet-export");
        if (exportBox) {
          try {
            exportBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } catch (e) {}
        }
        showToast("Venta a\u00F1adida a la planilla");
      }

      function formatCuentaBlock() {
        var completo = $("cuenta-completo");
        var texto = "Contra entrega";
        if (completo && completo.checked) texto = "Pago completo";
        var pagoMonto = val("cuenta-pago");
        var debe = val("cuenta-debe");
        var block = "\n\n- PAGO -\nForma de pago: " + texto + "\n";
        if (pagoMonto) block += "Pago: " + pagoMonto + "\n";
        if (debe) block += "\n- DEBE -\nDebe: " + debe + "\n";
        return block;
      }

      function buildProvincia() {
        var sede = val("p-sede") || "Shalom";
        var t =
          u.minus + "OVERSHARK \u2014 DATOS PROVINCIA " + u.bus + u.bus + "\n" +
          u.point + "Nombre: " + val("p-nombre") + "\n" +
          u.phone + " Celular: " + val("p-celular") + "\n" +
          u.card + "Numero DNI : " + val("p-dni") + "\n" +
          u.speak + "Provincia: " + boldIf(val("p-depto")) + "\n" +
          u.cool + " Departamento: " + boldIf(val("p-provincia")) + "\n" +
          u.pin + "SEDE de agencia: " + boldIf("(" + sede + ")") +
          formatCuentaBlock();
        t += formatAllProductSections();
        t += "\n\nCADENITA DE REGALO " + u.gift;
        t += "\n\nVENDEDOR VALENTINO";
        t += "\n\n\u23F0 Te enviarán tu voucher entre 48 a 72 horas máximo";
        return t.replace(/\s+$/, "");
      }

      function buildLima() {
        var t =
          u.minus + "OVERSHARK \u2014 DELIVERY LIMA" + u.moto + u.moto + "\n" +
          u.point + "Nombre: " + val("l-nombre") + "\n" +
          u.phone + "Numero celular: " + val("l-celular") + "\n" +
          u.lock + "DNI: " + val("l-dni") + "\n" +
          u.pin + " Ubicaci\u00F3n en tiempo actual (Mandar): " + boldIf(val("l-ubicacion")) + "\n" +
          u.pin + "Distrito: " + boldIf(val("l-distrito")) +
          formatCuentaBlock();
        t += formatAllProductSections();
        t += "\n\n*CADENITA DE REGALO*" + u.gift;
        t += "\n\nVENDEDOR VALENTINO";
        t += "\n\n\uD83D\uDCCC Los pedidos salen al día siguiente entre las 11 AM y a lo largo de la tarde/noche del día";
        return t.replace(/\s+$/, "");
      }

      function buildAlmacen() {
        var t =
          u.minus + "OVERSHARK \u2014 RECOJO EN ALMAC\u00C9N\n" +
          u.point + "Nombre: " + val("a-nombre") + "\n" +
          u.phone + "Numero celular: " + val("a-celular") + "\n" +
          u.ok + " DNI: " + val("a-dni") + "\n" +
          formatCuentaBlock();
        t += formatAllProductSections();
        t += "\n\n*CADENITA DE REGALO*" + u.gift;
        t += "\n\nVENDEDOR VALENTINO";
        return t.replace(/\s+$/, "");
      }

      function refreshOutput() {
        var provSelected = $("tab-prov").getAttribute("aria-selected") === "true";
        var limaSelected = $("tab-lima").getAttribute("aria-selected") === "true";
        if (provSelected) output.value = buildProvincia();
        else if (limaSelected) output.value = buildLima();
        else output.value = buildAlmacen();
      }

      function clearProvinciaFields(skipRefresh) {
        var ids = ["p-nombre", "p-celular", "p-dni", "p-provincia", "p-depto"];
        for (var i = 0; i < ids.length; i++) {
          var el = $(ids[i]);
          if (el) el.value = "";
        }
        var sede = $("p-sede");
        if (sede) sede.value = "Shalom";
        if (!skipRefresh) refreshOutput();
      }

      function clearLimaFields(skipRefresh) {
        var ids = ["l-nombre", "l-celular", "l-dni", "l-ubicacion", "l-distrito"];
        for (var j = 0; j < ids.length; j++) {
          var el2 = $(ids[j]);
          if (el2) el2.value = "";
        }
        if (!skipRefresh) refreshOutput();
      }

      function clearAlmacenFields(skipRefresh) {
        var idsA = ["a-nombre", "a-celular", "a-dni"];
        for (var ia = 0; ia < idsA.length; ia++) {
          var ea = $(idsA[ia]);
          if (ea) ea.value = "";
        }
        if (!skipRefresh) refreshOutput();
      }

      function clearCuentaFields(skipRefresh) {
        var contra = $("cuenta-contra");
        if (contra) contra.checked = true;
        var cp = $("cuenta-pago");
        var cd = $("cuenta-debe");
        if (cp) cp.value = "";
        if (cd) cd.value = "";
        if (!skipRefresh) refreshOutput();
      }

      function clearClienteTodo() {
        clearProvinciaFields(true);
        clearLimaFields(true);
        clearAlmacenFields(true);
        clearCuentaFields(true);
        refreshOutput();
        showToast("Datos del cliente borrados");
      }

      function addProductRow(name, qty, size) {
        var row = document.createElement("div");
        row.className = "detail-card product-row";
        row.setAttribute("data-pol-key", "");
        row.innerHTML =
          "<div class=\"product-row-main\">" +
          "<div class=\"cell-name\"><label>Producto</label><input type=\"text\" class=\"prod-name\" list=\"" +
          "lista-polos-overshark" +
          "\" placeholder=\"" +
          "Escribe o elige polo del cat\u00E1logo" +
          "\" value=\"" +
          esc(name || "") +
          "\" /></div>" +
          "<div class=\"cell-size prod-size-cell\"><label>Talla</label>" +
          "<div class=\"prod-size-boxes\" role=\"group\" aria-label=\"Talla S a XL\"></div></div>" +
          "<div class=\"prod-qty-cell\"><label>Cant.</label>" +
          "<div class=\"qty-stepper\" role=\"group\" aria-label=\"Cantidad\">" +
          "<button type=\"button\" class=\"qty-btn qty-minus\" aria-label=\"Restar uno\">\u2212</button>" +
          "<input type=\"text\" class=\"prod-qty\" inputmode=\"numeric\" placeholder=\"1\" value=\"" +
          esc(qty || "1") +
          "\" />" +
          "<button type=\"button\" class=\"qty-btn qty-plus\" aria-label=\"Sumar uno\">+</button>" +
          "</div></div>" +
          "<button type=\"button\" class=\"btn btn-secondary rm\" aria-label=\"Quitar\">Quitar</button>" +
          "</div>" +
          "<div class=\"product-row-extras\" aria-label=\"Colores del cat\u00E1logo\">" +
          "<div class=\"prod-color-extras\">" +
          "<span class=\"product-row-extras-lbl\">A\u00F1adir color (toca un cuadro; nueva fila con cantidad)</span>" +
          "<div class=\"prod-color-grid\" role=\"group\" aria-label=\"Colores del cat\u00E1logo\"></div>" +
          "</div>" +
          "</div>" +
          "<div class=\"product-color-lines\" aria-label=\"Colores y cantidades\"></div>";
        row.querySelector(".rm").addEventListener("click", function () {
          var ps = $("promo-select");
          if(ps) ps.value = "";
          row.remove();
          refreshOutput();
        });
        row.addEventListener("click", function (e) {
          var qstep = e.target.closest(".qty-btn");
          if (qstep && row.contains(qstep)) {
            var step = qstep.closest(".qty-stepper");
            if (step) {
              var qInp = step.querySelector("input");
              if (qInp) {
                var d = qstep.classList.contains("qty-plus") ? 1 : -1;
                adjustQtyInput(qInp, d);
                refreshOutput();
              }
            }
            return;
          }
          var sz = e.target.closest(".prod-size-btn");
          var box = row.querySelector(".prod-size-boxes");
          if (sz && box && box.contains(sz)) {
            var btns = box.querySelectorAll(".prod-size-btn");
            for (var bi = 0; bi < btns.length; bi++) {
              btns[bi].setAttribute("aria-pressed", btns[bi] === sz ? "true" : "false");
            }
            refreshOutput();
            return;
          }
          var chip = e.target.closest(".prod-color-chip");
          var grid = row.querySelector(".prod-color-grid");
          if (chip && grid && grid.contains(chip)) {
            var cv = String(chip.getAttribute("data-color") || "").trim();
            if (cv) {
              addProdColorLine(row, cv);
              refreshOutput();
            }
          }
        });
        var inputs = row.querySelectorAll("input");
        for (var j = 0; j < inputs.length; j++) {
          inputs[j].addEventListener("input", refreshOutput);
        }
        row.addEventListener("focusout", function (e) {
          var t = e.target;
          if (!t || !row.contains(t)) return;
          if (t.classList && (t.classList.contains("prod-qty") || t.classList.contains("prod-color-qty"))) {
            t.value = String(parseQtyInt(t.value));
            refreshOutput();
          }
        });
        var nameInp = row.querySelector(".prod-name");
        if (nameInp) {
          nameInp.addEventListener("input", function () {
            syncProdRowVariants(row);
            refreshOutput();
          });
        }
        syncProdRowVariants(row);
        if (size) {
          var box2 = row.querySelector(".prod-size-boxes");
          if (box2) {
            var btns2 = box2.querySelectorAll(".prod-size-btn");
            var found = false;
            for (var si = 0; si < btns2.length; si++) {
              var dt = String(btns2[si].getAttribute("data-talla") || "").trim();
              if (dt === String(size).trim()) {
                btns2[si].setAttribute("aria-pressed", "true");
                found = true;
              } else {
                btns2[si].setAttribute("aria-pressed", "false");
              }
            }
            if (!found && btns2.length) btns2[0].setAttribute("aria-pressed", "true");
          }
        }
        productsList.appendChild(row);
      }

      $("btn-borrar-todo").addEventListener("click", function () {
        clearProvinciaFields(true);
        clearLimaFields(true);
        clearAlmacenFields(true);
        clearCuentaFields(true);
        productsList.innerHTML = "";
        document.querySelectorAll(".field-msg").forEach(function(el){ el.className = "field-msg"; });
        document.querySelectorAll("input.valid, input.invalid").forEach(function(el){ el.classList.remove("valid","invalid"); });
        refreshOutput();
        showToast("🗑 Todo borrado");
      });

      function selectTabProvincia() {
        $("tab-prov").setAttribute("aria-selected", "true");
        $("tab-lima").setAttribute("aria-selected", "false");
        $("tab-almacen").setAttribute("aria-selected", "false");
        $("panel-prov").classList.add("active");
        $("panel-prov").hidden = false;
        $("panel-lima").classList.remove("active");
        $("panel-lima").hidden = true;
        $("panel-almacen").classList.remove("active");
        $("panel-almacen").hidden = true;
        refreshOutput();
      }
      function selectTabLima() {
        $("tab-lima").setAttribute("aria-selected", "true");
        $("tab-prov").setAttribute("aria-selected", "false");
        $("tab-almacen").setAttribute("aria-selected", "false");
        $("panel-lima").classList.add("active");
        $("panel-lima").hidden = false;
        $("panel-prov").classList.remove("active");
        $("panel-prov").hidden = true;
        $("panel-almacen").classList.remove("active");
        $("panel-almacen").hidden = true;
        refreshOutput();
      }
      function selectTabAlmacen() {
        $("tab-almacen").setAttribute("aria-selected", "true");
        $("tab-prov").setAttribute("aria-selected", "false");
        $("tab-lima").setAttribute("aria-selected", "false");
        $("panel-almacen").classList.add("active");
        $("panel-almacen").hidden = false;
        $("panel-prov").classList.remove("active");
        $("panel-prov").hidden = true;
        $("panel-lima").classList.remove("active");
        $("panel-lima").hidden = true;
        refreshOutput();
      }

      function updateProductosHeader() {
        var tit = $("productos-titulo");
        var hint = $("productos-hint");
        if (!tit || !hint) return;
          tit.textContent = "Productos Overshark";
          hint.innerHTML =
            "Cat\u00E1logo <strong>Overshark</strong> (polos). Producto y talla; si hay cuadros de color, cada color es una fila con cantidad.";

      }

      $("tab-prov").addEventListener("click", selectTabProvincia);
      $("tab-lima").addEventListener("click", selectTabLima);
      $("tab-almacen").addEventListener("click", selectTabAlmacen);

      initPoloCatalogs();

      $("add-product").addEventListener("click", function () { 
        var ps = $("promo-select");
        if(ps) ps.value = "";
        addProductRow("", "1", ""); 
      });

      var PROMOS_DATA = {
        "pique_5_99": [{n:"CAMISERO PIKE", q:5}],
        "wafle_cam_4_99": [{n:"WAFFLE CAMISERO", q:4}],
        "clasico_10_99": [{n:"CLASICO", q:10}],
        "wafle_6_99": [{n:"WAFFLE", q:6}],
        "ml_wafle_4_99": [{n:"WAFFLE MANGA LARGA", q:4}],
        "ml_jersey_7_99": [{n:"JERSEY MANGA LARGA", q:7}],
        "camisa_wafle_3_99": [{n:"CAMISA WAFFLE", q:3}],
        "mixtura": [{n:"CLASICO", q:2}, {n:"WAFFLE", q:2}, {n:"CAMISERO PIKE", q:2}],
        "bellaca": [{n:"CLASICO", q:3}, {n:"WAFFLE", q:1}, {n:"CAMISERO PIKE", q:1}, {n:"WAFFLE MANGA LARGA", q:1}],
        "flow": [{n:"CLASICO", q:5}, {n:"CAMISERO PIKE", q:2}],
        "salvaje": [{n:"WAFFLE CAMISERO", q:2}, {n:"CLASICO", q:4}],
        "baby_7_99": [{n:"BABY TY", q:7}],
        "baby_3_50": [{n:"BABY TY", q:3}]
      };

      var promoSelect = $("promo-select");
      if (promoSelect) {
        promoSelect.addEventListener("change", function () {
          var val = this.value;
          if (!val) return;
          var pData = PROMOS_DATA[val];
          if (pData) {
            var opt = this.options[this.selectedIndex];
            var comboName = opt ? opt.getAttribute("data-combo") : "";

            // NO limpiar productosList, simplemente añadirlos
            for (var i = 0; i < pData.length; i++) {
              addProductRow(pData[i].n, String(pData[i].q), "");
              var addedRow = productsList.lastElementChild;
              if (addedRow && comboName) {
                addedRow.setAttribute("data-promo-group", comboName);
              }
            }

            if (comboName) {
               var comboInp = $("custom-combo-name");
               if (comboInp) {
                  if (comboInp.value.trim() === "") {
                     comboInp.value = comboName;
                  } else {
                     comboInp.value = comboInp.value.trim() + " + " + comboName;
                  }
               }
            }

            refreshOutput();
            saveToDraft();
          }
          this.value = ""; // Reset para poder elegir el mismo combo u otro de nuevo
        });
      }

      var customComboName = $("custom-combo-name");
      if (customComboName) {
        customComboName.addEventListener("input", refreshOutput);
      }
      $("btn-refresh").addEventListener("click", refreshOutput);

      $("btn-push-sheet").addEventListener("click", function () {
        refreshOutput();
        pushCurrentSaleToSheet();
      });

      $("btn-copy").addEventListener("click", function () {
        refreshOutput();
        var text = output.value;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast("Copiado al portapapeles");
          }).catch(function () {
            output.select();
            document.execCommand("copy");
            showToast("Copiado (m\u00E9todo alternativo)");
          });
        } else {
          output.select();
          document.execCommand("copy");
          showToast("Copiado");
        }
      });

      var formInputs = document.querySelectorAll("#panel-prov input, #panel-lima input, #panel-almacen input");
      for (var k = 0; k < formInputs.length; k++) {
        formInputs[k].addEventListener("input", refreshOutput);
      }
      var cuentaRadios = document.querySelectorAll("#panel-cuenta input[name=\"cuenta-tipo\"]");
      for (var r = 0; r < cuentaRadios.length; r++) {
        cuentaRadios[r].addEventListener("change", refreshOutput);
      }
      var cuentaDebe = $("cuenta-debe");
      if (cuentaDebe) cuentaDebe.addEventListener("input", refreshOutput);
      var cuentaPago = $("cuenta-pago");
      if (cuentaPago) cuentaPago.addEventListener("input", refreshOutput);
    })();

/* ================================================================
   * VERIFICADOR DE COBERTURA ZAZU EXPRESS
   * Algoritmo: ray-casting (point-in-polygon).
   * La cobertura tiene: polígono exterior, 2 hoyos (hole1 trivial,
   * hole2 grande), y un polígono adicional NO COBERTURA.
   * ================================================================ */
  (function(){
    // Polígono exterior de COBERTURA ZAZU EXPRESS (602 pts)
    var OUTER = [[-77.0179373,-11.9865672],[-77.019117,-11.9865894],[-77.0195463,-11.9881846],[-77.0177008,-11.9895699],[-77.016156,-11.9896958],[-77.0154263,-11.9912491],[-77.0147827,-11.9931381],[-77.015083,-11.9959087],[-77.0167138,-11.9961185],[-77.0168427,-11.9967062],[-77.0160272,-11.9998966],[-77.0177868,-11.9975038],[-77.0182159,-11.999141],[-77.018474,-12.000255],[-77.0188179,-12.0009912],[-77.0192256,-12.0018518],[-77.0203842,-12.0037618],[-77.020792,-12.006868],[-77.017187,-12.0092817],[-77.0153847,-12.0102471],[-77.0134963,-12.0116743],[-77.0127239,-12.0125558],[-77.0128097,-12.0146126],[-77.011694,-12.0156619],[-77.0126811,-12.0162496],[-77.0137538,-12.0185582],[-77.0131959,-12.020531],[-77.0129897,-12.024767],[-77.0135905,-12.0248929],[-77.0149638,-12.0248929],[-77.0192125,-12.0253546],[-77.0193412,-12.0271175],[-77.018633,-12.0285026],[-77.0199635,-12.0292791],[-77.0206715,-12.0295519],[-77.0225599,-12.0285236],[-77.0243408,-12.0289433],[-77.0268299,-12.0304963],[-77.0272591,-12.0297618],[-77.0258857,-12.0291532],[-77.025049,-12.0280829],[-77.025049,-12.0270335],[-77.0236328,-12.0256064],[-77.0239332,-12.0245781],[-77.0239761,-12.0237806],[-77.0227101,-12.0234658],[-77.0233967,-12.0225004],[-77.0251777,-12.0225004],[-77.0269801,-12.0212516],[-77.0283533,-12.0199085],[-77.027066,-12.0192369],[-77.0268943,-12.0183134],[-77.0246626,-12.0178097],[-77.0237186,-12.0160048],[-77.0239975,-12.0147875],[-77.0246841,-12.0135703],[-77.0264437,-12.0141789],[-77.0273878,-12.0149345],[-77.0280529,-12.0148505],[-77.0283963,-12.0137801],[-77.0283319,-12.0129616],[-77.0291932,-12.0123925],[-77.0299012,-12.0118258],[-77.0303734,-12.0111752],[-77.0351583,-12.0150999],[-77.0325835,-12.0189616],[-77.0313818,-12.0211443],[-77.0325835,-12.023159],[-77.0354158,-12.021648],[-77.0379689,-12.0189426],[-77.0408011,-12.0157525],[-77.0426037,-12.0173476],[-77.0406295,-12.0189426],[-77.038913,-12.0212932],[-77.0376256,-12.0229722],[-77.0402004,-12.0251548],[-77.0413163,-12.0270856],[-77.042432,-12.0278411],[-77.0452645,-12.024819],[-77.046552,-12.0233919],[-77.0463803,-12.0209574],[-77.0467237,-12.0172636],[-77.0488694,-12.0151649],[-77.0481827,-12.0125624],[-77.0486119,-12.009876],[-77.0490411,-12.0072735],[-77.0493844,-12.0041672],[-77.0462087,-12.0019004],[-77.0420888,-11.9999695],[-77.045007,-11.9976187],[-77.0487571,-11.9978137],[-77.0511602,-11.9965963],[-77.0514177,-11.9947913],[-77.0480703,-11.993406],[-77.0436501,-11.9912651],[-77.0447229,-11.9891661],[-77.0517181,-11.9902995],[-77.054808,-11.9915169],[-77.055323,-11.9889982],[-77.0552188,-11.9876725],[-77.052043,-11.986707],[-77.0509272,-11.9863291],[-77.0507127,-11.984608],[-77.0516139,-11.9843141],[-77.0522577,-11.9834325],[-77.0521288,-11.9826769],[-77.0483308,-11.9815224],[-77.0479446,-11.9821626],[-77.0476871,-11.9828973],[-77.0463568,-11.9826874],[-77.0423015,-11.9820213],[-77.0379241,-11.9804261],[-77.0386966,-11.9778232],[-77.040971,-11.9771096],[-77.0449192,-11.9782011],[-77.0461209,-11.9720298],[-77.04964,-11.9722817],[-77.0538457,-11.973877],[-77.0573648,-11.9751365],[-77.0550472,-11.9704345],[-77.0551332,-11.9671599],[-77.0527299,-11.9622899],[-77.0517858,-11.959351],[-77.0451767,-11.9614502],[-77.0420869,-11.9611143],[-77.0394262,-11.9585113],[-77.039182,-11.9548902],[-77.0444901,-11.9536411],[-77.0466788,-11.9508282],[-77.0465162,-11.9468952],[-77.0449712,-11.9437043],[-77.0399073,-11.9437883],[-77.0322683,-11.9457196],[-77.0296934,-11.9426966],[-77.0353582,-11.9398415],[-77.0356156,-11.9360627],[-77.0389631,-11.9342152],[-77.0412805,-11.9328716],[-77.041538,-11.9295126],[-77.0367315,-11.927917],[-77.0352262,-11.9247907],[-77.0328229,-11.9223973],[-77.0326083,-11.9211796],[-77.0353549,-11.9187442],[-77.0353978,-11.9174005],[-77.0320933,-11.9165607],[-77.0294326,-11.9168966],[-77.0283382,-11.9170226],[-77.0286387,-11.9159938],[-77.0268148,-11.9163508],[-77.0258277,-11.9156369],[-77.0232258,-11.9141871],[-77.0204364,-11.9133053],[-77.0164882,-11.9138932],[-77.0152435,-11.915069],[-77.0141063,-11.914985],[-77.0122395,-11.914733],[-77.0106088,-11.9141451],[-77.0096217,-11.9139772],[-77.00945,-11.9126335],[-77.0140419,-11.9129275],[-77.0159516,-11.9128855],[-77.0165309,-11.9106179],[-77.0197497,-11.9107019],[-77.0282469,-11.9111218],[-77.0300493,-11.9113737],[-77.0316802,-11.9086863],[-77.0297919,-11.9057049],[-77.0286332,-11.9039412],[-77.0291589,-11.9029439],[-77.0300226,-11.9033586],[-77.0296417,-11.9013167],[-77.0281621,-11.8987562],[-77.0262739,-11.8968245],[-77.0262739,-11.8952287],[-77.0236989,-11.8943888],[-77.020094,-11.8948928],[-77.0184633,-11.8939689],[-77.0177765,-11.8922052],[-77.0212956,-11.8911133],[-77.0230122,-11.8897695],[-77.0230122,-11.8876697],[-77.0202656,-11.885402],[-77.0188066,-11.8835542],[-77.0168325,-11.8839742],[-77.0159741,-11.8820424],[-77.0166607,-11.8804465],[-77.0138283,-11.8778428],[-77.0109102,-11.8777588],[-77.0081635,-11.8757429],[-77.0115454,-11.873327],[-77.0131761,-11.8712271],[-77.0098288,-11.8668593],[-77.0070822,-11.8641714],[-77.0033057,-11.8606435],[-77.0000442,-11.8545956],[-76.9930061,-11.8529156],[-76.9931777,-11.8468675],[-77.0020183,-11.8457755],[-77.0076831,-11.8388871],[-77.0107729,-11.8429193],[-77.0104295,-11.8483795],[-77.0136911,-11.8516556],[-77.0196134,-11.8576196],[-77.0265657,-11.8650954],[-77.0297415,-11.8601395],[-77.0272523,-11.8551836],[-77.0244199,-11.8484635],[-77.0225317,-11.8450194],[-77.0276815,-11.8409033],[-77.0308572,-11.8434234],[-77.0307714,-11.8458595],[-77.0358355,-11.8489675],[-77.0399554,-11.8498916],[-77.0439894,-11.8470355],[-77.0409853,-11.8440954],[-77.0415861,-11.8411553],[-77.0438178,-11.836955],[-77.0439036,-11.8309066],[-77.0466502,-11.8256981],[-77.0854456,-11.8297305],[-77.0895656,-11.8309066],[-77.0911104,-11.8294784],[-77.0896085,-11.8275883],[-77.0907663,-11.8250617],[-77.0926547,-11.8238015],[-77.0972895,-11.8273299],[-77.0972036,-11.8306902],[-77.1013235,-11.8319503],[-77.1135972,-11.8310262],[-77.1252273,-11.8356885],[-77.1287623,-11.8422146],[-77.1334991,-11.8447925],[-77.138193,-11.8333416],[-77.1531006,-11.828443],[-77.1605571,-11.8280124],[-77.169387,-11.829346],[-77.1702213,-11.8315118],[-77.1681372,-11.8335097],[-77.1587334,-11.8385133],[-77.1505688,-11.845916],[-77.145655,-11.8524891],[-77.1388313,-11.8559754],[-77.141063,-11.8604692],[-77.1403764,-11.8711787],[-77.1427314,-11.8718541],[-77.1419966,-11.8789131],[-77.1350277,-11.879239],[-77.1340537,-11.8873601],[-77.1313201,-11.8887199],[-77.1293376,-11.8932922],[-77.1300588,-11.9030716],[-77.1342402,-11.9498005],[-77.1305924,-11.9766697],[-77.1300346,-11.9918664],[-77.1299273,-11.9952877],[-77.1280176,-11.9983731],[-77.1190483,-11.9996743],[-77.1023113,-12.0300644],[-77.1000798,-12.0349333],[-77.0995648,-12.038291],[-77.1050579,-12.0403056],[-77.113126,-12.0389625],[-77.1232539,-12.0374515],[-77.1284038,-12.0366121],[-77.1268588,-12.0424881],[-77.1400768,-12.0480282],[-77.1411068,-12.0508821],[-77.1435959,-12.0549111],[-77.1453983,-12.0562541],[-77.1491749,-12.0603251],[-77.1477158,-12.0617101],[-77.1483918,-12.0636931],[-77.1514655,-12.0642754],[-77.152415,-12.0633048],[-77.1613092,-12.068278],[-77.1659816,-12.0711422],[-77.1638733,-12.0742582],[-77.1612917,-12.0718281],[-77.1598259,-12.069398],[-77.1560789,-12.0663003],[-77.154035,-12.0657915],[-77.1505481,-12.0667882],[-77.1471149,-12.0674176],[-77.1444542,-12.0675855],[-77.1415359,-12.0677533],[-77.1360428,-12.0690123],[-77.1335107,-12.0691802],[-77.1301633,-12.0703553],[-77.1232969,-12.0732509],[-77.1190053,-12.0751814],[-77.1073752,-12.0807208],[-77.1021827,-12.0839521],[-77.0962603,-12.0856307],[-77.0873769,-12.0895753],[-77.0804246,-12.0932681],[-77.0723136,-12.0970028],[-77.0637304,-12.1027096],[-77.0600398,-12.1053951],[-77.0546324,-12.1090037],[-77.0505126,-12.1121088],[-77.0460494,-12.118067],[-77.0395264,-12.1230181],[-77.0352346,-12.1280531],[-77.0312864,-12.1312418],[-77.0283682,-12.1347662],[-77.0273382,-12.1382905],[-77.023905,-12.1443321],[-77.0233901,-12.1497022],[-77.0242483,-12.157086],[-77.02442,-12.1616169],[-77.0247634,-12.1644696],[-77.0268233,-12.1664833],[-77.0309431,-12.1673223],[-77.02854,-12.1696716],[-77.0257933,-12.1711818],[-77.0209868,-12.1753769],[-77.0151503,-12.1807464],[-77.0163519,-12.1832633],[-77.0162659,-12.186787],[-77.0212443,-12.1868709],[-77.0276815,-12.1928275],[-77.0265657,-12.1996228],[-77.0252784,-12.2031463],[-77.0237333,-12.204908],[-77.0208152,-12.2035657],[-77.0159227,-12.207173],[-77.0193559,-12.209438],[-77.0130045,-12.212458],[-77.00322,-12.2019718],[-76.998585,-12.1995389],[-76.9952376,-12.2018879],[-76.9829209,-12.2139261],[-76.9769128,-12.2195046],[-76.9760545,-12.2237827],[-76.9669565,-12.2216017],[-76.9618066,-12.2142197],[-76.9585451,-12.2123742],[-76.9494472,-12.2279769],[-76.9424089,-12.237875],[-76.9327958,-12.2372039],[-76.9218095,-12.2372039],[-76.91799,-12.2334712],[-76.9130549,-12.228648],[-76.9123038,-12.2273059],[-76.913763,-12.2255862],[-76.9158012,-12.2235311],[-76.9202646,-12.2119547],[-76.9270452,-12.2029785],[-76.9232686,-12.200294],[-76.9196208,-12.1977353],[-76.9218093,-12.1901427],[-76.9255859,-12.1820886],[-76.9343406,-12.1839344],[-76.9396621,-12.1810819],[-76.9364865,-12.1769708],[-76.9417221,-12.1726919],[-76.9430108,-12.1675759],[-76.9575164,-12.1526408],[-76.9648118,-12.1478581],[-76.9612479,-12.1441868],[-76.9602824,-12.1403688],[-76.9561626,-12.1386067],[-76.9540812,-12.1331524],[-76.9564844,-12.1303413],[-76.9585014,-12.1276141],[-76.9598103,-12.1289777],[-76.9598103,-12.1301315],[-76.961677,-12.1307399],[-76.9636512,-12.1289147],[-76.9650673,-12.1293973],[-76.9645953,-12.1311385],[-76.9673634,-12.1321245],[-76.9698953,-12.1350195],[-76.9738006,-12.135481],[-76.9759893,-12.1339286],[-76.9747878,-12.1307399],[-76.9724702,-12.129649],[-76.9666337,-12.1271316],[-76.9700669,-12.1234393],[-76.9743279,-12.1152206],[-76.9696071,-12.110689],[-76.9644145,-12.1061992],[-76.963642,-12.1080455],[-76.9614961,-12.1061572],[-76.9614532,-12.1038074],[-76.9634702,-12.1030521],[-76.9658735,-12.104227],[-76.9677189,-12.1029682],[-76.9680193,-12.1006603],[-76.9646718,-12.0981006],[-76.9594363,-12.0933169],[-76.9533424,-12.0923098],[-76.9522265,-12.0963382],[-76.9489649,-12.1046466],[-76.942871,-12.1134583],[-76.9379356,-12.1190809],[-76.9334295,-12.1176962],[-76.9336441,-12.1137101],[-76.9357899,-12.1102694],[-76.9399313,-12.1011429],[-76.9394163,-12.0961074],[-76.9455961,-12.0895612],[-76.9373562,-12.0862041],[-76.9267132,-12.0840219],[-76.9256834,-12.0784826],[-76.9296315,-12.075545],[-76.9346096,-12.0736146],[-76.9362834,-12.0662075],[-76.9399399,-12.0562673],[-76.9373649,-12.0498879],[-76.935305,-12.0443479],[-76.925177,-12.0419975],[-76.9214863,-12.0390595],[-76.9159931,-12.0375486],[-76.9230312,-12.0290702],[-76.8992132,-12.0281047],[-76.892261,-12.0263419],[-76.8863708,-12.025471],[-76.8857002,-12.0223912],[-76.8812531,-12.021494],[-76.8746978,-12.0209063],[-76.8762964,-12.0167089],[-76.8763501,-12.013099],[-76.8780345,-12.01142],[-76.891789,-12.0132879],[-76.8959946,-12.0148829],[-76.8996853,-12.013036],[-76.9012302,-12.0111891],[-76.9073242,-12.0132039],[-76.9113583,-12.0136237],[-76.9206279,-12.0144632],[-76.9230742,-12.0119866],[-76.9268077,-12.0076211],[-76.9335026,-12.0099718],[-76.9441455,-12.0131619],[-76.9483513,-12.0140015],[-76.9492097,-12.0173595],[-76.9537587,-12.0178632],[-76.9566769,-12.0175693],[-76.9588226,-12.016394],[-76.9599385,-12.0143792],[-76.958372,-12.0110212],[-76.9599814,-12.0102027],[-76.9620197,-12.0099298],[-76.9650668,-12.0121545],[-76.9672984,-12.0142953],[-76.9678992,-12.0159743],[-76.9681995,-12.0168558],[-76.9697874,-12.0172335],[-76.9741649,-12.0186187],[-76.9750659,-12.0199199],[-76.97483,-12.0210322],[-76.9756454,-12.0218927],[-76.9785206,-12.0229211],[-76.9798082,-12.0236136],[-76.9812674,-12.0233198],[-76.9822113,-12.0225223],[-76.9843572,-12.0222705],[-76.9849152,-12.0212211],[-76.9831556,-12.0204656],[-76.9817822,-12.0185767],[-76.9788211,-12.0137496],[-76.9756884,-12.0098878],[-76.9769972,-12.0085656],[-76.9799155,-12.0087335],[-76.9810742,-12.0091952],[-76.9821898,-12.0083137],[-76.9830483,-12.0081878],[-76.9841211,-12.0090273],[-76.9841211,-12.0102866],[-76.9843357,-12.0114619],[-76.9867391,-12.0136447],[-76.9882196,-12.0149039],[-76.9890779,-12.0158274],[-76.9901079,-12.0148619],[-76.9897646,-12.0139385],[-76.9905371,-12.0129731],[-76.9921248,-12.0121755],[-76.9949573,-12.0110002],[-76.9940132,-12.0091113],[-76.9900865,-12.0080829],[-76.987297,-12.0077051],[-76.9882626,-12.0057112],[-76.9894021,-12.0040162],[-76.9899374,-12.0031814],[-76.9913106,-12.0032654],[-76.9922547,-12.0025098],[-76.9929092,-12.002961],[-76.9933598,-12.0017017],[-76.9959038,-12.0003164],[-76.9964617,-11.9988891],[-76.9983122,-11.9936116],[-76.998398,-11.9899175],[-76.9959947,-11.9877345],[-76.9927331,-11.984628],[-76.9899007,-11.9810178],[-76.9878408,-11.9802621],[-76.9826909,-11.982529],[-76.9813177,-11.978331],[-76.9850943,-11.9757282],[-76.9860382,-11.9713621],[-76.9844935,-11.9678356],[-76.9790002,-11.9654845],[-76.9759284,-11.965806],[-76.9738685,-11.9642946],[-76.9765292,-11.9620275],[-76.9777738,-11.9603901],[-76.975275,-11.9566552],[-76.9793092,-11.9543881],[-76.9748458,-11.9486781],[-76.9701253,-11.943052],[-76.9634305,-11.9342347],[-76.9568216,-11.9380136],[-76.9531738,-11.9403229],[-76.9520151,-11.9380976],[-76.9599545,-11.933395],[-76.9542468,-11.9246194],[-76.9616281,-11.9198326],[-76.9648467,-11.9237796],[-76.9688808,-11.9300779],[-76.9707261,-11.933227],[-76.9726788,-11.9351794],[-76.9745242,-11.933458],[-76.976584,-11.9316945],[-76.9795882,-11.9328701],[-76.9817338,-11.9342977],[-76.9843947,-11.9323663],[-76.9858536,-11.929679],[-76.9873129,-11.9268238],[-76.9905745,-11.9268238],[-76.9916903,-11.9266138],[-76.992291,-11.926089],[-76.9923983,-11.9251022],[-76.9933853,-11.9252072],[-76.9934712,-11.9266138],[-76.9937716,-11.9287553],[-76.990553,-11.9310017],[-76.989444,-11.9320331],[-76.9884141,-11.932096],[-76.9887359,-11.9352661],[-76.9888217,-11.9372815],[-76.9898303,-11.9364628],[-76.9900234,-11.935644],[-76.9909247,-11.9351192],[-76.9915041,-11.9362528],[-76.9925339,-11.9373235],[-77.0013747,-11.9379743],[-77.0025011,-11.9389925],[-77.0024259,-11.9401996],[-77.001793,-11.94211],[-76.9949374,-11.9418581],[-76.9933923,-11.9433486],[-76.9931349,-11.9458677],[-76.9879421,-11.9474842],[-76.9881781,-11.948051],[-76.9885429,-11.9483659],[-76.988779,-11.9490797],[-76.9889935,-11.9490797],[-76.9892081,-11.9495415],[-76.9904312,-11.9496675],[-76.9933922,-11.9483659],[-76.99704,-11.9500034],[-76.9981988,-11.9517247],[-76.9971688,-11.953782],[-76.9981559,-11.9546637],[-77.0003203,-11.9531506],[-77.0021228,-11.9503796],[-77.0052985,-11.9504635],[-77.0065858,-11.9528987],[-77.0039252,-11.9544101],[-77.0045688,-11.9555017],[-77.0083882,-11.9549979],[-77.0096327,-11.9577269],[-77.0078304,-11.9594482],[-77.0067146,-11.9606237],[-77.0082165,-11.9627229],[-77.0092467,-11.9619672],[-77.010491,-11.9620722],[-77.0115854,-11.9633317],[-77.0127014,-11.9659766],[-77.0126585,-11.9667113],[-77.0117785,-11.9680547],[-77.0108344,-11.9681807],[-77.0108559,-11.9689993],[-77.0098902,-11.9694612],[-77.008796,-11.9703638],[-77.0067146,-11.9719801],[-77.0075301,-11.9736384],[-77.008796,-11.9728617],[-77.0083882,-11.972232],[-77.0108988,-11.9710775],[-77.0128515,-11.9740792],[-77.0136239,-11.9750028],[-77.016199,-11.9746249],[-77.0184305,-11.9732815],[-77.0194174,-11.9731975],[-77.0199325,-11.9746669],[-77.0209195,-11.9758844],[-77.019117,-11.9776476],[-77.0179584,-11.9847003],[-77.0179373,-11.9865672]];
    // Agujero interior grande (zona excluida) (66 pts)
    var HOLE2 = [[-77.1144922,-11.8670322],[-77.1141012,-11.8672628],[-77.1136387,-11.8687903],[-77.113262,-11.8699399],[-77.1230561,-11.8754573],[-77.1262343,-11.8763431],[-77.1261508,-11.8796647],[-77.1260126,-11.8853256],[-77.1226986,-11.885821],[-77.1199043,-11.8872551],[-77.116638,-11.8878072],[-77.1143373,-11.8893882],[-77.1094616,-11.8896254],[-77.108606,-11.8904436],[-77.1097246,-11.8919336],[-77.1094269,-11.8939486],[-77.1111034,-11.8945358],[-77.1130401,-11.8937574],[-77.114376,-11.8924331],[-77.1261569,-11.8871779],[-77.127789,-11.9032923],[-77.1289188,-11.9495486],[-77.1217516,-11.9698687],[-77.1177927,-11.9779501],[-77.1097137,-11.9877945],[-77.0918401,-11.9709603],[-77.1033413,-11.9637392],[-77.0918401,-11.9585334],[-77.0876344,-11.9517319],[-77.0880635,-11.9453501],[-77.0850593,-11.9414454],[-77.0797378,-11.9284292],[-77.0817119,-11.9242303],[-77.0799095,-11.9203673],[-77.0784505,-11.9160003],[-77.0768197,-11.9136488],[-77.0745022,-11.9095337],[-77.0691807,-11.9118852],[-77.0710046,-11.9178059],[-77.0708329,-11.9235165],[-77.069288,-11.9285132],[-77.0655543,-11.9260778],[-77.0575293,-11.912683],[-77.0539245,-11.9053765],[-77.0576152,-11.9032769],[-77.068773,-11.9053765],[-77.067743,-11.9001694],[-77.0678289,-11.8923586],[-77.0736654,-11.8905948],[-77.0734079,-11.8870673],[-77.0747811,-11.8778282],[-77.0729787,-11.8693448],[-77.1028479,-11.8446489],[-77.1055944,-11.8428848],[-77.1064742,-11.8412573],[-77.1085556,-11.8412259],[-77.1093709,-11.8398189],[-77.1136195,-11.841772],[-77.1187265,-11.8477572],[-77.1199019,-11.8516838],[-77.1214634,-11.8578154],[-77.1247155,-11.8614894],[-77.1257408,-11.8705395],[-77.1180995,-11.8681979],[-77.1161671,-11.8672791],[-77.1144922,-11.8670322]];
    // Polígono "NO COBERTURA" (zona excluida adicional) (20 pts)
    var NO_COB = [[-76.996878,-12.0459259],[-76.9991848,-12.0466031],[-77.0009767,-12.0493789],[-77.0027364,-12.0512942],[-77.0038524,-12.0533774],[-77.0051504,-12.0561476],[-77.0082671,-12.0590436],[-77.0121991,-12.0609323],[-77.0093935,-12.0649089],[-77.0033049,-12.0702072],[-76.9980743,-12.0676894],[-76.9982512,-12.0638287],[-76.9909973,-12.058079],[-76.9826702,-12.0606388],[-76.981447,-12.0570708],[-76.9823695,-12.0521597],[-76.9861892,-12.047206],[-76.9898596,-12.0446458],[-76.9949032,-12.0444358],[-76.996878,-12.0459259]];

    /* Ray-casting: devuelve true si (px,py) está dentro de poly */
    function pip(px, py, poly) {
      var inside = false, n = poly.length, j = n - 1;
      for (var i = 0; i < n; i++) {
        var xi = poly[i][0], yi = poly[i][1];
        var xj = poly[j][0], yj = poly[j][1];
        if (((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
        j = i;
      }
      return inside;
    }

    /* Verifica cobertura: 0=dentro, 1=fuera_exterior, 2=fuera_hole, 3=fuera_no_cob */
    function checkCob(lon, lat) {
      if (!pip(lon, lat, OUTER)) return 1;
      if (pip(lon, lat, HOLE2))  return 2;
      if (pip(lon, lat, NO_COB)) return 3;
      return 0;
    }

    /* Parsea coordenadas de texto libre / URL de Google Maps.
     * Soporta:
     *  • "lat, lon" o "lon, lat" (detecta cuál es cuál por rango)
     *  • Google Maps URLs con @lat,lon,zoom o ?q=lat,lon o ll=lat,lon
     *  • Coordenadas separadas por espacios o comas
     */
    function parseCoords(text) {
      var t = (text || '').trim();
      if (!t) return null;

      // Google Maps URL con @lat,lon
      var m = t.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

      // ?q=lat,lon o ?q=lat+lon
      m = t.match(/[?&]q=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

      // ll=lat,lon
      m = t.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

      // place/ o destination=lat,lon
      m = t.match(/destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

      // Coordenadas sueltas: dos números con punto decimal separados por coma/espacio
      m = t.match(/(-?\d{1,3}\.\d{4,})\s*[, ]\s*(-?\d{1,3}\.\d{4,})/);
      if (m) {
        var a = parseFloat(m[1]), b = parseFloat(m[2]);
        // En Perú: lat ~ -18 a -0, lon ~ -82 a -68
        // Si 'a' está en rango lat → (lat, lon)
        // Si 'a' está en rango lon → (lon, lat)
        if (a >= -82 && a <= -68) return { lon: a, lat: b };
        if (b >= -82 && b <= -68) return { lon: b, lat: a };
        return { lat: a, lon: b }; // fallback
      }

      return null;
    }

    var MSGS = [
      { icon:'✅', cls:'dentro',     msg:'Dentro de cobertura ZAZU',        sub:'La ubicación está en la zona de delivery.' },
      { icon:'🚫', cls:'fuera',      msg:'Fuera de cobertura ZAZU',         sub:'La ubicación está fuera del área de cobertura.' },
      { icon:'🚫', cls:'fuera',      msg:'Fuera de cobertura ZAZU',         sub:'Zona excluida del servicio de delivery.' },
      { icon:'🚫', cls:'fuera',      msg:'Zona sin cobertura ZAZU',         sub:'Esta zona está marcada como sin cobertura.' }
    ];

    function updateBadge(badgeEl, text) {
      if (!badgeEl) return;
      var coords = parseCoords(text);
      if (!coords) {
        badgeEl.className = 'cob-badge';
        return;
      }
      var result = checkCob(coords.lon, coords.lat);
      var info = MSGS[result];
      badgeEl.className = 'cob-badge visible ' + info.cls;
      badgeEl.querySelector('.cob-badge-icon').textContent = info.icon;
      badgeEl.querySelector('.cob-badge-msg').textContent  = info.msg;
      badgeEl.querySelector('.cob-badge-sub').textContent  = info.sub +
        ' (' + coords.lat.toFixed(5) + ', ' + coords.lon.toFixed(5) + ')';
    }

    function init() {
      var pairs = [
        { inputId: 'l-ubicacion',  badgeId: 'l-cob-badge'  },
      ];
      pairs.forEach(function(p) {
        var inp   = document.getElementById(p.inputId);
        var badge = document.getElementById(p.badgeId);
        if (!inp || !badge) return;
        var timer;
        inp.addEventListener('input', function() {
          clearTimeout(timer);
          timer = setTimeout(function() { updateBadge(badge, inp.value); }, 400);
        });
        inp.addEventListener('paste', function() {
          clearTimeout(timer);
          timer = setTimeout(function() { updateBadge(badge, inp.value); }, 300);
        });
        // Al perder foco también verificar
        inp.addEventListener('blur', function() {
          clearTimeout(timer);
          updateBadge(badge, inp.value);
        });
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  })();

/* ── Validación de DNI y Celular ─────────────────────────────────────── */
  (function(){
    /* Reglas de validación */
    function validateCelular(v){
      var d = v.replace(/[\s\-\(\)\.]/g,"");
      if(!d) return null;
      if(!/^\d+$/.test(d))          return {cls:"error", msg:"Solo debe contener números"};
      if(d[0]!=="9")                return {cls:"error", msg:"Debe empezar en 9 (ej. 987 654 321)"};
      if(d.length<9)                return {cls:"warn",  msg:"Faltan "+ (9-d.length)+" dígito"+(9-d.length>1?"s":"")};
      if(d.length>9)                return {cls:"error", msg:"Demasiados dígitos — debe tener exactamente 9"};
      return {cls:"ok", msg:"✓ Celular válido"};
    }
    function validateDNI(v){
      var d = v.replace(/\s/g,"");
      if(!d) return null;
      if(!/^\d+$/.test(d))    return {cls:"error", msg:"Solo debe contener números"};
      if(d.length<8)          return {cls:"warn",  msg:"Faltan "+ (8-d.length)+" dígito"+(8-d.length>1?"s":"")};
      if(d.length>8)          return {cls:"error", msg:"El DNI tiene exactamente 8 dígitos"};
      return {cls:"ok", msg:"✓ DNI válido"};
    }

    function attachValidation(inputId, msgId, fn){
      var inp = document.getElementById(inputId);
      var msg = document.getElementById(msgId);
      if(!inp||!msg) return;
      function check(){
        var result = fn(inp.value.trim());
        inp.classList.remove("valid","invalid");
        msg.className = "field-msg";
        if(!result){ msg.style.display="none"; return; }
        msg.className = "field-msg " + result.cls;
        msg.textContent = result.msg;
        inp.classList.add(result.cls==="ok"?"valid":"invalid");
      }
      inp.addEventListener("input", check);
      inp.addEventListener("blur",  check);
    }

    /* Todos los pares DNI / celular */
    var pairs = [
      ["p-celular","p-celular-msg",validateCelular],
      ["p-dni",    "p-dni-msg",    validateDNI],
      ["l-celular","l-celular-msg",validateCelular],
      ["l-dni",    "l-dni-msg",    validateDNI],
      ["a-celular","a-celular-msg",validateCelular],
      ["a-dni",    "a-dni-msg",    validateDNI],
    ];

    function init(){
      pairs.forEach(function(p){ attachValidation(p[0],p[1],p[2]); });
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
  })();

  /* ── Autocomplete de los 43 distritos de Lima Metropolitana ─────────── */
  (function(){
    var DISTRITOS = [
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
    ].sort(function(a,b){ return a.localeCompare(b,"es"); });

    function _n(s){
      return String(s||"").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
    }
    function _esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
    function _hi(txt,q){
      return _esc(txt).replace(new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>");
    }

    function installDistrito(inputId, dropId){
      var inp  = document.getElementById(inputId);
      var drop = document.getElementById(dropId);
      if(!inp||!drop) return;

      var matches=[], kbIdx=-1;

      function render(list, q){
        matches=list; kbIdx=-1;
        if(!list.length){ drop.classList.remove("open"); return; }
        var nq=_n(q);
        drop.innerHTML = list.map(function(d,i){
          return '<div class="dist-opt" data-i="'+i+'">'+_hi(d,nq)+'</div>';
        }).join("");
        drop.classList.add("open");
      }

      function pick(idx){
        if(idx<0||idx>=matches.length) return;
        inp.value = matches[idx];
        inp.dispatchEvent(new Event("input",{bubbles:true}));
        inp.classList.remove("invalid"); inp.classList.add("valid");
        drop.classList.remove("open");
        kbIdx=-1;
      }

      function updateKb(){
        drop.querySelectorAll(".dist-opt").forEach(function(el,i){
          el.classList.toggle("kbfocus",i===kbIdx);
          if(i===kbIdx) el.scrollIntoView({block:"nearest"});
        });
      }

      var timer;
      inp.addEventListener("input",function(){
        clearTimeout(timer);
        var q=inp.value.trim();
        inp.classList.remove("valid","invalid");
        var msgEl=document.getElementById(inputId.replace("distrito","distrito-msg"));
        if(msgEl){ msgEl.className="field-msg"; }
        if(!q){ drop.classList.remove("open"); return; }
        var nq=_n(q);
        timer=setTimeout(function(){
          var res=DISTRITOS.filter(function(d){ return _n(d).indexOf(nq)>=0; });
          render(res,q);
          /* Validar si coincide exacto */
          var exacto=DISTRITOS.some(function(d){ return _n(d)===nq; });
          if(exacto){ inp.classList.add("valid"); }
        },120);
      });

      inp.addEventListener("keydown",function(e){
        if(!drop.classList.contains("open")) return;
        if(e.key==="ArrowDown"){e.preventDefault();kbIdx=Math.min(matches.length-1,kbIdx+1);updateKb();}
        else if(e.key==="ArrowUp"){e.preventDefault();kbIdx=Math.max(-1,kbIdx-1);updateKb();}
        else if(e.key==="Enter"&&kbIdx>=0){e.preventDefault();pick(kbIdx);}
        else if(e.key==="Escape") drop.classList.remove("open");
      });

      drop.addEventListener("click",function(e){
        var opt=e.target.closest(".dist-opt");
        if(opt) pick(parseInt(opt.getAttribute("data-i"),10));
      });

      inp.addEventListener("blur",function(){
        setTimeout(function(){
          if(!drop.matches(":hover")) drop.classList.remove("open");
        },150);
      });

      document.addEventListener("click",function(e){
        if(!inp.contains(e.target)&&!drop.contains(e.target)) drop.classList.remove("open");
      });
    }
    function init(){
      installDistrito("l-distrito",  "l-distrito-drop");

      var btnDetect = document.getElementById("btn-detect-ip");
      if(btnDetect){
        btnDetect.addEventListener("click", function(){
          var inp = document.getElementById("l-distrito");
          var originalBtnHtml = btnDetect.innerHTML;
          btnDetect.innerHTML = '<span style="font-size:12px">⏳</span>';
          btnDetect.disabled = true;

          function finish(q){
            if(q){
              var nq = _n(q);
              var best = DISTRITOS.find(function(d){ return _n(d) === nq || _n(d).indexOf(nq) >= 0; });
              inp.value = best || q;
              inp.dispatchEvent(new Event("input", {bubbles: true}));
            }
            btnDetect.innerHTML = originalBtnHtml;
            btnDetect.disabled = false;
          }

          function fallbackIP(){
            fetch('https://get.geojs.io/v1/ip/geo.json')
              .then(function(res){ return res.json(); })
              .then(function(data){
                finish(data.city || data.region);
              })
              .catch(function(err){
                console.error("Error al obtener IP geo", err);
                finish();
              });
          }

          if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(pos){
              var lat = pos.coords.latitude;
              var lon = pos.coords.longitude;
              fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon)
                .then(function(res){ return res.json(); })
                .then(function(data){
                  if(data && data.address){
                    var dist = data.address.suburb || data.address.city_district || data.address.village || data.address.town || data.address.city;
                    finish(dist);
                  } else {
                    fallbackIP();
                  }
                })
                .catch(function(){ fallbackIP(); });
            }, function(){
              fallbackIP();
            }, {timeout: 6000});
          } else {
            fallbackIP();
          }
        });
      }
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
  })();