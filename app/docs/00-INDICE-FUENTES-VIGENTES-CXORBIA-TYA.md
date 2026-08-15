# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 14:17 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_SUBGATE_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__GO_LIVE_35__REQUEST07_GATE_REQUIRED`

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
11. `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md` — histórico.
12. `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — histórico/fix preservado.
13. `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — request04/histórico.
14. `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md` — request05/histórico.
15. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — subgate histórico real congelado por request06.
16. **`SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md` — lock I3 más reciente y prevalente.**
17. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
18. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider NO está autorizado actualmente porque request `...-06` está consumido. No existe request07 autorizado. No nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## Request `...-06` — resultado real

Request commit `701fedc184ccc98e08e7444adc0f04cd54247fce`; run `31906391682`; job `95064802332`.

### PASS histórico congelado

- mismo Shopper histórico exacto;
- credential reset ejecutado exactamente una vez sobre el mismo UID;
- UID/claims/profile/membership/crosswalk/history preservados;
- login real + protected HR authority + history E2E PASS;
- Auth password update `1`;
- Firestore historical reconciliation writes `0`;
- other identities `0`;
- fuzzy `false`.

Checkpoint:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

Ese subgate está cerrado. **No repetir reset ni volver a usar credencial histórica.**

### Gate legal

`workspaceState=legal-gate-pending`; diálogo visible y `acceptanceAutomated=false`. Academia/Certificación diferidas, no PASS.

### STOP_RETRY Admin/new Shopper

Después del PASS histórico, el E2E Admin encontró `#shNew` en DOM pero oculto y agotó 20 s antes del click.

Clasificación:
`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

No hubo `shopper.create`, Shopper nuevo, update ni readback. Nuevos Auth/Firestore writes: `0/0`. Request06 consumido/parked; no rerun.

## Fix y gate source-only posterior

- E2E Admin espera el handoff canónico `entered`, membership/HR authority, app visible y login oculto antes de navegar.
- Espera `CX.session.view='shoppers'` antes de `#shNew`.
- Source patcher prearma únicamente `admin_new_shopper_resume` desde request06.
- Workflow I3 existente queda Admin/new-Shopper-only, verifica frozen checkpoint y exige `passwordResets=0`; no carga credencial histórica.
- Source-only gate run `31906801917`, job `95065826139`, HEAD `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`: `SUCCESS` completo.
- Cero provider writes/resets en esta corrección source-only.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre completo.**

El subgate histórico está cerrado internamente; solo Admin/new Shopper queda vivo dentro de I3.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.

Un eventual request07 debe continuar exclusivamente desde request06, reutilizar read-only el checkpoint histórico, llevar `passwordResets=0`, no acceder a la credencial histórica y autorizar solo un Shopper nuevo: create/update por provider ACK, Auth/claims/membership/profile/crosswalk, provider readback, login, reload/new-tab y segundo contexto, con todas las prohibiciones previas y sin retry automático.
