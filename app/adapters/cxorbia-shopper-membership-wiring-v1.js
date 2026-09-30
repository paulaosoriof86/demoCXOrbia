/* CXOrbia — reusable Shopper membership wiring v1.
   Firebase principal + exact claims -> tenants/{tenantId}/users/{uid} -> Shopper session.
   Read-only in browser; provider writes happen only in the protected command service.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-shopper-membership-wiring-v1';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v.map(str).filter(Boolean):[];
  const sorted=v=>[...new Set(arr(v))].sort();
  async function sha256(value){const bytes=new TextEncoder().encode(String(value));const d=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  async function uidFingerprint(uid){return sha256('cxorbia-provider-uid-v1\0'+str(uid));}
  async function claimsDigest(ctx){
    const canonical={authNamespace:'shopper',projectIds:sorted(ctx.projectIds),role:'shopper',shopperId:str(ctx.shopperId),tenantId:str(ctx.tenantId)};
    return sha256(JSON.stringify(canonical));
  }
  async function fail(code){
    root.CX_SHOPPER_MEMBERSHIP={version:VERSION,status:'blocked',code:str(code),providerWrites:0,firestoreWrites:0,at:new Date().toISOString()};
    try{CX.session?.clear?.();}catch(_){}
    try{await firebase.auth().signOut();}catch(_){}
    throw new Error(str(code)||'SHOPPER_MEMBERSHIP_BLOCKED');
  }
  async function reconcile(ctx){
    if(!ctx?.authenticated||str(ctx.role)!=='shopper')return ctx;
    if(!str(ctx.tenantId)||!str(ctx.shopperId)||!sorted(ctx.projectIds).length)return fail('SHOPPER_MEMBERSHIP_CONTEXT_INCOMPLETE');
    const user=firebase.auth().currentUser;if(!user)return fail('SHOPPER_MEMBERSHIP_AUTH_REQUIRED');
    let snap;try{snap=await firebase.firestore().collection('tenants').doc(str(ctx.tenantId)).collection('users').doc(user.uid).get();}catch(_){return fail('SHOPPER_MEMBERSHIP_READ_FAILED');}
    if(!snap.exists)return fail('SHOPPER_MEMBERSHIP_MISSING');
    const m=snap.data()||{};
    if(m.active!==true||str(m.tenantId)!==str(ctx.tenantId)||str(m.role)!=='shopper'||str(m.authNamespace)!=='shopper')return fail('SHOPPER_MEMBERSHIP_SCOPE_MISMATCH');
    if(str(m.shopperId)!==str(ctx.shopperId)||JSON.stringify(sorted(m.projectIds))!==JSON.stringify(sorted(ctx.projectIds)))return fail('SHOPPER_MEMBERSHIP_IDENTITY_MISMATCH');
    if(str(m.providerUidFingerprint)!==await uidFingerprint(user.uid))return fail('SHOPPER_MEMBERSHIP_UID_MISMATCH');
    if(str(m.claimsDigest)!==await claimsDigest(ctx))return fail('SHOPPER_MEMBERSHIP_CLAIMS_MISMATCH');
    if(CX.session?.user){CX.session.user.membershipVerified=true;CX.session.user.projectIds=sorted(m.projectIds);CX.session.user.scopeProjectId=sorted(m.projectIds).length===1?sorted(m.projectIds)[0]:undefined;CX.session.user.membershipSource='tenants/'+str(ctx.tenantId)+'/users/self';CX.session.save?.();}
    root.CX_SHOPPER_MEMBERSHIP={version:VERSION,status:'verified',tenantId:str(ctx.tenantId),shopperIdVerified:true,projectIds:sorted(m.projectIds),providerWrites:0,firestoreWrites:0,at:new Date().toISOString()};
    return Object.assign({},ctx,{membershipVerified:true,membershipSource:'tenants/'+str(ctx.tenantId)+'/users/self'});
  }
  function install(){
    if(!CX.backendAuth||CX.backendAuth.__shopperMembershipWiring)return false;
    const ensure=CX.backendAuth.ensureAuthenticated?.bind(CX.backendAuth);const authenticate=CX.backendAuth.authenticate?.bind(CX.backendAuth);
    if(!ensure)return false;
    CX.backendAuth.ensureAuthenticated=async function(){return reconcile(await ensure(...arguments));};
    if(authenticate)CX.backendAuth.authenticate=async function(){return reconcile(await authenticate(...arguments));};
    CX.backendAuth.verifyShopperMembership=reconcile;CX.backendAuth.__shopperMembershipWiring=true;
    root.CX_SHOPPER_MEMBERSHIP={version:VERSION,status:'installed_waiting_principal',providerWrites:0,firestoreWrites:0,at:new Date().toISOString()};return true;
  }
  if(!install())setTimeout(install,0);
})(typeof window!=='undefined'?window:globalThis);
