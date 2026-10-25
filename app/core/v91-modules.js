/* CXOrbia · V91 controlled module registration
   Empalme controlado de la candidata V91 sin reemplazar config.js completo.
   Registra Diagnóstico y Administrabilidad en navegación admin y mantiene
   todo preview-only, sin backend real ni providers activos. */
window.CX = window.CX || {};
(function(){
  const extra = {
    diagnostico: { icon:'🧪', label:'Diagnóstico & Readiness', roles:['admin'], status:'ready' },
    administrabilidad: { icon:'⚙️', label:'Administrabilidad', roles:['admin'], status:'ready' },
  };
  CX.MODULES = Object.assign({}, CX.MODULES || {}, extra);
  CX.MOD_CAT = Object.assign({}, CX.MOD_CAT || {}, { diagnostico:'cfg', administrabilidad:'cfg' });

  const prevModuleEnabled = CX.moduleEnabled;
  CX.moduleEnabled = function(id){
    if(id === 'diagnostico' || id === 'administrabilidad') return true;
    return typeof prevModuleEnabled === 'function' ? prevModuleEnabled(id) : true;
  };

  try{
    if(CX.NAV && Array.isArray(CX.NAV.admin)){
      const cfg = CX.NAV.admin.find(x => x && x.sec === 'Configuración');
      if(cfg && Array.isArray(cfg.items)){
        const wanted = ['config','saas','diagnostico','administrabilidad','usuarios','automatizaciones','integraciones','correo','marca'];
        cfg.items = wanted.filter((id, idx, arr) => arr.indexOf(id) === idx);
      }
    }
  }catch(e){}
})();
