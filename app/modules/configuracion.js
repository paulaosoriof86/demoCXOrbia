/* CXOrbia · Configuración: Cuestionarios, Usuarios, Configuración (admin)
   Módulos AUTO-ADMINISTRABLES: todo editable desde la UI, sin tocar código. */

/* ---------- Cuestionarios (editor de escenarios + preguntas) ---------- */
let _qState=null;
CX.module('cuestionarios', ({data,ui})=>{
  const p=data.project();
  if(!_qState||_qState.projectId!==p.id){
    _qState={projectId:p.id, active:0, scenarios:p.scenarios.map((s,i)=>({
      name:s, version:'v'+(i+1), preguntas:[
        {t:'Saludo y tiempo de espera',tipo:'Escala 1–5',peso:20,req:true},
        {t:'Limpieza y orden del local',tipo:'Sí / No',peso:15,req:true},
        {t:'Conocimiento del personal',tipo:'Escala 1–5',peso:25,req:true},
        {t:'Sugerencia de producto / combo',tipo:'Sí / No',peso:20,req:false},
        {t:'Comentario abierto / evidencia',tipo:'Texto + foto',peso:20,req:false},
      ]})) };
  }
  const st=_qState, sc=st.scenarios[st.active];
  const tipos=['Escala 1–5','Sí / No','Opción múltiple','Texto','Texto + foto','Numérico'];

  const qrow=(q,i)=>`<tr data-qi="${i}">
    <td style="width:28px;color:var(--brand);font-weight:700">${i+1}</td>
    <td><input class="inp" data-f="t" value="${q.t}" style="border-color:transparent;background:transparent;font-weight:600"></td>
    <td><select class="sel" data-f="tipo" style="width:auto;padding:5px 8px">${tipos.map(t=>`<option ${t===q.tipo?'selected':''}>${t}</option>`).join('')}</select></td>
    <td style="width:80px"><input class="inp" data-f="peso" type="number" value="${q.peso}" style="padding:5px 8px"></td>
    <td style="width:60px;text-align:center"><input type="checkbox" data-f="req" ${q.req?'checked':''}></td>
    <td style="width:40px;text-align:right"><button class="btn btn-ghost btn-sm" data-del="${i}" style="color:var(--red)">✕</button></td>
  </tr>`;

  const host=ui.el('div');
  const draw=()=>{
    const sc=st.scenarios[st.active];
    const totalPeso=sc.preguntas.reduce((a,q)=>a+(+q.peso||0),0);
    host.innerHTML=`
    ${ui.ph('Cuestionarios y Escenarios', p.name+' · crea versiones por escenario y edita preguntas en vivo')}
    <div class="flex wrap" style="gap:7px;margin-bottom:14px">
      ${st.scenarios.map((s,i)=>`<button class="btn ${i===st.active?'btn-pr':'btn-ghost'} btn-sm" data-sc="${i}">${s.version} · ${s.name}</button>`).join('')}
      <button class="btn btn-soft btn-sm" id="addSc">＋ Nueva versión</button>
    </div>
    <div class="card card-p" style="margin-bottom:14px">
      <div class="between" style="margin-bottom:12px">
        <div class="flex" style="gap:10px;flex:1">
          <input class="inp" id="scName" value="${sc.name}" style="max-width:280px;font-weight:700">
          ${ui.bdg(sc.version,'b')} ${ui.bdg(sc.preguntas.length+' preguntas','n')}
          ${totalPeso===100?ui.bdg('Pesos OK · 100%','g'):ui.bdg('Pesos: '+totalPeso+'%','a')}
        </div>
        <div class="flex"><button class="btn btn-ghost btn-sm" id="dupSc">⧉ Duplicar</button><button class="btn btn-green btn-sm" id="saveSc">💾 Guardar</button></div>
      </div>
      <table class="tbl"><thead><tr><th></th><th>Pregunta</th><th>Tipo de respuesta</th><th>Peso %</th><th>Oblig.</th><th></th></tr></thead>
      <tbody id="qBody">${sc.preguntas.map(qrow).join('')}</tbody></table>
      <button class="btn btn-soft btn-sm" id="addQ" style="margin-top:12px">＋ Agregar pregunta</button>
    </div>
    <div class="card card-p">${ui.aiBox('Sugiero preguntas según el rubro del proyecto, valido que los pesos sumen 100% y permito versionar el cuestionario por escenario sin empezar de cero. Lo que edites aquí alimenta la certificación y el reporte de calidad.','Cuestionarios a medida · editor en vivo')}</div>`;
    bind();
  };
  const sync=()=>{
    host.querySelectorAll('#qBody tr').forEach(tr=>{const i=+tr.dataset.qi,q=st.scenarios[st.active].preguntas[i];if(!q)return;
      tr.querySelectorAll('[data-f]').forEach(el=>{const f=el.dataset.f;q[f]=el.type==='checkbox'?el.checked:(f==='peso'?+el.value:el.value);});});
  };
  const bind=()=>{
    host.querySelectorAll('[data-sc]').forEach(b=>b.addEventListener('click',()=>{sync();st.active=+b.dataset.sc;draw();}));
    host.querySelector('#addSc').addEventListener('click',()=>{st.scenarios.push({name:'Escenario nuevo',version:'v'+(st.scenarios.length+1),preguntas:[]});st.active=st.scenarios.length-1;draw();ui.toast('Versión creada','ok');});
    host.querySelector('#dupSc').addEventListener('click',()=>{sync();const c=JSON.parse(JSON.stringify(st.scenarios[st.active]));c.name+=' (copia)';c.version='v'+(st.scenarios.length+1);st.scenarios.push(c);st.active=st.scenarios.length-1;draw();ui.toast('Escenario duplicado','ok');});
    host.querySelector('#addQ').addEventListener('click',()=>{sync();st.scenarios[st.active].preguntas.push({t:'Nueva pregunta',tipo:'Escala 1–5',peso:0,req:false});draw();});
    host.querySelector('#saveSc').addEventListener('click',()=>{sync();st.scenarios[st.active].name=host.querySelector('#scName').value;ui.toast('Cuestionario guardado · se aplica a las próximas visitas','ok');draw();});
    host.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{sync();st.scenarios[st.active].preguntas.splice(+b.dataset.del,1);draw();}));
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

/* ---------- Configuración general (paneles editables) ---------- */
CX.module('config', ({data,ui})=>{
  const p=data.project();
  const host=ui.el('div');
  const draw=()=>{
  const allMods=Object.keys(CX.MODULES);
  host.innerHTML=`
    ${ui.ph('Configuración', 'Marca, módulos, países y reglas — editable sin tocar código')}
    <div class="grid g2" style="margin-bottom:16px">
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">🎨 Marca, logo y plantilla</div>
        <label class="lbl">Nombre del producto (tu consultora)</label><input class="inp" id="brName" value="${CX.BRAND.name}" style="margin-bottom:10px">
        <label class="lbl">Nombre del cliente (aparece en el login)</label><input class="inp" id="brClient" value="${CX.BRAND.clientName||''}" placeholder="Ej. T&A Consultores" style="margin-bottom:4px">
        <div style="font-size:11px;color:var(--t3);margin-bottom:10px">Se mostrará: "Plataforma desarrollada para <b>${CX.BRAND.clientName||'(cliente)'}</b> por ${CX.BRAND.name}".</div>
        <label class="lbl">Logo del cliente</label>
        <div class="flex" style="gap:8px;margin-bottom:10px"><input type="file" id="brLogo" accept="image/*" class="inp" style="padding:6px">${CX.BRAND.logoUrl?'<button class="btn btn-ghost btn-sm" id="brLogoClr">Quitar</button>':''}</div>
        <label class="lbl">Plantilla de tema</label>
        <select class="sel" id="brTheme" style="margin-bottom:12px">${Object.keys(CX.THEMES).map(k=>`<option value="${k}" ${CX.BRAND.theme===k?'selected':''}>${CX.THEMES[k].label}</option>`).join('')}</select>
        <button class="btn btn-pr btn-sm" id="brApply">Aplicar marca y tema</button>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">🧩 Módulos activos para este cliente</div>
        <div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">Activa o desactiva módulos según la necesidad. <b>Nunca se eliminan</b>: puedes reactivarlos cuando el cliente los necesite.</div>
        <div style="max-height:280px;overflow:auto;padding-right:4px">
        ${allMods.map(id=>{const m=CX.MODULES[id];return `<label class="between" style="padding:7px 9px;border:1px solid var(--border-2);border-radius:9px;margin-bottom:6px;cursor:pointer">
          <span style="font-size:12.5px;color:var(--t1)">${m.icon} ${m.label}</span>
          <input type="checkbox" data-mod="${id}" ${CX.moduleEnabled(id)?'checked':''}></label>`;}).join('')}
        </div>
      </div>
    </div>
    <div class="grid g2" style="margin-bottom:16px">
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">🌎 Países y monedas (multipaís)</div>
        ${p.countries.map(c=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:13px;font-weight:600">${CX.paisLabel(c)}</span><span class="bdg bdg-b">${CX.moneda(p,c)}</span></div>`).join('')}
        <div style="background:var(--amber-bg);border-radius:9px;padding:8px 11px;font-size:11px;color:#8a5b00;margin-top:10px">Las monedas nunca se suman entre sí. Cada shopper ve solo proyectos de su país.</div>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">🔗 Integraciones y reglas (por proyecto)</div>
        ${[['📋','Hoja de ruta: '+(p.hrMap?p.hrMap.fuente:'—'),'online / importar / interna'],['📝','Cuestionario: '+(p.cuestionario?p.cuestionario.modo:'—'),(p.cuestionario&&p.cuestionario.label)||''],['💸','Pago: '+(p.pago?p.pago.diasPago+' días':'—'),(p.pago&&p.pago.logica)||''],['🤖','Make / WhatsApp','auto-update de HR y notificaciones'],['📍','Geolocalización',p.geoloc?'activada':'desactivada']].map(r=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div><div style="font-size:12.5px;font-weight:600;color:var(--t1)">${r[0]} ${r[1]}</div><div style="font-size:11px;color:var(--t3)">${r[2]}</div></div><button class="btn btn-ghost btn-sm">Editar</button></div>`).join('')}
      </div>
    </div>
    <div class="card card-p">${ui.aiBox('Cuanto más se resuelve por configuración, mayor el margen del producto: la marca, el logo, los países, las tarifas, el modo de cuestionario, la lógica de pago y los módulos activos se editan por cliente y se propagan solos. La capa IA extrae estas reglas al crear el proyecto.','Cero dependencia técnica')}</div>`;
    bind();
  };
  const bind=()=>{
    host.querySelectorAll('[data-mod]').forEach(c=>c.addEventListener('change',()=>{CX.setModuleEnabled(c.dataset.mod,c.checked);CX.router.buildRail(CX.session.role);ui.toast((c.checked?'Activado: ':'Desactivado: ')+CX.MODULES[c.dataset.mod].label,c.checked?'ok':'');}));
    const logoInput=host.querySelector('#brLogo');
    if(logoInput)logoInput.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{CX.BRAND.logoUrl=rd.result;ui.toast('Logo cargado · pulsa Aplicar','ok');};rd.readAsDataURL(f);});
    const clr=host.querySelector('#brLogoClr'); if(clr)clr.addEventListener('click',()=>{CX.BRAND.logoUrl='';draw();});
    host.querySelector('#brApply').addEventListener('click',()=>{
      CX.BRAND.name=host.querySelector('#brName').value||'CXOrbia';
      CX.BRAND.clientName=host.querySelector('#brClient').value||'';
      CX.applyTheme(host.querySelector('#brTheme').value);
      try{localStorage.setItem('cx_tenant',JSON.stringify({name:CX.BRAND.name,clientName:CX.BRAND.clientName,logoUrl:CX.BRAND.logoUrl,theme:CX.BRAND.theme}));}catch(e){}
      CX.router.buildRail(CX.session.role);
      ui.toast('Marca y tema aplicados a toda la plataforma','ok');draw();
    });
  };
  draw();
  return host;
});
