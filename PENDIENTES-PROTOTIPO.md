# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum Liquidaciones/Cinepolis source-safe preview validator

- Backend agrego contrato y validador source-safe para liquidaciones/corte junio y Cinepolis Boleto/Combo.
- Ver documentos: `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`, `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md` y `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Mis beneficios debe mostrar honorario, Boleto, Combo, reembolso total, total y estado, sin banco/DPI/NDA/notas internas.
- Admin/Liquidaciones debe tratar junio como pagos/liquidaciones pendientes, no visitas pendientes; separar realizada, cuestionario, revision, submitido, liquidacion y pago.
- Lotes de pago deben ser seleccionables por admin y no incluir automaticamente todos los elegibles.
- Movimientos debe mostrar cada pago individual aunque venga de lote, con lote/item asociado.
- Si falta llave estable o referencia de pago, la UI debe mostrar revision manual/conflicto, no auto-dedupe ni pagado.
- Textos honestos: no prometer pago real, HR sync real, correo real, Make real ni automatizaciones reales mientras los gates esten apagados.
- Academia debe profundizar Mis beneficios, corte junio, Boleto/Combo, lotes, movimientos, source-safe preview, datos sensibles y revision manual.

## Addendum V82 - auditoria Claude candidate

- V82 fue auditado como candidato nuevo de Claude. Mejora V81 y esta muy cerca de empalme, pero aun no queda como source lock.
- Ver auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`.
- Resuelto en V82: wizard conserva enum canonico, `qMode()`, `visitLinkField:'questionnaireLink'`, defaults Phase A (`hrFuente`, `revision`, `submitido`, `contactos`) y oculta URL para `externo_visita`.
- Resuelto en V82: cuestionario busca los 5 campos de link y no cae a interno si falta link.
- Resuelto en V82: revision admin usa estados canonicos, fallback `CX.data.revisiones`/`localStorage`, estructura backend-ready parcial y bloqueo de `submitido_registered` sin nota en HR-driven.
- Resuelto en V82: `plantilla lista (plantilla lista)` no aparece.
- Pendiente puntual V82: `cuestionario-shopper.js` aun conserva el texto externo `marca la visita como cuestionario enviado`; cambiar a cuestionario realizado/completado.
- Pendiente puntual V82: `revision-admin.js` muestra `Cuestionario: enviado`; cambiar a realizado/completado, agregar `status=estado`, pasar `projectId:p.id` y `hrRowId` cuando exista.
- Pendiente puntual V82: `misvisitas.js` aun dice que sincroniza estado/hoja de ruta; cambiar a pendiente backend/preparado.
- Pendiente puntual V82: `postulaciones.js` aun tiene dos toasts `HR sincronizada`; cambiar a `se reflejara en HR cuando el sync este activo (pendiente backend)`.
- Documentacion V82 existe dentro de `app/docs`; mantener tambien actualizados los documentos raiz del PR.

## Addendum V81 - auditoria Claude candidate corregido

- V81 fue auditado como candidato nuevo de Claude. Claude lo llama internamente V80 corregido; la diferencia de numeracion no es incoherencia porque Paula versiona internamente cada entrega.
- Ver auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V81-CLAUDE-20260704.md`.
- V81 mejora V80 y corrige parcialmente los 5 puntos: `proyecto-wizard.js` usa valores canonicos, `cuestionario-shopper.js` busca los 5 campos de link, `revision-admin.js` usa estados canonicos y fallback `CX.data.revisiones`, `misvisitas.js` corrige el duplicado, y la sintaxis JS valida.
- No empalmar V81 completo todavia: quedan ajustes puntuales antes de source lock.
- P0/P1 pendiente: `proyecto-wizard.js` no conserva todos los defaults Phase A ya aplicados en repo (`hrFuente`, `revision`, `submitido`, `contactos`) y muestra URL general para `externo_visita`.
- P0/P1 pendiente: `cuestionario-shopper.js` todavia tiene textos `cuestionario enviado`; deben quedar como `cuestionario realizado` o `cuestionario completado`.
- P0/P1 pendiente: `revision-admin.js` usa estados canonicos, pero debe guardar estructura compatible con contrato (`tenantId`, `projectId`, `reviewId`, `visitId`, `assignmentId`, `shopperId`, `source`, `createdAt`, `updatedAt`, `auditTrail`) y bloquear/exigir nota HR para `submitido_registered` si el proyecto es HR-driven.
- P0/P1 pendiente: `misvisitas.js` aun dice que sincroniza la hoja de ruta; debe decir pendiente backend/preparado.
- V81 no trae documentacion interna del prototipo; Claude debe actualizar `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y addendum en `app/docs` cuando entregue la siguiente correccion.

## Addendum V80 - auditoria Claude candidate

- V80 fue auditado como candidato nuevo de Claude, pero no queda empalmado ni aprobado como baseline.
- Ver auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V80-CLAUDE-20260704.md`.
- Avances utiles de V80: agrega `app/modules/revision-admin.js`, carga el modulo en `app/index.html`, agrega boton de revision en `app/modules/dashboard.js`, mejora textos de automatizaciones, conserva `nvBanner` y sube SaaS Console a V79.
- No empalmar V80 completo todavia: debe corregirse antes con Claude.
- P0 de no regresion: `app/modules/proyecto-wizard.js` debe partir del archivo actual del repo, no del ZIP V80, porque V80 vuelve a usar valores legacy `externa` y `link` en el selector/guardado.
- P0 de no regresion: `app/modules/cuestionario-shopper.js` debe conservar busqueda de links en `questionnaireLink`, `cuestionarioUrl`, `linkCuestionario`, `urlCuestionario`, `hrQuestionnaireLink`; V80 no trae todos.
- P0 de texto/flujo: usar `cuestionario realizado`, no `cuestionario enviado`, para no confundir con submitido.
- Revision admin V80 debe corregirse: puede conservar labels visibles en espanol, pero debe mapear internamente a estados canonicos `pending_review`, `in_review`, `needs_correction`, `approved_for_submitido`, `submitido_registered`, `rejected`, `hr_conflict`, `cancelled`.
- Revision admin V80 no debe quedar aislada en `localStorage` como solucion final; debe quedar preparada para `CX.data`/backend y no prometer writes reales.
- Reaparece `plantilla lista (plantilla lista)` en `app/modules/misvisitas.js`; Claude debe volver a `plantilla lista`.
- Siguen textos de integracion real en modulos como Dashboard, Visitas, Postulaciones, Marketing y Soporte; Claude debe convertirlos a estados honestos si toca esos archivos.
- V80 no actualizo documentacion interna del prototipo; Claude debe documentar archivos tocados, motivo, impacto, riesgo y validacion.

## Addendum V79 - revision admin, submitido, wizard y prototipo comercializable

- V79 sigue como candidata viva de trabajo segun source lock vigente.
- Pendiente visual/funcional para Claude: separar claramente en UI los pasos `cuestionario realizado`, `revision admin`, `submitido` y `liquidacion`.
- No tratar `cuestionario realizado` como sinonimo de `submitido`.
- La revision admin debe mostrar estados equivalentes a: pendiente de revision, en revision, requiere correccion, aprobada para submitido, submitido registrado, rechazada, conflicto HR y cancelada.
- El origen de submitido debe ser configurable por proyecto: HR, plataforma, sistema externo o confirmacion manual admin basada en HR.
- Para TyA/Cinepolis el origen default documentado es HR-driven, pero el prototipo comercializable no debe hard-codear TyA ni Cinepolis.
- El wizard de proyecto debe exponer configuracion Phase A completa: identidad, pais/moneda, HR, cuestionario, revision, submitido, certificacion, documentos/evidencias, agenda, pagos/liquidaciones e integraciones apagadas/preparadas.
- Si Make/HR sync sigue apagado, la UI no debe mostrarlo como ejecutado; debe mostrar pendiente, preparado, bloqueado o requiere autorizacion.
- Esta mejora aplica al prototipo comercializable, no solo a TyA/Cinepolis. Los textos pueden cambiar por tenant/proyecto, pero el flujo debe mantenerse configurable y multi-proyecto.
- Referencias backend/documentales: `app/docs/ADMIN-REVIEW-FUNCTIONAL-CONTRACT-PHASE-A-TYA-20260704.md`, `app/docs/SUBMITIDO-HR-DRIVEN-CONFIGURABLE-PHASE-A-TYA-20260704.md` y `app/docs/WIZARD-PHASE-A-COMPLETE-CONTRACT-TYA-20260704.md`.

## Addendum V77 - paquete forense Claude

- Usar el paquete `PAQUETE_CLAUDE_CXORBIA_V77_AUDITORIA_FORENSE_20260704.zip` como fuente de pendientes frontend mas reciente.
- La numeracion V77 es consecutiva del registro de Paula y no debe tratarse como error por si sola.
- Claude debe corregir los pendientes visuales/UX/documentales del prototipo sin tocar backend.
- Mantener separados los avances backend de readiness V5, autorizacion DEV controlada, runner disabled, reglas, rollback y contrato de datos.
- No modificar `tools/migration` ni convertir runners backend en flujos activos.

## Addendum RC V75 - base visual actual

Ver documentos especificos:

- `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md`
- `app/docs/EMPALME-RC-V75-BACKEND-20260703.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ACUMULADO-RC-V75-20260703.md`

Resumen vigente RC V75:

- V75 resuelve los avisos visuales de Make/IA como pendientes backend/server-side.
- V75 corrige Finanzas para no mostrar `En vivo` en movimientos/liquidaciones.
- V75 agrega flujo visible para `sourceRef` opaco en HR Source.
- Sigue pendiente versionado coherente porque el ZIP aun arrastra referencias a V72.
- Sigue pendiente profundizar SaaS multi-tenant, releases, feature flags, permisos, targeting y rollback.
- Sigue pendiente convertir propuestas comerciales en wizard completo.
- Sigue pendiente CRM Reuniones como backend/calendario real.
- Sigue pendiente limpiar o mantener fuera de carga `app/modules/rutas.js` para evitar duplicidad.

## Addendum RC V74 - Cloud frontend

Ver documento especifico:

- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V74-20260703.md`

Resumen vigente RC V74:

- Conservar HR Source V74: `canImport=false`, sin derivar `sourceRef` desde URL, gates visuales y contrato DEV informativo.
- Corregir versionado interno: el ZIP se recibio como V74, pero docs y releases visibles aun dicen V72.
- Corregir estados honestos en Finanzas: no usar `En vivo` si no hay backend/cruce real.
- Corregir Make/automatizaciones: no aparentar POST real; sigue pendiente backend por tenant.
- Corregir IA: para produccion debe ser server-side, no API key en localStorage.
- Profundizar SaaS: tenants, planes, proyectos, permisos, feature flags, targeting, confirmacion y rollback.
- Profundizar propuestas: wizard comercial, plantillas requeridas, estados completos y conversion a proyecto.
- Mantener el ZIP como RC incremental; no reemplazar backend ni documentacion del PR #7.

## Mejoras desde backend para implementar en Claude

Ver documento especifico:

- `app/docs/MEJORAS-PARA-CLAUDE-DESDE-BACKEND-20260703.md`

## Addendum V70 - HR Source

- Mantener el modulo HR Source visual aprobado.
- No volver a guardar enlaces completos de HR en almacenamiento del navegador.
- En produccion, la referencia de fuente debe ser opaca y entregada por backend.
- La UI debe poder mostrar conteos/tabs devueltos por backend sin asumir que todo viene de datos demo o staging local.
- El flujo de sincronizacion debe mantenerse como solicitud bloqueada hasta autorizacion backend; no mostrarlo como importacion ejecutada.
- Mostrar estados honestos de contrato/preview/importacion: bloqueado, warning, pendiente backend o preview; nunca importado si `canImport=false`.

## Vigente desde V64

La lista vigente actualizada esta en:

- `PENDIENTES-PROTOTIPO-V64.md`
- `AUDITORIA-PROTOTIPO-V64.md`

## Control de desactualizacion

La auditoria V64 encontro que muchos pendientes acumulados en documentos V62/V63 ya fueron declarados resueltos por la nueva version del prototipo. Por lo tanto:

- No se deben reprocesar como pendientes abiertos los items que V64 marca como resueltos.
- Si un item resuelto por V64 falla en validacion visual posterior, se documentara como regresion nueva.
- El backlog vivo debe partir de V64, no de V62 ni de versiones anteriores.

## Pendientes vigentes principales

1. Versionado visual coherente V75 o superior.
2. Submodulo Periodos completo: crear, cerrar, archivar, duplicar y comparar periodos.
3. Vista de Historico consultable sin mezclarse con operacion activa.
4. Deteccion de periodo en importador HR con panel de confirmacion.
5. Centro de Actualizaciones/Novedades SaaS multi-tenant.
6. Sincronia de filtros proyecto/periodo/pais entre todos los modulos.
7. Estados honestos para correo, automatizaciones, integraciones e IA.
8. Fichas ampliadas de periodo, visita y sucursal.
9. Profundidad adicional en Academia, Finanzas y Portal Cliente.
10. SaaS Console con permisos, releases, feature flags, targeting, confirmacion y rollback.
11. Wizard de propuestas comerciales completo.
12. Revision admin visible/funcional separada de submitido y liquidacion.
13. Submitido configurable por proyecto y separado de cuestionario realizado.
14. Wizard de proyecto con configuracion Phase A completa y gates honestos.
15. Correcciones V82 antes de source lock: textos cuestionario realizado, HR sync honesta en Mis Visitas/Postulaciones y ajuste fino de revision admin para `status`, `projectId` y `hrRowId`.
16. Liquidaciones/Cinepolis: Mis beneficios, lote seleccionable, movimientos individuales, estados de revision manual/conflicto y Boleto/Combo separados de honorario.

## Separacion corregida

Los pendientes de backend/integracion permanecen separados. ChatGPT/backend continua con Sprint 3 sobre Firestore DEV, acciones operativas controladas y `responsibilityLog` sin tocar `app/modules` para resolver backend.

Claude debe trabajar sobre el prototipo mas reciente empalmado por Paula/ChatGPT, sin usar versiones viejas y sin revertir avances backend/frontend ya documentados.
