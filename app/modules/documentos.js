/* CXOrbia · Documentos (admin + shopper) — lectura DENTRO de la plataforma + subir */
CX.docStore = CX.docStore || {
  _d:{},
  seed(pid){ return [
    {id:'d1',ic:'📄',n:'Instructivo general',meta:'PDF · 2.1 MB',tipo:'pdf',
      body:'# Instructivo general del programa\n\nEste documento describe el objetivo de la evaluación, el perfil del evaluador y las reglas generales.\n\n## Antes de la visita\n- Lee el escenario asignado y memorízalo (no lleves notas visibles).\n- Verifica que estás certificado para este proyecto.\n- Confirma fecha y franja en Mis Visitas.\n\n## Durante la visita\n- Mantén el anonimato en todo momento.\n- Cronometra los tiempos desde que ingresas.\n- Toma la evidencia requerida según el escenario.\n\n## Después\n- Completa el cuestionario el mismo día.\n- Adjunta la evidencia y los comprobantes para tu reembolso.'},
    {id:'d2',ic:'🎯',n:'Escenario de evaluación',meta:'PDF · 1.4 MB',tipo:'pdf',
      body:'# Escenario: Compra estándar\n\nActúa como un cliente habitual. Realiza una compra del producto definido y evalúa la atención, los tiempos y la limpieza.\n\n## Puntos clave a observar\n1. Saludo y bienvenida (¿te saludaron en los primeros 30s?).\n2. Conocimiento del asesor sobre el producto.\n3. Tiempo total en caja.\n4. Estado de limpieza y orden del local.\n5. Despedida e invitación a volver.'},
    {id:'d3',ic:'🎬',n:'Video de inducción',meta:'YouTube · 5 min',tipo:'video',url:'https://www.youtube.com/embed/aqz-KE-bpKQ'},
    {id:'d4',ic:'📋',n:'Checklist de visita',meta:'Lista · 8 ítems',tipo:'check',
      items:['Certificación vigente','Escenario memorizado','Fecha confirmada','Evidencia lista (cámara)','Efectivo/medios de pago','Cronómetro a mano','Comprobantes guardados','Cuestionario enviado el mismo día']},
  ];},
  list(pid){ pid=pid||CX.data.currentProjectId; if(!this._d[pid]) this._d[pid]=this.seed(pid); return this._d[pid]; },
  add(pid,d){ this.list(pid).unshift(Object.assign({id:'d'+Date.now().toString(36),ic:'📎',meta:'subido ahora'},d)); CX.bus&&CX.bus.emit('docs'); },
};

CX.module('documentos', ({data,role,ui})=>{
  const p=data.project(), pid=p.id;
  const host=ui.el('div');

  const viewer=(d)=>{
    let body;
    if(d.tipo==='video'&&d.url) body=`<div><iframe src="${d.url}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:10px" allowfullscreen></iframe></div>`;
    else if(d.tipo==='check') body=`<div>${(d.items||[]).map(it=>`<label class="flex" style="gap:9px;padding:9px 11px;border:1px solid var(--border);border-radius:9px;margin-bottom:7px;cursor:pointer;font-size:13px"><input type="checkbox"> ${it}</label>`).join('')}</div>`;
    else if(d.tipo==='image'&&d.url) body=`<img src="${d.url}" style="width:100%;border-radius:10px">`;
    else if(d.url&&/^data:application\/pdf|\.pdf$/i.test(d.url)) body=`<iframe src="${d.url}" style="width:100%;height:62vh;border:0;border-radius:10px"></iframe>`;
    else body=`<div style="background:var(--panel-2);border:1px solid var(--border);border-radius:10px;padding:16px 18px;max-height:60vh;overflow:auto">${(d.body||'Vista previa no disponible para este formato; usa Descargar.').split('\n').map(l=>{
      if(l.startsWith('## ')) return `<div style="font-size:14px;font-weight:800;color:var(--t1);margin:12px 0 4px">${l.slice(3)}</div>`;
      if(l.startsWith('# ')) return `<div style="font-size:17px;font-weight:800;color:var(--t1);margin-bottom:8px">${l.slice(2)}</div>`;
      if(l.startsWith('- ')||/^\d+\./.test(l)) return `<div style="font-size:13px;color:var(--t2);padding-left:14px;line-height:1.6">• ${l.replace(/^(-|\d+\.)\s*/,'')}</div>`;
      return l.trim()?`<div style="font-size:13px;color:var(--t2);line-height:1.6;margin:3px 0">${l}</div>`:'<div style="height:6px"></div>';
    }).join('')}</div>`;
    ui.modal((d.ic||'📄')+' '+d.n, body+`<div class="between" style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="docMax">⛶ Maximizar</button><button class="btn btn-soft btn-sm" onclick="CX.ui.toast('Descargando ${d.n}…','ok')">⤓ Descargar</button></div>`,{onMount:(ov,close)=>{
      ov.querySelector('#docMax').addEventListener('click',()=>{
        close();
        const isMedia = (d.tipo==='video'&&d.url) || (d.tipo==='image'&&d.url) || (d.url&&/^data:application\/pdf|\.pdf$/i.test(d.url));
        let fsInner;
        if(d.tipo==='video'&&d.url) fsInner=`<iframe src="${d.url}" style="width:100%;height:100%;border:0;border-radius:12px" allowfullscreen></iframe>`;
        else if(d.tipo==='image'&&d.url) fsInner=`<img src="${d.url}" style="max-width:100%;max-height:100%;margin:auto;display:block;border-radius:12px">`;
        else if(d.url&&/^data:application\/pdf|\.pdf$/i.test(d.url)) fsInner=`<iframe src="${d.url}" style="width:100%;height:100%;border:0;border-radius:12px"></iframe>`;
        else fsInner=`<div style="background:var(--panel);border-radius:12px;padding:26px 30px;max-width:900px;margin:0 auto;height:100%;overflow:auto">${body}</div>`;
        const fs=document.createElement('div'); fs.className='cx-ov'; fs.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(13,39,64,.94);display:flex;flex-direction:column;padding:24px';
        fs.innerHTML=`<div class="between" style="margin-bottom:14px"><b style="color:#fff;font-size:15px">${(d.ic||'📄')} ${d.n}</b><button class="btn btn-soft btn-sm" id="fsClose">✕ Cerrar</button></div><div style="flex:1;min-height:0;display:flex">${fsInner}</div>`;
        document.body.appendChild(fs); fs.querySelector('#fsClose').addEventListener('click',()=>fs.remove());
        fs.addEventListener('click',e=>{if(e.target===fs)fs.remove();});
      });
    }});
  };

  const draw=()=>{
    const docs=CX.docStore.list(pid);
    host.innerHTML=`
      ${ui.ph('Documentos', p.name+' · recursos operativos por proyecto · se leen dentro de la plataforma')}
      <div class="between" style="margin-bottom:14px">${ui.bdg(docs.length+' recursos','n')}${role==='admin'?'<button class="btn btn-pr btn-sm" id="docUp">＋ Subir documento</button>':''}</div>
      <div class="grid g2">
        ${docs.map(d=>`<div class="card hov card-p flex" style="gap:13px">
          <div style="flex:1;display:flex;gap:13px;cursor:pointer" data-doc="${d.id}"><div style="font-size:26px">${d.ic}</div>
          <div style="flex:1"><div style="font-size:13.5px;font-weight:700;color:var(--t1)">${d.n}</div><div style="font-size:11.5px;color:var(--t3)">${d.meta}</div></div></div>
          <div class="flex" style="gap:6px;flex-shrink:0">
            <button class="btn btn-soft btn-sm" data-doc="${d.id}">Abrir</button>
            ${role==='admin'?`<button class="btn btn-ghost btn-sm" data-editd="${d.id}" title="Editar">✎</button><button class="btn btn-ghost btn-sm" data-deld="${d.id}" title="Eliminar" style="color:var(--red)">✕</button>`:''}
          </div></div>`).join('')}
      </div>
      <div class="card card-p" style="margin-top:16px">${ui.aiBox('Cada recurso se abre y se lee dentro de la plataforma (PDF, video embebido, checklist) — sin descargar ni buscar en chats. Entrego el correcto según la visita.','Lectura contextual en plataforma')}</div>`;
    host.querySelectorAll('[data-doc]').forEach(b=>b.addEventListener('click',()=>{const d=docs.find(x=>x.id===b.dataset.doc);if(d)viewer(d);}));
    host.querySelectorAll('[data-editd]').forEach(b=>b.addEventListener('click',()=>{const d=docs.find(x=>x.id===b.dataset.editd);if(!d)return;
      ui.modal('✎ Editar documento · '+d.n,`
        <div class="grid g2" style="gap:10px 12px"><div><label class="lbl">Nombre</label><input class="inp" id="edN" value="${(d.n||'').replace(/"/g,'&quot;')}"></div>
        <div><label class="lbl">Icono</label><input class="inp" id="edIc" value="${d.ic||'📄'}" style="max-width:80px"></div>
        <div style="grid-column:1/3"><label class="lbl">URL de video (opcional)</label><input class="inp" id="edUrl" value="${(d.url||'').replace(/"/g,'&quot;')}" placeholder="https://youtube.com/…"></div>
        <div style="grid-column:1/3"><label class="lbl">Contenido / texto</label><textarea class="inp" id="edBody" rows="4">${d.body||''}</textarea></div></div>
        <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="edSave">Guardar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#edSave').addEventListener('click',()=>{
        d.n=ov.querySelector('#edN').value.trim()||d.n;d.ic=ov.querySelector('#edIc').value||d.ic;
        const u=ov.querySelector('#edUrl').value.trim();if(u)d.url=CX.learnStore?CX.learnStore.embedUrl(u):u.replace('youtube.com/watch?v=','youtube-nocookie.com/embed/');
        d.body=ov.querySelector('#edBody').value;close();draw();ui.toast('Documento actualizado','ok');
      });}});
    }));
    host.querySelectorAll('[data-deld]').forEach(b=>b.addEventListener('click',()=>{CX.docStore._d[pid]=(CX.docStore._d[pid]||[]).filter(x=>x.id!==b.dataset.deld);draw();ui.toast('Documento eliminado','');}));
    const up=host.querySelector('#docUp');
    if(up)up.addEventListener('click',()=>ui.modal('Subir documento',`
      <div style="margin-bottom:10px"><label class="lbl">Nombre</label><input class="inp" id="duN" placeholder="Ej. Protocolo de servicio 2026"></div>
      <div style="margin-bottom:10px"><label class="lbl">Tipo</label><select class="sel" id="duT"><option value="pdf">📄 Documento (PDF/imagen)</option><option value="video">🎬 Video (YouTube/Vimeo)</option><option value="text">📝 Texto/Markdown</option></select></div>
      <div style="margin-bottom:10px"><label class="lbl">Archivo (PDF/imagen/video)</label><input type="file" class="inp" id="duF" accept="application/pdf,image/*,video/*" style="padding:7px"></div>
      <div style="margin-bottom:10px"><label class="lbl">o URL de video (YouTube/Vimeo)</label><input class="inp" id="duU" placeholder="https://…"></div>
      <div style="margin-bottom:14px"><label class="lbl">o pega el texto (Markdown)</label><textarea class="inp" id="duB" rows="3" placeholder="# Título…"></textarea></div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="duS">Subir</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#duF').addEventListener('change',e=>{const f=e.target.files[0];if(f&&!ov.querySelector('#duN').value)ov.querySelector('#duN').value=f.name;});
      ov.querySelector('#duS').addEventListener('click',()=>{
        const n=(ov.querySelector('#duN').value||'').trim(); if(!n){ui.toast('Pon un nombre','warn');return;}
        const t=ov.querySelector('#duT').value, url=(ov.querySelector('#duU').value||'').trim(), body=(ov.querySelector('#duB').value||'').trim(), f=ov.querySelector('#duF').files[0];
        const rec={n,tipo:t,ic:t==='video'?'🎬':t==='text'?'📝':'📄',meta:f?f.name:(url?'video':'texto')};
        if(t==='video'&&url)rec.url=CX.learnStore?CX.learnStore.embedUrl(url):url;
        if(body)rec.body=body;
        const finish=()=>{CX.docStore.add(pid,rec);close();draw();ui.toast('Documento subido · disponible para el proyecto','ok');};
        if(f){const rd=new FileReader();rd.onload=()=>{rec.url=rd.result;if(f.type==='application/pdf')rec.tipo='pdf';else if(/^image\//.test(f.type)){rec.tipo='image';rec.ic='🖼️';}else if(/^video\//.test(f.type)){rec.tipo='video';rec.ic='🎬';}finish();};rd.readAsDataURL(f);}
        else finish();
      });
    }}));
  };
  draw();
  CX.bus.on('docs',()=>draw());
  return host;
});

/* CXOrbia · Centro de Aprendizaje → modules/aprendizaje.js */
