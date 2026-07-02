/* CXOrbia · Periodos del proyecto (#230) — crear/cerrar/archivar/duplicar/comparar
   Los periodos son las "rondas" de un programa (ej. mensuales/quincenales). Cada uno
   tiene su HR, sus visitas y su estado; NO se mezclan con la operación activa. */
CX.module('periodos', ({data,ui})=>{
  const host=ui.el('div');
  const stTone={activo:'g',cerrado:'a',archivado:'n'};
  const stLbl={activo:'Activo',cerrado:'Cerrado',archivado:'Archivado'};

  const draw=()=>{
    const key=data.currentProgramKey();
    const programa=(data.programs().find(pg=>pg.key===key)||{}).name||'—';
    const periods=data.periodsForProgram(key);
    const activos=periods.filter(p=>data.periodState(p.id)==='activo').length;

    host.innerHTML=`
      ${ui.ph('Periodos · '+programa, 'Rondas del programa · cada periodo con su HR, visitas y estado, sin mezclar la operación activa')}
      <div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi('Periodos', periods.length, 'b')}
        ${ui.kpi('Activos', activos, 'g')}
        ${ui.kpi('Cerrados', periods.filter(p=>data.periodState(p.id)==='cerrado').length, 'a')}
        ${ui.kpi('Archivados', periods.filter(p=>data.periodState(p.id)==='archivado').length, 'n')}
      </div>
      <div class="card card-p" style="margin-bottom:16px">
        <div class="between" style="margin-bottom:12px"><div class="card-t">Periodos del programa</div>
          <div class="flex" style="gap:8px"><button class="btn btn-ghost btn-sm" id="pdCompare">📊 Comparar</button><button class="btn btn-pr btn-sm" id="pdNew">＋ Nuevo periodo</button></div></div>
        <table class="tbl"><thead><tr><th>Periodo</th><th>País(es)</th><th>Avance</th><th>Estado</th><th></th></tr></thead><tbody>
        ${periods.map(p=>{const s=data.periodStats(p.id);const est=data.periodState(p.id);const activo=p.id===data.currentProjectId;
          return `<tr style="${activo?'background:var(--brand-light)':''}">
            <td><b style="font-size:12.5px">${p.periodo||p.name}</b>${activo?' <span class="bdg bdg-b" style="font-size:9px">activo ahora</span>':''}</td>
            <td style="font-size:12px">${(p.countries||[]).join(' · ')||'—'}</td>
            <td style="min-width:120px"><div class="bar" style="height:7px"><i style="width:${s.pct}%;background:${s.pct>=80?'var(--green)':s.pct>=50?'var(--brand)':'var(--amber)'}"></i></div><div style="font-size:10.5px;color:var(--t3);margin-top:2px">${s.done}/${s.total} · ${s.pct}%</div></td>
            <td><span class="bdg bdg-${stTone[est]}">${stLbl[est]}</span></td>
            <td style="text-align:right"><button class="btn btn-ghost btn-sm pdAct" data-id="${p.id}">⚙ Gestionar</button></td>
          </tr>`;}).join('')}
        </tbody></table>
        <div style="margin-top:12px">${ui.aiBox('Cada periodo es una ronda independiente. Al cerrar un periodo, sus visitas quedan en histórico y no cuentan en la operación activa. Duplicar crea la siguiente ronda copiando la estructura (sucursales/escenarios) sin arrastrar las visitas ejecutadas.','Separación operación activa vs histórico')}</div>
      </div>`;

    host.querySelector('#pdNew').addEventListener('click',()=>ui.modal('＋ Nuevo periodo',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Crea una nueva ronda del programa <b>${programa}</b>. Copia la estructura del periodo actual (sucursales, escenarios, cuestionario) y arranca sin visitas ejecutadas.</p>
      <label class="lbl">Nombre del periodo</label><input class="inp" id="pdN" placeholder="Ej. Julio 2026 · Q1" style="margin-bottom:12px">
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="pdSave">Crear periodo</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#pdSave').addEventListener('click',()=>{
      const n=(ov.querySelector('#pdN').value||'').trim(); if(!n){ui.toast('Pon un nombre','warn');return;}
      const dup=data.duplicatePeriod(data.currentProjectId,n); if(dup){data.setProject(dup.id);}
      close();draw();ui.toast('Periodo "'+n+'" creado · estructura copiada, sin visitas','ok',4000);
    })}));

    host.querySelector('#pdCompare').addEventListener('click',()=>{
      const rows=periods.map(p=>{const s=data.periodStats(p.id);return {n:p.periodo||p.name,...s,est:data.periodState(p.id)};});
      ui.modal('📊 Comparativo de periodos',`
        <table class="tbl"><thead><tr><th>Periodo</th><th>Visitas</th><th>Ejecutadas</th><th>% Avance</th><th>Estado</th></tr></thead><tbody>
        ${rows.map(r=>`<tr><td><b>${r.n}</b></td><td>${r.total}</td><td>${r.done}</td><td>${r.pct}%</td><td><span class="bdg bdg-${stTone[r.est]}">${stLbl[r.est]}</span></td></tr>`).join('')}
        </tbody></table>
        <div style="margin-top:12px">${ui.aiBox('Compara el avance entre rondas para detectar tendencias de cumplimiento. En producción se añaden score promedio y hallazgos por periodo.','Análisis comparativo')}</div>
      `);
    });

    host.querySelectorAll('.pdAct').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.id; const p=data.projects.find(x=>x.id===id); const est=data.periodState(id);
      ui.modal('⚙ Gestionar periodo · '+(p.periodo||p.name),`
        <div style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Estado actual: <span class="bdg bdg-${stTone[est]}">${stLbl[est]}</span></div>
        <div class="flex wrap" style="gap:8px">
          <button class="btn btn-soft btn-sm" id="pdGo">▶ Activar (operar este periodo)</button>
          ${est!=='cerrado'?'<button class="btn btn-soft btn-sm" id="pdClose">🔒 Cerrar periodo</button>':'<button class="btn btn-soft btn-sm" id="pdReopen">🔓 Reabrir</button>'}
          ${est!=='archivado'?'<button class="btn btn-soft btn-sm" id="pdArch">📦 Archivar</button>':'<button class="btn btn-soft btn-sm" id="pdReopen2">🔓 Reactivar</button>'}
        </div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pdGo').addEventListener('click',()=>{data.setProject(id);close();draw();CX.router.buildRail&&CX.router.buildRail(CX.session.role);ui.toast('Periodo activo','ok');});
        ov.querySelector('#pdClose')?.addEventListener('click',()=>{data.closePeriod(id);close();draw();ui.toast('Periodo cerrado · pasa a histórico','ok');});
        ov.querySelector('#pdArch')?.addEventListener('click',()=>{data.archivePeriod(id);close();draw();ui.toast('Periodo archivado','');});
        ov.querySelector('#pdReopen')?.addEventListener('click',()=>{data.reopenPeriod(id);close();draw();ui.toast('Periodo reabierto','ok');});
        ov.querySelector('#pdReopen2')?.addEventListener('click',()=>{data.reopenPeriod(id);close();draw();ui.toast('Periodo reactivado','ok');});
      }});
    }));
  };

  draw();
  CX.bus.on('project',()=>draw());
  return host;
});
