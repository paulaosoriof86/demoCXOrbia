import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const exportPath=process.env.CXORBIA_LEGACY_EXPORT_PATH;
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out=process.env.CXORBIA_PROFILE_EXTRA_OUT||'app/docs/evidence/CORTE6-PROFILE-EXTRA-EXPORT-READONLY-LATEST.json';

function fail(message){throw new Error(message);}
function has(value){return value!==undefined&&value!==null&&String(value).trim()!=='';}
function text(value){return has(value)?String(value).trim():'';}
function safeObj(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function normalizeSimple(value){return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();}
function normalizeCountry(value){
  const v=normalizeSimple(value);
  if(['gt','guatemala'].includes(v))return'GT';
  if(['hn','honduras'].includes(v))return'HN';
  return v.toUpperCase();
}
function normalizePhone(value){return text(value).replace(/[^0-9]/g,'');}
function normalizeEmail(value){return text(value).toLowerCase();}
function normalizeUsername(value){return text(value).toLowerCase();}
function normalizeArray(value){
  if(!Array.isArray(value))return text(value);
  return JSON.stringify(value.map(v=>normalizeSimple(typeof v==='object'?JSON.stringify(v):v)).sort());
}
function normalizeBooleanish(value){
  if(value===true)return'true';
  if(value===false)return'false';
  const v=normalizeSimple(value);
  if(['1','si','sí','true','activo','active','aprobado','approved'].includes(v))return'true';
  if(['0','no','false','inactivo','inactive','rechazado','rejected'].includes(v))return'false';
  return v;
}
function normalizeNumber(value){const n=Number(value);return Number.isFinite(n)?String(n):text(value);}

function profileContainers(raw){
  const found=[];
  if(raw&&raw.tya_shoppers_extra!==undefined)found.push({label:'root.tya_shoppers_extra',value:raw.tya_shoppers_extra,priority:100});
  const known=['staging_v586_persist1','staging_v586_persist','snapshot','data'];
  for(const key of known){
    if(raw&&raw[key]&&raw[key].tya_shoppers_extra!==undefined)found.push({label:key+'.tya_shoppers_extra',value:raw[key].tya_shoppers_extra,priority:50});
  }
  return found.sort((a,b)=>b.priority-a.priority);
}
function rowsFromContainer(container){
  const value=container&&container.value;
  if(Array.isArray(value))return value.map((record,index)=>({sourceKey:String(index),record}));
  if(value&&typeof value==='object')return Object.entries(value).map(([sourceKey,record])=>({sourceKey,record}));
  return [];
}
function readExport(path){
  const raw=JSON.parse(fs.readFileSync(path,'utf8'));
  const containers=profileContainers(raw);
  if(!containers.length)return{container:null,rows:[],alternateContainers:0};
  const selected=containers[0];
  return{container:selected.label,rows:rowsFromContainer(selected),alternateContainers:Math.max(0,containers.length-1)};
}

if(!exportPath||!fs.existsSync(exportPath))fail('legacy_export_missing');
if(!credentialPath||!fs.existsSync(credentialPath))fail('credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject)fail('wrong_project');
const sourceInfo=readExport(exportPath);
if(!sourceInfo.rows.length)fail('tya_shoppers_extra_missing_or_empty');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').select(
  'legacyShopperId',
  'username','user','login',
  'phone','whatsapp','wa','telefono',
  'email','correo',
  'country','pais',
  'city','ciudad',
  'department','departamento','depto',
  'dpi','documentId','documento','idNumber',
  'address','direccion',
  'birthDate','fechaNacimiento','fecha_nac',
  'certs','certifications',
  'visitas',
  'activo','estado','status',
  'acceptedTerms','accepted_terms',
  'accountApproval','aprobacionCuenta',
  'registrationOrigin','registroOrigen',
  'rating'
).get();

const byLegacy=new Map();
for(const d of snap.docs){
  const value=d.data()||{};
  const legacy=text(value.legacyShopperId);
  if(!legacy)continue;
  if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);
  byLegacy.get(legacy).push({id:d.id,data:value});
}

const pick=(obj,keys)=>{for(const key of keys)if(has(obj&&obj[key]))return obj[key];return'';};
const pickUsername=obj=>{
  const direct=pick(obj,['username','login']);
  if(has(direct))return direct;
  const user=pick(obj,['user']);
  return has(user)&&!String(user).includes('@')?user:'';
};
const pickEmail=obj=>{
  const direct=pick(obj,['email','correo']);
  if(has(direct))return direct;
  const user=pick(obj,['user']);
  return has(user)&&String(user).includes('@')?user:'';
};

const groups={
  operationalFillMissing:{
    username:{source:pickUsername,current:o=>pick(o,['username','user','login']),normalize:normalizeUsername},
    phone:{source:o=>pick(o,['wa','whatsapp','phone','telefono']),current:o=>pick(o,['phone','whatsapp','wa','telefono']),normalize:normalizePhone},
    email:{source:pickEmail,current:o=>pick(o,['email','correo']),normalize:normalizeEmail},
    country:{source:o=>pick(o,['pais','country']),current:o=>pick(o,['country','pais']),normalize:normalizeCountry},
    city:{source:o=>pick(o,['ciudad','city']),current:o=>pick(o,['city','ciudad']),normalize:normalizeSimple},
    department:{source:o=>pick(o,['departamento','depto','department']),current:o=>pick(o,['department','departamento','depto']),normalize:normalizeSimple}
  },
  sensitiveProtectedHold:{
    document:{source:o=>pick(o,['dpi','documentId','documento','idNumber']),current:o=>pick(o,['dpi','documentId','documento','idNumber']),normalize:normalizeSimple},
    address:{source:o=>pick(o,['direccion','address']),current:o=>pick(o,['address','direccion']),normalize:normalizeSimple},
    birthDate:{source:o=>pick(o,['fecha_nac','fechaNacimiento','birthDate']),current:o=>pick(o,['birthDate','fechaNacimiento','fecha_nac']),normalize:text}
  },
  evidenceOnly:{
    certifications:{source:o=>pick(o,['certs','certifications']),current:o=>pick(o,['certs','certifications']),normalize:normalizeArray},
    certificationHistory:{source:o=>pick(o,['histCerts','certificationHistory']),current:()=>'',normalize:normalizeArray},
    visits:{source:o=>pick(o,['visitas']),current:o=>pick(o,['visitas']),normalize:normalizeNumber},
    active:{source:o=>pick(o,['activo']),current:o=>pick(o,['activo','estado','status']),normalize:normalizeBooleanish},
    acceptedTerms:{source:o=>pick(o,['accepted_terms','acceptedTerms']),current:o=>pick(o,['acceptedTerms','accepted_terms']),normalize:text},
    accountApproval:{source:o=>pick(o,['aprobacionCuenta','accountApproval']),current:o=>pick(o,['accountApproval','aprobacionCuenta']),normalize:normalizeSimple},
    registrationOrigin:{source:o=>pick(o,['registroOrigen','registrationOrigin']),current:o=>pick(o,['registrationOrigin','registroOrigen']),normalize:normalizeSimple},
    rating:{source:o=>pick(o,['rating']),current:o=>pick(o,['rating']),normalize:normalizeNumber}
  }
};

function emptyFieldCounts(group){return Object.fromEntries(Object.keys(group).map(key=>[key,0]));}
const metrics={};
for(const [groupName,group] of Object.entries(groups)){
  metrics[groupName]={
    sourcePresence:emptyFieldCounts(group),
    currentPresence:emptyFieldCounts(group),
    plannedFillMissing:emptyFieldCounts(group),
    alreadySame:emptyFieldCounts(group),
    conflicts:emptyFieldCounts(group)
  };
}

let exact=0,missingCanonical=0,ambiguousCanonical=0,sourceWithoutStableId=0,duplicateSourceIds=0,sourceKeyIdMismatch=0,metadataRecordsExcluded=0;
const seenStableIds=new Set();

for(const item of sourceInfo.rows){
  const record=safeObj(item.record);
  const sourceKey=text(item.sourceKey);
  const recordId=text(record.id||record.shopperId||record.legacyShopperId);
  if(sourceKey==='_eliminados'||recordId==='_eliminados'){
    metadataRecordsExcluded++;
    continue;
  }
  const keyLooksStable=sourceKey&&!/^\d+$/.test(sourceKey)&&sourceKey!=='_eliminados';
  const stableId=recordId||(keyLooksStable?sourceKey:'');
  if(!stableId){sourceWithoutStableId++;continue;}
  if(recordId&&keyLooksStable&&recordId!==sourceKey)sourceKeyIdMismatch++;
  if(seenStableIds.has(stableId)){duplicateSourceIds++;continue;}
  seenStableIds.add(stableId);

  for(const [groupName,group] of Object.entries(groups)){
    for(const [fieldName,contract] of Object.entries(group)){
      if(has(contract.source(record)))metrics[groupName].sourcePresence[fieldName]++;
    }
  }

  const matches=byLegacy.get(stableId)||[];
  if(matches.length===0){missingCanonical++;continue;}
  if(matches.length!==1){ambiguousCanonical++;continue;}
  exact++;
  const current=matches[0].data;

  for(const [groupName,group] of Object.entries(groups)){
    for(const [fieldName,contract] of Object.entries(group)){
      const src=contract.source(record);
      const dst=contract.current(current);
      if(has(dst))metrics[groupName].currentPresence[fieldName]++;
      if(!has(src))continue;
      if(!has(dst)){
        metrics[groupName].plannedFillMissing[fieldName]++;
        continue;
      }
      if(contract.normalize(src)===contract.normalize(dst))metrics[groupName].alreadySame[fieldName]++;
      else metrics[groupName].conflicts[fieldName]++;
    }
  }
}

const sum=obj=>Object.values(obj||{}).reduce((total,value)=>total+Number(value||0),0);
const operationalPlanned=sum(metrics.operationalFillMissing.plannedFillMissing);
const operationalConflicts=sum(metrics.operationalFillMissing.conflicts);
const sensitiveSource=sum(metrics.sensitiveProtectedHold.sourcePresence);
const sensitivePlannedIfAllowed=sum(metrics.sensitiveProtectedHold.plannedFillMissing);
const evidenceOnlySource=sum(metrics.evidenceOnly.sourcePresence);

let decision='HOLD_NO_EXACT_PROFILE_EXTRA_MATCH';
if(exact>0){
  decision=(duplicateSourceIds||ambiguousCanonical||sourceKeyIdMismatch)
    ?'HOLD_PROFILE_EXTRA_IDENTITY_CONFLICT_REVIEW'
    :'READY_PROFILE_EXTRA_OPERATIONAL_FILL_MISSING_WITH_SEPARATE_SENSITIVE_HOLDS';
}

const result={
  schemaVersion:'cxorbia.corte6.profile-extra-export-readonly.v2',
  generatedAt:new Date().toISOString(),
  target:{projectId:expectedProject,tenantId},
  source:{
    selectedContainer:sourceInfo.container,
    alternateContainersDetected:sourceInfo.alternateContainers,
    rawRows:sourceInfo.rows.length,
    uniqueStableIds:seenStableIds.size,
    sourceWithoutStableId,
    duplicateSourceIds,
    sourceKeyIdMismatch,
    metadataRecordsExcluded
  },
  matching:{
    stableKey:'record.id OR nonnumeric object key -> Firestore legacyShopperId exact',
    nameMatchAllowed:false,
    phoneMatchAllowed:false,
    emailMatchAllowed:false,
    exact,
    missingCanonical,
    ambiguousCanonical
  },
  fieldGroups:metrics,
  totals:{
    operationalPlannedFillMissing:operationalPlanned,
    operationalConflictsHeld:operationalConflicts,
    sensitiveSourceFieldsPresent:sensitiveSource,
    sensitiveFillMissingHeldPendingProtectedStoragePolicy:sensitivePlannedIfAllowed,
    evidenceOnlySourceFieldsPresent:evidenceOnlySource
  },
  decision,
  policy:{
    operationalFields:['username','phone','email','country','city','department'],
    fillMissingOnly:true,
    overwriteExisting:false,
    sensitiveFieldsHeld:['document','address','birthDate'],
    sensitiveReason:'current shoppers documents are readable by operator roles; do not add high-sensitivity identity fields until protected storage/RBAC is explicitly approved',
    evidenceOnlyFields:['certifications','certificationHistory','visits','active','acceptedTerms','accountApproval','registrationOrigin','rating'],
    certificationRule:'canonical certification records remain authoritative; legacy histCerts/certs are reconciliation evidence only and must not duplicate the 77 canonical certifications',
    historyRule:'canonical 616 visits remain authoritative; legacy visitas count is evidence only and never overwrites history',
    passwordExcluded:true,
    legacyUidExcluded:true,
    bankFields:'not inferred; only migrate later from an explicit verified source under protected policy'
  },
  safety:{
    providerReads:true,
    providerWrites:0,
    firestoreWrites:0,
    authWrites:0,
    passwordChanges:0,
    legacyWrites:0,
    hrWrites:0,
    hostingDeploys:0,
    rulesDeploys:0,
    production:false,
    merge:false,
    piiExported:false,
    sourceValuesExported:false,
    passwordValuesExported:false,
    legacyUidValuesExported:false,
    secretsExported:false
  }
};

fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({
  decision:result.decision,
  source:result.source,
  matching:result.matching,
  totals:result.totals,
  safety:result.safety
}));
