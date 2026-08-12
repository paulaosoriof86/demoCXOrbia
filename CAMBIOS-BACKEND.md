# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 12:00 -06:00  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK__M5_COMPLETE`

## Bloque ejecutado

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2` sobre `cxorbia-backend-dev`, limitado a Staff y consumido una sola vez.

### Archivos creados/modificados en la remediación y ejecución

- `backend/contracts/c6-staff-repair-bootstrap-exact-write-v2.json`: boundary privado de credenciales efímeras B/C/D, memory-only, sin secreto manual.
- `tools/release/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.mjs`: executor V2 conectado al private handoff, create-before-retire, readback y rollback.
- `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`: harness one-shot acotado al request V2.
- `.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write-v2.json`: autorización consumida y congelada con PASS.
- `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-V2-LATEST.json`: evidencia sanitizada del write/readback.
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`: alineado al estado post-write consumido.
- índice, checkpoint, tracker, plan, CAMBIOS, RESUMEN y PENDIENTES: actualizados a 88/12.

## Evidencia técnica

Decision: `PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK`.

- Private handoff y credenciales runtime B/C/D: PASS.
- Provider preflight: PASS.
- Canonical readback antes de retire: A/B/C/D/R4 PASS.
- Historical readback: 2/2 por R1_SUPER, R2_ADMIN, R3_OPS y R4_CLIENT_HISTORICAL.
- Auth creates=3; claims=3; disables=8; Auth total=14.
- Tenant user docs=4; audit logs=12; Firestore total=16.
- Deletes=0.
- Rollback no requerido; inversas preservadas.
- Blockers=0.
- HR/Rules/Storage/Make/Gemini/pagos writes=0.
- Deploy/merge/producción=0/false/false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL=88% | RESTANTE=12%. Delta funcional: +4%.**

## No reabrir

Exact Write V2 está consumido y no admite segundo intento. No repetir private handoff, D rebase, snapshot `31518927950`, Auth340, SKIP13, MultiAuth, HR ni M4 sin drift nuevo reproducible.

## Siguiente frontera exacta

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_LOCALIZED → M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** credenciales efímeras derivadas dentro de boundary privado; one-shot bounded write; create-before-retire; canonical/cumulative readback; rollback sin deletes.
- **Exclusivo cliente:** tenant TyA/Cinépolis, Staff A-D y grupos históricos.
- **Claude/prototipo:** no se cambió UI; siguiente bloque es wiring localizado y cualquier diferencia visible se documenta por archivo/módulo.
- **Academia:** sin cambio de contenido en este write; actualizar manuales/rutas por rol cuando el wiring haga visible la administración real.
- **Sin impacto Claude:** provider writes, boundary privado, evidencia y rollback técnico.
