# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_SINGLE_LOGIN_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Auth legacy import91/readback91/91 PASS; no repetir ni resetear passwords.
- Corte6 claims5/5 + Rules PASS.
- No nueva candidata, rama, PR, Firebase o Hosting por rutina.

## 2. P0 doble login — corregido y publicado en DEV
La visual humana de Paula rechazó el build anterior porque mostraba `Acceso seguro` como gate separado antes del login normal.

La corrección focalizada ya está en el mismo Hosting DEV:
- único login visible TyA/CXOrbia;
- Auth real detrás del producto;
- `Usuario + Contraseña` dentro de la misma tarjeta cuando no existe sesión restaurable;
- sesión Firebase válida restaurada silenciosamente;
- logout invalida Firebase + CX session;
- `product-login-session`;
- gate paralelo antiguo bloqueado por checks anti-regresión.

## 3. Redeploy autorizado — PASS
Autorización de Paula consumida: un único redeploy focalizado sobre `cxorbia-backend-dev/cxorbia-dev`.

Resultado: `PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED`.

- versión `sites/cxorbia-backend-dev/versions/a4b90bd224b28329`;
- release `sites/cxorbia-backend-dev/releases/1785448336285000`;
- browserAuth remoto PASS;
- entrypoint PASS;
- proof PASS;
- username/password namespaced PASS;
- `singleVisibleLogin=true`;
- `parallelAuthGate=false`;
- preservedLegacyAuthUsers91.

Seguridad: Auth writes0, Firestore data writes0, Rules0, nuevo Firebase/Hosting0, Storage0, HR0, legacy0, pagos0, Functions0, Make/Gemini0, merge=false, producción=false.

Evidencia: `app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json` y `app/docs/CORTE6-SINGLE-LOGIN-HOSTING-DEV-REMOTE-PASS-20260730.md`.

## 4. Claude/prototipo
**No nueva candidata general. No tocar `app/modules/*` por este tema.**

El P0 ya fue corregido focalizadamente en el punto autorizado de integración. Claude debe preservar como patrón reusable:
- un único acceso visible;
- provider/Auth detrás del producto;
- sesión restaurable;
- logout real;
- namespaces internos `staff/shopper`;
- error seguro de credencial vs scope/namespace;
- no reintroducir `cxBackendAuthGate`, `cxBackendAuthNamespace`, `cxBackendAuthLogin` ni `interactive-session`.

## 5. Gate vivo
Ahora corresponde **una única validación visual humana** del Hosting DEV publicado.

Validar:
1. no aparece `Acceso seguro` como pantalla separada;
2. aparece el login normal TyA/CXOrbia;
3. al seleccionar perfil habilitado, Usuario + Contraseña aparecen dentro del mismo acceso;
4. la autenticación entra una sola vez;
5. refresh con sesión válida no repite login;
6. logout sí vuelve al único login.

Si la visual aprueba: `FREEZE CORTE6 → REFRESH HR → RESOLVER AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

## 6. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No mezclar estos pendientes con el gate visual de Corte6.

## 7. HOLD preservado
- 21 shopper credentials sin perfil canónico exacto;
- demo role1;
- ambiguous groups18/77 registros.

No resolver por nombre/coincidencia visual.

## 8. Academia/manuales
Sincronizado en `app/docs/ACADEMIA-IMPACTO-CORTE6-SINGLE-LOGIN-REMOTE-PASS-20260730.md`: acceso único, recuperación/cambio, scopes, sesión/refresh/logout, namespace interno, shopperId exacto y troubleshooting.

## 9. Estado seguro
PR #7 permanece draft/open/no merge. Producción `tya-plataforma` no fue tocada.
