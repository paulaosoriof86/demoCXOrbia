/* CXOrbia · Histórico (#231) — consulta de periodos cerrados/archivados por
   proyecto/país/periodo, con comparativos, SIN mezclarse con la operación activa.
   Solo lectura sobre datos ya existentes (CX.data), no muta nada. */
CX.module('historico', ({data,ui})=>{
  const host=ui.el('div');
  let fPais='all';
  /* Frontend genérico (corrección 20260711): el copy decía "separado de la operación activa" pero
     el filtro por defecto era 'all' — mezclaba el periodo activo con el histórico desde el primer
     render. Ahora el default excluye explícitamente cualquier periodo en estado 'activo'; incluirlo
     requiere que el usuario elija "Incluir periodo activo" a propósito. Sin cantidades ni nombres
     de periodo hardcodeados — todo sale de data.periodsForProgram(key)/data.periodState(p.id). */
  let fEstado='sinActivo';

  const draw=()=>{
    const key=data.currentProgramKey();
    const programa=(data.programs().find(pg=>pg.key===key)||{}).name||'—';
    const periods=data.periodsForProgram(key);
    /* histórico = periodos NO activos (cerrados/archivados) + estadísticas por periodo */
    const rows=periods.map(p=>{
      const st=data.periodState(p.id); const s=data.periodStats(p.id);
      const vs=data._visitas.filter(v=>v.projectId===p.id);
      const paises=[...new Set(vs.map(v=>v.pais).filter(Boolean))];
      const scored=vs.filter(v=>v.score!=null);
      const score=scored.length?Math.round(scored.reduce((a,v)=>a+v.score,0)/scored.length):null;
      return {p,st,...s,paises,score,pagadas:vs.filter(v=>{const vc=data.visitContract?data.visitContract(v):null;return vc&&vc.paymentState==='confirmado';}).length};
    });
    const paisesAll=[...new Set(rows.flatMap(r=>r.paises))];
    const filtered=rows.filter(r=>(fPais==='all'||r.paises.includes(fPais))&&(fEstado==='all'?true:fEstado==='sinActivo'?r.st!=='activo':r.st===fEstado));
    const activo=data.currentPeriodId;

    host.innerHTML=`
      ${ui.ph('Histórico · '+programa, 'Consulta de periodos y rondas anteriores · separado de la operación activa')}
      <div class="flex wrap" style="gap:8px;margin-bottom:14px">
        <select class="sel" id="hPais" style="width:auto"><option value="all">🌍 Todos los países</option>${paisesAll.map(c=>`<option value="${c}" ${fPais===c?'selected':''}>${c}</option>`).join('')}</select>
        <select class="sel" id="hEstado" style="width:auto"><option value="sinActivo" ${fEstado==='sinActivo'?'selected':''}>Cerrados/archivados (excluye activo)</option><option value="all" ${fEstado==='all'?'selected':''}>Todos los estados (incluir activo)</option><option value="activo" ${fEstado==='activo'?'selected':''}>Solo activo</option><option value="cerrado" ${fEstado==='cerrado'?'selected':''}>Cerrado</option><option value="archivado" ${fEstado==='archivado'?'selected':''}>Archivado</option></select>
        <button class="btn btn-ghost btn-sm" id="hPdf">⤓ PDF</button>
        <button class="btn btn-soft btn-sm" id="hXls">⤓ Excel</button>
        <button class="btn btn-pr btn-sm" id="hPpt">⤓ PPT</button>
      </div>
      <div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi('Periodos', filtered.length, 'b')}
        ${ui.kpi('Visitas totales', filtered.reduce((a,r)=>a+r.total,0), 'p')}
        ${ui.kpi('Ejecutadas', filtered.reduce((a,r)=>a+r.done,0), 'g')}
        ${ui.kpi('Score promedio', (()=>{const sc=filtered.filter(r=>r.score!=null);return sc.length?Math.round(sc.reduce((a,r)=>a+r.score,0)/sc.length):'—';})(), 'a')}
        ${ui.kpi('Pagos confirmados (contrato)', filtered.reduce((a,r)=>a+r.pagadas,0), 'n')}
      </div>
      <div class="card card-p" style="margin-bottom:16px">
        <div class="card-t" style="margin-bottom:10px">Periodos del programa</div>
        <table class="tbl" id="hTable"><thead><tr><th>Periodo</th><th>País(es)</th><th>Estado</th><th>Avance</th><th>Score</th><th></th></tr></thead><tbody>
        ${filtered.map(r=>`<tr style="${r.p.id===activo?'background:var(--brand-light)':''}">
          <td><b style="font-size:12.5px">${r.p.periodo||r.p.name}</b>${r.p.id===activo?' <span class="bdg bdg-b" style="font-size:9px">activo</span>':''}</td>
          <td style="font-size:12px">${r.paises.join(' · ')||'—'}</td>
          <td><span class="bdg bdg-${r.st==='activo'?'g':r.st==='cerrado'?'a':'n'}">${r.st}</span></td>
          <td style="min-width:110px"><div class="bar" style="height:7px"><i style="width:${r.pct}%;background:${r.pct>=80?'var(--green)':'var(--brand)'}"></i></div><div style="font-size:10.5px;color:var(--t3)">${r.done}/${r.total} · ${r.pct}%</div></td>
          <td>${r.score!=null?`<b style="color:${r.score>=80?'var(--green)':r.score>=60?'var(--brand)':'var(--amber)'}">${r.score}</b>`:'—'}</td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm hVer" data-id="${r.p.id}">Ver detalle</button></td>
        </tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--t3);padding:20px">Sin periodos para el filtro.</td></tr>'}
        </tbody></table>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">📊 Comparativo entre periodos</div>
        ${filtered.length?filtered.map(r=>`<div style="margin-bottom:10px"><div class="between" style="margin-bottom:3px"><span style="font-size:12px">${r.p.periodo||r.p.name} ${r.paises.length?'· '+r.paises.join('/'):''}</span><span style="font-size:11.5px;color:var(--t3)">${r.pct}% · score ${r.score!=null?r.score:'—'}</span></div><div class="bar" style="height:8px"><i style="width:${r.pct}%;background:${r.st==='activo'?'var(--brand)':'var(--t3)'}"></i></div></div>`).join(''):'<div style="font-size:12.5px;color:var(--t3)">Sin datos para comparar.</div>'}
        <div style="margin-top:10px">${ui.aiBox('El histórico excluye por defecto el periodo activo ("'+programa+'" en curso) — solo se incluye si eliges explícitamente "Todos los estados". Para operar el periodo activo, hazlo desde el módulo Periodos.','Separación operación vs histórico')}</div>
      </div>`;

    host.querySelector('#hPais').addEventListener('change',e=>{fPais=e.target.value;draw();});
    host.querySelector('#hEstado').addEventListener('change',e=>{fEstado=e.target.value;draw();});
    const hSpec=(ext)=>{
      const san=(s)=>String(s||'reporte').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'reporte';
      return { title:'Histórico de periodos',
        meta:{title:'Histórico · '+programa,project:programa,period:(fEstado==='sinActivo'?'Cerrados/archivados':fEstado==='all'?'Todos los estados':fEstado),scope:(fPais==='all'?'Todos los países':fPais),sourceLabel:'Periodos cerrados/archivados (solo lectura)',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
        columns:[{key:'periodo',label:'Periodo'},{key:'paises',label:'País(es)'},{key:'estado',label:'Estado'},{key:'total',label:'Total'},{key:'ejecutadas',label:'Ejecutadas'},{key:'avance',label:'Avance %'},{key:'score',label:'Score'}],
        rows:filtered.map(r=>({periodo:r.p.periodo||r.p.name,paises:r.paises.join('/')||'—',estado:r.st,total:r.total,ejecutadas:r.done,avance:r.pct,score:r.score!=null?r.score:'—'})),
        notes:'',
        summary:['Periodos: '+filtered.length,'Visitas: '+filtered.reduce((a,r)=>a+r.total,0)+' · Ejecutadas: '+filtered.reduce((a,r)=>a+r.done,0)],
        chart:{title:'Avance por periodo (%)',data:filtered.map(r=>({label:r.p.periodo||r.p.name,value:r.pct,display:r.pct+'%'}))},
        filename:[san('historico'),san(programa),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
    };
    host.querySelector('#hPdf').addEventListener('click',()=>CX.reportKit.exportPDF(hSpec('pdf')));
    host.querySelector('#hXls').addEventListener('click',()=>{if(CX.reportKit.exportExcel(hSpec('xlsx')))ui.toast('Excel .xlsx generado','ok');});
    host.querySelector('#hPpt').addEventListener('click',()=>{if(CX.reportKit.exportPPT(hSpec('pptx')))ui.toast('PowerPoint generado','ok');});
    host.querySelectorAll('.hVer').forEach(b=>b.addEventListener('click',()=>{
      const r=rows.find(x=>x.p.id===b.dataset.id); if(!r)return;
      const vs=data._visitas.filter(v=>v.projectId===r.p.id);
      const porEstado={}; vs.forEach(v=>{porEstado[v.estado]=(porEstado[v.estado]||0)+1;});
      ui.modal('🗓️ '+(r.p.periodo||r.p.name)+' · '+r.st,`
        <div style="font-size:12.5px;line-height:1.9;color:var(--t2);margin-bottom:10px">
          <div><b>Países:</b> ${r.paises.join(' · ')||'—'}</div>
          <div><b>Visitas:</b> ${r.total} · <b>Ejecutadas:</b> ${r.done} (${r.pct}%)</div>
          <div><b>Score promedio:</b> ${r.score!=null?r.score:'—'}</div>
        </div>
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">Desglose por estado</div>
        ${Object.entries(porEstado).map(([e,n])=>`<div class="between" style="padding:5px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12.5px">${e}</span><b>${n}</b></div>`).join('')||'<div style="font-size:12px;color:var(--t3)">Sin visitas.</div>'}
      `);
    }));
  };
  draw();
  CX.bus.on('project',()=>draw());
  return host;
});
