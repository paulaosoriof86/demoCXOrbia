/* CXOrbia TyA Phase A — Corte 1 live report projection.
   Adapter only: derives sanitized report rows from the same runtime HR snapshot
   consumed by CX.data. No UI module/core source, PII, writes or production. */
window.CX = window.CX || {};
(function(){
  const snapshot=window.CX_TYA_HR_SOURCE_SAFE||null;
  const valid=!!(snapshot&&snapshot.sourceSafe===true&&snapshot.imported!==true&&snapshot.production!==true&&Array.isArray(snapshot.periods)&&Array.isArray(snapshot.visits));
  if(!valid){window.CX_TYA_CORTE1_REPORTS=null;return;}

  const country=v=>String(v&&((v.pais||v.country))||'').trim().toUpperCase();
  const branchName=v=>String(v&&((v.sucursal||v.branchName))||'').trim()||'Sucursal pendiente de fuente';
  const city=v=>String(v&&((v.ciudad||v.city))||'').trim();
  const canonical=v=>(v&&v.canonicalFacets)||{};
  const assigned=v=>{const c=canonical(v);return c.assigned===true||v?.hasShopper===true||Boolean(v?.shopperId||v?.shopperCode||v?.shopper);};
  const performed=v=>{const c=canonical(v);return c.realized===true||v?.performed===true||Boolean(v?.realizada)||['realizada','cuestionario','submitida','submitido','submitted','liquidada','pagada'].includes(String(v?.estado||v?.visitState||'').toLowerCase());};
  const questionnaire=v=>{const c=canonical(v);return c.questionnaire===true||v?.questionnaireCompleted===true||Boolean(v?.cuestFecha||v?.questionnaireAt)||['cuestionario','submitida','submitido','submitted','liquidada','pagada'].includes(String(v?.estado||v?.visitState||'').toLowerCase());};
  const submitted=v=>{const c=canonical(v);return c.submitted===true||v?.submit===true||Boolean(v?.submittedAt)||['submitida','submitido','submitted','liquidada','pagada'].includes(String(v?.estado||v?.visitState||'').toLowerCase());};
  const paid=v=>{const c=canonical(v);return c.paymentConfirmed===true||v?.paymentConfirmed===true||String(v?.paymentState||v?.estadoPago||'').toLowerCase()==='confirmado';};
  const measureKeys=['visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed'];
  const seed=()=>Object.fromEntries(measureKeys.map(key=>[key,0]));
  const apply=(row,v)=>{row.visits++;if(assigned(v))row.assigned++;else row.unassigned++;if(performed(v))row.performed++;if(questionnaire(v))row.questionnaire++;if(submitted(v))row.submitted++;if(paid(v))row.paymentConfirmed++;};

  const rowsMap=new Map(),branchMap=new Map();
  for(const v of snapshot.visits||[]){
    const periodKey=String(v?.periodKey||'').trim();
    const c=country(v),b=branchName(v),ct=city(v);
    if(!periodKey||!c)continue;
    const key=periodKey+'::'+c;
    if(!rowsMap.has(key))rowsMap.set(key,{tenantId:snapshot.tenantId||'tya',projectId:snapshot.projectId||'cinepolis',periodKey,country:c,...seed()});
    apply(rowsMap.get(key),v);
    const branchKey=periodKey+'::'+c+'::'+b;
    if(!branchMap.has(branchKey))branchMap.set(branchKey,{tenantId:snapshot.tenantId||'tya',projectId:snapshot.projectId||'cinepolis',periodKey,country:c,branchName:b,city:ct,...seed()});
    apply(branchMap.get(branchKey),v);
  }

  const rows=[...rowsMap.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
  const branchRows=[...branchMap.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country)||a.branchName.localeCompare(b.branchName));
  const periods=[...new Set(rows.map(r=>r.periodKey))].sort();
  const catalog=[
    {id:'executive_operational_summary',label:'Resumen ejecutivo operativo',projectionLevel:'periodCountry',availability:'available'},
    {id:'branch_operational_status',label:'Estado operativo por sucursal',projectionLevel:'branch',availability:'available'},
    {id:'country_coverage',label:'Cobertura por país',projectionLevel:'periodCountry',availability:'available'},
    {id:'period_trend',label:'Tendencia operativa por periodo',projectionLevel:'periodCountry',availability:'available'},
    {id:'action_plans',label:'Planes de acción',projectionLevel:null,availability:'pending_source',requiredSource:'action_plan_records'},
    {id:'training_gaps',label:'Brechas y capacitación',projectionLevel:null,availability:'pending_source',requiredSource:'questionnaire_section_scores'},
    {id:'brand_scorecard',label:'Scorecard de marca',projectionLevel:null,availability:'pending_source',requiredSource:'validated_questionnaire_scores'}
  ];
  const headers={
    periodCountry:['tenantId','projectId','periodKey','country','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed'],
    branch:['tenantId','projectId','periodKey','country','branchName','city','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed']
  };
  const rowsFor=(level='periodCountry')=>level==='branch'?branchRows:rows;
  const filter=(scope={},level='periodCountry')=>rowsFor(level).filter(r=>(!scope.periodKey||r.periodKey===scope.periodKey)&&(!scope.country||r.country===scope.country)&&(!scope.branchName||r.branchName===scope.branchName)&&(!scope.city||r.city===scope.city));
  const toCSV=(scope={},level='periodCountry')=>{const cols=headers[level]||headers.periodCountry;const out=filter(scope,level);return [cols,...out.map(r=>cols.map(k=>r[k]))].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');};
  const toJSON=(scope={},level='periodCountry')=>JSON.stringify({schemaVersion:'1.1.0-live',tenantId:snapshot.tenantId||'tya',projectId:snapshot.projectId||'cinepolis',level,scope,rows:filter(scope,level)},null,2);
  const report=(reportId,scope={})=>{const definition=catalog.find(x=>x.id===reportId)||null;if(!definition)return{available:false,reason:'unknown_report',definition:null,rows:[]};if(definition.availability!=='available')return{available:false,reason:'pending_source',definition,rows:[]};return{available:true,reason:null,definition,rows:filter(scope,definition.projectionLevel||'periodCountry')};};
  const projection={
    schemaVersion:'1.1.0-live',contractId:'phase-a-corte1-context-history-reports-v1-live',generatedAt:snapshot.generatedAt||null,
    sourceRevision:window.CX_TYA_HR_LIVE_META?.revision||null,
    tenantId:snapshot.tenantId||'tya',projectId:snapshot.projectId||'cinepolis',projectName:snapshot.projectName||'Cinépolis',
    source:{title:snapshot.source?.title||null,type:snapshot.source?.type||null,sourceSafe:true,runtimeRead:true,production:false,imported:false},
    periods,countries:[...new Set(rows.map(r=>r.country))].sort(),latestPeriod:periods.at(-1)||null,
    rows,branchRows,catalog,
    totals:Object.fromEntries(measureKeys.map(measure=>[measure,rows.reduce((n,row)=>n+Number(row[measure]||0),0)])),
    frontend:{formatsReady:['PDF','Excel','PPT'],formatsPending:[],pendingSourceBehavior:'disable_export_and_show_pending_source'},
    rowsFor,filter,toCSV,toJSON,report
  };
  window.CX_TYA_CORTE1_REPORTS=Object.freeze(projection);
  window.CX_TYA_CORTE1_REPORTS_LIVE_META=Object.freeze({ok:true,runtimeRead:true,sourceSafe:true,revision:projection.sourceRevision,periods:periods.length,rows:rows.length,branchRows:branchRows.length,writes:false,production:false});
})();
