/* ============================================================
   CXOrbia · Motor del Portal Estratégico del Cliente
   Genérico/white-label. Deriva del proyecto activo:
   - Programa de evaluación con SECCIONES y PREGUNTAS ponderadas (pesos %)
   - Scorecard por sucursal (score ponderado 0–100 + desglose por sección)
   - Agregados ejecutivos, scope por rol del cliente, planes de acción.
   Sin datos reales: todo se genera determinísticamente por proyecto.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  function rng(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=s*16807%2147483647)/2147483647;}
  function hash(str){let h=0;for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))|0;}return Math.abs(h)+7;}
  function pick(r,a){return a[Math.floor(r()*a.length)];}
  const NAMES=['A. Gómez','C. Ramírez','M. Díaz','J. Herrera','L. Castro','P. Morales','R. Flores','S. Mejía','D. Navarro','V. Rosales','F. Aguilar','N. Cabrera'];

  /* programa por defecto (genérico de experiencia/auditoría) — pesos suman 100 */
  const PROGRAMA_BASE = [
    {id:'recib', name:'Recibimiento', weight:15, questions:[
      {id:'saludo',name:'Saludo y bienvenida',weight:50},{id:'espera',name:'Tiempo de espera inicial',weight:50}]},
    {id:'aten', name:'Asesoría y atención', weight:30, questions:[
      {id:'conoc',name:'Conocimiento del asesor',weight:40},{id:'amab',name:'Amabilidad y actitud',weight:35},{id:'neces',name:'Detección de necesidad',weight:25}]},
    {id:'tiemp', name:'Tiempos de servicio', weight:15, questions:[
      {id:'agil',name:'Agilidad del proceso',weight:60},{id:'fila',name:'Manejo de filas',weight:40}]},
    {id:'inst', name:'Instalaciones y limpieza', weight:15, questions:[
      {id:'limp',name:'Limpieza y orden',weight:50},{id:'imag',name:'Imagen y señalización',weight:50}]},
    {id:'proc', name:'Proceso / Producto', weight:15, questions:[
      {id:'cumpl',name:'Cumplimiento del protocolo',weight:55},{id:'calid',name:'Calidad del producto/servicio',weight:45}]},
    {id:'cierre', name:'Cierre y despedida', weight:10, questions:[
      {id:'desp',name:'Despedida e invitación a volver',weight:60},{id:'cross',name:'Venta cruzada / adicional',weight:40}]},
  ];

  const LS_ACC = 'cx_cli_acciones';

  CX.clienteData = {
    NAMES,

    /* ---- programa del proyecto (FUENTE ÚNICA: core/programa.js) ---- */
    programa(p){
      p = p || CX.data.period();
      if(CX.programa) return CX.programa.sections(p.id).map(s=>({...s, questions:s.questions.map(q=>({...q}))}));
      return (p.programa || PROGRAMA_BASE).map(s=>({...s, questions:s.questions.map(q=>({...q}))}));
    },

    /* ---- ciudades del país desde el catálogo geo (fallback simple) ---- */
    _cities(pais){
      const g=CX.GEO&&CX.GEO[pais];
      if(g){ const out=[]; Object.keys(g).forEach(dep=>g[dep].forEach(c=>out.push({dep,city:c}))); return out; }
      return [{dep:'Región Central',city:'Ciudad'}];
    },

    /* ---- scorecards por sucursal ----
       Se derivan de las VISITAS REALES del proyecto (sincronía operación→cliente).
       El score usa cuestionarios efectivamente enviados (evaluada); si una sucursal
       aún no tiene score real, cae a un valor determinístico estable. */
    sucursales(p){
      p = p || CX.data.period();
      /* cache key incluye el modo de datos (demo/real) — evita servir una lista
         calculada bajo un modo distinto al alternar demo/real en la misma sesión. */
      /* Corte 1B: clave de caché COMPLETA (tenant + proyecto + periodKey +
         sourceRevision + modo). Invalida sola al cambiar periodo o revisión HR. */
      const key = this._cacheKey(p);
      if(this._cache && this._cache.key===key) return this._cache.list;
      const prog=this.programa(p);
      const vis=(CX.data._visitas||[]).filter(v=>v.projectId===p.id);
      const list = vis.length ? this._fromVisitas(p, prog, vis) : this._synthetic(p, prog);
      list.sort((a,b)=>(b.score||0)-(a.score||0));
      this._cache={key, list};
      return list;
    },

    /* Bloque 1 (auditoría V100 — 20260711): fuera de modo demo, sin cuestionarios reales, NUNCA
       se fabrica un score determinístico ni un historial — se marca honestamente `real:false`,
       `score:null` y queda "pendiente de fuente" en la UI (cliente.js/cliente-insights.js deben
       mostrar ese estado, no calcular con datos ficticios). En modo demo se conserva el fallback
       determinístico existente (rotulado como ejemplo por el resto de la plataforma). */
    _allowSynthetic(){ return CX.dataSource ? CX.dataSource.showFixtures() : true; },

    /* agrupa visitas por sucursal y arma el scorecard con datos reales */
    _fromVisitas(p, prog, vis){
      const groups={};
      vis.forEach(v=>{ (groups[v.sucursal]=groups[v.sucursal]||[]).push(v); });
      const allowSynthetic=this._allowSynthetic();
      return Object.keys(groups).map((name,i)=>{
        const vs=groups[name];
        const r=rng(hash(p.id+name));
        const evals=vs.filter(v=>typeof v.score==='number' && v.evaluada);
        // score: real si hay cuestionarios enviados; si no, determinístico estable SOLO en demo
        let score, sectionScores={}, hasScore=true;
        if(evals.length){
          score=Math.round(evals.reduce((a,v)=>a+v.score,0)/evals.length);
          prog.forEach(sec=>{ const vals=evals.map(v=>v.scoreBySection&&v.scoreBySection[sec.id]).filter(x=>typeof x==='number');
            sectionScores[sec.id]= vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : Math.max(35,Math.min(100,score+Math.round((r()-0.5)*20))); });
        } else if(allowSynthetic){
          const base=58+Math.floor(r()*38); score=0;
          prog.forEach(sec=>{ const sv=Math.max(35,Math.min(100,base+Math.round((r()-0.5)*26))); sectionScores[sec.id]=sv; score+=sv*(sec.weight/100); });
          score=Math.round(score);
        } else {
          /* sin cuestionarios reales y fuera de demo: no se fabrica ningún score */
          score=null; sectionScores={}; hasScore=false;
        }
        /* prev/nps/responsable son estimaciones derivadas, no datos capturados: solo se
           fabrican en demo. Fuera de demo, sin fuente real para tendencia/NPS/responsable
           de sucursal, se deja null/"—" — la UI debe rotularlo pendiente de fuente. */
        const prev = hasScore && allowSynthetic ? Math.max(35,Math.min(100,score+Math.round((r()-0.5)*16))) : null;
        const npsVal = hasScore && allowSynthetic ? Math.max(-100,Math.min(100,Math.round((score-55)*1.6))) : null;
        const responsable = allowSynthetic ? pick(r,NAMES) : null;
        const v0=vs[0];
        return {
          id:p.id+'-su'+(i+1), code:'SUC-'+String(i+1).padStart(2,'0'), name,
          ciudad:v0.ciudad||'—', region:(CX.geo&&CX.geo.deptLabel?'':'')||v0.region||v0.ciudad||'Región', pais:v0.pais||(p.countries&&p.countries[0]),
          responsable, visitas:vs.length, evaluadas:evals.length,
          score, prev, delta: (hasScore && prev!=null) ? score-prev : null,
          nps: npsVal,
          sectionScores, real:evals.length>0, hasScore,
          lastVisit:(vs.map(v=>v.realizada||v.agendada||v.disponibleDesde||'').filter(Boolean).sort().slice(-1)[0])||(hasScore?'2026-06-15':null),
        };
      });
    },

    /* fallback puramente determinístico (proyectos sin visitas cargadas EN ABSOLUTO) — solo en demo.
       Fuera de demo, un proyecto sin visitas cargadas no tiene sucursales que mostrar: se devuelve
       una lista vacía y la UI debe rotularlo "pendiente de fuente", nunca fabricar sucursales. */
    _synthetic(p, prog){
      if(!this._allowSynthetic()) return [];
      const r=rng(hash(p.id)); const n=Math.min(p.sucursales||12,14); const list=[];
      for(let i=0;i<n;i++){
        const pais=pick(r,p.countries||['GT']); const loc=pick(r,this._cities(pais));
        const base=58+Math.floor(r()*38); const sectionScores={}; let score=0;
        prog.forEach(sec=>{ const v=Math.max(35,Math.min(100,base+Math.round((r()-0.5)*26))); sectionScores[sec.id]=v; score+=v*(sec.weight/100); });
        score=Math.round(score); const prev=Math.max(35,Math.min(100,score+Math.round((r()-0.5)*16)));
        list.push({ id:p.id+'-su'+(i+1), code:'SUC-'+String(i+1).padStart(2,'0'),
          name:'Sucursal '+loc.city+' '+(String.fromCharCode(65+(i%6))), ciudad:loc.city, region:loc.dep, pais,
          responsable:pick(r,NAMES), visitas:2+Math.floor(r()*8), evaluadas:0,
          score, prev, delta:score-prev, nps:Math.max(-100,Math.min(100,Math.round((score-55)*1.6))),
          sectionScores, real:false, hasScore:true, lastVisit:'2026-06-'+String(8+Math.floor(r()*18)).padStart(2,'0') });
      }
      return list;
    },

    /* ---- scope por rol del cliente (director/regional/sucursal) ---- */
    scoped(p){
      const all=this.sucursales(p), u=CX.session.user||{};
      if(u.clienteRole==='regional'){ const reg=u.scopeRegion||this.topRegion(p); return all.filter(s=>s.region===reg); }
      if(u.clienteRole==='sucursal'){ const id=u.scopeSucursal||all[0].id; return all.filter(s=>s.id===id); }
      return all;
    },
    topRegion(p){ const c={}; this.sucursales(p).forEach(s=>c[s.region]=(c[s.region]||0)+1); return Object.keys(c).sort((a,b)=>c[b]-c[a])[0]; },
    regions(p){ return [...new Set(this.sucursales(p).map(s=>s.region))]; },

    /* ---- agregados ejecutivos sobre un conjunto de sucursales ----
       Bloque 1 (auditoría V100): entradas con `hasScore:false` (fuera de demo, sin cuestionarios
       reales) se EXCLUYEN de todos los promedios/ordenamientos por score — nunca se tratan como 0
       ni se promedian con `null`. Si NINGUNA sucursal tiene score real, el resumen honesto reporta
       `pendingSource:true` y deja los agregados numéricos en `null` en vez de inventar un 0/NaN. */
    resumen(list){
      /* T3 (paquete V109): usa el mismo validScore() que el resto de la app — nunca
         `typeof===number` a secas (eso aceptaba NaN/Infinity en los promedios). */
      const withScore=list.filter(s=>s.hasScore!==false && this.validScore(s.score));
      const n=withScore.length;
      if(!n){
        return {
          n:list.length, visitas:list.reduce((a,s)=>a+(s.visitas||0),0),
          score:null, nps:null, excelentes:0, criticas:0, mejora:0,
          top:[], bottom:[], peorSeccion:null, mejorSeccion:null, secAvg:[],
          pendingSource:true,
        };
      }
      const totVis=withScore.reduce((a,s)=>a+s.visitas,0);
      const wScore=Math.round(withScore.reduce((a,s)=>a+s.score*s.visitas,0)/(totVis||1));
      const prog=this.programa();
      const secAvg=prog.map(sec=>({sec, val:Math.round(withScore.reduce((a,s)=>a+(s.sectionScores[sec.id]||0),0)/n)}));
      secAvg.sort((a,b)=>a.val-b.val);
      return {
        n:list.length, visitas:totVis,
        score:wScore,
        nps: withScore.some(s=>s.nps==null) ? null : Math.round(withScore.reduce((a,s)=>a+(s.nps||0),0)/n),
        excelentes:withScore.filter(s=>this.band(s.score).key==='excelente').length,
        criticas:withScore.filter(s=>this.band(s.score).key==='critico').length,
        mejora:withScore.filter(s=>s.delta>0).length,
        top:[...withScore].sort((a,b)=>b.score-a.score).slice(0,5),
        bottom:[...withScore].sort((a,b)=>a.score-b.score).slice(0,5),
        peorSeccion:secAvg[0], mejorSeccion:secAvg[secAvg.length-1],
        secAvg,
        pendingSource: n<list.length /* algunas sucursales sin score real todavía */,
      };
    },

    /* ---- tono/etiqueta de score ---- */
    /* T3 (paquete V109 — 20260712, corrección P0 real): V108 dejó DOS umbrales distintos para
       "crítico" en el mismo flujo — la distribución de cli_dashboard usaba `<65` mientras el KPI
       y el modal de drill usaban `<70` — así el total mostrado no coincidía entre vistas. Además
       `typeof score==='number'` acepta `NaN` e `Infinity`, que rompen barras/promedios/ordenamientos
       sin que ninguna capa lo detecte. validScore()/band() son ahora la ÚNICA fuente de verdad:
       válido solo si es number Y finito; bandas: crítico <70, atención 70–74, bueno 75–84,
       excelente ≥85. tone()/label() (y por lo tanto donut/pill en cliente.js) se derivan de la
       MISMA función — ya no puede haber un umbral distinto en otro lugar. */
    validScore(v){ return typeof v==='number' && Number.isFinite(v); },
    band(v){
      if(!this.validScore(v)) return {key:'pending', label:'Pendiente de evaluación', tone:'n'};
      if(v>=85) return {key:'excelente', label:'Excelente', tone:'g'};
      if(v>=75) return {key:'bueno', label:'Bueno', tone:'b'};
      if(v>=70) return {key:'atencion', label:'En atención', tone:'a'};
      return {key:'critico', label:'Crítico', tone:'r'};
    },
    tone(v){ return this.band(v).tone; },
    label(v){ return this.band(v).label; },

    /* ---- planes de acción (seed + persistentes) ---- */
    /* seed de planes de acción — SOLO en demo (Bloque 1, auditoría V100): fuera de demo no se
       fabrican "reconocimientos"/"planes de mejora" a partir de sucursales sin score real. */
    _seedAcciones(p){
      if(!this._allowSynthetic()) return [];
      const list=this.sucursales(p).filter(s=>s.hasScore!==false); const out=[];
      const top=list[0], bottom=list[list.length-1];
      if(top) out.push({id:'seed-rec', tipo:'reconocimiento', sucursal:top.name, sucId:top.id, titulo:'Reconocimiento por desempeño', detalle:'Score '+top.score+'. Comunicar al equipo y replicar buenas prácticas.', responsable:top.responsable, estado:'Abierto', fecha:'2026-06-19'});
      if(bottom && bottom!==top) out.push({id:'seed-mej', tipo:'mejora', sucursal:bottom.name, sucId:bottom.id, titulo:'Plan de mejora — '+this.resumen([bottom]).peorSeccion.sec.name, detalle:'Score '+bottom.score+'. Capacitación y reevaluación en 30 días.', responsable:bottom.responsable, estado:'En curso', fecha:'2026-06-17'});
      out.push({id:'seed-inc', tipo:'incentivo', sucursal:top?top.name:'—', sucId:top?top.id:'', titulo:'Incentivo trimestral al mejor score', detalle:'Bono al equipo de la sucursal líder del trimestre.', responsable:'RRHH', estado:'Abierto', fecha:'2026-06-20'});
      return out;
    },
    acciones(p){
      p=p||CX.data.period();
      let extra=[]; try{ extra=JSON.parse(localStorage.getItem(LS_ACC)||'[]').filter(a=>a.projectId===p.id); }catch(e){}
      return [...extra, ...this._seedAcciones(p)];
    },
    addAccion(p, a){
      p=p||CX.data.period();
      let all=[]; try{ all=JSON.parse(localStorage.getItem(LS_ACC)||'[]'); }catch(e){}
      const rec=Object.assign({id:'acc-'+Date.now().toString(36), projectId:p.id, estado:'Abierto', fecha:new Date().toISOString().slice(0,10)}, a);
      all.unshift(rec); try{ localStorage.setItem(LS_ACC, JSON.stringify(all)); }catch(e){}
      return rec;
    },

    /* ---- marketplace de servicios / add-ons (upsell) ---- */
    marketplace:[
      {cat:'Investigación', icon:'🔬', name:'Investigación de mercados', desc:'Estudios ad-hoc, paneles y encuestas cuantitativas/cualitativas.', tag:'Add-on'},
      {cat:'Voz del Cliente', icon:'💬', name:'Voz del Cliente (VoC)', desc:'Encuestas post-transacción, QR en sucursal y NPS del cliente real.', tag:'Add-on'},
      {cat:'Benchmark', icon:'📊', name:'Mystery shopping competitivo', desc:'Mide a tu competencia con la misma vara y compara por sector.', tag:'Pro'},
      {cat:'Capacitación', icon:'🎓', name:'Academia para tu personal', desc:'Cursos y certificación del personal según brechas detectadas.', tag:'Add-on'},
      {cat:'Evidencia', icon:'📍', name:'Evidencia foto/GPS/video', desc:'Validación de ubicación y evidencia multimedia con timestamp.', tag:'Pro'},
      {cat:'Analítica', icon:'📈', name:'BI & tableros avanzados', desc:'Conecta Power BI / Looker y explota tus datos a profundidad.', tag:'Enterprise'},
      {cat:'Marketing', icon:'📣', name:'Contenidos & campañas', desc:'Generación de piezas, publicaciones y medición de campañas.', tag:'Add-on'},
      {cat:'Integración', icon:'🔗', name:'Integraciones a la medida', desc:'WhatsApp, Notion, Zoom/Meet, Mailchimp, M365, SSO y más.', tag:'Pro'},
    ],

    /* ============================================================
       Corte 1B — clave de caché e invalidación por revisión
       tenantId + projectId(programKey) + periodKey + sourceRevision + mode.
       periodKey se deriva de las fechas reales del periodo (nunca del id
       visual); sourceRevision resume el estado operativo vivo del periodo
       (visitas: estado/score/evaluada/cuestionario/shopper) para invalidar
       cuando la HR/operación cambia. ============================================================ */
    _tenantId(){ try{ return (CX.session&&CX.session.user&&CX.session.user.tenantId)||(CX.BRAND&&CX.BRAND.id)||'default'; }catch(e){ return 'default'; } },
    _mode(){ try{ return (CX.dataSource&&CX.dataSource.mode)||'demo'; }catch(e){ return 'demo'; } },
    periodKey(p){ p=p||CX.data.period(); if(!p) return null;
      if(typeof p.periodKey==='string'&&p.periodKey) return p.periodKey;
      /* mes real (YYYY-MM) derivado de las fechas de las visitas del periodo;
         nunca del id visual. Estable por proyecto/periodo. */
      try{ const vis=(CX.data._visitas||[]).filter(v=>v.projectId===p.id); const ds=[];
        vis.forEach(v=>{ [v.realizada,v.agendada,v.cuestFecha,v.disponibleDesde].forEach(d=>{ if(typeof d==='string'&&d.length>=7) ds.push(d); }); });
        ds.sort(); if(ds.length) return ds[0].slice(0,7); }catch(e){}
      return p.id; },
    sourceRevision(p){ p=p||CX.data.period(); if(!p) return '0';
      const vis=(CX.data._visitas||[]).filter(v=>v.projectId===p.id);
      let h=(vis.length*2654435761)>>>0;
      for(const v of vis){ const s=(v.id||'')+'|'+(v.estado||'')+'|'+(v.score==null?'':v.score)+'|'+(v.evaluada?1:0)+'|'+(v.cuestFecha||'')+'|'+(v.shopperId||''); for(let i=0;i<s.length;i++){ h=((h*31)+s.charCodeAt(i))>>>0; } }
      return String(h); },
    _cacheKey(p){ p=p||CX.data.period(); const pid=(CX.data.programKey?CX.data.programKey(p):p.id); return [this._tenantId(),pid,this.periodKey(p),this.sourceRevision(p),this._mode()].join('::'); },

    /* ---- Operación del periodo (SIEMPRE real, cambia por periodKey) ----
       Separada de los RESULTADOS DE EVALUACIÓN (score/NPS/secciones). Se deriva
       de las visitas vivas del periodo; no fabrica ninguna cifra. */
    operacion(p){
      p=p||CX.data.period();
      /* P0-4 (V171): estados canónicos ÚNICOS — se consumen CX.data.visitFacets/visitBucketFns.
         Prohibido redefinir done/cuest/submitted aquí; submitted exige submit explícito;
         se excluyen canceladas/archivadas. Dashboard, detalle, Panorama y reportes coinciden. */
      const BF=CX.data.visitBucketFns, F=CX.data.visitFacets;
      const vis=(CX.data._visitas||[]).filter(v=>v.projectId===p.id && !F(v).cancelled);
      const countries=[...new Set(vis.map(v=>v.pais).filter(Boolean))];
      const agg=(arr)=>({visitas:arr.length,asignadas:arr.filter(BF.asignadas).length,realizadas:arr.filter(BF.realizadas).length,cuestionarios:arr.filter(v=>F(v).questionnaire&&!F(v).cancelled).length,submitidas:arr.filter(v=>F(v).submitted&&!F(v).cancelled).length,cobertura:arr.length?Math.round(arr.filter(BF.realizadas).length/arr.length*100):0});
      return { periodKey:this.periodKey(p), sourceRevision:this.sourceRevision(p),
        total:agg(vis),
        byCountry:countries.map(c=>Object.assign({country:c},agg(vis.filter(v=>v.pais===c)))).sort((a,b)=>b.visitas-a.visitas),
        hasOps:vis.length>0 };
    },

    invalidate(){ this._cache=null; },

    /* RESULTADOS REALES de operación: scores de cuestionarios efectivamente
       enviados por shoppers en este proyecto (sincronía operación → cliente). */
    realResults(p){
      p=p||CX.data.period();
      const vis=CX.data._visitas.filter(v=>v.projectId===p.id && typeof v.score==='number' && v.evaluada);
      if(!vis.length) return {count:0};
      const avg=Math.round(vis.reduce((a,v)=>a+v.score,0)/vis.length);
      const prog=this.programa(p); const bySection={};
      prog.forEach(sec=>{ const vals=vis.map(v=>v.scoreBySection&&v.scoreBySection[sec.id]).filter(x=>typeof x==='number');
        if(vals.length) bySection[sec.id]=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length); });
      const ko=vis.filter(v=>v.koFail).length;
      return {count:vis.length, avg, bySection, ko, visitas:vis};
    },
  };

  CX.bus && CX.bus.on('project', ()=>CX.clienteData.invalidate());
  CX.bus && CX.bus.on('visit-flow', ()=>CX.clienteData.invalidate());
})();
