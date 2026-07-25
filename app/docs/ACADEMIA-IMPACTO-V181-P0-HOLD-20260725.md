# ACADEMIA — Impacto V181 P0 HOLD

## Estado

V181 no se incorpora como comportamiento aprobado. Las correcciones financieras de fuente se conservan, pero el error de scope impide validar Lotes y CxP histórica.

## Aprendizaje reusable

### Sintaxis no equivale a ejecución

`node --check` confirma que el archivo puede parsearse, pero no resuelve identificadores dentro de callbacks que se ejecutan después.

Un módulo puede pasar sintaxis y fallar con:

```text
ReferenceError: helper is not defined
```

### Aislamiento de módulos

Cada callback `CX.module` tiene scope propio.

- un helper local de Movimientos no está disponible en Liquidaciones;
- una constante local de Movimientos no está disponible en Lotes;
- los helpers compartidos deben declararse en un scope superior explícito o duplicarse localmente cuando corresponda.

### Gates runtime focalizados

R32 conserva las pruebas de fuente y añade un harness mínimo que:

- registra los callbacks;
- renderiza Lotes;
- ejecuta la acción de CxP histórica;
- detecta errores de scope sin deploy ni writes.

## Rutas por rol afectadas

- **Admin/Finanzas:** Lotes y CxP histórica.
- **Shopper:** sin impacto directo nuevo; Beneficios queda pendiente de la validación post-apply.
- **Cliente:** sin exportación o pago habilitado desde el defecto.

## Manuales y cursos

Después de V182 GO incluir:

- diferencia entre gate sintáctico y gate runtime;
- aislamiento de módulos;
- moneda pendiente y acciones fail-closed;
- validación de Lotes y CxP histórica.

## Sin impacto aprobado todavía

No actualizar manuales publicados ni declarar Corte 3 cerrado mientras R32 vigente permanezca HOLD.
