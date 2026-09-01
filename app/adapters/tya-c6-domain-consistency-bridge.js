/* CXOrbia TyA Corte 6 — DEV-only cumulative domain consistency bridge.
   Proves/fixes the human P0 without modifying prototype modules/core files:
   - one canonical visit-state facade for all consumers;
   - exact shopper identity/history/credentials/certification projection;
   - canonical period model (never restore stale DOM selects);
   - read-only historical finance projection;
   - corrected Dashboard phase board/comparative and Shopper portal history.
   No provider writes, no Auth/Rules/Storage/HR/Make/Gemini/payments, no production. */
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  if(params.get('cxHumanFullVisual')!=='YES_PAULA_20260731_FULL_PROFILE_DEV')return;
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const facets=v=>window.CX_TYA_CUMULATIVE_READ_MODEL?.facets?window.CX_TYA_CUMULATIVE_READ_MODEL.facets(v):(()=>{
    const f=v&&v.canonicalFacets||{},st=lower(v&&(v.estado||v.status||v.presentationState));
    const b=(k,x)=>typeof f[k]==='boolean'?f[k]:x;
    const assigned=b('assigned',!!(v&&(v.shopperId||v.shopperCode||v.shopper)));
    const scheduled=b('scheduled',assigned&&!!(v&&v.agendada));
    const submitted=b('submitted',!!(v&&(v.submit||v.submittedAt))||['submitida','liquidada','pagada'].includes(st));
    const questionnaire=b('questionnaire',!!(v&&v.cuestFecha)||submitted||['cuestionario','submitida','liquidada','pagada'].includes(st));
    const realized=b('realized',!!(v&&v.realizada)||questionnaire||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st));
    return {assigned,scheduled,submitted,questionnaire,realized,outOfRange:b('outOfRange',st==='fuera_rango'),cancelled:b('cancelled',!!(v&&v._archived)||['cancelada','archivada'].includes(st)),available:b('available',st==='disponible'),liquidationCandidate:b('liquidationCandidate',submitted),liquidationConfirmed:b('liquidationConfirmed',['liquidada','pagada'].includes(st)||v&&v.liquidationConfirmed===true),paymentConfirmed:b('paymentConfirmed',st==='pagada'||v&&v.paymentConfirmed===true)};
  })();
  const periodKey=()=>str(CX.data?.period?.()?.periodKey||CX.data?.currentPeriodId).replace(/^cinepolis-/,'');
  const projectPeriodId=key=>'cinepolis-'+key;
  const currentVisits=()=>arr(CX.data?.visitas?.()).filter(v=>!v._archived);
  const allVisits=()=>arr(CX.data?._visitas).filter(v=>!v._archived);
  const countryOf=v=>str(v&&v.pais||v&&v.country);
  const stageLabel=v=>{const f=facets(v);if(f.paymentConfirmed)return 'Pagada';if(f.liquidationConfirmed)return 'Liquidada';if(f.submitted)return 'Submitida';if(f.questionnaire)return 'Cuestionario completo · pendiente de submitir';if(f.realized)return 'Realizada · pendiente de cuestionario';if(f.outOfRange)return 'Fuera de rango';if(f.scheduled)return 'Agendada';if(f.assigned)return 'Asignada · pendiente de agendar';if(f.available)return 'Disponible';return 'Pendiente de disponibilidad';};
  const stageTone=v=>{const f=facets(v);return f.paymentConfirmed||f.liquidationConfirmed?'g':f.submitted?'t':f.questionnaire?'p':f.realized?'a':f.outOfRange?'r':f.scheduled?'t':f.assigned?'b':'n';};
  const splitName=name=>{const p=str(name).split(/\s+/).filter(Boolean);return {first:p[0]||'',last:p.slice(1).join(' ')||''};};
  const certStatus=s=>s&&s.certificationStatus||((s&&s.certified)?'certificada':(s&&s.certificationPresented)?'presentada':'sin_registro');

  function recalcProfile(s){
    if(!s)return s;
    if(s.__canonicalIdentityOverlay){
      const n=splitName(s.nombre);
      if(!s.firstName)s.firstName=n.first;if(!s.lastName)s.lastName=n.last;
      if(!s.user&&!s.username&&CX.CREDS&&n.first&&n.last){s.user=CX.CREDS.user(n.first,n.last);s.username=s.user;s.credentialSource='derived_existing_pattern_dev';}
      if(!s.pass&&!s.password&&CX.CREDS&&n.first&&n.last){s.pass=CX.CREDS.pass(n.first,n.last);s.password=s.pass;s.credentialSource='derived_existing_pattern_dev';}
    }
    s.whatsapp=s.whatsapp||s.phone||'';s.phone=s.phone||s.whatsapp||'';
    s.perfilCompleto=!!(str(s.nombre)&&str(s.whatsapp||s.phone)&&str(s.user||s.username)&&str(s.pass||s.password));
    s.profileCompletenessSource='actual_minimum_fields';
    return s;
  }
  function resolveSessionIdentity(){
    if(!CX.session||CX.session.role!=='shopper'||!CX.session.user)return;
    const id=str(CX.session.user.shopperId),map=CX.data&&CX.data.__identityMap||{};
    const canonical=str(map[id]||id);if(canonical&&canonical!==id){CX.session.user.shopperId=canonical;CX.session.user.identitySource='exact_crosswalk';}
    const s=arr(CX.data&&CX.data.shoppers).find(x=>str(x.id||x.shopperId)===str(CX.session.user.shopperId));
    if(s){CX.session.user.name=s.nombre||CX.session.user.name;CX.session.user.code=s.code||CX.session.user.code;CX.session.user.pais=s.pais||CX.session.user.pais;}
  }
  function installCanonicalDataFacade(){
    const d=CX.data;if(!d)return;
    const inferredMap=Object.assign({},d.__identityMap||{});
    for(const s of arr(d.shoppers)){for(const alias of arr(s.legacyLiveShopperIds)){if(alias&&!inferredMap[alias])inferredMap[alias]=s.id||s.shopperId;}}
    d.__identityMap=inferredMap;
    arr(d.shoppers).forEach(recalcProfile);resolveSessionIdentity();
    d.visitFacets=facets;
    d.visitBucketFns={
      asignadas:v=>facets(v).assigned,
      sinAsignar:v=>{const f=facets(v);return !f.assigned&&!f.realized&&!f.cancelled;},
      sinAgendar:v=>{const f=facets(v);return f.assigned&&!f.scheduled&&!f.realized&&!f.cancelled;},
      agendadas:v=>{const f=facets(v);return f.scheduled&&!f.realized&&!f.cancelled;},
      realizadas:v=>{const f=facets(v);return f.realized&&!f.cancelled;},
      pendRealizar:v=>{const f=facets(v);return !f.realized&&!f.cancelled;},
      cuestPend:v=>{const f=facets(v);return f.realized&&!f.questionnaire&&!f.cancelled;},
      sinSubmitir:v=>{const f=facets(v);return f.questionnaire&&!f.submitted&&!f.cancelled;},
      liquidadas:v=>{const f=facets(v);return f.liquidationConfirmed&&!f.cancelled;},
      fueraRango:v=>{const f=facets(v);return f.outOfRange&&!f.cancelled;}
    };
    d.visitsForShopper=function(id,onlyCurrentProject){const canonical=str((this.__identityMap||{})[str(id)]||id);return arr(this._visitas).filter(v=>str(v.shopperId)===canonical&&(!onlyCurrentProject||str(v.rootProjectId||'cinepolis')===str(this.currentProjectId||'cinepolis')));};
    d.shopperStats=function(id){const vs=this.visitsForShopper(id,false),fs=vs.map(facets);const s=this.getShopper?this.getShopper(str((this.__identityMap||{})[str(id)]||id)):null;return {total:vs.length,realizadas:fs.filter(f=>f.realized).length,liquidadas:fs.filter(f=>f.liquidationConfirmed).length,enCurso:fs.filter(f=>f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled).length,postulaciones:(this.postsForShopper?this.postsForShopper(id):[]).length||Number(s&&s.postulaciones||0),submitted:fs.filter(f=>f.submitted).length,paymentConfirmed:fs.filter(f=>f.paymentConfirmed).length};};
    d.shopperProfileComplete=function(s){return !!(s&&str(s.nombre)&&str(s.whatsapp||s.phone)&&str(s.user||s.username)&&str(s.pass||s.password));};
    d.shopperActivo=function(s,ref){if(!s||s.identityReviewRequired)return false;const end=new Date((ref||this.activeRefDate())+'T00:00:00'),start=new Date(end);start.setMonth(start.getMonth()-6);return this.visitsForShopper(s.id,false).some(v=>{const f=facets(v),raw=v.realizada||v.cuestFecha||v.submittedAt;if(!f.realized||!raw)return false;const dt=new Date(raw+'T00:00:00');return dt>=start&&dt<=end;});};
    d.phaseFlow=function(c){const vs=currentVisits().filter(v=>countryOf(v)===c),t=vs.length||1,n=fn=>vs.filter(fn).length,pc=x=>Math.round(x/t*100);const count={assigned:n(v=>facets(v).assigned),scheduled:n(v=>facets(v).scheduled),realized:n(v=>facets(v).realized),questionnaire:n(v=>facets(v).questionnaire),submitted:n(v=>facets(v).submitted),liquidated:n(v=>facets(v).liquidationConfirmed),sinAgendar:n(v=>{const f=facets(v);return f.assigned&&!f.scheduled&&!f.realized;}),sinAsignar:n(v=>{const f=facets(v);return !f.assigned&&!f.realized;})};return {total:vs.length,asign:[count.assigned,pc(count.assigned)],agend:[count.scheduled,pc(count.scheduled)],sinAgend:[count.sinAgendar,pc(count.sinAgendar)],sinAsign:[count.sinAsignar,pc(count.sinAsignar)],real:[count.realized,pc(count.realized)],cuest:[count.questionnaire,pc(count.questionnaire)],submit:[count.submitted,pc(count.submitted)],liq:[count.liquidated,pc(count.liquidated)]};};
    d.kpis=function(){const v=currentVisits(),P=fn=>{const o={t:v.filter(fn).length};arr(this.period()?.countries).forEach(c=>o[c]=v.filter(x=>countryOf(x)===c&&fn(x)).length);return o;},B=this.visitBucketFns;return {total:P(()=>true),asignadas:P(B.asignadas),sinAsignar:P(B.sinAsignar),sinAgendar:P(B.sinAgendar),agendadas:P(B.agendadas),realizadas:P(B.realizadas),pendRealizar:P(B.pendRealizar),cuestPend:P(B.cuestPend),sinSubmitir:P(B.sinSubmitir),liquidadas:P(B.liquidadas),fueraRango:P(B.fueraRango),postPend:arr(this._posts).filter(p=>p.estado==='pendiente'&&!p._archived).length};};
    d.certificationForShopper=function(id){const s=this.getShopper?this.getShopper(str((this.__identityMap||{})[str(id)]||id)):null;return s?{status:certStatus(s),presented:!!s.certificationPresented,certified:!!s.certified,records:arr(s.certificationRecords)}:{status:'sin_registro',presented:false,certified:false,records:[]};};
  }
  function installFinanceFacade(){
    if(!CX.finStore||!CX.data)return;
    const fs=CX.finStore;
    if(!fs.__c6OriginalMov)fs.__c6OriginalMov=fs.mov.bind(fs);
    if(!fs.__c6OriginalCxp)fs.__c6OriginalCxp=fs.cxp.bind(fs);
    fs.curPeriod=function(){return periodKey()||this._period||new Date().toISOString().slice(0,7);};
    fs.setPeriod=function(per){const key=str(per).replace(/^cinepolis-/,'');const id=projectPeriodId(key);if(CX.data.projects.some(p=>p.id===id)){CX.data.setCurrentPeriod?CX.data.setCurrentPeriod(id):CX.data.setProject(id);}this._period=key;CX.bus&&CX.bus.emit('fin');return key;};
    const paidItems=()=>arr(CX.data.confirmedPayments?CX.data.confirmedPayments():[]);
    fs.mov=function(pid){const manual=arr(this.__c6OriginalMov(pid));const key=str(pid).replace(/^cinepolis-/,'');const derived=paidItems().filter(x=>str(x.periodKey||'').replace(/^cinepolis-/,'')===key).map((x,i)=>({id:'hist-pay-'+str(x.paymentItemId||x.visitId||i),fecha:str(x.paidAt||x.paymentDate||'').slice(0,10)||key+'-01',tipo:'egreso',cat:'Pago histórico a shopper',tipoEgreso:'honorarios_shopper',pais:x.country||x.pais,monto:-Number(x.totalPaid||x.total||0),desc:'Pago confirmado por fuente histórica · '+str(x.visitId||x.hrRowId),estado:'Pagado',origen:'historical_source_safe',visitaId:x.visitId||null,readOnly:true,sourceSafe:true}));const seen=new Set();return [...manual,...derived].filter(m=>{const k=str(m.id);if(seen.has(k))return false;seen.add(k);return true;});};
    fs.cxp=function(pid){const manual=arr(this.__c6OriginalCxp(pid));const key=str(pid).replace(/^cinepolis-/,'');const derived=arr(CX.data.financialLiquidations?CX.data.financialLiquidations():[]).filter(x=>str(x.periodKey||'').replace(/^cinepolis-/,'')===key&&x.paymentConfirmed!==true&&x.reviewRequired!==true).map((x,i)=>({id:'canon-cxp-'+str(x.sourceRecordId||x.visitId||i),concepto:'Liquidación shopper · '+str(x.shopper||x.visitId),monto:Number(x.total||0),saldo:Number(x.total||0),pais:x.country||x.pais,origen:'canonical_source_safe',visitId:x.visitId,readOnly:true}));const seen=new Set();return [...manual,...derived].filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true;});};
  }
  function patchDashboard(){
    if(CX.session?.view!=='dashboard') return;
    for(const el of document.querySelectorAll('[data-fase]')){
      const [c,k]=str(el.dataset.fase).split('|');
      const f=CX.data.phaseFlow(c);
      const map={total:[f.total,100],asign:f.asign,agend:f.agend,sinagend:f.sinAgend,sinasign:f.sinAsign,real:f.real,cuest:f.cuest,submit:f.submit,liq:f.liq};
      const val=map[k];
      if(!val) continue;
      const divs=el.querySelectorAll('div');
      const num=divs[0],lab=divs[1],bar=el.querySelector('.bar i');
      if(num) num.textContent=val[0];
      if(lab){const label=lab.textContent.split('·')[0].trim();lab.textContent=label+' · '+val[1]+'%';}
      if(bar) bar.style.width=val[1]+'%';
    }
    const board=document.getElementById('estadoBoard');
    if(board){
      const vs=currentVisits();
      const groups=[
        ['Próximas — pendientes de realizar','brand',v=>{const f=facets(v);return f.scheduled&&!f.realized;}],
        ['Realizadas — pendientes de cuestionario','amber',v=>{const f=facets(v);return f.realized&&!f.questionnaire;}],
        ['Cuestionario completo — pendientes de submitir','purple',v=>{const f=facets(v);return f.questionnaire&&!f.submitted;}],
        ['Pendientes por programar','green',v=>{const f=facets(v);return f.assigned&&!f.scheduled&&!f.realized;}],
        ['Pendientes por asignar','purple',v=>{const f=facets(v);return !f.assigned&&!f.realized;}],
        ['Fuera de rango','red',v=>facets(v).outOfRange]
      ];
      const rows=list=>list.slice(0,20).map(v=>`<tr><td>${esc(v.num||'')}</td><td><b>${esc(v.sucursal)}</b><div class="muted" style="font-size:10px">${esc(countryOf(v))} · ${esc(v.ciudad)}</div></td><td>${esc(v.shopper||'— sin asignar')}</td><td>${esc(v.escenario)}</td><td>${esc(v.realizada||v.agendada||v.disponibleDesde||'—')}</td><td><span class="bdg bdg-${stageTone(v)}">${esc(stageLabel(v))}</span></td></tr>`).join('');
      board.innerHTML=`<div class="card-h"><div class="card-t">🗂️ Estado operativo de visitas</div><span class="muted" style="font-size:11px">máquina canónica HR · misma fuente que los KPIs</span></div>`+groups.map(([t,tone,fn])=>{
        const list=vs.filter(fn);
        return `<details ${list.length?'open':''} style="margin-bottom:10px"><summary style="background:var(--${tone}-bg);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:800;color:var(--${tone})">${t} (${list.length})</summary>${list.length?`<div style="overflow:auto"><table class="tbl"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>Fecha</th><th>Estado canónico</th></tr></thead><tbody>${rows(list)}</tbody></table></div>`:''}</details>`;
      }).join('');
    }
    const comp=[...document.querySelectorAll('.card-t')].find(x=>x.textContent.includes('Comparativo último trimestre'))?.closest('.card');
    if(!comp) return;
    const summaries=arr(CX.data.periodOperationalSummary).slice().sort((a,b)=>str(a.periodKey).localeCompare(str(b.periodKey)));
    const current=periodKey();
    let idx=summaries.findIndex(x=>str(x.periodKey)===current);
    if(idx<0) idx=summaries.length-1;
    const last=summaries.slice(Math.max(0,idx-2),idx+1);
    const table=comp.querySelector('table');
    if(!table||!last.length) return;
    const mes=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const heads=table.querySelectorAll('thead th');
    last.forEach((s,i)=>{if(heads[i+1]) heads[i+1].textContent=mes[Number(str(s.periodKey).slice(5,7))-1]||s.periodKey;});
    for(const tr of table.querySelectorAll('tbody tr')){
      const label=lower(tr.cells[0]?.textContent);
      const vals=last.map(s=>{
        if(label.includes('cumpl')) return s.total?Math.round(Number(s.realized||0)/s.total*100)+'%':'—';
        if(label.includes('visitas realizadas')) return Number(s.realized||0);
        if(label.includes('cuestionarios')) return s.realized?Math.round(Number(s.questionnaireCompleted||0)/s.realized*100)+'%':'—';
        if(label.includes('cobertura')) return s.total?Math.round(Number(s.assigned||0)/s.total*100)+'%':'—';
        return '—';
      });
      vals.forEach((v,i)=>{if(tr.cells[i+1]) tr.cells[i+1].textContent=v;});
      const nums=last.map(s=>label.includes('visitas realizadas')?Number(s.realized||0):label.includes('cumpl')?(s.total?Math.round(Number(s.realized||0)/s.total*100):null):null);
      const deltaCell=tr.cells[last.length+1];
      if(deltaCell&&nums.at(-1)!=null&&nums.at(-2)!=null){const delta=nums.at(-1)-nums.at(-2);deltaCell.textContent=(delta>=0?'+':'')+delta;}
    }
  }
  function patchShoppers(){
    if(CX.session?.view!=='shoppers')return;
    for(const tr of document.querySelectorAll('#shBody [data-sid]')){const s=CX.data.getShopper?.(tr.dataset.sid);if(!s)continue;const cells=tr.querySelectorAll('td');if(cells[3])cells[3].innerHTML=s.perfilCompleto?'<span class="bdg bdg-g">Completo</span>':'<span class="bdg bdg-a">Incompleto</span>';if(cells[4]){const st=certStatus(s);cells[4].innerHTML=st==='certificada'?'<span class="bdg bdg-g">Certificado</span>':st==='presentada'?'<span class="bdg bdg-b">Certificación presentada</span>':'<span class="bdg bdg-n">Sin certificación</span>';}}
  }
  function watchProfileModals(){
    const observer=new MutationObserver(()=>{for(const modal of document.querySelectorAll('.cx-modal:not([data-c6-profile-checked])')){modal.dataset.c6ProfileChecked='1';const title=str(modal.querySelector('.cx-modal-h .card-t')?.textContent);const matches=arr(CX.data?.shoppers).filter(s=>str(s.nombre)===title);if(matches.length!==1)continue;const s=matches[0],body=modal.querySelector('.cx-modal-b');if(!body)continue;const cs=certStatus(s),box=document.createElement('div');box.className='card card-p';box.style.margin='10px 0';box.style.background='var(--panel-2)';box.innerHTML=`<div class="between"><b style="font-size:12.5px">Certificación del proyecto</b><span class="bdg bdg-${cs==='certificada'?'g':cs==='presentada'?'b':'n'}">${cs==='certificada'?'Certificada':cs==='presentada'?'Presentada':'Sin registro'}</span></div><div style="font-size:11px;color:var(--t3);margin-top:5px">${arr(s.certificationRecords).length} registro(s) exactos · identidad ${s.__canonicalIdentityOverlay?'canónica':'HR operacional'}</div>`;body.insertBefore(box,body.children[2]||null);}}
    );observer.observe(document.body,{childList:true,subtree:true});
  }
  function correctedMisVisitas({data,ui}){
    resolveSessionIdentity();const sid=str(CX.session?.user?.shopperId),host=ui.el('div');if(!sid){host.innerHTML=ui.empty('🔒','Identidad shopper no verificable.');return host;}
    let tab='activas';const all=data.visitsForShopper(sid,false).slice().sort((a,b)=>str(b.realizada||b.agendada||b.disponibleDesde).localeCompare(str(a.realizada||a.agendada||a.disponibleDesde)));const cur=periodKey();const active=all.filter(v=>str(v.periodKey)===cur&&!facets(v).paymentConfirmed&&!facets(v).liquidationConfirmed&&!facets(v).cancelled),hist=all.filter(v=>!active.includes(v));
    const cards=list=>list.length?list.map(v=>`<div class="card card-p" style="margin-bottom:10px;border-left:3px solid var(--${stageTone(v)})"><div class="between"><b>${esc(v.sucursal)}</b><span class="bdg bdg-${stageTone(v)}">${esc(stageLabel(v))}</span></div><div style="font-size:11.5px;color:var(--t3);margin-top:5px">${esc(v.periodLabel||v.periodKey)} · ${esc(v.ciudad)} · ${esc(v.escenario)} · ${esc(v.realizada||v.agendada||v.disponibleDesde||'sin fecha')}</div><div class="flex wrap" style="gap:5px;margin-top:9px">${[['Asignada','assigned'],['Agendada','scheduled'],['Realizada','realized'],['Cuestionario','questionnaire'],['Submitida','submitted'],['Liquidada','liquidationConfirmed'],['Pagada','paymentConfirmed']].map(([l,k])=>`<span class="bdg ${facets(v)[k]?'bdg-g':'bdg-n'}" style="font-size:9px">${facets(v)[k]?'✓':'○'} ${l}</span>`).join('')}</div></div>`).join(''):ui.empty('🗒️','Sin visitas en esta categoría.');
    const draw=()=>{host.innerHTML=`${ui.ph('Mis Visitas',data.period().name+' · historial canónico completo')}<div class="flex" style="gap:8px;margin-bottom:14px"><button class="btn btn-sm ${tab==='activas'?'btn-pr':'btn-ghost'}" data-tab="activas">Activas ${active.length}</button><button class="btn btn-sm ${tab==='historial'?'btn-pr':'btn-ghost'}" data-tab="historial">Historial ${hist.length}</button><span class="bdg bdg-b">Total ${all.length}</span></div>${cards(tab==='activas'?active:hist)}`;host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));};draw();return host;
  }
  function wrapModules(){
    if(!CX.modules)return;
    const dash=CX.modules.dashboard;if(typeof dash==='function'&&!dash.__c6wrapped){const w=args=>{const out=dash(args);setTimeout(()=>{installCanonicalDataFacade();patchDashboard();},80);return out;};w.__c6wrapped=true;CX.modules.dashboard=w;}
    const shoppers=CX.modules.shoppers;if(typeof shoppers==='function'&&!shoppers.__c6wrapped){const w=args=>{const out=shoppers(args);setTimeout(()=>{installCanonicalDataFacade();patchShoppers();},50);return out;};w.__c6wrapped=true;CX.modules.shoppers=w;}
    CX.modules.misvisitas=correctedMisVisitas;
    for(const id of ['financiero','movimientos','liquidaciones','lotes','beneficios']){const original=CX.modules[id];if(typeof original==='function'&&!original.__c6wrapped){const w=args=>{installCanonicalDataFacade();installFinanceFacade();return original(args);};w.__c6wrapped=true;CX.modules[id]=w;}}
  }
  function activate(reason){installCanonicalDataFacade();installFinanceFacade();wrapModules();window.CX_TYA_C6_DOMAIN_CONSISTENCY_READY={ready:true,reason:reason||'activate',visitStateAuthority:'canonicalFacets',periodAuthority:'CX.data.currentPeriodId',unmatchedProfilesExcluded:true,providerWrites:0,production:false};}
  window.addEventListener('cx:full-visual-ready',()=>{activate('full_visual_ready');resolveSessionIdentity();if(CX.session?.view)CX.router?._reRender?.();});
  document.addEventListener('DOMContentLoaded',()=>{activate('dom_ready');watchProfileModals();},{once:true});
  if(document.readyState!=='loading'){activate('script_ready');watchProfileModals();}
})();
