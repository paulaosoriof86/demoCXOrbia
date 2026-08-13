# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 16:59 -06:00
**Estado:** `P0_SHOPPER_SOURCE_FIX_PASS__DEV_REDEPLOY_AUTHORIZED_BUT_TOOL_BLOCKED_NOT_CONSUMED__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: 100% de calificación técnica DEV; no equivalen a aprobación funcional.
- Plataforma/hosting oficial vigente de TyA: sin reemplazar.
- Source fix Auth→HR: PASS y protegido por gate.
- Nuevo deploy DEV: autorizado por Paula, pero **no consumido** porque la capa de seguridad de la herramienta bloqueó dos intentos de actualizar el marcador one-shot antes de que la solicitud llegara a GitHub.

## P0 humano y causa raíz

Paula autenticó con un Shopper real y reprodujo dos estados incorrectos: primero datos históricos desactualizados y luego el slice Firestore transitorio `1 proyecto / 0 visitas / 1 shopper / 0 postulaciones`, seguido de `La identidad de esta sesión no está vinculada al read model canónico.`

La auditoría aisló que el portal Shopper consultaba una API Auth inexistente (`window.CX_BACKEND_AUTH`) en lugar de la API canónica `CX.backendAuth.context()`. Eso podía convertir una reconciliación HR todavía pendiente en un falso bloqueo visual. El diagnóstico DEV, además, llamaba `Proyectos` a registros que en la composición HR representan periodos.

## Reparación source-only completada

- `2da1a1571a253d2868325ee55374e0948b573ea1`: Shopper usa contexto Auth canónico y espera la autoridad HR antes de declarar no-vinculación.
- `bb6dae78e8fb79ce1995010368ceaf342e0a71e3`: panel DEV escucha el handoff final, distingue Proyecto operativo de Periodos HR y marca Firestore como slice transitorio.
- `23a708c27ef4abc4ef93d2a027f3dfd7c40b4ee8`: el visual smoke existente exige el contrato Auth → HR authority y falla si reaparece la regresión.

Workflow `CXOrbia Phase A Visual Smoke` run `31749008509`: **SUCCESS**. `p0ShopperAuthorityHandoffSource.pass=true`, identidad exacta `pass=true`, `hardFails=0`, proveedores=0, writes=0. Artifact `9200168093`, digest `sha256:cffb33d875f190b8b30e906932b9f44458ddccb5d394ba5b742913ddeb03c1ca`.

Evidencia source PASS: `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`.
Evidencia del bloqueo de herramienta: `app/docs/evidence/p0-auth-hr-dev-redeploy-tool-block-20260813.json`.

## Interpretación correcta de cifras

Cinépolis sigue siendo **un proyecto operativo configurable**. El estado HR canónico certificado contiene 15 periodos y 660 visitas hasta agosto 2026. El antiguo `14 proyectos` fue un error de rotulado del panel DEV.

## Deploy autorizado vigente

Paula autorizó un único deploy del HEAD con el fix Auth→HR a `cxorbia-backend-dev`, seguido de validación remota read-only y aceptación humana Shopper, Admin/Operaciones, Cliente y Academia. El intento de armar el request exacto no produjo commit, workflow ni deploy: la herramienta lo bloqueó antes de la mutación GitHub. Por tanto, la autorización sigue **sin consumirse** y no puede afirmarse que el Hosting contenga el nuevo fix.

## Seguridad

Desde el gate actual: cero Auth/Firestore/HR/Rules/Storage writes, cero provider reads/writes, cero Hosting deploy consumido, cero Make/Gemini/pagos, cero merge, cero producción y cero dominio oficial.

## Siguiente bloque exacto

Reanudar **el mismo único deploy autorizado** mediante el workflow existente `CXOrbia C6 DEV Root Entrypoint Hosting` únicamente cuando el marcador one-shot pueda actualizarse de forma segura. No sustituir por otro workflow/metodología ni pedir una nueva autorización mientras esta siga sin consumirse. Después del deploy: validación remota read-only y aceptación humana por roles sobre el mismo build.
