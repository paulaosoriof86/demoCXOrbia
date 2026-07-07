# Cambios backend addendum - Empalme controlado V89 sin Claude

Fecha: 2026-07-06

## Bloque completado

Reauditoría y arranque de empalme controlado de V89 como working candidate, debido a que Claude no tiene capacidad para entregar V90.

## Archivos creados

- `app/docs/EMPALME-CONTROLADO-V89-SIN-CLAUDE-CAPACITY-20260706.md`
- `app/docs/PENDIENTES-POST-EMPALME-V89-SIN-CLAUDE-20260706.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-EMPALME-CONTROLADO-V89-SIN-CLAUDE-20260706.md`

## Decisión

V89 queda como **working candidate de empalme controlado**, no como source lock final.

## Validación reejecutada localmente sobre el ZIP V89

- SHA256: `c9a50f0c1edc1b1b7db4ebc5b17edfbf44d26d3fb9350f4f29e5f058b87fcb74`.
- 97 archivos.
- `node --check`: 61 JS OK / 0 FAIL.
- `index.html`: 61 scripts; sin scripts locales faltantes.
- `tools/` ausente.
- `app/contracts/` ausente.
- Academia V89 sin duplicados explícitos en IDs de cursos/lecciones.

## Pendientes y modificaciones que pasan a la siguiente etapa

Se documentaron los pendientes post-V89 por archivo/módulo:

- `postulaciones.js`: WhatsApp/HR sync honesto.
- `dashboard.js`: correo/WhatsApp Make honesto.
- `automatizaciones.js`: eventos/payloads Make como preview/preparado.
- `cuestionario-shopper.js`: cuestionario realizado/completado, no enviado.
- `reservas.js`: notificación preparada, no shopper notificado.
- `correo.js` y `topbar.js`: separar correo real conectado vs borrador/preparado.
- `finanzas.js`, `beneficios.js`, `liquidacion.js`, `notif.js`: no pago real sin cruce backend.
- `importador.js`, `operacion-extra.js`, `hr.js`, `programa.js`: HR real/Google Sheets solo con gate backend.
- `academia.js` y `manuales-data.js`: coherencia de estados preparados/pendientes backend.

## Estado seguro

Sin deploy, sin producción, sin merge, sin import real, sin Firestore/Auth/Storage reales, sin HR writes, sin Make/Gemini/WhatsApp/correo real y sin datos sensibles.

## Nota de continuidad

A partir de este bloque, como Claude no tiene capacidad, las correcciones frontend necesarias se documentarán como `modificaciones locales post-V89`, con validación y sin activar integraciones reales.
