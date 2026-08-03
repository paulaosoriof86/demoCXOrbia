# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `A_PLUS_B_SOURCE_ASSEMBLED__PRECHECK_PASS__EXACT_CHECKOUT_GATE_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock prevalente

La única línea autorizada es la candidata acumulativa viva sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

No crear nueva candidata, rama, PR, shell reducido, workflow transportador ni metodología. No avanzar a C+D antes del Checkpoint Visual 1.

## 1. Fuentes operativas principales

Leer en este orden:

1. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
2. `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`;
3. `EVIDENCE-A-B-CUMULATIVE-SOURCE-PRECHECK-20260802.json`;
4. `CAMBIOS-BACKEND-ADDENDUM-A-B-COMPOSICION-MANIFEST-GATES-20260802.md`;
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
6. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
7. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
8. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
9. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-A-B-SCOPE-LOCK-OVERLAYS-20260802.md`;
10. reglas maestras, addenda activos y `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. `ACADEMIA-IMPACTO-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-20260802.md`;
14. PR #7 y HEAD vivo.

## 2. Estado de la candidata A+B

### Fuente ensamblada

- adapter: `app/adapters/tya-ab-cumulative-composition-v1.js`;
- blob: `9c0d76382531b8393cc0866ec694935a2a5e25a6`;
- entrada DEV: `app/index-backend-dev.html`;
- blob: `b9a4aaf063d97305c3f4f53eba8f02b526d61761`;
- módulos frontend A+B reescritos: 0.

### Proveniencia

- M1/Corte 1 aprobado: build `67c0943260f076f5686284ac509458ed5fd34dbd`;
- Corte 2A/V174 no cambió módulos A+B;
- V182 frozen preservado en `app/app.js` y `app/styles/layout.css`;
- fixes C6 preservados como dependencias técnicas.

### Resultado funcional del adapter

- retira dos prospectos sintéticos conocidos;
- retira contactos placeholder sin proveniencia;
- oculta fixtures CRM y Marketing en conectado;
- preserva registros creados por usuario con `platform_user`;
- mantiene HR viva, `CX.data`, Auth y Finanzas canónica;
- no borra localStorage ni escribe proveedores.

## 3. Gates

- unit gate: `tools/qa/tya-ab-cumulative-composition-unit.mjs` — `PASS`, 23 verificaciones;
- source gate: `tools/qa/tya-ab-cumulative-candidate-source-gate.mjs` — listo, pendiente de checkout exacto;
- evidencia: `PASS_CONNECTOR_ASSISTED_PRECHECK_PENDING_EXACT_CHECKOUT_GATE_AND_VISUAL`.

No afirmar PASS integral hasta ejecutar el source gate sobre checkout exacto.

## 4. PASS técnicos preservados

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente `tya/cinepolis`;
- `tya::cinepolis` delegado;
- localBilling false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

Estos PASS no equivalen a aprobación visual A+B.

## 5. Scope del Checkpoint Visual 1

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

Diferidos sin cambios: Operación/Shopper, Finanzas completa, Portal Cliente/reportes/Insights, administración, integraciones y Academia.

## 6. Siguiente bloque exacto

`EXACT CHECKOUT A+B SOURCE GATE → STATIC/CUMULATIVE GATES → STOP_RETRY SI FALLA → SOLO SI PASS, AUTORIZACIÓN DE UN HOSTING DEV → CHECKPOINT VISUAL 1`.

## 7. Estado seguro

- Hosting DEV en este bloque: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
