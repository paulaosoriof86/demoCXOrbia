# Academia gate post V89

Fecha: 2026-07-06

Objetivo: dejar una regla auditable para que cada bloque posterior revise impacto en Academia antes de cerrarse.

## Archivos a revisar por cada bloque

- app/modules/academia.js
- app/core/manuales-data.js
- app/modules/automatizaciones.js
- app/modules/postulaciones.js
- app/modules/dashboard.js
- app/modules/finanzas.js
- app/modules/cuestionario-shopper.js
- app/modules/reservas.js

## Patrones P0 a eliminar o matizar

- Mensajeria marcada como enviada sin proveedor confirmado.
- Correo marcado como enviado sin cuenta/proveedor confirmado.
- HR marcada como sincronizada sin gate backend.
- Shopper marcado como notificado sin canal real confirmado.
- Cuestionario marcado como enviado cuando debe ser realizado/completado.

## Patrones P1 a revisar

- Make activo.
- Google Sheets en vivo.
- Portal en vivo.
- Pago automatico.
- Egreso automatico.
- Sincronizado o sincronizada cuando no haya gate real.
- En vivo cuando la fuente sea preview/demo/local.

## Regla de cierre

Un bloque que toque operacion, HR, pagos, notificaciones, Make, Gemini, cuestionarios, beneficios o multi-proyecto debe documentar impacto Academia en el tracker post V89.

## Estado seguro

Documento de control. Sin runtime, sin proveedores externos, sin produccion y sin datos sensibles.
