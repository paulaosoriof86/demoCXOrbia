# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 13:29 -06:00
**Estado:** `P0_HUMAN_SHOPPER_OPEN__READONLY_ATTEMPT_CONSUMED_FAILED__STOP_RETRY__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Build técnico calificado `ecc725866acc3eb8`.
- M1–M10: 100% de calificación técnica DEV, no aprobación funcional.
- Laboratorio DEV visible publicado en `/dev-validation/index.html`.
- Plataforma/hosting real vigente de TyA: sin reemplazar.

## P0 vigente

Paula autenticó con un Shopper real, pero `Mi Perfil` quedó separado del read model canónico y la vista permaneció Firestore-only con cero visitas, pese a que el laboratorio read-only leyó la HR viva completa. Aceptación humana: **RECHAZADA**.

Evidencia primaria: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

## Bloque read-only autorizado — cerrado con fallo

Request `p0-human-shopper-auth-hr-readonly-20260813-01` ejecutó run `31735473752`, job `94565926738`. La etapa de inspección falló y no persistió artifact ni diagnóstico sanitizado. El error específico no está disponible por el conector, por lo que la causa raíz no se declara.

El único intento se considera consumido y se aplicó `STOP_RETRY`. El request quedó deshabilitado en `97e8f25a9119e0a67252dd6e568d8afc7c0a533c`. La verificación `31735810704` confirmó que la inspección de proveedor quedó `SKIPPED`, sin segundo intento. El runner histórico fue restaurado y los archivos preliminares no usados fueron retirados.

Evidencia del cierre seguro: `app/docs/evidence/p0-human-shopper-readonly-run-failure-31735473752.json`.

## Pendiente real

Siguen sin demostrarse el principal exacto Shopper, su enlace técnico HR/read-model, el fallo concreto del bridge y el usuario visible del Admin B. No se adivinan. Una segunda lectura de proveedor exige autorización explícita nueva.

## Siguiente bloque exacto

Preparar primero, source-only, un mecanismo diagnóstico que capture evidencia aun cuando falle y separe la recuperación offline del usuario Admin B de la lectura Shopper. Solo después puede solicitarse un nuevo gate focal si sigue siendo necesaria otra lectura.

## Seguridad

Cero writes de datos, cero cambios de contraseña, cero deploy, cero Make/Gemini/pagos, cero merge y cero producción.
