/* CXOrbia · Configuración: Cuestionarios, Usuarios, Configuración (admin)
   Módulos AUTO-ADMINISTRABLES: todo editable desde la UI, sin tocar código. */

/* ---------- Cuestionarios: editor del PROGRAMA (secciones→preguntas, pesos, versiones) ---------- */
let _qProg=null, _qPid=null;
CX.module('cuestionarios', ({data,ui})=>{
  const p=data.project();
  if(!_qProg||_qPid!==p.id){ _qProg=JSON.parse(JSON.stringify(CX.programa.get(p.id))); _qPid=p.id; }
  const TIPOS=CX.programa.TIPOS, CRIT=CX.programa.CRITERIOS;
  const host=ui.el('div');

  const ver=()=>_qProg.versions.find(v=>v.id===_qProg.activeId)||_qProg.versions[0];

  /* importar cuestionario (pegar/CSV simple) y crear con IA */
  const IMPORT_SAMPLE=`# Recibimiento | 20\n- Saludo y bienvenida | Escala 1–5 | 60 | req\n- Tiempo de espera | Escala 1–5 | 40\n# Atención | 50\n- Conocimiento del asesor | Escala 1–5 | 50 | req\n- Amabilidad | Escala 1–5 | 50\n# Cierre | 30\n- Despedida | Sí / No | 100`;
  function parseImport(text){
    const secs=[]; let cur=null;
    (text||'').split(/\n/).forEach(l=>{ l=l.trim(); if(!l)return;
      if(l[0]==='#'){ const [name,w]=l.slice(1).split('|').map(x=>x.trim()); cur={id:CX.programa.uid('sec'),name:name||'Sección',weight:+w||0,questions:[]}; secs.push(cur); }
      else if((l[0]==='-'||l[0]==='*')&&cur){ const p=l.slice(1).split('|').map(x=>x.trim());
        cur.questions.push({id:CX.programa.uid('q'),name:p[0]||'Pregunta',tipo:CX.programa.TIPOS.includes(p[1])?p[1]:'Escala 1–5',weight:+p[2]||0,req:/req/i.test(p[3]||''),critico:/ko|crít|crit/i.test(p[4]||'')}); }
    });
    return secs;
  }
  function importModal(){
    ui.modal('Importar cuestionario', `
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Pega tu cuestionario (o llénalo desde Excel/CSV exportado). Formato: <b># Sección | peso</b> y por pregunta <b>- texto | tipo | peso | req | ko</b>.</p>
      <textarea class="inp" id="impTxt" rows="9" style="font-family:monospace;font-size:12px"></textarea>
      <div class="flex" style="justify-content:space-between;margin-top:12px"><button class="btn btn-ghost btn-sm" id="impSample">Cargar ejemplo</button>
        <button class="btn btn-green btn-sm" id="impApply">Importar a esta versión</button></div>`,
    {onMount:(ov,close)=>{
      ov.querySelector('#impSample').addEventListener('click',()=>{ov.querySelector('#impTxt').value=IMPORT_SAMPLE;});
      ov.querySelector('#impApply').addEventListener('click',()=>{ const secs=parseImport(ov.querySelector('#impTxt').value);
        if(!secs.length){ ui.toast('No se detectaron secciones (revisa el formato)','err'); return; }
        ver().sections=secs; close(); draw(); ui.toast('Importadas '+secs.length+' secciones','ok'); }); }});
  }
  function aiGenerate(desc){
    const d=(desc||'').toLowerCase(); let banks;
    if(/restau|comida|food|bebida|sabor|menú|menu/.test(d)) banks=[['Recibimiento',15,['Saludo y bienvenida','Tiempo hasta atención']],['Toma de orden',25,['Sugerencia del menú','Claridad del pedido']],['Calidad de alimentos',30,['Sabor y temperatura','Presentación del plato']],['Tiempos',15,['Tiempo de entrega']],['Limpieza',10,['Mesa e instalaciones']],['Cierre',5,['Despedida e invitación a volver']]];
    else if(/banc|finan|agencia|asesor|préstamo|prestamo|cuenta/.test(d)) banks=[['Espera',15,['Tiempo en fila']],['Asesoría',35,['Conocimiento del asesor','Claridad de la información']],['Protocolo',25,['Cumplimiento de protocolo','Verificación de identidad']],['Instalaciones',15,['Orden y señalización']],['Cierre',10,['Despedida y seguimiento']]];
    else if(/retail|tienda|super|caja|producto|ropa|calzado/.test(d)) banks=[['Recibimiento',15,['Saludo en piso']],['Asesoría de producto',30,['Conocimiento','Disponibilidad de stock']],['Experiencia de compra',25,['Orden y exhibición','Facilidad para encontrar']],['Caja',20,['Tiempo en caja','Amabilidad en el cobro']],['Cierre',10,['Invitación a volver']]];
    else banks=null;
    const base=banks||CX.programa.sections(p.id).map(s=>[s.name,s.weight,s.questions.map(q=>q.name)]);
    return base.map(([name,weight,qs])=>({id:CX.programa.uid('sec'),name,weight,questions:qs.map((qn,i)=>({id:CX.programa.uid('q'),name:qn,tipo:'Escala 1–5',weight:Math.round(100/qs.length),req:i===0,critico:false}))}));
  }
  function aiModal(){
    const CRIT=CX.programa.CRITERIOS;
    ui.modal('🤖 Set-up inteligente desde instructivo', `
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Carga el <b>instructivo / protocolo de servicio</b> del cliente (o pégalo) y la IA propone secciones, preguntas ponderadas y evidencias. Asígnalo al <b>tipo de visita</b> que agrupa ciertas sucursales (marca, cadena, formato…).</p>
      <input type="file" class="inp" id="aiFile" accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,image/*" style="padding:7px;margin-bottom:8px">
      <textarea class="inp" id="aiTxt" rows="4" placeholder="…o pega aquí el instructivo / protocolo / qué quieres evaluar" style="margin-bottom:10px"></textarea>
      <div class="grid g2" style="gap:10px 12px;margin-bottom:6px">
        <div><label class="lbl">Crear como versión</label><select class="sel" id="aiMode"><option value="new">Nueva versión (recomendado)</option><option value="replace">Reemplazar versión activa</option></select></div>
        <div><label class="lbl">Aplica por</label><select class="sel" id="aiCrit">${CRIT.map(c=>`<option ${c==='Por tipo de tienda'?'selected':''}>${c}</option>`).join('')}</select></div>
        <div style="grid-column:1/3"><label class="lbl">Tipo de visita / agrupador (ej. Marca X, Cadena Norte, Formato Express)</label><input class="inp" id="aiAplica" placeholder="A qué sucursales aplica este cuestionario"></div>
      </div>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-green btn-sm" id="aiGo">Generar set-up</button></div>`,
    {onMount:(ov,close)=>{
      ov.querySelector('#aiFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)ov.querySelector('#aiTxt').placeholder='Documento "'+f.name+'" cargado · la IA extraerá el contenido. Puedes añadir notas aquí.';});
      ov.querySelector('#aiGo').addEventListener('click',()=>{ const file=ov.querySelector('#aiFile').files[0];
        let secs=aiGenerate(ov.querySelector('#aiTxt').value+' '+(file?file.name:''));
        const crit=ov.querySelector('#aiCrit').value, aplica=ov.querySelector('#aiAplica').value.trim();
        const aplicar=(finalSecs)=>{
          if(ov.querySelector('#aiMode').value==='new'){
            const v={id:CX.programa.uid('ver'),name:aplica?('Cuestionario · '+aplica):('Versión '+(_qProg.versions.length+1)),criterio:crit,aplica,sections:finalSecs};
            _qProg.versions.push(v); _qProg.activeId=v.id;
          } else { const v=ver(); v.sections=finalSecs; v.criterio=crit; if(aplica)v.aplica=aplica; }
          draw();
          ui.toast((CX.ai&&CX.ai.ready()?'IA extrajo el set-up del instructivo':'Borrador generado')+' · '+finalSecs.length+' secciones'+(aplica?' · aplica a "'+aplica+'"':''),'ok',4200);
        };
        close();
        CX.aiIterate({
          title:'🤖 Set-up generado · revisa e itera',
          hint:'La IA propuso estas secciones con sus pesos. Ajusta con una instrucción (agregar/quitar secciones, cambiar pesos) y regenera, o úsalo tal cual.',
          initial:secs,
          render:(r)=>`<table class="tbl"><thead><tr><th>Sección</th><th>Peso</th><th>Preguntas</th></tr></thead><tbody>${r.map(s=>`<tr><td><b>${s.name||s[0]}</b></td><td>${(s.peso||s[1]||0)}%</td><td style="font-size:11.5px;color:var(--t3)">${((s.preguntas||s[2]||[]).length)} preg.</td></tr>`).join('')}</tbody></table>`,
          onRegen:(instr,prev)=>{ const d=instr.toLowerCase();
            let r=prev.slice();
            if(/limpiez|orden|imagen/.test(d) && !r.some(s=>/limpiez|imagen/i.test(s.name||s[0]||''))) r.push({name:'Limpieza e imagen',peso:10,preguntas:['Orden y limpieza del local','Imagen del personal']});
            if(/menos|reduc|corto/.test(d) && r.length>3) r=r.slice(0,Math.max(3,r.length-1));
            if(/atenci|servicio|bienvenida/.test(d)) r=r.map(s=>(/atenci|bienvenida|recib/i.test(s.name||s[0]||'')?Object.assign({},s,{peso:(s.peso||s[1]||0)+10}):s));
            return r;
          },
          onAccept:aplicar,
        });
      }); }});
  }

  const sync=()=>{
    const v=ver();
    host.querySelectorAll('[data-sec]').forEach(secEl=>{
      const s=v.sections.find(x=>x.id===secEl.dataset.sec); if(!s)return;
      const nm=secEl.querySelector('[data-sf="name"]'); if(nm)s.name=nm.value;
      const wt=secEl.querySelector('[data-sf="weight"]'); if(wt)s.weight=+wt.value||0;
      secEl.querySelectorAll('[data-qi]').forEach(tr=>{
        const q=s.questions.find(x=>x.id===tr.dataset.qi); if(!q)return;
        tr.querySelectorAll('[data-qf]').forEach(el=>{const f=el.dataset.qf; q[f]=el.type==='checkbox'?el.checked:(f==='weight'?(+el.value||0):el.value);});
      });
    });
  };

  const qrow=(s,q,i)=>`<tr data-qi="${q.id}">
    <td style="width:26px;color:var(--brand);font-weight:700">${i+1}</td>
    <td><input class="inp" data-qf="name" value="${q.name}" style="border-color:transparent;background:transparent;font-weight:600"></td>
    <td><select class="sel" data-qf="tipo" style="width:auto;padding:5px 8px">${TIPOS.map(t=>`<option ${t===q.tipo?'selected':''}>${t}</option>`).join('')}</select></td>
    <td style="width:70px"><input class="inp" data-qf="weight" type="number" value="${q.weight}" style="padding:5px 8px"></td>
    <td style="width:50px;text-align:center"><input type="checkbox" data-qf="req" ${q.req?'checked':''}></td>
    <td style="width:50px;text-align:center" title="Pregunta crítica / KO"><input type="checkbox" data-qf="critico" ${q.critico?'checked':''}></td>
    <td style="width:140px"><select class="sel" data-qf="evidencia" style="width:auto;padding:5px 8px">${CX.programa.EVID.map(e=>`<option value="${e.id}" ${e.id===(q.evidencia||'none')?'selected':''}>${e.icon} ${e.label}</option>`).join('')}</select></td>
    <td style="width:34px;text-align:right"><button class="btn btn-ghost btn-sm" data-delq="${s.id}|${q.id}" style="color:var(--red)">✕</button></td>
  </tr>`;

  const secCard=(s)=>{
    const qs=s.questions.reduce((a,q)=>a+(+q.weight||0),0);
    return `<div class="card card-p" data-sec="${s.id}" style="margin-bottom:12px">
      <div class="between" style="margin-bottom:10px;gap:10px;flex-wrap:wrap">
        <div class="flex" style="gap:8px;flex:1;min-width:220px">
          <input class="inp" data-sf="name" value="${s.name}" style="max-width:260px;font-weight:700">
          <span class="flex" style="gap:4px"><span style="font-size:11px;color:var(--t3)">peso</span><input class="inp" data-sf="weight" type="number" value="${s.weight}" style="width:64px;padding:5px 8px"><span style="font-size:12px;color:var(--t3)">%</span></span>
          ${qs===100?ui.bdg('preguntas 100%','g'):ui.bdg('preguntas '+qs+'%','a')}
        </div>
        <button class="btn btn-ghost btn-sm" data-dels="${s.id}" style="color:var(--red)">✕ sección</button>
      </div>
      <table class="tbl"><thead><tr><th></th><th>Pregunta</th><th>Tipo</th><th>Peso %</th><th>Oblig.</th><th>Crít.</th><th>Evidencia</th><th></th></tr></thead>
      <tbody>${s.questions.map((q,i)=>qrow(s,q,i)).join('')}</tbody></table>
      <button class="btn btn-soft btn-sm" data-addq="${s.id}" style="margin-top:10px">＋ Pregunta</button>
    </div>`;
  };

  const draw=()=>{
    const v=ver(); const val=CX.programa.validate(v.sections);
    host.innerHTML=`
    ${ui.ph('Cuestionarios y Programa', p.name+' · secciones y preguntas ponderadas · versiones por criterio')}
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)">📌 <b>Fuente única.</b> Lo que definas aquí calcula el <b>score del shopper</b> al llenar el cuestionario y se refleja en el <b>Portal del Cliente</b> (mismas secciones y pesos).</div>
    </div>
    <div class="flex wrap" style="gap:7px;margin-bottom:14px;align-items:center">
      <span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Versión</span>
      ${_qProg.versions.map(vv=>`<button class="btn ${vv.id===_qProg.activeId?'btn-pr':'btn-ghost'} btn-sm" data-ver="${vv.id}">${vv.name} · ${vv.criterio}</button>`).join('')}
      <button class="btn btn-soft btn-sm" id="addVer">＋ Versión</button>
      ${_qProg.versions.length>1?`<button class="btn btn-ghost btn-sm" id="delVer" style="color:var(--red)">✕ versión</button>`:''}
      <button class="btn btn-ghost btn-sm" id="dupVer">⧉ Duplicar</button>
    </div>
    <div class="card card-p" style="margin-bottom:14px">
      <div class="between" style="gap:10px;flex-wrap:wrap">
        <div class="flex" style="gap:8px;flex:1;min-width:240px">
          <input class="inp" id="verName" value="${v.name}" style="max-width:220px;font-weight:700">
          <select class="sel" id="verCrit" style="width:auto">${CRIT.map(c=>`<option ${c===v.criterio?'selected':''}>${c}</option>`).join('')}</select>
          <input class="inp" id="verAplica" value="${v.aplica||''}" placeholder="Aplica a (ej. Cadena X / Marca Y)" style="max-width:240px">
        </div>
        <div class="flex" style="gap:6px">
          ${val.sectionsOk?ui.bdg('Secciones 100%','g'):ui.bdg('Secciones '+val.sectionsSum+'%','a')}
          <button class="btn btn-green btn-sm" id="saveProg">💾 Guardar programa</button>
        </div>
      </div>
    </div>
    <div id="secList">${v.sections.map(secCard).join('')}</div>
    <div class="flex" style="gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn btn-soft btn-sm" id="addSec">＋ Sección</button>
      <button class="btn btn-ghost btn-sm" id="impBtn">📥 Importar</button>
      <button class="btn btn-ghost btn-sm" id="aiBtn">✨ Crear con IA</button>
    </div>
    <div class="card card-p">${ui.aiBox('Valido que las secciones sumen 100% y que cada sección sume 100% en sus preguntas. Puedes versionar el cuestionario por sucursal, marca o cadena. Las preguntas crítico/KO limitan el score si se incumplen.','Editor ponderado · una sola fuente para las 3 caras')}</div>`;
    bind();
  };

  const bind=()=>{
    host.querySelectorAll('[data-ver]').forEach(b=>b.addEventListener('click',()=>{sync();_qProg.activeId=b.dataset.ver;draw();}));
    host.querySelector('#addVer').addEventListener('click',()=>{sync();const v={id:CX.programa.uid('ver'),name:'Versión '+(_qProg.versions.length+1),criterio:'Por sucursal',aplica:'',sections:JSON.parse(JSON.stringify(ver().sections))};v.sections.forEach(s=>{s.id=CX.programa.uid('sec');s.questions.forEach(q=>q.id=CX.programa.uid('q'));});_qProg.versions.push(v);_qProg.activeId=v.id;draw();ui.toast('Versión creada','ok');});
    const dv=host.querySelector('#delVer'); if(dv)dv.addEventListener('click',()=>{_qProg.versions=_qProg.versions.filter(x=>x.id!==_qProg.activeId);_qProg.activeId=_qProg.versions[0].id;draw();ui.toast('Versión eliminada','');});
    host.querySelector('#dupVer').addEventListener('click',()=>{sync();const src=ver();const c=JSON.parse(JSON.stringify(src));c.id=CX.programa.uid('ver');c.name=src.name+' (copia)';c.sections.forEach(s=>{s.id=CX.programa.uid('sec');s.questions.forEach(q=>q.id=CX.programa.uid('q'));});_qProg.versions.push(c);_qProg.activeId=c.id;draw();ui.toast('Versión duplicada','ok');});
    host.querySelector('#addSec').addEventListener('click',()=>{sync();ver().sections.push({id:CX.programa.uid('sec'),name:'Nueva sección',weight:0,questions:[]});draw();});
    host.querySelector('#impBtn').addEventListener('click',()=>{sync();importModal();});
    host.querySelector('#aiBtn').addEventListener('click',()=>{sync();aiModal();});
    host.querySelectorAll('[data-dels]').forEach(b=>b.addEventListener('click',()=>{sync();const v=ver();v.sections=v.sections.filter(s=>s.id!==b.dataset.dels);draw();}));
    host.querySelectorAll('[data-addq]').forEach(b=>b.addEventListener('click',()=>{sync();const s=ver().sections.find(x=>x.id===b.dataset.addq);s.questions.push({id:CX.programa.uid('q'),name:'Nueva pregunta',tipo:'Escala 1–5',weight:0,req:false,critico:false});draw();}));
    host.querySelectorAll('[data-delq]').forEach(b=>b.addEventListener('click',()=>{sync();const[sid,qid]=b.dataset.delq.split('|');const s=ver().sections.find(x=>x.id===sid);s.questions=s.questions.filter(q=>q.id!==qid);draw();}));
    host.querySelector('#saveProg').addEventListener('click',()=>{
      sync(); const v=ver();
      v.name=host.querySelector('#verName').value||v.name; v.criterio=host.querySelector('#verCrit').value; v.aplica=host.querySelector('#verAplica').value;
      const val=CX.programa.validate(v.sections);
      CX.programa.save(p.id,_qProg);
      ui.toast(val.sectionsOk&&val.allQOk?'Programa guardado · aplica a shopper y portal del cliente':'Guardado (revisa pesos: deben sumar 100%)', val.sectionsOk&&val.allQOk?'ok':'a',3600);
      draw();
    });
  };
  draw();
  return host;
});

/* ---------- Usuarios & Permisos (matriz editable) ---------- */
let _uState=null;
CX.module('usuarios', ({ui})=>{
  if(!_uState) _uState={users:[
    {name:'Admin Demo',email:'admin@demo.cxorbia',rol:'super',activo:true},
    {name:'Coordinación',email:'coord@demo.cxorbia',rol:'admin',activo:true},
    {name:'Operaciones',email:'ops@demo.cxorbia',rol:'ops',activo:true},
    {name:'Evaluador 01',email:'evaluador01@demo.cxorbia',rol:'shopper',activo:true},
    {name:'Finanzas',email:'finanzas@demo.cxorbia',rol:'admin',activo:false},
  ]};
  const st=_uState;
  const MODS=[['Operación','op'],['Finanzas','fin'],['Admin Proyecto','prj'],['Capacitación','cap'],['Configuración','cfg'],['Portal Shopper','sh'],['Comercial','com']];
  if(!st.perm) st.perm={super:['op','fin','prj','cap','cfg','sh','com'],admin:['op','fin','prj','cap','com'],ops:['op','prj','cap'],shopper:['sh','cap']};
  const PERM=st.perm;
  const rolColor={super:'p',admin:'b',ops:'t',shopper:'g'};

  const host=ui.el('div');
  const draw=()=>{
    host.innerHTML=`
    <div class="between" style="margin-bottom:6px"><div>${ui.ph('Usuarios & Permisos', 'Cuatro roles con acceso por módulo · todo editable desde aquí')}</div>
      <button class="btn btn-pr btn-sm" id="addU">＋ Invitar usuario</button></div>
    <div class="grid g4" style="margin-bottom:16px">
      ${CX.ROLES.map(r=>`<div class="card card-p"><div class="flex" style="gap:8px;margin-bottom:6px">${ui.bdg(r.label,rolColor[r.id])}</div>
        <div style="font-size:11.5px;color:var(--t3)">${r.desc}</div>
        <div style="font-size:10px;color:var(--t3);margin-top:6px">${st.users.filter(u=>u.rol===r.id).length} usuario(s)</div></div>`).join('')}
    </div>
    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-t" style="margin-bottom:12px">Usuarios</div>
      <table class="tbl"><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>
      ${st.users.map((u,i)=>`<tr data-ui="${i}"><td><b>${u.name}</b></td><td style="font-size:12px">${u.email}</td>
        <td><select class="sel" data-rol style="width:auto;padding:5px 8px">${CX.ROLES.map(r=>`<option value="${r.id}" ${r.id===u.rol?'selected':''}>${r.label}</option>`).join('')}</select></td>
        <td><label class="flex" style="gap:6px;font-size:12px"><input type="checkbox" data-act ${u.activo?'checked':''}> ${u.activo?'Activo':'Inactivo'}</label></td>
        <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-rm="${i}" style="color:var(--red)">✕</button></td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="card card-p">
      <div class="between" style="margin-bottom:12px"><div class="card-t">Matriz de acceso por rol <span class="muted" style="font-weight:500;font-size:11px">· editable</span></div><span class="bdg bdg-g" id="permSaved" style="display:none">✓ Guardado</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Rol</th>${MODS.map(m=>`<th style="text-align:center">${m[0]}</th>`).join('')}</tr></thead><tbody>
      ${CX.ROLES.map(r=>`<tr><td>${ui.bdg(r.label,rolColor[r.id])}</td>${MODS.map(m=>`<td style="text-align:center"><input type="checkbox" class="permChk" data-role="${r.id}" data-mod="${m[1]}" ${PERM[r.id]&&PERM[r.id].includes(m[1])?'checked':''} ${r.id==='super'?'disabled title="Super siempre tiene acceso total"':''}></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      <div style="margin-top:14px">${ui.aiBox('Marca/desmarca el acceso de cada rol a cada módulo — la vista se segmenta automáticamente. El rol Super conserva acceso total. Requisito para vender multiempresa y a clientes con cumplimiento; en producción se valida también en el backend.','Gobierno y seguridad · autoadministrable')}</div>
    </div>`;
    host.querySelectorAll('[data-ui]').forEach(tr=>{const i=+tr.dataset.ui;
      tr.querySelector('[data-rol]').addEventListener('change',e=>{st.users[i].rol=e.target.value;ui.toast('Rol actualizado','ok');draw();});
      tr.querySelector('[data-act]').addEventListener('change',e=>{st.users[i].activo=e.target.checked;draw();});});
    host.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{st.users.splice(+b.dataset.rm,1);draw();ui.toast('Usuario eliminado','');}));
    host.querySelectorAll('.permChk').forEach(c=>c.addEventListener('change',()=>{
      const role=c.dataset.role, mod=c.dataset.mod; PERM[role]=PERM[role]||[];
      if(c.checked){ if(!PERM[role].includes(mod))PERM[role].push(mod); } else { PERM[role]=PERM[role].filter(m=>m!==mod); }
      const sv=host.querySelector('#permSaved'); if(sv){sv.style.display='';setTimeout(()=>sv.style.display='none',1500);}
    }));
    host.querySelector('#addU').addEventListener('click',()=>ui.modal('Invitar usuario',`
      <div style="margin-bottom:12px"><label class="lbl">Nombre</label><input class="inp" id="nuName" placeholder="Nombre y apellido"></div>
      <div style="margin-bottom:12px"><label class="lbl">Correo</label><input class="inp" id="nuMail" placeholder="correo@empresa.com"></div>
      <div style="margin-bottom:16px"><label class="lbl">Rol</label><select class="sel" id="nuRol">${CX.ROLES.map(r=>`<option value="${r.id}">${r.label}</option>`).join('')}</select></div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="nuSave">Enviar invitación</button></div>`,{onMount:(ov,close)=>{
        ov.querySelector('#nuSave').addEventListener('click',()=>{const n=ov.querySelector('#nuName').value||'Usuario nuevo';st.users.push({name:n,email:ov.querySelector('#nuMail').value||'nuevo@demo.cxorbia',rol:ov.querySelector('#nuRol').value,activo:true});close();draw();ui.toast('Invitación enviada','ok');});}}));
  };
  draw();
  return host;
});

/* ---------- Configuración general (submenús + consola cliente/proveedor) ---------- */
let _cfgTab='marca', _cfgMode='proveedor';
CX.module('config', ({data,ui})=>{
  const p=data.project();
  const host=ui.el('div');
  let _cfgTab=_cfgTab||'marca', _cfgMode=_cfgMode||'proveedor';
  const plan=CX.session.plan||p.plan||'estandar';

  const draw=()=>{
    host.innerHTML=`${ui.ph('Configuración', 'Personaliza tu plataforma — marca, plan, países, integraciones y permisos · todo sin tocar código')}
    <div class="flex wrap" style="gap:6px;margin-bottom:14px">
      ${['marca','plan','paises','nda'].map(t=>`<button class="btn btn-sm ${_cfgTab===t?'btn-pr':'btn-ghost'}" data-tab="${t}">${{marca:'🎨 Marca',plan:'📦 Plan',paises:'🌍 Países',nda:'📜 NDA'}[t]}</button>`).join('')}
    </div>
    <div id="cfgBody"></div>`;
    host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{_cfgTab=b.dataset.tab;drawTab();}));
    drawTab();
  };

  const drawTab=()=>{
    const body=host.querySelector('#cfgBody'); if(!body)return;
    if(_cfgTab==='marca') drawMarca(body);
    else if(_cfgTab==='plan') drawPlan(body);
    else if(_cfgTab==='paises') drawPaises(body);
    else if(_cfgTab==='nda') drawNDA(body);
  };

  const drawMarca=(body)=>{
    const T=CX.theme&&CX.theme.active?CX.theme.active():'default';
    body.innerHTML=`<div class="card card-p" style="margin-bottom:14px">
      <div class="card-t" style="margin-bottom:10px">Identidad de marca</div>
      <div class="grid g2" style="gap:10px 14px">
        <div><label class="lbl">Nombre de la consultora</label><input class="inp" id="cfg_name" value="${CX.BRAND?.name||''}"></div>
        <div><label class="lbl">Tagline</label><input class="inp" id="cfg_tag" value="${CX.BRAND?.tagline||''}"></div>
        <div><label class="lbl">Color primario</label><input class="inp" id="cfg_color" type="color" value="${CX.BRAND?.color||'#2a6fdb'}" style="height:36px;padding:2px 5px"></div>
        <div><label class="lbl">Color de acento</label><input class="inp" id="cfg_accent" type="color" value="${CX.BRAND?.accent||'#f59e0b'}" style="height:36px;padding:2px 5px"></div>
      </div>
      <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="saveMarca">Guardar marca</button></div>
    </div>`;
    body.querySelector('#saveMarca')?.addEventListener('click',()=>{
      if(!CX.BRAND)CX.BRAND={};
      CX.BRAND.name=body.querySelector('#cfg_name').value.trim();
      CX.BRAND.tagline=body.querySelector('#cfg_tag').value.trim();
      ui.toast('Marca actualizada · recarga para ver cambios','ok');
    });
  };

  const drawPlan=(body)=>{
    body.innerHTML=`<div class="card card-p">
      <div class="card-h" style="margin-bottom:12px"><div class="card-t">Plan contratado</div><span class="muted">activa módulos automáticamente</span></div>
      <div class="grid g4" style="gap:10px">
        ${Object.keys(CX.PLANS).map(k=>`<label class="card hov" style="padding:12px;cursor:pointer;text-align:center;${plan===k?'border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-light)':''}">
          <input type="radio" name="plan" value="${k}" ${plan===k?'checked':''} style="display:none">
          <div style="font-size:13px;font-weight:800;color:var(--t1)">${CX.PLANS[k].label}</div>
          <div style="font-size:10.5px;color:var(--t3);margin-top:3px">${CX.planModules(k).length} módulos</div></label>`).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" id="editMods">⚙️ Personalizar módulos activos</button>
        <button class="btn btn-pr btn-sm" id="applyPlan">Aplicar plan</button>
      </div>
    </div>`;
    body.querySelector('#applyPlan')?.addEventListener('click',()=>{
      const r=body.querySelector('input[name="plan"]:checked');
      if(r){CX.applyPlan(r.value);CX.router.buildRail(CX.session.role);ui.toast('Plan '+CX.PLANS[r.value].label+' aplicado','ok');}
    });
    body.querySelector('#editMods')?.addEventListener('click',()=>{
      const all=Object.keys(CX.MODULES).filter(k=>CX.MODULES[k].roles.includes('admin'));
      const active=new Set(CX.planModules(plan));
      ui.modal('⚙️ Módulos activos',
        '<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Activa o desactiva módulos del menú.</p><div class="grid g2" style="gap:8px">'+
        all.map(k=>'<label class="flex" style="gap:9px;padding:9px 11px;border:1px solid var(--border);border-radius:9px;cursor:pointer"><input type="checkbox" class="modChk" data-id="'+k+'" '+(active.has(k)?'checked':'')+
        '> <b style="font-size:12.5px">'+CX.MODULES[k].icon+' '+CX.MODULES[k].label+'</b></label>').join('')+
        '</div><div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="modSave">Guardar</button></div>',
        {onMount:(ov,close)=>{ov.querySelector('#modSave').addEventListener('click',()=>{
          const sel=[...ov.querySelectorAll('.modChk:checked')].map(c=>c.dataset.id);
          try{localStorage.setItem('cx_modules_override',JSON.stringify(sel));}catch(e){}
          CX.router.buildRail(CX.session.role);close();ui.toast(sel.length+' módulos activos guardados','ok');
        });}});
    });
  };

  const drawPaises=(body)=>{
    body.innerHTML=`<div class="card card-p">
      <div class="card-h"><div class="card-t">Países del proyecto</div><button class="btn btn-soft btn-sm" id="addPais">＋ Agregar país</button></div>
      <div class="flex wrap" style="gap:8px">${p.countries.map(c=>`<div class="flex" style="gap:6px;padding:6px 11px;border:1px solid var(--border);border-radius:9px">
        <span>${CX.paisFlag(c)} ${CX.paisName(c)} (${p.currency[c]||'—'})</span>
        <button class="btn btn-ghost btn-sm" data-rmc="${c}" style="color:var(--red);padding:1px 7px">✕</button></div>`).join('')}
      </div>
    </div>`;
    body.querySelector('#addPais')?.addEventListener('click',()=>{
      const opts=CX.COUNTRIES.filter(co=>!p.countries.includes(co.c));
      ui.modal('Agregar país',
        '<input class="inp" id="paisSearch" placeholder="🔎 Buscar..." style="margin-bottom:8px">'+
        '<div id="paisList" style="max-height:300px;overflow:auto">'+
        opts.map(co=>'<button class="btn btn-ghost" data-c="'+co.c+'" data-n="'+co.n+'" style="display:block;width:100%;text-align:left;padding:8px 11px">'+
        CX.paisFlag(co.c)+' '+co.n+' ('+co.cur+')</button>').join('')+'</div>',
        {onMount:(ov,close)=>{
          ov.querySelector('#paisSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();ov.querySelectorAll('[data-c]').forEach(b=>{b.style.display=(b.dataset.n.toLowerCase().includes(q)||b.dataset.c.toLowerCase().includes(q))?'':'none';});});
          ov.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>{p.countries.push(b.dataset.c);p.currency=p.currency||{};p.currency[b.dataset.c]=CX.moneda(b.dataset.c);close();ui.toast(b.dataset.n+' agregado','ok');draw();}));
        }});
    });
    body.querySelectorAll('[data-rmc]').forEach(b=>b.addEventListener('click',()=>{p.countries=p.countries.filter(c=>c!==b.dataset.rmc);draw();ui.toast('País eliminado del proyecto','');}));
  };

  const drawNDA=(body)=>{
    const nda=CX.BRAND&&CX.BRAND.nda||'Al acceder a esta plataforma, confirmas que has leído y aceptas los términos de confidencialidad y uso de datos.';
    body.innerHTML=`<div class="card card-p">
      <div class="card-t" style="margin-bottom:10px">NDA / Acuerdo de confidencialidad</div>
      <textarea class="inp" id="cfg_nda" rows="6">${nda}</textarea>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="saveNDA">Guardar NDA</button></div>
    </div>`;
    body.querySelector('#saveNDA')?.addEventListener('click',()=>{if(!CX.BRAND)CX.BRAND={};CX.BRAND.nda=body.querySelector('#cfg_nda').value;ui.toast('NDA actualizado','ok');});
  };

  draw();
  return host;
});

