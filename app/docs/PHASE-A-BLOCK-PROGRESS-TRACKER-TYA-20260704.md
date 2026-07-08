# Phase A block progress tracker TyA

Fecha: 2026-07-04  
Ultima actualizacion: 2026-07-08

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
- Rule change changelog/notification preview.
- Release readiness snapshot preview.
- Admin configurability contract preview-only.
- Conflict review queue + import readiness contract preview-only.

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
- Academia impact de rule change changelog/notifications.
- Academia impact de release readiness snapshot.
- Academia impact de admin configurability: NDA, planes, gates, auditRef, revision humana y estados honestos.
- Academia impact de conflict review/import readiness: export limpio vs preview vs import real, blockers, llaves estables, dedupe prohibido, revision humana y datos sensibles excluidos.

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
- Rule change changelog/notification preview.
- Release readiness snapshot preview.
- Admin configurability: NDAs, planes, reglas, HR, cuestionarios, documentos, evidencias, certificaciones, Academia, notificaciones, imports, pagos, integraciones, roles y gates.
- Conflict review/import readiness: cola de conflictos y readiness por area antes de cualquier import real.
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
- Preview validator de rule change changelog/notifications con gates de rule versioning, notification outbox, mailbox, communication history, Academia y datos sensibles.
- Preview validator de release readiness snapshot con gates transversales de todos los bloques previos.

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
26. Rule change changelog/notification preview antes de publicar changelog, enviar comunicaciones o marcar roles informados.
27. Release readiness snapshot preview antes de cualquier deploy, merge, import, escritura o activacion real.
28. Admin configurability preview antes de administrar desde UI real NDAs, planes, reglas, evidencias, cuestionarios, pagos, certificaciones, Academia, notificaciones, imports, Make/Gemini, roles y gates.
29. Conflict review/import readiness preview antes de cualquier import real o resolucion de conflictos HR/plataforma/historico.

## Bloque recien completado

### Conflict review queue + import readiness contract preview-only

Archivos:

- `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs`
- `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`

Estado:

- Solo contrato y documentacion segura.
- No cambia `/app/modules` ni `/app/core`.
- No activa runtime, produccion, Firestore, Storage, Auth, Make, Gemini, email/WhatsApp, pagos, deploy, merge, providers ni import real.
- Valida conflictos por entidad, sourceRefs opacas, llaves estables, severidad, estado de cola, auditRef, readiness por area y revision humana.
- Bloquea import real, escrituras reales, base vieja/dump viejo, auto-merge/auto-resolve de conflictos, dedupe visual/por nombre, overwrite sin revision, DPI, banco, NDA firmado, secretos/tokens/webhooks, adjuntos/base64/cuerpos crudos.

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

1. Preparar input sintetico/sanitizado para conflict review/import readiness contract.
2. Preparar input sintetico/sanitizado para admin configurability contract.
3. Preparar input sintetico/sanitizado para release readiness snapshot preview.
4. Preparar input sintetico/sanitizado para rule change changelog/notification preview.
5. Preparar input sintetico/sanitizado para project/tenant rule versioning preview.
6. Preparar input sintetico/sanitizado para shopper ranking/scoring preview.
7. Preparar input sintetico/sanitizado para shopper communication history preview.
8. Preparar input sintetico/sanitizado para CRM external folder refs preview.
9. Preparar input sintetico/sanitizado para email/user mailbox preview.
10. Preparar input sintetico/sanitizado para notification outbox preview.
11. Preparar input sintetico/sanitizado para postulation dynamic form preview.
12. Preparar input sintetico/sanitizado para visit lifecycle/reservation preview.
13. Preparar input sintetico/sanitizado para assignment sync conflict preview.
14. Ejecutar validator de liquidaciones/corte junio contra input local sintetico/sanitizado cuando exista fuente segura.
15. Integrar politica de datos sensibles como gate transversal de validators restantes.
16. Preparar payload futuro para dashboard de readiness sin activar runtime.
17. Crear contrato/runner local de synthetic input pack para ejecutar validators previos sin fuentes reales.

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
12. Changelog/centro de actualizaciones con estados draft/review/approved preview y audiencia por rol.
13. Readiness dashboard con preview ready, missing input, prototype pending, backend pending, real gate off y manual review.
14. Admin configurability UI: fichas administrables para tenant/proyecto, reglas, HR, cuestionarios, documentos, NDAs, planes, evidencias, certificaciones, Academia, notificaciones, imports, pagos, integraciones, roles y gates.
15. Conflict review/import readiness UI: bandeja de conflictos, severidad, estado, sourceRefs opacas, readiness por area, razon obligatoria y bloqueo de import con blockers.
16. NDA UI: plantilla/version/vigencia/estado/creador/aprobador/auditRef/gate/reaceptacion, sin modificar aceptaciones ya presentadas.
17. Planes UI: tipo/version/vigencia/estado/roles/historial/auditRef con borrador, en revision, aprobado, activo, pausado, reemplazado y archivado.
18. Mis beneficios con honorario/reembolso/estado.
19. Lotes y movimientos individuales.
20. Academia interactiva profunda con backfill completo.
21. Liquidaciones/Cinepolis: Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total y estado.
22. Admin/Liquidaciones debe mostrar revision manual/conflicto si faltan llaves estables o referencias de pago.
23. Movimientos debe conservar pago individual aunque venga de lote.
24. Datos sensibles: no exponer banco, documentos, NDA, cuerpos crudos ni adjuntos privados; usar estados protegido/pendiente backend/requiere autorizacion.
25. Assignment sync: Postulaciones no debe mostrar `HR sincronizada` si gate esta apagado; debe mostrar pendiente HR sync, preview, conflicto o revision manual.
26. Visitas asignadas desde plataforma o HR preview deben salir de disponibles sin duplicarse.
27. Visit lifecycle/reservas: agenda/reprogramacion no debe prometer HR sync real; fuera de rango debe mostrar regla fallida y pedir override.
28. Separar disponible, reservada, agendada, realizada, cuestionario completado, revision, submitido, liquidacion y pago.
29. Ficha postulacion dinamica: configurable por proyecto/version, campos requeridos/opcionales, referencias privadas, sin archivos raw y sin tratar postulacion como asignacion.
30. Notification outbox: toasters no deben decir enviado/sincronizado si solo hay preview; WhatsApp/email deben quedar como fallback/draft/provider pendiente.
31. Email/user mailbox: UI no debe decir conectado/leido/enviado si gate esta apagado; separar draft, log manual, provider pending y enviado real.
32. CRM/documentos: no decir carpeta creada/conectada/sincronizada; usar ref preview, provider pending, permission review, blocked private link y manual review.
33. Shopper history: no mostrar cuerpos crudos, telefonos/correos crudos ni adjuntos; usar timeline con estados honestos y llaves estables.
34. Ranking: mostrar desglose de metricas, muestra insuficiente, conflicto, revision manual y no usarlo como decision final.
35. Rule versioning: mostrar impacto, migration/rollback required y no usar proveedor activo si solo existe regla preview.
36. Changelog/notificaciones: no decir publicado/enviado/informado si gates estan apagados; usar draft, review, provider pending y Academia update required.
37. Readiness: no decir production ready, deployed, imported, connected, sent o synced si gates estan apagados.

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
19. Profundizar rule change changelog/notifications: changeLogId, changeEventId, impactScope, audienceRole, notificationDraftId, academyUpdateRef, blocked_real_send y Academia update required.
20. Profundizar release readiness snapshot: snapshotId, readinessArea, readinessStatus, gateStatus, blockingReason, preview-ready vs production-ready y blockers.
21. Profundizar admin configurability: tenant/project config, roles, permissions, auditRef, gate, template/version/acceptance/reacceptance NDA, tipos/estados de planes, revision humana y provider preparado vs activo.
22. Profundizar conflict review/import readiness: conflictId, entityType, conflictType, severity, queueStatus, sourceRef opaca, stableKey, blocker, readiness area, clean/rejected/conflict counts, resolved preview vs aplicado real.

## Siguiente bloque recomendado

Crear contrato/runner local de synthetic input pack para ejecutar validators previos sin fuentes reales y producir un reporte agregado source-safe.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
