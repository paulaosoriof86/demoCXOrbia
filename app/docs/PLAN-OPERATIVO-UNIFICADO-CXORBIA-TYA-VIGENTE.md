# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**SYNC_EPOCH:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `G2B_RECOVERY_NO_PROVIDER_SIDE_EFFECT_NEW_EXPLICIT_DECISION_REQUIRED`

## Plan formal
I1–I4 PASS/FROZEN = 85. R1=PASS 2, R2=PASS 3, R3=PASS 3, R4=PASS 2, G1=PASS 3, G2=ACTIVE 2. Total: 98/100.

## G2-A
PASS/FROZEN. No repetir sin P0 nuevo.

## G2-B
P0 `G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED`. Última recuperación terminal: `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; provider no cambió. El carril provider quedó después `FORENSIC_PROVIDER_LANE_READY`, pero ningún nuevo recovery está autorizado.

La aceptación final sigue siendo en la misma plataforma productiva con `CXORBIA_E2E_SYNTH_*`, visible para Paula, cleanup y post-clean readback. Ese stage está bloqueado hasta `RECOVERY_PASS_FULL`.

## Anti-bucle
Antes de cualquier nueva mutación debe cumplirse el epoch atómico completo: machine lock, terminal evidence, recovery request, consumed ledger y documentos canónicos en el mismo `SYNC_EPOCH`. Artefactos execute/authorization son históricos después del receipt terminal y no reactivan trabajo.

## Próximo bloque exacto
`REQUIRE_NEW_EXPLICIT_RECOVERY_DECISION_AFTER_ATOMIC_CONTINUITY_SYNC`.

No G3, nueva candidata, branch, PR, workflow, PREPROD, replay, HR externa, datos/credenciales reales, pagos, Make/Gemini o merge.
