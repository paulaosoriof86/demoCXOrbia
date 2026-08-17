# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 13:24 -06:00  
**Estado:** `UNIFIED_PHASE_A_PLAN__SAME_CANDIDATE__ADMIN_PASS_FROZEN__HISTORICAL_SHOPPER_PASS_FROZEN__AUTHORITY_COMPOSITION_SOURCE_PASS__I3_RUNTIME_VALIDATION_NEXT`

## Lock de continuidad

No nueva candidata/rama/PR. No reconstruir Auth, Shoppers, Finanzas, HR, KPI ni módulos ya resueltos. No tocar `app/modules` ni `app/core` por el bloque actual.

Para secuencia/estado/siguiente acción leer primero:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Ese documento no crea un plan nuevo: mapea Cortes 0B→8 + S1→S6 + I1→I5 y hace explícitos los subgates I3/I4/I5.

## No tocar / no reprocesar

- Historical Shopper run `31906391682`: PASS congelado; reset único consumido; `passwordResets=0`; no volver a cargar/reconciliar credencial histórica.
- TARGET_B Admin: password sign-in real PASS `32049054855`; Paula ingresó. No crear/rotar/reemplazar Admin.
- request08: consumido/no rerun.
- I1/I2: PASS.
- HR: 15 periodos / 660 visitas hasta AGO; no reimportar.
- Finance V2 + source-safe/historical payments: no reconstruir.
- exact identity contract: no nombre/email/teléfono/WhatsApp/username como matching.

## Candidata canónica preservada

El entry vivo conserva cumulative read model V2, canonical Shopper portal V2, protected HR authority V2, state semantics V2, Finance V2 y financial source-safe adapter. El defecto actual es composición/compatibilidad de autoridades, no pérdida de módulos.

## Root cause source-only

1. membership `projectIds=['cinepolis']` expresa proyecto raíz/programa, mientras helpers heredados lo comparaban contra IDs de periodo;
2. `tya-live-source-inplace-apply.js` generaba `hr-post-*` desde asignaciones HR y los trataba como postulaciones.

Delta aplicado:

- `app/adapters/tya-phase-a-authority-compat-v1.js`;
- wiring en `app/index-backend-dev.html` antes de protected HR composition.

Source lock:
`SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## Seis bloques S1→S6

No son un plan paralelo:

- S1 canonical runtime → I1/I2 + runtime regression I3;
- S2 persistencia detrás de `CX.data` → I2 + E2E operacional I4;
- S3 Shopper/Auth administrativo → I3;
- S4 HR bidireccional → I4;
- S5 Finanzas → I4;
- S6 same-build E2E → cierre I4 + I5.

No omitirlos ni convertirlos en una nueva metodología.

## I3 — pendientes completos

- I3.2 runtime validation + exact DEV deploy bajo gate;
- I3.3 proyecto/15 periodos/AGO/660;
- I3.4 postulación persistida separada de assignment HR;
- I3.5 crosswalk exacto agosto/reviewQueue;
- I3.6 Mi Perfil + histórico Shopper;
- I3.7 legal receipt durable readback después de interacción humana;
- I3.8 Admin create/update de **un Shopper nuevo** por provider ACK;
- I3.9 Shopper nuevo login/reload/new-tab/segundo contexto;
- I3.10 KPI derivados/state semantics;
- I3.11 cierre integral same-build.

**Importante:** el PASS del Admin existente y el PASS del Shopper histórico NO sustituyen I3.8/I3.9.

## I4 — cobertura funcional completa que Claude no debe perder

- documentos/instructivos;
- certificación configurable e histórico preservado;
- disponibles/postulación;
- asignación;
- agenda/reprogramación/cancelación;
- realizada/cuestionario/submit/revisión;
- HR bidireccional/Make gated;
- Finanzas/liquidaciones/pagos;
- multi-proyecto/configuración;
- roles/scopes Admin/Ops/Shopper histórico/Shopper nuevo/Cliente;
- evidencias/Storage según flujo;
- Academia/manuales/rutas/notificaciones;
- Gemini gated según necesidad y revisión humana;
- E2E integral del MISMO build.

No rediseñar módulos para “hacer pasar” estos gates. Cualquier P0 UI futuro debe ser reproducible y corregirse focalmente por archivo.

## Legal

Paula ya realizó la aceptación humana V0.4. Falta provider readback durable/reload-new-tab. Doble presentación = P1 mientras no impida sesión/rutas. No automatizar consentimiento.

## UI / Claude

- No reemplazar Dashboard/Shoppers/Postulaciones/Finanzas/selectores por versiones anteriores.
- No presentar asignación HR como postulación.
- No ocultar estados fail-closed.
- No prometer Make/Gemini/Storage live cuando no estén gated/activos.
- Academia debe actualizarse cuando cambie un flujo real.

## Siguiente frontera exacta

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.

Después continuar I3.3→I3.11, luego I4.1→I4.12 y finalmente I5.1→I5.8 del addendum unificado.

## Clasificación

- Reusable CXOrbia: crosswalk de planes, S1→S6, same-build E2E, scope root-project/period.
- Exclusivo cliente: TyA/Cinépolis, 15/660/44 y fuentes financieras vigentes.
- Claude/prototipo: preservar módulos y delta; P0 solo focal.
- Academia: I4.10 obligatorio.
- Sin impacto Claude: documentación/gates internos, salvo no revertir decisiones.