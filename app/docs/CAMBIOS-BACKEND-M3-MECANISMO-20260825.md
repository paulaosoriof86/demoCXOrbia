# CAMBIOS-BACKEND — ADDENDUM M3 MECANISMO CANÓNICO

**Fecha:** 2026-08-25  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**PHASE_A:** `98/100`

## Contrato del bloque

Objetivo: eliminar la desincronización recurrente del mecanismo antes de continuar la inertización masiva. Entrada: HEAD `474303fd8f05dae093d8fd8c3f2db262e15cb73e`, M1/M2 CLOSED_PASS y F0 4/4. Mutaciones permitidas: source/control-plane histórico, validadores, evidencia y documentación Git. Prohibido: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos, Cloud Build/Run/Hosting, G2-B, merge y frontend funcional.

## Cambios

- Se separó la validación inmutable del master plan de la máquina de estado dinámica.
- Se sustituirán validadores hard-codeados a M1/M2 por validadores derivados de M2 CLOSED_PASS + evidencia M3 vigente.
- Se creó `validate-cxorbia-canonical-authority.js`.
- Se creó `cxorbia-historical-authority-tombstones.json`.
- El consumed ledger conservará únicamente ejecuciones realmente consumidas; no se falsificará consumo de autoridades nunca ejecutadas.
- Aliases quedarán explícitamente sin autoridad de ejecución y vinculados al control epoch M2/M3.
- CP011 y CP142 se inertizan sin ejecutar provider/data/deploy.
- El objetivo material del hito es 30 → 28 residuales sin abrir una nueva auditoría.

## Incidente de materialización

El conector de contenidos creó primero la evidencia M3 y luego el tombstone registry/gate en commits consecutivos, en vez del único commit atómico previsto. No produjo provider/data/deploy side effects. Este addendum lo declara expresamente; el cierre del hito requiere readback de todas las piezas y no se declarará PASS mientras las fuentes canónicas no estén sincronizadas.

## Seguridad

Provider writes=0; data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos=0; Cloud Build/Run/Hosting=0; G2-B=0; merge=false; cambios frontend funcionales=0.

## Clasificación

- **Reusable CXOrbia:** separación immutable-plan/dynamic-state, tombstones, ledger semánticamente correcto y gates fail-closed.
- **Exclusivo cliente:** autoridades históricas TyA/Corte4/M9 y targets DEV conservados solo como evidencia.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** control-plane, validadores, evidencia y documentación.

## Siguiente exacto

Completar materialización del hito M3, readback integral y luego `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`. No reabrir M1/M2, no Tramo 15 y no provider access.
