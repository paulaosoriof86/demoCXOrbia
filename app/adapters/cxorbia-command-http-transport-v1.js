/* CXOrbia — authenticated HTTP command transport v1.
   Reusable transport behind CX.commandAdapter. It never enables writes by itself.
   Provider execution still requires CX.BACKEND.enableCommandWrites===true and a configured endpoint.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-command-http-transport-v1';
  const NAME='firebase-authenticated-command-http-v1';
  const str=v=>String(v==null?'':v).trim();
  function localHost(){return ['127.0.0.1','localhost'].includes(String(root.location?.hostname||''));}
  function endpoint(){
    const configured=str(CX.BACKEND?.commandEndpoint||'');
    const localOverride=localHost()?str(root.CX_COMMAND_ENDPOINT_OVERRIDE||''):'';
    return localOverride||configured;
  }
  async function idToken(){
    if(!root.firebase?.auth)throw new Error('COMMAND_AUTH_SDK_REQUIRED');
    const user=firebase.auth().currentUser;
    if(!user)throw new Error('COMMAND_AUTH_PRINCIPAL_REQUIRED');
    return user.getIdToken(false);
  }
  async function execute(command){
    const url=endpoint();
    if(!url)return {ok:false,status:'blocked',providerAck:false,code:'COMMAND_ENDPOINT_NOT_CONFIGURED',successUiAllowed:false,localMutation:false,localStorageWrite:false};
    const token=await idToken();
    const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token,'cache-control':'no-store'},body:JSON.stringify(command),cache:'no-store',credentials:'omit'});
    let body={};
    try{body=await response.json();}catch(_){body={};}
    if(!response.ok)return Object.assign({ok:false,status:'blocked',providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code:'COMMAND_PROVIDER_HTTP_'+response.status},body||{});
    return body;
  }
  function activate(){
    if(!CX.commandAdapter?.registerTransport)return false;
    try{CX.commandAdapter.registerTransport(NAME,{version:VERSION,execute});}catch(error){if(!/TRANSPORT/.test(String(error?.message||'')))throw error;}
    if(endpoint())CX.commandAdapter.useTransport(NAME);
    root.CX_COMMAND_HTTP_TRANSPORT={ready:true,version:VERSION,name:NAME,endpointConfigured:Boolean(endpoint()),writesEnabled:CX.commandAdapter.writesEnabled?.()===true,localMutation:false,localStoragePersistence:false,at:new Date().toISOString()};
    return true;
  }
  CX.commandHttpTransport=Object.freeze({version:VERSION,name:NAME,activate,endpoint,execute});
  if(!activate())setTimeout(activate,0);
})(typeof window!=='undefined'?window:globalThis);
