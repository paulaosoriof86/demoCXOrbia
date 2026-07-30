# CAMBIOS BACKEND — R17M write plan exacto NO EXECUTE

Fecha: 2026-07-29

## Qué se hizo
Después de R16E PASS se creó un plan exacto por grupos de operación, sin provider calls ni writes.

Archivos:
- `app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
- `tools/reconciliation/tya-r17m-write-plan-no-execute-validate.mjs`;
- `app/docs/R17M-WRITE-PLAN-NO-EXECUTE-RESULT-20260729.md`;
- este addendum.

Validación offline equivalente: `PASS_R17M_WRITE_PLAN_NO_EXECUTE`.

## Decisión
No ejecutar las 1,415 candidatas R16E a ciegas. R17M separa:
- tenant update HOLD: 1;
- canonical foundation create candidates: 16;
- shoppers HOLD legacy/stable-key diff: 210;
- visitas canonical-shadow candidates: 616;
- liquidaciones/control candidates: 572;
- extras preservados: 244;
- deletes: 0.

Subtotal potencial tras gates, excluyendo shoppers y tenant update: 1,204 creates. Sigue no autorizado.

## Arquitectura
- backend destino: `cxorbia-backend-dev`;
- no nueva base;
- topología DEV previa preservada para rollback;
- canonical project `cinepolis` → periods → visits;
- cutover de `CX.data` solo después de idempotencia/smoke.

## Legacy delta
Antes de write authorization se necesita refresh actual solo de shoppers y certificaciones. Visitas siguen HR-first.

## Hosting público
Lectura de `.firebaserc` del repo legacy confirma proyecto Firebase default `tya-plataforma`; se preserva para cutover final. No se hizo deploy.

## Seguridad
Provider calls/writes/deletes/imports/deploys/producción/merge: 0 en R17M.

## Clasificación
- Reusable CXOrbia: shadow canonical materialization con rollback y grupos autorizables.
- Exclusivo TyA: conteos, HR y legacy refresh.
- Claude/prototipo: sin cambio ahora.
- Academia: compare por path no equivale a backend vacío; shadow migration no equivale a duplicación operativa si el read-path es único.
- Sin impacto Claude inmediato: sí.
