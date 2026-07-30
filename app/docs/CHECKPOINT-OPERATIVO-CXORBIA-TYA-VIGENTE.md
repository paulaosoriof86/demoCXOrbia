# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_PASS__LEGACY_REFRESH_PASS__R17N_IDEMPOTENCE_PASS__HR_SHOPPER_CROSSWALK_UNRESOLVED__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; production=false; merge=false.

## 2. Arquitectura vinculante
- Legacy TyA Consultores = plataforma actual a retirar; solo fuente de datos útiles limpios.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia/TyA; reutilizar.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico; no destino de materialización.
- Repo legacy operativo: `paulaosoriof86/cxorbia-tya-plataforma`.
- `.firebaserc` legacy: Firebase `tya-plataforma`; conservar su Hosting/URL pública para cutover final.

## 3. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo. Mayo 44 pagadas; junio 2 pagadas / 42 pendientes. P1/P2 reportes/copy no bloquean.

## 4. Backend canónico / HR viva
Inventario read-only `cxorbia-backend-dev`: Auth 17, clients 3, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, postulations 3, applications 1, notifications 20, shopperBenefits 572, certifications 0.

Gap preservado:
- julio GT+HN faltante en topología period-country previa: 44 visitas;
- `sprint5-visit-mutation-no-real-data`: HOLD_NO_DELETE;
- `hr-58fb469666080189`: HOLD_NO_DELETE;
- pilotos `julio-pilot`, `r1`, `tya-piloto`: preservar.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD por 34 filas País=GT.

## 5. R16E — provider compare read-only PASS
- run `29282169628` / job `90741969389`: SUCCESS;
- artifact `8743659430`;
- digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`;
- 1,415 operaciones canónicas;
- create 1,414 / update 1 / noop 0 / review 0;
- extras preservados 244; deletes 0.

`create=1414` no significa backend vacío: los nuevos canonical-shadow paths no existen, mientras la topología DEV previa sí contiene materialización útil.

## 6. Legacy shoppers/certificaciones — READ-ONLY PASS
Autorización de Paula ejecutada exclusivamente sobre shoppers/certificaciones de `tya-plataforma`; sin writes/Auth changes/deploy/producción.

Resultado final v4:
- 281 representaciones legacy crudas;
- 149 shoppers únicos por stable ID;
- 128 representaciones duplicadas colapsadas;
- 1 conflicto interno de fuente;
- 78 certificaciones útiles = 76 intentos históricos + 2 markers;
- 30 recovery mirrors colapsados;
- 22 perfiles enlazados por normalización determinística del mismo ID técnico;
- 120 perfiles create candidates;
- 7 perfiles HOLD = 6 name-only + 1 source conflict;
- 77 certificaciones candidatas + 1 HOLD.

No se exportó PII cruda y nunca se usó nombre para automerge.

## 7. Existing profile field diff — READ-ONLY
Para los 22 stable-linked:
- phone faltante en 22;
- email faltante en 8;
- diferencias no vacías: code 22, name 2, city 1.

Política: completar solo campos vacíos en un futuro write plan; nunca sobreescribir campos canónicos no vacíos por rutina. Los conflictos quedan preservados.

## 8. R17N — POST LEGACY NO EXECUTE
`PASS_R17N_POST_LEGACY_PLAN_NO_EXECUTE`.

- Foundation 16.
- HR protected refs 210 HOLD crosswalk.
- Legacy profiles 149 = 120 create + 22 existing diff + 7 HOLD.
- Certificaciones 78 = 77 candidatas + 1 HOLD.
- Visitas 616 HR-first.
- Liquidation controls 572; pagos 0.
- Potencial antes de existing-profile updates: 1,401.
- Máximo incluyendo hasta 22 updates: 1,423.
- Idempotence hash: `979d45fa174b8d7aac9810a4a56fb234fffeaedac1442fc811bee55ea41e2e8e` PASS.
- Writes autorizados: 0.

## 9. HR protected shopper crosswalk — resultado
Se compararon las 210 refs HR contra 215 shoppers existentes solo por stable technical ID/code, name matching=false:
- stable HR ID match 0;
- stable HR code match 0;
- unmapped 210;
- collision 0.

Por tanto no es seguro ni crear 210 perfiles duplicados ni omitir las referencias de las 616 visitas.

## 10. Único bloqueo real / siguiente gate
Resolver crosswalk usando evidencia transaccional exacta de las **visitas ya existentes en `cxorbia-backend-dev`** contra HR source-safe:
- `hrRowId`;
- `sourceSheet + sourceRow`;
- `visitId` estable.

No usar nombre. No leer visitas legacy. Este provider read necesita autorización separada porque el gate legado consumido estaba limitado a shoppers/certificaciones.

Secuencia exacta:
`VISIT-IDENTITY CROSSWALK READ-ONLY → R17N FINAL → IDEMPOTENCE → EXACT WRITE AUTHORIZATION → CX.data SMOKE → CORTES 6–8 → CUTOVER tya-plataforma`.

## 11. Claude/Academia
- Claude: no P0 nuevo, no nueva candidata, no reabrir V182.
- Academia: perfil canónico ≠ referencia HR ≠ identidad Auth; carryover de certificación; stable key antes de dedupe; conflictos a review.
- Reusable CXOrbia: identidad estable + evidencia transaccional exacta para crosswalk multi-source.
