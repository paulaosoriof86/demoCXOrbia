/* CXOrbia · CRM Comercial — pipeline de prospección conectado a Clientes
   Prospecto → Calificado → Propuesta → Negociación → Ganado/Perdido.
   Al GANAR, se crea (o promueve) un Cliente activo. Rubros = CX.RUBROS. */
CX.crmStore = CX.crmStore || {
  _l:null,
  ETAPAS:[['nuevo','Nuevo','n'],['calif','Calificado','b'],['propuesta','Propuesta','a'],['negoc','Negociación','p'],['ganado','Ganado','g'],['perdido','Perdido','r']],
  seed(){ return [
    {id:'op1',empresa:'Cadena Norte',rubro:'Supermercados',pais:'GT',etapa:'propuesta',valor:48000,contacto:'Gerencia de Operaciones',prob:60,nota:'Solicitaron mystery + auditoría de imagen.'},
    {id:'op2',empresa:'Grupo Vértice',rubro:'Restaurantes · Multimarca',pais:'GT',etapa:'calif',valor:32000,contacto:'Dirección de Marca',prob:35,nota:'Interés en experiencia al cliente trimestral.'},
    {id:'op3',empresa:'Banca del Istmo',rubro:'Banca · Red de agencias',pais:'HN',etapa:'negoc',valor:75000,contacto:'Subgerencia Comercial',prob:75,nota:'Programa anual, varias agencias.'},
    {id:'op4',empresa:'FarmaPlus',rubro:'Farmacias',pais:'GT',etapa:'nuevo',valor:21000,contacto:'Mercadeo',prob:15,nota:'Referido. Pendiente reunión de relevamiento.'},
  ]; },
  list(){ if(!this._l) this._l=this.seed(); return this._l; },
  add(o){ this.list().push(Object.assign({id:'op'+Date.now().toString(36),etapa:'nuevo',prob:15,valor:0,acts:[]},o)); CX.bus&&CX.bus.emit('crm'); },
  move(id,etapa){ const o=this.list().find(x=>x.id===id); if(o){o.etapa=etapa; if(etapa==='ganado')o.prob=100; if(etapa==='perdido')o.prob=0; CX.bus&&CX.bus.emit('crm');} return o; },
  /* actividades / notas / recordatorios por oportunidad */
  acts(id){ const o=this.list().find(x=>x.id===id); if(o&&!o.acts)o.acts=[]; return o?o.acts:[]; },
  addAct(id,a){ const o=this.list().find(x=>x.id===id); if(o){o.acts=o.acts||[];o.acts.unshift(Object.assign({id:'a'+Date.now().toString(36),fecha:new Date().toISOString().slice(0,16).replace('T',' ')},a));CX.bus&&CX.bus.emit('crm');} },
  /* próximas tareas/recordatorios de todo el pipeline */
  tareas(){ const out=[]; this.list().forEach(o=>{(o.acts||[]).forEach(a=>{if(a.tipo==='tarea'&&!a.hecho)out.push(Object.assign({op:o.empresa,opId:o.id},a));});}); return out.sort((a,b)=>(a.vence||'').localeCompare(b.vence||'')); },
  toggleTarea(opId,aId){ const o=this.list().find(x=>x.id===opId); if(o){const a=(o.acts||[]).find(x=>x.id===aId);if(a){a.hecho=!a.hecho;CX.bus&&CX.bus.emit('crm');}} },
};

CX.module('crm', ({data,ui})=>{
  const ES=CX.crmStore.ETAPAS, host=ui.el('div');
  const tone=(e)=>(ES.find(x=>x[0]===e)||[])[2]||'n';
  const lbl=(e)=>(ES.find(x=>x[0]===e)||[])[1]||e;

  const draw=()=>{
    const ops=CX.crmStore.list();
    const activos=ops.filter(o=>!['ganado','perdido'].includes(o.etapa));
    const pipeline=activos.reduce((a,o)=>a+(o.valor||0),0);
    const ponderado=activos.reduce((a,o)=>a+(o.valor||0)*(o.prob||0)/100,0);
    const ganados=ops.filter(o=>o.etapa==='ganado');
    const cur=(data.project().currency&&data.project().currency.GT)||'$';

    const col=(et)=>{ const items=ops.filter(o=>o.etapa===et[0]); if(['ganado','perdido'].includes(et[0])&&!items.length)return '';
      return `<div style="flex:1;min-width:180px">
        <div class="between" style="margin-bottom:8px"><span style="font-size:12px;font-weight:800;color:var(--${et[2]})">${et[1]}</span><span class="bdg bdg-n">${items.length}</span></div>
        ${items.map(o=>`<div class="card hov" data-op="${o.id}" style="padding:11px 12px;margin-bottom:8px;cursor:pointer;border-left:3px solid var(--${et[2]})">
          <div style="font-size:12.5px;font-weight:700;color:var(--t1)">${o.empresa}</div>
          <div style="font-size:10.5px;color:var(--t3);margin:2px 0">${CX.paisFlag(o.pais)} ${o.rubro}</div>
          <div class="between" style="margin-top:5px"><b style="font-size:12px;color:var(--green)">${cur} ${(o.valor/1000).toFixed(0)}k</b><span style="font-size:10.5px;color:var(--t3)">${o.prob}%</span></div></div>`).join('')||'<div class="muted" style="font-size:11px;padding:6px 0">—</div>'}
      </div>`; };

    host.innerHTML=`
      <div class="between" style="margin-bottom:6px"><div>${ui.ph('CRM Comercial','Pipeline de prospección · al ganar se crea el cliente automáticamente')}</div>
        <button class="btn btn-pr btn-sm" id="crmNew">＋ Nueva oportunidad</button></div>
      <div class="grid g4" style="margin-bottom:16px" id="crmKpis">
        <div data-ck="pipe" style="cursor:pointer">${ui.kpi('Pipeline activo',cur+' '+(pipeline/1000).toFixed(0)+'k','b')}</div>
        <div data-ck="pond" style="cursor:pointer">${ui.kpi('Ponderado',cur+' '+(ponderado/1000).toFixed(0)+'k','p','por probabilidad')}</div>
        <div data-ck="op" style="cursor:pointer">${ui.kpi('Oportunidades',activos.length,'a')}</div>
        <div data-ck="tareas" style="cursor:pointer">${ui.kpi('Tareas pendientes',CX.crmStore.tareas().length,'r','recordatorios')}</div>
      </div>
      <div class="card card-p" style="overflow-x:auto">
        <div class="flex" style="gap:14px;align-items:flex-start;min-width:760px">${ES.map(col).join('')}</div>
      </div>
      <div class="card card-p" style="margin-top:14px">${ui.aiBox('El CRM y Clientes comparten el mismo catálogo de rubros. Una oportunidad ganada se promueve a Cliente activo (sin recapturar). Desde una oportunidad puedes generar la propuesta y la estructura de costos.','Comercial conectado con operación')}</div>`;

    host.querySelectorAll('[data-op]').forEach(c=>c.addEventListener('click',()=>opDetail(CX.crmStore.list().find(o=>o.id===c.dataset.op))));
    const kd={pipe:['Pipeline activo',activos],pond:['Ponderado por probabilidad',activos],op:['Oportunidades activas',activos]};
    host.querySelectorAll('#crmKpis [data-ck]').forEach(el=>el.addEventListener('click',()=>{
      if(el.dataset.ck==='tareas'){ const ts=CX.crmStore.tareas();
        ui.modal('Tareas y recordatorios ('+ts.length+')', ts.length?ts.map(t=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${t.texto}</b><div style="font-size:11px;color:var(--t3)">${t.op} · vence ${t.vence||'—'}</div></div><button class="btn btn-soft btn-sm" data-done="${t.opId}|${t.id}">✓ Hecho</button></div>`).join(''):ui.empty('✅','Sin tareas pendientes.'),{onMount:(ov,close)=>ov.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{const[oi,ai]=b.dataset.done.split('|');CX.crmStore.toggleTarea(oi,ai);close();draw();ui.toast('Tarea completada','ok');}))});
        return; }
      const d=kd[el.dataset.ck];
      ui.modal(d[0]+' ('+d[1].length+')',d[1].length?`<table class="tbl"><thead><tr><th>Empresa</th><th>Rubro</th><th>Etapa</th><th>Valor</th><th>Prob.</th></tr></thead><tbody>${d[1].map(o=>`<tr><td><b>${o.empresa}</b></td><td style="font-size:12px">${o.rubro}</td><td>${ui.bdg(lbl(o.etapa),tone(o.etapa))}</td><td>${cur} ${(o.valor/1000).toFixed(0)}k</td><td>${o.prob}%</td></tr>`).join('')}</tbody></table>`:ui.empty('🤝','Sin oportunidades.'));
    }));
    host.querySelector('#crmNew').addEventListener('click',newOp);
  };

  const opDetail=(o)=>{ if(!o)return;
    ui.modal(o.empresa+' · '+lbl(o.etapa),`
      <div style="font-size:12px;color:var(--t3);margin-bottom:10px">${CX.paisFlag(o.pais)} ${o.rubro} · ${o.contacto||'sin contacto'}</div>
      <div class="grid g2" style="gap:10px 12px;margin-bottom:12px">
        <div><label class="lbl">Valor estimado</label><input class="inp" id="op_val" type="number" value="${o.valor||0}"></div>
        <div><label class="lbl">Probabilidad %</label><input class="inp" id="op_prob" type="number" value="${o.prob||0}"></div>
        <div style="grid-column:1/3"><label class="lbl">Etapa</label><select class="sel" id="op_et">${ES.map(e=>`<option value="${e[0]}" ${e[0]===o.etapa?'selected':''}>${e[1]}</option>`).join('')}</select></div>
        <div style="grid-column:1/3"><label class="lbl">Nota / relevamiento</label><textarea class="inp" id="op_nota" rows="2">${o.nota||''}</textarea></div>
      </div>
      <div class="flex wrap" style="gap:8px;margin-bottom:12px">
        <button class="btn btn-soft btn-sm" id="op_prop">📄 Generar propuesta</button>
        <button class="btn btn-soft btn-sm" id="op_cost">🧮 Estructura de costos</button>
        <button class="btn btn-soft btn-sm" id="op_acta">📝 Acta inteligente (reunión)</button>
      </div>
      <div class="card-t" style="font-size:12.5px;margin:6px 0 8px">Actividades & recordatorios</div>
      <div class="flex wrap" style="gap:6px;margin-bottom:8px">
        <button class="btn btn-ghost btn-sm" data-act="nota">＋ Nota</button>
        <button class="btn btn-ghost btn-sm" data-act="llamada">📞 Llamada</button>
        <button class="btn btn-ghost btn-sm" data-act="reunion">👥 Reunión</button>
        <button class="btn btn-ghost btn-sm" data-act="tarea">⏰ Tarea/recordatorio</button>
      </div>
      <div id="op_timeline" style="max-height:200px;overflow:auto;margin-bottom:14px"></div>
      <div class="between"><button class="btn btn-green btn-sm" id="op_win">🏆 Marcar ganado → crear cliente</button><button class="btn btn-pr btn-sm" id="op_save">Guardar</button></div>
    `,{onMount:(ov,close)=>{
      const renderTL=()=>{const acts=CX.crmStore.acts(o.id);
        ov.querySelector('#op_timeline').innerHTML=acts.length?acts.map(a=>{const ic={nota:'🗒️',llamada:'📞',reunion:'👥',tarea:'⏰',acta:'📝'}[a.tipo]||'•';
          return `<div style="display:flex;gap:9px;padding:8px 0;border-bottom:1px solid var(--border-2)"><div style="font-size:15px">${ic}</div><div style="flex:1"><div style="font-size:12px;color:var(--t1)${a.tipo==='tarea'&&a.hecho?';text-decoration:line-through;opacity:.6':''}">${a.texto}</div><div style="font-size:10.5px;color:var(--t3)">${a.fecha}${a.vence?' · vence '+a.vence:''}</div></div>${a.tipo==='tarea'?`<button class="btn btn-ghost btn-sm" data-tg="${a.id}" style="padding:1px 7px">${a.hecho?'↺':'✓'}</button>`:''}</div>`;
        }).join(''):'<div class="muted" style="font-size:12px;padding:6px 0">Sin actividades aún. Registra notas, llamadas y reuniones.</div>';
        ov.querySelectorAll('[data-tg]').forEach(b=>b.addEventListener('click',()=>{CX.crmStore.toggleTarea(o.id,b.dataset.tg);renderTL();}));
      };
      renderTL();
      const save=()=>{o.valor=+ov.querySelector('#op_val').value||0;o.prob=+ov.querySelector('#op_prob').value||0;o.etapa=ov.querySelector('#op_et').value;o.nota=ov.querySelector('#op_nota').value;CX.crmStore.move(o.id,o.etapa);};
      ov.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{ const tipo=b.dataset.act;
        ui.modal(({nota:'Nueva nota',llamada:'Registrar llamada',reunion:'Registrar reunión',tarea:'Nueva tarea / recordatorio'})[tipo],`
          <label class="lbl">${tipo==='tarea'?'Qué hay que hacer':'Detalle'}</label><textarea class="inp" id="ac_txt" rows="3" placeholder="${tipo==='llamada'?'Resumen de la llamada…':tipo==='reunion'?'Puntos tratados…':tipo==='tarea'?'Ej. Enviar propuesta revisada':'Escribe la nota…'}"></textarea>
          ${tipo==='tarea'?'<label class="lbl" style="margin-top:10px">Vence</label><input class="inp" id="ac_vence" type="date">':''}
          <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="ac_ok">Guardar</button></div>
        `,{onMount:(o2,c2)=>o2.querySelector('#ac_ok').addEventListener('click',()=>{const txt=(o2.querySelector('#ac_txt').value||'').trim();if(!txt){ui.toast('Escribe el detalle','warn');return;}CX.crmStore.addAct(o.id,{tipo,texto:txt,vence:tipo==='tarea'?(o2.querySelector('#ac_vence').value||''):''});c2();renderTL();ui.toast('Actividad registrada','ok');})});
      }));
      ov.querySelector('#op_save').addEventListener('click',()=>{save();close();draw();ui.toast('Oportunidad actualizada','ok');});
      ov.querySelector('#op_prop').addEventListener('click',()=>{save();close();CX.router.nav('costos');ui.toast('Genera la propuesta para '+o.empresa+' en Costos & Propuestas','ok',3200);});
      ov.querySelector('#op_cost').addEventListener('click',()=>{save();close();CX.router.nav('costos');});
      ov.querySelector('#op_acta').addEventListener('click',()=>ui.modal('📝 Acta inteligente de reunión',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Pega la transcripción (Zoom/Meet/Notion) o las notas crudas y la IA genera el <b>acta estructurada</b>: asistentes, acuerdos, próximos pasos con responsables y fechas.</p>
        <textarea class="inp" id="acta_in" rows="4" placeholder="Pega aquí la transcripción o notas de la reunión…" style="margin-bottom:10px"></textarea>
        <div style="text-align:right"><button class="btn btn-green btn-sm" id="acta_go">Generar acta</button></div>
      `,{onMount:(o3,c3)=>o3.querySelector('#acta_go').addEventListener('click',()=>{
        const acta=`Asistentes: ${o.contacto||'contacto'} (${o.empresa}), equipo comercial.\nAcuerdos: avanzar con programa de ${o.rubro}; enviar propuesta y estructura de costos.\nPróximos pasos: (1) Enviar propuesta — comercial — 3 días. (2) Reunión de relevamiento — ${o.empresa} — semana próxima.`;
        CX.crmStore.addAct(o.id,{tipo:'acta',texto:'Acta: '+(acta.split('\n')[1]||'reunión registrada')});
        CX.crmStore.addAct(o.id,{tipo:'tarea',texto:'Enviar propuesta a '+o.empresa,vence:new Date(Date.now()+3*864e5).toISOString().slice(0,10)});
        c3();renderTL();ui.toast(CX.ai&&CX.ai.ready()?'Acta generada con IA · tareas creadas':'Acta generada (configura Gemini para transcripción real) · tareas creadas','ok',4200);
      })}));
      ov.querySelector('#op_win').addEventListener('click',()=>{
        save(); CX.crmStore.move(o.id,'ganado');
        // promueve a cliente activo (sin recapturar)
        const exists=data.clients.find(c=>c.name.toLowerCase()===o.empresa.toLowerCase());
        if(exists){ exists.estado='Activo'; }
        else if(data.addClient){ data.addClient({name:o.empresa,industry:o.rubro,pais:o.pais,estado:'Activo',plan:'estandar'}); }
        close(); draw(); ui.toast('🏆 '+o.empresa+' ganado · creado como Cliente activo','ok',4000);
      });
    }});
  };

  const newOp=()=>ui.modal('Nueva oportunidad',`
    <div class="grid g2" style="gap:10px 12px">
      <div style="grid-column:1/3"><label class="lbl">Empresa</label><input class="inp" id="no_emp" placeholder="Nombre de la empresa / marca"></div>
      <div><label class="lbl">Rubro</label><select class="sel" id="no_rub">${CX.RUBROS.map(r=>`<option>${r}</option>`).join('')}</select></div>
      <div><label class="lbl">País</label><select class="sel" id="no_pais">${CX.COUNTRIES.map(c=>`<option value="${c.c}">${CX.paisFlag(c.c)} ${c.n}</option>`).join('')}</select></div>
      <div><label class="lbl">Valor estimado</label><input class="inp" id="no_val" type="number"></div>
      <div><label class="lbl">Contacto</label><input class="inp" id="no_ct" placeholder="Nombre · rol"></div>
    </div>
    <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="no_save">Crear oportunidad</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#no_save').addEventListener('click',()=>{const e=ov.querySelector('#no_emp').value.trim();if(!e){ui.toast('Pon el nombre de la empresa','warn');return;}CX.crmStore.add({empresa:e,rubro:ov.querySelector('#no_rub').value,pais:ov.querySelector('#no_pais').value,valor:+ov.querySelector('#no_val').value||0,contacto:ov.querySelector('#no_ct').value.trim()});close();draw();ui.toast('Oportunidad creada','ok');});}});

  draw();
  CX.bus.on('crm',()=>draw());
  return host;
});
