/* ============================================================
   CXOrbia · Protected DEV auth session continuity
   ------------------------------------------------------------
   P0 visual root fix: protected human validation must not ask
   for credentials again on every refresh/redeploy.

   Scope:
   - DEV protected runtime only;
   - keeps Firebase Auth as the real authority;
   - coerces browser persistence from SESSION to LOCAL;
   - does not embed credentials, tokens, passwords or UIDs;
   - does not bypass claims/Rules or Firestore authorization;
   - explicit product logout still signs out through the normal
     backend-browser-auth flow, so changing account remains real.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const params = new URLSearchParams(window.location.search || '');
  const TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  if(params.get('cxProtectedRuntime') !== TOKEN) return;

  function patchPersistence(){
    if(!window.firebase || !firebase.auth || !firebase.apps || !firebase.apps.length) return false;
    const auth = typeof firebase.app().auth === 'function' ? firebase.app().auth() : firebase.auth();
    if(!auth || auth.__cxProtectedLocalPersistencePatched) return !!auth;

    const originalSetPersistence = auth.setPersistence.bind(auth);
    auth.setPersistence = function(mode){
      const sessionMode = firebase.auth.Auth && firebase.auth.Auth.Persistence
        ? firebase.auth.Auth.Persistence.SESSION
        : null;
      const localMode = firebase.auth.Auth && firebase.auth.Auth.Persistence
        ? firebase.auth.Auth.Persistence.LOCAL
        : mode;
      if(mode === sessionMode) return originalSetPersistence(localMode);
      return originalSetPersistence(mode);
    };
    auth.__cxProtectedLocalPersistencePatched = true;

    // Set the desired persistence immediately. If browser-auth later requests
    // SESSION, the wrapper above keeps LOCAL in this protected DEV lane.
    if(firebase.auth.Auth && firebase.auth.Auth.Persistence){
      originalSetPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(e){
        console.warn('[CX.protected-session] No fue posible fijar persistencia LOCAL', e && e.message ? e.message : e);
      });
    }

    window.CX_PROTECTED_DEV_SESSION_CONTINUITY = {
      enabled:true,
      protectedRuntime:true,
      firebaseAuthAuthorityPreserved:true,
      persistence:'local',
      credentialsEmbedded:false,
      claimsBypass:false,
      rulesBypass:false,
      writes:false,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  if(!patchPersistence()){
    document.addEventListener('DOMContentLoaded', patchPersistence, {once:true});
  }
})();
