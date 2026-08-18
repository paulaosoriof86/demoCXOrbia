/* CXOrbia — provider-backed exact identity-link runtime bridge v1.
   Reusable protected read path for tenant shopperIdentityLinks.
   Operators only: exact provider links are loaded before Firestore tenant payload composition,
   then attached as exact technical aliases to the matching canonical shopper profile.
   No fuzzy/name/email/phone matching. No browser writes. No tenant/project/month hardcode.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-provider-identity-link-runtime-v1';
  const OPERATOR_ROLES=new Set(['super','admin','ops','coordinador']);
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v.map(str).filter(Boolean):[];
  const sorted=v=>[...new Set(arr(v))].sort();
  const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(str).filter(Boolean))];
  let contextKey='';
  let links=[];

  function publish(status,extra){
    root.CX_PROVIDER_IDENTITY_LINK_RUNTIME=Object.assign({
      version:VERSION,status,readOnly:true,exactTechnicalOnly:true,
      fuzzyMatching:false,nameMatching:false,emailMatching:false,phoneMatching:false,
      providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
    },extra||{});
  }
  function applicable(link,ctx){
    if(!link||typeof link!=='object'||!ctx)return false;
    const tenant=str(ctx.tenantId),scope=str(link.projectScope),projects=sorted(ctx.projectIds);
    if(str(link.tenantId)!==tenant)return false;
    if(str(link.status)!=='active'||link.periodIndependent!==true||link.providerAck!==true)return false;
    if(!str(link.canonicalShopperId)||!str(link.authorityType)||!str(link.sourceSystem))return false;
    if(!str(link.sourceIdentityKey)&&!arr(link.sourceAliases).length)return false;
    return scope==='*'||projects.includes(scope);
  }
  async function preload(ctx){
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role)))return ctx;
    const tenant=str(ctx.tenantId);if(!tenant)throw new Error('IDENTITY_LINK_TENANT_REQUIRED');
    const key=[tenant,...sorted(ctx.projectIds)].join('|');
    if(contextKey===key){publish('loaded_cached',{tenantId:tenant,projectIds:sorted(ctx.projectIds),links:links.length});return ctx;}
    let snap;
    try{
      snap=await firebase.firestore().collection('tenants').doc(tenant).collection('shopperIdentityLinks').get();
    }catch(_){
      contextKey='';links=[];root.CX_PROVIDER_IDENTITY_LINKS=[];
      publish('blocked',{tenantId:tenant,projectIds:sorted(ctx.projectIds),code:'IDENTITY_LINK_PROVIDER_READ_FAILED'});
      throw new Error('IDENTITY_LINK_PROVIDER_READ_FAILED');
    }
    links=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{})).filter(link=>applicable(link,ctx));
    contextKey=key;
    root.CX_PROVIDER_IDENTITY_LINKS=links.map(link=>Object.assign({},link));
    publish('loaded',{tenantId:tenant,projectIds:sorted(ctx.projectIds),providerDocuments:snap.size,links:links.length});
    return ctx;
  }
  function enrich(){
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}})();
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role))||!Array.isArray(CX.data?.shoppers))return;
    const byCanonical=new Map();
    for(const link of links){
      if(!applicable(link,ctx))continue;
      const canonical=str(link.canonicalShopperId);if(!canonical)continue;
      if(!byCanonical.has(canonical))byCanonical.set(canonical,[]);
      byCanonical.get(canonical).push(link);
    }
    let profilesEnriched=0,aliasesAdded=0;
    for(const profile of CX.data.shoppers){
      const canonical=str(profile?.shopperId||profile?.id),matched=byCanonical.get(canonical)||[];
      if(!matched.length)continue;
      const before=uniq([...(Array.isArray(profile.exactAliases)?profile.exactAliases:[]),...(Array.isArray(profile.identityAliases)?profile.identityAliases:[])]);
      const exact=[];
      for(const link of matched){exact.push(str(link.sourceIdentityKey));exact.push(...arr(link.sourceAliases));}
      const merged=uniq([...before,...exact]);
      profile.exactAliases=merged;
      profile.identityAliases=merged.slice();
      profile.__providerExactIdentityLink=true;
      profile.__providerIdentityLinkIds=uniq(matched.map(link=>link.identityLinkId||link.id));
      profilesEnriched++;
      aliasesAdded+=Math.max(0,merged.length-before.length);
    }
    publish('profiles_enriched',{tenantId:str(ctx.tenantId),projectIds:sorted(ctx.projectIds),links:links.length,profilesEnriched,aliasesAdded});
  }
  function install(){
    if(!CX.backendAuth||CX.backendAuth.__providerIdentityLinkRuntime)return false;
    const ensure=CX.backendAuth.ensureAuthenticated?.bind(CX.backendAuth);
    const authenticate=CX.backendAuth.authenticate?.bind(CX.backendAuth);
    if(!ensure)return false;
    CX.backendAuth.ensureAuthenticated=async function(){return preload(await ensure(...arguments));};
    if(authenticate)CX.backendAuth.authenticate=async function(){return preload(await authenticate(...arguments));};
    CX.backendAuth.preloadProviderIdentityLinks=preload;
    CX.backendAuth.__providerIdentityLinkRuntime=true;
    if(CX.bus?.on&&root.CX_PROVIDER_IDENTITY_LINK_RUNTIME_BOUND!==true){
      root.CX_PROVIDER_IDENTITY_LINK_RUNTIME_BOUND=true;
      CX.bus.on('backend-ready',enrich);
    }
    publish('installed_waiting_operator',{links:0});
    return true;
  }
  if(!install())setTimeout(install,0);
})(typeof window!=='undefined'?window:globalThis);
