# Auditoría forense candidata V100

Fecha: 2026-07-11

## Decisión

`HOLD`: V100 no se empalma ni reemplaza el runtime Phase A completo todavía.

V100 contiene avances reutilizables que deben preservarse, pero P0-2, P0-3, P0-4 y P0-5 permanecen parciales. El empalme posterior debe ser selectivo y de tres vías para no eliminar adapters y archivos backend-only.

## Identidad

- ZIP V100 SHA-256: `6eee6ff1426ccd4306ad723ef6e34a2c090976d49437d57bb26b1f1a696f820f`.
- Baseline genérica enviada a Claude SHA-256: `d5a8f73a6fe4eb635ed7a89145b092f32604014a5f002880ef935a28c19ccc5f`.
- Runtime completo empalmado SHA-256: `ceeed3246108cad7cfaeaa7921c5f9cf98387316fc74ad78f2ad7fa8e94df557`.

## Diferencial

Contra la baseline genérica:

- 68 archivos baseline / 109 V100;
- 41 agregados;
- 0 eliminados;
- 19 modificados;
- 49 idénticos.

Contra el runtime empalmado:

- 117 archivos runtime / 109 V100;
- 6 nuevos en V100;
- 14 backend/locales ausentes en V100;
- 23 diferentes;
- 80 idénticos.

Los 14 ausentes incluyen snapshot, adapters TyA, entry point Phase A, manifest, checksums y documentación. Su ausencia era esperable en el carril genérico, pero impide reemplazar el runtime completo con el ZIP V100.

Preservar además las versiones del runtime de `core/data.js`, `modules/administrabilidad.js`, `modules/importador.js` y `styles/layout.css`.

## Validación estructural

- 66 JavaScript;
- 0 errores `node --check`;
- 66 scripts declarados, 64 locales;
- 0 scripts faltantes o duplicados;
- 49 módulos con IDs únicos;
- UTF-8 válido, sin BOM ni mojibake;
- `fetch()` solo en `sw.js`.

V100 incluye cuatro capturas desktop, pero no cubre móvil, seis perfiles ni un log reproducible de consola.

## Avances aceptados

- indicador único `CX.dataSource.badge()`;
- topbar/rail unificados;
- componentes reusable de estados, gates y conflictos;
- sin llamadas directas a proveedores;
- sin refs locales fabricadas;
- outbox visual;
- contexto inicial en permisos;
- `auditRef` por evento;
- `contentVersion` separado de `workflowVersion`;
- build-lock único para app/service worker;
- PWA network-first, solo cachea respuestas exitosas;
- mejoras de foco y teclado.

## Bloqueadores

### P0-2 fixtures

`showFixtures()` solo se aplicó a Correo, Soporte y seed de movimientos de Finanzas.

Persisten datos sintéticos en:

- `modules/cert.js`: 18, 6, 84%, evaluadores y fechas;
- `core/cliente-data.js`: scores determinísticos y planes seed;
- `modules/cliente.js`: historial sintético;
- `modules/cliente-insights.js`: score fallback 74.

Fuera de demo deben producir vacío honesto o datos derivados de `CX.data`.

### P0-3 integraciones

- `hookConfigured()` equivale todavía a `hookRequested()`;
- toggles/intención se cuentan como integración activa;
- solo un `connectionRef` backend puede marcar configuración;
- separar `requested`, `pending_backend`, `configured`, `connected` y `failed`.

### P0-4 permisos

- `cx_action_perms` sigue siendo global;
- falta namespacing por tenant y override de proyecto;
- muchos handlers no pasan contexto;
- `academy.create/edit`, `academy.review/approve`, automatizaciones, integración, diagnóstico y conflicto no tienen cobertura completa.

### P0-5 Academia/certificación

- faltan gates efectivos en crear/editar curso y lecciones;
- faltan acciones review/approve;
- varios controles dependen de `role==='admin'`;
- certificación heurística se anuncia como publicada y disponible sin segundo actor/backend;
- KPIs demo de Certificación no están aislados.

### Manuales

Persisten instrucciones para API keys, webhooks, `firebaseConfig` y secretos locales. Deben enseñar adapter/backend, referencia opaca, gate y confirmación.

### Build/smoke

`core/build-lock.js` sigue usando un ID manual, no una huella verificable del árbol. El smoke no cubre móvil ni seis perfiles.

## Siguiente corrección Claude

Trabajar sobre V100, preservar avances y modificar solo los archivos necesarios para:

1. aislar Certificación y Portal Cliente de fixtures;
2. separar intención/configuración/conexión;
3. hacer permisos tenant/project/scope-aware;
4. completar gates Academia y publicación honesta de certificación;
5. corregir manuales/copy;
6. generar source lock verificable y smoke desktop/móvil de seis perfiles.

Claude no toca snapshot, adapters, Firebase, Auth, reglas, imports, Make/Gemini reales, pagos ni herramientas backend.

## Estado seguro

No hubo empalme, deploy, merge, import, write, Auth, reglas, proveedores ni producción.