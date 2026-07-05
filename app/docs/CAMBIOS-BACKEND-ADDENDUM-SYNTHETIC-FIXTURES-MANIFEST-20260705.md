# Cambios backend addendum - Synthetic fixtures manifest

Fecha: 2026-07-05

## Bloque completado

Se crearon fixtures sinteticos minimos y manifest local del synthetic input pack para iniciar validacion previa de validators sin fuentes reales.

## Archivos creados

1. `tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: agrega manifest seguro con `fixtures` y `runPlan` para coordinar validators preview.

2. `tools/migration/synthetic-fixtures/phase-a/assignment-sync-conflict.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico para comparar asignacion plataforma vs HR sin duplicar ni deduplicar visualmente.

3. `tools/migration/synthetic-fixtures/phase-a/visit-lifecycle-reservation.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico para agenda, availableFrom, franja, quincena, realizada y cuestionario completado.

4. `tools/migration/synthetic-fixtures/phase-a/postulation-dynamic-form.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de formVersion, campos dinamicos y postulacion por visita.

5. `tools/migration/synthetic-fixtures/phase-a/notification-outbox.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de outboxStatus, canales in_app y fallback manual, sin envio real.

6. `tools/migration/synthetic-fixtures/phase-a/email-user-mailbox.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de mailbox manual-only y accion manual log; queda marcado para review si el scanner trata metadata requerida como sensible.

7. `tools/migration/synthetic-fixtures/phase-a/crm-external-folder-refs.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de crmEntityId y externalFolderRef opaco, sin proveedor real ni links privados.

8. `tools/migration/synthetic-fixtures/phase-a/shopper-communication-history.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de timeline de comunicaciones sin cuerpos crudos, telefonos, correos ni adjuntos.

9. `tools/migration/synthetic-fixtures/phase-a/shopper-ranking-scoring.phase-a.preview.json`
   - Tipo: nuevo.
   - Que cambia: fixture sintetico de ranking/scoring con metricas operativas, desglose y muestra minima.

10. `tools/migration/synthetic-fixtures/phase-a/project-tenant-rule-versioning.phase-a.preview.json`
    - Tipo: nuevo.
    - Que cambia: fixture sintetico de versionado de reglas de visita y pagos.

11. `tools/migration/synthetic-fixtures/phase-a/rule-change-changelog-notification.phase-a.preview.json`
    - Tipo: nuevo.
    - Que cambia: fixture sintetico de changelog, draft de notificacion y update requerido de Academia.

12. `tools/migration/synthetic-fixtures/phase-a/release-readiness-snapshot.phase-a.preview.json`
    - Tipo: nuevo.
    - Que cambia: fixture sintetico de readiness snapshot con prototype pending y gates reales apagados.

13. `tools/migration/synthetic-fixtures/phase-a/liquidation-cinepolis-source-safe.phase-a.preview.json`
    - Tipo: nuevo.
    - Que cambia: fixture sintetico de liquidaciones junio con honorario, Boleto, Combo, estado de pago, lote y movimiento individual.

14. `app/docs/SYNTHETIC-FIXTURES-MANIFEST-PHASE-A-TYA-20260705.md`
    - Tipo: nuevo.
    - Que cambia: documenta alcance, cobertura, decisiones de seguridad, comandos locales sugeridos y siguiente bloque.

## Estado seguro

- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin HR writes.
- Sin Make real.
- Sin Gemini real.
- Sin email/WhatsApp real.
- Sin proveedores reales.
- Sin datos sensibles.

## Phase A que avanza

- Permite iniciar validacion local controlada de assignment sync, visit lifecycle, postulaciones, notification outbox, mailbox, CRM refs, shopper history, ranking, rule versioning, changelog, release readiness y liquidaciones.
- Reduce reprocesos manuales porque cada validator ahora tiene un input sintetico minimo.
- Separa `missing input` de `defecto de validator` y de `gate real apagado`.
- Deja trazabilidad para readiness snapshot y Academia.

## Pendientes backend derivados

1. Ejecutar runner sin `--execute` y guardar salida segura si Paula autoriza o si se trabaja en entorno local del repo.
2. Ejecutar runner con `--execute` solo despues de validar que todos los validators siguen sin escrituras ni proveedores.
3. Revisar posible falso positivo del scanner por nombres metadata requeridos como `containsRawSensitiveData` y `emailAddressRef`.
4. Mapear salida del runner a release readiness snapshot preview.
5. Mantener fixtures como sinteticos; no reemplazarlos por fuentes reales.

## Pendientes prototipo/Claude derivados

1. Readiness UI debe mostrar fixtures sinteticos como evidencia de validacion preview, no como dato real ni import exitoso.
2. UI debe distinguir `missing input`, `review_required`, `blocked_real_gate_off`, `prototype_pending` y `preview_ready`.
3. No debe mostrar `sent`, `synced`, `connected`, `production ready`, `deployed` ni `imported` mientras gates reales esten apagados.
4. Debe incorporar señales recientes: `availableFrom`, `outboxStatus`, `mailboxId`, `formVersion`, `externalFolderRef`, `crmEntityId`.

## Impacto Academia

Academia debe explicar:

- Que es un fixture sintetico.
- Por que un validator preview no prueba datos reales.
- Como se lee un resultado `review_required`.
- Diferencia entre gate apagado, input faltante, conflicto y bloqueo por privacidad.
- Como los roles admin/ops/finance interpretan readiness sin prometer produccion.

## Siguiente bloque recomendado

Preparar reporte de ejecucion local del synthetic input pack runner sin `--execute`, revisar warnings/issues y definir si se ajusta el scanner o solo se documentan falsos positivos esperados.
