import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PHASEA_LIVE_OUT||'');
const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
if(!OUT||!ROOT||!SOURCE||!EXPECTED_HR)throw new Error('ENVIRONMENT_FAILURE:PHASEA_LIVE_ENV_MISSING');
fs.mkdirSync(OUT,{recursive:true});
const write=v=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(v,null,2)+'\n');
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const tenantId='tya',projectId='cinepolis';
const PAULA_VISIBLE_LOGIN=str(process.env.PAULA_VISIBLE_LOGIN||'paula.osorio').toLowerCase();
const PAULA_EXACT_HR_ID=str(process.env.PAULA_EXACT_HR_ID||'shopper_gt_1440137b73');

const DESCRIPTOR_PATH=String(process.env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json');
const descriptor=JSON.parse(fs.readFileSync(DESCRIPTOR_PATH,'utf8'));
if(String(descriptor.activeBlocker||'')==='D02_PARSER_LIVE_SMOKE_REQUIRED'){
  const DOCX_B64='UEsDBBQAAAAIAI5sUV0XmADX6wAAALIBAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbH1QyU4DMQy98xWRr2gmAweEUKc9sByBQ/kAK/HMRM2mOC3t3+NpoQdUONpvs99itQ9e7aiwS7GHm7YDRdEk6+LYw8f6pbkHxRWjRZ8i9XAghtXyarE+ZGIl4sg9TLXmB63ZTBSQ25QpCjKkErDKWEad0WxwJH3bdXfapFgp1qbOHiBmTzTg1lf1vJf96ZJCnkE9nphzWA+Ys3cGq+B6F+2vmOY7ohXlkcOTy3wtBNCXI2bo74Qf4ZuUU5wl9Y6lvmIQmv5MxWqbzDaItP3f58KlaRicobN+dsslGWKW1oNvz0hAF88f6GPlyy9QSwMEFAAAAAgAjmxRXT+t/vqvAAAALAEAAAsAAABfcmVscy8ucmVsc43POw7CMAwA0J1TRN5pWgaEUEMXhNQVlQNEiZtWNB/F4dPbk4EBKgZG/57tunnaid0x0uidgKoogaFTXo/OCLh0p/UOGCXptJy8QwEzEjSHVX3GSaY8Q8MYiGXEkYAhpbDnnNSAVlLhA7pc6X20MuUwGh6kukqDfFOWWx4/DVigrNUCYqsrYN0c8B/c9/2o8OjVzaJLP3YsOrIso8Ek4OGj5vqdLjILPJ/Dv548vABQSwMEFAAAAAgAjmxRXTLcxFQRAQAAbgQAABEAAAB3b3JkL2RvY3VtZW50LnhtbO1Uy2rDMBC85ysW3Ru5OZRiYoc2DzAUUkJSclUk1VmQtEaSnebvu3bpX+Qykna1M5rDaLn68Q4GGxNSqMTzvBBggyaDoa3E6bh7ehWQsgpGOQq2EnebxKqeLW+lId17GzIwQ0jlrRLXnLtSyqSv1qs0p84G7n1T9CrzMbbyRtF0kbRNiQW8k4uieJFeYRD1DIBZL2TuNa/dCHGEXK/P+8N78wabYgEfzdcWNvv1GXbN+Xg6bIH5MmlyBHZQrleanYDGYGHAhFmBJt9FZSgCsrM2YB6vomGfyF3l0CgDycYBeRb+3kdcaPs4tdhn59Ajm6WH3EPuIcdySzlGc8Q44RTYZHX+jHIqTEmejbv/n6L+BVBLAQIUAxQAAAAIAI5sUV0XmADX6wAAALIBAAATAAAAAAAAAAAAAACAAQAAAABbQ29udGVudF9UeXBlc10ueG1sUEsBAhQDFAAAAAgAjmxRXT+t/vqvAAAALAEAAAsAAAAAAAAAAAAAAIABHAEAAF9yZWxzLy5yZWxzUEsBAhQDFAAAAAgAjmxRXTLcxFQRAQAAbgQAABEAAAAAAAAAAAAAAIAB9AEAAHdvcmQvZG9jdW1lbnQueG1sUEsFBgAAAAADAAMAuQAAADQDAAAAAA==';
  const PDF_B64='JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDcgMCBSIC9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0gL1BhcmVudCA2IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgNiAwIFIgL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0F1dGhvciAoYW5vbnltb3VzKSAvQ3JlYXRpb25EYXRlIChEOjIwMjYxMDE3MTMzNjM2KzAwJzAwJykgL0NyZWF0b3IgKGFub255bW91cykgL0tleXdvcmRzICgpIC9Nb2REYXRlIChEOjIwMjYxMDE3MTMzNjM2KzAwJzAwJykgL1Byb2R1Y2VyIChSZXBvcnRMYWIgUERGIExpYnJhcnkgLSBcKG9wZW5zb3VyY2VcKSkgCiAgL1N1YmplY3QgKHVuc3BlY2lmaWVkKSAvVGl0bGUgKHVudGl0bGVkKSAvVHJhcHBlZCAvRmFsc2UKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0NvdW50IDEgL0tpZHMgWyAzIDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKNyAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAzMzkKPj4Kc3RyZWFtCkdhdWE5YkErcEsnTF9da01IUkFuWyREZVNaPjpFdSUiWF87UT5EOFZMMEpLOXEiPVQuZTxZN2lLNEBmMjVgPDI0U2o+LkBoSmVqbzw9LGAxKmA8NCk2YkomKnBFQEhqTS0wXT5UJSFYRlEkaz1EKm9eayNRRk00bzVPWzFWLDt1LVNEPic6UkFXbj1fcD5VNF1UVzJqRVBxPVAvMDhpUlRaM0gyRjdTYUskJyQ/TT8vVFktS04zV1tVbUk7WGVnKmksbiYwREktLWVMYE9mTGNwRGI4Y01FSFElJkxHdEwjPSYuVyI1N11JdT5Ka0ZJZ1s6ZSwwOCxKdUlUPE82M2ZicFxEazMsYG1Ebl9jPjRDOVpcSVNRN0RtIzYiUGQ5IzJyX09QLkwqJDR0ZUleKmRdPEhUQGJZI1RUY25nZGIzI0puL1RyPTlVIzpTU28zJ2B+PmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAwOTIgMDAwMDAgbiAKMDAwMDAwMDE5OSAwMDAwMCBuIAowMDAwMDAwMzkyIDAwMDAwIG4gCjAwMDAwMDA0NjAgMDAwMDAgbiAKMDAwMDAwNzIxIDAwMDAwIG4gCjAwMDAwMDA3ODAgMDAwMDAgbiAKdHJhaWxlcgo8PAovSUQgCls8MjE5NWE4NmY2NTJmZTc5ZjNjYjFhMzMwMWYzZjVhMGE+PDIxOTVhODZmNjUyZmU3OWYzY2IxYTMzMDFmM2Y1YTBhPl0KJSBSZXBvcnRMYWIgZ2VuZXJhdGVkIFBERiBkb2N1bWVudCAtLSBkaWdlc3QgKG9wZW5zb3VyY2UpCgovSW5mbyA1IDAgUgovUm9vdCA0IDAgUgovU2l6ZSA4Cj4+CnN0YXJ0eHJlZgoxMjA5CiUlRU9GCg==';
  const d02Browser=await chromium.launch({headless:true});
  const d02Ctx=await d02Browser.newContext({viewport:{width:1280,height:900}});
  const d02Page=await d02Ctx.newPage();
  const aiRequests=[];
  d02Page.on('request',req=>{const u=req.url();if(/generativelanguage\.googleapis\.com|aiplatform\.googleapis\.com|api\.openai\.com|api\.anthropic\.com/i.test(u))aiRequests.push(u);});
  const d02Url=ROOT+'/index-backend-dev.html?cxProjectId='+encodeURIComponent(projectId)+'&d02smoke='+Date.now();
  await d02Page.goto(d02Url,{waitUntil:'domcontentloaded',timeout:90000});
  await d02Page.waitForFunction(()=>typeof window.CX?.ai?.extractAttachment==='function'&&typeof window.mammoth?.extractRawText==='function',null,{timeout:90000});
  const parsed=await d02Page.evaluate(async({docx,pdf})=>{
    const bytes=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const docxFile=new File([bytes(docx)],'cxorbia-d02-live.docx',{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    const pdfFile=new File([bytes(pdf)],'cxorbia-d02-live.pdf',{type:'application/pdf'});
    const [docxResult,pdfResult]=await Promise.all([window.CX.ai.extractAttachment(docxFile),window.CX.ai.extractAttachment(pdfFile)]);
    return {docx:docxResult,pdf:pdfResult};
  },{docx:DOCX_B64,pdf:PDF_B64});
  const slim=x=>({ok:x?.ok===true,code:String(x?.code||''),format:String(x?.format||''),parser:String(x?.parser||''),source_sha256:String(x?.source_sha256||''),quality:x?.extraction_quality||null,manualFallback:x?.manualFallback===true,ocrExecuted:x?.ocrExecuted===true,text:String(x?.text||'')});
  const docx=slim(parsed.docx),pdf=slim(parsed.pdf);
  if(!docx.ok||docx.format!=='docx'||docx.parser!=='mammoth'||docx.manualFallback||docx.ocrExecuted||!docx.quality?.sufficient||!/^[0-9a-f]{64}$/.test(docx.source_sha256)||!docx.text.includes('CXORBIA D02 LIVE DOCX FIXTURE'))throw new Error('FUNCTIONAL_DEFECT:D02_DOCX_LIVE:'+JSON.stringify(docx));
  if(!pdf.ok||pdf.format!=='pdf'||!pdf.parser.startsWith('pdfjs-')||pdf.manualFallback||pdf.ocrExecuted||!pdf.quality?.sufficient||!/^[0-9a-f]{64}$/.test(pdf.source_sha256)||!pdf.text.includes('CXORBIA D02 LIVE PDF FIXTURE'))throw new Error('FUNCTIONAL_DEFECT:D02_PDF_LIVE:'+JSON.stringify(pdf));
  if(aiRequests.length)throw new Error('FUNCTIONAL_DEFECT:D02_BROWSER_AI_PROVIDER_CALL:'+JSON.stringify(aiRequests));
  const result={schemaVersion:'cxorbia.i3.d02.live-parser-smoke.v1',decision:'PASS_I3_D02_PARSER_LIVE_SMOKE',sourceSha:SOURCE,sourceTree:String(descriptor.productTreeAuthority||''),hostingVersion:String(descriptor.currentMaterialization?.hostingVersion||''),runtimeRevision:String(descriptor.currentMaterialization?.runtimeRevision||''),hrRevision:EXPECTED_HR,docx:{ok:docx.ok,parser:docx.parser,quality:docx.quality,source_sha256:docx.source_sha256,ocrExecuted:docx.ocrExecuted},pdf:{ok:pdf.ok,parser:pdf.parser,quality:pdf.quality,source_sha256:pdf.source_sha256,ocrExecuted:pdf.ocrExecuted},providerRequests:0,writes:0,deploys:0,production:false,authenticApprovedDocumentProof:'PENDING_D01_D03'};
  write(result);console.log(JSON.stringify(result,null,2));
  await d02Ctx.close();await d02Browser.close();process.exit(0);
}

const [metaRes,jsonRes]=await Promise.all([
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&phasealive='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}),
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&phasealive='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)})
]);
if(!metaRes.ok||!jsonRes.ok)throw new Error('PROVIDER_FAILURE:PHASEA_HR_HTTP');
const meta=await metaRes.json(),body=await jsonRes.json(),snap=body.snapshot||body.data||body;
const revision=str(meta.revision||body.revision||body._runtime?.revision||snap.sourceRevision);
if(revision!==EXPECTED_HR||meta.ok!==true||meta.revisionStable!==true||meta.sourceSafe!==true||body.sourceSafe!==true)throw new Error('PROVIDER_FAILURE:PHASEA_HR_REVISION:'+JSON.stringify({revision,expected:EXPECTED_HR,meta}));
const periodKey=str(snap.source?.currentCalendarPeriodKey||body.currentCalendarPeriodKey||'');
const periodMeta=arr(snap.periods).find(p=>str(p.key)===periodKey)||null;
const periodId=str(periodMeta?.id||('cinepolis-'+periodKey));
const currentHrVisits=arr(snap.visits).filter(v=>str(v.periodKey)===periodKey);
const facet=v=>v?.canonicalFacets||{};
if(!periodKey||!periodId||!currentHrVisits.length)throw new Error('SOURCE_FAILURE:PHASEA_CURRENT_PERIOD_MISSING');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const [membersSnap,profilesSnap,crossSnap]=await Promise.all([
  tenant.collection('users').get(),
  tenant.collection('shoppers').get(),
  tenant.collection('shopperIdentityCrosswalk').get()
]);
const members=membersSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const profiles=profilesSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const crosswalks=crossSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const aliasToProfile=new Map();
for(const p of profiles){
  const aliases=new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean));
  for(const a of aliases)if(!aliasToProfile.has(a))aliasToProfile.set(a,p.id);
}
for(const c of crosswalks){
  const canonical=str(c.shopperId||c.canonicalShopperId);
  if(canonical)aliasToProfile.set(str(c.id),canonical);
}
const resolveProfileId=raw=>{
  const start=str(raw);if(!start)return '';
  let cur=start;
  for(let i=0;i<8;i++){
    const next=str(aliasToProfile.get(cur)||cur);
    if(!next||next===cur)return next||cur;
    cur=next;
  }
  throw new Error('MAPPING_FAILURE:IDENTITY_CROSSWALK_CYCLE:'+start);
};
const profileName=p=>str(p.nombre||p.displayName||[p.firstName,p.lastName].filter(Boolean).join(' '));
const requiredProfileFields=p=>[
  ['firstName',p.firstName],['lastName',p.lastName],['whatsapp',p.whatsapp||p.phone],['email',p.email],['ciudad',p.ciudad],['depto',p.depto],
  ['edad',p.edad],['sexo',p.sexo],['dpi',p.dpi],['banco',p.banco],['ctaTipo',p.ctaTipo],['ctaNum',p.ctaNum],['ctaTitular',p.ctaTitular],['ctaMoneda',p.ctaMoneda]
].filter(([,v])=>!str(v)).map(([k])=>k);
const authExists=async uid=>{try{await auth.getUser(uid);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};

const targetNames=['Julissa Flores','Priscila López','Paula Osorio'];
const targets=[],profileById=new Map(profiles.map(p=>[p.id,p]));
for(const name of targetNames){
  const namedProfiles=profiles.filter(p=>norm(profileName(p))===norm(name));
  if(!namedProfiles.length)throw new Error('MAPPING_FAILURE:TARGET_PROFILE_NAME_MISSING_'+norm(name).replace(/\s+/g,'_'));
  const operational=[];
  for(const m of members.filter(m=>m.active===true&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper')){
    const resolved=resolveProfileId(m.shopperId),profile=profileById.get(resolved);
    if(profile&&norm(profileName(profile))===norm(name)&&await authExists(m.id))operational.push({member:m,profile,resolved});
  }
  let selected=null,selectionAuthority='unique_display_name_operational';
  if(norm(name)===norm('Paula Osorio')){
    const exact=operational.filter(x=>x.resolved===PAULA_EXACT_HR_ID&&str(x.member.visibleLogin||x.member.username||x.member.user).toLowerCase()===PAULA_VISIBLE_LOGIN);
    if(exact.length!==1)throw new Error('MAPPING_FAILURE:TARGET_EXACT_AUTHORITY_PRINCIPAL_paula_osorio:'+JSON.stringify({expectedShopperId:PAULA_EXACT_HR_ID,expectedVisibleLogin:PAULA_VISIBLE_LOGIN,namedProfiles:namedProfiles.map(p=>({id:p.id,name:profileName(p),resolved:resolveProfileId(p.id)})),operational:operational.map(x=>({uid:x.member.id,shopperId:x.member.shopperId,visibleLogin:x.member.visibleLogin,resolved:x.resolved,profileId:x.profile.id}))}));
    selected=exact[0];
    selectionAuthority='exact_hr_id_plus_visible_login';
  }else{
    if(operational.length!==1)throw new Error('MAPPING_FAILURE:TARGET_ACTIVE_CANONICAL_PRINCIPAL_'+norm(name).replace(/\s+/g,'_')+':'+JSON.stringify({namedProfiles:namedProfiles.map(p=>({id:p.id,name:profileName(p),resolved:resolveProfileId(p.id)})),operational:operational.map(x=>({uid:x.member.id,shopperId:x.member.shopperId,resolved:x.resolved,profileId:x.profile.id}))}));
    selected=operational[0];
  }
  const profile=selected.profile;
  targets.push({name,profile,member:selected.member,selectionAuthority,independentSameDisplayNamePrincipals:operational.filter(x=>x.member.id!==selected.member.id).map(x=>({shopperId:x.member.shopperId,resolved:x.resolved,visibleLogin:x.member.visibleLogin||null})),aliasProfileIds:namedProfiles.map(p=>p.id).filter(id=>id!==profile.id),missing:requiredProfileFields(profile)});
}
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  if(await authExists(m.id)){admin=m;break;}
}
if(!admin)throw new Error('AUTH_FAILURE:PHASEA_ADMIN_MISSING');

const unresolvedMemberships=[];
const membershipGroups=new Map();
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper')){
  const resolved=resolveProfileId(m.shopperId);
  if(!profiles.some(p=>p.id===resolved))unresolvedMemberships.push({uid:m.id,shopperId:m.shopperId,resolved});
  const list=membershipGroups.get(resolved)||[];list.push(m.id);membershipGroups.set(resolved,list);
}
const duplicateActivePrincipals=[...membershipGroups.entries()].filter(([id,uids])=>id&&uids.length>1).map(([id,uids])=>({shopperId:id,uids}));
const unresolvedAssigned=[];
for(const v of currentHrVisits.filter(v=>facet(v).assigned===true)){
  const raw=str(v.shopperId||v.evaluadorId||v.evaluatorId),resolved=resolveProfileId(raw);
  if(!raw||!profiles.some(p=>p.id===resolved))unresolvedAssigned.push({visitId:v.id||v.visitId,hrRowId:v.hrRowId,shopperId:raw,resolved});
}
const hrKeys=currentHrVisits.map(v=>str(v.hrRowId||v.sourceCoord||v.id||v.visitId)).filter(Boolean);
const duplicateHrKeys=hrKeys.filter((k,i)=>hrKeys.indexOf(k)!==i);
if(unresolvedMemberships.length||duplicateActivePrincipals.length||unresolvedAssigned.length||duplicateHrKeys.length){
  throw new Error('MAPPING_FAILURE:PHASEA_POPULATION_INVARIANT:'+JSON.stringify({unresolvedMemberships,duplicateActivePrincipals,unresolvedAssigned,duplicateHrKeys}));
}

const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED;
const browser=await chromium.launch({headless:true});

async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1480,height:1000}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(str(e?.message||e)));
  let settled=false,lastError='';
  for(let attempt=1;attempt<=5&&!settled;attempt++){
    await page.goto(URL+'&phaselive='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    try{
      await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
    }catch(e){lastError=str(e?.message||e);}
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=>'');
    if(uid===String(member.id))settled=true;else if(attempt<5)await page.waitForTimeout(800*attempt);
  }
  if(!settled)throw new Error('AUTH_FAILURE:BROWSER_SESSION:'+member.id+':'+lastError);
  await page.goto('about:blank');
  const authorityStartedAt=Date.now();
  await page.goto(URL+'&phaselivesettled='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({kind,rev,projectId,periodId})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},role=String(c.role||'').toLowerCase();
    return c.authenticated===true&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente')
      &&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true
      &&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===rev;
  },{kind,rev:revision,projectId,periodId},{timeout:120000});
  const authorityReadyMs=Date.now()-authorityStartedAt;
  if(authorityReadyMs>60000)throw new Error('ENVIRONMENT_FAILURE:AUTHORITY_SYNC_EXCEEDED_60S_'+authorityReadyMs);
  if(errors.length)throw new Error('FUNCTIONAL_DEFECT:PAGEERROR_'+kind+':'+JSON.stringify(errors));
  return {ctx,page,authorityReadyMs};
}
async function nav(page,route){
  await page.evaluate(r=>window.CX.router.nav(r,{history:false}),route);
  await page.waitForFunction(({route,rev})=>String(window.CX?.session?.view||'')===route&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{route,rev:revision},{timeout:45000});
  await page.waitForTimeout(300);
  const dirty=await page.evaluate(()=>{const t=String(document.body?.innerText||'');return {technical:/AUTH_READY|CLAIMS_READY|HRROWID|FINANCIALSOURCESTATUS|CXORBIA DEV\s*·\s*LABORATORIO|máquina canónica HR/i.test(t),blocked:t.includes('Fuente de datos no disponible'),stack:/Maximum call stack|RangeError/i.test(t)};});
  if(dirty.technical||dirty.blocked||dirty.stack)throw new Error('VISUAL_DEFECT:DIRTY_ROUTE_'+route+':'+JSON.stringify(dirty));
}

const evidence={
  schemaVersion:'cxorbia.i3.phasea.representative-live-reproof.v1',
  decision:'HOLD',
  sourceSha:SOURCE,hrRevision:revision,periodId,
  representatives:{},admin:null,
  population:{activeShopperMemberships:members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper').length,profiles:profiles.length,currentHrVisits:currentHrVisits.length,assignedHrVisits:currentHrVisits.filter(v=>facet(v).assigned===true).length,unresolvedMemberships:0,duplicateActivePrincipals:0,unresolvedAssignedVisits:0,duplicateHrVisitKeys:0},
  writes:{auth:0,hr:0,provider:0},deploys:0,production:false
};

try{
  for(const target of targets){
    const sp=await signed(target.member,'shopper'),page=sp.page;
    evidence.representatives[target.name]={stage:'authenticated_boot_ready',authorityReadyMs:sp.authorityReadyMs,providerWrites:0};
    write(evidence);
    console.log(JSON.stringify({metric:'authorityReadyMs',role:'shopper',principal:target.name,ms:sp.authorityReadyMs}));
    const prefetchTrace=await sp.page.evaluate(()=>{const p=window.CX_PROTECTED_HR_PREFETCH||{};return {mode:String(p.mode||'not_started'),ready:p.ready===true,prefetchFetchMs:Number.isFinite(p.receivedAt-p.startedAt)?p.receivedAt-p.startedAt:null,queueWaitMs:Number.isFinite(p.consumedAt-p.receivedAt)?p.consumedAt-p.receivedAt:null,providerWrites:p.providerWrites||0};});
    console.log(JSON.stringify({metric:'authenticatedHrPrefetch',role:'shopper',principal:target.name,trace:prefetchTrace}));
    evidence.representatives[target.name].prefetchTrace=prefetchTrace;
    const speedTrace=await page.evaluate(()=>{
      const nav=performance.getEntriesByType('navigation')[0]||null;
      const hr=performance.getEntriesByType('resource')
        .filter(x=>String(x.name).includes('/hr-live'))
        .map(x=>({durationMs:Math.round(x.duration),waitForFirstByteMs:Math.round(x.responseStart-x.startTime),transferSize:x.transferSize||null}))
        .slice(-6);
      const boot=window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||{};
      const pre=window.CX_PROTECTED_HR_PREFETCH||{};
      return {navigationDomInteractiveMs:nav?Math.round(nav.domInteractive):null,
        hrFetches:hr,hrFetchCount:hr.length,bootAttempts:Number(boot.attempts||0),
        prefetchedMs:Number.isFinite(pre.receivedAt-pre.startedAt)?Math.round(pre.receivedAt-pre.startedAt):null,
        prefetchedQueueMs:Number.isFinite(pre.consumedAt-pre.receivedAt)?Math.round(pre.consumedAt-pre.receivedAt):null,
        refreshPollConfiguredMs:Number(window.CX_TYA_LIVE_POLL_MS||0),role:String(window.CX?.session?.role||'')};
    });
    console.log(JSON.stringify({metric:'shopperColdAuthorityTiming',role:'shopper',principal:target.name,
      authorityReadyMs:sp.authorityReadyMs,speedTrace}));
    evidence.representatives[target.name].speedTrace=speedTrace;
    const base=await page.evaluate(({expectedId,currentPeriodId})=>{
      const d=window.CX?.data||{},sessionUser=window.CX?.session?.user||{},sid=String(sessionUser.shopperId||''),own=typeof d.visitsForShopper==='function'?d.visitsForShopper(expectedId,false):[];
      const current=own.filter(v=>String(d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId)||'')===currentPeriodId);
      const active=current.filter(v=>{const f=d.visitFacets?.(v)||{};return f.assigned===true&&f.realized!==true&&f.cancelled!==true;});
      const first=active[0]||null,firstFacets=first?(d.visitFacets?.(first)||first.canonicalFacets||{}):{};
      const auth=window.CX?.backendAuth?.context?.()||{},fb=window.firebase?.auth?.().currentUser||null,raw=String(auth.shopperId||sid||''),canonical=String(d.__identityMap?.[raw]||sid||raw||'');
      const profile=d.__sessionShopperProfile||((canonical&&d.getShopper)?d.getShopper(canonical):null)||null;
      return {
        firebaseUid:String(fb?.uid||''),authShopperId:String(auth.shopperId||''),authRole:String(auth.role||''),authNamespace:String(auth.authNamespace||''),
        sessionShopperId:sid,sessionUser:{name:String(sessionUser.name||''),shopperId:sid,role:String(sessionUser.role||'')},
        rawShopperId:raw,canonicalShopperId:canonical,identityMapValue:String(d.__identityMap?.[raw]||''),
        sessionProfile:profile?{id:String(profile.id||profile.shopperId||''),name:String(profile.nombre||profile.displayName||[profile.firstName,profile.lastName].filter(Boolean).join(' ')),visibleLogin:String(profile.visibleLogin||profile.username||profile.user||'')}:null,
        ownVisits:own.length,uniqueOwnVisits:new Set(own.map(v=>String(v.hrRowId||v.id||v.visitId||''))).size,currentVisits:current.length,activeVisits:active.length,
        firstActive:first?{id:String(first.id||first.visitId||''),hrRowId:String(first.hrRowId||''),branch:String(first.sucursal||''),instructiveReadAt:String(first.instructiveReadAt||''),scheduled:firstFacets.scheduled===true,scheduledDate:String(first.agendada||first.scheduledDate||first.fechaAgendada||''),rescheduleRequestStatus:String(first.rescheduleRequest?.status||''),cancelRequestStatus:String(first.cancelRequest?.status||'')}:null
      };
    },{expectedId:target.profile.id,currentPeriodId:periodId});
    evidence.representatives[target.name]={stage:'identity_verified_before_crossroute',authorityReadyMs:sp.authorityReadyMs,speedTrace,prefetchTrace,activeVisits:base.activeVisits,firstActive:base.firstActive?{scheduled:base.firstActive.scheduled,rescheduleRequestStatus:base.firstActive.rescheduleRequestStatus,cancelRequestStatus:base.firstActive.cancelRequestStatus}:null};
    write(evidence);
    if(base.sessionShopperId!==target.profile.id)throw new Error('MAPPING_FAILURE:SESSION_NOT_CANONICAL:'+target.name+':'+JSON.stringify(base));
    if(base.ownVisits!==base.uniqueOwnVisits)throw new Error('MAPPING_FAILURE:DUPLICATE_OWN_VISITS:'+target.name+':'+JSON.stringify(base));

    await nav(page,'midia');
    const midia=await page.evaluate(branch=>{const text=String(document.body?.innerText||''),rail=[...document.querySelectorAll('.rail-user')].map(x=>String(x.innerText||'').replace(/\s+/g,' ').trim()).join(' | '),heading=String(document.querySelector('.page-h,.page-head,.page-title')?.innerText||''),actions=[...document.querySelectorAll('[data-visit-action]')].map(b=>({action:String(b.dataset.visitAction||''),visitId:String(b.dataset.visitId||''),text:String(b.innerText||'').trim()})),progress=[...document.querySelectorAll('.cx-day-progress-card')].map(c=>String(c.innerText||'').replace(/\s+/g,' ').trim());return {text:text.slice(0,2200),noActive:/Sin visitas activas/i.test(text),branchVisible:branch?text.includes(branch):true,railUser:rail,heading,actions,progress};},base.firstActive?.branch||'');
    if(base.activeVisits>0&&(midia.noActive||!midia.branchVisible))throw new Error('FUNCTIONAL_DEFECT:MIDIA_ACTIVE_VISIT_MISSING:'+target.name+':'+JSON.stringify({base,midia}));
    if(base.firstActive){
      const acts=new Set(midia.actions.filter(a=>a.visitId===base.firstActive.id).map(a=>a.action));
      if(!acts.has('instructive'))throw new Error('FUNCTIONAL_DEFECT:MIDIA_INSTRUCTIVE_ACTION_MISSING:'+target.name+':'+JSON.stringify({base,midia}));
      if(base.firstActive.scheduled){
        const pending=base.firstActive.rescheduleRequestStatus==='pending_review'||base.firstActive.cancelRequestStatus==='pending_review';
        if(pending){if(acts.has('schedule')||acts.has('reschedule')||!/pendiente de (decisión|autorización)/i.test(midia.text))throw new Error('FUNCTIONAL_DEFECT:MIDIA_PENDING_REQUEST_PRESENTATION:'+target.name+':'+JSON.stringify(midia));}
        if(!pending&&(!acts.has('reschedule')||acts.has('schedule')))throw new Error('FUNCTIONAL_DEFECT:MIDIA_SCHEDULED_ACTION_HIERARCHY:'+target.name+':'+JSON.stringify({base,midia}));
        if(base.firstActive.scheduledDate&&!midia.text.includes(base.firstActive.scheduledDate))throw new Error('VISUAL_DEFECT:MIDIA_SCHEDULED_DATE_MISSING:'+target.name+':'+JSON.stringify({base,midia}));
      }else if(!acts.has('schedule')||acts.has('reschedule'))throw new Error('FUNCTIONAL_DEFECT:MIDIA_UNSCHEDULED_ACTION_HIERARCHY:'+target.name+':'+JSON.stringify({base,midia}));
    }
    if(target.name==='Julissa Flores'){
      if(base.authShopperId!==target.profile.id||base.canonicalShopperId!==target.profile.id||base.sessionProfile?.id!==target.profile.id)throw new Error('MAPPING_FAILURE:B1_JULISSA_CANONICAL_OWNER:'+JSON.stringify(base));
      if(!norm(midia.railUser).includes(norm('Julissa Flores'))||norm(midia.railUser).includes(norm('Paula Osorio')))throw new Error('VISUAL_DEFECT:B1_RAIL_IDENTITY:'+JSON.stringify(midia));
      if(!norm(midia.text).includes(norm('Hola, Julissa'))||norm(midia.text).includes(norm('Hola, Paula')))throw new Error('VISUAL_DEFECT:B1_MIDIA_GREETING:'+JSON.stringify(midia));
    }

    /* B7: compare existing remote operational notices with a real authenticated Shopper
       UI after identity/HR hydration. Read only: no test bulletin and no markRead write. */
    let notificationReadback={scope:'existing_current_period_visit_bulletins',remoteExpected:0,matched:0,tablonMatched:0,state:'NO_MATCHING_REMOTE_EVENT'};
    if(target.name==='Paula Osorio'){
      const visitKeys=new Set([...(base.firstActive?[base.firstActive.id,base.firstActive.hrRowId]:[])].map(str).filter(Boolean));
      const snapshot=await tenant.collection('bulletins').where('targetShopperIds','array-contains',target.profile.id).get();
      const notices=snapshot.docs.map(x=>({id:x.id,...(x.data()||{})})).filter(x=>
        x.status==='active'&&x.toRole==='shopper'&&str(x.tenantId)===tenantId&&str(x.projectId)===projectId&&
        str(x.periodId)===periodId&&x.entityType==='visit'&&visitKeys.has(str(x.entityId))&&
        arr(x.targetShopperIds).map(str).includes(target.profile.id));
      const ids=notices.map(x=>x.id);
      if(ids.length){
        const initial=await page.evaluate(()=>({count:window.CX?.notif?.for?.('shopper')?.length||0,
          loaded:window.CX_BACKEND_BULLETINS_STATUS?.source==='firestore'}));
        await page.waitForFunction(list=>{
          const items=window.CX?.notif?.for?.('shopper')||[];
          return list.every(id=>items.some(n=>String(n.id)===id&&n.source==='firestore'));
        },ids,{timeout:16000}).catch(()=>{});
        const shop=await page.evaluate(list=>{
          const visible=window.CX?.notif?.for?.('shopper')||[];
          const ids=visible.map(n=>String(n.id));
          return {matched:list.filter(id=>ids.includes(id)).length,loaded:window.CX_BACKEND_BULLETINS_STATUS?.source==='firestore',
            shownOnMiDia:list.filter(id=>[...document.querySelectorAll('[data-ngo]')].some(e=>e.dataset.ngo===id)).length};
        },ids);
        await nav(page,'tablon');
        const tablonMatched=await page.evaluate(list=>{
          const visible=[...document.querySelectorAll('[data-n]')].map(x=>String(x.dataset.n||''));
          return list.filter(id=>visible.includes(id)).length;
        },ids);
        notificationReadback={scope:'existing_current_period_visit_bulletins',
          remoteExpected:ids.length,matched:shop.matched,tablonMatched,shownOnMiDia:shop.shownOnMiDia,
          initialFeedCount:initial.count,hydratedFeedLoaded:shop.loaded,
          state:shop.matched===ids.length&&tablonMatched===ids.length?'PASS_INDEPENDENT_SHOPPER_UI':'FAIL_SHOPPER_DELIVERY'};
        if(notificationReadback.state!=='PASS_INDEPENDENT_SHOPPER_UI'){
          const feedDiagnostic=await page.evaluate(list=>{
            const cx=window.CX||{},items=cx.notif?._items||[],matched=items.filter(x=>list.includes(String(x.id))),
              state=window.CX_BACKEND_BULLETINS_STATUS||{};
            return {backendCount:Number(state.count??-1),rawFeedCount:items.length,
              rawMatched:matched.length,filteredMatched:cx.notif?.for?.('shopper')?.filter(x=>list.includes(String(x.id))).length||0,
              roleMatched:matched.filter(x=>cx.notif?._validForRole?.(x,'shopper')).length,
              activeMatched:matched.filter(x=>cx.notif?._activeForRole?.(x)).length,
              entityFound:matched.filter(x=>(cx.data?._visitas||[]).some(v=>[v.id,v.visitId,v.hrRowId].map(String).includes(String(x.entityId)))).length};
          },ids);
          notificationReadback.feedDiagnostic=feedDiagnostic;
          const queryDiagnostic=await page.evaluate(async list=>{
            const cx=window.CX||{},sid=String(cx.backendAuth?.context?.()?.shopperId||cx.session?.user?.shopperId||'');
            const result={reloadedCount:null,direct:[],scopedQuery:null,shopperIdPresent:!!sid};
            try{
              await cx.backendBulletins?.load?.();
              result.reloadedCount=Number(window.CX_BACKEND_BULLETINS_STATUS?.count??-1);
            }catch(e){result.reloadError=String(e?.code||e?.message||'READ_ERROR').slice(0,130);}
            const db=window.firebase?.apps?.length?window.firebase.firestore():null;
            if(!db)return {...result,dbAvailable:false};
            const col=db.collection('tenants').doc('tya').collection('bulletins');
            for(const id of list.slice(0,2)){
              try{
                const snap=await col.doc(id).get({source:'server'});
                const d=snap.exists?(snap.data()||{}):null;
                result.direct.push({ok:true,exists:!!d,active:d?.status==='active',role:d?.toRole==='shopper',
                  targeted:(d?.targetShopperIds||[]).map(String).includes(sid)});
              }catch(e){result.direct.push({ok:false,code:String(e?.code||e?.message||'DOC_READ_FAIL').slice(0,140)});}
            }
            if(sid){
              try{
                const q=await col.where('targetShopperIds','array-contains',sid).get({source:'server'});
                result.scopedQuery={ok:true,count:q.size,expectedMatched:q.docs.filter(d=>list.includes(d.id)).length};
              }catch(e){result.scopedQuery={ok:false,code:String(e?.code||e?.message||'QUERY_FAIL').slice(0,140)};}
            }
            return result;
          },ids);
          notificationReadback.queryDiagnostic=queryDiagnostic;
          /* READ-ONLY exact-claims, constrained-query and deployed Firestore Rules check.
             Diagnostic never changes Auth, rules, HR, Firestore or product source. */
          notificationReadback.authQueryDiagnostic=await page.evaluate(async expectedSid=>{
            const user=window.firebase?.auth?.().currentUser||null;
            const claims=(await user?.getIdTokenResult?.(false))?.claims||{};
            const out={
              principalAuthenticated:!!user,role:String(claims.role||''),
              tenantAllowed:claims.tenantId==='tya'||(Array.isArray(claims.tenants)&&claims.tenants.includes('tya')),
              exactShopperIdMatch:String(claims.shopperId||'')===expectedSid,
              projectAssigned:Array.isArray(claims.projectIds)&&claims.projectIds.includes('cinepolis'),
              statusAndExactShopperQuery:null
            };
            try{
              const col=window.firebase.firestore().collection('tenants').doc('tya').collection('bulletins');
              const result=await col.where('targetShopperIds','array-contains',expectedSid).where('status','==','active').get({source:'server'});
              out.statusAndExactShopperQuery={ok:true,count:result.size};
            }catch(e){out.statusAndExactShopperQuery={ok:false,code:String(e?.code||e?.message||'QUERY_FAILURE').slice(0,130)};}
            return out;
          },target.profile.id).catch(e=>({probeError:String(e?.code||e?.message||'AUTH_PROBE_FAILED').slice(0,130)}));
          try{
            const {execFileSync}=await import('node:child_process');
            const {createHash}=await import('node:crypto');
            const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8',timeout:12000}).trim();
            const endpoint='https://firebaserules.googleapis.com/v1/';
            const releaseResponse=await fetch(endpoint+'projects/cxorbia-backend-dev/releases/cloud.firestore',{
              headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)
            });
            if(!releaseResponse.ok)throw new Error('RULES_RELEASE_HTTP_'+releaseResponse.status);
            const release=await releaseResponse.json();
            const rulesetName=String(release.rulesetName||'');
            if(!/^projects\/cxorbia-backend-dev\/rulesets\//.test(rulesetName))throw new Error('RULESET_NAME_INVALID');
            const liveResponse=await fetch(endpoint+rulesetName,{
              headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)
            });
            if(!liveResponse.ok)throw new Error('RULESET_HTTP_'+liveResponse.status);
            const ruleset=await liveResponse.json();
            const source=(ruleset.source?.files||[]).find(f=>String(f.name||'').endsWith('firestore.rules'))||(ruleset.source?.files||[])[0];
            if(!source||typeof source.content!=='string')throw new Error('RULESET_SOURCE_MISSING');
            const hash=x=>createHash('sha256').update(x).digest('hex');
            const local=hash(fs.readFileSync('firestore.rules','utf8'));
            const historic=hash(execFileSync('git',['show','2f924e6e2057adef9c0c6be8259d564e15c43573:firestore.rules'],{encoding:'utf8',timeout:12000}));
            const live=hash(source.content);
            notificationReadback.liveRulesDiagnostic={
              releaseName:String(release.name||''),rulesetName,liveSha256:live,sourceSha256:local,
              historicSha256:historic,matchesCurrentSource:live===local,matchesHistoricRules:live===historic
            };
          }catch(e){notificationReadback.liveRulesDiagnostic={ok:false,code:String(e?.code||e?.message||'RULES_READBACK_UNAVAILABLE').slice(0,180)};}

          evidence.b7ShopperNotificationDiagnostic=notificationReadback;
          write(evidence);
          throw new Error('FUNCTIONAL_DEFECT:B7_SHOPPER_BULLETIN_NOT_VISIBLE:'+JSON.stringify(notificationReadback));
        }
      }
    }
    await nav(page,'miperfil');
    const profile=await page.evaluate(expectedName=>{const body=String(document.body?.innerText||''),titles=[...document.querySelectorAll('.cx-profile-group-title')].map(x=>String(x.textContent||''));return {body:body.slice(0,1600),locked:/No fue posible vincular esta sesión con tu perfil/i.test(body),grid:!!document.querySelector('.cx-profile-detail-grid'),titles,nameVisible:normLocal(body).includes(normLocal(expectedName))};function normLocal(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}},target.name);
    if(profile.locked||!profile.grid||!profile.nameVisible||!['Identidad','Contacto','Acceso','Datos de pago'].every(k=>profile.titles.some(t=>norm(t).includes(norm(k)))))throw new Error('VISUAL_DEFECT:PROFILE_'+target.name+':'+JSON.stringify(profile));

    await nav(page,'misvisitas');
    const route=await page.evaluate(({branch,read})=>{
      const body=String(document.body?.innerText||''),cards=[...document.querySelectorAll('[data-visit-card]')];
      const card=branch?cards.find(c=>String(c.innerText||'').includes(branch)):cards[0]||null;
      const cert=card?.querySelector('[data-cert]'),sched=card?.querySelector('[data-sched]'),doc=card?.querySelector('[data-doc]');
      return {cards:cards.length,body:body.slice(0,2200),branchVisible:branch?body.includes(branch):true,certDisabled:cert?cert.disabled:null,scheduleDisabled:sched?sched.disabled:null,certAriaDisabled:cert?cert.getAttribute('aria-disabled')==='true':null,scheduleAriaDisabled:sched?sched.getAttribute('aria-disabled')==='true':null,hasSchedule:!!sched,hasReschedule:!!card?.querySelector('[data-reprog]'),certText:String(cert?.innerText||''),docText:String(doc?.innerText||''),progressLabels:[...card?.querySelectorAll('.cx-visit-progress-label')||[]].map(x=>String(x.innerText||'')),read};
    },{branch:base.firstActive?.branch||'',read:!!base.firstActive?.instructiveReadAt});
    if(base.activeVisits>0&&!route.branchVisible)throw new Error('FUNCTIONAL_DEFECT:MISVISITAS_ACTIVE_MISSING:'+target.name);
    if(base.firstActive){
      if(base.firstActive.scheduled){
        if(route.hasSchedule||!route.hasReschedule)throw new Error('FUNCTIONAL_DEFECT:MISVISITAS_SCHEDULED_ACTION_HIERARCHY:'+target.name+':'+JSON.stringify(route));
      }else if(!base.firstActive.instructiveReadAt){
        if(route.certAriaDisabled!==true||route.scheduleAriaDisabled!==true)throw new Error('FUNCTIONAL_DEFECT:ROUTE_PREREQUISITE_FEEDBACK_MISSING:'+target.name+':'+JSON.stringify(route));
      }else{
        if(!/Instructivo leído/i.test(route.docText))throw new Error('FUNCTIONAL_DEFECT:INSTRUCTIVE_ACK_NOT_PROJECTED:'+target.name+':'+JSON.stringify(route));
        if(/Certificación vigente/i.test(route.certText)&&route.scheduleAriaDisabled===true)throw new Error('FUNCTIONAL_DEFECT:CERTIFIED_SCHEDULE_STILL_BLOCKED:'+target.name+':'+JSON.stringify(route));
        if(!/Certificación vigente/i.test(route.certText)&&route.certAriaDisabled===true)throw new Error('FUNCTIONAL_DEFECT:CERT_ACTION_BLOCKED_AFTER_INSTRUCTIVE:'+target.name+':'+JSON.stringify(route));
      }
    }

    await nav(page,'cert');
    const cert=await page.evaluate(()=>{const body=String(document.body?.innerText||'');return {rendered:/Certificación/i.test(body),body:body.slice(0,1200)};});
    if(!cert.rendered)throw new Error('FUNCTIONAL_DEFECT:CERT_ROUTE_NOT_RENDERED:'+target.name);
    const certSaysUnavailable=/no hay un banco|pendiente de validación\/publicación/i.test(cert.body);
    const routeSaysValid=/Certificación vigente/i.test(route.certText);
    if(certSaysUnavailable&&routeSaysValid)throw new Error('FUNCTIONAL_DEFECT:CERT_AUTHORITY_CROSS_SURFACE_CONTRADICTION:'+target.name+':'+JSON.stringify({route:route.certText,cert:cert.body}));
    if(route.hasSchedule&&/Certificación vigente para este proyecto/i.test(cert.body)&&!routeSaysValid)throw new Error('FUNCTIONAL_DEFECT:CERT_CARRYOVER_NOT_PROJECTED_TO_VISIT:'+target.name+':'+JSON.stringify({route:route.certText,cert:cert.body}));

    let b1ActionExercise={};
    if(target.name==='Julissa Flores'&&base.firstActive){
      await nav(page,'midia');
      const instr=page.locator('[data-visit-action="instructive"][data-visit-id="'+base.firstActive.id+'"]').first();
      if(await instr.count()!==1)throw new Error('FUNCTIONAL_DEFECT:B1_JULISSA_MIDIA_INSTRUCTIVE_CONTROL_MISSING');
      await instr.click();
      await page.waitForFunction(()=>String(window.CX?.session?.view||'')==='misvisitas',null,{timeout:10000});
      const ov=page.locator('.cx-ov:visible').last();
      await ov.waitFor({state:'visible',timeout:10000});
      const instructiveModalText=String(await ov.innerText());
      if(!/Instructivo|Confirmo que lo he leído/i.test(instructiveModalText))throw new Error('FUNCTIONAL_DEFECT:B1_JULISSA_INSTRUCTIVE_MODAL_NOT_OPENED:'+instructiveModalText.slice(0,600));
      await page.evaluate(()=>{const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};const o=[...document.querySelectorAll('.cx-ov')].find(visible);if(!o)return;const b=[...o.querySelectorAll('button')].find(x=>/×|cerrar/i.test(String(x.innerText||x.getAttribute('aria-label')||'')));if(b)b.click();else o.remove();});
      await nav(page,'midia');
      if(!base.firstActive.scheduled){
        const sched=page.locator('[data-visit-action="schedule"][data-visit-id="'+base.firstActive.id+'"]').first();
        if(await sched.count()!==1)throw new Error('FUNCTIONAL_DEFECT:B1_JULISSA_MIDIA_SCHEDULE_CONTROL_MISSING');
        await sched.click();
        await page.waitForFunction(()=>String(window.CX?.session?.view||'')==='misvisitas',null,{timeout:10000});
        await page.waitForFunction(()=>{const t=String(document.body?.innerText||'');return /Completa primero el instructivo y la certificación requerida|Agendar visita/i.test(t);},null,{timeout:10000});
        const scheduleOutcome=await page.evaluate(()=>String(document.body?.innerText||'').match(/Completa primero el instructivo y la certificación requerida|Agendar visita/i)?.[0]||'');
        b1ActionExercise.scheduleOutcome=scheduleOutcome;
      }
      b1ActionExercise.instructiveModalOpened=true;
    }
    if(base.firstActive?.scheduled){
      const hasPendingRequest=base.firstActive.rescheduleRequestStatus==='pending_review'||base.firstActive.cancelRequestStatus==='pending_review';
      if(hasPendingRequest){
        await nav(page,'misvisitas');
        const note=String(await page.locator('[data-visit-card]').first().innerText());
        if(!/pendiente de (autorización|revisión)/i.test(note))throw new Error('FUNCTIONAL_DEFECT:PENDING_REQUEST_STATUS_NOT_VISIBLE:'+target.name+':'+note.slice(0,450));
        b1ActionExercise.pendingRequestSafelyDisplayed=true;
      }else{
      await nav(page,'midia');
      const rp=page.locator('[data-visit-action="reschedule"][data-visit-id="'+base.firstActive.id+'"]').first();
      if(await rp.count()!==1)throw new Error('FUNCTIONAL_DEFECT:B1_REPROGRAM_CONTROL_MISSING:'+target.name);
      await rp.click();
      await page.waitForFunction(()=>String(window.CX?.session?.view||'')==='misvisitas',null,{timeout:10000});
      const rov=page.locator('.cx-ov:visible').last();
      await rov.waitFor({state:'visible',timeout:10000});
      const rtext=String(await rov.innerText());
      if(!/(?:Reprogramar visita|Solicitar reprogramación)/i.test(rtext))throw new Error('FUNCTIONAL_DEFECT:B1_REPROGRAM_MODAL_NOT_OPENED:'+target.name+':'+rtext.slice(0,500));
      await page.evaluate(()=>{const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};const o=[...document.querySelectorAll('.cx-ov')].find(visible);if(!o)return;const b=[...o.querySelectorAll('button')].find(x=>/×|cerrar/i.test(String(x.innerText||x.getAttribute('aria-label')||'')));if(b)b.click();else o.remove();});
      b1ActionExercise.reprogramModalOpened=true;
      }
    }

    await nav(page,'aprendizaje');
    const academy=await page.evaluate(()=>{const heads=[...document.querySelectorAll('.cx-academy-course-head')],cards=[...document.querySelectorAll('.cx-academy-course-card')],colors=heads.map(h=>getComputedStyle(h).backgroundColor),images=heads.map(h=>getComputedStyle(h).backgroundImage);return {cards:cards.length,heads:heads.length,colors,images,distinctColors:new Set(colors).size,solid:images.every(v=>v==='none')};});
    if(academy.cards<1||academy.heads!==academy.cards||!academy.solid||academy.distinctColors<Math.min(4,academy.cards))throw new Error('VISUAL_DEFECT:ACADEMY_SOLID_COLORS:'+target.name+':'+JSON.stringify(academy));

    await nav(page,'beneficios');
    const benefits=await page.evaluate(()=>{const rows=[...document.querySelectorAll('tbody tr')].map(tr=>({text:String(tr.innerText||'').replace(/\s+/g,' ').trim(),status:String(tr.dataset.benStatus||'')}));const old=rows.filter(r=>{const m=r.text.match(/20\d{2}-\d{2}-\d{2}/);return m&&m[0]<='2026-05-31';});const oldPaid=old.filter(r=>r.status==='paid');const paidContradictions=oldPaid.filter(r=>/Pendiente de confirmación/i.test(r.text));return {rows:rows.length,oldRows:old.length,oldPaid:oldPaid.length,paidContradictions:paidContradictions.map(r=>r.text),body:String(document.body?.innerText||'').slice(0,1800)};});
    if(target.name==='Paula Osorio'&&(benefits.oldRows<1||benefits.oldPaid<1||benefits.paidContradictions.length))throw new Error('FUNCTIONAL_DEFECT:PAULA_HISTORICAL_PAYMENT_DISPLAY:'+JSON.stringify(benefits));

    evidence.representatives[target.name]={notificationReadback,shopperId:target.profile.id,uid:target.member.id,selectionAuthority:target.selectionAuthority,independentSameDisplayNamePrincipals:target.independentSameDisplayNamePrincipals,missingProfileFields:target.missing,authorityReadyMs:sp.authorityReadyMs,base,midia:{noActive:midia.noActive,branchVisible:midia.branchVisible,railUser:midia.railUser,heading:midia.heading,actions:midia.actions,progress:midia.progress},profile:{grid:profile.grid,titles:profile.titles,nameVisible:profile.nameVisible},route,cert:{rendered:cert.rendered,unavailable:certSaysUnavailable,routeSaysValid},b1ActionExercise,academy,benefits:{rows:benefits.rows,oldRows:benefits.oldRows,oldPaid:benefits.oldPaid,paidContradictionCount:benefits.paidContradictions.length}};
    await sp.ctx.close();
  }

  const ap=await signed(admin,'admin'),page=ap.page;
  console.log(JSON.stringify({metric:'authorityReadyMs',role:'admin',ms:ap.authorityReadyMs}));
  await nav(page,'shoppers');
  await page.waitForSelector('#shSearch');
  // shoppers.js binds the input listener from setTimeout(...,0); do not race that mount.
  await page.waitForTimeout(100);
  const adminJulissaData=await page.evaluate(()=>{
    const data=window.CX?.data||{},ids=new Set(['shopper_gt_0c198c1055','shopper_gt_86254c4228']);
    const pickVisit=v=>({id:String(v?.id||v?.visitId||''),hrRowId:String(v?.hrRowId||''),periodId:String(v?.periodId||''),periodKey:String(v?.periodKey||''),shopperId:String(v?.shopperId||''),shopper:String(v?.shopper||''),sucursal:String(v?.sucursal||v?.shopping||'')});
    const relevant=v=>ids.has(String(v?.shopperId||''))||/Julissa/i.test(String(v?.shopper||''));
    const identityMap=Object.entries(data.__identityMap||{}).filter(([a,b])=>ids.has(String(a))||ids.has(String(b))).map(([liveId,canonicalId])=>({liveId:String(liveId),canonicalId:String(canonicalId)}));
    const identityReviews=(data.__identityReviewQueue||[]).filter(x=>JSON.stringify(x).includes('0c198c1055')||JSON.stringify(x).includes('86254c4228')||/Julissa/i.test(JSON.stringify(x))).slice(0,20);
    return {
      composed:(data.shoppersFor?.()||[]).filter(s=>ids.has(String(s?.id||s?.shopperId||''))||/Julissa/i.test(String(s?.nombre||''))).map(s=>({id:String(s?.id||s?.shopperId||''),nombre:String(s?.nombre||''),legacyLiveShopperIds:s?.legacyLiveShopperIds||[],status:String(s?.status||''),identityState:String(s?.identityState||'')})),
      rawHrVisits:(data.__liveHrVisits||[]).filter(relevant).map(pickVisit).slice(0,80),
      durableVisits:(data.__protectedVisits||[]).filter(relevant).map(pickVisit).slice(0,80),
      identityMap,
      identityReviews
    };
  });
  const searchAdminShopper=async(name)=>{
    const search=page.locator('#shSearch');
    await search.fill('');
    await search.fill(name);
    await page.waitForFunction(wanted=>[...document.querySelectorAll('#shBody tr')]
      .some(tr=>String(tr.innerText||'').toLowerCase().includes(String(wanted||'').toLowerCase())),name,{timeout:3000}).catch(()=>{});
    return page.evaluate(wanted=>{
      const rows=[...document.querySelectorAll('#shBody tr')].map(tr=>({text:String(tr.innerText||'').replace(/\s+/g,' ').trim(),sid:String(tr.dataset.sid||'')}));
      const exact=rows.find(r=>r.text.toLowerCase().includes(String(wanted||'').toLowerCase()));
      return {visible:!!exact,row:String(exact?.text||''),sid:String(exact?.sid||''),rows:rows.map(r=>r.text).slice(0,20)};
    },name);
  };
  const illescas=await searchAdminShopper('Julissa Illescas');
  const flores=await searchAdminShopper('Julissa Flores');
  const canonicalComposed=adminJulissaData.composed.find(x=>x.id==='shopper_gt_0c198c1055')||null;
  const aliasComposed=adminJulissaData.composed.find(x=>x.id==='shopper_gt_86254c4228')||null;
  const aliasMapped=adminJulissaData.identityMap.some(x=>x.liveId==='shopper_gt_86254c4228'&&x.canonicalId==='shopper_gt_0c198c1055');
  let clicked=false;
  if(flores.visible&&flores.sid){
    clicked=await page.evaluate(sid=>{
      const tr=[...document.querySelectorAll('#shBody tr')].find(x=>String(x.dataset.sid||'')===String(sid||''));
      if(!tr)return false;
      tr.click();
      return true;
    },flores.sid);
  }
  const shopperAdmin={julissaDiagnostics:adminJulissaData,canonicalComposed,aliasComposed,aliasMapped,floresVisible:flores.visible,illescasVisible:illescas.visible,floresRow:flores.row,illescasRow:illescas.row,floresSid:flores.sid,illescasSid:illescas.sid,clicked};
  if(!shopperAdmin.floresVisible||shopperAdmin.illescasVisible||shopperAdmin.floresSid!=='shopper_gt_0c198c1055'||shopperAdmin.canonicalComposed?.nombre!=='Julissa Flores'||shopperAdmin.aliasComposed||!shopperAdmin.aliasMapped||!shopperAdmin.clicked)throw new Error('FUNCTIONAL_DEFECT:ADMIN_JULISSA_CANONICAL_DISPLAY:'+JSON.stringify(shopperAdmin));
  await page.waitForTimeout(250);
  const modal=await page.evaluate(()=>{const m=[...document.querySelectorAll('[role="dialog"],.modal,.overlay,.ov')].find(x=>/Julissa Flores/i.test(String(x.innerText||'')))||[...document.querySelectorAll('body *')].find(x=>/Revisar \/ fusionar identidad/i.test(String(x.innerText||''))&&/Instruir perfil/i.test(String(x.innerText||'')));const text=String(m?.innerText||document.body.innerText||'');return {manualMerge:/Revisar \/ fusionar identidad|Resolver identidad/i.test(text),instructProfile:/Instruir perfil/i.test(text),text:text.slice(0,1800)};});
  if(!modal.manualMerge||!modal.instructProfile)throw new Error('FUNCTIONAL_DEFECT:ADMIN_IDENTITY_ACTIONS_MISSING:'+JSON.stringify(modal));
  await page.keyboard.press('Escape').catch(()=>{});

  await nav(page,'postulaciones');
  const post=await page.evaluate(()=>{
    const d=window.CX?.data||{},pending=typeof d.activePosts==='function'?d.activePosts().filter(p=>String(p.estado||p.status||'').toLowerCase()==='pendiente').length:0;
    const assignments=typeof d.visitas==='function'?d.visitas().filter(v=>{const f=d.visitFacets?.(v)||{};return f.assigned===true&&f.cancelled!==true;}).length:0;
    const badge=document.querySelector('#nav-postulaciones .n-badge'),badgeText=String(badge?.textContent||'').trim(),body=String(document.body?.innerText||'');
    return {pending,assignments,badgeText,headerPending:body.includes(pending+' postulaciones pendientes'),headerAssignments:body.includes(assignments+' asignaciones vigentes'),showsAllZero:/0 pendientes\s*·\s*0 aprobadas/i.test(body),body:body.slice(0,1800)};
  });
  if((post.pending?String(post.pending):'')!==post.badgeText||!post.headerPending||!post.headerAssignments)throw new Error('MAPPING_FAILURE:POSTULATIONS_COUNT_DESYNC:'+JSON.stringify(post));

  /* B7 human action/read-only proof: open the real pending request modal, never submit. */
  const pendingReplacementCount=await page.evaluate(()=>(window.CX?.data?.visitas?.()||[])
    .filter(v=>v.rescheduleRequest?.status==='pending_review').length);
  let replacementModal={required:pendingReplacementCount>0,opened:false,reasonField:false,cancelledWithoutMutation:false};
  if(pendingReplacementCount>0){
    const trigger=page.locator('[data-reprog-renew]').first();
    if(await trigger.count()!==1)throw new Error('FUNCTIONAL_DEFECT:B7_REPLACEMENT_DATE_ACTION_MISSING');
    await trigger.click();
    await page.locator('#cxReplacementReason').waitFor({state:'visible',timeout:12000});
    replacementModal=await page.evaluate(()=>{
      const field=document.querySelector('#cxReplacementReason'),back=document.querySelector('#cxReplacementBack'),confirm=document.querySelector('#cxReplacementConfirm');
      const text=String(document.body?.innerText||'');
      return {required:true,opened:!!(field&&back&&confirm),reasonField:!!field,
        currentDateExplained:/fecha vigente/i.test(text),
        newDateInstruction:/Pedir una nueva fecha|Solicitar nueva fecha/i.test(text),
        cancelledWithoutMutation:false};
    });
    if(!replacementModal.opened||!replacementModal.currentDateExplained||!replacementModal.newDateInstruction)
      throw new Error('VISUAL_DEFECT:B7_REPLACEMENT_MODAL_INCOMPLETE:'+JSON.stringify(replacementModal));
    await page.locator('#cxReplacementBack').click();
    replacementModal.cancelledWithoutMutation=await page.locator('#cxReplacementReason').count()===0;
    if(!replacementModal.cancelledWithoutMutation)throw new Error('FUNCTIONAL_DEFECT:B7_REPLACEMENT_MODAL_CLOSE');
  }

  await nav(page,'visitas');
  const visitAdmin=await page.evaluate(()=>{const d=window.CX?.data||{},v=typeof d.visitas==='function'?d.visitas():[];return {count:v.length,assigned:v.filter(x=>d.visitFacets?.(x)?.assigned===true).length,unique:new Set(v.map(x=>String(x.hrRowId||x.id||x.visitId||''))).size};});
  if(visitAdmin.count!==currentHrVisits.length||visitAdmin.unique!==visitAdmin.count)throw new Error('MAPPING_FAILURE:ADMIN_VISIT_HR_PARITY:'+JSON.stringify({visitAdmin,hr:currentHrVisits.length}));

  evidence.admin={uid:admin.id,shopperAdmin,modal:{manualMerge:modal.manualMerge,instructProfile:modal.instructProfile},postulations:post,replacementModal,visits:visitAdmin};
  await ap.ctx.close();

  evidence.decision='PASS_I3_PHASEA_REPRESENTATIVE_SAME_ARTIFACT_LIVE_REPROOF';
  write(evidence);
  console.log(JSON.stringify(evidence,null,2));
}catch(error){
  evidence.decision='FAIL_I3_PHASEA_REPRESENTATIVE_SAME_ARTIFACT_LIVE_REPROOF';
  evidence.error=str(error?.stack||error);
  write(evidence);
  throw error;
}finally{
  await browser.close();
}
