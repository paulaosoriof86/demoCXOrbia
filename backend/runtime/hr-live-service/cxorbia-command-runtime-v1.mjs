#!/usr/bin/env node
/* CXOrbia Recovery I2 command runtime shim.
   Import side effects: zero writes, zero provider initialization.
*/
import { createProjectCommandProvider } from '../cxorbia-project-command-provider-v1.mjs';
import { createOperationalCommandProvider } from '../cxorbia-operational-command-provider-v1.mjs';

export const VERSION='cxorbia-command-runtime-v1';
const ROUTE='/v1/cxorbia/commands';
const str=v=>String(v==null?'':v).trim();
const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,code,production:false,...extra});

export function isCxorbiaCommandRuntimePath(pathname){
  return pathname===ROUTE;
}

async function readJson(req){
  let raw='';
  for await(const chunk of req){
    raw+=chunk;
    if(raw.length>131072)throw new Error('COMMAND_BODY_TOO_LARGE');
  }
  return raw?JSON.parse(raw):{};
}

async function maybeCreateProvider(command){
  const policy=globalThis.CXORBIA_COMMAND_PROVIDER_POLICY||null;
  const auth=globalThis.CXORBIA_COMMAND_AUTH||null;
  const db=globalThis.CXORBIA_COMMAND_DB||null;
  if(!policy||!auth||!db)return {provider:null,error:'COMMAND_PROVIDER_NOT_CONFIGURED'};
  if(['project.create','project.update'].includes(str(command.commandType))){
    return {provider:createProjectCommandProvider({auth,db,policy})};
  }
  return {provider:createOperationalCommandProvider({auth,db,policy})};
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
    const {provider,error}=await maybeCreateProvider(command);
    if(!provider)return json(res,409,blocked(error,{commandType:command?.commandType||null,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null}));
    const result=await provider.execute(token,command);
    return json(res,result?.ok===true?200:409,result);
  }catch(error){
    return json(res,409,blocked(str(error?.message||error)));
  }
}
