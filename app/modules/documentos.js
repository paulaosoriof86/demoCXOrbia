/* CXOrbia · Documentos (admin + shopper) */
CX.module('documentos', ({data,role,ui})=>{
  const p=data.project();
  const docs=[
    ['📄','Instructivo general','PDF · 2.1 MB'],
    ['🎯','Escenario de evaluación','PDF · 1.4 MB'],
    ['🎬','Video de inducción','MP4 · 5 min'],
    ['📋','Checklist de visita','DOC · 320 KB'],
  ];
  return `
    ${ui.ph('Documentos', p.name+' · recursos operativos por proyecto, dentro de cada visita')}
    <div class="between" style="margin-bottom:14px">${ui.bdg(docs.length+' recursos','n')}${role==='admin'?'<button class="btn btn-pr btn-sm">+ Subir documento</button>':''}</div>
    <div class="grid g2">
      ${docs.map(d=>`<div class="card hov card-p flex" style="gap:13px">
        <div style="font-size:26px">${d[0]}</div>
        <div style="flex:1"><div style="font-size:13.5px;font-weight:700;color:var(--t1)">${d[1]}</div><div style="font-size:11.5px;color:var(--t3)">${d[2]}</div></div>
        <button class="btn btn-soft btn-sm">Abrir</button></div>`).join('')}
    </div>
    <div class="card card-p" style="margin-top:16px">${ui.aiBox('Entrego el documento correcto según la visita, sin que nadie busque en chats. Enfoque: qué hacer en esta visita.','Entrega contextual')}</div>`;
});

/* CXOrbia · Centro de Aprendizaje (admin + shopper) */
CX.module('aprendizaje', ({role,ui})=>{
  const courses=[
    ['🎓','Inducción del evaluador','4 módulos · 25 min','100%'],
    ['🛒','Protocolo de compra incógnita','3 módulos · 18 min','60%'],
    ['💳','Atención y tiempos de espera','2 módulos · 12 min','0%'],
    ['📸','Evidencia y fotografía','2 módulos · 10 min','0%'],
  ];
  return `
    ${ui.ph('Centro de Aprendizaje', 'Formación e inducción del evaluador — no atada a una sola visita')}
    <div class="grid g2">
      ${courses.map(c=>`<div class="card hov card-p">
        <div class="flex" style="gap:12px;margin-bottom:10px"><div style="font-size:24px">${c[0]}</div>
        <div><div style="font-size:13.5px;font-weight:700;color:var(--t1)">${c[1]}</div><div style="font-size:11px;color:var(--t3)">${c[2]}</div></div></div>
        ${ui.bar(parseInt(c[3]),'Avance',c[3])}
        <div style="text-align:right;margin-top:8px"><button class="btn ${c[3]==='100%'?'btn-ghost':'btn-pr'} btn-sm">${c[3]==='100%'?'Repasar':c[3]==='0%'?'Empezar':'Continuar'}</button></div>
      </div>`).join('')}
    </div>
    <div class="card card-p" style="margin-top:16px">${ui.aiBox('Adapto la inducción al proyecto y refuerzo justo lo que fallaste en la certificación.','Aprendizaje adaptativo')}</div>`;
});
