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
- Paquete Claude completo acumulado post synthetic coverage.

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
- Synthetic input pack expanded coverage preview-only.
- Readiness dashboard source-safe contract preview-only.

### Academia

- Academia role-based learning contract.
- Academia deep interactive addendum.
- Academia module sync gate.
- Academia backfill backend blocks.
- Academia coverage audit backend to date.
- Academia implementation backlog.
- Academia impact de release readiness snapshot.
- Academia impact de admin configurability.
- Academia impact de conflict review/import readiness.
- Academia impact de synthetic input pack runner.
- Academia impact de synthetic input pack expanded coverage.
- Academia impact de readiness dashboard source-safe: preview vs real, fixtures, inputs sanitizados, source-safe report, gates apagados, errores, warnings, blockers y revision humana.

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
- Admin configurability.
- Conflict review/import readiness.
- Synthetic input pack runner.
- Synthetic input pack expanded coverage para assignment sync, notification outbox, rule versioning, changelog/notifications y release readiness.
- Readiness dashboard source-safe para estados honestos agregados sin runtime real.
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
31. Synthetic input pack expanded coverage antes de diagnosticar readiness agregado por areas criticas.
32. Readiness dashboard source-safe antes de exponer estados agregados en UI o declarar readiness operacional.

## Bloque recien completado

### Readiness dashboard source-safe contract preview-only

Archivos:

- `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs`
- `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`

Estado:

- Contrato preview-only para manifest agregado de readiness.
- No cambia `/app/modules` ni `/app/core`.
- No activa runtime, produccion, Firestore, Storage, Auth, Make, Gemini, email/WhatsApp, pagos, deploy, merge, providers ni import real.
- Valida source-safe, input sintetico/sanitizado, sourceRefs opacas, gates apagados, estados honestos y absence de claims prohibidos.

## Ultima auditoria de prototipo

Decision vigente:

- La ultima version entregada y auditada queda como baseline auditada de continuidad backend.
- No es source lock final ni produccion.
- La auditoria profunda debe distinguir siempre delta vs acumulado.
- Claude debe generar la siguiente correctiva sobre la ultima baseline auditada valida cuando recupere capacidad.

## Pendientes backend inmediatos

1. Revisar gates del nuevo head despues de este bloque.
2. Preparar input sintetico/sanitizado ampliado para conflict review/import readiness contract.
3. Preparar input sintetico/sanitizado ampliado para admin configurability contract.
4. Preparar puente opcional entre synthetic runner report y readiness dashboard manifest, sin outputs reales por defecto.
5. Mantener politica de datos sensibles como gate transversal de validators restantes.

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
13. Readiness dashboard con preview ready, warnings, fail, pending real source, pending real gate, human review, production not authorized, provider not active y blockers.
14. Admin configurability UI.
15. Conflict review/import readiness UI.
16. Synthetic input pack UI opcional: mostrar diagnostico preview/pass-fail/warnings sin prometer produccion, import, sync, provider activo ni deploy.
17. Synthetic expanded coverage UI opcional: mostrar areas cubiertas, fixtures, validators, pass/fail/warnings y gates apagados.
18. Readiness: no decir production ready, deployed, imported, connected, sent o synced si gates estan apagados.

## Pendientes Academia

1. Matriz curso/manual por rol y modulo.
2. Glosario consolidado.
3. Checklists interactivos.
4. Rutas obligatorias por rol.
5. Notificaciones de cursos/manuales.
6. Contenido retroactivo de todos los bloques backend.
7. Profundizar readiness dashboard source-safe: preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.

## Siguiente bloque recomendado

Preparar puente opcional entre resultados del synthetic input pack runner y un manifest de readiness dashboard source-safe, sin runtime real ni outputs por defecto.

## Regla de cierre por bloque

Cada cierre debe mostrar:

- avance del plan;
- bloque completado;
- pendientes agregados;
- bloque siguiente;
- gates apagados;
- si se requiere insumo de Paula.
