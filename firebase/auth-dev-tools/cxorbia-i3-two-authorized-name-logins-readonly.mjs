#!/usr/bin/env node
/* I3 narrow read-only post-HR correction proof; never mutates Auth/Firestore/HR. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT='cxorbia-backend-dev', TENANT='tya', PROJECT_ID='cinepolis';
const SOURCE='09eed4f012f9ad04e49d53569aabd86bd4c832a9';
const OUTPUT='.tmp/cxorbia-i3-two-authorized-name-logins-readonly';
const str=x=>String(x??'').trim(), arr=x=>Array.isArray(x)?x:[];
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const emailFor=visibleLogin=>`${hash(`${TENANT}\0shopper\0${visibleLogin.toLowerCase()}`).slice(0,48)}@auth.cxorbia.invalid`;
const result={schemaVersion:'cxorbia.i3.two-authorized-name-logins.dev.readonly.v1',
  iteration:'I3',sourceSha:SOURCE,environment:PROJECT,tenant:TENANT,project:PROJECT_ID,
  status:'HOLD',safety:{hrWrites:0,authWrites:0,firestoreWrites:0,deployments:0,production:false},targets:[]};
fs.mkdirSync(OUTPUT,{recursive:true});

try{
  if(str(process.env.CXORBIA_PRODUCT_SOURCE_SHA)!==SOURCE)throw Error('RELEASE_COMPOSITION_FAILURE:SOURCE_PIN');
  const path=str(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if(!path)throw Error('AUTH_FAILURE:SERVICE_ACCOUNT_UNAVAILABLE');
  const sa=JSON.parse(fs.readFileSync(path,'utf8'));
  if(sa.project_id!==PROJECT)throw Error('AUTH_FAILURE:PROJECT_MISMATCH');
  const app=initializeApp({credential:cert(sa),projectId:PROJECT},'two-names-readonly');
  const db=getFirestore(app),auth=getAuth(app),base=`tenants/${TENANT}`;
  const collections=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],
    ['project','certifications'],['project','liquidations'],['project','postulations'],
    ['project','reservations'],['project','visits']];
  const [ps,ms,crossSnap,linkSnap,...domainSnaps]=await Promise.all([
    db.collection(`${base}/shoppers`).get(),db.collection(`${base}/users`).get(),
    db.collection(`${base}/shopperIdentityCrosswalk`).get(),db.collection(`${base}/shopperIdentityLinks`).get(),
    ...collections.map(([scope,name])=>db.collection(scope==='tenant'?`${base}/${name}`:
      `${base}/projects/${PROJECT_ID}/${name}`).get())]);
  const members=ms.docs.map(doc=>({uid:doc.id,...(doc.data()||{})})).filter(m=>
    m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.tenantId===TENANT&&arr(m.projectIds).includes(PROJECT_ID));
  const profiles=ps.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
  const cross=new Map(crossSnap.docs.map(doc=>[doc.id,doc.data()||{}]));
  const links=linkSnap.docs.map(doc=>doc.data()||{});
  const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId',
    'applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId',
    'liquidationShopperId','reservationShopperId'];
  const ownerArrays=['shopperIds','candidateShopperIds'];
  const refsFor=shopperId=>Object.fromEntries(collections.map(([,name],i)=>[
    name,domainSnaps[i].docs.filter(doc=>{const data=doc.data()||{};
      return ownerFields.some(field=>str(data[field])===shopperId)||
        ownerArrays.some(field=>arr(data[field]).some(v=>str(v)===shopperId));}).length]));
  for(const [target,pattern,desiredName,desiredLogin] of [
    ['JHENNYPHER_MURGA',/murga/i,'Jhennypher Murga',null],
    ['ROCIO_VILCA',/vica|vilca/i,'Rocío Vilca','rocio.vilca']]){
    const matches=profiles.filter(p=>pattern.test([
      str(p.nombre),str(p.displayFirstName)+' '+str(p.displayLastName),
      str(p.firstName)+' '+str(p.lastName),str(p.nombreHR)
    ].join(' ')));
    const records=[];
    for(const profile of matches){
      const matchingMembers=members.filter(m=>str(m.shopperId)===str(profile.shopperId||profile.id));
      for(const member of matchingMembers){
        const a=await auth.getUser(member.uid),login=str(member.visibleLogin).toLowerCase();
        const lastSignIn=Date.parse(str(a.metadata?.lastSignInTime));
        const recentDays=Number.isFinite(lastSignIn)?Math.round((Date.now()-lastSignIn)/86400000):null;
        const sourceShopperId=str(profile.shopperId||profile.id);
        records.push({
          profileNombre:str(profile.nombre),
          staffDisplayName:[profile.displayFirstName,profile.displayLastName].map(str).filter(Boolean).join(' ')||null,
          profileLogin:str(profile.visibleLogin||profile.username||profile.user).toLowerCase(),
          memberLogin:login,authEmailMatchesMember:!!login&&str(a.email).toLowerCase()===emailFor(login),
          authActive:a.disabled!==true,claimsIdentityMatches:str(a.customClaims?.shopperId)===str(member.shopperId),
          sourceType:str(profile.sourceType),membershipActive:member.active===true,
          country:str(profile.pais||profile.country),recentSignInDays:recentDays,
          passwordProofCurrent:!!str(member.credentialPasswordProofVersion),
          domainRowReferences:refsFor(sourceShopperId),
          crosswalkCanonicalFingerprint:str(cross.get(sourceShopperId)?.shopperId)?
            hash(str(cross.get(sourceShopperId).shopperId)).slice(0,16):null,
          trustedLinkCount:links.filter(l=>str(l.canonicalShopperId)===sourceShopperId&&l.humanConfirmed===true).length,
          idFingerprint:hash(str(member.shopperId)).slice(0,16),uidFingerprint:hash(member.uid).slice(0,16)
        });
      }
    }
    result.targets.push({target,desiredName,desiredLogin,matchingProfiles:matches.length,
      activeMembershipRecords:records.length,records});
  }
  result.status='PASS_READONLY_SCOPED_CURRENT_ACCOUNT_INVENTORY';
}catch(error){result.status='HOLD_READONLY_CURRENT_ACCOUNT_INVENTORY';result.error=str(error?.message).slice(0,200);process.exitCode=1;}
finally{fs.writeFileSync(OUTPUT+'/result.json',JSON.stringify(result,null,2)+'\n');
  process.stdout.write(JSON.stringify(result,null,2)+'\n');}
