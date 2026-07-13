# CXOrbia TyA — protocolo obligatorio de validación visual

Fecha: 2026-07-13

## Corrección de estado

La URL `https://cxorbia-backend-dev.web.app` continúa sirviendo por ahora la build anterior desplegada. Esa build contiene el payload TyA source-safe, pero no lo presenta correctamente en todas las superficies visibles; por lo tanto, **no debe usarse todavía para aprobar visualmente la migración TyA**.

La corrección fue construida y validada en CI, pero aún necesita un nuevo deploy exclusivo a Hosting DEV.

## Causa raíz

El smoke anterior verificaba:

- existencia del payload source-safe;
- conteos internos;
- carga de rutas;
- ausencia de errores de página.

No verificaba que una persona realmente viera:

- marca TyA;
- proyecto Cinépolis;
- periodos TyA correctamente separados;
- ausencia de proyectos demo Retail/Banca/Restaurantes;
- información del periodo seleccionado.

Además, el bridge anterior se ejecutaba antes de `core/data-source.js`; luego el selector de origen volvía a declarar modo demo. Los 14 periodos también compartían el mismo ID lógico `cinepolis`, por lo que no podían funcionar como periodos seleccionables independientes.

## Corrección implementada

Sin modificar `/app/modules` ni `/app/core`, el build genera un adapter DEV en el único punto de conexión de datos, después de `core/data-source.js`.

El adapter corregido:

- activa `source_safe_preview / ready`;
- muestra branding TyA;
- conserva Cinépolis como proyecto configurable;
- crea 14 IDs de periodo únicos, de `cinepolis-2025-06` a `cinepolis-2026-07`;
- vincula cada una de las 616 visitas con su periodo;
- deja 44 visitas en el periodo seleccionado;
- carga 210 shoppers source-safe;
- elimina de la vista los proyectos demo Retail, Banca y Restaurantes;
- conserva `imported:false` y `production:false`.

Validación CI:

- run: `29283637827`;
- visible TyA data smoke: PASS;
- legacy route inventory: PASS;
- artifact digest: `sha256:cfcdaa7cbbc2a66d9f52d3d3071459634192c6ccfc92a3e28bcf20ab7b07d1a1`.

## Regla obligatoria desde este bloque

Nunca se volverá a informar una revisión visual solo con una URL.

Cada revisión visual deberá incluir obligatoriamente:

1. URL y ambiente exacto.
2. Build o checkpoint que se está revisando.
3. Perfil con el que se debe ingresar.
4. Ruta o módulo que se debe abrir.
5. Texto, conteo o estado que debe aparecer.
6. Lo que todavía no es real o no está autorizado.
7. Formato para que Paula reporte aprobado, diferencia o error.

Tampoco se declarará `visual PASS` únicamente porque existe un payload o porque las rutas no fallan. El gate visual debe inspeccionar el contenido visible.

## Próxima revisión visual — después del redeploy corregido

### URL

`https://cxorbia-backend-dev.web.app`

No revisar hasta recibir confirmación explícita de que la **build visible TyA corregida** fue redesplegada.

### Perfil inicial

Seleccionar `Administración / Coordinación`.

### Pantalla de ingreso esperada

Debe mostrar:

- nombre `TyA`;
- texto `Tenant TyA · Phase A controlada`;
- países GT y HN;
- no debe mostrar `Demo comercial`.

### Barra superior esperada

Debe mostrar un estado equivalente a:

`Source-safe (preview) · Listo`

No debe afirmar `Conectado`, `Importado` o `Producción`.

### Proyectos y periodos

En `Proyectos` o selector principal:

- único proyecto operativo: `Cinépolis`;
- no deben aparecer `Proyecto Retail`, `Proyecto Banca` ni `Proyecto Restaurantes`;
- deben existir 14 periodos desde `JUN 2025` hasta `JUL 2026`;
- el periodo más reciente debe ser `JUL 2026`;
- al cambiar de periodo deben cambiar las visitas mostradas.

### Visitas

En `Visitas`:

- periodo actual JUL 2026: 44 visitas;
- cobertura histórica total: 616;
- Guatemala: 34 por periodo;
- Honduras: 10 por periodo;
- las visitas deben mostrar país, sucursal, quincena, franja, estado y fechas source-safe;
- junio 2026 no debe figurar como visitas pendientes de ejecutar.

### Shoppers

En `Shoppers`:

- 210 registros source-safe visibles;
- nombres/datos personales protegidos;
- los 3 faltantes históricos no deben fusionarse por nombre ni aparecer inventados;
- el gap 210/213 permanece pendiente de revisión backend.

### Finanzas y certificaciones

Todavía no aprobar como datos definitivos:

- pagos ejecutados;
- 572 controles como pagos;
- 196 overlays como pagos confirmados;
- certificaciones carryover como materializadas;
- sincronización HR ↔ plataforma;
- Auth real;
- producción.

## Formato de respuesta de Paula

Después de revisar, reportar por módulo:

- `APROBADO`;
- `DIFERENCIA: esperado / observado`;
- `ERROR: acción realizada / resultado`.

Captura solo cuando exista una diferencia o error; no se pedirá evidencia manual innecesaria cuando el módulo esté aprobado.

## Checkpoints posteriores

1. Build visible TyA source-safe corregida.
2. Materialización Firestore DEV.
3. Auth/roles y fuentes pendientes.
4. Operación HR ↔ plataforma, certificaciones y liquidaciones.
5. Ensayo final antes de producción.

En cada checkpoint se entregará una lista específica distinta; no se reutilizará una lista genérica.

## Clasificación

- **Reusable CXOrbia:** protocolo de validación humana y gate sobre contenido visible.
- **Exclusivo cliente:** TyA/Cinépolis, 14 periodos, 616 visitas y 210/213 shoppers.
- **Claude/prototipo:** no hay P0 de diseño; el defecto estaba en el binding de build/backend.
- **Academia:** explicar cómo validar ambiente, fuente, proyecto, periodo y estados honestos.
- **Sin impacto Claude:** CI, adapter generado, hashes y deploy Hosting DEV.
