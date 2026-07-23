/* ============================================================
   CXOrbia · TyA Phase A live HR source-safe DEV bridge
   ------------------------------------------------------------
   Activo solo en host DEV o con ?cxTyaPhaseA=1.
   Consume window.CX_TYA_HR_SOURCE_SAFE generado desde HR viva multihoja.
   No contiene DPI, banco, teléfono, correo, HR URL privada ni workbook crudo.
   No importa, no escribe, no activa proveedores ni producción.

   Contrato crítico:
   - projectId identifica el proyecto padre (p. ej. cinepolis);
   - periodId identifica un mes/ronda único dentro del proyecto;
   - las visitas se enlazan al periodId para que Histórico/KPI/Finanzas no mezclen periodos.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = (window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  if(!enabled || !CX.data) return;

  const snapshot = window.CX_TYA_HR_SOURCE_SAFE || null;
  const hasLivePayload = !!(snapshot && Array.isArray(snapshot.periods) && snapshot.periods.length && Array.isArray(snapshot.visits));

  window.CX_BACKEND_DEV = true;
  window.CX_TYA_PHASE_A_PREVIEW = true;
  window.CX_TYA_HR_VIVA_SOURCE_SAFE = hasLivePayload;

  try{
    localStorage.setItem('cx_demo_mode','off');
    localStorage.setItem('cx_theme','tya');
    localStorage.removeItem('cx_start_project');
  }catch(e){}

  CX.BRAND = Object.assign(CX.BRAND || {}, {
    clientName: 'TyA',
    tagline: 'Tenant TyA · Phase A controlada',
    theme: 'tya',
    demoMode: false,
    showAITag: true,
    countries: ['GT','HN']
  });

  const fallbackSnapshot = {
    generatedAt: null,
    tenantId:'tya', tenantName:'TyA', projectId:'cinepolis', projectName:'Cinépolis',
    periods:[{ key:'pending', label:'HR pendiente', fullLabel:'HR pendiente', projectId:'cinepolis', projectName:'Cinépolis', internalName:'Cinépolis HR pendiente', countries:{GT:0,HN:0}, total:0 }],
    visits:[], shoppers:[], counts:{periods:0,tabs:0,visits:0,shoppers:0},
    source:{type:'hr_live_source_safe_pending', sourceSafe:true}, sourceSafe:true, imported:false, production:false
  };
  const data = hasLivePayload ? snapshot : fallbackSnapshot;
  const tenantId = data.tenantId || 'tya';
  const parentProjectId = data.projectId || 'cinepolis';
  const parentProjectName = data.projectName || 'Cinépolis';
  const currency = { GT:'Q', HN:'L' };
  const stablePeriodId = (projectId, periodKey) => `${projectId}::${periodKey || 'pending'}`;
  const latestPeriod = [...data.periods].sort((a,b)=>String(a.key).localeCompare(String(b.key))).pop() || data.periods[0];

  const projects = data.periods.map(p => {
    const periodId = stablePeriodId(parentProjectId, p.key);
    return {
      id: periodId,
      tenantId,
      parentProjectId,
      program: parentProjectId,
      programLabel: parentProjectName,
      periodo: p.label,
      periodKey: p.key,
      name: p.internalName || `${parentProjectName} ${p.fullLabel || p.label}`,
      client:'TyA',
      industry:'Mystery shopping · cines · GT/HN',
      countries:['GT','HN'],
      currency,
      accent:'#2196d3',
      sucursales:p.total || 0,
      nVisitas:p.total || 0,
      honorario:{GT:60,HN:200},
      honRecibe:{GT:null,HN:null},
      modelo:'directo',
      isr:5,
      regalias:10,
      boleto:{GT:0,HN:0},
      combo:'Configurable por visita HR',
      comboAmt:{GT:0,HN:0},
      scenarios:['Cinépolis · visita regular','Cinépolis · fin de semana','Cinépolis · VIP / formato especial'],
      quincenas:['Quincena 1','Quincena 2'],
      canales:['Visita presencial'],
      formato:'Mystery shopping cine',
      ronda:p.label,
      restriccion:'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
      cuestionario:{modo:'configurable', url:'', label:'CXOrbia / TyAOnline / externo / link por visita desde HR'},
      pago:{logica:'Pagos y liquidaciones se controlan por submitido y cruce financiero.', diasPago:null, moneda:'local'},
      hrMap:{fuente:'HR TyA viva multihoja source-safe', cols:['País','ID cinema','Shopping','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
      geoloc:false,
      conocimiento:'TyA/Cinépolis Phase A. Proyecto normal configurable dentro del tenant TyA.',
      sourceSafe:true,
      importStatus:'hr_live_source_safe_snapshot_not_imported',
      snapshotCounts:p.countries || {GT:0,HN:0,total:p.total || 0}
    };
  });

  const periodsByKey = new Map(projects.map(period => [String(period.periodKey), period]));
  const latestPeriodId = stablePeriodId(parentProjectId, latestPeriod && latestPeriod.key);

  const visits = (data.visits || []).map((v, idx) => {
    const period = periodsByKey.get(String(v.periodKey || ''));
    const periodId = period ? period.id : stablePeriodId(parentProjectId, v.periodKey);
    return {
      id:v.id || `hr-live-${idx+1}`,
      tenantId,
      parentProjectId,
      hrRowId:v.hrRowId,
      sourceTab:v.sourceTab,
      sourceRow:v.sourceRow,
      projectId:periodId,
      periodId,
      periodKey:v.periodKey,
      periodLabel:v.periodLabel,
      num:idx+1,
      sucursal:v.sucursal || 'Sucursal HR',
      ciudad:v.ciudad || '',
      pais:v.pais || v.country,
      country:v.country || v.pais,
      currency:v.currency || currency[v.pais || v.country] || '',
      quincena:v.quincena || '',
      escenario:v.escenario || v.tipoCompra || '',
      franja:v.franja || '',
      franjaCode:v.franjaCode || 'WK',
      canal:'Visita presencial',
      formato:v.formato || 'Mystery shopping cine',
      honorario:v.honorario ?? null,
      boleto:v.boleto ?? null,
      combo:v.tipoCombo || 'Configurable por HR',
      comboAmt:v.comboAmt ?? null,
      estado:v.estado || 'disponible',
      shopperId:v.shopperId || null,
      shopper:v.shopper || null,
      shopperCode:v.shopperCode || null,
      rango:v.quincena || '',
      disponibleDesde:v.disponibleDesde || null,
      agendada:v.agendada || null,
      realizada:v.realizada || null,
      cuestFecha:v.cuestFecha || null,
      submit:!!v.submit,
      submittedAt:v.submittedAt || null,
      assignmentSource:v.hasShopper ? 'hr' : null,
      assignmentSyncStatus:'hr_live_source_safe_preview',
      reviewRequired:false,
      sourceSafe:true,
      piiProtected:true
    };
  });

  const shoppers = (data.shoppers || []).map((s, idx) => ({
    id:s.id || `shopper-protegido-${idx+1}`,
    code:s.code || `TYA-SH-${idx+1}`,
    nombre:s.nombre || 'Shopper protegido',
    pais:s.pais || 'GT',
    ciudad:s.ciudad || '',
    estado:s.estado || 'Activo',
    rating:4.3,
    visitas:s.visitas || 0,
    realizadas:s.realizadas || 0,
    liquidadas:s.liquidadas || 0,
    postulaciones:s.visitas || 0,
    promCuest:null,
    certs:0,
    sourceSafe:true,
    piiProtected:true
  }));

  const posts = visits.filter(v => ['asignada','agendada','fuera_rango','disponible'].includes(v.estado)).slice(0, 80).map((v,i)=>({
    id:`hr-post-${i+1}`,
    visitaId:v.id,
    tenantId,
    parentProjectId,
    projectId:v.projectId,
    periodId:v.periodId,
    periodKey:v.periodKey,
    shopperId:v.shopperId,
    shopper:v.shopper || 'Shopper protegido',
    shopperCode:v.shopperCode || '',
    sucursal:v.sucursal,
    ciudad:v.ciudad,
    pais:v.pais,
    quincena:v.quincena,
    franjaCode:v.franjaCode,
    honorario:v.honorario,
    boleto:v.boleto,
    comboAmt:v.comboAmt,
    currency:v.currency,
    fechaProp:v.agendada || v.disponibleDesde,
    disponibleDesde:v.disponibleDesde,
    estado:v.estado === 'disponible' ? 'pendiente' : 'aprobada',
    aprobadaPor:v.shopperId ? 'HR TyA' : null,
    reprog:v.estado === 'fuera_rango',
    sourceSafe:true,
    piiProtected:true
  }));

  CX.data.projects = projects;
  CX.data.shoppers = shoppers;
  CX.data._visitas = visits;
  CX.data._posts = posts;
  CX.data.currentProjectId = parentProjectId;
  CX.data.currentPeriodId = projects.some(p=>p.id===latestPeriodId) ? latestPeriodId : (projects[0] && projects[0].id);
  CX.data.sourceMode = hasLivePayload ? 'tya_hr_live_multitab_source_safe_dev' : 'tya_hr_live_pending';
  CX.data.previewMeta = {
    tenantId,
    projectId:parentProjectId,
    projectName:parentProjectName,
    activePeriodId:CX.data.currentPeriodId,
    sourceTitle:data.source && data.source.title,
    generatedAt:data.generatedAt,
    periods:data.counts && data.counts.periods,
    tabs:data.counts && data.counts.tabs,
    totalVisits:data.counts && data.counts.visits,
    countries:data.counts && data.counts.byCountry,
    production:false,
    imported:false,
    sourceSafe:true,
    piiProtected:true,
    note:'HR viva multihoja source-safe. Proyecto y periodo separados; datos personales protegidos hasta Auth/roles.'
  };

  CX.data.programBase = function(p){ return (p && (p.programLabel || p.baseName)) || parentProjectName; };
  CX.data.programKey = function(p){ return (p && (p.program || parentProjectId)).toLowerCase(); };
  CX.data.programs = function(){ return [{ key:parentProjectId, name:parentProjectName, sample:this.projects[0], periods:this.projects }]; };
  CX.data.periodsForProgram = function(key){ return key === parentProjectId ? this.projects : []; };
  CX.data.currentProgramKey = function(){ return this.currentProjectId || parentProjectId; };

  function markTopbar(){
    const tb=document.querySelector('.tb-demo');
    if(tb) tb.innerHTML='<span class="d"></span> DEV TyA · HR viva source-safe';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markTopbar);
  else markTopbar();
})();
