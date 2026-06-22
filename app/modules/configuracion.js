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
      <table class="tbl"><thead><tr><th></th><th>Pregunta</th><th>Tipo</th><th>Peso %</th><th>Oblig.</th><th>Crít.</th><th></th></tr></thead>
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
    <button class="btn btn-soft btn-sm" id="addSec" style="margin-bottom:14px">＋ Sección</button>
    <div class="card card-p">${ui.aiBox('Valido que las secciones sumen 100% y que cada sección sume 100% en sus preguntas. Puedes versionar el cuestionario por sucursal, marca o cadena. Las preguntas crítico/KO limitan el score si se incumplen.','Editor ponderado · una sola fuente para las 3 caras')}</div>`;
    bind();
  };

  const bind=()=>{
    host.querySelectorAll('[data-ver]').forEach(b=>b.addEventListener('click',()=>{sync();_qProg.activeId=b.dataset.ver;draw();}));
    host.querySelector('#addVer').addEventListener('click',()=>{sync();const v={id:CX.programa.uid('ver'),name:'Versión '+(_qProg.versions.length+1),criterio:'Por sucursal',aplica:'',sections:JSON.parse(JSON.stringify(ver().sections))};v.sections.forEach(s=>{s.id=CX.programa.uid('sec');s.questions.forEach(q=>q.id=CX.programa.uid('q'));});_qProg.versions.push(v);_qProg.activeId=v.id;draw();ui.toast('Versión creada','ok');});
    const dv=host.querySelector('#delVer'); if(dv)dv.addEventListener('click',()=>{_qProg.versions=_qProg.versions.filter(x=>x.id!==_qProg.activeId);_qProg.activeId=_qProg.versions[0].id;draw();ui.toast('Versión eliminada','');});
    host.querySelector('#dupVer').addEventListener('click',()=>{sync();const src=ver();const c=JSON.parse(JSON.stringify(src));c.id=CX.programa.uid('ver');c.name=src.name+' (copia)';c.sections.forEach(s=>{s.id=CX.programa.uid('sec');s.questions.forEach(q=>q.id=CX.programa.uid('q'));});_qProg.versions.push(c);_qProg.activeId=c.id;draw();ui.toast('Versión duplicada','ok');});
    host.querySelector('#addSec').addEventListener('click',()=>{sync();ver().sections.push({id:CX.programa.uid('sec'),name:'Nueva sección',weight:0,questions:[]});draw();});
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
  const MODS=[['Operación','op'],['Finanzas','fin'],['Configuración','cfg'],['Portal Shopper','sh']];
  const PERM={super:['op','fin','cfg','sh'],admin:['op','fin'],ops:['op'],shopper:['sh']};
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
      <div class="card-t" style="margin-bottom:12px">Matriz de acceso por rol</div>
      <table class="tbl"><thead><tr><th>Rol</th>${MODS.map(m=>`<th style="text-align:center">${m[0]}</th>`).join('')}</tr></thead><tbody>
      ${CX.ROLES.map(r=>`<tr><td>${ui.bdg(r.label,rolColor[r.id])}</td>${MODS.map(m=>`<td style="text-align:center">${PERM[r.id].includes(m[1])?'<span style="color:var(--green);font-weight:800">✓</span>':'<span style="color:var(--t3)">—</span>'}</td>`).join('')}</tr>`).join('')}
      </tbody></table>
      <div style="margin-top:14px">${ui.aiBox('La vista se segmenta automáticamente según el rol: el equipo operativo ve operación pero no finanzas. Requisito para vender multiempresa y a clientes con cumplimiento. En producción esto se valida también en el backend.','Gobierno y seguridad')}</div>
    </div>`;
    host.querySelectorAll('[data-ui]').forEach(tr=>{const i=+tr.dataset.ui;
      tr.querySelector('[data-rol]').addEventListener('change',e=>{st.users[i].rol=e.target.value;ui.toast('Rol actualizado','ok');draw();});
      tr.querySelector('[data-act]').addEventListener('change',e=>{st.users[i].activo=e.target.checked;draw();});});
    host.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{st.users.splice(+b.dataset.rm,1);draw();ui.toast('Usuario eliminado','');}));
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

  const TABS=[
    {id:'marca',  ic:'🎨', label:'Marca & Tema'},
    {id:'plan',   ic:'📦', label:'Plan & Módulos', prov:true},
    {id:'paises', ic:'🌎', label:'Países & Monedas'},
    {id:'integ',  ic:'🔗', label:'Integraciones'},
    {id:'plant',  ic:'✉️', label:'Plantillas'},
  ];

  /* ----- contenido por pestaña ----- */
  const tabMarca=()=>`
    <div class="grid g2">
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">Identidad</div>
        <label class="lbl">Nombre del producto (tu consultora)</label><input class="inp" id="brName" value="${CX.BRAND.name}" style="margin-bottom:10px">
        <label class="lbl">Nombre del cliente (login)</label><input class="inp" id="brClient" value="${CX.BRAND.clientName||''}" placeholder="Ej. T&A Consultores" style="margin-bottom:4px">
        <div style="font-size:11px;color:var(--t3);margin-bottom:10px">Login: "Plataforma desarrollada para <b>${CX.BRAND.clientName||'(cliente)'}</b> por ${CX.BRAND.name}".</div>
        <label class="lbl">Logo del cliente</label>
        <div class="flex" style="gap:8px"><input type="file" id="brLogo" accept="image/*" class="inp" style="padding:6px">${CX.BRAND.logoUrl?'<button class="btn btn-ghost btn-sm" id="brLogoClr">Quitar</button>':''}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">También puedes extraer la paleta desde el logo (próximamente).</div>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">Tema, colores y tipografía</div>
        <label class="lbl">Plantilla</label>
        <div class="grid g2" style="gap:8px;margin-bottom:12px">
          ${Object.keys(CX.THEMES).map(k=>{const t=CX.THEMES[k];return `<label class="card hov" style="padding:10px;cursor:pointer;${CX.BRAND.theme===k?'border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-light)':''}">
            <input type="radio" name="thm" value="${k}" ${CX.BRAND.theme===k?'checked':''} style="display:none">
            <div class="flex" style="gap:6px;margin-bottom:6px">${[t.colors.brand,t.colors.accent,t.colors.navy].map(c=>`<span style="width:18px;height:18px;border-radius:5px;background:${c};border:1px solid rgba(0,0,0,.1)"></span>`).join('')}</div>
            <div style="font-size:11.5px;font-weight:700;color:var(--t1)">${t.label}</div>
            <div style="font-size:10px;color:var(--t3)">${t.railStyle==='light'?'Sidebar claro':'Sidebar oscuro'}</div></label>`;}).join('')}
        </div>
        <label class="lbl">Tipografía</label>
        <select class="sel" id="brFont" style="margin-bottom:14px">${CX.FONTS.map(f=>`<option value="${f.id}" ${CX.BRAND.font===f.id?'selected':''}>${f.label}</option>`).join('')}</select>
        <button class="btn btn-pr btn-sm" id="brApply">Aplicar marca y tema</button>
      </div>
    </div>`;

  const tabPlan=()=>{
    const plan=CX.BRAND.plan||'pro';
    const allMods=Object.keys(CX.MODULES);
    return `
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)"><b>Consola del proveedor.</b> Elige el plan contratado: preconfigura módulos, temas e integraciones — y luego puedes ajustar todo manualmente.</div>
    </div>
    <div class="card card-p" style="margin-bottom:14px">
      <div class="card-t" style="margin-bottom:12px">Plan contratado</div>
      <div class="grid g4" style="gap:10px">
        ${Object.keys(CX.PLANS).map(k=>`<label class="card hov" style="padding:12px;cursor:pointer;text-align:center;${plan===k?'border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-light)':''}">
          <input type="radio" name="plan" value="${k}" ${plan===k?'checked':''} style="display:none">
          <div style="font-size:13px;font-weight:800;color:var(--t1)">${CX.PLANS[k].label}</div>
          <div style="font-size:10.5px;color:var(--t3);margin-top:3px">${CX.planModules(k).length} módulos</div></label>`).join('')}
      </div>
      <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="applyPlan">Aplicar plan</button></div>
    </div>
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:6px">🧩 Módulos activos <span class="muted" style="font-weight:500">(ajuste fino)</span></div>
      <div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">Activa/desactiva sobre el plan. <b>Nunca se eliminan.</b></div>
      <div style="max-height:260px;overflow:auto;padding-right:4px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${allMods.map(id=>{const m=CX.MODULES[id];return `<label class="between" style="padding:7px 9px;border:1px solid var(--border-2);border-radius:9px;cursor:pointer">
          <span style="font-size:12px;color:var(--t1)">${m.icon} ${m.label}</span>
          <input type="checkbox" data-mod="${id}" ${CX.moduleEnabled(id)?'checked':''}></label>`;}).join('')}
      </div>
    </div>`;
  };

  const tabPaises=()=>`
    <div class="card card-p" style="margin-bottom:14px">
      <div class="between" style="margin-bottom:12px"><div class="card-t">🌎 Países y monedas del proyecto</div><button class="btn btn-soft btn-sm" id="addPais">＋ País</button></div>
      ${p.countries.map(c=>`<div class="between" style="padding:9px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:13px;font-weight:600">${CX.paisLabel(c)}</span>
        <div class="flex" style="gap:10px"><span class="bdg bdg-b">${CX.moneda(p,c)}</span>
        <span style="font-size:12px;color:var(--t3)">recibe ${CX.moneda(p,c)} ${CX.fin?CX.fin.honRecibe(p,c):'—'} · paga ${CX.moneda(p,c)} ${(p.honorario&&p.honorario[c])||'—'}</span></div></div>`).join('')}
      <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-top:10px">Cada país mantiene su moneda; nunca se suman. El shopper solo ve proyectos de su país.</div>
    </div>`;

  const INTEGS=[
    ['🔄','Make','Automatizaciones (HR, mensajes, estados)','pro'],
    ['📊','Google Sheets','HR externa en vivo','estandar'],
    ['📈','Excel Online','HR externa (Microsoft Graph)','estandar'],
    ['📲','WhatsApp Web','Mensajes vía wa.me (sin API)','basico'],
    ['🟢','Green API / WhatsApp API','Envío automático y masivo','pro'],
    ['📧','Gmail / Workspace','Correo + SSO','estandar'],
    ['📨','Outlook / M365','Correo y gestión interna','pro'],
    ['📬','Mailchimp','Campañas masivas a shoppers','pro'],
    ['📁','Google Docs/Drive','Documentos del proyecto','estandar'],
    ['📘','Facebook','Difusión de convocatorias','estandar'],
  ];
  const tabInteg=()=>`
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:12px">Integraciones disponibles</div>
      <div class="grid g2" style="gap:10px">
        ${INTEGS.map(r=>`<div class="between" style="padding:11px 13px;border:1px solid var(--border);border-radius:10px">
          <div class="flex" style="gap:10px"><span style="font-size:20px">${r[0]}</span><div><div style="font-size:13px;font-weight:700;color:var(--t1)">${r[1]}</div><div style="font-size:11px;color:var(--t3)">${r[2]}</div></div></div>
          <label class="flex" style="gap:6px"><span class="bdg bdg-n" style="font-size:9px">${r[3]}+</span><input type="checkbox"></label></div>`).join('')}
      </div>
      <div style="margin-top:12px">${ui.aiBox('Las integraciones se activan por proyecto y plan. WhatsApp tiene modo Web (sin API) y modo API para masivo. Detalle en docs/INTEGRACIONES.md.','Conectores')}</div>
    </div>`;

  const PLANTILLAS=[
    ['Ofrecer visita','📲 WA','Hola {shopper}, hay una visita en {sucursal} ({ciudad}) por {honorario}. ¿Te interesa?'],
    ['Recordatorio de agenda','📲 WA','{shopper}, recuerda tu visita agendada en {sucursal} el {fecha}.'],
    ['¿Realizaste la visita?','📲 WA','{shopper}, ¿pudiste realizar la visita de {sucursal}? Avísanos.'],
    ['Recordatorio cuestionario','📧 Correo','{shopper}, completa el cuestionario de {sucursal} para procesar tu pago.'],
    ['Marcar completada','📲 WA','{shopper}, marca tu visita de {sucursal} como completada en la plataforma.'],
    ['Invitación a certificarse','📧 Correo','{shopper}, certifícate para {proyecto} y desbloquea más visitas.'],
  ];
  const tabPlant=()=>`
    <div class="card card-p">
      <div class="between" style="margin-bottom:12px"><div class="card-t">Plantillas de mensajes (WhatsApp + correo)</div><button class="btn btn-soft btn-sm">＋ Plantilla</button></div>
      ${PLANTILLAS.map(t=>`<div style="border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:9px">
        <div class="between" style="margin-bottom:6px"><div style="font-size:13px;font-weight:700;color:var(--t1)">${t[0]} <span class="bdg bdg-n" style="font-size:9px">${t[1]}</span></div><button class="btn btn-ghost btn-sm">Editar</button></div>
        <div style="font-size:12px;color:var(--t2);background:var(--panel-2);border-radius:8px;padding:8px 10px">${t[2]}</div></div>`).join('')}
      <div style="margin-top:8px">${ui.aiBox('Variables dinámicas: {shopper} {sucursal} {ciudad} {fecha} {honorario} {proyecto} {link}. Se usan para ofrecer visitas, recordatorios, cuestionario, certificación y pago.','Mensajería con variables')}</div>
    </div>`;

  const draw=()=>{
    const tabs=TABS.filter(t=>!(t.prov&&_cfgMode==='cliente'));
    if(!tabs.some(t=>t.id===_cfgTab))_cfgTab='marca';
    const body={marca:tabMarca,plan:tabPlan,paises:tabPaises,integ:tabInteg,plant:tabPlant}[_cfgTab]();
    host.innerHTML=`
      <div class="between" style="margin-bottom:8px">
        <div>${ui.ph('Configuración', _cfgMode==='proveedor'?'Consola del proveedor — control total':'Consola del cliente — autogestión según tu plan')}</div>
        <div class="flex" style="gap:0;border:1px solid var(--border);border-radius:9px;overflow:hidden">
          <button class="cfgMode btn btn-sm ${_cfgMode==='proveedor'?'btn-pr':'btn-ghost'}" data-mode="proveedor" style="border-radius:0">🛠️ Proveedor</button>
          <button class="cfgMode btn btn-sm ${_cfgMode==='cliente'?'btn-pr':'btn-ghost'}" data-mode="cliente" style="border-radius:0">👤 Cliente</button>
        </div>
      </div>
      <div class="flex wrap" style="gap:6px;margin-bottom:16px">
        ${tabs.map(t=>`<button class="cfgTab btn btn-sm ${_cfgTab===t.id?'btn-pr':'btn-ghost'}" data-tab="${t.id}">${t.ic} ${t.label}</button>`).join('')}
      </div>
      ${body}`;
    bind();
  };

  const bind=()=>{
    host.querySelectorAll('.cfgMode').forEach(b=>b.addEventListener('click',()=>{_cfgMode=b.dataset.mode;draw();}));
    host.querySelectorAll('.cfgTab').forEach(b=>b.addEventListener('click',()=>{_cfgTab=b.dataset.tab;draw();}));
    // marca
    const logoInput=host.querySelector('#brLogo');
    if(logoInput)logoInput.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{CX.BRAND.logoUrl=rd.result;ui.toast('Logo cargado · pulsa Aplicar','ok');};rd.readAsDataURL(f);});
    const clr=host.querySelector('#brLogoClr'); if(clr)clr.addEventListener('click',()=>{CX.BRAND.logoUrl='';draw();});
    host.querySelectorAll('input[name="thm"]').forEach(r=>r.addEventListener('change',()=>{CX.applyTheme(r.value);CX.router.buildRail(CX.session.role);}));
    const ap=host.querySelector('#brApply');
    if(ap)ap.addEventListener('click',()=>{
      CX.BRAND.name=host.querySelector('#brName').value||'CXOrbia';
      CX.BRAND.clientName=host.querySelector('#brClient').value||'';
      const thm=host.querySelector('input[name="thm"]:checked'); if(thm)CX.applyTheme(thm.value);
      CX.applyFont(host.querySelector('#brFont').value);
      try{localStorage.setItem('cx_tenant',JSON.stringify({name:CX.BRAND.name,clientName:CX.BRAND.clientName,logoUrl:CX.BRAND.logoUrl,theme:CX.BRAND.theme,font:CX.BRAND.font}));}catch(e){}
      CX.router.buildRail(CX.session.role); ui.toast('Marca y tema aplicados a toda la plataforma','ok');
    });
    // plan
    const apPlan=host.querySelector('#applyPlan');
    if(apPlan)apPlan.addEventListener('click',()=>{const r=host.querySelector('input[name="plan"]:checked');if(r){CX.applyPlan(r.value);CX.router.buildRail(CX.session.role);ui.toast('Plan '+CX.PLANS[r.value].label+' aplicado · módulos preconfigurados','ok',3500);draw();}});
    const apPais=host.querySelector('#addPais');
    if(apPais)apPais.addEventListener('click',()=>{
      const opts=CX.COUNTRIES.filter(co=>!p.countries.includes(co.c));
      ui.modal('Agregar país al proyecto',`
        <input class="inp" id="paisSearch" placeholder="🔎 Buscar país…" style="margin-bottom:10px">
        <div id="paisList" style="max-height:240px;overflow:auto">
          ${opts.map(co=>`<button class="paisOpt btn btn-ghost btn-sm" data-c="${co.c}" data-n="${co.n}" style="width:100%;justify-content:space-between;margin-bottom:6px">${CX.paisFlag(co.c)} ${co.n}<span class="bdg bdg-n">${co.cur}</span></button>`).join('')}
        </div>`,{onMount:(ov,close)=>{
        const filt=()=>{const q=(ov.querySelector('#paisSearch').value||'').toLowerCase();ov.querySelectorAll('.paisOpt').forEach(b=>{b.style.display=b.dataset.n.toLowerCase().includes(q)?'':'none';});};
        ov.querySelector('#paisSearch').addEventListener('input',filt);
        ov.querySelectorAll('.paisOpt').forEach(b=>b.addEventListener('click',()=>{
          const c=b.dataset.c; p.countries.push(c); p.currency=p.currency||{}; p.currency[c]=CX.moneda(p,c);
          close(); ui.toast(b.dataset.n+' agregado al proyecto','ok'); draw();
        }));
      }});
    });
    host.querySelectorAll('[data-mod]').forEach(c=>c.addEventListener('change',()=>{CX.setModuleEnabled(c.dataset.mod,c.checked);CX.router.buildRail(CX.session.role);ui.toast((c.checked?'Activado: ':'Desactivado: ')+CX.MODULES[c.dataset.mod].label,c.checked?'ok':'');}));
  };
  draw();
  return host;
});
