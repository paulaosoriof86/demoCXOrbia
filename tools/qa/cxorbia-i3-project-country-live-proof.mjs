import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {validateTenantReadonlyReceipt,configurationRequestEvidence} from './cxorbia-i3-tenant-readonly-acceptance.mjs';
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
export const projectIdFor=(tenant,name)=>'prj-'+digest(tenant+'\0'+name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')).slice(0,20);
export const projectCommandPaths=(tenant,command)=>({receipt:`tenants/${tenant}/commandReceipts/${digest(tenant+'\0'+command.idempotencyKey).slice(0,40)}`,
  audit:`tenants/${tenant}/entityAuditTrail/project-${digest(command.idempotencyKey).slice(0,32)}`});
const fail=code=>{throw new Error('PERSISTENCE_FAILURE:I3_COUNTRY_'+code);};
const assert=(ok,code)=>{if(!ok)fail(code);};
const isAck=a=>a?.ok===true&&a.status==='committed'&&a.committed===true&&a.providerAck===true&&a.successUiAllowed===true&&a.readbackVerified===true;
const snapshotProof=s=>({path:s.ref.path,data:s.data(),updateTime:{seconds:s.updateTime.seconds,nanoseconds:s.updateTime.nanoseconds}});

export function validateCountryReadback({command,ack,record,receipt,audit,scope}){
  const errors=[],need=(ok,code)=>{if(!ok)errors.push(code);};
  need(isAck(ack)&&ack.commandType===command.commandType&&ack.idempotencyKey===command.idempotencyKey&&ack.projectId===scope.projectId&&ack.tenantId===scope.tenantId&&ack.periodId===scope.periodId,'PROVIDER_ACK');
  need(command.tenantId===scope.tenantId&&['project.create','project.update'].includes(command.commandType)&&
    (command.commandType==='project.create'?command.projectId===null:command.projectId===scope.projectId),'COMMAND_SCOPE');
  need(record?.id===scope.projectId&&record.tenantId===scope.tenantId&&record.name===scope.name&&record.qaOnly===true&&record.qaRunId===scope.runId&&record.createdBy===scope.staffUid,'OWNED_PROJECT');
  need(record?.periodId===scope.periodId&&command.periodId===scope.periodId&&command.payload?.periodId===scope.periodId,'PERIOD_SCOPE');
  need(record?.operationalSource?.mode==='internal'&&record.operationalSource.writePolicy==='platform_only','INTERNAL_SCOPE');
  need(record?.version===ack?.entityVersion&&record?.version===receipt?.entityVersion,'VERSION');
  need(receipt?.status==='committed'&&receipt.providerAck===true&&receipt.commandDigest===digest(command)&&receipt.projectId===scope.projectId&&receipt.periodId===scope.periodId&&receipt.commandType===command.commandType&&receipt.actorUid===scope.staffUid,'DURABLE_RECEIPT');
  need(audit?.tenantId===scope.tenantId&&audit.projectId===scope.projectId&&audit.periodId===scope.periodId&&audit.entityType==='project'&&audit.entityId===scope.projectId&&audit.commandType===command.commandType&&audit.actorUid===scope.staffUid&&audit.idempotencyKey===command.idempotencyKey,'AUDIT');
  need(JSON.stringify([...(record?.countries||[])].sort())===JSON.stringify([...(command.payload?.countries||[])].sort()),'COUNTRIES');
  need((record?.countries||[]).every(c=>typeof record.currency?.[c]==='string'&&record.currency[c]===command.payload?.currency?.[c]),'CURRENCY');
  return {pass:errors.length===0,errors};
}

export function composeTenantCountryReceipts(readonly,country,mod){
  const base=validateTenantReadonlyReceipt(readonly,mod);
  const failures=base.failures.filter(f=>f!=='READONLY_PROJECT_COUNTRY_WRITE_BRANCH_REQUIRES_SEPARATE_EVIDENCE');
  const need=(ok,code)=>{if(!ok)failures.push(code);};
  need(readonly.readOnlyProof?.commandWritesEnabled===true,'COUNTRY_WRITE_BRANCH_NOT_OBSERVED');
  need(country?.decision==='PASS_I3_PROJECT_COUNTRY_UI_PROVIDER_RELOAD_REPLAY_CLEANUP','COUNTRY_LIVE_PROOF');
  for(const k of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression','cleanupVerified','samePrincipal','commercialProjectUnchanged'])need(country?.[k]===true,'COUNTRY_'+k);
  for(const k of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'])need(country?.[k]===readonly?.[k],'COUNTRY_IDENTITY_'+k);
  const evidenceRef='project-country-live-proof.json';
  const receipt={...readonly,schemaVersion:'cxorbia.i3.owner-domain-mixed-receipt.v1',operationKind:'MUTATION',
    decision:failures.length?'HOLD_I3_TENANT_CONFIG_DOMAIN':'PASS_I3_TENANT_ADMIN_CONFIG_BRANDING_COMPLETE_CONTRACT',
    scope:'APPROVED_CONNECTED_READONLY_VIEWS_AND_SYNTHETIC_PROJECT_COUNTRY_PROVIDER_UI',
    actionReal:country?.actionReal===true,providerAck:country?.providerAck===true,durableReadback:country?.durableReadback===true,
    reloadProof:country?.reloadProof===true,noDuplicateRegression:country?.noDuplicateRegression===true,
    mutationEvidence:{applicable:true,providerAckClaimed:country?.providerAck===true,syntheticOnly:true,evidenceRef,cleanupVerified:country?.cleanupVerified===true},
    contractCoverage:{fullDomain:failures.length===0,obligations:[
      {id:'approved-config-admin-brand-views-before-and-after-reload',observed:base.failures.every(f=>f==='READONLY_PROJECT_COUNTRY_WRITE_BRANCH_REQUIRES_SEPARATE_EVIDENCE'),evidenceRef:'tenant-admin-config-branding-readonly.json'},
      {id:'actual-add-remove-country-ui-currency-ack-readback',observed:country?.actionReal===true&&country?.durableReadback===true,evidenceRef},
      {id:'same-principal-reload-idempotence-cleanup',observed:country?.samePrincipal===true&&country?.reloadProof===true&&country?.noDuplicateRegression===true&&country?.cleanupVerified===true,evidenceRef}]},
    countryProof:country,validation:{pass:failures.length===0,failures}};
  // Full-domain findings own all three surfaces; the focal P0 owns only Config.
  return [receipt,{...receipt,findingIds:['VRM-335'],ownerPaths:['app/modules/configuracion.js']}];
}

export async function proveProjectCountries({page,db,staffUid,tenantId,commercialProjectId,sourceSha,sourceTree,out,identity,hrRevision}){
  fs.mkdirSync(out,{recursive:true});
  const runId=String(process.env.GITHUB_RUN_ID||''),attempt=String(process.env.GITHUB_RUN_ATTEMPT||'1');
  const name=`I3 QA Countries ${runId} ${attempt} ${sourceSha.slice(0,10)}`,projectId=projectIdFor(tenantId,name),periodId=`setup-i3-country-${runId}-${attempt}`;
  const scope={runId,tenantId,projectId,periodId,name,staffUid},projectRef=db.doc(`tenants/${tenantId}/projects/${projectId}`);
  const commercialRef=db.doc(`tenants/${tenantId}/projects/${commercialProjectId}`),originalUrl=page.url(),commands=new Map(),handlerErrors=[];
  const r={schemaVersion:'cxorbia.i3.project-country-live-proof.v1',decision:'HOLD_I3_PROJECT_COUNTRY_LIVE_PROOF',sourceSha,sourceTree,...identity,
    runId,runAttempt:attempt,production:false,hrWrites:0,authWrites:0,paymentWrites:0,projectId,periodId,syntheticOnly:true,
    actionReal:false,providerAck:false,durableReadback:false,reloadProof:false,noDuplicateRegression:false,cleanupVerified:false,samePrincipal:false,commercialProjectUnchanged:false,steps:[],cleanup:{decision:'NOT_STARTED'}};
  let preflightAbsent=false,commercialBefore=null,routed=false;
  const write=()=>fs.writeFileSync(path.join(out,'project-country-live-proof.json'),JSON.stringify({...r,commands:[...commands.values()].map(x=>({commandType:x.command.commandType,commandDigest:digest(x.command),idempotencyKey:x.command.idempotencyKey,command:x.command,paths:x.paths,sent:x.sent,ack:x.ack||null,readback:x.readback||null,replayed:x.replayed===true}))},null,2)+'\n');
  const scopeReady=()=>page.waitForFunction(({uid,tenantId,projectId})=>{
    const c=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    return window.firebase?.auth?.().currentUser?.uid===uid&&c.authenticated===true&&c.role==='super'&&c.authNamespace==='staff'&&c.tenantId===tenantId&&
      window.CX?.data?.currentProjectId===projectId&&a.applied===true&&a.internalProjectAuthority===true&&a.tenantId===tenantId&&a.projectId===projectId&&
      window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&window.CX_C6_HR_AUTHORITY_GATE?.blocked===false&&window.CX_DEV_ENTRY_CANONICAL?.lane==='authenticated-human-canonical'&&
      (window.CX.data.__backendAllProjectRecords||[]).some(p=>(p.id||p.projectId)===projectId);
  },{uid:staffUid,tenantId,projectId},{timeout:120000});
  const inspect=async(command,ack)=>{
    const entry=commands.get(command.idempotencyKey);assert(entry?.sent,'UNREGISTERED_COMMAND');entry.ack=ack;
    const [p,receipt,audit]=await Promise.all([projectRef.get(),db.doc(entry.paths.receipt).get(),db.doc(entry.paths.audit).get()]);
    const check=validateCountryReadback({command,ack,record:p.data(),receipt:receipt.data(),audit:audit.data(),scope});
    assert(check.pass,'READBACK:'+check.errors.join(','));
    assert(p.updateTime.isEqual(receipt.updateTime)&&receipt.updateTime.isEqual(audit.updateTime),'TRANSACTION_POSTIMAGE');
    entry.receipt=receipt;entry.audit=audit;
    entry.readback={project:snapshotProof(p),receipt:snapshotProof(receipt),audit:snapshotProof(audit),validation:check};write();return p;
  };
  const routeHandler=async route=>{
    const req=route.request();if(['GET','HEAD','OPTIONS'].includes(req.method())){await route.continue();return;}
    let command;try{command=req.postDataJSON();}catch{handlerErrors.push('INVALID_COMMAND_BODY');await route.abort('blockedbyclient');return;}
    if(!['project.create','project.update'].includes(command?.commandType)){
      const scope=configurationRequestEvidence({method:req.method(),url:req.url(),body:command,tenantId,projectId:commercialProjectId,hrRevision});
      if(scope?.classification==='AUTHORIZED_HR_RECONCILIATION_NOT_CONFIGURATION_WRITE'){await route.continue();return;}
      handlerErrors.push('UNEXPECTED_COMMAND_DURING_COUNTRY_FIXTURE:'+String(command?.commandType||'unknown'));await route.abort('blockedbyclient');return;
    }
    try{
      assert(command.tenantId===tenantId,'OUTSIDE_TENANT');
      assert(command.commandType==='project.create'?command.payload?.name===name:command.projectId===projectId,'OUTSIDE_PROJECT');
      assert(command.payload?.periodId===periodId&&command.periodId===periodId,'OUTSIDE_PERIOD');
      assert(command.payload?.operationalSource?.mode==='internal','EXTERNAL_SOURCE');
      const prior=commands.get(command.idempotencyKey);
      if(prior){assert(digest(prior.command)===digest(command)&&prior.replayAuthorized===true,'UNAUTHORIZED_REUSE');}
      else{
        const paths=projectCommandPaths(tenantId,command),snapshots=await Promise.all([db.doc(paths.receipt).get(),db.doc(paths.audit).get()]);
        assert(snapshots.every(s=>!s.exists),'RECEIPT_COLLISION');
        commands.set(command.idempotencyKey,{command,paths,sent:false});write();
      }
      commands.get(command.idempotencyKey).sent=true;write();await route.continue();
    }catch(e){handlerErrors.push(String(e.message||e));await route.abort('blockedbyclient');}
  };
  const responseListener=async response=>{
    if(!/\/v1\/cxorbia\/commands/.test(response.url()))return;
    try{const cmd=response.request().postDataJSON(),entry=commands.get(cmd?.idempotencyKey);if(entry)entry.ack=await response.json();}catch{}
  };
  try{
    assert(/^\d+$/.test(runId),'RUN_ID_REQUIRED');
    const principal=await page.evaluate(()=>({uid:window.firebase?.auth?.().currentUser?.uid,...window.CX?.backendAuth?.context?.()}));
    assert(principal.uid===staffUid&&principal.role==='super'&&principal.authNamespace==='staff'&&principal.tenantId===tenantId,'EXISTING_SUPER_REQUIRED');
    const [before,commercial]=await Promise.all([projectRef.get(),commercialRef.get()]);assert(!before.exists,'PROJECT_COLLISION');preflightAbsent=true;commercialBefore=commercial;
    const catalog=await page.evaluate(()=>['GT','HN'].map(c=>(window.CX?.COUNTRIES||[]).find(x=>x.c===c)).map(x=>x?{code:x.c,currency:x.cur}:null));
    assert(catalog.every(x=>x&&x.currency),'CONFIGURED_COUNTRY_CATALOG');r.catalog=catalog;
    await page.route('**/v1/cxorbia/commands',routeHandler);routed=true;page.on('response',responseListener);
    const creation=await page.evaluate(async cfg=>window.CX.data.addProject(cfg),{name,countries:[catalog[0].code],currency:{[catalog[0].code]:catalog[0].currency},
      periodId,initialPeriodId:periodId,status:'draft',qaOnly:true,qaRunId:runId,qaRunAttempt:attempt,
      operationalSource:{mode:'internal',providerType:'internal_firestore',readPolicy:'internal_live',writePolicy:'platform_only',mappingRef:'internal-native-mapping'},
      __commandMeta:{ackAware:true,reason:'i3-country-proof'}});
    const createCommand=[...commands.values()].find(x=>x.command.commandType==='project.create')?.command;assert(createCommand,'CREATE_NOT_OBSERVED');await inspect(createCommand,creation);
    const qaUrl=new URL(originalUrl);qaUrl.searchParams.set('cxProjectId',projectId);
    await page.goto(qaUrl.toString(),{waitUntil:'domcontentloaded',timeout:90000});await scopeReady();
    const showCountries=async()=>{await page.evaluate(()=>window.CX.router.nav('config'));await page.locator('#view [data-tab="paises"]').click();await page.locator('#view [data-project-config-authority="provider"]').waitFor({state:'visible'});};
    const uiRead=async(countries,version)=>{
      await scopeReady();
      await page.waitForFunction(({projectId,countries,version})=>{const p=(window.CX?.data?.__backendAllProjectRecords||[]).find(x=>(x.id||x.projectId)===projectId);return p?.version===version&&JSON.stringify([...(p.countries||[])].sort())===JSON.stringify(countries.slice().sort());},{projectId,countries,version},{timeout:45000});
      await showCountries();
      await page.waitForFunction(({projectId,countries,catalog})=>{
        const p=(window.CX?.data?.__backendAllProjectRecords||[]).find(x=>(x.id||x.projectId)===projectId),body=document.querySelector('#durableCountries');
        const visible=[...(body?.querySelectorAll('[data-rmc]')||[])].map(x=>x.dataset.rmc).sort();
        return p&&JSON.stringify(visible)===JSON.stringify(countries.slice().sort())&&countries.every(c=>{const currency=catalog.find(x=>x.code===c).currency,row=body?.querySelector('[data-rmc="'+c+'"]')?.parentElement;return p.currency?.[c]===currency&&row?.innerText.includes('('+currency+')');});
      },{projectId,countries,catalog},{timeout:45000});
    };
    const cycle=async(label,countries,click)=>{
      await showCountries();
      const responsePromise=page.waitForResponse(res=>{try{const c=res.request().postDataJSON();return /\/v1\/cxorbia\/commands/.test(res.url())&&c?.commandType==='project.update'&&c.projectId===projectId;}catch{return false;}},{timeout:60000});
      await click();const response=await responsePromise,command=response.request().postDataJSON(),ack=await response.json();
      await inspect(command,ack);await uiRead(countries,ack.entityVersion);await page.screenshot({path:path.join(out,label+'-before-reload.png'),fullPage:true});
      await page.reload({waitUntil:'domcontentloaded',timeout:90000});await uiRead(countries,ack.entityVersion);await page.screenshot({path:path.join(out,label+'-after-reload.png'),fullPage:true});
      const entry=commands.get(command.idempotencyKey);entry.replayAuthorized=true;
      const replay=await page.evaluate(async c=>window.CX.commandHttpTransport.execute(c),command);assert(isAck(replay)&&replay.idempotentReplay===true&&replay.providerWrites===0,'REPLAY_ACK');
      await inspect(command,replay);entry.replayed=true;
      r.steps.push({label,uiAction:true,providerAck:true,durableReadback:true,pageReload:true,idempotentReplay:true,providerWritesOnReplay:0,countries,version:replay.entityVersion,commandDigest:digest(command)});write();
    };
    await cycle('add-country',catalog.map(x=>x.code),async()=>{await page.locator('#view #addPais').click();await page.locator('.cx-ov [data-c="'+catalog[1].code+'"]').click();});
    await cycle('remove-country',[catalog[0].code],async()=>page.locator('#durableCountries [data-rmc="'+catalog[1].code+'"]').click());
    assert(handlerErrors.length===0,'REQUEST_SCOPE_ERRORS');
    r.actionReal=r.steps.length===2;r.providerAck=r.steps.every(s=>s.providerAck);r.durableReadback=r.steps.every(s=>s.durableReadback);
    r.reloadProof=r.steps.every(s=>s.pageReload);r.noDuplicateRegression=r.steps.every(s=>s.idempotentReplay);r.samePrincipal=true;
  }catch(e){r.error=String(e.message||e);}
  finally{
    if(routed){try{await page.unroute('**/v1/cxorbia/commands',routeHandler);}catch(e){r.teardownError=String(e.message||e);}page.off('response',responseListener);}
    try{
      if(preflightAbsent&&commands.size){
        // Resolve every dispatched command before cleanup. Missing/ambiguous ACK
        // is not evidence that a write did not happen; preserve on uncertainty.
        for(const entry of commands.values()){
          if(!entry.sent)continue;
          const [receipt,audit]=await Promise.all([db.doc(entry.paths.receipt).get(),db.doc(entry.paths.audit).get()]);
          if(!receipt.exists&&!audit.exists&&entry.ack?.status==='blocked'&&entry.ack?.ok===false&&entry.ack?.committed===false&&entry.ack?.providerAck===false&&entry.ack?.providerWrites===0)continue;
          assert(receipt.exists&&audit.exists,'AMBIGUOUS_COMMAND_PRESERVE');
          const p=receipt.data(),a=audit.data();
          assert(p.status==='committed'&&p.providerAck===true&&p.commandDigest===digest(entry.command)&&p.actorUid===staffUid&&p.projectId===projectId&&
            a.actorUid===staffUid&&a.projectId===projectId&&a.idempotencyKey===entry.command.idempotencyKey,'CLEANUP_AUTHORITY');
          if(entry.receipt)assert(entry.receipt.updateTime.isEqual(receipt.updateTime)&&entry.audit.updateTime.isEqual(audit.updateTime),'RECEIPT_CHANGED');
          entry.receipt=receipt;entry.audit=audit;
        }
        const current=await projectRef.get(),committed=[...commands.values()].filter(x=>x.receipt);
        if(current.exists){
          const latest=committed.sort((a,b)=>b.receipt.data().entityVersion-a.receipt.data().entityVersion)[0];
          assert(latest,'PROJECT_WITHOUT_OWN_RECEIPT');
          const record=current.data();assert(record.name===name&&record.qaOnly===true&&record.qaRunId===runId&&record.createdBy===staffUid&&record.version===latest.receipt.data().entityVersion,'PROJECT_OWNERSHIP');
          assert(current.updateTime.isEqual(latest.receipt.updateTime),'PROJECT_CHANGED_SINCE_OWN_COMMAND');
          const lastPayload=latest.command.payload;
          assert(record.periodId===periodId&&record.operationalSource?.mode==='internal'&&JSON.stringify([...(record.countries||[])].sort())===JSON.stringify([...(lastPayload.countries||[])].sort())&&
            (record.countries||[]).every(c=>record.currency?.[c]===lastPayload.currency?.[c]),'PROJECT_POSTIMAGE_CHANGED');
          const collections=await projectRef.listCollections();for(const c of collections)assert((await c.limit(1).get()).empty,'UNEXPECTED_PROJECT_DEPENDENCIES');
          const owned=[current,...committed.flatMap(x=>[x.receipt,x.audit])];
          r.cleanup={decision:'VERIFIED_OWNED_PREIMAGES_BEFORE_DELETE',before:owned.map(snapshotProof)};write();
          await db.runTransaction(async tx=>{
            const fresh=await tx.getAll(...owned.map(x=>x.ref));
            fresh.forEach((s,i)=>assert(s.exists&&s.updateTime.isEqual(owned[i].updateTime),'CLEANUP_CONCURRENT_CHANGE'));
            for(const s of fresh)tx.delete(s.ref);
          });
          const after=await db.getAll(...owned.map(s=>s.ref));assert(after.every(s=>!s.exists),'CLEANUP_RESIDUE');
          r.cleanup={...r.cleanup,decision:'PASS_OWNED_FIXTURE_CLEANUP',deleted:owned.length,remaining:0};r.cleanupVerified=true;
        }else{
          assert(committed.length===0,'PROJECT_MISSING_WITH_RECEIPT');r.cleanup={decision:'PASS_NO_FIXTURE_WRITES',deleted:0,remaining:0};r.cleanupVerified=true;
        }
      }else if(preflightAbsent){r.cleanup={decision:'PASS_NO_FIXTURE_WRITES',deleted:0,remaining:0};r.cleanupVerified=true;}
    }catch(e){r.cleanup={...r.cleanup,decision:'HOLD_PRESERVED_FOR_EXACT_RECOVERY',error:String(e.message||e),projectId,paths:[...commands.values()].flatMap(x=>Object.values(x.paths))};}
    try{
      await page.goto(originalUrl,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(({uid,projectId})=>window.firebase?.auth?.().currentUser?.uid===uid&&window.CX?.data?.currentProjectId===projectId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{uid:staffUid,projectId:commercialProjectId},{timeout:150000});
      if(commercialBefore){const after=await commercialRef.get();r.commercialProjectUnchanged=after.exists===commercialBefore.exists&&(!after.exists||after.updateTime.isEqual(commercialBefore.updateTime));}
      r.returnedToCommercialProject=true;
    }catch(e){r.restoreError=String(e.message||e);}
    r.handlerErrors=handlerErrors;
    if(!r.error&&!r.restoreError&&!r.teardownError&&handlerErrors.length===0&&['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression','cleanupVerified','samePrincipal','commercialProjectUnchanged'].every(k=>r[k]===true))r.decision='PASS_I3_PROJECT_COUNTRY_UI_PROVIDER_RELOAD_REPLAY_CLEANUP';
    write();
  }
  return r;
}
