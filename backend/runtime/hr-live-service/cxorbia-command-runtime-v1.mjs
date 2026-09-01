#!/usr/bin/env node
/* CXOrbia Recovery I2 command runtime shim.
   Import side effects: zero writes, zero provider initialization.
*/
import { createProjectCommandProvider } from '../cxorbia-project-command-provider-v1.mjs';
import { createOperationalCommandProvider } from '../cxorbia-operational-command-provider-v1.mjs';

export const VERSION='cxorbia-command-runtime-v1';
const ROUTE='/v1/cxorbia/commands';
const PROJECT_COMMANDS=new Set(['project.create','project.update']);
const str=v=>String(v==null?'':v).trim();
const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,code,production:false,...extra});

export function isCxorbiaCommandRuntimePath(pathname){
  return pathname===ROUTE;
}

export function commandProviderKind(commandType){
  return PROJECT_COMMANDS.has(str(commandType))?'project':'operational';
}

async function readJson(req){
  let raw='';
  for await(const chunk of req){
    raw+=chunk;
    if(raw.length>131072)throw new Error('COMMAND_BODY_TOO_LARGE');
  }
  return raw?JSON.parse(raw):{};
}

export function createProviderForCommand(command,overrides={}){
  const kind=commandProviderKind(command?.commandType);
  const auth=overrides.auth??globalThis.CXORBIA_COMMAND_AUTH??null;
  const db=overrides.db??globalThis.CXORBIA_COMMAND_DB??null;
  const projectPolicy=overrides.projectPolicy??globalThis.CXORBIA_PROJECT_COMMAND_PROVIDER_POLICY??null;
  const operationalPolicy=overrides.operationalPolicy??globalThis.CXORBIA_OPERATIONAL_COMMAND_PROVIDER_POLICY??null;
  if(!auth||!db)return {provider:null,kind,error:'COMMAND_PROVIDER_DEPENDENCIES_NOT_CONFIGURED'};
  if(kind==='project'){
    if(!projectPolicy)return {provider:null,kind,error:'PROJECT_COMMAND_PROVIDER_NOT_CONFIGURED'};
    try{return {provider:createProjectCommandProvider({auth,db,policy:projectPolicy}),kind};}
    catch(error){return {provider:null,kind,error:'PROJECT_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
  }
  if(!operationalPolicy)return {provider:null,kind,error:'OPERATIONAL_COMMAND_PROVIDER_NOT_CONFIGURED'};
  try{return {provider:createOperationalCommandProvider({auth,db,policy:operationalPolicy}),kind};}
  catch(error){return {provider:null,kind,error:'OPERATIONAL_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
}

export async function maybeHandleCxorbiaCommandRuntimeRequest(req,res,url){
  if(!isCxorbiaCommandRuntimePath(url.pathname))return false;
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');
    res.end();
    return true;
  }
  if(req.method!=='POST'){
    json(res,405,blocked('COMMAND_METHOD_NOT_ALLOWED'));
    return true;
  }
  try{
    const token=str(req.headers.authorization).replace(/^Bearer\s+/i,'');
    if(!token)return json(res,401,blocked('COMMAND_BEARER_REQUIRED'));
    const command=await readJson(req);
    const {provider,error,kind,detail}=createProviderForCommand(command);
    if(!provider)return json(res,409,blocked(error,{providerKind:kind,detail:detail||null,commandType:command?.commandType||null,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null}));
    const result=await provider.execute(token,command);
    return json(res,result?.ok===true?200:409,result);
  }catch(error){
    return json(res,409,blocked(str(error?.message||error)));
  }
}
