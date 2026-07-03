# CAMBIOS-BACKEND.md

## 2026-07-03 - Empalme incremental RC V70

- Se empalmo el delta del prototipo V70 sobre la rama backend estable.
- Archivos actualizados desde V70: app/core/config.js, app/index.html, app/modules/crm.js, app/modules/finanzas.js y app/modules/hr-source.js.
- Se alineo app/index-backend-dev.html con V70 conservando Firebase/backend DEV y core/backend-hr-source-bridge.js.
- No se hizo deploy, no se escribio Firestore y no se importaron datos.
- Se agrego app/docs/EMPALME-RC-V70-BACKEND-20260703.md.
## 2026-07-03 - Firestore write plan TyA sin escritura

- Se agregó `tools/migration/tya-build-firestore-write-plan.ps1` para convertir el staging preview local en un plan explícito de rutas/operaciones Firestore.
- El script genera `firestoreWritePlan.jsonl`, `importGate.json`, `writePlanManifest.json`, `writePlanSample.json` y `writePlanReport.md`.
- El plan mantiene `canWriteToFirestore=false`, `executeAllowed=false`, `Firestore writes=0` e `importsExecuted=0`.
- Si el preview contiene PII local, el plan se bloquea salvo flag local explícito.
- Se documentó en `app/docs/FIRESTORE-WRITE-PLAN-TYA-20260703.md`.
- Siguiente gate: revisar plan, resolver críticos y crear un importador DEV separado con autorización explícita y rollback.

## 2026-07-03 - MigrationBatch staging preview TyA

- Se agregó `tools/migration/tya-build-staging-preview.ps1` para construir preview local con forma de staging Firestore, sin escribir Firestore.
- El script genera `migrationBatch.json`, `firestorePathsPlan.json`, `rollbackPlan.json`, previews JSONL de visitas, submitidos, liquidaciones candidatas, shoppers, postulaciones, notificaciones y validationIssues.
- Por defecto omite PII y excluye DPI; el flag local `-IncludePiiLocal` queda solo para entorno controlado, nunca para repo.
- Se documentó en `app/docs/MIGRATION-BATCH-STAGING-TYA-20260703.md`.
- No importa datos, no escribe Firestore, no hace deploy, no toca frontend ni `/app/modules`.
- Siguiente gate: revisar preview local y luego crear importador DEV con escritura bloqueada por defecto hasta autorización explícita.

## 2026-07-03 - Validador dry-run migración TyA V6 + V7.1

- Se fijó regla metodológica: un ZIP nuevo de Claude no reinicia el proyecto; se procesa como release candidate incremental, se audita delta, se empalma sobre rama backend estable y se documenta qué resolvió, qué queda pendiente y qué aplica al backend.
- Se agregó `tools/migration/tya-dry-run-validator.ps1` como validador dry-run local para paquetes TyA V6 + V7.1.
- El validador extrae ZIPs, expande ZIPs internos, cuenta registros, revisa archivos faltantes, escanea extensiones no permitidas/posibles secretos y genera reportes Markdown/JSON sin PII cruda.
- Se documentó en `app/docs/DRY-RUN-VALIDATOR-TYA-V6-V7_1-20260703.md`.
- No importa datos, no escribe Firestore, no hace deploy, no toca frontend ni `/app/modules`.
- La importación sigue bloqueada hasta resolver DPI, cuestionarios duplicados, mojibake RTDB, destinatarios de notificaciones, `JUNIO 26 HN` y cruce financiero externo.

## 2026-06-30 - Fase B2/B3 V57 bulletins

- Se localizo `Prototype development request CXOrbia V57.zip` en `C:\Users\paula\Downloads`.
- Se copio `/app` desde V57 sobre la RC y se restauraron archivos backend protegidos.
- La copia visual V57 no genero diferencias adicionales en `app/index.html` ni `/app/modules`, por lo que la RC ya estaba alineada con la base V57 disponible.
- Se conservo `app/index.html` como demo normal, sin carga backend global.
- Se mantuvo `app/index-backend-dev.html` como preview backend DEV.
- Se preparo soporte Firestore local para `bulletins` y `bulletinReads` en `firestore.rules`, sin publicar reglas.
- Se actualizo `app/core/backend-bulletins.js` para leer novedades por tenant, rol, uid, shopperId, proyecto y pais, y para persistir leidos en `bulletinReads`.
- Se elimino el camino de `window.prompt` para credenciales DEV en `app/core/backend-firebase.js`.
- Validaciones locales: dry-run bulletins OK, validador bulletins OK, `node --check` OK en archivos tocados.
- Validacion de reglas con emulador Firestore no pudo completarse porque Java no esta disponible en PATH.
- No deploy, no Hosting, no merge, no produccion, no datos reales.

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-30 — Corrección documental de continuidad RC/backend

Motivo:

- Se corrigió la continuidad documental para que los pendientes y el estado del backend no queden solo en la conversación.
- Paula solicitó que los pendientes se mantengan en los archivos documentales vivos y se entreguen también como descargable.
- Se mantiene la regla: si no está documentado, no se hizo.

Archivos creados/actualizados:

- `CAMBIOS-BACKEND.md`: se agrega esta entrada de control documental.
- `RESUMEN-PARA-CLAUDE.md`: se consolida el estado real de la RC, backend DEV, gates, riesgos y próximos pasos.
- `PENDIENTES-PROTOTIPO.md`: se consolidan y priorizan los pendientes reales del prototipo detectados en la RC visual correcta.
- `INCIDENCIAS-INTEGRACION-BACKEND.md`: se separan errores de integración/backend/local de los pendientes que sí corresponden a Claude/prototipo.

Estado real registrado:

- Base visual correcta: `release/cxorbia-tya-rc-20260630`, no la rama backend vieja.
- Firebase DEV validado técnicamente en `cxorbia-backend-dev`.
- HR histórico V4 y `shopperBenefits` cargados/validados técnicamente.
- Preview backend abre, pero el diagnóstico observado aún muestra datos demo/localStorage y Auth pendiente.
- No se debe considerar producción hasta que el preview muestre Auth OK, fuente Firestore, tenant TyA y conteos TyA reales.

Impacto:

- No se modificó `/app/modules`.
- No se modificó `/app/index.html`.
- No se activó backend global.
- No se hizo deploy de Hosting.
- No se tocó producción.
- No se subieron credenciales ni claves.

Pendiente/riesgo:

- Siguiente gate técnico: corregir/verificar diagnóstico del preview backend para distinguir claramente Firestore real vs localStorage/demo.
- Resolver Auth DEV sin pedir claves a Paula y sin pegar contraseñas en ChatGPT.
- No publicar como producción operativa hasta cumplir el gate mínimo documentado.

## 2026-06-30 - Preparacion release candidate desde prototipo bueno

- Se separo la rama backend de la base visual del prototipo.
- La release candidate se preparo desde `origin/main`, que contiene el prototipo CXOrbia V56 descomprimido.
- El backend validado se integrara solo como archivos seguros y controlados.
- No se hizo deploy.
- No se publico Hosting.
- No se toco produccion.
- No se reemplazo `/app/modules`.
- Siguiente gate: validacion visual RC desde `app/index.html`.

## 2026-06-27 — Infraestructura Firebase DEV

- `.firebaserc`: alias DEV para `cxorbia-backend-dev`.
- `firebase.json`: Hosting DEV con `public: app`, rewrite SPA y headers UTF-8.
- `firestore.indexes.json`: índices iniciales vacíos.
- `storage.rules`: Storage cerrado mientras esté pendiente Blaze.

Estado: sin deploy de Hosting, sin producción y sin datos reales.

## 2026-06-27 — Reglas Firestore

- `firestore.rules`: reglas multi-tenant por `tenantId`, `projectId` y rol.
- `MATRIZ-ROLES-FIRESTORE.md`: matriz de permisos y claims esperados.
