/* CXOrbia TyA — certification historical evidence projection v1.
   Exact technical anchors only. Historical evidence is visible but never grants current
   certification, eligibility or execution rights. No provider calls, writes or production. */
(function(root){
  'use strict';
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
  const flat=v=>{const out=[];const walk=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(walk);return;}if(typeof x==='object'){Object.values(x).forEach(walk);return;}const s=str(x);if(s)out.push(s);};walk(v);return uniq(out);};
  const anchors=s=>uniq([
    str(s&&s.id),str(s&&s.shopperId),str(s&&s.legacyShopperId),
    ...flat(s&&s.legacyLiveShopperIds),...flat(s&&s.exactAliases),
    ...flat(s&&s.sourceShopperIds),...flat(s&&s.hrShopperIds),
    ...flat(s&&s.identityAliases)
  ]);
  function safeEvidence(raw){
    const status=str(raw&&raw.sourceLegacyStatus).toLowerCase();
    return {
      candidateId:str(raw&&raw.candidateId),
      shopperId:str(raw&&raw.shopperId),
      projectId:str(raw&&raw.projectId),
      certificationId:str(raw&&raw.certificationId),
      sourceCertificationId:str(raw&&raw.sourceCertificationId),
      presentedAt:raw&&raw.presentedAt||null,
      sourceApprovedAt:raw&&raw.sourceApprovedAt||null,
      sourceLegacyStatus:status||'unknown',
      sourceScore:Number.isFinite(Number(raw&&raw.sourceScore))?Number(raw.sourceScore):null,
      sourceRef:str(raw&&raw.sourceRef)||null,
      sourceSnapshotSha256:str(raw&&raw.sourceSnapshotSha256)||null,
      identityAuthority:'exact_technical_anchor',
      evidenceKind:'historical_legacy_evidence',
      reviewRequired:true,
      carryoverConfirmed:false,
      eligibilityGranted:false,
      currentCertification:false
    };
  }
  function project(input={}){
    const shoppers=arr(input.shoppers).map(clone),identityMap=input.identityMap||{},evidence=arr(input.evidenceCandidates);
    const byId=new Map(),owners=new Map();
    const add=(token,id)=>{token=str(token);id=str(id);if(!token||!id)return;if(!owners.has(token))owners.set(token,new Set());owners.get(token).add(id);};
    for(const s of shoppers){
      const id=str(s&& (s.id||s.shopperId));if(!id)continue;byId.set(id,s);
      for(const token of anchors(s))add(token,id);
    }
    for(const [alias,canonicalRaw] of Object.entries(identityMap||{})){
      const canonical=str(canonicalRaw);if(byId.has(canonical))add(alias,canonical);
    }
    const matched=new Map(),reviewQueue=[];
    for(const raw of evidence){
      const sourceShopperId=str(raw&&raw.shopperId);
      const candidate=safeEvidence(raw);
      const ids=[...(owners.get(sourceShopperId)||[])].filter(id=>byId.has(id)).sort();
      if(ids.length!==1){
        reviewQueue.push(Object.assign({},candidate,{reason:ids.length?'ambiguous_exact_technical_anchor':'no_exact_technical_anchor',candidateCanonicalIds:ids}));
        continue;
      }
      const id=ids[0];if(!matched.has(id))matched.set(id,[]);matched.get(id).push(candidate);
    }
    for(const s of shoppers){
      const id=str(s&& (s.id||s.shopperId)),records=(matched.get(id)||[]).slice().sort((a,b)=>str(a.sourceCertificationId).localeCompare(str(b.sourceCertificationId)));
      s.certificationEvidenceRecords=records;
      s.certificationEvidenceCount=records.length;
      s.certificationEvidenceApprovedLegacy=records.filter(r=>r.sourceLegacyStatus==='approved').length;
      s.certificationEvidenceFailedLegacy=records.filter(r=>r.sourceLegacyStatus==='failed').length;
      s.certificationEvidenceStatus=records.length?'historical_review_pending':'none';
      s.certificationHistoricalEvidence=records.length>0;
      // Explicitly do NOT synthesize current certification fields.
    }
    return {
      shoppers,
      matchedRecords:[...matched.values()].reduce((n,x)=>n+x.length,0),
      matchedShoppers:[...matched.keys()].length,
      reviewQueue,
      reviewRequiredRecords:reviewQueue.length,
      eligibilityGranted:0,
      currentCertificationMutations:0,
      exactOnly:true,
      production:false
    };
  }
  root.CX_TYA_CERTIFICATION_EVIDENCE_PROJECTION={project,version:'certification-evidence-projection-v1',exactOnly:true,eligibilityGranted:0,providerWrites:0,production:false};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CX_TYA_CERTIFICATION_EVIDENCE_PROJECTION;
})(typeof window!=='undefined'?window:globalThis);
