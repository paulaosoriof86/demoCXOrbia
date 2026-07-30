# AUDITORIA-PROTOTIPO-V54-20260629

## Fuente revisada

- Prototype development request CXOrbia V54.zip
- CAMBIOS-PROTOTIPO.md
- app/docs/PENDIENTES-PROTOTIPO.md incluido en V54

## Validación técnica local

- Archivos en ZIP: 85
- Archivos JavaScript: 56
- Validación sintáctica JS: 0 errores
- Comparación contra V53: mismos 85 archivos; 17 archivos cambiaron

## Archivos cambiados vs V53

```text
app/app.js
app/core/automations.js
app/docs/CAMBIOS-PROTOTIPO.md
app/index.html
app/modules/academia.js
app/modules/cert.js
app/modules/comercial.js
app/modules/crm.js
app/modules/importador.js
app/modules/integraciones.js
app/modules/marketing.js
app/modules/midia.js
app/modules/operacion-extra.js
app/modules/postulaciones.js
app/modules/proyectos.js
app/modules/soporte.js
app/styles/layout.css
```

## Mejoras confirmadas en V54

### Integraciones

La UI ya no promete conexión real. La prueba se presenta como simulada y el guardado queda como pendiente de validación backend. Esto mejora honestidad de producto, pero no significa integración real.

### Importador

Se cargó SheetJS en index.html. El importador AI y HR ya leen archivos Excel y convierten la primera hoja a CSV. Es un avance real frente a V53. Sigue pendiente soporte multi-hoja, mapeo persistente, importBatch, preview formal, conflictos y escritura real.

### CRM / Comercial

Las propuestas se guardan en store local y se vinculan al cliente. La ficha 360 de cuenta ahora es hub con pestañas de resumen, oportunidades, proyectos, propuestas, contactos, correos, documentos y timeline. Los proyectos se vinculan a cuenta CRM. Es un avance UI/comercial fuerte, pero sigue pendiente persistencia backend.

### Soporte / Mi Día / Asignaciones

Se agregó asignación de responsable desde soporte. Mi Día muestra asignaciones internas pendientes. El cambio de estado de soporte notifica al solicitante. Avance funcional claro, pero sigue pendiente persistencia backend, auditoría y action log.

### Reportes

La exportación CSV desde tablas ya es real. PDF usa impresión del navegador. Avance real frente a toast.

### Marketing

Generar mes pide criterios de periodicidad, embudo, herramienta, CTA, temáticas, hashtags y WhatsApp. Avance UI importante. Sigue pendiente generación real con proveedor conectado y trazabilidad.

### Academia

Mejora recursos embebidos y categorías editables. Sigue pendiente Storage real, versionado, progreso, quizzes profundos y persistencia backend.

### P0 Shopper

Mis Visitas ya elimina fallback a primeras visitas globales. Las acciones buscan dentro del set filtrado por shopper. Mis Beneficios filtra por visitas del shopper, pero conserva un fallback si no hay visitIds; debe corregirse para no mostrar todo cuando el shopper no tiene visitas.

## Pendientes que pueden marcarse como avance parcial

- Importador Excel real: avanzado, no cerrado.
- Reportes CSV: avanzado para tablas simples.
- CRM propuestas/cuentas/proyectos: avanzado UI, backend pendiente.
- Asignar responsable y soporte notifica: avanzado UI, backend pendiente.
- Integraciones con estados honestos: avanzado UX, backend pendiente.
- Marketing con criterios IA: avanzado UI, IA real pendiente.
- Academia recursos/categorías: avanzado UI, profundidad/backend pendiente.

## Pendientes que NO se deben tachar

- #168 Finanzas profundo.
- #185 Acciones operativas persistibles.
- #153 Academia profunda.
- #162 Set-up inteligente.
- Configuración persistente real.
- Integraciones reales con validación backend.
- Automatizaciones reales con runs persistentes.
- HR viva multi-hoja con write-back.
- Storage real para logos, manuales, documentos y evidencias.
- IA segura sin credenciales visibles en frontend.
- ScopeCountry real para coordinador/aliado.

## Riesgos detectados

- Almacenamiento local sigue muy presente.
- No hay referencia segura de secretos para integraciones.
- No hay runs persistentes de automatizaciones.
- Hay lectura local de archivos para recursos de Academia; requiere Storage real.
- Propuestas comerciales locales no son persistencia comercial real.
- Asignaciones internas son locales; falta action log persistente.
- El importador usa solo la primera hoja del Excel.
- Mis Beneficios debe corregir fallback vacío para no mostrar todo.

## Decisión

V54 está bastante mejor que V53 y sí es candidato de intake frontend por lotes, pero no merge completo.

Aplicar primero:

1. Estados honestos de Integraciones.
2. Importador Excel con SheetJS, marcado como preview/dry-run si no escribe.
3. Reportes CSV.
4. CRM/Propuestas/Ficha 360 como UI comercial.
5. Soporte/Mi Día asignaciones como UI, sin prometer backend.
6. Corrección P0 shopper, corrigiendo fallback de Beneficios.

Mantener backend separado y continuar con modelos para acciones persistibles, academia, set-up y finanzas.
