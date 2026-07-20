/* CXOrbia · Portal del Cliente — Capacitación · Reportes · Mi Programa · Add-ons */

/* ============== Capacitación (brechas → cursos recomendados) ============== */
CX.module('cli_capacitacion', ({ui})=>{
  const C=CX.clienteData, p=CX.data.period();
  const list=C.scoped(p), R=C.resumen(list);
  const CURSOS={
    recib:['Protocolo de bienvenida','Primeros 30 segundos de servicio'],
    aten:['Asesoría consultiva','Manejo de objeciones','Escucha activa'],
    tiemp:['Gestión de filas y tiempos','Eficiencia operativa en piso'],
    inst:['Estándares de imagen y limpieza','Visual merchandising'],
    proc:['Cumplimiento de protocolo','Calidad y consistencia'],
    cierre:['Cierre y fidelización','Venta cruzada efectiva'],
  };
  const gaps=R.secAvg.slice(0,3); // 3 secciones más débiles
  /* T3 (paquete V109): mismo helper CX.clienteData.band()/validScore() que el resto del
     Portal Cliente — crítico es SIEMPRE <70 en toda la app, y NaN/Infinity nunca cuentan
     como score válido. */
  const needTraining=list.filter(s=>s.hasScore!==false && C.validScore(s.score) && C.band(s.score).key==='critico');
  const hasGaps = R.peorSeccion!=null;

  setTimeout(()=>{ CX.cliUI.wirePersona();
    document.querySelectorAll('[data-asig]').forEach(b=>b.addEventListener('click',()=>CX.ui.toast('Capacitación asignada: '+b.dataset.asig,'ok')));
  },0);

  const gapCard=(g)=>{
    const cursos=CURSOS[g.sec.id]||['Capacitación general de servicio'];
    return `<div class="card card-p">
      <div class="between"><div class="card-t" style="font-size:14px">${g.sec.name}</div>${CX.cliUI.pill(g.val)}</div>
      <div class="bar" style="margin:10px 0 14px"><i style="width:${g.val}%;background:${CX.cliUI.TONE_VAR[C.tone(g.val)]}"></i></div>
      <div class="grid" style="gap:8px">${cursos.map(c=>`<div class="flex between" style="gap:10px"><span style="font-size:12.5px;color:var(--t1)">🎓 ${c}</span><button class="btn btn-soft btn-sm" data-asig="${c}">Asignar</button></div>`).join('')}</div>
    </div>`;
  };

  return `
    ${ui.ph('Capacitación', 'Cierra brechas: cursos recomendados según los resultados del programa')}
    ${CX.cliUI.personaBarHTML()}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Sucursales a reforzar',needTraining.length,'a','score < 70')}
      ${ui.kpi('Brecha principal',hasGaps?R.peorSeccion.sec.name:CX.ui.statusBdg('pending_source'),'r')}
      ${ui.kpi('Score más bajo',hasGaps?R.peorSeccion.val:CX.ui.statusBdg('pending_source'),'r',hasGaps?'/100':'')}
      ${ui.kpi('Cursos sugeridos',gaps.reduce((a,g)=>a+((CURSOS[g.sec.id]||[1]).length),0),'b')}
    </div>
    <div class="card-t" style="font-size:13px;margin-bottom:12px">Brechas prioritarias y cursos recomendados</div>
    <div class="grid g3" style="gap:14px;margin-bottom:18px">${gaps.length?gaps.map(gapCard).join(''):`<div class="card card-p" style="grid-column:1/-1">${ui.empty('📊','Todavía no hay suficientes cuestionarios reales para calcular brechas por sección.')}</div>`}</div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Sucursales que requieren capacitación</div></div>
      ${needTraining.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Región</th><th>Responsable</th><th>Score</th><th></th></tr></thead><tbody>
        ${needTraining.map(s=>`<tr><td><b>${s.name}</b></td><td style="font-size:12px">${s.region}</td><td style="font-size:12px;color:var(--t3)">${s.responsable}</td><td>${CX.cliUI.pill(s.score)}</td><td style="text-align:right"><button class="btn btn-soft btn-sm" data-asig="Plan de capacitación · ${s.name}">Asignar plan</button></td></tr>`).join('')}
      </tbody></table>`:ui.empty('✅','Ninguna sucursal por debajo del umbral. ¡Buen trabajo!')}
      <div style="margin-top:14px">${ui.aiBox('La academia para tu personal es un servicio adicional: cursos, evaluación y certificación ligados a las brechas que detecta el programa.','Servicio de capacitación')}</div>
    </div>`;
});

/* ============== Reportes (exportables) — Corte 1.2 ==============
   Corrección P0 (auditoría 20260720): este módulo consume la forma REAL de la
   proyección aprobada schema 1.1.0 expuesta en window.CX_TYA_CORTE1_REPORTS:
   periods (claves string "YYYY-MM"), countries, latestPeriod, rows (periodo+país),
   branchRows (periodo+país+sucursal), catalog (única verdad de disponibilidad),
   filter(scope, level), report(reportId, scope), toCSV, toJSON.
   Métricas operativas únicamente: visits, assigned, unassigned, performed,
   questionnaire, submitted, paymentConfirmed. El periodo se resuelve con
   CX.data.period().periodKey — nunca con el id visual del periodo. */
CX.module('cli_reportes', ({ui})=>{
  const p=CX.data.period()||{};
  const projectLabel=CX.data.programBase?CX.data.programBase(p):(p.name||CX.data.programKey(p)||'Proyecto');
  const u=CX.session.user||{};
  const role=u.clienteRole||'director';
  const SOURCE_LABEL='Fuente verificada · Vista previa segura';

  const proj=(()=>{const g=(typeof window!=='undefined')?window.CX_TYA_CORTE1_REPORTS:undefined;return(g&&typeof g==='object'&&Array.isArray(g.rows)&&typeof g.report==='function'&&typeof g.filter==='function')?g:null;})();
  /* P0-2 (V164): el periodo sale EXCLUSIVAMENTE de CX.data.period().periodKey.
     Si el contexto no lo expone, se falla cerrado (cero filas, exportaciones
     bloqueadas). Nunca se infiere latestPeriod ni se usa p.id como sustituto. */
  const periodKey=(p&&typeof p.periodKey==='string'&&p.periodKey)?p.periodKey:null;
  const periodLabel=(p.periodo||p.ronda||p.name||'Periodo')+(periodKey?(' · '+periodKey):'');

  const esc=(s)=>String(s==null?'—':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate=()=>new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'});
  const sanitize=(s)=>String(s||'reporte').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'reporte';
  /* P1: el nombre incluye el ALCANCE (todos/GT/HN/sucursal) para que
     exportar "Todos los países" y luego "GT" no colisione en un mismo nombre. */
  const scopeToken=()=>{
    if(role==='sucursal') return sanitize(resolvedBranchName||u.scopeSucursal||'sucursal');
    if(role==='regional') return 'pendiente-alcance';
    return selectedCountry?sanitize(selectedCountry):'todos';
  };
  const buildFilename=(cat,ext)=>[sanitize(cat.label),sanitize(projectLabel),sanitize(periodKey||''),scopeToken(),new Date().toISOString().slice(0,10)].filter(Boolean).join('_')+'.'+ext;

  const STATE_META={available:{label:'Disponible',tone:'g'},pending_source:{label:'Pendiente de fuente',tone:'n'},pending_scope:{label:'Pendiente de alcance autorizado',tone:'a'},no_data:{label:'Sin datos para este periodo y alcance',tone:'n'},error:{label:'Error al generar archivo',tone:'r'}};
  const CARD_META={executive_operational_summary:{icon:'📊',desc:'Totales operativos del periodo por país'},branch_operational_status:{icon:'🏬',desc:'Avance operativo por sucursal y ciudad'},country_coverage:{icon:'🗺️',desc:'Cobertura operativa del periodo por país'},period_trend:{icon:'📈',desc:'Comparativo operativo entre periodos'},brand_scorecard:{icon:'🎯',desc:'Scorecard validado de cuestionarios'},action_plans:{icon:'📋',desc:'Planes de acción registrados'},training_gaps:{icon:'🎓',desc:'Brechas por sección y capacitación'}};
  const MISSING={brand_scorecard:'scores validados de cuestionarios',action_plans:'registros reales de planes de acción',training_gaps:'resultados por sección de cuestionario'};
  const DEFAULT_CATALOG=[
    {id:'executive_operational_summary',label:'Resumen ejecutivo operativo',projectionLevel:'periodCountry',availability:'available'},
    {id:'branch_operational_status',label:'Estado operativo por sucursal',projectionLevel:'branch',availability:'available'},
    {id:'country_coverage',label:'Cobertura por país',projectionLevel:'periodCountry',availability:'available'},
    {id:'period_trend',label:'Tendencia operativa por periodo',projectionLevel:'periodCountry',availability:'available'},
    {id:'action_plans',label:'Planes de acción',projectionLevel:null,availability:'pending_source',requiredSource:'action_plan_records'},
    {id:'training_gaps',label:'Brechas y capacitación',projectionLevel:null,availability:'pending_source',requiredSource:'questionnaire_section_scores'},
    {id:'brand_scorecard',label:'Scorecard de marca',projectionLevel:null,availability:'pending_source',requiredSource:'validated_questionnaire_scores'}];
  const catalog=(proj&&Array.isArray(proj.catalog)&&proj.catalog.length)?proj.catalog:DEFAULT_CATALOG;

  const countries=(proj&&Array.isArray(proj.countries))?proj.countries:[];
  let selectedCountry=(()=>{try{const v=sessionStorage.getItem('cx_rep_country')||'';return countries.includes(v)?v:'';}catch(e){return '';}})();

  /* P0-2: la plataforma guarda scopeSucursal normalmente como ID de sucursal,
     no como branchName. Resolvemos el ID contra el catálogo de sucursales de la
     UI (CX.clienteData.sucursales(p)) para obtener el name real, y con ese name
     filtramos branchRows. Si scopeSucursal ya coincide exactamente con un
     branchName de la proyección, también se acepta. Sin resolución estable
     → "Pendiente de alcance autorizado" (fail-closed). */
  /* P1 hardening (V164): la coincidencia exacta vale; la normalizada solo vale
     si es ÚNICA. Ambigüedad (0 o >1 candidatos) → fail-closed. */
  const resolveBranchName=()=>{
    if(!proj||role!=='sucursal'||!u.scopeSucursal) return null;
    const raw=String(u.scopeSucursal);
    const known=new Set(proj.branchRows.map(r=>r.branchName));
    if(known.has(raw)) return raw;
    let uiList=[];
    try{ uiList=(CX.clienteData&&typeof CX.clienteData.sucursales==='function')?(CX.clienteData.sucursales(p)||[]):[]; }catch(e){ uiList=[]; }
    const hits=uiList.filter(s=>s&&(String(s.id)===raw||String(s.name)===raw));
    if(hits.length!==1) return null;
    const hit=hits[0];
    if(hit.name&&known.has(hit.name)) return hit.name;
    if(hit.name){ const norm=[...new Set(proj.branchRows.filter(r=>sanitize(r.branchName)===sanitize(hit.name)).map(r=>r.branchName))]; if(norm.length===1) return norm[0]; }
    return null;
  };
  const resolvedBranchName=resolveBranchName();
  const myBranchRows=resolvedBranchName?proj.filter({branchName:resolvedBranchName},'branch'):[];

  const scopeGate=()=>{
    if(role==='regional') return {state:'pending_scope',explain:'Todavía no existe una dimensión regional estable autorizada en la fuente; las exportaciones quedan bloqueadas hasta definir ese alcance.'};
    if(role==='sucursal'&&!myBranchRows.length) return {state:'pending_scope',explain:'La sucursal asignada a este usuario no se resuelve de forma estable en la fuente verificada; las exportaciones quedan bloqueadas.'};
    return null;
  };
  /* P0-1 (V164): con rol Sucursal TODOS los reportes disponibles se derivan
     exclusivamente de branchRows filtradas por la sucursal resuelta — nunca
     de rows de todo el país. */
  const scopeFor=(cat)=>{
    const s={periodKey};
    if(role==='sucursal'){ s.branchName=resolvedBranchName; }
    else if(role==='director'&&selectedCountry){ s.country=selectedCountry; }
    if(cat.id==='period_trend') delete s.periodKey;
    return s;
  };
  const scopeLabelText=()=>{
    if(role==='sucursal') return 'Sucursal: '+(resolvedBranchName||u.scopeSucursal||'—');
    if(role==='regional') return 'Alcance regional pendiente';
    return selectedCountry?('País: '+selectedCountry):'Todos los países';
  };

  function statusFor(cat){
    if(cat.availability!=='available') return {state:'pending_source',explain:'Falta la fuente: '+(MISSING[cat.id]||cat.requiredSource||'origen de datos')+'. No se muestran cifras inventadas.',rows:null};
    const gate=scopeGate(); if(gate) return {...gate,rows:null};
    if(!proj) return {state:'pending_source',explain:'La fuente operativa verificada aún no está conectada en este entorno; sin ella no hay filas reales que mostrar ni exportar.',rows:null};
    if(!periodKey) return {state:'no_data',explain:'El contexto actual no expone un periodo verificable; para no inferir un periodo distinto al seleccionado, este reporte queda bloqueado.',rows:null};
    let rows;
    if(role==='sucursal'){ rows=proj.filter(scopeFor(cat),'branch'); }
    else{ const r=proj.report(cat.id,scopeFor(cat)); if(!r||!r.available) return {state:'pending_source',explain:'La fuente marca este reporte como pendiente.',rows:null}; rows=r.rows||[]; }
    /* P1 (V164): la tendencia excluye por defecto el periodo activo (latestPeriod),
       según defaultExcludesLatestActivePeriod del contrato vigente. */
    if(cat.id==='period_trend'&&proj.latestPeriod){ rows=rows.filter(x=>x&&x.periodKey!==proj.latestPeriod); }
    rows=rows.filter(x=>x&&typeof x.visits==='number');
    if(!rows.length) return {state:'no_data',explain:'Sin datos para este periodo y alcance.',rows:null};
    return {state:'available',rows};
  }

  const M=[['Visitas','visits'],['Asignadas','assigned'],['Sin asignar','unassigned'],['Realizadas','performed'],['Con cuestionario','questionnaire'],['Submitidas','submitted'],['Pago confirmado','paymentConfirmed']];
  function computeView(cat,rows){
    const branchDims=[['Sucursal','branchName'],['Ciudad','city'],['País','country']];
    const dims=cat.projectionLevel==='branch'?branchDims
      :(role==='sucursal'?(cat.id==='period_trend'?[['Periodo','periodKey'],['Sucursal','branchName'],['País','country']]:branchDims)
      :[['Periodo','periodKey'],['País','country']]);
    const extra=cat.id==='country_coverage'?[['Avance de realizadas','__pct']]:[];
    const val=(r,k)=>k==='__pct'?((typeof r.visits==='number'&&r.visits>0)?Math.round(r.performed*100/r.visits)+'%':'0%'):r[k];
    const cols=[...dims,...M,...extra];
    const head=cols.map(c=>c[0]);
    const trows=rows.map(r=>cols.map(c=>{const v=val(r,c[1]);return (v==null||v==='')?'—':String(v);}));
    const data=rows.map(r=>{const o={};cols.forEach(c=>{const v=val(r,c[1]);o[c[0]]=(v==null)?'':v;});return o;});
    const tot=(k)=>rows.reduce((a,r)=>a+((typeof r[k]==='number')?r[k]:0),0);
    const summary=['Filas en alcance: '+rows.length,'Visitas: '+tot('visits')+' · Asignadas: '+tot('assigned')+' · Sin asignar: '+tot('unassigned'),'Realizadas: '+tot('performed')+' · Con cuestionario: '+tot('questionnaire')+' · Submitidas: '+tot('submitted')+' · Pago confirmado: '+tot('paymentConfirmed')];
    return {head,trows,data,summary};
  }

  function ensurePrintStyle(){
    if(document.getElementById('cxReportPrintStyle')) return;
    const st=document.createElement('style');st.id='cxReportPrintStyle';
    st.textContent='#cxReportPrint{display:none}@media print{body>*:not(#cxReportPrint){display:none !important}#cxReportPrint{display:block !important;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#1f2937}#cxReportPrint h1{font-size:22px;margin:0 0 6px}#cxReportPrint .cxr-meta{font-size:12px;color:#4b5563;margin-bottom:16px}#cxReportPrint table{width:100%;border-collapse:collapse;font-size:12px}#cxReportPrint th,#cxReportPrint td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}}';
    document.head.appendChild(st);
  }
  function exportPDF(cat){
    const status=statusFor(cat); if(status.state!=='available'){CX.ui.toast(STATE_META[status.state].label,'err');return;}
    const view=computeView(cat,status.rows);
    ensurePrintStyle();
    let host=document.getElementById('cxReportPrint');
    if(!host){host=document.createElement('div');host.id='cxReportPrint';document.body.appendChild(host);}
    host.innerHTML=`<h1>${esc(cat.label)}</h1><div class="cxr-meta"><b>${esc(projectLabel)}</b> · ${esc(periodLabel)} · ${esc(scopeLabelText())} · ${esc(SOURCE_LABEL)} · ${esc(fmtDate())}</div><ul style="margin:0 0 16px 18px;font-size:13px">${view.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><table><thead><tr>${view.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${view.trows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    window.print();
  }
  function exportExcel(cat){
    const status=statusFor(cat); if(status.state!=='available'){CX.ui.toast(STATE_META[status.state].label,'err');return;}
    if(typeof XLSX==='undefined'){CX.ui.toast('Error al generar archivo','err');return;}
    try{
      const view=computeView(cat,status.rows);
      if(!view.data.length){CX.ui.toast('Sin datos para este periodo y alcance','err');return;}
      const summary=[['Reporte',cat.label],['Proyecto',projectLabel],['Periodo',periodLabel],['Alcance',scopeLabelText()],['Fuente',SOURCE_LABEL],['Fecha de generación',fmtDate()],['Filas',view.data.length]];
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),'Resumen');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(view.data),'Datos');
      XLSX.writeFile(wb,buildFilename(cat,'xlsx'));
      CX.ui.toast('Excel generado: '+cat.label+' ('+view.data.length+' filas)','ok');
    }catch(e){CX.ui.toast('Error al generar archivo','err');}
  }
  function exportPPT(cat){
    const status=statusFor(cat); if(status.state!=='available'){CX.ui.toast(STATE_META[status.state].label,'err');return;}
    if(typeof PptxGenJS==='undefined'){CX.ui.toast('Error al generar archivo','err');return;}
    try{
      const view=computeView(cat,status.rows);
      if(!view.trows.length){CX.ui.toast('Sin datos para este periodo y alcance','err');return;}
      const pptx=new PptxGenJS();
      pptx.defineLayout({name:'CX_16x9',width:13.33,height:7.5});pptx.layout='CX_16x9';
      const s1=pptx.addSlide();
      s1.addText(cat.label,{x:0.6,y:2.2,w:12,h:1,fontSize:32,bold:true,color:'1F2937'});
      s1.addText(projectLabel+' · '+periodLabel,{x:0.6,y:3.2,w:12,h:0.6,fontSize:16,color:'4B5563'});
      s1.addText(scopeLabelText()+' · '+fmtDate(),{x:0.6,y:3.7,w:12,h:0.5,fontSize:12,color:'6B7280'});
      const s2=pptx.addSlide();
      s2.addText('Resumen operativo',{x:0.5,y:0.4,w:12,h:0.6,fontSize:22,bold:true});
      s2.addText(view.summary.map(t=>({text:t,options:{bullet:true,breakLine:true}})),{x:0.6,y:1.2,w:11.5,h:3,fontSize:16,color:'1F2937'});
      const s3=pptx.addSlide();
      const maxRows=12, shown=view.trows.slice(0,maxRows);
      s3.addText('Detalle'+(view.trows.length>maxRows?(' (primeras '+maxRows+' de '+view.trows.length+' filas; el Excel contiene todas)'):''),{x:0.5,y:0.4,w:12.3,h:0.6,fontSize:18,bold:true});
      s3.addTable([view.head.map(h=>({text:h,options:{bold:true}})),...shown],{x:0.5,y:1.1,w:12.3,fontSize:9,border:{type:'solid',color:'D1D5DB',pt:0.5}});
      const s4=pptx.addSlide();
      s4.addText('Nota de fuente',{x:0.5,y:0.4,w:12,h:0.6,fontSize:22,bold:true});
      s4.addText([{text:SOURCE_LABEL,options:{breakLine:true}},{text:'Alcance: '+scopeLabelText(),options:{breakLine:true}},{text:'Generado: '+fmtDate(),options:{breakLine:true}},{text:'"Ver como" es una vista previa de rol, no un control de seguridad real.',options:{breakLine:true,italic:true,color:'6B7280'}}],{x:0.6,y:1.2,w:11.5,h:3,fontSize:14});
      const done=pptx.writeFile({fileName:buildFilename(cat,'pptx')});
      if(done&&typeof done.then==='function'){done.then(()=>CX.ui.toast('PowerPoint generado: '+cat.label,'ok')).catch(()=>CX.ui.toast('Error al generar archivo','err'));}
      else CX.ui.toast('PowerPoint generado: '+cat.label,'ok');
    }catch(e){CX.ui.toast('Error al generar archivo','err');}
  }

  function renderRoot(){
    const countrySel=(role==='director'&&countries.length)?`<select class="sel" id="repPaisSel" aria-label="Filtrar por país" style="width:auto;min-width:150px"><option value="">Todos los países</option>${countries.map(c=>`<option value="${esc(c)}" ${c===selectedCountry?'selected':''}>${esc(c)}</option>`).join('')}</select>`:'';
    const levelLabel=(cat)=>cat.projectionLevel==='branch'?'Sucursal':(cat.projectionLevel==='periodCountry'?'Periodo y país':'Pendiente');
    const card=(cat)=>{
      const meta=CARD_META[cat.id]||{icon:'📄',desc:''};
      const status=statusFor(cat), sm=STATE_META[status.state]||STATE_META.no_data;
      const canExport=status.state==='available';
      const btn=(fmt)=>`<button class="btn btn-soft btn-sm" data-rep-act="${cat.id}:${fmt}" ${canExport?'':'disabled'} aria-label="${esc(fmt+' — '+cat.label)}" title="${canExport?esc('Exportar '+fmt):esc(sm.label)}">${fmt}</button>`;
      return `<div class="card card-p" style="min-width:0">
        <div class="flex" style="gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div style="font-size:26px;flex-shrink:0">${meta.icon}</div>
          <div style="flex:1;min-width:180px">
            <div class="card-t" style="font-size:14px">${esc(cat.label)}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:2px">${esc(meta.desc)} · ${esc(levelLabel(cat))}</div>
            <div style="margin-top:8px">${ui.bdg(sm.label,sm.tone)}</div>
            ${status.explain?`<div style="font-size:11.5px;color:var(--t2);margin-top:6px;line-height:1.5">${esc(status.explain)}</div>`:''}
          </div>
          <div class="flex" style="gap:6px;flex-wrap:wrap">${btn('PDF')}${btn('Excel')}${btn('PPT')}</div>
        </div>
      </div>`;
    };
    return `<div id="repRoot">
      <div class="card card-p" style="margin-bottom:16px">
        <div class="flex" style="gap:10px;flex-wrap:wrap;align-items:center">
          <span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Contexto</span>
          <span class="bdg bdg-b">${esc(projectLabel)}</span><span class="bdg bdg-p">${esc(periodLabel)}</span><span class="bdg bdg-n">${esc(scopeLabelText())}</span><span class="bdg bdg-g">${esc(SOURCE_LABEL)}</span>
          ${countrySel}
        </div>
      </div>
      <div class="grid g2" style="gap:14px">${catalog.map(card).join('')}</div>
      <div style="margin-top:16px">${ui.aiBox('Cada reporte usa las filas reales de la fuente verificada según tu rol y alcance. “Ver como” es una vista previa, no un control de seguridad real.','Exportación por alcance')}</div>
    </div>`;
  }

  setTimeout(()=>{
    CX.cliUI.wirePersona();
    const wire=()=>{
      const sel=document.getElementById('repPaisSel');
      if(sel) sel.addEventListener('change',(e)=>{selectedCountry=e.target.value;try{sessionStorage.setItem('cx_rep_country',selectedCountry);}catch(err){}const root=document.getElementById('repRoot');if(root){root.outerHTML=renderRoot();wire();}});
      document.querySelectorAll('[data-rep-act]').forEach(b=>{
        if(b.disabled) return;
        b.addEventListener('click',()=>{
          const i=b.dataset.repAct.lastIndexOf(':');const id=b.dataset.repAct.slice(0,i),fmt=b.dataset.repAct.slice(i+1);
          const cat=catalog.find(c=>c.id===id);if(!cat)return;
          if(fmt==='PDF')exportPDF(cat);else if(fmt==='Excel')exportExcel(cat);else exportPPT(cat);
        });
      });
    };
    wire();
  },0);

  return `${ui.ph('Reportes','Entregables operativos reales por periodo, país y sucursal')}${CX.cliUI.personaBarHTML()}${renderRoot()}`;
});

/* ============== Mi Programa (cuestionario con pesos + simulador) ============== */
CX.module('cli_programa', ({ui})=>{
  const C=CX.clienteData, p=CX.data.period(), prog=C.programa(p);
  const secBlock=(sec)=>`
    <div class="card card-p">
      <div class="between"><div class="card-t" style="font-size:14px">${sec.name}</div><span class="bdg bdg-b">Peso ${sec.weight}%</span></div>
      <table class="tbl" style="margin-top:10px"><thead><tr><th>Pregunta</th><th style="text-align:right">Peso en la sección</th></tr></thead><tbody>
        ${sec.questions.map(q=>`<tr><td style="font-size:12.5px">${q.name}</td><td style="text-align:right"><b style="font-family:var(--disp)">${q.weight}%</b></td></tr>`).join('')}
      </tbody></table>
    </div>`;
  const simRows=prog.map(sec=>`<div class="flex" style="gap:10px;margin-bottom:10px">
    <span style="width:160px;font-size:12px;color:var(--t2);flex-shrink:0">${sec.name} · ${sec.weight}%</span>
    <input type="range" min="0" max="100" value="80" data-sim="${sec.id}" data-w="${sec.weight}" style="flex:1;accent-color:var(--brand)">
    <b data-simv="${sec.id}" style="width:34px;text-align:right;font-size:12px;font-family:var(--disp)">80</b></div>`).join('');

  setTimeout(()=>{ CX.cliUI.wirePersona();
    const calc=()=>{ let tot=0; document.querySelectorAll('[data-sim]').forEach(r=>{ const v=+r.value, w=+r.dataset.w; tot+=v*(w/100); document.querySelector('[data-simv="'+r.dataset.sim+'"]').textContent=v; });
      tot=Math.round(tot); const out=document.getElementById('simScore'); out.textContent=tot;
      out.style.color=CX.cliUI.TONE_VAR[CX.clienteData.tone(tot)]; document.getElementById('simPill').innerHTML=CX.cliUI.pill(tot); };
    document.querySelectorAll('[data-sim]').forEach(r=>r.addEventListener('input',calc)); calc();
  },0);

  const sumSec=prog.reduce((a,s)=>a+s.weight,0);
  return `
    ${ui.ph('Mi Programa de Evaluación', 'Qué se evalúa y cuánto pesa cada cosa · ponderación del score')}
    ${CX.cliUI.personaBarHTML()}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="between"><div class="card-t">Estructura ponderada</div><span class="bdg ${sumSec===100?'bdg-g':'bdg-r'}">Secciones suman ${sumSec}%</span></div>
      <p style="font-size:12.5px;color:var(--t2);margin-top:6px">El score de cada visita = Σ(sección × su peso). Dentro de cada sección, cada pregunta aporta según su propio peso. La consultora configura esta estructura por programa; aquí la consultas (edición según tu plan).</p>
    </div>
    <div class="grid g2" style="gap:14px;margin-bottom:18px">${prog.map(secBlock).join('')}</div>
    <div class="card card-p">
      <div class="between" style="margin-bottom:14px"><div class="card-t">🧮 Simulador de score</div><div class="flex" style="gap:10px"><b id="simScore" style="font-size:30px;font-family:var(--disp);color:var(--brand)">80</b><span id="simPill"></span></div></div>
      ${simRows}
      <div style="margin-top:8px">${ui.aiBox('Mueve las secciones para ver cómo cambia el score global según los pesos del programa. Útil para fijar metas por sucursal.','Cómo leer el score')}</div>
    </div>`;
});

/* ============== Servicios & Add-ons (marketplace) ============== */
CX.module('cli_market', ({ui})=>{
  const C=CX.clienteData;
  const DET={
    'Investigación de mercados':{como:'Diseñamos y ejecutamos estudios ad-hoc (paneles, encuestas cuanti/cuali, focus groups) y los cruzamos con tus datos de mystery shopping para una lectura 360°.',valor:['Decisiones con evidencia, no intuición','Mismo proveedor que ya conoce tu marca','Resultados en tableros, no en PDFs sueltos']},
    'Voz del Cliente (VoC)':{como:'Encuestas post-transacción (QR en sucursal, link, WhatsApp) que capturan al cliente REAL y calculan tu NPS/CSAT en vivo, comparable con la evaluación incógnita.',valor:['Contrastas lo que dice el cliente vs. lo que ve el evaluador','NPS por sucursal en tiempo real','Alertas automáticas ante caídas']},
    'Mystery shopping competitivo':{como:'Medimos a tu competencia con la misma vara y escenarios, para que sepas dónde estás vs. el sector.',valor:['Benchmark objetivo por sector','Identifica tus ventajas y brechas reales','Argumento para dirección y junta']},
    'Academia para tu personal':{como:'Cursos y certificación para TU personal, generados a partir de las brechas que detecta el programa: si falla "tiempos de espera", se crea el módulo de refuerzo.',valor:['Capacitación dirigida a lo que de verdad falla','Certifica a tu equipo, no solo lo evalúa','Mide la mejora curso → siguiente visita']},
    'Evidencia foto/GPS/video':{como:'Validación de ubicación (geocerca), foto con timestamp y video según el escenario, para evidencia irrefutable de cada visita.',valor:['Cero dudas sobre si la visita ocurrió','Evidencia con hora y lugar verificables','Soporta auditorías y reclamos']},
    'BI & tableros avanzados':{como:'Conectamos tus datos a Power BI / Looker para explotarlos a profundidad con tableros ejecutivos a la medida.',valor:['Tu data integrada con el resto del negocio','Tableros para dirección','Exploración sin límites']},
    'Contenidos & campañas':{como:'Generación de piezas y campañas (con IA), publicación y medición — para reclutar shoppers o comunicar resultados de marca.',valor:['Convocatorias de evaluadores más rápidas','Comunicación de marca consistente','Medición de alcance y engagement']},
    'Integraciones a la medida':{como:'Conectamos WhatsApp, Notion, Zoom/Meet, Mailchimp, Microsoft 365, SSO y más, según tu stack.',valor:['La plataforma vive dentro de tus herramientas','Automatizaciones de punta a punta','Single sign-on para tu equipo']},
  };
  const tagTone={'Add-on':'b','Pro':'p','Enterprise':'a'};
  const detail=(m)=>{ const d=DET[m.name]||{como:m.desc,valor:[]};
    ui.modal(m.icon+' '+m.name,`
      <div class="flex" style="gap:8px;margin-bottom:10px">${ui.bdg(m.tag,tagTone[m.tag]||'n')}<span class="muted" style="font-size:11.5px">${m.cat}</span></div>
      <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:12px">${d.como}</div>
      ${d.valor.length?`<div class="card-t" style="font-size:12.5px;margin-bottom:6px">Valor para tu marca</div>
      <ul style="margin:0 0 14px 18px;font-size:12.5px;color:var(--t2);line-height:1.7">${d.valor.map(v=>`<li>${v}</li>`).join('')}</ul>`:''}
      <div style="text-align:right"><button class="btn btn-pr btn-sm" data-req="${m.name}">Solicitar a mi consultora</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('[data-req]').addEventListener('click',()=>{close();ui.toast('Solicitud enviada a tu consultora: '+m.name,'ok',2800);})});
  };
  setTimeout(()=>{ CX.cliUI.wirePersona();
    document.querySelectorAll('[data-svc]').forEach(b=>b.addEventListener('click',()=>detail(C.marketplace.find(x=>x.name===b.dataset.svc))));
    document.querySelectorAll('[data-card]').forEach(b=>b.addEventListener('click',()=>detail(C.marketplace.find(x=>x.name===b.dataset.card))));
  },0);
  const card=(m)=>`<div class="card card-p hov" data-card="${m.name}" style="cursor:pointer">
    <div class="between"><div style="font-size:26px">${m.icon}</div>${ui.bdg(m.tag,tagTone[m.tag]||'n')}</div>
    <div class="card-t" style="font-size:14px;margin-top:10px">${m.name}</div>
    <div style="font-size:12.5px;color:var(--t2);margin-top:4px;line-height:1.5">${m.desc}</div>
    <div style="font-size:11px;color:var(--t3);margin-top:8px">${m.cat}</div>
    <button class="btn btn-soft btn-sm" data-svc="${m.name}" style="margin-top:12px;width:100%">Ver detalle y solicitar</button>
  </div>`;
  return `
    ${ui.ph('Servicios & Add-ons', 'Lleva tu programa más allá del trabajo de campo')}
    ${CX.cliUI.personaBarHTML()}
    <div class="card card-p" style="margin-bottom:16px;background:var(--brand-light);border:none">
      <div class="card-t" style="font-size:15px;color:var(--brand-dark)">De plataforma operativa a plataforma estratégica</div>
      <p style="font-size:12.5px;color:var(--brand-dark);margin-top:4px;line-height:1.6">Estos servicios los habilita tu consultora como valor agregado: investigación, voz del cliente, capacitación, BI, marketing e integraciones. Solicítalos y tu consultora arma la propuesta.</p>
    </div>
    <div class="grid g3" style="gap:14px">${C.marketplace.map(card).join('')}</div>`;
});
