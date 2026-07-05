# RESUMEN PARA CLAUDE / BACKEND — estado V82 (Phase A)

Fecha: 2026-07-04. Prototipo frontend; backend protegido intacto.

## Qué quedó listo en V82 (para conmutar a backend)
- **Enum de cuestionario canónico:** `interna` / `externo_general` / `externo_visita`. `qMode()` normaliza legacy. Cada proyecto guarda `cuestionario.visitLinkField='questionnaireLink'`.
- **Link por visita:** el shopper lo lee de `questionnaireLink|cuestionarioUrl|linkCuestionario|urlCuestionario|hrQuestionnaireLink`. El backend debe poblar `questionnaireLink` por fila de HR.
- **Revisión admin (CX.revisionStore):** estados canónicos `pending_review|in_review|needs_correction|approved_for_submitido|submitido_registered|rejected|hr_conflict|cancelled`. Estructura por visita: `{tenantId,projectId,reviewId,visitId,assignmentId,shopperId,source,estado,createdAt,updatedAt,auditTrail[]}`. Usa `CX.data.revisiones` si el backend lo expone; si no, localStorage.
- **Config Phase A por proyecto:** `hrFuente{origen,etiqueta}`, `revision{consultora,cliente}`, `submitido{quien,rol}`, `contactos{evidencias,soporte,coordinacion}`.

## Contratos que el backend debe respetar
- **Submitido HR-driven:** la UI NO marca `submitido_registered` como real sin nota/referencia HR. El backend confirma el submitido desde HR y devuelve el estado.
- **Liquidación:** permanece "candidata · pendiente cruce" hasta que el backend cruce con el Excel financiero.
- **HR sync:** la UI dice "se reflejará cuando el sync esté activo (pendiente backend)". El backend hace la escritura real; la UI solo emite `hr-source:*` events.

## Pendiente (no bloqueante)
- Cablear `CX.data.revisiones` cuando exista el backend (hoy fallback localStorage).
- Poblar `questionnaireLink` desde HR en el import real.

## No tocar
`tools/migration`, `app/contracts`, reglas Firestore, Auth/Make/Gemini/WhatsApp/Storage reales, deploy, datos reales.
