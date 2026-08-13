# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 16:15 -06:00
**Estado:** `P0_SHOPPER_SOURCE_FIX_PASS__DEV_REDEPLOY_REQUIRED__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: 100% de calificación técnica DEV; no equivalen a aprobación funcional.
- Plataforma/hosting oficial vigente de TyA: sin reemplazar.
- Último deploy DEV visible anterior al fix actual: ya consumido; el nuevo source fix todavía no está publicado en Hosting DEV.

## P0 humano y causa raíz

Paula autenticó con un Shopper real y reprodujo dos estados incorrectos: primero datos históricos desactualizados y luego el slice Firestore transitorio `1 proyecto / 0 visitas / 1 shopper / 0 postulaciones`, seguido de `La identidad de esta sesión no está vinculada al read model canónico.`

La auditoría aisló que el portal Shopper consultaba una API Auth inexistente (`window.CX_BACKEND_AUTH`) en lugar de la API canónica `CX.backendAuth.context()`. Eso podía convertir una reconciliación HR todavía pendiente en un falso bloqueo visual. El diagnóstico DEV, además, llamaba `Proyectos` a registros que en la composición HR representan periodos.

## Reparación source-only completada

- `2da1a1571a253d2868325ee55374e0948b573ea1`: Shopper usa contexto Auth canónico y espera la autoridad HR antes de declarar no-vinculación.
- `bb6dae78e8fb79ce1995010368ceaf342e0a71e3`: panel DEV escucha el handoff final, distingue Proyecto operativo de Periodos HR y marca Firestore como slice transitorio.
- `23a708c27ef4abc4ef93d2a027f3dfd7c40b4ee8`: el visual smoke existente ahora exige el contrato Auth → HR authority y falla si reaparece la regresión.

Workflow `CXOrbia Phase A Visual Smoke` run `31749008509`: **SUCCESS**. Nuevo gate `p0ShopperAuthorityHandoffSource.pass=true`, gate de identidad exacta `pass=true`, `hardFails=0`, proveedores=0, writes=0. Artifact `9200168093`, digest `sha256:cffb33d875f190b8b30e906932b9f44458ddccb5d394ba5b742913ddeb03c1ca`.

Evidencia durable: `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`.

## Interpretación correcta de cifras

Cinépolis sigue siendo **un proyecto operativo configurable**. En la composición histórica `CX.data.projects` contiene registros de periodo para compatibilidad con la interfaz existente; por eso el viejo panel podía mostrar `14 proyectos`. El estado HR canónico certificado antes del hallazgo contiene 15 periodos y 660 visitas, hasta agosto 2026.

## Pendiente real

El source fix ya pasó. Falta publicarlo en `cxorbia-backend-dev` y repetir validación humana real: Shopper primero; después Admin/Operaciones/Cliente/Academia sobre la misma fuente final. No se reabren las identidades ni se reimporta HR salvo nueva evidencia reproducible.

## Seguridad

Este bloque fue source-only. Cero Auth/Firestore/HR/Rules/Storage writes, cero proveedor, cero deploy, cero Make/Gemini/pagos, cero merge y cero producción.

## Siguiente bloque exacto

Un único deploy del HEAD vigente al Hosting DEV `cxorbia-backend-dev`, seguido de validación remota read-only y aceptación humana por roles. Requiere gate específico de deploy porque el deploy anterior ya fue consumido.
