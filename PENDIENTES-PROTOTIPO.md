# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum admin configurability contract - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-admin-configurability-contract.mjs` y documentos `app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`.
- Claude debe convertir la administrabilidad en UX visible, sin tocar backend: configuraciones por tenant/proyecto, reglas, HR/origen, cuestionarios, documentos, NDAs, planes, evidencias, certificaciones, Academia, notificaciones, postulaciones, shoppers, visitas, reservas, asignaciones, reprogramaciones, cancelaciones, liquidaciones, pagos, integraciones, Make/Gemini, imports, reportes, roles/permisos y gates.
- NDA: crear/mostrar ficha de plantilla/version/vigencia/estado/creador/aprobador/auditRef/gate/reaceptacion. No modificar silenciosamente una aceptacion ya presentada o firmada.
- NDA: mostrar estados honestos `pendiente`, `aceptado`, `version vencida`, `requiere nueva aceptacion`, `bloqueado por gate`.
- Planes: crear/mostrar ficha de plan por tipo (`operativo`, `proyecto`, `certificacion`, `pagos`, `evidencias`, `automatizaciones`, `Academia`), version, vigencia, estado, roles autorizados, historial y auditRef.
- Planes: mostrar estados `borrador`, `en revision`, `aprobado`, `activo`, `pausado`, `reemplazado`, `archivado`.
- Configuraciones criticas deben pedir razon y mostrar gate/revision humana antes de activar o reemplazar versiones.
- Make/Gemini/import/pagos/notificaciones deben mostrarse como preparados, pendientes de gate o no ejecutados mientras no exista backend/proveedor real activo.
- Academia debe tener manuales/cursos por rol sobre administrabilidad, NDA, planes, gates, revision humana, auditRef y diferencia entre preview/preparado/proveedor configurado vs ejecutado/proveedor activo.

## Addendum V89 - auditoria Claude candidate

- V89 fue auditada como correctiva sobre V88. Mejora V88, pero NO queda como source lock final, NO production ready y NO backlog 100% cerrado.
- Ver auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V89-CLAUDE-20260706.md`.
- Resuelto en V89: Academia ya no tiene IDs duplicados en los dos cursos nuevos; se usan `a_backend_prepared` y `a_ops_conflicts_route`.
- Resuelto en V89: `app/core/automations.js` ya muestra HR writeback como escritura preparada/sync backend pendiente.
- Resuelto en V89: `app/modules/postulaciones.js` corrige dos textos de reprogramacion a notificacion preparada/pendiente confirmacion.
- Pendiente P0 V89: `postulaciones.js` conserva `Aprobada · WhatsApp enviado al shopper`, `Aprobada · WhatsApp enviado` y `Asignacion actualizada · HR sincronizada`.
- Pendiente P0 V89: `dashboard.js` conserva `Correo enviado a ... (Make/Outlook)` y `WhatsApp enviado (Make)`.
- Pendiente P0 V89: `automatizaciones.js` conserva `Registro de disparos (Make)`, `ultimos eventos enviados` y `Payload de prueba enviado al escenario Make`.
- Pendiente P0 V89: `cuestionario-shopper.js` conserva `marca la visita como cuestionario enviado`.
- Pendiente P0/P1 V89: `manuales-data.js`, `reservas.js`, `correo.js`, `topbar.js`, `finanzas.js`, `importador.js`, `operacion-extra.js` y `academia.js` conservan residuos de enviado/notificado/sincronizado/en vivo que deben pasar a estados honestos cuando no exista proveedor/gate real.
- Claude debe entregar una candidata ultra-corta corrigiendo solo residuos de textos honestos y coherencia Academia/manuales, sin redisenar ni tocar backend.

## Addendum V88 - auditoria Claude candidate

- V88 fue auditada como candidata correctiva P0/P1/P2, pero NO quedo como source lock final ni backlog 100% cerrado.
- Ver auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V88-CLAUDE-20260706.md`.
- V88 resolvio parcialmente textos honestos en `app/core/automations.js` y algunos textos de `app/modules/postulaciones.js`.
- V88 agrego el curso `Capacidades de backend: que esta preparado`, pero con ID duplicado `a_backend`.
- V88 agrego la ruta `Equipo operativo: asignacion, conflictos y fuera de rango`, pero con ID duplicado `a_ops`.
- Pendiente V88 para Claude: generar V89 ultra-corta con IDs unicos y correcciones puntuales de textos honestos, sin tocar backend ni integraciones reales.

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
- Avances utiles de V80: agrega `app/modules/revision-admin.js`, carga el modulo en `app/index.html`, agrega boton de revision en `app/modules/dashboard.js`, mejora textos de automatizaciones, conserva `nvBanner` y sube SaaS Console V79.
