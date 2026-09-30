# MIGRACION-TYA-PAQUETE-DATOS.md

## Objetivo

Preparar el paquete limpio de migración TyA para Firestore DEV sin conectar una base vieja ni mezclar datos demo.

Este documento define qué datos pedir, cómo entregarlos y qué validaciones deben pasar antes de cargar la base buena.

## Estado

Preparado. No cargar datos finales hasta cerrar el gate del preview backend:

- Auth OK.
- Fuente Firestore.
- Tenant `tya`.
- Conteos TyA reales.
- Admin lee autorizado.
- Shopper lee solo propios.

## Formato recomendado

Entregar un ZIP limpio con archivos CSV o XLSX separados por pestaña/archivo.

Carpeta sugerida:

```text
tya-migracion-limpia/
  01_shoppers.csv
  02_projects.csv
  03_visits.csv
  04_postulations.csv
  05_questionnaires.csv
  06_benefits_liquidations.csv
  07_certifications.csv
  08_resources_index.csv
  README_ORIGEN.txt
```

## 01_shoppers

Campos mínimos:

- `shopperId`
- `nombre`
- `email`
- `telefono`
- `pais`
- `ciudad`
- `estado`
- `documentoTipo`
- `documentoNumero`
- `banco`
- `tipoCuenta`
- `numeroCuenta`
- `titularCuenta`

Notas:

- `shopperId` debe ser único y estable.
- Datos bancarios deben cifrarse o cargarse con flujo seguro antes de producción.
- No deduplicar por nombre solamente.

## 02_projects

Campos mínimos:

- `projectId`
- `cliente`
- `proyecto`
- `pais`
- `periodo`
- `moneda`
- `estado`
- `fechaInicio`
- `fechaFin`
- `reglasOperativas`

## 03_visits

Campos mínimos:

- `visitId`
- `projectId`
- `pais`
- `ciudad`
- `sucursal`
- `escenario`
- `franja`
- `quincena`
- `shopperId`
- `estado`
- `fechaDisponibleDesde`
- `fechaAgendada`
- `fechaRealizada`
- `fechaCuestionario`
- `fechaSubmitido`
- `honorario`
- `reembolsoBoleto`
- `reembolsoCombo`
- `moneda`

## 04_postulations

Campos mínimos:

- `postulationId`
- `projectId`
- `visitId`
- `shopperId`
- `estado`
- `fechaPostulacion`
- `fechaDecision`
- `motivo`

## 05_questionnaires

Campos mínimos:

- `questionnaireId`
- `projectId`
- `visitId`
- `shopperId`
- `estado`
- `fechaInicio`
- `fechaFinalizacion`
- `score`
- `respuestasJson`
- `evidenciasIndex`

## 06_benefits_liquidations

Campos mínimos:

- `benefitId`
- `projectId`
- `visitId`
- `shopperId`
- `pais`
- `moneda`
- `honorario`
- `reembolso`
- `total`
- `estado`
- `loteId`
- `fechaEstimadaPago`
- `fechaPagada`

## 07_certifications

Campos mínimos:

- `certificationId`
- `projectId`
- `shopperId`
- `estado`
- `score`
- `fechaIntento`
- `fechaAprobacion`
- `vigenteHasta`
- `intentos`

## 08_resources_index

Índice de archivos para carga posterior a Storage.

Campos mínimos:

- `resourceId`
- `projectId`
- `tipo`
- `nombreArchivo`
- `rutaOrigen`
- `descripcion`
- `rolVisible`
- `pais`

## README_ORIGEN

Debe indicar:

- fuente de cada archivo;
- fecha de exportación;
- responsable;
- si contiene datos reales o ficticios;
- columnas omitidas;
- advertencias de calidad.

## Validaciones previas

1. No IDs vacíos.
2. No duplicados por ID.
3. Todo `shopperId` usado en visitas existe en shoppers.
4. Todo `projectId` usado existe en projects.
5. Todo `visitId` usado en beneficios/postulaciones/cuestionarios existe en visits.
6. Fechas en formato ISO o reconocible.
7. País normalizado: GT/HN u otro código acordado.
8. Moneda normalizada.
9. Totales numéricos.
10. Sin datos Orbit ni otro cliente.

## Carga

La carga final debe hacerse primero en Firestore DEV con dry-run, luego commit por lotes y validación UI.

No conectar a base preexistente ni cargar directo a producción.
