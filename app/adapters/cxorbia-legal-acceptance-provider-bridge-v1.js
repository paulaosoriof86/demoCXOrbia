/* CXOrbia — legal acceptance provider bridge v1.
   SOURCE-ONLY / NOT PRODUCT-WIRED in this block.
   Keeps only provider read-model snapshots in memory and delegates human acceptance
   to CX.legalAcceptanceDurable. It never writes localStorage and never auto-accepts.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-legal-acceptance-provider-bridge-v1';
  let state=null;
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const clone=v=>JSON.parse(JSON.stringify(v));

  function clear(){state=null;return status();}

  function hydrate(input){
    const v=obj(input),durable=root.CX?.legalAcceptanceDurable;
    if(!durable?.pendingFromProviderReadModel){
      state=null;
      return Object.freeze({ok:false,status:'blocked',code:'LEGAL_DURABLE_ADAPTER_UNAVAILABLE',pending:true,providerWrites:0,legalAcceptanceWrites:0});
    }
    const evaluated=durable.pendingFromProviderReadModel({scope:v.scope,current:v.current,snapshot:v.snapshot});
    state=Object.freeze({scope:Object.freeze(clone(v.scope||{})),current:Object.freeze(clone(v.current||{})),snapshot:Object.freeze(clone(v.snapshot||{})),evaluated});
    return Object.freeze({ok:true,status:'hydrated',pending:evaluated.pending===true,accepted:evaluated.accepted===true,reasons:evaluated.reasons,providerWrites:0,legalAcceptanceWrites:0,localStorageWrite:false});
  }

  function pending(role){
    const r=String(role||'').trim();
    if(!state)return true;
    if(r&&String(state.scope?.role||'').trim()!==r)return true;
    const durable=root.CX?.legalAcceptanceDurable;
    if(!durable?.pendingFromProviderReadModel)return true;
    try{return durable.pendingFromProviderReadModel({scope:state.scope,current:state.current,snapshot:state.snapshot}).pending===true;}catch(_){return true;}
  }

  function snapshot(){return state?Object.freeze(clone(state)):null;}

  async function recordFromHumanUI(input){
    const v=obj(input),durable=root.CX?.legalAcceptanceDurable;
    if(v.humanConfirmed!==true)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_HUMAN_CONFIRMATION_REQUIRED',providerWrites:0,legalAcceptanceWrites:0,automaticAcceptance:false});
    if(!state)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_PROVIDER_SNAPSHOT_REQUIRED_BEFORE_ACCEPTANCE',providerWrites:0,legalAcceptanceWrites:0,automaticAcceptance:false});
    if(!durable?.recordHumanAcceptance)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_DURABLE_ADAPTER_UNAVAILABLE',providerWrites:0,legalAcceptanceWrites:0,automaticAcceptance:false});
    return durable.recordHumanAcceptance({scope:state.scope,current:state.current,humanConfirmed:true,idempotencyKey:String(v.idempotencyKey||'').trim()});
  }

  function status(){
    return Object.freeze({version:VERSION,sourceOnly:true,activated:false,productEntrypointWired:false,providerSnapshotMemoryOnly:true,localStorageAuthority:false,localStorageWrites:0,automaticAcceptance:false,humanAcceptanceOnly:true,failClosedWithoutSnapshot:true,providerWrites:0,legalAcceptanceWrites:0,nextGate:'PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME'});
  }

  root.CX.legalAcceptanceProviderBridge=Object.freeze({version:VERSION,hydrate,pending,snapshot,recordFromHumanUI,clear,status});
})(typeof window!=='undefined'?window:globalThis);
