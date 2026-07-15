/* ============================================================
   CXOrbia · Mock data layer (multi-project, IA-adaptive)
   GENÉRICO: sin marcas, proyectos ni personas reales.
   Proyectos, sucursales y evaluadores de ejemplo, pensados para
   que el cliente vea el ALCANCE de cada funcionalidad.
   Al cambiar de proyecto, todos los getters re-derivan de él.
   ============================================================ */
window.CX = window.CX || {};

function _rng(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=s*16807%2147483647)/2147483647;}
function _pick(r,arr){return arr[Math.floor(r()*arr.length)];}
function _pad(n){return String(n).padStart(2,'0');}

const GT_CITIES = ['Guatemala','Villa Nueva','Mixco','Quetzaltenango','Mazatenango','Jutiapa','Escuintla','Cobán'];
const HN_CITIES = ['Tegucigalpa','San Pedro Sula','La Ceiba','Choloma','Comayagua'];

/* ---------- Proyectos genéricos (rubros distintos → la IA adapta) ---------- */
const _TENANT_ID = (window.CX && CX.BRAND && CX.BRAND.id) || 'tenant-demo';
/* P0-1 (corrección 20260714): 'ronda' (etiqueta corta del periodo, ej. "JUN 26") estaba fija en
   "JUN 26" — se deriva ahora del mes/año reales del sistema, para no mostrar una ronda de un mes
   que ya pasó. */
function _rondaActual(){ const d=new Date(); const MES=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']; return MES[d.getMonth()]+' '+String(d.getFullYear()).slice(2); }
const PROJECTS = [
  {
    id:'retail', tenantId:_TENANT_ID, name:'Proyecto Retail', client:'Cliente Retail (demo)', industry:'Retail · Cadena de tiendas',
    countries:['GT','HN'], currency:{GT:'Q',HN:'L'}, accent:'#2196d3',
    sucursales:24, honorario:{GT:60,HN:200}, honRecibe:{GT:170,HN:520}, modelo:'directo', isr:5, regalias:10, boleto:{GT:33,HN:127}, combo:'Reembolso de compra', comboAmt:{GT:121,HN:291},
    scenarios:['Compra estándar','Fin de semana','Cliente incógnito'],
    quincenas:['Quincena 1','Quincena 2'], nVisitas:44,
    canales:['App móvil','Tienda física','Teléfono'], formato:'Compra incógnita', ronda:_rondaActual(),
    restriccion:'No haber visitado esta sucursal en los últimos 2 meses.',
    cuestionario:{modo:'externa', url:'https://forms.example.com/retail', label:'Formulario web del cliente'},
    pago:{logica:'Pago 30 días después de submitir el cuestionario.', diasPago:30, moneda:'local'},
    hrMap:{fuente:'Google Sheets', cols:['Sucursal','Ciudad','País','Quincena','Escenario','Franja','Honorario']},
    geoloc:true,
    conocimiento:'Cadena de retail. Se evalúa atención, tiempos, limpieza y proceso de compra.',
  },
  {
    id:'banca', tenantId:_TENANT_ID, name:'Proyecto Banca', client:'Cliente Banca (demo)', industry:'Banca · Red de agencias',
    countries:['GT','HN'], currency:{GT:'Q',HN:'L'}, accent:'#0e9c6e',
    sucursales:18, honorario:{GT:90,HN:240}, honRecibe:{GT:230,HN:600}, modelo:'directo', isr:5, regalias:0, boleto:{GT:0,HN:0}, combo:null, comboAmt:{GT:0,HN:0},
    scenarios:['Apertura de cuenta','Solicitud de préstamo','Atención telefónica'],
    quincenas:['Quincena 1','Quincena 2'], nVisitas:30,
    canales:['Agencia','Teléfono','App'], formato:'Cliente incógnito', ronda:_rondaActual(),
    restriccion:'No haber sido atendido por el mismo asesor en 90 días.',
    cuestionario:{modo:'interna', url:'', label:'Cuestionario dentro de la plataforma'},
    pago:{logica:'Pago al cierre de quincena validada.', diasPago:15, moneda:'local'},
    hrMap:{fuente:'Excel importado', cols:['Agencia','Ciudad','País','Asesor','Escenario']},
    geoloc:false,
    conocimiento:'Banca. Se evalúa asesoría, tiempos de espera y cumplimiento de protocolo.',
  },
  {
    id:'food', tenantId:_TENANT_ID, name:'Proyecto Restaurantes', client:'Cliente Restaurantes (demo)', industry:'Restaurantes · Multimarca',
    countries:['GT'], currency:{GT:'Q'}, accent:'#7c3aed',
    sucursales:30, honorario:{GT:75}, honRecibe:{GT:190}, modelo:'delegado', isr:0, regalias:0, boleto:{GT:0}, combo:'Combo + bebida', comboAmt:{GT:90},
    scenarios:['Almuerzo','Cena fin de semana','Drive-thru'],
    quincenas:['Quincena 1','Quincena 2'], nVisitas:34,
    canales:['Salón','Drive-thru','Delivery'], formato:'Experiencia de consumo', ronda:_rondaActual(),
    restriccion:'Máximo 1 visita por shopper a la misma marca por quincena.',
    cuestionario:{modo:'link', url:'', label:'Link distinto por cada visita'},
    pago:{logica:'Pago semanal de lotes validados.', diasPago:7, moneda:'local'},
    hrMap:{fuente:'Hoja creada en plataforma', cols:['Sucursal','Ciudad','Marca','Escenario','Canal']},
    geoloc:true,
    conocimiento:'Restaurantes multimarca. Se evalúa servicio, sabor, tiempos y limpieza.',
  },
];

/* ---------- Evaluadores genéricos (sin nombres reales) ---------- */
const SHOPPERS = Array.from({length:16},(_,i)=>{
  const r=_rng(200+i*13);
  const pais=i%4===0?'HN':_pick(r,['GT','GT','HN']);
  const ciudad=pais==='GT'?_pick(r,GT_CITIES):_pick(r,HN_CITIES);
  return {
    id:'sh'+(i+1), code:'EVL-'+_pad(i+1), nombre:'Evaluador '+_pad(i+1),
    pais, ciudad,
    email:'evaluador'+_pad(i+1)+'@demo.cxorbia', phone:'+'+(pais==='GT'?'502':'504')+' ••• '+_pad(1000+i),
    dpi:'•••• •••• '+_pad(i*7%100),
    estado:_pick(r,['Activo','Activo','Activo','Certificado','Pendiente']),
    rating:+(3.6+r()*1.4).toFixed(1),
    visitas:Math.floor(r()*22)+2, postulaciones:Math.floor(r()*14)+1,
    promCuest:+(0.5+r()*2.2).toFixed(1), certs:Math.floor(r()*6)+1,
    honorarioPref: r()>0.8 ? 'Preferente' : 'Estándar',
    perfilCompleto:true,
  };
});
/* P0-3 (paquete V110→V111, 20260714): las 16 semillas de arriba son todas perfiles OPERATIVOS
   completos — no existía ningún registro que representara una fuente que solo entrega una
   REFERENCIA PROTEGIDA (código/país, sin rating/estado/honorario/contacto reales). Los módulos
   (shoppers.js) entonces siempre tenían con qué "rellenar" rating/estado/honorario, y nunca se
   probó honestamente el caso donde esos atributos simplemente NO EXISTEN. Se agregan aquí (solo
   visibles en modo demo, igual que el resto de fixtures) dos registros de ejemplo: uno de
   referencia protegida pura (sin ningún atributo operativo) y uno de perfil operativo PARCIAL
   (tiene estado/visitas pero no contacto/banco) — para poder probar los 3 niveles reales:
   protected_reference / operational_profile / full_authorized_profile. */
(function _seedProtectionTiers(){
  // deshabilitado en la generación base: se agregan más abajo, DESPUÉS de generar
  // visitas/postulaciones, para que estos registros de ejemplo nunca puedan ser
  // auto-asignados a una visita/postulación (no son shoppers operativos reales).
})();
/* nivel de dato disponible para UN shopper — nunca se infiere por ausencia, se declara por
   presencia real de campos. protected_reference: no hay ningún atributo operativo (ni estado, ni
   rating, ni conteo de visitas). operational_profile: hay atributos operativos pero no contacto
   ni banca (PII). full_authorized_profile: hay datos de contacto/documento/banco (perfil
   completo autorizado). */
CX.data_shopperDataLevel = function(s){
  if(!s) return 'protected_reference';
  const hasContact = !!(s.whatsapp||s.email||s.dpi||s.banco||s.ctaNum);
  if(hasContact) return 'full_authorized_profile';
  const hasOperational = s.estado!==undefined || typeof s.visitas==='number' || s.rating!==undefined || s.honorarioPref!==undefined;
  return hasOperational ? 'operational_profile' : 'protected_reference';
};

/* ---------- Sucursales genéricas por proyecto ---------- */
function sucursalName(p,r,i){
  const pais=_pick(r,p.countries);
  const ciudad=pais==='GT'?_pick(r,GT_CITIES):_pick(r,HN_CITIES);
  return { name:'Sucursal '+_pad(i)+' · '+ciudad, ciudad, pais };
}

/* ---------- Generador de visitas (por proyecto) ---------- */
const ESTADOS=['disponible','postulada','asignada','agendada','realizada','cuestionario','liquidada','fuera_rango'];
/* P0-1 (paquete V110→V111, corrección adicional 20260714): las fechas de las visitas generadas
   estaban ancladas a un literal fijo '2026-06-XX' — sin importar la fecha real del sistema, todo
   el calendario de Mi Día (que deriva su mes de ESTAS fechas via periodMonth()) mostraba siempre
   junio. Ahora las fechas se generan RELATIVAS al día real de hoy (_TODAY = new Date(), tomado al
   cargar la app), con el mismo patrón de dispersión relativa que tenía el prototipo (disponible
   desde antes, agendada/realizada/cuestionario progresando hacia el presente) — así el mes
   correcto (el real) se refleja en Mi Día, Dashboard, Histórico, etc. sin tocar la lógica de
   negocio de cada módulo (que ya lee estas fechas, nunca las inventa por su cuenta).
   Usa Date real (no concatenación de string) para evitar días inválidos (ej. 31 de febrero) al
   cruzar límites de mes. */
const _MES_ABR=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const _TODAY = new Date();
function _fmtISO(d){ return d.toISOString().slice(0,10); }
function _shiftDays(base, days){ const d=new Date(base); d.setDate(d.getDate()+days); return d; }
function genVisitas(p){
  const out=[]; const r=_rng(p.id.length*97+11);
  const dMin=_shiftDays(_TODAY,-5), dMax=_shiftDays(_TODAY,6);
  const rango=dMin.getDate()+'–'+dMax.getDate()+' '+_MES_ABR[dMax.getMonth()];
  for(let i=1;i<=p.nVisitas;i++){
    const su=sucursalName(p,r,i);
    const est=_pick(r,ESTADOS);
    const shopper = est==='disponible'?null:_pick(r,SHOPPERS.filter(s=>s.pais===su.pais));
    const franja=_pick(r,['Semana','Fin de semana']);
    const canal=p.canales?_pick(r,p.canales):'—';
    out.push({
      id:p.id+'-v'+i, projectId:p.id, num:i,
      sucursal:su.name, ciudad:su.ciudad, pais:su.pais, currency:p.currency[su.pais],
      quincena:_pick(r,p.quincenas), escenario:_pick(r,p.scenarios),
      franja, franjaCode:franja==='Semana'?'WK':'WKND', canal, formato:p.formato,
      honorario:p.honorario[su.pais], boleto:(p.boleto&&p.boleto[su.pais])||0,
      combo:p.combo, comboAmt:(p.comboAmt&&p.comboAmt[su.pais])||0,
      estado:est, shopperId:shopper?shopper.id:null, shopper:shopper?shopper.nombre:null,
      shopperCode:shopper?shopper.code:null,
      rango, disponibleDesde:_fmtISO(_shiftDays(_TODAY,-5+(i%12))),
      agendada:['agendada','realizada','cuestionario','liquidada'].includes(est)?_fmtISO(_shiftDays(_TODAY,-3+(i%6))):null,
      realizada:['realizada','cuestionario','liquidada'].includes(est)?_fmtISO(_shiftDays(_TODAY,-4+(i%5))):null,
      cuestFecha:['cuestionario','liquidada'].includes(est)?_fmtISO(_shiftDays(_TODAY,-3+(i%4))):null,
      submit:['liquidada'].includes(est),
    });
  }
  return out;
}

function genPosts(visitas){
  const r=_rng(7321); const out=[];
  visitas.filter(v=>['postulada','asignada','agendada'].includes(v.estado)).forEach((v,i)=>{
    const sh=v.shopperId?SHOPPERS.find(s=>s.id===v.shopperId):_pick(r,SHOPPERS.filter(s=>s.pais===v.pais));
    out.push({
      id:'p'+i, visitaId:v.id, projectId:v.projectId,
      shopperId:sh.id, shopper:sh.nombre, shopperCode:sh.code, phone:sh.phone,
      sucursal:v.sucursal, ciudad:v.ciudad, pais:v.pais, quincena:v.quincena, franjaCode:v.franjaCode,
      honorario:v.honorario, boleto:v.boleto, comboAmt:v.comboAmt, currency:v.currency,
      fechaProp:v.agendada||v.disponibleDesde, disponibleDesde:v.disponibleDesde,
      estado: v.estado==='postulada'?'pendiente':(r()>.88?'standby':'aprobada'),
      aprobadaPor: v.estado!=='postulada'?(r()>.5?'Auto-HR':'Coordinación'):null,
      reprog: r()>0.9,
    });
  });
  return out;
}

const _visitasAll = PROJECTS.flatMap(genVisitas);
const _postsAll   = genPosts(_visitasAll);

/* P0-2 (20260710): reintegra proyectos/periodos creados en el prototipo (persistidos en localStorage)
   para que sobrevivan un reload. Sus visitas se generan igual que cualquier proyecto (arrancan vacías
   si nVisitas=0, que es el default de addProject). */
(function _restoreCustomProjects(){
  try{
    const saved = JSON.parse(localStorage.getItem('cx_custom_projects')||'[]');
    saved.forEach(p=>{
      if(!PROJECTS.some(x=>x.id===p.id)){
        PROJECTS.push(p);
        if(p.nVisitas){ genVisitas(p).forEach(v=>_visitasAll.push(v)); }
      }
    });
  }catch(e){}
})();

/* P0-3 (paquete V110→V111, 20260714): registros de ejemplo para probar los 3 niveles reales de
   dato de un shopper — se agregan AQUÍ, después de generar visitas/postulaciones, para que
   nunca puedan ser auto-asignados a una visita (no son shoppers operativos reales, son fixtures
   de demostración del propio nivel de protección). Solo visibles en modo demo, igual que el
   resto de fixtures del prototipo. */
(function _seedProtectionTiers(){
  const showFx = CX.dataSource ? CX.dataSource.showFixtures() : true;
  if(!showFx) return;
  SHOPPERS.push(
    { id:'sh_ref_protegida', code:'REF-PROT-01', pais:'GT' }, // protected_reference: sin nombre/estado/rating/visitas
    { id:'sh_op_parcial', code:'EVL-OP-01', nombre:'Evaluador OP-01', pais:'GT', ciudad:'Guatemala',
      estado:'Activo', visitas:3 } // operational_profile: sin whatsapp/email/dpi/banco/rating/honorario
  );
})();

/* ---------- Exposición ---------- */
CX.data = {
  projects:PROJECTS, shoppers:SHOPPERS, _visitas:_visitasAll, _posts:_postsAll,
  /* GAP1-v2 (paquete V112→V113, 20260714 — auditoría independiente encontró que V112 seguía
     usando `currentProjectId` como accessor DERIVADO del periodo, no como almacenamiento propio
     — project() y period() devolvían el mismo objeto, y existían DOS definiciones del alias de
     cambio de programa (la segunda pisaba la primera). Corrección real esta vez:
       - `currentProjectId` y `currentPeriodId` son AMBOS campos de almacenamiento reales —
         ninguno es un getter/setter derivado del otro.
       - `project()` y `period()` devuelven objetos DISTINTOS: period() es la entrada cruda de
         this.projects; project() es un objeto separado cuyo `id` es el `currentProjectId`
         (la programKey real) y que expone `activePeriodId` — nunca son el mismo objeto ni el
         mismo id, aunque project() siga heredando la config visual del periodo (países,
         honorario, formato...) por compat con el resto de la UI.
       - Una sola definición del setter de proyecto/periodo/alias de programa (se eliminó
         la segunda copia que existía cerca de duplicatePeriod()). */
  currentPeriodId:(()=>{try{const s=localStorage.getItem('cx_start_project');if(s&&PROJECTS.some(p=>p.id===s))return s;}catch(e){}return PROJECTS[0].id;})(),
  /* bootstrap real justo después del cierre del objeto (necesita this.programKey, definido en
     este mismo objeto — no se puede invocar dentro del propio literal). Ver el pie de archivo. */
  currentProjectId: null,

  /* proxy expuesto en CX.data — implementación real vive arriba, antes de CX.data (necesita
     estar disponible antes de que se generen shoppers de fixture). */
  shopperDataLevel(s){ return CX.data_shopperDataLevel(s); },

  /* period(): la entrada CRUDA de this.projects (lo que este código llama "periodo").
     project(): objeto DISTINTO — id real es currentProjectId (la programKey/proyecto real),
     más activePeriodId apuntando al periodo activo. Hereda la config visual del periodo
     (países, honorario, formato...) porque así está modelada la config en este prototipo
     (duplicatePeriod() copia esa config a cada periodo nuevo del mismo proyecto), pero su
     identidad (`id`) YA NO es la del periodo. */
  period(){ return this.projects.find(p=>p.id===this.currentPeriodId); },
  project(){
    const per=this.period();
    if(!per) return null;
    return Object.assign({}, per, { id:this.currentProjectId, activePeriodId:per.id });
  },
  /* setProject(periodId): salto DIRECTO y sin restricción a un periodo específico — lo usan
     acciones explícitas de navegación ("abrir este proyecto/periodo" desde Proyectos, Clientes,
     Gestión de Periodos, Configuración). Sincroniza AMBOS campos (currentPeriodId Y
     currentProjectId, recalculando la programKey real del periodo destino) para que nunca
     queden desalineados tras un salto directo. periodSel/projSel (selectores de la barra
     lateral) NO deben usar este método — usan setCurrentPeriod/setCurrentProject, que sí
     validan. */
  setProject(id){
    const per=this.projects.find(p=>p.id===id);
    if(!per) return false;
    this.currentPeriodId=id;
    this.currentProjectId=this.programKey(per);
    CX.bus&&CX.bus.emit('project');
    CX.bus&&CX.bus.emit('cx:period-changed', {periodId:id});
    CX.bus&&CX.bus.emit('cx:project-changed', {projectId:this.currentProjectId});
    return true;
  },
  /* setCurrentPeriod(periodId): Único punto para el selector de PERIODO. Valida que el periodo
     pertenezca al PROYECTO actualmente activo (currentProjectId, almacenamiento real — ya no
     derivado) — si no, RECHAZA (false, sin mutar nada). Muta SOLO currentPeriodId. */
  setCurrentPeriod(periodId){
    const per=this.projects.find(p=>p.id===periodId);
    if(!per) return false;
    if(this.programKey(per)!==this.currentProjectId) return false;
    this.currentPeriodId=periodId;
    CX.bus&&CX.bus.emit('project');
    CX.bus&&CX.bus.emit('cx:period-changed', {periodId});
    return true;
  },
  /* setCurrentProject(projectId): único punto para el selector de PROYECTO. Valida que exista
     al menos un periodo con esa programKey; muta currentProjectId; conserva el periodo activo
     si pertenece al nuevo proyecto, si no activa el periodo más reciente. Única definición —
     el alias de programa (ver más abajo) apunta aquí, ya no hay una segunda copia. */
  setCurrentProject(projectId){
    const periods=this.periodsForProgram(projectId);
    if(!periods.length) return false;
    this.currentProjectId=projectId;
    const periodChanged = !periods.some(p=>p.id===this.currentPeriodId);
    if(periodChanged) this.currentPeriodId=periods[periods.length-1].id;
    CX.bus&&CX.bus.emit('project');
    CX.bus&&CX.bus.emit('cx:project-changed', {projectId});
    /* GAP1 (V113\u2192V114): si el cambio de proyecto arrastra un cambio de periodo (el activo no
       pertenec\u00eda al nuevo proyecto), co-emitir cx:period-changed con el periodo RESULTANTE \u2014
       antes solo se emit\u00eda cx:project-changed y ning\u00fan listener de period-changed se enteraba. */
    if(periodChanged) CX.bus&&CX.bus.emit('cx:period-changed', {periodId:this.currentPeriodId});
    return true;
  },
  setProgram(key){ return this.setCurrentProject(key); },
  setPeriod(id){ this.setProject(id); },
  /* proyecto real = programa (agrupa periodos); alias de currentProgramKey()/proyectoActual() */
  program(){ return this.proyectoActual(); },
  projectGroup(){ return this.proyectoActual(); },
  /* OLA1 (paquete V114→V115, contrato reutilizable 05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md):
     objeto de contexto único {tenantId, projectId, periodId, countryScope, role, dataMode} —
     compone fuentes YA existentes (no duplica lógica): CX.BRAND/CX.tenant para tenantId,
     currentProjectId/currentPeriodId (estado real, ver arriba), scopePaises() para
     countryScope, CX.session.effectiveRole() para role, CX.dataSource.mode para dataMode.
     Uso previsto: cualquier módulo que hoy lee estos campos por separado puede migrar a
     `CX.data.ctx()` sin cambiar el significado de ninguno. */
  ctx(){
    return {
      tenantId: (CX.tenant && CX.tenant.id) || (CX.BRAND && CX.BRAND.tenantId) || (CX.BRAND && CX.BRAND.name) || null,
      projectId: this.currentProjectId,
      periodId: this.currentPeriodId,
      countryScope: this.scopePaises(),
      role: (CX.session && CX.session.effectiveRole && CX.session.effectiveRole()) || (CX.session && CX.session.role) || null,
      dataMode: (CX.dataSource && CX.dataSource.mode) || 'demo',
    };
  },
  /* OLA1 (05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md, contrato de Visita): nombres de campo
     EXACTOS derivados de v.estado (el flujo real ya implementado) — alias de solo lectura, no
     agrega estado nuevo ni cambia el significado de v.estado en ningún módulo existente. */
  visitContract(v){
    if(!v) return null;
    const opMap={disponible:'disponible',postulada:'postulada',asignada:'asignada',agendada:'agendada',
      realizada:'realizada',cuestionario:'realizada',liquidada:'realizada',fuera_rango:'fuera_rango'};
    return {
      operationalState: opMap[v.estado] || v.estado || null,
      questionnaireState: v.estado==='cuestionario'||v.estado==='liquidada' ? (v.submit?'submitido':'pendiente_submitir') : (v.estado==='realizada'?'pendiente_cuestionario':'no_aplica'),
      submissionState: v.submit ? 'submitido' : (v.estado==='liquidada'||v.estado==='cuestionario' ? 'pendiente_submitir' : 'no_aplica'),
      liquidationState: CX.liq ? CX.liq.estadoFromVisita(v) : null,
      paymentState: v.paymentSourceRef ? 'confirmado' : (v.estado==='liquidada' ? 'preview' : 'no_aplica'),
      assignmentSource: v.origenAsignacion || (v.shopperId ? 'manual_o_postulacion' : null),
      assignmentSyncStatus: v.hrSynced ? 'sincronizado' : 'pendiente_sync',
      lastSyncedAt: v.hrSyncedAt || null,
      reviewRequired: !!v.reviewRequired,
      reviewReasons: v.reviewReasons || [],
    };
  },

  /* alta de proyecto nuevo (persistente, aislado: id propio, sin tocar los demás) */
  addProject(cfg){
    const id = cfg.id || ('proj-'+Date.now().toString(36));
    const tenantId = (window.CX && CX.BRAND && CX.BRAND.id) || 'tenant-demo';
    const proj = Object.assign({
      id, tenantId, accent:'#2196d3', quincenas:['Quincena 1','Quincena 2'], nVisitas:0,
    }, cfg, {id, tenantId: cfg.tenantId || tenantId});
    this.projects.push(proj);
    this._saveCustomProjects();
    this.currentPeriodId = id;
    this.currentProjectId = this.programKey(proj);
    CX.bus && CX.bus.emit('project');
    return proj;
  },
  /* P0-2 (20260710): proyectos/periodos creados en el prototipo deben sobrevivir un reload —
     se persisten aparte de los seeds (nunca se tocan/duplican los 3 proyectos de ejemplo). */
  _CUSTOM_KEY:'cx_custom_projects',
  _saveCustomProjects(){
    try{
      const seedIds=new Set(['retail','banca','food']);
      const custom=this.projects.filter(p=>!seedIds.has(p.id));
      localStorage.setItem(this._CUSTOM_KEY, JSON.stringify(custom));
    }catch(e){}
  },
  _loadCustomProjects(){
    try{ return JSON.parse(localStorage.getItem(this._CUSTOM_KEY)||'[]'); }catch(e){ return []; }
  },

  /* proyectos visibles por rol: el shopper solo ve los de su país; coordinador/aliado con
     scopePaises solo ven proyectos que tengan al menos un país dentro de su alcance;
     con scopeProjectId (projectCoordinator/operationsCoordinator) solo ven ESE proyecto */
  projectsFor(role){
    const spid=(CX.session&&CX.session.user&&CX.session.user.scopeProjectId)||null;
    if(role!=='shopper') {
      if(spid) return this.projects.filter(p=>p.id===spid);
      const sc=this.scopePaises();
      if(sc) return this.projects.filter(p=>(p.countries||[]).some(c=>sc.includes(c)));
      return this.projects;
    }
    const u=CX.session&&CX.session.user; const sh=u&&this.shoppers.find(s=>s.id===u.shopperId);
    const pais=sh?sh.pais:null;
    return pais ? this.projects.filter(p=>p.countries.includes(pais)) : this.projects;
  },
  /* atajo usado por selectores de proyecto en Proyectos/Dashboard/Visitas — respeta el alcance por país */
  scopedProjects(){ return this.projectsFor(CX.session&&CX.session.role); },

  /* ---- Separación Proyecto(programa) vs Periodo (P0 V63/V64) ----
     Deriva el programa base quitando tokens de mes/quincena/país del nombre.
     Así el selector muestra "Proyecto ejemplo" (no "Proyecto ejemplo ABRIL 26 HN"). */
  _MESES:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','setiembre','octubre','noviembre','diciembre'],
  programBase(p){
    let n=(p.name||'').trim();
    const re=new RegExp('\\b('+this._MESES.join('|')+')\\b\\.?\\s*\\d{0,4}','ig');
    n=n.replace(re,'').replace(/\b20\d{2}\b|\b\d{2}\b(?!\d)/g,'').replace(/\b(HN|GT|SV|CR|PA|MX|CO|Q1|Q2|quincena\s*\d)\b/ig,'')
       .replace(/[\-–·|]+/g,' ').replace(/\s{2,}/g,' ').trim();
    return n||p.name;
  },
  programKey(p){ return (p.program||this.programBase(p)).toLowerCase(); },
  /* lista de programas únicos (lo que el selector de Proyecto debe mostrar) */
  programs(){
    const seen={}, out=[];
    this.projects.forEach(p=>{const k=this.programKey(p);if(!seen[k]){seen[k]={key:k,name:this.programBase(p),sample:p,periods:[]};out.push(seen[k]);}seen[k].periods.push(p);});
    return out;
  },
  /* periodos (los "proyectos" internos) de un programa */
  periodsForProgram(key){ return this.projects.filter(p=>this.programKey(p)===key); },
  currentProgramKey(){ return this.currentProjectId || (this.programs()[0]&&this.programs()[0].key); },
  /* ============================================================
     ARQUITECTURA REAL (genérica, no específica de un tenant):
       Proyecto  = "programa" (this.programs()) → entidad configurable
                   real: países, monedas, marca, roles, módulos, fuente.
       Periodo   = cada entrada de this.projects es en realidad un PERIODO
                   dentro de un proyecto (agrupado por programKey). Un
                   periodo NUNCA debe tratarse ni crearse como si fuera un
                   proyecto nuevo — solo hereda config de su proyecto padre.
     Alias explícitos para dejar esto inequívoco en el resto del código
     y en Academia (evita el anti-patrón "periodo tratado como proyecto"):
     ============================================================ */
  proyectos(){ return this.programs(); },
  /* P1 (V96 reauditoría): todos los proyectos que calzan con un scopeCliente (nombre de marca) —
     un cliente puede tener varios proyectos/programas activos; el router elige uno para aterrizar
     pero el portal cliente expone un selector si hay más de uno. */
  clientProjects(clienteName){
    if(!clienteName) return [];
    return this.projects.filter(p=>(p.client||'').toLowerCase()===clienteName.toLowerCase());
  },
  /* variante que respeta el alcance por país (coordinador/aliado/usuario invitado con scopePaises)
     y por proyecto único (projectCoordinator/operationsCoordinator con scopeProjectId) */
  scopedProyectos(){    const spid=(CX.session&&CX.session.user&&CX.session.user.scopeProjectId)||null;
    if(spid){
      const seen={}, out=[];
      this.projects.filter(p=>p.id===spid).forEach(p=>{const k=this.programKey(p);if(!seen[k]){seen[k]={key:k,name:this.programBase(p),sample:p,periods:[]};out.push(seen[k]);}seen[k].periods.push(p);});
      return out;
    }
    const sc=this.scopePaises();
    if(!sc) return this.programs();
    const seen={}, out=[];
    this.projects.filter(p=>(p.countries||[]).some(c=>sc.includes(c))).forEach(p=>{const k=this.programKey(p);if(!seen[k]){seen[k]={key:k,name:this.programBase(p),sample:p,periods:[]};out.push(seen[k]);}seen[k].periods.push(p);});
    return out;
  },
  periodosDe(proyectoKey){ return this.periodsForProgram(proyectoKey); },
  proyectoActual(){ return this.programs().find(pg=>pg.key===this.currentProgramKey()); },
  /* ---- #230 Gestión de Periodos (estado por periodo, persistente) ---- */
  _periodMeta(){ try{ return JSON.parse(localStorage.getItem('cx_period_meta')||'{}'); }catch(e){ return {}; } },
  _savePeriodMeta(m){ try{ localStorage.setItem('cx_period_meta', JSON.stringify(m)); }catch(e){} CX.bus&&CX.bus.emit('project'); },
  periodState(id){ return this._periodMeta()[id] || 'activo'; },
  periodStats(id){ const vs=this._visitas.filter(v=>v.projectId===id); const done=vs.filter(v=>['realizada','cuestionario','validada','liquidada'].includes(v.estado)).length;
    return { total:vs.length, done, pct: vs.length? Math.round(done/vs.length*100):0 }; },
  setPeriodState(id, st){ const m=this._periodMeta(); m[id]=st; this._savePeriodMeta(m); },
  closePeriod(id){ this.setPeriodState(id,'cerrado'); },
  archivePeriod(id){ this.setPeriodState(id,'archivado'); },
  reopenPeriod(id){ this.setPeriodState(id,'activo'); },
  /* P0-1 (paquete V110→V111): deriva el mes real de un periodo a partir de SUS PROPIAS fechas
     (nunca un literal hardcodeado). Se usa como mes por defecto del calendario de Mi Día — si
     el periodo cambia, el mes visible cambia con él porque se recalcula sobre datos reales del
     periodo activo, no sobre un string fijo tipo '2026-06'. Si el periodo no tiene NINGUNA
     visita con fecha (periodo vacío), cae al mes real del reloj del sistema — nunca a un mes de
     otro periodo ni a una fecha inventada. */
  periodDates(id){
    const vs=this._visitas.filter(v=>v.projectId===id);
    const out=[];
    vs.forEach(v=>{ [v.agendada,v.realizada,v.cuestFecha,v.disponibleDesde].forEach(d=>{ if(d) out.push(d); }); });
    return out;
  },
  periodMonth(id){
    const dates=this.periodDates(id);
    if(!dates.length) return new Date().toISOString().slice(0,7);
    const sorted=dates.slice().sort();
    return sorted[0].slice(0,7);
  },
  duplicatePeriod(id, nombre){ /* crea un PERIODO NUEVO dentro del mismo proyecto (programKey) — nunca un proyecto nuevo */
    const src=this.projects.find(p=>p.id===id); if(!src)return null;
    const nid='proj-'+Date.now().toString(36);
    const dup=Object.assign({}, src, {id:nid, name:nombre||(src.name+' (copia)'), periodo:nombre||'Nuevo periodo', program:this.programKey(src), nVisitas:0});
    this.projects.push(dup);
    this._saveCustomProjects();
    /* clona la estructura (sucursales/escenarios) pero NO las visitas ejecutadas — periodo nuevo arranca limpio */
    CX.bus&&CX.bus.emit('project'); return dup; },

  visitas(){const arr=this._visitas.filter(v=>v.projectId===this.currentPeriodId);return this.scopePaises()?arr.filter(v=>this.inScope(v.pais)):arr;},
  posts(){const arr=this._posts.filter(p=>p.projectId===this.currentPeriodId);return this.scopePaises()?arr.filter(p=>this.inScope(p.pais)):arr;},
  shoppersFor(){const cs=this.period().countries;const sc=this.scopePaises();return this.shoppers.filter(s=>cs.includes(s.pais)&&this.inScope(s.pais));},

  /* ---- P0-3/GAP3 (paquete V111→V112, 20260714): pool de shoppers RANKEABLES ----
     Antes el ranking (Dashboard) y los KPIs de completitud/preferente en este módulo mezclaban
     referencias protegidas y perfiles sin rating con perfiles reales, usando `rating||0`/
     `!perfilCompleto` sin distinguir nivel de dato — una referencia protegida terminaba
     ordenada en el ranking con '0' y contada como "perfil incompleto" aunque nunca fue un
     perfil. Este helper es la Única fuente para "quién es rankeable": nivel de dato distinto de
     protected_reference Y rating numérico real (nunca 0 fabricado). */
  rankableShoppers(pool){
    const arr = pool || this.shoppersFor();
    return arr.filter(s => this.shopperDataLevel(s)!=='protected_reference' && Number.isFinite(s.rating));
  },

  /* ---- Fase 5: alcance por país (roles coordinador/aliado, scopeCountry:true) ----
     Restringe SOLO cuando el usuario en sesión trae países asignados (u.scopePaises).
     Sin asignación → sin restricción (super/admin ven todo, como hoy). */
  scopePaises(){
    const u=CX.session&&CX.session.user;
    if(!u||!u.scopePaises||!u.scopePaises.length) return null;
    return u.scopePaises;
  },
  inScope(pais){ const sc=this.scopePaises(); return !sc||!pais||sc.includes(pais); },

  /* cambio de estado de una visita (flujo del shopper) + sincronía */
  setVisitState(id, estado, dateField, dateVal){
    const v=this._visitas.find(x=>x.id===id); if(!v) return null;
    v.estado=estado;
    if(dateField && dateVal) v[dateField]=dateVal;
    if(CX.hr) CX.hr.writeBack(this.period(), v);
    CX.bus && CX.bus.emit('visit-flow');
    return v;
  },

  /* asignación manual de una visita a un shopper (existente o recién creado) */
  assignVisit(visitId, shopperId){
    const v=this._visitas.find(x=>x.id===visitId);
    const s=this.getShopper?this.getShopper(shopperId):this.shoppers.find(x=>x.id===shopperId);
    if(!v||!s) return null;
    v.shopperId=s.id; v.shopper=s.nombre; v.shopperCode=s.code;
    if(v.estado==='disponible') v.estado='asignada';
    if(CX.hr) CX.hr.writeBack(this.period(), v);
    CX.bus && CX.bus.emit('visit-flow');
    return v;
  },

  /* pago de un lote: marca visitas como liquidadas con fecha de pago real Y
     genera el/los egreso(s) financiero(s) agrupados por país.
     Cierra la cadena visita → liquidación → beneficios → finanzas (CxP + Movimientos). */
  payVisits(ids, fechaPago, referencia){
    const f=fechaPago||new Date().toISOString().slice(0,10);
    const porPais={}; let n=0; const detalle=[];
    const tenantId=(CX.BRAND&&CX.BRAND.id)||'tenant-demo';
    const projectId=this.currentPeriodId;
    const ref=(referencia||'').trim();
    /* T2 (paquete V109 — 20260712): agrupación homogénea + ID determinístico. Preservado sin
       cambios (no reabrir): tenantId+projectId+país+moneda(+referencia) → loteId = hash de la
       clave + ids ordenados, nunca Math.random()/Date.now(). */
    /* P0-2 (paquete V110 — 20260712, corrección P0 real): V109 seguía agrupando y PROCESANDO
       cualquier id recibido, aunque la visita no tuviera país/moneda/monto válidos — el
       fallback '—' de la clave homogénea SEPARABA esos registros de los válidos (ya no sumaba
       monedas distintas), pero igual los marcaba `liquidada`, les asignaba loteId y fecha, y
       creaba un movimiento `Pagado` con monto NaN/negativo. La vista de Finanzas mostraba luego
       "Revisión requerida", pero el daño (estado+movimiento) ya había ocurrido. Ahora la
       validación ocurre ANTES de tocar cualquier estado: cada id se valida por separado — id
       estable presente, visita existente, projectId coincidente con el periodo activo, país
       presente, moneda presente, monto total FINITO y no negativo. Los inválidos van a
       `reviewRequired` con motivo, NUNCA cambian estado, NUNCA reciben loteId/fecha, NUNCA
       generan movimiento ni automatización, y NUNCA se suman a porPais/detalle. Los válidos
       siguen el flujo de agrupación homogénea sin cambios. */
    const reviewRequired=[];
    const visitasValidas=[];
    (ids||[]).forEach(id=>{
      if(!id){ reviewRequired.push({id:id||null, motivo:'ID de visita ausente'}); return; }
      const v=this._visitas.find(x=>x.id===id);
      if(!v){ reviewRequired.push({id, motivo:'Visita no encontrada'}); return; }
      if(!v.projectId || v.projectId!==projectId){ reviewRequired.push({id, motivo:'Proyecto ausente o no coincide con el periodo activo'}); return; }
      if(!v.pais){ reviewRequired.push({id, motivo:'País ausente'}); return; }
      if(!v.currency){ reviewRequired.push({id, motivo:'Moneda ausente'}); return; }
      /* OJO: `v.honorario||0` NO sirve para detectar NaN — `NaN||0` se evalúa a `0` porque NaN
         es falsy en JS, así que un monto NaN se "lavaba" a 0 (finito, válido) y se colaba como
         pagado. Cada componente se valida FINITO por separado (undefined/null se tratan como 0
         ausente-válido; cualquier valor presente que NO sea finito invalida el registro) antes
         de sumar. */
      const comps=[v.honorario,v.boleto,v.comboAmt];
      const compInvalido=comps.some(x=>x!==undefined && x!==null && !Number.isFinite(x));
      if(compInvalido){ reviewRequired.push({id, motivo:'Monto total no finito (NaN/Infinity)'}); return; }
      const tot=(Number.isFinite(v.honorario)?v.honorario:0)+(Number.isFinite(v.boleto)?v.boleto:0)+(Number.isFinite(v.comboAmt)?v.comboAmt:0);
      if(tot<0){ reviewRequired.push({id, motivo:'Monto total negativo'}); return; }
      visitasValidas.push(v);
    });
    const groups={};
    visitasValidas.forEach(v=>{
      const key=[tenantId,projectId,v.pais,v.currency,ref].join('::');
      (groups[key]=groups[key]||[]).push(v);
    });
    const hashHex=(str)=>{ let h1=0,h2=0; for(let i=0;i<str.length;i++){ const c=str.charCodeAt(i); h1=(h1*31+c)|0; h2=(h2*131+c)|0; } return (Math.abs(h1).toString(36)+Math.abs(h2).toString(36)).toUpperCase().slice(0,8); };
    Object.keys(groups).sort().forEach(key=>{
      const group=groups[key];
      const idsSorted=group.map(v=>v.id).sort().join(',');
      const lote='L-'+hashHex(key+'::'+idsSorted);
      group.forEach(v=>{
        v.estado='liquidada'; v.fechaPago=f; v.realizada=v.realizada||f; v.loteId=lote; v.loteRef=ref||null;
        const tot=(v.honorario||0)+(v.boleto||0)+(v.comboAmt||0);
        porPais[v.pais]=porPais[v.pais]||{monto:0,n:0,cur:v.currency}; porPais[v.pais].monto+=tot; porPais[v.pais].n++;
        detalle.push({shopper:v.shopper||'Evaluador',sucursal:v.sucursal||'',pais:v.pais,monto:tot,cur:v.currency,visitaId:v.id,loteId:lote});
        n++;
      });
    });
    // un movimiento de egreso POR SHOPPER (detalle real, no consolidado) — #168. Solo para
    // visitas VÁLIDAS (ver P0-2 arriba) — los inválidos jamás llegan a `detalle`.
    if(n && CX.finStore){
      detalle.forEach(d=>{
        CX.finStore.addMov(this.currentPeriodId,{tipo:'egreso',cat:'Honorario · '+d.shopper,pais:d.pais,monto:-d.monto,desc:d.sucursal+' · lote '+d.loteId,estado:'Pagado',origen:'lote',lote:d.loteId,shopper:d.shopper,visitaId:d.visitaId,fecha:f});
      });
    }
    if(n) CX.bus && CX.bus.emit('visit-flow');
    // automatización solo para las procesadas realmente (no para reviewRequired)
    visitasValidas.forEach(v=>{ if(CX.automations) CX.automations.fire('pago',{shopper:v.shopper||'',sucursal:v.sucursal}); });
    return {pagadas:n, fechaPago:f, porPais, detalle, reviewRequired};
  },

  /* conteo por fase con desglose por país */
  _phaseCount(v,fn){const cs=this.period().countries;const o={t:v.filter(fn).length};cs.forEach(c=>o[c]=v.filter(x=>x.pais===c&&fn(x)).length);return o;},
  kpis(){
    const v=this.visitas();
    const P=(fn)=>this._phaseCount(v,fn);
    return {
      total:P(()=>true),
      asignadas:P(x=>x.shopperId),
      sinAsignar:P(x=>!x.shopperId&&x.estado!=='fuera_rango'),
      sinAgendar:P(x=>x.estado==='asignada'),
      agendadas:P(x=>['agendada','realizada','cuestionario','liquidada'].includes(x.estado)),
      realizadas:P(x=>['realizada','cuestionario','liquidada'].includes(x.estado)),
      pendRealizar:P(x=>['asignada','agendada'].includes(x.estado)),
      cuestPend:P(x=>x.estado==='realizada'),
      sinSubmitir:P(x=>x.estado==='cuestionario'),
      liquidadas:P(x=>x.estado==='liquidada'),
      fueraRango:P(x=>x.estado==='fuera_rango'),
      postPend:this.posts().filter(p=>p.estado==='pendiente').length,
    };
  },
  /* flujo por fases para un país */
  phaseFlow(c){
    const v=this.visitas().filter(x=>x.pais===c); const t=v.length||1;
    const n=(fn)=>v.filter(fn).length; const pc=(x)=>Math.round(x/t*100);
    const real=n(x=>['realizada','cuestionario','liquidada'].includes(x.estado));
    const agen=n(x=>['agendada','realizada','cuestionario','liquidada'].includes(x.estado));
    return {
      total:v.length,
      asign:[n(x=>x.shopperId),pc(n(x=>x.shopperId))],
      agend:[agen,pc(agen)],
      sinAgend:[n(x=>x.estado==='asignada'),pc(n(x=>x.estado==='asignada'))],
      sinAsign:[n(x=>!x.shopperId&&x.estado!=='fuera_rango'),pc(n(x=>!x.shopperId&&x.estado!=='fuera_rango'))],
      real:[real,pc(real)],
      cuest:[n(x=>['cuestionario','liquidada'].includes(x.estado)),pc(n(x=>['cuestionario','liquidada'].includes(x.estado)))],
      submit:[n(x=>x.estado==='liquidada'),pc(n(x=>x.estado==='liquidada'))],
      liq:[n(x=>x.estado==='liquidada'),pc(n(x=>x.estado==='liquidada'))],
    };
  },
};
/* GAP1-v2 (V112\u2192V113): bootstrap de currentProjectId \u2014 ahora que es almacenamiento real (no
   un getter derivado), necesita un valor inicial calculado UNA vez, justo despu\u00e9s de que el
   objeto CX.data exista (this.programKey/this.period() no est\u00e1n disponibles dentro del propio
   literal). Se deriva del periodo inicial (currentPeriodId), nunca de un literal fijo. */
CX.data.currentProjectId = CX.data.programKey(CX.data.period());
