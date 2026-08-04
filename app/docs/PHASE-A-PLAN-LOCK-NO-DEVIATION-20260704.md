# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `CLIENT_RUNTIME_ROUTE_WAIT_FAIL__ROLLBACK_EXACT__LIFECYCLE_ROOT_CAUSE_PROVEN__CLOUD_V6_NOT_AUDITED_LANE_BLOCKED__NO_PRODUCTION`

## 1. Objetivo

Cerrar Phase A sobre una única baseline acumulativa, preservar todo lo aprobado y llegar a producción únicamente después de gates técnicos, runtime y validación humana.

Baseline:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV canónico `cxorbia-backend-dev`;
- producción `tya-plataforma`, intacta hasta cutover autorizado.

## 2. Autoridades alcanzadas

- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- source/static acumulativo 53/53 PASS;
- M1/Corte 1, Corte 2A/V174 y Corte 3/V182 preservados;
- autoridad HR viva conocida: 15 periodos, 660 visitas y 209 shoppers;
- Finanzas y Reservas canónicas preservadas.

## 3. Runtime Cliente posterior al route fix

Solicitud consumida una sola vez:

`c6-client-access-repair-runtime-20260804-routefix-01`.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa interna:

`client_route_wait`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado final seguro:

- membership temporal eliminado;
- claims finales sin cambio;
- usuarios y password changes: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- merge/producción: 0.

## 4. Causa raíz vigente

El helper de login considera listo el acceso con Auth, HR y `#app.on`, pero `CX.app.enter()` activa `#app.on` antes de `CX.router.mount()`. El mount puede quedar detrás del gate de confidencialidad. El gate esperaba después ruta, nav activa, encabezado y texto en una sola condición.

La corrección debe resolver el ciclo de vida, no aumentar el timeout ni repetir el runtime:

1. `AUTH_READY` separado de `SHELL_READY`;
2. router/rail materializados antes de navegar;
3. confidencialidad pendiente observable;
4. snapshot completo en timeout;
5. ruta/render y highlight separados;
6. gate local/estático sin credenciales;
7. detenerse antes de otro runtime.

## 5. Cloud V6

Recibido:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

La auditoría y el empalme no pueden comenzar hasta tener, en la misma sesión, ZIP extraído, checkout autenticado y rama viva. El conector no sustituye ese carril ni permite un empalme fragmentado.

V6 se evaluará como composición acumulativa única. Nunca se aplicará solo el Login ni módulos aislados.

## 6. Secuencia obligatoria actual

```text
SOURCE-ONLY CLIENT SHELL READINESS ROOT FIX
→ PASS LOCAL/ESTÁTICO DE CICLO DE VIDA
→ EXECUTION_LANE_READY CON CHECKOUT AUTENTICADO
→ AUDITORÍA FOCAL ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO Y SIN P0
→ GATES ACUMULATIVOS
→ DEV ÚNICO SOLO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO / DISPONIBLES / POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 7. Prohibiciones

- no reintento runtime con autorización consumida;
- no aumentar timeout como sustituto de causa raíz;
- no candidata, rama, PR, shell o Firebase paralelos;
- no auditoría de V6 sin `EXECUTION_LANE_READY`;
- no empalme por conectores archivo por archivo;
- no aprobación fragmentada;
- no usuario Cliente nuevo;
- no JWT Emergent;
- no conteos o meses congelados;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 8. Clasificación

- **Reusable CXOrbia:** readiness por capas y composición acumulativa.
- **Exclusivo cliente:** membership TyA/Cinépolis.
- **Cloud/prototipo:** V6 pendiente de carril y auditoría.
- **Academia:** ciclo de vida Auth/shell/ruta/render.
- **Sin impacto frontend:** `app/` no cambió en el runtime.
