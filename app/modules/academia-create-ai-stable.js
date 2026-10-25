/* CXOrbia · Academia Crear con IA estable V91
   Patch incremental sobre V91. Corrige el riesgo de boton #acadNew sin handler.
   Preview-only: crea borradores locales y deja Gemini real pendiente de backend/gate.
   No llama APIs, no publica real, no Storage, no datos sensibles. */
window.CX = window.CX || {};
(function(){
  const PATCH_ID='academia-create-ai-stable-v91';
  const now=()=>new Date().toISOString();
  const auditRef=()=> 'acad_ai_'+Math.random().toString(16).slice(2,8);
  const aud=(role)=> role==='shopper'?'shopper':role==='cliente'?'cliente':(CX._acadAud||'admin');
  const esc=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const custom=(r)=>CX.acadData?.getCustom?CX.acadData.getCustom(r):[];
  const saveCustom=(r,a)=>CX.acadData?.saveCustom&&CX.acadData.saveCustom(r,a);
  const read=(k,fb)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fb));}catch(e){return fb;}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const auditKey=(r)=>'cx_acad_admin_audit_'+r;
  function log(r,e){const a=read(auditKey(r),[]);a.unshift(Object.assign({at:now(),auditRef:auditRef(),audience:r},e));write(auditKey(r),a.slice(0,200));return a[0];}

  function buildCourse(r,topic,objective,level,project,reason){
    const id='cu_ai_'+Date.now().toString(36);
    const ref=auditRef();
    return {
      id,
      custom:true,
      cat: project || 'Academia operativa',
      n: topic,
      ic:'✨',
      level: level || 'Base',
      mins: 18,
      desc: objective || 'Borrador generado en preview para revision humana antes de publicar.',
      _status:'in_review',
      _version:1,
      _source:'ai_draft_preview',
      _auditTrail:[{action:'create_ai_preview',reason,at:now(),auditRef:ref}],
      modules:[
        {t:'Objetivo',d:objective || 'Definir el objetivo operativo del curso.',k:['Contexto','Resultado esperado','Criterio de aprobacion']},
        {t:'Paso a paso',d:'Borrador estructurado para completar con revision humana.',k:['Preparar insumos','Ejecutar flujo','Registrar evidencia','Escalar excepciones']},
        {t:'Checklist',d:'Lista inicial editable antes de publicar.',k:['Datos source-safe','Gates apagados','Sin promesas reales','Revision humana']},
      ],
      quiz:[
        {q:'Que significa este borrador IA en CXOrbia?',a:'Contenido preparado en preview, pendiente de revision humana y sin Gemini real activo.',opts:['Contenido publicado real','Contenido preparado en preview, pendiente de revision humana y sin Gemini real activo.','Import real ejecutado']},
        {q:'Que debe ocurrir antes de publicarlo?',a:'Revision humana, versionado y gate correspondiente.',opts:['Revision humana, versionado y gate correspondiente.','Pago real','Sincronizacion HR automatica']},
      ],
    };
  }

  function openCreate(ui,r,redraw){
    ui.modal('✨ Crear curso con IA (preview)',`
      <div style="background:var(--amber-bg,#fff7e6);border-radius:9px;padding:10px 12px;font-size:11.8px;color:#8a5b00;margin-bottom:12px;line-height:1.55">
        Gemini real no esta activo. Esto crea un borrador local estructurado, con revision humana pendiente y auditRef.
      </div>
      <div class="grid g2" style="gap:8px 12px;margin-bottom:10px">
        <div><label class="lbl">Tema del curso</label><input class="inp" id="aiTopic" placeholder="Ej. Reprogramaciones con motivo" autofocus></div>
        <div><label class="lbl">Nivel</label><select class="sel" id="aiLevel"><option>Base</option><option>Intermedio</option><option>Avanzado</option></select></div>
        <div><label class="lbl">Proyecto / categoria</label><input class="inp" id="aiProject" placeholder="Ej. Phase A / Operacion"></div>
        <div><label class="lbl">Audiencia</label><select class="sel" id="aiAudience"><option value="${esc(r)}">${esc(r)}</option><option value="admin">admin</option><option value="shopper">shopper</option><option value="cliente">cliente</option></select></div>
        <div style="grid-column:1/3"><label class="lbl">Objetivo</label><textarea class="inp" id="aiObjective" rows="3" placeholder="Que debe saber hacer la persona al finalizar"></textarea></div>
        <div style="grid-column:1/3"><label class="lbl">Motivo / auditRef operacional</label><textarea class="inp" id="aiReason" rows="2" placeholder="Por que se crea este curso"></textarea></div>
      </div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="aiCreate">Crear borrador IA preview</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#aiCreate').addEventListener('click',()=>{
        const topic=(ov.querySelector('#aiTopic').value||'').trim();
        const objective=(ov.querySelector('#aiObjective').value||'').trim();
        const reason=(ov.querySelector('#aiReason').value||'').trim();
        const target=ov.querySelector('#aiAudience').value||r;
        if(!topic){ui.toast('El tema del curso es obligatorio','warn');return;}
        if(!reason){ui.toast('El motivo es obligatorio','warn');return;}
        const course=buildCourse(target,topic,objective,ov.querySelector('#aiLevel').value,ov.querySelector('#aiProject').value,reason);
        const arr=custom(target);arr.unshift(course);saveCustom(target,arr);
        log(target,{action:'create_ai_preview',courseId:course.id,reason,status:'in_review'});
        close();ui.toast('Borrador IA creado en preview · revision humana pendiente','ok',4200);redraw();
      });
    }});
  }

  function hydrate(host,ctx){
    if(!host||!ctx||ctx.role!=='admin'||!CX.acadData)return;
    const ui=ctx.ui,r=aud(ctx.role),redraw=()=>{try{CX.router.render('aprendizaje');}catch(e){}};
    const btn=host.querySelector('#acadNew');
    if(btn&&btn.dataset.aiStable!==PATCH_ID){
      btn.dataset.aiStable=PATCH_ID;
      btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openCreate(ui,r,redraw);},true);
      btn.title='Crear curso con IA preview · Gemini real pendiente de backend/gate';
    }
  }

  function wrap(){
    if(!CX.modules||typeof CX.modules.aprendizaje!=='function'||CX.modules.aprendizaje.__aiStablePatched)return;
    const original=CX.modules.aprendizaje;
    CX.modules.aprendizaje=function(ctx){
      const node=original(ctx);
      if(node instanceof Node){
        const run=()=>hydrate(node,ctx);
        setTimeout(run,0);
        try{
          if(!node.__aiStableObserver){
            const obs=new MutationObserver(()=>{clearTimeout(node.__aiStableTimer);node.__aiStableTimer=setTimeout(run,30);});
            obs.observe(node,{childList:true,subtree:true});
            node.__aiStableObserver=obs;
          }
        }catch(e){}
      }
      return node;
    };
    CX.modules.aprendizaje.__aiStablePatched=true;
  }
  if(CX.modules)wrap();document.addEventListener('DOMContentLoaded',wrap);setTimeout(wrap,0);
})();
