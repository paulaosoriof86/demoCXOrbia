# Codex fixes applied to V79

Fecha: 2026-07-04

## Contexto

Paula comparte reporte de Codex indicando tres hallazgos utiles sobre V79:

1. V79 quitaba el checkbox `nvBanner` en Novedades aunque el codigo lo usa.
2. V79 bajaba tenants nuevos de V76 a V72 en SaaS Console.
3. V79 traia texto duplicado: `plantilla lista (plantilla lista)`.

## Accion realizada

Se aplicaron los tres ajustes sobre la candidata V79 empalmada en el repo.

## Archivos modificados

- `app/modules/novedades.js`
- `app/modules/saas-console.js`
- `app/modules/misvisitas.js`

## Cambios

### `app/modules/novedades.js`

Se restauro el checkbox `#nvBanner` en el modal de publicar novedad para evitar que el flujo falle al leer `ov.querySelector('#nvBanner').checked`.

### `app/modules/saas-console.js`

Se alineo la version de tenants y version actual a `V76`:

- seed TyA;
- seed demo;
- KPI version actual;
- nuevo tenant;
- release visible principal.

### `app/modules/misvisitas.js`

Se corrigio el texto duplicado:

- antes: `plantilla lista (plantilla lista)`;
- ahora: `plantilla lista`.

## Impacto

- Novedades puede publicar con banner sin romper por checkbox inexistente.
- Nuevos tenants no nacen con version residual V72.
- Texto de WhatsApp Web queda limpio y coherente.

## Pendientes que siguen vivos

- Enum de cuestionario inconsistente entre wizard, edicion y ejecucion.
- Revision aun no funcional completa.
- Submitido aun no completamente configurable/HR-driven.
- Wizard de creacion aun no trae toda la configuracion Phase A.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin runtime backend conectado.
- Sin Make/Gemini/WhatsApp API real.
