#!/usr/bin/env node
/* Paula R-020: READ-ONLY exact identity and one-certification adjudication preflight.
 * Human workbook 'Revisar nombre': SÍ, preferred keeper Técnica. The workbook's
 * 'Trazabilidad' D=HR canonical, E=technical account. Do not guess from prefixes.
 * No commands, no custom tokens, no Auth/Firestore/HR writes or deployment.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const HR_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const CANON_FP='4e019d203cff8c9d2cbe',ALIAS_FP='07a9c739b107db9cf677';
const AUTH='PAULA_I3_2026_10_28_APPROVED_R020_GT_READONLY';
const OUT=String(process.env.CX_R020_READONLY_OUT||'.tmp/cxorbia-i3-r020-readonly');
const val=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(val).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(kind,v)=>sha(kind+':'+v).slice(0,20);
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return c==='gt'||c==='guatemala'?'GT':c==='hn'||c==='honduras'?'HN':'UNSET';};
const name=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const phone=v=>val(v?.whatsapp||v?.phone||v?.telefono).replace(/[^0-9]/g,'');
const sid=v=>val(v?.shopperId||v?.id);
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const result={schemaVersion:'cxorbia.i3.r020.cert.readonly.v1',caseCode:'R-020',decision:'HOLD',
  environment:'DEV',production:false,project:PROJECT,tenant:TENANT,program:PROGRAM,
  sourceRevision:HR_REV,approvedCohortDigest:DIGEST,paulaDecision:'YES_SAME_HUMAN',
  paulaKeeperPreference:'TECHNICAL',readOnly:true,providerWrites:0,authWrites:0,
  firestoreWrites:0,hrWrites:0,externalWrites:0,deployments:0,merges:0};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');save();

const owners=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId',
  'applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId',
  'liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const references=(row,id)=>[...owners.filter(f=>val(row?.[f])===id),
  ...ownerArrays.filter(f=>arr(row?.[f]).some(v=>val(v)===id))];
const withoutOwner=row=>{const v={...row};for(const k of [...owners,...ownerArrays,'identityConsolidatedAt'])delete v[k];return JSON.stringify(v);};
async function findByFingerprint(collection,digest){
  const found=(await collection.get()).docs.filter(doc=>fp('sid',doc.id)===digest);
  assert(found.length===1,'R020_EXACT_PROFILE_FINGERPRINT_NOT_UNIQUE');return found[0];
}
async function hrLive(){
  const root='https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV';
  const r=await fetch(root+'&r020ReadOnly='+Date.now(),{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(r.ok,'R020_HR_PROVIDER_HTTP_'+r.status);
  const body=await r.json(),snapshot=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(revision===HR_REV,'R020_HR_REVISION_DRIFT');
  assert(body._runtime?.operationalView===true&&snapshot.operationalIdentityPreview===true,'R020_HR_SOURCE_AUTHORITY_NOT_VERIFIED');
  return {rows:arr(snapshot.shoppers),visits:arr(snapshot.visits),revision};
}
function valid(member,user,id){
  const c=user?.customClaims||{};
  return !!user&&!user.disabled&&member.active===true&&val(member.tenantId)===TENANT&&
    val(member.role)==='shopper'&&val(member.authNamespace)==='shopper'&&
    val(member.shopperId)===id&&arr(member.projectIds).includes(PROGRAM)&&
    val(c.role)==='shopper'&&val(c.authNamespace)==='shopper'&&
    val(c.tenantId)===TENANT&&val(c.shopperId)===id&&arr(c.projectIds).includes(PROGRAM);
}
async function membersFor(users,id,auth){
  const s=await users.where('shopperId','==',id).get();
  const out=[];
  for(const d of s.docs){const member=d.data()||{};
    if(member.active!==true||val(member.tenantId)!==TENANT||val(member.role)!=='shopper'||
      val(member.authNamespace)!=='shopper'||!arr(member.projectIds).includes(PROGRAM))continue;
    const u=await auth.getUser(d.id);
    assert(valid(member,u,id),'R020_AUTH_MEMBER_CLAIMS_MISMATCH');
    out.push({id:d.id,member,user:u});
  }
  assert(out.length<=1,'R020_MULTIPLE_ACTIVE_PRINCIPALS_PER_ID');return out;
}

try{
  assert(process.env.CX_R020_READONLY_AUTH===AUTH,'R020_AUTHORIZATION_GATE');
  assert(process.env.GCLOUD_PROJECT===PROJECT||process.env.GOOGLE_CLOUD_PROJECT===PROJECT,'R020_DEV_ONLY_PROJECT_GATE');
  assert(process.env.CX_R020_APPROVED_DIGEST===DIGEST,'R020_EXACT_WORKBOOK_DIGEST_GATE');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT);
  const profiles=tenant.collection('shoppers'),users=tenant.collection('users');
  const [canonicalDoc,aliasDoc,hr]=await Promise.all([
    findByFingerprint(profiles,CANON_FP),findByFingerprint(profiles,ALIAS_FP),hrLive()]);
  const canonical=canonicalDoc.id,alias=aliasDoc.id,cp=canonicalDoc.data()||{},ap=aliasDoc.data()||{};
  const hrCanonical=hr.rows.filter(row=>sid(row)===canonical),hrAlias=hr.rows.filter(row=>sid(row)===alias);
  result.authority={canonicalFingerprintVerified:fp('sid',canonical)===CANON_FP,
    technicalFingerprintVerified:fp('sid',alias)===ALIAS_FP,
    canonicalHrRowCount:hrCanonical.length,technicalHrRowCount:hrAlias.length,
    protectedCanonicalSourceIsHr:val(cp.sourceType)==='hr_external',
    protectedTechnicalSourceIsHr:val(ap.sourceType)==='hr_external'};save();
  assert(canonical!==alias&&hrCanonical.length===1&&hrAlias.length===0&&
    val(cp.sourceType)==='hr_external','R020_SOURCE_IDENTITY_DRIFT');
  const n1=name(cp),n2=name(ap),n3=name(hrCanonical[0]);
  const pc=phone(cp),pa=phone(ap),ph=phone(hrCanonical[0]);
  const localGt=x=>x.startsWith('502')&&x.length===11?x.slice(3):x;
  result.identity={normalizedNameExact:n1.length>0&&n1===n2&&n2===n3,
    normalizedDisplayCaseDiacriticsIgnored:true,
    protectedCountryCanonical:country(cp),protectedCountryTechnical:country(ap),hrCountry:country(hrCanonical[0]),
    phoneCanonicalPresent:!!pc,phoneTechnicalPresent:!!pa,phoneHrPresent:!!ph,
    protectedPhoneExact:!!pc&&pc===pa,hrAndProtectedCanonicalPhoneExact:!!ph&&ph===pc,
    technicalVsCanonicalGtLocalEquivalent:!!pc&&!!pa&&localGt(pc)===localGt(pa),
    technicalVsHrGtLocalEquivalent:!!ph&&!!pa&&localGt(ph)===localGt(pa),
    canonicalPhoneDigitCount:pc.length,technicalPhoneDigitCount:pa.length,hrPhoneDigitCount:ph.length,
    canonicalPhoneFingerprint:pc?fp('phone',pc):null,technicalPhoneFingerprint:pa?fp('phone',pa):null,
    hrPhoneFingerprint:ph?fp('phone',ph):null,
    hrHistoricalVisits:hr.visits.filter(v=>sid(v)===canonical).length};save();
  assert(result.identity.normalizedNameExact&&country(cp)==='GT'&&country(ap)==='GT'&&
    country(hrCanonical[0])==='GT','R020_HUMAN_APPROVED_NAME_COUNTRY_CONFLICT');
  assert(result.identity.hrHistoricalVisits===2,'R020_HR_HISTORY_COUNT_DRIFT');
  const [canonicalMembers,technicalMembers,canonicalCross,technicalCross]=await Promise.all([
    membersFor(users,canonical,auth),membersFor(users,alias,auth),
    tenant.collection('shopperIdentityCrosswalk').doc(canonical).get(),
    tenant.collection('shopperIdentityCrosswalk').doc(alias).get()]);
  assert(canonicalMembers.length<=1&&technicalMembers.length===1,'R020_TECHNICAL_KEEPER_NOT_UNIQUE');
  const principal=technicalMembers[0],member=principal.member;
  const strongProof=val(member.credentialPasswordProofVersion||ap.credentialPasswordProofVersion)===
    ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
  const inactiveSecondaryTooRecent=canonicalMembers.some(({user})=>{
    const raw=val(user.metadata?.lastSignInTime),stamp=Date.parse(raw);
    return !!raw&&(!Number.isFinite(stamp)||Date.now()-stamp<7*86400000);
  });
  result.access={technicalPrincipalActive:true,technicalUidFingerprint:fp('uid',principal.id),
    technicalPasswordProof:strongProof,technicalLoginPresent:!!val(member.visibleLogin),
    technicalPrivateEmailNamespace:val(principal.user.email).endsWith('@auth.cxorbia.invalid'),
    canonicalAdditionalActivePrincipals:canonicalMembers.length,
    canonicalSecondaryRecentSignIn:inactiveSecondaryTooRecent,
    canonicalCrosswalkOwned:canonicalCross.exists&&val(canonicalCross.data()?.shopperId)===canonical,
    technicalCrosswalkSelfOwned:technicalCross.exists&&val(technicalCross.data()?.shopperId)===alias};save();
  assert(strongProof&&result.access.technicalLoginPresent&&result.access.technicalPrivateEmailNamespace&&
    !inactiveSecondaryTooRecent&&result.access.canonicalCrosswalkOwned&&result.access.technicalCrosswalkSelfOwned,
    'R020_TECHNICAL_KEEPER_PROOF_OR_CROSSWALK_UNSAFE');
  const areas=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],
    ['project','certifications'],['project','liquidations'],['project','postulations'],
    ['project','reservations'],['project','visits']];
  const count={},certDocs=[];
  for(const [scope,name] of areas){
    const parent=scope==='tenant'?tenant:tenant.collection('projects').doc(PROGRAM),s=await parent.collection(name).get();
    const matched=s.docs.filter(doc=>references(doc.data()||{},alias).length>0);
    count[name]=matched.length;if(name==='certifications')certDocs.push(...matched);
  }
  result.domain={aliasOwned:count,certificationExactlyOne:certDocs.length===1};save();
  assert(count.certifications===1&&Object.entries(count).filter(([k])=>k!=='certifications').every(([,n])=>n===0),
    'R020_OTHER_DOMAIN_TOPOLOGY_DRIFT');
  const cert=certDocs[0],certData=cert.data()||{};
  const certKeys=references(certData,alias);
  const noCrossCountry=country(certData)==='GT'||country(certData)==='UNSET';
  result.certification={idFingerprint:fp('certDoc',cert.id),
    ownerFieldNames:certKeys,nonOwnerContentFingerprint:fp('certContent',withoutOwner(certData)),
    countryCompatible:noCrossCountry,projectCompatible:!val(certData.projectId)||val(certData.projectId)===PROGRAM,
    noCanonicalOwnerAlready:references(certData,canonical).length===0};save();
  assert(noCrossCountry&&result.certification.projectCompatible&&
    result.certification.noCanonicalOwnerAlready,'R020_CERT_SOURCE_SCOPE_CONFLICT');
  const links=(await tenant.collection('shopperIdentityLinks').get()).docs.filter(d=>{
    const l=d.data()||{},ids=[l.sourceShopperId,l.canonicalShopperId,...arr(l.exactAliases),...arr(l.sourceAliases)].map(val);
    return ['active','approved','confirmed','materialized'].includes(val(l.status||l.state).toLowerCase())&&
      ids.includes(alias)&&!ids.includes(canonical);
  });
  assert(links.length===0,'R020_CONFLICTING_PRIOR_IDENTITY_LINK');
  const fresh=await hrLive();
  assert(fresh.revision===hr.revision&&fresh.rows.filter(row=>sid(row)===canonical).length===1,
    'R020_HR_CHANGED_DURING_PREFLIGHT');
  const certFresh=await tenant.collection('projects').doc(PROGRAM).collection('certifications').doc(cert.id).get();
  assert(certFresh.exists&&withoutOwner(certFresh.data()||{})===withoutOwner(certData)&&
    JSON.stringify(references(certFresh.data()||{},alias))===JSON.stringify(certKeys),
    'R020_CERT_CHANGED_DURING_PREFLIGHT');
  result.decision='PASS_R020_EXACT_READONLY_PREFLIGHT';result.noFurtherHumanQuestionNeeded=
    result.identity.technicalVsCanonicalGtLocalEquivalent||result.identity.protectedPhoneExact||
    (result.identity.normalizedNameExact&&result.access.technicalPasswordProof&&result.paulaDecision==='YES_SAME_HUMAN');
  result.contactDiscrepancyNeedsExplicitNote=!result.identity.technicalVsCanonicalGtLocalEquivalent;
  save();
  console.log(JSON.stringify({decision:result.decision,caseCode:'R-020',
    canonicalHrRows:hrCanonical.length,technicalHrRows:hrAlias.length,
    normalizedNameExact:result.identity.normalizedNameExact,
    exactPhoneMatch:result.identity.protectedPhoneExact,
    localGtPhoneEquivalent:result.identity.technicalVsCanonicalGtLocalEquivalent,
    keeperTechnical:strongProof,aliasDomainCounts:count,questionNeeded:!result.noFurtherHumanQuestionNeeded,
    production:false,writes:0}));
}catch(error){result.decision='HOLD_R020_EXACT_READONLY_PREFLIGHT';
  result.errorCode=val(error.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,120);
  save();console.error(JSON.stringify({decision:result.decision,errorCode:result.errorCode,
    production:false,writes:0}));process.exitCode=2;}
