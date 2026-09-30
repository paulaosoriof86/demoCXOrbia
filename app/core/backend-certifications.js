/* CXOrbia · protected certification runtime client — PRE-I4 Recovery. */
window.CX=window.CX||{};
(function(){
  const str=v=>String(v==null?'':v).trim(),arr=v=>Array.isArray(v)?v:[];
  function scope(){
    const c=typeof CX.data?.ctx==='function'?CX.data.ctx():{};
    const tenantId=str(CX.BACKEND?.tenantId||c.tenantId||CX.session?.user?.tenantId||'tya');
    const projectId=str(c.projectId||CX.data?.currentProjectId||CX.session?.user?.scopeProjectId);
    if(!tenantId||!projectId)throw new Error('CERT_SCOPE_REQUIRED');
    return {tenantId,projectId};
  }
  async function token(){
    const user=window.firebase?.auth?.().currentUser;
    if(!user)throw new Error('AUTH_FAILURE:CERT_PRINCIPAL_REQUIRED');
    return user.getIdToken(false);
  }
  async function call(action,payload={}){
    const s=scope(),idempotencyKey=str(payload.idempotencyKey);
    const r=await fetch('/api/tenants/'+encodeURIComponent(s.tenantId)+'/projects/'+encodeURIComponent(s.projectId)+'/certifications/'+action,{
      method:'POST',cache:'no-store',
      headers:Object.assign({'Content-Type':'application/json','Authorization':'Bearer '+await token()},idempotencyKey?{'Idempotency-Key':idempotencyKey}:{}),
      body:JSON.stringify(payload)
    });
    const body=await r.json().catch(()=>({}));
    if(!r.ok||body?.providerAck===false||body?.ok===false){
      const e=new Error(str(body?.code||body?.error||('CERT_RUNTIME_HTTP_'+r.status)));e.status=r.status;e.payload=body;throw e;
    }
    return body;
  }
  function currentUid(){try{return str(firebase.auth().currentUser?.uid);}catch(_){return'';}}
  function newId(prefix){return prefix+':'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,10);}
  function applicableRecertifications(shopperId){
    return arr(CX.data?.__protectedCertificationRecertifications).filter(r=>str(r.status||'active')==='active'&&(str(r.scope)==='all'||arr(r.targetShopperIds).map(str).includes(str(shopperId))));
  }
  function durableCurrent(shopperId,bank){
    const revision=str(bank?.contentRevision);if(!revision)return null;
    const latestRecert=applicableRecertifications(shopperId).sort((a,b)=>str(b.createdAt).localeCompare(str(a.createdAt)))[0]||null;
    const attempts=arr(CX.data?.__protectedCertifications).filter(x=>str(x.shopperId)===str(shopperId)&&x.pass===true&&str(x.contentRevision)===revision).sort((a,b)=>str(b.createdAt).localeCompare(str(a.createdAt)));
    const latest=attempts[0]||null;if(!latest)return null;
    if(latestRecert&&str(latestRecert.createdAt)>str(latest.createdAt))return null;
    return latest;
  }
  function carryoverDecision(shopper,bank,projectId){
    const records=arr(shopper?.certificationEvidenceRecords),shopperId=str(shopper?.shopperId||shopper?.id);
    const activeRecert=applicableRecertifications(shopperId).sort((a,b)=>str(b.createdAt).localeCompare(str(a.createdAt)))[0]||null;
    if(activeRecert)return {state:'recertification_required',eligibilityGranted:false,recertification:activeRecert};
    const eq=new Set([...arr(bank?.historicalEquivalenceKeys),...arr(bank?.equivalenceKeys),bank?.certificationId,bank?.sourceCertificationId,bank?.contentRevision].map(str).filter(Boolean));
    let approved=false,expired=false,nonEquivalent=false,failed=false;
    for(const r of records.slice().sort((a,b)=>str(b.sourceApprovedAt||b.presentedAt).localeCompare(str(a.sourceApprovedAt||a.presentedAt)))){
      const status=str(r.sourceLegacyStatus).toLowerCase();
      if(status==='failed'){failed=true;continue;}if(status!=='approved')continue;approved=true;
      if(str(r.projectId)!==str(projectId)){nonEquivalent=true;continue;}
      const keys=[r.sourceCertificationId,r.certificationId,r.sourceSnapshotSha256,r.contentRevision].map(str).filter(Boolean);
      if(!keys.some(k=>eq.has(k))){nonEquivalent=true;continue;}
      const expiry=Date.parse(str(r.validUntil||bank?.carryoverValidUntil)||'');
      if(Number.isFinite(expiry)&&expiry<Date.now()){expired=true;continue;}
      return {state:'valid_reusable',eligibilityGranted:true,record:r};
    }
    if(expired)return {state:'expired',eligibilityGranted:false};
    if(approved&&nonEquivalent)return {state:'non_equivalent',eligibilityGranted:false};
    if(failed)return {state:'failed',eligibilityGranted:false};
    return {state:records.length?'pending':'none',eligibilityGranted:false};
  }
  CX.backendCertifications={
    call,
    submitAttempt:payload=>call('attempt',Object.assign({idempotencyKey:newId('cert.attempt')},payload||{})),
    requestRecertification:payload=>call('recertify',Object.assign({idempotencyKey:newId('cert.recert')},payload||{})),
    generateBank:payload=>call('ai-generate',payload||{}),
    currentUid,durableCurrent,carryoverDecision,applicableRecertifications
  };
})();