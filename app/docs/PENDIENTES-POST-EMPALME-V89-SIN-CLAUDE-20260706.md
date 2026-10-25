# Pendientes post-empalme V89 sin Claude - CXOrbia TyA

Fecha: 2026-07-06
Base de trabajo: V89 como working candidate controlada

## Estado

Claude no tiene capacidad. Los pendientes siguientes pasan a gestión directa de ChatGPT/Codex, con documentación estricta y sin activar backend real.

## P0 - Copys operativos honestos

### `app/modules/postulaciones.js`

Pendiente corregir:

- `Aprobada · WhatsApp enviado al shopper`
- `Aprobada · WhatsApp enviado`
- `Asignación actualizada · HR sincronizada`

Texto objetivo:

- `Aprobación registrada · notificación preparada`
- `Aprobación registrada · WhatsApp Web/fallback manual preparado`
- `Asignación actualizada · HR sync pendiente backend`

### `app/modules/dashboard.js`

Pendiente corregir:

- `Correo enviado a ... (Make/Outlook)`
- `WhatsApp enviado (Make)`
- badges `En vivo` cuando no exista fuente real confirmada

Texto objetivo:

- `Borrador/notificación preparada`
- `WhatsApp Web/fallback manual preparado`
- `Preview / pendiente backend`

### `app/modules/automatizaciones.js`

Pendiente corregir:

- `Registro de disparos (Make)`
- `últimos eventos enviados`
- `Payload de prueba enviado al escenario Make`
- `Disparo enviado a Make`

Texto objetivo:

- `Registro preview de eventos`
- `Eventos preparados`
- `Payload preparado para revisión`
- `Webhook pendiente backend/gate`

### `app/modules/cuestionario-shopper.js`

Pendiente corregir:

- `marca la visita como cuestionario enviado`

Texto objetivo:

- `marca la visita como cuestionario realizado/completado`

### `app/modules/reservas.js`

Pendiente corregir:

- `Reserva aprobada · visita asignada · shopper notificado`

Texto objetivo:

- `Reserva aprobada · visita asignada · notificación preparada`

## P1 - Manuales y Academia coherentes con backend pendiente

Revisar y corregir textos heredados que prometen capacidades reales sin gate:

- `app/core/manuales-data.js`
- `app/modules/academia.js`

Patrones vivos:

- `lee y escribe de vuelta`
- `HR en vivo`
- `Google Sheets en vivo`
- `doble vía`
- `notificación automática`
- `portal en vivo`
- `pago automático`
- `egresos automáticos`

Texto objetivo:

- `preparado / pendiente backend`
- `preview controlado`
- `requiere gate backend`
- `lectura/escritura real pendiente de autorización`
- `fallback manual`

## P1 - Finanzas / pagos / liquidaciones

Revisar:

- `app/modules/finanzas.js`
- `app/modules/beneficios.js`
- `app/core/liquidacion.js`
- `app/core/notif.js`
- `app/core/automations.js`

Regla:

- No mostrar pago real sin cruce financiero backend.
- No decir `pagada` como operación ejecutada si solo es demo/preview.
- Liquidación candidata, validada, lote y pago deben estar separados.
- Junio sigue siendo corte de pagos/liquidaciones pendientes, no visitas pendientes.

## P1 - Importador / HR / operación extra

Revisar:

- `app/modules/importador.js`
- `app/modules/operacion-extra.js`
- `app/core/hr.js`
- `app/core/programa.js`

Regla:

- No afirmar lectura/escritura real HR si el gate backend está apagado.
- No guardar URL real de HR en frontend.
- Usar `sourceRef` opaco y estados preview/pendiente backend.

## P2 - Correcciones visuales no bloqueantes

Pendiente para después de P0/P1:

- Homologar badges `En vivo`, `Preview`, `Pendiente backend`.
- Revisar microcopys comerciales que puedan sonar a integración real.
- Mantener Academia profunda sin prometer ejecución automática.

## Validaciones mínimas por bloque

Cada bloque local debe terminar con:

- `node --check` sobre JS tocados.
- búsqueda de residuos por patrones críticos.
- documentación de archivos modificados.
- actualización de `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` o addendum.

## Restricciones

No activar:

- Firestore real
- Auth real
- Storage real
- HR writes reales
- Make real
- Gemini real
- WhatsApp real
- correo real
- deploy
- producción
- merge

No subir datos sensibles ni fuentes reales.
