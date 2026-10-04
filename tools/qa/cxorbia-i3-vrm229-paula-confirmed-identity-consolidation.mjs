#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const PERIOD='cinepolis-2026-10';
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.VRM229_OUT||'.tmp/i3-vrm229-human-identity-consolidation').trim();
const AUTHORITY='CXORBIA_I3_SHOPPER_HUMAN_IDENTITY_AUTHORITY_2026-10-04.json';
const REASON='paula_confirmed_same_human_2026_10_04';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=v=>v?sha(v).slice(0,20):null;
const groups=[
 {name:'Herbert Ríos',country:'GT',canonical:'shp-58a449f10a07',aliases:['shopper_gt_f65cbc6391','shopper_gt_1f90bb8a75','shopper_gt_ce6a976e54','shr-1780546721750-1x5f','shr-1780611985141-8vob'],hr:'shopper_gt_f65cbc6391',preseedHrAlias:true},
 {name:'Elizabeth González',country:'GT',create:{firstName:'Elizabeth',lastName:'González'},aliases:['shopper_gt_833dc86954','shp-4f1e8e2a732d'],hr:'shopper_gt_833dc86954'},
 {name:'Andrea Loarca',country:'GT',canonical:'shopper_gt_338ec57592',aliases:['shopper_gt_2c6d1482e1','shopper_gt_5f3d6952c5','shp-70c0a261cf19','shp-ba6a7453ed52','shp-ddbbeb1b9b21','shr-1780549926671-kgdw','shr-1780611985064-yytw'],hr:'shopper_gt_5f3d6952c5'},
 {name:'Cinthya Lixon',country:'GT',canonical:'shopper_gt_2e8200a26e',aliases:['shopper_gt_3023959720','shopper_gt_d5ebad6b6c','shopper_gt_fc5d6fb927','shp-104d73902cd7','shp-2506521e881f','shp-a363a6ab7703','shp-fa91793ac5e8','shr-1780549926665-tr83','shr-1780960372089-re1c'],hr:'shopper_gt_fc5d6fb927'},
 {name:'Erick Gomez',country:'GT',canonical:'shp-0780f6f085b1',aliases:['hrsh-bde02d49','shopper_gt_3106d9d44b','shopper_gt_eaa6f8aa33','shp-998662c24ca7'],hr:'shopper_gt_3106d9d44b'},
 {name:'Joshua Urbina',country:'HN',create:{firstName:'Joshua',lastName:'Urbina'},aliases:['shopper_hn_fc52fabe94','shp-39a41745def0'],hr:'shopper_hn_fc52fabe94'},
 {name:'Aldair Ixcayau',country:'GT',canonical:'shopper_gt_5eb6ba4913',aliases:['shopper_gt_117b1b39de','shopper_gt_3426ec3ff3','shp-4d76037b4857','shp-ebc05156bb0c','shp-fc094d9ca23d','shr-1780611985147-gwhm','shr-1780960372063-48th'],hr:'shopper_gt_3426ec3ff3'},
 {name:'Flavio Salgado',country:'HN',canonical:'shopper_hn_ff2ec7a471',aliases:['shopper_hn_99cb2f9b05','shp-6a90516aa4b1','shp-c27acf2292a2','shr-1780546721749-irem','shr-1780611985184-dc8m','shr-1780960372216-k23x'],hr:'shopper_hn_99cb2f9b05'}
];
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];

fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm229.human-identity-consolidation.v1',decision:'HOLD',authority:AUTHORITY,reason:REASON,expectedHrRevision:EXPECTED_HR,persons:[],providerAck:false,idempotentReplay:false,durableReadback:false,hrWrites:0,externalWrites:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM229_EXPECTED_HR_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const profiles=tenant.collection('shoppers'),users=tenant.collection('users'),cross=tenant.collection('shopperIdentityCrosswalk'),reviews=tenant.collection('shopperIdentityReviews');

async function hrSnapshot(tag){
 const r=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm229='+encodeURIComponent(tag)+'-'+Date.now(),{headers:{'cache-control':'no-cache,no-store,max-age=0'},signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM229_HR_HTTP_'+r.status);
 const body=await r.json(),snap=body.snapshot||body.data||body,revision=str(body.revision||body._runtime?.revision||snap.sourceRevision||snap.revision);
 if(revision!==EXPECTED_HR)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM229_HR_DRIFT_'+revision);
 return {snap,revision};
}
async function superActor(){
 const snap=await users.get(),rows=snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
 for(const row of rows){try{const u=await auth.getUser(row.uid),c=u.customClaims||{};if(u.disabled!==true&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&str(c.authNamespace).toLowerCase()==='staff')return row;}catch{}}
 throw new Error('AUTH_FAILURE:VRM229_SUPER_ACTOR_MISSING');
}
async function activeMembers(shopperId){
 const snap=await users.where('shopperId','==',shopperId).get();
 return snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper'&&arr(x.projectIds).map(String).includes(PROGRAM));
}
function refsIdentity(row,set){
 return ownerFields.some(k=>set.has(str(row?.[k])))||ownerArrays.some(k=>arr(row?.[k]).some(v=>set.has(str(v))));
}
async function residualRefs(aliasIds){
 const set=new Set(aliasIds),hits=[];
 for(const [scope,name] of domains){
   const col=scope==='tenant'?tenant.collection(name):project.collection(name),snap=await col.get();
   for(const doc of snap.docs)if(refsIdentity(doc.data()||{},set))hits.push({scope,collection:name,idFingerprint:fp(doc.id)});
 }
 return hits;
}
async function preseedHerbertHrAlias(hr){
 const id='shopper_gt_f65cbc6391';
 const hrPresent=arr(hr.snap.shoppers).some(x=>str(x.id||x.shopperId)===id)||arr(hr.snap.visits).some(x=>str(x.shopperId)===id);
 if(!hrPresent)throw new Error('MAPPING_FAILURE:VRM229_HERBERT_CURRENT_HR_ID_MISSING');
 const [p,c]=await Promise.all([profiles.doc(id).get(),cross.doc(id).get()]);
 if(p.exists)return {created:false,reason:'profile_already_exists'};
 if(c.exists)return {created:false,reason:'crosswalk_already_exists',shopperId:str((c.data()||{}).shopperId)};
 await cross.doc(id).set({
   tenantId:TENANT,shopperId:id,sourceStableKey:id,projectIds:[PROGRAM],sourceType:'hr_external',
   identityMode:'exact_technical_keys_only',fuzzyMatching:false,
   humanIdentityAuthority:AUTHORITY,humanIdentityAuthorityReason:REASON,
   preAdjudication:true,updatedAt:new Date().toISOString()
 },{merge:false});
 const rb=await cross.doc(id).get();
 if(!rb.exists||str((rb.data()||{}).shopperId)!==id||str((rb.data()||{}).sourceStableKey)!==id)throw new Error('PERSISTENCE_FAILURE:VRM229_HERBERT_PRESEED_READBACK');
 return {created:true,reason:'bounded_exact_hr_crosswalk_seed'};
}
async function verifyBefore(group,canonicalId,hr){
 if(!arr(hr.snap.visits).some(v=>str(v.shopperId)===group.hr)&&!arr(hr.snap.shoppers).some(s=>str(s.id||s.shopperId)===group.hr))throw new Error('MAPPING_FAILURE:VRM229_HR_ID_NOT_CURRENT:'+group.name);
 const c=await profiles.doc(canonicalId).get();
 if(!c.exists)throw new Error('MAPPING_FAILURE:VRM229_CANONICAL_PROFILE_MISSING:'+group.name);
 for(const id of group.aliases){
   const [p,x]=await Promise.all([profiles.doc(id).get(),cross.doc(id).get()]);
   if(!p.exists&&!x.exists)throw new Error('MAPPING_FAILURE:VRM229_ALIAS_UNKNOWN:'+group.name+':'+id);
 }
}
async function readback(group,canonicalId,ack){
 const allIds=uniq([canonicalId,...group.aliases]),aliases=allIds.filter(x=>x!==canonicalId);
 const ca=await activeMembers(canonicalId);
 if(ca.length!==1)throw new Error('AUTH_FAILURE:VRM229_CANONICAL_ACTIVE_COUNT:'+group.name+':'+ca.length);
 const keeper=await auth.getUser(ca[0].uid),claims=keeper.customClaims||{};
 if(keeper.disabled===true||str(claims.shopperId)!==canonicalId||str(claims.tenantId)!==TENANT)throw new Error('AUTH_FAILURE:VRM229_CANONICAL_AUTH:'+group.name);
 for(const id of aliases){
   if((await activeMembers(id)).length)throw new Error('AUTH_FAILURE:VRM229_ALIAS_ACTIVE:'+group.name+':'+id);
   const cw=await cross.doc(id).get();
   if(!cw.exists||str((cw.data()||{}).shopperId)!==canonicalId)throw new Error('MAPPING_FAILURE:VRM229_ALIAS_CROSSWALK:'+group.name+':'+id);
   const pp=await profiles.doc(id).get();
   if(pp.exists){
     const pd=pp.data()||{};
     if(str(pd.identityState)!=='superseded_exact_alias'||str(pd.supersededByShopperId)!==canonicalId)throw new Error('PERSISTENCE_FAILURE:VRM229_ALIAS_PROFILE:'+group.name+':'+id);
   }
 }
 const cp=await profiles.doc(canonicalId).get(),cd=cp.data()||{};
 if(!cp.exists||str(cd.shopperId)!==canonicalId)throw new Error('PERSISTENCE_FAILURE:VRM229_CANONICAL_PROFILE:'+group.name);
 const rs=await reviews.get(),identitySet=new Set(allIds);
 const active=rs.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>str(x.status||'active')==='active').filter(x=>{
   const ids=uniq([x.shopperId,x.sourceShopperId,x.canonicalShopperId,...arr(x.shopperIds),...arr(x.candidateShopperIds)]);
   return ids.length>0&&ids.every(id=>identitySet.has(id));
 });
 if(active.length)throw new Error('PERSISTENCE_FAILURE:VRM229_REVIEW_REMAINS_ACTIVE:'+group.name+':'+active.length);
 const residual=await residualRefs(aliases);
 if(residual.length)throw new Error('PERSISTENCE_FAILURE:VRM229_ALIAS_DOMAIN_REFS:'+group.name+':'+residual.length);
 return {
   canonicalHumanName:group.name,canonicalShopperId:canonicalId,visibleName:str(cd.nombre||cd.name||[cd.firstName,cd.lastName].filter(Boolean).join(' ')),
   visibleLogin:str(ca[0].visibleLogin||cd.visibleLogin||cd.username||cd.user),activeCanonicalPrincipals:1,activeAliasPrincipals:0,
   aliasCount:aliases.length,aliasDomainResiduals:0,activeReviewResiduals:0,keeperUidFingerprint:fp(ca[0].uid),
   identityLinkId:str(ack.identityLinkId),resolvedIdentityReviews:Number(ack.resolvedIdentityReviews||0)
 };
}

let browser=null;
try{
 const hrBefore=await hrSnapshot('before');
 const preseed=await preseedHerbertHrAlias(hrBefore);
 const actor=await superActor();
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'}),page=await context.newPage();
 const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
 await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(actor.uid));
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&typeof window.CX?.data?.adjudicateShopperIdentity==='function'&&typeof window.CX?.data?.addShopper==='function',null,{timeout:120000});
 await page.evaluate(period=>window.CX?.data?.setCurrentPeriod?.(period),PERIOD);

 result.preseed={Herbert:preseed};
 for(const group of groups){
   let canonicalId=group.canonical,createAck=null,createReplay=null;
   if(group.create){
     const payload={firstName:group.create.firstName,lastName:group.create.lastName,nombre:group.name,pais:group.country,country:group.country,sourceType:'platform',createdVia:'paula_human_identity_authority',sourceRef:AUTHORITY};
     const create=()=>page.evaluate(async p=>await window.CX.data.addShopper({...p,__commandMeta:{ackAware:true,reason:'paula_human_identity_authority_2026_10_04'}}),payload);
     createAck=await create();
     if(createAck?.ok!==true||createAck?.providerAck!==true||!str(createAck?.entityId))throw new Error('PERSISTENCE_FAILURE:VRM229_CREATE_ACK:'+group.name+':'+str(createAck?.code||createAck?.status));
     canonicalId=str(createAck.entityId);
     createReplay=await create();
     if(createReplay?.ok!==true||createReplay?.providerAck!==true||createReplay?.idempotentReplay!==true||str(createReplay?.entityId)!==canonicalId)throw new Error('PERSISTENCE_FAILURE:VRM229_CREATE_REPLAY:'+group.name);
   }
   group.aliases=uniq(group.aliases).filter(x=>x!==canonicalId);
   await verifyBefore(group,canonicalId,hrBefore);
   const call=()=>page.evaluate(async input=>await window.CX.data.adjudicateShopperIdentity(input.canonical,input.aliases,{ackAware:true,reason:input.reason}),{canonical:canonicalId,aliases:group.aliases,reason:REASON});
   const ack1=await call();
   if(ack1?.ok!==true||ack1?.providerAck!==true||ack1?.identityConsolidated!==true)throw new Error('PERSISTENCE_FAILURE:VRM229_MERGE_ACK:'+group.name+':'+str(ack1?.code||ack1?.status));
   if(str(ack1.canonicalShopperId||ack1.entityId)!==canonicalId)throw new Error('MAPPING_FAILURE:VRM229_CANONICAL_ACK:'+group.name);
   if(Number(ack1.hrWrites||0)!==0||Number(ack1.externalWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM229_EXTERNAL_WRITE:'+group.name);
   const ack2=await call();
   if(ack2?.ok!==true||ack2?.providerAck!==true||ack2?.idempotentReplay!==true||Number(ack2?.providerWrites||0)!==0||str(ack2?.idempotencyKey)!==str(ack1?.idempotencyKey))throw new Error('PERSISTENCE_FAILURE:VRM229_REPLAY:'+group.name);
   const rb=await readback(group,canonicalId,ack1);
   result.persons.push({
     name:group.name,country:group.country,currentHrIdentity:group.hr,canonicalShopperId:canonicalId,
     createdCanonical:!!group.create,createProviderAck:createAck?.providerAck===true,createReplay:createReplay?createReplay.idempotentReplay===true:null,
     mergeProviderAck:true,mergeReplay:true,retiredPrincipalCount:Number(ack1.retiredPrincipalCount||0),
     resolvedIdentityReviews:Number(ack1.resolvedIdentityReviews||0),readback:rb
   });
   save();
 }
 const hrAfter=await hrSnapshot('after');
 if(hrAfter.revision!==hrBefore.revision)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM229_HR_CHANGED');
 for(const group of groups){
   const present=arr(hrAfter.snap.shoppers).some(x=>str(x.id||x.shopperId)===group.hr)||arr(hrAfter.snap.visits).some(x=>str(x.shopperId)===group.hr);
   if(!present)throw new Error('MAPPING_FAILURE:VRM229_HR_ID_DISAPPEARED:'+group.name);
 }
 result.hrRevision=hrAfter.revision;
 result.personCount=result.persons.length;
 result.providerAck=result.persons.every(x=>x.mergeProviderAck===true);
 result.idempotentReplay=result.persons.every(x=>x.mergeReplay===true);
 result.durableReadback=result.persons.every(x=>x.readback?.activeCanonicalPrincipals===1&&x.readback?.activeAliasPrincipals===0&&x.readback?.aliasDomainResiduals===0&&x.readback?.activeReviewResiduals===0);
 result.decision=result.personCount===8&&result.providerAck&&result.idempotentReplay&&result.durableReadback?'PASS_VRM229_PAULA_CONFIRMED_IDENTITY_CONSOLIDATION':'FAIL_VRM229_PAULA_CONFIRMED_IDENTITY_CONSOLIDATION';
 save();console.log(JSON.stringify(result,null,2));
 if(result.decision!=='PASS_VRM229_PAULA_CONFIRMED_IDENTITY_CONSOLIDATION')process.exitCode=2;
 await context.close();
}catch(error){
 result.decision='FAIL_VRM229_PAULA_CONFIRMED_IDENTITY_CONSOLIDATION';result.error=str(error?.stack||error);save();console.error(result.error);process.exitCode=2;
}finally{try{if(browser)await browser.close();}catch{}}
