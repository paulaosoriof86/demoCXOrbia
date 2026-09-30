import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import vm from 'node:vm';

export const TENANT_ID='tya';
export const CANONICAL_PROJECT_ID='cinepolis';
export const EXPECTED_FIREBASE_PROJECT='cxorbia-backend-dev';

export const text=value=>String(value??'').trim();
export const norm=value=>text(value).toLowerCase();
export const list=value=>Array.isArray(value)?value.map(String).map(x=>x.trim()).filter(Boolean):(typeof value==='string'?value.split(',').map(x=>x.trim()).filter(Boolean):[]);
export const sha256=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
export const fingerprint=value=>sha256(value).slice(0,20);
export const asciiToken=value=>norm(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
export const internalEmail=(login,namespace='shopper',tenantId=TENANT_ID)=>sha256(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';

const ACTIVE_STATUSES=new Set(['active','activo','enabled','habilitado','approved','aprobado','complete','completo','completed','verified','verificado','perfil_completo','vigente']);
const INACTIVE_STATUSES=new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','rejected','rechazado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);
const ACTIVE_POSTULATION_STATUSES=new Set(['active','activo','pending','pendiente','applied','postulado','postulada','approved','aprobado','aprobada','selected','seleccionado','seleccionada','assigned','asignado','asignada']);
const LEGACY_KEYS=['legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey'];
const USERNAME_KEYS=['username','userName','usuario','login','loginIdentifier','normalizedLogin'];

function addIndex(map,key,value){
  const k=text(key);
  if(!k)return;
  if(!map.has(k))map.set(k,[]);
  map.get(k).push(value);
}
function uniqueValues(values){return [...new Set(values.filter(Boolean))];}
function exactClaims(claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID){
  const keys=Object.keys(claims||{}).sort();
  const expectedKeys=['authNamespace','projectIds','role','shopperId','tenantId'];
  return JSON.stringify(keys)===JSON.stringify(expectedKeys)&&
    claims.tenantId===tenantId&&claims.role==='shopper'&&claims.authNamespace==='shopper'&&claims.shopperId===shopperId&&
    Array.isArray(claims.projectIds)&&claims.projectIds.length===1&&claims.projectIds[0]===projectId;
}
function canonicalClaims(shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID){
  return {tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId};
}
function statusTokens(profile){
  return uniqueValues(['status','estado','profileStatus','accountStatus','approvalStatus'].map(key=>norm(profile?.[key])));
}
function firstNameOf(...sources){
  for(const source of sources){
    const direct=text(source?.firstName||source?.primerNombre||source?.nombre1);
    if(direct)return direct.split(/\s+/)[0];
    const full=text(source?.nombre||source?.name||source?.displayName||source?.legacyName||source?.personName);
    if(full)return full.split(/\s+/)[0];
  }
  return '';
}
function explicitSurnameOf(...sources){
  for(const source of sources){
    const direct=text(source?.lastName||source?.apellido||source?.apellidos||source?.surname||source?.familyName);
    if(direct)return direct.split(/\s+/)[0];
  }
  return '';
}
function fullNameTokens(...sources){
  const out=[];
  for(const source of sources){
    const full=text(source?.nombre||source?.name||source?.displayName||source?.legacyName||source?.personName);
    for(const token of full.split(/\s+/).filter(Boolean))out.push(asciiToken(token));
  }
  return uniqueValues(out);
}
function loginFromRecord(record){return norm(record?.normalizedLogin||record?.loginIdentifier);}
function nameParts(profile,records=[]){
  const firstRaw=firstNameOf(profile,...records);
  let surnameRaw=explicitSurnameOf(profile,...records);
  let surnameBasis=surnameRaw?'explicit_surname':'';
  const tokens=fullNameTokens(profile,...records);
  if(!surnameRaw){
    const corroborated=[];
    for(const source of [profile,...records]){
      for(const key of USERNAME_KEYS){
        const login=norm(source?.[key]);
        const parts=login.split('.').filter(Boolean);
        if(parts.length===2&&asciiToken(parts[0])===asciiToken(firstRaw)&&tokens.includes(asciiToken(parts[1])))corroborated.push(parts[1]);
      }
    }
    const unique=uniqueValues(corroborated.map(asciiToken));
    if(unique.length===1){surnameRaw=unique[0];surnameBasis='credential_corroborated_surname';}
  }
  const firstLogin=asciiToken(firstRaw);
  const surnameLogin=asciiToken(surnameRaw);
  const canonicalLogin=firstLogin&&surnameLogin?`${firstLogin}.${surnameLogin}`:'';
  const firstPasswordToken=text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu,'');
  const canonicalPassword=firstPasswordToken?firstPasswordToken.charAt(0).toUpperCase()+firstPasswordToken.slice(1).toLowerCase()+'123*':'';
  return {firstRaw,surnameRaw,surnameBasis,canonicalLogin,canonicalPassword,complete:Boolean(canonicalLogin&&canonicalPassword)};
}
function periodKeyOf(data,pathValue=''){
  for(const raw of [data?.periodKey,data?.periodId,data?.period,data?.projectPeriod]){
    const match=text(raw).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
    if(match)return `${match[1]}-${match[2]}`;
  }
  const pathMatch=text(pathValue).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
  return pathMatch?`${pathMatch[1]}-${pathMatch[2]}`:'';
}
function shiftMonth(periodKey,delta){
  const match=text(periodKey).match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  if(!match)return '';
  const d=new Date(Date.UTC(Number(match[1]),Number(match[2])-1+delta,1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
}
function tenantDoc(doc,data,tenantId){return text(data?.tenantId)===tenantId||text(doc?.ref?.path).startsWith(`tenants/${tenantId}/`);}
function paulaMarker(...sources){
  const value=sources.map(source=>[
    source?.normalizedLogin,source?.loginIdentifier,source?.firstName,source?.lastName,source?.nombre,source?.name,source?.displayName,source?.legacyName,source?.personName
  ].map(text).join(' ')).join(' ').toLowerCase();
  return value.includes('paula')&&(value.includes('osorio')||value.includes('paula.'));
}

export function decryptCredentialBundle({serviceAccount,envelopePath='backend/private-inbox/corte6-credential-bundle.enc.json',publicPath='backend/secure/corte6-credential-handoff-public.json',privatePath='backend/secure/corte6-credential-handoff-private.enc.json'}){
  for(const file of [envelopePath,publicPath,privatePath])if(!fs.existsSync(file))throw new Error(`CREDENTIAL_FILE_MISSING:${file}`);
  const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
  const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
  const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)throw new Error('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(serviceAccount.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const privateDecipher=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  privateDecipher.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([privateDecipher.update(Buffer.from(encPriv.ciphertextBase64,'base64')),privateDecipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');
  if(encrypted.length<17)throw new Error('CIPHERTEXT_TOO_SHORT');
  const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
  decipher.setAAD(Buffer.from(env.aad,'utf8'));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  const plain=Buffer.concat([decipher.update(encrypted.subarray(0,encrypted.length-16)),decipher.final()]);
  const bundle=JSON.parse((env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain).toString('utf8'));
  if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion))throw new Error('CREDENTIAL_BUNDLE_CONTRACT_MISMATCH');
  return bundle;
}

export async function fetchFirebaseWebConfig(remoteRoot,expectedProject=EXPECTED_FIREBASE_PROJECT){
  const root=text(remoteRoot).replace(/\/$/,'');
  const response=await fetch(root+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();
  let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});
  if(!config?.apiKey||config.projectId!==expectedProject)throw new Error('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}

export async function passwordSignInEmail(apiKey,email,password){
  if(!apiKey||!email||!password)return false;
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const payload=await response.json();
  return Boolean(payload?.idToken);
}

async function listAllAuthUsers(auth){
  const users=[];let pageToken;
  do{const page=await auth.listUsers(1000,pageToken);users.push(...page.users);pageToken=page.pageToken;}while(pageToken);
  return users;
}

export async function buildCanonicalShopperPlan({auth,db,bundle,webConfig,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID}){
  const [authUsers,shopperSnap,membershipSnap,periodSnap,visitSnap,certSnap,postSnap,applicationSnap,liquidationSnap]=await Promise.all([
    listAllAuthUsers(auth),
    db.collection('tenants').doc(tenantId).collection('shoppers').get(),
    db.collection('tenants').doc(tenantId).collection('users').get(),
    db.collection('tenants').doc(tenantId).collection('periods').get(),
    db.collectionGroup('visits').get(),
    db.collectionGroup('certifications').get(),
    db.collectionGroup('postulations').get(),
    db.collectionGroup('applications').get(),
    db.collectionGroup('liquidations').get()
  ]);

  const profiles=new Map(shopperSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
  const memberships=new Map(membershipSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
  const authByEmail=new Map();
  const authByShopperId=new Map();
  for(const user of authUsers){
    if(user.email)addIndex(authByEmail,norm(user.email),user);
    const claims=user.customClaims||{};
    if(norm(claims.role)==='shopper'&&text(claims.shopperId))addIndex(authByShopperId,text(claims.shopperId),user);
  }

  const legacyIndex=new Map(),usernameIndex=new Map();
  for(const profile of profiles.values()){
    addIndex(legacyIndex,profile.id,profile.id);
    for(const key of LEGACY_KEYS)addIndex(legacyIndex,text(profile[key]),profile.id);
    for(const key of USERNAME_KEYS)addIndex(usernameIndex,norm(profile[key]),profile.id);
  }

  const periods=[];
  for(const doc of periodSnap.docs){
    const data=doc.data()||{};
    const key=periodKeyOf({...data,periodKey:data.periodKey||doc.id},doc.ref.path);
    if(key)periods.push(key);
  }
  const latestPeriod=periods.sort().at(-1)||'';
  const recentFloor=latestPeriod?shiftMonth(latestPeriod,-2):'';

  const activity=new Map();
  const getActivity=id=>{
    if(!activity.has(id))activity.set(id,{visits:0,recentVisits:0,certifications:0,postulations:0,activePostulations:0,liquidations:0});
    return activity.get(id);
  };
  for(const doc of visitSnap.docs){const data=doc.data()||{};if(!tenantDoc(doc,data,tenantId))continue;const id=text(data.shopperId);if(!id)continue;const a=getActivity(id);a.visits++;const period=periodKeyOf(data,doc.ref.path);if(period&&recentFloor&&period>=recentFloor)a.recentVisits++;}
  for(const doc of certSnap.docs){const data=doc.data()||{};if(!tenantDoc(doc,data,tenantId))continue;const id=text(data.shopperId);if(id)getActivity(id).certifications++;}
  for(const snap of [postSnap,applicationSnap])for(const doc of snap.docs){const data=doc.data()||{};if(!tenantDoc(doc,data,tenantId))continue;const id=text(data.shopperId);if(!id)continue;const a=getActivity(id);a.postulations++;if(ACTIVE_POSTULATION_STATUSES.has(norm(data.status||data.estado)))a.activePostulations++;}
  for(const doc of liquidationSnap.docs){const data=doc.data()||{};if(!tenantDoc(doc,data,tenantId))continue;const id=text(data.shopperId);if(id)getActivity(id).liquidations++;}

  const records=Array.isArray(bundle.records)?bundle.records:[];
  const shopperRecords=records.filter(record=>record?.kind==='shopper');
  const recordRows=[];
  const credentialByProfile=new Map();
  const mappingCollisions=[];
  const unmappedCredentials=[];
  for(const record of shopperRecords){
    const login=loginFromRecord(record);
    const candidates=[];
    const oldEmail=login?internalEmail(login,'shopper',tenantId):'';
    for(const user of authByEmail.get(norm(oldEmail))||[]){const shopperId=text(user.customClaims?.shopperId);if(shopperId&&profiles.has(shopperId))candidates.push(shopperId);}
    const legacyId=text(record.legacyId||record.legacyShopperId||record.externalShopperId);
    for(const id of legacyIndex.get(legacyId)||[])candidates.push(id);
    for(const id of usernameIndex.get(login)||[])candidates.push(id);
    const unique=uniqueValues(candidates);
    const fp=fingerprint(`credential\0${login}\0${legacyId}`);
    if(unique.length!==1){
      if(unique.length>1)mappingCollisions.push(fp);else unmappedCredentials.push(fp);
      recordRows.push({record,login,legacyId,profileId:null,mappingStatus:unique.length>1?'collision':'unmapped',fp});
      continue;
    }
    const profileId=unique[0];
    if(!credentialByProfile.has(profileId))credentialByProfile.set(profileId,[]);
    credentialByProfile.get(profileId).push(record);
    recordRows.push({record,login,legacyId,profileId,mappingStatus:'mapped',fp});
  }

  const profileRows=[];
  const preLoginMap=new Map();
  const profileTechnicalCollisions=[];
  const authIdentityCollisions=[];
  for(const profile of profiles.values()){
    const profileRecords=credentialByProfile.get(profile.id)||[];
    if(profileRecords.length>1)profileTechnicalCollisions.push(fingerprint(`profile_credentials\0${profile.id}`));
    const name=nameParts(profile,profileRecords);
    const statuses=statusTokens(profile);
    const explicitInactive=statuses.some(x=>INACTIVE_STATUSES.has(x));
    const explicitActive=statuses.some(x=>ACTIVE_STATUSES.has(x));
    const a=activity.get(profile.id)||{visits:0,recentVisits:0,certifications:0,postulations:0,activePostulations:0,liquidations:0};

    const authCandidates=[];
    for(const user of authByShopperId.get(profile.id)||[])authCandidates.push(user);
    for(const record of profileRecords){for(const user of authByEmail.get(norm(internalEmail(loginFromRecord(record),'shopper',tenantId)))||[])authCandidates.push(user);}
    if(name.canonicalLogin){for(const user of authByEmail.get(norm(internalEmail(name.canonicalLogin,'shopper',tenantId)))||[])authCandidates.push(user);}
    const uniqueUsers=[];const seenUid=new Set();
    for(const user of authCandidates){if(!seenUid.has(user.uid)){seenUid.add(user.uid);uniqueUsers.push(user);}}
    if(uniqueUsers.length>1)authIdentityCollisions.push(fingerprint(`auth_candidates\0${profile.id}\0${uniqueUsers.map(x=>x.uid).sort().join(',')}`));
    const user=uniqueUsers.length===1?uniqueUsers[0]:null;

    const operationalActive=profileRecords.length>0||Boolean(user)||a.recentVisits>0||a.activePostulations>0;
    const statusActivityConflict=explicitInactive&&operationalActive;
    const active=!explicitInactive&&(explicitActive||operationalActive)||statusActivityConflict;
    const historicalSignal=a.visits>0||a.certifications>0||a.liquidations>0||a.postulations>0||LEGACY_KEYS.some(key=>text(profile[key]));
    let classification='HISTORICAL_PRESERVED_NO_CURRENT_SIGNAL';
    if(explicitInactive&&!statusActivityConflict)classification='INACTIVE';
    else if(active)classification='ACTIVE_PENDING_ELIGIBILITY';
    else if(historicalSignal)classification='HISTORICAL';

    const holdReasons=[];
    if(statusActivityConflict)holdReasons.push('status_activity_conflict');
    if(profileRecords.length>1)holdReasons.push('multiple_credential_records');
    if(uniqueUsers.length>1)holdReasons.push('multiple_auth_users');
    if(active&&!name.complete)holdReasons.push('canonical_name_incomplete');
    if(active&&name.canonicalLogin)addIndex(preLoginMap,name.canonicalLogin,profile.id);

    profileRows.push({profile,name,statuses,activity:a,explicitInactive,explicitActive,active,classification,holdReasons,credentialRecords:profileRecords,user});
  }

  const loginCollisions=[];
  for(const [login,ids] of preLoginMap){if(ids.length>1){loginCollisions.push(fingerprint(`login\0${login}\0${ids.slice().sort().join(',')}`));for(const row of profileRows.filter(x=>ids.includes(x.profile.id)))row.holdReasons.push('canonical_login_collision');}}

  const targetEmailCollisions=[];
  for(const row of profileRows){
    if(!row.active||!row.name.canonicalLogin)continue;
    const target=internalEmail(row.name.canonicalLogin,'shopper',tenantId);
    const users=authByEmail.get(norm(target))||[];
    for(const user of users){const claimed=text(user.customClaims?.shopperId);if(claimed&&claimed!==row.profile.id){row.holdReasons.push('target_email_owned_by_other_shopper');targetEmailCollisions.push(fingerprint(`email\0${target}\0${row.profile.id}\0${claimed}`));}}
  }

  let legacyMissingAuth=0,legacyLoginExceptions=0,legacyPasswordExceptions=0,legacyMapped=0;
  for(const rr of recordRows){
    if(!rr.profileId)continue;
    legacyMapped++;
    const row=profileRows.find(x=>x.profile.id===rr.profileId);
    if(!row)continue;
    if(!row.user)legacyMissingAuth++;
    if(rr.login!==row.name.canonicalLogin)legacyLoginExceptions++;
    const hash=norm(rr.record.passwordHashHex);
    if(!row.name.canonicalPassword||!/^[a-f0-9]{64}$/.test(hash)||sha256(row.name.canonicalPassword)!==hash)legacyPasswordExceptions++;
  }

  for(const row of profileRows){
    if(!row.active)continue;
    const uniqueHolds=uniqueValues(row.holdReasons);
    row.holdReasons=uniqueHolds;
    if(uniqueHolds.length){row.classification='ACTIVE_HOLD';continue;}
    row.classification='ACTIVE_ELIGIBLE';
    const targetEmail=internalEmail(row.name.canonicalLogin,'shopper',tenantId);
    const passwordCompatible=row.user?await passwordSignInEmail(webConfig.apiKey,row.user.email,row.name.canonicalPassword):false;
    const emailCanonical=Boolean(row.user)&&norm(row.user.email)===norm(targetEmail);
    const claimsCanonical=Boolean(row.user)&&exactClaims(row.user.customClaims||{},row.profile.id,tenantId,projectId);
    row.action={
      createAuth:!row.user,
      updateEmail:Boolean(row.user)&&!emailCanonical,
      updatePassword:Boolean(row.user)&&!passwordCompatible,
      updateClaims:Boolean(row.user)&&!claimsCanonical,
      noOp:Boolean(row.user)&&emailCanonical&&passwordCompatible&&claimsCanonical,
      targetEmail,
      canonicalClaims:canonicalClaims(row.profile.id,tenantId,projectId),
      passwordCompatible
    };
  }

  const classificationCounts={};
  for(const row of profileRows)classificationCounts[row.classification]=(classificationCounts[row.classification]||0)+1;
  const eligible=profileRows.filter(row=>row.classification==='ACTIVE_ELIGIBLE');
  const holds=profileRows.filter(row=>row.classification==='ACTIVE_HOLD');
  const actionCounts={createAuth:0,updateEmail:0,updatePassword:0,updateClaims:0,noOp:0};
  for(const row of eligible)for(const key of Object.keys(actionCounts))if(row.action?.[key])actionCounts[key]++;

  const staffRecords=records.filter(record=>record?.kind==='user'&&paulaMarker(record));
  const paulaShopperRows=profileRows.filter(row=>paulaMarker(row.profile,...row.credentialRecords));
  const staffTechnical=staffRecords.map(record=>({namespace:'staff',fp:fingerprint(`staff\0${loginFromRecord(record)}`),authPresent:(authByEmail.get(norm(internalEmail(loginFromRecord(record),'staff',tenantId)))||[]).length===1}));
  const shopperTechnical=paulaShopperRows.map(row=>({namespace:'shopper',fp:fingerprint(`shopper\0${row.profile.id}`),authPresent:Boolean(row.user),eligible:row.classification==='ACTIVE_ELIGIBLE'}));
  const paulaIdentity={
    staffCandidates:staffTechnical.length,
    shopperCandidates:shopperTechnical.length,
    staffTechnical,
    shopperTechnical,
    separated:staffTechnical.length===1&&shopperTechnical.length===1&&staffTechnical[0].fp!==shopperTechnical[0].fp
  };

  const collisions={
    credentialMapping:mappingCollisions,
    profileTechnical:profileTechnicalCollisions,
    authIdentity:authIdentityCollisions,
    canonicalLogin:loginCollisions,
    targetEmail:targetEmailCollisions
  };
  const collisionCount=Object.values(collisions).reduce((sum,rows)=>sum+rows.length,0);
  const classificationTotal=Object.values(classificationCounts).reduce((sum,n)=>sum+n,0);
  const repairRows=eligible.map(row=>({
    shopperId:row.profile.id,
    canonicalLogin:row.name.canonicalLogin,
    canonicalPassword:row.name.canonicalPassword,
    targetEmail:row.action.targetEmail,
    canonicalClaims:row.action.canonicalClaims,
    existingUid:row.user?.uid||null,
    createAuth:row.action.createAuth,
    updateEmail:row.action.updateEmail,
    updatePassword:row.action.updatePassword,
    updateClaims:row.action.updateClaims,
    noOp:row.action.noOp,
    fp:fingerprint(`repair\0${row.profile.id}\0${row.name.canonicalLogin}`)
  })).sort((a,b)=>a.shopperId.localeCompare(b.shopperId));
  const planDigest=sha256(JSON.stringify(repairRows.map(row=>({fp:row.fp,createAuth:row.createAuth,updateEmail:row.updateEmail,updatePassword:row.updatePassword,updateClaims:row.updateClaims,noOp:row.noOp}))));

  return {
    generatedAt:new Date().toISOString(),tenantId,projectId,latestPeriod,recentFloor,
    source:{firestoreProfiles:profiles.size,firestoreMemberships:memberships.size,authUsersTotal:authUsers.length,credentialShopperRecords:shopperRecords.length,legacyMapped,unmappedCredentials:unmappedCredentials.length},
    baseline:{missingAuth:legacyMissingAuth,loginExceptions:legacyLoginExceptions,passwordExceptions:legacyPasswordExceptions},
    classification:{counts:classificationCounts,total:classificationTotal,complete:classificationTotal===profiles.size},
    actions:actionCounts,
    collisions,collisionCount,holds:holds.map(row=>({fp:fingerprint(`hold\0${row.profile.id}`),reasons:row.holdReasons.slice().sort()})),
    paulaIdentity,planDigest,repairRows,
    safety:{providerReads:true,providerWrites:false,firestoreWrites:0,authWrites:0,passwordChanges:0,membershipWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,deploys:0,merge:false,production:false,credentialsExposed:false,rawNamesExported:false,rawLoginsExported:false,rawPasswordsExported:false}
  };
}

export function sanitizeCanonicalPlan(plan){
  return {
    generatedAt:plan.generatedAt,tenantId:plan.tenantId,projectId:plan.projectId,latestPeriod:plan.latestPeriod,recentFloor:plan.recentFloor,
    source:plan.source,baseline:plan.baseline,classification:plan.classification,actions:plan.actions,
    collisionCount:plan.collisionCount,collisionCounts:Object.fromEntries(Object.entries(plan.collisions).map(([key,value])=>[key,value.length])),
    collisionFingerprints:plan.collisions,
    holdCount:plan.holds.length,holdReasonCounts:plan.holds.flatMap(x=>x.reasons).reduce((acc,key)=>(acc[key]=(acc[key]||0)+1,acc),{}),holdFingerprints:plan.holds.map(x=>x.fp),
    paulaIdentity:plan.paulaIdentity,planDigest:plan.planDigest,eligibleFingerprints:plan.repairRows.map(x=>x.fp),
    safety:plan.safety
  };
}
