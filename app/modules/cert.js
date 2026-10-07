/* CXOrbia · Certificación (admin + shopper) — durable connected authority */
CX.certStore = CX.certStore || {
  _demo:{},
  connected(){return CX.BACKEND?.enabled===true;},
  safeId(v){return String(v||'main').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'main';},
  resourceId(pid,certificationId='main'){
    const projectId=String(CX.data?.currentProjectId||'project'),base=('certbank-'+projectId+'-'+String(pid||'period')).replace(/[^a-zA-Z0-9_-]+/g,'-'),cid=this.safeId(certificationId);
    return cid==='main'?base:(base+'-'+cid);
  },
  banks(pid){
    if(this.connected()){
      return (CX.backendResources?.list?.({projectId:CX.data.currentProjectId,periodId:pid,resourceType:'certification_bank'})||[])
        .filter(row=>row?.bank)
        .map(row=>Object.assign({},row.bank,{certificationId:row.bank.certificationId||'main',__resourceId:row.id,__resourceVersion:row.version}))
        .sort((a,b)=>String(a.certificationName||a.name||a.certificationId).localeCompare(String(b.certificationName||b.name||b.certificationId)));
    }
    return Object.values(this._demo[pid]||{});
  },
  bank(pid,certificationId){
    const rows=this.banks(pid),cid=certificationId?this.safeId(certificationId):'';
    if(cid){const exact=rows.find(x=>this.safeId(x.certificationId)===cid);if(exact)return exact;}
    return rows.find(x=>['published','confirmed','approved_preview'].includes(String(x.estado||'')))||rows[0]||null;
  },
  async save(pid,data,certificationId){
    const cid=this.safeId(certificationId||data?.certificationId||'main'),bank=Object.assign({},data,{certificationId:cid});
    if(!this.connected()){this._demo[pid]=this._demo[pid]||{};this._demo[pid][cid]=bank;CX.bus&&CX.bus.emit('cert');return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,demo:true,item:bank};}
    if(!CX.backendResources?.saveMetadata)return {ok:false,status:'blocked',providerAck:false,successUiAllowed:false,code:'CERT_DURABLE_BACKEND_UNAVAILABLE'};
    const id=this.resourceId(pid,cid),result=await CX.backendResources.saveMetadata({
      id,resourceType:'certification_bank',projectId:CX.data.currentProjectId,periodId:pid,
      n:bank.certificationName||bank.name||'Banco de certificación',tipo:'certification_bank',bank,
      visibleRoles:['super','admin','ops','coordinador','shopper'],targetAll:false
    },{projectId:CX.data.currentProjectId,periodId:pid,idempotencyKey:'certbank.save:'+id+':'+String(bank.contentRevision||bank.updatedAt||bank.generatedAt||'current')});
    if(result?.providerAck===true)CX.bus&&CX.bus.emit('cert');
    return result;
  },
  async clear(pid,certificationId='main'){
    const cid=this.safeId(certificationId),id=this.resourceId(pid,cid);
    if(!this.connected()){if(this._demo[pid])delete this._demo[pid][cid];return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,demo:true};}
    return CX.backendResources?.deleteMetadata?.(id,{projectId:CX.data.currentProjectId,periodId:pid,idempotencyKey:'certbank.delete:'+id});
  },
  /* parsea el texto/JSON de la IA a preguntas estructuradas [{q,ops:[],correcta,exp}] */
  parse(raw){
    try{ const j=JSON.parse(raw.replace(/```json|```/g,'').trim()); if(Array.isArray(j))return j; if(j.preguntas)return j.preguntas; }catch(e){}
    /* fallback: parse lista numerada "1. pregunta ... a) ... (correcta: X)" */
    const out=[]; const blocks=raw.split(/\n(?=\d+[.\)])/);
    blocks.forEach(b=>{ const q=(b.match(/^\d+[.\)]\s*(.+)/)||[])[1]; if(!q)return;
      const ops=[...b.matchAll(/[a-d]\)\s*([^\n]+)/gi)].map(m=>m[1].trim());
      const corr=(b.match(/correct[ao]:?\s*([^\n]+)/i)||[])[1];
      const exp=(b.match(/(?:explicaci[oó]n|porque)[:\s]+([^\n]+)/i)||[])[1]||'';
      out.push({q:q.trim(),ops:ops.length?ops:['Verdadero','Falso'],correcta:(corr||ops[0]||'').trim(),exp:exp.trim()});
    });
    return out.length?out:null;
  },

};
CX.module('cert', ({role,data,ui})=>{
  const p=data.period();
  const selectedCertId=()=>String(window.CX_CERT_SELECTED_ID||'');
  const bankList=()=>CX.certStore.banks(p.id);
  const selectedBank=()=>CX.certStore.bank(p.id,selectedCertId());
  const projectPrograms=()=>{const all=typeof data.programs==='function'?data.programs():[];let allowed=[];try{allowed=(CX.backendAuth?.context?.()?.projectIds||[]).map(String);}catch(_){}return all.filter(x=>!allowed.length||allowed.includes(String(x.key)));};
  const certFilters=()=>{
    const programs=projectPrograms(),banks=bankList();
    const project=programs.length>1?`<div><label class="lbl">Proyecto</label><select class="sel" onchange="if(CX.data.setCurrentProject(this.value)){window.CX_CERT_SELECTED_ID='';CX.router.nav('cert')}">${programs.map(x=>`<option value="${x.key}" ${String(x.key)===String(data.currentProjectId)?'selected':''}>${x.name||x.key}</option>`).join('')}</select></div>`:'';
    const bankSel=banks.length>1?`<div><label class="lbl">Certificación</label><select class="sel" onchange="window.CX_CERT_SELECTED_ID=this.value;CX.router.nav('cert')"><option value="">Selecciona certificación</option>${banks.map(b=>`<option value="${b.certificationId}" ${String(b.certificationId)===selectedCertId()?'selected':''}>${b.certificationName||b.name||b.certificationId} · ${b.estado||'borrador'}</option>`).join('')}</select></div>`:'';
    return project||bankSel?`<div class="grid g2" style="gap:10px;margin-bottom:14px">${project}${bankSel}</div>`:'';
  };
  const phCert=subtitle=>ui.ph('Certificación',subtitle)+certFilters();
  const historicalEvidenceFor=s=>Array.isArray(s?.certificationEvidenceRecords)?s.certificationEvidenceRecords:[];
  const currentShopper=()=>{
    const raw=String(CX.session?.user?.shopperId||'').trim();
    const sid=raw?String(data.__identityMap?.[raw]||raw).trim():'';
    const protectedProfile=data.__sessionShopperProfile;
    if(protectedProfile&&[raw,sid].includes(String(protectedProfile.id||protectedProfile.shopperId)))return protectedProfile;
    return (data.getShopper&&data.getShopper(sid))||(data.getShopper&&data.getShopper(raw))||(data.shoppers||[]).find(x=>[raw,sid].includes(String(x.id||x.shopperId)))||null;
  };
  if(role==='shopper'){
    /* Bloque A (auditoría V101 — 20260711): un banco en estado draft/pending_review NO habilita
       certificación para el shopper — solo approved_preview (práctica, en este prototipo) o un
       estado confirmado por backend habilitan tomar el examen. Antes cualquier banco con
       preguntas se ofrecía sin mirar su estado. */
    const bank=selectedBank();
    const shopper=currentShopper(),shopperId=String(shopper?.id||shopper?.shopperId||CX.session?.user?.shopperId||'');
    const durable=CX.backendCertifications?.durableCurrent?.(shopperId,bank);
    const carry=CX.backendCertifications?.carryoverDecision?.(shopper,bank,data.currentProjectId||p.projectId||'')||{state:'none',eligibilityGranted:false};
    if(durable){
      return `${phCert( p.name+' · certificación vigente')}
        <div class="card card-p" style="border-left:4px solid var(--green)"><div class="card-t">✓ Certificación vigente</div><div style="font-size:12.5px;color:var(--t2);margin-top:6px">Último intento aprobado: <b>${durable.score}%</b> · requisito ${durable.gate}% · persistido con ACK remoto el ${String(durable.createdAt||'').slice(0,10)}.</div></div>`;
    }
    if(carry.eligibilityGranted===true){
      return `${phCert( p.name+' · certificación histórica reutilizada')}
        <div class="card card-p" style="border-left:4px solid var(--green)"><div class="card-t">✓ Certificación vigente para este proyecto</div><div style="font-size:12.5px;color:var(--t2);margin-top:6px">Existe una certificación aprobada de este proyecto y no hay una solicitud vigente de re-certificación. No necesitas certificarte de nuevo mientras esa condición siga válida.</div></div>`;
    }
    /* P0-7 (paquete acumulado 20260711): 'pending_backend' significa "esperando confirmación de
       backend", NO "disponible para tomar" — incluirlo aquí dejaba certificar sobre un banco que
       todavía no está aprobado ni confirmado. Solo approved_preview (práctica, rotulada como tal)
       o un estado ya confirmado por backend (confirmed/published) habilitan el examen. */
    const bankTakeable = bank && bank.preguntas && bank.preguntas.length && ['approved_preview','confirmed','published'].includes(bank.estado);
    if(bank && bank.preguntas && bank.preguntas.length && !bankTakeable){
      return `${phCert( p.name+' · banco en revisión')}
        <div class="card card-p">${ui.degraded('Hay un banco de preguntas en preparación ('+(bank.estado||'borrador')+') todavía no revisado/aprobado — no está disponible para certificarte. Vuelve a intentarlo cuando el equipo lo publique.',{title:'Certificación · banco no publicado'})}</div>`;
    }
    if(bankTakeable){
      const host=ui.el('div'); const answers={};
      const draw=()=>{
        host.innerHTML=`
          ${phCert( p.name+' · '+bank.preguntas.length+' preguntas · requisito '+(bank.gate||80)+'%')}
          <div class="card card-p" id="examBox">
            ${bank.preguntas.map((q,i)=>`<div style="border:1px solid var(--border);border-radius:9px;padding:12px 14px;margin-bottom:10px">
              <b style="font-size:13px;color:var(--t1)">${i+1}. ${q.q}</b>
              <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
                ${(q.ops||[]).map(o=>`<label class="flex" style="gap:8px;font-size:12.5px;cursor:pointer;padding:6px 9px;border:1px solid var(--border);border-radius:7px"><input type="radio" name="q${i}" value="${o.replace(/"/g,'&quot;')}"> ${o}</label>`).join('')}
              </div>
              <div class="examFb" data-i="${i}" style="display:none;margin-top:8px;font-size:11.5px;line-height:1.5"></div>
            </div>`).join('')}
            <div class="between" style="margin-top:8px"><span class="muted" style="font-size:11.5px">Responde y verifica; el feedback explica cada respuesta.</span><button class="btn btn-pr btn-sm" id="examGo">Verificar y certificar</button></div>
          </div>`;
        host.querySelectorAll('input[type=radio]').forEach(r=>r.addEventListener('change',e=>{answers[e.target.name]=e.target.value;}));
        host.querySelector('#examGo').addEventListener('click',async()=>{
          const btn=host.querySelector('#examGo'),isPreviewOnly=bank.estado==='approved_preview';
          const selected=bank.preguntas.map((q,i)=>answers['q'+i]||'');
          if(selected.some(x=>!x)){ui.toast('Responde todas las preguntas antes de enviar.','warn',3500);return;}
          btn.disabled=true;btn.textContent=isPreviewOnly?'Verificando práctica…':'Guardando intento…';
          try{
            let result;
            if(isPreviewOnly){
              let ok=0;
              const feedback=bank.preguntas.map((q,i)=>{const mine=selected[i],correct=mine.trim().toLowerCase()===(q.correcta||'').trim().toLowerCase();if(correct)ok++;return {index:i,ok:correct,selected:mine,correcta:q.correcta||'',exp:q.exp||''};});
              const score=Math.round(ok/bank.preguntas.length*100);
              result={score,pass:score>=(bank.gate||80),gate:bank.gate||80,feedback,preview:true};
            }else{
              if(!CX.backendCertifications?.submitAttempt)throw new Error('CERT_PERSISTENCE_PROVIDER_UNAVAILABLE');
              result=await CX.backendCertifications.submitAttempt({periodId:p.id,bankResourceId:bank.__resourceId,answers:selected});
              if(!(result?.providerAck===true&&result?.committed===true))throw new Error('CERT_ATTEMPT_ACK_REQUIRED');
              try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('certification_attempt_committed',true);}catch(_){}
              try{CX.bus?.emit?.('visit-flow',{reason:'certification_attempt_committed',preserveUiState:true});}catch(_){}
            }
            const score=Number(result.score||0),pass=result.pass===true,feedback=Array.isArray(result.feedback)?result.feedback:[];
            feedback.forEach(x=>{const fb=host.querySelector('.examFb[data-i="'+x.index+'"]');if(fb){fb.style.display='block';fb.innerHTML=(x.ok?'<b style="color:var(--green)">✓ Correcta</b>':'<b style="color:var(--amber)">↻ A reforzar</b> · correcta: <b style="color:var(--green)">'+(x.correcta||'—')+'</b>')+(x.exp?'<div style="color:var(--t2);margin-top:3px">'+x.exp+'</div>':'');}});
            const ok=feedback.filter(x=>x.ok).length,box=host.querySelector('#examBox');
            box.insertAdjacentHTML('afterbegin',`<div class="flex" style="gap:14px;background:var(--${pass?'green':'amber'}-bg);border-radius:11px;padding:13px 16px;margin-bottom:12px"><div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--${pass?'green':'amber'})">${score}%</div><div><b style="color:var(--t1)">${pass?'Aprobado':'No alcanzado'}</b> · ${ok}/${bank.preguntas.length} correctas · requisito ${result.gate||bank.gate||80}%<div style="font-size:12px;color:var(--t3)">${pass?(isPreviewOnly?'Práctica aprobada — no modifica elegibilidad.':'Intento persistido con ACK remoto · certificación vigente.'):'Intento persistido · repasa el feedback y vuelve a intentarlo.'}</div></div></div>`);
            if(!isPreviewOnly)CX.automations?.fire?.('certificacion',{shopper:(CX.session.user&&CX.session.user.name)||'',score,pass});
            ui.toast(pass?(isPreviewOnly?'✓ Práctica aprobada ('+score+'%)':'✓ Certificación aprobada y guardada ('+score+'%)'):'Puntaje '+score+'% · intento guardado','ok',4200);
          }catch(error){
            ui.toast('No se pudo confirmar el intento: '+String(error?.message||error),'warn',5200);
          }finally{
            btn.disabled=false;btn.textContent='Verificar y certificar';
          }
        });
      };
      draw(); return host;
    }
    /* Bloque A (auditoría V101 — 20260711): sin un banco publicado/tomable, este bloque mostraba
       SIEMPRE un examen y score fijos (88%, "Aprobado", "1 intento") como si fueran resultado real
       del shopper — incluso fuera de modo demo. Ahora solo se muestra fuera de demo si es
       explícitamente demo; fuera de demo se rotula "pendiente de fuente", sin inventar aprobación. */
    const _showFixturesShopper = CX.dataSource ? CX.dataSource.showFixtures() : true;
    if(!_showFixturesShopper){
      const ev=historicalEvidenceFor(currentShopper()),approved=ev.filter(x=>String(x.sourceLegacyStatus||'').toLowerCase()==='approved').length,failed=ev.filter(x=>String(x.sourceLegacyStatus||'').toLowerCase()==='failed').length;
      const ownCurrent=(typeof data.visitsForShopper==='function'?data.visitsForShopper(shopperId,false):[]).filter(v=>String(data.recordPeriodId?data.recordPeriodId(v):(v.periodId||v.projectId)||'')===String(data.currentPeriodId||''));
      const scheduledCurrent=ownCurrent.filter(v=>{const f=data.visitFacets?.(v)||v.canonicalFacets||{};return f.scheduled===true&&f.realized!==true;});
      const humanReason=ev.length?'Encontramos evidencia histórica vinculada a tu identidad, pero todavía no está validada como certificación vigente para este proyecto. El equipo debe revisarla o publicar el banco correspondiente.':'No encontramos una certificación previa válida asociada a tu identidad y todavía no hay un banco de preguntas publicado para este proyecto. El equipo debe publicar la certificación antes de que puedas completarla.';
      return `${phCert( p.name+' · certificación pendiente')}
        ${ev.length?`<div class="card card-p" style="margin-bottom:12px;border-left:4px solid var(--amber)"><div class="card-t" style="font-size:13px">Tu historial de certificación está en revisión</div><div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:6px">${ev.length} registro(s) vinculados por identidad exacta · ${approved} aprobado(s) históricamente${failed?' · '+failed+' no aprobado(s)':''}. No se te marcará como certificada hasta que exista una validación vigente del mismo proyecto.</div></div>`:''}
        ${scheduledCurrent.length?`<div class="card card-p" style="margin-bottom:12px;border-left:4px solid var(--brand)"><div class="card-t" style="font-size:13px">Tu visita ya tiene fecha, pero la certificación sigue pendiente</div><div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:6px">La agenda proviene de la operación/HR y no reemplaza el requisito de certificación. Esta etapa permanece pendiente hasta que exista certificación vigente.</div></div>`:''}
        <div class="card card-p">${ui.degraded(humanReason,{title:'Certificación aún no disponible'})}</div>`;
    }
    const fb=[
      {ok:true, q:'¿Puedes revelar que eres evaluador?', tu:'No', correcta:'No', exp:'El anonimato es la base del mystery shopping: si te identificas, el comportamiento del personal se altera y la medición pierde validez. Nunca reveles tu rol, ni siquiera al salir.'},
      {ok:true, q:'¿Qué incluye un combo en el reembolso?', tu:'Boleto + alimentos del escenario', correcta:'Boleto + alimentos del escenario', exp:'El combo cubre los consumos definidos en el instructivo del proyecto; conserva siempre el comprobante para el reembolso.'},
      {ok:false, q:'¿Desde cuándo se mide el tiempo de espera?', tu:'Desde que ordenas', correcta:'Desde que ingresas a la fila / punto de atención', exp:'El tiempo de espera se cronometra desde que el cliente entra a la fila o zona de atención, NO desde que llega al mostrador. Medirlo mal subestima el indicador y distorsiona el cumplimiento del estándar de servicio.', mat:'Protocolo de compra incógnita'},
      {ok:false, q:'¿Qué haces ante una incidencia (p. ej. mal trato)?', tu:'Lo anoto al final', correcta:'Registrar de inmediato con hora, lugar y evidencia', exp:'Las incidencias deben registrarse en el momento, con hora exacta, ubicación y evidencia (foto/audio según aplique). Anotarlo "al final" pierde detalles y debilita el reporte ante el cliente.', mat:'Evidencia y fotografía'},
    ];
    const aciertos=fb.filter(x=>x.ok).length, score=Math.round(aciertos/fb.length*100*1.1);
    return `
      ${phCert( p.name+' · aprueba el escenario antes de ejecutar')}
      <div class="card card-p" style="margin-bottom:14px;border-left:3px solid var(--brand)">
        <div style="font-size:11px;color:var(--t3);margin-bottom:8px">🎓 Ejemplo ilustrativo (modo demo) — no es un resultado de certificación real de este shopper.</div>
        <div class="flex" style="gap:14px;background:var(--green-bg);border-radius:11px;padding:13px 16px">
          <div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--green)">${score}%</div>
          <div><b style="color:var(--t1)">Aprobado (demo)</b> · 1 intento de ejemplo · requisito mínimo superado<div style="font-size:12px;color:var(--t3)">Ejemplo del feedback dirigido que verá el shopper. Revisa abajo el detalle.</div></div>
        </div>
      </div>
      <div class="card card-p">
        <div class="card-h"><div class="card-t">🎯 Tu retroalimentación detallada</div><span class="muted" style="font-size:11px">${aciertos}/${fb.length} correctas</span></div>
        ${fb.map(x=>`<div style="border:1px solid var(--border);border-left:3px solid var(--${x.ok?'green':'amber'});border-radius:9px;padding:11px 13px;margin-bottom:9px">
          <div class="between" style="gap:10px"><b style="font-size:12.5px;color:var(--t1)">${x.ok?'✓':'↻'} ${x.q}</b>${x.ok?ui.bdg('Correcta','g'):ui.bdg('A reforzar','a')}</div>
          ${!x.ok?`<div style="font-size:11.5px;color:var(--t3);margin-top:5px">Tu respuesta: <span style="color:var(--red)">${x.tu}</span></div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:2px">Respuesta correcta: <b style="color:var(--green)">${x.correcta}</b></div>`:''}
          <div style="font-size:11.5px;color:var(--t2);margin-top:6px;line-height:1.5">${x.exp}</div>
          ${!x.ok&&x.mat?`<button class="btn btn-soft btn-sm" data-mat="${x.mat}" style="margin-top:8px">📚 Repasar: ${x.mat} →</button>`:''}
        </div>`).join('')}
        <div style="margin-top:6px">${ui.aiBox('Te muestro exactamente qué fallaste, la respuesta correcta explicada y te llevo al material del Centro de Aprendizaje para reforzarlo antes de tu próxima visita.','Feedback dirigido y accionable')}</div>
      </div>
      <script></script>`.replace('<script></script>','')+(()=>{setTimeout(()=>{document.querySelectorAll('[data-mat]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('aprendizaje')));},0);return '';})();
  }
  const _showFixtures = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const bank = selectedBank();
  const html=`
    ${phCert( p.name+' · banco de preguntas, requisito mínimo y reporte de vacíos')}
      <button class="btn btn-pr btn-sm" id="certIA">🤖 Crear certificación con IA (desde instructivo)</button>
      <button class="btn btn-soft btn-sm" id="certImp">📥 Importar banco</button>
      <button class="btn btn-soft btn-sm" id="certRecert">🔄 Solicitar re-certificación</button>
      <button class="btn btn-ghost btn-sm" id="certGate">⚙️ Requisito y % mínimo</button>
    </div>
    <div class="card card-p" style="margin-bottom:14px"><div class="between"><div><div class="card-t">Certificaciones del proyecto</div><div style="font-size:11px;color:var(--t3);margin-top:3px">${bankList().length} banco(s) en este periodo · selecciona proyecto/certificación arriba para administrarlos.</div></div><span class="bdg bdg-n">${bank?.estado||'sin banco'}</span></div></div>
    ${_showFixtures ? `
    <div class="grid g4" style="margin-bottom:16px" id="certKpis">
      <div data-ck="cert" style="cursor:pointer">${ui.kpi('Certificados (demo)',18,'g')}</div>
      <div data-ck="prog" style="cursor:pointer">${ui.kpi('En progreso (demo)',6,'a')}</div>
      <div data-ck="avg" style="cursor:pointer">${ui.kpi('Aprob. promedio (demo)','84%','b')}</div>
      <div data-ck="gate" style="cursor:pointer">${ui.kpi('Requisito activo','Sí','p')}</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📊 Vacíos detectados · para el equipo (demo)</div></div>
      ${ui.bar(40,'Tiempos de espera','40%')}
      ${ui.bar(18,'Proceso de pago','18%')}
      ${ui.bar(9,'Registro incidencia','9%')}
      <div style="margin-top:12px">${ui.aiBox('El 40% falla la misma pregunta sobre tiempos de espera — conviene reforzar ese material. Genero el reporte de vacíos automáticamente. (datos de ejemplo)','Mejora continua')}</div>
    </div>` : `
    ${(()=>{const all=(data.shoppers||[]).flatMap(s=>historicalEvidenceFor(s)),approved=all.filter(x=>String(x.sourceLegacyStatus||'').toLowerCase()==='approved').length,failed=all.filter(x=>String(x.sourceLegacyStatus||'').toLowerCase()==='failed').length,shopperCount=(data.shoppers||[]).filter(s=>historicalEvidenceFor(s).length).length;return `
    <div class="grid g4" style="margin-bottom:16px" id="certKpis">
      <div data-ck="hist" style="cursor:pointer">${ui.kpi('Evidencias históricas',all.length,'a')}</div>
      <div data-ck="linked" style="cursor:pointer">${ui.kpi('Shoppers vinculados',shopperCount,'b')}</div>
      <div data-ck="approved" style="cursor:pointer">${ui.kpi('Aprobadas históricas',approved,'g')}</div>
      <div data-ck="gate" style="cursor:pointer">${ui.kpi('Requisito activo',bank&&bank.gate?'Sí':'No','p')}</div>
    </div>
    <div class="card card-p">
      <div style="font-size:12px;color:var(--t2);line-height:1.65;margin-bottom:10px"><b>Evidencia histórica exacta:</b> ${all.length} registro(s), ${approved} aprobado(s) legacy${failed?' y '+failed+' no aprobado(s)':''}. Una aprobación del mismo proyecto permanece vigente salvo vencimiento explícito o solicitud durable de re-certificación.</div>
      ${bank&&bank.estado==='approved_preview'?ui.degraded('Banco revisado por '+(bank.revisadoPor||'—')+' y disponible para práctica. La publicación oficial sigue pendiente.',{title:'Certificación · práctica disponible · publicación pendiente'}):ui.degraded('La certificación vigente continúa pendiente de una fuente/revisión autorizada. El historial del mismo proyecto conserva vigencia salvo vencimiento o re-certificación requerida; otros proyectos permanecen separados.', {title:'Certificación vigente · pendiente de validación'})}
    </div>`;})()}`}`;
  setTimeout(()=>{
    const ckData={
      cert:['Shoppers certificados (18)','<table class="tbl"><thead><tr><th>Shopper</th><th>Score</th><th>Fecha</th></tr></thead><tbody>'+['Evaluador 01|92|2026-05-12','Evaluador 03|88|2026-05-14','Evaluador 05|85|2026-05-20','Evaluador 07|90|2026-06-02'].map(r=>{const[n,s,f]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(s+'%','g')}</td><td style="font-size:12px">${f}</td></tr>`;}).join('')+'<tr><td colspan="3" style="font-size:11px;color:var(--t3);text-align:center">+ 14 más</td></tr></tbody></table>'],
      prog:['En progreso (6)','<table class="tbl"><thead><tr><th>Shopper</th><th>Avance</th><th>Intentos</th></tr></thead><tbody>'+['Evaluador 09|60|1','Evaluador 12|40|1','Evaluador 14|75|2'].map(r=>{const[n,a,i]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(a+'%','a')}</td><td>${i}</td></tr>`;}).join('')+'</tbody></table>'],
      avg:['Aprobación promedio · 84%','<p style="font-size:13px;color:var(--t2);line-height:1.7">Promedio del último intento de cada shopper certificado. El requisito mínimo exige 80%; el banco de preguntas (borrador local, revisado por un humano) y el feedback dirigido suben este indicador con el tiempo.</p>'],
      gate:['Requisito de certificación','<p style="font-size:13px;color:var(--t2);line-height:1.7">El requisito mínimo está <b>'+((bank&&bank.gate)?'activo':'inactivo')+'</b>: '+((bank&&bank.gate)?('un shopper no puede ejecutar visitas del proyecto hasta aprobar (≥'+bank.gate+'%). Una vez por proyecto, con reintentos.'):'no hay un banco de preguntas publicado todavía para este proyecto.')+' Configúralo en ⚙️ Requisito y % mínimo.</p>'],
    };
    if(!_showFixtures){
      const all=(data.shoppers||[]).flatMap(s=>historicalEvidenceFor(s)),approvedRows=all.filter(x=>String(x.sourceLegacyStatus||'').toLowerCase()==='approved'),linked=(data.shoppers||[]).filter(s=>historicalEvidenceFor(s).length);
      ckData.hist=['Evidencias históricas ('+all.length+')',all.length?'<table class="tbl"><thead><tr><th>Shopper</th><th>Proyecto</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>'+all.slice(0,100).map(x=>'<tr><td>'+String(x.shopperId||'—')+'</td><td>'+String(x.projectId||'—')+'</td><td>'+String(x.sourceLegacyStatus||x.status||'—')+'</td><td>'+String(x.sourceApprovedAt||x.presentedAt||'—')+'</td></tr>').join('')+'</tbody></table>':ui.empty('🏆','Sin evidencia histórica.')];
      ckData.linked=['Shoppers con evidencia ('+linked.length+')',linked.length?'<table class="tbl"><tbody>'+linked.slice(0,100).map(x=>'<tr><td><b>'+String(x.nombre||x.id)+'</b></td><td>'+historicalEvidenceFor(x).length+' registro(s)</td></tr>').join('')+'</tbody></table>':ui.empty('👥','Sin shoppers vinculados.')];
      ckData.approved=['Aprobaciones históricas ('+approvedRows.length+')',approvedRows.length?'<table class="tbl"><tbody>'+approvedRows.slice(0,100).map(x=>'<tr><td>'+String(x.shopperId||'—')+'</td><td>'+String(x.projectId||'—')+'</td><td>'+String(x.sourceApprovedAt||x.presentedAt||'—')+'</td></tr>').join('')+'</tbody></table>':ui.empty('🏆','Sin aprobaciones.')];
    }
    document.querySelectorAll('#certKpis [data-ck]').forEach(el=>el.addEventListener('click',()=>{const d=ckData[el.dataset.ck];if(d)ui.modal(d[0],d[1]);}));
    const ia=document.getElementById('certIA');
    if(ia)ia.addEventListener('click',()=>ui.modal('🤖 Crear certificación con IA · '+p.name,`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Carga el <b>instructivo / protocolo</b> del proyecto (o pega el texto). La generación se ejecuta en el backend con Vertex AI; el navegador no recibe credenciales.</p>
      <input type="file" class="inp" id="ciF" accept=".pdf,.doc,.docx,.txt,image/*" style="padding:7px;margin-bottom:8px">
      <textarea class="inp" id="ciT" rows="4" placeholder="…o pega el instructivo / qué debe dominar el evaluador" style="margin-bottom:10px"></textarea>
      <div class="grid g2" style="gap:10px 12px;margin-bottom:6px"><div><label class="lbl">Nº de preguntas</label><input class="inp" id="ciN" type="number" value="10"></div><div><label class="lbl">% mínimo para aprobar</label><input class="inp" id="ciG" type="number" value="80"></div></div>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-green btn-sm" id="ciGo">Generar banco con IA</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#ciGo').addEventListener('click',async()=>{
      const btn=ov.querySelector('#ciGo'),n=+ov.querySelector('#ciN').value||10,g=+ov.querySelector('#ciG').value||80,pasted=(ov.querySelector('#ciT').value||'').trim();
      btn.disabled=true;btn.textContent='Generando…';
      try{
        const fileTxt=await CX.ai.readAttachment(ov.querySelector('#ciF')),txt=(pasted+fileTxt).trim();
        if(!txt)throw new Error('Pega el instructivo o adjunta un archivo con texto');
        if(!CX.ai?.ready?.())await CX.backendAI?.load?.();
        if(!CX.ai?.ready?.())throw new Error('AI_PROVIDER_NOT_CONFIGURED');
        const generated=await CX.ai.ask(txt,{module:'certification',questionCount:n,gate:g});
        if(!(generated?.providerAck===true&&Array.isArray(generated.preguntas)&&generated.preguntas.length))throw new Error('AI_PROVIDER_ACK_REQUIRED');
        if(generated.preguntas.length!==n)throw new Error('Se generaron '+generated.preguntas.length+' de '+n+'; falta material suficiente para publicar el banco completo');
        const uid=CX.backendCertifications?.currentUid?.()||'',creador=CX.session?.user?.name||uid||'—';
        const bankDraft={preguntas:generated.preguntas,requestedQuestionCount:n,gate:g,fecha:new Date().toISOString().slice(0,10),generadoPor:creador,generadoPorUid:uid,estado:'pending_review',provider:generated.provider,model:generated.model,providerAck:true,contentRevision:generated.contentRevision,generatedAt:new Date().toISOString()};
        const saved=await CX.certStore.save(p.id,bankDraft,bankDraft.certificationId||selectedCertId()||'main');
        if(!(saved?.providerAck===true&&saved?.committed===true))throw new Error('CERT_BANK_DURABLE_ACK_REQUIRED');
        close();ui.toast('Banco generado por IA real y guardado · requiere revisión autorizada antes de publicarse.','ok',5200);CX.router?.nav?.('cert');
      }catch(error){
        ui.toast('No se pudo generar el banco: '+String(error?.message||error),'warn',5600);
      }finally{
        btn.disabled=false;btn.textContent='Generar banco con IA';
      }
    });},dismissOnBackdrop:false,dismissOnEscape:false}));
    if(bank?.estado==='pending_review'){
      const publish=document.createElement('button');publish.className='btn btn-green btn-sm';publish.id='certPublish';publish.textContent='✓ Revisar y publicar banco';ia.insertAdjacentElement('afterend',publish);
      publish.addEventListener('click',async()=>{
        const uid=CX.backendCertifications?.currentUid?.()||'';
        if(!uid){ui.toast('Sesión autenticada requerida.','warn');return;}
        const reviewPolicy=String(p.certificationReviewPolicy||p.certReviewPolicy||'authorized_admin').toLowerCase();
        const distinctReviewerRequired=['maker_checker','distinct_reviewer','two_person'].includes(reviewPolicy);
        if(distinctReviewerRequired&&String(bank.generadoPorUid||'')===uid){ui.toast('Este proyecto exige revisión por una persona distinta a quien generó el banco.','warn',4800);return;}
        if(!CX.permissions.gate('certification.publish',CX.permissions.ctx({entityType:'certification_bank',entityId:p.id}),ui))return;
        const reviewer=CX.session?.user?.name||uid;
        const next=Object.assign({},bank,{estado:'published',revisadoPor:reviewer,revisadoPorUid:uid,publishedAt:new Date().toISOString()});
        delete next.__resourceId;delete next.__resourceVersion;
        const saved=await CX.certStore.save(p.id,next,bank.certificationId||selectedCertId()||'main');
        if(!(saved?.providerAck===true&&saved?.committed===true)){ui.toast('No fue posible confirmar la publicación.','warn',4200);return;}
        ui.toast('Banco revisado y publicado con ACK remoto.','ok',4200);CX.router?.nav?.('cert');
      });
    }
    const imp=document.getElementById('certImp');
    if(imp)imp.addEventListener('click',()=>ui.modal('Importar banco de preguntas',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Importa JSON, CSV/TXT con separador | o pega el contenido. Se guarda como <b>pendiente de revisión</b>; nunca se publica automáticamente.</p>
      <div class="grid g2" style="gap:10px"><div><label class="lbl">Nombre de certificación</label><input class="inp" id="ciName" placeholder="Ej. Certificación principal"></div><div><label class="lbl">% mínimo</label><input class="inp" id="ciGate" type="number" min="1" max="100" value="80"></div></div>
      <input type="file" class="inp" id="ciImportFile" accept=".json,.csv,.txt,text/plain,application/json,text/csv" style="padding:7px;margin:10px 0">
      <textarea class="inp" id="ciImportText" rows="5" placeholder="pregunta | correcta | opción B | opción C"></textarea>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="ciImportSave">Importar y guardar</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#ciImportSave').addEventListener('click',async()=>{
        const btn=ov.querySelector('#ciImportSave'),file=ov.querySelector('#ciImportFile').files[0],name=(ov.querySelector('#ciName').value||'').trim()||'Certificación principal';
        btn.disabled=true;btn.textContent='Validando…';
        try{
          let raw=(ov.querySelector('#ciImportText').value||'').trim();if(file)raw+=(raw?'\n':'')+await file.text();if(!raw)throw new Error('BANK_CONTENT_REQUIRED');
          let preguntas=CX.certStore.parse(raw);
          if(!preguntas)preguntas=raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{const p=line.split('|').map(x=>x.trim()).filter(Boolean);return p.length>=3?{q:p[0],correcta:p[1],ops:[p[1],...p.slice(2)].filter((x,i,a)=>a.indexOf(x)===i),exp:''}:null;}).filter(Boolean);
          preguntas=(preguntas||[]).filter(q=>q?.q&&Array.isArray(q.ops)&&q.ops.length>=2&&q.correcta&&q.ops.includes(q.correcta));if(!preguntas.length)throw new Error('NO_VALID_QUESTIONS');
          const cid=CX.certStore.safeId(name),gate=Math.max(1,Math.min(100,+ov.querySelector('#ciGate').value||80)),revision='manual-'+Date.now().toString(36)+'-'+preguntas.length;
          const saved=await CX.certStore.save(p.id,{certificationId:cid,certificationName:name,preguntas,gate,required:true,estado:'pending_review',contentRevision:revision,generatedAt:new Date().toISOString(),provider:'manual_import'},cid);
          if(!(saved?.providerAck===true&&saved?.committed===true))throw new Error('CERT_BANK_DURABLE_ACK_REQUIRED');
          window.CX_CERT_SELECTED_ID=cid;close();ui.toast('Banco importado y guardado · pendiente de revisión.','ok',4200);CX.router.nav('cert');
        }catch(error){btn.disabled=false;btn.textContent='Importar y guardar';ui.toast('No se importó el banco: '+String(error?.message||error),'warn',4800);}
      });
    },dismissOnBackdrop:false,dismissOnEscape:false}));
    const recert=document.getElementById('certRecert');
    if(recert)recert.addEventListener('click',()=>{
      const shoppers=(data.shoppersFor?data.shoppersFor():data.shoppers).slice(0,40);
      ui.modal('🔄 Solicitar re-certificación · '+p.name,`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Pide a tus evaluadores volver a certificarse (cambió el instructivo, nueva ronda, o por vencimiento). Su certificación pasa a <b>pendiente</b> y se les notifica.</p>
        <label class="lbl">Alcance</label>
        <select class="sel" id="rcScope" style="margin-bottom:10px"><option value="all">Todos los certificados del proyecto</option><option value="one">Un shopper específico</option></select>
        <div id="rcOneWrap" style="display:none;margin-bottom:10px"><label class="lbl">Shopper</label><select class="sel" id="rcOne">${shoppers.map(s=>`<option value="${s.id}">${s.nombre} · ${s.code}</option>`).join('')}</select></div>
        <div class="grid g2" style="gap:10px 12px;margin-bottom:10px">
          <div><label class="lbl">Motivo</label><select class="sel" id="rcReason"><option>Actualización del instructivo</option><option>Nueva ronda / periodo</option><option>Vencimiento de certificación</option><option>Bajo desempeño</option></select></div>
          <div><label class="lbl">Plazo (días)</label><input class="inp" id="rcDays" type="number" value="7"></div>
        </div>
        <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:6px"><input type="checkbox" id="rcNotif" checked> Notificar en su panel (in-app)</label>
        <div style="font-size:10.5px;color:var(--t3);margin-bottom:14px">🔒 El envío real por WhatsApp/correo está pendiente de activación por tenant — este prototipo solo registra el evento en el log local de automatizaciones y en el panel in-app del shopper, nunca envía un mensaje real.</div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rcOk">Solicitar re-certificación</button></div>
      `,{onMount:(ov,close)=>{
        const sc=ov.querySelector('#rcScope'); sc.addEventListener('change',()=>{ov.querySelector('#rcOneWrap').style.display=sc.value==='one'?'':'none';});
        ov.querySelector('#rcOk').addEventListener('click',async()=>{
          const btn=ov.querySelector('#rcOk'),all=sc.value==='all',shopperId=all?'':ov.querySelector('#rcOne').value,who=all?'todos los certificados':(data.getShopper(shopperId)||{}).nombre||'el shopper';
          const reason=ov.querySelector('#rcReason').value,days=+ov.querySelector('#rcDays').value||7;btn.disabled=true;btn.textContent='Guardando…';
          try{
            if(!CX.backendCertifications?.requestRecertification)throw new Error('RECERT_PROVIDER_UNAVAILABLE');
            const result=await CX.backendCertifications.requestRecertification({scope:all?'all':'one',shopperId,reason,days,periodId:p.id});
            if(!(result?.providerAck===true&&result?.committed===true))throw new Error('RECERT_ACK_REQUIRED');
            if(ov.querySelector('#rcNotif').checked&&!all){
              const recertId=String(result?.entityId||result?.item?.id||'');
              if(!recertId||!CX.notif?.pushDurable)throw new Error('RECERT_NOTIFICATION_PROVIDER_UNAVAILABLE');
              const notice=await CX.notif.pushDurable({to:'shopper',shopperId,targetShopperIds:[shopperId],tipo:'recert',icon:'🔄',tono:'a',titulo:'Re-certificación requerida',txt:p.name+' · '+reason+' · plazo '+days+' días',nav:'cert',operational:true,entityType:'recertification',entityId:recertId,eventKey:'recertification_required',idempotencyKey:'recert.notice:'+recertId+':'+shopperId});
              if(!(notice?.providerAck===true&&notice?.committed===true))throw new Error('RECERT_NOTIFICATION_ACK_REQUIRED');
            }
            CX.automations?.fire?.('recert',{proyecto:p.name,motivo:reason,plazo:days});
            close();ui.toast('Re-certificación persistida para '+who+' · plazo '+days+' días.','ok',4400);
            window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('recertification_committed',true);
          }catch(error){
            ui.toast('No se pudo confirmar la re-certificación: '+String(error?.message||error),'warn',5200);btn.disabled=false;btn.textContent='Solicitar re-certificación';
          }
        });
      },dismissOnBackdrop:false,dismissOnEscape:false});
    });
    const gate=document.getElementById('certGate');
    if(gate)gate.addEventListener('click',()=>{
      if(!bank){ui.toast('Selecciona o crea una certificación primero.','warn');return;}
      ui.modal('Requisito de certificación · '+(bank.certificationName||bank.certificationId||'principal'),`
        <label class="lbl">% mínimo para aprobar</label><input class="inp" id="gtMin" type="number" min="1" max="100" value="${bank.gate||80}" style="margin-bottom:10px">
        <label class="flex" style="gap:8px;font-size:12.5px;color:var(--t1);margin-bottom:14px"><input type="checkbox" id="gtReq" ${bank.required===false?'':'checked'}> Obligatoria antes de ejecutar visitas cuando corresponda</label>
        <div class="between"><button class="btn btn-ghost btn-sm" id="gtWithdraw" style="color:var(--red)">Retirar banco</button><button class="btn btn-pr btn-sm" id="gtSave">Guardar con ACK</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#gtSave').addEventListener('click',async()=>{
          const btn=ov.querySelector('#gtSave'),next=Object.assign({},bank,{gate:Math.max(1,Math.min(100,+ov.querySelector('#gtMin').value||80)),required:ov.querySelector('#gtReq').checked,updatedAt:new Date().toISOString()});delete next.__resourceId;delete next.__resourceVersion;
          btn.disabled=true;try{const saved=await CX.certStore.save(p.id,next,bank.certificationId);if(!(saved?.providerAck===true&&saved?.committed===true))throw new Error('CERT_GATE_ACK_REQUIRED');close();ui.toast('Requisito guardado con ACK remoto.','ok');CX.router.nav('cert');}catch(error){btn.disabled=false;ui.toast('No se guardó el requisito.','warn');}
        });
        ov.querySelector('#gtWithdraw').addEventListener('click',async()=>{
          if(!confirm('¿Retirar este banco? Los intentos históricos se conservan.'))return;const btn=ov.querySelector('#gtWithdraw');btn.disabled=true;
          try{const removed=await CX.certStore.clear(p.id,bank.certificationId);if(!(removed?.providerAck===true&&removed?.committed===true))throw new Error('CERT_BANK_DELETE_ACK_REQUIRED');window.CX_CERT_SELECTED_ID='';close();ui.toast('Banco retirado con ACK remoto.','ok');CX.router.nav('cert');}catch(error){btn.disabled=false;ui.toast('No se retiró el banco.','warn');}
        });
      },dismissOnBackdrop:false,dismissOnEscape:false});
    });
  },0);
  return html;
});
