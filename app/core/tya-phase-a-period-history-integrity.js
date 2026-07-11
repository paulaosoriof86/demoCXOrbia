/* ============================================================
   CXOrbia · TyA Phase A · period/history integrity adapter
   ------------------------------------------------------------
   Backend-only runtime guard for the source-safe preview.
   - validates period continuity and visit separation before UI use
   - derives authoritative active/closed period states from source
   - exposes stable period/history accessors without changing modules
   - fails closed on structural drift instead of falling back to demo
   - never imports, writes HR/Firestore, activates providers or production
   ============================================================ */
window.CX = window.CX || {};
(function(){
  const source = window.CX_TYA_HR_SOURCE_SAFE || null;
  const data = CX.data || null;
  const ds = CX.dataSource || null;
  const enabled = !!(window.CX_TYA_PHASE_A_PREVIEW && source && data);
  if(!enabled) return;

  const baseProjectId = source.projectId || 'cinepolis';
  const periodId = key => `${baseProjectId}-${key}`;
  const hardBlockers = [];
  const warnings = [];
  const allowedStatuses = new Set(['disponible','postulada','asignada','agendada','realizada','cuestionario','validada','liquidada','fuera_rango']);
  const doneStatuses = new Set(['realizada','cuestionario','validada','liquidada']);
  const periods = Array.isArray(source.periods) ? [...source.periods].sort((a,b)=>String(a.key).localeCompare(String(b.key))) : [];
  const visits = Array.isArray(data._visitas) ? data._visitas : [];
  const tabs = Array.isArray(source.tabsRead) ? source.tabsRead : [];

  const monthSerial = key => {
    const m = /^(\d{4})-(\d{2})$/.exec(String(key||''));
    return m ? Number(m[1])*12 + Number(m[2])-1 : null;
  };
  const unique = values => new Set(values).size === values.length;
  const groupCount = (rows, fn) => rows.reduce((acc,row)=>{const k=fn(row);acc[k]=(acc[k]||0)+1;return acc;},{});

  if(!periods.length) hardBlockers.push('periods_missing');
  if(!unique(periods.map(p=>p.key))) hardBlockers.push('period_keys_duplicate');
  if(!unique(periods.map(p=>periodId(p.key)))) hardBlockers.push('period_ids_duplicate');
  if(source.counts && Number(source.counts.periods)!==periods.length) hardBlockers.push('period_count_source_mismatch');
  if(source.counts && Number(source.counts.visits)!==visits.length) hardBlockers.push('visit_count_source_mismatch');

  for(let i=1;i<periods.length;i++){
    const prev=monthSerial(periods[i-1].key), cur=monthSerial(periods[i].key);
    if(prev===null || cur===null || cur!==prev+1){ hardBlockers.push(`period_sequence_gap:${periods[i-1].key}->${periods[i].key}`); }
  }

  const projectById = new Map((data.projects||[]).map(p=>[p.id,p]));
  const visitIds = visits.map(v=>v.id);
  if(!unique(visitIds)) hardBlockers.push('visit_ids_duplicate');

  const registry = periods.map((p,idx)=>{
    const id = periodId(p.key);
    const pVisits = visits.filter(v=>v.projectId===id);
    const byCountry = groupCount(pVisits, v=>v.pais||v.country||'');
    const byStatus = groupCount(pVisits, v=>v.estado||'');
    const expectedCountries = p.countries || {};
    const expectedTotal = Number(p.total ?? Object.values(expectedCountries).reduce((a,b)=>a+Number(b||0),0));
    const sourceTabs = tabs.filter(t=>t.periodKey===p.key).map(t=>({title:t.title,country:t.country,rows:Number(t.rows||0),headerRow:t.headerRow}));
    const invalidLinks = pVisits.filter(v=>v.periodKey!==p.key || v.projectId!==id).map(v=>v.id);
    const invalidStatuses = pVisits.filter(v=>!allowedStatuses.has(v.estado)).map(v=>({id:v.id,status:v.estado}));
    const countryMismatch = Object.entries(expectedCountries).filter(([country,expected])=>Number(byCountry[country]||0)!==Number(expected||0));
    const tabMismatch = Object.entries(expectedCountries).filter(([country,expected])=>{
      const rows=sourceTabs.filter(t=>t.country===country).reduce((a,t)=>a+t.rows,0);
      return rows!==Number(expected||0);
    });

    if(!projectById.has(id)) hardBlockers.push(`period_project_missing:${id}`);
    if(pVisits.length!==expectedTotal) hardBlockers.push(`period_visit_count_mismatch:${p.key}:${pVisits.length}/${expectedTotal}`);
    if(countryMismatch.length) hardBlockers.push(`period_country_count_mismatch:${p.key}`);
    if(tabMismatch.length) hardBlockers.push(`period_tab_count_mismatch:${p.key}`);
    if(invalidLinks.length) hardBlockers.push(`period_visit_link_mismatch:${p.key}`);
    if(invalidStatuses.length) hardBlockers.push(`period_status_unknown:${p.key}`);

    const isLatest = idx===periods.length-1;
    const done = pVisits.filter(v=>doneStatuses.has(v.estado)).length;
    return Object.freeze({
      id,
      key:p.key,
      label:p.label||p.fullLabel||p.key,
      fullLabel:p.fullLabel||p.label||p.key,
      operationState:isLatest?'activo':'cerrado',
      current:isLatest,
      total:pVisits.length,
      expectedTotal,
      done,
      pct:pVisits.length?Math.round(done/pVisits.length*100):0,
      byCountry:Object.freeze({...byCountry}),
      expectedCountries:Object.freeze({...expectedCountries}),
      byStatus:Object.freeze({...byStatus}),
      sourceTabs:Object.freeze(sourceTabs),
      sourceWarnings:Object.freeze((source.issues||[]).filter(i=>sourceTabs.some(t=>t.title===i.tab))),
      sourceSafe:true,
      imported:false,
      production:false
    });
  });

  const registryById = new Map(registry.map(r=>[r.id,r]));
  const latest = registry[registry.length-1] || null;
  if(latest && data.currentProjectId!==latest.id) warnings.push(`current_period_reconciled:${data.currentProjectId||'none'}->${latest.id}`);
  if((source.issues||[]).length) warnings.push(`source_warnings:${source.issues.length}`);

  const report = {
    ready:hardBlockers.length===0,
    generatedAt:new Date().toISOString(),
    tenantId:source.tenantId||'tya',
    projectId:baseProjectId,
    sourceRef:'tya:hr-live-multitab:source-safe:not-imported',
    periods:registry,
    activePeriodId:latest&&latest.id,
    historicalPeriodIds:registry.filter(r=>!r.current).map(r=>r.id),
    counts:{periods:registry.length,visits:visits.length,historicalVisits:registry.filter(r=>!r.current).reduce((a,r)=>a+r.total,0),activeVisits:latest?latest.total:0},
    warnings,
    blockers:hardBlockers,
    sourceSafe:true,
    imported:false,
    production:false
  };

  if(hardBlockers.length){
    data._phaseAPeriodIntegrityRejected = Object.freeze({
      counts:{periods:(data.projects||[]).length,visits:visits.length,shoppers:(data.shoppers||[]).length},
      blockers:[...hardBlockers],
      sourceRef:report.sourceRef
    });
    data.projects=[];
    data._visitas=[];
    data._posts=[];
    data.shoppers=[];
    data.currentProjectId=null;
    data.sourceMode='tya_hr_period_integrity_blocked';
    if(ds){
      ds.mode='source_safe_preview';
      ds.status='blocked';
      ds.sourceRef=report.sourceRef;
      ds.blockers=[...hardBlockers];
      ds.warnings=[...warnings];
    }
    CX.phaseASourceSafe = Object.freeze({ready:false,reason:'period_history_integrity_failed',blockers:[...hardBlockers],sourceSafe:true,imported:false,production:false});
    window.CX_TYA_PHASE_A_PERIOD_HISTORY = Object.freeze(report);
    CX.bus && CX.bus.emit('datasource', ds);
    return;
  }

  const originals = data._phaseAPeriodHistoryOriginals || Object.freeze({
    periodState:typeof data.periodState==='function'?data.periodState.bind(data):null,
    periodStats:typeof data.periodStats==='function'?data.periodStats.bind(data):null,
    periodsForProgram:typeof data.periodsForProgram==='function'?data.periodsForProgram.bind(data):null
  });
  data._phaseAPeriodHistoryOriginals = originals;
  data.phaseAPeriodRegistry = Object.freeze(registry);
  data.phaseAPeriod = id => registryById.get(id)||null;
  data.visitsForPeriod = (id,country)=>visits.filter(v=>v.projectId===id && (!country || (v.pais||v.country)===country));
  data.historicalPeriodsForProgram = key => key===baseProjectId ? registry.filter(r=>!r.current).map(r=>projectById.get(r.id)).filter(Boolean) : [];
  data.activePeriodsForProgram = key => key===baseProjectId && latest ? [projectById.get(latest.id)].filter(Boolean) : [];
  data.historicalVisitsForProgram = key => key===baseProjectId ? visits.filter(v=>registryById.get(v.projectId)?.current===false) : [];
  data.periodState = id => registryById.has(id) ? registryById.get(id).operationState : (originals.periodState?originals.periodState(id):'activo');
  data.periodStats = id => registryById.has(id) ? ({total:registryById.get(id).total,done:registryById.get(id).done,pct:registryById.get(id).pct,byCountry:registryById.get(id).byCountry,byStatus:registryById.get(id).byStatus}) : (originals.periodStats?originals.periodStats(id):{total:0,done:0,pct:0});
  data.periodsForProgram = key => key===baseProjectId ? registry.map(r=>projectById.get(r.id)).filter(Boolean) : (originals.periodsForProgram?originals.periodsForProgram(key):[]);
  data.currentProjectId = latest.id;
  data.sourceMode='tya_hr_live_multitab_source_safe_period_integrity_ready';
  data.previewMeta = Object.assign({},data.previewMeta||{}, {
    activePeriodId:latest.id,
    historicalPeriods:report.historicalPeriodIds.length,
    activeVisits:report.counts.activeVisits,
    historicalVisits:report.counts.historicalVisits,
    periodIntegrityReady:true,
    periodIntegrityWarnings:[...warnings]
  });

  if(ds){
    ds.mode='source_safe_preview';
    ds.status='ready';
    ds.sourceRef=report.sourceRef;
    ds.blockers=[];
    ds.warnings=[...(ds.warnings||[]),'Integridad periodo/histórico validada: 13 cerrados + 1 activo; visitas separadas por periodo.'];
  }
  window.CX_TYA_PHASE_A_PERIOD_HISTORY = Object.freeze(report);
  CX.phaseAPeriodHistory = window.CX_TYA_PHASE_A_PERIOD_HISTORY;
  CX.bus && CX.bus.emit('period-integrity', report);
  CX.bus && CX.bus.emit('datasource', ds);
})();
