/* ============================================================
   CXOrbia · Core configuration (white-label + navigation)
   Everything tenant-specific lives here. Re-theme and re-label
   the whole product without touching module code.
   ============================================================ */
window.CX = window.CX || {};

/* ---------- Brand / white-label ---------- */
CX.BRAND = {
  name: 'CXOrbia',
  tagline: 'Field Operations Platform',
  // "Plataforma desarrollada para <client>" en el login. Vacío = marca propia.
  clientName: '',
  logoText: 'CX',     // fallback cuando no hay imagen de logo
  logoUrl: '',        // data-URL o ruta de imagen del cliente
  theme: 'cxorbia',   // id de CX.THEMES
  demoMode: true,
  showAITag: true,
  // colors se sincroniza desde el tema activo (no editar a mano)
  colors: {},
};

/* ---------- Temas (plantillas de marca seleccionables) ----------
   Cada cliente puede partir de una plantilla y ajustarla. La de T&A
   reproduce exactamente la plataforma actual (Segoe UI, azul/rojo, sidebar claro). */
CX.THEMES = {
  cxorbia: {
    label: 'CXOrbia (oscuro)', font: "'Manrope', system-ui, sans-serif", railStyle:'dark',
    colors:{ brand:'#2196d3', brandDark:'#1565a8', brandMid:'#4ab4e6', brandLight:'#e8f4fd',
             navy:'#0d2740', navy2:'#123553', accent:'#c8232c' },
  },
  tya: {
    label: 'T&A Consultores (corporativo)', font: "'Segoe UI', Tahoma, system-ui, sans-serif", railStyle:'light',
    colors:{ brand:'#2196d3', brandDark:'#1565a8', brandMid:'#4ab4e6', brandLight:'#e8f4fd',
             navy:'#ffffff', navy2:'#fafbfd', accent:'#c8232c' },
  },
  esmeralda: {
    label: 'Esmeralda (banca)', font: "'Manrope', system-ui, sans-serif", railStyle:'dark',
    colors:{ brand:'#0e9c6e', brandDark:'#0a7050', brandMid:'#3fbf93', brandLight:'#e2f7ef',
             navy:'#0c2a22', navy2:'#123a30', accent:'#d97706' },
  },
  violeta: {
    label: 'Violeta (retail/food)', font: "'Manrope', system-ui, sans-serif", railStyle:'dark',
    colors:{ brand:'#7c3aed', brandDark:'#5b21b6', brandMid:'#a78bfa', brandLight:'#f3eeff',
             navy:'#1e1530', navy2:'#2a1f42', accent:'#ec4899' },
  },
};

/* Aplica un tema completo (colores + tipografía + estilo de sidebar) */
CX.applyTheme = function(id){
  const t = CX.THEMES[id] || CX.THEMES.cxorbia;
  CX.BRAND.theme = id; CX.BRAND.colors = Object.assign({}, t.colors);
  const r = document.documentElement.style, c = t.colors;
  r.setProperty('--brand', c.brand);
  r.setProperty('--brand-dark', c.brandDark);
  r.setProperty('--brand-mid', c.brandMid);
  r.setProperty('--brand-light', c.brandLight);
  r.setProperty('--navy', c.navy);
  r.setProperty('--navy-2', c.navy2);
  r.setProperty('--ui', t.font);
  r.setProperty('--disp', t.font);
  document.documentElement.setAttribute('data-rail', t.railStyle);
  try{ localStorage.setItem('cx_theme', id); }catch(e){}
};

/* Compat: applyBrand reaplica el tema activo */
CX.applyBrand = function(){
  let id = CX.BRAND.theme;
  try{ const saved = localStorage.getItem('cx_theme'); if(saved && CX.THEMES[saved]) id = saved; }catch(e){}
  CX.applyTheme(id);
  try{ const ten = JSON.parse(localStorage.getItem('cx_tenant')||'null'); if(ten){ Object.assign(CX.BRAND, ten); CX.applyTheme(CX.BRAND.theme); } }catch(e){}
};

/* ---------- Módulos activos por tenant (nunca se eliminan, solo se ocultan) ---------- */
CX.tenantModules = function(){
  try{ const s = JSON.parse(localStorage.getItem('cx_modules')||'null'); if(s) return s; }catch(e){}
  return null; // null = todos activos
};
CX.moduleEnabled = function(id){
  const s = CX.tenantModules(); return !s || s[id] !== false;
};
CX.setModuleEnabled = function(id, on){
  const s = CX.tenantModules() || {}; s[id] = on;
  try{ localStorage.setItem('cx_modules', JSON.stringify(s)); }catch(e){}
};

/* ---------- Module registry metadata ----------
   status: 'ready'  -> fully built
           'beta'   -> functional, being deepened
           'soon'   -> scaffold placeholder
   The render fn is attached by each file in /app/modules via CX.module(id, fn).
*/
CX.MODULES = {
  // Operación (admin + shopper)
  midia:         { icon:'☀️', label:'Mi Día',              roles:['admin','shopper'], status:'ready' },
  dashboard:     { icon:'📊', label:'Dashboard Operativo',  roles:['admin'],           status:'ready' },
  proyectos:     { icon:'🗂️', label:'Proyectos',            roles:['admin'],           status:'ready' },
  visitas:       { icon:'📋', label:'Visitas Disponibles',  roles:['admin','shopper'], status:'ready' },
  postulaciones: { icon:'📩', label:'Postulaciones',        roles:['admin'], badge:true, status:'ready' },
  misvisitas:    { icon:'🧭', label:'Mis Visitas',          roles:['shopper'],         status:'ready' },
  shoppers:      { icon:'👥', label:'Shoppers',             roles:['admin'],           status:'ready' },
  miperfil:      { icon:'👤', label:'Mi Perfil',            roles:['shopper'],         status:'ready' },
  rutas:         { icon:'🗺️', label:'Hojas de Ruta',        roles:['admin'],           status:'ready' },
  documentos:    { icon:'📎', label:'Documentos',           roles:['admin','shopper'], status:'ready' },
  aprendizaje:   { icon:'📚', label:'Aprendizaje',          roles:['admin','shopper'], status:'ready' },
  cert:          { icon:'🏆', label:'Certificación',        roles:['admin','shopper'], status:'ready' },
  tablon:        { icon:'📢', label:'Tablón / Novedades',   roles:['admin','shopper'], badgeNotif:true, status:'ready' },
  soporte:       { icon:'🤖', label:'Soporte IA',           roles:['admin','shopper'], status:'ready' },
  informes:      { icon:'📑', label:'Reportes & KPIs',      roles:['admin'],           status:'ready' },
  // Finanzas (admin)
  financiero:    { icon:'💹', label:'Dashboard Financiero', roles:['admin'],           status:'ready' },
  movimientos:   { icon:'🧾', label:'Movimientos',          roles:['admin'],           status:'ready' },
  liquidaciones: { icon:'💸', label:'Liquidaciones',        roles:['admin'],           status:'ready' },
  lotes:         { icon:'📦', label:'Lotes de Pago',        roles:['admin'],           status:'ready' },
  beneficios:    { icon:'💰', label:'Mis Beneficios',       roles:['shopper'],         status:'ready' },
  // Configuración (admin)
  cuestionarios: { icon:'🧩', label:'Cuestionarios',        roles:['admin'],           status:'ready' },
  usuarios:      { icon:'🔐', label:'Usuarios & Permisos',  roles:['admin'],           status:'ready' },
  config:        { icon:'⚙️', label:'Configuración',         roles:['admin'],           status:'ready' },
};

/* ---------- Navigation layout per role ---------- */
CX.NAV = {
  admin: [
    { sec:'Operación', items:['midia','dashboard','proyectos','visitas','postulaciones','shoppers','rutas','documentos','aprendizaje','cert','tablon','soporte','informes'] },
    { sec:'Finanzas',  items:['financiero','movimientos','liquidaciones','lotes'] },
    { sec:'Configuración', items:['cuestionarios','usuarios','config'] },
  ],
  shopper: [
    { sec:'Operación', items:['midia','miperfil','visitas','misvisitas','documentos','aprendizaje','cert','tablon','soporte'] },
    { sec:'Mis Beneficios', items:['beneficios'] },
  ],
};

/* ---------- Catálogo de países + moneda (lista larga, no limitar) ---------- */
CX.COUNTRIES = [
  {c:'GT',n:'Guatemala',cur:'Q'},   {c:'HN',n:'Honduras',cur:'L'},
  {c:'SV',n:'El Salvador',cur:'$'}, {c:'NI',n:'Nicaragua',cur:'C$'},
  {c:'CR',n:'Costa Rica',cur:'₡'},  {c:'PA',n:'Panamá',cur:'B/.'},
  {c:'MX',n:'México',cur:'$'},      {c:'CO',n:'Colombia',cur:'$'},
  {c:'PE',n:'Perú',cur:'S/'},       {c:'EC',n:'Ecuador',cur:'$'},
  {c:'CL',n:'Chile',cur:'$'},       {c:'AR',n:'Argentina',cur:'$'},
  {c:'DO',n:'Rep. Dominicana',cur:'RD$'}, {c:'US',n:'Estados Unidos',cur:'US$'},
  {c:'ES',n:'España',cur:'€'},
];
/* etiqueta de país genérica (bandera emoji desde el código ISO + nombre) — funciona para cualquier país */
CX.paisName = function(c){ const f=CX.COUNTRIES.find(x=>x.c===c); return f?f.n:c; };
CX.paisFlag = function(c){ if(!c||c.length!==2) return '🏳️'; try{return String.fromCodePoint(...[...c.toUpperCase()].map(ch=>0x1F1E6+ch.charCodeAt(0)-65));}catch(e){return '🏳️';} };
CX.paisLabel = function(c){ return CX.paisFlag(c)+' '+CX.paisName(c); };
CX.moneda = function(p,c){ return (p.currency&&p.currency[c]) || (CX.COUNTRIES.find(x=>x.c===c)||{}).cur || '$'; };

/* ---------- Roles (for Usuarios module) ---------- */
CX.ROLES = [
  { id:'super',  label:'Super Admin',     desc:'Acceso total a toda la plataforma' },
  { id:'admin',  label:'Equipo administrativo', desc:'Operación + finanzas' },
  { id:'ops',    label:'Equipo operativo', desc:'Solo operación' },
  { id:'shopper',label:'Shopper / Evaluador', desc:'Portal móvil' },
];

/* ---------- Firebase (optional) ----------
   Leave blank to run fully on local mock data. Fill keys to connect
   a real backend; the data layer auto-detects and switches.
*/
CX.FIREBASE = {
  apiKey: '', authDomain: '', databaseURL: '', projectId: '', storageBucket: '', appId: ''
};
