/* ============================================================
   CXOrbia · TyA Phase A source-safe DEV preview
   ------------------------------------------------------------
   Activo solo en host DEV o con ?cxTyaPhaseA=1.
   No contiene PII, no importa, no escribe, no conecta base vieja.
   Solo reemplaza la capa CX.data visible para validación Phase A.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = (window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  if(!enabled || !CX.data) return;

  window.CX_BACKEND_DEV = true;
  window.CX_TYA_PHASE_A_PREVIEW = true;

  try{
    localStorage.setItem('cx_demo_mode','off');
    localStorage.setItem('cx_theme','tya');
    localStorage.removeItem('cx_start_project');
  }catch(e){}

  CX.BRAND = Object.assign(CX.BRAND || {}, {
    clientName: 'TyA · Cinépolis',
    tagline: 'Phase A · operación controlada',
    theme: 'tya',
    demoMode: false,
    showAITag: true,
    countries: ['GT','HN']
  });

  const project = {
    id:'cinepolis-junio-2026',
    program:'cinepolis',
    periodo:'JUN 2026',
    name:'Cinépolis Junio 2026',
    client:'TyA',
    industry:'Mystery shopping · cines · GT/HN',
    countries:['GT','HN'],
    currency:{GT:'Q',HN:'L'},
    accent:'#2196d3',
    sucursales:44,
    honorario:{GT:60,HN:200},
    honRecibe:{GT:170,HN:520},
    modelo:'directo',
    isr:5,
    regalias:10,
    boleto:{GT:33,HN:127},
    combo:'Combo JUMBO',
    comboAmt:{GT:121,HN:291},
    scenarios:['Cinépolis · visita regular','Cinépolis · fin de semana','Cinépolis · VIP / formato especial'],
    quincenas:['Quincena 1','Quincena 2'],
    nVisitas:44,
    canales:['Visita presencial'],
    formato:'Mystery shopping cine',
    ronda:'JUN 2026',
    restriccion:'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
    cuestionario:{modo:'configurable', url:'', label:'CXOrbia / TyAOnline / externo / link por visita desde HR'},
    pago:{logica:'Junio se controla como liquidaciones/pagos; no como visitas pendientes.', diasPago:null, moneda:'local'},
    hrMap:{fuente:'HR TyA source-safe', cols:['País','Sucursal ref','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
    geoloc:false,
    conocimiento:'TyA/Cinépolis Phase A. Preview source-safe sin datos sensibles crudos.',
    sourceSafe:true,
    importStatus:'source_safe_preview_not_imported'
  };

  const cities = {
    GT:['Guatemala','Mixco','Villa Nueva','Quetzaltenango','Escuintla','Mazatenango','Cobán','Jutiapa'],
    HN:['Tegucigalpa','San Pedro Sula','Comayagua','La Ceiba','Choloma']
  };
  const pad = n => String(n).padStart(2,'0');
  const shoppers = [];
  for(let i=1;i<=30;i++) shoppers.push({
    id:'tya-gt-shopper-'+pad(i), code:'TYA-GT-'+pad(i), nombre:'Shopper GT '+pad(i), pais:'GT', ciudad:cities.GT[(i-1)%cities.GT.length], estado:i%5===0?'Certificado':'Activo', rating:4.4, visitas:0, postulaciones:0, promCuest:1.2, certs:1, sourceSafe:true, reviewRequired:false
  });
  for(let i=1;i<=12;i++) shoppers.push({
    id:'tya-hn-shopper-'+pad(i), code:'TYA-HN-'+pad(i), nombre:'Shopper HN '+pad(i), pais:'HN', ciudad:cities.HN[(i-1)%cities.HN.length], estado:i%4===0?'Certificado':'Activo', rating:4.3, visitas:0, postulaciones:0, promCuest:1.4, certs:1, sourceSafe:true, reviewRequired:false
  });

  function makeVisit(country, idx, status){
    const city = cities[country][(idx-1)%cities[country].length];
    const sh = shoppers.filter(s=>s.pais===country)[(idx-1)%shoppers.filter(s=>s.pais===country).length];
    const day = 2 + (idx % 24);
    const quincena = day <= 15 ? 'Quincena 1' : 'Quincena 2';
    const completed = '2026-06-'+pad(day);
    return {
      id:`cinepolis-jun26-${country.toLowerCase()}-${pad(idx)}`,
      hrRowId:`HR-JUN26-${country}-${pad(idx)}`,
      projectId:project.id,
      num:idx,
      sucursal:`Cinépolis ${country}-${pad(idx)} · ${city}`,
      ciudad:city,
      pais:country,
      currency:project.currency[country],
      quincena,
      escenario:idx%6===0?'Cinépolis · VIP / formato especial':(idx%3===0?'Cinépolis · fin de semana':'Cinépolis · visita regular'),
      franja:idx%3===0?'Fin de semana':'Semana',
      franjaCode:idx%3===0?'WKND':'WK',
      canal:'Visita presencial',
      formato:'Mystery shopping cine',
      honorario:project.honorario[country],
      boleto:project.boleto[country],
      combo:project.combo,
      comboAmt:project.comboAmt[country],
      estado:status,
      shopperId:sh.id,
      shopper:sh.nombre,
      shopperCode:sh.code,
      rango:quincena === 'Quincena 1' ? '1–15 jun' : '16–30 jun',
      disponibleDesde:'2026-06-'+pad(Math.max(1, day-4)),
      agendada:'2026-06-'+pad(Math.max(1, day-1)),
      realizada:completed,
      cuestFecha:status==='realizada'?null:'2026-06-'+pad(Math.min(30, day+1)),
      submit:status==='liquidada',
      submittedAt:status==='liquidada'?'2026-06-'+pad(Math.min(30, day+2)):null,
      assignmentSource:idx%2===0?'hr':'platform',
      assignmentSyncStatus:'preview_source_safe',
      reviewRequired:false,
      sourceSafe:true
    };
  }

  const visits = [];
  for(let i=1;i<=34;i++) visits.push(makeVisit('GT', i, i<=28?'liquidada':(i<=31?'cuestionario':'realizada')));
  for(let i=1;i<=10;i++) visits.push(makeVisit('HN', i, i<=8?'liquidada':(i===9?'cuestionario':'realizada')));

  shoppers.forEach(s=>{
    const mine = visits.filter(v=>v.shopperId===s.id);
    s.visitas = mine.length;
    s.postulaciones = mine.length;
  });

  const posts = visits.slice(0,8).map((v,i)=>({
    id:'tya-post-jun26-'+pad(i+1), visitaId:v.id, projectId:v.projectId,
    shopperId:v.shopperId, shopper:v.shopper, shopperCode:v.shopperCode,
    sucursal:v.sucursal, ciudad:v.ciudad, pais:v.pais, quincena:v.quincena, franjaCode:v.franjaCode,
    honorario:v.honorario, boleto:v.boleto, comboAmt:v.comboAmt, currency:v.currency,
    fechaProp:v.agendada, disponibleDesde:v.disponibleDesde,
    estado:'aprobada', aprobadaPor:v.assignmentSource==='hr'?'HR TyA':'Coordinación', reprog:false,
    sourceSafe:true
  }));

  CX.data.projects = [project];
  CX.data.shoppers = shoppers;
  CX.data._visitas = visits;
  CX.data._posts = posts;
  CX.data.currentProjectId = project.id;
  CX.data.sourceMode = 'tya_phase_a_source_safe_preview';
  CX.data.previewMeta = {
    tenantId:'tya', projectId:'cinepolis', period:'JUN 2026', totalVisits:44,
    countries:{GT:34,HN:10}, production:false, imported:false, sourceSafe:true,
    note:'Preview operativo TyA/Cinépolis con referencias opacas; no contiene PII ni datos bancarios.'
  };

  function markTopbar(){
    const tb=document.querySelector('.tb-demo');
    if(tb) tb.innerHTML='<span class="d"></span> DEV TyA · source-safe';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markTopbar);
  else markTopbar();
})();
