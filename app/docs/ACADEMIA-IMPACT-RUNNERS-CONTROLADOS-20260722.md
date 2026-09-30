# ACADEMIA — IMPACTO DE RUNNERS CONTROLADOS

**Fecha:** 2026-07-22  
**Estado:** `DOCUMENTADO_PENDIENTE_INCORPORACION_CURRICULAR`

## Objetivo pedagógico

Explicar cómo una plataforma preserva integridad entre candidata, empalme, gates y publicación sin convertir automatización en producción automática.

## Contenidos a incorporar

### 1. Auditoría no equivale a aplicación

Una candidata puede quedar `GO`, pero no está empalmada hasta existir:

- candidate/package SHA;
- HEAD_BEFORE;
- delta exacto;
- commit funcional;
- push verificable;
- HEAD_AFTER.

### 2. Aplicación atómica

`CXORBIA_ATOMIC_APPLY_RUNNER` aplica todos los archivos auditados como una sola unidad. Si falla una validación, no crea un empalme parcial.

Conceptos:

- compare-and-swap por HEAD;
- SHA actual y final por archivo;
- rutas protegidas;
- commit único;
- request efímero;
- cero force push.

### 3. Gates read-only

`CXORBIA_READONLY_POST_GATES_RUNNER` instala temporalmente Playwright y Chromium, ejecuta el build exacto y publica evidencia, pero no modifica repositorio ni datos.

Conceptos:

- aplicación y validación son carriles distintos;
- gate técnico no equivale a aprobación visual;
- un HOLD es evidencia válida, no un error que deba ocultarse;
- artifacts sanitizados;
- cero deploy/producción.

### 4. Composite exacto

Un PASS solo es válido cuando registra conjuntamente:

- candidate SHA;
- HEAD SHA;
- overlay SHA;
- gate SHA;
- composite exacto;
- salida real.

Causa raíz relacionada:

`PRE_GATE_NOT_RECONCILED_WITH_EXACT_HEAD_OVERLAY_COMPOSITE`.

### 5. Ausencia distinta de cero

Los runners preservan la regla operativa:

- `0` significa valor confirmado por fuente;
- `null` significa ausencia de fuente;
- ninguna automatización puede convertir ausencia en cero para lograr PASS.

### 6. Roles y seguridad

- Claude produce frontend, no opera el runner.
- ChatGPT audita, documenta y controla el carril.
- GitHub Actions ejecuta en entorno efímero.
- Paula conserva las autorizaciones de Hosting DEV, deploy, producción y writes reales.

## Rutas por rol

- **Admin/Operativo:** comprender sourceRevision, gates y estados honestos.
- **Shopper:** comprender que los gates no cambian sus datos ni sustituyen identidad/Auth.
- **Cliente:** comprender que un reporte validado proviene del mismo build y alcance.
- **Equipo técnico:** comprender HEAD, SHA, atomicidad, artifacts y fail-closed.

## Manuales y evaluación

Agregar ejemplos de:

- solicitud rechazada por HEAD inesperado;
- archivo rechazado por SHA distinto;
- HOLD por navegador/dependencia;
- PASS técnico pendiente de revisión visual;
- diferencia entre runner read-only y deploy.

Evaluación sugerida:

1. ¿Cuándo una candidata está realmente empalmada?
2. ¿Por qué un runner read-only no puede corregir datos?
3. ¿Qué diferencia existe entre `0` y `null`?
4. ¿Por qué todos los SHA del composite deben registrarse?
5. ¿Quién autoriza Hosting DEV y producción?

## Impacto actual

No se modificó `app/modules/academia.js` en este bloque. La incorporación curricular queda pendiente para la siguiente candidata o ajuste frontend autorizado, sin bloquear R20/M1.

## Clasificación

- **Reusable CXOrbia:** integridad de entrega, atomicidad y gates read-only.
- **Exclusivo cliente:** ejemplos iniciales con R20/Corte 2A TyA.
- **Claude/prototipo:** futura incorporación de contenidos, no infraestructura.
- **Academia:** impacto directo documentado.
- **Sin impacto Claude:** ejecución de Actions y permisos.
