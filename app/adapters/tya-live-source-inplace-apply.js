/* CXOrbia TyA Phase A — apply a fresh HR snapshot in place.
   Adapter only: no page reload, no UI-module patch, no writes or production. */
window.CX = window.CX || {};
(function(){
  const safeArray=value=>Array.isArray(value)?value:[];
  const latestOf=periods=>periods.slice().sort((a,b)=>String(a.periodKey).localeCompare(String(b.periodKey))).at(-1)||periods[0]||null;
  const str=value=>String(value==null?'':value).trim();
  const periodId=(projectId,key)=>projectId+'-'+String(key||'pending');
  function sourceIdentity(snapshot){
    const tenantId=str(snapshot?.tenantId||snapshot?.tenantConfig?.tenantId);
    const projectId=str(snapshot?.projectId||snapshot?.projectConfig?.projectId);
    if(!tenantId||!projectId)throw new Error('HR_LIVE_SCOPE_REQUIRED');
    const projectName=str(snapshot?.projectName||snapshot?.projectConfig?.projectName||snapshot?.projectConfig?.name||projectId);
    const projectConfig=snapshot?.projectConfig&&typeof snapshot.projectConfig==='object'?snapshot.projectConfig:{};
    const countrySet=new Set(safeArray(projectConfig.countries).map(str).filter(Boolean));
    for(const v of safeArray(snapshot?.visits)){const c=str(v?.pais||v?.country);if(c)countrySet.add(c);}
    const currency=Object.assign({},projectConfig.currency||projectConfig.currencies||{});
    for(const v of safeArray(snapshot?.visits)){const c=str(v?.pais||v?.country),cur=str(v?.currency||v?.moneda);if(c&&cur&&!currency[c])currency[c]=cur;}
    return {tenantId,projectId,projectName,tenantName:str(snapshot?.tenantName||snapshot?.tenantConfig?.name||tenantId),countries:[...countrySet],currency,projectConfig};
  }

  /* B10: provider authority is scoped in projectConfig.questionnaireSource.
     Absence of a legacy cuestionario object MUST NOT silently select the internal demo form. */
  function resolveScopedQuestionnaire(projectConfig){
    const base={modo:'interna',url:'',label:'Cuestionario del proyecto'};
    const configured=Object.assign({},base,projectConfig.cuestionario||{});
    const providerName=str(projectConfig.questionnaireSource);
    const external=providerName&&!/^(?:internal|interno|interna|platform|plataforma)$/i.test(providerName);
    if(!external)return configured;
    const mode=str((projectConfig.cuestionario||{}).modo).toLowerCase();
    if(!mode)return Object.assign({},configured,{modo:'externo_proveedor',url:'',etiqueta:providerName,providerSource:providerName});
    if(mode==='interna'||mode==='internal')return Object.assign({},configured,{modo:'fuente_pendiente',url:'',etiqueta:providerName,providerSource:providerName,sourceConflict:true});
    return Object.assign({},configured,{providerSource:providerName});
  }

  function mapPeriods(snapshot,identity){
    return safeArray(snapshot.periods).map(p=>Object.assign({},p,{
      id:periodId(identity.projectId,p.key),tenantId:identity.tenantId,rootProjectId:identity.projectId,program:identity.projectId,programLabel:identity.projectName,
      projectId:identity.projectId,projectName:identity.projectName,periodId:periodId(identity.projectId,p.key),periodKey:p.key,
      periodLabel:p.fullLabel||p.label||p.key,periodo:p.fullLabel||p.label||p.key,
      name:identity.projectName,sourcePeriodName:p.internalName||p.fullLabel||p.label||p.key,client:identity.projectConfig.client||identity.tenantName,
      industry:identity.projectConfig.industry||'Mystery shopping',countries:identity.countries,currency:identity.currency,accent:'#2196d3',
      sucursales:Number(identity.projectConfig.sucursales||p.total||0),nVisitas:Number(p.total||0),honorario:identity.projectConfig.honorario||{},honRecibe:identity.projectConfig.honorarioRecibe||identity.projectConfig.honRecibe||{},
      modelo:identity.projectConfig.modelo||'directo',isr:Number(identity.projectConfig.isr??5),regalias:Number(identity.projectConfig.regalias??10),boleto:identity.projectConfig.boleto||{},combo:'Configurable por visita HR',comboAmt:identity.projectConfig.comboAmt||{},
      scenarios:safeArray(identity.projectConfig.scenarios),scenarioDimensions:safeArray(identity.projectConfig.scenarioDimensions).map(x=>Object.assign({},x)),
      quincenas:safeArray(identity.projectConfig.quincenas).length?safeArray(identity.projectConfig.quincenas):['Quincena 1','Quincena 2'],canales:['Visita presencial'],formato:identity.projectConfig.formato||'Mystery shopping',ronda:p.label,periodicidad:identity.projectConfig.periodicidad||null,periodoCumpl:identity.projectConfig.periodoCumpl||null,
      restriccion:'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
      cuestionario:resolveScopedQuestionnaire(identity.projectConfig),
      questionnaireProgram:(identity.projectConfig.questionnaireProgramsByPeriod&&identity.projectConfig.questionnaireProgramsByPeriod[periodId(identity.projectId,p.key)])||null,
      questionnaireProgramAuthority:(identity.projectConfig.questionnaireProgramsByPeriod&&identity.projectConfig.questionnaireProgramsByPeriod[periodId(identity.projectId,p.key)])?'firestore_project_config':null,
      pago:{logica:'Pagos y liquidaciones se controlan por submitido y cruce financiero.',diasPago:null,moneda:'local'},
      hrMap:{fuente:'HR TyA multihoja source-safe',cols:['País','ID cinema','Shopping','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
      geoloc:false,conocimiento:p.conocimiento||p.projectSummary||p.summary||'',
      sourceSafe:true,importStatus:'hr_live_runtime_source_safe_not_imported',runtimeSyncActive:false,
      snapshotCounts:p.countries||{GT:0,HN:0,total:Number(p.total||0)}
    }));
  }

  function mapVisits(snapshot,identity){
    const rows=safeArray(snapshot.visits);
    const knownAmount=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
    const reimbursementScopes=new Map();
    for(const row of rows){
      const scope=str(row?.periodKey)+'::'+str(row?.pais||row?.country);
      const current=reimbursementScopes.get(scope)||{boleto:false,comboAmt:false};
      if(knownAmount(row?.boleto))current.boleto=true;
      if(knownAmount(row?.comboAmt))current.comboAmt=true;
      reimbursementScopes.set(scope,current);
    }
    return rows.map((v,idx)=>{
      const scope=str(v?.periodKey)+'::'+str(v?.pais||v?.country),expected=reimbursementScopes.get(scope)||{boleto:false,comboAmt:false};
      const country=str(v?.pais||v?.country);
      const boletoKnown=knownAmount(v?.boleto),comboKnown=knownAmount(v?.comboAmt),honorarioKnown=knownAmount(v?.honorario);
      const configuredHonorario=identity.projectConfig?.honorario?.[country];
      const configuredHonorarioKnown=knownAmount(configuredHonorario);
      const honorario=honorarioKnown?Number(v.honorario):(configuredHonorarioKnown?Number(configuredHonorario):null);
      const honorarioSource=honorarioKnown?'hr_explicit':(configuredHonorarioKnown?'project_country_config':'pending_source');
      const reimbursementExpected=expected.boleto||expected.comboAmt;
      const reimbursementPartial=v.reimbursementPartial===true||v.reembolsoPartial===true||v.reimbursementSourceComplete===false
        || (reimbursementExpected&&((expected.boleto&&!boletoKnown)||(expected.comboAmt&&!comboKnown)));
      return Object.assign({},v,{
      id:v.id||('hr-live-'+(idx+1)),tenantId:identity.tenantId,rootProjectId:identity.projectId,projectId:identity.projectId,projectName:identity.projectName,
      periodId:periodId(identity.projectId,v.periodKey),periodKey:v.periodKey,periodLabel:v.periodLabel,hrRowId:v.hrRowId,sourceTab:v.sourceTab,sourceRow:v.sourceRow,
      num:idx+1,sucursal:v.sucursal||'Sucursal HR',ciudad:v.ciudad||'',pais:v.pais||v.country,
      country:v.country||v.pais,currency:v.currency||identity.currency[v.pais||v.country]||'',quincena:v.quincena||'',
      escenario:v.escenario||v.tipoCompra||'',franja:v.franja||'',franjaCode:v.franjaCode||null,canal:'Visita presencial',
      formato:v.formato||'Mystery shopping cine',honorario,honorarioSource,honorarioSourceKnown:honorario!==null,boleto:boletoKnown?Number(v.boleto):0,
      combo:v.tipoCombo||'Configurable por HR',comboAmt:comboKnown?Number(v.comboAmt):0,estado:v.estado||'disponible',
      reimbursementBoletoSourceKnown:boletoKnown,reimbursementComboSourceKnown:comboKnown,
      reimbursementSourceComplete:reimbursementExpected?!reimbursementPartial:(v.reimbursementSourceComplete!==false),
      reimbursementSourceStatus:reimbursementPartial?'partial':(v.reimbursementSourceStatus||v.reimbursementStatus||null),
      reimbursementPartial,
      shopperId:v.shopperId||null,shopper:v.shopper||null,shopperCode:v.shopperCode||null,rango:v.quincena||'',
      disponibleDesde:v.disponibleDesde||null,agendada:v.agendada||null,realizada:v.realizada||null,
      cuestFecha:v.cuestFecha||null,submit:Boolean(v.submit||v.submittedAt||v.submissionState==='confirmed_hr'),submittedAt:v.submittedAt||null,
      assignmentSource:v.assignmentSource||(v.hasShopper?'hr':null),assignmentSyncStatus:v.assignmentSyncStatus||'hr_live_source_safe_preview',
      lastSyncedAt:v.lastSyncedAt||null,reviewRequired:v.reviewRequired===true,reviewReasons:safeArray(v.reviewReasons),
      operationalDisplayName:v.operationalDisplayName===true,
      sourceSafe:true,piiProtected:true
    });
    });
  }

  function mapShoppers(snapshot){
    return safeArray(snapshot.shoppers).map((s,idx)=>Object.assign({},s,{
      id:s.id||('shopper-protegido-'+(idx+1)),shopperId:s.shopperId||s.id||('shopper-protegido-'+(idx+1)),
      code:s.code||('TYA-SH-'+(idx+1)),nombre:s.nombre||'Shopper protegido',pais:s.pais||null,ciudad:s.ciudad||'',
      estado:s.estado??null,status:s.status??null,rating:s.rating??null,honorarioPref:s.honorarioPref??null,
      perfilCompleto:s.perfilCompleto===true,firstName:s.firstName||'',lastName:s.lastName||'',whatsapp:s.whatsapp||s.phone||'',phone:s.phone||s.whatsapp||'',email:s.email||'',dpi:'',banco:'',ctaNum:'',
      dataLevel:s.dataLevel||'protected_reference',operationalProfileAvailable:s.operationalProfileAvailable===true,
      operationalDisplayName:s.operationalDisplayName===true,
      sourceHistoricalVisitCount:Number(s.sourceHistoricalVisitCount??s.visitas??0),
      sourceHistoricalRealizedCount:Number(s.sourceHistoricalRealizedCount??s.realizadas??0),
      sourceHistoricalLiquidatedCount:Number(s.sourceHistoricalLiquidatedCount??s.liquidadas??0),
      visitas:Number(s.visitas??0),realizadas:Number(s.realizadas??0),liquidadas:Number(s.liquidadas??0),pagadas:Number(s.pagadas??0),
      postulaciones:undefined,promCuest:null,certs:Number(s.certs||0),
      sourceSafe:true,piiProtected:true
    }));
  }

  function mapPosts(){
    // HR owns visit state, never application/postulation state.
    // Canonical postulations are loaded only from durable platform collections.
    return [];
  }

  function refreshBadge(){CX.dataSource?.renderTopbarBadge?.();}

  function applyHrFreshness(meta){
    const currentRevision=CX.data?.previewMeta?.sourceRevision||null;
    const sameRevision=!meta?.revision||!currentRevision||meta.revision===currentRevision;
    const last=!sameRevision||meta?.externalReadCurrent===false||meta?.hrFreshness?.externalReadCurrent===false;
    const observed=(sameRevision&&(meta?.sourceReadAt||meta?.hrFreshness?.sourceReadAt))||CX.data?.previewMeta?.sourceReadAt||null;
    const freshness={state:last?'last_confirmed':'current_external_read',externalReadCurrent:!last,
      sourceReadAt:observed,readOnly:last,requiresFreshExternalForCommands:true};
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=!last;window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=last;
    document.documentElement?.setAttribute('data-cx-source',last?'hr-last-confirmed':'hr-live');
    if(CX.data)CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{},{hrFreshness:freshness,
      sourceReadAt:observed,externalReadCurrent:!last,runtimeReadActive:!last,
      note:last?'Última hoja de ruta sincronizada. La actualización desde Excel está pendiente. Las acciones verifican la fuente antes de guardarse.':'Hoja de ruta confirmada con su fuente; la revisión visible conserva la última lectura verificada.'});
    if(window.CX_TYA_VISIBLE_DATA_CONTRACT)Object.assign(window.CX_TYA_VISIBLE_DATA_CONTRACT,{hrFreshness:freshness,sourceReadAt:observed,runtimeReadActive:!last,externalReadCurrent:!last});
    if(window.CX_TYA_HR_LIVE_META)Object.assign(window.CX_TYA_HR_LIVE_META,{hrFreshness:freshness,sourceReadAt:observed,externalReadCurrent:!last});
    if(CX.dataSource){
      CX.dataSource.hrFreshness=freshness;CX.dataSource.updatedAt=observed;
      CX.dataSource.runtimeReadActive=!last;
      const others=safeArray(CX.dataSource.warnings).filter(x=>!String(x).startsWith('Última sincronización confirmada:'));
      CX.dataSource.warnings=last?others.concat('Última sincronización confirmada: '+(observed||'no disponible')+'. Se muestra la lectura conservada; la actualización externa está pendiente.'):others;
    }
    return freshness;
  }
  window.CX_TYA_APPLY_HR_FRESHNESS=applyHrFreshness;

  function presentationSnapshot(snapshot,meta){
    const history=snapshot.confirmedHistory,identity=sourceIdentity(snapshot),raw=Object.assign({},snapshot);
    delete raw.confirmedHistory;
    const currentVisits=safeArray(snapshot.visits).map(v=>Object.assign({},v,{externalReadCurrent:meta.externalReadCurrent!==false,sourceReadAt:meta.sourceReadAt||null,confirmedHistory:false}));
    if(!history)return {raw,visible:Object.assign({},raw,{visits:currentVisits})};
    if(history.schemaVersion!=='cxorbia.hr-confirmed-history.v1'||history.tenantId!==identity.tenantId||history.projectId!==identity.projectId||history.externalReadCurrent!==false)
      throw new Error('HR_HISTORY_SCOPE_INVALID');
    const key=v=>str(v.countryCode||v.country||v.pais)+'|'+str(v.periodId||identity.projectId+'-'+v.periodKey);
    const covered=new Set(safeArray(snapshot.readScope?.countryPeriods).map(key));
    if(!covered.size||safeArray(snapshot.visits).some(v=>!covered.has(key(v))))throw new Error('HR_HISTORY_READ_COVERAGE_INVALID');
    const observations=new Map(safeArray(history.observations).map(o=>[key(o),o]));
    const historical=safeArray(history.visits).filter(v=>!covered.has(key(v))).map(v=>{
      const next=Object.assign({},v,{externalReadCurrent:false,sourceReadAt:observations.get(key(v))?.sourceReadAt||null,confirmedHistory:true});
      delete next.hrFieldEditing;delete next.hrReviewObservation;return next;
    });
    const visits=historical.concat(currentVisits);
    if(new Set(visits.map(v=>str(v.visitId||v.id))).size!==visits.length)throw new Error('HR_HISTORY_DUPLICATE_VISIT');
    const periods=new Map();for(const p of [...safeArray(history.periods),...safeArray(snapshot.periodCatalog),...safeArray(snapshot.periods)]){
      const key=str(p.key||p.periodKey);if(key)periods.set(key,Object.assign({},periods.get(key)||{},p,{key}));
    }
    const shoppers=new Map();for(const s of [...safeArray(history.shoppers),...safeArray(snapshot.shoppers)])shoppers.set(str(s.shopperId||s.id),s);
    return {raw,visible:Object.assign({},raw,{visits,periods:[...periods.values()].sort((a,b)=>a.key.localeCompare(b.key)),shoppers:[...shoppers.values()]} )};
  }

  function buildSnapshotCandidate(snapshot,meta={},options={}){
    const valid=!!(snapshot&&snapshot.sourceSafe===true&&snapshot.imported!==true&&snapshot.production!==true&&Array.isArray(snapshot.visits)&&(safeArray(snapshot.periods).length||safeArray(snapshot.readScope?.countryPeriods).length)&&CX.data);
    if(!valid)throw new Error('Snapshot HR live inválido o vacío.');
    const presentation=presentationSnapshot(snapshot,meta);snapshot=presentation.raw;
    const identity=sourceIdentity(snapshot);
    const periods=mapPeriods(presentation.visible,identity),visits=mapVisits(presentation.visible,identity),shoppers=mapShoppers(presentation.visible),posts=mapPosts(visits,identity);
    /* WORK GT11 GT12 HN06: initial demo/legacy storage is NOT a valid HR period source.
       Preserve a current HR-approved period if already active; otherwise honor only
       a Firebase principal-scoped tab preference validated by THIS provider snapshot.
       Missing/deleted/foreign period always fails closed to provider latest. */
    const currentHr= CX.data?.previewMeta?.hrAuthority===true&&
      String(CX.data.previewMeta.tenantId||'')===identity.tenantId&&
      String(CX.data.previewMeta.projectId||'')===identity.projectId;
    const previousPeriodKey=options.previousPeriodKey||(currentHr?(()=>{try{return CX.data.period?.()?.periodKey||null;}catch(_){return null;}})():null);
    const hint=CX.router?.readScopedUiHint?.(identity.tenantId,identity.projectId)||null;
    const authCountry=String(CX.backendAuth?.context?.()?.country||'').trim().toUpperCase();
    const validHint=hint?periods.find(p=>p.id===hint.periodId&&p.projectId===identity.projectId&&
      (!authCountry||p.countries?.includes(authCountry))):null;
    const latest=latestOf(periods),preferred=periods.find(p=>p.id===options.periodId)||periods.find(p=>p.periodKey===previousPeriodKey)||validHint||
      periods.find(p=>p.id===snapshot.readScope?.currentPeriodId)||periods.find(p=>p.periodKey===meta.latestPeriodKey)||latest;
    const sourceMode=snapshot.operationalIdentityPreview===true?'tya_hr_live_runtime_operational_display_dev':'tya_hr_live_runtime_source_safe_dev';
    const previewMeta=Object.assign({},CX.data.previewMeta||{},{
      tenantId:identity.tenantId,projectId:identity.projectId,projectName:identity.projectName,sourceTitle:snapshot.source&&snapshot.source.title,
      generatedAt:snapshot.generatedAt||meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,sourceRevision:meta.revision||null,
      readScope:snapshot.readScope||null,freshVisitCount:safeArray(snapshot.visits).length,confirmedHistoricalVisitCount:visits.filter(v=>v.confirmedHistory===true).length,
      periods:periods.length,tabs:snapshot.counts&&snapshot.counts.tabs,totalVisits:visits.length,countries:snapshot.counts&&snapshot.counts.byCountry,
      production:false,imported:false,sourceSafe:true,piiProtected:true,runtimeSyncActive:false,runtimeReadActive:true,revisionStable:true,
      operationalIdentityPreview:snapshot.operationalIdentityPreview===true,operationalIdentityScope:snapshot.operationalIdentityScope||null,
      note:snapshot.operationalIdentityPreview===true?'Lectura HR viva DEV con nombre operativo visible; contacto, DPI, banco y credenciales siguen excluidos.':'Lectura HR viva source-safe preparada fuera del estado visible.'
    });
    return {version:'a05-atomic-live-snapshot-candidate-v1',snapshot,presentationSnapshot:presentation.visible,meta:Object.assign({},meta,{runtimeRead:true,sourceSafe:true,readScope:snapshot.readScope||null}),identity,
      data:{projects:periods,shoppers,_visitas:visits,_posts:posts,currentProjectId:identity.projectId,currentPeriodId:preferred&&preferred.id,periodOperationalSummary:safeArray(snapshot.periodOperationalSummary),sourceMode,previewMeta},
      brandPatch:{id:identity.tenantId,tenantId:identity.tenantId,clientName:identity.tenantName,demoMode:false,countries:identity.countries},
      dataSourcePatch:{mode:'connected',status:'ready',sourceRef:snapshot.operationalIdentityPreview===true?('hr-live-runtime:'+identity.tenantId+':'+identity.projectId+':display-name-only'):('hr-live-runtime:'+identity.tenantId+':'+identity.projectId),updatedAt:meta.sourceReadAt||meta.generatedAt||new Date().toISOString(),runtimeSyncActive:false,runtimeReadActive:true,updating:false,warnings:snapshot.operationalIdentityPreview===true?['DEV operativo: nombre shopper visible desde HR viva; contacto, DPI, banco y credenciales permanecen protegidos.']:[],blockers:[]}
    };
  }

  function publishSnapshotCandidate(candidate,options={}){
    if(!candidate||candidate.version!=='a05-atomic-live-snapshot-candidate-v1'||!candidate.data||!CX.data)throw new Error('HR_LIVE_CANDIDATE_REQUIRED');
    const patch=options.dataPatch&&typeof options.dataPatch==='object'?options.dataPatch:{},next=Object.assign({},candidate.data,patch);
    next.previewMeta=Object.assign({},candidate.data.previewMeta||{},patch.previewMeta||{});
    window.CX_TYA_HR_SOURCE_SAFE=candidate.snapshot;window.CX_TYA_HR_LIVE_META=Object.assign({},candidate.meta||{},{runtimeRead:true,sourceSafe:true});window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;window.CX_TYA_VISIBLE_DATA_READY=true;
    CX.BRAND=Object.assign(CX.BRAND||{},candidate.brandPatch||{});Object.assign(CX.data,next);
    if(CX.dataSource){Object.assign(CX.dataSource,Object.assign({},candidate.dataSourcePatch||{},options.dataSourcePatch||{}));try{localStorage.setItem('cx_data_mode','connected');localStorage.setItem('cx_demo_mode','off');}catch(e){}}
    const projects=safeArray(CX.data.projects),visits=safeArray(CX.data._visitas),shoppers=safeArray(CX.data.shoppers),currentPeriodId=CX.data.currentPeriodId;
    window.CX_TYA_VISIBLE_DATA_CONTRACT={tenantId:candidate.identity.tenantId,rootProjectId:candidate.identity.projectId,projectName:candidate.identity.projectName,periodCount:projects.length,uniquePeriodIds:new Set(projects.map(p=>p.id)).size,visitCount:visits.length,shopperCount:shoppers.length,currentPeriodId,currentPeriodVisits:visits.filter(v=>String(v.periodId)===String(currentPeriodId)).length,sourceRevision:CX.data.previewMeta?.sourceRevision||candidate.meta?.revision||null,sourceReadAt:candidate.meta?.sourceReadAt||null,genericProjectCount:projects.filter(p=>['retail','banca','food'].includes(p.id)).length,sourceSafe:true,operationalIdentityPreview:candidate.snapshot?.operationalIdentityPreview===true,imported:false,production:false,runtimeSyncActive:false,runtimeReadActive:true,atomicPublication:true};
    if(typeof window.CX_TYA_BUILD_CORTE1_REPORTS==='function')window.CX_TYA_BUILD_CORTE1_REPORTS(candidate.presentationSnapshot||candidate.snapshot,Object.assign({},candidate.meta||{},{readScope:candidate.snapshot.readScope||null,includesConfirmedHistory:!!candidate.presentationSnapshot}));
    applyHrFreshness(candidate.meta||{});
    if(CX.clienteData&&typeof CX.clienteData.invalidate==='function')CX.clienteData.invalidate();refreshBadge();
    document.documentElement.setAttribute('data-cx-tenant',candidate.identity.tenantId);document.documentElement.setAttribute('data-cx-project',candidate.identity.projectId);document.documentElement.setAttribute('data-cx-source',CX.data.previewMeta?.externalReadCurrent===false?'hr-last-confirmed':'hr-live');
    if(options.suppressEvents!==true){if(CX.bus&&typeof CX.bus.emit==='function')CX.bus.emit('visit-flow',{sourceRevision:CX.data.previewMeta?.sourceRevision||null,reason:options.reason||'live_refresh'});try{window.dispatchEvent(new CustomEvent('cx:live-source-updated',{detail:{revision:CX.data.previewMeta?.sourceRevision||null,sourceReadAt:candidate.meta?.sourceReadAt||null,reason:options.reason||'live_refresh'}}));}catch(e){}}
    return {ok:true,revision:CX.data.previewMeta?.sourceRevision||null,periods:projects.length,visits:visits.length,currentPeriodId,operationalIdentityPreview:candidate.snapshot?.operationalIdentityPreview===true,atomicPublication:true};
  }

  function applySnapshot(snapshot,meta={},options={}){return publishSnapshotCandidate(buildSnapshotCandidate(snapshot,meta,options),options);}
  window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE=buildSnapshotCandidate;
  window.CX_TYA_PUBLISH_LIVE_SNAPSHOT_CANDIDATE=publishSnapshotCandidate;
  window.CX_TYA_APPLY_LIVE_SNAPSHOT=applySnapshot;
})();
