/* CXOrbia — provider-backed exact identity-link runtime bridge v1.
   Reusable protected read path for tenant shopperIdentityLinks.
   Operators only: exact provider links are loaded before Firestore tenant payload composition.
   I3.11B adds a fail-closed precompose bridge so an exact provider authority can canonicalize
   the matching protected shopper profile before the cumulative read model resolves HR identities.
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
  let composerBridgeInstalled=false;

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
  function exactAliasesForLink(link){
    return uniq([str(link&&link.sourceIdentityKey),...arr(link&&link.sourceAliases)]).filter(Boolean);
  }
  function profileIdentityValues(profile){
    if(!profile||typeof profile!=='object')return [];
    return uniq([
      str(profile.id),str(profile.shopperId),str(profile.canonicalShopperId),str(profile.legacyShopperId),
      ...arr(profile.exactAliases),...arr(profile.identityAliases),...arr(profile.aliases),
      ...arr(profile.canonicalLegacyIds),...arr(profile.legacyLiveShopperIds),
      ...arr(profile.sourceShopperIds),...arr(profile.hrShopperIds)
    ]);
  }
  function activeLinksForCurrentContext(){
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}})();
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role)))return [];
    return links.filter(link=>applicable(link,ctx));
  }
  function bridgeComposeInput(input){
    const exactLinks=activeLinksForCurrentContext();
    const payload=input&&input.protectedPayload;
    if(!exactLinks.length||!payload||!Array.isArray(payload.shoppers))return input;

    const shoppers=payload.shoppers.map(profile=>Object.assign({},profile||{}));
    const applied=[],conflicts=[];

    for(const link of exactLinks){
      const canonical=str(link.canonicalShopperId);
      const aliases=exactAliasesForLink(link).filter(alias=>alias!==canonical);
      if(!canonical||!aliases.length)continue;

      const needles=new Set([canonical,...aliases]);
      const matchingIndexes=[];
      for(let i=0;i<shoppers.length;i++){
        const values=profileIdentityValues(shoppers[i]);
        if(values.some(value=>needles.has(value)))matchingIndexes.push(i);
      }

      if(matchingIndexes.length!==1){
        conflicts.push({
          identityLinkId:str(link.identityLinkId||link.id),
          canonicalShopperId:canonical,
          sourceAliases:aliases,
          matchingProfiles:matchingIndexes.length,
          reason:matchingIndexes.length===0?'provider_exact_profile_not_found':'provider_exact_profile_ambiguous'
        });
        continue;
      }

      const index=matchingIndexes[0],profile=Object.assign({},shoppers[index]);
      const priorId=str(profile.shopperId||profile.id);
      const merged=uniq([
        ...arr(profile.exactAliases),...arr(profile.identityAliases),...arr(profile.aliases),
        ...arr(profile.legacyLiveShopperIds),...arr(profile.sourceShopperIds),
        priorId,...aliases
      ]).filter(value=>value&&value!==canonical);

      profile.id=canonical;
      profile.shopperId=canonical;
      profile.canonicalShopperId=canonical;
      profile.exactAliases=merged.slice();
      profile.identityAliases=merged.slice();
      profile.aliases=uniq([...arr(profile.aliases),...merged]);
      profile.legacyLiveShopperIds=uniq([...arr(profile.legacyLiveShopperIds),...merged]);
      profile.sourceShopperIds=uniq([...arr(profile.sourceShopperIds),...aliases]);
      profile.__providerExactIdentityLink=true;
      profile.__providerIdentityLinkIds=uniq([
        ...arr(profile.__providerIdentityLinkIds),
        str(link.identityLinkId||link.id)
      ]);
      profile.__providerIdentityAuthorityType=str(link.authorityType);
      shoppers[index]=profile;
      applied.push({
        identityLinkId:str(link.identityLinkId||link.id),
        priorShopperId:priorId||null,
        canonicalShopperId:canonical,
        aliases:merged
      });
    }

    root.CX_PROVIDER_IDENTITY_LINK_PRECOMPOSE={
      version:VERSION,readOnly:true,exactTechnicalOnly:true,
      applied,conflicts,providerWrites:0,firestoreWrites:0,
      fuzzyMatching:false,at:new Date().toISOString()
    };

    if(!applied.length)return input;
    return Object.assign({},input,{
      protectedPayload:Object.assign({},payload,{shoppers})
    });
  }
  function installComposerBridge(){
    const api=root.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!api||typeof api.compose!=='function')return false;
    if(api.__providerIdentityLinkPrecomposeV1===true){composerBridgeInstalled=true;return true;}
    const compose=api.compose.bind(api);
    api.compose=function(input){return compose(bridgeComposeInput(input));};
    api.__providerIdentityLinkPrecomposeV1=true;
    composerBridgeInstalled=true;
    publish('composer_bridge_installed',{links:links.length});
    return true;
  }
  async function preload(ctx){
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role)))return ctx;
    const tenant=str(ctx.tenantId);if(!tenant)throw new Error('IDENTITY_LINK_TENANT_REQUIRED');
    const key=[tenant,...sorted(ctx.projectIds)].join('|');
    if(contextKey===key){
      installComposerBridge();
      publish('loaded_cached',{tenantId:tenant,projectIds:sorted(ctx.projectIds),links:links.length,composerBridgeInstalled});
      return ctx;
    }
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
    installComposerBridge();
    publish('loaded',{tenantId:tenant,projectIds:sorted(ctx.projectIds),providerDocuments:snap.size,links:links.length,composerBridgeInstalled});
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
    publish('profiles_enriched',{tenantId:str(ctx.tenantId),projectIds:sorted(ctx.projectIds),links:links.length,profilesEnriched,aliasesAdded,composerBridgeInstalled});
  }
  function install(){
    installComposerBridge();
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
      CX.bus.on('backend-ready',()=>{installComposerBridge();enrich();});
    }
    publish('installed_waiting_operator',{links:0,composerBridgeInstalled});
    return true;
  }
  if(!install())setTimeout(install,0);
  setTimeout(installComposerBridge,0);
})(typeof window!=='undefined'?window:globalThis);
