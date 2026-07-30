# CAMBIOS-BACKEND.md

## 2026-07-30 — R17N FINAL materialización DEV exacta PASS

Estado vivo: `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__READBACK_1406_PASS__POST_COMPARE_SMOKE_PENDING__NO_PRODUCTION`.

### Archivos funcionales/gates creados o modificados
- `tools/migration/tya-r17n-final-materialize-dev.mjs`: executor exacto DEV, preflight, relectura de identidad real en memoria, write por grupos autorizados y readback.
- `.github/workflows/cxorbia-r17n-final-materialize-dev.yml`: gate one-shot de materialización DEV con diagnóstico fail-closed.
- `.github/cxorbia-firebase-requests/r17n-final-materialize-dev.json`: autorización exacta `r17n-final-dev-20260730-01`.
- `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json/.md`: evidencia sanitizada PASS.
- `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-HOLD-LATEST.json`: conserva trazabilidad de preflights HOLD previos sin writes.

### Ejecución real autorizada
Target: `cxorbia-backend-dev` / tenant `tya` / project `cinepolis`.

Preflight final:
- 1,406 operaciones intended;
- 1,406 absent;
- 0 same / 0 conflict;
- 208/208 identidades HR revalidadas;
- 201/201 targets canónicos existentes verificados;
- 201/201 con nombre real visible; 0 enriquecimientos adicionales;
- 196 links financieros exactos R14C preservados.

Writes ejecutados y readback:
- foundation 16;
- legacy profile creates 120;
- current-HR profile creates 5;
- certification creates 77;
- visits 616;
- liquidation controls 572;
- **Firestore writes = 1,406**;
- **readback = 1,406/1,406**;
- mismatch = 0.

### Exclusiones verificadas
- tenant update 1: no ejecutado;
- existing profile updates 22: HOLD;
- legacy holds 7: HOLD;
- certification hold 1: HOLD;
- Agosto HN: HOLD;
- deletes=0;
- pagos/lotes=0;
- Auth/Storage/HR/legacy writes=0;
- deploy=0;
- merge=false;
- producción=false.

### Causa raíz corregida antes del write
Los dos primeros preflights del executor devolvieron `live_identity_207` y se detuvieron con Firestore writes=0. El problema era del gate: para reconstruir el shopperRef se colapsaban espacios internos antes del SHA, mientras el builder R20 usa exactamente `trim + lowercase`. Se corrigió el executor para usar la misma semántica R20. Después del fix, el preflight obtuvo 208/208 y recién entonces se ejecutó el write.

### Documentación
Actualizados índice vigente, checkpoint, Phase A, CAMBIOS, Claude/PENDIENTES/Academia y PR #7. Evidencia principal: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## Clasificación
- **Reusable CXOrbia:** autorización exacta por grupos, preflight fail-closed, stable identity hashing compartido con source builder, no-overwrite, readback completo, PII fuente→backend protegido sin pasar por GitHub.
- **Exclusivo cliente:** TyA/Cinépolis, `tya-plataforma`, 208 refs, 120+5 perfiles, 77 certs, 616 visitas y 572 controles.
- **Claude/prototipo:** sin nueva candidata; validar UI solo después del smoke backend; P1/P2 de reportes siguen backlog.
- **Academia:** explicar materialización, readback, identidad real/source-safe y liquidación ≠ pago.
- **Sin impacto Claude:** executor/workflow/request/evidencia técnica.

## Siguiente bloque exacto
`POST-COMPARE READ-ONLY DEL BACKEND MATERIALIZADO → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA → CORTE 6 AUTH/RBAC`.

## Estado seguro
Firestore writes autorizados ejecutados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0.

## Histórico
Los addenda previos permanecen como trazabilidad. Los estados de 210 refs/9 pendientes y R17N NO EXECUTE son históricos y no deben reactivarse.
