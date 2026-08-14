# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 18:42 -06:00
**Estado:** `P0_SHOPPER_SOURCE_FIX_DEPLOYED_DEV_PASS__HUMAN_ACCEPTANCE_PENDING__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: 100% de calificación técnica DEV; no equivalen a aprobación funcional.
- Plataforma/hosting oficial vigente de TyA: sin reemplazar.
- Source fix Auth→HR: PASS y protegido por gate.
- Deploy DEV del fix: COMPLETE/PASS mediante run `31758046539`, job `94638091029`, exactamente 1 deploy Hosting a `cxorbia-backend-dev`, sin segundo deploy automático.
- Paridad remota: PASS; `/` redirige 302 a `/index-backend-dev.html`, respuesta canónica 200 y contenido exacto.
- Runtime Staff/Admin read-only: PASS; 15 periodos, 660 visitas, agosto 2026 vigente, membership verificada, reloads y nueva pestaña estables.

## P0 humano y causa raíz

La aceptación humana previa reprodujo que Shopper autenticaba pero podía quedar temporalmente en el slice Firestore y después mostrar `La identidad de esta sesión no está vinculada al read model canónico.` La causa source-level fue que `app/adapters/tya-canonical-shopper-portal-v2.js` consultaba una API Auth inexistente (`window.CX_BACKEND_AUTH`) en vez de `CX.backendAuth.context()`, pudiendo tratar una reconciliación HR pendiente como bloqueo definitivo.

El diagnóstico DEV, además, llamaba `Proyectos` a registros que en la composición histórica representan periodos. Esto ya fue corregido source-only.

## Reparación y deploy

- Source fix Auth canónico + espera HR: PASS.
- Gate visual/handoff Auth→HR: run `31749008509` SUCCESS, identidad exacta PASS, handoff PASS, hard fails 0.
- Deploy DEV: run `31758046539` SUCCESS.
- Artifact deploy/runtime: `9203525557`, digest `sha256:e17b2b6060e32a9d5d464ad42729421df1d43a44ef718f6a73faae52f3c2959a`.
- Evidencia durable: `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json`.

## Seguridad

El run ejecutó 1 Hosting deploy DEV y cero Cloud Run deploys, Firestore/Auth/HR/Rules/Storage writes, cambios/reset de password, Make/Gemini/pagos, merge o producción. Credenciales y tokens no fueron expuestos.

## Siguiente bloque exacto

Aceptación humana post-deploy con el mismo Shopper real sobre `https://cxorbia-backend-dev.web.app`, verificando identidad, país, histórico, Visitas Disponibles, Reservas & Asignación, Mis Visitas, Academia/Certificación y beneficios. Después, regresión dirigida Admin/Operaciones, Cliente y Academia sobre el mismo build. No reabrir identidades ni HR salvo nueva evidencia reproducible. Cutover real continúa bloqueado hasta cerrar aceptación humana.