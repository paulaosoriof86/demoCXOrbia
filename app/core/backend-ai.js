window.CX = window.CX || {};
(function(){
  const cfg=CX.BACKEND||{},col=cfg.collections||{};let loaded=false;
  const str=v=>String(v==null?'':v).trim();
  function db(){return window.firebase&&firebase.apps&&firebase.apps.length?firebase.firestore():null;}
  function tenantId(){return typeof cfg.tenantId==='function'?cfg.tenantId():str(cfg.tenantId||'tya');}
  function projectId(){try{return str(CX.data?.currentProjectId||CX.data?.ctx?.().projectId||CX.session?.user?.scopeProjectId);}catch(_){return str(CX.data?.currentProjectId);}}
  function tenantRef(){const d=db();return d?d.collection(col.tenants||'tenants').doc(tenantId()):null;}
  function settingsCol(){const t=tenantRef();return t?t.collection(col.aiSettings||'aiSettings'):null;}
  function sanitize(item){const out=Object.assign({},item||{});['apiKey','key','token','secret','credential'].forEach(k=>delete out[k]);return out;}
  async function load(){
    if(!cfg.enabled||!cfg.previewMode||!CX.ai)return null;
    const c=settingsCol();if(!c)return null;
    const snap=await c.where('status','==','active').get(),pid=projectId();
    const rows=snap.docs.map(d=>sanitize({id:d.id,...(d.data()||{})})).filter(x=>x.serverProxy===true&&(!Array.isArray(x.projectIds)||!x.projectIds.length||x.projectIds.map(String).includes(pid)));
    const data=rows[0]||null;
    if(!data){CX.ai.__backendCfg=null;window.CX_BACKEND_AI_STATUS={source:'firestore',configured:false,serverProxy:false,tenantId:tenantId(),projectId:pid,at:new Date().toISOString()};return window.CX_BACKEND_AI_STATUS;}
    CX.ai.__backendCfg=data;loaded=true;
    window.CX_BACKEND_AI_STATUS={source:'firestore',configured:true,serverProxy:true,provider:data.provider||'',model:data.model||'',tenantId:tenantId(),projectId:pid,at:new Date().toISOString()};
    CX.bus?.emit?.('ai-settings',window.CX_BACKEND_AI_STATUS);return window.CX_BACKEND_AI_STATUS;
  }
  function patch(){
    if(!CX.ai||CX.ai.__backendAiWrapped)return;
    const originalCfg=CX.ai.cfg,originalAsk=CX.ai.ask;
    CX.ai.cfg=function(){return Object.assign({},originalCfg?originalCfg.call(this):{},this.__backendCfg||{});};
    CX.ai.available=function(){return !!(this.__backendCfg&&this.__backendCfg.status==='active'&&this.__backendCfg.serverProxy===true);};
    CX.ai.ready=function(){return this.available();};
    CX.ai.ask=async function(prompt,opts={}){
      if(str(opts.module)!=='certification')return originalAsk?originalAsk.call(this,prompt,opts):Promise.reject(new Error('AI_USE_CASE_NOT_ENABLED'));
      if(!this.available())await load();
      if(!this.available())throw new Error('AI_PROVIDER_NOT_CONFIGURED');
      if(!CX.backendCertifications?.generateBank)throw new Error('AI_SECURE_PROXY_UNAVAILABLE');
      return CX.backendCertifications.generateBank({sourceText:str(prompt),questionCount:Number(opts.questionCount||10),gate:Number(opts.gate||80)});
    };
    CX.ai.__backendAiWrapped=true;
  }
  function start(){
    if(!cfg.previewMode)return;patch();
    CX.bus?.on?.('backend-ready',()=>load().catch(e=>console.warn('[CX.backend-ai]',e)));
    CX.bus?.on?.('backend-auth-ready',()=>setTimeout(()=>load().catch(()=>{}),600));
    setTimeout(()=>{if(!loaded)load().catch(()=>{});},1800);
  }
  CX.backendAI={load};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();