/* CXOrbia TyA — canonical state semantics v2 + F10 operational-evidence split.
   Canonical lifecycle inference and direct HR operational evidence are distinct truths:
   - lifecycle may infer prior milestones from a later trusted state for audit/history;
   - operational KPIs only count the explicit HR evidence present for that milestone;
   - submitted is a liquidation candidate, never a confirmed liquidation or payment;
   - approved module bytes remain untouched; this adapter changes only the read-model facade.
   Pure read-model transformation; no provider calls or writes. */
(function(root){
  'use strict';
  const api=root.CX_TYA_CUMULATIVE_READ_MODEL;
  const identityContract=root.CX_EXACT_IDENTITY_CONTRACT;
  if(!api||typeof api.facets!=='function'||typeof api.compose!=='function')return;
  const originalFacets=api.facets.bind(api);
  const originalCompose=api.compose.bind(api);
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const hasEvidence=v=>v!==undefined&&v!==null&&str(v)!=='';
  const NORMALIZER_VERSION='cxorbia-exact-linked-owner-normalizer-v1';
  const OPERATIONAL_EVIDENCE_VERSION='f10-operational-evidence-v1';
  const linkedKeys=['visits','certifications','liquidations','postulations','applications','posts'];

  function normalizeLinkedOwners(input){
    const next=clone(input||{});
    next.protectedPayload=next.protectedPayload||{};
    const diagnostics={version:NORMALIZER_VERSION,linkedSources:0,canonicalized:0,unresolved:0,ambiguous:0,contractConflicts:0};
    if(!identityContract||typeof identityContract.buildCanonicalProfileIndex!=='function'){
      diagnostics.unavailable=true;
      return {input:next,diagnostics};
    }
    const profiles=arr(next.protectedPayload.shoppers);
    const linked=[];
    linkedKeys.forEach(key=>linked.push(...arr(next.protectedPayload[key])));
    const index=identityContract.buildCanonicalProfileIndex(profiles,linked);
    diagnostics.contractConflicts=arr(index.conflicts).length;
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

  function facets(v){
    const base=originalFacets(v)||{};
    const outOfRangeEvidence=base.outOfRange===true||v?.outOfRangeEvidence===true;
    const actionableOutOfRange=outOfRangeEvidence&&base.realized!==true&&base.cancelled!==true;
    return Object.assign({},base,{outOfRangeEvidence,outOfRange:actionableOutOfRange,actionableOutOfRange});
  }

  function operationalEvidenceFacets(v){
    const lifecycle=facets(v);
    const submissionState=lower(v?.submissionState);
    const assigned=lifecycle.assigned===true;
    const scheduled=assigned&&hasEvidence(v?.agendada);
    const realized=hasEvidence(v?.realizada);
    const questionnaire=hasEvidence(v?.cuestFecha);
    const submitted=v?.submit===true||hasEvidence(v?.submittedAt)||['confirmed_hr','submitted_by_tya'].includes(submissionState)||lifecycle.liquidationConfirmed===true||lifecycle.paymentConfirmed===true;
    const liquidationCandidate=submitted;
    return Object.assign({},lifecycle,{
      assigned,scheduled,realized,questionnaire,submitted,liquidationCandidate,
      lifecycleScheduled:lifecycle.scheduled===true,
      lifecycleRealized:lifecycle.realized===true,
      lifecycleQuestionnaire:lifecycle.questionnaire===true,
      lifecycleSubmitted:lifecycle.submitted===true,
      evidenceGapSubmittedWithoutRealized:submitted&&!realized,
      evidenceGapSubmittedWithoutQuestionnaire:submitted&&!questionnaire,
      evidenceGapRealizedWithoutSchedule:realized&&!scheduled,
      evidenceMode:'direct_hr_milestone_evidence_no_backward_promotion'
    });
  }

  function periodSummary(visits){
    const map=new Map();
    for(const v of arr(visits)){
      const key=str(v?.periodKey)||str(v?.projectId).replace(/^cinepolis-/,'')||'unknown';
      if(!map.has(key))map.set(key,{periodKey:key,total:0,available:0,assigned:0,scheduled:0,realized:0,questionnaireCompleted:0,submitted:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,outOfRangeEvidence:0,reviewRequired:0,byCountry:{}});
      const row=map.get(key),f=facets(v);row.total++;row.available+=f.available?1:0;row.assigned+=f.assigned?1:0;row.scheduled+=f.scheduled?1:0;row.realized+=f.realized?1:0;row.questionnaireCompleted+=f.questionnaire?1:0;row.submitted+=f.submitted?1:0;row.liquidationCandidates+=f.liquidationCandidate?1:0;row.liquidationConfirmed+=f.liquidationConfirmed?1:0;row.paymentConfirmed+=f.paymentConfirmed?1:0;row.outOfRange+=f.outOfRange?1:0;row.outOfRangeEvidence+=f.outOfRangeEvidence?1:0;row.reviewRequired+=v?.reviewRequired===true?1:0;const c=str(v?.pais||v?.country)||'unknown';row.byCountry[c]=(row.byCountry[c]||0)+1;
    }
    return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
  }

  function operationalEvidenceSummary(visits){
    const map=new Map();
    for(const v of arr(visits)){
      const key=str(v?.periodKey)||str(v?.projectId).replace(/^cinepolis-/,'')||'unknown';
      if(!map.has(key))map.set(key,{periodKey:key,total:0,available:0,assigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingRealization:0,questionnaireCompleted:0,pendingQuestionnaire:0,submitted:0,pendingSubmission:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,outOfRangeEvidence:0,reviewRequired:0,evidenceGaps:{submittedWithoutRealized:0,submittedWithoutQuestionnaire:0,realizedWithoutSchedule:0},byCountry:{},statesByCountry:{}});
      const row=map.get(key),f=operationalEvidenceFacets(v),cancelled=f.cancelled===true;
      row.total++;
      row.available+=f.available&&!cancelled?1:0;
      row.assigned+=f.assigned&&!cancelled?1:0;
      row.scheduled+=f.scheduled&&!cancelled?1:0;
      row.pendingSchedule+=f.assigned&&!f.scheduled&&!f.realized&&!cancelled?1:0;
      row.realized+=f.realized&&!cancelled?1:0;
      row.pendingRealization+=!f.realized&&!cancelled?1:0;
      row.questionnaireCompleted+=f.questionnaire&&!cancelled?1:0;
      row.pendingQuestionnaire+=f.realized&&!f.questionnaire&&!cancelled?1:0;
      row.submitted+=f.submitted&&!cancelled?1:0;
      row.pendingSubmission+=f.questionnaire&&!f.submitted&&!cancelled?1:0;
      row.liquidationCandidates+=f.liquidationCandidate&&!cancelled?1:0;
      row.liquidationConfirmed+=f.liquidationConfirmed&&!cancelled?1:0;
      row.paymentConfirmed+=f.paymentConfirmed&&!cancelled?1:0;
      row.outOfRange+=f.outOfRange&&!cancelled?1:0;
      row.outOfRangeEvidence+=f.outOfRangeEvidence?1:0;
      row.reviewRequired+=v?.reviewRequired===true?1:0;
      row.evidenceGaps.submittedWithoutRealized+=f.evidenceGapSubmittedWithoutRealized?1:0;
      row.evidenceGaps.submittedWithoutQuestionnaire+=f.evidenceGapSubmittedWithoutQuestionnaire?1:0;
      row.evidenceGaps.realizedWithoutSchedule+=f.evidenceGapRealizedWithoutSchedule?1:0;
      const c=str(v?.pais||v?.country)||'unknown';
      row.byCountry[c]=(row.byCountry[c]||0)+1;
      if(!row.statesByCountry[c])row.statesByCountry[c]={total:0,assigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingRealization:0,questionnaireCompleted:0,pendingQuestionnaire:0,submitted:0,pendingSubmission:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0};
      const s=row.statesByCountry[c];s.total++;s.assigned+=f.assigned&&!cancelled?1:0;s.scheduled+=f.scheduled&&!cancelled?1:0;s.pendingSchedule+=f.assigned&&!f.scheduled&&!f.realized&&!cancelled?1:0;s.realized+=f.realized&&!cancelled?1:0;s.pendingRealization+=!f.realized&&!cancelled?1:0;s.questionnaireCompleted+=f.questionnaire&&!cancelled?1:0;s.pendingQuestionnaire+=f.realized&&!f.questionnaire&&!cancelled?1:0;s.submitted+=f.submitted&&!cancelled?1:0;s.pendingSubmission+=f.questionnaire&&!f.submitted&&!cancelled?1:0;s.liquidationCandidates+=f.liquidationCandidate&&!cancelled?1:0;s.liquidationConfirmed+=f.liquidationConfirmed&&!cancelled?1:0;s.paymentConfirmed+=f.paymentConfirmed&&!cancelled?1:0;s.outOfRange+=f.outOfRange&&!cancelled?1:0;
    }
    return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
  }

  function compose(input){
    const prepared=normalizeLinkedOwners(input);
    const result=originalCompose(prepared.input);
    result.visits=arr(result.visits).map(v=>{
      const f=facets(v);
      return Object.assign({},v,{outOfRangeEvidence:f.outOfRangeEvidence,canonicalFacets:Object.assign({},v.canonicalFacets||{},{outOfRange:f.outOfRange,outOfRangeEvidence:f.outOfRangeEvidence})});
    });
    result.canonicalLifecycleSummary=periodSummary(result.visits);
    result.operationalEvidenceSummary=operationalEvidenceSummary(result.visits);
    result.periodOperationalSummary=result.operationalEvidenceSummary;
    result.identityOwnerNormalizerVersion=NORMALIZER_VERSION;
    result.identityOwnerNormalizerDiagnostics=prepared.diagnostics;
    result.diagnostics=Object.assign({},result.diagnostics||{}, {
      canonicalOutOfRangeSemantics:'actionable_unresolved',
      outOfRangeEvidencePreserved:true,
      exactLinkedOwnerNormalization:NORMALIZER_VERSION,
      visibleOperationalSummary:OPERATIONAL_EVIDENCE_VERSION,
      lifecycleInferencePreservedSeparately:true,
      backwardMilestonePromotionForVisibleKpis:false
    });
    return result;
  }

  function operationalBucketFns(){
    return {
      asignadas:v=>operationalEvidenceFacets(v).assigned,
      sinAsignar:v=>{const f=operationalEvidenceFacets(v);return !f.assigned&&!f.realized&&!f.cancelled;},
      sinAgendar:v=>{const f=operationalEvidenceFacets(v);return f.assigned&&!f.scheduled&&!f.realized&&!f.cancelled;},
      agendadas:v=>{const f=operationalEvidenceFacets(v);return f.scheduled&&!f.realized&&!f.cancelled;},
      realizadas:v=>{const f=operationalEvidenceFacets(v);return f.realized&&!f.cancelled;},
      pendRealizar:v=>{const f=operationalEvidenceFacets(v);return !f.realized&&!f.cancelled;},
      cuestPend:v=>{const f=operationalEvidenceFacets(v);return f.realized&&!f.questionnaire&&!f.cancelled;},
      sinSubmitir:v=>{const f=operationalEvidenceFacets(v);return f.questionnaire&&!f.submitted&&!f.cancelled;},
      liquidationCandidates:v=>{const f=operationalEvidenceFacets(v);return f.liquidationCandidate&&!f.cancelled;},
      liquidadas:v=>{const f=operationalEvidenceFacets(v);return f.liquidationConfirmed&&!f.cancelled;},
      fueraRango:v=>{const f=operationalEvidenceFacets(v);return f.outOfRange&&!f.cancelled;}
    };
  }

  function currentDataVisits(d){
    if(typeof d?.visitas==='function')return arr(d.visitas()).filter(v=>!v?._archived);
    return arr(d?._visitas).filter(v=>!v?._archived);
  }
  function dataCountries(d,visits){
    const configured=arr(typeof d?.period==='function'?d.period()?.countries:[]).filter(Boolean);
    return configured.length?configured:[...new Set(arr(visits).map(v=>str(v?.pais||v?.country)).filter(Boolean))];
  }

  function installOperationalEvidenceFacade(reason){
    const d=root.CX?.data;
    if(!d||!Array.isArray(d._visitas))return false;
    const current=currentDataVisits(d),countries=dataCountries(d,current),buckets=operationalBucketFns();
    d.lifecycleVisitFacets=facets;
    d.operationalEvidenceFacets=operationalEvidenceFacets;
    d.visitFacets=operationalEvidenceFacets;
    d.canonicalLifecycleSummary=periodSummary(d._visitas);
    d.operationalEvidenceSummary=operationalEvidenceSummary(d._visitas);
    d.periodOperationalSummary=d.operationalEvidenceSummary;
    d.visitBucketFns=buckets;
    d.phaseFlow=function(country){
      const vs=currentDataVisits(this).filter(v=>str(v?.pais||v?.country)===str(country)),t=vs.length||1,n=fn=>vs.filter(fn).length,pc=x=>Math.round(x/t*100);
      const count={assigned:n(v=>operationalEvidenceFacets(v).assigned),scheduled:n(v=>operationalEvidenceFacets(v).scheduled),realized:n(v=>operationalEvidenceFacets(v).realized),questionnaire:n(v=>operationalEvidenceFacets(v).questionnaire),submitted:n(v=>operationalEvidenceFacets(v).submitted),liquidationCandidates:n(v=>operationalEvidenceFacets(v).liquidationCandidate),liquidated:n(v=>operationalEvidenceFacets(v).liquidationConfirmed),sinAgendar:n(v=>{const f=operationalEvidenceFacets(v);return f.assigned&&!f.scheduled&&!f.realized&&!f.cancelled;}),sinAsignar:n(v=>{const f=operationalEvidenceFacets(v);return !f.assigned&&!f.realized&&!f.cancelled;})};
      return {total:vs.length,asign:[count.assigned,pc(count.assigned)],agend:[count.scheduled,pc(count.scheduled)],sinAgend:[count.sinAgendar,pc(count.sinAgendar)],sinAsign:[count.sinAsignar,pc(count.sinAsignar)],real:[count.realized,pc(count.realized)],cuest:[count.questionnaire,pc(count.questionnaire)],submit:[count.submitted,pc(count.submitted)],liqCandidates:[count.liquidationCandidates,pc(count.liquidationCandidates)],liq:[count.liquidated,pc(count.liquidated)]};
    };
    d.kpis=function(){
      const v=currentDataVisits(this),cs=dataCountries(this,v),P=fn=>{const o={t:v.filter(fn).length};cs.forEach(c=>o[c]=v.filter(x=>str(x?.pais||x?.country)===c&&fn(x)).length);return o;},B=this.visitBucketFns;
      return {total:P(()=>true),asignadas:P(B.asignadas),sinAsignar:P(B.sinAsignar),sinAgendar:P(B.sinAgendar),agendadas:P(B.agendadas),realizadas:P(B.realizadas),pendRealizar:P(B.pendRealizar),cuestPend:P(B.cuestPend),sinSubmitir:P(B.sinSubmitir),liquidationCandidates:P(B.liquidationCandidates),liquidadas:P(B.liquidadas),fueraRango:P(B.fueraRango),postPend:arr(this._posts).filter(p=>p?.estado==='pendiente'&&!p?._archived).length};
    };
    if(typeof d.visitsForShopper==='function'){
      d.shopperStats=function(id){const vs=this.visitsForShopper(id,false),fs=vs.map(operationalEvidenceFacets),s=this.getShopper?this.getShopper(id):null;return {total:vs.length,realizadas:fs.filter(f=>f.realized).length,liquidadas:fs.filter(f=>f.liquidationConfirmed).length,enCurso:fs.filter(f=>f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled).length,postulaciones:(this.postsForShopper?this.postsForShopper(id):[]).length||Number(s?.postulaciones||0),submitted:fs.filter(f=>f.submitted).length,liquidationCandidates:fs.filter(f=>f.liquidationCandidate).length,paymentConfirmed:fs.filter(f=>f.paymentConfirmed).length};};
      d.shopperActivo=function(s,ref){if(!s||s.identityReviewRequired)return false;const end=new Date((ref||this.activeRefDate())+'T00:00:00'),start=new Date(end);start.setMonth(start.getMonth()-6);return this.visitsForShopper(s.id,false).some(v=>{const f=operationalEvidenceFacets(v);if(!f.realized||!hasEvidence(v?.realizada))return false;const dt=new Date(v.realizada+'T00:00:00');return dt>=start&&dt<=end;});};
    }
    root.CX_TYA_F10_OPERATIONAL_EVIDENCE_READY={
      ready:true,version:OPERATIONAL_EVIDENCE_VERSION,reason:reason||'runtime',
      currentPeriodKey:str(typeof d.period==='function'?d.period()?.periodKey:d.currentPeriodId).replace(/^cinepolis-/,''),
      currentVisitCount:current.length,countries,
      sourceRevision:d.previewMeta?.sourceRevision||root.CX_TYA_HR_LIVE_META?.revision||null,
      sourceReadAt:d.previewMeta?.sourceReadAt||root.CX_TYA_HR_LIVE_META?.sourceReadAt||null,
      lifecycleSummaryPreserved:true,visibleOperationalSummary:'direct_hr_evidence',
      providerReads:0,providerWrites:0,dataWrites:0,production:false,at:new Date().toISOString()
    };
    return true;
  }

  function evidenceStageLabel(v){
    const f=operationalEvidenceFacets(v);
    if(f.paymentConfirmed)return 'Pagada';
    if(f.liquidationConfirmed)return 'Liquidada';
    if(f.submitted&&!f.realized)return 'Submitida · falta evidencia de realización en HR';
    if(f.submitted&&!f.questionnaire)return 'Submitida · falta fecha de cuestionario en HR';
    if(f.submitted)return 'Submitida';
    if(f.questionnaire)return 'Cuestionario completo · pendiente de submitir';
    if(f.realized)return 'Realizada · pendiente de cuestionario';
    if(f.outOfRange)return 'Fuera de rango';
    if(f.scheduled)return 'Agendada';
    if(f.assigned)return 'Asignada · pendiente de agendar';
    if(f.available)return 'Disponible';
    return 'Pendiente de disponibilidad';
  }

  function patchOperationalDashboard(){
    if(typeof document==='undefined'||root.CX?.session?.view!=='dashboard'||!root.CX?.data)return;
    const d=root.CX.data;
    for(const el of document.querySelectorAll('[data-fase]')){
      const parts=str(el.dataset?.fase).split('|'),country=parts[0],key=parts[1],f=d.phaseFlow(country);
      const map={total:[f.total,100],asign:f.asign,agend:f.agend,sinagend:f.sinAgend,sinasign:f.sinAsign,real:f.real,cuest:f.cuest,submit:f.submit,liq:f.liq};
      const val=map[key];if(!val)continue;
      const divs=el.querySelectorAll('div'),num=divs[0],lab=divs[1],bar=el.querySelector('.bar i');
      if(num)num.textContent=val[0];
      if(lab){const label=lab.textContent.split('·')[0].trim();lab.textContent=label+' · '+val[1]+'%';}
      if(bar)bar.style.width=val[1]+'%';
    }
    const board=document.getElementById('estadoBoard');
    if(!board)return;
    const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const vs=currentDataVisits(d),groups=[
      ['Próximas — pendientes de realizar','brand',v=>{const f=operationalEvidenceFacets(v);return f.scheduled&&!f.realized;}],
      ['Realizadas — pendientes de cuestionario','amber',v=>{const f=operationalEvidenceFacets(v);return f.realized&&!f.questionnaire;}],
      ['Cuestionario completo — pendientes de submitir','purple',v=>{const f=operationalEvidenceFacets(v);return f.questionnaire&&!f.submitted;}],
      ['Pendientes por programar','green',v=>{const f=operationalEvidenceFacets(v);return f.assigned&&!f.scheduled&&!f.realized;}],
      ['Pendientes por asignar','purple',v=>{const f=operationalEvidenceFacets(v);return !f.assigned&&!f.realized;}],
      ['Fuera de rango','red',v=>operationalEvidenceFacets(v).outOfRange]
    ];
    const rows=list=>list.slice(0,20).map(v=>`<tr><td>${esc(v?.num||'')}</td><td><b>${esc(v?.sucursal)}</b><div class="muted" style="font-size:10px">${esc(v?.pais||v?.country)} · ${esc(v?.ciudad)}</div></td><td>${esc(v?.shopper||'— sin asignar')}</td><td>${esc(v?.escenario)}</td><td>${esc(v?.realizada||v?.agendada||v?.disponibleDesde||'—')}</td><td>${esc(evidenceStageLabel(v))}</td></tr>`).join('');
    board.innerHTML=`<div class="card-h"><div class="card-t">🗂️ Estado operativo de visitas</div><span class="muted" style="font-size:11px">evidencia operacional HR · sin promoción retrospectiva</span></div>`+groups.map(([title,tone,fn])=>{const list=vs.filter(fn);return `<details ${list.length?'open':''} style="margin-bottom:10px"><summary style="background:var(--${tone}-bg);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:800;color:var(--${tone})">${title} (${list.length})</summary>${list.length?`<div style="overflow:auto"><table class="tbl"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${rows(list)}</tbody></table></div>`:''}</details>`;}).join('');
  }

  function wrapOperationalModule(id,delay){
    const modules=root.CX?.modules,current=modules&&modules[id];
    if(typeof current!=='function'||current.__f10OperationalEvidence===true)return;
    const wrapped=args=>{
      installOperationalEvidenceFacade(`${id}_pre_render`);
      const out=current(args);
      if(delay>=0)setTimeout(()=>{installOperationalEvidenceFacade(`${id}_post_render`);if(id==='dashboard')patchOperationalDashboard();},delay);
      return out;
    };
    wrapped.__f10OperationalEvidence=true;
    if(current.__c6wrapped===true)wrapped.__c6wrapped=true;
    if(current.__c6UnifiedHistory===true)wrapped.__c6UnifiedHistory=true;
    modules[id]=wrapped;
  }

  function activateRuntime(reason){
    if(root.CX_DEV_ENTRY_CANONICAL?.canonical!==true||root.CX_DEV_ENTRY_CANONICAL?.fullVisual!==true)return false;
    installOperationalEvidenceFacade(reason);
    wrapOperationalModule('dashboard',110);
    wrapOperationalModule('periodos',0);
    wrapOperationalModule('historico',0);
    wrapOperationalModule('hr-source',0);
    wrapOperationalModule('visitas',0);
    wrapOperationalModule('postulaciones',0);
    wrapOperationalModule('shoppers',70);
    wrapOperationalModule('reservas',0);
    return true;
  }

  function scheduleRuntime(reason){
    if(typeof setTimeout!=='function')return;
    setTimeout(()=>{if(activateRuntime(reason)&&root.CX?.session?.view==='dashboard')setTimeout(patchOperationalDashboard,120);},0);
  }

  api.facets=facets;
  api.periodSummary=periodSummary;
  api.operationalEvidenceFacets=operationalEvidenceFacets;
  api.operationalEvidenceSummary=operationalEvidenceSummary;
  api.compose=compose;
  api.version=(api.version||'c6-canonical-domain-composer-v2')+'+actionable-state-v3+exact-linked-owner-v1+'+OPERATIONAL_EVIDENCE_VERSION;
  root.CX_EXACT_LINKED_OWNER_NORMALIZER=Object.freeze({version:NORMALIZER_VERSION,installed:true,normalizeInput:normalizeLinkedOwners});
  root.CX_TYA_CANONICAL_STATE_SEMANTICS={version:'actionable-state-v3',outOfRange:'unresolved_only',outOfRangeEvidence:'preserved',operationalEvidence:OPERATIONAL_EVIDENCE_VERSION,lifecycleInference:'preserved_separately',visibleKpis:'direct_hr_evidence',exactLinkedOwnerNormalization:NORMALIZER_VERSION,providerWrites:0};
  root.CX_TYA_F10_OPERATIONAL_EVIDENCE=Object.freeze({version:OPERATIONAL_EVIDENCE_VERSION,facets:operationalEvidenceFacets,summarize:operationalEvidenceSummary,lifecycleFacets:facets,lifecycleSummary:periodSummary,install:installOperationalEvidenceFacade,patchDashboard:patchOperationalDashboard});

  if(typeof root.addEventListener==='function'){
    root.addEventListener('cx:live-source-updated',()=>scheduleRuntime('live_source_updated'));
    root.addEventListener('cx:full-visual-ready',()=>scheduleRuntime('full_visual_ready'));
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleRuntime('dom_ready'),{once:true});
    else scheduleRuntime('script_ready');
  }
})(typeof window!=='undefined'?window:globalThis);
