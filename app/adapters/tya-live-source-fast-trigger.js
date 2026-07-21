/* Build overlay: prompt the existing read-only live HR watcher. */
(function(){
  if(window.CX_TYA_LIVE_FAST_TRIGGER)return;
  window.CX_TYA_LIVE_FAST_TRIGGER=true;
  const run=()=>{if(typeof window.CX_TYA_CHECK_LIVE_SOURCE==='function')window.CX_TYA_CHECK_LIVE_SOURCE('fast_refresh');};
  window.addEventListener('load',()=>setTimeout(run,500),{once:true});
  window.addEventListener('pageshow',()=>setTimeout(run,200));
  window.setInterval(run,15000);
})();
