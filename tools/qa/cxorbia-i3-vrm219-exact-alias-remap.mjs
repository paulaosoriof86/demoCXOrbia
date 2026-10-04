#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROGRAM=process.env.PROJECT_ID||'cinepolis';
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
const DIAG=String(process.env.VRM219_DIAGNOSTIC||'');
const OUT=String(process.env.VRM219_OUT||'.tmp/i3-vrm219-remap');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
fs.mkdirSync(OUT,{recursive:true});
const result={decision:'HOLD',groups:0,aliases:0,providerWrites:0,replays:0,hrWrites:0,externalWrites:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
save();

const diag=JSON.parse(fs.readFileSync(DIAG,'utf8'));
if(diag.decision!=='PASS_VRM217_219_POPULATION_ROOT_DIAGNOSTIC'||diag.hrRevision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:VRM219_DIAGNOSTIC');
if(diag.credentials.normalizeCandidates!==0||diag.credentials.currentHrReconcileCandidates!==0||diag.credentials.durableSweepCandidates!==0)throw new Error('MAPPING_FAILURE:VRM219_CREDENTIAL_DEBT');
if(diag.identity.exactAliasActivePrincipals!==1||diag.identity.holds!==17||diag.hrAssignments.unresolved!==1||diag.repairPlan.authoritativeAliasRemap.eligible!==279||diag.visits.ambiguousAuthorityGroups!==0)throw new Error('MAPPING_FAILURE:VRM219_COUNTS');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const visitDocs=(await project.collection('visits').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const key=v=>str(v.hrRowId||v.visitKey||v.id||v.visitId),byKey=new Map();
for(const v of visitDocs){const k=key(v);if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(v);}
const groups=new Map();
function group(c,a){if(!groups.has(c))groups.set(c,{canonical:c,aliases:new Set(),visitIds:new Set()});const g=groups.get(c);g.aliases.add(a);return g;}
for(const row of diag.visits.authoritativeAliasDetails){
  const g=group(str(row.canonicalTarget),str(row.sourceShopperId)),rows=byKey.get(str(row.visitKey))||[];
  let authoritative=rows.filter(v=>v.id===str(row.visitKey));
  if(authoritative.length!==1)authoritative=rows.filter(v=>str(v.hrSourceRevision)===EXPECTED_HR);
  if(authoritative.length!==1||str(authoritative[0].shopperId)!==str(row.sourceShopperId))throw new Error('MAPPING_FAILURE:VRM219_VISIT_'+row.visitKey);
  g.visitIds.add(authoritative[0].id);
}
for(const row of diag.operationalAliasReferences.rows)group(str(row.canonicalTarget),str(row.sourceShopperId));
if(groups.size!==21||uniq([...groups.values()].flatMap(g=>[...g.aliases])).length!==33)throw new Error('MAPPING_FAILURE:VRM219_GROUPS');

const users=tenant.collection('users'),members=await users.get();
const staff=members.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
let actor=null;
for(const row of staff){try{const u=await auth.getUser(row.uid),c=u.customClaims||{};if(!u.disabled&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&str(c.authNamespace).toLowerCase()==='staff'){actor=row;break;}}catch{}}
if(!actor)throw new Error('AUTH_FAILURE:VRM219_ADMIN');

let browser;
try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const ctx=await browser.newContext({ignoreHTTPSErrors:true,serviceWorkers:'block'}),page=await ctx.newPage();
  const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:60000});
  await page.evaluate(async t=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(t);},await auth.createCustomToken(actor.uid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&typeof window.CX?.data?.adjudicateShopperIdentity==='function',null,{timeout:120000});
  await page.evaluate(()=>window.CX?.data?.setCurrentPeriod?.('cinepolis-2026-10'));
  for(const g of [...groups.values()].sort((a,b)=>a.canonical.localeCompare(b.canonical))){
    const aliases=uniq([...g.aliases]),ids=uniq([...g.visitIds]),allow=ids.length?ids:['__preserve_all_alias_visit_history__'];
    const meta={ackAware:true,reason:'trusted_exact_alias_population_repair_vrm219',preserveHistoricalVisitRows:true,authoritativeVisitIds:allow};
    const first=await page.evaluate(async x=>window.CX.data.adjudicateShopperIdentity(x.canonical,x.aliases,x.meta),{canonical:g.canonical,aliases,meta});
    if(first?.ok!==true||first?.providerAck!==true||(first?.identityConsolidated!==true&&first?.idempotentReplay!==true))throw new Error('PERSISTENCE_FAILURE:VRM219_ACK_'+g.canonical+':'+str(first?.code));
    const replay=await page.evaluate(async x=>window.CX.data.adjudicateShopperIdentity(x.canonical,x.aliases,x.meta),{canonical:g.canonical,aliases,meta});
    if(replay?.ok!==true||replay?.providerAck!==true||replay?.idempotentReplay!==true||Number(replay?.providerWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM219_REPLAY_'+g.canonical);
    result.groups++;result.aliases+=aliases.length;result.providerWrites+=Number(first?.providerWrites||0);result.replays++;result.hrWrites+=Number(first?.hrWrites||0);result.externalWrites+=Number(first?.externalWrites||0);save();
  }
  if(result.hrWrites||result.externalWrites)throw new Error('PERSISTENCE_FAILURE:VRM219_EXTERNAL_WRITE');
  result.decision='PASS_VRM219_EXACT_ALIAS_REPAIR';save();console.log(JSON.stringify(result,null,2));
}catch(e){result.decision='FAIL_VRM219_EXACT_ALIAS_REPAIR';result.error=str(e?.stack||e);save();console.error(result.error);process.exitCode=2;}
finally{try{if(browser)await browser.close();}catch{}}
