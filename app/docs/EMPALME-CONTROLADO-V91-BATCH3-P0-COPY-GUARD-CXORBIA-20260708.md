# Empalme controlado V91 - Batch 3 P0 copy guard CXOrbia

Fecha: 2026-07-08  
Fuente: auditoria forense V91 + baseline incremental V91  
Estado: proteccion P0 ampliada, no produccion.

## 1. Objetivo

Agilizar el empalme sobre V91 corrigiendo el riesgo visible de copy P0 residual sin reemplazar masivamente modulos grandes ni introducir regresiones.

Este batch amplia el guard existente para que la UI no prometa integraciones reales mientras los gates siguen apagados.

## 2. Archivo actualizado

- `app/core/production-copy-guard.js`

## 3. Que se cubre ahora

Se agregaron reemplazos visibles para residuos detectados en la auditoria V91:

- `Notificacion enviada por WhatsApp` -> notificacion preparada / envio real pendiente.
- `Correo guardado en Enviados · se despachara...` -> correo preparado / despacho real pendiente.
- `Payload de prueba enviado al escenario Make` -> payload preparado / envio real pendiente.
- `Disparo enviado a Make` -> evento preparado / Make real pendiente de gate.
- `ultimos eventos enviados` -> ultimos eventos preparados.
- `Cuestionario enviado tarde` -> cuestionario completado tarde.
- `Cuestionario enviado ·` -> cuestionario completado.
- `El cuestionario fue enviado desde la plataforma` -> cuestionario completado y pendiente revision/submitido.
- `marca la visita como cuestionario enviado` -> cuestionario realizado/completado.
- `sincronizando correos reales` -> sincronizacion real pendiente backend/gate.
- `Conectado como` -> cuenta preparada como.
- `Conectado/conectado` -> preparado.
- `HR viva + export` -> HR source preview + export pendiente backend.

## 4. Decision tecnica

Se uso el guard porque:

- ya existia como proteccion viva del PR;
- evita aceptar copy falso mientras se completa el empalme modulo por modulo;
- reduce riesgo de reescribir modulos grandes en un batch sin smoke;
- mantiene avance incremental sobre V91.

## 5. Limitacion honesta

Este batch protege copy visible al renderizar UI/toasts/modales/innerHTML, pero no elimina todas las cadenas fuente dentro de los modulos.

Por eso sigue pendiente una limpieza modulo por modulo de:

- `automatizaciones.js`;
- `correo.js`;
- `dashboard.js`;
- `postulaciones.js`;
- `shoppers.js`;
- `cuestionario-shopper.js`;
- `finanzas.js`;
- `academia.js`.

No se debe documentar como P0 source cleanup cerrado. Si como P0 visible guard ampliado.

## 6. Impacto Phase A

Ayuda a evitar promesas falsas en Phase A mientras se prepara salida controlada:

- no envio real;
- no HR sync real;
- no pago real;
- no provider activo;
- no Firestore/Storage/Auth reales;
- no Make/Gemini activos.

## 7. Impacto Claude/prototipo

Cuando haya nueva capacidad, Claude debe hacer limpieza fuente y UX permanente. Este guard no reemplaza el trabajo de fondo, pero evita que la demo muestre claims incorrectos mientras se avanza.

## 8. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
