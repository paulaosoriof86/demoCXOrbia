/* CXOrbia · Shoppers (admin) — base, alta manual, perfil editable, histórico */
CX.module('shoppers', ({data,ui})=>{

  /* ---------- helpers de presentación ---------- */
  const initials=(n)=>(n||'?').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
  const av=(n,sz)=>`<div class="rail-av" style="width:${sz}px;height:${sz}px;font-size:${sz*0.38}px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${initials(n)}</div>`;
  const viaBadge=(v)=>({registro:ui.bdg('Auto-registro','b'),manual:ui.bdg('Alta manual','t'),asignacion:ui.bdg('Creado en asignación','t')})[v]||'';
  const arr=(v)=>Array.isArray(v)?v:[];
  const byId=(list,id)=>arr(list).find(x=>String(x&&x.id||'')===String(id||''))||null;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const commandOk=r=>r&&r.ok===true&&r.status==='committed'&&r.providerAck===true&&r.successUiAllowed===true;
  const commandError=r=>String(r&&((r.reason||r.code)||r.error)||'La operación no fue confirmada por el proveedor.');
  const profileRequirements=[['firstName','Nombre'],['lastName','Apellido'],['whatsapp','WhatsApp'],['pais','País'],['ciudad','Ciudad'],['email','Correo'],['edad','Edad'],['sexo','Sexo']];
  const missingProfileFields=shopper=>profileRequirements.filter(([key])=>!String(shopper?.[key]||(key==='whatsapp'?shopper?.phone:'')||'').trim()).map(([,label])=>label);
  const profileComplete=shopper=>missingProfileFields(shopper).length===0;
  const provenScore=shopper=>{const value=Number(shopper?.rating),metrics=shopper?.ratingBreakdown||shopper?.scoreBreakdown||shopper?.rankingMetrics,sourceSafe=shopper?.ratingSourceSafe===true||shopper?.scoreSourceSafe===true;return Number.isFinite(value)&&sourceSafe&&Array.isArray(metrics)&&metrics.length?{value,metrics,status:shopper?.scoreStatus||'score_preview_ready'}:null;};
  const scoreCell=shopper=>{const score=provenScore(shopper);return score?'<span style="font-size:12px;font-weight:800;color:var(--amber)">★ '+score.value+'</span>':'<span class="muted" style="font-size:11px">— sin cálculo probado</span>';};
  const profileRequestMessage=shopper=>{const missing=missingProfileFields(shopper);return 'Hola '+String(shopper?.firstName||shopper?.nombre||'')+'. Para completar tu perfil en CXOrbia, por favor actualiza: '+missing.join(', ')+'. Ingresa a Mi Perfil para hacerlo.';};
  const periodForVisit=(v)=>{
    if(!v)return null;
    const id=v.periodId||v.projectId||'';
    return byId(data.periods,id)||byId(data.projects,id);
  };
  const rootProjectIdForVisit=(v)=>{
    if(!v)return '';
    if(v.rootProjectId)return String(v.rootProjectId);
    const period=periodForVisit(v);
    if(period&&period.rootProjectId)return String(period.rootProjectId);
    if(period&&period.projectId&&String(period.projectId)!==String(period.id))return String(period.projectId);
    if(v.periodId&&v.projectId&&String(v.projectId)!==String(v.periodId))return String(v.projectId);
    if(period&&typeof data.programKey==='function')return String(data.programKey(period)||'');
    return String(v.projectId||'');
  };
  const visitsForActiveProject=(shopperId)=>{
    const root=String(data.currentProjectId||'');
    return data.visitsForShopper(shopperId).filter(v=>rootProjectIdForVisit(v)===root);
  };
  const kpiVisitsForActiveProject=(shopperId)=>visitsForActiveProject(shopperId).filter(v=>v&&v.__pendingPlatformAssignmentOverlay!==true);
  const periodLabelForVisit=(v)=>{
    const period=periodForVisit(v);
    return v.periodLabel||(period&&(period.periodo||period.ronda||period.name))||v.periodKey||v.periodId||v.projectId||'—';
  };
  const projectLabelForVisit=(v)=>{
    const rootId=rootProjectIdForVisit(v);
    const root=byId(data.__backendAllProjectRecords,rootId)||byId(data.projects,rootId);
    if(root)return root.programLabel||root.name||root.id;
    if(rootId===String(data.currentProjectId||'')&&data.previewMeta&&data.previewMeta.projectName)return data.previewMeta.projectName;
    return rootId||'—';
  };
  const evaluationForVisit=(v)=>{
    if(v&&v.score!==undefined&&v.score!==null&&String(v.score)!=='')return String(v.score);
    if(v&&v.koFail===true)return 'KO';
    if(v&&v.evaluada===true)return 'Evaluada';
    return '—';
  };
  const scopedStats=(shopperId)=>{
    const vs=kpiVisitsForActiveProject(shopperId);
    const facets=v=>typeof data.visitFacets==='function'?data.visitFacets(v):(v&&v.canonicalFacets)||{};
    return {
      total:vs.length,
      realizadas:vs.filter(v=>{const f=facets(v);return f.realized&&!f.cancelled;}).length,
      liquidadas:vs.filter(v=>{const f=facets(v);return f.liquidationConfirmed&&!f.cancelled;}).length,
      enCurso:vs.filter(v=>{const f=facets(v);return f.assigned&&!f.realized&&!f.cancelled;}).length
    };
  };
  const showCredential=(result,title='Acceso del shopper')=>{
    const credential=result&&result.credential;
    if(!credential||result.credentialIssued!==true){
      CX.ui.toast('La identidad quedó confirmada, pero no se emitió una credencial nueva.','warn',4200);
      return;
    }
    ui.modal(title,`
      <div style="background:var(--brand-light);border-radius:10px;padding:14px;color:var(--brand-dark);line-height:1.7">
        <div style="font-weight:800;margin-bottom:6px">Credencial emitida correctamente</div>
        <div>Usuario: <b style="font-family:var(--disp)">${esc(credential.login)}</b></div>
        <div>Contraseña: <b style="font-family:var(--disp)">${esc(credential.password)}</b></div>
        <div style="font-size:11px;margin-top:8px">Regla TyA: usuario nombre.apellido y contraseña temporal Nombre123*. La contraseña no queda visible ni almacenada para consulta posterior.</div>
      </div>`);
  };
  const resetCredential=async(shopperId,title)=>{
    if(typeof data.resetShopperCredential!=='function')throw new Error('SHOPPER_CREDENTIAL_RESET_UNAVAILABLE');
    const result=await data.resetShopperCredential(shopperId,{ackAware:true,reason:'admin-shopper-repair'});
    if(!commandOk(result))throw new Error(commandError(result));
    showCredential(result,title||'Acceso restablecido');
    return result;
  };

  const row=(s)=>{
    /* P0-3 (paquete V110→V111, 20260714): antes el estado y el honorario SIEMPRE mostraban un
       badge concreto — si s.estado no era exactamente 'Pendiente' ni 'Certificado', el código
       caía a mostrar "Activo" por defecto; si s.honorarioPref no era 'Preferente', mostraba
       "Estándar" por defecto. Para una REFERENCIA PROTEGIDA (sin esos atributos en la fuente)
       eso INVENTABA un estado/honorario que nunca vino de ningún lado. Ahora se detecta el nivel
       real de dato y, si no hay atributo operativo, se muestra "Perfil protegido" en vez de un
       valor sintetizado. */
    const lvl=CX.data_shopperDataLevel(s);
    const estadoCell = lvl==='protected_reference'
      ? '<span class="bdg bdg-n" title="Solo referencia protegida — sin datos operativos de la fuente">🔒 Protegido</span>'
      : (s.estado==='Pendiente'?ui.bdg('Pendiente','a'):s.estado==='Certificado'?ui.bdg('Certificado','g'):s.estado==='Activo'?ui.bdg('Activo','b'):'<span class="muted">— sin dato</span>');
    const honCell = lvl==='protected_reference'
      ? '<span class="muted" style="font-size:11px">—</span>'
      : (s.honorarioPref==='Preferente'?ui.bdg('Preferente','p'):s.honorarioPref==='Estándar'?ui.bdg('Estándar','n'):'<span class="muted">— sin dato</span>');
    const perfilCell = lvl==='protected_reference'
      ? '<span class="bdg bdg-n">Referencia protegida</span>'
      : (profileComplete(s)?ui.bdg('Completo','g'):ui.bdg('Incompleto','a'));
    return `<tr data-sid="${s.id}" data-identity-review="${identityReviewIds.has(String(s.id||''))?'required':'clear'}" style="cursor:pointer">
    <td><div class="flex">${av(s.nombre,30)}
      <div><b>${s.nombre||('🔒 '+(s.code||'Referencia protegida'))}</b> ${identityReviewBadge(s)}<div style="font-size:11px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)||s.pais||'—'}</div></div></div></td>
    <td>${scoreCell(s)}</td>
    <td style="font-size:12px">${typeof s.visitas==='number'?s.visitas:'<span class="muted">—</span>'}</td>
    <td>${perfilCell}</td>
    <td>${estadoCell}</td>
    <td>${honCell}</td><td><span class="btn btn-ghost btn-sm">Ver perfil</span></td>
  </tr>`;
  };

  const list=()=>data.shoppersFor();
  /* PRE-I4 VRM-185/186 — identity resolution is ADMIN-ONLY.
     Every review schema is normalized here. Shopper views only consume the adjudicated result.
     Name/fuzzy similarity never authorizes a merge; exact technical evidence requires explicit
     Admin human confirmation and provider ACK. */
  const providerIdentityReviewItems=arr(data.__identityReviewQueue);
  /* VRM-186 residual: a protected profile excluded from the operational list can still carry
     one exact technical alias to a currently visible project shopper. Normalize ONLY that
     deterministic one-to-one/project-scoped case into an Admin adjudication pair. */
  const normalizedProviderIdentityReviewItems=providerIdentityReviewItems.map(item=>{
    if(String(item?.reason||'')!=='no_exact_hr_crosswalk')return item;
    const reviewId=String(item?.id||item?.shopperId||'').trim();
    const currentProject=String(data.currentProjectId||'').trim();
    const scopedProjects=[...new Set(arr(item?.projectIds).map(String).map(x=>x.trim()).filter(Boolean))];
    const exactVisibleAliases=[...new Set(arr(item?.exactAliases).map(String).map(x=>x.trim()).filter(x=>x&&x!==reviewId&&!!data.getShopper(x)))];
    if(!reviewId||!currentProject||!scopedProjects.includes(currentProject)||exactVisibleAliases.length!==1)return item;
    const exactOperationalId=exactVisibleAliases[0];
    return Object.assign({},item,{
      reason:'exact_profile_alias_requires_admin_resolution',
      candidates:[reviewId,exactOperationalId],
      shopperIds:[reviewId,exactOperationalId],
      canonicalOptions:[exactOperationalId],
      requiresHumanAdjudication:true,
      source:'platform_only_exact_alias_requires_admin_resolution'
    });
  });
  const syntheticExactAliasReviews=[];
  const seenAliasPairs=new Set();
  list().forEach(row=>{
    const id=String(row?.id||row?.shopperId||'').trim();
    if(!id)return;
    const aliases=[...new Set([...arr(row?.exactAliases),...arr(row?.sourceShopperIds),...arr(row?.legacyLiveShopperIds)].map(String).map(x=>x.trim()).filter(x=>x&&x!==id))];
    aliases.forEach(alias=>{
      const other=data.getShopper(alias);if(!other)return;
      const pair=[id,alias].sort(),key=pair.join('|');if(seenAliasPairs.has(key))return;seenAliasPairs.add(key);
      syntheticExactAliasReviews.push({reason:'exact_profile_alias_requires_admin_resolution',candidates:pair,shopperIds:pair,requiresHumanAdjudication:true,source:'durable_exact_alias_profile'});
    });
  });
  const identityReviewItems=[...normalizedProviderIdentityReviewItems,...syntheticExactAliasReviews];
  const reviewIds=item=>[item?.shopperId,item?.sourceShopperId,item?.canonicalShopperId,item?.liveShopperId,item?.id,...arr(item?.shopperIds),...arr(item?.candidates),...arr(item?.exactAliases)].map(String).map(x=>x.trim()).filter(Boolean);
  const identityReviewIds=(()=>{const out=new Set();identityReviewItems.forEach(item=>reviewIds(item).forEach(id=>out.add(id)));return out;})();
  const identityReviewFor=id=>{id=String(id||'');return identityReviewItems.find(item=>reviewIds(item).includes(id))||null;};
  const identityReviewBadge=s=>identityReviewIds.has(String(s&&s.id||''))?ui.bdg('Revisar identidad','a'):'';
  const exactAdminReasons=new Set(['conflicting_exact_crosswalk','ambiguous_exact_technical_anchor','conflicting_exact_visit_crosswalk','exact_profile_alias_requires_admin_resolution']);
  const resolveIdentityModal=s=>{
    const review=identityReviewFor(s&&s.id);
    if(!review){ui.toast('No existe una revisión de identidad activa para esta ficha','warn');return;}
    const reason=String(review.reason||'identity_review_required');
    const candidateIds=[...new Set([...arr(review.candidates),...arr(review.shopperIds)].map(String).map(x=>x.trim()).filter(Boolean))];
    const liveId=String(review.liveShopperId||review.sourceShopperId||'').trim();
    const reviewOnlyId=String(review.id||review.shopperId||'').trim();
    const candidates=candidateIds.map(id=>{
      const row=data.getShopper(id);
      if(row)return {id,row,reviewOnly:false};
      if(id===reviewOnlyId&&String(review.source||'')==='platform_only_exact_alias_requires_admin_resolution'){
        return {id,row:{id,nombre:review.nombre||'Referencia histórica',projectIds:arr(review.projectIds),exactAliases:arr(review.exactAliases),__identityReviewOnly:true},reviewOnly:true};
      }
      return null;
    }).filter(Boolean);
    const canonicalOptions=[...new Set((arr(review.canonicalOptions).length?arr(review.canonicalOptions):candidateIds).map(String).map(x=>x.trim()).filter(Boolean))];
    const exactResolvable=exactAdminReasons.has(reason)&&candidates.length>=1&&(reason==='exact_profile_alias_requires_admin_resolution'?candidates.length>=2:!!liveId)&&canonicalOptions.length>=1;
    if(!exactResolvable){
      const sameName=reason==='display_name_collision_not_auto_merged';
      ui.modal('Revisar identidad · '+(s.nombre||'shopper'),`
        <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:12px">Esta ficha requiere revisión administrativa y <b>no se fusionará automáticamente</b>.</div>
        <div class="card card-p" style="margin-bottom:12px"><div><b>Motivo:</b> ${esc(reason)}</div><div style="margin-top:6px"><b>ID:</b> ${esc(String(s.id||''))}</div></div>
        <div style="font-size:11.5px;color:var(--t3)">${sameName?'Coincidir en nombre no constituye evidencia suficiente para fusionar perfiles. Se necesita evidencia técnica exacta o una adjudicación humana documentada desde Administración.':'Este caso permanece fail-closed hasta contar con evidencia exacta suficiente para adjudicar una identidad canónica.'}</div>
      `);
      return;
    }
    ui.modal('Resolver identidad · '+(s.nombre||'shopper'),`
      <div data-identity-admin-only="true" style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:12px">Resolución exclusiva de Administración. Verifica la evidencia exacta antes de seleccionar la ficha canónica. No se fusiona por nombre, teléfono, correo ni similitud.</div>
      <label class="lbl">Ficha canónica que se conservará</label>
      <select class="sel" id="idCanonical" style="margin-bottom:12px"><option value="">Selecciona la ficha canónica</option>${candidates.filter(x=>canonicalOptions.includes(x.id)).map(x=>`<option value="${esc(x.id)}">${esc(x.row?.nombre||x.id)} · ${Number.isFinite(x.row?.visitas)?x.row.visitas:'—'} visita(s)</option>`).join('')}</select>
      <div class="card card-p" style="margin-bottom:12px">${candidates.map(x=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b>${esc(x.row?.nombre||x.id)}</b><div style="font-size:10.5px;color:var(--t3)">${esc(x.row?.ciudad||'—')} · ${esc(CX.paisName(x.row?.pais)||x.row?.pais||'—')}</div></div><div style="font-size:12px">${Number.isFinite(x.row?.visitas)?x.row.visitas:'—'} visita(s)</div></div>`).join('')}</div>
      <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:14px"><input type="checkbox" id="idConfirm"> Verifiqué la evidencia exacta y confirmo que las identidades seleccionadas corresponden a la misma persona.</label>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="idResolve">Confirmar identidad canónica</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#idResolve').addEventListener('click',async e=>{
        const btn=e.currentTarget,canonical=String(ov.querySelector('#idCanonical').value||''),confirmed=ov.querySelector('#idConfirm').checked;
        if(!canonical){ui.toast('Selecciona primero la ficha canónica','warn');return;}
        if(!confirmed){ui.toast('Debes confirmar la verificación de identidad antes de continuar','warn');return;}
        const aliases=reason==='exact_profile_alias_requires_admin_resolution'?candidateIds.filter(id=>id!==canonical):[liveId].filter(id=>id&&id!==canonical);
        if(!aliases.length){ui.toast('No existe una identidad alias distinta para consolidar','warn');return;}
        btn.disabled=true;btn.textContent='Confirmando…';
        try{
          const result=await data.adjudicateShopperIdentity(canonical,aliases,{ackAware:true,reason:'admin_exact_identity_human_adjudication'});
          if(!commandOk(result)||result.identityConsolidated!==true)throw new Error(commandError(result)||'La consolidación durable no fue confirmada por el proveedor');
          close();ui.toast('Identidad canónica consolidada y guardada','ok',3600);
          try{await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_identity_adjudication_refresh');}catch(_){}
          CX.router.nav('shoppers');
        }catch(error){ui.toast('No se aplicó la resolución de identidad · '+String(error?.message||error),'err',5200);btn.disabled=false;btn.textContent='Confirmar identidad canónica';}
      });
    }});
  };

  const manualIdentityAdjudication=s=>{
    const candidates=list().filter(x=>String(x.id||'')!==String(s.id||'')&&CX.data_shopperDataLevel(x)!=='protected_reference');
    ui.modal('Revisar / fusionar identidad · '+(s.nombre||s.id),`
      <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:12px"><b>Decisión administrativa explícita.</b> Puedes seleccionar una o varias fichas únicamente cuando hayas confirmado que corresponden a la misma persona. La plataforma no fusiona automáticamente por nombre, teléfono, correo ni similitud.</div>
      <div class="grid g2" style="gap:10px;margin-bottom:12px">
        <div class="card card-p"><div class="muted" style="font-size:10.5px">FICHA ACTUAL</div><b>${esc(s.nombre||s.id)}</b><div style="font-size:11px;color:var(--t3)">${esc(s.ciudad||'—')} · ${kpiVisitsForActiveProject(s.id).length} visita(s)</div></div>
        <div><label class="lbl">Fichas relacionadas confirmadas</label><select class="sel" id="manualAliases" multiple size="7" style="min-height:168px">${candidates.map(x=>`<option value="${esc(x.id)}">${esc(x.nombre||x.id)} · ${esc(x.ciudad||'—')} · ${kpiVisitsForActiveProject(x.id).length} visita(s)</option>`).join('')}</select><div style="font-size:10.5px;color:var(--t3);margin-top:5px">Ctrl/Cmd + clic permite seleccionar varias fichas.</div></div>
      </div>
      <div id="manualCompare" class="card card-p" style="margin-bottom:12px;display:none"></div>
      <label class="lbl">Ficha canónica que se conservará</label><select class="sel" id="manualCanonical" style="margin-bottom:12px" disabled><option value="">Selecciona primero las fichas relacionadas</option></select>
      <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:14px"><input type="checkbox" id="manualConfirm"> Confirmo que todas las fichas seleccionadas corresponden a la misma persona y autorizo consolidar histórico, asignaciones, acceso, certificaciones, postulaciones, reservas, liquidaciones y perfil en una identidad canónica.</label>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="manualResolve">Consolidar identidades</button></div>
    `,{onMount:(ov,close)=>{
      const aliasSel=ov.querySelector('#manualAliases'),canonicalSel=ov.querySelector('#manualCanonical'),compare=ov.querySelector('#manualCompare');
      const selectedRows=()=>[...aliasSel.selectedOptions].map(o=>data.getShopper(o.value)).filter(Boolean);
      const refresh=()=>{
        const selected=selectedRows();
        if(!selected.length){compare.style.display='none';canonicalSel.disabled=true;canonicalSel.innerHTML='<option value="">Selecciona primero las fichas relacionadas</option>';return;}
        const rows=[s,...selected];
        compare.style.display='block';
        compare.innerHTML=`<div style="font-weight:800;margin-bottom:8px">Comparación antes de consolidar</div><div style="display:grid;gap:8px">${rows.map(x=>`<div class="between" style="gap:12px;border-top:1px solid var(--border-2);padding-top:7px"><div><b>${esc(x.nombre||x.id)}</b><div style="font-size:10.5px;color:var(--t3)">${esc(x.id)} · ${esc(x.ciudad||'—')}</div></div><div style="font-size:11px;text-align:right">WhatsApp ${esc(x.whatsapp||x.phone||'—')}<br>${kpiVisitsForActiveProject(x.id).length} visita(s)</div></div>`).join('')}</div>`;
        canonicalSel.disabled=false;
        canonicalSel.innerHTML='<option value="">Selecciona la ficha canónica</option>'+rows.map(x=>`<option value="${esc(x.id)}">${esc(x.nombre||x.id)} · ${esc(x.id)}</option>`).join('');
      };
      aliasSel.addEventListener('change',refresh);
      ov.querySelector('#manualResolve').addEventListener('click',async e=>{
        const selected=selectedRows(),canonical=String(canonicalSel.value||''),confirmed=ov.querySelector('#manualConfirm').checked;
        if(!selected.length||!canonical){ui.toast('Selecciona al menos una ficha relacionada y la identidad canónica.','warn');return;}
        if(!confirmed){ui.toast('Confirma explícitamente que todas las fichas corresponden a la misma persona.','warn');return;}
        const allIds=[String(s.id),...selected.map(x=>String(x.id))],aliases=allIds.filter(id=>id!==canonical);
        if(!aliases.length){ui.toast('La consolidación requiere al menos una ficha alias.','warn');return;}
        const btn=e.currentTarget;btn.disabled=true;btn.textContent='Consolidando…';
        try{
          const result=await data.adjudicateShopperIdentity(canonical,aliases,{ackAware:true,reason:'admin_manual_same_human_confirmation'});
          if(!commandOk(result)||result.identityConsolidated!==true)throw new Error(commandError(result)||'IDENTITY_CONSOLIDATION_NOT_CONFIRMED');
          close();ui.toast('Identidades consolidadas y verificadas por el proveedor.','ok',4200);
          try{await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_manual_identity_adjudication');}catch(_){}
          CX.router.nav('shoppers');
        }catch(error){btn.disabled=false;btn.textContent='Consolidar identidades';ui.toast('No se aplicó la consolidación · '+String(error?.message||error),'err',5200);}
      });
    },dismissOnBackdrop:false});
  };
  /* ---------- HTML del módulo ---------- */
  const render=()=>{
    const L=list();
    return `
    ${ui.ph('Shoppers / Auditores', data.period().name+' · red de evaluadores y calificación')}
    <div id="shTopKpis">
    <div class="grid g4" style="margin-bottom:8px">
      <div data-tk="all" style="cursor:pointer">${ui.kpi('En este proyecto',L.length,'b')}</div>
      <div data-tk="act" style="cursor:pointer">${ui.kpi('Activos (6 meses)',L.filter(s=>data.shopperActivo(s)).length,'g')}</div>
      <div data-tk="inact" style="cursor:pointer">${ui.kpi('Inactivas',L.filter(s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&!data.shopperActivo(s)).length,'a')}</div>
      <div data-tk="prot" style="cursor:pointer">${ui.kpi('Referencias protegidas',L.filter(s=>CX.data_shopperDataLevel(s)==='protected_reference').length,'n')}</div>
    </div>
    <div class="grid g4" style="margin-bottom:16px">
      <div data-tk="comp" style="cursor:pointer">${ui.kpi('Perfiles completos',L.filter(s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&profileComplete(s)).length,'g')}</div>
      <div data-tk="incom" style="cursor:pointer">${ui.kpi('Perfiles incompletos',L.filter(s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&!profileComplete(s)).length,'a')}</div>
    </div>
    </div>
    <div style="font-size:10.5px;color:var(--t3);margin:-10px 0 12px">Activo = perfil real con al menos 1 visita realizada en los 6 meses previos al ${data.activeRefDate()} (fecha de referencia del periodo). Una referencia protegida nunca cuenta como activa.</div>
    <div class="card card-p">
      <div class="card-h">
        <div class="card-t">Base de shoppers</div>
        <div class="flex" style="gap:8px">
          <input class="inp" id="shSearch" placeholder="Buscar nombre, ciudad, código…" style="width:230px">
          <button class="btn btn-soft btn-sm" id="shScoreContract">📊 Criterios de puntuación</button>
          <button class="btn btn-pr btn-sm" id="shNew">+ Alta manual</button>
        </div>
      </div>
      <table class="tbl"><thead><tr><th>Shopper</th><th>Rating</th><th>Visitas</th><th>Perfil</th><th>Estado</th><th>Honorario</th><th>Acciones</th></tr></thead>
      <tbody id="shBody">${L.map(row).join('')}</tbody></table>
      <div id="shEmpty" style="display:none;padding:12px">${ui.empty('🔍','Sin resultados para tu búsqueda.')}</div>
      <div style="margin-top:14px">${ui.aiBox('El alta manual pide solo lo esencial (nombre, apellido y WhatsApp); el shopper completa el resto al ingresar. Si dos fichas tienen el mismo nombre pero no existe una coincidencia técnica verificable, permanecen separadas y se marcan para revisión.','Alta y calificación inteligente')}</div>
    </div>`;
  };

  /* ---------- drill: histórico de visitas ---------- */
  const drillVisits=(s, fn, title)=>{
    const vs=kpiVisitsForActiveProject(s.id).filter(fn||(()=>true));
    const body = vs.length ? `<table class="tbl"><thead><tr><th>Sucursal</th><th>Proyecto</th><th>Periodo</th><th>Escenario</th><th>Estado</th><th>Evaluación</th><th>Fecha</th></tr></thead><tbody>
      ${vs.map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:11px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td>
        <td style="font-size:12px">${projectLabelForVisit(v)}</td>
        <td style="font-size:12px">${periodLabelForVisit(v)}</td>
        <td style="font-size:12px">${v.escenario}</td>
        <td>${ui.estadoBadge(v.estado)}</td>
        <td style="font-size:12px">${evaluationForVisit(v)}</td>
        <td style="font-size:12px">${v.realizada||v.agendada||v.disponibleDesde||'—'}</td></tr>`).join('')}
      </tbody></table>`
      : ui.empty('🗒️','Sin visitas en esta categoría todavía.');
    ui.modal(title+' · '+s.nombre, body);
  };

  /* ---------- formulario editable (perfil) ---------- */
  const editFields=(s)=>{
    const ids={pais:'ed_pais',depto:'ed_depto',ciudad:'ed_ciudad'};
    return `
    <div class="grid g2" style="gap:12px 14px">
      <div><label class="lbl">Primer nombre</label><input class="inp" id="ed_first" value="${s.firstName||''}"></div>
      <div><label class="lbl">Primer apellido</label><input class="inp" id="ed_last" value="${s.lastName||''}"></div>
      ${CX.geo.fieldsHTML(ids,{pais:s.pais,depto:s.depto,ciudad:s.ciudad})}
      <div><label class="lbl">WhatsApp</label><input class="inp" id="ed_wa" value="${s.whatsapp||''}"></div>
      <div><label class="lbl">Correo</label><input class="inp" id="ed_mail" value="${s.email||''}"></div>
      <div><label class="lbl">Edad</label><input class="inp" id="ed_edad" type="number" min="16" max="99" value="${s.edad||''}"></div>
      <div><label class="lbl">Sexo</label><select class="sel" id="ed_sexo">${['','Femenino','Masculino','Otro','Prefiero no decir'].map(o=>`<option ${o===(s.sexo||'')?'selected':''}>${o||'Selecciona…'}</option>`).join('')}</select></div>
      <div><label class="lbl">Documento (DPI / ID)</label><input class="inp" id="ed_dpi" value="${s.dpi||''}"></div>
      <div><label class="lbl">Banco</label><input class="inp" id="ed_banco" value="${(s.banco||'').replace(/"/g,'&quot;')}" placeholder="Nombre del banco"></div>
      <div><label class="lbl">Tipo de cuenta</label><select class="sel" id="ed_ctaTipo">${['','Monetaria/Corriente','Ahorro','Otra'].map(o=>`<option ${o===(s.ctaTipo||'')?'selected':''}>${o||'Selecciona…'}</option>`).join('')}</select></div>
      <div><label class="lbl">Número de cuenta</label><input class="inp" id="ed_ctaNum" value="${(s.ctaNum||'').replace(/"/g,'&quot;')}" placeholder="Número / IBAN / CLABE"></div>
      <div><label class="lbl">Titular</label><input class="inp" id="ed_ctaTit" value="${(s.ctaTitular||'').replace(/"/g,'&quot;')}"></div>
      <div><label class="lbl">Moneda</label><input class="inp" id="ed_ctaMon" value="${(s.ctaMoneda||'').replace(/"/g,'&quot;')}" placeholder="Q / L / USD…"></div>
      <div><label class="lbl">Estado</label><select class="sel" id="ed_estado">${['Pendiente','Activo','Certificado'].map(o=>`<option ${o===s.estado?'selected':''}>${o}</option>`).join('')}</select></div>
      <div><label class="lbl">Honorario</label><select class="sel" id="ed_hon">${['Estándar','Preferente'].map(o=>`<option ${o===s.honorarioPref?'selected':''}>${o}</option>`).join('')}</select></div>
    </div>
    <div class="flex" style="justify-content:flex-end;gap:8px;margin-top:16px">
      <button class="btn btn-ghost btn-sm" data-cancel>Cancelar</button>
      <button class="btn btn-green btn-sm" id="ed_save">Guardar cambios</button>
    </div>`;
  };

  const requestProfileCompletion=async(shopper)=>{
    const missing=missingProfileFields(shopper);
    if(!missing.length){ui.toast('El perfil ya tiene los campos requeridos.','ok');return true;}
    if(!CX.notif?.pushDurable)throw new Error('PROFILE_REQUEST_PROVIDER_UNAVAILABLE');
    const notice=await CX.notif.pushDurable({to:'shopper',shopperId:shopper.id,targetShopperIds:[shopper.id],tipo:'perfil',icon:'👤',tono:'a',titulo:'Completa tu perfil',txt:'Falta completar: '+missing.join(', '),nav:'miperfil',operational:true,entityType:'shopper',entityId:shopper.id,eventKey:'profile_completion_requested',idempotencyKey:'profile.complete.request:'+String(data.currentProjectId)+':'+shopper.id+':'+missing.slice().sort().join('|')});
    if(!(notice?.providerAck===true&&notice?.committed===true))throw new Error('PROFILE_REQUEST_ACK_REQUIRED');
    ui.toast('Instrucción guardada para '+(shopper.nombre||shopper.id)+'.','ok',3600);
    return true;
  };
  /* ---------- modal de perfil completo ---------- */
  const profileModal=(s)=>{
    const lvl=CX.data_shopperDataLevel(s);
    const st=scopedStats(s.id);
    if(lvl==='protected_reference'){
      ui.modal((s.code||'Referencia protegida'), `
        <div style="text-align:center;padding:10px 0">
          <div style="font-size:34px">🔒</div>
          <div class="card-t" style="margin-top:8px">${s.code||'Referencia protegida'}</div>
          <div style="font-size:12.5px;color:var(--t3);margin-top:4px">${CX.paisName(s.pais)||s.pais||'—'}</div>
        </div>
        <div style="background:var(--panel-2);border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--t2);line-height:1.6;margin-top:10px">
          Esta fuente solo entrega una <b>referencia protegida</b>: no hay rating, estado, honorario,
          contacto ni completitud de perfil disponibles. No se muestran ni infieren valores — la
          ficha completa se habilita solo cuando la fuente entregue datos operativos/autorizados y
          el rol en sesión tenga permiso para verlos.
        </div>
      `);
      return;
    }
    const canEdit=lvl==='full_authorized_profile'&&CX.session&&CX.session.canSeeProtectedData&&CX.session.canSeeProtectedData();
    const body=`
      <div class="between" style="margin-bottom:14px">
        <div class="flex">${av(s.nombre,46)}
          <div><div class="card-t" style="font-size:16px">${s.nombre||'—'}</div>
          <div style="font-size:12px;color:var(--t3)">${s.code} · ${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)||'—'}</div>
          <div class="flex" style="gap:6px;margin-top:6px">${lvl==='operational_profile'?'<span class="bdg bdg-a">Perfil operativo · datos de contacto pendientes</span>':(profileComplete(s)?ui.bdg('Perfil completo','g'):ui.bdg('Perfil incompleto','a'))} ${viaBadge(s.createdVia)}</div></div></div>
        <span style="font-size:18px;font-weight:800;color:var(--amber)">${s.rating?('★ '+s.rating):''}</span>
      </div>
      <div style="background:var(--brand-light);border-radius:10px;padding:9px 13px;font-size:12px;color:var(--brand-dark);margin-bottom:14px" class="between">
        <span>Usuario: <b style="font-family:var(--disp)">${s.user||s.id||'—'}</b></span>
        <button class="btn btn-soft btn-sm" id="shResetCredential">Restablecer acceso</button>
      </div>
      <div class="grid g4" style="margin-bottom:8px" id="shKpis">
        <div data-k="all" style="cursor:pointer">${ui.kpi('Visitas',st.total,'b')}</div>
        <div data-k="done" style="cursor:pointer">${ui.kpi('Realizadas',st.realizadas,'g')}</div>
        <div data-k="liq" style="cursor:pointer">${ui.kpi('Liquidadas',st.liquidadas,'p')}</div>
        <div data-k="curso" style="cursor:pointer">${ui.kpi('En curso',st.enCurso,'a')}</div>
      </div>
      <div style="font-size:11px;color:var(--t3);text-align:right;margin-bottom:14px">↑ toca un indicador para ver el detalle</div>
      <div class="card card-p" style="margin-bottom:14px;background:var(--panel-2)">
        ${Number.isFinite(s.rating) ? `
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">📊 Criterio de puntuación (score ${s.rating.toFixed(1)}/5)</div>
        <div style="font-size:11.5px;color:var(--t2);line-height:1.85">
          El score pondera la calidad y confiabilidad del evaluador. Solo penaliza cuando la responsabilidad es del shopper:
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;margin-top:6px">
            <span>• Cancelación por shopper</span><b style="color:var(--red)">−0.3</b>
            <span>• Cancelación por cliente/local cerrado</span><b style="color:var(--t3)">0 (no penaliza)</b>
            <span>• Reprogramación justificada</span><b style="color:var(--t3)">0</b>
            <span>• Cuestionario enviado tarde</span><b style="color:var(--amber)">−0.15</b>
            <span>• Evidencia incompleta/deficiente</span><b style="color:var(--amber)">−0.2</b>
            <span>• Fuera de rango autorizado (no shopper)</span><b style="color:var(--t3)">0</b>
            <span>• Calidad narrativa alta</span><b style="color:var(--green)">+0.1</b>
            <span>• Reincidencia de faltas</span><b style="color:var(--red)">−0.25 acum.</b>
          </div>
          <div style="font-size:10.5px;color:var(--t3);margin-top:6px">Config por tenant/proyecto. Cada penalización queda en la auditoría con motivo y responsable.</div>
        </div>` : `
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">📊 Criterio de puntuación</div>
        <div style="font-size:11.5px;color:var(--t2);line-height:1.6">Sin score disponible — esta fuente todavía no entrega un rating para este perfil. No se muestra ni infiere un valor mientras no exista un dato real.</div>`}
      </div>
      <div class="card-h" style="margin-bottom:10px"><div class="card-t">Datos del shopper</div><div class="flex" style="gap:7px"><button class="btn btn-warn btn-sm" id="shResolveIdentity">${identityReviewIds.has(String(s.id||''))?'Resolver identidad':'Revisar / fusionar identidad'}</button><button class="btn btn-soft btn-sm" id="shRequestProfile">📨 Instruir perfil</button>${canEdit?'<button class="btn btn-soft btn-sm" id="shEdit">✎ Editar perfil</button>':(lvl==='full_authorized_profile'?'<span class="muted" style="font-size:11px">🔒 Edición requiere acceso completo</span>':'<span class="muted" style="font-size:11px">Sin datos de contacto/documento autorizados para edición</span>')}</div></div>
      <div id="shFormHost"></div>
    `;
    ui.modal(s.nombre, body, {onMount:(ov,close)=>{
      const drills={all:[null,'Todas las visitas'],done:[v=>{const f=data.visitFacets(v);return f.realized&&!f.cancelled;},'Visitas realizadas'],
        liq:[v=>{const f=data.visitFacets(v);return f.liquidationConfirmed&&!f.cancelled;},'Visitas liquidadas'],curso:[v=>{const f=data.visitFacets(v);return f.assigned&&!f.realized&&!f.cancelled;},'Visitas en curso']};
      ov.querySelectorAll('#shKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=drills[el.dataset.k];drillVisits(s,d[0],d[1]);}));
      const host=ov.querySelector('#shFormHost');
      const readView=()=>{
        const canSeeSensitive = CX.session && CX.session.canSeeProtectedData ? CX.session.canSeeProtectedData() : (CX.session&&CX.session.role==='super');
        const mask=(v)=>v?('•'.repeat(Math.min(8,String(v).length))):null;
        const rSens=(l,v)=>{ const shown = canSeeSensitive ? v : mask(v);
          return `<div style="padding:7px 0;border-bottom:1px solid var(--border)" class="between"><span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">${l}${canSeeSensitive?'':' 🔒'}</span><b style="font-size:13px;color:var(--t1);text-align:right">${shown||'<span style="color:var(--t3)">— sin dato</span>'}</b></div>`; };
        const r=(l,v)=>`<div style="padding:7px 0;border-bottom:1px solid var(--border)" class="between"><span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">${l}</span><b style="font-size:13px;color:var(--t1);text-align:right">${v||'<span style="color:var(--t3)">— sin dato</span>'}</b></div>`;
        host.innerHTML=`<div>${rSens('WhatsApp',s.whatsapp)}${rSens('Correo',s.email)}${r(CX.geo.deptLabel(s.pais),s.depto)}${r('Edad',s.edad)}${r('Sexo',s.sexo)}${rSens('Documento',s.dpi)}${rSens('Banco',s.banco)}${rSens('Tipo de cuenta',s.ctaTipo)}${rSens('Número de cuenta',s.ctaNum)}${rSens('Titular',s.ctaTitular)}${rSens('Moneda',s.ctaMoneda)}
        ${canSeeSensitive?'':'<div style="margin-top:8px;font-size:10.5px;color:var(--t3)">🔒 Datos protegidos · acceso completo pendiente de activación por rol</div>'}
        ${(()=>{const c=CX.data&&CX.data.ctx?CX.data.ctx():null;return c?`<div style="margin-top:6px;font-size:10px;color:var(--t3)">alcance: ${c.countryScope&&c.countryScope.length?c.countryScope.join(','):'sin restricción'} · rol ${c.role}</div>`:'';})()}</div>`;
      };
      readView();
      ov.querySelector('#shResolveIdentity')?.addEventListener('click',()=>identityReviewIds.has(String(s.id||''))?resolveIdentityModal(s):manualIdentityAdjudication(s));
      ov.querySelector('#shRequestProfile')?.addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;try{await requestProfileCompletion(s);}catch(error){ui.toast('No se pudo guardar la instrucción · '+String(error?.message||error),'warn',4600);}finally{btn.disabled=false;}});
      ov.querySelector('#shResetCredential')?.addEventListener('click',async e=>{
        const btn=e.currentTarget;if(!confirm('¿Restablecer el acceso de este shopper? La credencial anterior dejará de funcionar.'))return;
        btn.disabled=true;btn.textContent='Restableciendo...';
        try{await resetCredential(s.id,'Acceso restablecido · '+(s.nombre||s.id));}
        catch(err){CX.ui.toast('No fue posible restablecer el acceso · '+String(err&&err.message||err),'err',5200);}
        finally{btn.disabled=false;btn.textContent='Restablecer acceso';}
      });
      ov.querySelector('#shEdit')?.addEventListener('click',()=>{
        host.innerHTML=editFields(s);
        const ids={pais:'ed_pais',depto:'ed_depto',ciudad:'ed_ciudad'};
        CX.geo.wire(host,ids,{pais:s.pais,depto:s.depto,ciudad:s.ciudad});
        host.querySelector('[data-cancel]').addEventListener('click',readView);
        host.querySelector('#ed_save').addEventListener('click',async e=>{
          const btn=e.currentTarget;
          const geo=CX.geo.read(host,ids);
          const patch={
            firstName:(host.querySelector('#ed_first').value||'').trim(),
            lastName:(host.querySelector('#ed_last').value||'').trim(),
            pais:geo.pais, depto:geo.depto, ciudad:geo.ciudad,
            whatsapp:(host.querySelector('#ed_wa').value||'').trim(),
            email:(host.querySelector('#ed_mail').value||'').trim(),
            edad:(host.querySelector('#ed_edad').value||'').trim(),
            sexo:host.querySelector('#ed_sexo').value||'',
            dpi:(host.querySelector('#ed_dpi').value||'').trim(),
            banco:(host.querySelector('#ed_banco').value||'').trim(),
            ctaTipo:host.querySelector('#ed_ctaTipo').value||'',
            ctaNum:(host.querySelector('#ed_ctaNum').value||'').trim(),
            ctaTitular:(host.querySelector('#ed_ctaTit').value||'').trim(),
            ctaMoneda:(host.querySelector('#ed_ctaMon').value||'').trim(),
            estado:host.querySelector('#ed_estado').value,
            honorarioPref:host.querySelector('#ed_hon').value,
          };
          patch.cuentaPago=[patch.banco,patch.ctaNum,patch.ctaTitular].filter(Boolean).join(' · ');
          patch.perfilCompleto=data.shopperProfileComplete(Object.assign({},s,patch));
          patch.__commandMeta={ackAware:true,reason:'admin-shopper-profile-update'};
          btn.disabled=true;btn.textContent='Guardando...';
          try{
            const result=await data.updateShopper(s.id,patch);
            if(!commandOk(result))throw new Error(commandError(result));
            CX.ui.toast('Perfil actualizado y confirmado','ok');
            close();CX.router.nav('shoppers');
          }catch(err){CX.ui.toast('No se guardó el perfil · '+String(err&&err.message||err),'err',5200);btn.disabled=false;btn.textContent='Guardar cambios';}
        });
      });
    }});
  };

  /* ---------- alta manual ---------- */
  const altaModal=()=>{
    const ids={pais:'al_pais',depto:'al_depto',ciudad:'al_ciudad'};
    ui.modal('Alta manual de shopper', `
      <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Solo necesitas lo esencial. El shopper completará su perfil (ciudad, documento, cuenta de pago, etc.) al ingresar con sus credenciales.</p>
      <div class="grid g2" style="gap:12px 14px">
        <div><label class="lbl">Primer nombre <b style="color:var(--accent)">*</b></label><input class="inp" id="al_first" placeholder="Ej. Carlos"></div>
        <div><label class="lbl">Primer apellido <b style="color:var(--accent)">*</b></label><input class="inp" id="al_last" placeholder="Ej. Martínez"></div>
        <div style="grid-column:1/3"><label class="lbl">WhatsApp <b style="color:var(--accent)">*</b></label><input class="inp" id="al_wa" placeholder="+502 5555 5555"></div>
      </div>
      <details style="margin:14px 0"><summary style="cursor:pointer;font-size:12.5px;font-weight:700;color:var(--brand)">+ Agregar más datos ahora (opcional)</summary>
        <div class="grid g2" style="gap:12px 14px;margin-top:12px">
          ${CX.geo.fieldsHTML(ids)}
          <div><label class="lbl">Correo</label><input class="inp" id="al_mail" placeholder="correo@ejemplo.com"></div>
          <div><label class="lbl">Edad</label><input class="inp" id="al_edad" type="number" min="16" max="99"></div>
          <div><label class="lbl">Sexo</label><select class="sel" id="al_sexo"><option value="">Selecciona…</option><option>Femenino</option><option>Masculino</option><option>Otro</option><option>Prefiero no decir</option></select></div>
        </div>
      </details>
      <div id="al_creds" style="background:var(--brand-light);border-radius:10px;padding:10px 13px;font-size:12px;color:var(--brand-dark);margin:6px 0 14px">La plataforma creará el acceso y mostrará una credencial temporal cuando el registro quede confirmado.</div>
      <div style="text-align:right"><button class="btn btn-green" id="al_save">Crear shopper</button></div>
    `, {onMount:(ov,close)=>{
      CX.geo.wire(ov, ids);
      ov.querySelector('#al_save').addEventListener('click',async e=>{
        const btn=e.currentTarget;
        const first=(ov.querySelector('#al_first').value||'').trim();
        const last=(ov.querySelector('#al_last').value||'').trim();
        const wa=(ov.querySelector('#al_wa').value||'').trim();
        if(!first||!last||!wa){CX.ui.toast('Nombre, apellido y WhatsApp son obligatorios','err');return;}
        const geo=CX.geo.read(ov, ids);
        const payload={via:'manual',createdVia:'manual',sourceType:'platform',estado:'Pendiente',firstName:first,lastName:last,nombre:[first,last].filter(Boolean).join(' '),whatsapp:wa,
          pais:geo.pais,depto:geo.depto,ciudad:geo.ciudad,
          email:(ov.querySelector('#al_mail').value||'').trim(),
          edad:(ov.querySelector('#al_edad').value||'').trim(),
          sexo:ov.querySelector('#al_sexo').value||'',
          __commandMeta:{ackAware:true,reason:'admin-shopper-manual-create'}};
        btn.disabled=true;btn.textContent='Creando...';
        try{
          const created=await data.addShopper(payload);
          if(!commandOk(created)||!created.entityId)throw new Error(commandError(created));
          const credential=await resetCredential(created.entityId,'Shopper creado · credencial inicial');
          if(!commandOk(credential))throw new Error(commandError(credential));
          close();CX.ui.toast('Shopper creado y acceso confirmado','ok',3600);CX.router.nav('shoppers');
        }catch(err){CX.ui.toast('No se creó el shopper · '+String(err&&err.message||err),'err',5200);btn.disabled=false;btn.textContent='Crear shopper';}
      });
    }});
  };

  /* ---------- montaje de eventos ---------- */
  setTimeout(()=>{
    document.getElementById('shNew')?.addEventListener('click',altaModal);
    document.getElementById('shScoreContract')?.addEventListener('click',async()=>{
      try{
        const r=await fetch('contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json',{cache:'no-store'}),contract=await r.json(),weights=contract.defaultPreviewWeights||{};
        const labels={certification_readiness:'Certificación vigente',assignment_reliability:'Confiabilidad en asignaciones',schedule_compliance:'Cumplimiento de agenda',visit_completion:'Finalización de visitas',questionnaire_completion:'Cuestionario completo',review_quality:'Calidad de revisión',correction_rate:'Tasa de correcciones',communication_followup:'Seguimiento de comunicaciones',cancellation_behavior:'Comportamiento de cancelaciones'};
        const rows=Object.entries(weights);
        ui.modal('Criterios de puntuación',`<div class="card card-p" style="margin-bottom:12px"><b>Estado del contrato:</b> ${esc(contract.status||'—')} · runtimeEnabled=${contract.runtimeEnabled===true?'sí':'no'}<div style="font-size:11.5px;color:var(--t3);margin-top:5px">La UI no presenta un rating como real si no existe desglose source-safe y provenance runtime.</div></div><table class="tbl"><thead><tr><th>Criterio</th><th>Peso</th></tr></thead><tbody>${rows.map(([k,v])=>'<tr><td>'+esc(labels[k]||k)+'</td><td><b>'+esc(v)+'%</b></td></tr>').join('')}</tbody></table><div style="font-size:11px;color:var(--t3);margin-top:10px">Los datos sensibles, identidad, monto pagado y comunicaciones privadas no pueden usarse como proxy de calidad.</div>`);
      }catch(error){ui.toast('No fue posible leer el contrato de puntuación.','warn');}
    });
    const bindRows=()=>document.querySelectorAll('#shBody [data-sid]').forEach(tr=>tr.addEventListener('click',()=>{
      const s=data.getShopper(tr.dataset.sid); if(s)profileModal(s);
    }));
    bindRows();
    const L=list();
    const tkMap={all:['Shoppers del proyecto',()=>true],act:['Shoppers activos (6 meses)',s=>data.shopperActivo(s)],inact:['Inactivas',s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&!data.shopperActivo(s)],prot:['Referencias protegidas',s=>CX.data_shopperDataLevel(s)==='protected_reference'],comp:['Perfiles completos',s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&profileComplete(s)],incom:['Perfiles incompletos',s=>CX.data_shopperDataLevel(s)!=='protected_reference'&&!profileComplete(s)]};
    document.querySelectorAll('#shTopKpis [data-tk]').forEach(el=>el.addEventListener('click',()=>{const d=tkMap[el.dataset.tk],isIncomplete=el.dataset.tk==='incom',items=L.filter(d[1]);
      const body=items.length?`<table class="tbl"><thead><tr><th>Shopper</th><th>Ciudad</th><th>${isIncomplete?'Falta':'Puntuación'}</th><th>Acción</th></tr></thead><tbody>${items.map(x=>`<tr><td class="hov" data-pk="${x.id}" style="cursor:pointer"><b>${esc(x.nombre||x.id)}</b><div style="font-size:10px;color:var(--t3)">${esc(x.code||'')}</div></td><td style="font-size:12px">${esc(x.ciudad||CX.paisName(x.pais)||'—')}</td><td style="font-size:11.5px">${isIncomplete?esc(missingProfileFields(x).join(', ')||'Revisar perfil'):scoreCell(x)}</td><td>${isIncomplete?`<button class="btn btn-soft btn-sm" data-request-profile="${x.id}">Solicitar completar</button>`:`<button class="btn btn-ghost btn-sm" data-pk="${x.id}">Ver perfil</button>`}</td></tr>`).join('')}</tbody></table>`:ui.empty('👥','Sin shoppers en esta categoría.');
      ui.modal(d[0]+' ('+items.length+')',body,{onMount:(ov,close)=>{
        ov.querySelectorAll('[data-pk]').forEach(tr=>tr.addEventListener('click',()=>{close();const x=data.getShopper(tr.dataset.pk);if(x)profileModal(x);}));
        ov.querySelectorAll('[data-request-profile]').forEach(btn=>btn.addEventListener('click',async()=>{
          const shopper=data.getShopper(btn.dataset.requestProfile),missing=missingProfileFields(shopper),message=profileRequestMessage(shopper);
          if(!shopper||!missing.length){ui.toast('El perfil ya no tiene campos pendientes.','ok');return;}
          btn.disabled=true;btn.textContent='Preparando…';
          try{
            if(CX.notif?.pushDurable){
              const notice=await CX.notif.pushDurable({to:'shopper',shopperId:shopper.id,targetShopperIds:[shopper.id],tipo:'perfil',icon:'👤',tono:'a',titulo:'Completa tu perfil',txt:'Falta completar: '+missing.join(', '),nav:'miperfil',operational:true,entityType:'shopper',entityId:shopper.id,eventKey:'profile_completion_requested',idempotencyKey:'profile.complete.request:'+String(data.currentProjectId)+':'+shopper.id+':'+missing.slice().sort().join('|')});
              if(!(notice?.providerAck===true&&notice?.committed===true))throw new Error('PROFILE_REQUEST_ACK_REQUIRED');
              ui.toast('Solicitud in-app guardada para '+(shopper.nombre||shopper.id)+'.','ok',3600);btn.textContent='Solicitud guardada';return;
            }
            throw new Error('NO_DURABLE_NOTIFICATION_PROVIDER');
          }catch(_){
            ui.modal('Solicitud manual · '+(shopper.nombre||shopper.id),`<div style="font-size:12px;color:var(--t2);margin-bottom:10px">No se registró ningún envío automático. Este es un borrador para que el equipo lo copie y envíe manualmente.</div><textarea class="inp" id="profileDraft" rows="4">${esc(message)}</textarea><div style="font-size:11px;color:var(--t3);margin-top:8px">WhatsApp: ${esc(shopper.whatsapp||shopper.phone||'—')} · Correo: ${esc(shopper.email||'—')}</div><div style="text-align:right;margin-top:10px"><button class="btn btn-soft btn-sm" id="profileCopy">Copiar borrador</button></div>`,{onMount:(draftOv)=>draftOv.querySelector('#profileCopy').addEventListener('click',async()=>{await navigator.clipboard?.writeText?.(message);ui.toast('Borrador copiado. No se marcó como enviado.','ok');})});
            btn.disabled=false;btn.textContent='Solicitar completar';
          }
        }));
      }});
    }));
    if(CX.session._focusShopper){ const fs=data.getShopper(CX.session._focusShopper); CX.session._focusShopper=null; if(fs)setTimeout(()=>profileModal(fs),120); }
    const search=document.getElementById('shSearch');
    if(search)search.addEventListener('input',()=>{
      const q=search.value.toLowerCase().trim();
      const filtered=list().filter(s=>!q||[s.nombre,s.ciudad,s.code,CX.paisName(s.pais)].join(' ').toLowerCase().includes(q));
      const body=document.getElementById('shBody'), empty=document.getElementById('shEmpty');
      body.innerHTML=filtered.map(row).join('');
      empty.style.display=filtered.length?'none':'block';
      bindRows();
    });
  },0);

  return render();
});
