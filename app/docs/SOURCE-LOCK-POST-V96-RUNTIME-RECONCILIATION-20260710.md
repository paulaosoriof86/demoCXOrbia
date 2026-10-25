# Reconciliación runtime del source lock post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Objetivo

Comprobar de forma criptográfica si el runtime de la rama activa coincide realmente con el source lock operativo post-V96 recibido como `Prototype development request.zip`, sin modificar el frontend, sin mover el SHA validado, sin activar proveedores y sin ejecutar deploy, import o escritura.

## Fuente y alcance verificado

El ZIP post-V96 conserva su decisión vigente:

- source lock operativo para continuidad backend;
- no GO de producción;
- no autorización de deploy, runtime, Auth, Firestore, Storage, Make, Gemini, HR writeback ni pagos.

Huella del paquete auditado:

- SHA-256 del ZIP: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`;
- archivos totales del paquete: 100;
- archivos runtime sometidos a gate: 67;
- documentos/metadatos excluidos del gate runtime: 33.

El alcance runtime incluye shell, `app.js`, `index.html`, manifest, service worker, `app/core`, `app/modules`, estilos y demo. Los documentos del paquete se conservan como procedencia, pero no determinan la identidad del runtime.

## Archivos creados

1. `backend/config/phase-a-source-lock-post-v96-runtime-manifest.source-safe.json`
   - manifiesto source-safe con ruta y SHA-256 de cada uno de los 67 archivos runtime;
   - no contiene datos TyA, secretos, credenciales ni payloads reales.

2. `tools/release/tya-source-lock-post-v96-runtime-verify.mjs`
   - compara hashes del runtime de la rama contra el manifiesto;
   - no modifica archivos;
   - no llama proveedores;
   - no despliega;
   - no importa ni escribe datos.

3. `.github/workflows/cxorbia-source-lock-post-v96-runtime-verify.yml`
   - ejecuta el verificador en CI;
   - publica evidencia como artifact;
   - falla de forma intencional cuando la rama no coincide con el source lock.

## Resultado CI

Workflow: `CXOrbia Source Lock Post-V96 Runtime Verify`, run 5.

Veredicto:

`NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`

Conteos:

- runtime esperado: 67;
- archivos que coinciden: 30;
- archivos ausentes: 0;
- archivos con hash distinto: 37;
- archivos runtime adicionales en la rama, solo informativos: 27.

La ausencia es cero: la diferencia no se debe a que el paquete tenga módulos inexistentes, sino a que 37 archivos de la rama contienen otra versión o cambios acumulados distintos al source lock post-V96.

## Archivos del source lock que no coinciden

### Shell, core y PWA

- `app/app.js`;
- `app/index.html`;
- `app/sw.js`;
- `app/core/automations.js`;
- `app/core/config.js`;
- `app/core/data.js`;
- `app/core/liquidacion.js`;
- `app/core/manuales-data.js`;
- `app/core/router.js`;
- `app/core/store.js`;
- `app/core/topbar.js`.

### Módulos

- `academia.js`;
- `administrabilidad.js`;
- `automatizaciones.js`;
- `cliente.js`;
- `configuracion.js`;
- `correo.js`;
- `crm.js`;
- `dashboard.js`;
- `diagnostico.js`;
- `documentos.js`;
- `finanzas.js`;
- `hr-source.js`;
- `importador.js`;
- `misvisitas.js`;
- `novedades.js`;
- `postulaciones.js`;
- `proyecto-wizard.js`;
- `proyectos.js`;
- `reservas.js`;
- `revision-admin.js`;
- `saas-console.js`;
- `shoppers.js`;
- `soporte.js`;
- `visitas.js`.

### Estilos

- `app/styles/layout.css`;
- `app/styles/theme.css`.

## Archivos runtime adicionales de la rama

El reporte identifica 27 archivos adicionales que no forman parte del paquete post-V96. Son report-only y no se borran automáticamente.

Incluyen:

- adapters/bridges backend deshabilitados o preview en `app/core`;
- guards y utilidades backend agregados previamente;
- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/core/v91-modules.js`;
- patches incrementales de Academia;
- `app/modules/rutas.js`.

Estos archivos deben revisarse durante el futuro empalme para decidir si se preservan como backend seguro, se reubican o se documentan para consolidación. No deben eliminarse a ciegas.

## Evidencia de historial Git

La comparación del commit V96 conocido `587732874f86f8c7a22f919617cbe271f8be68bd` contra la rama activa devolvió estado `diverged` y merge base `0eaa067af98e84aeb52827c2e877f6ff36eb37aa`.

Por tanto:

- el source lock post-V96 sí existe y fue auditado;
- pero su runtime no está empalmado íntegramente en la rama activa;
- la rama no debe presentarse como runtime post-V96 hasta completar un empalme controlado y volver a pasar el gate de hashes.

## Reconciliación del drift gate

El drift gate anterior mezclaba cambios runtime con archivos safe-only. Se corrigió la clasificación sin abrir una allowlist masiva.

Antes:

- 31 archivos bloqueados;
- 4 cambios runtime reales;
- 27 archivos safe-only de contratos/configuración draft/validators/workflow.

Después:

- 4 archivos bloqueados;
- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/data/tya-hr-source-safe-periods.js`;
- `app/index.html`;
- `app/sw.js`.

El SHA validado sigue siendo `489b0420a820b390f4307db93fe8280959f3867c`. No se actualizó porque todavía existen cambios runtime sin una validación equivalente y porque la rama no coincide con el source lock post-V96.

## Interpretación correcta de los dos gates

Los gates responden preguntas distintas:

1. **Drift gate**: qué cambió desde el runtime validado históricamente en `489b...`. Resultado: 4 archivos runtime siguen bloqueados.
2. **Source lock hash gate**: si el runtime actual es exactamente el paquete post-V96 auditado. Resultado: 37 de 67 hashes no coinciden.

No se debe usar el resultado de un gate para ocultar el otro.

## Impacto Phase A

Este bloque evita conectar Auth/Firestore DEV sobre una identidad de frontend equivocada. Protege especialmente:

- roles/personas/scopes y permisos fail-closed;
- proyecto activo y portal cliente multi-proyecto;
- HR Source y candidatos protegidos;
- shoppers y certificaciones carryover;
- liquidaciones/pagos de junio;
- reviewQueue/auditEvents;
- `CX.data` y su futuro punto único de cambio.

No cambia ningún dato TyA ni retrocede contratos ya preparados.

## Legacy útil recuperado

Se conserva la metodología de no perder patches/backend preview ya acumulados. El hallazgo no autoriza copiar la plataforma vieja ni volver a una base anterior; únicamente separa:

- source lock post-V96 auditado;
- runtime histórico presente en la rama;
- adiciones backend safe-only;
- patches frontend previos que deberán revisarse en el empalme.

## Estado de seguridad

- sin cambios en `app/modules`;
- sin cambios en `app/core`;
- sin sustitución de `index.html` o `sw.js`;
- sin actualización del SHA validado;
- sin merge;
- sin deploy;
- sin producción;
- sin Firebase DEV creado/configurado;
- sin Auth, usuarios o claims reales;
- sin Firestore conectado, reglas desplegadas, reads o writes;
- sin import real;
- sin `CX.data` runtime switch;
- sin HR writeback;
- sin Make/Gemini/Storage;
- sin pagos reales;
- sin datos sensibles crudos.

## Decisión

El source lock post-V96 continúa siendo la base operativa correcta de continuidad, pero **la rama activa no puede declararse empalmada con ese runtime**.

El empalme debe ejecutarse en carril frontend/Claude o mediante autorización explícita de excepción, porque implica modificar shell, core, módulos, estilos y service worker. Backend no realizará esa sustitución silenciosamente.

## Siguiente bloque exacto

Preparar y ejecutar un empalme controlado del runtime post-V96 en un carril autorizado, preservando explícitamente las adiciones backend safe-only que deban sobrevivir. Después:

1. rerun del gate de 67 hashes;
2. validación de sintaxis JS;
3. revisión de scripts de `index.html` y manifest/PWA;
4. smoke estático y visual por rol;
5. verificación de copy honesto;
6. actualización del runtime SHA validado solo si todos los gates pasan;
7. recién entonces retomar activación DEV Auth/Firestore.

## Necesidad de Paula

No se necesitan datos, HR, shoppers, certificaciones ni liquidaciones adicionales.

Solo será necesaria autorización explícita cuando se vaya a ejecutar el empalme de runtime en la rama, o capacidad de Claude/frontend para hacerlo sobre el source lock ya auditado.
