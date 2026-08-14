# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 18:42 -06:00
**Estado:** `P0_SHOPPER_CANONICAL_AUTH_HR_HANDOFF_DEPLOYED_DEV_PASS__HUMAN_ACCEPTANCE_PENDING`

## Bloque P0 2026-08-13 — reparación y deploy DEV cerrados

La prueba humana real encontró que Shopper autenticaba pero podía quedar temporalmente en Firestore y luego `Mi Perfil` declaraba que la identidad no estaba vinculada al read model canónico.

### Causa raíz reproducible

`app/adapters/tya-canonical-shopper-portal-v2.js` consultaba `window.CX_BACKEND_AUTH?.currentContext?.()`, API inexistente en este runtime. La autoridad real publicada por `app/core/backend-browser-auth.js` es `CX.backendAuth.context()`. El portal podía interpretar que HR ya no estaba pendiente cuando la composición Auth → Firestore protegido → HR viva todavía no había finalizado.

El panel `app/core/backend-preview-status.js` tampoco escuchaba el evento final `cx:protected-auth-hr-authority-ready` y llamaba `Proyectos` a registros que, en la composición histórica, representan periodos. Esto generó el alarmante pero incorrecto `14 proyectos`.

### Archivos/contratos corregidos

- `app/adapters/tya-canonical-shopper-portal-v2.js`: Auth canónico, espera HR, reconcile read-only y rerender final.
- `app/core/backend-preview-status.js`: proyecto y periodos separados, Firestore identificado como slice transitorio, actualización por handoff HR.
- `tools/qa/cxorbia-p0-shopper-hr-authority-source-gate.mjs`: gate source-only independiente.
- `tools/qa/tya-phase-a-visual-smoke.mjs`: bloqueo de regresiones del handoff Auth/HR.
- `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`: evidencia source PASS.
- `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json`: evidencia deploy/runtime PASS.

### Resultado source

`CXOrbia Phase A Visual Smoke` run `31749008509`: SUCCESS. `p0ShopperAuthorityHandoffSource.pass=true`, 13/13 checks PASS, `p0ShopperExactIdentity.pass=true`, `hardFails=[]`, cero proveedor/writes/deploy.

### Resultado deploy DEV

Commit disparador `9624171d1df9f9d0eb9ac2ab72120c9347c9033e` modificó únicamente `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`, apuntando al target `ee8ac4d5b450aa615109e1d97d77f3acaa9f9abc`.

Workflow `CXOrbia C6 DEV Root Entrypoint Hosting` run `31758046539`, job `94638091029`: SUCCESS.

- Hosting target: `cxorbia-dev` / site `cxorbia-backend-dev`.
- Deploys este run: exactamente 1.
- Segundo deploy automático: 0.
- Paridad remota: PASS, root 302 a `/index-backend-dev.html`, contenido canónico exacto.
- Runtime Staff/Admin read-only: PASS, 15 periodos, 660 visitas, último periodo 2026-08, membership verificada, reloads y nueva pestaña estables.
- Artifact `9203525557`, digest `sha256:e17b2b6060e32a9d5d464ad42729421df1d43a44ef718f6a73faae52f3c2959a`.

## Qué se preservó

No se reabrieron ni recrearon identidades Shopper; no se reimportó HR. Cinépolis sigue siendo un único proyecto configurable. M1–M10 siguen como 100% técnico DEV, no como aprobación funcional humana.

## Seguridad

1 Hosting deploy DEV consumido bajo la autorización vigente. Cero Cloud Run deploys, Auth/Firestore/HR/Rules/Storage writes, password changes/resets, Make/Gemini/pagos, merge, producción o dominio oficial. Credenciales/tokens no expuestos.

## Clasificación

- **Reusable CXOrbia:** Firestore del principal es transitorio; HR final debe completar el handoff antes de aceptar el contexto operacional.
- **Exclusivo cliente:** identidad e histórico TyA/Cinépolis.
- **Claude/prototipo:** no rediseñar módulos; mantener Proyecto/Periodo separados.
- **Academia:** revalidar acceso por rol sobre el build desplegado.
- **Sin impacto Claude:** CI, evidencia de deploy y seguridad.

## Siguiente bloque exacto

Aceptación humana post-deploy con Shopper real; después regresión dirigida Admin/Operaciones, Cliente y Academia sobre el mismo build. Producción continúa bloqueada hasta cerrar aceptación.