/* CXOrbia — reusable period-independent identity roll-forward contract v1.
   Purpose:
   - Reuse an already-authoritative source->canonical shopper link across any future period.
   - Keep tenant/project/source namespaces isolated.
   - Never infer identity from name/email/phone/WhatsApp/username.
   - A source-safe identifier becomes reusable only when an authoritative persisted link says so.
   - Pure source logic: no provider calls, writes, deploys or UI mutations. */
(function(root){
  'use strict';

  const VERSION='cxorbia-identity-roll-forward-v1';
  const ACTIVE_STATES=new Set(['active','confirmed','approved','materialized']);
  const TRUSTED_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact']);
  const DEFAULT_TECHNICAL_KEYS=[
    'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
    'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId',
    'sourceIdentityKey','sourceSubjectId'
  ];
  const ALIAS_KEYS=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
  const FORBIDDEN_MATCH_KEYS=new Set([
    'nombre','name','displayName','fullName','shopperName','email','correo','phone','telefono',
    'whatsapp','username','user','login','loginIdentifier','normalizedLogin','shopperCode'
  ]);

  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
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

  function technicalKeys(){
    const inherited=root.CX_EXACT_IDENTITY_CONTRACT?.technicalKeys;
    return uniq([...(Array.isArray(inherited)?inherited:DEFAULT_TECHNICAL_KEYS),...DEFAULT_TECHNICAL_KEYS]);
  }

  function collectTechnicalTokens(source){
    if(!source||typeof source!=='object')return [];
    const out=[];
    const containers=[source,source.sourceIdentity,source.identity,source.crosswalk,source.profile,source.exactIdentityAnchors].filter(v=>v&&typeof v==='object');
    for(const obj of containers){
      for(const key of technicalKeys()){
        if(FORBIDDEN_MATCH_KEYS.has(key))continue;
        out.push(...flatten(obj[key]));
      }
      for(const key of ALIAS_KEYS)out.push(...flatten(obj[key]));
    }
    return uniq(out);
  }

  function authorityType(link){return str(link?.authorityType||link?.authority?.type).toLowerCase();}
  function authorityRef(link){
    return str(link?.authorityRef||link?.authority?.evidenceRef||link?.authority?.adjudicationId||link?.authority?.providerRef||link?.authority?.commandId||link?.providerAckRef||link?.adjudicationId||link?.commandId||link?.idempotencyKey||link?.id);
  }
  function projectScope(link){
    const explicit=str(link?.projectScope||link?.scope?.projectId||link?.projectId);
    if(!explicit||explicit==='*'||explicit.toLowerCase()==='tenant')return '*';
    return explicit;
  }
  function sourceSystem(link){return str(link?.sourceSystem||link?.sourceNamespace||link?.sourceType||link?.sourceIdentity?.sourceSystem).toLowerCase();}
  function canonicalId(link){return str(link?.canonicalShopperId||link?.canonicalId||link?.shopperId||link?.profileId);}
  function tenant(link){return str(link?.tenantId||link?.scope?.tenantId);}
  function status(link){return str(link?.status||link?.state||'').toLowerCase();}

  function normalizeLink(link){
    if(!link||typeof link!=='object')return {ok:false,reason:'invalid-link'};
    const tenantId=tenant(link),canonicalShopperId=canonicalId(link),system=sourceSystem(link),scope=projectScope(link),auth=authorityType(link),ref=authorityRef(link),tokens=collectTechnicalTokens(link);
    const errors=[];
    if(!tenantId)errors.push('missing-tenantId');
    if(!canonicalShopperId)errors.push('missing-canonicalShopperId');
    if(!system)errors.push('missing-sourceSystem');
    if(!tokens.length)errors.push('missing-exact-source-token');
    if(!ACTIVE_STATES.has(status(link)))errors.push('link-not-active');
    if(!TRUSTED_AUTHORITIES.has(auth))errors.push('untrusted-authority');
    if(!ref)errors.push('missing-authorityRef');
    if(link.periodKey||link.periodId||link.periodScope)errors.push('period-scoped-link-forbidden');
    return errors.length?{ok:false,reason:errors.join(','),errors}:{ok:true,link:{
      id:str(link.id||link.identityLinkId||''),tenantId,canonicalShopperId,sourceSystem:system,projectScope:scope,
      sourceTokens:tokens,authorityType:auth,authorityRef:ref,status:status(link),periodIndependent:true
    }};
  }

  function key(tenantId,system,scope,token){return [str(tenantId),str(system).toLowerCase(),str(scope||'*'),str(token)].join('::');}

  function buildIndex(links){
    const records=[],rejected=[],map=new Map();
    for(const raw of arr(links)){
      const normalized=normalizeLink(raw);
      if(!normalized.ok){rejected.push({id:str(raw?.id||raw?.identityLinkId||''),reason:normalized.reason});continue;}
      const link=normalized.link;records.push(link);
      for(const token of link.sourceTokens){
        const k=key(link.tenantId,link.sourceSystem,link.projectScope,token);
        if(!map.has(k))map.set(k,[]);
        map.get(k).push(link);
      }
    }

    function resolve(source,context){
      context=context||{};
      const tenantId=str(context.tenantId||source?.tenantId),projectId=str(context.projectId||source?.projectId),system=str(context.sourceSystem||source?.sourceSystem||source?.sourceNamespace||source?.sourceType).toLowerCase();
      const tokens=collectTechnicalTokens(source),matches=[];
      if(!tenantId)return {ok:false,canonicalShopperId:null,reason:'missing-tenantId',matches:[]};
      if(!system)return {ok:false,canonicalShopperId:null,reason:'missing-sourceSystem',matches:[]};
      if(!tokens.length)return {ok:false,canonicalShopperId:null,reason:'no-exact-source-token',matches:[]};
      for(const token of tokens){
        const scopes=projectId?[projectId,'*']:['*'];
        for(const scope of scopes){
          for(const link of map.get(key(tenantId,system,scope,token))||[]){
            if(!matches.includes(link))matches.push(link);
          }
        }
      }
      const canonicalIds=uniq(matches.map(x=>x.canonicalShopperId));
      if(canonicalIds.length===1)return {ok:true,canonicalShopperId:canonicalIds[0],reason:'authoritative_period_independent_link',matches,periodIndependent:true};
      if(canonicalIds.length>1)return {ok:false,canonicalShopperId:null,reason:'conflicting_authoritative_links',matches,canonicalIds};
      return {ok:false,canonicalShopperId:null,reason:'no_authoritative_link',matches:[],periodIndependent:true};
    }

    return {version:VERSION,records,rejected,resolve,periodIndependent:true};
  }

  function reviewIdentity(source,context){
    context=context||{};
    const tokens=collectTechnicalTokens(source);
    return {
      tenantId:str(context.tenantId||source?.tenantId),
      projectId:str(context.projectId||source?.projectId)||null,
      sourceSystem:str(context.sourceSystem||source?.sourceSystem||source?.sourceNamespace||source?.sourceType).toLowerCase(),
      sourceTokens:tokens,
      periodIndependentDedupe:true,
      periodKeyObserved:str(context.periodKey||source?.periodKey||source?.periodId)||null,
      action:'tenant_adjudication_or_independent_exact_authority_required'
    };
  }

  function installComposerBridge(){
    const model=root.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!model||typeof model.compose!=='function'||model.__identityRollForwardWrapped)return false;
    const original=model.compose.bind(model);
    model.compose=function(input){
      const prepared=JSON.parse(JSON.stringify(input||{}));
      prepared.hr=prepared.hr||{};prepared.protectedPayload=prepared.protectedPayload||{};
      const links=arr(prepared.protectedPayload.identityLinks).length
        ?prepared.protectedPayload.identityLinks
        :arr(root.CX?.data?.__protectedIdentityLinks);
      const index=buildIndex(links);
      let resolved=0,unresolved=0,conflicts=0;
      prepared.hr.shoppers=arr(prepared.hr.shoppers).map(source=>{
        const row=Object.assign({},source||{});
        const context={
          tenantId:str(row.tenantId||prepared.hr.tenantId||root.CX?.backend?.tenantId?.()),
          projectId:str(row.projectId||prepared.hr.currentProjectId||root.CX?.data?.currentProjectId),
          sourceSystem:str(row.sourceSystem||row.sourceNamespace||row.sourceType||prepared.hr.sourceSystem||'hr').toLowerCase()
        };
        const result=index.resolve(row,context);
        if(result.ok){
          row.profileId=result.canonicalShopperId;
          row.__identityRollForwardAuthoritative=true;
          row.__identityRollForwardAuthority='persisted_link';
          resolved++;
        }else if(result.reason==='conflicting_authoritative_links'){
          row.__identityRollForwardConflict=true;conflicts++;
        }else unresolved++;
        return row;
      });
      const result=original(prepared);
      if(result&&result.diagnostics){
        result.diagnostics.identityRollForward={
          version:VERSION,periodIndependent:true,linksRead:links.length,trustedLinks:index.records.length,
          rejectedLinks:index.rejected.length,resolved,unresolved,conflicts
        };
      }
      return result;
    };
    model.__identityRollForwardWrapped=true;
    return true;
  }

  function installRuntimeReadBridge(){
    if(typeof window==='undefined'||!root.CX||!root.firebase)return false;
    const params=new URLSearchParams(root.location?.search||'');
    if(!params.get('cxProtectedRuntime'))return false;
    const CX=root.CX;
    let reading=false,lastSignature='';
    const state=(patch)=>{
      root.CX_IDENTITY_ROLL_FORWARD_RUNTIME=Object.assign({version:VERSION,periodIndependent:true,providerWrites:0,production:false},root.CX_IDENTITY_ROLL_FORWARD_RUNTIME||{},patch||{}, {at:new Date().toISOString()});
      return root.CX_IDENTITY_ROLL_FORWARD_RUNTIME;
    };
    const context=()=>{try{return CX.backendAuth?.context?.()||CX.backend?.authContext?.()||null;}catch(_){return null;}};
    const operator=ctx=>['super','admin','ops','coordinador'].includes(str(ctx?.role).toLowerCase());
    const shopper=ctx=>str(ctx?.role).toLowerCase()==='shopper';
    async function readLinks(reason){
      if(reading)return {ok:true,skipped:true,reason:'read_in_progress'};
      const ctx=context(),tenantId=str(ctx?.tenantId||CX.backend?.tenantId?.()||CX.BACKEND?.tenantId);
      if(!tenantId)return {ok:false,skipped:true,reason:'tenant_not_ready'};
      if(!root.firebase?.firestore)return {ok:false,skipped:true,reason:'firestore_not_ready'};
      reading=true;
      try{
        const db=root.firebase.firestore();
        const collectionName=str(CX.BACKEND?.collections?.shopperIdentityLinks||'shopperIdentityLinks');
        let query=db.collection('tenants').doc(tenantId).collection(collectionName);
        if(shopper(ctx)){
          if(!str(ctx?.shopperId))return {ok:false,skipped:true,reason:'shopper_scope_missing'};
          query=query.where('canonicalShopperId','==',str(ctx.shopperId));
        }else if(!operator(ctx)){
          CX.data.__protectedIdentityLinks=[];
          state({ready:true,reason:'role_has_no_identity_link_read_surface',tenantId,links:0,trustedLinks:0});
          return {ok:true,links:[]};
        }
        const snap=await query.get();
        const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{}));
        const index=buildIndex(rows);
        const trusted=index.records;
        const signature=JSON.stringify(trusted.map(x=>[x.id,x.tenantId,x.projectScope,x.sourceSystem,x.canonicalShopperId,x.authorityType,x.authorityRef,x.sourceTokens].join('|')).sort());
        CX.data.__protectedIdentityLinks=rows;
        state({ready:true,reason:reason||'provider_read',tenantId,links:rows.length,trustedLinks:trusted.length,rejectedLinks:index.rejected.length,providerReads:1});
        if(signature!==lastSignature){
          lastSignature=signature;
          setTimeout(()=>{try{root.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('identity_roll_forward_links_ready');}catch(_){}},0);
        }
        return {ok:true,links:rows,index};
      }catch(error){
        state({ready:false,reason:'provider_read_failed',error:str(error?.message||error),providerReads:1});
        return {ok:false,error:str(error?.message||error)};
      }finally{reading=false;}
    }
    if(CX.bus?.on){
      CX.bus.on('backend-auth-ready',()=>setTimeout(()=>readLinks('backend_auth_ready'),0));
      CX.bus.on('backend-ready',()=>setTimeout(()=>readLinks('backend_ready'),0));
    }
    root.CX_REFRESH_IDENTITY_ROLL_FORWARD_LINKS=readLinks;
    state({ready:false,reason:'installed_waiting_for_authenticated_provider'});
    return true;
  }

  function install(){
    const composer=installComposerBridge();
    const runtime=installRuntimeReadBridge();
    if(typeof window!=='undefined'&&!composer){
      let attempts=0;const timer=setInterval(()=>{attempts++;if(installComposerBridge()||attempts>120)clearInterval(timer);},50);
    }
    return {composer,runtime};
  }
  const api=Object.freeze({
    version:VERSION,
    activeStates:[...ACTIVE_STATES],trustedAuthorities:[...TRUSTED_AUTHORITIES],
    forbiddenMatchKeys:[...FORBIDDEN_MATCH_KEYS],periodIndependent:true,multiTenant:true,multiProject:true,
    collectTechnicalTokens,normalizeLink,buildIndex,reviewIdentity,installComposerBridge,installRuntimeReadBridge,install
  });
  root.CX_IDENTITY_ROLL_FORWARD_CONTRACT=api;
  if(typeof window!=='undefined')install();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
