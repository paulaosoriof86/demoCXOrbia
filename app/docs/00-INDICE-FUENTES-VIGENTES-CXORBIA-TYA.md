# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__A_PLUS_B_SCOPE_LOCKED__TARGET_SHAS_AND_DELTA_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock de continuidad prevalente

La prioridad vigente es reconstruir una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuentes operativas principales:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-A-B-SCOPE-LOCK-OVERLAYS-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

Hasta cerrar la composición A+B quedan suspendidos nuevos diagnósticos C6 aislados, deploys, shells reducidos, candidatas paralelas y correcciones de síntomas que no pertenezcan al primer checkpoint acumulativo.

Ninguna familia se declara funcionalmente aprobada por PASS técnico. Paula debe validarla visualmente sobre el build acumulativo exacto correspondiente.

## 1. Repositorio y destinos

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Contrato Familia A: `92651f41acc423841d909487558d68be5d10b2b6`.
- Inventario Familia B: `06fbfac28a1971d229ab121778ee6babdd1fd904`.
- Matriz A+B: `cbc1e6cecbb29bbc9f139074e3073d8fa5662b31`.
- Scope lock A+B: `94c440a06212dd194c34b43df00197d5d56c6024`.
- CAMBIOS scope lock: `39c2e4a62508a07aa9b3a7d1698c7b5b816ea9e6`.
- Hosting DEV existente: `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes maestras obligatorias

1. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
2. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
3. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
4. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-A-B-SCOPE-LOCK-OVERLAYS-20260802.md`;
5. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
6. reglas maestras y addenda activos;
7. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
9. addenda CAMBIOS de reconstrucción A+B;
10. addenda C6 de Shopper/Finanzas/STOP_RETRY como evidencia histórica preservada;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. `ACADEMIA-IMPACTO-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-20260802.md`;
14. PR #7 y HEAD vivo.

## 3. PASS técnicos preservados

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente scope `tya/cinepolis`;
- `tya::cinepolis` delegado;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones;
- producción intacta.

Estos PASS no equivalen a aprobación visual acumulativa.

## 4. Contrato técnico Familia A

`SHELL/INTERFAZ CX.DATA → TENANT/PROYECTO → HR VIVA → READ MODEL → SEMÁNTICA CANÓNICA → AUTH/OVERLAYS EXACTOS → FINANZAS → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

- tenant `tya`;
- proyecto `cinepolis`;
- periodos `cinepolis-YYYY-MM`;
- HR gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth ni scope;
- bridges DOM no pueden ser autoridad final;
- build-lock V174 y caché se sustituyen con la candidata final.

## 5. Familia B — composición objetivo

- Dashboard: misma semántica para tiles, fases, comparativos y drilldowns.
- CRM Ops Leads: suite completa; pending-source honesto sin backend CRM real.
- Clientes: sin contactos, correos, prospectos o scores inventados.
- Comercial: contrato financiero por proyecto; Cinépolis delegado, regalía 0.
- Marketing: sin contenido/métricas ficticias ni Gemini/Make aparentes.
- Hojas de Ruta: HR viva y acciones gateadas.

## 6. Scope lock A+B

Dentro del primer checkpoint:

- `operacion-extra.js` queda en Familia D y no se modifica;
- `cliente-extra.js` queda en Familias F/G y no se modifica;
- `cliente-insights.js` queda en Familia F y no se modifica;
- Portal Cliente, reportes, Insights, Shopper, Finanzas completa y Academia quedan diferidos;
- solo una dependencia transversal P0 demostrada permite tocar un módulo posterior.

Overlays que sí afectan A+B:

- `tya-c6-domain-consistency-bridge.js`;
- `tya-c6-unified-human-runtime-v1.js`;
- read guards/normalizadores;
- configuración tenant/proyecto/periodo;
- build-lock/service worker.

## 7. Checkpoint Visual 1

Paula revisará sobre un solo build:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza al Checkpoint 2 sin validación visual del build exacto.

## 8. Secuencia vigente

`PROVENIENCIA/APROBACIONES A+B → SHAS OBJETIVO → DELTA ACUMULATIVO FOCALIZADO → GATES SOURCE-ONLY → ÚNICO DEV → CHECKPOINT VISUAL 1 → CORRECCIÓN SOBRE MISMA CANDIDATA`.

## 9. Gate inmediato

`RECUPERAR APROBACIONES Y COMMITS A+B → DEFINIR SHAS OBJETIVO → PREPARAR DELTA Y GATES SOURCE-ONLY`.

## 10. Estado seguro

- cambios funcionales: 0;
- Hosting DEV: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- merge: false;
- producción: false.
