# Addendum pendientes prototipo - RC V75

Fecha: 2026-07-03
ZIP auditado: `Prototype development request CXOrbia V75.zip`
Documento relacionado: `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`

## Estado general

V75 resuelve parcialmente pendientes P0 detectados en V74 y debe convertirse en la nueva base visual para el empalme selectivo. Claude queda pausado por falta de capacidad, por lo que este documento acumula tanto lo que backend/ChatGPT esta incorporando como los pendientes exclusivos de prototipo/Claude para un paquete posterior.

## Resuelto en V75 y listo para conservar

1. `app/modules/automatizaciones.js`
   - Make/WhatsApp/correo/IA quedan marcados como pendientes de backend por tenant.
   - El prototipo aclara que solo registra simulacion/log local.
   - API keys de IA quedan aclaradas como no seguras para produccion desde navegador.

2. `app/modules/finanzas.js`
   - Movimientos & Tesoreria deja de decir `En vivo` y pasa a `Preview operativo`.
   - Liquidaciones deja de decir `En vivo` y pasa a `Candidatas · pend. cruce`.

3. `app/modules/hr-source.js`
   - Agrega flujo visible de registro seguro de `sourceRef` opaco.
   - Mantiene preview bloqueado si no existe `sourceRef`.

## Pendientes vigentes para prototipo / Claude futuro

### P0 - Versionado coherente V75

V75 sigue arrastrando referencias a V72 en:

- `app/docs/AUDITORIA-ENTREGA-CLAUDE.md`
- `app/modules/hr-source.js`
- `app/modules/saas-console.js`

Corregir en el siguiente paquete visual para que la version vigente sea V75 o superior.

### P0 - SaaS multi-tenant profundo

Ampliar `app/modules/saas-console.js` para cubrir:

- tenant por cliente,
- proyecto/programa/periodo por tenant,
- pais y moneda,
- plan contratado,
- modulos activos,
- permisos por rol,
- feature flags por tenant/plan/pais/modulo,
- releases con targeting,
- fecha efectiva,
- estado por tenant,
- confirmacion de lectura,
- rollback o version anterior,
- actualizaciones centralizadas sin ZIP por cliente.

### P0 - Flujo comercial de propuestas

Profundizar `app/modules/comercial.js` o subflujo comercial para incluir:

- cliente/prospecto,
- vertical o industria,
- tipo de programa,
- plantilla predeterminada,
- propuesta inteligente basada en datos del cliente,
- modulos incluidos,
- alcance geografico,
- usuarios/roles,
- fases de implementacion,
- entregables,
- precios/placeholders,
- exportar/preparar propuesta o presentacion.

Estados requeridos:

- borrador,
- en revision,
- lista para enviar,
- enviada,
- aceptada,
- rechazada,
- convertida en proyecto.

Plantillas requeridas:

- mystery shopping,
- field operations,
- auditoria operativa,
- experiencia cliente,
- propuesta ejecutiva corta,
- propuesta completa.

### P1 - Core automations

Aunque V75 agrega avisos en UI, `app/core/automations.js` aun debe endurecerse o aclararse para que no sugiera produccion = POST directo desde navegador. Produccion debe ser backend server-side por tenant.

### P1 - CRM Reuniones

`app/modules/crm.js` conserva un flujo mock de reuniones. Debe quedar claramente como pendiente backend/calendario o limitar acciones que parezcan agenda real.

### P2 - Rutas duplicadas

`app/modules/rutas.js` existe pero no se carga en `app/index.html`. Tambien hay `CX.module('rutas')` en `app/modules/operacion-extra.js`. Mantenerlo fuera de carga o limpiar en paquete futuro para evitar duplicidad.

## Pendientes de backend separados

Estos NO son tareas de Claude/prototipo:

- Adapter real CX.data -> Firestore/Supabase.
- Auth real por roles.
- Storage real de evidencias.
- Gemini server-side.
- Make server-side.
- Registro seguro de HR Source y secreto.
- Escritura/importacion DEV autorizada.
- Reglas Firestore/Auth/Storage.
- Rollback real por batchId.

## Nota de empalme

El empalme V75 debe aplicar los archivos visuales del ZIP como incremento, pero preservando todos los archivos backend, herramientas y documentos del PR #7. No se debe hacer reemplazo destructivo del repositorio.
