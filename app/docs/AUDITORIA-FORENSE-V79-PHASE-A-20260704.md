# Auditoria forense V79 Phase A

Fecha: 2026-07-04

## Base auditada

- Base anterior: V78.
- Candidata nueva: V79.

## Resultado tecnico

- V78: 93 archivos.
- V79: 93 archivos.
- Archivos agregados: 0.
- Archivos eliminados: 0.
- Archivos modificados: 2.

Archivos modificados:

- `app/modules/misvisitas.js`
- `app/modules/proyectos.js`

Validaciones:

- `node --check`: 60/60 JS OK.
- `index.html`: 60 scripts locales, todos encontrados.

## Avances reales de V79

### `app/modules/misvisitas.js`

- Agrega etapa visual `revision` entre cuestionario y submit/liquidacion.
- Agrega ventana posterior a marcar visita realizada.
- La ventana posterior muestra boton de cuestionario y contacto WhatsApp de evidencias si esta configurado.

### `app/modules/proyectos.js`

Agrega seccion Phase A en la configuracion del proyecto:

- revision consultora/cliente;
- quien submite/cierra;
- rol de plataforma en submitido;
- origen HR;
- etiqueta HR;
- origen cuestionario;
- etiqueta cuestionario externo;
- contactos WhatsApp por tipo de gestion.

## Pendientes P0 para Claude

### P0-1. Enum de cuestionario inconsistente

El wizard usa `interna`, `externa`, `link`.

`cuestionario-shopper.js` reconoce externo solo con `externa` o `link`.

V79 guarda desde `proyectos.js` los valores `interna`, `externo_general`, `externo_visita`.

Riesgo: un proyecto configurado como externo puede caer en formulario interno.

### P0-2. Revision aun no es funcional

V79 agrega chip visual de revision, pero falta:

- accion admin de revision;
- estado real de revision;
- fecha de revision;
- persistencia;
- preparacion de escritura a HR;
- regla de liquidacion segun revision.

### P0-3. Submitido no queda completamente configurable en flujo

V79 agrega campos de submitido, pero el flujo y textos aun deben evitar tratar submitido como accion universal de CXOrbia.

### P0-4. Wizard de nuevo proyecto no trae toda Phase A

El modal de edicion tiene nuevos campos, pero el wizard de creacion todavia no los incorpora completos. Un proyecto nuevo puede nacer incompleto para Phase A.

## Pendientes P1

- Modelar URL/sourceRef seguro de HR y cuestionario.
- Configurar campo HR para link de cuestionario por visita.
- Contactos WhatsApp deben tener nombre, habilitado, plantilla y fallback.
- Corregir textos de honestidad visual sobre WhatsApp, Make, HR, Gemini y estados en vivo.
- Corregir `nvBanner` en novedades.
- Corregir version default de nuevo tenant en SaaS Console.
- Revisar PWA si sigue pendiente.

## Decision

V79 es avance util, pero no debe aprobarse como candidata final de Phase A hasta que Claude corrija los P0.

## Estado

- Auditoria documentada.
- Paquete Claude local preparado.
- Sin cambios frontend desde backend.
- Sin runtime conectado.
- Sin deploy ejecutado.
