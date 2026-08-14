# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 19:07 -06:00
**Estado:** `P0_SHOPPER_POSTDEPLOY_ACCEPTANCE_REJECTED__IDENTITY_CONTRACT_SPLIT_PROVEN__PREAUTH_STALE_BOOTSTRAP_PROVEN__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: 100% de calificación técnica DEV; no equivalen a aprobación funcional.
- Plataforma/hosting oficial TyA: sin reemplazar.
- Redeploy DEV del fix previo: técnicamente PASS, run `31758046539`, job `94638091029`, exactamente 1 Hosting deploy a `cxorbia-backend-dev`.
- Aceptación humana post-deploy: **RECHAZADA**. El mismo Shopper vuelve a perder identidad/histórico después de que HR viva termina de componer.
- Segundo deploy: no autorizado. Marcador one-shot consumido y deshabilitado; run de neutralización `31759552694` no ejecutó proveedor ni deploy.

## Evidencia humana post-deploy

Secuencia reproducida:

1. Firestore protegido transitorio encuentra el documento del Shopper autenticado y muestra nombre/país; visitas e histórico aparecen en cero mientras `Periodos HR` está pendiente.
2. La autoridad HR termina correctamente: fuente final `hr-live-all-periods+firestore-authenticated-exact-overlay`, 15 periodos, 660 visitas, rango 2025-06 → 2026-08.
3. Inmediatamente después, el portal muestra `La identidad de esta sesión no está vinculada al read model canónico` y el país vuelve a quedar sin asignar.
4. Antes del login, el entrypoint aún puede mostrar el snapshot empaquetado viejo de julio: 616 visitas / 210 shoppers / 42 postulaciones / periodo 2026-07.

## Causa raíz forense demostrada

### P0-A — contrato de identidad dividido

La activación Auth ejecutada en DEV (`PASS_C6_AUTH_PLAN_V4_ACTIVATION_DEV`) creó 118 usuarios y actualizó 9, llegando a 228 Auth users. Su resolver usa llaves técnicas `shopperId`, `legacyShopperId`, `legacyId`, `externalShopperId`, `externalId`, `sourceId`, `sourceKey`, `hrRowId`, `personId`, `profileId` y `shopperDocId`; los claims canónicos fijan `shopperId = profile.id` del documento Firestore.

El compositor browser `tya-cumulative-read-model-v2.js`, en cambio, acepta un conjunto menor de aliases para cruzar HR→perfil. Si el perfil protegido no es consumido por ese crosswalk, lo excluye de la lista operacional con `reason: no_exact_hr_crosswalk`. Por ello Auth puede ser correcto y el documento Firestore puede existir, mientras el mismo principal desaparece al tomar autoridad HR.

La brecha fue posible porque el bridge de perfil del 31-jul resolvió solo 120 perfiles exactos y dejó 31 holds, con `technicalBridgeResolved=0`, `authBridgeResolved=0` e `identityLinksPlanned=0`; el write posterior actualizó solo esos 120. La activación Auth del 10-ago fue Auth-only y realizó 0 Firestore writes: el crosswalk técnico más amplio que usó para activar Auth no quedó materializado para el runtime.

### P0-B — bootstrap pre-auth obsoleto en entrypoint canónico

`app/index-backend-dev.html` carga `data/tya-hr-source-safe-periods.js` y luego `core/tya-phase-a-source-safe-preview.js` antes de resolver Auth. El payload empaquetado fue generado el 13-jul y el preview adapter muta `CX.data` automáticamente en el host DEV. Esto explica la cifra vieja 616/2026-07 en el login. El entrypoint humano canónico no debe adoptar un snapshot estático como estado operacional previo a Auth.

### P0-C — cobertura de gate insuficiente

El gate anterior validó presencia de `CX.backendAuth.context()`, espera HR, evento final y un fixture sintético de alias. El visual smoke sigue entrando a roles mediante `CX.app.selectRole(...)`. No comparó el conjunto real de llaves de Auth con el conjunto de aliases runtime y no ejecutó un Shopper Firebase real de extremo a extremo. Su PASS no certificaba el universo de identidad real.

## Relación con la candidata canónica

El source lock de la candidata frontend preserva el prototipo y sus módulos. La capa Firebase Auth/claims/crosswalk fue agregada posteriormente desde backend. La regresión actual se ubica en esa integración posterior: **no demuestra que la candidata haya perdido su lógica Shopper ni autoriza reescribirla**.

## Qué NO es la causa raíz

- HR viva sí llega y conserva 15/660.
- El deploy sí fue correcto.
- Firebase Auth sí autentica.
- La corrección previa de `window.CX_BACKEND_AUTH` → `CX.backendAuth.context()` fue válida, pero parcial.
- No hay evidencia para culpar a un módulo UI específico ni corresponde unir identidades por nombre/correo.

## Seguridad

Desde la evidencia humana fallida: provider reads 0, provider writes 0, Auth/Firestore/HR/Rules/Storage writes 0, Hosting deploys adicionales 0, Make/Gemini/pagos 0, merge false, producción false.

## Siguiente bloque exacto

**Source-only, sin deploy:** consolidar un único contrato reutilizable de identidad exacta para migración/Auth/Firestore/runtime; hacer que el compositor use exactamente la misma semántica de llaves técnicas o un crosswalk canónico persistido/servido; impedir que el entrypoint humano canónico cargue el snapshot source-safe viejo como `CX.data`; y reemplazar el falso cierre de smoke por un gate que exija Auth Shopper real → perfil Firestore → crosswalk HR único → histórico. Después de demostrar PASS source-only, pedir un único gate específico para la lectura/revalidación real que haga falta y, solo después, deploy DEV.

Evidencia vigente: `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`.
