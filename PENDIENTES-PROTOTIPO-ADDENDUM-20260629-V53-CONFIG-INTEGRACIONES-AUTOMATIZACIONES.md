# PENDIENTES-PROTOTIPO-ADDENDUM-20260629-V53-CONFIG-INTEGRACIONES-AUTOMATIZACIONES

## Fuente revisada

- `Prototype development request CXOrbia V53.zip`
- `CAMBIOS-PROTOTIPO.md`
- Screenshots compartidos por Paula de Configuración e Integraciones & Add-ons.

## Dictamen corto

V53 mejora mucho la apariencia y amplitud del centro de Configuración, Integraciones y Automatizaciones, pero todavía NO está completo para producción.

Se ve como una consola completa, pero en varios puntos sigue siendo catálogo, demo, localStorage, toast, estado en memoria o configuración sin validación real de credenciales.

## Lo que sí mejoró visualmente

### Configuración

Aparece un centro de autoadministración con tarjetas para:

- Identidad de Marca.
- Plan y Módulos.
- Países y Monedas.
- Usuarios y Permisos.
- Cuestionarios.
- Automatizaciones.
- Integraciones & Add-ons.
- Correo integrado.
- Proyectos.
- Academia.
- Documentos.
- NDA.

### Integraciones

Aparece un catálogo amplio por categorías:

- Correo y comunicación.
- Ecosistema Google.
- Ecosistema Microsoft.
- Inteligencia Artificial.
- Contenido y diseño.
- Redes y marketing.
- Automatización y productividad.
- Datos y facturación.

Incluye Outlook, Gmail, IMAP, WhatsApp, Telegram, SMS, Google Sheets, Drive, Calendar, Forms, Looker, Teams, OneDrive/Excel, Gemini, OpenAI, Claude, NotebookLM, Perplexity, Canva, Gamma, HeyGen, Metricool, Meta, LinkedIn, TikTok, YouTube, Mailchimp, Make, Zapier, n8n, Notion, Slack, Zoom, Trello, facturación y banca/open banking.

### Automatizaciones

Aparece consola para:

- webhook general Make por tenant;
- automatizaciones por evento;
- canal editable;
- plantilla editable;
- webhook por automatización;
- alertas de pendientes;
- configuración de IA multi-proveedor.

## Pendientes que NO se deben tachar

### P0/P1 — Configuración real

- Configuración todavía no es centro administrativo persistente real.
- Debe separar `tenantConfig`, `projectConfig`, `brandConfig`, `moduleConfig`, `countryConfig`, `ndaConfig`, `hrConfig`, `financeConfig`, `integrationsConfig`, `automationConfig` y `collaboratorPermissions`.
- Debe guardar vía backend adapter o interfaz estable de `CX.data`, no mediante localStorage ni mutaciones directas.
- Debe tener auditoría por usuario, país, proyecto y fecha.
- Debe validar permisos antes de permitir cambios.
- Debe tener rollback o historial de cambios críticos.

### P0/P1 — Integraciones reales

- El catálogo es amplio, pero no significa que cada integración esté funcional.
- `Probar conexión` no debe decir conexión probada si no hay verificación real.
- Las credenciales no deben guardarse en localStorage.
- Debe existir almacenamiento seguro de secretos o referencia a secretos por tenant.
- Debe diferenciar: disponible en catálogo, configurada, validada, activa, fallando, revocada.
- Cada integración necesita estado real, último test, último error, scopes y auditoría.
- Google Sheets/Excel Online deben conectarse con HR viva, import/export, sync y write-back.
- Drive/Storage debe quedar conectado para evidencias, logos y documentos.
- Outlook/Gmail deben requerir OAuth/IMAP real y permisos.
- WhatsApp debe distinguir modo manual wa.me vs API automática.
- IA debe enrutar por backend o mecanismo seguro; no exponer API keys del cliente en frontend.

### P0/P1 — Automatizaciones reales

- La UI permite editar plantillas y hooks, pero el disparo todavía debe validarse contra backend/Make real.
- El registro de disparos puede ser local; debe existir `automationRuns` persistente.
- Cada evento debe tener payload versionado, status, retries, error, usuario origen y correlación con visitId/shopperId/projectId.
- No basta con log local ni toast.
- Debe haber pruebas reales de webhook con respuesta HTTP y resultado visible.
- Debe distinguir prueba, simulación, envío real y fallo.
- Debe soportar reintentos y desactivación automática si falla muchas veces.
- Debe tener plantillas por país, idioma, canal y tipo de proyecto.

### P1 — Roles coordinador / aliado

- V53 declara roles, pero sigue pendiente scope real por país.
- Debe asignarse país/países por usuario.
- Deben filtrarse proyectos, HR, shoppers, postulaciones, finanzas y reportes por `scopeCountry`.
- Debe auditarse qué coordinador/aliado hizo cada acción.

### P1 — Configuración de proyectos

- El módulo Proyectos debe persistir periodicidad, escenarios, países, monedas, reglas de visita, cuestionario, evidencias, HR y finanzas.
- Debe alimentar `projects.hrConfig` y `projects.financeConfig`.
- No debe quedar como configuración visual desconectada.

### P1 — Seguridad

- No guardar tokens, API keys, passwords, secretos o endpoints sensibles en claro en localStorage.
- Datos bancarios, NDA y credenciales deben tener protección adicional.
- Debe haber reglas Firestore para cada colección nueva antes de escritura.

## Qué sí se puede marcar como avance parcial

- UI de Configuración más completa.
- Catálogo de integraciones amplio.
- Automatizaciones editables por evento.
- IA multi-proveedor declarada.
- `CX.ai.ask` existe en frontend.
- PWA/login/white-label/manuales avanzan en frontend.
- P0 shopper Mis Visitas/Mis Beneficios parece corregido, pendiente probar con datos reales DEV.

## Decisión

No hacer merge completo de V53 a backend.

Procesar por lotes:

1. Aplicar P0 shopper con validación DEV.
2. Aplicar mejoras white-label/PWA/manuales si no rompen backend.
3. Mantener Configuración/Integraciones/Automatizaciones como UI avanzada, pero pendiente de backend real.
4. Backend debe preparar modelo y colecciones para soportarlas.

## Nota para documento Claude futuro

Cuando Paula pida el documento para Claude, incluir de forma explícita:

`Configuración parece completa, pero no funciona como centro real. La mayoría de tarjetas, toggles e integraciones aún necesitan persistencia, validación real, permisos, auditoría y conexión backend. No debe presentarse como terminado solo porque visualmente ya aparece.`

## Restricciones respetadas

- No se modificaron módulos de frontend desde backend.
- No se hizo merge.
- No se hizo Hosting.
- No se escribió Firestore.
- No se tocó producción.
- No se activó adapter global.
