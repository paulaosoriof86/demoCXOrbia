# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- Corte1 /2A /3: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406 data writes/readback; no repetir.
- Corte5: CX.data project/period resuelto y re-smoke PASS.
- Auth legacy import91/readback91/91 PASS; no repetir/resetear.
- Corte6 previo: claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 ACTIVO — doble login Auth visible
La corrección anterior resolvió el problema de `Correo + Contraseña` como identificador visible, pero introdujo otro P0: un **gate backend separado** antes del login normal.

Visual reproducida por Paula:
- pantalla previa `Acceso seguro`;
- `Tipo de acceso + Usuario + Contraseña`;
- error genérico posible;
- después sigue existiendo el login normal del proyecto.

Causa raíz localizada:
- `app/core/backend-browser-auth.js` crea y fuerza el overlay;
- intercepta `CX.app.showLogin()`;
- limpia la sesión al cargar;
- `backend-config-preview-dev.js` exige auth interactiva;
- `backend-firebase.js` llama auth antes del backend;
- `app/app.js` mantiene el login normal.

Documento: `app/docs/CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

## 3. Corrección requerida
Debe quedar **un solo flujo visible**:
1. Firebase Auth/claims detrás del adapter.
2. Sin pantalla backend previa separada.
3. Sesión Firebase válida restaurada silenciosamente.
4. Credenciales reales, si son necesarias, dentro del mismo acceso normal del producto.
5. No limpiar sesión por rutina en cada carga.
6. No exponer email/provider técnico.
7. Logout invalida sesión; refresh normal no exige reautenticación innecesaria.
8. Error de credencial y error de scope/namespace deben distinguirse de forma segura.

Paula no debe repetir la prueba actual, compartir password ni ejecutar PowerShell.

## 4. Claude — intervención actual
**Sí existe ahora un P0 frontend reproducible y localizado.**

No crear nueva candidata general ni rediseñar módulos. La tarea es exclusivamente reconciliar el acceso normal con Auth real para eliminar el doble login. El patrón reusable sigue siendo identidad provider detrás del login del producto.

## 5. Provider/backend preservado
- imported91;
- readback91/91;
- Auth17→108;
- shopper88 + staff3;
- reset/delete/overwrite0;
- namespaces staff/shopper preservados;
- no volver a importar ni tocar hashes.

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
Un único acceso visible; Auth detrás del adapter; namespace interno; tenant/proyecto; shopperId exacto; mínimo privilegio; recuperación/cambio; dedupe seguro y troubleshooting.

## 10. Estado seguro
PR #7 draft/open/no merge. Auth91/readback91 preservado. Desde el P0 visual: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false.
