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
    ];
  },
  courses(pid){ pid=pid||CX.data.currentProjectId; if(!this._c[pid]) this._c[pid]=this._seed(pid); return this._c[pid]; },
  addCourse(pid,c){ this.courses(pid).push(Object.assign({id:'c'+Date.now().toString(36),recursos:[],quiz:[],mins:10},c)); CX.bus&&CX.bus.emit('learn'); },
  addResource(pid,cid,r){ const c=this.courses(pid).find(x=>x.id===cid); if(c){c.recursos.push(r);CX.bus&&CX.bus.emit('learn');} },
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

  const openCourse=(c)=>{ if(!c)return; const v=CX.learnStore.prog(sid,pid)[c.id]||0;
    ui.modal(c.titulo, `
      <div style="font-size:12.5px;color:var(--t2);margin-bottom:12px">${c.desc||''}</div>
      <div class="card-t" style="font-size:13px;margin-bottom:8px">Recursos</div>
      ${c.recursos.length?c.recursos.map(r=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12.5px">${({doc:'📄',video:'🎬',link:'🔗',info:'🖼️',quiz:'❓'})[r.t]||'📎'} ${r.n}</span>${isAdmin?'':'<button class="btn btn-ghost btn-sm" data-view>Ver</button>'}</div>`).join(''):'<div class="muted" style="font-size:12px">Sin recursos aún.</div>'}
      ${isAdmin?`<div class="flex wrap" style="gap:8px;margin-top:12px"><button class="btn btn-soft btn-sm" id="ocRes">＋ Recurso</button><button class="btn btn-soft btn-sm" id="ocQuiz">＋ Pregunta de examen</button></div>`:`
        <div class="card-t" style="font-size:13px;margin:14px 0 6px">Tu avance</div>
        <input type="range" id="ocProg" min="0" max="100" value="${v}" style="width:100%">
        <div class="between" style="margin-top:6px"><span style="font-size:12px;color:var(--t3)" id="ocPct">${v}%</span>
        ${c.quiz.length?`<button class="btn btn-pr btn-sm" id="ocExam">Rendir examen (${c.quiz.length})</button>`:`<button class="btn btn-green btn-sm" id="ocDone">Marcar completado</button>`}</div>`}
    `,{onMount:(ov,close)=>{
      if(isAdmin){
        ov.querySelector('#ocRes').addEventListener('click',()=>{close();addResourceModal(c);});
        ov.querySelector('#ocQuiz').addEventListener('click',()=>{close();addQuizModal(c);});
      } else {
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

  const newCourse=()=>ui.modal('Nuevo curso / bloque',`
    <div style="margin-bottom:10px"><label class="lbl">Título</label><input class="inp" id="ncT" placeholder="Ej. Protocolo de atención"></div>
    <div style="margin-bottom:10px"><label class="lbl">Descripción</label><input class="inp" id="ncD" placeholder="Breve descripción"></div>
    <div style="margin-bottom:14px"><label class="lbl">Duración (min)</label><input class="inp" id="ncM" type="number" value="15"></div>
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ncS">Crear</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#ncS').addEventListener('click',()=>{const t=(ov.querySelector('#ncT').value||'').trim();if(!t){ui.toast('Ponle título','warn');return;}CX.learnStore.addCourse(pid,{titulo:t,desc:ov.querySelector('#ncD').value.trim(),mins:+ov.querySelector('#ncM').value||15,ic:'📘'});close();draw();ui.toast('Curso creado','ok');});}});

  const addResourceModal=(c)=>ui.modal('Agregar recurso · '+c.titulo,`
    <div style="margin-bottom:10px"><label class="lbl">Tipo</label><select class="sel" id="arT">${[['doc','Documento'],['video','Video'],['link','Enlace'],['info','Infografía']].map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
    <div style="margin-bottom:14px"><label class="lbl">Nombre / URL</label><input class="inp" id="arN" placeholder="Nombre del recurso o enlace"></div>
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="arS">Agregar</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#arS').addEventListener('click',()=>{const n=(ov.querySelector('#arN').value||'').trim();if(!n){ui.toast('Falta el nombre','warn');return;}CX.learnStore.addResource(pid,c.id,{t:ov.querySelector('#arT').value,n});close();ui.toast('Recurso agregado','ok');draw();});}});

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
    <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Describe el tema y la IA arma el bloque (objetivos, contenido, infografía y examen) usando los documentos del proyecto.</p>
    <input class="inp" id="iaTopic" placeholder="Ej. Manejo de objeciones en venta de seguros" style="margin-bottom:12px">
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="iaOk">Generar</button></div>
  `,{onMount:(ov,close)=>{ov.querySelector('#iaOk').addEventListener('click',()=>{const t=(ov.querySelector('#iaTopic').value||'').trim()||'Tema del proyecto';CX.learnStore.addCourse(pid,{titulo:t,desc:'Curso generado por IA',ic:'🤖',recursos:[{t:'doc',n:'Contenido IA'},{t:'info',n:'Infografía IA'}],quiz:[{q:'¿Objetivo principal de '+t+'?',o:['Reforzar el estándar','Improvisar'],a:0}]});close();draw();ui.toast(CX.ai&&CX.ai.ready()?'Curso generado con '+CX.ai.cfg().model:'Curso base creado · configura IA (Gemini) para contenido completo','ok',4000);});}});

  draw();
  CX.bus.on('learn',()=>draw());
  return host;
});
