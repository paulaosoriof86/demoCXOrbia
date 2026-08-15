# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 17:31 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__LEGAL_DRAFT_V0_1_PREPARED__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`: exact identity, un único reset ya consumido, UID/claims/profile/membership/crosswalk/history, login real + HR authority + history E2E PASS. No repetir reset/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

## Request08 — STOP seguro

Request commit `d21fb78aa012b1739fea03053a0a947fcd379ee4`; run `31909354336`; job `95071998299`; parking commit `8fa887900a5507b606b31dc0386a135060980837`.

Bloqueo exacto antes de Alta:
`I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`.

Se detuvo fail-closed, sin aceptar/firmar/guardar consentimiento, sin `shopper.create`, update, readback ni login de Shopper nuevo. Auth/Firestore writes nuevos `0/0`. Request08 consumido; no rerun.

## Cambios source-only de autoridad legal durable

### Contrato y adapter durable
Commit `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`.

- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js`
- `tools/qa/verify-i3-legal-acceptance-durable-source-only.mjs`
- existing checkpoint workflow extendido para verificar el contrato.

Define exact identity, human-only, provider authority, versioned receipt, server `acceptedAt`, fail-closed read model y cero localStorage authority.

### Provider runtime y bridge source-only
Commit `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`.

- creado `backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs`;
- creado `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js`;
- actualizado el contrato con presupuestos/gates provider;
- ampliado el verificador con fake provider store, idempotencia, actor spoof, acceptedAt spoof, versión/digest y gate-before-IO.

No se cargan credenciales al importar el módulo, no se importa `firebase-admin`, no se activó el bridge en el product entrypoint y no se tocaron `/app/modules` ni `/app/core`.

### Corrección focal de gate
El run `31913585259` falló únicamente en el `grep` contractual porque el reporte del verificador no incluía la llave explícita `firestoreWrites`, aunque el propio reporte ya mostraba provider IO real 0 y las pruebas source habían pasado. No fue una falla de provider/producto y no hubo ejecución provider.

Commit focal `0602d6ca0f64280222a4b1522b36f3be77c65c87`: añadió `authWrites=0` y `firestoreWrites=0` al reporte source-safe, sin cambiar la lógica provider.

Gate canónico push `31913700755`, job `95082399402`: `SUCCESS` completo. Gate PR `31913704247`, job `95082407608`: `SUCCESS` completo.

## Bloque 2026-08-15 — preparación de texto legal para revisión humana

Autorización recibida: preparar texto legal completo TyA para revisión humana, **sin guardar en Firebase ni aceptar por ningún usuario**.

Creado:
- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`
- commit inicial del draft: `7f67ee59bdf0d6de26b44a539f3f456a5a4e0445`.

Contenido del draft:
- acuerdo marco de uso de plataforma;
- confidencialidad y secreto operacional;
- evidencias y conducta de field operations;
- privacidad/tratamiento de datos y minimización;
- seguridad e incidentes;
- propiedad intelectual de software, contenidos y secretos empresariales;
- anexos por Shopper, staff/admin/operaciones, Cliente y roles transversales;
- anexos país Guatemala/Honduras;
- aviso resumido para pantalla;
- copy de aceptación humana no premarcada;
- matriz reusable de contenido legal por scope/rol/país;
- checklist de aprobación y campos pendientes.

Investigación jurídica de soporte: fuentes oficiales de Congreso de Guatemala, TSC/IAIP/Congreso de Honduras. Se documentó de forma conservadora la vigencia confirmada de marcos de firma electrónica y propiedad intelectual, y se evitó tratar iniciativas/anteproyectos de datos personales como ley confirmada.

El draft version es `tya-legal-bundle-v0.1-draft-20260815`. El SHA-256 incluido identifica solo el borrador; no es digest productivo. Después de completar campos y aprobar el texto debe recalcularse el digest final.

## Seguridad / efectos reales

Provider credentials/reads/writes del bloque legal-draft `0/0/0`; Auth/Firestore/legal acceptance writes `0/0/0`; password resets `0`; historical credential access/reconciliation `0/0`; otras identidades `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; product entrypoint activation `false`; deploy `0`; merge=false; producción=false.

No se modificó `/app/modules` ni `/app/core`. No se aceptó, firmó ni materializó contenido legal.

## Documentación

Lock técnico prevalente sigue siendo:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.

El borrador legal se incorpora como fuente de revisión, **no** como source lock ni autoridad productiva.

## Clasificación

- **Reusable CXOrbia:** estructura legal versionada por `legalContentId`/scope/rol/país; aceptación humana; separación entre términos obligatorios y consentimientos opcionales; privacidad por minimización; anexos reutilizables.
- **Exclusivo TyA:** identidad contractual, jurisdicción, retención, canales legales, proveedores efectivos y contenido final TyA/GT/HN.
- **Claude/prototipo:** no rediseñar frontend. El modal humano existente se preserva; futuro copy debe usar casillas no premarcadas y aviso de versión cuando el backend legal sea realmente activado.
- **Academia:** explicar confidencialidad por rol, protección de evidencias, seguridad de credenciales, privacidad y que cambios legales materiales pueden requerir nueva aceptación.
- **Sin impacto Claude:** investigación normativa, draft hash, documentación y preparación de gate.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.** Preparar el draft no suma puntaje I3 porque todavía no existe texto final aprobado, materialización provider, aceptación humana ni E2E Admin/new Shopper.

## Siguiente gate

Primero: completar/revisar el draft legal V0.1 con datos humanos faltantes y aprobar texto exacto. Luego asignar versión final + digest final. Solo después solicitar `PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME` para cualquier provider materialization/write/acceptance y continuación Admin/new Shopper.
