# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__CANONICAL_BACKEND_RECOVERED__LEGACY_REFRESH_PASS__VISIT_IDENTITY_CROSSWALK_201_OF_210__REAL_IDENTITY_POLICY_LOCKED__NO_DATA_WRITES__NO_PRODUCTION`

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
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
8. `evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md`;
9. `evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md`;
10. `evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.md`;
11. `evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md`;
12. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
13. `evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json`;
14. `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`;
15. `evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
16. CAMBIOS/Claude/PENDIENTES/Academia más recientes;
17. baseline Corte 3, PR #7 y HEAD vivo.

Prevalece la corrección arquitectónica: `cxorbia-backend-dev` NO es legacy.

## 3. Arquitectura vinculante
- Legacy TyA actual: Firebase `tya-plataforma`; plataforma a retirar, fuente de datos útiles/limpios y Hosting/URL pública a preservar para cutover.
- `cxorbia-backend-dev`: backend DEV canónico de CXOrbia; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino de materialización.
- No crear otra base Firebase por este bloque.

## 4. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo.
- Mayo: 44 pagadas / 0 pendientes.
- Junio: 2 pagadas / 42 pendientes.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 5. Backend canónico / HR viva
Inventario read-only `cxorbia-backend-dev`: Auth 17, clients 3, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, postulations 3, applications 1, notifications 20, shopperBenefits 572, certifications 0.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD por 34 filas País=GT.

## 6. Legacy shoppers/certificaciones — READ-ONLY PASS
El refresh vigente leyó directamente Firebase RTDB del proyecto actual `tya-plataforma`, nodo `tya_shoppers_extra`.

Resultado:
- 281 representaciones crudas;
- 149 shoppers únicos por ID estable;
- 128 duplicados de almacenamiento colapsados;
- 1 conflicto real de fuente;
- 78 certificaciones útiles = 76 intentos + 2 markers;
- 30 recovery mirrors colapsados;
- 22 perfiles enlazados por normalización determinística del mismo ID técnico;
- 120 profile create candidates;
- 7 HOLD = 6 name-only + 1 source conflict.

La lectura fue live al momento del refresh; representa lo que ese nodo contenía en ese instante. No se exportó PII cruda al repo.

## 7. Identidad real — política vinculante
`source-safe` protege repositorio, logs, fixtures y evidencias. **No significa anonimizar la plataforma final.**

La materialización real debe conservar identidad y datos operativos útiles del shopper en el backend protegido. Admin/Operativo deben ver identidad real conforme a RBAC/Rules. DPI, banco, NDA y equivalentes solo si aplican y bajo protección/acceso restringido.

`no name-only automerge` sigue vigente para evitar fusiones erróneas; no es una regla de ocultamiento.

## 8. Visit-identity crosswalk — READ-ONLY PASS
Autorización consumida: HR source-safe + visitas existentes de `cxorbia-backend-dev`; no visitas legacy; evidencia permitida `visitId`, `hrRowId`, `sourceSheet+sourceRow`.

Resultado v2:
- refs HR: 210;
- refs resueltas: 201;
- refs pendientes: 9;
- conflictos: 0;
- visitas HR con shopperRef: 616;
- visitas con identidad exacta recuperada: 571;
- visitas sin evidencia canónica exacta: 45;
- backend shoppers target inexistentes: 0;
- mapping hash: `9221098951aa03d34301273c3adc8f7773a410a39901432ec6f6e3040ce4720f`.

El primer intento 0/210 fue un falso negativo del gate: rechazaba espacios de `sourceSheet/hrRowId`. Se corrigió la causa raíz separando identidad técnica de identidad operacional y el rerun resolvió 201/210.

## 9. R17N — NO EXECUTE
R17N previo conserva idempotencia PASS y writes autorizados=0. Debe reconstruirse después de resolver/incorporar el nuevo crosswalk 201/210 y mantener 9 refs en HOLD hasta evidencia suficiente.

## 10. Gate vivo único
`RECONCILIAR 9 SHOPPER REFS RESTANTES CON IDENTIDAD REAL AUTORIZADA SIN PII EN REPO → REBUILD R17N FINAL → IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → MATERIALIZACIÓN DEV → SMOKE CX.data/AUTH/RBAC → CORTES 6–8 → CUTOVER tya-plataforma`.

No usar nombre como única llave de fusión silenciosa. La identidad real sí debe preservarse en el perfil final.

## 11. Claude/Academia
- Claude: no P0 nuevo, no nueva candidata, no reabrir V182. Cuando el backend canónico tenga perfiles reales, UI autorizada debe mostrar identidad real, no placeholders permanentes.
- Academia: privacidad por rol ≠ anonimización; perfil real, referencia HR, Auth, certificación y dedupe son conceptos distintos.
- Reusable CXOrbia: PII en backend protegido + artefactos source-safe + evidencia transaccional exacta + review de conflictos.
