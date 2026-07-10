# Auditoría forense candidata V99

Fecha: 2026-07-10

## Decisión

`HOLD / NO GO PARA EMPALME`.

V99 contiene avances reales que deben preservarse, pero no debe convertirse todavía en baseline, empalmarse completa ni desplegarse. La candidata requiere una corrección focalizada y nueva auditoría diferencial.

## Identidad

- Source lock post-V96: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.
- V98: `d12b07f4ae52910b0f53dcf29b11996afc15f8f9102014da4049708daea7590c`.
- V99: `679f3b53ea3f406781cfe0fba5e71da01c8b6b2e68d3f1d14fc492e9b6b0688a`.

## Delta V98 → V99

- 103 archivos en V99;
- 3 agregados;
- 0 eliminados;
- 16 modificados;
- 84 idénticos.

Agregados:

- `core/data-source.js`;
- `core/permissions.js`;
- `docs/REPORTE-V98-CORRECCION-20260710.md`.

Modificados:

- `app.js`;
- `core/automations.js`;
- `core/router.js`;
- `index.html`;
- `modules/academia.js`;
- `modules/cert.js`;
- `modules/correo.js`;
- `modules/diagnostico.js`;
- `modules/documentos.js`;
- `modules/finanzas.js`;
- `modules/importador.js`;
- `modules/integraciones.js`;
- `modules/marketing.js`;
- `modules/operacion-extra.js`;
- `modules/postulaciones.js`;
- `sw.js`.

## Validación estructural

- 65 JavaScript revisados con `node --check`;
- 0 errores de sintaxis;
- 65 scripts declarados, 63 locales y 2 remotos;
- 0 scripts locales faltantes;
- 0 scripts duplicados;
- 49 módulos y 49 IDs únicos;
- 0 BOM UTF-8;
- no quedan `fetch()` directos a proveedores; solo el fetch network-first del service worker.

No se afirma smoke navegador exitoso: Chromium/Playwright no pudo completarse por restricciones del entorno. La revisión visual queda pendiente después de resolver P0 y crear nuevo source lock.

## Avances que se preservan

1. `CX.ai.preferred()`, `available()` y `ready()` ya separan preferencia de disponibilidad.
2. `CX.ai.ask()` rechaza con `AI_BACKEND_UNAVAILABLE` y no llama proveedores.
3. Varios flujos usan heurística local y no quedan bloqueados.
4. Se purgan webhooks heredados en Automatizaciones.
5. Existe nueva capa de permisos por acción.
6. Academia incorpora estados, soft-delete, restauración a borrador en la función, auditoría y notificación local.
7. PWA cachea solo respuestas `ok` y tiene fallback offline.
8. Se añadieron gates en algunas acciones sensibles.

## Bloqueadores P0

### Fuente de datos

`core/data-source.js` es un selector/bloqueador, no el bridge solicitado. `core/data.js` crea seeds demo antes de resolver modo. No existe hidratación source-safe de `CX.data`, adapter conectado, reemplazo atómico, validación de contrato o scope en adapter. Preview y connected quedan siempre bloqueados.

### Regresión al volver a Demo

`app.js::renderDataSourceBlock()` reemplaza todo `#app`, eliminando `#rail`, topbar y `#view`. El botón “Volver a modo Demo” llama `this.enter()` sin recargar ni reconstruir el shell; el router puede operar sobre nodos inexistentes.

### Demo leakage

Persisten KPIs y registros demo en Certificaciones, Finanzas, Correo, Soporte, dashboards y portales. Bloquear preview no sustituye la separación por modo.

### Secretos e integraciones

Integraciones y Automatizaciones siguen solicitando API keys, tokens, contraseñas y webhooks. El valor se descarta, pero se fabrica un `ref_...` local y se marca como configurado. Solo un `connectionRef` emitido por backend puede representar configuración real. La purga de `cx_ai` es perezosa hasta invocar `cfg()`.

### Manuales/Academia

Persisten instrucciones para pegar API keys, webhooks y `firebaseConfig`, contradiciendo la arquitectura segura.

### Permisos

La capa es parcial: una acción desconocida es permitida para `super`; la configuración `cx_action_perms` es global, no tenant-aware; el contexto no usa proyecto/scope; se promete una pantalla de administración que no existe; varias acciones declaradas no están conectadas.

### Academia

El modal de restauración dice “motivo opcional”, pero la función lo exige. El handler ignora fallo y muestra “restaurado como publicado” aunque la transición sea a borrador. Falta `auditRef` por transición, se mezcla versión de contenido con cambio de estado, faltan gates de crear/editar/aprobar y `delLesson()` sigue como hard delete. La certificación heurística puede aparecer disponible a shoppers sin revisión/adapter real suficiente.

### Copy

Persisten “Pega tu API key/webhook”, “Crear con IA”, “ya disponible para shoppers”, “liquidaciones pagadas”, “sincronizados” y “Conectado como” sin evidencia backend.

### PWA

`sw.js` conserva `BUILD_ID='20260710-v98'` dentro de V99 y no lo deriva del source lock.

## Clasificación

- Reusable CXOrbia: fuente/adapters, separación de modos, permisos por acción, seguridad, copy estructurado, PWA y ciclo editorial.
- Exclusivo cliente: datos, reglas, países, montos, fechas y contenidos particulares; solo pueden existir como configuración/fixtures demo.
- Claude/prototipo: corregir los bloqueadores con diff mínimo sobre V99.
- Academia: impacto alto en seguridad, fuente, permisos, revisión, notificaciones y rutas por rol.
- Sin impacto Claude: infraestructura, Auth, reglas, Storage, Functions, deploy, imports y proveedores reales.

## Siguiente secuencia

`corrección focalizada V99 → auditoría diferencial → source lock nuevo → build source-safe → autorización separada de deploy DEV → revisión visual`.

## Estado seguro

Sin empalme, merge, deploy, producción, Auth, reglas, imports, writes, proveedores reales, pagos ni datos sensibles.