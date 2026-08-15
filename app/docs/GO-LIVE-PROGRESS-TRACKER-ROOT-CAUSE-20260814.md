# GO-LIVE PROGRESS TRACKER — ROOT-CAUSE PLAN CXORBIA TyA

**Fecha:** 2026-08-15 14:17 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__35_PERCENT__REQUEST07_GATE_REQUIRED`

## Medición

I1 15% · I2 20% · I3 25% · I4 25% · I5 15%. Solo avanza al cerrar una iteración completa.

## Actual

**35% completado / 65% pendiente.** I1 PASS 15/15; I2 PASS 20/20; I3 sigue 0/25 hasta cierre integral.

## Request `...-06` — histórico cerrado y congelado

Run `31906391682`, job `95064802332` alcanzó provider y cerró el subgate histórico:

- un único reset del mismo UID histórico exacto;
- Auth password updates `1`;
- UID/claims/profile/membership/crosswalk/history preservados;
- historical Firestore reconciliation writes `0`;
- login real + HR authority + history E2E PASS;
- other identities `0`;
- fuzzy matching `false`.

Checkpoint canónico congelado:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

Este subgate no vuelve a ejecutarse. Futuras continuaciones I3 deben tener `passwordResets=0` y no cargar la credencial histórica.

## NDA / Academia

El checkpoint quedó en `legal-gate-pending`: diálogo visible y pendiente, `acceptanceAutomated=false`. Academia y Certificación están diferidas por ese gate y no se declaran PASS.

## Request `...-06` — Admin/new Shopper pendiente

El E2E posterior falló antes del comando porque `#shNew` existía pero seguía oculto:

`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

No hubo click, `shopper.create`, Shopper nuevo, update ni provider readback. Nuevos Auth/Firestore writes de Shopper nuevo: `0/0`.

Request06 quedó consumido; no rerun ni retry automático.

## Corrección focal source-only certificada

- E2E Admin espera el handoff canónico completo `frontend handoff=entered`, membership, HR authority, app visible y login oculto antes de navegar a Shoppers.
- Espera además `CX.session.view='shoppers'` antes de exigir `#shNew` visible.
- Source patcher prearma únicamente `admin_new_shopper_resume` desde request06.
- Workflow I3 existente verifica primero el checkpoint histórico y bloquea cualquier nuevo reset (`passwordResets=0`).
- No vuelve a seleccionar/cargar la credencial histórica.

Source-only gate:
- run `31906801917`;
- job `95065826139`;
- HEAD `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`;
- resultado `SUCCESS`.

PASS: I1, I2, frozen history, harness legal-gate-aware, Admin E2E source, handoff wait, patcher, Admin-only lineage y checkpoint verifier. Cero provider writes/resets/deploy/merge/producción.

Source lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md`.

## Pendiente I3 real

Solo queda el subgate Admin/new Shopper:

1. gate/request nuevo `...-07`, no rerun de request06;
2. reutilizar read-only el checkpoint histórico;
3. `passwordResets=0` y cero acceso a credencial histórica;
4. Admin create/update de un único Shopper nuevo con provider ACK;
5. Auth + claims + membership + profile/shopper + crosswalk;
6. provider readback;
7. nuevo Shopper login + reload/new-tab + segundo contexto;
8. cero fuzzy, otras identidades, consentimiento automatizado o providers prohibidos.

Cierre I3 => **60% completado / 40% pendiente**.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.
