#!/usr/bin/env node
/* I3 P0: exact two-human, provider-side read-only keeper feasibility.
 * The previously adjudicated 83/83 groups are historical PASS. This script
 * examines only the additional Murga/Vilca Auth clusters after HR name edits.
 * No credentials, UID, full shopper IDs, contact fields or domain documents
 * are printed. No HR, Auth, Firestore, product or production writes.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import CredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const SOURCE='09eed4f012f9ad04e49d53569aabd86bd4c832a9';
const ENDPOINT=`https://${PROJECT}.web.app/api/${TENANT}/${PROGRAM}/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV`;
const OUTPUT='.tmp/cxorbia-i3-residual-keeper-preflight';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const normalize=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const hash=v=>crypto.createHash('sha256').update(str(v)).digest('hex');
const sid=v=>str(v?.shopperId||v?.id);
const name=v=>normalize(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const country=v=>{const x=normalize(v?.pais||v?.country);return x==='guatemala'||x==='gt'?'GT':x==='honduras'||x==='hn'?'HN':'UNSET';};
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
  ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId',
  'applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const assert=(ok,code)=>{if(!ok)throw Error(code);};
const report={schemaVersion:'cxorbia.i3.residual-keeper-preflight.readonly.v1',iteration:'I3',
  sourceSha:SOURCE,environment:PROJECT,decision:'HOLD',approvedCohortGroupsPreviouslyVerified:83,
  safety:{hrWrites:0,authWrites:0,firestoreWrites:0,credentialResets:0,deployments:0,production:false},targets:[]};
fs.mkdirSync(OUTPUT,{recursive:true});

async function readHr(){
  const response=await fetch(ENDPOINT+'&nonce='+Date.now(),{headers:{'cache-control':'no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_READ_UNAVAILABLE');
  const body=await response.json(),data=body.snapshot||body.data||body;
  const revision=str(body.revision||body._runtime?.revision||data.sourceRevision);
  assert(revision.length>=20&&body._runtime?.operationalView===true&&data.operationalIdentityPreview===true,'HR_PROTECTED_REVISION_REQUIRED');
  assert(arr(data.shoppers).length>0&&arr(data.visits).length>0,'HR_EMPTY');
  return {revision,shoppers:data.shoppers,visits:data.visits};
}

async function readDev(db){
  const base=db.collection('tenants').doc(TENANT),project=base.collection('projects').doc(PROGRAM);
  const [ps,ms,cw,links,...sets]=await Promise.all([
    base.collection('shoppers').get(),base.collection('users').get(),
    base.collection('shopperIdentityCrosswalk').get(),base.collection('shopperIdentityLinks').get(),
    ...domains.map(([scope,key])=>(scope==='tenant'?base:project).collection(key).get())]);
  return {profiles:ps.docs.map(d=>({id:d.id,data:d.data()||{}})),
    members:ms.docs.map(d=>({uid:d.id,...d.data()})),
    cross:new Map(cw.docs.map(d=>[d.id,d.data()||{}])),
    links:links.docs.map(d=>d.data()||{}),
    rows:domains.map(([,key],i)=>({key,rows:sets[i].docs.map(d=>({id:d.id,data:d.data()||{}}))}))};
}

function matchesOwner(data,set){
  return ownerFields.some(key=>set.has(str(data[key])))||ownerArrays.some(key=>arr(data[key]).some(id=>set.has(str(id))));
}

async function targetPreflight({key,desiredName,desiredLogin,expectedCountry,test},state,hr,auth){
  const profiles=state.profiles.filter(p=>test(name(p.data))&&country(p.data)===expectedCountry);
  const profileIds=new Set(profiles.map(p=>p.id));
  assert(profiles.length>=2,'TARGET_PROFILE_GRAPH_MISSING_'+key);
  const hrRows=arr(hr.shoppers).filter(p=>test(name(p))&&country(p)===expectedCountry);
  const hrIdentityIds=uniq(hrRows.map(sid));
  assert(hrIdentityIds.length>0,'TARGET_HR_CANONICAL_UNAVAILABLE_'+key);
  const profilesWithoutHr=profiles.filter(p=>!hrIdentityIds.includes(p.id));
  const matchingMembers=state.members.filter(m=>m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&
    m.tenantId===TENANT&&arr(m.projectIds).includes(PROGRAM)&&profileIds.has(str(m.shopperId)));
  assert(matchingMembers.length>=2,'TARGET_ACTIVE_MEMBERSHIP_GRAPH_CHANGED_'+key);
  const authRows=[];
  for(const m of matchingMembers){
    const u=await auth.getUser(m.uid),claims=u.customClaims||{},login=str(m.visibleLogin).toLowerCase();
    const correct=!!login&&claims.shopperId===m.shopperId&&claims.tenantId===TENANT&&claims.role==='shopper'&&
      claims.authNamespace==='shopper'&&arr(claims.projectIds).includes(PROGRAM)&&u.disabled!==true;
    const date=Date.parse(str(u.metadata?.lastSignInTime));
    const days=Number.isFinite(date)?(Date.now()-date)/86400000:null;
    authRows.push({id:str(m.shopperId),login,correct,
      strong:str(m.credentialPasswordProofVersion)===CredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION||
        str(profiles.find(p=>p.id===m.shopperId)?.data.credentialPasswordProofVersion)===CredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION,
      recent:days!==null&&days>=0&&days<7,signInDays:days===null?null:Math.floor(days)});
  }
  const allCorrect=authRows.every(a=>a.correct&&a.strong);
  const namedCandidate=desiredLogin?authRows.filter(a=>a.login===desiredLogin):[];
  const recent=authRows.filter(a=>a.recent);
  const ranked=hrIdentityIds.map(id=>({id,visits:hr.visits.filter(v=>sid(v)===id||str(v.assignedShopperId)===id).length}))
    .sort((a,b)=>b.visits-a.visits||a.id.localeCompare(b.id));
  const canonical=ranked[0]?.id||profiles[0]?.id;
  const keeper=desiredLogin?(namedCandidate.length===1?namedCandidate[0]:null):
    (recent.length===1?recent[0]:authRows.filter(a=>a.strong).sort((a,b)=>(a.signInDays??1e5)-(b.signInDays??1e5))[0]);
  const aliases=new Set([...profileIds].filter(id=>id!==canonical));
  const targets=[...profileIds].map(id=>str(state.cross.get(id)?.shopperId||state.cross.get(id)?.canonicalShopperId))
    .filter(id=>id&&!profileIds.has(id));
  const linksExternal=state.links.filter(l=>{
    const active=['active','approved','confirmed','materialized'].includes(str(l.status||l.state).toLowerCase());
    const tokens=uniq([l.canonicalShopperId,l.sourceShopperId,l.sourceIdentityKey,...arr(l.exactAliases),...arr(l.sourceAliases)]);
    return active&&tokens.some(id=>profileIds.has(id))&&str(l.canonicalShopperId)&&!profileIds.has(str(l.canonicalShopperId));
  });
  const owned=Object.fromEntries(state.rows.map(row=>[row.key,row.rows.filter(doc=>matchesOwner(doc.data,aliases)).length]));
  const status=!allCorrect?'HOLD_AUTH_PROOF':!keeper?'HOLD_APPROVED_LOGIN_NOT_AVAILABLE':
    targets.length||linksExternal.length?'HOLD_EXTERNAL_CROSSWALK':
    authRows.some(a=>a.id!==keeper.id&&a.recent)?'HOLD_RECENT_SECONDARY_SESSION':
    'ELIGIBLE_PROVIDER_CANDIDATE_PENDING_EXACT_DOMAIN_PREWRITE_READBACK';
  const expectedLogin=CredentialRule.shopperCredentialRule({nombre:desiredName})?.login;
  return {target:key,approvedName:desiredName,desiredLogin:desiredLogin||expectedLogin,
    hrRevision:hr.revision,hrSourceCount:hrRows.length,hrIdentityCount:hrIdentityIds.length,
    currentProfileCount:profiles.length,unmatchedProfileCount:profilesWithoutHr.length,
    country:expectedCountry,activeAuthCount:authRows.length,allClaimsAndProofsCurrent:allCorrect,
    activeLogins:authRows.map(a=>({login:a.login,hasCurrentProof:a.strong,
      usedWithinSevenDays:a.recent})),
    desiredLoginOccupiedByVerifiedMember:namedCandidate.length===1,
    candidateKeeperLogin:keeper?.login||null,canonicalHrHasDirectVisits:(ranked[0]?.visits||0)>0,
    externalCrosswalkCount:targets.length,externalTrustedLinkCount:linksExternal.length,
    domainRowsToRetarget:owned,providerWriteCountUpperBound:Object.values(owned).reduce((n,v)=>n+v,0),
    status};
}

try{
  assert(str(process.env.CXORBIA_PRODUCT_SOURCE_SHA)===SOURCE,'SOURCE_PIN_NOT_CURRENT');
  assert(['',PROJECT].includes(str(process.env.GOOGLE_CLOUD_PROJECT)),'PROJECT_GUARD');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const db=getFirestore(),auth=getAuth(),hr=await readHr(),state=await readDev(db);
  for(const target of [
    {key:'JHENNYPHER_MURGA',desiredName:'Jhennypher Murga',desiredLogin:null,
      expectedCountry:'GT',test:n=>n.includes('murga')},
    {key:'ROCIO_VILCA',desiredName:'Rocío Vilca',desiredLogin:'rocio.vilca',
      expectedCountry:'HN',test:n=>/^rocio (vica|vilca)$/.test(n)}
  ])report.targets.push(await targetPreflight(target,state,hr,auth));
  const after=await readHr();
  assert(after.revision===hr.revision,'HR_REVISION_CHANGED_DURING_PREFLIGHT');
  report.hrRevision=hr.revision;
  report.decision=report.targets.every(t=>t.status.startsWith('ELIGIBLE_'))?'PASS_READONLY_TWO_KEEPERS_ELIGIBLE':
    'HOLD_READONLY_KEEPER_CREDENTIAL_SAFE_MIGRATION_REQUIRED';
}catch(e){report.decision='HOLD_READONLY_PREFLIGHT_ERROR';report.errorCode=str(e.message).replace(/[^A-Z0-9_]/gi,'_').slice(0,110);process.exitCode=1;}
finally{fs.writeFileSync(OUTPUT+'/result.json',JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify({decision:report.decision,targets:report.targets.map(t=>({
    target:t.target,hrSourceCount:t.hrSourceCount,activeAuthCount:t.activeAuthCount,status:t.status,
    candidateKeeperLogin:t.candidateKeeperLogin,domainRowsToRetarget:t.domainRowsToRetarget
  })),safety:report.safety},null,2)+'\n');}
