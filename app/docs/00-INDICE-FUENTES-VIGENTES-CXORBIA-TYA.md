# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_PASS__R17M_WRITE_PLAN_READY_NO_EXECUTE__LEGACY_REFRESH_PENDING__NO_DATA_WRITES`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos/provider writes: 0 en R17M.

## 2. Lectura obligatoria vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras + addendum de empalme/carril;
4. addenda de Academia, patrones y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md`;
8. `evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md`;
9. `evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.md`;
10. `evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md`;
11. `evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.md`;
12. `evidence/R16E-PROVIDER-COMPARE-LATEST.json`;
13. `evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
14. `R17M-WRITE-PLAN-NO-EXECUTE-RESULT-20260729.md`;
15. CAMBIOS/Claude/PENDIENTES/Academia más recientes;
16. baseline Corte 3, PR #7 y HEAD vivo.

Prevalece la corrección arquitectónica: `cxorbia-backend-dev` NO es legacy.

## 3. Arquitectura vinculante
- Legacy TyA Consultores actual: plataforma a retirar; solo origen de datos útiles/limpios.
- `cxorbia-backend-dev`: backend DEV canónico de CXOrbia; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino de materialización.
- Repo legacy público operativo: `paulaosoriof86/cxorbia-tya-plataforma`.
- `.firebaserc` del repo legacy confirma Firebase default `tya-plataforma`; conservar la URL pública actual en el cutover final.

## 4. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo.
- Mayo: 44 pagadas / 0 pendientes.
- Junio: 2 pagadas / 42 pendientes.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 5. Backend canónico / HR viva
Inventario read-only `cxorbia-backend-dev`: Auth 17, clients 3, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, postulations 3, applications 1, notifications 20, shopperBenefits 572, certifications 0.

Gap:
- julio GT+HN faltante en topología period-country previa: 44 visitas;
- `sprint5-visit-mutation-no-real-data`: HOLD_NO_DELETE;
- `hr-58fb469666080189`: HOLD_NO_DELETE;
- pilotos `julio-pilot`, `r1`, `tya-piloto`: preservar.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD por 34 filas País=GT en pestaña HN.

## 6. Plan canónico y R16E
Plan `r16d_f471a6b486f3a269b0dd`: 1,415 operaciones = tenant 1, proyecto padre `cinepolis` 1, HR import 1, periodos 14, shoppers 210, visitas 616, liquidaciones 572; certificaciones 0; pagos 0.

R16E autorizado read-only: run `29282169628`, job `90741969389` SUCCESS, artifact `8743659430`, digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`.

Resultado por paths canónicos: create 1,414 / update 1 / noop 0 / record-review 0 / extras preservados 244 / deletes 0. `create=1414` NO significa backend vacío: la información existente vive principalmente en la topología DEV previa.

## 7. R17M — WRITE PLAN EXACTO NO EXECUTE
Decisión: `PASS_R17M_WRITE_PLAN_NO_EXECUTE__LEGACY_SHOPPER_CERT_REFRESH_PENDING`.

Estrategia: canonical-shadow sobre `cxorbia-backend-dev`, preservando la topología DEV previa para rollback. No nueva base, no deletes, no switch de lectura todavía.

Grupos:
- `op_00001` tenant update: HOLD (`configurable`, `name`, `schemaVersion`);
- `op_00002..op_00017`: 16 foundation creates tras idempotencia;
- `op_00018..op_00227`: 210 shoppers HOLD hasta refresh legacy + diff estable;
- `op_00228..op_00843`: 616 visitas canonical-shadow candidates, HR-first;
- `op_00844..op_01415`: 572 liquidaciones/control candidates, 0 pagos;
- subtotal potencial excluyendo shoppers/tenant: 1,204, aún NO autorizado;
- extras/pilotos y 2 cleanup candidates: preservar/HOLD_NO_DELETE;
- Agosto HN: HOLD.

Validator reusable: `tools/reconciliation/tya-r17m-write-plan-no-execute-validate.mjs`.

## 8. Legacy shoppers/certificaciones
- 215 shoppers existentes: no recrear por rutina.
- 236 referencias HR: no inferir por nombre.
- certifications=0: refresh legacy dirigido requerido.
- Prompt: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.
- Visitas no se refrescan desde legacy; siguen HR-first.

## 9. Gate vivo único
`REFRESH LEGACY SHOPPERS/CERTS → DIFF POR LLAVE ESTABLE → REBUILD R17M → DRY-RUN/IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → SMOKE CX.data CANÓNICO → CORTES 6–8 → CUTOVER EN FIREBASE/HOSTING tya-plataforma`.

No nueva base, nueva candidata, PowerShell ni deploy por este gate.

## 10. Claude/Academia
- Claude: no P0 nuevo, no nueva candidata; preservar fixes core/entrypoint.
- Academia: path canónico ausente ≠ backend vacío; provider compare ≠ write; canonical-shadow requiere un único read-path activo y rollback de topología previa.
- Reusable CXOrbia: inventario → compare → write plan → refresh/diff → idempotencia → write exacto autorizado → smoke → cutover.
