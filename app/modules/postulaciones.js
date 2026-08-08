/* CXOrbia · Postulaciones (admin) — full fidelity */
CX.module('postulaciones', ({data,ui})=>{
  const p=data.period(), posts=data._posts.filter(x=>data.inScope(x.pais));
  const projName=(id)=>{const pr=data.projects.find(x=>x.id===id);return pr?pr.name:'';};
  /* CORTE 2A — revisión de fuente canónica (misma que Dashboard/reportes/Visitas) */
  const sourceRevision=(CX.clienteData&&CX.clienteData.sourceRevision)?CX.clienteData.sourceRevision(p):(p&&p.sourceRevision)||'0';
  /* CORTE 2A — teléfono protegido: etiqueta segura si el dato está ausente o protegido,
     nunca 'undefined'/'null' ni un teléfono expuesto sin autorización. */
  const safePhone=(x)=>{const t=(x&&x.phone!=null)?String(x.phone).trim():'';return t?t:'Contacto protegido';};
  const safe=(val)=>{const t=(val==null)?'':String(val).trim();return (t&&t!=='undefined'&&t!=='null')?t:'—';};
  /* R19 P0-1: los KPIs superiores deben coincidir con el periodo activo por defecto (mismo
     criterio que el listado abajo) — nunca contar postulaciones de otros periodos salvo que se
     pida explícitamente "Ver históricas". */
  const activePosts=posts.filter(x=>x.projectId===data.currentPeriodId);
  const c=(s)=>activePosts.filter(x=>x.estado===s).length;
  const reprog=activePosts.filter(x=>x.reprog);
  const agendadas=data.visitas().filter(v=>v.agendada&&v.shopperId);

  /* agrupar por sucursal */
  const groups={};
  posts.forEach(x=>{(groups[x.sucursal]=groups[x.sucursal]||[]).push(x);});

  const estTag=(e)=>e==='pendiente'?ui.bdg('PENDIENTE','a'):e==='standby'?ui.bdg('STANDBY','n'):ui.bdg('APROBADA','g');

  const card=(x)=>{
    const hon=`${x.currency} ${x.honorario}`+(x.boleto?' + boleto':'')+(x.comboAmt?' + reembolso':'');
    return `<div data-pid="${x.id}" style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:13px 15px;margin-bottom:10px">
      <div class="between" style="margin-bottom:8px">
        <div class="flex" style="gap:8px">${estTag(x.estado)}<span style="font-size:11px;color:var(--t3)">${x.fechaProp}</span>${x.reprog?ui.bdg('Reprog.','a'):''}</div>
        <span style="font-size:11px;color:var(--t3)">${x.quincena}</span>
      </div>
      <div class="between" style="align-items:flex-start;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="font-size:14px;font-weight:700;color:var(--t1)">${x.shopper} <span class="muted" style="font-weight:500;font-size:12px">· ${x.shopperCode}</span></div>
          <div style="font-size:10px;font-weight:700;color:var(--brand);background:var(--brand-light);display:inline-block;padding:1px 7px;border-radius:6px;margin-top:3px">🗂️ ${projName(x.projectId)}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">📍 ${x.sucursal} · ${x.ciudad}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:4px">📅 ${safe(x.fechaProp)} · ⏱️ ${safe(x.franjaCode)} · 📞 ${safePhone(x)} · desde ${safe(x.disponibleDesde)}</div>
          <div style="font-size:12px;color:var(--green);font-weight:600;margin-top:4px">💲 ${hon}</div>
          ${x.estado==='aprobada'?`<div style="font-size:11px;color:var(--t3);margin-top:5px">✅ ${x.quincena} · WA fallback/manual preparado · pendiente confirmación · Aprobada por <b style="color:var(--t2)">${x.aprobadaPor}</b></div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:7px;align-items:flex-end">
          ${x.estado==='pendiente'
            ? `<button class="btn btn-green btn-sm" data-ap="${x.id}">✅ Aprobar</button>
               <div class="flex"><button class="btn btn-ghost btn-sm" data-sb="${x.id}">Standby</button><button class="btn bt-x btn-sm" data-rj="${x.id}" style="background:var(--red-bg);color:var(--red)">Rechazar</button></div>`
            : `<div style="background:var(--green-bg);border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:var(--green)">✅ Aprobada</div><div style="font-size:10px;color:var(--t3)">${x.quincena}</div></div>
               <div class="flex" style="flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-perfil="${x.shopperId}">👤 Perfil</button><button class="btn btn-ghost btn-sm" data-edit="${x.id}">✏️ Editar</button><button class="btn btn-ghost btn-sm" data-reasig="${x.id}">🔁 Reasig.</button><button class="btn btn-ghost btn-sm" data-cancel="${x.id}" style="color:var(--red)">✕ Cancelar</button></div>`}
        </div>
      </div>
    </div>`;
  };

  /* R19 P0-1 fix (verificador): el cap .slice(0,8) escondía SIEMPRE los grupos de sucursal más
     allá del octavo, sin importar periodo/filtro/"Ver históricas" — 9 postulaciones reales
     (incluidas 'pendiente') quedaban inalcanzables aunque el KPI "Todas" ya mostrara el conteo
     correcto del periodo activo. Se quita el cap: search() ya oculta grupos sin tarjetas
     visibles, así que renderizar TODOS los grupos es seguro y cada postulación del periodo
     activo queda accesible. */
  const groupHTML=Object.keys(groups).map(suc=>{
    const items=groups[suc];const pend=items.filter(x=>x.estado==='pendiente').length;
    return `<div class="card card-p" style="margin-bottom:12px">
      <div class="between" style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--brand-dark);text-transform:uppercase;letter-spacing:.5px">📍 ${suc}</div>
        <span class="muted" style="font-size:11px">${items.length} postulación(es) · ${pend} pendiente(s)</span></div>
      ${items.map(card).join('')}</div>`;
  }).join('');

  const html=`
  <div class="between" style="margin-bottom:6px">
    <div>${ui.ph('Gestión de Postulaciones', `${c('pendiente')} pendientes · ${c('aprobada')} aprobadas · ${reprog.length} reprogramación(es) · ${agendadas.length} agendamientos`)}</div>
    <div class="flex"><span class="bdg bdg-b">● Preview operativo</span><span class="bdg bdg-b">${p.name}</span></div>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <button class="btn btn-soft btn-sm" id="syncHR">🔄 Sincronizar HR</button>
    <button class="btn btn-green btn-sm" id="asignManual">＋ Asignar visita manual</button>
    <button class="btn btn-ghost btn-sm" id="poExport">⤓ Exportar</button>
    <div class="spacer"></div>
    <button class="btn btn-pr btn-sm" id="reqShopper">📤 Pedir al shopper…</button>
    <button class="btn btn-pr btn-sm" id="openAgenda">🗓️ Gestionar agendamientos</button>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <input class="inp" id="pSearch" placeholder="🔎 Buscar shopper, sucursal…" style="flex:1;min-width:200px">
    <select class="sel" id="pProj" style="width:auto"><option value="">🗂️ Todos los proyectos</option>${[...new Set(posts.map(x=>x.projectId))].map(id=>`<option value="${id}">${projName(id)}</option>`).join('')}</select>
    <select class="sel" id="pPais" style="width:auto"><option value="">Todos los países</option>${[...new Set(posts.map(x=>x.pais))].map(c=>`<option>${c}</option>`).join('')}</select>
    <select class="sel" id="pEst" style="width:auto"><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="aprobada">Aprobada</option><option value="standby">Standby</option></select>
    <label class="flex" style="font-size:12px;color:var(--t2);gap:6px"><input type="checkbox" id="pHist"> Ver históricas</label>
  </div>

  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px" id="poKpis">
    <div data-k="pend" style="cursor:pointer">${ui.kpi('Pendientes',c('pendiente'),'a')}</div>
    <div data-k="reprog" style="cursor:pointer">${ui.kpi('Reprogramaciones',reprog.length,'r')}</div>
    <div data-k="aprob" style="cursor:pointer">${ui.kpi('Aprobadas',c('aprobada'),'g')}</div>
    <div data-k="todas" style="cursor:pointer">${ui.kpi('Todas',activePosts.length,'b')}</div>
    <div data-k="agenda" style="cursor:pointer">${ui.kpi('Agendamientos',agendadas.length,'n')}</div>
  </div>

  ${reprog.length?`<div class="card card-p" style="border-left:3px solid var(--amber);margin-bottom:16px">
    <div class="card-t" style="margin-bottom:10px">🗓️ Solicitudes de reprogramación pendientes <span class="bdg bdg-a">${reprog.length}</span></div>
    ${reprog.slice(0,3).map(x=>`<div class="between wrap" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--border-2)">
      <div><b style="font-size:13px">${x.shopper}</b> · <span style="font-size:12px;color:var(--t2)">${x.sucursal}</span>
      <div style="font-size:11px;color:var(--t3)">Fecha vigente → propuesta · aplicación tarde 😬</div></div>
      <div class="flex" style="flex-wrap:wrap;gap:4px"><button class="btn btn-ghost btn-sm" data-revpost="${x.id}">👁 Revisar reprog.</button><button class="btn btn-green btn-sm" data-authfecha="${x.id}">✅ Nueva fecha</button><button class="btn btn-ghost btn-sm" data-keepfecha="${x.id}">Conservar anterior</button></div>
    </div>`).join('')}</div>`:''}

  <div id="pGroups">${groupHTML}</div>
  <div class="card card-p">${ui.aiBox('Sugiero el mejor shopper por historial y certificación, detecto reprogramaciones tardías y disparo WhatsApp y notificaciones automáticamente al aprobar. Cada decisión queda firmada y trazada.','Asistente de asignación')}</div>`;

  setTimeout(()=>{
    /* CORTE 2A — Exportar Postulaciones: solo periodo activo + alcance filtrado visible,
       conserva proyecto/país/estado/revisión de fuente, columnas autorizadas, sin datos
       protegidos no autorizados (teléfono se excluye del export). */
    const pox=document.getElementById('poExport');
    if(pox&&CX.reportKit){
      const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
      const visibleActive=()=>{
        const hist=(document.getElementById('pHist')||{}).checked;
        const q=((document.getElementById('pSearch')||{}).value||'').toLowerCase();
        const fpr=(document.getElementById('pProj')||{}).value||'';
        const fp=(document.getElementById('pPais')||{}).value||'';
        const fe=(document.getElementById('pEst')||{}).value||'';
        return posts.filter(x=>(hist||x.projectId===data.currentPeriodId)&&(!q||(x.shopper+x.shopperCode+x.sucursal).toLowerCase().includes(q))&&(!fpr||x.projectId===fpr)&&(!fp||x.pais===fp)&&(!fe||x.estado===fe));
      };
      const poSpec=(ext)=>{
        const rows=visibleActive();
        const byEst={}; rows.forEach(x=>{byEst[x.estado]=(byEst[x.estado]||0)+1;});
        const projectLabel=data.programBase?data.programBase(p):p.name;
        const periodLabel=(p.periodo||p.ronda||p.name||'Periodo');
        return { title:'Postulaciones',
          meta:{title:'Postulaciones',project:projectLabel,period:periodLabel,scope:'Periodo activo · alcance filtrado',sourceLabel:'Operación viva · postulaciones del periodo',sourceRevision,generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
          columns:[{key:'shopper',label:'Shopper'},{key:'sucursal',label:'Sucursal'},{key:'ciudad',label:'Ciudad'},{key:'pais',label:'País'},{key:'proyecto',label:'Proyecto'},{key:'estado',label:'Estado'},{key:'fecha',label:'Fecha propuesta'},{key:'franja',label:'Franja'},{key:'honorario',label:'Honorario'}],
          rows:rows.map(x=>({shopper:safe(x.shopper),sucursal:safe(x.sucursal),ciudad:safe(x.ciudad),pais:safe(x.pais),proyecto:projName(x.projectId),estado:safe(x.estado),fecha:safe(x.fechaProp),franja:safe(x.franjaCode),honorario:(x.honorario!=null?x.honorario:'Pendiente de fuente')})),
          notes:'',
          summary:['Postulaciones: '+rows.length,'Revisión de fuente: '+sourceRevision, Object.entries(byEst).map(([k2,v2])=>k2+': '+v2).join(' · ')],
          chart:{title:'Postulaciones por estado',data:Object.entries(byEst).map(([k2,v2])=>({label:k2,value:v2}))},
          filename:[san('postulaciones'),san(projectLabel),san(periodLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
      };
      pox.addEventListener('click',()=>{ const n=visibleActive().length;
        CX.ui.modal('⤓ Exportar postulaciones',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">${n} postulación(es) del periodo activo y alcance filtrado. Se exporta con el diseño del tenant; el teléfono protegido no se incluye.</p><div class="flex" style="gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="poPdf">⤓ PDF</button><button class="btn btn-soft btn-sm" id="poXls">⤓ Excel</button><button class="btn btn-pr btn-sm" id="poPpt">⤓ PPT</button></div>`,{onMount:(ov)=>{ov.querySelector('#poPdf').addEventListener('click',()=>CX.reportKit.exportPDF(poSpec('pdf')));ov.querySelector('#poXls').addEventListener('click',()=>{if(CX.reportKit.exportExcel(poSpec('xlsx')))CX.ui.toast('Excel .xlsx generado','ok');});ov.querySelector('#poPpt').addEventListener('click',()=>{if(CX.reportKit.exportPPT(poSpec('pptx')))CX.ui.toast('PowerPoint generado','ok');});}});
      });
    }
    const poList=(title,arr)=>ui.modal(title+' ('+arr.length+')', arr.length?`<table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Estado</th><th>Honorario</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td><b style="font-size:12.5px">${x.shopper}</b><div style="font-size:10px;color:var(--t3)">${x.shopperCode}</div></td><td style="font-size:12px">${x.sucursal}<div style="font-size:10px;color:var(--t3)">${CX.paisFlag(x.pais)} ${x.ciudad}</div></td><td>${estTag(x.estado)}</td><td style="font-size:12px;color:var(--green)">${x.honorario!=null?x.currency+' '+x.honorario:'<span class="muted">Pendiente de fuente</span>'}</td><td style="text-align:right">${x.id?`<button class="btn btn-ghost btn-sm poRowGest" data-pid="${x.id}" style="padding:2px 9px;font-size:11px">Gestionar →</button>`:''}</td></tr>`).join('')}</tbody></table>`:ui.empty('📭','Sin elementos en esta categoría.'),
      {onMount:(ov,close)=>ov.querySelectorAll('.poRowGest').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.pid);if(x){close();postDetalle(x);}}))});
    const poKp={
      pend:['Postulaciones pendientes',activePosts.filter(x=>x.estado==='pendiente')],
      reprog:['Reprogramaciones',reprog],
      aprob:['Postulaciones aprobadas',activePosts.filter(x=>x.estado==='aprobada')],
      todas:['Todas las postulaciones',activePosts],
      agenda:['Agendamientos autorizados',agendadas.map(v=>({shopper:v.shopper,shopperCode:v.shopperCode||'',sucursal:v.sucursal,ciudad:v.ciudad,pais:v.pais,estado:v.estado,currency:v.currency,honorario:v.honorario}))],
    };
    document.querySelectorAll('#poKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=poKp[el.dataset.k];poList(d[0],d[1]);}));
    const gestor=()=>(CX.session.user&&CX.session.user.name)||'Equipo';
    const act=(id,label,tone,extra)=>{const el=document.querySelector(`[data-pid="${id}"]`);if(!el)return;
      const x=posts.find(z=>z.id===id); if(x){x.estado=(tone==='green'?'aprobada':tone==='amber'?'standby':'rechazada');x.gestionadoPor=gestor();
        CX.automations&&CX.automations.logAction(label.replace(/[^\wáéíóúñ ]/gi,'').trim(),x.visitaId||x.id,(x.shopper||'')+' · '+(x.sucursal||''));}
      el.querySelector('div[style*="flex-direction:column"]').innerHTML=`<div style="background:var(--${tone}-bg);border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:var(--${tone})">${label}</div><div style="font-size:10px;color:var(--t3)">por ${gestor()}</div></div>`;
      // marca trazabilidad en el cuerpo y "saca de pendientes" visualmente
      el.style.opacity=tone==='green'?'1':'.7';
      ui.toast(extra+' · gestionado por '+gestor(),'ok');};

    /* perfil real del shopper (no el listado) — tarjetas clickeables + historial + requisitos */
    const profileModal=(sid)=>{ const s=data.getShopper?data.getShopper(sid):data.shoppers.find(x=>x.id===sid); if(!s){ui.toast('Shopper no encontrado','warn');return;}
      const st=data.shopperStats?data.shopperStats(s.id):{total:0,realizadas:0,liquidadas:0,enCurso:0,cumpl:0};
      const hist=data.visitsForShopper?data.visitsForShopper(s.id):[];
      const reqs=[['Perfil completo',s.perfilCompleto!==false],['Datos bancarios',!!(s.banco||s.ctaNum)],['WhatsApp',!!(s.whatsapp||s.phone)],['Certificado',(st.realizadas||0)>0||s.certificado]];
      ui.modal(s.nombre+' · '+s.code,`
        <div class="flex" style="gap:12px;margin-bottom:12px"><div class="rail-av" style="width:42px;height:42px;font-size:15px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
        <div><div class="card-t" style="font-size:15px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)} · ${s.whatsapp||s.phone||'sin WhatsApp'}</div>
        <div style="margin-top:4px"><span style="font-size:13px;font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</span> ${s.perfilCompleto===false?ui.bdg('perfil incompleto','a'):''}</div></div></div>
        <div class="grid g4" style="margin-bottom:12px"><div data-ph="all" style="cursor:pointer">${ui.kpi('Visitas',st.total,'b')}</div><div data-ph="real" style="cursor:pointer">${ui.kpi('Realizadas',st.realizadas,'g')}</div><div data-ph="liq" style="cursor:pointer">${ui.kpi('Liquidadas',st.liquidadas,'p')}</div>${ui.kpi('Cumpl.',(st.cumpl||0)+'%','a')}</div>
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">✔ Verificación de requisitos</div>
        <div class="flex wrap" style="gap:6px;margin-bottom:12px">${reqs.map(r=>`<span class="bdg ${r[1]?'bdg-g':'bdg-a'}">${r[1]?'✓':'⚠'} ${r[0]}</span>`).join('')}</div>
        <div style="font-size:11px;color:var(--t3);margin-bottom:6px">↑ toca un indicador para ver el historial de visitas</div>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-soft btn-sm" id="pmWa">📲 WhatsApp</button><button class="btn btn-pr btn-sm" id="pmGo">Ver perfil completo →</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pmGo').addEventListener('click',()=>{close();CX.session._focusShopper=s.id;CX.router.nav('shoppers');});
        ov.querySelector('#pmWa').addEventListener('click',()=>{close();ui.toast('WhatsApp a '+s.nombre+' preparado (vista previa) · envío pendiente de activación','ok');});
        const histModal=(filter,title)=>{ const arr=hist.filter(filter);
          ui.modal(title+' · '+s.nombre, arr.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${arr.map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td><td style="font-size:12px">${v.escenario||''}</td><td style="font-size:12px">${v.realizada||v.agendada||'—'}</td><td>${ui.estadoBadge(v.estado)}</td></tr>`).join('')}</tbody></table>`:ui.empty('🗒️','Sin visitas en esta categoría.')); };
        ov.querySelectorAll('[data-ph]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.ph; if(k==='all')histModal(()=>true,'Historial completo'); else if(k==='real')histModal(v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Realizadas'); else histModal(v=>v.estado==='liquidada','Liquidadas');}));
      }});
    };
    document.querySelectorAll('[data-ap]').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.ap);if(!CX.permissions.gate('postulacion.approve',{projectId:x&&x.projectId,pais:x&&x.pais},ui))return;if(x&&CX.automations)CX.automations.fire('aprobacion',{shopper:x.shopper,sucursal:x.sucursal});act(b.dataset.ap,'✅ Aprobada','green','Aprobada · WhatsApp preparado (preview) · envío real pendiente backend/Make');}));
    /* FIX: el botón Perfil ahora abre el perfil real del shopper */
    document.querySelectorAll('[data-perfil]').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();profileModal(b.dataset.perfil);}));
    /* detalle de la postulación/visita al hacer clic en la tarjeta */
    const postDetalle=(x)=>{ const v=data._visitas?data._visitas.find(z=>z.id===x.visitaId):null;
      ui.modal('📋 '+x.sucursal+' · '+x.shopper,`
        <div style="font-size:12.5px;line-height:1.95;color:var(--t2)">
          <div><b>Shopper:</b> ${x.shopper} (${x.shopperCode}) · 📞 ${x.phone||'—'}</div>
          <div><b>Proyecto:</b> ${projName(x.projectId)} · <b>Quincena:</b> ${x.quincena}</div>
          <div><b>Sucursal:</b> ${x.sucursal} · ${CX.paisFlag(x.pais)} ${x.ciudad}</div>
          <div><b>Escenario:</b> ${(v&&v.escenario)||x.escenario||'—'}</div>
          <div><b>Fecha propuesta:</b> ${x.fechaProp||'—'} · <b>Franja:</b> ${x.franjaCode||'—'}</div>
          <div><b>Honorario:</b> ${x.currency} ${x.honorario}${x.boleto?' + boleto':''}${x.comboAmt?' + reembolso':''}</div>
          <div><b>Estado:</b> ${x.estado}${x.gestionadoPor?' · gestionado por '+x.gestionadoPor:''}</div>
        </div>
        <div class="flex wrap" style="gap:8px;margin-top:14px;justify-content:flex-end">
          ${x.estado==='pendiente'?`<button class="btn btn-green btn-sm" id="pdAp">✅ Aprobar</button><button class="btn btn-ghost btn-sm" id="pdRj" style="color:var(--red)">Rechazar</button>`:''}
          <button class="btn btn-soft btn-sm" id="pdPerfil">👤 Perfil del shopper</button>
          <button class="btn btn-soft btn-sm" id="pdWa" title="Abre WhatsApp Web con un borrador manual — no es envío automático">📲 WhatsApp (borrador manual)</button>
        </div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pdPerfil')&&ov.querySelector('#pdPerfil').addEventListener('click',()=>{close();profileModal(x.shopperId);});
        ov.querySelector('#pdWa')&&ov.querySelector('#pdWa').addEventListener('click',()=>{const msg=encodeURIComponent('Hola '+(x.shopper||'')+', sobre tu visita en '+x.sucursal);window.open('https://wa.me/'+(x.phone||'').replace(/[^0-9]/g,'')+'?text='+msg,'_blank');});
        ov.querySelector('#pdAp')&&ov.querySelector('#pdAp').addEventListener('click',()=>{if(!CX.permissions.gate('postulacion.approve',{projectId:x.projectId,pais:x.pais},ui))return;if(CX.automations)CX.automations.fire('aprobacion',{shopper:x.shopper,sucursal:x.sucursal});act(x.id,'✅ Aprobada','green','Aprobada · WhatsApp preparado (preview) · envío real pendiente backend/Make');close();});
        ov.querySelector('#pdRj')&&ov.querySelector('#pdRj').addEventListener('click',()=>{if(!CX.permissions.gate('postulacion.reject',{projectId:x.projectId,pais:x.pais},ui))return;act(x.id,'✕ Rechazada','red','Rechazada · notificación preparada · pendiente confirmación');close();});
      }});
    };
    document.querySelectorAll('#pGroups [data-pid]').forEach(el=>el.addEventListener('click',(e)=>{
      if(e.target.closest('button'))return; /* no interferir con los botones de acción */
      const x=posts.find(z=>z.id===el.dataset.pid); if(x)postDetalle(x);
    }));
    document.querySelectorAll('[data-sb]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.sb,'⏸ Standby','amber','Postulación en standby')));
    document.querySelectorAll('[data-rj]').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.rj);if(!CX.permissions.gate('postulacion.reject',{projectId:x&&x.projectId,pais:x&&x.pais},ui))return;act(b.dataset.rj,'✕ Rechazada','red','Postulación rechazada · notificación preparada · pendiente confirmación');}));
    const search=()=>{const q=(document.getElementById('pSearch').value||'').toLowerCase(),fpr=document.getElementById('pProj').value,fp=document.getElementById('pPais').value,fe=document.getElementById('pEst').value,hist=document.getElementById('pHist').checked;
      document.querySelectorAll('#pGroups [data-pid]').forEach(el=>{const x=posts.find(z=>z.id===el.dataset.pid);
        const ok=(hist||x.projectId===data.currentPeriodId)&&(!q||(x.shopper+x.shopperCode+x.sucursal).toLowerCase().includes(q))&&(!fpr||x.projectId===fpr)&&(!fp||x.pais===fp)&&(!fe||x.estado===fe);el.style.display=ok?'':'none';});
      // ocultar grupos sin tarjetas visibles
      document.querySelectorAll('#pGroups .card').forEach(g=>{const any=[...g.querySelectorAll('[data-pid]')].some(el=>el.style.display!=='none');g.style.display=any?'':'none';});};
    ['pSearch','pProj','pPais','pEst','pHist'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',search);});
    /* R19 P0-1 (20260715): "Postulaciones solo debe mostrar el periodo activo" — el checkbox
       "Ver históricas" ya existía en el markup pero nunca estaba conectado a ningún filtro (todas
       las postulaciones de TODOS los periodos se listaban siempre). Ahora search() oculta,
       DESDE EL PRIMER RENDER, cualquier postulación de un periodo distinto al activo salvo que el
       usuario marque "Ver históricas" explícitamente. */
    search();
    /* botones de reprogramación (revisar / autorizar nueva fecha / conservar anterior) */
    document.querySelectorAll('[data-revpost]').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.revpost);ui.modal('Revisar solicitud de reprogramación · '+(x&&x.shopper||''),`<p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Fecha actual: <b>${x&&x.fechaActual||'—'}</b> · Fecha propuesta: <b>${x&&x.fechaProp||'—'}</b></p><div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:12px;color:#8a5b00">Usa "Autorizar nueva fecha" para aprobar la reprogramación o "Conservar anterior" para mantener la fecha actual.</div>`);}));
    document.querySelectorAll('[data-authfecha]').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.authfecha);if(x){const v=data._visitas.find(z=>z.id===x.visitaId);if(v&&x.fechaProp){v.agendada=x.fechaProp;x.reprog=false;}CX.notif&&CX.notif.push({to:'shopper',tipo:'reprog_aprobada',icon:'✅',tono:'g',titulo:'Reprogramación aprobada',txt:'Tu visita en '+(x.sucursal||'')+' fue reprogramada a '+(x.fechaProp||'nueva fecha'),nav:'misvisitas'});CX.automations&&CX.automations.fire('aprobacion',{shopper:x.shopper,sucursal:x.sucursal,fecha:x.fechaProp});CX.bus&&CX.bus.emit('visit-flow');}ui.toast('Nueva fecha autorizada · notificación preparada · HR sync pendiente backend','ok',3600);}));
    document.querySelectorAll('[data-keepfecha]').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.keepfecha);if(x){x.reprog=false;x.fechaProp=null;}CX.notif&&CX.notif.push({to:'shopper',tipo:'reprog_rechazada',icon:'⚠️',tono:'a',titulo:'Reprogramación no autorizada',txt:'La visita en '+(x&&x.sucursal||'')+' conserva la fecha original',nav:'misvisitas'});CX.bus&&CX.bus.emit('visit-flow');ui.toast('Fecha original conservada · notificación preparada · pendiente confirmación','ok');}));

    /* editar fecha/franja de la visita de una postulación */
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.edit); if(!x)return;
      ui.modal('Editar asignación · '+x.shopper,`
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">📍 ${x.sucursal} · ${x.ciudad}</div>
        <label class="lbl">Fecha</label><input class="inp" id="edF" type="date" value="${x.fechaProp||''}" style="margin-bottom:10px">
        <label class="lbl">Franja</label><select class="sel" id="edFr" style="margin-bottom:14px">${['AM 8–12h','PM 14–18h','WK fin de semana'].map(o=>`<option ${o.startsWith(x.franjaCode||'')?'selected':''}>${o}</option>`).join('')}</select>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="edOk">Guardar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#edOk').addEventListener('click',()=>{ const f=ov.querySelector('#edF').value; x.fechaProp=f; const v=data._visitas.find(z=>z.id===x.visitaId); if(v){v.agendada=f;} CX.bus&&CX.bus.emit('visit-flow'); close(); ui.toast('Asignación actualizada en memoria · pendiente de sincronización autorizada · por '+gestor(),'ok',3600); });}});
    }));

    /* reasignar a otro shopper */
    document.querySelectorAll('[data-reasig]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.reasig); if(!x)return;
      const cands=data.shoppersFor().filter(s=>s.id!==x.shopperId);
      const curFecha=safe(x.fechaProp), curFranja=safe(x.franjaCode);
      ui.modal('Reasignar visita · '+x.sucursal,`
        <div style="background:var(--panel-2);border:1px solid var(--border);border-radius:9px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--t2)">
          <div>Shopper actual: <b>${safe(x.shopper)}</b></div>
          <div>Fecha vigente: <b>${curFecha}</b> · Franja vigente: <b>${curFranja}</b></div>
        </div>
        <p style="font-size:12px;color:var(--t2);margin-bottom:8px">Busca y elige el nuevo evaluador.</p>
        <input class="inp" id="rsFind" placeholder="🔍 Buscar por nombre, código o ciudad…" style="margin-bottom:6px">
        <div class="flex" style="gap:6px;margin-bottom:8px"><select class="sel" id="rsPais" style="flex:1"><option value="">País: todos</option>${[...new Set(cands.map(s=>s.pais))].map(p=>`<option value="${p}">${CX.paisName(p)}</option>`).join('')}</select><select class="sel" id="rsCert" style="flex:1"><option value="">Certificación: todas</option><option value="1">Solo certificados</option></select></div>
        <div id="rsList" style="max-height:180px;overflow:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:12px"></div>
        <label class="lbl">Decisión de fecha / franja <b style="color:var(--accent)">*</b></label>
        <div id="rsDate" style="margin-bottom:6px">
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="keep" checked> <span>Conservar fecha <span style="color:var(--t3)">(mantiene ${curFecha} · ${curFranja})</span></span></label>
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="change"> <span>Cambiar fecha</span></label>
          <div id="rsChangeBox" style="display:none;padding:4px 0 4px 24px"><div class="flex" style="gap:8px"><input class="inp" id="rsNewF" type="date" value="${x.fechaProp||''}" style="flex:1"><select class="sel" id="rsNewFr" style="flex:1">${['AM 8–12h','PM 14–18h','WK fin de semana'].map(o=>`<option ${o.startsWith(x.franjaCode||'')?'selected':''}>${o}</option>`).join('')}</select></div></div>
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="pending"> <span>Pendiente de agendamiento <span style="color:var(--t3)">(sin fecha hasta coordinar)</span></span></label>
        </div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rsOk" disabled>Reasignar</button></div>
      `,{onMount:(ov,close)=>{
        let sel=null;
        const modeOf=()=>ov.querySelector('input[name=rsDateMode]:checked').value;
        const box=ov.querySelector('#rsChangeBox');
        ov.querySelectorAll('input[name=rsDateMode]').forEach(r=>r.addEventListener('change',()=>{box.style.display=modeOf()==='change'?'':'none';}));
        const draw=()=>{ const q=(ov.querySelector('#rsFind').value||'').toLowerCase(); const fp=ov.querySelector('#rsPais').value; const fc=ov.querySelector('#rsCert').value;
          const list=cands.filter(s=>(!q||(s.nombre+' '+s.code+' '+(s.ciudad||'')).toLowerCase().includes(q))&&(!fp||s.pais===fp)&&(!fc||s.certificado));
          ov.querySelector('#rsList').innerHTML=list.length?list.slice(0,50).map(s=>`<div class="rsRow" data-id="${s.id}" style="padding:8px 11px;border-bottom:1px solid var(--border-2);cursor:pointer;${sel===s.id?'background:var(--brand-light)':''}"><b style="font-size:12.5px">${s.nombre}</b> <span style="font-size:11px;color:var(--t3)">· ${s.code} · ${s.ciudad||CX.paisName(s.pais)} · ⭐${(s.rating||0).toFixed?s.rating.toFixed(1):s.rating||'—'}</span></div>`).join(''):'<div style="padding:14px;font-size:12px;color:var(--t3)">Sin coincidencias.</div>';
          ov.querySelectorAll('.rsRow').forEach(r=>r.addEventListener('click',()=>{sel=r.dataset.id;ov.querySelector('#rsOk').disabled=false;draw();}));
        };
        ov.querySelector('#rsFind').addEventListener('input',draw); ov.querySelector('#rsPais').addEventListener('change',draw); ov.querySelector('#rsCert').addEventListener('change',draw); draw();
        ov.querySelector('#rsOk').addEventListener('click',()=>{ if(!sel)return; if(!CX.permissions.gate('visit.reassign',{projectId:x.projectId,pais:x.pais},ui))return;
          const mode=modeOf();
          /* Nunca borrar/inventar fecha en silencio: la decisión es explícita. */
          let fechaMsg='';
          const v=data._visitas?data._visitas.find(z=>z.id===x.visitaId):null;
          if(mode==='keep'){ fechaMsg='fecha conservada ('+curFecha+')'; }
          else if(mode==='change'){ const nf=ov.querySelector('#rsNewF').value; if(!nf){ui.toast('Elige la nueva fecha','warn');return;} const nfr=ov.querySelector('#rsNewFr').value; x.fechaProp=nf; x.franjaCode=nfr; if(v)v.agendada=nf; fechaMsg='fecha cambiada a '+nf; }
          else { x.fechaProp=null; if(v){v.agendada=null;} x.pendienteAgendamiento=true; fechaMsg='pendiente de agendamiento'; }
          data.assignVisit&&data.assignVisit(x.visitaId,sel); const ns=data.getShopper&&data.getShopper(sel); x.shopper=ns?ns.nombre:x.shopper; x.shopperId=sel; x.gestionadoPor=gestor();
          CX.automations&&CX.automations.logAction&&CX.automations.logAction('Reasignada',x.visitaId||x.id,(x.shopper||'')+' · '+(x.sucursal||'')+' · '+fechaMsg); CX.bus&&CX.bus.emit('visit-flow'); close();
          CX.notif&&CX.notif.push({to:'admin',tipo:'reasig',icon:'🔁',tono:'a',titulo:'Visita reasignada',txt:x.sucursal+' → '+(x.shopper||'')+' · '+fechaMsg,nav:'postulaciones'});
          ui.toast('Cambio preparado · reasignada a '+x.shopper+' · '+fechaMsg+' · pendiente de sincronización autorizada','ok',4200); }); }});
    }));

    /* cancelar: la visita vuelve a disponible */
    document.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.cancel); if(!x)return;
      ui.modal('Cancelar visita · '+x.sucursal,`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">La visita de <b>${x.shopper}</b> volverá a <b>disponible</b> y el shopper será notificado.</p>
        <label class="lbl">Motivo</label><textarea class="inp" id="cnM" rows="2" placeholder="Motivo de la cancelación…" style="margin-bottom:14px"></textarea>
        <div style="text-align:right"><button class="btn btn-sm" style="background:var(--red-bg);color:var(--red)" id="cnOk">Confirmar cancelación</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#cnOk').addEventListener('click',()=>{ if(!CX.permissions.gate('visit.cancel',{projectId:x.projectId,pais:x.pais},ui))return; const v=data._visitas.find(z=>z.id===x.visitaId); if(v){v.estado='disponible';v.shopperId=null;v.shopper=null;v.agendada=null;} x.estado='cancelada';x.gestionadoPor=gestor(); CX.notif&&CX.notif.push({to:'shopper',tipo:'cancel',icon:'❌',tono:'r',titulo:'Visita cancelada',txt:x.sucursal+' · puedes postularte a otras',nav:'misvisitas'}); CX.bus&&CX.bus.emit('visit-flow'); close(); act(x.id,'✕ Cancelada','red','Visita cancelada · vuelve a disponible'); });}});
    }));

    /* asignar visita manual — con búsqueda y opción de crear shopper en el momento */
    const am=document.getElementById('asignManual');
    const shr=document.getElementById('syncHR');
    if(shr)shr.addEventListener('click',()=>ui.toast('Lectura de HR preparada · la sincronización real (lectura/escritura) queda pendiente de activación','',4200));
    if(am)am.addEventListener('click',()=>{
      const projName=(id)=>{const pr=data.projects.find(x=>x.id===id);return pr?pr.name:'';};
      const disp=data._visitas.filter(v=>v.estado==='disponible'||!v.shopperId);
      const cands=data.shoppersFor();
      ui.modal('Asignar visita manual',`
        <p style="font-size:12px;color:var(--t2);margin-bottom:12px">Busca la visita y el shopper (no tienes que recorrer toda la lista). Si el shopper no existe, créalo aquí mismo.</p>
        <label class="lbl">Visita disponible</label>
        <input class="inp" id="amVQ" placeholder="🔎 Buscar sucursal, ciudad, proyecto…" style="margin-bottom:6px">
        <select class="sel" id="amV" size="5" style="margin-bottom:12px;height:auto">${disp.length?disp.map(v=>`<option value="${v.id}" data-t="${(v.sucursal+' '+v.ciudad+' '+projName(v.projectId)+' '+v.quincena).toLowerCase()}">${v.sucursal} · ${v.ciudad} · ${projName(v.projectId)} · ${v.quincena}</option>`).join(''):'<option value="">— no hay disponibles —</option>'}</select>

        <div class="between" style="margin-bottom:6px"><label class="lbl" style="margin:0">Shopper</label><label class="flex" style="gap:6px;font-size:11.5px;color:var(--t2);cursor:pointer"><input type="checkbox" id="amNew"> ✚ Crear nuevo</label></div>
        <div id="amExist">
          <input class="inp" id="amSQ" placeholder="🔎 Buscar shopper o código…" style="margin-bottom:6px">
          <select class="sel" id="amS" size="5" style="height:auto">${cands.map(s=>`<option value="${s.id}" data-t="${(s.nombre+' '+s.code+' '+(s.ciudad||'')).toLowerCase()}">${s.nombre} · ${s.code} · ${s.ciudad||CX.paisName(s.pais)}</option>`).join('')}</select>
        </div>
        <div id="amCreate" style="display:none">
          <div class="grid g2" style="gap:8px 10px"><div><label class="lbl">Nombre</label><input class="inp" id="amF"></div><div><label class="lbl">Apellido</label><input class="inp" id="amL"></div></div>
          <label class="lbl" style="margin-top:8px">WhatsApp</label><input class="inp" id="amW" placeholder="+502 ...">
          <div style="background:var(--amber-bg);border-radius:9px;padding:8px 11px;font-size:11px;color:#8a5b00;margin-top:8px">Se crea con perfil <b>incompleto</b>; al ingresar se le pedirá (en notificaciones y Mi Día) completar sus datos.</div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="amOk" ${disp.length?'':'disabled'}>Asignar</button></div>
      `,{onMount:(ov,close)=>{
        const filt=(q,sel)=>{const v=(q.value||'').toLowerCase();ov.querySelectorAll('#'+sel+' option').forEach(o=>{o.style.display=(!v||(o.dataset.t||'').includes(v))?'':'none';});};
        ov.querySelector('#amVQ').addEventListener('input',e=>filt(e.target,'amV'));
        ov.querySelector('#amSQ').addEventListener('input',e=>filt(e.target,'amS'));
        const nw=ov.querySelector('#amNew');
        nw.addEventListener('change',()=>{ov.querySelector('#amExist').style.display=nw.checked?'none':'';ov.querySelector('#amCreate').style.display=nw.checked?'':'none';});
        ov.querySelector('#amOk').addEventListener('click',()=>{
          const vid=ov.querySelector('#amV').value; if(!vid){ui.toast('Elige una visita','warn');return;}
          let sid, s;
          if(nw.checked){ const f=(ov.querySelector('#amF').value||'').trim(), l=(ov.querySelector('#amL').value||'').trim(), w=(ov.querySelector('#amW').value||'').trim();
            if(!f){ui.toast('Escribe al menos el nombre','warn');return;}
            s=data.addShopper&&data.addShopper({via:'asignacion_manual',firstName:f,lastName:l,whatsapp:w,perfilCompleto:false});
            sid=s&&s.id;
            if(s){ CX.notif&&CX.notif.push({to:'shopper',tipo:'completar',icon:'📝',tono:'a',titulo:'Completa tu perfil',txt:'Te asignaron una visita · actualiza tus datos para continuar',nav:'miperfil'}); }
          } else { sid=ov.querySelector('#amS').value; s=data.getShopper(sid); }
          const v=data.assignVisit&&data.assignVisit(vid,sid);
          CX.hr&&CX.hr.writeBack&&CX.hr.writeBack(p,v);
          CX.notif&&CX.notif.push({to:'admin',tipo:'asignacion',icon:'📌',tono:'g',titulo:'Visita asignada manual',txt:(v?v.sucursal:'')+' → '+(s?s.nombre:''),nav:'postulaciones'});
          close(); ui.toast('Visita asignada a '+(s?s.nombre:'')+(nw.checked?' (nuevo · perfil incompleto)':'')+' · se reflejará en HR cuando la sincronización esté activa · por '+gestor(),'ok',4400);
        });
      }});
    });
    const reqBtn=document.getElementById('reqShopper');
    if(reqBtn)reqBtn.addEventListener('click',()=>{
      ui.modal('📤 Pedir acción al shopper',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">El equipo puede <b>solicitar</b> al shopper (no solo gestionar lo que él pide). La solicitud le llega en Mi Día, Tablón y por WhatsApp.</p>
        <label class="lbl">Shopper</label>
        <select class="sel" id="rqSh" style="margin-bottom:12px">${posts.slice(0,10).map(x=>`<option>${x.shopper} · ${x.sucursal}</option>`).join('')}</select>
        <label class="lbl">Solicitud</label>
        <select class="sel" id="rqTipo" style="margin-bottom:12px">
          <option value="confirmar">Confirmar fecha propuesta</option>
          <option value="cambio">Pedir cambio de fecha</option>
          <option value="reprog">Solicitar reprogramación</option>
          <option value="agendar">Recordar que agende</option>
        </select>
        <label class="lbl">Nota (opcional)</label>
        <textarea class="inp" id="rqNota" rows="2" placeholder="Detalle para el shopper…" style="margin-bottom:14px"></textarea>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-ghost btn-sm" data-x4>Cancelar</button><button class="btn btn-pr btn-sm" id="rqSend">📲 Enviar solicitud</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('[data-x4]').addEventListener('click',close);
        ov.querySelector('#rqSend').addEventListener('click',()=>{
          const tipo=ov.querySelector('#rqTipo').value, sh=ov.querySelector('#rqSh').value.split(' · ')[0];
          const map={confirmar:['📅','El equipo pide confirmar fecha','confirmar_fecha'],cambio:['📅','El equipo pide cambio de fecha','confirmar_fecha'],reprog:['🔄','El equipo solicita reprogramación',''],agendar:['📅','Recordatorio: agenda tu visita','']};
          const m=map[tipo];
          CX.notif.push({to:'shopper',tipo,icon:m[0],tono:'a',titulo:m[1],txt:sh+' · responde desde Mis Visitas',nav:'misvisitas',accion:m[2]||undefined});
          close();ui.toast('Solicitud preparada para '+sh+' · visible en Mi Día + Tablón · WhatsApp pendiente de envío','ok',3500);
        });
      }});
    });
    document.getElementById('openAgenda').addEventListener('click',()=>{
      const rows=agendadas.slice(0,4).map(v=>`<div class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
        <div><b style="font-size:13px">${v.shopper}</b> · ${v.sucursal}<div style="font-size:11px;color:var(--t3)">📅 ${v.agendada} · ${v.franjaCode} · autorizada por Coordinación</div></div>
        <button class="btn btn-ghost btn-sm aprAdjust" data-vid="${v.id}" data-sh="${v.shopper}">🗓️ Solicitar ajuste</button></div>`).join('');
      ui.modal('Gestión de agendamientos',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Separa las fechas enviadas por shoppers de las referencias HR y de las propuestas al postularse.</p>
        <div style="background:var(--green-bg);border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:var(--green)">⌛ Fechas pendientes de autorización <span class="bdg bdg-n">0</span></div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">No hay fechas nuevas pendientes de autorización.</div></div>
        <div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:9px">✅ Agendas autorizadas desde la plataforma <span class="bdg bdg-g">${agendadas.length}</span></div>
        ${rows||ui.empty('🗓️','Sin agendas')}
        <div style="margin-top:8px">${ui.aiBox('Estas fechas provienen de HR o de una postulación aprobada; se reflejan para coordinación y shopper sin contarse como pendientes.','Referencias')}</div>`,
      {onMount:(ov,close)=>ov.querySelectorAll('.aprAdjust').forEach(b=>b.addEventListener('click',()=>{
        const sh=b.dataset.sh;
        CX.notif&&CX.notif.push({to:'shopper',tipo:'ajuste',icon:'🗓️',tono:'a',titulo:'El equipo solicita ajustar tu agenda',txt:sh+' · revisa la fecha de tu visita en Mis Visitas',nav:'misvisitas'});
        if(CX.automations&&CX.automations.fire)CX.automations.fire('reprog',{shopper:sh});
        close();ui.toast('Ajuste solicitado a '+sh+' · notificación preparada (Mi Día + WhatsApp fallback) · pendiente confirmación','ok',3500);
      }))});
    });
  },0);
  return html;
});
