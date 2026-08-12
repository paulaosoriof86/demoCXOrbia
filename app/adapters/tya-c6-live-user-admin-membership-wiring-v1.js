/* CXOrbia TyA — C6 live user/admin membership wiring v1.
   Source-only / DEV read-only.
   Closes the canonical chain for Staff:
   Firebase principal + claims -> tenants/tya/users/{uid} -> CX.session/RBAC -> backend reads.
   No UI module changes. No provider writes. No secrets or visibleLogin exposed.
*/
window.CX=window.CX||{};
(function(){
  'use strict';
  const STAFF_ROLES=new Set(['super','admin','ops','coordinador']);
  const TENANT='tya';
  const ENTITLEMENT='TYA_COMPLETE';
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const list=v=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):[];
  const uniqSorted=v=>Array.from(new Set(list(v))).sort();
  let lastVerifiedKey='';
  let lastVerifiedContext=null;

  function enabled(){
    try{
      return CX.BACKEND?.enabled===true &&
        CX.BACKEND?.previewMode===true &&
        CX.BACKEND?.devPreviewAuth?.enabled===true;
    }catch(_){return false;}
  }

  function emit(name,payload){
    try{if(CX.bus&&typeof CX.bus.emit==='function')CX.bus.emit(name,payload||{});}catch(_){}
  }

  async function sha256Hex(value){
    if(!window.crypto||!crypto.subtle)throw new Error('WEB_CRYPTO_REQUIRED');
    const bytes=new TextEncoder().encode(String(value));
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  function firebaseAuth(){
    if(!window.firebase||!firebase.auth)throw new Error('FIREBASE_AUTH_REQUIRED');
    return firebase.auth();
  }

  function firestore(){
    if(!window.firebase||!firebase.firestore)throw new Error('FIRESTORE_REQUIRED');
    return firebase.firestore();
  }

  async function claimsDigest(ctx){
    const canonical={
      authNamespace:lower(ctx.authNamespace||'staff'),
      projectIds:uniqSorted(ctx.projectIds),
      role:lower(ctx.role),
      tenantId:lower(ctx.tenantId)
    };
    return sha256Hex(JSON.stringify(canonical));
  }

  async function providerUidFingerprint(uid){
    return sha256Hex('cxorbia-provider-uid-v1\0'+str(uid));
  }

  function sameList(a,b){return JSON.stringify(uniqSorted(a))===JSON.stringify(uniqSorted(b));}

  function publishSession(ctx,membership){
    if(!CX.session||!CX.session.user)return;
    CX.session.user.membershipVerified=true;
    CX.session.user.entitlementMode=membership.entitlementMode;
    CX.session.user.projectIds=uniqSorted(membership.projectIds);
    CX.session.user.scopeProjectId=CX.session.user.projectIds.length===1?CX.session.user.projectIds[0]:undefined;
    CX.session.user.membershipSource='tenants/'+TENANT+'/users/self';
    if(typeof CX.session.save==='function')CX.session.save();
  }

  async function failClosed(code){
    window.CX_C6_LIVE_USER_ADMIN_WIRING={
      version:'v1',status:'blocked',code:String(code||'MEMBERSHIP_WIRING_BLOCKED'),
      tenantId:TENANT,providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
    };
    try{if(CX.session&&typeof CX.session.clear==='function')CX.session.clear();}catch(_){}
    try{await firebaseAuth().signOut();}catch(_){}
    emit('c6-membership-blocked',{code:String(code||'MEMBERSHIP_WIRING_BLOCKED'),tenantId:TENANT});
    throw new Error(String(code||'MEMBERSHIP_WIRING_BLOCKED'));
  }

  async function reconcile(ctx){
    if(!enabled()||!ctx||ctx.authenticated!==true)return ctx;
    const role=lower(ctx.role);
    if(!STAFF_ROLES.has(role)){
      window.CX_C6_LIVE_USER_ADMIN_WIRING={
        version:'v1',status:'not_applicable_non_staff',role,tenantId:lower(ctx.tenantId)||TENANT,
        providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
      };
      return ctx;
    }
    if(lower(ctx.tenantId)!==TENANT)return failClosed('MEMBERSHIP_TENANT_CONTEXT_MISMATCH');
    if(lower(ctx.authNamespace||'staff')!=='staff')return failClosed('MEMBERSHIP_NAMESPACE_CONTEXT_MISMATCH');

    const auth=firebaseAuth();
    const user=auth.currentUser;
    if(!user)return failClosed('MEMBERSHIP_AUTH_USER_REQUIRED');
    const digest=await claimsDigest(ctx);
    const cacheKey=[user.uid,digest].join(':');
    if(lastVerifiedKey===cacheKey&&lastVerifiedContext){
      publishSession(ctx,lastVerifiedContext.membership);
      return Object.assign({},ctx,lastVerifiedContext.contextPatch);
    }

    let snap;
    try{
      snap=await firestore().collection('tenants').doc(TENANT).collection('users').doc(user.uid).get();
    }catch(_){return failClosed('MEMBERSHIP_SELF_READ_FAILED');}
    if(!snap.exists)return failClosed('MEMBERSHIP_SELF_MISSING');
    const m=snap.data()||{};
    if(m.active!==true)return failClosed('MEMBERSHIP_INACTIVE');
    if(lower(m.tenantId)!==TENANT)return failClosed('MEMBERSHIP_TENANT_MISMATCH');
    if(lower(m.authNamespace)!=='staff')return failClosed('MEMBERSHIP_NAMESPACE_MISMATCH');
    if(lower(m.role)!==role)return failClosed('MEMBERSHIP_ROLE_MISMATCH');
    if(str(m.entitlementMode)!==ENTITLEMENT)return failClosed('MEMBERSHIP_ENTITLEMENT_MISMATCH');
    if(!sameList(m.projectIds,ctx.projectIds))return failClosed('MEMBERSHIP_PROJECT_SCOPE_MISMATCH');
    if(str(m.claimsDigest)!==digest)return failClosed('MEMBERSHIP_CLAIMS_DIGEST_MISMATCH');
    const uidFp=await providerUidFingerprint(user.uid);
    if(str(m.providerUidFingerprint)!==uidFp)return failClosed('MEMBERSHIP_PROVIDER_UID_MISMATCH');

    const membership={
      verified:true,active:true,tenantId:TENANT,role,authNamespace:'staff',
      entitlementMode:ENTITLEMENT,projectIds:uniqSorted(m.projectIds),source:'tenants/'+TENANT+'/users/self'
    };
    const contextPatch={
      membershipVerified:true,membershipSource:membership.source,entitlementMode:ENTITLEMENT,
      projectIds:membership.projectIds.slice()
    };
    lastVerifiedKey=cacheKey;
    lastVerifiedContext={membership,contextPatch};
    publishSession(ctx,membership);
    window.CX_C6_LIVE_USER_ADMIN_WIRING={
      version:'v1',status:'verified',tenantId:TENANT,role,
      authPrincipal:true,claimsVerified:true,membershipVerified:true,rbacSessionPublished:true,
      projectScope:membership.projectIds.slice(),entitlementMode:ENTITLEMENT,
      visibleLoginExposed:false,uidExposed:false,providerWrites:0,firestoreWrites:0,production:false,
      at:new Date().toISOString()
    };
    emit('c6-membership-ready',{tenantId:TENANT,role,projectIds:membership.projectIds.slice(),verified:true});
    return Object.assign({},ctx,contextPatch);
  }

  function install(){
    if(!CX.backendAuth||CX.backendAuth.__c6LiveMembershipWiring)return false;
    const originalEnsure=typeof CX.backendAuth.ensureAuthenticated==='function'?CX.backendAuth.ensureAuthenticated.bind(CX.backendAuth):null;
    const originalAuthenticate=typeof CX.backendAuth.authenticate==='function'?CX.backendAuth.authenticate.bind(CX.backendAuth):null;
    if(!originalEnsure)return false;
    CX.backendAuth.ensureAuthenticated=async function(){return reconcile(await originalEnsure.apply(null,arguments));};
    if(originalAuthenticate){
      CX.backendAuth.authenticate=async function(){return reconcile(await originalAuthenticate.apply(null,arguments));};
    }
    CX.backendAuth.verifyCanonicalMembership=reconcile;
    CX.backendAuth.__c6LiveMembershipWiring=true;
    window.CX_C6_LIVE_USER_ADMIN_WIRING={
      version:'v1',status:'installed_waiting_principal',tenantId:TENANT,
      providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
    };
    return true;
  }

  if(!install())setTimeout(install,0);
})();
