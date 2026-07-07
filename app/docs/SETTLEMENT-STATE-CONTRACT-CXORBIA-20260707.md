# Settlement state contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para estados de beneficios/liquidaciones.

Archivo creado:

- `tools/contracts/cxorbia-liquidation-payment-state-contract.mjs`

## Objetivo

Separar visita ejecutada de liquidacion confirmada.

El contrato permite manejar por tenant/proyecto: periodo, pais, moneda, honorario, reembolso, ajuste, total, estado, evidencia segura y revision humana.

## Estados del contrato

- `pending_calculation`
- `pending_review`
- `scheduled`
- `paid_confirmed`
- `blocked_review`
- `carried_forward`
- `voided`

## Reglas clave

- El total debe cuadrar con honorario, reembolso y ajuste.
- La confirmacion requiere fecha y revisor.
- La programacion requiere revisor.
- Si falta referencia de fuente, pasa a revision.
- El contrato usa fixtures sinteticos y referencias seguras.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para clientes con beneficios, honorarios, reembolsos o liquidaciones por proyecto.

### Exclusivo cliente

No contiene reglas reales del cliente actual ni montos reales.

### Claude/prototipo

Debe incluirse en el proximo paquete Claude para UI de estados de beneficios/liquidaciones, badges por estado y copy honesto.

### Academia

Debe explicar diferencia entre visita ejecutada, liquidacion en revision, programada y confirmada.

### Sin impacto Claude

No cambia UI directamente.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
