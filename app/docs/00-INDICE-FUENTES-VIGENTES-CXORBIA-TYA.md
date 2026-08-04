# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `SOURCE_STATIC_PASS__FINAL_RUNTIME_RETRY_CONSUMED_FAIL__CLIENT_PORTAL_ROUTE_ASSERTION__ROLLBACK_EXACT__CLOUD_V5_HOLD__NO_PRODUCTION`

## 0. Lock prevalente

La única baseline válida continúa sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

No crear candidata, shell, rama, PR, Firebase, Hosting o metodología paralela. Producción `tya-plataforma` permanece intacta.

## 1. Leer primero y en este orden

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-CLIENT-ACCESS-RUNTIME-20260804.md`;
3. `app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`;
4. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. `AUDITORIA-FOCAL-CLOUD-LOGIN-PORTABLE-V5-20260804.md`;
6. `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`;
7. `ACADEMIA-IMPACTO-CLOUD-V5-Y-CLIENT-RUNTIME-20260804.md`;
8. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
9. `COMPARACION-SHAS-PHASE-A-BLOQUE4-AUTORIDADES-Y-COMPOSICION-20260804.md`;
10. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. reglas maestras/addenda activos;
14. PR #7 y HEAD vivo.

Fuentes superseded solo para trazabilidad:

- `MANIFEST-PHASE-A-COMPLETA-INVENTARIO-VIVO-20260803.json`;
- `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 FROZEN/APROBADO;
- Corte 2A/V174 FROZEN/APROBADO;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE`;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- gate source/static PASS con 53/53 blobs críticos;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 3. Autoridad HR viva

Última ejecución:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido usar `616` o `2026-07` como invariantes runtime.

## 4. Reejecución final Cliente

Solicitud consumida:

- `c6-client-access-repair-runtime-20260804-final-01`;
- autorización commit `a6a7f984aae362d465e6070660f480217511e1e1`;
- evidencia commit `56c71b796d58cf0429d87bc09d226b725c6d20ff`.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Fallo:

`client_assertions → CLIENT_PORTAL_INVALID`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado proveedor restaurado; membership temporal eliminado; claims finales sin cambio; usuarios nuevos y cambios de contraseña en cero.

## 5. Causa raíz vigente

El gate no navega explícitamente a `cli_dashboard` después del login Cliente. Aun así exige copy de Panorama en la vista actual mediante una aserción compuesta.

Las etapas anteriores ya probaron:

- módulo `cli_dashboard` cargado;
- acceso Cliente autenticado;
- contexto y HR con paridad;
- estado no bloqueado.

Pendiente source-only:

- navegación explícita a `cli_dashboard`;
- espera de render;
- selector/marker estable;
- evidencia separada de `clientModule`, `route`, `panorama` y `blocked`;
- gate local/estático antes de solicitar otra ejecución DEV.

## 6. Cloud V5/V6

V5:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

No aplicar V5. La fuente frontend vigente es:

`PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`.

## 7. Overlay superseded controlado

`app/adapters/tya-ab-cumulative-composition-v1.js`

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No retirar sin gate de no pérdida.

## 8. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No hubo deploy nuevo.

## 9. Siguiente bloque exacto

```text
SOURCE-ONLY ROOT FIX DEL GATE CLIENTE
→ NAVEGACIÓN EXPLÍCITA A cli_dashboard
→ EVIDENCIA BOOLEANA SEPARADA
→ GATE LOCAL/ESTÁTICO SIN PROVIDER WRITES
→ DETENERSE PARA NUEVA AUTORIZACIÓN
```

En paralelo:

```text
CLOUD V6 FRONTEND ACUMULATIVA
→ AUDITORÍA FOCAL DELTA
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 10. Estado seguro

- cambios funcionales `app/`: 0;
- estado proveedor restaurado: sí;
- deploy nuevo: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
