# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`

## Estado

**Score formal: 85% / 15% pendiente.** I1–I4 están `PASS/FROZEN`; I5 preproducción/go-live está abierto. Este porcentaje no autoriza producción.

## No reabrir

Auth, Shopper, Finance V2/historical, multi-proyecto/no-code, documentos, reservas, certificaciones y Academia no se reconstruyen por defecto. No nueva candidata, rama, PR o metodología.

## Cerrado en I4

- single-authority runtime source + remote materialization;
- Hosting DEV exacto one-shot de `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- Staff/Admin provider-backed read-only PASS;
- Shopper histórico real PASS reutilizado sin reproceso/reset;
- Finanzas same-build equivalentes: Mayo 44/44; Junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`;
- requests one-shot consumidos/deshabilitados;
- Academia alineada documentalmente sin reconstrucción.

## Pendiente activo inmediato

`I5_1_PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY`:

1. matriz de regresión transversal sobre la misma build;
2. scopes/RBAC y aislamiento tenant/proyecto;
3. seguridad, datos sensibles, secretos y exposición PII;
4. rollback/checkpoint y recuperación;
5. criterios UAT por Admin, Operativo, Shopper, Cliente y Academia;
6. separar workflows vigentes de validators/workflows legacy o stale;
7. preparar gate exacto de PREPROD, sin ejecutar deploy;
8. solicitar autorización solo cuando corresponda deploy PREPROD o PRODUCCIÓN.

## Pendientes frontend separados

- No existe P0 frontend nuevo derivado de I4.
- `modules/cliente-extra.js` / exports PDF-XLSX-PPTX permanece como hallazgo separado a clasificar contra alcance I5/UAT; no se modifica sin evidencia reproducible y prioridad real.
- Cualquier diferencia visual futura debe localizarse por archivo/módulo y demostrar que no proviene de Auth/datos/runtime antes de tocar prototipo.

## Academia

Alineación I4 registrada en `app/docs/ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`. En I5 solo quedan validación UAT, notificación/versionado si hay cambio real y actualización final de manuales/cursos si PREPROD demuestra una diferencia.

## Seguridad

I4 consumió 1 Hosting DEV autorizado. Pendiente I5.1: 0 deploy, 0 merge, 0 producción, 0 provider/data/HR/Auth/Storage writes, 0 Make/Gemini y 0 ejecución bancaria.
