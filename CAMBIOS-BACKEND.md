# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

**Avance formal:** **60% completado / 40% pendiente**.

## Preservado
I1/I2/I3 PASS, I4-A PASS, HR `15 periodos / 660 visitas`, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. Sin frontend P0 nuevo.

## Auditoría previa solicitada
Se verificó el conjunto canónico y se encontró sincronizado en epoch/frontera antes de construir Retry2. Además se identificó un riesgo latente que todavía habría causado otro bloqueo: `verify-cxorbia-source-truth-sync.mjs` seguía hard-codeando 60/40 aunque epoch/frontera ya fueran dinámicos. Eso habría fallado automáticamente al cerrar I4 y cambiar a 85/15.

## Corrección sostenible aplicada en fuente
- Source-truth v11: epoch, frontera y progreso se derivan del Execution State; solo exige porcentajes válidos que sumen 100 y los compara dinámicamente en los 10 Markdown canónicos.
- Provider verifier v1.2: comprueba read-before-write en `application.create`, `application.status.update` y `visit.*`, no solo en la rama que falló Retry1.
- Workflow I4-B existente: se convierte en carril estable request-driven; gate deshabilitado ejecuta solo preflight; gate autorizado es el único que puede alcanzar provider; `cancel-in-progress=false`.
- Executor/finalizer genéricos: idempotency y fixture dependen de `requestId`, no de Retry1; un fallo antes de entrar al intento de mutación no consume autorización; una ejecución que sí entra se consume una sola vez y archiva evidencia por request.
- Retry2 request: construido `enabled=false`, `consumed=false`, `authorizationRequired=true`; cero provider writes en esta preparación.

## Frontera
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

PASS Retry2 → I4-C HR bidireccional.

## Clasificación
- Reusable CXOrbia: source-truth dinámico, workflow request-driven, finalización single-use y verificación transaccional multi-rama.
- Exclusivo TyA: tenant `tya`, Cinépolis, HR 15/660, fixture sintético I4-B.
- Claude/prototipo: sin cambio frontend; handoff vigente se conserva.
- Academia: sin cambio funcional; no enseñar lifecycle write como PASS hasta Retry2.
- Sin impacto Claude: workflow/backend/verifiers/docs del gate.
