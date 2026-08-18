/* CXOrbia — provider-backed exact identity-link runtime bridge v1.
   Reusable protected read path for tenant shopperIdentityLinks.
   Operators only: exact provider links are loaded before Firestore tenant payload composition.
   I3.11C contract-parity correction: runtime applicability now follows the reusable
   cxorbia-identity-roll-forward-v1 trust semantics for authoritative period-independent links.
   I3.11C post-hardening correction: authoritative exact links are also exported into the
   canonical identityMap after composition when the canonical identity is present in output.
   No fuzzy/name/email/phone matching. No browser writes. No tenant/project/month hardcode.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-provider-identity-link-runtime-v1';
  const CANONICAL_CONTRACT='cxorbia-identity-roll-forward-v1';
  const OPERATOR_ROLES=new Set(['super','admin','ops','coordinador']);
  const ACTIVE_STATES=new Set(['active','confirmed','approved','materialized']);
  const TRUSTED_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact']);
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v.map(str).filter(Boolean):[];
  const sorted=v=>[...new Set(arr(v))].sort();
  const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(str).filter(Boolean))];
  let contextKey='';
  let links=[];
  let composerBridgeInstalled=false;

  function authorityType(link){return str(link?.authorityType||link?.authority?.type).toLowerCase();}
  function authorityRef(link){
    return str(link?.authorityRef||link?.authority?.evidenceRef||link?.authority?.adjudicationId||link?.authority?.providerRef||link?.authority?.commandId||link?.providerAckRef||link?.adjudicationId||link?.commandId||link?.idempotencyKey||link?.id||link?.identityLinkId);
  }
  function projectScope(link){
    const explicit=str(link?.projectScope||link?.scope?.projectId||link?.projectId);
    if(!explicit||explicit==='*'||explicit.toLowerCase()==='tenant')return '*';
    return explicit;
  }
  function tenantIdFor(link){return str(link?.tenantId||link?.scope?.tenantId);}
  function statusFor(link){return str(link?.status||link?.state||'').toLowerCase();}
  function canonicalFor(link){return str(link?.canonicalShopperId||link?.canonicalId||link?.shopperId||link?.profileId);}
  function sourceSystemFor(link){return str(link?.sourceSystem||link?.sourceNamespace||link?.sourceType||link?.sourceIdentity?.sourceSystem).toLowerCase();}
  function sourceAliasesFor(link){
    return uniq([
      ...arr(link?.sourceAliases),...arr(link?.sourceIdentityAliases),...arr(link?.identityAliases),
      ...arr(link?.exactAliases),...arr(link?.aliases)
    ]);
  }
  function sourceTokensFor(link){
    return uniq([
      str(link?.sourceIdentityKey),str(link?.sourceSubjectId),str(link?.sourceId),str(link?.sourceKey),
      str(link?.legacyShopperId),str(link?.externalShopperId),str(link?.externalId),str(link?.hrRowId),
      str(link?.personId),str(link?.profileId),str(link?.shopperDocId),...sourceAliasesFor(link)
    ]);
  }
  function canonicalApplicable(link,ctx){
    if(!link||typeof link!=='object'||!ctx)return false;
    const tenant=str(ctx.tenantId),scope=projectScope(link),projects=sorted(ctx.projectIds);
    if(tenantIdFor(link)!==tenant)return false;
    if(!ACTIVE_STATES.has(statusFor(link)))return false;
    if(link.periodIndependent!==true||link.periodKey||link.periodId||link.periodScope)return false;
    if(!canonicalFor(link)||!sourceSystemFor(link)||!sourceTokensFor(link).length)return false;
    if(!TRUSTED_AUTHORITIES.has(authorityType(link))||!authorityRef(link))return false;
    if(link.sourceSafe===false)return false;
    return scope==='*'||projects.includes(scope);
  }
  function applicable(link,ctx){
    const canonical=root.CX_IDENTITY_ROLL_FORWARD_CONTRACT;
    if(canonical&&typeof canonical.normalizeLink==='function'){
      const normalized=canonical.normalizeLink(link);
      if(!normalized?.ok)return false;
      const scope=str(normalized.link?.projectScope||'*');
      const tenant=str(ctx?.tenantId),projects=sorted(ctx?.projectIds);
      if(str(normalized.link?.tenantId)!==tenant)return false;
      return scope==='*'||projects.includes(scope);
    }
    return canonicalApplicable(link,ctx);
  }
  function exactAliasesForLink(link){
    return uniq([str(link&&link.sourceIdentityKey),...sourceAliasesFor(link)]).filter(Boolean);
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
  function publish(status,extra){
    root.CX_PROVIDER_IDENTITY_LINK_RUNTIME=Object.assign({
      version:VERSION,contract:CANONICAL_CONTRACT,status,readOnly:true,exactTechnicalOnly:true,
      fuzzyMatching:false,nameMatching:false,emailMatching:false,phoneMatching:false,
      activeStates:[...ACTIVE_STATES],trustedAuthorities:[...TRUSTED_AUTHORITIES],
      providerWrites:0,firestoreWrites:0,production:false,at:new Date().toISOString()
    },extra||{});
  }
  function activeLinksForCurrentContext(){
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}})();
    if(!ctx?.authenticated||!OPERATOR_ROLES.has(str(ctx.role)))return [];
    return links.filter(link=>applicable(link,ctx));
  }
  function bridgeComposeInput(input,exactLinksOverride){
    const exactLinks=Array.isArray(exactLinksOverride)?exactLinksOverride:activeLinksForCurrentContext();
    const payload=input&&input.protectedPayload;
    if(!exactLinks.length||!payload||!Array.isArray(payload.shoppers))return input;

    const shoppers=payload.shoppers.map(profile=>Object.assign({},profile||{}));
    const applied=[],conflicts=[];

    for(const link of exactLinks){
      const canonical=canonicalFor(link);
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
      profile.__providerIdentityLinkIds=uniq([...arr(profile.__providerIdentityLinkIds),str(link.identityLinkId||link.id)]);
      profile.__providerIdentityAuthorityType=authorityType(link);
      shoppers[index]=profile;
      applied.push({identityLinkId:str(link.identityLinkId||link.id),priorShopperId:priorId||null,canonicalShopperId:canonical,aliases:merged});
    }

    root.CX_PROVIDER_IDENTITY_LINK_PRECOMPOSE={
      version:VERSION,contract:CANONICAL_CONTRACT,readOnly:true,exactTechnicalOnly:true,
      applied,conflicts,providerWrites:0,firestoreWrites:0,fuzzyMatching:false,at:new Date().toISOString()
    };

    if(!applied.length)return input;
    return Object.assign({},input,{protectedPayload:Object.assign({},payload,{shoppers})});
  }
  function bridgeComposeOutput(result,exactLinksOverride){
    if(!result||typeof result!=='object')return result;
    const exactLinks=Array.isArray(exactLinksOverride)?exactLinksOverride:activeLinksForCurrentContext();
    if(!exactLinks.length)return result;

    const identityMap=Object.assign({},result.identityMap&&typeof result.identityMap==='object'&&!Array.isArray(result.identityMap)?result.identityMap:{});
    const canonicalIds=new Set();
    for(const profile of Array.isArray(result.shoppers)?result.shoppers:[]){
      const id=str(profile?.canonicalShopperId||profile?.shopperId||profile?.id);if(id)canonicalIds.add(id);
    }
    for(const visit of Array.isArray(result.visits)?result.visits:[]){
      const id=str(visit?.shopperId);if(id)canonicalIds.add(id);
    }

    const applied=[],conflicts=[];
    for(const link of exactLinks){
      const canonical=canonicalFor(link);
      const aliases=exactAliasesForLink(link).filter(alias=>alias&&alias!==canonical);
      if(!canonical||!aliases.length)continue;
      if(!canonicalIds.has(canonical)){
        conflicts.push({
          identityLinkId:str(link.identityLinkId||link.id),canonicalShopperId:canonical,sourceAliases:aliases,
          reason:'provider_exact_canonical_not_present_in_composed_output'
        });
        continue;
      }
      for(const alias of aliases){
        const prior=str(identityMap[alias]);
        if(prior&&prior!==canonical){
          conflicts.push({
            identityLinkId:str(link.identityLinkId||link.id),canonicalShopperId:canonical,sourceAlias:alias,
            existingCanonicalShopperId:prior,reason:'provider_exact_identity_map_conflict'
          });
          continue;
        }
        if(!prior){
          identityMap[alias]=canonical;
          applied.push({identityLinkId:str(link.identityLinkId||link.id),sourceAlias:alias,canonicalShopperId:canonical});
        }
      }
    }

    root.CX_PROVIDER_IDENTITY_LINK_POSTCOMPOSE={
      version:VERSION,contract:CANONICAL_CONTRACT,readOnly:true,exactTechnicalOnly:true,
      applied,conflicts,providerWrites:0,firestoreWrites:0,fuzzyMatching:false,at:new Date().toISOString()
    };

    if(!applied.length)return result;
    return Object.assign({},result,{identityMap});
  }
  function installComposerBridge(){
    const api=root.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!api||typeof api.compose!=='function')return false;
    if(api.__providerIdentityLinkPrecomposeV1===true){composerBridgeInstalled=true;return true;}
    const compose=api.compose.bind(api);
    api.compose=function(input){
      const exactLinks=activeLinksForCurrentContext();
      const prepared=bridgeComposeInput(input,exactLinks);
      return bridgeComposeOutput(compose(prepared),exactLinks);
    };
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
      const canonical=canonicalFor(link);if(!canonical)continue;
      if(!byCanonical.has(canonical))byCanonical.set(canonical,[]);
      byCanonical.get(canonical).push(link);
    }
    let profilesEnriched=0,aliasesAdded=0;
    for(const profile of CX.data.shoppers){
      const canonical=str(profile?.shopperId||profile?.id),matched=byCanonical.get(canonical)||[];
      if(!matched.length)continue;
      const before=uniq([...(Array.isArray(profile.exactAliases)?profile.exactAliases:[]),...(Array.isArray(profile.identityAliases)?profile.identityAliases:[])]);
      const exact=[];
      for(const link of matched){exact.push(str(link.sourceIdentityKey));exact.push(...sourceAliasesFor(link));}
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
  const contract=Object.freeze({
    version:VERSION,canonicalContract:CANONICAL_CONTRACT,
    activeStates:[...ACTIVE_STATES],trustedAuthorities:[...TRUSTED_AUTHORITIES],
    applicable,canonicalApplicable,authorityType,authorityRef,projectScope,sourceTokensFor,sourceAliasesFor,exactAliasesForLink,bridgeComposeOutput,
    exactTechnicalOnly:true,fuzzyMatching:false,multiTenant:true,multiProject:true,periodIndependent:true
  });
  root.CX_PROVIDER_IDENTITY_LINK_CONTRACT=contract;
  if(typeof module!=='undefined'&&module.exports)module.exports=contract;
  if(!install())setTimeout(install,0);
  setTimeout(installComposerBridge,0);
})(typeof window!=='undefined'?window:globalThis);