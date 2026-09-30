# CAMBIOS BACKEND — Estabilización forense del control plane

**Fecha:** 2026-08-04  
**Estado:** `FORENSIC_CONTROL_PLANE_SOURCE_STATIC_PASS_LOCAL__REMOTE_TELEMETRY_NOT_CONFIRMED__NO_RUNTIME__NO_PRODUCTION`

## 1. Autorización

Macrobloque autorizado:

`FORENSIC-CONTROL-PLANE-STABILIZATION source-only/read-only`.

Alcance:

- auditar solicitud, workflow, orquestador, Auth, gates, rollback y evidencia;
- clasificar fallos;
- sacar gates duplicados del camino activo sin borrar historia;
- materializar una máquina de estados única;
- separar acceso/membership del runtime read-only;
- fijar ejecución a SHA inmutable;
- ejecutar sintaxis y gates estáticos;
- documentar y detenerse.

No se autorizó runtime, credenciales, provider reads/writes, deploy, merge ni producción.

## 2. Causa sistémica confirmada

La demora no provenía de una sola falla del Portal Cliente. El camino activo tenía:

1. varios browser gates con contratos diferentes de readiness;
2. condiciones compuestas que mezclaban Auth, shell, ruta, menú y render;
3. una transacción monolítica que revertía acceso válido por un fallo posterior read-only;
4. checkout por nombre de rama móvil;
5. inferencia del source lock mediante `HEAD^`;
6. evidencia y solicitud consumidas después sobre una rama que podía haberse movido;
7. gates estáticos basados en presencia de strings, sin validar el modelo de ciclo de vida.

Clasificación:

- **Producto:** ciclo de vida Auth/datos/shell/ruta/vista/dominio requiere autoridad única.
- **Test harness:** gates duplicados y esperas contradictorias.
- **Infraestructura:** ejecución sobre rama móvil en lugar de SHA exacto.
- **Gobierno:** acceso y runtime mezclados; telemetría documental no atómica.

## 3. Archivos creados

### `tools/qa/cxorbia-runtime-state-machine.mjs`

Commit inicial:

`58488181921f47ff8822f964e74d64a8e8f3b853`

Implementa:

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

Incluye snapshots observables de:

- Auth, rol, namespace, tenant y proyectos;
- autoridad HR y conteos;
- router;
- rail;
- confidencialidad pendiente;
- ruta;
- elemento de navegación;
- highlight del menú como evidencia separada;
- encabezado y render;
- estado bloqueado;
- timeline y clasificación del fallo.

No usa una única espera booleana compuesta.

### `tools/qa/tya-phase-a-unified-runtime-state-machine-gate.mjs`

Commit inicial:

`044ebb92fdbb87dc0cb03c0cd37da6653a26a059`

Será la única autoridad browser activa para:

- Admin/Operaciones;
- Cliente;
- Shopper;
- tres recargas;
- nueva pestaña;
- HR dinámica;
- Dashboard, Visitas, Postulaciones, Shoppers, Finanzas y Reservas;
- Mi Perfil, Mis Visitas, Disponibles y Reservas Shopper;
- Portal Cliente cuando corresponda.

No se ejecutó en este bloque.

### `backend/contracts/cxorbia-active-runtime-control-plane-v1.json`

Commit inicial:

`d7b72ac538ecba4b58942619830e1c54908fca18`

Define:

- una sola ruta activa;
- SHA fuente inmutable;
- transacción de acceso separada;
- runtime read-only separado;
- gates históricos fuera de la autoridad activa.

### `tools/qa/cxorbia-forensic-control-plane-stabilization-gate.mjs`

Commit inicial:

`f94988f09e0bc37ffe07aaed0ba09c6163a44076`

Verifica de manera determinista:

- sintaxis;
- estados exactos;
- checkout detached por SHA;
- ausencia de `HEAD^` como autoridad;
- una sola autoridad browser;
- separación de transacciones;
- gates históricos clasificados como inactivos;
- ausencia de composite waits en la nueva autoridad.

### `backend/contracts/tya-phase-a-core-operations-shopper-release-slice-v1.json`

Commit:

`4d54059c269ade15c31916b3a1c8d467a606572e`

Formaliza el primer corte de producción:

`ADMIN/OPERACIONES + SHOPPER`

El Portal Cliente queda como corte paralelo y no bloquea el cutover inicial, sin presentarlo como terminado.

### `app/docs/METODOLOGIA-PRUEBAS-EN-PLATAFORMA-REUTILIZABLE-DESDE-FINANZAS-20260804.md`

Commit:

`6e4faf0bcbd6ce395f27cd642d828ddba41e9ea4`

Documenta el patrón reusable del proyecto de Finanzas:

- ejecución dentro de la plataforma;
- escenarios realistas `AUDIT-*`;
- PASS/FAIL por etapa;
- evidencia visible;
- fingerprints;
- cleanup exacto;
- sin copiar lógica financiera.

## 4. Archivos modificados

### `tools/qa/cxorbia-c6-client-access-runtime-orchestrator.mjs`

Commit:

`1df51a4885a78dec00e43a077360fee2e10d74cb`

Cambios:

- request v3;
- SHA exacto contra HEAD actual;
- elimina inferencia `HEAD^`;
- Transacción A: acceso/membership;
- Transacción B: runtime read-only;
- produce `PASS_C6_CLIENT_ACCESS_TRANSACTION` antes del runtime;
- un fallo read-only posterior no revierte un acceso ya validado;
- ejecuta únicamente el gate unificado;
- retira del camino activo tres browser gates duplicados y el wrapper por strings.

### `.github/workflows/cxorbia-c6-client-auth-materialization.yml`

Commit:

`fc59596e0af690eac8061e508fdf53a73ac745e0`

Cambios:

- captura la solicitud desde el commit disparador;
- extrae `sourceHeadSha`;
- hace checkout detached del SHA exacto;
- verifica el SHA antes de ejecutar;
- vuelve a la rama viva solo para consumir solicitud y persistir evidencia;
- valida que requestId y sourceHeadSha no hayan cambiado durante la ejecución.

### `tools/qa/tya-c6-client-route-source-static-gate.mjs`

Commit:

`d4e25ee7e04e724f91f19c15b8394fd9b3b2a648`

Queda como gate de compatibilidad y delega la autoridad al gate forense del control plane.

### `.github/cxorbia-gate-requests/request.json`

Commit:

`4ff09733f54925ea76e44d43190780725482dfa9`

Solicitud source-only:

`forensic-control-plane-stabilization-20260804-01`.

Permanece:

- `enabled=false`;
- `allowedExecutions=0`;
- provider reads false;
- runtime false;
- writes false.

## 5. Gates ejecutados

Ejecución determinista source-only en la sesión de trabajo:

```text
PASS_FORENSIC_CONTROL_PLANE_STABILIZATION
PASS_C6_CLIENT_ROUTE_SOURCE_STATIC
```

Resultado:

- syntax errors: 0;
- blockers: 0;
- warnings: 0;
- credenciales: 0;
- navegador: no ejecutado;
- provider reads: 0;
- provider writes: 0;
- runtime: 0;
- deploy: 0.

La solicitud también fue registrada en el runner controlado existente. Al cierre de este documento, el conector no expuso run, job, comentario ni status verificable para ese push. Por tanto, **no se declara un PASS remoto de GitHub Actions**. La autoridad comprobada del bloque es el PASS determinista source-only ejecutado en esta sesión.

## 6. Gates retirados del camino activo

Se preservan como evidencia histórica, pero el nuevo orquestador ya no los ejecuta:

- `tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs`;
- `tools/qa/tya-c6-client-auth-browser-smoke.mjs`;
- `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`;
- `tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs`.

No fueron borrados.

## 7. Decisión sobre pruebas dentro de la plataforma

Se adopta el patrón reusable del proyecto Finanzas, sin copiar su metodología completa ni su dominio.

Siguiente implementación autorizable:

- Laboratorio DEV visible;
- escenarios `AUDIT-*`;
- operaciones mediante la UI y contratos normales;
- validación entre módulos;
- PASS/FAIL exacto;
- screenshots y timeline;
- fingerprints antes/después;
- cleanup exacto;
- `baselineRestoredAfterCleanup=true`.

No se implementó ni ejecutó el laboratorio porque este bloque era source-only/read-only.

## 8. Estrategia de producción

Primer corte:

```text
ADMIN/OPERACIONES + SHOPPER
```

Incluye como mínimo:

- Hoja de Ruta viva;
- Dashboard Operativo;
- Visitas;
- Visitas Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación en el alcance habilitado;
- Finanzas Phase A;
- Mi Perfil, Mis Visitas, certificaciones e histórico Shopper.

Cliente se valida y despliega después como corte independiente.

## 9. Estado seguro

- archivos funcionales `app/`: 0 cambios;
- runtime con credenciales: 0;
- Auth/Firestore/membership writes: 0;
- provider reads: 0;
- Hosting/Cloud Run: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 10. Clasificación obligatoria

- **Reusable CXOrbia:** control plane, estados, runner único, escenarios y cleanup.
- **Exclusivo cliente:** release slice TyA Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V6 sigue pendiente de auditoría acumulativa; no se empalmó.
- **Academia:** prueba visible, estados, diagnóstico y restauración.
- **Sin impacto frontend:** ningún archivo funcional del prototipo fue modificado.

## 11. Siguiente bloque exacto

```text
EXECUTION_LANE_READY
→ AUDITORÍA ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO SIN P0
→ SOURCE/STATIC
→ LABORATORIO DEV CORE_OPERATIONS_ADMIN + SHOPPER_FULL_CYCLE
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL HUMANO
→ DECISIÓN DE CUTOVER DEL SLICE ADMIN/OPERACIONES + SHOPPER
```
