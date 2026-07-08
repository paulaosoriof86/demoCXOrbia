# Auditoria forense candidata V91 CXOrbia

Fecha: 2026-07-08  
Archivo auditado: `Prototype development request CXOrbia V91.zip`  
SHA256 ZIP: `c6fe10ebcdd379a98f3cfb38065434321933cbf4fe4755df50ec8fe2f1cad6f8`  
Estado: candidata auditada, no produccion, no merge, no deploy.  
Decision: source lock documental creado; empalme de codigo no debe cerrarse sin parche controlado por blockers detectados.

## 1. Alcance de la auditoria

La auditoria se hizo contra:

- el paquete completo entregado a Claude;
- los requisitos acumulados de backend reusable;
- el hallazgo obligatorio de Academia admin actions;
- el estado actual del PR #7;
- las reglas de copy honesto y gates;
- la necesidad de trabajar sobre la candidata mas reciente sin perder protecciones ya agregadas en el repo.

## 2. Estructura del ZIP

El ZIP trae 100 archivos:

- 63 `.js`;
- 31 `.md`;
- 2 `.html`;
- 2 `.css`;
- 1 `.webmanifest`;
- 1 `.gitignore`.

Incluye `/app`, `/app/core`, `/app/modules`, `/app/docs`, `/app/styles`, `app/index.html`, `app/app.js`, `app/sw.js` y `app/demo/index.html`.

## 3. Validaciones tecnicas locales

### JavaScript syntax

Resultado: `node --check` sobre los 63 archivos `.js` del ZIP: 0 errores de sintaxis.

### Scripts de `app/index.html`

- `modules/diagnostico.js` esta referenciado.
- `modules/administrabilidad.js` esta referenciado.
- No hay modulos locales en `/app/modules` sin script en index.
- Los scripts externos CDN siguen siendo:
  - SheetJS;
  - mammoth browser.

### Charset

`app/index.html` conserva `<meta charset="UTF-8">`.

## 4. Lo que Claude si hizo

### Copy P0 parcial

Claude corrigio varios textos en archivos indicados en su documento, especialmente en:

- `app/modules/importador.js`;
- `app/modules/correo.js`;
- `app/modules/reservas.js`;
- `app/modules/postulaciones.js`;
- `app/modules/visitas.js`;
- `app/modules/dashboard.js`;
- `app/modules/documentos.js`;
- `app/modules/soporte.js`.

Pero el barrido no fue completo. Ver blockers.

### Nuevo modulo Diagnostico & Readiness

Agrego `app/modules/diagnostico.js`.

Cubre visualmente:

- synthetic input pack runner;
- coverage expandida;
- readiness;
- conflictos;
- contratos/gates;
- estados preview;
- sourceRefs opacas;
- gates apagados;
- produccion no autorizada.

Evaluacion: avance util, alineado con backend reusable, pero debe revisarse copy final y no equivale a integracion real.

### Nuevo modulo Administrabilidad

Agrego `app/modules/administrabilidad.js`.

Cubre:

- matriz de dominios administrables;
- NDA versionado;
- planes versionados;
- reglas y gates;
- motivo obligatorio;
- gate off/human.

Evaluacion: avance util, pero no reemplaza la necesidad de administrar Academia directamente en `app/modules/academia.js`.

### Service Worker / PWA

Modifico:

- `app/sw.js`;
- `app/app.js`.

Objetivo reportado por Claude: resolver cache que hacia ver Academia como scaffold viejo.

Evaluacion: plausible y util, pero requiere smoke visual real. No autoriza produccion.

## 5. Blockers detectados

### B1 - `production-copy-guard.js` se pierde si se empalma index a ciegas

El `app/index.html` del ZIP no trae `<script src="core/production-copy-guard.js"></script>`.

El PR actual si lo tiene cargado despues de `core/ui.js` y antes de modulos. Si se reemplaza index con el ZIP sin merge controlado, se pierde una proteccion importante ya agregada para copy honesto.

Decision: el empalme de `index.html` debe ser manual/controlado: conservar `core/production-copy-guard.js` y agregar solo los scripts nuevos `modules/diagnostico.js` y `modules/administrabilidad.js`.

### B2 - Academia admin actions no quedaron implementadas de forma visible

La candidata no resuelve el hallazgo visual reportado por Paula.

Evidencia local:

- No hay botones visibles en tarjetas de cursos para editar, archivar, duplicar o versionar.
- Existe codigo de escucha para `.acad-edit`, pero las tarjetas no renderizan elementos con clase `.acad-edit`.
- Existe modal de editar curso con boton `Eliminar`, pero al no existir boton visible para abrirlo, no esta disponible desde UI.
- No hay `archivar`.
- `duplicar` aparece solo como texto de contenido, no como accion administrativa.
- `versionar/versionado` aparece como contenido educativo, no como accion visible de administracion.
- `Eliminar` borra solo cursos custom en localStorage y no es soft-delete/versionado con motivo/auditRef.

Decision: NO GO para marcar Academia administrable completa. Pendiente Claude/prototipo o parche UI futuro controlado.

### B3 - Boton `Crear con IA` de Academia parece no estar cableado correctamente

El ZIP muestra boton `id="acadNew"`, pero el handler esperado no aparece como `host.querySelector('#acadNew')...`.

En el codigo se observa una expresion suelta `}));()=>ui.modal('✨ Crear módulo con IA',...)`, sintacticamente valida pero no conectada al boton.

Decision: requiere smoke visual. Riesgo funcional: boton Crear con IA puede no abrir modal.

### B4 - Copy P0 honesto sigue incompleto

Barrido local encontro residuos visibles en modulos:

- `modules/automatizaciones.js`: `Payload de prueba enviado`.
- `modules/correo.js`: `Cuestionario enviado` y cuerpo dice que el cuestionario fue enviado desde la plataforma.
- `modules/cuestionario-shopper.js`: texto externo indica completar y luego marcar visita; requiere revisar que no use `enviado` como real.
- `modules/dashboard.js`: `WhatsApp enviado`.
- `modules/postulaciones.js`: `WhatsApp enviado` en dos acciones y `HR sincronizada` en ajuste de fecha.
- `modules/shoppers.js`: scoring con `Cuestionario enviado tarde`.

Decision: NO GO para copy P0 cerrado. Debe corregirse antes de afirmar paquete honesto completo.

### B5 - Documentos del ZIP no estan alineados con backend acumulado actual

`app/docs/RESUMEN-PARA-CLAUDE.md` del ZIP es un resumen viejo de V82 y no contiene los addenda recientes de backend reusable, readiness bridge, admin configurability expanded, conflict expanded, reusable backend coverage ni hallazgo actualizado de Academia.

`app/docs/PENDIENTES-PROTOTIPO.md` del ZIP tambien es viejo y no refleja todo lo documentado en el PR actual.

Decision: no reemplazar docs vivos del repo con los docs del ZIP. Solo importar el documento nuevo de cambios Claude como referencia auditada.

## 6. Riesgos adicionales

### R1 - Copy historico en docs y plan de trabajo

El ZIP contiene documentos viejos con textos como importado, sincronizado, conectado, en vivo y pagado. Algunos son historicos/backlog, no necesariamente UI. No deben usarse como fuente actual sin revision.

### R2 - Integraciones y correo aun muestran estados potencialmente confusos

Hay textos como `Conectado` en HR/integraciones/correo, algunos condicionados por estados demo/local. Deben revisarse visualmente para evitar prometer provider real.

### R3 - Finanzas conserva estados `Pagado`

El modulo Finanzas usa estados demo como `Pagado` y botones `Marcar pagado`. Algunos textos fueron matizados con preview, pero quedan riesgos de interpretacion. Debe separarse demo/preview de pago real.

## 7. Comparacion contra paquete enviado a Claude

### Cumplido parcialmente

- Copy honesto: parcial.
- UX diagnostica preview: si, modulo nuevo.
- Administrabilidad versionada: si, modulo nuevo.
- NDA y planes: parcial, en modulo administrabilidad.
- Conflict review/readiness: parcial, en diagnostico.
- Readiness/gates: si, en diagnostico.
- SourceRefs opacas: parcial, en diagnostico.

### Pendiente o incompleto

- Academia profunda completa.
- Academia admin actions reales/visibles.
- Copy P0 completo.
- HR/platform sync UI honesta completa.
- Liquidaciones/pagos completamente honestos.
- Evidencias/Storage profundo.
- Sensitive data policy visible transversal.
- Patrones reutilizables para nuevo cliente reflejados de forma completa en UI y Academia.
- GO/NO GO por patron reusable en UI.

## 8. Decision de empalme

La candidata V91 debe ser tomada como ultima candidata fuente, pero no debe empalmarse a ciegas.

Empalme recomendado:

1. Source lock documental de V91 con SHA256.
2. Importar cambios de codigo de V91 de forma controlada.
3. Preservar `core/production-copy-guard.js` en `index.html`.
4. No reemplazar documentos vivos del repo por docs viejos del ZIP.
5. Mantener nuevos modulos `diagnostico.js` y `administrabilidad.js`.
6. Documentar y corregir luego P0 copy residual y Academia admin actions.
7. Ejecutar gates despues de cada bloque.

## 9. Criterio GO/NO GO

### GO como candidata de trabajo controlada

Puede avanzar como ultima candidata de trabajo porque:

- no tiene errores JS por `node --check`;
- agrega diagnostico/readiness;
- agrega administrabilidad;
- conserva estructura modular;
- no trae backend/tools/workflows nuevos;
- no trae datos sensibles reales detectados en inspeccion estatica.

### NO GO para produccion o cierre de pendientes Claude

No puede marcarse como produccion ni como cierre completo del paquete Claude porque:

- falta Academia admin actions visible;
- copy P0 no esta cerrado;
- index del ZIP perderia production-copy-guard si se reemplaza sin merge;
- docs del ZIP estan desactualizados frente a backend acumulado;
- Academia profunda quedo pendiente;
- pagos/HR/integraciones requieren nueva pasada de copy honesto.

## 10. Pendientes documentados para siguiente bloque

1. Empalme controlado de V91 preservando guard y docs vivos.
2. Parche/pendiente de Academia admin actions: crear, editar, archivar/soft-delete, duplicar, versionar, cambiar estado, asignar rol/proyecto, pedir revision, publicar solo con revision humana.
3. Barrido P0 de copy residual en automatizaciones, correo, cuestionario shopper, dashboard, postulaciones y shoppers.
4. Verificar Finanzas/Pagos para que demo `Pagado` no se lea como pago real.
5. Actualizar paquete Claude acumulado si vuelve a haber capacidad.
6. Mantener reusable backend coverage como fuente para futuros clientes.

## 11. Estado seguro de esta auditoria

Esta auditoria no modifica runtime, no activa backend, no hace deploy, no hace import real, no hace pagos reales, no conecta providers y no agrega datos sensibles.
