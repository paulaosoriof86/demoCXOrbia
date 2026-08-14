/* CXOrbia TyA — canonical Shopper portal v2 (DEV human visual).
   One exact identity powers Mi Perfil, KPI drills, visit history, credentials, contact and
   certification. Read-only validation adapter; no profile/Auth/HR writes. */
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  if(params.get('cxHumanFullVisual')!=='YES_PAULA_20260731_FULL_PROFILE_DEV')return;
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const facets=v=>CX.data?.visitFacets?CX.data.visitFacets(v):(window.CX_TYA_CUMULATIVE_READ_MODEL?.facets?.(v)||v?.canonicalFacets||{});
  const stage=v=>{const f=facets(v);if(f.paymentConfirmed)return ['Pagada','g'];if(f.liquidationConfirmed)return ['Liquidada','g'];if(f.submitted)return ['Submitida','t'];if(f.questionnaire)return ['Cuestionario completo · pendiente de submitir','p'];if(f.realized)return ['Realizada · pendiente de cuestionario','a'];if(f.outOfRange)return ['Fuera de rango','r'];if(f.scheduled)return ['Agendada','t'];if(f.assigned)return ['Asignada · pendiente de agendar','b'];if(f.available)return ['Disponible','b'];return ['Pendiente','n'];};
  const cert=s=>s?.certificationStatus||((s?.certified)?'certificada':s?.certificationPresented?'presentada':'sin_registro');
  const flatten=v=>{const out=[];const walk=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(walk);return;}if(typeof x==='object'){Object.values(x).forEach(walk);return;}const s=str(x);if(s)out.push(s);};walk(v);return out;};
  function technicalAliases(row){
    if(!row||typeof row!=='object')return [];
    const contract=window.CX_EXACT_IDENTITY_CONTRACT;
    if(contract&&typeof contract.collectExactValues==='function')return contract.collectExactValues(row);
    const values=[
      row.id,row.shopperId,row.legacyShopperId,row.legacyId,row.sourceId,row.sourceKey,row.externalShopperId,
      row.canonicalLegacyIds,row.legacyLiveShopperIds,row.sourceShopperIds,row.hrShopperIds,row.externalShopperIds,
      row.identityAliases,row.aliases,row.exactAliases,row.crosswalk?.aliases,row.identity?.aliases,row.profile?.aliases
    ];
    return [...new Set(values.flatMap(flatten).map(str).filter(Boolean))];
  }
  function authContext(){
    try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}
  }
  function sessionShopperId(){
    return str(CX.session?.user?.shopperId||authContext()?.shopperId);
  }
  function resolveSessionShopper(data){
    const raw=sessionShopperId(),map=data?.__identityMap||{},rows=arr(data?.shoppers);
    if(!raw)return {ok:false,reason:'missing_session_shopper_id',raw:'',matches:[]};
    const tokens=new Set([raw]);
    if(str(map[raw]))tokens.add(str(map[raw]));
    Object.entries(map).forEach(([live,canonical])=>{
      live=str(live);canonical=str(canonical);
      if(live===raw||canonical===raw){if(live)tokens.add(live);if(canonical)tokens.add(canonical);}
    });
    const matches=[];
    const add=row=>{if(!row)return;const key=str(row.id||row.shopperId);if(!matches.some(x=>str(x.id||x.shopperId)===key&&key))matches.push(row);};
    tokens.forEach(token=>{try{add(data?.getShopper?.(token));}catch(_){}});
    rows.forEach(row=>{
      const aliases=technicalAliases(row);
      if(aliases.some(a=>tokens.has(a)))add(row);
    });
    if(matches.length!==1)return {ok:false,reason:matches.length?'ambiguous_exact_identity':'no_exact_identity',raw,tokens:[...tokens],matches};
    const row=matches[0],canonical=str(row.id||row.shopperId);
    if(canonical&&raw&&data&&data.__identityMap&&typeof data.__identityMap==='object'&&!data.__identityMap[raw])data.__identityMap[raw]=canonical;
    return {ok:true,reason:'unique_exact_identity',raw,canonical,row,tokens:[...tokens],matches};
  }
  function authorityPending(){
    const ctx=authContext();
    return !!(ctx?.authenticated&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied!==true);
  }
  function rows(vs,ui){return vs.length?`<div style="overflow:auto"><table class="tbl"><thead><tr><th>Periodo</th><th>Visita</th><th>Estado</th><th>Fecha</th><th>País</th></tr></thead><tbody>${vs.map(v=>{const st=stage(v);return `<tr><td>${esc(v.periodLabel||v.periodKey)}</td><td><b>${esc(v.sucursal)}</b><div style="font-size:10px;color:var(--t3)">${esc(v.escenario)} · ${esc(v.ciudad)}</div></td><td><span class="bdg bdg-${st[1]}">${esc(st[0])}</span></td><td>${esc(v.realizada||v.cuestFecha||v.submittedAt||v.agendada||v.disponibleDesde||'—')}</td><td>${esc(v.pais||v.country||'—')}</td></tr>`;}).join('')}</tbody></table></div>`:ui.empty('🗒️','Sin visitas en esta categoría.');}
  function render({data,ui}){
    const host=ui.el('div');
    let identity=resolveSessionShopper(data);
    const redraw=()=>{
      const next=render({data:CX.data,ui});
      host.replaceChildren(...Array.from(next.childNodes));
    };
    if(!identity.ok&&authorityPending()){
      try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('shopper_portal_requires_hr_authority',true);}catch(_){}
      window.addEventListener('cx:protected-auth-hr-authority-ready',redraw,{once:true});
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('⏳','Validando tu identidad e histórico contra la HR viva…')}</div>`;
      return host;
    }
    if(!identity.ok){
      const reason=identity.reason==='ambiguous_exact_identity'?'Se encontraron varias relaciones técnicas exactas y se requiere revisión; no se unieron identidades por nombre.':'La identidad de esta sesión no está vinculada al read model canónico.';
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('🔒',reason)}</div>`;
      return host;
    }
    const s=identity.row,shopperKey=str(s.id||s.shopperId||identity.canonical);
    const visits=data.visitsForShopper(shopperKey,false).slice().sort((a,b)=>str(b.realizada||b.cuestFecha||b.submittedAt||b.agendada).localeCompare(str(a.realizada||a.cuestFecha||a.submittedAt||a.agendada)));
    const st=data.shopperStats(shopperKey),cs=cert(s),complete=!!data.shopperProfileComplete?.(s);
    const active=visits.filter(v=>{const f=facets(v);return f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled;});
    const done=visits.filter(v=>facets(v).realized),submitted=visits.filter(v=>facets(v).submitted),paid=visits.filter(v=>facets(v).paymentConfirmed);
    let tab='all';
    const draw=()=>{
      const list=tab==='active'?active:tab==='done'?done:tab==='submitted'?submitted:tab==='paid'?paid:visits;
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad, acceso, certificación e histórico canónico')}
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="gap:12px;align-items:flex-start"><div><div class="card-t" style="font-size:18px">${esc(s.nombre)}</div><div style="font-size:11px;color:var(--t3);margin-top:3px">${esc(shopperKey)} · ${esc(s.ciudad)} · ${esc(s.pais)}</div></div><div class="flex wrap" style="gap:6px"><span class="bdg bdg-${complete?'g':'a'}">${complete?'Perfil completo':'Perfil incompleto'}</span><span class="bdg bdg-${cs==='certificada'?'g':cs==='presentada'?'b':'n'}">${cs==='certificada'?'Certificada':cs==='presentada'?'Certificación presentada':'Sin certificación'}</span></div></div>
        <div class="grid g4" style="margin-top:14px"><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">USUARIO</div><b>${esc(s.username||s.user||'— sin dato')}</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CREDENCIAL</div><b>Protegida</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">WHATSAPP</div><b>${esc(s.whatsapp||s.phone||'— sin dato')}</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CORREO</div><b>${esc(s.email||'— sin dato')}</b></div></div>
        <div style="font-size:11px;color:var(--t3);margin-top:9px">Los datos faltantes no se inventan. Una actualización persistente requiere fuente real y gate de escritura.</div>
      </div>
      <div class="grid g4" style="margin-bottom:12px">${ui.kpi('Visitas',st.total,'b')}${ui.kpi('Realizadas',st.realizadas,'g')}${ui.kpi('Submitidas',st.submitted,'p')}${ui.kpi('Pagadas confirmadas',st.paymentConfirmed,'g')}</div>
      <div class="card card-p"><div class="between" style="gap:8px;flex-wrap:wrap;margin-bottom:10px"><div class="card-t">Histórico de visitas · ${visits.length}</div><div class="flex wrap" style="gap:6px"><button class="btn btn-sm ${tab==='all'?'btn-pr':'btn-ghost'}" data-tab="all">Todas ${visits.length}</button><button class="btn btn-sm ${tab==='active'?'btn-pr':'btn-ghost'}" data-tab="active">Activas ${active.length}</button><button class="btn btn-sm ${tab==='done'?'btn-pr':'btn-ghost'}" data-tab="done">Realizadas ${done.length}</button><button class="btn btn-sm ${tab==='submitted'?'btn-pr':'btn-ghost'}" data-tab="submitted">Submitidas ${submitted.length}</button><button class="btn btn-sm ${tab==='paid'?'btn-pr':'btn-ghost'}" data-tab="paid">Pagadas ${paid.length}</button></div></div>${rows(list,ui)}</div>`;
      host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
    };
    draw();return host;
  }
  function install(){if(!CX.modules)return;CX.modules.miperfil=render;window.CX_TYA_CANONICAL_SHOPPER_PORTAL={ready:true,version:'canonical-shopper-portal-v2-p0-shared-identity-contract',exactIdentityOnly:true,identityContractVersion:window.CX_EXACT_IDENTITY_CONTRACT?.version||'legacy-fallback',fullHistory:true,certificationVisible:true,providerWrites:0,production:false,resolveExactSessionShopper:resolveSessionShopper,currentAuthContext:authContext,isAuthorityPending:authorityPending};}
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('cx:full-visual-ready',install);
})();
