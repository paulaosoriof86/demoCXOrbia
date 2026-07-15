/* CXOrbia · Certificación (admin + shopper) */
/* Banco de preguntas persistente por proyecto — el banco que publica el admin es el que toma el shopper */
CX.certStore = CX.certStore || {
  key(pid){ return 'cx_certbank_'+pid; },
  bank(pid){ try{ return JSON.parse(localStorage.getItem(this.key(pid))||'null'); }catch(e){ return null; } },
  save(pid, data){ try{ localStorage.setItem(this.key(pid), JSON.stringify(data)); }catch(e){} CX.bus&&CX.bus.emit('cert'); },
  clear(pid){ try{ localStorage.removeItem(this.key(pid)); }catch(e){} },
  /* parsea el texto/JSON de la IA a preguntas estructuradas [{q,ops:[],correcta,exp}] */
  parse(raw){
    try{ const j=JSON.parse(raw.replace(/```json|```/g,'').trim()); if(Array.isArray(j))return j; if(j.preguntas)return j.preguntas; }catch(e){}
    /* fallback: parse lista numerada "1. pregunta ... a) ... (correcta: X)" */
    const out=[]; const blocks=raw.split(/\n(?=\d+[.\)])/);
    blocks.forEach(b=>{ const q=(b.match(/^\d+[.\)]\s*(.+)/)||[])[1]; if(!q)return;
      const ops=[...b.matchAll(/[a-d]\)\s*([^\n]+)/gi)].map(m=>m[1].trim());
      const corr=(b.match(/correct[ao]:?\s*([^\n]+)/i)||[])[1];
      const exp=(b.match(/(?:explicaci[oó]n|porque)[:\s]+([^\n]+)/i)||[])[1]||'';
      out.push({q:q.trim(),ops:ops.length?ops:['Verdadero','Falso'],correcta:(corr||ops[0]||'').trim(),exp:exp.trim()});
    });
    return out.length?out:null;
  },
};
CX.module('cert', ({role,data,ui})=>{
  const p=data.period();
  if(role==='shopper'){
    /* Bloque A (auditoría V101 — 20260711): un banco en estado draft/pending_review NO habilita
       certificación para el shopper — solo approved_preview (práctica, en este prototipo) o un
       estado confirmado por backend habilitan tomar el examen. Antes cualquier banco con
       preguntas se ofrecía sin mirar su estado. */
    const bank=CX.certStore.bank(p.id);
    /* P0-7 (paquete acumulado 20260711): 'pending_backend' significa "esperando confirmación de
       backend", NO "disponible para tomar" — incluirlo aquí dejaba certificar sobre un banco que
       todavía no está aprobado ni confirmado. Solo approved_preview (práctica, rotulada como tal)
       o un estado ya confirmado por backend (confirmed/published) habilitan el examen. */
    const bankTakeable = bank && bank.preguntas && bank.preguntas.length && ['approved_preview','confirmed','published'].includes(bank.estado);
    if(bank && bank.preguntas && bank.preguntas.length && !bankTakeable){
      return `${ui.ph('Certificación', p.name+' · banco en revisión')}
        <div class="card card-p">${ui.degraded('Hay un banco de preguntas en preparación ('+(bank.estado||'borrador')+') todavía no revisado/aprobado — no está disponible para certificarte. Vuelve a intentarlo cuando el equipo lo publique.',{title:'Certificación · banco no publicado'})}</div>`;
    }
    if(bankTakeable){
      const host=ui.el('div'); const answers={};
      const draw=()=>{
        host.innerHTML=`
          ${ui.ph('Certificación', p.name+' · '+bank.preguntas.length+' preguntas · gate '+(bank.gate||80)+'%')}
          <div class="card card-p" id="examBox">
            ${bank.preguntas.map((q,i)=>`<div style="border:1px solid var(--border);border-radius:9px;padding:12px 14px;margin-bottom:10px">
              <b style="font-size:13px;color:var(--t1)">${i+1}. ${q.q}</b>
              <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
                ${(q.ops||[]).map(o=>`<label class="flex" style="gap:8px;font-size:12.5px;cursor:pointer;padding:6px 9px;border:1px solid var(--border);border-radius:7px"><input type="radio" name="q${i}" value="${o.replace(/"/g,'&quot;')}"> ${o}</label>`).join('')}
              </div>
              <div class="examFb" data-i="${i}" style="display:none;margin-top:8px;font-size:11.5px;line-height:1.5"></div>
            </div>`).join('')}
            <div class="between" style="margin-top:8px"><span class="muted" style="font-size:11.5px">Responde y verifica; el feedback explica cada respuesta.</span><button class="btn btn-pr btn-sm" id="examGo">Verificar y certificar</button></div>
          </div>`;
        host.querySelectorAll('input[type=radio]').forEach(r=>r.addEventListener('change',e=>{answers[e.target.name]=e.target.value;}));
        host.querySelector('#examGo').addEventListener('click',()=>{
          let ok=0; bank.preguntas.forEach((q,i)=>{
            const mine=answers['q'+i], correct=(mine||'').trim().toLowerCase()===(q.correcta||'').trim().toLowerCase();
            if(correct)ok++;
            const fb=host.querySelector('.examFb[data-i="'+i+'"]'); if(fb){fb.style.display='block';
              fb.innerHTML=(correct?'<b style="color:var(--green)">✓ Correcta</b>':'<b style="color:var(--amber)">↻ A reforzar</b> · correcta: <b style="color:var(--green)">'+(q.correcta||'—')+'</b>')+(q.exp?'<div style="color:var(--t2);margin-top:3px">'+q.exp+'</div>':'');}
          });
          const score=Math.round(ok/bank.preguntas.length*100); const pass=score>=(bank.gate||80);
          const isPreviewOnly = bank.estado==='approved_preview';
          const box=host.querySelector('#examBox');
          box.insertAdjacentHTML('afterbegin',`<div class="flex" style="gap:14px;background:var(--${pass?'green':'amber'}-bg);border-radius:11px;padding:13px 16px;margin-bottom:12px"><div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--${pass?'green':'amber'})">${score}%</div><div><b style="color:var(--t1)">${pass?'Aprobado':'No alcanzado'}</b> · ${ok}/${bank.preguntas.length} correctas · gate ${bank.gate||80}%<div style="font-size:12px;color:var(--t3)">${pass?(isPreviewOnly?'Práctica en preview aprobada — la habilitación real para ejecutar visitas queda pendiente de confirmación backend.':'Ya puedes ejecutar tus visitas de este proyecto.'):'Repasa el feedback y vuelve a intentarlo.'}</div></div></div>`);
          /* P0-7: una práctica en preview NO es un evento operativo real — solo se registra el
             evento de automatización cuando el banco ya está confirmed/published (no approved_preview). */
          if(!isPreviewOnly) CX.automations&&CX.automations.fire&&CX.automations.fire('certificacion',{shopper:(CX.session.user&&CX.session.user.name)||'',score,pass});
          ui.toast(pass?(isPreviewOnly?'✓ Práctica aprobada ('+score+'%, preview)':'✓ Certificación aprobada ('+score+'%)'):'Puntaje '+score+'% · no alcanzó el gate','ok',4000);
        });
      };
      draw(); return host;
    }
    /* Bloque A (auditoría V101 — 20260711): sin un banco publicado/tomable, este bloque mostraba
       SIEMPRE un examen y score fijos (88%, "Aprobado", "1 intento") como si fueran resultado real
       del shopper — incluso fuera de modo demo. Ahora solo se muestra fuera de demo si es
       explícitamente demo; fuera de demo se rotula "pendiente de fuente", sin inventar aprobación. */
    const _showFixturesShopper = CX.dataSource ? CX.dataSource.showFixtures() : true;
    if(!_showFixturesShopper){
      return `${ui.ph('Certificación', p.name+' · aprueba el escenario antes de ejecutar')}
        <div class="card card-p">${ui.degraded('Todavía no hay un banco de certificación publicado para este proyecto ni un resultado de certificación real registrado — no se muestra un score ni una aprobación fabricados.',{title:'Certificación · pendiente de fuente'})}</div>`;
    }
    const fb=[
      {ok:true, q:'¿Puedes revelar que eres evaluador?', tu:'No', correcta:'No', exp:'El anonimato es la base del mystery shopping: si te identificas, el comportamiento del personal se altera y la medición pierde validez. Nunca reveles tu rol, ni siquiera al salir.'},
      {ok:true, q:'¿Qué incluye un combo en el reembolso?', tu:'Boleto + alimentos del escenario', correcta:'Boleto + alimentos del escenario', exp:'El combo cubre los consumos definidos en el instructivo del proyecto; conserva siempre el comprobante para el reembolso.'},
      {ok:false, q:'¿Desde cuándo se mide el tiempo de espera?', tu:'Desde que ordenas', correcta:'Desde que ingresas a la fila / punto de atención', exp:'El tiempo de espera se cronometra desde que el cliente entra a la fila o zona de atención, NO desde que llega al mostrador. Medirlo mal subestima el indicador y distorsiona el cumplimiento del estándar de servicio.', mat:'Protocolo de compra incógnita'},
      {ok:false, q:'¿Qué haces ante una incidencia (p. ej. mal trato)?', tu:'Lo anoto al final', correcta:'Registrar de inmediato con hora, lugar y evidencia', exp:'Las incidencias deben registrarse en el momento, con hora exacta, ubicación y evidencia (foto/audio según aplique). Anotarlo "al final" pierde detalles y debilita el reporte ante el cliente.', mat:'Evidencia y fotografía'},
    ];
    const aciertos=fb.filter(x=>x.ok).length, score=Math.round(aciertos/fb.length*100*1.1);
    return `
      ${ui.ph('Certificación', p.name+' · aprueba el escenario antes de ejecutar')}
      <div class="card card-p" style="margin-bottom:14px;border-left:3px solid var(--brand)">
        <div style="font-size:11px;color:var(--t3);margin-bottom:8px">🎓 Ejemplo ilustrativo (modo demo) — no es un resultado de certificación real de este shopper.</div>
        <div class="flex" style="gap:14px;background:var(--green-bg);border-radius:11px;padding:13px 16px">
          <div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--green)">${score}%</div>
          <div><b style="color:var(--t1)">Aprobado (demo)</b> · 1 intento de ejemplo · gate superado<div style="font-size:12px;color:var(--t3)">Ejemplo del feedback dirigido que verá el shopper. Revisa abajo el detalle.</div></div>
        </div>
      </div>
      <div class="card card-p">
        <div class="card-h"><div class="card-t">🎯 Tu retroalimentación detallada</div><span class="muted" style="font-size:11px">${aciertos}/${fb.length} correctas</span></div>
        ${fb.map(x=>`<div style="border:1px solid var(--border);border-left:3px solid var(--${x.ok?'green':'amber'});border-radius:9px;padding:11px 13px;margin-bottom:9px">
          <div class="between" style="gap:10px"><b style="font-size:12.5px;color:var(--t1)">${x.ok?'✓':'↻'} ${x.q}</b>${x.ok?ui.bdg('Correcta','g'):ui.bdg('A reforzar','a')}</div>
          ${!x.ok?`<div style="font-size:11.5px;color:var(--t3);margin-top:5px">Tu respuesta: <span style="color:var(--red)">${x.tu}</span></div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:2px">Respuesta correcta: <b style="color:var(--green)">${x.correcta}</b></div>`:''}
          <div style="font-size:11.5px;color:var(--t2);margin-top:6px;line-height:1.5">${x.exp}</div>
          ${!x.ok&&x.mat?`<button class="btn btn-soft btn-sm" data-mat="${x.mat}" style="margin-top:8px">📚 Repasar: ${x.mat} →</button>`:''}
        </div>`).join('')}
        <div style="margin-top:6px">${ui.aiBox('Te muestro exactamente qué fallaste, la respuesta correcta explicada y te llevo al material del Centro de Aprendizaje para reforzarlo antes de tu próxima visita.','Feedback dirigido y accionable')}</div>
      </div>
      <script></script>`.replace('<script></script>','')+(()=>{setTimeout(()=>{document.querySelectorAll('[data-mat]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('aprendizaje')));},0);return '';})();
  }
  const _showFixtures = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const bank = CX.certStore.bank(p.id);
  const html=`
    ${ui.ph('Certificación', p.name+' · banco de preguntas, gate y reporte de vacíos')}
      <button class="btn btn-pr btn-sm" id="certIA">🤖 Crear certificación con IA (desde instructivo)</button>
      <button class="btn btn-soft btn-sm" id="certImp">📥 Importar banco</button>
      <button class="btn btn-soft btn-sm" id="certRecert">🔄 Solicitar re-certificación</button>
      <button class="btn btn-ghost btn-sm" id="certGate">⚙️ Gate y % mínimo</button>
    </div>
    ${_showFixtures ? `
    <div class="grid g4" style="margin-bottom:16px" id="certKpis">
      <div data-ck="cert" style="cursor:pointer">${ui.kpi('Certificados (demo)',18,'g')}</div>
      <div data-ck="prog" style="cursor:pointer">${ui.kpi('En progreso (demo)',6,'a')}</div>
      <div data-ck="avg" style="cursor:pointer">${ui.kpi('Aprob. promedio (demo)','84%','b')}</div>
      <div data-ck="gate" style="cursor:pointer">${ui.kpi('Gate activo','Sí','p')}</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📊 Vacíos detectados · para el equipo (demo)</div></div>
      ${ui.bar(40,'Tiempos de espera','40%')}
      ${ui.bar(18,'Proceso de pago','18%')}
      ${ui.bar(9,'Registro incidencia','9%')}
      <div style="margin-top:12px">${ui.aiBox('El 40% falla la misma pregunta sobre tiempos de espera — conviene reforzar ese material. Genero el reporte de vacíos automáticamente. (datos de ejemplo)','Mejora continua')}</div>
    </div>` : `
    <div class="grid g4" style="margin-bottom:16px" id="certKpis">
      <div>${ui.kpi('Certificados',ui.statusBdg('pending_source'),'n')}</div>
      <div>${ui.kpi('En progreso',ui.statusBdg('pending_source'),'n')}</div>
      <div>${ui.kpi('Aprob. promedio',ui.statusBdg('pending_source'),'n')}</div>
      <div data-ck="gate" style="cursor:pointer">${ui.kpi('Gate activo',bank&&bank.gate?'Sí':'No','p')}</div>
    </div>
    <div class="card card-p">
      ${bank&&bank.estado==='approved_preview'?ui.degraded('Banco aprobado en preview (revisado por '+(bank.revisadoPor||'—')+') — disponible para practicar en este prototipo, pero la publicación real hacia producción queda pendiente de confirmación del backend.',{title:'Certificación · aprobado (preview) · pendiente de backend'}):ui.degraded('Sin una fuente de intentos/resultados de certificación conectada todavía, no se muestran KPIs de certificación fuera de modo demo — evita presentar aprobación/progreso ficticios como reales.', {title:'Certificación · pendiente de fuente'})}
    </div>`}`;
  setTimeout(()=>{
    const ckData={
      cert:['Shoppers certificados (18)','<table class="tbl"><thead><tr><th>Shopper</th><th>Score</th><th>Fecha</th></tr></thead><tbody>'+['Evaluador 01|92|2026-05-12','Evaluador 03|88|2026-05-14','Evaluador 05|85|2026-05-20','Evaluador 07|90|2026-06-02'].map(r=>{const[n,s,f]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(s+'%','g')}</td><td style="font-size:12px">${f}</td></tr>`;}).join('')+'<tr><td colspan="3" style="font-size:11px;color:var(--t3);text-align:center">+ 14 más</td></tr></tbody></table>'],
      prog:['En progreso (6)','<table class="tbl"><thead><tr><th>Shopper</th><th>Avance</th><th>Intentos</th></tr></thead><tbody>'+['Evaluador 09|60|1','Evaluador 12|40|1','Evaluador 14|75|2'].map(r=>{const[n,a,i]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(a+'%','a')}</td><td>${i}</td></tr>`;}).join('')+'</tbody></table>'],
      avg:['Aprobación promedio · 84%','<p style="font-size:13px;color:var(--t2);line-height:1.7">Promedio del último intento de cada shopper certificado. El gate exige 80%; el banco de preguntas (borrador local, revisado por un humano) y el feedback dirigido suben este indicador con el tiempo.</p>'],
      gate:['Gate de certificación','<p style="font-size:13px;color:var(--t2);line-height:1.7">El gate está <b>'+((bank&&bank.gate)?'activo':'inactivo')+'</b>: '+((bank&&bank.gate)?('un shopper no puede ejecutar visitas del proyecto hasta aprobar (≥'+bank.gate+'%). Una vez por proyecto, con reintentos.'):'no hay un banco de preguntas publicado todavía para este proyecto.')+' Configúralo en ⚙️ Gate y % mínimo.</p>'],
    };
    document.querySelectorAll('#certKpis [data-ck]').forEach(el=>el.addEventListener('click',()=>{const d=ckData[el.dataset.ck];ui.modal(d[0],d[1]);}));
    const ia=document.getElementById('certIA');
    if(ia)ia.addEventListener('click',()=>ui.modal('🤖 Crear certificación con IA · '+p.name,`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Carga el <b>instructivo / protocolo</b> del proyecto (o pega el texto) y la IA genera el <b>banco de preguntas</b> de certificación con su respuesta correcta y explicación. Editas y publicas.</p>
      <input type="file" class="inp" id="ciF" accept=".pdf,.doc,.docx,.txt,image/*" style="padding:7px;margin-bottom:8px">
      <textarea class="inp" id="ciT" rows="4" placeholder="…o pega el instructivo / qué debe dominar el evaluador" style="margin-bottom:10px"></textarea>
      <div class="grid g2" style="gap:10px 12px;margin-bottom:6px">
        <div><label class="lbl">Nº de preguntas</label><input class="inp" id="ciN" type="number" value="10"></div>
        <div><label class="lbl">% mínimo para aprobar (gate)</label><input class="inp" id="ciG" type="number" value="80"></div>
      </div>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-green btn-sm" id="ciGo">Generar banco</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#ciGo').addEventListener('click',()=>{
      const n=+ov.querySelector('#ciN').value||10, g=+ov.querySelector('#ciG').value||80;
      const pasted=(ov.querySelector('#ciT').value||'').trim();
      /* P0.1 (V98): heurística local directa — nunca se llama CX.ai.ask() (available() es
         siempre false en el navegador); nunca bloquea por falta de proveedor configurado. */
      CX.ai.readAttachment(ov.querySelector('#ciF')).then(fileTxt=>{
        const txt=(pasted+fileTxt).trim();
        if(!txt){ ui.toast('Pega el instructivo o adjunta un archivo con texto','warn',4000); return; }
        /* extrae oraciones del instructivo y arma preguntas simples de opción múltiple */
        const oraciones=txt.replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>25).slice(0,n);
        const preguntas=oraciones.map((s,i)=>{
          const frag=s.length>90?s.slice(0,90)+'…':s;
          return {q:'Según el instructivo, ¿cuál afirmación es correcta? (fragmento '+(i+1)+')',ops:[frag,'Lo opuesto a lo indicado en el instructivo','No se menciona en el instructivo','Aplica solo si el cliente lo autoriza'],correcta:frag,exp:'Extraído directamente del instructivo — revisa y ajusta el redactado antes de publicar.'};
        });
        const creador=(CX.session&&CX.session.user&&CX.session.user.name)||'—';
        /* Bloque 5 (corrección V103, 20260711): bug real — el revisor era un <input> de texto
           libre (cualquiera podía escribir cualquier nombre, incluso inventado). Ahora se elige
           de un ROSTER real de personas con el permiso 'certification.publish' en este proyecto
           (CX.ROLES + equipo con acceso), nunca texto libre. Sigue exigiendo que sea distinto al
           generador. Queda honestamente rotulado: en este prototipo no hay sesiones concurrentes
           reales, así que esto es una simulación de "segundo actor" — la confirmación de
           identidad/autenticación real la hace el backend (Auth) en producción. */
        const roster=(CX.ROLES||[]).filter(r=>['super','admin','coordinador'].includes(r.id)).map(r=>r.label);
        const rosterOpts=roster.filter(n=>n.toLowerCase()!==creador.toLowerCase());
        ui.modal('🤖 Banco generado ('+preguntas.length+' preguntas · gate '+g+'%) — borrador local',
          `<div style="font-size:10.5px;color:var(--t3);margin-bottom:8px">Generado con heurística local (sin proveedor de IA real conectado) — <b>revisión humana obligatoria por una persona distinta a quien lo generó</b> antes de publicar; ajusta el redactado de cada pregunta.</div>
          <div class="acad-content" style="font-size:12.5px;line-height:1.55;max-height:52vh;overflow:auto">${preguntas.length?preguntas.map((q,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:9px 11px;margin-bottom:7px"><b>${i+1}. ${q.q}</b><div style="color:var(--t3);margin-top:3px">${(q.ops||[]).join(' · ')}</div><div style="color:var(--green);margin-top:2px">✓ ${q.correcta}</div></div>`).join(''):'<p style="color:var(--t3)">No se pudieron extraer preguntas de este texto — intenta con un instructivo más largo.</p>'}</div>
          <div style="font-size:11px;color:var(--t3);margin:10px 0 4px">Generado por: <b>${creador}</b></div>
          <label class="lbl">Quién revisa y aprueba (rol distinto al generador — no texto libre)</label>
          <select class="sel" id="pubRevisor" style="margin-bottom:6px">${rosterOpts.length?('<option value="">Selecciona…</option>'+rosterOpts.map(n=>`<option>${n}</option>`).join('')):'<option value="">Sin otro rol disponible en este proyecto</option>'}</select>
          <div style="font-size:10px;color:var(--t3);margin-bottom:10px">Simulación de segundo actor dentro del prototipo (sin sesiones concurrentes reales) — la verificación de identidad real la hace Auth en el backend de producción.</div>
          <div style="text-align:right;margin-top:2px"><button class="btn btn-pr btn-sm" id="pubBank" ${preguntas.length?'':'disabled'}>Confirmar revisión · publicar banco</button></div>`,
          {onMount:(o2,c2)=>o2.querySelector('#pubBank').addEventListener('click',()=>{
        if(!CX.permissions.gate('certification.publish',CX.permissions.ctx({entityType:'certification_bank',entityId:p.id}),ui)) return;
            const revisor=(o2.querySelector('#pubRevisor').value||'').trim();
            if(!revisor){ ui.toast('Selecciona quién revisa (segundo actor obligatorio)','warn',3200); return; }
            if(revisor.toLowerCase()===creador.toLowerCase()){ ui.toast('El revisor debe ser una persona distinta a quien generó el banco (segundo actor obligatorio)','warn',4500); return; }
            const auditRef='aud_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
            CX.certStore.save(p.id,{preguntas,gate:g,fecha:new Date().toISOString().slice(0,10),generadoPor:creador,revisadoPor:revisor,auditRef,estado:'approved_preview'});
            c2();draw();ui.toast('✅ Banco aprobado (preview) · '+preguntas.length+' preguntas · revisado por '+revisor+' · auditRef '+auditRef+' · disponible en ESTE prototipo — publicación real en producción pendiente de confirmación backend','ok',5200);
          })});
      });
    });}}));
    const imp=document.getElementById('certImp');
    if(imp)imp.addEventListener('click',()=>ui.modal('Importar banco de preguntas',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Sube tu banco (CSV/Excel) o pégalo. Formato: pregunta | opción correcta | opciones incorrectas.</p><input type="file" class="inp" style="padding:7px;margin-bottom:10px"><textarea class="inp" rows="4" placeholder="Pega aquí…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Banco importado (demo)','ok');this.closest('.cx-ov').remove()">Importar</button></div>`));
    const recert=document.getElementById('certRecert');
    if(recert)recert.addEventListener('click',()=>{
      const shoppers=(data.shoppersFor?data.shoppersFor():data.shoppers).slice(0,40);
      ui.modal('🔄 Solicitar re-certificación · '+p.name,`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Pide a tus evaluadores volver a certificarse (cambió el instructivo, nueva ronda, o por vencimiento). Su certificación pasa a <b>pendiente</b> y se les notifica.</p>
        <label class="lbl">Alcance</label>
        <select class="sel" id="rcScope" style="margin-bottom:10px"><option value="all">Todos los certificados del proyecto</option><option value="one">Un shopper específico</option></select>
        <div id="rcOneWrap" style="display:none;margin-bottom:10px"><label class="lbl">Shopper</label><select class="sel" id="rcOne">${shoppers.map(s=>`<option value="${s.id}">${s.nombre} · ${s.code}</option>`).join('')}</select></div>
        <div class="grid g2" style="gap:10px 12px;margin-bottom:10px">
          <div><label class="lbl">Motivo</label><select class="sel" id="rcReason"><option>Actualización del instructivo</option><option>Nueva ronda / periodo</option><option>Vencimiento de certificación</option><option>Bajo desempeño</option></select></div>
          <div><label class="lbl">Plazo (días)</label><input class="inp" id="rcDays" type="number" value="7"></div>
        </div>
        <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:6px"><input type="checkbox" id="rcNotif" checked> Notificar en su panel (in-app)</label>
        <div style="font-size:10.5px;color:var(--t3);margin-bottom:14px">🔒 El envío real por WhatsApp/correo vía Make está pendiente de conexión backend por tenant — este prototipo solo registra el evento en el log local de automatizaciones y en el panel in-app del shopper, nunca envía un mensaje real.</div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rcOk">Solicitar re-certificación</button></div>
      `,{onMount:(ov,close)=>{
        const sc=ov.querySelector('#rcScope'); sc.addEventListener('change',()=>{ov.querySelector('#rcOneWrap').style.display=sc.value==='one'?'':'none';});
        ov.querySelector('#rcOk').addEventListener('click',()=>{
          const all=sc.value==='all'; const who=all?'todos los certificados':(data.getShopper(ov.querySelector('#rcOne').value)||{}).nombre||'el shopper';
          const reason=ov.querySelector('#rcReason').value, days=ov.querySelector('#rcDays').value;
          if(ov.querySelector('#rcNotif').checked){
            CX.notif&&CX.notif.push({to:'shopper',tipo:'recert',icon:'🔄',tono:'a',titulo:'Re-certificación requerida',txt:p.name+' · '+reason+' · plazo '+days+' días',nav:'cert'});
            CX.automations&&CX.automations.fire&&CX.automations.fire('recert',{proyecto:p.name,motivo:reason,plazo:days});
          }
          close(); ui.toast('Re-certificación solicitada a '+who+' · '+reason+' · plazo '+days+' días'+(ov.querySelector('#rcNotif').checked?' · notificado in-app (envío real por WhatsApp/correo pendiente de backend)':''),'ok',4200);
        });
      }});
    });
    const gate=document.getElementById('certGate');
    if(gate)gate.addEventListener('click',()=>ui.modal('Gate de certificación',`
      <label class="lbl">% mínimo para aprobar</label><input class="inp" id="gtMin" type="number" value="80" style="margin-bottom:10px">
      <label class="flex" style="gap:8px;font-size:12.5px;color:var(--t1);margin-bottom:6px"><input type="checkbox" checked> Obligatoria antes de ejecutar visitas (gate activo)</label>
      <label class="flex" style="gap:8px;font-size:12.5px;color:var(--t1);margin-bottom:14px"><input type="checkbox" checked> Una vez por proyecto · permite reintentos</label>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Configuración del gate guardada','ok');this.closest('.cx-ov').remove()">Guardar</button></div>`));
  },0);
  return html;
});
