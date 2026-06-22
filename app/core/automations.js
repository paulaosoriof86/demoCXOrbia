/* ============================================================
   CXOrbia · Automatizaciones (Make) + alertas de pendientes
   - Cada evento del bus puede disparar una automatización (webhook
     Make / WhatsApp / correo). Editable y configurable por tenant.
   - Notifica al equipo TODOS los movimientos del shopper.
   - Detecta visitas atrasadas / pendientes / desactualizadas y
     genera alertas.
   Genérico/white-label. En demo "dispara" = notif + log; en
   producción = POST al webhook de Make configurado.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const LS='cx_automations', LS_HOOK='cx_make_hook', LS_LOG='cx_auto_log';

  /* catálogo por defecto de automatizaciones (todas editables/activables) */
  function defaults(){
    return [
      {id:'a_postulacion', evento:'postulacion', activa:true,  canal:'whatsapp', to:'admin', titulo:'Nueva postulación', plantilla:'{shopper} se postuló a {sucursal}'},
      {id:'a_agenda',      evento:'agenda',      activa:true,  canal:'push',     to:'admin', titulo:'Visita agendada', plantilla:'{shopper} agendó {sucursal} para {fecha}'},
      {id:'a_realizada',   evento:'realizada',   activa:true,  canal:'push',     to:'admin', titulo:'Visita realizada', plantilla:'{shopper} realizó {sucursal} · validar cuestionario'},
      {id:'a_cuestionario',evento:'cuestionario',activa:true,  canal:'push',     to:'admin', titulo:'Cuestionario enviado', plantilla:'{shopper} envió el cuestionario de {sucursal} (score {score})'},
      {id:'a_reprog',      evento:'reprog',      activa:true,  canal:'whatsapp', to:'admin', titulo:'Reprogramación solicitada', plantilla:'{shopper} pide reprogramar {sucursal}'},
      {id:'a_pago',        evento:'pago',        activa:true,  canal:'whatsapp', to:'shopper', titulo:'Pago realizado', plantilla:'Tu liquidación de {sucursal} pasó a pagada'},
      {id:'a_atraso',      evento:'atraso',      activa:true,  canal:'whatsapp', to:'admin', titulo:'Visita atrasada', plantilla:'{sucursal} sin avance · vence {fecha}'},
      {id:'a_aprobacion',  evento:'aprobacion',  activa:true,  canal:'whatsapp', to:'shopper', titulo:'Postulación aprobada', plantilla:'Tu visita a {sucursal} fue aprobada'},
      {id:'a_hr_writeback',evento:'hr_writeback', activa:true,  canal:'sheet',    to:'admin', titulo:'HR actualizada', plantilla:'{sucursal}: {shopper} · {fecha} · {estado} (sincronizado a la HR)'},
    ];
  }

  /* ---------- Proveedor de IA (configurable · por defecto Gemini económico) ---------- */
  CX.ai = {
    _cfg:null,
    defaults(){ return {provider:'gemini', model:'gemini-1.5-flash', apiKey:'', endpoint:'', activa:false, cacheTpl:true}; },
    cfg(){ if(this._cfg)return this._cfg; try{ this._cfg=Object.assign(this.defaults(), JSON.parse(localStorage.getItem('cx_ai')||'{}')); }catch(e){ this._cfg=this.defaults(); } return this._cfg; },
    save(patch){ this._cfg=Object.assign(this.cfg(), patch||{}); try{ localStorage.setItem('cx_ai', JSON.stringify(this._cfg)); }catch(e){} },
    ready(){ const c=this.cfg(); return c.activa && (c.apiKey||c.endpoint); },
    PROVIDERS:{gemini:{label:'Google Gemini', modelos:['gemini-1.5-flash','gemini-1.5-flash-8b','gemini-2.0-flash']}, openai:{label:'OpenAI', modelos:['gpt-4o-mini']}, anthropic:{label:'Anthropic', modelos:['claude-3-haiku']}, custom:{label:'Endpoint propio', modelos:['custom']}},
  };

  CX.automations = {
    CANALES:{push:'Notificación in-app', whatsapp:'WhatsApp (Make)', correo:'Correo (Make)', sheet:'Google Sheets (Make)'},
    EVENTOS:{postulacion:'Postulación creada', agenda:'Visita agendada', realizada:'Visita realizada', cuestionario:'Cuestionario enviado', reprog:'Reprogramación', pago:'Pago/liquidación', atraso:'Visita atrasada/pendiente', aprobacion:'Postulación aprobada', hr_writeback:'Escritura de vuelta a HR'},

    list(){ try{ const s=JSON.parse(localStorage.getItem(LS)||'null'); if(s&&s.length) return s; }catch(e){} return defaults(); },
    save(list){ try{ localStorage.setItem(LS, JSON.stringify(list)); }catch(e){} CX.bus&&CX.bus.emit('automations'); },
    get(id){ return this.list().find(a=>a.id===id); },
    update(id, patch){ const l=this.list(); const a=l.find(x=>x.id===id); if(a){Object.assign(a,patch); this.save(l);} return a; },
    reset(){ try{ localStorage.removeItem(LS); }catch(e){} CX.bus&&CX.bus.emit('automations'); },

    hook(){ try{ return localStorage.getItem(LS_HOOK)||''; }catch(e){ return ''; } },
    setHook(url){ try{ localStorage.setItem(LS_HOOK, url||''); }catch(e){} },

    log(){ try{ return JSON.parse(localStorage.getItem(LS_LOG)||'[]'); }catch(e){ return []; } },
    _pushLog(rec){ try{ const l=this.log(); l.unshift(rec); localStorage.setItem(LS_LOG, JSON.stringify(l.slice(0,40))); }catch(e){} },

    _fill(tpl, ctx){ return (tpl||'').replace(/\{(\w+)\}/g, (_,k)=> ctx[k]!=null?ctx[k]:''); },

    /* dispara las automatizaciones activas para un evento de negocio */
    fire(evento, ctx={}){
      this.list().filter(a=>a.activa && a.evento===evento).forEach(a=>{
        const txt=this._fill(a.plantilla, ctx);
        // notificación in-app siempre (centro de eventos)
        CX.notif && CX.notif.push({to:a.to, tipo:evento, icon:this._icon(evento), tono:this._tone(evento), titulo:a.titulo, txt, nav:this._nav(a.to,evento)});
        // canal externo vía Make (demo = log)
        if(a.canal!=='push'){
          this._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '), canal:a.canal, evento, titulo:a.titulo, txt, hook:this.hook()||'(webhook Make sin configurar)'});
        }
      });
    },
    _icon(e){ return {postulacion:'📩',agenda:'📅',realizada:'✅',cuestionario:'📝',reprog:'🔄',pago:'💰',atraso:'⏰',aprobacion:'✅',hr_writeback:'🔃'}[e]||'🔔'; },
    _tone(e){ return {postulacion:'b',agenda:'g',realizada:'b',cuestionario:'b',reprog:'a',pago:'g',atraso:'r',aprobacion:'g',hr_writeback:'b'}[e]||'b'; },
    _nav(to,e){ if(to==='shopper') return e==='pago'?'beneficios':'misvisitas'; return e==='atraso'?'visitas':'postulaciones'; },

    /* escanea visitas y detecta atrasadas / pendientes / desactualizadas */
    scanPendientes(){
      const hoy=new Date(); const out={atrasadas:[],pendientes:[],desactualizadas:[]};
      (CX.data._visitas||[]).filter(v=>v.projectId===CX.data.currentProjectId).forEach(v=>{
        const ref=v.agendada||v.disponibleDesde; const d=ref?new Date(ref+'T12:00:00'):null;
        if(['asignada','agendada'].includes(v.estado) && d && d<hoy) out.atrasadas.push(v);
        else if(v.estado==='realizada') out.pendientes.push(v);          // pend. cuestionario
        else if(v.estado==='asignada' && !v.agendada) out.desactualizadas.push(v); // sin agendar
      });
      return out;
    },
    /* genera alertas (notif) para lo atrasado/pendiente */
    notifyPendientes(){
      const s=this.scanPendientes(); let n=0;
      s.atrasadas.forEach(v=>{ this.fire('atraso',{sucursal:v.sucursal, fecha:v.agendada||v.disponibleDesde||'—', shopper:v.shopper||'sin asignar'}); n++; });
      return {alertas:n, ...s};
    },
  };
})();
