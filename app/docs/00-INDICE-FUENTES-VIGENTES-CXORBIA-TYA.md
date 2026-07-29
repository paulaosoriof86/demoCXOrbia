# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__CORTE4_SANDBOX_TECHNICAL_LEARNINGS_PRESERVED__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_READONLY_INVENTORY_ACTIVE__NO_DATA_WRITES`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y data writes reales: 0.

## 2. Orden de lectura vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras vigentes;
4. addendum de empalme directo/carril file-aware;
5. addenda de Academia, patrones y antidesvío;
6. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
7. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
8. evidencia `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md` cuando termine/refresque;
9. CAMBIOS/RESUMEN-PARA-CLAUDE/PENDIENTES/Academia vigentes;
10. baseline/freeze Corte 3;
11. PR #7 y HEAD vivo.

La corrección de arquitectura de este índice prevalece sobre documentos recientes que llamen a `cxorbia-backend-dev` “base anterior excluida”.

## 3. Distinción obligatoria de sistemas

### Legacy TyA Consultores — plataforma actual a retirar
- Es la plataforma operativa anterior con parches/fixes.
- Es el origen del que solo se recuperan datos útiles y limpios.
- No se copia su arquitectura, código, dashboard, parches ni lógica defectuosa.
- Refresh pendiente: shoppers y certificaciones nuevas/actualizadas; visitas siguen HR como fuente principal.

### `cxorbia-backend-dev` — backend DEV canónico de CXOrbia / tenant TyA
- Es el backend nuevo de CXOrbia que se venía construyendo desde junio.
- TyA es el primer tenant real.
- **No es la base legacy a excluir.**
- Debe inventariarse read-only antes de decidir cualquier materialización adicional.

### `cxorbia-tya-dev-260729-c4` — sandbox técnico Corte 4
- Se creó por una interpretación incorrecta de “base vieja”.
- Sus pruebas fueron útiles para descubrir/corregir VIS-01/VIS-02/VIS-02B.
- No es destino de materialización Phase A.
- No se replica allí el tenant TyA existente.

### Hosting público TyA
- La dirección pública actual de los shoppers se conserva para el cutover final.
- Se reemplazará la app legacy por CXOrbia cuando Phase A y gates de producción estén completos.
- No se asume la identidad del proyecto Firebase dueño de ese Hosting hasta verificarla antes del cutover.

## 4. Corte 3 — congelado
- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 5. Aprendizajes técnicos preservados del sandbox Corte 4
- no fallback demo/localStorage;
- backend vacío first-class;
- null-safety proyecto/período;
- role-switch limpia DOM;
- entrypoint sin scripts huérfanos;
- gate anti-dangling-script;
- remote diagnostic final PASS, 0 pageerrors y 0/0/0/0.

Estos resultados se preservan, pero ya no implican materializar TyA en `cxorbia-tya-dev-260729-c4`.

## 6. Inventario canónico read-only
Se inició inventario provider read-only sobre `cxorbia-backend-dev` con:
- provider writes=0;
- sin exportar valores sensibles;
- Auth y árbol Firestore solo para conteos/esquema;
- evidencia durable en `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.

Primer resultado ya comprobó:
- projectId `cxorbia-backend-dev`;
- Auth users=17;
- root `tenants` existe;
- el inventario debe recorrer subcolecciones antes de cerrar conclusiones.

## 7. Gate vivo único
`COMPLETAR INVENTARIO READ-ONLY RECURSIVO DE cxorbia-backend-dev → REUTILIZAR LO YA EXISTENTE → REFRESH LEGACY SOLO SHOPPERS/CERTIFICACIONES → CONTINUAR PHASE A DESDE FALTANTE REAL → PREPROD/CUTOVER EN HOSTING PÚBLICO ACTUAL`.

No nueva base, no nueva candidata, no PowerShell, no materialización duplicada.

## 8. Claude/prototipo y Academia
- Claude: no nueva candidata por esta corrección; preservar fixes core/entrypoint.
- Academia: documentar diferencia entre legacy/origen, backend canónico, sandbox y Hosting/cutover.
- Reusable CXOrbia: sí; migración incremental y sandbox no equivalen a backend destino.
