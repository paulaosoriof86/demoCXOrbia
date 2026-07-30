# PLAN-DRY-RUN-IMPORTADOR-FINANCIERO-TYA-20260629

## Objetivo

Preparar un dry-run seguro para transformar el archivo financiero histórico de Paula en datos CXOrbia/TyA, sin escribir Firestore.

## Fuente

```text
2026 Ingresos Egresos y Presupuesto Paula.xlsx
```

## Alcance autorizado hasta ahora

Solo diagnóstico y diseño. No hay autorización para escribir Firestore ni para importar movimientos reales todavía.

## Hojas incluidas

El dry-run debe incluir únicamente hojas relacionadas con TyA:

- hojas TyA Guatemala;
- hojas TyA Honduras;
- hojas Liquidación asociadas a TyA;
- histórico desde 2025;
- `May HN 26` como TyA Honduras aunque el nombre no incluya TyA.

## Hojas excluidas

Debe excluir:

- movimientos personales;
- otros negocios;
- clientes/proyectos no TyA;
- hojas de presupuesto general no vinculadas a TyA;
- hojas anteriores a 2025 salvo autorización explícita.

## Transformación esperada

El dry-run debe clasificar registros en:

1. `financialMovements`: ingresos/egresos reales.
2. `shopperBenefits`: beneficios calculados cuando puedan cruzarse con HR/visita.
3. `paymentLots`: pagos agrupados a shoppers cuando la hoja Liquidación lo permita.
4. `reconciliations`: cruces sugeridos entre movimientos, pagos y beneficios.
5. `ignoredRows`: filas fuera de alcance o no clasificables.
6. `issues`: ambigüedades, hojas sin mapeo, monedas faltantes, nombres sin match.

## Reglas TyA confirmadas

- GT/Cinépolis: honorario según configuración del proyecto, por ejemplo Q60 cuando aplique.
- HN/Cinépolis: honorario L200.
- Hasta abril: pagado.
- Mayo: mayoría de primera quincena pagada; segunda quincena con pendientes parciales.
- Junio en adelante: operación desde plataforma o importaciones futuras.

## Cruces necesarios

El dry-run debe cruzar contra HR V4 por:

- periodo;
- país;
- proyecto;
- shopper normalizado;
- sucursal/visita cuando exista;
- quincena;
- monto;
- estado de pago.

## Normalización shopper

Para cada nombre detectado en Liquidación o movimientos:

- generar `nameKey`;
- comparar contra shoppers HR V4;
- detectar alias;
- sugerir shopperId;
- reportar nombres ambiguos;
- no crear usuarios automáticamente sin autorización.

## Salidas locales esperadas

El script debe generar en `firebase/private-output`:

```text
financial-tya-dry-run-summary.md
financial-tya-dry-run-details.json
financial-tya-ignored-rows.csv
financial-tya-name-matches.csv
```

## Criterio para permitir escritura posterior

Antes de escribir Firestore, Paula debe ver y aprobar:

- total de hojas procesadas;
- total de filas leídas;
- total de movimientos clasificados;
- total de pagos detectados;
- total de pendientes;
- total de filas ignoradas;
- lista de nombres ambiguos;
- totales por país/moneda/mes;
- confirmación de que no entraron datos personales ni de otros negocios.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin modificar `/app/modules`.
