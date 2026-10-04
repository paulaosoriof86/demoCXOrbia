#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim(),TENANT=String(process.env.TENANT_ID||'tya').trim(),PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim(),INPUT=String(process.env.VRM243_INPUT||'.tmp/i3-vrm243-root/result.json').trim(),OUT=String(process.env.VRM243_OUT||'.tmp/i3-vrm243-alias-remap').trim();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))],norm=v=>str(v).toLowerCase();
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'],arrayFields=['shopperIds','candidateShopperIds'];
const trusted=new Set(['provider_exact','tenant_adjudication','migrated_exact']),active=new Set(['active','confirmed','approved','committed']);
fs.mkdirSync(OUT,{recursive:true});const result={schemaVersion:'cxorbia.i3.vrm243.authoritative-alias-visit-remap.v1',decision:'HOLD',groups:0,aliases:0,authoritativeVisitRows:0,historicalRowsPreserved:null,preflight:{},writes:0,hrWrites:0,externalWrites:0,production:false};const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const fail=(classification,code,extra={})=>{Object.assign(result,{decision:'FAIL_VRM243_AUTHORITATIVE_ALIAS_VISIT_REMAP',classification,code,...extra});save();console.log(JSON.stringify(result,null,2));process.exit(2);};const need=(ok,c,k,e={})=>{if(!ok)fail(c,k,e);};
need(fs.existsSync(INPUT),'SOURCE_FAILURE','VRM243_ROOT_INPUT_MISSING');const diag=JSON.parse(fs.readFileSync(INPUT,'utf8'));need(diag.decision==='PASS_VRM217_219_POPULATION_ROOT_DIAGNOSTIC','SOURCE_FAILURE','VRM243_ROOT_NOT_PASS');
need(Number(diag.visits?.authoritativeAliasRows||0)===127&&Number(diag.visits?.historicalAliasRows||0)===122&&Number(diag.visits?.ambiguousAuthorityGroups||0)===0,'MAPPING_FAILURE','VRM243_ALIAS_COUNTS_DRIFT',{visits:diag.visits});
need(Number(diag.operationalAliasReferences?.count||0)===0,'MAPPING_FAILURE','VRM243_NONVISIT_ALIAS_RESIDUAL',{count:diag.operationalAliasReferences?.count});
const rows=arr(diag.visits.authoritativeAliasDetails);need(rows.length===127,'MAPPING_FAILURE','VRM243_DETAIL_COUNT');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM),users=tenant.collection('users'),cross=tenant.collection('shopperIdentityCrosswalk');
const links=(await tenant.collection('shopperIdentityLinks').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const tokens=l=>uniq([l.canonicalShopperId,l.canonicalId,l.shopperId,l.profileId,l.sourceShopperId,l.sourceIdentityKey,...arr(l.exactAliases),...arr(l.identityAliases),...arr(l.aliases),...arr(l.sourceAliases),...arr(l.sourceIdentityAliases)]);
const groups=new Map();
for(const row of rows){const c=str(row.canonicalTarget),a=str(row.sourceShopperId),v=str(row.visitKey);need(c&&a&&v&&c!==a,'MAPPING_FAILURE','VRM243_DETAIL_INVALID',{row});const key=c;if(!groups.has(key))groups.set(key,{canonical:c,aliases:new Map()});const g=groups.get(key);if(!g.aliases.has(a))g.aliases.set(a,[]);g.aliases.get(a).push(v);}
need(groups.size===18,'MAPPING_FAILURE','VRM243_GROUP_COUNT',{count:groups.size});
const plan=[];
for(const g of groups.values()){
 const members=(await users.where('shopperId','==',g.canonical).get()).docs.filter(d=>{const m=d.data()||{};return m.active===true&&str(m.tenantId)===TENANT&&norm(m.role)==='shopper'&&norm(m.authNamespace)==='shopper'&&!['inactive','superseded','retired'].includes(norm(m.status));});
 need(members.length===1,'MAPPING_FAILURE','VRM243_CANONICAL_MEMBER_CARDINALITY',{canonical:g.canonical,count:members.length});
 const u=await auth.getUser(members[0].id),cl=u.customClaims||{};need(!u.disabled&&str(cl.tenantId)===TENANT&&norm(cl.role)==='shopper'&&norm(cl.authNamespace)==='shopper'&&str(cl.shopperId)===g.canonical,'AUTH_FAILURE','VRM243_CANONICAL_AUTH_INVALID',{canonical:g.canonical});
 for(const [alias,visitIds] of g.aliases){
   const cs=await cross.doc(alias).get();need(cs.exists,'MAPPING_FAILURE','VRM243_CROSSWALK_MISSING',{alias});const cr=cs.data()||{};need(str(cr.shopperId||cr.canonicalShopperId)===g.canonical,'MAPPING_FAILURE','VRM243_CROSSWALK_TARGET_DRIFT',{alias,observed:str(cr.shopperId||cr.canonicalShopperId),expected:g.canonical});
   const relevant=links.filter(l=>tokens(l).includes(alias)&&active.has(norm(l.status||l.state))&&trusted.has(norm(l.authorityType||l.authority?.type))&&!!str(l.authorityRef||l.adjudicationId||l.providerAckRef||l.commandId||l.idempotencyKey));
   const conflicts=relevant.filter(l=>str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId)!==g.canonical);
   need(conflicts.length===0,'MAPPING_FAILURE','VRM243_TRUSTED_LINK_CONFLICT',{alias,conflicts:conflicts.map(x=>x.id)});
   const matches=relevant.filter(l=>str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId)===g.canonical);
   need(matches.length>=1,'MAPPING_FAILURE','VRM243_TRUSTED_LINK_MISSING',{alias,canonical:g.canonical});
   for(const id of uniq(visitIds))plan.push({id,alias,canonical:g.canonical});
 }
}
need(plan.length===127&&new Set(plan.map(x=>x.id)).size===127,'MAPPING_FAILURE','VRM243_PLAN_CARDINALITY',{rows:plan.length,unique:new Set(plan.map(x=>x.id)).size});
const refs=plan.map(x=>project.collection('visits').doc(x.id)),snaps=await Promise.all(refs.map(r=>r.get()));
for(let i=0;i<plan.length;i++){const p=plan[i],s=snaps[i];need(s.exists,'PERSISTENCE_FAILURE','VRM243_VISIT_MISSING',{id:p.id});const d=s.data()||{},has=ownerFields.some(k=>str(d[k])===p.alias)||arrayFields.some(k=>arr(d[k]).map(str).includes(p.alias));need(has,'MAPPING_FAILURE','VRM243_VISIT_ALIAS_NOT_PRESENT',{id:p.id,alias:p.alias,canonical:p.canonical});}
result.preflight={canonicalGroups:groups.size,aliasCount:uniq(plan.map(x=>x.alias)).length,visitRows:plan.length,trustedLinks:true,crosswalksExact:true,canonicalPrincipalsExact:true};result.historicalRowsPreserved=Number(diag.visits.historicalAliasRows||0);save();
await db.runTransaction(async tx=>{
 const current=[];for(const p of plan){const ref=project.collection('visits').doc(p.id),snap=await tx.get(ref);need(snap.exists,'PERSISTENCE_FAILURE','VRM243_TX_VISIT_MISSING',{id:p.id});current.push({p,ref,data:snap.data()||{}});}
 for(const {p,ref,data} of current){const patch={};for(const k of ownerFields)if(str(data[k])===p.alias)patch[k]=p.canonical;for(const k of arrayFields){if(!Array.isArray(data[k]))continue;const next=uniq(data[k].map(v=>str(v)===p.alias?p.canonical:v));if(JSON.stringify(next)!==JSON.stringify(uniq(data[k])))patch[k]=next;}need(Object.keys(patch).length>0,'MAPPING_FAILURE','VRM243_TX_PATCH_EMPTY',{id:p.id});tx.update(ref,patch);}
});
result.writes=127;
const after=await Promise.all(plan.map(async p=>{const s=await project.collection('visits').doc(p.id).get(),d=s.data()||{},still=ownerFields.some(k=>str(d[k])===p.alias)||arrayFields.some(k=>arr(d[k]).map(str).includes(p.alias));return{id:p.id,canonical:p.canonical,shopperId:str(d.shopperId),stillAlias:still};}));
const bad=after.filter(x=>x.stillAlias||x.shopperId!==x.canonical);need(!bad.length,'PERSISTENCE_FAILURE','VRM243_READBACK',{bad:bad.slice(0,20)});
result.groups=groups.size;result.aliases=uniq(plan.map(x=>x.alias)).length;result.authoritativeVisitRows=plan.length;result.durableReadback=true;result.decision='PASS_VRM243_AUTHORITATIVE_ALIAS_VISIT_REMAP';save();console.log(JSON.stringify(result,null,2));
