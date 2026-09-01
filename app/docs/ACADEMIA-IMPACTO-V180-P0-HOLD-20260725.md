# ACADEMIA — Impacto V180 P0 HOLD

## Estado

V180 no se incorpora como comportamiento aprobado. Las mejoras de formularios y bloqueo se conservan, pero el cierre financiero requiere V181 y R32 PASS.

## Conceptos a documentar después de V181 GO

### Exacta vs revisión

- una fila en revisión se conserva y es visible;
- no participa en ingreso, honorario, margen, CxP, CxC, pago ni export;
- la revisión no se convierte en cero ni se mezcla con datos exactos.

### Presupuesto

- abrir un periodo no crea ni copia presupuesto;
- sin fuente se muestra Pendiente de fuente;
- copiar presupuesto requiere una acción explícita y auditable.

### CxP

- una obligación tiene un solo origen contable;
- liquidación y financiamiento no se vuelven a sumar;
- moneda es obligatoria antes de abono o pago.

### Liquidaciones y lotes

- moneda pendiente bloquea edición monetaria, pago y export;
- Revisión requerida nunca equivale a Pagado o Preview;
- los handlers vuelven a validar, aunque el botón esté oculto.

### Beneficios

- moneda faltante se muestra en revisión;
- no se omite silenciosamente;
- no afecta KPIs, barras ni beneficio total.

### Límite de gates

R32 es el cierre de fuente. Datos TyA, móvil, host y archivos abiertos se validan post-apply; no generan otra candidata por sí solos.

## Rutas por rol

- **Admin/Finanzas:** cola de revisión, presupuesto, CxP, liquidaciones, lotes y export.
- **Shopper:** Beneficios por moneda confirmada.
- **Cliente:** métricas solo de filas exactas y utilizables.

## Manuales pendientes

Actualizar solo después de V181 GO, empalme y validación visual:

- Manual de Finanzas;
- Movimientos y Tesorería;
- Liquidaciones y Lotes;
- Beneficios Shopper;
- curso financiero source-safe.
