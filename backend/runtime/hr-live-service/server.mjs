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
import { academyProgressSnapshot, academyProgressCatalog } from '../cxorbia-academy-command-provider-v1.mjs';
import { resolveCountryHrPeriodBinding } from '../cxorbia-country-hr-binding-v1.mjs';
import { readExcelPeriodThroughMake, withMakeGraphToolboxReader } from '../cxorbia-make-graph-provider-v1.mjs';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot} from '../cxorbia-excel-operational-snapshot-v1.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../..');
const PORT=Number(process.env.PORT||8080);
const CACHE_MS=Math.max(5000,Math.min(15000,Number(process.env.CXORBIA_LIVE_HR_CACHE_MS||5000)));
const BOOTSTRAP_FILE=path.join(ROOT,'app/data/tya-hr-source-safe-periods.js');
const REGISTRY_FILE=path.join(ROOT,'backend/config/tya-live-hr-tab-registry.source-safe.json');
const FIREBASE_PROJECT=String(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||'').trim();
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

function materialize(snapshot,origin,identity=new Map()){
  const json=JSON.stringify(snapshot);
  const identityStable=[...identity.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).map(([id,value])=>[id,stableRevisionValue(value)]);
  const stableJson=JSON.stringify({snapshot:stableRevisionValue(snapshot),shopperIdentity:identityStable});
  const revision=crypto.createHash('sha256').update(stableJson).digest('hex');
  return {snapshot,json,revision,loadedAt:Date.now(),origin,identity};
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
const SAFE_PROJECT_CONFIG_KEYS=Object.freeze(['name','client','industry','sucursales','countries','currency','currencies','honorario','honorarioRecibe','honRecibe','boleto','comboAmt','modelo','isr','regalias','periodicidad','periodoCumpl','scenarios','scenarioDimensions','quincenas','cuestionario','questionnaireProgramsByPeriod']);
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

// VRM-358: this existing reader is a scoped adapter. Resolve its configured
// private binding BEFORE reading HR; never borrow a global workbook or another
// project's cache. Other adapters must supply their own proved mapping.
async function resolveProjectHrReadBinding(requestedScope,{db=ensureAdmin().db,root=ROOT}={}){
  const fail=code=>{throw new Error('MAPPING_FAILURE:HR_BINDING_'+code);};
  const mappingFile=path.join(root,'backend/contracts/tya-hr-column-map-r20-v1.json');
  const mappingBytes=fs.readFileSync(mappingFile),mapping=JSON.parse(mappingBytes);
  const scope=requestedScope||{tenantId:mapping.tenantId,projectId:mapping.projectId};
  const valid=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,200}$/.test(v);
  if(!valid(scope?.tenantId)||!valid(scope?.projectId))fail('INVALID_SCOPE');
  if(scope.tenantId!==mapping.tenantId||scope.projectId!==mapping.projectId)fail('ADAPTER_SCOPE_UNSUPPORTED');
  const project=await db.doc('tenants/'+scope.tenantId+'/projects/'+scope.projectId).get();
  if(!project.exists)fail('PROJECT_MISSING');
  const raw=project.data()||{},selected=raw.operationalSource?'operationalSource':'routeSource',source=raw[selected]||{};
  if(raw.tenantId!==scope.tenantId||(raw.projectId&&raw.projectId!==scope.projectId))fail('PROJECT_SCOPE');
  // I3/F2 P0: respect the project's durable Excel selection. Never silently
  // fall back to the obsolete Google mirror after this source is selected.
  if(source.providerType==='excel_online')return resolveExcelOriginalProjectPlan({db,scope});
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

async function protectedPlatformState(current,principal,scope,operational){
  const snapshot=operational?operationalSnapshot(current):JSON.parse(JSON.stringify(current.snapshot));
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
function configureCommandRuntime(snapshot){
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
  globalThis.CXORBIA_COMMAND_HR_REVISION=String(cache?.revision||'');
  // Server-side only: the identity file is produced with this exact fresh HR
  // snapshot. Protected provider comparisons must not use masked public names.
  globalThis.CXORBIA_COMMAND_HR_PRIVATE_IDENTITY=cache?.identity instanceof Map?cache.identity:null;
}
const explicitHrReconciliation=createHrSnapshotReconciler({
  verifyPrincipal:verifiedProtectedPrincipal,
  readSnapshot:scope=>buildSnapshot({forceFresh:true,scope}),
  ensureAdmin,shopperPolicy,operationalPolicy
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
      const columnMap=JSON.parse(fs.readFileSync(path.join(ROOT,'backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
      const cinemaRegistry=JSON.parse(fs.readFileSync(path.join(ROOT,'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json'),'utf8'));
      const source=await withOriginalToolboxReader(runScenario=>readExcelOriginalProjectSnapshot({db:ensureAdmin().db,plan:binding,columnMap,cinemaRegistry,
        readBinding:countryPeriod=>readExcelPeriodThroughMake({binding:countryPeriod,columnMap,runScenario})}));
      stagesMs.readOriginalExcel=Date.now()-stageStart;
      const current=await withDurableProjectConfig(source.snapshot);
      const after=await resolveProjectHrReadBinding(binding.scope);
      if(after.proof.bindingFingerprint!==binding.proof.bindingFingerprint)
        throw Error('MAPPING_FAILURE:EXCEL_BINDING_CHANGED_DURING_READ');
      const actual=snapshotScope(current);
      if(actual.tenantId!==binding.scope.tenantId||actual.projectId!==binding.scope.projectId)
        throw Error('MAPPING_FAILURE:EXCEL_OPERATIONAL_SCOPE_DRIFT');
      const next=materialize(current,'runtime_excel_online_original',source.identity);
      next.bindingProof={...binding.proof,readerCount:source.proof.periodReads,
        runtimeConsumptionVerified:true,sourceRevision:source.proof.sourceRevision,rawRowsExposed:false};
      cache=next;
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

async function buildSnapshot({forceFresh=false,scope}={}){
  const binding=await resolveProjectHrReadBinding(scope);
  if(forceFresh)return refreshSnapshot(binding);
  if(cache?.origin==='build_bootstrap')return refreshSnapshot(binding);
  if(cache?.bindingProof?.bindingFingerprint!==binding.proof.bindingFingerprint)return refreshSnapshot(binding);
  const age=cache?Date.now()-cache.loadedAt:Infinity;
  if(cache&&age<CACHE_MS)return cache;
  /* Expired data is never served as current: wait for a fresh source-safe read. */
  return refreshSnapshot(binding);
}

async function resolveHrAndProtectedPrincipal(req,scope,forceFresh,protectedRequested){
  const startedAt=Date.now();
  const hrStartedAt=Date.now();
  const hrTask=buildSnapshot({forceFresh,scope}).then(current=>({current,hrWaitMs:Date.now()-hrStartedAt}));
  if(!protectedRequested){
    const hr=await hrTask;
    return {current:hr.current,principal:null,timing:{hrWaitMs:hr.hrWaitMs}};
  }
  /* Verified identity and HR refresh are independent reads: overlap, never bypass either. */
  const principalStartedAt=Date.now();
  const principalTask=verifiedProtectedPrincipal(req,scope).then(principal=>({principal,principalVerifyMs:Date.now()-principalStartedAt}));
  const [hr,identity]=await Promise.all([hrTask,principalTask]);
  return {
    current:hr.current,principal:identity.principal,
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
    runtimeRead:true,
    sourceSafe:true,
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
    writes:false,
    hrWrites:false,
    imports:false,
    production:false
  };
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
        if(command?.commandType==='visit.sync.confirm')await buildSnapshot({forceFresh:true,scope:{tenantId:command.tenantId,projectId:command.projectId}});
        if(['client.nps.submit','client.note.create','client.meeting.request'].includes(command?.commandType))await buildSnapshot();
        configureCommandRuntime(cache?.snapshot);
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
    const protectedRequested=url.searchParams.get('protectedState')==='1';
    const {current,principal,timing}=await resolveHrAndProtectedPrincipal(req,requestedScope,forceFresh,protectedRequested);
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
