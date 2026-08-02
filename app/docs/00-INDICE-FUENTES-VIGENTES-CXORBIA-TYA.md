# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__FAMILY_A_TECHNICAL_CONTRACT_DEFINED__VISUAL_A_PLUS_B_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock de continuidad prevalente

La prioridad vigente es reconstruir una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuentes operativas principales:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

Hasta cerrar la composición A+B quedan suspendidos nuevos diagnósticos C6 aislados, deploys, shells reducidos, candidatas paralelas y correcciones de síntomas que no pertenezcan a la candidata acumulativa.

Ninguna familia se declara funcionalmente aprobada por PASS técnico. Paula debe validarla visualmente sobre el build acumulativo exacto correspondiente.

## 1. Repositorio y destinos

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Matriz maestra: commit `cbf777bbbd9d3172323db18d5b6f854c3e5ab8ff`.
- Familia A shell/runtime: commit `3fa660673c8331062e99df176b8aa2f570354149`.
- Protocolo visual acumulativo: commit `a8bc2251641754251ab573c92ca4973a5dc49575`.
- Contrato y precedencia Familia A: commit `92651f41acc423841d909487558d68be5d10b2b6`.
- CAMBIOS de precedencia Familia A: commit `d4a208870652524499e4e578d843084fc8f83d50`.
- Hosting DEV existente: `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes maestras obligatorias

1. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
2. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
3. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
4. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
5. reglas maestras y addenda activos;
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
8. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md` como historial técnico preservado, subordinado al lock de reconstrucción;
9. `CAMBIOS-BACKEND-ADDENDUM-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-INICIO-20260802.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
11. `CAMBIOS-BACKEND-ADDENDUM-FAMILIA-A-CONTRATO-PRECEDENCIA-20260802.md`;
12. addenda C6 de Shopper/Finanzas/STOP_RETRY como evidencia histórica preservada;
13. `RESUMEN-PARA-CLAUDE.md`;
14. `PENDIENTES-PROTOTIPO.md`;
15. `ACADEMIA-IMPACTO-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-20260802.md`;
16. PR #7 y HEAD vivo.

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
- `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`;
- `firebase.json`, `firebase.deploy.json`, `.firebaserc`.

Estas fuentes conservan fixes demostrados, pero no sustituyen la matriz módulo por módulo ni la aprobación visual.

## 4. Evidencia C6 preservada

- `CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
- `CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
- `CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`;
- `CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

## 5. PASS remoto que no debe perderse

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff remoto PASS con tres recargas y nueva pestaña;
- Shopper remoto PASS con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente remoto PASS con scope exclusivo `cinepolis`, tres recargas y nueva pestaña;
- producción intacta.

Estos PASS son técnicos y deben preservarse. No equivalen por sí solos a aprobación visual acumulativa.

## 6. Modelo financiero remoto prevalente

Llave técnica `tya::cinepolis`:

- modelo delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- valores no inventados;
- honorario Shopper no usado como ingreso.

Diagnóstico remoto:

- 14 delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías.

La causa de precedencia financiera queda cerrada remotamente y debe preservarse durante la reconstrucción.

## 7. Contrato técnico Familia A definido

Precedencia obligatoria:

`SHELL/INTERFAZ CX.DATA → TENANT/PROYECTO CONFIGURADO → HR VIVA → READ MODEL ACUMULATIVO → SEMÁNTICA CANÓNICA → AUTH/CLAIMS Y OVERLAYS EXACTOS → CONFIGURACIÓN FINANCIERA → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

Decisiones centrales:

- tenant operativo `tya`, no marca ni ID local;
- proyecto `cinepolis` separado de periodos `cinepolis-YYYY-MM`;
- HR gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- read model + canonical semantics gobiernan estados/KPIs;
- guards bloquean writes sin cambiar la verdad canónica;
- bridges DOM no pueden quedar como única autoridad;
- `build-lock.js` V174 y `sw.js` deben recibir identidad de la candidata final.

## 8. Hallazgos que deben reconciliarse

- `app/core/config.js` mezcla marca/tenant local con runtime conectado;
- `backend-firebase.js` y read guards tienen normalizadores que pueden inventar defaults;
- `backend-cxdata-readonly-corte4.js` conserva carriles antiguos source-safe/empty;
- `backend-protected-dev-mode.js` redefine métodos Shopper;
- `tya-c6-domain-consistency-bridge.js` modifica `CX.data`, Dashboard y Finanzas desde un overlay;
- `tya-live-source-inplace-apply.js` conserva defaults directo/ISR5/regalía10;
- `sw.js` usa un build ID todavía V174.

## 9. Validación visual acumulativa obligatoria

Checkpoints sobre una sola candidata y un solo linaje:

1. A+B: shell/runtime + CRM Ops Leads, Dashboard y hoja de ruta.
2. +C+D: operación, histórico y experiencia Shopper.
3. +E+F: Finanzas, portales y reportes.
4. +G: administración, Academia y revisión acumulativa final.

Paula revisa los módulos uno por uno dentro del mismo build. Cada build posterior ejecuta smoke visual antirretroceso de lo ya aprobado.

## 10. Secuencia vigente

`PROVENIENCIA HISTÓRICA RESTANTE FAMILIA A → INVENTARIO FAMILIA B → COMPOSICIÓN OBJETIVO A+B → DELTA COMPLETO → GATES SOURCE-ONLY → ÚNICO DEV → CHECKPOINT VISUAL 1 → CORRECCIÓN SOBRE MISMA CANDIDATA → SIGUIENTES CHECKPOINTS → FREEZE → CUTOVER`.

## 11. Gate inmediato

Source-only, sin deploy:

`RECUPERAR APROBACIONES/COMMITS RESTANTES DE FAMILIA A → INVENTARIAR CRM OPS LEADS/DASHBOARD/HOJA DE RUTA → DEFINIR SHA OBJETIVO Y DEPENDENCIAS A+B`.

## 12. Estado seguro

- cambios funcionales: 0;
- Hosting DEV durante reconstrucción: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.
