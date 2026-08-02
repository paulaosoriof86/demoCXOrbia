# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__FAMILY_A_CONTRACT_DEFINED__FAMILY_B_INVENTORY_ACTIVE__VISUAL_A_PLUS_B_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock de continuidad prevalente

La prioridad vigente es reconstruir una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuentes operativas principales:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

Hasta cerrar la composición A+B quedan suspendidos nuevos diagnósticos C6 aislados, deploys, shells reducidos, candidatas paralelas y correcciones de síntomas que no pertenezcan a la candidata acumulativa.

Ninguna familia se declara funcionalmente aprobada por PASS técnico. Paula debe validarla visualmente sobre el build acumulativo exacto correspondiente.

## 1. Repositorio y destinos

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Contrato y precedencia Familia A: commit `92651f41acc423841d909487558d68be5d10b2b6`.
- Checkpoint actualizado a Familia A: commit `6f5c11d3a6f39b6d5f9d598877e65ecfd7be329b`.
- Inventario inicial Familia B: commit `06fbfac28a1971d229ab121778ee6babdd1fd904`.
- CAMBIOS Familia B: commit `57a04134836d210ee11dc97bb9f9b989a7f226eb`.
- Hosting DEV existente: `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes maestras obligatorias

1. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
2. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
3. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
4. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
5. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
6. reglas maestras y addenda activos;
7. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-FAMILIA-A-CONTRATO-PRECEDENCIA-20260802.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-FAMILIA-B-INVENTARIO-CRM-OPS-LEADS-20260802.md`;
11. addenda C6 de Shopper/Finanzas/STOP_RETRY como evidencia histórica preservada;
12. `RESUMEN-PARA-CLAUDE.md`;
13. `PENDIENTES-PROTOTIPO.md`;
14. `ACADEMIA-IMPACTO-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-20260802.md`;
15. PR #7 y HEAD vivo.

## 3. Fuentes técnicas preservadas

- `app/core/data.js` como interfaz base de `CX.data`;
- `app/core/store.js` como bus/continuidad UI, no autoridad de Auth;
- `app/core/router.js` como resolver único de navegación;
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`;
- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`;
- `tools/qa/tya-c6-finance-root-fix-gate.mjs`;
- `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`;
- `firebase.json`, `firebase.deploy.json`, `.firebaserc`.

## 4. PASS técnicos preservados

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta, `ownVisits=1`;
- Cliente scope `tya/cinepolis`;
- `tya::cinepolis` delegado;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar, 0 violaciones;
- producción intacta.

Estos PASS no equivalen a aprobación visual acumulativa.

## 5. Contrato técnico Familia A

Precedencia obligatoria:

`SHELL/INTERFAZ CX.DATA → TENANT/PROYECTO → HR VIVA → READ MODEL → SEMÁNTICA CANÓNICA → AUTH/OVERLAYS EXACTOS → FINANZAS → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

Decisiones:

- tenant `tya`, proyecto `cinepolis`, periodos `cinepolis-YYYY-MM`;
- HR gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth ni scope;
- bridges DOM no pueden ser autoridad final;
- build-lock V174 y caché deben sustituirse con la candidata final.

## 6. Inventario inicial Familia B

### Dashboard

- UI y drilldowns valiosos;
- tiles usan `visitBucketFns`;
- fases/comparativos aún mezclan semántica legacy y overlays posteriores;
- requiere reconciliación directa con read model/canonical semantics.

### CRM Ops Leads

- experiencia amplia: pipeline, leads, cuentas, contactos, actividades, ficha 360, metas y reportes;
- store en memoria/localStorage;
- fuera de demo no existe aún fuente CRM real;
- preservar UI y mostrar pending-source honesto, sin fixtures.

### Clientes

- deriva proyectos, pero también crea contactos/correos/prospectos sintéticos;
- requiere retirar semillas falsas en modo conectado y mantener relación Cliente→Proyecto por llaves estables.

### Comercial

- propuestas/localStorage y calculadora útiles;
- debe consumir contrato financiero por proyecto y fallar cerrado sin pricing exacto.

### Marketing

- contenido, mes y métricas ficticias;
- superficies Gemini/Make todavía no activadas;
- preservar UI, retirar autoridad demo y gatear integraciones.

### Hojas de Ruta

- preservar interfaz y HR viva;
- comprobar proyecto/periodo correcto;
- gatear IA/import/conexión y evitar promesas no activadas.

## 7. Validación visual acumulativa

Checkpoint Visual 1 sobre una sola candidata A+B:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza al Checkpoint 2 sin validación visual de Paula sobre ese mismo build.

## 8. Secuencia vigente

`PROVENIENCIA A RESTANTE → OVERLAYS/EXTRAS B → MATRIZ SHA A+B → DELTA COMPLETO → GATES SOURCE-ONLY → ÚNICO DEV → CHECKPOINT VISUAL 1 → CORRECCIÓN MISMA CANDIDATA → SIGUIENTES CHECKPOINTS → FREEZE → CUTOVER`.

## 9. Gate inmediato

`RECUPERAR APROBACIONES B → INSPECCIONAR OPERACION-EXTRA/CLIENTE-INSIGHTS/OVERLAYS → DEFINIR SHAS OBJETIVO A+B → PREPARAR DELTA Y GATES`.

## 10. Estado seguro

- cambios funcionales: 0;
- Hosting DEV: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- merge: false;
- producción: false.
