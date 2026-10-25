/* CXOrbia — reusable exact identity contract v1.
   Shared source semantics for migration/Auth/profile/runtime crosswalks.
   Exact technical anchors only: never name/email/phone similarity.
   Pure source logic; no provider calls, writes, deploys or tenant-specific values. */
(function(root){
  'use strict';

  const VERSION='cxorbia-exact-identity-contract-v1';
  const TECHNICAL_KEYS=Object.freeze([
    'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
    'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'
  ]);
  const OWNER_KEYS=Object.freeze(['shopperId','profileId','shopperDocId']);
  const ALIAS_COLLECTION_KEYS=Object.freeze([
    'canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds',
    'externalShopperIds','identityAliases','aliases','exactAliases'
  ]);
  const FORBIDDEN_MATCH_KEYS=Object.freeze([
    'nombre','name','displayName','fullName','shopperName','email','correo','phone','telefono',
    'whatsapp','username','user','login','loginIdentifier','normalizedLogin'
  ]);

  const str=value=>String(value==null?'':value).trim();
  const uniq=values=>[...new Set((values||[]).map(str).filter(Boolean))];
  const flatten=value=>{
    const out=[];
    const walk=v=>{
      if(v==null)return;
      if(Array.isArray(v)){v.forEach(walk);return;}
      if(typeof v==='object'){Object.values(v).forEach(walk);return;}
      const s=str(v);if(s)out.push(s);
    };
    walk(value);return uniq(out);
  };

  function directTechnicalValues(source,{includeRootId=true}={}){
    if(!source||typeof source!=='object')return [];
    const out=[];
    if(includeRootId&&str(source.id))out.push(str(source.id));
    for(const key of TECHNICAL_KEYS)out.push(...flatten(source[key]));
    for(const key of ALIAS_COLLECTION_KEYS)out.push(...flatten(source[key]));
    for(const container of ['legacy','identity','crosswalk','profile']){
      const nested=source[container];
      if(!nested||typeof nested!=='object')continue;
      for(const key of TECHNICAL_KEYS)out.push(...flatten(nested[key]));
      for(const key of ALIAS_COLLECTION_KEYS)out.push(...flatten(nested[key]));
    }
    return uniq(out);
  }

  function add(index,token,profileId){
    token=str(token);profileId=str(profileId);
    if(!token||!profileId)return;
    if(!index.has(token))index.set(token,new Set());
    index.get(token).add(profileId);
  }

  function candidateIds(index,source){
    const ids=new Set();
    for(const token of directTechnicalValues(source)){
      const owners=index.get(token);
      if(owners)for(const id of owners)ids.add(id);
    }
    return [...ids].sort();
  }

  function buildCanonicalProfileIndex(profiles,linkedSources=[]){
    const rows=Array.isArray(profiles)?profiles:[];
    const canonicalIds=new Set();
    const index=new Map();
    const conflicts=[];
    for(const profile of rows){
      const canonical=str(profile&& (profile.shopperId||profile.id));
      if(!canonical)continue;
      canonicalIds.add(canonical);
      add(index,canonical,canonical);
      for(const token of directTechnicalValues(profile))add(index,token,canonical);
    }

    const sources=Array.isArray(linkedSources)?linkedSources.filter(Boolean):[];
    const consumed=new Set();
    for(let pass=0;pass<3;pass++){
      let changed=false;
      sources.forEach((source,sourceIndex)=>{
        if(consumed.has(sourceIndex)||!source||typeof source!=='object')return;
        const directOwners=uniq(OWNER_KEYS.map(key=>source[key]).filter(value=>canonicalIds.has(str(value))));
        const candidates=directOwners.length?directOwners:candidateIds(index,source);
        if(candidates.length===1){
          const owner=candidates[0];
          for(const token of directTechnicalValues(source)){
            const before=index.get(token)?.size||0;add(index,token,owner);const after=index.get(token)?.size||0;
            if(after!==before)changed=true;
          }
          consumed.add(sourceIndex);
        }else if(candidates.length>1){
          conflicts.push({sourceIndex,candidates,reason:'ambiguous_exact_technical_anchor'});
          consumed.add(sourceIndex);
        }
      });
      if(!changed)break;
    }

    const resolve=source=>{
      const candidates=candidateIds(index,source);
      return candidates.length===1
        ?{ok:true,canonicalId:candidates[0],candidates,reason:'unique_exact_technical_anchor'}
        :{ok:false,canonicalId:null,candidates,reason:candidates.length?'ambiguous_exact_technical_anchor':'no_exact_technical_anchor'};
    };
    return {version:VERSION,index,canonicalIds:[...canonicalIds].sort(),conflicts,resolve};
  }

  const api=Object.freeze({
    version:VERSION,
    technicalKeys:TECHNICAL_KEYS,
    ownerKeys:OWNER_KEYS,
    aliasCollectionKeys:ALIAS_COLLECTION_KEYS,
    forbiddenMatchKeys:FORBIDDEN_MATCH_KEYS,
    collectExactValues:directTechnicalValues,
    buildCanonicalProfileIndex
  });
  root.CX_EXACT_IDENTITY_CONTRACT=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
