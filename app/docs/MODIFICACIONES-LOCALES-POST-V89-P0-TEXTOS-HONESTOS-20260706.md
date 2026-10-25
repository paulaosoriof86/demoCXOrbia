# Modificaciones locales post-V89 - P0 textos honestos

Fecha: 2026-07-06
Base: V89 como working candidate controlada
Responsable del siguiente bloque: ChatGPT/Codex, porque Claude no tiene capacidad

## Objetivo

Aplicar correcciones mínimas y trazables sobre la candidata V89 para que el prototipo no prometa integraciones reales mientras los gates backend siguen apagados.

Estas mejoras locales deben conservarse también como paquete para Claude cuando vuelva a tener capacidad, para que las replique o las incorpore al prototipo comercializable.

## Regla general de copy operativo

Cuando no exista proveedor real conectado ni gate backend activo:

- No usar `enviado`.
- No usar `sincronizado`.
- No usar `notificado` como acción ya ejecutada.
- No usar `en vivo` si la fuente real no está conectada.
- No usar `pago automático` ni `egreso automático` sin cruce financiero backend.

Usar:

- `preparado`
- `pendiente backend`
- `fallback manual`
- `borrador`
- `preview`
- `requiere confirmación`
- `se reflejará cuando el sync backend esté activo`

## Cambios locales P0 por archivo

### 1. `app/modules/postulaciones.js`

#### Cambio 1.1 - Aprobación desde tarjeta

Antes:

```js
act(b.dataset.ap,'✅ Aprobada','green','Aprobada · WhatsApp enviado al shopper')
```

Después:

```js
act(b.dataset.ap,'✅ Aprobada','green','Aprobación registrada · WhatsApp Web/fallback manual preparado')
```

Motivo: la aprobación puede registrar intención y preparar comunicación, pero no debe afirmar WhatsApp enviado sin proveedor/gate real.

#### Cambio 1.2 - Aprobación desde detalle

Antes:

```js
act(x.id,'✅ Aprobada','green','Aprobada · WhatsApp enviado')
```

Después:

```js
act(x.id,'✅ Aprobada','green','Aprobación registrada · notificación preparada')
```

Motivo: mismo criterio de comunicación preparada, no enviada.

#### Cambio 1.3 - Edición de asignación

Antes:

```js
ui.toast('Asignación actualizada · HR sincronizada · por '+gestor(),'ok')
```

Después:

```js
ui.toast('Asignación actualizada · HR sync pendiente backend · por '+gestor(),'ok')
```

Motivo: `CX.hr.writeBack` sigue siendo gate/backend, por lo que la UI no debe afirmar sincronización real.

#### Cambio 1.4 - Perfil shopper / WhatsApp

Antes:

```js
ui.toast('WhatsApp a '+s.nombre+' (Make)','ok')
```

Después:

```js
ui.toast('WhatsApp Web/fallback manual preparado para '+s.nombre,'ok')
```

Motivo: no afirmar Make/WhatsApp real.

#### Cambio 1.5 - Asistente de asignación

Antes:

```text
... disparo WhatsApp y notificaciones automáticamente al aprobar.
```

Después:

```text
... preparo WhatsApp/fallback manual y notificaciones para revisión al aprobar.
```

Motivo: IA/copy comercial no debe prometer automatización real sin backend.

### 2. `app/modules/dashboard.js`

#### Cambio 2.1 - Correo Make/Outlook

Antes:

```text
Correo enviado a ... (Make/Outlook)
```

Después:

```text
Borrador/notificación preparada · envío real pendiente backend
```

#### Cambio 2.2 - WhatsApp Make

Antes:

```text
WhatsApp enviado (Make)
```

Después:

```text
WhatsApp Web/fallback manual preparado · Make pendiente backend
```

#### Cambio 2.3 - Badges `En vivo`

Si el dato proviene de demo/localStorage/preview, reemplazar `En vivo` por:

```text
Preview
```

o

```text
Preparado / pendiente backend
```

### 3. `app/modules/automatizaciones.js`

#### Cambio 3.1 - Registro Make

Antes:

```text
Registro de disparos (Make)
```

Después:

```text
Registro preview de eventos preparados
```

#### Cambio 3.2 - Eventos enviados

Antes:

```text
últimos eventos enviados
```

Después:

```text
últimos eventos preparados
```

#### Cambio 3.3 - Payload enviado

Antes:

```text
Payload de prueba enviado al escenario Make
```

Después:

```text
Payload de prueba preparado para revisión · Make pendiente backend
```

#### Cambio 3.4 - Disparo enviado

Antes:

```text
Disparo enviado a Make
```

Después:

```text
Evento preparado · webhook pendiente backend
```

### 4. `app/modules/cuestionario-shopper.js`

#### Cambio 4.1 - Cuestionario enviado

Antes:

```text
marca la visita como cuestionario enviado
```

Después:

```text
marca la visita como cuestionario realizado/completado
```

Motivo: cuestionario realizado no equivale a submitido, revisión, liquidación ni pago.

### 5. `app/modules/reservas.js`

#### Cambio 5.1 - Shopper notificado

Antes:

```text
Reserva aprobada · visita asignada · shopper notificado
```

Después:

```text
Reserva aprobada · visita asignada · notificación preparada
```

### 6. `app/modules/correo.js` y `app/core/topbar.js`

#### Cambio 6.1 - Correo enviado

Antes:

```text
Correo enviado
```

Después:

- Si hay proveedor/cuenta real conectada y confirmación: `Correo enviado`.
- Si no hay proveedor/gate real: `Borrador preparado` o `Correo preparado · pendiente envío`.

### 7. `app/modules/finanzas.js`, `app/modules/beneficios.js`, `app/core/liquidacion.js`

#### Cambio 7.1 - Pago real

No mostrar `pagada`, `sincronizada` o `egreso automático` como operación real cuando solo hay demo/preview.

Estados recomendados:

- `liquidación candidata`
- `validación pendiente`
- `incluida en lote preparado`
- `pago pendiente confirmación`
- `pago confirmado manualmente`

## Validación esperada después de aplicar

1. `node --check` de todos los JS tocados.
2. Búsqueda de residuos:
   - `WhatsApp enviado`
   - `Correo enviado`
   - `HR sincronizada`
   - `shopper notificado`
   - `cuestionario enviado`
   - `Payload enviado`
   - `Disparo enviado`
   - `sincronizado/sincronizada`
   - `En vivo`
3. Documentar archivos tocados y resultado.
4. No activar integraciones reales.

## Restricciones

No tocar:

- `tools/migration`
- `app/contracts`
- Firestore real
- Auth real
- Storage real
- Make real
- Gemini real
- WhatsApp real
- correo real
- deploy
- producción
- main/release

## Estado

Este documento registra las modificaciones locales que deben aplicarse como bloque post-V89 y que también deben quedar disponibles para Claude cuando pueda retomar el prototipo.
