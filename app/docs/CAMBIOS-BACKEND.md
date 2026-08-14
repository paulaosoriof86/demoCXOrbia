# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 19:07 -06:00
**Estado:** `P0_SHOPPER_POSTDEPLOY_FORENSIC_ROOTCAUSE_PROVEN__NO_REPAIR_OR_REDEPLOY_YET`

## Bloque 2026-08-13 — auditoría forense post-deploy

La aceptación humana del build desplegado por run `31758046539` volvió a fallar. El fix previo corrigió un defecto real de temporización/API y mejoró el diagnóstico, pero **no era la causa raíz completa**.

### Evidencia nueva

- Firestore transitorio encuentra el Shopper autenticado y muestra perfil/país, pero 0 visitas.
- HR viva termina correctamente en 15 periodos / 660 visitas / agosto 2026.
- Después del handoff HR la identidad desaparece del read model y el país queda sin asignar.
- El login canónico todavía muestra antes de Auth el snapshot viejo 616/210/42 de julio.

Evidencia durable: `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`.

## Causa raíz P0-A — contrato de identidad dividido

La activación Auth v4 usa un universo técnico amplio:

`shopperId · legacyShopperId · legacyId · externalShopperId · externalId · sourceId · sourceKey · hrRowId · personId · profileId · shopperDocId`

y fija el claim `shopperId` al id del documento de perfil Firestore. Run de activación `31423272374`: PASS, 118 creates + 9 updates, 228 Auth users finales, 0 Firestore writes.

El compositor runtime `app/adapters/tya-cumulative-read-model-v2.js` reconstruye HR→perfil con un conjunto menor de aliases. `identityMap` solo contiene los live HR ids que pueden resolverse exactamente con ese conjunto o por relación exacta de visita. Los perfiles protegidos significativos que no entran al crosswalk se clasifican `no_exact_hr_crosswalk` y se excluyen de la lista operacional.

Esto crea el fallo observado: `backend-firebase.js` sí puede leer `tenants/tya/shoppers/{claim.shopperId}` y mostrar el perfil transitorio, pero al llegar HR el mismo perfil desaparece si su id Firestore no tiene un alias runtime exacto hacia el live HR shopper.

## Causa raíz P0-B — el crosswalk de activación Auth no fue materializado para runtime

El bridge full-profile del 31-jul dejó:
- 120 perfiles exactos;
- 31 identity holds;
- `technicalBridgeResolved=0`;
- `authBridgeResolved=0`;
- `identityLinksPlanned=0`.

El write Firestore posterior actualizó 120 documentos exactos y mantuvo 31 holds. La activación Auth posterior resolvió un universo mayor reconstruyendo llaves técnicas desde HR/visitas/certificaciones/liquidaciones, pero fue Auth-only. Por diseño no persistió ese crosswalk ampliado en Firestore. De ahí la incompatibilidad entre el principal activado y el compositor del navegador.

## Causa raíz P0-C — bootstrap source-safe viejo dentro del entrypoint humano

`app/index-backend-dev.html` carga antes de Auth:
1. `data/tya-hr-source-safe-periods.js` — payload empaquetado generado `2026-07-13`;
2. `core/tya-phase-a-source-safe-preview.js` — activo automáticamente en `cxorbia-backend-dev.web.app` y escritor de `CX.data`.

Por eso el login humano puede presentar 616 visitas y julio 2026 antes de que la HR viva autenticada reemplace ese estado. El snapshot source-safe debe quedar para laboratorio/preview explícito, no como semilla del runtime humano canónico.

## Por qué el gate anterior dio PASS

`tools/qa/cxorbia-p0-shopper-hr-authority-source-gate.mjs` verifica forma del código: API Auth correcta, espera HR, evento final y rótulos. `tools/qa/tya-phase-a-visual-smoke.mjs` usa `CX.app.selectRole(...)` en el smoke de roles y prueba identidad con un fixture sintético. Ninguno comparaba `TECH_KEYS` de activación Auth contra `exactAliases` del runtime ni realizaba Auth Firebase Shopper real → Firestore → HR → histórico.

Ese gate fue insuficiente y no debe volver a usarse como prueba de cierre del P0 humano.

## Seguridad y cierre del deploy consumido

- Deploy DEV consumido: exactamente 1, run `31758046539`.
- Marcador one-shot neutralizado: `enabled=false`, `consumed=true`, `hostingDeployExecutions=1`.
- Run de neutralización `31759552694`: SUCCESS; pasos de proveedor/deploy omitidos.
- Desde la aceptación humana fallida: 0 provider reads/writes, 0 Auth/Firestore/HR/Rules/Storage writes, 0 deploy adicional, 0 Make/Gemini/pagos, 0 merge, 0 producción.

## Clasificación

- **Reusable CXOrbia:** un único contrato técnico de identidad debe ser compartido por migración, Auth, perfil protegido y runtime; un tenant no puede definir un crosswalk diferente en cada capa.
- **Exclusivo cliente:** datos HR, 340 perfiles y su crosswalk concreto.
- **Claude/prototipo:** no rediseñar módulos. El frontend canónico debe recibir una identidad ya resuelta; el snapshot source-safe empaquetado queda fuera del entrypoint humano.
- **Academia:** no revalidar funcionalmente hasta que la identidad canónica Shopper sea estable; certificaciones/histórico dependen del mismo crosswalk.
- **Sin impacto Claude:** neutralización del request, evidencia y gates backend.

## Siguiente bloque exacto

Preparar source-only la reparación genérica del contrato de identidad y el gate E2E real. **Cero deploy y cero proveedor** hasta probar que el mismo conjunto de llaves técnicas gobierna Auth y runtime y que el entrypoint humano no adopta el snapshot estático pre-auth.
