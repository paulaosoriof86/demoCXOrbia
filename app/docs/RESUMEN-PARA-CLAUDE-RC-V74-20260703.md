# Resumen para Claude - RC V74

Fecha: 2026-07-03
ZIP auditado: `Prototype development request CXOrbia V74.zip`

## Que debe conservarse

1. `app/modules/hr-source.js`
   - `parsed_with_warnings.canImport=false`.
   - No derivar `sourceRef` desde URL privada.
   - Guardar solo estado seguro, `maskedUrl` y `pendiente_backend`.
   - Bloquear sync salvo `ready_for_import && canImport===true`.
   - Mantener gates DEV preview / DEV import / staging / produccion.
   - Mantener contrato DEV informativo y blockers.

2. `app/modules/saas-console.js`
   - Mantener pantalla de SaaS multi-tenant informativa.
   - Mantener tenants, planes, paises, modulos, feature flags y releases como base visual.
   - Profundizar, no eliminar.

3. `app/modules/comercial.js`
   - Mantener calculadora y propuesta.
   - Mantener plantillas base, carga de plantilla propia, IA/fallback y vinculacion a ficha cliente.
   - Profundizar como wizard comercial, no quitarlo.

4. `app/modules/integraciones.js`
   - Mantener estados `pendiente backend` para integraciones configuradas.

5. `app/modules/finanzas.js`
   - Mantener aviso de liquidaciones candidatas y cruce financiero externo.

## Que debe corregirse

1. Versionado/documentacion interna: el paquete dice V74 por archivo entregado, pero docs y releases internos siguen marcando V72. Actualizar changelog y notas.
2. Finanzas: reemplazar `● En vivo` por estado honesto (`Preview operativo`, `Pendiente backend`, etc.).
3. Automatizaciones: no afirmar envio real a Make desde prototipo. `CX.automations.fire()` solo loguea/notifica local. POST real queda para backend por tenant.
4. IA: no presentar API keys de navegador como solucion productiva. Para produccion, usar backend server-side.
5. HR Source: agregar explicacion visual del flujo seguro de registro de fuente privada hasta recibir `sourceRef` opaco.
6. SaaS: ampliar consola para cubrir proyecto/programa, permisos por rol, release targeting, confirmacion de lectura, rollback y actualizaciones por tenant/plan/pais/modulo.
7. Propuestas: convertir el flujo en wizard comercial con cliente/prospecto, vertical, tipo de programa, modulos, alcance geografico, usuarios/roles, fases, entregables, precios/placeholders y estados completos.
8. CRM Reuniones: marcar como pendiente backend/calendario o bloquear acciones mock que parezcan reales.
9. `modules/rutas.js`: no cargarlo si ya existe `CX.module('rutas')` completo desde `operacion-extra.js`.

## Restricciones para la siguiente entrega

- No reemplazar la rama backend con el ZIP visual.
- No borrar `app/index-backend-dev.html`.
- No borrar `app/core/backend-*.js`.
- No borrar `tools/`.
- No borrar documentos del PR #7.
- No habilitar importacion real.
- No hacer deploy.
- No escribir Firestore.
- Mantener todo en UTF-8.

## Resultado esperado de Claude

Una nueva entrega incremental que conserve V74, corrija estados honestos, cierre SaaS/propuestas con mayor profundidad y no rompa HR Source ni backend preparado por ChatGPT/Codex.
