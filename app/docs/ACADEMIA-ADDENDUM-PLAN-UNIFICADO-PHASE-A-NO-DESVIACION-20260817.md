# ACADEMIA — ADDENDUM PLAN UNIFICADO PHASE A · NO DESVIACIÓN

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 14:10 -06:00  
**Estado:** `ALIGNED__I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_NEXT`

## Regla

Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. Cada cambio funcional PASS revisa manual, curso/lección, checklist, errores frecuentes, glosario, ruta por rol, notificaciones y publicación con revisión humana.

## Patrón I3.2B

El runtime exacto mostró 15 periodos/660 visitas correctos y sesión/membership válidas, pero el rail no montó el selector de Periodo. La causa fue una ventana de lifecycle entre reconstrucción Auth de sesión, `CX.app.enter()`, `router.mount()` y república de membership verificada.

Criterio reusable: el primer render debe usar scope ya verificado; un fallback transitorio solo es válido si tenant, namespace, role y projectIds coinciden exactamente con la membership provider-backed ya verificada. Nunca raw `scopeProjectId`, fuzzy identity ni hardcode UI.

Legal estaba loaded/provider-backed/not pending y no fue la causa del blocker actual. La aceptación sigue humana; receipt durable completo queda I3.7.

## I4.10

Sigue obligatorio revisar contenidos para documentos/instructivos, certificación histórica, disponibles/postulaciones, asignación/agenda/reprogramación/cancelación, realizada/cuestionario/submit, HR/plataforma, Finance, multi-proyecto/configuración, evidencias, roles y soporte/notificaciones.

## Progreso

Formal 35%/65%. I3.2B causa exacta y fix source PASS; runtime post-fix I3.2C pendiente.

## Fuentes

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`.
Complemento: `ACADEMIA-ADDENDUM-I3-2B-NO-PERIODS-LIFECYCLE-20260817.md`.

Clasificación: Reusable CXOrbia = sí; Exclusivo cliente = TyA/Cinépolis; Claude/prototipo = no UI/core changes; Academia = actualizado; Sin impacto Claude = no, debe preservar el criterio de lifecycle.
