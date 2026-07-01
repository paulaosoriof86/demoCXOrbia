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
  const p=data.project();
  if(role==='shopper'){
    /* si el admin publicó un banco para este proyecto, el shopper lo toma como examen interactivo real */
    const bank=CX.certStore.bank(p.id);
    if(bank && bank.preguntas && bank.preguntas.length){
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
          const box=host.querySelector('#examBox');
          box.insertAdjacentHTML('afterbegin',`<div class="flex" style="gap:14px;background:var(--${pass?'green':'amber'}-bg);border-radius:11px;padding:13px 16px;margin-bottom:12px"><div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--${pass?'green':'amber'})">${score}%</div><div><b style="color:var(--t1)">${pass?'Aprobado':'No alcanzado'}</b> · ${ok}/${bank.preguntas.length} correctas · gate ${bank.gate||80}%<div style="font-size:12px;color:var(--t3)">${pass?'Ya puedes ejecutar tus visitas de este proyecto.':'Repasa el feedback y vuelve a intentarlo.'}</div></div></div>`);
          CX.automations&&CX.automations.fire&&CX.automations.fire('certificacion',{shopper:(CX.session.user&&CX.session.user.name)||'',score,pass});
          ui.toast(pass?'✓ Certificación aprobada ('+score+'%)':'Puntaje '+score+'% · no alcanzó el gate','ok',4000);
        });
      };
      draw(); return host;
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
      <div class="card card-p" style="margin-bottom:14px">
        <div class="flex" style="gap:14px;background:var(--green-bg);border-radius:11px;padding:13px 16px">
          <div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--green)">88%</div>
          <div><b style="color:var(--t1)">Aprobado</b> · 1 intento · gate superado<div style="font-size:12px;color:var(--t3)">Ya puedes ejecutar tus visitas de este proyecto. Revisa abajo el detalle para mejorar.</div></div>
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
  const html=`
    ${ui.ph('Certificación', p.name+' · banco de preguntas, gate y reporte de vacíos')}
    <div class="flex wrap" style="gap:8px;margin-bottom:14px">
      <button class="btn btn-pr btn-sm" id="certIA">🤖 Crear certificación con IA (desde instructivo)</button>
      <button class="btn btn-soft btn-sm" id="certImp">📥 Importar banco</button>
      <button class="btn btn-soft btn-sm" id="certRecert">🔄 Solicitar re-certificación</button>
      <button class="btn btn-ghost btn-sm" id="certGate">⚙️ Gate y % mínimo</button>
    </div>
    <div class="grid g4" style="margin-bottom:16px" id="certKpis">
      <div data-ck="cert" style="cursor:pointer">${ui.kpi('Certificados',18,'g')}</div>
      <div data-ck="prog" style="cursor:pointer">${ui.kpi('En progreso',6,'a')}</div>
      <div data-ck="avg" style="cursor:pointer">${ui.kpi('Aprob. promedio','84%','b')}</div>
      <div data-ck="gate" style="cursor:pointer">${ui.kpi('Gate activo','Sí','p')}</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📊 Vacíos detectados · para el equipo</div></div>
      ${ui.bar(40,'Tiempos de espera','40%')}
      ${ui.bar(18,'Proceso de pago','18%')}
      ${ui.bar(9,'Registro incidencia','9%')}
      <div style="margin-top:12px">${ui.aiBox('El 40% falla la misma pregunta sobre tiempos de espera — conviene reforzar ese material. Genero el reporte de vacíos automáticamente.','Mejora continua')}</div>
    </div>`;
  setTimeout(()=>{
    const ckData={
      cert:['Shoppers certificados (18)','<table class="tbl"><thead><tr><th>Shopper</th><th>Score</th><th>Fecha</th></tr></thead><tbody>'+['Evaluador 01|92|2026-05-12','Evaluador 03|88|2026-05-14','Evaluador 05|85|2026-05-20','Evaluador 07|90|2026-06-02'].map(r=>{const[n,s,f]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(s+'%','g')}</td><td style="font-size:12px">${f}</td></tr>`;}).join('')+'<tr><td colspan="3" style="font-size:11px;color:var(--t3);text-align:center">+ 14 más</td></tr></tbody></table>'],
      prog:['En progreso (6)','<table class="tbl"><thead><tr><th>Shopper</th><th>Avance</th><th>Intentos</th></tr></thead><tbody>'+['Evaluador 09|60|1','Evaluador 12|40|1','Evaluador 14|75|2'].map(r=>{const[n,a,i]=r.split('|');return `<tr><td><b>${n}</b></td><td>${CX.ui.bdg(a+'%','a')}</td><td>${i}</td></tr>`;}).join('')+'</tbody></table>'],
      avg:['Aprobación promedio · 84%','<p style="font-size:13px;color:var(--t2);line-height:1.7">Promedio del último intento de cada shopper certificado. El gate exige 80%; el banco generado con IA y el feedback dirigido suben este indicador con el tiempo.</p>'],
      gate:['Gate de certificación','<p style="font-size:13px;color:var(--t2);line-height:1.7">El gate está <b>activo</b>: un shopper no puede ejecutar visitas del proyecto hasta aprobar (≥80%). Una vez por proyecto, con reintentos. Configúralo en ⚙️ Gate y % mínimo.</p>'],
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
      if(CX.ai&&CX.ai.ready()){
        ui.toast('Leyendo instructivo y generando con '+CX.ai.cfg().model+'…','',2500);
        CX.ai.readAttachment(ov.querySelector('#ciF')).then(fileTxt=>{
          const txt=(pasted+fileTxt).trim();
          if(!txt){ ui.toast('Pega el instructivo o adjunta un archivo con texto','warn',4000); return; }
          return CX.ai.ask('A partir de este instructivo de mystery shopping, genera '+n+' preguntas de certificación de opción múltiple. Devuelve SOLO JSON: un array de objetos {"q":"pregunta","ops":["a","b","c","d"],"correcta":"texto exacto de la opción correcta","exp":"explicación breve"}. Sin texto adicional.\n\nINSTRUCTIVO:\n'+txt)
          .then(res=>{close();
            const preguntas=CX.certStore.parse(res)||[];
            ui.modal('🤖 Banco generado ('+preguntas.length+' preguntas · gate '+g+'%)',
              `<div class="acad-content" style="font-size:12.5px;line-height:1.55;max-height:52vh;overflow:auto">${preguntas.length?preguntas.map((q,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:9px 11px;margin-bottom:7px"><b>${i+1}. ${q.q}</b><div style="color:var(--t3);margin-top:3px">${(q.ops||[]).join(' · ')}</div><div style="color:var(--green);margin-top:2px">✓ ${q.correcta}</div></div>`).join(''):'<pre style="white-space:pre-wrap">'+res.replace(/</g,'&lt;')+'</pre>'}</div>
              <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="pubBank">Publicar banco (lo tomará el shopper)</button></div>`,
              {onMount:(o2,c2)=>o2.querySelector('#pubBank').addEventListener('click',()=>{
                CX.certStore.save(p.id,{preguntas,gate:g,fecha:new Date().toISOString().slice(0,10)});
                c2();draw();ui.toast('✅ Banco publicado · '+preguntas.length+' preguntas · ya disponible para los shoppers','ok',4200);
              })});
          });
        }).catch(e=>{close();ui.toast('Error IA: '+e.message,'warn');});
      } else { close();ui.toast('Configura un proveedor de IA (Integraciones) para generar el banco real.','warn',4500); }
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
        <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-bottom:14px"><input type="checkbox" id="rcNotif" checked> Notificar por WhatsApp/correo (Make) y en su panel</label>
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
          close(); ui.toast('Re-certificación solicitada a '+who+' · '+reason+' · plazo '+days+' días'+(ov.querySelector('#rcNotif').checked?' · notificados':''),'ok',4200);
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
