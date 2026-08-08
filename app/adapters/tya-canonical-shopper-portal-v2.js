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
  const canonicalId=()=>{const raw=str(CX.session?.user?.shopperId),map=CX.data?.__identityMap||{};return str(map[raw]||raw);};
  const cert=s=>s?.certificationStatus||((s?.certified)?'certificada':s?.certificationPresented?'presentada':'sin_registro');
  function rows(vs,ui){return vs.length?`<div style="overflow:auto"><table class="tbl"><thead><tr><th>Periodo</th><th>Visita</th><th>Estado</th><th>Fecha</th><th>País</th></tr></thead><tbody>${vs.map(v=>{const st=stage(v);return `<tr><td>${esc(v.periodLabel||v.periodKey)}</td><td><b>${esc(v.sucursal)}</b><div style="font-size:10px;color:var(--t3)">${esc(v.escenario)} · ${esc(v.ciudad)}</div></td><td><span class="bdg bdg-${st[1]}">${esc(st[0])}</span></td><td>${esc(v.realizada||v.cuestFecha||v.submittedAt||v.agendada||v.disponibleDesde||'—')}</td><td>${esc(v.pais||v.country||'—')}</td></tr>`;}).join('')}</tbody></table></div>`:ui.empty('🗒️','Sin visitas en esta categoría.');}
  function render({data,ui}){
    const sid=canonicalId(),host=ui.el('div');
    if(!sid){host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('🔒','No existe una identidad canónica verificable para esta sesión.')}</div>`;return host;}
    const s=data.getShopper?.(sid)||arr(data.shoppers).find(x=>str(x.id||x.shopperId)===sid);
    if(!s){host.innerHTML=`${ui.ph('Mi Perfil','Identidad Shopper')}<div class="card card-p">${ui.empty('🔒','La identidad de esta sesión no está vinculada al read model canónico.')}</div>`;return host;}
    const visits=data.visitsForShopper(s.id,false).slice().sort((a,b)=>str(b.realizada||b.cuestFecha||b.submittedAt||b.agendada).localeCompare(str(a.realizada||a.cuestFecha||a.submittedAt||a.agendada)));
    const st=data.shopperStats(s.id),cs=cert(s),complete=!!data.shopperProfileComplete?.(s);
    const active=visits.filter(v=>{const f=facets(v);return f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled;});
    const done=visits.filter(v=>facets(v).realized),submitted=visits.filter(v=>facets(v).submitted),paid=visits.filter(v=>facets(v).paymentConfirmed);
    let tab='all';
    const draw=()=>{
      const list=tab==='active'?active:tab==='done'?done:tab==='submitted'?submitted:tab==='paid'?paid:visits;
      host.innerHTML=`${ui.ph('Mi Perfil','Identidad, acceso, certificación e histórico canónico')}
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="gap:12px;align-items:flex-start"><div><div class="card-t" style="font-size:18px">${esc(s.nombre)}</div><div style="font-size:11px;color:var(--t3);margin-top:3px">${esc(s.id)} · ${esc(s.ciudad)} · ${esc(s.pais)}</div></div><div class="flex wrap" style="gap:6px"><span class="bdg bdg-${complete?'g':'a'}">${complete?'Perfil completo':'Perfil incompleto'}</span><span class="bdg bdg-${cs==='certificada'?'g':cs==='presentada'?'b':'n'}">${cs==='certificada'?'Certificada':cs==='presentada'?'Certificación presentada':'Sin certificación'}</span></div></div>
        <div class="grid g4" style="margin-top:14px"><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">USUARIO</div><b>${esc(s.username||s.user||'— sin dato')}</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CONTRASEÑA</div><b>${esc(s.password||s.pass||'— sin dato')}</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">WHATSAPP</div><b>${esc(s.whatsapp||s.phone||'— sin dato')}</b></div><div class="card card-p" style="padding:10px"><div class="muted" style="font-size:10px">CORREO</div><b>${esc(s.email||'— sin dato')}</b></div></div>
        <div style="font-size:11px;color:var(--t3);margin-top:9px">Los datos faltantes no se inventan. Una actualización persistente requiere fuente real y gate de escritura.</div>
      </div>
      <div class="grid g4" style="margin-bottom:12px">${ui.kpi('Visitas',st.total,'b')}${ui.kpi('Realizadas',st.realizadas,'g')}${ui.kpi('Submitidas',st.submitted,'p')}${ui.kpi('Pagadas confirmadas',st.paymentConfirmed,'g')}</div>
      <div class="card card-p"><div class="between" style="gap:8px;flex-wrap:wrap;margin-bottom:10px"><div class="card-t">Histórico de visitas · ${visits.length}</div><div class="flex wrap" style="gap:6px"><button class="btn btn-sm ${tab==='all'?'btn-pr':'btn-ghost'}" data-tab="all">Todas ${visits.length}</button><button class="btn btn-sm ${tab==='active'?'btn-pr':'btn-ghost'}" data-tab="active">Activas ${active.length}</button><button class="btn btn-sm ${tab==='done'?'btn-pr':'btn-ghost'}" data-tab="done">Realizadas ${done.length}</button><button class="btn btn-sm ${tab==='submitted'?'btn-pr':'btn-ghost'}" data-tab="submitted">Submitidas ${submitted.length}</button><button class="btn btn-sm ${tab==='paid'?'btn-pr':'btn-ghost'}" data-tab="paid">Pagadas ${paid.length}</button></div></div>${rows(list,ui)}</div>`;
      host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
    };
    draw();return host;
  }
  function install(){if(!CX.modules)return;CX.modules.miperfil=render;window.CX_TYA_CANONICAL_SHOPPER_PORTAL={ready:true,version:'canonical-shopper-portal-v2',exactIdentityOnly:true,fullHistory:true,certificationVisible:true,providerWrites:0,production:false};}
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('cx:full-visual-ready',install);
})();
