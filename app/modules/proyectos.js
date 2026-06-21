/* CXOrbia · Proyectos (admin) — the IA-adaptive core.
   Selecting/creating a project reconfigures the whole platform. */
CX.module('proyectos', ({data,ui})=>{
  const cards=data.projects.map(p=>{
    const active=p.id===data.currentProjectId;
    const v=data._visitas.filter(x=>x.projectId===p.id);
    return `<div class="card hov card-p" data-pid="${p.id}" style="cursor:pointer;${active?'border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-light)':''}">
      <div class="between" style="margin-bottom:10px">
        <div class="flex" style="gap:10px"><div style="width:34px;height:34px;border-radius:9px;background:${p.accent}1a;display:flex;align-items:center;justify-content:center;color:${p.accent};font-weight:800;font-family:var(--disp)">${p.name[0]}</div>
        <div><div class="card-t" style="font-size:15px">${p.name}</div><div style="font-size:11px;color:var(--t3)">${p.industry}</div></div></div>
        ${active?ui.bdg('Activo','g'):ui.bdg('Cambiar','n')}
      </div>
      <div class="flex wrap" style="gap:6px;margin-bottom:10px">
        ${p.countries.map(c=>ui.bdg(c==='GT'?'🇬🇹 GT':'🇭🇳 HN','b')).join('')}
        ${ui.bdg(p.sucursales+' sucursales','n')}
        ${ui.bdg(v.length+' visitas','n')}
      </div>
      <div style="font-size:11.5px;color:var(--t2)">Escenarios: ${p.scenarios.join(' · ')}</div>
    </div>`;
  }).join('');

  const p=data.project();
  const html=`
  ${ui.ph('Proyectos', 'Cada proyecto reconfigura dashboard, KPIs, reglas y cuestionarios — sin tocar código')}
  <div class="between" style="margin-bottom:14px">
    <div class="flex">${ui.bdg(data.projects.length+' proyectos','n')} ${ui.bdg('Activo: '+p.name,'b')}</div>
    <button class="btn btn-pr" id="newProj">+ Nuevo proyecto</button>
  </div>
  <div class="grid g3" style="margin-bottom:18px">${cards}</div>
  <div class="card card-p">
    ${ui.aiBox('Al cambiar o crear un proyecto, la plataforma se adapta sola: el dashboard, el mapeo, las reglas de quincena/franja, los honorarios por país y los cuestionarios por escenario se reconfiguran para ese cliente. Es el corazón de la escalabilidad del negocio.','Proyectos adaptativos')}
  </div>`;

  // attach interactions after render via microtask
  setTimeout(()=>{
    document.querySelectorAll('[data-pid]').forEach(c=>c.addEventListener('click',()=>{
      data.setProject(c.dataset.pid); ui.toast('Plataforma adaptada a: '+data.project().name,'ok');
    }));
    const nb=document.getElementById('newProj');
    if(nb)nb.addEventListener('click',()=>ui.modal('Nuevo proyecto',`
      <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Configura un cliente nuevo; la IA generará dashboard, reglas y cuestionarios base.</p>
      <div style="margin-bottom:12px"><label class="lbl">Cliente</label><input class="inp" placeholder="Ej. Cadena de retail"></div>
      <div class="grid g2" style="margin-bottom:12px">
        <div><label class="lbl">Países</label><input class="inp" placeholder="GT, HN"></div>
        <div><label class="lbl">Sucursales</label><input class="inp" placeholder="24"></div>
      </div>
      <div style="margin-bottom:16px"><label class="lbl">Escenarios</label><input class="inp" placeholder="Semana, Estreno, Incógnito"></div>
      ${ui.aiBox('Al crear, se reconfiguran automáticamente: dashboard, KPIs por sucursal, reglas de quincena y franja, tablero y filtros.','La plataforma se adapta sola')}
      <div style="text-align:right;margin-top:16px"><button class="btn btn-pr" onclick="CX.ui.toast('Proyecto creado (demo)','ok');this.closest('.cx-ov').remove()">Crear proyecto</button></div>
    `));
  },0);
  return html;
});
