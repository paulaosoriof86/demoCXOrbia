/* ============================================================
   CXOrbia · TyA Phase A source-safe DEV preview
   ------------------------------------------------------------
   Activo solo en host DEV o con ?cxTyaPhaseA=1.
   No contiene DPI, banco, telefono, correo, HR URL privada ni workbook crudo.
   Reemplaza CX.data visible para validacion Phase A con snapshot HR source-safe.
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
    clientName: 'TyA',
    tagline: 'Tenant TyA · Phase A controlada',
    theme: 'tya',
    demoMode: false,
    showAITag: true,
    countries: ['GT','HN']
  });

  const currency = {GT:'Q', HN:'L'};
  const honorario = {GT:60, HN:200};
  const boletoDefault = {GT:0, HN:0};
  const comboDefault = {GT:0, HN:0};
  const programId = 'cinepolis';

  function projectForPeriod(periodKey, label, visitCount, gt, hn){
    return {
      id:'cinepolis-'+periodKey,
      program:programId,
      periodo:label,
      name:'Cinépolis '+label,
      client:'TyA',
      industry:'Mystery shopping · cines · GT/HN',
      countries:['GT','HN'],
      currency,
      accent:'#2196d3',
      sucursales:visitCount,
      honorario,
      honRecibe:{GT:null,HN:null},
      modelo:'directo',
      isr:5,
      regalias:10,
      boleto:boletoDefault,
      combo:'Configurable por visita HR',
      comboAmt:comboDefault,
      scenarios:['Cinépolis · visita regular','Cinépolis · fin de semana','Cinépolis · VIP / formato especial'],
      quincenas:['Quincena 1','Quincena 2'],
      nVisitas:visitCount,
      canales:['Visita presencial'],
      formato:'Mystery shopping cine',
      ronda:label,
      restriccion:'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
      cuestionario:{modo:'configurable', url:'', label:'CXOrbia / TyAOnline / externo / link por visita desde HR'},
      pago:{logica:'Pagos y liquidaciones se controlan por submitido y cruce financiero.', diasPago:null, moneda:'local'},
      hrMap:{fuente:'HR TyA source-safe', cols:['País','ID cinema','Shopping','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
      geoloc:false,
      conocimiento:'TyA/Cinépolis Phase A. Proyecto normal configurable dentro del tenant TyA.',
      sourceSafe:true,
      importStatus:'hr_source_safe_snapshot_not_imported',
      snapshotCounts:{GT:gt,HN:hn,total:visitCount}
    };
  }

  const projects = [
    projectForPeriod('jun26','JUN 2026',44,34,10),
    projectForPeriod('jul26','JUL 2026',44,34,10)
  ];

  const julyGtRows = [
    ['GT',2,'2022002','Cd. Guatemala','C. Miraflores','RH WKND','TRADICIONAL','Combo Nachos','WEB','QUINCENA 1','2026-07-05','', 'P x Agendar'],
    ['GT',3,'2022003','Cd. Guatemala','C. Oakland Mall','RH WKND','TRADICIONAL','Combo Nachos','TAQ','QUINCENA 1','2026-07-04','2026-07-05','OK',45,115],
    ['GT',4,'2022004','Cd. Guatemala','C. Oakland Mall VIP','RH WKND','VIP','Combo Hotdog','APP','QUINCENA 1','2026-07-04','2026-07-12','OK'],
    ['GT',5,'2022005','Cd. Guatemala','C. Portales','RH WKND','TRADICIONAL','Combo Nachos','WEB','QUINCENA 1','2026-07-05','2026-07-12','OK'],
    ['GT',6,'2022006','Cd. Guatemala','C. Paseo Cayalá','RH WKND','TRADICIONAL','Combo Hotdog','TAQ','QUINCENA 1','2026-07-11','2026-07-12','OK'],
    ['GT',7,'2022007','Villa Nueva','MC. Santa Clara','RH WKND','MI CINE','Combo Nachos','APP','QUINCENA 1','2026-07-05','','P x Asignar'],
    ['GT',8,'2022008','Mazatenango','MC. Plaza Américas','RH WK','MI CINE','Combo Hotdog','WEB','QUINCENA 1','2026-07-07','','P x Asignar'],
    ['GT',9,'2022010','Villa Nueva','MC. El Frutal','RH WKND','MI CINE','Combo Nachos','TAQ','QUINCENA 1','2026-07-11','','P x Asignar'],
    ['GT',10,'2022011','Mixco','C. Naranjo Mall','RH WKND','TRADICIONAL','Combo Hotdog','APP','QUINCENA 1','2026-07-04','2026-07-04','OK'],
    ['GT',11,'2022012','Cd. Guatemala','C. Parque las Américas','RH WKND','TRADICIONAL','Combo Nachos','WEB','QUINCENA 1','2026-07-04','2026-07-11','OK'],
    ['GT',12,'2022013','San Cristobal','C. Sankris Mall','RH WK','TRADICIONAL','Combo Hotdog','TAQ','QUINCENA 1','2026-07-06','2026-07-09','OK'],
    ['GT',13,'2022009','Quetzaltenango','C. Utz Ulew Mall','RH WKND','TRADICIONAL','Combo Nachos','APP','QUINCENA 1','2026-07-11','','P x Agendar'],
    ['GT',14,'2022016','Quetzaltenango','C. Interplaza Xela','RH WK','TRADICIONAL','Combo Hotdog','WEB','QUINCENA 1','2026-07-01','2026-07-09','OK'],
    ['GT',15,'2022014','Cd. Guatemala','C. Russ Mall','RH WKND','TRADICIONAL','Combo Nachos','TAQ','QUINCENA 1','2026-07-11','2026-07-11','OK'],
    ['GT',16,'2022017','Jutiapa','MC. Jutiapa','RH WK','MI CINE','Combo Hotdog','APP','QUINCENA 1','2026-07-06','','P x Asignar'],
    ['GT',17,'2022022','Carchá','MC. Carchá','RH WKND','MI CINE','Combo Nachos','WEB','QUINCENA 1','2026-07-11','','P x Asignar'],
    ['GT',18,'2022024','Zacapa','MC. Pradera Zacapa','RH WK','MI CINE','Combo Hotdog','TAQ','QUINCENA 1','2026-07-01','','P x Asignar'],
    ['GT',19,'2022002','Cd. Guatemala','C. Miraflores','RH WKND','TRADICIONAL','Combo Nachos','TAQ','QUINCENA 2','P1Q','2026-07-18','Fuera de rango'],
    ['GT',20,'2022003','Cd. Guatemala','C. Oakland Mall','RH WKND','TRADICIONAL','Combo Hotdog','APP','QUINCENA 2','P1Q','2026-07-18','Fuera de rango'],
    ['GT',21,'2022004','Cd. Guatemala','C. Oakland Mall VIP','RH WKND','VIP','Combo Nachos','WEB','QUINCENA 2','P1Q','2026-07-18','Fuera de rango'],
    ['GT',22,'2022005','Cd. Guatemala','C. Portales','RH WKND','TRADICIONAL','Combo Hotdog','TAQ','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',23,'2022006','Cd. Guatemala','C. Paseo Cayalá','RH WKND','TRADICIONAL','Combo Nachos','APP','QUINCENA 2','P1Q','2026-07-26','Fuera de rango'],
    ['GT',24,'2022007','Villa Nueva','MC. Santa Clara','RH WK','MI CINE','Combo Hotdog','WEB','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',25,'2022008','Mazatenango','MC. Plaza Américas','RH WKND','MI CINE','Combo Nachos','TAQ','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',26,'2022010','Villa Nueva','MC. El Frutal','RH WK','MI CINE','Combo Hotdog','APP','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',27,'2022011','Mixco','C. Naranjo Mall','RH WKND','TRADICIONAL','Combo Nachos','WEB','QUINCENA 2','P1Q','2026-07-19','Fuera de rango'],
    ['GT',28,'2022012','Cd. Guatemala','C. Parque las Américas','RH WK','TRADICIONAL','Combo Hotdog','TAQ','QUINCENA 2','P1Q','2026-07-17','Fuera de rango'],
    ['GT',29,'2022013','San Cristobal','C. Sankris Mall','RH WKND','TRADICIONAL','Combo Nachos','APP','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',30,'2022009','Quetzaltenango','C. Utz Ulew Mall','RH WK','TRADICIONAL','Combo Hotdog','WEB','QUINCENA 2','P1Q','','P x Agendar'],
    ['GT',31,'2022016','Quetzaltenango','C. Interplaza Xela','RH WKND','TRADICIONAL','Combo Nachos','TAQ','QUINCENA 2','P1Q','','P x Agendar'],
    ['GT',32,'2022014','Cd. Guatemala','C. Russ Mall','RH WK','TRADICIONAL','Combo Hotdog','APP','QUINCENA 2','P1Q','2026-07-30','Fuera de rango'],
    ['GT',33,'2022017','Jutiapa','MC. Jutiapa','RH WKND','MI CINE','Combo Nachos','WEB','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',34,'2022022','Carchá','MC. Carchá','RH WK','MI CINE','Combo Hotdog','TAQ','QUINCENA 2','P1Q','','P x Asignar'],
    ['GT',35,'2022024','Zacapa','MC. Pradera Zacapa','RH WKND','MI CINE','Combo Nachos','APP','QUINCENA 2','P1Q','','P x Agendar']
  ];

  const julyHnRows = [
    ['HN',2,'2052001','Tegucigalpa','C. Las Cascadas Honduras','RH WKND','TRADICIONAL','Combo Nachos','WEB','QUINCENA 1','2026-07-11','2026-07-11','OK'],
    ['HN',3,'2052002','Tegucigalpa','C. VIP Las Cascadas','RH WKND','VIP','Combo Nachos','TAQ','QUINCENA 1','2026-07-04','','P x Agendar'],
    ['HN',4,'2052003','San Pedro Sula','C. Altara','RH WKND','TRADICIONAL','Combo Hotdog','APP','QUINCENA 1','2026-07-11','','P x Asignar'],
    ['HN',5,'2052004','Comayaguela','C. Mall Premier','RH WK','MI CINE','Combo Nachos','WEB','QUINCENA 1','2026-07-06','','P x Agendar'],
    ['HN',6,'2052005','Juticalpa','C. Mall Premier Juticalpa','RH WKND','MI CINE','Combo Hotdog','TAQ','QUINCENA 1','2026-07-04','','P x Agendar'],
    ['HN',7,'2052001','Tegucigalpa','C. Las Cascadas Honduras','RH WKND','TRADICIONAL','Combo Nachos','TAQ','QUINCENA 2','P1Q','','P x Asignar'],
    ['HN',8,'2052002','Tegucigalpa','C. VIP Las Cascadas','RH WKND','VIP','Combo Hotdog','APP','QUINCENA 2','P1Q','','P x Asignar'],
    ['HN',9,'2052003','San Pedro Sula','C. Altara','RH WK','TRADICIONAL','Combo Nachos','WEB','QUINCENA 2','P1Q','','P x Asignar'],
    ['HN',10,'2052004','Comayaguela','C. Mall Premier','RH WKND','MI CINE','Combo Hotdog','TAQ','QUINCENA 2','P1Q','','P x Asignar'],
    ['HN',11,'2052005','Juticalpa','C. Mall Premier Juticalpa','RH WK','MI CINE','Combo Nachos','APP','QUINCENA 2','P1Q','','P x Asignar']
  ];

  const shoppersByRef = {};
  function shopperFor(row){
    const ref = `${row[0]}-${String(row[1]).padStart(2,'0')}`;
    if(!shoppersByRef[ref]){
      shoppersByRef[ref] = {id:'hr-shopper-ref-'+ref.toLowerCase(), code:'HR-'+ref, nombre:'Shopper HR ref '+ref, pais:row[0], ciudad:row[3], estado:'Asignado en HR', rating:null, visitas:0, postulaciones:0, promCuest:null, certs:0, sourceSafe:true, reviewRequired:false};
    }
    return shoppersByRef[ref];
  }

  function statusFromControl(control, scheduled, completed, questionnaire, submitted){
    const c = String(control || '').toLowerCase();
    if(c.includes('fuera')) return 'fuera_rango';
    if(submitted) return 'liquidada';
    if(questionnaire) return 'cuestionario';
    if(completed) return 'realizada';
    if(scheduled) return 'agendada';
    if(c.includes('agendar')) return 'asignada';
    if(c.includes('asignar')) return 'disponible';
    if(c.includes('ok')) return scheduled ? 'agendada' : 'asignada';
    return 'disponible';
  }

  function toVisit(periodId, row, idx){
    const [country, hrRow, cinemaId, city, branch, franja, formato, combo, canal, quincena, available, scheduled, control, completed, questionnaire, boleto, comboAmt, honor, reviewer, submitted] = row;
    const shopper = shopperFor(row);
    const status = statusFromControl(control, scheduled, completed, questionnaire, submitted);
    return {
      id:`${periodId}-${country.toLowerCase()}-${String(hrRow).padStart(2,'0')}`,
      hrRowId:`${periodId.toUpperCase()}-${country}-${hrRow}`,
      projectId:periodId,
      num:idx,
      cinemaId,
      sucursal:branch,
      ciudad:city,
      pais:country,
      currency:currency[country],
      quincena:String(quincena || '').replace('QUINCENA','Quincena'),
      escenario:formato || 'Cinépolis',
      franja: String(franja || '').includes('WKND') ? 'Fin de semana' : 'Semana',
      franjaCode:String(franja || '').includes('WKND') ? 'WKND' : 'WK',
      canal:canal || 'Visita presencial',
      formato:formato || 'Mystery shopping cine',
      honorario:Number(String(honor||'').replace(/[^0-9.]/g,'')) || honorario[country],
      boleto:Number(String(boleto||'').replace(/[^0-9.]/g,'')) || 0,
      combo:combo || 'Configurable por HR',
      comboAmt:Number(String(comboAmt||'').replace(/[^0-9.]/g,'')) || 0,
      estado:status,
      shopperId: status==='disponible' ? null : shopper.id,
      shopper: status==='disponible' ? null : shopper.nombre,
      shopperCode: status==='disponible' ? null : shopper.code,
      rango:quincena || '',
      disponibleDesde:available || '',
      agendada:scheduled || null,
      realizada:completed || null,
      cuestFecha:questionnaire || null,
      submit:!!submitted,
      submittedAt:submitted || null,
      assignmentSource:'hr',
      assignmentSyncStatus:'source_safe_snapshot',
      reviewRequired: status==='fuera_rango' || String(control||'').toLowerCase().includes('asignar'),
      sourceSafe:true
    };
  }

  function makeJuneSummary(){
    const visits = [];
    for(let i=1;i<=34;i++) visits.push({projectId:'cinepolis-jun26', pais:'GT', id:'cinepolis-jun26-gt-'+String(i).padStart(2,'0'), hrRowId:'JUN26-GT-'+i, num:i, sucursal:'Sucursal HR GT '+String(i).padStart(2,'0'), ciudad:'GT', currency:'Q', quincena:i<=17?'Quincena 1':'Quincena 2', estado:'liquidada', shopperId:'hr-shopper-ref-gt-'+String(i).padStart(2,'0'), shopper:'Shopper HR ref GT-'+String(i).padStart(2,'0'), shopperCode:'HR-GT-'+String(i).padStart(2,'0'), realizada:'2026-06', cuestFecha:'2026-06', submit:true, sourceSafe:true, assignmentSource:'hr', assignmentSyncStatus:'source_safe_snapshot'});
    for(let i=1;i<=10;i++) visits.push({projectId:'cinepolis-jun26', pais:'HN', id:'cinepolis-jun26-hn-'+String(i).padStart(2,'0'), hrRowId:'JUN26-HN-'+i, num:34+i, sucursal:'Sucursal HR HN '+String(i).padStart(2,'0'), ciudad:'HN', currency:'L', quincena:i<=5?'Quincena 1':'Quincena 2', estado:'liquidada', shopperId:'hr-shopper-ref-hn-'+String(i).padStart(2,'0'), shopper:'Shopper HR ref HN-'+String(i).padStart(2,'0'), shopperCode:'HR-HN-'+String(i).padStart(2,'0'), realizada:'2026-06', cuestFecha:'2026-06', submit:true, sourceSafe:true, assignmentSource:'hr', assignmentSyncStatus:'source_safe_snapshot'});
    return visits;
  }

  const julyRows = [...julyGtRows, ...julyHnRows];
  const julyVisits = julyRows.map((row, idx)=>toVisit('cinepolis-jul26', row, idx+1));
  const juneVisits = makeJuneSummary();
  const visits = [...juneVisits, ...julyVisits];
  const shoppers = Object.values(shoppersByRef);
  visits.forEach(v=>{ if(v.shopperId){ let s=shoppers.find(x=>x.id===v.shopperId); if(s){ s.visitas++; s.postulaciones++; } } });

  const posts = julyVisits.filter(v=>['disponible','asignada','agendada','fuera_rango'].includes(v.estado)).slice(0,12).map((v,i)=>({
    id:'tya-post-jul26-'+String(i+1).padStart(2,'0'), visitaId:v.id, projectId:v.projectId,
    shopperId:v.shopperId, shopper:v.shopper || 'Sin shopper asignado', shopperCode:v.shopperCode || 'PENDIENTE',
    sucursal:v.sucursal, ciudad:v.ciudad, pais:v.pais, quincena:v.quincena, franjaCode:v.franjaCode,
    honorario:v.honorario, boleto:v.boleto, comboAmt:v.comboAmt, currency:v.currency,
    fechaProp:v.agendada || v.disponibleDesde, disponibleDesde:v.disponibleDesde,
    estado:v.estado==='disponible'?'pendiente':'aprobada', aprobadaPor:'HR TyA', reprog:v.estado==='fuera_rango', sourceSafe:true
  }));

  CX.data.projects = projects;
  CX.data.shoppers = shoppers;
  CX.data._visitas = visits;
  CX.data._posts = posts;
  CX.data.currentProjectId = 'cinepolis-jul26';
  CX.data.sourceMode = 'tya_phase_a_hr_source_safe_snapshot';
  CX.data.previewMeta = {
    tenantId:'tya', projectId:'cinepolis', currentPeriod:'JUL 2026', periods:['JUN 2026','JUL 2026'],
    totalVisits:44, countries:{GT:34,HN:10}, production:false, imported:false, sourceSafe:true,
    note:'Snapshot HR source-safe. Public preview keeps shopper refs opaque; full names/phones/email require protected Auth/backend.'
  };

  function markTopbar(){
    const tb=document.querySelector('.tb-demo');
    if(tb) tb.innerHTML='<span class="d"></span> DEV TyA · HR source-safe';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markTopbar);
  else markTopbar();
})();
