# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 19:48 -06:00  
**Estado:** `C6_RUNTIME_12_PASS_M7__PHASE_A_93__NO_FRONTEND_MODULE_CHANGE`

## Estado vigente

Runtime 12 cerró `M7=5/5` con el principal canónico Exact Write V2 `B=admin`: Firebase Auth → membership/RBAC → backend/HR → frontend, con membership persistida después de `CX.app.enter()`, primera carga, 3 reloads y new-tab PASS.

**Phase A=93% certificado / 7% restante.**

## Evidencia

Run `31658676280`, job `94318658180`, artifact `9165383310`, digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.

- `B=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`.
- Hosting DEV 1/1; remote parity exact=true.
- Contexto `admin/staff/tya/cinepolis`.
- Membership `tenants/tya/users/self` persistida.
- 15 periodos / 660 visitas / 197 shoppers, `2025-06 → 2026-08`.
- Frontend `entered`; primera carga + 3 reloads + new-tab PASS.

## Frontend / Claude

- Cero cambios a `/app/modules` o `/app/core` para este cierre.
- Mantener formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Mantener interfaz exacta de `CX.data`.
- No reintroducir overlays/credenciales técnicas legacy.
- No crear candidata frontend por M7.

## Seguridad

Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Hosting=0; segundo Exact Write=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

## Siguiente acción

M8 → M9 → M10. No reabrir C6/gates cerrados. La definición exacta de cada milestone se recupera de fuentes vigentes; no se infiere desde frontend.

## Academia

Ya puede documentarse el flujo Staff real y continuidad de sesión; no documentar private handoff, credenciales ni QA interno.
