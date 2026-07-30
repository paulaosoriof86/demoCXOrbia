# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Auth legacy import91/readback91/91 PASS; no repetir, no resetear passwords.
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

## 3. P0 doble login — corregido focalizadamente
La visual humana de Paula detectó correctamente que el build DEV previo mostraba un overlay separado `Acceso seguro` antes del login normal. Ese build quedó **NO APROBADO**.

La causa raíz ya fue corregida en la rama viva:
1. `app/core/backend-browser-auth.js` ya no crea `cxBackendAuthGate` ni reemplaza el producto por un login backend.
2. El login normal del tenant/proyecto es nuevamente el único acceso visible.
3. Cuando hace falta Auth real, `Usuario + Contraseña` se integra dentro de la misma tarjeta del producto.
4. Una sesión Firebase válida se restaura silenciosamente con persistencia de sesión.
5. No se limpia `CX.session` al cargar por rutina.
6. Logout sí cierra Firebase y CX session.
7. `backend-config-preview-dev.js` usa `product-login-session`, no `interactive-session`.
8. Los gates de Hosting bloquean explícitamente la reaparición de `cxBackendAuthGate`, `cxBackendAuthNamespace` y `cxBackendAuthLogin`.

Commits principales:
- `e95e8a9662373183ec17186831cf81b89094515a` — bridge single-login.
- `32aee807d4c48760679267e1f8cd577d4681f4ea` — config product-login-session.
- `f3aa90cc0f765beafdfa90e5b55d953239488746` — preflight Hosting single-login.
- `e0b98140744135361f0d1d000ce31435b7ea59d2` — workflow/gates anti-regresión.

## 4. Gate técnico actual
Se disparó una revalidación estática deliberadamente **sin reutilizar la autorización consumida y sin provider writes**.

Commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26` obtuvo estado GitHub `success`:
`cxorbia/corte6-credential-continuity-hosting/PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

Esto valida sintaxis y marcadores estructurales del single-login, pero **no equivale a deploy ni smoke remoto**. El Hosting DEV público sigue mostrando el build anterior hasta que Paula autorice un nuevo redeploy focalizado.

## 5. Claude/prototipo
**No nueva candidata general. No rediseñar la plataforma.**

El P0 quedó corregido en el punto autorizado de integración backend/entrada DEV. Claude no debe rehacer este fix ni tocar `app/modules/*` por este tema. Solo registrar como patrón reusable:
- un único acceso visible;
- provider/Auth detrás del producto;
- restauración silenciosa de sesión válida;
- logout real;
- errores seguros de credencial vs scope/namespace.

## 6. Validación visual esperada después del redeploy autorizado
1. abrir el DEV canónico;
2. no aparece `Acceso seguro` como pantalla previa separada;
3. aparece el login normal TyA/CXOrbia;
4. al seleccionar perfil habilitado, las credenciales se completan dentro del mismo login;
5. autenticación resuelve rol/alcance una sola vez;
6. refresh con sesión válida no vuelve a pedir credenciales;
7. logout sí vuelve al único login.

## 7. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No mezclar estos pendientes con Corte6.

## 8. Siguiente gate
`AUTORIZACIÓN DE UN ÚNICO REDEPLOY DEL MISMO HOSTING DEV → PRECHECK SINGLE-LOGIN → DEPLOY1 → SMOKE REMOTO → VISUAL PAULA → FREEZE CORTE6`.

Después: `refresh HR → resolver Agosto HN → materializar solo delta agosto → preprod/cutover`.

## 9. Academia/manuales
Documentar un único flujo de acceso visible. Firebase/provider es interno; enseñar recuperación/cambio, scopes, namespace interno, shopperId exacto, dedupe seguro y troubleshooting sin doble login.

## 10. Estado seguro
PR #7 draft/open/no merge. Auth91/readback91 preservado. Corrección P0 hasta este punto: Auth writes0; Firestore writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false.
