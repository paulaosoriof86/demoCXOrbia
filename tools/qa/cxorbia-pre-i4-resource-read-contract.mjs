import crypto from 'node:crypto';
const fail=code=>{throw new Error('MAPPING_FAILURE:RESOURCE_AUTHORITY_'+code);};
const need=(ok,code)=>{if(!ok)fail(code);};
const reusableProjectResource=(row,scope)=>{
  if(row.resourceType!=='project_resource'||row.qaOnly===true||row.visitaId||row.visitId||row.assignedVisitId)return false;
  if(String(row.tipo||'').toLowerCase()==='pdf'){
    const period=String(row.periodId||''),prefix=['tenants',scope.tenantId,'projects',scope.projectId,'periods',period,'resources'].join('/')+'/';
    return !!period&&!period.includes('/')&&String(row.storagePath||'').startsWith(prefix);
  }
  return true;
};
export function validateFocalResourceRead({resources,principal,expected,remote}){
  const s=resources?.status,rows=resources?.rows;
  need(principal?.uid===expected.uid&&principal.authenticated===true&&principal.tenantId===expected.tenantId,'PRINCIPAL');
  need(s?.status==='ready'&&s.tenantId===expected.tenantId&&s.projectId===expected.projectId&&s.periodId===expected.periodId,'SCOPE');
  need(Array.isArray(rows)&&new Set(rows.map(x=>x.id)).size===rows.length&&!resources.staticResourceSeedIds?.length,'ROWS');
  if(expected.kind==='admin'){
    need(['super','admin'].includes(principal.role)&&s.source==='firestore','OPERATOR_SOURCE');
    return {decision:'PASS_FOCAL_OPERATOR_RESOURCE_AUTHORITY',source:s.source,production:false,writes:0};
  }
  need(expected.kind==='shopper'&&principal.role==='shopper'&&principal.authNamespace==='shopper'&&principal.shopperId===expected.shopperId,'SHOPPER');
  need(s.source==='verified-server-projection','SHOPPER_SOURCE');
  const url=new URL(remote?.url||'https://invalid.invalid');
  const endpoint='/api/tenants/'+encodeURIComponent(expected.tenantId)+'/projects/'+encodeURIComponent(expected.projectId)+'/certifications/shopper-resources';
  need(url.origin===expected.origin&&url.pathname===endpoint&&url.searchParams.get('periodId')===expected.periodId&&
    remote.method==='GET'&&remote.status===200&&remote.authorizationPresent===true&&remote.fromServiceWorker===false,'AUTHENTICATED_GET');
  const b=remote.body;
  need(b?.ok===true&&b.providerAck===true&&b.production===false&&b.source==='verified_shopper_projection'&&
    b.periodId===expected.periodId&&Array.isArray(b.items)&&b.count===b.items.length,'PROVIDER_ACK');
  need(new Set(b.items.map(x=>x.id)).size===b.items.length,'PROVIDER_DUPLICATES');
  for(const row of b.items){
    need(row?.id&&row.projectId===expected.projectId&&(!row.tenantId||row.tenantId===expected.tenantId)&&row.status==='active'&&
      (!row.periodId||row.periodId===expected.periodId||row.resourceType==='certification_bank'||reusableProjectResource(row,expected))&&
      (row.targetAll===true||row.visibleRoles?.includes('shopper')),'PROVIDER_ROW_SCOPE');
    if(row.resourceType==='certification_bank'){
      // The authenticated server already applies cross-period bank reuse rules;
      // its safe projection intentionally omits the private origin metadata.
      need(['published','confirmed','approved_preview'].includes(row.bank?.estado)&&row.bank.documentSource===undefined&&
        Array.isArray(row.bank.preguntas)&&row.bank.preguntas.every(q=>q&&Object.keys(q).every(k=>['q','ops'].includes(k))),'SAFE_BANK');
    }else need(row.resourceType==='project_resource'&&row.bank===undefined&&
      ['answerKey','correcta','exp','preguntas','documentSource'].every(k=>row[k]===undefined),'SAFE_RESOURCE');
  }
  const projected=b.items.filter(x=>x.resourceType==='project_resource');
  need(rows.length===projected.length&&s.count===b.items.length&&rows.every(row=>projected.some(p=>p.id===row.id&&
    Number(p.version||0)===Number(row.version||0)&&p.status===row.status&&String(p.n||p.name||'')===row.name)),'VISIBLE_READBACK');
  return {decision:'PASS_FOCAL_SHOPPER_AUTHENTICATED_SERVER_RESOURCE_AUTHORITY',source:s.source,
    method:'GET',endpoint:url.pathname,periodId:b.periodId,providerAck:true,principalUid:principal.uid,
    itemIds:b.items.map(x=>x.id).sort(),safeProjection:true,remoteBodySha256:crypto.createHash('sha256').update(JSON.stringify(b)).digest('hex'),
    visibleReadback:true,production:false,writes:0};
}
