# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__CLIENT_ROUTE_SOURCE_STATIC_PASS__RUNTIME_RETRY_NOT_AUTHORIZED__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Carril vigente

Continuar únicamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- manifest final Phase A;
- árbol funcional `app/` preservado.

Producción `tya-plataforma` permanece intacta.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- 53/53 blobs críticos PASS;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 3. Autoridad HR dinámica

Última ejecución runtime observó:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido restaurar `616` o `2026-07` como invariantes runtime.

## 4. Última reejecución Cliente

Solicitud consumida:

- request `c6-client-access-repair-runtime-20260804-final-01`;
- commit de autorización `a6a7f984aae362d465e6070660f480217511e1e1`;
- commit de resultado `56c71b796d58cf0429d87bc09d226b725c6d20ff`.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado proveedor restaurado: membership temporal eliminado, claims sin cambio, usuarios/password changes en cero.

## 5. Causa raíz del gate Cliente — corregida

El gate iniciaba sesión como Cliente, pero no navegaba explícitamente a `cli_dashboard`. Después exigía una aserción compuesta dependiente de la vista inicial y de copy visible.

Correctivo source-only:

- `window.CX.router.nav('cli_dashboard')` explícito;
- espera de `CX.session.view === 'cli_dashboard'`;
- `#nav-cli_dashboard` activo;
- marker estable `#view .ph` y vista renderizada;
- evidencia separada de:
  - `clientModule`;
  - `route` / `routeId`;
  - `panorama`;
  - `blocked`;
- errores específicos por capa;
- eliminación de `CLIENT_PORTAL_INVALID` como aserción compuesta.

El orquestador ahora conserva `failedStageBeforeRollback`; el rollback ya no sobrescribe la etapa original.

## 6. Gate source/static focal — PASS

Ejecución:

- commit `5caca10137250d2a70308dd995262e368f981322`;
- run `30936681878`;
- job `92084479259`;
- decisión contractual `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno requerido `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0.

La solicitud estaba deshabilitada y solo activó el paso contractual:

- runtime ejecutado: no;
- Playwright instalado: no;
- credenciales preparadas: no;
- provider reads: 0;
- Auth/Firestore/membership writes: 0.

Fuente:

`CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-SOURCE-STATIC-20260804.md`.

## 7. Cloud V5/V6

V5 permanece:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

V6 debe incluir Login/órbita, responsive P1, PDF P1, Excel P2, Regional, copy delegado, Ficha Shopper y evidencia completa. Cloud continúa exclusivamente frontend.

## 8. Siguiente bloque exacto

El bloque source-only está cerrado y se detiene aquí, como fue autorizado.

Solo después de una nueva autorización expresa:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME STAFF/CLIENTE/SHOPPER
→ TRES RECARGAS Y NUEVA PESTAÑA
→ HR DINÁMICA
→ FINANZAS/PORTALES/RESERVAS
→ CONSERVAR SOLO CON PASS
→ ROLLBACK AUTOMÁTICO ANTE CUALQUIER FALLO
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL DELTA
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 9. Secuencia posterior

```text
RUNTIME MULTIROL AUTORIZADO
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 10. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads en este bloque: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run deploys: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 11. Clasificación

- **Reusable CXOrbia:** ruta explícita, marker estable, evidencia por capa y etapa original preservada.
- **Exclusivo cliente:** futura validación TyA/Cinépolis.
- **Cloud/prototipo:** V5 HOLD, V6 pendiente.
- **Academia:** separar módulo, ruta, render y copy.
- **Sin impacto Cloud:** este bloque no modifica frontend.
