# CAMBIOS-BACKEND.md

## 2026-07-30 — Single-login publicado en Hosting DEV; precheck + deploy1 + smoke remoto PASS

Estado: `C6_SINGLE_LOGIN_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`.

### Ejecución autorizada y consumida
- Autorización: un único redeploy focalizado del single-login corregido sobre el mismo Hosting DEV `cxorbia-backend-dev/cxorbia-dev`.
- Request: `corte6-single-login-redeploy-20260730-02`.
- Resultado: `PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED`.
- Versión: `sites/cxorbia-backend-dev/versions/a4b90bd224b28329`.
- Release: `sites/cxorbia-backend-dev/releases/1785448336285000`.
- Smoke remoto: browserAuth PASS, entrypoint PASS, proof PASS, username/password namespaced PASS, `singleVisibleLogin=true`, `parallelAuthGate=false`.
- Identidades legacy preservadas:91.

### Seguridad
- nuevo Firebase0; nuevo Hosting0;
- Auth writes durante Hosting0;
- Firestore data writes0;
- Rules0; Storage0; HR0; legacy0; pagos0; Functions0;
- Make/Gemini0; merge=false; producción=false;
- PII/secrets exportados0.

### Documentación
- Evidencia: `app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`.
- Resultado: `app/docs/CORTE6-SINGLE-LOGIN-HOSTING-DEV-REMOTE-PASS-20260730.md`.
- Academia: `app/docs/ACADEMIA-IMPACTO-CORTE6-SINGLE-LOGIN-REMOTE-PASS-20260730.md`.

### Clasificación
- **Reusable CXOrbia:** single-login, sesión restaurable, logout real y Auth/claims detrás del producto.
- **Exclusivo cliente:** continuidad de credenciales TyA ya migradas.
- **Claude/prototipo:** no requiere nueva candidata ni cambios `app/modules/*`; preservar el patrón y no reintroducir gate paralelo.
- **Academia:** acceso único, recuperación, scopes, sesión y troubleshooting.
- **Sin impacto Claude:** Auth91/91, Rules, R17N, Corte5 y Corte3 permanecen cerrados.

### Siguiente gate
`VALIDACIÓN VISUAL HUMANA EN HOSTING DEV → SI APRUEBA: FREEZE CORTE6 → REFRESH HR → RESOLVER AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

---

## 2026-07-30 — P0 doble login corregido en rama; gate estático PASS; redeploy DEV no autorizado todavía

Estado histórico: `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`.

### Qué se corrigió
- `app/core/backend-browser-auth.js`: eliminado el overlay/pantalla backend `Acceso seguro`; Firebase Auth permanece detrás del adapter.
- El login normal del tenant/proyecto vuelve a ser el único punto visible.
- Si no existe sesión Firebase, `Usuario + Contraseña` se solicitan dentro de la misma tarjeta del login normal, no en una pantalla previa.
- Una sesión Firebase válida se restaura silenciosamente con persistencia de sesión.
- Logout invalida Firebase + CX session; refresh no limpia la sesión por rutina.
- Se mantienen namespaces `staff` / `shopper`, identidad Firebase interna determinística y fail-closed por rol/scope.
- `app/core/backend-config-preview-dev.js`: modo cambiado de `interactive-session` a `product-login-session`.
- `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs` y `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`: actualizados para bloquear regresión del gate paralelo y verificar single-login antes/después del futuro redeploy.

### Evidencia Git
- fix principal: `e95e8a9662373183ec17186831cf81b89094515a`.
- config single-login: `32aee807d4c48760679267e1f8cd577d4681f4ea`.
- preflight Hosting: `f3aa90cc0f765beafdfa90e5b55d953239488746`.
- workflow/gates: `e0b98140744135361f0d1d000ce31435b7ea59d2`.
- solicitud de revalidación estática sin provider writes: `790d4d514b8e7b4630063ebf2aebba5997e3ec26`.

### Gate ejecutado
Commit `790d4d...` obtuvo estado GitHub `success` en `cxorbia/corte6-credential-continuity-hosting/PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

El workflow ejecutó únicamente gate de request + checks estáticos. La autorización anterior permanecía consumida; por tanto no cargó service account, no construyó paquete provider, no desplegó Hosting y no ejecutó provider writes.

### Qué NO se reabre
- Auth import/readback91/91.
- hashes/passwords legacy.
- claims/Rules ya validados.
- R17N 1,406/1,406 históricos.
- Corte5 CX.data.
- Corte3 frozen.

### Clasificación
- **Reusable CXOrbia:** Auth detrás del único login del producto; sesión restaurable; logout real; namespace interno.
- **Exclusivo cliente:** credenciales legacy TyA.
- **Claude/prototipo:** no requiere nueva candidata; el P0 ya fue corregido focalizadamente en el punto autorizado de integración.
- **Academia:** actualizar a flujo único de acceso y troubleshooting.
- **Sin impacto Claude:** Auth91/91, Rules, histórico y CX.data permanecen cerrados.

---

## 2026-07-30 — P0 visual reproducible: doble login Auth DEV

Estado histórico: `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`.

### Qué se comprobó
- La captura de Paula muestra un gate separado `Acceso seguro` antes del login normal del proyecto.
- `app/core/backend-browser-auth.js` creaba el overlay, interceptaba `CX.app.showLogin()`, limpiaba `CX.session` al cargar y forzaba el gate en preview.
- `app/core/backend-config-preview-dev.js` configuraba `interactive-session` sin fallback.
- `app/core/backend-firebase.js` exige la autenticación antes de cargar el backend.
- `app/app.js` conserva el login normal tenant-aware.

### Causa raíz
La corrección de continuidad de credenciales preservó Firebase/Auth y `Usuario + Contraseña`, pero implementó Auth como **segunda pantalla visible**. Eso contradice el objetivo aprobado: Firebase debe quedar detrás del adapter y el producto debe presentar un único flujo de acceso.

### Decisión histórica
- Visual: **NO APROBADO / P0_PROVEN**.
- No pedir a Paula otra prueba del gate viejo, password ni PowerShell.
- No reabrir Auth91/91, claims, Rules, R17N, Corte5 ni Corte3.

### Documentación
- `app/docs/CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

---

## 2026-07-30 — Corte 6 continuidad de credenciales: Auth91/91 PASS + Hosting DEV remoto PASS previo; visual posterior rechazó doble login

Estado histórico previo: `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`.

### Qué se ejecutó con autorización expresa de Paula
1. Se importaron **91** identidades legacy elegibles a Firebase Auth en `cxorbia-backend-dev`.
2. `PASS_EXACT_AUTH_IMPORT_READBACK`: imported91; readback91/91; Auth17→108; shopper88 + super1 + coordinador2; resets0; deletes0; overwrite0.
3. Después se ejecutó el único redeploy entonces autorizado al Hosting DEV existente.
4. El smoke remoto técnico pasó, pero la validación humana posterior detectó el P0 de doble login y ese build no quedó aprobado visualmente.

### Evidencia histórica
- Auth evidence: `bd3a479dd455459f0daa4757c8380b0e60aa0693`.
- Hosting evidence: `c3a2c8476e7a91734201600a68e7577b53902f9a`.
- version `sites/cxorbia-backend-dev/versions/b1bad07277f7e961`.
- release `sites/cxorbia-backend-dev/releases/1785442623153000`.

### HOLD preservado
- 21 shopper credentials sin perfil canónico exacto.
- demo role1.
- ambiguous groups18 / records77.
- No resolver por nombre/coincidencia visual.

### Baseline preservada
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N 1,406/1,406; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `2026-07`, source=firestore/fallback=false.

---

## Histórico protegido
Los bloques previos permanecen en Git y en `app/docs/`. No reabrir Corte3, no repetir R17N y no crear nueva candidata/base/Hosting/rama/PR por rutina.
