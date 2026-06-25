/* ============================================================
   CXOrbia · Centro de Aprendizaje (inteligente, genérico)
   - Admin: crea bloques/cursos, carga material externo, genera
     recursos con IA (resúmenes/infografías/quiz), arma exámenes.
   - Shopper: toma cursos, registra avance y rinde examen.
   - Persistente por proyecto + por shopper. White-label.
   ============================================================ */
window.CX = window.CX || {};

CX.learnStore = {
  _c:{}, _prog:{},
  _seed(pid){
    return [
      {id:'c1',ic:'🎓',titulo:'Inducción del evaluador',desc:'Qué es mystery shopping, ética y confidencialidad.',mins:25,recursos:[{t:'doc',n:'Manual de inducción'},{t:'video',n:'Bienvenida (4 min)'}],quiz:[{q:'¿Puedes revelar que eres evaluador?',o:['Sí','No'],a:1}]},
      {id:'c2',ic:'🛒',titulo:'Protocolo de compra incógnita',desc:'Pasos del escenario y cómo no ser detectado.',mins:18,recursos:[{t:'doc',n:'Protocolo paso a paso'}],quiz:[]},
      {id:'c3',ic:'📸',titulo:'Evidencia y fotografía',desc:'Tipos de evidencia válida y geolocalización.',mins:12,recursos:[{t:'doc',n:'Guía de evidencias'}],quiz:[]},
      {id:'ct1',ic:'⚙️',titulo:'[INTERNO] Configurar la plataforma',desc:'Crear clientes, proyectos y set-up con IA. Solo equipo de la consultora.',mins:20,recursos:[{t:'doc',n:'Flujo: cliente → proyecto → HR → cuestionario'},{t:'doc',n:'Checklist de adaptación a nuevo cliente'}],quiz:[],interno:true},
      {id:'ct2',ic:'🔧',titulo:'[INTERNO] Backend y migración',desc:'Firebase, Gemini, Make, migración de datos. Solo técnicos.',mins:30,recursos:[{t:'doc',n:'HANDOFF-DESARROLLO.md'},{t:'doc',n:'Importador y deduplicación'}],quiz:[],interno:true},
      {id:'ct3',ic:'🎬',titulo:'[INTERNO] Demo comercial y HeyGen',desc:'Guion del recorrido en vivo y producción de videos con HeyGen.',mins:15,recursos:[{t:'doc',n:'GUION-DEMO-Y-VENTAJAS.md'},{t:'doc',n:'GUION-HEYGEN-POR-MODULO.md'}],quiz:[],interno:true},
    ];
  },
  courses(pid){ pid=pid||CX.data.currentProjectId; if(!this._c[pid]) this._c[pid]=this._seed(pid); return this._c[pid]; },
  addCourse(pid,c){ this.courses(pid).push(Object.assign({id:'c'+Date.now().toString(36),recursos:[],quiz:[],mins:10},c)); CX.bus&&CX.bus.emit('learn'); },
  updateCourse(pid,cid,patch){ const c=this.courses(pid).find(x=>x.id===cid); if(c){Object.assign(c,patch);CX.bus&&CX.bus.emit('learn');} },
  delCourse(pid,cid){ this._c[pid]=this.courses(pid).filter(x=>x.id!==cid); CX.bus&&CX.bus.emit('learn'); },
  addResource(pid,cid,r){ const c=this.courses(pid).find(x=>x.id===cid); if(c){c.recursos.push(r);CX.bus&&CX.bus.emit('learn');} },
  delResource(pid,cid,idx){ const c=this.courses(pid).find(x=>x.id===cid); if(c){c.recursos.splice(idx,1);CX.bus&&CX.bus.emit('learn');} },
  /* normaliza una URL de video a embed (YouTube/Vimeo) */
  embedUrl(url){ url=(url||'').trim(); let m;
    if((m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/))) return 'https://www.youtube-nocookie.com/embed/'+m[1]+'?rel=0&modestbranding=1';
    if((m=url.match(/vimeo\.com\/(\d+)/))) return 'https://player.vimeo.com/video/'+m[1]+'?dnt=1';
    return url; },
  addQuiz(pid,cid,q){ const c=this.courses(pid).find(x=>x.id===cid); if(c){c.quiz.push(q);CX.bus&&CX.bus.emit('learn');} },
  /* progreso por shopper+curso (0..100) */
  _key(sid){ return sid||(CX.session.user&&CX.session.user.shopperId)||'sh1'; },
  prog(sid,pid){ pid=pid||CX.data.currentProjectId; const k=this._key(sid)+'@'+pid; return this._prog[k]||(this._prog[k]={}); },
  setProg(sid,pid,cid,v){ this.prog(sid,pid)[cid]=Math.max(0,Math.min(100,v|0)); CX.bus&&CX.bus.emit('learn'); },
};

CX.module('aprendizaje', ({role,ui,data})=>{
  const p=data.project(), pid=p.id;
  const isAdmin = role!=='shopper';
  const sid=(CX.session.user&&CX.session.user.shopperId)||'sh1';
  const host=ui.el('div');

  const draw=()=>{
    const courses=CX.learnStore.courses(pid);
    const prog=CX.learnStore.prog(sid,pid);
    const avg=courses.length?Math.round(courses.reduce((a,c)=>a+(prog[c.id]||0),0)/courses.length):0;
    const compl=courses.filter(c=>(prog[c.id]||0)>=100).length;
    const enCurso=courses.filter(c=>{const v=prog[c.id]||0;return v>0&&v<100;}).length;

    const courseCard=(c)=>{ const v=prog[c.id]||0;
      return `<div class="card hov card-p" data-open="${c.id}" style="cursor:pointer">
        <div class="flex" style="gap:12px;margin-bottom:10px"><div style="font-size:24px">${c.ic||'�’'}</div>
        <div style="flex:1"><div style="font-size:13.5px;font-weight:700;color:var(--t1)">${c.titulo}</div><div style="font-size:11px;color:var(--t3)">${c.recursos.length} recurso(s) · ${c.mins} min${c.quiz.length?' · examen':''}</div></div></div>
        ${ui.bar(v,'Avance',v+'%')}
        <div class="between" style="margin-top:8px"><span style="font-size:11px;color:var(--t3)">${c.desc||''}</span>
        <button class="btn ${v>=100?'btn-ghost':'btn-pr'} btn-sm" data-open="${c.id}">${v>=100?'Repasar':v>0?'Continuar':isAdmin?'Abrir':'Empezar'}</button></div>
      </div>`; };

    host.innerHTML=`
      ${ui.ph('Centro de Aprendizaje', p.name+' · formación e inducción'+(isAdmin?' · gestiona recursos y exámenes':' — refuerza lo que más te cuesta'))}
      <div class="grid g4" style="margin-bottom:6px" id="lnKpis">
        <div data-k="all" style="cursor:pointer">${ui.kpi('Cursos',courses.length,'b')}</div>
        <div data-k="compl" style="cursor:pointer">${ui.kpi(isAdmin?'Con examen':'Completados',isAdmin?courses.filter(c=>c.quiz.length).length:compl,'g')}</div>
        <div data-k="curso" style="cursor:pointer">${ui.kpi('En progreso',enCurso,'a')}</div>
        <div data-k="avg" style="cursor:pointer">${ui.kpi('Avance prom.',avg+'%','p')}</div>
      </div>
      <div style="font-size:11px;color:var(--t3);text-align:right;margin-bottom:14px">↑ toca un indicador para ver el detalle</div>

      ${isAdmin?`<div class="flex wrap" style="gap:8px;margin-bottom:14px">
        <button class="btn btn-pr btn-sm" id="lnNew">＋ Nuevo curso/bloque</button>
        <button class="btn btn-soft btn-sm" id="lnImport">⤒ Cargar material externo</button>
        <button class="btn btn-soft btn-sm" id="lnIA">🤖 Generar con IA</button>
      </div>`:''}

      <div class="grid g2">${courses.map(courseCard).join('')}</div>
      <div class="card card-p" style="margin-top:16px">${ui.aiBox(isAdmin?'Carga material de cualquier fuente (PDF, enlaces, videos) y la IA genera resúmenes, infografías y preguntas de examen; arma bloques de capacitación y mide avances por shopper.':'Tu avance se guarda. La inducción se adapta al proyecto y refuerza lo que fallaste en la certificación.','Aprendizaje inteligente y adaptativo')}</div>`;

    // KPIs clickeables
    const kp={
      all:['Todos los cursos',courses],
      compl:[isAdmin?'Cursos con examen':'Cursos completados',isAdmin?courses.filter(c=>c.quiz.length):courses.filter(c=>(prog[c.id]||0)>=100)],
      curso:['Cursos en progreso',courses.filter(c=>{const v=prog[c.id]||0;return v>0&&v<100;})],
      avg:['Avance por curso',courses],
    };
    host.querySelectorAll('#lnKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=kp[el.dataset.k];
      ui.modal(d[0], d[1].length?`<table class="tbl"><thead><tr><th>Curso</th><th>Recursos</th><th>Avance</th></tr></thead><tbody>${d[1].map(c=>`<tr><td><b>${c.ic||''} ${c.titulo}</b></td><td style="font-size:12px">${c.recursos.length}</td><td>${ui.bdg((prog[c.id]||0)+'%',(prog[c.id]||0)>=100?'g':(prog[c.id]||0)>0?'a':'n')}</td></tr>`).join('')}</tbody></table>`:ui.empty('📚','Sin cursos en esta categoría.'));
    }));

    // abrir curso
    host.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',(e)=>{e.stopPropagation();openCourse(courses.find(c=>c.id===el.dataset.open));}));

    if(isAdmin){
      host.querySelector('#lnNew').addEventListener('click',newCourse);
      host.querySelector('#lnImport').addEventListener('click',importMat);
      host.querySelector('#lnIA').addEventListener('click',iaGen);
    }
  };

  const RES_BODY={
    'Manual de inducción':'# Manual de inducción\n\nBienvenido al programa. Como evaluador incógnito tu rol es vivir la experiencia como un cliente real y reportarla con objetividad.\n\n## Principios\n- Anonimato absoluto: nunca reveles que evalúas.\n- Objetividad: reporta hechos, no opiniones.\n- Evidencia: respalda cada hallazgo según el escenario.\n\n## Tu ciclo\n1. Certifícate en el proyecto.\n2. Agenda y realiza la visita.\n3. Completa el cuestionario el mismo día.',
    'Bienvenida (4 min)':'',
    'Protocolo paso a paso':'# Protocolo de compra incógnita\n\n## Antes\n- Memoriza el escenario y los puntos a observar.\n- Prepara medios de pago y cámara.\n\n## Durante\n- Cronometra desde que ingresas.\n- Observa saludo, asesoría, tiempos y limpieza.\n- Captura la evidencia sin ser detectado.\n\n## Después\n- Registra incidencias de inmediato.\n- Completa el cuestionario y adjunta comprobantes.',
    'Guía de evidencias':'# Evidencia y fotografía\n\n## Tipos válidos\n- Foto normal (producto, ambiente).\n- Foto geolocalizada (cuando el escenario lo pide).\n- Audio/video solo si está autorizado en el instructivo.\n\n## Reglas\n- No expongas tu rol al capturar.\n- Conserva ticket/comprobante para el reembolso.',
  };
  const resViewer=(r)=>{
    let body;
    if(r.t==='link'&&r.url){ body=`<div style="text-align:center;padding:20px"><div style="font-size:34px">🔗</div><div style="font-size:13px;color:var(--t2);margin:10px 0">${r.n}</div><a href="${r.url}" target="_blank" class="btn btn-pr btn-sm">Abrir enlace ↗</a></div>`; }
    else if(r.t==='info'){ body=`<div style="background:linear-gradient(135deg,var(--brand-light),#fff);border:1px solid var(--border);border-radius:12px;padding:26px;text-align:center"><div style="font-size:40px">🖼️</div><div style="font-size:14px;font-weight:700;color:var(--t1);margin-top:8px">${r.n}</div><div style="font-size:12px;color:var(--t3);margin-top:6px">Infografía del programa — vista dentro de la plataforma.</div></div>`; }
    else { const txt=r.body||RES_BODY[r.n]||'Vista previa no disponible para este recurso; usa Descargar para obtener el archivo.';
      body=`<div style="background:var(--panel-2);border:1px solid var(--border);border-radius:10px;padding:16px 18px;max-height:60vh;overflow:auto">${txt.split('\n').map(l=>{
        if(l.startsWith('## ')) return `<div style="font-size:14px;font-weight:800;color:var(--t1);margin:12px 0 4px">${l.slice(3)}</div>`;
        if(l.startsWith('# ')) return `<div style="font-size:17px;font-weight:800;color:var(--t1);margin-bottom:8px">${l.slice(2)}</div>`;
        if(l.startsWith('- ')||/^\d+\./.test(l)) return `<div style="font-size:13px;color:var(--t2);padding-left:14px;line-height:1.6">• ${l.replace(/^(-|\d+\.)\s*/,'')}</div>`;
        return l.trim()?`<div style="font-size:13px;color:var(--t2);line-height:1.6;margin:3px 0">${l}</div>`:'<div style="height:6px"></div>';
      }).join('')}</div>`; }
    ui.modal(({doc:'📄',link:'🔗',info:'🖼️'}[r.t]||'📎')+' '+r.n, body+`<div style="text-align:right;margin-top:14px"><button class="btn btn-soft btn-sm" onclick="CX.ui.toast('Descargando ${(r.n||'').replace(/'/g,'')}…','ok')">⤓ Descargar</button></div>`);
  };

  const openCourse=(c)=>{ if(!c)return; const v=CX.learnStore.prog(sid,pid)[c.id]||0;
    const resHTML=c.recursos.map((r,idx)=>{
      const ic=({doc:'📄',video:'🎬',link:'🔗',info:'🖼️',quiz:'❓'})[r.t]||'📎';
      const embed=(r.t==='video'&&r.url)?`<div style="margin-top:6px;position:relative"><iframe src="${r.url}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:8px" allowfullscreen></iframe><button class="btn btn-soft btn-sm vidMax" data-url="${r.url}" data-n="${(r.n||'').replace(/"/g,'&quot;')}" style="position:absolute;top:8px;right:8px">⛶</button></div>`:'';
      const clickable=(r.t!=='video');
      return `<div style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div class="between"><span style="font-size:12.5px;${clickable?'cursor:pointer':''}" ${clickable?`data-openres="${idx}"`:''}>${ic} ${r.n}${clickable?' <span style="color:var(--brand);font-size:11px">abrir →</span>':''}</span>${isAdmin?`<button class="btn btn-ghost btn-sm" data-delres="${idx}" style="color:var(--red);padding:1px 7px">✕</button>`:''}</div>${embed}</div>`;
    }).join('');
    ui.modal((c.ic||'')+' '+c.titulo, `
      <div style="font-size:12.5px;color:var(--t2);margin-bottom:12px;white-space:pre-wrap">${c.desc||''}</div>
      <div class="card-t" style="font-size:13px;margin-bottom:8px">Recursos</div>
      ${c.recursos.length?resHTML:'<div class="muted" style="font-size:12px">Sin recursos aún.</div>'}
      ${isAdmin?`<div class="flex wrap" style="gap:8px;margin-top:12px"><button class="btn btn-soft btn-sm" id="ocRes">＋ Recurso</button><button class="btn btn-soft btn-sm" id="ocQuiz">＋ Pregunta de examen</button><button class="btn btn-ghost btn-sm" id="ocEdit">✎ Editar curso</button><button class="btn btn-ghost btn-sm" id="ocDel" style="color:var(--red)">🗑 Eliminar</button></div>`:`
        <div class="card-t" style="font-size:13px;margin:14px 0 6px">Tu avance</div>
        <input type="range" id="ocProg" min="0" max="100" value="${v}" style="width:100%">
        <div class="between" style="margin-top:6px"><span style="font-size:12px;color:var(--t3)" id="ocPct">${v}%</span>
        ${c.quiz.length?`<button class="btn btn-pr btn-sm" id="ocExam">Rendir examen (${c.quiz.length})</button>`:`<button class="btn btn-green btn-sm" id="ocDone">Marcar completado</button>`}</div>`}
    `,{onMount:(ov,close)=>{
      // recursos clickeables (doc/info/link) — visor in-app + descarga
      ov.querySelectorAll('[data-openres]').forEach(el=>el.addEventListener('click',()=>{ const r=c.recursos[+el.dataset.openres]; if(!r)return; resViewer(r); }));
      if(isAdmin){
        ov.querySelector('#ocRes').addEventListener('click',()=>{close();addResourceModal(c);});
        ov.querySelector('#ocQuiz').addEventListener('click',()=>{close();addQuizModal(c);});
        ov.querySelector('#ocEdit').addEventListener('click',()=>{close();newCourse(c);});
        ov.querySelector('#ocDel').addEventListener('click',()=>{CX.learnStore.delCourse(pid,c.id);close();draw();ui.toast('Curso eliminado','');});
        ov.querySelectorAll('[data-delres]').forEach(b=>b.addEventListener('click',()=>{CX.learnStore.delResource(pid,c.id,+b.dataset.delres);close();openCourse(CX.learnStore.courses(pid).find(x=>x.id===c.id));}));
      } else {
        ov.querySelectorAll('.vidMax').forEach(b=>b.addEventListener('click',()=>{
          close();
          const fs=document.createElement('div');fs.className='cx-ov';fs.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(13,39,64,.94);display:flex;flex-direction:column;padding:24px';
          fs.innerHTML=`<div class="between" style="margin-bottom:12px"><b style="color:#fff">🎬 ${b.dataset.n}</b><button class="btn btn-soft btn-sm" id="vmClose">✕ Cerrar</button></div><div style="flex:1;display:flex"><iframe src="${b.dataset.url}" style="width:100%;height:100%;border:0;border-radius:10px" allowfullscreen></iframe></div>`;
          document.body.appendChild(fs);fs.querySelector('#vmClose').addEventListener('click',()=>fs.remove());fs.addEventListener('click',e=>{if(e.target===fs)fs.remove();});
        }));
        const rng=ov.querySelector('#ocProg'), pct=ov.querySelector('#ocPct');
        rng&&rng.addEventListener('input',()=>{pct.textContent=rng.value+'%';CX.learnStore.setProg(sid,pid,c.id,+rng.value);});
        const dn=ov.querySelector('#ocDone'); if(dn)dn.addEventListener('click',()=>{CX.learnStore.setProg(sid,pid,c.id,100);close();draw();ui.toast('Curso completado','ok');});
        const ex=ov.querySelector('#ocExam'); if(ex)ex.addEventListener('click',()=>{close();takeExam(c);});
      }
    }});
  };

  const takeExam=(c)=>{ let i=0,score=0; const ask=()=>{ const q=c.quiz[i];
    ui.modal('Examen · '+c.titulo+' ('+(i+1)+'/'+c.quiz.length+')', `
      <div style="font-size:13.5px;font-weight:600;color:var(--t1);margin-bottom:12px">${q.q}</div>
      ${q.o.map((o,j)=>`<button class="btn btn-ghost" data-opt="${j}" style="display:block;width:100%;text-align:left;margin-bottom:8px">${o}</button>`).join('')}
    `,{onMount:(ov,close)=>{ov.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click',()=>{if(+b.dataset.opt===q.a)score++;i++;close();if(i<c.quiz.length)ask();else{const pc=Math.round(score/c.quiz.length*100);CX.learnStore.setProg(sid,pid,c.id,pc>=70?100:pc);draw();ui.toast('Examen: '+pc+'% '+(pc>=70?'· aprobado ✓':'· repasa e intenta de nuevo'),pc>=70?'ok':'warn',3600);}}));}});
  }; ask(); };

  const EMOJIS=['📘','🎓','🛍️','📸','📞','🏦','🍽️','🚗','🧹','⭐','🎯','💡','🛡️','🔍','📝','🤝'];
  const emojiPicker=(sel)=>`<div class="flex wrap" style="gap:4px" id="emojiPick">${EMOJIS.map(e=>`<button type="button" class="emo btn btn-ghost btn-sm" data-emo="${e}" style="font-size:16px;padding:3px 7px;${e===sel?'background:var(--brand-light);border:1px solid var(--brand)':''}">${e}</button>`).join('')}</div>`;

  const newCourse=(edit)=>{ const c=edit||{titulo:'',desc:'',mins:15,ic:'📘'};
    ui.modal(edit?'Editar curso / bloque':'Nuevo curso / bloque',`
    <div style="margin-bottom:8px"><label class="lbl">Icono</label>${emojiPicker(c.ic)}<input type="hidden" id="ncIc" value="${c.ic||'📘'}"></div>
    <div style="margin-bottom:10px"><label class="lbl">Título</label><input class="inp" id="ncT" value="${(c.titulo||'').replace(/"/g,'&quot;')}" placeholder="Ej. Protocolo de atención"></div>
    <div style="margin-bottom:10px"><label class="lbl">Descripción (admite emojis y saltos de línea)</label><textarea class="inp" id="ncD" rows="3" placeholder="Breve descripción del bloque…">${c.desc||''}</textarea></div>
    <div style="margin-bottom:14px"><label class="lbl">Duración (min)</label><input class="inp" id="ncM" type="number" value="${c.mins||15}"></div>
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ncS">${edit?'Guardar':'Crear'}</button></div>
  `,{onMount:(ov,close)=>{
    ov.querySelectorAll('.emo').forEach(b=>b.addEventListener('click',()=>{ov.querySelectorAll('.emo').forEach(x=>x.style.cssText='font-size:16px;padding:3px 7px');b.style.cssText='font-size:16px;padding:3px 7px;background:var(--brand-light);border:1px solid var(--brand)';ov.querySelector('#ncIc').value=b.dataset.emo;}));
    ov.querySelector('#ncS').addEventListener('click',()=>{const t=(ov.querySelector('#ncT').value||'').trim();if(!t){ui.toast('Ponle título','warn');return;}const patch={titulo:t,desc:ov.querySelector('#ncD').value.trim(),mins:+ov.querySelector('#ncM').value||15,ic:ov.querySelector('#ncIc').value||'📘'};
      if(edit)CX.learnStore.updateCourse(pid,edit.id,patch);else CX.learnStore.addCourse(pid,patch);close();draw();ui.toast(edit?'Curso actualizado':'Curso creado','ok');});}});};

  const addResourceModal=(c)=>ui.modal('Agregar recurso · '+c.titulo,`
    <div style="margin-bottom:10px"><label class="lbl">Tipo</label><select class="sel" id="arT">${[['doc','📄 Documento'],['video','🎬 Video (embebido)'],['link','🔗 Enlace'],['info','🖼️ Infografía']].map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
    <div style="margin-bottom:10px"><label class="lbl">Nombre / título</label><input class="inp" id="arN" placeholder="Cómo se verá en la lista"></div>
    <div style="margin-bottom:10px"><label class="lbl">URL (YouTube/Vimeo para video, o enlace del recurso)</label><input class="inp" id="arU" placeholder="https://…"></div>
    <div style="margin-bottom:14px"><label class="lbl">o sube un archivo (video/PDF/imagen)</label><input type="file" class="inp" id="arF" accept="video/*,application/pdf,image/*" style="padding:7px"></div>
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="arS">Agregar</button></div>
  `,{onMount:(ov,close)=>{
    ov.querySelector('#arF').addEventListener('change',e=>{const f=e.target.files[0];if(f&&!ov.querySelector('#arN').value)ov.querySelector('#arN').value=f.name;});
    ov.querySelector('#arS').addEventListener('click',()=>{const t=ov.querySelector('#arT').value;const n=(ov.querySelector('#arN').value||'').trim();const url=(ov.querySelector('#arU').value||'').trim();const file=ov.querySelector('#arF').files[0];
      if(!n&&!url&&!file){ui.toast('Pon nombre, URL o archivo','warn');return;}
      const r={t,n:n||(file?file.name:'Recurso')};
      if(url)r.url=t==='video'?CX.learnStore.embedUrl(url):url;
      if(file)r.file=file.name;
      CX.learnStore.addResource(pid,c.id,r);close();ui.toast('Recurso agregado','ok');draw();});}});

  const addQuizModal=(c)=>ui.modal('Pregunta de examen · '+c.titulo,`
    <div style="margin-bottom:10px"><label class="lbl">Pregunta</label><input class="inp" id="qzQ" placeholder="Escribe la pregunta"></div>
    <div style="margin-bottom:8px"><label class="lbl">Opciones (la 1ª marca la correcta)</label>
      <input class="inp" id="qzA" placeholder="Opción correcta" style="margin-bottom:6px"><input class="inp" id="qzB" placeholder="Opción incorrecta" style="margin-bottom:6px"><input class="inp" id="qzC" placeholder="Opción incorrecta (opcional)"></div>
    <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="qzS">Agregar</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#qzS').addEventListener('click',()=>{const q=(ov.querySelector('#qzQ').value||'').trim();const a=(ov.querySelector('#qzA').value||'').trim();if(!q||!a){ui.toast('Faltan datos','warn');return;}const opts=[a,(ov.querySelector('#qzB').value||'').trim(),(ov.querySelector('#qzC').value||'').trim()].filter(Boolean);
    // mezcla simple manteniendo índice de la correcta
    const correct=opts[0]; const shuffled=opts.slice().sort(()=>Math.random()-.5);
    CX.learnStore.addQuiz(pid,c.id,{q,o:shuffled,a:shuffled.indexOf(correct)});close();ui.toast('Pregunta agregada al examen','ok');draw();});}});

  const importMat=()=>ui.modal('Cargar material externo',`
    <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Sube PDF/presentaciones o pega enlaces (Drive, YouTube, web). La IA puede resumirlo y generar un bloque con examen.</p>
    <input type="file" class="inp" style="padding:7px;margin-bottom:10px" multiple>
    <input class="inp" placeholder="o pega un enlace…" style="margin-bottom:12px">
    <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:12px"><input type="checkbox" checked> Generar resumen, infografía y 5 preguntas con IA</label>
    <div style="text-align:right"><button class="btn btn-green btn-sm" id="imOk">Procesar</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#imOk').addEventListener('click',()=>{CX.learnStore.addCourse(pid,{titulo:'Material importado · '+new Date().toLocaleDateString('es-GT'),desc:'Generado desde material externo',ic:'🆕',recursos:[{t:'doc',n:'Resumen IA'},{t:'info',n:'Infografía IA'}],quiz:[{q:'Pregunta generada por IA (editar)',o:['Correcta','Incorrecta'],a:0}]});close();draw();ui.toast(CX.ai&&CX.ai.ready()?'Material procesado con IA':'Material cargado · activa IA en Automatizaciones para autogenerar','ok',3800);});}});

  const iaGen=()=>ui.modal('Generar curso con IA',`
    <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Describe el tema o <b>carga el instructivo/material</b> y la IA arma el bloque (objetivos, contenido, infografía y examen) usando los documentos del proyecto.</p>
    <input type="file" class="inp" id="iaFile" accept=".pdf,.doc,.docx,.txt,image/*,video/*" style="padding:7px;margin-bottom:8px">
    <input class="inp" id="iaTopic" placeholder="Ej. Manejo de objeciones en venta de seguros" style="margin-bottom:12px">
    <div class="flex" style="justify-content:space-between"><button class="btn btn-soft btn-sm" id="iaImp">📥 Importar material</button><button class="btn btn-pr btn-sm" id="iaOk">Generar</button></div>
  `,{onMount:(ov,close)=>{
    ov.querySelector('#iaImp').addEventListener('click',()=>ov.querySelector('#iaFile').click());
    ov.querySelector('#iaFile').addEventListener('change',e=>{const f=e.target.files[0];if(f&&!ov.querySelector('#iaTopic').value)ov.querySelector('#iaTopic').value=f.name.replace(/\.[^.]+$/,'');});
    ov.querySelector('#iaOk').addEventListener('click',()=>{const f=ov.querySelector('#iaFile').files[0];const t=(ov.querySelector('#iaTopic').value||'').trim()||(f?f.name:'Tema del proyecto');CX.learnStore.addCourse(pid,{titulo:t,desc:'Curso generado por IA'+(f?' desde "'+f.name+'"':''),ic:'🤖',recursos:[{t:'doc',n:'Contenido IA'},{t:'info',n:'Infografía IA'}],quiz:[{q:'¿Objetivo principal de '+t+'?',o:['Reforzar el estándar','Improvisar'],a:0}]});close();draw();ui.toast(CX.ai&&CX.ai.ready()?'Curso generado con '+CX.ai.cfg().model:'Curso base creado · configura IA (Gemini) para contenido completo','ok',4000);});}});

  draw();
  CX.bus.on('learn',()=>draw());
  return host;
});
