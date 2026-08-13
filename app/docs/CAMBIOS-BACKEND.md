# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 16:15 -06:00
**Estado:** `P0_SHOPPER_CANONICAL_AUTH_HR_HANDOFF_SOURCE_PASS__DEV_REDEPLOY_PENDING`

## Bloque P0 2026-08-13 — reparación source-only cerrada

La prueba humana real encontró que Shopper autenticaba pero quedaba temporalmente en Firestore (`1 proyecto / 0 visitas / 1 shopper / 0 postulaciones`) y luego `Mi Perfil` declaraba que la identidad no estaba vinculada al read model canónico.

### Causa raíz reproducible

`app/adapters/tya-canonical-shopper-portal-v2.js` consultaba `window.CX_BACKEND_AUTH?.currentContext?.()`, API inexistente en este runtime. La autoridad real publicada por `app/core/backend-browser-auth.js` es `CX.backendAuth.context()`. Por ello el portal podía interpretar que HR ya no estaba pendiente cuando la composición Auth → Firestore protegido → HR viva todavía no había finalizado.

El panel `app/core/backend-preview-status.js` tampoco escuchaba el evento final `cx:protected-auth-hr-authority-ready` y llamaba `Proyectos` a registros que, en la composición histórica, representan periodos. Esto generó el alarmante pero incorrecto `14 proyectos`.

### Archivos tocados

- `app/adapters/tya-canonical-shopper-portal-v2.js` — commit `2da1a1571a253d2868325ee55374e0948b573ea1`: Auth canónico, espera HR, reconcile read-only y rerender final.
- `app/core/backend-preview-status.js` — commit `bb6dae78e8fb79ce1995010368ceaf342e0a71e3`: proyecto y periodos separados, Firestore identificado como slice transitorio, actualización por handoff HR.
- `tools/qa/cxorbia-p0-shopper-hr-authority-source-gate.mjs` — commit `adeda3a70907706ef5e709c18c4bc0686833ec98`: gate source-only independiente.
- `tools/qa/tya-phase-a-visual-smoke.mjs` — commit `23a708c27ef4abc4ef93d2a027f3dfd7c40b4ee8`: el gate existente ahora bloquea regresiones del handoff Auth/HR.
- `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json` — evidencia durable del PASS.

### Resultado reproducible

`CXOrbia Phase A Visual Smoke` run `31749008509` terminó `SUCCESS` sobre `23a708c27ef4abc4ef93d2a027f3dfd7c40b4ee8`. Artifact `9200168093`, digest `sha256:cffb33d875f190b8b30e906932b9f44458ddccb5d394ba5b742913ddeb03c1ca`.

- `p0ShopperAuthorityHandoffSource.pass=true`.
- 13/13 checks del handoff canónico en PASS.
- `p0ShopperExactIdentity.pass=true`.
- `hardFails=[]`.
- Cero proveedor, escrituras, deploy o producción.

La advertencia restante del smoke (`custom_role_visible_nav_items:1`) pertenece al smoke demo estructural heredado y no invalida este P0 source-only. Ese smoke demo ya no se acepta como certificación de Firebase humano.

## Qué se preservó

No se reabrieron ni recrearon identidades Shopper; no se reimportó HR. Cinépolis sigue siendo un único proyecto configurable. La HR canónica certificada conserva 15 periodos / 660 visitas hasta agosto 2026. M1–M10 siguen como 100% técnico DEV, no como aprobación funcional humana.

## Seguridad

Cero Auth/Firestore/HR/Rules/Storage writes, cero provider reads en este bloque, cero deploy, Make/Gemini/pagos, merge o producción.

## Clasificación

- **Reusable CXOrbia:** Firestore del principal es transitorio; HR final debe completar el handoff antes de aceptar el contexto operacional.
- **Exclusivo cliente:** identidad e histórico TyA/Cinépolis.
- **Claude/prototipo:** no rediseñar módulos; corregido solo adapter/diagnóstico. No llamar proyectos a los periodos.
- **Academia:** revalidar acceso por rol después del próximo deploy DEV.
- **Sin impacto Claude:** CI, evidencia y seguridad.

## Siguiente bloque exacto

Deploy único del HEAD vigente al Hosting DEV `cxorbia-backend-dev`, luego validación remota read-only y aceptación humana Shopper + Admin/Operaciones/Cliente/Academia. Requiere autorización específica porque el deploy DEV anterior ya fue consumido.
