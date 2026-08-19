# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23`  
**Estado:** `ACTIVO__I3_FROZEN__I4A_VISIBLE_LIFECYCLE_CORRECTIVE_CONTINUATION`

## 1. Estado formal
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15` = **60% / 40%**.

## 2. Frozen/no reprocess
I1/I2/I3; Historical Shopper; TARGET_B Admin; HR 15/660; Finance V2/historical; legal V0.4; identidad test dedicada ya materializada.

## 3. I4-A — evidencia acumulada
La identidad dedicada está provider-verificada. Visible smoke inicial quedó HOLD de harness. Retry1 estabilizó Service Worker y probó de forma visible Auth Shopper, membership, entrada a app y restauración HR 15/660. El HOLD posterior fue un selector de Playwright sobre `div[data-doc]` luego de que Documentos ya renderizara `Recursos del proyecto`; no prueba defecto de producto.

## 4. Siguiente gate exacto
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW`.

Usar controles explícitos (`button[data-doc]`, `button[data-detail]`) y verificaciones visibles estables. No enviar postulación/certificación/reserva. Máximo 1 password update efímero + 1 login en la misma Shopper sintética; cero otros provider/Firestore/HR/Make/Gemini/pagos writes; sin deploy/merge/prod. La autorización del turno actual cubre este correctivo acotado.

## 5. Después de I4-A
I4-B visita → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5 freeze/build-lock/preproducción/E2E/cutover/smoke.

## 6. Frontend/Claude
Backend no parchea módulos/core. Solo defecto visible reproducible genera handoff por archivo. Un fallo del harness no se transfiere a Claude.

## 7. Definition of Done
Objetivo real + evidencia + seguridad + proven/disproven/unknown + documentos atómicos + verifier + siguiente bloque único.
