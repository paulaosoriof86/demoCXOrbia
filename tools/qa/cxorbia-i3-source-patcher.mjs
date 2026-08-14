#!/usr/bin/env node
import fs from 'node:fs';
const mode=process.argv[2]||'--verify';
const files={index:'app/index-backend-dev.html',shoppers:'app/modules/shoppers.js',provider:'backend/runtime/cxorbia-shopper-command-provider-v1.mjs'};
const ensure=(v,c)=>{if(!v)throw new Error(c);};
function once(source,oldText,newText,code){const n=source.split(oldText).length-1;ensure(n===1,code+'_COUNT_'+n);return source.replace(oldText,newText);}
function patched(){
  let index=fs.readFileSync(files.index,'utf8');
  if(!index.includes('adapters/cxorbia-shopper-membership-wiring-v1.js'))index=once(index,'<script src="adapters/tya-c6-live-user-admin-membership-wiring-v1.js"></script>','<script src="adapters/tya-c6-live-user-admin-membership-wiring-v1.js"></script>\n<script src="adapters/cxorbia-shopper-membership-wiring-v1.js"></script>','INDEX_SHOPPER_MEMBERSHIP_INSERT');
  if(!index.includes('adapters/cxorbia-command-http-transport-v1.js'))index=once(index,'<script src="adapters/cxorbia-command-adapter-v1.js"></script>','<script src="adapters/cxorbia-command-adapter-v1.js"></script>\n<script src="adapters/cxorbia-command-http-transport-v1.js"></script>','INDEX_COMMAND_TRANSPORT_INSERT');

  let shoppers=fs.readFileSync(files.shoppers,'utf8');
  if(!shoppers.includes('i3-admin-shopper-create')){
    shoppers=once(shoppers,"ov.querySelector('#al_save').addEventListener('click',()=>{","ov.querySelector('#al_save').addEventListener('click',async()=>{",'SHOPPER_CREATE_HANDLER_ASYNC');
    const oldCreate=`data.addShopper({via:'manual', estado:'Pendiente', firstName:first, lastName:last, whatsapp:wa,\n          pais:geo.pais, depto:geo.depto, ciudad:geo.ciudad,\n          email:(ov.querySelector('#al_mail').value||'').trim(),\n          edad:(ov.querySelector('#al_edad').value||'').trim(),\n          sexo:ov.querySelector('#al_sexo').value||''});\n        close(); CX.ui.toast('Shopper creado · el resto del perfil lo completa al ingresar','ok',3600);`;
    const newCreate=`let result;\n        try{result=await data.addShopper({via:'manual', estado:'Pendiente', firstName:first, lastName:last, whatsapp:wa,\n          pais:geo.pais, depto:geo.depto, ciudad:geo.ciudad,\n          email:(ov.querySelector('#al_mail').value||'').trim(),\n          edad:(ov.querySelector('#al_edad').value||'').trim(),\n          sexo:ov.querySelector('#al_sexo').value||'',\n          __commandMeta:{ackAware:true,reason:'i3-admin-shopper-create'}});}catch(error){CX.ui.toast('No se pudo crear el shopper: '+(error?.message||'persistencia bloqueada'),'err',4200);return;}\n        if(!result?.ok||result?.providerAck!==true||result?.successUiAllowed!==true){CX.ui.toast('Shopper no creado · el proveedor no confirmó persistencia','warn',4200);return;}\n        try{await CX.backend?.refresh?.();}catch(_){}\n        close(); CX.ui.toast('Shopper creado y confirmado por el backend','ok',3600);`;
    shoppers=once(shoppers,oldCreate,newCreate,'SHOPPER_CREATE_ACK_PATCH');
  }
  if(!shoppers.includes('i3-admin-shopper-update')){
    shoppers=once(shoppers,"host.querySelector('#ed_save').addEventListener('click',()=>{","host.querySelector('#ed_save').addEventListener('click',async()=>{",'SHOPPER_UPDATE_HANDLER_ASYNC');
    const oldUpdate=`data.updateShopper(s.id,patch);\n          CX.ui.toast('Perfil actualizado','ok');\n          close(); CX.router.nav('shoppers');`;
    const newUpdate=`patch.__commandMeta={ackAware:true,reason:'i3-admin-shopper-update'};\n          let result;try{result=await data.updateShopper(s.id,patch);}catch(error){CX.ui.toast('No se pudo actualizar: '+(error?.message||'persistencia bloqueada'),'err',4200);return;}\n          if(!result?.ok||result?.providerAck!==true||result?.successUiAllowed!==true){CX.ui.toast('Perfil no actualizado · el proveedor no confirmó persistencia','warn',4200);return;}\n          try{await CX.backend?.refresh?.();}catch(_){}\n          CX.ui.toast('Perfil actualizado y confirmado por el backend','ok');\n          close(); CX.router.nav('shoppers');`;
    shoppers=once(shoppers,oldUpdate,newUpdate,'SHOPPER_UPDATE_ACK_PATCH');
  }

  let provider=fs.readFileSync(files.provider,'utf8');
  const bad="fs.mkdirSync(new URL('file://'+PRIVATE_NEW).pathname.split('/').slice(0,-1).join('/')||'.',{recursive:true});";
  if(provider.includes(bad))provider=provider.replace(bad,"fs.mkdirSync(PRIVATE_NEW.split('/').slice(0,-1).join('/')||'.',{recursive:true});");
  const oldMembership="const ms=await memberRef.get();if(ms.exists){const m=ms.data()||{};if(m.tenantId!==r.tenantId||m.role!=='shopper'||m.authNamespace!=='shopper'||m.shopperId!==shopperId)throw new Error('I3_HISTORICAL_MEMBERSHIP_CONFLICT');}else{await memberRef.set(membershipDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId)));writes++;}";
  const newMembership="const ms=await memberRef.get();const desiredMembership=membershipDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId));if(ms.exists){const m=ms.data()||{};if(m.tenantId!==r.tenantId||m.role!=='shopper'||m.authNamespace!=='shopper'||m.shopperId!==shopperId)throw new Error('I3_HISTORICAL_MEMBERSHIP_CONFLICT');const needs=m.active!==true||JSON.stringify(uniq(m.projectIds))!==JSON.stringify([r.projectId])||str(m.providerUidFingerprint)!==uidFingerprint(user.uid)||str(m.claimsDigest)!==claimsDigest(canonicalClaims(shopperId,r.tenantId,r.projectId));if(needs){await memberRef.set(desiredMembership,{merge:true});writes++;}}else{await memberRef.set(desiredMembership);writes++;}";
  if(provider.includes(oldMembership))provider=provider.replace(oldMembership,newMembership);
  const oldCross="const cs=await crossRef.get();if(cs.exists){const c=cs.data()||{};if(c.tenantId!==r.tenantId||c.shopperId!==shopperId||c.providerUidFingerprint!==uidFingerprint(user.uid))throw new Error('I3_HISTORICAL_CROSSWALK_CONFLICT');}else{await crossRef.set(crosswalkDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId),profile));writes++;}";
  const newCross="const cs=await crossRef.get();const desiredCross=crosswalkDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId),Object.assign({},profile,{user:profile.user||h.login}));if(cs.exists){const c=cs.data()||{};if(c.tenantId!==r.tenantId||c.shopperId!==shopperId||c.providerUidFingerprint!==uidFingerprint(user.uid))throw new Error('I3_HISTORICAL_CROSSWALK_CONFLICT');const needs=c.identityMode!=='exact_technical_keys_only'||c.fuzzyMatching!==false||JSON.stringify(uniq(c.projectIds))!==JSON.stringify([r.projectId]);if(needs){await crossRef.set(desiredCross,{merge:true});writes++;}}else{await crossRef.set(desiredCross);writes++;}";
  if(provider.includes(oldCross))provider=provider.replace(oldCross,newCross);
  return {index,shoppers,provider};
}
const out=patched();
if(mode==='--apply'){for(const [key,content] of Object.entries(out))fs.writeFileSync(files[key],content,'utf8');}
for(const [key,content] of Object.entries(out)){
  ensure(!content.startsWith('\uFEFF'),'UTF8_BOM_'+key);
  if(key==='index'){ensure(content.includes('cxorbia-shopper-membership-wiring-v1.js'),'SHOPPER_MEMBERSHIP_NOT_LOADED');ensure(content.includes('cxorbia-command-http-transport-v1.js'),'COMMAND_TRANSPORT_NOT_LOADED');}
  if(key==='shoppers'){ensure(content.includes("reason:'i3-admin-shopper-create'"),'SHOPPER_CREATE_ACK_MISSING');ensure(content.includes("reason:'i3-admin-shopper-update'"),'SHOPPER_UPDATE_ACK_MISSING');ensure(content.includes('providerAck!==true'),'SHOPPER_PROVIDER_ACK_MISSING');}
  if(key==='provider'){ensure(content.includes("PRIVATE_NEW.split('/').slice(0,-1)"),'PRIVATE_PATH_PATCH_MISSING');ensure(content.includes('desiredMembership'),'HISTORICAL_MEMBERSHIP_REPAIR_MISSING');ensure(content.includes('desiredCross'),'HISTORICAL_CROSSWALK_REPAIR_MISSING');}
}
console.log(JSON.stringify({decision:mode==='--apply'?'PASS_I3_SOURCE_PATCH_APPLIED':'PASS_I3_SOURCE_PATCH_VERIFIED',sameCandidate:true,files:Object.values(files),providerWrites:0,deploys:0,production:false}));
