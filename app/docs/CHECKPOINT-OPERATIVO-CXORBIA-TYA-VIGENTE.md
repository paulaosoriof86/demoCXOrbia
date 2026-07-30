# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_PASS__R17M_WRITE_PLAN_READY_NO_EXECUTE__LEGACY_REFRESH_PENDING__NO_DATA_WRITES`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- R17M provider calls/writes/deletes/imports/deploys/production/merge: 0.

## 2. Arquitectura vinculante
- Legacy TyA Consultores = plataforma actual a retirar; solo fuente de datos útiles limpios.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia/TyA; reutilizar.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico; no destino de materialización.
- Repo legacy operativo: `paulaosoriof86/cxorbia-tya-plataforma`.
- `.firebaserc` verificado: Firebase default `tya-plataforma`; ese Hosting público se conserva para el cutover final.

## 3. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo. Mayo 44 pagadas; junio 2 pagadas / 42 pendientes. P1/P2 reportes/copy no bloquean.

## 4. Sandbox Corte 4 — aprendizaje preservado
VIS-01/VIS-02/VIS-02B corregidos: fail-closed sin demo, backend vacío válido, null-safety, role-switch limpio y entrypoint íntegro. No se materializa TyA allí.

## 5. Backend canónico / HR viva
Inventario read-only `cxorbia-backend-dev`: Auth 17, clients 3, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, postulations 3, applications 1, notifications 20, shopperBenefits 572, certifications 0.

Gap:
- julio GT+HN faltante en topología period-country previa: 44 visitas;
- `sprint5-visit-mutation-no-real-data`: HOLD_NO_DELETE;
- `hr-58fb469666080189`: HOLD_NO_DELETE;
- pilotos `julio-pilot`, `r1`, `tya-piloto`: preservar.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD por 34 filas País=GT.

## 6. Plan canónico + R16E
Plan R16D: 1,415 operaciones = tenant 1, proyecto padre `cinepolis` 1, HR import 1, periodos 14, shoppers 210, visitas 616, liquidaciones 572; certificaciones 0; pagos 0.

R16E autorizado read-only:
- run `29282169628` / job `90741969389`: SUCCESS;
- artifact `8743659430`;
- digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`;
- decisión `PASS_WITH_REVIEW_CANONICAL_MATERIALIZATION_DRY_RUN_R16`;
- create 1,414 / update 1 / noop 0 / review 0 / extras preservados 244 / deletes 0.

`create=1414` no significa base vacía: la topología canónica nueva no existe bajo esos paths; la materialización útil actual está en la topología DEV previa.

## 7. R17M — WRITE PLAN EXACTO NO EXECUTE
Decisión: `PASS_R17M_WRITE_PLAN_NO_EXECUTE__LEGACY_SHOPPER_CERT_REFRESH_PENDING`.

Estrategia aprobada para preparación: **canonical-shadow** sobre el mismo `cxorbia-backend-dev`, preservando topología DEV previa para rollback y sin switch de lectura antes de smoke.

Grupos exactos:
- tenant update `op_00001`: HOLD por `configurable`, `name`, `schemaVersion`;
- foundation `op_00002..op_00017`: 16 create candidates tras idempotencia;
- shoppers `op_00018..op_00227`: 210 HOLD hasta refresh legacy + diff estable;
- visits `op_00228..op_00843`: 616 HR-first canonical-shadow candidates;
- liquidations `op_00844..op_01415`: 572 payment-control-only candidates, 0 pagos;
- subtotal potencial excluyendo shoppers/tenant: 1,204, todavía NO autorizado;
- 244 extras/pilotos + 2 cleanup candidates: preservar/HOLD_NO_DELETE;
- Agosto HN: HOLD.

Evidencia: `app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`.
Validator: `tools/reconciliation/tya-r17m-write-plan-no-execute-validate.mjs`; validación offline equivalente PASS.

## 8. Shoppers/certificaciones
- 215 shoppers existentes: no recrear por rutina.
- 236 referencias HR: diff solo por llave estable; no nombre.
- certifications=0: se requiere refresh actual desde legacy.
- Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.
- Visitas permanecen HR-first, no se refrescan desde legacy.

## 9. Ruta a producción
`LEGACY delta shoppers/certs + HR viva → rebuild R17M → dry-run/idempotencia → writes exactos autorizados → smoke CX.data/Auth/sync → preprod/rollback → cutover Firebase/Hosting tya-plataforma`.

## 10. Gate real siguiente
`REFRESH LEGACY SHOPPERS/CERTIFICACIONES → DIFF POR LLAVE ESTABLE → REBUILD R17M → OFFLINE IDEMPOTENCE`.

Solo después se pide autorización para grupos/conteos exactos de write. No nueva base, nueva candidata, PowerShell, deploy ni producción.

## 11. Claude/Academia
- Claude: no P0 nuevo; no nueva candidata; preservar fixes core/entrypoint.
- Academia: canonical path ausente ≠ backend vacío; shadow migration requiere read-path único y rollback; compare/plan ≠ write.
- Reusable CXOrbia: inventario → compare → write plan → refresh/diff → idempotencia → write exacto → smoke → cutover.
