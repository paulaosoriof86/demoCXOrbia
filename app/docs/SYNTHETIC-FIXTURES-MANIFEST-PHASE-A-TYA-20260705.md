# Synthetic fixtures manifest Phase A TyA

Fecha: 2026-07-05

## Objetivo

Crear fixtures sinteticos minimos y manifest local para empezar a validar los runners preview sin usar fuentes reales, HR real, pagos reales, comunicaciones reales, documentos privados, proveedores, Firestore, Storage, Make, Gemini, email, WhatsApp, deploy o merge.

Este bloque da continuidad al synthetic input pack preview y permite diferenciar tres escenarios:

1. El validador funciona con input sintetico.
2. Falta fixture o contrato para ejecutar una prueba.
3. El validador devuelve review_required por regla de seguridad, conflicto o inconsistencia contrato/fixture.

## Archivos creados

Directorio:

`tools/migration/synthetic-fixtures/phase-a/`

Fixtures:

1. `assignment-sync-conflict.phase-a.preview.json`
2. `visit-lifecycle-reservation.phase-a.preview.json`
3. `postulation-dynamic-form.phase-a.preview.json`
4. `notification-outbox.phase-a.preview.json`
5. `email-user-mailbox.phase-a.preview.json`
6. `crm-external-folder-refs.phase-a.preview.json`
7. `shopper-communication-history.phase-a.preview.json`
8. `shopper-ranking-scoring.phase-a.preview.json`
9. `project-tenant-rule-versioning.phase-a.preview.json`
10. `rule-change-changelog-notification.phase-a.preview.json`
11. `release-readiness-snapshot.phase-a.preview.json`
12. `liquidation-cinepolis-source-safe.phase-a.preview.json`

Manifest:

`synthetic-input-pack-manifest.phase-a.preview.json`

## Cobertura por validator

| Fixture | Validator previsto | Estado esperado |
|---|---|---|
| assignment sync conflict | `tya-assignment-sync-conflict-preview-validator.mjs` | preview/review local seguro |
| visit lifecycle reservation | `tya-visit-lifecycle-reservation-preview-validator.mjs` | preview/review local seguro |
| postulation dynamic form | `tya-postulation-dynamic-form-preview-validator.mjs` | preview/review local seguro |
| notification outbox | `tya-notification-outbox-preview-validator.mjs` | preview/review local seguro |
| email user mailbox | `tya-email-user-mailbox-preview-validator.mjs` | review local esperado si el scanner marca campos metadata requeridos |
| CRM external folder refs | `tya-crm-external-folder-refs-preview-validator.mjs` | preview/review local seguro |
| shopper communication history | `tya-shopper-communication-history-preview-validator.mjs` | preview/review local seguro |
| shopper ranking scoring | `tya-shopper-ranking-scoring-preview-validator.mjs` | preview/review local seguro |
| project tenant rule versioning | `tya-project-tenant-rule-versioning-preview-validator.mjs` | preview/review local seguro |
| rule change changelog notification | `tya-rule-change-changelog-notification-preview-validator.mjs` | preview/review local seguro |
| release readiness snapshot | `tya-release-readiness-snapshot-preview-validator.mjs` | preview/review local seguro |
| liquidation Cinepolis source-safe | `tya-liquidation-cinepolis-source-safe-preview-validator.mjs` | preview/review local seguro |

## Decisiones de seguridad

- Todo input usa `sourceSafe=true`.
- Todo input usa `containsRawSensitiveData=false`.
- Todo input usa `isSyntheticOrSanitized=true`.
- El manifest usa `realDataProhibited=true`.
- No se incluyeron nombres reales de shoppers, telefonos, correos, DPI, bancos, cuentas, NDA, links privados, cuerpos de mensajes, adjuntos, evidencias ni documentos.
- Las referencias son opacas y sinteticas: `shopper-preview-*`, `visit-preview-*`, `hr-row-preview-*`, `source_safe_ref:*`, `external-folder-ref-preview-*`.
- Los fixtures no prueban limpieza de datos reales; solo prueban estructura y gates de validadores.

## Notas tecnicas

El fixture `email-user-mailbox.phase-a.preview.json` conserva `emailAddressRef` porque el contrato del bloque lo exige. Si el validator o el runner marca ese nombre de campo como sensible por contener `email` o `address`, el resultado esperado debe tratarse como review de contrato/scanner, no como dato real filtrado. No se debe relajar privacidad sin revisar el scanner.

El synthetic pack runner debe ejecutarse primero sin `--execute`, para validar manifest y existencia de rutas. Solo despues se puede ejecutar con `--execute` contra validators locales, siempre que se confirme que no escriben, no importan y no llaman proveedores.

## Comandos locales sugeridos para etapa posterior

No ejecutado en este bloque por trabajar desde GitHub connector.

```bash
node tools/migration/tya-synthetic-input-pack-preview-runner.mjs --input tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json
```

Solo despues de revisar salida:

```bash
node tools/migration/tya-synthetic-input-pack-preview-runner.mjs --input tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json --execute
```

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
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

## Siguiente bloque recomendado

Ejecutar o preparar reporte local del synthetic pack runner sin `--execute`, revisar falsos positivos del scanner de claves metadata, y despues mapear resultados a release readiness snapshot preview.
