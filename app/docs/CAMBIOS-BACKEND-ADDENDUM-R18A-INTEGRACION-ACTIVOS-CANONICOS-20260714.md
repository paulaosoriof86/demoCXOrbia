# CAMBIOS BACKEND — R18A INTEGRACIÓN DE ACTIVOS CANÓNICOS EXISTENTES

Fecha: 2026-07-14  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## Objetivo

Corregir la ruta build-only R17 sin reconstruir trabajo ya hecho. R18A reutiliza el builder HR existente y le aplica, antes del adapter visible, las semánticas ya definidas por importadores, máquina de estados, domain mapping y reviewQueue.

## Archivos creados

- `tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs`
- `tools/release/tya-source-safe-binding-build-r18a.mjs`
- `tools/qa/tya-r18a-canonical-assets-integration-validate.mjs`
- `.github/workflows/cxorbia-phase-a-r18a-canonical-assets-integration.yml`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-R18A-INTEGRACION-ACTIVOS-CANONICOS-20260714.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-R18A-INTEGRACION-ACTIVOS-CANONICOS-20260714.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-R18A-INTEGRACION-ACTIVOS-CANONICOS-20260714.md`
- `app/docs/ACADEMIA-IMPACT-R18A-INTEGRACION-ACTIVOS-CANONICOS-20260714.md`

## Archivos actualizados

- `app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md`
- `backend/contracts/phase-a-live-execution-checkpoint-v1.json`
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`

## Qué se integró

1. El payload producido por `tya-build-live-hr-source-safe-static.mjs` sigue siendo la entrada; no se creó otra lectura HR.
2. Fechas Excel/ISO se normalizan a `YYYY-MM-DD` con la misma semántica de los importadores source-safe.
3. Fechas ambiguas o no reconocidas quedan nulas y generan ítem de `reviewQueue`; no se publican seriales crudos como fechas.
4. Cada visita recibe estados separados:
   - `operationalState`;
   - `questionnaireState`;
   - `submissionState`;
   - `liquidationState`;
   - `paymentState`.
5. Submitido genera `submitted_by_tya` y, como máximo, `liquidation_candidate`; nunca `liquidada` o `pagada` sin cruce financiero.
6. Se agregan `sourceSnapshotAt`, `sourceReadMode` y `runtimeSyncActive=false`.
7. Shoppers source-safe quedan como `protected_reference`, sin rating, estado activo, completitud, preferencia u honorario inventados.
8. El nuevo adapter build-only mantiene compatibilidad con `CX.data`, conserva un alias temporal de periodo para V110 y expone un setter canónico para la candidata V111.
9. El copy técnico del adapter dice snapshot source-safe, no sincronización runtime.

## Lo que no se recalculó

- R11/R11B/R11C/R11D.
- Reconciliación shopper 210/213/215.
- R14/R14C.
- Los 196 enlaces financieros exactos.
- Los 51 casos financieros en revisión.
- Certificaciones carryover.
- Importadores de pagos/certificaciones.

R18A solo deja puntos de integración para aplicar esos resultados existentes en R18B.

## Verificación local aislada

- `node --check` PASS para los tres scripts.
- Self-test sintético PASS.
- Serial Excel `45851.0` normalizado a `2025-07-13`.
- Submitido separado de liquidación/pago PASS.
- Adapter generado e inyectado en una copia mínima de `index.html` PASS.
- Cero `rating: 4.3` y cero fallback shopper `Activo` en el adapter nuevo.

La verificación provider/live queda a cargo del workflow R18A en GitHub Actions.

## Impacto Phase A

Desbloquea la capa semántica entre HR source-safe y `CX.data` sin esperar la entrega V111. Reduce cuatro causas del NO-GO R17: seriales de fecha, submitido/liquidada, atributos shopper inventados y claim de HR runtime.

No resuelve todavía:

- periodo único visible;
- Mi Día;
- login/branding/alcance;
- lectura runtime;
- aplicación de overlays R11D/R14C/certificaciones;
- Firebase nuevo y vacío.

## Seguridad

- Sin cambios en `/app/modules` o `/app/core`.
- Sin writes Firestore/Auth/Storage/HR.
- Sin import real.
- Sin deploy.
- Sin producción.
- Sin Make/Gemini/pagos.
- Sin PII.
