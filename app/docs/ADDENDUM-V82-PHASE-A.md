# Addendum V82 — Phase A (enum canónico, revisión backend-ready, textos honestos)

Fecha: 2026-07-04 · Base: repo actual (no ZIP en bruto). Conserva fixes previos.

## Archivos tocados

### `app/modules/proyecto-wizard.js`
- **Motivo:** enum canónico + defaults Phase A.
- **Cambios:** `qMode()` normaliza `externa→externo_general`, `link→externo_visita`. Select usa `interna`/`externo_general`/`externo_visita`. `cuestionario` guarda `visitLinkField:'questionnaireLink'`. Defaults restaurados en el estado y en el objeto proyecto: `hrFuente{origen,etiqueta}`, `revision{consultora,cliente}`, `submitido{quien,rol}`, `contactos{evidencias,soporte,coordinacion}`. URL general oculta cuando `qMode==='externo_visita'` (render + onchange).
- **Riesgo:** bajo. No vuelve a `externa`/`link` guardados.
- **Validación:** crear proyecto con modo por-visita → no pide URL general; guardado trae revision/submitido/contactos.

### `app/modules/cuestionario-shopper.js`
- **Motivo:** unificar enum + honestidad de texto.
- **Cambios:** link por visita busca en `questionnaireLink|cuestionarioUrl|linkCuestionario|urlCuestionario|hrQuestionnaireLink`. Textos "cuestionario enviado" → "cuestionario realizado/completado". Externo sin link → aviso, no cae al formulario interno.
- **Riesgo:** bajo.
- **Validación:** interno abre formulario; externo general abre URL general; por-visita abre link de HR; sin link muestra aviso.

### `app/modules/revision-admin.js`
- **Motivo:** estructura backend-ready + submitido honesto.
- **Cambios:** estados canónicos EN (`pending_review`,`in_review`,`needs_correction`,`approved_for_submitido`,`submitido_registered`,`rejected`,`hr_conflict`,`cancelled`), labels ES. Store escribe `tenantId,projectId,reviewId,visitId,assignmentId,shopperId,source,createdAt,updatedAt,auditTrail`. Usa `CX.data.revisiones` si existe; fallback localStorage. HR-driven: `submitido_registered` libre bloqueado (exige nota/ref HR) o queda `approved_for_submitido`/pendiente. No promete liquidación real sin backend.
- **Riesgo:** bajo. Prototipo sigue en localStorage; listo para conmutar a CX.data.
- **Validación:** en proyecto HR-driven, intentar submitido sin nota → advertencia; con nota → "admin-confirmado (basado en HR) · pendiente HR/backend".

### `app/modules/misvisitas.js` + `app/modules/postulaciones.js`
- **Motivo:** honestidad de HR sync.
- **Cambios:** quitado "plantilla lista (plantilla lista)" → "plantilla lista". "HR sincronizada" → "se reflejará en HR cuando el sync esté activo (pendiente backend)".
- **Riesgo:** ninguno (solo copy).

## No tocado
`tools/migration`, `app/contracts`, reglas Firestore, Auth/Make/Gemini/WhatsApp/Storage reales, deploy, producción, datos reales.

## Validación global
`index.html` carga sin errores de consola; sin módulos huérfanos nuevos; nvBanner conservado; tenants en V79+.
