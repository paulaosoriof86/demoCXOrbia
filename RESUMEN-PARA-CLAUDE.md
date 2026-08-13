# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 17:59 -06:00  
**Estado:** `C6_RUNTIME_10_STOP_RETRY_MEMBERSHIP_RECONCILE_BLOCKED__PHASE_A_88__NO_MODULE_UI_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real. Runtime 10 probó nuevamente la ruta canónica hasta Firebase Auth/contexto Staff y autoridad HR viva, pero la verificación final de membership quedó fail-closed y por ello el shell no entró.

## Runtime 10

Run `31652523820`, job `94299776053`, artifact `9163167746`, digest `sha256:be83f65bf5484858fa42844ede9f56f0952bcef06a775fd4244524cc5880799f`.

PASS:
- preflight v4 completo antes de provider;
- `bash -n`, no heredoc anidado, keyboard submit y binding del formulario canónico;
- Google Cloud DEV + selector Staff `coordinador`;
- Hosting DEV físico 1/1;
- remote parity exact=true;
- login submitido;
- contexto `coordinador / staff / tya / cinepolis`;
- HR authority: **15 periodos / 660 visitas / 211 shoppers**, `2025-06 → 2026-08`, duplicados=0.

FAIL final:
- `membershipVerified=false` y `membershipSource=null`;
- handoff `blocked`;
- stale `backendEmpty/corte4Empty=true`;
- `appOn=false`, `loginHidden=false`.

Frontera causal demostrada: `C6_CANONICAL_MEMBERSHIP_RECONCILE_BLOCKED_POST_AUTHORITY__EXACT_SUBCODE_NOT_CAPTURED`.

El artifact no incluye todavía el error/code exacto de membership; no atribuir el fallo a un campo/regla específica sin esa evidencia.

## Frontend / Claude

- **Cero cambio a `/app/modules` o UI visual durante el cierre runtime 10.**
- No generar nueva candidata.
- Mantener el formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- No reintroducir overlays legacy Staff.
- El adapter C6 sigue siendo el único responsable técnico del handoff membership→authority→`CX.app.enter()`; no debe pintar directamente la UI.
- No reabrir Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- `app/modules/cliente-extra.js` y sus pendientes heredados siguen separados; no bloquearon runtime 10.

## Seguridad

Runtime 10: Hosting `1/1` físicamente consumido; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; segundo intento=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 10=+0%.**

## Siguiente acción exacta

No hacer otro Hosting a ciegas. Primero source-only/cero provider: capturar de forma sanitizada `frontendHandoff.error`, wiring `status/code` y membershipVerified de contexto/sesión para identificar el subcódigo exacto. Después corregir únicamente la causa probada y volver al one-shot. M8 → M9 → M10 esperan M7 PASS.

## Academia

Sin cambio de contenido funcional todavía. Tras M7 PASS, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, continuidad de sesión y estados de acceso; no documentar mecanismos QA internos.
