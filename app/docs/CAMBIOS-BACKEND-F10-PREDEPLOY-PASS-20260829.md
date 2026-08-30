# CAMBIOS BACKEND — F10 PREDEPLOY PASS — 2026-08-29

## Estado

F10 cerró el gate predeploy exact-source/browser + module-matrix con `PASS_F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_APPROVED_MODULE_MATRIX`.

El sucesor funcional permanece `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`, archivo único `app/adapters/tya-canonical-state-semantics-v2.js`, blob `941051c96a26017363acfc72f7e88edbe70c68ba`, SHA-256 `e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e`.

El browser gate reprodujo sobre las 44 filas sanitizadas de agosto la evidencia operacional fresca: 30 realizadas, 14 pendientes de realizar, 4 cuestionarios pendientes, 4 sin agendar, 30 candidatas a liquidación y 0 liquidaciones/pagos confirmados. Conservó por separado `canonicalLifecycleRealized=31`, demostrando que la separación lifecycle/evidencia funciona.

La matriz aprobada mantiene 26 módulos Phase A + 10 soporte + 5 post-Phase-A cargados con 0 mismatches. Entre el commit funcional F10 y el HEAD del gate no hubo cambios en `app/modules/**`, `app/core/**`, `app/app.js`, entrypoint ni el adapter F10.

## Mecanismo de deploy

La autorización de Paula para el deploy focal Hosting DEV está vigente y la condición predeploy ya se cumplió. No obstante, el deploy todavía no se ejecutó porque no existe un carril Hosting DEV actual compatible con F10: el workflow que produjo el release congelado era F4 single-use y hoy está consumido/inertizado; los restantes workflows de mutación Hosting están ligados a autorizaciones C6 históricas o invariantes antiguas.

Queda prohibido reutilizar una autoridad consumida o falsear un contrato histórico. El siguiente bloque es habilitar expresamente un único carril existente como one-shot F10 Hosting DEV; después ejecutar deploy focal y, de inmediato, una nueva lectura HR `fresh=1` seguida de validación live same-revision.

## Clasificación

- Reusable CXOrbia: gate browser exact-source y protección contra replay de mutation lanes consumidos.
- Exclusivo cliente: evidencia TyA/Cinépolis agosto 2026 y sus conteos frescos.
- Claude/prototipo: módulos aprobados HARD PRESERVE; no tocar frontend por este incidente.
- Academia: sin cambio hasta aceptación visual posterior al deploy.
- Sin impacto Claude: control-plane, evidencia, hashes y autorización de carril.

## Seguridad

Hosting deploys=0; Cloud Run deploys=0; Auth/Firestore/HR/Storage/Rules/pagos writes=0; Make/Gemini=0; merge=false; producción=false; nueva rama/PR/workflow=false.
