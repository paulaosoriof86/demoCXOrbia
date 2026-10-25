#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=process.env.TENANT_ID||'tya';
const PROGRAM=process.env.PROJECT_ID||'cinepolis';
const OUT=process.env.OUT||'.tmp/vrm185-paula-identity-topology';
const EXPECTED_REV=String(process.env.EXPECTED_HR_REVISION||'').trim();
const HR_ID=String(process.env.PAULA_EXACT_HR_ID||'shopper_gt_1440137b73').trim();
const LEGACY_ID=String(process.env.PAULA_LEGACY_CANONICAL_ID||'s3').trim();
const SECOND_ID=String(process.env.PAULA_SECOND_PRINCIPAL_ID||'').trim();
const LOGIN=String(process.env.PAULA_VISIBLE_LOGIN||'paula.osorio').trim().toLowerCase();
const PRE='YES_PAULA_20260628_PREVIEW_DEV',PROT='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fp=v=>v?sha(v).slice(0,20):null;
const techKeys=['id','shopperId','canonicalShopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','sourceStableKey','sourceShopperId','sourceIdentityKey','sourceSubjectId','profileId','shopperDocId'];
const aliasKeys=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases','canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds','externalShopperIds'];
const tokens=o=>uniq([...techKeys.map(k=>o?.[k]),...aliasKeys.flatMap(k=>arr(o?.[k]))]);
const docId=x=>str(x?.canonicalShopperId||x?.shopperId||x?.id);
const sanitizeProfile=p=>p?{id:docId(p),sourceType:str(p.sourceType),country:str(p.country||p.pais),visibleLogin:str(p.visibleLogin||p.username||p.user).toLowerCase(),credentialRuleVersion:str(p.credentialRuleVersion),credentialPasswordProofVersion:str(p.credentialPasswordProofVersion),exactAliases:uniq(p.exactAliases),legacyLiveShopperIds:uniq(p.legacyLiveShopperIds),identityAliases:uniq(p.identityAliases),nameFingerprint:fp(str(p.nombre||p.name||[p.firstName,p.lastName].filter(Boolean).join(' ')).toLowerCase()),hasFirstName:!!str(p.firstName),hasLastName:!!str(p.lastName)}:null;
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm185.paula-identity-topology.v2',decision:'HOLD_VRM185_PAULA_IDENTITY_TOPOLOGY',classification:'MAPPING_FAILURE',readOnly:true,writes:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,production:false,expectedHrRevision:EXPECTED_REV,knownLineage:{exactHrId:HR_ID,legacyCanonicalId:LEGACY_ID,secondObservedPrincipalId:SECOND_ID||null,visibleLogin:LOGIN},membership:null,auth:null,profiles:[],links:[],crosswalk:[],hr:null,browser:null,conclusion:null};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
save();

if(!/^[a-f0-9]{64}$/.test(EXPECTED_REV))throw new Error('RELEASE_COMPOSITION_FAILURE:VRM185_EXPECTED_HR_REVISION_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);

async function allAuthUsers(){const out=[];let token;do{const page=await auth.listUsers(1000,token);out.push(...page.users);token=page.pageToken;}while(token);return out;}
async function main(){
 const [memberSnap,profileSnap,linkSnap,crossSnap,authUsers]=await Promise.all([
   tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityLinks').get(),tenant.collection('shopperIdentityCrosswalk').get(),allAuthUsers()
 ]);
 const members=memberSnap.docs.map(d=>({id:d.id,...(d.data()||{})})),profiles=profileSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})})),links=linkSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})})),cross=crossSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
 const loginMembers=members.filter(m=>m.active===true&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper'&&str(m.visibleLogin).toLowerCase()===LOGIN);
 if(loginMembers.length!==1)throw new Error('AUTH_FAILURE:VRM185_PAULA_LOGIN_MEMBERSHIP_COUNT_'+loginMembers.length);
 const member=loginMembers[0],user=await auth.getUser(member.id),claims=user.customClaims||{};
 const currentId=str(member.shopperId),candidate=new Set([currentId,HR_ID,LEGACY_ID,SECOND_ID].filter(Boolean));
 for(let pass=0;pass<3;pass++){
   for(const l of links){const ts=tokens(l),to=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId);if(ts.some(x=>candidate.has(x))||candidate.has(to)){ts.forEach(x=>candidate.add(x));if(to)candidate.add(to);}}
   for(const x of cross){const ts=tokens(x),to=str(x.shopperId);if(ts.some(y=>candidate.has(y))||candidate.has(to)){ts.forEach(y=>candidate.add(y));if(to)candidate.add(to);}}
 }
 const candidateIds=[...candidate].filter(Boolean);
 const relevantProfiles=profiles.filter(p=>tokens(p).some(x=>candidate.has(x))||candidate.has(docId(p)));
 const relevantLinks=links.filter(l=>tokens(l).some(x=>candidate.has(x))||candidate.has(str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId)));
 const relevantCross=cross.filter(x=>tokens(x).some(y=>candidate.has(y))||candidate.has(str(x.shopperId)));
 const relevantMembers=members.filter(m=>candidate.has(str(m.shopperId))||str(m.visibleLogin).toLowerCase()===LOGIN).map(m=>({uidFingerprint:fp(m.id),shopperId:str(m.shopperId),visibleLogin:str(m.visibleLogin).toLowerCase(),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),projectScoped:arr(m.projectIds).map(String).includes(PROGRAM),credentialRuleVersion:str(m.credentialRuleVersion),credentialPasswordProofVersion:str(m.credentialPasswordProofVersion)}));
 const relevantAuth=authUsers.filter(u=>candidate.has(str(u.customClaims?.shopperId))||u.uid===member.id).map(u=>({uidFingerprint:fp(u.uid),shopperId:str(u.customClaims?.shopperId),disabled:u.disabled===true,role:str(u.customClaims?.role),authNamespace:str(u.customClaims?.authNamespace),tenantId:str(u.customClaims?.tenantId),projectScoped:arr(u.customClaims?.projectIds).map(String).includes(PROGRAM),emailFingerprint:fp(str(u.email).toLowerCase())}));
 result.membership={uidFingerprint:fp(member.id),shopperId:currentId,visibleLogin:str(member.visibleLogin).toLowerCase(),active:member.active===true,projectScoped:arr(member.projectIds).map(String).includes(PROGRAM),candidateMemberships:relevantMembers};
 result.auth={uidFingerprint:fp(user.uid),claimsShopperId:str(claims.shopperId),disabled:user.disabled===true,role:str(claims.role),authNamespace:str(claims.authNamespace),tenantId:str(claims.tenantId),projectScoped:arr(claims.projectIds).map(String).includes(PROGRAM),candidatePrincipals:relevantAuth};
 result.profiles=relevantProfiles.map(sanitizeProfile);
 result.links=relevantLinks.map(l=>({id:str(l.__docId),status:str(l.status||l.state).toLowerCase(),authorityType:str(l.authorityType||l.authority?.type).toLowerCase(),canonicalShopperId:str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId),sourceTokens:tokens(l).filter(x=>candidate.has(x)),periodIndependent:l.periodIndependent===true,projectScope:str(l.projectScope)}));
 result.crosswalk=relevantCross.map(x=>({id:str(x.__docId),sourceType:str(x.sourceType).toLowerCase(),identityMode:str(x.identityMode).toLowerCase(),sourceStableKey:str(x.sourceStableKey),sourceShopperId:str(x.sourceShopperId),shopperId:str(x.shopperId),projectIds:arr(x.projectIds).map(String),updatedAt:String(x.updatedAt||'')}));
 const hrRes=await fetch(HOST+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm185='+Date.now(),{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
 if(!hrRes.ok)throw new Error('SOURCE_FAILURE:VRM185_HR_HTTP_'+hrRes.status);
 const hp=await hrRes.json(),hr=hp?.snapshot||hp?.data||hp,revision=str(hp?._runtime?.revision||hr?._runtime?.revision||hr?.sourceRevision||hr?.revision),visits=arr(hr?.visits),shoppers=arr(hr?.shoppers);
 if(revision!==EXPECTED_REV)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM185_HR_REVISION_MISMATCH:'+revision);
 const visitCounts=Object.fromEntries(candidateIds.map(id=>[id,visits.filter(v=>str(v.shopperId||v.shopperCode||v.shopper)===id).length]));
 const hrRows=shoppers.filter(s=>candidate.has(str(s.id||s.shopperId))).map(s=>({id:str(s.id||s.shopperId),country:str(s.country||s.pais),nameFingerprint:fp(str(s.nombre||s.name||s.displayName||s.fullName).toLowerCase())}));
 result.hr={revision,visitCounts,shopperRows:hrRows,totalVisits:visits.length,totalShoppers:shoppers.length};
 const exactRefIds=new Set([HR_ID,LEGACY_ID]);
 const containsExact=(value,depth=0)=>{
   if(depth>8||value==null)return false;
   if(typeof value==='string')return exactRefIds.has(value.trim());
   if(Array.isArray(value))return value.some(v=>containsExact(v,depth+1));
   if(typeof value==='object')return Object.values(value).some(v=>containsExact(v,depth+1));
   return false;
 };
 async function scanCollections(parent,scope){
   const collections=await parent.listCollections(),out=[];
   for(const col of collections){
     const snap=await col.get(),hits=[];
     for(const doc of snap.docs)if(containsExact(doc.data()||{}))hits.push(fp(doc.id));
     if(hits.length)out.push({scope,collection:col.id,documents:snap.size,exactIdentityReferenceCount:hits.length,sampleDocumentFingerprints:hits.slice(0,12)});
   }
   return out;
 }
 const projectRef=tenant.collection('projects').doc(PROGRAM);
 result.domainReferences=[...(await scanCollections(tenant,'tenant')),...(await scanCollections(projectRef,'project'))];
 const historicalLink=result.links.find(l=>l.authorityType==='tenant_adjudication'&&l.canonicalShopperId===LEGACY_ID&&l.sourceTokens.includes(HR_ID));
 const selfCross=result.crosswalk.find(x=>x.sourceType==='hr_external'&&[x.id,x.sourceStableKey,x.sourceShopperId].includes(HR_ID)&&x.shopperId===HR_ID);
 const activeCurrentPrincipals=result.auth.candidatePrincipals.filter(x=>!x.disabled&&x.shopperId===HR_ID);
 const activeLegacyPrincipals=result.auth.candidatePrincipals.filter(x=>!x.disabled&&x.shopperId===LEGACY_ID);
 const legacyProfile=result.profiles.find(x=>x.id===LEGACY_ID),currentProfile=result.profiles.find(x=>x.id===HR_ID);
 const sameNameFingerprint=!!legacyProfile?.nameFingerprint&&legacyProfile.nameFingerprint===currentProfile?.nameFingerprint;
 const legacySelectedByHuman=!!historicalLink;
 const currentExactAuthority=result.hr.shopperRows.some(x=>x.id===HR_ID)&&Number(result.hr.visitCounts?.[HR_ID]||0)>0&&Number(result.hr.visitCounts?.[LEGACY_ID]||0)===0&&!!selfCross;
 const legacyCredentialKeeper=str(legacyProfile?.visibleLogin)===LOGIN&&str(legacyProfile?.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2';
 const currentCredentialIsGeneratedCollision=!!str(currentProfile?.visibleLogin)&&str(currentProfile?.visibleLogin)!==LOGIN&&!str(currentProfile?.credentialPasswordProofVersion);
 const safeKeeperProven=legacySelectedByHuman&&sameNameFingerprint&&legacyCredentialKeeper&&currentCredentialIsGeneratedCollision&&activeLegacyPrincipals.length===1&&activeCurrentPrincipals.length===1;
 const knownIds=new Set([HR_ID,LEGACY_ID]);
 const secondProfile=result.profiles.find(x=>x.id===SECOND_ID)||null;
 const secondActivePrincipals=result.auth.candidatePrincipals.filter(x=>SECOND_ID&&x.shopperId===SECOND_ID&&!x.disabled);
 const secondHrVisits=SECOND_ID?Number(result.hr.visitCounts?.[SECOND_ID]||0):0;
 const connectionRows=[];
 const addConnection=(kind,id,values,authority,status)=>{const vals=uniq(values);if(SECOND_ID&&vals.includes(SECOND_ID)&&vals.some(x=>knownIds.has(x)))connectionRows.push({kind,id,authority:authority||null,status:status||null,tokens:vals});};
 for(const p of relevantProfiles)addConnection('profile',docId(p),tokens(p),str(p.authorityType||p.identityAuthority),str(p.identityState||p.status));
 for(const l of relevantLinks)addConnection('identityLink',str(l.__docId),[...tokens(l),str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId)],str(l.authorityType||l.authority?.type),str(l.status||l.state));
 for(const x of relevantCross)addConnection('crosswalk',str(x.__docId),[...tokens(x),str(x.shopperId)],str(x.sourceType),str(x.status||x.identityMode));
 const trustedSecondConnections=connectionRows.filter(x=>['tenant_adjudication','hr_external','provider_exact','manual_adjudication'].includes(str(x.authority).toLowerCase())||['materialized','active','resolved','exact'].includes(str(x.status).toLowerCase()));
 const secondExactLinkedToKnown=trustedSecondConnections.length>0;
 const secondNameMatchesKnown=!!secondProfile?.nameFingerprint&&(secondProfile.nameFingerprint===currentProfile?.nameFingerprint||secondProfile.nameFingerprint===legacyProfile?.nameFingerprint);
 const secondClassification=!SECOND_ID?'not_provided':secondExactLinkedToKnown?'exact_technical_lineage_to_known_paula':secondNameMatchesKnown?'same_display_name_without_exact_lineage':'independent_technical_identity';
 result.browser={evidenceSourceRunId:37096793662,evidenceSourceRunNumber:914,firstBlocker:'PAULA_OSORIO_PROFILE_KPI_HISTORY_ROUTES_FAIL',identity:false,authority:true,routesPass:true};
 result.conclusion={
   rootCause:'PAULA_IDENTITY_TOPOLOGY_CURRENT_ARTIFACT_READ_ONLY',
   sameHumanHistoricalLineage:legacySelectedByHuman&&sameNameFingerprint,
   currentExactAuthority,
   credentialKeeper:'historical_human_adjudicated_principal',
   legacyCredentialKeeperProven:legacyCredentialKeeper,
   currentCredentialGeneratedCollision:currentCredentialIsGeneratedCollision,
   activeCurrentPrincipals:activeCurrentPrincipals.length,
   activeLegacyPrincipals:activeLegacyPrincipals.length,
   safeKeeperProven,
   canonicalOperationalShopperId:HR_ID,
   credentialKeeperShopperId:LEGACY_ID,
   secondObservedPrincipalId:SECOND_ID||null,
   secondProfilePresent:!!secondProfile,
   secondActivePrincipals:secondActivePrincipals.length,
   secondHrVisits,
   secondNameMatchesKnown,
   secondExactLinkedToKnown,
   secondClassification,
   secondTechnicalConnections:connectionRows,
   trustedSecondConnections,
   domainReferenceCollections:result.domainReferences.map(x=>({scope:x.scope,collection:x.collection,count:x.exactIdentityReferenceCount})),
   mergeMustRemapAllExactLegacyReferences:true,
   secondPrincipalMustNotMergeByNameOnly:!secondExactLinkedToKnown
 };
 const baseTopologyProven=result.conclusion.sameHumanHistoricalLineage&&currentExactAuthority&&safeKeeperProven;
 const secondTopologyResolved=!SECOND_ID||!!secondProfile;
 result.decision=baseTopologyProven&&secondTopologyResolved?'PASS_VRM185_PAULA_IDENTITY_TOPOLOGY_PROVEN':'HOLD_VRM185_PAULA_IDENTITY_TOPOLOGY_UNRESOLVED';
 save();
 console.log(JSON.stringify({decision:result.decision,classification:result.classification,membership:result.membership,auth:result.auth,hr:result.hr,browser:result.browser,conclusion:result.conclusion,writes:0,production:false},null,2));
 if(result.decision!=='PASS_VRM185_PAULA_IDENTITY_TOPOLOGY_PROVEN')process.exitCode=2;
}
main().catch(e=>{result.error=String(e?.stack||e);save();console.error(result.error);process.exitCode=2;});
