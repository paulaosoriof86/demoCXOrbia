# CAMBIOS-BACKEND.md

## 2026-07-03 - HR Source private full flow TyA

- Se agrego `tools/hr-source/tya-hr-source-private-full-flow.mjs`.
- Se agrego `tools/hr-source/run-tya-hr-source-private-full-flow.ps1`.
- Se agrego `app/docs/HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md`.
- Objetivo: validar lectura HR privada multi-tab/historico con `sourceRef` opaco, sin pegar URL en ChatGPT y sin subir crudos al repo.
- El flujo registra URL solo localmente, ejecuta `test`, `preview` y `sync-request`, reporta tabs/periodos, filas por pais/periodo e issues.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0, produccion 0, `canImport=false`.

## 2026-07-03 - Estado de uso de fuentes reales TyA

- Se agrego `app/docs/ESTADO-USO-FUENTES-BASE-REAL-TYA-20260703.md`.
- El documento aclara que HR/RTDB y logicas utiles ya fueron analizadas, mapeadas y convertidas en plan/preview/contrato seguro.
- La base real todavia NO fue importada a Firestore ni convertida en datos operativos finales.
- Siguen pendientes de calidad, privacidad, deduplicacion, destinatarios, cruce financiero, reglas, runner, rollback y autorizacion.
- Estado operativo: Firestore writes 0, imports executed 0, deploy 0, produccion 0.

## 2026-07-03 - Auditoria y preparacion empalme RC V75 Cloud frontend

- Se agrego `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md`.
- Se agrego `app/docs/EMPALME-RC-V75-BACKEND-20260703.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ACUMULADO-RC-V75-20260703.md`.
- La auditoria confirma que V75 cambia 3 archivos frente a V74: `app/modules/automatizaciones.js`, `app/modules/finanzas.js` y `app/modules/hr-source.js`.
- Avances V75: estados honestos para Make/IA, Finanzas sin `En vivo` en movimientos/liquidaciones y flujo visible de `sourceRef` opaco en HR Source.
- Pendientes vigentes: versionado V72 residual, SaaS profundo, propuestas comerciales tipo wizard, CRM Reuniones y limpieza de rutas duplicadas.
- Estado operativo: sin importacion, sin despliegue y sin cambios productivos.

## 2026-07-03 - Auditoria RC V74 Cloud frontend

- Se agrego `app/docs/AUDITORIA-RC-V74-CLOUD-FRONTEND-20260703.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V74-20260703.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-RC-V74-20260703.md`.
- La auditoria trato `Prototype development request CXOrbia V74.zip` como release candidate incremental.
- No se reemplazo la rama, no se aplico el ZIP completo y no se tocaron archivos de integracion backend.
- Hallazgos principales: HR Source mejora seguridad, SaaS/propuestas avanzan parcialmente, falta versionado V74 y faltan estados honestos en Finanzas/Make/IA.
- Estado operativo: sin importacion, sin despliegue y sin cambios productivos.

## 2026-07-03 - Matriz pendientes bloqueantes DEV TyA

- Se agrego app/docs/MATRIZ-PENDIENTES-BLOQUEANTES-DEV-IMPORT-TYA-20260703.md.
- La matriz identifica que falta antes de una futura escritura DEV autorizada.
- Incluye bloqueantes de datos, validacion, reglas, rollback y autorizacion.
- Incluye pendientes frontend para Claude sobre HR Source, estados honestos, contrato informativo, gates y liquidaciones candidatas.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0.

## 2026-07-03 - Indice maestro TyA HR Source

- Se agrego app/docs/INDICE-MAESTRO-TYA-HR-SOURCE-20260703.md.
- El indice centraliza documentos principales, documentos vivos, scripts clave y archivos backend core del tramo TyA / HR Source.
- Se dejo una version compacta y segura del indice maestro.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0.
