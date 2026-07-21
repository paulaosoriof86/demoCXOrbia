/* CXOrbia TyA Phase A — apply a fresh HR snapshot in place.
   Adapter only: no page reload, no UI-module patch, no writes or production. */
window.CX = window.CX || {};
(function(){
  const periodId=key=>'cinepolis-'+String(key||'pending');
  const currency={GT:'Q',HN:'L'};
  const safeArray=value=>Array.isArray(value)?value:[];
  const latestOf=periods=>periods.slice().sort((a,b)=>String(a.periodKey).localeCompare(String(b.periodKey))).at(-1)||periods[0]||null;

  function mapPeriods(snapshot){
    return safeArray(snapshot.periods).map(p=>Object.assign({},p,{
      id:periodId(p.key),tenantId:'tya',rootProjectId:'cinepolis',program:'cinepolis',programLabel:'Cinépolis',
      projectId:periodId(p.key),periodKey:p.key,periodo:p.label,
      name:p.internalName||('Cinépolis '+(p.fullLabel||p.label||p.key)),client:'TyA',
      industry:'Mystery shopping · cines · GT/HN',countries:['GT','HN'],currency,accent:'#2196d3',
      sucursales:Number(p.total||0),nVisitas:Number(p.total||0),honorario:{GT:60,HN:200},honRecibe:{GT:null,HN:null},
      modelo:'directo',isr:5,regalias:10,boleto:{GT:0,HN:0},combo:'Configurable por visita HR',comboAmt:{GT:0,HN:0},
      scenarios:['Cinépolis · visita regular','Cinépolis · fin de semana','Cinépolis · VIP / formato especial'],
      quincenas:['Quincena 1','Quincena 2'],canales:['Visita presencial'],formato:'Mystery shopping cine',ronda:p.label,
      restriccion:'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
      cuestionario:{modo:'configurable',url:'',label:'CXOrbia / TyAOnline / externo / link por visita desde HR'},
      pago:{logica:'Pagos y liquidaciones se controlan por submitido y cruce financiero.',diasPago:null,moneda:'local'},
      hrMap:{fuente:'HR TyA multihoja source-safe',cols:['País','ID cinema','Shopping','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
      geoloc:false,conocimiento:'TyA/Cinépolis Phase A. Proyecto normal configurable dentro del tenant TyA.',
      sourceSafe:true,importStatus:'hr_live_runtime_source_safe_not_imported',runtimeSyncActive:false,
      snapshotCounts:p.countries||{GT:0,HN:0,total:Number(p.total||0)}
    }));
  }

  function mapVisits(snapshot){
    return safeArray(snapshot.visits).map((v,idx)=>Object.assign({},v,{
      id:v.id||('hr-live-'+(idx+1)),tenantId:'tya',rootProjectId:'cinepolis',projectId:periodId(v.periodKey),
      periodKey:v.periodKey,periodLabel:v.periodLabel,hrRowId:v.hrRowId,sourceTab:v.sourceTab,sourceRow:v.sourceRow,
      num:idx+1,sucursal:v.sucursal||'Sucursal HR',ciudad:v.ciudad||'',pais:v.pais||v.country,
      country:v.country||v.pais,currency:v.currency||currency[v.pais||v.country]||'',quincena:v.quincena||'',
      escenario:v.escenario||v.tipoCompra||'',franja:v.franja||'',franjaCode:v.franjaCode||null,canal:'Visita presencial',
      formato:v.formato||'Mystery shopping cine',honorario:Number(v.honorario||0),boleto:Number(v.boleto||0),
      combo:v.tipoCombo||'Configurable por HR',comboAmt:Number(v.comboAmt||0),estado:v.estado||'disponible',
      shopperId:v.shopperId||null,shopper:v.shopper||null,shopperCode:v.shopperCode||null,rango:v.quincena||'',
      disponibleDesde:v.disponibleDesde||null,agendada:v.agendada||null,realizada:v.realizada||null,
      cuestFecha:v.cuestFecha||null,submit:Boolean(v.submit||v.submittedAt||v.submissionState==='confirmed_hr'),submittedAt:v.submittedAt||null,
      assignmentSource:v.assignmentSource||(v.hasShopper?'hr':null),assignmentSyncStatus:v.assignmentSyncStatus||'hr_live_source_safe_preview',
      lastSyncedAt:v.lastSyncedAt||null,reviewRequired:v.reviewRequired===true,reviewReasons:safeArray(v.reviewReasons),
      sourceSafe:true,piiProtected:true
    }));
  }

  function mapShoppers(snapshot){
    return safeArray(snapshot.shoppers).map((s,idx)=>Object.assign({},s,{
      id:s.id||('shopper-protegido-'+(idx+1)),shopperId:s.shopperId||s.id||('shopper-protegido-'+(idx+1)),
      code:s.code||('TYA-SH-'+(idx+1)),nombre:s.nombre||'Shopper protegido',pais:s.pais||null,ciudad:s.ciudad||'',
      estado:s.estado??null,status:s.status??null,rating:s.rating??null,honorarioPref:s.honorarioPref??null,
      perfilCompleto:s.perfilCompleto===true,firstName:s.firstName||'',lastName:s.lastName||'',whatsapp:'',phone:'',email:'',dpi:'',banco:'',ctaNum:'',
      dataLevel:s.dataLevel||'protected_reference',operationalProfileAvailable:s.operationalProfileAvailable===true,
      sourceHistoricalVisitCount:Number(s.sourceHistoricalVisitCount??s.visitas??0),
      sourceHistoricalRealizedCount:Number(s.sourceHistoricalRealizedCount??s.realizadas??0),
      sourceHistoricalLiquidatedCount:Number(s.sourceHistoricalLiquidatedCount??s.liquidadas??0),
      visitas:undefined,realizadas:undefined,liquidadas:undefined,postulaciones:undefined,promCuest:null,certs:Number(s.certs||0),
      sourceSafe:true,piiProtected:true
    }));
  }

  function mapPosts(visits){
    return visits.filter(v=>['asignada','agendada','fuera_rango','disponible'].includes(v.estado)).slice(0,80).map((v,i)=>({
      id:'hr-post-'+(i+1),visitaId:v.id,projectId:v.projectId,rootProjectId:'cinepolis',shopperId:v.shopperId,
      shopper:v.shopper||'Shopper protegido',shopperCode:v.shopperCode||'',sucursal:v.sucursal,ciudad:v.ciudad,
      pais:v.pais,quincena:v.quincena,franjaCode:v.franjaCode,honorario:v.honorario,boleto:v.boleto,
      comboAmt:v.comboAmt,currency:v.currency,fechaProp:v.agendada||v.disponibleDesde,disponibleDesde:v.disponibleDesde,
      estado:v.estado==='disponible'?'pendiente':'aprobada',aprobadaPor:v.shopperId?'HR TyA':null,
      reprog:v.estado==='fuera_rango',sourceSafe:true,piiProtected:true
    }));
  }

  function refreshBadge(){
    try{
      const db=document.getElementById('tbDataBadge');
      if(db&&CX.dataSource){const b=CX.dataSource.badge();db.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;}
    }catch(e){}
  }

  function applySnapshot(snapshot,meta={},options={}){
    const valid=!!(snapshot&&snapshot.sourceSafe===true&&snapshot.imported!==true&&snapshot.production!==true&&safeArray(snapshot.periods).length&&safeArray(snapshot.visits).length&&CX.data);
    if(!valid)throw new Error('Snapshot HR live inválido o vacío.');
    const previousPeriodKey=(()=>{try{return CX.data.period&&CX.data.period()?.periodKey||null;}catch(e){return null;}})();
    const periods=mapPeriods(snapshot),visits=mapVisits(snapshot),shoppers=mapShoppers(snapshot),posts=mapPosts(visits);
    const latest=latestOf(periods);
    const preferred=periods.find(p=>p.periodKey===previousPeriodKey)||periods.find(p=>p.periodKey===meta.latestPeriodKey)||latest;

    window.CX_TYA_HR_SOURCE_SAFE=snapshot;
    window.CX_TYA_HR_LIVE_META=Object.assign({},meta,{runtimeRead:true,sourceSafe:true});
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;
    window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    window.CX_TYA_VISIBLE_DATA_READY=true;

    CX.BRAND=Object.assign(CX.BRAND||{},{id:'tya',tenantId:'tya',clientName:'TyA',name:'TyA',tagline:'Tenant TyA · Phase A controlada',demoMode:false,countries:['GT','HN']});
    CX.data.projects=periods;
    CX.data.shoppers=shoppers;
    CX.data._visitas=visits;
    CX.data._posts=posts;
    CX.data.currentProjectId='cinepolis';
    CX.data.currentPeriodId=preferred&&preferred.id;
    CX.data.periodOperationalSummary=safeArray(snapshot.periodOperationalSummary);
    CX.data.sourceMode='tya_hr_live_runtime_source_safe_dev';
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
      tenantId:'tya',projectId:'cinepolis',projectName:'Cinépolis',sourceTitle:snapshot.source&&snapshot.source.title,
      generatedAt:snapshot.generatedAt||meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,sourceRevision:meta.revision||null,
      periods:periods.length,tabs:snapshot.counts&&snapshot.counts.tabs,totalVisits:visits.length,countries:snapshot.counts&&snapshot.counts.byCountry,
      production:false,imported:false,sourceSafe:true,piiProtected:true,runtimeSyncActive:false,runtimeReadActive:true,revisionStable:true,
      note:'Lectura HR viva source-safe aplicada en memoria sin recargar la aplicación.'
    });

    if(CX.dataSource){
      CX.dataSource.mode='connected';
      CX.dataSource.status='ready';
      CX.dataSource.sourceRef='hr-live-runtime:tya:cinepolis';
      CX.dataSource.updatedAt=meta.sourceReadAt||meta.generatedAt||new Date().toISOString();
      CX.dataSource.runtimeSyncActive=false;
      CX.dataSource.runtimeReadActive=true;
      CX.dataSource.updating=false;
      CX.dataSource.warnings=[];
      CX.dataSource.blockers=[];
      try{localStorage.setItem('cx_data_mode','connected');localStorage.setItem('cx_demo_mode','off');}catch(e){}
    }

    window.CX_TYA_VISIBLE_DATA_CONTRACT={
      tenantId:'tya',rootProjectId:'cinepolis',projectName:'Cinépolis',periodCount:periods.length,
      uniquePeriodIds:new Set(periods.map(p=>p.id)).size,visitCount:visits.length,shopperCount:shoppers.length,
      currentPeriodId:CX.data.currentPeriodId,currentPeriodVisits:CX.data.visitas?CX.data.visitas().length:0,
      sourceRevision:meta.revision||null,sourceReadAt:meta.sourceReadAt||null,
      genericProjectCount:periods.filter(p=>['retail','banca','food'].includes(p.id)).length,
      sourceSafe:true,imported:false,production:false,runtimeSyncActive:false,runtimeReadActive:true
    };

    if(typeof window.CX_TYA_BUILD_CORTE1_REPORTS==='function')window.CX_TYA_BUILD_CORTE1_REPORTS(snapshot,meta);
    if(CX.clienteData&&typeof CX.clienteData.invalidate==='function')CX.clienteData.invalidate();
    refreshBadge();
    document.documentElement.setAttribute('data-cx-tenant','tya');
    document.documentElement.setAttribute('data-cx-project','cinepolis');
    document.documentElement.setAttribute('data-cx-source','hr-live');
    if(CX.bus&&typeof CX.bus.emit==='function')CX.bus.emit('visit-flow',{sourceRevision:meta.revision||null,reason:options.reason||'live_refresh'});
    try{window.dispatchEvent(new CustomEvent('cx:live-source-updated',{detail:{revision:meta.revision||null,sourceReadAt:meta.sourceReadAt||null,reason:options.reason||'live_refresh'}}));}catch(e){}
    return {ok:true,revision:meta.revision||null,periods:periods.length,visits:visits.length,currentPeriodId:CX.data.currentPeriodId};
  }

  window.CX_TYA_APPLY_LIVE_SNAPSHOT=applySnapshot;
})();
