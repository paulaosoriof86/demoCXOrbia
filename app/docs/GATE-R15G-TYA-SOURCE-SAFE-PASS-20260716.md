# GATE R15G — TYA SOURCE-SAFE PASS

Fecha: 2026-07-16  
Workflow run: `29532682880`  
Artifact: `8389252633`  
Digest: `sha256:cf030dafea6fd376e27484296822750fe02a76a8ba97e79ceba0c067af79ce71`

## Decisión

`PASS_R15G_TYA_SOURCE_SAFE_GATES`

## Resultados

### Fuente y mapeo TyA

- Tenant: `tya`.
- Proyecto padre: `cinepolis`.
- Periodos: 14.
- Visitas: 616.
- Shoppers source-safe: 216.
- Cada periodo activo devuelve 44 visitas.
- Países acumulados: GT 476 / HN 140.
- Monedas: Q 476 / L 140.
- Fechas numéricas crudas de spreadsheet: 0.
- Submitido confundido con liquidado/pagado: 0.
- Submitidos HR conservados como `submitted_by_tya`: 401.
- Candidatos pendientes de cruce financiero: 401.
- Pagos confirmados por esta fuente HR: 0; los pagos se confirman únicamente desde la fuente financiera correspondiente.

### Proyecto, periodo, histórico y KPI

- `currentProjectId = cinepolis`.
- `currentPeriodId = cinepolis-YYYY-MM`.
- `CX.data.project()` y `CX.data.period()` devuelven identidades distintas y coherentes.
- MAY/JUN/JUL cambian el conjunto de visitas y el contexto.
- Mayo: 44 visitas, 0 pendientes de ejecución.
- Junio: 44 visitas, 0 pendientes de ejecución y control de pagos/liquidaciones pendiente.
- Julio: 44 visitas, 26 pendientes de ejecución en el snapshot validado.
- Finanzas y liquidaciones quedan acotadas al periodo activo; no mezclan los 14 periodos.

### Smoke por rol

- Admin: PASS, 7 rutas críticas, 0 errores de página y consola.
- Cliente: PASS, 2 rutas críticas, 0 errores de página y consola.
- Shopper: PASS, 4 rutas críticas, 0 errores de página y consola.
- Copy técnico/promesas de integraciones reales detectadas en esas rutas: 0.

## Advertencia no bloqueante de DEV

La validación utiliza un snapshot HR fresco generado durante el build. Esto prueba lectura, mapeo, navegación y lógica source-safe, pero no equivale todavía a sincronización HR en tiempo real ni a importación/materialización de producción.

## Impacto Phase A

Quedan cerrados y protegidos contra regresión:

- proyecto vs periodo;
- cambio histórico de periodo;
- KPI por periodo;
- conteos HR source-safe;
- fechas normalizadas;
- submitido separado de liquidación/pago;
- navegación Admin/Cliente/Shopper.

## Estado seguro

Sin deploy, producción, import real, Firestore/Auth/Storage/HR writes, Make, Gemini ni pagos.