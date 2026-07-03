# Paquete para Claude - Pendientes RC V74 CXOrbia TyA

Fecha: 2026-07-03
Origen: Auditoria ChatGPT/Codex del ZIP `Prototype development request CXOrbia V74.zip`
Rama viva backend: `docs-tya-v6-v71-audit`
PR: #7 draft

## Instruccion principal para Claude

Trabajar sobre V74 como release candidate incremental. No reiniciar el proyecto, no reemplazar el repo completo y no eliminar avances backend/documentales existentes.

El prototipo manda visualmente, pero el backend/documentacion del PR #7 debe conservarse. Los cambios pedidos aqui son de frontend/prototipo y documentacion visual; no habilitar importacion real, deploy, Firestore writes, Make real, correo real, WhatsApp real, Gemini real ni Storage real.

## Archivos del PR #7 que deben respetarse

No entregar un ZIP que borre o reemplace estos avances:

- `app/index-backend-dev.html`
- `app/core/backend-config-preview-dev.js`
- `app/core/backend-data-contract.js`
- `app/core/backend-hr-source-bridge.js`
- `tools/`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `app/docs/AUDITORIA-RC-V74-CLOUD-FRONTEND-20260703.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V74-20260703.md`
- `app/docs/RESUMEN-PARA-CLAUDE-RC-V74-20260703.md`

## Lo que V74 resolvio y debe conservarse

### 1. HR Source

Archivo principal: `app/modules/hr-source.js`

Conservar:

- `parsed_with_warnings.canImport=false`.
- No derivar `sourceRef` desde URL privada.
- Guardar URL solo como referencia enmascarada local y estado `pendiente_backend`.
- Sincronizacion bloqueada salvo `estado==='ready_for_import' && canImport===true`.
- Gates visuales: DEV preview, DEV import, staging y produccion.
- Estados honestos: preview disponible, warning, bloqueado, pendiente backend, no autorizado y sin escritura realizada.
- Tarjeta de contrato DEV con blockers.

### 2. SaaS Console

Archivo principal: `app/modules/saas-console.js`

Conservar:

- Consola SaaS informativa.
- Tenants, planes, paises, proyectos, usuarios, version, modulos activos y feature flags.
- Releases centralizados.
- Creacion local/prototipo de tenant.
- Mensajes claros de que la gestion real va por backend.

### 3. Propuestas comerciales

Archivo principal: `app/modules/comercial.js`

Conservar:

- Calculadora de costos.
- Generacion de propuesta.
- Plantillas basicas actuales.
- Carga de plantilla propia.
- IA/fallback creativo.
- Estados base `borrador` y `enviada`.
- Vinculacion a ficha cliente/CRM.

### 4. Integraciones y finanzas

Conservar:

- Integraciones con estado `Configurado - pendiente backend`.
- Aviso en liquidaciones de que son candidatas y requieren cruce financiero externo.

## Pendientes P0 para resolver ahora si hay capacidad

### P0.1 - Versionado V74

Actualizar todos los documentos internos y notas visibles que aun dicen V72.

Revisar especialmente:

- `app/docs/AUDITORIA-ENTREGA-CLAUDE.md`
- `app/docs/CAMBIOS-PROTOTIPO.md`
- `app/docs/PENDIENTES-PROTOTIPO.md`
- `app/modules/saas-console.js`
- cualquier badge, changelog o release visible.

Resultado esperado:

- Version V74 coherente.
- Changelog V74 breve y claro.
- Sin referencias contradictorias a V72 como version vigente.

### P0.2 - Estados honestos en Finanzas

Archivo principal: `app/modules/finanzas.js`

Problema:

- Todavia aparece `En vivo` en Dashboard Financiero y Liquidaciones.

Corregir a estados honestos como:

- `Preview operativo`
- `Pendiente backend`
- `Pendiente cruce financiero`
- `Candidatas no definitivas`

Resultado esperado:

- No aparentar backend real.
- No aparentar pagos reales.
- No aparentar cruce financiero externo ya ejecutado.

### P0.3 - Make / Automatizaciones

Archivos sugeridos:

- `app/core/automations.js`
- `app/modules/automatizaciones.js`
- `app/modules/integraciones.js`

Problema:

- `CX.automations.fire()` solo registra/loguea localmente.
- No debe presentarse como POST real a Make desde el prototipo.

Resultado esperado:

- Mostrar `pendiente backend por tenant`.
- Mantener demos/logs locales como simulacion.
- No afirmar envio real.

### P0.4 - IA server-side

Archivos sugeridos:

- `app/core/automations.js`
- pantallas de configuracion IA/integraciones.

Problema:

- El prototipo puede pedir API key desde navegador/localStorage.

Resultado esperado:

- Aclarar que es solo demo/prototipo.
- Para produccion, Gemini/OpenAI/Anthropic deben ejecutarse desde backend server-side.
- No sugerir guardar API keys sensibles en navegador.

### P0.5 - Flujo seguro HR Source / sourceRef opaco

Archivo principal: `app/modules/hr-source.js`

Problema:

- V74 protege URL, pero falta explicar el flujo real de registro seguro.

Agregar texto/estado visual:

1. Frontend solicita registro seguro.
2. Backend recibe URL por canal seguro.
3. Backend guarda secreto.
4. Backend devuelve `sourceRef` opaco.
5. Preview usa `sourceRef`, no URL.

Resultado esperado:

- Mientras no exista `sourceRef`, preview queda `pendiente_backend`.
- No pedir que el navegador calcule ni persista referencias sensibles.

## Pendientes P0/P1 de SaaS

Archivo principal: `app/modules/saas-console.js`

Profundizar la consola para que represente el modelo SaaS comercializable:

- Tenant por cliente.
- Proyecto/programa por tenant.
- Pais y moneda.
- Plan contratado.
- Modulos activos.
- Permisos por rol.
- Feature flags por tenant/plan/pais/modulo.
- Releases con targeting.
- Fecha efectiva por release.
- Estado por tenant.
- Confirmacion de lectura.
- Rollback o version anterior.
- Actualizaciones centralizadas sin ZIP por cliente.

Resultado esperado:

- Que el cliente entienda que CXOrbia es SaaS multi-tenant versionado.
- Que no parezca una plataforma que requiere un ZIP diferente por cliente.

## Pendientes P0/P1 de Propuestas Comerciales

Archivo principal sugerido: `app/modules/comercial.js`

Convertir o complementar el flujo actual con un wizard comercial que permita:

- Seleccionar cliente o prospecto.
- Seleccionar vertical o industria.
- Seleccionar tipo de programa.
- Usar plantilla predeterminada.
- Generar propuesta inteligente basada en datos del cliente.
- Elegir modulos incluidos.
- Elegir alcance geografico.
- Definir usuarios/roles.
- Incluir fases de implementacion.
- Incluir entregables.
- Incluir precios o placeholders de precios.
- Exportar o preparar presentacion/propuesta.

Plantillas requeridas:

- Mystery shopping.
- Field operations.
- Auditoria operativa.
- Experiencia cliente.
- Propuesta ejecutiva corta.
- Propuesta completa.

Estados requeridos:

- Borrador.
- En revision.
- Lista para enviar.
- Enviada.
- Aceptada.
- Rechazada.
- Convertida en proyecto.

Resultado esperado:

- El flujo comercial debe ayudar a vender CXOrbia a clientes nuevos.
- Debe seguir siendo prototipo informativo, no CRM/contrato/pago real.

## Pendientes P1

### CRM Reuniones

Archivo: `app/modules/crm.js`

- La pestana Reuniones aun funciona como mock.
- Marcar claramente como `pendiente backend/calendario` o limitar acciones para no parecer agenda real.

### Rutas duplicadas

Archivo: `app/modules/rutas.js`

- Existe `CX.module('rutas')`, pero no se carga en `app/index.html`.
- Mantenerlo fuera de carga o limpiar en siguiente entrega para evitar duplicar el modulo ya definido en `operacion-extra.js`.

## Criterios de entrega esperada

Claude debe devolver un ZIP incremental que:

1. Conserve HR Source V74.
2. Corrija versionado V74.
3. Corrija estados honestos Finanzas/Make/IA.
4. Profundice SaaS multi-tenant.
5. Profundice propuestas comerciales.
6. No borre backend ni docs del PR #7.
7. No habilite importaciones reales.
8. No haga deploy ni indique que algo fue importado.
9. Mantenga UTF-8.

## Nota para Paula

Si Claude tiene poca capacidad, priorizar en este orden:

1. Versionado V74.
2. Estados honestos Finanzas/Make/IA.
3. HR Source sourceRef opaco explicado.
4. SaaS Console profundo.
5. Propuestas comerciales wizard.
6. CRM reuniones y limpieza rutas.

Con solo los puntos 1 a 3 ya deja una base mas segura para que ChatGPT/Codex continue el empalme backend.
