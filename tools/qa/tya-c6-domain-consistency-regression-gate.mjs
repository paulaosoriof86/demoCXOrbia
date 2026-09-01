import fs from 'node:fs';import vm from 'node:vm';
const composerFile=process.argv[2]||'app/adapters/tya-cumulative-read-model-v2.js';
const watcherFile=process.argv[3]||'app/adapters/tya-live-source-refresh-watch-v2.js';
const bridgeFile=process.argv[4]||'app/adapters/tya-c6-domain-consistency-bridge.js';
const semanticsFile=process.argv[5]||'app/adapters/tya-canonical-state-semantics-v2.js';
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(composerFile,'utf8'),sandbox,{filename:composerFile});vm.runInContext(fs.readFileSync(semanticsFile,'utf8'),sandbox,{filename:semanticsFile});const engine=sandbox.window.CX_TYA_CUMULATIVE_READ_MODEL;if(!engine?.compose||!engine?.facets)throw new Error('canonical_composer_missing');
const periods=['2026-05','2026-06','2026-07'].map(k=>({id:'cinepolis-'+k,periodKey:k,key:k}));
const shoppers=Array.from({length:12},(_,i)=>({id:'TYA_GT_'+i,shopperId:'TYA_GT_'+i,nombre:i===0?'PAULA OSORIO':i===1?'PATRICIA ORDOÑEZ':'Shopper '+i,pais:'GT',ciudad:'Guatemala'}));
const visits=[];let n=0;
for(const key of ['2026-05','2026-06'])for(let i=0;i<10;i++){const s=shoppers[i%12];visits.push({id:'hr-'+(++n),visitId:'hr-'+n,hrRowId:key+'!'+(i+2),sourceTab:key,sourceRow:i+2,periodKey:key,projectId:'cinepolis-'+key,rootProjectId:'cinepolis',shopperId:s.id,shopper:s.nombre,pais:'GT',estado:'submitida',realizada:key+'-10',cuestFecha:key+'-11',submittedAt:key+'-12',canonicalFacets:{assigned:true,scheduled:true,realized:true,questionnaire:true,submitted:true,liquidationCandidate:true,liquidationConfirmed:key==='2026-05',paymentConfirmed:key==='2026-05'}});}
for(let i=0;i<44;i++){const s=shoppers[i%12],submitted=i<33,questionnaire=i<38,realized=i<40,outOfRange=i===10||i===43;visits.push({id:'hr-'+(++n),visitId:'hr-'+n,hrRowId:'JULIO 26!'+(i+2),sourceTab:'JULIO 26',sourceRow:i+2,periodKey:'2026-07',projectId:'cinepolis-2026-07',rootProjectId:'cinepolis',shopperId:s.id,shopper:s.nombre,pais:i<34?'GT':'HN',estado:outOfRange?'fuera_rango':submitted?'submitida':questionnaire?'cuestionario':realized?'realizada':'agendada',agendada:'2026-07-20',realizada:realized?'2026-07-28':null,cuestFecha:questionnaire?'2026-07-29':null,submittedAt:submitted?'2026-07-30':null,canonicalFacets:{assigned:true,scheduled:true,realized,questionnaire,submitted,outOfRange,liquidationCandidate:submitted,liquidationConfirmed:false,paymentConfirmed:false}});}
const profiles=[
 {id:'SHR-PAULA',canonicalLegacyIds:['TYA_GT_0'],nombre:'Paula Osorio',whatsapp:'50255550000'},
 {id:'SHR-PATRICIA',legacyLiveShopperIds:['TYA_GT_1'],nombre:'Patricia Ordóñez',whatsapp:'50255550001',username:'patricia.ordonez',password:'Patricia123*'},
 {id:'UNMATCHED-PATRICIA',nombre:'PATRICIA ORDOÑEZ',whatsapp:'50200000000',username:'other',password:'Other123*'}
];
const pvis=visits.map(v=>({id:'fs-'+v.id,hrRowId:v.hrRowId,sourceTab:v.sourceTab,sourceRow:v.sourceRow,shopperId:v.shopperId==='TYA_GT_0'?'SHR-PAULA':v.shopperId==='TYA_GT_1'?'SHR-PATRICIA':v.shopperId,canonicalFacets:{liquidationCandidate:engine.facets(v).submitted,liquidationConfirmed:false,paymentConfirmed:false}}));
const result=engine.compose({hr:{projects:periods,visits,shoppers,posts:[],currentPeriodId:'cinepolis-2026-07',currentProjectId:'cinepolis',sourceRevision:'stable'},protectedPayload:{shoppers:profiles,visits:pvis,certifications:[{shopperId:'SHR-PAULA',status:'aprobada'}],liquidations:[]}});
const jul=result.periodOperationalSummary.find(x=>x.periodKey==='2026-07');
const assertions=[];const assert=(name,ok,detail)=>{assertions.push({name,ok,detail});if(!ok)process.exitCode=1;};
assert('visits_preserved',result.visits.length===64,result.visits.length);
assert('operational_shoppers_preserved_without_unmatched_append',result.shoppers.length===12,result.shoppers.length);
assert('unmatched_profile_reviewed_not_appended',result.platformOnlyProfiles.length===1,result.platformOnlyProfiles);
assert('exact_alias_crosswalk',result.identityMap.TYA_GT_0==='SHR-PAULA'&&result.identityMap.TYA_GT_1==='SHR-PATRICIA',result.identityMap);
assert('display_name_not_used_for_merge',result.platformOnlyProfiles[0]?.id==='UNMATCHED-PATRICIA',result.platformOnlyProfiles);
assert('canonical_july_total',jul?.total===44,jul);
assert('canonical_july_realized',jul?.realized===40,jul);
assert('canonical_july_questionnaire',jul?.questionnaireCompleted===38,jul);
assert('canonical_july_submitted',jul?.submitted===33,jul);
assert('canonical_july_actionable_out_of_range',jul?.outOfRange===1,jul);
assert('historical_out_of_range_evidence_preserved',jul?.outOfRangeEvidence===2,jul);
const paula=result.shoppers.find(x=>x.id==='SHR-PAULA');
assert('certification_projected',paula?.certificationStatus==='certificada',paula?.certificationStatus);
assert('profile_not_false_complete_without_credentials',paula?.perfilCompleto===false,paula);
assert('no_duplicate_visit_keys',result.diagnostics.duplicateVisitKeys===0,result.diagnostics);
assert('no_duplicate_shopper_ids',result.diagnostics.duplicateShopperIds===0,result.diagnostics);
assert('protected_visits_never_appended',result.diagnostics.protectedVisitsAppended===0,result.diagnostics);
assert('actionable_state_semantics_active',String(engine.version).includes('actionable-state-v2'),engine.version);
const watcher=fs.readFileSync(watcherFile,'utf8'),bridge=fs.readFileSync(bridgeFile,'utf8');
assert('watcher_content_signature_gate',watcher.includes('currentContentSignature')&&watcher.includes('contentStable:true'),null);
assert('watcher_preserves_canvas_and_rail_scroll',watcher.includes("document.querySelector('.content')")&&watcher.includes("document.getElementById('rail')"),null);
assert('watcher_does_not_restore_rail_select_dom',!watcher.includes("#rail select")&&!watcher.includes('saved.value'),null);
assert('watcher_preload_single_render',watcher.includes("reason==='full_visual_preload'")&&watcher.includes('preload:true'),null);
assert('domain_bridge_canonical_facets',bridge.includes('d.visitFacets=facets')&&bridge.includes('d.phaseFlow=function'),null);
assert('domain_bridge_exact_credentials_only',bridge.includes('if(s.__canonicalIdentityOverlay)')&&bridge.includes('derived_existing_pattern_dev'),null);
assert('domain_bridge_finance_period_canonical',bridge.includes('fs.curPeriod=function(){return periodKey()')&&bridge.includes('fs.setPeriod=function(per)'),null);
assert('domain_bridge_shop_history_full',bridge.includes('CX.modules.misvisitas=correctedMisVisitas'),null);
const report={schemaVersion:'cxorbia.c6.domain-consistency-regression-gate.v2',decision:assertions.every(a=>a.ok)?'PASS_C6_CANONICAL_DOMAIN_CONSISTENCY':'FAIL_C6_CANONICAL_DOMAIN_CONSISTENCY',engineVersion:engine.version,counts:{periods:periods.length,visits:result.visits.length,shoppers:result.shoppers.length,platformOnlyProfiles:result.platformOnlyProfiles.length},july:jul,assertions,safety:{providerWrites:0,firestoreWrites:0,authWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,deploys:0,production:false,merge:false}};
console.log(JSON.stringify(report,null,2));if(process.exitCode)throw new Error(report.decision);
