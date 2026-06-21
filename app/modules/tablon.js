/* CXOrbia · Tablón / Novedades (admin + shopper) */
CX.module('tablon', ({role,ui})=>{
  const feedAdmin=[
    ['🔴','3 visitas vencen hoy en HN','hace 12 min','r'],
    ['📩','Nueva postulación · Agencia Cayalá','hace 28 min','b'],
    ['🔄','Solicitud de reprogramación · G. Sauceda','hace 1 h','a'],
    ['✅','Lote #L-204 marcado como pagado','hace 3 h','g'],
    ['🏆','5 shoppers certificaron el escenario v2','hace 5 h','p'],
  ];
  const feedShopper=[
    ['✅','Tu postulación a MC. Santa Clara fue aprobada','hace 20 min','g'],
    ['📄','Nuevo instructivo disponible en tu visita','hace 2 h','b'],
    ['💰','Tu liquidación de Cayalá pasó a "validada"','ayer','g'],
    ['📅','Recordatorio: agenda tu visita antes del 18 jun','ayer','a'],
  ];
  const feed=role==='admin'?feedAdmin:feedShopper;
  return `
    ${ui.ph(role==='admin'?'Tablón de Noticias':'Novedades', role==='admin'?'Seguimiento operativo trazable — reemplaza el WhatsApp desordenado':'Lo último de tus visitas')}
    <div class="card card-p">
      <div class="card-h"><div class="card-t">${feed.length} novedades</div><button class="btn btn-ghost btn-sm">Marcar todo leído</button></div>
      ${feed.map(f=>`<div class="between" style="padding:11px 13px;border:1px solid var(--border);border-left:3px solid var(--${f[3]==='r'?'red':f[3]==='a'?'amber':f[3]==='g'?'green':f[3]==='p'?'purple':'brand'});border-radius:10px;margin-bottom:9px">
        <div class="flex"><div style="font-size:18px">${f[0]}</div>
        <div><div style="font-size:13px;font-weight:600;color:var(--t1)">${f[1]}</div><div style="font-size:11px;color:var(--t3)">${f[2]}</div></div></div>
        <button class="btn btn-soft btn-sm">Ver</button></div>`).join('')}
      <div style="margin-top:8px">${ui.aiBox('Ordeno las novedades por relevancia y disparo WhatsApp automático cuando aplica.','Priorización')}</div>
    </div>`;
});
