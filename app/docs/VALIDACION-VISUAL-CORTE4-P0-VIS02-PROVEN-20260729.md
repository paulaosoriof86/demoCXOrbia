# Validación visual Corte 4 — P0-C4-VIS-02 PROVEN

**Fecha:** 2026-07-29  
**Estado:** `P0_PROVEN__CORTE4_FREEZE_BLOCKED`

## Evidencia humana

En la URL de revalidación del fix P0-C4-VIS-01:

- login ya muestra Firestore activo y 0/0/0/0, sin fixtures demo;
- al seleccionar `Administración / Coordinación`, el shell queda visualmente en blanco;
- al seleccionar `Shopper / Evaluador`, el shell aparece sin proyecto y con `Evaluador (sin identidad)`;
- después de volver al login, seleccionar Administración puede dejar visible nuevamente el shell Shopper anterior.

La corrección de P0-C4-VIS-01 sí eliminó el fallback demo. Este hallazgo es independiente y posterior.

## P0 reproducible

`P0-C4-VIS-02 — EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`

Corte 4 exige que una base nueva/vacía sea un estado válido y visible. Administración no puede quedar en blanco por tener `projects=[]`.

## Causa raíz localizada en el source desplegado

1. El guard Corte 4 vacía correctamente `CX.data.projects`, `currentProjectId` y `currentPeriodId` antes del render.
2. `core/router.js::buildRail()` obtiene `p=d.period()`. Con backend vacío, `p` es `undefined`.
3. En la rama sin programas, `buildRail()` ejecuta `keyOf(p)` aun cuando `p` es undefined.
4. `core/data.js::programKey(p)` dereferencia `p.program`; `programBase(p)` dereferencia `p.name`. El resultado es una excepción antes de completar el rail/admin shell.
5. Aun corrigiendo solo esa línea, `modules/midia.js` también asume periodo existente (`data.programBase(p)`, `p.periodo/...`). Por tanto la solución de raíz no es parchear módulos: el shell/core debe manejar explícitamente `backend vacío` antes de invocar módulos que requieren proyecto.
6. `app.js::showLogin()` solo oculta `#app`; no limpia `rail/view`. Si el shell Shopper ya estaba pintado y el siguiente intento Admin falla antes de reemplazarlo, el DOM Shopper anterior queda visible, creando la apariencia de que Administración redirigió a Shopper.

## Alcance de la solución permitida

Corrección focalizada en shell/core, sin tocar `app/modules/`:

- estado vacío explícito y renderizable para Administración antes de montar módulos dependientes de proyecto;
- guards nulos en router para `projects=[]`;
- limpiar shell visual al cerrar sesión/cambiar rol para impedir DOM de rol anterior;
- gate browser que pruebe Admin vacío, logout, Shopper vacío y regreso a Admin sin pantalla blanca ni shell stale.

No corresponde materializar datos reales para ocultar el bug. Firestore debe seguir vacío durante Corte 4.

## Estado seguro

- P0-C4-VIS-01: corregido técnicamente; no volvió el demo fallback.
- P0-C4-VIS-02: activo y bloquea freeze Corte 4.
- Sin autorización nueva para patch/deploy.
- Sin Firestore/Auth/Storage/HR writes, imports, pagos, Make/Gemini, merge ni producción por este hallazgo.
