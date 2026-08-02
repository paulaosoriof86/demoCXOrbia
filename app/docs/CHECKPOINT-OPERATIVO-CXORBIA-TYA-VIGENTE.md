# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE__FAMILY_A_TECHNICAL_CONTRACT_DEFINED__A_PLUS_B_NEXT__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión prevalente

Se reconstruye una única candidata acumulativa con la mejor versión demostrable de cada módulo. No se ejecutarán diagnósticos C6 aislados, shells paralelos, nuevas candidatas ni correcciones sintomáticas fuera de la composición acumulativa.

Fuentes vivas principales:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-SHELL-RUNTIME.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

## 2. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Contrato Familia A documentado: `92651f41acc423841d909487558d68be5d10b2b6`.
- Índice vigente actualizado: `d5c39df0084890b5b50a8920e16cd74030eea8f2`.
- Producción `tya-plataforma`: intacta.
- Agosto 2026 todavía no existe en HR.

## 3. Causa raíz de las regresiones acumulativas

No existía una autoridad ejecutable por módulo ni una precedencia única entre:

- `CX.data` base;
- demo/localStorage;
- HR source-safe;
- Firestore protegido;
- read guards;
- read model;
- semántica canónica;
- bridges que modifican métodos o DOM;
- módulos UI.

Por eso un archivo aprobado podía quedar visualmente degradado por un overlay posterior sin que el source lock detectara la pérdida funcional.

## 4. Familia A — avance real

### Interfaz base

`app/core/data.js` permanece como contrato público de `CX.data`. Los adapters pueden hidratar y proteger la implementación, pero no reducir ni cambiar silenciosamente sus métodos, colecciones o semántica.

### Identidad canónica

- tenant: `tya`;
- proyecto: `cinepolis`;
- periodo: `cinepolis-YYYY-MM`;
- Proyecto y Periodo separados;
- marca visual no sustituye la llave técnica.

### Precedencia definida

`SHELL/INTERFAZ → TENANT/PROYECTO → HR VIVA → READ MODEL → SEMÁNTICA CANÓNICA → AUTH/OVERLAYS EXACTOS → FINANZAS → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

### Clasificaciones principales

- `app.js`: preservar V182 exacta;
- `layout.css`: preservar y validar visualmente;
- `config.js`: reconciliar tenant/marca/modo conectado;
- `data.js`: preservar interfaz, impedir autoridad demo en carril conectado;
- `store.js`: conservar bus/continuidad UI, no autoridad de Auth;
- `router.js`: preservar como navegación única con scopes autenticados;
- `backend-firebase.js`: reconciliar normalizadores para no inventar datos;
- read guards: solo compatibilidad/seguridad, no autoridad semántica;
- read model + canonical semantics: autoridad de composición/estados;
- domain consistency bridge: migrar lógica y retirar como autoridad DOM final;
- financial model contract: preservar precedencia `tya::cinepolis`;
- `build-lock.js`: reemplazar en ensamblaje;
- `sw.js`: conservar network-first y renovar cache ID con el build final.

## 5. PASS técnicos preservados

No reabrir sin regresión reproducible:

- HR: 14 periodos, 616 visitas, junio 2025–julio 2026;
- Staff, Shopper y Cliente con recargas/nueva pestaña estables;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente con scope `tya/cinepolis`;
- modelo financiero delegado;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

Estos PASS no sustituyen validación visual.

## 6. Validación visual vinculante

El primer build que revisará Paula será el Checkpoint Visual 1 acumulativo A+B:

- login, shell, tenant, proyecto, periodo, fuente y navegación;
- CRM Ops Leads;
- Dashboard;
- hoja de ruta;
- Clientes/Comercial/Marketing cuando sean dependencias;
- indicadores y drilldowns.

No se avanzará al Checkpoint 2 sin revisión visual de ese mismo build.

## 7. Pendiente real inmediato

1. recuperar aprobaciones/commits históricos restantes de Familia A;
2. inventariar Familia B módulo por módulo;
3. determinar SHAs objetivo y dependencias de A+B;
4. construir delta completo contra HEAD vivo;
5. crear gates de interfaz, precedencia, no-demo, semántica y caché;
6. ejecutar gates source-only;
7. solicitar autorización para un único Hosting DEV del Checkpoint Visual 1.

## 8. Criterio de salida A+B

- cero archivos/dependencias `UNKNOWN`;
- una sola autoridad de tenant/proyecto/periodo/fuente/semántica;
- un solo delta acumulativo;
- manifest y build-lock nuevos;
- service worker vinculado al mismo build ID;
- gates PASS;
- una sola URL DEV;
- validación visual de Paula módulo por módulo.

## 9. Siguiente bloque exacto

`PROVENIENCIA RESTANTE FAMILIA A → INVENTARIO CRM OPS LEADS/DASHBOARD/HOJA DE RUTA → MATRIZ A+B → DELTA Y GATES SOURCE-ONLY`.

## 10. Estado seguro

- cambios funcionales: 0;
- deploy durante reconstrucción: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- password changes/resets: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.
