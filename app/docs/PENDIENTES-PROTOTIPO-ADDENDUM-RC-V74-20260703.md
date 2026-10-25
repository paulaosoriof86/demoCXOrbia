# Addendum pendientes prototipo - RC V74 Cloud

Fecha: 2026-07-03
ZIP auditado: `Prototype development request CXOrbia V74.zip`
Documento relacionado: `app/docs/AUDITORIA-RC-V74-CLOUD-FRONTEND-20260703.md`

## Estado general

V74 avanza en HR Source, SaaS multi-tenant informativo, propuestas y estados honestos, pero no cierra todos los pendientes P0/P1. Debe tratarse como candidato incremental y no como reemplazo completo.

## Resuelto para conservar

1. HR Source mantiene importacion bloqueada cuando `canImport=false`.
2. HR Source ya no deriva `sourceRef` desde URL privada.
3. HR Source muestra gates por fase y estados honestos.
4. SaaS Console aparece como pantalla informativa multi-tenant.
5. Costos & Propuestas permite generar propuesta, cargar plantilla, usar IA/fallback y guardar como borrador/enviada.
6. Integraciones muestran configuracion como pendiente backend.
7. Liquidaciones incluyen aviso de candidatas y cruce financiero requerido.

## Pendientes para Claude P0/P1

### P0 - No reemplazar backend ni documentacion

El ZIP no trae `app/index-backend-dev.html`, `app/core/backend-*.js`, `tools/` ni los docs del PR #7. Claude debe entregar solo cambios frontend y nunca asumir que el ZIP nuevo reemplaza la rama backend.

### P0 - Versionado V74

Actualizar documentos internos del prototipo para que no digan solo V72:

- `app/docs/AUDITORIA-ENTREGA-CLAUDE.md`
- `app/docs/CAMBIOS-PROTOTIPO.md`
- `app/docs/PENDIENTES-PROTOTIPO.md`
- cualquier nota de release visible en `modules/saas-console.js`

### P0 - Estados honestos de Finanzas

En `app/modules/finanzas.js`, cambiar `● En vivo` por un estado honesto como:

- `◐ Preview operativo`,
- `Derivado del prototipo`,
- `Pendiente cruce backend`,
- o equivalente.

Aplica especialmente a Dashboard Financiero y Liquidaciones. No debe dar a entender que existe backend real, pago real, cruce financiero real o dato final importado.

### P0 - Automatizaciones Make

En `app/core/automations.js` y `app/modules/automatizaciones.js`, aclarar que Make no hace POST real desde el prototipo. `CX.automations.fire()` solo notifica/loguea localmente. El POST real queda pendiente del backend por tenant.

### P0 - IA server-side

En `app/core/automations.js` y pantallas de IA/configuracion, mantener el uso como prototipo, pero aclarar que para produccion las API keys no deben guardarse en localStorage ni llamarse desde navegador. Gemini/OpenAI/Anthropic deben pasar por backend server-side.

### P0 - Registro seguro de HR Source

V74 protege la URL, pero falta pantalla/estado que explique el flujo real:

1. El frontend solicita registro seguro.
2. Backend recibe URL por canal seguro.
3. Backend guarda secreto.
4. Backend devuelve `sourceRef` opaco.
5. Solo entonces el preview puede pedir tabs/conteos.

Mientras no exista `sourceRef`, el preview debe seguir como `pendiente_backend`.

### P0 - SaaS multi-tenant profundo

Ampliar `app/modules/saas-console.js` para que cubra:

- tenant por cliente,
- proyecto/programa por tenant,
- pais y moneda,
- plan contratado,
- modulos activos,
- permisos por rol,
- feature flags por tenant/plan/pais/modulo,
- releases con targeting,
- estado por tenant,
- confirmacion de lectura,
- rollback o version anterior,
- actualizaciones centralizadas sin ZIP por cliente.

### P0 - Flujo comercial de propuesta a cliente

Ampliar `app/modules/comercial.js` o crear subflujo visual dentro de Comercial/CRM para incluir:

- seleccion explicita de cliente/prospecto,
- vertical o industria,
- tipo de programa,
- plantilla predeterminada,
- propuesta inteligente basada en datos del cliente,
- modulos incluidos,
- alcance geografico,
- usuarios/roles,
- fases de implementacion,
- entregables,
- precios o placeholders de precios,
- exportar/preparar presentacion/propuesta.

### P1 - Plantillas requeridas

Agregar plantillas:

- mystery shopping,
- field operations,
- auditoria operativa,
- experiencia cliente,
- propuesta ejecutiva corta,
- propuesta completa.

### P1 - Estados de propuesta

Agregar estados visibles y accionables:

- borrador,
- en revision,
- lista para enviar,
- enviada,
- aceptada,
- rechazada,
- convertida en proyecto.

### P1 - CRM Reuniones

En `app/modules/crm.js`, la pestana Reuniones aun opera como mock. Debe mostrar claramente `pendiente backend/calendario` o limitar acciones para no parecer calendario real.

### P2 - Limpieza de archivo no cargado

`app/modules/rutas.js` existe con `CX.module('rutas')`, pero `app/index.html` no lo carga. Mantenerlo fuera de carga o eliminarlo del paquete futuro para evitar que sobrescriba la version completa definida en `operacion-extra.js`.

## Instruccion para Claude

Claude debe conservar los avances de HR Source V74 y corregir los pendientes anteriores sin tocar backend, sin activar importacion, sin mostrar estados falsos y sin entregar un ZIP que borre la documentacion o herramientas del PR #7.
