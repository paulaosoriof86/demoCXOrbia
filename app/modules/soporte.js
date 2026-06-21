/* CXOrbia · Soporte IA (admin + shopper) — live assistant when available */
CX.module('soporte', ({data,role,ui})=>{
  const p=data.project();
  const ctx=`Proyecto activo: ${p.name} (${p.industry}), países ${p.countries.join('/')}, escenarios: ${p.scenarios.join(', ')}. Honorario GT Q60 + combo + boleto reembolsados. Rango de visita típico 12–18 jun.`;
  const host=document.createElement('div');
  host.innerHTML=`
    ${ui.ph('Soporte IA', 'Asistente con el contexto real de la operación · 24/7')}
    <div class="card card-p" style="display:flex;flex-direction:column;height:62vh;min-height:420px">
      <div id="chatLog" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px"></div>
      <div class="flex" style="margin-top:12px;gap:8px">
        <input class="inp" id="chatIn" placeholder="${role==='shopper'?'Ej. ¿hasta cuándo puedo hacer mi visita?':'Ej. ¿cuántas visitas hay sin asignar?'}">
        <button class="btn btn-pr" id="chatSend">Enviar</button>
      </div>
    </div>`;
  const log=host.querySelector('#chatLog');
  const add=(who,txt)=>{
    const me=who==='me';
    const b=document.createElement('div');
    b.style.cssText=`align-self:${me?'flex-end':'flex-start'};max-width:80%;padding:10px 14px;border-radius:${me?'13px 13px 4px 13px':'13px 13px 13px 4px'};font-size:13px;line-height:1.5;${me?'background:var(--brand);color:#fff':'background:#f6f9fc;border:1px solid var(--border);color:var(--t1)'}`;
    b.innerHTML=(me?'':'🤖 ')+txt; log.appendChild(b); log.scrollTop=log.scrollHeight; return b;
  };
  add('ai',`Hola 👋 soy tu asistente de <b>${p.name}</b>. Pregúntame sobre visitas, fechas, honorarios, estados o el siguiente paso.`);

  const canned=(q)=>{
    q=q.toLowerCase();
    if(q.includes('cuándo')||q.includes('cuando')||q.includes('rango'))return 'Tu rango válido es del <b>12 al 18 de junio</b>, franja semana. ¿Quieres que te ayude a elegir fecha?';
    if(q.includes('pagan')||q.includes('cobro')||q.includes('honorario'))return '<b>Q 60 + combo + boleto reembolsados.</b> El instructivo te llega por WhatsApp al ser aprobada la visita.';
    if(q.includes('sin asignar')||q.includes('pendiente')){const k=data.kpis();return `En ${p.name} hay <b>${k.sinAsignar.t} visitas sin asignar</b> y <b>${k.postPend} postulaciones</b> por revisar.`;}
    return `Con el contexto de ${p.name}: ${ctx} ¿Sobre qué visita o paso necesitas ayuda?`;
  };

  const send=async()=>{
    const inp=host.querySelector('#chatIn'); const q=inp.value.trim(); if(!q)return;
    add('me',q); inp.value='';
    const thinking=add('ai','<span style="opacity:.6">escribiendo…</span>');
    try{
      if(window.claude&&window.claude.complete){
        const prompt=`Eres el asistente operativo de la plataforma CXOrbia (mystery shopping y auditoría de campo) para ${role==='shopper'?'un shopper/evaluador':'un administrador'}. Responde breve, claro y en español, máximo 3 frases. Contexto real: ${ctx}\n\nPregunta: ${q}`;
        const r=await window.claude.complete(prompt);
        thinking.innerHTML='🤖 '+(r||canned(q)).trim();
      } else { thinking.innerHTML='🤖 '+canned(q); }
    }catch(e){ thinking.innerHTML='🤖 '+canned(q); }
    log.scrollTop=log.scrollHeight;
  };
  setTimeout(()=>{
    host.querySelector('#chatSend').addEventListener('click',send);
    host.querySelector('#chatIn').addEventListener('keydown',e=>{if(e.key==='Enter')send();});
  },0);
  return host;
});
