#!/usr/bin/env node
/* I4-B E2E harness helper. Source-only: it cannot initialize Firebase or write by itself.
   Root correction after run 32286832002: provider is an explicit parameter, never a hidden/global variable. */
export function assertProvider(provider){
  if(!provider||typeof provider.execute!=='function')throw new Error('I4B_E2E_PROVIDER_INSTANCE_REQUIRED');
  return provider;
}
export async function executeProviderCommand({provider,token,command,label='command'}={}){
  assertProvider(provider);
  if(!token)throw new Error('I4B_E2E_TOKEN_REQUIRED:'+label);
  if(!command||typeof command!=='object')throw new Error('I4B_E2E_COMMAND_REQUIRED:'+label);
  const out=await provider.execute(token,command);
  const committed=out?.ok===true&&out?.status==='committed'&&out?.providerAck===true&&out?.successUiAllowed===true;
  if(!committed)throw new Error('I4B_E2E_PROVIDER_ACK_FAILED:'+label+':'+String(out?.code||''));
  return out;
}
export function harnessStatus(){return Object.freeze({version:'cxorbia-i4b-e2e-harness-v1',providerPassedExplicitly:true,globalProviderDependency:false,providerWrites:0});}
