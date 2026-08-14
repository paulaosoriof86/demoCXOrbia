/* CXOrbia — exact linked owner normalizer v1.
   Reusable runtime seam: canonicalizes protected linked-source owner ids through the shared
   exact identity contract before cumulative HR composition. Exact technical anchors only;
   ambiguous/unresolved sources remain unchanged and fail closed into existing review logic. */
(function(root){
  'use strict';
  const VERSION='cxorbia-exact-linked-owner-normalizer-v1';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const contract=root.CX_EXACT_IDENTITY_CONTRACT;
  const composer=root.CX_TYA_CUMULATIVE_READ_MODEL;
  if(!contract||typeof contract.buildCanonicalProfileIndex!=='function'||!composer||typeof composer.compose!=='function'){
    root.CX_EXACT_LINKED_OWNER_NORMALIZER={version:VERSION,installed:false,reason:'required_contract_or_composer_missing'};
    return;
  }
  if(composer.__exactLinkedOwnerNormalizerVersion===VERSION)return;

  const originalCompose=composer.compose.bind(composer);
  const linkedKeys=['visits','certifications','liquidations','postulations','applications','posts'];

  function normalizeInput(input){
    const next=clone(input||{});
    next.protectedPayload=next.protectedPayload||{};
    const profiles=arr(next.protectedPayload.shoppers);
    const linked=[];
    linkedKeys.forEach(key=>linked.push(...arr(next.protectedPayload[key])));
    const index=contract.buildCanonicalProfileIndex(profiles,linked);
    const diagnostics={version:VERSION,linkedSources:0,canonicalized:0,unresolved:0,ambiguous:0,contractConflicts:arr(index.conflicts).length};

    for(const key of linkedKeys){
      next.protectedPayload[key]=arr(next.protectedPayload[key]).map(source=>{
        diagnostics.linkedSources++;
        const row=clone(source||{});
        const resolution=index.resolve(row);
        if(resolution&&resolution.ok&&str(resolution.canonicalId)){
          const canonical=str(resolution.canonicalId);
          const original=str(row.shopperId||row.profileId||row.shopperDocId);
          if(original&&original!==canonical)row.__exactIdentityOriginalOwnerId=original;
          row.shopperId=canonical;
          diagnostics.canonicalized++;
        }else if(resolution&&arr(resolution.candidates).length>1){
          diagnostics.ambiguous++;
        }else{
          diagnostics.unresolved++;
        }
        return row;
      });
    }
    return {input:next,diagnostics};
  }

  composer.compose=function(input){
    const prepared=normalizeInput(input);
    const result=originalCompose(prepared.input);
    if(result&&typeof result==='object'){
      result.identityOwnerNormalizerVersion=VERSION;
      result.identityOwnerNormalizerDiagnostics=prepared.diagnostics;
    }
    return result;
  };
  composer.__exactLinkedOwnerNormalizerVersion=VERSION;
  root.CX_EXACT_LINKED_OWNER_NORMALIZER=Object.freeze({version:VERSION,installed:true,normalizeInput});
})(typeof window!=='undefined'?window:globalThis);
