/* CXOrbia · Portal Cliente — Insights & Benchmark (#238)
   Valores agregados que nos posicionan sobre el mercado:
   1) NPS del cliente sobre el programa · 2) Benchmark vs industria
   3) Anotaciones colaborativas en resultados · 4) Agenda de reunión con la consultora */
CX.module('cli_insights', ({data,ui})=>{
  const host=ui.el('div');
  const p=data.project();
  const K='cx_cli_insights_'+p.id;
  const load=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}');}catch(e){return {};}};
  const save=(o)=>{try{localStorage.setItem(K,JSON.stringify(o));}catch(e){} };

  /* score vivo del programa para el benchmark — Bloque 1 (auditoría V100): sin visitas evaluadas
     reales, NUNCA se fabrica un promedio (antes caía a 74 fijo) — se devuelve null y la UI muestra
     "pendiente de fuente" en vez de un número inventado. */
  const scoreProg=()=>{ const vs=data.visitas().filter(v=>v.score!=null); return vs.length? Math.round(vs.reduce((a,v)=>a+v.score,0)/vs.length):null; };
  /* benchmark por industria (promedios de referencia del sector) */
  const BENCH={ 'Retail':71,'Banca':68,'Restaurantes':74,'Salud':70,'Telecom':66,'Automotriz':72,'Seguros':69,'Combustibles':73 };
  const industria=(p.industry||'Retail').split(/[·\-]/)[0].trim();
  const refInd=BENCH[industria]||71;

  const draw=()=>{
    const st=load();
    const mio=scoreProg();
    const delta=mio==null?null:mio-refInd;
    const nps=st.nps||{promotores:0,neutros:0,detractores:0,respuestas:0};
    const npsScore=nps.respuestas? Math.round(((nps.promotores-nps.detractores)/nps.respuestas)*100):null;
    const notas=st.notas||[];
    const reuniones=st.reuniones||[];

    host.innerHTML=`
      ${ui.ph('Insights & Benchmark', p.name+' · cómo te comparas con tu industria y qué opinas del programa')}
      <div class="grid g4" style="margin-bottom:16px">
        <div class="card card-p"><div class="card-t" style="font-size:12px">Tu score</div><div style="font-size:30px;font-weight:800;color:var(--brand)">${mio==null?ui.statusBdg('pending_source'):mio}</div><div style="font-size:11px;color:var(--t3)">promedio del programa</div></div>
        <div class="card card-p"><div class="card-t" style="font-size:12px">Promedio ${industria}</div><div style="font-size:30px;font-weight:800;color:var(--t2)">${refInd}</div><div style="font-size:11px;color:var(--t3)">referencia del sector</div></div>
        <div class="card card-p" style="border-left:3px solid var(--${(delta==null||delta>=0)?'green':'red'})"><div class="card-t" style="font-size:12px">Diferencia</div><div style="font-size:30px;font-weight:800;color:var(--${(delta==null||delta>=0)?'green':'red'})">${delta==null?'—':(delta>=0?'+':'')+delta}</div><div style="font-size:11px;color:var(--t3)">${delta==null?'sin score propio todavía':(delta>=0?'por encima del sector':'bajo el sector')}</div></div>
        <div class="card card-p"><div class="card-t" style="font-size:12px">NPS del programa</div><div style="font-size:30px;font-weight:800;color:${npsScore==null?'var(--t3)':npsScore>=50?'var(--green)':npsScore>=0?'var(--amber)':'var(--red)'}">${npsScore==null?'—':npsScore}</div><div style="font-size:11px;color:var(--t3)">${nps.respuestas} respuesta(s)</div></div>
      </div>

      <div class="grid g2" style="gap:14px;margin-bottom:16px">
        <div class="card card-p">
          <div class="card-t" style="margin-bottom:12px">📊 Benchmark vs industria (${industria})</div>
          <div style="margin-bottom:10px"><div class="between" style="margin-bottom:3px"><span style="font-size:12px">Tu programa</span><b>${mio==null?'—':mio}</b></div><div class="bar" style="height:9px"><i style="width:${mio||0}%;background:var(--brand)"></i></div></div>
          <div style="margin-bottom:10px"><div class="between" style="margin-bottom:3px"><span style="font-size:12px">Promedio industria</span><b>${refInd}</b></div><div class="bar" style="height:9px"><i style="width:${refInd}%;background:var(--t3)"></i></div></div>
          <div style="margin-bottom:6px"><div class="between" style="margin-bottom:3px"><span style="font-size:12px">Top performers del sector</span><b>85</b></div><div class="bar" style="height:9px"><i style="width:85%;background:var(--green)"></i></div></div>
          <div style="margin-top:10px">${ui.aiBox(delta>=0?'Estás por encima del promedio de tu industria. El siguiente objetivo es acercarte al top performer (85).':'Estás por debajo del promedio del sector. Prioriza los planes de acción en las sucursales más débiles para cerrar la brecha.','Análisis competitivo')}</div>
        </div>
        <div class="card card-p">
          <div class="between" style="margin-bottom:12px"><div class="card-t">😊 NPS · ¿Recomendarías el programa?</div><button class="btn btn-pr btn-sm" id="npsBtn">Responder NPS</button></div>
          ${nps.respuestas?`
            <div class="grid g3" style="gap:8px;margin-bottom:8px">
              <div style="text-align:center;padding:9px;background:#f0fdf4;border-radius:8px"><div style="font-size:18px;font-weight:800;color:var(--green)">${nps.promotores}</div><div style="font-size:10px;color:var(--t3)">Promotores</div></div>
              <div style="text-align:center;padding:9px;background:#fffbeb;border-radius:8px"><div style="font-size:18px;font-weight:800;color:var(--amber)">${nps.neutros}</div><div style="font-size:10px;color:var(--t3)">Neutros</div></div>
              <div style="text-align:center;padding:9px;background:#fef2f2;border-radius:8px"><div style="font-size:18px;font-weight:800;color:var(--red)">${nps.detractores}</div><div style="font-size:10px;color:var(--t3)">Detractores</div></div>
            </div>`:'<div style="font-size:12.5px;color:var(--t3);padding:12px 0">Aún no has calificado el programa. Tu opinión ayuda a la consultora a mejorar el servicio.</div>'}
          <div style="margin-top:8px;font-size:11.5px;color:var(--t3)">El NPS mide tu satisfacción con el programa de evaluación en sí (no con tus sucursales).</div>
        </div>
      </div>

      ${(()=>{
        /* datos vivos: agrupa visitas del proyecto por sucursal para score y alertas */
        const vs=data.visitas().filter(v=>v.score!=null);
        const bySuc={}; vs.forEach(v=>{const k=v.sucursal||'—';(bySuc[k]=bySuc[k]||[]).push(v.score);});
        const sucs=Object.entries(bySuc).map(([n,arr])=>({n,score:Math.round(arr.reduce((a,b)=>a+b,0)/arr.length),visitas:arr.length})).sort((a,b)=>a.score-b.score);
        const alerta=sucs.filter(s=>s.score<refInd).slice(0,6);
        const top=sucs.slice().reverse().slice(0,3);
        return `<div class="grid g2" style="gap:14px;margin-bottom:16px">
          <div class="card card-p"><div class="card-t" style="margin-bottom:10px">🚨 Sucursales con alerta (bajo el promedio ${refInd})</div>
            ${alerta.length?alerta.map(s=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12.5px">${s.n} <span style="color:var(--t3);font-size:11px">· ${s.visitas} visita(s)</span></span><b style="color:var(--${s.score<refInd-10?'red':'amber'})">${s.score}</b></div>`).join(''):'<div style="font-size:12.5px;color:var(--t3)">Ninguna sucursal bajo el promedio del sector. 👏</div>'}
          </div>
          <div class="card card-p"><div class="card-t" style="margin-bottom:10px">💡 Oportunidades de mejora</div>
            ${alerta.length?`<ul style="margin:0;padding-left:18px;font-size:12.5px;color:var(--t2);line-height:1.7">
              <li>Plan de acción dirigido a <b>${alerta[0].n}</b> (score ${alerta[0].score}), la más rezagada.</li>
              <li>Capacitación al personal de las ${alerta.length} sucursales bajo promedio.</li>
              <li>Meta: subir el promedio del programa de ${mio} a ${Math.min(85,refInd+5)} el próximo periodo.</li>
              ${top.length?`<li>Replicar buenas prácticas de <b>${top[0].n}</b> (score ${top[0].score}).</li>`:''}
            </ul>`:'<div style="font-size:12.5px;color:var(--t3)">Programa saludable. Mantén la cadencia y apunta al top performer (85).</div>'}
          </div>
        </div>`;
      })()}

      <div class="card card-p" style="margin-bottom:16px">
        <div class="between" style="margin-bottom:12px"><div class="card-t">💬 Anotaciones colaborativas</div><button class="btn btn-soft btn-sm" id="notaBtn">＋ Anotar sobre un resultado</button></div>
        ${notas.length?notas.map((n,i)=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${n.tema}</b><div style="font-size:12px;color:var(--t2)">${n.txt}</div><div style="font-size:10.5px;color:var(--t3)">${n.por} · ${n.fecha}</div></div>${n.estado?`<span class="bdg bdg-${n.estado==='resuelto'?'g':'a'}">${n.estado}</span>`:''}</div>`).join(''):'<div style="font-size:12.5px;color:var(--t3);padding:10px 0">Sin anotaciones. Comenta sobre un hallazgo o resultado; la consultora lo verá y responderá.</div>'}
      </div>

      <div class="card card-p">
        <div class="between" style="margin-bottom:12px"><div class="card-t">📅 Reuniones de revisión con la consultora</div><button class="btn btn-pr btn-sm" id="reuBtn">＋ Agendar reunión</button></div>
        ${reuniones.length?reuniones.map(r=>`<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${r.tema}</b><div style="font-size:11.5px;color:var(--t3)">${r.fecha} ${r.hora} · ${r.modo}</div></div><span class="bdg bdg-b">${r.estado||'Solicitada'}</span></div>`).join(''):'<div style="font-size:12.5px;color:var(--t3);padding:10px 0">Sin reuniones. Agenda una sesión de revisión de resultados con tu consultora.</div>'}
      </div>`;

    host.querySelector('#npsBtn').addEventListener('click',()=>ui.modal('😊 Califica el programa',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Del 0 al 10, ¿qué tan probable es que recomiendes este programa de evaluación a otra empresa?</p>
      <div class="flex wrap" style="gap:6px;justify-content:center" id="npsScale">${Array.from({length:11},(_,i)=>`<button class="btn btn-ghost btn-sm npsN" data-n="${i}" style="min-width:38px">${i}</button>`).join('')}</div>
      <textarea class="inp" id="npsCom" rows="2" placeholder="¿Por qué? (opcional)" style="margin-top:12px"></textarea>
    `,{onMount:(ov,close)=>ov.querySelectorAll('.npsN').forEach(b=>b.addEventListener('click',()=>{
      const n=+b.dataset.n; const st2=load(); st2.nps=st2.nps||{promotores:0,neutros:0,detractores:0,respuestas:0};
      if(n>=9)st2.nps.promotores++; else if(n>=7)st2.nps.neutros++; else st2.nps.detractores++;
      st2.nps.respuestas++; st2.nps.comentarios=st2.nps.comentarios||[]; const c=ov.querySelector('#npsCom').value.trim(); if(c)st2.nps.comentarios.push({n,c});
      save(st2); close(); draw(); ui.toast('¡Gracias por tu calificación!','ok');
    }))}));

    host.querySelector('#notaBtn').addEventListener('click',()=>ui.modal('💬 Anotar sobre un resultado',`
      <label class="lbl">Sobre qué (sucursal, hallazgo, sección)</label><input class="inp" id="ntTema" placeholder="Ej. Sucursal Centro · tiempos de espera" style="margin-bottom:8px">
      <label class="lbl">Tu comentario</label><textarea class="inp" id="ntTxt" rows="3" placeholder="Ej. Ya corregimos esto, revisar en la próxima ronda" style="margin-bottom:10px"></textarea>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ntOk">Enviar a la consultora</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#ntOk').addEventListener('click',()=>{
      const tema=(ov.querySelector('#ntTema').value||'').trim(); const txt=(ov.querySelector('#ntTxt').value||'').trim();
      if(!tema||!txt){ui.toast('Completa el tema y el comentario','warn');return;}
      const st2=load(); st2.notas=st2.notas||[]; st2.notas.unshift({tema,txt,por:(CX.session.user&&CX.session.user.name)||'Cliente',fecha:new Date().toISOString().slice(0,10),estado:'pendiente'});
      save(st2); if(CX.notif&&CX.notif.push)CX.notif.push({to:'admin',tipo:'nota_cliente',icon:'💬',tono:'b',titulo:'Anotación del cliente',txt:tema,nav:'informes'});
      close(); draw(); ui.toast('Anotación enviada a la consultora','ok');
    })}));

    host.querySelector('#reuBtn').addEventListener('click',()=>ui.modal('📅 Agendar reunión de revisión',`
      <label class="lbl">Tema</label><input class="inp" id="ruTema" placeholder="Ej. Revisión de resultados del periodo" style="margin-bottom:8px">
      <div class="grid g2" style="gap:8px;margin-bottom:8px"><div><label class="lbl">Fecha</label><input class="inp" id="ruF" type="date" value="${new Date(Date.now()+3*864e5).toISOString().slice(0,10)}"></div><div><label class="lbl">Hora</label><input class="inp" id="ruH" type="time" value="10:00"></div></div>
      <label class="lbl">Modalidad</label><select class="sel" id="ruM" style="margin-bottom:10px"><option>Videollamada (Meet/Teams)</option><option>Presencial</option><option>Telefónica</option></select>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ruOk">Solicitar reunión</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#ruOk').addEventListener('click',()=>{
      const tema=(ov.querySelector('#ruTema').value||'').trim(); if(!tema){ui.toast('Pon un tema','warn');return;}
      const st2=load(); st2.reuniones=st2.reuniones||[]; st2.reuniones.unshift({tema,fecha:ov.querySelector('#ruF').value,hora:ov.querySelector('#ruH').value,modo:ov.querySelector('#ruM').value,estado:'Solicitada'});
      save(st2); if(CX.notif&&CX.notif.push)CX.notif.push({to:'admin',tipo:'reunion_cliente',icon:'📅',tono:'a',titulo:'El cliente solicita reunión',txt:tema,nav:'crm'});
      close(); draw(); ui.toast('Reunión solicitada · la consultora confirmará','ok',3500);
    })}));
  };

  draw();
  return host;
});
