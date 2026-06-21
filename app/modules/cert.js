/* CXOrbia · Certificación (admin + shopper) */
CX.module('cert', ({role,data,ui})=>{
  const p=data.project();
  if(role==='shopper'){
    return `
      ${ui.ph('Certificación', p.name+' · aprueba el escenario antes de ejecutar')}
      <div class="card card-p" style="margin-bottom:14px">
        <div class="flex" style="gap:14px;background:var(--green-bg);border-radius:11px;padding:13px 16px">
          <div style="font-family:var(--disp);font-size:30px;font-weight:800;color:var(--green)">88%</div>
          <div><b style="color:var(--t1)">Aprobado</b> · 1 intento · gate superado<div style="font-size:12px;color:var(--t3)">Ya puedes ejecutar tus visitas de este proyecto.</div></div>
        </div>
      </div>
      <div class="card card-p">
        <div class="card-h"><div class="card-t">🎯 Tu retroalimentación</div></div>
        <div style="font-size:13px;color:var(--green);margin-bottom:6px">✓ Dominas el protocolo de combo y boleto</div>
        <div style="font-size:13px;color:var(--amber)">↻ Repasa: tiempos de espera y registro de incidencia</div>
        <div style="margin-top:12px">${ui.aiBox('Te explico exactamente qué reforzar y te llevo al material del Centro de Aprendizaje correspondiente.','Feedback dirigido')}</div>
      </div>`;
  }
  return `
    ${ui.ph('Certificación', p.name+' · banco de preguntas, gate y reporte de vacíos')}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Certificados',18,'g')}${ui.kpi('En progreso',6,'a')}${ui.kpi('Aprob. promedio','84%','b')}${ui.kpi('Gate activo','Sí','p')}
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📊 Vacíos detectados · para el equipo</div></div>
      ${ui.bar(40,'Tiempos de espera','40%')}
      ${ui.bar(18,'Proceso de pago','18%')}
      ${ui.bar(9,'Registro incidencia','9%')}
      <div style="margin-top:12px">${ui.aiBox('El 40% falla la misma pregunta sobre tiempos de espera — conviene reforzar ese material. Genero el reporte de vacíos automáticamente.','Mejora continua')}</div>
    </div>`;
});
