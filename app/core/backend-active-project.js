/* CXOrbia · Scope de proyecto activo desactivado temporalmente.
   Motivo: evitar doble render/flicker en preview backend.
   La segmentacion correcta debe quedar dentro del adapter Firestore,
   antes de exponer datos a CX.data, no como render posterior. */
window.CX = window.CX || {};
(function(){
  if(!CX.BACKEND || CX.BACKEND.previewMode !== true) return;
  CX.BACKEND.projectScopeMode = 'adapter-only';
  window.CX_BACKEND_PROJECT_SCOPE = {
    mode:'disabled-render-hook',
    reason:'scope-must-run-inside-adapter-before-ui-render',
    at:new Date().toISOString()
  };
})();
