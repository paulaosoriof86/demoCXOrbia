import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {createG2BSyntheticVisitProvider,EXPECTED_PREFIX} from '../cxorbia-g2b-synthetic-visit-provider-v1.mjs';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const EXPECTED_TENANT='tya';
const EXPECTED_PROJECT_SCOPE='cinepolis';
const MAX_BODY_BYTES=64*1024;
const WRITE_ENABLE_ENV='CXORBIA_G2B_SYNTHETIC_WRITE_ENABLED';
const WRITE_GATE_ENV='CXORBIA_G2B_SYNTHETIC_WRITE_GATE';
const REQUEST_ENV='CXORBIA_G2B_SYNTHETIC_REQUEST_ID';
const EXPECTED_GATE='PAULA_I5_G2B_SYNTHETIC_CANONICAL_WRITE_PATH';
const EXPECTED_REQUEST='i5-g2b-live-synthetic-acceptance-20260820-01';
const str=v=>String(v==null?'':v).trim();

function fail(code,statusCode=400){const e=new Error(code);e.code=code;e.statusCode=statusCode;throw e;}
function projectId(){return str(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||EXPECTED_PROJECT);}
function ensureAdmin(){const p=projectId();if(p!==EXPECTED_PROJECT)fail('G2B_SYNTHETIC_TARGET_PROJECT_INVALID',503);if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:p});return{auth:getAuth(),db:getFirestore()};}
function bearer(req){const m=str(req.headers.authorization).match(/^Bearer\s+(.+)$/i);return m?str(m[1]):'';}
async function readJson(req){let size=0,raw='';for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY_BYTES)fail('G2B_SYNTHETIC_BODY_TOO_LARGE',413);raw+=chunk.toString('utf8');}if(!raw.trim())return{};try{return JSON.parse(raw);}catch{fail('G2B_SYNTHETIC_INVALID_JSON',400);}}
function sendJson(res,status,value){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));}
function runtimeGate(){
  const enabled=process.env[WRITE_ENABLE_ENV]==='true'&&str(process.env[WRITE_GATE_ENV])===EXPECTED_GATE&&str(process.env[REQUEST_ENV])===EXPECTED_REQUEST;
  return {schemaVersion:'cxorbia.g2b.synthetic-lifecycle-write-gate.v1',repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,firebaseProjectId:EXPECTED_PROJECT,tenantId:EXPECTED_TENANT,projectId:EXPECTED_PROJECT_SCOPE,enabled,authorizedBy:'Paula',requestId:EXPECTED_REQUEST,syntheticDataOnly:true,syntheticTagPrefix:EXPECTED_PREFIX,realHrVisitMutationAllowed:false,externalHrWrites:0,realDataWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,storageWrites:0,merge:false,automaticRetryAllowed:false};
}
function safeError(error){const raw=str(error?.code||error?.message);const safe=/^(?:G2B|I4B)_[A-Z0-9_:,-]+$/.test(raw)?raw.split(':')[0]:'G2B_SYNTHETIC_COMMAND_FAILED';return{ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,error:safe,code:safe,syntheticOnly:true};}

export function isG2BSyntheticRuntimePath(pathname){return /^\/(?:api|v1)\/tenants\/[^/]+\/projects\/[^/]+\/g2b-synthetic\/commands$/.test(String(pathname||''));}

export async function maybeHandleG2BSyntheticRuntimeRequest(req,res,url){
  const m=String(url.pathname||'').match(/^\/(?:api|v1)\/tenants\/([^/]+)\/projects\/([^/]+)\/g2b-synthetic\/commands$/);if(!m)return false;
  const tenantId=decodeURIComponent(m[1]),projectId=decodeURIComponent(m[2]);
  if(tenantId!==EXPECTED_TENANT||projectId!==EXPECTED_PROJECT_SCOPE){sendJson(res,404,{ok:false,error:'G2B_SYNTHETIC_SCOPE_NOT_AVAILABLE'});return true;}
  if(req.method!=='POST'){sendJson(res,405,{ok:false,error:'method_not_allowed'});return true;}
  const gate=runtimeGate();if(!gate.enabled){sendJson(res,423,{ok:false,error:'G2B_SYNTHETIC_WRITE_GATE_DISABLED',syntheticOnly:true});return true;}
  const token=bearer(req);if(!token){sendJson(res,401,{ok:false,error:'G2B_SYNTHETIC_AUTHORIZATION_REQUIRED',syntheticOnly:true});return true;}
  try{
    const body=await readJson(req);const command=body?.command&&typeof body.command==='object'?body.command:body;
    if(!command||typeof command!=='object')fail('G2B_SYNTHETIC_COMMAND_REQUIRED',400);
    const {auth,db}=ensureAdmin();const provider=createG2BSyntheticVisitProvider({auth,db,gate});
    const result=await provider.execute(token,command);sendJson(res,result?.ok===true?200:409,{...result,syntheticOnly:true,rawToken:false,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0});return true;
  }catch(error){const status=Number(error?.statusCode)||(/AUTHORIZATION|ACTOR_/.test(str(error?.message))?403:409);if(status>=500)console.error('CXOrbia G2-B synthetic runtime failed');sendJson(res,status,safeError(error));return true;}
}

export function g2bSyntheticRuntimeSourceStatus(){return Object.freeze({targetProject:EXPECTED_PROJECT,tenantId:EXPECTED_TENANT,projectId:EXPECTED_PROJECT_SCOPE,endpointPrepared:true,writeEnabledBySource:false,writeRequiresRuntimeEnvGate:true,expectedRuntimeGate:EXPECTED_GATE,syntheticOnly:true,syntheticTagPrefix:EXPECTED_PREFIX,requestId:EXPECTED_REQUEST,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,merge:false});}
