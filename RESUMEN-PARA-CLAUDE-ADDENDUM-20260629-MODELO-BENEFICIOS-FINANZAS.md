# RESUMEN-PARA-CLAUDE-ADDENDUM-20260629-MODELO-BENEFICIOS-FINANZAS

## Contexto

Paula aclaró el modelo económico correcto para T&A/CXOrbia. Esta aclaración es crítica para no confundir liquidaciones/pagos reales con beneficios calculados desde HR.

## Aclaración de negocio

En Cinépolis/T&A:

- boleto y combo son reembolsos;
- T&A reembolsa a Paula/franquiciada;
- Paula reembolsa a los shoppers;
- Paula paga además honorarios al shopper, por ejemplo Q60 por visita en GT;
- mayo y junio pueden tener pagos pendientes todavía;
- pagos reales y pendientes se cargarán con histórico de movimientos para el módulo financiero.

## Corrección conceptual necesaria

No se debe asumir que `liquidations` del HR V4 equivale a pago bancario realizado.

Puede ser una capa provisional de beneficio calculado por visita/shopper, pero el pago real debe venir de:

- lotes de pago;
- fecha real pagada;
- histórico de movimientos financieros;
- conciliación bancaria/financiera.

## Recomendación para frontend/prototipo

Claude debe separar visual y funcionalmente:

1. `Mis beneficios` del shopper: histórico propio, mes actual y saldos no pagados de meses anteriores.
2. Beneficios calculados: honorario + boleto + combo por visita.
3. Pagos reales: estados pagado/pendiente/programado/conciliado.
4. Módulo financiero: movimientos reales, reembolsos de T&A a Paula, pagos de Paula a shoppers, conciliación.

## Normalización de shoppers

El shopper debe consolidarse aunque el nombre venga escrito diferente:

- mayúsculas/minúsculas;
- incompleto;
- con/sin acentos;
- variaciones históricas.

Campos sugeridos:

- `fullNameCanonical`;
- `nameKey`;
- `aliases`;
- `username` en patrón `nombre.apellido`;
- `shopperId` estable.

## Impacto sobre HR V4

La validación HR V4 encontró liquidaciones faltantes, pero antes de cargar complemento se debe decidir si esos documentos representan beneficios calculados o pagos reales.

No cargar como pagos reales si solo son beneficios esperados desde HR.

## Restricciones

- No tocar `/app/modules` desde backend.
- Si frontend requiere ajuste, anotarlo para Claude.
- No activar adapter global.
- No Hosting.
- No merge.
- No producción.
