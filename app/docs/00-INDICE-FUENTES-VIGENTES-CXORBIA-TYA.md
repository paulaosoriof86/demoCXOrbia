# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 15:22 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_ADMIN_LEGAL_GATE_STOP_RETRY_BEFORE_CREATE__ZERO_NEW_WRITES__GO_LIVE_35__DURABLE_LEGAL_ACCEPTANCE_SOURCE_BLOCK_NEXT`

## Fuentes vigentes

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
12. `SOURCE-LOCK-ITERATION3-REQUEST07-ADMIN-OVERLAY-STOP-RETRY-OVERLAY-AWARE-SOURCE-GATE-PASS-20260815.md` — histórico inmediato request07.
13. **`SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — lock I3 más reciente y prevalente.**
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
15. `ADDENDUM-CAMBIOS-BACKEND-I3-REQUEST08-LEGAL-GATE-20260815.md`
16. `RESUMEN-PARA-CLAUDE-I3-REQUEST08-LEGAL-GATE-20260815.md`
17. `PENDIENTES-PROTOTIPO-I3-REQUEST08-LEGAL-GATE-20260815.md`
18. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider NO para otra continuación: request08 quedó consumido y no existe autorización request09. Prohibido nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## I3 histórico preservado

El Shopper histórico exacto quedó PASS y congelado en run `31906391682`. No repetir reset, recovery, reconciliación ni acceso a credencial histórica. Toda continuación futura lleva `passwordResets=0` y usa read-only `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

El histórico mostró `legal-gate-pending`, visible y `acceptanceAutomated=false`; Academia/Certificación diferidas, no PASS.

## Request08 — resultado real

Request commit `d21fb78aa012b1739fea03053a0a947fcd379ee4`; run `31909354336`; job `95071998299`; parking commit `8fa887900a5507b606b31dc0386a135060980837`.

El harness overlay-aware alcanzó el Admin canónico y detectó antes de Alta un gate legal/confidencialidad pendiente:

`I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`

Se detuvo fail-closed exactamente como estaba autorizado. No hubo aceptación/firma/guardado/automatización legal, `shopper.create`, update, readback ni login del Shopper nuevo. Nuevos Auth/Firestore writes `0/0`; password resets `0`; histórico intacto/sin credencial; otras identidades `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false. Request08 consumido/parked; no rerun.

## Hallazgo de causa raíz posterior

La fuente actual confirma que `CX.app.enter()` detiene el router mientras `CX.confidencialidad.pending(role)` sea verdadero. Administración describe hoy el NDA/aceptaciones como demo local y distingue que en producción quedarán firmadas/auditadas. No está demostrado todavía un registro durable account-scoped/cross-context de aceptación legal en el backend protegido.

Inferencia técnica documentada: una aceptación local en el navegador de Paula no se tratará como workaround de un runner GitHub limpio. No se inventa la llave/archivo interno exacto de `CX.confidencialidad` mientras no haya evidencia suficiente.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.** El histórico está cerrado; Admin/new Shopper sigue vivo pero ahora depende del contrato durable de aceptación legal.

## Siguiente bloque exacto

`I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_AND_PRODUCTION_WIRING_SOURCE_ONLY`

Source-only: definir/predisponer persistencia legal durable, versionada, account-scoped, human-only y fail-closed, sin aceptar/firmar/guardar consentimiento real y sin provider writes/deploy/merge/producción. Luego hará falta una autorización explícita nueva para cualquier write legal y para continuar Admin/new Shopper.
