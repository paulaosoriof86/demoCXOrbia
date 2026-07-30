# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_SINGLE_LOGIN_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- Corte1 /2A /3: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406 data writes/readback; no repetir.
- Corte5: CX.data project/period resuelto y re-smoke PASS.
- Auth legacy import91/readback91/91 PASS; no repetir/resetear.
- Corte6 claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 doble login — CORREGIDO Y PUBLICADO EN DEV
El build anterior fue rechazado por el gate separado `Acceso seguro`. El fix single-login ya fue publicado mediante un único redeploy autorizado al mismo Hosting DEV.

Resultado remoto: `PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED`.

- browserAuth PASS;
- entrypoint PASS;
- proof PASS;
- username/password namespaced PASS;
- `singleVisibleLogin=true`;
- `parallelAuthGate=false`;
- versión `sites/cxorbia-backend-dev/versions/a4b90bd224b28329`;
- release `sites/cxorbia-backend-dev/releases/1785448336285000`.

## 3. Pendiente bloqueante único de Corte6
**Validación visual humana del nuevo build DEV.**

Comprobar únicamente:
1. no aparece una pantalla previa `Acceso seguro`;
2. el login normal TyA/CXOrbia es el único punto visible;
3. Usuario + Contraseña aparecen dentro del mismo acceso cuando se selecciona un perfil habilitado;
4. no hay doble autenticación;
5. refresh con sesión válida no vuelve a pedir credenciales;
6. logout sí devuelve al único login.

No pedir a Paula PowerShell ni contraseña por chat.

## 4. Claude — intervención actual
No requiere nueva candidata ni cambio adicional de frontend. El fix ya fue aplicado y desplegado focalizadamente. Claude solo debe preservar el patrón reusable y no reintroducir el gate backend separado.

## 5. Provider/backend preservado
- imported91;
- readback91/91;
- Auth17→108;
- shopper88 + staff3;
- reset/delete/overwrite0;
- namespaces staff/shopper preservados;
- Auth writes durante el redeploy0;
- Firestore data writes0;
- Rules0;
- nuevo Firebase/Hosting0.

## 6. P1/P2 no bloqueante
- PDF/gráficas.
- Excel/formato.
- `reportKit`/exportaciones transversales.
- copy de fuentes/readiness.

## 7. HOLD identidad preservado
- 21 shopper credentials sin perfil canónico exacto.
- demo role1.
- ambiguous groups18/77 registros.

No resolver por nombre o coincidencia visual; revisión humana.

## 8. Agosto
- Fuente materializada hasta julio.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 9. Academia/manuales
Sincronizado: un único acceso visible; Auth detrás del adapter; namespace interno; tenant/proyecto; shopperId exacto; sesión/refresh/logout; recuperación/cambio y troubleshooting.

## 10. Estado seguro
PR #7 draft/open/no merge. Producción `tya-plataforma` no tocada. Redeploy focalizado DEV consumido1; Auth/Firestore/Rules/Storage/HR/legacy/payments/Functions/Make/Gemini writes adicionales0.
