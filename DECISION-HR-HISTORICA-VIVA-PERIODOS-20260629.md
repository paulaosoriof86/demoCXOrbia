# DECISION-HR-HISTORICA-VIVA-PERIODOS-20260629

## Contexto

Paula aclaro que la HR sincronizada no debe tratarse solo como una migracion estatica historica. Es una fuente viva: cada mes se crea o actualiza una seccion/hoja y cada seccion debe poder elegirse como periodo de revision.

## Aclaracion

Lo realizado hasta ahora es una lectura y transformacion local del historico multihoja para conocer estructura, conteos y mapeo de datos buenos. No es todavia la automatizacion viva ni la carga final a Firestore.

## Modelo recomendado

La HR debe manejarse como fuente viva con dos capas:

1. Importacion historica inicial
   - Cargar todas las hojas existentes de GT/HN.
   - Crear un proyecto/periodo por hoja o por mes-pais.
   - Mantener trazabilidad por `sourceSheet`, `sourceRow`, `periodKey`, `country` y `projectId`.

2. Sincronizacion mensual recurrente
   - Detectar nuevas hojas mensuales.
   - Crear automaticamente el periodo/proyecto correspondiente si no existe.
   - Actualizar visitas existentes por clave estable.
   - Insertar nuevas visitas.
   - No duplicar shoppers, cuestionarios ni liquidaciones.

## Periodos

Cada modulo operativo debe poder filtrar por periodo:

- Periodo mensual: `YYYY-MM`.
- Pais: `GT` o `HN`.
- Hoja fuente: por ejemplo `JUNIO 26`, `JUNIO 26 HN`.
- Proyecto/periodo Firestore: `cinepolis-junio-26`, `cinepolis-junio-26-hn`.

## Datos vivos de HR

Deben leerse y actualizarse desde HR:

- Shopper asignado.
- Fecha programada.
- Fecha realizada.
- Cuestionario completado.
- Fecha submitido.
- Liquidado.
- Disponible desde.
- Campos operativos de sucursal, ciudad, franja, quincena, escenario, honorarios/reembolsos cuando apliquen.

## No usar como fuente confiable

- Dashboards antiguos.
- KPIs agregados defectuosos.
- Capturas como fuente primaria.
- Evidencias/archivos mientras Storage siga pendiente.
- Datos privados en claro.

## Pendiente

Crear flujo de importacion/sync incremental HR -> Firestore DEV, con opcion de seleccionar periodo en preview y posteriormente en UI.

## Restricciones conservadas

- No se escribio Firestore en esta decision.
- No Hosting.
- No merge.
- No produccion.
- No cambios en `/app/modules`.
