# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Auth legacy import:91/91 PASS; no repetir, no resetear passwords.
- Corte6 previo: claims5/5 + Rules PASS.
- No nueva candidata, rama, PR, Firebase o Hosting por rutina.

## 2. Auth backend preservado
Firebase Auth continúa como autoridad. Se preservan:
- namespaces `staff` / `shopper`;
- email/provider interno determinístico y no visible;
- claims tenant/project/role/namespace/shopperId;
- no password/token/UID persistido;
- exact import91/readback91/91;
- shopper88 + super1 + coordinador2;
- reset/delete/overwrite0.

## 3. P0 visual reproducible — corregir focalizadamente
La visual humana de Paula del Hosting DEV **NO fue aprobada**.

Hecho reproducible:
- aparece un overlay separado `Acceso seguro` con `Tipo de acceso + Usuario + Contraseña` antes del login normal del proyecto;
- el flujo habitual llegaba directamente al login del tenant/proyecto;
- el gate puede mostrar un error genérico y añade una segunda capa de acceso.

Causa raíz comprobada:
1. `app/core/backend-browser-auth.js` crea el overlay full-screen;
2. reemplaza `CX.app.showLogin()` en preview;
3. limpia `CX.session` en carga y fuerza `ensureOverlay()`;
4. `backend-config-preview-dev.js` fija `interactive-session` y sin fallback;
5. `backend-firebase.js` exige `ensurePreviewAuth()` antes de cargar datos;
6. el login normal sigue existiendo en `app/app.js`.

Esto es un desvío: **Firebase debía quedar detrás del adapter, no convertirse en un segundo login visible.**

Documento: `app/docs/CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

## 4. Tarea Claude/prototipo — única y focalizada
**No nueva candidata general. No rediseñar la plataforma. No tocar módulos no relacionados.**

Objetivo:
- un solo flujo de acceso visible;
- conservar el login normal tenant-aware;
- si se requieren credenciales reales, incorporarlas en el mismo acceso del producto, no en un gate previo separado;
- Firebase Auth/claims permanecen detrás del adapter;
- una sesión Firebase válida debe restaurarse silenciosamente;
- no limpiar la sesión por rutina al cargar;
- no exponer email/provider técnico;
- no pedir a Paula doble autenticación;
- distinguir error de credencial vs scope/namespace sin revelar datos sensibles.

Validación esperada:
1. abrir DEV;
2. no aparece `Acceso seguro` como pantalla previa separada;
3. se muestra un único acceso TyA/CXOrbia;
4. autenticación real resuelve rol/alcance una sola vez;
5. refresh con sesión válida no vuelve a pedir credenciales;
6. logout sí invalida la sesión y vuelve al único login.

## 5. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No mezclar estos pendientes con el P0 de login.

## 6. Siguiente gate
`CORRECCIÓN FOCAL SINGLE-LOGIN → GATES → AUTORIZACIÓN DE REDEPLOY DEV SOLO SI PASS → SMOKE REMOTO → VISUAL PAULA → FREEZE CORTE6`.

Después: `refresh HR → resolver Agosto HN → materializar solo delta agosto → preprod/cutover`.

## 7. Academia/manuales
Documentar un único flujo de acceso visible. Firebase/provider es interno; enseñar recuperación/cambio, scopes, namespace interno, shopperId exacto, dedupe seguro y troubleshooting sin doble login.

## 8. Estado seguro
PR #7 draft/open/no merge. Auth91/readback91 preservado. Desde el hallazgo P0: Auth writes0; Firestore writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false.
