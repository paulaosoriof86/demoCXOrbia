# Pendientes Claude addendum - Auditoria V87

Fecha: 2026-07-05

## Decision

V87 fue auditada contra V86 y no trae delta real de archivos. El ZIP tiene hash distinto, pero el contenido de `app/` es identico. No debe tratarse como nueva baseline ni como correccion completada.

## Prioridad absoluta para Claude

Claude esta por perder capacidad semanal, por lo que no debe intentar ampliar Academia ni agregar nuevos bloques. Debe corregir solo P0 criticos para salida controlada/produccion.

## P0 criticos que debe corregir

### 1. `modules/postulaciones.js`

Reemplazar:

- `Aprobada · WhatsApp enviado al shopper`
- `Aprobada · WhatsApp enviado`
- `Nueva fecha autorizada · shopper notificado · HR sincronizada`
- `Asignación actualizada · HR sincronizada`

Por estados honestos tipo:

- `Aprobada · WhatsApp fallback/manual preparado · pendiente confirmacion`
- `Nueva fecha autorizada · notificacion preparada · HR sync pendiente backend`
- `Asignacion actualizada · HR sync pendiente backend`

No activar Make, WhatsApp, HR writeback ni providers.

### 2. `modules/dashboard.js`

Reemplazar:

- `Correo enviado a ... shopper(s) (Make/Outlook)`
- `WhatsApp enviado (Make)`

Por estados honestos tipo:

- `Correo draft/preparado · proveedor pendiente`
- `WhatsApp fallback/manual preparado · pendiente confirmacion`

No decir Make/Outlook enviado si no hay gate real.

### 3. `core/topbar.js`

Reemplazar:

- `Correo enviado a ...`

Por:

- `Correo preparado/draft local · proveedor pendiente`

No guardar en UI como enviado real si no hay provider activo.

### 4. `modules/correo.js`

Revisar los dos toasts de `Correo enviado`. Si el provider real no esta activo con gate autorizado, debe decir:

- `Correo preparado`
- `Draft local`
- `Proveedor pendiente`
- `Registro manual`

No usar `Enviados` como si fuera carpeta real de proveedor si solo es local/mock.

### 5. `modules/academia.js`

Solo corregir frase P0, sin ampliar Academia:

Actual:

- `Sincronía automática`: cada cambio de estado notifica al equipo, actualiza el dashboard, sincroniza la HR externa (Google Sheets) y mueve la liquidación.

Debe cambiar a algo como:

- `Flujo con gates`: cada cambio actualiza el dashboard y deja preparada la trazabilidad. HR, comunicaciones y liquidaciones reales quedan pendientes de backend/gates y revision manual.

### 6. `core/automations.js`

Reemplazar titulos/eventos de:

- `Cuestionario enviado`

Por:

- `Cuestionario realizado/completado`
- `Cuestionario completado pendiente revision`

### 7. `core/manuales-data.js`

Reemplazar:

- `hasta el cuestionario enviado`

Por:

- `hasta el cuestionario realizado/completado y revision/submitido`

### 8. `core/liquidacion.js`

Comentario no bloqueante, pero conviene cambiar para evitar regresiones:

- `cuestionario enviado -> pendiente_submitir`

Por:

- `cuestionario realizado/completado -> pendiente_submitir`

## Reglas para Claude

1. Trabajar sobre la ultima baseline auditada usable, pero recordar que V87 no trae delta real frente a V86.
2. No tocar `app/contracts/**`.
3. No tocar `tools/migration/**`.
4. No activar Firestore/Auth/Storage/Make/Gemini/email/WhatsApp/pagos/import real.
5. No hacer deploy ni merge.
6. No agregar Academia profunda ahora; solo corregir frase P0 minima.
7. No crear textos que prometan integraciones reales.
8. No tocar backend ni gates.
9. Mantener `index.html` sin scripts faltantes ni duplicados.
10. Ejecutar validacion JS con `node --check`.

## Backend acumulado que debe respetar

Claude debe incorporar semanticamente, pero solo si no desvía el P0:

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

Estos vienen de bloques backend recientes: visit lifecycle, notification outbox, email mailbox, CRM folder refs, postulation dynamic form, shopper communication history, ranking/scoring, rule versioning, changelog, release readiness y synthetic fixtures.

## Validacion esperada de la siguiente candidata

La siguiente candidata debe pasar:

- 0 apariciones operativas de `HR sincronizada`.
- 0 apariciones operativas de `WhatsApp enviado`.
- 0 apariciones operativas de `Correo enviado` sin gate real.
- 0 apariciones operativas de `Sincronía automática`, `sincroniza la HR externa`, `mueve la liquidación`.
- `cuestionario enviado` reemplazado por `cuestionario realizado/completado` salvo menciones historicas estrictamente documentales.
- 0 fallas JS.
- 0 scripts locales faltantes.
- 0 scripts duplicados.

## Produccion

No declarar production ready ni source lock final hasta que este P0 quede corregido y auditado. Si se requiere salida controlada urgente, la correccion minima es esta lista P0, no Academia profunda.
