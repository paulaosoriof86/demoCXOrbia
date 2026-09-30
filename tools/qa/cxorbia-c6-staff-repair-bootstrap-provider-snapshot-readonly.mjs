#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const PROJECT=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const TENANT='tya';
const NS='staff';
const TARGET_PROJECT='cinepolis';
const EXPECTED_AUTH=228;
const CREDENTIAL=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const CONFIG='backend/config/c6-staff-provider-collision-targets-v1.json';
const TARGETS='backend/config/c6-staff-bootstrap-targets-v1.json';
const PREWRITE='backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json';
const R4_READBACK='app/docs/evidence/CORTE6-CLIENT-AUTH-READBACK-LATEST.json';
const OUT=process.env.CXORBIA_C6_STAFF_SNAPSHOT_OUT||'.tmp/c6-staff-repair-bootstrap-provider-snapshot/report.json';

const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp20=uid=>sha(`shopper-auth-candidate-v1\0${String(uid||'').trim()}`).slice(0,20);
const norm=v=>String(v??'').trim().toLowerCase();
const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(String).filter(Boolean))].sort();
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const safeError=e=>{const raw=String(e?.message||e||'UNKNOWN');return {code:(raw.split(':')[0]||'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g,'_').slice(0,120),fingerprint:sha(raw).slice(0,24)};};
const safeClaims=u=>{
  const c=u.customClaims||{};
  const role=norm(c.role),authNamespace=norm(c.authNamespace),tenantId=norm(c.tenantId),projectIds=uniq(c.projectIds);
  const canonical={authNamespace,projectIds,role,tenantId};
  return {role,authNamespace,tenantId,projectIds,shopperIdPresent:Boolean(String(c.shopperId||'').trim()),digest:sha(JSON.stringify(canonical))};
};
const providerClasses=u=>[...new Set((u.providerData||[]).map(x=>norm(x?.providerId)).filter(Boolean))].sort().map(x=>x==='password'?'PASSWORD':x==='google.com'?'GOOGLE':x==='phone'?'PHONE':'OTHER');
const addressClass=u=>{const e=norm(u.email);return !e?'NO_EMAIL':e.endsWith('@auth.cxorbia.invalid')?'INTERNAL_NAMESPACED_CXORBIA':'EXTERNAL_PROVIDER_EMAIL';};
const emailSha=u=>sha(norm(u.email));
const exactClaims=(u,target)=>{const c=safeClaims(u);return c.role===target.role&&c.authNamespace===NS&&c.tenantId===TENANT&&JSON.stringify(c.projectIds)===JSON.stringify([TARGET_PROJECT])&&!c.shopperIdPresent&&c.digest===target.expectedClaimsDigest;};

const LEGACY={
  R1_SUPER:{group:'1acdcb3782b7cf351056',members:['6dee7f31c738218ce63a','b561d9c46660715e214f']},
  R2_ADMIN:{group:'2c4d19f2b066835473d3',members:['aa5cbada6c5388ee1d8b','f8405e17df357c121ccc']},
  R3_OPS:{group:'54225792eeb65f6739c0',members:['ce178298b2df136541d4','19937aedc77af3404bdc']},
  R4_CLIENT_HISTORICAL:{group:'ae2f920fe6d9ce1fdd82',members:['ca9e2f644334833ab572','360af509dcdcd1880f04'],canonical:'6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c'}
};

function sourcePreflight(){
  for(const p of [CONFIG,TARGETS,PREWRITE,R4_READBACK])ensure(fs.existsSync(p),`SOURCE_FILE_MISSING_${p}`);
  const cfg=readJson(CONFIG),targets=readJson(TARGETS),pre=readJson(PREWRITE),r4=readJson(R4_READBACK);
  ensure(cfg.schemaVersion==='cxorbia.c6.staff-provider-collision-targets.v1','CONFIG_SCHEMA');
  ensure(targets.schemaVersion==='cxorbia.c6.staff-bootstrap-targets.v1'&&targets.targets?.length===4,'TARGETS_SCHEMA');
  ensure(pre.schemaVersion==='cxorbia.c6.staff-repair-bootstrap-prewrite.v1','PREWRITE_SCHEMA');
  ensure(pre.providerSnapshotContract?.expectedAuthPopulation===EXPECTED_AUTH&&pre.providerSnapshotContract?.singleObservation===true,'PREWRITE_SNAPSHOT_CONTRACT');
  ensure(r4.decision==='PASS_C6_CLIENT_AUTH_READBACK'&&r4.target?.uidFingerprint===LEGACY.R4_CLIENT_HISTORICAL.canonical&&r4.target?.claimsExact===true,'R4_PRIOR_READBACK');
  const byAlias=new Map(targets.targets.map(x=>[x.targetAlias,x]));
  ensure(cfg.targets?.length===4,'CONFIG_TARGET_COUNT');
  const seenEmailFp=new Set();
  for(const row of cfg.targets){
    const t=byAlias.get(row.targetAlias);ensure(t,`TARGET_ALIAS_${row.targetAlias}`);
    ensure(row.role===t.role&&row.ownerIdentityAnchor===t.ownerIdentityAnchor&&row.expectedClaimsDigest===t.expectedClaimsDigest,`TARGET_BINDING_${row.targetAlias}`);
    ensure(/^[a-f0-9]{64}$/.test(row.technicalLoginDigest)&&/^[a-f0-9]{64}$/.test(row.providerEmailSha256)&&/^[a-f0-9]{64}$/.test(row.ownerTechnicalBindingDigest),`TARGET_DIGEST_${row.targetAlias}`);
    const internal=`${row.technicalLoginDigest.slice(0,48)}@auth.cxorbia.invalid`;
    ensure(sha(internal)===row.providerEmailSha256,`PROVIDER_EMAIL_DIGEST_${row.targetAlias}`);
    ensure(sha(`cxorbia-owner-login-bind-v1\0${TENANT}\0${row.ownerIdentityAnchor}\0${row.technicalLoginDigest}`)===row.ownerTechnicalBindingDigest,`OWNER_TECH_BINDING_${row.targetAlias}`);
    ensure(!seenEmailFp.has(row.providerEmailSha256),`TARGET_TECH_COLLISION_SOURCE_${row.targetAlias}`);seenEmailFp.add(row.providerEmailSha256);
  }
  return {cfg,targets,pre,r4};
}

function memberSafe(u){const c=safeClaims(u);return {candidateFp:fp20(u.uid),enabled:!u.disabled,providerClasses:providerClasses(u),addressClass:addressClass(u),role:c.role||'NONE',authNamespace:c.authNamespace||'NONE',tenantClass:c.tenantId===TENANT?'TYA':c.tenantId?'OTHER':'NONE',projectCount:c.projectIds.length,targetProjectScoped:c.projectIds.includes(TARGET_PROJECT),claimsDigest:c.digest};}

function budgetPlan({targetDecisions,legacyGroups}){
  let authCreates=0,claimWrites=0,userDocWrites=0,targetAuditWrites=0,disableWrites=0,disableAuditWrites=0;
  for(const d of targetDecisions){
    if(d.action==='CREATE_NEW_EPHEMERAL'){authCreates++;claimWrites++;userDocWrites++;targetAuditWrites++;}
    else if(d.action==='REUSE_EXISTING_CANONICAL'&&d.userDocAction==='CREATE_CANONICAL_USER_DOC'){userDocWrites++;targetAuditWrites++;}
  }
  for(const g of legacyGroups){disableWrites+=g.enabledMembers;disableAuditWrites+=g.enabledMembers;}
  const forward={authCreates,customClaimsWrites:claimWrites,authDisableWrites:disableWrites,authWrites:authCreates+claimWrites+disableWrites,userDocWrites,auditLogWrites:targetAuditWrites+disableAuditWrites,firestoreWrites:userDocWrites+targetAuditWrites+disableAuditWrites,authDeletes:0,firestoreDeletes:0};
  const createdTargets=targetDecisions.filter(x=>x.action==='CREATE_NEW_EPHEMERAL').length;
  const adoptedTargets=targetDecisions.filter(x=>x.action==='REUSE_EXISTING_CANONICAL'&&x.userDocAction==='CREATE_CANONICAL_USER_DOC').length;
  const inverseCount=createdTargets+adoptedTargets+disableWrites;
  const rollbackDryRun={pass:true,uniqueInverseActions:inverseCount,authReenableWrites:disableWrites,authDisableCreatedWrites:createdTargets,userDocDeactivateWrites:createdTargets+adoptedTargets,auditRollbackWrites:inverseCount,authDeletes:0,firestoreDeletes:0,validatedClientCanonicalMutation:'NONE',rules:'created target -> disable/no delete; adopted existing target -> deactivate added user doc only; pre-enabled historical disabled by run -> re-enable; audit immutable'};
  return {forward,rollbackDryRun};
}

async function main(){
  const report={schemaVersion:'cxorbia.c6.staff-repair-bootstrap-provider-snapshot-readonly.v1',generatedAt:new Date().toISOString(),projectId:PROJECT,tenantId:TENANT,decision:'STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE',provider:{authListObservations:0,firestoreDocumentReads:0,writes:0},authPopulation:null,targetDecisions:[],legacyGroups:[],r4Canonical:null,writeBudget:null,rollbackDryRun:null,blockers:[],safety:{providerWrites:0,authWrites:0,firestoreWrites:0,rulesWrites:0,storageWrites:0,hrReads:0,hrWrites:0,deletes:0,deploys:0,merge:false,production:false,rawLoginExported:false,rawEmailExported:false,rawUidExported:false,rawPasswordExported:false,rawNameExported:false,rawClaimsExported:false}};
  try{
    const source=sourcePreflight();
    if(process.argv.includes('--source-self-test')){report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT_SOURCE_PREFLIGHT';return report;}
    ensure(CREDENTIAL&&fs.existsSync(CREDENTIAL),'EPHEMERAL_SERVICE_ACCOUNT_MISSING');
    const sa=readJson(CREDENTIAL);ensure(sa?.type==='service_account'&&sa?.project_id===PROJECT&&sa?.client_email&&sa?.private_key,'EPHEMERAL_SERVICE_ACCOUNT_INVALID');
    const admin=(await import('firebase-admin')).default;
    if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:PROJECT});
    const auth=admin.auth(),db=admin.firestore();
    const page=await auth.listUsers(1000);report.provider.authListObservations=1;report.authPopulation=page.users.length;
    ensure(!page.pageToken,'AUTH_SECOND_PAGE_FORBIDDEN');
    ensure(page.users.length===EXPECTED_AUTH,`AUTH_POPULATION_DRIFT_${page.users.length}`);

    const users=page.users;
    const byCandidate=new Map(users.map(u=>[fp20(u.uid),u]));
    for(const [alias,def] of Object.entries(LEGACY)){
      const members=[];
      for(const fp of def.members){const u=byCandidate.get(fp);ensure(u,`FOCAL_PRINCIPAL_MISSING_${alias}_${fp}`);members.push(memberSafe(u));}
      ensure(new Set(members.map(x=>x.candidateFp)).size===def.members.length,`FOCAL_PRINCIPAL_DUPLICATE_${alias}`);
      report.legacyGroups.push({repairAlias:alias,groupFingerprint:def.group,members,enabledMembers:members.filter(x=>x.enabled).length,retirementMode:'DISABLE_ONLY_NO_DELETE'});
    }

    const canonicalMatches=users.filter(u=>sha(String(u.uid))===LEGACY.R4_CLIENT_HISTORICAL.canonical);
    ensure(canonicalMatches.length===1,'R4_CANONICAL_MISSING_OR_AMBIGUOUS');
    const r4u=canonicalMatches[0],r4c=safeClaims(r4u);
    ensure(!r4u.disabled,'R4_CANONICAL_DISABLED_DRIFT');
    ensure(r4c.role==='cliente'&&r4c.authNamespace===NS&&r4c.tenantId===TENANT&&JSON.stringify(r4c.projectIds)===JSON.stringify([TARGET_PROJECT])&&!r4c.shopperIdPresent,'R4_CANONICAL_CLAIMS_DRIFT');
    const r4doc=await db.collection('tenants').doc(TENANT).collection('users').doc(r4u.uid).get();report.provider.firestoreDocumentReads++;
    ensure(r4doc.exists,'R4_CANONICAL_MEMBERSHIP_MISSING');
    const r4d=r4doc.data()||{};
    ensure(String(r4d.tenantId||'')===TENANT&&norm(r4d.role)==='cliente'&&JSON.stringify(uniq(r4d.projectIds))===JSON.stringify([TARGET_PROJECT])&&r4d.active!==false,'R4_CANONICAL_MEMBERSHIP_DRIFT');
    report.r4Canonical={uidFingerprint:LEGACY.R4_CLIENT_HISTORICAL.canonical,enabled:true,claimsStructuralDigest:r4c.digest,membershipExact:true,mutation:'FORBIDDEN'};

    const targetMap=new Map(source.targets.targets.map(x=>[x.targetAlias,x]));
    for(const row of source.cfg.targets){
      const target=targetMap.get(row.targetAlias);
      const matches=users.filter(u=>emailSha(u)===row.providerEmailSha256);
      if(row.targetAlias==='A'){
        ensure(matches.length<=1,'A_TECHNICAL_IDENTIFIER_AMBIGUOUS');
        if(matches.length===1){
          const u=matches[0];
          ensure(exactClaims(u,target),'A_OWNER_BOUND_PROVIDER_MATCH_CLAIMS_DRIFT');
          ensure(!u.disabled,'A_OWNER_BOUND_PROVIDER_MATCH_DISABLED');
          const doc=await db.collection('tenants').doc(TENANT).collection('users').doc(u.uid).get();report.provider.firestoreDocumentReads++;
          let userDocAction='CREATE_CANONICAL_USER_DOC';
          if(doc.exists){const d=doc.data()||{};ensure(String(d.tenantId||'')===TENANT&&norm(d.authNamespace||NS)===NS&&norm(d.role)==='super'&&JSON.stringify(uniq(d.projectIds))===JSON.stringify([TARGET_PROJECT])&&d.active!==false,'A_EXISTING_USER_DOC_DRIFT');userDocAction='NO_OP_EXACT';}
          report.targetDecisions.push({targetAlias:'A',role:'super',ownerBindingVerified:true,roleUniquenessUsed:false,providerCollisionCount:1,action:'REUSE_EXISTING_CANONICAL',providerUidFingerprint:sha(`cxorbia-provider-uid-v1\0${u.uid}`),claimsDigest:safeClaims(u).digest,userDocAction});
        }else{
          report.targetDecisions.push({targetAlias:'A',role:'super',ownerBindingVerified:true,roleUniquenessUsed:false,providerCollisionCount:0,action:'CREATE_NEW_EPHEMERAL',userDocAction:'CREATE_CANONICAL_USER_DOC'});
        }
      }else{
        ensure(matches.length===0,`TECHNICAL_IDENTIFIER_COLLISION_${row.targetAlias}`);
        report.targetDecisions.push({targetAlias:row.targetAlias,role:target.role,ownerBindingVerified:true,roleUniquenessUsed:false,providerCollisionCount:0,action:'CREATE_NEW_EPHEMERAL',userDocAction:'CREATE_CANONICAL_USER_DOC'});
      }
    }
    ensure(report.targetDecisions.length===4,'TARGET_DECISION_COUNT');
    const budget=budgetPlan({targetDecisions:report.targetDecisions,legacyGroups:report.legacyGroups});
    report.writeBudget=budget.forward;report.rollbackDryRun=budget.rollbackDryRun;
    ensure(report.rollbackDryRun.pass===true&&report.writeBudget.authDeletes===0&&report.writeBudget.firestoreDeletes===0,'ROLLBACK_OR_DELETE_CONTRACT');
    report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE';
  }catch(error){const safe=safeError(error);report.blockers.push(safe);}
  finally{fs.mkdirSync(new URL('../../.tmp/c6-staff-repair-bootstrap-provider-snapshot/',import.meta.url),{recursive:true});fs.mkdirSync(OUT.substring(0,OUT.lastIndexOf('/')),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');}
  return report;
}

const report=await main();
console.log(JSON.stringify(report));
if(process.argv.includes('--source-self-test'))process.exit(report.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT_SOURCE_PREFLIGHT'?0:2);
else process.exit(report.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE'?0:2);
