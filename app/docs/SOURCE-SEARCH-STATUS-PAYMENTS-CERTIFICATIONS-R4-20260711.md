# Estado de búsqueda de fuentes limpias — pagos y certificaciones R4

Fecha: 2026-07-11

## Revisado

- documentos maestros y addenda;
- repo/rama/PR #7;
- herramientas y contratos existentes;
- búsquedas de código por pagos, liquidaciones, certificaciones y carryover;
- Fuentes/File Library disponibles para esta conversación.

## Resultado

Se recuperaron reglas, estados, histórico y referencias operativas, pero no se encontró todavía un archivo limpio utilizable como fuente para ejecutar el dry-run real de:

1. pagos/movimientos históricos hasta mayo y control de junio Q1/Q2;
2. certificaciones ya presentadas por shopper/proyecto.

El HTML legacy contiene aprendizaje de flujo, pero no se usa como export limpio ni como fuente financiera/certificación.

La búsqueda adicional en File Library falló por error técnico del servicio de recuperación. No se afirma que el archivo no exista fuera de lo accesible; solo que no pudo recuperarse en este bloque.

## Insumo puntual pendiente

Cuando se requiera continuar el dry-run real, los únicos insumos faltantes son:

- export sanitizado de pagos/movimientos en CSV/XLSX/JSON, con `visitId`, `hrRowId` o `paymentItemId` estable;
- export sanitizado de certificaciones presentadas, con `shopperId` o `shopperCode`, proyecto, certificación, fecha/resultado/estado y fuente.

No se deben pedir nuevamente reglas HR, Q1/Q2, montos, shoppers o lógica de carryover.
