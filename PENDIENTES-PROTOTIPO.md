# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `G2B_RECOVERY_NO_PROVIDER_SIDE_EFFECT_NEW_EXPLICIT_DECISION_REQUIRED`

## Estado
**98% / 2% pendiente.** G1 y G2-A permanecen PASS/FROZEN. G2-B continúa abierto.

## Pendiente real único
La recuperación `i5-g2b-p0-writepath-recovery-20260821-02` terminó `RECOVERY_NO_PROVIDER_SIDE_EFFECT` y está consumida, con providerMutationExecutions=0. El provider lane quedó posteriormente `FORENSIC_PROVIDER_LANE_READY`.

No corresponde ejecutar/repetir ningún recovery actual. El siguiente gate es `REQUIRE_NEW_EXPLICIT_RECOVERY_DECISION_AFTER_ATOMIC_CONTINUITY_SYNC`.

Solo después de un futuro `RECOVERY_PASS_FULL`:
1. ejecutar el stage/test exclusivamente `CXORBIA_E2E_SYNTH_*` en la misma plataforma productiva;
2. dejar escenario visible para Paula y capturar observaciones;
3. cleanup completo;
4. post-clean readback con cero residuales;
5. congelar G2/RC y llegar a 100/100 si no queda P0.

## No reabrir / no hacer
No G3, nueva candidata, branch, PR, workflow, PREPROD, replay de execute consumido, stage antes de recovery PASS, HR externa, datos/credenciales reales, pagos, Make/Gemini o merge.

## Frontend/Academia
Sin P0 visual nuevo demostrado y sin impacto Academia en este bloque.
