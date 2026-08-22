# CAMBIOS-BACKEND — RC15 F0 TRAMO 13 · AUTHORITY EXECUTORS + LEDGER

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Contrato

F0 únicamente lectura sobre control-plane. Entrada HEAD `22a20d0eccf80e7a9376f361ede8002083a070b1`. `providerMutationAuthorizedNow=false`. Única mutación permitida: documentación Git de esta auditoría. Prohibidos provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos, deploy, G2-B, merge y cambios funcionales frontend.

## Resultado medible

- hallazgos: **134 → 138**;
- HOLD/P0 acumulados: **31 → 31**;
- contenidos: CP093 + CP119 = **2**;
- residuales: **29 → 29**;
- exhaustividad: **2/4**, sin declarar cierre prematuro;
- nuevos hallazgos: CP135–CP138;
- CP011 fue revalidado como HOLD ya existente, sin doble conteo.

## CP135 — C6 Auth activation V1

`tools/qa/cxorbia-c6-auth-activation-dev.mjs` contiene Auth create/update/claims/disable reales, pero valida request `enabled=true`, `consumed=false`, one-shot y target antes de la escritura. El request actual está `enabled=false`, `consumed=true`, `allowedExecutions=0`; la ejecución histórica no entró al write boundary.

Clasificación: `PASS_HISTORICAL_AUTH_PROVIDER_WRITE_EXECUTOR_FAIL_CLOSED_BY_CONSUMED_REQUEST_F2_CALLER_CONTROL_REQUIRED`.

## CP136 — C6 Auth activation V2/rootfix

`tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs` también conserva primitives Auth reales. Su request actual está `enabled=false`, `consumed=true`, `allowedExecutions=0`; fase 1 detuvo por digest mismatch antes de credencial y fase 2 nunca inició.

Clasificación: `PASS_HISTORICAL_ROOTFIX_AUTH_PROVIDER_WRITE_EXECUTOR_FAIL_CLOSED_BY_CONSUMED_REQUEST_F2_CALLER_CONTROL_REQUIRED`.

## CP137 — Staff exact-write V1/V2

Los dos ejecutores históricos de staff contienen writes reales, pero sus requests actuales están consumidos/deshabilitados. V1 quedó STOP_RETRY con 0/0 Auth/Firestore y V2 quedó terminal PASS después de su ejecución histórica autorizada. No existe replay vigente.

Clasificación: `PASS_HISTORICAL_STAFF_EXACT_PROVIDER_WRITERS_FAIL_CLOSED_BY_CONSUMED_REQUESTS`.

Esto complementa, sin duplicar, CP109 para request V1 y CP002 para el workflow V2.

## CP138 — consumed one-shot ledger

`backend/config/cxorbia-consumed-one-shot-gates.json` bloquea replay, reactivación por conversación vieja e interrupción como reset. G2-B y CP119 aparecen terminales. Sin embargo declara expresamente `historicalGlobalExhaustive=false` y mantiene CP117 abierto.

Clasificación: `PASS_CURRENT_RC15_KNOWN_ONE_SHOT_LEDGER_FAIL_CLOSED_BUT_HISTORICAL_GLOBAL_EXHAUSTIVENESS_FALSE`.

Por tanto **no** se cambia `allRequestsClassified=false` todavía.

## CP011 — reconciliación, no hallazgo nuevo

Se verificó el ejecutor `cxorbia-corte4-protected-smoke-temp-operator.mjs`: el request histórico permanece `enabled=true` y el script contiene mutaciones reales de Auth config/usuario/claims/delete mediante service account. Esto confirma el HOLD CP011 ya contabilizado. Se mantiene para F1; **no ejecutar**.

## Seguridad

En Tramo 13: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos = 0; Cloud Build/Run/Hosting = 0; G2-B = 0; merge = false; frontend funcional = 0.

## Clasificación obligatoria

- **Reusable CXOrbia:** separar primitive, request y ledger; replay imposible para requests consumidos; caller/credential authority única en F2.
- **Exclusivo cliente:** ejecutores históricos TyA/C6/Corte4 y sus requests.
- **Claude/prototipo:** sin cambios de UI ni candidata.
- **Academia:** sin impacto funcional; no actualizar cursos/manuales.
- **Sin impacto Claude:** evidencia y documentación RC15 F0.

## Pendiente real

`allRequestsClassified=false` y `allProviderWriteEntrypointsClassified=false`. Siguiente exacto: resolver CP117/aliases/execute markers y terminar `backend/config`, `tools/qa` y `tools/release`. F1 no inicia antes de 4/4. G2-B no se toca.
