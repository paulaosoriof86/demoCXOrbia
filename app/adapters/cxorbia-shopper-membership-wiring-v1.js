/* CXOrbia — reusable Shopper membership + exact provider identity-link wiring v2.
   Firebase principal + exact claims -> tenants/{tenantId}/users/{uid} -> Shopper session.
   For authenticated operators only, provider-backed shopperIdentityLinks are read before
   the protected tenant payload is composed and are attached as exact technical aliases
   to the matching canonical profile. No fuzzy/name/email/phone matching is performed.
   Browser path is read-only; provider writes remain behind protected command gates.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-shopper-membership-wiring-v2';
  const LINK_VERSION='cxorbia-provider-identity-link-runtime-v1';
  const OPERATOR_ROLES=new Set(['super','admin','ops','coordinador']);
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v.map(str).filter(Boolean):[];
  const sorted=v=>[...new Set(arr(v))].sort();
  const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(str).filter(Boolean))];
  let identityLinkContextKey='';
  let identityLinks=[];

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
  function publishIdentityLinks(status,extra){
    root.CX_PROVIDER_IDENTITY_LINK_RUNTIME=Object.assign({
      version:LINK_VERSION,status,readOnly:true,exactTechnicalOnly:true,fuzzyMatching:false,
      nameMatching:false,emailMatching:false,phoneMatching:false,providerWrites:0,firestoreWrites:0,
      production:false,at:new Date().toISOString()
    },extra||{});
  }
  function linkAllowedForContext(link,ctx){
    if(!link||typeof link!=='object'||!ctx)return false;
    const tenant=str(ctx.tenantId),scope=str(link.projectScope),projects=sorted(ctx.projectIds);
    if(str(link.tenantId)!==tenant||str(link.status)!=='active'||link.periodIndependent!==true||link.providerAck!==true)return false;
    if(!str(link.canonicalShopperId)||!str(link.authorityType)||!str(link.sourceSystem))return false;
    if(!str(link.sourceIdentityKey)&&!arr(link.sourceAliases).length)return false;
    return scope==='*'||projects.includes(scope);
  }
  async function preloadIdentityLinks(ctx){
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role)))return ctx;
    const tenant=str(ctx.tenantId);if(!tenant)throw new Error('IDENTITY_LINK_TENANT_REQUIRED');
    const key=[tenant,...sorted(ctx.projectIds)].join('|');
    if(identityLinkContextKey===key){publishIdentityLinks('loaded_cached',{tenantId:tenant,projectIds:sorted(ctx.projectIds),links:identityLinks.length});return ctx;}
    let snap;
    try{
      snap=await firebase.firestore().collection('tenants').doc(tenant).collection('shopperIdentityLinks').get();
    }catch(error){
      identityLinkContextKey='';identityLinks=[];
      publishIdentityLinks('blocked',{tenantId:tenant,projectIds:sorted(ctx.projectIds),code:'IDENTITY_LINK_PROVIDER_READ_FAILED'});
      throw new Error('IDENTITY_LINK_PROVIDER_READ_FAILED');
    }
    identityLinks=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{})).filter(link=>linkAllowedForContext(link,ctx));
    identityLinkContextKey=key;
    root.CX_PROVIDER_IDENTITY_LINKS=identityLinks.map(link=>Object.assign({},link));
    publishIdentityLinks('loaded',{tenantId:tenant,projectIds:sorted(ctx.projectIds),providerDocuments:snap.size,links:identityLinks.length});
    return ctx;
  }
  function enrichProtectedProfiles(){
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}})();
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role))||!Array.isArray(CX.data?.shoppers))return;
    const byCanonical=new Map();
    for(const link of identityLinks){
      if(!linkAllowedForContext(link,ctx))continue;
      const canonical=str(link.canonicalShopperId);if(!canonical)continue;
      if(!byCanonical.has(canonical))byCanonical.set(canonical,[]);
      byCanonical.get(canonical).push(link);
    }
    let profilesEnriched=0,aliasesAdded=0;
    for(const profile of CX.data.shoppers){
      const canonical=str(profile?.shopperId||profile?.id),links=byCanonical.get(canonical)||[];
      if(!links.length)continue;
      const before=uniq([...(Array.isArray(profile.exactAliases)?profile.exactAliases:[]),...(Array.isArray(profile.identityAliases)?profile.identityAliases:[])]);
      const exact=[];
      for(const link of links){
        exact.push(str(link.sourceIdentityKey));
        exact.push(...arr(link.sourceAliases));
      }
      const merged=uniq([...before,...exact]);
      profile.exactAliases=merged;
      profile.identityAliases=merged.slice();
      profile.__providerExactIdentityLink=true;
      profile.__providerIdentityLinkIds=uniq(links.map(link=>link.identityLinkId||link.id));
      profilesEnriched++;
      aliasesAdded+=Math.max(0,merged.length-before.length);
    }
    publishIdentityLinks('profiles_enriched',{tenantId:str(ctx.tenantId),projectIds:sorted(ctx.projectIds),links:identityLinks.length,profilesEnriched,aliasesAdded});
  }
  async function reconcile(ctx){
    if(!ctx?.authenticated)return ctx;
    if(str(ctx.role)!=='shopper')return preloadIdentityLinks(ctx);
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
  function bindProfileEnrichment(){
    if(CX.bus?.on&&root.CX_PROVIDER_IDENTITY_LINK_RUNTIME_BOUND!==true){
      root.CX_PROVIDER_IDENTITY_LINK_RUNTIME_BOUND=true;
      CX.bus.on('backend-ready',enrichProtectedProfiles);
    }
  }
  function install(){
    if(!CX.backendAuth||CX.backendAuth.__shopperMembershipWiring)return false;
    const ensure=CX.backendAuth.ensureAuthenticated?.bind(CX.backendAuth);const authenticate=CX.backendAuth.authenticate?.bind(CX.backendAuth);
    if(!ensure)return false;
    CX.backendAuth.ensureAuthenticated=async function(){return reconcile(await ensure(...arguments));};
    if(authenticate)CX.backendAuth.authenticate=async function(){return reconcile(await authenticate(...arguments));};
    CX.backendAuth.verifyShopperMembership=reconcile;CX.backendAuth.__shopperMembershipWiring=true;
    bindProfileEnrichment();
    root.CX_SHOPPER_MEMBERSHIP={version:VERSION,status:'installed_waiting_principal',providerWrites:0,firestoreWrites:0,at:new Date().toISOString()};
    publishIdentityLinks('installed_waiting_operator',{links:0});
    return true;
  }
  if(!install())setTimeout(()=>{if(install())bindProfileEnrichment();},0);
})(typeof window!=='undefined'?window:globalThis);
