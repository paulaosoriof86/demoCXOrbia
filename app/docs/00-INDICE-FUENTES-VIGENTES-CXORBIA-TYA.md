# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_READONLY_PASS_WITH_REVIEW__NO_DATA_WRITES__R17_WRITE_PLAN_PENDING`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos/data writes reales: 0 en R16E.

## 2. Orden de lectura vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras y addendum de empalme/carril vigentes;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md`;
8. `app/docs/evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md`;
9. `app/docs/evidence/CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.md`;
10. `app/docs/evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.md`;
11. `app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md`;
12. `app/docs/evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.md`;
13. `app/docs/evidence/R16E-PROVIDER-COMPARE-LATEST.json`;
14. `app/docs/CAMBIOS-BACKEND-ADDENDUM-R16E-PROVIDER-COMPARE-PASS-20260729.md`;
15. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-R16E-PROVIDER-COMPARE-PASS-20260729.md`;
16. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-R16E-PROVIDER-COMPARE-PASS-20260729.md`;
17. `app/docs/ACADEMIA-IMPACTO-R16E-PROVIDER-COMPARE-PASS-20260729.md`;
18. baseline/freeze Corte 3;
19. PR #7 y HEAD vivo.

La corrección de arquitectura prevalece sobre cualquier documento histórico que llame a `cxorbia-backend-dev` “base anterior excluida”.

## 3. Arquitectura vinculante
- **Legacy TyA Consultores actual:** plataforma a retirar; solo origen de datos útiles/limpios. No copiar código, parches, dashboard ni arquitectura.
- **`cxorbia-backend-dev`:** backend DEV canónico de CXOrbia, TyA primer tenant. Se reutiliza; no se reconstruye en otro Firebase.
- **`cxorbia-tya-dev-260729-c4`:** sandbox técnico que permitió corregir VIS-01/VIS-02/VIS-02B; no destino de materialización.
- **Hosting público TyA:** se conserva la URL actual de shoppers para el cutover final; verificar identidad técnica antes del deploy final.

## 4. Corte 3 — congelado
`FROZEN_ACTIVE_BASELINE` sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- Source lock hasta julio: 14 periodos / 616 visitas, 34 GT + 10 HN por periodo.
- Mayo: 44 pagadas / 0 pendientes.
- Junio: 2 pagadas / 42 pendientes.
- P1/P2 PDF/Excel/reportKit/copy permanecen backlog y no reabren Corte 3.

## 5. Backend canónico e HR viva — estado previo R16E
Inventario read-only `cxorbia-backend-dev`:
- Auth users 17;
- clients 3;
- projects 29;
- visits 619;
- questionnaires 557;
- shoppers 215;
- liquidations 255;
- postulations 3;
- applications 1;
- notifications 20;
- shopperBenefits 572;
- certifications 0.

Reconciliación incremental:
- faltan julio 2026 GT+HN = 44 visitas en materialización period-country previa;
- exceso abril: `sprint5-visit-mutation-no-real-data`;
- exceso junio HN: `hr-58fb469666080189`, sourceRow 12; HR viva actual solo rows 2..11;
- pilotos `julio-pilot`, `r1`, `tya-piloto` se preservan; sin delete automático.

HR viva actual:
- 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper protegidas;
- julio GT34/HN10 correcto;
- `AGOSTO 26 HN` permanece HOLD: 34 filas de pestaña HN tienen País=GT.

## 6. Plan canónico source-safe
Refresh offline PASS, provider calls=0/writes=0:
- plan base `phasea_2f71daec3e68dfa1`;
- overlay `r16d_f471a6b486f3a269b0dd`;
- 1,415 operaciones;
- 1 tenant / 1 proyecto padre `cinepolis` / 14 periodos / 210 shoppers / 616 visitas / 572 liquidaciones;
- 0 certificaciones / 0 pagos.

Modelo: **proyecto padre `cinepolis` → periodos → visitas**.

## 7. R16E provider compare — PASS WITH REVIEW
Autorización ejecutada: `Autorizo R16E read-only provider compare contra cxorbia-backend-dev, sin writes, deploy ni producción.`

Evidencia:
- run `29282169628`, job `90741969389`: SUCCESS;
- artifact `8743659430`;
- digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`;
- decisión `PASS_WITH_REVIEW_CANONICAL_MATERIALIZATION_DRY_RUN_R16`;
- plan `r16d_f471a6b486f3a269b0dd`, 1,415 operaciones.

Clasificación por path canónico:
- create 1,414;
- update 1 (tenant: `configurable`, `name`, `schemaVersion`);
- noop 0;
- record-review 0;
- extras existentes preservados 244 = 29 project docs + 215 shopper docs;
- deletes 0.

### Interpretación obligatoria
`create=1414` **no significa backend vacío**. Significa que la topología canónica nueva prácticamente no existe bajo esos paths, mientras la información TyA actual vive en la topología DEV previa/otros IDs y colecciones. Por ello R16E es insumo para R17, **no autorización para ejecutar 1,415 writes a ciegas**.

Colas source-safe preservadas:
- source review total 265;
- shopper gap: 213 histórico / 210 live del plan;
- finanzas 247 filas, 196 enlaces exactos, 51 review, cola total 92;
- certificaciones: 213 candidatos, 0 registros materializables de fuente.

Seguridad R16E: provider reads sí; Firestore/Auth/Storage/HR writes=0; deletes/imports/deploys=0; producción/merge=false; PII/raw provider/credenciales persistidas=no.

## 8. Shoppers/certificaciones
- 215 shoppers ya existen: no recrear por rutina.
- HR protege 236 referencias: no inferir faltantes sin llave estable.
- certifications=0: refresh legacy dirigido obligatorio.
- Prompt preparado: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 9. Gate vivo único
`R17 WRITE PLAN EXACTO SIN EJECUTAR → REFRESH LEGACY SHOPPERS/CERTS → DRY-RUN DELTA/IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → SMOKE CX.data CANÓNICO → CORTES 6–8 → CUTOVER HOSTING PÚBLICO ACTUAL`.

R17 debe distinguir explícitamente:
- topología canónica a crear;
- materialización DEV previa a preservar/reutilizar;
- extras/pilotos que no se borran;
- reviews excluidos;
- cero ejecución hasta autorización de writes exactos.

No nueva base, nueva candidata, PowerShell ni deploy por este gate.

## 10. Claude/prototipo y Academia
- Claude: no P0 nuevo; no nueva candidata; preservar fixes core/entrypoint.
- Academia: documentar que path canónico ausente no equivale a backend vacío y que compare/read no equivale a autorización de materialización.
- Reusable CXOrbia: inventario → provider compare → write plan → dry-run/idempotencia → write autorizado.
