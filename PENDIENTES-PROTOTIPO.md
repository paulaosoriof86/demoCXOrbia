# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum conflict review queue + import readiness - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs` y documentos `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Claude debe convertir esto en UX visible, sin tocar backend: bandeja de conflictos y readiness de importacion por area.
- Bandeja de conflictos: mostrar conflicto, entidad afectada, severidad `info/warning/blocker`, sourceRefs opacas, estado `abierto/en revision/resuelto/rechazado/archivado`, auditRef y razon obligatoria para resolver/rechazar.
- Readiness por area: proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.
- Si hay `blocker`, la UI debe bloquear import/activacion y mostrar revision humana requerida.
- Copy honesto: `ready_preview` no significa importado; `resolved` preview no significa aplicado real; sourceRef opaca no significa que la fuente real este conectada.
- No deduplicar por nombre, sucursal o coincidencia visual. Si falta llave estable suficiente, mostrar revision humana.
- No mostrar datos sensibles crudos: DPI, banco, NDA firmado, tokens, webhooks, adjuntos, cuerpos crudos, telefonos/correos crudos.
- Academia debe tener manuales/cursos por rol sobre export limpio, preview, import real, cola de conflictos, blockers, llaves estables, dedupe prohibido y revision humana.

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
