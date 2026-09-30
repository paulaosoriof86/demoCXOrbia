# ADDENDUM CAMBIOS-BACKEND — C6 Runtime 11

Fecha: 2026-08-12
Estado: source repair aplicado; provider STOP_RETRY respetado; Phase A 88%.

## Archivos creados/modificados

- `tools/qa/cxorbia-c6-canonical-staff-admin-e2e-credential.mjs` — nuevo selector canónico `B=admin`, private handoff + derivación Exact Write V2, sin bundle legacy ni password guessing.
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` — enruta acción Staff al selector canónico y conserva Shopper/Cliente genérico.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` — exige alias B/admin, private handoff, ausencia de bundle legacy y, después de runtime 11, exige republicación de membership después de `CX.app.enter()`.
- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` — después de `CX.app.enter()`, republica mediante cache la membership ya verificada para sobrevivir el `applyCxSession(currentContext)` del wrapper de Auth; fail-closed si la metadata vuelve a perderse.
- `backend/config/corte6-dev-root-entrypoint-hosting-execute.json` — runtime 11 one-shot y luego source-only preflight post-repair.
- `app/docs/evidence/c6-live-user-admin-runtime-proof-31657144378.json` — evidencia durable runtime 11 + reparación.
- índice, checkpoint y tracker vivos — actualizados.

## Qué cambió y por qué

Runtime 11 demostró dos hechos consecutivos:

1. La ruta anterior de credenciales era incorrecta porque podía seleccionar Staff legacy distinto de A/B/C/D. Esto se corrigió y runtime 11 sí ejecutó exactamente `B=admin` canónico.
2. B/admin pasó Auth, contexto, membership/handoff, HR y shell, pero el wrapper existente de `backend-browser-auth.js` reejecutó `applyCxSession(currentContext)` dentro de `CX.app.enter()`, limpiando `CX.session.user.membershipVerified` y `membershipSource` después del PASS canónico.

La reparación se hizo únicamente en el adapter backend C6; no se modificó `/app/core` ni `/app/modules`.

## Gates y resultados

- Runtime 11 run `31657144378`: Hosting 1/1, remote parity PASS, B/admin PASS, HR 15/660/211 PASS, shell visible PASS, STOP_RETRY por pérdida post-enter de metadata de membership.
- Source-only post-repair run `31657552661`: `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`; provider/Hosting skipped.

## Seguridad

Runtime 11 y reparación posterior: nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; segundo provider runtime=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Clasificación

- Reusable CXOrbia: autorización/membership persistente debe sobrevivir rehidrataciones de sesión.
- Exclusivo cliente: principal TyA B/admin en DEV.
- Claude/prototipo: sin cambios UI.
- Academia: sin cambio de contenido hasta M7 PASS.
- Sin impacto Claude: QA/adapters/evidencia.
