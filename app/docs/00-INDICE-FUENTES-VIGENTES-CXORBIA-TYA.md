# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 17:03 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__GO_LIVE_35__HUMAN_LEGAL_GATE_NEXT`

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
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — causa raíz request08 preservada.
13. **`SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — lock I3 vigente y prevalente.**
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
15. `CAMBIOS-BACKEND.md`
16. `RESUMEN-PARA-CLAUDE.md`
17. `PENDIENTES-PROTOTIPO.md`
18. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`
19. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider write NO: request08 quedó consumido y el próximo write legal/Admin-new-Shopper requiere autorización humana explícita. Prohibido nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## I3 histórico preservado

Run `31906391682`: Shopper histórico exacto PASS y congelado. No repetir reset, recovery, reconciliación ni acceso a credencial histórica. Toda continuación futura lleva `passwordResets=0` y usa read-only `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

## Request08 — causa raíz cerrada como STOP seguro

Run `31909354336`, job `95071998299`: `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Fail-closed antes de Alta; sin `shopper.create`, sin aceptación automática, nuevos Auth/Firestore writes `0/0`. Request08 consumido; no rerun.

## Bloque durable legal — source-only PASS

Commits fuente `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed` → `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0` → `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate canónico: run `31913700755`, job `95082399402`, `SUCCESS`. Gate PR: run `31913704247`, job `95082407608`, `SUCCESS`.

Quedaron preparados contrato/read model/provider runtime/browser bridge para aceptación legal durable, exact-identity, versionada, human-only, provider-ACK y fail-closed. El bridge no está activado en el entrypoint productivo. Provider credentials/reads/writes reales `0/0/0`; Firestore/Auth/legal writes `0/0/0`; deploy/merge/producción `0/false/false`.

El texto NDA demo/local actual no fue aprobado ni materializado como autoridad provider.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

Antes de cualquier write: revisión humana del contenido legal TyA exacto, versión/digest y autorización de materialización si aplica. Después, aceptación exclusivamente humana y reanudación de un único Shopper nuevo. No está autorizado todavía.
