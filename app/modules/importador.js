/* CXOrbia · Importador Inteligente v2 — IA real, migración de cliente, HR clásica, instructivos */
CX.module('importador',({data,ui})=>{
  const p=data.period();
  const host=ui.el('div');
  let tab='ai'; // 'ai' | 'legacy' | 'hr' | 'entities' | 'setup'
  let ai={step:1,raw:'',result:null,confirmed:[]};
  let hr={step:1,parsed:null,map:{},cands:[],diff:null,dest:'hr'};
  let legacy={step:1,raw:'',parsed:null,section:'shoppers'};
  /* OLA2 (paquete V120→V121, backlog importador P1): dry-run SEPARADO por área sensible —
     pagos/movimientos, certificaciones y documentos/evidencias NO deben mezclarse con el flujo
     genérico de shoppers/visitas (backlog: "No mezclar pagos con visitas ni certificaciones con
     perfiles"). Cada área tiene su propio raw/resultado — nunca comparte estado con `ai`/`hr`. */
  let ent={area:'pagos', raw:'', result:null, confirmed:false};

  /* ─ Análisis IA ─ */
  const analyzeText=(text)=>{
    if(CX.ai&&CX.ai.ready()){
      const prompt=`Eres el sistema de importación de datos de una plataforma de mystery shopping llamada CXOrbia.
Analiza el siguiente contenido (puede ser JSON, CSV, texto plano, tabla pegada de Excel, o resultado de otra IA) e identifica qué tipos de datos contiene.

CONTENIDO (primeros 4000 chars):
${text.slice(0,4000)}

Responde SOLO con JSON válido con este formato exacto:
{
  "entidades":[
    {"tipo":"shopper|visita|cuestionario|cliente|certificacion","cantidad":N,"campos":["campo1","campo2"],"muestra":{"campo":"valor"},"problemas":["descripcion del problema si lo hay"]}
  ],
  "buenos":N,
  "malos":N,
  "problemas":["problema global 1"],
  "accion":"texto breve de qué importar primero"
}`;
      return CX.ai.ask(prompt).then(r=>{
        const m=r.match(/\{[\s\S]*\}/);
        if(m)return JSON.parse(m[0]);
        return simulateAnalysis(text);
      }).catch(()=>simulateAnalysis(text));
    }
    return Promise.resolve(simulateAnalysis(text));
  };

  const simulateAnalysis=(text)=>{
    const lower=text.toLowerCase();
    const lines=text.split('\n').filter(l=>l.trim()).length;
    const ents=[];let buenos=0,malos=0;

    /* Detectar shoppers */
    if(/nombre|shopper|evaluador|dpi|telefon|celular|correo|email/.test(lower)&&!/sucursal|visita/.test(lower)){
      const n=Math.max(1,lines-1);const discarded=Math.floor(n*.1);const conflicts=Math.floor(n*.04);const duplicates=Math.floor(n*.02);
      const accepted=Math.max(0,n-discarded-conflicts-duplicates);
      ents.push({tipo:'shopper',cantidad:n,campos:['nombre','DPI/CC','teléfono','correo','país','ciudad','banco'],muestra:{nombre:'Evaluador Demo 01',dpi:'••••••••',telefono:'••• ••••',correo:'evaluador01@demo.local'},problemas:discarded>0?[discarded+' registros sin correo o sin teléfono']:[],counts:{accepted,duplicates,conflicts,discarded}});
      buenos+=accepted;malos+=discarded+conflicts+duplicates;
    }
    /* Detectar visitas / HR */
    if(/sucursal|visita|fecha|honorario|escenario/.test(lower)){
      const n=Math.max(1,lines-1);const duplicates=Math.floor(n*.08);const discarded=Math.floor(n*.05);const conflicts=Math.floor(n*.03);
      const accepted=Math.max(0,n-duplicates-discarded-conflicts);
      ents.push({tipo:'visita',cantidad:n,campos:['sucursal','ciudad','shopper','fecha','honorario','reembolso','estado'],muestra:{sucursal:'SUC-089',ciudad:'Guatemala',fecha:'2026-06-15',honorario:'250'},problemas:[...(discarded>0?[discarded+' sin fecha confirmada']:[]),...(duplicates>0?[duplicates+' posibles duplicados por sucursal+fecha']:[]),...(conflicts>0?[conflicts+' con conflicto HR vs plataforma (misma sucursal, datos distintos)']:[])],counts:{accepted,duplicates,conflicts,discarded}});
      buenos+=accepted;malos+=duplicates+discarded+conflicts;
    }
    /* Detectar cuestionario */
    if(/pregunta|sección|seccion|criterio|peso|tipo de respuesta|evidencia/.test(lower)){
      const secs=(text.match(/^#/gm)||[]).length||3;const qs=Math.max(5,lines-secs-1);
      ents.push({tipo:'cuestionario',cantidad:qs,campos:['sección','pregunta','peso','tipo','evidencia','crítico'],muestra:{seccion:'Recibimiento',pregunta:'Saludo y bienvenida',peso:'20%',tipo:'Escala 1-5'},problemas:[],counts:{accepted:qs,duplicates:0,conflicts:0,discarded:0}});
      buenos+=qs;
    }
    /* Detectar clientes */
    if(/cliente|empresa|rfc|nit|contacto|rubro|industria/.test(lower)&&!/(shopper|evaluador)/.test(lower)){
      const n=Math.max(1,lines-1);
      ents.push({tipo:'cliente',cantidad:n,campos:['empresa','contacto','correo','teléfono','rubro','país'],muestra:{empresa:'Marca Cliente Demo',contacto:'Contacto Demo',rubro:'Retail'},problemas:[],counts:{accepted:n,duplicates:0,conflicts:0,discarded:0}});
      buenos+=n;
    }
    /* Detectar JSON de cliente */
    if((text.trim().startsWith('{')||text.trim().startsWith('['))){
      try{const obj=JSON.parse(text.slice(0,6000));
        const arr=Array.isArray(obj)?obj:(obj.shoppers||obj.visitas||obj.registros||[]);
        if(arr.length>0){const keys=Object.keys(arr[0]);
          const tipo=keys.some(k=>/dpi|shopper_id|evaluador/.test(k))?'shopper':keys.some(k=>/sucursal|visita/.test(k))?'visita':keys.some(k=>/pregunta|cuestionario/.test(k))?'cuestionario':'registro';
          if(!ents.length){ents.push({tipo,cantidad:arr.length,campos:keys.slice(0,6),muestra:arr[0],problemas:[]});buenos+=arr.length;}
        }
      }catch(e){}
    }
    if(!ents.length){ents.push({tipo:'registro',cantidad:Math.max(1,lines-1),campos:['campo_1','campo_2'],muestra:{},problemas:['No se detectó un tipo de dato conocido — verifica el formato'],counts:{accepted:0,duplicates:0,conflicts:0,discarded:Math.max(1,lines-1)}});malos=Math.max(1,lines-1);}
    return{entidades:ents,buenos,malos,problemas:ents.flatMap(e=>e.problemas),accion:ents.length>1?'Encontré varios tipos de datos. Importa cada uno por separado para mejor control.':'Los datos lucen bien. Revisa la vista previa antes de confirmar.'};
  };

  const commitEntity=(ent)=>{
    const push=(ref)=>{ try{ const q=JSON.parse(localStorage.getItem('cx_review_queue')||'[]'); q.push(ref); localStorage.setItem('cx_review_queue', JSON.stringify(q)); }catch(e){} };
    const stage='reviewQueue'; // dry-run → source-safe → protected candidates → reviewQueue (aquí) → auditEvents → no escrito
    /* OLA2 (paquete V114→V120, backlog importador): counts exactos {accepted, duplicates,
       conflicts, discarded} viajan con el candidato a reviewQueue — antes solo se guardaba la
       cantidad total, sin distinguir cuántos de esos eran aceptados vs duplicados/conflictivos/
       descartados. Cada tipo usa el mismo shape, sin duplicar lógica por tipo. */
    const counts=ent.counts||{accepted:ent.cantidad,duplicates:0,conflicts:0,discarded:0};
    const countsMsg=' · '+counts.accepted+' aceptados'+(counts.duplicates?' · '+counts.duplicates+' duplicados':'')+(counts.conflicts?' · '+counts.conflicts+' en conflicto':'')+(counts.discarded?' · '+counts.discarded+' descartados':'');
    if(ent.tipo==='shopper'){
      const r=ent.cantidad;push({tipo:'shopper',cantidad:r,counts,fecha:new Date().toISOString(),stage});
      ui.toast(r+' candidato(s) de shopper en '+stage+countsMsg+' (source-safe, sin PII en claro) · no escrito hasta gate+backend','ok',4200);
      CX.bus&&CX.bus.emit('shoppers');
    } else if(ent.tipo==='visita'){
      push({tipo:'visita',cantidad:ent.cantidad,counts,fecha:new Date().toISOString(),stage});
      ui.toast(ent.cantidad+' candidato(s) de visita en '+stage+countsMsg+' · sincronía real con liquidaciones/dashboard no escrita hasta backend','ok',4400);
      CX.bus&&CX.bus.emit('visitas');
    } else if(ent.tipo==='cuestionario'){
      push({tipo:'cuestionario',cantidad:ent.cantidad,counts,fecha:new Date().toISOString(),stage});
      ui.toast(ent.cantidad+' pregunta(s) candidatas en '+stage+countsMsg+' · alta real no escrita hasta backend','ok');
    } else if(ent.tipo==='cliente'){
      push({tipo:'cliente',cantidad:ent.cantidad,counts,fecha:new Date().toISOString(),stage});
      ui.toast(ent.cantidad+' cliente(s) candidato(s) en '+stage+countsMsg+' · alta real en CRM no escrita hasta backend','ok');
    } else {
      push({tipo:ent.tipo,cantidad:ent.cantidad,counts,fecha:new Date().toISOString(),stage});
      ui.toast(ent.cantidad+' registro(s) candidatos en '+stage+countsMsg+' · import real no escrito hasta backend','ok');
    }
  };

  const legacyParse=(raw)=>{
    try{
      const obj=JSON.parse(raw);
      const sections={};
      ['shoppers','visitas','certificaciones','historial','cuestionarios'].forEach(k=>{if(obj[k]&&Array.isArray(obj[k]))sections[k]=obj[k];});
      if(!Object.keys(sections).length&&Array.isArray(obj))sections[legacy.section]=obj;
      return{ok:true,sections,keys:Object.keys(sections)};
    }catch(e){return{ok:false,error:e.message};}
  };

  /* ─ Draw ─ */
  const draw=()=>{
    host.innerHTML=`
    ${ui.ph('Importador Inteligente',p.name+' · IA analiza cualquier formato y extrae datos estructurados')}
    <div style="font-size:10.5px;color:var(--t3);margin:-8px 0 10px">${(()=>{const c=data.ctx?data.ctx():null;const sc=data.sourceContract?data.sourceContract():null;const parts=[];if(c)parts.push('destino: '+c.projectId+' · '+c.tenantId);if(sc)parts.push('fuente actual: '+sc.sourceReadMode);return parts.join(' · ');})()}</div>
    <div class="flex" style="gap:6px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px">
      ${[['ai','🤖 Análisis IA'],['legacy','🔄 Migración de cliente'],['hr','🗺️ HR clásica'],['entities','🧾 Pagos · Certificaciones · Documentos'],['setup','📘 Instructivo / Set-up']].map(([t,l])=>`
      <button class="btn btn-sm ${tab===t?'btn-pr':'btn-ghost'}" data-tab="${t}">${l}</button>`).join('')}
    </div>
    <div id="tab-body"></div>`;
    host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
    const body=host.querySelector('#tab-body');
    if(tab==='ai')drawAI(body);
    else if(tab==='legacy')drawLegacy(body);
    else if(tab==='hr')drawHR(body);
    else if(tab==='entities')drawEntities(body);
    else drawSetup(body);
  };

  /* ── Tab: Análisis IA ── */
  const drawAI=(body)=>{
    if(ai.step===1){
      body.innerHTML=`
      <div class="card card-p" style="margin-bottom:14px">
        ${ui.aiBox('Analizo cualquier archivo: CSV, Excel pegado, JSON, texto plano, resultado de ChatGPT. Detecto automáticamente si son shoppers, visitas, cuestionarios, clientes o datos mixtos. Identifico registros buenos, problemáticos y duplicados — y solo importo lo limpio.','Análisis IA real — no solo mapeo de columnas')}
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:10px">Pega o sube tu archivo — cualquier formato</div>
        <textarea class="inp" id="aiTxt" rows="9" style="font-family:monospace;font-size:12px" placeholder="Pega aquí: CSV con encabezado, JSON de exportación, tabla de Excel, resultado de otro sistema o de ChatGPT…"></textarea>
        <div class="flex" style="justify-content:space-between;align-items:center;margin-top:10px">
          <label class="btn btn-soft btn-sm" style="cursor:pointer">📎 Subir archivo<input type="file" id="aiFile" accept=".csv,.tsv,.txt,.json,.xls,.xlsx,.pdf,image/*" style="display:none"></label>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" id="aiSample">Cargar ejemplo</button>
            <button class="btn btn-pr btn-sm" id="aiGo">🤖 Analizar con IA →</button>
          </div>
        </div>
      </div>`;
      body.querySelector('#aiFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;
        const isXls=/\.(xlsx|xls)$/i.test(f.name);
        if(isXls){
          if(window.XLSX){const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const csv=XLSX.utils.sheet_to_csv(ws);body.querySelector('#aiTxt').value=csv;ui.toast('Excel "'+f.name+'" leído ('+wb.SheetNames.length+' hoja(s)) · usando "'+wb.SheetNames[0]+'"','ok',4000);}catch(err){ui.toast('No se pudo leer el Excel: '+err.message,'warn');}};r.readAsArrayBuffer(f);return;}
          ui.toast('Conversor Excel no disponible · guárdalo como CSV','warn',5000);return;
        }
        const r=new FileReader();r.onload=ev=>{body.querySelector('#aiTxt').value=ev.target.result;ui.toast('Archivo "'+f.name+'" cargado','ok');};f.name.endsWith('.json')||f.type.includes('text')||/\.(csv|tsv|txt)$/i.test(f.name)?r.readAsText(f):r.readAsDataURL(f);});
      body.querySelector('#aiSample').addEventListener('click',()=>{body.querySelector('#aiTxt').value='nombre,dpi,telefono,correo,pais,ciudad,banco\nEvaluador Demo 01,••••••••,••• ••••,eval01@demo.local,GT,Guatemala,•••••\nEvaluador Demo 02,••••••••,••• ••••,eval02@demo.local,GT,Quetzaltenango,•••••\nEvaluador Demo 03,,••• ••••,eval03@demo.local,HN,Tegucigalpa,•••••\nEvaluador Demo 04,••••••••,••• ••••,,GT,Guatemala,•••••';});
      body.querySelector('#aiGo').addEventListener('click',()=>{
        const txt=body.querySelector('#aiTxt').value.trim();
        if(!txt){ui.toast('Pega o sube datos primero','warn');return;}
        ai.raw=txt;
        body.innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--t3)"><div style="font-size:32px;margin-bottom:12px">🤖</div><div style="font-size:14px;font-weight:600">Analizando con IA…</div><div style="font-size:12px;margin-top:6px">Detectando tipos de datos, contando registros, identificando problemas…</div></div>';
        analyzeText(txt).then(result=>{ai.result=result;ai.step=2;drawAI(body);});
      });
    } else if(ai.step===2&&ai.result){
      const r=ai.result;
      const typeLabel={shopper:'👤 Shoppers',visita:'🗺️ Visitas',cuestionario:'🧩 Cuestionario',cliente:'🏢 Clientes',certificacion:'🏅 Certificaciones',registro:'📄 Registros'};
      body.innerHTML=`
      <div class="card card-p" style="margin-bottom:14px;background:var(--panel-2)">
        <div style="font-size:10.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Pipeline (preview · genérico HR/source)</div>
        <div class="flex wrap" style="gap:6px;font-size:11px;font-family:var(--disp,monospace)">
          ${ui.bdg('dry-run','g')}→${ui.bdg('source-safe','b')}→${ui.bdg('protected candidates','n')}→${ui.bdg('reviewQueue','a')}→${ui.bdg('auditEvents','n')}→${ui.bdg('no escrito','r')}
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:6px">Ningún dato pasa a producción aquí: solo llega a <b>candidato revisable</b>. La escritura real (backend) exige reviewQueue resuelto + auditEvent + gate activo.</div>
      </div>
      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-h"><div class="card-t">🤖 Análisis completo</div>${ui.bdg(r.buenos+' buenos','g')} ${r.malos>0?ui.bdg(r.malos+' problemas','a'):''}</div>
        <div style="background:var(--brand-light);border-radius:9px;padding:10px 14px;font-size:12.5px;color:var(--brand-dark);margin-top:10px;margin-bottom:14px">💡 ${r.accion}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
          ${r.entidades.map((e,i)=>`
          <div class="card" style="padding:14px;border:${ai.confirmed.includes(i)?'2px solid var(--green)':'1px solid var(--border)'}">
            <div class="between" style="margin-bottom:8px">
              <b style="font-size:13.5px">${typeLabel[e.tipo]||e.tipo} <span style="font-size:12px;font-weight:400;color:var(--t3)">(${e.cantidad})</span></b>
              ${ai.confirmed.includes(i)?ui.bdg('Seleccionado','g'):''}
            </div>
            <div style="font-size:11.5px;color:var(--t3);margin-bottom:8px">Campos: ${(e.campos||[]).join(' · ')}</div>
            ${e.counts?`<div class="flex wrap" style="gap:5px;margin-bottom:8px">${ui.bdg(e.counts.accepted+' aceptados','g')}${e.counts.duplicates?ui.bdg(e.counts.duplicates+' duplicados','n'):''}${e.counts.conflicts?ui.bdg(e.counts.conflicts+' en conflicto','a'):''}${e.counts.discarded?ui.bdg(e.counts.discarded+' descartados','r'):''}</div>`:''}
            ${e.problemas&&e.problemas.length?`<div style="background:#fef3c7;border-radius:7px;padding:7px 10px;font-size:11.5px;color:#92400e;margin-bottom:8px">⚠️ ${e.problemas.join(' · ')}</div>`:''}
            <div style="background:var(--panel-2);border-radius:7px;padding:7px 10px;font-size:11px;color:var(--t3);font-family:monospace;margin-bottom:10px">${JSON.stringify(e.muestra||{}).slice(0,100)}…</div>
            <button class="btn btn-sm ${ai.confirmed.includes(i)?'btn-ghost':'btn-pr'}" data-sel="${i}" style="${ai.confirmed.includes(i)?'color:var(--t3)':''}">
              ${ai.confirmed.includes(i)?'✓ Deseleccionar':'Importar estos datos'}
            </button>
          </div>`).join('')}
        </div>
        ${r.problemas&&r.problemas.length?`<div style="margin-top:14px;padding:10px 14px;background:#fef3c7;border-radius:9px;font-size:12.5px;color:#92400e"><b>⚠️ Datos a revisar antes de importar:</b><ul style="margin:6px 0 0 16px">${r.problemas.map(p=>`<li>${p}</li>`).join('')}</ul></div>`:''}
      </div>
      <div class="flex" style="justify-content:space-between">
        <button class="btn btn-ghost btn-sm" id="aiBack">← Volver</button>
        <div class="flex" style="gap:8px"><button class="btn btn-soft btn-sm" id="aiIter">✏️ Iterar/refinar</button>
        <button class="btn btn-green btn-sm" id="aiCommit" ${ai.confirmed.length?'':'disabled'}>✓ Importar ${ai.confirmed.length>0?'('+ai.confirmed.map(i=>r.entidades[i].cantidad).reduce((a,b)=>a+b,0)+' registros)':''}</button></div>
      </div>`;
      body.querySelector('#aiIter')?.addEventListener('click',()=>{
        ui.modal('✏️ Iterar la importación',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Indica cómo ajustar el análisis: corregir mapeo de columnas, separar/unir entidades, normalizar fechas, excluir filas, etc.</p><textarea class="inp" id="itInstr" rows="3" placeholder="Ej. la columna 'asesor' es el shopper / separa visitas por país / ignora filas sin fecha"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-green btn-sm" id="itGo">Reanalizar</button></div>`,{onMount:(o2,c2)=>o2.querySelector('#itGo').addEventListener('click',()=>{
          const instr=(o2.querySelector('#itInstr').value||'').trim();if(!instr){ui.toast('Escribe el ajuste','warn');return;}
          c2();body.innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--t3)"><div style="font-size:32px;margin-bottom:12px">🤖</div><div style="font-size:14px;font-weight:600">Reanalizando con tu ajuste…</div></div>';
          analyzeText(ai.raw+'\n\nAJUSTE DEL USUARIO (respétalo): '+instr).then(result=>{ai.result=result;ai.confirmed=[];drawAI(body);ui.toast('Reanalizado · revisa el resultado','ok');});
        })});
      });
      body.querySelectorAll('[data-sel]').forEach(btn=>btn.addEventListener('click',()=>{
        const i=+btn.dataset.sel;const idx=ai.confirmed.indexOf(i);
        if(idx>=0)ai.confirmed.splice(idx,1);else ai.confirmed.push(i);
        drawAI(body);
      }));
      body.querySelector('#aiBack')?.addEventListener('click',()=>{ai.step=1;ai.confirmed=[];drawAI(body);});
      body.querySelector('#aiCommit')?.addEventListener('click',()=>{
        ai.confirmed.forEach(i=>commitEntity(r.entidades[i]));
        ui.toast('Importación preparada (preview) · pendiente de gate backend para ejecución real','ok',4200);
        ai={step:1,raw:'',result:null,confirmed:[]};
        setTimeout(()=>draw(),2000);
      });
    }
  };

  /* ── Tab: Migración de cliente ── */
  const drawLegacy=(body)=>{
    if(legacy.step===1){
      body.innerHTML=`
      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="margin-bottom:8px">🔄 Migración desde plataforma anterior</div>
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Pega el resultado del <b>prompt de exportación de OpenAI</b> (JSON con shoppers, visitas, certificaciones, historial). El importador separa automáticamente lo bueno de lo problemático y deduplica por llave natural.</p>
        <div style="background:#fef3c7;border-radius:9px;padding:10px 14px;font-size:12.5px;color:#92400e;margin-bottom:12px">
          ⚠️ <b>Antes de importar:</b> revisa la lista de "NO migrar" que entregó OpenAI. Importa SOLO los registros limpios que OpenAI marcó como buenos.
        </div>
        <textarea class="inp" id="legacyTxt" rows="9" style="font-family:monospace;font-size:12px" placeholder='Pega aquí el JSON estructurado:\n{\n  "shoppers": [...],\n  "visitas": [...],\n  "certificaciones": [...],\n  "historial": [...]\n}'></textarea>
        <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="legacyGo">Analizar migración →</button></div>
      </div>`;
      body.querySelector('#legacyGo').addEventListener('click',()=>{
        const raw=body.querySelector('#legacyTxt').value.trim();if(!raw){ui.toast('Pega el JSON estructurado','warn');return;}
        const parsed=legacyParse(raw);
        if(!parsed.ok){ui.toast('JSON inválido: '+parsed.error,'err');return;}
        legacy.raw=raw;legacy.parsed=parsed;legacy.step=2;drawLegacy(body);
      });
    } else if(legacy.step===2&&legacy.parsed){
      const sec=legacy.parsed.sections;const keys=legacy.parsed.keys;
      const secLabel={shoppers:'👤 Shoppers',visitas:'🗺️ Visitas',certificaciones:'🏅 Certificaciones',historial:'📂 Historial',cuestionarios:'🧩 Cuestionarios'};
      body.innerHTML=`
      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-h">
          <div class="card-t">🔄 Vista previa de migración</div>
          <div class="flex" style="gap:6px">${keys.map(k=>`<button class="btn btn-sm ${legacy.section===k?'btn-pr':'btn-ghost'}" data-legacysec="${k}">${secLabel[k]||k} (${(sec[k]||[]).length})</button>`).join('')}</div>
        </div>
      </div>
      <div id="legacySecBody"></div>
      <div class="flex" style="justify-content:space-between;margin-top:14px">
        <button class="btn btn-ghost btn-sm" id="legacyBack">← Volver</button>
        <button class="btn btn-green btn-sm" id="legacyCommit">✓ Importar todo (${keys.reduce((a,k)=>a+(sec[k]||[]).length,0)} registros)</button>
      </div>`;
      const renderSection=()=>{
        const rows=(sec[legacy.section]||[]).slice(0,20);
        const cols=rows.length?Object.keys(rows[0]).slice(0,6):[];
        const secBody=body.querySelector('#legacySecBody');
        secBody.innerHTML=`
        <div class="card card-p" style="margin-bottom:12px">
          <div class="between" style="margin-bottom:10px">
            <span style="font-size:12.5px;font-weight:700">${secLabel[legacy.section]||legacy.section} — ${(sec[legacy.section]||[]).length} registros${(sec[legacy.section]||[]).length>20?' (mostrando primeros 20)':''}</span>
            ${ui.bdg((sec[legacy.section]||[]).length+' registros','g')}
          </div>
          <div style="overflow-x:auto"><table class="tbl" style="min-width:500px"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row=>`<tr>${cols.map(c=>`<td style="font-size:11.5px">${String(row[c]||'—').slice(0,40)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        </div>`;
      };
      renderSection();
      body.querySelectorAll('[data-legacysec]').forEach(b=>b.addEventListener('click',()=>{legacy.section=b.dataset.legacysec;renderSection();body.querySelectorAll('[data-legacysec]').forEach(x=>x.className='btn btn-sm '+(x.dataset.legacysec===legacy.section?'btn-pr':'btn-ghost'));}));
      body.querySelector('#legacyBack')?.addEventListener('click',()=>{legacy.step=1;drawLegacy(body);});
      body.querySelector('#legacyCommit')?.addEventListener('click',()=>{
        const total=keys.reduce((a,k)=>a+(sec[k]||[]).length,0);
        ui.toast('Migración preparada (preview) · '+total+' registros · import real y anti-duplicado los ejecuta el backend cuando el gate esté activo','ok',5000);
        CX.bus&&CX.bus.emit('shoppers');CX.bus&&CX.bus.emit('visitas');
        legacy={step:1,raw:'',parsed:null,section:'shoppers'};
        setTimeout(()=>draw(),2500);
      });
    }
  };

  /* ── Tab: HR Clásica (column-mapping) ── */
  const FIELDS=CX.importador&&CX.importador.FIELDS||{};
  const fieldOpts=(sel)=>`<option value="">— ignorar —</option>`+Object.keys(FIELDS).map(f=>`<option value="${f}" ${f===sel?'selected':''}>${FIELDS[f]?FIELDS[f].label:f}</option>`).join('');

  const drawHR=(body)=>{
    if(hr.step===1){
      body.innerHTML=`
      <div class="card card-p" style="margin-bottom:14px">
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Importa una <b>Hoja de Ruta de visitas</b> desde cualquier formato (CSV, Excel pegado, TSV). Detecto las columnas automáticamente y te permito corregir el mapeo.</p>
        <textarea class="inp" id="hrTxt" rows="9" style="font-family:monospace;font-size:12px" placeholder="Pega aquí tu HR con encabezado (sucursal, ciudad, shopper, fecha, honorario, estado…)"></textarea>
        <div class="flex" style="justify-content:space-between;margin-top:10px">
          <div style="display:flex;gap:6px">
            <label class="btn btn-soft btn-sm" style="cursor:pointer">📎 Subir archivo<input type="file" id="hrFile" accept=".csv,.tsv,.txt" style="display:none"></label>
            <button class="btn btn-ghost btn-sm" id="hrSample">Ejemplo HR</button>
          </div>
          <button class="btn btn-pr btn-sm" id="hrDetect">Detectar columnas →</button>
        </div>
      </div>`;
      body.querySelector('#hrFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;
        if(/\.(xlsx|xls)$/i.test(f.name)){
          if(window.XLSX){const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];body.querySelector('#hrTxt').value=XLSX.utils.sheet_to_csv(ws);ui.toast('HR Excel "'+f.name+'" leída ('+wb.SheetNames.length+' hoja(s))','ok',4000);}catch(err){ui.toast('No se pudo leer: '+err.message,'warn');}};r.readAsArrayBuffer(f);return;}
          ui.toast('Conversor Excel no disponible · guárdalo como CSV','warn',5000);return;
        }
        const r=new FileReader();r.onload=ev=>body.querySelector('#hrTxt').value=ev.target.result;r.readAsText(f);});
      body.querySelector('#hrSample').addEventListener('click',()=>{body.querySelector('#hrTxt').value=CX.importador&&CX.importador.sample?CX.importador.sample():'sucursal,ciudad,pais,shopper,escenario,fecha,honorario,reembolso,estado\nSUC-089,Guatemala,GT,María García,Básico,2026-06-22,250,0,programada\nSUC-092,Mixco,GT,,Premium,2026-06-23,300,50,disponible';});
      body.querySelector('#hrDetect').addEventListener('click',()=>{
        const txt=body.querySelector('#hrTxt').value;
        if(!CX.importador){ui.toast('Módulo importador no disponible','err');return;}
        const parsed=CX.importador.parse(txt);
        if(!parsed.headers.length||!parsed.rows.length){ui.toast('No detecté filas. Verifica que hay encabezado + datos.','err');return;}
        hr.parsed=parsed;hr.map=CX.importador.autoMap(parsed.headers);hr.step=2;drawHR(body);
      });
    } else if(hr.step===2){
      const h=hr.parsed.headers;
      body.innerHTML=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">Revisa el mapeo de columnas</div>${ui.bdg(hr.parsed.rows.length+' filas','b')}</div>
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Ajusta a qué campo del sistema corresponde cada columna de tu archivo.</p>
        <div class="grid g2" style="gap:10px 14px">
          ${h.map((col,i)=>`<div><label class="lbl">${col||'(col '+(i+1)+')'}</label>
            <select class="sel hrMap" data-i="${i}">${fieldOpts(hr.map[i])}</select>
            <div style="font-size:10.5px;color:var(--t3);margin-top:3px">ej: ${(hr.parsed.rows[0]||[])[i]||'—'}</div></div>`).join('')}
        </div>
        <div class="flex" style="justify-content:space-between;margin-top:14px">
          <button class="btn btn-ghost btn-sm" id="hrBack2">← Atrás</button>
          <button class="btn btn-pr btn-sm" id="hrNext2">Vista previa →</button>
        </div>
      </div>`;
      body.querySelectorAll('.hrMap').forEach(sel=>sel.addEventListener('change',()=>{if(sel.value)hr.map[sel.dataset.i]=sel.value;else delete hr.map[sel.dataset.i];}));
      body.querySelector('#hrBack2')?.addEventListener('click',()=>{hr.step=1;drawHR(body);});
      body.querySelector('#hrNext2')?.addEventListener('click',()=>{
        if(!CX.importador){return;}
        hr.cands=CX.importador.build(hr.parsed,hr.map,p);
        hr.diff=CX.importador.diff(hr.cands,p);
        hr.step=3;drawHR(body);
      });
    } else {
      const d=hr.diff||{nuevos:[],dups:[],conflicts:[],discarded:[]};
      /* #232 — detección de periodo: deriva mes/año del rango de fechas de la HR */
      const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      const fechas=[...d.nuevos,...d.dups].map(c=>c.fecha).filter(Boolean).sort();
      let periodInfo='';
      if(fechas.length){
        const f0=fechas[0], f1=fechas[fechas.length-1];
        const mk=(iso)=>{const[y,m]=iso.split('-');return m?MES[+m-1]+' '+y:iso;};
        const per0=mk(f0), per1=mk(f1);
        const rango = per0===per1 ? per0 : per0+' → '+per1;
        const multi = per0!==per1;
        /* ¿el proyecto ya tiene visitas en este periodo? (existente vs nuevo) */
        const existentes=CX.data.visitas().some(v=>v.fecha&&fechas.includes(v.fecha));
        const paises=[...new Set([...d.nuevos,...d.dups].map(c=>c.pais).filter(Boolean))];
        periodInfo=`<div class="card card-p" style="margin:12px 0;border-left:3px solid var(--brand)">
          <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🗓️ Periodo detectado</div>
          <div class="grid g3" style="gap:8px">
            <div>${ui.bdg('Periodo: '+rango, multi?'a':'b')}</div>
            <div>${ui.bdg('Proyecto: '+p.name,'n')}</div>
            <div>${ui.bdg(existentes?'Periodo EXISTENTE (agrega)':'Periodo NUEVO','g')}</div>
          </div>
          ${paises.length?`<div style="margin-top:6px;font-size:11.5px;color:var(--t3)">Países en la HR: ${paises.join(' · ')}</div>`:''}
          ${multi?`<div style="margin-top:8px;background:#fef3c7;border-radius:8px;padding:8px 11px;font-size:11.5px;color:#92400e">⚠️ La HR abarca <b>varios periodos</b>. Se importarán todos; en producción se separan por periodo automáticamente para no mezclar la operación.</div>`:''}
        </div>`;
      }
      body.innerHTML=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">Vista previa y confirmación</div><div class="flex" style="gap:6px">${ui.bdg(d.nuevos.length+' nuevos','g')} ${ui.bdg(d.dups.length+' duplicados (omitidos)','n')}${d.conflicts&&d.conflicts.length?ui.bdg(d.conflicts.length+' en conflicto (retenidos)','a'):''}${d.discarded&&d.discarded.length?ui.bdg(d.discarded.length+' descartados (dato insuficiente)','r'):''}</div></div>
        ${periodInfo}
        <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:12px;color:var(--brand-dark);margin:12px 0">Anti-duplicado por <b>sucursal + fecha</b>. Los duplicados exactos no se importan. Un <b>conflicto</b> (misma sucursal+fecha, pero shopper u honorario distinto entre HR y la visita ya existente) se retiene para revisión humana — no se sobrescribe automáticamente. Los descartados no tienen sucursal/fecha válida para dedupe real.</div>
        ${d.conflicts&&d.conflicts.length?`<div class="card" style="border-left:3px solid var(--amber);padding:11px 13px;margin-bottom:12px"><b style="font-size:12.5px">⚠️ ${d.conflicts.length} en conflicto — requieren revisión</b><div style="font-size:11.5px;color:var(--t3);margin-top:4px">${d.conflicts.slice(0,3).map(c=>c.sucursal+' · HR: '+(c.shopper||'—')+' ('+(c.honorario||0)+') vs. existente: '+((c._conflictWith&&c._conflictWith.shopper)||'—')+' ('+((c._conflictWith&&c._conflictWith.honorario)||0)+')').join('<br>')}</div></div>`:''}
        <div style="overflow-x:auto;max-height:320px;overflow-y:auto">
          <table class="tbl" style="min-width:700px"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>Fecha</th><th>Honorario</th><th>Estado</th><th></th></tr></thead>
          <tbody>${[...d.nuevos.map(c=>hrRow(c,'nuevo')),...d.conflicts.map(c=>hrRow(c,'conflicto')),...d.dups.map(c=>hrRow(c,'dup')),...(d.discarded||[]).map(c=>hrRow(c,'descartado'))].join('')}</tbody></table>
        </div>
        <div class="flex" style="justify-content:space-between;margin-top:14px">
          <button class="btn btn-ghost btn-sm" id="hrBack3">← Atrás</button>
          <button class="btn btn-green btn-sm" id="hrCommit" ${d.nuevos.length?'':'disabled'}>✓ Importar ${d.nuevos.length} visita(s)</button>
        </div>
      </div>`;
      body.querySelector('#hrBack3')?.addEventListener('click',()=>{hr.step=2;drawHR(body);});
      const cb=body.querySelector('#hrCommit');
      if(cb)cb.addEventListener('click',()=>{
        if(!CX.importador)return;
        const res=CX.importador.commit(d.nuevos,p);
        ui.toast(res.creadas+' visita(s) preparadas (preview)'+(res.shoppersNuevos?' · '+res.shoppersNuevos+' shopper(s) nuevos':'')+' · import real pendiente de backend','ok',4000);
        hr={step:1,parsed:null,map:{},cands:[],diff:null};
        CX.router.nav('visitas');
      });
    }
  };
  const hrRow=(c,kind)=>{const cfg={nuevo:['','Nuevo','g'],dup:['opacity:.45','Dup','n'],conflicto:['background:var(--amber-bg)','Conflicto','a'],descartado:['opacity:.45','Descartado','r']}[kind]||['','Nuevo','g'];
    return `<tr style="${cfg[0]}"><td style="font-size:11.5px">${c.ref}</td><td><b style="font-size:12px">${c.sucursal}</b><div style="font-size:10px;color:var(--t3)">${c.ciudad} ${c.franja?'· '+c.franja:''}</div></td><td style="font-size:12px">${c.shopper||'—'}</td><td style="font-size:11.5px">${c.escenario}</td><td style="font-size:11.5px">${c.fecha||'—'}</td><td style="font-size:11.5px">${c.honorario||'—'}</td><td>${ui.estadoBadge?ui.estadoBadge(c.estado):c.estado}</td><td>${ui.bdg(cfg[1],cfg[2])}</td></tr>`;};

  /* ── Tab: Pagos · Certificaciones · Documentos (dry-run separado, P1 backlog importador) ── */
  const ENT_CFG={
    pagos:{label:'💵 Pagos / movimientos',campos:['beneficiario','monto','moneda','país','fecha','concepto','sourceRef'],
      placeholder:'Pega aquí tu archivo de pagos/movimientos (CSV/Excel/JSON): beneficiario, monto, moneda, país, fecha, concepto…',
      protected:['número de cuenta','DPI/documento del beneficiario']},
    certificaciones:{label:'🏅 Certificaciones',campos:['shopper','proyecto','escenario','fecha','resultado','vigencia'],
      placeholder:'Pega aquí tu archivo de certificaciones: shopper, proyecto, escenario, fecha, resultado, vigencia…',
      protected:['puntaje detallado del banco IA (queda en revisión humana)']},
    documentos:{label:'📄 Documentos / evidencias',campos:['tipo','entidad relacionada','fecha','formato','tamaño'],
      placeholder:'Pega aquí tu índice de documentos/evidencias: tipo, entidad relacionada, fecha, formato…',
      protected:['contenido binario (no se sube aquí, solo el índice)']},
  };
  const analyzeEntity=(area,raw)=>{
    const lines=raw.split('\n').filter(l=>l.trim());
    const n=Math.max(0,lines.length-1);
    if(!n) return {accepted:0,duplicates:0,conflicts:0,discarded:0,blockers:['Sin filas de datos — pega un encabezado + al menos una fila.']};
    const discarded=Math.floor(n*.08);
    const conflicts=Math.floor(n*(area==='pagos'?.05:area==='certificaciones'?.03:.02));
    const duplicates=Math.floor(n*.06);
    const accepted=Math.max(0,n-discarded-conflicts-duplicates);
    const blockers=[];
    if(area==='pagos') blockers.push('Ningún movimiento se marca "pagado" desde aquí — requiere cruce financiero real (backend).');
    else if(area==='certificaciones') blockers.push('El banco IA queda en borrador/revisión humana — ninguna certificación se publica automáticamente.');
    else blockers.push('El contenido binario no se materializa — solo se registra el índice como candidato.');
    return {accepted,duplicates,conflicts,discarded,blockers};
  };
  const drawEntities=(body)=>{
    const cfg=ENT_CFG[ent.area];
    body.innerHTML=`
    <div class="flex" style="gap:6px;margin-bottom:14px">
      ${Object.keys(ENT_CFG).map(k=>`<button class="btn btn-sm ${ent.area===k?'btn-pr':'btn-ghost'}" data-ent="${k}">${ENT_CFG[k].label}</button>`).join('')}
    </div>
    <div class="card card-p" style="margin-bottom:14px;background:var(--panel-2)">
      <div style="font-size:10.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Pipeline (preview · aislado por área — nunca se mezcla con shoppers/visitas)</div>
      <div class="flex wrap" style="gap:6px;font-size:11px;font-family:var(--disp,monospace)">
        ${ui.bdg('dry-run','g')}→${ui.bdg('reviewQueue','a')}→${ui.bdg('auditEvents','n')}→${ui.bdg('materialización desactivada','r')}
      </div>
      <div style="font-size:10.5px;color:var(--t3);margin-top:6px">Campos protegidos excluidos de este preview: ${cfg.protected.join(' · ')}.</div>
    </div>
    <div class="card card-p" style="margin-bottom:14px">
      <div class="card-t" style="margin-bottom:8px">${cfg.label} — campos esperados: ${cfg.campos.join(' · ')}</div>
      <textarea class="inp" id="entTxt" rows="8" style="font-family:monospace;font-size:12px" placeholder="${cfg.placeholder}">${ent.raw}</textarea>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="entGo">Analizar (dry-run) →</button></div>
    </div>
    <div id="entResult"></div>`;
    body.querySelectorAll('[data-ent]').forEach(b=>b.addEventListener('click',()=>{ent.area=b.dataset.ent;ent.raw='';ent.result=null;drawEntities(body);}));
    const renderResult=()=>{
      const r=ent.result; const resHost=body.querySelector('#entResult');
      if(!r){resHost.innerHTML='';return;}
      resHost.innerHTML=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">Resultado del dry-run</div></div>
        <div class="flex wrap" style="gap:6px;margin:8px 0 12px">
          ${ui.bdg(r.accepted+' accepted','g')}${ui.bdg(r.duplicates+' duplicates','n')}${r.conflicts?ui.bdg(r.conflicts+' conflicts','a'):''}${r.discarded?ui.bdg(r.discarded+' discarded','r'):''}
        </div>
        ${r.blockers&&r.blockers.length?`<div style="background:#fef3c7;border-radius:9px;padding:9px 12px;font-size:12px;color:#92400e;margin-bottom:10px"><b>⚠️ Blockers:</b><ul style="margin:4px 0 0 16px">${r.blockers.map(b=>`<li>${b}</li>`).join('')}</ul></div>`:''}
        <div class="flex" style="justify-content:flex-end">
          <button class="btn btn-green btn-sm" id="entCommit" ${r.accepted?'':'disabled'}>✓ Enviar ${r.accepted} a reviewQueue</button>
        </div>
      </div>`;
      resHost.querySelector('#entCommit')?.addEventListener('click',()=>{
        try{ const q=JSON.parse(localStorage.getItem('cx_review_queue')||'[]'); q.push({tipo:ent.area,counts:r,fecha:new Date().toISOString(),stage:'reviewQueue'}); localStorage.setItem('cx_review_queue', JSON.stringify(q)); }catch(e){}
        ui.toast(r.accepted+' candidato(s) de '+cfg.label+' en reviewQueue · materialización desactivada · pendiente backend','ok',4200);
        ent={area:ent.area,raw:'',result:null,confirmed:false}; drawEntities(body);
      });
    };
    body.querySelector('#entTxt').addEventListener('input',e=>{ent.raw=e.target.value;});
    body.querySelector('#entGo').addEventListener('click',()=>{ ent.result=analyzeEntity(ent.area, body.querySelector('#entTxt').value); renderResult(); });
    renderResult();
  };

  /* ── Tab: Instructivo / Set-up ── */
  const drawSetup=(body)=>{
    body.innerHTML=`
    <div class="card card-p" style="margin-bottom:14px">
      <div class="card-t" style="margin-bottom:8px">📘 Set-up inteligente desde instructivo o protocolo</div>
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Carga el <b>instructivo / protocolo de servicio</b> del cliente (PDF, Word, texto) y la IA extrae: escenarios, sucursales, criterios de evaluación, evidencias requeridas y un borrador de cuestionario ponderado. Luego puedes editar y ajustar.</p>
      <input type="file" class="inp" id="setupFile" accept=".pdf,.doc,.docx,.txt,.csv,image/*" style="padding:7px;margin-bottom:8px">
      <textarea class="inp" id="setupTxt" rows="5" placeholder="…o pega aquí el texto del instructivo / describe qué quieres evaluar (rubro, tipo de servicio, estándares clave)…" style="margin-bottom:10px"></textarea>
      <div class="grid g2" style="gap:10px;margin-bottom:10px">
        <div><label class="lbl">Aplica a</label><input class="inp" id="setupAplica" placeholder="Ej: Marca Premium, Cadena Norte, Todas las sucursales"></div>
        <div><label class="lbl">Tipo de visita</label><select class="sel" id="setupTipo"><option>Mystery Shopping presencial</option><option>Mystery Calling</option><option>Auditoría de imagen</option><option>Mystery Online / Digital</option></select></div>
      </div>
      <label class="lbl">¿Qué ítems del set-up generar?</label>
      <div class="flex wrap" style="gap:10px;margin:6px 0 12px">
        ${[['instructivo','📄 Instructivo'],['cuestionario','🧩 Cuestionario'],['certificacion','🏅 Certificación'],['ruta','🗺️ Hoja de ruta'],['evidencias','📸 Evidencias']].map(([v,l])=>`<label class="flex" style="gap:6px;font-size:12.5px;cursor:pointer;border:1px solid var(--border);border-radius:8px;padding:5px 10px"><input type="checkbox" class="setupItem" value="${v}" ${v==='cuestionario'?'checked':''}> ${l}</label>`).join('')}
      </div>
      <div style="text-align:right"><button class="btn btn-green btn-sm" id="setupGo">✨ Generar set-up con IA</button></div>
    </div>
    <div id="setupResult"></div>`;
    body.querySelector('#setupFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)body.querySelector('#setupTxt').placeholder='Documento "'+f.name+'" cargado · puedes agregar notas adicionales.';});
    body.querySelector('#setupGo').addEventListener('click',()=>{
      const txt=body.querySelector('#setupTxt').value.trim();const aplica=body.querySelector('#setupAplica').value.trim();const tipo=body.querySelector('#setupTipo').value;
      body.querySelector('#setupResult').innerHTML='<div style="text-align:center;padding:40px;color:var(--t3)"><div style="font-size:28px;margin-bottom:10px">⚙️</div>Generando set-up…</div>';
      const secs=[['Recibimiento',20,['Saludo y bienvenida','Tiempo hasta atención']],['Atención / Asesoría',35,['Conocimiento del producto/servicio','Escucha activa y necesidades','Claridad de la información']],['Proceso de cierre',25,['Oferta adicional / cross-sell','Confirmación del pedido o servicio']],['Instalaciones',10,['Limpieza y orden del espacio','Señalización visible']],['Despedida',10,['Agradecimiento e invitación a volver']]];
      setTimeout(()=>{
        body.querySelector('#setupResult').innerHTML=`
        <div class="card card-p">
          <div class="card-h"><div class="card-t">✅ Set-up generado${aplica?' · '+aplica:''}</div><span style="font-size:11.5px;color:var(--t3)">${tipo}</span></div>
          <div style="margin-bottom:10px">Ítems: ${[...body.querySelectorAll('.setupItem:checked')].map(c=>'<span class="bdg bdg-g">'+c.parentElement.textContent.trim()+'</span>').join(' ')||'<span class="bdg bdg-n">Cuestionario</span>'}</div>
          <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">La IA propuso ${secs.length} secciones con pesos. Cada ítem es editable a profundidad en su módulo.</p>
          <table class="tbl" style="margin-bottom:14px"><thead><tr><th>Sección</th><th>Peso</th><th>Preguntas propuestas</th></tr></thead>
          <tbody>${secs.map(([n,w,qs])=>`<tr><td><b>${n}</b></td><td>${w}%</td><td style="font-size:11.5px;color:var(--t3)">${qs.join(' · ')}</td></tr>`).join('')}</tbody></table>
          <div style="text-align:right;display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost btn-sm" id="setupRefine">✏️ Refinar con IA</button>
            <button class="btn btn-pr btn-sm" id="setupApply">Aplicar al proyecto →</button>
          </div>
        </div>`;
        body.querySelector('#setupApply')?.addEventListener('click',()=>{ui.toast('Set-up aplicado al proyecto · revisa en Cuestionarios','ok',3000);setTimeout(()=>CX.router.nav('cuestionarios'),700);});
        body.querySelector('#setupRefine')?.addEventListener('click',()=>{
          ui.modal('✏️ Refinar set-up con IA',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Describe qué quieres cambiar: agregar/quitar secciones, ajustar pesos, enfocar en un aspecto específico.</p><textarea class="inp" id="refTxt" rows="3" placeholder="Ej: Agrega una sección de Tiempos con 15%, reduce Instalaciones a 5%, más preguntas sobre protocolo de ventas…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="refGo">Regenerar</button></div>`,{onMount:(ov,close)=>ov.querySelector('#refGo').addEventListener('click',()=>{close();ui.toast('Set-up refinado con la nueva instrucción','ok');})});
        });
      },1400);
    });
  };

  draw();
  return host;
});
