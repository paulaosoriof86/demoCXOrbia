#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROGRAM=process.env.PROJECT_ID||'cinepolis';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.VRM226_OUT||'.tmp/i3-vrm226-human-identity-topology';
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const fp=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,20);
const groups=[{"canonicalHumanName":"Herbert Ríos","currentHrShopperId":"shopper_gt_f65cbc6391","confirmedSameHumanNames":["Herbert","Herbert Ríos","Herbert Carrillo"]},{"canonicalHumanName":"Elizabeth González","currentHrShopperId":"shopper_gt_833dc86954","confirmedSameHumanNames":["ELIZA","Elizabeth González"]},{"canonicalHumanName":"Andrea Loarca","currentHrShopperId":"shopper_gt_5f3d6952c5","confirmedSameHumanNames":["Andrea","Andrea Loarca","Andrea Luarca"]},{"canonicalHumanName":"Cinthya Lixon","currentHrShopperId":"shopper_gt_fc5d6fb927","confirmedSameHumanNames":["ÁNGELES","Angeles","Cinthya Lixon","Angeles Martínez","Ángeles Martínez","María Lixon","Maria Lixon"]},{"canonicalHumanName":"Erick Gomez","currentHrShopperId":"shopper_gt_3106d9d44b","confirmedSameHumanNames":["Erick","Erick Gomez","Erick Gómez"]},{"canonicalHumanName":"Joshua Urbina","currentHrShopperId":"shopper_hn_fc52fabe94","confirmedSameHumanNames":["JOSHUA","Joshua","Joshua Urbina"]},{"canonicalHumanName":"Aldair Ixcayau","currentHrShopperId":"shopper_gt_3426ec3ff3","confirmedSameHumanNames":["ALDAIR","Aldair","Aldair Ixcayau","Aldair Saquich"]},{"canonicalHumanName":"Flavio Salgado","currentHrShopperId":"shopper_hn_99cb2f9b05","confirmedSameHumanNames":["Flavio","Flavio Salgado"]}];
const protectedHrId="shopper_hn_9a6963fdf6";
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm226.human-identity-topology.v1',decision:'HOLD',readOnly:true,writes:0,production:false,expectedHrRevision:EXPECTED_HR,persons:[],protectedCurrentHr:null};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM226_EXPECTED_HR_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
async function allAuth(){const out=[];let token;do{const p=await auth.listUsers(1000,token);out.push(...p.users);token=p.pageToken;}while(token);return out;}
const [profilesSnap,usersSnap,crossSnap,linksSnap,reviewsSnap,authUsers,hrRes]=await Promise.all([
 tenant.collection('shoppers').get(),tenant.collection('users').get(),tenant.collection('shopperIdentityCrosswalk').get(),
 tenant.collection('shopperIdentityLinks').get(),tenant.collection('shopperIdentityReviews').get(),allAuth(),
 fetch(HOST+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm226='+Date.now(),{headers:{'cache-control':'no-cache,no-store,max-age=0'}})
]);
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:VRM226_HR_HTTP_'+hrRes.status);
const hb=await hrRes.json(),hr=hb.snapshot||hb.data||hb,revision=str(hb.revision||hb._runtime?.revision||hr.sourceRevision||hr.revision);
if(revision!==EXPECTED_HR)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM226_HR_DRIFT_'+revision);
const profiles=profilesSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const members=usersSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const cross=crossSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const links=linksSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const reviews=reviewsSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const authByUid=new Map(authUsers.map(u=>[u.uid,u]));
const profileName=p=>str(p.nombre||p.name||p.displayName||p.fullName||[p.firstName,p.lastName||p.firstSurname||p.primerApellido].filter(Boolean).join(' '));
const profileId=p=>str(p.shopperId||p.id||p.__docId);
const tokens=o=>[o?.shopperId,o?.canonicalShopperId,o?.sourceShopperId,o?.sourceStableKey,o?.sourceIdentityKey,o?.profileId,o?.id,o?.__docId,...arr(o?.exactAliases),...arr(o?.sourceAliases),...arr(o?.sourceShopperIds),...arr(o?.legacyLiveShopperIds)].map(str).filter(Boolean);
for(const g of groups){
 const aliases=new Set(g.confirmedSameHumanNames.map(norm));
 const nameProfiles=profiles.filter(p=>aliases.has(norm(profileName(p))));
 const anchoredIds=new Set([g.currentHrShopperId,...nameProfiles.map(profileId)]);
 for(let pass=0;pass<3;pass++){
  for(const x of [...cross,...links]){const ts=tokens(x),target=str(x.shopperId||x.canonicalShopperId);if(ts.some(t=>anchoredIds.has(t))||anchoredIds.has(target)){ts.forEach(t=>anchoredIds.add(t));if(target)anchoredIds.add(target);}}
 }
 const candidateProfiles=profiles.filter(p=>anchoredIds.has(profileId(p))||tokens(p).some(t=>anchoredIds.has(t)));
 const candidateMembers=members.filter(m=>anchoredIds.has(str(m.shopperId)));
 const rows=candidateProfiles.map(p=>{
   const id=profileId(p),ms=candidateMembers.filter(m=>str(m.shopperId)===id),active=ms.filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper');
   const authState=active.map(m=>{const u=authByUid.get(m.__docId),c=u?.customClaims||{};return{uidFingerprint:fp(m.__docId),disabled:u?.disabled===true,claimsShopperId:str(c.shopperId),visibleLogin:str(m.visibleLogin||p.visibleLogin||p.username||p.user),passwordProof:!!str(m.credentialPasswordProofVersion||p.credentialPasswordProofVersion)};});
   return{id,name:profileName(p),sourceType:str(p.sourceType),identityState:str(p.identityState),activeMemberships:active.length,auth:authState,projectScoped:arr(p.projectIds).map(String).includes(PROGRAM),exactNameAlias:aliases.has(norm(profileName(p)))};
 });
 const hrRows=arr(hr.shoppers).filter(x=>str(x.id||x.shopperId)===g.currentHrShopperId).map(x=>({name:str(x.nombre||x.name||x.shopper),country:str(x.country||x.pais),sourceRef:str(x.sourceRef)}));
 const hrVisits=arr(hr.visits).filter(x=>str(x.shopperId)===g.currentHrShopperId).map(x=>({hrRowId:str(x.hrRowId),branch:str(x.sucursal||x.branch),state:str(x.estado||x.status),periodKey:str(x.periodKey||x.periodId)}));
 const activeCandidates=rows.filter(x=>x.activeMemberships===1&&x.auth.some(a=>!a.disabled));
 const strong=activeCandidates.filter(x=>x.auth.some(a=>a.passwordProof));
 const preferredExact=rows.filter(x=>norm(x.name)===norm(g.canonicalHumanName));
 const canonicalChoices=[...new Set((preferredExact.length?preferredExact:(strong.length?strong:activeCandidates)).map(x=>x.id))];
 const relatedLinks=links.filter(x=>tokens(x).some(t=>anchoredIds.has(t))).map(x=>({id:x.__docId,canonicalShopperId:str(x.canonicalShopperId),authorityType:str(x.authorityType),status:str(x.status||x.state),tokens:tokens(x).filter(t=>anchoredIds.has(t))}));
 const relatedCross=cross.filter(x=>tokens(x).some(t=>anchoredIds.has(t))).map(x=>({id:x.__docId,shopperId:str(x.shopperId),sourceStableKey:str(x.sourceStableKey),identityMode:str(x.identityMode),status:str(x.status)}));
 const activeReviews=reviews.filter(x=>str(x.status||'active')==='active'&&tokens(x).some(t=>anchoredIds.has(t))).map(x=>({id:x.__docId,reason:str(x.reason),shopperIds:arr(x.shopperIds).map(str)}));
 result.persons.push({canonicalHumanName:g.canonicalHumanName,currentHrShopperId:g.currentHrShopperId,confirmedSameHumanNames:g.confirmedSameHumanNames,hrRows,hrVisits,candidateProfiles:rows,relatedLinks,relatedCross,activeReviews,canonicalChoices,readyForBoundedAdjudication:canonicalChoices.length===1&&rows.length>=1});
}
{
 const id=protectedHrId,profile=profiles.find(p=>profileId(p)===id)||null,cw=cross.find(x=>str(x.__docId)===id||str(x.sourceStableKey)===id||str(x.sourceShopperId)===id)||null;
 const mem=members.filter(m=>str(m.shopperId)===id).map(m=>({uidFingerprint:fp(m.__docId),active:m.active===true,visibleLogin:str(m.visibleLogin),role:str(m.role),authNamespace:str(m.authNamespace)}));
 result.protectedCurrentHr={currentHrShopperId:id,profile:profile?{id:profileId(profile),name:profileName(profile),sourceType:str(profile.sourceType),identityState:str(profile.identityState)}:null,crosswalk:cw?{id:cw.__docId,shopperId:str(cw.shopperId),sourceStableKey:str(cw.sourceStableKey)}:null,memberships:mem};
}
const overlap=new Map();for(const p of result.persons)for(const x of p.candidateProfiles){if(!overlap.has(x.id))overlap.set(x.id,[]);overlap.get(x.id).push(p.canonicalHumanName);}
result.overlaps=[...overlap].filter(([,g])=>g.length>1).map(([id,g])=>({id,groups:g}));
result.hrRevision=revision;result.readyGroups=result.persons.filter(x=>x.readyForBoundedAdjudication).length;
result.decision=result.overlaps.length===0?'PASS_VRM226_HUMAN_IDENTITY_TOPOLOGY_DIAGNOSTIC':'MAPPING_FAILURE_VRM226_OVERLAPPING_IDENTITY_GROUPS';
save();console.log(JSON.stringify(result,null,2));if(result.decision!=='PASS_VRM226_HUMAN_IDENTITY_TOPOLOGY_DIAGNOSTIC')process.exitCode=2;
