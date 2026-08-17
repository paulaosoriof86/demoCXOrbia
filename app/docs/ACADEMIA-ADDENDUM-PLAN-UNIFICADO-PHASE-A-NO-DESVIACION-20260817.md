# ACADEMIA — ADDENDUM PLAN UNIFICADO PHASE A · NO DESVIACIÓN

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 14:25 -06:00  
**Estado:** `ALIGNED__I3_2_PASS__I3_3_PASS__I3_4_NEXT`

## Regla

Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. Cada cambio funcional PASS revisa manual, curso/lección, checklist, errores frecuentes, glosario, ruta por rol, notificaciones y publicación con revisión humana.

## I3.2C runtime PASS

El exact same-build DEV confirmó que el patrón lifecycle-safe resuelve la regresión sin UI patch:

- Auth/membership Staff válidos;
- 15 periodos y 660 visitas;
- project selector + period selector presentes;
- August 2026 activo;
- router/shell montado;
- legal loaded/provider-backed/pending=false;
- tres reloads y new-tab estables.

Criterio reusable: un render canónico debe usar scope provider-backed ya verificado incluso durante transiciones de sesión, con coincidencia exacta tenant/namespace/role/projectIds. No raw scopeProjectId, no fuzzy identity, no hardcode UI.

## I4.10

Sigue obligatorio revisar contenidos para documentos/instructivos, certificación histórica, disponibles/postulaciones, asignación/agenda/reprogramación/cancelación, realizada/cuestionario/submit, HR/plataforma, Finance, multi-proyecto/configuración, evidencias, roles y soporte/notificaciones.

## Progreso

Formal 35%/65%. I3.1/I3.2/I3.3 PASS/frozen; I3.4 next. I3 integral →60%.

## Fuentes

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2C-EXACT-DEV-RUNTIME-PASS-20260817.md`.
Build-lock: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

Clasificación: Reusable CXOrbia = sí; Exclusivo cliente = TyA/Cinépolis; Claude/prototipo = no UI/core changes; Academia = actualizado; Sin impacto Claude = no, preservar lifecycle readiness.
