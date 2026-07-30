# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_PASS__LEGACY_REFRESH_PASS__R17N_IDEMPOTENCE_PASS__HR_SHOPPER_CROSSWALK_UNRESOLVED__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos/provider writes: 0 en el bloque vigente.

## 2. Lectura obligatoria vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras + addendum de empalme/carril;
4. addenda de Academia, patrones y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` + addendum legacy/R17N más reciente;
7. `evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md`;
8. `evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md`;
9. `evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.md`;
10. `evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md`;
11. `evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.md`;
12. `evidence/R16E-PROVIDER-COMPARE-LATEST.json`;
13. `evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
14. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
15. `evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json`;
16. `evidence/HR-PROTECTED-SHOPPER-CROSSWALK-READONLY-LATEST.json`;
17. `evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
18. CAMBIOS/Claude/PENDIENTES/Academia más recientes;
19. baseline Corte 3, PR #7 y HEAD vivo.

Prevalece la corrección arquitectónica: `cxorbia-backend-dev` NO es legacy.

## 3. Arquitectura vinculante
- Legacy TyA Consultores actual: plataforma a retirar; solo origen de datos útiles/limpios.
- `cxorbia-backend-dev`: backend DEV canónico de CXOrbia; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino de materialización.
- Repo legacy operativo: `paulaosoriof86/cxorbia-tya-plataforma`.
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
Plan `r16d_f471a6b486f3a269b0dd`: 1,415 operaciones = tenant 1, proyecto padre `cinepolis` 1, HR import 1, periodos 14, shoppers HR-protected 210, visitas 616, liquidaciones 572; certificaciones 0; pagos 0.

R16E autorizado read-only: run `29282169628`, job `90741969389` SUCCESS, artifact `8743659430`, digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`.

Resultado por paths canónicos: create 1,414 / update 1 / noop 0 / record-review 0 / extras preservados 244 / deletes 0. `create=1414` NO significa backend vacío: la información existente vive principalmente en la topología DEV previa.

## 7. Legacy shoppers/certificaciones — READ-ONLY PASS
Autorización consumida: refresh exclusivo de `tya-plataforma` para shoppers/certificaciones, sin writes/Auth/deploy/producción.

Resultado v4 seguro:
- 281 representaciones legacy crudas;
- 149 shoppers únicos por ID estable;
- 128 representaciones duplicadas colapsadas;
- 1 conflicto real de fuente dentro del mismo ID estable;
- 78 registros útiles de certificación después de colapsar 30 espejos de recuperación;
- 76 intentos históricos + 2 marcadores aprobados sin intento histórico;
- 22 perfiles ya enlazados al backend por normalización determinística del mismo ID técnico;
- 121 sin match estable inicial; al aplicar el conflicto de fuente quedan 120 create-candidates y 7 perfiles HOLD (6 name-only + 1 source conflict);
- nombre nunca usado para automerge;
- datos sensibles/PII cruda no exportados.

## 8. Diff de 22 perfiles existentes — READ-ONLY
Los 22 perfiles enlazados tienen campos faltantes aprovechables (teléfono en 22; email en 8), pero también diferencias no vacías: `code` en 22, `name` en 2 y `city` en 1.

Regla: no sobrescribir valores canónicos no vacíos. Los campos faltantes pueden tratarse como candidatos de enriquecimiento solo en un write plan explícito; los conflictos se preservan sin overwrite y se registran. Este hallazgo demuestra que `code` no puede asumirse semánticamente equivalente entre legacy y backend solo por compartir nombre de campo.

## 9. R17N — POST LEGACY, NO EXECUTE
`PASS_R17N_POST_LEGACY_PLAN_NO_EXECUTE` + idempotencia offline PASS.

- Foundation: 16.
- HR protected refs: 210 HOLD crosswalk.
- Legacy profiles: 149 = 120 create candidates + 22 existing-field-diff + 7 HOLD.
- Certificaciones: 78 = 77 candidatas + 1 HOLD por perfil no resuelto.
- Visitas HR-first: 616.
- Liquidation controls: 572; pagos 0.
- Potencial antes de resolver updates de perfiles existentes: 1,401.
- Máximo incluyendo hasta 22 updates existentes: 1,423.
- Idempotence hash: `979d45fa174b8d7aac9810a4a56fb234fffeaedac1442fc811bee55ea41e2e8e` PASS.

## 10. HR protected shopper crosswalk — diagnóstico exacto
Comparación read-only por IDs/códigos técnicos estables, sin nombres:
- 210 referencias shopper del plan HR;
- 215 shoppers existentes;
- match por stable HR ID: 0;
- match por stable HR code: 0;
- unmapped: 210;
- collisions: 0.

Conclusión: NO se pueden empalmar automáticamente las 210 referencias HR con los perfiles existentes por ID/código. Crear las 210 como perfiles adicionales produciría riesgo de duplicación; omitirlas dejaría las visitas canonical-shadow apuntando a IDs sin perfil. Este es el único bloqueo semántico pendiente antes de autorización de writes de visitas/shoppers.

## 11. Gate vivo único
`AUTORIZAR CROSSWALK READ-ONLY POR IDENTIDAD DE VISITA EN cxorbia-backend-dev → MAPEAR HR shopperRef A shopperId EXISTENTE SOLO POR hrRowId/sourceSheet/sourceRow/visitId ESTABLE → REBUILD R17N FINAL → IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → SMOKE CX.data → CORTES 6–8 → CUTOVER EN FIREBASE/HOSTING tya-plataforma`.

El siguiente crosswalk NO debe leer visitas del legacy ni usar nombres. Debe reutilizar las visitas existentes del backend canónico y la HR source-safe para resolver identidad por visita exacta. Requiere autorización read-only separada porque el refresh legacy autorizado estaba limitado a shoppers/certificaciones.

## 12. Claude/Academia
- Claude: no P0 nuevo, no nueva candidata; no ajuste frontend por este bloque.
- Academia: distinguir perfil de shopper, referencia de asignación HR, identidad estable, conflicto y certificación histórica; nombre no es llave de identidad.
- Reusable CXOrbia: fuente externa → identidad estable → crosswalk por evidencia transaccional exacta → review si no existe llave estable → idempotencia → write exacto autorizado → smoke → cutover.
