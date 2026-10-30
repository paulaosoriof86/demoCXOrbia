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
  function explicitReviewPolicy(row){
    if(!row||typeof row!=='object')return null;
    const fields=['certificationReviewPolicy','certReviewPolicy'].filter(key=>Object.prototype.hasOwnProperty.call(row,key));
    if(!fields.length)return null;
    const values=fields.map(key=>{
      if(typeof row[key]!=='string')throw new Error('CERT_REVIEW_POLICY_INVALID');
      const value=row[key].trim().toLowerCase();
      if(!['authorized_admin','maker_checker','distinct_reviewer','two_person'].includes(value))throw new Error('CERT_REVIEW_POLICY_INVALID');
      return value==='authorized_admin'?'authorized_admin':'distinct_reviewer';
    });
    if(new Set(values).size!==1)throw new Error('CERT_REVIEW_POLICY_ALIAS_CONFLICT');
    return values[0];
  }
  function reviewPolicy(period={}){
    if(CX.BACKEND?.enabled!==true)return explicitReviewPolicy(period)||'authorized_admin';
    const current=scope(),displayId=row=>{
      const raw=str(row?.periodId||row?.id),project=str(row?.projectId||current.projectId);
      return /^\d{4}-(0[1-9]|1[0-2])$/.test(raw)?project+'-'+raw:raw;
    };
    const roots=arr(CX.data?.__backendAllProjectRecords).filter(row=>str(row?.id||row?.projectId)===current.projectId);
    if(roots.length>1)throw new Error('CERT_REVIEW_POLICY_PROJECT_AMBIGUOUS');
    const root=roots[0]||{},byId=new Map(),target=displayId({...period,projectId:current.projectId});
    // The protected snapshot supersedes the initial backend read. Do not combine
    // two representations of one period whose normalized IDs can differ.
    const periods=Array.isArray(CX.data?.__protectedPeriods)?CX.data.__protectedPeriods:arr(CX.data?.__backendPeriods);
    for(const row of periods){
      if(str(row?.projectId)!==current.projectId||displayId(row)!==target)continue;
      byId.set(str(row.id||row.periodId),row);
    }
    if(byId.size>1)throw new Error('CERT_REVIEW_POLICY_PERIOD_AMBIGUOUS');
    const exact=[...byId.values()][0]||null;
    if((root.tenantId!==undefined&&str(root.tenantId)!==current.tenantId)
      ||(exact?.tenantId!==undefined&&str(exact.tenantId)!==current.tenantId))throw new Error('CERT_REVIEW_POLICY_SCOPE_MISMATCH');
    const inherited=explicitReviewPolicy(root),specific=explicitReviewPolicy(exact);
    return specific||inherited||'authorized_admin';
  }
  function currentUid(){try{return str(firebase.auth().currentUser?.uid);}catch(_){return'';}}
  function newId(prefix){return prefix+':'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,10);}
  function applicableRecertifications(shopperId){
    const projectId=str(CX.data?.currentProjectId);
    return arr(CX.data?.__protectedCertificationRecertifications).filter(r=>
      str(r.status||'active')==='active'&&(!r.projectId||str(r.projectId)===projectId)&&
      (str(r.scope)==='all'||arr(r.targetShopperIds).map(str).includes(str(shopperId)))
    );
  }
  function durableCurrent(shopperId,bank){
    const projectId=str(CX.data?.currentProjectId);
    const latestRecert=applicableRecertifications(shopperId).sort((a,b)=>str(b.createdAt).localeCompare(str(a.createdAt)))[0]||null;
    const attempts=arr(CX.data?.__protectedCertifications).filter(x=>
      str(x.shopperId)===str(shopperId)&&(x.pass===true||x.passed===true||str(x.status).toLowerCase()==='certified')&&
      (!x.projectId||str(x.projectId)===projectId)
    ).sort((a,b)=>str(b.createdAt||b.certifiedAt).localeCompare(str(a.createdAt||a.certifiedAt)));
    const latest=attempts[0]||null;if(!latest)return null;
    if(latestRecert&&str(latestRecert.createdAt)>str(latest.createdAt||latest.certifiedAt))return null;
    return Object.assign({},latest,{eligibilitySource:'durable_project_certification',bankRevisionMatches:!!(bank?.contentRevision&&str(latest.contentRevision)===str(bank.contentRevision))});
  }
  function carryoverDecision(shopper,bank,projectId){
    const records=arr(shopper?.certificationEvidenceRecords),shopperId=str(shopper?.shopperId||shopper?.id);
    const activeRecert=applicableRecertifications(shopperId).sort((a,b)=>str(b.createdAt).localeCompare(str(a.createdAt)))[0]||null;
    if(activeRecert)return {state:'recertification_required',eligibilityGranted:false,recertification:activeRecert};
    let approved=false,expired=false,otherProject=false,failed=false;
    for(const r of records.slice().sort((a,b)=>str(b.sourceApprovedAt||b.presentedAt).localeCompare(str(a.sourceApprovedAt||a.presentedAt)))){
      const status=str(r.sourceLegacyStatus||r.status).toLowerCase();
      if(status==='failed'){failed=true;continue;}
      if(!['approved','certified','passed'].includes(status))continue;
      approved=true;
      if(str(r.projectId)!==str(projectId)){otherProject=true;continue;}
      const expiry=Date.parse(str(r.validUntil)||'');
      if(Number.isFinite(expiry)&&expiry<Date.now()){expired=true;continue;}
      return {state:'valid_reusable',eligibilityGranted:true,record:r,eligibilitySource:'historical_project_certification'};
    }
    if(expired)return {state:'expired',eligibilityGranted:false};
    if(approved&&otherProject)return {state:'other_project_only',eligibilityGranted:false};
    if(failed)return {state:'failed',eligibilityGranted:false};
    return {state:records.length?'pending':'none',eligibilityGranted:false};
  }
  CX.backendCertifications={
    call,
    submitAttempt:payload=>call('attempt',Object.assign({idempotencyKey:newId('cert.attempt')},payload||{})),
    requestRecertification:payload=>call('recertify',Object.assign({idempotencyKey:newId('cert.recert')},payload||{})),
    generateBank:payload=>call('ai-generate',Object.assign({idempotencyKey:newId('cert.generate')},payload||{})),
    reviewPolicy,
    publishBank:payload=>call('publish',Object.assign({idempotencyKey:newId('cert.publish')},payload||{})),
    configureBank:payload=>call('configure',Object.assign({idempotencyKey:newId('cert.configure')},payload||{})),
    retireBank:payload=>call('retire',Object.assign({idempotencyKey:newId('cert.retire')},payload||{})),
    currentUid,durableCurrent,carryoverDecision,applicableRecertifications
  };
})();