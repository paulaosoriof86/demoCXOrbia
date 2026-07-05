# Phase A block progress tracker TyA

Fecha: 2026-07-04

## Estado general

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Source lock actual: V82 como baseline viva; V83/V84/V85 auditadas como candidatas parciales no aceptadas como source lock final; V86 queda como candidata auditada de continuidad backend, no source lock final ni produccion
- Estado: documentacion, contratos y validadores seguros
- Sin deploy
- Sin produccion
- Sin Firestore writes reales
- Sin HR writes reales
- Sin Storage writes reales
- Sin pagos reales
- Sin correo real conectado
- Sin Make real

## Bloques completados o documentados

### Base / continuidad

- Documento maestro y continuidad.
- V82 source lock.
- Auditorias V80/V81/V82.
- Auditoria integral candidata actual V82 para Claude.
- Auditoria forense V83 y paquete Claude V84 correctiva.
- Auditoria V84 y paquete Claude V85 correctiva.
- Auditoria V85: contenido identico a V84 y paquete Claude V86 correctiva real.
- Auditoria V86: cambios reales parciales y paquete Claude V87 correctiva; empalme como candidata auditada de continuidad backend.
- Paquete descargable Claude V82 auditoria integral.
- Paquete descargable Claude V83 auditoria integral.
- Paquete descargable Claude V84 auditoria integral.
- Paquete descargable Claude V85 auditoria identica V84.
- Paquete descargable Claude V86 auditoria integral.
- Regla de no reiniciar por cada ZIP.
- Addenda de cambios, Claude y pendientes.

### Backend foundation

- HR Source / preview seguro.
- CX.data backend adapter contract.
- DEV preview schema manifest.
- Data source selector.
- Auth claims readiness.
- Admin review contract.
- Submitido HR-driven configurable.
- Project wizard Phase A.
- Sensitive data policy Phase A.

### Academia

- Academia role-based learning contract.
- Academia deep interactive addendum.
- Academia module sync gate.
- Academia backfill backend blocks.
- Academia coverage audit backend to date.
- Academia implementation backlog.
- Academia impact de liquidaciones/Cinepolis source-safe preview.
- Academia impact de politica de datos sensibles.
- Academia impact de assignment sync/conflicts.
- Academia impact de visit lifecycle/reservas.
- Academia impact de ficha postulacion dinamica.
- Academia impact de notification outbox.
- Academia impact de email/user mailbox.
- Academia impact de CRM external folder refs.

### Operacion Phase A

- Postulaciones y asignaciones sync HR/plataforma.
- Visit lifecycle.
- Reservas, franja, rango y quincena.
- Restricciones de proyecto y ficha de postulacion.
- Ficha de postulacion dinamica.
- Login externo configurable por tenant.
- Gestion estrategica de postulaciones.
- Notification outbox / WhatsApp Web fallback.
- Email traceability.
- Email real futuro por usuario.
- Email provider-agnostic por usuario.
- CRM, OneDrive, documentos y pipeline.
- Shopper communication history.
- Liquidaciones y pagos.
- Cinepolis Boleto/Combo, lotes y movimientos individuales.
- Preview validator/source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo.
- Politica consolidada de datos sensibles para fuentes, pagos, correo, adjuntos y evidencias.
- Preview validator de assignment sync/conflicts con gate de datos sensibles.
- Preview validator de visit lifecycle/reservas con gates de assignment sync y datos sensibles.
- Preview validator de ficha postulacion dinamica con gates de datos sensibles, assignment sync y visit lifecycle/reservas.
- Preview validator de notification outbox con gates de datos sensibles, postulaciones, assignment sync y visit lifecycle/reservas.
- Preview validator de email/user mailbox sin conexion real, con notification outbox como gate previo.
- Preview validator de CRM external folder refs con gates de email/mailbox, notification outbox y datos sensibles.

## Bloques agregados durante revision

Estos bloques no estaban suficientemente explicitados al inicio y se agregaron por hallazgos de Paula:

1. Reservas y control de franja/quincena.
2. Restricciones configurables por proyecto.
3. Ficha de postulacion dinamica y shopper-visible.
4. Opciones externas de login por tenant.
5. Gestion de postulaciones por sucursal/shopper.
6. Notification outbox y WhatsApp Web fallback.
7. Correo por usuario y provider-agnostic.
8. CRM/OneDrive/documentos/pipeline.
9. Shopper communication history ampliado.
10. Reembolsos Cinepolis Boleto/Combo.
11. Movimientos individuales asociados a lotes.
12. Tracker de avance por bloque.
13. Source-safe preview para corte junio/liquidaciones antes de fuentes reales.
14. Politica sensible previa a fuentes reales: banco, documentos, NDA, correo, adjuntos y evidencias.
15. Assignment sync conflict preview antes de Make/HR real.
16. Visit lifecycle/reservation preview antes de agenda/HR real.
17. Dynamic postulation form preview antes de ficha real/storage real.
18. Auditorias V83/V84/V85/V86 como candidatas parciales; V86 queda continuidad backend, no source lock final.
19. Notification outbox preview antes de proveedores reales.
20. Email user mailbox preview antes de OAuth/SMTP/email real.
21. CRM external folder refs preview antes de OAuth/API/proveedor documental real.

## Bloque recien completado

### CRM external folder refs preview Phase A

Archivos:

- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `tools/migration/tya-crm-external-folder-refs-preview-validator.mjs`
- `app/docs/CRM-EXTERNAL-FOLDER-REFS-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-20260704.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-20260704.md`
- `app/docs/PENDIENTES-CLAUDE-ADDENDUM-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-20260704.md`

Estado:

- Solo contrato, docs y validador seguro.
- No lee fuentes reales si no se le pasa input.
- El input permitido debe ser sintetico/sanitizado y traer `sourceSafe=true`.
- No escribe archivos por defecto.
- No activa runtime, produccion, Firestore, Storage, proveedor externo, OAuth, Make, Gemini, lectura documental ni import real.
- Usa email/mailbox, notification outbox y politica de datos sensibles como gates previos.

## Ultima auditoria de prototipo

### V86

Archivos de auditoria:

- `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V86-CLAUDE-20260704.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V86-AUDITORIA-20260704.md`
- `app/docs/PENDIENTES-CLAUDE-ADDENDUM-V86-AUDITORIA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V86-CLAUDE-20260704.md`

Decision:

- V86 trae cambios reales: `modules/academia.js`, `modules/dashboard.js`, `modules/misvisitas.js`.
- V86 no es source lock final ni produccion.
- V86 queda como candidata auditada de continuidad backend.
- Claude debe generar V87 correctiva cuando recupere capacidad.

## Pendientes backend inmediatos

1. Preview validator de shopper communication history.
2. Ejecutar validator de liquidaciones/corte junio contra input local sintetico/sanitizado cuando exista fuente segura.
3. Contrato ranking/scoring shopper.
4. Integrar politica de datos sensibles como gate transversal de validators restantes.
5. Preparar input sintetico/sanitizado para assignment sync conflict preview.
6. Preparar input sintetico/sanitizado para visit lifecycle/reservation preview.
7. Preparar input sintetico/sanitizado para postulation dynamic form preview.
8. Preparar input sintetico/sanitizado para notification outbox preview.
9. Preparar input sintetico/sanitizado para email/user mailbox preview.
10. Preparar input sintetico/sanitizado para CRM external folder refs preview.
11. Make/email/provider payloads futuros sin activar.

## Pendientes prototipo / Claude

1. Login externo por tenant.
2. Ficha de postulacion frontal/dorso dinamica.
3. Bandeja postulaciones por sucursal/shopper.
4. Acciones ajuste fecha/confirmacion/reprogramacion.
5. Estados honestos de notificaciones.
6. WhatsApp Web fallback con confirmacion manual.
7. Email por usuario/provider agnostic.
8. CRM con carpeta externa/documentos/pipeline.
9. Shopper history completo.
10. Mis beneficios con honorario/reembolso/estado.
11. Lotes y movimientos individuales.
12. Academia interactiva profunda con backfill completo.
13. Liquidaciones/Cinepolis: Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total y estado.
14. Admin/Liquidaciones debe mostrar revision manual/conflicto si faltan llaves estables o referencias de pago.
15. Movimientos debe conservar pago individual aunque venga de lote.
16. Datos sensibles: no exponer banco, documentos, NDA, cuerpos crudos ni adjuntos privados; usar estados protegido/pendiente backend/requiere autorizacion.
17. Assignment sync: Postulaciones no debe mostrar `HR sincronizada` si gate esta apagado; debe mostrar pendiente HR sync, preview, conflicto o revision manual.
18. Visitas asignadas desde plataforma o HR preview deben salir de disponibles sin duplicarse.
19. Visit lifecycle/reservas: agenda/reprogramacion no debe prometer HR sync real; fuera de rango debe mostrar regla fallida y pedir override.
20. Separar disponible, reservada, agendada, realizada, cuestionario completado, revision, submitido, liquidacion y pago.
21. Ficha postulacion dinamica: configurable por proyecto/version, campos requeridos/opcionales, referencias privadas, sin archivos raw y sin tratar postulacion como asignacion.
22. Notification outbox: toasters no deben decir enviado/sincronizado si solo hay preview; WhatsApp/email deben quedar como fallback/draft/provider pendiente.
23. Email/user mailbox: UI no debe decir conectado/leido/enviado si gate esta apagado; separar draft, log manual, provider pending y enviado real.
24. CRM/documentos: no decir carpeta creada/conectada/sincronizada; usar ref preview, provider pending, permission review, blocked private link y manual review.
25. V87 correctiva debe corregir P0 de V86 y mantener sus mejoras reales.

## Pendientes Academia

1. Matriz curso/manual por rol y modulo.
2. Glosario consolidado.
3. Checklists interactivos.
4. Rutas obligatorias por rol.
5. Notificaciones de cursos/manuales.
6. Contenido retroactivo de todos los bloques backend.
7. Profundizar liquidaciones/pagos.
8. Profundizar correo/CRM/Shopper history.
9. Profundizar liquidaciones/Cinepolis source-safe preview, Boleto/Combo, corte junio, revision manual, lotes y movimientos individuales.
10. Profundizar datos sensibles: sourceSafe, datos protegidos, referencias opacas, privacidad shopper, import seguro e integraciones apagadas.
11. Profundizar assignment sync/conflicts: postulacion a asignacion, HR detected, no duplicar, conflicto, revision manual y visual dedupe prohibido.
12. Profundizar visit lifecycle/reservas: agenda, reprogramacion, cancelacion, availableFrom, franja, quincena, override, realizada y cuestionario completado.
13. Profundizar ficha postulacion dinamica: formId, formVersion, fieldId, sensibilidad, revision ops/admin y versionado.
14. Profundizar notification outbox: templateId, templateVersion, recipientRef, outboxStatus, manualFallbackStatus, fallback manual y estados honestos.
15. Profundizar email/user mailbox: mailboxId, providerType, connectionStatus, canDraft, canLogManual, draft_ready_preview y manual_log_only.
16. Profundizar CRM external folder refs: crmEntityId, externalFolderRefId, externalProviderType, visibilityScope, accessStatus, provider pending y permission review.

## Siguiente bloque recomendado

Preview validator de shopper communication history, usando CRM folder refs, email/mailbox, notification outbox y politica de datos sensibles como gates previos.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
