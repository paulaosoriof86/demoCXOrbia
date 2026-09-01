# CXOrbia — inventario read-only del backend canónico DEV

- Fecha: 2026-07-30T16:09:21.025Z
- Proyecto: `cxorbia-backend-dev`
- Clasificación: backend DEV de CXOrbia / tenant TyA; **no** plataforma legacy TyA a retirar.
- Modo: read-only; provider writes=0; no valores sensibles exportados.
- Auth users: 17
- Auth users disabled: 0
- Auth users with claims: 15
- Auth users tenant TyA: 13
- Old-rules operator users for TyA: 7
- Old-rules TyA operator users with password provider: 7
- Current-contract claim-shape users: 0
- Current-contract claim-shape users for TyA: 0
- Auth provider IDs observed: password
- Auth role counts (sanitized): admin:3, cliente:2, externo:1, ops:2, shopper:4, super:3
- Colecciones raíz: 1
- Rutas de colección descubiertas: 88
- Traversal truncado: no

## Conteos clave por nombre de colección

- tenants: 1
- clients: 3
- projects: 30
- visits: 1235
- shoppers: 340
- certifications: 77
- postulations: 3
- notifications: 20
- shopperBenefits: 572
- liquidations: 827
- finance: no localizado

## Reconciliación segura de shoppers/certificaciones

- Shoppers: 340
- Shoppers con algún campo cuyo nombre parece de certificación/curso/Academia: 0
- Campos de certificación/curso detectados: ninguno
- Ítems embebidos contados en arrays de esos campos: 0
- No se exportaron nombres, emails, teléfonos, documentos ni valores de shopper.

## Reconciliación segura de proyectos

- non-period-pattern: proyectos=4, visitas=661, cuestionarios=1, liquidaciones=572, postulaciones=3, applications=1, periods=15, certifications=77; ids=cinepolis, julio-pilot, r1, tya-piloto
- period-country: proyectos=26, visitas=574, cuestionarios=556, liquidaciones=255, postulaciones=0, applications=0, periods=0, certifications=0; ids=cinepolis-abril-26, cinepolis-abril-26-hn, cinepolis-agosto-25, cinepolis-agosto-25-hn, cinepolis-diciembre-25, cinepolis-diciembre-25-hn, cinepolis-enero-26, cinepolis-enero-26-hn, cinepolis-febrero-26, cinepolis-febrero-26-hn, cinepolis-julio-25, cinepolis-julio-25-hn, cinepolis-junio-25, cinepolis-junio-25-hn, cinepolis-junio-26, cinepolis-junio-26-hn, cinepolis-marzo-26, cinepolis-marzo-26-hn, cinepolis-mayo-26, cinepolis-mayo-26-hn, cinepolis-noviembre-25, cinepolis-noviembre-25-hn, cinepolis-octubre-25, cinepolis-octubre-25-hn, cinepolis-septiembre-25, cinepolis-septiembre-25-hn

| Project ID | Patrón | País | Period key | Source | Status | Visits | Questionnaires | Liquidations | Posts | Apps | Periods | Certs |
|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| cinepolis | non-period-pattern |  |  |  | active_dev | 616 | 0 | 572 | 0 | 0 | 14 | 77 |
| cinepolis-abril-26 | period-country | GT | 2026-04 | hr-tya-historico-sync | active | 35 | 34 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-abril-26-hn | period-country | HN | 2026-04 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-agosto-25 | period-country | GT | 2025-08 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-agosto-25-hn | period-country | HN | 2025-08 | hr-tya-historico-sync | active | 10 | 9 | 9 | 0 | 0 | 0 | 0 |
| cinepolis-diciembre-25 | period-country | GT | 2025-12 | hr-tya-historico-sync | active | 34 | 33 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-diciembre-25-hn | period-country | HN | 2025-12 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-enero-26 | period-country | GT | 2026-01 | hr-tya-historico-sync | active | 34 | 34 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-enero-26-hn | period-country | HN | 2026-01 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-febrero-26 | period-country | GT | 2026-02 | hr-tya-historico-sync | active | 34 | 34 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-febrero-26-hn | period-country | HN | 2026-02 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-julio-25 | period-country | GT | 2025-07 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-julio-25-hn | period-country | HN | 2025-07 | hr-tya-historico-sync | active | 10 | 10 | 10 | 0 | 0 | 0 | 0 |
| cinepolis-junio-25 | period-country | GT | 2025-06 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-junio-25-hn | period-country | HN | 2025-06 | hr-tya-historico-sync | active | 10 | 10 | 10 | 0 | 0 | 0 | 0 |
| cinepolis-junio-26 | period-country | GT | 2026-06 | hr-tya-historico-sync | active | 34 | 24 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-junio-26-hn | period-country | HN | 2026-06 | hr-tya-historico-sync | active | 11 | 7 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-marzo-26 | period-country | GT | 2026-03 | hr-tya-historico-sync | active | 34 | 34 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-marzo-26-hn | period-country | HN | 2026-03 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-mayo-26 | period-country | GT | 2026-05 | hr-tya-historico-sync | active | 34 | 34 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-mayo-26-hn | period-country | HN | 2026-05 | hr-tya-historico-sync | active | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| cinepolis-noviembre-25 | period-country | GT | 2025-11 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-noviembre-25-hn | period-country | HN | 2025-11 | hr-tya-historico-sync | active | 10 | 10 | 3 | 0 | 0 | 0 | 0 |
| cinepolis-octubre-25 | period-country | GT | 2025-10 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-octubre-25-hn | period-country | HN | 2025-10 | hr-tya-historico-sync | active | 10 | 9 | 9 | 0 | 0 | 0 | 0 |
| cinepolis-septiembre-25 | period-country | GT | 2025-09 | hr-tya-historico-sync | active | 34 | 34 | 34 | 0 | 0 | 0 | 0 |
| cinepolis-septiembre-25-hn | period-country | HN | 2025-09 | hr-tya-historico-sync | active | 10 | 10 | 10 | 0 | 0 | 0 | 0 |
| julio-pilot | non-period-pattern |  |  |  | dev-active | 1 | 0 | 0 | 0 | 1 | 1 | 0 |
| r1 | non-period-pattern |  |  |  | real-dev | 36 | 0 | 0 | 0 | 0 | 0 | 0 |
| tya-piloto | non-period-pattern |  |  |  | dev | 8 | 1 | 0 | 3 | 0 | 0 | 0 |

## Árbol de colecciones

| Ruta | Docs | Campos observados (solo nombres, sin valores) |
|---|---:|---|
| tenants | 1 | createdAt, name, source, status, tenantId, updatedAt |
| tenants/tya/clients | 3 | clientId, displayName, displayType, id, industry, name, source, status, sync, tenantId, updatedAt |
| tenants/tya/entityAuditTrail | 3 | actionId, actionType, auditId, auditType, createdAt, createdBy, entityId, entityType, idempotencyKey, payload, projectId, source, status, tenantId |
| tenants/tya/notifications | 20 | autor, dest, fecha, fijada, id, mensaje, recursoMime, recursoPDFnombre, recursoPDFurl, sourceKey, tipo, titulo |
| tenants/tya/operationActionLocks | 3 | actionId, actionType, createdAt, createdBy, entityId, entityType, idempotencyKey, payload, projectId, source, status, tenantId |
| tenants/tya/operationActions | 3 | actionId, actionType, createdAt, createdBy, entityId, entityType, idempotencyKey, payload, projectId, source, status, tenantId |
| tenants/tya/operationEvents | 3 | actionId, actionType, createdAt, createdBy, entityId, entityType, eventId, eventType, idempotencyKey, payload, projectId, source, status, tenantId |
| tenants/tya/projects | 30 | canAssignVisitsFromSource, canCreateShoppersFromSource, clientId, configurable, countries, country, currency, hrSourceId, id, imported, isPeriodSelectable, materializationAuthorizationId, materializationPlanId, materializationState, materializedAt, name, periodKey, production, projectId, questionnaireMode, schemaVersion, source, sourceSafe, sourceSheet, sourceSnapshotAt, sourceType, status, sync, syncMode, tenantId |
| tenants/tya/projects/cinepolis-abril-26-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-abril-26-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-abril-26/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-abril-26/responsibilityLog | 3 | actionId, actionType, createdAt, createdBy, entityId, entityType, idempotencyKey, payload, projectId, responsibilityId, responsibilityType, source, status, tenantId |
| tenants/tya/projects/cinepolis-abril-26/visits | 35 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-agosto-25-hn/liquidations | 9 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-agosto-25-hn/questionnaires | 9 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-agosto-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-agosto-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-agosto-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-agosto-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-diciembre-25-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-diciembre-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-diciembre-25/questionnaires | 33 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-diciembre-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-enero-26-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-enero-26-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-enero-26/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-enero-26/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-febrero-26-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-febrero-26-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-febrero-26/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-febrero-26/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-julio-25-hn/liquidations | 10 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-julio-25-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-julio-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-julio-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-julio-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-julio-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-junio-25-hn/liquidations | 10 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-25-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-junio-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-junio-26-hn/questionnaires | 7 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-26-hn/visits | 11 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-junio-26/questionnaires | 24 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-junio-26/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-marzo-26-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-marzo-26-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-marzo-26/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-marzo-26/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-mayo-26-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-mayo-26-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-mayo-26/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-mayo-26/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-noviembre-25-hn/liquidations | 3 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-noviembre-25-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-noviembre-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-noviembre-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-noviembre-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-noviembre-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-octubre-25-hn/liquidations | 9 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-octubre-25-hn/questionnaires | 9 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-octubre-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-octubre-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-octubre-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-octubre-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-septiembre-25-hn/liquidations | 10 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-septiembre-25-hn/questionnaires | 10 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-septiembre-25-hn/visits | 10 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis-septiembre-25/liquidations | 34 | clientId, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-septiembre-25/questionnaires | 34 | clientId, completedAt, id, projectId, shopperId, source, sourceSheet, status, sync, tenantId, visitId |
| tenants/tya/projects/cinepolis-septiembre-25/visits | 34 | canBeUpdatedByHrSync, ciudad, clientId, country, direccion, disponibleDesde, documentsOmitted, emailOmitted, estado, evidenceOmitted, fechaCuestionario, fechaProgramada, fechaRealizada, fechaSubmitido, formato, franja, honorarios, id, idCinema, liquidado, metodoPago, notesOmitted, numeroEncuesta, pais, periodKey, phoneOmitted, precioBoleto, precioCombo, projectId, quincena, revisor, shopperId, shopperName, source, sourceKey, sourceRow, sourceSheet, sucursal, sync, tenantId, tipoCombo, tipoCompra |
| tenants/tya/projects/cinepolis/certifications | 77 | certificationId, certificationKey, legacyShopperId, materializationAuthorizationId, materializedAt, presentedAt, production, projectId, recoveredEvidence, score, shopperId, source, sourceProjectId, status, tenantId |
| tenants/tya/projects/cinepolis/hrImports | 1 | counts, importId, imported, issueCount, materializationAuthorizationId, materializationPlanId, materializationState, materializedAt, production, schemaVersion, sourceAccessMode, sourceRef, sourceSafe, sourceSha256, sourceSnapshotAt, sourceType, state, tenantId, writes |
| tenants/tya/projects/cinepolis/liquidations | 572 | amountStatus, auditRef, boleto, branchId, branchName, combo, confirmedBy, country, currency, executionState, financialOverlayState, honorario, hrRowId, imported, liquidationId, liquidationState, lotEligible, materializationAuthorizationId, materializationPlanId, materializationState, materializedAt, missingAmountFields, paid, paidAt, paymentBatchId, paymentClaim, paymentControlOnly, paymentItemId, paymentSource, paymentState, periodKey, production, projectId, questionnaireAt, quincena, quincenaCandidate, realizedAt, reimbursement, reviewReasons, reviewRequired, schemaVersion, shopperCode, shopperId, shopperName, shopperResolutionKind, sourceRefs, sourceSafe, sourceShopperRef, sourceSnapshotAt, sourceTab, submittedAt, tenantId, totalKnown, visitId, visitState |
| tenants/tya/projects/cinepolis/periods | 14 | countries, imported, key, label, materializationAuthorizationId, materializationPlanId, materializationState, materializedAt, month, periodId, production, projectId, schemaVersion, sourceSafe, sourceSnapshotAt, state, tabs, tenantId, total, year |
| tenants/tya/projects/cinepolis/visits | 616 | availableFrom, branchId, branchName, city, comboType, compensation, country, currency, format, hrRowId, imported, materializationAuthorizationId, materializationPlanId, materializationState, materializedAt, paymentMethod, periodId, periodKey, piiProtected, production, projectId, questionnaireAt, quincena, realizedAt, scenario, scheduledAt, schemaVersion, shopperCode, shopperId, shopperName, shopperResolutionKind, slot, slotCode, sourceRow, sourceSafe, sourceShopperRef, sourceSnapshotAt, sourceTab, status, submittedAt, tenantId, visitId |
| tenants/tya/projects/julio-pilot/applications | 1 | applicationId, createdAt, proposedDate, proposedTimeBand, reason, responsibleUid, shopperId, status, updatedAt, visitId |
| tenants/tya/projects/julio-pilot/periods | 1 | countries, createdAt, hrSources, label, month, periodId, projectId, status, tenantId, updatedAt, year |
| tenants/tya/projects/julio-pilot/visits | 1 | availableFrom, branchId, country, createdAt, fee, franja, hrRef, lastManagedBy, periodId, projectId, quincena, reimbursements, responsibleUid, scenario, status, updatedAt, visitId |
| tenants/tya/projects/r1/visits | 36 | accountId, agendada, boleto, canal, ciudad, clientId, combo, comboAmt, cuestFecha, currency, disponibleDesde, escenario, estado, formato, franja, franjaCode, honorario, id, migratedFrom, num, pais, projectId, quincena, rango, realizada, shopper, shopperCode, shopperId, submit, sucursal, tenantId |
| tenants/tya/projects/tya-piloto/postulations | 3 | accountId, aprobadaPor, boleto, ciudad, clientId, comboAmt, currency, disponibleDesde, estado, fechaProp, franjaCode, honorario, id, pais, projectId, quincena, reprog, shopper, shopperCode, shopperId, sucursal, tenantId, visitaId |
| tenants/tya/projects/tya-piloto/questionnaires | 1 | accountId, clientId, escenario, id, preguntas, projectId, status, tenantId, version |
| tenants/tya/projects/tya-piloto/visits | 8 | accountId, agendada, boleto, canal, ciudad, clientId, combo, comboAmt, cuestFecha, currency, disponibleDesde, escenario, estado, formato, franja, franjaCode, honorario, id, num, pais, projectId, quincena, rango, realizada, shopper, shopperCode, shopperId, submit, sucursal, tenantId |
| tenants/tya/shopperBenefits | 572 | benefitId, comboReimbursementAmount, country, createdAt, currency, devAppliedAt, devAppliedBy, devApplySource, financialMovementId, honorariumAmount, otherReimbursementAmount, paymentLotId, periodId, projectId, shopperId, source, sourceVisitId, status, tenantId, ticketReimbursementAmount, totalCalculated, updatedAt, visitId, writePlanCreatedAt |
| tenants/tya/shoppers | 340 | city, ciudad, code, country, createdAt, createdFromExternalSource, displayName, documentsOmitted, email, emailOmitted, estado, firstName, id, lastName, legacyShopperId, materializationAuthorizationId, materializedAt, migratedFrom, name, nombre, pais, perfilCompleto, phone, phoneOmitted, production, profileStatus, rating, shopperId, source, sourceKey, status, tenantId, updatedAt |
| tenants/tya/shopperStats | 1 | criteria, history, score, shopperId, updatedAt |

## Seguridad

- Firestore document writes: 0
- Auth writes: 0
- Storage/Rules/Functions/Hosting writes: 0
- Producción/merge: false
- Este reporte no contiene nombres, emails, teléfonos, DPI, bancos, NDA ni valores de documentos.
