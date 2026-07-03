# Auditoria RC V74 Cloud Frontend

Fecha: 2026-07-03
ZIP auditado: `Prototype development request CXOrbia V74.zip`
Rama de continuidad: `docs-tya-v6-v71-audit`
PR: #7 draft
Base: `release/cxorbia-tya-rc-20260630`

## Regla aplicada

Este ZIP se audita como release candidate incremental. No reinicia el proyecto, no reemplaza la rama, no elimina backend y no autoriza deploy, importacion ni escritura Firestore.

## Resultado tecnico del ZIP

- Estructura: 94 archivos bajo `app/`.
- Entrada principal: `app/index.html`.
- Carga scripts: 60 referencias; todas existen en el ZIP o son CDN declarados.
- Validacion sintactica: `node --check` paso en todos los `.js` locales del ZIP.
- UTF-8: sin errores de decodificacion y sin BOM detectado.
- Seguridad: no se detectaron secrets hardcoded tipo `AIza`, `sk-`, `ghp_`, `xox`, `AKIA` ni bloques PEM.
- El ZIP no incluye `app/index-backend-dev.html`, archivos `app/core/backend-*.js` del PR ni herramientas `tools/`; por eso NO debe aplicarse como reemplazo completo.

## Resueltos / avances reales

### HR Source

Archivos: `app/modules/hr-source.js`, `app/docs/AUDITORIA-ENTREGA-CLAUDE.md`.

- `parsed_with_warnings` queda con `canImport:false`.
- El frontend ya no deriva `sourceRef` desde la URL privada.
- Al guardar URL, la UI conserva estado `pendiente_backend`, `canImport:false` y solo muestra una referencia enmascarada.
- La sincronizacion queda bloqueada salvo `estado==='ready_for_import' && canImport===true`.
- Agrega gates visuales: DEV preview, DEV import, staging y produccion.
- Agrega estados honestos visibles: preview disponible, warning, bloqueado, pendiente backend, no autorizado y sin escritura realizada.
- Agrega tarjeta de contrato DEV con blockers: PII/DPI, duplicados, encoding RTDB, notificaciones sin destinatario, fila HN junio y cruce financiero.

### SaaS multi-tenant

Archivo: `app/modules/saas-console.js`.

- Se agrega consola SaaS informativa al menu de configuracion.
- Representa tenants, planes, paises, proyectos, usuarios, version, modulos activos y feature flags.
- Incluye listado de releases centralizados.
- Permite crear tenant en modo prototipo/localStorage.
- La UI aclara que la gestion real se ejecuta en backend.

### Propuestas comerciales

Archivo: `app/modules/comercial.js`.

- Existe flujo de propuesta desde calculadora de costos.
- Incluye plantillas basicas: formal, consultiva, directa y corporativa.
- Permite cargar plantilla propia.
- Permite redactar con IA o usar fallback creativo.
- Guarda propuestas en `CX.propStore` con estados base `borrador` y `enviada`.
- Vincula propuestas al cliente/ficha CRM.

### Estados honestos de integraciones

Archivos: `app/modules/integraciones.js`, `app/modules/hr-source.js`, `app/modules/finanzas.js`.

- Integraciones configuradas quedan como `Configurado · pendiente backend`.
- HR Source no declara importacion real.
- Liquidaciones agregan banner que aclara que son candidatas y que el monto final requiere cruce financiero externo.

## Parciales

### SaaS comercializable

El avance visual existe, pero falta profundidad para considerar el pendiente P0 cerrado:

- No hay detalle completo por tenant/proyecto/programa/periodo.
- No hay matriz visual de permisos por rol dentro del tenant SaaS.
- Feature flags existen, pero no estan conectados a un modelo de rollout por tenant, plan, pais o modulo.
- Releases son lista estatica; falta targeting, fecha efectiva, estado por tenant, confirmacion de lectura y rollback visual.
- Version visible sigue `V72`, no `V74`.

### Flujo de propuesta comercial a cliente

Existe flujo base, pero no cumple completo el addendum SaaS/propuestas:

- No estan las plantillas requeridas por tipo: mystery shopping, field operations, auditoria operativa, experiencia cliente, propuesta ejecutiva corta y propuesta completa.
- No hay selector explicito de vertical/industria, alcance geografico, modulos incluidos, usuarios/roles, fases, entregables y placeholders de precio dentro de un wizard unico.
- Los estados sugeridos no estan completos en el flujo visible: `en revision`, `lista para enviar`, `aceptada`, `rechazada`, `convertida en proyecto`.
- La conversion de propuesta ganada a proyecto sigue pendiente de backend/prototipo.

### PWA

Archivos: `app/app.js`, `app/core/pwa.js`, `app/manifest.webmanifest`, `app/sw.js`.

- Hay registro de service worker y manifest.
- Chrome/Edge/Android capturan `beforeinstallprompt` y muestran el prompt tras una interaccion del usuario.
- iOS Safari muestra instrucciones porque no permite prompt programatico.
- Esto es lo maximo posible por restriccion de navegador: no existe descarga/instalacion PWA completamente automatica sin gesto del usuario en navegadores modernos.

### CRM

Archivo: `app/modules/crm.js`.

- Finanzas y Add-ons indican pendiente backend.
- Reuniones aun permite flujo mock de agenda; debe aclararse mas o bloquearse si Claude prometio `pendiente backend` para esa pestana.

### IA

Archivo: `app/core/automations.js`.

- El prototipo permite configurar proveedores IA y llamar APIs desde navegador si el usuario pega una key.
- Para produccion esto debe moverse a backend server-side; no debe guardarse API key sensible en localStorage.

## Pendientes / nuevos hallazgos

1. `app/docs/AUDITORIA-ENTREGA-CLAUDE.md` sigue declarando Version V72; el ZIP entregado como V74 no actualizo version ni changelog V73/V74.
2. `app/modules/finanzas.js` aun muestra `● En vivo` en Dashboard Financiero y Liquidaciones. Debe decir `Preview operativo`, `Derivado del prototipo` o equivalente, porque no hay backend real ni cruce financiero final.
3. `app/core/automations.js` dice en comentario que en produccion hace POST a Make, pero `CX.automations.fire()` solo registra log local; debe mostrarse como pendiente backend y no como envio real.
4. HR Source ya no envia URL al frontend ni deriva `sourceRef`, lo cual es correcto por seguridad; falta flujo seguro backend para registrar fuente privada y devolver `sourceRef` opaco. Sin eso, el preview real necesita registro manual/backend previo.
5. `app/modules/rutas.js` existe con `CX.module('rutas')`, pero no se carga en `app/index.html`; no es bloqueante, pero puede confundir si alguien vuelve a cargarlo y duplica el modulo definido por `operacion-extra.js`.
6. El ZIP no incluye los documentos ni herramientas del PR #7. Debe empalmarse de forma selectiva y conservar `app/index-backend-dev.html`, `app/core/backend-*.js`, `tools/` y docs backend.

## Criterio de aceptacion incremental

V74 puede usarse como candidato visual incremental, no como reemplazo completo. Antes de merge/deploy se requiere:

1. Empalmar solo cambios frontend relevantes sobre `docs-tya-v6-v71-audit`.
2. Preservar todos los archivos backend/documentales del PR #7.
3. Corregir rotulos honestos: finanzas, automations Make, IA keys y version V74.
4. Mantener HR Source con `canImport=false` salvo autorizacion real backend.
5. Ejecutar revision visual local antes de cualquier PR listo.

## Estado seguro

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Merge: 0.
- Produccion: 0.
