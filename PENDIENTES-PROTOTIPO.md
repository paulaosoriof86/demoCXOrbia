# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

119 hallazgos clasificados; 26 HOLD/P0 acumulados; CP093 y CP119 contenidos; **24 residuales**. Exhaustividad **2/4**.

Cerrado:
- workflows HEAD/base 105/105;
- `.github/cxorbia-firebase-requests` 33/33;
- `backend/requests` 6/6.

Pendiente global:
- `allRequestsClassified=false`: terminar `backend/config`, execute markers, ledgers, aliases y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: runtime/provider tools/endpoints restantes.

## CP119 — cerrado como contención

Ya no está pendiente la escritura legal histórica desplegada. La autorización actual se consumió una sola vez y removió únicamente los dos env vars de escritura legal en `cxorbia-live-hr-dev`. Revisión actual `00011-f2f`; misma imagen/service account; POST legal directo y vía Hosting devuelve 423 `LEGAL_RUNTIME_HUMAN_ACCEPTANCE_WRITE_GATE_DISABLED` antes de auth.

No hubo aceptación legal real ni Cloud Build/Hosting/data writes. El workflow temporal queda retirado y el request queda consumido/no-retry.

## Pendientes F2 ya demostrados

- consumed one-shot ledger todavía no cubre exhaustivamente todas las autorizaciones históricas C6/Corte6/I3; CP119 sí queda agregado de inmediato;
- evidence aliases está en epoch 47 mientras continuity lock está en epoch 50;
- request/execute/runtime/ledger deben quedar bajo una única autoridad canónica;
- stale execute marker I3 y otros artefactos históricos deben quedar tombstone/inert en F1/F2, sin reactivar provider work.

## G2-B

El receipt histórico de recovery permanece `RECOVERY_NO_PROVIDER_SIDE_EFFECT` con baseline `00010-n78`. Como CP119 cambió la revisión provider actual a `00011-f2f`, el readiness anterior queda stale y debe revalidarse en F3. No retry/replay ahora.

## Regla

F0 continúa solo read-only. No iniciar F1 hasta 4/4 exhaustividad. No tocar G2-B.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` sobre `backend/config` restante, execute markers, ledgers/aliases y provider-write entrypoints.
