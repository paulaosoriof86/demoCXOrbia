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
  const certEvidence=s=>arr(s?.certificationEvidenceRecords);
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
  const credentialApi=window.CX_SHOPPER_CREDENTIAL_RULE;
  const shopperCredentialRule=s=>credentialApi?.shopperCredentialRule?.(s)||{ok:false,login:'',password:'',firstName:'',lastName:''};
  function authContext(){
    try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}
  }
  function authenticatedEmail(){
    try{
      const email=str(window.firebase?.auth?.()?.currentUser?.email);
      return /@auth\.cxorbia\.invalid$/i.test(email)?'':email;
    }catch(_){return '';}
  }
  function currentSessionCredential(){
    try{
      const c=CX.backendAuth?.sessionCredential?.()||null;
      return c&&c.available===true?c:{available:false,username:null,password:null,source:'none'};
    }catch(_){return {available:false,username:null,password:null,source:'none'};}
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
    const protectedSession=data?.__sessionShopperProfile;
    if(protectedSession&&tokens.has(str(protectedSession.id||protectedSession.shopperId)))add(protectedSession);
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
    const redraw=()=>{
      const next=render({data:CX.data,ui});
      host.replaceChildren(...Array.from(next.childNodes));
    };
    if(authorityPending()){
      const onReady=()=>redraw();
      window.addEventListener('cx:protected-auth-hr-authority-ready',onReady,{once:true});
      try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('shopper_portal_requires_hr_authority',true);}catch(_){}
      setTimeout(()=>{
        if(!authorityPending()){
          window.removeEventListener('cx:protected-auth-hr-authority-ready',onReady);
          redraw();
        }
      },0);
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('⏳','Validando tu identidad e histórico contra la HR viva…')}</div>`;
      return host;
    }
    const identity=resolveSessionShopper(data);
    if(!identity.ok){
      const reason=identity.reason==='ambiguous_exact_identity'?'Se encontraron varias relaciones técnicas exactas y se requiere revisión; no se unieron identidades por nombre.':'La identidad de esta sesión no está vinculada al read model canónico.';
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('🔒',reason)}</div>`;
      return host;
    }
    const s=identity.row,shopperKey=str(s.id||s.shopperId||identity.canonical),profileEmail=str(s.email||s.correo||s.mail),email=profileEmail||authenticatedEmail(),credential=currentSessionCredential(),rule=shopperCredentialRule(s);
    const username=rule.ok?rule.login:str(s.username||s.user||credential.username),firstName=rule.ok?rule.firstName:str(s.firstName||s.nombre),lastName=rule.ok?rule.lastName:str(s.lastName||s.apellido),passwordValue=rule.ok?rule.password:str(credential.password);
    const historySource=typeof data.shopperHistoryVisits==='function'?data.shopperHistoryVisits(shopperKey,false):data.visitsForShopper(shopperKey,false).filter(v=>v&&v.__pendingPlatformAssignmentOverlay!==true);
    const visits=historySource.slice().sort((a,b)=>str(b.realizada||b.cuestFecha||b.submittedAt||b.agendada).localeCompare(str(a.realizada||a.cuestFecha||a.submittedAt||a.agendada)));
    const st=data.shopperStats(shopperKey),cs=cert(s),historicalEvidence=certEvidence(s);
    const active=visits.filter(v=>{const f=facets(v);return f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled;});
    const done=visits.filter(v=>facets(v).realized),submitted=visits.filter(v=>facets(v).submitted),paid=visits.filter(v=>facets(v).paymentConfirmed);
    let tab='all';
    const draw=()=>{
      const list=tab==='active'?active:tab==='done'?done:tab==='submitted'?submitted:tab==='paid'?paid:visits;
      const credentialAvailable=!!str(passwordValue);
      const credentialBody=credentialAvailable
        ? `<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><b data-credential-value>••••••••</b><button class="btn btn-sm btn-ghost" type="button" data-credential-reveal aria-pressed="false">Mostrar</button><button class="btn btn-sm btn-ghost" type="button" data-credential-copy>Copiar</button></div>`
        : `<b data-credential-unavailable style="font-size:11px">Disponible al ingresar con usuario y contraseña</b>`;
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad, acceso e histórico canónico')}
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="gap:12px;align-items:flex-start"><div><div class="card-t" style="font-size:18px">${esc(s.nombre)}</div><div style="font-size:11px;color:var(--t3);margin-top:3px">${esc(shopperKey)} · ${esc(s.ciudad)} · ${esc(s.pais)}</div></div><div class="flex wrap" style="gap:6px"><span class="bdg bdg-g">Identidad vinculada</span><span class="bdg bdg-${cs==='certificada'?'g':cs==='presentada'?'b':historicalEvidence.length?'a':'n'}">${cs==='certificada'?'Certificada':cs==='presentada'?'Certificación presentada':historicalEvidence.length?'Histórico en revisión':'Sin certificación'}</span></div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:14px">
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">NOMBRE</div><b>${esc(firstName||'— sin dato')}</b></div>
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">APELLIDO</div><b>${esc(lastName||'— sin dato')}</b></div>
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">USUARIO</div><b>${esc(username||'— sin dato')}</b></div>
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CONTRASEÑA</div>${credentialBody}</div>
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">WHATSAPP</div><b>${esc(s.whatsapp||s.phone||'— sin dato')}</b></div>
          <div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CORREO</div><b>${esc(email||'— sin dato')}</b></div>
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:9px">Regla TyA: usuario = primer nombre.primer apellido y contraseña = Nombre123*; usuario y contraseña se derivan sin tildes. La contraseña se deriva para autenticación y visualización del propio shopper; no se guarda en localStorage, Firestore ni HR.</div>
      </div>
      <div class="grid g4" style="margin-bottom:12px">${ui.kpi('Visitas',st.total,'b')}${ui.kpi('Realizadas',st.realizadas,'g')}${ui.kpi('Submitidas',st.submitted,'p')}${ui.kpi('Pagadas confirmadas',st.paymentConfirmed,'g')}</div>
      <div class="card card-p"><div class="between" style="gap:8px;flex-wrap:wrap;margin-bottom:10px"><div class="card-t">Histórico de visitas · ${visits.length}</div><div class="flex wrap" style="gap:6px"><button class="btn btn-sm ${tab==='all'?'btn-pr':'btn-ghost'}" data-tab="all">Todas ${visits.length}</button><button class="btn btn-sm ${tab==='active'?'btn-pr':'btn-ghost'}" data-tab="active">Activas ${active.length}</button><button class="btn btn-sm ${tab==='done'?'btn-pr':'btn-ghost'}" data-tab="done">Realizadas ${done.length}</button><button class="btn btn-sm ${tab==='submitted'?'btn-pr':'btn-ghost'}" data-tab="submitted">Submitidas ${submitted.length}</button><button class="btn btn-sm ${tab==='paid'?'btn-pr':'btn-ghost'}" data-tab="paid">Pagadas ${paid.length}</button></div></div>${rows(list,ui)}</div>`;
      host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
      if(credentialAvailable){
        const value=host.querySelector('[data-credential-value]'),reveal=host.querySelector('[data-credential-reveal]'),copy=host.querySelector('[data-credential-copy]');
        reveal?.addEventListener('click',()=>{
          const show=reveal.getAttribute('aria-pressed')!=='true';
          reveal.setAttribute('aria-pressed',show?'true':'false');
          reveal.textContent=show?'Ocultar':'Mostrar';
          if(value)value.textContent=show?String(passwordValue):'••••••••';
        });
        copy?.addEventListener('click',async()=>{
          try{
            await navigator.clipboard.writeText(String(passwordValue));
            if(CX.ui?.toast)CX.ui.toast('Contraseña copiada para esta sesión.','',2200);
          }catch(_){
            if(CX.ui?.toast)CX.ui.toast('No fue posible copiar. Usa Mostrar para verla.','warn',2600);
          }
        });
      }
    };
    draw();return host;
  }
  function install(){if(!CX.modules)return;CX.modules.miperfil=render;window.CX_TYA_CANONICAL_SHOPPER_PORTAL={ready:true,version:'canonical-shopper-portal-v2-p0-session-credential-operational',exactIdentityOnly:true,identityContractVersion:window.CX_EXACT_IDENTITY_CONTRACT?.version||'legacy-fallback',fullHistory:true,certificationVisible:true,providerWrites:0,production:false,resolveExactSessionShopper:resolveSessionShopper,currentAuthContext:authContext,currentAuthenticatedEmail:authenticatedEmail,currentSessionCredentialState:()=>{const c=currentSessionCredential();return {available:c.available===true,usernamePresent:!!str(c.username),passwordPresent:!!str(c.password),source:str(c.source)};},isAuthorityPending:authorityPending};}
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('cx:full-visual-ready',install);
})();