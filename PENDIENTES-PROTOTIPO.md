# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- Corte1 /2A /3: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406 data writes/readback; no repetir.
- Corte5: CX.data project/period resuelto y re-smoke PASS.
- Auth legacy import91/readback91/91 PASS; no repetir/resetear.
- Corte6 previo: claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 doble login — FIX APLICADO EN RAMA
La visual de Paula demostró el P0 del gate backend separado `Acceso seguro`. Ese build DEV sigue siendo el publicado actualmente y permanece **NO APROBADO** hasta redeploy + nueva visual.

La corrección focalizada ya está aplicada en la rama viva:
- eliminado el overlay backend separado;
- login normal del tenant/proyecto conservado como único acceso visible;
- credenciales reales integradas en la misma tarjeta de acceso cuando correspondan;
- sesión Firebase válida restaurable silenciosamente;
- no limpieza de sesión por rutina;
- logout invalida Auth y sesión;
- provider/email técnico no visible;
- errores de credencial y scope/namespace diferenciados sin filtrar datos.

## 3. Gate técnico PASS
Se ejecutó revalidación estática sin provider writes sobre commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26`.

Estado GitHub: `success` — `PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

El gate comprueba:
1. sintaxis de `backend-browser-auth.js` y config;
2. presencia de `cxIntegratedAuthStep`, Auth real, restauración de sesión y persistence SESSION;
3. modo `product-login-session`;
4. ausencia de `cxBackendAuthGate`, `cxBackendAuthNamespace`, `cxBackendAuthLogin` y `interactive-session`;
5. el redeploy futuro sigue one-shot y fail-closed.

## 4. Pendiente bloqueante único de Corte6
**Autorizar y ejecutar un único redeploy del mismo Hosting DEV**, después smoke remoto automático y una sola validación visual de Paula.

No pedir a Paula que pruebe el Hosting actual: todavía contiene el build rechazado. No pedir password por chat ni PowerShell.

## 5. Claude — intervención actual
No requiere nueva candidata ni cambio adicional de frontend. El fix ya fue aplicado focalizadamente en el punto autorizado. Claude solo debe conservar el patrón reusable en futuras candidatas y no reintroducir un gate backend separado.

## 6. Provider/backend preservado
- imported91;
- readback91/91;
- Auth17→108;
- shopper88 + staff3;
- reset/delete/overwrite0;
- namespaces staff/shopper preservados;
- no volver a importar ni tocar hashes.

## 7. P1/P2 no bloqueante
- PDF/gráficas.
- Excel/formato.
- `reportKit`/exportaciones transversales.
- copy de fuentes/readiness.

## 8. HOLD identidad preservado
- 21 shopper credentials sin perfil canónico exacto.
- demo role1.
- ambiguous groups18/77 registros.

No resolver por nombre o coincidencia visual; revisión humana.

## 9. Agosto
- Fuente materializada hasta julio.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 10. Academia/manuales
Un único acceso visible; Auth detrás del adapter; namespace interno; tenant/proyecto; shopperId exacto; mínimo privilegio; recuperación/cambio; dedupe seguro y troubleshooting.

## 11. Estado seguro
PR #7 draft/open/no merge. Auth91/readback91 preservado. Corrección P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false.
