import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {createF5SyntheticAcceptanceProvider,SYNTHETIC_PREFIX,SYNTHETIC_PROJECT_ID} from '../cxorbia-f5-synthetic-acceptance-provider-v1.mjs';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const EXPECTED_TENANT='tya';
const EXPECTED_CONTROL_PROJECT='cinepolis';
const MAX_BODY_BYTES=64*1024;
const WRITE_ENABLE_ENV='CXORBIA_G2B_SYNTHETIC_WRITE_ENABLED';
const WRITE_GATE_ENV='CXORBIA_G2B_SYNTHETIC_WRITE_GATE';
const REQUEST_ENV='CXORBIA_G2B_SYNTHETIC_REQUEST_ID';
const AUTHORIZATION_ENV='CXORBIA_F5_SYNTHETIC_AUTHORIZATION_ID';
const EXPECTED_GATE='PAULA_F5_SYNTHETIC_ACCEPTANCE_CANONICAL_WRITE_PATH';
const REQUEST_PREFIX='CXORBIA-F5-SYNTHETIC-ACCEPTANCE-';
const AUTH_PREFIX='CXORBIA-F5-AUTH-';
const str=v=>String(v==null?'':v).trim();

function fail(code,statusCode=400){const e=new Error(code);e.code=code;e.statusCode=statusCode;throw e;}
function projectId(){return str(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||EXPECTED_PROJECT);}
function ensureAdmin(){const p=projectId();if(p!==EXPECTED_PROJECT)fail('F5_SYNTHETIC_TARGET_PROJECT_INVALID',503);if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:p});return{auth:getAuth(),db:getFirestore()};}
function bearer(req){const m=str(req.headers.authorization).match(/^Bearer\s+(.+)$/i);return m?str(m[1]):'';}
async function readJson(req){let size=0,raw='';for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY_BYTES)fail('F5_SYNTHETIC_BODY_TOO_LARGE',413);raw+=chunk.toString('utf8');}if(!raw.trim())return{};try{return JSON.parse(raw);}catch{fail('F5_SYNTHETIC_INVALID_JSON',400);}}
function sendJson(res,status,value){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));}
function runtimeGate(){
  const requestId=str(process.env[REQUEST_ENV]),authorizationId=str(process.env[AUTHORIZATION_ENV]);
  const enabled=process.env[WRITE_ENABLE_ENV]==='true'&&str(process.env[WRITE_GATE_ENV])===EXPECTED_GATE&&requestId.startsWith(REQUEST_PREFIX)&&authorizationId.startsWith(AUTH_PREFIX);
  return {schemaVersion:'cxorbia.f5.synthetic-acceptance-gate.v1',repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',firebaseProjectId:EXPECTED_PROJECT,tenantId:EXPECTED_TENANT,controlProjectId:EXPECTED_CONTROL_PROJECT,syntheticProjectId:SYNTHETIC_PROJECT_ID,enabled,authorizedBy:'Paula',requestId,authorizationId,syntheticDataOnly:true,syntheticTagPrefix:SYNTHETIC_PREFIX,cleanupRequired:true,postCleanupReadbackRequired:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,automaticRetryAllowed:false};
}
function safeError(error){const raw=str(error?.code||error?.message);const safe=/^(?:F5|G2B|I4B)_[A-Z0-9_:,-]+$/.test(raw)?raw.split(':')[0]:'F5_SYNTHETIC_COMMAND_FAILED';return{ok:false,status:'blocked',committed:false,providerAck:false,providerWrites:0,error:safe,code:safe,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};}

export function isG2BSyntheticRuntimePath(pathname){return /^\/(?:api|v1)\/tenants\/[^/]+\/projects\/[^/]+\/g2b-synthetic\/commands$/.test(String(pathname||''));}

export async function maybeHandleG2BSyntheticRuntimeRequest(req,res,url){
  const m=String(url.pathname||'').match(/^\/(?:api|v1)\/tenants\/([^/]+)\/projects\/([^/]+)\/g2b-synthetic\/commands$/);if(!m)return false;
  const tenantId=decodeURIComponent(m[1]),controlProjectId=decodeURIComponent(m[2]);
  if(tenantId!==EXPECTED_TENANT||controlProjectId!==EXPECTED_CONTROL_PROJECT){sendJson(res,404,{ok:false,error:'F5_SYNTHETIC_SCOPE_NOT_AVAILABLE'});return true;}
  if(req.method!=='POST'){sendJson(res,405,{ok:false,error:'method_not_allowed'});return true;}
  const gate=runtimeGate();if(!gate.enabled){sendJson(res,423,{ok:false,error:'F5_SYNTHETIC_WRITE_GATE_DISABLED',syntheticOnly:true});return true;}
  const token=bearer(req);if(!token){sendJson(res,401,{ok:false,error:'F5_SYNTHETIC_AUTHORIZATION_REQUIRED',syntheticOnly:true});return true;}
  try{
    const body=await readJson(req),operation=str(body.operation).toUpperCase(),ids=body.ids&&typeof body.ids==='object'?body.ids:{};
    if(!operation)fail('F5_SYNTHETIC_OPERATION_REQUIRED',400);
    if(str(body.syntheticProjectId||SYNTHETIC_PROJECT_ID)!==SYNTHETIC_PROJECT_ID)fail('F5_SYNTHETIC_PROJECT_SCOPE_MISMATCH',409);
    const {auth,db}=ensureAdmin(),provider=createF5SyntheticAcceptanceProvider({auth,db,gate});
    let result;
    if(operation==='SEED')result=await provider.seed(token,ids);
    else if(['ASSIGN','CONFIRM','CHECK_IN','SUBMIT_RESULT','REVIEW_RESULT','APPROVE_RESULT'].includes(operation))result=await provider.execute(token,operation,ids,body.payload||{});
    else if(operation==='READBACK')result=await provider.readback(token,ids);
    else if(operation==='CLEANUP')result=await provider.cleanup(token,ids);
    else if(operation==='POST_CLEANUP_READBACK'){
      result=await provider.readback(token,ids);
      if(result?.ok===true){const artifacts=['visit','shopper','result','review','approval'];const remaining=artifacts.filter(k=>result[k]?.exists===true);result={...result,status:remaining.length?'POST_CLEANUP_RESIDUAL':'POST_CLEANUP_PASS',ok:remaining.length===0,remaining};}
    }else fail('F5_SYNTHETIC_OPERATION_INVALID',400);
    sendJson(res,result?.ok===true?200:409,{...result,syntheticOnly:true,syntheticProjectId:SYNTHETIC_PROJECT_ID,rawToken:false,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0});return true;
  }catch(error){const status=Number(error?.statusCode)||(/AUTHORIZATION|ACTOR_|MEMBERSHIP/.test(str(error?.message))?403:409);if(status>=500)console.error('CXOrbia F5 synthetic runtime failed');sendJson(res,status,safeError(error));return true;}
}

export function g2bSyntheticRuntimeSourceStatus(){const gate=runtimeGate();return Object.freeze({targetProject:EXPECTED_PROJECT,tenantId:EXPECTED_TENANT,controlProjectId:EXPECTED_CONTROL_PROJECT,syntheticProjectId:SYNTHETIC_PROJECT_ID,endpointPrepared:true,writeEnabled:gate.enabled,writeRequiresRuntimeEnvGate:true,expectedRuntimeGate:EXPECTED_GATE,syntheticOnly:true,syntheticTagPrefix:SYNTHETIC_PREFIX,requestId:gate.requestId||null,authorizationId:gate.authorizationId||null,cleanupRequired:true,postCleanupReadbackRequired:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,merge:false});}