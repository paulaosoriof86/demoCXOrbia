# V91 reception audit runbook - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se preparo el runbook de recepcion y auditoria para la proxima candidata V91 o patch correctivo de Claude.

## Objetivo

Evitar empalmes manuales o decisiones por memoria cuando llegue V91.

V91 solo debe aceptarse como candidata auditada si corrige copy honesto sin tocar backend real ni integraciones.

## Insumos esperados

Claude debe entregar:

- ZIP/candidata separada.
- Lista de archivos tocados.
- Resumen por archivo.
- Confirmacion de que no toco backend, contracts, tools, workflows ni integraciones reales.
- Impacto en Academia.
- Pendientes que queden abiertos.

## Checklist de recepcion

1. Confirmar que el ZIP corresponde a CXOrbia, no a Orbit, Finanzas u otro proyecto.
2. Calcular SHA256 del ZIP.
3. Comparar V90 -> V91 y V89 -> V91.
4. Confirmar archivos agregados/eliminados/modificados.
5. Revisar que no haya cambios en backend, contracts, tools, workflows, Firebase, Make, Gemini, imports o secrets.
6. Revisar sintaxis de JS modificado.
7. Revisar copy honesto por gate.
8. Revisar impacto en Academia.
9. Documentar hallazgos antes de cualquier empalme.
10. Mantener PR en draft hasta decision posterior.

## Criterios GO para candidata V91 auditada

Puede avanzar a candidata empalmable solo si:

- modifica exclusivamente textos/copy de UI necesarios;
- conserva funcionalidad;
- no rompe rutas ni imports de scripts;
- no agrega promesas de envio, sync, pago, import o proveedor real;
- no toca backend ni integraciones;
- no agrega datos sensibles;
- no cambia arquitectura;
- documenta impacto Academia.

## Criterios NO GO

No empalmar si:

- toca backend, contracts, tools o workflows sin autorizacion;
- cambia logica operativa fuera de copy;
- elimina modulos;
- agrega scripts no esperados al index;
- mezcla otro proyecto;
- promete acciones reales sin gate;
- introduce datos sensibles;
- no documenta cambios por archivo.

## Residuos que V91 debe priorizar

- `app/core/topbar.js`: toast `Correo enviado a ...`.
- `app/modules/dashboard.js`: toast `WhatsApp enviado (Make): ...`.
- `app/modules/postulaciones.js`: textos `Aprobada · WhatsApp enviado...`.
- `app/modules/configuracion.js`: textos de invitacion enviada o reenviada.
- `app/modules/soporte.js`: `Respuesta enviada vía Make`.
- `app/modules/finanzas.js`: toasts de liquidaciones/lote pagado si no hay cruce financiero real.

## Terminos a revisar

- enviado;
- enviada;
- enviadas;
- via Make;
- sincronizado;
- pagado;
- pagada;
- proveedor conectado.

## Terminos sugeridos

Preferir copy honesto como:

- preparado;
- pendiente de gate;
- pendiente confirmacion backend;
- simulado/demo;
- pendiente revision;
- pendiente submitido;
- listo para envio cuando proveedor este activo.

## Academia

Academia debe distinguir claramente entre:

- preparado;
- envio real;
- demo;
- pendiente de gate;
- cuestionario completado;
- cuestionario submitido;
- pago preparado;
- pago confirmado.

## Decision actual

V90 sigue auditada pero no empalmada.

V91 no debe empalmarse automaticamente. Primero requiere auditoria forense y decision documentada.

## Clasificacion

### Reusable CXOrbia

Si. Runbook reusable para recepcion de candidatas correctivas.

### Exclusivo cliente

No.

### Claude/prototipo

Si. Define condiciones para candidata de Claude.

### Academia

Si. Obliga revision de lenguaje operativo y educativo.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin merge final, sin produccion real, sin proveedores reales, sin imports reales, sin sync real y sin datos sensibles.
