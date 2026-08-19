# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-E2E-MECHANISM-HOLD-27`

## Preservado
I1/I2/I3 PASS, I4-A PASS, HR 15/660, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. I4-B readiness/provider source permanece PASS/source-ready.

## I4-B — primer E2E write gate
Autorización consumida en run `32286832002`, artifact `9377953415` (`sha256:4454bd22f9dd8f0539420fd7f581ab14767f7a530a17bcb5c62241d183dd092a`). Resultado: `HOLD_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE__provider_is_not_defined`.

Causa: `PIPELINE_MECHANISM_FAILURE_PRIMARY`. La función de harness incrementó el contador y luego evaluó `provider.execute`, pero `provider` había sido declarado dentro de otro bloque léxico; por eso el provider real nunca recibió el comando. No se atribuye a producto/provider.

Safety: `providerCommittedCalls=0`, `providerWritesReported=0`, receipts/audit 0; una visita sintética se creó y fue eliminada; la aplicación sintética nunca se materializó; digests confirmaron visitas reales y postulaciones reales sin cambios. Auth/Historical Shopper/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod 0/false.

## Corrección source-only
Creado `tools/cxorbia-i4b-e2e-harness-v1.mjs`: elimina dependencia de variable global/oculta y exige `provider` como parámetro explícito antes de `execute`. Workflow one-shot consumido retirado; no hubo rerun automático.

## Avance
Formal sigue 60/40 por ausencia de subpesos I4. Operativamente: I4-A PASS; I4-B source readiness PASS; E2E operacional aún pendiente de retry.

## Siguiente
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY`, misma visita sintética/alcance y sin tocar las 660 visitas reales.

Clasificación: Reusable CXOrbia = provider + harness explícito; Exclusivo TyA = tenant/project y protección HR 15/660; Claude/prototipo = handoff previo sin cambio; Academia = sin cambio por fallo de mecanismo; Sin impacto Claude = gate/evidence/harness.
