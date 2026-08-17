/* CXOrbia TyA — Phase A authority compatibility bridge v1.
   Source-only / DEV read compatibility. Preserves already completed Shopper/Finance/Auth work.
   Fixes integration regressions without touching prototype modules/core or provider data:
   1) HR assignments are NOT platform postulations; synthetic hr-post-* rows are removed from CX.data._posts
      and retained only as a read-only assignment projection.
   2) Firebase membership projectIds are root-project/program scopes (e.g. cinepolis), while CX.data.projects
      stores period rows (e.g. cinepolis-2026-08). Scope filtering therefore matches exact program/rootProjectId
      as well as an exact period id, without weakening tenant/project isolation.
   3) During canonical Staff entry, backend-browser-auth can rebuild CX.session.user synchronously before the
      already-verified membership metadata is republished. Router mounting happens inside that same enter() call.
      The bridge therefore accepts ONLY the already-verified C6 membership wiring as a transient exact-scope
      fallback when provider context role/tenant/projectIds match byte-for-byte. This prevents the legacy
      p.id===scopeProjectId filter from hiding all period rows during that narrow lifecycle window.
   No Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes. No deploy/production/merge.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
  const sorted=v=>uniq(v).sort();
  const sameList=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));

  function isSyntheticHrPost(p){
    return !!(p&&/^hr-post-\d+$/i.test(str(p.id))&&p.sourceSafe===true&&str(p.aprobadaPor)==='HR TyA');
  }

  function sanitizeHrDerivedPostulations(reason){
    const data=CX.data;
    if(!data||!Array.isArray(data._posts))return {removed:0,platformPosts:0};
    const current=data._posts.slice();
    const synthetic=current.filter(isSyntheticHrPost);
    if(!synthetic.length){
      root.CX_TYA_POSTULATION_AUTHORITY=Object.assign({},root.CX_TYA_POSTULATION_AUTHORITY||{}, {
        ready:true,reason:reason||'no_synthetic_rows',platformPosts:current.length,hrAssignments:arr(data.__hrAssignmentProjection).length,
        hrAssignmentsArePostulations:false,providerWrites:0,production:false,at:new Date().toISOString()
      });
      return {removed:0,platformPosts:current.length};
    }
    data.__hrAssignmentProjection=synthetic.map(p=>({
      visitId:p.visitaId||p.visitId||null,shopperId:p.shopperId||null,shopper:p.shopper||null,
      projectId:p.projectId||null,country:p.pais||p.country||null,scheduledAt:p.fechaProp||null,
      source:'hr_assignment_projection',sourceSafe:true,readOnly:true
    }));
    data._posts=current.filter(p=>!isSyntheticHrPost(p));
    root.CX_TYA_POSTULATION_AUTHORITY={
      ready:true,reason:reason||'hr_live_snapshot',removedSyntheticHrPosts:synthetic.length,
      platformPosts:data._posts.length,hrAssignments:synthetic.length,hrAssignmentsArePostulations:false,
      providerWrites:0,production:false,at:new Date().toISOString()
    };
    return {removed:synthetic.length,platformPosts:data._posts.length};
  }

  function verifiedTransitionScope(){
    const wiring=root.CX_C6_LIVE_USER_ADMIN_WIRING||null;
    let ctx=null;
    try{ctx=CX.backendAuth&&typeof CX.backendAuth.context==='function'?CX.backendAuth.context():null;}catch(_){ctx=null;}
    if(!ctx||ctx.authenticated!==true||lower(ctx.tenantId)!=='tya'||lower(ctx.authNamespace||'staff')!=='staff')return [];
    if(!wiring||wiring.status!=='verified'||wiring.membershipVerified!==true||lower(wiring.tenantId)!=='tya')return [];
    if(!lower(ctx.role)||lower(ctx.role)!==lower(wiring.role))return [];
    if(!sameList(ctx.projectIds,wiring.projectScope))return [];
    return sorted(ctx.projectIds);
  }

  function projectScopeIds(){
    const user=CX.session&&CX.session.user;
    if(user&&user.membershipVerified===true)return sorted(user.projectIds);
    /* Narrow lifecycle fallback: membership was already provider-verified by the C6 wiring,
       but CX.app.enter() is currently inside the canonical Auth wrapper and the transient
       session metadata has not yet been republished. Never trust raw scopeProjectId alone. */
    return verifiedTransitionScope();
  }

  function matchesProjectScope(data,period,scopeIds){
    if(!period||!scopeIds.length)return false;
    const tokens=uniq([
      period.id,period.rootProjectId,period.parentProjectId,period.program,
      typeof data.programKey==='function'?data.programKey(period):null
    ]);
    return tokens.some(token=>scopeIds.includes(token));
  }

  function groupPrograms(data,periods){
    const seen={},out=[];
    arr(periods).forEach(p=>{
      const key=typeof data.programKey==='function'?data.programKey(p):str(p.program||p.rootProjectId||p.id);
      if(!key)return;
      if(!seen[key]){
        const name=typeof data.programBase==='function'?data.programBase(p):(p.programLabel||p.name||key);
        seen[key]={key,name,sample:p,periods:[]};out.push(seen[key]);
      }
      seen[key].periods.push(p);
    });
    return out;
  }

  function installScopeCompatibility(){
    const data=CX.data;
    if(!data||data.__phaseAAuthorityScopeCompat===true)return false;
    if(typeof data.projectsFor!=='function'||typeof data.scopedProyectos!=='function')return false;
    const baseProjectsFor=data.projectsFor.bind(data);
    const baseScopedProyectos=data.scopedProyectos.bind(data);

    data.projectsFor=function(role){
      const currentRole=role||(CX.session&&CX.session.role);
      if(currentRole==='shopper')return baseProjectsFor(currentRole);
      const scopeIds=projectScopeIds();
      if(!scopeIds.length)return baseProjectsFor(currentRole);
      let periods=arr(this.projects).filter(p=>matchesProjectScope(this,p,scopeIds));
      const countries=typeof this.scopePaises==='function'?this.scopePaises():null;
      if(Array.isArray(countries)&&countries.length){
        periods=periods.filter(p=>arr(p.countries).some(c=>countries.includes(c)));
      }
      return periods;
    };

    data.scopedProyectos=function(){
      const scopeIds=projectScopeIds();
      if(!scopeIds.length)return baseScopedProyectos();
      return groupPrograms(this,this.projectsFor(CX.session&&CX.session.role));
    };

    data.__phaseAAuthorityScopeCompat=true;
    return true;
  }

  function publishState(reason){
    const scopeIds=projectScopeIds();
    root.CX_TYA_PHASE_A_AUTHORITY_COMPAT={
      ready:true,version:'tya-phase-a-authority-compat-v1',reason:reason||'installed',
      scopeProjectIds:scopeIds,verifiedTransitionScope:scopeIds.length>0&&!(CX.session&&CX.session.user&&CX.session.user.membershipVerified===true),
      periodRows:arr(CX.data&&CX.data.projects).length,
      platformPosts:arr(CX.data&&CX.data._posts).length,hrAssignments:arr(CX.data&&CX.data.__hrAssignmentProjection).length,
      hrAssignmentsArePostulations:false,exactProjectScope:true,providerWrites:0,authWrites:0,hrWrites:0,
      rulesWrites:0,storageWrites:0,makeWrites:0,geminiCalls:0,paymentWrites:0,production:false,
      at:new Date().toISOString()
    };
  }

  function install(reason){
    installScopeCompatibility();
    sanitizeHrDerivedPostulations(reason||'install');
    publishState(reason||'install');
  }

  root.CX_TYA_SANITIZE_HR_DERIVED_POSTULATIONS=sanitizeHrDerivedPostulations;
  root.CX_TYA_INSTALL_PHASE_A_AUTHORITY_COMPAT=install;

  root.addEventListener('cx:live-source-updated',()=>install('live_source_updated'));
  root.addEventListener('cx:protected-auth-hr-authority-ready',()=>{sanitizeHrDerivedPostulations('protected_authority_ready');publishState('protected_authority_ready');});
  if(CX.bus&&typeof CX.bus.on==='function'){
    CX.bus.on('c6-membership-ready',()=>{installScopeCompatibility();publishState('membership_ready');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install('dom_ready'),{once:true});
  else install('script_ready');
})(typeof window!=='undefined'?window:globalThis);
