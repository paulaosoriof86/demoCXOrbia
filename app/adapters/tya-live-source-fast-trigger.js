/* Build overlay: one prompt on load/pageshow only.
   Polling is owned exclusively by tya-live-source-refresh-watch.js. */
(function(){
  if(window.CX_TYA_LIVE_FAST_TRIGGER)return;
  window.CX_TYA_LIVE_FAST_TRIGGER=true;
  const run=()=>{if(typeof window.CX_TYA_CHECK_LIVE_SOURCE==='function')window.CX_TYA_CHECK_LIVE_SOURCE('fast_refresh');};
  window.addEventListener('load',()=>setTimeout(run,700),{once:true});
  window.addEventListener('pageshow',()=>setTimeout(run,250));
})();
