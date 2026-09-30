/* CXOrbia · DEV local Auth override placeholder
   Repo-safe and fail-closed: no credentials, tokens, UID, email mapping or provider configuration.
   The canonical visible login and Firebase Auth bridge remain in core/backend-browser-auth.js. */
window.CX = window.CX || {};
window.CX.BACKEND_DEV_AUTH_LOCAL = Object.freeze({
  enabled: false,
  source: 'repo-safe-placeholder',
  containsSecrets: false,
  overridesCanonicalAuth: false
});
