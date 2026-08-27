# DECISION-MODELO-LIQUIDACIONES-BENEFICIOS-FINANZAS-TYA-CXORBIA-20260629

## Contexto

Paula aclaró el concepto correcto de reembolsos, honorarios, liquidaciones, beneficios de shoppers y módulo financiero para T&A/CXOrbia.

## Aclaración principal

En T&A, lo que aparece como boleto y combo corresponde a reembolsos operativos de visita.

Flujo económico real:

1. T&A reembolsa a Paula/franquiciada.
2. Paula reembolsa al shopper.
3. Paula paga al shopper honorarios por servicio de cliente incógnito.

Para Guatemala, el honorario base mencionado para Cinépolis es Q60 por visita, más los reembolsos que correspondan al boleto y combo.

## Qué NO debe asumirse

No se debe asumir que toda `liquidation` histórica representa un pago bancario ya ejecutado.

No se debe cerrar mayo/junio como pagado solo porque exista una visita, cuestionario o cálculo de beneficio.

Paula indicó que todavía puede tener pagos pendientes de mayo y junio. Esos pagos y movimientos se cargarán posteriormente con un archivo histórico de movimientos para el módulo financiero.

## Conceptos separados

### 1. Beneficio calculado del shopper

Es el derecho económico esperado por visita:

- honorario shopper;
- reembolso boleto;
- reembolso combo;
- moneda;
- país;
- visita;
- periodo;
- estado de visita/cuestionario/submitido;
- estado de pago.

Este concepto alimenta `Mis beneficios` del shopper y también la operación financiera.

### 2. Reembolso franquiciada / T&A hacia Paula

Es el ingreso o recuperación que T&A hace a Paula/franquiciada por concepto de reembolsos de visitas, según boleto/combo y reglas del proyecto.

Este concepto pertenece al módulo financiero de Paula/T&A, no debe confundirse con pago al shopper.

### 3. Pago al shopper

Es el egreso real o pendiente hacia el shopper:

- honorario;
- reembolso boleto;
- reembolso combo;
- lote de pago;
- fecha pagado;
- método/cuenta si aplica;
- conciliación bancaria cuando exista movimiento financiero.

### 4. Movimiento financiero real

Es el registro contable/financiero importado desde el histórico de movimientos o capturado en vivo.

Debe usarse para confirmar pagos efectivamente realizados, conciliación, pendientes y flujo financiero real.

## Regla para migración HR V4

La fuente HR histórica puede calcular beneficios esperados y estados operativos por visita, pero no debe convertirse automáticamente en verdad final de pagos bancarios realizados.

La carga HR V4 sí puede generar o alimentar documentos calculados de beneficios/liquidaciones esperadas, pero los pagos reales y pendientes deben reconciliarse contra el histórico financiero/movimientos.

## Mis beneficios del shopper

Cada shopper debe poder ver:

- histórico completo propio;
- beneficios del mes en curso;
- saldos no pagados de meses anteriores;
- detalle por visita;
- honorarios;
- reembolsos de boleto y combo;
- estado: calculado, pendiente, programado, pagado, observado o conciliado.

La búsqueda y consolidación debe normalizar nombres porque pueden existir variaciones:

- mayúsculas/minúsculas;
- nombres incompletos;
- diferencias de escritura;
- acentos;
- duplicados potenciales.

## Normalización de shopper

El registro canónico de shopper debe usar:

- `shopperId` estable;
- `fullNameCanonical`;
- `firstName`;
- `lastName`;
- `displayName`;
- `nameKey` normalizada sin acentos, minúscula y sin espacios duplicados;
- `username` con patrón `nombre.apellido`;
- alias históricos para vincular variaciones anteriores.

Cuando se creen usuarios, el username debe normalizarse con patrón `nombre.apellido`.

## Modelo recomendado para CXOrbia

Separar colecciones/conceptos:

- `visits`: operación de visitas.
- `shopperBenefits`: beneficios calculados por visita/shopper.
- `paymentLots`: lotes de pago a shoppers.
- `financialMovements`: movimientos reales importados o capturados.
- `reconciliations`: conciliación entre beneficios/lotes y movimientos reales.
- `shopperAliases` o campos alias dentro de `shoppers`: normalización histórica de nombres.

## Impacto inmediato sobre la validación HR V4

Los 269 faltantes actuales de `liquidations` no se deben corregir a ciegas como pagos realizados.

Antes de cualquier carga complementaria se debe revisar si esos documentos representan:

1. beneficios calculados esperados por visita; o
2. liquidaciones/pagos reales; o
3. un nombre temporal incorrecto usado por el transformador.

Si son beneficios calculados, corresponde renombrar conceptualmente a `shopperBenefits` o documentar `liquidations` como capa provisional de beneficios esperados, no como pago real.

## Clasificación doble documentación

- TyA específico: flujo T&A → Paula/franquiciada → shopper, Q60 de honorarios, boleto/combo como reembolsos y pagos pendientes mayo/junio.
- CXOrbia generalizable: separación entre beneficio calculado, pago real, movimiento financiero, conciliación y vista histórica del evaluador.

## Restricciones conservadas

- No se escribió Firestore.
- No se repitió carga.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
