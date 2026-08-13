# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 19:48 -06:00  
**Estado:** `C6_RUNTIME_12_PASS_M7__PHASE_A_93__NO_FRONTEND_MODULE_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real. Runtime 12 cerró además `M7=5/5`: la ruta canónica completa quedó probada con el principal Exact Write V2 `B=admin` desde Firebase Auth y membership hasta HR/frontend, incluyendo persistencia de sesión, tres reloads y nueva pestaña.

**Phase A certificado: 93% / restante: 7%.**

## Runtime 12 — PASS

Run `31658676280`, job `94318658180`, artifact `9165383310`, digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.

PASS: B/admin canónico; `exactWriteCanonical=true`; `legacyCredentialBundleUsed=false`; Hosting DEV 1/1; remote parity exact=true; Auth/contexto `admin / staff / tya / cinepolis`; membership `tenants/tya/users/self` verificada y preservada después de `CX.app.enter()`; datos runtime **15 periodos / 660 visitas / 197 shoppers**, `2025-06 → 2026-08`; frontend `entered`; primera carga + 3 reloads + new-tab PASS.

## Frontend / Claude

- **No se modificó `/app/modules` ni `/app/core` para cerrar Runtime 12.**
- No se requiere candidata frontend nueva por este gate.
- Mantener el formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- No reintroducir overlays legacy Staff ni credenciales técnicas visibles.
- Mantener la interfaz exacta de `CX.data`.
- No reabrir C6/M7 ni gates cerrados salvo drift reproducible.

## Seguridad

Runtime 12: Hosting `1/1`; segundo Hosting=0; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=93% | restante=7% | delta certificado Runtime 12=+5%.**

## Siguiente acción exacta

Continuar con M8 → M9 → M10 sin nueva auditoría general. La definición exacta de esos milestones debe recuperarse de las fuentes vigentes antes de pedir o aplicar cambios; no inferirla desde frontend ni reabrir C6.

## Academia

La cadena real `Auth → membership/RBAC → backend/HR → frontend` ya puede documentarse como certificada en DEV para Staff. Manuales/cursos deben describir el formulario único, rutas por rol, permisos y continuidad de sesión; no documentar credenciales, private handoff ni mecanismos internos QA.
