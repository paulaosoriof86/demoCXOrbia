# Auditoria RC V75 Cloud Frontend

Fecha: 2026-07-03
ZIP auditado: `Prototype development request CXOrbia V75.zip`
Rama de continuidad: `docs-tya-v6-v71-audit`
PR: #7 draft
Base: `release/cxorbia-tya-rc-20260630`

## Regla aplicada

V75 se trata como release candidate incremental. No reinicia el proyecto, no reemplaza la rama completa, no elimina backend/documentacion y no autoriza deploy, importacion ni escritura Firestore.

## Resultado tecnico del ZIP

- Estructura: 94 archivos bajo `app/`.
- Entrada principal: `app/index.html`.
- Carga scripts: 60 referencias; todas existen en el ZIP o son CDN declarados.
- Validacion sintactica: `node --check` paso en los 61 `.js` locales del ZIP.
- UTF-8: sin BOM detectado y sin errores de decodificacion.
- No se detectaron secrets reales hardcoded. La cadena `AIza...` aparece como texto formativo en Academia, no como credencial completa.
- `app/modules/rutas.js` existe pero no se carga en `app/index.html`; `CX.module('rutas')` tambien existe en `operacion-extra.js`.

## Diferencia V75 vs V74

V75 cambia solo 3 archivos respecto a V74:

1. `app/modules/automatizaciones.js`
2. `app/modules/finanzas.js`
3. `app/modules/hr-source.js`

No agrega archivos nuevos ni elimina archivos respecto a V74.

## Resueltos / avances reales V75

### Automatizaciones / Make / IA

Archivo: `app/modules/automatizaciones.js`.

- Agrega aviso visual: pendiente backend por tenant.
- Aclara que en prototipo los eventos solo se registran en log local/simulacion.
- Aclara que el POST real a Make, WhatsApp, correo e IA deben ejecutarse desde backend server-side, no desde navegador.
- Agrega aviso de API key: no se guarda ni se envia de forma segura desde el prototipo; produccion debe usar server-side / Secret Manager.

### Finanzas

Archivo: `app/modules/finanzas.js`.

- Cambia `En vivo` en Movimientos & Tesoreria por `Preview operativo`.
- Cambia `En vivo` en Liquidaciones por `Candidatas · pend. cruce`.
- Conserva el banner que aclara que las liquidaciones son candidatas y el monto final se confirma con cruce financiero externo.

### HR Source

Archivo: `app/modules/hr-source.js`.

- Agrega explicacion visible del flujo seguro de registro de `sourceRef`:
  1. Frontend solicita registro seguro.
  2. Backend recibe URL por canal seguro.
  3. Backend guarda secreto.
  4. Backend devuelve `sourceRef` opaco.
  5. Preview usa `sourceRef`, nunca URL.
- Aclara que mientras no exista `sourceRef`, el preview queda en `pendiente_backend`.

## Parciales aun vigentes

### Versionado

V75 sigue arrastrando referencias internas a V72:

- `app/docs/AUDITORIA-ENTREGA-CLAUDE.md`
- `app/modules/hr-source.js`
- `app/modules/saas-console.js`

No bloquea el empalme backend, pero debe corregirse antes de paquete final para Claude o release visual.

### SaaS Console

Archivo: `app/modules/saas-console.js`.

V75 conserva la consola SaaS informativa, pero todavia falta profundidad para cerrar el pendiente P0:

- permisos por rol,
- releases con targeting,
- estado por tenant,
- confirmacion de lectura,
- rollback,
- feature flags por tenant/plan/pais/modulo,
- proyecto/programa/periodo por tenant.

### Propuestas comerciales

Archivo: `app/modules/comercial.js`.

El flujo base existe, pero falta cerrar el wizard comercial completo:

- cliente/prospecto,
- vertical/industria,
- tipo de programa,
- modulos incluidos,
- alcance geografico,
- usuarios/roles,
- fases,
- entregables,
- precios/placeholders,
- estados completos hasta `convertida en proyecto`.

### Core automations

Archivo: `app/core/automations.js`.

Aunque la UI de V75 ya aclara que Make/IA quedan pendientes de backend, el comentario tecnico del core aun menciona produccion = POST al webhook. Debe mantenerse documentado como pendiente para endurecimiento futuro, o corregirse en el empalme backend si se toca ese core.

## Criterio de empalme V75

V75 debe empalmarse de forma selectiva sobre PR #7:

- Aplicar frontend V75 sin borrar backend.
- No borrar `app/index-backend-dev.html`.
- No borrar `app/core/backend-*.js`.
- No borrar `tools/`.
- No borrar docs backend del PR #7.
- No ejecutar deploy, importacion ni escritura.
- No eliminar docs vivos: `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Estado seguro

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Merge: 0.
- Produccion: 0.
