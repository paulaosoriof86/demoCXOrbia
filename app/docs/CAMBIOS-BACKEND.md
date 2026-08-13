# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 12:38 -06:00
**Estado:** `P0_HUMAN_SHOPPER_CANONICAL_BINDING_FAILURE__OWNER_ACCEPTANCE_REJECTED__REAL_TYA_CUTOVER_BLOCKED`

## P0 comprobado 2026-08-13 — Shopper humano autenticado sin contexto operativo canónico

La validación humana de Paula rechazó el pre-go-live. Con un perfil Shopper real, Firebase Auth permite entrar y renderiza la navegación Shopper, pero `Mi Perfil` muestra exactamente: `La identidad de esta sesión no está vinculada al read model canónico.` El runtime visible posterior al login permanece en `Fuente: firestore`, con `Projects: 1`, `Visitas: 0`, `Shoppers: 1`, `Postulaciones: 0` y sin país asignado.

Esto contradice el contrato Phase A: tras autenticar, HR viva debe seguir siendo autoridad operacional y Firestore solo un overlay exacto de identidad/perfil/certificación. El laboratorio read-only, en la misma sesión de aceptación, sí leyó 15 períodos, 660 visitas y 211 shoppers desde HR viva. Por tanto, el problema no es ausencia general de HR: el P0 está en la ruta autenticada Shopper / composición de identidad y autoridad.

Evidencia durable: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

### Diagnóstico source-only ya aislado

- `app/adapters/tya-canonical-shopper-portal-v2.js` bloquea deliberadamente `Mi Perfil` cuando el `shopperId` de sesión no resuelve contra `CX.data.__identityMap` / shopper canónico.
- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` debería, para un principal autenticado TyA/Cinépolis, reemplazar el slice Firestore-only por HR viva completa + overlay Firestore exacto. Esa composición no fue efectiva en la sesión humana observada.
- M10 fue un smoke final con Admin canónico; no certificó este perfil Shopper humano concreto.
- Existe antecedente técnico de colisiones de identidad Shopper: el audit histórico `HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION` probó 64 grupos de identidades activas distintas que compartían login visible y afectaban 141 identidades. La corrección actual no puede adivinar por nombre.
- El `0` de disponibles del laboratorio no se acepta todavía como conteo canónico porque la superficie visible usa un subconjunto literal de estados; debe verificarse mediante la semántica canónica antes de aprobarlo.

### Estado de seguridad

No se modificó código funcional por este hallazgo. No se ejecutaron Auth/Firestore/HR/Rules/Storage writes, Cloud Run, Make, Gemini, pagos, merge ni cutover real. El P0 se documentó antes de cualquier reparación.

## Bloque anterior — laboratorio visible pre-go-live

Se creó `app/dev-validation/index.html` y se publicó exclusivamente en `cxorbia-backend-dev`. Workflow `CXOrbia C6 DEV Root Entrypoint Hosting`: run `31730303749`, job `94548821932`, `SUCCESS`; artifact `9192996410`, digest `sha256:1302982ffc68e2d9aedf39dafdce0514d70a0f11e362ab3cc5b731c98dab9474`.

M1–M10 continúan como evidencia de calificación técnica DEV del build `ecc725866acc3eb8`; ya no pueden interpretarse como aprobación funcional de Shopper ni como autorización de cutover.

## Siguiente bloque exacto

Gate focal P0 read-only sobre el principal Shopper humano y el handoff Staff existente: recuperar claims/shopperId/membership efectivos, comprobar su enlace exacto al read model/HR canónico, capturar por qué el bridge queda en Firestore-only y recuperar únicamente el usuario visible del Admin canónico alias B (nunca contraseña). Con esa evidencia se define una única reparación mínima y reproducible antes de cualquier nuevo deploy DEV.

## Clasificación

- **Reusable CXOrbia:** gate humano por rol debe certificar composición post-auth, no solo disponibilidad de assets.
- **Exclusivo cliente:** identidad Shopper TyA/Cinépolis, HR viva, visitas y país.
- **Claude/prototipo:** P0 documentado; cualquier reparación frontend se limita al archivo/adaptador causal, sin rediseño.
- **Academia:** acceso Shopper no puede darse por aprobado mientras el principal no resuelva al contexto canónico.
- **Sin impacto Claude:** documentación y evidencia del P0.
