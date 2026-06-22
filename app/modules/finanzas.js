/* CXOrbia · Finanzas (admin) — full fidelity
   Dashboard Financiero · Movimientos · Liquidaciones · Lotes de Pago
   Separación SIEMPRE por moneda y por país del proyecto (genérico, cualquier país). */

function _fin(data){
  const p=data.project(), out={};
  p.countries.forEach(c=>{
    const v=data.visitas().filter(x=>x.pais===c&&['realizada','cuestionario','liquidada'].includes(x.estado));
    const hon=v.reduce((a,x)=>a+x.honorario,0);
    const bol=v.reduce((a,x)=>a+(x.boleto||0),0);
    const com=v.reduce((a,x)=>a+(x.comboAmt||0),0);
    out[c]={cur:p.currency[c],vis:v.length,hon,bol,com,reemb:bol+com,total:hon+bol+com};
  });
  return out;
}
const _m=(cur,n)=>`${cur} ${Number(n).toLocaleString('es-GT')}`;

CX.module('financiero', ({data,ui})=>{
  const p=data.project();
  const fp=CX.fin.porPais(data);
  const modelLbl = p.modelo==='delegado' ? 'Delegado (franquicia)' : 'Facturado directamente';

  const tile=(c)=>{const d=fp[c];return `<div class="card card-p">
    <div class="between" style="margin-bottom:10px"><div class="card-t finDrill" data-c="${c}" style="cursor:pointer">${CX.paisLabel(c)} <span class="muted" style="font-weight:500">(${d.cur})</span> <span style="font-size:11px;color:var(--brand)">ver visitas →</span></div>${ui.bdg(d.margenPct+'% margen',d.margenPct>=30?'g':'a')}</div>
    <div class="grid g2" style="gap:8px">
      ${ui.kpi('Ingresos',d.cur+' '+d.ingreso.toLocaleString(),'g')}
      ${ui.kpi('Honorarios',d.cur+' '+d.honPaga.toLocaleString(),'r')}
      ${p.modelo==='directo'?ui.kpi('ISR ('+(p.isr||0)+'%)',d.cur+' '+d.isr.toLocaleString(),'a'):ui.kpi('Reembolsos',d.cur+' '+d.reemb.toLocaleString(),'n')}
      ${p.modelo==='directo'?ui.kpi('Regalías ('+(p.regalias||0)+'%)',d.cur+' '+d.regal.toLocaleString(),'p'):ui.kpi('Por pagar (CxP)',d.cur+' '+d.cxp.toLocaleString(),'a')}
    </div>
    <div class="between" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-2)">
      <span style="font-size:12px;color:var(--t2)">Margen neto</span>
      <b style="font-family:var(--disp);font-size:18px;color:${d.margen>=0?'var(--green)':'var(--red)'}">${d.cur} ${d.margen.toLocaleString()}</b></div>
    <div class="flex" style="gap:14px;margin-top:8px;font-size:11px;color:var(--t3)">
      <span>CxC: <b style="color:var(--t2)">${d.cur} ${d.cxc.toLocaleString()}</b></span>
      <span>CxP: <b style="color:var(--t2)">${d.cur} ${d.cxp.toLocaleString()}</b></span>
      <span>Gastos fijos: <b style="color:var(--t2)">${d.cur} ${d.fijos.toLocaleString()}</b></span></div>
  </div>`;};

  const compar=(c)=>{const s=CX.fin.serieMensual(p,c),cur=p.currency[c],max=Math.max(...s.map(x=>x.ingreso));
    return `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px">${c} · últimos meses (${cur})</div>
      <div class="flex" style="align-items:flex-end;gap:10px;height:90px">
      ${s.map(x=>`<div style="flex:1;text-align:center">
        <div style="display:flex;flex-direction:column;justify-content:flex-end;height:70px;gap:2px">
          <div title="margen" style="height:${Math.round(x.margen/max*68)}px;background:var(--green);border-radius:3px 3px 0 0;opacity:.85"></div>
        </div>
        <div style="background:var(--brand);height:${Math.round(x.ingreso/max*0)}px"></div>
        <div style="font-size:10px;color:var(--t3);margin-top:4px">${x.m}</div>
        <div style="font-size:10px;font-weight:700;color:var(--t1)">${(x.ingreso/1000).toFixed(0)}k</div></div>`).join('')}
      </div></div>`;};

  const html_fin = `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Dashboard Financiero', p.name+' · '+modelLbl+' · '+p.countries.map(c=>c+' ('+CX.moneda(p,c)+')').join(' y ')+' separados')}</div>
    <div class="flex"><span class="bdg ${p.modelo==='directo'?'bdg-b':'bdg-p'}">${modelLbl}</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

  <div class="card card-p" style="margin-bottom:16px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)">${p.modelo==='directo'
      ? '<b>Modelo directo:</b> el margen descuenta honorarios + ISR ('+(p.isr||0)+'%) + regalías ('+(p.regalias||0)+'%). El reembolso (boleto+combo) es flujo de caja, no afecta utilidad.'
      : '<b>Modelo delegado:</b> solo se netea el honorario recibido menos lo pagado al shopper; sin ISR ni regalías locales.'}</div>
  </div>

  <div class="grid ${p.countries.length>1?'g2':''}" style="margin-bottom:16px">${p.countries.map(tile).join('')}</div>

  <div class="grid g2" style="margin-bottom:16px">
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📈 Comparativo mensual (ingreso · margen)</div></div>
      ${p.countries.map(compar).join('')}
    </div>
    <div class="card card-p" id="presCard">
      <div class="card-h"><div class="card-t">📋 Presupuesto de gastos fijos</div><button class="btn btn-soft btn-sm" id="addPres">＋ Rubro</button></div>
      <div id="presList"></div>
      <div style="margin-top:10px">${ui.aiBox('Los gastos fijos se presupuestan; los variables (honorarios) van según ejecución. El dashboard compara real vs presupuesto para decidir rentabilidad y honorarios.','Presupuesto vs real')}</div>
    </div>
  </div>`;

  setTimeout(()=>{
    document.querySelectorAll('.finDrill').forEach(el=>el.addEventListener('click',()=>{
      const c=el.dataset.c, liqs=CX.liq.forProject(data).filter(l=>l.pais===c);
      ui.modal('Liquidaciones · '+CX.paisLabel(c)+' ('+liqs.length+')', liqs.length?`<table class="tbl"><thead><tr><th>Visita</th><th>Shopper</th><th>Honorario</th><th>Reembolso</th><th>Total</th><th>Estado</th></tr></thead><tbody>${liqs.map(l=>{const lb=CX.liq.label(l.estado);return `<tr><td><b style="font-size:12.5px">${l.sucursal}</b></td><td style="font-size:12px">${l.shopper||'—'}</td><td style="color:var(--green)">${ui.money(l.moneda,l.honorario)}</td><td style="color:var(--purple)">${l.reembolso?ui.money(l.moneda,l.reembolso):'—'}</td><td style="font-weight:700">${ui.money(l.moneda,l.total)}</td><td>${ui.bdg(lb[0],lb[1])}</td></tr>`;}).join('')}</tbody></table>`:ui.empty('💰','Sin liquidaciones en este país.'));
    }));
    const cur=p.currency[p.countries[0]];
    const defaults={'Coordinación':4000,'Software/plataforma':1200,'Transporte':800};
    const store=CX.finStore.pres(p.id);
    if(!Object.keys(store).length) Object.assign(store,defaults);
    const draw=()=>{
      const list=document.getElementById('presList'); if(!list)return;
      const ks=Object.keys(store); const tot=ks.reduce((a,k)=>a+(+store[k]||0),0);
      list.innerHTML = (ks.length?ks.map(k=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:12.5px;color:var(--t1)">${k}</span>
        <div class="flex" style="gap:8px"><b style="font-size:12.5px">${cur} ${(+store[k]).toLocaleString()}</b><button class="btn btn-ghost btn-sm" data-delp="${k}" style="color:var(--red);padding:2px 7px">✕</button></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:8px 0">Sin rubros aún</div>')
        + `<div class="between" style="padding:9px 0 0;font-weight:700"><span style="font-size:13px">Total fijo</span><b style="color:var(--t1)">${cur} ${tot.toLocaleString()}</b></div>`;
      list.querySelectorAll('[data-delp]').forEach(b=>b.addEventListener('click',()=>{delete store[b.dataset.delp];draw();}));
    };
    draw();
    const ap=document.getElementById('addPres');
    if(ap)ap.addEventListener('click',()=>ui.modal('Nuevo rubro de gasto fijo',`
      <div style="margin-bottom:12px"><label class="lbl">Concepto</label><input class="inp" id="prK" placeholder="Ej. Renta oficina"></div>
      <div style="margin-bottom:16px"><label class="lbl">Monto mensual (${cur})</label><input class="inp" id="prV" type="number" placeholder="0"></div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="prSave">Agregar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#prSave').addEventListener('click',()=>{const k=ov.querySelector('#prK').value||'Rubro';store[k]=+ov.querySelector('#prV').value||0;close();draw();ui.toast('Rubro agregado al presupuesto','ok');});}}));
  },0);
  return html_fin;
});

CX.module('movimientos', ({data,ui})=>{
  const p=data.project(), cur=p.currency[p.countries[0]];
  const seed=[
    {tipo:'ingreso',cat:'Anticipo cliente',pais:p.countries[0],monto:40000,fecha:'2026-06-03',desc:'Anticipo del proyecto',estado:'Conciliado'},
    {tipo:'egreso',cat:'Pago lote #L-204',pais:p.countries[0],monto:-18240,fecha:'2026-06-12',desc:'Pago a evaluadores',estado:'Pagado',origen:'lote'},
    {tipo:'ingreso',cat:'Factura final cliente',pais:p.countries[0],monto:46400,fecha:'2026-06-20',desc:'Factura de cierre',estado:'Pendiente (CxC)'},
  ];
  const host=ui.el('div');
  const draw=()=>{
    const movs=[...seed,...CX.finStore.mov(p.id)];
    const ing=movs.filter(m=>m.monto>0).reduce((a,m)=>a+m.monto,0);
    const egr=movs.filter(m=>m.monto<0).reduce((a,m)=>a+m.monto,0);
    const cxc=movs.filter(m=>(m.estado||'').includes('CxC')).reduce((a,m)=>a+Math.abs(m.monto),0);
    const cxp=CX.liq.forProject(data).filter(l=>l.estado!=='pagada').reduce((a,l)=>a+l.total,0);
    host.innerHTML=`
    <div class="between" style="margin-bottom:12px"><div>${ui.ph('Movimientos', p.name+' · ingresos, egresos, anticipos y pagos · CxC / CxP')}</div>
      <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>
    <div class="flex wrap" style="gap:8px;margin-bottom:14px">
      <button class="btn btn-green btn-sm" data-new="ingreso">＋ Ingreso</button>
      <button class="btn btn-soft btn-sm" data-new="egreso">＋ Egreso</button>
      <button class="btn btn-soft btn-sm" data-new="anticipo">＋ Anticipo</button>
      <button class="btn btn-pr btn-sm" id="payLote">💳 Pagar lote (genera egresos)</button>
      <button class="btn btn-ghost btn-sm" id="impHist">⤒ Importar histórico</button>
    </div>
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Ingresos',ui.money(cur,ing),'g')}${ui.kpi('Egresos',ui.money(cur,Math.abs(egr)),'r')}
      ${ui.kpi('Por cobrar (CxC)',ui.money(cur,cxc),'a')}${ui.kpi('Por pagar (CxP)',ui.money(cur,cxp),'a')}
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Movimientos del periodo</div><span class="muted" style="font-size:11px">Vista previa anti-duplicados al importar</span></div>
      <table class="tbl"><thead><tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>País</th><th style="text-align:right">Monto</th><th>Estado</th></tr></thead><tbody>
        ${movs.map(m=>`<tr><td style="font-size:12px">${m.fecha}</td><td><b>${m.cat}</b><div style="font-size:10px;color:var(--t3)">${m.desc||''}</div></td>
          <td>${ui.bdg(m.tipo,m.monto>=0?'g':'r')}</td><td>${m.pais}</td>
          <td style="text-align:right;font-weight:700;color:var(--${m.monto<0?'red':'green'})">${m.monto<0?'− ':'+ '}${ui.money(cur,Math.abs(m.monto))}</td>
          <td>${ui.bdg(m.estado||'—',(m.estado||'').includes('Cx')?'a':m.monto<0?'r':'g')}</td></tr>`).join('')}
      </tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Pagar un lote genera de una sola vez los egresos de cada shopper del lote (no uno por uno) y mueve sus liquidaciones a "pagada". Cuentas por cobrar y por pagar se reflejan aquí y en el Dashboard Financiero.','Movimientos vinculados a lotes')}</div>
    </div>`;
    host.querySelectorAll('[data-new]').forEach(b=>b.addEventListener('click',()=>{
      const t=b.dataset.new;
      ui.modal('Registrar '+t,`
        <div style="margin-bottom:12px"><label class="lbl">Concepto</label><input class="inp" id="mvCat" placeholder="Concepto"></div>
        <div class="grid g2" style="gap:10px;margin-bottom:12px">
          <div><label class="lbl">Monto (${cur})</label><input class="inp" id="mvMonto" type="number"></div>
          <div><label class="lbl">País</label><select class="sel" id="mvPais">${p.countries.map(c=>`<option>${c}</option>`).join('')}</select></div>
        </div>
        <div style="margin-bottom:16px"><label class="lbl">Descripción</label><input class="inp" id="mvDesc" placeholder="Opcional"></div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="mvSave">Registrar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#mvSave').addEventListener('click',()=>{
        const monto=Math.abs(+ov.querySelector('#mvMonto').value||0)*(t==='egreso'?-1:1);
        CX.finStore.addMov(p.id,{tipo:t,cat:ov.querySelector('#mvCat').value||t,pais:ov.querySelector('#mvPais').value,monto,desc:ov.querySelector('#mvDesc').value,estado:t==='egreso'?'Pagado':'Conciliado'});
        close();draw();ui.toast('Movimiento registrado','ok');});}});
    }));
    const pl=host.querySelector('#payLote');
    if(pl)pl.addEventListener('click',()=>{
      const val=CX.liq.forProject(data).filter(l=>l.estado==='validada');
      if(!val.length){ui.toast('No hay liquidaciones validadas para pagar','warn');return;}
      const tot=val.reduce((a,l)=>a+l.total,0);
      CX.finStore.addMov(p.id,{tipo:'egreso',cat:'Pago de lote ('+val.length+' visitas)',pais:val[0].pais,monto:-tot,desc:'Egreso consolidado del lote',estado:'Pagado',origen:'lote'});
      draw();ui.toast(val.length+' liquidaciones pagadas en un solo egreso de '+ui.money(cur,tot),'ok',4000);
    });
    const ih=host.querySelector('#impHist');
    if(ih)ih.addEventListener('click',()=>ui.modal('Importar histórico de movimientos',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Sube tu archivo (Excel/CSV). Se muestra una <b>vista previa</b> y se detectan duplicados antes de confirmar.</p>
      <input type="file" class="inp" style="padding:7px;margin-bottom:12px">
      <div style="background:var(--brand-light);border-radius:9px;padding:10px 12px;font-size:12px;color:var(--brand-dark)">En producción: mapeo de columnas → tipo/monto/fecha/país, y conciliación anti-duplicado por fecha+monto+concepto.</div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Vista previa lista (demo)','ok');this.closest('.cx-ov').remove()">Ver vista previa</button></div>
    `));
  };
  draw();
  CX.bus.on('fin',()=>draw());
  return host;
});

CX.module('liquidaciones', ({data,ui})=>{
  const p=data.project();
  const all=CX.liq.forProject(data);
  const res=CX.liq.resumen(all);
  // obligaciones por país/moneda
  const oblig=p.countries.map(c=>{
    const ls=all.filter(l=>l.pais===c);
    const hon=ls.reduce((a,l)=>a+l.honorario,0), reemb=ls.reduce((a,l)=>a+l.reembolso,0), tot=ls.reduce((a,l)=>a+l.total,0);
    const listo=ls.filter(l=>l.estado==='validada').reduce((a,l)=>a+l.total,0);
    return `<tr><td><b>${c}</b></td><td>${p.currency[c]}</td><td>${ls.length}</td><td>${ui.money(p.currency[c],hon)}</td><td>${ui.money(p.currency[c],reemb)}</td><td><b>${ui.money(p.currency[c],tot)}</b></td><td>${ui.money(p.currency[c],listo)}</td></tr>`;
  }).join('');

  const lrow=(l,i)=>{const lb=CX.liq.label(l.estado);
    return `<tr data-li="${i}"><td><b>${l.shopper||'—'}</b><div style="font-size:10px;color:var(--t3)">${l.shopperCode||''}</div></td>
      <td style="font-size:12px">${l.sucursal}</td><td style="font-size:12px">${l.freal||'—'}</td>
      <td>${ui.bdg(lb[0],lb[1])}</td><td>${l.submit?'✅':'—'}</td>
      <td>${ui.money(l.moneda,l.honorario)}</td><td>${l.boleto?ui.money(l.moneda,l.boleto):'—'}</td><td>${l.combo?ui.money(l.moneda,l.combo):'—'}</td>
      <td style="font-weight:700;color:var(--t1)">${ui.money(l.moneda,l.total)}</td>
      <td style="font-size:12px">${l.fechaEstimadaPago||'—'}</td>
      <td style="text-align:right">${l.estado==='validada'?`<button class="btn btn-ghost btn-sm" data-adv="${i}">▶ Mover</button>`:l.estado==='pendiente_cuestionario'?ui.bdg('espera shopper','n'):l.estado==='pagada'?ui.bdg('✓','g'):ui.bdg('—','n')}</td></tr>`;};

  const html=`
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Liquidaciones', p.name+' · sincronizadas con el avance de cada visita')}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px">
    ${ui.kpi('Pend. cuestionario',res.pendiente_cuestionario||0,'a')}
    ${ui.kpi('Pend./Validadas',(res.pendiente_submitir||0)+(res.validada||0),'b')}
    ${ui.kpi('Listas para lote',res.validada||0,'b')}
    ${ui.kpi('Pagadas',res.pagada||0,'g')}
  </div>

  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-t" style="margin-bottom:8px">📊 Obligaciones por país y moneda</div>
    <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">No se suman quetzales y lempiras. Total = honorario + reembolso (boleto + combo). El estado y la <b>fecha estimada de pago</b> se derivan del avance de la visita.</div>
    <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas</th><th>Honorarios</th><th>Reembolsos</th><th>Total</th><th>Listo para lote</th></tr></thead><tbody>${oblig}</tbody></table></div>
  </div>

  <div class="card card-p">
    <div class="between" style="margin-bottom:12px"><div><div class="card-t">💸 Liquidaciones operativas</div>
      <div style="font-size:11px;color:var(--t3)">El estado avanza solo con la visita. Al preparar lote eliges qué visitas incluir.</div></div>
      <button class="btn btn-pr btn-sm" id="prepLote">📦 Preparar lote</button></div>
    <div style="overflow-x:auto"><table class="tbl" style="min-width:840px"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Realizada</th><th>Estado</th><th>Submit.</th><th>Honorario</th><th>Boleto</th><th>Combo</th><th>Total</th><th>Pago est.</th><th></th></tr></thead>
    <tbody id="liqBody">${all.map(lrow).join('')}</tbody></table></div>
    <div style="margin-top:14px">${ui.aiBox('Cada liquidación nace del avance de la visita: realizada → pend. cuestionario → validada → en lote → pagada, con fecha estimada de pago según las reglas del cliente. Cero captura manual.','Liquidación sincronizada')}</div>
  </div>`;

  setTimeout(()=>{
    document.querySelectorAll('[data-adv]').forEach(b=>b.addEventListener('click',()=>{
      const tr=b.closest('tr'); tr.children[3].innerHTML=ui.bdg('En lote','p'); tr.children[10].innerHTML=ui.bdg('—','n');
      ui.toast('Liquidación movida a "en lote"','ok');
    }));
    const prep=document.getElementById('prepLote');
    if(prep)prep.addEventListener('click',()=>{
      const validadas=all.map((l,i)=>({l,i})).filter(x=>x.l.estado==='validada');
      const rows=validadas.length?validadas.map(x=>`<label class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer">
        <span><input type="checkbox" class="loteChk" data-i="${x.i}" checked style="margin-right:8px"><b style="font-size:13px">${x.l.shopper}</b> · ${x.l.sucursal}<div style="font-size:11px;color:var(--t3)">${x.l.pais} · pago est. ${x.l.fechaEstimadaPago}</div></span>
        <b style="color:var(--green)">${ui.money(x.l.moneda,x.l.total)}</b></label>`).join('')
        : ui.empty('📦','No hay liquidaciones validadas para incluir');
      ui.modal('Preparar lote de pago',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Selecciona las visitas <b>validadas</b> a incluir. Una sola moneda por lote (GT y HN no se mezclan). Al pagar el lote se generan los movimientos de egreso de cada shopper de una sola vez.</p>
        ${rows}
        <div class="between" style="margin-top:14px"><div id="loteTot" style="font-size:13px;font-weight:700;color:var(--t1)"></div>
        <button class="btn btn-green btn-sm" id="loteCreate" ${validadas.length?'':'disabled'}>Crear lote</button></div>
      `,{onMount:(ov,close)=>{
        const calc=()=>{let t=0,m='';ov.querySelectorAll('.loteChk:checked').forEach(c=>{const l=all[+c.dataset.i];t+=l.total;m=l.moneda;});ov.querySelector('#loteTot').textContent=validadas.length?('Total lote: '+ui.money(m||p.currency[p.countries[0]],t)):'';};
        ov.querySelectorAll('.loteChk').forEach(c=>c.addEventListener('change',calc));calc();
        const cr=ov.querySelector('#loteCreate'); if(cr)cr.addEventListener('click',()=>{const ids=[...ov.querySelectorAll('.loteChk:checked')].map(c=>all[+c.dataset.i].visitaId);close();const r=data.payVisits(ids);ui.toast('Lote pagado · '+r.pagadas+' visita(s) liquidada(s) · fecha de pago '+r.fechaPago+' · Beneficios y Finanzas actualizados','ok',4200);});
      }});
    });
  },0);
  return html;
});

CX.module('lotes', ({data,ui})=>{
  const p=data.project(), cur=p.currency[p.countries[0]];
  const rows=[['#L-204','12 visitas',_m(cur,18240),'Pagado','g'],['#L-205','8 visitas',_m(p.currency[p.countries[p.countries.length-1]],42000),'En revisión','a'],['#L-206','5 visitas',_m(cur,9300),'Borrador','n']];
  return `
  ${ui.ph('Lotes de Pago', p.name+' · agrupa liquidaciones validadas y crea el egreso')}
  <div class="grid g3" style="margin-bottom:16px">${rows.map(r=>`<div class="card hov card-p">
    <div class="between" style="margin-bottom:8px"><b style="font-family:var(--disp);font-size:15px;color:var(--t1)">${r[0]}</b>${ui.bdg(r[3],r[4])}</div>
    <div style="font-size:12px;color:var(--t3)">${r[1]}</div>
    <div style="font-size:18px;font-weight:800;color:var(--green);font-family:var(--disp);margin-top:4px">${r[2]}</div>
    <div style="margin-top:10px"><button class="btn btn-ghost btn-sm">Ver detalle</button></div></div>`).join('')}</div>
  <div class="card card-p">${ui.aiBox('Agrupo y concilio pagos automáticamente, evitando duplicidad. Cada lote crea su egreso asociado en Finanzas.','Conciliación')}</div>`;
});
