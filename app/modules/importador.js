/* CXOrbia · Importador inteligente (UI) — admin */
CX.module('importador', ({data,ui})=>{
  const p=data.project();
  const host=ui.el('div');
  let st={step:1, parsed:null, map:{}, cands:[], diff:null};

  const FIELDS=CX.importador.FIELDS;
  const fieldOpts=(sel)=>`<option value="">— ignorar —</option>`+Object.keys(FIELDS).map(f=>`<option value="${f}" ${f===sel?'selected':''}>${FIELDS[f].label}</option>`).join('');

  const draw=()=>{
    let body='';
    if(st.step===1){
      body=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">1 · Pega o carga tu archivo</div><button class="btn btn-ghost btn-sm" id="impSample">Cargar ejemplo</button></div>
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Pega tu Hoja de Ruta o histórico (desde Excel/Google Sheets o CSV). El sistema detecta las columnas automáticamente — sirve para <b>cualquier formato</b> de consultora.</p>
        <textarea class="inp" id="impTxt" rows="9" style="font-family:monospace;font-size:12px" placeholder="Pega aquí las filas con encabezado…"></textarea>
        <div class="flex" style="justify-content:space-between;align-items:center;margin-top:10px">
          <label class="btn btn-soft btn-sm" style="cursor:pointer">📎 Subir CSV<input type="file" id="impFile" accept=".csv,.tsv,.txt" style="display:none"></label>
          <button class="btn btn-pr btn-sm" id="impNext1">Detectar columnas →</button>
        </div>
      </div>`;
    } else if(st.step===2){
      const h=st.parsed.headers;
      body=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">2 · Revisa el mapeo de columnas</div><span class="bdg bdg-b">${st.parsed.rows.length} filas</span></div>
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Detecté estas columnas. Ajusta a qué campo del sistema corresponde cada una.</p>
        <div class="grid g2" style="gap:10px 14px">
          ${h.map((col,i)=>`<div><label class="lbl">${col||'(col '+(i+1)+')'}</label>
            <select class="sel impMap" data-i="${i}">${fieldOpts(st.map[i])}</select>
            <div style="font-size:10.5px;color:var(--t3);margin-top:3px">ej: ${(st.parsed.rows[0]||[])[i]||'—'}</div></div>`).join('')}
        </div>
        <div class="flex" style="justify-content:space-between;margin-top:14px"><button class="btn btn-ghost btn-sm" id="impBack2">← Atrás</button><button class="btn btn-pr btn-sm" id="impNext2">Vista previa →</button></div>
      </div>`;
    } else {
      const d=st.diff;
      const rowHTML=(c,dup)=>`<tr style="${dup?'opacity:.5':''}"><td>${c.ref}</td><td><b style="font-size:12px">${c.sucursal}</b><div style="font-size:10px;color:var(--t3)">${c.ciudad} ${c.franja?'· '+c.franja:''}</div></td>
        <td style="font-size:12px">${c.shopper||'<span class="muted">—</span>'}</td><td style="font-size:11.5px">${c.escenario}</td><td style="font-size:11.5px">${c.fecha||'—'}</td>
        <td style="font-size:11.5px">${c.honorario?ui.money((p.currency&&p.currency[c.pais])||'$',c.honorario):'—'}${c.reembolso?' +'+c.reembolso:''}</td><td>${ui.estadoBadge(c.estado)}</td><td>${dup?ui.bdg('Duplicado','a'):ui.bdg('Nuevo','g')}</td></tr>`;
      body=`
      <div class="card card-p">
        <div class="card-h"><div class="card-t">3 · Vista previa y confirmación</div>
          <div class="flex" style="gap:6px">${ui.bdg(d.nuevos.length+' nuevos','g')} ${ui.bdg(d.dups.length+' duplicados (omitidos)','a')}</div></div>
        <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:12px;color:var(--brand-dark);margin-bottom:12px">Anti-duplicado por <b>sucursal + fecha</b>. Los duplicados no se importan. Al confirmar se crean las visitas, se vinculan/crean shoppers y se sincroniza todo (liquidaciones, dashboard, portal).</div>
        <div style="overflow-x:auto;max-height:340px;overflow-y:auto"><table class="tbl" style="min-width:760px"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>Fecha</th><th>Honorario</th><th>Estado</th><th>Import</th></tr></thead>
        <tbody>${d.nuevos.map(c=>rowHTML(c,false)).join('')}${d.dups.map(c=>rowHTML(c,true)).join('')}</tbody></table></div>
        <div class="flex" style="justify-content:space-between;margin-top:14px"><button class="btn btn-ghost btn-sm" id="impBack3">← Atrás</button>
          <button class="btn btn-green btn-sm" id="impCommit" ${d.nuevos.length?'':'disabled'}>✓ Importar ${d.nuevos.length} visita(s)</button></div>
      </div>`;
    }
    host.innerHTML=`
      ${ui.ph('Importador inteligente', p.name+' · carga HR / histórico de cualquier formato y se adapta')}
      <div class="flex" style="gap:6px;margin-bottom:14px">${[1,2,3].map(n=>`<span class="bdg ${n===st.step?'bdg-b':n<st.step?'bdg-g':'bdg-n'}">${n<st.step?'✓':n} ${['Cargar','Mapear','Confirmar'][n-1]}</span>`).join('')}</div>
      ${body}
      <div class="card card-p" style="margin-top:14px">${ui.aiBox('Detecto columnas por palabras clave (sucursal, fecha, shopper, honorario, reembolso, estado…) en cualquier layout, normalizo fechas y estados, y evito duplicados. Sirve para la HR viva y para la migración inicial de históricos.','Importación adaptable, no atada a un formato')}</div>`;
    bind();
  };

  const bind=()=>{
    if(st.step===1){
      host.querySelector('#impSample').addEventListener('click',()=>{host.querySelector('#impTxt').value=CX.importador.sample();});
      host.querySelector('#impFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{host.querySelector('#impTxt').value=r.result;ui.toast('Archivo cargado · revisa y detecta columnas','ok');};r.readAsText(f);});
      host.querySelector('#impNext1').addEventListener('click',()=>{
        const txt=host.querySelector('#impTxt').value;
        const parsed=CX.importador.parse(txt);
        if(!parsed.headers.length||!parsed.rows.length){ui.toast('No detecté filas. Pega encabezado + datos.','err');return;}
        st.parsed=parsed; st.map=CX.importador.autoMap(parsed.headers); st.step=2; draw();
      });
    } else if(st.step===2){
      host.querySelectorAll('.impMap').forEach(sel=>sel.addEventListener('change',()=>{const i=sel.dataset.i; if(sel.value){st.map[i]=sel.value;}else{delete st.map[i];}}));
      host.querySelector('#impBack2').addEventListener('click',()=>{st.step=1;draw();});
      host.querySelector('#impNext2').addEventListener('click',()=>{
        st.cands=CX.importador.build(st.parsed, st.map, p);
        st.diff=CX.importador.diff(st.cands, p);
        st.step=3; draw();
      });
    } else {
      host.querySelector('#impBack3').addEventListener('click',()=>{st.step=2;draw();});
      const c=host.querySelector('#impCommit');
      if(c)c.addEventListener('click',()=>{
        const res=CX.importador.commit(st.diff.nuevos, p);
        ui.toast('Importadas '+res.creadas+' visita(s)'+(res.shoppersNuevos?' · '+res.shoppersNuevos+' shopper(s) nuevos':'')+' · sincronizado','ok',4000);
        st={step:1,parsed:null,map:{},cands:[],diff:null};
        CX.router.nav('visitas');
      });
    }
  };

  draw();
  return host;
});
