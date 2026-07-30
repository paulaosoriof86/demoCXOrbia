# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_READONLY_PASS_WITH_REVIEW__NO_DATA_WRITES__R17_WRITE_PLAN_PENDING`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos/provider writes: 0 en R16E.

## 2. Arquitectura vinculante
- Legacy TyA Consultores actual = plataforma a retirar; solo origen de datos útiles limpios.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia/tenant TyA; NO legacy.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico Corte 4; no destino de materialización.
- Hosting público actual TyA = conservar URL para cutover final, previa verificación técnica.

## 3. Corte 3 — FROZEN
Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas hasta julio; 34 GT + 10 HN por periodo.
- Mayo: 44 pagadas / 0 pendientes.
- Junio: 2 pagadas / 42 pendientes.
- P1/P2 de reportes/copy no reabren Corte 3.

## 4. Sandbox Corte 4
VIS-01/VIS-02/VIS-02B corregidos: fail-closed sin demo, backend vacío válido, null-safety, role-switch limpio, entrypoint sin asset huérfano. Remoto 0 pageerrors y visual Admin/Shopper vacío correcta.

No se materializa TyA en ese sandbox.

## 5. Backend canónico `cxorbia-backend-dev`
Inventario read-only PASS, sin PII/provider writes:
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

Materialización sustancial ya existe; reconstruir en otro Firebase sería reproceso.

## 6. Gap e HR viva
Reconciliación incremental PASS:
- faltan julio GT+HN en materialización period-country previa = 44 visitas;
- exceso abril: `sprint5-visit-mutation-no-real-data`;
- exceso junio HN: `hr-58fb469666080189`, sourceRow 12, inexistente en HR viva actual;
- pilotos `julio-pilot`, `r1`, `tya-piloto` preservados; sin deletes automáticos.

HR viva actual:
- 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper protegidas;
- julio GT34/HN10 correcto;
- `AGOSTO 26 HN` en HOLD: sus 34 filas dicen País=GT.

## 7. Plan canónico
Refresh offline PASS, provider calls=0/writes=0:
- base `phasea_2f71daec3e68dfa1`;
- overlay `r16d_f471a6b486f3a269b0dd`;
- 1,415 operaciones = tenant 1, proyecto padre `cinepolis` 1, HR import 1, periodos 14, shoppers 210, visitas 616, liquidaciones 572;
- certificaciones 0 / pagos 0.

Modelo aprobado: **proyecto padre `cinepolis` → periodos → visitas**.

## 8. R16E — EJECUTADO Y PASS WITH REVIEW
Autorización: `Autorizo R16E read-only provider compare contra cxorbia-backend-dev, sin writes, deploy ni producción.`

Evidencia:
- run `29282169628`;
- job `90741969389`: SUCCESS;
- artifact `8743659430`;
- digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`;
- decisión `PASS_WITH_REVIEW_CANONICAL_MATERIALIZATION_DRY_RUN_R16`;
- plan `r16d_f471a6b486f3a269b0dd`, 1,415 operaciones.

Clasificación:
- create 1,414;
- update 1;
- noop 0;
- record review 0;
- extras existentes preservados 244 = 29 project docs + 215 shopper docs;
- deletes 0.

Único update: tenant, campos `configurable`, `name`, `schemaVersion`.

### Lectura correcta del resultado
R16E compara por **paths canónicos**. Por eso 1,414 `create` no contradicen el inventario existente: la información actual vive principalmente en la topología DEV previa period-country/otros IDs. La base no está vacía.

Consecuencia: **no ejecutar 1,415 writes a ciegas**. R16E es insumo del paquete R17/write plan, no autorización de materialización.

Colas preservadas:
- source review 265;
- shopper 213 histórico / 210 live del plan;
- finanzas 247 filas, 196 exactos, 51 review, cola 92;
- certificaciones 213 candidatos / 0 registros materializables.

Safe state R16E:
- provider reads ejecutados;
- Firestore/Auth/Storage/HR writes 0;
- deletes/imports/deploys 0;
- producción/merge false;
- credenciales/raw provider/PII persistidos: no.

## 9. Shoppers/certificaciones
- 215 shoppers existentes: no recrear por rutina.
- 236 referencias protegidas en HR: diff por llave estable antes de concluir faltantes.
- certifications=0: refresh dirigido desde legacy para nuevas/actualizadas y presentadas/aprobadas/reprobadas.
- Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 10. Ruta a producción
`LEGACY TYA delta shoppers/certs + HR VIVA → cxorbia-backend-dev → write plan/delta idempotente → writes exactos autorizados → smoke CX.data/Auth/sync → preprod/rollback → cutover Hosting público actual`.

## 11. Gate real siguiente
`R17 WRITE PLAN EXACTO SIN EJECUTAR`.

Debe separar:
1. topología canónica realmente a crear;
2. materialización DEV previa a preservar/reutilizar;
3. extras/pilotos que no se borran;
4. review/noop fuera de writes;
5. refresh legacy shoppers/certificaciones;
6. dry-run/idempotencia antes de cualquier autorización de write.

No nueva base, nueva candidata, PowerShell, deploy ni producción.

## 12. Claude/Academia
- Claude: no P0 nuevo, no nueva candidata; preservar fixes core.
- Academia: path canónico ausente ≠ backend vacío; compare read-only ≠ write autorizado.
- Reusable CXOrbia: inventario → provider compare → write plan → dry-run/idempotencia → writes exactos autorizados.
