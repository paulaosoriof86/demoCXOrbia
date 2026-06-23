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

/* CXOrbia · Centro de Aprendizaje → movido a modules/aprendizaje.js (versión inteligente) */

