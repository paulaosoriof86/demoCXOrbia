#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { maybeHandleDevVisualRequest } from './dev-visual.mjs';
import { isLiveUserAdminPath, maybeHandleLiveUserAdminRequest } from './user-admin.mjs';
import { isLegalRuntimePath, maybeHandleLegalRuntimeRequest } from './legal-runtime.mjs';
import { isCxorbiaCommandRuntimePath, maybeHandleCxorbiaCommandRuntimeRequest, createHrSnapshotReconciler } from './cxorbia-command-runtime-v1.mjs';
import { isCertificationRuntimePath, maybeHandleCertificationRuntimeRequest } from './certification-runtime.mjs';
import { isMailboxRuntimePath, maybeHandleMailboxRequest } from './mailbox-runtime.mjs';
import { academyProgressSnapshot, academyProgressCatalog } from '../cxorbia-academy-command-provider-v1.mjs';
import { resolveCountryHrPeriodBinding } from '../cxorbia-country-hr-binding-v1.mjs';
import { readExcelPeriodThroughMake, readExcelWorksheetInventoryThroughMake, withMakeGraphToolboxReader, withMakeGraphToolboxWriter, executeExcelFieldEventThroughMake, resolveExcelFieldWriteTarget } from '../cxorbia-make-graph-provider-v1.mjs';
import {HR_WRITABLE_VISIT_FIELDS} from '../cxorbia-operational-command-provider-v1.mjs';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot,authorizedHrReviewObservation} from '../cxorbia-excel-operational-snapshot-v1.mjs';
import {createDurableHrReadModel,createConfirmedHrHistory,hrReadModelKey,readSharedHrProjection,invalidateSharedHrSync} from './hr-read-model.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../..');
const PORT=Number(process.env.PORT||8080);
const CACHE_MS=Math.max(5000,Math.min(15000,Number(process.env.CXORBIA_LIVE_HR_CACHE_MS||5000)));
const BOOTSTRAP_FILE=path.join(ROOT,'app/data/tya-hr-source-safe-periods.js');
const REGISTRY_FILE=path.join(ROOT,'backend/config/tya-live-hr-tab-registry.source-safe.json');
const FIREBASE_PROJECT=String(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||'').trim();
const F3_HR_FIELDS_ENABLED=process.env.CXORBIA_F3_HR_FIELDS_ENABLED==='true';
const DEV_OPERATIONAL_NAMES=process.env.CXORBIA_DEV_OPERATIONAL_NAMES==='true';
const DEV_OPERATIONAL_TOKEN='YES_PAULA_20260731_NAMES_DEV';
const LEGACY_ENDPOINT_PATHS=new Map([
  ['/v1/tenants/tya/projects/cinepolis/hr-live',{tenantId:'tya',projectId:'cinepolis'}],
  ['/api/tya/cinepolis/hr-live',{tenantId:'tya',projectId:'cinepolis'}]
]);
function hrRouteScope(pathname){
  const generic=String(pathname||'').match(/^\/(?:api|v1)\/tenants\/([^/]+)\/projects\/([^/]+)\/hr-live$/);
  if(generic)return {tenantId:decodeURIComponent(generic[1]),projectId:decodeURIComponent(generic[2]),legacy:false};
  const legacy=LEGACY_ENDPOINT_PATHS.get(String(pathname||''));
  return legacy?{...legacy,legacy:true}:null;
}
const ALLOWED_ORIGINS=new Set([
  'https://cxorbia-backend-dev.web.app',
  'https://cxorbia-backend-dev.firebaseapp.com',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);
const VOLATILE_REVISION_KEYS=new Set(['generatedAt','lastSnapshotAt','sourceSnapshotAt','tabRegistryObservedAt']);

let cache=null;
const scopedHrCache=new Map(),hrInventoryCache=new Map();
let confirmedHrHistory=null;
function historyStore(){return confirmedHrHistory||=createConfirmedHrHistory({db:ensureAdmin().db});}
function retainScopedSnapshot(current){const key=current.bindingProof?.bindingFingerprint;if(key){scopedHrCache.set(key,current);while(scopedHrCache.size>8)scopedHrCache.delete(scopedHrCache.keys().next().value);}return current;}
let inFlight=null;
let inFlightBinding=null;
let lastRefreshError=null;
let lastRefreshStartedAt=null;
let lastRefreshFinishedAt=null;
let lastRefreshDurationMs=null;
let lastRefreshStagesMs=null;
let lastRefreshProviderReads=null;
let lastShopperReconciliation=null;
let lastVisitReconciliation=null;
let durableHrStore=null,hrReaderOwnersFingerprint=null,lastReadModelPersistence=null,lastReadModelError=null;
const HR_READ_MODEL_MAX_AGE_MS=24*60*60*1000;
function durableHrReadContext(binding){
  if(!hrReaderOwnersFingerprint){
    const owners=['backend/runtime/hr-live-service/server.mjs','backend/runtime/hr-live-service/hr-read-model.mjs',
      'backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs','backend/runtime/cxorbia-country-hr-binding-v1.mjs','backend/runtime/cxorbia-make-graph-provider-v1.mjs',
      'tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','tools/hr-source/tya-canonical-visit-state-r20.mjs'];
    hrReaderOwnersFingerprint=crypto.createHash('sha256').update(JSON.stringify(
      owners.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,name))).digest('hex')]))).digest('hex');
  }
  // Only immutable source bytes are process-cached. Mapping belongs to this
  // resolved binding: another project/adapter must never inherit the first one.
  const mapping=loadExcelMappingLibrary(binding.mappingRef);
  const readerFingerprint=crypto.createHash('sha256').update(JSON.stringify({schema:'cxorbia.hr-read-model.v1',
    ownersFingerprint:hrReaderOwnersFingerprint,mappingRef:binding.mappingRef,mapping})).digest('hex');
  durableHrStore||=createDurableHrReadModel({db:ensureAdmin().db,maxAgeMs:HR_READ_MODEL_MAX_AGE_MS});
  return {store:durableHrStore,key:hrReadModelKey(binding,readerFingerprint)};
}
async function persistHrReadModel(scope,current){
  // Called only after protected authentication and source observation both pass.
  const binding=await resolveProjectHrReadBinding(scope,{discoveryContexts:current.discoveryContexts,allowInventory:false});
  if(binding.proof.bindingFingerprint!==current.bindingProof?.bindingFingerprint)
    throw Error('MAPPING_FAILURE:HR_BINDING_CHANGED_BEFORE_READ_MODEL_PUBLISH');
  try{const {store,key}=durableHrReadContext(binding);lastReadModelPersistence={...await store.publish(key,current),bindingFingerprint:binding.proof.bindingFingerprint};
    if(current.snapshot.readScope?.countryPeriods)lastReadModelPersistence.confirmedHistory=await historyStore().observe(current.snapshot,{sourceReadAt:current.loadedAt,sourceReadStartedAt:current.sourceReadStartedAt||current.loadedAt,revision:current.revision,evidence:{receiptPath:'runtime_authenticated_external_observation',bindingFingerprint:binding.proof.bindingFingerprint}});
    lastReadModelError=null;}
  catch{lastReadModelPersistence={published:false,reason:'read_model_persistence_unavailable',bindingFingerprint:binding.proof.bindingFingerprint};lastReadModelError='PERSISTENCE_FAILURE:HR_READ_MODEL_WRITE';}
  return lastReadModelPersistence;
}
async function recoverHrReadModel(binding,{durableOnly=false}={}){
  let current;
  const age=cache?Date.now()-cache.loadedAt:Infinity;
  const localKey=binding.proof.localBindingFingerprint||binding.proof.bindingFingerprint;
  if(!durableOnly&&cache?.bindingProof&&(cache.bindingProof.localBindingFingerprint||cache.bindingProof.bindingFingerprint)===localKey&&
      ['runtime_excel_online_original','durable_internal_snapshot'].includes(cache.origin)&&age>=0&&age<=HR_READ_MODEL_MAX_AGE_MS)
    current={...cache,externalReadCurrent:false};
  else{
    const {store,key}=durableHrReadContext(binding),saved=await store.read(key);
    if(!saved)return null;
    // materialize is the sole revision owner; rehydration must reproduce it.
    const reconstructed=materialize(saved.snapshot,saved.origin,saved.identity,saved.privateReviewNotes);
    if(reconstructed.revision!==saved.revision)throw Error('PERSISTENCE_FAILURE:HR_READ_MODEL_REVISION');
    current={...reconstructed,...saved};
  }
  // Strongly rebind the observed worksheets using only their integrity-checked
  // inventory evidence and today's Firestore configuration. No external lookup.
  if(binding.scope.hrPeriodId&&!current.bindingProof.readScope?.catalogPeriodIds?.includes(binding.scope.hrPeriodId))return null;
  const after=await resolveProjectHrReadBinding(binding.scope,{discoveryContexts:current.discoveryContexts,allowInventory:false});
  if(after.proof.bindingFingerprint!==current.bindingProof.bindingFingerprint||
     (after.proof.localBindingFingerprint||after.proof.bindingFingerprint)!==localKey)
    throw Error('MAPPING_FAILURE:HR_BINDING_CHANGED_DURING_READ_MODEL_RECOVERY');
  cache=current;
  return current;
}

function parseHrSourceFailure(stderr,script){
  if(!['tools/hr-source/tya-live-provider-registry-identity-dev.mjs','tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'].includes(script))return null;
  const markers=String(stderr||'').split(/\r?\n/).filter(line=>line.startsWith('CXORBIA_HR_SOURCE_FAILURE='));
  if(markers.length!==1)return null;
  let data;try{data=JSON.parse(markers[0].slice('CXORBIA_HR_SOURCE_FAILURE='.length));}catch{return null;}
  if(!data||Object.keys(data).sort().join(',')!=='attempts,code,readOnly,schemaVersion,upstreamStatus')return null;
  if(data.schemaVersion!=='cxorbia.hr-source-read-failure.v1'||data.readOnly!==true||!Number.isInteger(data.attempts)||data.attempts<0||data.attempts>7)return null;
  if(data.code==='HR_SOURCE_READ_QUOTA_EXHAUSTED'?(data.upstreamStatus!==429||data.attempts<1):(data.code!=='HR_SOURCE_READ_DEADLINE_EXCEEDED'||data.upstreamStatus!==null))return null;
  return {...data,stage:script.includes('registry-identity')?'registryIdentity':'liveProviderRead'};
}

function runNode(args,env){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:ROOT,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
    let out='',err='';
    child.stdout.on('data',chunk=>{out+=chunk;});
    child.stderr.on('data',chunk=>{err+=chunk;});
    child.on('error',reject);
    child.on('close',code=>{
      if(code===0)return resolve({out,err});
      const failure=parseHrSourceFailure(err,args[0]);
      if(failure){const error=new Error(failure.code);error.code=failure.code;error.hrSourceFailure=failure;return reject(error);}
      reject(new Error(`Command failed (${code}): node ${args.join(' ')}\n${err.slice(-3000)}\n${out.slice(-1000)}`));
    });
  });
}

function parseSnapshot(file){
  const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  const match=text.match(/window\.CX_TYA_HR_SOURCE_SAFE\s*=\s*([\s\S]*?);\s*(?:window\.CX_TYA_HR_VIVA_SOURCE_SAFE\s*=\s*true\s*;\s*)?$/);
  if(!match)throw new Error('Source-safe payload wrapper invalid.');
  const snapshot=JSON.parse(match[1]);
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('Unsafe snapshot state.');
  if(!Array.isArray(snapshot?.periods)||!snapshot.periods.length||!Array.isArray(snapshot?.visits)||!snapshot.visits.length)throw new Error('Live snapshot empty.');
  return snapshot;
}

function parseIdentity(file){
  if(!file||!fs.existsSync(file))return new Map();
  const x=JSON.parse(fs.readFileSync(file,'utf8'));
  const legacy=x?.schemaVersion==='cxorbia.tya-dev-operational-display-identity.v1'&&x?.displayIdentityOnly===true&&x?.containsContactData===false;
  const current=x?.schemaVersion==='cxorbia.tya-operational-shopper-identity.v2'&&x?.containsContactData===true&&x?.contactDataOptional===true;
  if((!legacy&&!current)||x?.containsGovernmentId!==false||x?.containsBankData!==false||x?.containsCredentials!==false)throw new Error('Operational shopper identity runtime file invalid.');
  return new Map((x.identities||[]).filter(i=>i?.shopperId&&i?.displayName).map(i=>[String(i.shopperId),{
    displayName:String(i.displayName),country:String(i.country||''),phone:String(i.phone||i.whatsapp||''),whatsapp:String(i.whatsapp||i.phone||''),email:String(i.email||''),lastObservedPeriodKey:String(i.lastObservedPeriodKey||'')
  }]));
}

function stableRevisionValue(value){
  if(Array.isArray(value))return value.map(stableRevisionValue);
  if(value&&typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort()){
      if(VOLATILE_REVISION_KEYS.has(key))continue;
      out[key]=stableRevisionValue(value[key]);
    }
    return out;
  }
  return value;
}

function materialize(snapshot,origin,identity=new Map(),privateReviewNotes=new Map()){
  const excelOriginal=snapshot.source?.providerType==='excel_online';
  if(excelOriginal&&!/^[a-f0-9]{64}$/.test(snapshot.source.sourceRevision||''))
    throw Error('MAPPING_FAILURE:EXCEL_SOURCE_REVISION_REQUIRED');
  // Reconstruct the reader's hash input even if this is a previously
  // materialized durable snapshot. The runtime revision is never self-hashed.
  const hashSnapshot=excelOriginal
    ? {...snapshot,sourceRevision:snapshot.source.sourceRevision}
    : snapshot;
  const identityStable=[...identity.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).map(([id,value])=>[id,stableRevisionValue(value)]);
  const stableJson=JSON.stringify({snapshot:stableRevisionValue(hashSnapshot),shopperIdentity:identityStable});
  const revision=crypto.createHash('sha256').update(stableJson).digest('hex');
  // Excel exposes a provider-read digest at source.sourceRevision. The command
  // authority is the materialized snapshot plus its private exact identity.
  // Bind the public top-level revision to that same authority, without changing
  // the hash input or mutating the reader snapshot / provider provenance.
  const runtimeSnapshot=excelOriginal
    ? {...snapshot,sourceRevision:revision}
    : snapshot;
  const json=JSON.stringify(runtimeSnapshot);
  return {snapshot:runtimeSnapshot,json,revision,loadedAt:Date.now(),origin,identity,privateReviewNotes};
}

function operationalSnapshot(current){
  const snapshot=JSON.parse(JSON.stringify(current.snapshot));
  const identity=current.identity||new Map();
  for(const shopper of snapshot.shoppers||[]){
    const row=identity.get(String(shopper.shopperId||shopper.id||'')),name=String(row?.displayName||row||'');
    if(name){shopper.nombre=name;shopper.operationalDisplayName=true;shopper.dataLevel=shopper.dataLevel||'protected_reference';}
  }
  for(const visit of snapshot.visits||[]){
    const row=identity.get(String(visit.shopperId||'')),name=String(row?.displayName||row||'');
    if(name){visit.shopper=name;visit.operationalDisplayName=true;}
  }
  snapshot.operationalIdentityPreview=true;
  snapshot.operationalIdentityScope='display_name_only';
  snapshot.source={...(snapshot.source||{}),operationalIdentityPreview:true,operationalIdentityScope:'display_name_only',sensitivePiiExcluded:['telefono','mail','dpi','banco','direccion_shopper','observaciones','hr_url_privada','workbook_crudo','credenciales']};
  return snapshot;
}

function ensureAdmin(){
  if(!getApps().length){
    const options={credential:applicationDefault()};
    if(FIREBASE_PROJECT)options.projectId=FIREBASE_PROJECT;
    initializeApp(options);
  }
  return {auth:getAuth(),db:getFirestore()};
}
function snapshotScope(snapshot){
  const tenantId=String(snapshot?.tenantId||snapshot?.tenantConfig?.tenantId||'').trim();
  const projectId=String(snapshot?.projectId||snapshot?.projectConfig?.projectId||'').trim();
  if(!tenantId||!projectId)throw new Error('SHOPPER_RUNTIME_SOURCE_SCOPE_MISSING');
  return {tenantId,projectId};
}
const SAFE_PROJECT_CONFIG_KEYS=Object.freeze(['name','client','industry','sucursales','countries','currency','currencies','honorario','honorarioRecibe','honRecibe','boleto','comboAmt','modelo','isr','regalias','periodicidad','periodoCumpl','scenarios','scenarioDimensions','quincenas','cuestionario','questionnaireProgramsByPeriod','hrReadWindow']);
function safeProjectConfig(raw={}){
  const out={};
  for(const key of SAFE_PROJECT_CONFIG_KEYS)if(raw[key]!==undefined)out[key]=JSON.parse(JSON.stringify(raw[key]));
  return out;
}
async function withDurableProjectConfig(snapshot){
  const scope=snapshotScope(snapshot),{db}=ensureAdmin();
  const snap=await db.collection('tenants').doc(scope.tenantId).collection('projects').doc(scope.projectId).get();
  if(!snap.exists)return snapshot;
  const raw=snap.data()||{},durable=safeProjectConfig(raw);
  const merged={...(snapshot.projectConfig||{}),...durable,projectId:scope.projectId};
  return {...snapshot,projectConfig:merged,projectConfigAuthority:'firestore_project_config',projectConfigVersion:raw.version??null};
}

function loadExcelMappingLibrary(mappingRef,root=ROOT){
  const library={
    'tya-hr-column-map-r20-v1':{columns:'backend/contracts/tya-hr-column-map-r20-v1.json',identity:'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json'}
  };
  const selected=library[String(mappingRef||'')];
  if(!selected)throw Error('MAPPING_FAILURE:HR_BINDING_MAPPING_UNSUPPORTED');
  const columnMap=JSON.parse(fs.readFileSync(path.join(root,selected.columns),'utf8'));
  const cinemaRegistry=JSON.parse(fs.readFileSync(path.join(root,selected.identity),'utf8'));
  if(columnMap.contractId!==mappingRef||!cinemaRegistry?.cinemas)throw Error('MAPPING_FAILURE:HR_BINDING_MAPPING_IDENTITY');
  return {columnMap,cinemaRegistry};
}

// VRM-358: this existing reader is a scoped adapter. Resolve its configured
// private binding BEFORE reading HR; never borrow a global workbook or another
// project's cache. Other adapters must supply their own proved mapping.
async function resolveProjectHrReadBinding(requestedScope,{db=ensureAdmin().db,root=ROOT,discoveryContexts,localOnly=false,allowInventory=true}={}){
  const fail=code=>{throw new Error('MAPPING_FAILURE:HR_BINDING_'+code);};
  const mappingFile=path.join(root,'backend/contracts/tya-hr-column-map-r20-v1.json');
  const mappingBytes=fs.readFileSync(mappingFile),mapping=JSON.parse(mappingBytes);
  const scope=requestedScope||{tenantId:mapping.tenantId,projectId:mapping.projectId};
  const valid=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,200}$/.test(v);
  if(!valid(scope?.tenantId)||!valid(scope?.projectId))fail('INVALID_SCOPE');
  const project=await db.doc('tenants/'+scope.tenantId+'/projects/'+scope.projectId).get();
  if(!project.exists)fail('PROJECT_MISSING');
  const raw=project.data()||{},selected=raw.operationalSource?'operationalSource':'routeSource',source=raw[selected]||{};
  if(raw.tenantId!==scope.tenantId||(raw.projectId&&raw.projectId!==scope.projectId))fail('PROJECT_SCOPE');
  // I3/F2 P0: respect the project's durable Excel selection. Never silently
  // fall back to the obsolete Google mirror after this source is selected.
  if(source.providerType==='excel_online'){
    const refs=[...new Set((source.countryBindings||[]).map(row=>row.mappingRef))];
    if(refs.length!==1)fail('MAPPING_AMBIGUOUS');
    loadExcelMappingLibrary(refs[0],root);
    const plan=await resolveExcelOriginalProjectPlan({db,scope,discoveryContexts,localOnly,inventoryCache:hrInventoryCache,
      readInventory:allowInventory&&!localOnly ? binding=>withOriginalToolboxReader(runScenario=>readExcelWorksheetInventoryThroughMake({binding,runScenario})) : undefined});
    return {...plan,mappingRef:refs[0]};
  }
  // Legacy Google adapter remains scoped to its own approved library. Excel
  // scope is separately verified from project + country private bindings.
  if(scope.tenantId!==mapping.tenantId||scope.projectId!==mapping.projectId)fail('ADAPTER_SCOPE_UNSUPPORTED');
  if(source.mode!=='external'||source.providerType!=='google_sheets'||source.readPolicy!=='external_live'||source.writePolicy!=='external_read_only')fail('SOURCE_POLICY');
  const bindingId=source.providerBindingId||source.integrationSettingId||source.providerRef;
  if(!valid(bindingId))fail('REFERENCE_REQUIRED');
  if(source.mappingRef!==mapping.contractId)fail('MAPPING_UNSUPPORTED');
  const binding=await db.doc('tenants/'+scope.tenantId+'/integrationSettings/'+bindingId).get();
  if(!binding.exists)fail('INTEGRATION_MISSING');
  const row=binding.data()||{};
  if(row.tenantId!==scope.tenantId||(row.projectId?row.projectId!==scope.projectId:!Array.isArray(row.projectIds)||!row.projectIds.includes(scope.projectId)))fail('INTEGRATION_SCOPE');
  if(row.enabled!==true||row.hrWritesEnabled!==false||row.providerType!=='google_sheets'||row.readPolicy!=='external_live'||row.writePolicy!=='external_read_only')fail('INTEGRATION_POLICY');
  if(row.mappingRef!==source.mappingRef||(row.providerBindingId&&row.providerBindingId!==bindingId))fail('INTEGRATION_REFERENCE');
  if(row.sheetId&&row.spreadsheetId&&row.sheetId!==row.spreadsheetId)fail('WORKBOOK_AMBIGUOUS');
  const sheetId=row.sheetId||row.spreadsheetId;
  if(!valid(sheetId))fail('WORKBOOK_MISSING');
  const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
  const stamp=s=>{const t=s.updateTime;if(!Number.isSafeInteger(t?.seconds)||!Number.isInteger(t?.nanoseconds)||t.nanoseconds<0||t.nanoseconds>=1e9)fail('TIMESTAMP_UNVERIFIABLE');return {seconds:t.seconds,nanoseconds:t.nanoseconds};};
  const proof={schemaVersion:'cxorbia.hr-project-read-binding.v1',tenantId:scope.tenantId,projectId:scope.projectId,sourceSelected:selected,
    bindingRefSha256:hash(bindingId),workbookSha256:hash(sheetId),mappingRefSha256:hash(source.mappingRef),mappingSha256:hash(mappingBytes),
    projectVersion:raw.version??null,projectUpdateTime:stamp(project),bindingUpdateTime:stamp(binding),readPolicy:source.readPolicy,writePolicy:source.writePolicy,
    privateResolution:true,hrWrites:false,production:false};
  proof.bindingFingerprint=hash(JSON.stringify(proof));
  return {scope,proof,readerEnv:{CXORBIA_HR_LIVE_SHEET_ID:sheetId,CXORBIA_HR_COLUMN_MAP_FILE:mappingFile,CXORBIA_HR_REQUIRE_PROJECT_BINDING:'true'}};
}
function canonicalProtectedAuthNamespace(role,value){
  const namespace=String(value||'').trim().toLowerCase();
  if(namespace)return namespace;
  return String(role||'').trim().toLowerCase()==='shopper'?'shopper':'';
}

async function withOriginalToolboxReader(consume) {
  const url = new URL(process.env.CXORBIA_B14_MAKE_TOOLBOX_URL || 'about:blank');
  const token = process.env.CXORBIA_B14_MAKE_TOOLBOX_TOKEN;
  if (url.origin !== 'https://eu2.make.com' || !/^\/mcp\/server\/[0-9a-f-]{36}$/.test(url.pathname) || url.search || url.hash || url.username || url.password)
    throw Error('MAPPING_FAILURE:B14_TOOLBOX_URL');
  if (!token) throw Error('AUTH_FAILURE:B14_TOOLBOX_CREDENTIAL');
  const [{Client},{StreamableHTTPClientTransport}] = await Promise.all([
    import('@modelcontextprotocol/sdk/client/index.js'), import('@modelcontextprotocol/sdk/client/streamableHttp.js')
  ]);
  const client = new Client({name:'cxorbia-hr-readback',version:'1.0.0'});
  const transport=new StreamableHTTPClientTransport(url,{requestInit:{redirect:'error',headers:{Authorization:'Bearer '+token}}});
  return withMakeGraphToolboxReader({client,transport},consume);
}
async function readOriginalThroughToolbox(binding,columnMap){
  return withOriginalToolboxReader(runScenario=>readExcelPeriodThroughMake({binding,columnMap,runScenario}));
}

async function withOriginalToolboxWriter(consume){
  // A separate credential/exposure for the SAME writer scenario. Never expand
  // the read-only toolbox or infer write permission from its successful GET.
  if(!F3_HR_FIELDS_ENABLED)throw Error('PROVIDER_FAILURE:F3_WRITER_DISABLED');
  const url=new URL(process.env.CXORBIA_F3_MAKE_TOOLBOX_URL||'about:blank');
  const token=process.env.CXORBIA_F3_MAKE_TOOLBOX_TOKEN;
  if(url.origin!=='https://eu2.make.com'||!/^\/mcp\/server\/[0-9a-f-]{36}$/.test(url.pathname)||url.search||url.hash||url.username||url.password)
    throw Error('MAPPING_FAILURE:F3_WRITER_TOOLBOX_URL');
  if(!token)throw Error('AUTH_FAILURE:F3_WRITER_TOOLBOX_CREDENTIAL');
  const [{Client},{StreamableHTTPClientTransport}]=await Promise.all([
    import('@modelcontextprotocol/sdk/client/index.js'),import('@modelcontextprotocol/sdk/client/streamableHttp.js')
  ]);
  const client=new Client({name:'cxorbia-hr-field-command',version:'1.0.0'});
  const transport=new StreamableHTTPClientTransport(url,{requestInit:{redirect:'error',headers:{Authorization:'Bearer '+token}}});
  return withMakeGraphToolboxWriter({client,transport},consume);
}
async function writeOriginalHrField(event,options){
  const {db}=ensureAdmin();
  const plan=await resolveProjectHrReadBinding({tenantId:event.tenantId,projectId:event.projectId,hrPeriodId:event.periodId});
  const resolveBinding=request=>resolveCountryHrPeriodBinding({...request,discovery:plan.discoveryContexts?.[request.countryCode]});
  const binding=await resolveBinding({db,tenantId:event.tenantId,projectId:event.projectId,countryCode:event.countryCode,periodId:event.periodId,purpose:'operational'});
  const {columnMap,cinemaRegistry}=loadExcelMappingLibrary(binding.privateProvider.mappingRef);
  let target;
  try{target=await resolveExcelFieldWriteTarget({db,event,columnMap,cinemaRegistry,resolveBinding,
    readBinding:binding=>readOriginalThroughToolbox(binding,columnMap)});}
  catch(error){
    // This exact guard follows independent provider reads and exact row identity
    // validation. A changed cell is a causal conflict, never a retryable PATCH.
    if(error?.message!=='MAPPING_FAILURE:B14_FIELD_SOURCE_BASE_CHANGED')throw error;
    const after=await resolveBinding({db,tenantId:event.tenantId,projectId:event.projectId,countryCode:event.countryCode,periodId:event.periodId,purpose:'operational'});
    if(after.proof.bindingFingerprint!==binding.proof.bindingFingerprint)throw Error('MAPPING_FAILURE:B14_FIELD_BINDING_CHANGED_DURING_READ');
    return {tenantId:event.tenantId,projectId:event.projectId,periodId:event.periodId,countryCode:event.countryCode,
      visitId:event.visitId,hrRowId:event.hrRowId,fieldKey:event.fieldKey,eventId:event.eventId,eventDigest:event.eventDigest,
      status:'conflict',code:'HR_FIELD_REMOTE_BASE_CONFLICT',providerAck:false,writeAckVerified:false,readbackVerified:false,providerWriteRequests:0};
  }
  const result=await withOriginalToolboxWriter(runScenario=>executeExcelFieldEventThroughMake({event,target,runScenario,...options}));
  if(result.providerAck===true&&result.readbackVerified===true){
    // Drain an older read before expiring this exact project's cache. A read
    // begun before the write must not become a fresh cache after its ACK.
    await invalidateSharedHrSync(db,event);
    const pending=inFlight;if(pending)await Promise.allSettled([pending]);
    if(cache?.snapshot?.tenantId===event.tenantId&&cache?.snapshot?.projectId===event.projectId)cache.loadedAt=0;
    for(const current of scopedHrCache.values())if(current.snapshot.tenantId===event.tenantId&&current.snapshot.projectId===event.projectId)current.loadedAt=0;
  }
  return result;
}

async function verifiedProtectedPrincipal(req,scope){
  const token=String(req.headers.authorization||'').trim().replace(/^Bearer\s+/i,'');
  if(!token)throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_BEARER_REQUIRED');
  const {auth,db}=ensureAdmin();
  const decoded=await auth.verifyIdToken(token,true);
  const role=String(decoded.role||'').trim().toLowerCase();
  const namespace=canonicalProtectedAuthNamespace(role,decoded.authNamespace);
  if(String(decoded.tenantId||'').trim()!==scope.tenantId)throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_TENANT_DENIED');
  const memberSnap=await db.collection('tenants').doc(scope.tenantId).collection('users').doc(decoded.uid).get();
  if(!memberSnap.exists)throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_MEMBERSHIP_MISSING');
  const member=memberSnap.data()||{};
  if(member.active===false||String(member.status||'active').trim().toLowerCase()==='inactive')throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_MEMBERSHIP_INACTIVE');
  if(String(member.role||'').trim().toLowerCase()!==role||String(member.authNamespace||'').trim().toLowerCase()!==namespace)throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_MEMBERSHIP_CLAIMS_MISMATCH');
  const projects=Array.isArray(member.projectIds)?member.projectIds.map(String):[];
  if(role!=='super'&&!projects.includes(scope.projectId))throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_PROJECT_DENIED');
  return {uid:decoded.uid,role,namespace,shopperId:String(decoded.shopperId||member.shopperId||'').trim(),db};
}

async function exactHrCrosswalk(db,scope){
  const snap=await db.collection('tenants').doc(scope.tenantId).collection('shopperIdentityCrosswalk').get();
  const tokenTargets=new Map();
  for(const doc of snap.docs){
    const row={id:doc.id,...(doc.data()||{})};
    if(String(row.sourceType||'').trim().toLowerCase()!=='hr_external')continue;
    const projectIds=Array.isArray(row.projectIds)?row.projectIds.map(String):[];
    if(row.projectId&&String(row.projectId)!==scope.projectId)continue;
    if(projectIds.length&&!projectIds.includes(scope.projectId))continue;
    const target=String(row.shopperId||'').trim();if(!target)continue;
    for(const token of [row.id,row.sourceStableKey,row.sourceShopperId].map(v=>String(v||'').trim()).filter(Boolean)){
      if(!tokenTargets.has(token))tokenTargets.set(token,new Set());
      tokenTargets.get(token).add(target);
    }
  }
  const unique=new Map();
  for(const [token,targets] of tokenTargets){
    if(targets.size!==1)throw new Error('MAPPING_FAILURE:HR_CROSSWALK_AMBIGUOUS:'+token);
    unique.set(token,[...targets][0]);
  }
  return unique;
}

async function commercialTenantState(principal,scope){
  const empty={clients:[],accounts:[],contacts:[],opportunities:[],columns:[],authority:'firestore_tenant_commercial',tenantId:scope.tenantId};
  if(!['super','admin'].includes(String(principal.role||'').toLowerCase()))return empty;
  const tenant=principal.db.collection('tenants').doc(scope.tenantId);
  const [clients,accounts,contacts,opportunities,columns]=await Promise.all([
    tenant.collection('clients').get(),
    tenant.collection('crmAccounts').get(),
    tenant.collection('crmContacts').get(),
    tenant.collection('crmOpportunities').get(),
    tenant.collection('crmColumns').get()
  ]);
  const rows=s=>s.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
  return {clients:rows(clients),accounts:rows(accounts),contacts:rows(contacts),opportunities:rows(opportunities),columns:rows(columns),authority:'firestore_tenant_commercial',tenantId:scope.tenantId};
}

async function academyTenantState(principal,scope){
  const tenant=principal.db.collection('tenants').doc(scope.tenantId);
  const [courses,categories,audit,learner]=await Promise.all([
    tenant.collection('academyCourses').get(),
    tenant.collection('academyCategories').get(),
    ['super','admin'].includes(String(principal.role||'').toLowerCase())?tenant.collection('academyAudit').get():Promise.resolve({docs:[]}),
    tenant.collection('users').doc(principal.uid).get()
  ]);
  const rows=s=>s.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
  return {courses:rows(courses),categories:rows(categories),audit:rows(audit),authority:'firestore_tenant_academy',tenantId:scope.tenantId,
    progressOwnerUid:principal.uid,progress:academyProgressSnapshot(learner.data(),scope.tenantId,principal.uid),progressCatalog:academyProgressCatalog(rows(courses)),progressAuthority:'firestore_user_academy_progress'};
}

async function attachHrFieldEditingCapability(snapshot,principal,sourceRevision){
  if(!F3_HR_FIELDS_ENABLED||!process.env.CXORBIA_F3_MAKE_TOOLBOX_URL||!process.env.CXORBIA_F3_MAKE_TOOLBOX_TOKEN||
    !['super','admin','ops','coordinador'].includes(principal.role))return;
  const scope=snapshotScope(snapshot),source=snapshot.projectConfig?.operationalSource||snapshot.projectConfig?.routeSource;
  if(source?.providerType!=='excel_online'||source.writePolicy!=='bidirectional_gated')return;
  const capabilities=new Map();
  await Promise.all((source.countryBindings||[]).map(async entry=>{
    const snap=await principal.db.doc('tenants/'+scope.tenantId+'/integrationSettings/'+entry.providerBindingId).get(),setting=snap.exists?snap.data():{};
    const cap=setting.fieldWriter||{};
    if(setting.tenantId!==scope.tenantId||setting.projectId!==scope.projectId||setting.countryCode!==entry.countryCode||setting.enabled!==true||
      setting.hrWritesEnabled!==true||setting.writePolicy!=='bidirectional_gated'||cap.schemaVersion!=='cxorbia.hr-field-writer-binding.v1'||
      cap.enabled!==true||cap.protocolVersion!=='cxorbia.hr-field-transport.v1'||cap.remoteEventReceipt!==true||cap.observedBaseGuard!==true)return;
    const {columnMap}=loadExcelMappingLibrary(entry.mappingRef);
    const fields=(cap.allowedFields||[]).filter(key=>HR_WRITABLE_VISIT_FIELDS.includes(key)).map(key=>{
      const rule=cap.fieldMap?.[key],mapped=columnMap.columns?.[rule?.columnKey];
      return mapped&&['text','date','money','shopper'].includes(rule.valueKind)?{key,label:mapped.aliases[0],kind:rule.valueKind}:null;
    }).filter(Boolean);
    if(!fields.length)return;
    for(const sheet of setting.periodSheets||[])capabilities.set(entry.countryCode+'|'+sheet.periodId,{schemaVersion:'cxorbia.hr-field-editor-capability.v1',
      enabled:true,...scope,countryCode:entry.countryCode,periodId:sheet.periodId,fields,sourceRevision});
  }));
  for(const visit of snapshot.visits||[]){
    const cap=capabilities.get(String(visit.country||visit.pais)+'|'+String(visit.periodId));
    if(cap)visit.hrFieldEditing=cap;
  }
}

async function protectedPlatformState(current,principal,scope,operational){
  const snapshot=operational?operationalSnapshot(current):JSON.parse(JSON.stringify(current.snapshot));
  if(current.externalReadCurrent!==false)await attachHrFieldEditingCapability(snapshot,principal,current.revision);
  /* I3 P0: independent scoped Firestore authority reads run concurrently for one verified principal. */
  const tenantRef=principal.db.collection('tenants').doc(scope.tenantId);
  const projectRef=tenantRef.collection('projects').doc(scope.projectId);
  const reservationsRef=projectRef.collection('reservations');
  const certificationsRef=projectRef.collection('certifications');
  const recertificationsRef=projectRef.collection('certificationRecertifications');
  const periodsRef=projectRef.collection('periods');
  if(principal.role==='shopper'&&!principal.shopperId)throw new Error('AUTH_FAILURE:PROTECTED_RUNTIME_SHOPPER_ID_REQUIRED');
  const emptyCollection=()=>({docs:[]});
  const scopedReads=principal.role==='shopper'?Promise.all([
    reservationsRef.where('shopperId','==',principal.shopperId).get(),
    certificationsRef.where('shopperId','==',principal.shopperId).get(),
    recertificationsRef.get(),periodsRef.get()
  ]):['super','admin','ops','coordinador'].includes(principal.role)?Promise.all([
    reservationsRef.get(),certificationsRef.get(),recertificationsRef.get(),periodsRef.get()
  ]):Promise.resolve([emptyCollection(),emptyCollection(),emptyCollection(),emptyCollection()]);
  const governanceAllowed=['super','admin'].includes(String(principal.role||'').toLowerCase());
  const governanceReads=governanceAllowed?Promise.all([
    tenantRef.collection('shopperIdentityReviews').get(),
    tenantRef.collection('shopperIdentityReviewResolutions').get(),
    tenantRef.collection('shopperTombstones').get()
  ]):Promise.resolve([emptyCollection(),emptyCollection(),emptyCollection()]);
  const crosswalkRead=exactHrCrosswalk(principal.db,scope);
  const commercialRead=commercialTenantState(principal,scope);
  const academyRead=academyTenantState(principal,scope);
  const [cross,scoped,governance,commercial,academy]=await Promise.all([
    crosswalkRead,scopedReads,governanceReads,commercialRead,academyRead
  ]);
  const [reservationSnap,certificationSnap,recertificationSnap,periodsSnap]=scoped;
  const [identityReviewSnap,identityResolutionSnap,tombstoneSnap]=governance;
  let mappedShoppers=0,mappedVisits=0;
  for(const shopper of snapshot.shoppers||[]){
    const live=String(shopper.shopperId||shopper.id||'').trim(),canonical=cross.get(live);
    if(canonical){shopper.canonicalShopperId=canonical;shopper.identityAuthority='hr_exact_crosswalk';mappedShoppers++;}
  }
  for(const visit of snapshot.visits||[]){
    const live=String(visit.shopperId||'').trim(),canonical=cross.get(live);
    if(canonical){visit.canonicalShopperId=canonical;visit.identityAuthority='hr_exact_crosswalk';mappedVisits++;}
    const observation=authorizedHrReviewObservation({visit,scope,privateReviewNotes:current.privateReviewNotes,
      principal:{...principal,canonicalShopperId:cross.get(principal.shopperId)||principal.shopperId}});
    if(observation!==null&&(current.externalReadCurrent!==false||principal.role!=='shopper'))visit.hrReviewObservation=observation;
  }
  const reservations=reservationSnap.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
  const certifications=certificationSnap.docs.map(doc=>({id:doc.id,...(doc.data()||{}),projectId:doc.data()?.projectId||scope.projectId}));
  const periods=periodsSnap.docs.map(doc=>({id:doc.id,...(doc.data()||{}),projectId:doc.data()?.projectId||scope.projectId}));
  const certificationRecertifications=recertificationSnap.docs.map(doc=>({id:doc.id,...(doc.data()||{}),projectId:doc.data()?.projectId||scope.projectId})).filter(row=>{
    if(principal.role!=='shopper')return true;
    return String(row.status||'active')==='active'&&(String(row.scope)==='all'||(Array.isArray(row.targetShopperIds)&&row.targetShopperIds.map(String).includes(principal.shopperId)));
  });
  const rows=s=>s.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
  const projectScoped=row=>{
    const scopeId=String(row.projectScope||row.projectId||'*');
    return scopeId==='*'||scopeId==='tenant'||scopeId===scope.projectId;
  };
  const identityReviews=rows(identityReviewSnap).filter(projectScoped);
  const identityReviewResolutions=rows(identityResolutionSnap).filter(projectScoped);
  const shopperTombstones=rows(tombstoneSnap).filter(row=>!row.projectId||String(row.projectId)===scope.projectId);
  return {snapshot,protectedState:{reservations,certifications,certificationRecertifications,periods,identityReviews,identityReviewResolutions,shopperTombstones,commercial,academy,certificationAuthority:'firestore_project_certifications_exact_identity',identityGovernanceAuthority:'firestore_tenant_shopper_identity_governance',identityAuthority:'hr_exact_crosswalk',crosswalkTokenCount:cross.size,mappedShoppers,mappedVisits,sourceRevision:current.revision}};
}

function shopperPolicy(snapshot){
  const scope=snapshotScope(snapshot);
  return {schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:[scope.tenantId],allowedProjectIds:[scope.projectId],hrWrites:false,externalWrites:false,fuzzyMatching:false};
}
function projectPolicy(snapshot){
  const scope=snapshotScope(snapshot);
  return {schemaVersion:'cxorbia.project-command-provider-policy.v1',enabled:true,allowedTenantIds:[scope.tenantId],allowedProjectIds:[scope.projectId],externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false};
}
function operationalPolicy(snapshot){
  const scope=snapshotScope(snapshot);
  return {schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:[scope.tenantId],allowedProjectIds:[scope.projectId],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
}
function commercialPolicy(snapshot){
  const scope=snapshotScope(snapshot);
  return {schemaVersion:'cxorbia.commercial-command-provider-policy.v1',enabled:true,allowedTenantIds:[scope.tenantId],hrWrites:false,externalWrites:false,paymentWrites:false};
}
function academyPolicy(snapshot){
  const scope=snapshotScope(snapshot);
  return {schemaVersion:'cxorbia.academy-command-provider-policy.v1',enabled:true,allowedTenantIds:[scope.tenantId],hrWrites:false,externalWrites:false,paymentWrites:false};
}
function configureCommandRuntime(snapshot,current=cache){
  if(!snapshot)throw new Error('COMMAND_SOURCE_SCOPE_UNAVAILABLE');
  const {auth,db}=ensureAdmin();
  globalThis.CXORBIA_COMMAND_AUTH=auth;
  globalThis.CXORBIA_COMMAND_DB=db;
  globalThis.CXORBIA_SHOPPER_COMMAND_PROVIDER_POLICY=shopperPolicy(snapshot);
  globalThis.CXORBIA_PROJECT_COMMAND_PROVIDER_POLICY=projectPolicy(snapshot);
  globalThis.CXORBIA_OPERATIONAL_COMMAND_PROVIDER_POLICY=operationalPolicy(snapshot);
  globalThis.CXORBIA_COMMERCIAL_COMMAND_PROVIDER_POLICY=commercialPolicy(snapshot);
  globalThis.CXORBIA_ACADEMY_COMMAND_PROVIDER_POLICY=academyPolicy(snapshot);
  globalThis.CXORBIA_COMMAND_HR_SNAPSHOT=snapshot;
  globalThis.CXORBIA_COMMAND_HR_REVISION=String(current?.revision||'');
  // Server-side only: the identity file is produced with this exact fresh HR
  // snapshot. Protected provider comparisons must not use masked public names.
  globalThis.CXORBIA_COMMAND_HR_PRIVATE_IDENTITY=current?.identity instanceof Map?current.identity:null;
  // Capture dependencies per request: concurrent project reads must not replace
  // the snapshot/revision of a command already being authorized and committed.
  return {auth,db,shopperPolicy:shopperPolicy(snapshot),projectPolicy:projectPolicy(snapshot),
    operationalPolicy:operationalPolicy(snapshot),commercialPolicy:commercialPolicy(snapshot),academyPolicy:academyPolicy(snapshot),
    hrSnapshot:snapshot,hrRevision:String(current?.revision||''),hrIdentityByShopperId:current?.identity||null,
    hrFieldJournalEnabled:F3_HR_FIELDS_ENABLED&&snapshot.source?.providerType==='excel_online'&&
      (snapshot.projectConfig?.operationalSource||snapshot.projectConfig?.routeSource)?.writePolicy==='bidirectional_gated',
    writeHrField:F3_HR_FIELDS_ENABLED?writeOriginalHrField:undefined};
}
const explicitHrReconciliation=createHrSnapshotReconciler({
  verifyPrincipal:verifiedProtectedPrincipal,
  readSnapshot:scope=>buildSnapshot({forceFresh:true,scope}),
  ensureAdmin,shopperPolicy,operationalPolicy,
  hrFieldJournalEnabled:snapshot=>F3_HR_FIELDS_ENABLED&&snapshot.source?.providerType==='excel_online'&&
      (snapshot.projectConfig?.operationalSource||snapshot.projectConfig?.routeSource)?.writePolicy==='bidirectional_gated'
});

function loadBootstrap(){
  try{
    if(!fs.existsSync(BOOTSTRAP_FILE))return;
    cache=materialize(parseSnapshot(BOOTSTRAP_FILE),'build_bootstrap');
    console.log(`CXOrbia live HR bootstrap ready ${cache.revision.slice(0,12)}`);
  }catch(error){
    console.warn(`CXOrbia live HR bootstrap unavailable: ${String(error?.message||error)}`);
  }
}

async function runIndependentHrSourceReads(timedNode){
  // VRM-134: both live source reads use the same scoped spreadsheet but
  // write separate temporary outputs. Neither consumes the other's output.
  // Wait for BOTH to settle before validation or cleanup, including on FAIL.
  const sourceReadResults=await Promise.allSettled([
    timedNode('registryIdentity',['tools/hr-source/tya-live-provider-registry-identity-dev.mjs']),
    timedNode('liveProviderRead',['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'])
  ]);
  const sourceReadFailure=sourceReadResults.find(result=>result.status==='rejected');
  if(sourceReadFailure)throw sourceReadFailure.reason;
  const stats={};
  for(const [index,result]of sourceReadResults.entries()){
    let data;try{data=JSON.parse(result.value?.out||'null')?.providerReadStats;}catch{}
    if(data&&['attempts','successfulRequests','quotaRetries','responseBytes'].every(key=>Number.isSafeInteger(data[key])&&data[key]>=0))stats[index===0?'registryIdentity':'liveProviderRead']={attempts:data.attempts,successfulRequests:data.successfulRequests,quotaRetries:data.quotaRetries,responseBytes:data.responseBytes};
  }
  return stats;
}

async function refreshSnapshot(binding){
  if(inFlight){
    if(inFlightBinding!==binding.proof.bindingFingerprint)throw new Error('MAPPING_FAILURE:HR_BINDING_CHANGED_DURING_READ');
    return inFlight;
  }
  inFlightBinding=binding.proof.bindingFingerprint;
  lastRefreshStartedAt=new Date().toISOString();
  const started=Date.now();
  inFlight=(async()=>{
    if(binding.proof.providerType==='excel_online'){
      const stagesMs={},stageStart=Date.now();
      const {columnMap,cinemaRegistry}=loadExcelMappingLibrary(binding.mappingRef);
      const source=await withOriginalToolboxReader(runScenario=>readExcelOriginalProjectSnapshot({db:ensureAdmin().db,plan:binding,columnMap,cinemaRegistry,
        readBinding:countryPeriod=>readExcelPeriodThroughMake({binding:countryPeriod,columnMap,runScenario})}));
      stagesMs.readOriginalExcel=Date.now()-stageStart;
      const current=await withDurableProjectConfig(source.snapshot);
      const after=await resolveProjectHrReadBinding(binding.scope,{discoveryContexts:binding.discoveryContexts});
      if(after.proof.bindingFingerprint!==binding.proof.bindingFingerprint)
        throw Error('MAPPING_FAILURE:EXCEL_BINDING_CHANGED_DURING_READ');
      const actual=snapshotScope(current);
      if(actual.tenantId!==binding.scope.tenantId||actual.projectId!==binding.scope.projectId)
        throw Error('MAPPING_FAILURE:EXCEL_OPERATIONAL_SCOPE_DRIFT');
      const next=materialize(current,'runtime_excel_online_original',source.identity,source.privateReviewNotes);
      next.bindingProof={...binding.proof,readerCount:source.proof.periodReads,
        runtimeConsumptionVerified:true,sourceRevision:source.proof.sourceRevision,rawRowsExposed:false};
      next.discoveryContexts=binding.discoveryContexts;
      next.sourceReadStartedAt=started;next.externalReadCurrent=true;
      cache=retainScopedSnapshot(next);
      lastRefreshStagesMs={...stagesMs};
      lastRefreshProviderReads={excelOnlineOriginal:{periodReads:source.proof.periodReads,
        matchedDurable:source.proof.matchedDurable,unmatchedActive:source.proof.unmatchedActive}};
      lastRefreshError=null;
      lastRefreshFinishedAt=new Date().toISOString();
      lastRefreshDurationMs=Date.now()-started;
      return cache;
    }
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-hr-live-'));
    const payload=path.join(dir,'snapshot.js');
    const runtimeRegistry=path.join(dir,'tab-registry.source-safe.json');
    const registryEvidence=path.join(dir,'tab-registry-evidence.source-safe.json');
    const identityFile=path.join(dir,'operational-display-identity.dev.json');
    if(fs.existsSync(REGISTRY_FILE))fs.copyFileSync(REGISTRY_FILE,runtimeRegistry);
    const env={
      ...binding.readerEnv,
      CXORBIA_HR_SOURCE_SAFE_OUT:payload,
      CXORBIA_HR_LIVE_MAX_ROW:process.env.CXORBIA_HR_LIVE_MAX_ROW||'140',
      CXORBIA_HR_LIVE_MAX_COL:process.env.CXORBIA_HR_LIVE_MAX_COL||'AI',
      CXORBIA_HR_EARLIEST_PERIOD:process.env.CXORBIA_HR_EARLIEST_PERIOD||'2025-06',
      CXORBIA_TENANT_TIMEZONE:process.env.CXORBIA_TENANT_TIMEZONE||'America/Guatemala',
      CXORBIA_GATE_OUT:path.join(dir,'source-gates'),
      CXORBIA_HR_TAB_REGISTRY:runtimeRegistry,
      CXORBIA_HR_TAB_REGISTRY_EVIDENCE:registryEvidence,
      CXORBIA_HR_OPERATIONAL_IDENTITY_OUT:identityFile
    };
    const stagesMs={};
    const timedNode=async(label,args)=>{
      const startedAt=Date.now();
      try{return await runNode(args,env);}finally{stagesMs[label]=Date.now()-startedAt;}
    };
    try{
      const providerReadStats=await runIndependentHrSourceReads(timedNode);
      await timedNode('tabRegistryGuard',['tools/hr-source/tya-enforce-live-tab-registry.mjs']);
      await timedNode('canonicalize',['tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'canonical')]);
      await timedNode('reapplyState',['tools/hr-source/tya-reapply-canonical-state-r20.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'state')]);
      await timedNode('freshSourceProbe',['tools/qa/tya-live-hr-read-probe-gate.mjs','--payload',payload,'--out',path.join(dir,'probe'),'--max-age-seconds','600']);
      const parsed=parseSnapshot(payload);
      const durableStartedAt=Date.now();
      const configured=await withDurableProjectConfig(parsed);
      const after=await resolveProjectHrReadBinding(binding.scope);
      if(after.proof.bindingFingerprint!==binding.proof.bindingFingerprint)throw new Error('MAPPING_FAILURE:HR_BINDING_CHANGED_DURING_READ');
      const actual=snapshotScope(configured);
      if(actual.tenantId!==binding.scope.tenantId||actual.projectId!==binding.scope.projectId)throw new Error('MAPPING_FAILURE:HR_BINDING_READER_SCOPE');
      stagesMs.durableProjectConfig=Date.now()-durableStartedAt;
      const next=materialize(configured,'runtime_refresh',parseIdentity(identityFile));
      // Binding metadata is separate from HR revision: identical external data
      // retains its revision and does not trigger a new reconciliation event.
      next.bindingProof={...binding.proof,runtimeConsumptionVerified:true,readerCount:2};
      lastRefreshStagesMs={...stagesMs};
      lastRefreshProviderReads=providerReadStats;
      /* G05: observation publishes a fresh read and never schedules a durable writer. */
      cache=next;
      lastRefreshError=null;
      lastRefreshFinishedAt=new Date().toISOString();
      lastRefreshDurationMs=Date.now()-started;
      return cache;
    } finally {
      fs.rmSync(dir,{recursive:true,force:true});
    }
  })();
  try{
    return await inFlight;
  }catch(error){
    lastRefreshError=String(error?.message||error).slice(0,500);
    lastRefreshFinishedAt=new Date().toISOString();
    lastRefreshDurationMs=Date.now()-started;
    throw error;
  }finally{
    inFlight=null;
    inFlightBinding=null;
  }
}

async function buildSnapshot({forceFresh=false,scope,allowDurableRead=false}={}){
  let binding=await resolveProjectHrReadBinding(scope,{localOnly:allowDurableRead&&!forceFresh});
  // Only presentation can consult a last-confirmed projection. Strict reads
  // always resolve and verify the provider plan, including its inventory.
  if(allowDurableRead&&!forceFresh&&binding.proof.providerType==='excel_online'){
    try{
      const recovered=await recoverHrReadModel(binding,{durableOnly:true});
      if(recovered)return recovered;
    }catch(error){
      if(!String(error?.message||'').startsWith('PERSISTENCE_FAILURE:HR_READ_MODEL_'))throw error;
      lastReadModelError='PERSISTENCE_FAILURE:HR_READ_MODEL_RECOVERY';
    }
    binding=await resolveProjectHrReadBinding(scope);
  }
  if(inFlight&&inFlightBinding!==binding.proof.bindingFingerprint){
    // A previous source owner must finish before this request can use the
    // current binding. Its result is not returned as this request's authority.
    const previousRead=inFlight;
    await Promise.allSettled([previousRead]);
    binding=await resolveProjectHrReadBinding(scope);
  }
  if(forceFresh)return refreshSnapshot(binding);
  if(scopedHrCache.has(binding.proof.bindingFingerprint))cache=scopedHrCache.get(binding.proof.bindingFingerprint);
  const matches=cache?.origin!=='build_bootstrap'&&cache?.bindingProof?.bindingFingerprint===binding.proof.bindingFingerprint;
  const age=matches&&cache.externalReadCurrent!==false?Date.now()-cache.loadedAt:Infinity;
  if(cache&&age<CACHE_MS)return cache;
  /* Expired data is never served as current: wait for a fresh source-safe read. */
  return refreshSnapshot(binding);
}

async function resolveHrAndProtectedPrincipal(req,scope,forceFresh,protectedRequested){
  const startedAt=Date.now();
  const hrStartedAt=Date.now();
  const readModelRequested=protectedRequested&&new URL(req.url||'/', 'http://internal.invalid').searchParams.get('readModel')==='1';
  const allowDurableRead=readModelRequested&&!forceFresh;
  const hrTask=buildSnapshot({forceFresh,scope,allowDurableRead}).then(current=>({current,hrWaitMs:Date.now()-hrStartedAt}));
  if(!protectedRequested){
    const hr=await hrTask;
    return {current:hr.current,principal:null,timing:{hrWaitMs:hr.hrWaitMs}};
  }
  /* Verified identity and HR refresh are independent reads: overlap, never bypass either. */
  const principalStartedAt=Date.now();
  const principalTask=verifiedProtectedPrincipal(req,scope).then(principal=>({principal,principalVerifyMs:Date.now()-principalStartedAt}));
  const [hr,identity]=await Promise.all([hrTask,principalTask]);
  // Neither concurrent task writes. Only the authenticated presentation caller
  // may persist a verified external read; commands/anonymous/probes do not opt in.
  const current=readModelRequested&&identity.principal?.uid&&hr.current.externalReadCurrent===true
    &&hr.current.origin==='runtime_excel_online_original'
    ? {...hr.current,readModelWriteAck:await persistHrReadModel(scope,hr.current)}:hr.current;
  return {
    current,principal:identity.principal,
    timing:{hrWaitMs:hr.hrWaitMs,principalVerifyMs:identity.principalVerifyMs,parallelWaitMs:Date.now()-startedAt}
  };
}

// A revision-only read still requires a verified principal and current HR,
// but must not rehydrate the entire protected Firestore overlay. The caller
// compares the returned revision before atomically publishing any snapshot.
function protectedSnapshotRequired(format,protectedRequested){
  return protectedRequested&&format!=='meta';
}

function runtimeMeta(current){
  return {
    revision:current.revision,
    revisionStable:true,
    generatedAt:current.snapshot.generatedAt,
    sourceReadAt:new Date(current.loadedAt).toISOString(),
    externalReadCurrent:current.externalReadCurrent!==false,
    hrFreshness:{state:current.externalReadCurrent===false?'last_confirmed':'current_external_read',
      externalReadCurrent:current.externalReadCurrent!==false,sourceReadAt:new Date(current.loadedAt).toISOString(),
      readOnly:current.externalReadCurrent===false,requiresFreshExternalForCommands:true},
    durableReadModel:current.durableReadModel||null,
    sharedRefreshFailed:current.sharedRefreshFailed===true,sharedRefreshPending:current.sharedRefreshPending===true,
    lastReadModelPersistence:lastReadModelPersistence?.bindingFingerprint===current.bindingProof?.bindingFingerprint?lastReadModelPersistence:null,
    readModelWriteAck:current.readModelWriteAck||null,readModelPersistenceError:lastReadModelError,
    runtimeRead:true,
    sourceSafe:true,
    readScope:current.snapshot.readScope||null,
    periodCatalog:current.snapshot.periodCatalog||null,
    projectReadBinding:current.bindingProof||null,
    sourceAccessMode:current.snapshot.source?.accessMode||null,
    tabRegistryMode:current.snapshot.source?.tabRegistryMode||null,
    tabRegistryAutoDiscovery:current.snapshot.source?.tabRegistryAutoDiscovery===true,
    tabRegistryObservedAt:current.snapshot.source?.tabRegistryObservedAt||null,
    operationalDisplayIdentityReady:DEV_OPERATIONAL_NAMES&&Number(current.identity?.size||0)>0,
    operationalDisplayIdentityCount:DEV_OPERATIONAL_NAMES?Number(current.identity?.size||0):0,
    cacheOrigin:current.origin||null,
    cacheAgeMs:Math.max(0,Date.now()-current.loadedAt),
    cacheMs:CACHE_MS,
    refreshStartedAt:lastRefreshStartedAt,
    refreshFinishedAt:lastRefreshFinishedAt,
    refreshDurationMs:lastRefreshDurationMs,
    refreshStagesMs:lastRefreshStagesMs,
    providerReadStats:lastRefreshProviderReads,
    refreshError:lastRefreshError,
    shopperReconciliation:lastShopperReconciliation,
    visitReconciliation:lastVisitReconciliation,
    writes:current.readModelWriteAck?.published===true,
    readModelWrites:current.readModelWriteAck?.published===true,
    operationalWrites:false,
    hrWrites:false,
    imports:false,
    production:false
  };
}

// Enter the shared scheduler only after validating the request's Firebase
// principal and the local binding. Explicit reads and strict command
// verification keep their original external confirmation path.
async function sharedPresentation(req,scope,poll){
  const start=Date.now();
  const principal=await verifiedProtectedPrincipal(req,scope);
  const principalVerifyMs=Date.now()-start;
  const local=await resolveProjectHrReadBinding(scope,{localOnly:true});
  if(local.proof.providerType!=='excel_online'){
    const current=await buildSnapshot({scope,forceFresh:poll,allowDurableRead:!poll});
    return {current,principal,timing:{principalVerifyMs,hrWaitMs:Date.now()-start-principalVerifyMs}};
  }
  const {key}=durableHrReadContext(local);
  const bindingKey=crypto.createHash('sha256').update(JSON.stringify([local.proof.localBindingFingerprint,key.readerFingerprint])).digest('hex');
  const current=await readSharedHrProjection({db:principal.db,scope,bindingKey,poll,
    read:()=>recoverHrReadModel(local,{durableOnly:true}),
    refresh:async()=>{
      const observed=await buildSnapshot({scope,forceFresh:true});
      if(observed.bindingProof.localBindingFingerprint!==local.proof.localBindingFingerprint)
        throw Error('MAPPING_FAILURE:HR_SHARED_BINDING_CHANGED');
      const ack=await persistHrReadModel(scope,observed);
      if(!ack?.published&&!ack?.readModelPresent&&ack?.reason!=='newer_observation_preserved')
        throw Error('PERSISTENCE_FAILURE:HR_READ_MODEL_SHARED_PUBLISH');
      const durable=await recoverHrReadModel(local,{durableOnly:true});
      if(!durable||durable.sourceReadStartedAt<observed.sourceReadStartedAt)
        throw Error('PERSISTENCE_FAILURE:HR_READ_MODEL_SHARED_READBACK');
      if(durable.revision!==observed.revision||durable.loadedAt!==observed.loadedAt)return durable;
      return {...observed,readModelWriteAck:ack};
    }});
  return {current,principal,timing:{principalVerifyMs,hrWaitMs:Date.now()-start-principalVerifyMs}};
}

function setCommonHeaders(res,origin){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma','no-cache');
  res.setHeader('Expires','0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Vary','Origin');
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
}

function sendJson(res,status,value){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}

loadBootstrap();

const server=http.createServer(async(req,res)=>{
  const origin=String(req.headers.origin||'');
  setCommonHeaders(res,origin);
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');
    return res.end();
  }
  if(isMailboxRuntimePath(url.pathname)){
    await maybeHandleMailboxRequest(req,res,url);
    return;
  }
  if(isLegalRuntimePath(url.pathname)){
    await maybeHandleLegalRuntimeRequest(req,res,url);
    return;
  }
  if(isCertificationRuntimePath(url.pathname)){
    await maybeHandleCertificationRuntimeRequest(req,res,url,{
      ensureAdmin,
      verifyPrincipal:verifiedProtectedPrincipal,
      sendJson,
      readCurrentSnapshot:()=>buildSnapshot(),
      currentSourceRevision:()=>String(cache?.revision||'')
    });
    return;
  }
  if(isCxorbiaCommandRuntimePath(url.pathname)){
    await maybeHandleCxorbiaCommandRuntimeRequest(req,res,url,{
      configure:async command=>{
        if(['import.visits.dry_run','import.visits.commit','import.visits.read'].includes(command?.commandType)){
          // E10 reads its source authority and active membership in the operational provider.
          // Selecting an internal project must never start an Excel/Make snapshot read.
          const {auth,db}=ensureAdmin();
          return {auth,db,operationalPolicy:operationalPolicy({tenantId:command.tenantId,projectId:command.projectId})};
        }
        const hrCommands=new Set(['visit.assign','visit.reassign','visit.hr.fields.update','visit.state.update',
          'visit.reschedule','visit.cancel','visit.questionnaire.submit','application.create','application.status.update','reservation.create','reservation.status.update','visit.sync.confirm','finance.reconcile.visit','finance.historical.reconcile']);
        const scope=command?.projectId?{tenantId:command.tenantId,projectId:command.projectId,...(hrCommands.has(command?.commandType)&&command.periodId?{hrPeriodId:command.periodId}:{})}:undefined;
        const current=await buildSnapshot({forceFresh:hrCommands.has(command?.commandType),scope});
        return configureCommandRuntime(current.snapshot,current);
      },
      hrSnapshotReconcile:async input=>{
        const result=await explicitHrReconciliation(input);
        if(result.stages?.shoppers)lastShopperReconciliation={...result.stages.shoppers,sourceRevision:result.sourceRevision,receiptPath:result.receiptPath};
        if(result.stages?.visits)lastVisitReconciliation={...result.stages.visits,sourceRevision:result.sourceRevision,receiptPath:result.receiptPath};
        return result;
      }
    });
    return;
  }
  if(isLiveUserAdminPath(url.pathname)){
    await maybeHandleLiveUserAdminRequest(req,res,url);
    return;
  }
  if(req.method!=='GET')return sendJson(res,405,{ok:false,error:'method_not_allowed'});
  if(url.pathname==='/health')return sendJson(res,200,{ok:true,service:'cxorbia-live-hr-source-safe',cacheMs:CACHE_MS,bootstrapReady:Boolean(cache),revisionStable:true,autoMonthProviderRegistry:true,operationalDisplayIdentityDev:DEV_OPERATIONAL_NAMES,devFullVisualEndpoint:true,liveUserAdminSourceReady:true,legalRuntimeSourceReady:true,shopperReconciliationReady:true,visitReconciliationReady:true,lastShopperReconciliation,lastVisitReconciliation,lastRefreshError,writes:false,hrWrites:false,production:false});
  const requestedScope=hrRouteScope(url.pathname);
  if(!requestedScope)return sendJson(res,404,{ok:false,error:'not_found'});
  if(await maybeHandleDevVisualRequest(req,res,url,{sendJson}))return;
  try{
    const protectedRequestStartedAt=Date.now();
    const format=url.searchParams.get('format')||'json';
    // B14 isolated DEV application-read proof only: never substitute this for the operational HR response.
    if(format==='b14-provider-meta'){
      if(process.env.CXORBIA_I3_B14_DIRECT_READER_DEV!=='true')return sendJson(res,404,{ok:false,error:'not_found'});
      const principal=await verifiedProtectedPrincipal(req,requestedScope);
      if(!['super','admin'].includes(principal.role))return sendJson(res,403,{ok:false,error:'role_denied'});
      const countryCode=String(url.searchParams.get('countryCode')||'').toUpperCase();
      const periodId=String(url.searchParams.get('periodId')||'');
      const bindingRequest={db:principal.db,...requestedScope,countryCode,periodId,purpose:'original_readback'};
      const bound=await resolveCountryHrPeriodBinding(bindingRequest);
      const contractPath=path.join(ROOT,'backend/contracts/tya-hr-column-map-r20-v1.json');
      const columnMap=JSON.parse(fs.readFileSync(contractPath,'utf8'));
      const read=await readOriginalThroughToolbox(bound,columnMap);
      const after=await resolveCountryHrPeriodBinding(bindingRequest);
      if(after.proof.bindingFingerprint!==bound.proof.bindingFingerprint)throw Error('MAPPING_FAILURE:B14_BINDING_CHANGED_DURING_READ');
      return sendJson(res,200,{ok:true,...read.proof,bindingPurpose:'original_readback',sourceSafe:true,writes:false,hrWrites:false,production:false});
    }
    const forceFresh=url.searchParams.get('fresh')==='1';
    // An explicit refresh may discover a newly created monthly tab. Routine
    // requests reuse the scoped inventory; no historical worksheet rows are read.
    if(forceFresh&&url.searchParams.get('inventory')==='1')for(const [key,value]of hrInventoryCache)
      if(value.tenantId===requestedScope.tenantId&&value.projectId===requestedScope.projectId)hrInventoryCache.delete(key);
    const protectedRequested=url.searchParams.get('protectedState')==='1';
    const requestedPeriodId=url.searchParams.get('hrPeriodId');
    if(requestedPeriodId)requestedScope.hrPeriodId=requestedPeriodId;
    const shared=protectedRequested&&!forceFresh&&!requestedPeriodId&&url.searchParams.get('readModel')==='1';
    const {current,principal,timing}=shared
      ? await sharedPresentation(req,requestedScope,format==='meta'&&url.searchParams.get('sync')==='due')
      : await resolveHrAndProtectedPrincipal(req,requestedScope,forceFresh,protectedRequested);
    const actualScope=snapshotScope(current.snapshot);
    if(actualScope.tenantId!==requestedScope.tenantId||actualScope.projectId!==requestedScope.projectId){
      return sendJson(res,409,{ok:false,error:'hr_scope_mismatch',requested:{tenantId:requestedScope.tenantId,projectId:requestedScope.projectId},source:{tenantId:actualScope.tenantId,projectId:actualScope.projectId},writes:false,hrWrites:false,production:false});
    }
    const operational=DEV_OPERATIONAL_NAMES&&url.searchParams.get('view')==='operational-names'&&url.searchParams.get('cxOperationalPreview')===DEV_OPERATIONAL_TOKEN;
    const meta={...runtimeMeta(current),tenantId:requestedScope.tenantId,projectId:requestedScope.projectId,legacyRoute:requestedScope.legacy===true};
    let snapshot,protectedState=null;
    if(protectedSnapshotRequired(format,protectedRequested)){
      const protectedStateStartedAt=Date.now();
      const protectedView=await protectedPlatformState(current,principal,requestedScope,operational);
      meta.protectedTiming={...timing,protectedStateMs:Date.now()-protectedStateStartedAt,totalProtectedRequestMs:Date.now()-protectedRequestStartedAt};
      snapshot=protectedView.snapshot;protectedState=protectedView.protectedState;
      if(current.snapshot.source?.providerType==='excel_online')snapshot.confirmedHistory=await historyStore().read(requestedScope);
    }else{
      snapshot=operational?operationalSnapshot(current):current.snapshot;
      if(protectedRequested)meta.protectedTiming={...timing,protectedStateMs:0,totalProtectedRequestMs:Date.now()-protectedRequestStartedAt,metadataOnly:true};
    }
    res.setHeader('ETag',`"${current.revision}"`);
    res.setHeader('X-CXOrbia-Source-Revision',current.revision);
    res.setHeader('X-CXOrbia-Generated-At',current.snapshot.generatedAt||'');
    res.setHeader('X-CXOrbia-Source-Read-At',meta.sourceReadAt||'');
    res.setHeader('X-CXOrbia-Cache-Origin',current.origin||'unknown');
    res.setHeader('X-CXOrbia-Operational-Identity',operational?'display-name-only':'masked');
    if(format==='meta'){
      return sendJson(res,200,{
        ok:true,
        ...meta,
        operationalView:operational,
        periods:current.snapshot.counts?.periods??current.snapshot.periods.length,
        visits:current.snapshot.counts?.visits??current.snapshot.visits.length,
        latestPeriodKey:[...(current.snapshot.periods||[])].map(p=>p.key).filter(Boolean).sort().at(-1)||null
      });
    }
    const json=(operational||protectedRequested)?JSON.stringify(snapshot):current.json;
    if(format==='js'){
      res.statusCode=200;
      res.setHeader('Content-Type','application/javascript; charset=utf-8');
      return res.end(`window.CX_TYA_HR_SOURCE_SAFE=${json};window.CX_TYA_HR_LIVE_META=${JSON.stringify({...meta,operationalView:operational})};`);
    }
    if(protectedRequested)return sendJson(res,200,{snapshot,_protected:protectedState,_runtime:{...meta,operationalView:operational,protectedState:true}});
    return sendJson(res,200,{...snapshot,_runtime:{...meta,operationalView:operational}});
  }catch(error){
    console.error(error.stack||error.message||String(error));
    return sendJson(res,503,{ok:false,error:'live_hr_read_failed',message:String(error.message||error).slice(0,500),sourceSafe:true,lastRefreshError,writes:false,hrWrites:false,production:false});
  }
});

server.listen(PORT,'0.0.0.0',()=>console.log(`CXOrbia live HR source-safe service listening on ${PORT}`));
