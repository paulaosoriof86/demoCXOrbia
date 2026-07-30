# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-30

### Baseline / arquitectura
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 FROZEN: `CXORBIA-TYA-CORTE3-V182-20260729`; no V183/R33.
- `cxorbia-backend-dev` = backend DEV canónico; reutilizar.
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final.
- Sandbox C4 = no destino.
- No nueva base Firebase.

### R17N FINAL ya materializado
La autorización `r17n-final-dev-20260730-01` fue consumida.

- 1,406 Firestore writes exactos ejecutados;
- readback 1,406/1,406; mismatch 0;
- foundation16 + legacy profiles120 + HR-current profiles5 + certifications77 + visits616 + liquidation controls572;
- tenant update, updates22, holds7+1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción: excluidos.

### HR e identidad actual
- HR actual hasta julio: 14 periodos /616 visitas /208 refs shopper.
- Snapshot 210 refs quedó histórico.
- 208/208 refs ready: 201 existing +2 legacy-create +5 HR-current create.
- Las 208 refs resuelven a 194 perfiles canónicos únicos según mapping exacto; varias refs pueden converger determinísticamente al mismo perfil. No usar nombre como llave.
- Post-compare: 616/616 visitas tienen nombre real y shopper target existente; 194/194 perfiles referenciados tienen nombre real; 77/77 certificaciones tienen shopper existente; placeholders demo 0.

### Provider post-compare
Run `30514060348`:
- 1,406/1,406 rutas presentes;
- canonical parent `cinepolis` presente;
- periods 14;
- visits 616;
- liquidation controls 572;
- certifications 77;
- payments/lots 0;
- tenant sin update R17N.

La materialización y la identidad están correctas.

### P0 demostrado — NO ES frontend
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Archivo localizado: `app/core/backend-firebase.js`.

Causa:
- el adapter lee todos los documentos `tenants/tya/projects`;
- `buildPeriods()` convierte esos documentos de proyecto en periodos;
- no lee `tenants/tya/projects/cinepolis/periods`, que contiene los 14 periodos canónicos.

Smoke exacto:
- source Firestore: PASS;
- fallback demo: false;
- interfaz CX.data preservada;
- parent project `cinepolis`: PASS;
- visitas: 616 PASS;
- periodos: **30 observados vs 14 canónicos**;
- `currentPeriodId=cinepolis`, que no es uno de los 14 IDs de periodo.

### Claude NO debe
- crear candidata nueva;
- tocar módulos UI por este P0;
- reabrir V182/Corte 3;
- rehacer materialización;
- volver a 210 refs/9 pendientes;
- resolver periodos o identidad desde UI;
- deduplicar por nombre;
- crear nueva base;
- activar providers/pagos/imports desde UI.

### Próxima intervención Claude
Ninguna por rutina. El fix actual corresponde a backend/core y requiere autorización expresa de Paula. Solo si el smoke posterior demuestra un P0 frontend reproducible se genera tarea localizada para Claude.

Backlog P1/P2 preservado: PDF gráfica, Excel formato, reportKit, copy específico de fuentes.

### Siguiente bloque exacto backend
`AUTORIZACIÓN P0-C5-CXDATA-PERIOD-MODEL → PATCH BACKEND ADAPTER FOCALIZADO → RE-SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5 → CORTE 6 AUTH/RBAC`.

## Estado seguro
R17N previo: 1,406 Firestore writes autorizados ya ejecutados. Post-compare: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0; PII cruda repo/artifact=0.
