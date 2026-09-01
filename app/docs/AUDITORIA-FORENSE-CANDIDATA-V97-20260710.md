# Auditoría forense candidata V97

Fecha: 2026-07-10

## Decisión

`HOLD / NO EMPALMAR COMO NUEVA BASELINE TODAVÍA`.

La candidata V97 contiene avances útiles que deben preservarse, pero deja pendientes P0 del paquete integral e introduce una regresión semántica en los flujos de IA. La baseline vigente continúa siendo el source lock post-V96.

- Baseline ZIP SHA-256: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.
- V97 ZIP SHA-256: `05a9debabb306c431faa92bba71f7d661424385f9a0cd7a748f04aa94982dcb8`.

## Comparación real

- 100 archivos en baseline.
- 100 archivos en V97.
- 0 agregados.
- 0 eliminados.
- 96 idénticos byte a byte.
- 4 modificados:
  - `core/automations.js`;
  - `modules/academia.js`;
  - `modules/automatizaciones.js`;
  - `docs/CAMBIOS-CLAUDE-CANDIDATE-COMPLETO-POST-SYNTHETIC-COVERAGE-20260708.md`.

V97 es un delta pequeño, no una reconstrucción. No corresponde volver a pedir ni reimplementar las capacidades contenidas en los 96 archivos intactos.

## Validación estructural

- 63 archivos JavaScript verificados con `node --check`.
- 0 errores de sintaxis.
- 63 scripts declarados por `index.html`.
- 61 scripts locales.
- 0 scripts locales faltantes.
- 0 scripts locales duplicados.
- 48 módulos reales, sin ID duplicado.
- Sin cambio en orden de scripts.
- 0 archivos de texto con BOM.
- Sin error UTF-8 ni mojibake real.

## Avances confirmados

### IA

- Se retiraron los `fetch` directos del navegador a Gemini, OpenAI, Anthropic y endpoint personalizado.
- `cx_ai` ya no acepta ni persiste `apiKey`/`endpoint`.
- Los residuos heredados de esos dos campos se purgan al leer.
- Automatizaciones ya no muestra un input de API key para IA.
- Se conservaron las firmas públicas `CX.ai.ask/ready/cfg/save/PROVIDERS`.

### Academia

- Se agregaron `estado`, `v` y `auditRef` a cursos personalizados.
- Se agregaron duplicar, archivar, restaurar y auditoría local.
- Se agregó vista de archivados.
- Se corrigió el bug de audiencia: editar/crear respeta `CX._acadAud`.
- Se profundizaron seis lecciones existentes:
  - `mg1`: 3,798 a 10,849 caracteres;
  - `mg2`: 2,765 a 7,498;
  - `mg3`: 2,202 a 6,034;
  - `mg4`: 2,579 a 6,963;
  - `smg1`: 1,814 a 3,966;
  - `smg2`: 1,517 a 2,624.

## Bloqueadores y pendientes

### 1. Regresión semántica de IA

`CX.ai.ready()` devuelve verdadero cuando solo existe una preferencia activa, pero `CX.ai.ask()` siempre rechaza. Esto hace que varios módulos entren a una rama supuestamente disponible y terminen en error.

Sin fallback suficiente:

- generación de curso en Academia;
- generación de banco de certificación;
- generación/mejora de Documentos;
- generación de reporte ejecutivo.

Con fallback confirmado:

- creación de lección;
- creación de manual;
- Importador;
- Correo;
- algunos flujos de CRM/Marca.

La documentación afirma que todos los módulos caen a heurística local, pero el código lo contradice. Debe separarse `preferred` de `available/connected`, o mantener `ready()` falso sin adapter backend.

### 2. Secretos todavía en el navegador

`modules/integraciones.js` continúa solicitando y guardando en `localStorage`:

- API keys;
- tokens;
- contraseñas;
- bot tokens;
- OAuth;
- hosts/endpoints;
- URLs de webhook.

Automatizaciones también conserva webhook global y webhooks por automatización en el navegador. Por tanto, el P0 de proveedores/secretos fuera del navegador está parcialmente resuelto, no cerrado.

### 3. Manuales contradictorios

`core/manuales-data.js` y contenidos de Academia todavía indican pegar API keys, webhooks y `firebaseConfig`, e incluso explican que en el prototipo se guardan credenciales localmente. Deben alinearse con la arquitectura backend-only.

### 4. Modos de datos y bridge

No se implementaron:

- máquina exclusiva `demo/source_safe_preview/connected`;
- bridge genérico en el punto único de `CX.data`;
- hidratación atómica antes del render;
- exclusión mutua de seeds;
- bloqueo de fallback demo silencioso.

`index.html` no carga payload ni bridge source-safe. `core/data.js` continúa siendo fuente demo principal.

### 5. Mezcla demo

Como los módulos correspondientes son idénticos a baseline, siguen presentes datos demo en:

- Certificaciones;
- Finanzas/Lotes;
- Correo;
- Soporte;
- portales y dashboards.

Faltan vacíos honestos y derivación por modo activo.

### 6. Permisos por acción

La matriz de rutas/scopes existente se preservó, pero no se agregó autorización genérica por acción sensible. Las nuevas acciones de Academia se apoyan principalmente en `role==='admin'`, no en permiso de acción/rol efectivo/persona/scope.

### 7. Academia parcial

- `delCourse()` sigue haciendo hard delete sin motivo ni auditoría.
- Restaurar salta directamente a `publicado_preview`.
- Faltan estados en revisión, aprobado y publicación separada de preview.
- No existe transición genérica de estado.
- Faltan notificaciones de cambios/versiones.
- Auditoría es local/mutable y debe rotularse como preview.
- `_purgeTestArtifacts()` borra un ID y un título exactos de prueba; puede eliminar contenido legítimo y no debe quedar en producto.

### 8. PWA

`sw.js` no cambió y conserva `const CX_CACHE = 'cxorbia-v2'`. Falta cache key por build/source lock, manejo de respuestas fallidas y fallback offline explícito.

### 9. Neutralidad multi-tenant

Persisten residuos runtime de países/proyectos/clientes y versiones históricas. El catálogo global de países es válido; no lo es usar ejemplos particulares como seed obligatorio, NDA base o contenido central no configurable.

### 10. Entrega de Claude

Solo se amplió un changelog acumulativo. No se actualizaron de forma completa auditoría, resumen, pendientes, matriz por requisito ni reporte de pruebas exigido. El changelog contiene afirmaciones contradichas por el código.

## Clasificación obligatoria

- Reusable CXOrbia: IA vía adapter, modos de datos, `CX.data`, gates, seguridad, permisos por acción, ciclo Academia, PWA versionada.
- Exclusivo cliente: no debe incorporarse al prototipo genérico; se resuelve en configuración/backend.
- Claude/prototipo: corregir solo las brechas demostradas, preservando V97 y los 96 archivos intactos.
- Academia: impacto alto; expansión útil, pero ciclo/notificaciones/manuales siguen parciales.
- Sin impacto Claude: backend real, providers, secrets, imports, writes, deploy y producción.

## Siguiente secuencia

1. Mantener baseline post-V96.
2. No empalmar V97 completa.
3. Entregar a Claude corrección focalizada sobre V97.
4. Preservar avances confirmados.
5. Reauditar diferencialmente.
6. Crear source lock solo si desaparecen los bloqueadores.
7. Después continuar preview source-safe y autorización separada de deploy.

## Estado seguro

Auditoría solamente. Sin cambios de runtime, sin merge, sin deploy, sin producción, sin Auth/Firestore/Storage writes, sin import, sin HR writeback, sin Make/Gemini real y sin pagos reales.