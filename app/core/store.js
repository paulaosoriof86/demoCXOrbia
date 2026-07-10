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
  load(){
    try{
      const s=JSON.parse(localStorage.getItem('cx_session')||'null');
      if(s){this.role=s.role;this.user=s.user;this.view=s.view;this.testRole=s.testRole||null;}
    }catch(e){}
    try{
      const pid=localStorage.getItem('cx_project');
      if(pid&&CX.data.projects.some(p=>p.id===pid))CX.data.currentProjectId=pid;
    }catch(e){}
  },
  save(){
    try{localStorage.setItem('cx_session',JSON.stringify({role:this.role,user:this.user,view:this.view,testRole:this.testRole}));}catch(e){}
    try{localStorage.setItem('cx_project',CX.data.currentProjectId);}catch(e){}
  },
  clear(){ this.role=null;this.user=null;this.view=null;this.testRole=null; try{localStorage.removeItem('cx_session');}catch(e){} },
};

/* persist project changes */
CX.bus.on('project',()=>CX.session.save());
