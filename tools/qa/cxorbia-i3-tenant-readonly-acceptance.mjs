import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
export const DOMAIN='tenant-admin-config-branding';
export const CONTRACT_SHA='df7951c9ad6baabcf948d19ab94269da82c68043bf5d98e491c36577828ad878';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const OWNERS=['app/modules/configuracion.js','app/modules/administrabilidad.js','app/modules/marca.js'];
const DEPS=['app/core/config.js','app/core/backend-protected-dev-mode.js','app/core/backend-browser-auth.js','app/config/runtime.js','app/adapters/tya-c6-unified-human-runtime-v1.js'];
const CHECKS=['config:centro','config:marca','config:plan','config:paises','config:listas','config:nda','administrabilidad','marca'];
export function configurationRequestEvidence({method,url,body,tenantId,projectId,hrRevision}){
  if(['GET','HEAD','OPTIONS'].includes(method)||!/\/v1\/cxorbia\/commands|\/api\/tenants\/[^/]+\/(?:users|projects|config|brand)/.test(url))return null;
  const command=body&&typeof body==='object'?body:{};
  const automaticHrReconciliation=method==='POST'&&new URL(url).pathname==='/v1/cxorbia/commands'&&
    command.commandType==='hr.snapshot.reconcile'&&command.entityType==='hrSnapshot'&&command.periodId===null&&command.requirePeriod===false&&
    command.payload&&typeof command.payload==='object'&&!Array.isArray(command.payload)&&Object.keys(command.payload).length===0&&
    command.tenantId===tenantId&&command.projectId===projectId&&/^[a-f0-9]{64}$/.test(String(hrRevision||''))&&
    command.entityId===hrRevision&&command.expectedVersion===hrRevision&&command.source==='hr-source-authorized-auto-reconciliation';
  return {method,path:new URL(url).pathname,commandType:command.commandType||null,tenantId:command.tenantId||null,projectId:command.projectId||null,
    commandDigest:hash(JSON.stringify(command)),classification:automaticHrReconciliation?'AUTHORIZED_HR_RECONCILIATION_NOT_CONFIGURATION_WRITE':'CONFIGURATION_OR_UNCLASSIFIED_MUTATION'};
}
export function validateTenantReadonlyReceipt(r,mod){
  const failures=[];
  const need=(ok,code)=>{if(!ok)failures.push(code);};
  need(r?.moduleDomain===DOMAIN && r.operationKind==='READ_ONLY','READONLY_DOMAIN');
  need(mod?.domain===DOMAIN && hash(String(mod.contract||''))===CONTRACT_SHA && r?.contractAuthority?.contractSha256===CONTRACT_SHA,'READONLY_CONTRACT');
  need(r?.mutationEvidence?.applicable===false && r.mutationEvidence.providerAckClaimed===false && r.providerAck!==true,'READONLY_NO_FAKE_ACK');
  need(r?.auth?.authenticated===true && r.auth.tenantExact===true && r.auth.projectAuthorized===true && r.auth.samePrincipalAfterReload===true,'READONLY_AUTH');
  const p=r?.readOnlyProof||{};
  need(p.canonicalTenantAuthority===true && p.protectedRuntime===true && p.localStorageTruth===false,'READONLY_AUTHORITY');
  for(const key of ['checksBeforeReload','checksAfterReload']){
    const checks=p[key]||[];
    need(checks.length===CHECKS.length && CHECKS.every(id=>checks.filter(c=>c.id===id && c.ok===true).length===1),'READONLY_VIEWS_'+key);
  }
  need(p.configurationProjectionUnchanged===true && p.relevantLocalStorageKeysUnchanged===true && p.configurationMutationRequestsObserved===0,'READONLY_RELOAD_NO_MUTATION');
  // A real provider-write branch is recorded, never mislabeled read-only.
  need(p.commandWritesEnabled===false,'READONLY_PROJECT_COUNTRY_WRITE_BRANCH_REQUIRES_SEPARATE_EVIDENCE');
  const evidence=r?.ownerEvidence||[];
  need([...OWNERS,...DEPS].every(f=>evidence.some(x=>x.path===f && x.byteParity===true && /^[a-f0-9]{64}$/.test(x.sourceSha256||'') && x.sourceSha256===x.servedSha256)),'READONLY_OWNER_DEPENDENCY_PARITY');
  need(OWNERS.every(f=>(r?.ownerPaths||[]).includes(f) && evidence.some(x=>x.path===f && x.gitBlob===mod?.currentOwnerBlobs?.[f])),'READONLY_ALL_OWNER_BLOBS');
  need(r?.humanAcceptance?.mode==='PRESERVED_PRIOR_SCOPE_NO_NEW_DESIGN_CHANGE' && mod?.currentEvidenceDimensions?.human==='PRIOR_MATCH_PRESERVED','READONLY_PRIOR_ACCEPTANCE');
  return {pass:failures.length===0,failures};
}

export async function proveTenantReadonly({page,staffUid,tenantId,projectId,sourceSha,sourceTree,sourceDir,host,out,identity,hrRevision}){
  const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
  const matrix=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8'));
  const mod=matrix.modules.find(m=>m.domain===DOMAIN);
  const r={schemaVersion:'cxorbia.i3.owner-domain-readonly-receipt.v1',decision:'HOLD_I3_TENANT_READONLY_REPROOF',moduleDomain:DOMAIN,
    findingIds:['VRM-194','VRM-330'],operationKind:'READ_ONLY',scope:'APPROVED_CONNECTED_TENANT_READONLY_CONTRACT',
    sourceSha,sourceTree,...identity,controlSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    hrIndependent:true,hrRevision:null,production:false,ownerPaths:OWNERS,ownerEvidence:[],auth:{},readOnlyProof:{},
    contractAuthority:{path:descriptor.moduleTruthPath,gitBlob:descriptor.moduleTruthExpectedGitBlob,moduleDomain:DOMAIN,contractSha256:hash(String(mod?.contract||''))},
    mutationEvidence:{applicable:false,reason:'APPROVED_CONNECTED_READONLY_CONTRACT',providerAckClaimed:false},
    humanAcceptance:{mode:'PRESERVED_PRIOR_SCOPE_NO_NEW_DESIGN_CHANGE',authority:mod?.latestApprovedAuthority,sourceEvidence:mod?.sourceEvidence},i3Go:false,gate20:'HOLD',gate21:'HOLD',i4Authorized:false};
  fs.mkdirSync(out,{recursive:true});
  const mutations=[];
  const onRequest=req=>{let body=null;try{body=req.postDataJSON();}catch{}const row=configurationRequestEvidence({method:req.method(),url:req.url(),body,tenantId,projectId,hrRevision});if(row)mutations.push(row);};
  page.on('request',onRequest);
  const settle=()=>page.waitForFunction(({uid,tenantId,projectId})=>{
    const c=window.CX?.backendAuth?.context?.()||{},rt=window.CX_TENANT_RUNTIME_CONFIG||{};
    return window.firebase?.auth?.().currentUser?.uid===uid && c.authenticated===true && c.tenantId===tenantId && ['admin','super'].includes(c.role) &&
      (c.role==='super'||(c.projectIds||[]).includes(projectId)) && window.CX?.data?.currentProjectId===projectId &&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true && window.CX_PROTECTED_DEV_RUNTIME===true &&
      window.CX?.canonicalTenantAuthority?.()===true && rt.tenantId===tenantId && rt.localStorageTruth===false;
  },{uid:staffUid,tenantId,projectId},{timeout:150000});
  const projection=()=>page.evaluate(()=>{
    const rt=window.CX_TENANT_RUNTIME_CONFIG||{},keys=Object.keys(localStorage).filter(k=>/^cx_(?:brand|tenant|plan|listas|nda|mods|module)/i.test(k)).sort();
    return {tenantId:rt.tenantId,tenantName:rt.tenantName,countries:rt.countries,sourceAuthority:rt.sourceAuthority,localStorageTruth:rt.localStorageTruth,
      commandWritesEnabled:window.CX?.BACKEND?.enableCommandWrites===true,local:Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))};
  });
  const sweep=async label=>{
    const checks=[];
    for(const route of ['config','administrabilidad','marca']){
      await page.evaluate(id=>window.CX.router.nav(id),route);
      await page.waitForFunction(id=>window.CX?.session?.view===id,route,{timeout:30000});
      for(const tab of route==='config'?['centro','marca','plan','paises','listas','nda']:[null]){
        if(tab)await page.locator('#view [data-tab="'+tab+'"]').first().click();
        const check=await page.evaluate(({route,tab})=>{
          const root=document.querySelector('#view'),rt=window.CX_TENANT_RUNTIME_CONFIG||{},id=tab?'config:'+tab:route;
          const forbidden=route==='marca'?['#logoFile','#brandDoc','#bName','#bColor','#bColorPick','#bFont','#bTone','#bPalette','#bAI','#bPreview','#bSave','#resetBrand']:
            route==='administrabilidad'?['#ndaSave','#ndaTxt','#ndaReason','[data-plan]','[data-nda]']:
            ['#cfgTenantCountries','#cfgDemo','#cfgStartProj','#cfg_name','#cfg_tag','#goMarca','#resetMarca','#editMods','#modSave','.modChk','#cfg_nda','#saveNDA',...(tab==='listas'?['[data-add]','input','textarea']:[])];
          const writeEnabled=window.CX?.BACKEND?.enableCommandWrites===true;
          if(route==='config' && tab==='paises' && !writeEnabled)forbidden.push('#addPais','[data-rmc]');
          const present=forbidden.filter(s=>root?.querySelector(s));
          const marker=route==='marca'?'[data-connected-brand-readonly="true"]':route==='administrabilidad'?'[data-connected-admin-readonly="true"]':
            tab==='centro'?'#cfgBody':tab==='paises'&&writeEnabled?'[data-project-config-authority="provider"]':'[data-config-locked="'+(tab==='marca'?'tenant-brand':tab)+'"]';
          const tenantVisible=route==='administrabilidad'||route==='marca'||tab==='marca'?String(root?.innerText||'').includes(String(rt.tenantName||rt.tenantId)):true;
          return {id,ok:!!root?.querySelector(marker) && present.length===0 && tenantVisible,marker,forbiddenControls:present,tenantVisible,
            countryBranch:tab==='paises'?(writeEnabled?'PROVIDER_WRITE_ENABLED':'READ_ONLY'):null};
        },{route,tab});
        checks.push(check);await page.screenshot({path:path.join(out,label+'-'+check.id.replace(':','-')+'.png'),fullPage:true});
      }
    }
    return checks;
  };
  try{
    for(const file of [...OWNERS,...DEPS]){
      const bytes=fs.readFileSync(path.join(sourceDir,file));
      const response=await fetch(host+'/'+file.slice(4)+'?tenant-proof='+Date.now(),{headers:{'cache-control':'no-cache, no-store'}});
      if(!response.ok)throw new Error('RELEASE_COMPOSITION_FAILURE:TENANT_OWNER_HTTP:'+file);
      const served=Buffer.from(await response.arrayBuffer()),gitBlob=execFileSync('git',['rev-parse',sourceSha+':'+file],{encoding:'utf8'}).trim();
      r.ownerEvidence.push({path:file,gitBlob,sourceSha256:hash(bytes),servedSha256:hash(served),byteParity:hash(bytes)===hash(served)});
    }
    await settle();const before=await projection();
    const checksBeforeReload=await sweep('before');
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});await settle();
    const checksAfterReload=await sweep('after'),after=await projection();
    r.auth={authenticated:true,role:await page.evaluate(()=>window.CX.backendAuth.context().role),principalFingerprint:hash(staffUid).slice(0,18),tenantExact:true,projectAuthorized:true,samePrincipalAfterReload:true};
    r.readOnlyProof={canonicalTenantAuthority:true,protectedRuntime:true,localStorageTruth:before.localStorageTruth,
      commandWritesEnabled:before.commandWritesEnabled,checksBeforeReload,checksAfterReload,
      configurationProjectionUnchanged:JSON.stringify(before)===JSON.stringify(after),relevantLocalStorageKeysUnchanged:JSON.stringify(before.local)===JSON.stringify(after.local),
      configurationMutationRequestsObserved:mutations.filter(m=>m.classification==='CONFIGURATION_OR_UNCLASSIFIED_MUTATION').length,mutations,projectionSha256:hash(JSON.stringify(before)),countryMutationTested:false};
    r.validation=validateTenantReadonlyReceipt(r,mod);
    r.decision=r.validation.pass?'PASS_I3_TENANT_ADMIN_CONFIG_BRANDING_READONLY':'HOLD_I3_TENANT_READONLY_REPROOF';
  }catch(e){r.error=String(e.message||e);}
  finally{page.off('request',onRequest);fs.writeFileSync(path.join(out,'tenant-admin-config-branding-readonly.json'),JSON.stringify(r,null,2)+'\n');}
  return r;
}
