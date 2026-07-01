window.CX = window.CX || {};
(function(){
  CX.BACKEND = CX.BACKEND || {};
  const current = CX.BACKEND.collections || {};
  CX.BACKEND.collections = Object.assign({}, current, {
    automationLogs: 'automationLogs',
    integrationSettings: 'integrationSettings',
    aiSettings: 'aiSettings',
    aiLogs: 'aiLogs',
    resources: 'resources'
  });

  function loadScript(src){
    if(document.querySelector('script[src="'+src+'"]')) return;
    const s = document.createElement('script');
    s.src = src;
    s.defer = false;
    document.head.appendChild(s);
  }

  if(CX.BACKEND.previewMode){
    CX.BACKEND.defaultProjectId = CX.BACKEND.defaultProjectId || 'cinepolis-abril-26';
    CX.BACKEND.previewProjectIds = CX.BACKEND.previewProjectIds || ['cinepolis-abril-26'];
    CX.BACKEND.projectScopeMode = 'adapter-only';
    loadScript('core/backend-resources.js');
    loadScript('core/backend-ai.js');
  }
})();
