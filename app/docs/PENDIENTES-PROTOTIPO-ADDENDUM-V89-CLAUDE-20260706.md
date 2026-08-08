# Pendientes prototipo addendum V89 Claude - CXOrbia TyA

Fecha: 2026-07-06
Fuente: auditoria de `Prototype development request CXOrbia V89.zip`

## Decision

V89 corrige parcialmente V88, pero no cierra P0 ni queda como source lock final.

## Corregido en V89

- Academia: IDs nuevos corregidos:
  - `a_backend_prepared` para "Capacidades de backend: que esta preparado".
  - `a_ops_conflicts_route` para "Equipo operativo: asignacion, conflictos y fuera de rango".
- `app/core/automations.js`: HR writeback queda como escritura preparada/sync backend pendiente.
- `app/modules/postulaciones.js`: textos de reprogramacion quedan como notificacion preparada/pendiente confirmacion.
- Sintaxis JS: limpia en auditoria estatica.

## P0 vivo - Textos honestos que siguen pendientes

Claude debe entregar una candidata ultra-corta corrigiendo estos residuos, sin redisenar:

### `app/modules/postulaciones.js`

- Reemplazar `Aprobada · WhatsApp enviado al shopper`.
- Reemplazar `Aprobada · WhatsApp enviado`.
- Reemplazar `Asignacion actualizada · HR sincronizada`.

Texto esperado: `aprobacion registrada`, `notificacion preparada`, `WhatsApp Web/fallback manual`, `pendiente confirmacion`, `se reflejara en HR cuando el sync backend este activo`, o equivalente honesto.

### `app/modules/dashboard.js`

- Reemplazar `Correo enviado a ... shopper(s) (Make/Outlook)`.
- Reemplazar `WhatsApp enviado (Make)`.
- Revisar badge `En vivo` si no corresponde a dato realmente conectado.

Texto esperado: `borrador preparado`, `notificacion preparada`, `payload preview`, `pendiente backend`, `fallback manual`.

### `app/modules/automatizaciones.js`

- Reemplazar `Registro de disparos (Make)` si sugiere ejecucion real.
- Reemplazar `ultimos eventos enviados`.
- Reemplazar `Payload de prueba enviado al escenario Make`.
- Reemplazar `Disparo enviado` o equivalentes.

Texto esperado: `registro preview`, `payload preparado`, `evento registrado`, `pendiente backend`, `simulacion`.

### `app/modules/cuestionario-shopper.js`

- Reemplazar `marca la visita como cuestionario enviado` por `cuestionario realizado` o `cuestionario completado`.

### `app/core/manuales-data.js`

- Reemplazar `cuestionario enviado` cuando se refiera al flujo operativo TyA.
- Revisar afirmaciones de HR viva que digan que lee/escribe de vuelta o no duplica si el backend/gate no esta activo.

### `app/modules/reservas.js`

- Reemplazar `Reserva aprobada · visita asignada · shopper notificado` por `notificacion preparada` o equivalente.

### `app/modules/correo.js` y `app/core/topbar.js`

- Separar claramente correo real conectado vs borrador/preparado.
- No mostrar `Correo enviado` si no hay cuenta/proveedor real conectado.

### `app/modules/finanzas.js`, `app/modules/importador.js`, `app/modules/operacion-extra.js`, `app/modules/academia.js`

- Revisar residuos de `sincronizado`, `sincronizada`, `en vivo`, `pagada`, `egreso automatico`, `Google Sheets en vivo`, `lee y escribe`, `portal del cliente lo muestra en vivo` cuando dependan de backend/gate.

## P1 - Coherencia Academia/manuales

V89 corrige IDs y agrega contenido util, pero Academia/manuales aun tienen lecciones heredadas que prometen capacidades reales. Claude debe hacer limpieza textual sin redisenar:

- WhatsApp/correo: preparado, borrador o fallback manual.
- HR/Google Sheets: lectura/escritura pendiente backend si gate apagado.
- Make: evento preparado/registrado; no disparo real si gate apagado.
- Portal cliente/en vivo: solo si dato existe; de lo contrario preview o pendiente fuente.
- Pagos: pago real solo tras cruce financiero backend.

## Validacion esperada de la siguiente candidata

- JS check limpio.
- Sin IDs duplicados en Academia.
- Sin textos operativos de `WhatsApp enviado`, `HR sincronizada`, `shopper notificado`, `Correo enviado`, `cuestionario enviado`, `Payload enviado`, `Disparo enviado`, `sincronizado/sincronizada`, `En vivo` cuando el proveedor real no esta activo.
- Cada correccion debe ser puntual; no redisenar ni tocar backend.
- No tocar `tools/migration`, `app/contracts`, Firestore/Auth/Storage, Make, Gemini, WhatsApp, correo real, deploy ni produccion.
- No declarar source lock, production ready ni backlog 100% cerrado sin auditoria posterior.
