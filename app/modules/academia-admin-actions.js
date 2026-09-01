/* CXOrbia · Academia admin actions V91
   Patch incremental sobre V91. Agrega acciones visibles de administracion
   con motivo y trazabilidad local, sin backend real ni publicacion real. */
window.CX = window.CX || {};
(function(){
  const PATCH_ID='academia-admin-actions-v91';
  const STATES=[['draft','Borrador'],['in_review','En revision'],['published_preview','Publicado preview'],['archived','Archivado']];
  const now=()=>new Date().toISOString();
  const auditRef=()=> 'acad_aud_'+Math.random().toString(16).slice(2,8);
  const aud=(role)=> role==='shopper'?'shopper':role==='cliente'?'cliente':(CX._acadAud||'admin');
  const metaKey=(r)=>'cx_acad_admin_meta_'+r;
  const auditKey=(r)=>'cx_acad_admin_audit_'+r;
  const esc=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const read=(k,fb)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fb));}catch(e){return fb;}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const meta=(r)=>read(metaKey(r),{});
  const saveMeta=(r,m)=>write(metaKey(r),m);
  const audit=(r,e)=>{const a=read(auditKey(r),[]);a.unshift(Object.assign({at:now(),auditRef:auditRef(),audience:r},e));write(auditKey(r),a.slice(0,200));return a[0];};
  const custom=(r)=>CX.acadData?.getCustom?CX.acadData.getCustom(r):[];
  const saveCustom=(r,a)=>CX.acadData?.saveCustom&&CX.acadData.saveCustom(r,a);
  const allCourses=(r)=>[...(CX.acadData?.COURSES?.[r]||[]),...custom(r)];
  const findCourse=(r,id)=>allCourses(r).find(c=>c&&c.id===id);
  const isCustom=(r,id)=>custom(r).some(c=>c&&c.id===id);
  const clone=(o)=>JSON.parse(JSON.stringify(o||{}));

  function addCopy(r,c,patch,reason,action){
    const cp=clone(c);const stamp=Date.now().toString(36);
    Object.assign(cp,patch||{});
    cp.id='cu_'+action+'_'+stamp;cp.custom=true;cp._sourceCourseId=c.id;cp._version=Number(c._version||1)+1;cp._status=cp._status||'draft';
    cp._auditTrail=[...(c._auditTrail||[]),{action,reason,at:now(),auditRef:auditRef()}];
    const a=custom(r);a.unshift(cp);saveCustom(r,a);audit(r,{action,courseId:c.id,newCourseId:cp.id,reason,status:cp._status});return cp;
  }
  function updateCustom(r,id,patch,reason,action){
    const a=custom(r);const i=a.findIndex(c=>c&&c.id===id);if(i<0)return null;
    a[i]=Object.assign({},a[i],patch,{custom:true,_auditTrail:[...(a[i]._auditTrail||[]),{action,reason,at:now(),auditRef:auditRef()}]});
    saveCustom(r,a);audit(r,{action,courseId:id,reason,status:a[i]._status});return a[i];
  }
  function setStatus(r,id,status,reason){
    const m=meta(r);m[id]=Object.assign({},m[id]||{},{status,archived:status==='archived',reason,updatedAt:now(),auditRef:auditRef()});saveMeta(r,m);
    if(isCustom(r,id))updateCustom(r,id,{_status:status},reason,'status_change');
    audit(r,{action:'status_change',courseId:id,status,reason});
  }
  function askReason(ui,title,body,onOk){
    ui.modal(title,body+`<label class="lbl">Motivo obligatorio</label><textarea class="inp" id="aaReason" rows="3" placeholder="Explica el cambio para auditoria local" style="margin-bottom:10px"></textarea><div style="background:var(--amber-bg,#fff7e6);border-radius:8px;padding:8px 11px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">Preview local. La aplicacion real queda pendiente de backend y revision humana.</div><div style="text-align:right"><button class="btn btn-pr btn-sm" id="aaOk">Confirmar</button></div>`,{onMount:(ov,close)=>ov.querySelector('#aaOk').addEventListener('click',()=>{const reason=(ov.querySelector('#aaReason').value||'').trim();if(!reason){ui.toast('El motivo es obligatorio','warn');return;}onOk(reason,ov,close);})});
  }
  function edit(ui,r,c,redraw){
    const editable=isCustom(r,c.id);
    askReason(ui,editable?'✎ Editar curso':'✎ Crear version editable',`<div class="grid g2" style="gap:8px 12px;margin-bottom:10px"><div><label class="lbl">Nombre</label><input class="inp" id="aaN" value="${esc(c.n)}"></div><div><label class="lbl">Categoria</label><input class="inp" id="aaCat" value="${esc(c.cat||'Induccion')}"></div><div><label class="lbl">Icono</label><input class="inp" id="aaIc" value="${esc(c.ic||'📘')}"></div><div><label class="lbl">Estado</label><select class="sel" id="aaSt">${STATES.map(([id,l])=>`<option value="${id}" ${id===(c._status||'draft')?'selected':''}>${l}</option>`).join('')}</select></div><div style="grid-column:1/3"><label class="lbl">Descripcion</label><textarea class="inp" id="aaD" rows="2">${esc(c.desc||'')}</textarea></div></div>`,(reason,ov,close)=>{const p={n:ov.querySelector('#aaN').value.trim()||c.n,cat:ov.querySelector('#aaCat').value.trim()||c.cat,ic:ov.querySelector('#aaIc').value||c.ic,desc:ov.querySelector('#aaD').value.trim(),_status:ov.querySelector('#aaSt').value};editable?updateCustom(r,c.id,p,reason,'edit'):addCopy(r,c,p,reason,'version_for_edit');close();ui.toast(editable?'Curso actualizado (preview)':'Version editable creada (preview)','ok');redraw();});
  }
  function duplicate(ui,r,c,redraw){askReason(ui,'⧉ Duplicar curso',`<p style="font-size:12.5px;color:var(--t2)">Se creara una copia editable de <b>${esc(c.n)}</b>. El original queda intacto.</p>`,(reason,ov,close)=>{addCopy(r,c,{n:(c.n||'Curso')+' · copia',_status:'draft'},reason,'duplicate');close();ui.toast('Curso duplicado como borrador (preview)','ok');redraw();});}
  function version(ui,r,c,redraw){askReason(ui,'🔖 Versionar curso',`<p style="font-size:12.5px;color:var(--t2)">Se creara una nueva version editable y el original se conserva.</p>`,(reason,ov,close)=>{const v=Number(c._version||1)+1;addCopy(r,c,{n:(c.n||'Curso')+' · v'+v,_version:v,_status:'in_review'},reason,'version');close();ui.toast('Nueva version creada · revision humana pendiente','ok');redraw();});}
  function archive(ui,r,c,redraw){askReason(ui,'🗂 Archivar curso',`<p style="font-size:12.5px;color:var(--t2)">El curso se ocultara de la Academia activa. El historial queda conservado.</p>`,(reason,ov,close)=>{setStatus(r,c.id,'archived',reason);close();ui.toast('Curso archivado (preview)','ok');redraw();});}
  function status(ui,r,c,redraw){askReason(ui,'🚦 Cambiar estado',`<label class="lbl">Estado</label><select class="sel" id="aaStatus" style="margin-bottom:10px">${STATES.map(([id,l])=>`<option value="${id}">${l}</option>`).join('')}</select>`,(reason,ov,close)=>{const st=ov.querySelector('#aaStatus').value;setStatus(r,c.id,st,reason);close();ui.toast('Estado actualizado (preview)','ok');redraw();});}
  function showArchived(ui,r,redraw){
    const m=meta(r);const ids=Object.keys(m).filter(id=>m[id]?.archived);
    ui.modal('🗂 Cursos archivados',ids.length?`<div style="display:grid;gap:8px">${ids.map(id=>{const c=findCourse(r,id)||{n:id};return `<div class="card" style="padding:10px 12px"><div class="between"><div><b>${esc(c.n)}</b><div style="font-size:10.5px;color:var(--t3)">${esc(m[id].reason||'')}</div></div><button class="btn btn-ghost btn-sm aaRestore" data-id="${id}">Restaurar</button></div></div>`;}).join('')}</div>`:`<p style="font-size:12.5px;color:var(--t2)">Sin cursos archivados.</p>`,{onMount:(ov,close)=>ov.querySelectorAll('.aaRestore').forEach(b=>b.addEventListener('click',()=>{m[b.dataset.id]=Object.assign({},m[b.dataset.id]||{},{archived:false,status:'draft',restoredAt:now(),auditRef:auditRef()});saveMeta(r,m);audit(r,{action:'restore',courseId:b.dataset.id,reason:'restaurado desde archivados'});close();ui.toast('Curso restaurado como borrador (preview)','ok');redraw();}))});
  }
  function showAudit(ui,r){const rows=read(auditKey(r),[]);ui.modal('📜 Auditoria Academia (preview)',rows.length?`<div style="display:grid;gap:8px;max-height:60vh;overflow:auto">${rows.map(x=>`<div class="card" style="padding:9px 11px"><div style="font-size:11px;color:var(--t3);font-family:var(--disp,monospace)">${x.auditRef||''} · ${(x.at||'').slice(0,16).replace('T',' ')}</div><div style="font-size:12.5px"><b>${esc(x.action)}</b> · ${esc(x.courseId||'')}</div><div style="font-size:11.5px;color:var(--t2)">${esc(x.reason||'')}</div></div>`).join('')}</div>`:`<p style="font-size:12.5px;color:var(--t2)">Sin auditoria local todavia.</p>`);}
  function hydrate(host,ctx){
    if(!host||!ctx||ctx.role!=='admin'||!CX.acadData)return;
    const ui=ctx.ui,r=aud(ctx.role),m=meta(r),redraw=()=>{try{CX.router.render('aprendizaje');}catch(e){}};
    const header=host.querySelector('#acadManuales')?.closest('.flex');
    if(header&&!header.querySelector('[data-aa-panel]')){
      header.insertAdjacentHTML('beforeend',`<button class="btn btn-sm" data-aa-panel="audit" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25)">📜 Auditoria</button><button class="btn btn-sm" data-aa-panel="arch" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25)">🗂 Archivados</button>`);
      header.querySelector('[data-aa-panel="audit"]').addEventListener('click',e=>{e.stopPropagation();showAudit(ui,r);});
      header.querySelector('[data-aa-panel="arch"]').addEventListener('click',e=>{e.stopPropagation();showArchived(ui,r,redraw);});
    }
    host.querySelectorAll('[data-course]').forEach(card=>{
      const id=card.dataset.course,c=findCourse(r,id);if(!c)return;
      if(m[id]?.archived){card.style.display='none';return;}
      if(card.dataset.aaPatched===PATCH_ID)return;card.dataset.aaPatched=PATCH_ID;
      const st=m[id]?.status||c._status||'published_preview';const lbl=(STATES.find(x=>x[0]===st)||['','Publicado preview'])[1];
      const body=card.querySelector('.card-p')||card;
      body.insertAdjacentHTML('beforeend',`<div class="acad-admin-actions" style="margin-top:10px;padding-top:9px;border-top:1px dashed var(--border);display:flex;gap:5px;flex-wrap:wrap"><span class="bdg bdg-b" style="font-size:10px">${esc(lbl)}</span><button class="btn btn-ghost btn-sm" data-aa="edit">✎ Editar</button><button class="btn btn-ghost btn-sm" data-aa="dup">⧉ Duplicar</button><button class="btn btn-ghost btn-sm" data-aa="ver">🔖 Versionar</button><button class="btn btn-ghost btn-sm" data-aa="st">🚦 Estado</button><button class="btn btn-ghost btn-sm" data-aa="arch" style="color:var(--red)">🗂 Archivar</button></div>`);
      body.querySelectorAll('[data-aa]').forEach(b=>b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const a=b.dataset.aa;if(a==='edit')edit(ui,r,c,redraw);if(a==='dup')duplicate(ui,r,c,redraw);if(a==='ver')version(ui,r,c,redraw);if(a==='st')status(ui,r,c,redraw);if(a==='arch')archive(ui,r,c,redraw);}));
    });
  }
  function wrap(){
    if(!CX.modules||typeof CX.modules.aprendizaje!=='function'||CX.modules.aprendizaje.__aaPatched)return;
    const orig=CX.modules.aprendizaje;
    CX.modules.aprendizaje=function(ctx){const node=orig(ctx);if(node instanceof Node){const run=()=>hydrate(node,ctx);setTimeout(run,0);try{if(!node.__aaObserver){const obs=new MutationObserver(()=>{clearTimeout(node.__aaTimer);node.__aaTimer=setTimeout(run,30);});obs.observe(node,{childList:true,subtree:true});node.__aaObserver=obs;}}catch(e){}}return node;};
    CX.modules.aprendizaje.__aaPatched=true;
  }
  if(CX.modules)wrap();document.addEventListener('DOMContentLoaded',wrap);setTimeout(wrap,0);
})();
