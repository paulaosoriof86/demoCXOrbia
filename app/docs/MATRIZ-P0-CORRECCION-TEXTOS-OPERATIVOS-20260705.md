# Matriz P0 correccion textos operativos - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Dejar una matriz accionable para la futura intervencion P0, sin tocar frontend desde backend.

## Matriz

| Area | Riesgo P0 | Reemplazo seguro | Estado |
| --- | --- | --- | --- |
| WhatsApp | Dice enviado sin envio real | Plantilla lista / pendiente backend | Pendiente frontend |
| Correo | Dice enviado sin cuenta real | Correo preparado / pendiente backend | Pendiente frontend |
| HR | Dice sincronizada sin sync real | Cambio preparado para sincronizacion | Pendiente frontend |
| Make | Promete accion real | Integracion pendiente backend | Pendiente frontend |
| Cuestionario | Dice enviado como etapa general | Realizado / completado / pendiente revision | Pendiente frontend |
| Academia | Promete automatizaciones reales | Preparado / configurable / pendiente backend | Pendiente frontend |
| Manuales | Explican flujo como activo real | Flujo preparado y gate pendiente | Pendiente frontend |
| Liquidacion | Confunde realizado, submitido y pago | Separar estados operativos y financieros | Pendiente frontend/backend doc |

## Archivos probables a revisar

- `app/modules/postulaciones.js`
- `app/modules/dashboard.js`
- `app/core/topbar.js`
- `app/modules/correo.js`
- `app/core/automations.js`
- `app/core/manuales-data.js`
- `app/modules/academia.js`
- `app/core/liquidacion.js`

## Criterio de cierre

P0 cierra solo si no quedan mensajes que simulen envios, sincronias o automatizaciones reales sin backend activo.

## Regla

Esta matriz es documental. No modifica frontend ni autoriza source lock.
