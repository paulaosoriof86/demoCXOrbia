/* ============================================================
   CXOrbia · Importador inteligente (genérico, cualquier consultora)
   Pega/carga una HR o histórico (CSV / TSV / Excel pegado) → detecta
   columnas, propone mapeo a campos canónicos, anti-duplicado, y crea
   visitas/shoppers reales en el proyecto activo. Sincroniza (visit-flow).
   No asume un layout fijo: mapeo por palabras clave + edición manual.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  /* campos canónicos del sistema + sinónimos para autodetección */
  const FIELDS = {
    ref:        {label:'Ref / Fila', syn:['fila','ref','no','num','#','id']},
    sucursal:   {label:'Sucursal', syn:['sucursal','cinema','tienda','local','agencia','punto','establecimiento','sede']},
    ciudad:     {label:'Ciudad', syn:['ciudad','city','ubicacion','plaza','localidad']},
    franja:     {label:'Franja', syn:['franja','horario','jornada','turno','wknd','wk']},
    fecha:      {label:'Fecha', syn:['fecha','date','prog','programada','dia','realiz','realizada']},
    shopper:    {label:'Shopper', syn:['shopper','evaluador','auditor','encuestador','mystery']},
    escenario:  {label:'Escenario', syn:['escenario','scenario','tipo','programa','compra','servicio']},
    honorario:  {label:'Honorario', syn:['honorario','pago','tarifa','fee','monto','valor']},
    reembolso:  {label:'Reembolso', syn:['reembolso','combo','consumo','viatico','boleto','gasto','reintegro']},
    estado:     {label:'Estado', syn:['estado','status','etapa']},
    obs:        {label:'Observaciones', syn:['obs','observacion','nota','comentario']},
  };

  const ESTADO_MAP = [
    [/(liquidad|pagad)/i,'liquidada'],[/(submit)/i,'cuestionario'],[/(cuestionari)/i,'realizada'],
    [/(realizad)/i,'realizada'],[/(agendad|program)/i,'agendada'],[/(asignad)/i,'asignada'],
    [/(disponible|sin asign|pend)/i,'disponible'],
  ];

  function norm(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

  CX.importador = {
    FIELDS,

    /* parsea texto delimitado (autodetecta , ; tab) en {headers, rows} */
    parse(text){
      const lines=(text||'').split(/\r?\n/).filter(l=>l.trim());
      if(!lines.length) return {headers:[],rows:[]};
      const delim = (lines[0].match(/\t/)?'\t': (lines[0].split(';').length>lines[0].split(',').length?';':','));
      const split=(l)=>l.split(delim).map(c=>c.replace(/^"|"$/g,'').trim());
      const headers=split(lines[0]);
      const rows=lines.slice(1).map(split).filter(r=>r.some(c=>c));
      return {headers,rows,delim};
    },

    /* propone mapeo header→campo canónico por palabras clave */
    autoMap(headers){
      const map={};
      headers.forEach((h,i)=>{
        const n=norm(h); let best=null;
        Object.keys(FIELDS).forEach(f=>{ if(FIELDS[f].syn.some(s=>n.includes(s))) best=best||f; });
        if(best && !Object.values(map).includes(best)) map[i]=best;
      });
      return map; // {colIndex: field}
    },

    estadoFrom(s){ for(const [re,v] of ESTADO_MAP) if(re.test(s||'')) return v; return 'disponible'; },

    /* construye visitas candidatas a partir de rows + mapeo */
    build(parsed, map, p){
      p=p||CX.data.project();
      const col={}; Object.keys(map).forEach(i=>col[map[i]]=+i);
      const cur=(p.currency&&p.currency[p.countries[0]])||'$';
      const get=(r,f)=>col[f]!=null?r[col[f]]:'';
      return parsed.rows.map((r,idx)=>{
        const ciudadRaw=get(r,'ciudad');
        const estado=this.estadoFrom(get(r,'estado'));
        const shopper=get(r,'shopper');
        return {
          _row:idx, ref:get(r,'ref')||String(idx+1),
          sucursal:get(r,'sucursal')||('Sucursal '+(idx+1)),
          ciudad:ciudadRaw||(p.countries&&CX.paisName?CX.paisName(p.countries[0]):'')||'—',
          pais:(p.countries&&p.countries[0])||'GT',
          franja:get(r,'franja')||'',
          fecha:this._date(get(r,'fecha')),
          shopper:shopper||'', escenario:get(r,'escenario')||(p.scenarios&&p.scenarios[0])||'General',
          honorario:this._num(get(r,'honorario'))|| (p.honorario&&p.honorario[(p.countries&&p.countries[0])])||0,
          reembolso:this._num(get(r,'reembolso')),
          estado, obs:get(r,'obs')||'',
        };
      });
    },
    _num(s){ const n=parseFloat((s||'').toString().replace(/[^0-9.\-]/g,'')); return isNaN(n)?0:n; },
    _date(s){ s=(s||'').trim(); let m;
      if(m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
      if(m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)){ const y=m[3].length===2?'20'+m[3]:m[3]; return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; }
      return s||''; },

    /* detecta duplicados contra las visitas existentes del proyecto (LLAVE NATURAL estable) */
    diff(cands, p){
      p=p||CX.data.project();
      const idx=CX.dedupe?CX.dedupe.indexProject(p.id):{};
      const nuevos=[], dups=[];
      cands.forEach(c=>{ const hit=CX.dedupe&&((CX.dedupe.idKey(c)&&idx[CX.dedupe.idKey(c)])||idx[CX.dedupe.natKey(c)]); (hit?dups:nuevos).push(c); });
      return {nuevos, dups};
    },

    /* commit: crea visitas (y shoppers faltantes) en el proyecto; sincroniza */
    commit(cands, p){
      p=p||CX.data.project();
      let creadas=0, shoppersNuevos=0;
      const base=CX.data._visitas.filter(v=>v.projectId===p.id).length;
      cands.forEach((c,i)=>{
        let sh=null;
        if(c.shopper){ sh=CX.data.shoppers.find(s=>norm(s.nombre)===norm(c.shopper));
          if(!sh && CX.data.addShopper){ const parts=c.shopper.split(/\s+/); sh=CX.data.addShopper({via:'importacion',firstName:parts[0]||c.shopper,lastName:parts.slice(1).join(' '),whatsapp:'',pais:c.pais,ciudad:c.ciudad}); shoppersNuevos++; } }
        CX.data._visitas.push({
          id:p.id+'-imp'+Date.now().toString(36).slice(-4)+i, projectId:p.id, num:base+creadas+1,
          sucursal:c.sucursal, ciudad:c.ciudad, pais:c.pais, currency:(p.currency&&p.currency[c.pais])||'$',
          quincena:(p.quincenas&&p.quincenas[0])||'Quincena 1', escenario:c.escenario, franja:c.franja, franjaCode:c.franja,
          canal:(p.canales&&p.canales[0])||'—', formato:p.formato,
          honorario:c.honorario, boleto:c.reembolso||0, combo:p.combo, comboAmt:0,
          estado:c.estado, shopperId:sh?sh.id:null, shopper:sh?sh.nombre:(c.shopper||null), shopperCode:sh?sh.code:null,
          disponibleDesde:c.fecha, agendada:(c.estado==='agendada'||c.estado==='realizada')?c.fecha:null,
          realizada:(c.estado==='realizada'||c.estado==='cuestionario'||c.estado==='liquidada')?c.fecha:null,
          cuestFecha:null, submit:c.estado==='cuestionario'||c.estado==='liquidada', obs:c.obs, _imported:true,
          ref:c.ref, extId:c.ref, quincena:(p.quincenas&&p.quincenas[0])||'Quincena 1',
        });
        creadas++;
      });
      CX.bus && CX.bus.emit('visit-flow');
      return {creadas, shoppersNuevos};
    },

    /* HR de ejemplo (genérica) para demostrar el flujo */
    sample(){
      return `Fila;Fecha Prog;Sucursal;Ciudad · Franja;Shopper;Compra;Combo;Estado
33;16/06/2026;Suc. Centro Norte;Capital · WK;Ana López;APP;Combo A;Pend. realizar
37;19/06/2026;Suc. Plaza Sur;Interior · WKND;Carlos Ruiz;TAQ;Combo B;Pend. realizar
23;20/06/2026;Suc. Oriente;Capital · WKND;Shirley Díaz;WEB;Combo A;Realizada
28;20/06/2026;Suc. Poniente;Interior · WKND;;APP;Combo B;Pend. asignar`;
    },
  };
})();
