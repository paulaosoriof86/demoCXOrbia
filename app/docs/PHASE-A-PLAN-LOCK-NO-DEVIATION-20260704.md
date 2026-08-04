# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `FORENSIC_CONTROL_PLANE_SOURCE_STATIC_PASS_LOCAL__CORE_OPERATIONS_SHOPPER_RELEASE_SLICE_DEFINED__CLOUD_V6_NOT_AUDITED__NO_PRODUCTION`

## 1. Objetivo

Poner en producción un primer corte realmente operativo sobre una sola baseline acumulativa, sin seguir permitiendo que el Portal Cliente bloquee Admin/Operaciones y Shopper.

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
- HR viva conocida: 15 periodos, 660 visitas y 209 shoppers;
- Finanzas y Reservas canónicas preservadas.

## 3. Diagnóstico sistémico

La causa principal de los HOLD repetidos fue un control plane fragmentado:

- browser gates duplicados;
- contratos de readiness distintos;
- condiciones compuestas;
- acceso y runtime mezclados;
- rollback excesivamente amplio;
- source lock móvil;
- gates estáticos por strings.

No corresponde otro runtime sobre la arquitectura anterior.

## 4. Arquitectura de validación vigente

### Estados

```text
AUTH_READY
→ CLAIMS_READY
→ MEMBERSHIP_READY
→ DATA_READY
→ SHELL_READY
→ ROUTE_READY
→ VIEW_READY
→ DOMAIN_READY
```

### Transacciones

```text
A. ACCESO/MEMBERSHIP
snapshot → apply → idempotencia → readback → rollback dry-run → PASS_ACCESS

B. RUNTIME READ-ONLY
HR viva → paridad → único browser gate multirol
```

### Fuente

```text
request copiada
→ sourceHeadSha exacto
→ checkout detached
→ gates
→ evidencia
→ consumo atómico de solicitud
```

## 5. Gate source-only

Resultado local determinista:

```text
PASS_FORENSIC_CONTROL_PLANE_STABILIZATION
PASS_C6_CLIENT_ROUTE_SOURCE_STATIC
```

Blockers 0, warnings 0, sin credenciales, navegador, provider reads/writes ni deploy.

La telemetría remota del runner no quedó expuesta de manera verificable; no se afirma PASS remoto.

## 6. Primer corte de producción

Release slice vinculante:

`ADMIN/OPERACIONES + SHOPPER`.

Requeridos:

- Hoja de Ruta viva e histórico;
- Dashboard Operativo;
- Visitas y Visitas Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación en el alcance habilitado;
- Finanzas Phase A;
- Mi Perfil, Mis Visitas, certificaciones, histórico y pagos visibles Shopper.

Portal Cliente:

- queda en paralelo;
- no bloquea el primer cutover;
- no puede presentarse como terminado sin gate independiente.

## 7. Pruebas dentro de la plataforma

Antes del cutover, el release slice debe pasar un laboratorio DEV inspirado únicamente en la práctica reusable de Finanzas:

- escenarios `AUDIT-*` realistas y temporales;
- ejecución a través de UI y contratos normales;
- sincronización entre módulos;
- diagnóstico por etapa;
- capturas y timeline;
- fingerprints antes/después;
- cleanup exacto;
- `baselineRestoredAfterCleanup=true`.

No se reutilizan datos ni lógica del dominio Finanzas.

## 8. Cloud V6

- ZIP recibido y extraído;
- SHA-256 `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- estado `NOT_AUDITED__EXECUTION_LANE_NOT_READY`;
- delta aplicado: 0.

V6 se audita como composición acumulativa única. Con GO y sin P0 se aplica directamente sobre la rama viva.

## 9. Secuencia obligatoria

```text
EXECUTION_LANE_READY
→ AUDITORÍA ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO SIN P0
→ SOURCE/STATIC
→ DEV ÚNICO SI CAMBIA app/
→ LABORATORIO CORE_OPERATIONS_ADMIN
→ LABORATORIO SHOPPER_FULL_CYCLE
→ CROSS_MODULE_CONSISTENCY
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL HUMANO
→ FREEZE DEL SLICE
→ CUTOVER ADMIN/OPERACIONES + SHOPPER
→ CLIENTE EN CARRIL PARALELO
```

## 10. Prohibiciones

- no volver a ejecutar gates browser duplicados;
- no usar `app.on` como shell listo;
- no inferir source lock por `HEAD^`;
- no revertir acceso validado por un fallo read-only posterior;
- no auditoría V6 sin `EXECUTION_LANE_READY`;
- no empalme fragmentado;
- no nueva rama/PR/candidata;
- no datos legacy crudos;
- no Make/Gemini/pagos sin bloque propio;
- no producción antes de gates, cleanup y validación humana.

## 11. P0 que sí bloquean el primer corte

- app no inicia;
- Admin/Operaciones o Shopper no autentican;
- HR viva inconsistente o ausente;
- ruta esencial inexistente;
- pérdida/corrupción/fuga cross-tenant;
- secreto o dato sensible expuesto;
- write/deploy no autorizado;
- flujo operativo Phase A imposible.

Portal Cliente pendiente, highlight tardío, PDF sin gráfica, Excel básico y responsive P1/P2 no bloquean por sí solos el primer corte.

## 12. Clasificación

- **Reusable CXOrbia:** control plane, state machine, escenario visible y cleanup.
- **Exclusivo cliente:** release slice TyA.
- **Cloud/prototipo:** V6 pendiente de auditoría y empalme acumulativo.
- **Academia:** laboratorio visible y trazabilidad por etapas.
- **Sin impacto frontend:** este macrobloque no cambió `app/` funcional.
