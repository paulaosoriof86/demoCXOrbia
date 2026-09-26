import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const OUT=process.env.V43_OUT||'.tmp/i3-v43-milton-repair',RUN=process.env.GITHUB_RUN_ID||Date.now().toString();
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const INVALID='shopper_gt_018ca3e794',CANON='shopper_gt_bd74ace936',CANON_NAME='Milton De Paz';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const str=v=>String(v??'').trim(),clean=v=>Array.isArray(v)?v.map(clean):(v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined&&typeof x!=='function').map(([k,x])=>[k,clean(x)])):v);
const archive=tenant.collection('recoveryArchives').doc('I3_V43_'+RUN);
let writes=0,archives=0,hrWrites=0,authWrites=0;
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,32);
async function archiveDoc(ref,reason){const s=await ref.get();if(!s.exists)return false;await archive.collection('items').doc(hash(ref.path)).set({sourcePath:ref.path,reason,archivedAt:new Date().toISOString(),data:clean(s.data()||{})},{merge:false});writes++;archives++;return true;}
async function updateExact(ref,patch,reason){await archiveDoc(ref,reason);await ref.set(clean({...patch,updatedAt:new Date().toISOString()}),{merge:true});writes++;}
async function queryEq(col,field,value){return (await col.where(field,'==',value).get()).docs;}

const canonicalRef=tenant.collection('shoppers').doc(CANON),invalidRef=tenant.collection('shoppers').doc(INVALID);
const canonicalSnap=await canonicalRef.get(),invalidSnap=await invalidRef.get();
if(!canonicalSnap.exists)throw new Error('MAPPING_FAILURE:V43_CANONICAL_PROFILE_MISSING');
const canonical=canonicalSnap.data()||{},invalid=invalidSnap.exists?(invalidSnap.data()||{}):{};
if(str(canonical.shopperId||CANON)!==CANON||str(canonical.firstName)!=='Milton'||str(canonical.lastName)!=='De Paz'||str(canonical.visibleLogin)!=='milton.depaz')throw new Error('MAPPING_FAILURE:V43_CANONICAL_PROFILE_AUTHORITY_MISMATCH');
if(invalidSnap.exists&&(invalid.identityQuarantined!==true||invalid.excludedFromCanonicalReadModel!==true||str(invalid.canonicalShopperId)!==CANON))throw new Error('MAPPING_FAILURE:V43_INVALID_PROFILE_NOT_QUARANTINED');

const canonMembers=(await queryEq(tenant.collection('users'),'shopperId',CANON)).filter(d=>{const x=d.data()||{};return x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper';});
if(canonMembers.length!==1)throw new Error('AUTH_FAILURE:V43_CANONICAL_MEMBERSHIP_COUNT_'+canonMembers.length);
const canonAuth=await auth.getUser(canonMembers[0].id).catch(()=>null);
if(!canonAuth||canonAuth.disabled===true)throw new Error('AUTH_FAILURE:V43_CANONICAL_AUTH_INVALID');
const invalidMembers=await queryEq(tenant.collection('users'),'shopperId',INVALID);
for(const m of invalidMembers){const x=m.data()||{};const u=await auth.getUser(m.id).catch(()=>null);if(x.active===true||u?.disabled===false)throw new Error('AUTH_FAILURE:V43_INVALID_IDENTITY_STILL_ACTIVE');}
const invalidCross=(await tenant.collection('shopperIdentityCrosswalk').doc(INVALID).get()).data()||{};
const adjudicationLink=(await tenant.collection('shopperIdentityLinks').doc('tenant-adj-mishael-depaz-20260926').get()).data()||{};
if(str(invalidCross.canonicalShopperId||invalidCross.shopperId)!==CANON||str(invalidCross.authorityType)!=='tenant_adjudication')throw new Error('MAPPING_FAILURE:V43_ADJUDICATION_CROSSWALK_MISSING');
if(str(adjudicationLink.canonicalShopperId)!==CANON||str(adjudicationLink.sourceShopperId)!==INVALID||str(adjudicationLink.status||adjudicationLink.state)!=='confirmed')throw new Error('MAPPING_FAILURE:V43_ADJUDICATION_LINK_MISSING');

await archive.set({schemaVersion:'cxorbia.i3.v43.milton-durable-repair.v1',tenantId:TENANT,projectId:PROJECT,canonicalShopperId:CANON,invalidShopperId:INVALID,authorityType:'tenant_adjudication',authorityRef:'paula-2026-09-25-mishael-does-not-exist',startedAt:new Date().toISOString(),production:false,hrWrites:0,authWrites:0},{merge:false});writes++;
await updateExact(canonicalRef,{nombre:CANON_NAME,firstName:'Milton',lastName:'De Paz',identityAdjudicationState:'tenant_canonical_identity',identityAuthority:'tenant_adjudication',identityAuthorityRef:'paula-2026-09-25-mishael-does-not-exist'},'canonical_milton_profile_before_name_normalization');

const touched=[];
for(const [label,col] of [['postulations',project.collection('postulations')],['reservations',project.collection('reservations')],['visits',project.collection('visits')]]){
  for(const d of await queryEq(col,'shopperId',CANON)){
    const x=d.data()||{},patch={};
    for(const key of ['shopper','shopperName','nombreShopper','shopperDisplayName']){
      if(Object.prototype.hasOwnProperty.call(x,key)&&str(x[key])!==CANON_NAME)patch[key]=CANON_NAME;
    }
    if(Object.keys(patch).length){
      patch.identityAuthority='tenant_adjudication';patch.identityAuthorityRef='paula-2026-09-25-mishael-does-not-exist';
      await updateExact(d.ref,patch,'canonical_milton_exact_id_display_name_before_normalization');
      touched.push({collection:label,id:d.id,fields:Object.keys(patch).filter(k=>!k.startsWith('identity'))});
    }
  }
}

const after=(await canonicalRef.get()).data()||{};
if(str(after.nombre)!==CANON_NAME||str(after.firstName)!=='Milton'||str(after.lastName)!=='De Paz'||str(after.visibleLogin)!=='milton.depaz')throw new Error('PERSISTENCE_FAILURE:V43_CANONICAL_PROFILE_READBACK');
const invalidAfter=(await invalidRef.get()).data()||{};
if(invalidAfter.identityQuarantined!==true||invalidAfter.excludedFromCanonicalReadModel!==true||str(invalidAfter.canonicalShopperId)!==CANON)throw new Error('PERSISTENCE_FAILURE:V43_INVALID_QUARANTINE_DRIFT');
const current=(await project.collection('visits').where('periodId','==',PERIOD).get()).docs.filter(d=>(d.data()||{}).excludedFromCanonicalReadModel!==true);
const keys=current.map(d=>str((d.data()||{}).hrRowId)).filter(Boolean);
if(current.length!==44||new Set(keys).size!==44)throw new Error('PERSISTENCE_FAILURE:V43_CURRENT_VISIT_PARITY');
const stale=[];
for(const [label,col] of [['postulations',project.collection('postulations')],['reservations',project.collection('reservations')],['visits',project.collection('visits')]]){
  for(const d of await queryEq(col,'shopperId',CANON)){
    const x=d.data()||{};for(const key of ['shopper','shopperName','nombreShopper','shopperDisplayName'])if(Object.prototype.hasOwnProperty.call(x,key)&&/mishael de paz/i.test(str(x[key])))stale.push({collection:label,id:d.id,field:key});
  }
}
if(stale.length)throw new Error('PERSISTENCE_FAILURE:V43_STALE_CANONICAL_DISPLAY_NAME:'+JSON.stringify(stale));
const result={schemaVersion:'cxorbia.i3.v43.milton-durable-repair.result.v1',decision:'PASS_I3_V43_MILTON_DURABLE_REPAIR',canonicalShopperId:CANON,canonicalName:str(after.nombre),visibleLogin:str(after.visibleLogin),invalidProfileQuarantined:true,canonicalMemberships:canonMembers.length,invalidActiveMemberships:0,currentDurableCount:current.length,uniqueCurrentHrRows:new Set(keys).size,touched,archives,writes,hrWrites,authWrites,production:false,completedAt:new Date().toISOString()};
await archive.set({completedAt:result.completedAt,result},{merge:true});writes++;
result.writes=writes;
await import('node:fs').then(fs=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/milton-durable-repair.json',JSON.stringify(result,null,2)+'\n');});
console.log(JSON.stringify(result,null,2));
