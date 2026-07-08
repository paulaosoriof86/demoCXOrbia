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
- Paquetes Claude de auditorias previas.
- Auditoria complementaria delta vs acumulado Codex/Claude.
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
- Synthetic input pack runner preview-only.

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
- Academia impact de synthetic input pack runner: fixtures sinteticos, inputs sanitizados, pruebas de contrato, source-safe report, limites y revision humana.

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
- Synthetic input pack runner: ejecucion local de validadores con fixtures sinteticos/sanitizados y reporte agregado source-safe.
- Liquidaciones y pagos.
- Cinepolis Boleto/Combo, lotes y movimientos individuales.
- Preview validator/source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo.
- Politica consolidada de datos sensibles para fuentes, pagos, correo, adjuntos y evidencias.

## Bloques agregados durante revision

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
30. Synthetic input pack runner preview antes de correr validadores con fuentes reales o inputs sanitizados ampliados.

## Bloque recien completado

### Synthetic input pack runner preview-only

Archivos:

- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`

Estado:

- Solo runner local y documentacion segura.
- No cambia `/app/modules` ni `/app/core`.
- No activa runtime, produccion, Firestore, Storage, Auth, Make, Gemini, email/WhatsApp, pagos, deploy, merge, providers ni import real.
- Ejecuta fixtures sinteticos/sanitizados para contratos preview-only.
- Produce JSON por consola y opcionalmente reporte local JSON/MD con `--out`.
- No sube outputs ni datos reales al repo.

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

1. Ejecutar synthetic input pack runner cuando se requiera validacion local, sin fuentes reales.
2. Preparar input sintetico/sanitizado ampliado para conflict review/import readiness contract.
3. Preparar input sintetico/sanitizado ampliado para admin configurability contract.
4. Preparar input sintetico/sanitizado para release readiness snapshot preview.
5. Preparar input sintetico/sanitizado para rule change changelog/notification preview.
6. Preparar input sintetico/sanitizado para project/tenant rule versioning preview.
7. Preparar input sintetico/sanitizado para shopper ranking/scoring preview.
8. Preparar input sintetico/sanitizado para shopper communication history preview.
9. Preparar input sintetico/sanitizado para CRM external folder refs preview.
10. Preparar input sintetico/sanitizado para email/user mailbox preview.
11. Preparar input sintetico/sanitizado para notification outbox preview.
12. Preparar input sintetico/sanitizado para postulation dynamic form preview.
13. Preparar input sintetico/sanitizado para visit lifecycle/reservation preview.
14. Preparar input sintetico/sanitizado para assignment sync conflict preview.
15. Ejecutar validator de liquidaciones/corte junio contra input local sintetico/sanitizado cuando exista fuente segura.
16. Integrar politica de datos sensibles como gate transversal de validators restantes.
17. Preparar payload futuro para dashboard de readiness sin activar runtime.

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
16. Synthetic input pack UI opcional: mostrar diagnostico preview/pass-fail/warnings sin prometer produccion, import, sync, provider activo ni deploy.
17. NDA UI: plantilla/version/vigencia/estado/creador/aprobador/auditRef/gate/reaceptacion, sin modificar aceptaciones ya presentadas.
18. Planes UI: tipo/version/vigencia/estado/roles/historial/auditRef con borrador, en revision, aprobado, activo, pausado, reemplazado y archivado.
19. Mis beneficios con honorario/reembolso/estado.
20. Lotes y movimientos individuales.
21. Academia interactiva profunda con backfill completo.
22. Liquidaciones/Cinepolis: Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total y estado.
23. Admin/Liquidaciones debe mostrar revision manual/conflicto si faltan llaves estables o referencias de pago.
24. Movimientos debe conservar pago individual aunque venga de lote.
25. Datos sensibles: no exponer banco, documentos, NDA, cuerpos crudos ni adjuntos privados; usar estados protegido/pendiente backend/requiere autorizacion.
26. Assignment sync: Postulaciones no debe mostrar `HR sincronizada` si gate esta apagado; debe mostrar pendiente HR sync, preview, conflicto o revision manual.
27. Separar disponible, reservada, agendada, realizada, cuestionario completado, revision, submitido, liquidacion y pago.
28. Readiness: no decir production ready, deployed, imported, connected, sent o synced si gates estan apagados.

## Pendientes Academia

1. Matriz curso/manual por rol y modulo.
2. Glosario consolidado.
3. Checklists interactivos.
4. Rutas obligatorias por rol.
5. Notificaciones de cursos/manuales.
6. Contenido retroactivo de todos los bloques backend.
7. Profundizar liquidaciones/pagos.
8. Profundizar datos sensibles: sourceSafe, datos protegidos, referencias opacas, privacidad shopper, import seguro e integraciones apagadas.
9. Profundizar assignment sync/conflicts.
10. Profundizar visit lifecycle/reservas.
11. Profundizar notification outbox y email/user mailbox.
12. Profundizar shopper ranking/scoring.
13. Profundizar project/tenant rule versioning.
14. Profundizar rule change changelog/notifications.
15. Profundizar release readiness snapshot.
16. Profundizar admin configurability.
17. Profundizar conflict review/import readiness.
18. Profundizar synthetic input pack runner: fixture sintetico, input sanitizado, pruebas de contrato, source-safe report, pass/fail/warnings, limites y revision humana.

## Siguiente bloque recomendado

Preparar un synthetic pack agregado mas amplio para cubrir inputs sinteticos de readiness/release, rule versioning, notification outbox y assignment sync, sin fuentes reales.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
