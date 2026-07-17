/* ============================================================
   CXOrbia · Session + event bus + persistence
   ============================================================ */
window.CX = window.CX || {};

/* ---------- Event bus ---------- */
CX.bus = (function(){
  const map={};
  return {
    on(ev,fn){(map[ev]=map[ev]||[]).push(fn);},
    emit(ev,data){(map[ev]||[]).forEach(fn=>{try{fn(data);}catch(e){console.warn(e);}});},
  };
})();

/* ---------- Session ---------- */
CX.session = {
  role:null,            // 'admin' | 'shopper'
  user:null,            // {name, role, shopperId}
  view:null,            // active module id
  testRole:null,        // rol técnico bajo prueba cuando la UI usa el shell admin (ops/coordinador/aliado/custom)
  /* ---- P0-1 (V94 reauditoría): rol/persona EFECTIVOS para permisos de datos protegidos.
     CX.session.role puede ser 'admin' aunque el usuario real sea coordinador/aliado/ops
     (usan el shell admin) — nunca usar session.role a secas para decidir acceso a datos
     sensibles. Usar SIEMPRE CX.session.effectiveRole()/effectivePersona(). */
  effectiveRole(){ return this.testRole || (this.user&&this.user.role) || this.role; },
  effectivePersona(){ return (this.user&&this.user.persona) || null; },
  /* true solo si el rol efectivo puede ver datos protegidos en claro (DPI/banco/WhatsApp/correo).
     super/admin técnico real → sí. Cualquier rol de prueba/scope (ops/coordinador/aliado/
     personalizado) o portal cliente/shopper → no, aunque naveguen con el shell admin. */
  canSeeProtectedData(){
    const r = this.effectiveRole();
    return (r==='super'||r==='admin') && !this.testRole;
  },
  /* P0-2 (paquete V153 dos P0 reales, 20260716): un parámetro de URL nunca es una protección —
     cualquier admin comercial podía añadir ?internal=1 y abrir contenido técnico. El build
     comercial de este prototipo NO expone ningún mecanismo de UI/URL para activar detalle
     técnico: hasTechAccess() es una constante de build, false aquí siempre. Una build interna
     para el equipo técnico cambiaría esta única línea (nunca una URL/flag del lado del cliente
     alcanzable por un usuario comercial). */
  hasTechAccess(){ return false; },
  load(){
    try{
      const s=JSON.parse(localStorage.getItem('cx_session')||'null');
      if(s){this.role=s.role;this.user=s.user;this.view=s.view;this.testRole=s.testRole||null;}
    }catch(e){}
    try{
      const pid=localStorage.getItem('cx_project');
      /* GAP1 (V113→V114): restauración vía setProject(), no escritura directa de currentPeriodId
         (mutador único en core/data.js, sincroniza currentProjectId también). */
      if(pid&&CX.data.projects.some(p=>p.id===pid))CX.data.setProject(pid);
    }catch(e){}
  },
  save(){
    try{localStorage.setItem('cx_session',JSON.stringify({role:this.role,user:this.user,view:this.view,testRole:this.testRole}));}catch(e){}
    try{localStorage.setItem('cx_project',CX.data.currentPeriodId);}catch(e){}
  },
  clear(){ this.role=null;this.user=null;this.view=null;this.testRole=null; try{localStorage.removeItem('cx_session');}catch(e){} },
};

/* persist project changes */
CX.bus.on('project',()=>CX.session.save());
