/* CXOrbia TyA — C6 live user/admin membership wiring v1.
   Source-only / DEV read-only.
   Closes the canonical chain for Staff:
   Firebase principal + claims -> tenants/tya/users/{uid} -> CX.session/RBAC -> backend reads -> frontend.
   No UI module changes. No provider writes. No secrets or visibleLogin exposed.
*/
window.CX=window.CX||{};
(function(){
  'use strict';
  const STAFF_ROLES=new Set(['super','admin','ops','coordinador']);
  const TENANT='tya';
  const ENTITLEMENT='TYA_COMPLETE';
  const CANONICAL_SOURCE='hr-live-all-periods+firestore-authenticated-exact-overlay';
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const list=v=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):[];
  const uniqSorted=v=>Array.from(new Set(list(v))).sort();
  let lastVerifiedKey='';
  let lastVerifiedContext=null;
  let frontendFinalizing=false;

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

  function publishFrontendHandoff(status,detail){
    window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF=Object.assign({
      version:'v1',status,tenantId:TENANT,providerWrites:0,firestoreWrites:0,production:false,
      at:new Date().toISOString()
    },detail||{});
  }

  function reconcileCanonicalReadyState(authority){
    const projects=Array.isArray(CX.data?.projects)?CX.data.projects:[];
    const visits=Array.isArray(CX.data?._visitas)?CX.data._visitas:[];
    if(!authority?.applied||!projects.length||!visits.length)throw new Error('FRONTEND_HANDOFF_AUTHORITY_DATA_NOT_READY');
    if(projects.length!==Number(authority.periods||0)||visits.length!==Number(authority.hrVisits||0)){
      throw new Error('FRONTEND_HANDOFF_AUTHORITY_COUNTS_MISMATCH');
    }
    const priorBackendEmpty=window.CX_BACKEND_LAST_STATE?.empty===true;
    const priorCorte4Empty=window.CX_CORTE4_READONLY?.empty===true;
    window.CX_BACKEND_DATA_SOURCE=CANONICAL_SOURCE;
    window.CX_BACKEND_LAST_STATE=Object.assign({},window.CX_BACKEND_LAST_STATE||{}, {
      source:CANONICAL_SOURCE,empty:false,readOnly:true,writes:false,fallbackUsed:false,
      providerEmptyObserved:priorBackendEmpty,
      counts:{projects:projects.length,periods:projects.length,visits:visits.length,shoppers:Array.isArray(CX.data?.shoppers)?CX.data.shoppers.length:0},
      reason:'c6-staff-canonical-authority-ready',at:new Date().toISOString()
    });
    window.CX_CORTE4_READONLY=Object.assign({},window.CX_CORTE4_READONLY||{}, {
      ready:true,source:CANONICAL_SOURCE,empty:false,readOnly:true,writeMode:'disabled',
      preserveCxDataInterface:true,fallbackUsed:false,providerEmptyObserved:priorCorte4Empty,
      state:'c6-staff-canonical-authority-ready',at:new Date().toISOString()
    });
    if(CX.dataSource){
      CX.dataSource.mode='connected';
      CX.dataSource.status='ready';
      CX.dataSource.sourceRef=CANONICAL_SOURCE;
      CX.dataSource.blockers=[];
      CX.dataSource.updatedAt=new Date().toISOString();
      CX.dataSource.runtimeReadActive=true;
      CX.dataSource.runtimeSyncActive=false;
    }
    return {priorBackendEmpty,priorCorte4Empty,projects:projects.length,visits:visits.length};
  }

  async function finalizeStaffFrontend(reason){
    if(frontendFinalizing)return;
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}})();
    const role=lower(ctx?.role);
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    if(!ctx?.authenticated||!STAFF_ROLES.has(role)||lower(ctx.tenantId)!==TENANT||!uniqSorted(ctx.projectIds).includes('cinepolis')||authority?.applied!==true)return;
    frontendFinalizing=true;
    publishFrontendHandoff('verifying',{reason:reason||'authority-ready',role});
    try{
      const verifiedCtx=await reconcile(ctx);
      if(verifiedCtx?.membershipVerified!==true||CX.session?.user?.membershipVerified!==true){
        throw new Error('FRONTEND_HANDOFF_MEMBERSHIP_NOT_VERIFIED');
      }
      const state=reconcileCanonicalReadyState(authority);
      if(!CX.app||typeof CX.app.enter!=='function')throw new Error('FRONTEND_HANDOFF_APP_ENTER_REQUIRED');
      CX.app.enter();
      /* backend-browser-auth wraps CX.app.enter() and intentionally reapplies the provider
         session. That canonical reapplication clears transient membership metadata because
         it rebuilds CX.session.user from Auth claims. Re-publish the already verified,
         cached membership immediately after enter so CX.session/RBAC remains the same
         canonical identity that passed tenants/tya/users/{uid}; this cache path performs
         no provider/Firestore write and no second membership read. */
      const postEnterCtx=await reconcile(verifiedCtx);
      if(postEnterCtx?.membershipVerified!==true||CX.session?.user?.membershipVerified!==true){
        throw new Error('FRONTEND_HANDOFF_MEMBERSHIP_LOST_AFTER_APP_ENTER');
      }
      const appOn=document.getElementById('app')?.classList.contains('on')===true;
      const loginHidden=document.getElementById('login')?.classList.contains('hidden')===true;
      if(!appOn||!loginHidden)throw new Error('FRONTEND_HANDOFF_ENTRY_NOT_VISIBLE');
      publishFrontendHandoff('entered',{
        reason:reason||'authority-ready',role,membershipVerified:true,authorityApplied:true,
        sessionMembershipRepublishedAfterAppEnter:true,
        appOn:true,loginHidden:true,projects:state.projects,visits:state.visits,
        staleBackendEmptyCleared:state.priorBackendEmpty,staleCorte4EmptyCleared:state.priorCorte4Empty
      });
      emit('c6-live-user-admin-frontend-ready',{tenantId:TENANT,role,projects:state.projects,visits:state.visits,verified:true});
    }catch(error){
      publishFrontendHandoff('blocked',{reason:reason||'authority-ready',role,error:str(error?.message||error)});
      console.error('[CX.c6-live-user-admin-frontend-handoff]',error);
    }finally{
      frontendFinalizing=false;
    }
  }

  function bindFrontendHandoff(){
    if(window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF_BOUND===true)return;
    window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF_BOUND=true;
    window.addEventListener('cx:protected-auth-hr-authority-ready',()=>{void finalizeStaffFrontend('protected-auth-hr-authority-ready');});
    if(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true)setTimeout(()=>{void finalizeStaffFrontend('authority-already-ready');},0);
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
    bindFrontendHandoff();
    window.CX_C6_LIVE_USER_ADMIN_WIRING={
      version:'v1',status:'installed_waiting_principal',tenantId:TENANT,
      providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
    };
    return true;
  }

  if(!install())setTimeout(()=>{if(install())bindFrontendHandoff();},0);
})();
