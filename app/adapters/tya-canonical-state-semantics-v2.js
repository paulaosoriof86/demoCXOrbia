/* CXOrbia TyA — canonical state semantics v2.
   A source may preserve historical out-of-range evidence after the visit later advances.
   Operational KPIs must count only unresolved/actionable out-of-range visits, while audit
   retains the historical evidence separately. Pure read-model transformation; no writes. */
(function(root){
  'use strict';
  const api=root.CX_TYA_CUMULATIVE_READ_MODEL;
  if(!api||typeof api.facets!=='function'||typeof api.compose!=='function')return;
  const originalFacets=api.facets.bind(api);
  const originalCompose=api.compose.bind(api);
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  function facets(v){
    const base=originalFacets(v)||{};
    const outOfRangeEvidence=base.outOfRange===true||v?.outOfRangeEvidence===true;
    const actionableOutOfRange=outOfRangeEvidence&&base.realized!==true&&base.cancelled!==true;
    return Object.assign({},base,{outOfRangeEvidence,outOfRange:actionableOutOfRange,actionableOutOfRange});
  }
  function periodSummary(visits){
    const map=new Map();
    for(const v of arr(visits)){
      const key=str(v?.periodKey)||str(v?.projectId).replace(/^cinepolis-/,'')||'unknown';
      if(!map.has(key))map.set(key,{periodKey:key,total:0,available:0,assigned:0,scheduled:0,realized:0,questionnaireCompleted:0,submitted:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,outOfRangeEvidence:0,reviewRequired:0,byCountry:{}});
      const row=map.get(key),f=facets(v);row.total++;row.available+=f.available?1:0;row.assigned+=f.assigned?1:0;row.scheduled+=f.scheduled?1:0;row.realized+=f.realized?1:0;row.questionnaireCompleted+=f.questionnaire?1:0;row.submitted+=f.submitted?1:0;row.liquidationCandidates+=f.liquidationCandidate?1:0;row.liquidationConfirmed+=f.liquidationConfirmed?1:0;row.paymentConfirmed+=f.paymentConfirmed?1:0;row.outOfRange+=f.outOfRange?1:0;row.outOfRangeEvidence+=f.outOfRangeEvidence?1:0;row.reviewRequired+=v?.reviewRequired===true?1:0;const c=str(v?.pais||v?.country)||'unknown';row.byCountry[c]=(row.byCountry[c]||0)+1;
    }
    return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
  }
  function compose(input){
    const result=originalCompose(input);
    result.visits=arr(result.visits).map(v=>{
      const f=facets(v);
      return Object.assign({},v,{outOfRangeEvidence:f.outOfRangeEvidence,canonicalFacets:Object.assign({},v.canonicalFacets||{},{outOfRange:f.outOfRange,outOfRangeEvidence:f.outOfRangeEvidence})});
    });
    result.periodOperationalSummary=periodSummary(result.visits);
    result.diagnostics=Object.assign({},result.diagnostics||{},{canonicalOutOfRangeSemantics:'actionable_unresolved',outOfRangeEvidencePreserved:true});
    return result;
  }
  api.facets=facets;
  api.periodSummary=periodSummary;
  api.compose=compose;
  api.version=(api.version||'c6-canonical-domain-composer-v2')+'+actionable-state-v2';
  root.CX_TYA_CANONICAL_STATE_SEMANTICS={version:'actionable-state-v2',outOfRange:'unresolved_only',outOfRangeEvidence:'preserved',providerWrites:0};
})(typeof window!=='undefined'?window:globalThis);
