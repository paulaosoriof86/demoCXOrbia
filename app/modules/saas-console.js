/* CXOrbia · Consola SaaS multi-tenant (frontend informativo/prototipo)
   Representa CXOrbia como plataforma SaaS versionada: tenants, planes, módulos,
   países, permisos, feature flags, releases y trazabilidad por versión.
   NO conecta backend real, pagos ni base real — es vista de prototipo. */
window.CX = window.CX || {};

CX.saasConsole = {
  KEY:'cx_saas_tenants',
  seed(){
    return [
      {id:'tya', nombre:'TyA Consultores', plan:'Enterprise', pais:['GT','HN'], estado:'Activo', proyectos:3, usuarios:14, version:'V76', modulos:{dashboard:true,visitas:true,finanzas:true,crm:true,marketing:true,academia:true,portal:true}, flags:{iaGemini:true,evidenciaGeo:true,benchmark:false,facturacionFEL:false}},
      {id:'demo', nombre:'Consultora Demo', plan:'Estándar', pais:['GT'], estado:'Trial', proyectos:1, usuarios:3, version:'V76', modulos:{dashboard:true,visitas:true,finanzas:true,crm:true,marketing:false,academia:true,portal:true}, flags:{iaGemini:false,evidenciaGeo:false,benchmark:false,facturacionFEL:false}},
    ];
  },
  all(){ try{const s=JSON.parse(localStorage.getItem(this.KEY)||'null'); return (s&&s.length)?s:this.seed();}catch(e){return this.seed();} },
  save(a){ try{localStorage.setItem(this.KEY,JSON.stringify(a));}catch(e){} CX.bus&&CX.bus.emit('saas'); },
};

CX.module('saas', ({data, ui})=>{
  const host=ui.el('div');
  const MODS=[['dashboard','📊 Dashboard'],['visitas','📋 Visitas'],['finanzas','💰 Finanzas'],['crm','🏢 CRM'],['marketing','📣 Marketing'],['academia','🎓 Academia'],['portal','📈 Portal cliente']];
  const FLAGS=[['iaGemini','🤖 IA (Gemini)'],['evidenciaGeo','📍 Evidencia geo'],['benchmark','📊 Benchmark industria'],['facturacionFEL','🧾 Facturación FEL']];

  const draw=()=>{
    const tenants=CX.saasConsole.all();
    host.innerHTML=`
      ${ui.ph('Consola SaaS · Multi-tenant', 'CXOrbia como plataforma versionada · tenants, planes, módulos, países, permisos, feature flags y releases centralizados')}
      <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
        <div style="font-size:12.5px;color:var(--brand-dark)"><b>Vista de prototipo.</b> La gestión real de tenants, activación de módulos y releases se ejecuta en el backend. Aquí se visualiza el modelo comercializable.</div>
      </div>
      <div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi('Tenants',tenants.length,'b')}
        ${ui.kpi('Activos',tenants.filter(t=>t.estado==='Activo').length,'g')}
        ${ui.kpi('En trial',tenants.filter(t=>t.estado==='Trial').length,'a')}
        ${ui.kpi('Versión actual','V76','p')}
      </div>
      <div class="card card-p" style="margin-bottom:16px">
        <div class="between" style="margin-bottom:12px"><div class="card-t">🏢 Tenants (clientes de la plataforma)</div><button class="btn btn-pr btn-sm" id="saasNew">＋ Nuevo tenant</button></div>
        <div class="grid g2" style="gap:12px">
          ${tenants.map(t=>`<div class="card hov card-p saasT" data-t="${t.id}" style="cursor:pointer">
            <div class="between" style="margin-bottom:6px"><b style="font-size:14px">${t.nombre}</b><span class="bdg ${t.estado==='Activo'?'bdg-g':'bdg-a'}">${t.estado}</span></div>
            <div style="font-size:11.5px;color:var(--t3);margin-bottom:8px">Plan <b>${t.plan}</b> · ${t.pais.join('/')} · ${t.proyectos} proyecto(s) · ${t.usuarios} usuarios · ${t.version}</div>
            <div class="flex wrap" style="gap:4px">${MODS.filter(m=>t.modulos[m[0]]).map(m=>`<span class="bdg bdg-n" style="font-size:9.5px">${m[1]}</span>`).join('')}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:10px">🚀 Releases centralizados</div>
        <table class="tbl"><thead><tr><th>Versión</th><th>Fecha</th><th>Alcance</th><th>Estado</th></tr></thead><tbody>
          <tr><td><b>V76</b></td><td>2026-07-04</td><td>Coherencia de versión · estados honestos globales · PWA install-aware</td><td><span class="bdg bdg-a">Interno (sin deploy)</span></td></tr>
          <tr><td><b>V74</b></td><td>2026-07-03</td><td>Estados honestos (finanzas preview · Make/IA pendiente backend) · HR Source registro seguro</td><td><span class="bdg bdg-a">Interno (sin deploy)</span></td></tr>
          <tr><td><b>V72</b></td><td>2026-07-03</td><td>HR Source gates · liquidaciones candidatas · consola SaaS</td><td><span class="bdg bdg-a">Interno (sin deploy)</span></td></tr>
          <tr><td><b>V71</b></td><td>2026-07-03</td><td>Auditoría profunda · fichas ampliadas</td><td><span class="bdg bdg-a">Interno (sin deploy)</span></td></tr>
          <tr><td><b>V66</b></td><td>2026-07-02</td><td>Roles/alcance · finanzas · report builder</td><td><span class="bdg bdg-a">Interno (sin deploy)</span></td></tr>
        </tbody></table>
        <div style="margin-top:8px;font-size:10.5px;color:var(--t3)">Prototipo interno sin deploy a producción. El despliegue centralizado real por tenant lo ejecuta el backend. Trazabilidad por versión en app/docs/CAMBIOS-PROTOTIPO.md.</div>
      </div>`;

    host.querySelector('#saasNew').addEventListener('click',()=>ui.modal('＋ Nuevo tenant',`
      <label class="lbl">Nombre de la consultora</label><input class="inp" id="ntN" style="margin-bottom:8px">
      <div class="grid g2" style="gap:8px;margin-bottom:8px"><div><label class="lbl">Plan</label><select class="sel" id="ntP"><option>Starter</option><option>Estándar</option><option>Pro</option><option>Enterprise</option></select></div><div><label class="lbl">Estado</label><select class="sel" id="ntE"><option>Trial</option><option>Activo</option></select></div></div>
      <label class="lbl">Países (coma)</label><input class="inp" id="ntC" value="GT" style="margin-bottom:12px">
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ntOk">Crear tenant</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#ntOk').addEventListener('click',()=>{
      const n=(ov.querySelector('#ntN').value||'').trim();if(!n){ui.toast('Nombre requerido','warn');return;}
      const a=CX.saasConsole.all();a.push({id:'t'+Date.now().toString(36),nombre:n,plan:ov.querySelector('#ntP').value,pais:ov.querySelector('#ntC').value.split(',').map(s=>s.trim()).filter(Boolean),estado:ov.querySelector('#ntE').value,proyectos:0,usuarios:1,version:'V76',modulos:{dashboard:true,visitas:true,finanzas:true,crm:true,marketing:false,academia:true,portal:true},flags:{iaGemini:false,evidenciaGeo:false,benchmark:false,facturacionFEL:false}});
      CX.saasConsole.save(a);close();draw();ui.toast('Tenant creado (prototipo)','ok');
    })}));

    host.querySelectorAll('.saasT').forEach(c=>c.addEventListener('click',()=>{
      const t=CX.saasConsole.all().find(x=>x.id===c.dataset.t);if(!t)return;
      ui.modal('🏢 '+t.nombre,`
        <div style="font-size:12.5px;line-height:1.9;color:var(--t2);margin-bottom:10px">
          <div><b>Plan:</b> ${t.plan} · <b>Estado:</b> ${t.estado} · <b>Versión:</b> ${t.version}</div>
          <div><b>Países:</b> ${t.pais.join(', ')} · <b>Proyectos:</b> ${t.proyectos} · <b>Usuarios:</b> ${t.usuarios}</div>
        </div>
        <div class="card-t" style="font-size:12px;margin-bottom:6px">Módulos activos</div>
        <div class="flex wrap" style="gap:8px;margin-bottom:12px">${MODS.map(m=>`<label class="flex" style="gap:5px;font-size:12px;cursor:pointer"><input type="checkbox" class="tmod" data-m="${m[0]}" ${t.modulos[m[0]]?'checked':''}> ${m[1]}</label>`).join('')}</div>
        <div class="card-t" style="font-size:12px;margin-bottom:6px">Feature flags</div>
        <div class="flex wrap" style="gap:8px;margin-bottom:12px">${FLAGS.map(f=>`<label class="flex" style="gap:5px;font-size:12px;cursor:pointer"><input type="checkbox" class="tflag" data-f="${f[0]}" ${t.flags[f[0]]?'checked':''}> ${f[1]}</label>`).join('')}</div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="tSave">Guardar configuración</button></div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:8px">🔒 La activación real por tenant se aplica en el backend. Aquí se define el modelo.</div>
      `,{onMount:(ov,close)=>ov.querySelector('#tSave').addEventListener('click',()=>{
        ov.querySelectorAll('.tmod').forEach(cb=>t.modulos[cb.dataset.m]=cb.checked);
        ov.querySelectorAll('.tflag').forEach(cb=>t.flags[cb.dataset.f]=cb.checked);
        const a=CX.saasConsole.all().map(x=>x.id===t.id?t:x);CX.saasConsole.save(a);close();draw();ui.toast('Configuración del tenant guardada (prototipo)','ok');
      })});
    }));
  };
  draw();
  CX.bus.on('saas',()=>draw());
  return host;
});
