# Phase A block progress tracker TyA

Fecha: 2026-07-04

## Estado general

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Ultima version entregada y auditada: baseline auditada de continuidad backend, no source lock final ni produccion
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
- Auditorias forenses de prototipos previos.
- Paquetes descargables Claude de auditorias previas.
- Auditoria complementaria delta vs acumulado Codex para reforzar profundidad y evitar confusion entre cambios acumulados y nuevos.
- Empalme de ultima version auditada como baseline de continuidad backend.
- Regla de no reiniciar por cada ZIP.
- Regla de trabajar sobre la ultima version auditada usable, salvo bloqueo critico.
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
- Project/tenant rule versioning preview.

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
- Academia impact de shopper communication history.
- Academia impact de shopper ranking/scoring.
- Academia impact de project/tenant rule versioning.

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
- Shopper ranking/scoring.
- Project/tenant rule versioning.
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
- Preview validator de shopper communication history con gates de CRM folder refs, email/mailbox, notification outbox y datos sensibles.
- Preview validator de shopper ranking/scoring con gates de datos sensibles, assignment sync, visit lifecycle y communication history.
- Preview validator de project/tenant rule versioning con gates transversales de configuracion.

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
18. Auditorias de prototipos como candidatas parciales y empalme de ultima baseline auditada de continuidad backend.
19. Notification outbox preview antes de proveedores reales.
20. Email user mailbox preview antes de OAuth/SMTP/email real.
21. CRM external folder refs preview antes de OAuth/API/proveedor documental real.
22. Shopper communication history preview antes de lectura/envio/import real de comunicaciones.
23. Auditoria profunda reforzada: cada paquete debe distinguir delta vs acumulado y responder punto por punto a reportes Claude/Codex.
24. Shopper ranking/scoring preview antes de decisiones automaticas, Gemini real o autoasignacion.
25. Project/tenant rule versioning preview antes de cambios reales de configuracion, providers, HR mapping, questionnaire routing, pagos o pais/moneda.

## Bloque recien completado

### Project/tenant rule versioning preview Phase A

Archivos:

- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs`
- `app/docs/PROJECT-TENANT-RULE-VERSIONING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-20260704.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-20260704.md`
- `app/docs/PENDIENTES-CLAUDE-ADDENDUM-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-20260704.md`

Estado:

- Solo contrato, docs y validador seguro.
- No lee fuentes reales si no se le pasa input.
- El input permitido debe ser sintetico/sanitizado y traer `sourceSafe=true`.
- No escribe archivos por defecto.
- No activa runtime, produccion, Firestore, Make, Gemini, providers, cambios historicos ni import real.
- Usa todos los contratos previos como contexto/gates transversales.

## Ultima auditoria de prototipo

Decision vigente:

- La ultima version entregada y auditada queda como baseline auditada de continuidad backend.
- No es source lock final ni produccion.
- La auditoria profunda debe distinguir siempre delta vs acumulado.
- Claude debe generar la siguiente correctiva sobre la ultima baseline auditada valida cuando recupere capacidad.

Documentos clave:

- `app/docs/EMPALME-ULTIMA-VERSION-AUDITADA-CONTINUIDAD-BACKEND-TYA-20260704.md`
- `app/docs/ADDENDUM-MAESTRO-METODOLOGIA-AUDITORIA-EMPALME-ULTIMA-VERSION-20260704.md`
- ultima auditoria forense de prototipo en `app/docs/`
- ultimo resumen y pendientes para Claude en `app/docs/`

## Pendientes backend inmediatos

1. Preparar input sintetico/sanitizado para project/tenant rule versioning preview.
2. Preparar input sintetico/sanitizado para shopper ranking/scoring preview.
3. Preparar input sintetico/sanitizado para shopper communication history preview.
4. Preparar input sintetico/sanitizado para CRM external folder refs preview.
5. Preparar input sintetico/sanitizado para email/user mailbox preview.
6. Preparar input sintetico/sanitizado para notification outbox preview.
7. Preparar input sintetico/sanitizado para postulation dynamic form preview.
8. Preparar input sintetico/sanitizado para visit lifecycle/reservation preview.
9. Preparar input sintetico/sanitizado para assignment sync conflict preview.
10. Ejecutar validator de liquidaciones/corte junio contra input local sintetico/sanitizado cuando exista fuente segura.
11. Integrar politica de datos sensibles como gate transversal de validators restantes.
12. Preparar payload futuro de changelog/notificaciones de cambios de reglas sin activar runtime.
13. Make/email/provider/Gemini payloads futuros sin activar.

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
10. Shopper ranking/scoring preview honesto, sin autoasignacion ni datos sensibles.
11. Project settings/rule versioning con estados draft/review/future active/deprecated.
12. Mis beneficios con honorario/reembolso/estado.
13. Lotes y movimientos individuales.
14. Academia interactiva profunda con backfill completo.
15. Liquidaciones/Cinepolis: Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total y estado.
16. Admin/Liquidaciones debe mostrar revision manual/conflicto si faltan llaves estables o referencias de pago.
17. Movimientos debe conservar pago individual aunque venga de lote.
18. Datos sensibles: no exponer banco, documentos, NDA, cuerpos crudos ni adjuntos privados; usar estados protegido/pendiente backend/requiere autorizacion.
19. Assignment sync: Postulaciones no debe mostrar `HR sincronizada` si gate esta apagado; debe mostrar pendiente HR sync, preview, conflicto o revision manual.
20. Visitas asignadas desde plataforma o HR preview deben salir de disponibles sin duplicarse.
21. Visit lifecycle/reservas: agenda/reprogramacion no debe prometer HR sync real; fuera de rango debe mostrar regla fallida y pedir override.
22. Separar disponible, reservada, agendada, realizada, cuestionario completado, revision, submitido, liquidacion y pago.
23. Ficha postulacion dinamica: configurable por proyecto/version, campos requeridos/opcionales, referencias privadas, sin archivos raw y sin tratar postulacion como asignacion.
24. Notification outbox: toasters no deben decir enviado/sincronizado si solo hay preview; WhatsApp/email deben quedar como fallback/draft/provider pendiente.
25. Email/user mailbox: UI no debe decir conectado/leido/enviado si gate esta apagado; separar draft, log manual, provider pending y enviado real.
26. CRM/documentos: no decir carpeta creada/conectada/sincronizada; usar ref preview, provider pending, permission review, blocked private link y manual review.
27. Shopper history: no mostrar cuerpos crudos, telefonos/correos crudos ni adjuntos; usar timeline con estados honestos y llaves estables.
28. Ranking: mostrar desglose de metricas, muestra insuficiente, conflicto, revision manual y no usarlo como decision final.
29. Rule versioning: mostrar impacto, migration/rollback required y no usar proveedor activo si solo existe regla preview.

## Pendientes Academia

1. Matriz curso/manual por rol y modulo.
2. Glosario consolidado.
3. Checklists interactivos.
4. Rutas obligatorias por rol.
5. Notificaciones de cursos/manuales.
6. Contenido retroactivo de todos los bloques backend.
7. Profundizar liquidaciones/pagos.
8. Profundizar correo/CRM/Shopper history.
9. Profundizar datos sensibles: sourceSafe, datos protegidos, referencias opacas, privacidad shopper, import seguro e integraciones apagadas.
10. Profundizar assignment sync/conflicts: postulacion a asignacion, HR detected, no duplicar, conflicto, revision manual y visual dedupe prohibido.
11. Profundizar visit lifecycle/reservas: agenda, reprogramacion, cancelacion, availableFrom, franja, quincena, override, realizada y cuestionario completado.
12. Profundizar ficha postulacion dinamica: formId, formVersion, fieldId, sensibilidad, revision ops/admin y versionado.
13. Profundizar notification outbox: templateId, templateVersion, recipientRef, outboxStatus, manualFallbackStatus, fallback manual y estados honestos.
14. Profundizar email/user mailbox: mailboxId, providerType, connectionStatus, canDraft, canLogManual, draft_ready_preview y manual_log_only.
15. Profundizar CRM external folder refs: crmEntityId, externalFolderRefId, externalProviderType, visibilityScope, accessStatus, provider pending y permission review.
16. Profundizar shopper communication history: communicationId, threadId, participantRef, manualConfirmationStatus, communicationStatus, privacy, manual log y draft preview.
17. Profundizar shopper ranking/scoring: rankingRunId, rankingPeriodId, scoreVersion, metricId, metricWeight, scoreStatus, fairness, manual review y limites de uso.
18. Profundizar project/tenant rule versioning: ruleSetId, ruleSetVersion, ruleSetType, migrationPlanId, rollbackPlanId, breaking change y provider gates.

## Siguiente bloque recomendado

Preparar input sintetico/sanitizado para ejecutar validators previos o crear contrato/payload preview de changelog/notificaciones de cambios de reglas sin activar runtime.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
