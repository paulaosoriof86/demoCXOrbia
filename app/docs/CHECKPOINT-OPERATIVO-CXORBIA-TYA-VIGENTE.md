# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE__A_PLUS_B_SCOPE_LOCKED__TARGET_SHAS_AND_DELTA_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión prevalente

Se reconstruye una única candidata acumulativa. El primer checkpoint queda limitado a Base + CRM Ops Leads. No se permiten diagnósticos C6 aislados, shells paralelos, nuevas candidatas ni expansión a módulos posteriores sin dependencia P0 demostrada.

Fuentes vivas:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-A-B-SCOPE-LOCK-OVERLAYS-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

## 2. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD de arranque: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Contrato Familia A: `92651f41acc423841d909487558d68be5d10b2b6`.
- Inventario Familia B: `06fbfac28a1971d229ab121778ee6babdd1fd904`.
- Matriz A+B: `cbc1e6cecbb29bbc9f139074e3073d8fa5662b31`.
- Scope lock A+B: `94c440a06212dd194c34b43df00197d5d56c6024`.
- Índice actualizado: `f2af97dd5485f5566d6b9b7f1b22b9667ed28832`.
- Producción `tya-plataforma`: intacta.
- Agosto 2026 todavía no existe en HR.

## 3. Causa raíz confirmada

El runtime tenía múltiples autoridades superpuestas:

- demo/localStorage;
- HR source-safe;
- Firestore protegido;
- read guards;
- read model;
- semántica canónica;
- bridges que modifican métodos o DOM;
- módulos UI.

Un módulo fuente correcto podía verse mal porque una capa posterior cambiaba su estado o render. La reconstrucción fija precedencia antes de seleccionar SHAs.

## 4. Familia A — contrato técnico

- tenant `tya`;
- proyecto `cinepolis`;
- periodos `cinepolis-YYYY-MM`;
- HR viva gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- `CX.data` conserva su interfaz;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth, rol o scope;
- guards bloquean writes sin sustituir datos;
- bridges DOM no son autoridad final;
- build-lock V174 y caché se reemplazan al ensamblar.

## 5. Familia B — objetivo

- Dashboard: misma semántica para tiles, fases, comparativos y drilldowns.
- CRM Ops Leads: suite completa, sin fixtures aparentes en modo conectado.
- Hojas de Ruta: HR viva, proyecto/periodo correctos y acciones gateadas.
- Clientes: sin contactos, correos, prospectos o scores inventados.
- Comercial: contrato financiero por proyecto, Cinépolis delegado/regalía 0.
- Marketing: sin fechas/métricas ficticias ni Gemini/Make aparentes.

## 6. Scope lock confirmado

Archivos inspeccionados y diferidos:

- `operacion-extra.js` → Familia D, preservar sin cambios;
- `cliente-extra.js` → Familias F/G, preservar sin cambios;
- `cliente-insights.js` → Familia F, reconciliar después.

No se abren ahora:

- experiencia Shopper;
- Portal Cliente;
- reportes/exportaciones;
- Insights/Benchmark;
- Finanzas completa;
- Academia;
- integraciones.

Overlays que sí afectan A+B:

- domain consistency bridge;
- unified human runtime;
- read guards/normalizadores;
- tenant/proyecto/periodo;
- build-lock/SW.

## 7. PASS técnicos preservados

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente `tya/cinepolis`;
- modelo financiero delegado;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

No equivalen a aprobación visual.

## 8. Checkpoint Visual 1

Paula revisará en un solo build:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza al Checkpoint 2 sin esa validación.

## 9. Pendiente real inmediato

1. recuperar aprobaciones y commits históricos A+B;
2. fijar SHA objetivo por archivo;
3. producir delta completo focalizado;
4. crear gates source-only de interfaz, autoridad, fixtures, semántica, finanzas e integraciones;
5. ejecutar gates;
6. solicitar un único deploy DEV para Checkpoint Visual 1.

## 10. Siguiente bloque exacto

`PROVENIENCIA/APROBACIONES A+B → SHAS OBJETIVO → DELTA Y GATES SOURCE-ONLY`.

## 11. Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- merge: false;
- producción: false.
