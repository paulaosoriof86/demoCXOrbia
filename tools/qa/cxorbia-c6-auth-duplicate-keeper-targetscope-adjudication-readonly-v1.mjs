#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const FIREBASE_PROJECT = process.env.CXORBIA_FIREBASE_PROJECT || 'cxorbia-backend-dev';
const TARGET_TENANT = process.env.CXORBIA_TENANT_ID || 'tya';
const TARGET_PROJECT = process.env.CXORBIA_PROJECT_ID || 'cinepolis';
const EXPECTED_AUTH_USERS = 228;
const CLIENT_READBACK = process.env.CXORBIA_CLIENT_READBACK || 'app/docs/evidence/CORTE6-CLIENT-AUTH-READBACK-LATEST.json';
const CLAIM_NORMALIZATION = process.env.CXORBIA_CLAIM_NORMALIZATION || 'app/docs/evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json';
const CREDENTIAL_IMPORT = process.env.CXORBIA_CREDENTIAL_IMPORT || 'app/docs/evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json';
const CREDENTIAL_CONTINUITY = process.env.CXORBIA_CREDENTIAL_CONTINUITY || 'app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json';
const CREDENTIAL_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const GROUPS = Object.freeze({
  '1acdcb3782b7cf351056': ['6dee7f31c738218ce63a','b561d9c46660715e214f'],
  '2c4d19f2b066835473d3': ['aa5cbada6c5388ee1d8b','f8405e17df357c121ccc'],
  '54225792eeb65f6739c0': ['ce178298b2df136541d4','19937aedc77af3404bdc'],
  'ae2f920fe6d9ce1fdd82': ['ca9e2f644334833ab572','360af509dcdcd1880f04'],
  'fd891812eca020d27ee3': ['e1773a24c98d6bbe26c3','50d360f17c1fbdd69770']
});
const ACCESS_GROUPS = new Set(['1acdcb3782b7cf351056','2c4d19f2b066835473d3','54225792eeb65f6739c0','ae2f920fe6d9ce1fdd82']);
const EXPECTED_CANDIDATES = new Set(Object.values(GROUPS).flat());
const STAFF_ROLES = new Set(['super','admin','ops','coordinador']);
const CLIENT_ROLES = new Set(['cliente','client']);
const ALLOWED_ROLES = new Set([...STAFF_ROLES, ...CLIENT_ROLES, 'shopper']);
const TECHNICAL_MARKER_KEYS = ['source','batch','migration','import','migrationBatch','migrationSource','importBatch','migratedFrom','createdFromExternalSource'];

const text = value => String(value ?? '').trim();
const norm = value => text(value).toLowerCase();
const list = value => Array.isArray(value) ? value.map(norm).filter(Boolean) : (typeof value === 'string' ? value.split(',').map(norm).filter(Boolean) : []);
const sha256 = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const fp20 = value => sha256(value).slice(0,20);
const candidateFp = uid => fp20('shopper-auth-candidate-v1\0' + text(uid));
const emailGroupFp = email => fp20('provider-email-group-v1\0' + norm(email));
const ensure = (value, code) => { if (!value) throw new Error(code); };
const safeError = error => { const raw=String(error?.message||error||'UNKNOWN'); return {code:(raw.split(':')[0]||'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g,'_').slice(0,120),fingerprint:sha256(raw).slice(0,24)}; };
const uniq = values => [...new Set(values.filter(Boolean))];

function providerClasses(user){
  const ids = uniq((user.providerData||[]).map(item => norm(item?.providerId))).sort();
  return ids.map(id => id === 'password' ? 'PASSWORD' : id === 'google.com' ? 'GOOGLE' : id === 'phone' ? 'PHONE' : 'OTHER');
}
function addressClass(user){
  const email = norm(user.email);
  if(!email) return 'NO_EMAIL';
  if(email.endsWith('@auth.cxorbia.invalid')) return 'INTERNAL_NAMESPACED_CXORBIA';
  return 'EXTERNAL_PROVIDER_EMAIL';
}
function tenantClass(claims, role){
  if(role === 'super') return 'SUPER_BYPASS';
  const direct=norm(claims?.tenantId), many=list(claims?.tenants);
  if(direct === TARGET_TENANT || many.includes(TARGET_TENANT)) return 'TYA';
  if(direct || many.length) return 'OTHER_TENANT';
  return 'NONE';
}
function projectClass(claims){
  const ids=uniq(list(claims?.projectIds));
  if(ids.includes(TARGET_PROJECT)) return ids.length===1 ? 'TARGET_ONLY' : 'TARGET_PLUS_OTHER';
  return ids.length ? 'OTHER_ONLY' : 'NONE';
}
function namespaceClass(claims){
  const ns=norm(claims?.authNamespace);
  return ns==='staff' ? 'STAFF' : ns==='shopper' ? 'SHOPPER' : ns ? 'OTHER' : 'NONE';
}
function roleFamily(role){
  if(STAFF_ROLES.has(role)) return 'ADMIN_OPERACIONES';
  if(CLIENT_ROLES.has(role)) return 'CLIENTE';
  if(role==='shopper') return 'SHOPPER';
  return 'OUTSIDE_CONTRACT';
}
function effectiveTyaAccess(claims, role){
  if(!ALLOWED_ROLES.has(role)) return false;
  const tc=tenantClass(claims,role);
  if(!(tc==='TYA'||tc==='SUPER_BYPASS')) return false;
  const ns=namespaceClass(claims);
  if(ns!=='NONE' && ns!==(role==='shopper'?'SHOPPER':'STAFF')) return false;
  if((role==='shopper'||CLIENT_ROLES.has(role)) && !list(claims?.projectIds).length) return false;
  if(role==='shopper' && !text(claims?.shopperId)) return false;
  return true;
}
function technicalMarkers(claims){
  const present=[]; const digests=[];
  for(const key of TECHNICAL_MARKER_KEYS){
    if(claims && claims[key] !== undefined && claims[key] !== null && text(claims[key])){
      present.push(key);
      digests.push(key+'='+sha256(JSON.stringify(claims[key])).slice(0,12));
    }
  }
  return {keys:present.sort(), digest:digests.length?sha256(digests.sort().join('|')).slice(0,20):null};
}
function loadLineage(){
  for(const file of [CLIENT_READBACK,CLAIM_NORMALIZATION,CREDENTIAL_IMPORT,CREDENTIAL_CONTINUITY]) ensure(fs.existsSync(file),'LINEAGE_FILE_MISSING');
  const client=JSON.parse(fs.readFileSync(CLIENT_READBACK,'utf8'));
  const claims=JSON.parse(fs.readFileSync(CLAIM_NORMALIZATION,'utf8'));
  const imported=JSON.parse(fs.readFileSync(CREDENTIAL_IMPORT,'utf8'));
  const continuity=JSON.parse(fs.readFileSync(CREDENTIAL_CONTINUITY,'utf8'));
  ensure(client.decision==='PASS_C6_CLIENT_AUTH_READBACK' && client?.target?.claimsExact===true && client?.passwordSignIn===true,'CLIENT_LINEAGE_DRIFT');
  ensure(typeof client?.target?.uidFingerprint==='string' && client.target.uidFingerprint.length===64,'CLIENT_UID_FP_DRIFT');
  ensure(claims.mode==='EXECUTED' && claims?.selected?.clients===2,'CLIENT_NORMALIZATION_DRIFT');
  const historicalClientHashes=new Set((claims.changes||[]).filter(x=>x.kind==='client').map(x=>text(x.principalHash)).filter(Boolean));
  ensure(historicalClientHashes.size===2,'CLIENT_HISTORICAL_HASH_SET_DRIFT');
  ensure(imported.decision==='PASS_EXACT_AUTH_IMPORT_READBACK' && imported?.targetRoleCounts?.super===1 && imported?.targetRoleCounts?.coordinador===2 && imported?.targetNamespaceCounts?.staff===3,'STAFF_IMPORT_LINEAGE_DRIFT');
  ensure(imported.identifierContract==='visible profile + username/password -> deterministic namespaced internal Firebase email','STAFF_IDENTIFIER_CONTRACT_DRIFT');
  ensure(continuity?.firebaseAuth?.users===108 && continuity?.firebaseAuth?.namespaceCounts?.none===17 && continuity?.firebaseAuth?.namespaceCounts?.staff===3,'STAFF_NAMESPACE_LINEAGE_DRIFT');
  return {canonicalClientUidFingerprint:client.target.uidFingerprint,historicalClientHashes,staffCanonicalContract:{addressClass:'INTERNAL_NAMESPACED_CXORBIA',namespaceClass:'STAFF',roles:new Set(['super','coordinador'])}};
}
function safeMember(user,lineage){
  const claims=user.customClaims||{};
  const role=norm(claims.role);
  const uidHash=sha256(user.uid);
  const markers=technicalMarkers(claims);
  return {
    candidateFp:candidateFp(user.uid),
    enabled:!user.disabled,
    providerClasses:providerClasses(user),
    addressClass:addressClass(user),
    role:ALLOWED_ROLES.has(role)?role:'OUTSIDE_CONTRACT',
    roleFamily:roleFamily(role),
    namespaceClass:namespaceClass(claims),
    tenantClass:tenantClass(claims,role),
    projectClass:projectClass(claims),
    targetProjectScoped:list(claims.projectIds).includes(TARGET_PROJECT),
    technicalMarkerKeys:markers.keys,
    technicalMarkerDigest:markers.digest,
    effectiveTyaAccess:effectiveTyaAccess(claims,role),
    canonicalClientLineageMatch:uidHash===lineage.canonicalClientUidFingerprint,
    historicalClientLineageMatch:lineage.historicalClientHashes.has(uidHash.slice(0,16)),
    canonicalImportedStaffClass:addressClass(user)===lineage.staffCanonicalContract.addressClass && namespaceClass(claims)===lineage.staffCanonicalContract.namespaceClass && lineage.staffCanonicalContract.roles.has(role)
  };
}
function adjudicateAccessGroup(groupFp,members){
  ensure(members.length===2,'ACCESS_GROUP_MEMBER_COUNT');
  if(groupFp==='ae2f920fe6d9ce1fdd82'){
    const canonical=members.filter(m=>m.canonicalClientLineageMatch);
    if(canonical.length===1){
      const keeper=canonical[0], other=members.find(m=>m.candidateFp!==keeper.candidateFp);
      return {groupFp,classification:'RESOLVED_CANONICAL_CLIENT_LINEAGE',keeperCandidateFp:keeper.candidateFp,otherCandidateFp:other.candidateFp,otherDisposition:other.historicalClientLineageMatch?'HISTORICAL_CLIENT_RETIRABLE':'NON_CANONICAL_DUPLICATE_RETIRABLE',ambiguous:false,repairLaterRequired:true};
    }
    return {groupFp,classification:'AMBIGUOUS_CLIENT_KEEPER_LINEAGE',keeperCandidateFp:null,otherCandidateFp:null,otherDisposition:null,ambiguous:true,repairLaterRequired:false};
  }
  const canonical=members.filter(m=>m.canonicalImportedStaffClass);
  if(canonical.length===1){
    const keeper=canonical[0], other=members.find(m=>m.candidateFp!==keeper.candidateFp);
    return {groupFp,classification:'RESOLVED_IMPORTED_STAFF_TECHNICAL_LINEAGE',keeperCandidateFp:keeper.candidateFp,otherCandidateFp:other.candidateFp,otherDisposition:'NON_CANONICAL_DUPLICATE_RETIRABLE',ambiguous:false,repairLaterRequired:true};
  }
  return {groupFp,classification:'AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR',keeperCandidateFp:null,otherCandidateFp:null,otherDisposition:null,ambiguous:true,repairLaterRequired:false};
}
function adjudicateBlockedGroup(groupFp,members){
  ensure(groupFp==='fd891812eca020d27ee3' && members.length===2,'BLOCKED_GROUP_DRIFT');
  ensure(members.every(m=>m.enabled && m.effectiveTyaAccess===false),'BLOCKED_GROUP_ACCESS_DRIFT');
  const outside=members.filter(m=>m.roleFamily==='OUTSIDE_CONTRACT');
  const crossTenant=members.filter(m=>m.roleFamily==='ADMIN_OPERACIONES' && m.tenantClass==='OTHER_TENANT');
  if(outside.length===1 && crossTenant.length===1){
    return {groupFp,classification:'POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS',keeperCandidateFp:null,policy:'NO_TYA_REPAIR_IN_CURRENT_SCOPE__PRESERVE_BLOCKED_PRINCIPALS_UNCHANGED_PENDING_OWNER_OR_TENANT_POLICY',outsideContractCandidateFp:outside[0].candidateFp,crossTenantCandidateFp:crossTenant[0].candidateFp,ambiguous:false,repairLaterRequired:false};
  }
  return {groupFp,classification:'AMBIGUOUS_BLOCKED_GROUP_POLICY',keeperCandidateFp:null,policy:null,ambiguous:true,repairLaterRequired:false};
}
function selfTest(){
  ensure(Object.keys(GROUPS).length===5 && EXPECTED_CANDIDATES.size===10,'SELFTEST_FROZEN_UNIVERSE');
  const lineage={canonicalClientUidFingerprint:sha256('client'),historicalClientHashes:new Set([sha256('old').slice(0,16)]),staffCanonicalContract:{addressClass:'INTERNAL_NAMESPACED_CXORBIA',namespaceClass:'STAFF',roles:new Set(['super','coordinador'])}};
  const cm={candidateFp:'c',canonicalClientLineageMatch:true,historicalClientLineageMatch:false};
  const old={candidateFp:'o',canonicalClientLineageMatch:false,historicalClientLineageMatch:true};
  ensure(adjudicateAccessGroup('ae2f920fe6d9ce1fdd82',[cm,old]).keeperCandidateFp==='c','SELFTEST_CLIENT');
  const staff={candidateFp:'s',canonicalImportedStaffClass:true}, external={candidateFp:'e',canonicalImportedStaffClass:false};
  ensure(adjudicateAccessGroup('1acdcb3782b7cf351056',[staff,external]).keeperCandidateFp==='s','SELFTEST_STAFF');
  const blocked=[{candidateFp:'x',enabled:true,effectiveTyaAccess:false,roleFamily:'OUTSIDE_CONTRACT',tenantClass:'NONE'},{candidateFp:'y',enabled:true,effectiveTyaAccess:false,roleFamily:'ADMIN_OPERACIONES',tenantClass:'OTHER_TENANT'}];
  ensure(adjudicateBlockedGroup('fd891812eca020d27ee3',blocked).ambiguous===false,'SELFTEST_BLOCKED');
  ensure(lineage.staffCanonicalContract.roles.size===2,'SELFTEST_LINEAGE');
}

async function main(){
  const report={schemaVersion:'cxorbia.c6.auth-duplicate-keeper-targetscope-adjudication-readonly.v1',generatedAt:new Date().toISOString(),firebaseProjectId:FIREBASE_PROJECT,targetTenant:TARGET_TENANT,targetProject:TARGET_PROJECT,decision:'STOP_RETRY_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION',provider:{reads:0,writes:0},frozenUniverse:{groupCount:5,candidateCount:10,groups:Object.keys(GROUPS)},groups:[],summary:{resolvedAccessGroups:0,ambiguousAccessGroups:0,blockedPolicyClosed:0},safety:{providerReads:0,providerWrites:0,authWrites:0,iamWrites:0,firestoreReads:0,firestoreWrites:0,hrReads:0,hrWrites:0,rulesWrites:0,storageWrites:0,prewrite:false,activation:false,newSmoke:false,reconstructUniverse340:false,make:0,gemini:0,payments:0,deploys:0,merge:false,production:false,rawUidExported:false,rawEmailExported:false,rawShopperIdExported:false,rawNameExported:false,rawClaimsExported:false,rawCredentialExported:false,creationTimeUsed:false,lastSignInTimeUsed:false,resultOrderUsed:false}};
  try{
    selfTest();
    if(process.argv.includes('--source-self-test')){ report.decision='PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_SOURCE_SELFTEST'; process.stdout.write(JSON.stringify(report)+'\n'); return; }
    const lineage=loadLineage();
    ensure(CREDENTIAL_FILE && fs.existsSync(CREDENTIAL_FILE),'EPHEMERAL_CREDENTIAL_MISSING');
    const sa=JSON.parse(fs.readFileSync(CREDENTIAL_FILE,'utf8'));
    ensure(sa?.type==='service_account'&&sa?.project_id===FIREBASE_PROJECT&&sa?.client_email&&sa?.private_key,'EPHEMERAL_CREDENTIAL_INVALID');
    const admin=(await import('firebase-admin')).default;
    if(!admin.apps.length) admin.initializeApp({credential:admin.credential.cert(sa),projectId:FIREBASE_PROJECT});
    const page=await admin.auth().listUsers(1000);
    report.provider.reads=1; report.safety.providerReads=1;
    ensure(!page.pageToken,'PROVIDER_READ_WOULD_REQUIRE_SECOND_PAGE');
    ensure(page.users.length===EXPECTED_AUTH_USERS,`AUTH_POPULATION_${page.users.length}`);
    const selected=[];
    for(const user of page.users){ const cfp=candidateFp(user.uid); if(EXPECTED_CANDIDATES.has(cfp)) selected.push({groupFp:emailGroupFp(user.email),member:safeMember(user,lineage)}); }
    ensure(selected.length===10 && new Set(selected.map(x=>x.member.candidateFp)).size===10,'TARGET_CANDIDATE_SET_INCOMPLETE');
    const byGroup=new Map();
    for(const item of selected){ ensure(GROUPS[item.groupFp],'TARGET_EMAIL_GROUP_DRIFT'); if(!byGroup.has(item.groupFp))byGroup.set(item.groupFp,[]); byGroup.get(item.groupFp).push(item.member); }
    for(const [g,expected] of Object.entries(GROUPS)){
      const members=(byGroup.get(g)||[]).sort((a,b)=>a.candidateFp.localeCompare(b.candidateFp));
      ensure(members.length===2 && expected.every(fp=>members.some(m=>m.candidateFp===fp)),'FROZEN_GROUP_MEMBER_DRIFT');
      const adjudication=ACCESS_GROUPS.has(g)?adjudicateAccessGroup(g,members):adjudicateBlockedGroup(g,members);
      report.groups.push({groupFp:g,members,adjudication});
      if(ACCESS_GROUPS.has(g)){ if(adjudication.ambiguous)report.summary.ambiguousAccessGroups++; else report.summary.resolvedAccessGroups++; }
      else if(!adjudication.ambiguous) report.summary.blockedPolicyClosed++;
    }
    ensure(report.summary.blockedPolicyClosed===1,'BLOCKED_POLICY_NOT_CLOSED');
    if(report.summary.ambiguousAccessGroups===0 && report.summary.resolvedAccessGroups===4){ report.decision='PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION'; }
    else throw new Error(`KEEPER_ANCHOR_INSUFFICIENT_${report.summary.ambiguousAccessGroups}`);
  }catch(error){ report.error=safeError(error); }
  process.stdout.write(JSON.stringify(report)+'\n');
  if(report.decision!=='PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION') process.exitCode=2;
}

await main();
