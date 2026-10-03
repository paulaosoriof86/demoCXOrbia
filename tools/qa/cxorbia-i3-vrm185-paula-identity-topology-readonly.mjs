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
const result={schemaVersion:'cxorbia.i3.vrm185.paula-identity-topology.v1',decision:'HOLD_VRM185_PAULA_IDENTITY_TOPOLOGY',classification:'MAPPING_FAILURE',readOnly:true,writes:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,production:false,expectedHrRevision:EXPECTED_REV,knownLineage:{exactHrId:HR_ID,legacyCanonicalId:LEGACY_ID,visibleLogin:LOGIN},membership:null,auth:null,profiles:[],links:[],crosswalk:[],hr:null,browser:null,conclusion:null};
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
 const currentId=str(member.shopperId),candidate=new Set([currentId,HR_ID,LEGACY_ID]);
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
 const url=HOST+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:PRE,cxProjectId:PROGRAM,cxProtectedRuntime:PROT,cxHumanFullVisual:FULL});
 const browser=await chromium.launch({headless:true});
 try{
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
   const token=await auth.createCustomToken(member.id);
   await page.evaluate(async t=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);await window.firebase.auth().signInWithCustomToken(t);},token);
   await page.reload({waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
   await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
   await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:150000});
   result.browser=await page.evaluate(({hrId,legacyId})=>{
     const d=window.CX?.data||{},str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
     const raw=str(window.CX?.backendAuth?.context?.()?.shopperId),map=d.__identityMap||{},mapped=str(map[raw]||raw);
     const idOf=x=>str(x?.id||x?.shopperId);
     const directRaw=(()=>{try{return d.getShopper?.(raw)||null}catch{return null}})();
     const directMapped=(()=>{try{return d.getShopper?.(mapped)||null}catch{return null}})();
     const aliasVals=row=>{const keys=['legacyShopperId','legacyId','sourceId','sourceKey','externalShopperId','canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds','externalShopperIds','identityAliases','aliases','exactAliases'];return [...new Set(keys.flatMap(k=>Array.isArray(row?.[k])?row[k]:[row?.[k]]).map(str).filter(Boolean))];};
     const tokens=new Set([raw,mapped].filter(Boolean));
     const aliasMatches=arr(d.shoppers).filter(r=>aliasVals(r).some(a=>tokens.has(a))).map(r=>idOf(r));
     const portal=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(d)||{};
     const historyFor=id=>{try{return typeof d.shopperHistoryVisits==='function'?d.shopperHistoryVisits(id,false).length:(typeof d.visitsForShopper==='function'?d.visitsForShopper(id,false).length:0)}catch{return -1}};
     return {raw,mapped,directRawId:idOf(directRaw),directMappedId:idOf(directMapped),protectedSessionProfileId:idOf(d.__sessionShopperProfile),aliasMatchIds:[...new Set(aliasMatches)],identityMapHr:str(map[hrId]||''),identityMapLegacy:str(map[legacyId]||''),portal:{ok:portal.ok===true,reason:str(portal.reason),raw:str(portal.raw),canonical:str(portal.canonical),tokens:arr(portal.tokens).map(String),matchIds:arr(portal.matches).map(idOf)},history:{raw:historyFor(raw),mapped:historyFor(mapped),hr:historyFor(hrId),legacy:historyFor(legacyId)},duplicateShopperIds:arr(d.shoppers).map(idOf).filter(Boolean).length-new Set(arr(d.shoppers).map(idOf).filter(Boolean)).size,authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,revision:str(d.previewMeta?.sourceRevision)};
   },{hrId:HR_ID,legacyId:LEGACY_ID});
   await ctx.close();
 }finally{await browser.close();}
 const historicalLink=result.links.find(l=>l.authorityType==='tenant_adjudication'&&l.canonicalShopperId===LEGACY_ID&&l.sourceTokens.includes(HR_ID));
 const selfCross=result.crosswalk.find(x=>x.sourceType==='hr_external'&&[x.id,x.sourceStableKey,x.sourceShopperId].includes(HR_ID)&&x.shopperId===HR_ID);
 const activeCurrentPrincipals=result.auth.candidatePrincipals.filter(x=>!x.disabled&&x.shopperId===HR_ID);
 const activeLegacyPrincipals=result.auth.candidatePrincipals.filter(x=>!x.disabled&&x.shopperId===LEGACY_ID);
 const portalAmbiguous=result.browser?.portal?.reason==='ambiguous_exact_identity';
 const directCurrent=[result.browser?.directRawId,result.browser?.directMappedId].includes(HR_ID);
 const legacyShadows=result.browser?.aliasMatchIds?.includes(LEGACY_ID);
 const sameHumanHistoricalLineage=!!historicalLink;
 const currentExactAuthority=result.membership.shopperId===HR_ID&&result.auth.claimsShopperId===HR_ID&&!!selfCross&&activeCurrentPrincipals.length===1;
 const credentialAmbiguity=activeLegacyPrincipals.length>0||activeCurrentPrincipals.length!==1;
 const rootCause=portalAmbiguous&&directCurrent&&legacyShadows?'PORTAL_EXACT_DIRECT_ROW_SHADOWED_BY_HISTORICAL_ALIAS':(!result.browser?.portal?.ok?'PORTAL_IDENTITY_RESOLUTION_UNRESOLVED':'NO_CURRENT_PORTAL_DEFECT');
 result.conclusion={rootCause,sameHumanHistoricalLineage,currentExactAuthority,credentialAmbiguity,activeCurrentPrincipals:activeCurrentPrincipals.length,activeLegacyPrincipals:activeLegacyPrincipals.length,safeMergeOrResolverCorrectionEligible:sameHumanHistoricalLineage&&currentExactAuthority&&!credentialAmbiguity,staleHistoricalLinkPresent:!!historicalLink,currentSelfCrosswalkPresent:!!selfCross};
 result.decision=rootCause==='PORTAL_EXACT_DIRECT_ROW_SHADOWED_BY_HISTORICAL_ALIAS'&&result.conclusion.safeMergeOrResolverCorrectionEligible?'PASS_VRM185_PAULA_IDENTITY_TOPOLOGY_PROVEN':'HOLD_VRM185_PAULA_IDENTITY_TOPOLOGY_UNRESOLVED';
 save();
 console.log(JSON.stringify({decision:result.decision,classification:result.classification,membership:result.membership,auth:result.auth,hr:result.hr,browser:result.browser,conclusion:result.conclusion,writes:0,production:false},null,2));
 if(result.decision!=='PASS_VRM185_PAULA_IDENTITY_TOPOLOGY_PROVEN')process.exitCode=2;
}
main().catch(e=>{result.error=String(e?.stack||e);save();console.error(result.error);process.exitCode=2;});
